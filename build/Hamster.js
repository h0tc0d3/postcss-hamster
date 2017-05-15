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

// import postcss from "../../postcss/build/lib/postcss.js";

var helpers = {

    reset: _fs2.default.readFileSync(_path2.default.resolve(__dirname, "../helpers/reset.css"), "utf8"),

    normalize: _fs2.default.readFileSync(_path2.default.resolve(__dirname, "../helpers/normalize.css"), "utf8"),

    sanitize: _fs2.default.readFileSync(_path2.default.resolve(__dirname, "../helpers/sanitize.css"), "utf8"),

    boxSizingReset: "\nhtml {\n  box-sizing: border-box;\n}\n*, *:before, *:after {\n  box-sizing: inherit;\n}\n",

    nowrap: "\n  white-space: nowrap;\n",

    forcewrap: "\n  white-space: pre;\n  white-space: pre-line;\n  white-space: pre-wrap;\n  word-wrap: break-word;\n",

    ellipsis: "\n  overflow: hidden;\n  text-overflow: ellipsis;\n",

    hyphens: "\n  word-wrap: break-word;\n  hyphens: auto;\n",

    breakWord: /* Non standard for webkit */
    "\n  word-break: break-word;\n  word-break: break-all;\n"
};

// fontSize property Regexp

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

var fontSizeRegexp = /(fontSize|fs)\s+([\-$@0-9a-zA-Z]+)/i;

// rhythm functions Regexp
var rhythmRegexp = /(-?)(\s*)(lineHeight|lheight|spacing|leading|!rhythm|irhythm|rhythm|base)\((.*?)\)/i;

// Comma split regexp
var commaSplitRegexp = /\s*,\s*/;

// Space split regexp
var spaceSplitRegexp = /\s+/;

/**
 * Return viewport calculated value.
 * @param M
 * @param B
 * @param value
 * @param hasMinus
 * @returns {string}
 */
function vwValue(M, B, value) {
    var hasMinus = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    var ret = B === 0 ? (0, _Helpers.formatValue)(M * value) + "vw" : B > 0 ? (0, _Helpers.formatValue)(M * value) + "vw + " + (0, _Helpers.formatValue)(B * value) + "px" : (0, _Helpers.formatValue)(M * value) + "vw " + (0, _Helpers.formatValue)(B * value).replace("-", "- ") + "px";
    return hasMinus ? "calc((" + ret + ") * -1)" : "calc(" + ret + ")";
}
/**
 * Add Settings to settings table.
 * @param rule - current rule.
 * @param settings - settings table.
 */
function addSettings(rule, settings) {

    rule.walkDecls(function (decl) {

        var prop = (0, _Helpers.toCamelCase)(decl.prop);
        if ((0, _Helpers.scmpStr)(prop, "remFallback") || (0, _Helpers.scmpStr)(prop, "pxFallback") || (0, _Helpers.scmpStr)(prop, "pxBaseline") || (0, _Helpers.scmpStr)(prop, "roundToHalfLine") || (0, _Helpers.scmpStr)(prop, "ruler") || (0, _Helpers.scmpStr)(prop, "legacyBrowsers") || (0, _Helpers.scmpStr)(prop, "removeComments")) {

            settings[prop] = (0, _Helpers.cmpStr)(decl.value, "true");
        } else if ((0, _Helpers.scmpStr)(prop, "unit")) {

            settings.unit = (0, _Helpers.getUnit)(decl.value);
        } else if ((0, _Helpers.scmpStr)(prop, "lineHeight") || (0, _Helpers.scmpStr)(prop, "toLineHeight")) {

            settings[prop] = parseFloat(decl.value);
        } else if ((0, _Helpers.scmpStr)(prop, "fontSize") || (0, _Helpers.scmpStr)(prop, "toFontSize") || (0, _Helpers.scmpStr)(prop, "minLinePadding") || (0, _Helpers.scmpStr)(prop, "rulerThickness") || (0, _Helpers.scmpStr)(prop, "rulerScale") || (0, _Helpers.scmpStr)(prop, "browserFontSize")) {

            settings[prop] = parseInt(decl.value);
        } else {

            settings[prop] = decl.value;
        }
    });
}

