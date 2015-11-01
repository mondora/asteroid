import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import takeTen from "../take-ten";

chai.use(sinonChai);

import {init} from "base-mixins/ddp";

class SocketConstructorMock {}

describe("`ddp` mixin", function () {

    it("should expose the `endpoint` public property", function () {
        const instance = {
            emit: sinon.spy()
        };
        const options = {
            endpoint: "endpoint",
            SocketConstructor: SocketConstructorMock
        };
        init.call(instance, options);
        expect(instance.endpoint).to.equal("endpoint");
    });

    describe("`connected` event handler", function () {

        it("emit `connected` event", function (done) {
            const instance = {
                emit: sinon.spy()
            };
            const options = {
                endpoint: "endpoint",
                SocketConstructor: SocketConstructorMock
            };
            init.call(instance, options);
            instance.ddp.emit("connected");
            takeTen(() => {
                expect(instance.emit).to.have.been.calledWith("connected");
            }, done);
        });

    });

    describe("`disconnected` event handler", function () {

        it("emit `disconnected` event", function (done) {
            const instance = {
                emit: sinon.spy()
            };
            const options = {
                endpoint: "endpoint",
                SocketConstructor: SocketConstructorMock
            };
            init.call(instance, options);
            instance.ddp.emit("disconnected");
            takeTen(() => {
                expect(instance.emit).to.have.been.calledWith("disconnected");
            }, done);
        });

    });

});
