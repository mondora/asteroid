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
	if (typeof EJSON !== "undefined") {
		return EJSON.clone(obj);
	}
	var type = typeof obj;
	switch (type) {
		case "undefined":
		case "function":
			return undefined;
		case "string":
		case "number":
		case "boolean":
			return obj;
		case "object":
			if (obj === null) {
				return null;
			}
			return JSON.parse(JSON.stringify(obj));
		default:
			return;
	}
}

var EventEmitter = function () {};
EventEmitter.prototype = {

	constructor: EventEmitter,

	_events: {},

	on: function (name, handler) {
		this._events[name] = this._events[name] || [];
		this._events[name].push(handler);
	},

	off: function (name, handler) {
		if (!this._events[name]) return;
		this._events[name].splice(this._events[name].indexOf(handler), 1);
	},

	_emit: function (name /* , arguments */) {
		if (!this._events[name]) return;
		var args = arguments;
		var self = this;
		this._events[name].forEach(function (handler) {
			handler.apply(self, Array.prototype.slice.call(args, 1));
		});
	}

};

function formQs (obj) {
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

// Removal and update suffix for backups
var mf_removal_suffix = "__del__";
var mf_update_suffix = "__upd__";
var is_backup = function (id) {
	var l1 = mf_removal_suffix.length;
	var l2 = mf_update_suffix.length;
	var s1 = id.slice(-1 * l1);
	var s2 = id.slice(-1 * l2);
	return s1 === mf_removal_suffix || s2 === mf_update_suffix;
};

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
		existing = this.db.get(id + mf_removal_suffix);
		if (!existing) {
			console.warn("Item not present.");
		} else {
			this.db.del(id + mf_removal_suffix);
		}
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

Collection.prototype.find = function (selector) {
	return this.db.find(selector);
};

Collection.prototype.findOne = function (selector) {
	return this.db.findOne(selector);
};

var DumbDb = function () {
	this.itemsHash = {};
	this.itemsArray = [];
};
DumbDb.prototype.constructor = DumbDb;

DumbDb.prototype.set = function (id, item) {
	item = clone(item);
	if (!this.itemsHash[id]) {
		this.itemsArray.push(item);
	} else {
		var index = this.itemsArray.indexOf(this.itemsHash[id]);
		this.itemsArray[index] = item;
	}
	this.itemsHash[id] = item;
};

DumbDb.prototype.get = function (id) {
	return clone(this.itemsHash[id]);
};

DumbDb.prototype.find = function (selector) {
	var getItemVal = function (item, key) {
		return key.split(".").reduce(function (prev, curr) {
			prev = prev[curr];
			return prev;
		}, item);
	};
	var keys = Object.keys(selector);
	var matches = [];
	this.itemsArray.forEach(function (item) {
		for (var i=0; i<keys.length; i++) {
			var itemVal = getItemVal(item, keys[i]);
			if (itemVal !== selector[keys[i]]) {
				return;
			}
		}
		if (!is_backup(item._id)) {
			matches.push(clone(item));
		}
	});
	return matches;
};

DumbDb.prototype.findOne = function (selector) {
	return this.find(selector)[0];
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
				if (err) {
					delete self.userId;
					delete self.loggedIn;
					delete localStorage[self._host + "__login_token__"];
					deferred.reject(err);
					self._emit("loginError", err);
				} else {
					self.userId = res.id;
					self.loggedIn = true;
					localStorage[self._host + "__login_token__"] = res.token;
					self._emit("login", res);
					deferred.resolve(res.id);
				}
			});
			return deferred.promise;
		});
};

Asteroid.prototype._tryResumeLogin = function () {
	var self = this;
	var token = localStorage[self._host + "__login_token__"];
	if (!token) {
		return;
	}
	return Q()
		.then(function () {
			var deferred = Q.defer();
			var loginParameters = {
				resume: token
			};
			self.ddp.method("login", [loginParameters], function (err, res) {
				if (err) {
					delete self.userId;
					delete self.loggedIn;
					delete localStorage[self._host + "__login_token__"];
					self._emit("loginError", err);
					deferred.reject(err);
				} else {
					self.userId = res.id;
					self.loggedIn = true;
					localStorage[self._host + "__login_token__"] = res.token;
					self._emit("login", res);
					deferred.resolve(res.id);
				}
			});
			return deferred.promise;
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
	var self = this;
	var deferred = Q.defer();
	self.ddp.method("logout", [], function (err, res) {
		if (err) {
			self._emit("logoutError", err);
			deferred.reject(err);
		} else {
			delete self.userId;
			delete self.loggedIn;
			delete localStorage[self._host + "__login_token__"];
			self._emit("logout", res);
			deferred.resolve(res);
		}
	});
	return deferred.promise;
};

return Asteroid;

}));
