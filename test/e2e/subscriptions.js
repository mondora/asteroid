import chai, {expect} from "chai";
import {Client} from "faye-websocket";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import {createClass} from "asteroid";

chai.use(sinonChai);

describe("subscriptions", () => {

    const Asteroid = createClass();
    const asteroid = new Asteroid({
        endpoint: "ws://localhost:3000/websocket",
        SocketConstructor: Client
    });

    after(done => {
        asteroid.on("disconnected", () => done());
        asteroid.disconnect();
    });

    var sub;

    it("subscribe to a publication and receive `added` events", done => {
        const addedSpy = sinon.spy();
        sub = asteroid.subscribe("echo", 0, 1, 2, 3, 4);
        asteroid.ddp.on("added", addedSpy);
        sub.on("ready", () => {
            try {
                expect(addedSpy).to.have.callCount(5);
                [0, 1, 2, 3, 4].forEach(n => {
                    expect(addedSpy).to.have.been.calledWith({
                        msg: "added",
                        collection: "echoParameters",
                        id: `id_${n}`,
                        fields: {
                            param: n
                        }
                    });
                });
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it("unsubscribe from a publication and receive `removed` events", done => {
        const removedSpy = sinon.spy();
        asteroid.unsubscribe(sub.id);
        asteroid.ddp.on("removed", removedSpy);
        setTimeout(() => {
            try {
                expect(removedSpy).to.have.callCount(5);
                [0, 1, 2, 3, 4].forEach(n => {
                    expect(removedSpy).to.have.been.calledWith({
                        msg: "removed",
                        collection: "echoParameters",
                        id: `id_${n}`
                    });
                });
                done();
            } catch (e) {
                done(e);
            }
        }, 50);
    });

});
