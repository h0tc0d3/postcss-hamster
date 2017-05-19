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

        useGlobal: false,
        globalRatio: 0,

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

        // Save font ratio with global settings
        if (settings.useGlobal) {
            settings.globalRatio = settings.fontSize / globalSettings.fontSize;
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
                        if (settings.useGlobal && (settings.unit === _Helpers.UNIT.EM || settings.unit === _Helpers.UNIT.REM)) {
                            fontSize = (0, _Helpers.formatValue)(size.rel * settings.globalRatio) + _Helpers.unitName[sizeUnit];
                        } else {
                            fontSize = sizeUnit === _Helpers.UNIT.PX ? (0, _Helpers.formatInt)(size.px) + "px" : (0, _Helpers.formatValue)(size.rel) + _Helpers.unitName[sizeUnit];
                        }
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

                        fontSize = rhythm.convert(fontSize, fontSizeUnit, null, baseFontSize);

                        lineHeight = rhythm.lineHeight(fontSize + _Helpers.unitName[settings.unit], lines, baseFontSize);

                        if (settings.useGlobal && (settings.unit === _Helpers.UNIT.EM || settings.unit === _Helpers.UNIT.REM)) {
                            fontSize = fontSize * settings.globalRatio;
                        }

                        if (settings.unit === _Helpers.UNIT.PX) {
                            fontSize = (0, _Helpers.formatInt)(fontSize) + "px";
                        } else {
                            fontSize = (0, _Helpers.formatValue)(fontSize) + _Helpers.unitName[settings.unit];
                        }
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhlbHBlcnMiLCJyZXNldCIsInJlYWRGaWxlU3luYyIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJub3JtYWxpemUiLCJzYW5pdGl6ZSIsImJveFNpemluZ1Jlc2V0Iiwibm93cmFwIiwiZm9yY2V3cmFwIiwiZWxsaXBzaXMiLCJoeXBoZW5zIiwiYnJlYWtXb3JkIiwiZm9udFNpemVSZWdleHAiLCJyaHl0aG1SZWdleHAiLCJjb21tYVNwbGl0UmVnZXhwIiwic3BhY2VTcGxpdFJlZ2V4cCIsInZ3VmFsdWUiLCJNIiwiQiIsInZhbHVlIiwiaGFzTWludXMiLCJyZXQiLCJyZXBsYWNlIiwiYWRkU2V0dGluZ3MiLCJydWxlIiwic2V0dGluZ3MiLCJ3YWxrRGVjbHMiLCJwcm9wIiwiZGVjbCIsInVuaXQiLCJwYXJzZUZsb2F0IiwicGFyc2VJbnQiLCJoYW1zdGVyIiwib3B0aW9ucyIsImdsb2JhbFNldHRpbmdzIiwiZm9udFNpemUiLCJ0b0ZvbnRTaXplIiwiZm9udFNpemVNIiwiZm9udFNpemVCIiwibGluZUhlaWdodCIsImxpbmVIZWlnaHRSZWwiLCJsaW5lSGVpZ2h0UHgiLCJsaW5lSGVpZ2h0TSIsImxpbmVIZWlnaHRCIiwidG9MaW5lSGVpZ2h0IiwidG9MaW5lSGVpZ2h0UHgiLCJ0b0xpbmVIZWlnaHRSZWwiLCJ2aWV3cG9ydCIsInVzZUdsb2JhbCIsImdsb2JhbFJhdGlvIiwiRU0iLCJweEZhbGxiYWNrIiwicmVtRmFsbGJhY2siLCJweEJhc2VsaW5lIiwiZm9udFJhdGlvIiwicHJvcGVydGllcyIsIm1pbkxpbmVQYWRkaW5nIiwicm91bmRUb0hhbGZMaW5lIiwicnVsZXIiLCJydWxlclN0eWxlIiwicnVsZXJJY29uUG9zaXRpb24iLCJydWxlckljb25Db2xvcnMiLCJydWxlckljb25TaXplIiwicnVsZXJDb2xvciIsInJ1bGVyVGhpY2tuZXNzIiwicnVsZXJCYWNrZ3JvdW5kIiwicnVsZXJPdXRwdXQiLCJydWxlclBhdHRlcm4iLCJydWxlclNjYWxlIiwiYnJvd3NlckZvbnRTaXplIiwibGVnYWN5QnJvd3NlcnMiLCJyZW1vdmVDb21tZW50cyIsImZvbnRTaXplcyIsInRvTG93ZXJDYXNlS2V5cyIsImJhY2tTZXR0aW5ncyIsInNldHRpbmdzUmVnZXhwIiwiY3VycmVudEZvbnRTaXplcyIsInJoeXRobSIsImltYWdlIiwiZXh0ZW5kTm9kZXMiLCJpbml0U2V0dGluZ3MiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsInRvTG93ZXJDYXNlIiwiUFgiLCJNYXRoIiwicm91bmQiLCJWVyIsInZpZXciLCJzcGxpdCIsImZyb20iLCJ0byIsInZpZXdEaWZmIiwiYWRkRm9udFNpemVzIiwic2V0dGluZ3NLZXlzIiwiT2JqZWN0Iiwia2V5cyIsImpvaW4iLCJzZXR0aW5nc0tleXNTdHJpbmciLCJSZWdFeHAiLCJ3YWxrQXRSdWxlIiwibmFtZSIsInBhcmFtcyIsInJlbW92ZSIsInByb3BlcnR5IiwiZGVjbHMiLCJpZGVjbHMiLCJwYXJzZSIsInBhcmVudCIsImluc2VydEJlZm9yZSIsImV4dGVuZE5hbWUiLCJzZWxlY3RvciIsInBhcmVudHMiLCJwcmV2Iiwic291cmNlIiwiY291bnQiLCJwdXNoIiwicnVsZXMiLCJpbnNlcnRBZnRlciIsImZvbnRTaXplRGVjbCIsInJlbGF0aXZlU2l6ZSIsImxpbmVIZWlnaHREZWNsIiwiaHRtbFJ1bGUiLCJhcHBlbmQiLCJhc3Rlcmlza0h0bWxSdWxlIiwiY2xvbmUiLCJSRU0iLCJzdmciLCJndGhpY2tuZXNzIiwiYmFja2dyb3VuZCIsImltYWdlSGVpZ2h0IiwicGF0dGVybiIsInJ1bGVyTWF0cml4IiwiZ2V0RmlsZSIsImxlbmd0aCIsImdldEJhc2U2NCIsImljb25TaXplIiwic3R5bGUiLCJydWxlckNsYXNzIiwiY29sb3IiLCJob3ZlckNvbG9yIiwicnVsZXJSdWxlIiwiZXNjYXBlIiwid2FsayIsImNoaWxkIiwidHlwZSIsIm5vZGUiLCJydWxlRm9udFNpemUiLCJmb3VuZCIsImZpbmRSdWxlRm9udFNpemUiLCJmc2RlY2wiLCJtYXRjaCIsInZhcmlhYmxlIiwic2l6ZVVuaXQiLCJzaXplIiwiZ2V0U2l6ZSIsInJlbCIsInB4IiwibGluZXMiLCJiYXNlRm9udFNpemUiLCJmb250U2l6ZVVuaXQiLCJjb252ZXJ0IiwicGFyYW1ldGVycyIsImkiLCJiYXNlIiwicnZhbHVlIiwibGVhZGluZyIsImluVmFsdWUiLCJvdXRwdXRVbml0IiwiY3NzIiwiY29weVBhc3RlTm9kZSIsIndhbGtBdFJ1bGVzIiwibm9kZXMiLCJsZW4iXSwibWFwcGluZ3MiOiI7Ozs7QUFZQTs7OztBQUVBOztBQWNBOzs7O0FBRUE7Ozs7QUFHQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUNBOztBQUVBLElBQU1BLFVBQVU7O0FBRVpDLFdBQU8sYUFBR0MsWUFBSCxDQUFnQixlQUFLQyxPQUFMLENBQWFDLFNBQWIsRUFBd0Isc0JBQXhCLENBQWhCLEVBQWlFLE1BQWpFLENBRks7O0FBSVpDLGVBQVcsYUFBR0gsWUFBSCxDQUFnQixlQUFLQyxPQUFMLENBQWFDLFNBQWIsRUFBd0IsMEJBQXhCLENBQWhCLEVBQXFFLE1BQXJFLENBSkM7O0FBTVpFLGNBQVUsYUFBR0osWUFBSCxDQUFnQixlQUFLQyxPQUFMLENBQWFDLFNBQWIsRUFBd0IseUJBQXhCLENBQWhCLEVBQW9FLE1BQXBFLENBTkU7O0FBUVpHLGlIQVJZOztBQWVaQyxZQUFRLDRCQWZJOztBQWlCWkMsc0hBakJZOztBQXNCWkMsbUVBdEJZOztBQXlCWkMsNkRBekJZOztBQTRCWkMsZUFBVztBQUFYO0FBNUJZLENBQWhCOztBQWtDQTs7QUExQ0E7O0FBL0JBOzs7Ozs7Ozs7Ozs7QUEwRUEsSUFBTUMsaUJBQWlCLHFDQUF2Qjs7QUFFQTtBQUNBLElBQU1DLGVBQWUscUZBQXJCOztBQUVBO0FBQ0EsSUFBTUMsbUJBQW1CLFNBQXpCOztBQUVBO0FBQ0EsSUFBTUMsbUJBQW1CLEtBQXpCOztBQUVBOzs7Ozs7OztBQVFBLFNBQVNDLE9BQVQsQ0FBaUJDLENBQWpCLEVB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Q0FBYixDQUFwQyxFQUFxRHhGLElBQXJEO0FBRUgsYUFMRCxNQUtPO0FBQ0gsb0JBQUlpRixRQUFRLGtCQUFRRSxLQUFSLENBQWN1QyxLQUFLekMsS0FBbkIsQ0FBWjtBQUNBQSxzQkFBTVMsTUFBTixHQUFlZ0MsS0FBS2hDLE1BQXBCO0FBQ0FnQyxxQkFBS2xDLE9BQUwsQ0FBYSxDQUFiLEVBQWdCTSxXQUFoQixDQUE0QjRCLEtBQUtqQyxJQUFqQyxFQUF1Q1IsS0FBdkM7QUFDSDs7QUFFRDtBQUNBLGlCQUFLLElBQUkwRCxDQUFULElBQWNqQixLQUFLbEMsT0FBbkIsRUFBNEI7QUFDeEIsb0JBQUlrQyxLQUFLbEMsT0FBTCxDQUFhOUIsY0FBYixDQUE0QmlGLENBQTVCLEtBQWtDakIsS0FBS2xDLE9BQUwsQ0FBYW1ELENBQWIsRUFBZ0JTLEtBQWhCLENBQXNCdEMsTUFBdEIsS0FBaUMsQ0FBdkUsRUFBMEU7QUFDdEVZLHlCQUFLbEMsT0FBTCxDQUFhbUQsQ0FBYixFQUFnQjVELE1BQWhCO0FBQ0g7QUFDSjtBQUVKO0FBQ0R4QixzQkFBYyxFQUFkO0FBQ0gsS0E3RUQ7QUE4RUg7O2tCQUVjL0MsTyIsImZpbGUiOiJIYW1zdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBtb2R1bGUgSGFtc3RlclxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb24gUG9zdENTUyBIYW1zdGVyIGZyYW1ld29yayBtYWluIGZ1bmN0aW9uYWxpdHkuXHJcbiAqXHJcbiAqIEB2ZXJzaW9uIDEuMFxyXG4gKiBAYXV0aG9yIEdyaWdvcnkgVmFzaWx5ZXYgPHBvc3Rjc3MuaGFtc3RlckBnbWFpbC5jb20+IGh0dHBzOi8vZ2l0aHViLmNvbS9oMHRjMGQzXHJcbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE3LCBHcmlnb3J5IFZhc2lseWV2XHJcbiAqIEBsaWNlbnNlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCwgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IEZvbnRTaXplcyBmcm9tIFwiLi9Gb250U2l6ZXNcIjtcclxuXHJcbmltcG9ydCB7XHJcbiAgICBmb3JtYXRJbnQsXHJcbiAgICBmb3JtYXRWYWx1ZSxcclxuICAgIHJlbVJlZ2V4cCxcclxuICAgIGdldFVuaXQsXHJcbiAgICBleHRlbmQsXHJcbiAgICB0b0NhbWVsQ2FzZSxcclxuICAgIHRvS2ViYWJDYXNlLFxyXG4gICAgY21wU3RyLFxyXG4gICAgc2NtcFN0cixcclxuICAgIFVOSVQsXHJcbiAgICB1bml0TmFtZVxyXG59IGZyb20gXCIuL0hlbHBlcnNcIjtcclxuXHJcbmltcG9ydCBWZXJ0aWNhbFJoeXRobSBmcm9tIFwiLi9WZXJ0aWNhbFJoeXRobVwiO1xyXG5cclxuaW1wb3J0IFBuZ0ltYWdlIGZyb20gXCIuL1BuZ0ltYWdlXCI7XHJcbi8vIGltcG9ydCBWaXJ0dWFsTWFjaGluZSBmcm9tIFwiLi9WaXJ0dWFsTWFjaGluZVwiO1xyXG5cclxuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5cclxuaW1wb3J0IHBvc3Rjc3MgZnJvbSBcInBvc3Rjc3NcIjtcclxuLy8gaW1wb3J0IHBvc3Rjc3MgZnJvbSBcIi4uLy4uL3Bvc3Rjc3MvYnVpbGQvbGliL3Bvc3Rjc3MuanNcIjtcclxuXHJcbmNvbnN0IGhlbHBlcnMgPSB7XHJcblxyXG4gICAgcmVzZXQ6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2hlbHBlcnMvcmVzZXQuY3NzXCIpLCBcInV0ZjhcIiksXHJcblxyXG4gICAgbm9ybWFsaXplOiBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9oZWxwZXJzL25vcm1hbGl6ZS5jc3NcIiksIFwidXRmOFwiKSxcclxuXHJcbiAgICBzYW5pdGl6ZTogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vaGVscGVycy9zYW5pdGl6ZS5jc3NcIiksIFwidXRmOFwiKSxcclxuXHJcbiAgICBib3hTaXppbmdSZXNldDogXCJcXG5odG1sIHtcIiArXHJcbiAgICBcIlxcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG5cIiArXHJcbiAgICBcIn1cXG5cIiArXHJcbiAgICBcIiosICo6YmVmb3JlLCAqOmFmdGVyIHtcIiArXHJcbiAgICBcIlxcbiAgYm94LXNpemluZzogaW5oZXJpdDtcXG5cIiArXHJcbiAgICBcIn1cXG5cIixcclxuXHJcbiAgICBub3dyYXA6IFwiXFxuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xcblwiLFxyXG5cclxuICAgIGZvcmNld3JhcDogXCJcXG4gIHdoaXRlLXNwYWNlOiBwcmU7XCIgK1xyXG4gICAgXCJcXG4gIHdoaXRlLXNwYWNlOiBwcmUtbGluZTtcIiArXHJcbiAgICBcIlxcbiAgd2hpdGUtc3BhY2U6IHByZS13cmFwO1wiICtcclxuICAgIFwiXFxuICB3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XFxuXCIsXHJcblxyXG4gICAgZWxsaXBzaXM6IFwiXFxuICBvdmVyZmxvdzogaGlkZGVuO1wiICtcclxuICAgIFwiXFxuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcXG5cIixcclxuXHJcbiAgICBoeXBoZW5zOiBcIlxcbiAgd29yZC13cmFwOiBicmVhay13b3JkO1wiICtcclxuICAgIFwiXFxuICBoeXBoZW5zOiBhdXRvO1xcblwiLFxyXG5cclxuICAgIGJyZWFrV29yZDogLyogTm9uIHN0YW5kYXJkIGZvciB3ZWJraXQgKi9cclxuICAgIFwiXFxuICB3b3JkLWJyZWFrOiBicmVhay13b3JkO1wiICtcclxuICAgIC8qIFdhcm5pbmc6IE5lZWRlZCBmb3Igb2xkSUUgc3VwcG9ydCwgYnV0IHdvcmRzIGFyZSBicm9rZW4gdXAgbGV0dGVyLWJ5LWxldHRlciAqL1xyXG4gICAgXCJcXG4gIHdvcmQtYnJlYWs6IGJyZWFrLWFsbDtcXG5cIlxyXG59O1xyXG5cclxuLy8gZm9udFNpemUgcHJvcGVydHkgUmVnZXhwXHJcbmNvbnN0IGZvbnRTaXplUmVnZXhwID0gLyhmb250U2l6ZXxmcylcXHMrKFtcXC0kQDAtOWEtekEtWl0rKS9pO1xyXG5cclxuLy8gcmh5dGhtIGZ1bmN0aW9ucyBSZWdleHBcclxuY29uc3Qgcmh5dGhtUmVnZXhwID0gLygtPykoXFxzKikobGluZUhlaWdodHxsaGVpZ2h0fHNwYWNpbmd8bGVhZGluZ3whcmh5dGhtfGlyaHl0aG18cmh5dGhtfGJhc2UpXFwoKC4qPylcXCkvaTtcclxuXHJcbi8vIENvbW1hIHNwbGl0IHJlZ2V4cFxyXG5jb25zdCBjb21tYVNwbGl0UmVnZXhwID0gL1xccyosXFxzKi87XHJcblxyXG4vLyBTcGFjZSBzcGxpdCByZWdleHBcclxuY29uc3Qgc3BhY2VTcGxpdFJlZ2V4cCA9IC9cXHMrLztcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm4gdmlld3BvcnQgY2FsY3VsYXRlZCB2YWx1ZS5cclxuICogQHBhcmFtIE1cclxuICogQHBhcmFtIEJcclxuICogQHBhcmFtIHZhbHVlXHJcbiAqIEBwYXJhbSBoYXNNaW51c1xyXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gKi9cclxuZnVuY3Rpb24gdndWYWx1ZShNLCBCLCB2YWx1ZSwgaGFzTWludXMgPSBmYWxzZSl7XHJcbiAgICBsZXQgcmV0ID0gKEIgPT09IDApXHJcbiAgICAgICAgPyBmb3JtYXRWYWx1ZShNICogdmFsdWUpICsgXCJ2d1wiXHJcbiAgICAgICAgOiAoQiA+IDApXHJcbiAgICAgICAgICAgID8gZm9ybWF0VmFsdWUoTSAqIHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgKyBcInZ3ICsgXCIgKyBmb3JtYXRWYWx1ZShCICogdmFsdWUpICsgXCJweFwiXHJcbiAgICAgICAgICAgIDogZm9ybWF0VmFsdWUoTSAqIHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgKyBcInZ3IFwiICsgZm9ybWF0VmFsdWUoQiAqIHZhbHVlKS5yZXBsYWNlKFwiLVwiLCBcIi0gXCIpICsgXCJweFwiO1xyXG4gICAgcmV0dXJuIChoYXNNaW51cykgPyBcImNhbGMoKFwiICsgcmV0ICsgXCIpICogLTEpXCI6IFwiY2FsYyhcIiArIHJldCArIFwiKVwiO1xyXG59XHJcbi8qKlxyXG4gKiBBZGQgU2V0dGluZ3MgdG8gc2V0dGluZ3MgdGFibGUuXHJcbiAqIEBwYXJhbSBydWxlIC0gY3VycmVudCBydWxlLlxyXG4gKiBAcGFyYW0gc2V0dGluZ3MgLSBzZXR0aW5ncyB0YWJsZS5cclxuICovXHJcbmZ1bmN0aW9uIGFkZFNldHRpbmdzKHJ1bGUsIHNldHRpbmdzKSB7XHJcblxyXG4gICAgcnVsZS53YWxrRGVjbHMoZGVjbCA9PiB7XHJcblxyXG4gICAgICAgIGxldCBwcm9wID0gdG9DYW1lbENhc2UoZGVjbC5wcm9wKTtcclxuICAgICAgICBpZiAoc2NtcFN0cihwcm9wLCBcInJlbUZhbGxiYWNrXCIpIHx8IHNjbXBTdHIocHJvcCwgXCJweEZhbGxiYWNrXCIpIHx8IHNjbXBTdHIocHJvcCwgXCJweEJhc2VsaW5lXCIpIHx8XHJcbiAgICAgICAgICAgIHNjbXBTdHIocHJvcCwgXCJyb3VuZFRvSGFsZkxpbmVcIikgfHwgc2NtcFN0cihwcm9wLCBcInJ1bGVyXCIpIHx8XHJcbiAgICAgICAgICAgIHNjbXBTdHIocHJvcCwgXCJsZWdhY3lCcm93c2Vyc1wiKSB8fCBzY21wU3RyKHByb3AsIFwicmVtb3ZlQ29tbWVudHNcIikpIHtcclxuXHJcbiAgICAgICAgICAgIHNldHRpbmdzW3Byb3BdID0gY21wU3RyKGRlY2wudmFsdWUsIFwidHJ1ZVwiKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChzY21wU3RyKHByb3AsIFwidW5pdFwiKSkge1xyXG5cclxuICAgICAgICAgICAgc2V0dGluZ3MudW5pdCA9IGdldFVuaXQoZGVjbC52YWx1ZSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoc2NtcFN0cihwcm9wLCBcImxpbmVIZWlnaHRcIikgfHwgc2NtcFN0cihwcm9wLCBcInRvTGluZUhlaWdodFwiKSkge1xyXG5cclxuICAgICAgICAgICAgc2V0dGluZ3NbcHJvcF0gPSBwYXJzZUZsb2F0KGRlY2wudmFsdWUpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHNjbXBTdHIocHJvcCwgXCJmb250U2l6ZVwiKSB8fCBzY21wU3RyKHByb3AsIFwidG9Gb250U2l6ZVwiKSB8fCBzY21wU3RyKHByb3AsIFwibWluTGluZVBhZGRpbmdcIikgfHxcclxuICAgICAgICAgICAgc2NtcFN0cihwcm9wLCBcInJ1bGVyVGhpY2tuZXNzXCIpIHx8IHNjbXBTdHIocHJvcCwgXCJydWxlclNjYWxlXCIpIHx8XHJcbiAgICAgICAgICAgIHNjbXBTdHIocHJvcCwgXCJicm93c2VyRm9udFNpemVcIikpIHtcclxuXHJcbiAgICAgICAgICAgIHNldHRpbmdzW3Byb3BdID0gcGFyc2VJbnQoZGVjbC52YWx1ZSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBzZXR0aW5nc1twcm9wXSA9IGRlY2wudmFsdWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KTtcclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhbXN0ZXIob3B0aW9ucykge1xyXG5cclxuICAgIC8vIERlZmF1bHQgR2xvYmFsIFNldHRpbmdzXHJcbiAgICBsZXQgZ2xvYmFsU2V0dGluZ3MgPSB7XHJcblxyXG4gICAgICAgIGZvbnRTaXplOiAxNixcclxuICAgICAgICB0b0ZvbnRTaXplOiAwLFxyXG4gICAgICAgIGZvbnRTaXplTTogMCxcclxuICAgICAgICBmb250U2l6ZUI6IDAsXHJcblxyXG4gICAgICAgIGxpbmVIZWlnaHQ6IDEuNSxcclxuICAgICAgICBsaW5lSGVpZ2h0UmVsOiAwLFxyXG4gICAgICAgIGxpbmVIZWlnaHRQeDogMCxcclxuICAgICAgICBsaW5lSGVpZ2h0TTogMCxcclxuICAgICAgICBsaW5lSGVpZ2h0QjogMCxcclxuICAgICAgICB0b0xpbmVIZWlnaHQ6IDAsXHJcbiAgICAgICAgdG9MaW5lSGVpZ2h0UHg6IDAsXHJcbiAgICAgICAgdG9MaW5lSGVpZ2h0UmVsOiAwLFxyXG4gICAgICAgIHZpZXdwb3J0OiBudWxsLFxyXG5cclxuICAgICAgICB1c2VHbG9iYWw6IGZhbHNlLFxyXG4gICAgICAgIGdsb2JhbFJhdGlvOiAwLFxyXG5cclxuICAgICAgICB1bml0OiBVTklULkVNLFxyXG5cclxuICAgICAgICBweEZhbGxiYWNrOiBmYWxzZSxcclxuICAgICAgICByZW1GYWxsYmFjazogdHJ1ZSxcclxuICAgICAgICBweEJhc2VsaW5lOiBmYWxzZSxcclxuICAgICAgICBmb250UmF0aW86IFwiMS4yNVwiLFxyXG5cclxuICAgICAgICBwcm9wZXJ0aWVzOiBcImlubGluZVwiLFxyXG5cclxuICAgICAgICBtaW5MaW5lUGFkZGluZzogMixcclxuICAgICAgICByb3VuZFRvSGFsZkxpbmU6IGZhbHNlLFxyXG5cclxuICAgICAgICBydWxlcjogdHJ1ZSxcclxuICAgICAgICBydWxlclN0eWxlOiBcImFsd2F5cyBydWxlci1kZWJ1Z1wiLFxyXG4gICAgICAgIHJ1bGVySWNvblBvc2l0aW9uOiBcInBvc2l0aW9uOmZpeGVkO3RvcDogc3BhY2luZygxKTtsZWZ0OiBzcGFjaW5nKDEpO1wiLFxyXG4gICAgICAgIHJ1bGVySWNvbkNvbG9yczogXCIjY2NjY2NjICM0NDU3NmFcIixcclxuICAgICAgICBydWxlckljb25TaXplOiBcInNwYWNpbmcoMSlcIixcclxuICAgICAgICBydWxlckNvbG9yOiBcInJnYmEoMTksIDEzNCwgMTkxLCAuOClcIixcclxuICAgICAgICBydWxlclRoaWNrbmVzczogMSxcclxuICAgICAgICBydWxlckJhY2tncm91bmQ6IFwiZ3JhZGllbnRcIixcclxuICAgICAgICBydWxlck91dHB1dDogXCJiYXNlNjRcIixcclxuICAgICAgICBydWxlclBhdHRlcm46IFwiMSAwIDAgMFwiLFxyXG4gICAgICAgIHJ1bGVyU2NhbGU6IDEsXHJcblxyXG4gICAgICAgIGJyb3dzZXJGb250U2l6ZTogMTYsXHJcbiAgICAgICAgbGVnYWN5QnJvd3NlcnM6IHRydWUsXHJcbiAgICAgICAgcmVtb3ZlQ29tbWVudHM6IGZhbHNlLFxyXG4gICAgICAgIGZvbnRTaXplczogbnVsbFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBWYWx1ZSB0b0xvd2VyQ2FzZSgpXHJcbiAgICBsZXQgdG9Mb3dlckNhc2VLZXlzID0gW1xyXG4gICAgICAgIFwidW5pdFwiLFxyXG4gICAgICAgIFwiZm9udFJhdGlvXCIsXHJcbiAgICAgICAgXCJwcm9wZXJ0aWVzXCIsXHJcbiAgICAgICAgXCJydWxlclN0eWxlXCIsXHJcbiAgICAgICAgXCJydWxlckJhY2tncm91bmRcIixcclxuICAgICAgICBcInJ1bGVyT3V0cHV0XCJcclxuICAgIF07XHJcblxyXG5cclxuICAgIGNvbnN0IGJhY2tTZXR0aW5ncyA9IGV4dGVuZCh7fSwgZ2xvYmFsU2V0dGluZ3MpO1xyXG4gICAgLy8gQ3VycmVudCBTZXR0aW5ncyBleHRlbmQoe30sIGdsb2JhbFNldHRpbmdzKVxyXG4gICAgbGV0IHNldHRpbmdzID0ge307XHJcbiAgICBpZihvcHRpb25zKXtcclxuICAgICAgICBleHRlbmQoZ2xvYmFsU2V0dGluZ3MsIG9wdGlvbnMsIGZhbHNlKTtcclxuICAgIH1cclxuICAgIGxldCBzZXR0aW5nc1JlZ2V4cDtcclxuICAgIC8vQ3VycmVudCBGb250U2l6ZXNcclxuICAgIGxldCBjdXJyZW50Rm9udFNpemVzID0gbnVsbDtcclxuICAgIC8vIGZvbnQgU2l6ZXNcclxuICAgIGxldCBmb250U2l6ZXM7XHJcbiAgICAvLyBWZXJ0aWNhbCBSaHl0aG0gQ2FsY3VsYXRvclxyXG4gICAgbGV0IHJoeXRobTtcclxuICAgIC8vIExhc3QgQ3NzIEZpbGVcclxuICAgIC8vIGxldCBsYXN0RmlsZTtcclxuICAgIGNvbnN0IGltYWdlID0gbmV3IFBuZ0ltYWdlKCk7XHJcbiAgICAvLyBFeHRlbmQgTm9kZXNcclxuICAgIGxldCBleHRlbmROb2RlcyA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IGluaXRTZXR0aW5ncyA9ICgpID0+IHtcclxuICAgICAgICBjdXJyZW50Rm9udFNpemVzID0gbnVsbDtcclxuICAgICAgICAvLyBBZGQgZm9udFNpemVzXHJcbiAgICAgICAgaWYgKGdsb2JhbFNldHRpbmdzLmZvbnRTaXplcykge1xyXG4gICAgICAgICAgICBjdXJyZW50Rm9udFNpemVzID0gZ2xvYmFsU2V0dGluZ3MuZm9udFNpemVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNldHRpbmdzLmZvbnRTaXplcykge1xyXG4gICAgICAgICAgICBjdXJyZW50Rm9udFNpemVzID0gKGN1cnJlbnRGb250U2l6ZXMpXHJcbiAgICAgICAgICAgICAgICA/IGN1cnJlbnRGb250U2l6ZXMgKyBcIiwgXCIgKyBzZXR0aW5ncy5mb250U2l6ZXNcclxuICAgICAgICAgICAgICAgIDogc2V0dGluZ3MuZm9udFNpemVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVG9Mb3dlckNhc2UgQ3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0b0xvd2VyQ2FzZUtleXMpIHtcclxuICAgICAgICAgICAgaWYgKHNldHRpbmdzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzW2tleV0gPSBzZXR0aW5nc1trZXldLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNhdmUgZm9udCByYXRpbyB3aXRoIGdsb2JhbCBzZXR0aW5nc1xyXG4gICAgICAgIGlmKHNldHRpbmdzLnVzZUdsb2JhbCl7XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmdsb2JhbFJhdGlvID0gc2V0dGluZ3MuZm9udFNpemUgLyBnbG9iYWxTZXR0aW5ncy5mb250U2l6ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmVsYXRpdmUgbGluZS1oZWlnaHRcclxuICAgICAgICBzZXR0aW5ncy5saW5lSGVpZ2h0UmVsID0gc2V0dGluZ3MubGluZUhlaWdodCA+IHNldHRpbmdzLmZvbnRTaXplXHJcbiAgICAgICAgICAgID8gc2V0dGluZ3MubGluZUhlaWdodCAvIHNldHRpbmdzLmZvbnRTaXplIDogc2V0dGluZ3MubGluZUhlaWdodDtcclxuXHJcbiAgICAgICAgLy8gUGl4ZWwgbGluZS1oZWlnaHRcclxuICAgICAgICBzZXR0aW5ncy5saW5lSGVpZ2h0UHggPSBzZXR0aW5ncy5saW5lSGVpZ2h0ID4gc2V0dGluZ3MuZm9udFNpemVcclxuICAgICAgICAgICAgPyBzZXR0aW5ncy5saW5lSGVpZ2h0XHJcbiAgICAgICAgICAgIDogKHNldHRpbmdzLmxpbmVIZWlnaHQgKiBzZXR0aW5ncy5mb250U2l6ZSk7XHJcbiAgICAgICAgaWYoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5QWCAmJiBzZXR0aW5ncy5weEZhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmxpbmVIZWlnaHRQeCA9IE1hdGgucm91bmQoc2V0dGluZ3MubGluZUhlaWdodFB4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpe1xyXG5cclxuICAgICAgICAgICAgbGV0IHZpZXcgPSBzZXR0aW5ncy52aWV3cG9ydC5zcGxpdChzcGFjZVNwbGl0UmVnZXhwKTtcclxuICAgICAgICAgICAgbGV0IGZyb20gPSBwYXJzZUZsb2F0KHZpZXdbMF0pO1xyXG4gICAgICAgICAgICBsZXQgdG8gPSBwYXJzZUZsb2F0KHZpZXdbMV0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IHZpZXdEaWZmID0gdG8gLSBmcm9tO1xyXG4gICAgICAgICAgICBzZXR0aW5ncy5mb250U2l6ZU0gPSAoc2V0dGluZ3MudG9Gb250U2l6ZSAtIHNldHRpbmdzLmZvbnRTaXplKSAvIHZpZXdEaWZmO1xyXG4gICAgICAgICAgICBzZXR0aW5ncy5mb250U2l6ZUIgPSBzZXR0aW5ncy5mb250U2l6ZSAtIHNldHRpbmdzLmZvbnRTaXplTSAqIGZyb207XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmZvbnRTaXplTSA9IHNldHRpbmdzLmZvbnRTaXplTSAqIDEwMDtcclxuXHJcbiAgICAgICAgICAgIC8vIHJlbGF0aXZlIGxpbmUtaGVpZ2h0XHJcbiAgICAgICAgICAgIHNldHRpbmdzLnRvTGluZUhlaWdodFJlbCA9IHNldHRpbmdzLnRvTGluZUhlaWdodCA+IHNldHRpbmdzLnRvRm9udFNpemVcclxuICAgICAgICAgICAgICAgID8gc2V0dGluZ3MudG9MaW5lSGVpZ2h0IC8gc2V0dGluZ3MudG9Gb250U2l6ZSA6IHNldHRpbmdzLnRvTGluZUhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIC8vIFBpeGVsIGxpbmUtaGVpZ2h0XHJcbiAgICAgICAgICAgIHNldHRpbmdzLnRvTGluZUhlaWdodFB4ID0gc2V0dGluZ3MudG9MaW5lSGVpZ2h0ID4gc2V0dGluZ3MudG9Gb250U2l6ZVxyXG4gICAgICAgICAgICAgICAgPyBzZXR0aW5ncy50b0xpbmVIZWlnaHRcclxuICAgICAgICAgICAgICAgIDogKHNldHRpbmdzLnRvTGluZUhlaWdodCAqIHNldHRpbmdzLnRvRm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgc2V0dGluZ3MubGluZUhlaWdodE0gPSAoc2V0dGluZ3MudG9MaW5lSGVpZ2h0UHggLSBzZXR0aW5ncy5saW5lSGVpZ2h0UHgpIC8gdmlld0RpZmY7XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmxpbmVIZWlnaHRCID0gc2V0dGluZ3MubGluZUhlaWdodFB4IC0gc2V0dGluZ3MubGluZUhlaWdodE0gKiBmcm9tO1xyXG4gICAgICAgICAgICBzZXR0aW5ncy5saW5lSGVpZ2h0TSA9IHNldHRpbmdzLmxpbmVIZWlnaHRNICogMTAwO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvbnRTaXplcyA9IG5ldyBGb250U2l6ZXMoc2V0dGluZ3MpO1xyXG4gICAgICAgIHJoeXRobSA9IG5ldyBWZXJ0aWNhbFJoeXRobShzZXR0aW5ncyk7XHJcbiAgICAgICAgaWYgKGN1cnJlbnRGb250U2l6ZXMpIHtcclxuICAgICAgICAgICAgZm9udFNpemVzLmFkZEZvbnRTaXplcyhjdXJyZW50Rm9udFNpemVzLCByaHl0aG0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc2V0dGluZ3NLZXlzID0gT2JqZWN0LmtleXMoc2V0dGluZ3MpLmpvaW4oXCJ8XCIpO1xyXG4gICAgICAgIC8vbGV0IHNldHRpbmdzS2V5c1N0cmluZyA9IHRvS2ViYWJDYXNlKHNldHRpbmdzS2V5cykucmVwbGFjZSgvLS9nLCBcIlxcXFwtXCIpO1xyXG4gICAgICAgIGxldCBzZXR0aW5nc0tleXNTdHJpbmcgPSB0b0tlYmFiQ2FzZShzZXR0aW5nc0tleXMpLnNwbGl0KFwiLVwiKS5qb2luKFwiXFxcXC1cIik7XHJcbiAgICAgICAgc2V0dGluZ3NSZWdleHAgPSBuZXcgUmVnRXhwKFwiXFxcXEAoXCIgKyBzZXR0aW5nc0tleXNTdHJpbmcgKyBcIilcIiwgXCJpXCIpO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB3YWxrQXRSdWxlID0gKHJ1bGUpID0+IHtcclxuXHJcbiAgICAgICAgaWYgKGNtcFN0cihydWxlLm5hbWUsIFwiaGFtc3RlclwiKSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGNtcFN0cihydWxlLnBhcmFtcywgXCJyZXNldFwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGdsb2JhbFNldHRpbmdzID0gZXh0ZW5kKHt9LCBiYWNrU2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmICghY21wU3RyKHJ1bGUucGFyYW1zLCBcImVuZFwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGFkZFNldHRpbmdzKHJ1bGUsIGdsb2JhbFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUmVzZXQgY3VycmVudCBzZXR0aW5nc1xyXG4gICAgICAgICAgICBzZXR0aW5ncyA9IGV4dGVuZCh7fSwgZ2xvYmFsU2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICAgICAgICAgIGluaXRTZXR0aW5ncygpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIFJ1bGUgSGFtc3RlclxyXG4gICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihydWxlLm5hbWUsIFwiaWhhbXN0ZXJcIikgfHwgY21wU3RyKHJ1bGUubmFtZSwgXCIhaGFtc3RlclwiKSkge1xyXG5cclxuICAgICAgICAgICAgYWRkU2V0dGluZ3MocnVsZSwgc2V0dGluZ3MpO1xyXG5cclxuICAgICAgICAgICAgLy8gSW5pdCBjdXJyZW50IFNldHRpbmdzXHJcbiAgICAgICAgICAgIGluaXRTZXR0aW5ncygpO1xyXG5cclxuICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocnVsZS5uYW1lLCBcImVsbGlwc2lzXCIpIHx8IGNtcFN0cihydWxlLm5hbWUsIFwibm93cmFwXCIpIHx8XHJcbiAgICAgICAgICAgIGNtcFN0cihydWxlLm5hbWUsIFwiZm9yY2V3cmFwXCIpIHx8IGNtcFN0cihydWxlLm5hbWUsIFwiaHlwaGVuc1wiKSB8fCBjbXBTdHIocnVsZS5uYW1lLCBcImJyZWFrLXdvcmRcIikpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBwcm9wZXJ0eSA9IHRvQ2FtZWxDYXNlKHJ1bGUubmFtZSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGVjbHMgPSBoZWxwZXJzW3Byb3BlcnR5XTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjbXBTdHIocHJvcGVydHksIFwiaHlwaGVuc1wiKSAmJiBjbXBTdHIocnVsZS5wYXJhbXMsIFwidHJ1ZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgZGVjbHMgPSBoZWxwZXJzLmJyZWFrV29yZCArIGRlY2xzO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihwcm9wZXJ0eSwgXCJlbGxpcHNpc1wiKSAmJiBjbXBTdHIocnVsZS5wYXJhbXMsIFwidHJ1ZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgZGVjbHMgPSBoZWxwZXJzLm5vd3JhcCArIGRlY2xzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY21wU3RyKHNldHRpbmdzLnByb3BlcnRpZXMsIFwiaW5saW5lXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGlkZWNscyA9IHBvc3Rjc3MucGFyc2UoZGVjbHMpO1xyXG4gICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJ1bGUsIGlkZWNscyk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBleHRlbmROYW1lID0gdG9DYW1lbENhc2UocHJvcGVydHkgKyBydWxlLnBhcmFtcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFleHRlbmROb2Rlcy5oYXNPd25Qcm9wZXJ0eShleHRlbmROYW1lKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIGV4dGVuZCBpbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBydWxlLnBhcmVudC5zZWxlY3RvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVjbHM6IGRlY2xzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRzOiBbcnVsZS5wYXJlbnRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2OiBydWxlLnByZXYoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IDFcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vQXBwZW5kIHNlbGVjdG9yIGFuZCB1cGRhdGUgY291bnRlclxyXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLnNlbGVjdG9yID0gZXh0ZW5kTm9kZXNbZXh0ZW5kTmFtZV0uc2VsZWN0b3IgKyBcIiwgXCIgKyBydWxlLnBhcmVudC5zZWxlY3RvcjtcclxuICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1tleHRlbmROYW1lXS5wYXJlbnRzLnB1c2gocnVsZS5wYXJlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW2V4dGVuZE5hbWVdLmNvdW50Kys7XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihydWxlLm5hbWUsIFwicmVzZXRcIikgfHwgY21wU3RyKHJ1bGUubmFtZSwgXCJub3JtYWxpemVcIilcclxuICAgICAgICAgICAgfHwgY21wU3RyKHJ1bGUubmFtZSwgXCJzYW5pdGl6ZVwiKSB8fCBjbXBTdHIocnVsZS5uYW1lLCBcImJveC1zaXppbmctcmVzZXRcIikpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBwcm9wZXJ0eSA9IHRvQ2FtZWxDYXNlKHJ1bGUubmFtZSk7XHJcbiAgICAgICAgICAgIGxldCBydWxlcyA9IHBvc3Rjc3MucGFyc2UoaGVscGVyc1twcm9wZXJ0eV0pO1xyXG4gICAgICAgICAgICBydWxlcy5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgcnVsZXMpO1xyXG4gICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG4gICAgICAgIC8vIH0gZWxzZSBpZihjbXBTdHIocnVsZS5uYW1lLCBcInJoeXRobVwiKSl7XHJcbiAgICAgICAgLy8gICAgIGxldCBbd2lkdGgsIGhlaWdodCwgb3V0cHV0VW5pdF0gPSBydWxlLnBhcmFtLnNwbGl0KHNwYWNlU3BsaXRSZWdleHApO1xyXG4gICAgICAgIC8vICAgICBpZighb3V0cHV0VW5pdCl7XHJcbiAgICAgICAgLy8gICAgICAgICBvdXRwdXRVbml0ID0gc2V0dGluZ3MudW5pdDtcclxuICAgICAgICAvLyAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyAgICAgICAgIG91dHB1dFVuaXQgPSBVTklUW291dHB1dFVuaXRdO1xyXG4gICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgLy8gICAgIHJoeXRobS5yaHl0aG0oaGVpZ2h0LCBmb250U2l6ZSwgZmFsc2UsIG91dHB1dFVuaXQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJiYXNlbGluZVwiKSkge1xyXG5cclxuICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSByaHl0aG0ubGluZUhlaWdodChzZXR0aW5ncy5mb250U2l6ZSArIFwicHhcIik7XHJcblxyXG4gICAgICAgICAgICAvLyBiYXNlbGluZSBmb250IHNpemVcclxuICAgICAgICAgICAgbGV0IGZvbnRTaXplRGVjbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5weEJhc2VsaW5lIHx8IChzZXR0aW5ncy51bml0ID09PSBVTklULlBYICYmICFzZXR0aW5ncy5sZWdhY3lCcm93c2VycykpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZURlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3A6IFwiZm9udC1zaXplXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHNldHRpbmdzLmZvbnRTaXplICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcmVsYXRpdmVTaXplID0gMTAwICogc2V0dGluZ3MuZm9udFNpemUgLyBzZXR0aW5ncy5icm93c2VyRm9udFNpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9udFNpemVEZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImZvbnQtc2l6ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmb3JtYXRWYWx1ZShyZWxhdGl2ZVNpemUpICsgXCIlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbGluZUhlaWdodERlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGxpbmVIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGlmIChjbXBTdHIocnVsZS5wYXJhbXMsIFwiaHRtbFwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBodG1sUnVsZSA9IHBvc3Rjc3MucnVsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3I6IFwiaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGh0bWxSdWxlLmFwcGVuZChmb250U2l6ZURlY2wpO1xyXG4gICAgICAgICAgICAgICAgaHRtbFJ1bGUuYXBwZW5kKGxpbmVIZWlnaHREZWNsKTtcclxuXHJcbiAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBodG1sUnVsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuUFggJiYgc2V0dGluZ3MubGVnYWN5QnJvd3NlcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYXN0ZXJpc2tIdG1sUnVsZSA9IHBvc3Rjc3MucnVsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcIiogaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXN0ZXJpc2tIdG1sUnVsZS5hcHBlbmQobGluZUhlaWdodERlY2wuY2xvbmUoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgYXN0ZXJpc2tIdG1sUnVsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGxpbmVIZWlnaHREZWNsKTtcclxuICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGZvbnRTaXplRGVjbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuUkVNICYmIHNldHRpbmdzLnJlbUZhbGxiYWNrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShsaW5lSGVpZ2h0RGVjbCwgcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJsaW5lLWhlaWdodFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmh5dGhtLnJlbUZhbGxiYWNrKGxpbmVIZWlnaHQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocnVsZS5uYW1lLCBcInJ1bGVyXCIpKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgcnVsZXJJY29uUG9zaXRpb24gPSBzZXR0aW5ncy5ydWxlckljb25Qb3NpdGlvbi5yZXBsYWNlKC9bJ1wiXS9nLCBcIlwiKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzdmcgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0ZjgsJTNDc3ZnIHhtbG5zJTNEJTI3aHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTI3IHZpZXdCb3glM0QlMjcwIDAgMjQgMjQlMjclM0UlM0NwYXRoIGZpbGwlM0QlMjd7Y29sb3J9JTI3IGQlM0QlMjdNMTggMjRjLTAuMyAwLTAuNTQ4LTAuMjQ2LTAuNTQ4LTAuNTQ2VjE4YzAtMC4zIDAuMjQ4LTAuNTQ2IDAuNTQ4LTAuNTQ2aDUuNDUyICBDMjMuNzU0IDE3LjQ1NCAyNCAxNy43IDI0IDE4djUuNDU0YzAgMC4zLTAuMjQ2IDAuNTQ2LTAuNTQ4IDAuNTQ2SDE4eiBNOS4yNzEgMjRjLTAuMjk4IDAtMC41NDMtMC4yNDYtMC41NDMtMC41NDZWMTggIGMwLTAuMyAwLjI0NS0wLjU0NiAwLjU0My0wLjU0Nmg1LjQ1N2MwLjMgMCAwLjU0MyAwLjI0NiAwLjU0MyAwLjU0NnY1LjQ1NGMwIDAuMy0wLjI0MyAwLjU0Ni0wLjU0MyAwLjU0Nkg5LjI3MXogTTAuNTQ4IDI0ICBDMC4yNDYgMjQgMCAyMy43NTQgMCAyMy40NTRWMThjMC0wLjMgMC4yNDYtMC41NDYgMC41NDgtMC41NDZINmMwLjMwMiAwIDAuNTQ4IDAuMjQ2IDAuNTQ4IDAuNTQ2djUuNDU0QzYuNTQ4IDIzLjc1NCA2LjMwMiAyNCA2IDI0ICBIMC41NDh6IE0xOCAxNS4yNzFjLTAuMyAwLTAuNTQ4LTAuMjQ0LTAuNTQ4LTAuNTQyVjkuMjcyYzAtMC4yOTkgMC4yNDgtMC41NDUgMC41NDgtMC41NDVoNS40NTJDMjMuNzU0IDguNzI3IDI0IDguOTczIDI0IDkuMjcyICB2NS40NTdjMCAwLjI5OC0wLjI0NiAwLjU0Mi0wLjU0OCAwLjU0MkgxOHogTTkuMjcxIDE1LjI3MWMtMC4yOTggMC0wLjU0My0wLjI0NC0wLjU0My0wLjU0MlY5LjI3MmMwLTAuMjk5IDAuMjQ1LTAuNTQ1IDAuNTQzLTAuNTQ1ICBoNS40NTdjMC4zIDAgMC41NDMgMC4yNDYgMC41NDMgMC41NDV2NS40NTdjMCAwLjI5OC0wLjI0MyAwLjU0Mi0wLjU0MyAwLjU0Mkg5LjI3MXogTTAuNTQ4IDE1LjI3MUMwLjI0NiAxNS4yNzEgMCAxNS4wMjYgMCAxNC43MjkgIFY5LjI3MmMwLTAuMjk5IDAuMjQ2LTAuNTQ1IDAuNTQ4LTAuNTQ1SDZjMC4zMDIgMCAwLjU0OCAwLjI0NiAwLjU0OCAwLjU0NXY1LjQ1N2MwIDAuMjk4LTAuMjQ2IDAuNTQyLTAuNTQ4IDAuNTQySDAuNTQ4eiBNMTggNi41NDUgIGMtMC4zIDAtMC41NDgtMC4yNDUtMC41NDgtMC41NDVWMC41NDVDMTcuNDUyIDAuMjQ1IDE3LjcgMCAxOCAwaDUuNDUyQzIzLjc1NCAwIDI0IDAuMjQ1IDI0IDAuNTQ1VjZjMCAwLjMtMC4yNDYgMC41NDUtMC41NDggMC41NDUgIEgxOHogTTkuMjcxIDYuNTQ1QzguOTc0IDYuNTQ1IDguNzI5IDYuMyA4LjcyOSA2VjAuNTQ1QzguNzI5IDAuMjQ1IDguOTc0IDAgOS4yNzEgMGg1LjQ1N2MwLjMgMCAwLjU0MyAwLjI0NSAwLjU0MyAwLjU0NVY2ICBjMCAwLjMtMC4yNDMgMC41NDUtMC41NDMgMC41NDVIOS4yNzF6IE0wLjU0OCA2LjU0NUMwLjI0NiA2LjU0NSAwIDYuMyAwIDZWMC41NDVDMCAwLjI0NSAwLjI0NiAwIDAuNTQ4IDBINiAgYzAuMzAyIDAgMC41NDggMC4yNDUgMC41NDggMC41NDVWNmMwIDAuMy0wLjI0NiAwLjU0NS0wLjU0OCAwLjU0NUgwLjU0OHolMjclMkYlM0UlM0MlMkZzdmclM0VcIjtcclxuICAgICAgICAgICAgLy8gbGV0IHN2ZyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmOCwlM0NzdmcgeG1sbnMlM0QlMjdodHRwJTNBJTJGJTJGd3d3LnczLm9yZyUyRjIwMDAlMkZzdmclMjcgdmlld0JveCUzRCUyNzAgMCAyNCAyNCUyNyUzRSUzQ3BhdGggZmlsbCUzRCUyN3tjb2xvcn0lMjcgZCUzRCUyN00wLDZjMCwwLjMwMSwwLjI0NiwwLjU0NSwwLjU0OSwwLjU0NWgyMi45MDZDMjMuNzU2LDYuNTQ1LDI0LDYuMzAxLDI0LDZWMi43M2MwLTAuMzA1LTAuMjQ0LTAuNTQ5LTAuNTQ1LTAuNTQ5SDAuNTQ5ICBDMC4yNDYsMi4xODIsMCwyLjQyNiwwLDIuNzNWNnogTTAsMTMuNjM3YzAsMC4yOTcsMC4yNDYsMC41NDUsMC41NDksMC41NDVoMjIuOTA2YzAuMzAxLDAsMC41NDUtMC4yNDgsMC41NDUtMC41NDV2LTMuMjczICBjMC0wLjI5Ny0wLjI0NC0wLjU0NS0wLjU0NS0wLjU0NUgwLjU0OUMwLjI0Niw5LjgxOCwwLDEwLjA2NiwwLDEwLjM2M1YxMy42Mzd6IE0wLDIxLjI3YzAsMC4zMDUsMC4yNDYsMC41NDksMC41NDksMC41NDloMjIuOTA2ICBjMC4zMDEsMCwwLjU0NS0wLjI0NCwwLjU0NS0wLjU0OVYxOGMwLTAuMzAxLTAuMjQ0LTAuNTQ1LTAuNTQ1LTAuNTQ1SDAuNTQ5QzAuMjQ2LDE3LjQ1NSwwLDE3LjY5OSwwLDE4VjIxLjI3eiUyNyUyRiUzRSUzQyUyRnN2ZyUzRVwiO1xyXG5cclxuICAgICAgICAgICAgbGV0IGd0aGlja25lc3MgPSBzZXR0aW5ncy5ydWxlclRoaWNrbmVzcztcclxuXHJcbiAgICAgICAgICAgIGxldCBiYWNrZ3JvdW5kID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgIGlmIChjbXBTdHIoc2V0dGluZ3MucnVsZXJCYWNrZ3JvdW5kLCBcInBuZ1wiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBpbWFnZUhlaWdodCA9IHNldHRpbmdzLmxpbmVIZWlnaHQgPj0gc2V0dGluZ3MuZm9udFNpemUgP1xyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLmxpbmVIZWlnaHQgOlxyXG4gICAgICAgICAgICAgICAgICAgIE1hdGgucm91bmQoKHNldHRpbmdzLmxpbmVIZWlnaHQgKiBzZXR0aW5ncy5mb250U2l6ZSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBwYXR0ZXJuID0gc2V0dGluZ3MucnVsZXJQYXR0ZXJuLnNwbGl0KHNwYWNlU3BsaXRSZWdleHApO1xyXG5cclxuICAgICAgICAgICAgICAgIGltYWdlLnJ1bGVyTWF0cml4KGltYWdlSGVpZ2h0LCBzZXR0aW5ncy5ydWxlckNvbG9yLCBwYXR0ZXJuLCBzZXR0aW5ncy5ydWxlclRoaWNrbmVzcywgc2V0dGluZ3MucnVsZXJTY2FsZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFjbXBTdHIoc2V0dGluZ3MucnVsZXJPdXRwdXQsIFwiYmFzZTY0XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2UuZ2V0RmlsZShzZXR0aW5ncy5ydWxlck91dHB1dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZCA9IFwiXFxuICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoXFxcIi4uL1wiICsgc2V0dGluZ3MucnVsZXJPdXRwdXQgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtcG9zaXRpb246IGxlZnQgdG9wO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtcmVwZWF0OiByZXBlYXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlxcbiAgYmFja2dyb3VuZC1zaXplOiBcIiArIHBhdHRlcm4ubGVuZ3RoICsgXCJweCBcIiArIGltYWdlSGVpZ2h0ICsgXCJweDtcIjtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcIlxcbiAgYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsXCIgKyBpbWFnZS5nZXRCYXNlNjQoKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlxcbiAgYmFja2dyb3VuZC1wb3NpdGlvbjogbGVmdCB0b3A7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlxcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IHJlcGVhdDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxuICBiYWNrZ3JvdW5kLXNpemU6IFwiICsgcGF0dGVybi5sZW5ndGggKyBcInB4IFwiICsgaW1hZ2VIZWlnaHQgKyBcInB4O1wiO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZ3RoaWNrbmVzcyA9IGd0aGlja25lc3MgKiAyO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5WVylcclxuICAgICAgICAgICAgICAgICAgICA/IHZ3VmFsdWUoc2V0dGluZ3MubGluZUhlaWdodE0sIHNldHRpbmdzLmxpbmVIZWlnaHRCLCAxKVxyXG4gICAgICAgICAgICAgICAgICAgIDogKHNldHRpbmdzLmxpbmVIZWlnaHQgPj0gc2V0dGluZ3MuZm9udFNpemUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gc2V0dGluZ3MubGluZUhlaWdodCArIHVuaXROYW1lW1VOSVQuUFhdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogc2V0dGluZ3MubGluZUhlaWdodCArIHVuaXROYW1lW3NldHRpbmdzLnVuaXRdO1xyXG5cclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcIlxcbiAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KHRvIHRvcCwgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLnJ1bGVyQ29sb3IgKyBcIiBcIiArIGd0aGlja25lc3MgKyBcIiUsIHRyYW5zcGFyZW50IFwiICtcclxuICAgICAgICAgICAgICAgICAgICBndGhpY2tuZXNzICsgXCIlKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtc2l6ZTogMTAwJSBcIiArIGxpbmVIZWlnaHQgKyBcIjtcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJ1bGVyID0gXCJcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArXHJcbiAgICAgICAgICAgICAgICBcIlxcbiAgbGVmdDogMDtcIiArXHJcbiAgICAgICAgICAgICAgICBcIlxcbiAgdG9wOiAwO1wiICtcclxuICAgICAgICAgICAgICAgIFwiXFxuICBtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgXCJcXG4gIHBhZGRpbmc6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgXCJcXG4gIHdpZHRoOiAxMDAlO1wiICtcclxuICAgICAgICAgICAgICAgIFwiXFxuICBoZWlnaHQ6IDEwMCU7XCIgK1xyXG4gICAgICAgICAgICAgICAgXCJcXG4gIHotaW5kZXg6IDk5MDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgXCJcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1wiICsgYmFja2dyb3VuZDtcclxuXHJcbiAgICAgICAgICAgIGxldCBpY29uU2l6ZSA9IHNldHRpbmdzLnJ1bGVySWNvblNpemU7XHJcblxyXG4gICAgICAgICAgICBsZXQgW3N0eWxlLCBydWxlckNsYXNzXSA9IHNldHRpbmdzLnJ1bGVyU3R5bGUuc3BsaXQoc3BhY2VTcGxpdFJlZ2V4cCk7XHJcbiAgICAgICAgICAgIGxldCBbY29sb3IsIGhvdmVyQ29sb3JdID0gc2V0dGluZ3MucnVsZXJJY29uQ29sb3JzLnNwbGl0KHNwYWNlU3BsaXRSZWdleHApO1xyXG5cclxuICAgICAgICAgICAgbGV0IHJ1bGVyUnVsZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoY21wU3RyKHN0eWxlLCBcInN3aXRjaFwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCJcXG4uXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBkaXNwbGF5OiBub25lO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBydWxlciArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl0ge1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgZGlzcGxheTpub25lO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG5pbnB1dFtpZD1cXFwiXCIgKyBydWxlckNsYXNzICsgXCJcXFwiXSArIGxhYmVsIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIHotaW5kZXg6IDk5OTk7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGVySWNvblBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgbWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgcGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIHdpZHRoOiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBoZWlnaHQ6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGN1cnNvcjogcG9pbnRlcjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHN2Zy5yZXBsYWNlKFwie2NvbG9yfVwiLCBlc2NhcGUoY29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbmlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdOmNoZWNrZWQgKyBsYWJlbCwgaW5wdXRbaWQ9XFxcIlwiICtcclxuICAgICAgICAgICAgICAgICAgICBydWxlckNsYXNzICsgXCJcXFwiXTpob3ZlciArIGxhYmVsIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgKyBzdmcucmVwbGFjZShcIntjb2xvcn1cIiwgZXNjYXBlKGhvdmVyQ29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbmlucHV0W2lkPVxcXCJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZXJDbGFzcyArIFwiXFxcIl06Y2hlY2tlZCB+IC5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGRpc3BsYXk6IGJsb2NrO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIn1cIik7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihzdHlsZSwgXCJob3ZlclwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCJcXG4uXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGVySWNvblBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgbWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgcGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIHdpZHRoOiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBoZWlnaHQ6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgKyBzdmcucmVwbGFjZShcIntjb2xvcn1cIiwgZXNjYXBlKGNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1pbWFnZSAwLjVzIGVhc2UtaW4tb3V0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCIuXCIgKyBydWxlckNsYXNzICsgXCI6aG92ZXJcIiArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgY3Vyc29yOiBwb2ludGVyO1wiICsgcnVsZXIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwifVwiKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHN0eWxlLCBcImFsd2F5c1wiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCJcXG4uXCIgKyBydWxlckNsYXNzICsgXCJ7XFxuXCIgKyBydWxlciArIFwifVxcblwiKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChydWxlclJ1bGUpIHtcclxuICAgICAgICAgICAgICAgIHJ1bGVyUnVsZS5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIHdhbGtEZWNscyhydWxlclJ1bGUpO1xyXG4gICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJ1bGUsIHJ1bGVyUnVsZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFdhbGsgaW4gbWVkaWEgcXVlcmllc1xyXG4gICAgICAgIHJ1bGUud2FsayhjaGlsZCA9PiB7XHJcbiAgICAgICAgICAgIGlmKGNtcFN0cihjaGlsZC50eXBlLCBcImF0cnVsZVwiKSl7XHJcbiAgICAgICAgICAgICAgICB3YWxrQXRSdWxlKGNoaWxkKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIoY2hpbGQudHlwZSwgXCJydWxlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXYWxrIGRlY2xzIGluIGF0cnVsZVxyXG4gICAgICAgICAgICAgICAgd2Fsa0RlY2xzKGNoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgd2Fsa0RlY2xzID0gKG5vZGUpID0+IHtcclxuXHJcbiAgICAgICAgbGV0IHJ1bGVGb250U2l6ZTtcclxuXHJcbiAgICAgICAgbm9kZS53YWxrRGVjbHMoZGVjbCA9PiB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZm91bmQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgZmluZFJ1bGVGb250U2l6ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghcnVsZUZvbnRTaXplKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC5wYXJlbnQud2Fsa0RlY2xzKGZzZGVjbCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbXBTdHIoZnNkZWNsLnByb3AsIFwiZm9udC1zaXplXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydWxlRm9udFNpemUgPSBmc2RlY2wudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZWNsLnZhbHVlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVwbGFjZSBWYXJpYWJsZXMgd2l0aCB2YWx1ZXNcclxuICAgICAgICAgICAgICAgIHdoaWxlICgoZm91bmQgPSBkZWNsLnZhbHVlLm1hdGNoKHNldHRpbmdzUmVnZXhwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdmFyaWFibGUgPSB0b0NhbWVsQ2FzZShmb3VuZFsxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb3VuZFswXSwgc2V0dGluZ3NbdmFyaWFibGVdKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVwbGFjZSBGb250IFNpemVcclxuICAgICAgICAgICAgICAgIHdoaWxlICgoZm91bmQgPSBkZWNsLnZhbHVlLm1hdGNoKGZvbnRTaXplUmVnZXhwKSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFtmb250U2l6ZSwgc2l6ZVVuaXRdID0gZm91bmRbMl0uc3BsaXQoXCIkXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzaXplVW5pdCA9IChzaXplVW5pdCkgPyBnZXRVbml0KHNpemVVbml0KSA6IHNldHRpbmdzLnVuaXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzaXplID0gZm9udFNpemVzLmdldFNpemUoZm9udFNpemUpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFdyaXRlIGZvbnQgc2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHNpemVVbml0ID09PSBVTklULlZXKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRlY2wudmFsdWUubWF0Y2gocmh5dGhtUmVnZXhwKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHNpemUucmVsICsgXCJyZW1cIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gdndWYWx1ZShzZXR0aW5ncy5mb250U2l6ZU0sIHNldHRpbmdzLmZvbnRTaXplQiwgc2l6ZS5yZWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgcmVsYXRpdmUgZm9udC1zaXplIGluIGN1cnJlbnQgcnVsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjbXBTdHIoZGVjbC5wcm9wLCBcImZvbnQtc2l6ZVwiKSB8fCBjbXBTdHIoZGVjbC5wcm9wLCBcImFkanVzdC1mb250LXNpemVcIikpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZUZvbnRTaXplID0gc2l6ZS5yZWwgKyBcInJlbVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNldHRpbmdzLnVzZUdsb2JhbCAmJiAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5FTSB8fCBzZXR0aW5ncy51bml0ID09PSBVTklULlJFTSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSBmb3JtYXRWYWx1ZShzaXplLnJlbCAqIHNldHRpbmdzLmdsb2JhbFJhdGlvKSArIHVuaXROYW1lW3NpemVVbml0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gKHNpemVVbml0ID09PSBVTklULlBYKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZm9ybWF0SW50KHNpemUucHgpICsgXCJweFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBmb3JtYXRWYWx1ZShzaXplLnJlbCkgKyB1bml0TmFtZVtzaXplVW5pdF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGRlY2wudmFsdWUucmVwbGFjZShmb3VuZFswXSwgZm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBZGp1c3QgRm9udCBTaXplXHJcbiAgICAgICAgICAgICAgICBpZiAoY21wU3RyKGRlY2wucHJvcCwgXCJhZGp1c3QtZm9udC1zaXplXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBbZm9udFNpemUsIGxpbmVzLCBiYXNlRm9udFNpemVdID0gKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZGVjbC52YWx1ZS5zcGxpdChjb21tYVNwbGl0UmVnZXhwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGRlY2wudmFsdWUuc3BsaXQoc3BhY2VTcGxpdFJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZVVuaXQgPSBnZXRVbml0KGZvbnRTaXplKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGZvbnRTaXplVW5pdCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gcmh5dGhtLmNvbnZlcnQoZm9udFNpemUsIGZvbnRTaXplVW5pdCwgVU5JVC5SRU0sIGJhc2VGb250U2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0ID0gcmh5dGhtLmxpbmVIZWlnaHQoZm9udFNpemUgKyBcInJlbVwiLCBsaW5lcywgYmFzZUZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHZ3VmFsdWUoc2V0dGluZ3MuZm9udFNpemVNLCBzZXR0aW5ncy5mb250U2l6ZUIsIGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodCA9IHJoeXRobS5saW5lSGVpZ2h0KHJ1bGVGb250U2l6ZSwgbGluZXMsIGJhc2VGb250U2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgPSB2d1ZhbHVlKHNldHRpbmdzLmxpbmVIZWlnaHRNLCBzZXR0aW5ncy5saW5lSGVpZ2h0QiwgbGluZUhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHJoeXRobS5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIG51bGwsIGJhc2VGb250U2l6ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0ID0gcmh5dGhtLmxpbmVIZWlnaHQoZm9udFNpemUgKyB1bml0TmFtZVtzZXR0aW5ncy51bml0XSwgbGluZXMsIGJhc2VGb250U2l6ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzZXR0aW5ncy51c2VHbG9iYWwgJiYgKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuRU0gfHwgc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5SRU0pKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gZm9udFNpemUgKiBzZXR0aW5ncy5nbG9iYWxSYXRpbztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5QWCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZSA9IGZvcm1hdEludChmb250U2l6ZSkgKyBcInB4XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZSA9IGZvcm1hdFZhbHVlKGZvbnRTaXplKSArIHVuaXROYW1lW3NldHRpbmdzLnVuaXRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGluZUhlaWdodERlY2wgPSBwb3N0Y3NzLmRlY2woe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImxpbmUtaGVpZ2h0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBsaW5lSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGRlY2wuc291cmNlXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBmb250U2l6ZTtcclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnByb3AgPSBcImZvbnQtc2l6ZVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wucGFyZW50Lmluc2VydEFmdGVyKGRlY2wsIGxpbmVIZWlnaHREZWNsKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBsaW5lSGVpZ2h0LCBzcGFjaW5nLCBsZWFkaW5nLCByaHl0aG0sICFyaHl0aG1cclxuICAgICAgICAgICAgICAgIHdoaWxlICgoZm91bmQgPSBkZWNsLnZhbHVlLm1hdGNoKHJoeXRobVJlZ2V4cCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhhc01pbnVzID0gc2NtcFN0cihmb3VuZFsxXSwgXCItXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm9wZXJ0eSA9IGZvdW5kWzNdOyAvLyBsaW5lSGVpZ2h0LCBzcGFjaW5nLCBsZWFkaW5nLCByaHl0aG0sICFyaHl0aG0sIGJhc2VcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGFyYW1ldGVycyA9IGZvdW5kWzRdLnNwbGl0KGNvbW1hU3BsaXRSZWdleHApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZXQgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpIGluIHBhcmFtZXRlcnMpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbdmFsdWUsIGZvbnRTaXplXSA9IHBhcmFtZXRlcnNbaV0uc3BsaXQoc3BhY2VTcGxpdFJlZ2V4cCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWZvbnRTaXplKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZighcnVsZUZvbnRTaXplKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5kUnVsZUZvbnRTaXplKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHJ1bGVGb250U2l6ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNtcFN0cihwcm9wZXJ0eSwgXCJiYXNlXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5WVykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGZvdW5kWzJdICsgdndWYWx1ZShzZXR0aW5ncy5mb250U2l6ZU0sIHNldHRpbmdzLmZvbnRTaXplQiwgdmFsdWUsIGhhc01pbnVzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGZvdW5kWzFdICsgZm91bmRbMl0gKyByaHl0aG0uYmFzZSh2YWx1ZSwgZm9udFNpemUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocHJvcGVydHksIFwibGluZWhlaWdodFwiKSB8fCBjbXBTdHIocHJvcGVydHksIFwibGhlaWdodFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJ2YWx1ZSA9IHJoeXRobS5saW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5WVykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ2YWx1ZSA9IHZ3VmFsdWUoc2V0dGluZ3MubGluZUhlaWdodE0sIHNldHRpbmdzLmxpbmVIZWlnaHRCLCBydmFsdWUsIGhhc01pbnVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChmb3VuZFsyXSArIHJ2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGZvdW5kWzFdICsgZm91bmRbMl0gKyBydmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihwcm9wZXJ0eSwgXCJzcGFjaW5nXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcnZhbHVlID0gcmh5dGhtLmxpbmVIZWlnaHQoZm9udFNpemUsIHZhbHVlLCBudWxsLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy51bml0ID09PSBVTklULlZXKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnZhbHVlID0gdndWYWx1ZShzZXR0aW5ncy5saW5lSGVpZ2h0TSwgc2V0dGluZ3MubGluZUhlaWdodEIsIHJ2YWx1ZSwgaGFzTWludXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGZvdW5kWzJdICsgcnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goZm91bmRbMV0gKyBmb3VuZFsyXSArIHJ2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHByb3BlcnR5LCBcImxlYWRpbmdcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcnZhbHVlID0gcmh5dGhtLmxlYWRpbmcodmFsdWUsIGZvbnRTaXplKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy51bml0ID09PSBVTklULlZXKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnZhbHVlID0gdndWYWx1ZShzZXR0aW5ncy5saW5lSGVpZ2h0TSAqIHJ2YWx1ZSAtIHNldHRpbmdzLmZvbnRTaXplTSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MubGluZUhlaWdodEIgKiBydmFsdWUgLSBzZXR0aW5ncy5mb250U2l6ZUIsIHZhbHVlLCBoYXNNaW51cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goZm91bmRbMl0gKyBydmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChmb3VuZFsxXSArIGZvdW5kWzJdICsgcnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocHJvcGVydHksIFwiIXJoeXRobVwiKSB8fCBjbXBTdHIocHJvcGVydHksIFwiaXJoeXRobVwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbaW5WYWx1ZSwgb3V0cHV0VW5pdF0gPSB2YWx1ZS5zcGxpdChcIiRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRVbml0ID0gVU5JVFtvdXRwdXRVbml0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBydmFsdWUgPSByaHl0aG0ucmh5dGhtKGluVmFsdWUsIGZvbnRTaXplLCB0cnVlLCBvdXRwdXRVbml0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy51bml0ID09PSBVTklULlZXKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnZhbHVlID0gdndWYWx1ZShzZXR0aW5ncy5saW5lSGVpZ2h0TSwgc2V0dGluZ3MubGluZUhlaWdodEIsIHJ2YWx1ZSwgaGFzTWludXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGZvdW5kWzJdICsgcnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goZm91bmRbMV0gKyBmb3VuZFsyXSArIHJ2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihwcm9wZXJ0eSwgXCJyaHl0aG1cIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbaW5WYWx1ZSwgb3V0cHV0VW5pdF0gPSB2YWx1ZS5zcGxpdChcIiRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRVbml0ID0gVU5JVFtvdXRwdXRVbml0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBydmFsdWUgPSByaHl0aG0ucmh5dGhtKGluVmFsdWUsIGZvbnRTaXplLCBmYWxzZSwgb3V0cHV0VW5pdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5WVykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ2YWx1ZSA9IHZ3VmFsdWUoc2V0dGluZ3MubGluZUhlaWdodE0sIHNldHRpbmdzLmxpbmVIZWlnaHRCLCBydmFsdWUsIGhhc01pbnVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChmb3VuZFsyXSArIHJ2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGZvdW5kWzFdICsgZm91bmRbMl0gKyBydmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvdW5kWzBdLCByZXQuam9pbihcIiBcIikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vcmVtIGZhbGxiYWNrXHJcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MucmVtRmFsbGJhY2sgJiYgZGVjbC52YWx1ZS5tYXRjaChyZW1SZWdleHApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC5wYXJlbnQuaW5zZXJ0QmVmb3JlKGRlY2wsIGRlY2wuY2xvbmUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcmh5dGhtLnJlbUZhbGxiYWNrKGRlY2wudmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gaWYgKHNldHRpbmdzLnJlbUZhbGxiYWNrICYmIGlzSGFzKGRlY2wudmFsdWUsIFwicmVtXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgbGV0IHZhbHVlcyA9IGRlY2wudmFsdWUuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGZvciAobGV0IGkgPSAwLCB2c2l6ZSA9IHZhbHVlcy5sZW5ndGg7IGkgPCB2c2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGlmIChpc0hhcyh2YWx1ZXNbaV0sIFwicmVtXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICB2YWx1ZXNbaV0gPSByaHl0aG1DYWxjdWxhdG9yLmNvbnZlcnQodmFsdWVzW2ldLCBVTklULlJFTSwgVU5JVC5QWCkgKyBcInB4XCI7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgZGVjbC5wYXJlbnQuaW5zZXJ0QmVmb3JlKGRlY2wsIGRlY2wuY2xvbmUoe1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB2YWx1ZTogdmFsdWVzLmpvaW4oXCIgXCIpLFxyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBzb3VyY2U6IGRlY2wuc291cmNlXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiAoY3NzKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIEBjb3B5IGFuZCBAcGFzdGUgbm9kZXM7XHJcbiAgICAgICAgbGV0IGNvcHlQYXN0ZU5vZGUgPSB7fTtcclxuICAgICAgICAvLyBNYWtlIGNvcHkgcGFzdGUgY3NzIGNvZGVcclxuICAgICAgICBjc3Mud2Fsa0F0UnVsZXMocnVsZSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjbXBTdHIocnVsZS5uYW1lLCBcImNvcHlcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IHRvQ2FtZWxDYXNlKHJ1bGUucGFyYW1zKTtcclxuICAgICAgICAgICAgICAgIGNvcHlQYXN0ZU5vZGVbbmFtZV0gPSBydWxlO1xyXG4gICAgICAgICAgICAgICAgLy9ydWxlLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocnVsZS5uYW1lLCBcInBhc3RlXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0b0NhbWVsQ2FzZShydWxlLnBhcmFtcyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbm9kZXMgPSBjb3B5UGFzdGVOb2RlW25hbWVdLm5vZGVzO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxlbiA9IG5vZGVzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QmVmb3JlKHJ1bGUsIG5vZGVzW2ldLmNsb25lKHtzb3VyY2U6IHJ1bGUuc291cmNlfSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gY29weVBhc3RlTm9kZSkge1xyXG4gICAgICAgICAgICBpZiAoY29weVBhc3RlTm9kZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICBjb3B5UGFzdGVOb2RlW2tleV0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvcHlQYXN0ZU5vZGUgPSBudWxsO1xyXG4gICAgICAgIC8vIE90aGVyIFdvcmtcclxuICAgICAgICBjc3Mud2Fsayhub2RlID0+IHtcclxuICAgICAgICAgICAgLy8gaWYgKGxhc3RGaWxlICE9IG5vZGUuc291cmNlLmlucHV0LmZpbGUpIHtcclxuICAgICAgICAgICAgLy8gXHRsYXN0RmlsZSA9IG5vZGUuc291cmNlLmlucHV0LmZpbGU7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjbXBTdHIobm9kZS50eXBlLCBcImF0cnVsZVwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHdhbGtBdFJ1bGUobm9kZSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihub2RlLnR5cGUsIFwicnVsZVwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFdhbGsgZGVjbHMgaW4gcnVsZVxyXG4gICAgICAgICAgICAgICAgd2Fsa0RlY2xzKG5vZGUpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzZXR0aW5ncy5yZW1vdmVDb21tZW50cyAmJiBjbXBTdHIobm9kZS50eXBlLCBcImNvbW1lbnRcIikpIHtcclxuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCBFeHRlbmRzIHRvIENTU1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBleHRlbmROb2Rlcykge1xyXG5cclxuICAgICAgICAgICAgbGV0IG5vZGUgPSBleHRlbmROb2Rlc1trZXldO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5vZGUuY291bnQgPiAxKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcnVsZSA9IHBvc3Rjc3MucGFyc2Uobm9kZS5zZWxlY3RvciArIFwiIHtcIiArIG5vZGUuZGVjbHMgKyBcIn1cIik7XHJcbiAgICAgICAgICAgICAgICBydWxlLnNvdXJjZSA9IG5vZGUuc291cmNlO1xyXG4gICAgICAgICAgICAgICAgbm9kZS5wYXJlbnRzWzBdLnBhcmVudC5pbnNlcnRCZWZvcmUobm9kZS5wYXJlbnRzWzBdLCBydWxlKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGVjbHMgPSBwb3N0Y3NzLnBhcnNlKG5vZGUuZGVjbHMpO1xyXG4gICAgICAgICAgICAgICAgZGVjbHMuc291cmNlID0gbm9kZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICBub2RlLnBhcmVudHNbMF0uaW5zZXJ0QWZ0ZXIobm9kZS5wcmV2LCBkZWNscyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB1bnVzZWQgcGFyZW50IG5vZGVzLlxyXG4gICAgICAgICAgICBmb3IgKGxldCBpIGluIG5vZGUucGFyZW50cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUucGFyZW50cy5oYXNPd25Qcm9wZXJ0eShpKSAmJiBub2RlLnBhcmVudHNbaV0ubm9kZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5wYXJlbnRzW2ldLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBleHRlbmROb2RlcyA9IHt9O1xyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgaGFtc3RlcjsiXX0=
