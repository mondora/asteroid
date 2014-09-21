Asteroid.prototype._openOauthPopup = function (credentialToken, loginUrl, afterCredentialSecretReceived) {
	var self = this;
	var deferred = Q.defer();
	// Open the oauth tab
	var options = {
		url: loginUrl
	};
	var id;
	chrome.tabs.create(options, function (tab) {
		id = tab.id;
	});
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
		var url = changeInfo.url;
		// If the change is on the wrong tab, ignore it
		if (tabId !== id) {
			return;
		}
		// If the url didn't change, ignore the change
		if (!url) {
			return;
		}
		// If the url does not contain the # character
		// it means the loadstop event refers to an
		// intermediate page, therefore we ignore it
		if (url.indexOf("#") === -1) {
			return;
		}
		// Find the position of the # character
		var hashPosition = url.indexOf("#");
		var hash;
		try {
			// Parse the hash string
			var encodedHashString = url.slice(hashPosition + 1);
			var decodedHashString = decodeURIComponent(encodedHashString);
			hash = JSON.parse(decodedHashString);
		} catch (err) {
			// If the hash did not parse, we're not on the
			// final oauth page (the one we're looking for)
			return;
		}
		// Check if the credentialToken corresponds
		if (hash.credentialToken === credentialToken) {
			// Resolve the promise with the token and secret
			deferred.resolve({
				credentialToken: hash.credentialToken,
				credentialSecret: hash.credentialSecret
			});
			// Close the popup
			chrome.tabs.remove(id);
		}
	});
	return deferred.promise
		.then(afterCredentialSecretReceived.bind(self));
};
