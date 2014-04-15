function clone (obj) {
	if (obj === null) return null;
	return JSON.parse(JSON.stringify(obj));
}
