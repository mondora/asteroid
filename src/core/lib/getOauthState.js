if (!Asteroid.utils) {
	Asteroid.utils = {};
}
Asteroid.utils.getOauthState = function (credentialToken) {
	var state = {
		loginStyle: "popup",
		credentialToken: credentialToken,
		isCordova: false
	};
	// Encode base64 as not all login services URI-encode the state
	// parameter when they pass it back to us.
	return Asteroid.utils.btoa(JSON.stringify(state));
};
