import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import loginMethod, {onLogin, onLogout, resumeLogin} from "common/login-method";

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe("`onLogin` function", () => {

    const storage = {
        set: sinon.stub().returns(Promise.resolve({}))
    };

    beforeEach(() => {
        storage.set.reset();
    });

    const onLoginParameters = {
        id: "userId",
        token: "token"
    };

    it("sets the `userId` property to `id`", () => {
        const instance = {
            emit: sinon.spy(),
            storage
        };
        onLogin.call(instance, onLoginParameters);
        expect(instance).to.have.property("userId", "userId");
    });

    it("sets the `loggedIn` property to `true`", () => {
        const instance = {
            emit: sinon.spy(),
            storage
        };
        onLogin.call(instance, onLoginParameters);
        expect(instance).to.have.property("loggedIn", true);
    });

    it("writes the login `token` to `storage`", () => {
        const instance = {
            emit: sinon.spy(),
            endpoint: "endpoint",
            storage
        };
        onLogin.call(instance, onLoginParameters);
        expect(storage.set).to.have.callCount(1);
        expect(storage.set).to.have.calledWith("endpoint__login_token__", "token");
    });

    it("emits the `loggedIn` event with the id of the logged in user", () => {
        const instance = {
            emit: sinon.spy(),
            endpoint: "endpoint",
            storage
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
            emit: sinon.spy(),
            storage
        };
        return onLogin.call(instance, onLoginParameters)
            .then(ret => {
                expect(ret).to.equal("userId");
            });
    });

});

describe("`onLogout` function", () => {

    const storage = {
        del: sinon.stub().returns(Promise.resolve({}))
    };

    beforeEach(() => {
        storage.del.reset();
    });

    it("sets the `userId` property to `null`", () => {
        const instance = {
            emit: sinon.spy(),
            storage
        };
        onLogout.call(instance);
        expect(instance).to.have.property("userId", null);
    });

    it("sets the `loggedIn` property to `false`", () => {
        const instance = {
            emit: sinon.spy(),
            storage
        };
        onLogout.call(instance);
        expect(instance).to.have.property("loggedIn", false);
    });

    it("deletes the login `token` from `storage`", () => {
        const instance = {
            emit: sinon.spy(),
            endpoint: "endpoint",
            storage
        };
        onLogout.call(instance);
        expect(storage.del).to.have.callCount(1);
        expect(storage.del).to.have.calledWith("endpoint__login_token__");
    });

    it("emits the `loggedOut` event", () => {
        const instance = {
            emit: sinon.spy(),
            endpoint: "endpoint",
            storage
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
            emit: sinon.spy(),
            storage
        };
        return onLogout.call(instance)
            .then(ret => {
                expect(ret).to.equal(null);
            });
    });

});

describe("`resumeLogin` function", () => {

    const onLogout = sinon.spy();
    const storage = {
        get: sinon.stub()
    };
    beforeEach(() => {
        storage.get.reset();
        onLogout.reset();
        loginMethod.__Rewire__("onLogout", onLogout);
    });
    afterEach(() => {
        loginMethod.__ResetDependency__("onLogout");
    });

    it("tries logging in if a login token is found in `storage`", () => {
        const instance = {
            login: sinon.spy(),
            endpoint: "endpoint",
            storage
        };
        storage.get.returns(Promise.resolve("loginToken"));
        return resumeLogin.call(instance)
            .then(() => {
                expect(instance.login).to.have.callCount(1);
                expect(instance.login).to.have.calledOn(instance);
                expect(instance.login).to.have.been.calledWith({
                    resume: "loginToken"
                });
            });
    });

    it("doesn't try logging in if no token is found in `storage`", () => {
        const instance = {
            login: sinon.spy(),
            endpoint: "endpoint",
            storage
        };
        storage.get.returns(Promise.resolve(undefined));
        return resumeLogin.call(instance)
            .then(() => {
                expect(instance.login).to.have.callCount(0);
            });
    });

    it("logs out if no token is found in `storage`", () => {
        const instance = {
            login: sinon.spy(),
            endpoint: "endpoint",
            storage
        };
        storage.get.returns(Promise.resolve(undefined));
        return resumeLogin.call(instance)
            .then(() => {
                expect(onLogout).to.have.callCount(1);
            });
    });

});
