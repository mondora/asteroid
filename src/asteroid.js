var Asteroid = function (options) {
	this._host = options.host;
	this._ddpOptions = options.ddpOptions;
	this._ddpOptions.do_not_autoconnect = true;
	this._do_not_autocreate_collections = options._do_not_autocreate_collections;
	this.collections = {};
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
	self.ddp.on("added", self._onAdded.bind(self));
	self.ddp.on("changed", self._onChanged.bind(self));
	self.ddp.on("removed", self._onRemoved.bind(self));
	self.ddp.connect();
};

Asteroid.prototype._onAdded = function (data) {
	var loginConfigCollectionName = "meteor_accounts_loginServiceConfiguration";
	var cName = data.collection;
	if (!this.collections[cName]) {
		if (this._do_not_autocreate_collections) {
			if (cName !== loginConfigCollectionName && cName !== "users") {
				return;
			}
		}
		new Asteroid.Collection(cName, this, Asteroid.DumbDb);
	}
	var item = data.fields || {};
	item._id = data.id;
	this.collections[cName]._localInsert(item, true);
};

Asteroid.prototype._onRemoved = function (data) {
	if (!this.collections[data.collection]) return;
	this.collections[data.collection]._localRemove(data.id);
};

Asteroid.prototype._onChanged = function (data) {
	if (!this.collections[data.collection]) return;
	if (data.cleared) {
		data.cleared.forEach(function (key) {
			data.fields[key] = undefined;
		});
	}
	this.collections[data.collection]._localUpdate(data.id, data.fields);
};

Asteroid.prototype.subscribe = function (name /* , param1, param2, ... */) {
	var deferred = Q.defer();
	var params = Array.prototype.slice.call(arguments, 1);
	this.ddp.sub(name, params, function (err, id) {
		if (err) {
			deferred.reject(err, id);
		} else {
			deferred.resolve(id);
		}
	});
	return deferred.promise;
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
	return [resultDeferred.promise, updatedDeferred.promise];
};
