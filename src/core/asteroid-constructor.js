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
