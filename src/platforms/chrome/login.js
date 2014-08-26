Asteroid.prototype._initOauthLogin = function (service, credentialToken, loginUrl) {
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
		if (tabId !== id) {
			return;
		}
		// If the url does not contain the # character
		// it means the loadstop event refers to an
		// intermediate page, therefore we ignore it
		if (changeInfo.url.indexOf("#") === -1) {
			return;
		}
		// Find the position of the # character
		var hashPosition = changeInfo.url.indexOf("#");
		// Get the key=value fragments in the hash
		var hashes = changeInfo.url.slice(hashPosition + 1).split("&");
		// Once again, check that the fragment belongs to the
		// final oauth page (the one we're looking for)
		if (
			!hashes[0] ||
			hashes[0].split("=")[0] !== "credentialToken" ||
			!hashes[1] ||
			hashes[1].split("=")[0] !== "credentialSecret"
		) {
			return;
		}
		// Retrieve the two tokens
		var hashCredentialToken = hashes[0].split("=")[1];
		var hashCredentialSecret = hashes[1].split("=")[1];
		// Check if the credentialToken corresponds. We could
		// use this as a way to communicate possible errors by
		// purposefully mismatching the credentialToken with
		// the error message. Too much of a hack?
		if (hashCredentialToken === credentialToken) {
			// Resolve the promise with the token and secret
			deferred.resolve({
				credentialToken: hashCredentialToken,
				credentialSecret: hashCredentialSecret
			});
			// Close the popup
			chrome.tabs.remove(id);
		}
	});
	return deferred.promise
		.then(self._afterCredentialSecretReceived.bind(self));
};
