import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import EventEmitter from "wolfy87-eventemitter";
import takeTen from "../take-ten";

chai.use(chaiAsPromised);
chai.use(sinonChai);

import {init, apply, call} from "base-mixins/methods";

describe("`methods` mixin", function () {

    describe("`result` event handler", function () {

        it("resolves the promise in the `methods.cache` if no errors occurred", function () {
            const instance = {
                ddp: new EventEmitter()
            };
            init.call(instance);
            const resolve = sinon.spy();
            const reject = sinon.spy();
            instance.methods.cache["id"] = {resolve, reject};
            instance.ddp.emit("result", {
                id: "id",
                result: {}
            });
            expect(resolve).to.have.been.calledWith({});
            expect(reject).to.have.callCount(0);
        });

        it("rejects the promise in the `methods.cache` if errors occurred", function () {
            const instance = {
                ddp: new EventEmitter()
            };
            init.call(instance);
            const resolve = sinon.spy();
            const reject = sinon.spy();
            instance.methods.cache["id"] = {resolve, reject};
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
            const instance = {
                ddp: {
                    method: sinon.spy()
                }
            };
            const ret = apply.call(instance);
            expect(ret).to.be.an.instanceOf(Promise);
            expect(ret.then).to.be.a("function");
        });

        it("calls `ddp.method`", function (done) {
            const instance = {
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
            const instance = {
                apply: sinon.spy(() => "Promise")
            };
            const ret = call.call(instance, "method", {}, {});
            expect(instance.apply).to.have.been.calledWith("method", [{}, {}]);
            expect(ret).to.equal("Promise");
        });

    });

});
