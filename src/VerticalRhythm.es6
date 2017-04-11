/**
 * @version 1.0
 * @author Grigory Vasilyev <postcss.hamster@gmail.com> https://github.com/h0tc0d3
 * @copyright Copyright (c) 2017, Grigory Vasilyev
 * @license Apache License, Version 2.0, http://www.apache.org/licenses/LICENSE-2.0 
 */

/**
 * Format Float Values.
 * @param {number} value - input value.
 */
function formatValue(value) {
    return value.toFixed(4).replace(/0+$/g, "").replace(/\.$/g, "");
}

/**
 * Format Number to Int.
 * @param {number} value - input value.
 */

function formatInt(value) {
    return value.toFixed(0);
}

/**
 * @module VerticalRhythm
 * 
 * @description VerticalRhythm Class for calculate rhythm sizes ans convert units.
 */

class VerticalRhythm {

    /**
     * Constructor for class VerticalRhythm.
     * 
     * @memberOf module:VerticalRhythm
     * 
     * @param settings - settings hash.
     * 
     * <p>
     * Use:
     * settings["font-size"] - base font size in pixels.
     * settings["px-fallback"] - boolean pixel fallback. Convert relative sizes to pixels. If rhythm unit rem then rem value doubled with pixels values.
     * If rhythm unit px and option will be set then in line height will be pixels like 24px, else relative size like 1.45(without em or rem)
     * settings["line-height"] - base line height in pixels or relative value(without em or rem).
     * </p>
     */
    constructor(settings) {
        this.baseFontSize = parseInt(settings["font-size"]);
        this.rhythmUnit = settings["unit"];
        this.pxFallback = settings["px-fallback"];
        this.minLinePadding = parseInt(settings["min-line-padding"]);
        this.roundToHalfLine = settings["round-to-half-line"];

        // Base Line Height in Pixels
        this.baseLineHeight = (settings["line-height"].match(/px$/i)) ? parseFloat(settings["line-height"]) : parseFloat(settings["line-height"]) * this.baseFontSize;
        this.baseLineHeightRatio = (settings["line-height"].match(/px$/i)) ? parseFloat(settings["line-height"]) / parseInt(this.baseFontSize) : parseFloat(settings["line-height"]);
        this.baseLeading = this.convert(this.baseLineHeight - this.baseFontSize, "px", this.rhythmUnit);
    }

    /**
     * Convert values from unit to unit.
     * 
     * @memberOf module:VerticalRhythm
     * 
     * @param {number} value - input value
     * @param valueUnit - input value unit
     * @param format - output value unit
     * @param fromContext - from base font size
     * @param toContext - to new base font size
     * 
     * @return {number} - output value.
     */
    convert(value, valueUnit, format = null, fromContext = null, toContext = null) {

        value = parseFloat(value);

        if (format == null) {
            format = this.rhythmUnit;
        }

        if (valueUnit == format) {
            return value;
        }

        if (fromContext == null) {
            fromContext = this.baseFontSize;
        } else {
            fromContext = parseFloat(fromContext);
        }

        if (toContext == null) {
            toContext = fromContext;
        } else {
            toContext = parseFloat(toContext);
        }

        let pxValue = 0;

        if (valueUnit == "em") {
            pxValue = value * fromContext;
        } else if (valueUnit == "rem") {
            pxValue = value * this.baseFontSize;
        } else if (valueUnit == "%") {
            pxValue = value * fromContext / 100;
        } else if (valueUnit == "ex") {
            pxValue = value * fromContext / 2;
        } else {
            pxValue = value;
        }

        let result = pxValue;

        if (format == "em") {
            result = pxValue / toContext;
        } else if (format == "rem") {
            result = pxValue / this.baseFontSize;
        } else if (format == "%") {
            result = pxValue * 100 / toContext;
        } else if (format == "ex") {
            result = pxValue * 2 / toContext;
        }

        return result;
    }

    /**
     * Calculate the minimum multiple rhythm units(lines) needed to contain the font-size. 1 rhythm unit = base line height in pixels.
     * 
     * @memberOf module:VerticalRhythm
     * 
     * @param fontSize - font size in pixels, em, rem like 1.5em.
     * 
     * @return {number} - number of lines.
     */
    lines(fontSize) {

        fontSize = parseFloat(fontSize);

        let lines = 0;

        if (this.rhythmUnit == "px") {

            lines = (this.roundToHalfLine == "true") ? Math.ceil(2 * fontSize / this.baseLineHeight) / 2 : Math.ceil(fontSize / this.baseLineHeight);

        } else if (this.rhythmUnit == "em" || this.rhythmUnit == "rem") {

            lines = (this.roundToHalfLine == "true") ? Math.ceil(2 * fontSize / this.baseLineHeightRatio) / 2 : Math.ceil(fontSize / this.baseLineHeightRatio);

        }
        //If lines are cramped include some extra lead.
        if ((lines * this.baseLineHeight - fontSize) < (this.minLinePadding * 2)){
            lines = (this.roundToHalfLine) ? lines + 0.5 : lines + 1;
        }

        return lines;
    }

