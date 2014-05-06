describe("An Asteroid.Set instance", function () {

	describe("should have the following methods:", function () {

		var set = new Asteroid.Set();

		it("add", function () {
			_.isFunction(set.add).should.equal(true);
		});

		it("rem", function () {
			_.isFunction(set.rem).should.equal(true);
		});

		it("get", function () {
			_.isFunction(set.get).should.equal(true);
		});

		it("filter", function () {
			_.isFunction(set.filter).should.equal(true);
		});

	});

	it("if readonly, should throw when add and rem are called", function () {

		var set = new Asteroid.Set(true);

		var add = function () {
			set.add();
		};
		var rem = function () {
			set.rem();
		};
		add.should.throw("Attempt to modify readonly set");
		rem.should.throw("Attempt to modify readonly set");

	});

});

describe("The add method", function () {

	var set = new Asteroid.Set();
	var id = "someRandomId";
	var item = {};

	it("should add a clone of the element", function () {
		set.add(id, item);
		set._items[id].should.eql(item);
		set._items[id].should.not.equal(item);
	});

	it("should fire the add event", function () {
		set._emit = sinon.spy();
		set.add(id, item);
		set._emit.calledWith("add", id).should.equal(true);
	});

	it("should return the set instance", function () {
		var s = set.add(id, item);
		s.should.equal(set);
	});

});

describe("The rem method", function () {

	var set;
	var id = "someRandomId";
	var item = {};

	beforeEach(function () {
		set = new Asteroid.Set();
		set.add(id, item);
	});

	it("should remove the element from the hash", function () {
		set._items[id].should.eql(item);
		set.rem(id);
		_.isUndefined(set._items[id]).should.equal(true);
	});

	it("should fire the rem event", function () {
		set._emit = sinon.spy();
		set.rem(id);
		set._emit.calledWith("rem", id).should.equal(true);
	});

	it("should return the set instance", function () {
		var s = set.rem(id);
		s.should.equal(set);
	});

});

describe("The get method", function () {

	var id = "someRandomId";
	var item = {};
	var set = new Asteroid.Set();
	set.add(id, item);

	it("should get a clone of the element", function () {
		var itm = set.get(id);
		itm.should.not.equal(item);
		itm.should.eql(item);
	});

});

describe("The filter method", function () {

	var set;
	beforeEach(function () {
		var id;
		set = new Asteroid.Set();
		for (var i=0; i<100; i++) {
			id = ("000" + i).slice(-4);
			set.add(id, {_id: id});
		}
	});

	it("should return a subset filtered by the passed function", function () {
		var odds = [];
		var id;
		for (var i=0; i<100; i++) {
			if (i%2) {
				id = ("000" + i).slice(-4);
				odds.push(set._items[id]);
			}
		}
		var ss = set.filter(function (id, item) {
			return parseInt(id) % 2;
		});
		(ss instanceof Asteroid.Set).should.equal(true);

		var sortFn = function (a, b) {
			var ai = parseInt(a._id);
			var bi = parseInt(b._id);
			return ai > bi;
		};

		var found = ss.toArray().sort(sortFn);
		odds = odds.sort(sortFn);
		for (var j=0; j<found.length; j++) {
			odds[j].should.not.equal(found[j]);
			odds[j].should.eql(found[j]);
		}
	});

	it("should return a reactive subset", function () {

		var ss = set.filter(function (id, item) {
			return parseInt(id) % 2;
		});

		var odds, id, found, i, j;
	  	var sortFn = function (a, b) {
			var ai = parseInt(a._id);
			var bi = parseInt(b._id);
			return ai > bi;
		}; 

		set.add("0100", {_id: "0100"});
		set.add("0101", {_id: "0101"});

		odds = [];
		for (i=0; i<102; i++) {
			if (i%2) {
				id = ("000" + i).slice(-4);
				odds.push(set._items[id]);
			}
		}
		found = ss.toArray().sort(sortFn);
		odds = odds.sort(sortFn);
		for (j=0; j<found.length; j++) {
			odds[j].should.not.equal(found[j]);
			odds[j].should.eql(found[j]);
		}

		set.rem("0100");
		set.rem("0101");

		odds = [];
		for (i=0; i<100; i++) {
			if (i%2) {
				id = ("000" + i).slice(-4);
				odds.push(set._items[id]);
			}
		}
		found = ss.toArray().sort(sortFn);
		odds = odds.sort(sortFn);
		for (j=0; j<found.length; j++) {
			odds[j].should.not.equal(found[j]);
			odds[j].should.eql(found[j]);
		}

	});

});
