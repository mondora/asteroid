import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import loginMethod, {onLogin, onLogout, resumeLogin} from "common/login-method";

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe("`onLogin` function", () => {

    const multiStorage = {
        set: sinon.stub().returns(Promise.resolve({}))
    };
    beforeEach(() => {
        multiStorage.set.reset();
        loginMethod.__Rewire__("multiStorage", multiStorage);
    });
    afterEach(() => {
        loginMethod.__ResetDependency__("multiStorage");
    });

    const onLoginParameters = {
        id: "userId",
        token: "token"
    };

    it("sets the `userId` property to `id`", () => {
        const instance = {
            emit: sinon.spy()
        };
        onLogin.call(instance, onLoginParameters);
        expect(instance).to.have.property("userId", "userId");
    });

    it("sets the `loggedIn` property to `true`", () => {
        const instance = {
            emit: sinon.spy()
        };
        onLogin.call(instance, onLoginParameters);
        expect(instance).to.have.property("loggedIn", true);
    });

    it("writes the login `token` to `multiStorage`", () => {
        const instance = {
            emit: sinon.spy(),
            endpoint: "endpoint"
        };
        onLogin.call(instance, onLoginParameters);
        expect(multiStorage.set).to.have.callCount(1);
        expect(multiStorage.set).to.have.calledWith("endpoint__login_token__", "token");
    });

    it("emits the `loggedIn` event with the id of the logged in user", () => {
        const instance = {
            emit: sinon.spy(),
            endpoint: "endpoint"
        };
        return onLogin.call(instance, onLoginParameters)
            .then(() => {
                expect(instance.emit).to.be.callCount(1);
                expect(instance.emit).to.be.calledOn(instance);
                expect(instance.emit).to.be.calledWith("loggedIn", "userId");
            });
    });

    it("returns a promise resolving to the id of the logged in user", () => {
        const instance = {
            emit: sinon.spy()
        };
        return onLogin.call(instance, onLoginParameters)
            .then(ret => {
                expect(ret).to.equal("userId");
            });
    });

});

describe("`onLogout` function", () => {

    const multiStorage = {
        del: sinon.stub().returns(Promise.resolve({}))
    };
    beforeEach(() => {
        multiStorage.del.reset();
        loginMethod.__Rewire__("multiStorage", multiStorage);
    });
    afterEach(() => {
        loginMethod.__ResetDependency__("multiStorage");
    });

    it("sets the `userId` property to `null`", () => {
        const instance = {
            emit: sinon.spy()
        };
        onLogout.call(instance);
        expect(instance).to.have.property("userId", null);
    });

    it("sets the `loggedIn` property to `false`", () => {
        const instance = {
            emit: sinon.spy()
        };
        onLogout.call(instance);
        expect(instance).to.have.property("loggedIn", false);
    });

    it("deletes the login `token` from `multiStorage`", () => {
        const instance = {
            emit: sinon.spy(),
            endpoint: "endpoint"
        };
        onLogout.call(instance);
        expect(multiStorage.del).to.have.callCount(1);
        expect(multiStorage.del).to.have.calledWith("endpoint__login_token__");
    });

    it("emits the `loggedOut` event", () => {
        const instance = {
            emit: sinon.spy(),
            endpoint: "endpoint"
        };
        return onLogout.call(instance)
            .then(() => {
                expect(instance.emit).to.be.callCount(1);
                expect(instance.emit).to.be.calledOn(instance);
                expect(instance.emit).to.be.calledWith("loggedOut");
            });
    });

    it("returns a promise resolving to `null`", () => {
        const instance = {
            emit: sinon.spy()
        };
        return onLogout.call(instance)
            .then(ret => {
                expect(ret).to.equal(null);
            });
    });

});

describe("`resumeLogin` function", () => {

    const onLogout = sinon.spy();
    const multiStorage = {
        get: sinon.stub()
    };
    beforeEach(() => {
        multiStorage.get.reset();
        loginMethod.__Rewire__("multiStorage", multiStorage);
        onLogout.reset();
        loginMethod.__Rewire__("onLogout", onLogout);
    });
    afterEach(() => {
        loginMethod.__ResetDependency__("multiStorage");
        loginMethod.__ResetDependency__("onLogout");
    });

    it("tries logging in if a login token is found in `multiStorage`", () => {
        const instance = {
            login: sinon.spy(),
            endpoint: "endpoint"
        };
        multiStorage.get.returns(Promise.resolve("loginToken"));
        return resumeLogin.call(instance)
            .then(() => {
                expect(instance.login).to.have.callCount(1);
                expect(instance.login).to.have.calledOn(instance);
                expect(instance.login).to.have.been.calledWith({
                    resume: "loginToken"
                });
            });
    });

    it("doesn't try logging in if no token is found in `multiStorage`", () => {
        const instance = {
            login: sinon.spy(),
            endpoint: "endpoint"
        };
        multiStorage.get.returns(Promise.resolve(undefined));
        return resumeLogin.call(instance)
            .then(() => {
                expect(instance.login).to.have.callCount(0);
            });
    });

    it("logs out if no token is found in `multiStorage`", () => {
        const instance = {
            login: sinon.spy(),
            endpoint: "endpoint"
        };
        multiStorage.get.returns(Promise.resolve(undefined));
        return resumeLogin.call(instance)
            .then(() => {
                expect(onLogout).to.have.callCount(1);
            });
    });

});
