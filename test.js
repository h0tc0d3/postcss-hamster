import "colors";

import test from "ava";
import fs from "fs";
import path from "path";
// import diff from "diff";
import postcss from "postcss";
import stylefmt from "stylefmt";
import hamster from "./index.js";

const jsdiff = require("diff");

const parseCssTests = (src) => {

    let css = fs.readFileSync("./tests/" + src, "utf8");

    let tests = css.split(/\/\*\s*\htest\s*/i);

    return tests;

};

const fileHandle = (src) => {

    let dest = "./tests/" + path.basename(src, ".css") + ".res.css";

    fs.readFile("./tests/" + src, "utf8", (err, css) => {

        if (err) throw err;

        postcss([hamster, stylefmt]).process(css).then(

            result => fs.writeFileSync(dest, result.css),

            error => console.log(error.message + "\n" + error.stack)

        );

    });

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


const compare = (tcss, tres, res) => {

    let result = {};

    tres = tres.replace(/\n\n$/, "\r\n\r\n");

    result.identical = tres == res;

    if (!result.identical) {
        //console.log(new Buffer(src, "binary").toString("hex") + "\n" + new Buffer(res, "binary").toString("hex"));
        //result.diff = "--------- CSS ---------\n" + tcss + "\n--------- RESULT ---------\n" + tres + "\n--------- TRESULT ---------\n" + res + "\n--------- END ---------";
        result.diff = viewDiff(jsdiff.diffCss(tres, res));
    } else {

        result.diff = "";

    }

    return result;
};


let htest = (name, css) => {

    let tests = parseCssTests(css + ".css");
    let results = parseCssTests(css + ".res.css");

    let ctest = (description, tcss, tres) => {

        test(name + ": " + description, async t => {

            return postcss([hamster, stylefmt]).process(tcss).then(

                result => {

                    let tresult = result.css.replace(/^\s*([\S\s]+)\s*$/m, "$1");

                    let tcompare = compare(tcss, tres, tresult);

                    let pass = tcompare.identical;
                    let diff = tcompare.diff;

                    t.true(pass, diff);

                },

                error => {

                    t.fail(error.message + "\n" + error.stack);

                }
            );
        });
    };


    for (let i = 1, testsSize = tests.length; i < testsSize; i++) {

        let [description, tcss] = tests[i].split(/\s*\*\/\s*/);

        let res = results[i].split(/\s*\*\/\s*/)[1];

        res = res.replace(/^\s*([\S\s]+)\s*$/m, "$1");

        ctest(description, tcss, res);

    }
};

htest("Baseline", "baseline");

htest("Font Sizes", "fontsizes");

htest("Reset", "reset");

htest("Normalize", "normalize");

htest("Properties", "properties");