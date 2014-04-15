var gulp		= require("gulp");
var plugins		= require("gulp-load-plugins")();

gulp.task("build", function () {
	gulp.src(["src/wrapper/head.js", "src/lib/*.js", "src/*.js", "src/wrapper/tail.js"])
		.pipe(plugins.concat("asteroid.js"))
		.pipe(gulp.dest("dist/"))
		.pipe(plugins.uglify())
		.pipe(plugins.rename("asteroid.min.js"))
		.pipe(gulp.dest("dist/"));
});

gulp.task("default", function () {
	console.log("");
	console.log("Usage: gulp [TASK]");
	console.log("");
	console.log("Available tasks:");
	console.log("  build    build the sources into dist/asteroid.js and dist/asteroid.min.js");
	console.log("");
});
