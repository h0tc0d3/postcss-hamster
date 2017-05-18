# PostCSS Hamster Framework

Vertical rhythm, Typogrаphy, Modular scale functions for CSS. Flexible system with high perfomance.

Support / Discussion: [Gitter](https://gitter.im/postcss-hamster/hamster).

Documentation: [RU](https://h0tc0d3.github.io/hamster/hamster-ru.html)

Big article with examples how to use Hamster Framework https://habrahabr.ru/post/328812/

# Installation

Be careful if you use precss and cssnext. You need to disbale "lookup" plugin in precss and "rem" in cssnext.
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