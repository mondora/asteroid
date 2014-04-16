var gulp	= require("gulp");
var tinyLr	= require("tiny-lr");
var static	= require("node-static");
var http	= require("http");
var plugins	= require("gulp-load-plugins")();

var lrServer = tinyLr();


gulp.task("build", function () {
	gulp.src(["src/wrapper/head.js", "src/lib/*.js", "src/*.js", "src/wrapper/tail.js"])
		.pipe(plugins.concat("asteroid.js"))
		.pipe(gulp.dest("dist/"))
		.pipe(plugins.uglify())
		.pipe(plugins.rename("asteroid.min.js"))
		.pipe(gulp.dest("dist/"))
		.pipe(plugins.livereload(lrServer));
});

gulp.task("dev", function () {
	http.createServer(function (req, res) {
		var stServer = new static.Server("./demo", {cache: false});
		req.on("end", function () {
			stServer.serve(req, res);
		});
		req.resume();
	}).listen(8080);
	lrServer.listen(35729);
	gulp.watch("src/**/*.js", ["build"]);
});

gulp.task("default", function () {
	console.log("");
	console.log("Usage: gulp [TASK]");
	console.log("");
	console.log("Available tasks:");
	console.log("  build    build the sources into dist/asteroid.js and dist/asteroid.min.js");
	console.log("");
});
