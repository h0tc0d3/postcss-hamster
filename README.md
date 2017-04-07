# PostCSS Hamster Framework

Support / Discussion: [Gitter](https://gitter.im/postcss-hamster/hamster).
Russian Documentation: (https://h0tc0d3.github.io/postcss-hamster/)

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

```
var gulp = require("gulp"),
		sourcemaps = require("gulp-sourcemaps"),
		postcssgulp = require("gulp-postcss"),
		precss = require("precss"),
		cssnext = require("postcss-cssnext"),
		hamster = require("postcss-hamster");

gulp.task("css", function () {
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

gulp.task("default", ["css"]);

```