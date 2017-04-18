var postcss = require("postcss");
var hamster = require("./build/Hamster.js");

module.exports = postcss.plugin("postcss-hamster", function (options) {
    return hamster(options);
});