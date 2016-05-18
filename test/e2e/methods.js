import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {Client} from "faye-websocket";

import {createClass} from "asteroid";

chai.use(chaiAsPromised);

describe("methods", () => {

    const Asteroid = createClass();
    const asteroid = new Asteroid({
        endpoint: "ws://localhost:3000/websocket",
        SocketConstructor: Client
    });

    after(done => {
        asteroid.on("disconnected", () => done());
        asteroid.disconnect();
    });

    it("calling a method that returns a value returns a promise to that value", () => {
        const responsePromise = asteroid.call("echo", 0, 1, 2, 3, 4);
        return expect(responsePromise).to.eventually.deep.equal([0, 1, 2, 3, 4]);
    });

    it("calling a method that throws returns a promise which is rejected with the thrown error", () => {
        const responsePromise = asteroid.call("throwError");
        return expect(responsePromise).to.be.rejectedWith("Error message");
    });

    it("calling a method that does not exists returns a promise which is rejected", () => {
        const responsePromise = asteroid.call("nonExistingMethod");
        return expect(responsePromise).to.be.rejectedWith("Method 'nonExistingMethod' not found");
    });

});
