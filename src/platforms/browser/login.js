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
	var request = JSON.stringify({
		credentialToken: credentialToken
	});
	var intervalId = setInterval(function () {
		popup.postMessage(request, self._host);
	}, 100);
	window.addEventListener("message", function (e) {
		var message;
		try {
			message = JSON.parse(e.data);
		} catch (err) {
			return;
		}
		if (e.origin === self._host) {
			if (message.credentialToken === credentialToken) {
				clearInterval(intervalId);
				deferred.resolve({
					credentialToken: message.credentialToken,
					credentialSecret: message.credentialSecret
				});
			}
			if (message.error) {
				clearInterval(intervalId);
				deferred.reject(message.error);
			}
		}
	});
	return deferred.promise
		.then(afterCredentialSecretReceived.bind(self));
};
