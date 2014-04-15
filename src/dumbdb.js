var DumbDb = function () {
	this.itemsHash = {};
	this.itemsArray = [];
};

DumbDb.prototype.set = function (id, item) {
	this.itemsHash[id] = item;
	this.itemsArray.push(item);
};

DumbDb.prototype.get = function (id) {
	if (this.itemsHash[id]) {
		return clone(this.itemsHash[id]);
	}
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
