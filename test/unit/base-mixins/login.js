import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import Promise from "promiz";
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

    describe("`onLogin` function", function () {

        var onLogin = {};
        const multiStorage = {
            set: sinon.stub().returns(Promise.resolve({}))
        };

        beforeEach(function () {
            multiStorage.set.reset();
            loginMixin.__Rewire__("multiStorage", multiStorage);
            onLogin = loginMixin.__get__("onLogin");
        });

        afterEach(function () {
            loginMixin.__ResetDependency__("multiStorage");
        });

        const onLoginParameters = {
            id: "id",
            token: "token"
        };

        it("should set the `userId` property to `id`", function () {
            const instance = {
                emit: sinon.spy()
            };
            onLogin.call(instance, onLoginParameters);
            expect(instance).to.have.property("userId", "id");
        });

        it("should set the `loggedIn` property to `true`", function () {
            const instance = {
                emit: sinon.spy()
            };
            onLogin.call(instance, onLoginParameters);
            expect(instance).to.have.property("loggedIn", true);
        });

        it("should call the `set` function of the `multiStorage` method with the correct parameters", function () {
            const instance = {
                emit: sinon.spy(),
                endpoint: "endpoint"
            };
            onLogin.call(instance, onLoginParameters);
            expect(multiStorage.set).to.have.callCount(1);
            expect(multiStorage.set).to.have.calledWith("endpoint__login_token__", "token");
        });

        it("should call the `emit` instance method when the `set` function of the `multiStorage` method is resolved", function () {
            const instance = {
                emit: sinon.spy(),
                endpoint: "endpoint"
            };
            return onLogin.call(instance, onLoginParameters)
                .then(function () {
                    expect(instance.emit).to.be.callCount(1);
                    expect(instance.emit).to.be.calledOn(instance);
                    expect(instance.emit).to.be.calledWith("loggedIn");
                });
        });

    });

    describe("`onLogout` function", function () {

        var onLogout = {};
        const multiStorage = {
            del: sinon.stub().returns(Promise.resolve({}))
        };

        beforeEach(function () {
            multiStorage.del.reset();
            loginMixin.__Rewire__("multiStorage", multiStorage);
            onLogout = loginMixin.__get__("onLogout");
        });

        afterEach(function () {
            loginMixin.__ResetDependency__("multiStorage");
        });

        it("should set the `userId` property to `null`", function () {
            const instance = {
                emit: sinon.spy()
            };
            onLogout.call(instance);
            expect(instance).to.have.property("userId", null);
        });

        it("should set the `loggedIn` property to `false`", function () {
            const instance = {
                emit: sinon.spy()
            };
            onLogout.call(instance);
            expect(instance).to.have.property("loggedIn", false);
        });

        it("should call the `del` function of the `multiStorage` method with the correct parameters", function () {
            const instance = {
                emit: sinon.spy(),
                endpoint: "endpoint"
            };
            onLogout.call(instance);
            expect(multiStorage.del).to.have.callCount(1);
            expect(multiStorage.del).to.have.calledWith("endpoint__login_token__");
        });

        it("should call the `emit` instance method when the `del` function of the `multiStorage` method is resolved", function () {
            const instance = {
                emit: sinon.spy(),
                endpoint: "endpoint"
            };
            return onLogout.call(instance)
                .then(function () {
                    expect(instance.emit).to.be.callCount(1);
                    expect(instance.emit).to.be.calledOn(instance);
                    expect(instance.emit).to.be.calledWith("loggedOut");
                });
        });

    });

    describe("`resumeLogin` function", function () {

        var resumeLogin = {};
        var onLogin = sinon.spy();
        var onLogout = sinon.spy();
        var multiStorage = {
            get: sinon.stub()
        };

        beforeEach(function () {
            multiStorage.get.reset();
            loginMixin.__Rewire__("multiStorage", multiStorage);
            onLogin.reset();
            loginMixin.__Rewire__("onLogin", onLogin);
            onLogout.reset();
            loginMixin.__Rewire__("onLogout", onLogout);
            resumeLogin = loginMixin.__get__("resumeLogin");
        });

        afterEach(function () {
            loginMixin.__ResetDependency__("multiStorage");
            loginMixin.__ResetDependency__("onLogin");
            loginMixin.__ResetDependency__("onLogout");
        });

        it("should call the `get` function of the `multiStorage` method with the correct parameters", function () {
            const instance = {
                login: sinon.spy(),
                endpoint: "endpoint"
            };
            multiStorage.get.returns(Promise.resolve({}));
            resumeLogin.call(instance);
            expect(multiStorage.get).to.have.callCount(1);
            expect(multiStorage.get).to.have.calledWith("endpoint__login_token__");
        });

        it("should call a function that inspect if the `get` function has found a result in the multi-storage", function () {
            const instance = {
                login: sinon.spy(),
                endpoint: "endpoint"
            };
            multiStorage.get.returns(Promise.resolve({}));
            return resumeLogin.call(instance)
                .then(function () {
                    expect(instance.login).to.have.callCount(1);
                    expect(instance.login).to.have.calledOn(instance);
                });
        });

        it("should call a function that inspect if the `get` function has not found a result in the multi-storage", function () {
            const instance = {
                login: sinon.spy(),
                endpoint: "endpoint"
            };
            multiStorage.get.returns(Promise.resolve());
            return resumeLogin.call(instance)
                .then(function () {
                    expect(onLogout).to.have.callCount(1);
                    expect(onLogout).to.have.calledOn(instance);
                });
        });

        it("should call the `login` function in instance if the promise return a login token", function () {
            const instance = {
                login: sinon.spy(),
                endpoint: "endpoint"
            };
            multiStorage.get.returns(Promise.resolve({}));
            return resumeLogin.call(instance)
                .then(function () {
                    expect(instance.login).to.have.callCount(1);
                    expect(instance.login).to.have.calledOn(instance);
                });
        });

        it("should call the `onLogin` function in instance if the promise return a login token", function () {
            const instance = {
                login: sinon.spy(),
                endpoint: "endpoint"
            };
            multiStorage.get.returns(Promise.resolve({}));
            return resumeLogin.call(instance)
                .then(function () {
                    expect(onLogin).to.have.callCount(1);
                    expect(onLogin).to.have.calledOn(instance);
                });
        });

        it("should call the `onLogout` function if the promise is rejected", function () {
            const instance = {
                login: sinon.spy(),
                endpoint: "endpoint"
            };
            multiStorage.get.returns(Promise.reject({}));
            return resumeLogin.call(instance)
                .then(function () {
                    expect(onLogout).to.have.callCount(1);
                    expect(onLogout).to.have.calledOn(instance);
                });
        });

    });

});
