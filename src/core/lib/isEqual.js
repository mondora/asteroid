if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.isEqual = function (obj1, obj2) {
	var str1 = JSON.stringify(obj1);
	var str2 = JSON.stringify(obj2);
	return str1 === str2;
};
