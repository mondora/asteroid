import chai, {expect} from "chai";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import fingerprintSub from "common/fingerprint-sub";

describe("`fingerprintSub` lib", function () {

    it("should return a fingerprint (implemented by JSON.stringify) of the subscription", function () {
        const name = "name";
        const params = ["param1", "param2"];
        const ret = fingerprintSub(name, params);
        expect(ret).to.equal(`{"name":"name","params":["param1","param2"]}`);
    });

});
