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

const hamster = (options) => {

    //Default Global Settings
    let globalSettings = {

        fontSize: 16,
        lineHeight: 1.5,
        unit: UNIT.EM,
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
    let toLowerCaseKeys = [
        "unit",
        "fontRatio",
        "properties",
        "rulerStyle",
        "rulerBackground",
        "rulerOutput"
    ];

    let helpers = {

        reset: fs.readFileSync(path.resolve(__dirname, "../helpers/reset.css"), "utf8"),

        normalize: fs.readFileSync(path.resolve(__dirname, "../helpers/normalize.css"), "utf8"),

        nowrap: "white-space: nowrap;",

        forcewrap: "white-space: pre;" +
            "white-space: pre-line;" +
            "white-space: pre-wrap;" +
            "word-wrap: break-word;",

        ellipsis: "overflow: hidden;" +
            "text-overflow: ellipsis;",

        hyphens: "word-wrap: break-word;" +
            "hyphens: auto;",

        breakWord:
            /* Non standard for webkit */
            "word-break: break-word;" +
            /* Warning: Needed for oldIE support, but words are broken up letter-by-letter */
            "word-break: break-all;"
    };

    // fontSize property Regexp
    const fontSizeRegexp = /fontSize\s+([\-\$\@0-9a-zA-Z]+)/i;

    // rhythm functions Regexp
    const rhythmRegexp = /(lineHeight|spacing|leading|\!rhythm|rhythm)\((.*?)\)/i;

    // Comma split regexp
    const commaSplitRegexp = /\s*\,\s*/;

    // Space split regexp
    const spaceSplitRegexp = /\s+/;

    if (options) {
        extend(globalSettings, options);
    }

    // Current Settings extend({}, globalSettings)
    let currentSettings = {};

    let currentSettingsRegexp;
    //Current FontSizes
    let currentFontSizes = null;
    // font Sizes
    let fontSizesCollection;
    // Vertical Rhythm Calculator
    let rhythmCalculator;
    // Last Css File
    // let lastFile;

    /**
     * Add Settings to settings table.
     * @param rule - current rule.
     * @param settings - settings tbale.
     */
    const addSettings = (rule, settings) => {

        rule.walkDecls(decl => {

            let prop = toCamelCase(decl.prop);

            if (scmpStr(prop, "pxFallback") || scmpStr(prop, "pxBaseline") ||
                scmpStr(prop, "roundToHalfLine") || scmpStr(prop, "ruler") ||
                scmpStr(prop, "legacyBrowsers") || scmpStr(prop, "removeComments")) {

                settings[prop] = cmpStr(decl.value, "true") ? true : false;

            } else if (scmpStr(prop, "unit")) {

                settings.unit = getUnit(decl.value);

            } else if (scmpStr(prop, "lineHeight")) {

                settings.lineHeight = parseFloat(decl.value);

            } else if (scmpStr(prop, "fontSize") || scmpStr(prop, "minLinePadding") ||
                scmpStr(prop, "rulerThickness") || scmpStr(prop, "rulerScale") ||
                scmpStr(prop, "browserFontSize")) {

                settings[prop] = parseInt(decl.value);

            } else {

                settings[prop] = decl.value;

            }

        });
    };
    var image = new PngImage();
    /**
     * Init current Settings
     */
    const initSettings = () => {
        currentFontSizes = null;
        // Add fontSizes
        if (globalSettings.fontSizes) {
            currentFontSizes = global.fontSizes;
        }

        if (currentSettings.fontSizes) {
            currentFontSizes = (currentFontSizes) ? currentFontSizes + ", " + currentSettings.fontSizes : currentSettings.fontSizes;
        }

        // ToLowerCase Current Settings
        for (let key in toLowerCaseKeys) {
            if (key in currentSettings) {
                currentSettings[key] = currentSettings[key].toLowerCase();
            }
        }
        //console.log(JSON.stringify(currentSettings, null ,2));
        fontSizesCollection = new FontSizes(currentSettings);
        rhythmCalculator = new VerticalRhythm(currentSettings);
        if (currentFontSizes) {
            fontSizesCollection.addFontSizes(currentFontSizes, rhythmCalculator);
        }
        let settingsKeys = Object.keys(currentSettings).join("|");
        let settingsKeysString = toKebabCase(settingsKeys).replace(/([\-\_])/g, "\\$1");
        currentSettingsRegexp = new RegExp("\\@(" + settingsKeysString + ")", "i");
    };

    const walkDecls = (node) => {
        node.walkDecls(decl => {

            let found;
            let ruleFontSize;

            let findRuleFontSize = () => {
                if (ruleFontSize == null) {
                    decl.parent.walkDecls(fsdecl => {
                        if (cmpStr(fsdecl.prop, "font-size")) {
                            ruleFontSize = fsdecl.value;
                        }
                    });
                }
            };

            if (decl.value) {

                // Replace Variables with values
                while ((found = decl.value.match(currentSettingsRegexp))) {
                    let variable = toCamelCase(found[1]);
                    decl.value = decl.value.replace(found[0], currentSettings[variable]);

                }

                // Replace Font Size
                while ((found = decl.value.match(fontSizeRegexp))) {

                    let [fontSize, sizeUnit] = found[1].split("$");

                    sizeUnit = (sizeUnit) ? getUnit(sizeUnit) : 0;

                    let size = fontSizesCollection.getSize(fontSize);
                    // Write font size
                    if (sizeUnit === UNIT.EM || sizeUnit === UNIT.REM) {

                        decl.value = decl.value.replace(found[0], formatValue(size.rel) + unitName[sizeUnit]);

                    } else if (sizeUnit === UNIT.PX) {

                        decl.value = decl.value.replace(found[0], formatInt(size.px) + "px");

                    } else {

                        let cfsize = currentSettings.unit === UNIT.PX ? formatInt(size.px) : formatValue(size.rel);

                        decl.value = decl.value.replace(found[0], cfsize + unitName[currentSettings.unit]);

                    }

                }

                // Adjust Font Size
                if (cmpStr(decl.prop, "adjust-font-size")) {

                    let [fontSize, lines, baseFontSize] = decl.value.split(spaceSplitRegexp);
                    let fontSizeUnit = getUnit(fontSize);
                    fontSize = rhythmCalculator.convert(fontSize, fontSizeUnit, null, baseFontSize) + unitName[currentSettings.unit];
                    decl.value = fontSize;

                    let lineHeight = rhythmCalculator.lineHeight(fontSize, lines, baseFontSize);

                    let lineHeightDecl = postcss.decl({
                        prop: "line-height",
                        value: lineHeight,
                        source: decl.source
                    });

                    decl.prop = "font-size";
                    decl.parent.insertAfter(decl, lineHeightDecl);

                }
                // lineHeight, spacing, leading, rhythm, !rhythm
                while ((found = decl.value.match(rhythmRegexp))) {

                    let property = found[1]; // lineHeight, spacing, leading, rhythm, !rhythm
                    let parameters = found[2].split(commaSplitRegexp);
                    let ret = [];
                    for (let i in parameters) {

                        let [value, fontSize] = parameters[i].split(spaceSplitRegexp);

                        if (!fontSize) {
                            findRuleFontSize();
                            fontSize = ruleFontSize;
                        }

                        if (cmpStr(property, "lineheight")) {
                            ret.push(rhythmCalculator.lineHeight(fontSize, value));
                        } else if (cmpStr(property, "spacing")) {
                            ret.push(rhythmCalculator.lineHeight(fontSize, value, null, true));
                        } else if (cmpStr(property, "leading")) {
                            ret.push(rhythmCalculator.leading(value, fontSize));
                        } else if (cmpStr(property, "!rhythm")) {
                            let [inValue, outputUnit] = value.split("$");
                            outputUnit = UNIT[outputUnit];
                            ret.push(rhythmCalculator.rhythm(inValue, fontSize, true, outputUnit));
                        } else if (cmpStr(property, "rhythm")) {
                            let [inValue, outputUnit] = value.split("$");
                            outputUnit = UNIT[outputUnit];
                            ret.push(rhythmCalculator.rhythm(inValue, fontSize, false, outputUnit));
                        }
                    }
                    decl.value = decl.value.replace(found[0], ret.join(" "));
                }

                // rem fallback
                if (currentSettings.pxFallback && decl.value.match(remRegexp)) {
                    decl.parent.insertBefore(decl, decl.clone({
                        value: rhythmCalculator.remFallback(decl.value),
                        source: decl.source
                    }));
                }
            }
        });
    };

    return (css) => {

        // Extend Nodes
        let extendNodes = {};

        css.walk(node => {
            // if (lastFile != node.source.input.file) {
            // 	lastFile = node.source.input.file;
            // }

            if (cmpStr(node.type, "atrule")) {

                let rule = node;

                if (cmpStr(rule.name, "hamster")) {

                    if (!cmpStr(rule.params, "end")) {
                    
                        addSettings(rule, globalSettings);

                    }
                    // Reset current settings
                    currentSettings = extend({}, globalSettings);

                    // Init current Settings
                    initSettings();

                    // Remove Rule Hamster
                    rule.remove();

                } else if (cmpStr(rule.name, "!hamster")) {

                    addSettings(rule, currentSettings);

                    // Init current Settings
                    initSettings();

                    rule.remove();

                } else if (cmpStr(rule.name, "baseline")) {

                    let lineHeight = rhythmCalculator.lineHeight(currentSettings.fontSize + "px");

                    // baseline font size
                    let fontSizeDecl = null;

                    if (currentSettings.pxBaseline || (currentSettings.unit === UNIT.PX && !currentSettings.legacyBrowsers)) {

                        fontSizeDecl = postcss.decl({
                            prop: "font-size",
                            value: currentSettings.fontSize + "px",
                            source: rule.source
                        });

                    } else {

                        let relativeSize = 100 * currentSettings.fontSize / currentSettings.browserFontSize;

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

                        if (currentSettings.unit === UNIT.PX && currentSettings.legacyBrowsers) {
                            let asteriskHtmlRule = postcss.rule({
                                selector: "* html",
                                source: rule.source
                            });
                            asteriskHtmlRule.append(lineHeightDecl);
                            rule.parent.insertAfter(rule, asteriskHtmlRule);
                        }

                    } else {

                        rule.parent.insertAfter(rule, lineHeightDecl);
                        rule.parent.insertAfter(rule, fontSizeDecl);

                        if (currentSettings.unit === UNIT.REM && currentSettings.pxFallback) {

                            rule.parent.insertBefore(lineHeightDecl, postcss.decl({
                                prop: "line-height",
                                value: rhythmCalculator.remFallback(lineHeight),
                                source: rule.source
                            }));

                        }
                    }

                    rule.remove();

                } else if (cmpStr(rule.name, "ruler")) {

                    let rulerIconPosition = currentSettings.rulerIconPosition.replace(/[\'\"]/g, "");

                    let lineHeight = currentSettings.lineHeight >= currentSettings.fontSize ? currentSettings.lineHeight : currentSettings.lineHeight + "em";

                    //let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M18 24c-0.3 0-0.548-0.246-0.548-0.546V18c0-0.3 0.248-0.546 0.548-0.546h5.452  C23.754 17.454 24 17.7 24 18v5.454c0 0.3-0.246 0.546-0.548 0.546H18z M9.271 24c-0.298 0-0.543-0.246-0.543-0.546V18  c0-0.3 0.245-0.546 0.543-0.546h5.457c0.3 0 0.543 0.246 0.543 0.546v5.454c0 0.3-0.243 0.546-0.543 0.546H9.271z M0.548 24  C0.246 24 0 23.754 0 23.454V18c0-0.3 0.246-0.546 0.548-0.546H6c0.302 0 0.548 0.246 0.548 0.546v5.454C6.548 23.754 6.302 24 6 24  H0.548z M18 15.271c-0.3 0-0.548-0.244-0.548-0.542V9.272c0-0.299 0.248-0.545 0.548-0.545h5.452C23.754 8.727 24 8.973 24 9.272  v5.457c0 0.298-0.246 0.542-0.548 0.542H18z M9.271 15.271c-0.298 0-0.543-0.244-0.543-0.542V9.272c0-0.299 0.245-0.545 0.543-0.545  h5.457c0.3 0 0.543 0.246 0.543 0.545v5.457c0 0.298-0.243 0.542-0.543 0.542H9.271z M0.548 15.271C0.246 15.271 0 15.026 0 14.729  V9.272c0-0.299 0.246-0.545 0.548-0.545H6c0.302 0 0.548 0.246 0.548 0.545v5.457c0 0.298-0.246 0.542-0.548 0.542H0.548z M18 6.545  c-0.3 0-0.548-0.245-0.548-0.545V0.545C17.452 0.245 17.7 0 18 0h5.452C23.754 0 24 0.245 24 0.545V6c0 0.3-0.246 0.545-0.548 0.545  H18z M9.271 6.545C8.974 6.545 8.729 6.3 8.729 6V0.545C8.729 0.245 8.974 0 9.271 0h5.457c0.3 0 0.543 0.245 0.543 0.545V6  c0 0.3-0.243 0.545-0.543 0.545H9.271z M0.548 6.545C0.246 6.545 0 6.3 0 6V0.545C0 0.245 0.246 0 0.548 0H6  c0.302 0 0.548 0.245 0.548 0.545V6c0 0.3-0.246 0.545-0.548 0.545H0.548z%27%2F%3E%3C%2Fsvg%3E";
                    let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M0,6c0,0.301,0.246,0.545,0.549,0.545h22.906C23.756,6.545,24,6.301,24,6V2.73c0-0.305-0.244-0.549-0.545-0.549H0.549  C0.246,2.182,0,2.426,0,2.73V6z M0,13.637c0,0.297,0.246,0.545,0.549,0.545h22.906c0.301,0,0.545-0.248,0.545-0.545v-3.273  c0-0.297-0.244-0.545-0.545-0.545H0.549C0.246,9.818,0,10.066,0,10.363V13.637z M0,21.27c0,0.305,0.246,0.549,0.549,0.549h22.906  c0.301,0,0.545-0.244,0.545-0.549V18c0-0.301-0.244-0.545-0.545-0.545H0.549C0.246,17.455,0,17.699,0,18V21.27z%27%2F%3E%3C%2Fsvg%3E";
                    //let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 32 32%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M28,20h-4v-8h4c1.104,0,2-0.896,2-2s-0.896-2-2-2h-4V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v4h-8V4c0-1.104-0.896-2-2-2  S8,2.896,8,4v4H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h4v8H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h4v4c0,1.104,0.896,2,2,2s2-0.896,2-2v-4  h8v4c0,1.104,0.896,2,2,2s2-0.896,2-2v-4h4c1.104,0,2-0.896,2-2S29.104,20,28,20z M12,20v-8h8v8H12z%27%2F%3E%3C%2Fsvg%3E";
                    let gthickness = currentSettings.rulerThickness;

                    let background = "";

                    if (cmpStr(currentSettings.rulerBackground, "png")) {

                        let imageHeight = currentSettings.lineHeight >= currentSettings.fontSize ?
                            currentSettings.lineHeight :
                            Math.round((currentSettings.lineHeight * currentSettings.fontSize));

                        let pattern = currentSettings.rulerPattern.split(spaceSplitRegexp);

                        image.rulerMatrix(imageHeight, currentSettings.rulerColor, pattern, currentSettings.rulerThickness, currentSettings.rulerScale);

                        if (!cmpStr(currentSettings.rulerOutput, "base64")) {
                            image.getFile(currentSettings.rulerOutput);
                            background = "background-image: url(\"../" + currentSettings.rulerOutput + "\");" +
                                "background-position: left top;" +
                                "background-repeat: repeat;" +
                                "background-size: " + pattern.length + "px " + imageHeight + "px;";

                        } else {
                            background = "background-image: url(\"data:image/png;base64," + image.getBase64() + "\");" +
                                "background-position: left top;" +
                                "background-repeat: repeat;" +
                                "background-size: " + pattern.length + "px " + imageHeight + "px;";

                        }

                    } else {

                        gthickness = gthickness * 3;

                        background = "background-image: linear-gradient(to top, " +
                            currentSettings.rulerColor + " " + gthickness + "%, transparent " +
                            gthickness + "%);" +
                            "background-size: 100% " + lineHeight + ";";
                    }

                    let ruler = "position: absolute;" +
                        "left: 0;" +
                        "top: 0;" +
                        "margin: 0;" +
                        "padding: 0;" +
                        "width: 100%;" +
                        "height: 100%;" +
                        "z-index: 9900;" +
                        "pointer-events: none;" + background;

                    let iconSize = currentSettings.rulerIconSize;

                    let [style, rulerClass] = currentSettings.rulerStyle.split(spaceSplitRegexp);
                    let [color, hoverColor] = currentSettings.rulerIconColors.split(spaceSplitRegexp);

                    let rulerRule = null;

                    if (cmpStr(style, "switch")) {

                        rulerRule = postcss.parse("." + rulerClass + "{" +
                            "display: none;" +
                            ruler +
                            "}" +
                            "input[id=\"" + rulerClass + "\"] {" +
                            "display:none;" +
                            "}" +
                            "input[id=\"" + rulerClass + "\"] + label {" +
                            "z-index: 9999;" +
                            "display: inline-block;" +
                            rulerIconPosition +
                            "margin: 0;" +
                            "padding: 0;" +
                            "width: " + iconSize + ";" +
                            "height: " + iconSize + ";" +
                            "cursor: pointer;" +
                            "background-image: url(\"" +
                            svg.replace(/\{color\}/, escape(color)) + "\");" +
                            "}" +
                            "input[id=\"" + rulerClass + "\"]:checked + label, input[id=\"" +
                            rulerClass + "\"]:hover + label {" +
                            "background-image: url(\"" + svg.replace(/\{color\}/, escape(hoverColor)) + "\");" +
                            "}" +
                            "input[id=\"" +
                            rulerClass + "\"]:checked ~ ." + rulerClass + "{" +
                            "display: block;" +
                            "}");

                    } else if (cmpStr(style, "hover")) {

                        rulerRule = postcss.parse("." + rulerClass + "{" +
                            rulerIconPosition +
                            "margin: 0;" +
                            "padding: 0;" +
                            "width: " + iconSize + ";" +
                            "height: " + iconSize + ";" +
                            "background-image: url(\"" + svg.replace("{color}", escape(color)) + "\");" +
                            "transition: background-image 0.5s ease-in-out;" +
                            "}" +
                            "." + rulerClass + ":hover" + "{" +
                            "cursor: pointer;" + ruler +
                            "}");

                    } else if (cmpStr(style, "always")) {

                        rulerRule = postcss.parse("." + rulerClass + "{\n" + ruler + "}\n");

                    }

                    if (rulerRule) {
                        rulerRule.source = rule.source;
                        rule.parent.insertBefore(rule, rulerRule);
                    }

                    rule.remove();
                } else if (cmpStr(rule.name, "ellipsis") || cmpStr(rule.name, "nowrap") ||
                    cmpStr(rule.name, "forcewrap") || cmpStr(rule.name, "hyphens") || cmpStr(rule.name, "break-word")) {

                    let property = toCamelCase(rule.name);

                    let decls = helpers[property];

                    if (cmpStr(property, "hyphens") && cmpStr(rule.params, "true")) {
                        decls = helpers.breakWord + decls;
                    } else if (cmpStr(property, "ellipsis") && cmpStr(rule.params, "true")) {
                        decls = helpers.nowrap + decls;
                    }

                    if (cmpStr(currentSettings.properties, "inline")) {

                        let idecls = postcss.parse(decls);
                        rule.parent.insertBefore(rule, idecls);

                    } else {

                        let extendName = toCamelCase(property + rule.params);

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

                } else if (cmpStr(rule.name, "reset") | cmpStr(rule.name, "normalize")) {
                    let property = rule.name.toLowerCase();
                    let rules = postcss.parse(helpers[property]);
                    rules.source = rule.source;
                    rule.parent.insertAfter(rule, rules);
                    rule.remove();
                }
                // Walk in media queries
                node.walk(child => {

                    if (cmpStr(child.type, "rule")) {
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

            } else if (cmpStr(node.type, "rule")) {

                // Walk decls in rule
                walkDecls(node);

            } else if (currentSettings.removeComments && cmpStr(node.type, "comment")) {
                node.remove();
            }

        });

        // Append Extends to CSS
        for (let key in extendNodes) {

            let node = extendNodes[key];

            if (node.count > 1) {
                let rule = postcss.parse(node.selector + "{" + node.decls + "}");
                rule.source = node.source;

                node.parents[0].parent.insertBefore(node.parents[0], rule);

            } else {
                let decls = postcss.parse(node.decls);
                decls.source = node.source;
                node.parents[0].insertAfter(node.prev, decls);
            }

            // Remove unused parent nodes.
            for (let i in node.parents) {
                if (node.parents[i].nodes.length === 0) {
                    node.parents[i].remove();
                }
            }

        }

    };
};

export default hamster;