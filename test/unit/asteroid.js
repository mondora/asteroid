import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import Asteroid from "asteroid";

describe("`Asteroid` class", function () {

    describe("upon instantiation", function () {

        it("calls all mixins `init`-s (if present)", function () {
            var init1 = sinon.spy();
            var init3 = sinon.spy();
            var Asteroid1 = Asteroid.mixin({init: init1});
            var Asteroid2 = Asteroid1.mixin({});
            var Asteroid3 = Asteroid2.mixin({init: init3});
            var options = {};
            var asteroid = new Asteroid3(options);
            expect(asteroid).to.be.an.instanceOf(Asteroid);
            expect(asteroid).to.be.an.instanceOf(Asteroid1);
            expect(asteroid).to.be.an.instanceOf(Asteroid2);
            expect(asteroid).to.be.an.instanceOf(Asteroid3);
            expect(init1).to.have.callCount(1);
            expect(init1).to.have.been.calledWithExactly(options);
            expect(init3).to.have.callCount(1);
            expect(init3).to.have.been.calledWithExactly(options);
        });

    });

    describe("`mixin` static method", function () {

        it("returns a class which extends Asteroid", function () {
            var Asteroid1 = Asteroid.mixin({});
            expect(Asteroid1).to.be.a("function");
            expect(Asteroid1.prototype.constructor).to.equal(Asteroid1);
            var asteroid = new Asteroid1({});
            expect(asteroid).to.be.an.instanceOf(Asteroid);
            expect(asteroid).to.be.an.instanceOf(Asteroid1);
        });

        it("adds mixin's methods to `.prototype`", function () {
            var myMethod = sinon.spy();
            var Asteroid1 = Asteroid.mixin({myMethod});
            expect(Asteroid1.prototype.myMethod).to.be.a("function");
        });

    });

});