    /**
     * Calculate line height value in rhythm units for font size. Generate line height from font size or input lines.
     * 
     * @memberOf module:VerticalRhythm
     * 
     * @param fontSize - font size in pixels, em, rem like 1.5em.
     * @param value - input lines, before output 1 line height will be multiply with value.
     * @param baseFontSize - base font size for calculation relative sizes for px or em.
     * @param pxFallback - boolean pixel fallback option. Ignore settings["px-fallback"] option. Convert relative sizes to pixels. If rhythm unit rem then rem value doubled with pixels values.
     * If rhythm unit px and option will be set then in line height will be pixels like 24px, else relative size like 1.45(without em or rem).
     * 
     * @return {number} - line height in rhythm unit.
     */
    lineHeight(fontSize, value, baseFontSize = null, pxFallback = false) {
        
        if(fontSize == null){
            fontSize = this.baseFontSize + "px";
        }

        if (fontSize != null && (this.rhythmUnit == "em" || value == null)) {

            let fontSizeUnit = fontSize.match(/(px|em|rem)$/i)[0].toLowerCase();

            if (fontSizeUnit != this.rhythmUnit || baseFontSize != null) {

                fontSize = (baseFontSize != null) ? this.convert(fontSize, fontSizeUnit, this.rhythmUnit, baseFontSize) : this.convert(fontSize, fontSizeUnit, this.rhythmUnit);

            } else {

                fontSize = parseFloat(fontSize);
            }

        }

        value = (value != null) ? parseFloat(value) : this.lines(fontSize);

        let result = 0;

        if (this.rhythmUnit == "px") {

            result = (fontSize != null && this.pxFallback != "true" && !pxFallback) ? formatValue(this.baseLineHeight / fontSize) : formatInt(this.baseLineHeight * value) + "px";

        } else if (this.rhythmUnit == "em") {

            result = formatValue(value * this.baseLineHeightRatio / fontSize) + "em";

        } else if (this.rhythmUnit == "rem") {

            result = formatValue(value * this.baseLineHeightRatio) + "rem";

        }

        return result;

    }

    /**
     * Calculate leading value in rhythm unit
     *
     * @memberOf module:VerticalRhythm
     * 
     * @description
     * 1 leading(in pixels) = base line height(in pixels) - base font size(in pixels).
     * 
     * @param value - input lines, before output 1 line height will be multiply with value.
     * @param fontSize - font size in pixels, em, rem like 1.5em.
     * 
     * @return {number} - leading in rhythm unit.
     */
    leading(value, fontSize) {
        
        if(fontSize == null){
            fontSize = this.baseFontSize + "px";
        }
        
        let fontSizeUnit = fontSize.match(/(px|em|rem)$/i)[0].toLowerCase();

        if (fontSizeUnit != this.rhythmUnit) {

            fontSize = this.convert(fontSize, fontSizeUnit, this.rhythmUnit);

        } else {

            fontSize = parseFloat(fontSize);
        }

        let lines = this.lines(fontSize),
            result = 0;

        if (this.rhythmUnit == "px") {

            result = formatInt((lines * this.baseLineHeight - fontSize) * value) + "px";

        } else if (this.rhythmUnit == "em") {

            result = formatValue((this.baseLineHeightRatio * lines - fontSize) * value / fontSize) + "em";

        } else if (this.rhythmUnit == "rem") {

            result = formatValue((lines * this.baseLineHeightRatio - fontSize) * value) + "rem";

        }

        return result;

    }
    
    /**
     * Calculate rhythm value in rhythm unit. It used for height values, etc. 
     *
     * @memberOf module:VerticalRhythm
     * 
     * @description
     * 
     * If value 450px, and base font size 16, line-height 1.5, increase = false then return 432px.
     * If value 450px, and base font size 16, line-height 1.5, increase = true then return 456px.
     * 
     * @param value - input value like 450px; 10em; 100rem;.
     * @param fontSize - font size in pixels, em, rem like 1.5em.
     * @param increase - increase or decrease size. Default decrease. increase = false.
     * @param outputUnit - output value unit. 
     * 
     * @return {number} - rhythmd value rhythm unit.
     */

    rhythm(value, fontSize, increase = false, outputUnit) {
        
        if(fontSize == null){
            fontSize = this.baseFontSize + "px";
        }

        if(outputUnit == null){
            outputUnit = this.rhythmUnit;
        }

        let fontSizeUnit = fontSize.match(/(px|em|rem)$/i)[0].toLowerCase();

        if (fontSizeUnit != this.rhythmUnit) {

            fontSize = this.convert(fontSize, fontSizeUnit, this.rhythmUnit);

        } else {

            fontSize = parseFloat(fontSize);
        }

        let valueUnit = value.match(/(px|em|rem)$/i)[0].toLowerCase();

        if (valueUnit != this.rhythmUnit) {

            value = this.convert(value, valueUnit, this.rhythmUnit);

        } else {

            value = parseFloat(value);
        }

        let lines = this.lines(value),
            result = 0;
        
        if (!increase) {
            lines = lines - 1;
        }

        if (outputUnit == "px") {

            result = formatInt(lines * this.baseLineHeight) + "px";

        } else if (outputUnit == "em") {

            result = formatValue(this.baseLineHeightRatio * lines / fontSize) + "em";

        } else if (outputUnit == "rem") {

            result = formatValue(this.baseLineHeightRatio * lines) + "rem";

        }

        return result;

    }

    /**
     * Convert rem to pixel value.
     * 
     * @param value - input value in rem.
     * 
     * @return {number} - output value in pixels.
     */
    remFallback(value) {

        let result = value;
        let found = null;

        while ((found = result.match(/([0-9\.]+)rem/i))) {
            result = result.replace(found[0], formatInt(this.convert(found[1], "rem", "px")) + "px");
        }

        return result;
    }
}

/**
 * Export Vertical Rhythm Class.
 * Export formatValue and formatInt functions.
 */
export {
    formatInt,
    formatValue,
    VerticalRhythm
};