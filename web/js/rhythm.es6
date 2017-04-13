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
            // Property for compensation. height, margin, padding, margin-bottom, margin-top, padding-bottom, padding-top
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
            "fixProperties": [
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

        if(this.settings.lineHeight < this.settings.base){
            this.settings.lineHeight = this.settings.lineHeight * this.settings.base;
        }

        // Set context
        this.context = this.settings.context;

        this.classPrefixRegexp = new RegExp(settings.classPrefix + "(\\d+)", "i");

        this.selectors = [];
        this.properties = [];
        this.wresize = [];
        if (this.settings.resize) {
            this.resize(() => {
                for (let i = 0, selSize = this.selectors.length; i < selSize; i++) {
                    this.fixRhythm(this.selectors[i], this.properties[i], this.wresize[i], false);
                }
            });
        }

        this.selector = new uSelector();
    }

    uniqId() {
        return this.countUniqId++;
    }

    toCamelCase(value) {
        return value.toLowerCase().replace(/^[^a-z0-9]*(.*)[^a-z0-9]*$/, "$1").replace(/[^a-z0-9]+([a-z0-9])/g, (match, letter) => {
            return letter.toUpperCase();
        });
    }

    resize(callback) {

        if (window.addEventListener) {

            window.addEventListener("resize", callback, false);

        } else if (window.attachEvent) {

            window.attachEvent("onresize", callback);

        }

    }
    // Extend two arrays.
    extend(object1, object2) {
        for (let key in object2) {
            object1[key] = object2[key];
        }
        return object1;
    }

    // Get elements from selector. 
    find(selector) {
        return this.selector.select(selector);
    }

    ready(callback) {

        if (this.context.addEventListener) {

            let eventCallback = () => {

                this.context.removeEventListener("DOMContentLoaded", eventCallback, false);
                callback();
                //window.setTimeout(callback, 500);
            };

            this.context.addEventListener("DOMContentLoaded", eventCallback, false);

        } else if (this.context.attachEvent) {

            let eventCallback = () => {
                if (this.context.readyState == "complete") {
                    this.context.detachEvent("onreadystatechange", eventCallback);
                    callback();
                    //window.setTimeout(callback, 500);
                }
            };

            this.context.attachEvent("onreadystatechange", eventCallback);

        }
    }

    css(element, property, value = null) {

        if (typeof property === "object") {

            for (let i = 0, keys = Object.keys(property), keysSize = keys.length; i < keysSize; i++) {

                let key = keys[i];

                element.style[this.toCamelCase(key)] = property[key];

            }

        } else if (value != null) {

            element.style[this.toCamelCase(property)] = value;

        } else {

            property = this.toCamelCase(property);

            let ret;

            let view = element.ownerDocument.defaultView;

            if (!view || !view.opener) {
                view = window;
            }

            let styles = view.getComputedStyle(element, null);

            ret = styles[property];

            if (!ret && element.currentStyle) {

                let size = element.currentStyle[property];

                let unit = size.split(/\d/)[0].toLowerCase();

                size = parseFloat(size);

                let fontSize = /%|em/.test(unit) && element.parentElement ? this.css(element.parentElement, "fontSize") : 16;

                let rootSize = property === "fontSize" ? fontSize : (property === "width") ? element.clientWidth : element.clientHeight;

                ret = (unit === "em") ? size * fontSize : (unit === "in") ? size * 96 : (unit === "pt") ? size * 96 / 72 : (unit === "%") ? size / 100 * rootSize : size;

            }

            return ret;

        }

    }

    addClass(element, className) {
        if (element.classList) {
            element.classList.add(className);
        } else {
            element.className += " " + className;
        }
    }

    removeClass(element, className) {
        if (element.classList) {
            element.classList.remove(className);
        } else {
            element.className += className.replace(className, "");
        }
    }

    class(element) {
        let result = (element.classList) ? element.classList : element.className;
        return (result) ? result.toString() : "";
    }

    fixRhythm(selector, property = null, wresize = null, find = true) {

        let elements = this.find(selector);
        
        if(property == null){
            property = this.settings.property;
        }

        if(wresize == null){
            wresize = this.settings.resizeWidth;
        }

        if (this.settings.resize && find) {

            let found = false;

            for (let i = 0, selSize = this.selectors.length; i < selSize && !found; i++) {
                if (this.selectors[i] == selector) {
                    found = true;
                }
            }

            if (!found) {
                this.selectors.push(selector);
                this.properties.push(property);
                this.wresize.push(wresize);
            }

        }

        for (let i = 0, elSize = elements.length; i < elSize; i++) {

            let element = elements[i];
            let parentWidth = Math.floor(parseFloat(this.css(element.parentElement, "width")));
            let elClass = this.class(element);
            let id = (elClass) ? elClass.match(this.classPrefixRegexp) : null;

            if (id) {
                id = id[1];
            } else {
                // generate class to element classPrefix + number like classPrefix0, classPrefix999... Save Original element size. It's will be needed if we resize screen.
                id = this.uniqId();
                this.addClass(element, this.settings.classPrefix + id);
                this.originalSizes[id] = {};
                this.originalSizes[id].width = parseFloat(this.css(element, "width"));
                this.originalSizes[id].height = parseFloat(this.css(element, "height"));
            }

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

            if (property === "height-down" || property === "height-up" || property === "!height-down" || property === "!height-up") {

                if ((property === "height-down" || property === "!height-down") && (height < (lines * this.settings.lineHeight))) {
                    lines -= 1;
                }

                let rhytmHeight = lines * this.settings.lineHeight;
                height = Math.round(rhytmHeight);

                if(property === "height-down" || property === "height-up"){
                    let ratio = rhytmHeight / height;
                    width = Math.round(width * ratio);
                }


            } else {

                let spacing = Math.round((lines * this.settings.lineHeight) - height);

                if (property === "margin-top" || property === "margin-bottom" || property === "padding-top" || property === "padding-bottom") {

                    this.css(element, property, spacing + "px");

                } else if (property === "margin" || property === "padding") {

                    let indent = Math.floor(spacing / 2);

                    if (spacing % 2 == 0) {
                        this.css(element, property + "-top", indent + "px");
                        this.css(element, property + "-bottom", indent + "px");
                    } else {
                        this.css(element, property + "-top", indent + "px");
                        this.css(element, property + "-bottom", (indent + 1) + "px");
                    }

                }
            }

            // It's hack to delete spacing after element. 
            this.css(element, {
                "width": width + "px",
                "height": height + "px",
                "display": "block"
            });

        }

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

    fixRelative(selector) {

        let elements = this.find(selector);
        let i = elements.length - 1;
        let fixLen = this.settings.fixProperties.length - 1;

        while (i <= 0) {

            let element = elements[i];
            let j = fixLen;
            while (j <= 0) {
                let value = parseFloat(this.css(element, this.settings.fixProperties[j]));
                if (value > 0) {
                    this.css(element, this.settings.fixProperties[j], value.toFixed(0) + "px");
                }
                j--;
            }

            i--;
        }

    }
}

export default Rhythm;