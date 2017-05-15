var fs = require("fs"),
    postcss = require("postcss"),
    // postcss = require("../postcss/build/lib/postcss.js");
    hamster = require("./index.js");

var fileHandle = (src) => {

    let dest = "./tests/" + src + ".res.css";

    fs.readFile("./tests/" + src + ".css", "utf8", (err, css) => {

        if (err) throw err;

        postcss([hamster]).process(css).then(

            result => fs.writeFileSync(dest, result.css),

            error => console.log(error.message + "\n" + error.stack)

        );

    });

};

var args = process.argv.slice(2);
fileHandle(args[0]);