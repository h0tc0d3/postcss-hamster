var postcss = require("postcss");
// var postcss = require("../postcss/build/lib/postcss.js");
var hamster = require("./build/Hamster.js");

module.exports = postcss.plugin("postcss-hamster", function (options) {
    return hamster(options);
});