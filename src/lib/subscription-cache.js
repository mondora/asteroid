export default class SubscriptionCache {

    constructor () {
        this.byFingerprint = {};
        this.byId = {};
    }

    add (sub) {
        this.byFingerprint[sub.fingerprint] = sub;
        this.byId[sub.id] = sub;
    }

    get (idOrFingerprint) {
        return (
            this.byId[idOrFingerprint] ||
            this.byFingerprint[idOrFingerprint] ||
            null
        );
    }

    del (idOrFingerprint) {
        var sub = this.get(idOrFingerprint) || {};
        delete this.byFingerprint[sub.fingerprint];
        delete this.byId[sub.id];
    }

    forEach (iterator) {
        Object.keys(this.byId).forEach(id => {
            iterator(this.byId[id]);
        });
    }

}
