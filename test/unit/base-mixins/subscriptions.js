import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import EventEmitter from "wolfy87-eventemitter";

chai.use(chaiAsPromised);
chai.use(sinonChai);

import * as subscriptionsMixin from "base-mixins/subscriptions";

describe("`subscriptions` mixin", function () {

    describe("`ready` event handler", function () {

        it("triggers the `ready` event on the appropriate subscriptions", function () {
            const instance = {
                ddp: new EventEmitter()
            };
            subscriptionsMixin.init.call(instance);
            const emit1 = sinon.spy();
            instance.subscriptions.cache.byId["id1"] = {emit: emit1};
            const emit2 = sinon.spy();
            instance.subscriptions.cache.byId["id2"] = {emit: emit2};
            const emit3 = sinon.spy();
            instance.subscriptions.cache.byId["id3"] = {emit: emit3};
            instance.ddp.emit("ready", {
                subs: ["id1", "id2"]
            });
            expect(emit1).to.have.callCount(1);
            expect(emit2).to.have.callCount(1);
            expect(emit3).to.have.callCount(0);
        });

    });

    describe("`nosub` event handler", function () {

        it("triggers the `error` event on the appropriate subscription if an error occurred", function () {
            const instance = {
                ddp: new EventEmitter()
            };
            subscriptionsMixin.init.call(instance);
            const emit1 = sinon.spy();
            instance.subscriptions.cache.byId["id1"] = {emit: emit1};
            const emit2 = sinon.spy();
            instance.subscriptions.cache.byId["id2"] = {emit: emit2};
            instance.ddp.emit("nosub", {
                id: "id1",
                error: {}
            });
            expect(emit1).to.have.been.calledWith("error", {});
            expect(emit2).to.have.callCount(0);
        });

        it("does not trigger the `error` event if no error occurred", function () {
            const instance = {
                ddp: new EventEmitter()
            };
            subscriptionsMixin.init.call(instance);
            const emit1 = sinon.spy();
            instance.subscriptions.cache.byId["id1"] = {emit: emit1};
            const emit2 = sinon.spy();
            instance.subscriptions.cache.byId["id2"] = {emit: emit2};
            instance.ddp.emit("nosub", {
                id: "id1"
            });
            expect(emit1).to.have.callCount(0);
            expect(emit2).to.have.callCount(0);
        });

        it("deletes the subscription from the cache", function () {
            const instance = {
                ddp: new EventEmitter()
            };
            subscriptionsMixin.init.call(instance);
            instance.subscriptions.cache.add({
                id: "id1",
                fingerprint: "id1"
            });
            instance.subscriptions.cache.add({
                id: "id2",
                fingerprint: "id2"
            });
            instance.ddp.emit("nosub", {
                id: "id1"
            });
            expect(instance.subscriptions.cache.get("id1")).to.equal(null);
            expect(instance.subscriptions.cache.get("id2")).not.to.equal(null);
        });

    });

    describe("`connected` event handler", function () {

        it("triggers a re-subscription to cached subscriptions which are not still in ddp's queue", function () {
            const instance = {
                ddp: new EventEmitter(),
                subscribe: sinon.spy()
            };
            subscriptionsMixin.init.call(instance);
            instance.subscriptions.cache.add({
                id: "id1",
                fingerprint: "id1",
                name: "n1",
                params: ["1", "11", "111"],
                stillInQueue: false
            });
            instance.subscriptions.cache.add({
                id: "id2",
                fingerprint: "id2",
                name: "n2",
                params: ["2", "22", "222"],
                stillInQueue: false
            });
            instance.ddp.emit("connected");
            expect(instance.subscribe.firstCall).to.have.been.calledWith("n1", "1", "11", "111");
            expect(instance.subscribe.secondCall).to.have.been.calledWith("n2", "2", "22", "222");
        });

        it("doesn't trigger a re-subscription to cached subscriptions which are still in ddp's queue", function () {
            const instance = {
                ddp: new EventEmitter(),
                subscribe: sinon.spy()
            };
            subscriptionsMixin.init.call(instance);
            instance.subscriptions.cache.add({
                id: "id1",
                fingerprint: "id1",
                name: "1",
                params: ["1", "11", "111"],
                stillInQueue: true
            });
            instance.subscriptions.cache.add({
                id: "id2",
                fingerprint: "id2",
                name: "2",
                params: ["2", "22", "222"],
                stillInQueue: false
            });
            instance.ddp.emit("connected");
            expect(instance.subscribe).to.have.callCount(1);
        });

    });

    describe("`subscribe` method", function () {

        it("returns the subscription from cache if it's present", function () {
            const cachedSub = {};
            const instance = {
                subscriptions: {
                    cache: {
                        get: () => cachedSub
                    }
                },
                ddp: {
                    sub: sinon.spy()
                }
            };
            const sub = subscriptionsMixin.subscribe.call(instance, "name", "param");
            expect(sub).to.equal(cachedSub);
            expect(instance.ddp.sub).to.have.callCount(0);
        });

        it("subscribes and saves the subscription to cache if it's not present", function () {
            const instance = {
                subscriptions: {
                    cache: {
                        get: () => null,
                        add: sinon.spy()
                    }
                },
                ddp: {
                    sub: sinon.spy(() => "id")
                }
            };
            const sub = subscriptionsMixin.subscribe.call(instance, "name", "param1", "param2");
            expect(sub).to.be.an.instanceOf(EventEmitter);
            expect(sub.name).to.equal("name");
            expect(sub.params).to.eql(["param1", "param2"]);
            expect(instance.subscriptions.cache.add).to.have.been.calledWith(sub);
            expect(instance.ddp.sub).to.have.been.calledWith("name", ["param1", "param2"]);
        });

    });

    describe("`unsubscribe` method", function () {

        it("calls `ddp.unsub`", function () {
            const instance = {
                ddp: {
                    unsub: sinon.spy()
                }
            };
            subscriptionsMixin.unsubscribe.call(instance, "id");
            expect(instance.ddp.unsub).to.have.been.calledWith("id");
        });

    });

});
