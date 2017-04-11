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

                    var ruler = "position: absolute;left: 0;top: 0;margin: 0;padding: 0;width: 100%;height: 100%;z-index: 9900;" + background;

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhhbXN0ZXIiLCJvcHRpb25zIiwiZ2xvYmFsU2V0dGluZ3MiLCJnbG9iYWxLZXlzIiwiaGVscGVycyIsInJlYWRGaWxlU3luYyIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJjdXJyZW50U2V0dGluZ3MiLCJjdXJyZW50U2V0dGluZ3NSZWdleHAiLCJjdXJyZW50Rm9udFNpemVzIiwiZm9udFNpemVzQ29sbGVjdGlvbiIsInJoeXRobUNhbGN1bGF0b3IiLCJmb250U2l6ZVJlZ2V4cCIsIlJlZ0V4cCIsInJoeXRobVJlZ2V4cCIsImV4dGVuZCIsIm9iamVjdDEiLCJvYmplY3QyIiwiaSIsImtleXMiLCJPYmplY3QiLCJrZXlzU2l6ZSIsImxlbmd0aCIsImtleSIsInRvQ2FtZWxDYXNlIiwidmFsdWUiLCJ0b0xvd2VyQ2FzZSIsInJlcGxhY2UiLCJtYXRjaCIsImxldHRlciIsInRvVXBwZXJDYXNlIiwiaW5pdFNldHRpbmdzIiwiYWRkRm9udFNpemVzIiwiam9pbiIsIndhbGtEZWNscyIsIm5vZGUiLCJmb3VuZCIsImRlY2wiLCJ2YXJpYWJsZSIsInNwbGl0IiwiZm9udFNpemUiLCJzaXplVW5pdCIsInNpemUiLCJnZXRTaXplIiwicmVsIiwicHgiLCJjZnNpemUiLCJwcm9wIiwibGluZXMiLCJiYXNlRm9udFNpemUiLCJmb250U2l6ZVVuaXQiLCJjb252ZXJ0IiwibGluZUhlaWdodCIsImxpbmVIZWlnaHREZWNsIiwic291cmNlIiwicGFyZW50IiwiaW5zZXJ0QWZ0ZXIiLCJwcm9wZXJ0eSIsInBhcmFtZXRlcnMiLCJvdXRwdXRWYWx1ZSIsInBhcmFtZXRlcnNTaXplIiwiZnNkZWNsIiwibGVhZGluZyIsImluVmFsdWUiLCJvdXRwdXRVbml0Iiwicmh5dGhtIiwiaW5zZXJ0QmVmb3JlIiwiY2xvbmUiLCJyZW1GYWxsYmFjayIsImNzcyIsImV4dGVuZE5vZGVzIiwid2FsayIsInR5cGUiLCJydWxlIiwibmFtZSIsInBhcmFtcyIsInJlbW92ZSIsInBhcnNlSW50IiwiYnJvd3NlckZvbnRTaXplIiwiZm9udFNpemVEZWNsIiwicmVsYXRpdmVTaXplIiwiaHRtbFJ1bGUiLCJzZWxlY3RvciIsImFwcGVuZCIsImFzdGVyaXNrSHRtbFJ1bGUiLCJydWxlckljb25Qb3NpdGlvbiIsInN2ZyIsImd0aGlja25lc3MiLCJwYXJzZUZsb2F0IiwiYmFja2dyb3VuZCIsImltYWdlSGVpZ2h0IiwidG9GaXhlZCIsInBhdHRlcm4iLCJpbWFnZSIsInJ1bGVyTWF0cml4IiwiZ2V0RmlsZSIsImdldEJhc2U2NCIsInJ1bGVyIiwiaWNvblNpemUiLCJzdHlsZSIsInJ1bGVyQ2xhc3MiLCJjb2xvciIsImhvdmVyQ29sb3IiLCJydWxlclJ1bGUiLCJwYXJzZSIsImVzY2FwZSIsImRlY2xzIiwiaWRlY2xzIiwiZXh0ZW5kTmFtZSIsInBhcmVudHMiLCJwcmV2IiwiY291bnQiLCJwdXNoIiwicnVsZXMiLCJjaGlsZCIsImoiLCJub2RlcyJdLCJtYXBwaW5ncyI6Ijs7OztBQVlBOzs7O0FBRUE7O0FBTUE7Ozs7QUFHQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQTFCQTs7Ozs7Ozs7Ozs7O0FBNEJBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxHQUFvQjtBQUFBLFFBQW5CQyxPQUFtQix1RUFBVCxJQUFTOzs7QUFFaEM7QUFDQSxRQUFJQyxpQkFBaUI7O0FBRWpCLHFCQUFhLE1BRkk7QUFHakIsdUJBQWUsS0FIRTtBQUlqQixnQkFBUSxJQUpTO0FBS2pCLHVCQUFlLE1BTEU7QUFNakIsdUJBQWUsT0FORTtBQU9qQixzQkFBYyxHQVBHOztBQVNqQixzQkFBYyxRQVRHOztBQVdqQiw0QkFBb0IsS0FYSDtBQVlqQiw4QkFBc0IsT0FaTDs7QUFjakIsaUJBQVMsTUFkUTtBQWVqQix1QkFBZSxvQkFmRTtBQWdCakIsK0JBQXVCLHlCQWhCTjtBQWlCakIsNkJBQXFCLGlCQWpCSjtBQWtCakIsMkJBQW1CLE1BbEJGO0FBbUJqQix1QkFBZSx3QkFuQkU7QUFvQmpC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QUFMLEdBQWNnQixZQUFZL0MsR0FBWixFQUFpQitCLE1BQS9COztBQUVBZSxvQkFBSUgsWUFBSixDQUFpQkksWUFBWS9DLEdBQVosRUFBaUJzRixPQUFqQixDQUF5QixDQUF6QixDQUFqQixFQUE4Q3BDLElBQTlDO0FBRUgsYUFORCxNQU1PO0FBQ0gsb0JBQUlpQyxRQUFRLGtCQUFRRixLQUFSLENBQWNsQyxZQUFZL0MsR0FBWixFQUFpQm1GLEtBQS9CLENBQVo7QUFDQUEsc0JBQU1wRCxNQUFOLEdBQWVnQixZQUFZL0MsR0FBWixFQUFpQitCLE1BQWhDO0FBQ0FnQiw0QkFBWS9DLEdBQVosRUFBaUJzRixPQUFqQixDQUF5QixDQUF6QixFQUE0QnJELFdBQTVCLENBQXdDYyxZQUFZL0MsR0FBWixFQUFpQnVGLElBQXpELEVBQStESixLQUEvRDtBQUNIOztBQUVEO0FBQ0EsaUJBQUssSUFBSVMsSUFBSSxDQUFSLEVBQVdOLFVBQVV2QyxZQUFZL0MsR0FBWixFQUFpQnNGLE9BQWpCLENBQXlCdkYsTUFBbkQsRUFBMkQ2RixJQUFJTixPQUEvRCxFQUF3RU0sR0FBeEUsRUFBNkU7QUFDekUsb0JBQUk3QyxZQUFZL0MsR0FBWixFQUFpQnNGLE9BQWpCLENBQXlCTSxDQUF6QixFQUE0QkMsS0FBNUIsQ0FBa0M5RixNQUFsQyxJQUE0QyxDQUFoRCxFQUFtRDtBQUMvQ2dELGdDQUFZL0MsR0FBWixFQUFpQnNGLE9BQWpCLENBQXlCTSxDQUF6QixFQUE0QnZDLE1BQTVCO0FBQ0g7QUFDSjtBQUVKO0FBRUosS0FuV0Q7QUFvV0gsQ0F6bEJEO0FBUEE7O2tCQWttQmU3RSxPIiwiZmlsZSI6IkhhbXN0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG1vZHVsZSBIYW1zdGVyXHJcbiAqIFxyXG4gKiBAZGVzY3JpcHRpb24gUG9zdENTUyBIYW1zdGVyIGZyYW1ld29yayBtYWluIGZ1bmN0aW9uYWxpdHkuXHJcbiAqXHJcbiAqIEB2ZXJzaW9uIDEuMFxyXG4gKiBAYXV0aG9yIEdyaWdvcnkgVmFzaWx5ZXYgPHBvc3Rjc3MuaGFtc3RlckBnbWFpbC5jb20+IGh0dHBzOi8vZ2l0aHViLmNvbS9oMHRjMGQzXHJcbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE3LCBHcmlnb3J5IFZhc2lseWV2XHJcbiAqIEBsaWNlbnNlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCwgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wIFxyXG4gKiBcclxuICovXHJcblxyXG5pbXBvcnQgRm9udFNpemVzIGZyb20gXCIuL0ZvbnRTaXplc1wiO1xyXG5cclxuaW1wb3J0IHtcclxuICAgIGZvcm1hdEludCxcclxuICAgIGZvcm1hdFZhbHVlLFxyXG4gICAgVmVydGljYWxSaHl0aG1cclxufSBmcm9tIFwiLi9WZXJ0aWNhbFJoeXRobVwiO1xyXG5cclxuaW1wb3J0IFBuZ0ltYWdlIGZyb20gXCIuL1BuZ0ltYWdlXCI7XHJcbi8vIGltcG9ydCBWaXJ0dWFsTWFjaGluZSBmcm9tIFwiLi9WaXJ0dWFsTWFjaGluZVwiO1xyXG5cclxuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5cclxuaW1wb3J0IHBvc3Rjc3MgZnJvbSBcInBvc3Rjc3NcIjtcclxuXHJcbmNvbnN0IGhhbXN0ZXIgPSAob3B0aW9ucyA9IG51bGwpID0+IHtcclxuXHJcbiAgICAvL0RlZmF1bHQgR2xvYmFsIFNldHRpbmdzXHJcbiAgICBsZXQgZ2xvYmFsU2V0dGluZ3MgPSB7XHJcblxyXG4gICAgICAgIFwiZm9udC1zaXplXCI6IFwiMTZweFwiLFxyXG4gICAgICAgIFwibGluZS1oZWlnaHRcIjogXCIxLjVcIixcclxuICAgICAgICBcInVuaXRcIjogXCJlbVwiLFxyXG4gICAgICAgIFwicHgtZmFsbGJhY2tcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgXCJweC1iYXNlbGluZVwiOiBcImZhbHNlXCIsXHJcbiAgICAgICAgXCJmb250LXJhdGlvXCI6IFwiMFwiLFxyXG5cclxuICAgICAgICBcInByb3BlcnRpZXNcIjogXCJpbmxpbmVcIixcclxuXHJcbiAgICAgICAgXCJtaW4tbGluZS1wYWRkaW5nXCI6IFwiMnB4XCIsXHJcbiAgICAgICAgXCJyb3VuZC10by1oYWxmLWxpbmVcIjogXCJmYWxzZVwiLFxyXG5cclxuICAgICAgICBcInJ1bGVyXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgIFwicnVsZXItc3R5bGVcIjogXCJhbHdheXMgcnVsZXItZGVidWdcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tcG9zaXRpb25cIjogXCJ0b3A6IDEuNWVtO2xlZnQ6IDEuNWVtO1wiLFxyXG4gICAgICAgIFwicnVsZXItaWNvbi1jb2xvcnNcIjogXCIjY2NjY2NjICM0NDU3NmFcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tc2l6ZVwiOiBcIjI0cHhcIixcclxuICAgICAgICBcInJ1bGVyLWNvbG9yXCI6IFwicmdiYSgxOSwgMTM0LCAxOTEsIC44KVwiLFxyXG4gICAgICAgIFwicnVsZXItdGhpY2tuZXNzXCI6IFwiMVwiLFxyXG4gICAgICAgIFwicnVsZXItYmFja2dyb3VuZFwiOiBcImdyYWRpZW50XCIsXHJcbiAgICAgICAgXCJydWxlci1vdXRwdXRcIjogXCJiYXNlNjRcIixcclxuICAgICAgICBcInJ1bGVyLXBhdHRlcm5cIjogXCIxIDAgMCAwXCIsXHJcbiAgICAgICAgXCJydWxlci1zY2FsZVwiOiBcIjFcIixcclxuXHJcbiAgICAgICAgXCJicm93c2VyLWZvbnQtc2l6ZVwiOiBcIjE2cHhcIixcclxuICAgICAgICBcImxlZ2FjeS1icm93c2Vyc1wiOiBcInRydWVcIixcclxuICAgICAgICBcInJlbW92ZS1jb21tZW50c1wiOiBcImZhbHNlXCJcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBnbG9iYWxLZXlzID0gW1widW5pdFwiLFxyXG4gICAgICAgIFwicHgtZmFsbGJhY2tcIixcclxuICAgICAgICBcInB4LWJhc2VsaW5lXCIsXHJcbiAgICAgICAgXCJmb250LXJhdGlvXCIsXHJcbiAgICAgICAgXCJwcm9wZXJ0aWVzXCIsXHJcbiAgICAgICAgXCJyb3VuZC10by1oYWxmLWxpbmVcIixcclxuICAgICAgICBcInJ1bGVyXCIsXHJcbiAgICAgICAgXCJydWxlci1zdHlsZVwiLFxyXG4gICAgICAgIFwicnVsZXItYmFja2dyb3VuZFwiLFxyXG4gICAgICAgIFwicnVsZXItb3V0cHV0XCIsXHJcbiAgICAgICAgXCJsZWdhY3ktYnJvd3NlcnNcIixcclxuICAgICAgICBcInJlbW92ZS1jb21tZW50c1wiXHJcbiAgICBdO1xyXG5cclxuICAgIGxldCBoZWxwZXJzID0ge1xyXG5cclxuICAgICAgICBcInJlc2V0XCI6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2hlbHBlcnMvcmVzZXQuY3NzXCIpLCBcInV0ZjhcIiksXHJcblxyXG4gICAgICAgIFwibm9ybWFsaXplXCI6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2hlbHBlcnMvbm9ybWFsaXplLmNzc1wiKSwgXCJ1dGY4XCIpLFxyXG5cclxuICAgICAgICBcIm5vd3JhcFwiOiBcIndoaXRlLXNwYWNlOiBub3dyYXA7XCIsXHJcblxyXG4gICAgICAgIFwiZm9yY2V3cmFwXCI6IFwid2hpdGUtc3BhY2U6IHByZTtcIiArXHJcbiAgICAgICAgICAgIFwid2hpdGUtc3BhY2U6IHByZS1saW5lO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XCIgK1xyXG4gICAgICAgICAgICBcIndvcmQtd3JhcDogYnJlYWstd29yZDtcIixcclxuXHJcbiAgICAgICAgXCJlbGxpcHNpc1wiOiBcIm92ZXJmbG93OiBoaWRkZW47XCIgK1xyXG4gICAgICAgICAgICBcInRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1wiLFxyXG5cclxuICAgICAgICBcImh5cGhlbnNcIjogXCJ3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XCIgK1xyXG4gICAgICAgICAgICBcImh5cGhlbnM6IGF1dG87XCIsXHJcblxyXG4gICAgICAgIFwiYnJlYWstd29yZFwiOlxyXG4gICAgICAgICAgICAvKiBOb24gc3RhbmRhcmQgZm9yIHdlYmtpdCAqL1xyXG4gICAgICAgICAgICBcIndvcmQtYnJlYWs6IGJyZWFrLXdvcmQ7XCIgK1xyXG4gICAgICAgICAgICAvKiBXYXJuaW5nOiBOZWVkZWQgZm9yIG9sZElFIHN1cHBvcnQsIGJ1dCB3b3JkcyBhcmUgYnJva2VuIHVwIGxldHRlci1ieS1sZXR0ZXIgKi9cclxuICAgICAgICAgICAgXCJ3b3JkLWJyZWFrOiBicmVhay1hbGw7XCJcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEN1cnJlbnQgVmFyaWFibGVzXHJcbiAgICBsZXQgY3VycmVudFNldHRpbmdzID0ge307XHJcbiAgICBsZXQgY3VycmVudFNldHRpbmdzUmVnZXhwO1xyXG4gICAgLy9DdXJyZW50IEZvbnRTaXplc1xyXG4gICAgbGV0IGN1cnJlbnRGb250U2l6ZXMgPSBcIlwiO1xyXG4gICAgLy8gZm9udCBTaXplc1xyXG4gICAgbGV0IGZvbnRTaXplc0NvbGxlY3Rpb247XHJcbiAgICAvLyBWZXJ0aWNhbCBSaHl0aG0gQ2FsY3VsYXRvclxyXG4gICAgbGV0IHJoeXRobUNhbGN1bGF0b3I7XHJcbiAgICAvLyBMYXN0IENzcyBGaWxlXHJcbiAgICAvLyBsZXQgbGFzdEZpbGU7XHJcblxyXG4gICAgLy8gbGV0IHZtID0gbmV3IFZpcnR1YWxNYWNoaW5lKCk7XHJcbiAgICAvLyBmb250U2l6ZSBwcm9wZXJ0eSBSZWdleHBcclxuICAgIGNvbnN0IGZvbnRTaXplUmVnZXhwID0gbmV3IFJlZ0V4cChcImZvbnRTaXplXFxcXHMrKFtcXFxcLVxcXFwkXFxcXEAwLTlhLXpBLVpdKylcIiwgXCJpXCIpO1xyXG5cclxuICAgIC8vIHJoeXRobSBwcm9wZXJ0aWVzIFJlZ2V4cFxyXG4gICAgY29uc3Qgcmh5dGhtUmVnZXhwID0gbmV3IFJlZ0V4cChcIihsaW5lSGVpZ2h0fHNwYWNpbmd8bGVhZGluZ3xcXCFyaHl0aG18cmh5dGhtKVxcXFwoKC4qPylcXFxcKVwiLCBcImlcIik7XHJcblxyXG4gICAgLy8gQ29weSBWYWx1ZXMgZnJvbSBvYmplY3QgMiB0byBvYmplY3QgMTtcclxuICAgIGNvbnN0IGV4dGVuZCA9IChvYmplY3QxLCBvYmplY3QyKSA9PiB7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0MiksIGtleXNTaXplID0ga2V5cy5sZW5ndGg7IGkgPCBrZXlzU2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgICAgICBvYmplY3QxW2tleV0gPSBvYmplY3QyW2tleV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvYmplY3QxO1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAob3B0aW9ucyAhPSBudWxsKSB7XHJcbiAgICAgICAgZXh0ZW5kKGdsb2JhbFNldHRpbmdzLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0b0NhbWVsQ2FzZSA9ICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL15bXmEtejAtOV0qKC4qKVteYS16MC05XSokLywgXCIkMVwiKS5yZXBsYWNlKC9bXmEtejAtOV0rKFthLXowLTldKS9nLCAobWF0Y2gsIGxldHRlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbGV0dGVyLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgY29uc3QgaW5pdFNldHRpbmdzID0gKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBBZGQgZm9udFNpemVzXHJcbiAgICAgICAgaWYgKFwiZm9udC1zaXplc1wiIGluIGdsb2JhbFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBnbG9iYWxTZXR0aW5nc1tcImZvbnQtc2l6ZXNcIl07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXCJmb250LXNpemVzXCIgaW4gY3VycmVudFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBjdXJyZW50Rm9udFNpemVzICsgXCIsIFwiICsgY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplc1wiXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRvTG93ZXJDYXNlIEN1cnJlbnQgU2V0dGluZ3NcclxuICAgICAgICBmb3IgKGxldCBpID0gMCwga2V5c1NpemUgPSBnbG9iYWxLZXlzLmxlbmd0aDsgaSA8IGtleXNTaXplOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGdsb2JhbEtleXNbaV07XHJcbiAgICAgICAgICAgIGlmIChrZXkgaW4gY3VycmVudFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3Nba2V5XSA9IGN1cnJlbnRTZXR0aW5nc1trZXldLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvbnRTaXplc0NvbGxlY3Rpb24gPSBuZXcgRm9udFNpemVzKGN1cnJlbnRTZXR0aW5ncyk7XHJcbiAgICAgICAgcmh5dGhtQ2FsY3VsYXRvciA9IG5ldyBWZXJ0aWNhbFJoeXRobShjdXJyZW50U2V0dGluZ3MpO1xyXG4gICAgICAgIGZvbnRTaXplc0NvbGxlY3Rpb24uYWRkRm9udFNpemVzKGN1cnJlbnRGb250U2l6ZXMsIHJoeXRobUNhbGN1bGF0b3IpO1xyXG4gICAgICAgIGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCA9IG5ldyBSZWdFeHAoXCJcXFxcQChcIiArIE9iamVjdC5rZXlzKGN1cnJlbnRTZXR0aW5ncykuam9pbihcInxcIikucmVwbGFjZSgvKFxcLXxcXF8pL2csIFwiXFxcXCQxXCIpICsgXCIpXCIsIFwiaVwiKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHdhbGtEZWNscyA9IChub2RlKSA9PiB7XHJcbiAgICAgICAgbm9kZS53YWxrRGVjbHMoZGVjbCA9PiB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZm91bmQ7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXBsYWNlIFZhcmlhYmxlcyB3aXRoIHZhbHVlc1xyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChjdXJyZW50U2V0dGluZ3NSZWdleHApKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhcmlhYmxlID0gZm91bmRbMV07XHJcbiAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCwgY3VycmVudFNldHRpbmdzW3ZhcmlhYmxlXSk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZXBsYWNlIEZvbnQgU2l6ZVxyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChmb250U2l6ZVJlZ2V4cCkpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IFtmb250U2l6ZSwgc2l6ZVVuaXRdID0gZm91bmRbMV0uc3BsaXQoL1xcJC9pKTtcclxuICAgICAgICAgICAgICAgIHNpemVVbml0ID0gKHNpemVVbml0ICE9IG51bGwpID8gc2l6ZVVuaXQudG9Mb3dlckNhc2UoKSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHNpemUgPSBmb250U2l6ZXNDb2xsZWN0aW9uLmdldFNpemUoZm9udFNpemUpO1xyXG4gICAgICAgICAgICAgICAgLy8gV3JpdGUgZm9udCBzaXplXHJcbiAgICAgICAgICAgICAgICBpZiAoc2l6ZVVuaXQgIT0gbnVsbCAmJiAoc2l6ZVVuaXQgPT0gXCJlbVwiIHx8IHNpemVVbml0ID09IFwicmVtXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGZvcm1hdFZhbHVlKHNpemUucmVsKSArIHNpemVVbml0KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNpemVVbml0ICE9IG51bGwgJiYgc2l6ZVVuaXQgPT0gXCJweFwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGZvcm1hdEludChzaXplLnB4KSArIFwicHhcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNmc2l6ZSA9IChjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdID09IFwicHhcIikgPyBmb3JtYXRJbnQoc2l6ZS5weCkgOiBmb3JtYXRWYWx1ZShzaXplLnJlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGNmc2l6ZSArIGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0pO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkanVzdCBGb250IFNpemVcclxuICAgICAgICAgICAgaWYgKGRlY2wucHJvcCA9PSBcImFkanVzdC1mb250LXNpemVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBbZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemVdID0gZGVjbC52YWx1ZS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplVW5pdCA9IGZvbnRTaXplLm1hdGNoKC8ocHh8ZW18cmVtKSQvaSlbMF0udG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHJoeXRobUNhbGN1bGF0b3IuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCBudWxsLCBiYXNlRm9udFNpemUpICsgY3VycmVudFNldHRpbmdzW1widW5pdFwiXTtcclxuXHJcbiAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZm9udFNpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0RGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBsaW5lSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZGVjbC5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlY2wucHJvcCA9IFwiZm9udC1zaXplXCI7XHJcbiAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC5pbnNlcnRBZnRlcihkZWNsLCBsaW5lSGVpZ2h0RGVjbCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGxpbmVIZWlnaHQsIHNwYWNpbmcsIGxlYWRpbmcsIHJoeXRobSwgIXJoeXRobVxyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChyaHl0aG1SZWdleHApKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBwcm9wZXJ0eSA9IGZvdW5kWzFdLnRvTG93ZXJDYXNlKCk7IC8vIGxpbmVIZWlnaHQsIHNwYWNpbmcsIGxlYWRpbmcsIHJoeXRobSwgIXJoeXRobVxyXG4gICAgICAgICAgICAgICAgbGV0IHBhcmFtZXRlcnMgPSBmb3VuZFsyXS5zcGxpdCgvXFxzKlxcLFxccyovKTtcclxuICAgICAgICAgICAgICAgIGxldCBvdXRwdXRWYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgcGFyYW1ldGVyc1NpemUgPSBwYXJhbWV0ZXJzLmxlbmd0aDsgaSA8IHBhcmFtZXRlcnNTaXplOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFt2YWx1ZSwgZm9udFNpemVdID0gcGFyYW1ldGVyc1tpXS5zcGxpdCgvXFxzKy8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZm9udFNpemUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC53YWxrRGVjbHMoXCJmb250LXNpemVcIiwgZnNkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gZnNkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eSA9PSBcImxpbmVoZWlnaHRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRWYWx1ZSArPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIHZhbHVlKSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkgPT0gXCJzcGFjaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0VmFsdWUgKz0gcmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSwgbnVsbCwgdHJ1ZSkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09IFwibGVhZGluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFZhbHVlICs9IHJoeXRobUNhbGN1bGF0b3IubGVhZGluZyh2YWx1ZSwgZm9udFNpemUpICsgXCIgXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wZXJ0eSA9PSBcIiFyaHl0aG1cIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgW2luVmFsdWUsIG91dHB1dFVuaXRdID0gdmFsdWUuc3BsaXQoL1xcJC8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRWYWx1ZSArPSByaHl0aG1DYWxjdWxhdG9yLnJoeXRobShpblZhbHVlLCBmb250U2l6ZSwgdHJ1ZSwgb3V0cHV0VW5pdCkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09IFwicmh5dGhtXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IFtpblZhbHVlLCBvdXRwdXRVbml0XSA9IHZhbHVlLnNwbGl0KC9cXCQvKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0VmFsdWUgKz0gcmh5dGhtQ2FsY3VsYXRvci5yaHl0aG0oaW5WYWx1ZSwgZm9udFNpemUsIGZhbHNlLCBvdXRwdXRVbml0KSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm91bmRbMF0sIG91dHB1dFZhbHVlLnJlcGxhY2UoL1xccyskLywgXCJcIikpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyByZW0gZmFsbGJhY2tcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInB4LWZhbGxiYWNrXCJdID09IFwidHJ1ZVwiICYmIGRlY2wudmFsdWUubWF0Y2goL1swLTlcXC5dK3JlbS9pKSkge1xyXG4gICAgICAgICAgICAgICAgZGVjbC5wYXJlbnQuaW5zZXJ0QmVmb3JlKGRlY2wsIGRlY2wuY2xvbmUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiByaHl0aG1DYWxjdWxhdG9yLnJlbUZhbGxiYWNrKGRlY2wudmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZGVjbC5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gKGNzcykgPT4ge1xyXG5cclxuICAgICAgICAvLyBFeHRlbmQgTm9kZXNcclxuICAgICAgICBsZXQgZXh0ZW5kTm9kZXMgPSB7fTtcclxuXHJcbiAgICAgICAgY3NzLndhbGsobm9kZSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGlmIChsYXN0RmlsZSAhPSBub2RlLnNvdXJjZS5pbnB1dC5maWxlKSB7XHJcbiAgICAgICAgICAgIC8vIFx0bGFzdEZpbGUgPSBub2RlLnNvdXJjZS5pbnB1dC5maWxlO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICBpZiAobm9kZS50eXBlID09IFwiYXRydWxlXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcnVsZSA9IG5vZGU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGUubmFtZSA9PSBcImhhbXN0ZXJcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocnVsZS5wYXJhbXMgIT0gXCJlbmRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgR2xvYmFsIFZhcmlhYmxlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLndhbGtEZWNscyhkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbFNldHRpbmdzW2RlY2wucHJvcF0gPSBkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgZm9udFNpemVzXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKFwiZm9udC1zaXplc1wiIGluIGdsb2JhbFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBnbG9iYWxTZXR0aW5nc1tcImZvbnQtc2l6ZXNcIl07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IGN1cnJlbnQgdmFyaWFibGVzXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzID0gZXh0ZW5kKHt9LCBnbG9iYWxTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRTZXR0aW5ncygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgUnVsZSBIYW1zdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcIiFoYW1zdGVyXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9jdXJyZW50U2V0dGluZ3MgPSBleHRlbmQoe30sIGdsb2JhbFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS53YWxrRGVjbHMoZGVjbCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTZXR0aW5nc1tkZWNsLnByb3BdID0gZGVjbC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFNldHRpbmdzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUgPT0gXCJiYXNlbGluZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZSA9IHBhcnNlSW50KGN1cnJlbnRTZXR0aW5nc1tcImZvbnQtc2l6ZVwiXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJyb3dzZXJGb250U2l6ZSA9IHBhcnNlSW50KGN1cnJlbnRTZXR0aW5nc1tcImJyb3dzZXItZm9udC1zaXplXCJdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUgKyBcInB4XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBiYXNlbGluZSBmb250IHNpemVcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZm9udFNpemVEZWNsID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInB4LWJhc2VsaW5lXCJdID09IFwidHJ1ZVwiIHx8IChjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdID09IFwicHhcIiAmJiBjdXJyZW50U2V0dGluZ3NbXCJsZWdhY3ktYnJvd3NlcnNcIl0gIT0gXCJ0cnVlXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZURlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJmb250LXNpemVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmb250U2l6ZSArIFwicHhcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVsYXRpdmVTaXplID0gMTAwICogZm9udFNpemUgLyBicm93c2VyRm9udFNpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZURlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJmb250LXNpemVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmb3JtYXRWYWx1ZShyZWxhdGl2ZVNpemUpICsgXCIlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0RGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IFwibGluZS1oZWlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGxpbmVIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlLnBhcmFtcy5tYXRjaCgvXFxzKmh0bWxcXHMqLykpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBodG1sUnVsZSA9IHBvc3Rjc3MucnVsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCJodG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbFJ1bGUuYXBwZW5kKGZvbnRTaXplRGVjbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxSdWxlLmFwcGVuZChsaW5lSGVpZ2h0RGVjbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBodG1sUnVsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1widW5pdFwiXSA9PSBcInB4XCIgJiYgY3VycmVudFNldHRpbmdzW1wibGVnYWN5LWJyb3dzZXJzXCJdID09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXN0ZXJpc2tIdG1sUnVsZSA9IHBvc3Rjc3MucnVsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiKiBodG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Rlcmlza0h0bWxSdWxlLmFwcGVuZChsaW5lSGVpZ2h0RGVjbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBhc3Rlcmlza0h0bWxSdWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgbGluZUhlaWdodERlY2wpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBmb250U2l6ZURlY2wpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0gPT0gXCJyZW1cIiAmJiBjdXJyZW50U2V0dGluZ3NbXCJweC1mYWxsYmFja1wiXSA9PSBcInRydWVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShsaW5lSGVpZ2h0RGVjbCwgcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJoeXRobUNhbGN1bGF0b3IucmVtRmFsbGJhY2sobGluZUhlaWdodCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcInJ1bGVyXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVySWNvblBvc2l0aW9uID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItaWNvbi1wb3NpdGlvblwiXS5yZXBsYWNlKC8oXFwnfFxcXCIpL2csIFwiXCIpLnJlcGxhY2UoL1xcOy9nLCBcIjtcXG5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0ID0gKGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdLm1hdGNoKC9weCQvaSkpID8gY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0gOiBjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSArIFwiZW1cIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGY4LCUzQ3N2ZyB4bWxucyUzRCUyN2h0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyNyB2aWV3Qm94JTNEJTI3MCAwIDI0IDI0JTI3JTNFJTNDcGF0aCBmaWxsJTNEJTI3e2NvbG9yfSUyNyBkJTNEJTI3TTE4IDI0Yy0wLjMgMC0wLjU0OC0wLjI0Ni0wLjU0OC0wLjU0NlYxOGMwLTAuMyAwLjI0OC0wLjU0NiAwLjU0OC0wLjU0Nmg1LjQ1MiAgQzIzLjc1NCAxNy40NTQgMjQgMTcuNyAyNCAxOHY1LjQ1NGMwIDAuMy0wLjI0NiAwLjU0Ni0wLjU0OCAwLjU0NkgxOHogTTkuMjcxIDI0Yy0wLjI5OCAwLTAuNTQzLTAuMjQ2LTAuNTQzLTAuNTQ2VjE4ICBjMC0wLjMgMC4yNDUtMC41NDYgMC41NDMtMC41NDZoNS40NTdjMC4zIDAgMC41NDMgMC4yNDYgMC41NDMgMC41NDZ2NS40NTRjMCAwLjMtMC4yNDMgMC41NDYtMC41NDMgMC41NDZIOS4yNzF6IE0wLjU0OCAyNCAgQzAuMjQ2IDI0IDAgMjMuNzU0IDAgMjMuNDU0VjE4YzAtMC4zIDAuMjQ2LTAuNTQ2IDAuNTQ4LTAuNTQ2SDZjMC4zMDIgMCAwLjU0OCAwLjI0NiAwLjU0OCAwLjU0NnY1LjQ1NEM2LjU0OCAyMy43NTQgNi4zMDIgMjQgNiAyNCAgSDAuNTQ4eiBNMTggMTUuMjcxYy0wLjMgMC0wLjU0OC0wLjI0NC0wLjU0OC0wLjU0MlY5LjI3MmMwLTAuMjk5IDAuMjQ4LTAuNTQ1IDAuNTQ4LTAuNTQ1aDUuNDUyQzIzLjc1NCA4LjcyNyAyNCA4Ljk3MyAyNCA5LjI3MiAgdjUuNDU3YzAgMC4yOTgtMC4yNDYgMC41NDItMC41NDggMC41NDJIMTh6IE05LjI3MSAxNS4yNzFjLTAuMjk4IDAtMC41NDMtMC4yNDQtMC41NDMtMC41NDJWOS4yNzJjMC0wLjI5OSAwLjI0NS0wLjU0NSAwLjU0My0wLjU0NSAgaDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ2IDAuNTQzIDAuNTQ1djUuNDU3YzAgMC4yOTgtMC4yNDMgMC41NDItMC41NDMgMC41NDJIOS4yNzF6IE0wLjU0OCAxNS4yNzFDMC4yNDYgMTUuMjcxIDAgMTUuMDI2IDAgMTQuNzI5ICBWOS4yNzJjMC0wLjI5OSAwLjI0Ni0wLjU0NSAwLjU0OC0wLjU0NUg2YzAuMzAyIDAgMC41NDggMC4yNDYgMC41NDggMC41NDV2NS40NTdjMCAwLjI5OC0wLjI0NiAwLjU0Mi0wLjU0OCAwLjU0MkgwLjU0OHogTTE4IDYuNTQ1ICBjLTAuMyAwLTAuNTQ4LTAuMjQ1LTAuNTQ4LTAuNTQ1VjAuNTQ1QzE3LjQ1MiAwLjI0NSAxNy43IDAgMTggMGg1LjQ1MkMyMy43NTQgMCAyNCAwLjI0NSAyNCAwLjU0NVY2YzAgMC4zLTAuMjQ2IDAuNTQ1LTAuNTQ4IDAuNTQ1ICBIMTh6IE05LjI3MSA2LjU0NUM4Ljk3NCA2LjU0NSA4LjcyOSA2LjMgOC43MjkgNlYwLjU0NUM4LjcyOSAwLjI0NSA4Ljk3NCAwIDkuMjcxIDBoNS40NTdjMC4zIDAgMC41NDMgMC4yNDUgMC41NDMgMC41NDVWNiAgYzAgMC4zLTAuMjQzIDAuNTQ1LTAuNTQzIDAuNTQ1SDkuMjcxeiBNMC41NDggNi41NDVDMC4yNDYgNi41NDUgMCA2LjMgMCA2VjAuNTQ1QzAgMC4yNDUgMC4yNDYgMCAwLjU0OCAwSDYgIGMwLjMwMiAwIDAuNTQ4IDAuMjQ1IDAuNTQ4IDAuNTQ1VjZjMCAwLjMtMC4yNDYgMC41NDUtMC41NDggMC41NDVIMC41NDh6JTI3JTJGJTNFJTNDJTJGc3ZnJTNFXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAyNCAyNCUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00wLDZjMCwwLjMwMSwwLjI0NiwwLjU0NSwwLjU0OSwwLjU0NWgyMi45MDZDMjMuNzU2LDYuNTQ1LDI0LDYuMzAxLDI0LDZWMi43M2MwLTAuMzA1LTAuMjQ0LTAuNTQ5LTAuNTQ1LTAuNTQ5SDAuNTQ5ICBDMC4yNDYsMi4xODIsMCwyLjQyNiwwLDIuNzNWNnogTTAsMTMuNjM3YzAsMC4yOTcsMC4yNDYsMC41NDUsMC41NDksMC41NDVoMjIuOTA2YzAuMzAxLDAsMC41NDUtMC4yNDgsMC41NDUtMC41NDV2LTMuMjczICBjMC0wLjI5Ny0wLjI0NC0wLjU0NS0wLjU0NS0wLjU0NUgwLjU0OUMwLjI0Niw5LjgxOCwwLDEwLjA2NiwwLDEwLjM2M1YxMy42Mzd6IE0wLDIxLjI3YzAsMC4zMDUsMC4yNDYsMC41NDksMC41NDksMC41NDloMjIuOTA2ICBjMC4zMDEsMCwwLjU0NS0wLjI0NCwwLjU0NS0wLjU0OVYxOGMwLTAuMzAxLTAuMjQ0LTAuNTQ1LTAuNTQ1LTAuNTQ1SDAuNTQ5QzAuMjQ2LDE3LjQ1NSwwLDE3LjY5OSwwLDE4VjIxLjI3eiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAzMiAzMiUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00yOCwyMGgtNHYtOGg0YzEuMTA0LDAsMi0wLjg5NiwyLTJzLTAuODk2LTItMi0yaC00VjRjMC0xLjEwNC0wLjg5Ni0yLTItMnMtMiwwLjg5Ni0yLDJ2NGgtOFY0YzAtMS4xMDQtMC44OTYtMi0yLTIgIFM4LDIuODk2LDgsNHY0SDRjLTEuMTA0LDAtMiwwLjg5Ni0yLDJzMC44OTYsMiwyLDJoNHY4SDRjLTEuMTA0LDAtMiwwLjg5Ni0yLDJzMC44OTYsMiwyLDJoNHY0YzAsMS4xMDQsMC44OTYsMiwyLDJzMi0wLjg5NiwyLTJ2LTQgIGg4djRjMCwxLjEwNCwwLjg5NiwyLDIsMnMyLTAuODk2LDItMnYtNGg0YzEuMTA0LDAsMi0wLjg5NiwyLTJTMjkuMTA0LDIwLDI4LDIweiBNMTIsMjB2LThoOHY4SDEyeiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBndGhpY2tuZXNzID0gcGFyc2VGbG9hdChjdXJyZW50U2V0dGluZ3NbXCJydWxlci10aGlja25lc3NcIl0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgYmFja2dyb3VuZCA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJydWxlci1iYWNrZ3JvdW5kXCJdID09IFwicG5nXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZUhlaWdodCA9IChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXS5tYXRjaCgvcHgkLykpID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAocGFyc2VGbG9hdChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSkgKiBwYXJzZUZsb2F0KGN1cnJlbnRTZXR0aW5nc1tcImZvbnQtc2l6ZVwiXSkpLnRvRml4ZWQoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXR0ZXJuID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItcGF0dGVyblwiXS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2UgPSBuZXcgUG5nSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UucnVsZXJNYXRyaXgoaW1hZ2VIZWlnaHQsIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWNvbG9yXCJdLCBwYXR0ZXJuLCBndGhpY2tuZXNzLCBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1zY2FsZVwiXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJydWxlci1vdXRwdXRcIl0gIT0gXCJiYXNlNjRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuZ2V0RmlsZShjdXJyZW50U2V0dGluZ3NbXCJydWxlci1vdXRwdXRcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCIuLi9cIiArIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLW91dHB1dFwiXSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1wb3NpdGlvbjogbGVmdCB0b3A7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1yZXBlYXQ6IHJlcGVhdDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXNpemU6IFwiICsgcGF0dGVybi5sZW5ndGggKyBcInB4IFwiICsgaW1hZ2VIZWlnaHQgKyBcInB4O1wiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LFwiICsgaW1hZ2UuZ2V0QmFzZTY0KCkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcG9zaXRpb246IGxlZnQgdG9wO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcmVwZWF0OiByZXBlYXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1zaXplOiBcIiArIHBhdHRlcm4ubGVuZ3RoICsgXCJweCBcIiArIGltYWdlSGVpZ2h0ICsgXCJweDtcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGd0aGlja25lc3MgPSBndGhpY2tuZXNzICogMztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcImJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byB0b3AsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWNvbG9yXCJdICsgXCIgXCIgKyBndGhpY2tuZXNzICsgXCIlLCB0cmFuc3BhcmVudCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBndGhpY2tuZXNzICsgXCIlKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtc2l6ZTogMTAwJSBcIiArIGxpbmVIZWlnaHQgKyBcIjtcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBydWxlciA9IFwicG9zaXRpb246IGFic29sdXRlO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJsZWZ0OiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b3A6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1hcmdpbjogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGg6IDEwMCU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodDogMTAwJTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiei1pbmRleDogOTkwMDtcIiArIGJhY2tncm91bmQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpY29uU2l6ZSA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWljb24tc2l6ZVwiXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFtzdHlsZSwgcnVsZXJDbGFzc10gPSBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1zdHlsZVwiXS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBbY29sb3IsIGhvdmVyQ29sb3JdID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItaWNvbi1jb2xvcnNcIl0uc3BsaXQoL1xccysvKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVyUnVsZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHlsZSA9PSBcInN3aXRjaFwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTogbm9uZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlciArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6bm9uZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdICsgbGFiZWwge1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiei1pbmRleDogOTk5OTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6IGlubGluZS1ibG9jaztcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArIHJ1bGVySWNvblBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoOiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHQ6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnNvcjogcG9pbnRlcjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnJlcGxhY2UoL1xce2NvbG9yXFx9LywgZXNjYXBlKGNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl06Y2hlY2tlZCArIGxhYmVsLCBpbnB1dFtpZD1cXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJDbGFzcyArIFwiXFxcIl06aG92ZXIgKyBsYWJlbCB7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIlwiICsgc3ZnLnJlcGxhY2UoL1xce2NvbG9yXFx9LywgZXNjYXBlKGhvdmVyQ29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJDbGFzcyArIFwiXFxcIl06Y2hlY2tlZCB+IC5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6IGJsb2NrO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdHlsZSA9PSBcImhvdmVyXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCIuXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbjogYWJzb2x1dGU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJJY29uUG9zaXRpb24gK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYWRkaW5nOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGg6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJcIiArIHN2Zy5yZXBsYWNlKC9cXHtjb2xvclxcfS8sIGVzY2FwZShjb2xvcikpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRyYW5zaXRpb246IGJhY2tncm91bmQtaW1hZ2UgMC41cyBlYXNlLWluLW91dDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIjpob3ZlclwiICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjdXJzb3I6IHBvaW50ZXI7XCIgKyBydWxlciArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3R5bGUgPT0gXCJhbHdheXNcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJSdWxlID0gcG9zdGNzcy5wYXJzZShcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcXG5cIiArIHJ1bGVyICsgXCJ9XFxuXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlclJ1bGUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUuc291cmNlID0gcnVsZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBydWxlclJ1bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lLm1hdGNoKC9eKGVsbGlwc2lzfG5vd3JhcHxmb3JjZXdyYXB8aHlwaGVuc3xicmVha1xcLXdvcmQpJC9pKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBydWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlY2xzID0gaGVscGVyc1twcm9wZXJ0eV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eSA9PSBcImh5cGhlbnNcIiAmJiBydWxlLnBhcmFtcyA9PSBcInRydWVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNscyA9IGhlbHBlcnNbXCJicmVhay13b3JkXCJdICsgZGVjbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkgPT0gXCJlbGxpcHNpc1wiICYmIHJ1bGUucGFyYW1zID09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xzID0gaGVscGVyc1tcIm5vd3JhcFwiXSArIGRlY2xzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInByb3BlcnRpZXNcIl0gPT0gXCJpbmxpbmVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGlkZWNscyA9IHBvc3Rjc3MucGFyc2UoZGVjbHMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgaWRlY2xzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50U2V0dGluZ3NbXCJwcm9wZXJ0aWVzXCJdID09IFwiZXh0ZW5kXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleHRlbmROYW1lID0gdG9DYW1lbENhc2UocHJvcGVydHkgKyBcIiBcIiArIHJ1bGUucGFyYW1zKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRlbmROb2Rlc1tleHRlbmROYW1lXSA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSBleHRlbmQgaW5mb1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IHJ1bGUucGFyZW50LnNlbGVjdG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xzOiBkZWNscyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRzOiBbcnVsZS5wYXJlbnRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXY6IHJ1bGUucHJldigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQXBwZW5kIHNlbGVjdG9yIGFuZCB1cGRhdGUgY291bnRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0uc2VsZWN0b3IgPSBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5zZWxlY3RvciArIFwiLCBcIiArIHJ1bGUucGFyZW50LnNlbGVjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0ucGFyZW50cy5wdXNoKHJ1bGUucGFyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLmNvdW50Kys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lLm1hdGNoKC9eKHJlc2V0fG5vcm1hbGl6ZSkkL2kpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gcnVsZS5uYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVzID0gcG9zdGNzcy5wYXJzZShoZWxwZXJzW3Byb3BlcnR5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZXMuc291cmNlID0gcnVsZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgcnVsZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBXYWxrIGluIG1lZGlhIHF1ZXJpZXNcclxuICAgICAgICAgICAgICAgIG5vZGUud2FsayhjaGlsZCA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZC50eXBlID09IFwicnVsZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdhbGsgZGVjbHMgaW4gcnVsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YWxrRGVjbHMoY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcImpzXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgbGV0IGpjc3MgPSBydWxlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgLy8gbGV0IGNvZGUgPSBqY3NzLnJlcGxhY2UoL1xcQGpzXFxzKlxceyhbXFxzXFxTXSspXFx9JC9pLCBcIiQxXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhqY3NzKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBydWxlclJ1bGUuc291cmNlID0gcnVsZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgLy8gcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJ1bGUsIHJ1bGVyUnVsZSk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS50eXBlID09IFwicnVsZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gV2FsayBkZWNscyBpbiBydWxlXHJcbiAgICAgICAgICAgICAgICB3YWxrRGVjbHMobm9kZSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInJlbW92ZS1jb21tZW50c1wiXSA9PSBcInRydWVcIiAmJiBub2RlLnR5cGUgPT0gXCJjb21tZW50XCIpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCBFeHRlbmRzIHRvIENTU1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBrZXlzID0gT2JqZWN0LmtleXMoZXh0ZW5kTm9kZXMpLCBrZXlzU2l6ZSA9IGtleXMubGVuZ3RoOyBpIDwga2V5c1NpemU7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQga2V5ID0ga2V5c1tpXTtcclxuICAgICAgICAgICAgaWYgKGV4dGVuZE5vZGVzW2tleV0uY291bnQgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcnVsZSA9IHBvc3Rjc3MucGFyc2UoZXh0ZW5kTm9kZXNba2V5XS5zZWxlY3RvciArIFwie1wiICsgZXh0ZW5kTm9kZXNba2V5XS5kZWNscyArIFwifVwiKTtcclxuICAgICAgICAgICAgICAgIHJ1bGUuc291cmNlID0gZXh0ZW5kTm9kZXNba2V5XS5zb3VyY2U7XHJcblxyXG4gICAgICAgICAgICAgICAgY3NzLmluc2VydEJlZm9yZShleHRlbmROb2Rlc1trZXldLnBhcmVudHNbMF0sIHJ1bGUpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZWNscyA9IHBvc3Rjc3MucGFyc2UoZXh0ZW5kTm9kZXNba2V5XS5kZWNscyk7XHJcbiAgICAgICAgICAgICAgICBkZWNscy5zb3VyY2UgPSBleHRlbmROb2Rlc1trZXldLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2tleV0ucGFyZW50c1swXS5pbnNlcnRBZnRlcihleHRlbmROb2Rlc1trZXldLnByZXYsIGRlY2xzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIHVudXNlZCBwYXJlbnQgbm9kZXMuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwLCBwYXJlbnRzID0gZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzLmxlbmd0aDsgaiA8IHBhcmVudHM7IGorKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGV4dGVuZE5vZGVzW2tleV0ucGFyZW50c1tqXS5ub2Rlcy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2tleV0ucGFyZW50c1tqXS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGhhbXN0ZXI7Il19
