describe("The Asteroid.DumbDb constructor", function () {
	describe("should create an instance with the following methods", function () {
		var db = new Asteroid.DumbDb();
		it("set", function () {
			(typeof db.set).should.equal("function");
		});
		it("get", function () {
			(typeof db.get).should.equal("function");
		});
		it("del", function () {
			(typeof db.del).should.equal("function");
		});
		it("ls", function () {
			(typeof db.ls).should.equal("function");
		});
	});
	describe("should create an instance with the following properties", function () {
		var db = new Asteroid.DumbDb();
		it("itemsArray", function () {
			(db.itemsArray instanceof Array).should.be.true;
		});
		it("itemsHash", function () {
			(db.itemsArray instanceof Object).should.be.true;
		});
	});
});

describe("The set method of a DumbDb instance", function () {
	it("should map a copy of the passed in object (as second argument) to the key \"id\" (first argument) of the itemsHash", function () {
		var db = new Asteroid.DumbDb();
		var id = "someId";
		var obj = {
			key: "val"
		};
		db.set(id, obj);
		db.itemsHash[id].should.not.be.equal(obj);
		db.itemsHash[id].should.be.eql(obj);
	});
});
