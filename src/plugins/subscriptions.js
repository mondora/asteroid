var EventEmitter = require("wolfy87-eventemitter");

var SubscriptionCache = require("../lib/subscription-cache.js");
var fingerprintSub    = require("../lib/fingerprint-sub.js");

exports.init = function init () {
    var self = this;
    self._subscriptionsCache = new SubscriptionCache();
    self._ddp.on("ready", function (msg) {
        msg.subs.forEach(function (id) {
            self._subscriptionsCache.getById(id).emit("ready");
        });
    });
    self._ddp.on("nosub", function (msg) {
        if (msg.error) {
            self._subscriptionsCache.getById(msg.id).emit("error", msg.error);
        }
        self._subscriptionsCache.delById(msg.id);
    });
    self._ddp.on("connected", function () {
        self._restartSubscriptions();
    });
};

exports._restartSubscriptions = function _restartSubscriptions () {
    var self = this;
    self._subscriptionsCache.forEach(function (sub) {
        self._subscriptionsCache.delById(sub.id);
        self.subscribe.apply(self, [sub.name].concat(sub.params));
    });
};

exports.subscribe = function subscribe (name /* , param1, param2, ... */) {
    var params = Array.prototype.slice.call(arguments, 1);
    var fingerprint = fingerprintSub(name, params);
    var sub = this._subscriptionsCache.getByFingerprint(fingerprint);
    if (!sub) {
        // If there is no cached subscription, subscribe
        var id = this._ddp.sub(name, params);
        // Build the subscription object and save it in the cache
        sub = new EventEmitter();
        sub.fingerprint = fingerprint;
        sub.id = id;
        sub.name = name;
        sub.params = params;
        this._subscriptionsCache.add(sub);
    }
    // Return the subscription object
    return sub;
};

exports.unsubscribe = function unsubscribe (id) {
    this._ddp.unsub(id);
};
