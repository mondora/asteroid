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
	if (this._set.contains(item._id)) {
		throw new Error("Item exists");
	}
	this._set.put(item._id, item);
	return Q(item._id);
};
Collection.prototype._remoteToLocalInsert = function (item) {
	this._set.put(item._id, item);
};
Collection.prototype._restoreInserted = function (id) {
	this._set.del(id);
};
Collection.prototype._localToRemoteInsert = function (item) {
	var self = this;
	var deferred = Q.defer();
	var methodName = "/" + self.name + "/insert";
	this.asteroid.ddp.method(methodName, [item], function (err, res) {
		if (err) {
			self._restoreInserted(item._id);
			deferred.reject(err);
		} else {
			deferred.resolve(item._id);
		}
	});
	return deferred.promise;
};
Collection.prototype.insert = function (item) {
	if (!item._id) {
		item._id = guid();
	}
	return {
		local: this._localToLocalInsert(item),
		remote: this._localToRemoteInsert(item)
	};
};



///////////////////////////////////////////////
// Remove-related private and public methods //
///////////////////////////////////////////////

Collection.prototype._localToLocalRemove = function (id) {
	var existing = this._set.get(id);
	this._set.put(id + mf_removal_suffix, existing);
	this._set.del(id);
	return Q(id);
};
Collection.prototype._remoteToLocalRemove = function (id) {
	this._set.del(id);
	this._set.del(id + mf_removal_suffix);
};
Collection.prototype._restoreRemoved = function (id) {
	var backup = this._set.get(id + mf_removal_suffix);
	this._set.put(id, backup);
	this._set.del(id + mf_removal_suffix);
};
Collection.prototype._localToRemoteRemove = function (id) {
	var self = this;
	var deferred = Q.defer();
	var methodName = "/" + self.name + "/remove";
	this.asteroid.ddp.method(methodName, [{_id: id}], function (err, res) {
		if (err) {
			self._restoreRemoved(id);
			deferred.reject(err);
		} else {
			deferred.resolve(id);
		}
	});
	return deferred.promise;
};
Collection.prototype.remove = function (id) {
	return {
		local: this._localToLocalRemove(id),
		remote: this._localToRemoteRemove(id)
	};
};



///////////////////////////////////////////////
// Update-related private and public methods //
///////////////////////////////////////////////

Collection.prototype._localToLocalUpdate = function (id, item) {
	var existing = this._set.get(id);
	if (!existing) {
		throw new Error("Item not present");
	}
	this._set.put(id + mf_update_suffix, existing);
	this._set.put(id, item);
	return Q(id);
};
Collection.prototype._remoteToLocalUpdate = function (id, fields) {
	var existing = this._set.get(id);
	if (!existing) {
		console.warn("Item not present");
		return;
	}
	for (var field in fields) {
		existing[field] = fields[field];
	}
	this._set.put(id, existing);
	this._set.del(id + mf_update_suffix);
};
Collection.prototype._restoreUpdated = function (id) {
	var backup = this._set.get(id + mf_update_suffix);
	this._set.put(id, backup);
	this._set.del(id + mf_update_suffix);
};
Collection.prototype._localToRemoteUpdate = function (id, item) {
	var self = this;
	var deferred = Q.defer();
	var methodName = "/" + self.name + "/update";
	var sel = {
		_id: id
	};
	var mod = {
		$set: item
	};
	this.asteroid.ddp.method(methodName, [sel, mod], function (err, res) {
		if (err) {
			self._restoreUpdated(id);
			deferred.reject(err);
		} else {
			deferred.resolve(id);
		}
	});
	return deferred.promise;
};
Collection.prototype.update = function (id, item) {
	return {
		local: this._localToLocalUpdate(id, item),
		remote: this._localToRemoteUpdate(id, item)
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
ReactiveQuery.prototype = Object.create(EventEmitter.prototype);
ReactiveQuery.constructor = ReactiveQuery;

ReactiveQuery.prototype._getResult = function () {
	this.result = this._set.toArray();
};

var getFilterFromSelector = function (selector) {
	// Return the filter function
	return function (id, item) {

		// Filter out backups
		if (is_backup(id)) {
			return false;
		}

		// Get the value of the object from a compund key
		// (e.g. "profile.name.first")
		var getItemVal = function (item, key) {
			return key.split(".").reduce(function (prev, curr) {
				prev = prev[curr];
				return prev;
			}, item);
		};

		// Iterate all the keys in the selector. The first that
		// doesn't match causes the item to be filtered out.
		var keys = Object.keys(selector);
		for (var i=0; i<keys.length; i++) {
			var itemVal = getItemVal(item, keys[i]);
			if (itemVal !== selector[keys[i]]) {
				return false;
			}
		}

		// At this point the item matches the selector
		return true;

	};
};

Collection.prototype.reactiveQuery = function (selectorOrFilter) {
	var filter;
	if (typeof selectorOrFilter === "function") {
		filter = selectorOrFilter;
	} else {
		filter = getFilterFromSelector(selectorOrFilter);
	}
	var subset = this._set(filter);
	return new ReactiveQuery(subset);
};
