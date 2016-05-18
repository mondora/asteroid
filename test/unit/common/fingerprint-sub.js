import chai, {expect} from "chai";
import sinonChai from "sinon-chai";

import fingerprintSub from "common/fingerprint-sub";

chai.use(sinonChai);

describe("`fingerprintSub` lib", () => {

    it("should return a fingerprint (implemented by JSON.stringify) of the subscription", () => {
        const name = "name";
        const params = ["param1", "param2"];
        const ret = fingerprintSub(name, params);
        expect(ret).to.equal('{"name":"name","params":["param1","param2"]}');
    });

});
