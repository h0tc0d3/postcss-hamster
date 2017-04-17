// Import Selector engine.
import uSelector from "./uSelector.es6";
/**
 * @module Rhythm
 * 
 * @description Web Page Vertical Rhythm Fixer.
 *
 * @version 1.0
 * @author Grigory Vasilyev <postcss.hamster@gmail.com> https://github.com/h0tc0d3
 * @copyright Copyright (c) 2017, Grigory Vasilyev
 * @license Apache License, Version 2.0, http://www.apache.org/licenses/LICENSE-2.0 
 * 
 */

class Rhythm {

    constructor(settings) {

        this.defaults = {
            // Property for compensation. height-up, height-down, margin, padding, margin-bottom, margin-top, padding-bottom, padding-top
            "property": "padding",
            // Rhythm base font size, without "px".
            "base": 16,
            // Rhythm Line height. Relative or pixel size.
            "lineHeight": 1.5,
            // Resize if screen width changed.
            "resize": true,
            // Allow resize width of element
            "resizeWidth": true,
            // Uniq class prefix
            "classPrefix": "rhythmHamster",
            // Fix properties with relative values to round pixels
            "properties": [
                "line-height",
                "padding-top",
                "padding-bottom",
                "margin-top",
                "margin-bottom",
                "padding-left",
                "padding-right",
                "margin-left",
                "margin-right",
            ],
            "context": document
        };

        settings = this.extend(this.defaults, settings);
        this.settings = settings || {};
        // Array that contain elements original width and height.
        this.originalSizes = [];
        // uniqId Counter.
        this.countUniqId = 0;
        // Convert relative lineHeight to pixels.

        if (this.settings.lineHeight < this.settings.base) {
            this.settings.lineHeight = this.settings.lineHeight * this.settings.base;
        }

        // Set context
        this.context = this.settings.context;
        this.window = window;

        this.classRegexp = new RegExp(settings.classPrefix + "([0-9]+)", "");

        this.fresize = [];
        this.rresize = [];
        if (this.settings.resize) {
            this.resize(() => {
                for (let i = 0, len = this.fresize.length; i < len; i++) {
                    this.fix(this.fresize[i]);
                }
                for (let i = 0, len = this.rresize.length; i < len; i++) {
                    this.rhythm(this.rresize[i]);
                }
            });
        }

        this.selector = new uSelector();

        this.head = this.context.head || this.context.getElementsByTagName("head")[0];
        // this.style = this.context.createElement("link");
        this.style = this.context.createElement("style");
        this.style.type = "text/css";
        this.style.rel = "stylesheet";
        this.head.appendChild(this.style);

        this.safeUint8Array = this.cmpStr(typeof Uint8Array, "undefined") ?  Array : Uint8Array;

        this.UNIT = {
            PX: 1,
            EM: 2,
            REM: 3,
            PERCENT: 4,
            EX: 5,
            PT: 6,
            IN: 7
        };
    }

    /**
     * Return next number uniq id.
     */
    uniqId() {
        return this.countUniqId++;
    }

    /**
     * Find elements
     * @param selector 
     */
    find(selector) {
        return this.selector.select(selector, this.context);
    }

    /**
     * Ready Event Listener.
     * @param callback - callback function.
     */
    ready(callback) {

        if (this.context.addEventListener) {

            let eventCallback = () => {
                this.context.removeEventListener("DOMContentLoaded", eventCallback, false);
                callback();
            };

            this.context.addEventListener("DOMContentLoaded", eventCallback, false);

        } else if (this.context.attachEvent) {

            let eventCallback = () => {
                if (this.cmpStr(this.context.readyState, "complete")) {
                    this.context.detachEvent("onreadystatechange", eventCallback);
                    callback();
                }
            };

            this.context.attachEvent("onreadystatechange", eventCallback);

        }
    }


    /**
     * Window Load Event Listener.
     * @param callback - callback function.
     */
    load(callback) {

        if (this.window.addEventListener) {

            let eventCallback = () => {

                this.window.removeEventListener("load", eventCallback, false);
                callback();
            };

            this.window.addEventListener("load", eventCallback, false);

        } else if (this.window.attachEvent) {

            let eventCallback = () => {
                if (this.cmpStr(this.window.readyState, "complete")) {
                    this.window.detachEvent("onload", eventCallback);
                    callback();
                }
            };

            this.window.attachEvent("onload", eventCallback);

        }
    }

