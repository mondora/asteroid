import assign from "lodash.assign";
import EventEmitter from "wolfy87-eventemitter";
import SubscriptionCache from "../lib/subscription-cache";
import fingerprintSub from "../lib/fingerprint-sub.js";

function _restartSubscriptions () {
    this._subscriptionsCache.forEach(sub => {
        if (sub.stillInQueue) {
            // The subscription is still in ddp's queue, no need to restart it.
            return;
        }
        // The subscription must be deleted *before* re-subscribing,
        // otherwise `subscribe` hits the cache and does nothing
        this._subscriptionsCache.del(sub.id);
        this.subscribe(sub.name, ...sub.params);
    });
}

export function init () {
    this._subscriptionsCache = new SubscriptionCache();
    this.ddp
        .on("ready", msg => {
            msg.subs.forEach(id => {
                this._subscriptionsCache.get(id).emit("ready");
            });
        })
        .on("nosub", msg => {
            if (msg.error) {
                this._subscriptionsCache.get(msg.id).emit("error", msg.error);
            }
            this._subscriptionsCache.del(msg.id);
        })
        .on("connected", _restartSubscriptions.bind(this));
}

export function subscribe (name, ...params) {
    var fingerprint = fingerprintSub(name, params);
    var sub = this._subscriptionsCache.get(fingerprint);
    if (!sub) {
        // If there is no cached subscription, subscribe
        var id = this.ddp.sub(name, params);
        // ddp.js enqueues messages to send if a connection has not yet been
        // established. Upon connection, when subscriptions are restarted, we
        // don't want to restart those subscriptions which had been made when
        // the connection had not yet been established, and therefore are still
        // in the queue. For this reason, we save ddp's connection status onto
        // the subscription object and we check it later to decide wether to
        // restart the subscription or not.
        var stillInQueue = (this.ddp.status !== "connected");
        // Build the subscription object and save it in the cache
        sub = assign(
            new EventEmitter(),
            {fingerprint, id, name, params, stillInQueue}
        );
        this._subscriptionsCache.add(sub);
    }
    // Return the subscription object
    return sub;
}

export function unsubscribe (id) {
    this.ddp.unsub(id);
}
