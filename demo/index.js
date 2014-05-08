var ceres = new Asteroid("localhost:3000");
ceres.on("connected", function () {
	console.log("Connected!");
});

window.onload = function () {
	document.getElementById("fb").addEventListener("click", function () {
		ceres.loginWithFacebook()
			.then(function (id) {
				console.log(id);
			})
			.fail(function (id) {
				console.log(id);
			});
	}, false);
	document.getElementById("tw").addEventListener("click", function () {
		ceres.loginWithTwitter().then(function (id) {
			console.log(id);
		});
	}, false);
	document.getElementById("gl").addEventListener("click", function () {
		ceres.loginWithGoogle().then(function (id) {
			console.log(id);
		});
	}, false);
	document.getElementById("gh").addEventListener("click", function () {
		ceres.loginWithGithub().then(function (id) {
			console.log(id);
		});
	}, false);
};
