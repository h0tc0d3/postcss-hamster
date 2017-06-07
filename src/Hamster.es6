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

import FontSizes from "./FontSizes";

import {
    formatInt,
    formatValue,
    remRegexp,
    getUnit,
    extend,
    toCamelCase,
    toKebabCase,
    cmpStr,
    scmpStr,
    UNIT,
    unitName
} from "./Helpers";

import VerticalRhythm from "./VerticalRhythm";

import PngImage from "./PngImage";
// import VirtualMachine from "./VirtualMachine";

import fs from "fs";
import path from "path";

import postcss from "postcss";
// import postcss from "../../postcss/build/lib/postcss.js";

const helpers = {

    reset: fs.readFileSync(path.resolve(__dirname, "../helpers/reset.css"), "utf8"),

    normalize: fs.readFileSync(path.resolve(__dirname, "../helpers/normalize.css"), "utf8"),

    sanitize: fs.readFileSync(path.resolve(__dirname, "../helpers/sanitize.css"), "utf8"),

    boxSizingReset: "\nhtml {" +
    "\n  box-sizing: border-box;\n" +
    "}\n" +
    "*, *:before, *:after {" +
    "\n  box-sizing: inherit;\n" +
    "}\n",

    nowrap: "\n  white-space: nowrap;\n",

    forcewrap: "\n  white-space: pre;" +
    "\n  white-space: pre-line;" +
    "\n  white-space: pre-wrap;" +
    "\n  word-wrap: break-word;\n",

    ellipsis: "\n  overflow: hidden;" +
    "\n  text-overflow: ellipsis;\n",

    ellipsisTrue: "\n  white-space: nowrap;" +
    "\n  overflow: hidden;" +
    "\n  text-overflow: ellipsis;\n",

    hyphens: "\n  word-wrap: break-word;" +
    "\n  overflow-wrap: break-word;" +
    "\n  hyphens: auto;\n",

    hyphensTrue: "\n  word-wrap: break-word;" +
    "\n  overflow-wrap: break-word;" +
    "\n  word-break: break-all;" +
    "\n  hyphens: auto;\n",

    breakWord: "\n  word-wrap: break-word;" +
    "\n  overflow-wrap: break-word;" +
    "\n  word-break: break-all;\n",

    center: "\n  display: block;" +
    "\n  margin: auto;\n",

    centerTransform: "\n  position: absolute;" +
    "\n  top: 50%;" +
    "\n  left: 50%;" +
    "\n  transform: translate(-50%, -50%);\n",

    centerFlex: "\n  display: flex;" +
    "\n  align-items: center;" +
    "\n  justify-content: center;\n",

    hide: "\n  position: absolute;" +
    "\n  width: 1px;" +
    "\n  height: 1px;" +
    "\n  padding: 0;" +
    "\n  margin: -1px;" +
    "\n  overflow: hidden;" +
    "\n  clip: rect(0, 0, 0, 0);" +
    "\n  border: 0;\n",

    hideText: "\n  overflow: hidden;" +
    "\n  text-indent: 101%;" +
    "\n  white-space: nowrap;\n"
};

// fontSize property Regexp
const fontSizeRegexp = /(fontSize|fs)\s+([\-$@0-9a-zA-Z]+)/i;

// rhythm functions Regexp
const rhythmRegexp = /(-?)(\s*)(lineHeight|lheight|spacing|leading|!rhythm|irhythm|rhythm|base)\((.*?)\)/i;

// Comma split regexp
const commaSplitRegexp = /\s*,\s*/;

// Space split regexp
const spaceSplitRegexp = /\s+/;

/**
 * Return viewport calculated value.
 * @param M
 * @param B
 * @param value
 * @param hasMinus
 * @returns {string}
 */
