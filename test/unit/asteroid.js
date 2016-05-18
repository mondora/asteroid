import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import EventEmitter from "wolfy87-eventemitter";

import asteroid, {createClass} from "asteroid";

chai.use(sinonChai);

class SocketConstructorMock {}

describe("`createClass` method", () => {

    it("returns a class", () => {
        const Asteroid = createClass([]);
        const a = new Asteroid({
            SocketConstructor: SocketConstructorMock
        });
        expect(a).to.be.an.instanceOf(Asteroid);
    });

    it("returns a class extending EventEmitter", () => {
        const Asteroid = createClass([]);
        const a = new Asteroid({
            SocketConstructor: SocketConstructorMock
        });
        expect(a).to.be.an.instanceOf(Asteroid);
        expect(a).to.be.an.instanceOf(EventEmitter);
    });

    it("doesn't throw if no mixins are passed", () => {
        const peacemaker = () => {
            createClass();
        };
        expect(peacemaker).not.to.throw();
    });

    it("instantiation doesn't throw if no mixins are passed", () => {
        const Asteroid = createClass();
        const peacemaker = () => {
            new Asteroid({
                SocketConstructor: SocketConstructorMock
            });
        };
        expect(peacemaker).not.to.throw();
    });

});

describe("The `Asteroid` class returned by `createClass`", () => {

    const ddp = {ddpMethod: sinon.spy()};
    const login = {loginMethod: sinon.spy()};
    const methods = {methodsMethod: sinon.spy()};
    const loginWithPassword = {loginWithPasswordMethod: sinon.spy()};
    const subscriptions = {subscriptionsMethod: sinon.spy()};
    beforeEach(() => {
        asteroid.__Rewire__("ddp", ddp);
        asteroid.__Rewire__("login", login);
        asteroid.__Rewire__("methods", methods);
        asteroid.__Rewire__("loginWithPassword", loginWithPassword);
        asteroid.__Rewire__("subscriptions", subscriptions);
    });
    afterEach(() => {
        asteroid.__ResetDependency__("ddp");
        asteroid.__ResetDependency__("login");
        asteroid.__ResetDependency__("methods");
        asteroid.__ResetDependency__("loginWithPassword");
        asteroid.__ResetDependency__("subscriptions");
    });

    it("should have the methods defined by the 5 base mixins mixed-in", () => {
        const Asteroid = createClass();
        expect(Asteroid.prototype).to.have.property("ddpMethod", ddp.ddpMethod);
        expect(Asteroid.prototype).to.have.property("methodsMethod", methods.methodsMethod);
        expect(Asteroid.prototype).to.have.property("subscriptionsMethod", subscriptions.subscriptionsMethod);
        expect(Asteroid.prototype).to.have.property("loginWithPasswordMethod", loginWithPassword.loginWithPasswordMethod);
        expect(Asteroid.prototype).to.have.property("loginMethod", login.loginMethod);
    });

    it("should haven't an init method in prototype", () => {
        const Asteroid = createClass();
        expect(Asteroid.prototype.init).to.equal(undefined);
    });

    it("should call all mixins' init functions when constructing the instance", () => {
        const mixin_1 = {init: sinon.spy()};
        const mixin_2 = {init: sinon.spy()};
        const Asteroid = createClass([mixin_1, mixin_2]);
        const instance = {};
        Asteroid.call(instance, 0, 1, 2);
        expect(mixin_1.init).to.have.been.calledWith(0, 1, 2);
        expect(mixin_1.init).to.have.been.calledOn(instance);
        expect(mixin_2.init).to.have.been.calledWith(0, 1, 2);
        expect(mixin_2.init).to.have.been.calledOn(instance);
    });

});