    /**
     * Window Resize Event Listener.
     * @param callback - callback function.
     */
    resize(callback) {

        if (this.window.addEventListener) {

            this.window.addEventListener("resize", callback, false);

        } else if (this.window.attachEvent) {

            this.window.attachEvent("onresize", callback);

        }

    }


    /**
     * Get element single style for old browsers.
     * @param element 
     * @param styles 
     * @param property 
     */
    oldCss(element, property) {

        let ret = null;

        if (element.currentStyle) {

            let size = element.currentStyle[property];

            if (size) {
                let unit = this.getUnit(size);

                size = parseFloat(size);

                let fontSize = (unit === this.UNIT.EM | unit === this.UNIT.PERCENT) && element.parentElement ? this.oldCss(element.parentElement, "fontSize") : 16;

                let rootSize = (this.scmpStr(property, "fontSize")) ? fontSize : (this.scmpStr(property, "width")) ? element.clientWidth : element.clientHeight;

                ret = (unit === this.UNIT.EM) ? size * fontSize : (unit === this.UNIT.PERCENT) ? size / 100 * rootSize : (unit === this.UNIT.IN) ? size * 96 : (unit === this.UNIT.PT) ? size * 96 / 72 : size;
            }
        }

        return ret;
    }


    /**
     * Get and Set Style for element.
     * @param element 
     * @param property - if object then set key - value styles else string will be single property.
     * @param value - If single value then set value for style property.
     */
    css(element, property, value) {

        if (property.constructor === Object) {

            // Fast add styles from object { "padding-top": "10px", padding-bottom": 10px; }
            for (let key in property) {

                element.style[this.toCamelCase(key)] = property[key];

            }

            // } else if (property.constructor === String && (property.split(";").length - 1) > 1) {
            //     // Fast Add styles with string like margin: 10px; padding: 20px; 
            //     element.style.cssText += "; " + property;

        } else if (value) {

            element.style[this.toCamelCase(property)] = value;

        } else {

            let view = (element && element.ownerDocument) ?
                element.ownerDocument.defaultView :
                (!view || !view.opener) ? this.window : null;

            let styles = view.getComputedStyle(element, null);
            let ret = null;

            if (property.constructor === Array) {
                // Fast get array styles for element
                ret = {};
                for (let i = 0, len = property.length; i < len; i++) {
                    let prop = this.toCamelCase(property[i]);
                    let value = styles[prop];
                    if (!value) {
                        value = this.oldCss(element, prop);
                    }
                    ret[prop] = value;
                }
            } else {
                // Get Sinle style
                let prop = this.toCamelCase(property);
                ret = styles[prop];
                if (!ret) {
                    ret = this.oldCss(element, prop);
                }
            }

            return ret;
        }

    }

    /**
     * Add Class for element.
     * @param element 
     * @param className 
     */
    addClass(element, className) {
        if (element.classList) {
            element.classList.add(className);
        } else {
            element.className += " " + className;
        }
    }

    /**
     * Remove Class from element.
     * @param element 
     * @param className 
     */
    removeClass(element, className) {
        if (element.classList) {
            element.classList.remove(className);
        } else {
            element.className =  element.className.replace(className, "");
        }
    }

    /**
     * Return element classes.
     * @param element 
     */
    class(element) {
        let result = (element.classList) ? element.classList : element.className;
        return (result) ? result.toString() : "";
    }

