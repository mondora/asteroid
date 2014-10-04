//////////////////
// Dependencies //
//////////////////

var crypto		= require("crypto");
var fs			= require("fs");
var gulp		= require("gulp");
var concat		= require("gulp-concat");
var http		= require("http");
var _			= require("lodash");
var mkdirp		= require("mkdirp");
var Q			= require("q");
var exec		= require("child_process").exec;
var static		= require("node-static");
var util		= require("util");
var WebSocket	= require("faye-websocket");



////////////////
// Build task //
////////////////

var buildBrowser = function () {
	console.log("Building for browser");
	var deferred = Q.defer();
	gulp.src([
		"src/platforms/browser/wrapper/head.js",
		"src/core/asteroid-constructor.js",
		"src/core/lib/*.js",
		"src/core/asteroid-methods.js",
		"src/core/collection.js",
		"src/core/login.js",
		"src/core/set.js",
		"src/core/subscription.js",
		"src/platforms/browser/*.js",
		"src/platforms/browser/wrapper/tail.js"
	])
		.pipe(concat("asteroid.browser.js"))
		.pipe(gulp.dest("dist/"))
		.on("end", function () {
			deferred.resolve();
		});
	return deferred.promise;
};

var buildChrome = function () {
	console.log("Building for chrome");
	var deferred = Q.defer();
	gulp.src([
		"src/platforms/chrome/wrapper/head.js",
		"src/core/asteroid-constructor.js",
		"src/core/lib/*.js",
		"src/core/asteroid-methods.js",
		"src/core/collection.js",
		"src/core/login.js",
		"src/core/set.js",
		"src/core/subscription.js",
		"src/platforms/chrome/*.js",
		"src/platforms/chrome/wrapper/tail.js"
	])
		.pipe(concat("asteroid.chrome.js"))
		.pipe(gulp.dest("dist/"))
		.on("end", function () {
			deferred.resolve();
		});
	return deferred.promise;
};

var buildCordova = function () {
	console.log("Building for cordova");
	var deferred = Q.defer();
	gulp.src([
		"src/platforms/cordova/wrapper/head.js",
		"src/core/asteroid-constructor.js",
		"src/core/lib/*.js",
		"src/core/asteroid-methods.js",
		"src/core/collection.js",
		"src/core/login.js",
		"src/core/set.js",
		"src/core/subscription.js",
		"src/platforms/cordova/*.js",
		"src/platforms/cordova/wrapper/tail.js"
	])
		.pipe(concat("asteroid.cordova.js"))
		.pipe(gulp.dest("dist/"))
		.on("end", function () {
			deferred.resolve();
		});
	return deferred.promise;
};

var buildNode = function () {
	console.log("Building for node");
	var deferred = Q.defer();
	gulp.src([
		"src/platforms/node/wrapper/head.js",
		"src/core/asteroid-constructor.js",
		"src/core/lib/*.js",
		"src/core/asteroid-methods.js",
		"src/core/collection.js",
		"src/core/login.js",
		"src/core/set.js",
		"src/core/subscription.js",
		"src/platforms/node/*.js",
		"src/platforms/node/wrapper/tail.js"
	])
		.pipe(concat("asteroid.node.js"))
		.pipe(gulp.dest("dist/"))
		.on("end", function () {
			deferred.resolve();
		});
	return deferred.promise;
};

var buildPlugins = function () {
	console.log("Building plugins");
	mkdirp.sync("dist/plugins");
	var deferred = Q.defer();
	gulp.src("src/plugins/*.js")
		.pipe(gulp.dest("dist/plugins/"))
		.on("end", function () {
			deferred.resolve();
		});
	return deferred.promise;
};

gulp.task("build", function () {
	buildBrowser();
	buildChrome();
	buildCordova();
	buildNode();
	buildPlugins();
	buildTests();
});



///////////
// Tests //
///////////

