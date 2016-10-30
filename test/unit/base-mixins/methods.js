import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import EventEmitter from "wolfy87-eventemitter";

import {init, apply, call} from "base-mixins/methods";

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe("`methods` mixin", () => {

    describe("`updated` event handle", () => {

        it("resolves the promise with the value from `result`", () => {
            const result = {
                foo: "bar"
            };
            const instance = {
                ddp: new EventEmitter()
            };
            init.call(instance);
            const resolve = sinon.spy();
            const reject = sinon.spy();
            instance.methods.cache["id"] = {resolve, reject};
            instance.ddp.emit("result", {
                id: "id",
                result
            });
            instance.ddp.emit("updated", {
                methods: ["id"]
            });
            expect(resolve).to.have.been.calledWith(result);
            expect(reject).to.have.callCount(0);
        });

        it("should not resolve when there was no previous `result` event", () => {
            const instance = {
                ddp: new EventEmitter()
            };
            init.call(instance);
            const resolve = sinon.spy();
            const reject = sinon.spy();
            instance.methods.cache["id"] = {resolve, reject};
            instance.ddp.emit("updated", {
                methods: ["id"]
            });
            expect(resolve).to.have.callCount(0);
            expect(reject).to.have.callCount(0);
        });

    });

    describe("`result` event handler", () => {

        it("does resolve if no errors occurred and there was a previous `update` event", () => {
            const result = {
                foo: "bar"
            };
            const instance = {
                ddp: new EventEmitter()
            };
            init.call(instance);
            const resolve = sinon.spy();
            const reject = sinon.spy();
            instance.methods.cache["id"] = {resolve, reject};
            instance.ddp.emit("updated", {
                methods: ["id"]
            });
            instance.ddp.emit("result", {
                id: "id",
                result
            });
            expect(resolve).to.have.been.calledWith(result);
            expect(reject).to.have.callCount(0);
        });

        it("does not resolve if no errors occurred", () => {
            const result = {
                foo: "bar"
            };
            const instance = {
                ddp: new EventEmitter()
            };
            init.call(instance);
            const resolve = sinon.spy();
            const reject = sinon.spy();
            instance.methods.cache["id"] = {resolve, reject};
            instance.ddp.emit("result", {
                id: "id",
                result
            });
            expect(resolve).to.have.callCount(0);
            expect(reject).to.have.callCount(0);
        });

        it("rejects if errors occurred", () => {
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

    describe("`apply` method", () => {

        it("returns a promise", () => {
            const instance = {
                ddp: {
                    method: sinon.spy()
                }
            };
            const ret = apply.call(instance);
            expect(ret).to.be.an.instanceOf(Promise);
            expect(ret.then).to.be.a("function");
        });

        it("calls `ddp.method`", () => {
            const instance = {
                ddp: {
                    method: sinon.spy()
                }
            };
            apply.call(instance, "method", [{}]);
            expect(instance.ddp.method).to.have.been.calledWith("method", [{}]);
        });

    });

    describe("`call` method", () => {

        it("calls `ddp.method`", () => {
            const instance = {
                apply: sinon.spy(() => "Promise")
            };
            const ret = call.call(instance, "method", {}, {});
            expect(instance.apply).to.have.been.calledWith("method", [{}, {}]);
            expect(ret).to.equal("Promise");
        });

    });

});
