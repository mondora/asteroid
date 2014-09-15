Asteroid.prototype._initOauthLogin = function (service, credentialToken, loginUrl, afterCredentialSecretReceived) {
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
		// If the url does not contain the # character
		// it means the loadstop event refers to an
		// intermediate page, therefore we ignore it
		if (e.url.indexOf("#") === -1) {
			return;
		}
		// Find the position of the # character
		var hashPosition = e.url.indexOf("#");
		// Get the key=value fragments in the hash
		var hashes = e.url.slice(hashPosition + 1).split("&");
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
			// Resolve the promise with the secret
			deferred.resolve({
				credentialToken: hashCredentialToken,
				credentialSecret: hashCredentialSecret
			});
			// Close the popup
			popup.close();
		}
	});
	return deferred.promise
		.then(afterCredentialSecretReceived.bind(self));
};
