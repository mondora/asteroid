(function () {

	var DB = function () {
		this.itemsHash = {};
		this.itemsArray = [];
	};

	DB.prototype.set = function (id, item) {
		this.itemsHash[id] = item;
		this.itemsArray.push(item);
	};

	DB.prototype.get = function (id) {
		return this.itemsHash[id];
	};

	DB.prototype.del = function (id) {
		var index = this.itemsArray.indexOf(this.itemsHash[id]);
		this.itemsArray.splice(index, 1);
		delete this.itemsHash[id];
	};

	DB.prototype.ls = function () {
		return this.itemsArray;
	};

    if (typeof module !== "undefined" && module.exports) {
        module.exports = DB;
    } else {
        window.DB = DB;
    }

})();
