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
    VerticalRhythm
} from "./VerticalRhythm";

import PngImage from "./PngImage";
// import VirtualMachine from "./VirtualMachine";

import fs from "fs";
import path from "path";

import postcss from "postcss";

const hamster = (options = null) => {

    //Default Global Settings
    let globalSettings = {

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

    let globalKeys = ["unit",
        "px-fallback",
        "px-baseline",
        "font-ratio",
        "properties",
        "round-to-half-line",
        "ruler",
        "ruler-style",
        "ruler-background",
        "ruler-output",
        "legacy-browsers",
        "remove-comments"
    ];

    let helpers = {

        "reset": fs.readFileSync(path.resolve(__dirname, "../helpers/reset.css"), "utf8"),

        "normalize": fs.readFileSync(path.resolve(__dirname, "../helpers/normalize.css"), "utf8"),

        "nowrap": "white-space: nowrap;",

        "forcewrap": "white-space: pre;" +
            "white-space: pre-line;" +
            "white-space: pre-wrap;" +
            "word-wrap: break-word;",

        "ellipsis": "overflow: hidden;" +
            "text-overflow: ellipsis;",

        "hyphens": "word-wrap: break-word;" +
            "hyphens: auto;",

        "break-word":
            /* Non standard for webkit */
            "word-break: break-word;" +
            /* Warning: Needed for oldIE support, but words are broken up letter-by-letter */
            "word-break: break-all;"
    };


    // Current Variables
    let currentSettings = {};
    let currentSettingsRegexp;
    //Current FontSizes
    let currentFontSizes = "";
    // font Sizes
    let fontSizesCollection;
    // Vertical Rhythm Calculator
    let rhythmCalculator;
    // Last Css File
    // let lastFile;

    // let vm = new VirtualMachine();
    // fontSize property Regexp
    const fontSizeRegexp = new RegExp("fontSize\\s+([\\-\\$\\@0-9a-zA-Z]+)", "i");

    // rhythm properties Regexp
    const rhythmRegexp = new RegExp("(lineHeight|spacing|leading|\!rhythm|rhythm)\\((.*?)\\)", "i");

    // Copy Values from object 2 to object 1;
    const extend = (object1, object2) => {

        for (let i = 0, keys = Object.keys(object2), keysSize = keys.length; i < keysSize; i++) {
            let key = keys[i];
            object1[key] = object2[key];
        }
        return object1;
    };

    if (options != null) {
        extend(globalSettings, options);
    }

    const toCamelCase = (value) => {
        return value.toLowerCase().replace(/^[^a-z0-9]*(.*)[^a-z0-9]*$/, "$1").replace(/[^a-z0-9]+([a-z0-9])/g, (match, letter) => {
            return letter.toUpperCase();
        });
    };

    // Init current Settings
    const initSettings = () => {

        // Add fontSizes
        if ("font-sizes" in globalSettings) {
            currentFontSizes = globalSettings["font-sizes"];
        }

        if ("font-sizes" in currentSettings) {
            currentFontSizes = currentFontSizes + ", " + currentSettings["font-sizes"];
        }

        // ToLowerCase Current Settings
        for (let i = 0, keysSize = globalKeys.length; i < keysSize; i++) {
            let key = globalKeys[i];
            if (key in currentSettings) {
                currentSettings[key] = currentSettings[key].toLowerCase();
            }
        }

        fontSizesCollection = new FontSizes(currentSettings);
        rhythmCalculator = new VerticalRhythm(currentSettings);
        fontSizesCollection.addFontSizes(currentFontSizes, rhythmCalculator);
        currentSettingsRegexp = new RegExp("\\@(" + Object.keys(currentSettings).join("|").replace(/(\-|\_)/g, "\\$1") + ")", "i");

    };

    const walkDecls = (node) => {
        node.walkDecls(decl => {

            let found;

            // Replace Variables with values
            while ((found = decl.value.match(currentSettingsRegexp))) {
                let variable = found[1];
                decl.value = decl.value.replace(currentSettingsRegexp, currentSettings[variable]);

            }

            // Replace Font Size
            while ((found = decl.value.match(fontSizeRegexp))) {

                let [fontSize, sizeUnit] = found[1].split(/\$/i);
                sizeUnit = (sizeUnit != null) ? sizeUnit.toLowerCase() : null;

                let size = fontSizesCollection.getSize(fontSize);
                // Write font size
                if (sizeUnit != null && (sizeUnit == "em" || sizeUnit == "rem")) {

                    decl.value = decl.value.replace(fontSizeRegexp, formatValue(size.rel) + sizeUnit);

                } else if (sizeUnit != null && sizeUnit == "px") {

                    decl.value = decl.value.replace(fontSizeRegexp, formatInt(size.px) + "px");

                } else {

                    let cfsize = (currentSettings["unit"] == "px") ? formatInt(size.px) : formatValue(size.rel);

                    decl.value = decl.value.replace(fontSizeRegexp, cfsize + currentSettings["unit"]);

                }

            }

            // Adjust Font Size
            if (decl.prop == "adjust-font-size") {

                let [fontSize, lines, baseFontSize] = decl.value.split(/\s+/);
                let fontSizeUnit = fontSize.match(/(px|em|rem)$/i)[0].toLowerCase();

                fontSize = rhythmCalculator.convert(fontSize, fontSizeUnit, null, baseFontSize) + currentSettings["unit"];

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

                let property = found[1].toLowerCase(); // lineHeight, spacing, leading, rhythm, !rhythm
                let parameters = found[2].split(/\s*\,\s*/);
                let outputValue = "";
                for (let i = 0, parametersSize = parameters.length; i < parametersSize; i++) {

                    let [value, fontSize] = parameters[i].split(/\s+/);

                    if (fontSize == null) {
                        decl.parent.walkDecls("font-size", fsdecl => {
                            fontSize = fsdecl.value;
                        });
                    }

                    if (property == "lineheight") {
                        outputValue += rhythmCalculator.lineHeight(fontSize, value) + " ";
                    } else if (property == "spacing") {
                        outputValue += rhythmCalculator.lineHeight(fontSize, value, null, true) + " ";
                    } else if (property == "leading") {
                        outputValue += rhythmCalculator.leading(value, fontSize) + " ";
                    } else if (property == "!rhythm") {
                        let [inValue, outputUnit] = value.split(/\$/);
                        outputValue += rhythmCalculator.rhythm(inValue, fontSize, true, outputUnit) + " ";
                    } else if (property == "rhythm") {
                        let [inValue, outputUnit] = value.split(/\$/);
                        outputValue += rhythmCalculator.rhythm(inValue, fontSize, false, outputUnit) + " ";
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

    return (css) => {

        // Extend Nodes
        let extendNodes = {};

        css.walk(node => {
            // if (lastFile != node.source.input.file) {
            // 	lastFile = node.source.input.file;
            // }

            if (node.type == "atrule") {

                let rule = node;

                if (rule.name == "hamster") {

                    if (rule.params != "end") {
                        // Add Global Variables
                        rule.walkDecls(decl => {
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

                    rule.walkDecls(decl => {
                        currentSettings[decl.prop] = decl.value;
                    });

                    // Init current Settings
                    initSettings();

                    rule.remove();

                } else if (rule.name == "baseline") {

                    let fontSize = parseInt(currentSettings["font-size"]);
                    let browserFontSize = parseInt(currentSettings["browser-font-size"]);

                    let lineHeight = rhythmCalculator.lineHeight(fontSize + "px");

                    // baseline font size
                    let fontSizeDecl = null;

                    if (currentSettings["px-baseline"] == "true" || (currentSettings["unit"] == "px" && currentSettings["legacy-browsers"] != "true")) {

                        fontSizeDecl = postcss.decl({
                            prop: "font-size",
                            value: fontSize + "px",
                            source: rule.source
                        });

                    } else {

                        let relativeSize = 100 * fontSize / browserFontSize;

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


                    if (rule.params.match(/\s*html\s*/)) {

                        let htmlRule = postcss.rule({
                            selector: "html",
                            source: rule.source
                        });

                        htmlRule.append(fontSizeDecl);
                        htmlRule.append(lineHeightDecl);

                        rule.parent.insertAfter(rule, htmlRule);

                        if (currentSettings["unit"] == "px" && currentSettings["legacy-browsers"] == "true") {
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

                        if (currentSettings["unit"] == "rem" && currentSettings["px-fallback"] == "true") {

                            rule.parent.insertBefore(lineHeightDecl, postcss.decl({
                                prop: "line-height",
                                value: rhythmCalculator.remFallback(lineHeight),
                                source: rule.source
                            }));

                        }
                    }

                    rule.remove();

                } else if (rule.name == "ruler") {

                    let rulerIconPosition = currentSettings["ruler-icon-position"].replace(/(\'|\")/g, "").replace(/\;/g, ";\n");

                    let lineHeight = (currentSettings["line-height"].match(/px$/i)) ? currentSettings["line-height"] : currentSettings["line-height"] + "em";

                    //let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M18 24c-0.3 0-0.548-0.246-0.548-0.546V18c0-0.3 0.248-0.546 0.548-0.546h5.452  C23.754 17.454 24 17.7 24 18v5.454c0 0.3-0.246 0.546-0.548 0.546H18z M9.271 24c-0.298 0-0.543-0.246-0.543-0.546V18  c0-0.3 0.245-0.546 0.543-0.546h5.457c0.3 0 0.543 0.246 0.543 0.546v5.454c0 0.3-0.243 0.546-0.543 0.546H9.271z M0.548 24  C0.246 24 0 23.754 0 23.454V18c0-0.3 0.246-0.546 0.548-0.546H6c0.302 0 0.548 0.246 0.548 0.546v5.454C6.548 23.754 6.302 24 6 24  H0.548z M18 15.271c-0.3 0-0.548-0.244-0.548-0.542V9.272c0-0.299 0.248-0.545 0.548-0.545h5.452C23.754 8.727 24 8.973 24 9.272  v5.457c0 0.298-0.246 0.542-0.548 0.542H18z M9.271 15.271c-0.298 0-0.543-0.244-0.543-0.542V9.272c0-0.299 0.245-0.545 0.543-0.545  h5.457c0.3 0 0.543 0.246 0.543 0.545v5.457c0 0.298-0.243 0.542-0.543 0.542H9.271z M0.548 15.271C0.246 15.271 0 15.026 0 14.729  V9.272c0-0.299 0.246-0.545 0.548-0.545H6c0.302 0 0.548 0.246 0.548 0.545v5.457c0 0.298-0.246 0.542-0.548 0.542H0.548z M18 6.545  c-0.3 0-0.548-0.245-0.548-0.545V0.545C17.452 0.245 17.7 0 18 0h5.452C23.754 0 24 0.245 24 0.545V6c0 0.3-0.246 0.545-0.548 0.545  H18z M9.271 6.545C8.974 6.545 8.729 6.3 8.729 6V0.545C8.729 0.245 8.974 0 9.271 0h5.457c0.3 0 0.543 0.245 0.543 0.545V6  c0 0.3-0.243 0.545-0.543 0.545H9.271z M0.548 6.545C0.246 6.545 0 6.3 0 6V0.545C0 0.245 0.246 0 0.548 0H6  c0.302 0 0.548 0.245 0.548 0.545V6c0 0.3-0.246 0.545-0.548 0.545H0.548z%27%2F%3E%3C%2Fsvg%3E";
                    let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 24 24%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M0,6c0,0.301,0.246,0.545,0.549,0.545h22.906C23.756,6.545,24,6.301,24,6V2.73c0-0.305-0.244-0.549-0.545-0.549H0.549  C0.246,2.182,0,2.426,0,2.73V6z M0,13.637c0,0.297,0.246,0.545,0.549,0.545h22.906c0.301,0,0.545-0.248,0.545-0.545v-3.273  c0-0.297-0.244-0.545-0.545-0.545H0.549C0.246,9.818,0,10.066,0,10.363V13.637z M0,21.27c0,0.305,0.246,0.549,0.549,0.549h22.906  c0.301,0,0.545-0.244,0.545-0.549V18c0-0.301-0.244-0.545-0.545-0.545H0.549C0.246,17.455,0,17.699,0,18V21.27z%27%2F%3E%3C%2Fsvg%3E";
                    //let svg = "data:image/svg+xml;charset=utf8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 viewBox%3D%270 0 32 32%27%3E%3Cpath fill%3D%27{color}%27 d%3D%27M28,20h-4v-8h4c1.104,0,2-0.896,2-2s-0.896-2-2-2h-4V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v4h-8V4c0-1.104-0.896-2-2-2  S8,2.896,8,4v4H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h4v8H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h4v4c0,1.104,0.896,2,2,2s2-0.896,2-2v-4  h8v4c0,1.104,0.896,2,2,2s2-0.896,2-2v-4h4c1.104,0,2-0.896,2-2S29.104,20,28,20z M12,20v-8h8v8H12z%27%2F%3E%3C%2Fsvg%3E";
                    let gthickness = parseFloat(currentSettings["ruler-thickness"]);

                    let background = "";

                    if (currentSettings["ruler-background"] == "png") {

                        let imageHeight = (currentSettings["line-height"].match(/px$/)) ?
                            parseInt(currentSettings["line-height"]) :
                            (parseFloat(currentSettings["line-height"]) * parseFloat(currentSettings["font-size"])).toFixed(0);
                        let pattern = currentSettings["ruler-pattern"].split(/\s+/);
                        let image = new PngImage();
                        image.rulerMatrix(imageHeight, currentSettings["ruler-color"], pattern, gthickness, currentSettings["ruler-scale"]);
                        if (currentSettings["ruler-output"] != "base64") {
                            image.getFile(currentSettings["ruler-output"]);
                            background = "background-image: url(\"../" + currentSettings["ruler-output"] + "\");" +
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
                            currentSettings["ruler-color"] + " " + gthickness + "%, transparent " +
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
                        "z-index: 9900;" + background;

                    let iconSize = currentSettings["ruler-icon-size"];

                    let [style, rulerClass] = currentSettings["ruler-style"].split(/\s+/);
                    let [color, hoverColor] = currentSettings["ruler-icon-colors"].split(/\s+/);

                    let rulerRule = null;

                    if (style == "switch") {

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
                            "position: absolute;" + rulerIconPosition +
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

                    } else if (style == "hover") {

                        rulerRule = postcss.parse("." + rulerClass + "{" +
                            "position: absolute;" +
                            rulerIconPosition +
                            "margin: 0;" +
                            "padding: 0;" +
                            "width: " + iconSize + ";" +
                            "height: " + iconSize + ";" +
                            "background-image: url(\"" + svg.replace(/\{color\}/, escape(color)) + "\");" +
                            "transition: background-image 0.5s ease-in-out;" +
                            "}" +
                            "." + rulerClass + ":hover" + "{" +
                            "cursor: pointer;" + ruler +
                            "}");

                    } else if (style == "always") {

                        rulerRule = postcss.parse("." + rulerClass + "{\n" + ruler + "}\n");

                    }

                    if (rulerRule != null) {
                        rulerRule.source = rule.source;
                        rule.parent.insertBefore(rule, rulerRule);
                    }

                    rule.remove();
                } else if (rule.name.match(/^(ellipsis|nowrap|forcewrap|hyphens|break\-word)$/i)) {

                    let property = rule.name.toLowerCase();

                    let decls = helpers[property];

                    if (property == "hyphens" && rule.params == "true") {
                        decls = helpers["break-word"] + decls;
                    }

                    if (property == "ellipsis" && rule.params == "true") {
                        decls = helpers["nowrap"] + decls;
                    }

                    if (currentSettings["properties"] == "inline") {

                        let idecls = postcss.parse(decls);
                        rule.parent.insertBefore(rule, idecls);

                    } else if (currentSettings["properties"] == "extend") {

                        let extendName = toCamelCase(property + " " + rule.params);

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
                    let property = rule.name.toLowerCase();
                    let rules = postcss.parse(helpers[property]);
                    rules.source = rule.source;
                    rule.parent.insertAfter(rule, rules);
                    rule.remove();
                }
                // Walk in media queries
                node.walk(child => {

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
        for (let i = 0, keys = Object.keys(extendNodes), keysSize = keys.length; i < keysSize; i++) {
            let key = keys[i];
            if (extendNodes[key].count > 1) {
                let rule = postcss.parse(extendNodes[key].selector + "{" + extendNodes[key].decls + "}");
                rule.source = extendNodes[key].source;

                css.insertBefore(extendNodes[key].parents[0], rule);

            } else {
                let decls = postcss.parse(extendNodes[key].decls);
                decls.source = extendNodes[key].source;
                extendNodes[key].parents[0].insertAfter(extendNodes[key].prev, decls);
            }

            // Remove unused parent nodes.
            for (let j = 0, parents = extendNodes[key].parents.length; j < parents; j++) {
                if (extendNodes[key].parents[j].nodes.length == 0) {
                    extendNodes[key].parents[j].remove();
                }
            }

        }

    };
};

export default hamster;