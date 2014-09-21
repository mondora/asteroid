Asteroid.prototype._openOauthPopup = function (credentialToken, loginUrl, afterCredentialSecretReceived) {
	var self = this;
	var deferred = Q.defer();
	// We're using Cordova's InAppBrowser plugin.
	// Each time the popup fires the loadstop event,
	// check if the hash fragment contains the
	// credentialSecret we need to complete the
	// authentication flow
	var onLoadstop = function (e) {
		var url = e.url;
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
			// Resolve the promise with the secret
			deferred.resolve({
				credentialToken: hash.credentialToken,
				credentialSecret: hash.credentialSecret
			});
			// On iOS, this seems to prevent "Warning: Attempt to dismiss from
			// view controller <MainViewController: ...> while a presentation
			// or dismiss is in progress". My guess is that the last
			// navigation of the OAuth popup is still in progress while we try
			// to close the popup. See
			// https://issues.apache.org/jira/browse/CB-2285.
			setTimeout(function () {
				popup.close();
			}, 100);
		}
	};
	var onExit = function () {
		popup.removeEventListener("loadstop", onLoadstop);
		popup.removeEventListener("exit", onExit);
	};
	// Open the oauth popup
	var popup = window.open(loginUrl, "_blank", "location=yes,hidden=yes");
	// Attach events
	popup.addEventListener("loadstop", onLoadstop);
	popup.addEventListener("exit", onExit);
	popup.show();
	return deferred.promise
		.then(afterCredentialSecretReceived.bind(self));
};
