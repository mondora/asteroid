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

var getFilterFromSelector = function (selector) {

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
			subFilters = selector[key].map(getFilterFromSelector);
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
			subFilters = selector[key].map(getFilterFromSelector);
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
			subFilters = selector[key].map(getFilterFromSelector);
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

function formQs (obj) {
	var qs = "";
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			qs += key + "=" + obj[key] + "&";
		}
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

function isEmail (string) {
	return string.indexOf("@") !== -1;
}

function isEqual (obj1, obj2) {
	var str1 = JSON.stringify(obj1);
	var str2 = JSON.stringify(obj2);
	return str1 === str2;
}

var nodeTemporaryStorage = {};
// Supoort multiple ways of persisting login tokens.
// Since chrome extension storage is asynchronous, our
// API is also aynchronous
// For details on the chrome extensions storage API, see
// https://developer.chrome.com/apps/storage
var localStorageMulti = {

	get: function (key) {
		var deferred = Q.defer();
		deferred.resolve(nodeTemporaryStorage[key]);
		return deferred.promise;
	},

	set: function (key, value) {
		var deferred = Q.defer();
		nodeTemporaryStorage[key] = value;
		deferred.resolve();
		return deferred.promise;
	},

	del: function (key) {
		var deferred = Q.defer();
		delete nodeTemporaryStorage[key];
		deferred.resolve();
		return deferred.promise;
	}

};

var must = {};

must._toString = function (thing) {
	return Object.prototype.toString.call(thing).slice(8, -1);
};

must.beString = function (s) {
	var type = this._toString(s);
	if (type !== "String") {
		throw new Error("Assertion failed: expected String, instead got " + type);
	}
};

must.beArray = function (o) {
	var type = this._toString(o);
	if (type !== "Array") {
		throw new Error("Assertion failed: expected Array, instead got " + type);
	}
};

must.beObject = function (o) {
	var type = this._toString(o);
	if (type !== "Object") {
		throw new Error("Assertion failed: expected Object, instead got " + type);
	}
};

///////////////////////
// Node dependencies //
///////////////////////

var DDP = require("ddp.js");
var Q = require("q");
var WebSocket = require("faye-websocket");

//////////////////////////
// Asteroid constructor //
//////////////////////////

var Asteroid = function (host, ssl, socketInterceptFunction, instanceId) {
	// Assert arguments type
	must.beString(host);
	// An id may be assigned to the instance. This is to support
	// resuming login of multiple connections to the same host.
	this._instanceId = instanceId || "0";
	// Configure the instance
	this._host = (ssl ? "https://" : "http://") + host;
	this._ddpOptions = {
		endpoint: (ssl ? "wss://" : "ws://") + host + "/websocket",
		SocketConstructor: WebSocket.Client,
		socketInterceptFunction: socketInterceptFunction
	};
	// Reference containers
	this.collections = {};
	this.subscriptions = {};
	this._subscriptionsCache = {};
	// Init the instance
	this._init();
};
// Asteroid instances are EventEmitter-s
Asteroid.prototype = Object.create(EventEmitter.prototype);
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



///////////////////////////////////////
// Handler for the ddp "added" event //
///////////////////////////////////////

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



/////////////////////////////////////////
// Handler for the ddp "removed" event //
/////////////////////////////////////////

Asteroid.prototype._onRemoved = function (data) {
	// Check the collection exists to avoid exceptions
	if (!this.collections[data.collection]) {
		return;
	}
	// Perform the reomte remove
	this.collections[data.collection]._remoteToLocalRemove(data.id);
};



/////////////////////////////////////////
// Handler for the ddp "changes" event //
/////////////////////////////////////////

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
	must.beString(method);
	// Get the parameters for apply
	var params = Array.prototype.slice.call(arguments, 1);
	// Call apply
	return this.apply(method, params);
};