    /**
     * Fix rhythm for elemets.
     * @param selector - Selector for elements
     * @param property -  Property for compensation. If not set then will be default from instance settings.
     * @param wresize - Alow resize width. If not set then will be default from instance settings.
     * @param find - 
     */
    rhythm(selector, property, wresize) {

        let node;

        if (selector.constructor === Object) {

            node = selector.node;
            wresize = selector.resize;
            property = selector.property;
            selector = selector.selector;

        } else {
            
            if (!property) {
                property = this.settings.property;
            }

            if (!wresize) {
                wresize = this.settings.resizeWidth;
            }

            //Create CSS node and append them to style.
            node = this.context.createTextNode("");
            this.style.appendChild(node);

            if (this.settings.resize) {
                this.rresize.push({
                    "selector": selector,
                    "property": property,
                    "resize": wresize,
                    "node": node
                });
            }
        }

        let css = "";

        let elements = this.find(selector);

        for (let i = 0, elSize = elements.length; i < elSize; i++) {

            let element = elements[i];
            let parentWidth = Math.floor(parseFloat(this.css(element.parentElement, "width")));
            let elClass = this.class(element);
            let id = (elClass) ? elClass.match(this.classRegexp) : null;
            
            if (id) {
                id = id[1];
            } else {
                // generate class to element classPrefix + number like classPrefix0, classPrefix999... Save Original element size. It's will be needed if we resize screen.
                id = this.uniqId();
                this.addClass(element, this.settings.classPrefix + id);
                let styles = this.css(element, ["width", "height"]);
                this.originalSizes[id] = {
                    "width": parseFloat(styles["width"]),
                    "height": parseFloat(styles["height"])
                };
            }

            let elSel = "." + this.settings.classPrefix + id;
            let elCss = "";
            // get Original Size by id
            let width = this.originalSizes[id].width;
            let height = this.originalSizes[id].height;

            if (wresize) {

                if (width > parentWidth) {
                    let widthRatio = width / parentWidth;
                    width = parentWidth;
                    height = Math.round(height / widthRatio);
                }

            }


            let lines = Math.ceil(height / this.settings.lineHeight);

            if (this.cmpStr(property, "height-down") || this.cmpStr(property, "height-up") || this.cmpStr(property, "!height-down") || this.cmpStr(property, "!height-up")) {

                if ((this.cmpStr(property, "height-down") || this.cmpStr(property, "!height-down")) && ((lines * this.settings.lineHeight - height) >= this.settings.lineHeight)) {
                    lines -= 1;
                }

                let rhytmHeight = lines * this.settings.lineHeight;
                height = Math.round(rhytmHeight);

                if (this.cmpStr(property, "height-down") || this.cmpStr(property, "height-up")) {
                    let ratio = rhytmHeight / height;
                    width = Math.round(width * ratio);
                }


            } else {

                let spacing = Math.round((lines * this.settings.lineHeight) - height);

                if (this.cmpStr(property, "margin-top") || this.cmpStr(property, "margin-bottom") || this.cmpStr(property, "padding-top") || this.cmpStr(property, "padding-bottom")) {

                    elCss += "\n" + property + ": " + spacing + "px;";

                } else if (this.cmpStr(property, "margin") || this.cmpStr(property, "padding")) {

                    let indent = Math.floor(spacing / 2);

                    if (spacing % 2 == 0) {
                        elCss += "\n" + property + "-top: " + indent + "px;\n" + property + "-bottom: " + indent + "px;";
                    } else {
                        elCss += "\n" + property + "-top: " + indent + "px;\n" + property + "-bottom: " +  (indent + 1) + "px;";
                    }

                }
            }
            
            // It's hack to delete spacing after element.
            elCss = "display: block;\nwidth: " + width + "px;\height:" + height + "px;" + elCss;
                
            if (elCss.length !== 0) {
                css += elSel + " {" + elCss + "}\n";
            }


        }
        node.textContent = css;
    }

    // round(value) {
    //     //value = value.toFixed(0); // Round to nearest pixel, best view on all browsers, also half sub pixel rounding works fine too; 
    //     //Round to near 1/2 of pixel
    //     let ceil = Math.ceil(value);
    //     if (ceil > value) {
    //         ceil = ceil - 1;
    //     }

    //     let fraction = value - ceil;
    //     fraction = Math.round(fraction / 0.5) * 0.5;
    //     value = ceil + fraction;
    //     return value;
    // }

    /**
     * Fix relative size round bug - round to ceil pixels. 
     * @param selector - css selector string.
     * @param isStatic - if set true then get size only from first element in selector
     * and create css style for selector. Else create style class for all elements and add class.
     */
    fix(selector, isStatic = true) {

        let node;
        if (selector.constructor === Object) {

            node = selector.node;
            isStatic = selector.isStatic;
            selector = selector.selector;

        } else {
            node = this.context.createTextNode("");
            this.style.appendChild(node);
            //Create CSS node and append them to style.
            if (this.settings.resize) {
                this.fresize.push({
                    "selector": selector,
                    "isStatic": isStatic,
                    "node": node
                });

            }

        }

        let elements = (isStatic) ? selector.split(",") : this.find(selector);

        let css = "";

        for (let i = 0, elLen = elements.length; i < elLen; i++) {

            let element = (isStatic) ? this.find(elements[i])[0] : elements[i];

            if (element) {
                let elCss = "";
                let elStyle = this.css(element, this.settings.properties);
                for (let j = 0, len = this.settings.properties.length; j < len; j++) {
                    let prop = this.settings.properties[j];
                    let value = parseFloat(elStyle[this.toCamelCase(prop)]);
                    if (value > 0) {
                        elCss += "\n" + prop + ": " + value.toFixed(0) + "px;";
                    }
                }

                let elSel;

                if (isStatic) {
                    elSel = elements[i];
                } else {
                    let elClass = this.class(element);
                    let id = (elClass) ? elClass.match(this.classRegexp) : null;

                    if (id) {
                        id = id[1];
                        elSel = "." + this.settings.classPrefix + id;
                    } else {
                        // generate class to element classPrefix + number like classPrefix0, classPrefix999... Save Original element size. It's will be needed if we resize screen.
                        id = this.uniqId();
                        elSel = this.settings.classPrefix + id;
                        this.addClass(element, elSel);
                        elSel = "." + elSel;
                    }
                }

                if (elCss.length !== 0) {
                    css += elSel + " {" + elCss + "}\n";
                }
            }

        }

        node.textContent = css;

    }


