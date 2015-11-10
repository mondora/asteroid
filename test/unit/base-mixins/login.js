import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import EventEmitter from "wolfy87-eventemitter";

chai.use(chaiAsPromised);
chai.use(sinonChai);

import * as loginMixin from "base-mixins/login";

describe("`login` mixin", function () {

    describe("the `init` method", function () {

        var resumeLogin = sinon.spy();

        before(function () {
            loginMixin.__Rewire__("resumeLogin", resumeLogin);
        });

        after(function () {
            loginMixin.__ResetDependency__("resumeLogin");
        });

        it("should register the `resumeLogin` function as a handler of the ddp `connected` event", function () {
            /*
            *   Here we test indircetly the registration: if the `resumeLogin`
            *   function is called in response to the `connected` event, it
            *   logically means that the `init` method registered it as a
            *   handler of the `connected` event.
            */
            const instance = {
                ddp: new EventEmitter()
            };
            loginMixin.init.call(instance);
            instance.ddp.emit("connected");
            expect(resumeLogin).to.have.callCount(1);
            expect(resumeLogin).to.be.calledOn(instance);
        });

        it("should set the `userId` property to `null`", function () {
            const instance = {
                ddp: new EventEmitter()
            };
            loginMixin.init.call(instance);
            expect(instance).to.have.property("userId", null);
        });

        it("should set the `loggedIn` property to `false`", function () {
            const instance = {
                ddp: new EventEmitter()
            };
            loginMixin.init.call(instance);
            expect(instance).to.have.property("loggedIn", false);
        });

    });

    describe("`login` method", function () {

        const onLogin = sinon.spy();

        beforeEach(function () {
            onLogin.reset();
            loginMixin.__Rewire__("onLogin", onLogin);
        });

        afterEach(function () {
            loginMixin.__ResetDependency__("onLogin");
        });

        it("should call the `call` instance method with the correct parameters", function () {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            const loginParameters = {};
            loginMixin.login.call(instance, loginParameters);
            expect(instance.call).to.have.been.calledWith("login", loginParameters);
        });

        it("should call the `onLogin` function when the `call` instance method is resolved", function () {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            const loginParameters = {};
            return loginMixin.login.call(instance, loginParameters)
                .then(function () {
                    expect(onLogin).to.have.callCount(1);
                    expect(onLogin).to.have.calledOn(instance);
                });
        });

    });

    describe("`logout` method", function () {

        const onLogout = sinon.spy();

        beforeEach(function () {
            onLogout.reset();
            loginMixin.__Rewire__("onLogout", onLogout);
        });

        afterEach(function () {
            loginMixin.__ResetDependency__("onLogout");
        });

        it("should call the `call` instance method with the correct parameters", function () {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            loginMixin.logout.call(instance);
            expect(instance.call).to.have.been.calledWith("logout");
        });

        it("should call the `onLogout` function when the `call` instance method is resolved", function () {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            return loginMixin.logout.call(instance)
                .then(function () {
                    expect(onLogout).to.have.callCount(1);
                    expect(onLogout).to.have.calledOn(instance);
                });
        });

    });

});
