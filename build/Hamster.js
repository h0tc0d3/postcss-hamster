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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhhbXN0ZXIiLCJvcHRpb25zIiwiZ2xvYmFsU2V0dGluZ3MiLCJnbG9iYWxLZXlzIiwiaGVscGVycyIsInJlYWRGaWxlU3luYyIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJjdXJyZW50U2V0dGluZ3MiLCJjdXJyZW50U2V0dGluZ3NSZWdleHAiLCJjdXJyZW50Rm9udFNpemVzIiwiZm9udFNpemVzQ29sbGVjdGlvbiIsInJoeXRobUNhbGN1bGF0b3IiLCJmb250U2l6ZVJlZ2V4cCIsIlJlZ0V4cCIsImxpbmVSZWdleHAiLCJleHRlbmQiLCJvYmplY3QxIiwib2JqZWN0MiIsImkiLCJrZXlzIiwiT2JqZWN0Iiwia2V5c1NpemUiLCJsZW5ndGgiLCJrZXkiLCJ0b0NhbWVsQ2FzZSIsInZhbHVlIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwibWF0Y2giLCJsZXR0ZXIiLCJ0b1VwcGVyQ2FzZSIsImluaXRTZXR0aW5ncyIsImFkZEZvbnRTaXplcyIsImpvaW4iLCJ3YWxrRGVjbHMiLCJub2RlIiwiZm91bmQiLCJkZWNsIiwidmFyaWFibGUiLCJzcGxpdCIsImZvbnRTaXplIiwic2l6ZVVuaXQiLCJzaXplIiwiZ2V0U2l6ZSIsInJlbCIsInB4IiwiY2ZzaXplIiwicHJvcCIsImxpbmVzIiwiYmFzZUZvbnRTaXplIiwiZm9udFNpemVVbml0IiwiY29udmVydCIsImxpbmVIZWlnaHQiLCJsaW5lSGVpZ2h0RGVjbCIsInNvdXJjZSIsInBhcmVudCIsImluc2VydEFmdGVyIiwicHJvcGVydHkiLCJwYXJhbWV0ZXJzIiwicGFyYW1ldGVyc1NpemUiLCJmc2RlY2wiLCJsZWFkaW5nIiwiaW5zZXJ0QmVmb3JlIiwiY2xvbmUiLCJyZW1GYWxsYmFjayIsImNzcyIsImV4dGVuZE5vZGVzIiwid2FsayIsInR5cGUiLCJydWxlIiwibmFtZSIsInBhcmFtcyIsInJlbW92ZSIsInBhcnNlSW50IiwiYnJvd3NlckZvbnRTaXplIiwiZm9udFNpemVEZWNsIiwicmVsYXRpdmVTaXplIiwiaHRtbFJ1bGUiLCJzZWxlY3RvciIsImFwcGVuZCIsImFzdGVyaXNrSHRtbFJ1bGUiLCJydWxlckljb25Qb3NpdGlvbiIsInN2ZyIsImd0aGlja25lc3MiLCJwYXJzZUZsb2F0IiwiYmFja2dyb3VuZCIsImltYWdlSGVpZ2h0IiwidG9GaXhlZCIsInBhdHRlcm4iLCJpbWFnZSIsInJ1bGVyTWF0cml4IiwiZ2V0RmlsZSIsImdldEJhc2U2NCIsInJ1bGVyIiwiaWNvblNpemUiLCJzdHlsZSIsInJ1bGVyQ2xhc3MiLCJjb2xvciIsImhvdmVyQ29sb3IiLCJydWxlclJ1bGUiLCJwYXJzZSIsImVzY2FwZSIsImRlY2xzIiwiaWRlY2xzIiwiZXh0ZW5kTmFtZSIsInBhcmVudHMiLCJwcmV2IiwiY291bnQiLCJwdXNoIiwicnVsZXMiLCJjaGlsZCIsImoiLCJub2RlcyJdLCJtYXBwaW5ncyI6Ijs7OztBQVlBOzs7O0FBRUE7O0FBTUE7Ozs7QUFHQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQTFCQTs7Ozs7Ozs7Ozs7O0FBNEJBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxHQUFvQjtBQUFBLFFBQW5CQyxPQUFtQix1RUFBVCxJQUFTOzs7QUFFaEM7QUFDQSxRQUFJQyxpQkFBaUI7O0FBRWpCLHFCQUFhLE1BRkk7QUFHakIsdUJBQWUsS0FIRTtBQUlqQixnQkFBUSxJQUpTO0FBS2pCLHVCQUFlLE1BTEU7QUFNakIsdUJBQWUsT0FORTtBQU9qQixzQkFBYyxHQVBHOztBQVNqQixzQkFBYyxRQVRHOztBQVdqQiw0QkFBb0IsS0FYSDtBQVlqQiw4QkFBc0IsT0FaTDs7QUFjakIsaUJBQVMsTUFkUTtBQWVqQix1QkFBZSxvQkFmRTtBQWdCakIsK0JBQXVCLHlCQWhCTjtBQWlCakIsNkJBQXFCLGlCQWpCSjtBQWtCakIsMkJBQW1CLE1BbEJGO0FBbUJqQix1QkFBZSx3QkFuQkU7QUFvQmpCLDJCQUFtQixHQXBCRjtBQXFCakIsNEJBQW9CLFVBckJIO0FBc0JqQix3QkFBZ0Is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eUYsSUFBSU4sT0FBL0QsRUFBd0VNLEdBQXhFLEVBQTZFO0FBQ3pFLG9CQUFJN0MsWUFBWTNDLEdBQVosRUFBaUJrRixPQUFqQixDQUF5Qk0sQ0FBekIsRUFBNEJDLEtBQTVCLENBQWtDMUYsTUFBbEMsSUFBNEMsQ0FBaEQsRUFBbUQ7QUFDL0M0QyxnQ0FBWTNDLEdBQVosRUFBaUJrRixPQUFqQixDQUF5Qk0sQ0FBekIsRUFBNEJ2QyxNQUE1QjtBQUNIO0FBQ0o7QUFFSjtBQUVKLEtBbldEO0FBb1dILENBMWxCRDtBQVBBOztrQkFtbUJlekUsTyIsImZpbGUiOiJIYW1zdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBtb2R1bGUgSGFtc3RlclxyXG4gKiBcclxuICogQGRlc2NyaXB0aW9uIFBvc3RDU1MgSGFtc3RlciBmcmFtZXdvcmsgbWFpbiBmdW5jdGlvbmFsaXR5LlxyXG4gKlxyXG4gKiBAdmVyc2lvbiAxLjBcclxuICogQGF1dGhvciBHcmlnb3J5IFZhc2lseWV2IDxwb3N0Y3NzLmhhbXN0ZXJAZ21haWwuY29tPiBodHRwczovL2dpdGh1Yi5jb20vaDB0YzBkM1xyXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNywgR3JpZ29yeSBWYXNpbHlldlxyXG4gKiBAbGljZW5zZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAsIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMCBcclxuICogXHJcbiAqL1xyXG5cclxuaW1wb3J0IEZvbnRTaXplcyBmcm9tIFwiLi9Gb250U2l6ZXNcIjtcclxuXHJcbmltcG9ydCB7XHJcbiAgICBmb3JtYXRJbnQsXHJcbiAgICBmb3JtYXRWYWx1ZSxcclxuICAgIFZlcnRpY2FsUmh5dGhtXHJcbn0gZnJvbSBcIi4vVmVydGljYWxSaHl0aG1cIjtcclxuXHJcbmltcG9ydCBQbmdJbWFnZSBmcm9tIFwiLi9QbmdJbWFnZVwiO1xyXG4vLyBpbXBvcnQgVmlydHVhbE1hY2hpbmUgZnJvbSBcIi4vVmlydHVhbE1hY2hpbmVcIjtcclxuXHJcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuXHJcbmltcG9ydCBwb3N0Y3NzIGZyb20gXCJwb3N0Y3NzXCI7XHJcblxyXG5jb25zdCBoYW1zdGVyID0gKG9wdGlvbnMgPSBudWxsKSA9PiB7XHJcblxyXG4gICAgLy9EZWZhdWx0IEdsb2JhbCBTZXR0aW5nc1xyXG4gICAgbGV0IGdsb2JhbFNldHRpbmdzID0ge1xyXG5cclxuICAgICAgICBcImZvbnQtc2l6ZVwiOiBcIjE2cHhcIixcclxuICAgICAgICBcImxpbmUtaGVpZ2h0XCI6IFwiMS41XCIsXHJcbiAgICAgICAgXCJ1bml0XCI6IFwiZW1cIixcclxuICAgICAgICBcInB4LWZhbGxiYWNrXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgIFwicHgtYmFzZWxpbmVcIjogXCJmYWxzZVwiLFxyXG4gICAgICAgIFwiZm9udC1yYXRpb1wiOiBcIjBcIixcclxuXHJcbiAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IFwiaW5saW5lXCIsXHJcblxyXG4gICAgICAgIFwibWluLWxpbmUtcGFkZGluZ1wiOiBcIjJweFwiLFxyXG4gICAgICAgIFwicm91bmQtdG8taGFsZi1saW5lXCI6IFwiZmFsc2VcIixcclxuXHJcbiAgICAgICAgXCJydWxlclwiOiBcInRydWVcIixcclxuICAgICAgICBcInJ1bGVyLXN0eWxlXCI6IFwiYWx3YXlzIHJ1bGVyLWRlYnVnXCIsXHJcbiAgICAgICAgXCJydWxlci1pY29uLXBvc2l0aW9uXCI6IFwidG9wOiAxLjVlbTtsZWZ0OiAxLjVlbTtcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tY29sb3JzXCI6IFwiI2NjY2NjYyAjNDQ1NzZhXCIsXHJcbiAgICAgICAgXCJydWxlci1pY29uLXNpemVcIjogXCIyNHB4XCIsXHJcbiAgICAgICAgXCJydWxlci1jb2xvclwiOiBcInJnYmEoMTksIDEzNCwgMTkxLCAuOClcIixcclxuICAgICAgICBcInJ1bGVyLXRoaWNrbmVzc1wiOiBcIjFcIixcclxuICAgICAgICBcInJ1bGVyLWJhY2tncm91bmRcIjogXCJncmFkaWVudFwiLFxyXG4gICAgICAgIFwicnVsZXItb3V0cHV0XCI6IFwiYmFzZTY0XCIsXHJcbiAgICAgICAgXCJydWxlci1wYXR0ZXJuXCI6IFwiMSAwIDAgMFwiLFxyXG4gICAgICAgIFwicnVsZXItc2NhbGVcIjogXCIxXCIsXHJcblxyXG4gICAgICAgIFwiYnJvd3Nlci1mb250LXNpemVcIjogXCIxNnB4XCIsXHJcbiAgICAgICAgXCJsZWdhY3ktYnJvd3NlcnNcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgXCJyZW1vdmUtY29tbWVudHNcIjogXCJmYWxzZVwiXHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgZ2xvYmFsS2V5cyA9IFtcInVuaXRcIixcclxuICAgICAgICBcInB4LWZhbGxiYWNrXCIsXHJcbiAgICAgICAgXCJweC1iYXNlbGluZVwiLFxyXG4gICAgICAgIFwiZm9udC1yYXRpb1wiLFxyXG4gICAgICAgIFwicHJvcGVydGllc1wiLFxyXG4gICAgICAgIFwicm91bmQtdG8taGFsZi1saW5lXCIsXHJcbiAgICAgICAgXCJydWxlclwiLFxyXG4gICAgICAgIFwicnVsZXItc3R5bGVcIixcclxuICAgICAgICBcInJ1bGVyLWJhY2tncm91bmRcIixcclxuICAgICAgICBcInJ1bGVyLW91dHB1dFwiLFxyXG4gICAgICAgIFwibGVnYWN5LWJyb3dzZXJzXCIsXHJcbiAgICAgICAgXCJyZW1vdmUtY29tbWVudHNcIl07XHJcblxyXG4gICAgbGV0IGhlbHBlcnMgPSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgXCJyZXNldFwiOiBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9oZWxwZXJzL3Jlc2V0LmNzc1wiKSwgXCJ1dGY4XCIpLFxyXG4gICAgICAgIFxyXG4gICAgICAgIFwibm9ybWFsaXplXCI6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2hlbHBlcnMvbm9ybWFsaXplLmNzc1wiKSwgXCJ1dGY4XCIpLFxyXG4gICAgICAgIFxyXG4gICAgICAgIFwibm93cmFwXCI6XHJcbiAgICAgICAgICAgIFwid2hpdGUtc3BhY2U6IG5vd3JhcDtcIixcclxuXHJcbiAgICAgICAgXCJmb3JjZXdyYXBcIjpcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogcHJlO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogcHJlLWxpbmU7XCIgK1xyXG4gICAgICAgICAgICBcIndoaXRlLXNwYWNlOiBwcmUtd3JhcDtcIiArXHJcbiAgICAgICAgICAgIFwid29yZC13cmFwOiBicmVhay13b3JkO1wiLFxyXG4gICAgICAgIFxyXG4gICAgICAgIFwiZWxsaXBzaXNcIjpcclxuICAgICAgICAgICAgXCJvdmVyZmxvdzogaGlkZGVuO1wiICtcclxuICAgICAgICAgICAgXCJ0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcIixcclxuXHJcbiAgICAgICAgXCJoeXBoZW5zXCI6XHJcbiAgICAgICAgICAgIFwid29yZC13cmFwOiBicmVhay13b3JkO1wiICtcclxuICAgICAgICAgICAgXCJoeXBoZW5zOiBhdXRvO1wiLFxyXG5cclxuICAgICAgICBcImJyZWFrLXdvcmRcIjpcclxuICAgICAgICAgICAgLyogTm9uIHN0YW5kYXJkIGZvciB3ZWJraXQgKi9cclxuICAgICAgICAgICAgXCJ3b3JkLWJyZWFrOiBicmVhay13b3JkO1wiICtcclxuICAgICAgICAgICAgLyogV2FybmluZzogTmVlZGVkIGZvciBvbGRJRSBzdXBwb3J0LCBidXQgd29yZHMgYXJlIGJyb2tlbiB1cCBsZXR0ZXItYnktbGV0dGVyICovXHJcbiAgICAgICAgICAgIFwid29yZC1icmVhazogYnJlYWstYWxsO1wiXHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvLyBDdXJyZW50IFZhcmlhYmxlc1xyXG4gICAgbGV0IGN1cnJlbnRTZXR0aW5ncyA9IHt9O1xyXG4gICAgbGV0IGN1cnJlbnRTZXR0aW5nc1JlZ2V4cDtcclxuICAgIC8vQ3VycmVudCBGb250U2l6ZXNcclxuICAgIGxldCBjdXJyZW50Rm9udFNpemVzID0gXCJcIjtcclxuICAgIC8vIGZvbnQgU2l6ZXNcclxuICAgIGxldCBmb250U2l6ZXNDb2xsZWN0aW9uO1xyXG4gICAgLy8gVmVydGljYWwgUmh5dGhtIENhbGN1bGF0b3JcclxuICAgIGxldCByaHl0aG1DYWxjdWxhdG9yO1xyXG4gICAgLy8gTGFzdCBDc3MgRmlsZVxyXG4gICAgLy8gbGV0IGxhc3RGaWxlO1xyXG5cclxuICAgIC8vIGxldCB2bSA9IG5ldyBWaXJ0dWFsTWFjaGluZSgpO1xyXG4gICAgLy8gZm9udFNpemUgcHJvcGVydHkgUmVnZXhwXHJcbiAgICBjb25zdCBmb250U2l6ZVJlZ2V4cCA9IG5ldyBSZWdFeHAoXCJmb250U2l6ZVxcXFxzKyhbXFxcXC1cXFxcJFxcXFxAMC05YS16QS1aXSspXCIsIFwiaVwiKTtcclxuXHJcbiAgICAvLyBsaW5lSGVpZ2h0IHByb3BlcnR5IFJlZ2V4cFxyXG4gICAgY29uc3QgbGluZVJlZ2V4cCA9IG5ldyBSZWdFeHAoXCIobGluZUhlaWdodHxzcGFjaW5nfGxlYWRpbmcpXFxcXCgoLio/KVxcXFwpXCIsIFwiaVwiKTtcclxuXHJcbiAgICAvLyBDb3B5IFZhbHVlcyBmcm9tIG9iamVjdCAyIHRvIG9iamVjdCAxO1xyXG4gICAgY29uc3QgZXh0ZW5kID0gKG9iamVjdDEsIG9iamVjdDIpID0+IHtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QyKSwga2V5c1NpemUgPSBrZXlzLmxlbmd0aDsgaSA8IGtleXNTaXplOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGtleXNbaV07XHJcbiAgICAgICAgICAgIG9iamVjdDFba2V5XSA9IG9iamVjdDJba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9iamVjdDE7XHJcbiAgICB9O1xyXG5cclxuICAgIGlmKG9wdGlvbnMgIT0gbnVsbCl7XHJcbiAgICAgICAgZXh0ZW5kKGdsb2JhbFNldHRpbmdzLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0b0NhbWVsQ2FzZSA9ICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL15bXmEtejAtOV0qKC4qKVteYS16MC05XSokLywgXCIkMVwiKS5yZXBsYWNlKC9bXmEtejAtOV0rKFthLXowLTldKS9nLCAobWF0Y2gsIGxldHRlcikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gbGV0dGVyLnRvVXBwZXJDYXNlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgY29uc3QgaW5pdFNldHRpbmdzID0gKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBBZGQgZm9udFNpemVzXHJcbiAgICAgICAgaWYgKFwiZm9udC1zaXplc1wiIGluIGdsb2JhbFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBnbG9iYWxTZXR0aW5nc1tcImZvbnQtc2l6ZXNcIl07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoXCJmb250LXNpemVzXCIgaW4gY3VycmVudFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBjdXJyZW50Rm9udFNpemVzICsgXCIsIFwiICsgY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplc1wiXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRvTG93ZXJDYXNlIEN1cnJlbnQgU2V0dGluZ3NcclxuICAgICAgICBmb3IgKGxldCBpID0gMCwga2V5c1NpemUgPSBnbG9iYWxLZXlzLmxlbmd0aDsgaSA8IGtleXNTaXplOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGdsb2JhbEtleXNbaV07XHJcbiAgICAgICAgICAgIGlmIChrZXkgaW4gY3VycmVudFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3Nba2V5XSA9IGN1cnJlbnRTZXR0aW5nc1trZXldLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvbnRTaXplc0NvbGxlY3Rpb24gPSBuZXcgRm9udFNpemVzKGN1cnJlbnRTZXR0aW5ncyk7XHJcbiAgICAgICAgcmh5dGhtQ2FsY3VsYXRvciA9IG5ldyBWZXJ0aWNhbFJoeXRobShjdXJyZW50U2V0dGluZ3MpO1xyXG4gICAgICAgIGZvbnRTaXplc0NvbGxlY3Rpb24uYWRkRm9udFNpemVzKGN1cnJlbnRGb250U2l6ZXMsIHJoeXRobUNhbGN1bGF0b3IpO1xyXG4gICAgICAgIGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCA9IG5ldyBSZWdFeHAoXCJcXFxcQChcIiArIE9iamVjdC5rZXlzKGN1cnJlbnRTZXR0aW5ncykuam9pbihcInxcIikucmVwbGFjZSgvKFxcLXxcXF8pL2csIFwiXFxcXCQxXCIpICsgXCIpXCIsIFwiaVwiKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHdhbGtEZWNscyA9IChub2RlKSA9PiB7XHJcbiAgICAgICAgbm9kZS53YWxrRGVjbHMoZGVjbCA9PiB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZm91bmQ7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXBsYWNlIFZhcmlhYmxlcyB3aXRoIHZhbHVlc1xyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChjdXJyZW50U2V0dGluZ3NSZWdleHApKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhcmlhYmxlID0gZm91bmRbMV07XHJcbiAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCwgY3VycmVudFNldHRpbmdzW3ZhcmlhYmxlXSk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZXBsYWNlIEZvbnQgU2l6ZVxyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChmb250U2l6ZVJlZ2V4cCkpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IFtmb250U2l6ZSwgc2l6ZVVuaXRdID0gZm91bmRbMV0uc3BsaXQoL1xcJC9pKTtcclxuICAgICAgICAgICAgICAgIHNpemVVbml0ID0gKHNpemVVbml0ICE9IG51bGwpID8gc2l6ZVVuaXQudG9Mb3dlckNhc2UoKSA6IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHNpemUgPSBmb250U2l6ZXNDb2xsZWN0aW9uLmdldFNpemUoZm9udFNpemUpO1xyXG4gICAgICAgICAgICAgICAgLy8gV3JpdGUgZm9udCBzaXplXHJcbiAgICAgICAgICAgICAgICBpZiAoc2l6ZVVuaXQgIT0gbnVsbCAmJiAoc2l6ZVVuaXQgPT0gXCJlbVwiIHx8IHNpemVVbml0ID09IFwicmVtXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGZvcm1hdFZhbHVlKHNpemUucmVsKSArIHNpemVVbml0KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNpemVVbml0ICE9IG51bGwgJiYgc2l6ZVVuaXQgPT0gXCJweFwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGZvcm1hdEludChzaXplLnB4KSArIFwicHhcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNmc2l6ZSA9IChjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdID09IFwicHhcIikgPyBmb3JtYXRJbnQoc2l6ZS5weCkgOiBmb3JtYXRWYWx1ZShzaXplLnJlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGNmc2l6ZSArIGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0pO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkanVzdCBGb250IFNpemVcclxuICAgICAgICAgICAgaWYgKGRlY2wucHJvcCA9PSBcImFkanVzdC1mb250LXNpemVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBbZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemVdID0gZGVjbC52YWx1ZS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplVW5pdCA9IGZvbnRTaXplLm1hdGNoKC8ocHh8ZW18cmVtKSQvaSlbMF0udG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHJoeXRobUNhbGN1bGF0b3IuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCBudWxsLCBiYXNlRm9udFNpemUpICsgY3VycmVudFNldHRpbmdzW1widW5pdFwiXTtcclxuXHJcbiAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZm9udFNpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0RGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBsaW5lSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZGVjbC5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlY2wucHJvcCA9IFwiZm9udC1zaXplXCI7XHJcbiAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC5pbnNlcnRBZnRlcihkZWNsLCBsaW5lSGVpZ2h0RGVjbCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGxpbmVIZWlnaHQsIHNwYWNpbmcsIGxlYWRpbmdcclxuICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2gobGluZVJlZ2V4cCkpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gZm91bmRbMV0udG9Mb3dlckNhc2UoKTsgLy8gc3BhY2luZyBvciBsaW5lSGVpZ2h0XHJcbiAgICAgICAgICAgICAgICBsZXQgcGFyYW1ldGVycyA9IGZvdW5kWzJdLnNwbGl0KC9cXHMqXFwsXFxzKi8pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIHBhcmFtZXRlcnNTaXplID0gcGFyYW1ldGVycy5sZW5ndGg7IGkgPCBwYXJhbWV0ZXJzU2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFt2YWx1ZSwgZm9udFNpemVdID0gcGFyYW1ldGVyc1tpXS5zcGxpdCgvXFxzKy8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZm9udFNpemUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC53YWxrRGVjbHMoXCJmb250LXNpemVcIiwgZnNkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gZnNkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmb250U2l6ZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplXCJdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5ID09IFwibGluZWhlaWdodFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgKz0gcmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09IFwic3BhY2luZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgKz0gcmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSwgbnVsbCwgdHJ1ZSkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09IFwibGVhZGluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgKz0gcmh5dGhtQ2FsY3VsYXRvci5sZWFkaW5nKHZhbHVlLCBmb250U2l6ZSkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb3VuZFswXSwgbGluZUhlaWdodC5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyByZW0gZmFsbGJhY2tcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInB4LWZhbGxiYWNrXCJdID09IFwidHJ1ZVwiICYmIGRlY2wudmFsdWUubWF0Y2goL1swLTlcXC5dK3JlbS9pKSkge1xyXG4gICAgICAgICAgICAgICAgZGVjbC5wYXJlbnQuaW5zZXJ0QmVmb3JlKGRlY2wsIGRlY2wuY2xvbmUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiByaHl0aG1DYWxjdWxhdG9yLnJlbUZhbGxiYWNrKGRlY2wudmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZGVjbC5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gKGNzcykgPT4ge1xyXG5cclxuICAgICAgICAvLyBFeHRlbmQgTm9kZXNcclxuICAgICAgICBsZXQgZXh0ZW5kTm9kZXMgPSB7fTtcclxuXHJcbiAgICAgICAgY3NzLndhbGsobm9kZSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGlmIChsYXN0RmlsZSAhPSBub2RlLnNvdXJjZS5pbnB1dC5maWxlKSB7XHJcbiAgICAgICAgICAgIC8vIFx0bGFzdEZpbGUgPSBub2RlLnNvdXJjZS5pbnB1dC5maWxlO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICBpZiAobm9kZS50eXBlID09IFwiYXRydWxlXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcnVsZSA9IG5vZGU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGUubmFtZSA9PSBcImhhbXN0ZXJcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocnVsZS5wYXJhbXMgIT0gXCJlbmRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgR2xvYmFsIFZhcmlhYmxlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLndhbGtEZWNscyhkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbFNldHRpbmdzW2RlY2wucHJvcF0gPSBkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgZm9udFNpemVzXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKFwiZm9udC1zaXplc1wiIGluIGdsb2JhbFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBnbG9iYWxTZXR0aW5nc1tcImZvbnQtc2l6ZXNcIl07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IGN1cnJlbnQgdmFyaWFibGVzXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzID0gZXh0ZW5kKHt9LCBnbG9iYWxTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRTZXR0aW5ncygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgUnVsZSBIYW1zdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcIiFoYW1zdGVyXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9jdXJyZW50U2V0dGluZ3MgPSBleHRlbmQoe30sIGdsb2JhbFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS53YWxrRGVjbHMoZGVjbCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTZXR0aW5nc1tkZWNsLnByb3BdID0gZGVjbC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFNldHRpbmdzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUgPT0gXCJiYXNlbGluZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZSA9IHBhcnNlSW50KGN1cnJlbnRTZXR0aW5nc1tcImZvbnQtc2l6ZVwiXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJyb3dzZXJGb250U2l6ZSA9IHBhcnNlSW50KGN1cnJlbnRTZXR0aW5nc1tcImJyb3dzZXItZm9udC1zaXplXCJdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUgKyBcInB4XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBiYXNlbGluZSBmb250IHNpemVcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZm9udFNpemVEZWNsID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInB4LWJhc2VsaW5lXCJdID09IFwidHJ1ZVwiIHx8IChjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdID09IFwicHhcIiAmJiBjdXJyZW50U2V0dGluZ3NbXCJsZWdhY3ktYnJvd3NlcnNcIl0gIT0gXCJ0cnVlXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZURlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJmb250LXNpemVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmb250U2l6ZSArIFwicHhcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVsYXRpdmVTaXplID0gMTAwICogZm9udFNpemUgLyBicm93c2VyRm9udFNpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZURlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJmb250LXNpemVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmb3JtYXRWYWx1ZShyZWxhdGl2ZVNpemUpICsgXCIlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0RGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IFwibGluZS1oZWlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGxpbmVIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlLnBhcmFtcy5tYXRjaCgvXFxzKmh0bWxcXHMqLykpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBodG1sUnVsZSA9IHBvc3Rjc3MucnVsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCJodG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbFJ1bGUuYXBwZW5kKGZvbnRTaXplRGVjbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxSdWxlLmFwcGVuZChsaW5lSGVpZ2h0RGVjbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBodG1sUnVsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1widW5pdFwiXSA9PSBcInB4XCIgJiYgY3VycmVudFNldHRpbmdzW1wibGVnYWN5LWJyb3dzZXJzXCJdID09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXN0ZXJpc2tIdG1sUnVsZSA9IHBvc3Rjc3MucnVsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiKiBodG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Rlcmlza0h0bWxSdWxlLmFwcGVuZChsaW5lSGVpZ2h0RGVjbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBhc3Rlcmlza0h0bWxSdWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgbGluZUhlaWdodERlY2wpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBmb250U2l6ZURlY2wpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0gPT0gXCJyZW1cIiAmJiBjdXJyZW50U2V0dGluZ3NbXCJweC1mYWxsYmFja1wiXSA9PSBcInRydWVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShsaW5lSGVpZ2h0RGVjbCwgcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJoeXRobUNhbGN1bGF0b3IucmVtRmFsbGJhY2sobGluZUhlaWdodCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcInJ1bGVyXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVySWNvblBvc2l0aW9uID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItaWNvbi1wb3NpdGlvblwiXS5yZXBsYWNlKC8oXFwnfFxcXCIpL2csIFwiXCIpLnJlcGxhY2UoL1xcOy9nLCBcIjtcXG5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0ID0gKGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdLm1hdGNoKC9weCQvaSkpID8gY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0gOiBjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSArIFwiZW1cIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGY4LCUzQ3N2ZyB4bWxucyUzRCUyN2h0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyNyB2aWV3Qm94JTNEJTI3MCAwIDI0IDI0JTI3JTNFJTNDcGF0aCBmaWxsJTNEJTI3e2NvbG9yfSUyNyBkJTNEJTI3TTE4IDI0Yy0wLjMgMC0wLjU0OC0wLjI0Ni0wLjU0OC0wLjU0NlYxOGMwLTAuMyAwLjI0OC0wLjU0NiAwLjU0OC0wLjU0Nmg1LjQ1MiAgQzIzLjc1NCAxNy40NTQgMjQgMTcuNyAyNCAxOHY1LjQ1NGMwIDAuMy0wLjI0NiAwLjU0Ni0wLjU0OCAwLjU0NkgxOHogTTkuMjcxIDI0Yy0wLjI5OCAwLTAuNTQzLTAuMjQ2LTAuNTQzLTAuNTQ2VjE4ICBjMC0wLjMgMC4yNDUtMC41NDYgMC41NDMtMC41NDZoNS40NTdjMC4zIDAgMC41NDMgMC4yNDYgMC41NDMgMC41NDZ2NS40NTRjMCAwLjMtMC4yNDMgMC41NDYtMC41NDMgMC41NDZIOS4yNzF6IE0wLjU0OCAyNCAgQzAuMjQ2IDI0IDAgMjMuNzU0IDAgMjMuNDU0VjE4YzAtMC4zIDAuMjQ2LTAuNTQ2IDAuNTQ4LTAuNTQ2SDZjMC4zMDIgMCAwLjU0OCAwLjI0NiAwLjU0OCAwLjU0NnY1LjQ1NEM2LjU0OCAyMy43NTQgNi4zMDIgMjQgNiAyNCAgSDAuNTQ4eiBNMTggMTUuMjcxYy0wLjMgMC0wLjU0OC0wLjI0NC0wLjU0OC0wLjU0MlY5LjI3MmMwLTAuMjk5IDAuMjQ4LTAuNTQ1IDAuNTQ4LTAuNTQ1aDUuNDUyQzIzLjc1NCA4LjcyNyAyNCA4Ljk3MyAyNCA5LjI3MiAgdjUuNDU3YzAgMC4yOTgtMC4yNDYgMC41NDItMC41NDggMC41NDJIMTh6IE05LjI3MSAxNS4yNzFjLTAuMjk4IDAtMC41NDMtMC4yNDQtMC41NDMtMC41NDJWOS4yNzJjMC0wLjI5OSAwLjI0NS0wLjU0NSAwLjU0My0wLjU0NSAgaDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ2IDAuNTQzIDAuNTQ1djUuNDU3YzAgMC4yOTgtMC4yNDMgMC41NDItMC41NDMgMC41NDJIOS4yNzF6IE0wLjU0OCAxNS4yNzFDMC4yNDYgMTUuMjcxIDAgMTUuMDI2IDAgMTQuNzI5ICBWOS4yNzJjMC0wLjI5OSAwLjI0Ni0wLjU0NSAwLjU0OC0wLjU0NUg2YzAuMzAyIDAgMC41NDggMC4yNDYgMC41NDggMC41NDV2NS40NTdjMCAwLjI5OC0wLjI0NiAwLjU0Mi0wLjU0OCAwLjU0MkgwLjU0OHogTTE4IDYuNTQ1ICBjLTAuMyAwLTAuNTQ4LTAuMjQ1LTAuNTQ4LTAuNTQ1VjAuNTQ1QzE3LjQ1MiAwLjI0NSAxNy43IDAgMTggMGg1LjQ1MkMyMy43NTQgMCAyNCAwLjI0NSAyNCAwLjU0NVY2YzAgMC4zLTAuMjQ2IDAuNTQ1LTAuNTQ4IDAuNTQ1ICBIMTh6IE05LjI3MSA2LjU0NUM4Ljk3NCA2LjU0NSA4LjcyOSA2LjMgOC43MjkgNlYwLjU0NUM4LjcyOSAwLjI0NSA4Ljk3NCAwIDkuMjcxIDBoNS40NTdjMC4zIDAgMC41NDMgMC4yNDUgMC41NDMgMC41NDVWNiAgYzAgMC4zLTAuMjQzIDAuNTQ1LTAuNTQzIDAuNTQ1SDkuMjcxeiBNMC41NDggNi41NDVDMC4yNDYgNi41NDUgMCA2LjMgMCA2VjAuNTQ1QzAgMC4yNDUgMC4yNDYgMCAwLjU0OCAwSDYgIGMwLjMwMiAwIDAuNTQ4IDAuMjQ1IDAuNTQ4IDAuNTQ1VjZjMCAwLjMtMC4yNDYgMC41NDUtMC41NDggMC41NDVIMC41NDh6JTI3JTJGJTNFJTNDJTJGc3ZnJTNFXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAyNCAyNCUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00wLDZjMCwwLjMwMSwwLjI0NiwwLjU0NSwwLjU0OSwwLjU0NWgyMi45MDZDMjMuNzU2LDYuNTQ1LDI0LDYuMzAxLDI0LDZWMi43M2MwLTAuMzA1LTAuMjQ0LTAuNTQ5LTAuNTQ1LTAuNTQ5SDAuNTQ5ICBDMC4yNDYsMi4xODIsMCwyLjQyNiwwLDIuNzNWNnogTTAsMTMuNjM3YzAsMC4yOTcsMC4yNDYsMC41NDUsMC41NDksMC41NDVoMjIuOTA2YzAuMzAxLDAsMC41NDUtMC4yNDgsMC41NDUtMC41NDV2LTMuMjczICBjMC0wLjI5Ny0wLjI0NC0wLjU0NS0wLjU0NS0wLjU0NUgwLjU0OUMwLjI0Niw5LjgxOCwwLDEwLjA2NiwwLDEwLjM2M1YxMy42Mzd6IE0wLDIxLjI3YzAsMC4zMDUsMC4yNDYsMC41NDksMC41NDksMC41NDloMjIuOTA2ICBjMC4zMDEsMCwwLjU0NS0wLjI0NCwwLjU0NS0wLjU0OVYxOGMwLTAuMzAxLTAuMjQ0LTAuNTQ1LTAuNTQ1LTAuNTQ1SDAuNTQ5QzAuMjQ2LDE3LjQ1NSwwLDE3LjY5OSwwLDE4VjIxLjI3eiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAzMiAzMiUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00yOCwyMGgtNHYtOGg0YzEuMTA0LDAsMi0wLjg5NiwyLTJzLTAuODk2LTItMi0yaC00VjRjMC0xLjEwNC0wLjg5Ni0yLTItMnMtMiwwLjg5Ni0yLDJ2NGgtOFY0YzAtMS4xMDQtMC44OTYtMi0yLTIgIFM4LDIuODk2LDgsNHY0SDRjLTEuMTA0LDAtMiwwLjg5Ni0yLDJzMC44OTYsMiwyLDJoNHY4SDRjLTEuMTA0LDAtMiwwLjg5Ni0yLDJzMC44OTYsMiwyLDJoNHY0YzAsMS4xMDQsMC44OTYsMiwyLDJzMi0wLjg5NiwyLTJ2LTQgIGg4djRjMCwxLjEwNCwwLjg5NiwyLDIsMnMyLTAuODk2LDItMnYtNGg0YzEuMTA0LDAsMi0wLjg5NiwyLTJTMjkuMTA0LDIwLDI4LDIweiBNMTIsMjB2LThoOHY4SDEyeiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBndGhpY2tuZXNzID0gcGFyc2VGbG9hdChjdXJyZW50U2V0dGluZ3NbXCJydWxlci10aGlja25lc3NcIl0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgYmFja2dyb3VuZCA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJydWxlci1iYWNrZ3JvdW5kXCJdID09IFwicG5nXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZUhlaWdodCA9IChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXS5tYXRjaCgvcHgkLykpID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAocGFyc2VGbG9hdChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSkgKiBwYXJzZUZsb2F0KGN1cnJlbnRTZXR0aW5nc1tcImZvbnQtc2l6ZVwiXSkpLnRvRml4ZWQoMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXR0ZXJuID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItcGF0dGVyblwiXS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2UgPSBuZXcgUG5nSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UucnVsZXJNYXRyaXgoaW1hZ2VIZWlnaHQsIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWNvbG9yXCJdLCBwYXR0ZXJuLCBndGhpY2tuZXNzLCBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1zY2FsZVwiXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJydWxlci1vdXRwdXRcIl0gIT0gXCJiYXNlNjRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UuZ2V0RmlsZShjdXJyZW50U2V0dGluZ3NbXCJydWxlci1vdXRwdXRcIl0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCIuLi9cIiArIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLW91dHB1dFwiXSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1wb3NpdGlvbjogbGVmdCB0b3A7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1yZXBlYXQ6IHJlcGVhdDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXNpemU6IFwiICsgcGF0dGVybi5sZW5ndGggKyBcInB4IFwiICsgaW1hZ2VIZWlnaHQgKyBcInB4O1wiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LFwiICsgaW1hZ2UuZ2V0QmFzZTY0KCkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcG9zaXRpb246IGxlZnQgdG9wO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcmVwZWF0OiByZXBlYXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1zaXplOiBcIiArIHBhdHRlcm4ubGVuZ3RoICsgXCJweCBcIiArIGltYWdlSGVpZ2h0ICsgXCJweDtcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGd0aGlja25lc3MgPSBndGhpY2tuZXNzICogMztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcImJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byB0b3AsIFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWNvbG9yXCJdICsgXCIgXCIgKyBndGhpY2tuZXNzICsgXCIlLCB0cmFuc3BhcmVudCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBndGhpY2tuZXNzICsgXCIlKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtc2l6ZTogMTAwJSBcIiArIGxpbmVIZWlnaHQgKyBcIjtcIjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBydWxlciA9IFwicG9zaXRpb246IGFic29sdXRlO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJsZWZ0OiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0b3A6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1hcmdpbjogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGg6IDEwMCU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodDogMTAwJTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiei1pbmRleDogOTkwMDtcIiArIGJhY2tncm91bmQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpY29uU2l6ZSA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWljb24tc2l6ZVwiXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFtzdHlsZSwgcnVsZXJDbGFzc10gPSBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1zdHlsZVwiXS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBbY29sb3IsIGhvdmVyQ29sb3JdID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItaWNvbi1jb2xvcnNcIl0uc3BsaXQoL1xccysvKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVyUnVsZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHlsZSA9PSBcInN3aXRjaFwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTogbm9uZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlciArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6bm9uZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdICsgbGFiZWwge1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiei1pbmRleDogOTk5OTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6IGlubGluZS1ibG9jaztcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArIHJ1bGVySWNvblBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoOiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHQ6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnNvcjogcG9pbnRlcjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnJlcGxhY2UoL1xce2NvbG9yXFx9LywgZXNjYXBlKGNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl06Y2hlY2tlZCArIGxhYmVsLCBpbnB1dFtpZD1cXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJDbGFzcyArIFwiXFxcIl06aG92ZXIgKyBsYWJlbCB7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIlwiICsgc3ZnLnJlcGxhY2UoL1xce2NvbG9yXFx9LywgZXNjYXBlKGhvdmVyQ29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJDbGFzcyArIFwiXFxcIl06Y2hlY2tlZCB+IC5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6IGJsb2NrO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdHlsZSA9PSBcImhvdmVyXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCIuXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwb3NpdGlvbjogYWJzb2x1dGU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJJY29uUG9zaXRpb24gK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYWRkaW5nOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGg6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJcIiArIHN2Zy5yZXBsYWNlKC9cXHtjb2xvclxcfS8sIGVzY2FwZShjb2xvcikpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInRyYW5zaXRpb246IGJhY2tncm91bmQtaW1hZ2UgMC41cyBlYXNlLWluLW91dDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIjpob3ZlclwiICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjdXJzb3I6IHBvaW50ZXI7XCIgKyBydWxlciArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3R5bGUgPT0gXCJhbHdheXNcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJSdWxlID0gcG9zdGNzcy5wYXJzZShcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcXG5cIiArIHJ1bGVyICsgXCJ9XFxuXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlclJ1bGUgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUuc291cmNlID0gcnVsZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBydWxlclJ1bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lLm1hdGNoKC9eKGVsbGlwc2lzfG5vd3JhcHxmb3JjZXdyYXB8aHlwaGVuc3xicmVha1xcLXdvcmQpJC9pKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBydWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlY2xzID0gaGVscGVyc1twcm9wZXJ0eV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eSA9PSBcImh5cGhlbnNcIiAmJiBydWxlLnBhcmFtcyA9PSBcInRydWVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNscyA9IGhlbHBlcnNbXCJicmVhay13b3JkXCJdICsgZGVjbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eSA9PSBcImVsbGlwc2lzXCIgJiYgcnVsZS5wYXJhbXMgPT0gXCJ0cnVlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjbHMgPSBoZWxwZXJzW1wibm93cmFwXCJdICsgZGVjbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicHJvcGVydGllc1wiXSA9PSBcImlubGluZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaWRlY2xzID0gcG9zdGNzcy5wYXJzZShkZWNscyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBpZGVjbHMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInByb3BlcnRpZXNcIl0gPT0gXCJleHRlbmRcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4dGVuZE5hbWUgPSB0b0NhbWVsQ2FzZShwcm9wZXJ0eSArIFwiIFwiICsgcnVsZS5wYXJhbXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIGV4dGVuZCBpbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogcnVsZS5wYXJlbnQuc2VsZWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbHM6IGRlY2xzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHM6IFtydWxlLnBhcmVudF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldjogcnVsZS5wcmV2KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9BcHBlbmQgc2VsZWN0b3IgYW5kIHVwZGF0ZSBjb3VudGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5zZWxlY3RvciA9IGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLnNlbGVjdG9yICsgXCIsIFwiICsgcnVsZS5wYXJlbnQuc2VsZWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5wYXJlbnRzLnB1c2gocnVsZS5wYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0uY291bnQrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUubWF0Y2goL14ocmVzZXR8bm9ybWFsaXplKSQvaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBydWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXMgPSBwb3N0Y3NzLnBhcnNlKGhlbHBlcnNbcHJvcGVydHldKTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlcy5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBydWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFdhbGsgaW4gbWVkaWEgcXVlcmllc1xyXG4gICAgICAgICAgICAgICAgbm9kZS53YWxrKGNoaWxkID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT0gXCJydWxlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2FsayBkZWNscyBpbiBydWxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhbGtEZWNscyhjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gZWxzZSBpZiAocnVsZS5uYW1lID09IFwianNcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICAgICBsZXQgamNzcyA9IHJ1bGUudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBsZXQgY29kZSA9IGpjc3MucmVwbGFjZSgvXFxAanNcXHMqXFx7KFtcXHNcXFNdKylcXH0kL2ksIFwiJDFcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGpjc3MpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIC8vIHJ1bGVyUnVsZS5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgcnVsZXJSdWxlKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICBydWxlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnR5cGUgPT0gXCJydWxlXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBXYWxrIGRlY2xzIGluIHJ1bGVcclxuICAgICAgICAgICAgICAgIHdhbGtEZWNscyhub2RlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFNldHRpbmdzW1wicmVtb3ZlLWNvbW1lbnRzXCJdID09IFwidHJ1ZVwiICYmIG5vZGUudHlwZSA9PSBcImNvbW1lbnRcIikge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIEV4dGVuZHMgdG8gQ1NTXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGtleXMgPSBPYmplY3Qua2V5cyhleHRlbmROb2RlcyksIGtleXNTaXplID0ga2V5cy5sZW5ndGg7IGkgPCBrZXlzU2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgICAgICBpZiAoZXh0ZW5kTm9kZXNba2V5XS5jb3VudCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBydWxlID0gcG9zdGNzcy5wYXJzZShleHRlbmROb2Rlc1trZXldLnNlbGVjdG9yICsgXCJ7XCIgKyBleHRlbmROb2Rlc1trZXldLmRlY2xzICsgXCJ9XCIpO1xyXG4gICAgICAgICAgICAgICAgcnVsZS5zb3VyY2UgPSBleHRlbmROb2Rlc1trZXldLnNvdXJjZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjc3MuaW5zZXJ0QmVmb3JlKGV4dGVuZE5vZGVzW2tleV0ucGFyZW50c1swXSwgcnVsZSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlY2xzID0gcG9zdGNzcy5wYXJzZShleHRlbmROb2Rlc1trZXldLmRlY2xzKTtcclxuICAgICAgICAgICAgICAgIGRlY2xzLnNvdXJjZSA9IGV4dGVuZE5vZGVzW2tleV0uc291cmNlO1xyXG4gICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzWzBdLmluc2VydEFmdGVyKGV4dGVuZE5vZGVzW2tleV0ucHJldiwgZGVjbHMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdW51c2VkIHBhcmVudCBub2Rlcy5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDAsIHBhcmVudHMgPSBleHRlbmROb2Rlc1trZXldLnBhcmVudHMubGVuZ3RoOyBqIDwgcGFyZW50czsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzW2pdLm5vZGVzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzW2pdLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgaGFtc3RlcjsiXX0=
