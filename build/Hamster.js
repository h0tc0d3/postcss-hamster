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

    ellipsisTrue: "\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n",

    hyphens: "\n  word-wrap: break-word;\n  overflow-wrap: break-word;\n  hyphens: auto;\n",

    hyphensTrue: "\n  word-wrap: break-word;\n  overflow-wrap: break-word;\n  word-break: break-all;\n  hyphens: auto;\n",

    breakWord: "\n  word-wrap: break-word;\n  overflow-wrap: break-word;\n  word-break: break-all;\n",

    center: "\n  display: block;\n  margin: auto;\n",

    centerTransform: "\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n",

    centerFlex: "\n  display: flex;\n  align-items: center;\n  justify-content: center;\n",

    hide: "\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  border: 0;\n",

    hideText: "\n  overflow: hidden;\n  text-indent: 101%;\n  white-space: nowrap;\n"
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
        legacyBrowsers: false,
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

    var walkAtRule = function walkAtRule(rule, result) {

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
        } else if ((0, _Helpers.cmpStr)(rule.name, "ellipsis") || (0, _Helpers.cmpStr)(rule.name, "nowrap") || (0, _Helpers.cmpStr)(rule.name, "forcewrap") || (0, _Helpers.cmpStr)(rule.name, "hyphens") || (0, _Helpers.cmpStr)(rule.name, "break-word") || (0, _Helpers.cmpStr)(rule.name, "hide") || (0, _Helpers.cmpStr)(rule.name, "center")) {

            var property = (0, _Helpers.toCamelCase)(rule.name + "-" + rule.params);
            if (helpers.hasOwnProperty(property)) {
                var decls = helpers[property];
                if ((0, _Helpers.cmpStr)(settings.properties, "inline")) {

                    var idecls = _postcss2.default.parse(decls);
                    rule.parent.insertBefore(rule, idecls);
                } else {

                    if (!extendNodes.hasOwnProperty(property)) {

                        // Save extend info
                        extendNodes[property] = {
                            selector: rule.parent.selector,
                            decls: decls,
                            parents: [rule.parent],
                            prev: rule.prev(),
                            source: rule.source,
                            count: 1
                        };
                    } else {

                        //Append selector and update counter
                        extendNodes[property].selector = extendNodes[property].selector + ", " + rule.parent.selector;
                        extendNodes[property].parents.push(rule.parent);
                        extendNodes[property].count++;
                    }
                }

                rule.remove();
            } else {
                rule.warn(result, "Hamster Framework: property " + rule.name + " parameters: " + rule.params + "not" + " found!");
            }
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
                var _lineHeight = settings.unit === _Helpers.UNIT.VW ? vwValue(settings.lineHeightM, settings.lineHeightB, 1) : settings.unit === _Helpers.UNIT.PX ? settings.lineHeightPx + _Helpers.unitName[_Helpers.UNIT.PX] : settings.lineHeight + _Helpers.unitName[settings.unit];

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
                walkDecls(rulerRule, result);
                rule.parent.insertBefore(rule, rulerRule);
            }

            rule.remove();
        }
        // Walk in media queries
        rule.walk(function (child) {
            if ((0, _Helpers.cmpStr)(child.type, "atrule")) {
                walkAtRule(child, result);
            } else if ((0, _Helpers.cmpStr)(child.type, "rule")) {
                // Walk decls in atrule
                walkDecls(child, result);
            }
        });
    };

    var walkDecls = function walkDecls(node, result) {

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
                    if (settings.hasOwnProperty(variable)) {
                        decl.value = decl.value.replace(found[0], settings[variable]);
                    } else {
                        decl.warn(result, "Hamster Framework: Variable @" + found[0] + " not defined!");
                    }
                }

                // Replace Font Size
                while (found = decl.value.match(fontSizeRegexp)) {
                    var _found$2$split = found[2].split("$"),
                        fontSize = _found$2$split[0],
                        sizeUnit = _found$2$split[1];

                    sizeUnit = sizeUnit ? (0, _Helpers.getUnit)(sizeUnit) : settings.unit;

                    var size = fontSizes.getSize(fontSize);
                    // Write font size
                    if (size) {
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
                    } else {
                        decl.warn(result, "Hamster Framework: fontsize " + found[0] + " not found!");
                    }
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

    return function (css, result) {

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

                walkAtRule(node, result);
            } else if ((0, _Helpers.cmpStr)(node.type, "rule")) {

                // Walk decls in rule
                walkDecls(node, result);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhbXN0ZXIuZXM2Il0sIm5hbWVzIjpbImhlbHBlcnMiLCJyZXNldCIsInJlYWRGaWxlU3luYyIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJub3JtYWxpemUiLCJzYW5pdGl6ZSIsImJveFNpemluZ1Jlc2V0Iiwibm93cmFwIiwiZm9yY2V3cmFwIiwiZWxsaXBzaXMiLCJlbGxpcHNpc1RydWUiLCJoeXBoZW5zIiwiaHlwaGVuc1RydWUiLCJicmVha1dvcmQiLCJjZW50ZXIiLCJjZW50ZXJUcmFuc2Zvcm0iLCJjZW50ZXJGbGV4IiwiaGlkZSIsImhpZGVUZXh0IiwiZm9udFNpemVSZWdleHAiLCJyaHl0aG1SZWdleHAiLCJjb21tYVNwbGl0UmVnZXhwIiwic3BhY2VTcGxpdFJlZ2V4cCIsInZ3VmFsdWUiLCJNIiwiQiIsInZhbHVlIiwiaGFzTWludXMiLCJyZXQiLCJyZXBsYWNlIiwiYWRkU2V0dGluZ3MiLCJydWxlIiwic2V0dGluZ3MiLCJ3YWxrRGVjbHMiLCJwcm9wIiwiZGVjbCIsInVuaXQiLCJwYXJzZUZsb2F0IiwicGFyc2VJbnQiLCJoYW1zdGVyIiwib3B0aW9ucyIsImdsb2JhbFNldHRpbmdzIiwiZm9udFNpemUiLCJ0b0ZvbnRTaXplIiwiZm9udFNpemVNIiwiZm9udFNpemVCIiwibGluZUhlaWdodCIsImxpbmVIZWlnaHRSZWwiLCJsaW5lSGVpZ2h0UHgiLCJsaW5lSGVpZ2h0TSIsImxpbmVIZWlnaHRCIiwidG9MaW5lSGVpZ2h0IiwidG9MaW5lSGVpZ2h0UHgiLCJ0b0xpbmVIZWlnaHRSZWwiLCJ2aWV3cG9ydCIsInVzZUdsb2JhbCIsImdsb2JhbFJhdGlvIiwiRU0iLCJweEZhbGxiYWNrIiwicmVtRmFsbGJhY2siLCJweEJhc2VsaW5lIiwiZm9udFJhdGlvIiwicHJvcGVydGllcyIsIm1pbkxpbmVQYWRkaW5nIiwicm91bmRUb0hhbGZMaW5lIiwicnVsZXIiLCJydWxlclN0eWxlIiwicnVsZXJJY29uUG9zaXRpb24iLCJydWxlckljb25Db2xvcnMiLCJydWxlckljb25TaXplIiwicnVsZXJDb2xvciIsInJ1bGVyVGhpY2tuZXNzIiwicnVsZXJCYWNrZ3JvdW5kIiwicnVsZXJPdXRwdXQiLCJydWxlclBhdHRlcm4iLCJydWxlclNjYWxlIiwiYnJvd3NlckZvbnRTaXplIiwibGVnYWN5QnJvd3NlcnMiLCJyZW1vdmVDb21tZW50cyIsImZvbnRTaXplcyIsInRvTG93ZXJDYXNlS2V5cyIsImJhY2tTZXR0aW5ncyIsInNldHRpbmdzUmVnZXhwIiwiY3VycmVudEZvbnRTaXplcyIsInJoeXRobSIsImltYWdlIiwiZXh0ZW5kTm9kZXMiLCJpbml0U2V0dGluZ3MiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsInRvTG93ZXJDYXNlIiwiUFgiLCJNYXRoIiwicm91bmQiLCJWVyIsInZpZXciLCJzcGxpdCIsImZyb20iLCJ0byIsInZpZXdEaWZmIiwiYWRkRm9udFNpemVzIiwic2V0dGluZ3NLZXlzIiwiT2JqZWN0Iiwia2V5cyIsImpvaW4iLCJzZXR0aW5nc0tleXNTdHJpbmciLCJSZWdFeHAiLCJ3YWxrQXRSdWxlIiwicmVzdWx0IiwibmFtZSIsInBhcmFtcyIsInJlbW92ZSIsInByb3BlcnR5IiwiZGVjbHMiLCJpZGVjbHMiLCJwYXJzZSIsInBhcmVudCIsImluc2VydEJlZm9yZSIsInNlbGVjdG9yIiwicGFyZW50cyIsInByZXYiLCJzb3VyY2UiLCJjb3VudCIsInB1c2giLCJ3YXJuIiwicnVsZXMiLCJpbnNlcnRBZnRlciIsImZvbnRTaXplRGVjbCIsInJlbGF0aXZlU2l6ZSIsImxpbmVIZWlnaHREZWNsIiwiaHRtbFJ1bGUiLCJhcHBlbmQiLCJhc3Rlcmlza0h0bWxSdWxlIiwiY2xvbmUiLCJSRU0iLCJzdmciLCJndGhpY2tuZXNzIiwiYmFja2dyb3VuZCIsImltYWdlSGVpZ2h0IiwicGF0dGVybiIsInJ1bGVyTWF0cml4IiwiZ2V0RmlsZSIsImxlbmd0aCIsImdldEJhc2U2NCIsImljb25TaXplIiwic3R5bGUiLCJydWxlckNsYXNzIiwiY29sb3IiLCJob3ZlckNvbG9yIiwicnVsZXJSdWxlIiwiZXNjYXBlIiwid2FsayIsImNoaWxkIiwidHlwZSIsIm5vZGUiLCJydWxlRm9udFNpemUiLCJmb3VuZCIsImZpbmRSdWxlRm9udFNpemUiLCJmc2RlY2wiLCJtYXRjaCIsInZhcmlhYmxlIiwic2l6ZVVuaXQiLCJzaXplIiwiZ2V0U2l6ZSIsInJlbCIsInB4IiwibGluZXMiLCJiYXNlRm9udFNpemUiLCJmb250U2l6ZVVuaXQiLCJjb252ZXJ0IiwicGFyYW1ldGVycyIsImkiLCJiYXNlIiwicnZhbHVlIiwibGVhZGluZyIsImluVmFsdWUiLCJvdXRwdXRVbml0IiwiY3NzIiwiY29weVBhc3RlTm9kZSIsIndhbGtBdFJ1bGVzIiwibm9kZXMiLCJsZW4iXSwibWFwcGluZ3MiOiI7Ozs7QUFZQTs7OztBQUVBOztBQWNBOzs7O0FBRUE7Ozs7QUFHQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUNBOztBQUVBLElBQU1BLFVBQVU7O0FBRVpDLFdBQU8sYUFBR0MsWUFBSCxDQUFnQixlQUFLQyxPQUFMLENBQWFDLFNBQWIsRUFBd0Isc0JBQXhCLENBQWhCLEVBQWlFLE1BQWpFLENBRks7O0FBSVpDLGVBQVcsYUFBR0gsWUFBSCxDQUFnQixlQUFLQyxPQUFMLENBQWFDLFNBQWIsRUFBd0IsMEJBQXhCLENBQWhCLEVBQXFFLE1BQXJFLENBSkM7O0FBTVpFLGNBQVUsYUFBR0osWUFBSCxDQUFnQixlQUFLQyxPQUFMLENBQWFDLFNBQWIsRUFBd0IseUJBQXhCLENBQWhCLEVBQW9FLE1BQXBFLENBTkU7O0FBUVpHLGlIQVJZOztBQWVaQyxZQUFRLDRCQWZJOztBQWlCWkMsc0hBakJZOztBQXNCWkMsbUVBdEJZOztBQXlCWkMsK0ZBekJZOztBQTZCWkMsMkZBN0JZOztBQWlDWkMseUhBakNZOztBQXNDWkMscUdBdENZOztBQTBDWkMsb0RBMUNZOztBQTZDWkMsZ0hBN0NZOztBQWtEWkMsMEZBbERZOztBQXNEWkMsa0tBdERZOztBQStEWkM7QUEvRFksQ0FBaEI7O0FBb0VB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QWFvRCxDQUFiLEVBQWdCUyxLQUFoQixDQUFzQnRDLE1BQXRCLEtBQWlDLENBQXZFLEVBQTBFO0FBQ3RFWSx5QkFBS25DLE9BQUwsQ0FBYW9ELENBQWIsRUFBZ0I1RCxNQUFoQjtBQUNIO0FBQ0o7QUFFSjtBQUNEekIsc0JBQWMsRUFBZDtBQUNILEtBN0VEO0FBOEVIOztrQkFFYy9DLE8iLCJmaWxlIjoiSGFtc3Rlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbW9kdWxlIEhhbXN0ZXJcclxuICpcclxuICogQGRlc2NyaXB0aW9uIFBvc3RDU1MgSGFtc3RlciBmcmFtZXdvcmsgbWFpbiBmdW5jdGlvbmFsaXR5LlxyXG4gKlxyXG4gKiBAdmVyc2lvbiAxLjBcclxuICogQGF1dGhvciBHcmlnb3J5IFZhc2lseWV2IDxwb3N0Y3NzLmhhbXN0ZXJAZ21haWwuY29tPiBodHRwczovL2dpdGh1Yi5jb20vaDB0YzBkM1xyXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNywgR3JpZ29yeSBWYXNpbHlldlxyXG4gKiBAbGljZW5zZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAsIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCBGb250U2l6ZXMgZnJvbSBcIi4vRm9udFNpemVzXCI7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgZm9ybWF0SW50LFxyXG4gICAgZm9ybWF0VmFsdWUsXHJcbiAgICByZW1SZWdleHAsXHJcbiAgICBnZXRVbml0LFxyXG4gICAgZXh0ZW5kLFxyXG4gICAgdG9DYW1lbENhc2UsXHJcbiAgICB0b0tlYmFiQ2FzZSxcclxuICAgIGNtcFN0cixcclxuICAgIHNjbXBTdHIsXHJcbiAgICBVTklULFxyXG4gICAgdW5pdE5hbWVcclxufSBmcm9tIFwiLi9IZWxwZXJzXCI7XHJcblxyXG5pbXBvcnQgVmVydGljYWxSaHl0aG0gZnJvbSBcIi4vVmVydGljYWxSaHl0aG1cIjtcclxuXHJcbmltcG9ydCBQbmdJbWFnZSBmcm9tIFwiLi9QbmdJbWFnZVwiO1xyXG4vLyBpbXBvcnQgVmlydHVhbE1hY2hpbmUgZnJvbSBcIi4vVmlydHVhbE1hY2hpbmVcIjtcclxuXHJcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuXHJcbmltcG9ydCBwb3N0Y3NzIGZyb20gXCJwb3N0Y3NzXCI7XHJcbi8vIGltcG9ydCBwb3N0Y3NzIGZyb20gXCIuLi8uLi9wb3N0Y3NzL2J1aWxkL2xpYi9wb3N0Y3NzLmpzXCI7XHJcblxyXG5jb25zdCBoZWxwZXJzID0ge1xyXG5cclxuICAgIHJlc2V0OiBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9oZWxwZXJzL3Jlc2V0LmNzc1wiKSwgXCJ1dGY4XCIpLFxyXG5cclxuICAgIG5vcm1hbGl6ZTogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vaGVscGVycy9ub3JtYWxpemUuY3NzXCIpLCBcInV0ZjhcIiksXHJcblxyXG4gICAgc2FuaXRpemU6IGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL2hlbHBlcnMvc2FuaXRpemUuY3NzXCIpLCBcInV0ZjhcIiksXHJcblxyXG4gICAgYm94U2l6aW5nUmVzZXQ6IFwiXFxuaHRtbCB7XCIgK1xyXG4gICAgXCJcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuXCIgK1xyXG4gICAgXCJ9XFxuXCIgK1xyXG4gICAgXCIqLCAqOmJlZm9yZSwgKjphZnRlciB7XCIgK1xyXG4gICAgXCJcXG4gIGJveC1zaXppbmc6IGluaGVyaXQ7XFxuXCIgK1xyXG4gICAgXCJ9XFxuXCIsXHJcblxyXG4gICAgbm93cmFwOiBcIlxcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcXG5cIixcclxuXHJcbiAgICBmb3JjZXdyYXA6IFwiXFxuICB3aGl0ZS1zcGFjZTogcHJlO1wiICtcclxuICAgIFwiXFxuICB3aGl0ZS1zcGFjZTogcHJlLWxpbmU7XCIgK1xyXG4gICAgXCJcXG4gIHdoaXRlLXNwYWNlOiBwcmUtd3JhcDtcIiArXHJcbiAgICBcIlxcbiAgd29yZC13cmFwOiBicmVhay13b3JkO1xcblwiLFxyXG5cclxuICAgIGVsbGlwc2lzOiBcIlxcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcIiArXHJcbiAgICBcIlxcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxuXCIsXHJcblxyXG4gICAgZWxsaXBzaXNUcnVlOiBcIlxcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcIiArXHJcbiAgICBcIlxcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcIiArXHJcbiAgICBcIlxcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XFxuXCIsXHJcblxyXG4gICAgaHlwaGVuczogXCJcXG4gIHdvcmQtd3JhcDogYnJlYWstd29yZDtcIiArXHJcbiAgICBcIlxcbiAgb3ZlcmZsb3ctd3JhcDogYnJlYWstd29yZDtcIiArXHJcbiAgICBcIlxcbiAgaHlwaGVuczogYXV0bztcXG5cIixcclxuXHJcbiAgICBoeXBoZW5zVHJ1ZTogXCJcXG4gIHdvcmQtd3JhcDogYnJlYWstd29yZDtcIiArXHJcbiAgICBcIlxcbiAgb3ZlcmZsb3ctd3JhcDogYnJlYWstd29yZDtcIiArXHJcbiAgICBcIlxcbiAgd29yZC1icmVhazogYnJlYWstYWxsO1wiICtcclxuICAgIFwiXFxuICBoeXBoZW5zOiBhdXRvO1xcblwiLFxyXG5cclxuICAgIGJyZWFrV29yZDogXCJcXG4gIHdvcmQtd3JhcDogYnJlYWstd29yZDtcIiArXHJcbiAgICBcIlxcbiAgb3ZlcmZsb3ctd3JhcDogYnJlYWstd29yZDtcIiArXHJcbiAgICBcIlxcbiAgd29yZC1icmVhazogYnJlYWstYWxsO1xcblwiLFxyXG5cclxuICAgIGNlbnRlcjogXCJcXG4gIGRpc3BsYXk6IGJsb2NrO1wiICtcclxuICAgIFwiXFxuICBtYXJnaW46IGF1dG87XFxuXCIsXHJcblxyXG4gICAgY2VudGVyVHJhbnNmb3JtOiBcIlxcbiAgcG9zaXRpb246IGFic29sdXRlO1wiICtcclxuICAgIFwiXFxuICB0b3A6IDUwJTtcIiArXHJcbiAgICBcIlxcbiAgbGVmdDogNTAlO1wiICtcclxuICAgIFwiXFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcXG5cIixcclxuXHJcbiAgICBjZW50ZXJGbGV4OiBcIlxcbiAgZGlzcGxheTogZmxleDtcIiArXHJcbiAgICBcIlxcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcIiArXHJcbiAgICBcIlxcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuXCIsXHJcblxyXG4gICAgaGlkZTogXCJcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArXHJcbiAgICBcIlxcbiAgd2lkdGg6IDFweDtcIiArXHJcbiAgICBcIlxcbiAgaGVpZ2h0OiAxcHg7XCIgK1xyXG4gICAgXCJcXG4gIHBhZGRpbmc6IDA7XCIgK1xyXG4gICAgXCJcXG4gIG1hcmdpbjogLTFweDtcIiArXHJcbiAgICBcIlxcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcIiArXHJcbiAgICBcIlxcbiAgY2xpcDogcmVjdCgwLCAwLCAwLCAwKTtcIiArXHJcbiAgICBcIlxcbiAgYm9yZGVyOiAwO1xcblwiLFxyXG5cclxuICAgIGhpZGVUZXh0OiBcIlxcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcIiArXHJcbiAgICBcIlxcbiAgdGV4dC1pbmRlbnQ6IDEwMSU7XCIgK1xyXG4gICAgXCJcXG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxuXCJcclxufTtcclxuXHJcbi8vIGZvbnRTaXplIHByb3BlcnR5IFJlZ2V4cFxyXG5jb25zdCBmb250U2l6ZVJlZ2V4cCA9IC8oZm9udFNpemV8ZnMpXFxzKyhbXFwtJEAwLTlhLXpBLVpdKykvaTtcclxuXHJcbi8vIHJoeXRobSBmdW5jdGlvbnMgUmVnZXhwXHJcbmNvbnN0IHJoeXRobVJlZ2V4cCA9IC8oLT8pKFxccyopKGxpbmVIZWlnaHR8bGhlaWdodHxzcGFjaW5nfGxlYWRpbmd8IXJoeXRobXxpcmh5dGhtfHJoeXRobXxiYXNlKVxcKCguKj8pXFwpL2k7XHJcblxyXG4vLyBDb21tYSBzcGxpdCByZWdleHBcclxuY29uc3QgY29tbWFTcGxpdFJlZ2V4cCA9IC9cXHMqLFxccyovO1xyXG5cclxuLy8gU3BhY2Ugc3BsaXQgcmVnZXhwXHJcbmNvbnN0IHNwYWNlU3BsaXRSZWdleHAgPSAvXFxzKy87XHJcblxyXG4vKipcclxuICogUmV0dXJuIHZpZXdwb3J0IGNhbGN1bGF0ZWQgdmFsdWUuXHJcbiAqIEBwYXJhbSBNXHJcbiAqIEBwYXJhbSBCXHJcbiAqIEBwYXJhbSB2YWx1ZVxyXG4gKiBAcGFyYW0gaGFzTWludXNcclxuICogQHJldHVybnMge3N0cmluZ31cclxuICovXHJcbmZ1bmN0aW9uIHZ3VmFsdWUoTSwgQiwgdmFsdWUsIGhhc01pbnVzID0gZmFsc2Upe1xyXG4gICAgbGV0IHJldCA9IChCID09PSAwKVxyXG4gICAgICAgID8gZm9ybWF0VmFsdWUoTSAqIHZhbHVlKSArIFwidndcIlxyXG4gICAgICAgIDogKEIgPiAwKVxyXG4gICAgICAgICAgICA/IGZvcm1hdFZhbHVlKE0gKiB2YWx1ZSlcclxuICAgICAgICAgICAgICAgICsgXCJ2dyArIFwiICsgZm9ybWF0VmFsdWUoQiAqIHZhbHVlKSArIFwicHhcIlxyXG4gICAgICAgICAgICA6IGZvcm1hdFZhbHVlKE0gKiB2YWx1ZSlcclxuICAgICAgICAgICAgICAgICsgXCJ2dyBcIiArIGZvcm1hdFZhbHVlKEIgKiB2YWx1ZSkucmVwbGFjZShcIi1cIiwgXCItIFwiKSArIFwicHhcIjtcclxuICAgIHJldHVybiAoaGFzTWludXMpID8gXCJjYWxjKChcIiArIHJldCArIFwiKSAqIC0xKVwiOiBcImNhbGMoXCIgKyByZXQgKyBcIilcIjtcclxufVxyXG4vKipcclxuICogQWRkIFNldHRpbmdzIHRvIHNldHRpbmdzIHRhYmxlLlxyXG4gKiBAcGFyYW0gcnVsZSAtIGN1cnJlbnQgcnVsZS5cclxuICogQHBhcmFtIHNldHRpbmdzIC0gc2V0dGluZ3MgdGFibGUuXHJcbiAqL1xyXG5mdW5jdGlvbiBhZGRTZXR0aW5ncyhydWxlLCBzZXR0aW5ncykge1xyXG5cclxuICAgIHJ1bGUud2Fsa0RlY2xzKGRlY2wgPT4ge1xyXG5cclxuICAgICAgICBsZXQgcHJvcCA9IHRvQ2FtZWxDYXNlKGRlY2wucHJvcCk7XHJcbiAgICAgICAgaWYgKHNjbXBTdHIocHJvcCwgXCJyZW1GYWxsYmFja1wiKSB8fCBzY21wU3RyKHByb3AsIFwicHhGYWxsYmFja1wiKSB8fCBzY21wU3RyKHByb3AsIFwicHhCYXNlbGluZVwiKSB8fFxyXG4gICAgICAgICAgICBzY21wU3RyKHByb3AsIFwicm91bmRUb0hhbGZMaW5lXCIpIHx8IHNjbXBTdHIocHJvcCwgXCJydWxlclwiKSB8fFxyXG4gICAgICAgICAgICBzY21wU3RyKHByb3AsIFwibGVnYWN5QnJvd3NlcnNcIikgfHwgc2NtcFN0cihwcm9wLCBcInJlbW92ZUNvbW1lbnRzXCIpKSB7XHJcblxyXG4gICAgICAgICAgICBzZXR0aW5nc1twcm9wXSA9IGNtcFN0cihkZWNsLnZhbHVlLCBcInRydWVcIik7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoc2NtcFN0cihwcm9wLCBcInVuaXRcIikpIHtcclxuXHJcbiAgICAgICAgICAgIHNldHRpbmdzLnVuaXQgPSBnZXRVbml0KGRlY2wudmFsdWUpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHNjbXBTdHIocHJvcCwgXCJsaW5lSGVpZ2h0XCIpIHx8IHNjbXBTdHIocHJvcCwgXCJ0b0xpbmVIZWlnaHRcIikpIHtcclxuXHJcbiAgICAgICAgICAgIHNldHRpbmdzW3Byb3BdID0gcGFyc2VGbG9hdChkZWNsLnZhbHVlKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChzY21wU3RyKHByb3AsIFwiZm9udFNpemVcIikgfHwgc2NtcFN0cihwcm9wLCBcInRvRm9udFNpemVcIikgfHwgc2NtcFN0cihwcm9wLCBcIm1pbkxpbmVQYWRkaW5nXCIpIHx8XHJcbiAgICAgICAgICAgIHNjbXBTdHIocHJvcCwgXCJydWxlclRoaWNrbmVzc1wiKSB8fCBzY21wU3RyKHByb3AsIFwicnVsZXJTY2FsZVwiKSB8fFxyXG4gICAgICAgICAgICBzY21wU3RyKHByb3AsIFwiYnJvd3NlckZvbnRTaXplXCIpKSB7XHJcblxyXG4gICAgICAgICAgICBzZXR0aW5nc1twcm9wXSA9IHBhcnNlSW50KGRlY2wudmFsdWUpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgc2V0dGluZ3NbcHJvcF0gPSBkZWNsLnZhbHVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfSk7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW1zdGVyKG9wdGlvbnMpIHtcclxuXHJcbiAgICAvLyBEZWZhdWx0IEdsb2JhbCBTZXR0aW5nc1xyXG4gICAgbGV0IGdsb2JhbFNldHRpbmdzID0ge1xyXG5cclxuICAgICAgICBmb250U2l6ZTogMTYsXHJcbiAgICAgICAgdG9Gb250U2l6ZTogMCxcclxuICAgICAgICBmb250U2l6ZU06IDAsXHJcbiAgICAgICAgZm9udFNpemVCOiAwLFxyXG5cclxuICAgICAgICBsaW5lSGVpZ2h0OiAxLjUsXHJcbiAgICAgICAgbGluZUhlaWdodFJlbDogMCxcclxuICAgICAgICBsaW5lSGVpZ2h0UHg6IDAsXHJcbiAgICAgICAgbGluZUhlaWdodE06IDAsXHJcbiAgICAgICAgbGluZUhlaWdodEI6IDAsXHJcbiAgICAgICAgdG9MaW5lSGVpZ2h0OiAwLFxyXG4gICAgICAgIHRvTGluZUhlaWdodFB4OiAwLFxyXG4gICAgICAgIHRvTGluZUhlaWdodFJlbDogMCxcclxuICAgICAgICB2aWV3cG9ydDogbnVsbCxcclxuXHJcbiAgICAgICAgdXNlR2xvYmFsOiBmYWxzZSxcclxuICAgICAgICBnbG9iYWxSYXRpbzogMCxcclxuXHJcbiAgICAgICAgdW5pdDogVU5JVC5FTSxcclxuXHJcbiAgICAgICAgcHhGYWxsYmFjazogZmFsc2UsXHJcbiAgICAgICAgcmVtRmFsbGJhY2s6IHRydWUsXHJcbiAgICAgICAgcHhCYXNlbGluZTogZmFsc2UsXHJcbiAgICAgICAgZm9udFJhdGlvOiBcIjEuMjVcIixcclxuXHJcbiAgICAgICAgcHJvcGVydGllczogXCJpbmxpbmVcIixcclxuXHJcbiAgICAgICAgbWluTGluZVBhZGRpbmc6IDIsXHJcbiAgICAgICAgcm91bmRUb0hhbGZMaW5lOiBmYWxzZSxcclxuXHJcbiAgICAgICAgcnVsZXI6IHRydWUsXHJcbiAgICAgICAgcnVsZXJTdHlsZTogXCJhbHdheXMgcnVsZXItZGVidWdcIixcclxuICAgICAgICBydWxlckljb25Qb3NpdGlvbjogXCJwb3NpdGlvbjpmaXhlZDt0b3A6IHNwYWNpbmcoMSk7bGVmdDogc3BhY2luZygxKTtcIixcclxuICAgICAgICBydWxlckljb25Db2xvcnM6IFwiI2NjY2NjYyAjNDQ1NzZhXCIsXHJcbiAgICAgICAgcnVsZXJJY29uU2l6ZTogXCJzcGFjaW5nKDEpXCIsXHJcbiAgICAgICAgcnVsZXJDb2xvcjogXCJyZ2JhKDE5LCAxMzQsIDE5MSwgLjgpXCIsXHJcbiAgICAgICAgcnVsZXJUaGlja25lc3M6IDEsXHJcbiAgICAgICAgcnVsZXJCYWNrZ3JvdW5kOiBcImdyYWRpZW50XCIsXHJcbiAgICAgICAgcnVsZXJPdXRwdXQ6IFwiYmFzZTY0XCIsXHJcbiAgICAgICAgcnVsZXJQYXR0ZXJuOiBcIjEgMCAwIDBcIixcclxuICAgICAgICBydWxlclNjYWxlOiAxLFxyXG5cclxuICAgICAgICBicm93c2VyRm9udFNpemU6IDE2LFxyXG4gICAgICAgIGxlZ2FjeUJyb3dzZXJzOiBmYWxzZSxcclxuICAgICAgICByZW1vdmVDb21tZW50czogZmFsc2UsXHJcbiAgICAgICAgZm9udFNpemVzOiBudWxsXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFZhbHVlIHRvTG93ZXJDYXNlKClcclxuICAgIGxldCB0b0xvd2VyQ2FzZUtleXMgPSBbXHJcbiAgICAgICAgXCJ1bml0XCIsXHJcbiAgICAgICAgXCJmb250UmF0aW9cIixcclxuICAgICAgICBcInByb3BlcnRpZXNcIixcclxuICAgICAgICBcInJ1bGVyU3R5bGVcIixcclxuICAgICAgICBcInJ1bGVyQmFja2dyb3VuZFwiLFxyXG4gICAgICAgIFwicnVsZXJPdXRwdXRcIlxyXG4gICAgXTtcclxuXHJcblxyXG4gICAgY29uc3QgYmFja1NldHRpbmdzID0gZXh0ZW5kKHt9LCBnbG9iYWxTZXR0aW5ncyk7XHJcbiAgICAvLyBDdXJyZW50IFNldHRpbmdzIGV4dGVuZCh7fSwgZ2xvYmFsU2V0dGluZ3MpXHJcbiAgICBsZXQgc2V0dGluZ3MgPSB7fTtcclxuICAgIGlmKG9wdGlvbnMpe1xyXG4gICAgICAgIGV4dGVuZChnbG9iYWxTZXR0aW5ncywgb3B0aW9ucywgZmFsc2UpO1xyXG4gICAgfVxyXG4gICAgbGV0IHNldHRpbmdzUmVnZXhwO1xyXG4gICAgLy9DdXJyZW50IEZvbnRTaXplc1xyXG4gICAgbGV0IGN1cnJlbnRGb250U2l6ZXMgPSBudWxsO1xyXG4gICAgLy8gZm9udCBTaXplc1xyXG4gICAgbGV0IGZvbnRTaXplcztcclxuICAgIC8vIFZlcnRpY2FsIFJoeXRobSBDYWxjdWxhdG9yXHJcbiAgICBsZXQgcmh5dGhtO1xyXG4gICAgLy8gTGFzdCBDc3MgRmlsZVxyXG4gICAgLy8gbGV0IGxhc3RGaWxlO1xyXG4gICAgY29uc3QgaW1hZ2UgPSBuZXcgUG5nSW1hZ2UoKTtcclxuICAgIC8vIEV4dGVuZCBOb2Rlc1xyXG4gICAgbGV0IGV4dGVuZE5vZGVzID0ge307XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbml0IGN1cnJlbnQgU2V0dGluZ3NcclxuICAgICAqL1xyXG4gICAgY29uc3QgaW5pdFNldHRpbmdzID0gKCkgPT4ge1xyXG4gICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBudWxsO1xyXG4gICAgICAgIC8vIEFkZCBmb250U2l6ZXNcclxuICAgICAgICBpZiAoZ2xvYmFsU2V0dGluZ3MuZm9udFNpemVzKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSBnbG9iYWxTZXR0aW5ncy5mb250U2l6ZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc2V0dGluZ3MuZm9udFNpemVzKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRGb250U2l6ZXMgPSAoY3VycmVudEZvbnRTaXplcylcclxuICAgICAgICAgICAgICAgID8gY3VycmVudEZvbnRTaXplcyArIFwiLCBcIiArIHNldHRpbmdzLmZvbnRTaXplc1xyXG4gICAgICAgICAgICAgICAgOiBzZXR0aW5ncy5mb250U2l6ZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUb0xvd2VyQ2FzZSBDdXJyZW50IFNldHRpbmdzXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRvTG93ZXJDYXNlS2V5cykge1xyXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3Nba2V5XSA9IHNldHRpbmdzW2tleV0udG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2F2ZSBmb250IHJhdGlvIHdpdGggZ2xvYmFsIHNldHRpbmdzXHJcbiAgICAgICAgaWYoc2V0dGluZ3MudXNlR2xvYmFsKXtcclxuICAgICAgICAgICAgc2V0dGluZ3MuZ2xvYmFsUmF0aW8gPSBzZXR0aW5ncy5mb250U2l6ZSAvIGdsb2JhbFNldHRpbmdzLmZvbnRTaXplO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyByZWxhdGl2ZSBsaW5lLWhlaWdodFxyXG4gICAgICAgIHNldHRpbmdzLmxpbmVIZWlnaHRSZWwgPSBzZXR0aW5ncy5saW5lSGVpZ2h0ID4gc2V0dGluZ3MuZm9udFNpemVcclxuICAgICAgICAgICAgPyBzZXR0aW5ncy5saW5lSGVpZ2h0IC8gc2V0dGluZ3MuZm9udFNpemUgOiBzZXR0aW5ncy5saW5lSGVpZ2h0O1xyXG5cclxuICAgICAgICAvLyBQaXhlbCBsaW5lLWhlaWdodFxyXG4gICAgICAgIHNldHRpbmdzLmxpbmVIZWlnaHRQeCA9IHNldHRpbmdzLmxpbmVIZWlnaHQgPiBzZXR0aW5ncy5mb250U2l6ZVxyXG4gICAgICAgICAgICA/IHNldHRpbmdzLmxpbmVIZWlnaHRcclxuICAgICAgICAgICAgOiAoc2V0dGluZ3MubGluZUhlaWdodCAqIHNldHRpbmdzLmZvbnRTaXplKTtcclxuICAgICAgICBpZihzZXR0aW5ncy51bml0ID09PSBVTklULlBYICYmIHNldHRpbmdzLnB4RmFsbGJhY2spIHtcclxuICAgICAgICAgICAgc2V0dGluZ3MubGluZUhlaWdodFB4ID0gTWF0aC5yb3VuZChzZXR0aW5ncy5saW5lSGVpZ2h0UHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5WVyl7XHJcblxyXG4gICAgICAgICAgICBsZXQgdmlldyA9IHNldHRpbmdzLnZpZXdwb3J0LnNwbGl0KHNwYWNlU3BsaXRSZWdleHApO1xyXG4gICAgICAgICAgICBsZXQgZnJvbSA9IHBhcnNlRmxvYXQodmlld1swXSk7XHJcbiAgICAgICAgICAgIGxldCB0byA9IHBhcnNlRmxvYXQodmlld1sxXSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdmlld0RpZmYgPSB0byAtIGZyb207XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmZvbnRTaXplTSA9IChzZXR0aW5ncy50b0ZvbnRTaXplIC0gc2V0dGluZ3MuZm9udFNpemUpIC8gdmlld0RpZmY7XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmZvbnRTaXplQiA9IHNldHRpbmdzLmZvbnRTaXplIC0gc2V0dGluZ3MuZm9udFNpemVNICogZnJvbTtcclxuICAgICAgICAgICAgc2V0dGluZ3MuZm9udFNpemVNID0gc2V0dGluZ3MuZm9udFNpemVNICogMTAwO1xyXG5cclxuICAgICAgICAgICAgLy8gcmVsYXRpdmUgbGluZS1oZWlnaHRcclxuICAgICAgICAgICAgc2V0dGluZ3MudG9MaW5lSGVpZ2h0UmVsID0gc2V0dGluZ3MudG9MaW5lSGVpZ2h0ID4gc2V0dGluZ3MudG9Gb250U2l6ZVxyXG4gICAgICAgICAgICAgICAgPyBzZXR0aW5ncy50b0xpbmVIZWlnaHQgLyBzZXR0aW5ncy50b0ZvbnRTaXplIDogc2V0dGluZ3MudG9MaW5lSGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgLy8gUGl4ZWwgbGluZS1oZWlnaHRcclxuICAgICAgICAgICAgc2V0dGluZ3MudG9MaW5lSGVpZ2h0UHggPSBzZXR0aW5ncy50b0xpbmVIZWlnaHQgPiBzZXR0aW5ncy50b0ZvbnRTaXplXHJcbiAgICAgICAgICAgICAgICA/IHNldHRpbmdzLnRvTGluZUhlaWdodFxyXG4gICAgICAgICAgICAgICAgOiAoc2V0dGluZ3MudG9MaW5lSGVpZ2h0ICogc2V0dGluZ3MudG9Gb250U2l6ZSk7XHJcblxyXG4gICAgICAgICAgICBzZXR0aW5ncy5saW5lSGVpZ2h0TSA9IChzZXR0aW5ncy50b0xpbmVIZWlnaHRQeCAtIHNldHRpbmdzLmxpbmVIZWlnaHRQeCkgLyB2aWV3RGlmZjtcclxuICAgICAgICAgICAgc2V0dGluZ3MubGluZUhlaWdodEIgPSBzZXR0aW5ncy5saW5lSGVpZ2h0UHggLSBzZXR0aW5ncy5saW5lSGVpZ2h0TSAqIGZyb207XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmxpbmVIZWlnaHRNID0gc2V0dGluZ3MubGluZUhlaWdodE0gKiAxMDA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9udFNpemVzID0gbmV3IEZvbnRTaXplcyhzZXR0aW5ncyk7XHJcbiAgICAgICAgcmh5dGhtID0gbmV3IFZlcnRpY2FsUmh5dGhtKHNldHRpbmdzKTtcclxuICAgICAgICBpZiAoY3VycmVudEZvbnRTaXplcykge1xyXG4gICAgICAgICAgICBmb250U2l6ZXMuYWRkRm9udFNpemVzKGN1cnJlbnRGb250U2l6ZXMsIHJoeXRobSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzZXR0aW5nc0tleXMgPSBPYmplY3Qua2V5cyhzZXR0aW5ncykuam9pbihcInxcIik7XHJcbiAgICAgICAgLy9sZXQgc2V0dGluZ3NLZXlzU3RyaW5nID0gdG9LZWJhYkNhc2Uoc2V0dGluZ3NLZXlzKS5yZXBsYWNlKC8tL2csIFwiXFxcXC1cIik7XHJcbiAgICAgICAgbGV0IHNldHRpbmdzS2V5c1N0cmluZyA9IHRvS2ViYWJDYXNlKHNldHRpbmdzS2V5cykuc3BsaXQoXCItXCIpLmpvaW4oXCJcXFxcLVwiKTtcclxuICAgICAgICBzZXR0aW5nc1JlZ2V4cCA9IG5ldyBSZWdFeHAoXCJcXFxcQChcIiArIHNldHRpbmdzS2V5c1N0cmluZyArIFwiKVwiLCBcImlcIik7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHdhbGtBdFJ1bGUgPSAocnVsZSwgcmVzdWx0KSA9PiB7XHJcblxyXG4gICAgICAgIGlmIChjbXBTdHIocnVsZS5uYW1lLCBcImhhbXN0ZXJcIikpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChjbXBTdHIocnVsZS5wYXJhbXMsIFwicmVzZXRcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBnbG9iYWxTZXR0aW5ncyA9IGV4dGVuZCh7fSwgYmFja1NldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNtcFN0cihydWxlLnBhcmFtcywgXCJlbmRcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBhZGRTZXR0aW5ncyhydWxlLCBnbG9iYWxTZXR0aW5ncyk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFJlc2V0IGN1cnJlbnQgc2V0dGluZ3NcclxuICAgICAgICAgICAgc2V0dGluZ3MgPSBleHRlbmQoe30sIGdsb2JhbFNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgICAgICBpbml0U2V0dGluZ3MoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBSdWxlIEhhbXN0ZXJcclxuICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocnVsZS5uYW1lLCBcImloYW1zdGVyXCIpIHx8IGNtcFN0cihydWxlLm5hbWUsIFwiIWhhbXN0ZXJcIikpIHtcclxuXHJcbiAgICAgICAgICAgIGFkZFNldHRpbmdzKHJ1bGUsIHNldHRpbmdzKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEluaXQgY3VycmVudCBTZXR0aW5nc1xyXG4gICAgICAgICAgICBpbml0U2V0dGluZ3MoKTtcclxuXHJcbiAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJlbGxpcHNpc1wiKSB8fCBjbXBTdHIocnVsZS5uYW1lLCBcIm5vd3JhcFwiKSB8fFxyXG4gICAgICAgICAgICBjbXBTdHIocnVsZS5uYW1lLCBcImZvcmNld3JhcFwiKSB8fCBjbXBTdHIocnVsZS5uYW1lLCBcImh5cGhlbnNcIikgfHwgY21wU3RyKHJ1bGUubmFtZSwgXCJicmVhay13b3JkXCIpXHJcbiAgICAgICAgICAgIHx8IGNtcFN0cihydWxlLm5hbWUsIFwiaGlkZVwiKSB8fCBjbXBTdHIocnVsZS5uYW1lLCBcImNlbnRlclwiKSkge1xyXG5cclxuICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gdG9DYW1lbENhc2UocnVsZS5uYW1lICsgXCItXCIgKyBydWxlLnBhcmFtcyk7XHJcbiAgICAgICAgICAgIGlmKGhlbHBlcnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGVjbHMgPSBoZWxwZXJzW3Byb3BlcnR5XTtcclxuICAgICAgICAgICAgICAgIGlmIChjbXBTdHIoc2V0dGluZ3MucHJvcGVydGllcywgXCJpbmxpbmVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlkZWNscyA9IHBvc3Rjc3MucGFyc2UoZGVjbHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBpZGVjbHMpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZXh0ZW5kTm9kZXMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIGV4dGVuZCBpbmZvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW3Byb3BlcnR5XSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBydWxlLnBhcmVudC5zZWxlY3RvcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2xzOiBkZWNscyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHM6IFtydWxlLnBhcmVudF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2OiBydWxlLnByZXYoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9BcHBlbmQgc2VsZWN0b3IgYW5kIHVwZGF0ZSBjb3VudGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZE5vZGVzW3Byb3BlcnR5XS5zZWxlY3RvciA9IGV4dGVuZE5vZGVzW3Byb3BlcnR5XS5zZWxlY3RvciArIFwiLCBcIiArIHJ1bGUucGFyZW50LnNlbGVjdG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbmROb2Rlc1twcm9wZXJ0eV0ucGFyZW50cy5wdXNoKHJ1bGUucGFyZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kTm9kZXNbcHJvcGVydHldLmNvdW50Kys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBydWxlLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcnVsZS53YXJuKHJlc3VsdCwgXCJIYW1zdGVyIEZyYW1ld29yazogcHJvcGVydHkgXCIgKyBydWxlLm5hbWUgKyBcIiBwYXJhbWV0ZXJzOiBcIiArIHJ1bGUucGFyYW1zICsgXCJub3RcIiArXHJcbiAgICAgICAgICAgICAgICBcIiBmb3VuZCFcIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocnVsZS5uYW1lLCBcInJlc2V0XCIpIHx8IGNtcFN0cihydWxlLm5hbWUsIFwibm9ybWFsaXplXCIpXHJcbiAgICAgICAgICAgIHx8IGNtcFN0cihydWxlLm5hbWUsIFwic2FuaXRpemVcIikgfHwgY21wU3RyKHJ1bGUubmFtZSwgXCJib3gtc2l6aW5nLXJlc2V0XCIpKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgcHJvcGVydHkgPSB0b0NhbWVsQ2FzZShydWxlLm5hbWUpO1xyXG4gICAgICAgICAgICBsZXQgcnVsZXMgPSBwb3N0Y3NzLnBhcnNlKGhlbHBlcnNbcHJvcGVydHldKTtcclxuICAgICAgICAgICAgcnVsZXMuc291cmNlID0gcnVsZS5zb3VyY2U7XHJcbiAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIHJ1bGVzKTtcclxuICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICAvLyB9IGVsc2UgaWYoY21wU3RyKHJ1bGUubmFtZSwgXCJyaHl0aG1cIikpe1xyXG4gICAgICAgIC8vICAgICBsZXQgW3dpZHRoLCBoZWlnaHQsIG91dHB1dFVuaXRdID0gcnVsZS5wYXJhbS5zcGxpdChzcGFjZVNwbGl0UmVnZXhwKTtcclxuICAgICAgICAvLyAgICAgaWYoIW91dHB1dFVuaXQpe1xyXG4gICAgICAgIC8vICAgICAgICAgb3V0cHV0VW5pdCA9IHNldHRpbmdzLnVuaXQ7XHJcbiAgICAgICAgLy8gICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gICAgICAgICBvdXRwdXRVbml0ID0gVU5JVFtvdXRwdXRVbml0XTtcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vICAgICByaHl0aG0ucmh5dGhtKGhlaWdodCwgZm9udFNpemUsIGZhbHNlLCBvdXRwdXRVbml0KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihydWxlLm5hbWUsIFwiYmFzZWxpbmVcIikpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0ID0gcmh5dGhtLmxpbmVIZWlnaHQoc2V0dGluZ3MuZm9udFNpemUgKyBcInB4XCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gYmFzZWxpbmUgZm9udCBzaXplXHJcbiAgICAgICAgICAgIGxldCBmb250U2l6ZURlY2w7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MucHhCYXNlbGluZSB8fCAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5QWCAmJiAhc2V0dGluZ3MubGVnYWN5QnJvd3NlcnMpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9udFNpemVEZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wOiBcImZvbnQtc2l6ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzZXR0aW5ncy5mb250U2l6ZSArIFwicHhcIixcclxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHJlbGF0aXZlU2l6ZSA9IDEwMCAqIHNldHRpbmdzLmZvbnRTaXplIC8gc2V0dGluZ3MuYnJvd3NlckZvbnRTaXplO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvbnRTaXplRGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcDogXCJmb250LXNpemVcIixcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZm9ybWF0VmFsdWUocmVsYXRpdmVTaXplKSArIFwiJVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogcnVsZS5zb3VyY2VcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHREZWNsID0gcG9zdGNzcy5kZWNsKHtcclxuICAgICAgICAgICAgICAgIHByb3A6IFwibGluZS1oZWlnaHRcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBsaW5lSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICAgICBpZiAoY21wU3RyKHJ1bGUucGFyYW1zLCBcImh0bWxcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaHRtbFJ1bGUgPSBwb3N0Y3NzLnJ1bGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yOiBcImh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IHJ1bGUuc291cmNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBodG1sUnVsZS5hcHBlbmQoZm9udFNpemVEZWNsKTtcclxuICAgICAgICAgICAgICAgIGh0bWxSdWxlLmFwcGVuZChsaW5lSGVpZ2h0RGVjbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgcnVsZS5wYXJlbnQuaW5zZXJ0QWZ0ZXIocnVsZSwgaHRtbFJ1bGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy51bml0ID09PSBVTklULlBYICYmIHNldHRpbmdzLmxlZ2FjeUJyb3dzZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFzdGVyaXNrSHRtbFJ1bGUgPSBwb3N0Y3NzLnJ1bGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvcjogXCIqIGh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzdGVyaXNrSHRtbFJ1bGUuYXBwZW5kKGxpbmVIZWlnaHREZWNsLmNsb25lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEFmdGVyKHJ1bGUsIGFzdGVyaXNrSHRtbFJ1bGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBsaW5lSGVpZ2h0RGVjbCk7XHJcbiAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRBZnRlcihydWxlLCBmb250U2l6ZURlY2wpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy51bml0ID09PSBVTklULlJFTSAmJiBzZXR0aW5ncy5yZW1GYWxsYmFjaykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUobGluZUhlaWdodERlY2wsIHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IFwibGluZS1oZWlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJoeXRobS5yZW1GYWxsYmFjayhsaW5lSGVpZ2h0KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBydWxlLnNvdXJjZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJydWxlclwiKSkge1xyXG5cclxuICAgICAgICAgICAgbGV0IHJ1bGVySWNvblBvc2l0aW9uID0gc2V0dGluZ3MucnVsZXJJY29uUG9zaXRpb24ucmVwbGFjZSgvWydcIl0vZywgXCJcIik7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3ZnID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGY4LCUzQ3N2ZyB4bWxucyUzRCUyN2h0dHAlM0ElMkYlMkZ3d3cudzMub3JnJTJGMjAwMCUyRnN2ZyUyNyB2aWV3Qm94JTNEJTI3MCAwIDI0IDI0JTI3JTNFJTNDcGF0aCBmaWxsJTNEJTI3e2NvbG9yfSUyNyBkJTNEJTI3TTE4IDI0Yy0wLjMgMC0wLjU0OC0wLjI0Ni0wLjU0OC0wLjU0NlYxOGMwLTAuMyAwLjI0OC0wLjU0NiAwLjU0OC0wLjU0Nmg1LjQ1MiAgQzIzLjc1NCAxNy40NTQgMjQgMTcuNyAyNCAxOHY1LjQ1NGMwIDAuMy0wLjI0NiAwLjU0Ni0wLjU0OCAwLjU0NkgxOHogTTkuMjcxIDI0Yy0wLjI5OCAwLTAuNTQzLTAuMjQ2LTAuNTQzLTAuNTQ2VjE4ICBjMC0wLjMgMC4yNDUtMC41NDYgMC41NDMtMC41NDZoNS40NTdjMC4zIDAgMC41NDMgMC4yNDYgMC41NDMgMC41NDZ2NS40NTRjMCAwLjMtMC4yNDMgMC41NDYtMC41NDMgMC41NDZIOS4yNzF6IE0wLjU0OCAyNCAgQzAuMjQ2IDI0IDAgMjMuNzU0IDAgMjMuNDU0VjE4YzAtMC4zIDAuMjQ2LTAuNTQ2IDAuNTQ4LTAuNTQ2SDZjMC4zMDIgMCAwLjU0OCAwLjI0NiAwLjU0OCAwLjU0NnY1LjQ1NEM2LjU0OCAyMy43NTQgNi4zMDIgMjQgNiAyNCAgSDAuNTQ4eiBNMTggMTUuMjcxYy0wLjMgMC0wLjU0OC0wLjI0NC0wLjU0OC0wLjU0MlY5LjI3MmMwLTAuMjk5IDAuMjQ4LTAuNTQ1IDAuNTQ4LTAuNTQ1aDUuNDUyQzIzLjc1NCA4LjcyNyAyNCA4Ljk3MyAyNCA5LjI3MiAgdjUuNDU3YzAgMC4yOTgtMC4yNDYgMC41NDItMC41NDggMC41NDJIMTh6IE05LjI3MSAxNS4yNzFjLTAuMjk4IDAtMC41NDMtMC4yNDQtMC41NDMtMC41NDJWOS4yNzJjMC0wLjI5OSAwLjI0NS0wLjU0NSAwLjU0My0wLjU0NSAgaDUuNDU3YzAuMyAwIDAuNTQzIDAuMjQ2IDAuNTQzIDAuNTQ1djUuNDU3YzAgMC4yOTgtMC4yNDMgMC41NDItMC41NDMgMC41NDJIOS4yNzF6IE0wLjU0OCAxNS4yNzFDMC4yNDYgMTUuMjcxIDAgMTUuMDI2IDAgMTQuNzI5ICBWOS4yNzJjMC0wLjI5OSAwLjI0Ni0wLjU0NSAwLjU0OC0wLjU0NUg2YzAuMzAyIDAgMC41NDggMC4yNDYgMC41NDggMC41NDV2NS40NTdjMCAwLjI5OC0wLjI0NiAwLjU0Mi0wLjU0OCAwLjU0MkgwLjU0OHogTTE4IDYuNTQ1ICBjLTAuMyAwLTAuNTQ4LTAuMjQ1LTAuNTQ4LTAuNTQ1VjAuNTQ1QzE3LjQ1MiAwLjI0NSAxNy43IDAgMTggMGg1LjQ1MkMyMy43NTQgMCAyNCAwLjI0NSAyNCAwLjU0NVY2YzAgMC4zLTAuMjQ2IDAuNTQ1LTAuNTQ4IDAuNTQ1ICBIMTh6IE05LjI3MSA2LjU0NUM4Ljk3NCA2LjU0NSA4LjcyOSA2LjMgOC43MjkgNlYwLjU0NUM4LjcyOSAwLjI0NSA4Ljk3NCAwIDkuMjcxIDBoNS40NTdjMC4zIDAgMC41NDMgMC4yNDUgMC41NDMgMC41NDVWNiAgYzAgMC4zLTAuMjQzIDAuNTQ1LTAuNTQzIDAuNTQ1SDkuMjcxeiBNMC41NDggNi41NDVDMC4yNDYgNi41NDUgMCA2LjMgMCA2VjAuNTQ1QzAgMC4yNDUgMC4yNDYgMCAwLjU0OCAwSDYgIGMwLjMwMiAwIDAuNTQ4IDAuMjQ1IDAuNTQ4IDAuNTQ1VjZjMCAwLjMtMC4yNDYgMC41NDUtMC41NDggMC41NDVIMC41NDh6JTI3JTJGJTNFJTNDJTJGc3ZnJTNFXCI7XHJcbiAgICAgICAgICAgIC8vIGxldCBzdmcgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0ZjgsJTNDc3ZnIHhtbG5zJTNEJTI3aHR0cCUzQSUyRiUyRnd3dy53My5vcmclMkYyMDAwJTJGc3ZnJTI3IHZpZXdCb3glM0QlMjcwIDAgMjQgMjQlMjclM0UlM0NwYXRoIGZpbGwlM0QlMjd7Y29sb3J9JTI3IGQlM0QlMjdNMCw2YzAsMC4zMDEsMC4yNDYsMC41NDUsMC41NDksMC41NDVoMjIuOTA2QzIzLjc1Niw2LjU0NSwyNCw2LjMwMSwyNCw2VjIuNzNjMC0wLjMwNS0wLjI0NC0wLjU0OS0wLjU0NS0wLjU0OUgwLjU0OSAgQzAuMjQ2LDIuMTgyLDAsMi40MjYsMCwyLjczVjZ6IE0wLDEzLjYzN2MwLDAuMjk3LDAuMjQ2LDAuNTQ1LDAuNTQ5LDAuNTQ1aDIyLjkwNmMwLjMwMSwwLDAuNTQ1LTAuMjQ4LDAuNTQ1LTAuNTQ1di0zLjI3MyAgYzAtMC4yOTctMC4yNDQtMC41NDUtMC41NDUtMC41NDVIMC41NDlDMC4yNDYsOS44MTgsMCwxMC4wNjYsMCwxMC4zNjNWMTMuNjM3eiBNMCwyMS4yN2MwLDAuMzA1LDAuMjQ2LDAuNTQ5LDAuNTQ5LDAuNTQ5aDIyLjkwNiAgYzAuMzAxLDAsMC41NDUtMC4yNDQsMC41NDUtMC41NDlWMThjMC0wLjMwMS0wLjI0NC0wLjU0NS0wLjU0NS0wLjU0NUgwLjU0OUMwLjI0NiwxNy40NTUsMCwxNy42OTksMCwxOFYyMS4yN3olMjclMkYlM0UlM0MlMkZzdmclM0VcIjtcclxuXHJcbiAgICAgICAgICAgIGxldCBndGhpY2tuZXNzID0gc2V0dGluZ3MucnVsZXJUaGlja25lc3M7XHJcblxyXG4gICAgICAgICAgICBsZXQgYmFja2dyb3VuZCA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICBpZiAoY21wU3RyKHNldHRpbmdzLnJ1bGVyQmFja2dyb3VuZCwgXCJwbmdcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgaW1hZ2VIZWlnaHQgPSBzZXR0aW5ncy5saW5lSGVpZ2h0ID49IHNldHRpbmdzLmZvbnRTaXplID9cclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5saW5lSGVpZ2h0IDpcclxuICAgICAgICAgICAgICAgICAgICBNYXRoLnJvdW5kKChzZXR0aW5ncy5saW5lSGVpZ2h0ICogc2V0dGluZ3MuZm9udFNpemUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcGF0dGVybiA9IHNldHRpbmdzLnJ1bGVyUGF0dGVybi5zcGxpdChzcGFjZVNwbGl0UmVnZXhwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbWFnZS5ydWxlck1hdHJpeChpbWFnZUhlaWdodCwgc2V0dGluZ3MucnVsZXJDb2xvciwgcGF0dGVybiwgc2V0dGluZ3MucnVsZXJUaGlja25lc3MsIHNldHRpbmdzLnJ1bGVyU2NhbGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghY21wU3RyKHNldHRpbmdzLnJ1bGVyT3V0cHV0LCBcImJhc2U2NFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlLmdldEZpbGUoc2V0dGluZ3MucnVsZXJPdXRwdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcIlxcbiAgYmFja2dyb3VuZC1pbWFnZTogdXJsKFxcXCIuLi9cIiArIHNldHRpbmdzLnJ1bGVyT3V0cHV0ICsgXCJcXFwiKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxuICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiBsZWZ0IHRvcDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogcmVwZWF0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtc2l6ZTogXCIgKyBwYXR0ZXJuLmxlbmd0aCArIFwicHggXCIgKyBpbWFnZUhlaWdodCArIFwicHg7XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kID0gXCJcXG4gIGJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LFwiICsgaW1hZ2UuZ2V0QmFzZTY0KCkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtcG9zaXRpb246IGxlZnQgdG9wO1wiICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtcmVwZWF0OiByZXBlYXQ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlxcbiAgYmFja2dyb3VuZC1zaXplOiBcIiArIHBhdHRlcm4ubGVuZ3RoICsgXCJweCBcIiArIGltYWdlSGVpZ2h0ICsgXCJweDtcIjtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIGd0aGlja25lc3MgPSBndGhpY2tuZXNzICogMjtcclxuICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0ID0gKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpXHJcbiAgICAgICAgICAgICAgICAgICAgPyB2d1ZhbHVlKHNldHRpbmdzLmxpbmVIZWlnaHRNLCBzZXR0aW5ncy5saW5lSGVpZ2h0QiwgMSlcclxuICAgICAgICAgICAgICAgICAgICA6IChzZXR0aW5ncy51bml0ID09PSBVTklULlBYKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHNldHRpbmdzLmxpbmVIZWlnaHRQeCArIHVuaXROYW1lW1VOSVQuUFhdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogc2V0dGluZ3MubGluZUhlaWdodCArIHVuaXROYW1lW3NldHRpbmdzLnVuaXRdO1xyXG5cclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQgPSBcIlxcbiAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KHRvIHRvcCwgXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLnJ1bGVyQ29sb3IgKyBcIiBcIiArIGd0aGlja25lc3MgKyBcIiUsIHRyYW5zcGFyZW50IFwiICtcclxuICAgICAgICAgICAgICAgICAgICBndGhpY2tuZXNzICsgXCIlKTtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtc2l6ZTogMTAwJSBcIiArIGxpbmVIZWlnaHQgKyBcIjtcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHJ1bGVyID0gXCJcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcIiArXHJcbiAgICAgICAgICAgICAgICBcIlxcbiAgbGVmdDogMDtcIiArXHJcbiAgICAgICAgICAgICAgICBcIlxcbiAgdG9wOiAwO1wiICtcclxuICAgICAgICAgICAgICAgIFwiXFxuICBtYXJnaW46IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgXCJcXG4gIHBhZGRpbmc6IDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgXCJcXG4gIHdpZHRoOiAxMDAlO1wiICtcclxuICAgICAgICAgICAgICAgIFwiXFxuICBoZWlnaHQ6IDEwMCU7XCIgK1xyXG4gICAgICAgICAgICAgICAgXCJcXG4gIHotaW5kZXg6IDk5MDA7XCIgK1xyXG4gICAgICAgICAgICAgICAgXCJcXG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1wiICsgYmFja2dyb3VuZDtcclxuXHJcbiAgICAgICAgICAgIGxldCBpY29uU2l6ZSA9IHNldHRpbmdzLnJ1bGVySWNvblNpemU7XHJcblxyXG4gICAgICAgICAgICBsZXQgW3N0eWxlLCBydWxlckNsYXNzXSA9IHNldHRpbmdzLnJ1bGVyU3R5bGUuc3BsaXQoc3BhY2VTcGxpdFJlZ2V4cCk7XHJcbiAgICAgICAgICAgIGxldCBbY29sb3IsIGhvdmVyQ29sb3JdID0gc2V0dGluZ3MucnVsZXJJY29uQ29sb3JzLnNwbGl0KHNwYWNlU3BsaXRSZWdleHApO1xyXG5cclxuICAgICAgICAgICAgbGV0IHJ1bGVyUnVsZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICBpZiAoY21wU3RyKHN0eWxlLCBcInN3aXRjaFwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCJcXG4uXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBkaXNwbGF5OiBub25lO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBydWxlciArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ9XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuaW5wdXRbaWQ9XFxcIlwiICsgcnVsZXJDbGFzcyArIFwiXFxcIl0ge1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgZGlzcGxheTpub25lO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG5pbnB1dFtpZD1cXFwiXCIgKyBydWxlckNsYXNzICsgXCJcXFwiXSArIGxhYmVsIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIHotaW5kZXg6IDk5OTk7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGVySWNvblBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgbWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgcGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIHdpZHRoOiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBoZWlnaHQ6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGN1cnNvcjogcG9pbnRlcjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHN2Zy5yZXBsYWNlKFwie2NvbG9yfVwiLCBlc2NhcGUoY29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbmlucHV0W2lkPVxcXCJcIiArIHJ1bGVyQ2xhc3MgKyBcIlxcXCJdOmNoZWNrZWQgKyBsYWJlbCwgaW5wdXRbaWQ9XFxcIlwiICtcclxuICAgICAgICAgICAgICAgICAgICBydWxlckNsYXNzICsgXCJcXFwiXTpob3ZlciArIGxhYmVsIHtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgKyBzdmcucmVwbGFjZShcIntjb2xvcn1cIiwgZXNjYXBlKGhvdmVyQ29sb3IpKSArIFwiXFxcIik7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwifVwiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbmlucHV0W2lkPVxcXCJcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgcnVsZXJDbGFzcyArIFwiXFxcIl06Y2hlY2tlZCB+IC5cIiArIHJ1bGVyQ2xhc3MgKyBcIntcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGRpc3BsYXk6IGJsb2NrO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIn1cIik7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihzdHlsZSwgXCJob3ZlclwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCJcXG4uXCIgKyBydWxlckNsYXNzICsgXCJ7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGVySWNvblBvc2l0aW9uICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgbWFyZ2luOiAwO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgcGFkZGluZzogMDtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIHdpZHRoOiBcIiArIGljb25TaXplICsgXCI7XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiXFxuICBoZWlnaHQ6IFwiICsgaWNvblNpemUgKyBcIjtcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCJcXG4gIGJhY2tncm91bmQtaW1hZ2U6IHVybChcXFwiXCIgKyBzdmcucmVwbGFjZShcIntjb2xvcn1cIiwgZXNjYXBlKGNvbG9yKSkgKyBcIlxcXCIpO1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1pbWFnZSAwLjVzIGVhc2UtaW4tb3V0O1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIn1cIiArXHJcbiAgICAgICAgICAgICAgICAgICAgXCIuXCIgKyBydWxlckNsYXNzICsgXCI6aG92ZXJcIiArIFwie1wiICtcclxuICAgICAgICAgICAgICAgICAgICBcIlxcbiAgY3Vyc29yOiBwb2ludGVyO1wiICsgcnVsZXIgK1xyXG4gICAgICAgICAgICAgICAgICAgIFwifVwiKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHN0eWxlLCBcImFsd2F5c1wiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIHJ1bGVyUnVsZSA9IHBvc3Rjc3MucGFyc2UoXCJcXG4uXCIgKyBydWxlckNsYXNzICsgXCJ7XFxuXCIgKyBydWxlciArIFwifVxcblwiKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChydWxlclJ1bGUpIHtcclxuICAgICAgICAgICAgICAgIHJ1bGVyUnVsZS5zb3VyY2UgPSBydWxlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIHdhbGtEZWNscyhydWxlclJ1bGUsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICBydWxlLnBhcmVudC5pbnNlcnRCZWZvcmUocnVsZSwgcnVsZXJSdWxlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcnVsZS5yZW1vdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gV2FsayBpbiBtZWRpYSBxdWVyaWVzXHJcbiAgICAgICAgcnVsZS53YWxrKGNoaWxkID0+IHtcclxuICAgICAgICAgICAgaWYoY21wU3RyKGNoaWxkLnR5cGUsIFwiYXRydWxlXCIpKXtcclxuICAgICAgICAgICAgICAgIHdhbGtBdFJ1bGUoY2hpbGQsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKGNoaWxkLnR5cGUsIFwicnVsZVwiKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2FsayBkZWNscyBpbiBhdHJ1bGVcclxuICAgICAgICAgICAgICAgIHdhbGtEZWNscyhjaGlsZCwgcmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgd2Fsa0RlY2xzID0gKG5vZGUsIHJlc3VsdCkgPT4ge1xyXG5cclxuICAgICAgICBsZXQgcnVsZUZvbnRTaXplO1xyXG5cclxuICAgICAgICBub2RlLndhbGtEZWNscyhkZWNsID0+IHtcclxuXHJcbiAgICAgICAgICAgIGxldCBmb3VuZDtcclxuXHJcbiAgICAgICAgICAgIGxldCBmaW5kUnVsZUZvbnRTaXplID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFydWxlRm9udFNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC53YWxrRGVjbHMoZnNkZWNsID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNtcFN0cihmc2RlY2wucHJvcCwgXCJmb250LXNpemVcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVGb250U2l6ZSA9IGZzZGVjbC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlY2wudmFsdWUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIFZhcmlhYmxlcyB3aXRoIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2goc2V0dGluZ3NSZWdleHApKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB2YXJpYWJsZSA9IHRvQ2FtZWxDYXNlKGZvdW5kWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICBpZihzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSh2YXJpYWJsZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNsLnZhbHVlID0gZGVjbC52YWx1ZS5yZXBsYWNlKGZvdW5kWzBdLCBzZXR0aW5nc1t2YXJpYWJsZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2wud2FybihyZXN1bHQsIFwiSGFtc3RlciBGcmFtZXdvcms6IFZhcmlhYmxlIEBcIiArIGZvdW5kWzBdICsgXCIgbm90IGRlZmluZWQhXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUmVwbGFjZSBGb250IFNpemVcclxuICAgICAgICAgICAgICAgIHdoaWxlICgoZm91bmQgPSBkZWNsLnZhbHVlLm1hdGNoKGZvbnRTaXplUmVnZXhwKSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFtmb250U2l6ZSwgc2l6ZVVuaXRdID0gZm91bmRbMl0uc3BsaXQoXCIkXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBzaXplVW5pdCA9IChzaXplVW5pdCkgPyBnZXRVbml0KHNpemVVbml0KSA6IHNldHRpbmdzLnVuaXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzaXplID0gZm9udFNpemVzLmdldFNpemUoZm9udFNpemUpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFdyaXRlIGZvbnQgc2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHNpemUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzaXplVW5pdCA9PT0gVU5JVC5WVykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZGVjbC52YWx1ZS5tYXRjaChyaHl0aG1SZWdleHApKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHNpemUucmVsICsgXCJyZW1cIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSB2d1ZhbHVlKHNldHRpbmdzLmZvbnRTaXplTSwgc2V0dGluZ3MuZm9udFNpemVCLCBzaXplLnJlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYXZlIHJlbGF0aXZlIGZvbnQtc2l6ZSBpbiBjdXJyZW50IHJ1bGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNtcFN0cihkZWNsLnByb3AsIFwiZm9udC1zaXplXCIpIHx8IGNtcFN0cihkZWNsLnByb3AsIFwiYWRqdXN0LWZvbnQtc2l6ZVwiKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZUZvbnRTaXplID0gc2l6ZS5yZWwgKyBcInJlbVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNldHRpbmdzLnVzZUdsb2JhbCAmJiAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5FTSB8fCBzZXR0aW5ncy51bml0ID09PSBVTklULlJFTSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gZm9ybWF0VmFsdWUoc2l6ZS5yZWwgKiBzZXR0aW5ncy5nbG9iYWxSYXRpbykgKyB1bml0TmFtZVtzaXplVW5pdF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gKHNpemVVbml0ID09PSBVTklULlBYKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGZvcm1hdEludChzaXplLnB4KSArIFwicHhcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGZvcm1hdFZhbHVlKHNpemUucmVsKSArIHVuaXROYW1lW3NpemVVbml0XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm91bmRbMF0sIGZvbnRTaXplKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNsLndhcm4ocmVzdWx0LCBcIkhhbXN0ZXIgRnJhbWV3b3JrOiBmb250c2l6ZSBcIiArIGZvdW5kWzBdICsgXCIgbm90IGZvdW5kIVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFkanVzdCBGb250IFNpemVcclxuICAgICAgICAgICAgICAgIGlmIChjbXBTdHIoZGVjbC5wcm9wLCBcImFkanVzdC1mb250LXNpemVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IFtmb250U2l6ZSwgbGluZXMsIGJhc2VGb250U2l6ZV0gPSAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5WVylcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBkZWNsLnZhbHVlLnNwbGl0KGNvbW1hU3BsaXRSZWdleHApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogZGVjbC52YWx1ZS5zcGxpdChzcGFjZVNwbGl0UmVnZXhwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplVW5pdCA9IGdldFVuaXQoZm9udFNpemUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5WVykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZm9udFNpemVVbml0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSByaHl0aG0uY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCBVTklULlJFTSwgYmFzZUZvbnRTaXplKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgPSByaHl0aG0ubGluZUhlaWdodChmb250U2l6ZSArIFwicmVtXCIsIGxpbmVzLCBiYXNlRm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gdndWYWx1ZShzZXR0aW5ncy5mb250U2l6ZU0sIHNldHRpbmdzLmZvbnRTaXplQiwgZm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0ID0gcmh5dGhtLmxpbmVIZWlnaHQocnVsZUZvbnRTaXplLCBsaW5lcywgYmFzZUZvbnRTaXplKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodCA9IHZ3VmFsdWUoc2V0dGluZ3MubGluZUhlaWdodE0sIHNldHRpbmdzLmxpbmVIZWlnaHRCLCBsaW5lSGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gcmh5dGhtLmNvbnZlcnQoZm9udFNpemUsIGZvbnRTaXplVW5pdCwgbnVsbCwgYmFzZUZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgPSByaHl0aG0ubGluZUhlaWdodChmb250U2l6ZSArIHVuaXROYW1lW3NldHRpbmdzLnVuaXRdLCBsaW5lcywgYmFzZUZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNldHRpbmdzLnVzZUdsb2JhbCAmJiAoc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5FTSB8fCBzZXR0aW5ncy51bml0ID09PSBVTklULlJFTSkpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemUgPSBmb250U2l6ZSAqIHNldHRpbmdzLmdsb2JhbFJhdGlvO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihzZXR0aW5ncy51bml0ID09PSBVTklULlBYKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gZm9ybWF0SW50KGZvbnRTaXplKSArIFwicHhcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gZm9ybWF0VmFsdWUoZm9udFNpemUpICsgdW5pdE5hbWVbc2V0dGluZ3MudW5pdF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0RGVjbCA9IHBvc3Rjc3MuZGVjbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3A6IFwibGluZS1oZWlnaHRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGxpbmVIZWlnaHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogZGVjbC5zb3VyY2VcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC52YWx1ZSA9IGZvbnRTaXplO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wucHJvcCA9IFwiZm9udC1zaXplXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVjbC5wYXJlbnQuaW5zZXJ0QWZ0ZXIoZGVjbCwgbGluZUhlaWdodERlY2wpO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGxpbmVIZWlnaHQsIHNwYWNpbmcsIGxlYWRpbmcsIHJoeXRobSwgIXJoeXRobVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKChmb3VuZCA9IGRlY2wudmFsdWUubWF0Y2gocmh5dGhtUmVnZXhwKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaGFzTWludXMgPSBzY21wU3RyKGZvdW5kWzFdLCBcIi1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gZm91bmRbM107IC8vIGxpbmVIZWlnaHQsIHNwYWNpbmcsIGxlYWRpbmcsIHJoeXRobSwgIXJoeXRobSwgYmFzZVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJhbWV0ZXJzID0gZm91bmRbNF0uc3BsaXQoY29tbWFTcGxpdFJlZ2V4cCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJldCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgaW4gcGFyYW1ldGVycykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IFt2YWx1ZSwgZm9udFNpemVdID0gcGFyYW1ldGVyc1tpXS5zcGxpdChzcGFjZVNwbGl0UmVnZXhwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZm9udFNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCFydWxlRm9udFNpemUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmRSdWxlRm9udFNpemUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplID0gcnVsZUZvbnRTaXplO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY21wU3RyKHByb3BlcnR5LCBcImJhc2VcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy51bml0ID09PSBVTklULlZXKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goZm91bmRbMl0gKyB2d1ZhbHVlKHNldHRpbmdzLmZvbnRTaXplTSwgc2V0dGluZ3MuZm9udFNpemVCLCB2YWx1ZSwgaGFzTWludXMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goZm91bmRbMV0gKyBmb3VuZFsyXSArIHJoeXRobS5iYXNlKHZhbHVlLCBmb250U2l6ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihwcm9wZXJ0eSwgXCJsaW5laGVpZ2h0XCIpIHx8IGNtcFN0cihwcm9wZXJ0eSwgXCJsaGVpZ2h0XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcnZhbHVlID0gcmh5dGhtLmxpbmVIZWlnaHQoZm9udFNpemUsIHZhbHVlLCBudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy51bml0ID09PSBVTklULlZXKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnZhbHVlID0gdndWYWx1ZShzZXR0aW5ncy5saW5lSGVpZ2h0TSwgc2V0dGluZ3MubGluZUhlaWdodEIsIHJ2YWx1ZSwgaGFzTWludXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGZvdW5kWzJdICsgcnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goZm91bmRbMV0gKyBmb3VuZFsyXSArIHJ2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHByb3BlcnR5LCBcInNwYWNpbmdcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBydmFsdWUgPSByaHl0aG0ubGluZUhlaWdodChmb250U2l6ZSwgdmFsdWUsIG51bGwsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydmFsdWUgPSB2d1ZhbHVlKHNldHRpbmdzLmxpbmVIZWlnaHRNLCBzZXR0aW5ncy5saW5lSGVpZ2h0QiwgcnZhbHVlLCBoYXNNaW51cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goZm91bmRbMl0gKyBydmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChmb3VuZFsxXSArIGZvdW5kWzJdICsgcnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjbXBTdHIocHJvcGVydHksIFwibGVhZGluZ1wiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBydmFsdWUgPSByaHl0aG0ubGVhZGluZyh2YWx1ZSwgZm9udFNpemUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydmFsdWUgPSB2d1ZhbHVlKHNldHRpbmdzLmxpbmVIZWlnaHRNICogcnZhbHVlIC0gc2V0dGluZ3MuZm9udFNpemVNLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5saW5lSGVpZ2h0QiAqIHJ2YWx1ZSAtIHNldHRpbmdzLmZvbnRTaXplQiwgdmFsdWUsIGhhc01pbnVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChmb3VuZFsyXSArIHJ2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGZvdW5kWzFdICsgZm91bmRbMl0gKyBydmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihwcm9wZXJ0eSwgXCIhcmh5dGhtXCIpIHx8IGNtcFN0cihwcm9wZXJ0eSwgXCJpcmh5dGhtXCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IFtpblZhbHVlLCBvdXRwdXRVbml0XSA9IHZhbHVlLnNwbGl0KFwiJFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFVuaXQgPSBVTklUW291dHB1dFVuaXRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJ2YWx1ZSA9IHJoeXRobS5yaHl0aG0oaW5WYWx1ZSwgZm9udFNpemUsIHRydWUsIG91dHB1dFVuaXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydmFsdWUgPSB2d1ZhbHVlKHNldHRpbmdzLmxpbmVIZWlnaHRNLCBzZXR0aW5ncy5saW5lSGVpZ2h0QiwgcnZhbHVlLCBoYXNNaW51cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goZm91bmRbMl0gKyBydmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXQucHVzaChmb3VuZFsxXSArIGZvdW5kWzJdICsgcnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHByb3BlcnR5LCBcInJoeXRobVwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IFtpblZhbHVlLCBvdXRwdXRVbml0XSA9IHZhbHVlLnNwbGl0KFwiJFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFVuaXQgPSBVTklUW291dHB1dFVuaXRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJ2YWx1ZSA9IHJoeXRobS5yaHl0aG0oaW5WYWx1ZSwgZm9udFNpemUsIGZhbHNlLCBvdXRwdXRVbml0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy51bml0ID09PSBVTklULlZXKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnZhbHVlID0gdndWYWx1ZShzZXR0aW5ncy5saW5lSGVpZ2h0TSwgc2V0dGluZ3MubGluZUhlaWdodEIsIHJ2YWx1ZSwgaGFzTWludXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldC5wdXNoKGZvdW5kWzJdICsgcnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goZm91bmRbMV0gKyBmb3VuZFsyXSArIHJ2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGRlY2wudmFsdWUgPSBkZWNsLnZhbHVlLnJlcGxhY2UoZm91bmRbMF0sIHJldC5qb2luKFwiIFwiKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy9yZW0gZmFsbGJhY2tcclxuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5yZW1GYWxsYmFjayAmJiBkZWNsLnZhbHVlLm1hdGNoKHJlbVJlZ2V4cCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWNsLnBhcmVudC5pbnNlcnRCZWZvcmUoZGVjbCwgZGVjbC5jbG9uZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiByaHl0aG0ucmVtRmFsbGJhY2soZGVjbC52YWx1ZSlcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBpZiAoc2V0dGluZ3MucmVtRmFsbGJhY2sgJiYgaXNIYXMoZGVjbC52YWx1ZSwgXCJyZW1cIikpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICBsZXQgdmFsdWVzID0gZGVjbC52YWx1ZS5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgZm9yIChsZXQgaSA9IDAsIHZzaXplID0gdmFsdWVzLmxlbmd0aDsgaSA8IHZzaXplOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaWYgKGlzSGFzKHZhbHVlc1tpXSwgXCJyZW1cIikpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIHZhbHVlc1tpXSA9IHJoeXRobUNhbGN1bGF0b3IuY29udmVydCh2YWx1ZXNbaV0sIFVOSVQuUkVNLCBVTklULlBYKSArIFwicHhcIjtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgIC8vICAgICBkZWNsLnBhcmVudC5pbnNlcnRCZWZvcmUoZGVjbCwgZGVjbC5jbG9uZSh7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIHZhbHVlOiB2YWx1ZXMuam9pbihcIiBcIiksXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIHNvdXJjZTogZGVjbC5zb3VyY2VcclxuICAgICAgICAgICAgICAgIC8vICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIChjc3MsIHJlc3VsdCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBAY29weSBhbmQgQHBhc3RlIG5vZGVzO1xyXG4gICAgICAgIGxldCBjb3B5UGFzdGVOb2RlID0ge307XHJcbiAgICAgICAgLy8gTWFrZSBjb3B5IHBhc3RlIGNzcyBjb2RlXHJcbiAgICAgICAgY3NzLndhbGtBdFJ1bGVzKHJ1bGUgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJjb3B5XCIpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG5hbWUgPSB0b0NhbWVsQ2FzZShydWxlLnBhcmFtcyk7XHJcbiAgICAgICAgICAgICAgICBjb3B5UGFzdGVOb2RlW25hbWVdID0gcnVsZTtcclxuICAgICAgICAgICAgICAgIC8vcnVsZS5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY21wU3RyKHJ1bGUubmFtZSwgXCJwYXN0ZVwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gdG9DYW1lbENhc2UocnVsZS5wYXJhbXMpO1xyXG4gICAgICAgICAgICAgICAgbGV0IG5vZGVzID0gY29weVBhc3RlTm9kZVtuYW1lXS5ub2RlcztcclxuICAgICAgICAgICAgICAgIGxldCBsZW4gPSBub2Rlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUucGFyZW50Lmluc2VydEJlZm9yZShydWxlLCBub2Rlc1tpXS5jbG9uZSh7c291cmNlOiBydWxlLnNvdXJjZX0pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJ1bGUucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGNvcHlQYXN0ZU5vZGUpIHtcclxuICAgICAgICAgICAgaWYgKGNvcHlQYXN0ZU5vZGUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgY29weVBhc3RlTm9kZVtrZXldLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb3B5UGFzdGVOb2RlID0gbnVsbDtcclxuICAgICAgICAvLyBPdGhlciBXb3JrXHJcbiAgICAgICAgY3NzLndhbGsobm9kZSA9PiB7XHJcbiAgICAgICAgICAgIC8vIGlmIChsYXN0RmlsZSAhPSBub2RlLnNvdXJjZS5pbnB1dC5maWxlKSB7XHJcbiAgICAgICAgICAgIC8vIFx0bGFzdEZpbGUgPSBub2RlLnNvdXJjZS5pbnB1dC5maWxlO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY21wU3RyKG5vZGUudHlwZSwgXCJhdHJ1bGVcIikpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB3YWxrQXRSdWxlKG5vZGUsIHJlc3VsdCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNtcFN0cihub2RlLnR5cGUsIFwicnVsZVwiKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFdhbGsgZGVjbHMgaW4gcnVsZVxyXG4gICAgICAgICAgICAgICAgd2Fsa0RlY2xzKG5vZGUsIHJlc3VsdCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNldHRpbmdzLnJlbW92ZUNvbW1lbnRzICYmIGNtcFN0cihub2RlLnR5cGUsIFwiY29tbWVudFwiKSkge1xyXG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIEV4dGVuZHMgdG8gQ1NTXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGV4dGVuZE5vZGVzKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgbm9kZSA9IGV4dGVuZE5vZGVzW2tleV07XHJcblxyXG4gICAgICAgICAgICBpZiAobm9kZS5jb3VudCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBydWxlID0gcG9zdGNzcy5wYXJzZShub2RlLnNlbGVjdG9yICsgXCIge1wiICsgbm9kZS5kZWNscyArIFwifVwiKTtcclxuICAgICAgICAgICAgICAgIHJ1bGUuc291cmNlID0gbm9kZS5zb3VyY2U7XHJcbiAgICAgICAgICAgICAgICBub2RlLnBhcmVudHNbMF0ucGFyZW50Lmluc2VydEJlZm9yZShub2RlLnBhcmVudHNbMF0sIHJ1bGUpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBkZWNscyA9IHBvc3Rjc3MucGFyc2Uobm9kZS5kZWNscyk7XHJcbiAgICAgICAgICAgICAgICBkZWNscy5zb3VyY2UgPSBub2RlLnNvdXJjZTtcclxuICAgICAgICAgICAgICAgIG5vZGUucGFyZW50c1swXS5pbnNlcnRBZnRlcihub2RlLnByZXYsIGRlY2xzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIHVudXNlZCBwYXJlbnQgbm9kZXMuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgaW4gbm9kZS5wYXJlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5wYXJlbnRzLmhhc093blByb3BlcnR5KGkpICYmIG5vZGUucGFyZW50c1tpXS5ub2Rlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlLnBhcmVudHNbaV0ucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV4dGVuZE5vZGVzID0ge307XHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBoYW1zdGVyOyJdfQ==
