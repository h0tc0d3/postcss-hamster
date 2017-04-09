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

        "forcewrap": "white-space: pre;" + "white-space: pre-line;" + "white-space: pre-wrap;" + "word-wrap: break-word;",

        "ellipsis": "overflow: hidden;" + "text-overflow: ellipsis;",

        "hyphens": "word-wrap: break-word;" + "hyphens: auto;",

        "break-word":
        /* Non standard for webkit */
        "word-break: break-word;" +
        /* Warning: Needed for oldIE support, but words are broken up letter-by-letter */
        "word-break: break-all;"
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhhbXN0ZXIiLCJvcHRpb25zIiwiZ2xvYmFsU2V0dGluZ3MiLCJnbG9iYWxLZXlzIiwiaGVscGVycyIsInJlYWRGaWxlU3luYyIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJjdXJyZW50U2V0dGluZ3MiLCJjdXJyZW50U2V0dGluZ3NSZWdleHAiLCJjdXJyZW50Rm9udFNpemVzIiwiZm9udFNpemVzQ29sbGVjdGlvbiIsInJoeXRobUNhbGN1bGF0b3IiLCJmb250U2l6ZVJlZ2V4cCIsIlJlZ0V4cCIsImxpbmVSZWdleHAiLCJleHRlbmQiLCJvYmplY3QxIiwib2JqZWN0MiIsImkiLCJrZXlzIiwiT2JqZWN0Iiwia2V5c1NpemUiLCJsZW5ndGgiLCJrZXkiLCJ0b0NhbWVsQ2FzZSIsInZhbHVlIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwibWF0Y2giLCJsZXR0ZXIiLCJ0b1VwcGVyQ2FzZSIsImluaXRTZXR0aW5ncyIsImFkZEZvbnRTaXplcyIsImpvaW4iLCJ3YWxrRGVjbHMiLCJub2RlIiwiZm91bmQiLCJkZWNsIiwidmFyaWFibGUiLCJzcGxpdCIsImZvbnRTaXplIiwic2l6ZVVuaXQiLCJzaXplIiwiZ2V0U2l6ZSIsInJlbCIsInB4IiwiY2ZzaXplIiwicHJvcCIsImxpbmVzIiwiYmFzZUZvbnRTaXplIiwiZm9udFNpemVVbml0IiwiY29udmVydCIsImxpbmVIZWlnaHQiLCJsaW5lSGVpZ2h0RGVjbCIsInNvdXJjZSIsInBhcmVudCIsImluc2VydEFmdGVyIiwicHJvcGVydHkiLCJwYXJhbWV0ZXJzIiwicGFyYW1ldGVyc1NpemUiLCJmc2RlY2wiLCJsZWFkaW5nIiwiaW5zZXJ0QmVmb3JlIiwiY2xvbmUiLCJyZW1GYWxsYmFjayIsImNzcyIsImV4dGVuZE5vZGVzIiwid2FsayIsInR5cGUiLCJydWxlIiwibmFtZSIsInBhcmFtcyIsInJlbW92ZSIsInBhcnNlSW50IiwiYnJvd3NlckZvbnRTaXplIiwiZm9udFNpemVEZWNsIiwicmVsYXRpdmVTaXplIiwiaHRtbFJ1bGUiLCJzZWxlY3RvciIsImFwcGVuZCIsImFzdGVyaXNrSHRtbFJ1bGUiLCJydWxlckljb25Qb3NpdGlvbiIsInN2ZyIsImd0aGlja25lc3MiLCJwYXJzZUZsb2F0IiwiYmFja2dyb3VuZCIsImltYWdlSGVpZ2h0IiwidG9GaXhlZCIsInBhdHRlcm4iLCJpbWFnZSIsInJ1bGVyTWF0cml4IiwiZ2V0RmlsZSIsImdldEJhc2U2NCIsInJ1bGVyIiwiaWNvblNpemUiLCJzdHlsZSIsInJ1bGVyQ2xhc3MiLCJjb2xvciIsImhvdmVyQ29sb3IiLCJydWxlclJ1bGUiLCJwYXJzZSIsImVzY2FwZSIsImRlY2xzIiwiaWRlY2xzIiwiZXh0ZW5kTmFtZSIsInBhcmVudHMiLCJwcmV2IiwiY291bnQiLCJwdXNoIiwicnVsZXMiLCJjaGlsZCIsImoiLCJub2RlcyJdLCJtYXBwaW5ncyI6Ijs7OztBQVlBOzs7O0FBRUE7O0FBTUE7Ozs7QUFHQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQTFCQTs7Ozs7Ozs7Ozs7O0FBNEJBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxHQUFvQjtBQUFBLFFBQW5CQyxPQUFtQix1RUFBVCxJQUFTOzs7QUFFaEM7QUFDQSxRQUFJQyxpQkFBaUI7O0FBRWpCLHFCQUFhLE1BRkk7QUFHakIsdUJBQWUsS0FIRTtBQUlqQixnQkFBUSxJQUpTO0FBS2pCLHVCQUFlLE1BTEU7QUFNakIsdUJBQWUsT0FORTtBQU9qQixzQkFBYyxHQVBHOztBQVNqQixzQkFBYyxRQVRHOztBQVdqQiw0QkFBb0IsS0FYSDtBQVlqQiw4QkFBc0IsT0FaTDs7QUFjakIsaUJBQVMsTUFkUTtBQWVqQix1QkFBZSxvQkFmRTtBQWdCakIsK0JBQXVCLHlCQWhCTjtBQWlCakIsNkJBQXFCLGlCQWpCSjtBQWtCakIsMkJBQW1CLE1BbEJGO0FBbUJqQix1QkFBZSx3QkFuQkU7QUFvQmpCLDJCQUFtQixHQXBCRjtBQXFCakIsNEJBQW9CLFVBckJIO0FBc0JqQix3QkFBZ0Is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QXdDVSxZQUFZM0MsR0FBWixFQUFpQm1GLElBQXpELEVBQStESixLQUEvRDtBQUNIOztBQUVEO0FBQ0EsaUJBQUssSUFBSVMsSUFBSSxDQUFSLEVBQVdOLFVBQVV2QyxZQUFZM0MsR0FBWixFQUFpQmtGLE9BQWpCLENBQXlCbkYsTUFBbkQsRUFBMkR5RixJQUFJTixPQUEvRCxFQUF3RU0sR0FBeEUsRUFBNkU7QUFDekUsb0JBQUk3QyxZQUFZM0MsR0FBWixFQUFpQmtGLE9BQWpCLENBQXlCTSxDQUF6QixFQUE0QkMsS0FBNUIsQ0FBa0MxRixNQUFsQyxJQUE0QyxDQUFoRCxFQUFtRDtBQUMvQzRDLGdDQUFZM0MsR0FBWixFQUFpQmtGLE9BQWpCLENBQXlCTSxDQUF6QixFQUE0QnZDLE1BQTVCO0FBQ0g7QUFDSjtBQUVKO0FBRUosS0FuV0Q7QUFvV0gsQ0ExbEJEO0FBUEE7O2tCQW1tQmV6RSxPIiwiZmlsZSI6IkhhbXN0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG1vZHVsZSBIYW1zdGVyXHJcbiAqIFxyXG4gKiBAZGVzY3JpcHRpb24gUG9zdENTUyBIYW1zdGVyIGZyYW1ld29yayBtYWluIGZ1bmN0aW9uYWxpdHkuXHJcbiAqXHJcbiAqIEB2ZXJzaW9uIDEuMFxyXG4gKiBAYXV0aG9yIEdyaWdvcnkgVmFzaWx5ZXYgPHBvc3Rjc3MuaGFtc3RlckBnbWFpbC5jb20+IGh0dHBzOi8vZ2l0aHViLmNvbS9oMHRjMGQzXHJcbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE3LCBHcmlnb3J5IFZhc2lseWV2XHJcbiAqIEBsaWNlbnNlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCwgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wIFxyXG4gKiBcclxuICovXHJcblxyXG5pbXBvcnQgRm9udFNpemVzIGZyb20gXCIuL0ZvbnRTaXplc1wiO1xyXG5cclxuaW1wb3J0IHtcclxuICAgIGZvcm1hdEludCxcclxuICAgIGZvcm1hdFZhbHVlLFxyXG4gICAgVmVydGljYWxSaHl0aG1cclxufSBmcm9tIFwiLi9WZXJ0aWNhbFJoeXRobVwiO1xyXG5cclxuaW1wb3J0IFBuZ0ltYWdlIGZyb20gXCIuL1BuZ0ltYWdlXCI7XHJcbi8vIGltcG9ydCBWaXJ0dWFsTWFjaGluZSBmcm9tIFwiLi9WaXJ0dWFsTWFjaGluZVwiO1xyXG5cclxuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5cclxuaW1wb3J0IHBvc3Rjc3MgZnJvbSBcInBvc3Rjc3NcIjtcclxuXHJcbmNvbnN0IGhhbXN0ZXIgPSAob3B0aW9ucyA9IG51bGwpID0+IHtcclxuXHJcbiAgICAvL0RlZmF1bHQgR2xvYmFsIFNldHRpbmdzXHJcbiAgICBsZXQgZ2xvYmFsU2V0dGluZ3MgPSB7XHJcblxyXG4gICAgICAgIFwiZm9udC1zaXplXCI6IFwiMTZweFwiLFxyXG4gICAgICAgIFwibGluZS1oZWlnaHRcIjogXCIxLjVcIixcclxuICAgICAgICBcInVuaXRcIjogXCJlbVwiLFxyXG4gICAgICAgIFwicHgtZmFsbGJhY2tcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgXCJweC1iYXNlbGluZVwiOiBcImZhbHNlXCIsXHJcbiAgICAgICAgXCJmb250LXJhdGlvXCI6IFwiMFwiLFxyXG5cclxuICAgICAgICBcInByb3BlcnRpZXNcIjogXCJpbmxpbmVcIixcclxuXHJcbiAgICAgICAgXCJtaW4tbGluZS1wYWRkaW5nXCI6IFwiMnB4XCIsXHJcbiAgICAgICAgXCJyb3VuZC10by1oYWxmLWxpbmVcIjogXCJmYWxzZVwiLFxyXG5cclxuICAgICAgICBcInJ1bGVyXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgIFwicnVsZXItc3R5bGVcIjogXCJhbHdheXMgcnVsZXItZGVidWdcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tcG9zaXRpb25cIjogXCJ0b3A6IDEuNWVtO2xlZnQ6IDEuNWVtO1wiLFxyXG4gICAgICAgIFwicnVsZXItaWNvbi1jb2xvcnNcIjogXCIjY2NjY2NjICM0NDU3NmFcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tc2l6ZVwiOiBcIjI0cHhcIixcclxuICAgICAgICBcInJ1bGVyLWNvbG9yXCI6IFwicmdiYSgxOSwgMTM0LCAxOTEsIC44KVwiLFxyXG4gICAgICAgIFwicnVsZXItdGhpY2tuZXNzXCI6IFwiMVwiLFxyXG4gICAgICAgIFwicnVsZXItYmFja2dyb3VuZFwiOiBcImdyYWRpZW50XCIsXHJcbiAgICAgICAgXCJydWxlci1vdXRwdXRcIjogXCJiYXNlNjRcIixcclxuICAgICAgICBcInJ1bGVyLXBhdHRlcm5cIjogXCIxIDAgMCAwXCIsXHJcbiAgICAgICAgXCJydWxlci1zY2FsZVwiOiBcIjFcIixcclxuXHJcbiAgICAgICAgXCJicm93c2VyLWZvbnQtc2l6ZVwiOiBcIjE2cHhcIixcclxuICAgICAgICBcImxlZ2FjeS1icm93c2Vyc1wiOiBcInRydWVcIixcclxuICAgICAgICBcInJlbW92ZS1jb21tZW50c1wiOiBcImZhbHNlXCJcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBnbG9iYWxLZXlzID0gW1widW5pdFwiLFxyXG4gICAgICAgIFwicHgtZmFsbGJhY2tcIixcclxuICAgICAgICBcInB4LWJhc2VsaW5lXCIsXHJcbiAgICAgICAgXCJmb250LXJhdGlvXCIsXHJcbiAgICAgICAgXCJwcm9wZXJ0aWVzXCIsXHJcbiAgICAgICAgXCJyb3VuZC10by1oYWxmLWxpbmVcIixcclxuICAgICAgICBcInJ1bGVyXCIsXHJcbiAgICAgICAgXCJydWxlci1zdHlsZVwiLFxyXG4gICAgICAgIFwicnVsZXItYmFja2dyb3VuZFwiLFxyXG4gICAgICAgIFwicnVsZXItb3V0cHV0XCIsXHJcbiAgICAgICAgXCJsZWdhY3ktYnJvd3NlcnNcIixcclxuICAgICAgICBcInJlbW92ZS1jb21tZW50c1wiXTtcclxuXHJcbiAgICBsZXQgaGVscGVycyA9IHtcclxuICAgICAgICBcclxuICAgICAgICBcInJlc2V0XCI6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2hlbHBlcnMvcmVzZXQuY3NzXCIpLCBcInV0ZjhcIiksXHJcbiAgICAgICAgXHJcbiAgICAgICAgXCJub3JtYWxpemVcIjogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vaGVscGVycy9ub3JtYWxpemUuY3NzXCIpLCBcInV0ZjhcIiksXHJcbiAgICAgICAgXHJcbiAgICAgICAgXCJub3dyYXBcIjpcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogbm93cmFwO1wiLFxyXG5cclxuICAgICAgICBcImZvcmNld3JhcFwiOlxyXG4gICAgICAgICAgICBcIndoaXRlLXNwYWNlOiBwcmU7XCIgK1xyXG4gICAgICAgICAgICBcIndoaXRlLXNwYWNlOiBwcmUtbGluZTtcIiArXHJcbiAgICAgICAgICAgIFwid2hpdGUtc3BhY2U6IHByZS13cmFwO1wiICtcclxuICAgICAgICAgICAgXCJ3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XCIsXHJcbiAgICAgICAgXHJcbiAgICAgICAgXCJlbGxpcHNpc1wiOlxyXG4gICAgICAgICAgICBcIm92ZXJmbG93OiBoaWRkZW47XCIgK1xyXG4gICAgICAgICAgICBcInRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1wiLFxyXG5cclxuICAgICAgICBcImh5cGhlbnNcIjpcclxuICAgICAgICAgICAgXCJ3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XCIgK1xyXG4gICAgICAgICAgICBcImh5cGhlbnM6IGF1dG87XCIsXHJcblxyXG4gICAgICAgIFwiYnJlYWstd29yZFwiOlxyXG4gICAgICAgICAgICAvKiBOb24gc3RhbmRhcmQgZm9yIHdlYmtpdCAqL1xyXG4gICAgICAgICAgICBcIndvcmQtYnJlYWs6IGJyZWFrLXdvcmQ7XCIgK1xyXG4gICAgICAgICAgICAvKiBXYXJuaW5nOiBOZWVkZWQgZm9yIG9sZElFIHN1cHBvcnQsIGJ1dCB3b3JkcyBhcmUgYnJva2VuIHVwIGxldHRlci1ieS1sZXR0ZXIgKi9cclxuICAgICAgICAgICAgXCJ3b3JkLWJyZWFrOiBicmVhay1hbGw7XCJcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEN1cnJlbnQgVmFyaWFibGVzXHJcbiAgICBsZXQgY3VycmVudFNldHRpbmdzID0ge307XHJcbiAgICBsZXQgY3VycmVudFNldHRpbmdzUmVnZXhwO1xyXG4gICAgLy9DdXJyZW50IEZvbnRTaXplc1xyXG4gICAgbGV0IGN1cnJlbnRGb250U2l6ZXMgPSBcIlwiO1xyXG4gICAgLy8gZm9udCBTaXplc1xyXG4gICAgbGV0IGZvbnRTaXplc0NvbGxlY3Rpb247XHJcbiAgICAvLyBWZXJ0aWNhbCBSaHl0aG0gQ2FsY3VsYXRvclxyXG4gICAgbGV0IHJoeXRobUNhbGN1bGF0b3I7XHJcbiAgICAvLyBMYXN0IENzcyBGaWxlXHJcbiAgICAvLyBsZXQgbGFzdEZpbGU7XHJcblxyXG4gICAgLy8gbGV0IHZtID0gbmV3IFZpcnR1YWxNYWNoaW5lKCk7XHJcbiAgICAvLyBmb250U2l6ZSBwcm9wZXJ0eSBSZWdleHBcclxuICAgIGNvbnN0IGZvbnRTaXplUmVnZXhwID0gbmV3IFJlZ0V4cChcImZvbnRTaXplXFxcXHMrKFtcXFxcLVxcXFwkXFxcXEAwLTlhLXpBLVpdKylcIiwgXCJpXCIpO1xyXG5cclxuICAgIC8vIGxpbmVIZWlnaHQgcHJvcGVydHkgUmVnZXhwXHJcbiAgICBjb25zdCBsaW5lUmVnZXhwID0gbmV3IFJlZ0V4cChcIihsaW5lSGVpZ2h0fHNwYWNpbmd8bGVhZGluZylcXFxcKCguKj8pXFxcXClcIiwgXCJpXCIpO1xyXG5cclxuICAgIC8vIENvcHkgVmFsdWVzIGZyb20gb2JqZWN0IDIgdG8gb2JqZWN0IDE7XHJcbiAgICBjb25zdCBleHRlbmQgPSAob2JqZWN0MSwgb2JqZWN0MikgPT4ge1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMCwga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdDIpLCBrZXlzU2l6ZSA9IGtleXMubGVuZ3RoOyBpIDwga2V5c1NpemU7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQga2V5ID0ga2V5c1tpXTtcclxuICAgICAgICAgICAgb2JqZWN0MVtrZXldID0gb2JqZWN0MltrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2JqZWN0MTtcclxuICAgIH07XHJcblxyXG4gICAgaWYob3B0aW9ucyAhPSBudWxsKXtcclxuICAgICAgICBleHRlbmQoZ2xvYmFsU2V0dGluZ3MsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRvQ2FtZWxDYXNlID0gKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXlteYS16MC05XSooLiopW15hLXowLTldKiQvLCBcIiQxXCIpLnJlcGxhY2UoL1teYS16MC05XSsoW2EtejAtOV0pL2csIChtYXRjaCwgbGV0dGVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBsZXR0ZXIudG9VcHBlckNhc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICBjb25zdCBpbml0U2V0dGluZ3MgPSAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIEFkZCBmb250U2l6ZXNcclxuICAgICAgICBpZiAoXCJmb250LXNpemVzXCIgaW4gZ2xvYmFsU2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IGdsb2JhbFNldHRpbmdzW1wiZm9udC1zaXplc1wiXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChcImZvbnQtc2l6ZXNcIiBpbiBjdXJyZW50U2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IGN1cnJlbnRGb250U2l6ZXMgKyBcIiwgXCIgKyBjdXJyZW50U2V0dGluZ3NbXCJmb250LXNpemVzXCJdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVG9Mb3dlckNhc2UgQ3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBrZXlzU2l6ZSA9IGdsb2JhbEtleXMubGVuZ3RoOyBpIDwga2V5c1NpemU7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQga2V5ID0gZ2xvYmFsS2V5c1tpXTtcclxuICAgICAgICAgICAgaWYgKGtleSBpbiBjdXJyZW50U2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTZXR0aW5nc1trZXldID0gY3VycmVudFNldHRpbmdzW2tleV0udG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9udFNpemVzQ29sbGVjdGlvbiA9IG5ldyBGb250U2l6ZXMoY3VycmVudFNldHRpbmdzKTtcclxuICAgICAgICByaHl0aG1DYWxjdWxhdG9yID0gbmV3IFZlcnRpY2FsUmh5dGhtKGN1cnJlbnRTZXR0aW5ncyk7XHJcbiAgICAgICAgZm9udFNpemVzQ29sbGVjdGlvbi5hZGRGb250U2l6ZXMoY3VycmVudEZvbnRTaXplcywgcmh5dGhtQ2FsY3VsYXRvcik7XHJcbiAgICAgICAgY3VycmVudFNldHRpbmdzUmVnZXhwID0gbmV3IFJlZ0V4cChcIlxcXFxAKFwiICsgT2JqZWN0LmtleXMoY3VycmVudFNldHRpbmdzKS5qb2luKFwifFwiKS5yZXBsYWNlKC8oXFwtfFxcXykvZywgXCJcXFxcJDFcIikgKyBcIilcIiwgXCJpXCIpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgd2Fsa0RlY2xzID0gKG5vZGUpID0+IHtcclxuICAgICAgICBub2RlLndhbGtEZWNscyhkZWNsID0+IHtcclxuXHJcbiAgICAgICAgICAgIGxldCBmb3VuZDtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgVmFyaWFibGVzIHdpdGggdmFsdWVzXHJcbiAgICAgICAgICAgIHdoaWxlICgoZm91bmQgPSBkZWNsLnZhbHVlLm1hdGNoKGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCkpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFyaWFibGUgPSBmb3VuZFsxXTtcclxuICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoY3VycmVudFNldHRpbmdzUmVnZXhwLCBjdXJyZW50U2V0dGluZ3NbdmFyaWFibGVdKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgRm9udCBTaXplXHJcbiAgICAgICAgICAgIHdoaWxlICgoZm91bmQgPSBkZWNsLnZhbHVlLm1hdGNoKGZvbnRTaXplUmVnZXhwKSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgW2ZvbnRTaXplLCBzaXplVW5pdF0gPSBmb3VuZFsxXS5zcGxpdCgvXFwkL2kpO1xyXG4gICAgICAgICAgICAgICAgc2l6ZVVuaXQgPSAoc2l6ZVVuaXQgIT0gbnVsbCkgPyBzaXplVW5pdC50b0xvd2VyQ2FzZSgpIDogbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgc2l6ZSA9IGZvbnRTaXplc0NvbGxlY3Rpb24uZ2V0U2l6ZShmb250U2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBXcml0ZSBmb250IHNpemVcclxuICAgICAgICAgICAgICAgIGlmIChzaXplVW5pdCAhPSBudWxsICYmIChzaXplVW5pdCA9PSBcImVtXCIgfHwgc2l6ZVVuaXQgPT0gXCJyZW1cIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb250U2l6ZVJlZ2V4cCwgZm9ybWF0VmFsdWUoc2l6ZS5yZWwpICsgc2l6ZVVuaXQpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2l6ZVVuaXQgIT0gbnVsbCAmJiBzaXplVW5pdCA9PSBcInB4XCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb250U2l6ZVJlZ2V4cCwgZm9ybWF0SW50KHNpemUucHgpICsgXCJweFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2ZzaXplID0gKGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0gPT0gXCJweFwiKSA/IGZvcm1hdEludChzaXplLnB4KSA6IGZvcm1hdFZhbHVlKHNpemUucmVsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb250U2l6ZVJlZ2V4cCwgY2ZzaXplICsgY3VycmVudFNldHRpbmdzW1widW5pdFwiXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRqdXN0IEZvbnQgU2l6ZVxyXG4gICAgICAgICAgICBpZiAoZGVjbC5wcm9wID09IFwiYWRqdXN0LWZvbnQtc2l6ZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IFtmb250U2l6ZSwgbGluZXMsIGJhc2VGb250U2l6ZV0gPSBkZWNsLnZhbHVlLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm9udFNpemVVbml0ID0gZm9udFNpemUubWF0Y2goLyhweHxlbXxyZW0pJC9pKVswXS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvbnRTaXplID0gcmh5dGhtQ2FsY3VsYXRvci5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIG51bGwsIGJhc2VGb250U2l6ZSkgKyBjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBmb250U2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IHJoeXRobUNhbGN1bGF0b3IubGluZUhlaWdodChmb250U2l6ZSwgbGluZXMsIGJhc2VGb250U2l6ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHREZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGxpbmVIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBkZWNsLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVjbC5wcm9wID0gXCJmb250LXNpemVcIjtcclxuICAgICAgICAgICAgICAgIGRlY2wucGFyZW50Lmluc2VydEFmdGVyKGRlY2wsIGxpbmVIZWlnaHREZWNsKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gbGluZUhlaWdodCwgc3BhY2luZywgbGVhZGluZ1xyXG4gICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChsaW5lUmVnZXhwKSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBmb3VuZFsxXS50b0xvd2VyQ2FzZSgpOyAvLyBzcGFjaW5nIG9yIGxpbmVIZWlnaHRcclxuICAgICAgICAgICAgICAgIGxldCBwYXJhbWV0ZXJzID0gZm91bmRbMl0uc3BsaXQoL1xccypcXCxcXHMqLyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgcGFyYW1ldGVyc1NpemUgPSBwYXJhbWV0ZXJzLmxlbmd0aDsgaSA8IHBhcmFtZXRlcnNTaXplOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBsZXQgW3ZhbHVlLCBmb250U2l6ZV0gPSBwYXJhbWV0ZXJzW2ldLnNwbGl0KC9cXHMrLyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmb250U2l6ZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2wucGFyZW50LndhbGtEZWNscyhcImZvbnQtc2l6ZVwiLCBmc2RlY2wgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSBmc2RlY2wudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZvbnRTaXplID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSBjdXJyZW50U2V0dGluZ3NbXCJmb250LXNpemVcIl07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkgPT0gXCJsaW5laGVpZ2h0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodCArPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIHZhbHVlKSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkgPT0gXCJzcGFjaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodCArPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIHZhbHVlLCBudWxsLCB0cnVlKSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkgPT0gXCJsZWFkaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodCArPSByaHl0aG1DYWxjdWxhdG9yLmxlYWRpbmcodmFsdWUsIGZvbnRTaXplKSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvdW5kWzBdLCBsaW5lSGVpZ2h0LnJlcGxhY2UoL1xccyskLywgXCJcIikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHJlbSBmYWxsYmFja1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicHgtZmFsbGJhY2tcIl0gPT0gXCJ0cnVlXCIgJiYgZGVjbC52YWx1ZS5tYXRjaCgvWzAtOVxcLl0rcmVtL2kpKSB7XHJcbiAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC5pbnNlcnRCZWZvcmUoZGVjbCwgZGVjbC5jbG9uZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJoeXRobUNhbGN1bGF0b3IucmVtRmFsbGJhY2soZGVjbC52YWx1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBkZWNsLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiAoY3NzKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIEV4dGVuZCBOb2Rlc1xyXG4gICAgICAgIGxldCBleHRlbmROb2RlcyA9IHt9O1xyXG5cclxuICAgICAgICBjc3Mud2Fsayhub2RlID0+IHtcclxuICAgICAgICAgICAgLy8gaWYgKGxhc3RGaWxlICE9IG5vZGUuc291cmNlLmlucHV0LmZpbGUpIHtcclxuICAgICAgICAgICAgLy8gXHRsYXN0RmlsZSA9IG5vZGUuc291cmNlLmlucHV0LmZpbGU7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChub2RlLnR5cGUgPT0gXCJhdHJ1bGVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBydWxlID0gbm9kZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZS5uYW1lID09IFwiaGFtc3RlclwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlLnBhcmFtcyAhPSBcImVuZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCBHbG9iYWwgVmFyaWFibGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUud2Fsa0RlY2xzKGRlY2wgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsU2V0dGluZ3NbZGVjbC5wcm9wXSA9IGRlY2wudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCBmb250U2l6ZXNcclxuICAgICAgICAgICAgICAgICAgICBpZiAoXCJmb250LXNpemVzXCIgaW4gZ2xvYmFsU2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IGdsb2JhbFNldHRpbmdzW1wiZm9udC1zaXplc1wiXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgY3VycmVudCB2YXJpYWJsZXNcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3MgPSBleHRlbmQoe30sIGdsb2JhbFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFNldHRpbmdzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBSdWxlIEhhbXN0ZXJcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lID09IFwiIWhhbXN0ZXJcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL2N1cnJlbnRTZXR0aW5ncyA9IGV4dGVuZCh7fSwgZ2xvYmFsU2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLndhbGtEZWNscyhkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzW2RlY2wucHJvcF0gPSBkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJbml0IGN1cnJlbnQgU2V0dGluZ3NcclxuICAgICAgICAgICAgICAgICAgICBpbml0U2V0dGluZ3MoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcImJhc2VsaW5lXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplID0gcGFyc2VJbnQoY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplXCJdKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYnJvd3NlckZvbnRTaXplID0gcGFyc2VJbnQoY3VycmVudFNldHRpbmdzW1wiYnJvd3Nlci1mb250LXNpemVcIl0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IHJoeXRobUNhbGN1bGF0b3IubGluZUhlaWdodChmb250U2l6ZSArIFwicHhcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGJhc2VsaW5lIGZvbnQgc2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZURlY2wgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicHgtYmFzZWxpbmVcIl0gPT0gXCJ0cnVlXCIgfHwgKGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0gPT0gXCJweFwiICYmIGN1cnJlbnRTZXR0aW5nc1tcImxlZ2FjeS1icm93c2Vyc1wiXSAhPSBcInRydWVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplRGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImZvbnQtc2l6ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZvbnRTaXplICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZWxhdGl2ZVNpemUgPSAxMDAgKiBmb250U2l6ZSAvIGJyb3dzZXJGb250U2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplRGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImZvbnQtc2l6ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZvcm1hdFZhbHVlKHJlbGF0aXZlU2l6ZSkgKyBcIiVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHREZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbGluZUhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGUucGFyYW1zLm1hdGNoKC9cXHMqaHRtbFxccyovKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGh0bWxSdWxlID0gcG9zdGNzcy5ydWxlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcImh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sUnVsZS5hcHBlbmQoZm9udFNpemVEZWNsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbFJ1bGUuYXBwZW5kKGxpbmVIZWlnaHREZWNsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGh0bWxSdWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdID09IFwicHhcIiAmJiBjdXJyZW50U2V0dGluZ3NbXCJsZWdhY3ktYnJvd3NlcnNcIl0gPT0gXCJ0cnVlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhc3Rlcmlza0h0bWxSdWxlID0gcG9zdGNzcy5ydWxlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCIqIGh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdGVyaXNrSHRtbFJ1bGUuYXBwZW5kKGxpbmVIZWlnaHREZWNsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGFzdGVyaXNrSHRtbFJ1bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBsaW5lSGVpZ2h0RGVjbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGZvbnRTaXplRGVjbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1widW5pdFwiXSA9PSBcInJlbVwiICYmIGN1cnJlbnRTZXR0aW5nc1tcInB4LWZhbGxiYWNrXCJdID09IFwidHJ1ZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKGxpbmVIZWlnaHREZWNsLCBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IFwibGluZS1oZWlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmh5dGhtQ2FsY3VsYXRvci5yZW1GYWxsYmFjayhsaW5lSGVpZ2h0KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lID09IFwicnVsZXJcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXJJY29uUG9zaXRpb24gPSBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1pY29uLXBvc2l0aW9uXCJdLnJlcGxhY2UoLyhcXCd8XFxcIikvZywgXCJcIikucmVwbGFjZSgvXFw7L2csIFwiO1xcblwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSAoY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0ubWF0Y2goL3B4JC9pKSkgPyBjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSA6IGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdICsgXCJlbVwiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL2xldCBzdmcgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0ZjgsJTNDc3ZnIHhtbG5zJTNEJTI3aHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTI3IHZpZXdCb3glM0QlMjcwIDAgMjQgMjQlMjclM0UlM0NwYXRoIGZpbGwlM0QlMjd7Y29sb3J9JTI3IGQlM0QlMjdNMTggMjRjLTAuMyAwLTAuNTQ4LTAuMjQ2LTAuNTQ4LTAuNTQ2VjE4YzAtMC4zIDAuMjQ4LTAuNTQ2IDAuNTQ4LTAuNTQ2aDUuNDUyICBDMjMuNzU0IDE3LjQ1NCAyNCAxNy43IDI0IDE4djUuNDU0YzAgMC4zLTAuMjQ2IDAuNTQ2LTAuNTQ4IDAuNTQ2SDE4eiBNOS4yNzEgMjRjLTAuMjk4IDAtMC41NDMtMC4yNDYtMC41NDMtMC41NDZWMTggIGMwLTAuMyAwLjI0NS0wLjU0NiAwLjU0My0wLjU0Nmg1LjQ1N2MwLjMgMCAwLjU0MyAwLjI0NiAwLjU0MyAwLjU0NnY1LjQ1NGMwIDAuMy0wLjI0MyAwLjU0Ni0wLjU0MyAwLjU0Nkg5LjI3MXogTTAuNTQ4IDI0ICBDMC4yNDYgMjQgMCAyMy43NTQgMCAyMy40NTRWMThjMC0wLjMgMC4yNDYtMC41NDYgMC41NDgtMC41NDZINmMwLjMwMiAwIDAuNTQ4IDAuMjQ2IDAuNTQ4IDAuNTQ2djUuNDU0QzYuNTQ4IDIzLjc1NCA2LjMwMiAyNCA2IDI0ICBIMC41NDh6IE0xOCAxNS4yNzFjLTAuMyAwLTAuNTQ4LTAuMjQ0LTAuNTQ4LTAuNTQyVjkuMjcyYzAtMC4yOTkgMC4yNDgtMC41NDUgMC41NDgtMC41NDVoNS40NTJDMjMuNzU0IDguNzI3IDI0IDguOTczIDI0IDkuMjcyICB2NS40NTdjMCAwLjI5OC0wLjI0NiAwLjU0Mi0wLjU0OCAwLjU0MkgxOHogTTkuMjcxIDE1LjI3MWMtMC4yOTggMC0wLjU0My0wLjI0NC0wLjU0My0wLjU0MlY5LjI3MmMwLTAuMjk5IDAuMjQ1LTAuNTQ1IDAuNTQzLTAuNTQ1ICBoNS40NTdjMC4zIDAgMC41NDMgMC4yNDYgMC41NDMgMC41NDV2NS40NTdjMCAwLjI5OC0wLjI0MyAwLjU0Mi0wLjU0MyAwLjU0Mkg5LjI3MXogTTAuNTQ4IDE1LjI3MUMwLjI0NiAxNS4yNzEgMCAxNS4wMjYgMCAxNC43MjkgIFY5LjI3MmMwLTAuMjk5IDAuMjQ2LTAuNTQ1IDAuNTQ4LTAuNTQ1SDZjMC4zMDIgMCAwLjU0OCAwLjI0NiAwLjU0OCAwLjU0NXY1LjQ1N2MwIDAuMjk4LTAuMjQ2IDAuNTQyLTAuNTQ4IDAuNTQySDAuNTQ4eiBNMTggNi41NDUgIGMtMC4zIDAtMC41NDgtMC4yNDUtMC41NDgtMC41NDVWMC41NDVDMTcuNDUyIDAuMjQ1IDE3LjcgMCAxOCAwaDUuNDUyQzIzLjc1NCAwIDI0IDAuMjQ1IDI0IDAuNTQ1VjZjMCAwLjMtMC4yNDYgMC41NDUtMC41NDggMC41NDUgIEgxOHogTTkuMjcxIDYuNTQ1QzguOTc0IDYuNTQ1IDguNzI5IDYuMyA4LjcyOSA2VjAuNTQ1QzguNzI5IDAuMjQ1IDguOTc0IDAgOS4yNzEgMGg1LjQ1N2MwLjMgMCAwLjU0MyAwLjI0NSAwLjU0MyAwLjU0NVY2ICBjMCAwLjMtMC4yNDMgMC41NDUtMC41NDMgMC41NDVIOS4yNzF6IE0wLjU0OCA2LjU0NUMwLjI0NiA2LjU0NSAwIDYuMyAwIDZWMC41NDVDMCAwLjI0NSAwLjI0NiAwIDAuNTQ4IDBINiAgYzAuMzAyIDAgMC41NDggMC4yNDUgMC41NDggMC41NDVWNmMwIDAuMy0wLjI0NiAwLjU0NS0wLjU0OCAwLjU0NUgwLjU0OHolMjclMkYlM0UlM0MlMkZzdmclM0VcIjtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGY4LCUzQ3N2ZyB4bWxucyUzRCUyN2h0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyNyB2aWV3Qm94JTNEJTI3MCAwIDI0IDI0JTI3JTNFJTNDcGF0aCBmaWxsJTNEJTI3e2NvbG9yfSUyNyBkJTNEJTI3TTAsNmMwLDAuMzAxLDAuMjQ2LDAuNTQ1LDAuNTQ5LDAuNTQ1aDIyLjkwNkMyMy43NTYsNi41NDUsMjQsNi4zMDEsMjQsNlYyLjczYzAtMC4zMDUtMC4yNDQtMC41NDktMC41NDUtMC41NDlIMC41NDkgIEMwLjI0NiwyLjE4MiwwLDIuNDI2LDAsMi43M1Y2eiBNMCwxMy42MzdjMCwwLjI5NywwLjI0NiwwLjU0NSwwLjU0OSwwLjU0NWgyMi45MDZjMC4zMDEsMCwwLjU0NS0wLjI0OCwwLjU0NS0wLjU0NXYtMy4yNzMgIGMwLTAuMjk3LTAuMjQ0LTAuNTQ1LTAuNTQ1LTAuNTQ1SDAuNTQ5QzAuMjQ2LDkuODE4LDAsMTAuMDY2LDAsMTAuMzYzVjEzLjYzN3ogTTAsMjEuMjdjMCwwLjMwNSwwLjI0NiwwLjU0OSwwLjU0OSwwLjU0OWgyMi45MDYgIGMwLjMwMSwwLDAuNTQ1LTAuMjQ0LDAuNTQ1LTAuNTQ5VjE4YzAtMC4zMDEtMC4yNDQtMC41NDUtMC41NDUtMC41NDVIMC41NDlDMC4yNDYsMTcuNDU1LDAsMTcuNjk5LDAsMThWMjEuMjd6JTI3JTJGJTNFJTNDJTJGc3ZnJTNFXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGY4LCUzQ3N2ZyB4bWxucyUzRCUyN2h0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyNyB2aWV3Qm94JTNEJTI3MCAwIDMyIDMyJTI3JTNFJTNDcGF0aCBmaWxsJTNEJTI3e2NvbG9yfSUyNyBkJTNEJTI3TTI4LDIwaC00di04aDRjMS4xMDQsMCwyLTAuODk2LDItMnMtMC44OTYtMi0yLTJoLTRWNGMwLTEuMTA0LTAuODk2LTItMi0ycy0yLDAuODk2LTIsMnY0aC04VjRjMC0xLjEwNC0wLjg5Ni0yLTItMiAgUzgsMi44OTYsOCw0djRINGMtMS4xMDQsMC0yLDAuODk2LTIsMnMwLjg5NiwyLDIsMmg0djhINGMtMS4xMDQsMC0yLDAuODk2LTIsMnMwLjg5NiwyLDIsMmg0djRjMCwxLjEwNCwwLjg5NiwyLDIsMnMyLTAuODk2LDItMnYtNCAgaDh2NGMwLDEuMTA0LDAuODk2LDIsMiwyczItMC44OTYsMi0ydi00aDRjMS4xMDQsMCwyLTAuODk2LDItMlMyOS4xMDQsMjAsMjgsMjB6IE0xMiwyMHYtOGg4djhIMTJ6JTI3JTJGJTNFJTNDJTJGc3ZnJTNFXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGd0aGlja25lc3MgPSBwYXJzZUZsb2F0KGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLXRoaWNrbmVzc1wiXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBiYWNrZ3JvdW5kID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWJhY2tncm91bmRcIl0gPT0gXCJwbmdcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlSGVpZ2h0ID0gKGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdLm1hdGNoKC9weCQvKSkgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0pIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwYXJzZUZsb2F0KGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdKSAqIHBhcnNlRmxvYXQoY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplXCJdKSkudG9GaXhlZCgwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhdHRlcm4gPSBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1wYXR0ZXJuXCJdLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZSA9IG5ldyBQbmdJbWFnZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5ydWxlck1hdHJpeChpbWFnZUhlaWdodCwgY3VycmVudFNldHRpbmdzW1wicnVsZXItY29sb3JcIl0sIHBhdHRlcm4sIGd0aGlja25lc3MsIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLXNjYWxlXCJdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLW91dHB1dFwiXSAhPSBcImJhc2U2NFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5nZXRGaWxlKGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLW91dHB1dFwiXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIi4uL1wiICsgY3VycmVudFNldHRpbmdzW1wicnVsZXItb3V0cHV0XCJdICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXBvc2l0aW9uOiBsZWZ0IHRvcDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXJlcGVhdDogcmVwZWF0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtc2l6ZTogXCIgKyBwYXR0ZXJuLmxlbmd0aCArIFwicHggXCIgKyBpbWFnZUhlaWdodCArIFwicHg7XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsXCIgKyBpbWFnZS5nZXRCYXNlNjQoKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1wb3NpdGlvbjogbGVmdCB0b3A7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1yZXBlYXQ6IHJlcGVhdDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXNpemU6IFwiICsgcGF0dGVybi5sZW5ndGggKyBcInB4IFwiICsgaW1hZ2VIZWlnaHQgKyBcInB4O1wiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3RoaWNrbmVzcyA9IGd0aGlja25lc3MgKiAzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KHRvIHRvcCwgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzW1wicnVsZXItY29sb3JcIl0gKyBcIiBcIiArIGd0aGlja25lc3MgKyBcIiUsIHRyYW5zcGFyZW50IFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGd0aGlja25lc3MgKyBcIiUpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1zaXplOiAxMDAlIFwiICsgbGluZUhlaWdodCArIFwiO1wiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVyID0gXCJwb3NpdGlvbjogYWJzb2x1dGU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImxlZnQ6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcDogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJwYWRkaW5nOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWR0aDogMTAwJTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0OiAxMDAlO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ6LWluZGV4OiA5OTAwO1wiICsgYmFja2dyb3VuZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGljb25TaXplID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItaWNvbi1zaXplXCJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgW3N0eWxlLCBydWxlckNsYXNzXSA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLXN0eWxlXCJdLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFtjb2xvciwgaG92ZXJDb2xvcl0gPSBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1pY29uLWNvbG9yc1wiXS5zcGxpdCgvXFxzKy8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXJSdWxlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0eWxlID09IFwic3dpdGNoXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCIuXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5OiBub25lO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl0ge1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTpub25lO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl0gKyBsYWJlbCB7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ6LWluZGV4OiA5OTk5O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTogaW5saW5lLWJsb2NrO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb246IGFic29sdXRlO1wiICsgcnVsZXJJY29uUG9zaXRpb24gK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYWRkaW5nOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGg6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY3Vyc29yOiBwb2ludGVyO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdmcucmVwbGFjZSgvXFx7Y29sb3JcXH0vLCBlc2NhcGUoY29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgKyBydWxlckNsYXNzICsgXCJcXFwiXTpjaGVja2VkICsgbGFiZWwsIGlucHV0W2lkPVxcXCJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlckNsYXNzICsgXCJcXFwiXTpob3ZlciArIGxhYmVsIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgKyBzdmcucmVwbGFjZSgvXFx7Y29sb3JcXH0vLCBlc2NhcGUoaG92ZXJDb2xvcikpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlckNsYXNzICsgXCJcXFwiXTpjaGVja2VkIH4gLlwiICsgcnVsZXJDbGFzcyArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTogYmxvY2s7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0eWxlID09IFwiaG92ZXJcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJSdWxlID0gcG9zdGNzcy5wYXJzZShcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlckljb25Qb3NpdGlvbiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hcmdpbjogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmc6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWR0aDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0OiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIlwiICsgc3ZnLnJlcGxhY2UoL1xce2NvbG9yXFx9LywgZXNjYXBlKGNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHJhbnNpdGlvbjogYmFja2dyb3VuZC1pbWFnZSAwLjVzIGVhc2UtaW4tb3V0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLlwiICsgcnVsZXJDbGFzcyArIFwiOmhvdmVyXCIgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnNvcjogcG9pbnRlcjtcIiArIHJ1bGVyICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdHlsZSA9PSBcImFsd2F5c1wiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1xcblwiICsgcnVsZXIgKyBcIn1cXG5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGVyUnVsZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyUnVsZS5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJ1bGUsIHJ1bGVyUnVsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUubWF0Y2goL14oZWxsaXBzaXN8bm93cmFwfGZvcmNld3JhcHxoeXBoZW5zfGJyZWFrXFwtd29yZCkkL2kpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9wZXJ0eSA9IHJ1bGUubmFtZS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVjbHMgPSBoZWxwZXJzW3Byb3BlcnR5XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5ID09IFwiaHlwaGVuc1wiICYmIHJ1bGUucGFyYW1zID09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xzID0gaGVscGVyc1tcImJyZWFrLXdvcmRcIl0gKyBkZWNscztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5ID09IFwiZWxsaXBzaXNcIiAmJiBydWxlLnBhcmFtcyA9PSBcInRydWVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNscyA9IGhlbHBlcnNbXCJub3dyYXBcIl0gKyBkZWNscztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJwcm9wZXJ0aWVzXCJdID09IFwiaW5saW5lXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpZGVjbHMgPSBwb3N0Y3NzLnBhcnNlKGRlY2xzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJ1bGUsIGlkZWNscyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFNldHRpbmdzW1wicHJvcGVydGllc1wiXSA9PSBcImV4dGVuZFwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXh0ZW5kTmFtZSA9IHRvQ2FtZWxDYXNlKHByb3BlcnR5ICsgXCIgXCIgKyBydWxlLnBhcmFtcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0gPT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgZXh0ZW5kIGluZm9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBydWxlLnBhcmVudC5zZWxlY3RvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsczogZGVjbHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50czogW3J1bGUucGFyZW50XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2OiBydWxlLnByZXYoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0FwcGVuZCBzZWxlY3RvciBhbmQgdXBkYXRlIGNvdW50ZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLnNlbGVjdG9yID0gZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0uc2VsZWN0b3IgKyBcIiwgXCIgKyBydWxlLnBhcmVudC5zZWxlY3RvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLnBhcmVudHMucHVzaChydWxlLnBhcmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5jb3VudCsrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZS5tYXRjaCgvXihyZXNldHxub3JtYWxpemUpJC9pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9wZXJ0eSA9IHJ1bGUubmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBydWxlcyA9IHBvc3Rjc3MucGFyc2UoaGVscGVyc1twcm9wZXJ0eV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGVzLnNvdXJjZSA9IHJ1bGUuc291cmNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIHJ1bGVzKTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gV2FsayBpbiBtZWRpYSBxdWVyaWVzXHJcbiAgICAgICAgICAgICAgICBub2RlLndhbGsoY2hpbGQgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQudHlwZSA9PSBcInJ1bGVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXYWxrIGRlY2xzIGluIHJ1bGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2Fsa0RlY2xzKGNoaWxkKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBlbHNlIGlmIChydWxlLm5hbWUgPT0gXCJqc1wiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGxldCBqY3NzID0gcnVsZS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIC8vIGxldCBjb2RlID0gamNzcy5yZXBsYWNlKC9cXEBqc1xccypcXHsoW1xcc1xcU10rKVxcfSQvaSwgXCIkMVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coamNzcyk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgLy8gcnVsZXJSdWxlLnNvdXJjZSA9IHJ1bGUuc291cmNlO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIC8vIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBydWxlclJ1bGUpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIHJ1bGUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PSBcInJ1bGVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFdhbGsgZGVjbHMgaW4gcnVsZVxyXG4gICAgICAgICAgICAgICAgd2Fsa0RlY2xzKG5vZGUpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50U2V0dGluZ3NbXCJyZW1vdmUtY29tbWVudHNcIl0gPT0gXCJ0cnVlXCIgJiYgbm9kZS50eXBlID09IFwiY29tbWVudFwiKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBBcHBlbmQgRXh0ZW5kcyB0byBDU1NcclxuICAgICAgICBmb3IgKGxldCBpID0gMCwga2V5cyA9IE9iamVjdC5rZXlzKGV4dGVuZE5vZGVzKSwga2V5c1NpemUgPSBrZXlzLmxlbmd0aDsgaSA8IGtleXNTaXplOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGtleSA9IGtleXNbaV07XHJcbiAgICAgICAgICAgIGlmIChleHRlbmROb2Rlc1trZXldLmNvdW50ID4gMSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJ1bGUgPSBwb3N0Y3NzLnBhcnNlKGV4dGVuZE5vZGVzW2tleV0uc2VsZWN0b3IgKyBcIntcIiArIGV4dGVuZE5vZGVzW2tleV0uZGVjbHMgKyBcIn1cIik7XHJcbiAgICAgICAgICAgICAgICBydWxlLnNvdXJjZSA9IGV4dGVuZE5vZGVzW2tleV0uc291cmNlO1xyXG5cclxuICAgICAgICAgICAgICAgIGNzcy5pbnNlcnRCZWZvcmUoZXh0ZW5kTm9kZXNba2V5XS5wYXJlbnRzWzBdLCBydWxlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGVjbHMgPSBwb3N0Y3NzLnBhcnNlKGV4dGVuZE5vZGVzW2tleV0uZGVjbHMpO1xyXG4gICAgICAgICAgICAgICAgZGVjbHMuc291cmNlID0gZXh0ZW5kTm9kZXNba2V5XS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1trZXldLnBhcmVudHNbMF0uaW5zZXJ0QWZ0ZXIoZXh0ZW5kTm9kZXNba2V5XS5wcmV2LCBkZWNscyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB1bnVzZWQgcGFyZW50IG5vZGVzLlxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMCwgcGFyZW50cyA9IGV4dGVuZE5vZGVzW2tleV0ucGFyZW50cy5sZW5ndGg7IGogPCBwYXJlbnRzOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChleHRlbmROb2Rlc1trZXldLnBhcmVudHNbal0ubm9kZXMubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1trZXldLnBhcmVudHNbal0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH07XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBoYW1zdGVyOyJdfQ==
