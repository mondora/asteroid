var DumbDb = function () {
	this.itemsHash = {};
	this.itemsArray = [];
};
DumbDb.prototype.constructor = DumbDb;

DumbDb.prototype.set = function (id, item) {
	item = clone(item);
	if (!this.itemsHash[id]) {
		this.itemsArray.push(item);
	} else {
		var index = this.itemsArray.indexOf(this.itemsHash[id]);
		this.itemsArray[index] = item;
	}
	this.itemsHash[id] = item;
};

DumbDb.prototype.get = function (id) {
	return clone(this.itemsHash[id]);
};

DumbDb.prototype.find = function (selector) {
	var getItemVal = function (item, key) {
		return key.split(".").reduce(function (prev, curr) {
			prev = prev[curr];
			return prev;
		}, item);
	};
	var keys = Object.keys(selector);
	var matches = [];
	this.itemsArray.forEach(function (item) {
		for (var i=0; i<keys.length; i++) {
			var itemVal = getItemVal(item, keys[i]);
			if (itemVal !== selector[keys[i]]) {
				return;
			}
		}
		if (!is_backup(item._id)) {
			matches.push(clone(item));
		}
	});
	return matches;
};

DumbDb.prototype.findOne = function (selector) {
	return this.find(selector)[0];
};

DumbDb.prototype.del = function (id) {
	if (this.itemsHash[id]) {
		var index = this.itemsArray.indexOf(this.itemsHash[id]);
		this.itemsArray.splice(index, 1);
		delete this.itemsHash[id];
	}
};

DumbDb.prototype.ls = function () {
	return clone(this.itemsArray);
};

Asteroid.DumbDb = DumbDb;
