var Collection = function (name, asteroidRef, DbConstructor) {
	this.name = name;
	this.asteroid = asteroidRef;
	this.asteroid.collections[name] = this;
	this.db = new DbConstructor();
};
Collection.prototype = new EventEmitter();
Collection.prototype.constructor = Collection;

Collection.prototype._localInsert = function (item, fromRemote) {
	var existing = this.db.get(item._id);
	if (fromRemote && isEqual(existing, item)) return;
	if (!fromRemote && existing) throw new Error("Item exists.");
	this.db.set(item._id, item);
	this._emit("change");
};
Collection.prototype._remoteInsert = function (item) {
	var self = this;
	var methodName = "/" + self.name + "/insert";
	this.asteroid.ddp.method(methodName, [item], function (err, res) {
		if (err) {
			self._localRemove(item._id);
			throw err;
		}
	});
};
Collection.prototype.insert = function (item) {
	if (!item._id) item._id = guid();
	this._localInsert(item, false);
	this._remoteInsert(item);
	return item._id;
};

var removal_suffix = "__del__";
Collection.prototype._localRemove = function (id) {
	var existing = this.db.get(id);
	if (!existing) {
		console.warn("Item not present.");
		return;
	}
	this.db.del(id);
	this.db.del(id + removal_suffix);
	this._emit("change");
};
Collection.prototype._localRestoreRemoved = function (id) {
	var existing = this.db.get(id + removal_suffix);
	this.db.set(id, existing);
	this.db.del(id + removal_suffix);
	this._emit("change");
};
Collection.prototype._localMarkForRemoval = function (id) {
	var existing = this.db.get(id);
	if (!existing) {
		console.warn("Item not present.");
		return;
	}
	this.db.set(id + removal_suffix, existing);
	this.db.del(id);
	this._emit("change");
};
Collection.prototype._remoteRemove = function (id) {
	var self = this;
	var methodName = "/" + self.name + "/remove";
	this.asteroid.ddp.method(methodName, [{_id: id}], function (err, res) {
		if (err) {
			self._localRestoreRemoved(id);
			throw err;
		}
	});
};
Collection.prototype.remove = function (id) {
	this._localMarkForRemoval(id);
	this._remoteRemove(id);
};

var update_suffix = "__upd__";
Collection.prototype._localUpdate = function (id, fields) {
	var existing = this.db.get(id);
	if (!existing) {
		console.warn("Item not present.");
		return;
	}
	for (var field in fields) {
		existsing[field] = fields[field];
	}
	this.db.set(id, existing);
	this.db.del(id + update_suffix);
	this._emit("change");
};
Collection.prototype._localRestoreUpdated = function (id) {
	var existing = this.db.get(id + update_suffix);
	this.db.set(id, existing);
	this.db.del(id + update_suffix);
	this._emit("change");
};
Collection.prototype._localMarkForUpdate = function (id, item) {
	var existing = this.db.get(id);
	if (!existing) {
		console.warn("Item not present.");
		return;
	}
	this.db.set(id + update_suffix, existing);
	this.db.set(id, item);
	this._emit("change");
};
Collection.prototype._remoteUpdate = function (id, item) {
	var self = this;
	var methodName = "/" + self.name + "/update";
	this.asteroid.ddp.method(methodName, [{_id: id}, {$set: item}], function (err, res) {
		if (err) {
			self._localRestoreUpdated(id);
			throw err;
		}
	});
};
Collection.prototype.update = function (id, item) {
	this._localMarkForUpdate(id, item);
	this._remoteUpdate(id, item);
};

Asteroid.Collection = Collection;
