import chai, {expect} from "chai";
import sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";

import SubscriptionCache from "common/subscription-cache";

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe("`SubscriptionCache` class", () => {

    const sub1 = {
        id: "id1",
        fingerprint: "fingerprint1"
    };
    const sub2 = {
        id: "id2",
        fingerprint: "fingerprint2"
    };

    describe("`constructor` method", () => {

        it("should set `byFingerprint` and `byId` variable to {}", () => {
            const cache = new SubscriptionCache();
            expect(cache.byFingerprint).to.deep.equal({});
            expect(cache.byId).to.deep.equal({});
        });

    });

    describe("`add` method", () => {

        it("should add the passed-in subscription to the `byFingerprint` and `byId` containers", () => {
            const cache = new SubscriptionCache();
            cache.add(sub1);
            expect(cache.get("id1")).to.equal(sub1);
            expect(cache.get("fingerprint1")).to.equal(sub1);
        });

    });

    describe("`get` method", () => {

        const cache = new SubscriptionCache();
        cache.add(sub1);
        cache.add(sub2);

        it("should get a subscription by fingerprint", () => {
            const ret1 = cache.get("fingerprint1");
            const ret2 = cache.get("fingerprint2");
            expect(ret1).to.equal(sub1);
            expect(ret2).to.equal(sub2);
        });

        it("should get a subscription by id", () => {
            const ret1 = cache.get("id1");
            const ret2 = cache.get("id2");
            expect(ret1).to.equal(sub1);
            expect(ret2).to.equal(sub2);
        });

        it("should return null if there aren't id or fingerprint correspondences", () => {
            const ret1 = cache.get("id3");
            const ret2 = cache.get("fingerprint3");
            expect(ret1).to.equal(null);
            expect(ret2).to.equal(null);
        });

    });

    describe("`del` method", () => {

        it("should (only) delete the subscription by fingerprint", () => {
            const cache = new SubscriptionCache();
            cache.add(sub1);
            cache.add(sub2);
            cache.del("fingerprint1");
            expect(cache.get("fingerprint1")).to.equal(null);
            expect(cache.get("fingerprint2")).to.equal(sub2);
        });

        it("should (only) delete the subscription by `byId` variable", () => {
            const cache = new SubscriptionCache();
            cache.add(sub1);
            cache.add(sub2);
            cache.del("id1");
            expect(cache.get("id1")).to.equal(null);
            expect(cache.get("id2")).to.equal(sub2);
        });

    });

    describe("`forEach` method", () => {

        it("should iterate over the cache", () => {
            const cache = new SubscriptionCache();
            cache.add(sub1);
            cache.add(sub2);
            const iterator = sinon.spy();
            cache.forEach(iterator);
            expect(iterator).to.have.callCount(2);
            expect(iterator.getCall(0).args[0]).to.equal(sub1);
            expect(iterator.getCall(1).args[0]).to.equal(sub2);
        });

    });

});
