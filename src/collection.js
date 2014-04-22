// Collection class constructor definition
var Collection = function (name, asteroidRef, DbConstructor) {
	this.name = name;
	this.asteroid = asteroidRef;
	this.db = new DbConstructor();
};
Collection.prototype = new EventEmitter();
Collection.prototype.constructor = Collection;



// Insert-related private and public methods
Collection.prototype._localToLocalInsert = function (item) {
	var existing = this.db.get(item._id);
	if (existing) {
		throw new Error("Item exists");
	}
	this.db.set(item._id, item);
	this._emit("insert", item._id);
};
Collection.prototype._remoteToLocalInsert = function (item) {
	var existing = this.db.get(item._id);
	if (isEqual(existing, item)) {
		return;
	}
	this.db.set(item._id, item);
	this._emit("insert", item._id);
};
Collection.prototype._restoreInserted = function (id) {
	this.db.del(id);
	this._emit("restore", id);
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
			deferred.resolve(res);
		}
	});
	return deferred.promise;
};
Collection.prototype.insert = function (item) {
	if (!item._id) {
		item._id = guid();
	}
	this._localToLocalInsert(item, false);
	return this._localToRemoteInsert(item);
};



// Remove-related private and public methods
var mf_removal_suffix = "__del__";
Collection.prototype._localToLocalRemove = function (id) {
	var existing = this.db.get(id);
	if (!existing) {
		console.warn("Item not present.");
		return;
	}
	this.db.set(id + mf_removal_suffix, existing);
	this.db.del(id);
	this._emit("remove", id);
};
Collection.prototype._remoteToLocalRemove = function (id) {
	var existing = this.db.get(id);
	if (!existing) {
		console.warn("Item not present.");
		return;
	}
	this.db.del(id);
	this.db.del(id + mf_removal_suffix);
	this._emit("remove", id);
};
Collection.prototype._restoreRemoved = function (id) {
	var backup = this.db.get(id + mf_removal_suffix);
	this.db.set(id, backup);
	this.db.del(id + mf_removal_suffix);
	this._emit("restore", id);
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
			deferred.resolve(res);
		}
	});
	return deferred.promise;
};
Collection.prototype.remove = function (id) {
	this._localToLocalRemove(id);
	return this._localToRemoteRemove(id);
};



// Update-related private and public methods
var mf_update_suffix = "__upd__";
Collection.prototype._localToLocalUpdate = function (id, item) {
	var existing = this.db.get(id);
	if (!existing) {
		throw new Error("Item not present");
	}
	this.db.set(id + mf_update_suffix, existing);
	this.db.set(id, item);
	this._emit("update", id);
};
Collection.prototype._remoteToLocalUpdate = function (id, fields) {
	var existing = this.db.get(id);
	if (!existing) {
		console.warn("Item not present");
		return;
	}
	for (var field in fields) {
		existing[field] = fields[field];
	}
	this.db.set(id, existing);
	this.db.del(id + mf_update_suffix);
	this._emit("update", id);
};
Collection.prototype._restoreUpdated = function (id) {
	var backup = this.db.get(id + mf_update_suffix);
	this.db.set(id, backup);
	this.db.del(id + mf_update_suffix);
	this._emit("restore", id);
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
			deferred.resolve(res);
		}
	});
	return deferred.promise;
};
Collection.prototype.update = function (id, item) {
	this._localToLocalUpdate(id, item);
	return this._localToRemoteUpdate(id, item);
};
