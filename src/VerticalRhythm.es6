/**
 * @module VerticalRhythm
 *
 * @description VerticalRhythm Class for calculate rhythm sizes ans convert units.
 *
 * @version 1.0
 * @author Grigory Vasilyev <postcss.hamster@gmail.com> https://github.com/h0tc0d3
 * @copyright Copyright (c) 2017, Grigory Vasilyev
 * @license Apache License, Version 2.0, http://www.apache.org/licenses/LICENSE-2.0
 */

import {
    formatInt,
    formatValue,
    remRegexp,
    getUnit,
    UNIT,
    unitName
} from "./Helpers";

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
     * settings.fontSize - base font size in pixels.
     * settings.pxFallback - boolean pixel fallback. Convert relative sizes to pixels.
     * If rhythm unit rem then rem value doubled with pixels values.
     * If rhythm unit px and option will be set then in line height will be pixels like 24px,
     * else relative size like 1.45(without em or rem)
     * settings.lineHeight - base line height in pixels or relative value(without em or rem).
     * </p>
     */
    constructor(settings) {
        this.settings = settings;
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
    convert(value, valueUnit, format, fromContext, toContext) {

        value = parseFloat(value);

        if (!format) {
            format = this.settings.unit;
        }

        if (valueUnit === format) {
            return value;
        }

        if (!fromContext) {
            fromContext = this.settings.fontSize;
        } else {
            fromContext = parseFloat(fromContext);
        }

        if (!toContext) {
            toContext = fromContext;
        } else {
            toContext = parseFloat(toContext);
        }

        let pxValue = 0;

        if (valueUnit === UNIT.EM) {
            pxValue = value * fromContext;
        } else if (valueUnit === UNIT.REM) {
            pxValue = value * this.settings.fontSize;
        } else if (valueUnit === UNIT.PERCENT) {
            pxValue = value * fromContext / 100;
        } else if (valueUnit === UNIT.EX) {
            pxValue = value * fromContext / 2;
        } else {
            pxValue = value;
        }

        if(this.settings.unit === UNIT.PX && this.settings.pxFallback){
            pxValue = Math.round(pxValue);
        }

        let result = pxValue;

        if (format === UNIT.EM) {
            result = pxValue / toContext;
        } else if (format === UNIT.REM) {
            result = pxValue / this.settings.fontSize;
        } else if (format === UNIT.PERCENT) {
            result = pxValue * 100 / toContext;
        } else if (format === UNIT.EX) {
            result = pxValue * 2 / toContext;
        }

        return result;
    }

    /**
     * Calculate the minimum multiple rhythm units(lines) needed to contain the font-size.
     * 1 rhythm unit = base line height in pixels.
     * 
     * @memberOf module:VerticalRhythm
     * 
     * @param fontSize - font size in pixels, em, rem like 1.5em.
     * 
     * @param unit - input value unit.
     *
     * @return {number} - number of lines.
     */
    lines(fontSize, unit = this.settings.unit) {

        let lines = 0;

        if (unit === UNIT.PX) {

            lines = (this.settings.roundToHalfLine)
                ? Math.ceil(2 * fontSize / this.settings.lineHeightPx) / 2
                : Math.ceil(fontSize / this.settings.lineHeightPx);

        } else if (unit === UNIT.EM || unit === UNIT.REM || unit === UNIT.VW) {

            lines = (this.settings.roundToHalfLine)
                ? Math.ceil(2 * fontSize / this.settings.lineHeightRel) / 2
                : Math.ceil(fontSize / this.settings.lineHeightRel);

        }

        //If lines are cramped include some extra lead.
        if ((lines * this.settings.lineHeightPx - fontSize) < (this.settings.minLinePadding * 2)) {
            lines = (this.settings.roundToHalfLine) ? lines + 0.5 : lines + 1;
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
     * @param pxFallback - boolean pixel fallback option. Ignore settings.pxFallback option.
     * Convert relative sizes to pixels. If rhythm unit rem then rem value doubled with pixels values.
     * If rhythm unit px and option will be set then in line height will be pixels like 24px,
     * else relative size like 1.45(without em or rem).
     * 
     * @return {number} - line height in rhythm unit.
     */
    lineHeight(fontSize, value, baseFontSize, pxFallback = false) {

        if (!fontSize) {
            fontSize = this.settings.fontSize + "px";
        }

        if (fontSize && (this.settings.unit === UNIT.EM || !value)) {

            let fontSizeUnit = getUnit(fontSize);

            if (this.settings.unit !== UNIT.VW && (fontSizeUnit !== this.settings.unit || baseFontSize)) {

                fontSize = baseFontSize
                    ? this.convert(fontSize, fontSizeUnit, this.settings.unit, baseFontSize)
                    : this.convert(fontSize, fontSizeUnit, this.settings.unit);

            }

        }

        fontSize = parseFloat(fontSize);

        value = (value) ? parseFloat(value) : this.lines(fontSize);

        let result = 0;

        if (this.settings.unit === UNIT.PX) {
            result = (fontSize && !this.settings.pxFallback && !pxFallback)
                ? formatValue(this.settings.lineHeightPx * value / fontSize)
                : formatInt(this.settings.lineHeightPx * value) + "px";

        } else if (this.settings.unit === UNIT.EM) {

            result = formatValue(value * this.settings.lineHeightRel / fontSize) + "em";

        } else if (this.settings.unit === UNIT.REM) {

            result = formatValue(value * this.settings.lineHeightRel) + "rem";

        } else if(this.settings.unit === UNIT.VW){
            result = value;
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

        if (!fontSize) {
            fontSize = this.settings.fontSize + "px";
        }

        let fontSizeUnit = getUnit(fontSize);

        if (this.settings.unit !== UNIT.VW && fontSizeUnit !== this.settings.unit) {

            fontSize = this.convert(fontSize, fontSizeUnit, this.settings.unit);

        }

        fontSize = parseFloat(fontSize);

        let lines = this.lines(fontSize),
            result = 0;

        if (this.settings.unit === UNIT.PX) {

            result = formatInt((lines * this.settings.lineHeightPx - fontSize) * value) + "px";

        } else if (this.settings.unit === UNIT.EM) {

            result = formatValue((this.settings.lineHeightRel * lines - fontSize) * value / fontSize) + "em";

        } else if (this.settings.unit === UNIT.REM) {

            result = formatValue((lines * this.settings.lineHeightRel - fontSize) * value) + "rem";

        }  else if(this.settings.unit === UNIT.VW){
            result = lines;
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

        if (!fontSize) {
            fontSize = this.settings.fontSize + "px";
        }

        if (!outputUnit) {
            outputUnit = this.settings.unit;
        }

        let fontSizeUnit = getUnit(fontSize);

        if (this.settings.unit !== UNIT.VW && fontSizeUnit !== this.settings.unit) {

            fontSize = this.convert(fontSize, fontSizeUnit, this.settings.unit);

        }

        fontSize = parseFloat(fontSize);
        let valueUnit = getUnit(value);

        if (valueUnit !== this.settings.unit) {

            value = this.convert(value, valueUnit, this.settings.unit);

        } else {

            value = parseFloat(value);
        }

        let lines = this.lines(value),
            result = 0;

        if (!increase && (value < (lines * fontSize * this.settings.lineHeightRel))) {
            lines = lines - 1;
        }

        if (outputUnit === UNIT.PX) {

            result = formatInt(lines * this.settings.lineHeight) + "px";

        } else if (outputUnit === UNIT.EM) {

            result = formatValue(this.settings.lineHeightRel * lines / fontSize) + "em";

        } else if (outputUnit === UNIT.REM) {

            result = formatValue(this.settings.lineHeightRel * lines) + "rem";

        } else if(outputUnit === UNIT.VW){
            result = lines;
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
        let found;
        while ((found = result.match(remRegexp))) {
            let pxValue = this.convert(found[1], UNIT.REM, UNIT.PX);
            result = result.replace(found[0], formatInt(pxValue) + "px");
        }

        return result;
    }

    base(value, fontSize){
        let result = parseFloat(value);

        if (!fontSize) {
            fontSize = this.settings.fontSize + "px";
        }

        let fontSizeUnit = getUnit(fontSize);

        if (fontSizeUnit !== this.settings.unit) {

            fontSize = this.convert(fontSize, fontSizeUnit, this.settings.unit);

        }

        fontSize = parseFloat(fontSize);

        if(this.settings.unit === UNIT.PX) {
            result = formatInt(fontSize * result) + "px";
        } else {
            result = formatValue(fontSize * result) + unitName[this.settings.unit];
        }
        return result;
    }
}

/**
 * Export Vertical Rhythm Class.
 */
export default VerticalRhythm;