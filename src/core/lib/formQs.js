if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.formQs = function (obj) {
	var qs = "";
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			qs += encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]) + "&";
		}
	}
	qs = qs.slice(0, -1);
	return qs;
};
