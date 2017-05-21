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

        let defaults = {
            // Property for compensation. height-up, height-down, margin, padding, margin-bottom, margin-top, padding-bottom, padding-top
            "property": "padding",
            // Rhythm base font size, without "px".
            "base": 16,
            // Rhythm Line height. Relative or pixel size.
            "line": 1.5,
            // Dynamic detect font-size and line-height;
            "dynamic": false,
            "dynamicSelector": "p",
            // Resize if screen width changed.
            "resize": true,
            // Allow resize width of element
            "resizeWidth": true,
            // Uniq class prefix
            "classPrefix": "rhythmHamster",
            // Responsive brakePoints {min: 480, max: 600, base: 14, line: 1.2}
            "brakePoints": [],
            // Set dom context
            "context": document
        };

        settings = this.extend(defaults, settings);
        // Array that contain elements original width and height.
        this.originalSizes = [];
        // uniqId Counter.
        this.countUniqId = 0;
        this.selector = new uSelector();
        // Set context
        this.context = settings.context;
        this.window = window;
        this.classRegexp = new RegExp(settings.classPrefix + "([0-9]+)", "");
        this.view = this.context.defaultView ? this.context.defaultView : null;
        this.safeUint8Array = this.cmpStr(typeof Uint8Array, "undefined") ? Array : Uint8Array;
        this.dynEl = this.find(settings.dynamicSelector)[0];

        this.width = 0;
        this.line = settings.line;
        this.base = settings.base;
        this.property = settings.property;
        this.dynamic = settings.dynamic;
        this.isResize = settings.resize;
        this.resizeWidth = settings.resizeWidth;
        this.classPrefix = settings.classPrefix;
        this.brakePoints = settings.brakePoints;

        this.setLineHeight();
        this.rresize = [];
        if (this.isResize) {
            this.resize(() => {
                this.setLineHeight();
                for (let i = 0, len = this.rresize.length; i < len; i++) {
                    this.rhythm(this.rresize[i]);
                }
            });
        }


        this.head = this.context.head || this.context.getElementsByTagName("head")[0];
        // this.style = this.context.createElement("link");
        this.style = this.context.createElement("style");
        this.style.type = "text/css";
        this.style.rel = "stylesheet";
        this.head.appendChild(this.style);

    }

    /**
     * Return next number uniq id.
     */
    uniqId() {
        return this.countUniqId++;
    }

    /**
     * set line height
     */
    setLineHeight() {
        if (this.dynamic) {
            this.line = parseFloat(this.css(this.dynEl, "line-height"));
        } else {
            let len = this.brakePoints.length;
            if (len > 0) {
                this.width = Math.max(this.context.documentElement.clientWidth, this.window.innerWidth || 0);
                for (let i = 0; i < len; i++) {
                    let brakePoint = this.brakePoints[i];
                    if (this.width >= brakePoint.min && this.width < brakePoint.max) {
                        if (brakePoint.line < brakePoint.base) {
                            // Convert relative lineHeight to pixels.
                            this.line = brakePoint.line * brakePoint.base;
                        } else {
                            this.line = brakePoint.line;
                        }
                        break;
                    }
                }
            } else {
                // Convert relative lineHeight to pixels.
                if (this.line < this.base) {
                    this.line = Math.round(this.line * this.base);
                }
            }
        }
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

        let timeOutCallBack = () => {
            // Need to wait before browser recalculate styles.
            this.window.setTimeout(callback, 500);
        };

        if (this.window.addEventListener) {

            this.window.addEventListener("resize", timeOutCallBack, false);

        } else if (this.window.attachEvent) {

            this.window.attachEvent("onresize", timeOutCallBack);

        }

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

        } else if (value) {

            element.style[this.toCamelCase(property)] = value;

        } else {

            let ret = null;

            let styles = this.view.getComputedStyle(element, null);

            if (property.constructor === Array) {
                // Fast get array styles for element
                ret = {};
                for (let i = 0, len = property.length; i < len; i++) {
                    let prop = this.toCamelCase(property[i]);
                    ret[prop] = styles[prop];
                }
            } else {
                // Get single style
                let prop = this.toCamelCase(property);
                ret = styles[prop];
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
            element.className = element.className.replace(className, "");
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
     * @param wresize - Allow resize width. If not set then will be default from instance settings.
     */
    rhythm(selector, property, wresize) {

        let node;

        if (selector.constructor === Object) {

            node = selector.node;
            node.textContent = "";
            wresize = selector.resize;
            property = selector.property;
            selector = selector.selector;

        } else {

            if (!property) {
                property = this.property;
            }

            if (!wresize) {
                wresize = this.resizeWidth;
            }

            //Create CSS node and append them to style.
            node = this.context.createTextNode("");
            this.style.appendChild(node);

            if (this.isResize) {
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
            let parentStyles = this.css(element.parentElement, ["width", "padding-left", "padding-right", "box-sizing"]);
            let elClass = this.class(element);
            let id = (elClass) ? elClass.match(this.classRegexp) : null;
            if (id) {
                id = id[1];
                elClass = this.classPrefix + id;
            } else {
                // generate class to element classPrefix + number like classPrefix0, classPrefix999...
                // Save Original element size. It's will be needed if we resize screen.
                id = this.uniqId();
                elClass = this.classPrefix + id;
                this.addClass(element, elClass);
                let styles = this.css(element, [
                    "width", "height"
                    //, "margin-top", "margin-bottom", "padding-top", "padding-bottom"
                ]);
                this.originalSizes[id] = {
                    "width": parseFloat(styles["width"]),
                    "height": parseFloat(styles["height"]),
                };
            }

            let elSel = "." + elClass;
            let elCss = "";
            // get Original Size by id
            let width = this.originalSizes[id].width;
            let height = this.originalSizes[id].height;

            if (wresize) {
                let parentWidth = this.cmpStr(parentStyles.boxSizing, "border-box")

                    ? parseFloat(parentStyles.width)

                    - parseFloat(parentStyles.paddingLeft)
                    - parseFloat(parentStyles.paddingRight)
                    : parseFloat(parentStyles.width);

                if (width > parentWidth) {
                    let widthRatio = width / parentWidth;
                    width = parentWidth;
                    height = height / widthRatio;
                }

            }

            let lines = Math.ceil(height / this.line);

            if (this.cmpStr(property, "height-down") || this.cmpStr(property, "height-up")
                || this.cmpStr(property, "!height-down") || this.cmpStr(property, "!height-up")) {

                if ((this.cmpStr(property, "height-down") || this.cmpStr(property, "!height-down")) && lines > 2) {
                    lines -= 1;
                }

                let rhythmHeight = lines * this.line;

                if (this.cmpStr(property, "height-down") || this.cmpStr(property, "height-up")) {
                    let ratio = rhythmHeight / height;
                    width = width * ratio;
                }

                height = rhythmHeight;
                // It's hack to delete white space after image.
                if (this.cmpStr(element.tagName, "img")) {
                    elCss = "display: block;\nwidth: " + width.toFixed(4) + "px;\nheight:" + height.toFixed(4) + "px;";
                } else {
                    elCss = "width: " + width.toFixed(4) + "px;\nheight:" + height.toFixed(4) + "px;";
                }

            } else {

                let spacing = (lines * this.line) - height;
                // console.log(id + " " + height + " " + this.line + " * " + lines + " = " + (this.line * lines)
                //     +  " " + spacing);

                if (this.cmpStr(property, "margin-top") || this.cmpStr(property, "margin-bottom")
                    || this.cmpStr(property, "padding-top") || this.cmpStr(property, "padding-bottom")) {
                    let style = parseInt(this.css(element, property));
                    if (!style) {
                        style = 0;
                    }
                    elCss = "\n" + property + ": " + spacing + style + "px;";

                } else if (this.cmpStr(property, "margin") || this.cmpStr(property, "padding")) {

                    let indent = Math.floor(spacing / 2);
                    let style = this.css(element, [property + "-top", property + "-bottom"]);
                    if (!style[property + "Top"]) {
                        style[property + "Top"] = 0;
                    } else {
                        style[property + "Top"] = parseInt(style[property + "Top"]);
                    }
                    if (!style[property + "Bottom"]) {
                        style[property + "Bottom"] = 0;
                    } else {
                        style[property + "Bottom"] = parseInt(style[property + "Bottom"]);
                    }

                    if (spacing % 2 === 0) {
                        elCss = "\n" + property + "-top: " + style[property + "Top"] + indent + "px;\n"
                            + property + "-bottom: " + style[property + "Bottom"] + indent + "px;";
                    } else {
                        elCss = "\n" + property + "-top: " + style[property + "Top"] + indent + "px;\n"
                            + property + "-bottom: " + style[property + "Bottom"] + (indent + 1) + "px;";
                    }

                }
                // It's hack to delete white space after image.
                if (this.cmpStr(element.tagName, "img")) {
                    elCss = "display: block;\nwidth: " + width + "px;\nheight:" + height + "px;" + elCss;
                }
            }

            if (elCss.length !== 0) {
                css += elSel + " {" + elCss + "}\n";
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
        let firstWas = false; //is first letter was
        let count = 0;
        for (let i = 0; i < len; i++) {

            let code = value.charCodeAt(i);

            // It's Number
            if (code > 47 && code < 58) {
                // Add Number
                buffer[count] = code;
                count++;

            } else if (code > 96 && code < 123) { // It's lower case letter

                //If previous char is't letter or number,
                if (firstWas && !((prev > 47 && prev < 58) || (prev > 96 && prev < 123) || (prev > 64 && prev < 91))) {
                    code = code & (1 + 2 + 4 + 8 + 16 + 64 + 128); // toUpperCase
                }

                buffer[count] = code;
                count++;

                if (!firstWas) {
                    firstWas = true;
                }

            } else if (code > 64 && code < 91) { // It's upper case letter

                // If previous char is letter or number,
                if ((prev > 47 && prev < 58) || (prev > 96 && prev < 123) || (prev > 64 && prev < 91)) {
                    code = code | 32; // toLowerCase
                }

                buffer[count] = code;
                count++;

                if (!firstWas) {
                    firstWas = true;
                }

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

        for (let i = 0; i < len; i++) {
            let code = str.charCodeAt(i);
            let refCode = refStr.charCodeAt(i);

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

        for (let i = 0; i < len; i++) {

            if (str.charCodeAt(i) !== refStr.charCodeAt(i)) {
                return false;
            }
        }

        return true;
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