    /**
     * To Camel Case string.
     * @param value 
     */
    toCamelCase(value) {

        let len = value.length;
        let buffer = new this.safeUint8Array(len);

        // Code: 48-57 Chars: 0-9
        // Code: 65-90 Chars: A-Z 
        // Code: 97-122 Chars: a-z

        let prev = value.charCodeAt(0); // previous char
        let first = true; //is first char
        let count = 0;
        for (let i = 0; i < len; i++) {

            let code = value.charCodeAt(i);

            // Check code is not contain special characters
            if (!(code < 48 || (code > 90 && code < 97) || code > 122)) {

                // Check code is not number
                if (!(code >= 48 && code <= 57)) {
                    // Is lowercase
                    if (code >= 97 && code <= 122) {

                        if (prev < 48 || (prev > 90 && prev < 97) || prev > 122) {
                            code = code & (1 + 2 + 4 + 8 + 16 + 0 + 64 + 128); // toUpperCase
                        }

                    } else {
                        if (!(prev >= 65 && prev <= 90) || first) {
                            code = code | 32; // toLowerCase
                            if (first) {
                                first = false;
                            }
                        }
                    }
                }
                buffer[count] = code;
                count++;
            }
            prev = code;
        }
        let ret = new this.safeUint8Array(count);
        for (let j = 0; j < count; j++) {
            ret[j] = buffer[j];
        }
        return String.fromCharCode.apply(null, ret);
    }


    /**
     * Compare input string with reference string.
     * @param str - input string
     * @param refStr - reference string
     */
    cmpStr(str, refStr) {

        let len = refStr.length;

        if (len !== str.length) {
            return false;
        }

        for (var i = 0; i < len; i++) {
            var code = str.charCodeAt(i);
            var refCode = refStr.charCodeAt(i);

            if (code >= 65 && code <= 90) {
                code = code | 32;
            }

            if (code !== refCode) {
                return false;
            }
        }

        return true;
    }



    /**
     * Case sensitive compare strings
     * @param str - input string
     * @param refStr - reference string
     */
    scmpStr(str, refStr) {
        let len = refStr.length;

        if (len !== str.length) {
            return false;
        }

        for (var i = 0; i < len; i++) {

            if (str.charCodeAt(i) !== refStr.charCodeAt(i)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Return Unit to value.
     * @param {string} value - input value.
     */
    getUnit(value) {
        let len = value.length;
        let code1 = value.charCodeAt(len - 1);
        let code2 = value.charCodeAt(len - 2);
        // p 80 112
        // x 88 120
        // t 84 116
        // e 69 101
        // m 77 109
        // r 82 114
        // i 73 105
        // n 78 110
        // % 37
        if (code1 === 37) {
            return this.UNIT.PERCENT;
        } else if (code2 === 80 || code2 === 112) {
            if (code1 === 88 || code1 === 120) {
                return this.UNIT.PX;
            } else if (code1 === 84 || code1 === 116) {
                return this.UNIT.PT;
            }
        } else if ((code1 === 77 || code1 === 109) && (code2 === 69 || code2 === 101)) {
            let code3 = value.charCodeAt(len - 3);
            if ((code3 === 82 || code3 === 114)) {
                return this.UNIT.REM;
            }
            return this.UNIT.EM;
        } else if ((code1 === 78 || code1 === 110) && (code2 === 73 || code2 === 105)) {
            this.UNIT.IN;
        }

        return 0;
    }

    /**
     * Extend object1 with object2.
     * 
     * @param object1 
     * @param object2
     * 
     * @return object1 
     */
    extend(object1, object2) {
        for (let key in object2) {
            object1[key] = object2[key];
        }
        return object1;
    }
}

export default Rhythm;