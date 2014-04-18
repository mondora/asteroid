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