function vwValue(M, B, value, hasMinus = false){
    let ret = (B === 0)
        ? formatValue(M * value) + "vw"
        : (B > 0)
            ? formatValue(M * value)
                + "vw + " + formatValue(B * value) + "px"
            : formatValue(M * value)
                + "vw " + formatValue(B * value).replace("-", "- ") + "px";
    return (hasMinus) ? "calc((" + ret + ") * -1)": "calc(" + ret + ")";
}
/**
 * Add Settings to settings table.
 * @param rule - current rule.
 * @param settings - settings table.
 */
function addSettings(rule, settings) {

    rule.walkDecls(decl => {

        let prop = toCamelCase(decl.prop);
        if (scmpStr(prop, "remFallback") || scmpStr(prop, "pxFallback") || scmpStr(prop, "pxBaseline") ||
            scmpStr(prop, "roundToHalfLine") || scmpStr(prop, "ruler") ||
            scmpStr(prop, "legacyBrowsers") || scmpStr(prop, "removeComments")) {

            settings[prop] = cmpStr(decl.value, "true");

        } else if (scmpStr(prop, "unit")) {

            settings.unit = getUnit(decl.value);

        } else if (scmpStr(prop, "lineHeight") || scmpStr(prop, "toLineHeight")) {

            settings[prop] = parseFloat(decl.value);

        } else if (scmpStr(prop, "fontSize") || scmpStr(prop, "toFontSize") || scmpStr(prop, "minLinePadding") ||
            scmpStr(prop, "rulerThickness") || scmpStr(prop, "rulerScale") ||
            scmpStr(prop, "browserFontSize")) {

            settings[prop] = parseInt(decl.value);

        } else {

            settings[prop] = decl.value;

        }

    });

}

