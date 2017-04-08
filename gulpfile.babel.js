//const fs = require("fs");
require("colors");
const run = require("gulp-run");
const runSequence = require("run-sequence");
const gulp = require("gulp");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const postcssgulp = require("gulp-postcss");
const precss = require("precss");
const cssnext = require("postcss-cssnext");

//const lost = require("lost");
//const cssnano = require("gulp-cssnano");

gulp.task("clean", () => {
    let del = require("del");
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
    let jsdoc = require("gulp-jsdoc3");
    let config = require("./jsdoc.json");
    gulp.src("./build/*.js", {
        read: false
    }).pipe(jsdoc(config, "./build/docs"));
});

gulp.task("css", function () {
    let hamster = require("./index.js");
    let processors = [precss({
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
    let del = require("del");
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
    return run("ava").exec();
});

gulp.task("test", function () {
    runSequence("clean", "compile", "htest");
});

gulp.task("build", function () {
    runSequence("clean", "compile", "htest", "build:docs", "css", "compile-web");
});

//gulp.watch('./src/*.css', ['css']);

gulp.task("default", ["css"]);