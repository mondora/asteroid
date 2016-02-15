import chai, {expect} from "chai";
import DDP from "ddp.js";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import {init, connect, disconnect} from "base-mixins/ddp";

chai.use(sinonChai);

class SocketConstructorMock {}

describe("`ddp` mixin", () => {

    beforeEach(() => {
        sinon.stub(global, "setTimeout", fn => fn());
    });
    afterEach(() => {
        global.setTimeout.restore();
    });

    describe("`init` method", () => {

        it("creates a DDP instance and stores it on the `ddp` property", () => {
            const instance = {};
            const options = {
                endpoint: "endpoint",
                SocketConstructor: SocketConstructorMock
            };
            init.call(instance, options);
            expect(instance.ddp).to.be.an.instanceOf(DDP);
        });

        it("should expose the `endpoint` public property", () => {
            const instance = {};
            const options = {
                endpoint: "endpoint",
                SocketConstructor: SocketConstructorMock
            };
            init.call(instance, options);
            expect(instance.endpoint).to.equal("endpoint");
        });

    });

    describe("`connected` event handler", () => {

        it("emit `connected` event", () => {
            const instance = {
                emit: sinon.spy()
            };
            const options = {
                endpoint: "endpoint",
                SocketConstructor: SocketConstructorMock
            };
            init.call(instance, options);
            instance.ddp.emit("connected");
            expect(instance.emit).to.have.been.calledWith("connected");
        });

    });

    describe("`disconnected` event handler", () => {

        it("emit `disconnected` event", () => {
            const instance = {
                emit: sinon.spy()
            };
            const options = {
                endpoint: "endpoint",
                SocketConstructor: SocketConstructorMock
            };
            init.call(instance, options);
            instance.ddp.emit("disconnected");
            expect(instance.emit).to.have.been.calledWith("disconnected");
        });

    });

    describe("`connect` method", () => {

        it("calls the `ddp.connect` method", () => {
            const instance = {
                ddp: {
                    connect: sinon.spy()
                }
            };
            connect.call(instance);
            expect(instance.ddp.connect).to.have.callCount(1);
        });

    });

    describe("`disconnect` method", () => {

        it("calls the `ddp.disconnect` method", () => {
            const instance = {
                ddp: {
                    disconnect: sinon.spy()
                }
            };
            disconnect.call(instance);
            expect(instance.ddp.disconnect).to.have.callCount(1);
        });

    });

});
