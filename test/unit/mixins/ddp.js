import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import takeTen from "../take-ten";

chai.use(sinonChai);

import {init} from "mixins/ddp";

class SocketConstructorMock {}

describe("`ddp` mixin", function () {

    describe("`init` method", function () {

        it("sets the `endpoint`", function () {
            var instance = {};
            var options = {
                endpoint: "endpoint",
                SocketConstructor: SocketConstructorMock
            };
            init.call(instance, options);
            expect(instance.endpoint).to.equal(options.endpoint);
        });

        it("sets `status` to `disconnected`", function () {
            var instance = {};
            var options = {
                endpoint: "endpoint",
                SocketConstructor: SocketConstructorMock
            };
            init.call(instance, options);
            expect(instance.status).to.equal("disconnected");
        });

    });

    describe("`connected` event handler", function () {

        it("sets `status` to `connected`", function (done) {
            var instance = {
                emit: sinon.spy()
            };
            var options = {
                endpoint: "endpoint",
                SocketConstructor: SocketConstructorMock
            };
            init.call(instance, options);
            instance.ddp.emit("connected");
            takeTen(() => {
                expect(instance.status).to.equal("connected");
            }, done);
        });

        it("emit `connected` event", function (done) {
            var instance = {
                emit: sinon.spy()
            };
            var options = {
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

        it("sets `status` to `disconnected`", function (done) {
            var instance = {
                emit: sinon.spy()
            };
            var options = {
                endpoint: "endpoint",
                SocketConstructor: SocketConstructorMock
            };
            init.call(instance, options);
            instance.status = "connected";
            instance.ddp.emit("disconnected");
            takeTen(() => {
                expect(instance.status).to.equal("disconnected");
            }, done);
        });

        it("emit `disconnected` event", function (done) {
            var instance = {
                emit: sinon.spy()
            };
            var options = {
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
