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

                        var idecls = _postcss2.default.parse(decls);
                        rule.parent.insertBefore(rule, idecls);
                    } else if (currentSettings["properties"] == "extend") {

                        var extendName = toCamelCase(rule.name.toLowerCase() + " " + rule.params);

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhhbXN0ZXIiLCJnbG9iYWxTZXR0aW5ncyIsImhlbHBlcnMiLCJyZWFkRmlsZVN5bmMiLCJyZXNvbHZlIiwiX19kaXJuYW1lIiwiY3VycmVudFNldHRpbmdzIiwiY3VycmVudFNldHRpbmdzUmVnZXhwIiwiY3VycmVudEZvbnRTaXplcyIsImZvbnRTaXplc0NvbGxlY3Rpb24iLCJyaHl0aG1DYWxjdWxhdG9yIiwiZXh0ZW5kTm9kZXMiLCJmb250U2l6ZVJlZ2V4cCIsIlJlZ0V4cCIsImxpbmVSZWdleHAiLCJleHRlbmQiLCJvYmplY3QxIiwib2JqZWN0MiIsImkiLCJrZXlzIiwiT2JqZWN0Iiwia2V5c1NpemUiLCJsZW5ndGgiLCJrZXkiLCJ0b0NhbWVsQ2FzZSIsInZhbHVlIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwibWF0Y2giLCJsZXR0ZXIiLCJ0b1VwcGVyQ2FzZSIsImluaXRTZXR0aW5ncyIsImFkZEZvbnRTaXplcyIsImpvaW4iLCJ3YWxrRGVjbHMiLCJub2RlIiwiZm91bmQiLCJkZWNsIiwidmFyaWFibGUiLCJzcGxpdCIsImZvbnRTaXplIiwic2l6ZVVuaXQiLCJzaXplIiwiZ2V0U2l6ZSIsInJlbCIsInB4IiwidW5pdCIsImNmc2l6ZSIsInByb3AiLCJsaW5lcyIsImJhc2VGb250U2l6ZSIsImZvbnRTaXplVW5pdCIsImNvbnZlcnQiLCJsaW5lSGVpZ2h0IiwibGluZUhlaWdodERlY2wiLCJzb3VyY2UiLCJwYXJlbnQiLCJpbnNlcnRBZnRlciIsInByb3BlcnR5IiwicGFyYW1ldGVycyIsInBhcmFtZXRlcnNTaXplIiwiZnNkZWNsIiwibGVhZGluZyIsImluc2VydEJlZm9yZSIsImNsb25lIiwicmVtRmFsbGJhY2siLCJjc3MiLCJ3YWxrIiwidHlwZSIsInJ1bGUiLCJuYW1lIiwicGFyYW1zIiwicmVtb3ZlIiwicGFyc2VJbnQiLCJicm93c2VyRm9udFNpemUiLCJsZWdhY3lCcm93c2VycyIsInB4QmFzZWxpbmUiLCJyaHl0aG1Vbml0IiwiZm9udFNpemVEZWNsIiwicmVsYXRpdmVTaXplIiwiaHRtbFJ1bGUiLCJzZWxlY3RvciIsImFwcGVuZCIsImFzdGVyaXNrSHRtbFJ1bGUiLCJydWxlckljb25Qb3NpdGlvbiIsInN2ZyIsImd0aGlja25lc3MiLCJwYXJzZUZsb2F0IiwiYmFja2dyb3VuZCIsImltYWdlSGVpZ2h0IiwidG9GaXhlZCIsInBhdHRlcm4iLCJpbWFnZSIsInJ1bGVyTWF0cml4IiwiZ2V0RmlsZSIsImdldEJhc2U2NCIsInJ1bGVyIiwiaWNvblNpemUiLCJzdHlsZSIsInJ1bGVyQ2xhc3MiLCJjb2xvciIsImhvdmVyQ29sb3IiLCJydWxlclJ1bGUiLCJwYXJzZSIsImVzY2FwZSIsImRlY2xzIiwiaWRlY2xzIiwiZXh0ZW5kTmFtZSIsInBhcmVudHMiLCJwcmV2IiwiY291bnQiLCJwdXNoIiwicnVsZXMiLCJjaGlsZCIsImoiLCJub2RlcyJdLCJtYXBwaW5ncyI6Ijs7OztBQVlBOzs7O0FBRUE7O0FBTUE7Ozs7QUFHQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQTFCQTs7Ozs7Ozs7Ozs7O0FBNEJBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxHQUFNOztBQUVsQjtBQUNBLFFBQUlDLGlCQUFpQjs7QUFFakIscUJBQWEsTUFGSTtBQUdqQix1QkFBZSxLQUhFO0FBSWpCLGdCQUFRLElBSlM7QUFLakIsdUJBQWUsTUFMRTtBQU1qQix1QkFBZSxPQU5FO0FBT2pCLHNCQUFjLEdBUEc7O0FBU2pCLHNCQUFjLFFBVEc7O0FBV2pCLDRCQUFvQixLQVhIO0FBWWpCLDhCQUFzQixPQVpMOztBQWNqQixpQkFBUyxNQWRRO0FBZWpCLHVCQUFlLG9CQWZFO0FBZ0JqQiwrQkFBdUIseUJBaEJOO0FBaUJqQiw2QkFBcUIsaUJBakJKO0FBa0JqQiwyQkFBbUIsTUFsQkY7QUFtQmpCLHVCQUFlLHdCQW5CRTtBQW9CakIsMkJBQW1CLEdBcEJGO0FBcUJqQiw0QkFBb0IsVUFyQkg7QUFzQmpCLHdCQUFnQixRQXRC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LFlBQVlZLEdBQVosRUFBaUIwRCxRQUFqQixHQUE0QixHQUE1QixHQUFrQ3RFLFlBQVlZLEdBQVosRUFBaUJrRixLQUFuRCxHQUEyRCxHQUF6RSxDQUFYO0FBQ0FwQyxxQkFBS2QsTUFBTCxHQUFjNUMsWUFBWVksR0FBWixFQUFpQmdDLE1BQS9COztBQUVBVyxvQkFBSUgsWUFBSixDQUFpQnBELFlBQVlZLEdBQVosRUFBaUJxRixPQUFqQixDQUF5QixDQUF6QixDQUFqQixFQUE4Q3ZDLElBQTlDO0FBRUgsYUFORCxNQU1PO0FBQ0gsb0JBQUlvQyxRQUFRLGtCQUFRRixLQUFSLENBQWM1RixZQUFZWSxHQUFaLEVBQWlCa0YsS0FBL0IsQ0FBWjtBQUNBQSxzQkFBTWxELE1BQU4sR0FBZTVDLFlBQVlZLEdBQVosRUFBaUJnQyxNQUFoQztBQUNBNUMsNEJBQVlZLEdBQVosRUFBaUJxRixPQUFqQixDQUF5QixDQUF6QixFQUE0Qm5ELFdBQTVCLENBQXdDOUMsWUFBWVksR0FBWixFQUFpQnNGLElBQXpELEVBQStESixLQUEvRDtBQUNIOztBQUVEO0FBQ0EsaUJBQUssSUFBSVMsSUFBSSxDQUFSLEVBQVdOLFVBQVVqRyxZQUFZWSxHQUFaLEVBQWlCcUYsT0FBakIsQ0FBeUJ0RixNQUFuRCxFQUEyRDRGLElBQUlOLE9BQS9ELEVBQXdFTSxHQUF4RSxFQUE2RTtBQUN6RSxvQkFBSXZHLFlBQVlZLEdBQVosRUFBaUJxRixPQUFqQixDQUF5Qk0sQ0FBekIsRUFBNEJDLEtBQTVCLENBQWtDN0YsTUFBbEMsSUFBNEMsQ0FBaEQsRUFBbUQ7QUFDL0NYLGdDQUFZWSxHQUFaLEVBQWlCcUYsT0FBakIsQ0FBeUJNLENBQXpCLEVBQTRCMUMsTUFBNUI7QUFDSDtBQUNKO0FBRUo7QUFFSixLQWhXRDtBQWlXSCxDQWhqQkQ7QUFQQTs7a0JBeWpCZXhFLE8iLCJmaWxlIjoiSGFtc3Rlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbW9kdWxlIEhhbXN0ZXJcclxuICogXHJcbiAqIEBkZXNjcmlwdGlvbiBQb3N0Q1NTIEhhbXN0ZXIgZnJhbWV3b3JrIG1haW4gZnVuY3Rpb25hbGl0eS5cclxuICpcclxuICogQHZlcnNpb24gMS4wXHJcbiAqIEBhdXRob3IgR3JpZ29yeSBWYXNpbHlldiA8cG9zdGNzcy5oYW1zdGVyQGdtYWlsLmNvbT4gaHR0cHM6Ly9naXRodWIuY29tL2gwdGMwZDNcclxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTcsIEdyaWdvcnkgVmFzaWx5ZXZcclxuICogQGxpY2Vuc2UgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wLCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAgXHJcbiAqIFxyXG4gKi9cclxuXHJcbmltcG9ydCBGb250U2l6ZXMgZnJvbSBcIi4vRm9udFNpemVzXCI7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgZm9ybWF0SW50LFxyXG4gICAgZm9ybWF0VmFsdWUsXHJcbiAgICBWZXJ0aWNhbFJoeXRobVxyXG59IGZyb20gXCIuL1ZlcnRpY2FsUmh5dGhtXCI7XHJcblxyXG5pbXBvcnQgUG5nSW1hZ2UgZnJvbSBcIi4vUG5nSW1hZ2VcIjtcclxuLy8gaW1wb3J0IFZpcnR1YWxNYWNoaW5lIGZyb20gXCIuL1ZpcnR1YWxNYWNoaW5lXCI7XHJcblxyXG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcblxyXG5pbXBvcnQgcG9zdGNzcyBmcm9tIFwicG9zdGNzc1wiO1xyXG5cclxuY29uc3QgaGFtc3RlciA9ICgpID0+IHtcclxuXHJcbiAgICAvL0RlZmF1bHQgR2xvYmFsIFZhcmlhYmxlc1xyXG4gICAgbGV0IGdsb2JhbFNldHRpbmdzID0ge1xyXG5cclxuICAgICAgICBcImZvbnQtc2l6ZVwiOiBcIjE2cHhcIixcclxuICAgICAgICBcImxpbmUtaGVpZ2h0XCI6IFwiMS41XCIsXHJcbiAgICAgICAgXCJ1bml0XCI6IFwiZW1cIixcclxuICAgICAgICBcInB4LWZhbGxiYWNrXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgIFwicHgtYmFzZWxpbmVcIjogXCJmYWxzZVwiLFxyXG4gICAgICAgIFwiZm9udC1yYXRpb1wiOiBcIjBcIixcclxuXHJcbiAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IFwiaW5saW5lXCIsXHJcblxyXG4gICAgICAgIFwibWluLWxpbmUtcGFkZGluZ1wiOiBcIjJweFwiLFxyXG4gICAgICAgIFwicm91bmQtdG8taGFsZi1saW5lXCI6IFwiZmFsc2VcIixcclxuXHJcbiAgICAgICAgXCJydWxlclwiOiBcInRydWVcIixcclxuICAgICAgICBcInJ1bGVyLXN0eWxlXCI6IFwiYWx3YXlzIHJ1bGVyLWRlYnVnXCIsXHJcbiAgICAgICAgXCJydWxlci1pY29uLXBvc2l0aW9uXCI6IFwidG9wOiAxLjVlbTtsZWZ0OiAxLjVlbTtcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tY29sb3JzXCI6IFwiI2NjY2NjYyAjNDQ1NzZhXCIsXHJcbiAgICAgICAgXCJydWxlci1pY29uLXNpemVcIjogXCIyNHB4XCIsXHJcbiAgICAgICAgXCJydWxlci1jb2xvclwiOiBcInJnYmEoMTksIDEzNCwgMTkxLCAuOClcIixcclxuICAgICAgICBcInJ1bGVyLXRoaWNrbmVzc1wiOiBcIjFcIixcclxuICAgICAgICBcInJ1bGVyLWJhY2tncm91bmRcIjogXCJncmFkaWVudFwiLFxyXG4gICAgICAgIFwicnVsZXItb3V0cHV0XCI6IFwiYmFzZTY0XCIsXHJcbiAgICAgICAgXCJydWxlci1wYXR0ZXJuXCI6IFwiMSAwIDAgMFwiLFxyXG4gICAgICAgIFwicnVsZXItc2NhbGVcIjogXCIxXCIsXHJcblxyXG4gICAgICAgIFwiYnJvd3Nlci1mb250LXNpemVcIjogXCIxNnB4XCIsXHJcbiAgICAgICAgXCJsZWdhY3ktYnJvd3NlcnNcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgXCJyZW1vdmUtY29tbWVudHNcIjogXCJmYWxzZVwiXHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgaGVscGVycyA9IHtcclxuICAgICAgICBcInJlc2V0XCI6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2hlbHBlcnMvcmVzZXQuY3NzXCIpLCBcInV0ZjhcIiksXHJcbiAgICAgICAgXCJub3JtYWxpemVcIjogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vaGVscGVycy9ub3JtYWxpemUuY3NzXCIpLCBcInV0ZjhcIiksXHJcbiAgICAgICAgXCJub3dyYXBcIjogXCJ3aGl0ZS1zcGFjZTogbm93cmFwO1wiLFxyXG4gICAgICAgIFwiZm9yY2V3cmFwXCI6IFwid2hpdGUtc3BhY2U6IHByZTtcIiArXHJcbiAgICAgICAgICAgIFwid2hpdGUtc3BhY2U6IHByZS1saW5lO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogLXByZS13cmFwO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogLW8tcHJlLXdyYXA7XCIgK1xyXG4gICAgICAgICAgICBcIndoaXRlLXNwYWNlOiAtbW96LXByZS13cmFwO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogLWhwLXByZS13cmFwO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XCIgK1xyXG4gICAgICAgICAgICBcIndvcmQtd3JhcDogYnJlYWstd29yZDtcIixcclxuICAgICAgICBcImVsbGlwc2lzXCI6IFwib3ZlcmZsb3c6IGhpZGRlbjtcIiArXHJcbiAgICAgICAgICAgIFwidGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XCJcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEN1cnJlbnQgVmFyaWFibGVzXHJcbiAgICBsZXQgY3VycmVudFNldHRpbmdzID0ge307XHJcbiAgICBsZXQgY3VycmVudFNldHRpbmdzUmVnZXhwO1xyXG4gICAgLy9DdXJyZW50IEZvbnRTaXplc1xyXG4gICAgbGV0IGN1cnJlbnRGb250U2l6ZXMgPSBcIlwiO1xyXG4gICAgLy8gZm9udCBTaXplc1xyXG4gICAgbGV0IGZvbnRTaXplc0NvbGxlY3Rpb247XHJcbiAgICAvLyBWZXJ0aWNhbCBSaHl0aG0gQ2FsY3VsYXRvclxyXG4gICAgbGV0IHJoeXRobUNhbGN1bGF0b3I7XHJcbiAgICAvLyBMYXN0IENzcyBGaWxlXHJcbiAgICBsZXQgZXh0ZW5kTm9kZXMgPSB7fTtcclxuICAgIC8vIGxldCBsYXN0RmlsZTtcclxuXHJcbiAgICAvLyBsZXQgdm0gPSBuZXcgVmlydHVhbE1hY2hpbmUoKTtcclxuICAgIC8vIGZvbnRTaXplIHByb3BlcnR5IFJlZ2V4cFxyXG4gICAgY29uc3QgZm9udFNpemVSZWdleHAgPSBuZXcgUmVnRXhwKFwiZm9udFNpemVcXFxccysoW1xcXFwtXFxcXCRcXFxcQDAtOWEtekEtWl0rKVwiLCBcImlcIik7XHJcblxyXG4gICAgLy8gbGluZUhlaWdodCBwcm9wZXJ0eSBSZWdleHBcclxuICAgIGNvbnN0IGxpbmVSZWdleHAgPSBuZXcgUmVnRXhwKFwiKGxpbmVIZWlnaHR8c3BhY2luZ3xsZWFkaW5nKVxcXFwoKC4qPylcXFxcKVwiLCBcImlcIik7XHJcblxyXG4gICAgLy8gQ29weSBWYWx1ZXMgZnJvbSBvYmplY3QgMiB0byBvYmplY3QgMTtcclxuICAgIGNvbnN0IGV4dGVuZCA9IChvYmplY3QxLCBvYmplY3QyKSA9PiB7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0MiksIGtleXNTaXplID0ga2V5cy5sZW5ndGg7IGkgPCBrZXlzU2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgICAgICBvYmplY3QxW2tleV0gPSBvYmplY3QyW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvYmplY3QxO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB0b0NhbWVsQ2FzZSA9ICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL15bXmEtejAtOV0qKC4qKVteYS16MC05XSokLywgXCIkMVwiKS5yZXBsYWNlKC9bXmEtejAtOV0rKFthLXowLTldKS9nLCAobWF0Y2gsIGxldHRlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbGV0dGVyLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICBjb25zdCBpbml0U2V0dGluZ3MgPSAoKSA9PiB7XHJcbiAgICAgICAgLy8gQWRkIGZvbnRTaXplc1xyXG4gICAgICAgIGlmIChcImZvbnQtc2l6ZXNcIiBpbiBnbG9iYWxTZXR0aW5ncykge1xyXG4gICAgICAgICAgICBjdXJyZW50Rm9udFNpemVzID0gZ2xvYmFsU2V0dGluZ3NbXCJmb250LXNpemVzXCJdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKFwiZm9udC1zaXplc1wiIGluIGN1cnJlbnRTZXR0aW5ncykge1xyXG4gICAgICAgICAgICBjdXJyZW50Rm9udFNpemVzID0gY3VycmVudEZvbnRTaXplcyArIFwiLCBcIiArIGN1cnJlbnRTZXR0aW5nc1tcImZvbnQtc2l6ZXNcIl07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb250U2l6ZXNDb2xsZWN0aW9uID0gbmV3IEZvbnRTaXplcyhjdXJyZW50U2V0dGluZ3MpO1xyXG4gICAgICAgIHJoeXRobUNhbGN1bGF0b3IgPSBuZXcgVmVydGljYWxSaHl0aG0oY3VycmVudFNldHRpbmdzKTtcclxuICAgICAgICBmb250U2l6ZXNDb2xsZWN0aW9uLmFkZEZvbnRTaXplcyhjdXJyZW50Rm9udFNpemVzLCByaHl0aG1DYWxjdWxhdG9yKTtcclxuICAgICAgICBjdXJyZW50U2V0dGluZ3NSZWdleHAgPSBuZXcgUmVnRXhwKFwiXFxcXEAoXCIgKyBPYmplY3Qua2V5cyhjdXJyZW50U2V0dGluZ3MpLmpvaW4oXCJ8XCIpLnJlcGxhY2UoLyhcXC18XFxfKS9nLCBcIlxcXFwkMVwiKSArIFwiKVwiLCBcImlcIik7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB3YWxrRGVjbHMgPSAobm9kZSkgPT4ge1xyXG4gICAgICAgIG5vZGUud2Fsa0RlY2xzKGRlY2wgPT4ge1xyXG5cclxuICAgICAgICAgICAgbGV0IGZvdW5kO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVwbGFjZSBWYXJpYWJsZXMgd2l0aCB2YWx1ZXNcclxuICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2goY3VycmVudFNldHRpbmdzUmVnZXhwKSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2YXJpYWJsZSA9IGZvdW5kWzFdO1xyXG4gICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShjdXJyZW50U2V0dGluZ3NSZWdleHAsIGN1cnJlbnRTZXR0aW5nc1t2YXJpYWJsZV0pO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVwbGFjZSBGb250IFNpemVcclxuICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2goZm9udFNpemVSZWdleHApKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBbZm9udFNpemUsIHNpemVVbml0XSA9IGZvdW5kWzFdLnNwbGl0KC9cXCQvaSk7XHJcbiAgICAgICAgICAgICAgICBzaXplVW5pdCA9IChzaXplVW5pdCAhPSBudWxsKSA/IHNpemVVbml0LnRvTG93ZXJDYXNlKCkgOiBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBzaXplID0gZm9udFNpemVzQ29sbGVjdGlvbi5nZXRTaXplKGZvbnRTaXplKTtcclxuICAgICAgICAgICAgICAgIC8vIFdyaXRlIGZvbnQgc2l6ZVxyXG4gICAgICAgICAgICAgICAgaWYgKHNpemVVbml0ICE9IG51bGwgJiYgKHNpemVVbml0ID09IFwiZW1cIiB8fCBzaXplVW5pdCA9PSBcInJlbVwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvbnRTaXplUmVnZXhwLCBmb3JtYXRWYWx1ZShzaXplLnJlbCkgKyBzaXplVW5pdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzaXplVW5pdCAhPSBudWxsICYmIHNpemVVbml0ID09IFwicHhcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvbnRTaXplUmVnZXhwLCBmb3JtYXRJbnQoc2l6ZS5weCkgKyBcInB4XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB1bml0ID0gZ2xvYmFsU2V0dGluZ3NbXCJ1bml0XCJdLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNmc2l6ZSA9ICh1bml0ID09IFwicHhcIikgPyBmb3JtYXRJbnQoc2l6ZS5weCkgOiBmb3JtYXRWYWx1ZShzaXplLnJlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGNmc2l6ZSArIHVuaXQpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkanVzdCBGb250IFNpemVcclxuICAgICAgICAgICAgaWYgKGRlY2wucHJvcCA9PSBcImFkanVzdC1mb250LXNpemVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBbZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemVdID0gZGVjbC52YWx1ZS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplVW5pdCA9IGZvbnRTaXplLm1hdGNoKC8ocHh8ZW18cmVtKSQvaSlbMF0udG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHJoeXRobUNhbGN1bGF0b3IuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCBudWxsLCBiYXNlRm9udFNpemUpICsgY3VycmVudFNldHRpbmdzW1widW5pdFwiXTtcclxuXHJcbiAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZm9udFNpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0RGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBsaW5lSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZGVjbC5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlY2wucHJvcCA9IFwiZm9udC1zaXplXCI7XHJcbiAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC5pbnNlcnRBZnRlcihkZWNsLCBsaW5lSGVpZ2h0RGVjbCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGxpbmVIZWlnaHQsIHNwYWNpbmcsIGxlYWRpbmdcclxuICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2gobGluZVJlZ2V4cCkpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gZm91bmRbMV0udG9Mb3dlckNhc2UoKTsgLy8gc3BhY2luZyBvciBsaW5lSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFyYW1ldGVycyA9IGZvdW5kWzJdLnNwbGl0KC9cXHMqXFwsXFxzKi8pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIHBhcmFtZXRlcnNTaXplID0gcGFyYW1ldGVycy5sZW5ndGg7IGkgPCBwYXJhbWV0ZXJzU2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFt2YWx1ZSwgZm9udFNpemVdID0gcGFyYW1ldGVyc1tpXS5zcGxpdCgvXFxzKy8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZm9udFNpemUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC53YWxrRGVjbHMoXCJmb250LXNpemVcIiwgZnNkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gZnNkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmb250U2l6ZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplXCJdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5ID09IFwibGluZWhlaWdodFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgKz0gcmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09IFwic3BhY2luZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgKz0gcmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSwgbnVsbCwgdHJ1ZSkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09IFwibGVhZGluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgKz0gcmh5dGhtQ2FsY3VsYXRvci5sZWFkaW5nKHZhbHVlLCBmb250U2l6ZSkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb3VuZFswXSwgbGluZUhlaWdodC5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInB4LWZhbGxiYWNrXCJdID09IFwidHJ1ZVwiICYmIGRlY2wudmFsdWUubWF0Y2goL1swLTlcXC5dK3JlbS9pKSkge1xyXG4gICAgICAgICAgICAgICAgZGVjbC5wYXJlbnQuaW5zZXJ0QmVmb3JlKGRlY2wsIGRlY2wuY2xvbmUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiByaHl0aG1DYWxjdWxhdG9yLnJlbUZhbGxiYWNrKGRlY2wudmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZGVjbC5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gKGNzcykgPT4ge1xyXG5cclxuICAgICAgICBjc3Mud2Fsayhub2RlID0+IHtcclxuICAgICAgICAgICAgLy8gaWYgKGxhc3RGaWxlICE9IG5vZGUuc291cmNlLmlucHV0LmZpbGUpIHtcclxuICAgICAgICAgICAgLy8gXHRsYXN0RmlsZSA9IG5vZGUuc291cmNlLmlucHV0LmZpbGU7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChub2RlLnR5cGUgPT0gXCJhdHJ1bGVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBydWxlID0gbm9kZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZS5uYW1lID09IFwiaGFtc3RlclwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlLnBhcmFtcyAhPSBcImVuZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCBHbG9iYWwgVmFyaWFibGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUud2Fsa0RlY2xzKGRlY2wgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsU2V0dGluZ3NbZGVjbC5wcm9wXSA9IGRlY2wudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCBmb250U2l6ZXNcclxuICAgICAgICAgICAgICAgICAgICBpZiAoXCJmb250LXNpemVzXCIgaW4gZ2xvYmFsU2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IGdsb2JhbFNldHRpbmdzW1wiZm9udC1zaXplc1wiXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgY3VycmVudCB2YXJpYWJsZXNcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3MgPSBleHRlbmQoe30sIGdsb2JhbFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFNldHRpbmdzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBSdWxlIEhhbXN0ZXJcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lID09IFwiIWhhbXN0ZXJcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL2N1cnJlbnRTZXR0aW5ncyA9IGV4dGVuZCh7fSwgZ2xvYmFsU2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLndhbGtEZWNscyhkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzW2RlY2wucHJvcF0gPSBkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJbml0IGN1cnJlbnQgU2V0dGluZ3NcclxuICAgICAgICAgICAgICAgICAgICBpbml0U2V0dGluZ3MoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcImJhc2VsaW5lXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplID0gcGFyc2VJbnQoY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplXCJdKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYnJvd3NlckZvbnRTaXplID0gcGFyc2VJbnQoY3VycmVudFNldHRpbmdzW1wiYnJvd3Nlci1mb250LXNpemVcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsZWdhY3lCcm93c2VycyA9IGN1cnJlbnRTZXR0aW5nc1tcImxlZ2FjeS1icm93c2Vyc1wiXS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBweEJhc2VsaW5lID0gY3VycmVudFNldHRpbmdzW1wicHgtYmFzZWxpbmVcIl0udG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJoeXRobVVuaXQgPSBjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0ID0gcmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGZvbnRTaXplICsgXCJweFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYmFzZWxpbmUgZm9udCBzaXplXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplRGVjbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChweEJhc2VsaW5lID09IFwidHJ1ZVwiIHx8IChyaHl0aG1Vbml0ID09IFwicHhcIiAmJiBsZWdhY3lCcm93c2VycyAhPSBcInRydWVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplRGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImZvbnQtc2l6ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZvbnRTaXplICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZWxhdGl2ZVNpemUgPSAxMDAgKiBmb250U2l6ZSAvIGJyb3dzZXJGb250U2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplRGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImZvbnQtc2l6ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZvcm1hdFZhbHVlKHJlbGF0aXZlU2l6ZSkgKyBcIiVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHREZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbGluZUhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGUucGFyYW1zLm1hdGNoKC9cXHMqaHRtbFxccyovKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGh0bWxSdWxlID0gcG9zdGNzcy5ydWxlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcImh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sUnVsZS5hcHBlbmQoZm9udFNpemVEZWNsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbFJ1bGUuYXBwZW5kKGxpbmVIZWlnaHREZWNsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGh0bWxSdWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyaHl0aG1Vbml0ID09IFwicHhcIiAmJiBsZWdhY3lCcm93c2VycyA9PSBcInRydWVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFzdGVyaXNrSHRtbFJ1bGUgPSBwb3N0Y3NzLnJ1bGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcIiogaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0ZXJpc2tIdG1sUnVsZS5hcHBlbmQobGluZUhlaWdodERlY2wpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgYXN0ZXJpc2tIdG1sUnVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGxpbmVIZWlnaHREZWNsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgZm9udFNpemVEZWNsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyaHl0aG1Vbml0ID09IFwicmVtXCIgJiYgY3VycmVudFNldHRpbmdzW1wicHgtZmFsbGJhY2tcIl0gPT0gXCJ0cnVlXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUobGluZUhlaWdodERlY2wsIHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByaHl0aG1DYWxjdWxhdG9yLnJlbUZhbGxiYWNrKGxpbmVIZWlnaHQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUgPT0gXCJydWxlclwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBydWxlckljb25Qb3NpdGlvbiA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWljb24tcG9zaXRpb25cIl0ucmVwbGFjZSgvKFxcJ3xcXFwiKS9nLCBcIlwiKS5yZXBsYWNlKC9cXDsvZywgXCI7XFxuXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXS5tYXRjaCgvcHgkL2kpKSA/IGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdIDogY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0gKyBcImVtXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAyNCAyNCUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00xOCAyNGMtMC4zIDAtMC41NDgtMC4yNDYtMC41NDgtMC41NDZWMThjMC0wLjMgMC4yNDgtMC41NDYgMC41NDgtMC41NDZoNS40NTIgIEMyMy43NTQgMTcuNDU0IDI0IDE3LjcgMjQgMTh2NS40NTRjMCAwLjMtMC4yNDYgMC41NDYtMC41NDggMC41NDZIMTh6IE05LjI3MSAyNGMtMC4yOTggMC0wLjU0My0wLjI0Ni0wLjU0My0wLjU0NlYxOCAgYzAtMC4zIDAuMjQ1LTAuNTQ2IDAuNTQzLTAuNTQ2aDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ2IDAuNTQzIDAuNTQ2djUuNDU0YzAgMC4zLTAuMjQzIDAuNTQ2LTAuNTQzIDAuNTQ2SDkuMjcxeiBNMC41NDggMjQgIEMwLjI0NiAyNCAwIDIzLjc1NCAwIDIzLjQ1NFYxOGMwLTAuMyAwLjI0Ni0wLjU0NiAwLjU0OC0wLjU0Nkg2YzAuMzAyIDAgMC41NDggMC4yNDYgMC41NDggMC41NDZ2NS40NTRDNi41NDggMjMuNzU0IDYuMzAyIDI0IDYgMjQgIEgwLjU0OHogTTE4IDE1LjI3MWMtMC4zIDAtMC41NDgtMC4yNDQtMC41NDgtMC41NDJWOS4yNzJjMC0wLjI5OSAwLjI0OC0wLjU0NSAwLjU0OC0wLjU0NWg1LjQ1MkMyMy43NTQgOC43MjcgMjQgOC45NzMgMjQgOS4yNzIgIHY1LjQ1N2MwIDAuMjk4LTAuMjQ2IDAuNTQyLTAuNTQ4IDAuNTQySDE4eiBNOS4yNzEgMTUuMjcxYy0wLjI5OCAwLTAuNTQzLTAuMjQ0LTAuNTQzLTAuNTQyVjkuMjcyYzAtMC4yOTkgMC4yNDUtMC41NDUgMC41NDMtMC41NDUgIGg1LjQ1N2MwLjMgMCAwLjU0MyAwLjI0NiAwLjU0MyAwLjU0NXY1LjQ1N2MwIDAuMjk4LTAuMjQzIDAuNTQyLTAuNTQzIDAuNTQySDkuMjcxeiBNMC41NDggMTUuMjcxQzAuMjQ2IDE1LjI3MSAwIDE1LjAyNiAwIDE0LjcyOSAgVjkuMjcyYzAtMC4yOTkgMC4yNDYtMC41NDUgMC41NDgtMC41NDVINmMwLjMwMiAwIDAuNTQ4IDAuMjQ2IDAuNTQ4IDAuNTQ1djUuNDU3YzAgMC4yOTgtMC4yNDYgMC41NDItMC41NDggMC41NDJIMC41NDh6IE0xOCA2LjU0NSAgYy0wLjMgMC0wLjU0OC0wLjI0NS0wLjU0OC0wLjU0NVYwLjU0NUMxNy40NTIgMC4yNDUgMTcuNyAwIDE4IDBoNS40NTJDMjMuNzU0IDAgMjQgMC4yNDUgMjQgMC41NDVWNmMwIDAuMy0wLjI0NiAwLjU0NS0wLjU0OCAwLjU0NSAgSDE4eiBNOS4yNzEgNi41NDVDOC45NzQgNi41NDUgOC43MjkgNi4zIDguNzI5IDZWMC41NDVDOC43MjkgMC4yNDUgOC45NzQgMCA5LjI3MSAwaDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ1IDAuNTQzIDAuNTQ1VjYgIGMwIDAuMy0wLjI0MyAwLjU0NS0wLjU0MyAwLjU0NUg5LjI3MXogTTAuNTQ4IDYuNTQ1QzAuMjQ2IDYuNTQ1IDAgNi4zIDAgNlYwLjU0NUMwIDAuMjQ1IDAuMjQ2IDAgMC41NDggMEg2ICBjMC4zMDIgMCAwLjU0OCAwLjI0NSAwLjU0OCAwLjU0NVY2YzAgMC4zLTAuMjQ2IDAuNTQ1LTAuNTQ4IDAuNTQ1SDAuNTQ4eiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdmcgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0ZjgsJTNDc3ZnIHhtbG5zJTNEJTI3aHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTI3IHZpZXdCb3glM0QlMjcwIDAgMjQgMjQlMjclM0UlM0NwYXRoIGZpbGwlM0QlMjd7Y29sb3J9JTI3IGQlM0QlMjdNMCw2YzAsMC4zMDEsMC4yNDYsMC41NDUsMC41NDksMC41NDVoMjIuOTA2QzIzLjc1Niw2LjU0NSwyNCw2LjMwMSwyNCw2VjIuNzNjMC0wLjMwNS0wLjI0NC0wLjU0OS0wLjU0NS0wLjU0OUgwLjU0OSAgQzAuMjQ2LDIuMTgyLDAsMi40MjYsMCwyLjczVjZ6IE0wLDEzLjYzN2MwLDAuMjk3LDAuMjQ2LDAuNTQ1LDAuNTQ5LDAuNTQ1aDIyLjkwNmMwLjMwMSwwLDAuNTQ1LTAuMjQ4LDAuNTQ1LTAuNTQ1di0zLjI3MyAgYzAtMC4yOTctMC4yNDQtMC41NDUtMC41NDUtMC41NDVIMC41NDlDMC4yNDYsOS44MTgsMCwxMC4wNjYsMCwxMC4zNjNWMTMuNjM3eiBNMCwyMS4yN2MwLDAuMzA1LDAuMjQ2LDAuNTQ5LDAuNTQ5LDAuNTQ5aDIyLjkwNiAgYzAuMzAxLDAsMC41NDUtMC4yNDQsMC41NDUtMC41NDlWMThjMC0wLjMwMS0wLjI0NC0wLjU0NS0wLjU0NS0wLjU0NUgwLjU0OUMwLjI0NiwxNy40NTUsMCwxNy42OTksMCwxOFYyMS4yN3olMjclMkYlM0UlM0MlMkZzdmclM0VcIjtcclxuICAgICAgICAgICAgICAgICAgICAvL2xldCBzdmcgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0ZjgsJTNDc3ZnIHhtbG5zJTNEJTI3aHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTI3IHZpZXdCb3glM0QlMjcwIDAgMzIgMzIlMjclM0UlM0NwYXRoIGZpbGwlM0QlMjd7Y29sb3J9JTI3IGQlM0QlMjdNMjgsMjBoLTR2LThoNGMxLjEwNCwwLDItMC44OTYsMi0ycy0wLjg5Ni0yLTItMmgtNFY0YzAtMS4xMDQtMC44OTYtMi0yLTJzLTIsMC44OTYtMiwydjRoLThWNGMwLTEuMTA0LTAuODk2LTItMi0yICBTOCwyLjg5Niw4LDR2NEg0Yy0xLjEwNCwwLTIsMC44OTYtMiwyczAuODk2LDIsMiwyaDR2OEg0Yy0xLjEwNCwwLTIsMC44OTYtMiwyczAuODk2LDIsMiwyaDR2NGMwLDEuMTA0LDAuODk2LDIsMiwyczItMC44OTYsMi0ydi00ICBoOHY0YzAsMS4xMDQsMC44OTYsMiwyLDJzMi0wLjg5NiwyLTJ2LTRoNGMxLjEwNCwwLDItMC44OTYsMi0yUzI5LjEwNCwyMCwyOCwyMHogTTEyLDIwdi04aDh2OEgxMnolMjclMkYlM0UlM0MlMkZzdmclM0VcIjtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZ3RoaWNrbmVzcyA9IHBhcnNlRmxvYXQoY3VycmVudFNldHRpbmdzW1wicnVsZXItdGhpY2tuZXNzXCJdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJhY2tncm91bmQgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicnVsZXItYmFja2dyb3VuZFwiXSA9PSBcInBuZ1wiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VIZWlnaHQgPSAoY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0ubWF0Y2goL3B4JC8pKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHBhcnNlRmxvYXQoY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0pICogcGFyc2VGbG9hdChjdXJyZW50U2V0dGluZ3NbXCJmb250LXNpemVcIl0pKS50b0ZpeGVkKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0dGVybiA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLXBhdHRlcm5cIl0uc3BsaXQoL1xccysvKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlID0gbmV3IFBuZ0ltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLnJ1bGVyTWF0cml4KGltYWdlSGVpZ2h0LCBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1jb2xvclwiXSwgcGF0dGVybiwgZ3RoaWNrbmVzcywgY3VycmVudFNldHRpbmdzW1wicnVsZXItc2NhbGVcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicnVsZXItb3V0cHV0XCJdICE9IFwiYmFzZTY0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLmdldEZpbGUoY3VycmVudFNldHRpbmdzW1wicnVsZXItb3V0cHV0XCJdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiLi4vXCIgKyBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1vdXRwdXRcIl0gKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcG9zaXRpb246IGxlZnQgdG9wO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcmVwZWF0OiByZXBlYXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1zaXplOiBcIiArIHBhdHRlcm4ubGVuZ3RoICsgXCJweCBcIiArIGltYWdlSGVpZ2h0ICsgXCJweDtcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxcIiArIGltYWdlLmdldEJhc2U2NCgpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXBvc2l0aW9uOiBsZWZ0IHRvcDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXJlcGVhdDogcmVwZWF0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtc2l6ZTogXCIgKyBwYXR0ZXJuLmxlbmd0aCArIFwicHggXCIgKyBpbWFnZUhlaWdodCArIFwicHg7XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBndGhpY2tuZXNzID0gZ3RoaWNrbmVzcyAqIDM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kID0gXCJiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1jb2xvclwiXSArIFwiIFwiICsgZ3RoaWNrbmVzcyArIFwiJSwgdHJhbnNwYXJlbnQgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3RoaWNrbmVzcyArIFwiJSk7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXNpemU6IDEwMCUgXCIgKyBsaW5lSGVpZ2h0ICsgXCI7XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXIgPSBcInBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibGVmdDogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmc6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoOiAxMDAlO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHQ6IDEwMCU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInotaW5kZXg6IDk5MDA7XCIgKyBiYWNrZ3JvdW5kO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgaWNvblNpemUgPSBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1pY29uLXNpemVcIl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBbc3R5bGUsIHJ1bGVyQ2xhc3NdID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItc3R5bGVcIl0uc3BsaXQoL1xccysvKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgW2NvbG9yLCBob3ZlckNvbG9yXSA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWljb24tY29sb3JzXCJdLnNwbGl0KC9cXHMrLyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBydWxlclJ1bGUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3R5bGUgPT0gXCJzd2l0Y2hcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJSdWxlID0gcG9zdGNzcy5wYXJzZShcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6IG5vbmU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgKyBydWxlckNsYXNzICsgXCJcXFwiXSB7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5Om5vbmU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgKyBydWxlckNsYXNzICsgXCJcXFwiXSArIGxhYmVsIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInotaW5kZXg6IDk5OTk7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbjogYWJzb2x1dGU7XCIgKyBydWxlckljb25Qb3NpdGlvbiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hcmdpbjogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmc6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWR0aDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0OiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjdXJzb3I6IHBvaW50ZXI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5yZXBsYWNlKC9cXHtjb2xvclxcfS8sIGVzY2FwZShjb2xvcikpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdOmNoZWNrZWQgKyBsYWJlbCwgaW5wdXRbaWQ9XFxcIlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdOmhvdmVyICsgbGFiZWwge1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJcIiArIHN2Zy5yZXBsYWNlKC9cXHtjb2xvclxcfS8sIGVzY2FwZShob3ZlckNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdOmNoZWNrZWQgfiAuXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5OiBibG9jaztcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3R5bGUgPT0gXCJob3ZlclwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb246IGFic29sdXRlO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVySWNvblBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoOiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHQ6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgKyBzdmcucmVwbGFjZSgvXFx7Y29sb3JcXH0vLCBlc2NhcGUoY29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLWltYWdlIDAuNXMgZWFzZS1pbi1vdXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIuXCIgKyBydWxlckNsYXNzICsgXCI6aG92ZXJcIiArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY3Vyc29yOiBwb2ludGVyO1wiICsgcnVsZXIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0eWxlID09IFwiYWx3YXlzXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCIuXCIgKyBydWxlckNsYXNzICsgXCJ7XFxuXCIgKyBydWxlciArIFwifVxcblwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocnVsZXJSdWxlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJSdWxlLnNvdXJjZSA9IHJ1bGUuc291cmNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgcnVsZXJSdWxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZS5tYXRjaCgvXihlbGxpcHNpc3xub3dyYXB8Zm9yY2V3cmFwKSQvaSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gcnVsZS5uYW1lLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWNscyA9IGhlbHBlcnNbcHJvcGVydHldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkgPT0gXCJlbGxpcHNpc1wiICYmIHJ1bGUucGFyYW1zID09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xzID0gaGVscGVyc1tcIm5vd3JhcFwiXSArIGRlY2xzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicHJvcGVydGllc1wiXSA9PSBcImlubGluZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaWRlY2xzID0gcG9zdGNzcy5wYXJzZShkZWNscyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBpZGVjbHMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInByb3BlcnRpZXNcIl0gPT0gXCJleHRlbmRcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4dGVuZE5hbWUgPSB0b0NhbWVsQ2FzZShydWxlLm5hbWUudG9Mb3dlckNhc2UoKSArIFwiIFwiICsgcnVsZS5wYXJhbXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIGV4dGVuZCBpbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogcnVsZS5wYXJlbnQuc2VsZWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbHM6IGRlY2xzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHM6IFtydWxlLnBhcmVudF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldjogcnVsZS5wcmV2KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9BcHBlbmQgc2VsZWN0b3IgYW5kIHVwZGF0ZSBjb3VudGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5zZWxlY3RvciA9IGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLnNlbGVjdG9yICsgXCIsIFwiICsgcnVsZS5wYXJlbnQuc2VsZWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5wYXJlbnRzLnB1c2gocnVsZS5wYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0uY291bnQrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUubWF0Y2goL14ocmVzZXR8bm9ybWFsaXplKSQvaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBydWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXMgPSBwb3N0Y3NzLnBhcnNlKGhlbHBlcnNbcHJvcGVydHldKTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlcy5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBydWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFdhbGsgaW4gbWVkaWEgcXVlcmllc1xyXG4gICAgICAgICAgICAgICAgbm9kZS53YWxrKGNoaWxkID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT0gXCJydWxlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2FsayBkZWNscyBpbiBydWxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhbGtEZWNscyhjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gZWxzZSBpZiAocnVsZS5uYW1lID09IFwianNcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICAgICBsZXQgamNzcyA9IHJ1bGUudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBsZXQgY29kZSA9IGpjc3MucmVwbGFjZSgvXFxAanNcXHMqXFx7KFtcXHNcXFNdKylcXH0kL2ksIFwiJDFcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGpjc3MpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIC8vIHJ1bGVyUnVsZS5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgcnVsZXJSdWxlKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICBydWxlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT0gXCJydWxlXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBXYWxrIGRlY2xzIGluIHJ1bGVcclxuICAgICAgICAgICAgICAgIHdhbGtEZWNscyhub2RlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFNldHRpbmdzW1wicmVtb3ZlLWNvbW1lbnRzXCJdID09IFwidHJ1ZVwiICYmIG5vZGUudHlwZSA9PSBcImNvbW1lbnRcIikge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIEV4dGVuZHMgdG8gQ1NTXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGtleXMgPSBPYmplY3Qua2V5cyhleHRlbmROb2RlcyksIGtleXNTaXplID0ga2V5cy5sZW5ndGg7IGkgPCBrZXlzU2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgICAgICBpZiAoZXh0ZW5kTm9kZXNba2V5XS5jb3VudCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBydWxlID0gcG9zdGNzcy5wYXJzZShleHRlbmROb2Rlc1trZXldLnNlbGVjdG9yICsgXCJ7XCIgKyBleHRlbmROb2Rlc1trZXldLmRlY2xzICsgXCJ9XCIpO1xyXG4gICAgICAgICAgICAgICAgcnVsZS5zb3VyY2UgPSBleHRlbmROb2Rlc1trZXldLnNvdXJjZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjc3MuaW5zZXJ0QmVmb3JlKGV4dGVuZE5vZGVzW2tleV0ucGFyZW50c1swXSwgcnVsZSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlY2xzID0gcG9zdGNzcy5wYXJzZShleHRlbmROb2Rlc1trZXldLmRlY2xzKTtcclxuICAgICAgICAgICAgICAgIGRlY2xzLnNvdXJjZSA9IGV4dGVuZE5vZGVzW2tleV0uc291cmNlO1xyXG4gICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzWzBdLmluc2VydEFmdGVyKGV4dGVuZE5vZGVzW2tleV0ucHJldiwgZGVjbHMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdW51c2VkIHBhcmVudCBub2Rlcy5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDAsIHBhcmVudHMgPSBleHRlbmROb2Rlc1trZXldLnBhcmVudHMubGVuZ3RoOyBqIDwgcGFyZW50czsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzW2pdLm5vZGVzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzW2pdLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaGFtc3RlcjsiXX0=
