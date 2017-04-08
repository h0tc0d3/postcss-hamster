"use strict";

exports.__esModule = true;

var _FontSizes = require("./FontSizes");

var _FontSizes2 = _interopRequireDefault(_FontSizes);

var _VerticalRhythm = require("./VerticalRhythm");

var _PngImage = require("./PngImage");

var _PngImage2 = _interopRequireDefault(_PngImage);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _postcss = require("postcss");

var _postcss2 = _interopRequireDefault(_postcss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module Hamster
 * 
 * @description PostCSS Hamster framework main functionality.
 *
 * @version 1.0
 * @author Grigory Vasilyev <postcss.hamster@gmail.com> https://github.com/h0tc0d3
 * @copyright Copyright (c) 2017, Grigory Vasilyev
 * @license Apache License, Version 2.0, http://www.apache.org/licenses/LICENSE-2.0 
 * 
 */

var hamster = function hamster() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


    //Default Global Settings
    var globalSettings = {

        "font-size": "16px",
        "line-height": "1.5",
        "unit": "em",
        "px-fallback": "true",
        "px-baseline": "false",
        "font-ratio": "0",

        "properties": "inline",

        "min-line-padding": "2px",
        "round-to-half-line": "false",

        "ruler": "true",
        "ruler-style": "always ruler-debug",
        "ruler-icon-position": "top: 1.5em;left: 1.5em;",
        "ruler-icon-colors": "#cccccc #44576a",
        "ruler-icon-size": "24px",
        "ruler-color": "rgba(19, 134, 191, .8)",
        "ruler-thickness": "1",
        "ruler-background": "gradient",
        "ruler-output": "base64",
        "ruler-pattern": "1 0 0 0",
        "ruler-scale": "1",

        "browser-font-size": "16px",
        "legacy-browsers": "true",
        "remove-comments": "false"

    };

    var globalKeys = ["unit", "px-fallback", "px-baseline", "font-ratio", "properties", "round-to-half-line", "ruler", "ruler-style", "ruler-background", "ruler-output", "legacy-browsers", "remove-comments"];

    var helpers = {
        "reset": _fs2.default.readFileSync(_path2.default.resolve(__dirname, "../helpers/reset.css"), "utf8"),
        "normalize": _fs2.default.readFileSync(_path2.default.resolve(__dirname, "../helpers/normalize.css"), "utf8"),
        "nowrap": "white-space: nowrap;",
        "forcewrap": "white-space: pre;" + "white-space: pre-line;" + "white-space: -pre-wrap;" + "white-space: -o-pre-wrap;" + "white-space: -moz-pre-wrap;" + "white-space: -hp-pre-wrap;" + "white-space: pre-wrap;" + "word-wrap: break-word;",
        "ellipsis": "overflow: hidden;" + "text-overflow: ellipsis;"
    };

    // Current Variables
    var currentSettings = {};
    var currentSettingsRegexp = void 0;
    //Current FontSizes
    var currentFontSizes = "";
    // font Sizes
    var fontSizesCollection = void 0;
    // Vertical Rhythm Calculator
    var rhythmCalculator = void 0;
    // Last Css File
    // let lastFile;

    // let vm = new VirtualMachine();
    // fontSize property Regexp
    var fontSizeRegexp = new RegExp("fontSize\\s+([\\-\\$\\@0-9a-zA-Z]+)", "i");

    // lineHeight property Regexp
    var lineRegexp = new RegExp("(lineHeight|spacing|leading)\\((.*?)\\)", "i");

    // Copy Values from object 2 to object 1;
    var extend = function extend(object1, object2) {

        for (var i = 0, keys = Object.keys(object2), keysSize = keys.length; i < keysSize; i++) {
            var key = keys[i];
            object1[key] = object2[key];
        }
        return object1;
    };

    if (options != null) {
        extend(globalSettings, options);
    }

    var toCamelCase = function toCamelCase(value) {
        return value.toLowerCase().replace(/^[^a-z0-9]*(.*)[^a-z0-9]*$/, "$1").replace(/[^a-z0-9]+([a-z0-9])/g, function (match, letter) {
            return letter.toUpperCase();
        });
    };

    // Init current Settings
    var initSettings = function initSettings() {

        // Add fontSizes
        if ("font-sizes" in globalSettings) {
            currentFontSizes = globalSettings["font-sizes"];
        }

        if ("font-sizes" in currentSettings) {
            currentFontSizes = currentFontSizes + ", " + currentSettings["font-sizes"];
        }

        // ToLowerCase Current Settings
        for (var i = 0, keysSize = globalKeys.length; i < keysSize; i++) {
            var key = globalKeys[i];
            currentSettings[key] = currentSettings[key].toLowerCase();
        }

        fontSizesCollection = new _FontSizes2.default(currentSettings);
        rhythmCalculator = new _VerticalRhythm.VerticalRhythm(currentSettings);
        fontSizesCollection.addFontSizes(currentFontSizes, rhythmCalculator);
        currentSettingsRegexp = new RegExp("\\@(" + Object.keys(currentSettings).join("|").replace(/(\-|\_)/g, "\\$1") + ")", "i");
    };

    var walkDecls = function walkDecls(node) {
        node.walkDecls(function (decl) {

            var found = void 0;

            // Replace Variables with values
            while (found = decl.value.match(currentSettingsRegexp)) {
                var variable = found[1];
                decl.value = decl.value.replace(currentSettingsRegexp, currentSettings[variable]);
            }

            // Replace Font Size
            while (found = decl.value.match(fontSizeRegexp)) {
                var _found$1$split = found[1].split(/\$/i),
                    fontSize = _found$1$split[0],
                    sizeUnit = _found$1$split[1];

                sizeUnit = sizeUnit != null ? sizeUnit.toLowerCase() : null;

                var size = fontSizesCollection.getSize(fontSize);
                // Write font size
                if (sizeUnit != null && (sizeUnit == "em" || sizeUnit == "rem")) {

                    decl.value = decl.value.replace(fontSizeRegexp, (0, _VerticalRhythm.formatValue)(size.rel) + sizeUnit);
                } else if (sizeUnit != null && sizeUnit == "px") {

                    decl.value = decl.value.replace(fontSizeRegexp, (0, _VerticalRhythm.formatInt)(size.px) + "px");
                } else {

                    var cfsize = currentSettings["unit"] == "px" ? (0, _VerticalRhythm.formatInt)(size.px) : (0, _VerticalRhythm.formatValue)(size.rel);

                    decl.value = decl.value.replace(fontSizeRegexp, cfsize + currentSettings["unit"]);
                }
            }

            // Adjust Font Size
            if (decl.prop == "adjust-font-size") {
                var _decl$value$split = decl.value.split(/\s+/),
                    fontSize = _decl$value$split[0],
                    lines = _decl$value$split[1],
                    baseFontSize = _decl$value$split[2];

                var fontSizeUnit = fontSize.match(/(px|em|rem)$/i)[0].toLowerCase();

                fontSize = rhythmCalculator.convert(fontSize, fontSizeUnit, null, baseFontSize) + currentSettings["unit"];

                decl.value = fontSize;

                var lineHeight = rhythmCalculator.lineHeight(fontSize, lines, baseFontSize);

                var lineHeightDecl = _postcss2.default.decl({
                    prop: "line-height",
                    value: lineHeight,
                    source: decl.source
                });

                decl.prop = "font-size";
                decl.parent.insertAfter(decl, lineHeightDecl);
            }
            // lineHeight, spacing, leading
            while (found = decl.value.match(lineRegexp)) {

                var property = found[1].toLowerCase(); // spacing or lineHeight
                var parameters = found[2].split(/\s*\,\s*/);
                var _lineHeight = "";
                for (var i = 0, parametersSize = parameters.length; i < parametersSize; i++) {
                    var _parameters$i$split = parameters[i].split(/\s+/),
                        value = _parameters$i$split[0],
                        _fontSize = _parameters$i$split[1];

                    if (_fontSize == null) {
                        decl.parent.walkDecls("font-size", function (fsdecl) {
                            _fontSize = fsdecl.value;
                        });
                    }

                    if (_fontSize == null) {
                        _fontSize = currentSettings["font-size"];
                    }

                    if (property == "lineheight") {
                        _lineHeight += rhythmCalculator.lineHeight(_fontSize, value) + " ";
                    } else if (property == "spacing") {
                        _lineHeight += rhythmCalculator.lineHeight(_fontSize, value, null, true) + " ";
                    } else if (property == "leading") {
                        _lineHeight += rhythmCalculator.leading(value, _fontSize) + " ";
                    }
                }
                decl.value = decl.value.replace(found[0], _lineHeight.replace(/\s+$/, ""));
            }
            // rem fallback
            if (currentSettings["px-fallback"] == "true" && decl.value.match(/[0-9\.]+rem/i)) {
                decl.parent.insertBefore(decl, decl.clone({
                    value: rhythmCalculator.remFallback(decl.value),
                    source: decl.source
                }));
            }
        });
    };

    return function (css) {

        // Extend Nodes
        var extendNodes = {};

        css.walk(function (node) {
            // if (lastFile != node.source.input.file) {
            // 	lastFile = node.source.input.file;
            // }

            if (node.type == "atrule") {

                var rule = node;

                if (rule.name == "hamster") {

                    if (rule.params != "end") {
                        // Add Global Variables
                        rule.walkDecls(function (decl) {
                            globalSettings[decl.prop] = decl.value;
                        });
                    }

                    // Add fontSizes
                    if ("font-sizes" in globalSettings) {
                        currentFontSizes = globalSettings["font-sizes"];
                    }
                    // Reset current variables
                    currentSettings = extend({}, globalSettings);

                    // Init current Settings
                    initSettings();

                    // Remove Rule Hamster
                    rule.remove();
                } else if (rule.name == "!hamster") {

                    //currentSettings = extend({}, globalSettings);

                    rule.walkDecls(function (decl) {
                        currentSettings[decl.prop] = decl.value;
                    });

                    // Init current Settings
                    initSettings();

                    rule.remove();
                } else if (rule.name == "baseline") {

                    var fontSize = parseInt(currentSettings["font-size"]);
                    var browserFontSize = parseInt(currentSettings["browser-font-size"]);

                    var lineHeight = rhythmCalculator.lineHeight(fontSize + "px");

                    // baseline font size
                    var fontSizeDecl = null;

                    if (currentSettings["px-baseline"] == "true" || currentSettings["unit"] == "px" && currentSettings["legacy-browsers"] != "true") {

                        fontSizeDecl = _postcss2.default.decl({
                            prop: "font-size",
                            value: fontSize + "px",
                            source: rule.source
                        });
                    } else {

                        var relativeSize = 100 * fontSize / browserFontSize;

                        fontSizeDecl = _postcss2.default.decl({
                            prop: "font-size",
                            value: (0, _VerticalRhythm.formatValue)(relativeSize) + "%",
                            source: rule.source
                        });
                    }

                    var lineHeightDecl = _postcss2.default.decl({
                        prop: "line-height",
                        value: lineHeight,
                        source: rule.source
                    });

                    if (rule.params.match(/\s*html\s*/)) {

                        var htmlRule = _postcss2.default.rule({
                            selector: "html",
                            source: rule.source
                        });

                        htmlRule.append(fontSizeDecl);
                        htmlRule.append(lineHeightDecl);

                        rule.parent.insertAfter(rule, htmlRule);

                        if (currentSettings["unit"] == "px" && currentSettings["legacy-browsers"] == "true") {
                            var asteriskHtmlRule = _postcss2.default.rule({
                                selector: "* html",
                                source: rule.source
                            });
                            asteriskHtmlRule.append(lineHeightDecl);
                            rule.parent.insertAfter(rule, asteriskHtmlRule);
                        }
                    } else {

                        rule.parent.insertAfter(rule, lineHeightDecl);
                        rule.parent.insertAfter(rule, fontSizeDecl);

                        if (currentSettings["unit"] == "rem" && currentSettings["px-fallback"] == "true") {

                            rule.parent.insertBefore(lineHeightDecl, _postcss2.default.decl({
                                prop: "line-height",
                                value: rhythmCalculator.remFallback(lineHeight),
                                source: rule.source
                            }));
                        }
                    }

                    rule.remove();
                } else if (rule.name == "ruler") {

                    var rulerIconPosition = currentSettings["ruler-icon-position"].replace(/(\'|\")/g, "").replace(/\;/g, ";\n");

                    var _lineHeight2 = currentSettings["line-height"].match(/px$/i) ? currentSettings["line-height"] : currentSettings["line-height"] + "em";

                    //let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M18 24c-0.3 0-0.548-0.246-0.548-0.546V18c0-0.3 0.248-0.546 0.548-0.546h5.452  C23.754 17.454 24 17.7 24 18v5.454c0 0.3-0.246 0.546-0.548 0.546H18z M9.271 24c-0.298 0-0.543-0.246-0.543-0.546V18  c0-0.3 0.245-0.546 0.543-0.546h5.457c0.3 0 0.543 0.246 0.543 0.546v5.454c0 0.3-0.243 0.546-0.543 0.546H9.271z M0.548 24  C0.246 24 0 23.754 0 23.454V18c0-0.3 0.246-0.546 0.548-0.546H6c0.302 0 0.548 0.246 0.548 0.546v5.454C6.548 23.754 6.302 24 6 24  H0.548z M18 15.271c-0.3 0-0.548-0.244-0.548-0.542V9.272c0-0.299 0.248-0.545 0.548-0.545h5.452C23.754 8.727 24 8.973 24 9.272  v5.457c0 0.298-0.246 0.542-0.548 0.542H18z M9.271 15.271c-0.298 0-0.543-0.244-0.543-0.542V9.272c0-0.299 0.245-0.545 0.543-0.545  h5.457c0.3 0 0.543 0.246 0.543 0.545v5.457c0 0.298-0.243 0.542-0.543 0.542H9.271z M0.548 15.271C0.246 15.271 0 15.026 0 14.729  V9.272c0-0.299 0.246-0.545 0.548-0.545H6c0.302 0 0.548 0.246 0.548 0.545v5.457c0 0.298-0.246 0.542-0.548 0.542H0.548z M18 6.545  c-0.3 0-0.548-0.245-0.548-0.545V0.545C17.452 0.245 17.7 0 18 0h5.452C23.754 0 24 0.245 24 0.545V6c0 0.3-0.246 0.545-0.548 0.545  H18z M9.271 6.545C8.974 6.545 8.729 6.3 8.729 6V0.545C8.729 0.245 8.974 0 9.271 0h5.457c0.3 0 0.543 0.245 0.543 0.545V6  c0 0.3-0.243 0.545-0.543 0.545H9.271z M0.548 6.545C0.246 6.545 0 6.3 0 6V0.545C0 0.245 0.246 0 0.548 0H6  c0.302 0 0.548 0.245 0.548 0.545V6c0 0.3-0.246 0.545-0.548 0.545H0.548z%27%2F%3E%3C%2Fsvg%3E";
                    var svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M0,6c0,0.301,0.246,0.545,0.549,0.545h22.906C23.756,6.545,24,6.301,24,6V2.73c0-0.305-0.244-0.549-0.545-0.549H0.549  C0.246,2.182,0,2.426,0,2.73V6z M0,13.637c0,0.297,0.246,0.545,0.549,0.545h22.906c0.301,0,0.545-0.248,0.545-0.545v-3.273  c0-0.297-0.244-0.545-0.545-0.545H0.549C0.246,9.818,0,10.066,0,10.363V13.637z M0,21.27c0,0.305,0.246,0.549,0.549,0.549h22.906  c0.301,0,0.545-0.244,0.545-0.549V18c0-0.301-0.244-0.545-0.545-0.545H0.549C0.246,17.455,0,17.699,0,18V21.27z%27%2F%3E%3C%2Fsvg%3E";
                    //let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 32 32%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M28,20h-4v-8h4c1.104,0,2-0.896,2-2s-0.896-2-2-2h-4V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v4h-8V4c0-1.104-0.896-2-2-2  S8,2.896,8,4v4H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h4v8H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h4v4c0,1.104,0.896,2,2,2s2-0.896,2-2v-4  h8v4c0,1.104,0.896,2,2,2s2-0.896,2-2v-4h4c1.104,0,2-0.896,2-2S29.104,20,28,20z M12,20v-8h8v8H12z%27%2F%3E%3C%2Fsvg%3E";
                    var gthickness = parseFloat(currentSettings["ruler-thickness"]);

                    var background = "";

                    if (currentSettings["ruler-background"] == "png") {

                        var imageHeight = currentSettings["line-height"].match(/px$/) ? parseInt(currentSettings["line-height"]) : (parseFloat(currentSettings["line-height"]) * parseFloat(currentSettings["font-size"])).toFixed(0);
                        var pattern = currentSettings["ruler-pattern"].split(/\s+/);
                        var image = new _PngImage2.default();
                        image.rulerMatrix(imageHeight, currentSettings["ruler-color"], pattern, gthickness, currentSettings["ruler-scale"]);
                        if (currentSettings["ruler-output"] != "base64") {
                            image.getFile(currentSettings["ruler-output"]);
                            background = "background-image: url(\"../" + currentSettings["ruler-output"] + "\");" + "background-position: left top;" + "background-repeat: repeat;" + "background-size: " + pattern.length + "px " + imageHeight + "px;";
                        } else {
                            background = "background-image: url(\"data:image/png;base64," + image.getBase64() + "\");" + "background-position: left top;" + "background-repeat: repeat;" + "background-size: " + pattern.length + "px " + imageHeight + "px;";
                        }
                    } else {

                        gthickness = gthickness * 3;

                        background = "background-image: linear-gradient(to top, " + currentSettings["ruler-color"] + " " + gthickness + "%, transparent " + gthickness + "%);" + "background-size: 100% " + _lineHeight2 + ";";
                    }

                    var ruler = "position: absolute;" + "left: 0;" + "top: 0;" + "margin: 0;" + "padding: 0;" + "width: 100%;" + "height: 100%;" + "z-index: 9900;" + background;

                    var iconSize = currentSettings["ruler-icon-size"];

                    var _currentSettings$rule = currentSettings["ruler-style"].split(/\s+/),
                        style = _currentSettings$rule[0],
                        rulerClass = _currentSettings$rule[1];

                    var _currentSettings$rule2 = currentSettings["ruler-icon-colors"].split(/\s+/),
                        color = _currentSettings$rule2[0],
                        hoverColor = _currentSettings$rule2[1];

                    var rulerRule = null;

                    if (style == "switch") {

                        rulerRule = _postcss2.default.parse("." + rulerClass + "{" + "display: none;" + ruler + "}" + "input[id=\"" + rulerClass + "\"] {" + "display:none;" + "}" + "input[id=\"" + rulerClass + "\"] + label {" + "z-index: 9999;" + "display: inline-block;" + "position: absolute;" + rulerIconPosition + "margin: 0;" + "padding: 0;" + "width: " + iconSize + ";" + "height: " + iconSize + ";" + "cursor: pointer;" + "background-image: url(\"" + svg.replace(/\{color\}/, escape(color)) + "\");" + "}" + "input[id=\"" + rulerClass + "\"]:checked + label, input[id=\"" + rulerClass + "\"]:hover + label {" + "background-image: url(\"" + svg.replace(/\{color\}/, escape(hoverColor)) + "\");" + "}" + "input[id=\"" + rulerClass + "\"]:checked ~ ." + rulerClass + "{" + "display: block;" + "}");
                    } else if (style == "hover") {

                        rulerRule = _postcss2.default.parse("." + rulerClass + "{" + "position: absolute;" + rulerIconPosition + "margin: 0;" + "padding: 0;" + "width: " + iconSize + ";" + "height: " + iconSize + ";" + "background-image: url(\"" + svg.replace(/\{color\}/, escape(color)) + "\");" + "transition: background-image 0.5s ease-in-out;" + "}" + "." + rulerClass + ":hover" + "{" + "cursor: pointer;" + ruler + "}");
                    } else if (style == "always") {

                        rulerRule = _postcss2.default.parse("." + rulerClass + "{\n" + ruler + "}\n");
                    }

                    if (rulerRule != null) {
                        rulerRule.source = rule.source;
                        rule.parent.insertBefore(rule, rulerRule);
                    }

                    rule.remove();
                } else if (rule.name.match(/^(ellipsis|nowrap|forcewrap)$/i)) {

                    var property = rule.name.toLowerCase();

                    var decls = helpers[property];

                    if (property == "ellipsis" && rule.params == "true") {
                        decls = helpers["nowrap"] + decls;
                    }

                    if (currentSettings["properties"] == "inline") {

                        var idecls = _postcss2.default.parse(decls);
                        rule.parent.insertBefore(rule, idecls);
                    } else if (currentSettings["properties"] == "extend") {

                        var extendName = toCamelCase(property + " " + rule.params);

                        if (extendNodes[extendName] == null) {

                            // Save extend info
                            extendNodes[extendName] = {
                                selector: rule.parent.selector,
                                decls: decls,
                                parents: [rule.parent],
                                prev: rule.prev(),
                                source: rule.source,
                                count: 1
                            };
                        } else {

                            //Append selector and update counter
                            extendNodes[extendName].selector = extendNodes[extendName].selector + ", " + rule.parent.selector;
                            extendNodes[extendName].parents.push(rule.parent);
                            extendNodes[extendName].count++;
                        }
                    }

                    rule.remove();
                } else if (rule.name.match(/^(reset|normalize)$/i)) {
                    var _property = rule.name.toLowerCase();
                    var rules = _postcss2.default.parse(helpers[_property]);
                    rules.source = rule.source;
                    rule.parent.insertAfter(rule, rules);
                    rule.remove();
                }
                // Walk in media queries
                node.walk(function (child) {

                    if (child.type == "rule") {
                        // Walk decls in rule
                        walkDecls(child);
                    }
                });
                // else if (rule.name == "js") {

                //     let jcss = rule.toString();
                //     // let code = jcss.replace(/\@js\s*\{([\s\S]+)\}$/i, "$1");

                //     console.log(jcss);
                //     // rulerRule.source = rule.source;
                //     // rule.parent.insertBefore(rule, rulerRule);
                //     rule.remove();
                // }
            } else if (node.type == "rule") {

                // Walk decls in rule
                walkDecls(node);
            } else if (currentSettings["remove-comments"] == "true" && node.type == "comment") {
                node.remove();
            }
        });

        // Append Extends to CSS
        for (var i = 0, keys = Object.keys(extendNodes), keysSize = keys.length; i < keysSize; i++) {
            var key = keys[i];
            if (extendNodes[key].count > 1) {
                var rule = _postcss2.default.parse(extendNodes[key].selector + "{" + extendNodes[key].decls + "}");
                rule.source = extendNodes[key].source;

                css.insertBefore(extendNodes[key].parents[0], rule);
            } else {
                var decls = _postcss2.default.parse(extendNodes[key].decls);
                decls.source = extendNodes[key].source;
                extendNodes[key].parents[0].insertAfter(extendNodes[key].prev, decls);
            }

            // Remove unused parent nodes.
            for (var j = 0, parents = extendNodes[key].parents.length; j < parents; j++) {
                if (extendNodes[key].parents[j].nodes.length == 0) {
                    extendNodes[key].parents[j].remove();
                }
            }
        }
    };
};
// import VirtualMachine from "./VirtualMachine";

exports.default = hamster;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhhbXN0ZXIiLCJvcHRpb25zIiwiZ2xvYmFsU2V0dGluZ3MiLCJnbG9iYWxLZXlzIiwiaGVscGVycyIsInJlYWRGaWxlU3luYyIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJjdXJyZW50U2V0dGluZ3MiLCJjdXJyZW50U2V0dGluZ3NSZWdleHAiLCJjdXJyZW50Rm9udFNpemVzIiwiZm9udFNpemVzQ29sbGVjdGlvbiIsInJoeXRobUNhbGN1bGF0b3IiLCJmb250U2l6ZVJlZ2V4cCIsIlJlZ0V4cCIsImxpbmVSZWdleHAiLCJleHRlbmQiLCJvYmplY3QxIiwib2JqZWN0MiIsImkiLCJrZXlzIiwiT2JqZWN0Iiwia2V5c1NpemUiLCJsZW5ndGgiLCJrZXkiLCJ0b0NhbWVsQ2FzZSIsInZhbHVlIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwibWF0Y2giLCJsZXR0ZXIiLCJ0b1VwcGVyQ2FzZSIsImluaXRTZXR0aW5ncyIsImFkZEZvbnRTaXplcyIsImpvaW4iLCJ3YWxrRGVjbHMiLCJub2RlIiwiZm91bmQiLCJkZWNsIiwidmFyaWFibGUiLCJzcGxpdCIsImZvbnRTaXplIiwic2l6ZVVuaXQiLCJzaXplIiwiZ2V0U2l6ZSIsInJlbCIsInB4IiwiY2ZzaXplIiwicHJvcCIsImxpbmVzIiwiYmFzZUZvbnRTaXplIiwiZm9udFNpemVVbml0IiwiY29udmVydCIsImxpbmVIZWlnaHQiLCJsaW5lSGVpZ2h0RGVjbCIsInNvdXJjZSIsInBhcmVudCIsImluc2VydEFmdGVyIiwicHJvcGVydHkiLCJwYXJhbWV0ZXJzIiwicGFyYW1ldGVyc1NpemUiLCJmc2RlY2wiLCJsZWFkaW5nIiwiaW5zZXJ0QmVmb3JlIiwiY2xvbmUiLCJyZW1GYWxsYmFjayIsImNzcyIsImV4dGVuZE5vZGVzIiwid2FsayIsInR5cGUiLCJydWxlIiwibmFtZSIsInBhcmFtcyIsInJlbW92ZSIsInBhcnNlSW50IiwiYnJvd3NlckZvbnRTaXplIiwiZm9udFNpemVEZWNsIiwicmVsYXRpdmVTaXplIiwiaHRtbFJ1bGUiLCJzZWxlY3RvciIsImFwcGVuZCIsImFzdGVyaXNrSHRtbFJ1bGUiLCJydWxlckljb25Qb3NpdGlvbiIsInN2ZyIsImd0aGlja25lc3MiLCJwYXJzZUZsb2F0IiwiYmFja2dyb3VuZCIsImltYWdlSGVpZ2h0IiwidG9GaXhlZCIsInBhdHRlcm4iLCJpbWFnZSIsInJ1bGVyTWF0cml4IiwiZ2V0RmlsZSIsImdldEJhc2U2NCIsInJ1bGVyIiwiaWNvblNpemUiLCJzdHlsZSIsInJ1bGVyQ2xhc3MiLCJjb2xvciIsImhvdmVyQ29sb3IiLCJydWxlclJ1bGUiLCJwYXJzZSIsImVzY2FwZSIsImRlY2xzIiwiaWRlY2xzIiwiZXh0ZW5kTmFtZSIsInBhcmVudHMiLCJwcmV2IiwiY291bnQiLCJwdXNoIiwicnVsZXMiLCJjaGlsZCIsImoiLCJub2RlcyJdLCJtYXBwaW5ncyI6Ijs7OztBQVlBOzs7O0FBRUE7O0FBTUE7Ozs7QUFHQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQTFCQTs7Ozs7Ozs7Ozs7O0FBNEJBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxHQUFvQjtBQUFBLFFBQW5CQyxPQUFtQix1RUFBVCxJQUFTOzs7QUFFaEM7QUFDQSxRQUFJQyxpQkFBaUI7O0FBRWpCLHFCQUFhLE1BRkk7QUFHakIsdUJBQWUsS0FIRTtBQUlqQixnQkFBUSxJQUpTO0FBS2pCLHVCQUFlLE1BTEU7QUFNakIsdUJBQWUsT0FORTtBQU9qQixzQkFBYyxHQVBHOztBQVNqQixzQkFBYyxRQVRHOztBQVdqQiw0QkFBb0IsS0FYSDtBQVlqQiw4QkFBc0IsT0FaTDs7QUFjakIsaUJBQVMsTUFkUTtBQWVqQix1QkFBZSxvQkFmRTtBQWdCakIsK0JBQXVCLHlCQWhCTjtBQWlCakIsNkJBQXFCLGlCQWpCSjtBQWtCakIsMkJBQW1CLE1BbEJGO0FBbUJqQix1QkFBZSx3QkFuQkU7QUFvQmpCLDJCQUFtQixHQXBCRjtBQXFCakIsNEJBQW9CLFVBckJIO0FBc0JqQix3QkFBZ0Is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R0FBeEUsRUFBNkU7QUFDekUsb0JBQUk3QyxZQUFZM0MsR0FBWixFQUFpQmtGLE9BQWpCLENBQXlCTSxDQUF6QixFQUE0QkMsS0FBNUIsQ0FBa0MxRixNQUFsQyxJQUE0QyxDQUFoRCxFQUFtRDtBQUMvQzRDLGdDQUFZM0MsR0FBWixFQUFpQmtGLE9BQWpCLENBQXlCTSxDQUF6QixFQUE0QnZDLE1BQTVCO0FBQ0g7QUFDSjtBQUVKO0FBRUosS0EvVkQ7QUFnV0gsQ0F0a0JEO0FBUEE7O2tCQStrQmV6RSxPIiwiZmlsZSI6IkhhbXN0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG1vZHVsZSBIYW1zdGVyXHJcbiAqIFxyXG4gKiBAZGVzY3JpcHRpb24gUG9zdENTUyBIYW1zdGVyIGZyYW1ld29yayBtYWluIGZ1bmN0aW9uYWxpdHkuXHJcbiAqXHJcbiAqIEB2ZXJzaW9uIDEuMFxyXG4gKiBAYXV0aG9yIEdyaWdvcnkgVmFzaWx5ZXYgPHBvc3Rjc3MuaGFtc3RlckBnbWFpbC5jb20+IGh0dHBzOi8vZ2l0aHViLmNvbS9oMHRjMGQzXHJcbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE3LCBHcmlnb3J5IFZhc2lseWV2XHJcbiAqIEBsaWNlbnNlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCwgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wIFxyXG4gKiBcclxuICovXHJcblxyXG5pbXBvcnQgRm9udFNpemVzIGZyb20gXCIuL0ZvbnRTaXplc1wiO1xyXG5cclxuaW1wb3J0IHtcclxuICAgIGZvcm1hdEludCxcclxuICAgIGZvcm1hdFZhbHVlLFxyXG4gICAgVmVydGljYWxSaHl0aG1cclxufSBmcm9tIFwiLi9WZXJ0aWNhbFJoeXRobVwiO1xyXG5cclxuaW1wb3J0IFBuZ0ltYWdlIGZyb20gXCIuL1BuZ0ltYWdlXCI7XHJcbi8vIGltcG9ydCBWaXJ0dWFsTWFjaGluZSBmcm9tIFwiLi9WaXJ0dWFsTWFjaGluZVwiO1xyXG5cclxuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5cclxuaW1wb3J0IHBvc3Rjc3MgZnJvbSBcInBvc3Rjc3NcIjtcclxuXHJcbmNvbnN0IGhhbXN0ZXIgPSAob3B0aW9ucyA9IG51bGwpID0+IHtcclxuXHJcbiAgICAvL0RlZmF1bHQgR2xvYmFsIFNldHRpbmdzXHJcbiAgICBsZXQgZ2xvYmFsU2V0dGluZ3MgPSB7XHJcblxyXG4gICAgICAgIFwiZm9udC1zaXplXCI6IFwiMTZweFwiLFxyXG4gICAgICAgIFwibGluZS1oZWlnaHRcIjogXCIxLjVcIixcclxuICAgICAgICBcInVuaXRcIjogXCJlbVwiLFxyXG4gICAgICAgIFwicHgtZmFsbGJhY2tcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgXCJweC1iYXNlbGluZVwiOiBcImZhbHNlXCIsXHJcbiAgICAgICAgXCJmb250LXJhdGlvXCI6IFwiMFwiLFxyXG5cclxuICAgICAgICBcInByb3BlcnRpZXNcIjogXCJpbmxpbmVcIixcclxuXHJcbiAgICAgICAgXCJtaW4tbGluZS1wYWRkaW5nXCI6IFwiMnB4XCIsXHJcbiAgICAgICAgXCJyb3VuZC10by1oYWxmLWxpbmVcIjogXCJmYWxzZVwiLFxyXG5cclxuICAgICAgICBcInJ1bGVyXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgIFwicnVsZXItc3R5bGVcIjogXCJhbHdheXMgcnVsZXItZGVidWdcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tcG9zaXRpb25cIjogXCJ0b3A6IDEuNWVtO2xlZnQ6IDEuNWVtO1wiLFxyXG4gICAgICAgIFwicnVsZXItaWNvbi1jb2xvcnNcIjogXCIjY2NjY2NjICM0NDU3NmFcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tc2l6ZVwiOiBcIjI0cHhcIixcclxuICAgICAgICBcInJ1bGVyLWNvbG9yXCI6IFwicmdiYSgxOSwgMTM0LCAxOTEsIC44KVwiLFxyXG4gICAgICAgIFwicnVsZXItdGhpY2tuZXNzXCI6IFwiMVwiLFxyXG4gICAgICAgIFwicnVsZXItYmFja2dyb3VuZFwiOiBcImdyYWRpZW50XCIsXHJcbiAgICAgICAgXCJydWxlci1vdXRwdXRcIjogXCJiYXNlNjRcIixcclxuICAgICAgICBcInJ1bGVyLXBhdHRlcm5cIjogXCIxIDAgMCAwXCIsXHJcbiAgICAgICAgXCJydWxlci1zY2FsZVwiOiBcIjFcIixcclxuXHJcbiAgICAgICAgXCJicm93c2VyLWZvbnQtc2l6ZVwiOiBcIjE2cHhcIixcclxuICAgICAgICBcImxlZ2FjeS1icm93c2Vyc1wiOiBcInRydWVcIixcclxuICAgICAgICBcInJlbW92ZS1jb21tZW50c1wiOiBcImZhbHNlXCJcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBnbG9iYWxLZXlzID0gW1widW5pdFwiLFxyXG4gICAgICAgIFwicHgtZmFsbGJhY2tcIixcclxuICAgICAgICBcInB4LWJhc2VsaW5lXCIsXHJcbiAgICAgICAgXCJmb250LXJhdGlvXCIsXHJcbiAgICAgICAgXCJwcm9wZXJ0aWVzXCIsXHJcbiAgICAgICAgXCJyb3VuZC10by1oYWxmLWxpbmVcIixcclxuICAgICAgICBcInJ1bGVyXCIsXHJcbiAgICAgICAgXCJydWxlci1zdHlsZVwiLFxyXG4gICAgICAgIFwicnVsZXItYmFja2dyb3VuZFwiLFxyXG4gICAgICAgIFwicnVsZXItb3V0cHV0XCIsXHJcbiAgICAgICAgXCJsZWdhY3ktYnJvd3NlcnNcIixcclxuICAgICAgICBcInJlbW92ZS1jb21tZW50c1wiXTtcclxuXHJcbiAgICBsZXQgaGVscGVycyA9IHtcclxuICAgICAgICBcInJlc2V0XCI6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2hlbHBlcnMvcmVzZXQuY3NzXCIpLCBcInV0ZjhcIiksXHJcbiAgICAgICAgXCJub3JtYWxpemVcIjogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vaGVscGVycy9ub3JtYWxpemUuY3NzXCIpLCBcInV0ZjhcIiksXHJcbiAgICAgICAgXCJub3dyYXBcIjogXCJ3aGl0ZS1zcGFjZTogbm93cmFwO1wiLFxyXG4gICAgICAgIFwiZm9yY2V3cmFwXCI6IFwid2hpdGUtc3BhY2U6IHByZTtcIiArXHJcbiAgICAgICAgICAgIFwid2hpdGUtc3BhY2U6IHByZS1saW5lO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogLXByZS13cmFwO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogLW8tcHJlLXdyYXA7XCIgK1xyXG4gICAgICAgICAgICBcIndoaXRlLXNwYWNlOiAtbW96LXByZS13cmFwO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogLWhwLXByZS13cmFwO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XCIgK1xyXG4gICAgICAgICAgICBcIndvcmQtd3JhcDogYnJlYWstd29yZDtcIixcclxuICAgICAgICBcImVsbGlwc2lzXCI6IFwib3ZlcmZsb3c6IGhpZGRlbjtcIiArXHJcbiAgICAgICAgICAgIFwidGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XCJcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEN1cnJlbnQgVmFyaWFibGVzXHJcbiAgICBsZXQgY3VycmVudFNldHRpbmdzID0ge307XHJcbiAgICBsZXQgY3VycmVudFNldHRpbmdzUmVnZXhwO1xyXG4gICAgLy9DdXJyZW50IEZvbnRTaXplc1xyXG4gICAgbGV0IGN1cnJlbnRGb250U2l6ZXMgPSBcIlwiO1xyXG4gICAgLy8gZm9udCBTaXplc1xyXG4gICAgbGV0IGZvbnRTaXplc0NvbGxlY3Rpb247XHJcbiAgICAvLyBWZXJ0aWNhbCBSaHl0aG0gQ2FsY3VsYXRvclxyXG4gICAgbGV0IHJoeXRobUNhbGN1bGF0b3I7XHJcbiAgICAvLyBMYXN0IENzcyBGaWxlXHJcbiAgICAvLyBsZXQgbGFzdEZpbGU7XHJcblxyXG4gICAgLy8gbGV0IHZtID0gbmV3IFZpcnR1YWxNYWNoaW5lKCk7XHJcbiAgICAvLyBmb250U2l6ZSBwcm9wZXJ0eSBSZWdleHBcclxuICAgIGNvbnN0IGZvbnRTaXplUmVnZXhwID0gbmV3IFJlZ0V4cChcImZvbnRTaXplXFxcXHMrKFtcXFxcLVxcXFwkXFxcXEAwLTlhLXpBLVpdKylcIiwgXCJpXCIpO1xyXG5cclxuICAgIC8vIGxpbmVIZWlnaHQgcHJvcGVydHkgUmVnZXhwXHJcbiAgICBjb25zdCBsaW5lUmVnZXhwID0gbmV3IFJlZ0V4cChcIihsaW5lSGVpZ2h0fHNwYWNpbmd8bGVhZGluZylcXFxcKCguKj8pXFxcXClcIiwgXCJpXCIpO1xyXG5cclxuICAgIC8vIENvcHkgVmFsdWVzIGZyb20gb2JqZWN0IDIgdG8gb2JqZWN0IDE7XHJcbiAgICBjb25zdCBleHRlbmQgPSAob2JqZWN0MSwgb2JqZWN0MikgPT4ge1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMCwga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdDIpLCBrZXlzU2l6ZSA9IGtleXMubGVuZ3RoOyBpIDwga2V5c1NpemU7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQga2V5ID0ga2V5c1tpXTtcclxuICAgICAgICAgICAgb2JqZWN0MVtrZXldID0gb2JqZWN0MltrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2JqZWN0MTtcclxuICAgIH07XHJcblxyXG4gICAgaWYob3B0aW9ucyAhPSBudWxsKXtcclxuICAgICAgICBleHRlbmQoZ2xvYmFsU2V0dGluZ3MsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRvQ2FtZWxDYXNlID0gKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXlteYS16MC05XSooLiopW15hLXowLTldKiQvLCBcIiQxXCIpLnJlcGxhY2UoL1teYS16MC05XSsoW2EtejAtOV0pL2csIChtYXRjaCwgbGV0dGVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBsZXR0ZXIudG9VcHBlckNhc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICBjb25zdCBpbml0U2V0dGluZ3MgPSAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIEFkZCBmb250U2l6ZXNcclxuICAgICAgICBpZiAoXCJmb250LXNpemVzXCIgaW4gZ2xvYmFsU2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IGdsb2JhbFNldHRpbmdzW1wiZm9udC1zaXplc1wiXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChcImZvbnQtc2l6ZXNcIiBpbiBjdXJyZW50U2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IGN1cnJlbnRGb250U2l6ZXMgKyBcIiwgXCIgKyBjdXJyZW50U2V0dGluZ3NbXCJmb250LXNpemVzXCJdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVG9Mb3dlckNhc2UgQ3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBrZXlzU2l6ZSA9IGdsb2JhbEtleXMubGVuZ3RoOyBpIDwga2V5c1NpemU7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQga2V5ID0gZ2xvYmFsS2V5c1tpXTtcclxuICAgICAgICAgICAgY3VycmVudFNldHRpbmdzW2tleV0gPSBjdXJyZW50U2V0dGluZ3Nba2V5XS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9udFNpemVzQ29sbGVjdGlvbiA9IG5ldyBGb250U2l6ZXMoY3VycmVudFNldHRpbmdzKTtcclxuICAgICAgICByaHl0aG1DYWxjdWxhdG9yID0gbmV3IFZlcnRpY2FsUmh5dGhtKGN1cnJlbnRTZXR0aW5ncyk7XHJcbiAgICAgICAgZm9udFNpemVzQ29sbGVjdGlvbi5hZGRGb250U2l6ZXMoY3VycmVudEZvbnRTaXplcywgcmh5dGhtQ2FsY3VsYXRvcik7XHJcbiAgICAgICAgY3VycmVudFNldHRpbmdzUmVnZXhwID0gbmV3IFJlZ0V4cChcIlxcXFxAKFwiICsgT2JqZWN0LmtleXMoY3VycmVudFNldHRpbmdzKS5qb2luKFwifFwiKS5yZXBsYWNlKC8oXFwtfFxcXykvZywgXCJcXFxcJDFcIikgKyBcIilcIiwgXCJpXCIpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgd2Fsa0RlY2xzID0gKG5vZGUpID0+IHtcclxuICAgICAgICBub2RlLndhbGtEZWNscyhkZWNsID0+IHtcclxuXHJcbiAgICAgICAgICAgIGxldCBmb3VuZDtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgVmFyaWFibGVzIHdpdGggdmFsdWVzXHJcbiAgICAgICAgICAgIHdoaWxlICgoZm91bmQgPSBkZWNsLnZhbHVlLm1hdGNoKGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCkpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFyaWFibGUgPSBmb3VuZFsxXTtcclxuICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoY3VycmVudFNldHRpbmdzUmVnZXhwLCBjdXJyZW50U2V0dGluZ3NbdmFyaWFibGVdKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgRm9udCBTaXplXHJcbiAgICAgICAgICAgIHdoaWxlICgoZm91bmQgPSBkZWNsLnZhbHVlLm1hdGNoKGZvbnRTaXplUmVnZXhwKSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgW2ZvbnRTaXplLCBzaXplVW5pdF0gPSBmb3VuZFsxXS5zcGxpdCgvXFwkL2kpO1xyXG4gICAgICAgICAgICAgICAgc2l6ZVVuaXQgPSAoc2l6ZVVuaXQgIT0gbnVsbCkgPyBzaXplVW5pdC50b0xvd2VyQ2FzZSgpIDogbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgc2l6ZSA9IGZvbnRTaXplc0NvbGxlY3Rpb24uZ2V0U2l6ZShmb250U2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBXcml0ZSBmb250IHNpemVcclxuICAgICAgICAgICAgICAgIGlmIChzaXplVW5pdCAhPSBudWxsICYmIChzaXplVW5pdCA9PSBcImVtXCIgfHwgc2l6ZVVuaXQgPT0gXCJyZW1cIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb250U2l6ZVJlZ2V4cCwgZm9ybWF0VmFsdWUoc2l6ZS5yZWwpICsgc2l6ZVVuaXQpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2l6ZVVuaXQgIT0gbnVsbCAmJiBzaXplVW5pdCA9PSBcInB4XCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb250U2l6ZVJlZ2V4cCwgZm9ybWF0SW50KHNpemUucHgpICsgXCJweFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2ZzaXplID0gKGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0gPT0gXCJweFwiKSA/IGZvcm1hdEludChzaXplLnB4KSA6IGZvcm1hdFZhbHVlKHNpemUucmVsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb250U2l6ZVJlZ2V4cCwgY2ZzaXplICsgY3VycmVudFNldHRpbmdzW1widW5pdFwiXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRqdXN0IEZvbnQgU2l6ZVxyXG4gICAgICAgICAgICBpZiAoZGVjbC5wcm9wID09IFwiYWRqdXN0LWZvbnQtc2l6ZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IFtmb250U2l6ZSwgbGluZXMsIGJhc2VGb250U2l6ZV0gPSBkZWNsLnZhbHVlLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm9udFNpemVVbml0ID0gZm9udFNpemUubWF0Y2goLyhweHxlbXxyZW0pJC9pKVswXS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvbnRTaXplID0gcmh5dGhtQ2FsY3VsYXRvci5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIG51bGwsIGJhc2VGb250U2l6ZSkgKyBjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBmb250U2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IHJoeXRobUNhbGN1bGF0b3IubGluZUhlaWdodChmb250U2l6ZSwgbGluZXMsIGJhc2VGb250U2l6ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHREZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGxpbmVIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBkZWNsLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVjbC5wcm9wID0gXCJmb250LXNpemVcIjtcclxuICAgICAgICAgICAgICAgIGRlY2wucGFyZW50Lmluc2VydEFmdGVyKGRlY2wsIGxpbmVIZWlnaHREZWNsKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gbGluZUhlaWdodCwgc3BhY2luZywgbGVhZGluZ1xyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChsaW5lUmVnZXhwKSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBmb3VuZFsxXS50b0xvd2VyQ2FzZSgpOyAvLyBzcGFjaW5nIG9yIGxpbmVIZWlnaHRcclxuICAgICAgICAgICAgICAgIGxldCBwYXJhbWV0ZXJzID0gZm91bmRbMl0uc3BsaXQoL1xccypcXCxcXHMqLyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgcGFyYW1ldGVyc1NpemUgPSBwYXJhbWV0ZXJzLmxlbmd0aDsgaSA8IHBhcmFtZXRlcnNTaXplOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBsZXQgW3ZhbHVlLCBmb250U2l6ZV0gPSBwYXJhbWV0ZXJzW2ldLnNwbGl0KC9cXHMrLyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmb250U2l6ZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2wucGFyZW50LndhbGtEZWNscyhcImZvbnQtc2l6ZVwiLCBmc2RlY2wgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSBmc2RlY2wudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZvbnRTaXplID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSBjdXJyZW50U2V0dGluZ3NbXCJmb250LXNpemVcIl07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkgPT0gXCJsaW5laGVpZ2h0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodCArPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIHZhbHVlKSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkgPT0gXCJzcGFjaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodCArPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIHZhbHVlLCBudWxsLCB0cnVlKSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkgPT0gXCJsZWFkaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodCArPSByaHl0aG1DYWxjdWxhdG9yLmxlYWRpbmcodmFsdWUsIGZvbnRTaXplKSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvdW5kWzBdLCBsaW5lSGVpZ2h0LnJlcGxhY2UoL1xccyskLywgXCJcIikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHJlbSBmYWxsYmFja1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicHgtZmFsbGJhY2tcIl0gPT0gXCJ0cnVlXCIgJiYgZGVjbC52YWx1ZS5tYXRjaCgvWzAtOVxcLl0rcmVtL2kpKSB7XHJcbiAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC5pbnNlcnRCZWZvcmUoZGVjbCwgZGVjbC5jbG9uZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJoeXRobUNhbGN1bGF0b3IucmVtRmFsbGJhY2soZGVjbC52YWx1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBkZWNsLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiAoY3NzKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIEV4dGVuZCBOb2Rlc1xyXG4gICAgICAgIGxldCBleHRlbmROb2RlcyA9IHt9O1xyXG5cclxuICAgICAgICBjc3Mud2Fsayhub2RlID0+IHtcclxuICAgICAgICAgICAgLy8gaWYgKGxhc3RGaWxlICE9IG5vZGUuc291cmNlLmlucHV0LmZpbGUpIHtcclxuICAgICAgICAgICAgLy8gXHRsYXN0RmlsZSA9IG5vZGUuc291cmNlLmlucHV0LmZpbGU7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChub2RlLnR5cGUgPT0gXCJhdHJ1bGVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBydWxlID0gbm9kZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZS5uYW1lID09IFwiaGFtc3RlclwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlLnBhcmFtcyAhPSBcImVuZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCBHbG9iYWwgVmFyaWFibGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUud2Fsa0RlY2xzKGRlY2wgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsU2V0dGluZ3NbZGVjbC5wcm9wXSA9IGRlY2wudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCBmb250U2l6ZXNcclxuICAgICAgICAgICAgICAgICAgICBpZiAoXCJmb250LXNpemVzXCIgaW4gZ2xvYmFsU2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IGdsb2JhbFNldHRpbmdzW1wiZm9udC1zaXplc1wiXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgY3VycmVudCB2YXJpYWJsZXNcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3MgPSBleHRlbmQoe30sIGdsb2JhbFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFNldHRpbmdzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBSdWxlIEhhbXN0ZXJcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lID09IFwiIWhhbXN0ZXJcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL2N1cnJlbnRTZXR0aW5ncyA9IGV4dGVuZCh7fSwgZ2xvYmFsU2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLndhbGtEZWNscyhkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzW2RlY2wucHJvcF0gPSBkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJbml0IGN1cnJlbnQgU2V0dGluZ3NcclxuICAgICAgICAgICAgICAgICAgICBpbml0U2V0dGluZ3MoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcImJhc2VsaW5lXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplID0gcGFyc2VJbnQoY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplXCJdKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYnJvd3NlckZvbnRTaXplID0gcGFyc2VJbnQoY3VycmVudFNldHRpbmdzW1wiYnJvd3Nlci1mb250LXNpemVcIl0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IHJoeXRobUNhbGN1bGF0b3IubGluZUhlaWdodChmb250U2l6ZSArIFwicHhcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGJhc2VsaW5lIGZvbnQgc2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZURlY2wgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicHgtYmFzZWxpbmVcIl0gPT0gXCJ0cnVlXCIgfHwgKGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0gPT0gXCJweFwiICYmIGN1cnJlbnRTZXR0aW5nc1tcImxlZ2FjeS1icm93c2Vyc1wiXSAhPSBcInRydWVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplRGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImZvbnQtc2l6ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZvbnRTaXplICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZWxhdGl2ZVNpemUgPSAxMDAgKiBmb250U2l6ZSAvIGJyb3dzZXJGb250U2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplRGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImZvbnQtc2l6ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZvcm1hdFZhbHVlKHJlbGF0aXZlU2l6ZSkgKyBcIiVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHREZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbGluZUhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGUucGFyYW1zLm1hdGNoKC9cXHMqaHRtbFxccyovKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGh0bWxSdWxlID0gcG9zdGNzcy5ydWxlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcImh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sUnVsZS5hcHBlbmQoZm9udFNpemVEZWNsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbFJ1bGUuYXBwZW5kKGxpbmVIZWlnaHREZWNsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGh0bWxSdWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdID09IFwicHhcIiAmJiBjdXJyZW50U2V0dGluZ3NbXCJsZWdhY3ktYnJvd3NlcnNcIl0gPT0gXCJ0cnVlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhc3Rlcmlza0h0bWxSdWxlID0gcG9zdGNzcy5ydWxlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCIqIGh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdGVyaXNrSHRtbFJ1bGUuYXBwZW5kKGxpbmVIZWlnaHREZWNsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGFzdGVyaXNrSHRtbFJ1bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBsaW5lSGVpZ2h0RGVjbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGZvbnRTaXplRGVjbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1widW5pdFwiXSA9PSBcInJlbVwiICYmIGN1cnJlbnRTZXR0aW5nc1tcInB4LWZhbGxiYWNrXCJdID09IFwidHJ1ZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKGxpbmVIZWlnaHREZWNsLCBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IFwibGluZS1oZWlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmh5dGhtQ2FsY3VsYXRvci5yZW1GYWxsYmFjayhsaW5lSGVpZ2h0KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lID09IFwicnVsZXJcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXJJY29uUG9zaXRpb24gPSBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1pY29uLXBvc2l0aW9uXCJdLnJlcGxhY2UoLyhcXCd8XFxcIikvZywgXCJcIikucmVwbGFjZSgvXFw7L2csIFwiO1xcblwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSAoY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0ubWF0Y2goL3B4JC9pKSkgPyBjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSA6IGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdICsgXCJlbVwiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL2xldCBzdmcgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0ZjgsJTNDc3ZnIHhtbG5zJTNEJTI3aHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTI3IHZpZXdCb3glM0QlMjcwIDAgMjQgMjQlMjclM0UlM0NwYXRoIGZpbGwlM0QlMjd7Y29sb3J9JTI3IGQlM0QlMjdNMTggMjRjLTAuMyAwLTAuNTQ4LTAuMjQ2LTAuNTQ4LTAuNTQ2VjE4YzAtMC4zIDAuMjQ4LTAuNTQ2IDAuNTQ4LTAuNTQ2aDUuNDUyICBDMjMuNzU0IDE3LjQ1NCAyNCAxNy43IDI0IDE4djUuNDU0YzAgMC4zLTAuMjQ2IDAuNTQ2LTAuNTQ4IDAuNTQ2SDE4eiBNOS4yNzEgMjRjLTAuMjk4IDAtMC41NDMtMC4yNDYtMC41NDMtMC41NDZWMTggIGMwLTAuMyAwLjI0NS0wLjU0NiAwLjU0My0wLjU0Nmg1LjQ1N2MwLjMgMCAwLjU0MyAwLjI0NiAwLjU0MyAwLjU0NnY1LjQ1NGMwIDAuMy0wLjI0MyAwLjU0Ni0wLjU0MyAwLjU0Nkg5LjI3MXogTTAuNTQ4IDI0ICBDMC4yNDYgMjQgMCAyMy43NTQgMCAyMy40NTRWMThjMC0wLjMgMC4yNDYtMC41NDYgMC41NDgtMC41NDZINmMwLjMwMiAwIDAuNTQ4IDAuMjQ2IDAuNTQ4IDAuNTQ2djUuNDU0QzYuNTQ4IDIzLjc1NCA2LjMwMiAyNCA2IDI0ICBIMC41NDh6IE0xOCAxNS4yNzFjLTAuMyAwLTAuNTQ4LTAuMjQ0LTAuNTQ4LTAuNTQyVjkuMjcyYzAtMC4yOTkgMC4yNDgtMC41NDUgMC41NDgtMC41NDVoNS40NTJDMjMuNzU0IDguNzI3IDI0IDguOTczIDI0IDkuMjcyICB2NS40NTdjMCAwLjI5OC0wLjI0NiAwLjU0Mi0wLjU0OCAwLjU0MkgxOHogTTkuMjcxIDE1LjI3MWMtMC4yOTggMC0wLjU0My0wLjI0NC0wLjU0My0wLjU0MlY5LjI3MmMwLTAuMjk5IDAuMjQ1LTAuNTQ1IDAuNTQzLTAuNTQ1ICBoNS40NTdjMC4zIDAgMC41NDMgMC4yNDYgMC41NDMgMC41NDV2NS40NTdjMCAwLjI5OC0wLjI0MyAwLjU0Mi0wLjU0MyAwLjU0Mkg5LjI3MXogTTAuNTQ4IDE1LjI3MUMwLjI0NiAxNS4yNzEgMCAxNS4wMjYgMCAxNC43MjkgIFY5LjI3MmMwLTAuMjk5IDAuMjQ2LTAuNTQ1IDAuNTQ4LTAuNTQ1SDZjMC4zMDIgMCAwLjU0OCAwLjI0NiAwLjU0OCAwLjU0NXY1LjQ1N2MwIDAuMjk4LTAuMjQ2IDAuNTQyLTAuNTQ4IDAuNTQySDAuNTQ4eiBNMTggNi41NDUgIGMtMC4zIDAtMC41NDgtMC4yNDUtMC41NDgtMC41NDVWMC41NDVDMTcuNDUyIDAuMjQ1IDE3LjcgMCAxOCAwaDUuNDUyQzIzLjc1NCAwIDI0IDAuMjQ1IDI0IDAuNTQ1VjZjMCAwLjMtMC4yNDYgMC41NDUtMC41NDggMC41NDUgIEgxOHogTTkuMjcxIDYuNTQ1QzguOTc0IDYuNTQ1IDguNzI5IDYuMyA4LjcyOSA2VjAuNTQ1QzguNzI5IDAuMjQ1IDguOTc0IDAgOS4yNzEgMGg1LjQ1N2MwLjMgMCAwLjU0MyAwLjI0NSAwLjU0MyAwLjU0NVY2ICBjMCAwLjMtMC4yNDMgMC41NDUtMC41NDMgMC41NDVIOS4yNzF6IE0wLjU0OCA2LjU0NUMwLjI0NiA2LjU0NSAwIDYuMyAwIDZWMC41NDVDMCAwLjI0NSAwLjI0NiAwIDAuNTQ4IDBINiAgYzAuMzAyIDAgMC41NDggMC4yNDUgMC41NDggMC41NDVWNmMwIDAuMy0wLjI0NiAwLjU0NS0wLjU0OCAwLjU0NUgwLjU0OHolMjclMkYlM0UlM0MlMkZzdmclM0VcIjtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGY4LCUzQ3N2ZyB4bWxucyUzRCUyN2h0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyNyB2aWV3Qm94JTNEJTI3MCAwIDI0IDI0JTI3JTNFJTNDcGF0aCBmaWxsJTNEJTI3e2NvbG9yfSUyNyBkJTNEJTI3TTAsNmMwLDAuMzAxLDAuMjQ2LDAuNTQ1LDAuNTQ5LDAuNTQ1aDIyLjkwNkMyMy43NTYsNi41NDUsMjQsNi4zMDEsMjQsNlYyLjczYzAtMC4zMDUtMC4yNDQtMC41NDktMC41NDUtMC41NDlIMC41NDkgIEMwLjI0NiwyLjE4MiwwLDIuNDI2LDAsMi43M1Y2eiBNMCwxMy42MzdjMCwwLjI5NywwLjI0NiwwLjU0NSwwLjU0OSwwLjU0NWgyMi45MDZjMC4zMDEsMCwwLjU0NS0wLjI0OCwwLjU0NS0wLjU0NXYtMy4yNzMgIGMwLTAuMjk3LTAuMjQ0LTAuNTQ1LTAuNTQ1LTAuNTQ1SDAuNTQ5QzAuMjQ2LDkuODE4LDAsMTAuMDY2LDAsMTAuMzYzVjEzLjYzN3ogTTAsMjEuMjdjMCwwLjMwNSwwLjI0NiwwLjU0OSwwLjU0OSwwLjU0OWgyMi45MDYgIGMwLjMwMSwwLDAuNTQ1LTAuMjQ0LDAuNTQ1LTAuNTQ5VjE4YzAtMC4zMDEtMC4yNDQtMC41NDUtMC41NDUtMC41NDVIMC41NDlDMC4yNDYsMTcuNDU1LDAsMTcuNjk5LDAsMThWMjEuMjd6JTI3JTJGJTNFJTNDJTJGc3ZnJTNFXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGY4LCUzQ3N2ZyB4bWxucyUzRCUyN2h0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyNyB2aWV3Qm94JTNEJTI3MCAwIDMyIDMyJTI3JTNFJTNDcGF0aCBmaWxsJTNEJTI3e2NvbG9yfSUyNyBkJTNEJTI3TTI4LDIwaC00di04aDRjMS4xMDQsMCwyLTAuODk2LDItMnMtMC44OTYtMi0yLTJoLTRWNGMwLTEuMTA0LTAuODk2LTItMi0ycy0yLDAuODk2LTIsMnY0aC04VjRjMC0xLjEwNC0wLjg5Ni0yLTItMiAgUzgsMi44OTYsOCw0djRINGMtMS4xMDQsMC0yLDAuODk2LTIsMnMwLjg5NiwyLDIsMmg0djhINGMtMS4xMDQsMC0yLDAuODk2LTIsMnMwLjg5NiwyLDIsMmg0djRjMCwxLjEwNCwwLjg5NiwyLDIsMnMyLTAuODk2LDItMnYtNCAgaDh2NGMwLDEuMTA0LDAuODk2LDIsMiwyczItMC44OTYsMi0ydi00aDRjMS4xMDQsMCwyLTAuODk2LDItMlMyOS4xMDQsMjAsMjgsMjB6IE0xMiwyMHYtOGg4djhIMTJ6JTI3JTJGJTNFJTNDJTJGc3ZnJTNFXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGd0aGlja25lc3MgPSBwYXJzZUZsb2F0KGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLXRoaWNrbmVzc1wiXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBiYWNrZ3JvdW5kID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWJhY2tncm91bmRcIl0gPT0gXCJwbmdcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlSGVpZ2h0ID0gKGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdLm1hdGNoKC9weCQvKSkgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0pIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwYXJzZUZsb2F0KGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdKSAqIHBhcnNlRmxvYXQoY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplXCJdKSkudG9GaXhlZCgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdHRlcm4gPSBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1wYXR0ZXJuXCJdLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZSA9IG5ldyBQbmdJbWFnZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5ydWxlck1hdHJpeChpbWFnZUhlaWdodCwgY3VycmVudFNldHRpbmdzW1wicnVsZXItY29sb3JcIl0sIHBhdHRlcm4sIGd0aGlja25lc3MsIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLXNjYWxlXCJdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLW91dHB1dFwiXSAhPSBcImJhc2U2NFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5nZXRGaWxlKGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLW91dHB1dFwiXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIi4uL1wiICsgY3VycmVudFNldHRpbmdzW1wicnVsZXItb3V0cHV0XCJdICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXBvc2l0aW9uOiBsZWZ0IHRvcDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXJlcGVhdDogcmVwZWF0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtc2l6ZTogXCIgKyBwYXR0ZXJuLmxlbmd0aCArIFwicHggXCIgKyBpbWFnZUhlaWdodCArIFwicHg7XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsXCIgKyBpbWFnZS5nZXRCYXNlNjQoKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1wb3NpdGlvbjogbGVmdCB0b3A7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1yZXBlYXQ6IHJlcGVhdDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXNpemU6IFwiICsgcGF0dGVybi5sZW5ndGggKyBcInB4IFwiICsgaW1hZ2VIZWlnaHQgKyBcInB4O1wiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3RoaWNrbmVzcyA9IGd0aGlja25lc3MgKiAzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KHRvIHRvcCwgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzW1wicnVsZXItY29sb3JcIl0gKyBcIiBcIiArIGd0aGlja25lc3MgKyBcIiUsIHRyYW5zcGFyZW50IFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGd0aGlja25lc3MgKyBcIiUpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1zaXplOiAxMDAlIFwiICsgbGluZUhlaWdodCArIFwiO1wiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVyID0gXCJwb3NpdGlvbjogYWJzb2x1dGU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImxlZnQ6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcDogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJwYWRkaW5nOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWR0aDogMTAwJTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0OiAxMDAlO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ6LWluZGV4OiA5OTAwO1wiICsgYmFja2dyb3VuZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGljb25TaXplID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItaWNvbi1zaXplXCJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgW3N0eWxlLCBydWxlckNsYXNzXSA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLXN0eWxlXCJdLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFtjb2xvciwgaG92ZXJDb2xvcl0gPSBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1pY29uLWNvbG9yc1wiXS5zcGxpdCgvXFxzKy8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXJSdWxlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0eWxlID09IFwic3dpdGNoXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCIuXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5OiBub25lO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl0ge1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTpub25lO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl0gKyBsYWJlbCB7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ6LWluZGV4OiA5OTk5O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTogaW5saW5lLWJsb2NrO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb246IGFic29sdXRlO1wiICsgcnVsZXJJY29uUG9zaXRpb24gK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYWRkaW5nOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGg6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY3Vyc29yOiBwb2ludGVyO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdmcucmVwbGFjZSgvXFx7Y29sb3JcXH0vLCBlc2NhcGUoY29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgKyBydWxlckNsYXNzICsgXCJcXFwiXTpjaGVja2VkICsgbGFiZWwsIGlucHV0W2lkPVxcXCJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlckNsYXNzICsgXCJcXFwiXTpob3ZlciArIGxhYmVsIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgKyBzdmcucmVwbGFjZSgvXFx7Y29sb3JcXH0vLCBlc2NhcGUoaG92ZXJDb2xvcikpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlckNsYXNzICsgXCJcXFwiXTpjaGVja2VkIH4gLlwiICsgcnVsZXJDbGFzcyArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTogYmxvY2s7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0eWxlID09IFwiaG92ZXJcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJSdWxlID0gcG9zdGNzcy5wYXJzZShcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlckljb25Qb3NpdGlvbiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hcmdpbjogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmc6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWR0aDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0OiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIlwiICsgc3ZnLnJlcGxhY2UoL1xce2NvbG9yXFx9LywgZXNjYXBlKGNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHJhbnNpdGlvbjogYmFja2dyb3VuZC1pbWFnZSAwLjVzIGVhc2UtaW4tb3V0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLlwiICsgcnVsZXJDbGFzcyArIFwiOmhvdmVyXCIgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnNvcjogcG9pbnRlcjtcIiArIHJ1bGVyICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdHlsZSA9PSBcImFsd2F5c1wiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1xcblwiICsgcnVsZXIgKyBcIn1cXG5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGVyUnVsZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyUnVsZS5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJ1bGUsIHJ1bGVyUnVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUubWF0Y2goL14oZWxsaXBzaXN8bm93cmFwfGZvcmNld3JhcCkkL2kpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9wZXJ0eSA9IHJ1bGUubmFtZS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVjbHMgPSBoZWxwZXJzW3Byb3BlcnR5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5ID09IFwiZWxsaXBzaXNcIiAmJiBydWxlLnBhcmFtcyA9PSBcInRydWVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNscyA9IGhlbHBlcnNbXCJub3dyYXBcIl0gKyBkZWNscztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInByb3BlcnRpZXNcIl0gPT0gXCJpbmxpbmVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlkZWNscyA9IHBvc3Rjc3MucGFyc2UoZGVjbHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgaWRlY2xzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50U2V0dGluZ3NbXCJwcm9wZXJ0aWVzXCJdID09IFwiZXh0ZW5kXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleHRlbmROYW1lID0gdG9DYW1lbENhc2UocHJvcGVydHkgKyBcIiBcIiArIHJ1bGUucGFyYW1zKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRlbmROb2Rlc1tleHRlbmROYW1lXSA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSBleHRlbmQgaW5mb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IHJ1bGUucGFyZW50LnNlbGVjdG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xzOiBkZWNscyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRzOiBbcnVsZS5wYXJlbnRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXY6IHJ1bGUucHJldigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQXBwZW5kIHNlbGVjdG9yIGFuZCB1cGRhdGUgY291bnRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0uc2VsZWN0b3IgPSBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5zZWxlY3RvciArIFwiLCBcIiArIHJ1bGUucGFyZW50LnNlbGVjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0ucGFyZW50cy5wdXNoKHJ1bGUucGFyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLmNvdW50Kys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lLm1hdGNoKC9eKHJlc2V0fG5vcm1hbGl6ZSkkL2kpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gcnVsZS5uYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVzID0gcG9zdGNzcy5wYXJzZShoZWxwZXJzW3Byb3BlcnR5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZXMuc291cmNlID0gcnVsZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgcnVsZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBXYWxrIGluIG1lZGlhIHF1ZXJpZXNcclxuICAgICAgICAgICAgICAgIG5vZGUud2FsayhjaGlsZCA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZC50eXBlID09IFwicnVsZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdhbGsgZGVjbHMgaW4gcnVsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YWxrRGVjbHMoY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcImpzXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgbGV0IGpjc3MgPSBydWxlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgLy8gbGV0IGNvZGUgPSBqY3NzLnJlcGxhY2UoL1xcQGpzXFxzKlxceyhbXFxzXFxTXSspXFx9JC9pLCBcIiQxXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhqY3NzKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBydWxlclJ1bGUuc291cmNlID0gcnVsZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgLy8gcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJ1bGUsIHJ1bGVyUnVsZSk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS50eXBlID09IFwicnVsZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gV2FsayBkZWNscyBpbiBydWxlXHJcbiAgICAgICAgICAgICAgICB3YWxrRGVjbHMobm9kZSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInJlbW92ZS1jb21tZW50c1wiXSA9PSBcInRydWVcIiAmJiBub2RlLnR5cGUgPT0gXCJjb21tZW50XCIpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCBFeHRlbmRzIHRvIENTU1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBrZXlzID0gT2JqZWN0LmtleXMoZXh0ZW5kTm9kZXMpLCBrZXlzU2l6ZSA9IGtleXMubGVuZ3RoOyBpIDwga2V5c1NpemU7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQga2V5ID0ga2V5c1tpXTtcclxuICAgICAgICAgICAgaWYgKGV4dGVuZE5vZGVzW2tleV0uY291bnQgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcnVsZSA9IHBvc3Rjc3MucGFyc2UoZXh0ZW5kTm9kZXNba2V5XS5zZWxlY3RvciArIFwie1wiICsgZXh0ZW5kTm9kZXNba2V5XS5kZWNscyArIFwifVwiKTtcclxuICAgICAgICAgICAgICAgIHJ1bGUuc291cmNlID0gZXh0ZW5kTm9kZXNba2V5XS5zb3VyY2U7XHJcblxyXG4gICAgICAgICAgICAgICAgY3NzLmluc2VydEJlZm9yZShleHRlbmROb2Rlc1trZXldLnBhcmVudHNbMF0sIHJ1bGUpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZWNscyA9IHBvc3Rjc3MucGFyc2UoZXh0ZW5kTm9kZXNba2V5XS5kZWNscyk7XHJcbiAgICAgICAgICAgICAgICBkZWNscy5zb3VyY2UgPSBleHRlbmROb2Rlc1trZXldLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2tleV0ucGFyZW50c1swXS5pbnNlcnRBZnRlcihleHRlbmROb2Rlc1trZXldLnByZXYsIGRlY2xzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIHVudXNlZCBwYXJlbnQgbm9kZXMuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwLCBwYXJlbnRzID0gZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzLmxlbmd0aDsgaiA8IHBhcmVudHM7IGorKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV4dGVuZE5vZGVzW2tleV0ucGFyZW50c1tqXS5ub2Rlcy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2tleV0ucGFyZW50c1tqXS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGhhbXN0ZXI7Il19
