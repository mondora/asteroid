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
