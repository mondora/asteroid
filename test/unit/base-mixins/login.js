import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import EventEmitter from "wolfy87-eventemitter";

import * as loginMixin from "base-mixins/login";

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe("`login` mixin", () => {

    describe("`init` method", () => {

        const resumeLogin = sinon.spy();
        before(() => {
            loginMixin.__Rewire__("resumeLogin", resumeLogin);
        });
        after(() => {
            loginMixin.__ResetDependency__("resumeLogin");
        });

        it("should register the `resumeLogin` function as a handler of the ddp `connected` event", () => {
            /*
            *   Here we test indirectly the registration: if the `resumeLogin`
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

        it("should set the `userId` property to `null`", () => {
            const instance = {
                ddp: new EventEmitter()
            };
            loginMixin.init.call(instance);
            expect(instance).to.have.property("userId", null);
        });

        it("should set the `loggedIn` property to `false`", () => {
            const instance = {
                ddp: new EventEmitter()
            };
            loginMixin.init.call(instance);
            expect(instance).to.have.property("loggedIn", false);
        });

    });

    describe("`login` method", () => {

        const onLogin = sinon.spy();
        beforeEach(() => {
            onLogin.reset();
            loginMixin.__Rewire__("onLogin", onLogin);
        });
        afterEach(() => {
            loginMixin.__ResetDependency__("onLogin");
        });

        it("should call the `call` instance method with the correct parameters", () => {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            const loginParameters = {};
            loginMixin.login.call(instance, loginParameters);
            expect(instance.call).to.have.been.calledWith("login", loginParameters);
        });

        it("should call the `onLogin` function when the `call` instance method is resolved", () => {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            const loginParameters = {};
            return loginMixin.login.call(instance, loginParameters)
                .then(() => {
                    expect(onLogin).to.have.callCount(1);
                    expect(onLogin).to.have.calledOn(instance);
                });
        });

    });

    describe("`logout` method", () => {

        const onLogout = sinon.spy();
        beforeEach(() => {
            onLogout.reset();
            loginMixin.__Rewire__("onLogout", onLogout);
        });
        afterEach(() => {
            loginMixin.__ResetDependency__("onLogout");
        });

        it("should call the `call` instance method with the correct parameters", () => {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            loginMixin.logout.call(instance);
            expect(instance.call).to.have.been.calledWith("logout");
        });

        it("should call the `onLogout` function when the `call` instance method is resolved", () => {
            const instance = {
                call: sinon.stub().returns(Promise.resolve({}))
            };
            return loginMixin.logout.call(instance)
                .then(() => {
                    expect(onLogout).to.have.callCount(1);
                    expect(onLogout).to.have.calledOn(instance);
                });
        });

    });

});
