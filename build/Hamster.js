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

    //Default Global Variables
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
    var extendNodes = {};
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

                    var unit = globalSettings["unit"].toLowerCase();
                    var cfsize = unit == "px" ? (0, _VerticalRhythm.formatInt)(size.px) : (0, _VerticalRhythm.formatValue)(size.rel);

                    decl.value = decl.value.replace(fontSizeRegexp, cfsize + unit);
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

            if (currentSettings["px-fallback"] == "true" && decl.value.match(/[0-9\.]+rem/i)) {
                decl.parent.insertBefore(decl, decl.clone({
                    value: rhythmCalculator.remFallback(decl.value),
                    source: decl.source
                }));
            }
        });
    };

    return function (css) {

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
                    var legacyBrowsers = currentSettings["legacy-browsers"].toLowerCase();
                    var pxBaseline = currentSettings["px-baseline"].toLowerCase();

                    var rhythmUnit = currentSettings["unit"].toLowerCase();

                    var lineHeight = rhythmCalculator.lineHeight(fontSize + "px");

                    // baseline font size
                    var fontSizeDecl = null;

                    if (pxBaseline == "true" || rhythmUnit == "px" && legacyBrowsers != "true") {

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

                        if (rhythmUnit == "px" && legacyBrowsers == "true") {
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

                        if (rhythmUnit == "rem" && currentSettings["px-fallback"] == "true") {

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

                        var _decls = _postcss2.default.parse(_decls);
                        rule.parent.insertBefore(rule, _decls);
                    } else if (currentSettings["properties"] == "extend") {

                        var extendName = toCamelCase(rule.name.toLowerCase() + " " + rule.params);

                        if (extendNodes[extendName] == null) {

                            // Save extend info
                            extendNodes[extendName] = {
                                selector: rule.parent.selector,
                                decls: decls,
                                parent: rule.parent,
                                prev: rule.prev(),
                                source: rule.source,
                                count: 1
                            };
                        } else {

                            //Append selector and update counter
                            extendNodes[extendName].selector = extendNodes[extendName].selector + ", " + rule.parent.selector;
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

                css.append(rule);
                css.last.moveBefore(extendNodes[key].parent);
            } else {
                var decls = _postcss2.default.parse(extendNodes[key].decls);
                decls.source = extendNodes[key].source;
                extendNodes[key].parent.insertAfter(extendNodes[key].prev, decls);
            }
        }
    };
};
// import VirtualMachine from "./VirtualMachine";

exports.default = hamster;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhhbXN0ZXIiLCJnbG9iYWxTZXR0aW5ncyIsImhlbHBlcnMiLCJyZWFkRmlsZVN5bmMiLCJyZXNvbHZlIiwiX19kaXJuYW1lIiwiY3VycmVudFNldHRpbmdzIiwiY3VycmVudFNldHRpbmdzUmVnZXhwIiwiY3VycmVudEZvbnRTaXplcyIsImZvbnRTaXplc0NvbGxlY3Rpb24iLCJyaHl0aG1DYWxjdWxhdG9yIiwiZXh0ZW5kTm9kZXMiLCJmb250U2l6ZVJlZ2V4cCIsIlJlZ0V4cCIsImxpbmVSZWdleHAiLCJleHRlbmQiLCJvYmplY3QxIiwib2JqZWN0MiIsImkiLCJrZXlzIiwiT2JqZWN0Iiwia2V5c1NpemUiLCJsZW5ndGgiLCJrZXkiLCJ0b0NhbWVsQ2FzZSIsInZhbHVlIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwibWF0Y2giLCJsZXR0ZXIiLCJ0b1VwcGVyQ2FzZSIsImluaXRTZXR0aW5ncyIsImFkZEZvbnRTaXplcyIsImpvaW4iLCJ3YWxrRGVjbHMiLCJub2RlIiwiZm91bmQiLCJkZWNsIiwidmFyaWFibGUiLCJzcGxpdCIsImZvbnRTaXplIiwic2l6ZVVuaXQiLCJzaXplIiwiZ2V0U2l6ZSIsInJlbCIsInB4IiwidW5pdCIsImNmc2l6ZSIsInByb3AiLCJsaW5lcyIsImJhc2VGb250U2l6ZSIsImZvbnRTaXplVW5pdCIsImNvbnZlcnQiLCJsaW5lSGVpZ2h0IiwibGluZUhlaWdodERlY2wiLCJzb3VyY2UiLCJwYXJlbnQiLCJpbnNlcnRBZnRlciIsInByb3BlcnR5IiwicGFyYW1ldGVycyIsInBhcmFtZXRlcnNTaXplIiwiZnNkZWNsIiwibGVhZGluZyIsImluc2VydEJlZm9yZSIsImNsb25lIiwicmVtRmFsbGJhY2siLCJjc3MiLCJ3YWxrIiwidHlwZSIsInJ1bGUiLCJuYW1lIiwicGFyYW1zIiwicmVtb3ZlIiwicGFyc2VJbnQiLCJicm93c2VyRm9udFNpemUiLCJsZWdhY3lCcm93c2VycyIsInB4QmFzZWxpbmUiLCJyaHl0aG1Vbml0IiwiZm9udFNpemVEZWNsIiwicmVsYXRpdmVTaXplIiwiaHRtbFJ1bGUiLCJzZWxlY3RvciIsImFwcGVuZCIsImFzdGVyaXNrSHRtbFJ1bGUiLCJydWxlckljb25Qb3NpdGlvbiIsInN2ZyIsImd0aGlja25lc3MiLCJwYXJzZUZsb2F0IiwiYmFja2dyb3VuZCIsImltYWdlSGVpZ2h0IiwidG9GaXhlZCIsInBhdHRlcm4iLCJpbWFnZSIsInJ1bGVyTWF0cml4IiwiZ2V0RmlsZSIsImdldEJhc2U2NCIsInJ1bGVyIiwiaWNvblNpemUiLCJzdHlsZSIsInJ1bGVyQ2xhc3MiLCJjb2xvciIsImhvdmVyQ29sb3IiLCJydWxlclJ1bGUiLCJwYXJzZSIsImVzY2FwZSIsImRlY2xzIiwiZXh0ZW5kTmFtZSIsInByZXYiLCJjb3VudCIsInJ1bGVzIiwiY2hpbGQiLCJsYXN0IiwibW92ZUJlZm9yZSJdLCJtYXBwaW5ncyI6Ijs7OztBQVlBOzs7O0FBRUE7O0FBTUE7Ozs7QUFHQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQTFCQTs7Ozs7Ozs7Ozs7O0FBNEJBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxHQUFNOztBQUVsQjtBQUNBLFFBQUlDLGlCQUFpQjs7QUFFakIscUJBQWEsTUFGSTtBQUdqQix1QkFBZSxLQUhFO0FBSWpCLGdCQUFRLElBSlM7QUFLakIsdUJBQWUsTUFMRTtBQU1qQix1QkFBZSxPQU5FO0FBT2pCLHNCQUFjLEdBUEc7O0FBU2pCLHNCQUFjLFFBVEc7O0FBV2pCLDRCQUFvQixLQVhIO0FBWWpCLDhCQUFzQixPQVpMOztBQWNqQixpQkFBUyxNQWRRO0FBZWpCLHVCQUFlLG9CQWZFO0FBZ0JqQiwrQkFBdUIseUJBaEJOO0FBaUJqQiw2QkFBcUIsaUJBakJKO0FBa0JqQiwyQkFBbUIsTUFsQkY7QUFtQmpCLHVCQUFlLHdCQW5CRTtBQW9CakIsMkJBQW1CLEdBcEJGO0FBcUJqQiw0QkFBb0IsVUFyQkg7QUFzQmpCLHdCQUFnQixRQXRCQztBQXVCakIseUJBQWlCLFNB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LHFCQUFLZCxNQUFMLEdBQWM1QyxZQUFZWSxHQUFaLEVBQWlCZ0MsTUFBL0I7O0FBRUFXLG9CQUFJZ0IsTUFBSixDQUFXYixJQUFYO0FBQ0FILG9CQUFJNkMsSUFBSixDQUFTQyxVQUFULENBQW9CckcsWUFBWVksR0FBWixFQUFpQmlDLE1BQXJDO0FBQ0gsYUFORCxNQU1PO0FBQ0gsb0JBQUlpRCxRQUFRLGtCQUFRRixLQUFSLENBQWM1RixZQUFZWSxHQUFaLEVBQWlCa0YsS0FBL0IsQ0FBWjtBQUNBQSxzQkFBTWxELE1BQU4sR0FBZTVDLFlBQVlZLEdBQVosRUFBaUJnQyxNQUFoQztBQUNBNUMsNEJBQVlZLEdBQVosRUFBaUJpQyxNQUFqQixDQUF3QkMsV0FBeEIsQ0FBb0M5QyxZQUFZWSxHQUFaLEVBQWlCb0YsSUFBckQsRUFBMkRGLEtBQTNEO0FBQ0g7QUFDSjtBQUNKLEtBdFZEO0FBdVZILENBdGlCRDtBQVBBOztrQkEraUJlekcsTyIsImZpbGUiOiJIYW1zdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBtb2R1bGUgSGFtc3RlclxyXG4gKiBcclxuICogQGRlc2NyaXB0aW9uIFBvc3RDU1MgSGFtc3RlciBmcmFtZXdvcmsgbWFpbiBmdW5jdGlvbmFsaXR5LlxyXG4gKlxyXG4gKiBAdmVyc2lvbiAxLjBcclxuICogQGF1dGhvciBHcmlnb3J5IFZhc2lseWV2IDxwb3N0Y3NzLmhhbXN0ZXJAZ21haWwuY29tPiBodHRwczovL2dpdGh1Yi5jb20vaDB0YzBkM1xyXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNywgR3JpZ29yeSBWYXNpbHlldlxyXG4gKiBAbGljZW5zZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAsIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMCBcclxuICogXHJcbiAqL1xyXG5cclxuaW1wb3J0IEZvbnRTaXplcyBmcm9tIFwiLi9Gb250U2l6ZXNcIjtcclxuXHJcbmltcG9ydCB7XHJcbiAgICBmb3JtYXRJbnQsXHJcbiAgICBmb3JtYXRWYWx1ZSxcclxuICAgIFZlcnRpY2FsUmh5dGhtXHJcbn0gZnJvbSBcIi4vVmVydGljYWxSaHl0aG1cIjtcclxuXHJcbmltcG9ydCBQbmdJbWFnZSBmcm9tIFwiLi9QbmdJbWFnZVwiO1xyXG4vLyBpbXBvcnQgVmlydHVhbE1hY2hpbmUgZnJvbSBcIi4vVmlydHVhbE1hY2hpbmVcIjtcclxuXHJcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuXHJcbmltcG9ydCBwb3N0Y3NzIGZyb20gXCJwb3N0Y3NzXCI7XHJcblxyXG5jb25zdCBoYW1zdGVyID0gKCkgPT4ge1xyXG5cclxuICAgIC8vRGVmYXVsdCBHbG9iYWwgVmFyaWFibGVzXHJcbiAgICBsZXQgZ2xvYmFsU2V0dGluZ3MgPSB7XHJcblxyXG4gICAgICAgIFwiZm9udC1zaXplXCI6IFwiMTZweFwiLFxyXG4gICAgICAgIFwibGluZS1oZWlnaHRcIjogXCIxLjVcIixcclxuICAgICAgICBcInVuaXRcIjogXCJlbVwiLFxyXG4gICAgICAgIFwicHgtZmFsbGJhY2tcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgXCJweC1iYXNlbGluZVwiOiBcImZhbHNlXCIsXHJcbiAgICAgICAgXCJmb250LXJhdGlvXCI6IFwiMFwiLFxyXG5cclxuICAgICAgICBcInByb3BlcnRpZXNcIjogXCJpbmxpbmVcIixcclxuXHJcbiAgICAgICAgXCJtaW4tbGluZS1wYWRkaW5nXCI6IFwiMnB4XCIsXHJcbiAgICAgICAgXCJyb3VuZC10by1oYWxmLWxpbmVcIjogXCJmYWxzZVwiLFxyXG5cclxuICAgICAgICBcInJ1bGVyXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgIFwicnVsZXItc3R5bGVcIjogXCJhbHdheXMgcnVsZXItZGVidWdcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tcG9zaXRpb25cIjogXCJ0b3A6IDEuNWVtO2xlZnQ6IDEuNWVtO1wiLFxyXG4gICAgICAgIFwicnVsZXItaWNvbi1jb2xvcnNcIjogXCIjY2NjY2NjICM0NDU3NmFcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tc2l6ZVwiOiBcIjI0cHhcIixcclxuICAgICAgICBcInJ1bGVyLWNvbG9yXCI6IFwicmdiYSgxOSwgMTM0LCAxOTEsIC44KVwiLFxyXG4gICAgICAgIFwicnVsZXItdGhpY2tuZXNzXCI6IFwiMVwiLFxyXG4gICAgICAgIFwicnVsZXItYmFja2dyb3VuZFwiOiBcImdyYWRpZW50XCIsXHJcbiAgICAgICAgXCJydWxlci1vdXRwdXRcIjogXCJiYXNlNjRcIixcclxuICAgICAgICBcInJ1bGVyLXBhdHRlcm5cIjogXCIxIDAgMCAwXCIsXHJcbiAgICAgICAgXCJydWxlci1zY2FsZVwiOiBcIjFcIixcclxuXHJcbiAgICAgICAgXCJicm93c2VyLWZvbnQtc2l6ZVwiOiBcIjE2cHhcIixcclxuICAgICAgICBcImxlZ2FjeS1icm93c2Vyc1wiOiBcInRydWVcIixcclxuICAgICAgICBcInJlbW92ZS1jb21tZW50c1wiOiBcImZhbHNlXCJcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBoZWxwZXJzID0ge1xyXG4gICAgICAgIFwicmVzZXRcIjogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vaGVscGVycy9yZXNldC5jc3NcIiksIFwidXRmOFwiKSxcclxuICAgICAgICBcIm5vcm1hbGl6ZVwiOiBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9oZWxwZXJzL25vcm1hbGl6ZS5jc3NcIiksIFwidXRmOFwiKSxcclxuICAgICAgICBcIm5vd3JhcFwiOiBcIndoaXRlLXNwYWNlOiBub3dyYXA7XCIsXHJcbiAgICAgICAgXCJmb3JjZXdyYXBcIjogXCJ3aGl0ZS1zcGFjZTogcHJlO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogcHJlLWxpbmU7XCIgK1xyXG4gICAgICAgICAgICBcIndoaXRlLXNwYWNlOiAtcHJlLXdyYXA7XCIgK1xyXG4gICAgICAgICAgICBcIndoaXRlLXNwYWNlOiAtby1wcmUtd3JhcDtcIiArXHJcbiAgICAgICAgICAgIFwid2hpdGUtc3BhY2U6IC1tb3otcHJlLXdyYXA7XCIgK1xyXG4gICAgICAgICAgICBcIndoaXRlLXNwYWNlOiAtaHAtcHJlLXdyYXA7XCIgK1xyXG4gICAgICAgICAgICBcIndoaXRlLXNwYWNlOiBwcmUtd3JhcDtcIiArXHJcbiAgICAgICAgICAgIFwid29yZC13cmFwOiBicmVhay13b3JkO1wiLFxyXG4gICAgICAgIFwiZWxsaXBzaXNcIjogXCJvdmVyZmxvdzogaGlkZGVuO1wiICtcclxuICAgICAgICAgICAgXCJ0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcIlxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLy8gQ3VycmVudCBWYXJpYWJsZXNcclxuICAgIGxldCBjdXJyZW50U2V0dGluZ3MgPSB7fTtcclxuICAgIGxldCBjdXJyZW50U2V0dGluZ3NSZWdleHA7XHJcbiAgICAvL0N1cnJlbnQgRm9udFNpemVzXHJcbiAgICBsZXQgY3VycmVudEZvbnRTaXplcyA9IFwiXCI7XHJcbiAgICAvLyBmb250IFNpemVzXHJcbiAgICBsZXQgZm9udFNpemVzQ29sbGVjdGlvbjtcclxuICAgIC8vIFZlcnRpY2FsIFJoeXRobSBDYWxjdWxhdG9yXHJcbiAgICBsZXQgcmh5dGhtQ2FsY3VsYXRvcjtcclxuICAgIC8vIExhc3QgQ3NzIEZpbGVcclxuICAgIGxldCBleHRlbmROb2RlcyA9IHt9O1xyXG4gICAgLy8gbGV0IGxhc3RGaWxlO1xyXG5cclxuICAgIC8vIGxldCB2bSA9IG5ldyBWaXJ0dWFsTWFjaGluZSgpO1xyXG4gICAgLy8gZm9udFNpemUgcHJvcGVydHkgUmVnZXhwXHJcbiAgICBjb25zdCBmb250U2l6ZVJlZ2V4cCA9IG5ldyBSZWdFeHAoXCJmb250U2l6ZVxcXFxzKyhbXFxcXC1cXFxcJFxcXFxAMC05YS16QS1aXSspXCIsIFwiaVwiKTtcclxuXHJcbiAgICAvLyBsaW5lSGVpZ2h0IHByb3BlcnR5IFJlZ2V4cFxyXG4gICAgY29uc3QgbGluZVJlZ2V4cCA9IG5ldyBSZWdFeHAoXCIobGluZUhlaWdodHxzcGFjaW5nfGxlYWRpbmcpXFxcXCgoLio/KVxcXFwpXCIsIFwiaVwiKTtcclxuXHJcbiAgICAvLyBDb3B5IFZhbHVlcyBmcm9tIG9iamVjdCAyIHRvIG9iamVjdCAxO1xyXG4gICAgY29uc3QgZXh0ZW5kID0gKG9iamVjdDEsIG9iamVjdDIpID0+IHtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QyKSwga2V5c1NpemUgPSBrZXlzLmxlbmd0aDsgaSA8IGtleXNTaXplOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGtleXNbaV07XHJcbiAgICAgICAgICAgIG9iamVjdDFba2V5XSA9IG9iamVjdDJba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9iamVjdDE7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHRvQ2FtZWxDYXNlID0gKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXlteYS16MC05XSooLiopW15hLXowLTldKiQvLCBcIiQxXCIpLnJlcGxhY2UoL1teYS16MC05XSsoW2EtejAtOV0pL2csIChtYXRjaCwgbGV0dGVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBsZXR0ZXIudG9VcHBlckNhc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICAvLyBJbml0IGN1cnJlbnQgU2V0dGluZ3NcclxuICAgIGNvbnN0IGluaXRTZXR0aW5ncyA9ICgpID0+IHtcclxuICAgICAgICAvLyBBZGQgZm9udFNpemVzXHJcbiAgICAgICAgaWYgKFwiZm9udC1zaXplc1wiIGluIGdsb2JhbFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBnbG9iYWxTZXR0aW5nc1tcImZvbnQtc2l6ZXNcIl07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXCJmb250LXNpemVzXCIgaW4gY3VycmVudFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBjdXJyZW50Rm9udFNpemVzICsgXCIsIFwiICsgY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplc1wiXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvbnRTaXplc0NvbGxlY3Rpb24gPSBuZXcgRm9udFNpemVzKGN1cnJlbnRTZXR0aW5ncyk7XHJcbiAgICAgICAgcmh5dGhtQ2FsY3VsYXRvciA9IG5ldyBWZXJ0aWNhbFJoeXRobShjdXJyZW50U2V0dGluZ3MpO1xyXG4gICAgICAgIGZvbnRTaXplc0NvbGxlY3Rpb24uYWRkRm9udFNpemVzKGN1cnJlbnRGb250U2l6ZXMsIHJoeXRobUNhbGN1bGF0b3IpO1xyXG4gICAgICAgIGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCA9IG5ldyBSZWdFeHAoXCJcXFxcQChcIiArIE9iamVjdC5rZXlzKGN1cnJlbnRTZXR0aW5ncykuam9pbihcInxcIikucmVwbGFjZSgvKFxcLXxcXF8pL2csIFwiXFxcXCQxXCIpICsgXCIpXCIsIFwiaVwiKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHdhbGtEZWNscyA9IChub2RlKSA9PiB7XHJcbiAgICAgICAgbm9kZS53YWxrRGVjbHMoZGVjbCA9PiB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZm91bmQ7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXBsYWNlIFZhcmlhYmxlcyB3aXRoIHZhbHVlc1xyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChjdXJyZW50U2V0dGluZ3NSZWdleHApKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhcmlhYmxlID0gZm91bmRbMV07XHJcbiAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCwgY3VycmVudFNldHRpbmdzW3ZhcmlhYmxlXSk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZXBsYWNlIEZvbnQgU2l6ZVxyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChmb250U2l6ZVJlZ2V4cCkpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IFtmb250U2l6ZSwgc2l6ZVVuaXRdID0gZm91bmRbMV0uc3BsaXQoL1xcJC9pKTtcclxuICAgICAgICAgICAgICAgIHNpemVVbml0ID0gKHNpemVVbml0ICE9IG51bGwpID8gc2l6ZVVuaXQudG9Mb3dlckNhc2UoKSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHNpemUgPSBmb250U2l6ZXNDb2xsZWN0aW9uLmdldFNpemUoZm9udFNpemUpO1xyXG4gICAgICAgICAgICAgICAgLy8gV3JpdGUgZm9udCBzaXplXHJcbiAgICAgICAgICAgICAgICBpZiAoc2l6ZVVuaXQgIT0gbnVsbCAmJiAoc2l6ZVVuaXQgPT0gXCJlbVwiIHx8IHNpemVVbml0ID09IFwicmVtXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGZvcm1hdFZhbHVlKHNpemUucmVsKSArIHNpemVVbml0KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNpemVVbml0ICE9IG51bGwgJiYgc2l6ZVVuaXQgPT0gXCJweFwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGZvcm1hdEludChzaXplLnB4KSArIFwicHhcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVuaXQgPSBnbG9iYWxTZXR0aW5nc1tcInVuaXRcIl0udG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2ZzaXplID0gKHVuaXQgPT0gXCJweFwiKSA/IGZvcm1hdEludChzaXplLnB4KSA6IGZvcm1hdFZhbHVlKHNpemUucmVsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb250U2l6ZVJlZ2V4cCwgY2ZzaXplICsgdW5pdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRqdXN0IEZvbnQgU2l6ZVxyXG4gICAgICAgICAgICBpZiAoZGVjbC5wcm9wID09IFwiYWRqdXN0LWZvbnQtc2l6ZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IFtmb250U2l6ZSwgbGluZXMsIGJhc2VGb250U2l6ZV0gPSBkZWNsLnZhbHVlLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm9udFNpemVVbml0ID0gZm9udFNpemUubWF0Y2goLyhweHxlbXxyZW0pJC9pKVswXS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvbnRTaXplID0gcmh5dGhtQ2FsY3VsYXRvci5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIG51bGwsIGJhc2VGb250U2l6ZSkgKyBjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBmb250U2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IHJoeXRobUNhbGN1bGF0b3IubGluZUhlaWdodChmb250U2l6ZSwgbGluZXMsIGJhc2VGb250U2l6ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHREZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGxpbmVIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBkZWNsLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVjbC5wcm9wID0gXCJmb250LXNpemVcIjtcclxuICAgICAgICAgICAgICAgIGRlY2wucGFyZW50Lmluc2VydEFmdGVyKGRlY2wsIGxpbmVIZWlnaHREZWNsKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gbGluZUhlaWdodCwgc3BhY2luZywgbGVhZGluZ1xyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChsaW5lUmVnZXhwKSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBmb3VuZFsxXS50b0xvd2VyQ2FzZSgpOyAvLyBzcGFjaW5nIG9yIGxpbmVIZWlnaHRcclxuICAgICAgICAgICAgICAgIGxldCBwYXJhbWV0ZXJzID0gZm91bmRbMl0uc3BsaXQoL1xccypcXCxcXHMqLyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgcGFyYW1ldGVyc1NpemUgPSBwYXJhbWV0ZXJzLmxlbmd0aDsgaSA8IHBhcmFtZXRlcnNTaXplOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBsZXQgW3ZhbHVlLCBmb250U2l6ZV0gPSBwYXJhbWV0ZXJzW2ldLnNwbGl0KC9cXHMrLyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmb250U2l6ZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2wucGFyZW50LndhbGtEZWNscyhcImZvbnQtc2l6ZVwiLCBmc2RlY2wgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSBmc2RlY2wudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZvbnRTaXplID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSBjdXJyZW50U2V0dGluZ3NbXCJmb250LXNpemVcIl07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkgPT0gXCJsaW5laGVpZ2h0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodCArPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIHZhbHVlKSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkgPT0gXCJzcGFjaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodCArPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIHZhbHVlLCBudWxsLCB0cnVlKSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkgPT0gXCJsZWFkaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodCArPSByaHl0aG1DYWxjdWxhdG9yLmxlYWRpbmcodmFsdWUsIGZvbnRTaXplKSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvdW5kWzBdLCBsaW5lSGVpZ2h0LnJlcGxhY2UoL1xccyskLywgXCJcIikpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicHgtZmFsbGJhY2tcIl0gPT0gXCJ0cnVlXCIgJiYgZGVjbC52YWx1ZS5tYXRjaCgvWzAtOVxcLl0rcmVtL2kpKSB7XHJcbiAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC5pbnNlcnRCZWZvcmUoZGVjbCwgZGVjbC5jbG9uZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJoeXRobUNhbGN1bGF0b3IucmVtRmFsbGJhY2soZGVjbC52YWx1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBkZWNsLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiAoY3NzKSA9PiB7XHJcblxyXG4gICAgICAgIGNzcy53YWxrKG5vZGUgPT4ge1xyXG4gICAgICAgICAgICAvLyBpZiAobGFzdEZpbGUgIT0gbm9kZS5zb3VyY2UuaW5wdXQuZmlsZSkge1xyXG4gICAgICAgICAgICAvLyBcdGxhc3RGaWxlID0gbm9kZS5zb3VyY2UuaW5wdXQuZmlsZTtcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgaWYgKG5vZGUudHlwZSA9PSBcImF0cnVsZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHJ1bGUgPSBub2RlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChydWxlLm5hbWUgPT0gXCJoYW1zdGVyXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGUucGFyYW1zICE9IFwiZW5kXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIEdsb2JhbCBWYXJpYWJsZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS53YWxrRGVjbHMoZGVjbCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxTZXR0aW5nc1tkZWNsLnByb3BdID0gZGVjbC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGZvbnRTaXplc1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChcImZvbnQtc2l6ZXNcIiBpbiBnbG9iYWxTZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Rm9udFNpemVzID0gZ2xvYmFsU2V0dGluZ3NbXCJmb250LXNpemVzXCJdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCBjdXJyZW50IHZhcmlhYmxlc1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTZXR0aW5ncyA9IGV4dGVuZCh7fSwgZ2xvYmFsU2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJbml0IGN1cnJlbnQgU2V0dGluZ3NcclxuICAgICAgICAgICAgICAgICAgICBpbml0U2V0dGluZ3MoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIFJ1bGUgSGFtc3RlclxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUgPT0gXCIhaGFtc3RlclwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vY3VycmVudFNldHRpbmdzID0gZXh0ZW5kKHt9LCBnbG9iYWxTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUud2Fsa0RlY2xzKGRlY2wgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3NbZGVjbC5wcm9wXSA9IGRlY2wudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRTZXR0aW5ncygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lID09IFwiYmFzZWxpbmVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgZm9udFNpemUgPSBwYXJzZUludChjdXJyZW50U2V0dGluZ3NbXCJmb250LXNpemVcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBicm93c2VyRm9udFNpemUgPSBwYXJzZUludChjdXJyZW50U2V0dGluZ3NbXCJicm93c2VyLWZvbnQtc2l6ZVwiXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxlZ2FjeUJyb3dzZXJzID0gY3VycmVudFNldHRpbmdzW1wibGVnYWN5LWJyb3dzZXJzXCJdLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHB4QmFzZWxpbmUgPSBjdXJyZW50U2V0dGluZ3NbXCJweC1iYXNlbGluZVwiXS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmh5dGhtVW5pdCA9IGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0udG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUgKyBcInB4XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBiYXNlbGluZSBmb250IHNpemVcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZm9udFNpemVEZWNsID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHB4QmFzZWxpbmUgPT0gXCJ0cnVlXCIgfHwgKHJoeXRobVVuaXQgPT0gXCJweFwiICYmIGxlZ2FjeUJyb3dzZXJzICE9IFwidHJ1ZVwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemVEZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IFwiZm9udC1zaXplXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZm9udFNpemUgKyBcInB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbGF0aXZlU2l6ZSA9IDEwMCAqIGZvbnRTaXplIC8gYnJvd3NlckZvbnRTaXplO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemVEZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IFwiZm9udC1zaXplXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZm9ybWF0VmFsdWUocmVsYXRpdmVTaXplKSArIFwiJVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodERlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBsaW5lSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocnVsZS5wYXJhbXMubWF0Y2goL1xccypodG1sXFxzKi8pKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaHRtbFJ1bGUgPSBwb3N0Y3NzLnJ1bGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxSdWxlLmFwcGVuZChmb250U2l6ZURlY2wpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sUnVsZS5hcHBlbmQobGluZUhlaWdodERlY2wpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgaHRtbFJ1bGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJoeXRobVVuaXQgPT0gXCJweFwiICYmIGxlZ2FjeUJyb3dzZXJzID09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXN0ZXJpc2tIdG1sUnVsZSA9IHBvc3Rjc3MucnVsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiKiBodG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Rlcmlza0h0bWxSdWxlLmFwcGVuZChsaW5lSGVpZ2h0RGVjbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBhc3Rlcmlza0h0bWxSdWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgbGluZUhlaWdodERlY2wpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBmb250U2l6ZURlY2wpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJoeXRobVVuaXQgPT0gXCJyZW1cIiAmJiBjdXJyZW50U2V0dGluZ3NbXCJweC1mYWxsYmFja1wiXSA9PSBcInRydWVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShsaW5lSGVpZ2h0RGVjbCwgcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJoeXRobUNhbGN1bGF0b3IucmVtRmFsbGJhY2sobGluZUhlaWdodCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcInJ1bGVyXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVySWNvblBvc2l0aW9uID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItaWNvbi1wb3NpdGlvblwiXS5yZXBsYWNlKC8oXFwnfFxcXCIpL2csIFwiXCIpLnJlcGxhY2UoL1xcOy9nLCBcIjtcXG5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0ID0gKGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdLm1hdGNoKC9weCQvaSkpID8gY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0gOiBjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSArIFwiZW1cIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGY4LCUzQ3N2ZyB4bWxucyUzRCUyN2h0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyNyB2aWV3Qm94JTNEJTI3MCAwIDI0IDI0JTI3JTNFJTNDcGF0aCBmaWxsJTNEJTI3e2NvbG9yfSUyNyBkJTNEJTI3TTE4IDI0Yy0wLjMgMC0wLjU0OC0wLjI0Ni0wLjU0OC0wLjU0NlYxOGMwLTAuMyAwLjI0OC0wLjU0NiAwLjU0OC0wLjU0Nmg1LjQ1MiAgQzIzLjc1NCAxNy40NTQgMjQgMTcuNyAyNCAxOHY1LjQ1NGMwIDAuMy0wLjI0NiAwLjU0Ni0wLjU0OCAwLjU0NkgxOHogTTkuMjcxIDI0Yy0wLjI5OCAwLTAuNTQzLTAuMjQ2LTAuNTQzLTAuNTQ2VjE4ICBjMC0wLjMgMC4yNDUtMC41NDYgMC41NDMtMC41NDZoNS40NTdjMC4zIDAgMC41NDMgMC4yNDYgMC41NDMgMC41NDZ2NS40NTRjMCAwLjMtMC4yNDMgMC41NDYtMC41NDMgMC41NDZIOS4yNzF6IE0wLjU0OCAyNCAgQzAuMjQ2IDI0IDAgMjMuNzU0IDAgMjMuNDU0VjE4YzAtMC4zIDAuMjQ2LTAuNTQ2IDAuNTQ4LTAuNTQ2SDZjMC4zMDIgMCAwLjU0OCAwLjI0NiAwLjU0OCAwLjU0NnY1LjQ1NEM2LjU0OCAyMy43NTQgNi4zMDIgMjQgNiAyNCAgSDAuNTQ4eiBNMTggMTUuMjcxYy0wLjMgMC0wLjU0OC0wLjI0NC0wLjU0OC0wLjU0MlY5LjI3MmMwLTAuMjk5IDAuMjQ4LTAuNTQ1IDAuNTQ4LTAuNTQ1aDUuNDUyQzIzLjc1NCA4LjcyNyAyNCA4Ljk3MyAyNCA5LjI3MiAgdjUuNDU3YzAgMC4yOTgtMC4yNDYgMC41NDItMC41NDggMC41NDJIMTh6IE05LjI3MSAxNS4yNzFjLTAuMjk4IDAtMC41NDMtMC4yNDQtMC41NDMtMC41NDJWOS4yNzJjMC0wLjI5OSAwLjI0NS0wLjU0NSAwLjU0My0wLjU0NSAgaDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ2IDAuNTQzIDAuNTQ1djUuNDU3YzAgMC4yOTgtMC4yNDMgMC41NDItMC41NDMgMC41NDJIOS4yNzF6IE0wLjU0OCAxNS4yNzFDMC4yNDYgMTUuMjcxIDAgMTUuMDI2IDAgMTQuNzI5ICBWOS4yNzJjMC0wLjI5OSAwLjI0Ni0wLjU0NSAwLjU0OC0wLjU0NUg2YzAuMzAyIDAgMC41NDggMC4yNDYgMC41NDggMC41NDV2NS40NTdjMCAwLjI5OC0wLjI0NiAwLjU0Mi0wLjU0OCAwLjU0MkgwLjU0OHogTTE4IDYuNTQ1ICBjLTAuMyAwLTAuNTQ4LTAuMjQ1LTAuNTQ4LTAuNTQ1VjAuNTQ1QzE3LjQ1MiAwLjI0NSAxNy43IDAgMTggMGg1LjQ1MkMyMy43NTQgMCAyNCAwLjI0NSAyNCAwLjU0NVY2YzAgMC4zLTAuMjQ2IDAuNTQ1LTAuNTQ4IDAuNTQ1ICBIMTh6IE05LjI3MSA2LjU0NUM4Ljk3NCA2LjU0NSA4LjcyOSA2LjMgOC43MjkgNlYwLjU0NUM4LjcyOSAwLjI0NSA4Ljk3NCAwIDkuMjcxIDBoNS40NTdjMC4zIDAgMC41NDMgMC4yNDUgMC41NDMgMC41NDVWNiAgYzAgMC4zLTAuMjQzIDAuNTQ1LTAuNTQzIDAuNTQ1SDkuMjcxeiBNMC41NDggNi41NDVDMC4yNDYgNi41NDUgMCA2LjMgMCA2VjAuNTQ1QzAgMC4yNDUgMC4yNDYgMCAwLjU0OCAwSDYgIGMwLjMwMiAwIDAuNTQ4IDAuMjQ1IDAuNTQ4IDAuNTQ1VjZjMCAwLjMtMC4yNDYgMC41NDUtMC41NDggMC41NDVIMC41NDh6JTI3JTJGJTNFJTNDJTJGc3ZnJTNFXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAyNCAyNCUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00wLDZjMCwwLjMwMSwwLjI0NiwwLjU0NSwwLjU0OSwwLjU0NWgyMi45MDZDMjMuNzU2LDYuNTQ1LDI0LDYuMzAxLDI0LDZWMi43M2MwLTAuMzA1LTAuMjQ0LTAuNTQ5LTAuNTQ1LTAuNTQ5SDAuNTQ5ICBDMC4yNDYsMi4xODIsMCwyLjQyNiwwLDIuNzNWNnogTTAsMTMuNjM3YzAsMC4yOTcsMC4yNDYsMC41NDUsMC41NDksMC41NDVoMjIuOTA2YzAuMzAxLDAsMC41NDUtMC4yNDgsMC41NDUtMC41NDV2LTMuMjczICBjMC0wLjI5Ny0wLjI0NC0wLjU0NS0wLjU0NS0wLjU0NUgwLjU0OUMwLjI0Niw5LjgxOCwwLDEwLjA2NiwwLDEwLjM2M1YxMy42Mzd6IE0wLDIxLjI3YzAsMC4zMDUsMC4yNDYsMC41NDksMC41NDksMC41NDloMjIuOTA2ICBjMC4zMDEsMCwwLjU0NS0wLjI0NCwwLjU0NS0wLjU0OVYxOGMwLTAuMzAxLTAuMjQ0LTAuNTQ1LTAuNTQ1LTAuNTQ1SDAuNTQ5QzAuMjQ2LDE3LjQ1NSwwLDE3LjY5OSwwLDE4VjIxLjI3eiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAzMiAzMiUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00yOCwyMGgtNHYtOGg0YzEuMTA0LDAsMi0wLjg5NiwyLTJzLTAuODk2LTItMi0yaC00VjRjMC0xLjEwNC0wLjg5Ni0yLTItMnMtMiwwLjg5Ni0yLDJ2NGgtOFY0YzAtMS4xMDQtMC44OTYtMi0yLTIgIFM4LDIuODk2LDgsNHY0SDRjLTEuMTA0LDAtMiwwLjg5Ni0yLDJzMC44OTYsMiwyLDJoNHY4SDRjLTEuMTA0LDAtMiwwLjg5Ni0yLDJzMC44OTYsMiwyLDJoNHY0YzAsMS4xMDQsMC44OTYsMiwyLDJzMi0wLjg5NiwyLTJ2LTQgIGg4djRjMCwxLjEwNCwwLjg5NiwyLDIsMnMyLTAuODk2LDItMnYtNGg0YzEuMTA0LDAsMi0wLjg5NiwyLTJTMjkuMTA0LDIwLDI4LDIweiBNMTIsMjB2LThoOHY4SDEyeiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBndGhpY2tuZXNzID0gcGFyc2VGbG9hdChjdXJyZW50U2V0dGluZ3NbXCJydWxlci10aGlja25lc3NcIl0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgYmFja2dyb3VuZCA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJydWxlci1iYWNrZ3JvdW5kXCJdID09IFwicG5nXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZUhlaWdodCA9IChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXS5tYXRjaCgvcHgkLykpID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAocGFyc2VGbG9hdChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSkgKiBwYXJzZUZsb2F0KGN1cnJlbnRTZXR0aW5nc1tcImZvbnQtc2l6ZVwiXSkpLnRvRml4ZWQoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXR0ZXJuID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItcGF0dGVyblwiXS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2UgPSBuZXcgUG5nSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UucnVsZXJNYXRyaXgoaW1hZ2VIZWlnaHQsIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWNvbG9yXCJdLCBwYXR0ZXJuLCBndGhpY2tuZXNzLCBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1zY2FsZVwiXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJydWxlci1vdXRwdXRcIl0gIT0gXCJiYXNlNjRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuZ2V0RmlsZShjdXJyZW50U2V0dGluZ3NbXCJydWxlci1vdXRwdXRcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCIuLi9cIiArIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLW91dHB1dFwiXSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1wb3NpdGlvbjogbGVmdCB0b3A7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1yZXBlYXQ6IHJlcGVhdDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXNpemU6IFwiICsgcGF0dGVybi5sZW5ndGggKyBcInB4IFwiICsgaW1hZ2VIZWlnaHQgKyBcInB4O1wiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LFwiICsgaW1hZ2UuZ2V0QmFzZTY0KCkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcG9zaXRpb246IGxlZnQgdG9wO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcmVwZWF0OiByZXBlYXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1zaXplOiBcIiArIHBhdHRlcm4ubGVuZ3RoICsgXCJweCBcIiArIGltYWdlSGVpZ2h0ICsgXCJweDtcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGd0aGlja25lc3MgPSBndGhpY2tuZXNzICogMztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcImJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byB0b3AsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWNvbG9yXCJdICsgXCIgXCIgKyBndGhpY2tuZXNzICsgXCIlLCB0cmFuc3BhcmVudCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBndGhpY2tuZXNzICsgXCIlKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtc2l6ZTogMTAwJSBcIiArIGxpbmVIZWlnaHQgKyBcIjtcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBydWxlciA9IFwicG9zaXRpb246IGFic29sdXRlO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJsZWZ0OiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b3A6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1hcmdpbjogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGg6IDEwMCU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodDogMTAwJTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiei1pbmRleDogOTkwMDtcIiArIGJhY2tncm91bmQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpY29uU2l6ZSA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWljb24tc2l6ZVwiXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFtzdHlsZSwgcnVsZXJDbGFzc10gPSBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1zdHlsZVwiXS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBbY29sb3IsIGhvdmVyQ29sb3JdID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItaWNvbi1jb2xvcnNcIl0uc3BsaXQoL1xccysvKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVyUnVsZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHlsZSA9PSBcInN3aXRjaFwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTogbm9uZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlciArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6bm9uZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdICsgbGFiZWwge1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiei1pbmRleDogOTk5OTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6IGlubGluZS1ibG9jaztcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArIHJ1bGVySWNvblBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoOiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHQ6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnNvcjogcG9pbnRlcjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnJlcGxhY2UoL1xce2NvbG9yXFx9LywgZXNjYXBlKGNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl06Y2hlY2tlZCArIGxhYmVsLCBpbnB1dFtpZD1cXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJDbGFzcyArIFwiXFxcIl06aG92ZXIgKyBsYWJlbCB7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIlwiICsgc3ZnLnJlcGxhY2UoL1xce2NvbG9yXFx9LywgZXNjYXBlKGhvdmVyQ29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJDbGFzcyArIFwiXFxcIl06Y2hlY2tlZCB+IC5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6IGJsb2NrO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdHlsZSA9PSBcImhvdmVyXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCIuXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbjogYWJzb2x1dGU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJJY29uUG9zaXRpb24gK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYWRkaW5nOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGg6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJcIiArIHN2Zy5yZXBsYWNlKC9cXHtjb2xvclxcfS8sIGVzY2FwZShjb2xvcikpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRyYW5zaXRpb246IGJhY2tncm91bmQtaW1hZ2UgMC41cyBlYXNlLWluLW91dDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIjpob3ZlclwiICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjdXJzb3I6IHBvaW50ZXI7XCIgKyBydWxlciArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3R5bGUgPT0gXCJhbHdheXNcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJSdWxlID0gcG9zdGNzcy5wYXJzZShcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcXG5cIiArIHJ1bGVyICsgXCJ9XFxuXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlclJ1bGUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUuc291cmNlID0gcnVsZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBydWxlclJ1bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lLm1hdGNoKC9eKGVsbGlwc2lzfG5vd3JhcHxmb3JjZXdyYXApJC9pKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBydWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlY2xzID0gaGVscGVyc1twcm9wZXJ0eV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eSA9PSBcImVsbGlwc2lzXCIgJiYgcnVsZS5wYXJhbXMgPT0gXCJ0cnVlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjbHMgPSBoZWxwZXJzW1wibm93cmFwXCJdICsgZGVjbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJwcm9wZXJ0aWVzXCJdID09IFwiaW5saW5lXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkZWNscyA9IHBvc3Rjc3MucGFyc2UoZGVjbHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgZGVjbHMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInByb3BlcnRpZXNcIl0gPT0gXCJleHRlbmRcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4dGVuZE5hbWUgPSB0b0NhbWVsQ2FzZShydWxlLm5hbWUudG9Mb3dlckNhc2UoKSArIFwiIFwiICsgcnVsZS5wYXJhbXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIGV4dGVuZCBpbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogcnVsZS5wYXJlbnQuc2VsZWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbHM6IGRlY2xzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogcnVsZS5wYXJlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldjogcnVsZS5wcmV2KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9BcHBlbmQgc2VsZWN0b3IgYW5kIHVwZGF0ZSBjb3VudGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5zZWxlY3RvciA9IGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLnNlbGVjdG9yICsgXCIsIFwiICsgcnVsZS5wYXJlbnQuc2VsZWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5jb3VudCsrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZS5tYXRjaCgvXihyZXNldHxub3JtYWxpemUpJC9pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9wZXJ0eSA9IHJ1bGUubmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBydWxlcyA9IHBvc3Rjc3MucGFyc2UoaGVscGVyc1twcm9wZXJ0eV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGVzLnNvdXJjZSA9IHJ1bGUuc291cmNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIHJ1bGVzKTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gV2FsayBpbiBtZWRpYSBxdWVyaWVzXHJcbiAgICAgICAgICAgICAgICBub2RlLndhbGsoY2hpbGQgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQudHlwZSA9PSBcInJ1bGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXYWxrIGRlY2xzIGluIHJ1bGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2Fsa0RlY2xzKGNoaWxkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBlbHNlIGlmIChydWxlLm5hbWUgPT0gXCJqc1wiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGxldCBqY3NzID0gcnVsZS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIC8vIGxldCBjb2RlID0gamNzcy5yZXBsYWNlKC9cXEBqc1xccypcXHsoW1xcc1xcU10rKVxcfSQvaSwgXCIkMVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coamNzcyk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgLy8gcnVsZXJSdWxlLnNvdXJjZSA9IHJ1bGUuc291cmNlO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIC8vIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBydWxlclJ1bGUpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIHJ1bGUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PSBcInJ1bGVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFdhbGsgZGVjbHMgaW4gcnVsZVxyXG4gICAgICAgICAgICAgICAgd2Fsa0RlY2xzKG5vZGUpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50U2V0dGluZ3NbXCJyZW1vdmUtY29tbWVudHNcIl0gPT0gXCJ0cnVlXCIgJiYgbm9kZS50eXBlID09IFwiY29tbWVudFwiKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBBcHBlbmQgRXh0ZW5kcyB0byBDU1NcclxuICAgICAgICBmb3IgKGxldCBpID0gMCwga2V5cyA9IE9iamVjdC5rZXlzKGV4dGVuZE5vZGVzKSwga2V5c1NpemUgPSBrZXlzLmxlbmd0aDsgaSA8IGtleXNTaXplOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGtleXNbaV07XHJcbiAgICAgICAgICAgIGlmIChleHRlbmROb2Rlc1trZXldLmNvdW50ID4gMSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJ1bGUgPSBwb3N0Y3NzLnBhcnNlKGV4dGVuZE5vZGVzW2tleV0uc2VsZWN0b3IgKyBcIntcIiArIGV4dGVuZE5vZGVzW2tleV0uZGVjbHMgKyBcIn1cIik7XHJcbiAgICAgICAgICAgICAgICBydWxlLnNvdXJjZSA9IGV4dGVuZE5vZGVzW2tleV0uc291cmNlO1xyXG5cclxuICAgICAgICAgICAgICAgIGNzcy5hcHBlbmQocnVsZSk7XHJcbiAgICAgICAgICAgICAgICBjc3MubGFzdC5tb3ZlQmVmb3JlKGV4dGVuZE5vZGVzW2tleV0ucGFyZW50KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZWNscyA9IHBvc3Rjc3MucGFyc2UoZXh0ZW5kTm9kZXNba2V5XS5kZWNscyk7XHJcbiAgICAgICAgICAgICAgICBkZWNscy5zb3VyY2UgPSBleHRlbmROb2Rlc1trZXldLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2tleV0ucGFyZW50Lmluc2VydEFmdGVyKGV4dGVuZE5vZGVzW2tleV0ucHJldiwgZGVjbHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGhhbXN0ZXI7Il19
