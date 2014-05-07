describe("An Asteroid.Set instance", function () {

	describe("should have the following methods:", function () {

		var set = new Asteroid.Set();

		it("put", function () {
			_.isFunction(set.put).should.equal(true);
		});

		it("del", function () {
			_.isFunction(set.del).should.equal(true);
		});

		it("get", function () {
			_.isFunction(set.get).should.equal(true);
		});

		it("contains", function () {
			_.isFunction(set.contains).should.equal(true);
		});

		it("filter", function () {
			_.isFunction(set.filter).should.equal(true);
		});

		it("toArray", function () {
			_.isFunction(set.toArray).should.equal(true);
		});

		it("toHash", function () {
			_.isFunction(set.toHash).should.equal(true);
		});

	});

	it("if readonly, should throw when put and del are called", function () {

		var set = new Asteroid.Set(true);

		var put = function () {
			set.put();
		};
		var del = function () {
			set.del();
		};
		put.should.throw("Attempt to modify readonly set");
		del.should.throw("Attempt to modify readonly set");

	});

});

describe("The put method", function () {

	var set = new Asteroid.Set();
	var id = "someRandomId";
	var item = {};

	it("should put a clone of the element", function () {
		set.put(id, item);
		set._items[id].should.eql(item);
		set._items[id].should.not.equal(item);
	});

	it("should fire the put event", function () {
		set._emit = sinon.spy();
		set.put(id, item);
		set._emit.calledWith("put", id).should.equal(true);
	});

	it("should throw if the first argument is not a string", function () {
		var troublemaker = function () {
			set.put({}, {});
		};
		troublemaker.should.throw("Assertion failed: expected String, instead got Object");
	});

	it("should throw if the second argument is not an object", function () {
		var troublemaker = function () {
			set.put("", "");
		};
		troublemaker.should.throw("Assertion failed: expected Object, instead got String");
	});

	it("should return the set instance", function () {
		var s = set.put(id, item);
		s.should.equal(set);
	});

});

describe("The del method", function () {

	var set;
	var id = "someRandomId";
	var item = {};

	beforeEach(function () {
		set = new Asteroid.Set();
		set.put(id, item);
	});

	it("should delove the element from the hash", function () {
		set._items[id].should.eql(item);
		set.del(id);
		_.isUndefined(set._items[id]).should.equal(true);
	});

	it("should fire the del event", function () {
		set._emit = sinon.spy();
		set.del(id);
		set._emit.calledWith("del", id).should.equal(true);
	});

	it("should throw if the first argument is not a string", function () {
		var troublemaker = function () {
			set.del({});
		};
		troublemaker.should.throw("Assertion failed: expected String, instead got Object");
	});

	it("should return the set instance", function () {
		var s = set.del(id);
		s.should.equal(set);
	});

});

describe("The get method", function () {

	var id = "someRandomId";
	var item = {};
	var set = new Asteroid.Set();
	set.put(id, item);

	it("should get a clone of the element", function () {
		var itm = set.get(id);
		itm.should.not.equal(item);
		itm.should.eql(item);
	});

	it("should throw if the first argument is not a string", function () {
		var troublemaker = function () {
			set.get({});
		};
		troublemaker.should.throw("Assertion failed: expected String, instead got Object");
	});

});

describe("The contains method", function () {

	var id = "someRandomId";
	var item = {};
	var set = new Asteroid.Set();
	set.put(id, item);

	it("should return true if and only if the set contains the item", function () {
		set.contains(id).should.equal(true);
		set.contains("anotherRandomId").should.equal(false);
	});

	it("should throw if the first argument is not a string", function () {
		var troublemaker = function () {
			set.contains({});
		};
		troublemaker.should.throw("Assertion failed: expected String, instead got Object");
	});

});

describe("The filter method", function () {

	var set;
	beforeEach(function () {
		var id;
		set = new Asteroid.Set();
		for (var i=0; i<100; i++) {
			id = ("000" + i).slice(-4);
			set.put(id, {_id: id});
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

		set.put("0100", {_id: "0100"});
		set.put("0101", {_id: "0101"});

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

		set.del("0100");
		set.del("0101");

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
