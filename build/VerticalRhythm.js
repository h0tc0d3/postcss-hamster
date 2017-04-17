"use strict";

exports.__esModule = true;

var _Helpers = require("./Helpers");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var VerticalRhythm = function () {

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
         * settings.pxFallback - boolean pixel fallback. Convert relative sizes to pixels. If rhythm unit rem then rem value doubled with pixels values.
         * If rhythm unit px and option will be set then in line height will be pixels like 24px, else relative size like 1.45(without em or rem)
         * settings.lineHeight - base line height in pixels or relative value(without em or rem).
         * </p>
         */
        function VerticalRhythm(settings) {
                _classCallCheck(this, VerticalRhythm);

                this.baseFontSize = settings.fontSize;
                this.rhythmUnit = settings.unit;
                this.pxFallback = settings.pxFallback;
                this.minLinePadding = settings.minLinePadding;
                this.roundToHalfLine = settings.roundToHalfLine;

                // Base Line Height in Pixels
                this.baseLineHeight = settings.lineHeight >= settings.fontSize ? settings.lineHeight : settings.lineHeight * settings.fontSize;
                this.baseLineHeightRatio = settings.lineHeight >= settings.fontSize ? settings.lineHeight / this.baseFontSize : settings.lineHeight;
                this.baseLeading = this.convert(this.baseLineHeight - this.baseFontSize, _Helpers.UNIT.PX, this.rhythmUnit);
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


        VerticalRhythm.prototype.convert = function convert(value, valueUnit) {
                var format = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
                var fromContext = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
                var toContext = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;


                value = parseFloat(value);

                if (format === null) {
                        format = this.rhythmUnit;
                }

                if (valueUnit === format) {
                        return value;
                }

                if (fromContext === null) {
                        fromContext = this.baseFontSize;
                } else {
                        fromContext = parseFloat(fromContext);
                }

                if (toContext === null) {
                        toContext = fromContext;
                } else {
                        toContext = parseFloat(toContext);
                }

                var pxValue = 0;

                if (valueUnit === _Helpers.UNIT.EM) {
                        pxValue = value * fromContext;
                } else if (valueUnit === _Helpers.UNIT.REM) {
                        pxValue = value * this.baseFontSize;
                } else if (valueUnit === _Helpers.UNIT.PERCENT) {
                        pxValue = value * fromContext / 100;
                } else if (valueUnit === _Helpers.UNIT.EX) {
                        pxValue = value * fromContext / 2;
                } else {
                        pxValue = value;
                }

                var result = pxValue;

                if (format === _Helpers.UNIT.EM) {
                        result = pxValue / toContext;
                } else if (format === _Helpers.UNIT.REM) {
                        result = pxValue / this.baseFontSize;
                } else if (format === _Helpers.UNIT.PERCENT) {
                        result = pxValue * 100 / toContext;
                } else if (format === _Helpers.UNIT.EX) {
                        result = pxValue * 2 / toContext;
                }

                return result;
        };

        /**
         * Calculate the minimum multiple rhythm units(lines) needed to contain the font-size. 1 rhythm unit = base line height in pixels.
         * 
         * @memberOf module:VerticalRhythm
         * 
         * @param fontSize - font size in pixels, em, rem like 1.5em.
         * 
         * @return {number} - number of lines.
         */


        VerticalRhythm.prototype.lines = function lines(fontSize) {

                var lines = 0;

                if (this.rhythmUnit === _Helpers.UNIT.PX) {

                        lines = this.roundToHalfLine ? Math.ceil(2 * fontSize / this.baseLineHeight) / 2 : Math.ceil(fontSize / this.baseLineHeight);
                } else if (this.rhythmUnit === _Helpers.UNIT.EM || this.rhythmUnit === _Helpers.UNIT.REM) {

                        lines = this.roundToHalfLine ? Math.ceil(2 * fontSize / this.baseLineHeightRatio) / 2 : Math.ceil(fontSize / this.baseLineHeightRatio);
                }
                //If lines are cramped include some extra lead.
                if (lines * this.baseLineHeight - fontSize < this.minLinePadding * 2) {
                        lines = this.roundToHalfLine ? lines + 0.5 : lines + 1;
                }

                return lines;
        };

        /**
         * Calculate line height value in rhythm units for font size. Generate line height from font size or input lines.
         * 
         * @memberOf module:VerticalRhythm
         * 
         * @param fontSize - font size in pixels, em, rem like 1.5em.
         * @param value - input lines, before output 1 line height will be multiply with value.
         * @param baseFontSize - base font size for calculation relative sizes for px or em.
         * @param pxFallback - boolean pixel fallback option. Ignore settings.pxFallback option. Convert relative sizes to pixels. If rhythm unit rem then rem value doubled with pixels values.
         * If rhythm unit px and option will be set then in line height will be pixels like 24px, else relative size like 1.45(without em or rem).
         * 
         * @return {number} - line height in rhythm unit.
         */


        VerticalRhythm.prototype.lineHeight = function lineHeight(fontSize, value, baseFontSize) {
                var pxFallback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;


                if (!fontSize) {
                        fontSize = this.baseFontSize + "px";
                }

                if (fontSize && (this.rhythmUnit === _Helpers.UNIT.EM || !value)) {

                        var fontSizeUnit = (0, _Helpers.getUnit)(fontSize);

                        if (fontSizeUnit != this.rhythmUnit || baseFontSize) {

                                fontSize = baseFontSize ? this.convert(fontSize, fontSizeUnit, this.rhythmUnit, baseFontSize) : this.convert(fontSize, fontSizeUnit, this.rhythmUnit);
                        } else {

                                fontSize = parseFloat(fontSize);
                        }
                }

                value = value ? parseFloat(value) : this.lines(fontSize);

                var result = 0;

                if (this.rhythmUnit === _Helpers.UNIT.PX) {

                        result = fontSize && !this.pxFallback && !pxFallback ? (0, _Helpers.formatValue)(this.baseLineHeight * value / fontSize) : (0, _Helpers.formatInt)(this.baseLineHeight * value) + "px";
                } else if (this.rhythmUnit === _Helpers.UNIT.EM) {

                        result = (0, _Helpers.formatValue)(value * this.baseLineHeightRatio / fontSize) + "em";
                } else if (this.rhythmUnit === _Helpers.UNIT.REM) {

                        result = (0, _Helpers.formatValue)(value * this.baseLineHeightRatio) + "rem";
                }

                return result;
        };

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


        VerticalRhythm.prototype.leading = function leading(value, fontSize) {

                if (!fontSize) {
                        fontSize = this.baseFontSize + "px";
                }

                var fontSizeUnit = (0, _Helpers.getUnit)(fontSize);

                if (fontSizeUnit != this.rhythmUnit) {

                        fontSize = this.convert(fontSize, fontSizeUnit, this.rhythmUnit);
                } else {

                        fontSize = parseFloat(fontSize);
                }

                var lines = this.lines(fontSize),
                    result = 0;

                if (this.rhythmUnit === _Helpers.UNIT.PX) {

                        result = (0, _Helpers.formatInt)((lines * this.baseLineHeight - fontSize) * value) + "px";
                } else if (this.rhythmUnit === _Helpers.UNIT.EM) {

                        result = (0, _Helpers.formatValue)((this.baseLineHeightRatio * lines - fontSize) * value / fontSize) + "em";
                } else if (this.rhythmUnit === _Helpers.UNIT.REM) {

                        result = (0, _Helpers.formatValue)((lines * this.baseLineHeightRatio - fontSize) * value) + "rem";
                }

                return result;
        };

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

        VerticalRhythm.prototype.rhythm = function rhythm(value, fontSize) {
                var increase = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
                var outputUnit = arguments[3];


                if (fontSize == null) {
                        fontSize = this.baseFontSize + "px";
                }

                if (outputUnit == null) {
                        outputUnit = this.rhythmUnit;
                }

                var fontSizeUnit = (0, _Helpers.getUnit)(fontSize);

                if (fontSizeUnit != this.rhythmUnit) {

                        fontSize = this.convert(fontSize, fontSizeUnit, this.rhythmUnit);
                } else {

                        fontSize = parseFloat(fontSize);
                }

                var valueUnit = (0, _Helpers.getUnit)(value);

                if (valueUnit != this.rhythmUnit) {

                        value = this.convert(value, valueUnit, this.rhythmUnit);
                } else {

                        value = parseFloat(value);
                }

                var lines = this.lines(value),
                    result = 0;

                if (!increase && value < lines * fontSize * this.baseLineHeightRatio) {
                        lines = lines - 1;
                }

                if (outputUnit === _Helpers.UNIT.PX) {

                        result = (0, _Helpers.formatInt)(lines * this.baseLineHeight) + "px";
                } else if (outputUnit === _Helpers.UNIT.EM) {

                        result = (0, _Helpers.formatValue)(this.baseLineHeightRatio * lines / fontSize) + "em";
                } else if (outputUnit === _Helpers.UNIT.REM) {

                        result = (0, _Helpers.formatValue)(this.baseLineHeightRatio * lines) + "rem";
                }

                return result;
        };

        /**
         * Convert rem to pixel value.
         * 
         * @param value - input value in rem.
         * 
         * @return {number} - output value in pixels.
         */


        VerticalRhythm.prototype.remFallback = function remFallback(value) {

                var result = value;
                var found = null;
                while (found = result.match(_Helpers.remRegexp)) {
                        var pxValue = this.convert(found[1], _Helpers.UNIT.REM, _Helpers.UNIT.PX);
                        result = result.replace(found[0], (0, _Helpers.formatInt)(pxValue) + "px");
                }

                return result;
        };

        return VerticalRhythm;
}();

/**
 * Export Vertical Rhythm Class.
 */


exports.default = VerticalRhythm;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlZlcnRpY2FsUmh5dGhtLmVzNiJdLCJuYW1lcyI6WyJWZXJ0aWNhbFJoeXRobSIsInNldHRpbmdzIiwiYmFzZUZvbnRTaXplIiwiZm9udFNpemUiLCJyaHl0aG1Vbml0IiwidW5pdCIsInB4RmFsbGJhY2siLCJtaW5MaW5lUGFkZGluZyIsInJvdW5kVG9IYWxmTGluZSIsImJhc2VMaW5lSGVpZ2h0IiwibGluZUhlaWdodCIsImJhc2VMaW5lSGVpZ2h0UmF0aW8iLCJiYXNlTGVhZGluZyIsImNvbnZlcnQiLCJQWCIsInZhbHVlIiwidmFsdWVVbml0IiwiZm9ybWF0IiwiZnJvbUNvbnRleHQiLCJ0b0NvbnRleHQiLCJwYXJzZUZsb2F0IiwicHhWYWx1ZSIsIkVNIiwiUkVNIiwiUEVSQ0VOVCIsIkVYIiwicmVzdWx0IiwibGluZXMiLCJNYXRoIiwiY2VpbCIsImZvbnRTaXplVW5pdCIsImxlYWRpbmciLCJyaHl0aG0iLCJpbmNyZWFzZSIsIm91dHB1dFVuaXQiLCJyZW1GYWxsYmFjayIsImZvdW5kIiwibWF0Y2giLCJyZXBsYWNlIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7QUFTQTs7Ozs7Ozs7Ozs7SUFXTUEsYzs7QUFFRjs7Ozs7Ozs7Ozs7Ozs7O0FBZUEsZ0NBQVlDLFFBQVosRUFBc0I7QUFBQTs7QUFDbEIscUJBQUtDLFlBQUwsR0FBb0JELFNBQVNFLFFBQTdCO0FBQ0EscUJBQUtDLFVBQUwsR0FBa0JILFNBQVNJLElBQTNCO0FBQ0EscUJBQUtDLFVBQUwsR0FBa0JMLFNBQVNLLFVBQTNCO0FBQ0EscUJBQUtDLGNBQUwsR0FBc0JOLFNBQVNNLGNBQS9CO0FBQ0EscUJBQUtDLGVBQUwsR0FBdUJQLFNBQVNPLGVBQWhDOztBQUVBO0FBQ0EscUJBQUtDLGNBQUwsR0FBc0JSLFNBQVNTLFVBQVQsSUFBdUJULFNBQVNFLFFBQWhDLEdBQ2xCRixTQUFTUyxVQURTLEdBRWpCVCxTQUFTUyxVQUFULEdBQXNCVCxTQUFTRSxRQUZwQztBQUdBLHFCQUFLUSxtQkFB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YixFQUF1QixjQUFLYixHQUE1QixFQUFpQyxjQUFLVCxFQUF0QyxDQUFkO0FBQ0FZLGlDQUFTQSxPQUFPWSxPQUFQLENBQWVGLE1BQU0sQ0FBTixDQUFmLEVBQXlCLHdCQUFVZixPQUFWLElBQXFCLElBQTlDLENBQVQ7QUFDSDs7QUFFRCx1QkFBT0ssTUFBUDtBQUNILFM7Ozs7O0FBR0w7Ozs7O2tCQUdlMUIsYyIsImZpbGUiOiJWZXJ0aWNhbFJoeXRobS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgICBmb3JtYXRJbnQsXHJcbiAgICBmb3JtYXRWYWx1ZSxcclxuICAgIHJlbVJlZ2V4cCxcclxuICAgIGdldFVuaXQsXHJcbiAgICBpc0hhcyxcclxuICAgIFVOSVRcclxufSBmcm9tIFwiLi9IZWxwZXJzXCI7XHJcblxyXG4vKipcclxuICogQG1vZHVsZSBWZXJ0aWNhbFJoeXRobVxyXG4gKiBcclxuICogQGRlc2NyaXB0aW9uIFZlcnRpY2FsUmh5dGhtIENsYXNzIGZvciBjYWxjdWxhdGUgcmh5dGhtIHNpemVzIGFucyBjb252ZXJ0IHVuaXRzLlxyXG4gKiBcclxuICogQHZlcnNpb24gMS4wXHJcbiAqIEBhdXRob3IgR3JpZ29yeSBWYXNpbHlldiA8cG9zdGNzcy5oYW1zdGVyQGdtYWlsLmNvbT4gaHR0cHM6Ly9naXRodWIuY29tL2gwdGMwZDNcclxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTcsIEdyaWdvcnkgVmFzaWx5ZXZcclxuICogQGxpY2Vuc2UgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wLCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAgXHJcbiAqL1xyXG5cclxuY2xhc3MgVmVydGljYWxSaHl0aG0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgZm9yIGNsYXNzIFZlcnRpY2FsUmh5dGhtLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlZlcnRpY2FsUmh5dGhtXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBzZXR0aW5ncyAtIHNldHRpbmdzIGhhc2guXHJcbiAgICAgKiBcclxuICAgICAqIDxwPlxyXG4gICAgICogVXNlOlxyXG4gICAgICogc2V0dGluZ3MuZm9udFNpemUgLSBiYXNlIGZvbnQgc2l6ZSBpbiBwaXhlbHMuXHJcbiAgICAgKiBzZXR0aW5ncy5weEZhbGxiYWNrIC0gYm9vbGVhbiBwaXhlbCBmYWxsYmFjay4gQ29udmVydCByZWxhdGl2ZSBzaXplcyB0byBwaXhlbHMuIElmIHJoeXRobSB1bml0IHJlbSB0aGVuIHJlbSB2YWx1ZSBkb3VibGVkIHdpdGggcGl4ZWxzIHZhbHVlcy5cclxuICAgICAqIElmIHJoeXRobSB1bml0IHB4IGFuZCBvcHRpb24gd2lsbCBiZSBzZXQgdGhlbiBpbiBsaW5lIGhlaWdodCB3aWxsIGJlIHBpeGVscyBsaWtlIDI0cHgsIGVsc2UgcmVsYXRpdmUgc2l6ZSBsaWtlIDEuNDUod2l0aG91dCBlbSBvciByZW0pXHJcbiAgICAgKiBzZXR0aW5ncy5saW5lSGVpZ2h0IC0gYmFzZSBsaW5lIGhlaWdodCBpbiBwaXhlbHMgb3IgcmVsYXRpdmUgdmFsdWUod2l0aG91dCBlbSBvciByZW0pLlxyXG4gICAgICogPC9wPlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzZXR0aW5ncykge1xyXG4gICAgICAgIHRoaXMuYmFzZUZvbnRTaXplID0gc2V0dGluZ3MuZm9udFNpemU7XHJcbiAgICAgICAgdGhpcy5yaHl0aG1Vbml0ID0gc2V0dGluZ3MudW5pdDtcclxuICAgICAgICB0aGlzLnB4RmFsbGJhY2sgPSBzZXR0aW5ncy5weEZhbGxiYWNrO1xyXG4gICAgICAgIHRoaXMubWluTGluZVBhZGRpbmcgPSBzZXR0aW5ncy5taW5MaW5lUGFkZGluZztcclxuICAgICAgICB0aGlzLnJvdW5kVG9IYWxmTGluZSA9IHNldHRpbmdzLnJvdW5kVG9IYWxmTGluZTtcclxuXHJcbiAgICAgICAgLy8gQmFzZSBMaW5lIEhlaWdodCBpbiBQaXhlbHNcclxuICAgICAgICB0aGlzLmJhc2VMaW5lSGVpZ2h0ID0gc2V0dGluZ3MubGluZUhlaWdodCA+PSBzZXR0aW5ncy5mb250U2l6ZSA/XHJcbiAgICAgICAgICAgIHNldHRpbmdzLmxpbmVIZWlnaHQgOlxyXG4gICAgICAgICAgICAoc2V0dGluZ3MubGluZUhlaWdodCAqIHNldHRpbmdzLmZvbnRTaXplKTtcclxuICAgICAgICB0aGlzLmJhc2VMaW5lSGVpZ2h0UmF0aW8gPSBzZXR0aW5ncy5saW5lSGVpZ2h0ID49IHNldHRpbmdzLmZvbnRTaXplID8gc2V0dGluZ3MubGluZUhlaWdodCAvIHRoaXMuYmFzZUZvbnRTaXplIDogc2V0dGluZ3MubGluZUhlaWdodDtcclxuICAgICAgICB0aGlzLmJhc2VMZWFkaW5nID0gdGhpcy5jb252ZXJ0KHRoaXMuYmFzZUxpbmVIZWlnaHQgLSB0aGlzLmJhc2VGb250U2l6ZSwgVU5JVC5QWCwgdGhpcy5yaHl0aG1Vbml0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgdmFsdWVzIGZyb20gdW5pdCB0byB1bml0LlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlZlcnRpY2FsUmh5dGhtXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIGlucHV0IHZhbHVlXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVVbml0IC0gaW5wdXQgdmFsdWUgdW5pdFxyXG4gICAgICogQHBhcmFtIGZvcm1hdCAtIG91dHB1dCB2YWx1ZSB1bml0XHJcbiAgICAgKiBAcGFyYW0gZnJvbUNvbnRleHQgLSBmcm9tIGJhc2UgZm9udCBzaXplXHJcbiAgICAgKiBAcGFyYW0gdG9Db250ZXh0IC0gdG8gbmV3IGJhc2UgZm9udCBzaXplXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gLSBvdXRwdXQgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIGNvbnZlcnQodmFsdWUsIHZhbHVlVW5pdCwgZm9ybWF0ID0gbnVsbCwgZnJvbUNvbnRleHQgPSBudWxsLCB0b0NvbnRleHQgPSBudWxsKSB7XHJcblxyXG4gICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcblxyXG4gICAgICAgIGlmIChmb3JtYXQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgZm9ybWF0ID0gdGhpcy5yaHl0aG1Vbml0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHZhbHVlVW5pdCA9PT0gZm9ybWF0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChmcm9tQ29udGV4dCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBmcm9tQ29udGV4dCA9IHRoaXMuYmFzZUZvbnRTaXplO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZyb21Db250ZXh0ID0gcGFyc2VGbG9hdChmcm9tQ29udGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodG9Db250ZXh0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRvQ29udGV4dCA9IGZyb21Db250ZXh0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRvQ29udGV4dCA9IHBhcnNlRmxvYXQodG9Db250ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBweFZhbHVlID0gMDtcclxuXHJcbiAgICAgICAgaWYgKHZhbHVlVW5pdCA9PT0gVU5JVC5FTSkge1xyXG4gICAgICAgICAgICBweFZhbHVlID0gdmFsdWUgKiBmcm9tQ29udGV4dDtcclxuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVW5pdCA9PT0gVU5JVC5SRU0pIHtcclxuICAgICAgICAgICAgcHhWYWx1ZSA9IHZhbHVlICogdGhpcy5iYXNlRm9udFNpemU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVVuaXQgPT09IFVOSVQuUEVSQ0VOVCkge1xyXG4gICAgICAgICAgICBweFZhbHVlID0gdmFsdWUgKiBmcm9tQ29udGV4dCAvIDEwMDtcclxuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVW5pdCA9PT0gVU5JVC5FWCkge1xyXG4gICAgICAgICAgICBweFZhbHVlID0gdmFsdWUgKiBmcm9tQ29udGV4dCAvIDI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcHhWYWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHB4VmFsdWU7XHJcblxyXG4gICAgICAgIGlmIChmb3JtYXQgPT09IFVOSVQuRU0pIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcHhWYWx1ZSAvIHRvQ29udGV4dDtcclxuICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PT0gVU5JVC5SRU0pIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcHhWYWx1ZSAvIHRoaXMuYmFzZUZvbnRTaXplO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZm9ybWF0ID09PSBVTklULlBFUkNFTlQpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcHhWYWx1ZSAqIDEwMCAvIHRvQ29udGV4dDtcclxuICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PT0gVU5JVC5FWCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBweFZhbHVlICogMiAvIHRvQ29udGV4dDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgdGhlIG1pbmltdW0gbXVsdGlwbGUgcmh5dGhtIHVuaXRzKGxpbmVzKSBuZWVkZWQgdG8gY29udGFpbiB0aGUgZm9udC1zaXplLiAxIHJoeXRobSB1bml0ID0gYmFzZSBsaW5lIGhlaWdodCBpbiBwaXhlbHMuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6VmVydGljYWxSaHl0aG1cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGZvbnRTaXplIC0gZm9udCBzaXplIGluIHBpeGVscywgZW0sIHJlbSBsaWtlIDEuNWVtLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gbnVtYmVyIG9mIGxpbmVzLlxyXG4gICAgICovXHJcbiAgICBsaW5lcyhmb250U2l6ZSkge1xyXG5cclxuICAgICAgICBsZXQgbGluZXMgPSAwO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yaHl0aG1Vbml0ID09PSBVTklULlBYKSB7XHJcblxyXG4gICAgICAgICAgICBsaW5lcyA9ICh0aGlzLnJvdW5kVG9IYWxmTGluZSkgPyBNYXRoLmNlaWwoMiAqIGZvbnRTaXplIC8gdGhpcy5iYXNlTGluZUhlaWdodCkgLyAyIDogTWF0aC5jZWlsKGZvbnRTaXplIC8gdGhpcy5iYXNlTGluZUhlaWdodCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5yaHl0aG1Vbml0ID09PSBVTklULkVNIHx8IHRoaXMucmh5dGhtVW5pdCA9PT0gVU5JVC5SRU0pIHtcclxuXHJcbiAgICAgICAgICAgIGxpbmVzID0gKHRoaXMucm91bmRUb0hhbGZMaW5lKSA/IE1hdGguY2VpbCgyICogZm9udFNpemUgLyB0aGlzLmJhc2VMaW5lSGVpZ2h0UmF0aW8pIC8gMiA6IE1hdGguY2VpbChmb250U2l6ZSAvIHRoaXMuYmFzZUxpbmVIZWlnaHRSYXRpbyk7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICAvL0lmIGxpbmVzIGFyZSBjcmFtcGVkIGluY2x1ZGUgc29tZSBleHRyYSBsZWFkLlxyXG4gICAgICAgIGlmICgobGluZXMgKiB0aGlzLmJhc2VMaW5lSGVpZ2h0IC0gZm9udFNpemUpIDwgKHRoaXMubWluTGluZVBhZGRpbmcgKiAyKSkge1xyXG4gICAgICAgICAgICBsaW5lcyA9ICh0aGlzLnJvdW5kVG9IYWxmTGluZSkgPyBsaW5lcyArIDAuNSA6IGxpbmVzICsgMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBsaW5lcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSBsaW5lIGhlaWdodCB2YWx1ZSBpbiByaHl0aG0gdW5pdHMgZm9yIGZvbnQgc2l6ZS4gR2VuZXJhdGUgbGluZSBoZWlnaHQgZnJvbSBmb250IHNpemUgb3IgaW5wdXQgbGluZXMuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6VmVydGljYWxSaHl0aG1cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGZvbnRTaXplIC0gZm9udCBzaXplIGluIHBpeGVscywgZW0sIHJlbSBsaWtlIDEuNWVtLlxyXG4gICAgICogQHBhcmFtIHZhbHVlIC0gaW5wdXQgbGluZXMsIGJlZm9yZSBvdXRwdXQgMSBsaW5lIGhlaWdodCB3aWxsIGJlIG11bHRpcGx5IHdpdGggdmFsdWUuXHJcbiAgICAgKiBAcGFyYW0gYmFzZUZvbnRTaXplIC0gYmFzZSBmb250IHNpemUgZm9yIGNhbGN1bGF0aW9uIHJlbGF0aXZlIHNpemVzIGZvciBweCBvciBlbS5cclxuICAgICAqIEBwYXJhbSBweEZhbGxiYWNrIC0gYm9vbGVhbiBwaXhlbCBmYWxsYmFjayBvcHRpb24uIElnbm9yZSBzZXR0aW5ncy5weEZhbGxiYWNrIG9wdGlvbi4gQ29udmVydCByZWxhdGl2ZSBzaXplcyB0byBwaXhlbHMuIElmIHJoeXRobSB1bml0IHJlbSB0aGVuIHJlbSB2YWx1ZSBkb3VibGVkIHdpdGggcGl4ZWxzIHZhbHVlcy5cclxuICAgICAqIElmIHJoeXRobSB1bml0IHB4IGFuZCBvcHRpb24gd2lsbCBiZSBzZXQgdGhlbiBpbiBsaW5lIGhlaWdodCB3aWxsIGJlIHBpeGVscyBsaWtlIDI0cHgsIGVsc2UgcmVsYXRpdmUgc2l6ZSBsaWtlIDEuNDUod2l0aG91dCBlbSBvciByZW0pLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gbGluZSBoZWlnaHQgaW4gcmh5dGhtIHVuaXQuXHJcbiAgICAgKi9cclxuICAgIGxpbmVIZWlnaHQoZm9udFNpemUsIHZhbHVlLCBiYXNlRm9udFNpemUsIHB4RmFsbGJhY2sgPSBmYWxzZSkge1xyXG5cclxuICAgICAgICBpZiAoIWZvbnRTaXplKSB7XHJcbiAgICAgICAgICAgIGZvbnRTaXplID0gdGhpcy5iYXNlRm9udFNpemUgKyBcInB4XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZm9udFNpemUgJiYgKHRoaXMucmh5dGhtVW5pdCA9PT0gVU5JVC5FTSB8fCAhdmFsdWUpKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZm9udFNpemVVbml0ID0gZ2V0VW5pdChmb250U2l6ZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZm9udFNpemVVbml0ICE9IHRoaXMucmh5dGhtVW5pdCB8fCBiYXNlRm9udFNpemUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZSA9IChiYXNlRm9udFNpemUpID8gdGhpcy5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIHRoaXMucmh5dGhtVW5pdCwgYmFzZUZvbnRTaXplKSA6IHRoaXMuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCB0aGlzLnJoeXRobVVuaXQpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHBhcnNlRmxvYXQoZm9udFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFsdWUgPSAodmFsdWUpID8gcGFyc2VGbG9hdCh2YWx1ZSkgOiB0aGlzLmxpbmVzKGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IDA7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJoeXRobVVuaXQgPT09IFVOSVQuUFgpIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IChmb250U2l6ZSAmJiAhdGhpcy5weEZhbGxiYWNrICYmICFweEZhbGxiYWNrKSA/IGZvcm1hdFZhbHVlKHRoaXMuYmFzZUxpbmVIZWlnaHQgKiB2YWx1ZSAvIGZvbnRTaXplKSA6IGZvcm1hdEludCh0aGlzLmJhc2VMaW5lSGVpZ2h0ICogdmFsdWUpICsgXCJweFwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmh5dGhtVW5pdCA9PT0gVU5JVC5FTSkge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gZm9ybWF0VmFsdWUodmFsdWUgKiB0aGlzLmJhc2VMaW5lSGVpZ2h0UmF0aW8gLyBmb250U2l6ZSkgKyBcImVtXCI7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5yaHl0aG1Vbml0ID09PSBVTklULlJFTSkge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gZm9ybWF0VmFsdWUodmFsdWUgKiB0aGlzLmJhc2VMaW5lSGVpZ2h0UmF0aW8pICsgXCJyZW1cIjtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSBsZWFkaW5nIHZhbHVlIGluIHJoeXRobSB1bml0XHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpWZXJ0aWNhbFJoeXRobVxyXG4gICAgICogXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIDEgbGVhZGluZyhpbiBwaXhlbHMpID0gYmFzZSBsaW5lIGhlaWdodChpbiBwaXhlbHMpIC0gYmFzZSBmb250IHNpemUoaW4gcGl4ZWxzKS5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHZhbHVlIC0gaW5wdXQgbGluZXMsIGJlZm9yZSBvdXRwdXQgMSBsaW5lIGhlaWdodCB3aWxsIGJlIG11bHRpcGx5IHdpdGggdmFsdWUuXHJcbiAgICAgKiBAcGFyYW0gZm9udFNpemUgLSBmb250IHNpemUgaW4gcGl4ZWxzLCBlbSwgcmVtIGxpa2UgMS41ZW0uXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gLSBsZWFkaW5nIGluIHJoeXRobSB1bml0LlxyXG4gICAgICovXHJcbiAgICBsZWFkaW5nKHZhbHVlLCBmb250U2l6ZSkge1xyXG5cclxuICAgICAgICBpZiAoIWZvbnRTaXplKSB7XHJcbiAgICAgICAgICAgIGZvbnRTaXplID0gdGhpcy5iYXNlRm9udFNpemUgKyBcInB4XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZm9udFNpemVVbml0ID0gZ2V0VW5pdChmb250U2l6ZSk7XHJcblxyXG4gICAgICAgIGlmIChmb250U2l6ZVVuaXQgIT0gdGhpcy5yaHl0aG1Vbml0KSB7XHJcblxyXG4gICAgICAgICAgICBmb250U2l6ZSA9IHRoaXMuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCB0aGlzLnJoeXRobVVuaXQpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgZm9udFNpemUgPSBwYXJzZUZsb2F0KGZvbnRTaXplKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBsaW5lcyA9IHRoaXMubGluZXMoZm9udFNpemUpLFxyXG4gICAgICAgICAgICByZXN1bHQgPSAwO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yaHl0aG1Vbml0ID09PSBVTklULlBYKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRJbnQoKGxpbmVzICogdGhpcy5iYXNlTGluZUhlaWdodCAtIGZvbnRTaXplKSAqIHZhbHVlKSArIFwicHhcIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJoeXRobVVuaXQgPT09IFVOSVQuRU0pIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdFZhbHVlKCh0aGlzLmJhc2VMaW5lSGVpZ2h0UmF0aW8gKiBsaW5lcyAtIGZvbnRTaXplKSAqIHZhbHVlIC8gZm9udFNpemUpICsgXCJlbVwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmh5dGhtVW5pdCA9PT0gVU5JVC5SRU0pIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdFZhbHVlKChsaW5lcyAqIHRoaXMuYmFzZUxpbmVIZWlnaHRSYXRpbyAtIGZvbnRTaXplKSAqIHZhbHVlKSArIFwicmVtXCI7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgcmh5dGhtIHZhbHVlIGluIHJoeXRobSB1bml0LiBJdCB1c2VkIGZvciBoZWlnaHQgdmFsdWVzLCBldGMuIFxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6VmVydGljYWxSaHl0aG1cclxuICAgICAqIFxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBcclxuICAgICAqIElmIHZhbHVlIDQ1MHB4LCBhbmQgYmFzZSBmb250IHNpemUgMTYsIGxpbmUtaGVpZ2h0IDEuNSwgaW5jcmVhc2UgPSBmYWxzZSB0aGVuIHJldHVybiA0MzJweC5cclxuICAgICAqIElmIHZhbHVlIDQ1MHB4LCBhbmQgYmFzZSBmb250IHNpemUgMTYsIGxpbmUtaGVpZ2h0IDEuNSwgaW5jcmVhc2UgPSB0cnVlIHRoZW4gcmV0dXJuIDQ1NnB4LlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBpbnB1dCB2YWx1ZSBsaWtlIDQ1MHB4OyAxMGVtOyAxMDByZW07LlxyXG4gICAgICogQHBhcmFtIGZvbnRTaXplIC0gZm9udCBzaXplIGluIHBpeGVscywgZW0sIHJlbSBsaWtlIDEuNWVtLlxyXG4gICAgICogQHBhcmFtIGluY3JlYXNlIC0gaW5jcmVhc2Ugb3IgZGVjcmVhc2Ugc2l6ZS4gRGVmYXVsdCBkZWNyZWFzZS4gaW5jcmVhc2UgPSBmYWxzZS5cclxuICAgICAqIEBwYXJhbSBvdXRwdXRVbml0IC0gb3V0cHV0IHZhbHVlIHVuaXQuIFxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gcmh5dGhtZCB2YWx1ZSByaHl0aG0gdW5pdC5cclxuICAgICAqL1xyXG5cclxuICAgIHJoeXRobSh2YWx1ZSwgZm9udFNpemUsIGluY3JlYXNlID0gZmFsc2UsIG91dHB1dFVuaXQpIHtcclxuXHJcbiAgICAgICAgaWYgKGZvbnRTaXplID09IG51bGwpIHtcclxuICAgICAgICAgICAgZm9udFNpemUgPSB0aGlzLmJhc2VGb250U2l6ZSArIFwicHhcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdXRwdXRVbml0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgb3V0cHV0VW5pdCA9IHRoaXMucmh5dGhtVW5pdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBmb250U2l6ZVVuaXQgPSBnZXRVbml0KGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgaWYgKGZvbnRTaXplVW5pdCAhPSB0aGlzLnJoeXRobVVuaXQpIHtcclxuXHJcbiAgICAgICAgICAgIGZvbnRTaXplID0gdGhpcy5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIHRoaXMucmh5dGhtVW5pdCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBmb250U2l6ZSA9IHBhcnNlRmxvYXQoZm9udFNpemUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHZhbHVlVW5pdCA9IGdldFVuaXQodmFsdWUpO1xyXG5cclxuICAgICAgICBpZiAodmFsdWVVbml0ICE9IHRoaXMucmh5dGhtVW5pdCkge1xyXG5cclxuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmNvbnZlcnQodmFsdWUsIHZhbHVlVW5pdCwgdGhpcy5yaHl0aG1Vbml0KTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbGluZXMgPSB0aGlzLmxpbmVzKHZhbHVlKSxcclxuICAgICAgICAgICAgcmVzdWx0ID0gMDtcclxuXHJcbiAgICAgICAgaWYgKCFpbmNyZWFzZSAmJiAodmFsdWUgPCAobGluZXMgKiBmb250U2l6ZSAqIHRoaXMuYmFzZUxpbmVIZWlnaHRSYXRpbykpKSB7XHJcbiAgICAgICAgICAgIGxpbmVzID0gbGluZXMgLSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG91dHB1dFVuaXQgPT09IFVOSVQuUFgpIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdEludChsaW5lcyAqIHRoaXMuYmFzZUxpbmVIZWlnaHQpICsgXCJweFwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKG91dHB1dFVuaXQgPT09IFVOSVQuRU0pIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdFZhbHVlKHRoaXMuYmFzZUxpbmVIZWlnaHRSYXRpbyAqIGxpbmVzIC8gZm9udFNpemUpICsgXCJlbVwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKG91dHB1dFVuaXQgPT09IFVOSVQuUkVNKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRWYWx1ZSh0aGlzLmJhc2VMaW5lSGVpZ2h0UmF0aW8gKiBsaW5lcykgKyBcInJlbVwiO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCByZW0gdG8gcGl4ZWwgdmFsdWUuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIGlucHV0IHZhbHVlIGluIHJlbS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAtIG91dHB1dCB2YWx1ZSBpbiBwaXhlbHMuXHJcbiAgICAgKi9cclxuICAgIHJlbUZhbGxiYWNrKHZhbHVlKSB7XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQgPSB2YWx1ZTtcclxuICAgICAgICBsZXQgZm91bmQgPSBudWxsO1xyXG4gICAgICAgIHdoaWxlICgoZm91bmQgPSByZXN1bHQubWF0Y2gocmVtUmVnZXhwKSkpIHtcclxuICAgICAgICAgICAgbGV0IHB4VmFsdWUgPSB0aGlzLmNvbnZlcnQoZm91bmRbMV0sIFVOSVQuUkVNLCBVTklULlBYKTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoZm91bmRbMF0sIGZvcm1hdEludChweFZhbHVlKSArIFwicHhcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogRXhwb3J0IFZlcnRpY2FsIFJoeXRobSBDbGFzcy5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IFZlcnRpY2FsUmh5dGhtOyJdfQ==
