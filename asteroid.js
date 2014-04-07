(function () {



	var guid = function () {
		var ret = "";
		for (var i=0; i<8; i++) {
			ret += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return ret;
	};



	var Collection = function (name, asteroid, db) {
		this.name = name;
		this.asteroid = asteroid;
		this.db = new db();
		this.asteroid._collections[name] = this;
	};
	Collection.prototype.constructor = Collection;



	Collection.prototype._localInsert = function (item, fromRemote) {
		var existing = this.db.get(item._id);
		if (fromRemote) {
			if (_.isEqual(existing, item)) {
				return;
			}
		} else {
			if (existing) {
				throw new Error("Item exists.");
			}
		}
		this.db.set(item._id, item);
	};
	Collection.prototype._remoteInsert = function (item) {
		var self = this;
		var methodName = "/" + self.name + "/insert";
		this.asteroid.ddp.method(methodName, [item], function (err, res) {
			if (err) {
				self._localRemove(item._id);
				throw new Error(err);
			}
		});
	};
	Collection.prototype.insert = function (item) {
		if (!item._id) item._id = guid();
		this._localInsert(item, false);
		this._remoteInsert(item);
	};
	var onAdded = function (data) {
		if (!this._collections[data.collection]) return;
		var item = {};
		item._id = data.id;
		_.extend(item, data.fields);
		this._collections[data.collection]._localInsert(item, true);
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
	};
	Collection.prototype._localRestoreRemoved = function (id) {
		var existing = this.db.get(id + removal_suffix);
		this.db.set(id, existing);
		this.db.del(id + removal_suffix);
	};
	Collection.prototype._localMarkForRemoval = function (id) {
		var existing = this.db.get(id);
		if (!existing) {
			console.warn("Item not present.");
			return;
		}
		this.db.set(id + removal_suffix, existing);
		this.db.del(id);
	};
	Collection.prototype._remoteRemove = function (id) {
		var self = this;
		var methodName = "/" + self.name + "/remove";
		this.asteroid.ddp.method(methodName, [{_id: id}], function (err, res) {
			if (err) {
				self._localRestoreRemoved(id);
				throw new Error(err);
			}
		});
	};
	Collection.prototype.remove = function (id) {
		this._localMarkForRemoval(id);
		this._remoteRemove(id);
	};
	var onRemoved = function (data) {
		if (!this._collections[data.collection]) return;
		this._collections[data.collection]._localRemove(data.id);
	};



	var update_suffix = "__upd__";
	Collection.prototype._localUpdate = function (id, fields) {
		var existing = this.db.get(id);
		if (!existing) {
			console.warn("Item not present.");
			return;
		}
		_.extend(existing, fields);
		this.db.set(id, existing);
		this.db.del(id + update_suffix);
	};
	Collection.prototype._localRestoreUpdated = function (id) {
		var existing = this.db.get(id + update_suffix);
		this.db.set(id, existing);
		this.db.del(id + update_suffix);
	};
	Collection.prototype._localMarkForUpdate = function (id, item) {
		var existing = this.db.get(id);
		if (!existing) {
			console.warn("Item not present.");
			return;
		}
		this.db.set(id + update_suffix, existing);
		this.db.set(id, item);
	};
	Collection.prototype._remoteUpdate = function (id, item) {
		var self = this;
		var methodName = "/" + self.name + "/update";
		this.asteroid.ddp.method(methodName, [{_id: id}, {$set: item}], function (err, res) {
			if (err) {
				self._localRestoreUpdated(id);
				throw new Error(err);
			}
		});
	};
	Collection.prototype.update = function (id) {
		this._localMarkForUpdate(id);
		this._remoteUpdate(id);
	};
	var onChanged = function (data) {
		if (!this._collections[data.collection]) return;
		_.each(data.cleared, function (key) {
			data.fields[key] = undefined;
		});
		this._collections[data.collection]._localUpdate(data.id, data.fields);
	};



	var Asteroid = function () {
		this._collections = {};
	};
	Asteroid.prototype.init = function (ddpOptions) {
		this.ddp = new DDP(ddpOptions);
		this.ddp.on("added", _.bind(onAdded, this));
		this.ddp.on("changed", _.bind(onChanged, this));
		this.ddp.on("removed", _.bind(onRemoved, this));
	};



    window.Collection = Collection;
    window.Asteroid = Asteroid;



})();
