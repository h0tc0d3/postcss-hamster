/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
require("colors");

const fs = require("fs"),
    path = require("path"),
    jsdiff = require("diff"),
    chai = require("chai"),
    assert = chai.assert,
    postcss = require("postcss"),
    stylefmt = require("stylefmt"),
    hamster = require("../index.js");

const parseCssTests = (src) => {

    let css = fs.readFileSync("./tests/data/" + src, "utf8");

    let tests = css.split(/\/\*\s*\htest\s*/i);

    return tests;

};

const fileHandle = (src) => {
    let dest = "./tests/data/" + path.basename(src, ".css") + ".res.css";
    // let css = fs.readFileSync("./tests/data/" + src, "utf8");
    // let ires = postcss([hamster, stylefmt]).process(css).then(
    //     result => fs.writeFileSync(dest, result.css),
    //     error => console.log("Rejected: " + error.message)
    // );

    fs.readFile("./tests/data/" + src, "utf8", (err, css) => {
        if (err) throw err;
        postcss([hamster, stylefmt]).process(css).then(
            result => fs.writeFileSync(dest, result.css),
            error => console.log(error.message + "\n" + error.stack)
        );
    });
};

const compare = (src, res) => {
    let result = {};
    src = src.replace(/\n\n$/, "\r\n\r\n");
    result.identical = src == res;
    if (!result.identical) {
        console.log(new Buffer(src, "binary").toString("hex") + "\n" + new Buffer(res, "binary").toString("hex"));
        result.diff = jsdiff.diffCss(src, res);
    }
    return result;
};

const viewDiff = (diff) => {
    let output = "";
    if (diff) {
        diff.forEach(part => {
            var color = part.added ? "green" : part.removed ? "red" : "gray";
            output += part.value[color];
        });
    }
    return output;
};

let htest = (css, results) => {
    let ctest = (description, test, res) => {
        it(description, (done) => {
            postcss([hamster, stylefmt]).process(test).then(
                result => {
                    let tresult = result.css.replace(/^\s*([\S\s]+)\s*$/m, "$1");
                    let tcompare = compare(res, tresult);
                    assert(tcompare.identical, viewDiff(tcompare.diff));
                },
                error => console.log(error.message + "\n" + error.stack)
            );
            done();
        });
    };

    for (let i = 1, testsSize = css.length; i < testsSize; i++) {
        let [description, test] = css[i].split(/\s*\*\/\s*/);
        let res = results[i].split(/\s*\*\/\s*/)[1];
        res = res.replace(/^\s*([\S\s]+)\s*$/m, "$1");
        ctest(description, test, res);
    }
};

describe("Baseline", () => {
    let css = parseCssTests("baseline.css");
    let results = parseCssTests("baseline.res.css");
    htest(css, results);
});

describe("Fontsizes", () => {
    let css = parseCssTests("fontsizes.css");
    let results = parseCssTests("fontsizes.res.css");
    htest(css, results);
});

describe("Reset", () => {
    let css = parseCssTests("reset.css");
    let results = parseCssTests("reset.res.css");
    htest(css, results);
});

describe("Normalize", () => {
    let css = parseCssTests("normalize.css");
    let results = parseCssTests("normalize.res.css");
    htest(css, results);
});

describe("Properties", () => {
    let css = parseCssTests("properties.css");
    let results = parseCssTests("properties.res.css");
    htest(css, results);
});

//fileHandle("properties.css");