function formQs (obj) {
	var qs = "";
	for (var key in obj) {
		qs += key + "=" + obj[key] + "&";
	}
	qs = qs.slice(0, -1);
	return qs;
}
