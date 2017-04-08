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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhhbXN0ZXIiLCJvcHRpb25zIiwiZ2xvYmFsU2V0dGluZ3MiLCJoZWxwZXJzIiwicmVhZEZpbGVTeW5jIiwicmVzb2x2ZSIsIl9fZGlybmFtZSIsImN1cnJlbnRTZXR0aW5ncyIsImN1cnJlbnRTZXR0aW5nc1JlZ2V4cCIsImN1cnJlbnRGb250U2l6ZXMiLCJmb250U2l6ZXNDb2xsZWN0aW9uIiwicmh5dGhtQ2FsY3VsYXRvciIsImV4dGVuZE5vZGVzIiwiZm9udFNpemVSZWdleHAiLCJSZWdFeHAiLCJsaW5lUmVnZXhwIiwiZXh0ZW5kIiwib2JqZWN0MSIsIm9iamVjdDIiLCJpIiwia2V5cyIsIk9iamVjdCIsImtleXNTaXplIiwibGVuZ3RoIiwia2V5IiwidG9DYW1lbENhc2UiLCJ2YWx1ZSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsIm1hdGNoIiwibGV0dGVyIiwidG9VcHBlckNhc2UiLCJpbml0U2V0dGluZ3MiLCJhZGRGb250U2l6ZXMiLCJqb2luIiwid2Fsa0RlY2xzIiwibm9kZSIsImZvdW5kIiwiZGVjbCIsInZhcmlhYmxlIiwic3BsaXQiLCJmb250U2l6ZSIsInNpemVVbml0Iiwic2l6ZSIsImdldFNpemUiLCJyZWwiLCJweCIsInVuaXQiLCJjZnNpemUiLCJwcm9wIiwibGluZXMiLCJiYXNlRm9udFNpemUiLCJmb250U2l6ZVVuaXQiLCJjb252ZXJ0IiwibGluZUhlaWdodCIsImxpbmVIZWlnaHREZWNsIiwic291cmNlIiwicGFyZW50IiwiaW5zZXJ0QWZ0ZXIiLCJwcm9wZXJ0eSIsInBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzU2l6ZSIsImZzZGVjbCIsImxlYWRpbmciLCJpbnNlcnRCZWZvcmUiLCJjbG9uZSIsInJlbUZhbGxiYWNrIiwiY3NzIiwid2FsayIsInR5cGUiLCJydWxlIiwibmFtZSIsInBhcmFtcyIsInJlbW92ZSIsInBhcnNlSW50IiwiYnJvd3NlckZvbnRTaXplIiwibGVnYWN5QnJvd3NlcnMiLCJweEJhc2VsaW5lIiwicmh5dGhtVW5pdCIsImZvbnRTaXplRGVjbCIsInJlbGF0aXZlU2l6ZSIsImh0bWxSdWxlIiwic2VsZWN0b3IiLCJhcHBlbmQiLCJhc3Rlcmlza0h0bWxSdWxlIiwicnVsZXJJY29uUG9zaXRpb24iLCJzdmciLCJndGhpY2tuZXNzIiwicGFyc2VGbG9hdCIsImJhY2tncm91bmQiLCJpbWFnZUhlaWdodCIsInRvRml4ZWQiLCJwYXR0ZXJuIiwiaW1hZ2UiLCJydWxlck1hdHJpeCIsImdldEZpbGUiLCJnZXRCYXNlNjQiLCJydWxlciIsImljb25TaXplIiwic3R5bGUiLCJydWxlckNsYXNzIiwiY29sb3IiLCJob3ZlckNvbG9yIiwicnVsZXJSdWxlIiwicGFyc2UiLCJlc2NhcGUiLCJkZWNscyIsImlkZWNscyIsImV4dGVuZE5hbWUiLCJwYXJlbnRzIiwicHJldiIsImNvdW50IiwicHVzaCIsInJ1bGVzIiwiY2hpbGQiLCJqIiwibm9kZXMiXSwibWFwcGluZ3MiOiI7Ozs7QUFZQTs7OztBQUVBOztBQU1BOzs7O0FBR0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7QUExQkE7Ozs7Ozs7Ozs7OztBQTRCQSxJQUFNQSxVQUFVLFNBQVZBLE9BQVUsR0FBb0I7QUFBQSxRQUFuQkMsT0FBbUIsdUVBQVQsSUFBUzs7O0FBRWhDO0FBQ0EsUUFBSUMsaUJBQWlCOztBQUVqQixxQkFBYSxNQUZJO0FBR2pCLHVCQUFlLEtBSEU7QUFJakIsZ0JBQVEsSUFKUztBQUtqQix1QkFBZSxNQUxFO0FBTWpCLHVCQUFlLE9BTkU7QUFPakIsc0JBQWMsR0FQRzs7QUFTakIsc0JBQWMsUUFURzs7QUFXakIsNEJBQW9CLEtBWEg7QUFZakIsOEJBQXNCLE9BWkw7O0FBY2pCLGlCQUFTLE1BZFE7QUFlakIsdUJBQWUsb0JBZkU7QUFnQmpCLCtCQUF1Qix5QkFoQk47QUFpQmpCLDZCQUFxQixpQkFqQko7QUFrQmpCLDJCQUFtQixNQWxCRjtBQW1CakIsdUJBQWUsd0JBbkJFO0FBb0JqQiwyQkFBbUIsR0Fw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QVBBOztrQkErakJlekUsTyIsImZpbGUiOiJIYW1zdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBtb2R1bGUgSGFtc3RlclxyXG4gKiBcclxuICogQGRlc2NyaXB0aW9uIFBvc3RDU1MgSGFtc3RlciBmcmFtZXdvcmsgbWFpbiBmdW5jdGlvbmFsaXR5LlxyXG4gKlxyXG4gKiBAdmVyc2lvbiAxLjBcclxuICogQGF1dGhvciBHcmlnb3J5IFZhc2lseWV2IDxwb3N0Y3NzLmhhbXN0ZXJAZ21haWwuY29tPiBodHRwczovL2dpdGh1Yi5jb20vaDB0YzBkM1xyXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNywgR3JpZ29yeSBWYXNpbHlldlxyXG4gKiBAbGljZW5zZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAsIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMCBcclxuICogXHJcbiAqL1xyXG5cclxuaW1wb3J0IEZvbnRTaXplcyBmcm9tIFwiLi9Gb250U2l6ZXNcIjtcclxuXHJcbmltcG9ydCB7XHJcbiAgICBmb3JtYXRJbnQsXHJcbiAgICBmb3JtYXRWYWx1ZSxcclxuICAgIFZlcnRpY2FsUmh5dGhtXHJcbn0gZnJvbSBcIi4vVmVydGljYWxSaHl0aG1cIjtcclxuXHJcbmltcG9ydCBQbmdJbWFnZSBmcm9tIFwiLi9QbmdJbWFnZVwiO1xyXG4vLyBpbXBvcnQgVmlydHVhbE1hY2hpbmUgZnJvbSBcIi4vVmlydHVhbE1hY2hpbmVcIjtcclxuXHJcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuXHJcbmltcG9ydCBwb3N0Y3NzIGZyb20gXCJwb3N0Y3NzXCI7XHJcblxyXG5jb25zdCBoYW1zdGVyID0gKG9wdGlvbnMgPSBudWxsKSA9PiB7XHJcblxyXG4gICAgLy9EZWZhdWx0IEdsb2JhbCBTZXR0aW5nc1xyXG4gICAgbGV0IGdsb2JhbFNldHRpbmdzID0ge1xyXG5cclxuICAgICAgICBcImZvbnQtc2l6ZVwiOiBcIjE2cHhcIixcclxuICAgICAgICBcImxpbmUtaGVpZ2h0XCI6IFwiMS41XCIsXHJcbiAgICAgICAgXCJ1bml0XCI6IFwiZW1cIixcclxuICAgICAgICBcInB4LWZhbGxiYWNrXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgIFwicHgtYmFzZWxpbmVcIjogXCJmYWxzZVwiLFxyXG4gICAgICAgIFwiZm9udC1yYXRpb1wiOiBcIjBcIixcclxuXHJcbiAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IFwiaW5saW5lXCIsXHJcblxyXG4gICAgICAgIFwibWluLWxpbmUtcGFkZGluZ1wiOiBcIjJweFwiLFxyXG4gICAgICAgIFwicm91bmQtdG8taGFsZi1saW5lXCI6IFwiZmFsc2VcIixcclxuXHJcbiAgICAgICAgXCJydWxlclwiOiBcInRydWVcIixcclxuICAgICAgICBcInJ1bGVyLXN0eWxlXCI6IFwiYWx3YXlzIHJ1bGVyLWRlYnVnXCIsXHJcbiAgICAgICAgXCJydWxlci1pY29uLXBvc2l0aW9uXCI6IFwidG9wOiAxLjVlbTtsZWZ0OiAxLjVlbTtcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tY29sb3JzXCI6IFwiI2NjY2NjYyAjNDQ1NzZhXCIsXHJcbiAgICAgICAgXCJydWxlci1pY29uLXNpemVcIjogXCIyNHB4XCIsXHJcbiAgICAgICAgXCJydWxlci1jb2xvclwiOiBcInJnYmEoMTksIDEzNCwgMTkxLCAuOClcIixcclxuICAgICAgICBcInJ1bGVyLXRoaWNrbmVzc1wiOiBcIjFcIixcclxuICAgICAgICBcInJ1bGVyLWJhY2tncm91bmRcIjogXCJncmFkaWVudFwiLFxyXG4gICAgICAgIFwicnVsZXItb3V0cHV0XCI6IFwiYmFzZTY0XCIsXHJcbiAgICAgICAgXCJydWxlci1wYXR0ZXJuXCI6IFwiMSAwIDAgMFwiLFxyXG4gICAgICAgIFwicnVsZXItc2NhbGVcIjogXCIxXCIsXHJcblxyXG4gICAgICAgIFwiYnJvd3Nlci1mb250LXNpemVcIjogXCIxNnB4XCIsXHJcbiAgICAgICAgXCJsZWdhY3ktYnJvd3NlcnNcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgXCJyZW1vdmUtY29tbWVudHNcIjogXCJmYWxzZVwiXHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgaGVscGVycyA9IHtcclxuICAgICAgICBcInJlc2V0XCI6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2hlbHBlcnMvcmVzZXQuY3NzXCIpLCBcInV0ZjhcIiksXHJcbiAgICAgICAgXCJub3JtYWxpemVcIjogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vaGVscGVycy9ub3JtYWxpemUuY3NzXCIpLCBcInV0ZjhcIiksXHJcbiAgICAgICAgXCJub3dyYXBcIjogXCJ3aGl0ZS1zcGFjZTogbm93cmFwO1wiLFxyXG4gICAgICAgIFwiZm9yY2V3cmFwXCI6IFwid2hpdGUtc3BhY2U6IHByZTtcIiArXHJcbiAgICAgICAgICAgIFwid2hpdGUtc3BhY2U6IHByZS1saW5lO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogLXByZS13cmFwO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogLW8tcHJlLXdyYXA7XCIgK1xyXG4gICAgICAgICAgICBcIndoaXRlLXNwYWNlOiAtbW96LXByZS13cmFwO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogLWhwLXByZS13cmFwO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XCIgK1xyXG4gICAgICAgICAgICBcIndvcmQtd3JhcDogYnJlYWstd29yZDtcIixcclxuICAgICAgICBcImVsbGlwc2lzXCI6IFwib3ZlcmZsb3c6IGhpZGRlbjtcIiArXHJcbiAgICAgICAgICAgIFwidGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XCJcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEN1cnJlbnQgVmFyaWFibGVzXHJcbiAgICBsZXQgY3VycmVudFNldHRpbmdzID0ge307XHJcbiAgICBsZXQgY3VycmVudFNldHRpbmdzUmVnZXhwO1xyXG4gICAgLy9DdXJyZW50IEZvbnRTaXplc1xyXG4gICAgbGV0IGN1cnJlbnRGb250U2l6ZXMgPSBcIlwiO1xyXG4gICAgLy8gZm9udCBTaXplc1xyXG4gICAgbGV0IGZvbnRTaXplc0NvbGxlY3Rpb247XHJcbiAgICAvLyBWZXJ0aWNhbCBSaHl0aG0gQ2FsY3VsYXRvclxyXG4gICAgbGV0IHJoeXRobUNhbGN1bGF0b3I7XHJcbiAgICAvLyBMYXN0IENzcyBGaWxlXHJcbiAgICBsZXQgZXh0ZW5kTm9kZXMgPSB7fTtcclxuICAgIC8vIGxldCBsYXN0RmlsZTtcclxuXHJcbiAgICAvLyBsZXQgdm0gPSBuZXcgVmlydHVhbE1hY2hpbmUoKTtcclxuICAgIC8vIGZvbnRTaXplIHByb3BlcnR5IFJlZ2V4cFxyXG4gICAgY29uc3QgZm9udFNpemVSZWdleHAgPSBuZXcgUmVnRXhwKFwiZm9udFNpemVcXFxccysoW1xcXFwtXFxcXCRcXFxcQDAtOWEtekEtWl0rKVwiLCBcImlcIik7XHJcblxyXG4gICAgLy8gbGluZUhlaWdodCBwcm9wZXJ0eSBSZWdleHBcclxuICAgIGNvbnN0IGxpbmVSZWdleHAgPSBuZXcgUmVnRXhwKFwiKGxpbmVIZWlnaHR8c3BhY2luZ3xsZWFkaW5nKVxcXFwoKC4qPylcXFxcKVwiLCBcImlcIik7XHJcblxyXG4gICAgLy8gQ29weSBWYWx1ZXMgZnJvbSBvYmplY3QgMiB0byBvYmplY3QgMTtcclxuICAgIGNvbnN0IGV4dGVuZCA9IChvYmplY3QxLCBvYmplY3QyKSA9PiB7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0MiksIGtleXNTaXplID0ga2V5cy5sZW5ndGg7IGkgPCBrZXlzU2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgICAgICBvYmplY3QxW2tleV0gPSBvYmplY3QyW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvYmplY3QxO1xyXG4gICAgfTtcclxuXHJcbiAgICBpZihvcHRpb25zICE9IG51bGwpe1xyXG4gICAgICAgIGV4dGVuZChnbG9iYWxTZXR0aW5ncywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdG9DYW1lbENhc2UgPSAodmFsdWUpID0+IHtcclxuICAgICAgICByZXR1cm4gdmFsdWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9eW15hLXowLTldKiguKilbXmEtejAtOV0qJC8sIFwiJDFcIikucmVwbGFjZSgvW15hLXowLTldKyhbYS16MC05XSkvZywgKG1hdGNoLCBsZXR0ZXIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGxldHRlci50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBJbml0IGN1cnJlbnQgU2V0dGluZ3NcclxuICAgIGNvbnN0IGluaXRTZXR0aW5ncyA9ICgpID0+IHtcclxuXHJcbiAgICAgICAgLy8gQWRkIGZvbnRTaXplc1xyXG4gICAgICAgIGlmIChcImZvbnQtc2l6ZXNcIiBpbiBnbG9iYWxTZXR0aW5ncykge1xyXG4gICAgICAgICAgICBjdXJyZW50Rm9udFNpemVzID0gZ2xvYmFsU2V0dGluZ3NbXCJmb250LXNpemVzXCJdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKFwiZm9udC1zaXplc1wiIGluIGN1cnJlbnRTZXR0aW5ncykge1xyXG4gICAgICAgICAgICBjdXJyZW50Rm9udFNpemVzID0gY3VycmVudEZvbnRTaXplcyArIFwiLCBcIiArIGN1cnJlbnRTZXR0aW5nc1tcImZvbnQtc2l6ZXNcIl07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb250U2l6ZXNDb2xsZWN0aW9uID0gbmV3IEZvbnRTaXplcyhjdXJyZW50U2V0dGluZ3MpO1xyXG4gICAgICAgIHJoeXRobUNhbGN1bGF0b3IgPSBuZXcgVmVydGljYWxSaHl0aG0oY3VycmVudFNldHRpbmdzKTtcclxuICAgICAgICBmb250U2l6ZXNDb2xsZWN0aW9uLmFkZEZvbnRTaXplcyhjdXJyZW50Rm9udFNpemVzLCByaHl0aG1DYWxjdWxhdG9yKTtcclxuICAgICAgICBjdXJyZW50U2V0dGluZ3NSZWdleHAgPSBuZXcgUmVnRXhwKFwiXFxcXEAoXCIgKyBPYmplY3Qua2V5cyhjdXJyZW50U2V0dGluZ3MpLmpvaW4oXCJ8XCIpLnJlcGxhY2UoLyhcXC18XFxfKS9nLCBcIlxcXFwkMVwiKSArIFwiKVwiLCBcImlcIik7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB3YWxrRGVjbHMgPSAobm9kZSkgPT4ge1xyXG4gICAgICAgIG5vZGUud2Fsa0RlY2xzKGRlY2wgPT4ge1xyXG5cclxuICAgICAgICAgICAgbGV0IGZvdW5kO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVwbGFjZSBWYXJpYWJsZXMgd2l0aCB2YWx1ZXNcclxuICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2goY3VycmVudFNldHRpbmdzUmVnZXhwKSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2YXJpYWJsZSA9IGZvdW5kWzFdO1xyXG4gICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShjdXJyZW50U2V0dGluZ3NSZWdleHAsIGN1cnJlbnRTZXR0aW5nc1t2YXJpYWJsZV0pO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVwbGFjZSBGb250IFNpemVcclxuICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2goZm9udFNpemVSZWdleHApKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBbZm9udFNpemUsIHNpemVVbml0XSA9IGZvdW5kWzFdLnNwbGl0KC9cXCQvaSk7XHJcbiAgICAgICAgICAgICAgICBzaXplVW5pdCA9IChzaXplVW5pdCAhPSBudWxsKSA/IHNpemVVbml0LnRvTG93ZXJDYXNlKCkgOiBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBzaXplID0gZm9udFNpemVzQ29sbGVjdGlvbi5nZXRTaXplKGZvbnRTaXplKTtcclxuICAgICAgICAgICAgICAgIC8vIFdyaXRlIGZvbnQgc2l6ZVxyXG4gICAgICAgICAgICAgICAgaWYgKHNpemVVbml0ICE9IG51bGwgJiYgKHNpemVVbml0ID09IFwiZW1cIiB8fCBzaXplVW5pdCA9PSBcInJlbVwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvbnRTaXplUmVnZXhwLCBmb3JtYXRWYWx1ZShzaXplLnJlbCkgKyBzaXplVW5pdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzaXplVW5pdCAhPSBudWxsICYmIHNpemVVbml0ID09IFwicHhcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvbnRTaXplUmVnZXhwLCBmb3JtYXRJbnQoc2l6ZS5weCkgKyBcInB4XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB1bml0ID0gZ2xvYmFsU2V0dGluZ3NbXCJ1bml0XCJdLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNmc2l6ZSA9ICh1bml0ID09IFwicHhcIikgPyBmb3JtYXRJbnQoc2l6ZS5weCkgOiBmb3JtYXRWYWx1ZShzaXplLnJlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGNmc2l6ZSArIHVuaXQpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkanVzdCBGb250IFNpemVcclxuICAgICAgICAgICAgaWYgKGRlY2wucHJvcCA9PSBcImFkanVzdC1mb250LXNpemVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBbZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemVdID0gZGVjbC52YWx1ZS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplVW5pdCA9IGZvbnRTaXplLm1hdGNoKC8ocHh8ZW18cmVtKSQvaSlbMF0udG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHJoeXRobUNhbGN1bGF0b3IuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCBudWxsLCBiYXNlRm9udFNpemUpICsgY3VycmVudFNldHRpbmdzW1widW5pdFwiXTtcclxuXHJcbiAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZm9udFNpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0RGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBsaW5lSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZGVjbC5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlY2wucHJvcCA9IFwiZm9udC1zaXplXCI7XHJcbiAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC5pbnNlcnRBZnRlcihkZWNsLCBsaW5lSGVpZ2h0RGVjbCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGxpbmVIZWlnaHQsIHNwYWNpbmcsIGxlYWRpbmdcclxuICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2gobGluZVJlZ2V4cCkpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gZm91bmRbMV0udG9Mb3dlckNhc2UoKTsgLy8gc3BhY2luZyBvciBsaW5lSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFyYW1ldGVycyA9IGZvdW5kWzJdLnNwbGl0KC9cXHMqXFwsXFxzKi8pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIHBhcmFtZXRlcnNTaXplID0gcGFyYW1ldGVycy5sZW5ndGg7IGkgPCBwYXJhbWV0ZXJzU2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFt2YWx1ZSwgZm9udFNpemVdID0gcGFyYW1ldGVyc1tpXS5zcGxpdCgvXFxzKy8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZm9udFNpemUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC53YWxrRGVjbHMoXCJmb250LXNpemVcIiwgZnNkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gZnNkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmb250U2l6ZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplXCJdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5ID09IFwibGluZWhlaWdodFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgKz0gcmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09IFwic3BhY2luZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgKz0gcmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSwgbnVsbCwgdHJ1ZSkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09IFwibGVhZGluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgKz0gcmh5dGhtQ2FsY3VsYXRvci5sZWFkaW5nKHZhbHVlLCBmb250U2l6ZSkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb3VuZFswXSwgbGluZUhlaWdodC5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyByZW0gZmFsbGJhY2tcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInB4LWZhbGxiYWNrXCJdID09IFwidHJ1ZVwiICYmIGRlY2wudmFsdWUubWF0Y2goL1swLTlcXC5dK3JlbS9pKSkge1xyXG4gICAgICAgICAgICAgICAgZGVjbC5wYXJlbnQuaW5zZXJ0QmVmb3JlKGRlY2wsIGRlY2wuY2xvbmUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiByaHl0aG1DYWxjdWxhdG9yLnJlbUZhbGxiYWNrKGRlY2wudmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZGVjbC5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gKGNzcykgPT4ge1xyXG5cclxuICAgICAgICBjc3Mud2Fsayhub2RlID0+IHtcclxuICAgICAgICAgICAgLy8gaWYgKGxhc3RGaWxlICE9IG5vZGUuc291cmNlLmlucHV0LmZpbGUpIHtcclxuICAgICAgICAgICAgLy8gXHRsYXN0RmlsZSA9IG5vZGUuc291cmNlLmlucHV0LmZpbGU7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChub2RlLnR5cGUgPT0gXCJhdHJ1bGVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBydWxlID0gbm9kZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZS5uYW1lID09IFwiaGFtc3RlclwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlLnBhcmFtcyAhPSBcImVuZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCBHbG9iYWwgVmFyaWFibGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUud2Fsa0RlY2xzKGRlY2wgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsU2V0dGluZ3NbZGVjbC5wcm9wXSA9IGRlY2wudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCBmb250U2l6ZXNcclxuICAgICAgICAgICAgICAgICAgICBpZiAoXCJmb250LXNpemVzXCIgaW4gZ2xvYmFsU2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IGdsb2JhbFNldHRpbmdzW1wiZm9udC1zaXplc1wiXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgY3VycmVudCB2YXJpYWJsZXNcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3MgPSBleHRlbmQoe30sIGdsb2JhbFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFNldHRpbmdzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBSdWxlIEhhbXN0ZXJcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lID09IFwiIWhhbXN0ZXJcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL2N1cnJlbnRTZXR0aW5ncyA9IGV4dGVuZCh7fSwgZ2xvYmFsU2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLndhbGtEZWNscyhkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzW2RlY2wucHJvcF0gPSBkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJbml0IGN1cnJlbnQgU2V0dGluZ3NcclxuICAgICAgICAgICAgICAgICAgICBpbml0U2V0dGluZ3MoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcImJhc2VsaW5lXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplID0gcGFyc2VJbnQoY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplXCJdKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYnJvd3NlckZvbnRTaXplID0gcGFyc2VJbnQoY3VycmVudFNldHRpbmdzW1wiYnJvd3Nlci1mb250LXNpemVcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsZWdhY3lCcm93c2VycyA9IGN1cnJlbnRTZXR0aW5nc1tcImxlZ2FjeS1icm93c2Vyc1wiXS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBweEJhc2VsaW5lID0gY3VycmVudFNldHRpbmdzW1wicHgtYmFzZWxpbmVcIl0udG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJoeXRobVVuaXQgPSBjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0ID0gcmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGZvbnRTaXplICsgXCJweFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYmFzZWxpbmUgZm9udCBzaXplXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplRGVjbCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChweEJhc2VsaW5lID09IFwidHJ1ZVwiIHx8IChyaHl0aG1Vbml0ID09IFwicHhcIiAmJiBsZWdhY3lCcm93c2VycyAhPSBcInRydWVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplRGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImZvbnQtc2l6ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZvbnRTaXplICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZWxhdGl2ZVNpemUgPSAxMDAgKiBmb250U2l6ZSAvIGJyb3dzZXJGb250U2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplRGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImZvbnQtc2l6ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZvcm1hdFZhbHVlKHJlbGF0aXZlU2l6ZSkgKyBcIiVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHREZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbGluZUhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGUucGFyYW1zLm1hdGNoKC9cXHMqaHRtbFxccyovKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGh0bWxSdWxlID0gcG9zdGNzcy5ydWxlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcImh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sUnVsZS5hcHBlbmQoZm9udFNpemVEZWNsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbFJ1bGUuYXBwZW5kKGxpbmVIZWlnaHREZWNsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGh0bWxSdWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyaHl0aG1Vbml0ID09IFwicHhcIiAmJiBsZWdhY3lCcm93c2VycyA9PSBcInRydWVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFzdGVyaXNrSHRtbFJ1bGUgPSBwb3N0Y3NzLnJ1bGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcIiogaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0ZXJpc2tIdG1sUnVsZS5hcHBlbmQobGluZUhlaWdodERlY2wpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgYXN0ZXJpc2tIdG1sUnVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGxpbmVIZWlnaHREZWNsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgZm9udFNpemVEZWNsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyaHl0aG1Vbml0ID09IFwicmVtXCIgJiYgY3VycmVudFNldHRpbmdzW1wicHgtZmFsbGJhY2tcIl0gPT0gXCJ0cnVlXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUobGluZUhlaWdodERlY2wsIHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByaHl0aG1DYWxjdWxhdG9yLnJlbUZhbGxiYWNrKGxpbmVIZWlnaHQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUgPT0gXCJydWxlclwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBydWxlckljb25Qb3NpdGlvbiA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWljb24tcG9zaXRpb25cIl0ucmVwbGFjZSgvKFxcJ3xcXFwiKS9nLCBcIlwiKS5yZXBsYWNlKC9cXDsvZywgXCI7XFxuXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXS5tYXRjaCgvcHgkL2kpKSA/IGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdIDogY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0gKyBcImVtXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAyNCAyNCUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00xOCAyNGMtMC4zIDAtMC41NDgtMC4yNDYtMC41NDgtMC41NDZWMThjMC0wLjMgMC4yNDgtMC41NDYgMC41NDgtMC41NDZoNS40NTIgIEMyMy43NTQgMTcuNDU0IDI0IDE3LjcgMjQgMTh2NS40NTRjMCAwLjMtMC4yNDYgMC41NDYtMC41NDggMC41NDZIMTh6IE05LjI3MSAyNGMtMC4yOTggMC0wLjU0My0wLjI0Ni0wLjU0My0wLjU0NlYxOCAgYzAtMC4zIDAuMjQ1LTAuNTQ2IDAuNTQzLTAuNTQ2aDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ2IDAuNTQzIDAuNTQ2djUuNDU0YzAgMC4zLTAuMjQzIDAuNTQ2LTAuNTQzIDAuNTQ2SDkuMjcxeiBNMC41NDggMjQgIEMwLjI0NiAyNCAwIDIzLjc1NCAwIDIzLjQ1NFYxOGMwLTAuMyAwLjI0Ni0wLjU0NiAwLjU0OC0wLjU0Nkg2YzAuMzAyIDAgMC41NDggMC4yNDYgMC41NDggMC41NDZ2NS40NTRDNi41NDggMjMuNzU0IDYuMzAyIDI0IDYgMjQgIEgwLjU0OHogTTE4IDE1LjI3MWMtMC4zIDAtMC41NDgtMC4yNDQtMC41NDgtMC41NDJWOS4yNzJjMC0wLjI5OSAwLjI0OC0wLjU0NSAwLjU0OC0wLjU0NWg1LjQ1MkMyMy43NTQgOC43MjcgMjQgOC45NzMgMjQgOS4yNzIgIHY1LjQ1N2MwIDAuMjk4LTAuMjQ2IDAuNTQyLTAuNTQ4IDAuNTQySDE4eiBNOS4yNzEgMTUuMjcxYy0wLjI5OCAwLTAuNTQzLTAuMjQ0LTAuNTQzLTAuNTQyVjkuMjcyYzAtMC4yOTkgMC4yNDUtMC41NDUgMC41NDMtMC41NDUgIGg1LjQ1N2MwLjMgMCAwLjU0MyAwLjI0NiAwLjU0MyAwLjU0NXY1LjQ1N2MwIDAuMjk4LTAuMjQzIDAuNTQyLTAuNTQzIDAuNTQySDkuMjcxeiBNMC41NDggMTUuMjcxQzAuMjQ2IDE1LjI3MSAwIDE1LjAyNiAwIDE0LjcyOSAgVjkuMjcyYzAtMC4yOTkgMC4yNDYtMC41NDUgMC41NDgtMC41NDVINmMwLjMwMiAwIDAuNTQ4IDAuMjQ2IDAuNTQ4IDAuNTQ1djUuNDU3YzAgMC4yOTgtMC4yNDYgMC41NDItMC41NDggMC41NDJIMC41NDh6IE0xOCA2LjU0NSAgYy0wLjMgMC0wLjU0OC0wLjI0NS0wLjU0OC0wLjU0NVYwLjU0NUMxNy40NTIgMC4yNDUgMTcuNyAwIDE4IDBoNS40NTJDMjMuNzU0IDAgMjQgMC4yNDUgMjQgMC41NDVWNmMwIDAuMy0wLjI0NiAwLjU0NS0wLjU0OCAwLjU0NSAgSDE4eiBNOS4yNzEgNi41NDVDOC45NzQgNi41NDUgOC43MjkgNi4zIDguNzI5IDZWMC41NDVDOC43MjkgMC4yNDUgOC45NzQgMCA5LjI3MSAwaDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ1IDAuNTQzIDAuNTQ1VjYgIGMwIDAuMy0wLjI0MyAwLjU0NS0wLjU0MyAwLjU0NUg5LjI3MXogTTAuNTQ4IDYuNTQ1QzAuMjQ2IDYuNTQ1IDAgNi4zIDAgNlYwLjU0NUMwIDAuMjQ1IDAuMjQ2IDAgMC41NDggMEg2ICBjMC4zMDIgMCAwLjU0OCAwLjI0NSAwLjU0OCAwLjU0NVY2YzAgMC4zLTAuMjQ2IDAuNTQ1LTAuNTQ4IDAuNTQ1SDAuNTQ4eiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdmcgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0ZjgsJTNDc3ZnIHhtbG5zJTNEJTI3aHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTI3IHZpZXdCb3glM0QlMjcwIDAgMjQgMjQlMjclM0UlM0NwYXRoIGZpbGwlM0QlMjd7Y29sb3J9JTI3IGQlM0QlMjdNMCw2YzAsMC4zMDEsMC4yNDYsMC41NDUsMC41NDksMC41NDVoMjIuOTA2QzIzLjc1Niw2LjU0NSwyNCw2LjMwMSwyNCw2VjIuNzNjMC0wLjMwNS0wLjI0NC0wLjU0OS0wLjU0NS0wLjU0OUgwLjU0OSAgQzAuMjQ2LDIuMTgyLDAsMi40MjYsMCwyLjczVjZ6IE0wLDEzLjYzN2MwLDAuMjk3LDAuMjQ2LDAuNTQ1LDAuNTQ5LDAuNTQ1aDIyLjkwNmMwLjMwMSwwLDAuNTQ1LTAuMjQ4LDAuNTQ1LTAuNTQ1di0zLjI3MyAgYzAtMC4yOTctMC4yNDQtMC41NDUtMC41NDUtMC41NDVIMC41NDlDMC4yNDYsOS44MTgsMCwxMC4wNjYsMCwxMC4zNjNWMTMuNjM3eiBNMCwyMS4yN2MwLDAuMzA1LDAuMjQ2LDAuNTQ5LDAuNTQ5LDAuNTQ5aDIyLjkwNiAgYzAuMzAxLDAsMC41NDUtMC4yNDQsMC41NDUtMC41NDlWMThjMC0wLjMwMS0wLjI0NC0wLjU0NS0wLjU0NS0wLjU0NUgwLjU0OUMwLjI0NiwxNy40NTUsMCwxNy42OTksMCwxOFYyMS4yN3olMjclMkYlM0UlM0MlMkZzdmclM0VcIjtcclxuICAgICAgICAgICAgICAgICAgICAvL2xldCBzdmcgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0ZjgsJTNDc3ZnIHhtbG5zJTNEJTI3aHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTI3IHZpZXdCb3glM0QlMjcwIDAgMzIgMzIlMjclM0UlM0NwYXRoIGZpbGwlM0QlMjd7Y29sb3J9JTI3IGQlM0QlMjdNMjgsMjBoLTR2LThoNGMxLjEwNCwwLDItMC44OTYsMi0ycy0wLjg5Ni0yLTItMmgtNFY0YzAtMS4xMDQtMC44OTYtMi0yLTJzLTIsMC44OTYtMiwydjRoLThWNGMwLTEuMTA0LTAuODk2LTItMi0yICBTOCwyLjg5Niw4LDR2NEg0Yy0xLjEwNCwwLTIsMC44OTYtMiwyczAuODk2LDIsMiwyaDR2OEg0Yy0xLjEwNCwwLTIsMC44OTYtMiwyczAuODk2LDIsMiwyaDR2NGMwLDEuMTA0LDAuODk2LDIsMiwyczItMC44OTYsMi0ydi00ICBoOHY0YzAsMS4xMDQsMC44OTYsMiwyLDJzMi0wLjg5NiwyLTJ2LTRoNGMxLjEwNCwwLDItMC44OTYsMi0yUzI5LjEwNCwyMCwyOCwyMHogTTEyLDIwdi04aDh2OEgxMnolMjclMkYlM0UlM0MlMkZzdmclM0VcIjtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZ3RoaWNrbmVzcyA9IHBhcnNlRmxvYXQoY3VycmVudFNldHRpbmdzW1wicnVsZXItdGhpY2tuZXNzXCJdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJhY2tncm91bmQgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicnVsZXItYmFja2dyb3VuZFwiXSA9PSBcInBuZ1wiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VIZWlnaHQgPSAoY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0ubWF0Y2goL3B4JC8pKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHBhcnNlRmxvYXQoY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0pICogcGFyc2VGbG9hdChjdXJyZW50U2V0dGluZ3NbXCJmb250LXNpemVcIl0pKS50b0ZpeGVkKDApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0dGVybiA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLXBhdHRlcm5cIl0uc3BsaXQoL1xccysvKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlID0gbmV3IFBuZ0ltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLnJ1bGVyTWF0cml4KGltYWdlSGVpZ2h0LCBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1jb2xvclwiXSwgcGF0dGVybiwgZ3RoaWNrbmVzcywgY3VycmVudFNldHRpbmdzW1wicnVsZXItc2NhbGVcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicnVsZXItb3V0cHV0XCJdICE9IFwiYmFzZTY0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLmdldEZpbGUoY3VycmVudFNldHRpbmdzW1wicnVsZXItb3V0cHV0XCJdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiLi4vXCIgKyBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1vdXRwdXRcIl0gKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcG9zaXRpb246IGxlZnQgdG9wO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcmVwZWF0OiByZXBlYXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1zaXplOiBcIiArIHBhdHRlcm4ubGVuZ3RoICsgXCJweCBcIiArIGltYWdlSGVpZ2h0ICsgXCJweDtcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxcIiArIGltYWdlLmdldEJhc2U2NCgpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXBvc2l0aW9uOiBsZWZ0IHRvcDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXJlcGVhdDogcmVwZWF0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtc2l6ZTogXCIgKyBwYXR0ZXJuLmxlbmd0aCArIFwicHggXCIgKyBpbWFnZUhlaWdodCArIFwicHg7XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBndGhpY2tuZXNzID0gZ3RoaWNrbmVzcyAqIDM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kID0gXCJiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1jb2xvclwiXSArIFwiIFwiICsgZ3RoaWNrbmVzcyArIFwiJSwgdHJhbnNwYXJlbnQgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3RoaWNrbmVzcyArIFwiJSk7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXNpemU6IDEwMCUgXCIgKyBsaW5lSGVpZ2h0ICsgXCI7XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXIgPSBcInBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibGVmdDogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmc6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoOiAxMDAlO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHQ6IDEwMCU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInotaW5kZXg6IDk5MDA7XCIgKyBiYWNrZ3JvdW5kO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgaWNvblNpemUgPSBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1pY29uLXNpemVcIl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBbc3R5bGUsIHJ1bGVyQ2xhc3NdID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItc3R5bGVcIl0uc3BsaXQoL1xccysvKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgW2NvbG9yLCBob3ZlckNvbG9yXSA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWljb24tY29sb3JzXCJdLnNwbGl0KC9cXHMrLyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBydWxlclJ1bGUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3R5bGUgPT0gXCJzd2l0Y2hcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJSdWxlID0gcG9zdGNzcy5wYXJzZShcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6IG5vbmU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgKyBydWxlckNsYXNzICsgXCJcXFwiXSB7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5Om5vbmU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgKyBydWxlckNsYXNzICsgXCJcXFwiXSArIGxhYmVsIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInotaW5kZXg6IDk5OTk7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbjogYWJzb2x1dGU7XCIgKyBydWxlckljb25Qb3NpdGlvbiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hcmdpbjogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmc6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWR0aDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0OiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjdXJzb3I6IHBvaW50ZXI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5yZXBsYWNlKC9cXHtjb2xvclxcfS8sIGVzY2FwZShjb2xvcikpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdOmNoZWNrZWQgKyBsYWJlbCwgaW5wdXRbaWQ9XFxcIlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdOmhvdmVyICsgbGFiZWwge1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJcIiArIHN2Zy5yZXBsYWNlKC9cXHtjb2xvclxcfS8sIGVzY2FwZShob3ZlckNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdOmNoZWNrZWQgfiAuXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5OiBibG9jaztcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3R5bGUgPT0gXCJob3ZlclwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb246IGFic29sdXRlO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVySWNvblBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoOiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHQ6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgKyBzdmcucmVwbGFjZSgvXFx7Y29sb3JcXH0vLCBlc2NhcGUoY29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLWltYWdlIDAuNXMgZWFzZS1pbi1vdXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIuXCIgKyBydWxlckNsYXNzICsgXCI6aG92ZXJcIiArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY3Vyc29yOiBwb2ludGVyO1wiICsgcnVsZXIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0eWxlID09IFwiYWx3YXlzXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCIuXCIgKyBydWxlckNsYXNzICsgXCJ7XFxuXCIgKyBydWxlciArIFwifVxcblwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocnVsZXJSdWxlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJSdWxlLnNvdXJjZSA9IHJ1bGUuc291cmNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgcnVsZXJSdWxlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZS5tYXRjaCgvXihlbGxpcHNpc3xub3dyYXB8Zm9yY2V3cmFwKSQvaSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gcnVsZS5uYW1lLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkZWNscyA9IGhlbHBlcnNbcHJvcGVydHldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkgPT0gXCJlbGxpcHNpc1wiICYmIHJ1bGUucGFyYW1zID09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xzID0gaGVscGVyc1tcIm5vd3JhcFwiXSArIGRlY2xzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicHJvcGVydGllc1wiXSA9PSBcImlubGluZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaWRlY2xzID0gcG9zdGNzcy5wYXJzZShkZWNscyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBpZGVjbHMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInByb3BlcnRpZXNcIl0gPT0gXCJleHRlbmRcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4dGVuZE5hbWUgPSB0b0NhbWVsQ2FzZShydWxlLm5hbWUudG9Mb3dlckNhc2UoKSArIFwiIFwiICsgcnVsZS5wYXJhbXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIGV4dGVuZCBpbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogcnVsZS5wYXJlbnQuc2VsZWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbHM6IGRlY2xzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHM6IFtydWxlLnBhcmVudF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldjogcnVsZS5wcmV2KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9BcHBlbmQgc2VsZWN0b3IgYW5kIHVwZGF0ZSBjb3VudGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5zZWxlY3RvciA9IGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLnNlbGVjdG9yICsgXCIsIFwiICsgcnVsZS5wYXJlbnQuc2VsZWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5wYXJlbnRzLnB1c2gocnVsZS5wYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0uY291bnQrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUubWF0Y2goL14ocmVzZXR8bm9ybWFsaXplKSQvaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBydWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXMgPSBwb3N0Y3NzLnBhcnNlKGhlbHBlcnNbcHJvcGVydHldKTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlcy5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBydWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFdhbGsgaW4gbWVkaWEgcXVlcmllc1xyXG4gICAgICAgICAgICAgICAgbm9kZS53YWxrKGNoaWxkID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT0gXCJydWxlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2FsayBkZWNscyBpbiBydWxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhbGtEZWNscyhjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gZWxzZSBpZiAocnVsZS5uYW1lID09IFwianNcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICAgICBsZXQgamNzcyA9IHJ1bGUudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBsZXQgY29kZSA9IGpjc3MucmVwbGFjZSgvXFxAanNcXHMqXFx7KFtcXHNcXFNdKylcXH0kL2ksIFwiJDFcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGpjc3MpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIC8vIHJ1bGVyUnVsZS5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgcnVsZXJSdWxlKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICBydWxlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT0gXCJydWxlXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBXYWxrIGRlY2xzIGluIHJ1bGVcclxuICAgICAgICAgICAgICAgIHdhbGtEZWNscyhub2RlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFNldHRpbmdzW1wicmVtb3ZlLWNvbW1lbnRzXCJdID09IFwidHJ1ZVwiICYmIG5vZGUudHlwZSA9PSBcImNvbW1lbnRcIikge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIEV4dGVuZHMgdG8gQ1NTXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGtleXMgPSBPYmplY3Qua2V5cyhleHRlbmROb2RlcyksIGtleXNTaXplID0ga2V5cy5sZW5ndGg7IGkgPCBrZXlzU2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgICAgICBpZiAoZXh0ZW5kTm9kZXNba2V5XS5jb3VudCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBydWxlID0gcG9zdGNzcy5wYXJzZShleHRlbmROb2Rlc1trZXldLnNlbGVjdG9yICsgXCJ7XCIgKyBleHRlbmROb2Rlc1trZXldLmRlY2xzICsgXCJ9XCIpO1xyXG4gICAgICAgICAgICAgICAgcnVsZS5zb3VyY2UgPSBleHRlbmROb2Rlc1trZXldLnNvdXJjZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjc3MuaW5zZXJ0QmVmb3JlKGV4dGVuZE5vZGVzW2tleV0ucGFyZW50c1swXSwgcnVsZSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlY2xzID0gcG9zdGNzcy5wYXJzZShleHRlbmROb2Rlc1trZXldLmRlY2xzKTtcclxuICAgICAgICAgICAgICAgIGRlY2xzLnNvdXJjZSA9IGV4dGVuZE5vZGVzW2tleV0uc291cmNlO1xyXG4gICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzWzBdLmluc2VydEFmdGVyKGV4dGVuZE5vZGVzW2tleV0ucHJldiwgZGVjbHMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdW51c2VkIHBhcmVudCBub2Rlcy5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDAsIHBhcmVudHMgPSBleHRlbmROb2Rlc1trZXldLnBhcmVudHMubGVuZ3RoOyBqIDwgcGFyZW50czsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzW2pdLm5vZGVzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzW2pdLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaGFtc3RlcjsiXX0=
