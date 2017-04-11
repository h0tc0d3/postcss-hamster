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
        "ruler-icon-position": "position: fixed;top: 1.5em;left: 1.5em;",
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

        "forcewrap": "white-space: pre;white-space: pre-line;white-space: pre-wrap;word-wrap: break-word;",

        "ellipsis": "overflow: hidden;text-overflow: ellipsis;",

        "hyphens": "word-wrap: break-word;hyphens: auto;",

        "break-word":
        /* Non standard for webkit */
        "word-break: break-word;word-break: break-all;"
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

    // rhythm properties Regexp
    var rhythmRegexp = new RegExp("(lineHeight|spacing|leading|\!rhythm|rhythm)\\((.*?)\\)", "i");

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
            if (key in currentSettings) {
                currentSettings[key] = currentSettings[key].toLowerCase();
            }
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
            // lineHeight, spacing, leading, rhythm, !rhythm
            while (found = decl.value.match(rhythmRegexp)) {

                var property = found[1].toLowerCase(); // lineHeight, spacing, leading, rhythm, !rhythm
                var parameters = found[2].split(/\s*\,\s*/);
                var outputValue = "";
                for (var i = 0, parametersSize = parameters.length; i < parametersSize; i++) {
                    var _parameters$i$split = parameters[i].split(/\s+/),
                        value = _parameters$i$split[0],
                        _fontSize = _parameters$i$split[1];

                    if (_fontSize == null) {
                        decl.parent.walkDecls("font-size", function (fsdecl) {
                            _fontSize = fsdecl.value;
                        });
                    }

                    if (property == "lineheight") {
                        outputValue += rhythmCalculator.lineHeight(_fontSize, value) + " ";
                    } else if (property == "spacing") {
                        outputValue += rhythmCalculator.lineHeight(_fontSize, value, null, true) + " ";
                    } else if (property == "leading") {
                        outputValue += rhythmCalculator.leading(value, _fontSize) + " ";
                    } else if (property == "!rhythm") {
                        var _value$split = value.split(/\$/),
                            inValue = _value$split[0],
                            outputUnit = _value$split[1];

                        outputValue += rhythmCalculator.rhythm(inValue, _fontSize, true, outputUnit) + " ";
                    } else if (property == "rhythm") {
                        var _value$split2 = value.split(/\$/),
                            _inValue = _value$split2[0],
                            _outputUnit = _value$split2[1];

                        outputValue += rhythmCalculator.rhythm(_inValue, _fontSize, false, _outputUnit) + " ";
                    }
                }
                decl.value = decl.value.replace(found[0], outputValue.replace(/\s+$/, ""));
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

                    var _lineHeight = currentSettings["line-height"].match(/px$/i) ? currentSettings["line-height"] : currentSettings["line-height"] + "em";

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

                        background = "background-image: linear-gradient(to top, " + currentSettings["ruler-color"] + " " + gthickness + "%, transparent " + gthickness + "%);" + "background-size: 100% " + _lineHeight + ";";
                    }

                    var ruler = "position: absolute;left: 0;top: 0;margin: 0;padding: 0;width: 100%;height: 100%;z-index: 9900;pointer-events: none;" + background;

                    var iconSize = currentSettings["ruler-icon-size"];

                    var _currentSettings$rule = currentSettings["ruler-style"].split(/\s+/),
                        style = _currentSettings$rule[0],
                        rulerClass = _currentSettings$rule[1];

                    var _currentSettings$rule2 = currentSettings["ruler-icon-colors"].split(/\s+/),
                        color = _currentSettings$rule2[0],
                        hoverColor = _currentSettings$rule2[1];

                    var rulerRule = null;

                    if (style == "switch") {

                        rulerRule = _postcss2.default.parse("." + rulerClass + "{" + "display: none;" + ruler + "}" + "input[id=\"" + rulerClass + "\"] {" + "display:none;" + "}" + "input[id=\"" + rulerClass + "\"] + label {" + "z-index: 9999;" + "display: inline-block;" + rulerIconPosition + "margin: 0;" + "padding: 0;" + "width: " + iconSize + ";" + "height: " + iconSize + ";" + "cursor: pointer;" + "background-image: url(\"" + svg.replace(/\{color\}/, escape(color)) + "\");" + "}" + "input[id=\"" + rulerClass + "\"]:checked + label, input[id=\"" + rulerClass + "\"]:hover + label {" + "background-image: url(\"" + svg.replace(/\{color\}/, escape(hoverColor)) + "\");" + "}" + "input[id=\"" + rulerClass + "\"]:checked ~ ." + rulerClass + "{" + "display: block;" + "}");
                    } else if (style == "hover") {

                        rulerRule = _postcss2.default.parse("." + rulerClass + "{" + rulerIconPosition + "margin: 0;" + "padding: 0;" + "width: " + iconSize + ";" + "height: " + iconSize + ";" + "background-image: url(\"" + svg.replace(/\{color\}/, escape(color)) + "\");" + "transition: background-image 0.5s ease-in-out;" + "}" + "." + rulerClass + ":hover" + "{" + "cursor: pointer;" + ruler + "}");
                    } else if (style == "always") {

                        rulerRule = _postcss2.default.parse("." + rulerClass + "{\n" + ruler + "}\n");
                    }

                    if (rulerRule != null) {
                        rulerRule.source = rule.source;
                        rule.parent.insertBefore(rule, rulerRule);
                    }

                    rule.remove();
                } else if (rule.name.match(/^(ellipsis|nowrap|forcewrap|hyphens|break\-word)$/i)) {

                    var property = rule.name.toLowerCase();

                    var decls = helpers[property];

                    if (property == "hyphens" && rule.params == "true") {
                        decls = helpers["break-word"] + decls;
                    }

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhhbXN0ZXIiLCJvcHRpb25zIiwiZ2xvYmFsU2V0dGluZ3MiLCJnbG9iYWxLZXlzIiwiaGVscGVycyIsInJlYWRGaWxlU3luYyIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJjdXJyZW50U2V0dGluZ3MiLCJjdXJyZW50U2V0dGluZ3NSZWdleHAiLCJjdXJyZW50Rm9udFNpemVzIiwiZm9udFNpemVzQ29sbGVjdGlvbiIsInJoeXRobUNhbGN1bGF0b3IiLCJmb250U2l6ZVJlZ2V4cCIsIlJlZ0V4cCIsInJoeXRobVJlZ2V4cCIsImV4dGVuZCIsIm9iamVjdDEiLCJvYmplY3QyIiwiaSIsImtleXMiLCJPYmplY3QiLCJrZXlzU2l6ZSIsImxlbmd0aCIsImtleSIsInRvQ2FtZWxDYXNlIiwidmFsdWUiLCJ0b0xvd2VyQ2FzZSIsInJlcGxhY2UiLCJtYXRjaCIsImxldHRlciIsInRvVXBwZXJDYXNlIiwiaW5pdFNldHRpbmdzIiwiYWRkRm9udFNpemVzIiwiam9pbiIsIndhbGtEZWNscyIsIm5vZGUiLCJmb3VuZCIsImRlY2wiLCJ2YXJpYWJsZSIsInNwbGl0IiwiZm9udFNpemUiLCJzaXplVW5pdCIsInNpemUiLCJnZXRTaXplIiwicmVsIiwicHgiLCJjZnNpemUiLCJwcm9wIiwibGluZXMiLCJiYXNlRm9udFNpemUiLCJmb250U2l6ZVVuaXQiLCJjb252ZXJ0IiwibGluZUhlaWdodCIsImxpbmVIZWlnaHREZWNsIiwic291cmNlIiwicGFyZW50IiwiaW5zZXJ0QWZ0ZXIiLCJwcm9wZXJ0eSIsInBhcmFtZXRlcnMiLCJvdXRwdXRWYWx1ZSIsInBhcmFtZXRlcnNTaXplIiwiZnNkZWNsIiwibGVhZGluZyIsImluVmFsdWUiLCJvdXRwdXRVbml0Iiwicmh5dGhtIiwiaW5zZXJ0QmVmb3JlIiwiY2xvbmUiLCJyZW1GYWxsYmFjayIsImNzcyIsImV4dGVuZE5vZGVzIiwid2FsayIsInR5cGUiLCJydWxlIiwibmFtZSIsInBhcmFtcyIsInJlbW92ZSIsInBhcnNlSW50IiwiYnJvd3NlckZvbnRTaXplIiwiZm9udFNpemVEZWNsIiwicmVsYXRpdmVTaXplIiwiaHRtbFJ1bGUiLCJzZWxlY3RvciIsImFwcGVuZCIsImFzdGVyaXNrSHRtbFJ1bGUiLCJydWxlckljb25Qb3NpdGlvbiIsInN2ZyIsImd0aGlja25lc3MiLCJwYXJzZUZsb2F0IiwiYmFja2dyb3VuZCIsImltYWdlSGVpZ2h0IiwidG9GaXhlZCIsInBhdHRlcm4iLCJpbWFnZSIsInJ1bGVyTWF0cml4IiwiZ2V0RmlsZSIsImdldEJhc2U2NCIsInJ1bGVyIiwiaWNvblNpemUiLCJzdHlsZSIsInJ1bGVyQ2xhc3MiLCJjb2xvciIsImhvdmVyQ29sb3IiLCJydWxlclJ1bGUiLCJwYXJzZSIsImVzY2FwZSIsImRlY2xzIiwiaWRlY2xzIiwiZXh0ZW5kTmFtZSIsInBhcmVudHMiLCJwcmV2IiwiY291bnQiLCJwdXNoIiwicnVsZXMiLCJjaGlsZCIsImoiLCJub2RlcyJdLCJtYXBwaW5ncyI6Ijs7OztBQVlBOzs7O0FBRUE7O0FBTUE7Ozs7QUFHQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQTFCQTs7Ozs7Ozs7Ozs7O0FBNEJBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxHQUFvQjtBQUFBLFFBQW5CQyxPQUFtQix1RUFBVCxJQUFTOzs7QUFFaEM7QUFDQSxRQUFJQyxpQkFBaUI7O0FBRWpCLHFCQUFhLE1BRkk7QUFHakIsdUJBQWUsS0FIRTtBQUlqQixnQkFBUSxJQUpTO0FBS2pCLHVCQUFlLE1BTEU7QUFNakIsdUJBQWUsT0FORTtBQU9qQixzQkFBYyxHQVBHOztBQVNqQixzQkFBYyxRQVRHOztBQVdqQiw0QkFBb0IsS0FYSDtBQVlqQiw4QkFBc0IsT0FaTDs7QUFjakIsaUJBQVMsTUFkUTtBQWVqQix1QkFBZSxvQkFmRTtBQWdCakIsK0JBQXVCLHlDQWhCTjtBQWlCakIsNkJBQXFCLGlCQWpCSjtBQWtCakIsMkJBQW1CLE1BbEJGO0FBbUJqQix1QkFBZSx3QkFuQkU7QUFvQmpC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QWlCK0IsTUFBL0I7O0FBRUFlLG9CQUFJSCxZQUFKLENBQWlCSSxZQUFZL0MsR0FBWixFQUFpQnNGLE9BQWpCLENBQXlCLENBQXpCLENBQWpCLEVBQThDcEMsSUFBOUM7QUFFSCxhQU5ELE1BTU87QUFDSCxvQkFBSWlDLFFBQVEsa0JBQVFGLEtBQVIsQ0FBY2xDLFlBQVkvQyxHQUFaLEVBQWlCbUYsS0FBL0IsQ0FBWjtBQUNBQSxzQkFBTXBELE1BQU4sR0FBZWdCLFlBQVkvQyxHQUFaLEVBQWlCK0IsTUFBaEM7QUFDQWdCLDRCQUFZL0MsR0FBWixFQUFpQnNGLE9BQWpCLENBQXlCLENBQXpCLEVBQTRCckQsV0FBNUIsQ0FBd0NjLFlBQVkvQyxHQUFaLEVBQWlCdUYsSUFBekQsRUFBK0RKLEtBQS9EO0FBQ0g7O0FBRUQ7QUFDQSxpQkFBSyxJQUFJUyxJQUFJLENBQVIsRUFBV04sVUFBVXZDLFlBQVkvQyxHQUFaLEVBQWlCc0YsT0FBakIsQ0FBeUJ2RixNQUFuRCxFQUEyRDZGLElBQUlOLE9BQS9ELEVBQXdFTSxHQUF4RSxFQUE2RTtBQUN6RSxvQkFBSTdDLFlBQVkvQyxHQUFaLEVBQWlCc0YsT0FBakIsQ0FBeUJNLENBQXpCLEVBQTRCQyxLQUE1QixDQUFrQzlGLE1BQWxDLElBQTRDLENBQWhELEVBQW1EO0FBQy9DZ0QsZ0NBQVkvQyxHQUFaLEVBQWlCc0YsT0FBakIsQ0FBeUJNLENBQXpCLEVBQTRCdkMsTUFBNUI7QUFDSDtBQUNKO0FBRUo7QUFFSixLQW5XRDtBQW9XSCxDQXpsQkQ7QUFQQTs7a0JBa21CZTdFLE8iLCJmaWxlIjoiSGFtc3Rlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbW9kdWxlIEhhbXN0ZXJcclxuICogXHJcbiAqIEBkZXNjcmlwdGlvbiBQb3N0Q1NTIEhhbXN0ZXIgZnJhbWV3b3JrIG1haW4gZnVuY3Rpb25hbGl0eS5cclxuICpcclxuICogQHZlcnNpb24gMS4wXHJcbiAqIEBhdXRob3IgR3JpZ29yeSBWYXNpbHlldiA8cG9zdGNzcy5oYW1zdGVyQGdtYWlsLmNvbT4gaHR0cHM6Ly9naXRodWIuY29tL2gwdGMwZDNcclxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTcsIEdyaWdvcnkgVmFzaWx5ZXZcclxuICogQGxpY2Vuc2UgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wLCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAgXHJcbiAqIFxyXG4gKi9cclxuXHJcbmltcG9ydCBGb250U2l6ZXMgZnJvbSBcIi4vRm9udFNpemVzXCI7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgZm9ybWF0SW50LFxyXG4gICAgZm9ybWF0VmFsdWUsXHJcbiAgICBWZXJ0aWNhbFJoeXRobVxyXG59IGZyb20gXCIuL1ZlcnRpY2FsUmh5dGhtXCI7XHJcblxyXG5pbXBvcnQgUG5nSW1hZ2UgZnJvbSBcIi4vUG5nSW1hZ2VcIjtcclxuLy8gaW1wb3J0IFZpcnR1YWxNYWNoaW5lIGZyb20gXCIuL1ZpcnR1YWxNYWNoaW5lXCI7XHJcblxyXG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcblxyXG5pbXBvcnQgcG9zdGNzcyBmcm9tIFwicG9zdGNzc1wiO1xyXG5cclxuY29uc3QgaGFtc3RlciA9IChvcHRpb25zID0gbnVsbCkgPT4ge1xyXG5cclxuICAgIC8vRGVmYXVsdCBHbG9iYWwgU2V0dGluZ3NcclxuICAgIGxldCBnbG9iYWxTZXR0aW5ncyA9IHtcclxuXHJcbiAgICAgICAgXCJmb250LXNpemVcIjogXCIxNnB4XCIsXHJcbiAgICAgICAgXCJsaW5lLWhlaWdodFwiOiBcIjEuNVwiLFxyXG4gICAgICAgIFwidW5pdFwiOiBcImVtXCIsXHJcbiAgICAgICAgXCJweC1mYWxsYmFja1wiOiBcInRydWVcIixcclxuICAgICAgICBcInB4LWJhc2VsaW5lXCI6IFwiZmFsc2VcIixcclxuICAgICAgICBcImZvbnQtcmF0aW9cIjogXCIwXCIsXHJcblxyXG4gICAgICAgIFwicHJvcGVydGllc1wiOiBcImlubGluZVwiLFxyXG5cclxuICAgICAgICBcIm1pbi1saW5lLXBhZGRpbmdcIjogXCIycHhcIixcclxuICAgICAgICBcInJvdW5kLXRvLWhhbGYtbGluZVwiOiBcImZhbHNlXCIsXHJcblxyXG4gICAgICAgIFwicnVsZXJcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgXCJydWxlci1zdHlsZVwiOiBcImFsd2F5cyBydWxlci1kZWJ1Z1wiLFxyXG4gICAgICAgIFwicnVsZXItaWNvbi1wb3NpdGlvblwiOiBcInBvc2l0aW9uOiBmaXhlZDt0b3A6IDEuNWVtO2xlZnQ6IDEuNWVtO1wiLFxyXG4gICAgICAgIFwicnVsZXItaWNvbi1jb2xvcnNcIjogXCIjY2NjY2NjICM0NDU3NmFcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tc2l6ZVwiOiBcIjI0cHhcIixcclxuICAgICAgICBcInJ1bGVyLWNvbG9yXCI6IFwicmdiYSgxOSwgMTM0LCAxOTEsIC44KVwiLFxyXG4gICAgICAgIFwicnVsZXItdGhpY2tuZXNzXCI6IFwiMVwiLFxyXG4gICAgICAgIFwicnVsZXItYmFja2dyb3VuZFwiOiBcImdyYWRpZW50XCIsXHJcbiAgICAgICAgXCJydWxlci1vdXRwdXRcIjogXCJiYXNlNjRcIixcclxuICAgICAgICBcInJ1bGVyLXBhdHRlcm5cIjogXCIxIDAgMCAwXCIsXHJcbiAgICAgICAgXCJydWxlci1zY2FsZVwiOiBcIjFcIixcclxuXHJcbiAgICAgICAgXCJicm93c2VyLWZvbnQtc2l6ZVwiOiBcIjE2cHhcIixcclxuICAgICAgICBcImxlZ2FjeS1icm93c2Vyc1wiOiBcInRydWVcIixcclxuICAgICAgICBcInJlbW92ZS1jb21tZW50c1wiOiBcImZhbHNlXCJcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBnbG9iYWxLZXlzID0gW1widW5pdFwiLFxyXG4gICAgICAgIFwicHgtZmFsbGJhY2tcIixcclxuICAgICAgICBcInB4LWJhc2VsaW5lXCIsXHJcbiAgICAgICAgXCJmb250LXJhdGlvXCIsXHJcbiAgICAgICAgXCJwcm9wZXJ0aWVzXCIsXHJcbiAgICAgICAgXCJyb3VuZC10by1oYWxmLWxpbmVcIixcclxuICAgICAgICBcInJ1bGVyXCIsXHJcbiAgICAgICAgXCJydWxlci1zdHlsZVwiLFxyXG4gICAgICAgIFwicnVsZXItYmFja2dyb3VuZFwiLFxyXG4gICAgICAgIFwicnVsZXItb3V0cHV0XCIsXHJcbiAgICAgICAgXCJsZWdhY3ktYnJvd3NlcnNcIixcclxuICAgICAgICBcInJlbW92ZS1jb21tZW50c1wiXHJcbiAgICBdO1xyXG5cclxuICAgIGxldCBoZWxwZXJzID0ge1xyXG5cclxuICAgICAgICBcInJlc2V0XCI6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2hlbHBlcnMvcmVzZXQuY3NzXCIpLCBcInV0ZjhcIiksXHJcblxyXG4gICAgICAgIFwibm9ybWFsaXplXCI6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2hlbHBlcnMvbm9ybWFsaXplLmNzc1wiKSwgXCJ1dGY4XCIpLFxyXG5cclxuICAgICAgICBcIm5vd3JhcFwiOiBcIndoaXRlLXNwYWNlOiBub3dyYXA7XCIsXHJcblxyXG4gICAgICAgIFwiZm9yY2V3cmFwXCI6IFwid2hpdGUtc3BhY2U6IHByZTtcIiArXHJcbiAgICAgICAgICAgIFwid2hpdGUtc3BhY2U6IHByZS1saW5lO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XCIgK1xyXG4gICAgICAgICAgICBcIndvcmQtd3JhcDogYnJlYWstd29yZDtcIixcclxuXHJcbiAgICAgICAgXCJlbGxpcHNpc1wiOiBcIm92ZXJmbG93OiBoaWRkZW47XCIgK1xyXG4gICAgICAgICAgICBcInRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1wiLFxyXG5cclxuICAgICAgICBcImh5cGhlbnNcIjogXCJ3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XCIgK1xyXG4gICAgICAgICAgICBcImh5cGhlbnM6IGF1dG87XCIsXHJcblxyXG4gICAgICAgIFwiYnJlYWstd29yZFwiOlxyXG4gICAgICAgICAgICAvKiBOb24gc3RhbmRhcmQgZm9yIHdlYmtpdCAqL1xyXG4gICAgICAgICAgICBcIndvcmQtYnJlYWs6IGJyZWFrLXdvcmQ7XCIgK1xyXG4gICAgICAgICAgICAvKiBXYXJuaW5nOiBOZWVkZWQgZm9yIG9sZElFIHN1cHBvcnQsIGJ1dCB3b3JkcyBhcmUgYnJva2VuIHVwIGxldHRlci1ieS1sZXR0ZXIgKi9cclxuICAgICAgICAgICAgXCJ3b3JkLWJyZWFrOiBicmVhay1hbGw7XCJcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEN1cnJlbnQgVmFyaWFibGVzXHJcbiAgICBsZXQgY3VycmVudFNldHRpbmdzID0ge307XHJcbiAgICBsZXQgY3VycmVudFNldHRpbmdzUmVnZXhwO1xyXG4gICAgLy9DdXJyZW50IEZvbnRTaXplc1xyXG4gICAgbGV0IGN1cnJlbnRGb250U2l6ZXMgPSBcIlwiO1xyXG4gICAgLy8gZm9udCBTaXplc1xyXG4gICAgbGV0IGZvbnRTaXplc0NvbGxlY3Rpb247XHJcbiAgICAvLyBWZXJ0aWNhbCBSaHl0aG0gQ2FsY3VsYXRvclxyXG4gICAgbGV0IHJoeXRobUNhbGN1bGF0b3I7XHJcbiAgICAvLyBMYXN0IENzcyBGaWxlXHJcbiAgICAvLyBsZXQgbGFzdEZpbGU7XHJcblxyXG4gICAgLy8gbGV0IHZtID0gbmV3IFZpcnR1YWxNYWNoaW5lKCk7XHJcbiAgICAvLyBmb250U2l6ZSBwcm9wZXJ0eSBSZWdleHBcclxuICAgIGNvbnN0IGZvbnRTaXplUmVnZXhwID0gbmV3IFJlZ0V4cChcImZvbnRTaXplXFxcXHMrKFtcXFxcLVxcXFwkXFxcXEAwLTlhLXpBLVpdKylcIiwgXCJpXCIpO1xyXG5cclxuICAgIC8vIHJoeXRobSBwcm9wZXJ0aWVzIFJlZ2V4cFxyXG4gICAgY29uc3Qgcmh5dGhtUmVnZXhwID0gbmV3IFJlZ0V4cChcIihsaW5lSGVpZ2h0fHNwYWNpbmd8bGVhZGluZ3xcXCFyaHl0aG18cmh5dGhtKVxcXFwoKC4qPylcXFxcKVwiLCBcImlcIik7XHJcblxyXG4gICAgLy8gQ29weSBWYWx1ZXMgZnJvbSBvYmplY3QgMiB0byBvYmplY3QgMTtcclxuICAgIGNvbnN0IGV4dGVuZCA9IChvYmplY3QxLCBvYmplY3QyKSA9PiB7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0MiksIGtleXNTaXplID0ga2V5cy5sZW5ndGg7IGkgPCBrZXlzU2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgICAgICBvYmplY3QxW2tleV0gPSBvYmplY3QyW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvYmplY3QxO1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAob3B0aW9ucyAhPSBudWxsKSB7XHJcbiAgICAgICAgZXh0ZW5kKGdsb2JhbFNldHRpbmdzLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0b0NhbWVsQ2FzZSA9ICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL15bXmEtejAtOV0qKC4qKVteYS16MC05XSokLywgXCIkMVwiKS5yZXBsYWNlKC9bXmEtejAtOV0rKFthLXowLTldKS9nLCAobWF0Y2gsIGxldHRlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbGV0dGVyLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgY29uc3QgaW5pdFNldHRpbmdzID0gKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBBZGQgZm9udFNpemVzXHJcbiAgICAgICAgaWYgKFwiZm9udC1zaXplc1wiIGluIGdsb2JhbFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBnbG9iYWxTZXR0aW5nc1tcImZvbnQtc2l6ZXNcIl07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXCJmb250LXNpemVzXCIgaW4gY3VycmVudFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBjdXJyZW50Rm9udFNpemVzICsgXCIsIFwiICsgY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplc1wiXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRvTG93ZXJDYXNlIEN1cnJlbnQgU2V0dGluZ3NcclxuICAgICAgICBmb3IgKGxldCBpID0gMCwga2V5c1NpemUgPSBnbG9iYWxLZXlzLmxlbmd0aDsgaSA8IGtleXNTaXplOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGdsb2JhbEtleXNbaV07XHJcbiAgICAgICAgICAgIGlmIChrZXkgaW4gY3VycmVudFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3Nba2V5XSA9IGN1cnJlbnRTZXR0aW5nc1trZXldLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvbnRTaXplc0NvbGxlY3Rpb24gPSBuZXcgRm9udFNpemVzKGN1cnJlbnRTZXR0aW5ncyk7XHJcbiAgICAgICAgcmh5dGhtQ2FsY3VsYXRvciA9IG5ldyBWZXJ0aWNhbFJoeXRobShjdXJyZW50U2V0dGluZ3MpO1xyXG4gICAgICAgIGZvbnRTaXplc0NvbGxlY3Rpb24uYWRkRm9udFNpemVzKGN1cnJlbnRGb250U2l6ZXMsIHJoeXRobUNhbGN1bGF0b3IpO1xyXG4gICAgICAgIGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCA9IG5ldyBSZWdFeHAoXCJcXFxcQChcIiArIE9iamVjdC5rZXlzKGN1cnJlbnRTZXR0aW5ncykuam9pbihcInxcIikucmVwbGFjZSgvKFxcLXxcXF8pL2csIFwiXFxcXCQxXCIpICsgXCIpXCIsIFwiaVwiKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHdhbGtEZWNscyA9IChub2RlKSA9PiB7XHJcbiAgICAgICAgbm9kZS53YWxrRGVjbHMoZGVjbCA9PiB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZm91bmQ7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXBsYWNlIFZhcmlhYmxlcyB3aXRoIHZhbHVlc1xyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChjdXJyZW50U2V0dGluZ3NSZWdleHApKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhcmlhYmxlID0gZm91bmRbMV07XHJcbiAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCwgY3VycmVudFNldHRpbmdzW3ZhcmlhYmxlXSk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZXBsYWNlIEZvbnQgU2l6ZVxyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChmb250U2l6ZVJlZ2V4cCkpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IFtmb250U2l6ZSwgc2l6ZVVuaXRdID0gZm91bmRbMV0uc3BsaXQoL1xcJC9pKTtcclxuICAgICAgICAgICAgICAgIHNpemVVbml0ID0gKHNpemVVbml0ICE9IG51bGwpID8gc2l6ZVVuaXQudG9Mb3dlckNhc2UoKSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHNpemUgPSBmb250U2l6ZXNDb2xsZWN0aW9uLmdldFNpemUoZm9udFNpemUpO1xyXG4gICAgICAgICAgICAgICAgLy8gV3JpdGUgZm9udCBzaXplXHJcbiAgICAgICAgICAgICAgICBpZiAoc2l6ZVVuaXQgIT0gbnVsbCAmJiAoc2l6ZVVuaXQgPT0gXCJlbVwiIHx8IHNpemVVbml0ID09IFwicmVtXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGZvcm1hdFZhbHVlKHNpemUucmVsKSArIHNpemVVbml0KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNpemVVbml0ICE9IG51bGwgJiYgc2l6ZVVuaXQgPT0gXCJweFwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGZvcm1hdEludChzaXplLnB4KSArIFwicHhcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNmc2l6ZSA9IChjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdID09IFwicHhcIikgPyBmb3JtYXRJbnQoc2l6ZS5weCkgOiBmb3JtYXRWYWx1ZShzaXplLnJlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGNmc2l6ZSArIGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0pO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkanVzdCBGb250IFNpemVcclxuICAgICAgICAgICAgaWYgKGRlY2wucHJvcCA9PSBcImFkanVzdC1mb250LXNpemVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBbZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemVdID0gZGVjbC52YWx1ZS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplVW5pdCA9IGZvbnRTaXplLm1hdGNoKC8ocHh8ZW18cmVtKSQvaSlbMF0udG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHJoeXRobUNhbGN1bGF0b3IuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCBudWxsLCBiYXNlRm9udFNpemUpICsgY3VycmVudFNldHRpbmdzW1widW5pdFwiXTtcclxuXHJcbiAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZm9udFNpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0RGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBsaW5lSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZGVjbC5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlY2wucHJvcCA9IFwiZm9udC1zaXplXCI7XHJcbiAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC5pbnNlcnRBZnRlcihkZWNsLCBsaW5lSGVpZ2h0RGVjbCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGxpbmVIZWlnaHQsIHNwYWNpbmcsIGxlYWRpbmcsIHJoeXRobSwgIXJoeXRobVxyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChyaHl0aG1SZWdleHApKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBwcm9wZXJ0eSA9IGZvdW5kWzFdLnRvTG93ZXJDYXNlKCk7IC8vIGxpbmVIZWlnaHQsIHNwYWNpbmcsIGxlYWRpbmcsIHJoeXRobSwgIXJoeXRobVxyXG4gICAgICAgICAgICAgICAgbGV0IHBhcmFtZXRlcnMgPSBmb3VuZFsyXS5zcGxpdCgvXFxzKlxcLFxccyovKTtcclxuICAgICAgICAgICAgICAgIGxldCBvdXRwdXRWYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgcGFyYW1ldGVyc1NpemUgPSBwYXJhbWV0ZXJzLmxlbmd0aDsgaSA8IHBhcmFtZXRlcnNTaXplOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFt2YWx1ZSwgZm9udFNpemVdID0gcGFyYW1ldGVyc1tpXS5zcGxpdCgvXFxzKy8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZm9udFNpemUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC53YWxrRGVjbHMoXCJmb250LXNpemVcIiwgZnNkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gZnNkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eSA9PSBcImxpbmVoZWlnaHRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRWYWx1ZSArPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIHZhbHVlKSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkgPT0gXCJzcGFjaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0VmFsdWUgKz0gcmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSwgbnVsbCwgdHJ1ZSkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09IFwibGVhZGluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFZhbHVlICs9IHJoeXRobUNhbGN1bGF0b3IubGVhZGluZyh2YWx1ZSwgZm9udFNpemUpICsgXCIgXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wZXJ0eSA9PSBcIiFyaHl0aG1cIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgW2luVmFsdWUsIG91dHB1dFVuaXRdID0gdmFsdWUuc3BsaXQoL1xcJC8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRWYWx1ZSArPSByaHl0aG1DYWxjdWxhdG9yLnJoeXRobShpblZhbHVlLCBmb250U2l6ZSwgdHJ1ZSwgb3V0cHV0VW5pdCkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09IFwicmh5dGhtXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IFtpblZhbHVlLCBvdXRwdXRVbml0XSA9IHZhbHVlLnNwbGl0KC9cXCQvKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0VmFsdWUgKz0gcmh5dGhtQ2FsY3VsYXRvci5yaHl0aG0oaW5WYWx1ZSwgZm9udFNpemUsIGZhbHNlLCBvdXRwdXRVbml0KSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm91bmRbMF0sIG91dHB1dFZhbHVlLnJlcGxhY2UoL1xccyskLywgXCJcIikpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyByZW0gZmFsbGJhY2tcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInB4LWZhbGxiYWNrXCJdID09IFwidHJ1ZVwiICYmIGRlY2wudmFsdWUubWF0Y2goL1swLTlcXC5dK3JlbS9pKSkge1xyXG4gICAgICAgICAgICAgICAgZGVjbC5wYXJlbnQuaW5zZXJ0QmVmb3JlKGRlY2wsIGRlY2wuY2xvbmUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiByaHl0aG1DYWxjdWxhdG9yLnJlbUZhbGxiYWNrKGRlY2wudmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZGVjbC5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gKGNzcykgPT4ge1xyXG5cclxuICAgICAgICAvLyBFeHRlbmQgTm9kZXNcclxuICAgICAgICBsZXQgZXh0ZW5kTm9kZXMgPSB7fTtcclxuXHJcbiAgICAgICAgY3NzLndhbGsobm9kZSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGlmIChsYXN0RmlsZSAhPSBub2RlLnNvdXJjZS5pbnB1dC5maWxlKSB7XHJcbiAgICAgICAgICAgIC8vIFx0bGFzdEZpbGUgPSBub2RlLnNvdXJjZS5pbnB1dC5maWxlO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICBpZiAobm9kZS50eXBlID09IFwiYXRydWxlXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcnVsZSA9IG5vZGU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGUubmFtZSA9PSBcImhhbXN0ZXJcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocnVsZS5wYXJhbXMgIT0gXCJlbmRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgR2xvYmFsIFZhcmlhYmxlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLndhbGtEZWNscyhkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbFNldHRpbmdzW2RlY2wucHJvcF0gPSBkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgZm9udFNpemVzXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKFwiZm9udC1zaXplc1wiIGluIGdsb2JhbFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBnbG9iYWxTZXR0aW5nc1tcImZvbnQtc2l6ZXNcIl07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IGN1cnJlbnQgdmFyaWFibGVzXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzID0gZXh0ZW5kKHt9LCBnbG9iYWxTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRTZXR0aW5ncygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgUnVsZSBIYW1zdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcIiFoYW1zdGVyXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9jdXJyZW50U2V0dGluZ3MgPSBleHRlbmQoe30sIGdsb2JhbFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS53YWxrRGVjbHMoZGVjbCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTZXR0aW5nc1tkZWNsLnByb3BdID0gZGVjbC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFNldHRpbmdzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUgPT0gXCJiYXNlbGluZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZSA9IHBhcnNlSW50KGN1cnJlbnRTZXR0aW5nc1tcImZvbnQtc2l6ZVwiXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJyb3dzZXJGb250U2l6ZSA9IHBhcnNlSW50KGN1cnJlbnRTZXR0aW5nc1tcImJyb3dzZXItZm9udC1zaXplXCJdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUgKyBcInB4XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBiYXNlbGluZSBmb250IHNpemVcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZm9udFNpemVEZWNsID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInB4LWJhc2VsaW5lXCJdID09IFwidHJ1ZVwiIHx8IChjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdID09IFwicHhcIiAmJiBjdXJyZW50U2V0dGluZ3NbXCJsZWdhY3ktYnJvd3NlcnNcIl0gIT0gXCJ0cnVlXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZURlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJmb250LXNpemVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmb250U2l6ZSArIFwicHhcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVsYXRpdmVTaXplID0gMTAwICogZm9udFNpemUgLyBicm93c2VyRm9udFNpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZURlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJmb250LXNpemVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmb3JtYXRWYWx1ZShyZWxhdGl2ZVNpemUpICsgXCIlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0RGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IFwibGluZS1oZWlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGxpbmVIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlLnBhcmFtcy5tYXRjaCgvXFxzKmh0bWxcXHMqLykpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBodG1sUnVsZSA9IHBvc3Rjc3MucnVsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCJodG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbFJ1bGUuYXBwZW5kKGZvbnRTaXplRGVjbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxSdWxlLmFwcGVuZChsaW5lSGVpZ2h0RGVjbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBodG1sUnVsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1widW5pdFwiXSA9PSBcInB4XCIgJiYgY3VycmVudFNldHRpbmdzW1wibGVnYWN5LWJyb3dzZXJzXCJdID09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXN0ZXJpc2tIdG1sUnVsZSA9IHBvc3Rjc3MucnVsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiKiBodG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Rlcmlza0h0bWxSdWxlLmFwcGVuZChsaW5lSGVpZ2h0RGVjbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBhc3Rlcmlza0h0bWxSdWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgbGluZUhlaWdodERlY2wpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBmb250U2l6ZURlY2wpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0gPT0gXCJyZW1cIiAmJiBjdXJyZW50U2V0dGluZ3NbXCJweC1mYWxsYmFja1wiXSA9PSBcInRydWVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShsaW5lSGVpZ2h0RGVjbCwgcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJoeXRobUNhbGN1bGF0b3IucmVtRmFsbGJhY2sobGluZUhlaWdodCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcInJ1bGVyXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVySWNvblBvc2l0aW9uID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItaWNvbi1wb3NpdGlvblwiXS5yZXBsYWNlKC8oXFwnfFxcXCIpL2csIFwiXCIpLnJlcGxhY2UoL1xcOy9nLCBcIjtcXG5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0ID0gKGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdLm1hdGNoKC9weCQvaSkpID8gY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0gOiBjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSArIFwiZW1cIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGY4LCUzQ3N2ZyB4bWxucyUzRCUyN2h0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyNyB2aWV3Qm94JTNEJTI3MCAwIDI0IDI0JTI3JTNFJTNDcGF0aCBmaWxsJTNEJTI3e2NvbG9yfSUyNyBkJTNEJTI3TTE4IDI0Yy0wLjMgMC0wLjU0OC0wLjI0Ni0wLjU0OC0wLjU0NlYxOGMwLTAuMyAwLjI0OC0wLjU0NiAwLjU0OC0wLjU0Nmg1LjQ1MiAgQzIzLjc1NCAxNy40NTQgMjQgMTcuNyAyNCAxOHY1LjQ1NGMwIDAuMy0wLjI0NiAwLjU0Ni0wLjU0OCAwLjU0NkgxOHogTTkuMjcxIDI0Yy0wLjI5OCAwLTAuNTQzLTAuMjQ2LTAuNTQzLTAuNTQ2VjE4ICBjMC0wLjMgMC4yNDUtMC41NDYgMC41NDMtMC41NDZoNS40NTdjMC4zIDAgMC41NDMgMC4yNDYgMC41NDMgMC41NDZ2NS40NTRjMCAwLjMtMC4yNDMgMC41NDYtMC41NDMgMC41NDZIOS4yNzF6IE0wLjU0OCAyNCAgQzAuMjQ2IDI0IDAgMjMuNzU0IDAgMjMuNDU0VjE4YzAtMC4zIDAuMjQ2LTAuNTQ2IDAuNTQ4LTAuNTQ2SDZjMC4zMDIgMCAwLjU0OCAwLjI0NiAwLjU0OCAwLjU0NnY1LjQ1NEM2LjU0OCAyMy43NTQgNi4zMDIgMjQgNiAyNCAgSDAuNTQ4eiBNMTggMTUuMjcxYy0wLjMgMC0wLjU0OC0wLjI0NC0wLjU0OC0wLjU0MlY5LjI3MmMwLTAuMjk5IDAuMjQ4LTAuNTQ1IDAuNTQ4LTAuNTQ1aDUuNDUyQzIzLjc1NCA4LjcyNyAyNCA4Ljk3MyAyNCA5LjI3MiAgdjUuNDU3YzAgMC4yOTgtMC4yNDYgMC41NDItMC41NDggMC41NDJIMTh6IE05LjI3MSAxNS4yNzFjLTAuMjk4IDAtMC41NDMtMC4yNDQtMC41NDMtMC41NDJWOS4yNzJjMC0wLjI5OSAwLjI0NS0wLjU0NSAwLjU0My0wLjU0NSAgaDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ2IDAuNTQzIDAuNTQ1djUuNDU3YzAgMC4yOTgtMC4yNDMgMC41NDItMC41NDMgMC41NDJIOS4yNzF6IE0wLjU0OCAxNS4yNzFDMC4yNDYgMTUuMjcxIDAgMTUuMDI2IDAgMTQuNzI5ICBWOS4yNzJjMC0wLjI5OSAwLjI0Ni0wLjU0NSAwLjU0OC0wLjU0NUg2YzAuMzAyIDAgMC41NDggMC4yNDYgMC41NDggMC41NDV2NS40NTdjMCAwLjI5OC0wLjI0NiAwLjU0Mi0wLjU0OCAwLjU0MkgwLjU0OHogTTE4IDYuNTQ1ICBjLTAuMyAwLTAuNTQ4LTAuMjQ1LTAuNTQ4LTAuNTQ1VjAuNTQ1QzE3LjQ1MiAwLjI0NSAxNy43IDAgMTggMGg1LjQ1MkMyMy43NTQgMCAyNCAwLjI0NSAyNCAwLjU0NVY2YzAgMC4zLTAuMjQ2IDAuNTQ1LTAuNTQ4IDAuNTQ1ICBIMTh6IE05LjI3MSA2LjU0NUM4Ljk3NCA2LjU0NSA4LjcyOSA2LjMgOC43MjkgNlYwLjU0NUM4LjcyOSAwLjI0NSA4Ljk3NCAwIDkuMjcxIDBoNS40NTdjMC4zIDAgMC41NDMgMC4yNDUgMC41NDMgMC41NDVWNiAgYzAgMC4zLTAuMjQzIDAuNTQ1LTAuNTQzIDAuNTQ1SDkuMjcxeiBNMC41NDggNi41NDVDMC4yNDYgNi41NDUgMCA2LjMgMCA2VjAuNTQ1QzAgMC4yNDUgMC4yNDYgMCAwLjU0OCAwSDYgIGMwLjMwMiAwIDAuNTQ4IDAuMjQ1IDAuNTQ4IDAuNTQ1VjZjMCAwLjMtMC4yNDYgMC41NDUtMC41NDggMC41NDVIMC41NDh6JTI3JTJGJTNFJTNDJTJGc3ZnJTNFXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAyNCAyNCUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00wLDZjMCwwLjMwMSwwLjI0NiwwLjU0NSwwLjU0OSwwLjU0NWgyMi45MDZDMjMuNzU2LDYuNTQ1LDI0LDYuMzAxLDI0LDZWMi43M2MwLTAuMzA1LTAuMjQ0LTAuNTQ5LTAuNTQ1LTAuNTQ5SDAuNTQ5ICBDMC4yNDYsMi4xODIsMCwyLjQyNiwwLDIuNzNWNnogTTAsMTMuNjM3YzAsMC4yOTcsMC4yNDYsMC41NDUsMC41NDksMC41NDVoMjIuOTA2YzAuMzAxLDAsMC41NDUtMC4yNDgsMC41NDUtMC41NDV2LTMuMjczICBjMC0wLjI5Ny0wLjI0NC0wLjU0NS0wLjU0NS0wLjU0NUgwLjU0OUMwLjI0Niw5LjgxOCwwLDEwLjA2NiwwLDEwLjM2M1YxMy42Mzd6IE0wLDIxLjI3YzAsMC4zMDUsMC4yNDYsMC41NDksMC41NDksMC41NDloMjIuOTA2ICBjMC4zMDEsMCwwLjU0NS0wLjI0NCwwLjU0NS0wLjU0OVYxOGMwLTAuMzAxLTAuMjQ0LTAuNTQ1LTAuNTQ1LTAuNTQ1SDAuNTQ5QzAuMjQ2LDE3LjQ1NSwwLDE3LjY5OSwwLDE4VjIxLjI3eiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAzMiAzMiUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00yOCwyMGgtNHYtOGg0YzEuMTA0LDAsMi0wLjg5NiwyLTJzLTAuODk2LTItMi0yaC00VjRjMC0xLjEwNC0wLjg5Ni0yLTItMnMtMiwwLjg5Ni0yLDJ2NGgtOFY0YzAtMS4xMDQtMC44OTYtMi0yLTIgIFM4LDIuODk2LDgsNHY0SDRjLTEuMTA0LDAtMiwwLjg5Ni0yLDJzMC44OTYsMiwyLDJoNHY4SDRjLTEuMTA0LDAtMiwwLjg5Ni0yLDJzMC44OTYsMiwyLDJoNHY0YzAsMS4xMDQsMC44OTYsMiwyLDJzMi0wLjg5NiwyLTJ2LTQgIGg4djRjMCwxLjEwNCwwLjg5NiwyLDIsMnMyLTAuODk2LDItMnYtNGg0YzEuMTA0LDAsMi0wLjg5NiwyLTJTMjkuMTA0LDIwLDI4LDIweiBNMTIsMjB2LThoOHY4SDEyeiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBndGhpY2tuZXNzID0gcGFyc2VGbG9hdChjdXJyZW50U2V0dGluZ3NbXCJydWxlci10aGlja25lc3NcIl0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgYmFja2dyb3VuZCA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJydWxlci1iYWNrZ3JvdW5kXCJdID09IFwicG5nXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZUhlaWdodCA9IChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXS5tYXRjaCgvcHgkLykpID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAocGFyc2VGbG9hdChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSkgKiBwYXJzZUZsb2F0KGN1cnJlbnRTZXR0aW5nc1tcImZvbnQtc2l6ZVwiXSkpLnRvRml4ZWQoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXR0ZXJuID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItcGF0dGVyblwiXS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2UgPSBuZXcgUG5nSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UucnVsZXJNYXRyaXgoaW1hZ2VIZWlnaHQsIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWNvbG9yXCJdLCBwYXR0ZXJuLCBndGhpY2tuZXNzLCBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1zY2FsZVwiXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJydWxlci1vdXRwdXRcIl0gIT0gXCJiYXNlNjRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuZ2V0RmlsZShjdXJyZW50U2V0dGluZ3NbXCJydWxlci1vdXRwdXRcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCIuLi9cIiArIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLW91dHB1dFwiXSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1wb3NpdGlvbjogbGVmdCB0b3A7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1yZXBlYXQ6IHJlcGVhdDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXNpemU6IFwiICsgcGF0dGVybi5sZW5ndGggKyBcInB4IFwiICsgaW1hZ2VIZWlnaHQgKyBcInB4O1wiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LFwiICsgaW1hZ2UuZ2V0QmFzZTY0KCkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcG9zaXRpb246IGxlZnQgdG9wO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcmVwZWF0OiByZXBlYXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1zaXplOiBcIiArIHBhdHRlcm4ubGVuZ3RoICsgXCJweCBcIiArIGltYWdlSGVpZ2h0ICsgXCJweDtcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGd0aGlja25lc3MgPSBndGhpY2tuZXNzICogMztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcImJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byB0b3AsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWNvbG9yXCJdICsgXCIgXCIgKyBndGhpY2tuZXNzICsgXCIlLCB0cmFuc3BhcmVudCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBndGhpY2tuZXNzICsgXCIlKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtc2l6ZTogMTAwJSBcIiArIGxpbmVIZWlnaHQgKyBcIjtcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBydWxlciA9IFwicG9zaXRpb246IGFic29sdXRlO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJsZWZ0OiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b3A6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1hcmdpbjogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGg6IDEwMCU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodDogMTAwJTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiei1pbmRleDogOTkwMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicG9pbnRlci1ldmVudHM6IG5vbmU7XCIgKyBiYWNrZ3JvdW5kO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgaWNvblNpemUgPSBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1pY29uLXNpemVcIl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBbc3R5bGUsIHJ1bGVyQ2xhc3NdID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItc3R5bGVcIl0uc3BsaXQoL1xccysvKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgW2NvbG9yLCBob3ZlckNvbG9yXSA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWljb24tY29sb3JzXCJdLnNwbGl0KC9cXHMrLyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBydWxlclJ1bGUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3R5bGUgPT0gXCJzd2l0Y2hcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJSdWxlID0gcG9zdGNzcy5wYXJzZShcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6IG5vbmU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgKyBydWxlckNsYXNzICsgXCJcXFwiXSB7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5Om5vbmU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgKyBydWxlckNsYXNzICsgXCJcXFwiXSArIGxhYmVsIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInotaW5kZXg6IDk5OTk7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJJY29uUG9zaXRpb24gK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYWRkaW5nOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGg6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY3Vyc29yOiBwb2ludGVyO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdmcucmVwbGFjZSgvXFx7Y29sb3JcXH0vLCBlc2NhcGUoY29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgKyBydWxlckNsYXNzICsgXCJcXFwiXTpjaGVja2VkICsgbGFiZWwsIGlucHV0W2lkPVxcXCJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlckNsYXNzICsgXCJcXFwiXTpob3ZlciArIGxhYmVsIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgKyBzdmcucmVwbGFjZSgvXFx7Y29sb3JcXH0vLCBlc2NhcGUoaG92ZXJDb2xvcikpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlckNsYXNzICsgXCJcXFwiXTpjaGVja2VkIH4gLlwiICsgcnVsZXJDbGFzcyArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTogYmxvY2s7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0eWxlID09IFwiaG92ZXJcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJSdWxlID0gcG9zdGNzcy5wYXJzZShcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlckljb25Qb3NpdGlvbiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hcmdpbjogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmc6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWR0aDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0OiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIlwiICsgc3ZnLnJlcGxhY2UoL1xce2NvbG9yXFx9LywgZXNjYXBlKGNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHJhbnNpdGlvbjogYmFja2dyb3VuZC1pbWFnZSAwLjVzIGVhc2UtaW4tb3V0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLlwiICsgcnVsZXJDbGFzcyArIFwiOmhvdmVyXCIgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnNvcjogcG9pbnRlcjtcIiArIHJ1bGVyICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdHlsZSA9PSBcImFsd2F5c1wiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1xcblwiICsgcnVsZXIgKyBcIn1cXG5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGVyUnVsZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyUnVsZS5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJ1bGUsIHJ1bGVyUnVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUubWF0Y2goL14oZWxsaXBzaXN8bm93cmFwfGZvcmNld3JhcHxoeXBoZW5zfGJyZWFrXFwtd29yZCkkL2kpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9wZXJ0eSA9IHJ1bGUubmFtZS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVjbHMgPSBoZWxwZXJzW3Byb3BlcnR5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5ID09IFwiaHlwaGVuc1wiICYmIHJ1bGUucGFyYW1zID09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xzID0gaGVscGVyc1tcImJyZWFrLXdvcmRcIl0gKyBkZWNscztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eSA9PSBcImVsbGlwc2lzXCIgJiYgcnVsZS5wYXJhbXMgPT0gXCJ0cnVlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjbHMgPSBoZWxwZXJzW1wibm93cmFwXCJdICsgZGVjbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicHJvcGVydGllc1wiXSA9PSBcImlubGluZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaWRlY2xzID0gcG9zdGNzcy5wYXJzZShkZWNscyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBpZGVjbHMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInByb3BlcnRpZXNcIl0gPT0gXCJleHRlbmRcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4dGVuZE5hbWUgPSB0b0NhbWVsQ2FzZShwcm9wZXJ0eSArIFwiIFwiICsgcnVsZS5wYXJhbXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIGV4dGVuZCBpbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogcnVsZS5wYXJlbnQuc2VsZWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbHM6IGRlY2xzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHM6IFtydWxlLnBhcmVudF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldjogcnVsZS5wcmV2KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9BcHBlbmQgc2VsZWN0b3IgYW5kIHVwZGF0ZSBjb3VudGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5zZWxlY3RvciA9IGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLnNlbGVjdG9yICsgXCIsIFwiICsgcnVsZS5wYXJlbnQuc2VsZWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5wYXJlbnRzLnB1c2gocnVsZS5wYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0uY291bnQrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUubWF0Y2goL14ocmVzZXR8bm9ybWFsaXplKSQvaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBydWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXMgPSBwb3N0Y3NzLnBhcnNlKGhlbHBlcnNbcHJvcGVydHldKTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlcy5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBydWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFdhbGsgaW4gbWVkaWEgcXVlcmllc1xyXG4gICAgICAgICAgICAgICAgbm9kZS53YWxrKGNoaWxkID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT0gXCJydWxlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2FsayBkZWNscyBpbiBydWxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhbGtEZWNscyhjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gZWxzZSBpZiAocnVsZS5uYW1lID09IFwianNcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICAgICBsZXQgamNzcyA9IHJ1bGUudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBsZXQgY29kZSA9IGpjc3MucmVwbGFjZSgvXFxAanNcXHMqXFx7KFtcXHNcXFNdKylcXH0kL2ksIFwiJDFcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGpjc3MpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIC8vIHJ1bGVyUnVsZS5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgcnVsZXJSdWxlKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICBydWxlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT0gXCJydWxlXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBXYWxrIGRlY2xzIGluIHJ1bGVcclxuICAgICAgICAgICAgICAgIHdhbGtEZWNscyhub2RlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFNldHRpbmdzW1wicmVtb3ZlLWNvbW1lbnRzXCJdID09IFwidHJ1ZVwiICYmIG5vZGUudHlwZSA9PSBcImNvbW1lbnRcIikge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIEV4dGVuZHMgdG8gQ1NTXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGtleXMgPSBPYmplY3Qua2V5cyhleHRlbmROb2RlcyksIGtleXNTaXplID0ga2V5cy5sZW5ndGg7IGkgPCBrZXlzU2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgICAgICBpZiAoZXh0ZW5kTm9kZXNba2V5XS5jb3VudCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBydWxlID0gcG9zdGNzcy5wYXJzZShleHRlbmROb2Rlc1trZXldLnNlbGVjdG9yICsgXCJ7XCIgKyBleHRlbmROb2Rlc1trZXldLmRlY2xzICsgXCJ9XCIpO1xyXG4gICAgICAgICAgICAgICAgcnVsZS5zb3VyY2UgPSBleHRlbmROb2Rlc1trZXldLnNvdXJjZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjc3MuaW5zZXJ0QmVmb3JlKGV4dGVuZE5vZGVzW2tleV0ucGFyZW50c1swXSwgcnVsZSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlY2xzID0gcG9zdGNzcy5wYXJzZShleHRlbmROb2Rlc1trZXldLmRlY2xzKTtcclxuICAgICAgICAgICAgICAgIGRlY2xzLnNvdXJjZSA9IGV4dGVuZE5vZGVzW2tleV0uc291cmNlO1xyXG4gICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzWzBdLmluc2VydEFmdGVyKGV4dGVuZE5vZGVzW2tleV0ucHJldiwgZGVjbHMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdW51c2VkIHBhcmVudCBub2Rlcy5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDAsIHBhcmVudHMgPSBleHRlbmROb2Rlc1trZXldLnBhcmVudHMubGVuZ3RoOyBqIDwgcGFyZW50czsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzW2pdLm5vZGVzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzW2pdLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaGFtc3RlcjsiXX0=
