Asteroid.prototype._openOauthPopup = function (credentialToken, loginUrl, afterCredentialSecretReceived) {
	var self = this;
	// Open the oauth popup
	var popup = window.open(loginUrl, "_blank", "location=no,toolbar=no");
	// If the focus property exists, it's a function and it needs to be
	// called in order to focus the popup
	if (popup.focus) {
		popup.focus();
	}
	var deferred = Q.defer();
	// Plugin messages are not processed on Android until the next
	// message. This prevents the loadstop event from firing.
	// Call exec on an interval to force process messages.
	// http://stackoverflow.com/q/23352940/230462
	var checkMessageInterval;
	if (device.platform === "Android") {
		checkMessageInterval = setInterval(function () {
			cordova.exec(null, null, "", "", []);
		}, 200);
	}
	// We're using Cordova's InAppBrowser plugin.
	// Each time the popup fires the loadstop event,
	// check if the hash fragment contains the
	// credentialSecret we need to complete the
	// authentication flow
	popup.addEventListener("loadstop", function (e) {
		if (device.platform === "Android") {
			clearInterval(checkMessageInterval);
		}
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
			hash = JSON.parse(url.slice(hashPosition + 1));
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
			// Close the popup
			popup.close();
		}
	});
	return deferred.promise
		.then(afterCredentialSecretReceived.bind(self));
};
