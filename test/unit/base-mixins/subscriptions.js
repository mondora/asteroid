import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import EventEmitter from "wolfy87-eventemitter";

import * as subscriptionsMixin from "base-mixins/subscriptions";

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe("`subscriptions` mixin", () => {

    describe("`ready` event handler", () => {

        it("triggers the `ready` event on the appropriate subscriptions", () => {
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

    describe("`nosub` event handler", () => {

        it("triggers the `error` event on the appropriate subscription if an error occurred", () => {
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

        it("does not trigger the `error` event if no error occurred", () => {
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

        it("deletes the subscription from the cache", () => {
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

    describe("`connected` event handler", () => {

        it("triggers a re-subscription to cached subscriptions which are not still in ddp's queue", () => {
            const instance = {
                ddp: new EventEmitter(),
                subscribe: sinon.spy(),
                resubscribe: sinon.spy()
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
            expect(instance.resubscribe).to.have.callCount(2);
        });

        it("doesn't trigger a re-subscription to cached subscriptions which are still in ddp's queue", () => {
            const instance = {
                ddp: new EventEmitter(),
                subscribe: sinon.spy(),
                resubscribe: sinon.spy()
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

            instance.ddp.status = 'connected';
            instance.ddp.emit("connected");

            // re-subscribe should only be called for subscriptions
            // those were not in queue already
            expect(instance.resubscribe).to.have.callCount(1);

            // all subscriptions should be removed from the queue
            instance.subscriptions.cache.forEach(sub => {
                expect(sub).to.have.property('stillInQueue', false);
            });

            // re a re-connection happens, resubscribe should be 
            // called twice more, reconnecting both subscribtions
            instance.ddp.emit("connected");
            expect(instance.resubscribe).to.have.callCount(3);
        });

    });

    describe("`subscribe` method", () => {

        it("returns the subscription from cache if it's present", () => {
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

        it("subscribes and saves the subscription to cache if it's not present", () => {
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

    describe("`unsubscribe` method", () => {

        it("calls `ddp.unsub`", () => {
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
