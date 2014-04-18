var Asteroid = function (options) {
	this._host = options.host;
	this._ddpOptions = options.ddpOptions;
	this._ddpOptions.do_not_autoconnect = true;
	this._do_not_autocreate_collections = options._do_not_autocreate_collections;
	this.collections = {};
	this.subscriptions = {};
	this._init();
};
Asteroid.prototype = new EventEmitter();
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype._init = function () {
	var self = this;
	self.ddp = new DDP(this._ddpOptions);
	self.ddp.on("connected", function () {
		self._tryResumeLogin();
		self.ddp.sub("meteor.loginServiceConfiguration");
		self._emit("connected");
	});
	self.ddp.on("added", function (data) {
		self._onAdded(data);
	});
	self.ddp.on("changed", function (data) {
		self._onChanged(data);
	});
	self.ddp.on("removed", function (data) {
		self._onRemoved(data);
	});
	self.ddp.connect();
};

Asteroid.prototype._onAdded = function (data) {
	var alwaysAutocreate = [
		"meteor_accounts_loginServiceConfiguration",
		"users"
	];
	var cName = data.collection;
	if (!this.collections[cName]) {
		if (this._do_not_autocreate_collections) {
			if (alwaysAutocreate.indexOf(cName) === -1) {
				return;
			}
		}
		this.createCollection(cName);
	}
	var item = data.fields || {};
	item._id = data.id;
	this.collections[cName]._remoteToLocalInsert(item);
};

Asteroid.prototype._onRemoved = function (data) {
	if (this.collections[data.collection]) {
		this.collections[data.collection]._remoteToLocalRemove(data.id);
	}
};

Asteroid.prototype._onChanged = function (data) {
	if (!this.collections[data.collection]) {
		return;
	}
	if (!data.fields) {
		data.fields = {};
	}
	if (data.cleared) {
		data.cleared.forEach(function (key) {
			data.fields[key] = undefined;
		});
	}
	this.collections[data.collection]._remoteToLocalUpdate(data.id, data.fields);
};

Asteroid.prototype.subscribe = function (name /* , param1, param2, ... */) {
	if (this.subscriptions[name]) {
		return this.subscriptions[name];
	}
	var deferred = Q.defer();
	this.subscriptions[name] = deferred.promise;
	var params = Array.prototype.slice.call(arguments, 1);
	this.ddp.sub(name, params, function (err, id) {
		if (err) {
			deferred.reject(err, id);
		} else {
			deferred.resolve(id);
		}
	});
	return this.subscriptions[name];
};

Asteroid.prototype.unsubscribe = function (id) {
	this.ddp.unsub(id);
};

Asteroid.prototype.call = function (method /* , param1, param2, ... */) {
	var params = Array.prototype.slice.call(arguments, 1);
	return this.apply(method, params);
};

Asteroid.prototype.apply = function (method, params) {
	var resultDeferred = Q.defer();
	var updatedDeferred = Q.defer();
	var onResult = function (err, res) {
		if (err) {
			resultDeferred.reject(err);
			updatedDeferred.reject();
		} else {
			resultDeferred.resolve(res);
		}
	};
	var onUpdated = function () {
		updatedDeferred.resolve();
	};
	this.ddp.method(method, params, onResult, onUpdated);
	return {
		result: resultDeferred.promise,
		updated: updatedDeferred.promise
	};
};

Asteroid.prototype.createCollection = function (name) {
	if (!this.collections[name]) {
		this.collections[name] = new Collection(name, this, DumbDb);
	}
	return this.collections[name];
};
