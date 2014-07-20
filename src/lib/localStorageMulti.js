// @if ENV=='browser'
// Check if we're in a chrome extension
var isChromeExtension = !!(window.chrome && window.chrome.extension);
// @endif

// @if ENV=='node'
var nodeTemporaryStorage = {};
// @endif



// Supoort multiple ways of persisting login tokens.
// Since chrome extension storage is asynchronous, our
// API is also aynchronous
// For details on the chrome extensions storage API, see
// https://developer.chrome.com/apps/storage
var localStorageMulti = {

	get: function (key) {
		var deferred = Q.defer();
		// @if ENV=='browser'
		if (isChromeExtension) {
			chrome.storage.local.get(key, function (data) {
				deferred.resolve(data[key]);
			});
		} else {
			deferred.resolve(localStorage[key]);
		}
		// @endif
		// @if ENV=='node'
		deferred.resolve(nodeTemporaryStorage[key]);
		// @endif
		return deferred.promise;
	},

	set: function (key, value) {
		var deferred = Q.defer();
		// @if ENV=='browser'
		if (isChromeExtension) {
			var data = {};
			data[key] = value;
			chrome.storage.local.set(data, function () {
				deferred.resolve();
			});
		} else {
			localStorage[key] = value;
			deferred.resolve();
		}
		// @endif
		// @if ENV=='node'
		nodeTemporaryStorage[key] = value;
		deferred.resolve();
		// @endif
		return deferred.promise;
	},

	del: function (key) {
		var deferred = Q.defer();
		// @if ENV=='browser'
		if (isChromeExtension) {
			chrome.storage.local.remove(key, function () {
				deferred.resolve();
			});
		} else {
			delete localStorage[key];
			deferred.resolve();
		}
		// @endif
		// @if ENV=='node'
		delete nodeTemporaryStorage[key];
		deferred.resolve();
		// @endif
		return deferred.promise;
	}

};
