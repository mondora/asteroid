import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(chaiAsPromised);
chai.use(sinonChai);

import * as loginMethod from "lib/login-method";

describe("`onLogin` function", function () {

    const multiStorage = {
        set: sinon.stub().returns(Promise.resolve({}))
    };

    beforeEach(function () {
        multiStorage.set.reset();
        loginMethod.__Rewire__("multiStorage", multiStorage);
    });

    afterEach(function () {
        loginMethod.__ResetDependency__("multiStorage");
    });

    const onLoginParameters = {
        id: "id",
        token: "token"
    };

    it("should set the `userId` property to `id`", function () {
        const instance = {
            emit: sinon.spy()
        };
        loginMethod.onLogin.call(instance, onLoginParameters);
        expect(instance).to.have.property("userId", "id");
    });

    it("should set the `loggedIn` property to `true`", function () {
        const instance = {
            emit: sinon.spy()
        };
        loginMethod.onLogin.call(instance, onLoginParameters);
        expect(instance).to.have.property("loggedIn", true);
    });

    it("should call the `set` function of the `multiStorage` method with the correct parameters", function () {
        const instance = {
            emit: sinon.spy(),
            endpoint: "endpoint"
        };
        loginMethod.onLogin.call(instance, onLoginParameters);
        expect(multiStorage.set).to.have.callCount(1);
        expect(multiStorage.set).to.have.calledWith("endpoint__login_token__", "token");
    });

    it("should call the `emit` instance method when the `set` function of the `multiStorage` method is resolved", function () {
        const instance = {
            emit: sinon.spy(),
            endpoint: "endpoint"
        };
        return loginMethod.onLogin.call(instance, onLoginParameters)
            .then(function () {
                expect(instance.emit).to.be.callCount(1);
                expect(instance.emit).to.be.calledOn(instance);
                expect(instance.emit).to.be.calledWith("loggedIn");
            });
    });

});

describe("`onLogout` function", function () {

    const multiStorage = {
        del: sinon.stub().returns(Promise.resolve({}))
    };

    beforeEach(function () {
        multiStorage.del.reset();
        loginMethod.__Rewire__("multiStorage", multiStorage);
    });

    afterEach(function () {
        loginMethod.__ResetDependency__("multiStorage");
    });

    it("should set the `userId` property to `null`", function () {
        const instance = {
            emit: sinon.spy()
        };
        loginMethod.onLogout.call(instance);
        expect(instance).to.have.property("userId", null);
    });

    it("should set the `loggedIn` property to `false`", function () {
        const instance = {
            emit: sinon.spy()
        };
        loginMethod.onLogout.call(instance);
        expect(instance).to.have.property("loggedIn", false);
    });

    it("should call the `del` function of the `multiStorage` method with the correct parameters", function () {
        const instance = {
            emit: sinon.spy(),
            endpoint: "endpoint"
        };
        loginMethod.onLogout.call(instance);
        expect(multiStorage.del).to.have.callCount(1);
        expect(multiStorage.del).to.have.calledWith("endpoint__login_token__");
    });

    it("should call the `emit` instance method when the `del` function of the `multiStorage` method is resolved", function () {
        const instance = {
            emit: sinon.spy(),
            endpoint: "endpoint"
        };
        return loginMethod.onLogout.call(instance)
            .then(function () {
                expect(instance.emit).to.be.callCount(1);
                expect(instance.emit).to.be.calledOn(instance);
                expect(instance.emit).to.be.calledWith("loggedOut");
            });
    });

});

describe("`resumeLogin` function", function () {

    var onLogout = sinon.spy();
    var multiStorage = {
        get: sinon.stub()
    };

    beforeEach(function () {
        multiStorage.get.reset();
        loginMethod.__Rewire__("multiStorage", multiStorage);
        onLogout.reset();
        loginMethod.__Rewire__("onLogout", onLogout);
    });

    afterEach(function () {
        loginMethod.__ResetDependency__("multiStorage");
        loginMethod.__ResetDependency__("onLogout");
    });

    it("should call the `get` function of the `multiStorage` method with the correct parameters", function () {
        const instance = {
            login: sinon.spy(),
            endpoint: "endpoint"
        };
        multiStorage.get.returns(Promise.resolve({}));
        loginMethod.resumeLogin.call(instance);
        expect(multiStorage.get).to.have.callCount(1);
        expect(multiStorage.get).to.have.calledWith("endpoint__login_token__");
    });

    it("should call a function that inspect if the `get` function has found a result in the multi-storage", function () {
        const instance = {
            login: sinon.spy(),
            endpoint: "endpoint"
        };
        multiStorage.get.returns(Promise.resolve({}));
        return loginMethod.resumeLogin.call(instance)
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
        return loginMethod.resumeLogin.call(instance)
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
        return loginMethod.resumeLogin.call(instance)
            .then(function () {
                expect(instance.login).to.have.callCount(1);
                expect(instance.login).to.have.calledOn(instance);
            });
    });

    it("should call the `onLogout` function if the promise is rejected", function () {
        const instance = {
            login: sinon.spy(),
            endpoint: "endpoint"
        };
        multiStorage.get.returns(Promise.reject({}));
        return loginMethod.resumeLogin.call(instance)
            .then(function () {
                expect(onLogout).to.have.callCount(1);
                expect(onLogout).to.have.calledOn(instance);
            });
    });

});
