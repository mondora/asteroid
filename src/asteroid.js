// @if ENV=='node'

///////////////////////
// Node dependencies //
///////////////////////

var DDP = require("ddp.js");
var Q = require("q");
var WebSocket = require("faye-websocket");

// @endif


//////////////////////////
// Asteroid constructor //
//////////////////////////

var Asteroid = function (host, ssl, socketInterceptFunction, debug) {
	// Assert arguments type
	must.beString(host);
	// Configure the instance
	this._host = (ssl ? "https://" : "http://") + host;
	// @if ENV=='browser'
	// If SockJS is available, use it, otherwise, use WebSocket
	// Note: SockJS is required for IE9 support
	if (typeof SockJS === "function") {
		this._ddpOptions = {
			endpoint: (ssl ? "https://" : "http://") + host + "/sockjs",
			SocketConstructor: SockJS,
			socketInterceptFunction: socketInterceptFunction,
			debug: debug
		};
	} else {
		this._ddpOptions = {
			endpoint: (ssl ? "wss://" : "ws://") + host + "/websocket",
			SocketConstructor: WebSocket,
			socketInterceptFunction: socketInterceptFunction,
			debug: debug
		};
	}
	// @endif
	// @if ENV=='node'
	this._ddpOptions = {
		endpoint: (ssl ? "wss://" : "ws://") + host + "/websocket",
		SocketConstructor: WebSocket.Client,
		socketInterceptFunction: socketInterceptFunction
	};
	// @endif
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
		// @if ENV=='browser'
		// Upon connection try resuming login
		// Save the pormise it returns
		self.resumeLoginPromise = self._tryResumeLogin();
		// @endif
		// Subscribe to the meteor.loginServiceConfiguration
		// collection, which holds the configuration options
		// to login via third party services (oauth).
		self.subscribe("meteor.loginServiceConfiguration");
		// Emit the connected event
		self._emit("connected");
	});
	self.ddp.on("reconnected", function () {
		// @if ENV=='browser'
		// Upon reconnection try resuming login
		// Save the pormise it returns
		self.resumeLoginPromise = self._tryResumeLogin();
		// @endif
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
