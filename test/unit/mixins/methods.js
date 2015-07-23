import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import Promise from "promiz";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import EventEmitter from "wolfy87-eventemitter";
import takeTen from "../take-ten";

chai.use(chaiAsPromised);
chai.use(sinonChai);

import {init, apply, call} from "mixins/methods";

describe("`methods` mixin", function () {

    describe("`result` event handler", function () {

        it("resolves the promise in the `_methodsCache` if no errors occurred", function () {
            var instance = {
                ddp: new EventEmitter()
            };
            init.call(instance);
            var resolve = sinon.spy();
            var reject = sinon.spy();
            instance._methodsCache["id"] = {resolve, reject};
            instance.ddp.emit("result", {
                id: "id",
                result: {}
            });
            expect(resolve).to.have.been.calledWith({});
            expect(reject).to.have.callCount(0);
        });

        it("rejects the promise in the `_methodsCache` if errors occurred", function () {
            var instance = {
                ddp: new EventEmitter()
            };
            init.call(instance);
            var resolve = sinon.spy();
            var reject = sinon.spy();
            instance._methodsCache["id"] = {resolve, reject};
            instance.ddp.emit("result", {
                id: "id",
                error: {}
            });
            expect(resolve).to.have.callCount(0);
            expect(reject).to.have.been.calledWith({});
        });

    });

    describe("`apply` method", function () {

        it("returns a promise", function () {
            var instance = {
                ddp: {
                    method: sinon.spy()
                }
            };
            var ret = apply.call(instance);
            expect(ret).to.be.an.instanceOf(Promise);
            expect(ret.then).to.be.a("function");
        });

        it("calls `ddp.method`", function (done) {
            var instance = {
                ddp: {
                    method: sinon.spy()
                }
            };
            apply.call(instance, "method", [{}]);
            takeTen(() => {
                expect(instance.ddp.method).to.have.been.calledWith("method", [{}]);
            }, done);
        });

    });

    describe("`call` method", function () {

        it("calls `ddp.method`", function () {
            var instance = {
                apply: sinon.spy(() => "Promise")
            };
            var ret = call.call(instance, "method", {}, {});
            expect(instance.apply).to.have.been.calledWith("method", [{}, {}]);
            expect(ret).to.equal("Promise");
        });

    });

});
