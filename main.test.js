var fs = require("fs");
var postcss = require("postcss");
// var postcss = require("../postcss/build/lib/postcss.js");
var hamster = require("./index.js");

function loadFile(src){
    return fs.readFileSync("./tests/" + src, "utf8");
}
function parseCssTests(css){
    return css.split(/\/\*\s*htest\s*/i);
}

function htest (name, css) {

    let tests = loadFile(css + ".css");
    let results = parseCssTests(loadFile(css + ".res.css"));

    let ctest = (description, res, refRes) => {
        test(name + ": " + description, () => {
            expect(res).toEqual(refRes);
        });
    };

    let cres = parseCssTests(postcss([hamster]).process(tests).css);

    for (let i = 1, testsSize = results.length; i < testsSize; i++) {

        let [description, css] = cres[i].split(/\s*\*\/\s*/);

        let res = results[i].split(/\s*\*\/\s*/)[1];

        ctest(description, css, res);

    }
}

htest("Baseline", "baseline");

htest("Font Sizes", "fontsizes");

htest("Reset", "reset");

htest("Normalize", "normalize");

htest("Sanitize", "sanitize");

htest("Properties", "properties");

htest("Copy & Paste", "copypaste");