//////////////////////////
// Asteroid constructor //
//////////////////////////

var Asteroid = function (host, ssl, debug) {
	// Assert arguments type
	must.beString(host);
	// Configure the instance
	this._host = (ssl ? "https://" : "http://") + host;
	// If SockJS is available, use it, otherwise, use WebSocket
	// Note: SockJS is required for IE9 support
	this._ddpOptions = {
		endpoint: (ssl ? "wss://" : "ws://") + host + (window.SockJS ? "/sockjs" : "/websocket"),
		SocketConstructor: window.SockJS || window.WebSocket,
		debug: debug
	};
	// Reference containers
	this.collections = {};
	this.subscriptions = {};
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
		// Upon connection, try resuming the login
		self._tryResumeLogin();
		// Subscribe to the meteor.loginServiceConfiguration
		// collection, which holds the configuration options
		// to login via third party services (oauth).
		self.ddp.sub("meteor.loginServiceConfiguration");
		// Emit the connected event
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



///////////////////////////////////////
// Subscribe and unsubscribe methods //
///////////////////////////////////////

Asteroid.prototype.subscribe = function (name /* , param1, param2, ... */) {
	// Assert name must be a string
	must.beString(name);
	// If we're already subscribed, return the subscription
	if (this.subscriptions[name]) {
		return this.subscriptions[name];
	}
	// Init the promise that will be returned
	var deferred = Q.defer();
	// Keep a reference to the subscription
	this.subscriptions[name] = deferred.promise;
	// Get the paramteres for the subscription
	var params = Array.prototype.slice.call(arguments, 1);
	// Subscribe via DDP
	this.ddp.sub(name, params, function (err, id) {
		// This is the onReady/onNoSub callback
		if (err) {
			// Reject the promise if the server answered nosub
			deferred.reject(err, id);
		} else {
			// Resolve the promise if the server answered ready
			deferred.resolve(id);
		}
	});
	// Return the promise
	return this.subscriptions[name];
};

Asteroid.prototype.unsubscribe = function (id) {
	// Just send a ddp unsub message. We don't care about
	// the response because the server doesn't give any
	// meaningful response
	this.ddp.unsub(id);
};



////////////////////////////
// Call and apply methods //
////////////////////////////

Asteroid.prototype.call = function (method /* , param1, param2, ... */) {
	// Assert name must be a string
	must.beString(method);
	// Get the parameters for apply
	var params = Array.prototype.slice.call(arguments, 1);
	// Call apply
	return this.apply(method, params);
};

Asteroid.prototype.apply = function (method, params) {
	// Assert method must be a string
	must.beString(method);
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

Asteroid.prototype.createCollection = function (name) {
	// Assert on arguments type
	must.beString(name);
	// Only create the collection if it doesn't exist
	if (!this.collections[name]) {
		this.collections[name] = new Asteroid._Collection(name, this);
	}
	return this.collections[name];
};
