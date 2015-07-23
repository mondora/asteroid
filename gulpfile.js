var gulp    = require("gulp");
var eslint  = require("gulp-eslint");
var mocha   = require("gulp-spawn-mocha");
var gutil   = require("gulp-util");
var path    = require("path");
var webpack = require("webpack");

var build = function (minify, callback) {
    webpack({
        entry: "./src/index.js",
        module: {
            loaders: [{
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel"
            }]
        },
        output: {
            libraryTarget: "umd",
            library: "Asteroid",
            path: path.join(__dirname, "/dist"),
            filename: (minify ? "asteroid.min.js" : "asteroid.js")
        },
        plugins: minify ? [
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ] : null
    }, function (err, stats) {
        if (err) {
            throw new gutil.PluginError("webpack", err);
        }
        gutil.log("[webpack]", stats.toString({colors: true}));
        callback();
    });
};

gulp.task("build", function (callback) {
    build(false, function () {
        build(true, callback);
    });
});

gulp.task("test", function () {
    return gulp.src(["test/unit/**/*.js"], {read: false})
        .pipe(mocha({
            compilers: "js:babel/register",
            env: {
                NODE_PATH: "./src/"
            },
            istanbul: true
        }));
});

gulp.task("lint", function () {
    return gulp.src(["src/**/*.js"])
        .pipe(eslint())
        .pipe(eslint.format());
});

gulp.task("default", ["test", "lint"], function () {
    return gulp.watch(["src/**/*.js", "test/unit/**/*.js"], ["test", "lint"]);
});