var buildTests = function () {
	console.log("Building tests");
	var deferred = Q.defer();
	gulp.src("test/unit/**/*.unit.js")
		.pipe(concat("asteroid.unit.js"))
		.pipe(gulp.dest("test/"))
		.on("end", function () {
			deferred.resolve();
		});
	return deferred.promise;
};

var runTests = function () {
	console.log("Running tests");
	var deferred = Q.defer();
	exec("node_modules/mocha/bin/mocha test/asteroid.unit.js -R json", function (err, stdout) {
		// Construct the html
		var res;
		try {
			res = JSON.parse(stdout);
		} catch (e) {
			deferred.resolve();
			return;
		}
		var report = "";
		report += "<br />";
		report += "<h2>Stats</h2>";
		report += "<p><span class=\"width-100\">Suites:</span><span class=\"text-right width-30\">" + res.stats.suites + "</span></p>";
		report += "<p><span class=\"width-100\">Tests:</span><span class=\"text-right width-30\">" + res.stats.tests + "</span></p>";
		report += "<p><span class=\"width-100 green\">Passes:</span><span class=\"text-right width-30 green\">" + res.stats.passes + "</span></p>";
		report += "<p><span class=\"width-100 red\">Failures:</span><span class=\"text-right width-30 red\">" + res.stats.failures + "</span></p>";
		report += "<p><span class=\"width-100\">Duration:</span><span class=\"text-right width-30\">" + res.stats.duration + "</span></p>";
		report += "<br />";
		if (res.stats.failures !== 0) {
			report += "<h2 class=\"red\">Failures</h2>";
			res.failures.forEach(function (failure) {
				report += "<p><b>" + failure.fullTitle + "</b></p>";
				report += "<p>" + failure.err.message + "</p>";
				report += "<br />";
			});
		}

		// Replace the existing report
		var html = fs.readFileSync("test/node.html", "utf8");
		var replaceBegin = html.indexOf("<body>") + 6;
		var replaceEnd = html.indexOf("</body>");
		html = html.slice(0, replaceBegin) + report + html.slice(replaceEnd);
		fs.writeFileSync("test/node.html", html, "utf8");
		deferred.resolve();
	});
	return deferred.promise;
};

gulp.task("default", function () {
	buildBrowser();
	buildCordova();
	buildChrome();
	buildNode();
	buildPlugins();
	buildTests();

	// Set up static file server
	var file = new static.Server("./test/", {cache: false});
	http.createServer(function (req, res) {
		req.on("end", function () {
			file.serve(req, res);
		}).resume();
	}).listen(8080, "0.0.0.0");

	// Set up WebSocket server to reload the browser
	var ws = {
		sockets: {},
		send: function (msg) {
			_.forEach(this.sockets, function (socket) {
				socket.send(msg);
			});
		}
	};
	http.createServer().on("upgrade", function (req, sock, body) {
		var key = crypto.randomBytes(16).toString("hex");
		if (WebSocket.isWebSocket(req)) {
			ws.sockets[key] = new WebSocket(req, sock, body).on("close", function () {
				delete ws.sockets[key];
			});
		}
	}).listen(8000, "0.0.0.0");

	// Watch for changes on the source files. When they happen,
	// rebuild them and reload the browser.
	var srcWatcher = gulp.watch("src/**/*.js");
	var srcHandler = _.throttle(function () {
		Q.all([
			buildBrowser(),
			buildCordova(),
			buildChrome(),
			buildNode(),
			buildPlugins()
		])
			.then(function () {
				return runTests();
			}).then(function () {
				ws.send("reload");
			});
	}, 1000);
	srcWatcher.on("change", srcHandler);

	// Watch for changes on the test files. When they happen,
	// rebuild them and reload the browser.
	var testWatcher = gulp.watch("test/unit/**/*.unit.js");
	var testHandler = _.throttle(function () {
		buildTests()
			.then(function () {
				return runTests();
			}).then(function () {
				ws.send("reload");
			});
	}, 1000);
	testWatcher.on("change", testHandler);

});
