"use strict";

exports.__esModule = true;

var _FontSizes = require("./FontSizes");

var _FontSizes2 = _interopRequireDefault(_FontSizes);

var _Helpers = require("./Helpers");

var _VerticalRhythm = require("./VerticalRhythm");

var _VerticalRhythm2 = _interopRequireDefault(_VerticalRhythm);

var _PngImage = require("./PngImage");

var _PngImage2 = _interopRequireDefault(_PngImage);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _postcss = require("postcss");

var _postcss2 = _interopRequireDefault(_postcss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    var fontSizeRegexp = /fontSize\s+([\-\$\@0-9a-zA-Z]+)/i;

    // rhythm functions Regexp
    var rhythmRegexp = /(lineHeight|spacing|leading|\!rhythm|rhythm)\((.*?)\)/i;

    // properties regexp
    var propertiesRegexp = /^(ellipsis|nowrap|forcewrap|hyphens|break\-word)$/i;

    // Comma split regexp
    var commaSplitRegexp = /\s*\,\s*/;

    // Space split regexp
    var spaceSplitRegexp = /\s+/;

    // Copy Values from object 2 to object 1;
    var extend = function extend(object1, object2) {

        for (var key in object2) {
            // if(object2.hasOwnProperty(key)){
            object1[key] = object2[key];
            // }
        }

        return object1;
    };

    if (options != null) {
        extend(globalSettings, options);
    }

    var beforeAfterWordRegexp = /^[^a-z0-9]*(.*)[^a-z0-9]*$/;
    var camelRegexp = /[^a-z0-9]+([a-z0-9])/g;

    var toCamelCase = function toCamelCase(value) {
        return value.toLowerCase().replace(beforeAfterWordRegexp, "$1").replace(camelRegexp, function (match, letter) {
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
        for (var key in globalKeys) {
            if (key in currentSettings) {
                currentSettings[key] = currentSettings[key].toLowerCase();
            }
        }

        fontSizesCollection = new _FontSizes2.default(currentSettings);
        rhythmCalculator = new _VerticalRhythm2.default(currentSettings);
        fontSizesCollection.addFontSizes(currentFontSizes, rhythmCalculator);
        var settingsKeys = Object.keys(currentSettings);
        var settingsKeysString = settingsKeys.join("|").replace(/(\-|\_)/g, "\\$1");
        currentSettingsRegexp = new RegExp("\\@(" + settingsKeysString + ")", "i");
    };

    var walkDecls = function walkDecls(node) {
        node.walkDecls(function (decl) {

            var found = void 0;
            var ruleFontSize = void 0;

            var findRuleFontSize = function findRuleFontSize() {
                if (ruleFontSize == null) {
                    decl.parent.walkDecls("font-size", function (fsdecl) {
                        ruleFontSize = fsdecl.value;
                    });
                }
            };

            if (decl.value) {

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

                    sizeUnit = sizeUnit ? (0, _Helpers.getUnit)(sizeUnit) : 0;
                    var size = fontSizesCollection.getSize(fontSize);
                    // Write font size
                    if (sizeUnit === _Helpers.UNIT.EM || sizeUnit == _Helpers.UNIT.REM) {

                        decl.value = decl.value.replace(fontSizeRegexp, (0, _Helpers.formatValue)(size.rel) + sizeUnit);
                    } else if (sizeUnit === _Helpers.UNIT.PX) {

                        decl.value = decl.value.replace(fontSizeRegexp, (0, _Helpers.formatInt)(size.px) + "px");
                    } else {

                        var cfsize = currentSettings["unit"] === "px" ? (0, _Helpers.formatInt)(size.px) : (0, _Helpers.formatValue)(size.rel);

                        decl.value = decl.value.replace(fontSizeRegexp, cfsize + currentSettings["unit"]);
                    }
                }

                // Adjust Font Size
                if (decl.prop === "adjust-font-size") {
                    var _decl$value$split = decl.value.split(spaceSplitRegexp),
                        fontSize = _decl$value$split[0],
                        lines = _decl$value$split[1],
                        baseFontSize = _decl$value$split[2];

                    var fontSizeUnit = (0, _Helpers.getUnit)(fontSize);
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
                    var parameters = found[2].split(commaSplitRegexp);
                    var outputValue = "";

                    for (var i in parameters) {
                        var _parameters$i$split = parameters[i].split(spaceSplitRegexp),
                            value = _parameters$i$split[0],
                            _fontSize = _parameters$i$split[1];

                        if (!_fontSize) {
                            findRuleFontSize();
                            _fontSize = ruleFontSize;
                        }

                        if (property === "lineheight") {
                            outputValue += rhythmCalculator.lineHeight(_fontSize, value) + " ";
                        } else if (property === "spacing") {
                            outputValue += rhythmCalculator.lineHeight(_fontSize, value, null, true) + " ";
                        } else if (property === "leading") {
                            outputValue += rhythmCalculator.leading(value, _fontSize) + " ";
                        } else if (property === "!rhythm") {
                            var _value$split = value.split(/\$/),
                                inValue = _value$split[0],
                                outputUnit = _value$split[1];

                            outputUnit = _Helpers.UNIT[outputUnit];
                            outputValue += rhythmCalculator.rhythm(inValue, _fontSize, true, outputUnit) + " ";
                        } else if (property === "rhythm") {
                            var _value$split2 = value.split(/\$/),
                                _inValue = _value$split2[0],
                                _outputUnit = _value$split2[1];

                            _outputUnit = _Helpers.UNIT[_outputUnit];
                            outputValue += rhythmCalculator.rhythm(_inValue, _fontSize, false, _outputUnit) + " ";
                        }
                    }
                    decl.value = decl.value.replace(found[0], outputValue.replace(/\s+$/, ""));
                }

                // rem fallback
                if (currentSettings["px-fallback"] === "true" && decl.value.match(_Helpers.remRegexp)) {
                    decl.parent.insertBefore(decl, decl.clone({
                        value: rhythmCalculator.remFallback(decl.value),
                        source: decl.source
                    }));
                }
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

            if (node.type === "atrule") {

                var rule = node;

                if (rule.name === "hamster") {

                    if (rule.params !== "end") {
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
                } else if (rule.name === "!hamster") {

                    //currentSettings = extend({}, globalSettings);

                    rule.walkDecls(function (decl) {
                        currentSettings[decl.prop] = decl.value;
                    });

                    // Init current Settings
                    initSettings();

                    rule.remove();
                } else if (rule.name === "baseline") {

                    var fontSize = parseInt(currentSettings["font-size"]);
                    var browserFontSize = parseInt(currentSettings["browser-font-size"]);

                    var lineHeight = rhythmCalculator.lineHeight(fontSize + "px");

                    // baseline font size
                    var fontSizeDecl = null;

                    if (currentSettings["px-baseline"] === "true" || currentSettings["unit"] === "px" && currentSettings["legacy-browsers"] !== "true") {

                        fontSizeDecl = _postcss2.default.decl({
                            prop: "font-size",
                            value: fontSize + "px",
                            source: rule.source
                        });
                    } else {

                        var relativeSize = 100 * fontSize / browserFontSize;

                        fontSizeDecl = _postcss2.default.decl({
                            prop: "font-size",
                            value: (0, _Helpers.formatValue)(relativeSize) + "%",
                            source: rule.source
                        });
                    }

                    var lineHeightDecl = _postcss2.default.decl({
                        prop: "line-height",
                        value: lineHeight,
                        source: rule.source
                    });

                    if ((0, _Helpers.isHas)(rule.params, "html")) {

                        var htmlRule = _postcss2.default.rule({
                            selector: "html",
                            source: rule.source
                        });

                        htmlRule.append(fontSizeDecl);
                        htmlRule.append(lineHeightDecl);

                        rule.parent.insertAfter(rule, htmlRule);

                        if (currentSettings["unit"] === "px" && currentSettings["legacy-browsers"] === "true") {
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

                        if (currentSettings["unit"] === "rem" && currentSettings["px-fallback"] === "true") {

                            rule.parent.insertBefore(lineHeightDecl, _postcss2.default.decl({
                                prop: "line-height",
                                value: rhythmCalculator.remFallback(lineHeight),
                                source: rule.source
                            }));
                        }
                    }

                    rule.remove();
                } else if (rule.name === "ruler") {

                    var rulerIconPosition = currentSettings["ruler-icon-position"].replace(/(\'|\")/g, "").replace(/\;/g, ";\n");

                    var _lineHeight = (0, _Helpers.isHas)(currentSettings["line-height"], "px") ? currentSettings["line-height"] : currentSettings["line-height"] + "em";

                    //let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M18 24c-0.3 0-0.548-0.246-0.548-0.546V18c0-0.3 0.248-0.546 0.548-0.546h5.452  C23.754 17.454 24 17.7 24 18v5.454c0 0.3-0.246 0.546-0.548 0.546H18z M9.271 24c-0.298 0-0.543-0.246-0.543-0.546V18  c0-0.3 0.245-0.546 0.543-0.546h5.457c0.3 0 0.543 0.246 0.543 0.546v5.454c0 0.3-0.243 0.546-0.543 0.546H9.271z M0.548 24  C0.246 24 0 23.754 0 23.454V18c0-0.3 0.246-0.546 0.548-0.546H6c0.302 0 0.548 0.246 0.548 0.546v5.454C6.548 23.754 6.302 24 6 24  H0.548z M18 15.271c-0.3 0-0.548-0.244-0.548-0.542V9.272c0-0.299 0.248-0.545 0.548-0.545h5.452C23.754 8.727 24 8.973 24 9.272  v5.457c0 0.298-0.246 0.542-0.548 0.542H18z M9.271 15.271c-0.298 0-0.543-0.244-0.543-0.542V9.272c0-0.299 0.245-0.545 0.543-0.545  h5.457c0.3 0 0.543 0.246 0.543 0.545v5.457c0 0.298-0.243 0.542-0.543 0.542H9.271z M0.548 15.271C0.246 15.271 0 15.026 0 14.729  V9.272c0-0.299 0.246-0.545 0.548-0.545H6c0.302 0 0.548 0.246 0.548 0.545v5.457c0 0.298-0.246 0.542-0.548 0.542H0.548z M18 6.545  c-0.3 0-0.548-0.245-0.548-0.545V0.545C17.452 0.245 17.7 0 18 0h5.452C23.754 0 24 0.245 24 0.545V6c0 0.3-0.246 0.545-0.548 0.545  H18z M9.271 6.545C8.974 6.545 8.729 6.3 8.729 6V0.545C8.729 0.245 8.974 0 9.271 0h5.457c0.3 0 0.543 0.245 0.543 0.545V6  c0 0.3-0.243 0.545-0.543 0.545H9.271z M0.548 6.545C0.246 6.545 0 6.3 0 6V0.545C0 0.245 0.246 0 0.548 0H6  c0.302 0 0.548 0.245 0.548 0.545V6c0 0.3-0.246 0.545-0.548 0.545H0.548z%27%2F%3E%3C%2Fsvg%3E";
                    var svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M0,6c0,0.301,0.246,0.545,0.549,0.545h22.906C23.756,6.545,24,6.301,24,6V2.73c0-0.305-0.244-0.549-0.545-0.549H0.549  C0.246,2.182,0,2.426,0,2.73V6z M0,13.637c0,0.297,0.246,0.545,0.549,0.545h22.906c0.301,0,0.545-0.248,0.545-0.545v-3.273  c0-0.297-0.244-0.545-0.545-0.545H0.549C0.246,9.818,0,10.066,0,10.363V13.637z M0,21.27c0,0.305,0.246,0.549,0.549,0.549h22.906  c0.301,0,0.545-0.244,0.545-0.549V18c0-0.301-0.244-0.545-0.545-0.545H0.549C0.246,17.455,0,17.699,0,18V21.27z%27%2F%3E%3C%2Fsvg%3E";
                    //let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 32 32%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M28,20h-4v-8h4c1.104,0,2-0.896,2-2s-0.896-2-2-2h-4V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v4h-8V4c0-1.104-0.896-2-2-2  S8,2.896,8,4v4H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h4v8H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h4v4c0,1.104,0.896,2,2,2s2-0.896,2-2v-4  h8v4c0,1.104,0.896,2,2,2s2-0.896,2-2v-4h4c1.104,0,2-0.896,2-2S29.104,20,28,20z M12,20v-8h8v8H12z%27%2F%3E%3C%2Fsvg%3E";
                    var gthickness = parseFloat(currentSettings["ruler-thickness"]);

                    var background = "";

                    if (currentSettings["ruler-background"] === "png") {

                        var imageHeight = (0, _Helpers.isHas)(currentSettings["line-height"], "px") ? parseInt(currentSettings["line-height"]) : (parseFloat(currentSettings["line-height"]) * parseFloat(currentSettings["font-size"])).toFixed(0);

                        var pattern = currentSettings["ruler-pattern"].split(spaceSplitRegexp);

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

                    var _currentSettings$rule = currentSettings["ruler-style"].split(spaceSplitRegexp),
                        style = _currentSettings$rule[0],
                        rulerClass = _currentSettings$rule[1];

                    var _currentSettings$rule2 = currentSettings["ruler-icon-colors"].split(spaceSplitRegexp),
                        color = _currentSettings$rule2[0],
                        hoverColor = _currentSettings$rule2[1];

                    var rulerRule = null;

                    if (style === "switch") {

                        rulerRule = _postcss2.default.parse("." + rulerClass + "{" + "display: none;" + ruler + "}" + "input[id=\"" + rulerClass + "\"] {" + "display:none;" + "}" + "input[id=\"" + rulerClass + "\"] + label {" + "z-index: 9999;" + "display: inline-block;" + rulerIconPosition + "margin: 0;" + "padding: 0;" + "width: " + iconSize + ";" + "height: " + iconSize + ";" + "cursor: pointer;" + "background-image: url(\"" + svg.replace(/\{color\}/, escape(color)) + "\");" + "}" + "input[id=\"" + rulerClass + "\"]:checked + label, input[id=\"" + rulerClass + "\"]:hover + label {" + "background-image: url(\"" + svg.replace(/\{color\}/, escape(hoverColor)) + "\");" + "}" + "input[id=\"" + rulerClass + "\"]:checked ~ ." + rulerClass + "{" + "display: block;" + "}");
                    } else if (style === "hover") {

                        rulerRule = _postcss2.default.parse("." + rulerClass + "{" + rulerIconPosition + "margin: 0;" + "padding: 0;" + "width: " + iconSize + ";" + "height: " + iconSize + ";" + "background-image: url(\"" + svg.replace(/\{color\}/, escape(color)) + "\");" + "transition: background-image 0.5s ease-in-out;" + "}" + "." + rulerClass + ":hover" + "{" + "cursor: pointer;" + ruler + "}");
                    } else if (style === "always") {

                        rulerRule = _postcss2.default.parse("." + rulerClass + "{\n" + ruler + "}\n");
                    }

                    if (rulerRule) {
                        rulerRule.source = rule.source;
                        rule.parent.insertBefore(rule, rulerRule);
                    }

                    rule.remove();
                } else if (rule.name.match(propertiesRegexp)) {

                    var property = rule.name.toLowerCase();

                    var decls = helpers[property];

                    if (property === "hyphens" && rule.params === "true") {
                        decls = helpers["break-word"] + decls;
                    } else if (property === "ellipsis" && rule.params === "true") {
                        decls = helpers["nowrap"] + decls;
                    }

                    if (currentSettings["properties"] === "inline") {

                        var idecls = _postcss2.default.parse(decls);
                        rule.parent.insertBefore(rule, idecls);
                    } else {

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

                    if (child.type === "rule") {
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
            } else if (node.type === "rule") {

                // Walk decls in rule
                walkDecls(node);
            } else if (currentSettings["remove-comments"] === "true" && node.type === "comment") {
                node.remove();
            }
        });

        // Append Extends to CSS
        for (var key in extendNodes) {

            var node = extendNodes[key];

            if (node.count > 1) {
                var rule = _postcss2.default.parse(node.selector + "{" + node.decls + "}");
                rule.source = node.source;

                node.parents[0].parent.insertBefore(node.parents[0], rule);
            } else {
                var decls = _postcss2.default.parse(node.decls);
                decls.source = node.source;
                node.parents[0].insertAfter(node.prev, decls);
            }

            // Remove unused parent nodes.
            for (var i in node.parents) {
                if (node.parents[i].nodes.length == 0) {
                    node.parents[i].remove();
                }
            }
        }
    };
};
// import VirtualMachine from "./VirtualMachine";

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

exports.default = hamster;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhhbXN0ZXIiLCJvcHRpb25zIiwiZ2xvYmFsU2V0dGluZ3MiLCJnbG9iYWxLZXlzIiwiaGVscGVycyIsInJlYWRGaWxlU3luYyIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJjdXJyZW50U2V0dGluZ3MiLCJjdXJyZW50U2V0dGluZ3NSZWdleHAiLCJjdXJyZW50Rm9udFNpemVzIiwiZm9udFNpemVzQ29sbGVjdGlvbiIsInJoeXRobUNhbGN1bGF0b3IiLCJmb250U2l6ZVJlZ2V4cCIsInJoeXRobVJlZ2V4cCIsInByb3BlcnRpZXNSZWdleHAiLCJjb21tYVNwbGl0UmVnZXhwIiwic3BhY2VTcGxpdFJlZ2V4cCIsImV4dGVuZCIsIm9iamVjdDEiLCJvYmplY3QyIiwia2V5IiwiYmVmb3JlQWZ0ZXJXb3JkUmVnZXhwIiwiY2FtZWxSZWdleHAiLCJ0b0NhbWVsQ2FzZSIsInZhbHVlIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwibWF0Y2giLCJsZXR0ZXIiLCJ0b1VwcGVyQ2FzZSIsImluaXRTZXR0aW5ncyIsImFkZEZvbnRTaXplcyIsInNldHRpbmdzS2V5cyIsIk9iamVjdCIsImtleXMiLCJzZXR0aW5nc0tleXNTdHJpbmciLCJqb2luIiwiUmVnRXhwIiwid2Fsa0RlY2xzIiwibm9kZSIsImZvdW5kIiwicnVsZUZvbnRTaXplIiwiZmluZFJ1bGVGb250U2l6ZSIsImRlY2wiLCJwYXJlbnQiLCJmc2RlY2wiLCJ2YXJpYWJsZSIsInNwbGl0IiwiZm9udFNpemUiLCJzaXplVW5pdCIsInNpemUiLCJnZXRTaXplIiwiRU0iLCJSRU0iLCJyZWwiLCJQWCIsInB4IiwiY2ZzaXplIiwicHJvcCIsImxpbmVzIiwiYmFzZUZvbnRTaXplIiwiZm9udFNpemVVbml0IiwiY29udmVydCIsImxpbmVIZWlnaHQiLCJsaW5lSGVpZ2h0RGVjbCIsInNvdXJjZSIsImluc2VydEFmdGVyIiwicHJvcGVydHkiLCJwYXJhbWV0ZXJzIiwib3V0cHV0VmFsdWUiLCJpIiwibGVhZGluZyIsImluVmFsdWUiLCJvdXRwdXRVbml0Iiwicmh5dGhtIiwiaW5zZXJ0QmVmb3JlIiwiY2xvbmUiLCJyZW1GYWxsYmFjayIsImNzcyIsImV4dGVuZE5vZGVzIiwid2FsayIsInR5cGUiLCJydWxlIiwibmFtZSIsInBhcmFtcyIsInJlbW92ZSIsInBhcnNlSW50IiwiYnJvd3NlckZvbnRTaXplIiwiZm9udFNpemVEZWNsIiwicmVsYXRpdmVTaXplIiwiaHRtbFJ1bGUiLCJzZWxlY3RvciIsImFwcGVuZCIsImFzdGVyaXNrSHRtbFJ1bGUiLCJydWxlckljb25Qb3NpdGlvbiIsInN2ZyIsImd0aGlja25lc3MiLCJwYXJzZUZsb2F0IiwiYmFja2dyb3VuZCIsImltYWdlSGVpZ2h0IiwidG9GaXhlZCIsInBhdHRlcm4iLCJpbWFnZSIsInJ1bGVyTWF0cml4IiwiZ2V0RmlsZSIsImxlbmd0aCIsImdldEJhc2U2NCIsInJ1bGVyIiwiaWNvblNpemUiLCJzdHlsZSIsInJ1bGVyQ2xhc3MiLCJjb2xvciIsImhvdmVyQ29sb3IiLCJydWxlclJ1bGUiLCJwYXJzZSIsImVzY2FwZSIsImRlY2xzIiwiaWRlY2xzIiwiZXh0ZW5kTmFtZSIsInBhcmVudHMiLCJwcmV2IiwiY291bnQiLCJwdXNoIiwicnVsZXMiLCJjaGlsZCIsIm5vZGVzIl0sIm1hcHBpbmdzIjoiOzs7O0FBWUE7Ozs7QUFFQTs7QUFTQTs7OztBQUVBOzs7O0FBR0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7QUFFQSxJQUFNQSxVQUFVLFNBQVZBLE9BQVUsR0FBb0I7QUFBQSxRQUFuQkMsT0FBbUIsdUVBQVQsSUFBUzs7O0FBRWhDO0FBQ0EsUUFBSUMsaUJBQWlCOztBQUVqQixxQkFBYSxNQUZJO0FBR2pCLHVCQUFlLEtBSEU7QUFJakIsZ0JBQVEsSUFKUztBQUtqQix1QkFBZSxNQUxFO0FBTWpCLHVCQUFlLE9BTkU7QUFPakIsc0JBQWMsR0FQRzs7QUFTakIsc0JBQWMsUUFURzs7QUFXakIsNEJBQW9CLEtBWEg7QUFZ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S0FBSzBCLE1BQW5COztBQUVBMUIscUJBQUtnRixPQUFMLENBQWEsQ0FBYixFQUFnQjNFLE1BQWhCLENBQXVCK0IsWUFBdkIsQ0FBb0NwQyxLQUFLZ0YsT0FBTCxDQUFhLENBQWIsQ0FBcEMsRUFBcURyQyxJQUFyRDtBQUVILGFBTkQsTUFNTztBQUNILG9CQUFJa0MsUUFBUSxrQkFBUUYsS0FBUixDQUFjM0UsS0FBSzZFLEtBQW5CLENBQVo7QUFDQUEsc0JBQU1uRCxNQUFOLEdBQWUxQixLQUFLMEIsTUFBcEI7QUFDQTFCLHFCQUFLZ0YsT0FBTCxDQUFhLENBQWIsRUFBZ0JyRCxXQUFoQixDQUE0QjNCLEtBQUtpRixJQUFqQyxFQUF1Q0osS0FBdkM7QUFDSDs7QUFFRDtBQUNBLGlCQUFLLElBQUk5QyxDQUFULElBQWMvQixLQUFLZ0YsT0FBbkIsRUFBNEI7QUFDeEIsb0JBQUloRixLQUFLZ0YsT0FBTCxDQUFhakQsQ0FBYixFQUFnQnVELEtBQWhCLENBQXNCcEIsTUFBdEIsSUFBZ0MsQ0FBcEMsRUFBdUM7QUFDbkNsRSx5QkFBS2dGLE9BQUwsQ0FBYWpELENBQWIsRUFBZ0JlLE1BQWhCO0FBQ0g7QUFDSjtBQUVKO0FBRUosS0F2V0Q7QUF3V0gsQ0F6bkJEO0FBUEE7O0FBMUJBOzs7Ozs7Ozs7Ozs7a0JBNHBCZXRGLE8iLCJmaWxlIjoiSGFtc3Rlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbW9kdWxlIEhhbXN0ZXJcclxuICogXHJcbiAqIEBkZXNjcmlwdGlvbiBQb3N0Q1NTIEhhbXN0ZXIgZnJhbWV3b3JrIG1haW4gZnVuY3Rpb25hbGl0eS5cclxuICpcclxuICogQHZlcnNpb24gMS4wXHJcbiAqIEBhdXRob3IgR3JpZ29yeSBWYXNpbHlldiA8cG9zdGNzcy5oYW1zdGVyQGdtYWlsLmNvbT4gaHR0cHM6Ly9naXRodWIuY29tL2gwdGMwZDNcclxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTcsIEdyaWdvcnkgVmFzaWx5ZXZcclxuICogQGxpY2Vuc2UgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wLCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAgXHJcbiAqIFxyXG4gKi9cclxuXHJcbmltcG9ydCBGb250U2l6ZXMgZnJvbSBcIi4vRm9udFNpemVzXCI7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgZm9ybWF0SW50LFxyXG4gICAgZm9ybWF0VmFsdWUsXHJcbiAgICByZW1SZWdleHAsXHJcbiAgICBnZXRVbml0LFxyXG4gICAgaXNIYXMsXHJcbiAgICBVTklULFxyXG59IGZyb20gXCIuL0hlbHBlcnNcIjtcclxuXHJcbmltcG9ydCBWZXJ0aWNhbFJoeXRobSBmcm9tIFwiLi9WZXJ0aWNhbFJoeXRobVwiO1xyXG5cclxuaW1wb3J0IFBuZ0ltYWdlIGZyb20gXCIuL1BuZ0ltYWdlXCI7XHJcbi8vIGltcG9ydCBWaXJ0dWFsTWFjaGluZSBmcm9tIFwiLi9WaXJ0dWFsTWFjaGluZVwiO1xyXG5cclxuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5cclxuaW1wb3J0IHBvc3Rjc3MgZnJvbSBcInBvc3Rjc3NcIjtcclxuXHJcbmNvbnN0IGhhbXN0ZXIgPSAob3B0aW9ucyA9IG51bGwpID0+IHtcclxuXHJcbiAgICAvL0RlZmF1bHQgR2xvYmFsIFNldHRpbmdzXHJcbiAgICBsZXQgZ2xvYmFsU2V0dGluZ3MgPSB7XHJcblxyXG4gICAgICAgIFwiZm9udC1zaXplXCI6IFwiMTZweFwiLFxyXG4gICAgICAgIFwibGluZS1oZWlnaHRcIjogXCIxLjVcIixcclxuICAgICAgICBcInVuaXRcIjogXCJlbVwiLFxyXG4gICAgICAgIFwicHgtZmFsbGJhY2tcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgXCJweC1iYXNlbGluZVwiOiBcImZhbHNlXCIsXHJcbiAgICAgICAgXCJmb250LXJhdGlvXCI6IFwiMFwiLFxyXG5cclxuICAgICAgICBcInByb3BlcnRpZXNcIjogXCJpbmxpbmVcIixcclxuXHJcbiAgICAgICAgXCJtaW4tbGluZS1wYWRkaW5nXCI6IFwiMnB4XCIsXHJcbiAgICAgICAgXCJyb3VuZC10by1oYWxmLWxpbmVcIjogXCJmYWxzZVwiLFxyXG5cclxuICAgICAgICBcInJ1bGVyXCI6IFwidHJ1ZVwiLFxyXG4gICAgICAgIFwicnVsZXItc3R5bGVcIjogXCJhbHdheXMgcnVsZXItZGVidWdcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tcG9zaXRpb25cIjogXCJwb3NpdGlvbjogZml4ZWQ7dG9wOiAxLjVlbTtsZWZ0OiAxLjVlbTtcIixcclxuICAgICAgICBcInJ1bGVyLWljb24tY29sb3JzXCI6IFwiI2NjY2NjYyAjNDQ1NzZhXCIsXHJcbiAgICAgICAgXCJydWxlci1pY29uLXNpemVcIjogXCIyNHB4XCIsXHJcbiAgICAgICAgXCJydWxlci1jb2xvclwiOiBcInJnYmEoMTksIDEzNCwgMTkxLCAuOClcIixcclxuICAgICAgICBcInJ1bGVyLXRoaWNrbmVzc1wiOiBcIjFcIixcclxuICAgICAgICBcInJ1bGVyLWJhY2tncm91bmRcIjogXCJncmFkaWVudFwiLFxyXG4gICAgICAgIFwicnVsZXItb3V0cHV0XCI6IFwiYmFzZTY0XCIsXHJcbiAgICAgICAgXCJydWxlci1wYXR0ZXJuXCI6IFwiMSAwIDAgMFwiLFxyXG4gICAgICAgIFwicnVsZXItc2NhbGVcIjogXCIxXCIsXHJcblxyXG4gICAgICAgIFwiYnJvd3Nlci1mb250LXNpemVcIjogXCIxNnB4XCIsXHJcbiAgICAgICAgXCJsZWdhY3ktYnJvd3NlcnNcIjogXCJ0cnVlXCIsXHJcbiAgICAgICAgXCJyZW1vdmUtY29tbWVudHNcIjogXCJmYWxzZVwiXHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgZ2xvYmFsS2V5cyA9IFtcInVuaXRcIixcclxuICAgICAgICBcInB4LWZhbGxiYWNrXCIsXHJcbiAgICAgICAgXCJweC1iYXNlbGluZVwiLFxyXG4gICAgICAgIFwiZm9udC1yYXRpb1wiLFxyXG4gICAgICAgIFwicHJvcGVydGllc1wiLFxyXG4gICAgICAgIFwicm91bmQtdG8taGFsZi1saW5lXCIsXHJcbiAgICAgICAgXCJydWxlclwiLFxyXG4gICAgICAgIFwicnVsZXItc3R5bGVcIixcclxuICAgICAgICBcInJ1bGVyLWJhY2tncm91bmRcIixcclxuICAgICAgICBcInJ1bGVyLW91dHB1dFwiLFxyXG4gICAgICAgIFwibGVnYWN5LWJyb3dzZXJzXCIsXHJcbiAgICAgICAgXCJyZW1vdmUtY29tbWVudHNcIlxyXG4gICAgXTtcclxuXHJcbiAgICBsZXQgaGVscGVycyA9IHtcclxuXHJcbiAgICAgICAgXCJyZXNldFwiOiBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9oZWxwZXJzL3Jlc2V0LmNzc1wiKSwgXCJ1dGY4XCIpLFxyXG5cclxuICAgICAgICBcIm5vcm1hbGl6ZVwiOiBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9oZWxwZXJzL25vcm1hbGl6ZS5jc3NcIiksIFwidXRmOFwiKSxcclxuXHJcbiAgICAgICAgXCJub3dyYXBcIjogXCJ3aGl0ZS1zcGFjZTogbm93cmFwO1wiLFxyXG5cclxuICAgICAgICBcImZvcmNld3JhcFwiOiBcIndoaXRlLXNwYWNlOiBwcmU7XCIgK1xyXG4gICAgICAgICAgICBcIndoaXRlLXNwYWNlOiBwcmUtbGluZTtcIiArXHJcbiAgICAgICAgICAgIFwid2hpdGUtc3BhY2U6IHByZS13cmFwO1wiICtcclxuICAgICAgICAgICAgXCJ3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XCIsXHJcblxyXG4gICAgICAgIFwiZWxsaXBzaXNcIjogXCJvdmVyZmxvdzogaGlkZGVuO1wiICtcclxuICAgICAgICAgICAgXCJ0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcIixcclxuXHJcbiAgICAgICAgXCJoeXBoZW5zXCI6IFwid29yZC13cmFwOiBicmVhay13b3JkO1wiICtcclxuICAgICAgICAgICAgXCJoeXBoZW5zOiBhdXRvO1wiLFxyXG5cclxuICAgICAgICBcImJyZWFrLXdvcmRcIjpcclxuICAgICAgICAgICAgLyogTm9uIHN0YW5kYXJkIGZvciB3ZWJraXQgKi9cclxuICAgICAgICAgICAgXCJ3b3JkLWJyZWFrOiBicmVhay13b3JkO1wiICtcclxuICAgICAgICAgICAgLyogV2FybmluZzogTmVlZGVkIGZvciBvbGRJRSBzdXBwb3J0LCBidXQgd29yZHMgYXJlIGJyb2tlbiB1cCBsZXR0ZXItYnktbGV0dGVyICovXHJcbiAgICAgICAgICAgIFwid29yZC1icmVhazogYnJlYWstYWxsO1wiXHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvLyBDdXJyZW50IFZhcmlhYmxlc1xyXG4gICAgbGV0IGN1cnJlbnRTZXR0aW5ncyA9IHt9O1xyXG4gICAgbGV0IGN1cnJlbnRTZXR0aW5nc1JlZ2V4cDtcclxuICAgIC8vQ3VycmVudCBGb250U2l6ZXNcclxuICAgIGxldCBjdXJyZW50Rm9udFNpemVzID0gXCJcIjtcclxuICAgIC8vIGZvbnQgU2l6ZXNcclxuICAgIGxldCBmb250U2l6ZXNDb2xsZWN0aW9uO1xyXG4gICAgLy8gVmVydGljYWwgUmh5dGhtIENhbGN1bGF0b3JcclxuICAgIGxldCByaHl0aG1DYWxjdWxhdG9yO1xyXG4gICAgLy8gTGFzdCBDc3MgRmlsZVxyXG4gICAgLy8gbGV0IGxhc3RGaWxlO1xyXG5cclxuICAgIC8vIGxldCB2bSA9IG5ldyBWaXJ0dWFsTWFjaGluZSgpO1xyXG4gICAgLy8gZm9udFNpemUgcHJvcGVydHkgUmVnZXhwXHJcbiAgICBjb25zdCBmb250U2l6ZVJlZ2V4cCA9IC9mb250U2l6ZVxccysoW1xcLVxcJFxcQDAtOWEtekEtWl0rKS9pO1xyXG5cclxuICAgIC8vIHJoeXRobSBmdW5jdGlvbnMgUmVnZXhwXHJcbiAgICBjb25zdCByaHl0aG1SZWdleHAgPSAvKGxpbmVIZWlnaHR8c3BhY2luZ3xsZWFkaW5nfFxcIXJoeXRobXxyaHl0aG0pXFwoKC4qPylcXCkvaTtcclxuXHJcbiAgICAvLyBwcm9wZXJ0aWVzIHJlZ2V4cFxyXG4gICAgY29uc3QgcHJvcGVydGllc1JlZ2V4cCA9IC9eKGVsbGlwc2lzfG5vd3JhcHxmb3JjZXdyYXB8aHlwaGVuc3xicmVha1xcLXdvcmQpJC9pO1xyXG5cclxuICAgIC8vIENvbW1hIHNwbGl0IHJlZ2V4cFxyXG4gICAgY29uc3QgY29tbWFTcGxpdFJlZ2V4cCA9L1xccypcXCxcXHMqLztcclxuXHJcbiAgICAvLyBTcGFjZSBzcGxpdCByZWdleHBcclxuICAgIGNvbnN0IHNwYWNlU3BsaXRSZWdleHAgPSAvXFxzKy87XHJcblxyXG4gICAgLy8gQ29weSBWYWx1ZXMgZnJvbSBvYmplY3QgMiB0byBvYmplY3QgMTtcclxuICAgIGNvbnN0IGV4dGVuZCA9IChvYmplY3QxLCBvYmplY3QyKSA9PiB7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBvYmplY3QyKSB7XHJcbiAgICAgICAgICAgIC8vIGlmKG9iamVjdDIuaGFzT3duUHJvcGVydHkoa2V5KSl7XHJcbiAgICAgICAgICAgIG9iamVjdDFba2V5XSA9IG9iamVjdDJba2V5XTtcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG9iamVjdDE7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAob3B0aW9ucyAhPSBudWxsKSB7XHJcbiAgICAgICAgZXh0ZW5kKGdsb2JhbFNldHRpbmdzLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBiZWZvcmVBZnRlcldvcmRSZWdleHAgPSAvXlteYS16MC05XSooLiopW15hLXowLTldKiQvO1xyXG4gICAgY29uc3QgY2FtZWxSZWdleHAgPSAvW15hLXowLTldKyhbYS16MC05XSkvZztcclxuXHJcbiAgICBjb25zdCB0b0NhbWVsQ2FzZSA9ICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoYmVmb3JlQWZ0ZXJXb3JkUmVnZXhwLCBcIiQxXCIpLnJlcGxhY2UoY2FtZWxSZWdleHAsIChtYXRjaCwgbGV0dGVyKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBsZXR0ZXIudG9VcHBlckNhc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICBjb25zdCBpbml0U2V0dGluZ3MgPSAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIEFkZCBmb250U2l6ZXNcclxuICAgICAgICBpZiAoXCJmb250LXNpemVzXCIgaW4gZ2xvYmFsU2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IGdsb2JhbFNldHRpbmdzW1wiZm9udC1zaXplc1wiXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChcImZvbnQtc2l6ZXNcIiBpbiBjdXJyZW50U2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IGN1cnJlbnRGb250U2l6ZXMgKyBcIiwgXCIgKyBjdXJyZW50U2V0dGluZ3NbXCJmb250LXNpemVzXCJdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVG9Mb3dlckNhc2UgQ3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBnbG9iYWxLZXlzKSB7XHJcbiAgICAgICAgICAgIGlmIChrZXkgaW4gY3VycmVudFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3Nba2V5XSA9IGN1cnJlbnRTZXR0aW5nc1trZXldLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvbnRTaXplc0NvbGxlY3Rpb24gPSBuZXcgRm9udFNpemVzKGN1cnJlbnRTZXR0aW5ncyk7XHJcbiAgICAgICAgcmh5dGhtQ2FsY3VsYXRvciA9IG5ldyBWZXJ0aWNhbFJoeXRobShjdXJyZW50U2V0dGluZ3MpO1xyXG4gICAgICAgIGZvbnRTaXplc0NvbGxlY3Rpb24uYWRkRm9udFNpemVzKGN1cnJlbnRGb250U2l6ZXMsIHJoeXRobUNhbGN1bGF0b3IpO1xyXG4gICAgICAgIGxldCBzZXR0aW5nc0tleXMgPSBPYmplY3Qua2V5cyhjdXJyZW50U2V0dGluZ3MpO1xyXG4gICAgICAgIGxldCBzZXR0aW5nc0tleXNTdHJpbmcgPSBzZXR0aW5nc0tleXMuam9pbihcInxcIikucmVwbGFjZSgvKFxcLXxcXF8pL2csIFwiXFxcXCQxXCIpO1xyXG4gICAgICAgIGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCA9IG5ldyBSZWdFeHAoXCJcXFxcQChcIiArIHNldHRpbmdzS2V5c1N0cmluZyArIFwiKVwiLCBcImlcIik7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB3YWxrRGVjbHMgPSAobm9kZSkgPT4ge1xyXG4gICAgICAgIG5vZGUud2Fsa0RlY2xzKGRlY2wgPT4ge1xyXG5cclxuICAgICAgICAgICAgbGV0IGZvdW5kO1xyXG4gICAgICAgICAgICBsZXQgcnVsZUZvbnRTaXplO1xyXG5cclxuICAgICAgICAgICAgbGV0IGZpbmRSdWxlRm9udFNpemUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZUZvbnRTaXplID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC53YWxrRGVjbHMoXCJmb250LXNpemVcIiwgZnNkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZUZvbnRTaXplID0gZnNkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlY2wudmFsdWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIFZhcmlhYmxlcyB3aXRoIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2goY3VycmVudFNldHRpbmdzUmVnZXhwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdmFyaWFibGUgPSBmb3VuZFsxXTtcclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCwgY3VycmVudFNldHRpbmdzW3ZhcmlhYmxlXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlcGxhY2UgRm9udCBTaXplXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChmb250U2l6ZVJlZ2V4cCkpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBbZm9udFNpemUsIHNpemVVbml0XSA9IGZvdW5kWzFdLnNwbGl0KC9cXCQvaSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNpemVVbml0ID0gKHNpemVVbml0KSA/IGdldFVuaXQoc2l6ZVVuaXQpIDogMDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2l6ZSA9IGZvbnRTaXplc0NvbGxlY3Rpb24uZ2V0U2l6ZShmb250U2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV3JpdGUgZm9udCBzaXplXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpemVVbml0ID09PSBVTklULkVNIHx8IHNpemVVbml0ID09IFVOSVQuUkVNKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvbnRTaXplUmVnZXhwLCBmb3JtYXRWYWx1ZShzaXplLnJlbCkgKyBzaXplVW5pdCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2l6ZVVuaXQgPT09IFVOSVQuUFgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm9udFNpemVSZWdleHAsIGZvcm1hdEludChzaXplLnB4KSArIFwicHhcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2ZzaXplID0gKGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0gPT09IFwicHhcIikgPyBmb3JtYXRJbnQoc2l6ZS5weCkgOiBmb3JtYXRWYWx1ZShzaXplLnJlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvbnRTaXplUmVnZXhwLCBjZnNpemUgKyBjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGp1c3QgRm9udCBTaXplXHJcbiAgICAgICAgICAgICAgICBpZiAoZGVjbC5wcm9wID09PSBcImFkanVzdC1mb250LXNpemVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgW2ZvbnRTaXplLCBsaW5lcywgYmFzZUZvbnRTaXplXSA9IGRlY2wudmFsdWUuc3BsaXQoc3BhY2VTcGxpdFJlZ2V4cCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplVW5pdCA9IGdldFVuaXQoZm9udFNpemUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gcmh5dGhtQ2FsY3VsYXRvci5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIG51bGwsIGJhc2VGb250U2l6ZSkgKyBjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBmb250U2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodERlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBsaW5lSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGRlY2wuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wucHJvcCA9IFwiZm9udC1zaXplXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC5wYXJlbnQuaW5zZXJ0QWZ0ZXIoZGVjbCwgbGluZUhlaWdodERlY2wpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGxpbmVIZWlnaHQsIHNwYWNpbmcsIGxlYWRpbmcsIHJoeXRobSwgIXJoeXRobVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2gocmh5dGhtUmVnZXhwKSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gZm91bmRbMV0udG9Mb3dlckNhc2UoKTsgLy8gbGluZUhlaWdodCwgc3BhY2luZywgbGVhZGluZywgcmh5dGhtLCAhcmh5dGhtXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcmFtZXRlcnMgPSBmb3VuZFsyXS5zcGxpdChjb21tYVNwbGl0UmVnZXhwKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgb3V0cHV0VmFsdWUgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpIGluIHBhcmFtZXRlcnMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbdmFsdWUsIGZvbnRTaXplXSA9IHBhcmFtZXRlcnNbaV0uc3BsaXQoc3BhY2VTcGxpdFJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWZvbnRTaXplKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5kUnVsZUZvbnRTaXplKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHJ1bGVGb250U2l6ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5ID09PSBcImxpbmVoZWlnaHRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0VmFsdWUgKz0gcmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wZXJ0eSA9PT0gXCJzcGFjaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFZhbHVlICs9IHJoeXRobUNhbGN1bGF0b3IubGluZUhlaWdodChmb250U2l6ZSwgdmFsdWUsIG51bGwsIHRydWUpICsgXCIgXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkgPT09IFwibGVhZGluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRWYWx1ZSArPSByaHl0aG1DYWxjdWxhdG9yLmxlYWRpbmcodmFsdWUsIGZvbnRTaXplKSArIFwiIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09PSBcIiFyaHl0aG1cIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IFtpblZhbHVlLCBvdXRwdXRVbml0XSA9IHZhbHVlLnNwbGl0KC9cXCQvKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFVuaXQgPSBVTklUW291dHB1dFVuaXRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0VmFsdWUgKz0gcmh5dGhtQ2FsY3VsYXRvci5yaHl0aG0oaW5WYWx1ZSwgZm9udFNpemUsIHRydWUsIG91dHB1dFVuaXQpICsgXCIgXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkgPT09IFwicmh5dGhtXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbaW5WYWx1ZSwgb3V0cHV0VW5pdF0gPSB2YWx1ZS5zcGxpdCgvXFwkLyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRVbml0ID0gVU5JVFtvdXRwdXRVbml0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFZhbHVlICs9IHJoeXRobUNhbGN1bGF0b3Iucmh5dGhtKGluVmFsdWUsIGZvbnRTaXplLCBmYWxzZSwgb3V0cHV0VW5pdCkgKyBcIiBcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvdW5kWzBdLCBvdXRwdXRWYWx1ZS5yZXBsYWNlKC9cXHMrJC8sIFwiXCIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyByZW0gZmFsbGJhY2tcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3NbXCJweC1mYWxsYmFja1wiXSA9PT0gXCJ0cnVlXCIgJiYgZGVjbC52YWx1ZS5tYXRjaChyZW1SZWdleHApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC5wYXJlbnQuaW5zZXJ0QmVmb3JlKGRlY2wsIGRlY2wuY2xvbmUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmh5dGhtQ2FsY3VsYXRvci5yZW1GYWxsYmFjayhkZWNsLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBkZWNsLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gKGNzcykgPT4ge1xyXG5cclxuICAgICAgICAvLyBFeHRlbmQgTm9kZXNcclxuICAgICAgICBsZXQgZXh0ZW5kTm9kZXMgPSB7fTtcclxuXHJcbiAgICAgICAgY3NzLndhbGsobm9kZSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGlmIChsYXN0RmlsZSAhPSBub2RlLnNvdXJjZS5pbnB1dC5maWxlKSB7XHJcbiAgICAgICAgICAgIC8vIFx0bGFzdEZpbGUgPSBub2RlLnNvdXJjZS5pbnB1dC5maWxlO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICBpZiAobm9kZS50eXBlID09PSBcImF0cnVsZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHJ1bGUgPSBub2RlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChydWxlLm5hbWUgPT09IFwiaGFtc3RlclwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlLnBhcmFtcyAhPT0gXCJlbmRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgR2xvYmFsIFZhcmlhYmxlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLndhbGtEZWNscyhkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbFNldHRpbmdzW2RlY2wucHJvcF0gPSBkZWNsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgZm9udFNpemVzXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKFwiZm9udC1zaXplc1wiIGluIGdsb2JhbFNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBnbG9iYWxTZXR0aW5nc1tcImZvbnQtc2l6ZXNcIl07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IGN1cnJlbnQgdmFyaWFibGVzXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzID0gZXh0ZW5kKHt9LCBnbG9iYWxTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRTZXR0aW5ncygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgUnVsZSBIYW1zdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZSA9PT0gXCIhaGFtc3RlclwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vY3VycmVudFNldHRpbmdzID0gZXh0ZW5kKHt9LCBnbG9iYWxTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUud2Fsa0RlY2xzKGRlY2wgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3NbZGVjbC5wcm9wXSA9IGRlY2wudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRTZXR0aW5ncygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lID09PSBcImJhc2VsaW5lXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplID0gcGFyc2VJbnQoY3VycmVudFNldHRpbmdzW1wiZm9udC1zaXplXCJdKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYnJvd3NlckZvbnRTaXplID0gcGFyc2VJbnQoY3VycmVudFNldHRpbmdzW1wiYnJvd3Nlci1mb250LXNpemVcIl0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IHJoeXRobUNhbGN1bGF0b3IubGluZUhlaWdodChmb250U2l6ZSArIFwicHhcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGJhc2VsaW5lIGZvbnQgc2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZURlY2wgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicHgtYmFzZWxpbmVcIl0gPT09IFwidHJ1ZVwiIHx8IChjdXJyZW50U2V0dGluZ3NbXCJ1bml0XCJdID09PSBcInB4XCIgJiYgY3VycmVudFNldHRpbmdzW1wibGVnYWN5LWJyb3dzZXJzXCJdICE9PSBcInRydWVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplRGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImZvbnQtc2l6ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZvbnRTaXplICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZWxhdGl2ZVNpemUgPSAxMDAgKiBmb250U2l6ZSAvIGJyb3dzZXJGb250U2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplRGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImZvbnQtc2l6ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZvcm1hdFZhbHVlKHJlbGF0aXZlU2l6ZSkgKyBcIiVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHREZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbGluZUhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzSGFzKHJ1bGUucGFyYW1zLCBcImh0bWxcIikpICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaHRtbFJ1bGUgPSBwb3N0Y3NzLnJ1bGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxSdWxlLmFwcGVuZChmb250U2l6ZURlY2wpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sUnVsZS5hcHBlbmQobGluZUhlaWdodERlY2wpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgaHRtbFJ1bGUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0gPT09IFwicHhcIiAmJiBjdXJyZW50U2V0dGluZ3NbXCJsZWdhY3ktYnJvd3NlcnNcIl0gPT09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXN0ZXJpc2tIdG1sUnVsZSA9IHBvc3Rjc3MucnVsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiKiBodG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3Rlcmlza0h0bWxSdWxlLmFwcGVuZChsaW5lSGVpZ2h0RGVjbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBhc3Rlcmlza0h0bWxSdWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgbGluZUhlaWdodERlY2wpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBmb250U2l6ZURlY2wpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInVuaXRcIl0gPT09IFwicmVtXCIgJiYgY3VycmVudFNldHRpbmdzW1wicHgtZmFsbGJhY2tcIl0gPT09IFwidHJ1ZVwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKGxpbmVIZWlnaHREZWNsLCBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IFwibGluZS1oZWlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmh5dGhtQ2FsY3VsYXRvci5yZW1GYWxsYmFjayhsaW5lSGVpZ2h0KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5uYW1lID09PSBcInJ1bGVyXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVySWNvblBvc2l0aW9uID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItaWNvbi1wb3NpdGlvblwiXS5yZXBsYWNlKC8oXFwnfFxcXCIpL2csIFwiXCIpLnJlcGxhY2UoL1xcOy9nLCBcIjtcXG5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0ID0gaXNIYXMoY3VycmVudFNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0sIFwicHhcIikgPyBjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSA6IGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdICsgXCJlbVwiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvL2xldCBzdmcgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0ZjgsJTNDc3ZnIHhtbG5zJTNEJTI3aHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTI3IHZpZXdCb3glM0QlMjcwIDAgMjQgMjQlMjclM0UlM0NwYXRoIGZpbGwlM0QlMjd7Y29sb3J9JTI3IGQlM0QlMjdNMTggMjRjLTAuMyAwLTAuNTQ4LTAuMjQ2LTAuNTQ4LTAuNTQ2VjE4YzAtMC4zIDAuMjQ4LTAuNTQ2IDAuNTQ4LTAuNTQ2aDUuNDUyICBDMjMuNzU0IDE3LjQ1NCAyNCAxNy43IDI0IDE4djUuNDU0YzAgMC4zLTAuMjQ2IDAuNTQ2LTAuNTQ4IDAuNTQ2SDE4eiBNOS4yNzEgMjRjLTAuMjk4IDAtMC41NDMtMC4yNDYtMC41NDMtMC41NDZWMTggIGMwLTAuMyAwLjI0NS0wLjU0NiAwLjU0My0wLjU0Nmg1LjQ1N2MwLjMgMCAwLjU0MyAwLjI0NiAwLjU0MyAwLjU0NnY1LjQ1NGMwIDAuMy0wLjI0MyAwLjU0Ni0wLjU0MyAwLjU0Nkg5LjI3MXogTTAuNTQ4IDI0ICBDMC4yNDYgMjQgMCAyMy43NTQgMCAyMy40NTRWMThjMC0wLjMgMC4yNDYtMC41NDYgMC41NDgtMC41NDZINmMwLjMwMiAwIDAuNTQ4IDAuMjQ2IDAuNTQ4IDAuNTQ2djUuNDU0QzYuNTQ4IDIzLjc1NCA2LjMwMiAyNCA2IDI0ICBIMC41NDh6IE0xOCAxNS4yNzFjLTAuMyAwLTAuNTQ4LTAuMjQ0LTAuNTQ4LTAuNTQyVjkuMjcyYzAtMC4yOTkgMC4yNDgtMC41NDUgMC41NDgtMC41NDVoNS40NTJDMjMuNzU0IDguNzI3IDI0IDguOTczIDI0IDkuMjcyICB2NS40NTdjMCAwLjI5OC0wLjI0NiAwLjU0Mi0wLjU0OCAwLjU0MkgxOHogTTkuMjcxIDE1LjI3MWMtMC4yOTggMC0wLjU0My0wLjI0NC0wLjU0My0wLjU0MlY5LjI3MmMwLTAuMjk5IDAuMjQ1LTAuNTQ1IDAuNTQzLTAuNTQ1ICBoNS40NTdjMC4zIDAgMC41NDMgMC4yNDYgMC41NDMgMC41NDV2NS40NTdjMCAwLjI5OC0wLjI0MyAwLjU0Mi0wLjU0MyAwLjU0Mkg5LjI3MXogTTAuNTQ4IDE1LjI3MUMwLjI0NiAxNS4yNzEgMCAxNS4wMjYgMCAxNC43MjkgIFY5LjI3MmMwLTAuMjk5IDAuMjQ2LTAuNTQ1IDAuNTQ4LTAuNTQ1SDZjMC4zMDIgMCAwLjU0OCAwLjI0NiAwLjU0OCAwLjU0NXY1LjQ1N2MwIDAuMjk4LTAuMjQ2IDAuNTQyLTAuNTQ4IDAuNTQySDAuNTQ4eiBNMTggNi41NDUgIGMtMC4zIDAtMC41NDgtMC4yNDUtMC41NDgtMC41NDVWMC41NDVDMTcuNDUyIDAuMjQ1IDE3LjcgMCAxOCAwaDUuNDUyQzIzLjc1NCAwIDI0IDAuMjQ1IDI0IDAuNTQ1VjZjMCAwLjMtMC4yNDYgMC41NDUtMC41NDggMC41NDUgIEgxOHogTTkuMjcxIDYuNTQ1QzguOTc0IDYuNTQ1IDguNzI5IDYuMyA4LjcyOSA2VjAuNTQ1QzguNzI5IDAuMjQ1IDguOTc0IDAgOS4yNzEgMGg1LjQ1N2MwLjMgMCAwLjU0MyAwLjI0NSAwLjU0MyAwLjU0NVY2ICBjMCAwLjMtMC4yNDMgMC41NDUtMC41NDMgMC41NDVIOS4yNzF6IE0wLjU0OCA2LjU0NUMwLjI0NiA2LjU0NSAwIDYuMyAwIDZWMC41NDVDMCAwLjI0NSAwLjI0NiAwIDAuNTQ4IDBINiAgYzAuMzAyIDAgMC41NDggMC4yNDUgMC41NDggMC41NDVWNmMwIDAuMy0wLjI0NiAwLjU0NS0wLjU0OCAwLjU0NUgwLjU0OHolMjclMkYlM0UlM0MlMkZzdmclM0VcIjtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGY4LCUzQ3N2ZyB4bWxucyUzRCUyN2h0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyNyB2aWV3Qm94JTNEJTI3MCAwIDI0IDI0JTI3JTNFJTNDcGF0aCBmaWxsJTNEJTI3e2NvbG9yfSUyNyBkJTNEJTI3TTAsNmMwLDAuMzAxLDAuMjQ2LDAuNTQ1LDAuNTQ5LDAuNTQ1aDIyLjkwNkMyMy43NTYsNi41NDUsMjQsNi4zMDEsMjQsNlYyLjczYzAtMC4zMDUtMC4yNDQtMC41NDktMC41NDUtMC41NDlIMC41NDkgIEMwLjI0NiwyLjE4MiwwLDIuNDI2LDAsMi43M1Y2eiBNMCwxMy42MzdjMCwwLjI5NywwLjI0NiwwLjU0NSwwLjU0OSwwLjU0NWgyMi45MDZjMC4zMDEsMCwwLjU0NS0wLjI0OCwwLjU0NS0wLjU0NXYtMy4yNzMgIGMwLTAuMjk3LTAuMjQ0LTAuNTQ1LTAuNTQ1LTAuNTQ1SDAuNTQ5QzAuMjQ2LDkuODE4LDAsMTAuMDY2LDAsMTAuMzYzVjEzLjYzN3ogTTAsMjEuMjdjMCwwLjMwNSwwLjI0NiwwLjU0OSwwLjU0OSwwLjU0OWgyMi45MDYgIGMwLjMwMSwwLDAuNTQ1LTAuMjQ0LDAuNTQ1LTAuNTQ5VjE4YzAtMC4zMDEtMC4yNDQtMC41NDUtMC41NDUtMC41NDVIMC41NDlDMC4yNDYsMTcuNDU1LDAsMTcuNjk5LDAsMThWMjEuMjd6JTI3JTJGJTNFJTNDJTJGc3ZnJTNFXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGY4LCUzQ3N2ZyB4bWxucyUzRCUyN2h0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyNyB2aWV3Qm94JTNEJTI3MCAwIDMyIDMyJTI3JTNFJTNDcGF0aCBmaWxsJTNEJTI3e2NvbG9yfSUyNyBkJTNEJTI3TTI4LDIwaC00di04aDRjMS4xMDQsMCwyLTAuODk2LDItMnMtMC44OTYtMi0yLTJoLTRWNGMwLTEuMTA0LTAuODk2LTItMi0ycy0yLDAuODk2LTIsMnY0aC04VjRjMC0xLjEwNC0wLjg5Ni0yLTItMiAgUzgsMi44OTYsOCw0djRINGMtMS4xMDQsMC0yLDAuODk2LTIsMnMwLjg5NiwyLDIsMmg0djhINGMtMS4xMDQsMC0yLDAuODk2LTIsMnMwLjg5NiwyLDIsMmg0djRjMCwxLjEwNCwwLjg5NiwyLDIsMnMyLTAuODk2LDItMnYtNCAgaDh2NGMwLDEuMTA0LDAuODk2LDIsMiwyczItMC44OTYsMi0ydi00aDRjMS4xMDQsMCwyLTAuODk2LDItMlMyOS4xMDQsMjAsMjgsMjB6IE0xMiwyMHYtOGg4djhIMTJ6JTI3JTJGJTNFJTNDJTJGc3ZnJTNFXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGd0aGlja25lc3MgPSBwYXJzZUZsb2F0KGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLXRoaWNrbmVzc1wiXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBiYWNrZ3JvdW5kID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWJhY2tncm91bmRcIl0gPT09IFwicG5nXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZUhlaWdodCA9IGlzSGFzKGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdLCBcInB4XCIpID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGN1cnJlbnRTZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAocGFyc2VGbG9hdChjdXJyZW50U2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSkgKiBwYXJzZUZsb2F0KGN1cnJlbnRTZXR0aW5nc1tcImZvbnQtc2l6ZVwiXSkpLnRvRml4ZWQoMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0dGVybiA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLXBhdHRlcm5cIl0uc3BsaXQoc3BhY2VTcGxpdFJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2UgPSBuZXcgUG5nSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2UucnVsZXJNYXRyaXgoaW1hZ2VIZWlnaHQsIGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLWNvbG9yXCJdLCBwYXR0ZXJuLCBndGhpY2tuZXNzLCBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1zY2FsZVwiXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzW1wicnVsZXItb3V0cHV0XCJdICE9IFwiYmFzZTY0XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLmdldEZpbGUoY3VycmVudFNldHRpbmdzW1wicnVsZXItb3V0cHV0XCJdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiLi4vXCIgKyBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1vdXRwdXRcIl0gKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcG9zaXRpb246IGxlZnQgdG9wO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcmVwZWF0OiByZXBlYXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1zaXplOiBcIiArIHBhdHRlcm4ubGVuZ3RoICsgXCJweCBcIiArIGltYWdlSGVpZ2h0ICsgXCJweDtcIjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxcIiArIGltYWdlLmdldEJhc2U2NCgpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXBvc2l0aW9uOiBsZWZ0IHRvcDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXJlcGVhdDogcmVwZWF0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtc2l6ZTogXCIgKyBwYXR0ZXJuLmxlbmd0aCArIFwicHggXCIgKyBpbWFnZUhlaWdodCArIFwicHg7XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBndGhpY2tuZXNzID0gZ3RoaWNrbmVzcyAqIDM7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kID0gXCJiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U2V0dGluZ3NbXCJydWxlci1jb2xvclwiXSArIFwiIFwiICsgZ3RoaWNrbmVzcyArIFwiJSwgdHJhbnNwYXJlbnQgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3RoaWNrbmVzcyArIFwiJSk7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXNpemU6IDEwMCUgXCIgKyBsaW5lSGVpZ2h0ICsgXCI7XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXIgPSBcInBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibGVmdDogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidG9wOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmc6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoOiAxMDAlO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHQ6IDEwMCU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInotaW5kZXg6IDk5MDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBvaW50ZXItZXZlbnRzOiBub25lO1wiICsgYmFja2dyb3VuZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGljb25TaXplID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItaWNvbi1zaXplXCJdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgW3N0eWxlLCBydWxlckNsYXNzXSA9IGN1cnJlbnRTZXR0aW5nc1tcInJ1bGVyLXN0eWxlXCJdLnNwbGl0KHNwYWNlU3BsaXRSZWdleHApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBbY29sb3IsIGhvdmVyQ29sb3JdID0gY3VycmVudFNldHRpbmdzW1wicnVsZXItaWNvbi1jb2xvcnNcIl0uc3BsaXQoc3BhY2VTcGxpdFJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBydWxlclJ1bGUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3R5bGUgPT09IFwic3dpdGNoXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCIuXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5OiBub25lO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl0ge1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTpub25lO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl0gKyBsYWJlbCB7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ6LWluZGV4OiA5OTk5O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTogaW5saW5lLWJsb2NrO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVySWNvblBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoOiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHQ6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnNvcjogcG9pbnRlcjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnJlcGxhY2UoL1xce2NvbG9yXFx9LywgZXNjYXBlKGNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl06Y2hlY2tlZCArIGxhYmVsLCBpbnB1dFtpZD1cXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJDbGFzcyArIFwiXFxcIl06aG92ZXIgKyBsYWJlbCB7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIlwiICsgc3ZnLnJlcGxhY2UoL1xce2NvbG9yXFx9LywgZXNjYXBlKGhvdmVyQ29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnB1dFtpZD1cXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXJDbGFzcyArIFwiXFxcIl06Y2hlY2tlZCB+IC5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6IGJsb2NrO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdHlsZSA9PT0gXCJob3ZlclwiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVySWNvblBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoOiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHQ6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgKyBzdmcucmVwbGFjZSgvXFx7Y29sb3JcXH0vLCBlc2NhcGUoY29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLWltYWdlIDAuNXMgZWFzZS1pbi1vdXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIuXCIgKyBydWxlckNsYXNzICsgXCI6aG92ZXJcIiArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY3Vyc29yOiBwb2ludGVyO1wiICsgcnVsZXIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ9XCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0eWxlID09PSBcImFsd2F5c1wiKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1xcblwiICsgcnVsZXIgKyBcIn1cXG5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGVyUnVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUuc291cmNlID0gcnVsZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBydWxlclJ1bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJ1bGUubmFtZS5tYXRjaChwcm9wZXJ0aWVzUmVnZXhwKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBydWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlY2xzID0gaGVscGVyc1twcm9wZXJ0eV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eSA9PT0gXCJoeXBoZW5zXCIgJiYgcnVsZS5wYXJhbXMgPT09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xzID0gaGVscGVyc1tcImJyZWFrLXdvcmRcIl0gKyBkZWNscztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09PSBcImVsbGlwc2lzXCIgJiYgcnVsZS5wYXJhbXMgPT09IFwidHJ1ZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xzID0gaGVscGVyc1tcIm5vd3JhcFwiXSArIGRlY2xzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTZXR0aW5nc1tcInByb3BlcnRpZXNcIl0gPT09IFwiaW5saW5lXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpZGVjbHMgPSBwb3N0Y3NzLnBhcnNlKGRlY2xzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJ1bGUsIGlkZWNscyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSAge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4dGVuZE5hbWUgPSB0b0NhbWVsQ2FzZShwcm9wZXJ0eSArIFwiIFwiICsgcnVsZS5wYXJhbXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIGV4dGVuZCBpbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogcnVsZS5wYXJlbnQuc2VsZWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbHM6IGRlY2xzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHM6IFtydWxlLnBhcmVudF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldjogcnVsZS5wcmV2KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9BcHBlbmQgc2VsZWN0b3IgYW5kIHVwZGF0ZSBjb3VudGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5zZWxlY3RvciA9IGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLnNlbGVjdG9yICsgXCIsIFwiICsgcnVsZS5wYXJlbnQuc2VsZWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5wYXJlbnRzLnB1c2gocnVsZS5wYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0uY291bnQrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChydWxlLm5hbWUubWF0Y2goL14ocmVzZXR8bm9ybWFsaXplKSQvaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBydWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXMgPSBwb3N0Y3NzLnBhcnNlKGhlbHBlcnNbcHJvcGVydHldKTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlcy5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBydWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFdhbGsgaW4gbWVkaWEgcXVlcmllc1xyXG4gICAgICAgICAgICAgICAgbm9kZS53YWxrKGNoaWxkID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09IFwicnVsZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdhbGsgZGVjbHMgaW4gcnVsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3YWxrRGVjbHMoY2hpbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKHJ1bGUubmFtZSA9PSBcImpzXCIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgbGV0IGpjc3MgPSBydWxlLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgLy8gbGV0IGNvZGUgPSBqY3NzLnJlcGxhY2UoL1xcQGpzXFxzKlxceyhbXFxzXFxTXSspXFx9JC9pLCBcIiQxXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhqY3NzKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBydWxlclJ1bGUuc291cmNlID0gcnVsZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgLy8gcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJ1bGUsIHJ1bGVyUnVsZSk7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS50eXBlID09PSBcInJ1bGVcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFdhbGsgZGVjbHMgaW4gcnVsZVxyXG4gICAgICAgICAgICAgICAgd2Fsa0RlY2xzKG5vZGUpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50U2V0dGluZ3NbXCJyZW1vdmUtY29tbWVudHNcIl0gPT09IFwidHJ1ZVwiICYmIG5vZGUudHlwZSA9PT0gXCJjb21tZW50XCIpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCBFeHRlbmRzIHRvIENTU1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBleHRlbmROb2Rlcykge1xyXG5cclxuICAgICAgICAgICAgbGV0IG5vZGUgPSBleHRlbmROb2Rlc1trZXldO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5vZGUuY291bnQgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcnVsZSA9IHBvc3Rjc3MucGFyc2Uobm9kZS5zZWxlY3RvciArIFwie1wiICsgbm9kZS5kZWNscyArIFwifVwiKTtcclxuICAgICAgICAgICAgICAgIHJ1bGUuc291cmNlID0gbm9kZS5zb3VyY2U7XHJcblxyXG4gICAgICAgICAgICAgICAgbm9kZS5wYXJlbnRzWzBdLnBhcmVudC5pbnNlcnRCZWZvcmUobm9kZS5wYXJlbnRzWzBdLCBydWxlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGVjbHMgPSBwb3N0Y3NzLnBhcnNlKG5vZGUuZGVjbHMpO1xyXG4gICAgICAgICAgICAgICAgZGVjbHMuc291cmNlID0gbm9kZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICBub2RlLnBhcmVudHNbMF0uaW5zZXJ0QWZ0ZXIobm9kZS5wcmV2LCBkZWNscyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB1bnVzZWQgcGFyZW50IG5vZGVzLlxyXG4gICAgICAgICAgICBmb3IgKGxldCBpIGluIG5vZGUucGFyZW50cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUucGFyZW50c1tpXS5ub2Rlcy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucGFyZW50c1tpXS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGhhbXN0ZXI7Il19
