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

        fontSize: 16,
        lineHeight: 1.5,
        unit: _Helpers.UNIT.EM,
        pxFallback: true,
        pxBaseline: false,
        fontRatio: "1.25",

        properties: "inline",

        minLinePadding: 2,
        roundToHalfLine: false,

        ruler: true,
        rulerStyle: "always ruler-debug",
        rulerIconPosition: "position: fixed;top: 1.5em;left: 1.5em;",
        rulerIconColors: "#cccccc #44576a",
        rulerIconSize: "24px",
        rulerColor: "rgba(19, 134, 191, .8)",
        rulerThickness: 1,
        rulerBackground: "gradient",
        rulerOutput: "base64",
        rulerPattern: "1 0 0 0",
        rulerScale: 1,

        browserFontSize: 16,
        legacyBrowsers: true,
        removeComments: false
    };

    // Value toLowerCase()
    var toLowerCaseKeys = ["unit", "fontRatio", "properties", "rulerStyle", "rulerBackground", "rulerOutput"];

    var helpers = {

        reset: _fs2.default.readFileSync(_path2.default.resolve(__dirname, "../helpers/reset.css"), "utf8"),

        normalize: _fs2.default.readFileSync(_path2.default.resolve(__dirname, "../helpers/normalize.css"), "utf8"),

        nowrap: "white-space: nowrap;",

        forcewrap: "white-space: pre;white-space: pre-line;white-space: pre-wrap;word-wrap: break-word;",

        ellipsis: "overflow: hidden;text-overflow: ellipsis;",

        hyphens: "word-wrap: break-word;hyphens: auto;",

        breakWord:
        /* Non standard for webkit */
        "word-break: break-word;word-break: break-all;"
    };

    // fontSize property Regexp
    var fontSizeRegexp = /fontSize\s+([\-\$\@0-9a-zA-Z]+)/i;

    // rhythm functions Regexp
    var rhythmRegexp = /(lineHeight|spacing|leading|\!rhythm|rhythm)\((.*?)\)/i;

    // Comma split regexp
    var commaSplitRegexp = /\s*\,\s*/;

    // Space split regexp
    var spaceSplitRegexp = /\s+/;

    if (options != null) {
        (0, _Helpers.extend)(globalSettings, options);
    }

    // Current Settings extend({}, globalSettings)
    var currentSettings = {};

    var currentSettingsRegexp = void 0;
    //Current FontSizes
    var currentFontSizes = null;
    // font Sizes
    var fontSizesCollection = void 0;
    // Vertical Rhythm Calculator
    var rhythmCalculator = void 0;
    // Last Css File
    // let lastFile;

    /**
     * Add Settings to settings table.
     * @param rule - current rule.
     * @param settings - settings tbale.
     */
    var addSettings = function addSettings(rule, settings) {

        rule.walkDecls(function (decl) {

            var prop = (0, _Helpers.toCamelCase)(decl.prop);

            if ((0, _Helpers.scmpStr)(prop, "pxFallback") || (0, _Helpers.scmpStr)(prop, "pxBaseline") || (0, _Helpers.scmpStr)(prop, "roundToHalfLine") || (0, _Helpers.scmpStr)(prop, "ruler") || (0, _Helpers.scmpStr)(prop, "legacyBrowsers") || (0, _Helpers.scmpStr)(prop, "removeComments")) {

                settings[prop] = (0, _Helpers.cmpStr)(decl.value, "true") ? true : false;
            } else if ((0, _Helpers.scmpStr)(prop, "unit")) {

                settings.unit = (0, _Helpers.getUnit)(decl.value);
            } else if ((0, _Helpers.scmpStr)(prop, "lineHeight")) {

                settings.lineHeight = parseFloat(decl.value);
            } else if ((0, _Helpers.scmpStr)(prop, "fontSize") || (0, _Helpers.scmpStr)(prop, "minLinePadding") || (0, _Helpers.scmpStr)(prop, "rulerThickness") || (0, _Helpers.scmpStr)(prop, "rulerScale") || (0, _Helpers.scmpStr)(prop, "browserFontSize")) {

                settings[prop] = parseInt(decl.value);
            } else {

                settings[prop] = decl.value;
            }
        });
    };
    var image = new _PngImage2.default();
    /**
     * Init current Settings
     */
    var initSettings = function initSettings() {
        currentFontSizes = null;
        // Add fontSizes
        if (globalSettings.fontSizes) {
            currentFontSizes = global.fontSizes;
        }

        if (currentSettings.fontSizes) {
            currentFontSizes = currentFontSizes ? currentFontSizes + ", " + currentSettings.fontSizes : currentSettings.fontSizes;
        }

        // ToLowerCase Current Settings
        for (var key in toLowerCaseKeys) {
            if (key in currentSettings) {
                currentSettings[key] = currentSettings[key].toLowerCase();
            }
        }
        //console.log(JSON.stringify(currentSettings, null ,2));
        fontSizesCollection = new _FontSizes2.default(currentSettings);
        rhythmCalculator = new _VerticalRhythm2.default(currentSettings);
        if (currentFontSizes) {
            fontSizesCollection.addFontSizes(currentFontSizes, rhythmCalculator);
        }
        var settingsKeys = Object.keys(currentSettings).join("|");
        var settingsKeysString = (0, _Helpers.toKebabCase)(settingsKeys).replace(/([\-\_])/g, "\\$1");
        currentSettingsRegexp = new RegExp("\\@(" + settingsKeysString + ")", "i");
    };

    var walkDecls = function walkDecls(node) {
        node.walkDecls(function (decl) {

            var found = void 0;
            var ruleFontSize = void 0;

            var findRuleFontSize = function findRuleFontSize() {
                if (ruleFontSize == null) {
                    decl.parent.walkDecls(function (fsdecl) {
                        if ((0, _Helpers.cmpStr)(fsdecl.prop, "font-size")) {
                            ruleFontSize = fsdecl.value;
                        }
                    });
                }
            };

            if (decl.value) {

                // Replace Variables with values
                while (found = decl.value.match(currentSettingsRegexp)) {
                    var variable = (0, _Helpers.toCamelCase)(found[1]);
                    decl.value = decl.value.replace(found[0], currentSettings[variable]);
                }

                // Replace Font Size
                while (found = decl.value.match(fontSizeRegexp)) {
                    var _found$1$split = found[1].split("$"),
                        fontSize = _found$1$split[0],
                        sizeUnit = _found$1$split[1];

                    sizeUnit = sizeUnit ? (0, _Helpers.getUnit)(sizeUnit) : 0;

                    var size = fontSizesCollection.getSize(fontSize);
                    // Write font size
                    if (sizeUnit === _Helpers.UNIT.EM || sizeUnit === _Helpers.UNIT.REM) {

                        decl.value = decl.value.replace(found[0], (0, _Helpers.formatValue)(size.rel) + _Helpers.unitName[sizeUnit]);
                    } else if (sizeUnit === _Helpers.UNIT.PX) {

                        decl.value = decl.value.replace(found[0], (0, _Helpers.formatInt)(size.px) + "px");
                    } else {

                        var cfsize = currentSettings.unit === _Helpers.UNIT.PX ? (0, _Helpers.formatInt)(size.px) : (0, _Helpers.formatValue)(size.rel);

                        decl.value = decl.value.replace(found[0], cfsize + _Helpers.unitName[currentSettings.unit]);
                    }
                }

                // Adjust Font Size
                if ((0, _Helpers.cmpStr)(decl.prop, "adjust-font-size")) {
                    var _decl$value$split = decl.value.split(spaceSplitRegexp),
                        fontSize = _decl$value$split[0],
                        lines = _decl$value$split[1],
                        baseFontSize = _decl$value$split[2];

                    var fontSizeUnit = (0, _Helpers.getUnit)(fontSize);
                    fontSize = rhythmCalculator.convert(fontSize, fontSizeUnit, null, baseFontSize) + _Helpers.unitName[currentSettings.unit];
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

                    var property = found[1]; // lineHeight, spacing, leading, rhythm, !rhythm
                    var parameters = found[2].split(commaSplitRegexp);
                    var ret = [];
                    for (var i in parameters) {
                        var _parameters$i$split = parameters[i].split(spaceSplitRegexp),
                            value = _parameters$i$split[0],
                            _fontSize = _parameters$i$split[1];

                        if (!_fontSize) {
                            findRuleFontSize();
                            _fontSize = ruleFontSize;
                        }

                        if ((0, _Helpers.cmpStr)(property, "lineheight")) {
                            ret.push(rhythmCalculator.lineHeight(_fontSize, value));
                        } else if ((0, _Helpers.cmpStr)(property, "spacing")) {
                            ret.push(rhythmCalculator.lineHeight(_fontSize, value, null, true));
                        } else if ((0, _Helpers.cmpStr)(property, "leading")) {
                            ret.push(rhythmCalculator.leading(value, _fontSize));
                        } else if ((0, _Helpers.cmpStr)(property, "!rhythm")) {
                            var _value$split = value.split("$"),
                                inValue = _value$split[0],
                                outputUnit = _value$split[1];

                            outputUnit = _Helpers.UNIT[outputUnit];
                            ret.push(rhythmCalculator.rhythm(inValue, _fontSize, true, outputUnit));
                        } else if ((0, _Helpers.cmpStr)(property, "rhythm")) {
                            var _value$split2 = value.split("$"),
                                _inValue = _value$split2[0],
                                _outputUnit = _value$split2[1];

                            _outputUnit = _Helpers.UNIT[_outputUnit];
                            ret.push(rhythmCalculator.rhythm(_inValue, _fontSize, false, _outputUnit));
                        }
                    }
                    decl.value = decl.value.replace(found[0], ret.join(" "));
                }

                // rem fallback
                if (currentSettings.pxFallback && decl.value.match(_Helpers.remRegexp)) {
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

            if ((0, _Helpers.cmpStr)(node.type, "atrule")) {

                var rule = node;

                if ((0, _Helpers.cmpStr)(rule.name, "hamster")) {

                    if (!(0, _Helpers.cmpStr)(rule.params, "end")) {

                        addSettings(rule, globalSettings);
                    }
                    // Reset current settings
                    currentSettings = (0, _Helpers.extend)({}, globalSettings);

                    // Init current Settings
                    initSettings();

                    // Remove Rule Hamster
                    rule.remove();
                } else if ((0, _Helpers.cmpStr)(rule.name, "!hamster")) {

                    addSettings(rule, currentSettings);

                    // Init current Settings
                    initSettings();

                    rule.remove();
                } else if ((0, _Helpers.cmpStr)(rule.name, "baseline")) {

                    var lineHeight = rhythmCalculator.lineHeight(currentSettings.fontSize + "px");

                    // baseline font size
                    var fontSizeDecl = null;

                    if (currentSettings.pxBaseline || currentSettings.unit === _Helpers.UNIT.PX && !currentSettings.legacyBrowsers) {

                        fontSizeDecl = _postcss2.default.decl({
                            prop: "font-size",
                            value: currentSettings.fontSize + "px",
                            source: rule.source
                        });
                    } else {

                        var relativeSize = 100 * currentSettings.fontSize / currentSettings.browserFontSize;

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

                    if ((0, _Helpers.cmpStr)(rule.params, "html")) {

                        var htmlRule = _postcss2.default.rule({
                            selector: "html",
                            source: rule.source
                        });

                        htmlRule.append(fontSizeDecl);
                        htmlRule.append(lineHeightDecl);

                        rule.parent.insertAfter(rule, htmlRule);

                        if (currentSettings.unit === _Helpers.UNIT.PX && currentSettings.legacyBrowsers) {
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

                        if (currentSettings.unit === _Helpers.UNIT.REM && currentSettings.pxFallback) {

                            rule.parent.insertBefore(lineHeightDecl, _postcss2.default.decl({
                                prop: "line-height",
                                value: rhythmCalculator.remFallback(lineHeight),
                                source: rule.source
                            }));
                        }
                    }

                    rule.remove();
                } else if ((0, _Helpers.cmpStr)(rule.name, "ruler")) {

                    var rulerIconPosition = currentSettings.rulerIconPosition.replace(/[\'\"]/g, "");

                    var _lineHeight = currentSettings.lineHeight >= currentSettings.fontSize ? currentSettings.lineHeight : currentSettings.lineHeight + "em";

                    //let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M18 24c-0.3 0-0.548-0.246-0.548-0.546V18c0-0.3 0.248-0.546 0.548-0.546h5.452  C23.754 17.454 24 17.7 24 18v5.454c0 0.3-0.246 0.546-0.548 0.546H18z M9.271 24c-0.298 0-0.543-0.246-0.543-0.546V18  c0-0.3 0.245-0.546 0.543-0.546h5.457c0.3 0 0.543 0.246 0.543 0.546v5.454c0 0.3-0.243 0.546-0.543 0.546H9.271z M0.548 24  C0.246 24 0 23.754 0 23.454V18c0-0.3 0.246-0.546 0.548-0.546H6c0.302 0 0.548 0.246 0.548 0.546v5.454C6.548 23.754 6.302 24 6 24  H0.548z M18 15.271c-0.3 0-0.548-0.244-0.548-0.542V9.272c0-0.299 0.248-0.545 0.548-0.545h5.452C23.754 8.727 24 8.973 24 9.272  v5.457c0 0.298-0.246 0.542-0.548 0.542H18z M9.271 15.271c-0.298 0-0.543-0.244-0.543-0.542V9.272c0-0.299 0.245-0.545 0.543-0.545  h5.457c0.3 0 0.543 0.246 0.543 0.545v5.457c0 0.298-0.243 0.542-0.543 0.542H9.271z M0.548 15.271C0.246 15.271 0 15.026 0 14.729  V9.272c0-0.299 0.246-0.545 0.548-0.545H6c0.302 0 0.548 0.246 0.548 0.545v5.457c0 0.298-0.246 0.542-0.548 0.542H0.548z M18 6.545  c-0.3 0-0.548-0.245-0.548-0.545V0.545C17.452 0.245 17.7 0 18 0h5.452C23.754 0 24 0.245 24 0.545V6c0 0.3-0.246 0.545-0.548 0.545  H18z M9.271 6.545C8.974 6.545 8.729 6.3 8.729 6V0.545C8.729 0.245 8.974 0 9.271 0h5.457c0.3 0 0.543 0.245 0.543 0.545V6  c0 0.3-0.243 0.545-0.543 0.545H9.271z M0.548 6.545C0.246 6.545 0 6.3 0 6V0.545C0 0.245 0.246 0 0.548 0H6  c0.302 0 0.548 0.245 0.548 0.545V6c0 0.3-0.246 0.545-0.548 0.545H0.548z%27%2F%3E%3C%2Fsvg%3E";
                    var svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M0,6c0,0.301,0.246,0.545,0.549,0.545h22.906C23.756,6.545,24,6.301,24,6V2.73c0-0.305-0.244-0.549-0.545-0.549H0.549  C0.246,2.182,0,2.426,0,2.73V6z M0,13.637c0,0.297,0.246,0.545,0.549,0.545h22.906c0.301,0,0.545-0.248,0.545-0.545v-3.273  c0-0.297-0.244-0.545-0.545-0.545H0.549C0.246,9.818,0,10.066,0,10.363V13.637z M0,21.27c0,0.305,0.246,0.549,0.549,0.549h22.906  c0.301,0,0.545-0.244,0.545-0.549V18c0-0.301-0.244-0.545-0.545-0.545H0.549C0.246,17.455,0,17.699,0,18V21.27z%27%2F%3E%3C%2Fsvg%3E";
                    //let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 32 32%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M28,20h-4v-8h4c1.104,0,2-0.896,2-2s-0.896-2-2-2h-4V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v4h-8V4c0-1.104-0.896-2-2-2  S8,2.896,8,4v4H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h4v8H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h4v4c0,1.104,0.896,2,2,2s2-0.896,2-2v-4  h8v4c0,1.104,0.896,2,2,2s2-0.896,2-2v-4h4c1.104,0,2-0.896,2-2S29.104,20,28,20z M12,20v-8h8v8H12z%27%2F%3E%3C%2Fsvg%3E";
                    var gthickness = currentSettings.rulerThickness;

                    var background = "";

                    if ((0, _Helpers.cmpStr)(currentSettings.rulerBackground, "png")) {

                        var imageHeight = currentSettings.lineHeight >= currentSettings.fontSize ? currentSettings.lineHeight : Math.round(currentSettings.lineHeight * currentSettings.fontSize);

                        var pattern = currentSettings.rulerPattern.split(spaceSplitRegexp);

                        image.rulerMatrix(imageHeight, currentSettings.rulerColor, pattern, currentSettings.rulerThickness, currentSettings.rulerScale);

                        if (!(0, _Helpers.cmpStr)(currentSettings.rulerOutput, "base64")) {
                            image.getFile(currentSettings.rulerOutput);
                            background = "background-image: url(\"../" + currentSettings.rulerOutput + "\");" + "background-position: left top;" + "background-repeat: repeat;" + "background-size: " + pattern.length + "px " + imageHeight + "px;";
                        } else {
                            background = "background-image: url(\"data:image/png;base64," + image.getBase64() + "\");" + "background-position: left top;" + "background-repeat: repeat;" + "background-size: " + pattern.length + "px " + imageHeight + "px;";
                        }
                    } else {

                        gthickness = gthickness * 3;

                        background = "background-image: linear-gradient(to top, " + currentSettings.rulerColor + " " + gthickness + "%, transparent " + gthickness + "%);" + "background-size: 100% " + _lineHeight + ";";
                    }

                    var ruler = "position: absolute;left: 0;top: 0;margin: 0;padding: 0;width: 100%;height: 100%;z-index: 9900;pointer-events: none;" + background;

                    var iconSize = currentSettings.rulerIconSize;

                    var _currentSettings$rule = currentSettings.rulerStyle.split(spaceSplitRegexp),
                        style = _currentSettings$rule[0],
                        rulerClass = _currentSettings$rule[1];

                    var _currentSettings$rule2 = currentSettings.rulerIconColors.split(spaceSplitRegexp),
                        color = _currentSettings$rule2[0],
                        hoverColor = _currentSettings$rule2[1];

                    var rulerRule = null;

                    if ((0, _Helpers.cmpStr)(style, "switch")) {

                        rulerRule = _postcss2.default.parse("." + rulerClass + "{" + "display: none;" + ruler + "}" + "input[id=\"" + rulerClass + "\"] {" + "display:none;" + "}" + "input[id=\"" + rulerClass + "\"] + label {" + "z-index: 9999;" + "display: inline-block;" + rulerIconPosition + "margin: 0;" + "padding: 0;" + "width: " + iconSize + ";" + "height: " + iconSize + ";" + "cursor: pointer;" + "background-image: url(\"" + svg.replace(/\{color\}/, escape(color)) + "\");" + "}" + "input[id=\"" + rulerClass + "\"]:checked + label, input[id=\"" + rulerClass + "\"]:hover + label {" + "background-image: url(\"" + svg.replace(/\{color\}/, escape(hoverColor)) + "\");" + "}" + "input[id=\"" + rulerClass + "\"]:checked ~ ." + rulerClass + "{" + "display: block;" + "}");
                    } else if ((0, _Helpers.cmpStr)(style, "hover")) {

                        rulerRule = _postcss2.default.parse("." + rulerClass + "{" + rulerIconPosition + "margin: 0;" + "padding: 0;" + "width: " + iconSize + ";" + "height: " + iconSize + ";" + "background-image: url(\"" + svg.replace("{color}", escape(color)) + "\");" + "transition: background-image 0.5s ease-in-out;" + "}" + "." + rulerClass + ":hover" + "{" + "cursor: pointer;" + ruler + "}");
                    } else if ((0, _Helpers.cmpStr)(style, "always")) {

                        rulerRule = _postcss2.default.parse("." + rulerClass + "{\n" + ruler + "}\n");
                    }

                    if (rulerRule) {
                        rulerRule.source = rule.source;
                        rule.parent.insertBefore(rule, rulerRule);
                    }

                    rule.remove();
                } else if ((0, _Helpers.cmpStr)(rule.name, "ellipsis") || (0, _Helpers.cmpStr)(rule.name, "nowrap") || (0, _Helpers.cmpStr)(rule.name, "forcewrap") || (0, _Helpers.cmpStr)(rule.name, "hyphens") || (0, _Helpers.cmpStr)(rule.name, "break-word")) {

                    var property = (0, _Helpers.toCamelCase)(rule.name);

                    var decls = helpers[property];

                    if ((0, _Helpers.cmpStr)(property, "hyphens") && (0, _Helpers.cmpStr)(rule.params, "true")) {
                        decls = helpers.breakWord + decls;
                    } else if ((0, _Helpers.cmpStr)(property, "ellipsis") && (0, _Helpers.cmpStr)(rule.params, "true")) {
                        decls = helpers.nowrap + decls;
                    }

                    if ((0, _Helpers.cmpStr)(currentSettings.properties, "inline")) {

                        var idecls = _postcss2.default.parse(decls);
                        rule.parent.insertBefore(rule, idecls);
                    } else {

                        var extendName = (0, _Helpers.toCamelCase)(property + rule.params);

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
                } else if ((0, _Helpers.cmpStr)(rule.name, "reset") | (0, _Helpers.cmpStr)(rule.name, "normalize")) {
                    var _property = rule.name.toLowerCase();
                    var rules = _postcss2.default.parse(helpers[_property]);
                    rules.source = rule.source;
                    rule.parent.insertAfter(rule, rules);
                    rule.remove();
                }
                // Walk in media queries
                node.walk(function (child) {

                    if ((0, _Helpers.cmpStr)(child.type, "rule")) {
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
            } else if ((0, _Helpers.cmpStr)(node.type, "rule")) {

                // Walk decls in rule
                walkDecls(node);
            } else if (currentSettings.removeComments && (0, _Helpers.cmpStr)(node.type, "comment")) {
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
                if (node.parents[i].nodes.length === 0) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhhbXN0ZXIiLCJvcHRpb25zIiwiZ2xvYmFsU2V0dGluZ3MiLCJmb250U2l6ZSIsImxpbmVIZWlnaHQiLCJ1bml0IiwiRU0iLCJweEZhbGxiYWNrIiwicHhCYXNlbGluZSIsImZvbnRSYXRpbyIsInByb3BlcnRpZXMiLCJtaW5MaW5lUGFkZGluZyIsInJvdW5kVG9IYWxmTGluZSIsInJ1bGVyIiwicnVsZXJTdHlsZSIsInJ1bGVySWNvblBvc2l0aW9uIiwicnVsZXJJY29uQ29sb3JzIiwicnVsZXJJY29uU2l6ZSIsInJ1bGVyQ29sb3IiLCJydWxlclRoaWNrbmVzcyIsInJ1bGVyQmFja2dyb3VuZCIsInJ1bGVyT3V0cHV0IiwicnVsZXJQYXR0ZXJuIiwicnVsZXJTY2FsZSIsImJyb3dzZXJGb250U2l6ZSIsImxlZ2FjeUJyb3dzZXJzIiwicmVtb3ZlQ29tbWVudHMiLCJ0b0xvd2VyQ2FzZUtleXMiLCJoZWxwZXJzIiwicmVzZXQiLCJyZWFkRmlsZVN5bmMiLCJyZXNvbHZlIiwiX19kaXJuYW1lIiwibm9ybWFsaXplIiwibm93cmFwIiwiZm9yY2V3cmFwIiwiZWxsaXBzaXMiLCJoeXBoZW5zIiwiYnJlYWtXb3JkIiwiZm9udFNpemVSZWdleHAiLCJyaHl0aG1SZWdleHAiLCJjb21tYVNwbGl0UmVnZXhwIiwic3BhY2VTcGxpdFJlZ2V4cCIsImN1cnJlbnRTZXR0aW5ncyIsImN1cnJlbnRTZXR0aW5nc1JlZ2V4cCIsImN1cnJlbnRGb250U2l6ZXMiLCJmb250U2l6ZXNDb2xsZWN0aW9uIiwicmh5dGhtQ2FsY3VsYXRvciIsImFkZFNldHRpbmdzIiwicnVsZSIsInNldHRpbmdzIiwid2Fsa0RlY2xzIiwicHJvcCIsImRlY2wiLCJ2YWx1ZSIsInBhcnNlRmxvYXQiLCJwYXJzZUludCIsImltYWdlIiwiaW5pdFNldHRpbmdzIiwiZm9udFNpemVzIiwiZ2xvYmFsIiwia2V5IiwidG9Mb3dlckNhc2UiLCJhZGRGb250U2l6ZXMiLCJzZXR0aW5nc0tleXMiLCJPYmplY3QiLCJrZXlzIiwiam9pbiIsInNldHRpbmdzS2V5c1N0cmluZyIsInJlcGxhY2UiLCJSZWdFeHAiLCJub2RlIiwiZm91bmQiLCJydWxlRm9udFNpemUiLCJmaW5kUnVsZUZvbnRTaXplIiwicGFyZW50IiwiZnNkZWNsIiwibWF0Y2giLCJ2YXJpYWJsZSIsInNwbGl0Iiwic2l6ZVVuaXQiLCJzaXplIiwiZ2V0U2l6ZSIsIlJFTSIsInJlbCIsIlBYIiwicHgiLCJjZnNpemUiLCJsaW5lcyIsImJhc2VGb250U2l6ZSIsImZvbnRTaXplVW5pdCIsImNvbnZlcnQiLCJsaW5lSGVpZ2h0RGVjbCIsInNvdXJjZSIsImluc2VydEFmdGVyIiwicHJvcGVydHkiLCJwYXJhbWV0ZXJzIiwicmV0IiwiaSIsInB1c2giLCJsZWFkaW5nIiwiaW5WYWx1ZSIsIm91dHB1dFVuaXQiLCJyaHl0aG0iLCJpbnNlcnRCZWZvcmUiLCJjbG9uZSIsInJlbUZhbGxiYWNrIiwiY3NzIiwiZXh0ZW5kTm9kZXMiLCJ3YWxrIiwidHlwZSIsIm5hbWUiLCJwYXJhbXMiLCJyZW1vdmUiLCJmb250U2l6ZURlY2wiLCJyZWxhdGl2ZVNpemUiLCJodG1sUnVsZSIsInNlbGVjdG9yIiwiYXBwZW5kIiwiYXN0ZXJpc2tIdG1sUnVsZSIsInN2ZyIsImd0aGlja25lc3MiLCJiYWNrZ3JvdW5kIiwiaW1hZ2VIZWlnaHQiLCJNYXRoIiwicm91bmQiLCJwYXR0ZXJuIiwicnVsZXJNYXRyaXgiLCJnZXRGaWxlIiwibGVuZ3RoIiwiZ2V0QmFzZTY0IiwiaWNvblNpemUiLCJzdHlsZSIsInJ1bGVyQ2xhc3MiLCJjb2xvciIsImhvdmVyQ29sb3IiLCJydWxlclJ1bGUiLCJwYXJzZSIsImVzY2FwZSIsImRlY2xzIiwiaWRlY2xzIiwiZXh0ZW5kTmFtZSIsInBhcmVudHMiLCJwcmV2IiwiY291bnQiLCJydWxlcyIsImNoaWxkIiwibm9kZXMiXSwibWFwcGluZ3MiOiI7Ozs7QUFZQTs7OztBQUVBOztBQWNBOzs7O0FBRUE7Ozs7QUFHQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUVBLElBQU1BLFVBQVUsU0FBVkEsT0FBVSxHQUFvQjtBQUFBLFFBQW5CQyxPQUFtQix1RUFBVCxJQUFTOzs7QUFFaEM7QUFDQSxRQUFJQyxpQkFBaUI7O0FBRWpCQyxrQkFBVSxFQUZPO0FBR2pCQyxvQkFBWSxHQUhLO0FBSWpCQyxjQUFNLGNBQUtDLEVBSk07QUFLakJDLG9CQUFZLElBTEs7QUFNakJDLG9CQUFZLEtBTks7QUFPakJDLG1CQUFXLE1BUE07O0FBU2pCQyxvQkFBWSxRQVRLOztBQVdqQkMsd0JBQWdCLENBWEM7QUFZakJDLHlCQUFpQixLQVpBOztBQWNqQkMsZUFBTyxJQWRVO0FBZWpCQyxvQkFBWSxvQkFmSztBQWdCakJDLDJCQUFtQix5Q0FoQkY7QUFpQmpCQyx5QkFBaUIsaUJBakJBO0FBa0JqQkMsdUJBQWUsTUFsQkU7QUFtQmpCQyxvQkFBWSx3QkFuQks7QUFvQmpCQyx3QkFBZ0IsQ0FwQkM7QUFxQmpCQyx5QkFBaUIsVUFyQkE7QUFzQmpCQyxxQkFBYSxRQXRCSTtBQXVCakJDLHNCQUFjLFNBdkJHO0FBd0JqQkMsb0JBQVksQ0F4Qks7O0FBMEJqQkMseUJBQWlCLEVBMUJBO0FBMkJqQkMsd0JBQWdCLElBM0JDO0FBNEJqQkMsd0JBQWdCO0FBNUJDLEtBQXJCOztBQStCQTtBQUNBLFFBQUlDLGtCQUFrQixDQUNsQixNQURrQixFQUVsQixXQUZrQixFQUdsQixZQUhrQixFQUlsQixZQUprQixFQUtsQixpQkFMa0IsRUFNbEIsYUFOa0IsQ0FBdEI7O0FBU0EsUUFBSUMsVUFBVTs7QUFFVkMsZUFBTyxhQUFHQyxZQUFILENBQWdCLGVBQUtDLE9BQUwsQ0FBYUMsU0FBYixFQUF3QixzQkFBeEIsQ0FBaEIsRUFBaUUsTUFBakUsQ0FGRzs7QUFJVkMsbUJBQVcsYUFBR0gsWUFBSCxDQUFnQixlQUFLQyxPQUFMLENBQWFDLFNBQWIsRUFBd0IsMEJBQXhCLENBQWhCLEVBQXFFLE1BQXJFLENBSkQ7O0FBTVZFLGdCQUFRLHNCQU5FOztBQVFWQyx3R0FSVTs7QUFhVkMsNkRBYlU7O0FBZ0JWQyx1REFoQlU7O0FBbUJWQztBQUNJO0FBREo7QUFuQlUsS0FBZDs7QUEwQkE7QUFDQSxRQUFNQyxpQkFBaUIsa0NBQXZCOztBQUVBO0FBQ0EsUUFBTUMsZUFBZSx3REFBckI7O0FBRUE7QUFDQSxRQUFNQyxtQkFBbUIsVUFBekI7O0FBRUE7QUFDQSxRQUFNQyxtQkFBbUIsS0FBekI7O0FBRUEsUUFBSXpDLFdBQVcsSUFBZixFQUFxQjtBQUNqQiw2QkFBT0MsY0FBUCxFQUF1QkQsT0FBdkI7QUFDSDs7QUFFRDtBQUNBLFFBQUkwQyxrQkFBa0IsRUFBdEI7O0FBRUEsUUFBSUMsOEJBQUo7QUFDQTtBQUNBLFFBQUlDLG1CQUFtQixJQUF2QjtBQUNBO0FBQ0EsUUFBSUMsNEJBQUo7QUFDQTtBQUNBLFFBQUlDLHlCQUFKO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7QUFLQSxRQUFNQyxjQUFjLFNBQWRBLFdBQWMsQ0FBQ0MsSUFBRCxFQUFPQyxRQUFQLEVBQW9COztBQUVwQ0QsYUFBS0UsU0FBTCxDQUFlLGdCQUFROztBQUVuQixnQkFBSUMsT0FBTywwQkFBWUMsS0FBS0QsSUFBakIsQ0FBWDs7QUFFQSxnQkFBSSxzQkFBUUEsSUFBUixFQUFjLFlBQWQsS0FBK0Isc0JBQVFBLElBQVIsRUFBYyxZQUFkLENBQS9CLElBQ0Esc0JBQVFBLElBQVIsRUFBYyxpQkFBZCxDQURBLElBQ29DLHNCQUFRQSxJQUFSLEVBQWMsT0FBZCxDQURwQyxJQUVBLHNCQUFRQSxJQUFSLEVBQWMsZ0JBQWQsQ0FGQSxJQUVtQyxzQkFBUUEsSUFBUixFQUFjLGdCQUFkLENBRnZDLEVBRXdFOztBQUVwRUYseUJBQVNFLElBQVQsSUFBaUIscUJBQU9DLEtBQUtDLEtBQVosRUFBbUIsTUFBbkIsSUFBNkIsSUFBN0IsR0FBb0MsS0FBckQ7QUFFSCxhQU5ELE1BTU8sSUFBSSxzQkFBUUYsSUFBUixFQUFjLE1BQWQsQ0FBSixFQUEyQjs7QUFFOUJGLHlCQUFTN0MsSUFBVCxHQUFnQixzQkFBUWdELEtBQUtDLEtBQWIsQ0FBaEI7QUFFSCxhQUpNLE1BSUEsSUFBSSxzQkFBUUYsSUFBUixFQUFjLFlBQWQsQ0FBSixFQUFpQzs7QUFFcENGLHlCQUFTOUMsVUFBVCxHQUFzQm1ELFdBQVdGLEtBQUtDLEtBQWhCLENBQXRCO0FBRUgsYUFKTSxNQUlBLElBQUksc0JBQVFGLElBQVIsRUFBYyxVQUFkLEtBQTZCLHNCQUFRQSxJQUFSLEVBQWMsZ0JBQWQsQ0FBN0IsSUFDUCxzQkFBUUEsSUFBUixFQUFjLGdCQUFkLENBRE8sSUFDNEIsc0JBQVFBLElBQVIsRUFBYyxZQUFkLENBRDVCLElBRVAsc0JBQVFBLElBQVIsRUFBYyxpQkFBZCxDQUZHLEVBRStCOztBQUVsQ0YseUJBQVNFLElBQVQsSUFBaUJJLFNBQVNILEtBQUtDLEtBQWQsQ0FBakI7QUFFSCxhQU5NLE1BTUE7O0FBRUhKLHlCQUFTRSxJQUFULElBQWlCQyxLQUFLQyxLQUF0QjtBQUVIO0FBRUosU0E5QkQ7QUErQkgsS0FqQ0Q7QUFrQ0EsUUFBSUcsUUFBUSx3QkFBWjtBQUNBOzs7QUFHQSxRQUFNQyxlQUFlLFNBQWZBLFlBQWUsR0FBTTtBQUN2QmIsMkJBQW1CLElBQW5CO0FBQ0E7QUFDQSxZQUFJM0MsZUFBZXlELFNBQW5CLEVBQThCO0FBQzFCZCwrQkFBbUJlLE9BQU9ELFNBQTFCO0FBQ0g7O0FBRUQsWUFBSWhCLGdCQUFnQmdCLFNBQXBCLEVBQStCO0FBQzNCZCwrQkFBb0JBLGdCQUFELEdBQXFCQSxtQkFBbUIsSUFBbkIsR0FBMEJGLGdCQUFnQmdCLFNBQS9ELEdBQTJFaEIsZ0JBQWdCZ0IsU0FBOUc7QUFDSDs7QUFFRDtBQUNBLGFBQUssSUFBSUUsR0FBVCxJQUFnQmxDLGVBQWhCLEVBQWlDO0FBQzdCLGdCQUFJa0MsT0FBT2xCLGVBQVgsRUFBNEI7QUFDeEJBLGdDQUFnQmtCLEdBQWhCLElBQXVCbEIsZ0JBQWdCa0IsR0FBaEIsRUFBcUJDLFdBQXJCLEVBQXZCO0FBQ0g7QUFDSjtBQUNEO0FBQ0FoQiw4QkFBc0Isd0JBQWNILGVBQWQsQ0FBdEI7QUFDQUksMkJBQW1CLDZCQUFtQkosZUFBbkIsQ0FBbkI7QUFDQSxZQUFJRSxnQkFBSixFQUFzQjtBQUNsQkMsZ0NBQW9CaUIsWUFBcEIsQ0FBaUNsQixnQkFBakMsRUFBbURFLGdCQUFuRDtBQUNIO0FBQ0QsWUFBSWlCLGVBQWVDLE9BQU9DLElBQVAsQ0FBWXZCLGVBQVosRUFBNkJ3QixJQUE3QixDQUFrQyxHQUFsQyxDQUFuQjtBQUNBLFlBQUlDLHFCQUFxQiwwQkFBWUosWUFBWixFQUEwQkssT0FBMUIsQ0FBa0MsV0FBbEMsRUFBK0MsTUFBL0MsQ0FBekI7QUFDQXpCLGdDQUF3QixJQUFJMEIsTUFBSixDQUFXLFNBQVNGLGtCQUFULEdBQThCLEdBQXpDLEVBQThDLEdBQTlDLENBQXhCO0FBQ0gsS0ExQkQ7O0FBNEJBLFFBQU1qQixZQUFZLFNBQVpBLFNBQVksQ0FBQ29CLElBQUQsRUFBVTtBQUN4QkEsYUFBS3BCLFNBQUwsQ0FBZSxnQkFBUTs7QUFFbkIsZ0JBQUlxQixjQUFKO0FBQ0EsZ0JBQUlDLHFCQUFKOztBQUVBLGdCQUFJQyxtQkFBbUIsU0FBbkJBLGdCQUFtQixHQUFNO0FBQ3pCLG9CQUFJRCxnQkFBZ0IsSUFBcEIsRUFBMEI7QUFDdEJwQix5QkFBS3NCLE1BQUwsQ0FBWXhCLFNBQVosQ0FBc0Isa0JBQVU7QUFDNUIsNEJBQUkscUJBQU95QixPQUFPeEIsSUFBZCxFQUFvQixXQUFwQixDQUFKLEVBQXNDO0FBQ2xDcUIsMkNBQWVHLE9BQU90QixLQUF0QjtBQUNIO0FBQ0oscUJBSkQ7QUFLSDtBQUNKLGFBUkQ7O0FBVUEsZ0JBQUlELEtBQUtDLEtBQVQsRUFBZ0I7O0FBRVo7QUFDQSx1QkFBUWtCLFFBQVFuQixLQUFLQyxLQUFMLENBQVd1QixLQUFYLENBQWlCakMscUJBQWpCLENBQWhCLEVBQTBEO0FBQ3RELHdCQUFJa0MsV0FBVywwQkFBWU4sTUFBTSxDQUFOLENBQVosQ0FBZjtBQUNBbkIseUJBQUtDLEtBQUwsR0FBYUQsS0FBS0MsS0FBTCxDQUFXZSxPQUFYLENBQW1CRyxNQUFNLENBQU4sQ0FBbkIsRUFBNkI3QixnQkFBZ0JtQyxRQUFoQixDQUE3QixDQUFiO0FBRUg7O0FBRUQ7QUFDQSx1QkFBUU4sUUFBUW5CLEtBQUtDLEtBQUwsQ0FBV3VCLEtBQVgsQ0FBaUJ0QyxjQUFqQixDQUFoQixFQUFtRDtBQUFBLHlDQUVwQmlDLE1BQU0sQ0FBTixFQUFTTyxLQUFULENBQWUsR0FBZixDQUZvQjtBQUFBLHdCQUUxQzVFLFFBRjBDO0FBQUEsd0JBRWhDNkUsUUFGZ0M7O0FBSS9DQSwrQkFBWUEsUUFBRCxHQUFhLHNCQUFRQSxRQUFSLENBQWIsR0FBaUMsQ0FBNUM7O0FBRUEsd0JBQUlDLE9BQU9uQyxvQkFBb0JvQyxPQUFwQixDQUE0Qi9FLFFBQTVCLENBQVg7QUFDQTtBQUNBLHdCQUFJNkUsYUFBYSxjQUFLMUUsRUFBbEIsSUFBd0IwRSxhQUFhLGNBQUtHLEdBQTlDLEVBQW1EOztBQUUvQzlCLDZCQUFLQyxLQUFMLEdBQWFELEtBQUtDLEtBQUwsQ0FBV2UsT0FBWCxDQUFtQkcsTUFBTSxDQUFOLENBQW5CLEVBQTZCLDBCQUFZUyxLQUFLRyxHQUFqQixJQUF3QixrQkFBU0osUUFBVCxDQUFyRCxDQUFiO0FBRUgscUJBSkQsTUFJTyxJQUFJQSxhQUFhLGNBQUtLLEVBQXRCLEVBQTBCOztBQUU3QmhDLDZCQUFLQyxLQUFMLEdBQWFELEtBQUtDLEtBQUwsQ0FBV2UsT0FBWCxDQUFtQkcsTUFBTSxDQUFOLENBQW5CLEVBQTZCLHdCQUFVUyxLQUFLSyxFQUFmLElBQXFCLElBQWxELENBQWI7QUFFSCxxQkFKTSxNQUlBOztBQUVILDRCQUFJQyxTQUFTNUMsZ0JBQWdCdEMsSUFBaEIsS0FBeUIsY0FBS2dGLEVBQTlCLEdBQW1DLHdCQUFVSixLQUFLSyxFQUFmLENBQW5DLEdBQXdELDBCQUFZTCxLQUFLRyxHQUFqQixDQUFyRTs7QUFFQS9CLDZCQUFLQyxLQUFMLEdBQWFELEtBQUtDLEtBQUwsQ0FBV2UsT0FBWCxDQUFtQkcsTUFBTSxDQUFOLENBQW5CLEVBQTZCZSxTQUFTLGtCQUFTNUMsZ0JBQWdCdEMsSUFBekIsQ0FBdEMsQ0FBYjtBQUVIO0FBRUo7O0FBRUQ7QUFDQSxvQkFBSSxxQkFBT2dELEtBQUtELElBQVosRUFBa0Isa0JBQWxCLENBQUosRUFBMkM7QUFBQSw0Q0FFREMsS0FBS0MsS0FBTCxDQUFXeUIsS0FBWCxDQUFpQnJDLGdCQUFqQixDQUZDO0FBQUEsd0JBRWxDdkMsUUFGa0M7QUFBQSx3QkFFeEJxRixLQUZ3QjtBQUFBLHdCQUVqQkMsWUFGaUI7O0FBR3ZDLHdCQUFJQyxlQUFlLHNCQUFRdkYsUUFBUixDQUFuQjtBQUNBQSwrQkFBVzRDLGlCQUFpQjRDLE9BQWpCLENBQXlCeEYsUUFBekIsRUFBbUN1RixZQUFuQyxFQUFpRCxJQUFqRCxFQUF1REQsWUFBdkQsSUFBdUUsa0JBQVM5QyxnQkFBZ0J0QyxJQUF6QixDQUFsRjtBQUNBZ0QseUJBQUtDLEtBQUwsR0FBYW5ELFFBQWI7O0FBRUEsd0JBQUlDLGFBQWEyQyxpQkFBaUIzQyxVQUFqQixDQUE0QkQsUUFBNUIsRUFBc0NxRixLQUF0QyxFQUE2Q0MsWUFBN0MsQ0FBakI7O0FBRUEsd0JBQUlHLGlCQUFpQixrQkFBUXZDLElBQVIsQ0FBYTtBQUM5QkQsOEJBQU0sYUFEd0I7QUFFOUJFLCtCQUFPbEQsVUFGdUI7QUFHOUJ5RixnQ0FBUXhDLEtBQUt3QztBQUhpQixxQkFBYixDQUFyQjs7QUFNQXhDLHlCQUFLRCxJQUFMLEdBQVksV0FBWjtBQUNBQyx5QkFBS3NCLE1BQUwsQ0FBWW1CLFdBQVosQ0FBd0J6QyxJQUF4QixFQUE4QnVDLGNBQTlCO0FBRUg7QUFDRDtBQUNBLHVCQUFRcEIsUUFBUW5CLEtBQUtDLEtBQUwsQ0FBV3VCLEtBQVgsQ0FBaUJyQyxZQUFqQixDQUFoQixFQUFpRDs7QUFFN0Msd0JBQUl1RCxXQUFXdkIsTUFBTSxDQUFOLENBQWYsQ0FGNkMsQ0FFcEI7QUFDekIsd0JBQUl3QixhQUFheEIsTUFBTSxDQUFOLEVBQVNPLEtBQVQsQ0FBZXRDLGdCQUFmLENBQWpCO0FBQ0Esd0JBQUl3RCxNQUFNLEVBQVY7QUFDQSx5QkFBSyxJQUFJQyxDQUFULElBQWNGLFVBQWQsRUFBMEI7QUFBQSxrREFFRUEsV0FBV0UsQ0FBWCxFQUFjbkIsS0FBZCxDQUFvQnJDLGdCQUFwQixDQUZGO0FBQUEsNEJBRWpCWSxLQUZpQjtBQUFBLDRCQUVWbkQsU0FGVTs7QUFJdEIsNEJBQUksQ0FBQ0EsU0FBTCxFQUFlO0FBQ1h1RTtBQUNBdkUsd0NBQVdzRSxZQUFYO0FBQ0g7O0FBRUQsNEJBQUkscUJBQU9zQixRQUFQLEVBQWlCLFlBQWpCLENBQUosRUFBb0M7QUFDaENFLGdDQUFJRSxJQUFKLENBQVNwRCxpQkFBaUIzQyxVQUFqQixDQUE0QkQsU0FBNUIsRUFBc0NtRCxLQUF0QyxDQUFUO0FBQ0gseUJBRkQsTUFFTyxJQUFJLHFCQUFPeUMsUUFBUCxFQUFpQixTQUFqQixDQUFKLEVBQWlDO0FBQ3BDRSxnQ0FBSUUsSUFBSixDQUFTcEQsaUJBQWlCM0MsVUFBakIsQ0FBNEJELFNBQTVCLEVBQXNDbUQsS0FBdEMsRUFBNkMsSUFBN0MsRUFBbUQsSUFBbkQsQ0FBVDtBQUNILHlCQUZNLE1BRUEsSUFBSSxxQkFBT3lDLFFBQVAsRUFBaUIsU0FBakIsQ0FBSixFQUFpQztBQUNwQ0UsZ0NBQUlFLElBQUosQ0FBU3BELGlCQUFpQnFELE9BQWpCLENBQXlCOUMsS0FBekIsRUFBZ0NuRCxTQUFoQyxDQUFUO0FBQ0gseUJBRk0sTUFFQSxJQUFJLHFCQUFPNEYsUUFBUCxFQUFpQixTQUFqQixDQUFKLEVBQWlDO0FBQUEsK0NBQ1J6QyxNQUFNeUIsS0FBTixDQUFZLEdBQVosQ0FEUTtBQUFBLGdDQUMvQnNCLE9BRCtCO0FBQUEsZ0NBQ3RCQyxVQURzQjs7QUFFcENBLHlDQUFhLGNBQUtBLFVBQUwsQ0FBYjtBQUNBTCxnQ0FBSUUsSUFBSixDQUFTcEQsaUJBQWlCd0QsTUFBakIsQ0FBd0JGLE9BQXhCLEVBQWlDbEcsU0FBakMsRUFBMkMsSUFBM0MsRUFBaURtRyxVQUFqRCxDQUFUO0FBQ0gseUJBSk0sTUFJQSxJQUFJLHFCQUFPUCxRQUFQLEVBQWlCLFFBQWpCLENBQUosRUFBZ0M7QUFBQSxnREFDUHpDLE1BQU15QixLQUFOLENBQVksR0FBWixDQURPO0FBQUEsZ0NBQzlCc0IsUUFEOEI7QUFBQSxnQ0FDckJDLFdBRHFCOztBQUVuQ0EsMENBQWEsY0FBS0EsV0FBTCxDQUFiO0FBQ0FMLGdDQUFJRSxJQUFKLENBQVNwRCxpQkFBaUJ3RCxNQUFqQixDQUF3QkYsUUFBeEIsRUFBaUNsRyxTQUFqQyxFQUEyQyxLQUEzQyxFQUFrRG1HLFdBQWxELENBQVQ7QUFDSDtBQUNKO0FBQ0RqRCx5QkFBS0MsS0FBTCxHQUFhRCxLQUFLQyxLQUFMLENBQVdlLE9BQVgsQ0FBbUJHLE1BQU0sQ0FBTixDQUFuQixFQUE2QnlCLElBQUk5QixJQUFKLENBQVMsR0FBVCxDQUE3QixDQUFiO0FBQ0g7O0FBRUQ7QUFDQSxvQkFBSXhCLGdCQUFnQnBDLFVBQWhCLElBQThCOEMsS0FBS0MsS0FBTCxDQUFXdUIsS0FBWCxvQkFBbEMsRUFBK0Q7QUFDM0R4Qix5QkFBS3NCLE1BQUwsQ0FBWTZCLFlBQVosQ0FBeUJuRCxJQUF6QixFQUErQkEsS0FBS29ELEtBQUwsQ0FBVztBQUN0Q25ELCtCQUFPUCxpQkFBaUIyRCxXQUFqQixDQUE2QnJELEtBQUtDLEtBQWxDLENBRCtCO0FBRXRDdUMsZ0NBQVF4QyxLQUFLd0M7QUFGeUIscUJBQVgsQ0FBL0I7QUFJSDtBQUNKO0FBQ0osU0FqSEQ7QUFrSEgsS0FuSEQ7O0FBcUhBLFdBQU8sVUFBQ2MsR0FBRCxFQUFTOztBQUVaO0FBQ0EsWUFBSUMsY0FBYyxFQUFsQjs7QUFFQUQsWUFBSUUsSUFBSixDQUFTLGdCQUFRO0FBQ2I7QUFDQTtBQUNBOztBQUVBLGdCQUFJLHFCQUFPdEMsS0FBS3VDLElBQVosRUFBa0IsUUFBbEIsQ0FBSixFQUFpQzs7QUFFN0Isb0JBQUk3RCxPQUFPc0IsSUFBWDs7QUFFQSxvQkFBSSxxQkFBT3RCLEtBQUs4RCxJQUFaLEVBQWtCLFNBQWxCLENBQUosRUFBa0M7O0FBRTlCLHdCQUFJLENBQUMscUJBQU85RCxLQUFLK0QsTUFBWixFQUFvQixLQUFwQixDQUFMLEVBQWlDOztBQUU3QmhFLG9DQUFZQyxJQUFaLEVBQWtCL0MsY0FBbEI7QUFFSDtBQUNEO0FBQ0F5QyxzQ0FBa0IscUJBQU8sRUFBUCxFQUFXekMsY0FBWCxDQUFsQjs7QUFFQTtBQUNBd0Q7O0FBRUE7QUFDQVQseUJBQUtnRSxNQUFMO0FBRUgsaUJBaEJELE1BZ0JPLElBQUkscUJBQU9oRSxLQUFLOEQsSUFBWixFQUFrQixVQUFsQixDQUFKLEVBQW1DOztBQUV0Qy9ELGdDQUFZQyxJQUFaLEVBQWtCTixlQUFsQjs7QUFFQTtBQUNBZTs7QUFFQVQseUJBQUtnRSxNQUFMO0FBRUgsaUJBVE0sTUFTQSxJQUFJLHFCQUFPaEUsS0FBSzhELElBQVosRUFBa0IsVUFBbEIsQ0FBSixFQUFtQzs7QUFFdEMsd0JBQUkzRyxhQUFhMkMsaUJBQWlCM0MsVUFBakIsQ0FBNEJ1QyxnQkFBZ0J4QyxRQUFoQixHQUEyQixJQUF2RCxDQUFqQjs7QUFFQTtBQUNBLHdCQUFJK0csZUFBZSxJQUFuQjs7QUFFQSx3QkFBSXZFLGdCQUFnQm5DLFVBQWhCLElBQStCbUMsZ0JBQWdCdEMsSUFBaEIsS0FBeUIsY0FBS2dGLEVBQTlCLElBQW9DLENBQUMxQyxnQkFBZ0JsQixjQUF4RixFQUF5Rzs7QUFFckd5Rix1Q0FBZSxrQkFBUTdELElBQVIsQ0FBYTtBQUN4QkQsa0NBQU0sV0FEa0I7QUFFeEJFLG1DQUFPWCxnQkFBZ0J4QyxRQUFoQixHQUEyQixJQUZWO0FBR3hCMEYsb0NBQVE1QyxLQUFLNEM7QUFIVyx5QkFBYixDQUFmO0FBTUgscUJBUkQsTUFRTzs7QUFFSCw0QkFBSXNCLGVBQWUsTUFBTXhFLGdCQUFnQnhDLFFBQXRCLEdBQWlDd0MsZ0JBQWdCbkIsZUFBcEU7O0FBRUEwRix1Q0FBZSxrQkFBUTdELElBQVIsQ0FBYTtBQUN4QkQsa0NBQU0sV0FEa0I7QUFFeEJFLG1DQUFPLDBCQUFZNkQsWUFBWixJQUE0QixHQUZYO0FBR3hCdEIsb0NBQVE1QyxLQUFLNEM7QUFIVyx5QkFBYixDQUFmO0FBTUg7O0FBRUQsd0JBQUlELGlCQUFpQixrQkFBUXZDLElBQVIsQ0FBYTtBQUM5QkQsOEJBQU0sYUFEd0I7QUFFOUJFLCtCQUFPbEQsVUFGdUI7QUFHOUJ5RixnQ0FBUTVDLEtBQUs0QztBQUhpQixxQkFBYixDQUFyQjs7QUFPQSx3QkFBSSxxQkFBTzVDLEtBQUsrRCxNQUFaLEVBQW9CLE1BQXBCLENBQUosRUFBaUM7O0FBRTdCLDRCQUFJSSxXQUFXLGtCQUFRbkUsSUFBUixDQUFhO0FBQ3hCb0Usc0NBQVUsTUFEYztBQUV4QnhCLG9DQUFRNUMsS0FBSzRDO0FBRlcseUJBQWIsQ0FBZjs7QUFLQXVCLGlDQUFTRSxNQUFULENBQWdCSixZQUFoQjtBQUNBRSxpQ0FBU0UsTUFBVCxDQUFnQjFCLGNBQWhCOztBQUVBM0MsNkJBQUswQixNQUFMLENBQVltQixXQUFaLENBQXdCN0MsSUFBeEIsRUFBOEJtRSxRQUE5Qjs7QUFFQSw0QkFBSXpFLGdCQUFnQnRDLElBQWhCLEtBQXlCLGNBQUtnRixFQUE5QixJQUFvQzFDLGdCQUFnQmxCLGNBQXhELEVBQXdFO0FBQ3BFLGdDQUFJOEYsbUJBQW1CLGtCQUFRdEUsSUFBUixDQUFhO0FBQ2hDb0UsMENBQVUsUUFEc0I7QUFFaEN4Qix3Q0FBUTVDLEtBQUs0QztBQUZtQiw2QkFBYixDQUF2QjtBQUlBMEIsNkNBQWlCRCxNQUFqQixDQUF3QjFCLGNBQXhCO0FBQ0EzQyxpQ0FBSzBCLE1BQUwsQ0FBWW1CLFdBQVosQ0FBd0I3QyxJQUF4QixFQUE4QnNFLGdCQUE5QjtBQUNIO0FBRUoscUJBckJELE1BcUJPOztBQUVIdEUsNkJBQUswQixNQUFMLENBQVltQixXQUFaLENBQXdCN0MsSUFBeEIsRUFBOEIyQyxjQUE5QjtBQUNBM0MsNkJBQUswQixNQUFMLENBQVltQixXQUFaLENBQXdCN0MsSUFBeEIsRUFBOEJpRSxZQUE5Qjs7QUFFQSw0QkFBSXZFLGdCQUFnQnRDLElBQWhCLEtBQXlCLGNBQUs4RSxHQUE5QixJQUFxQ3hDLGdCQUFnQnBDLFVBQXpELEVBQXFFOztBQUVqRTBDLGlDQUFLMEIsTUFBTCxDQUFZNkIsWUFBWixDQUF5QlosY0FBekIsRUFBeUMsa0JBQVF2QyxJQUFSLENBQWE7QUFDbERELHNDQUFNLGFBRDRDO0FBRWxERSx1Q0FBT1AsaUJBQWlCMkQsV0FBakIsQ0FBNkJ0RyxVQUE3QixDQUYyQztBQUdsRHlGLHdDQUFRNUMsS0FBSzRDO0FBSHFDLDZCQUFiLENBQXpDO0FBTUg7QUFDSjs7QUFFRDVDLHlCQUFLZ0UsTUFBTDtBQUVILGlCQXpFTSxNQXlFQSxJQUFJLHFCQUFPaEUsS0FBSzhELElBQVosRUFBa0IsT0FBbEIsQ0FBSixFQUFnQzs7QUFFbkMsd0JBQUloRyxvQkFBb0I0QixnQkFBZ0I1QixpQkFBaEIsQ0FBa0NzRCxPQUFsQyxDQUEwQyxTQUExQyxFQUFxRCxFQUFyRCxDQUF4Qjs7QUFFQSx3QkFBSWpFLGNBQWF1QyxnQkFBZ0J2QyxVQUFoQixJQUE4QnVDLGdCQUFnQnhDLFFBQTlDLEdBQXlEd0MsZ0JBQWdCdkMsVUFBekUsR0FBc0Z1QyxnQkFBZ0J2QyxVQUFoQixHQUE2QixJQUFwSTs7QUFFQTtBQUNBLHdCQUFJb0gsTUFBTSxxb0JBQVY7QUFDQTtBQUNBLHdCQUFJQyxhQUFhOUUsZ0JBQWdCeEIsY0FBakM7O0FBRUEsd0JBQUl1RyxhQUFhLEVBQWpCOztBQUVBLHdCQUFJLHFCQUFPL0UsZ0JBQWdCdkIsZUFBdkIsRUFBd0MsS0FBeEMsQ0FBSixFQUFvRDs7QUFFaEQsNEJBQUl1RyxjQUFjaEYsZ0JBQWdCdkMsVUFBaEIsSUFBOEJ1QyxnQkFBZ0J4QyxRQUE5QyxHQUNkd0MsZ0JBQWdCdkMsVUFERixHQUVkd0gsS0FBS0MsS0FBTCxDQUFZbEYsZ0JBQWdCdkMsVUFBaEIsR0FBNkJ1QyxnQkFBZ0J4QyxRQUF6RCxDQUZKOztBQUlBLDRCQUFJMkgsVUFBVW5GLGdCQUFnQnJCLFlBQWhCLENBQTZCeUQsS0FBN0IsQ0FBbUNyQyxnQkFBbkMsQ0FBZDs7QUFFQWUsOEJBQU1zRSxXQUFOLENBQWtCSixXQUFsQixFQUErQmhGLGdCQUFnQnpCLFVBQS9DLEVBQTJENEcsT0FBM0QsRUFBb0VuRixnQkFBZ0J4QixjQUFwRixFQUFvR3dCLGdCQUFnQnBCLFVBQXBIOztBQUVBLDRCQUFJLENBQUMscUJBQU9vQixnQkFBZ0J0QixXQUF2QixFQUFvQyxRQUFwQyxDQUFMLEVBQW9EO0FBQ2hEb0Msa0NBQU11RSxPQUFOLENBQWNyRixnQkFBZ0J0QixXQUE5QjtBQUNBcUcseUNBQWEsZ0NBQWdDL0UsZ0JBQWdCdEIsV0FBaEQsR0FBOEQsTUFBOUQsR0FDVCxnQ0FEUyxHQUVULDRCQUZTLEdBR1QsbUJBSFMsR0FHYXlHLFFBQVFHLE1BSHJCLEdBRzhCLEtBSDlCLEdBR3NDTixXQUh0QyxHQUdvRCxLQUhqRTtBQUtILHlCQVBELE1BT087QUFDSEQseUNBQWEsbURBQW1EakUsTUFBTXlFLFNBQU4sRUFBbkQsR0FBdUUsTUFBdkUsR0FDVCxnQ0FEUyxHQUVULDRCQUZTLEdBR1QsbUJBSFMsR0FHYUosUUFBUUcsTUFIckIsR0FHOEIsS0FIOUIsR0FHc0NOLFdBSHRDLEdBR29ELEtBSGpFO0FBS0g7QUFFSixxQkF6QkQsTUF5Qk87O0FBRUhGLHFDQUFhQSxhQUFhLENBQTFCOztBQUVBQyxxQ0FBYSwrQ0FDVC9FLGdCQUFnQnpCLFVBRFAsR0FDb0IsR0FEcEIsR0FDMEJ1RyxVQUQxQixHQUN1QyxpQkFEdkMsR0FFVEEsVUFGUyxHQUVJLEtBRkosR0FHVCx3QkFIUyxHQUdrQnJILFdBSGxCLEdBRytCLEdBSDVDO0FBSUg7O0FBRUQsd0JBQUlTLFFBQVEsd0hBUWtCNkcsVUFSOUI7O0FBVUEsd0JBQUlTLFdBQVd4RixnQkFBZ0IxQixhQUEvQjs7QUExRG1DLGdEQTREVDBCLGdCQUFnQjdCLFVBQWhCLENBQTJCaUUsS0FBM0IsQ0FBaUNyQyxnQkFBakMsQ0E1RFM7QUFBQSx3QkE0RDlCMEYsS0E1RDhCO0FBQUEsd0JBNER2QkMsVUE1RHVCOztBQUFBLGlEQTZEVDFGLGdCQUFnQjNCLGVBQWhCLENBQWdDK0QsS0FBaEMsQ0FBc0NyQyxnQkFBdEMsQ0E3RFM7QUFBQSx3QkE2RDlCNEYsS0E3RDhCO0FBQUEsd0JBNkR2QkMsVUE3RHVCOztBQStEbkMsd0JBQUlDLFlBQVksSUFBaEI7O0FBRUEsd0JBQUkscUJBQU9KLEtBQVAsRUFBYyxRQUFkLENBQUosRUFBNkI7O0FBRXpCSSxvQ0FBWSxrQkFBUUMsS0FBUixDQUFjLE1BQU1KLFVBQU4sR0FBbUIsR0FBbkIsR0FDdEIsZ0JBRHNCLEdBRXRCeEgsS0FGc0IsR0FHdEIsR0FIc0IsR0FJdEIsYUFKc0IsR0FJTndILFVBSk0sR0FJTyxPQUpQLEdBS3RCLGVBTHNCLEdBTXRCLEdBTnNCLEdBT3RCLGFBUHNCLEdBT05BLFVBUE0sR0FPTyxlQVBQLEdBUXRCLGdCQVJzQixHQVN0Qix3QkFUc0IsR0FVdEJ0SCxpQkFWc0IsR0FXdEIsWUFYc0IsR0FZdEIsYUFac0IsR0FhdEIsU0Fic0IsR0FhVm9ILFFBYlUsR0FhQyxHQWJELEdBY3RCLFVBZHNCLEdBY1RBLFFBZFMsR0FjRSxHQWRGLEdBZXRCLGtCQWZzQixHQWdCdEIsMEJBaEJzQixHQWlCdEJYLElBQUluRCxPQUFKLENBQVksV0FBWixFQUF5QnFFLE9BQU9KLEtBQVAsQ0FBekIsQ0FqQnNCLEdBaUJvQixNQWpCcEIsR0FrQnRCLEdBbEJzQixHQW1CdEIsYUFuQnNCLEdBbUJORCxVQW5CTSxHQW1CTyxrQ0FuQlAsR0FvQnRCQSxVQXBCc0IsR0FvQlQscUJBcEJTLEdBcUJ0QiwwQkFyQnNCLEdBcUJPYixJQUFJbkQsT0FBSixDQUFZLFdBQVosRUFBeUJxRSxPQUFPSCxVQUFQLENBQXpCLENBckJQLEdBcUJzRCxNQXJCdEQsR0FzQnRCLEdBdEJzQixHQXVCdEIsYUF2QnNCLEdBd0J0QkYsVUF4QnNCLEdBd0JULGlCQXhCUyxHQXdCV0EsVUF4QlgsR0F3QndCLEdBeEJ4QixHQXlCdEIsaUJBekJzQixHQTBCdEIsR0ExQlEsQ0FBWjtBQTRCSCxxQkE5QkQsTUE4Qk8sSUFBSSxxQkFBT0QsS0FBUCxFQUFjLE9BQWQsQ0FBSixFQUE0Qjs7QUFFL0JJLG9DQUFZLGtCQUFRQyxLQUFSLENBQWMsTUFBTUosVUFBTixHQUFtQixHQUFuQixHQUN0QnRILGlCQURzQixHQUV0QixZQUZzQixHQUd0QixhQUhzQixHQUl0QixTQUpzQixHQUlWb0gsUUFKVSxHQUlDLEdBSkQsR0FLdEIsVUFMc0IsR0FLVEEsUUFMUyxHQUtFLEdBTEYsR0FNdEIsMEJBTnNCLEdBTU9YLElBQUluRCxPQUFKLENBQVksU0FBWixFQUF1QnFFLE9BQU9KLEtBQVAsQ0FBdkIsQ0FOUCxHQU0rQyxNQU4vQyxHQU90QixnREFQc0IsR0FRdEIsR0FSc0IsR0FTdEIsR0FUc0IsR0FTaEJELFVBVGdCLEdBU0gsUUFURyxHQVNRLEdBVFIsR0FVdEIsa0JBVnNCLEdBVUR4SCxLQVZDLEdBV3RCLEdBWFEsQ0FBWjtBQWFILHFCQWZNLE1BZUEsSUFBSSxxQkFBT3VILEtBQVAsRUFBYyxRQUFkLENBQUosRUFBNkI7O0FBRWhDSSxvQ0FBWSxrQkFBUUMsS0FBUixDQUFjLE1BQU1KLFVBQU4sR0FBbUIsS0FBbkIsR0FBMkJ4SCxLQUEzQixHQUFtQyxLQUFqRCxDQUFaO0FBRUg7O0FBRUQsd0JBQUkySCxTQUFKLEVBQWU7QUFDWEEsa0NBQVUzQyxNQUFWLEdBQW1CNUMsS0FBSzRDLE1BQXhCO0FBQ0E1Qyw2QkFBSzBCLE1BQUwsQ0FBWTZCLFlBQVosQ0FBeUJ2RCxJQUF6QixFQUErQnVGLFNBQS9CO0FBQ0g7O0FBRUR2Rix5QkFBS2dFLE1BQUw7QUFDSCxpQkExSE0sTUEwSEEsSUFBSSxxQkFBT2hFLEtBQUs4RCxJQUFaLEVBQWtCLFVBQWxCLEtBQWlDLHFCQUFPOUQsS0FBSzhELElBQVosRUFBa0IsUUFBbEIsQ0FBakMsSUFDUCxxQkFBTzlELEtBQUs4RCxJQUFaLEVBQWtCLFdBQWxCLENBRE8sSUFDMkIscUJBQU85RCxLQUFLOEQsSUFBWixFQUFrQixTQUFsQixDQUQzQixJQUMyRCxxQkFBTzlELEtBQUs4RCxJQUFaLEVBQWtCLFlBQWxCLENBRC9ELEVBQ2dHOztBQUVuRyx3QkFBSWhCLFdBQVcsMEJBQVk5QyxLQUFLOEQsSUFBakIsQ0FBZjs7QUFFQSx3QkFBSTRCLFFBQVEvRyxRQUFRbUUsUUFBUixDQUFaOztBQUVBLHdCQUFJLHFCQUFPQSxRQUFQLEVBQWlCLFNBQWpCLEtBQStCLHFCQUFPOUMsS0FBSytELE1BQVosRUFBb0IsTUFBcEIsQ0FBbkMsRUFBZ0U7QUFDNUQyQixnQ0FBUS9HLFFBQVFVLFNBQVIsR0FBb0JxRyxLQUE1QjtBQUNILHFCQUZELE1BRU8sSUFBSSxxQkFBTzVDLFFBQVAsRUFBaUIsVUFBakIsS0FBZ0MscUJBQU85QyxLQUFLK0QsTUFBWixFQUFvQixNQUFwQixDQUFwQyxFQUFpRTtBQUNwRTJCLGdDQUFRL0csUUFBUU0sTUFBUixHQUFpQnlHLEtBQXpCO0FBQ0g7O0FBRUQsd0JBQUkscUJBQU9oRyxnQkFBZ0JqQyxVQUF2QixFQUFtQyxRQUFuQyxDQUFKLEVBQWtEOztBQUU5Qyw0QkFBSWtJLFNBQVMsa0JBQVFILEtBQVIsQ0FBY0UsS0FBZCxDQUFiO0FBQ0ExRiw2QkFBSzBCLE1BQUwsQ0FBWTZCLFlBQVosQ0FBeUJ2RCxJQUF6QixFQUErQjJGLE1BQS9CO0FBRUgscUJBTEQsTUFLTzs7QUFFSCw0QkFBSUMsYUFBYSwwQkFBWTlDLFdBQVc5QyxLQUFLK0QsTUFBNUIsQ0FBakI7O0FBRUEsNEJBQUlKLFlBQVlpQyxVQUFaLEtBQTJCLElBQS9CLEVBQXFDOztBQUVqQztBQUNBakMsd0NBQVlpQyxVQUFaLElBQTBCO0FBQ3RCeEIsMENBQVVwRSxLQUFLMEIsTUFBTCxDQUFZMEMsUUFEQTtBQUV0QnNCLHVDQUFPQSxLQUZlO0FBR3RCRyx5Q0FBUyxDQUFDN0YsS0FBSzBCLE1BQU4sQ0FIYTtBQUl0Qm9FLHNDQUFNOUYsS0FBSzhGLElBQUwsRUFKZ0I7QUFLdEJsRCx3Q0FBUTVDLEtBQUs0QyxNQUxTO0FBTXRCbUQsdUNBQU87QUFOZSw2QkFBMUI7QUFTSCx5QkFaRCxNQVlPOztBQUVIO0FBQ0FwQyx3Q0FBWWlDLFVBQVosRUFBd0J4QixRQUF4QixHQUFtQ1QsWUFBWWlDLFVBQVosRUFBd0J4QixRQUF4QixHQUFtQyxJQUFuQyxHQUEwQ3BFLEtBQUswQixNQUFMLENBQVkwQyxRQUF6RjtBQUNBVCx3Q0FBWWlDLFVBQVosRUFBd0JDLE9BQXhCLENBQWdDM0MsSUFBaEMsQ0FBcUNsRCxLQUFLMEIsTUFBMUM7QUFDQWlDLHdDQUFZaUMsVUFBWixFQUF3QkcsS0FBeEI7QUFFSDtBQUNKOztBQUVEL0YseUJBQUtnRSxNQUFMO0FBRUgsaUJBOUNNLE1BOENBLElBQUkscUJBQU9oRSxLQUFLOEQsSUFBWixFQUFrQixPQUFsQixJQUE2QixxQkFBTzlELEtBQUs4RCxJQUFaLEVBQWtCLFdBQWxCLENBQWpDLEVBQWlFO0FBQ3BFLHdCQUFJaEIsWUFBVzlDLEtBQUs4RCxJQUFMLENBQVVqRCxXQUFWLEVBQWY7QUFDQSx3QkFBSW1GLFFBQVEsa0JBQVFSLEtBQVIsQ0FBYzdHLFFBQVFtRSxTQUFSLENBQWQsQ0FBWjtBQUNBa0QsMEJBQU1wRCxNQUFOLEdBQWU1QyxLQUFLNEMsTUFBcEI7QUFDQTVDLHlCQUFLMEIsTUFBTCxDQUFZbUIsV0FBWixDQUF3QjdDLElBQXhCLEVBQThCZ0csS0FBOUI7QUFDQWhHLHlCQUFLZ0UsTUFBTDtBQUNIO0FBQ0Q7QUFDQTFDLHFCQUFLc0MsSUFBTCxDQUFVLGlCQUFTOztBQUVmLHdCQUFJLHFCQUFPcUMsTUFBTXBDLElBQWIsRUFBbUIsTUFBbkIsQ0FBSixFQUFnQztBQUM1QjtBQUNBM0Qsa0NBQVUrRixLQUFWO0FBQ0g7QUFFSixpQkFQRDtBQVFBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVILGFBelNELE1BeVNPLElBQUkscUJBQU8zRSxLQUFLdUMsSUFBWixFQUFrQixNQUFsQixDQUFKLEVBQStCOztBQUVsQztBQUNBM0QsMEJBQVVvQixJQUFWO0FBRUgsYUFMTSxNQUtBLElBQUk1QixnQkFBZ0JqQixjQUFoQixJQUFrQyxxQkFBTzZDLEtBQUt1QyxJQUFaLEVBQWtCLFNBQWxCLENBQXRDLEVBQW9FO0FBQ3ZFdkMscUJBQUswQyxNQUFMO0FBQ0g7QUFFSixTQXZURDs7QUF5VEE7QUFDQSxhQUFLLElBQUlwRCxHQUFULElBQWdCK0MsV0FBaEIsRUFBNkI7O0FBRXpCLGdCQUFJckMsT0FBT3FDLFlBQVkvQyxHQUFaLENBQVg7O0FBRUEsZ0JBQUlVLEtBQUt5RSxLQUFMLEdBQWEsQ0FBakIsRUFBb0I7QUFDaEIsb0JBQUkvRixPQUFPLGtCQUFRd0YsS0FBUixDQUFjbEUsS0FBSzhDLFFBQUwsR0FBZ0IsR0FBaEIsR0FBc0I5QyxLQUFLb0UsS0FBM0IsR0FBbUMsR0FBakQsQ0FBWDtBQUNBMUYscUJBQUs0QyxNQUFMLEdBQWN0QixLQUFLc0IsTUFBbkI7O0FBRUF0QixxQkFBS3VFLE9BQUwsQ0FBYSxDQUFiLEVBQWdCbkUsTUFBaEIsQ0FBdUI2QixZQUF2QixDQUFvQ2pDLEtBQUt1RSxPQUFMLENBQWEsQ0FBYixDQUFwQyxFQUFxRDdGLElBQXJEO0FBRUgsYUFORCxNQU1PO0FBQ0gsb0JBQUkwRixRQUFRLGtCQUFRRixLQUFSLENBQWNsRSxLQUFLb0UsS0FBbkIsQ0FBWjtBQUNBQSxzQkFBTTlDLE1BQU4sR0FBZXRCLEtBQUtzQixNQUFwQjtBQUNBdEIscUJBQUt1RSxPQUFMLENBQWEsQ0FBYixFQUFnQmhELFdBQWhCLENBQTRCdkIsS0FBS3dFLElBQWpDLEVBQXVDSixLQUF2QztBQUNIOztBQUVEO0FBQ0EsaUJBQUssSUFBSXpDLENBQVQsSUFBYzNCLEtBQUt1RSxPQUFuQixFQUE0QjtBQUN4QixvQkFBSXZFLEtBQUt1RSxPQUFMLENBQWE1QyxDQUFiLEVBQWdCaUQsS0FBaEIsQ0FBc0JsQixNQUF0QixLQUFpQyxDQUFyQyxFQUF3QztBQUNwQzFELHlCQUFLdUUsT0FBTCxDQUFhNUMsQ0FBYixFQUFnQmUsTUFBaEI7QUFDSDtBQUNKO0FBRUo7QUFFSixLQXhWRDtBQXlWSCxDQXhuQkQ7QUFQQTs7QUEvQkE7Ozs7Ozs7Ozs7OztrQkFncUJlakgsTyIsImZpbGUiOiJIYW1zdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBtb2R1bGUgSGFtc3RlclxyXG4gKiBcclxuICogQGRlc2NyaXB0aW9uIFBvc3RDU1MgSGFtc3RlciBmcmFtZXdvcmsgbWFpbiBmdW5jdGlvbmFsaXR5LlxyXG4gKlxyXG4gKiBAdmVyc2lvbiAxLjBcclxuICogQGF1dGhvciBHcmlnb3J5IFZhc2lseWV2IDxwb3N0Y3NzLmhhbXN0ZXJAZ21haWwuY29tPiBodHRwczovL2dpdGh1Yi5jb20vaDB0YzBkM1xyXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNywgR3JpZ29yeSBWYXNpbHlldlxyXG4gKiBAbGljZW5zZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAsIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMCBcclxuICogXHJcbiAqL1xyXG5cclxuaW1wb3J0IEZvbnRTaXplcyBmcm9tIFwiLi9Gb250U2l6ZXNcIjtcclxuXHJcbmltcG9ydCB7XHJcbiAgICBmb3JtYXRJbnQsXHJcbiAgICBmb3JtYXRWYWx1ZSxcclxuICAgIHJlbVJlZ2V4cCxcclxuICAgIGdldFVuaXQsXHJcbiAgICBleHRlbmQsXHJcbiAgICB0b0NhbWVsQ2FzZSxcclxuICAgIHRvS2ViYWJDYXNlLFxyXG4gICAgY21wU3RyLFxyXG4gICAgc2NtcFN0cixcclxuICAgIFVOSVQsXHJcbiAgICB1bml0TmFtZVxyXG59IGZyb20gXCIuL0hlbHBlcnNcIjtcclxuXHJcbmltcG9ydCBWZXJ0aWNhbFJoeXRobSBmcm9tIFwiLi9WZXJ0aWNhbFJoeXRobVwiO1xyXG5cclxuaW1wb3J0IFBuZ0ltYWdlIGZyb20gXCIuL1BuZ0ltYWdlXCI7XHJcbi8vIGltcG9ydCBWaXJ0dWFsTWFjaGluZSBmcm9tIFwiLi9WaXJ0dWFsTWFjaGluZVwiO1xyXG5cclxuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5cclxuaW1wb3J0IHBvc3Rjc3MgZnJvbSBcInBvc3Rjc3NcIjtcclxuXHJcbmNvbnN0IGhhbXN0ZXIgPSAob3B0aW9ucyA9IG51bGwpID0+IHtcclxuXHJcbiAgICAvL0RlZmF1bHQgR2xvYmFsIFNldHRpbmdzXHJcbiAgICBsZXQgZ2xvYmFsU2V0dGluZ3MgPSB7XHJcblxyXG4gICAgICAgIGZvbnRTaXplOiAxNixcclxuICAgICAgICBsaW5lSGVpZ2h0OiAxLjUsXHJcbiAgICAgICAgdW5pdDogVU5JVC5FTSxcclxuICAgICAgICBweEZhbGxiYWNrOiB0cnVlLFxyXG4gICAgICAgIHB4QmFzZWxpbmU6IGZhbHNlLFxyXG4gICAgICAgIGZvbnRSYXRpbzogXCIxLjI1XCIsXHJcblxyXG4gICAgICAgIHByb3BlcnRpZXM6IFwiaW5saW5lXCIsXHJcblxyXG4gICAgICAgIG1pbkxpbmVQYWRkaW5nOiAyLFxyXG4gICAgICAgIHJvdW5kVG9IYWxmTGluZTogZmFsc2UsXHJcblxyXG4gICAgICAgIHJ1bGVyOiB0cnVlLFxyXG4gICAgICAgIHJ1bGVyU3R5bGU6IFwiYWx3YXlzIHJ1bGVyLWRlYnVnXCIsXHJcbiAgICAgICAgcnVsZXJJY29uUG9zaXRpb246IFwicG9zaXRpb246IGZpeGVkO3RvcDogMS41ZW07bGVmdDogMS41ZW07XCIsXHJcbiAgICAgICAgcnVsZXJJY29uQ29sb3JzOiBcIiNjY2NjY2MgIzQ0NTc2YVwiLFxyXG4gICAgICAgIHJ1bGVySWNvblNpemU6IFwiMjRweFwiLFxyXG4gICAgICAgIHJ1bGVyQ29sb3I6IFwicmdiYSgxOSwgMTM0LCAxOTEsIC44KVwiLFxyXG4gICAgICAgIHJ1bGVyVGhpY2tuZXNzOiAxLFxyXG4gICAgICAgIHJ1bGVyQmFja2dyb3VuZDogXCJncmFkaWVudFwiLFxyXG4gICAgICAgIHJ1bGVyT3V0cHV0OiBcImJhc2U2NFwiLFxyXG4gICAgICAgIHJ1bGVyUGF0dGVybjogXCIxIDAgMCAwXCIsXHJcbiAgICAgICAgcnVsZXJTY2FsZTogMSxcclxuXHJcbiAgICAgICAgYnJvd3NlckZvbnRTaXplOiAxNixcclxuICAgICAgICBsZWdhY3lCcm93c2VyczogdHJ1ZSxcclxuICAgICAgICByZW1vdmVDb21tZW50czogZmFsc2VcclxuICAgIH07XHJcblxyXG4gICAgLy8gVmFsdWUgdG9Mb3dlckNhc2UoKVxyXG4gICAgbGV0IHRvTG93ZXJDYXNlS2V5cyA9IFtcclxuICAgICAgICBcInVuaXRcIixcclxuICAgICAgICBcImZvbnRSYXRpb1wiLFxyXG4gICAgICAgIFwicHJvcGVydGllc1wiLFxyXG4gICAgICAgIFwicnVsZXJTdHlsZVwiLFxyXG4gICAgICAgIFwicnVsZXJCYWNrZ3JvdW5kXCIsXHJcbiAgICAgICAgXCJydWxlck91dHB1dFwiXHJcbiAgICBdO1xyXG5cclxuICAgIGxldCBoZWxwZXJzID0ge1xyXG5cclxuICAgICAgICByZXNldDogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vaGVscGVycy9yZXNldC5jc3NcIiksIFwidXRmOFwiKSxcclxuXHJcbiAgICAgICAgbm9ybWFsaXplOiBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9oZWxwZXJzL25vcm1hbGl6ZS5jc3NcIiksIFwidXRmOFwiKSxcclxuXHJcbiAgICAgICAgbm93cmFwOiBcIndoaXRlLXNwYWNlOiBub3dyYXA7XCIsXHJcblxyXG4gICAgICAgIGZvcmNld3JhcDogXCJ3aGl0ZS1zcGFjZTogcHJlO1wiICtcclxuICAgICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogcHJlLWxpbmU7XCIgK1xyXG4gICAgICAgICAgICBcIndoaXRlLXNwYWNlOiBwcmUtd3JhcDtcIiArXHJcbiAgICAgICAgICAgIFwid29yZC13cmFwOiBicmVhay13b3JkO1wiLFxyXG5cclxuICAgICAgICBlbGxpcHNpczogXCJvdmVyZmxvdzogaGlkZGVuO1wiICtcclxuICAgICAgICAgICAgXCJ0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcIixcclxuXHJcbiAgICAgICAgaHlwaGVuczogXCJ3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XCIgK1xyXG4gICAgICAgICAgICBcImh5cGhlbnM6IGF1dG87XCIsXHJcblxyXG4gICAgICAgIGJyZWFrV29yZDpcclxuICAgICAgICAgICAgLyogTm9uIHN0YW5kYXJkIGZvciB3ZWJraXQgKi9cclxuICAgICAgICAgICAgXCJ3b3JkLWJyZWFrOiBicmVhay13b3JkO1wiICtcclxuICAgICAgICAgICAgLyogV2FybmluZzogTmVlZGVkIGZvciBvbGRJRSBzdXBwb3J0LCBidXQgd29yZHMgYXJlIGJyb2tlbiB1cCBsZXR0ZXItYnktbGV0dGVyICovXHJcbiAgICAgICAgICAgIFwid29yZC1icmVhazogYnJlYWstYWxsO1wiXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGZvbnRTaXplIHByb3BlcnR5IFJlZ2V4cFxyXG4gICAgY29uc3QgZm9udFNpemVSZWdleHAgPSAvZm9udFNpemVcXHMrKFtcXC1cXCRcXEAwLTlhLXpBLVpdKykvaTtcclxuXHJcbiAgICAvLyByaHl0aG0gZnVuY3Rpb25zIFJlZ2V4cFxyXG4gICAgY29uc3Qgcmh5dGhtUmVnZXhwID0gLyhsaW5lSGVpZ2h0fHNwYWNpbmd8bGVhZGluZ3xcXCFyaHl0aG18cmh5dGhtKVxcKCguKj8pXFwpL2k7XHJcblxyXG4gICAgLy8gQ29tbWEgc3BsaXQgcmVnZXhwXHJcbiAgICBjb25zdCBjb21tYVNwbGl0UmVnZXhwID0gL1xccypcXCxcXHMqLztcclxuXHJcbiAgICAvLyBTcGFjZSBzcGxpdCByZWdleHBcclxuICAgIGNvbnN0IHNwYWNlU3BsaXRSZWdleHAgPSAvXFxzKy87XHJcblxyXG4gICAgaWYgKG9wdGlvbnMgIT0gbnVsbCkge1xyXG4gICAgICAgIGV4dGVuZChnbG9iYWxTZXR0aW5ncywgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3VycmVudCBTZXR0aW5ncyBleHRlbmQoe30sIGdsb2JhbFNldHRpbmdzKVxyXG4gICAgbGV0IGN1cnJlbnRTZXR0aW5ncyA9IHt9O1xyXG5cclxuICAgIGxldCBjdXJyZW50U2V0dGluZ3NSZWdleHA7XHJcbiAgICAvL0N1cnJlbnQgRm9udFNpemVzXHJcbiAgICBsZXQgY3VycmVudEZvbnRTaXplcyA9IG51bGw7XHJcbiAgICAvLyBmb250IFNpemVzXHJcbiAgICBsZXQgZm9udFNpemVzQ29sbGVjdGlvbjtcclxuICAgIC8vIFZlcnRpY2FsIFJoeXRobSBDYWxjdWxhdG9yXHJcbiAgICBsZXQgcmh5dGhtQ2FsY3VsYXRvcjtcclxuICAgIC8vIExhc3QgQ3NzIEZpbGVcclxuICAgIC8vIGxldCBsYXN0RmlsZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBTZXR0aW5ncyB0byBzZXR0aW5ncyB0YWJsZS5cclxuICAgICAqIEBwYXJhbSBydWxlIC0gY3VycmVudCBydWxlLlxyXG4gICAgICogQHBhcmFtIHNldHRpbmdzIC0gc2V0dGluZ3MgdGJhbGUuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IGFkZFNldHRpbmdzID0gKHJ1bGUsIHNldHRpbmdzKSA9PiB7XHJcblxyXG4gICAgICAgIHJ1bGUud2Fsa0RlY2xzKGRlY2wgPT4ge1xyXG5cclxuICAgICAgICAgICAgbGV0IHByb3AgPSB0b0NhbWVsQ2FzZShkZWNsLnByb3ApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNjbXBTdHIocHJvcCwgXCJweEZhbGxiYWNrXCIpIHx8IHNjbXBTdHIocHJvcCwgXCJweEJhc2VsaW5lXCIpIHx8XHJcbiAgICAgICAgICAgICAgICBzY21wU3RyKHByb3AsIFwicm91bmRUb0hhbGZMaW5lXCIpIHx8IHNjbXBTdHIocHJvcCwgXCJydWxlclwiKSB8fFxyXG4gICAgICAgICAgICAgICAgc2NtcFN0cihwcm9wLCBcImxlZ2FjeUJyb3dzZXJzXCIpIHx8IHNjbXBTdHIocHJvcCwgXCJyZW1vdmVDb21tZW50c1wiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHNldHRpbmdzW3Byb3BdID0gY21wU3RyKGRlY2wudmFsdWUsIFwidHJ1ZVwiKSA/IHRydWUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NtcFN0cihwcm9wLCBcInVuaXRcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy51bml0ID0gZ2V0VW5pdChkZWNsLnZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NtcFN0cihwcm9wLCBcImxpbmVIZWlnaHRcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5saW5lSGVpZ2h0ID0gcGFyc2VGbG9hdChkZWNsLnZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NtcFN0cihwcm9wLCBcImZvbnRTaXplXCIpIHx8IHNjbXBTdHIocHJvcCwgXCJtaW5MaW5lUGFkZGluZ1wiKSB8fFxyXG4gICAgICAgICAgICAgICAgc2NtcFN0cihwcm9wLCBcInJ1bGVyVGhpY2tuZXNzXCIpIHx8IHNjbXBTdHIocHJvcCwgXCJydWxlclNjYWxlXCIpIHx8XHJcbiAgICAgICAgICAgICAgICBzY21wU3RyKHByb3AsIFwiYnJvd3NlckZvbnRTaXplXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3NbcHJvcF0gPSBwYXJzZUludChkZWNsLnZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3NbcHJvcF0gPSBkZWNsLnZhbHVlO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICB2YXIgaW1hZ2UgPSBuZXcgUG5nSW1hZ2UoKTtcclxuICAgIC8qKlxyXG4gICAgICogSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IGluaXRTZXR0aW5ncyA9ICgpID0+IHtcclxuICAgICAgICBjdXJyZW50Rm9udFNpemVzID0gbnVsbDtcclxuICAgICAgICAvLyBBZGQgZm9udFNpemVzXHJcbiAgICAgICAgaWYgKGdsb2JhbFNldHRpbmdzLmZvbnRTaXplcykge1xyXG4gICAgICAgICAgICBjdXJyZW50Rm9udFNpemVzID0gZ2xvYmFsLmZvbnRTaXplcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3MuZm9udFNpemVzKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSAoY3VycmVudEZvbnRTaXplcykgPyBjdXJyZW50Rm9udFNpemVzICsgXCIsIFwiICsgY3VycmVudFNldHRpbmdzLmZvbnRTaXplcyA6IGN1cnJlbnRTZXR0aW5ncy5mb250U2l6ZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUb0xvd2VyQ2FzZSBDdXJyZW50IFNldHRpbmdzXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRvTG93ZXJDYXNlS2V5cykge1xyXG4gICAgICAgICAgICBpZiAoa2V5IGluIGN1cnJlbnRTZXR0aW5ncykge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzW2tleV0gPSBjdXJyZW50U2V0dGluZ3Nba2V5XS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoY3VycmVudFNldHRpbmdzLCBudWxsICwyKSk7XHJcbiAgICAgICAgZm9udFNpemVzQ29sbGVjdGlvbiA9IG5ldyBGb250U2l6ZXMoY3VycmVudFNldHRpbmdzKTtcclxuICAgICAgICByaHl0aG1DYWxjdWxhdG9yID0gbmV3IFZlcnRpY2FsUmh5dGhtKGN1cnJlbnRTZXR0aW5ncyk7XHJcbiAgICAgICAgaWYgKGN1cnJlbnRGb250U2l6ZXMpIHtcclxuICAgICAgICAgICAgZm9udFNpemVzQ29sbGVjdGlvbi5hZGRGb250U2l6ZXMoY3VycmVudEZvbnRTaXplcywgcmh5dGhtQ2FsY3VsYXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzZXR0aW5nc0tleXMgPSBPYmplY3Qua2V5cyhjdXJyZW50U2V0dGluZ3MpLmpvaW4oXCJ8XCIpO1xyXG4gICAgICAgIGxldCBzZXR0aW5nc0tleXNTdHJpbmcgPSB0b0tlYmFiQ2FzZShzZXR0aW5nc0tleXMpLnJlcGxhY2UoLyhbXFwtXFxfXSkvZywgXCJcXFxcJDFcIik7XHJcbiAgICAgICAgY3VycmVudFNldHRpbmdzUmVnZXhwID0gbmV3IFJlZ0V4cChcIlxcXFxAKFwiICsgc2V0dGluZ3NLZXlzU3RyaW5nICsgXCIpXCIsIFwiaVwiKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgd2Fsa0RlY2xzID0gKG5vZGUpID0+IHtcclxuICAgICAgICBub2RlLndhbGtEZWNscyhkZWNsID0+IHtcclxuXHJcbiAgICAgICAgICAgIGxldCBmb3VuZDtcclxuICAgICAgICAgICAgbGV0IHJ1bGVGb250U2l6ZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBmaW5kUnVsZUZvbnRTaXplID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJ1bGVGb250U2l6ZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC5wYXJlbnQud2Fsa0RlY2xzKGZzZGVjbCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbXBTdHIoZnNkZWNsLnByb3AsIFwiZm9udC1zaXplXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlRm9udFNpemUgPSBmc2RlY2wudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZWNsLnZhbHVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVwbGFjZSBWYXJpYWJsZXMgd2l0aCB2YWx1ZXNcclxuICAgICAgICAgICAgICAgIHdoaWxlICgoZm91bmQgPSBkZWNsLnZhbHVlLm1hdGNoKGN1cnJlbnRTZXR0aW5nc1JlZ2V4cCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhcmlhYmxlID0gdG9DYW1lbENhc2UoZm91bmRbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm91bmRbMF0sIGN1cnJlbnRTZXR0aW5nc1t2YXJpYWJsZV0pO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIEZvbnQgU2l6ZVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2goZm9udFNpemVSZWdleHApKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgW2ZvbnRTaXplLCBzaXplVW5pdF0gPSBmb3VuZFsxXS5zcGxpdChcIiRcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNpemVVbml0ID0gKHNpemVVbml0KSA/IGdldFVuaXQoc2l6ZVVuaXQpIDogMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNpemUgPSBmb250U2l6ZXNDb2xsZWN0aW9uLmdldFNpemUoZm9udFNpemUpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFdyaXRlIGZvbnQgc2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzaXplVW5pdCA9PT0gVU5JVC5FTSB8fCBzaXplVW5pdCA9PT0gVU5JVC5SRU0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm91bmRbMF0sIGZvcm1hdFZhbHVlKHNpemUucmVsKSArIHVuaXROYW1lW3NpemVVbml0XSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2l6ZVVuaXQgPT09IFVOSVQuUFgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm91bmRbMF0sIGZvcm1hdEludChzaXplLnB4KSArIFwicHhcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2ZzaXplID0gY3VycmVudFNldHRpbmdzLnVuaXQgPT09IFVOSVQuUFggPyBmb3JtYXRJbnQoc2l6ZS5weCkgOiBmb3JtYXRWYWx1ZShzaXplLnJlbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvdW5kWzBdLCBjZnNpemUgKyB1bml0TmFtZVtjdXJyZW50U2V0dGluZ3MudW5pdF0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFkanVzdCBGb250IFNpemVcclxuICAgICAgICAgICAgICAgIGlmIChjbXBTdHIoZGVjbC5wcm9wLCBcImFkanVzdC1mb250LXNpemVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFtmb250U2l6ZSwgbGluZXMsIGJhc2VGb250U2l6ZV0gPSBkZWNsLnZhbHVlLnNwbGl0KHNwYWNlU3BsaXRSZWdleHApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZVVuaXQgPSBnZXRVbml0KGZvbnRTaXplKTtcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHJoeXRobUNhbGN1bGF0b3IuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCBudWxsLCBiYXNlRm9udFNpemUpICsgdW5pdE5hbWVbY3VycmVudFNldHRpbmdzLnVuaXRdO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBmb250U2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSByaHl0aG1DYWxjdWxhdG9yLmxpbmVIZWlnaHQoZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodERlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBsaW5lSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGRlY2wuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wucHJvcCA9IFwiZm9udC1zaXplXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC5wYXJlbnQuaW5zZXJ0QWZ0ZXIoZGVjbCwgbGluZUhlaWdodERlY2wpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGxpbmVIZWlnaHQsIHNwYWNpbmcsIGxlYWRpbmcsIHJoeXRobSwgIXJoeXRobVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2gocmh5dGhtUmVnZXhwKSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gZm91bmRbMV07IC8vIGxpbmVIZWlnaHQsIHNwYWNpbmcsIGxlYWRpbmcsIHJoeXRobSwgIXJoeXRobVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJhbWV0ZXJzID0gZm91bmRbMl0uc3BsaXQoY29tbWFTcGxpdFJlZ2V4cCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJldCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgaW4gcGFyYW1ldGVycykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IFt2YWx1ZSwgZm9udFNpemVdID0gcGFyYW1ldGVyc1tpXS5zcGxpdChzcGFjZVNwbGl0UmVnZXhwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZm9udFNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmRSdWxlRm9udFNpemUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gcnVsZUZvbnRTaXplO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY21wU3RyKHByb3BlcnR5LCBcImxpbmVoZWlnaHRcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKHJoeXRobUNhbGN1bGF0b3IubGluZUhlaWdodChmb250U2l6ZSwgdmFsdWUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocHJvcGVydHksIFwic3BhY2luZ1wiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2gocmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSwgbnVsbCwgdHJ1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihwcm9wZXJ0eSwgXCJsZWFkaW5nXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChyaHl0aG1DYWxjdWxhdG9yLmxlYWRpbmcodmFsdWUsIGZvbnRTaXplKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHByb3BlcnR5LCBcIiFyaHl0aG1cIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbaW5WYWx1ZSwgb3V0cHV0VW5pdF0gPSB2YWx1ZS5zcGxpdChcIiRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRVbml0ID0gVU5JVFtvdXRwdXRVbml0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKHJoeXRobUNhbGN1bGF0b3Iucmh5dGhtKGluVmFsdWUsIGZvbnRTaXplLCB0cnVlLCBvdXRwdXRVbml0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHByb3BlcnR5LCBcInJoeXRobVwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IFtpblZhbHVlLCBvdXRwdXRVbml0XSA9IHZhbHVlLnNwbGl0KFwiJFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFVuaXQgPSBVTklUW291dHB1dFVuaXRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2gocmh5dGhtQ2FsY3VsYXRvci5yaHl0aG0oaW5WYWx1ZSwgZm9udFNpemUsIGZhbHNlLCBvdXRwdXRVbml0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb3VuZFswXSwgcmV0LmpvaW4oXCIgXCIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyByZW0gZmFsbGJhY2tcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3MucHhGYWxsYmFjayAmJiBkZWNsLnZhbHVlLm1hdGNoKHJlbVJlZ2V4cCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC5pbnNlcnRCZWZvcmUoZGVjbCwgZGVjbC5jbG9uZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByaHl0aG1DYWxjdWxhdG9yLnJlbUZhbGxiYWNrKGRlY2wudmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGRlY2wuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiAoY3NzKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIEV4dGVuZCBOb2Rlc1xyXG4gICAgICAgIGxldCBleHRlbmROb2RlcyA9IHt9O1xyXG5cclxuICAgICAgICBjc3Mud2Fsayhub2RlID0+IHtcclxuICAgICAgICAgICAgLy8gaWYgKGxhc3RGaWxlICE9IG5vZGUuc291cmNlLmlucHV0LmZpbGUpIHtcclxuICAgICAgICAgICAgLy8gXHRsYXN0RmlsZSA9IG5vZGUuc291cmNlLmlucHV0LmZpbGU7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjbXBTdHIobm9kZS50eXBlLCBcImF0cnVsZVwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBydWxlID0gbm9kZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJoYW1zdGVyXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghY21wU3RyKHJ1bGUucGFyYW1zLCBcImVuZFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRTZXR0aW5ncyhydWxlLCBnbG9iYWxTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCBjdXJyZW50IHNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzID0gZXh0ZW5kKHt9LCBnbG9iYWxTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgICAgICAgICAgICAgIGluaXRTZXR0aW5ncygpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgUnVsZSBIYW1zdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihydWxlLm5hbWUsIFwiIWhhbXN0ZXJcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYWRkU2V0dGluZ3MocnVsZSwgY3VycmVudFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdFNldHRpbmdzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocnVsZS5uYW1lLCBcImJhc2VsaW5lXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0ID0gcmh5dGhtQ2FsY3VsYXRvci5saW5lSGVpZ2h0KGN1cnJlbnRTZXR0aW5ncy5mb250U2l6ZSArIFwicHhcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGJhc2VsaW5lIGZvbnQgc2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZURlY2wgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzLnB4QmFzZWxpbmUgfHwgKGN1cnJlbnRTZXR0aW5ncy51bml0ID09PSBVTklULlBYICYmICFjdXJyZW50U2V0dGluZ3MubGVnYWN5QnJvd3NlcnMpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZURlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJmb250LXNpemVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50U2V0dGluZ3MuZm9udFNpemUgKyBcInB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlbGF0aXZlU2l6ZSA9IDEwMCAqIGN1cnJlbnRTZXR0aW5ncy5mb250U2l6ZSAvIGN1cnJlbnRTZXR0aW5ncy5icm93c2VyRm9udFNpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZURlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJmb250LXNpemVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmb3JtYXRWYWx1ZShyZWxhdGl2ZVNpemUpICsgXCIlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0RGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IFwibGluZS1oZWlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGxpbmVIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjbXBTdHIocnVsZS5wYXJhbXMsIFwiaHRtbFwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGh0bWxSdWxlID0gcG9zdGNzcy5ydWxlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcImh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sUnVsZS5hcHBlbmQoZm9udFNpemVEZWNsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbFJ1bGUuYXBwZW5kKGxpbmVIZWlnaHREZWNsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGh0bWxSdWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2V0dGluZ3MudW5pdCA9PT0gVU5JVC5QWCAmJiBjdXJyZW50U2V0dGluZ3MubGVnYWN5QnJvd3NlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhc3Rlcmlza0h0bWxSdWxlID0gcG9zdGNzcy5ydWxlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCIqIGh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdGVyaXNrSHRtbFJ1bGUuYXBwZW5kKGxpbmVIZWlnaHREZWNsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGFzdGVyaXNrSHRtbFJ1bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBsaW5lSGVpZ2h0RGVjbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGZvbnRTaXplRGVjbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudFNldHRpbmdzLnVuaXQgPT09IFVOSVQuUkVNICYmIGN1cnJlbnRTZXR0aW5ncy5weEZhbGxiYWNrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKGxpbmVIZWlnaHREZWNsLCBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IFwibGluZS1oZWlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmh5dGhtQ2FsY3VsYXRvci5yZW1GYWxsYmFjayhsaW5lSGVpZ2h0KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJydWxlclwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXJJY29uUG9zaXRpb24gPSBjdXJyZW50U2V0dGluZ3MucnVsZXJJY29uUG9zaXRpb24ucmVwbGFjZSgvW1xcJ1xcXCJdL2csIFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IGN1cnJlbnRTZXR0aW5ncy5saW5lSGVpZ2h0ID49IGN1cnJlbnRTZXR0aW5ncy5mb250U2l6ZSA/IGN1cnJlbnRTZXR0aW5ncy5saW5lSGVpZ2h0IDogY3VycmVudFNldHRpbmdzLmxpbmVIZWlnaHQgKyBcImVtXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAyNCAyNCUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00xOCAyNGMtMC4zIDAtMC41NDgtMC4yNDYtMC41NDgtMC41NDZWMThjMC0wLjMgMC4yNDgtMC41NDYgMC41NDgtMC41NDZoNS40NTIgIEMyMy43NTQgMTcuNDU0IDI0IDE3LjcgMjQgMTh2NS40NTRjMCAwLjMtMC4yNDYgMC41NDYtMC41NDggMC41NDZIMTh6IE05LjI3MSAyNGMtMC4yOTggMC0wLjU0My0wLjI0Ni0wLjU0My0wLjU0NlYxOCAgYzAtMC4zIDAuMjQ1LTAuNTQ2IDAuNTQzLTAuNTQ2aDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ2IDAuNTQzIDAuNTQ2djUuNDU0YzAgMC4zLTAuMjQzIDAuNTQ2LTAuNTQzIDAuNTQ2SDkuMjcxeiBNMC41NDggMjQgIEMwLjI0NiAyNCAwIDIzLjc1NCAwIDIzLjQ1NFYxOGMwLTAuMyAwLjI0Ni0wLjU0NiAwLjU0OC0wLjU0Nkg2YzAuMzAyIDAgMC41NDggMC4yNDYgMC41NDggMC41NDZ2NS40NTRDNi41NDggMjMuNzU0IDYuMzAyIDI0IDYgMjQgIEgwLjU0OHogTTE4IDE1LjI3MWMtMC4zIDAtMC41NDgtMC4yNDQtMC41NDgtMC41NDJWOS4yNzJjMC0wLjI5OSAwLjI0OC0wLjU0NSAwLjU0OC0wLjU0NWg1LjQ1MkMyMy43NTQgOC43MjcgMjQgOC45NzMgMjQgOS4yNzIgIHY1LjQ1N2MwIDAuMjk4LTAuMjQ2IDAuNTQyLTAuNTQ4IDAuNTQySDE4eiBNOS4yNzEgMTUuMjcxYy0wLjI5OCAwLTAuNTQzLTAuMjQ0LTAuNTQzLTAuNTQyVjkuMjcyYzAtMC4yOTkgMC4yNDUtMC41NDUgMC41NDMtMC41NDUgIGg1LjQ1N2MwLjMgMCAwLjU0MyAwLjI0NiAwLjU0MyAwLjU0NXY1LjQ1N2MwIDAuMjk4LTAuMjQzIDAuNTQyLTAuNTQzIDAuNTQySDkuMjcxeiBNMC41NDggMTUuMjcxQzAuMjQ2IDE1LjI3MSAwIDE1LjAyNiAwIDE0LjcyOSAgVjkuMjcyYzAtMC4yOTkgMC4yNDYtMC41NDUgMC41NDgtMC41NDVINmMwLjMwMiAwIDAuNTQ4IDAuMjQ2IDAuNTQ4IDAuNTQ1djUuNDU3YzAgMC4yOTgtMC4yNDYgMC41NDItMC41NDggMC41NDJIMC41NDh6IE0xOCA2LjU0NSAgYy0wLjMgMC0wLjU0OC0wLjI0NS0wLjU0OC0wLjU0NVYwLjU0NUMxNy40NTIgMC4yNDUgMTcuNyAwIDE4IDBoNS40NTJDMjMuNzU0IDAgMjQgMC4yNDUgMjQgMC41NDVWNmMwIDAuMy0wLjI0NiAwLjU0NS0wLjU0OCAwLjU0NSAgSDE4eiBNOS4yNzEgNi41NDVDOC45NzQgNi41NDUgOC43MjkgNi4zIDguNzI5IDZWMC41NDVDOC43MjkgMC4yNDUgOC45NzQgMCA5LjI3MSAwaDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ1IDAuNTQzIDAuNTQ1VjYgIGMwIDAuMy0wLjI0MyAwLjU0NS0wLjU0MyAwLjU0NUg5LjI3MXogTTAuNTQ4IDYuNTQ1QzAuMjQ2IDYuNTQ1IDAgNi4zIDAgNlYwLjU0NUMwIDAuMjQ1IDAuMjQ2IDAgMC41NDggMEg2ICBjMC4zMDIgMCAwLjU0OCAwLjI0NSAwLjU0OCAwLjU0NVY2YzAgMC4zLTAuMjQ2IDAuNTQ1LTAuNTQ4IDAuNTQ1SDAuNTQ4eiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdmcgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0ZjgsJTNDc3ZnIHhtbG5zJTNEJTI3aHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTI3IHZpZXdCb3glM0QlMjcwIDAgMjQgMjQlMjclM0UlM0NwYXRoIGZpbGwlM0QlMjd7Y29sb3J9JTI3IGQlM0QlMjdNMCw2YzAsMC4zMDEsMC4yNDYsMC41NDUsMC41NDksMC41NDVoMjIuOTA2QzIzLjc1Niw2LjU0NSwyNCw2LjMwMSwyNCw2VjIuNzNjMC0wLjMwNS0wLjI0NC0wLjU0OS0wLjU0NS0wLjU0OUgwLjU0OSAgQzAuMjQ2LDIuMTgyLDAsMi40MjYsMCwyLjczVjZ6IE0wLDEzLjYzN2MwLDAuMjk3LDAuMjQ2LDAuNTQ1LDAuNTQ5LDAuNTQ1aDIyLjkwNmMwLjMwMSwwLDAuNTQ1LTAuMjQ4LDAuNTQ1LTAuNTQ1di0zLjI3MyAgYzAtMC4yOTctMC4yNDQtMC41NDUtMC41NDUtMC41NDVIMC41NDlDMC4yNDYsOS44MTgsMCwxMC4wNjYsMCwxMC4zNjNWMTMuNjM3eiBNMCwyMS4yN2MwLDAuMzA1LDAuMjQ2LDAuNTQ5LDAuNTQ5LDAuNTQ5aDIyLjkwNiAgYzAuMzAxLDAsMC41NDUtMC4yNDQsMC41NDUtMC41NDlWMThjMC0wLjMwMS0wLjI0NC0wLjU0NS0wLjU0NS0wLjU0NUgwLjU0OUMwLjI0NiwxNy40NTUsMCwxNy42OTksMCwxOFYyMS4yN3olMjclMkYlM0UlM0MlMkZzdmclM0VcIjtcclxuICAgICAgICAgICAgICAgICAgICAvL2xldCBzdmcgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0ZjgsJTNDc3ZnIHhtbG5zJTNEJTI3aHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTI3IHZpZXdCb3glM0QlMjcwIDAgMzIgMzIlMjclM0UlM0NwYXRoIGZpbGwlM0QlMjd7Y29sb3J9JTI3IGQlM0QlMjdNMjgsMjBoLTR2LThoNGMxLjEwNCwwLDItMC44OTYsMi0ycy0wLjg5Ni0yLTItMmgtNFY0YzAtMS4xMDQtMC44OTYtMi0yLTJzLTIsMC44OTYtMiwydjRoLThWNGMwLTEuMTA0LTAuODk2LTItMi0yICBTOCwyLjg5Niw4LDR2NEg0Yy0xLjEwNCwwLTIsMC44OTYtMiwyczAuODk2LDIsMiwyaDR2OEg0Yy0xLjEwNCwwLTIsMC44OTYtMiwyczAuODk2LDIsMiwyaDR2NGMwLDEuMTA0LDAuODk2LDIsMiwyczItMC44OTYsMi0ydi00ICBoOHY0YzAsMS4xMDQsMC44OTYsMiwyLDJzMi0wLjg5NiwyLTJ2LTRoNGMxLjEwNCwwLDItMC44OTYsMi0yUzI5LjEwNCwyMCwyOCwyMHogTTEyLDIwdi04aDh2OEgxMnolMjclMkYlM0UlM0MlMkZzdmclM0VcIjtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZ3RoaWNrbmVzcyA9IGN1cnJlbnRTZXR0aW5ncy5ydWxlclRoaWNrbmVzcztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJhY2tncm91bmQgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY21wU3RyKGN1cnJlbnRTZXR0aW5ncy5ydWxlckJhY2tncm91bmQsIFwicG5nXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VIZWlnaHQgPSBjdXJyZW50U2V0dGluZ3MubGluZUhlaWdodCA+PSBjdXJyZW50U2V0dGluZ3MuZm9udFNpemUgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzLmxpbmVIZWlnaHQgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5yb3VuZCgoY3VycmVudFNldHRpbmdzLmxpbmVIZWlnaHQgKiBjdXJyZW50U2V0dGluZ3MuZm9udFNpemUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYXR0ZXJuID0gY3VycmVudFNldHRpbmdzLnJ1bGVyUGF0dGVybi5zcGxpdChzcGFjZVNwbGl0UmVnZXhwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLnJ1bGVyTWF0cml4KGltYWdlSGVpZ2h0LCBjdXJyZW50U2V0dGluZ3MucnVsZXJDb2xvciwgcGF0dGVybiwgY3VycmVudFNldHRpbmdzLnJ1bGVyVGhpY2tuZXNzLCBjdXJyZW50U2V0dGluZ3MucnVsZXJTY2FsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNtcFN0cihjdXJyZW50U2V0dGluZ3MucnVsZXJPdXRwdXQsIFwiYmFzZTY0XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5nZXRGaWxlKGN1cnJlbnRTZXR0aW5ncy5ydWxlck91dHB1dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kID0gXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIi4uL1wiICsgY3VycmVudFNldHRpbmdzLnJ1bGVyT3V0cHV0ICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXBvc2l0aW9uOiBsZWZ0IHRvcDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXJlcGVhdDogcmVwZWF0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtc2l6ZTogXCIgKyBwYXR0ZXJuLmxlbmd0aCArIFwicHggXCIgKyBpbWFnZUhlaWdodCArIFwicHg7XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsXCIgKyBpbWFnZS5nZXRCYXNlNjQoKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1wb3NpdGlvbjogbGVmdCB0b3A7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1yZXBlYXQ6IHJlcGVhdDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXNpemU6IFwiICsgcGF0dGVybi5sZW5ndGggKyBcInB4IFwiICsgaW1hZ2VIZWlnaHQgKyBcInB4O1wiO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3RoaWNrbmVzcyA9IGd0aGlja25lc3MgKiAzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KHRvIHRvcCwgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFNldHRpbmdzLnJ1bGVyQ29sb3IgKyBcIiBcIiArIGd0aGlja25lc3MgKyBcIiUsIHRyYW5zcGFyZW50IFwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGd0aGlja25lc3MgKyBcIiUpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1zaXplOiAxMDAlIFwiICsgbGluZUhlaWdodCArIFwiO1wiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVyID0gXCJwb3NpdGlvbjogYWJzb2x1dGU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImxlZnQ6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRvcDogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJwYWRkaW5nOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWR0aDogMTAwJTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0OiAxMDAlO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ6LWluZGV4OiA5OTAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJwb2ludGVyLWV2ZW50czogbm9uZTtcIiArIGJhY2tncm91bmQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpY29uU2l6ZSA9IGN1cnJlbnRTZXR0aW5ncy5ydWxlckljb25TaXplO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgW3N0eWxlLCBydWxlckNsYXNzXSA9IGN1cnJlbnRTZXR0aW5ncy5ydWxlclN0eWxlLnNwbGl0KHNwYWNlU3BsaXRSZWdleHApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBbY29sb3IsIGhvdmVyQ29sb3JdID0gY3VycmVudFNldHRpbmdzLnJ1bGVySWNvbkNvbG9ycy5zcGxpdChzcGFjZVNwbGl0UmVnZXhwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJ1bGVyUnVsZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjbXBTdHIoc3R5bGUsIFwic3dpdGNoXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzcGxheTogbm9uZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlciArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6bm9uZTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdICsgbGFiZWwge1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiei1pbmRleDogOTk5OTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXk6IGlubGluZS1ibG9jaztcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlckljb25Qb3NpdGlvbiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hcmdpbjogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhZGRpbmc6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWR0aDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0OiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjdXJzb3I6IHBvaW50ZXI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5yZXBsYWNlKC9cXHtjb2xvclxcfS8sIGVzY2FwZShjb2xvcikpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdOmNoZWNrZWQgKyBsYWJlbCwgaW5wdXRbaWQ9XFxcIlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdOmhvdmVyICsgbGFiZWwge1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJcIiArIHN2Zy5yZXBsYWNlKC9cXHtjb2xvclxcfS8sIGVzY2FwZShob3ZlckNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5wdXRbaWQ9XFxcIlwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdOmNoZWNrZWQgfiAuXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5OiBibG9jaztcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIn1cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHN0eWxlLCBcImhvdmVyXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVySWNvblBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoOiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHQ6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgKyBzdmcucmVwbGFjZShcIntjb2xvcn1cIiwgZXNjYXBlKGNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHJhbnNpdGlvbjogYmFja2dyb3VuZC1pbWFnZSAwLjVzIGVhc2UtaW4tb3V0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLlwiICsgcnVsZXJDbGFzcyArIFwiOmhvdmVyXCIgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnNvcjogcG9pbnRlcjtcIiArIHJ1bGVyICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwifVwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIoc3R5bGUsIFwiYWx3YXlzXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUgPSBwb3N0Y3NzLnBhcnNlKFwiLlwiICsgcnVsZXJDbGFzcyArIFwie1xcblwiICsgcnVsZXIgKyBcIn1cXG5cIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bGVyUnVsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBydWxlclJ1bGUuc291cmNlID0gcnVsZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBydWxlclJ1bGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJlbGxpcHNpc1wiKSB8fCBjbXBTdHIocnVsZS5uYW1lLCBcIm5vd3JhcFwiKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIGNtcFN0cihydWxlLm5hbWUsIFwiZm9yY2V3cmFwXCIpIHx8IGNtcFN0cihydWxlLm5hbWUsIFwiaHlwaGVuc1wiKSB8fCBjbXBTdHIocnVsZS5uYW1lLCBcImJyZWFrLXdvcmRcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gdG9DYW1lbENhc2UocnVsZS5uYW1lKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlY2xzID0gaGVscGVyc1twcm9wZXJ0eV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjbXBTdHIocHJvcGVydHksIFwiaHlwaGVuc1wiKSAmJiBjbXBTdHIocnVsZS5wYXJhbXMsIFwidHJ1ZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNscyA9IGhlbHBlcnMuYnJlYWtXb3JkICsgZGVjbHM7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocHJvcGVydHksIFwiZWxsaXBzaXNcIikgJiYgY21wU3RyKHJ1bGUucGFyYW1zLCBcInRydWVcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjbHMgPSBoZWxwZXJzLm5vd3JhcCArIGRlY2xzO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNtcFN0cihjdXJyZW50U2V0dGluZ3MucHJvcGVydGllcywgXCJpbmxpbmVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpZGVjbHMgPSBwb3N0Y3NzLnBhcnNlKGRlY2xzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJ1bGUsIGlkZWNscyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXh0ZW5kTmFtZSA9IHRvQ2FtZWxDYXNlKHByb3BlcnR5ICsgcnVsZS5wYXJhbXMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIGV4dGVuZCBpbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogcnVsZS5wYXJlbnQuc2VsZWN0b3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbHM6IGRlY2xzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHM6IFtydWxlLnBhcmVudF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldjogcnVsZS5wcmV2KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9BcHBlbmQgc2VsZWN0b3IgYW5kIHVwZGF0ZSBjb3VudGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5zZWxlY3RvciA9IGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLnNlbGVjdG9yICsgXCIsIFwiICsgcnVsZS5wYXJlbnQuc2VsZWN0b3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5wYXJlbnRzLnB1c2gocnVsZS5wYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0uY291bnQrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocnVsZS5uYW1lLCBcInJlc2V0XCIpIHwgY21wU3RyKHJ1bGUubmFtZSwgXCJub3JtYWxpemVcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBydWxlLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcnVsZXMgPSBwb3N0Y3NzLnBhcnNlKGhlbHBlcnNbcHJvcGVydHldKTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlcy5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBydWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFdhbGsgaW4gbWVkaWEgcXVlcmllc1xyXG4gICAgICAgICAgICAgICAgbm9kZS53YWxrKGNoaWxkID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNtcFN0cihjaGlsZC50eXBlLCBcInJ1bGVcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2FsayBkZWNscyBpbiBydWxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhbGtEZWNscyhjaGlsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gZWxzZSBpZiAocnVsZS5uYW1lID09IFwianNcIikge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vICAgICBsZXQgamNzcyA9IHJ1bGUudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBsZXQgY29kZSA9IGpjc3MucmVwbGFjZSgvXFxAanNcXHMqXFx7KFtcXHNcXFNdKylcXH0kL2ksIFwiJDFcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGpjc3MpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIC8vIHJ1bGVyUnVsZS5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgcnVsZXJSdWxlKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICBydWxlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIobm9kZS50eXBlLCBcInJ1bGVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBXYWxrIGRlY2xzIGluIHJ1bGVcclxuICAgICAgICAgICAgICAgIHdhbGtEZWNscyhub2RlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFNldHRpbmdzLnJlbW92ZUNvbW1lbnRzICYmIGNtcFN0cihub2RlLnR5cGUsIFwiY29tbWVudFwiKSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIEV4dGVuZHMgdG8gQ1NTXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGV4dGVuZE5vZGVzKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgbm9kZSA9IGV4dGVuZE5vZGVzW2tleV07XHJcblxyXG4gICAgICAgICAgICBpZiAobm9kZS5jb3VudCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBydWxlID0gcG9zdGNzcy5wYXJzZShub2RlLnNlbGVjdG9yICsgXCJ7XCIgKyBub2RlLmRlY2xzICsgXCJ9XCIpO1xyXG4gICAgICAgICAgICAgICAgcnVsZS5zb3VyY2UgPSBub2RlLnNvdXJjZTtcclxuXHJcbiAgICAgICAgICAgICAgICBub2RlLnBhcmVudHNbMF0ucGFyZW50Lmluc2VydEJlZm9yZShub2RlLnBhcmVudHNbMF0sIHJ1bGUpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZWNscyA9IHBvc3Rjc3MucGFyc2Uobm9kZS5kZWNscyk7XHJcbiAgICAgICAgICAgICAgICBkZWNscy5zb3VyY2UgPSBub2RlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIG5vZGUucGFyZW50c1swXS5pbnNlcnRBZnRlcihub2RlLnByZXYsIGRlY2xzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIHVudXNlZCBwYXJlbnQgbm9kZXMuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgaW4gbm9kZS5wYXJlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5wYXJlbnRzW2ldLm5vZGVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucGFyZW50c1tpXS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGhhbXN0ZXI7Il19
