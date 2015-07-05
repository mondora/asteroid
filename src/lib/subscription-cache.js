var SubscriptionCache = function SubscriptionCache () {
    this.byFingerprint = {};
    this.byId = {};
};

SubscriptionCache.prototype.add = function add (sub) {
    this.byFingerprint[sub.fingerprint] = sub;
    this.byId[sub.id] = sub;
};

SubscriptionCache.prototype.getById = function getById (id) {
    return this.byId[id] || null;
};

SubscriptionCache.prototype.getByFingerprint = function getByFingerprint (fingerprint) {
    return this.byFingerprint[fingerprint] || null;
};

SubscriptionCache.prototype.delById = function delById (id) {
    var sub = this.getById(id) || {};
    delete this.byFingerprint[sub.fingerprint];
    delete this.byId[sub.id];
};

SubscriptionCache.prototype.delByFingerprint = function delByFingerprint (fingerprint) {
    var sub = this.getByFingerprint(fingerprint) || {};
    delete this.byFingerprint[sub.fingerprint];
    delete this.byId[sub.id];
};

SubscriptionCache.prototype.forEach = function forEach (iterator) {
    var self = this;
    Object.keys(self.byId).forEach(function (id) {
        iterator(self.byId[id]);
    });
};

module.exports = SubscriptionCache;
