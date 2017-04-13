//var fs = require("fs");
var run = require("gulp-run");
var runSequence = require("run-sequence");
var gulp = require("gulp");
var babel = require("gulp-babel");
var sourcemaps = require("gulp-sourcemaps");
var postcssgulp = require("gulp-postcss");
var precss = require("precss");
var cssnext = require("postcss-cssnext");

//var lost = require("lost");
//var cssnano = require("gulp-cssnano");

gulp.task("clean", () => {
    var del = require("del");
    return del(["build/"]);
});


gulp.task("compile", () => {
    return gulp.src("src/*.es6")
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("build"));
});

gulp.task("build:docs", () => {
    var jsdoc = require("gulp-jsdoc3");
    var config = require("./jsdoc.json");
    gulp.src("./build/*.js", {
        read: false
    }).pipe(jsdoc(config, "./build/docs"));
});

gulp.task("css", function () {
    var hamster = require("./index.js");
    var processors = [precss({
        "lookup": false
    }), hamster, cssnext({
        browsers: ["> 0.5%"],
        features: {
            "rem": false
        }
    })];

    return gulp.src("./web/src/style.css")
        .pipe(sourcemaps.init())
        .pipe(postcssgulp(processors))
        // .pipe(cssnano())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./web/css"));
});


gulp.task("clean-web", () => {
    var del = require("del");
    return del(["build/web"]);
});

gulp.task("compile-web", () => {
    return run("cross-env NODE_ENV=production webpack").exec();
});

// gulp.task("web-images", () => {
//     return gulp.src("./web/images/*")
//         .pipe(gulp.dest("./build/web/images/"));
// });

gulp.task("build-web", () => {
    runSequence("css", "clean-web", "compile-web");
});

gulp.task("htest", function () {
    var ava = require("gulp-ava");
    return gulp.src("test.js")
		.pipe(ava({verbose: true}));
});

gulp.task("test", function () {
    runSequence("clean", "compile", "htest");
});

gulp.task("build", function () {
    runSequence("clean", "compile", "htest", "build:docs", "css", "compile-web");
});

//gulp.watch('./src/*.css', ['css']);

gulp.task("default", ["css"]);