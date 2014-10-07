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

//////////////////////////
// Asteroid constructor //
//////////////////////////

var Asteroid = function (host, ssl, socketInterceptFunction, instanceId) {
	// Assert arguments type
	Asteroid.utils.must.beString(host);
	// An id may be assigned to the instance. This is to support
	// resuming login of multiple connections to the same host.
	this._instanceId = instanceId || "0";
	// Configure the instance
	this._host = (ssl ? "https://" : "http://") + host;
	// Reference containers
	this.collections = {};
	this.subscriptions = {};
	this._subscriptionsCache = {};
	// Set __ddpOptions
	this._setDdpOptions(host, ssl, socketInterceptFunction);
	// Init the instance
	this._init();
};

/*
 *	Aftermarket implementation of the btoa function, since IE9 does not
 *	support it.
 *
 *	Code partly taken from:
 *	https://github.com/meteor/meteor/blob/devel/packages/base64/base64.js
 *	Copyright (C) 2011--2014 Meteor Development Group
 */

if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.btoa = (function () {

	var BASE_64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	var getChar = function (val) {
		return BASE_64_CHARS.charAt(val);
	};

	var newBinary = function (len) {
		var ret = [];
		for (var i = 0; i < len; i++) {
			ret.push(0);
		}
		return ret;
	};

	return function (array) {

		if (typeof array === "string") {
			var str = array;
			array = newBinary(str.length);
			for (var j = 0; j < str.length; j++) {
				var ch = str.charCodeAt(j);
				if (ch > 0xFF) {
					throw new Error("Not ascii. Base64.encode can only take ascii strings");
				}
				array[j] = ch;
			}
		}

		var answer = [];
		var a = null;
		var b = null;
		var c = null;
		var d = null;
		for (var i = 0; i < array.length; i++) {
			switch (i % 3) {
				case 0:
					a = (array[i] >> 2) & 0x3F;
					b = (array[i] & 0x03) << 4;
					break;
				case 1:
					b = b | (array[i] >> 4) & 0xF;
					c = (array[i] & 0xF) << 2;
					break;
				case 2:
					c = c | (array[i] >> 6) & 0x03;
					d = array[i] & 0x3F;
					answer.push(getChar(a));
					answer.push(getChar(b));
					answer.push(getChar(c));
					answer.push(getChar(d));
					a = null;
					b = null;
					c = null;
					d = null;
					break;
			}
		}
		if (a !== null) {
			answer.push(getChar(a));
			answer.push(getChar(b));
			if (c === null) {
				answer.push("=");
			} else {
				answer.push(getChar(c));
			}
			if (d === null) {
				answer.push("=");
			}
		}
		return answer.join("");
	};

})();

if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.clone = function (obj) {
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
};

if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.EventEmitter = function () {};

Asteroid.utils.EventEmitter.prototype = {

	constructor: Asteroid.utils.EventEmitter,

	on: function (name, handler) {
		if (!this._events) this._events = {};
		this._events[name] = this._events[name] || [];
		this._events[name].push(handler);
	},

	off: function (name, handler) {
		if (!this._events) this._events = {};
		if (!this._events[name]) return;
		this._events[name].splice(this._events[name].indexOf(handler), 1);
	},

	_emit: function (name /* , arguments */) {
		if (!this._events) this._events = {};
		if (!this._events[name]) return;
		var args = arguments;
		var self = this;
		this._events[name].forEach(function (handler) {
			handler.apply(self, Array.prototype.slice.call(args, 1));
		});
	}

};

