# PostCSS Hamster Framework

Typography, Vertical Rhythm, Modular Scale, Fluid Responsive Typography functions for CSS. Flexible system with high performance.

Hamster Framework - it's the language of macros and functions, which in the future can be easily transformed into css code and any units. Easy adapted to any user browser resolution.

Support / Discussion: [Gitter](https://gitter.im/postcss-hamster/hamster).

Documentation: [RU](https://h0tc0d3.github.io/hamster/hamster-ru.html)

Big article with examples how to use Hamster Framework [RUSSIAN](https://habrahabr.ru/post/328812/)

CSS Code: [Examples](https://github.com/h0tc0d3/postcss-hamster/tree/master/web/src)

# Installation

Be careful if you use precss and cssnext. You need to disable "lookup" plugin in precss and "rem" in cssnext.
They interfere and the hamster plug-in expands their functionality.

```
npm install postcss-hamster
```

## PostCSS

```

var fs = require("fs"),
    postcss = require("postcss"),
    hamster = require("postcss-hamster");

fs.readFile("filename.css", "utf8", (err, css) => {
    postcss([hamster]).process(css).then(result => {
        fs.writeFileSync("outputfilename.css", result.css);
    });
});

```

## Gulp

If you are using postcss-gulp then install version 6.4.0. postcss-gulp@7.0.0 + precss have  bug, and @import can't work correctly.

```
npm install gulp-postcss@6.4.0
```

```

var gulp = require("gulp"),
    sourcemaps = require("gulp-sourcemaps"),
    postcssgulp = require("gulp-postcss"),
    precss = require("precss"),
    autoprefixer = require("autoprefixer");
    hamster = require("postcss-hamster");

gulp.task("css", function () {
  
    var processors = [precss({
        "lookup": false
    }), hamster, autoprefixer({
        browsers: ["> 0.5%"]
    })];

    return gulp.src("./web/src/style.css")
       .pipe(sourcemaps.init())
       .pipe(postcssgulp(processors))
       //.pipe(cssnano())
       .pipe(sourcemaps.write("."))
       .pipe(gulp.dest("./web/css"));
});

gulp.task("default", ["css"]);

```