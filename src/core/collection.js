///////////////////////////////////////////
// Removal and update suffix for backups //
///////////////////////////////////////////

var mf_removal_suffix = "__del__";
var mf_update_suffix = "__upd__";
var is_backup = function (id) {
	var l1 = mf_removal_suffix.length;
	var l2 = mf_update_suffix.length;
	var s1 = id.slice(-1 * l1);
	var s2 = id.slice(-1 * l2);
	return s1 === mf_removal_suffix || s2 === mf_update_suffix;
};



/////////////////////////////////////////////
// Collection class constructor definition //
/////////////////////////////////////////////

var Collection = function (name, asteroidRef) {
	this.name = name;
	this.asteroid = asteroidRef;
	this._set = new Set();
};
Collection.prototype.constructor = Collection;



///////////////////////////////////////////////
// Insert-related private and public methods //
///////////////////////////////////////////////

Collection.prototype._localToLocalInsert = function (item) {
	// If an item by that id already exists, raise an exception
	if (this._set.contains(item._id)) {
		throw new Error("Item " + item._id + " already exists");
	}
	this._set.put(item._id, item);
	// Return a promise, just for api consistency
	return Q(item._id);
};
Collection.prototype._remoteToLocalInsert = function (item) {
	// The server is the SSOT, add directly
	this._set.put(item._id, item);
};
Collection.prototype._localToRemoteInsert = function (item) {
	var self = this;
	var deferred = Q.defer();
	// Construct the name of the method we need to call
	var methodName = "/" + self.name + "/insert";
	self.asteroid.ddp.method(methodName, [item], function (err, res) {
		if (err) {
			// On error restore the database and reject the promise
			self._set.del(item._id);
			deferred.reject(err);
		} else {
			// Else resolve the promise
			deferred.resolve(item._id);
		}
	});
	return deferred.promise;
};
Collection.prototype.insert = function (item) {
	// If the time has no id, generate one for it
	if (!item._id) {
		item._id = Asteroid.utils.guid();
	}
	return {
		// Perform the local insert
		local: this._localToLocalInsert(item),
		// Send the insert request
		remote: this._localToRemoteInsert(item)
	};
};



///////////////////////////////////////////////
// Remove-related private and public methods //
///////////////////////////////////////////////

Collection.prototype._localToLocalRemove = function (id) {
	// Check if the item exists in the database
	var existing = this._set.get(id);
	if (existing) {
		// Create a backup of the object to delete
		this._set.put(id + mf_removal_suffix, existing);
		// Delete the object
		this._set.del(id);
	}
	// Return a promise, just for api consistency
	return Q(id);
};
Collection.prototype._remoteToLocalRemove = function (id) {
	// The server is the SSOT, remove directly (item and backup)
	this._set.del(id);
};
Collection.prototype._localToRemoteRemove = function (id) {
	var self = this;
	var deferred = Q.defer();
	// Construct the name of the method we need to call
	var methodName = "/" + self.name + "/remove";
	self.asteroid.ddp.method(methodName, [{_id: id}], function (err, res) {
		if (err) {
			// On error restore the database and reject the promise
			var backup = self._set.get(id + mf_removal_suffix);
			// Ensure there is a backup
			if (backup) {
				self._set.put(id, backup);
				self._set.del(id + mf_removal_suffix);
			}
			deferred.reject(err);
		} else {
			// Else, delete the (possible) backup and resolve the promise
			self._set.del(id + mf_removal_suffix);
			deferred.resolve(id);
		}
	});
	return deferred.promise;
};
Collection.prototype.remove = function (id) {
	return {
		// Perform the local remove
		local: this._localToLocalRemove(id),
		// Send the remove request
		remote: this._localToRemoteRemove(id)
	};
};



///////////////////////////////////////////////
// Update-related private and public methods //
///////////////////////////////////////////////

Collection.prototype._localToLocalUpdate = function (id, fields) {
	// Ensure the item actually exists
	var existing = this._set.get(id);
	if (!existing) {
		throw new Error("Item " + id + " doesn't exist");
	}
	// Ensure the _id property won't get modified
	if (fields._id && fields._id !== id) {
		throw new Error("Modifying the _id of a document is not allowed");
	}
	// Create a backup
	this._set.put(id + mf_update_suffix, existing);
	// Perform the update
	for (var field in fields) {
		if (fields.hasOwnProperty(field)) {
			existing[field] = fields[field];
		}
	}
	this._set.put(id, existing);
	// Return a promise, just for api consistency
	return Q(id);
};
Collection.prototype._remoteToLocalUpdate = function (id, fields) {
	// Ensure the item exixts in the database
	var existing = this._set.get(id);
	if (!existing) {
		console.warn("Server misbehaviour: item " + id + " doesn't exist");
		return;
	}
	for (var field in fields) {
		// Ensure the server is not trying to moify the item _id
		if (field === "_id" && fields._id !== id) {
			console.warn("Server misbehaviour: modifying the _id of a document is not allowed");
			return;
		}
		existing[field] = fields[field];
	}
	// Perform the update
	this._set.put(id, existing);
};
Collection.prototype._localToRemoteUpdate = function (id, fields) {
	var self = this;
	var deferred = Q.defer();
	// Construct the name of the method we need to call
	var methodName = "/" + self.name + "/update";
	// Construct the selector
	var sel = {
		_id: id
	};
	// Construct the modifier
	var mod = {
		$set: fields
	};
	self.asteroid.ddp.method(methodName, [sel, mod], function (err, res) {
		if (err) {
			// On error restore the database and reject the promise
			var backup = self._set.get(id + mf_update_suffix);
			self._set.put(id, backup);
			self._set.del(id + mf_update_suffix);
			deferred.reject(err);
		} else {
			// Else, delete the (possible) backup and resolve the promise
			self._set.del(id + mf_update_suffix);
			deferred.resolve(id);
		}
	});
	return deferred.promise;
};
Collection.prototype.update = function (id, fields) {
	return {
		// Perform the local update
		local: this._localToLocalUpdate(id, fields),
		// Send the update request
		remote: this._localToRemoteUpdate(id, fields)
	};
};



//////////////////////////////
// Reactive queries methods //
//////////////////////////////

var ReactiveQuery = function (set) {
	var self = this;
	self.result = [];

	self._set = set;
	self._getResult();

	self._set.on("put", function (id) {
		self._getResult();
		self._emit("change", id);
	});
	self._set.on("del", function (id) {
		self._getResult();
		self._emit("change", id);
	});

};
ReactiveQuery.prototype = Object.create(Asteroid.utils.EventEmitter.prototype);
ReactiveQuery.constructor = ReactiveQuery;

ReactiveQuery.prototype._getResult = function () {
	this.result = this._set.toArray();
};

Collection.prototype.reactiveQuery = function (selectorOrFilter) {
	var filter;
	if (typeof selectorOrFilter === "function") {
		filter = selectorOrFilter;
	} else {
		filter = Asteroid.utils.getFilterFromSelector(selectorOrFilter);
	}
	var subset = this._set.filter(filter);
	return new ReactiveQuery(subset);
};



Asteroid._Collection = Collection;
