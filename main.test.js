require("colors");

var fs = require("fs");
var postcss = require("postcss");
var stylefmt = require("stylefmt");
var hamster = require("./index.js");

const jsdiff = require("diff");

const parseCssTests = (src) => {

    let css = fs.readFileSync("./tests/" + src, "utf8");

    let tests = css.split(/\/\*\s*\htest\s*/i);

    return tests;

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

function scmpStr(str, refStr) {

    let len = refStr.length;

    if (len !== str.length) {
        return false;
    }

    for (var i = 0; i < len; i++) {

        if (str.charCodeAt(i) !== refStr.charCodeAt(i)) {
            return false;
        }
    }

    return true;
}

const compare = (tcss, tres, res) => {

    let result = {
        identical: false,
        diff: ""
    };

    tres = tres.replace(/\n\n$/, "\r\n\r\n");

    result.identical = scmpStr(tres, res);

    if (!result.identical) {
        //console.log(new Buffer(src, "binary").toString("hex") + "\n" + new Buffer(res, "binary").toString("hex"));
        //result.diff = "--------- CSS ---------\n" + tcss + "\n--------- RESULT ---------\n" + tres + "\n--------- TRESULT ---------\n" + res + "\n--------- END ---------";
        result.diff = viewDiff(jsdiff.diffCss(tres, res));
    }

    return result;
};


let htest = (name, css) => {

    let tests = parseCssTests(css + ".css");
    let results = parseCssTests(css + ".res.css");

    let ctest = (description, tcss, tres) => {

        test(name + ": " + description, done => {
            let errHandle = error => {
                done.fail(error.message + "\n" + error.stack);
            };
            return postcss([hamster, stylefmt]).process(tcss).then(
                result => {
                    let tresult = result.css.replace(/^\s*([\S\s]+)\s*$/m, "$1");
                    let tcompare = compare(tcss, tres, tresult);

                    if (tcompare.identical) {
                        expect(tcompare.identical).toBeTruthy();
                    } else {
                        done.fail(tcompare.diff);
                    }
                    done();
                },
                errHandle
            ).catch(errHandle);
        });
    };


    for (let i = 1, testsSize = tests.length; i < testsSize; i++) {

        let [description, tcss] = tests[i].split(/\s*\*\/\s*/);

        let res = results[i].split(/\s*\*\/\s*/)[1];

        res = res.replace(/^\s*([\S\s]+)\s*$/m, "$1");

        ctest(description, tcss, res);

    }
};

// htest("Baseline", "baseline");

htest("Font Sizes", "fontsizes");

// htest("Reset", "reset");

// htest("Normalize", "normalize");

// htest("Properties", "properties");