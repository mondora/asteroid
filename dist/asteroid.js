(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.Asteroid = factory();
    }
}(this, function () {

"use strict";

function clone (obj) {
	if (obj === null) return null;
	return JSON.parse(JSON.stringify(obj));
}

function fromQs (obj) {
	var qs = "";
	for (var key in obj) {
		qs += key + "=" + obj[key] + "&";
	}
	qs = qs.slice(0, -1);
	return qs;
}

function guid () {
	var ret = "";
	for (var i=0; i<8; i++) {
		ret += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return ret;
}

function isEqual (obj1, obj2) {
	var str1 = JSON.stringify(obj1);
	var str2 = JSON.stringify(obj2);
	return str1 === str2;
}

var Asteroid = function (options) {
	this._host = options.host;
	this._ddpOptions = options.ddpOptions;
	this._ddpOptions.do_not_autoconnect = true;
	this._do_not_autocreate_collections = options._do_not_autocreate_collections;
	this.collections = {};
	this._init();
};
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype._init = function () {
	var self = this;
	self.ddp = new DDP(this._ddpOptions);
	self.ddp.on("connected", function () {
		if (self._do_not_autocreate_collections) return;
		self._tryResumeLogin();
		self.ddp.sub("meteor.loginServiceConfiguration");
	});
	self.ddp.on("added", self._onAdded.bind(self));
	self.ddp.on("changed", self._onChanged.bind(self));
	self.ddp.on("removed", self._onRemoved.bind(self));
	self.ddp.connect();
};

Asteroid.prototype._onAdded = function (data) {
	var cName = data.collection;
	if (!this.collections[cName]) {
		if (this._do_not_autocreate_collections) return;
		this.collections[cName] = new Asteroid.Collection(cName, this, Asteroid.DumbDb);
	}
	var item = data.fields;
	item._id = data.id;
	this.collections[cName]._localInsert(item, true);
};

Asteroid.prototype._onRemoved = function (data) {
	if (!this.collections[data.collection]) return;
	this.collections[data.collection]._localRemove(data.id);
};

Asteroid.prototype._onChanged = function (data) {
	if (!this.collections[data.collection]) return;
	data.cleared.forEach(function (key) {
		data.fields[key] = undefined;
	});
	this.collections[data.collection]._localUpdate(data.id, data.fields);
};

Asteroid.prototype.subscribe = function (name /* , param1, param2, ... */) {
	var deferred = Q.defer();
	var params = Array.prototype.slice.call(arguments, 1);
	this.ddp.sub(name, params, function (err, id) {
		if (err) {
			promise.reject(err, id);
		} else {
			promise.resolve(id);
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

var Collection = function (name, asteroidRef, DbConstructor) {
	this.name = name;
	this.asteroid = asteroidRef;
	this.db = new DbConstructor();
	this._events = {};
};
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
Collection.prototype.update = function (id) {
	this._localMarkForUpdate(id);
	this._remoteUpdate(id);
};

Collection.prototype.on = function (name, handler) {
	this._events[name] = this._events[name] || [];
	this._events[name].push(handler);
};
Collection.prototype.off = function (name, handler) {
	if (!this._events[name]) return;
	this._events[name].splice(this._events[name].indexOf(handler), 1);
};
Collection.prototype._emit = function (name /* , arguments */) {
	if (!this._events[name]) return;
	var args = arguments;
	var self = this;
	this._events[name].forEach(function (handler) {
		handler.apply(self, Array.prototype.slice.call(args, 1));
	});
};

Asteroid.Collection = Collection;

var DumbDb = function () {
	this.itemsHash = {};
	this.itemsArray = [];
};

DumbDb.prototype.set = function (id, item) {
	this.itemsHash[id] = item;
	this.itemsArray.push(item);
};

DumbDb.prototype.get = function (id) {
	if (this.itemsHash[id]) {
		return clone(this.itemsHash[id]);
	}
};

DumbDb.prototype.del = function (id) {
	if (this.itemsHash[id]) {
		var index = this.itemsArray.indexOf(this.itemsHash[id]);
		this.itemsArray.splice(index, 1);
		delete this.itemsHash[id];
	}
};

DumbDb.prototype.ls = function () {
	return clone(this.itemsArray);
};

Asteroid.DumbDb = DumbDb;

Asteroid.prototype._getOauthClientId = function (serviceName) {
	var loginConfigCollectionName = "meteor_accounts_loginServiceConfiguration";
	var services = this.collections[loginConfigCollectionName].db.itemsArray;
	var clientId = "";
	services.forEach(function (service) {
		if (service.service === serviceName) {
			if (serviceName === "facebook") clientId = service.appId;
			if (serviceName === "google") clientId = service.clientId;
			if (serviceName === "github") clientId = service.clientId;
			if (serviceName === "twitter") clientId = service.consumerKey;
		}
	});
	return clientId;
};

Asteroid.prototype._initOauthLogin = function (service, credentialToken, loginUrl) {
	var self = this;
	return Q()
		.then(function () {
			var deferred = Q.defer();
			var popup = window.open(loginUrl, "Login");
			if (popup.focus) popup.focus();
			var intervalId = setInterval(function () {
				if (popup.closed || popup.closed === undefined) {
					clearInterval(intervalId);
					deferred.resolve();
				}
			}, 100);
			return deferred.promise;
		})
		.then(function () {
			var deferred = Q.defer();
			var loginParameters = {
				oauth: {
					credentialToken: credentialToken
				}
			};
			self.ddp.method("login", [loginParameters], function (err, res) {
				if (err) return deferred.reject();
				self.userId = res.id;
				localStorage[self._host + "__login_token__"] = res.token;
				//self._emit("login", res);
				deferred.resolve(res.id);
			});
			return deferred.promise;
		});
};

Asteroid.prototype._tryResumeLogin = function () {
	var self = this;
	var token = localStorage[self._host + "__login_token__"];
	if (!token) return;
	return Q()
		.then(function () {
			var deferred = Q.defer();
			var loginParameters = {
				resume: token
			};
			self.ddp.method("login", [loginParameters], function (err, res) {
				if (err) return deferred.reject();
				self.userId = res.id;
				localStorage[self._host + "__login_token__"] = res.token;
				//self._emit("login", res);
				deferred.resolve(res.id);
			});
			return deferred.promise;
		})
		.fail(function () {
			self.userId = null;
			delete localStorage[self._host + "__login_token__"];
			//self._emit("logout");
		});
};

Asteroid.prototype.loginWithFacebook = function (scope) {
	var credentialToken = guid();
	var query = {
		client_id:		this._getOauthClientId("facebook"),
		redirect_uri:	this._host + "/_oauth/facebook?close",
		state:			credentialToken,
		scope:			scope || "email"
	};
	var loginUrl = "https://www.facebook.com/dialog/oauth?" + formQs(query);
	return this._initOauthLogin("facebook", credentialToken, loginUrl);
};

Asteroid.prototype.loginWithGoogle = function (scope) {
	var credentialToken = guid();
	var query = {
		response_type:	"code",
		client_id:		this._getOauthClientId("google"),
		redirect_uri:	this._host + "/_oauth/google?close",
		state:			credentialToken,
		scope:			scope || "openid email"
	};
	var loginUrl = "https://accounts.google.com/o/oauth2/auth?" + formQs(query);
	return this._initOauthLogin("google", credentialToken, loginUrl);
};

Asteroid.prototype.loginWithGithub = function (scope) {
	var credentialToken = guid();
	var query = {
		client_id:		this._getOauthClientId("github"),
		redirect_uri:	this._host + "/_oauth/github?close",
		state:			credentialToken,
		scope:			scope || "email"
	};
	var loginUrl = "https://github.com/login/oauth/authorize?" + formQs(query);
	return this._initOauthLogin("github", credentialToken, loginUrl);
};

Asteroid.prototype.loginWithTwitter = function (scope) {
	var credentialToken = guid();
	var callbackUrl = this._host + "/_oauth/twitter?close&state=" + credentialToken;
	var query = {
		requestTokenAndRedirect:	encodeURIComponent(callbackUrl),
		state:						credentialToken
	};
	var loginUrl = this._host + "/_oauth/twitter/?" + formQs(query);
	return this._initOauthLogin("twitter", credentialToken, loginUrl);
};

Asteroid.prototype.logout = function () {
	
};

return Asteroid;

}));