function hamster(options) {

    // Default Global Settings
    let globalSettings = {

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

        unit: UNIT.EM,

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
    let toLowerCaseKeys = [
        "unit",
        "fontRatio",
        "properties",
        "rulerStyle",
        "rulerBackground",
        "rulerOutput"
    ];


    const backSettings = extend({}, globalSettings);
    // Current Settings extend({}, globalSettings)
    let settings = {};
    if(options){
        extend(globalSettings, options, false);
    }
    let settingsRegexp;
    //Current FontSizes
    let currentFontSizes = null;
    // font Sizes
    let fontSizes;
    // Vertical Rhythm Calculator
    let rhythm;
    // Last Css File
    // let lastFile;
    const image = new PngImage();
    // Extend Nodes
    let extendNodes = {};

    /**
     * Init current Settings
     */
    const initSettings = () => {
        currentFontSizes = null;
        // Add fontSizes
        if (globalSettings.fontSizes) {
            currentFontSizes = globalSettings.fontSizes;
        }

        if (settings.fontSizes) {
            currentFontSizes = (currentFontSizes)
                ? currentFontSizes + ", " + settings.fontSizes
                : settings.fontSizes;
        }

        // ToLowerCase Current Settings
        for (let key in toLowerCaseKeys) {
            if (settings.hasOwnProperty(key)) {
                settings[key] = settings[key].toLowerCase();
            }
        }

        // Save font ratio with global settings
        if(settings.useGlobal){
            settings.globalRatio = settings.fontSize / globalSettings.fontSize;
        }
        // relative line-height
        settings.lineHeightRel = settings.lineHeight > settings.fontSize
            ? settings.lineHeight / settings.fontSize : settings.lineHeight;

        // Pixel line-height
        settings.lineHeightPx = settings.lineHeight > settings.fontSize
            ? settings.lineHeight
            : (settings.lineHeight * settings.fontSize);
        if(settings.unit === UNIT.PX && settings.pxFallback) {
            settings.lineHeightPx = Math.round(settings.lineHeightPx);
        }

        if(settings.unit === UNIT.VW){

            let view = settings.viewport.split(spaceSplitRegexp);
            let from = parseFloat(view[0]);
            let to = parseFloat(view[1]);

            let viewDiff = to - from;
            settings.fontSizeM = (settings.toFontSize - settings.fontSize) / viewDiff;
            settings.fontSizeB = settings.fontSize - settings.fontSizeM * from;
            settings.fontSizeM = settings.fontSizeM * 100;

            // relative line-height
            settings.toLineHeightRel = settings.toLineHeight > settings.toFontSize
                ? settings.toLineHeight / settings.toFontSize : settings.toLineHeight;

            // Pixel line-height
            settings.toLineHeightPx = settings.toLineHeight > settings.toFontSize
                ? settings.toLineHeight
                : (settings.toLineHeight * settings.toFontSize);

            settings.lineHeightM = (settings.toLineHeightPx - settings.lineHeightPx) / viewDiff;
            settings.lineHeightB = settings.lineHeightPx - settings.lineHeightM * from;
            settings.lineHeightM = settings.lineHeightM * 100;

        }

        fontSizes = new FontSizes(settings);
        rhythm = new VerticalRhythm(settings);
        if (currentFontSizes) {
            fontSizes.addFontSizes(currentFontSizes, rhythm);
        }
        let settingsKeys = Object.keys(settings).join("|");
        //let settingsKeysString = toKebabCase(settingsKeys).replace(/-/g, "\\-");
        let settingsKeysString = toKebabCase(settingsKeys).split("-").join("\\-");
        settingsRegexp = new RegExp("\\@(" + settingsKeysString + ")", "i");
    };

    const walkAtRule = (rule, result) => {

        if (cmpStr(rule.name, "hamster")) {

            if (cmpStr(rule.params, "reset")) {

                globalSettings = extend({}, backSettings);

            } else if (!cmpStr(rule.params, "end")) {

                addSettings(rule, globalSettings);

            }
            // Reset current settings
            settings = extend({}, globalSettings);

            // Init current Settings
            initSettings();

            // Remove Rule Hamster
            rule.remove();

        } else if (cmpStr(rule.name, "ihamster") || cmpStr(rule.name, "!hamster")) {

            addSettings(rule, settings);

            // Init current Settings
            initSettings();

            rule.remove();

        } else if (cmpStr(rule.name, "ellipsis") || cmpStr(rule.name, "nowrap") ||
            cmpStr(rule.name, "forcewrap") || cmpStr(rule.name, "hyphens") || cmpStr(rule.name, "break-word")
            || cmpStr(rule.name, "hide") || cmpStr(rule.name, "center")) {

            let property = toCamelCase(rule.name + "-" + rule.params);
            if(helpers.hasOwnProperty(property)) {
                let decls = helpers[property];
                if (cmpStr(settings.properties, "inline")) {

                    let idecls = postcss.parse(decls);
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
                rule.warn(result, "Hamster Framework: property " + rule.name + " parameters: " + rule.params + "not" +
                " found!");
            }

        } else if (cmpStr(rule.name, "reset") || cmpStr(rule.name, "normalize")
            || cmpStr(rule.name, "sanitize") || cmpStr(rule.name, "box-sizing-reset")) {

            let property = toCamelCase(rule.name);
            let rules = postcss.parse(helpers[property]);
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
        } else if (cmpStr(rule.name, "baseline")) {

            let lineHeight = rhythm.lineHeight(settings.fontSize + "px");

            // baseline font size
            let fontSizeDecl;

            if (settings.pxBaseline || (settings.unit === UNIT.PX && !settings.legacyBrowsers)) {

                fontSizeDecl = postcss.decl({
                    prop: "font-size",
                    value: settings.fontSize + "px",
                    source: rule.source
                });

            } else {

                let relativeSize = 100 * settings.fontSize / settings.browserFontSize;

                fontSizeDecl = postcss.decl({
                    prop: "font-size",
                    value: formatValue(relativeSize) + "%",
                    source: rule.source
                });

            }

            let lineHeightDecl = postcss.decl({
                prop: "line-height",
                value: lineHeight,
                source: rule.source
            });


            if (cmpStr(rule.params, "html")) {

                let htmlRule = postcss.rule({
                    selector: "html",
                    source: rule.source
                });

                htmlRule.append(fontSizeDecl);
                htmlRule.append(lineHeightDecl);

                rule.parent.insertAfter(rule, htmlRule);

                if (settings.unit === UNIT.PX && settings.legacyBrowsers) {
                    let asteriskHtmlRule = postcss.rule({
                        selector: "* html",
                        source: rule.source
                    });
                    asteriskHtmlRule.append(lineHeightDecl.clone());
                    rule.parent.insertAfter(rule, asteriskHtmlRule);
                }

            } else {

                rule.parent.insertAfter(rule, lineHeightDecl);
                rule.parent.insertAfter(rule, fontSizeDecl);

                if (settings.unit === UNIT.REM && settings.remFallback) {

                    rule.parent.insertBefore(lineHeightDecl, postcss.decl({
                        prop: "line-height",
                        value: rhythm.remFallback(lineHeight),
                        source: rule.source
                    }));

                }
            }

            rule.remove();

        } else if (cmpStr(rule.name, "ruler")) {

            let rulerIconPosition = settings.rulerIconPosition.replace(/['"]/g, "");

            let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M18 24c-0.3 0-0.548-0.246-0.548-0.546V18c0-0.3 0.248-0.546 0.548-0.546h5.452  C23.754 17.454 24 17.7 24 18v5.454c0 0.3-0.246 0.546-0.548 0.546H18z M9.271 24c-0.298 0-0.543-0.246-0.543-0.546V18  c0-0.3 0.245-0.546 0.543-0.546h5.457c0.3 0 0.543 0.246 0.543 0.546v5.454c0 0.3-0.243 0.546-0.543 0.546H9.271z M0.548 24  C0.246 24 0 23.754 0 23.454V18c0-0.3 0.246-0.546 0.548-0.546H6c0.302 0 0.548 0.246 0.548 0.546v5.454C6.548 23.754 6.302 24 6 24  H0.548z M18 15.271c-0.3 0-0.548-0.244-0.548-0.542V9.272c0-0.299 0.248-0.545 0.548-0.545h5.452C23.754 8.727 24 8.973 24 9.272  v5.457c0 0.298-0.246 0.542-0.548 0.542H18z M9.271 15.271c-0.298 0-0.543-0.244-0.543-0.542V9.272c0-0.299 0.245-0.545 0.543-0.545  h5.457c0.3 0 0.543 0.246 0.543 0.545v5.457c0 0.298-0.243 0.542-0.543 0.542H9.271z M0.548 15.271C0.246 15.271 0 15.026 0 14.729  V9.272c0-0.299 0.246-0.545 0.548-0.545H6c0.302 0 0.548 0.246 0.548 0.545v5.457c0 0.298-0.246 0.542-0.548 0.542H0.548z M18 6.545  c-0.3 0-0.548-0.245-0.548-0.545V0.545C17.452 0.245 17.7 0 18 0h5.452C23.754 0 24 0.245 24 0.545V6c0 0.3-0.246 0.545-0.548 0.545  H18z M9.271 6.545C8.974 6.545 8.729 6.3 8.729 6V0.545C8.729 0.245 8.974 0 9.271 0h5.457c0.3 0 0.543 0.245 0.543 0.545V6  c0 0.3-0.243 0.545-0.543 0.545H9.271z M0.548 6.545C0.246 6.545 0 6.3 0 6V0.545C0 0.245 0.246 0 0.548 0H6  c0.302 0 0.548 0.245 0.548 0.545V6c0 0.3-0.246 0.545-0.548 0.545H0.548z%27%2F%3E%3C%2Fsvg%3E";
            // let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M0,6c0,0.301,0.246,0.545,0.549,0.545h22.906C23.756,6.545,24,6.301,24,6V2.73c0-0.305-0.244-0.549-0.545-0.549H0.549  C0.246,2.182,0,2.426,0,2.73V6z M0,13.637c0,0.297,0.246,0.545,0.549,0.545h22.906c0.301,0,0.545-0.248,0.545-0.545v-3.273  c0-0.297-0.244-0.545-0.545-0.545H0.549C0.246,9.818,0,10.066,0,10.363V13.637z M0,21.27c0,0.305,0.246,0.549,0.549,0.549h22.906  c0.301,0,0.545-0.244,0.545-0.549V18c0-0.301-0.244-0.545-0.545-0.545H0.549C0.246,17.455,0,17.699,0,18V21.27z%27%2F%3E%3C%2Fsvg%3E";

            let gthickness = settings.rulerThickness;

            let background = "";

            if (cmpStr(settings.rulerBackground, "png")) {

                let imageHeight = settings.lineHeight >= settings.fontSize ?
                    settings.lineHeight :
                    Math.round((settings.lineHeight * settings.fontSize));

                let pattern = settings.rulerPattern.split(spaceSplitRegexp);

                image.rulerMatrix(imageHeight, settings.rulerColor, pattern, settings.rulerThickness, settings.rulerScale);

                if (!cmpStr(settings.rulerOutput, "base64")) {
                    image.getFile(settings.rulerOutput);
                    background = "\n  background-image: url(\"../" + settings.rulerOutput + "\");" +
                        "\n  background-position: left top;" +
                        "\n  background-repeat: repeat;" +
                        "\n  background-size: " + pattern.length + "px " + imageHeight + "px;";

                } else {
                    background = "\n  background-image: url(\"data:image/png;base64," + image.getBase64() + "\");" +
                        "\n  background-position: left top;" +
                        "\n  background-repeat: repeat;" +
                        "\n  background-size: " + pattern.length + "px " + imageHeight + "px;";

                }

            } else {

                gthickness = gthickness * 2;
                let lineHeight = (settings.unit === UNIT.VW)
                    ? vwValue(settings.lineHeightM, settings.lineHeightB, 1)
                    : (settings.unit === UNIT.PX)
                        ? settings.lineHeightPx + unitName[UNIT.PX]
                        : settings.lineHeight + unitName[settings.unit];

                background = "\n  background-image: linear-gradient(to top, " +
                    settings.rulerColor + " " + gthickness + "%, transparent " +
                    gthickness + "%);" +
                    "\n  background-size: 100% " + lineHeight + ";";
            }

            let ruler = "\n  position: absolute;" +
                "\n  left: 0;" +
                "\n  top: 0;" +
                "\n  margin: 0;" +
                "\n  padding: 0;" +
                "\n  width: 100%;" +
                "\n  height: 100%;" +
                "\n  z-index: 9900;" +
                "\n  pointer-events: none;" + background;

            let iconSize = settings.rulerIconSize;

            let [style, rulerClass] = settings.rulerStyle.split(spaceSplitRegexp);
            let [color, hoverColor] = settings.rulerIconColors.split(spaceSplitRegexp);

            let rulerRule = null;

            if (cmpStr(style, "switch")) {

                rulerRule = postcss.parse("\n." + rulerClass + "{" +
                    "\n  display: none;" +
                    ruler +
                    "}" +
                    "\ninput[id=\"" + rulerClass + "\"] {" +
                    "\n  display:none;" +
                    "}" +
                    "\ninput[id=\"" + rulerClass + "\"] + label {" +
                    "\n  z-index: 9999;" +
                    "\n  display: inline-block;" +
                    rulerIconPosition +
                    "\n  margin: 0;" +
                    "\n  padding: 0;" +
                    "\n  width: " + iconSize + ";" +
                    "\n  height: " + iconSize + ";" +
                    "\n  cursor: pointer;" +
                    "\n  background-image: url(\"" +
                    svg.replace("{color}", escape(color)) + "\");" +
                    "}" +
                    "\ninput[id=\"" + rulerClass + "\"]:checked + label, input[id=\"" +
                    rulerClass + "\"]:hover + label {" +
                    "\n  background-image: url(\"" + svg.replace("{color}", escape(hoverColor)) + "\");" +
                    "}" +
                    "\ninput[id=\"" +
                    rulerClass + "\"]:checked ~ ." + rulerClass + "{" +
                    "\n  display: block;" +
                    "}");

            } else if (cmpStr(style, "hover")) {

                rulerRule = postcss.parse("\n." + rulerClass + "{" +
                    rulerIconPosition +
                    "\n  margin: 0;" +
                    "\n  padding: 0;" +
                    "\n  width: " + iconSize + ";" +
                    "\n  height: " + iconSize + ";" +
                    "\n  background-image: url(\"" + svg.replace("{color}", escape(color)) + "\");" +
                    "\n  transition: background-image 0.5s ease-in-out;" +
                    "}" +
                    "." + rulerClass + ":hover" + "{" +
                    "\n  cursor: pointer;" + ruler +
                    "}");

            } else if (cmpStr(style, "always")) {

                rulerRule = postcss.parse("\n." + rulerClass + "{\n" + ruler + "}\n");

            }

            if (rulerRule) {
                rulerRule.source = rule.source;
                walkDecls(rulerRule, result);
                rule.parent.insertBefore(rule, rulerRule);
            }

            rule.remove();
        }
        // Walk in media queries
        rule.walk(child => {
            if(cmpStr(child.type, "atrule")){
                walkAtRule(child, result);
            } else if (cmpStr(child.type, "rule")) {
                // Walk decls in atrule
                walkDecls(child, result);
            }

        });
    };

    const walkDecls = (node, result) => {

        let ruleFontSize;

        node.walkDecls(decl => {

            let found;

            let findRuleFontSize = () => {
                if (!ruleFontSize) {
                    decl.parent.walkDecls(fsdecl => {
                        if (cmpStr(fsdecl.prop, "font-size")) {
                            ruleFontSize = fsdecl.value;
                        }
                    });
                }
            };

            if (decl.value) {

                // Replace Variables with values
                while ((found = decl.value.match(settingsRegexp))) {
                    let variable = toCamelCase(found[1]);
                    if(settings.hasOwnProperty(variable)){
                        decl.value = decl.value.replace(found[0], settings[variable]);
                    } else {
                        decl.warn(result, "Hamster Framework: Variable @" + found[0] + " not defined!");
                    }

                }

                // Replace Font Size
                while ((found = decl.value.match(fontSizeRegexp))) {

                    let [fontSize, sizeUnit] = found[2].split("$");

                    sizeUnit = (sizeUnit) ? getUnit(sizeUnit) : settings.unit;

                    let size = fontSizes.getSize(fontSize);
                    // Write font size
                    if(size){
                        if(sizeUnit === UNIT.VW) {
                            if(decl.value.match(rhythmRegexp)){
                                fontSize = size.rel + "rem";
                            } else {
                                fontSize = vwValue(settings.fontSizeM, settings.fontSizeB, size.rel);
                            }
                            // Save relative font-size in current rule
                            if(cmpStr(decl.prop, "font-size") || cmpStr(decl.prop, "adjust-font-size")){
                                ruleFontSize = size.rel + "rem";
                            }

                        } else {
                            if(settings.useGlobal && (settings.unit === UNIT.EM || settings.unit === UNIT.REM)){
                                fontSize = formatValue(size.rel * settings.globalRatio) + unitName[sizeUnit];
                            } else {
                                fontSize = (sizeUnit === UNIT.PX)
                                    ? formatInt(size.px) + "px"
                                    : formatValue(size.rel) + unitName[sizeUnit];
                            }

                        }

                        decl.value = decl.value.replace(found[0], fontSize);
                    } else {
                        decl.warn(result, "Hamster Framework: fontsize " + found[0] + " not found!");
                    }

                }

                // Adjust Font Size
                if (cmpStr(decl.prop, "adjust-font-size")) {

                    let [fontSize, lines, baseFontSize] = (settings.unit === UNIT.VW)
                        ? decl.value.split(commaSplitRegexp)
                        : decl.value.split(spaceSplitRegexp);

                    let fontSizeUnit = getUnit(fontSize);
                    let lineHeight;

                    if (settings.unit === UNIT.VW) {

                        if(fontSizeUnit) {

                            fontSize = rhythm.convert(fontSize, fontSizeUnit, UNIT.REM, baseFontSize);
                            lineHeight = rhythm.lineHeight(fontSize + "rem", lines, baseFontSize);

                            fontSize = vwValue(settings.fontSizeM, settings.fontSizeB, fontSize);

                        } else {

                            lineHeight = rhythm.lineHeight(ruleFontSize, lines, baseFontSize);
                        }

                        lineHeight = vwValue(settings.lineHeightM, settings.lineHeightB, lineHeight);

                    } else {

                        fontSize = rhythm.convert(fontSize, fontSizeUnit, null, baseFontSize);

                        lineHeight = rhythm.lineHeight(fontSize + unitName[settings.unit], lines, baseFontSize);

                        if(settings.useGlobal && (settings.unit === UNIT.EM || settings.unit === UNIT.REM)){
                            fontSize = fontSize * settings.globalRatio;
                        }

                        if(settings.unit === UNIT.PX){
                            fontSize = formatInt(fontSize) + "px";
                        } else {
                            fontSize = formatValue(fontSize) + unitName[settings.unit];
                        }
                    }

                    let lineHeightDecl = postcss.decl({
                        prop: "line-height",
                        value: lineHeight,
                        source: decl.source
                    });

                    decl.value = fontSize;
                    decl.prop = "font-size";
                    decl.parent.insertAfter(decl, lineHeightDecl);

                }
                // lineHeight, spacing, leading, rhythm, !rhythm
                while ((found = decl.value.match(rhythmRegexp))) {
                    let hasMinus = scmpStr(found[1], "-");
                    let property = found[3]; // lineHeight, spacing, leading, rhythm, !rhythm, base
                    let parameters = found[4].split(commaSplitRegexp);
                    let ret = [];
                    for (let i in parameters) {

                        let [value, fontSize] = parameters[i].split(spaceSplitRegexp);

                        if (!fontSize) {
                            if(!ruleFontSize){
                                findRuleFontSize();
                            }
                            fontSize = ruleFontSize;
                        }

                        if (cmpStr(property, "base")) {
                            if (settings.unit === UNIT.VW) {
                                ret.push(found[2] + vwValue(settings.fontSizeM, settings.fontSizeB, value, hasMinus));
                            } else {
                                ret.push(found[1] + found[2] + rhythm.base(value, fontSize));
                            }
                        } else if (cmpStr(property, "lineheight") || cmpStr(property, "lheight")) {
                            let rvalue = rhythm.lineHeight(fontSize, value, null);
                            if (settings.unit === UNIT.VW) {
                                rvalue = vwValue(settings.lineHeightM, settings.lineHeightB, rvalue, hasMinus);
                                ret.push(found[2] + rvalue);
                            } else {
                                ret.push(found[1] + found[2] + rvalue);
                            }
                        } else if (cmpStr(property, "spacing")) {
                            let rvalue = rhythm.lineHeight(fontSize, value, null, true);
                            if (settings.unit === UNIT.VW) {
                                rvalue = vwValue(settings.lineHeightM, settings.lineHeightB, rvalue, hasMinus);
                                ret.push(found[2] + rvalue);
                            } else {
                                ret.push(found[1] + found[2] + rvalue);
                            }
                        } else if (cmpStr(property, "leading")) {

                            let rvalue = rhythm.leading(value, fontSize);
                            if (settings.unit === UNIT.VW) {
                                rvalue = vwValue(settings.lineHeightM * rvalue - settings.fontSizeM,
                                    settings.lineHeightB * rvalue - settings.fontSizeB, value, hasMinus);
                                ret.push(found[2] + rvalue);
                            } else {
                                ret.push(found[1] + found[2] + rvalue);
                            }
                        } else if (cmpStr(property, "!rhythm") || cmpStr(property, "irhythm")) {

                            let [inValue, outputUnit] = value.split("$");
                            outputUnit = UNIT[outputUnit];
                            let rvalue = rhythm.rhythm(inValue, fontSize, true, outputUnit);
                            if (settings.unit === UNIT.VW) {
                                rvalue = vwValue(settings.lineHeightM, settings.lineHeightB, rvalue, hasMinus);
                                ret.push(found[2] + rvalue);
                            } else {
                                ret.push(found[1] + found[2] + rvalue);
                            }

                        } else if (cmpStr(property, "rhythm")) {
                            let [inValue, outputUnit] = value.split("$");
                            outputUnit = UNIT[outputUnit];
                            let rvalue = rhythm.rhythm(inValue, fontSize, false, outputUnit);
                            if (settings.unit === UNIT.VW) {
                                rvalue = vwValue(settings.lineHeightM, settings.lineHeightB, rvalue, hasMinus);
                                ret.push(found[2] + rvalue);
                            } else {
                                ret.push(found[1] + found[2] + rvalue);
                            }
                        }

                    }
                    decl.value = decl.value.replace(found[0], ret.join(" "));
                }

                //rem fallback
                if (settings.remFallback && decl.value.match(remRegexp)) {
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

    return (css, result) => {

        // @copy and @paste nodes;
        let copyPasteNode = {};
        // Make copy paste css code
        css.walkAtRules(rule => {
            if (cmpStr(rule.name, "copy")) {

                let name = toCamelCase(rule.params);
                copyPasteNode[name] = rule;
                //rule.remove();

            } else if (cmpStr(rule.name, "paste")) {

                let name = toCamelCase(rule.params);
                let nodes = copyPasteNode[name].nodes;
                let len = nodes.length;
                for(let i = 0; i < len; i++){
                    rule.parent.insertBefore(rule, nodes[i].clone({source: rule.source}));
                }
                rule.remove();
            }
        });

        for (let key in copyPasteNode) {
            if (copyPasteNode.hasOwnProperty(key)) {
                copyPasteNode[key].remove();
            }
        }

        copyPasteNode = null;
        // Other Work
        css.walk(node => {
            // if (lastFile != node.source.input.file) {
            // 	lastFile = node.source.input.file;
            // }

            if (cmpStr(node.type, "atrule")) {

                walkAtRule(node, result);

            } else if (cmpStr(node.type, "rule")) {

                // Walk decls in rule
                walkDecls(node, result);

            } else if (settings.removeComments && cmpStr(node.type, "comment")) {
                node.remove();
            }

        });

        // Append Extends to CSS
        for (let key in extendNodes) {

            let node = extendNodes[key];

            if (node.count > 1) {
                let rule = postcss.parse(node.selector + " {" + node.decls + "}");
                rule.source = node.source;
                node.parents[0].parent.insertBefore(node.parents[0], rule);

            } else {
                let decls = postcss.parse(node.decls);
                decls.source = node.source;
                node.parents[0].insertAfter(node.prev, decls);
            }

            // Remove unused parent nodes.
            for (let i in node.parents) {
                if (node.parents.hasOwnProperty(i) && node.parents[i].nodes.length === 0) {
                    node.parents[i].remove();
                }
            }

        }
        extendNodes = {};
    };
}

export default hamster;