function hamster(options) {

    // Default Global Settings
    var globalSettings = {

        fontSize: 16,
        toFontSize: 0,
        fontSizeM: 0,
        fontSizeB: 0,

        lineHeight: 1.5,
        lineHeightRel: 0,
        lineHeightPx: 0,
        lineHeightM: 0,
        lineHeightB: 0,
        toLineHeight: 0,
        toLineHeightPx: 0,
        toLineHeightRel: 0,

        viewport: null,

        unit: _Helpers.UNIT.EM,

        pxFallback: false,
        remFallback: true,
        pxBaseline: false,
        fontRatio: "1.25",

        properties: "inline",

        minLinePadding: 2,
        roundToHalfLine: false,

        ruler: true,
        rulerStyle: "always ruler-debug",
        rulerIconPosition: "position:fixed;top: spacing(1);left: spacing(1);",
        rulerIconColors: "#cccccc #44576a",
        rulerIconSize: "spacing(1)",
        rulerColor: "rgba(19, 134, 191, .8)",
        rulerThickness: 1,
        rulerBackground: "gradient",
        rulerOutput: "base64",
        rulerPattern: "1 0 0 0",
        rulerScale: 1,

        browserFontSize: 16,
        legacyBrowsers: true,
        removeComments: false,
        fontSizes: null
    };

    // Value toLowerCase()
    var toLowerCaseKeys = ["unit", "fontRatio", "properties", "rulerStyle", "rulerBackground", "rulerOutput"];

    var backSettings = (0, _Helpers.extend)({}, globalSettings);
    // Current Settings extend({}, globalSettings)
    var settings = {};
    if (options) {
        (0, _Helpers.extend)(globalSettings, options, false);
    }
    var settingsRegexp = void 0;
    //Current FontSizes
    var currentFontSizes = null;
    // font Sizes
    var fontSizes = void 0;
    // Vertical Rhythm Calculator
    var rhythm = void 0;
    // Last Css File
    // let lastFile;
    var image = new _PngImage2.default();
    // Extend Nodes
    var extendNodes = {};

    /**
     * Init current Settings
     */
    var initSettings = function initSettings() {
        currentFontSizes = null;
        // Add fontSizes
        if (globalSettings.fontSizes) {
            currentFontSizes = globalSettings.fontSizes;
        }

        if (settings.fontSizes) {
            currentFontSizes = currentFontSizes ? currentFontSizes + ", " + settings.fontSizes : settings.fontSizes;
        }

        // ToLowerCase Current Settings
        for (var key in toLowerCaseKeys) {
            if (settings.hasOwnProperty(key)) {
                settings[key] = settings[key].toLowerCase();
            }
        }

        // relative line-height
        settings.lineHeightRel = settings.lineHeight > settings.fontSize ? settings.lineHeight / settings.fontSize : settings.lineHeight;

        // Pixel line-height
        settings.lineHeightPx = settings.lineHeight > settings.fontSize ? settings.lineHeight : settings.lineHeight * settings.fontSize;
        if (settings.unit === _Helpers.UNIT.PX && settings.pxFallback) {
            settings.lineHeightPx = Math.round(settings.lineHeightPx);
        }

        if (settings.unit === _Helpers.UNIT.VW) {

            var view = settings.viewport.split(spaceSplitRegexp);
            var from = parseFloat(view[0]);
            var to = parseFloat(view[1]);

            var viewDiff = to - from;
            settings.fontSizeM = (settings.toFontSize - settings.fontSize) / viewDiff;
            settings.fontSizeB = settings.fontSize - settings.fontSizeM * from;
            settings.fontSizeM = settings.fontSizeM * 100;

            // relative line-height
            settings.toLineHeightRel = settings.toLineHeight > settings.toFontSize ? settings.toLineHeight / settings.toFontSize : settings.toLineHeight;

            // Pixel line-height
            settings.toLineHeightPx = settings.toLineHeight > settings.toFontSize ? settings.toLineHeight : settings.toLineHeight * settings.toFontSize;

            settings.lineHeightM = (settings.toLineHeightPx - settings.lineHeightPx) / viewDiff;
            settings.lineHeightB = settings.lineHeightPx - settings.lineHeightM * from;
            settings.lineHeightM = settings.lineHeightM * 100;
        }

        fontSizes = new _FontSizes2.default(settings);
        rhythm = new _VerticalRhythm2.default(settings);
        if (currentFontSizes) {
            fontSizes.addFontSizes(currentFontSizes, rhythm);
        }
        var settingsKeys = Object.keys(settings).join("|");
        //let settingsKeysString = toKebabCase(settingsKeys).replace(/-/g, "\\-");
        var settingsKeysString = (0, _Helpers.toKebabCase)(settingsKeys).split("-").join("\\-");
        settingsRegexp = new RegExp("\\@(" + settingsKeysString + ")", "i");
    };

    var walkAtRule = function walkAtRule(rule) {

        if ((0, _Helpers.cmpStr)(rule.name, "hamster")) {

            if ((0, _Helpers.cmpStr)(rule.params, "reset")) {

                globalSettings = (0, _Helpers.extend)({}, backSettings);
            } else if (!(0, _Helpers.cmpStr)(rule.params, "end")) {

                addSettings(rule, globalSettings);
            }
            // Reset current settings
            settings = (0, _Helpers.extend)({}, globalSettings);

            // Init current Settings
            initSettings();

            // Remove Rule Hamster
            rule.remove();
        } else if ((0, _Helpers.cmpStr)(rule.name, "ihamster") || (0, _Helpers.cmpStr)(rule.name, "!hamster")) {

            addSettings(rule, settings);

            // Init current Settings
            initSettings();

            rule.remove();
        } else if ((0, _Helpers.cmpStr)(rule.name, "ellipsis") || (0, _Helpers.cmpStr)(rule.name, "nowrap") || (0, _Helpers.cmpStr)(rule.name, "forcewrap") || (0, _Helpers.cmpStr)(rule.name, "hyphens") || (0, _Helpers.cmpStr)(rule.name, "break-word")) {

            var property = (0, _Helpers.toCamelCase)(rule.name);

            var decls = helpers[property];

            if ((0, _Helpers.cmpStr)(property, "hyphens") && (0, _Helpers.cmpStr)(rule.params, "true")) {
                decls = helpers.breakWord + decls;
            } else if ((0, _Helpers.cmpStr)(property, "ellipsis") && (0, _Helpers.cmpStr)(rule.params, "true")) {
                decls = helpers.nowrap + decls;
            }

            if ((0, _Helpers.cmpStr)(settings.properties, "inline")) {

                var idecls = _postcss2.default.parse(decls);
                rule.parent.insertBefore(rule, idecls);
            } else {

                var extendName = (0, _Helpers.toCamelCase)(property + rule.params);

                if (!extendNodes.hasOwnProperty(extendName)) {

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
        } else if ((0, _Helpers.cmpStr)(rule.name, "reset") || (0, _Helpers.cmpStr)(rule.name, "normalize") || (0, _Helpers.cmpStr)(rule.name, "sanitize") || (0, _Helpers.cmpStr)(rule.name, "box-sizing-reset")) {

            var _property = (0, _Helpers.toCamelCase)(rule.name);
            var rules = _postcss2.default.parse(helpers[_property]);
            rules.source = rule.source;
            rule.parent.insertAfter(rule, rules);
            rule.remove();
            // } else if(cmpStr(rule.name, "rhythm")){
            //     let [width, height, outputUnit] = rule.param.split(spaceSplitRegexp);
            //     if(!outputUnit){
            //         outputUnit = settings.unit;
            //     } else {
            //         outputUnit = UNIT[outputUnit];
            //     }
            //     rhythm.rhythm(height, fontSize, false, outputUnit);
        } else if ((0, _Helpers.cmpStr)(rule.name, "baseline")) {

            var lineHeight = rhythm.lineHeight(settings.fontSize + "px");

            // baseline font size
            var fontSizeDecl = void 0;

            if (settings.pxBaseline || settings.unit === _Helpers.UNIT.PX && !settings.legacyBrowsers) {

                fontSizeDecl = _postcss2.default.decl({
                    prop: "font-size",
                    value: settings.fontSize + "px",
                    source: rule.source
                });
            } else {

                var relativeSize = 100 * settings.fontSize / settings.browserFontSize;

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

                if (settings.unit === _Helpers.UNIT.PX && settings.legacyBrowsers) {
                    var asteriskHtmlRule = _postcss2.default.rule({
                        selector: "* html",
                        source: rule.source
                    });
                    asteriskHtmlRule.append(lineHeightDecl.clone());
                    rule.parent.insertAfter(rule, asteriskHtmlRule);
                }
            } else {

                rule.parent.insertAfter(rule, lineHeightDecl);
                rule.parent.insertAfter(rule, fontSizeDecl);

                if (settings.unit === _Helpers.UNIT.REM && settings.remFallback) {

                    rule.parent.insertBefore(lineHeightDecl, _postcss2.default.decl({
                        prop: "line-height",
                        value: rhythm.remFallback(lineHeight),
                        source: rule.source
                    }));
                }
            }

            rule.remove();
        } else if ((0, _Helpers.cmpStr)(rule.name, "ruler")) {

            var rulerIconPosition = settings.rulerIconPosition.replace(/['"]/g, "");

            var svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M18 24c-0.3 0-0.548-0.246-0.548-0.546V18c0-0.3 0.248-0.546 0.548-0.546h5.452  C23.754 17.454 24 17.7 24 18v5.454c0 0.3-0.246 0.546-0.548 0.546H18z M9.271 24c-0.298 0-0.543-0.246-0.543-0.546V18  c0-0.3 0.245-0.546 0.543-0.546h5.457c0.3 0 0.543 0.246 0.543 0.546v5.454c0 0.3-0.243 0.546-0.543 0.546H9.271z M0.548 24  C0.246 24 0 23.754 0 23.454V18c0-0.3 0.246-0.546 0.548-0.546H6c0.302 0 0.548 0.246 0.548 0.546v5.454C6.548 23.754 6.302 24 6 24  H0.548z M18 15.271c-0.3 0-0.548-0.244-0.548-0.542V9.272c0-0.299 0.248-0.545 0.548-0.545h5.452C23.754 8.727 24 8.973 24 9.272  v5.457c0 0.298-0.246 0.542-0.548 0.542H18z M9.271 15.271c-0.298 0-0.543-0.244-0.543-0.542V9.272c0-0.299 0.245-0.545 0.543-0.545  h5.457c0.3 0 0.543 0.246 0.543 0.545v5.457c0 0.298-0.243 0.542-0.543 0.542H9.271z M0.548 15.271C0.246 15.271 0 15.026 0 14.729  V9.272c0-0.299 0.246-0.545 0.548-0.545H6c0.302 0 0.548 0.246 0.548 0.545v5.457c0 0.298-0.246 0.542-0.548 0.542H0.548z M18 6.545  c-0.3 0-0.548-0.245-0.548-0.545V0.545C17.452 0.245 17.7 0 18 0h5.452C23.754 0 24 0.245 24 0.545V6c0 0.3-0.246 0.545-0.548 0.545  H18z M9.271 6.545C8.974 6.545 8.729 6.3 8.729 6V0.545C8.729 0.245 8.974 0 9.271 0h5.457c0.3 0 0.543 0.245 0.543 0.545V6  c0 0.3-0.243 0.545-0.543 0.545H9.271z M0.548 6.545C0.246 6.545 0 6.3 0 6V0.545C0 0.245 0.246 0 0.548 0H6  c0.302 0 0.548 0.245 0.548 0.545V6c0 0.3-0.246 0.545-0.548 0.545H0.548z%27%2F%3E%3C%2Fsvg%3E";
            // let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M0,6c0,0.301,0.246,0.545,0.549,0.545h22.906C23.756,6.545,24,6.301,24,6V2.73c0-0.305-0.244-0.549-0.545-0.549H0.549  C0.246,2.182,0,2.426,0,2.73V6z M0,13.637c0,0.297,0.246,0.545,0.549,0.545h22.906c0.301,0,0.545-0.248,0.545-0.545v-3.273  c0-0.297-0.244-0.545-0.545-0.545H0.549C0.246,9.818,0,10.066,0,10.363V13.637z M0,21.27c0,0.305,0.246,0.549,0.549,0.549h22.906  c0.301,0,0.545-0.244,0.545-0.549V18c0-0.301-0.244-0.545-0.545-0.545H0.549C0.246,17.455,0,17.699,0,18V21.27z%27%2F%3E%3C%2Fsvg%3E";

            var gthickness = settings.rulerThickness;

            var background = "";

            if ((0, _Helpers.cmpStr)(settings.rulerBackground, "png")) {

                var imageHeight = settings.lineHeight >= settings.fontSize ? settings.lineHeight : Math.round(settings.lineHeight * settings.fontSize);

                var pattern = settings.rulerPattern.split(spaceSplitRegexp);

                image.rulerMatrix(imageHeight, settings.rulerColor, pattern, settings.rulerThickness, settings.rulerScale);

                if (!(0, _Helpers.cmpStr)(settings.rulerOutput, "base64")) {
                    image.getFile(settings.rulerOutput);
                    background = "\n  background-image: url(\"../" + settings.rulerOutput + "\");" + "\n  background-position: left top;" + "\n  background-repeat: repeat;" + "\n  background-size: " + pattern.length + "px " + imageHeight + "px;";
                } else {
                    background = "\n  background-image: url(\"data:image/png;base64," + image.getBase64() + "\");" + "\n  background-position: left top;" + "\n  background-repeat: repeat;" + "\n  background-size: " + pattern.length + "px " + imageHeight + "px;";
                }
            } else {

                gthickness = gthickness * 2;
                var _lineHeight = settings.unit === _Helpers.UNIT.VW ? vwValue(settings.lineHeightM, settings.lineHeightB, 1) : settings.lineHeight >= settings.fontSize ? settings.lineHeight + _Helpers.unitName[_Helpers.UNIT.PX] : settings.lineHeight + _Helpers.unitName[settings.unit];

                background = "\n  background-image: linear-gradient(to top, " + settings.rulerColor + " " + gthickness + "%, transparent " + gthickness + "%);" + "\n  background-size: 100% " + _lineHeight + ";";
            }

            var ruler = "\n  position: absolute;\n  left: 0;\n  top: 0;\n  margin: 0;\n  padding: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 9900;\n  pointer-events: none;" + background;

            var iconSize = settings.rulerIconSize;

            var _settings$rulerStyle$ = settings.rulerStyle.split(spaceSplitRegexp),
                style = _settings$rulerStyle$[0],
                rulerClass = _settings$rulerStyle$[1];

            var _settings$rulerIconCo = settings.rulerIconColors.split(spaceSplitRegexp),
                color = _settings$rulerIconCo[0],
                hoverColor = _settings$rulerIconCo[1];

            var rulerRule = null;

            if ((0, _Helpers.cmpStr)(style, "switch")) {

                rulerRule = _postcss2.default.parse("\n." + rulerClass + "{" + "\n  display: none;" + ruler + "}" + "\ninput[id=\"" + rulerClass + "\"] {" + "\n  display:none;" + "}" + "\ninput[id=\"" + rulerClass + "\"] + label {" + "\n  z-index: 9999;" + "\n  display: inline-block;" + rulerIconPosition + "\n  margin: 0;" + "\n  padding: 0;" + "\n  width: " + iconSize + ";" + "\n  height: " + iconSize + ";" + "\n  cursor: pointer;" + "\n  background-image: url(\"" + svg.replace("{color}", escape(color)) + "\");" + "}" + "\ninput[id=\"" + rulerClass + "\"]:checked + label, input[id=\"" + rulerClass + "\"]:hover + label {" + "\n  background-image: url(\"" + svg.replace("{color}", escape(hoverColor)) + "\");" + "}" + "\ninput[id=\"" + rulerClass + "\"]:checked ~ ." + rulerClass + "{" + "\n  display: block;" + "}");
            } else if ((0, _Helpers.cmpStr)(style, "hover")) {

                rulerRule = _postcss2.default.parse("\n." + rulerClass + "{" + rulerIconPosition + "\n  margin: 0;" + "\n  padding: 0;" + "\n  width: " + iconSize + ";" + "\n  height: " + iconSize + ";" + "\n  background-image: url(\"" + svg.replace("{color}", escape(color)) + "\");" + "\n  transition: background-image 0.5s ease-in-out;" + "}" + "." + rulerClass + ":hover" + "{" + "\n  cursor: pointer;" + ruler + "}");
            } else if ((0, _Helpers.cmpStr)(style, "always")) {

                rulerRule = _postcss2.default.parse("\n." + rulerClass + "{\n" + ruler + "}\n");
            }

            if (rulerRule) {
                rulerRule.source = rule.source;
                walkDecls(rulerRule);
                rule.parent.insertBefore(rule, rulerRule);
            }

            rule.remove();
        }
        // Walk in media queries
        rule.walk(function (child) {
            if ((0, _Helpers.cmpStr)(child.type, "atrule")) {
                walkAtRule(child);
            } else if ((0, _Helpers.cmpStr)(child.type, "rule")) {
                // Walk decls in atrule
                walkDecls(child);
            }
        });
    };

    var walkDecls = function walkDecls(node) {

        var ruleFontSize = void 0;

        node.walkDecls(function (decl) {

            var found = void 0;

            var findRuleFontSize = function findRuleFontSize() {
                if (!ruleFontSize) {
                    decl.parent.walkDecls(function (fsdecl) {
                        if ((0, _Helpers.cmpStr)(fsdecl.prop, "font-size")) {
                            ruleFontSize = fsdecl.value;
                        }
                    });
                }
            };

            if (decl.value) {

                // Replace Variables with values
                while (found = decl.value.match(settingsRegexp)) {
                    var variable = (0, _Helpers.toCamelCase)(found[1]);
                    decl.value = decl.value.replace(found[0], settings[variable]);
                }

                // Replace Font Size
                while (found = decl.value.match(fontSizeRegexp)) {
                    var _found$2$split = found[2].split("$"),
                        fontSize = _found$2$split[0],
                        sizeUnit = _found$2$split[1];

                    sizeUnit = sizeUnit ? (0, _Helpers.getUnit)(sizeUnit) : settings.unit;

                    var size = fontSizes.getSize(fontSize);
                    // Write font size
                    if (sizeUnit === _Helpers.UNIT.VW) {
                        if (decl.value.match(rhythmRegexp)) {
                            fontSize = size.rel + "rem";
                        } else {
                            fontSize = vwValue(settings.fontSizeM, settings.fontSizeB, size.rel);
                        }
                        // Save relative font-size in current rule
                        if ((0, _Helpers.cmpStr)(decl.prop, "font-size") || (0, _Helpers.cmpStr)(decl.prop, "adjust-font-size")) {
                            ruleFontSize = size.rel + "rem";
                        }
                    } else {
                        fontSize = sizeUnit === _Helpers.UNIT.PX ? (0, _Helpers.formatInt)(size.px) + _Helpers.unitName[sizeUnit] : (0, _Helpers.formatValue)(size.rel) + _Helpers.unitName[sizeUnit];
                    }

                    decl.value = decl.value.replace(found[0], fontSize);
                }

                // Adjust Font Size
                if ((0, _Helpers.cmpStr)(decl.prop, "adjust-font-size")) {
                    var _ref = settings.unit === _Helpers.UNIT.VW ? decl.value.split(commaSplitRegexp) : decl.value.split(spaceSplitRegexp),
                        fontSize = _ref[0],
                        lines = _ref[1],
                        baseFontSize = _ref[2];

                    var fontSizeUnit = (0, _Helpers.getUnit)(fontSize);
                    var lineHeight = void 0;

                    if (settings.unit === _Helpers.UNIT.VW) {

                        if (fontSizeUnit) {

                            fontSize = rhythm.convert(fontSize, fontSizeUnit, _Helpers.UNIT.REM, baseFontSize);
                            lineHeight = rhythm.lineHeight(fontSize + "rem", lines, baseFontSize);

                            fontSize = vwValue(settings.fontSizeM, settings.fontSizeB, fontSize);
                        } else {

                            lineHeight = rhythm.lineHeight(ruleFontSize, lines, baseFontSize);
                        }

                        lineHeight = vwValue(settings.lineHeightM, settings.lineHeightB, lineHeight);
                    } else {

                        fontSize = rhythm.convert(fontSize, fontSizeUnit, null, baseFontSize) + _Helpers.unitName[settings.unit];
                        lineHeight = rhythm.lineHeight(fontSize, lines, baseFontSize);
                    }

                    var lineHeightDecl = _postcss2.default.decl({
                        prop: "line-height",
                        value: lineHeight,
                        source: decl.source
                    });

                    decl.value = fontSize;
                    decl.prop = "font-size";
                    decl.parent.insertAfter(decl, lineHeightDecl);
                }
                // lineHeight, spacing, leading, rhythm, !rhythm
                while (found = decl.value.match(rhythmRegexp)) {
                    var hasMinus = (0, _Helpers.scmpStr)(found[1], "-");
                    var property = found[3]; // lineHeight, spacing, leading, rhythm, !rhythm, base
                    var parameters = found[4].split(commaSplitRegexp);
                    var ret = [];
                    for (var i in parameters) {
                        var _parameters$i$split = parameters[i].split(spaceSplitRegexp),
                            value = _parameters$i$split[0],
                            _fontSize = _parameters$i$split[1];

                        if (!_fontSize) {
                            if (!ruleFontSize) {
                                findRuleFontSize();
                            }
                            _fontSize = ruleFontSize;
                        }

                        if ((0, _Helpers.cmpStr)(property, "base")) {
                            if (settings.unit === _Helpers.UNIT.VW) {
                                ret.push(found[2] + vwValue(settings.fontSizeM, settings.fontSizeB, value, hasMinus));
                            } else {
                                ret.push(found[1] + found[2] + rhythm.base(value, _fontSize));
                            }
                        } else if ((0, _Helpers.cmpStr)(property, "lineheight") || (0, _Helpers.cmpStr)(property, "lheight")) {
                            var rvalue = rhythm.lineHeight(_fontSize, value, null);
                            if (settings.unit === _Helpers.UNIT.VW) {
                                rvalue = vwValue(settings.lineHeightM, settings.lineHeightB, rvalue, hasMinus);
                                ret.push(found[2] + rvalue);
                            } else {
                                ret.push(found[1] + found[2] + rvalue);
                            }
                        } else if ((0, _Helpers.cmpStr)(property, "spacing")) {
                            var _rvalue = rhythm.lineHeight(_fontSize, value, null, true);
                            if (settings.unit === _Helpers.UNIT.VW) {
                                _rvalue = vwValue(settings.lineHeightM, settings.lineHeightB, _rvalue, hasMinus);
                                ret.push(found[2] + _rvalue);
                            } else {
                                ret.push(found[1] + found[2] + _rvalue);
                            }
                        } else if ((0, _Helpers.cmpStr)(property, "leading")) {

                            var _rvalue2 = rhythm.leading(value, _fontSize);
                            if (settings.unit === _Helpers.UNIT.VW) {
                                _rvalue2 = vwValue(settings.lineHeightM * _rvalue2 - settings.fontSizeM, settings.lineHeightB * _rvalue2 - settings.fontSizeB, value, hasMinus);
                                ret.push(found[2] + _rvalue2);
                            } else {
                                ret.push(found[1] + found[2] + _rvalue2);
                            }
                        } else if ((0, _Helpers.cmpStr)(property, "!rhythm") || (0, _Helpers.cmpStr)(property, "irhythm")) {
                            var _value$split = value.split("$"),
                                inValue = _value$split[0],
                                outputUnit = _value$split[1];

                            outputUnit = _Helpers.UNIT[outputUnit];
                            var _rvalue3 = rhythm.rhythm(inValue, _fontSize, true, outputUnit);
                            if (settings.unit === _Helpers.UNIT.VW) {
                                _rvalue3 = vwValue(settings.lineHeightM, settings.lineHeightB, _rvalue3, hasMinus);
                                ret.push(found[2] + _rvalue3);
                            } else {
                                ret.push(found[1] + found[2] + _rvalue3);
                            }
                        } else if ((0, _Helpers.cmpStr)(property, "rhythm")) {
                            var _value$split2 = value.split("$"),
                                _inValue = _value$split2[0],
                                _outputUnit = _value$split2[1];

                            _outputUnit = _Helpers.UNIT[_outputUnit];
                            var _rvalue4 = rhythm.rhythm(_inValue, _fontSize, false, _outputUnit);
                            if (settings.unit === _Helpers.UNIT.VW) {
                                _rvalue4 = vwValue(settings.lineHeightM, settings.lineHeightB, _rvalue4, hasMinus);
                                ret.push(found[2] + _rvalue4);
                            } else {
                                ret.push(found[1] + found[2] + _rvalue4);
                            }
                        }
                    }
                    decl.value = decl.value.replace(found[0], ret.join(" "));
                }

                //rem fallback
                if (settings.remFallback && decl.value.match(_Helpers.remRegexp)) {
                    decl.parent.insertBefore(decl, decl.clone({
                        value: rhythm.remFallback(decl.value)
                    }));
                }
                // if (settings.remFallback && isHas(decl.value, "rem")) {
                //     let values = decl.value.split(" ");
                //     for (let i = 0, vsize = values.length; i < vsize; i++) {
                //         if (isHas(values[i], "rem")) {
                //             values[i] = rhythmCalculator.convert(values[i], UNIT.REM, UNIT.PX) + "px";
                //         }
                //     }
                //     decl.parent.insertBefore(decl, decl.clone({
                //         value: values.join(" "),
                //         source: decl.source
                //     }));
                // }
            }
        });
    };

    return function (css) {

        // @copy and @paste nodes;
        var copyPasteNode = {};
        // Make copy paste css code
        css.walkAtRules(function (rule) {
            if ((0, _Helpers.cmpStr)(rule.name, "copy")) {

                var name = (0, _Helpers.toCamelCase)(rule.params);
                copyPasteNode[name] = rule;
                //rule.remove();
            } else if ((0, _Helpers.cmpStr)(rule.name, "paste")) {

                var _name = (0, _Helpers.toCamelCase)(rule.params);
                var nodes = copyPasteNode[_name].nodes;
                var len = nodes.length;
                for (var i = 0; i < len; i++) {
                    rule.parent.insertBefore(rule, nodes[i].clone({ source: rule.source }));
                }
                rule.remove();
            }
        });

        for (var key in copyPasteNode) {
            if (copyPasteNode.hasOwnProperty(key)) {
                copyPasteNode[key].remove();
            }
        }

        copyPasteNode = null;
        // Other Work
        css.walk(function (node) {
            // if (lastFile != node.source.input.file) {
            // 	lastFile = node.source.input.file;
            // }

            if ((0, _Helpers.cmpStr)(node.type, "atrule")) {

                walkAtRule(node);
            } else if ((0, _Helpers.cmpStr)(node.type, "rule")) {

                // Walk decls in rule
                walkDecls(node);
            } else if (settings.removeComments && (0, _Helpers.cmpStr)(node.type, "comment")) {
                node.remove();
            }
        });

        // Append Extends to CSS
        for (var _key in extendNodes) {

            var node = extendNodes[_key];

            if (node.count > 1) {
                var rule = _postcss2.default.parse(node.selector + " {" + node.decls + "}");
                rule.source = node.source;
                node.parents[0].parent.insertBefore(node.parents[0], rule);
            } else {
                var decls = _postcss2.default.parse(node.decls);
                decls.source = node.source;
                node.parents[0].insertAfter(node.prev, decls);
            }

            // Remove unused parent nodes.
            for (var i in node.parents) {
                if (node.parents.hasOwnProperty(i) && node.parents[i].nodes.length === 0) {
                    node.parents[i].remove();
                }
            }
        }
        extendNodes = {};
    };
}

exports.default = hamster;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhlbHBlcnMiLCJyZXNldCIsInJlYWRGaWxlU3luYyIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJub3JtYWxpemUiLCJzYW5pdGl6ZSIsImJveFNpemluZ1Jlc2V0Iiwibm93cmFwIiwiZm9yY2V3cmFwIiwiZWxsaXBzaXMiLCJoeXBoZW5zIiwiYnJlYWtXb3JkIiwiZm9udFNpemVSZWdleHAiLCJyaHl0aG1SZWdleHAiLCJjb21tYVNwbGl0UmVnZXhwIiwic3BhY2VTcGxpdFJlZ2V4cCIsInZ3VmFsdWUiLCJNIiwiQiIsInZhbHVlIiwiaGFzTWludXMiLCJyZXQiLCJyZXBsYWNlIiwiYWRkU2V0dGluZ3MiLCJydWxlIiwic2V0dGluZ3MiLCJ3YWxrRGVjbHMiLCJwcm9wIiwiZGVjbCIsInVuaXQiLCJwYXJzZUZsb2F0IiwicGFyc2VJbnQiLCJoYW1zdGVyIiwib3B0aW9ucyIsImdsb2JhbFNldHRpbmdzIiwiZm9udFNpemUiLCJ0b0ZvbnRTaXplIiwiZm9udFNpemVNIiwiZm9udFNpemVCIiwibGluZUhlaWdodCIsImxpbmVIZWlnaHRSZWwiLCJsaW5lSGVpZ2h0UHgiLCJsaW5lSGVpZ2h0TSIsImxpbmVIZWlnaHRCIiwidG9MaW5lSGVpZ2h0IiwidG9MaW5lSGVpZ2h0UHgiLCJ0b0xpbmVIZWlnaHRSZWwiLCJ2aWV3cG9ydCIsIkVNIiwicHhGYWxsYmFjayIsInJlbUZhbGxiYWNrIiwicHhCYXNlbGluZSIsImZvbnRSYXRpbyIsInByb3BlcnRpZXMiLCJtaW5MaW5lUGFkZGluZyIsInJvdW5kVG9IYWxmTGluZSIsInJ1bGVyIiwicnVsZXJTdHlsZSIsInJ1bGVySWNvblBvc2l0aW9uIiwicnVsZXJJY29uQ29sb3JzIiwicnVsZXJJY29uU2l6ZSIsInJ1bGVyQ29sb3IiLCJydWxlclRoaWNrbmVzcyIsInJ1bGVyQmFja2dyb3VuZCIsInJ1bGVyT3V0cHV0IiwicnVsZXJQYXR0ZXJuIiwicnVsZXJTY2FsZSIsImJyb3dzZXJGb250U2l6ZSIsImxlZ2FjeUJyb3dzZXJzIiwicmVtb3ZlQ29tbWVudHMiLCJmb250U2l6ZXMiLCJ0b0xvd2VyQ2FzZUtleXMiLCJiYWNrU2V0dGluZ3MiLCJzZXR0aW5nc1JlZ2V4cCIsImN1cnJlbnRGb250U2l6ZXMiLCJyaHl0aG0iLCJpbWFnZSIsImV4dGVuZE5vZGVzIiwiaW5pdFNldHRpbmdzIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJ0b0xvd2VyQ2FzZSIsIlBYIiwiTWF0aCIsInJvdW5kIiwiVlciLCJ2aWV3Iiwic3BsaXQiLCJmcm9tIiwidG8iLCJ2aWV3RGlmZiIsImFkZEZvbnRTaXplcyIsInNldHRpbmdzS2V5cyIsIk9iamVjdCIsImtleXMiLCJqb2luIiwic2V0dGluZ3NLZXlzU3RyaW5nIiwiUmVnRXhwIiwid2Fsa0F0UnVsZSIsIm5hbWUiLCJwYXJhbXMiLCJyZW1vdmUiLCJwcm9wZXJ0eSIsImRlY2xzIiwiaWRlY2xzIiwicGFyc2UiLCJwYXJlbnQiLCJpbnNlcnRCZWZvcmUiLCJleHRlbmROYW1lIiwic2VsZWN0b3IiLCJwYXJlbnRzIiwicHJldiIsInNvdXJjZSIsImNvdW50IiwicHVzaCIsInJ1bGVzIiwiaW5zZXJ0QWZ0ZXIiLCJmb250U2l6ZURlY2wiLCJyZWxhdGl2ZVNpemUiLCJsaW5lSGVpZ2h0RGVjbCIsImh0bWxSdWxlIiwiYXBwZW5kIiwiYXN0ZXJpc2tIdG1sUnVsZSIsImNsb25lIiwiUkVNIiwic3ZnIiwiZ3RoaWNrbmVzcyIsImJhY2tncm91bmQiLCJpbWFnZUhlaWdodCIsInBhdHRlcm4iLCJydWxlck1hdHJpeCIsImdldEZpbGUiLCJsZW5ndGgiLCJnZXRCYXNlNjQiLCJpY29uU2l6ZSIsInN0eWxlIiwicnVsZXJDbGFzcyIsImNvbG9yIiwiaG92ZXJDb2xvciIsInJ1bGVyUnVsZSIsImVzY2FwZSIsIndhbGsiLCJjaGlsZCIsInR5cGUiLCJub2RlIiwicnVsZUZvbnRTaXplIiwiZm91bmQiLCJmaW5kUnVsZUZvbnRTaXplIiwiZnNkZWNsIiwibWF0Y2giLCJ2YXJpYWJsZSIsInNpemVVbml0Iiwic2l6ZSIsImdldFNpemUiLCJyZWwiLCJweCIsImxpbmVzIiwiYmFzZUZvbnRTaXplIiwiZm9udFNpemVVbml0IiwiY29udmVydCIsInBhcmFtZXRlcnMiLCJpIiwiYmFzZSIsInJ2YWx1ZSIsImxlYWRpbmciLCJpblZhbHVlIiwib3V0cHV0VW5pdCIsImNzcyIsImNvcHlQYXN0ZU5vZGUiLCJ3YWxrQXRSdWxlcyIsIm5vZGVzIiwibGVuIl0sIm1hcHBpbmdzIjoiOzs7O0FBWUE7Ozs7QUFFQTs7QUFjQTs7OztBQUVBOzs7O0FBR0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7QUFDQTs7QUFFQSxJQUFNQSxVQUFVOztBQUVaQyxXQUFPLGFBQUdDLFlBQUgsQ0FBZ0IsZUFBS0MsT0FBTCxDQUFhQyxTQUFiLEVBQXdCLHNCQUF4QixDQUFoQixFQUFpRSxNQUFqRSxDQUZLOztBQUlaQyxlQUFXLGFBQUdILFlBQUgsQ0FBZ0IsZUFBS0MsT0FBTCxDQUFhQyxTQUFiLEVBQXdCLDBCQUF4QixDQUFoQixFQUFxRSxNQUFyRSxDQUpDOztBQU1aRSxjQUFVLGFBQUdKLFlBQUgsQ0FBZ0IsZUFBS0MsT0FBTCxDQUFhQyxTQUFiLEVBQXdCLHlCQUF4QixDQUFoQixFQUFvRSxNQUFwRSxDQU5FOztBQVFaRyxpSEFSWTs7QUFlWkMsWUFBUSw0QkFmSTs7QUFpQlpDLHNIQWpCWTs7QUFzQlpDLG1FQXRCWTs7QUF5QlpDLDZEQXpCWTs7QUE0QlpDLGVBQVc7QUFBWDtBQTVCWSxDQUFoQjs7QUFrQ0E7O0FBMUNBOztBQS9CQTs7Ozs7Ozs7Ozs7O0FBMEVBLElBQU1DLGlCQUFpQixxQ0FBdkI7O0FBRUE7QUFDQSxJQUFNQyxlQUFlLHFGQUFyQjs7QUFFQTtBQUNBLElBQU1DLG1CQUFtQixTQUF6Qjs7QUFFQTtBQUNBLElBQU1DLG1CQUFtQixLQUF6Qjs7QUFFQTs7Ozs7Ozs7QUFRQSxTQUFTQyxPQUFULENBQWlCQyxDQUFqQixFQUFvQkMsQ0FBcEIsRUFBdUJDLEtBQXZCLEVBQStDO0FBQUEsUUFBakJDLFFBQWlCLHVFQUFOLEtBQU07O0FBQzNDLFFBQUlDLE1BQU9ILE1BQU0sQ0FBUCxHQUNKLDBCQUFZRCxJQUFJRSxLQUFoQixJQUF5QixJQURyQixHQUVIRCxJQUFJLENBQUwsR0FDSSwwQkFBWUQsSUFBSUUsS0FBaEIsSUFDSSxPQURKLEdBQ2MsMEJBQVlELElBQUlDLEtBQWhCLENBRGQsR0FDdUMsSUFGM0MsR0FHSSwwQkFBWUYsSUFBSUUsS0FBaEIsSUFDSSxLQURKLEdBQ1ksMEJBQVlELElBQUlDLEtBQWhCLEVBQXVCRyxPQUF2QixDQUErQixHQUEvQixFQUFvQyxJQUFwQyxDQURaLEdBQ3dELElBTmxFO0FBT0EsV0FBUUYsUUFBRCxHQUFhLFdBQVdDLEdBQVgsR0FBaUIsU0FBOUIsR0FBeUMsVUFBVUEsR0FBVixHQUFnQixHQUFoRTtBQUNIO0FBQ0Q7Ozs7O0FBS0EsU0FBU0UsV0FBVCxDQUFxQkMsSUFBckIsRUFBMkJDLFFBQTNCLEVBQXFDOztBQUVqQ0QsU0FBS0UsU0FBTCxDQUFlLGdCQUFROztBQUVuQixZQUFJQyxPQUFPLDBCQUFZQyxLQUFLRCxJQUFqQixDQUFYO0FBQ0EsWUFBSSxzQkFBUUEsSUFBUixFQUFjLGFBQWQsS0FBZ0Msc0JBQVFBLElBQVIsRUFBYyxZQUFkLENBQWhDLElBQStELHNCQUFRQSxJQUFSLEVBQWMsWUFBZCxDQUEvRCxJQUNBLHNCQUFRQSxJQUFSLEVBQWMsaUJBQWQsQ0FEQSxJQUNvQyxzQkFBUUEsSUFBUixFQUFjLE9BQWQsQ0FEcEMsSUFFQSxzQkFBUUEsSUFBUixFQUFjLGdCQUFkLENBRkEsSUFFbUMsc0JBQVFBLElBQVIsRUFBYyxnQkFBZCxDQUZ2QyxFQUV3RTs7QUFFcEVGLHFCQUFTRSxJQUFULElBQWlCLHFCQUFPQyxLQUFLVCxLQUFaLEVBQW1CLE1BQW5CLENBQWpCO0FBRUgsU0FORCxNQU1PLElBQUksc0JBQVFRLElBQVIsRUFBYyxNQUFkLENBQUosRUFBMkI7O0FBRTlCRixxQkFBU0ksSUFBVCxHQUFnQixzQkFBUUQsS0FBS1QsS0FBYixDQUFoQjtBQUVILFNBSk0sTUFJQSxJQUFJLHNCQUFRUSxJQUFSLEVBQWMsWUFBZCxLQUErQixzQkFBUUEsSUFBUixFQUFjLGNBQWQsQ0FBbkMsRUFBa0U7O0FBRXJFRixxQkFBU0UsSUFBVCxJQUFpQkcsV0FBV0YsS0FBS1QsS0FBaEIsQ0FBakI7QUFFSCxTQUpNLE1BSUEsSUFBSSxzQkFBUVEsSUFBUixFQUFjLFVBQWQsS0FBNkIsc0JBQVFBLElBQVIsRUFBYyxZQUFkLENBQTdCLElBQTRELHNCQUFRQSxJQUFSLEVBQWMsZ0JBQWQsQ0FBNUQsSUFDUCxzQkFBUUEsSUFBUixFQUFjLGdCQUFkLENBRE8sSUFDNEIsc0JBQVFBLElBQVIsRUFBYyxZQUFkLENBRDVCLElBRVAsc0JBQVFBLElBQVIsRUFBYyxpQkFBZCxDQUZHLEVBRStCOztBQUVsQ0YscUJBQVNFLElBQVQsSUFBaUJJLFNBQVNILEtBQUtULEtBQWQsQ0FBakI7QUFFSCxTQU5NLE1BTUE7O0FBRUhNLHFCQUFTRSxJQUFULElBQWlCQyxLQUFLVCxLQUF0QjtBQUVIO0FBRUosS0E3QkQ7QUErQkg7O0FBRUQsU0FBU2EsT0FBVCxDQUFpQkMsT0FBakIsRUFBMEI7O0FBRXRCO0FBQ0EsUUFBSUMsaUJBQWlCOztBQUVqQkMsa0JBQVUsRUFGTztBQUdqQkMsb0JBQVksQ0FISztBQUlqQkMsbUJBQVcsQ0FKTTtBQUtqQkMsbUJBQVcsQ0FMTTs7QUFPakJDLG9CQUFZLEdBUEs7QUFRakJDLHVCQUFlLENBUkU7QUFTakJDLHNCQUFjLENBVEc7QUFVakJDLHFCQUFhLENBVkk7QUFXakJDLHFCQUFhLENBWEk7QUFZakJDLHNCQUFjLENBWkc7QUFhakJDLHdCQUFnQixDQWJDO0FBY2pCQyx5QkFBaUIsQ0FkQTs7QUFnQmpCQyxrQkFBVSxJQWhCTzs7QUFrQmpCbEIsY0FBTSxjQUFLbUIsRUFsQk07O0FBb0JqQkMsb0JBQVksS0FwQks7QUFxQmpCQyxxQkFBYSxJQXJCSTtBQXNCakJDLG9CQUFZLEtBdEJLO0FBdUJqQkMsbUJBQVcsTUF2Qk07O0FBeUJqQkMsb0JBQVksUUF6Qks7O0FBMkJqQkMsd0JBQWdCLENBM0JDO0FBNEJqQkMseUJBQWlCLEtBNUJBOztBQThCakJDLGVBQU8sSUE5QlU7QUErQmpCQyxvQkFBWSxvQkEvQks7QUFnQ2pCQywyQkFBbUIsa0RBaENGO0FBaUNqQkMseUJBQWlCLGlCQWpDQTtBQWtDakJDLHVCQUFlLFlBbENFO0FBbUNqQkMsb0JBQVksd0JBbkNLO0FBb0NqQkMsd0JBQWdCLENBcENDO0FBcUNqQkMseUJBQWlCLFVBckNBO0FBc0NqQkMscUJBQWEsUUF0Q0k7QUF1Q2pCQyxzQkFBYyxTQXZDRztBQXdDakJDLG9CQUFZLENBeENLOztBQTBDakJDLHlCQUFpQixFQTFDQTtBQTJDakJDLHdCQUFnQixJQTNDQztBQTRDakJDLHdCQUFnQixLQTVDQztBQTZDakJDLG1CQUFXO0FBN0NNLEtBQXJCOztBQWdEQTtBQUNBLFFBQUlDLGtCQUFrQixDQUNsQixNQURrQixFQUVsQixXQUZrQixFQUdsQixZQUhrQixFQUlsQixZQUprQixFQUtsQixpQkFMa0IsRUFNbEIsYUFOa0IsQ0FBdEI7O0FBVUEsUUFBTUMsZUFBZSxxQkFBTyxFQUFQLEVBQVd0QyxjQUFYLENBQXJCO0FBQ0E7QUFDQSxRQUFJVCxXQUFXLEVBQWY7QUFDQSxRQUFHUSxPQUFILEVBQVc7QUFDUCw2QkFBT0MsY0FBUCxFQUF1QkQsT0FBdkIsRUFBZ0MsS0FBaEM7QUFDSDtBQUNELFFBQUl3Qyx1QkFBSjtBQUNBO0FBQ0EsUUFBSUMsbUJBQW1CLElBQXZCO0FBQ0E7QUFDQSxRQUFJSixrQkFBSjtBQUNBO0FBQ0EsUUFBSUssZUFBSjtBQUNBO0FBQ0E7QUFDQSxRQUFNQyxRQUFRLHdCQUFkO0FBQ0E7QUFDQSxRQUFJQyxjQUFjLEVBQWxCOztBQUVBOzs7QUFHQSxRQUFNQyxlQUFlLFNBQWZBLFlBQWUsR0FBTTtBQUN2QkosMkJBQW1CLElBQW5CO0FBQ0E7QUFDQSxZQUFJeEMsZUFBZW9DLFNBQW5CLEVBQThCO0FBQzFCSSwrQkFBbUJ4QyxlQUFlb0MsU0FBbEM7QUFDSDs7QUFFRCxZQUFJN0MsU0FBUzZDLFNBQWIsRUFBd0I7QUFDcEJJLCtCQUFvQkEsZ0JBQUQsR0FDYkEsbUJBQW1CLElBQW5CLEdBQTBCakQsU0FBUzZDLFNBRHRCLEdBRWI3QyxTQUFTNkMsU0FGZjtBQUdIOztBQUVEO0FBQ0EsYUFBSyxJQUFJUyxHQUFULElBQWdCUixlQUFoQixFQUFpQztBQUM3QixnQkFBSTlDLFNBQVN1RCxjQUFULENBQXdCRCxHQUF4QixDQUFKLEVBQWtDO0FBQzlCdEQseUJBQVNzRCxHQUFULElBQWdCdEQsU0FBU3NELEdBQVQsRUFBY0UsV0FBZCxFQUFoQjtBQUNIO0FBQ0o7O0FBRUQ7QUFDQXhELGlCQUFTZSxhQUFULEdBQXlCZixTQUFTYyxVQUFULEdBQXNCZCxTQUFTVSxRQUEvQixHQUNuQlYsU0FBU2MsVUFBVCxHQUFzQmQsU0FBU1UsUUFEWixHQUN1QlYsU0FBU2MsVUFEekQ7O0FBR0E7QUFDQWQsaUJBQVNnQixZQUFULEdBQXdCaEIsU0FBU2MsVUFBVCxHQUFzQmQsU0FBU1UsUUFBL0IsR0FDbEJWLFNBQVNjLFVBRFMsR0FFakJkLFNBQVNjLFVBQVQsR0FBc0JkLFNBQVNVLFFBRnRDO0FBR0EsWUFBR1YsU0FBU0ksSUFBVCxLQUFrQixjQUFLcUQsRUFBdkIsSUFBNkJ6RCxTQUFTd0IsVUFBekMsRUFBcUQ7QUFDakR4QixxQkFBU2dCLFlBQVQsR0FBd0IwQyxLQUFLQyxLQUFMLENBQVczRCxTQUFTZ0IsWUFBcEIsQ0FBeEI7QUFDSDs7QUFFRCxZQUFHaEIsU0FBU0ksSUFBVCxLQUFrQixjQUFLd0QsRUFBMUIsRUFBNkI7O0FBRXpCLGdCQUFJQyxPQUFPN0QsU0FBU3NCLFFBQVQsQ0FBa0J3QyxLQUFsQixDQUF3QnhFLGdCQUF4QixDQUFYO0FBQ0EsZ0JBQUl5RSxPQUFPMUQsV0FBV3dELEtBQUssQ0FBTCxDQUFYLENBQVg7QUFDQSxnQkFBSUcsS0FBSzNELFdBQVd3RCxLQUFLLENBQUwsQ0FBWCxDQUFUOztBQUVBLGdCQUFJSSxXQUFXRCxLQUFLRCxJQUFwQjtBQUNBL0QscUJBQVNZLFNBQVQsR0FBcUIsQ0FBQ1osU0FBU1csVUFBVCxHQUFzQlgsU0FBU1UsUUFBaEMsSUFBNEN1RCxRQUFqRTtBQUNBakUscUJBQVNhLFNBQVQsR0FBcUJiLFNBQVNVLFFBQVQsR0FBb0JWLFNBQVNZLFNBQVQsR0FBcUJtRCxJQUE5RDtBQUNBL0QscUJBQVNZLFNBQVQsR0FBcUJaLFNBQVNZLFNBQVQsR0FBcUIsR0FBMUM7O0FBRUE7QUFDQVoscUJBQVNxQixlQUFULEdBQTJCckIsU0FBU21CLFlBQVQsR0FBd0JuQixTQUFTVyxVQUFqQyxHQUNyQlgsU0FBU21CLFlBQVQsR0FBd0JuQixTQUFTVyxVQURaLEdBQ3lCWCxTQUFTbUIsWUFEN0Q7O0FBR0E7QUFDQW5CLHFCQUFTb0IsY0FBVCxHQUEwQnBCLFNBQVNtQixZQUFULEdBQXdCbkIsU0FBU1csVUFBakMsR0FDcEJYLFNBQVNtQixZQURXLEdBRW5CbkIsU0FBU21CLFlBQVQsR0FBd0JuQixTQUFTVyxVQUZ4Qzs7QUFJQVgscUJBQVNpQixXQUFULEdBQXVCLENBQUNqQixTQUFTb0IsY0FBVCxHQUEwQnBCLFNBQVNnQixZQUFwQyxJQUFvRGlELFFBQTNFO0FBQ0FqRSxxQkFBU2tCLFdBQVQsR0FBdUJsQixTQUFTZ0IsWUFBVCxHQUF3QmhCLFNBQVNpQixXQUFULEdBQXVCOEMsSUFBdEU7QUFDQS9ELHFCQUFTaUIsV0FBVCxHQUF1QmpCLFNBQVNpQixXQUFULEdBQXVCLEdBQTlDO0FBRUg7O0FBRUQ0QixvQkFBWSx3QkFBYzdDLFFBQWQsQ0FBWjtBQUNBa0QsaUJBQVMsNkJBQW1CbEQsUUFBbkIsQ0FBVDtBQUNBLFlBQUlpRCxnQkFBSixFQUFzQjtBQUNsQkosc0JBQVVxQixZQUFWLENBQXVCakIsZ0JBQXZCLEVBQXlDQyxNQUF6QztBQUNIO0FBQ0QsWUFBSWlCLGVBQWVDLE9BQU9DLElBQVAsQ0FBWXJFLFFBQVosRUFBc0JzRSxJQUF0QixDQUEyQixHQUEzQixDQUFuQjtBQUNBO0FBQ0EsWUFBSUMscUJBQXFCLDBCQUFZSixZQUFaLEVBQTBCTCxLQUExQixDQUFnQyxHQUFoQyxFQUFxQ1EsSUFBckMsQ0FBMEMsS0FBMUMsQ0FBekI7QUFDQXRCLHlCQUFpQixJQUFJd0IsTUFBSixDQUFXLFNBQVNELGtCQUFULEdBQThCLEdBQXpDLEVBQThDLEdBQTlDLENBQWpCO0FBQ0gsS0FuRUQ7O0FBcUVBLFFBQU1FLGFBQWEsU0FBYkEsVUFBYSxDQUFDMUUsSUFBRCxFQUFVOztBQUV6QixZQUFJLHFCQUFPQSxLQUFLMkUsSUFBWixFQUFrQixTQUFsQixDQUFKLEVBQWtDOztBQUU5QixnQkFBSSxxQkFBTzNFLEtBQUs0RSxNQUFaLEVBQW9CLE9BQXBCLENBQUosRUFBa0M7O0FBRTlCbEUsaUNBQWlCLHFCQUFPLEVBQVAsRUFBV3NDLFlBQVgsQ0FBakI7QUFFSCxhQUpELE1BSU8sSUFBSSxDQUFDLHFCQUFPaEQsS0FBSzRFLE1BQVosRUFBb0IsS0FBcEIsQ0FBTCxFQUFpQzs7QUFFcEM3RSw0QkFBWUMsSUFBWixFQUFrQlUsY0FBbEI7QUFFSDtBQUNEO0FBQ0FULHVCQUFXLHFCQUFPLEVBQVAsRUFBV1MsY0FBWCxDQUFYOztBQUVBO0FBQ0E0Qzs7QUFFQTtBQUNBdEQsaUJBQUs2RSxNQUFMO0FBRUgsU0FwQkQsTUFvQk8sSUFBSSxxQkFBTzdFLEtBQUsyRSxJQUFaLEVBQWtCLFVBQWxCLEtBQWlDLHFCQUFPM0UsS0FBSzJFLElBQVosRUFBa0IsVUFBbEIsQ0FBckMsRUFBb0U7O0FBRXZFNUUsd0JBQVlDLElBQVosRUFBa0JDLFFBQWxCOztBQUVBO0FBQ0FxRDs7QUFFQXRELGlCQUFLNkUsTUFBTDtBQUVILFNBVE0sTUFTQSxJQUFJLHFCQUFPN0UsS0FBSzJFLElBQVosRUFBa0IsVUFBbEIsS0FBaUMscUJBQU8zRSxLQUFLMkUsSUFBWixFQUFrQixRQUFsQixDQUFqQyxJQUNQLHFCQUFPM0UsS0FBSzJFLElBQVosRUFBa0IsV0FBbEIsQ0FETyxJQUMyQixxQkFBTzNFLEtBQUsyRSxJQUFaLEVBQWtCLFNBQWxCLENBRDNCLElBQzJELHFCQUFPM0UsS0FBSzJFLElBQVosRUFBa0IsWUFBbEIsQ0FEL0QsRUFDZ0c7O0FBRW5HLGdCQUFJRyxXQUFXLDBCQUFZOUUsS0FBSzJFLElBQWpCLENBQWY7O0FBRUEsZ0JBQUlJLFFBQVF4RyxRQUFRdUcsUUFBUixDQUFaOztBQUVBLGdCQUFJLHFCQUFPQSxRQUFQLEVBQWlCLFNBQWpCLEtBQStCLHFCQUFPOUUsS0FBSzRFLE1BQVosRUFBb0IsTUFBcEIsQ0FBbkMsRUFBZ0U7QUFDNURHLHdCQUFReEcsUUFBUVksU0FBUixHQUFvQjRGLEtBQTVCO0FBQ0gsYUFGRCxNQUVPLElBQUkscUJBQU9ELFFBQVAsRUFBaUIsVUFBakIsS0FBZ0MscUJBQU85RSxLQUFLNEUsTUFBWixFQUFvQixNQUFwQixDQUFwQyxFQUFpRTtBQUNwRUcsd0JBQVF4RyxRQUFRUSxNQUFSLEdBQWlCZ0csS0FBekI7QUFDSDs7QUFFRCxnQkFBSSxxQkFBTzlFLFNBQVM0QixVQUFoQixFQUE0QixRQUE1QixDQUFKLEVBQTJDOztBQUV2QyxvQkFBSW1ELFNBQVMsa0JBQVFDLEtBQVIsQ0FBY0YsS0FBZCxDQUFiO0FBQ0EvRSxxQkFBS2tGLE1BQUwsQ0FBWUMsWUFBWixDQUF5Qm5GLElBQXpCLEVBQStCZ0YsTUFBL0I7QUFFSCxhQUxELE1BS087O0FBRUgsb0JBQUlJLGFBQWEsMEJBQVlOLFdBQVc5RSxLQUFLNEUsTUFBNUIsQ0FBakI7O0FBRUEsb0JBQUksQ0FBQ3ZCLFlBQVlHLGNBQVosQ0FBMkI0QixVQUEzQixDQUFMLEVBQTZDOztBQUV6QztBQUNBL0IsZ0NBQVkrQixVQUFaLElBQTBCO0FBQ3RCQyxrQ0FBVXJGLEtBQUtrRixNQUFMLENBQVlHLFFBREE7QUFFdEJOLCtCQUFPQSxLQUZlO0FBR3RCTyxpQ0FBUyxDQUFDdEYsS0FBS2tGLE1BQU4sQ0FIYTtBQUl0QkssOEJBQU12RixLQUFLdUYsSUFBTCxFQUpnQjtBQUt0QkMsZ0NBQVF4RixLQUFLd0YsTUFMUztBQU10QkMsK0JBQU87QUFOZSxxQkFBMUI7QUFTSCxpQkFaRCxNQVlPOztBQUVIO0FBQ0FwQyxnQ0FBWStCLFVBQVosRUFBd0JDLFFBQXhCLEdBQW1DaEMsWUFBWStCLFVBQVosRUFBd0JDLFFBQXhCLEdBQW1DLElBQW5DLEdBQTBDckYsS0FBS2tGLE1BQUwsQ0FBWUcsUUFBekY7QUFDQWhDLGdDQUFZK0IsVUFBWixFQUF3QkUsT0FBeEIsQ0FBZ0NJLElBQWhDLENBQXFDMUYsS0FBS2tGLE1BQTFDO0FBQ0E3QixnQ0FBWStCLFVBQVosRUFBd0JLLEtBQXhCO0FBRUg7QUFDSjs7QUFFRHpGLGlCQUFLNkUsTUFBTDtBQUVILFNBOUNNLE1BOENBLElBQUkscUJBQU83RSxLQUFLMkUsSUFBWixFQUFrQixPQUFsQixLQUE4QixxQkFBTzNFLEtBQUsyRSxJQUFaLEVBQWtCLFdBQWxCLENBQTlCLElBQ0oscUJBQU8zRSxLQUFLMkUsSUFBWixFQUFrQixVQUFsQixDQURJLElBQzZCLHFCQUFPM0UsS0FBSzJFLElBQVosRUFBa0Isa0JBQWxCLENBRGpDLEVBQ3dFOztBQUUzRSxnQkFBSUcsWUFBVywwQkFBWTlFLEtBQUsyRSxJQUFqQixDQUFmO0FBQ0EsZ0JBQUlnQixRQUFRLGtCQUFRVixLQUFSLENBQWMxRyxRQUFRdUcsU0FBUixDQUFkLENBQVo7QUFDQWEsa0JBQU1ILE1BQU4sR0FBZXhGLEtBQUt3RixNQUFwQjtBQUNBeEYsaUJBQUtrRixNQUFMLENBQVlVLFdBQVosQ0FBd0I1RixJQUF4QixFQUE4QjJGLEtBQTlCO0FBQ0EzRixpQkFBSzZFLE1BQUw7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0MsU0FoQk0sTUFnQkEsSUFBSSxxQkFBTzdFLEtBQUsyRSxJQUFaLEVBQWtCLFVBQWxCLENBQUosRUFBbUM7O0FBRXRDLGdCQUFJNUQsYUFBYW9DLE9BQU9wQyxVQUFQLENBQWtCZCxTQUFTVSxRQUFULEdBQW9CLElBQXRDLENBQWpCOztBQUVBO0FBQ0EsZ0JBQUlrRixxQkFBSjs7QUFFQSxnQkFBSTVGLFNBQVMwQixVQUFULElBQXdCMUIsU0FBU0ksSUFBVCxLQUFrQixjQUFLcUQsRUFBdkIsSUFBNkIsQ0FBQ3pELFNBQVMyQyxjQUFuRSxFQUFvRjs7QUFFaEZpRCwrQkFBZSxrQkFBUXpGLElBQVIsQ0FBYTtBQUN4QkQsMEJBQU0sV0FEa0I7QUFFeEJSLDJCQUFPTSxTQUFTVSxRQUFULEdBQW9CLElBRkg7QUFHeEI2RSw0QkFBUXhGLEtBQUt3RjtBQUhXLGlCQUFiLENBQWY7QUFNSCxhQVJELE1BUU87O0FBRUgsb0JBQUlNLGVBQWUsTUFBTTdGLFNBQVNVLFFBQWYsR0FBMEJWLFNBQVMwQyxlQUF0RDs7QUFFQWtELCtCQUFlLGtCQUFRekYsSUFBUixDQUFhO0FBQ3hCRCwwQkFBTSxXQURrQjtBQUV4QlIsMkJBQU8sMEJBQVltRyxZQUFaLElBQTRCLEdBRlg7QUFHeEJOLDRCQUFReEYsS0FBS3dGO0FBSFcsaUJBQWIsQ0FBZjtBQU1IOztBQUVELGdCQUFJTyxpQkFBaUIsa0JBQVEzRixJQUFSLENBQWE7QUFDOUJELHNCQUFNLGFBRHdCO0FBRTlCUix1QkFBT29CLFVBRnVCO0FBRzlCeUUsd0JBQVF4RixLQUFLd0Y7QUFIaUIsYUFBYixDQUFyQjs7QUFPQSxnQkFBSSxxQkFBT3hGLEtBQUs0RSxNQUFaLEVBQW9CLE1BQXBCLENBQUosRUFBaUM7O0FBRTdCLG9CQUFJb0IsV0FBVyxrQkFBUWhHLElBQVIsQ0FBYTtBQUN4QnFGLDhCQUFVLE1BRGM7QUFFeEJHLDRCQUFReEYsS0FBS3dGO0FBRlcsaUJBQWIsQ0FBZjs7QUFLQVEseUJBQVNDLE1BQVQsQ0FBZ0JKLFlBQWhCO0FBQ0FHLHlCQUFTQyxNQUFULENBQWdCRixjQUFoQjs7QUFFQS9GLHFCQUFLa0YsTUFBTCxDQUFZVSxXQUFaLENBQXdCNUYsSUFBeEIsRUFBOEJnRyxRQUE5Qjs7QUFFQSxvQkFBSS9GLFNBQVNJLElBQVQsS0FBa0IsY0FBS3FELEVBQXZCLElBQTZCekQsU0FBUzJDLGNBQTFDLEVBQTBEO0FBQ3RELHdCQUFJc0QsbUJBQW1CLGtCQUFRbEcsSUFBUixDQUFhO0FBQ2hDcUYsa0NBQVUsUUFEc0I7QUFFaENHLGdDQUFReEYsS0FBS3dGO0FBRm1CLHFCQUFiLENBQXZCO0FBSUFVLHFDQUFpQkQsTUFBakIsQ0FBd0JGLGVBQWVJLEtBQWYsRUFBeEI7QUFDQW5HLHlCQUFLa0YsTUFBTCxDQUFZVSxXQUFaLENBQXdCNUYsSUFBeEIsRUFBOEJrRyxnQkFBOUI7QUFDSDtBQUVKLGFBckJELE1BcUJPOztBQUVIbEcscUJBQUtrRixNQUFMLENBQVlVLFdBQVosQ0FBd0I1RixJQUF4QixFQUE4QitGLGNBQTlCO0FBQ0EvRixxQkFBS2tGLE1BQUwsQ0FBWVUsV0FBWixDQUF3QjVGLElBQXhCLEVBQThCNkYsWUFBOUI7O0FBRUEsb0JBQUk1RixTQUFTSSxJQUFULEtBQWtCLGNBQUsrRixHQUF2QixJQUE4Qm5HLFNBQVN5QixXQUEzQyxFQUF3RDs7QUFFcEQxQix5QkFBS2tGLE1BQUwsQ0FBWUMsWUFBWixDQUF5QlksY0FBekIsRUFBeUMsa0JBQVEzRixJQUFSLENBQWE7QUFDbERELDhCQUFNLGFBRDRDO0FBRWxEUiwrQkFBT3dELE9BQU96QixXQUFQLENBQW1CWCxVQUFuQixDQUYyQztBQUdsRHlFLGdDQUFReEYsS0FBS3dGO0FBSHFDLHFCQUFiLENBQXpDO0FBTUg7QUFDSjs7QUFFRHhGLGlCQUFLNkUsTUFBTDtBQUVILFNBekVNLE1BeUVBLElBQUkscUJBQU83RSxLQUFLMkUsSUFBWixFQUFrQixPQUFsQixDQUFKLEVBQWdDOztBQUVuQyxnQkFBSXpDLG9CQUFvQmpDLFNBQVNpQyxpQkFBVCxDQUEyQnBDLE9BQTNCLENBQW1DLE9BQW5DLEVBQTRDLEVBQTVDLENBQXhCOztBQUVBLGdCQUFJdUcsTUFBTSx3aERBQVY7QUFDQTs7QUFFQSxnQkFBSUMsYUFBYXJHLFNBQVNxQyxjQUExQjs7QUFFQSxnQkFBSWlFLGFBQWEsRUFBakI7O0FBRUEsZ0JBQUkscUJBQU90RyxTQUFTc0MsZUFBaEIsRUFBaUMsS0FBakMsQ0FBSixFQUE2Qzs7QUFFekMsb0JBQUlpRSxjQUFjdkcsU0FBU2MsVUFBVCxJQUF1QmQsU0FBU1UsUUFBaEMsR0FDZFYsU0FBU2MsVUFESyxHQUVkNEMsS0FBS0MsS0FBTCxDQUFZM0QsU0FBU2MsVUFBVCxHQUFzQmQsU0FBU1UsUUFBM0MsQ0FGSjs7QUFJQSxvQkFBSThGLFVBQVV4RyxTQUFTd0MsWUFBVCxDQUFzQnNCLEtBQXRCLENBQTRCeEUsZ0JBQTVCLENBQWQ7O0FBRUE2RCxzQkFBTXNELFdBQU4sQ0FBa0JGLFdBQWxCLEVBQStCdkcsU0FBU29DLFVBQXhDLEVBQW9Eb0UsT0FBcEQsRUFBNkR4RyxTQUFTcUMsY0FBdEUsRUFBc0ZyQyxTQUFTeUMsVUFBL0Y7O0FBRUEsb0JBQUksQ0FBQyxxQkFBT3pDLFNBQVN1QyxXQUFoQixFQUE2QixRQUE3QixDQUFMLEVBQTZDO0FBQ3pDWSwwQkFBTXVELE9BQU4sQ0FBYzFHLFNBQVN1QyxXQUF2QjtBQUNBK0QsaUNBQWEsb0NBQW9DdEcsU0FBU3VDLFdBQTdDLEdBQTJELE1BQTNELEdBQ1Qsb0NBRFMsR0FFVCxnQ0FGUyxHQUdULHVCQUhTLEdBR2lCaUUsUUFBUUcsTUFIekIsR0FHa0MsS0FIbEMsR0FHMENKLFdBSDFDLEdBR3dELEtBSHJFO0FBS0gsaUJBUEQsTUFPTztBQUNIRCxpQ0FBYSx1REFBdURuRCxNQUFNeUQsU0FBTixFQUF2RCxHQUEyRSxNQUEzRSxHQUNULG9DQURTLEdBRVQsZ0NBRlMsR0FHVCx1QkFIUyxHQUdpQkosUUFBUUcsTUFIekIsR0FHa0MsS0FIbEMsR0FHMENKLFdBSDFDLEdBR3dELEtBSHJFO0FBS0g7QUFFSixhQXpCRCxNQXlCTzs7QUFFSEYsNkJBQWFBLGFBQWEsQ0FBMUI7QUFDQSxvQkFBSXZGLGNBQWNkLFNBQVNJLElBQVQsS0FBa0IsY0FBS3dELEVBQXhCLEdBQ1hyRSxRQUFRUyxTQUFTaUIsV0FBakIsRUFBOEJqQixTQUFTa0IsV0FBdkMsRUFBb0QsQ0FBcEQsQ0FEVyxHQUVWbEIsU0FBU2MsVUFBVCxJQUF1QmQsU0FBU1UsUUFBakMsR0FDSVYsU0FBU2MsVUFBVCxHQUFzQixrQkFBUyxjQUFLMkMsRUFBZCxDQUQxQixHQUVJekQsU0FBU2MsVUFBVCxHQUFzQixrQkFBU2QsU0FBU0ksSUFBbEIsQ0FKaEM7O0FBTUFrRyw2QkFBYSxtREFDVHRHLFNBQVNvQyxVQURBLEdBQ2EsR0FEYixHQUNtQmlFLFVBRG5CLEdBQ2dDLGlCQURoQyxHQUVUQSxVQUZTLEdBRUksS0FGSixHQUdULDRCQUhTLEdBR3NCdkYsV0FIdEIsR0FHbUMsR0FIaEQ7QUFJSDs7QUFFRCxnQkFBSWlCLFFBQVEsNEpBUXNCdUUsVUFSbEM7O0FBVUEsZ0JBQUlPLFdBQVc3RyxTQUFTbUMsYUFBeEI7O0FBN0RtQyx3Q0ErRFRuQyxTQUFTZ0MsVUFBVCxDQUFvQjhCLEtBQXBCLENBQTBCeEUsZ0JBQTFCLENBL0RTO0FBQUEsZ0JBK0Q5QndILEtBL0Q4QjtBQUFBLGdCQStEdkJDLFVBL0R1Qjs7QUFBQSx3Q0FnRVQvRyxTQUFTa0MsZUFBVCxDQUF5QjRCLEtBQXpCLENBQStCeEUsZ0JBQS9CLENBaEVTO0FBQUEsZ0JBZ0U5QjBILEtBaEU4QjtBQUFBLGdCQWdFdkJDLFVBaEV1Qjs7QUFrRW5DLGdCQUFJQyxZQUFZLElBQWhCOztBQUVBLGdCQUFJLHFCQUFPSixLQUFQLEVBQWMsUUFBZCxDQUFKLEVBQTZCOztBQUV6QkksNEJBQVksa0JBQVFsQyxLQUFSLENBQWMsUUFBUStCLFVBQVIsR0FBcUIsR0FBckIsR0FDdEIsb0JBRHNCLEdBRXRCaEYsS0FGc0IsR0FHdEIsR0FIc0IsR0FJdEIsZUFKc0IsR0FJSmdGLFVBSkksR0FJUyxPQUpULEdBS3RCLG1CQUxzQixHQU10QixHQU5zQixHQU90QixlQVBzQixHQU9KQSxVQVBJLEdBT1MsZUFQVCxHQVF0QixvQkFSc0IsR0FTdEIsNEJBVHNCLEdBVXRCOUUsaUJBVnNCLEdBV3RCLGdCQVhzQixHQVl0QixpQkFac0IsR0FhdEIsYUFic0IsR0FhTjRFLFFBYk0sR0FhSyxHQWJMLEdBY3RCLGNBZHNCLEdBY0xBLFFBZEssR0FjTSxHQWROLEdBZXRCLHNCQWZzQixHQWdCdEIsOEJBaEJzQixHQWlCdEJULElBQUl2RyxPQUFKLENBQVksU0FBWixFQUF1QnNILE9BQU9ILEtBQVAsQ0FBdkIsQ0FqQnNCLEdBaUJrQixNQWpCbEIsR0FrQnRCLEdBbEJzQixHQW1CdEIsZUFuQnNCLEdBbUJKRCxVQW5CSSxHQW1CUyxrQ0FuQlQsR0FvQnRCQSxVQXBCc0IsR0FvQlQscUJBcEJTLEdBcUJ0Qiw4QkFyQnNCLEdBcUJXWCxJQUFJdkcsT0FBSixDQUFZLFNBQVosRUFBdUJzSCxPQUFPRixVQUFQLENBQXZCLENBckJYLEdBcUJ3RCxNQXJCeEQsR0FzQnRCLEdBdEJzQixHQXVCdEIsZUF2QnNCLEdBd0J0QkYsVUF4QnNCLEdBd0JULGlCQXhCUyxHQXdCV0EsVUF4QlgsR0F3QndCLEdBeEJ4QixHQXlCdEIscUJBekJzQixHQTBCdEIsR0ExQlEsQ0FBWjtBQTRCSCxhQTlCRCxNQThCTyxJQUFJLHFCQUFPRCxLQUFQLEVBQWMsT0FBZCxDQUFKLEVBQTRCOztBQUUvQkksNEJBQVksa0JBQVFsQyxLQUFSLENBQWMsUUFBUStCLFVBQVIsR0FBcUIsR0FBckIsR0FDdEI5RSxpQkFEc0IsR0FFdEIsZ0JBRnNCLEdBR3RCLGlCQUhzQixHQUl0QixhQUpzQixHQUlONEUsUUFKTSxHQUlLLEdBSkwsR0FLdEIsY0FMc0IsR0FLTEEsUUFMSyxHQUtNLEdBTE4sR0FNdEIsOEJBTnNCLEdBTVdULElBQUl2RyxPQUFKLENBQVksU0FBWixFQUF1QnNILE9BQU9ILEtBQVAsQ0FBdkIsQ0FOWCxHQU1tRCxNQU5uRCxHQU90QixvREFQc0IsR0FRdEIsR0FSc0IsR0FTdEIsR0FUc0IsR0FTaEJELFVBVGdCLEdBU0gsUUFURyxHQVNRLEdBVFIsR0FVdEIsc0JBVnNCLEdBVUdoRixLQVZILEdBV3RCLEdBWFEsQ0FBWjtBQWFILGFBZk0sTUFlQSxJQUFJLHFCQUFPK0UsS0FBUCxFQUFjLFFBQWQsQ0FBSixFQUE2Qjs7QUFFaENJLDRCQUFZLGtCQUFRbEMsS0FBUixDQUFjLFFBQVErQixVQUFSLEdBQXFCLEtBQXJCLEdBQTZCaEYsS0FBN0IsR0FBcUMsS0FBbkQsQ0FBWjtBQUVIOztBQUVELGdCQUFJbUYsU0FBSixFQUFlO0FBQ1hBLDBCQUFVM0IsTUFBVixHQUFtQnhGLEtBQUt3RixNQUF4QjtBQUNBdEYsMEJBQVVpSCxTQUFWO0FBQ0FuSCxxQkFBS2tGLE1BQUwsQ0FBWUMsWUFBWixDQUF5Qm5GLElBQXpCLEVBQStCbUgsU0FBL0I7QUFDSDs7QUFFRG5ILGlCQUFLNkUsTUFBTDtBQUNIO0FBQ0Q7QUFDQTdFLGFBQUtxSCxJQUFMLENBQVUsaUJBQVM7QUFDZixnQkFBRyxxQkFBT0MsTUFBTUMsSUFBYixFQUFtQixRQUFuQixDQUFILEVBQWdDO0FBQzVCN0MsMkJBQVc0QyxLQUFYO0FBQ0gsYUFGRCxNQUVPLElBQUkscUJBQU9BLE1BQU1DLElBQWIsRUFBbUIsTUFBbkIsQ0FBSixFQUFnQztBQUNuQztBQUNBckgsMEJBQVVvSCxLQUFWO0FBQ0g7QUFFSixTQVJEO0FBU0gsS0EvU0Q7O0FBaVRBLFFBQU1wSCxZQUFZLFNBQVpBLFNBQVksQ0FBQ3NILElBQUQsRUFBVTs7QUFFeEIsWUFBSUMscUJBQUo7O0FBRUFELGFBQUt0SCxTQUFMLENBQWUsZ0JBQVE7O0FBRW5CLGdCQUFJd0gsY0FBSjs7QUFFQSxnQkFBSUMsbUJBQW1CLFNBQW5CQSxnQkFBbUIsR0FBTTtBQUN6QixvQkFBSSxDQUFDRixZQUFMLEVBQW1CO0FBQ2ZySCx5QkFBSzhFLE1BQUwsQ0FBWWhGLFNBQVosQ0FBc0Isa0JBQVU7QUFDNUIsNEJBQUkscUJBQU8wSCxPQUFPekgsSUFBZCxFQUFvQixXQUFwQixDQUFKLEVBQXNDO0FBQ2xDc0gsMkNBQWVHLE9BQU9qSSxLQUF0QjtBQUNIO0FBQ0oscUJBSkQ7QUFLSDtBQUNKLGFBUkQ7O0FBVUEsZ0JBQUlTLEtBQUtULEtBQVQsRUFBZ0I7O0FBRVo7QUFDQSx1QkFBUStILFFBQVF0SCxLQUFLVCxLQUFMLENBQVdrSSxLQUFYLENBQWlCNUUsY0FBakIsQ0FBaEIsRUFBbUQ7QUFDL0Msd0JBQUk2RSxXQUFXLDBCQUFZSixNQUFNLENBQU4sQ0FBWixDQUFmO0FBQ0F0SCx5QkFBS1QsS0FBTCxHQUFhUyxLQUFLVCxLQUFMLENBQVdHLE9BQVgsQ0FBbUI0SCxNQUFNLENBQU4sQ0FBbkIsRUFBNkJ6SCxTQUFTNkgsUUFBVCxDQUE3QixDQUFiO0FBRUg7O0FBRUQ7QUFDQSx1QkFBUUosUUFBUXRILEtBQUtULEtBQUwsQ0FBV2tJLEtBQVgsQ0FBaUJ6SSxjQUFqQixDQUFoQixFQUFtRDtBQUFBLHlDQUVwQnNJLE1BQU0sQ0FBTixFQUFTM0QsS0FBVCxDQUFlLEdBQWYsQ0FGb0I7QUFBQSx3QkFFMUNwRCxRQUYwQztBQUFBLHdCQUVoQ29ILFFBRmdDOztBQUkvQ0EsK0JBQVlBLFFBQUQsR0FBYSxzQkFBUUEsUUFBUixDQUFiLEdBQWlDOUgsU0FBU0ksSUFBckQ7O0FBRUEsd0JBQUkySCxPQUFPbEYsVUFBVW1GLE9BQVYsQ0FBa0J0SCxRQUFsQixDQUFYO0FBQ0E7QUFDQSx3QkFBR29ILGFBQWEsY0FBS2xFLEVBQXJCLEVBQXlCO0FBQ3JCLDRCQUFHekQsS0FBS1QsS0FBTCxDQUFXa0ksS0FBWCxDQUFpQnhJLFlBQWpCLENBQUgsRUFBa0M7QUFDOUJzQix1Q0FBV3FILEtBQUtFLEdBQUwsR0FBVyxLQUF0QjtBQUNILHlCQUZELE1BRU87QUFDSHZILHVDQUFXbkIsUUFBUVMsU0FBU1ksU0FBakIsRUFBNEJaLFNBQVNhLFNBQXJDLEVBQWdEa0gsS0FBS0UsR0FBckQsQ0FBWDtBQUNIO0FBQ0Q7QUFDQSw0QkFBRyxxQkFBTzlILEtBQUtELElBQVosRUFBa0IsV0FBbEIsS0FBa0MscUJBQU9DLEtBQUtELElBQVosRUFBa0Isa0JBQWxCLENBQXJDLEVBQTJFO0FBQ3ZFc0gsMkNBQWVPLEtBQUtFLEdBQUwsR0FBVyxLQUExQjtBQUNIO0FBRUoscUJBWEQsTUFXTztBQUNIdkgsbUNBQVlvSCxhQUFhLGNBQUtyRSxFQUFuQixHQUNMLHdCQUFVc0UsS0FBS0csRUFBZixJQUFxQixrQkFBU0osUUFBVCxDQURoQixHQUVMLDBCQUFZQyxLQUFLRSxHQUFqQixJQUF3QixrQkFBU0gsUUFBVCxDQUY5QjtBQUdIOztBQUdEM0gseUJBQUtULEtBQUwsR0FBYVMsS0FBS1QsS0FBTCxDQUFXRyxPQUFYLENBQW1CNEgsTUFBTSxDQUFOLENBQW5CLEVBQTZCL0csUUFBN0IsQ0FBYjtBQUVIOztBQUVEO0FBQ0Esb0JBQUkscUJBQU9QLEtBQUtELElBQVosRUFBa0Isa0JBQWxCLENBQUosRUFBMkM7QUFBQSwrQkFFQUYsU0FBU0ksSUFBVCxLQUFrQixjQUFLd0QsRUFBeEIsR0FDaEN6RCxLQUFLVCxLQUFMLENBQVdvRSxLQUFYLENBQWlCekUsZ0JBQWpCLENBRGdDLEdBRWhDYyxLQUFLVCxLQUFMLENBQVdvRSxLQUFYLENBQWlCeEUsZ0JBQWpCLENBSmlDO0FBQUEsd0JBRWxDb0IsUUFGa0M7QUFBQSx3QkFFeEJ5SCxLQUZ3QjtBQUFBLHdCQUVqQkMsWUFGaUI7O0FBTXZDLHdCQUFJQyxlQUFlLHNCQUFRM0gsUUFBUixDQUFuQjtBQUNBLHdCQUFJSSxtQkFBSjs7QUFFQSx3QkFBSWQsU0FBU0ksSUFBVCxLQUFrQixjQUFLd0QsRUFBM0IsRUFBK0I7O0FBRTNCLDRCQUFHeUUsWUFBSCxFQUFpQjs7QUFFYjNILHVDQUFXd0MsT0FBT29GLE9BQVAsQ0FBZTVILFFBQWYsRUFBeUIySCxZQUF6QixFQUF1QyxjQUFLbEMsR0FBNUMsRUFBaURpQyxZQUFqRCxDQUFYO0FBQ0F0SCx5Q0FBYW9DLE9BQU9wQyxVQUFQLENBQWtCSixXQUFXLEtBQTdCLEVBQW9DeUgsS0FBcEMsRUFBMkNDLFlBQTNDLENBQWI7O0FBRUExSCx1Q0FBV25CLFFBQVFTLFNBQVNZLFNBQWpCLEVBQTRCWixTQUFTYSxTQUFyQyxFQUFnREgsUUFBaEQsQ0FBWDtBQUVILHlCQVBELE1BT087O0FBRUhJLHlDQUFhb0MsT0FBT3BDLFVBQVAsQ0FBa0IwRyxZQUFsQixFQUFnQ1csS0FBaEMsRUFBdUNDLFlBQXZDLENBQWI7QUFDSDs7QUFFRHRILHFDQUFhdkIsUUFBUVMsU0FBU2lCLFdBQWpCLEVBQThCakIsU0FBU2tCLFdBQXZDLEVBQW9ESixVQUFwRCxDQUFiO0FBRUgscUJBaEJELE1BZ0JPOztBQUVISixtQ0FBV3dDLE9BQU9vRixPQUFQLENBQWU1SCxRQUFmLEVBQXlCMkgsWUFBekIsRUFBdUMsSUFBdkMsRUFBNkNELFlBQTdDLElBQ0wsa0JBQVNwSSxTQUFTSSxJQUFsQixDQUROO0FBRUFVLHFDQUFhb0MsT0FBT3BDLFVBQVAsQ0FBa0JKLFFBQWxCLEVBQTRCeUgsS0FBNUIsRUFBbUNDLFlBQW5DLENBQWI7QUFFSDs7QUFFRCx3QkFBSXRDLGlCQUFpQixrQkFBUTNGLElBQVIsQ0FBYTtBQUM5QkQsOEJBQU0sYUFEd0I7QUFFOUJSLCtCQUFPb0IsVUFGdUI7QUFHOUJ5RSxnQ0FBUXBGLEtBQUtvRjtBQUhpQixxQkFBYixDQUFyQjs7QUFNQXBGLHlCQUFLVCxLQUFMLEdBQWFnQixRQUFiO0FBQ0FQLHlCQUFLRCxJQUFMLEdBQVksV0FBWjtBQUNBQyx5QkFBSzhFLE1BQUwsQ0FBWVUsV0FBWixDQUF3QnhGLElBQXhCLEVBQThCMkYsY0FBOUI7QUFFSDtBQUNEO0FBQ0EsdUJBQVEyQixRQUFRdEgsS0FBS1QsS0FBTCxDQUFXa0ksS0FBWCxDQUFpQnhJLFlBQWpCLENBQWhCLEVBQWlEO0FBQzdDLHdCQUFJTyxXQUFXLHNCQUFROEgsTUFBTSxDQUFOLENBQVIsRUFBa0IsR0FBbEIsQ0FBZjtBQUNBLHdCQUFJNUMsV0FBVzRDLE1BQU0sQ0FBTixDQUFmLENBRjZDLENBRXBCO0FBQ3pCLHdCQUFJYyxhQUFhZCxNQUFNLENBQU4sRUFBUzNELEtBQVQsQ0FBZXpFLGdCQUFmLENBQWpCO0FBQ0Esd0JBQUlPLE1BQU0sRUFBVjtBQUNBLHlCQUFLLElBQUk0SSxDQUFULElBQWNELFVBQWQsRUFBMEI7QUFBQSxrREFFRUEsV0FBV0MsQ0FBWCxFQUFjMUUsS0FBZCxDQUFvQnhFLGdCQUFwQixDQUZGO0FBQUEsNEJBRWpCSSxLQUZpQjtBQUFBLDRCQUVWZ0IsU0FGVTs7QUFJdEIsNEJBQUksQ0FBQ0EsU0FBTCxFQUFlO0FBQ1gsZ0NBQUcsQ0FBQzhHLFlBQUosRUFBaUI7QUFDYkU7QUFDSDtBQUNEaEgsd0NBQVc4RyxZQUFYO0FBQ0g7O0FBRUQsNEJBQUkscUJBQU8zQyxRQUFQLEVBQWlCLE1BQWpCLENBQUosRUFBOEI7QUFDMUIsZ0NBQUk3RSxTQUFTSSxJQUFULEtBQWtCLGNBQUt3RCxFQUEzQixFQUErQjtBQUMzQmhFLG9DQUFJNkYsSUFBSixDQUFTZ0MsTUFBTSxDQUFOLElBQVdsSSxRQUFRUyxTQUFTWSxTQUFqQixFQUE0QlosU0FBU2EsU0FBckMsRUFBZ0RuQixLQUFoRCxFQUF1REMsUUFBdkQsQ0FBcEI7QUFDSCw2QkFGRCxNQUVPO0FBQ0hDLG9DQUFJNkYsSUFBSixDQUFTZ0MsTUFBTSxDQUFOLElBQVdBLE1BQU0sQ0FBTixDQUFYLEdBQXNCdkUsT0FBT3VGLElBQVAsQ0FBWS9JLEtBQVosRUFBbUJnQixTQUFuQixDQUEvQjtBQUNIO0FBQ0oseUJBTkQsTUFNTyxJQUFJLHFCQUFPbUUsUUFBUCxFQUFpQixZQUFqQixLQUFrQyxxQkFBT0EsUUFBUCxFQUFpQixTQUFqQixDQUF0QyxFQUFtRTtBQUN0RSxnQ0FBSTZELFNBQVN4RixPQUFPcEMsVUFBUCxDQUFrQkosU0FBbEIsRUFBNEJoQixLQUE1QixFQUFtQyxJQUFuQyxDQUFiO0FBQ0EsZ0NBQUlNLFNBQVNJLElBQVQsS0FBa0IsY0FBS3dELEVBQTNCLEVBQStCO0FBQzNCOEUseUNBQVNuSixRQUFRUyxTQUFTaUIsV0FBakIsRUFBOEJqQixTQUFTa0IsV0FBdkMsRUFBb0R3SCxNQUFwRCxFQUE0RC9JLFFBQTVELENBQVQ7QUFDQUMsb0NBQUk2RixJQUFKLENBQVNnQyxNQUFNLENBQU4sSUFBV2lCLE1BQXBCO0FBQ0gsNkJBSEQsTUFHTztBQUNIOUksb0NBQUk2RixJQUFKLENBQVNnQyxNQUFNLENBQU4sSUFBV0EsTUFBTSxDQUFOLENBQVgsR0FBc0JpQixNQUEvQjtBQUNIO0FBQ0oseUJBUk0sTUFRQSxJQUFJLHFCQUFPN0QsUUFBUCxFQUFpQixTQUFqQixDQUFKLEVBQWlDO0FBQ3BDLGdDQUFJNkQsVUFBU3hGLE9BQU9wQyxVQUFQLENBQWtCSixTQUFsQixFQUE0QmhCLEtBQTVCLEVBQW1DLElBQW5DLEVBQXlDLElBQXpDLENBQWI7QUFDQSxnQ0FBSU0sU0FBU0ksSUFBVCxLQUFrQixjQUFLd0QsRUFBM0IsRUFBK0I7QUFDM0I4RSwwQ0FBU25KLFFBQVFTLFNBQVNpQixXQUFqQixFQUE4QmpCLFNBQVNrQixXQUF2QyxFQUFvRHdILE9BQXBELEVBQTREL0ksUUFBNUQsQ0FBVDtBQUNBQyxvQ0FBSTZGLElBQUosQ0FBU2dDLE1BQU0sQ0FBTixJQUFXaUIsT0FBcEI7QUFDSCw2QkFIRCxNQUdPO0FBQ0g5SSxvQ0FBSTZGLElBQUosQ0FBU2dDLE1BQU0sQ0FBTixJQUFXQSxNQUFNLENBQU4sQ0FBWCxHQUFzQmlCLE9BQS9CO0FBQ0g7QUFDSix5QkFSTSxNQVFBLElBQUkscUJBQU83RCxRQUFQLEVBQWlCLFNBQWpCLENBQUosRUFBaUM7O0FBRXBDLGdDQUFJNkQsV0FBU3hGLE9BQU95RixPQUFQLENBQWVqSixLQUFmLEVBQXNCZ0IsU0FBdEIsQ0FBYjtBQUNBLGdDQUFJVixTQUFTSSxJQUFULEtBQWtCLGNBQUt3RCxFQUEzQixFQUErQjtBQUMzQjhFLDJDQUFTbkosUUFBUVMsU0FBU2lCLFdBQVQsR0FBdUJ5SCxRQUF2QixHQUFnQzFJLFNBQVNZLFNBQWpELEVBQ0xaLFNBQVNrQixXQUFULEdBQXVCd0gsUUFBdkIsR0FBZ0MxSSxTQUFTYSxTQURwQyxFQUMrQ25CLEtBRC9DLEVBQ3NEQyxRQUR0RCxDQUFUO0FBRUFDLG9DQUFJNkYsSUFBSixDQUFTZ0MsTUFBTSxDQUFOLElBQVdpQixRQUFwQjtBQUNILDZCQUpELE1BSU87QUFDSDlJLG9DQUFJNkYsSUFBSixDQUFTZ0MsTUFBTSxDQUFOLElBQVdBLE1BQU0sQ0FBTixDQUFYLEdBQXNCaUIsUUFBL0I7QUFDSDtBQUNKLHlCQVZNLE1BVUEsSUFBSSxxQkFBTzdELFFBQVAsRUFBaUIsU0FBakIsS0FBK0IscUJBQU9BLFFBQVAsRUFBaUIsU0FBakIsQ0FBbkMsRUFBZ0U7QUFBQSwrQ0FFdkNuRixNQUFNb0UsS0FBTixDQUFZLEdBQVosQ0FGdUM7QUFBQSxnQ0FFOUQ4RSxPQUY4RDtBQUFBLGdDQUVyREMsVUFGcUQ7O0FBR25FQSx5Q0FBYSxjQUFLQSxVQUFMLENBQWI7QUFDQSxnQ0FBSUgsV0FBU3hGLE9BQU9BLE1BQVAsQ0FBYzBGLE9BQWQsRUFBdUJsSSxTQUF2QixFQUFpQyxJQUFqQyxFQUF1Q21JLFVBQXZDLENBQWI7QUFDQSxnQ0FBSTdJLFNBQVNJLElBQVQsS0FBa0IsY0FBS3dELEVBQTNCLEVBQStCO0FBQzNCOEUsMkNBQVNuSixRQUFRUyxTQUFTaUIsV0FBakIsRUFBOEJqQixTQUFTa0IsV0FBdkMsRUFBb0R3SCxRQUFwRCxFQUE0RC9JLFFBQTVELENBQVQ7QUFDQUMsb0NBQUk2RixJQUFKLENBQVNnQyxNQUFNLENBQU4sSUFBV2lCLFFBQXBCO0FBQ0gsNkJBSEQsTUFHTztBQUNIOUksb0NBQUk2RixJQUFKLENBQVNnQyxNQUFNLENBQU4sSUFBV0EsTUFBTSxDQUFOLENBQVgsR0FBc0JpQixRQUEvQjtBQUNIO0FBRUoseUJBWk0sTUFZQSxJQUFJLHFCQUFPN0QsUUFBUCxFQUFpQixRQUFqQixDQUFKLEVBQWdDO0FBQUEsZ0RBQ1BuRixNQUFNb0UsS0FBTixDQUFZLEdBQVosQ0FETztBQUFBLGdDQUM5QjhFLFFBRDhCO0FBQUEsZ0NBQ3JCQyxXQURxQjs7QUFFbkNBLDBDQUFhLGNBQUtBLFdBQUwsQ0FBYjtBQUNBLGdDQUFJSCxXQUFTeEYsT0FBT0EsTUFBUCxDQUFjMEYsUUFBZCxFQUF1QmxJLFNBQXZCLEVBQWlDLEtBQWpDLEVBQXdDbUksV0FBeEMsQ0FBYjtBQUNBLGdDQUFJN0ksU0FBU0ksSUFBVCxLQUFrQixjQUFLd0QsRUFBM0IsRUFBK0I7QUFDM0I4RSwyQ0FBU25KLFFBQVFTLFNBQVNpQixXQUFqQixFQUE4QmpCLFNBQVNrQixXQUF2QyxFQUFvRHdILFFBQXBELEVBQTREL0ksUUFBNUQsQ0FBVDtBQUNBQyxvQ0FBSTZGLElBQUosQ0FBU2dDLE1BQU0sQ0FBTixJQUFXaUIsUUFBcEI7QUFDSCw2QkFIRCxNQUdPO0FBQ0g5SSxvQ0FBSTZGLElBQUosQ0FBU2dDLE1BQU0sQ0FBTixJQUFXQSxNQUFNLENBQU4sQ0FBWCxHQUFzQmlCLFFBQS9CO0FBQ0g7QUFDSjtBQUVKO0FBQ0R2SSx5QkFBS1QsS0FBTCxHQUFhUyxLQUFLVCxLQUFMLENBQVdHLE9BQVgsQ0FBbUI0SCxNQUFNLENBQU4sQ0FBbkIsRUFBNkI3SCxJQUFJMEUsSUFBSixDQUFTLEdBQVQsQ0FBN0IsQ0FBYjtBQUNIOztBQUVEO0FBQ0Esb0JBQUl0RSxTQUFTeUIsV0FBVCxJQUF3QnRCLEtBQUtULEtBQUwsQ0FBV2tJLEtBQVgsb0JBQTVCLEVBQXlEO0FBQ3JEekgseUJBQUs4RSxNQUFMLENBQVlDLFlBQVosQ0FBeUIvRSxJQUF6QixFQUErQkEsS0FBSytGLEtBQUwsQ0FBVztBQUN0Q3hHLCtCQUFPd0QsT0FBT3pCLFdBQVAsQ0FBbUJ0QixLQUFLVCxLQUF4QjtBQUQrQixxQkFBWCxDQUEvQjtBQUdIO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0g7QUFDSixTQW5NRDtBQW9NSCxLQXhNRDs7QUEwTUEsV0FBTyxVQUFDb0osR0FBRCxFQUFTOztBQUVaO0FBQ0EsWUFBSUMsZ0JBQWdCLEVBQXBCO0FBQ0E7QUFDQUQsWUFBSUUsV0FBSixDQUFnQixnQkFBUTtBQUNwQixnQkFBSSxxQkFBT2pKLEtBQUsyRSxJQUFaLEVBQWtCLE1BQWxCLENBQUosRUFBK0I7O0FBRTNCLG9CQUFJQSxPQUFPLDBCQUFZM0UsS0FBSzRFLE1BQWpCLENBQVg7QUFDQW9FLDhCQUFjckUsSUFBZCxJQUFzQjNFLElBQXRCO0FBQ0E7QUFFSCxhQU5ELE1BTU8sSUFBSSxxQkFBT0EsS0FBSzJFLElBQVosRUFBa0IsT0FBbEIsQ0FBSixFQUFnQzs7QUFFbkMsb0JBQUlBLFFBQU8sMEJBQVkzRSxLQUFLNEUsTUFBakIsQ0FBWDtBQUNBLG9CQUFJc0UsUUFBUUYsY0FBY3JFLEtBQWQsRUFBb0J1RSxLQUFoQztBQUNBLG9CQUFJQyxNQUFNRCxNQUFNdEMsTUFBaEI7QUFDQSxxQkFBSSxJQUFJNkIsSUFBSSxDQUFaLEVBQWVBLElBQUlVLEdBQW5CLEVBQXdCVixHQUF4QixFQUE0QjtBQUN4QnpJLHlCQUFLa0YsTUFBTCxDQUFZQyxZQUFaLENBQXlCbkYsSUFBekIsRUFBK0JrSixNQUFNVCxDQUFOLEVBQVN0QyxLQUFULENBQWUsRUFBQ1gsUUFBUXhGLEtBQUt3RixNQUFkLEVBQWYsQ0FBL0I7QUFDSDtBQUNEeEYscUJBQUs2RSxNQUFMO0FBQ0g7QUFDSixTQWpCRDs7QUFtQkEsYUFBSyxJQUFJdEIsR0FBVCxJQUFnQnlGLGFBQWhCLEVBQStCO0FBQzNCLGdCQUFJQSxjQUFjeEYsY0FBZCxDQUE2QkQsR0FBN0IsQ0FBSixFQUF1QztBQUNuQ3lGLDhCQUFjekYsR0FBZCxFQUFtQnNCLE1BQW5CO0FBQ0g7QUFDSjs7QUFFRG1FLHdCQUFnQixJQUFoQjtBQUNBO0FBQ0FELFlBQUkxQixJQUFKLENBQVMsZ0JBQVE7QUFDYjtBQUNBO0FBQ0E7O0FBRUEsZ0JBQUkscUJBQU9HLEtBQUtELElBQVosRUFBa0IsUUFBbEIsQ0FBSixFQUFpQzs7QUFFN0I3QywyQkFBVzhDLElBQVg7QUFFSCxhQUpELE1BSU8sSUFBSSxxQkFBT0EsS0FBS0QsSUFBWixFQUFrQixNQUFsQixDQUFKLEVBQStCOztBQUVsQztBQUNBckgsMEJBQVVzSCxJQUFWO0FBRUgsYUFMTSxNQUtBLElBQUl2SCxTQUFTNEMsY0FBVCxJQUEyQixxQkFBTzJFLEtBQUtELElBQVosRUFBa0IsU0FBbEIsQ0FBL0IsRUFBNkQ7QUFDaEVDLHFCQUFLM0MsTUFBTDtBQUNIO0FBRUosU0FsQkQ7O0FBb0JBO0FBQ0EsYUFBSyxJQUFJdEIsSUFBVCxJQUFnQkYsV0FBaEIsRUFBNkI7O0FBRXpCLGdCQUFJbUUsT0FBT25FLFlBQVlFLElBQVosQ0FBWDs7QUFFQSxnQkFBSWlFLEtBQUsvQixLQUFMLEdBQWEsQ0FBakIsRUFBb0I7QUFDaEIsb0JBQUl6RixPQUFPLGtCQUFRaUYsS0FBUixDQUFjdUMsS0FBS25DLFFBQUwsR0FBZ0IsSUFBaEIsR0FBdUJtQyxLQUFLekMsS0FBNUIsR0FBb0MsR0FBbEQsQ0FBWDtBQUNBL0UscUJBQUt3RixNQUFMLEdBQWNnQyxLQUFLaEMsTUFBbkI7QUFDQWdDLHFCQUFLbEMsT0FBTCxDQUFhLENBQWIsRUFBZ0JKLE1BQWhCLENBQXVCQyxZQUF2QixDQUFvQ3FDLEtBQUtsQyxPQUFMLENBQWEsQ0FBYixDQUFwQyxFQUFxRHRGLElBQXJEO0FBRUgsYUFMRCxNQUtPO0FBQ0gsb0JBQUkrRSxRQUFRLGtCQUFRRSxLQUFSLENBQWN1QyxLQUFLekMsS0FBbkIsQ0FBWjtBQUNBQSxzQkFBTVMsTUFBTixHQUFlZ0MsS0FBS2hDLE1BQXBCO0FBQ0FnQyxxQkFBS2xDLE9BQUwsQ0FBYSxDQUFiLEVBQWdCTSxXQUFoQixDQUE0QjRCLEtBQUtqQyxJQUFqQyxFQUF1Q1IsS0FBdkM7QUFDSDs7QUFFRDtBQUNBLGlCQUFLLElBQUkwRCxDQUFULElBQWNqQixLQUFLbEMsT0FBbkIsRUFBNEI7QUFDeEIsb0JBQUlrQyxLQUFLbEMsT0FBTCxDQUFhOUIsY0FBYixDQUE0QmlGLENBQTVCLEtBQWtDakIsS0FBS2xDLE9BQUwsQ0FBYW1ELENBQWIsRUFBZ0JTLEtBQWhCLENBQXNCdEMsTUFBdEIsS0FBaUMsQ0FBdkUsRUFBMEU7QUFDdEVZLHlCQUFLbEMsT0FBTCxDQUFhbUQsQ0FBYixFQUFnQjVELE1BQWhCO0FBQ0g7QUFDSjtBQUVKO0FBQ0R4QixzQkFBYyxFQUFkO0FBQ0gsS0E3RUQ7QUE4RUg7O2tCQUVjN0MsTyIsImZpbGUiOiJIYW1zdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBtb2R1bGUgSGFtc3RlclxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb24gUG9zdENTUyBIYW1zdGVyIGZyYW1ld29yayBtYWluIGZ1bmN0aW9uYWxpdHkuXHJcbiAqXHJcbiAqIEB2ZXJzaW9uIDEuMFxyXG4gKiBAYXV0aG9yIEdyaWdvcnkgVmFzaWx5ZXYgPHBvc3Rjc3MuaGFtc3RlckBnbWFpbC5jb20+IGh0dHBzOi8vZ2l0aHViLmNvbS9oMHRjMGQzXHJcbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE3LCBHcmlnb3J5IFZhc2lseWV2XHJcbiAqIEBsaWNlbnNlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCwgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IEZvbnRTaXplcyBmcm9tIFwiLi9Gb250U2l6ZXNcIjtcclxuXHJcbmltcG9ydCB7XHJcbiAgICBmb3JtYXRJbnQsXHJcbiAgICBmb3JtYXRWYWx1ZSxcclxuICAgIHJlbVJlZ2V4cCxcclxuICAgIGdldFVuaXQsXHJcbiAgICBleHRlbmQsXHJcbiAgICB0b0NhbWVsQ2FzZSxcclxuICAgIHRvS2ViYWJDYXNlLFxyXG4gICAgY21wU3RyLFxyXG4gICAgc2NtcFN0cixcclxuICAgIFVOSVQsXHJcbiAgICB1bml0TmFtZVxyXG59IGZyb20gXCIuL0hlbHBlcnNcIjtcclxuXHJcbmltcG9ydCBWZXJ0aWNhbFJoeXRobSBmcm9tIFwiLi9WZXJ0aWNhbFJoeXRobVwiO1xyXG5cclxuaW1wb3J0IFBuZ0ltYWdlIGZyb20gXCIuL1BuZ0ltYWdlXCI7XHJcbi8vIGltcG9ydCBWaXJ0dWFsTWFjaGluZSBmcm9tIFwiLi9WaXJ0dWFsTWFjaGluZVwiO1xyXG5cclxuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5cclxuaW1wb3J0IHBvc3Rjc3MgZnJvbSBcInBvc3Rjc3NcIjtcclxuLy8gaW1wb3J0IHBvc3Rjc3MgZnJvbSBcIi4uLy4uL3Bvc3Rjc3MvYnVpbGQvbGliL3Bvc3Rjc3MuanNcIjtcclxuXHJcbmNvbnN0IGhlbHBlcnMgPSB7XHJcblxyXG4gICAgcmVzZXQ6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2hlbHBlcnMvcmVzZXQuY3NzXCIpLCBcInV0ZjhcIiksXHJcblxyXG4gICAgbm9ybWFsaXplOiBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9oZWxwZXJzL25vcm1hbGl6ZS5jc3NcIiksIFwidXRmOFwiKSxcclxuXHJcbiAgICBzYW5pdGl6ZTogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vaGVscGVycy9zYW5pdGl6ZS5jc3NcIiksIFwidXRmOFwiKSxcclxuXHJcbiAgICBib3hTaXppbmdSZXNldDogXCJcXG5odG1sIHtcIiArXHJcbiAgICBcIlxcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG5cIiArXHJcbiAgICBcIn1cXG5cIiArXHJcbiAgICBcIiosICo6YmVmb3JlLCAqOmFmdGVyIHtcIiArXHJcbiAgICBcIlxcbiAgYm94LXNpemluZzogaW5oZXJpdDtcXG5cIiArXHJcbiAgICBcIn1cXG5cIixcclxuXHJcbiAgICBub3dyYXA6IFwiXFxuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xcblwiLFxyXG5cclxuICAgIGZvcmNld3JhcDogXCJcXG4gIHdoaXRlLXNwYWNlOiBwcmU7XCIgK1xyXG4gICAgXCJcXG4gIHdoaXRlLXNwYWNlOiBwcmUtbGluZTtcIiArXHJcbiAgICBcIlxcbiAgd2hpdGUtc3BhY2U6IHByZS13cmFwO1wiICtcclxuICAgIFwiXFxuICB3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XFxuXCIsXHJcblxyXG4gICAgZWxsaXBzaXM6IFwiXFxuICBvdmVyZmxvdzogaGlkZGVuO1wiICtcclxuICAgIFwiXFxuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcXG5cIixcclxuXHJcbiAgICBoeXBoZW5zOiBcIlxcbiAgd29yZC13cmFwOiBicmVhay13b3JkO1wiICtcclxuICAgIFwiXFxuICBoeXBoZW5zOiBhdXRvO1xcblwiLFxyXG5cclxuICAgIGJyZWFrV29yZDogLyogTm9uIHN0YW5kYXJkIGZvciB3ZWJraXQgKi9cclxuICAgIFwiXFxuICB3b3JkLWJyZWFrOiBicmVhay13b3JkO1wiICtcclxuICAgIC8qIFdhcm5pbmc6IE5lZWRlZCBmb3Igb2xkSUUgc3VwcG9ydCwgYnV0IHdvcmRzIGFyZSBicm9rZW4gdXAgbGV0dGVyLWJ5LWxldHRlciAqL1xyXG4gICAgXCJcXG4gIHdvcmQtYnJlYWs6IGJyZWFrLWFsbDtcXG5cIlxyXG59O1xyXG5cclxuLy8gZm9udFNpemUgcHJvcGVydHkgUmVnZXhwXHJcbmNvbnN0IGZvbnRTaXplUmVnZXhwID0gLyhmb250U2l6ZXxmcylcXHMrKFtcXC0kQDAtOWEtekEtWl0rKS9pO1xyXG5cclxuLy8gcmh5dGhtIGZ1bmN0aW9ucyBSZWdleHBcclxuY29uc3Qgcmh5dGhtUmVnZXhwID0gLygtPykoXFxzKikobGluZUhlaWdodHxsaGVpZ2h0fHNwYWNpbmd8bGVhZGluZ3whcmh5dGhtfGlyaHl0aG18cmh5dGhtfGJhc2UpXFwoKC4qPylcXCkvaTtcclxuXHJcbi8vIENvbW1hIHNwbGl0IHJlZ2V4cFxyXG5jb25zdCBjb21tYVNwbGl0UmVnZXhwID0gL1xccyosXFxzKi87XHJcblxyXG4vLyBTcGFjZSBzcGxpdCByZWdleHBcclxuY29uc3Qgc3BhY2VTcGxpdFJlZ2V4cCA9IC9cXHMrLztcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gdmlld3BvcnQgY2FsY3VsYXRlZCB2YWx1ZS5cclxuICogQHBhcmFtIE1cclxuICogQHBhcmFtIEJcclxuICogQHBhcmFtIHZhbHVlXHJcbiAqIEBwYXJhbSBoYXNNaW51c1xyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuZnVuY3Rpb24gdndWYWx1ZShNLCBCLCB2YWx1ZSwgaGFzTWludXMgPSBmYWxzZSl7XHJcbiAgICBsZXQgcmV0ID0gKEIgPT09IDApXHJcbiAgICAgICAgPyBmb3JtYXRWYWx1ZShNICogdmFsdWUpICsgXCJ2d1wiXHJcbiAgICAgICAgOiAoQiA+IDApXHJcbiAgICAgICAgICAgID8gZm9ybWF0VmFsdWUoTSAqIHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgKyBcInZ3ICsgXCIgKyBmb3JtYXRWYWx1ZShCICogdmFsdWUpICsgXCJweFwiXHJcbiAgICAgICAgICAgIDogZm9ybWF0VmFsdWUoTSAqIHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgKyBcInZ3IFwiICsgZm9ybWF0VmFsdWUoQiAqIHZhbHVlKS5yZXBsYWNlKFwiLVwiLCBcIi0gXCIpICsgXCJweFwiO1xyXG4gICAgcmV0dXJuIChoYXNNaW51cykgPyBcImNhbGMoKFwiICsgcmV0ICsgXCIpICogLTEpXCI6IFwiY2FsYyhcIiArIHJldCArIFwiKVwiO1xyXG59XHJcbi8qKlxyXG4gKiBBZGQgU2V0dGluZ3MgdG8gc2V0dGluZ3MgdGFibGUuXHJcbiAqIEBwYXJhbSBydWxlIC0gY3VycmVudCBydWxlLlxyXG4gKiBAcGFyYW0gc2V0dGluZ3MgLSBzZXR0aW5ncyB0YWJsZS5cclxuICovXHJcbmZ1bmN0aW9uIGFkZFNldHRpbmdzKHJ1bGUsIHNldHRpbmdzKSB7XHJcblxyXG4gICAgcnVsZS53YWxrRGVjbHMoZGVjbCA9PiB7XHJcblxyXG4gICAgICAgIGxldCBwcm9wID0gdG9DYW1lbENhc2UoZGVjbC5wcm9wKTtcclxuICAgICAgICBpZiAoc2NtcFN0cihwcm9wLCBcInJlbUZhbGxiYWNrXCIpIHx8IHNjbXBTdHIocHJvcCwgXCJweEZhbGxiYWNrXCIpIHx8IHNjbXBTdHIocHJvcCwgXCJweEJhc2VsaW5lXCIpIHx8XHJcbiAgICAgICAgICAgIHNjbXBTdHIocHJvcCwgXCJyb3VuZFRvSGFsZkxpbmVcIikgfHwgc2NtcFN0cihwcm9wLCBcInJ1bGVyXCIpIHx8XHJcbiAgICAgICAgICAgIHNjbXBTdHIocHJvcCwgXCJsZWdhY3lCcm93c2Vyc1wiKSB8fCBzY21wU3RyKHByb3AsIFwicmVtb3ZlQ29tbWVudHNcIikpIHtcclxuXHJcbiAgICAgICAgICAgIHNldHRpbmdzW3Byb3BdID0gY21wU3RyKGRlY2wudmFsdWUsIFwidHJ1ZVwiKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChzY21wU3RyKHByb3AsIFwidW5pdFwiKSkge1xyXG5cclxuICAgICAgICAgICAgc2V0dGluZ3MudW5pdCA9IGdldFVuaXQoZGVjbC52YWx1ZSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoc2NtcFN0cihwcm9wLCBcImxpbmVIZWlnaHRcIikgfHwgc2NtcFN0cihwcm9wLCBcInRvTGluZUhlaWdodFwiKSkge1xyXG5cclxuICAgICAgICAgICAgc2V0dGluZ3NbcHJvcF0gPSBwYXJzZUZsb2F0KGRlY2wudmFsdWUpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHNjbXBTdHIocHJvcCwgXCJmb250U2l6ZVwiKSB8fCBzY21wU3RyKHByb3AsIFwidG9Gb250U2l6ZVwiKSB8fCBzY21wU3RyKHByb3AsIFwibWluTGluZVBhZGRpbmdcIikgfHxcclxuICAgICAgICAgICAgc2NtcFN0cihwcm9wLCBcInJ1bGVyVGhpY2tuZXNzXCIpIHx8IHNjbXBTdHIocHJvcCwgXCJydWxlclNjYWxlXCIpIHx8XHJcbiAgICAgICAgICAgIHNjbXBTdHIocHJvcCwgXCJicm93c2VyRm9udFNpemVcIikpIHtcclxuXHJcbiAgICAgICAgICAgIHNldHRpbmdzW3Byb3BdID0gcGFyc2VJbnQoZGVjbC52YWx1ZSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBzZXR0aW5nc1twcm9wXSA9IGRlY2wudmFsdWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbXN0ZXIob3B0aW9ucykge1xyXG5cclxuICAgIC8vIERlZmF1bHQgR2xvYmFsIFNldHRpbmdzXHJcbiAgICBsZXQgZ2xvYmFsU2V0dGluZ3MgPSB7XHJcblxyXG4gICAgICAgIGZvbnRTaXplOiAxNixcclxuICAgICAgICB0b0ZvbnRTaXplOiAwLFxyXG4gICAgICAgIGZvbnRTaXplTTogMCxcclxuICAgICAgICBmb250U2l6ZUI6IDAsXHJcblxyXG4gICAgICAgIGxpbmVIZWlnaHQ6IDEuNSxcclxuICAgICAgICBsaW5lSGVpZ2h0UmVsOiAwLFxyXG4gICAgICAgIGxpbmVIZWlnaHRQeDogMCxcclxuICAgICAgICBsaW5lSGVpZ2h0TTogMCxcclxuICAgICAgICBsaW5lSGVpZ2h0QjogMCxcclxuICAgICAgICB0b0xpbmVIZWlnaHQ6IDAsXHJcbiAgICAgICAgdG9MaW5lSGVpZ2h0UHg6IDAsXHJcbiAgICAgICAgdG9MaW5lSGVpZ2h0UmVsOiAwLFxyXG5cclxuICAgICAgICB2aWV3cG9ydDogbnVsbCxcclxuXHJcbiAgICAgICAgdW5pdDogVU5JVC5FTSxcclxuXHJcbiAgICAgICAgcHhGYWxsYmFjazogZmFsc2UsXHJcbiAgICAgICAgcmVtRmFsbGJhY2s6IHRydWUsXHJcbiAgICAgICAgcHhCYXNlbGluZTogZmFsc2UsXHJcbiAgICAgICAgZm9udFJhdGlvOiBcIjEuMjVcIixcclxuXHJcbiAgICAgICAgcHJvcGVydGllczogXCJpbmxpbmVcIixcclxuXHJcbiAgICAgICAgbWluTGluZVBhZGRpbmc6IDIsXHJcbiAgICAgICAgcm91bmRUb0hhbGZMaW5lOiBmYWxzZSxcclxuXHJcbiAgICAgICAgcnVsZXI6IHRydWUsXHJcbiAgICAgICAgcnVsZXJTdHlsZTogXCJhbHdheXMgcnVsZXItZGVidWdcIixcclxuICAgICAgICBydWxlckljb25Qb3NpdGlvbjogXCJwb3NpdGlvbjpmaXhlZDt0b3A6IHNwYWNpbmcoMSk7bGVmdDogc3BhY2luZygxKTtcIixcclxuICAgICAgICBydWxlckljb25Db2xvcnM6IFwiI2NjY2NjYyAjNDQ1NzZhXCIsXHJcbiAgICAgICAgcnVsZXJJY29uU2l6ZTogXCJzcGFjaW5nKDEpXCIsXHJcbiAgICAgICAgcnVsZXJDb2xvcjogXCJyZ2JhKDE5LCAxMzQsIDE5MSwgLjgpXCIsXHJcbiAgICAgICAgcnVsZXJUaGlja25lc3M6IDEsXHJcbiAgICAgICAgcnVsZXJCYWNrZ3JvdW5kOiBcImdyYWRpZW50XCIsXHJcbiAgICAgICAgcnVsZXJPdXRwdXQ6IFwiYmFzZTY0XCIsXHJcbiAgICAgICAgcnVsZXJQYXR0ZXJuOiBcIjEgMCAwIDBcIixcclxuICAgICAgICBydWxlclNjYWxlOiAxLFxyXG5cclxuICAgICAgICBicm93c2VyRm9udFNpemU6IDE2LFxyXG4gICAgICAgIGxlZ2FjeUJyb3dzZXJzOiB0cnVlLFxyXG4gICAgICAgIHJlbW92ZUNvbW1lbnRzOiBmYWxzZSxcclxuICAgICAgICBmb250U2l6ZXM6IG51bGxcclxuICAgIH07XHJcblxyXG4gICAgLy8gVmFsdWUgdG9Mb3dlckNhc2UoKVxyXG4gICAgbGV0IHRvTG93ZXJDYXNlS2V5cyA9IFtcclxuICAgICAgICBcInVuaXRcIixcclxuICAgICAgICBcImZvbnRSYXRpb1wiLFxyXG4gICAgICAgIFwicHJvcGVydGllc1wiLFxyXG4gICAgICAgIFwicnVsZXJTdHlsZVwiLFxyXG4gICAgICAgIFwicnVsZXJCYWNrZ3JvdW5kXCIsXHJcbiAgICAgICAgXCJydWxlck91dHB1dFwiXHJcbiAgICBdO1xyXG5cclxuXHJcbiAgICBjb25zdCBiYWNrU2V0dGluZ3MgPSBleHRlbmQoe30sIGdsb2JhbFNldHRpbmdzKTtcclxuICAgIC8vIEN1cnJlbnQgU2V0dGluZ3MgZXh0ZW5kKHt9LCBnbG9iYWxTZXR0aW5ncylcclxuICAgIGxldCBzZXR0aW5ncyA9IHt9O1xyXG4gICAgaWYob3B0aW9ucyl7XHJcbiAgICAgICAgZXh0ZW5kKGdsb2JhbFNldHRpbmdzLCBvcHRpb25zLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgICBsZXQgc2V0dGluZ3NSZWdleHA7XHJcbiAgICAvL0N1cnJlbnQgRm9udFNpemVzXHJcbiAgICBsZXQgY3VycmVudEZvbnRTaXplcyA9IG51bGw7XHJcbiAgICAvLyBmb250IFNpemVzXHJcbiAgICBsZXQgZm9udFNpemVzO1xyXG4gICAgLy8gVmVydGljYWwgUmh5dGhtIENhbGN1bGF0b3JcclxuICAgIGxldCByaHl0aG07XHJcbiAgICAvLyBMYXN0IENzcyBGaWxlXHJcbiAgICAvLyBsZXQgbGFzdEZpbGU7XHJcbiAgICBjb25zdCBpbWFnZSA9IG5ldyBQbmdJbWFnZSgpO1xyXG4gICAgLy8gRXh0ZW5kIE5vZGVzXHJcbiAgICBsZXQgZXh0ZW5kTm9kZXMgPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgICovXHJcbiAgICBjb25zdCBpbml0U2V0dGluZ3MgPSAoKSA9PiB7XHJcbiAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IG51bGw7XHJcbiAgICAgICAgLy8gQWRkIGZvbnRTaXplc1xyXG4gICAgICAgIGlmIChnbG9iYWxTZXR0aW5ncy5mb250U2l6ZXMpIHtcclxuICAgICAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IGdsb2JhbFNldHRpbmdzLmZvbnRTaXplcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzZXR0aW5ncy5mb250U2l6ZXMpIHtcclxuICAgICAgICAgICAgY3VycmVudEZvbnRTaXplcyA9IChjdXJyZW50Rm9udFNpemVzKVxyXG4gICAgICAgICAgICAgICAgPyBjdXJyZW50Rm9udFNpemVzICsgXCIsIFwiICsgc2V0dGluZ3MuZm9udFNpemVzXHJcbiAgICAgICAgICAgICAgICA6IHNldHRpbmdzLmZvbnRTaXplcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRvTG93ZXJDYXNlIEN1cnJlbnQgU2V0dGluZ3NcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdG9Mb3dlckNhc2VLZXlzKSB7XHJcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICBzZXR0aW5nc1trZXldID0gc2V0dGluZ3Nba2V5XS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZWxhdGl2ZSBsaW5lLWhlaWdodFxyXG4gICAgICAgIHNldHRpbmdzLmxpbmVIZWlnaHRSZWwgPSBzZXR0aW5ncy5saW5lSGVpZ2h0ID4gc2V0dGluZ3MuZm9udFNpemVcclxuICAgICAgICAgICAgPyBzZXR0aW5ncy5saW5lSGVpZ2h0IC8gc2V0dGluZ3MuZm9udFNpemUgOiBzZXR0aW5ncy5saW5lSGVpZ2h0O1xyXG5cclxuICAgICAgICAvLyBQaXhlbCBsaW5lLWhlaWdodFxyXG4gICAgICAgIHNldHRpbmdzLmxpbmVIZWlnaHRQeCA9IHNldHRpbmdzLmxpbmVIZWlnaHQgPiBzZXR0aW5ncy5mb250U2l6ZVxyXG4gICAgICAgICAgICA/IHNldHRpbmdzLmxpbmVIZWlnaHRcclxuICAgICAgICAgICAgOiAoc2V0dGluZ3MubGluZUhlaWdodCAqIHNldHRpbmdzLmZvbnRTaXplKTtcclxuICAgICAgICBpZihzZXR0aW5ncy51bml0ID09PSBVTklULlBYICYmIHNldHRpbmdzLnB4RmFsbGJhY2spIHtcclxuICAgICAgICAgICAgc2V0dGluZ3MubGluZUhlaWdodFB4ID0gTWF0aC5yb3VuZChzZXR0aW5ncy5saW5lSGVpZ2h0UHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5WVyl7XHJcblxyXG4gICAgICAgICAgICBsZXQgdmlldyA9IHNldHRpbmdzLnZpZXdwb3J0LnNwbGl0KHNwYWNlU3BsaXRSZWdleHApO1xyXG4gICAgICAgICAgICBsZXQgZnJvbSA9IHBhcnNlRmxvYXQodmlld1swXSk7XHJcbiAgICAgICAgICAgIGxldCB0byA9IHBhcnNlRmxvYXQodmlld1sxXSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdmlld0RpZmYgPSB0byAtIGZyb207XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmZvbnRTaXplTSA9IChzZXR0aW5ncy50b0ZvbnRTaXplIC0gc2V0dGluZ3MuZm9udFNpemUpIC8gdmlld0RpZmY7XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmZvbnRTaXplQiA9IHNldHRpbmdzLmZvbnRTaXplIC0gc2V0dGluZ3MuZm9udFNpemVNICogZnJvbTtcclxuICAgICAgICAgICAgc2V0dGluZ3MuZm9udFNpemVNID0gc2V0dGluZ3MuZm9udFNpemVNICogMTAwO1xyXG5cclxuICAgICAgICAgICAgLy8gcmVsYXRpdmUgbGluZS1oZWlnaHRcclxuICAgICAgICAgICAgc2V0dGluZ3MudG9MaW5lSGVpZ2h0UmVsID0gc2V0dGluZ3MudG9MaW5lSGVpZ2h0ID4gc2V0dGluZ3MudG9Gb250U2l6ZVxyXG4gICAgICAgICAgICAgICAgPyBzZXR0aW5ncy50b0xpbmVIZWlnaHQgLyBzZXR0aW5ncy50b0ZvbnRTaXplIDogc2V0dGluZ3MudG9MaW5lSGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgLy8gUGl4ZWwgbGluZS1oZWlnaHRcclxuICAgICAgICAgICAgc2V0dGluZ3MudG9MaW5lSGVpZ2h0UHggPSBzZXR0aW5ncy50b0xpbmVIZWlnaHQgPiBzZXR0aW5ncy50b0ZvbnRTaXplXHJcbiAgICAgICAgICAgICAgICA/IHNldHRpbmdzLnRvTGluZUhlaWdodFxyXG4gICAgICAgICAgICAgICAgOiAoc2V0dGluZ3MudG9MaW5lSGVpZ2h0ICogc2V0dGluZ3MudG9Gb250U2l6ZSk7XHJcblxyXG4gICAgICAgICAgICBzZXR0aW5ncy5saW5lSGVpZ2h0TSA9IChzZXR0aW5ncy50b0xpbmVIZWlnaHRQeCAtIHNldHRpbmdzLmxpbmVIZWlnaHRQeCkgLyB2aWV3RGlmZjtcclxuICAgICAgICAgICAgc2V0dGluZ3MubGluZUhlaWdodEIgPSBzZXR0aW5ncy5saW5lSGVpZ2h0UHggLSBzZXR0aW5ncy5saW5lSGVpZ2h0TSAqIGZyb207XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmxpbmVIZWlnaHRNID0gc2V0dGluZ3MubGluZUhlaWdodE0gKiAxMDA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9udFNpemVzID0gbmV3IEZvbnRTaXplcyhzZXR0aW5ncyk7XHJcbiAgICAgICAgcmh5dGhtID0gbmV3IFZlcnRpY2FsUmh5dGhtKHNldHRpbmdzKTtcclxuICAgICAgICBpZiAoY3VycmVudEZvbnRTaXplcykge1xyXG4gICAgICAgICAgICBmb250U2l6ZXMuYWRkRm9udFNpemVzKGN1cnJlbnRGb250U2l6ZXMsIHJoeXRobSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzZXR0aW5nc0tleXMgPSBPYmplY3Qua2V5cyhzZXR0aW5ncykuam9pbihcInxcIik7XHJcbiAgICAgICAgLy9sZXQgc2V0dGluZ3NLZXlzU3RyaW5nID0gdG9LZWJhYkNhc2Uoc2V0dGluZ3NLZXlzKS5yZXBsYWNlKC8tL2csIFwiXFxcXC1cIik7XHJcbiAgICAgICAgbGV0IHNldHRpbmdzS2V5c1N0cmluZyA9IHRvS2ViYWJDYXNlKHNldHRpbmdzS2V5cykuc3BsaXQoXCItXCIpLmpvaW4oXCJcXFxcLVwiKTtcclxuICAgICAgICBzZXR0aW5nc1JlZ2V4cCA9IG5ldyBSZWdFeHAoXCJcXFxcQChcIiArIHNldHRpbmdzS2V5c1N0cmluZyArIFwiKVwiLCBcImlcIik7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHdhbGtBdFJ1bGUgPSAocnVsZSkgPT4ge1xyXG5cclxuICAgICAgICBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJoYW1zdGVyXCIpKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoY21wU3RyKHJ1bGUucGFyYW1zLCBcInJlc2V0XCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZ2xvYmFsU2V0dGluZ3MgPSBleHRlbmQoe30sIGJhY2tTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjbXBTdHIocnVsZS5wYXJhbXMsIFwiZW5kXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgYWRkU2V0dGluZ3MocnVsZSwgZ2xvYmFsU2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBSZXNldCBjdXJyZW50IHNldHRpbmdzXHJcbiAgICAgICAgICAgIHNldHRpbmdzID0gZXh0ZW5kKHt9LCBnbG9iYWxTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICAvLyBJbml0IGN1cnJlbnQgU2V0dGluZ3NcclxuICAgICAgICAgICAgaW5pdFNldHRpbmdzKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgUnVsZSBIYW1zdGVyXHJcbiAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJpaGFtc3RlclwiKSB8fCBjbXBTdHIocnVsZS5uYW1lLCBcIiFoYW1zdGVyXCIpKSB7XHJcblxyXG4gICAgICAgICAgICBhZGRTZXR0aW5ncyhydWxlLCBzZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICAvLyBJbml0IGN1cnJlbnQgU2V0dGluZ3NcclxuICAgICAgICAgICAgaW5pdFNldHRpbmdzKCk7XHJcblxyXG4gICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihydWxlLm5hbWUsIFwiZWxsaXBzaXNcIikgfHwgY21wU3RyKHJ1bGUubmFtZSwgXCJub3dyYXBcIikgfHxcclxuICAgICAgICAgICAgY21wU3RyKHJ1bGUubmFtZSwgXCJmb3JjZXdyYXBcIikgfHwgY21wU3RyKHJ1bGUubmFtZSwgXCJoeXBoZW5zXCIpIHx8IGNtcFN0cihydWxlLm5hbWUsIFwiYnJlYWstd29yZFwiKSkge1xyXG5cclxuICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gdG9DYW1lbENhc2UocnVsZS5uYW1lKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBkZWNscyA9IGhlbHBlcnNbcHJvcGVydHldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNtcFN0cihwcm9wZXJ0eSwgXCJoeXBoZW5zXCIpICYmIGNtcFN0cihydWxlLnBhcmFtcywgXCJ0cnVlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICBkZWNscyA9IGhlbHBlcnMuYnJlYWtXb3JkICsgZGVjbHM7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHByb3BlcnR5LCBcImVsbGlwc2lzXCIpICYmIGNtcFN0cihydWxlLnBhcmFtcywgXCJ0cnVlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICBkZWNscyA9IGhlbHBlcnMubm93cmFwICsgZGVjbHM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjbXBTdHIoc2V0dGluZ3MucHJvcGVydGllcywgXCJpbmxpbmVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaWRlY2xzID0gcG9zdGNzcy5wYXJzZShkZWNscyk7XHJcbiAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgaWRlY2xzKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGV4dGVuZE5hbWUgPSB0b0NhbWVsQ2FzZShwcm9wZXJ0eSArIHJ1bGUucGFyYW1zKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWV4dGVuZE5vZGVzLmhhc093blByb3BlcnR5KGV4dGVuZE5hbWUpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgZXh0ZW5kIGluZm9cclxuICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IHJ1bGUucGFyZW50LnNlbGVjdG9yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNsczogZGVjbHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHM6IFtydWxlLnBhcmVudF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXY6IHJ1bGUucHJldigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9BcHBlbmQgc2VsZWN0b3IgYW5kIHVwZGF0ZSBjb3VudGVyXHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0uc2VsZWN0b3IgPSBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5zZWxlY3RvciArIFwiLCBcIiArIHJ1bGUucGFyZW50LnNlbGVjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLnBhcmVudHMucHVzaChydWxlLnBhcmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0uY291bnQrKztcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJyZXNldFwiKSB8fCBjbXBTdHIocnVsZS5uYW1lLCBcIm5vcm1hbGl6ZVwiKVxyXG4gICAgICAgICAgICB8fCBjbXBTdHIocnVsZS5uYW1lLCBcInNhbml0aXplXCIpIHx8IGNtcFN0cihydWxlLm5hbWUsIFwiYm94LXNpemluZy1yZXNldFwiKSkge1xyXG5cclxuICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gdG9DYW1lbENhc2UocnVsZS5uYW1lKTtcclxuICAgICAgICAgICAgbGV0IHJ1bGVzID0gcG9zdGNzcy5wYXJzZShoZWxwZXJzW3Byb3BlcnR5XSk7XHJcbiAgICAgICAgICAgIHJ1bGVzLnNvdXJjZSA9IHJ1bGUuc291cmNlO1xyXG4gICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBydWxlcyk7XHJcbiAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcbiAgICAgICAgLy8gfSBlbHNlIGlmKGNtcFN0cihydWxlLm5hbWUsIFwicmh5dGhtXCIpKXtcclxuICAgICAgICAvLyAgICAgbGV0IFt3aWR0aCwgaGVpZ2h0LCBvdXRwdXRVbml0XSA9IHJ1bGUucGFyYW0uc3BsaXQoc3BhY2VTcGxpdFJlZ2V4cCk7XHJcbiAgICAgICAgLy8gICAgIGlmKCFvdXRwdXRVbml0KXtcclxuICAgICAgICAvLyAgICAgICAgIG91dHB1dFVuaXQgPSBzZXR0aW5ncy51bml0O1xyXG4gICAgICAgIC8vICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vICAgICAgICAgb3V0cHV0VW5pdCA9IFVOSVRbb3V0cHV0VW5pdF07XHJcbiAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAvLyAgICAgcmh5dGhtLnJoeXRobShoZWlnaHQsIGZvbnRTaXplLCBmYWxzZSwgb3V0cHV0VW5pdCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocnVsZS5uYW1lLCBcImJhc2VsaW5lXCIpKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IHJoeXRobS5saW5lSGVpZ2h0KHNldHRpbmdzLmZvbnRTaXplICsgXCJweFwiKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGJhc2VsaW5lIGZvbnQgc2l6ZVxyXG4gICAgICAgICAgICBsZXQgZm9udFNpemVEZWNsO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNldHRpbmdzLnB4QmFzZWxpbmUgfHwgKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuUFggJiYgIXNldHRpbmdzLmxlZ2FjeUJyb3dzZXJzKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvbnRTaXplRGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJmb250LXNpemVcIixcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc2V0dGluZ3MuZm9udFNpemUgKyBcInB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCByZWxhdGl2ZVNpemUgPSAxMDAgKiBzZXR0aW5ncy5mb250U2l6ZSAvIHNldHRpbmdzLmJyb3dzZXJGb250U2l6ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZURlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3A6IFwiZm9udC1zaXplXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZvcm1hdFZhbHVlKHJlbGF0aXZlU2l6ZSkgKyBcIiVcIixcclxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0RGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogbGluZUhlaWdodCxcclxuICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKGNtcFN0cihydWxlLnBhcmFtcywgXCJodG1sXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGh0bWxSdWxlID0gcG9zdGNzcy5ydWxlKHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCJodG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaHRtbFJ1bGUuYXBwZW5kKGZvbnRTaXplRGVjbCk7XHJcbiAgICAgICAgICAgICAgICBodG1sUnVsZS5hcHBlbmQobGluZUhlaWdodERlY2wpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGh0bWxSdWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5QWCAmJiBzZXR0aW5ncy5sZWdhY3lCcm93c2Vycykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhc3Rlcmlza0h0bWxSdWxlID0gcG9zdGNzcy5ydWxlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiKiBodG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBhc3Rlcmlza0h0bWxSdWxlLmFwcGVuZChsaW5lSGVpZ2h0RGVjbC5jbG9uZSgpKTtcclxuICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBhc3Rlcmlza0h0bWxSdWxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgbGluZUhlaWdodERlY2wpO1xyXG4gICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgZm9udFNpemVEZWNsKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5SRU0gJiYgc2V0dGluZ3MucmVtRmFsbGJhY2spIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKGxpbmVIZWlnaHREZWNsLCBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByaHl0aG0ucmVtRmFsbGJhY2sobGluZUhlaWdodCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihydWxlLm5hbWUsIFwicnVsZXJcIikpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBydWxlckljb25Qb3NpdGlvbiA9IHNldHRpbmdzLnJ1bGVySWNvblBvc2l0aW9uLnJlcGxhY2UoL1snXCJdL2csIFwiXCIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAyNCAyNCUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00xOCAyNGMtMC4zIDAtMC41NDgtMC4yNDYtMC41NDgtMC41NDZWMThjMC0wLjMgMC4yNDgtMC41NDYgMC41NDgtMC41NDZoNS40NTIgIEMyMy43NTQgMTcuNDU0IDI0IDE3LjcgMjQgMTh2NS40NTRjMCAwLjMtMC4yNDYgMC41NDYtMC41NDggMC41NDZIMTh6IE05LjI3MSAyNGMtMC4yOTggMC0wLjU0My0wLjI0Ni0wLjU0My0wLjU0NlYxOCAgYzAtMC4zIDAuMjQ1LTAuNTQ2IDAuNTQzLTAuNTQ2aDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ2IDAuNTQzIDAuNTQ2djUuNDU0YzAgMC4zLTAuMjQzIDAuNTQ2LTAuNTQzIDAuNTQ2SDkuMjcxeiBNMC41NDggMjQgIEMwLjI0NiAyNCAwIDIzLjc1NCAwIDIzLjQ1NFYxOGMwLTAuMyAwLjI0Ni0wLjU0NiAwLjU0OC0wLjU0Nkg2YzAuMzAyIDAgMC41NDggMC4yNDYgMC41NDggMC41NDZ2NS40NTRDNi41NDggMjMuNzU0IDYuMzAyIDI0IDYgMjQgIEgwLjU0OHogTTE4IDE1LjI3MWMtMC4zIDAtMC41NDgtMC4yNDQtMC41NDgtMC41NDJWOS4yNzJjMC0wLjI5OSAwLjI0OC0wLjU0NSAwLjU0OC0wLjU0NWg1LjQ1MkMyMy43NTQgOC43MjcgMjQgOC45NzMgMjQgOS4yNzIgIHY1LjQ1N2MwIDAuMjk4LTAuMjQ2IDAuNTQyLTAuNTQ4IDAuNTQySDE4eiBNOS4yNzEgMTUuMjcxYy0wLjI5OCAwLTAuNTQzLTAuMjQ0LTAuNTQzLTAuNTQyVjkuMjcyYzAtMC4yOTkgMC4yNDUtMC41NDUgMC41NDMtMC41NDUgIGg1LjQ1N2MwLjMgMCAwLjU0MyAwLjI0NiAwLjU0MyAwLjU0NXY1LjQ1N2MwIDAuMjk4LTAuMjQzIDAuNTQyLTAuNTQzIDAuNTQySDkuMjcxeiBNMC41NDggMTUuMjcxQzAuMjQ2IDE1LjI3MSAwIDE1LjAyNiAwIDE0LjcyOSAgVjkuMjcyYzAtMC4yOTkgMC4yNDYtMC41NDUgMC41NDgtMC41NDVINmMwLjMwMiAwIDAuNTQ4IDAuMjQ2IDAuNTQ4IDAuNTQ1djUuNDU3YzAgMC4yOTgtMC4yNDYgMC41NDItMC41NDggMC41NDJIMC41NDh6IE0xOCA2LjU0NSAgYy0wLjMgMC0wLjU0OC0wLjI0NS0wLjU0OC0wLjU0NVYwLjU0NUMxNy40NTIgMC4yNDUgMTcuNyAwIDE4IDBoNS40NTJDMjMuNzU0IDAgMjQgMC4yNDUgMjQgMC41NDVWNmMwIDAuMy0wLjI0NiAwLjU0NS0wLjU0OCAwLjU0NSAgSDE4eiBNOS4yNzEgNi41NDVDOC45NzQgNi41NDUgOC43MjkgNi4zIDguNzI5IDZWMC41NDVDOC43MjkgMC4yNDUgOC45NzQgMCA5LjI3MSAwaDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ1IDAuNTQzIDAuNTQ1VjYgIGMwIDAuMy0wLjI0MyAwLjU0NS0wLjU0MyAwLjU0NUg5LjI3MXogTTAuNTQ4IDYuNTQ1QzAuMjQ2IDYuNTQ1IDAgNi4zIDAgNlYwLjU0NUMwIDAuMjQ1IDAuMjQ2IDAgMC41NDggMEg2ICBjMC4zMDIgMCAwLjU0OCAwLjI0NSAwLjU0OCAwLjU0NVY2YzAgMC4zLTAuMjQ2IDAuNTQ1LTAuNTQ4IDAuNTQ1SDAuNTQ4eiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG4gICAgICAgICAgICAvLyBsZXQgc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGY4LCUzQ3N2ZyB4bWxucyUzRCUyN2h0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyNyB2aWV3Qm94JTNEJTI3MCAwIDI0IDI0JTI3JTNFJTNDcGF0aCBmaWxsJTNEJTI3e2NvbG9yfSUyNyBkJTNEJTI3TTAsNmMwLDAuMzAxLDAuMjQ2LDAuNTQ1LDAuNTQ5LDAuNTQ1aDIyLjkwNkMyMy43NTYsNi41NDUsMjQsNi4zMDEsMjQsNlYyLjczYzAtMC4zMDUtMC4yNDQtMC41NDktMC41NDUtMC41NDlIMC41NDkgIEMwLjI0NiwyLjE4MiwwLDIuNDI2LDAsMi43M1Y2eiBNMCwxMy42MzdjMCwwLjI5NywwLjI0NiwwLjU0NSwwLjU0OSwwLjU0NWgyMi45MDZjMC4zMDEsMCwwLjU0NS0wLjI0OCwwLjU0NS0wLjU0NXYtMy4yNzMgIGMwLTAuMjk3LTAuMjQ0LTAuNTQ1LTAuNTQ1LTAuNTQ1SDAuNTQ5QzAuMjQ2LDkuODE4LDAsMTAuMDY2LDAsMTAuMzYzVjEzLjYzN3ogTTAsMjEuMjdjMCwwLjMwNSwwLjI0NiwwLjU0OSwwLjU0OSwwLjU0OWgyMi45MDYgIGMwLjMwMSwwLDAuNTQ1LTAuMjQ0LDAuNTQ1LTAuNTQ5VjE4YzAtMC4zMDEtMC4yNDQtMC41NDUtMC41NDUtMC41NDVIMC41NDlDMC4yNDYsMTcuNDU1LDAsMTcuNjk5LDAsMThWMjEuMjd6JTI3JTJGJTNFJTNDJTJGc3ZnJTNFXCI7XHJcblxyXG4gICAgICAgICAgICBsZXQgZ3RoaWNrbmVzcyA9IHNldHRpbmdzLnJ1bGVyVGhpY2tuZXNzO1xyXG5cclxuICAgICAgICAgICAgbGV0IGJhY2tncm91bmQgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNtcFN0cihzZXR0aW5ncy5ydWxlckJhY2tncm91bmQsIFwicG5nXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGltYWdlSGVpZ2h0ID0gc2V0dGluZ3MubGluZUhlaWdodCA+PSBzZXR0aW5ncy5mb250U2l6ZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MubGluZUhlaWdodCA6XHJcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5yb3VuZCgoc2V0dGluZ3MubGluZUhlaWdodCAqIHNldHRpbmdzLmZvbnRTaXplKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHBhdHRlcm4gPSBzZXR0aW5ncy5ydWxlclBhdHRlcm4uc3BsaXQoc3BhY2VTcGxpdFJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaW1hZ2UucnVsZXJNYXRyaXgoaW1hZ2VIZWlnaHQsIHNldHRpbmdzLnJ1bGVyQ29sb3IsIHBhdHRlcm4sIHNldHRpbmdzLnJ1bGVyVGhpY2tuZXNzLCBzZXR0aW5ncy5ydWxlclNjYWxlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWNtcFN0cihzZXR0aW5ncy5ydWxlck91dHB1dCwgXCJiYXNlNjRcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZS5nZXRGaWxlKHNldHRpbmdzLnJ1bGVyT3V0cHV0KTtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kID0gXCJcXG4gIGJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiLi4vXCIgKyBzZXR0aW5ncy5ydWxlck91dHB1dCArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlxcbiAgYmFja2dyb3VuZC1wb3NpdGlvbjogbGVmdCB0b3A7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlxcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IHJlcGVhdDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxuICBiYWNrZ3JvdW5kLXNpemU6IFwiICsgcGF0dGVybi5sZW5ndGggKyBcInB4IFwiICsgaW1hZ2VIZWlnaHQgKyBcInB4O1wiO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiXFxuICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxcIiArIGltYWdlLmdldEJhc2U2NCgpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxuICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiBsZWZ0IHRvcDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogcmVwZWF0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtc2l6ZTogXCIgKyBwYXR0ZXJuLmxlbmd0aCArIFwicHggXCIgKyBpbWFnZUhlaWdodCArIFwicHg7XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICBndGhpY2tuZXNzID0gZ3RoaWNrbmVzcyAqIDI7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodCA9IChzZXR0aW5ncy51bml0ID09PSBVTklULlZXKVxyXG4gICAgICAgICAgICAgICAgICAgID8gdndWYWx1ZShzZXR0aW5ncy5saW5lSGVpZ2h0TSwgc2V0dGluZ3MubGluZUhlaWdodEIsIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgOiAoc2V0dGluZ3MubGluZUhlaWdodCA+PSBzZXR0aW5ncy5mb250U2l6ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBzZXR0aW5ncy5saW5lSGVpZ2h0ICsgdW5pdE5hbWVbVU5JVC5QWF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBzZXR0aW5ncy5saW5lSGVpZ2h0ICsgdW5pdE5hbWVbc2V0dGluZ3MudW5pdF07XHJcblxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiXFxuICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MucnVsZXJDb2xvciArIFwiIFwiICsgZ3RoaWNrbmVzcyArIFwiJSwgdHJhbnNwYXJlbnQgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIGd0aGlja25lc3MgKyBcIiUpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgYmFja2dyb3VuZC1zaXplOiAxMDAlIFwiICsgbGluZUhlaWdodCArIFwiO1wiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgcnVsZXIgPSBcIlxcbiAgcG9zaXRpb246IGFic29sdXRlO1wiICtcclxuICAgICAgICAgICAgICAgIFwiXFxuICBsZWZ0OiAwO1wiICtcclxuICAgICAgICAgICAgICAgIFwiXFxuICB0b3A6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgXCJcXG4gIG1hcmdpbjogMDtcIiArXHJcbiAgICAgICAgICAgICAgICBcIlxcbiAgcGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICBcIlxcbiAgd2lkdGg6IDEwMCU7XCIgK1xyXG4gICAgICAgICAgICAgICAgXCJcXG4gIGhlaWdodDogMTAwJTtcIiArXHJcbiAgICAgICAgICAgICAgICBcIlxcbiAgei1pbmRleDogOTkwMDtcIiArXHJcbiAgICAgICAgICAgICAgICBcIlxcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XCIgKyBiYWNrZ3JvdW5kO1xyXG5cclxuICAgICAgICAgICAgbGV0IGljb25TaXplID0gc2V0dGluZ3MucnVsZXJJY29uU2l6ZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBbc3R5bGUsIHJ1bGVyQ2xhc3NdID0gc2V0dGluZ3MucnVsZXJTdHlsZS5zcGxpdChzcGFjZVNwbGl0UmVnZXhwKTtcclxuICAgICAgICAgICAgbGV0IFtjb2xvciwgaG92ZXJDb2xvcl0gPSBzZXR0aW5ncy5ydWxlckljb25Db2xvcnMuc3BsaXQoc3BhY2VTcGxpdFJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgcnVsZXJSdWxlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChjbXBTdHIoc3R5bGUsIFwic3dpdGNoXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcnVsZXJSdWxlID0gcG9zdGNzcy5wYXJzZShcIlxcbi5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGRpc3BsYXk6IG5vbmU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGVyICtcclxuICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG5pbnB1dFtpZD1cXFwiXCIgKyBydWxlckNsYXNzICsgXCJcXFwiXSB7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBkaXNwbGF5Om5vbmU7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbmlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdICsgbGFiZWwge1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgei1pbmRleDogOTk5OTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZXJJY29uUG9zaXRpb24gK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBwYWRkaW5nOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgd2lkdGg6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGhlaWdodDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgY3Vyc29yOiBwb2ludGVyO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgc3ZnLnJlcGxhY2UoXCJ7Y29sb3J9XCIsIGVzY2FwZShjb2xvcikpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl06Y2hlY2tlZCArIGxhYmVsLCBpbnB1dFtpZD1cXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdOmhvdmVyICsgbGFiZWwge1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJcIiArIHN2Zy5yZXBsYWNlKFwie2NvbG9yfVwiLCBlc2NhcGUoaG92ZXJDb2xvcikpICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuaW5wdXRbaWQ9XFxcIlwiICtcclxuICAgICAgICAgICAgICAgICAgICBydWxlckNsYXNzICsgXCJcXFwiXTpjaGVja2VkIH4gLlwiICsgcnVsZXJDbGFzcyArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgZGlzcGxheTogYmxvY2s7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwifVwiKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHN0eWxlLCBcImhvdmVyXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcnVsZXJSdWxlID0gcG9zdGNzcy5wYXJzZShcIlxcbi5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZXJJY29uUG9zaXRpb24gK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBwYWRkaW5nOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgd2lkdGg6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGhlaWdodDogXCIgKyBpY29uU2l6ZSArIFwiO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJcIiArIHN2Zy5yZXBsYWNlKFwie2NvbG9yfVwiLCBlc2NhcGUoY29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLWltYWdlIDAuNXMgZWFzZS1pbi1vdXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICBcIi5cIiArIHJ1bGVyQ2xhc3MgKyBcIjpob3ZlclwiICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBjdXJzb3I6IHBvaW50ZXI7XCIgKyBydWxlciArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ9XCIpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIoc3R5bGUsIFwiYWx3YXlzXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcnVsZXJSdWxlID0gcG9zdGNzcy5wYXJzZShcIlxcbi5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcXG5cIiArIHJ1bGVyICsgXCJ9XFxuXCIpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHJ1bGVyUnVsZSkge1xyXG4gICAgICAgICAgICAgICAgcnVsZXJSdWxlLnNvdXJjZSA9IHJ1bGUuc291cmNlO1xyXG4gICAgICAgICAgICAgICAgd2Fsa0RlY2xzKHJ1bGVyUnVsZSk7XHJcbiAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgcnVsZXJSdWxlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gV2FsayBpbiBtZWRpYSBxdWVyaWVzXHJcbiAgICAgICAgcnVsZS53YWxrKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYoY21wU3RyKGNoaWxkLnR5cGUsIFwiYXRydWxlXCIpKXtcclxuICAgICAgICAgICAgICAgIHdhbGtBdFJ1bGUoY2hpbGQpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihjaGlsZC50eXBlLCBcInJ1bGVcIikpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdhbGsgZGVjbHMgaW4gYXRydWxlXHJcbiAgICAgICAgICAgICAgICB3YWxrRGVjbHMoY2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB3YWxrRGVjbHMgPSAobm9kZSkgPT4ge1xyXG5cclxuICAgICAgICBsZXQgcnVsZUZvbnRTaXplO1xyXG5cclxuICAgICAgICBub2RlLndhbGtEZWNscyhkZWNsID0+IHtcclxuXHJcbiAgICAgICAgICAgIGxldCBmb3VuZDtcclxuXHJcbiAgICAgICAgICAgIGxldCBmaW5kUnVsZUZvbnRTaXplID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFydWxlRm9udFNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC53YWxrRGVjbHMoZnNkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNtcFN0cihmc2RlY2wucHJvcCwgXCJmb250LXNpemVcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVGb250U2l6ZSA9IGZzZGVjbC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlY2wudmFsdWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIFZhcmlhYmxlcyB3aXRoIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2goc2V0dGluZ3NSZWdleHApKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2YXJpYWJsZSA9IHRvQ2FtZWxDYXNlKGZvdW5kWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvdW5kWzBdLCBzZXR0aW5nc1t2YXJpYWJsZV0pO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIEZvbnQgU2l6ZVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2goZm9udFNpemVSZWdleHApKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgW2ZvbnRTaXplLCBzaXplVW5pdF0gPSBmb3VuZFsyXS5zcGxpdChcIiRcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHNpemVVbml0ID0gKHNpemVVbml0KSA/IGdldFVuaXQoc2l6ZVVuaXQpIDogc2V0dGluZ3MudW5pdDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNpemUgPSBmb250U2l6ZXMuZ2V0U2l6ZShmb250U2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV3JpdGUgZm9udCBzaXplXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoc2l6ZVVuaXQgPT09IFVOSVQuVlcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZGVjbC52YWx1ZS5tYXRjaChyaHl0aG1SZWdleHApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gc2l6ZS5yZWwgKyBcInJlbVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSB2d1ZhbHVlKHNldHRpbmdzLmZvbnRTaXplTSwgc2V0dGluZ3MuZm9udFNpemVCLCBzaXplLnJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2F2ZSByZWxhdGl2ZSBmb250LXNpemUgaW4gY3VycmVudCBydWxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNtcFN0cihkZWNsLnByb3AsIFwiZm9udC1zaXplXCIpIHx8IGNtcFN0cihkZWNsLnByb3AsIFwiYWRqdXN0LWZvbnQtc2l6ZVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlRm9udFNpemUgPSBzaXplLnJlbCArIFwicmVtXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSAoc2l6ZVVuaXQgPT09IFVOSVQuUFgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZvcm1hdEludChzaXplLnB4KSArIHVuaXROYW1lW3NpemVVbml0XVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBmb3JtYXRWYWx1ZShzaXplLnJlbCkgKyB1bml0TmFtZVtzaXplVW5pdF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb3VuZFswXSwgZm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGp1c3QgRm9udCBTaXplXHJcbiAgICAgICAgICAgICAgICBpZiAoY21wU3RyKGRlY2wucHJvcCwgXCJhZGp1c3QtZm9udC1zaXplXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBbZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemVdID0gKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZGVjbC52YWx1ZS5zcGxpdChjb21tYVNwbGl0UmVnZXhwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGRlY2wudmFsdWUuc3BsaXQoc3BhY2VTcGxpdFJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZVVuaXQgPSBnZXRVbml0KGZvbnRTaXplKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGZvbnRTaXplVW5pdCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gcmh5dGhtLmNvbnZlcnQoZm9udFNpemUsIGZvbnRTaXplVW5pdCwgVU5JVC5SRU0sIGJhc2VGb250U2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0ID0gcmh5dGhtLmxpbmVIZWlnaHQoZm9udFNpemUgKyBcInJlbVwiLCBsaW5lcywgYmFzZUZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHZ3VmFsdWUoc2V0dGluZ3MuZm9udFNpemVNLCBzZXR0aW5ncy5mb250U2l6ZUIsIGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodCA9IHJoeXRobS5saW5lSGVpZ2h0KHJ1bGVGb250U2l6ZSwgbGluZXMsIGJhc2VGb250U2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgPSB2d1ZhbHVlKHNldHRpbmdzLmxpbmVIZWlnaHRNLCBzZXR0aW5ncy5saW5lSGVpZ2h0QiwgbGluZUhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHJoeXRobS5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIG51bGwsIGJhc2VGb250U2l6ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgdW5pdE5hbWVbc2V0dGluZ3MudW5pdF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgPSByaHl0aG0ubGluZUhlaWdodChmb250U2l6ZSwgbGluZXMsIGJhc2VGb250U2l6ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHREZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbGluZUhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBkZWNsLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZm9udFNpemU7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC5wcm9wID0gXCJmb250LXNpemVcIjtcclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC5pbnNlcnRBZnRlcihkZWNsLCBsaW5lSGVpZ2h0RGVjbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gbGluZUhlaWdodCwgc3BhY2luZywgbGVhZGluZywgcmh5dGhtLCAhcmh5dGhtXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoKGZvdW5kID0gZGVjbC52YWx1ZS5tYXRjaChyaHl0aG1SZWdleHApKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBoYXNNaW51cyA9IHNjbXBTdHIoZm91bmRbMV0sIFwiLVwiKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHkgPSBmb3VuZFszXTsgLy8gbGluZUhlaWdodCwgc3BhY2luZywgbGVhZGluZywgcmh5dGhtLCAhcmh5dGhtLCBiYXNlXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcmFtZXRlcnMgPSBmb3VuZFs0XS5zcGxpdChjb21tYVNwbGl0UmVnZXhwKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcmV0ID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSBpbiBwYXJhbWV0ZXJzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgW3ZhbHVlLCBmb250U2l6ZV0gPSBwYXJhbWV0ZXJzW2ldLnNwbGl0KHNwYWNlU3BsaXRSZWdleHApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFmb250U2l6ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoIXJ1bGVGb250U2l6ZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluZFJ1bGVGb250U2l6ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSBydWxlRm9udFNpemU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbXBTdHIocHJvcGVydHksIFwiYmFzZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChmb3VuZFsyXSArIHZ3VmFsdWUoc2V0dGluZ3MuZm9udFNpemVNLCBzZXR0aW5ncy5mb250U2l6ZUIsIHZhbHVlLCBoYXNNaW51cykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChmb3VuZFsxXSArIGZvdW5kWzJdICsgcmh5dGhtLmJhc2UodmFsdWUsIGZvbnRTaXplKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHByb3BlcnR5LCBcImxpbmVoZWlnaHRcIikgfHwgY21wU3RyKHByb3BlcnR5LCBcImxoZWlnaHRcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBydmFsdWUgPSByaHl0aG0ubGluZUhlaWdodChmb250U2l6ZSwgdmFsdWUsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydmFsdWUgPSB2d1ZhbHVlKHNldHRpbmdzLmxpbmVIZWlnaHRNLCBzZXR0aW5ncy5saW5lSGVpZ2h0QiwgcnZhbHVlLCBoYXNNaW51cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goZm91bmRbMl0gKyBydmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChmb3VuZFsxXSArIGZvdW5kWzJdICsgcnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocHJvcGVydHksIFwic3BhY2luZ1wiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJ2YWx1ZSA9IHJoeXRobS5saW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSwgbnVsbCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5WVykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ2YWx1ZSA9IHZ3VmFsdWUoc2V0dGluZ3MubGluZUhlaWdodE0sIHNldHRpbmdzLmxpbmVIZWlnaHRCLCBydmFsdWUsIGhhc01pbnVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChmb3VuZFsyXSArIHJ2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGZvdW5kWzFdICsgZm91bmRbMl0gKyBydmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihwcm9wZXJ0eSwgXCJsZWFkaW5nXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJ2YWx1ZSA9IHJoeXRobS5sZWFkaW5nKHZhbHVlLCBmb250U2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5WVykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ2YWx1ZSA9IHZ3VmFsdWUoc2V0dGluZ3MubGluZUhlaWdodE0gKiBydmFsdWUgLSBzZXR0aW5ncy5mb250U2l6ZU0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmxpbmVIZWlnaHRCICogcnZhbHVlIC0gc2V0dGluZ3MuZm9udFNpemVCLCB2YWx1ZSwgaGFzTWludXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGZvdW5kWzJdICsgcnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goZm91bmRbMV0gKyBmb3VuZFsyXSArIHJ2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHByb3BlcnR5LCBcIiFyaHl0aG1cIikgfHwgY21wU3RyKHByb3BlcnR5LCBcImlyaHl0aG1cIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgW2luVmFsdWUsIG91dHB1dFVuaXRdID0gdmFsdWUuc3BsaXQoXCIkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0VW5pdCA9IFVOSVRbb3V0cHV0VW5pdF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcnZhbHVlID0gcmh5dGhtLnJoeXRobShpblZhbHVlLCBmb250U2l6ZSwgdHJ1ZSwgb3V0cHV0VW5pdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5WVykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ2YWx1ZSA9IHZ3VmFsdWUoc2V0dGluZ3MubGluZUhlaWdodE0sIHNldHRpbmdzLmxpbmVIZWlnaHRCLCBydmFsdWUsIGhhc01pbnVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChmb3VuZFsyXSArIHJ2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGZvdW5kWzFdICsgZm91bmRbMl0gKyBydmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocHJvcGVydHksIFwicmh5dGhtXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgW2luVmFsdWUsIG91dHB1dFVuaXRdID0gdmFsdWUuc3BsaXQoXCIkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0VW5pdCA9IFVOSVRbb3V0cHV0VW5pdF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcnZhbHVlID0gcmh5dGhtLnJoeXRobShpblZhbHVlLCBmb250U2l6ZSwgZmFsc2UsIG91dHB1dFVuaXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydmFsdWUgPSB2d1ZhbHVlKHNldHRpbmdzLmxpbmVIZWlnaHRNLCBzZXR0aW5ncy5saW5lSGVpZ2h0QiwgcnZhbHVlLCBoYXNNaW51cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goZm91bmRbMl0gKyBydmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChmb3VuZFsxXSArIGZvdW5kWzJdICsgcnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb3VuZFswXSwgcmV0LmpvaW4oXCIgXCIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvL3JlbSBmYWxsYmFja1xyXG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnJlbUZhbGxiYWNrICYmIGRlY2wudmFsdWUubWF0Y2gocmVtUmVnZXhwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wucGFyZW50Lmluc2VydEJlZm9yZShkZWNsLCBkZWNsLmNsb25lKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJoeXRobS5yZW1GYWxsYmFjayhkZWNsLnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGlmIChzZXR0aW5ncy5yZW1GYWxsYmFjayAmJiBpc0hhcyhkZWNsLnZhbHVlLCBcInJlbVwiKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGxldCB2YWx1ZXMgPSBkZWNsLnZhbHVlLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICAgICAgICAgIC8vICAgICBmb3IgKGxldCBpID0gMCwgdnNpemUgPSB2YWx1ZXMubGVuZ3RoOyBpIDwgdnNpemU7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBpZiAoaXNIYXModmFsdWVzW2ldLCBcInJlbVwiKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgdmFsdWVzW2ldID0gcmh5dGhtQ2FsY3VsYXRvci5jb252ZXJ0KHZhbHVlc1tpXSwgVU5JVC5SRU0sIFVOSVQuUFgpICsgXCJweFwiO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gICAgIGRlY2wucGFyZW50Lmluc2VydEJlZm9yZShkZWNsLCBkZWNsLmNsb25lKHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgdmFsdWU6IHZhbHVlcy5qb2luKFwiIFwiKSxcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgc291cmNlOiBkZWNsLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgLy8gICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gKGNzcykgPT4ge1xyXG5cclxuICAgICAgICAvLyBAY29weSBhbmQgQHBhc3RlIG5vZGVzO1xyXG4gICAgICAgIGxldCBjb3B5UGFzdGVOb2RlID0ge307XHJcbiAgICAgICAgLy8gTWFrZSBjb3B5IHBhc3RlIGNzcyBjb2RlXHJcbiAgICAgICAgY3NzLndhbGtBdFJ1bGVzKHJ1bGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJjb3B5XCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0b0NhbWVsQ2FzZShydWxlLnBhcmFtcyk7XHJcbiAgICAgICAgICAgICAgICBjb3B5UGFzdGVOb2RlW25hbWVdID0gcnVsZTtcclxuICAgICAgICAgICAgICAgIC8vcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJwYXN0ZVwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdG9DYW1lbENhc2UocnVsZS5wYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVzID0gY29weVBhc3RlTm9kZVtuYW1lXS5ub2RlcztcclxuICAgICAgICAgICAgICAgIGxldCBsZW4gPSBub2Rlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBub2Rlc1tpXS5jbG9uZSh7c291cmNlOiBydWxlLnNvdXJjZX0pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGNvcHlQYXN0ZU5vZGUpIHtcclxuICAgICAgICAgICAgaWYgKGNvcHlQYXN0ZU5vZGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgY29weVBhc3RlTm9kZVtrZXldLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb3B5UGFzdGVOb2RlID0gbnVsbDtcclxuICAgICAgICAvLyBPdGhlciBXb3JrXHJcbiAgICAgICAgY3NzLndhbGsobm9kZSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGlmIChsYXN0RmlsZSAhPSBub2RlLnNvdXJjZS5pbnB1dC5maWxlKSB7XHJcbiAgICAgICAgICAgIC8vIFx0bGFzdEZpbGUgPSBub2RlLnNvdXJjZS5pbnB1dC5maWxlO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY21wU3RyKG5vZGUudHlwZSwgXCJhdHJ1bGVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB3YWxrQXRSdWxlKG5vZGUpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIobm9kZS50eXBlLCBcInJ1bGVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBXYWxrIGRlY2xzIGluIHJ1bGVcclxuICAgICAgICAgICAgICAgIHdhbGtEZWNscyhub2RlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2V0dGluZ3MucmVtb3ZlQ29tbWVudHMgJiYgY21wU3RyKG5vZGUudHlwZSwgXCJjb21tZW50XCIpKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBBcHBlbmQgRXh0ZW5kcyB0byBDU1NcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZXh0ZW5kTm9kZXMpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBub2RlID0gZXh0ZW5kTm9kZXNba2V5XTtcclxuXHJcbiAgICAgICAgICAgIGlmIChub2RlLmNvdW50ID4gMSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJ1bGUgPSBwb3N0Y3NzLnBhcnNlKG5vZGUuc2VsZWN0b3IgKyBcIiB7XCIgKyBub2RlLmRlY2xzICsgXCJ9XCIpO1xyXG4gICAgICAgICAgICAgICAgcnVsZS5zb3VyY2UgPSBub2RlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIG5vZGUucGFyZW50c1swXS5wYXJlbnQuaW5zZXJ0QmVmb3JlKG5vZGUucGFyZW50c1swXSwgcnVsZSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlY2xzID0gcG9zdGNzcy5wYXJzZShub2RlLmRlY2xzKTtcclxuICAgICAgICAgICAgICAgIGRlY2xzLnNvdXJjZSA9IG5vZGUuc291cmNlO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5wYXJlbnRzWzBdLmluc2VydEFmdGVyKG5vZGUucHJldiwgZGVjbHMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdW51c2VkIHBhcmVudCBub2Rlcy5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSBpbiBub2RlLnBhcmVudHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLnBhcmVudHMuaGFzT3duUHJvcGVydHkoaSkgJiYgbm9kZS5wYXJlbnRzW2ldLm5vZGVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUucGFyZW50c1tpXS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgZXh0ZW5kTm9kZXMgPSB7fTtcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGhhbXN0ZXI7Il19