if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.getFilterFromSelector = function (selector) {

	// Get the value of the object from a compund key
	// (e.g. "profile.name.first")
	var getItemVal = function (item, key) {
		return key.split(".").reduce(function (prev, curr) {
			if (!prev) {
				return prev;
			}
			prev = prev[curr];
			return prev;
		}, item);
	};

	var keys = Object.keys(selector);

	var filters = keys.map(function (key) {

		var subFilters;
		if (key === "$and") {
			subFilters = selector[key].map(Asteroid.utils.getFilterFromSelector);
			return function (item) {
				return subFilters.reduce(function (acc, subFilter) {
					if (!acc) {
						return acc;
					}
					return subFilter(item);
				}, true);
			};
		}

		if (key === "$or") {
			subFilters = selector[key].map(Asteroid.utils.getFilterFromSelector);
			return function (item) {
				return subFilters.reduce(function (acc, subFilter) {
					if (acc) {
						return acc;
					}
					return subFilter(item);
				}, false);
			};
		}

		if (key === "$nor") {
			subFilters = selector[key].map(Asteroid.utils.getFilterFromSelector);
			return function (item) {
				return subFilters.reduce(function (acc, subFilter) {
					if (!acc) {
						return acc;
					}
					return !subFilter(item);
				}, true);
			};
		}

		return function (item) {
			var itemVal = getItemVal(item, key);
			return itemVal === selector[key];
		};


	});

	// Return the filter function
	return function (item) {

		// Filter out backups
		if (item._id && is_backup(item._id)) {
			return false;
		}

		return filters.reduce(function (acc, filter) {
			if (!acc) {
				return acc;
			}
			return filter(item);
		}, true);

	};
};

if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.formQs = function (obj) {
	var qs = "";
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			qs += encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]) + "&";
		}
	}
	qs = qs.slice(0, -1);
	return qs;
};

if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.getOauthState = function (credentialToken) {
	var state = {
		loginStyle: "popup",
		credentialToken: credentialToken,
		isCordova: false
	};
	// Encode base64 as not all login services URI-encode the state
	// parameter when they pass it back to us.
	return Asteroid.utils.btoa(JSON.stringify(state));
};