Asteroid.prototype.apply = function (method, params) {
	// Assert arguments type
	must.beString(method);
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
	must.beString(name);
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
		item._id = guid();
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
ReactiveQuery.prototype = Object.create(EventEmitter.prototype);
ReactiveQuery.constructor = ReactiveQuery;

ReactiveQuery.prototype._getResult = function () {
	this.result = this._set.toArray();
};

Collection.prototype.reactiveQuery = function (selectorOrFilter) {
	var filter;
	if (typeof selectorOrFilter === "function") {
		filter = selectorOrFilter;
	} else {
		filter = getFilterFromSelector(selectorOrFilter);
	}
	var subset = this._set.filter(filter);
	return new ReactiveQuery(subset);
};



Asteroid._Collection = Collection;

Asteroid.prototype._tryResumeLogin = function () {
	var self = this;
	return Q()
		.then(function () {
			return localStorageMulti.get(self._host + "__" + self._instanceId + "__login_token__");
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
					localStorageMulti.del(self._host + "__" + self._instanceId + "__login_token__");
					self._emit("loginError", err);
					deferred.reject(err);
				} else {
					self.userId = res.id;
					self.loggedIn = true;
					localStorageMulti.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
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
	var options = {
		username: isEmail(usernameOrEmail) ? undefined : usernameOrEmail,
		email: isEmail(usernameOrEmail) ? usernameOrEmail : undefined,
		password: password,
		profile: profile
	};
	self.ddp.method("createUser", [options], function (err, res) {
		if (err) {
			self._emit("createUserError", err);
			deferred.reject(err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			localStorageMulti.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
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
			username: isEmail(usernameOrEmail) ? undefined : usernameOrEmail,
			email: isEmail(usernameOrEmail) ? usernameOrEmail : undefined
		}
	};
	self.ddp.method("login", [loginParameters], function (err, res) {
		if (err) {
			delete self.userId;
			delete self.loggedIn;
			localStorageMulti.del(self._host + "__" + self._instanceId + "__login_token__");
			deferred.reject(err);
			self._emit("loginError", err);
		} else {
			self.userId = res.id;
			self.loggedIn = true;
			localStorageMulti.set(self._host + "__" + self._instanceId + "__login_token__", res.token);
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
			localStorageMulti.del(self._host + "__" + self._instanceId + "__login_token__");
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
Set.prototype = Object.create(EventEmitter.prototype);
Set.constructor = Set;

Set.prototype.put = function (id, item) {
	// Assert arguments type
	must.beString(id);
	must.beObject(item);
	// Save a clone to avoid collateral damage
	this._items[id] = clone(item);
	this._emit("put", id);
	// Return the set instance to allow method chainging
	return this;
};

Set.prototype.del = function (id) {
	// Assert arguments type
	must.beString(id);
	delete this._items[id];
	this._emit("del", id);
	// Return the set instance to allow method chainging
	return this;
};

Set.prototype.get = function (id) {
	// Assert arguments type
	must.beString(id);
	// Return a clone to avoid collateral damage
	return clone(this._items[id]);
};

Set.prototype.contains = function (id) {
	// Assert arguments type
	must.beString(id);
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
		var itemClone = clone(items[id]);
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
		var itemClone = clone(items[id]);
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
	return clone(array);
};

Set.prototype.toHash = function () {
	// Return a clone to avoid collateral damage
	return clone(this._items);
};

Asteroid.Set = Set;

////////////////////////
// Subscription class //
////////////////////////

var Subscription = function (name, params, hash, asteroid) {
	this._name = name;
	this._params = params;
	this._hash = hash;
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
	delete this._asteroid._subscriptionsCache[this._hash];
};

Subscription.prototype._onReady = function () {
	this._ready.resolve(this.id);
};

Subscription.prototype._onStop = function () {
	delete this._asteroid.subscriptions[this.id];
};

Subscription.prototype._onError = function (err) {
	if (this.ready.isPending()) {
		this._ready.reject(err);
	}
	delete this._asteroid.subscriptions[this.id];
};



//////////////////////
// Subscribe method //
//////////////////////

Asteroid.prototype.subscribe = function (name /* , param1, param2, ... */) {
	// Assert arguments type
	must.beString(name);
	// Collect arguments into array
	var args = Array.prototype.slice.call(arguments);
	// Hash the arguments to get a key for _subscriptionsCache
	var hash = JSON.stringify(args);
	// Only subscribe if there is no cached subscription
	if (!this._subscriptionsCache[hash]) {
		// Get the parameters of the subscription
		var params = args.slice(1);
		var sub = new Subscription(name, params, hash, this);
		this._subscriptionsCache[hash] = sub;
		this.subscriptions[sub.id] = sub;
	}
	return this._subscriptionsCache[hash];
};

Asteroid.prototype._reEstablishSubscriptions = function () {
	var subs = this.subscriptions;
	for (var id in subs) {
		if (subs.hasOwnProperty(id)) {
			subs[id] = new Subscription(subs[id]._name, subs[id]._params, this);
		}
	}
};

module.exports = Asteroid;
