if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.isEmail = function (string) {
	return string.indexOf("@") !== -1;
};