if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.guid = function () {
	var ret = "";
	for (var i=0; i<8; i++) {
		ret += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return ret;
};

if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.isEmail = function (string) {
	return string.indexOf("@") !== -1;
};

if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.isEqual = function (obj1, obj2) {
	var str1 = JSON.stringify(obj1);
	var str2 = JSON.stringify(obj2);
	return str1 === str2;
};

if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.multiStorage = {};

if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.must = {

	_toString: function (thing) {
		return Object.prototype.toString.call(thing).slice(8, -1);
	},

	beString: function (s) {
		var type = this._toString(s);
		if (type !== "String") {
			throw new Error("Assertion failed: expected String, instead got " + type);
		}
	},

	beArray: function (o) {
		var type = this._toString(o);
		if (type !== "Array") {
			throw new Error("Assertion failed: expected Array, instead got " + type);
		}
	},

	beObject: function (o) {
		var type = this._toString(o);
		if (type !== "Object") {
			throw new Error("Assertion failed: expected Object, instead got " + type);
		}
	}

};

// Asteroid instances are EventEmitter-s
Asteroid.prototype = Object.create(Asteroid.utils.EventEmitter.prototype);
Asteroid.prototype.constructor = Asteroid;



////////////////////////////////
// Establishes the connection //
////////////////////////////////

Asteroid.prototype._init = function () {
	var self = this;
	// Creates the DDP instance, that will automatically
	// connect to the DDP server.
	self.ddp = new DDP(this._ddpOptions);
	// Register handlers
	self.ddp.on("connected", function () {
		// Upon connection try resuming login
		// Save the pormise it returns
		self.resumeLoginPromise = self._tryResumeLogin();
		// Subscribe to the meteor.loginServiceConfiguration
		// collection, which holds the configuration options
		// to login via third party services (oauth).
		self.subscribe("meteor.loginServiceConfiguration");
		// Emit the connected event
		self._emit("connected");
	});
	self.ddp.on("reconnected", function () {
		// Upon reconnection try resuming login
		// Save the pormise it returns
		self.resumeLoginPromise = self._tryResumeLogin();
		// Re-establish all previously established (and still active) subscriptions
		self._reEstablishSubscriptions();
		// Emit the reconnected event
		self._emit("reconnected");
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
};



//////////////////////////////////////////////////////////////////
// Handlers for the ddp "added", "removed" and "changed" events //
//////////////////////////////////////////////////////////////////

Asteroid.prototype._onAdded = function (data) {
	// Get the name of the collection
	var cName = data.collection;
	// If the collection does not exist yet, create it
	if (!this.collections[cName]) {
		this.collections[cName] = new Asteroid._Collection(cName, this);
	}
	// data.fields can be undefined if the item added has only
	// the _id field . To avoid errors down the line, ensure item
	// is an object.
	var item = data.fields || {};
	item._id = data.id;
	// Perform the remote insert
	this.collections[cName]._remoteToLocalInsert(item);
};

Asteroid.prototype._onRemoved = function (data) {
	// Check the collection exists to avoid exceptions
	if (!this.collections[data.collection]) {
		return;
	}
	// Perform the reomte remove
	this.collections[data.collection]._remoteToLocalRemove(data.id);
};

Asteroid.prototype._onChanged = function (data) {
	// Check the collection exists to avoid exceptions
	if (!this.collections[data.collection]) {
		return;
	}
	// data.fields can be undefined if the update only
	// removed some properties in the item. Make sure
	// it's an object
	if (!data.fields) {
		data.fields = {};
	}
	// If there were cleared fields, explicitly set them
	// to undefined in the data.fields object. This will
	// cause those fields to be present in the for ... in
	// loop the remote update method of the collection
	// performs, causing then the fields to be actually
	// cleared from the item
	if (data.cleared) {
		data.cleared.forEach(function (key) {
			data.fields[key] = undefined;
		});
	}
	// Perform the remote update
	this.collections[data.collection]._remoteToLocalUpdate(data.id, data.fields);
};



////////////////////////////
// Call and apply methods //
////////////////////////////

Asteroid.prototype.call = function (method /* , param1, param2, ... */) {
	// Assert arguments type
	Asteroid.utils.must.beString(method);
	// Get the parameters for apply
	var params = Array.prototype.slice.call(arguments, 1);
	// Call apply
	return this.apply(method, params);
};

Asteroid.prototype.apply = function (method, params) {
	// Assert arguments type
	Asteroid.utils.must.beString(method);
	// If no parameters are given, use an empty array
	if (!Array.isArray(params)) {
		params = [];
	}
	// Create the result and updated promises
	var resultDeferred = Q.defer();
	var updatedDeferred = Q.defer();
	var onResult = function (err, res) {
		// The onResult handler takes care of errors
		if (err) {
			// If errors ccur, reject both promises
			resultDeferred.reject(err);
			updatedDeferred.reject();
		} else {
			// Otherwise resolve the result one
			resultDeferred.resolve(res);
		}
	};
	var onUpdated = function () {
		// Just resolve the updated promise
		updatedDeferred.resolve();
	};
	// Perform the method call
	this.ddp.method(method, params, onResult, onUpdated);
	// Return an object containing both promises
	return {
		result: resultDeferred.promise,
		updated: updatedDeferred.promise
	};
};



/////////////////////
// Syntactic sugar //
/////////////////////

Asteroid.prototype.getCollection = function (name) {
	// Assert arguments type
	Asteroid.utils.must.beString(name);
	// Only create the collection if it doesn't exist
	if (!this.collections[name]) {
		this.collections[name] = new Asteroid._Collection(name, this);
	}
	return this.collections[name];
};

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

Asteroid.prototype._getOauthClientId = function (serviceName) {
	var loginConfigCollectionName = "meteor_accounts_loginServiceConfiguration";
	var loginConfigCollection = this.collections[loginConfigCollectionName];
	var service = loginConfigCollection.reactiveQuery({service: serviceName}).result[0];
	return service.clientId || service.consumerKey || service.appId;
};

Asteroid.prototype._loginAfterCredentialSecretReceived = function (credentials) {
	var self = this;
	var deferred = Q.defer();
	var loginParameters = {
		oauth: credentials
	};
	self.ddp.method("login", [loginParameters], function (err, res) {
		if (err) {
			delete self.userId;
			delete self.loggedIn;
			Asteroid.utils.multiStorage.del(self._host + "__" + self._instanceId + "__login_token__");
			deferred.reject(err);
			self._emit("loginError", err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			Asteroid.utils.multiStorage.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
			self._emit("login", res.id);
			deferred.resolve(res.id);
		}
	});
	return deferred.promise;
};

Asteroid.prototype._connectAfterCredentialSecretReceived = function (credentials) {
	var deferred = Q.defer();
	var loginParameters = {
		oauth: credentials
	};
	this.ddp.method("addLoginService", [loginParameters], function (err, res) {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve();
		}
	});
	return deferred.promise;
};

Asteroid.prototype._tryResumeLogin = function () {
	var self = this;
	return Q()
		.then(function () {
			return Asteroid.utils.multiStorage.get(self._host + "__" + self._instanceId + "__login_token__");
		})
		.then(function (token) {
			if (!token) {
				throw new Error("No login token");
			}
			return token;
		})
		.then(function (token) {
			var deferred = Q.defer();
			var loginParameters = {
				resume: token
			};
			self.ddp.method("login", [loginParameters], function (err, res) {
				if (err) {
					delete self.userId;
					delete self.loggedIn;
					Asteroid.utils.multiStorage.del(self._host + "__" + self._instanceId + "__login_token__");
					self._emit("loginError", err);
					deferred.reject(err);
				} else {
					self.userId = res.id;
					self.loggedIn = true;
					Asteroid.utils.multiStorage.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
					self._emit("login", res.id);
					deferred.resolve(res.id);
				}
			});
			return deferred.promise;
		});
};

Asteroid.prototype.createUser = function (usernameOrEmail, password, profile) {
	var self = this;
	var deferred = Q.defer();
	var options;
	if (typeof usernameOrEmail === "string") {
		options = {
			username: Asteroid.utils.isEmail(usernameOrEmail) ? undefined : usernameOrEmail,
			email: Asteroid.utils.isEmail(usernameOrEmail) ? usernameOrEmail : undefined,
			password: password,
			profile: profile
		};
	} else if (typeof usernameOrEmail === "object") {
		options = usernameOrEmail;
	}
	self.ddp.method("createUser", [options], function (err, res) {
		if (err) {
			self._emit("createUserError", err);
			deferred.reject(err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			Asteroid.utils.multiStorage.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
			self._emit("createUser", res.id);
			self._emit("login", res.id);
			deferred.resolve(res.id);
		}
	});
	return deferred.promise;
};

Asteroid.prototype.loginWithPassword = function (usernameOrEmail, password) {
	var self = this;
	var deferred = Q.defer();
	var loginParameters = {
		password: password,
		user: {
			username: Asteroid.utils.isEmail(usernameOrEmail) ? undefined : usernameOrEmail,
			email: Asteroid.utils.isEmail(usernameOrEmail) ? usernameOrEmail : undefined
		}
	};
	self.ddp.method("login", [loginParameters], function (err, res) {
		if (err) {
			delete self.userId;
			delete self.loggedIn;
			Asteroid.utils.multiStorage.del(self._host + "__" + self._instanceId + "__login_token__");
			deferred.reject(err);
			self._emit("loginError", err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			Asteroid.utils.multiStorage.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
			self._emit("login", res.id);
			deferred.resolve(res.id);
		}
	});
	return deferred.promise;
};

Asteroid.prototype.logout = function () {
	var self = this;
	var deferred = Q.defer();
	self.ddp.method("logout", [], function (err) {
		if (err) {
			self._emit("logoutError", err);
			deferred.reject(err);
		} else {
			delete self.userId;
			delete self.loggedIn;
			Asteroid.utils.multiStorage.del(self._host + "__" + self._instanceId + "__login_token__");
			self._emit("logout");
			deferred.resolve();
		}
	});
	return deferred.promise;
};

var Set = function (readonly) {
	// Allow readonly sets
	if (readonly) {
		// Make the put and del methods private
		this._put = this.put;
		this._del = this.del;
		// Replace them with a throwy function
		this.put = this.del = function () {
			throw new Error("Attempt to modify readonly set");
		};
	}
	this._items = {};
};
// Inherit from EventEmitter
Set.prototype = Object.create(Asteroid.utils.EventEmitter.prototype);
Set.constructor = Set;

Set.prototype.put = function (id, item) {
	// Assert arguments type
	Asteroid.utils.must.beString(id);
	Asteroid.utils.must.beObject(item);
	// Save a clone to avoid collateral damage
	this._items[id] = Asteroid.utils.clone(item);
	this._emit("put", id);
	// Return the set instance to allow method chainging
	return this;
};

Set.prototype.del = function (id) {
	// Assert arguments type
	Asteroid.utils.must.beString(id);
	delete this._items[id];
	this._emit("del", id);
	// Return the set instance to allow method chainging
	return this;
};

Set.prototype.get = function (id) {
	// Assert arguments type
	Asteroid.utils.must.beString(id);
	// Return a clone to avoid collateral damage
	return Asteroid.utils.clone(this._items[id]);
};

Set.prototype.contains = function (id) {
	// Assert arguments type
	Asteroid.utils.must.beString(id);
	return !!this._items[id];
};

Set.prototype.filter = function (belongFn) {

	// Creates the subset
	var sub = new Set(true);

	// Keep a reference to the _items hash
	var items = this._items;

	// Performs the initial puts
	var ids = Object.keys(items);
	ids.forEach(function (id) {
		// Clone the element to avoid
		// collateral damage
		var itemClone = Asteroid.utils.clone(items[id]);
		var belongs = belongFn(itemClone);
		if (belongs) {
			sub._items[id] = items[id];
		}
	});

	// Listens to the put and del events
	// to automatically update the subset
	this.on("put", function (id) {
		// Clone the element to avoid
		// collateral damage
		var itemClone = Asteroid.utils.clone(items[id]);
		var belongs = belongFn(itemClone);
		if (belongs) {
			sub._put(id, items[id]);
		}
	});
	this.on("del", function (id) {
		sub._del(id);
	});

	// Returns the subset
	return sub;
};

Set.prototype.toArray = function () {
	var array = [];
	var items = this._items;
	var ids = Object.keys(this._items);
	ids.forEach(function (id) {
		array.push(items[id]);
	});
	// Return a clone to avoid collateral damage
	return Asteroid.utils.clone(array);
};

Set.prototype.toHash = function () {
	// Return a clone to avoid collateral damage
	return Asteroid.utils.clone(this._items);
};

Asteroid.Set = Set;

////////////////////////
// Subscription class //
////////////////////////

var Subscription = function (name, params, fingerprint, asteroid) {
	this._name = name;
	this._params = params;
	this._fingerprint = fingerprint;
	this._asteroid = asteroid;
	// Subscription promises
	this._ready = Q.defer();
	this.ready = this._ready.promise;
	// Subscribe via DDP
	var or = this._onReady.bind(this);
	var os = this._onStop.bind(this);
	var oe = this._onError.bind(this);
	this.id = asteroid.ddp.sub(name, params, or, os, oe);
};
Subscription.constructor = Subscription;

Subscription.prototype.stop = function () {
	this._asteroid.ddp.unsub(this.id);
	delete this._asteroid._subscriptionsCache[this._fingerprint];
};

Subscription.prototype._onReady = function () {
	this._ready.resolve(this.id);
};

Subscription.prototype._onStop = function () {
	delete this._asteroid.subscriptions[this.id];
	delete this._asteroid._subscriptionsCache[this._fingerprint];
};

Subscription.prototype._onError = function (err) {
	if (this.ready.isPending()) {
		this._ready.reject(err);
	}
	delete this._asteroid.subscriptions[this.id];
	delete this._asteroid._subscriptionsCache[this._fingerprint];
};



//////////////////////
// Subscribe method //
//////////////////////

Asteroid.prototype.subscribe = function (name /* , param1, param2, ... */) {
	// Assert arguments type
	Asteroid.utils.must.beString(name);
	// Collect arguments into array
	var args = Array.prototype.slice.call(arguments);
	// Hash the arguments to get a key for _subscriptionsCache
	var fingerprint = JSON.stringify(args);
	// Only subscribe if there is no cached subscription
	if (!this._subscriptionsCache[fingerprint]) {
		// Get the parameters of the subscription
		var params = args.slice(1);
		// Subscribe
		var sub = new Subscription(
			name,
			params,
			fingerprint,
			this
		);
		this._subscriptionsCache[sub._fingerprint] = sub;
		this.subscriptions[sub.id] = sub;
	}
	return this._subscriptionsCache[fingerprint];
};

Asteroid.prototype._reEstablishSubscriptions = function () {
	var subs = this.subscriptions;
	var oldSub;
	var newSub;
	for (var id in subs) {
		if (subs.hasOwnProperty(id)) {
			oldSub = subs[id];
			newSub = new Subscription(
				oldSub._name,
				oldSub._params,
				oldSub._fingerprint,
				this
			);
			delete this.subscriptions[oldSub.id];
			delete this._subscriptionsCache[oldSub._fingerprint];
			this.subscriptions[newSub.id] = newSub;
			this._subscriptionsCache[newSub._fingerprint] = newSub;
		}
	}
};

Asteroid.prototype._openOauthPopup = function (credentialToken, loginUrl, afterCredentialSecretReceived) {
	var self = this;
	// Open the oauth popup
	var popup = window.open(loginUrl, "_blank", "location=no,toolbar=no");
	// If the focus property exists, it's a function and it needs to be
	// called in order to focus the popup
	if (popup.focus) {
		popup.focus();
	}
	var deferred = Q.defer();
	var request = JSON.stringify({
		credentialToken: credentialToken
	});
	var intervalId = setInterval(function () {
		popup.postMessage(request, self._host);
	}, 100);
	window.addEventListener("message", function (e) {
		var message;
		try {
			message = JSON.parse(e.data);
		} catch (err) {
			return;
		}
		if (e.origin === self._host) {
			if (message.credentialToken === credentialToken) {
				clearInterval(intervalId);
				deferred.resolve({
					credentialToken: message.credentialToken,
					credentialSecret: message.credentialSecret
				});
			}
			if (message.error) {
				clearInterval(intervalId);
				deferred.reject(message.error);
			}
		}
	});
	return deferred.promise
		.then(afterCredentialSecretReceived.bind(self));
};

Asteroid.utils.multiStorage.get = function (key) {
	var deferred = Q.defer();
	deferred.resolve(localStorage[key]);
	return deferred.promise;
};

Asteroid.utils.multiStorage.set = function (key, value) {
	var deferred = Q.defer();
	localStorage[key] = value;
	deferred.resolve();
	return deferred.promise;
};

Asteroid.utils.multiStorage.del = function (key) {
	var deferred = Q.defer();
	delete localStorage[key];
	deferred.resolve();
	return deferred.promise;
};

Asteroid.prototype._setDdpOptions = function (host, ssl, socketInterceptFunction) {
	// If SockJS is available, use it, otherwise, use WebSocket
	// Note: SockJS is required for IE9 support
	if (typeof SockJS === "function") {
		this._ddpOptions = {
			endpoint: (ssl ? "https://" : "http://") + host + "/sockjs",
			SocketConstructor: SockJS,
			socketInterceptFunction: socketInterceptFunction
		};
	} else {
		this._ddpOptions = {
			endpoint: (ssl ? "wss://" : "ws://") + host + "/websocket",
			SocketConstructor: WebSocket,
			socketInterceptFunction: socketInterceptFunction
		};
	}
};

return Asteroid;

}));
