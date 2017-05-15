"use strict";

exports.__esModule = true;

var _Helpers = require("./Helpers");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
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
         * settings.pxFallback - boolean pixel fallback. Convert relative sizes to pixels.
         * If rhythm unit rem then rem value doubled with pixels values.
         * If rhythm unit px and option will be set then in line height will be pixels like 24px,
         * else relative size like 1.45(without em or rem)
         * settings.lineHeight - base line height in pixels or relative value(without em or rem).
         * </p>
         */
        function VerticalRhythm(settings) {
                _classCallCheck(this, VerticalRhythm);

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


        VerticalRhythm.prototype.convert = function convert(value, valueUnit, format, fromContext, toContext) {

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

                var pxValue = 0;

                if (valueUnit === _Helpers.UNIT.EM) {
                        pxValue = value * fromContext;
                } else if (valueUnit === _Helpers.UNIT.REM) {
                        pxValue = value * this.settings.fontSize;
                } else if (valueUnit === _Helpers.UNIT.PERCENT) {
                        pxValue = value * fromContext / 100;
                } else if (valueUnit === _Helpers.UNIT.EX) {
                        pxValue = value * fromContext / 2;
                } else {
                        pxValue = value;
                }

                if (this.settings.unit === _Helpers.UNIT.PX && this.settings.pxFallback) {
                        pxValue = Math.round(pxValue);
                }

                var result = pxValue;

                if (format === _Helpers.UNIT.EM) {
                        result = pxValue / toContext;
                } else if (format === _Helpers.UNIT.REM) {
                        result = pxValue / this.settings.fontSize;
                } else if (format === _Helpers.UNIT.PERCENT) {
                        result = pxValue * 100 / toContext;
                } else if (format === _Helpers.UNIT.EX) {
                        result = pxValue * 2 / toContext;
                }

                return result;
        };

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


        VerticalRhythm.prototype.lines = function lines(fontSize) {
                var unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.settings.unit;


                var lines = 0;

                if (unit === _Helpers.UNIT.PX) {

                        lines = this.settings.roundToHalfLine ? Math.ceil(2 * fontSize / this.settings.lineHeightPx) / 2 : Math.ceil(fontSize / this.settings.lineHeightPx);
                } else if (unit === _Helpers.UNIT.EM || unit === _Helpers.UNIT.REM || unit === _Helpers.UNIT.VW) {

                        lines = this.settings.roundToHalfLine ? Math.ceil(2 * fontSize / this.settings.lineHeightRel) / 2 : Math.ceil(fontSize / this.settings.lineHeightRel);
                }

                //If lines are cramped include some extra lead.
                if (lines * this.settings.lineHeightPx - fontSize < this.settings.minLinePadding * 2) {
                        lines = this.settings.roundToHalfLine ? lines + 0.5 : lines + 1;
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
         * @param pxFallback - boolean pixel fallback option. Ignore settings.pxFallback option.
         * Convert relative sizes to pixels. If rhythm unit rem then rem value doubled with pixels values.
         * If rhythm unit px and option will be set then in line height will be pixels like 24px,
         * else relative size like 1.45(without em or rem).
         * 
         * @return {number} - line height in rhythm unit.
         */


        VerticalRhythm.prototype.lineHeight = function lineHeight(fontSize, value, baseFontSize) {
                var pxFallback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;


                if (!fontSize) {
                        fontSize = this.settings.fontSize + "px";
                }

                if (fontSize && (this.settings.unit === _Helpers.UNIT.EM || !value)) {

                        var fontSizeUnit = (0, _Helpers.getUnit)(fontSize);

                        if (this.settings.unit !== _Helpers.UNIT.VW && (fontSizeUnit !== this.settings.unit || baseFontSize)) {

                                fontSize = baseFontSize ? this.convert(fontSize, fontSizeUnit, this.settings.unit, baseFontSize) : this.convert(fontSize, fontSizeUnit, this.settings.unit);
                        }
                }

                fontSize = parseFloat(fontSize);

                value = value ? parseFloat(value) : this.lines(fontSize);

                var result = 0;

                if (this.settings.unit === _Helpers.UNIT.PX) {
                        result = fontSize && !this.settings.pxFallback && !pxFallback ? (0, _Helpers.formatValue)(this.settings.lineHeightPx * value / fontSize) : (0, _Helpers.formatInt)(this.settings.lineHeightPx * value) + "px";
                } else if (this.settings.unit === _Helpers.UNIT.EM) {

                        result = (0, _Helpers.formatValue)(value * this.settings.lineHeightRel / fontSize) + "em";
                } else if (this.settings.unit === _Helpers.UNIT.REM) {

                        result = (0, _Helpers.formatValue)(value * this.settings.lineHeightRel) + "rem";
                } else if (this.settings.unit === _Helpers.UNIT.VW) {
                        result = value;
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
                        fontSize = this.settings.fontSize + "px";
                }

                var fontSizeUnit = (0, _Helpers.getUnit)(fontSize);

                if (this.settings.unit !== _Helpers.UNIT.VW && fontSizeUnit !== this.settings.unit) {

                        fontSize = this.convert(fontSize, fontSizeUnit, this.settings.unit);
                }

                fontSize = parseFloat(fontSize);

                var lines = this.lines(fontSize),
                    result = 0;

                if (this.settings.unit === _Helpers.UNIT.PX) {

                        result = (0, _Helpers.formatInt)((lines * this.settings.lineHeightPx - fontSize) * value) + "px";
                } else if (this.settings.unit === _Helpers.UNIT.EM) {

                        result = (0, _Helpers.formatValue)((this.settings.lineHeightRel * lines - fontSize) * value / fontSize) + "em";
                } else if (this.settings.unit === _Helpers.UNIT.REM) {

                        result = (0, _Helpers.formatValue)((lines * this.settings.lineHeightRel - fontSize) * value) + "rem";
                } else if (this.settings.unit === _Helpers.UNIT.VW) {
                        result = lines;
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


                if (!fontSize) {
                        fontSize = this.settings.fontSize + "px";
                }

                if (!outputUnit) {
                        outputUnit = this.settings.unit;
                }

                var fontSizeUnit = (0, _Helpers.getUnit)(fontSize);

                if (this.settings.unit !== _Helpers.UNIT.VW && fontSizeUnit !== this.settings.unit) {

                        fontSize = this.convert(fontSize, fontSizeUnit, this.settings.unit);
                }

                fontSize = parseFloat(fontSize);
                var valueUnit = (0, _Helpers.getUnit)(value);

                if (valueUnit !== this.settings.unit) {

                        value = this.convert(value, valueUnit, this.settings.unit);
                } else {

                        value = parseFloat(value);
                }

                var lines = this.lines(value),
                    result = 0;

                if (!increase && value < lines * fontSize * this.settings.lineHeightRel) {
                        lines = lines - 1;
                }

                if (outputUnit === _Helpers.UNIT.PX) {

                        result = (0, _Helpers.formatInt)(lines * this.settings.lineHeight) + "px";
                } else if (outputUnit === _Helpers.UNIT.EM) {

                        result = (0, _Helpers.formatValue)(this.settings.lineHeightRel * lines / fontSize) + "em";
                } else if (outputUnit === _Helpers.UNIT.REM) {

                        result = (0, _Helpers.formatValue)(this.settings.lineHeightRel * lines) + "rem";
                } else if (outputUnit === _Helpers.UNIT.VW) {
                        result = lines;
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
                var found = void 0;
                while (found = result.match(_Helpers.remRegexp)) {
                        var pxValue = this.convert(found[1], _Helpers.UNIT.REM, _Helpers.UNIT.PX);
                        result = result.replace(found[0], (0, _Helpers.formatInt)(pxValue) + "px");
                }

                return result;
        };

        VerticalRhythm.prototype.base = function base(value, fontSize) {
                var result = parseFloat(value);

                if (!fontSize) {
                        fontSize = this.settings.fontSize + "px";
                }

                var fontSizeUnit = (0, _Helpers.getUnit)(fontSize);

                if (fontSizeUnit !== this.settings.unit) {

                        fontSize = this.convert(fontSize, fontSizeUnit, this.settings.unit);
                }

                fontSize = parseFloat(fontSize);

                if (this.settings.unit === _Helpers.UNIT.PX) {
                        result = (0, _Helpers.formatInt)(fontSize * result) + "px";
                } else {
                        result = (0, _Helpers.formatValue)(fontSize * result) + _Helpers.unitName[this.settings.unit];
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlZlcnRpY2FsUmh5dGhtLmVzNiJdLCJuYW1lcyI6WyJWZXJ0aWNhbFJoeXRobSIsInNldHRpbmdzIiwiY29udmVydCIsInZhbHVlIiwidmFsdWVVbml0IiwiZm9ybWF0IiwiZnJvbUNvbnRleHQiLCJ0b0NvbnRleHQiLCJwYXJzZUZsb2F0IiwidW5pdCIsImZvbnRTaXplIiwicHhWYWx1ZSIsIkVNIiwiUkVNIiwiUEVSQ0VOVCIsIkVYIiwiUFgiLCJweEZhbGxiYWNrIiwiTWF0aCIsInJvdW5kIiwicmVzdWx0IiwibGluZXMiLCJyb3VuZFRvSGFsZkxpbmUiLCJjZWlsIiwibGluZUhlaWdodFB4IiwiVlciLCJsaW5lSGVpZ2h0UmVsIiwibWluTGluZVBhZGRpbmciLCJsaW5lSGVpZ2h0IiwiYmFzZUZvbnRTaXplIiwiZm9udFNpemVVbml0IiwibGVhZGluZyIsInJoeXRobSIsImluY3JlYXNlIiwib3V0cHV0VW5pdCIsInJlbUZhbGxiYWNrIiwiZm91bmQiLCJtYXRjaCIsInJlcGxhY2UiLCJiYXNlIl0sIm1hcHBpbmdzIjoiOzs7O0FBV0E7OzBKQVhBOzs7Ozs7Ozs7OztJQW9CTUEsYzs7QUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkEsZ0NBQVlDLFFBQVosRUFBc0I7QUFBQTs7QUFDbEIscUJBQUtBLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7OztpQ0FhQUMsTyxvQkFBUUMsSyxFQUFPQyxTLEVBQVdDLE0sRUFBUUMsVyxFQUFhQyxTLEVBQVc7O0FBRXRESix3QkFBUUssV0FBV0wsS0FBWCxDQUFSOztBQUVBLG9CQUFJLENBQUNFLE1BQUwsRUFBYTtBQUNUQSxpQ0FBUyxLQUFLSixRQUFMLENBQWNRLElBQXZCO0FBQ0g7O0FBRUQsb0JBQUlMLGNBQWNDLE1BQWxCLEVBQTBCO0FBQ3RCLCtCQUFPRixLQUFQO0FBQ0g7O0FBRUQsb0JBQUksQ0FBQ0csV0FBTCxFQUFrQjtBQUNkQSxzQ0FBYyxLQUFLTCxRQUFMLENBQWNTLFFB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QVdGLFdBQVdFLFFBQVgsQ0FBWDs7QUFFQSxvQkFBRyxLQUFLVCxRQUFMLENBQWNRLElBQWQsS0FBdUIsY0FBS08sRUFBL0IsRUFBbUM7QUFDL0JJLGlDQUFTLHdCQUFVVixXQUFXVSxNQUFyQixJQUErQixJQUF4QztBQUNILGlCQUZELE1BRU87QUFDSEEsaUNBQVMsMEJBQVlWLFdBQVdVLE1BQXZCLElBQWlDLGtCQUFTLEtBQUtuQixRQUFMLENBQWNRLElBQXZCLENBQTFDO0FBQ0g7QUFDRCx1QkFBT1csTUFBUDtBQUNILFM7Ozs7O0FBR0w7Ozs7O2tCQUdlcEIsYyIsImZpbGUiOiJWZXJ0aWNhbFJoeXRobS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbW9kdWxlIFZlcnRpY2FsUmh5dGhtXHJcbiAqXHJcbiAqIEBkZXNjcmlwdGlvbiBWZXJ0aWNhbFJoeXRobSBDbGFzcyBmb3IgY2FsY3VsYXRlIHJoeXRobSBzaXplcyBhbnMgY29udmVydCB1bml0cy5cclxuICpcclxuICogQHZlcnNpb24gMS4wXHJcbiAqIEBhdXRob3IgR3JpZ29yeSBWYXNpbHlldiA8cG9zdGNzcy5oYW1zdGVyQGdtYWlsLmNvbT4gaHR0cHM6Ly9naXRodWIuY29tL2gwdGMwZDNcclxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTcsIEdyaWdvcnkgVmFzaWx5ZXZcclxuICogQGxpY2Vuc2UgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wLCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuICovXHJcblxyXG5pbXBvcnQge1xyXG4gICAgZm9ybWF0SW50LFxyXG4gICAgZm9ybWF0VmFsdWUsXHJcbiAgICByZW1SZWdleHAsXHJcbiAgICBnZXRVbml0LFxyXG4gICAgVU5JVCxcclxuICAgIHVuaXROYW1lXHJcbn0gZnJvbSBcIi4vSGVscGVyc1wiO1xyXG5cclxuY2xhc3MgVmVydGljYWxSaHl0aG0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgZm9yIGNsYXNzIFZlcnRpY2FsUmh5dGhtLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlZlcnRpY2FsUmh5dGhtXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBzZXR0aW5ncyAtIHNldHRpbmdzIGhhc2guXHJcbiAgICAgKiBcclxuICAgICAqIDxwPlxyXG4gICAgICogVXNlOlxyXG4gICAgICogc2V0dGluZ3MuZm9udFNpemUgLSBiYXNlIGZvbnQgc2l6ZSBpbiBwaXhlbHMuXHJcbiAgICAgKiBzZXR0aW5ncy5weEZhbGxiYWNrIC0gYm9vbGVhbiBwaXhlbCBmYWxsYmFjay4gQ29udmVydCByZWxhdGl2ZSBzaXplcyB0byBwaXhlbHMuXHJcbiAgICAgKiBJZiByaHl0aG0gdW5pdCByZW0gdGhlbiByZW0gdmFsdWUgZG91YmxlZCB3aXRoIHBpeGVscyB2YWx1ZXMuXHJcbiAgICAgKiBJZiByaHl0aG0gdW5pdCBweCBhbmQgb3B0aW9uIHdpbGwgYmUgc2V0IHRoZW4gaW4gbGluZSBoZWlnaHQgd2lsbCBiZSBwaXhlbHMgbGlrZSAyNHB4LFxyXG4gICAgICogZWxzZSByZWxhdGl2ZSBzaXplIGxpa2UgMS40NSh3aXRob3V0IGVtIG9yIHJlbSlcclxuICAgICAqIHNldHRpbmdzLmxpbmVIZWlnaHQgLSBiYXNlIGxpbmUgaGVpZ2h0IGluIHBpeGVscyBvciByZWxhdGl2ZSB2YWx1ZSh3aXRob3V0IGVtIG9yIHJlbSkuXHJcbiAgICAgKiA8L3A+XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHNldHRpbmdzKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCB2YWx1ZXMgZnJvbSB1bml0IHRvIHVuaXQuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6VmVydGljYWxSaHl0aG1cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gaW5wdXQgdmFsdWVcclxuICAgICAqIEBwYXJhbSB2YWx1ZVVuaXQgLSBpbnB1dCB2YWx1ZSB1bml0XHJcbiAgICAgKiBAcGFyYW0gZm9ybWF0IC0gb3V0cHV0IHZhbHVlIHVuaXRcclxuICAgICAqIEBwYXJhbSBmcm9tQ29udGV4dCAtIGZyb20gYmFzZSBmb250IHNpemVcclxuICAgICAqIEBwYXJhbSB0b0NvbnRleHQgLSB0byBuZXcgYmFzZSBmb250IHNpemVcclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAtIG91dHB1dCB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgY29udmVydCh2YWx1ZSwgdmFsdWVVbml0LCBmb3JtYXQsIGZyb21Db250ZXh0LCB0b0NvbnRleHQpIHtcclxuXHJcbiAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuXHJcbiAgICAgICAgaWYgKCFmb3JtYXQpIHtcclxuICAgICAgICAgICAgZm9ybWF0ID0gdGhpcy5zZXR0aW5ncy51bml0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHZhbHVlVW5pdCA9PT0gZm9ybWF0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZnJvbUNvbnRleHQpIHtcclxuICAgICAgICAgICAgZnJvbUNvbnRleHQgPSB0aGlzLnNldHRpbmdzLmZvbnRTaXplO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZyb21Db250ZXh0ID0gcGFyc2VGbG9hdChmcm9tQ29udGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRvQ29udGV4dCkge1xyXG4gICAgICAgICAgICB0b0NvbnRleHQgPSBmcm9tQ29udGV4dDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0b0NvbnRleHQgPSBwYXJzZUZsb2F0KHRvQ29udGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcHhWYWx1ZSA9IDA7XHJcblxyXG4gICAgICAgIGlmICh2YWx1ZVVuaXQgPT09IFVOSVQuRU0pIHtcclxuICAgICAgICAgICAgcHhWYWx1ZSA9IHZhbHVlICogZnJvbUNvbnRleHQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVVuaXQgPT09IFVOSVQuUkVNKSB7XHJcbiAgICAgICAgICAgIHB4VmFsdWUgPSB2YWx1ZSAqIHRoaXMuc2V0dGluZ3MuZm9udFNpemU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVVuaXQgPT09IFVOSVQuUEVSQ0VOVCkge1xyXG4gICAgICAgICAgICBweFZhbHVlID0gdmFsdWUgKiBmcm9tQ29udGV4dCAvIDEwMDtcclxuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVW5pdCA9PT0gVU5JVC5FWCkge1xyXG4gICAgICAgICAgICBweFZhbHVlID0gdmFsdWUgKiBmcm9tQ29udGV4dCAvIDI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcHhWYWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy5zZXR0aW5ncy51bml0ID09PSBVTklULlBYICYmIHRoaXMuc2V0dGluZ3MucHhGYWxsYmFjayl7XHJcbiAgICAgICAgICAgIHB4VmFsdWUgPSBNYXRoLnJvdW5kKHB4VmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHB4VmFsdWU7XHJcblxyXG4gICAgICAgIGlmIChmb3JtYXQgPT09IFVOSVQuRU0pIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcHhWYWx1ZSAvIHRvQ29udGV4dDtcclxuICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PT0gVU5JVC5SRU0pIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcHhWYWx1ZSAvIHRoaXMuc2V0dGluZ3MuZm9udFNpemU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChmb3JtYXQgPT09IFVOSVQuUEVSQ0VOVCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBweFZhbHVlICogMTAwIC8gdG9Db250ZXh0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZm9ybWF0ID09PSBVTklULkVYKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHB4VmFsdWUgKiAyIC8gdG9Db250ZXh0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSB0aGUgbWluaW11bSBtdWx0aXBsZSByaHl0aG0gdW5pdHMobGluZXMpIG5lZWRlZCB0byBjb250YWluIHRoZSBmb250LXNpemUuXHJcbiAgICAgKiAxIHJoeXRobSB1bml0ID0gYmFzZSBsaW5lIGhlaWdodCBpbiBwaXhlbHMuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6VmVydGljYWxSaHl0aG1cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGZvbnRTaXplIC0gZm9udCBzaXplIGluIHBpeGVscywgZW0sIHJlbSBsaWtlIDEuNWVtLlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gdW5pdCAtIGlucHV0IHZhbHVlIHVuaXQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAtIG51bWJlciBvZiBsaW5lcy5cclxuICAgICAqL1xyXG4gICAgbGluZXMoZm9udFNpemUsIHVuaXQgPSB0aGlzLnNldHRpbmdzLnVuaXQpIHtcclxuXHJcbiAgICAgICAgbGV0IGxpbmVzID0gMDtcclxuXHJcbiAgICAgICAgaWYgKHVuaXQgPT09IFVOSVQuUFgpIHtcclxuXHJcbiAgICAgICAgICAgIGxpbmVzID0gKHRoaXMuc2V0dGluZ3Mucm91bmRUb0hhbGZMaW5lKVxyXG4gICAgICAgICAgICAgICAgPyBNYXRoLmNlaWwoMiAqIGZvbnRTaXplIC8gdGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UHgpIC8gMlxyXG4gICAgICAgICAgICAgICAgOiBNYXRoLmNlaWwoZm9udFNpemUgLyB0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRQeCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAodW5pdCA9PT0gVU5JVC5FTSB8fCB1bml0ID09PSBVTklULlJFTSB8fCB1bml0ID09PSBVTklULlZXKSB7XHJcblxyXG4gICAgICAgICAgICBsaW5lcyA9ICh0aGlzLnNldHRpbmdzLnJvdW5kVG9IYWxmTGluZSlcclxuICAgICAgICAgICAgICAgID8gTWF0aC5jZWlsKDIgKiBmb250U2l6ZSAvIHRoaXMuc2V0dGluZ3MubGluZUhlaWdodFJlbCkgLyAyXHJcbiAgICAgICAgICAgICAgICA6IE1hdGguY2VpbChmb250U2l6ZSAvIHRoaXMuc2V0dGluZ3MubGluZUhlaWdodFJlbCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9JZiBsaW5lcyBhcmUgY3JhbXBlZCBpbmNsdWRlIHNvbWUgZXh0cmEgbGVhZC5cclxuICAgICAgICBpZiAoKGxpbmVzICogdGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UHggLSBmb250U2l6ZSkgPCAodGhpcy5zZXR0aW5ncy5taW5MaW5lUGFkZGluZyAqIDIpKSB7XHJcbiAgICAgICAgICAgIGxpbmVzID0gKHRoaXMuc2V0dGluZ3Mucm91bmRUb0hhbGZMaW5lKSA/IGxpbmVzICsgMC41IDogbGluZXMgKyAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGxpbmVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIGxpbmUgaGVpZ2h0IHZhbHVlIGluIHJoeXRobSB1bml0cyBmb3IgZm9udCBzaXplLiBHZW5lcmF0ZSBsaW5lIGhlaWdodCBmcm9tIGZvbnQgc2l6ZSBvciBpbnB1dCBsaW5lcy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpWZXJ0aWNhbFJoeXRobVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gZm9udFNpemUgLSBmb250IHNpemUgaW4gcGl4ZWxzLCBlbSwgcmVtIGxpa2UgMS41ZW0uXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBpbnB1dCBsaW5lcywgYmVmb3JlIG91dHB1dCAxIGxpbmUgaGVpZ2h0IHdpbGwgYmUgbXVsdGlwbHkgd2l0aCB2YWx1ZS5cclxuICAgICAqIEBwYXJhbSBiYXNlRm9udFNpemUgLSBiYXNlIGZvbnQgc2l6ZSBmb3IgY2FsY3VsYXRpb24gcmVsYXRpdmUgc2l6ZXMgZm9yIHB4IG9yIGVtLlxyXG4gICAgICogQHBhcmFtIHB4RmFsbGJhY2sgLSBib29sZWFuIHBpeGVsIGZhbGxiYWNrIG9wdGlvbi4gSWdub3JlIHNldHRpbmdzLnB4RmFsbGJhY2sgb3B0aW9uLlxyXG4gICAgICogQ29udmVydCByZWxhdGl2ZSBzaXplcyB0byBwaXhlbHMuIElmIHJoeXRobSB1bml0IHJlbSB0aGVuIHJlbSB2YWx1ZSBkb3VibGVkIHdpdGggcGl4ZWxzIHZhbHVlcy5cclxuICAgICAqIElmIHJoeXRobSB1bml0IHB4IGFuZCBvcHRpb24gd2lsbCBiZSBzZXQgdGhlbiBpbiBsaW5lIGhlaWdodCB3aWxsIGJlIHBpeGVscyBsaWtlIDI0cHgsXHJcbiAgICAgKiBlbHNlIHJlbGF0aXZlIHNpemUgbGlrZSAxLjQ1KHdpdGhvdXQgZW0gb3IgcmVtKS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAtIGxpbmUgaGVpZ2h0IGluIHJoeXRobSB1bml0LlxyXG4gICAgICovXHJcbiAgICBsaW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSwgYmFzZUZvbnRTaXplLCBweEZhbGxiYWNrID0gZmFsc2UpIHtcclxuXHJcbiAgICAgICAgaWYgKCFmb250U2l6ZSkge1xyXG4gICAgICAgICAgICBmb250U2l6ZSA9IHRoaXMuc2V0dGluZ3MuZm9udFNpemUgKyBcInB4XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZm9udFNpemUgJiYgKHRoaXMuc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5FTSB8fCAhdmFsdWUpKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZm9udFNpemVVbml0ID0gZ2V0VW5pdChmb250U2l6ZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy51bml0ICE9PSBVTklULlZXICYmIChmb250U2l6ZVVuaXQgIT09IHRoaXMuc2V0dGluZ3MudW5pdCB8fCBiYXNlRm9udFNpemUpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9udFNpemUgPSBiYXNlRm9udFNpemVcclxuICAgICAgICAgICAgICAgICAgICA/IHRoaXMuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCB0aGlzLnNldHRpbmdzLnVuaXQsIGJhc2VGb250U2l6ZSlcclxuICAgICAgICAgICAgICAgICAgICA6IHRoaXMuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCB0aGlzLnNldHRpbmdzLnVuaXQpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvbnRTaXplID0gcGFyc2VGbG9hdChmb250U2l6ZSk7XHJcblxyXG4gICAgICAgIHZhbHVlID0gKHZhbHVlKSA/IHBhcnNlRmxvYXQodmFsdWUpIDogdGhpcy5saW5lcyhmb250U2l6ZSk7XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQgPSAwO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy51bml0ID09PSBVTklULlBYKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IChmb250U2l6ZSAmJiAhdGhpcy5zZXR0aW5ncy5weEZhbGxiYWNrICYmICFweEZhbGxiYWNrKVxyXG4gICAgICAgICAgICAgICAgPyBmb3JtYXRWYWx1ZSh0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRQeCAqIHZhbHVlIC8gZm9udFNpemUpXHJcbiAgICAgICAgICAgICAgICA6IGZvcm1hdEludCh0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRQeCAqIHZhbHVlKSArIFwicHhcIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNldHRpbmdzLnVuaXQgPT09IFVOSVQuRU0pIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdFZhbHVlKHZhbHVlICogdGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UmVsIC8gZm9udFNpemUpICsgXCJlbVwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5SRU0pIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdFZhbHVlKHZhbHVlICogdGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UmVsKSArIFwicmVtXCI7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZih0aGlzLnNldHRpbmdzLnVuaXQgPT09IFVOSVQuVlcpe1xyXG4gICAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIGxlYWRpbmcgdmFsdWUgaW4gcmh5dGhtIHVuaXRcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlZlcnRpY2FsUmh5dGhtXHJcbiAgICAgKiBcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogMSBsZWFkaW5nKGluIHBpeGVscykgPSBiYXNlIGxpbmUgaGVpZ2h0KGluIHBpeGVscykgLSBiYXNlIGZvbnQgc2l6ZShpbiBwaXhlbHMpLlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBpbnB1dCBsaW5lcywgYmVmb3JlIG91dHB1dCAxIGxpbmUgaGVpZ2h0IHdpbGwgYmUgbXVsdGlwbHkgd2l0aCB2YWx1ZS5cclxuICAgICAqIEBwYXJhbSBmb250U2l6ZSAtIGZvbnQgc2l6ZSBpbiBwaXhlbHMsIGVtLCByZW0gbGlrZSAxLjVlbS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAtIGxlYWRpbmcgaW4gcmh5dGhtIHVuaXQuXHJcbiAgICAgKi9cclxuICAgIGxlYWRpbmcodmFsdWUsIGZvbnRTaXplKSB7XHJcblxyXG4gICAgICAgIGlmICghZm9udFNpemUpIHtcclxuICAgICAgICAgICAgZm9udFNpemUgPSB0aGlzLnNldHRpbmdzLmZvbnRTaXplICsgXCJweFwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGZvbnRTaXplVW5pdCA9IGdldFVuaXQoZm9udFNpemUpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy51bml0ICE9PSBVTklULlZXICYmIGZvbnRTaXplVW5pdCAhPT0gdGhpcy5zZXR0aW5ncy51bml0KSB7XHJcblxyXG4gICAgICAgICAgICBmb250U2l6ZSA9IHRoaXMuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCB0aGlzLnNldHRpbmdzLnVuaXQpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvbnRTaXplID0gcGFyc2VGbG9hdChmb250U2l6ZSk7XHJcblxyXG4gICAgICAgIGxldCBsaW5lcyA9IHRoaXMubGluZXMoZm9udFNpemUpLFxyXG4gICAgICAgICAgICByZXN1bHQgPSAwO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy51bml0ID09PSBVTklULlBYKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRJbnQoKGxpbmVzICogdGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UHggLSBmb250U2l6ZSkgKiB2YWx1ZSkgKyBcInB4XCI7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zZXR0aW5ncy51bml0ID09PSBVTklULkVNKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRWYWx1ZSgodGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UmVsICogbGluZXMgLSBmb250U2l6ZSkgKiB2YWx1ZSAvIGZvbnRTaXplKSArIFwiZW1cIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNldHRpbmdzLnVuaXQgPT09IFVOSVQuUkVNKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRWYWx1ZSgobGluZXMgKiB0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRSZWwgLSBmb250U2l6ZSkgKiB2YWx1ZSkgKyBcInJlbVwiO1xyXG5cclxuICAgICAgICB9ICBlbHNlIGlmKHRoaXMuc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5WVyl7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGxpbmVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgcmh5dGhtIHZhbHVlIGluIHJoeXRobSB1bml0LiBJdCB1c2VkIGZvciBoZWlnaHQgdmFsdWVzLCBldGMuIFxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6VmVydGljYWxSaHl0aG1cclxuICAgICAqIFxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBcclxuICAgICAqIElmIHZhbHVlIDQ1MHB4LCBhbmQgYmFzZSBmb250IHNpemUgMTYsIGxpbmUtaGVpZ2h0IDEuNSwgaW5jcmVhc2UgPSBmYWxzZSB0aGVuIHJldHVybiA0MzJweC5cclxuICAgICAqIElmIHZhbHVlIDQ1MHB4LCBhbmQgYmFzZSBmb250IHNpemUgMTYsIGxpbmUtaGVpZ2h0IDEuNSwgaW5jcmVhc2UgPSB0cnVlIHRoZW4gcmV0dXJuIDQ1NnB4LlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBpbnB1dCB2YWx1ZSBsaWtlIDQ1MHB4OyAxMGVtOyAxMDByZW07LlxyXG4gICAgICogQHBhcmFtIGZvbnRTaXplIC0gZm9udCBzaXplIGluIHBpeGVscywgZW0sIHJlbSBsaWtlIDEuNWVtLlxyXG4gICAgICogQHBhcmFtIGluY3JlYXNlIC0gaW5jcmVhc2Ugb3IgZGVjcmVhc2Ugc2l6ZS4gRGVmYXVsdCBkZWNyZWFzZS4gaW5jcmVhc2UgPSBmYWxzZS5cclxuICAgICAqIEBwYXJhbSBvdXRwdXRVbml0IC0gb3V0cHV0IHZhbHVlIHVuaXQuIFxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gcmh5dGhtZCB2YWx1ZSByaHl0aG0gdW5pdC5cclxuICAgICAqL1xyXG5cclxuICAgIHJoeXRobSh2YWx1ZSwgZm9udFNpemUsIGluY3JlYXNlID0gZmFsc2UsIG91dHB1dFVuaXQpIHtcclxuXHJcbiAgICAgICAgaWYgKCFmb250U2l6ZSkge1xyXG4gICAgICAgICAgICBmb250U2l6ZSA9IHRoaXMuc2V0dGluZ3MuZm9udFNpemUgKyBcInB4XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIW91dHB1dFVuaXQpIHtcclxuICAgICAgICAgICAgb3V0cHV0VW5pdCA9IHRoaXMuc2V0dGluZ3MudW5pdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBmb250U2l6ZVVuaXQgPSBnZXRVbml0KGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MudW5pdCAhPT0gVU5JVC5WVyAmJiBmb250U2l6ZVVuaXQgIT09IHRoaXMuc2V0dGluZ3MudW5pdCkge1xyXG5cclxuICAgICAgICAgICAgZm9udFNpemUgPSB0aGlzLmNvbnZlcnQoZm9udFNpemUsIGZvbnRTaXplVW5pdCwgdGhpcy5zZXR0aW5ncy51bml0KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb250U2l6ZSA9IHBhcnNlRmxvYXQoZm9udFNpemUpO1xyXG4gICAgICAgIGxldCB2YWx1ZVVuaXQgPSBnZXRVbml0KHZhbHVlKTtcclxuXHJcbiAgICAgICAgaWYgKHZhbHVlVW5pdCAhPT0gdGhpcy5zZXR0aW5ncy51bml0KSB7XHJcblxyXG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMuY29udmVydCh2YWx1ZSwgdmFsdWVVbml0LCB0aGlzLnNldHRpbmdzLnVuaXQpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBsaW5lcyA9IHRoaXMubGluZXModmFsdWUpLFxyXG4gICAgICAgICAgICByZXN1bHQgPSAwO1xyXG5cclxuICAgICAgICBpZiAoIWluY3JlYXNlICYmICh2YWx1ZSA8IChsaW5lcyAqIGZvbnRTaXplICogdGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UmVsKSkpIHtcclxuICAgICAgICAgICAgbGluZXMgPSBsaW5lcyAtIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3V0cHV0VW5pdCA9PT0gVU5JVC5QWCkge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gZm9ybWF0SW50KGxpbmVzICogdGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0KSArIFwicHhcIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChvdXRwdXRVbml0ID09PSBVTklULkVNKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRWYWx1ZSh0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRSZWwgKiBsaW5lcyAvIGZvbnRTaXplKSArIFwiZW1cIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChvdXRwdXRVbml0ID09PSBVTklULlJFTSkge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gZm9ybWF0VmFsdWUodGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UmVsICogbGluZXMpICsgXCJyZW1cIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmKG91dHB1dFVuaXQgPT09IFVOSVQuVlcpe1xyXG4gICAgICAgICAgICByZXN1bHQgPSBsaW5lcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCByZW0gdG8gcGl4ZWwgdmFsdWUuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIGlucHV0IHZhbHVlIGluIHJlbS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAtIG91dHB1dCB2YWx1ZSBpbiBwaXhlbHMuXHJcbiAgICAgKi9cclxuICAgIHJlbUZhbGxiYWNrKHZhbHVlKSB7XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQgPSB2YWx1ZTtcclxuICAgICAgICBsZXQgZm91bmQ7XHJcbiAgICAgICAgd2hpbGUgKChmb3VuZCA9IHJlc3VsdC5tYXRjaChyZW1SZWdleHApKSkge1xyXG4gICAgICAgICAgICBsZXQgcHhWYWx1ZSA9IHRoaXMuY29udmVydChmb3VuZFsxXSwgVU5JVC5SRU0sIFVOSVQuUFgpO1xyXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShmb3VuZFswXSwgZm9ybWF0SW50KHB4VmFsdWUpICsgXCJweFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgYmFzZSh2YWx1ZSwgZm9udFNpemUpe1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuXHJcbiAgICAgICAgaWYgKCFmb250U2l6ZSkge1xyXG4gICAgICAgICAgICBmb250U2l6ZSA9IHRoaXMuc2V0dGluZ3MuZm9udFNpemUgKyBcInB4XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZm9udFNpemVVbml0ID0gZ2V0VW5pdChmb250U2l6ZSk7XHJcblxyXG4gICAgICAgIGlmIChmb250U2l6ZVVuaXQgIT09IHRoaXMuc2V0dGluZ3MudW5pdCkge1xyXG5cclxuICAgICAgICAgICAgZm9udFNpemUgPSB0aGlzLmNvbnZlcnQoZm9udFNpemUsIGZvbnRTaXplVW5pdCwgdGhpcy5zZXR0aW5ncy51bml0KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb250U2l6ZSA9IHBhcnNlRmxvYXQoZm9udFNpemUpO1xyXG5cclxuICAgICAgICBpZih0aGlzLnNldHRpbmdzLnVuaXQgPT09IFVOSVQuUFgpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gZm9ybWF0SW50KGZvbnRTaXplICogcmVzdWx0KSArIFwicHhcIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRWYWx1ZShmb250U2l6ZSAqIHJlc3VsdCkgKyB1bml0TmFtZVt0aGlzLnNldHRpbmdzLnVuaXRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogRXhwb3J0IFZlcnRpY2FsIFJoeXRobSBDbGFzcy5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IFZlcnRpY2FsUmh5dGhtOyJdfQ==
