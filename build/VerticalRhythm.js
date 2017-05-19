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

                        result = this.settings.useGlobal ? (0, _Helpers.formatValue)(value * this.settings.globalRatio * this.settings.lineHeightRel / fontSize) + "em" : (0, _Helpers.formatValue)(value * this.settings.lineHeightRel / fontSize) + "em";
                } else if (this.settings.unit === _Helpers.UNIT.REM) {

                        result = this.settings.useGlobal ? (0, _Helpers.formatValue)(value * this.settings.globalRatio * this.settings.lineHeightRel) + "rem" : (0, _Helpers.formatValue)(value * this.settings.lineHeightRel) + "rem";
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

                        result = this.settings.useGlobal ? (0, _Helpers.formatValue)((this.settings.lineHeightRel * this.settings.globalRatio * lines - fontSize) * value / fontSize) + "em" : (0, _Helpers.formatValue)((this.settings.lineHeightRel * lines - fontSize) * value / fontSize) + "em";
                } else if (this.settings.unit === _Helpers.UNIT.REM) {

                        result = this.settings.useGlobal ? (0, _Helpers.formatValue)((this.settings.lineHeightRel * this.settings.globalRatio * lines - fontSize) * value) + "rem" : (0, _Helpers.formatValue)((this.settings.lineHeightRel * lines - fontSize) * value) + "rem";
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

                        result = this.settings.useGlobal ? (0, _Helpers.formatValue)(this.settings.lineHeightRel * this.settings.globalRatio * lines / fontSize) + "em" : (0, _Helpers.formatValue)(this.settings.lineHeightRel * lines / fontSize) + "em";
                } else if (outputUnit === _Helpers.UNIT.REM) {

                        result = this.settings.useGlobal ? (0, _Helpers.formatValue)(this.settings.lineHeightRel * this.settings.globalRatio * lines) + "rem" : (0, _Helpers.formatValue)(this.settings.lineHeightRel * lines) + "rem";
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
                        if (this.settings.useGlobal) {
                                pxValue = pxValue / this.settings.globalRatio;
                        }
                        result = result.replace(found[0], (0, _Helpers.formatInt)(pxValue) + "px");
                }

                return result;
        };

        /**
         * Return fraction of the base font size.
         *
         * @param value
         * @param fontSize
         * @returns {Number}
         */


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
                        if (this.settings.useGlobal && this.settings.unit !== _Helpers.UNIT.VW) {
                                fontSize = fontSize * this.settings.globalRatio;
                        }
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlZlcnRpY2FsUmh5dGhtLmVzNiJdLCJuYW1lcyI6WyJWZXJ0aWNhbFJoeXRobSIsInNldHRpbmdzIiwiY29udmVydCIsInZhbHVlIiwidmFsdWVVbml0IiwiZm9ybWF0IiwiZnJvbUNvbnRleHQiLCJ0b0NvbnRleHQiLCJwYXJzZUZsb2F0IiwidW5pdCIsImZvbnRTaXplIiwicHhWYWx1ZSIsIkVNIiwiUkVNIiwiUEVSQ0VOVCIsIkVYIiwiUFgiLCJweEZhbGxiYWNrIiwiTWF0aCIsInJvdW5kIiwicmVzdWx0IiwibGluZXMiLCJyb3VuZFRvSGFsZkxpbmUiLCJjZWlsIiwibGluZUhlaWdodFB4IiwiVlciLCJsaW5lSGVpZ2h0UmVsIiwibWluTGluZVBhZGRpbmciLCJsaW5lSGVpZ2h0IiwiYmFzZUZvbnRTaXplIiwiZm9udFNpemVVbml0IiwidXNlR2xvYmFsIiwiZ2xvYmFsUmF0aW8iLCJsZWFkaW5nIiwicmh5dGhtIiwiaW5jcmVhc2UiLCJvdXRwdXRVbml0IiwicmVtRmFsbGJhY2siLCJmb3VuZCIsIm1hdGNoIiwicmVwbGFjZSIsImJhc2UiXSwibWFwcGluZ3MiOiI7Ozs7QUFXQTs7MEpBWEE7Ozs7Ozs7Ozs7O0lBb0JNQSxjOztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7OztBQWlCQSxnQ0FBWUMsUUFBWixFQUFzQjtBQUFBOztBQUNsQixxQkFBS0EsUUFBTCxHQUFnQkEsUUFBaEI7QUFDSDs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7O2lDQWFBQyxPLG9CQUFRQyxLLEVBQU9DLFMsRUFBV0MsTSxFQUFRQyxXLEVBQWFDLFMsRUFBVzs7QUFFdERKLHdCQUFRSyxXQUFXTCxLQUFYLENBQVI7O0FBRUEsb0JBQUksQ0FBQ0UsTUFBTCxFQUFhO0FBQ1RBLGlDQUFTLEtBQUtKLFFBQUwsQ0FBY1EsSUFBdkI7QUFDSDs7QUFFRCxvQkFBSUwsY0FBY0MsTUFBbEIsRUFBMEI7QUFDdEIsK0JBQU9GLEtBQVA7QUFDSDs7QUFFRCxvQkFBSSxDQUFDRyxXQUFMLEVBQWtCO0FBQ2RB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QixRQUFMLENBQWNRLElBQW5ELENBQVg7QUFFSDs7QUFFREMsMkJBQVdGLFdBQVdFLFFBQVgsQ0FBWDs7QUFFQSxvQkFBRyxLQUFLVCxRQUFMLENBQWNRLElBQWQsS0FBdUIsY0FBS08sRUFBL0IsRUFBbUM7QUFDL0JJLGlDQUFTLHdCQUFVVixXQUFXVSxNQUFyQixJQUErQixJQUF4QztBQUNILGlCQUZELE1BRU87QUFDSCw0QkFBRyxLQUFLbkIsUUFBTCxDQUFjOEIsU0FBZCxJQUEyQixLQUFLOUIsUUFBTCxDQUFjUSxJQUFkLEtBQXVCLGNBQUtnQixFQUExRCxFQUE4RDtBQUMxRGYsMkNBQVdBLFdBQVcsS0FBS1QsUUFBTCxDQUFjK0IsV0FBcEM7QUFDSDtBQUNEWixpQ0FBUywwQkFBWVYsV0FBV1UsTUFBdkIsSUFBaUMsa0JBQVMsS0FBS25CLFFBQUwsQ0FBY1EsSUFBdkIsQ0FBMUM7QUFDSDtBQUNELHVCQUFPVyxNQUFQO0FBQ0gsUzs7Ozs7QUFHTDs7Ozs7a0JBR2VwQixjIiwiZmlsZSI6IlZlcnRpY2FsUmh5dGhtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBtb2R1bGUgVmVydGljYWxSaHl0aG1cclxuICpcclxuICogQGRlc2NyaXB0aW9uIFZlcnRpY2FsUmh5dGhtIENsYXNzIGZvciBjYWxjdWxhdGUgcmh5dGhtIHNpemVzIGFucyBjb252ZXJ0IHVuaXRzLlxyXG4gKlxyXG4gKiBAdmVyc2lvbiAxLjBcclxuICogQGF1dGhvciBHcmlnb3J5IFZhc2lseWV2IDxwb3N0Y3NzLmhhbXN0ZXJAZ21haWwuY29tPiBodHRwczovL2dpdGh1Yi5jb20vaDB0YzBkM1xyXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNywgR3JpZ29yeSBWYXNpbHlldlxyXG4gKiBAbGljZW5zZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAsIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKi9cclxuXHJcbmltcG9ydCB7XHJcbiAgICBmb3JtYXRJbnQsXHJcbiAgICBmb3JtYXRWYWx1ZSxcclxuICAgIHJlbVJlZ2V4cCxcclxuICAgIGdldFVuaXQsXHJcbiAgICBVTklULFxyXG4gICAgdW5pdE5hbWVcclxufSBmcm9tIFwiLi9IZWxwZXJzXCI7XHJcblxyXG5jbGFzcyBWZXJ0aWNhbFJoeXRobSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgY2xhc3MgVmVydGljYWxSaHl0aG0uXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6VmVydGljYWxSaHl0aG1cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHNldHRpbmdzIC0gc2V0dGluZ3MgaGFzaC5cclxuICAgICAqIFxyXG4gICAgICogPHA+XHJcbiAgICAgKiBVc2U6XHJcbiAgICAgKiBzZXR0aW5ncy5mb250U2l6ZSAtIGJhc2UgZm9udCBzaXplIGluIHBpeGVscy5cclxuICAgICAqIHNldHRpbmdzLnB4RmFsbGJhY2sgLSBib29sZWFuIHBpeGVsIGZhbGxiYWNrLiBDb252ZXJ0IHJlbGF0aXZlIHNpemVzIHRvIHBpeGVscy5cclxuICAgICAqIElmIHJoeXRobSB1bml0IHJlbSB0aGVuIHJlbSB2YWx1ZSBkb3VibGVkIHdpdGggcGl4ZWxzIHZhbHVlcy5cclxuICAgICAqIElmIHJoeXRobSB1bml0IHB4IGFuZCBvcHRpb24gd2lsbCBiZSBzZXQgdGhlbiBpbiBsaW5lIGhlaWdodCB3aWxsIGJlIHBpeGVscyBsaWtlIDI0cHgsXHJcbiAgICAgKiBlbHNlIHJlbGF0aXZlIHNpemUgbGlrZSAxLjQ1KHdpdGhvdXQgZW0gb3IgcmVtKVxyXG4gICAgICogc2V0dGluZ3MubGluZUhlaWdodCAtIGJhc2UgbGluZSBoZWlnaHQgaW4gcGl4ZWxzIG9yIHJlbGF0aXZlIHZhbHVlKHdpdGhvdXQgZW0gb3IgcmVtKS5cclxuICAgICAqIDwvcD5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Ioc2V0dGluZ3MpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IHZhbHVlcyBmcm9tIHVuaXQgdG8gdW5pdC5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpWZXJ0aWNhbFJoeXRobVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBpbnB1dCB2YWx1ZVxyXG4gICAgICogQHBhcmFtIHZhbHVlVW5pdCAtIGlucHV0IHZhbHVlIHVuaXRcclxuICAgICAqIEBwYXJhbSBmb3JtYXQgLSBvdXRwdXQgdmFsdWUgdW5pdFxyXG4gICAgICogQHBhcmFtIGZyb21Db250ZXh0IC0gZnJvbSBiYXNlIGZvbnQgc2l6ZVxyXG4gICAgICogQHBhcmFtIHRvQ29udGV4dCAtIHRvIG5ldyBiYXNlIGZvbnQgc2l6ZVxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gb3V0cHV0IHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBjb252ZXJ0KHZhbHVlLCB2YWx1ZVVuaXQsIGZvcm1hdCwgZnJvbUNvbnRleHQsIHRvQ29udGV4dCkge1xyXG5cclxuICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG5cclxuICAgICAgICBpZiAoIWZvcm1hdCkge1xyXG4gICAgICAgICAgICBmb3JtYXQgPSB0aGlzLnNldHRpbmdzLnVuaXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodmFsdWVVbml0ID09PSBmb3JtYXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFmcm9tQ29udGV4dCkge1xyXG4gICAgICAgICAgICBmcm9tQ29udGV4dCA9IHRoaXMuc2V0dGluZ3MuZm9udFNpemU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZnJvbUNvbnRleHQgPSBwYXJzZUZsb2F0KGZyb21Db250ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdG9Db250ZXh0KSB7XHJcbiAgICAgICAgICAgIHRvQ29udGV4dCA9IGZyb21Db250ZXh0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRvQ29udGV4dCA9IHBhcnNlRmxvYXQodG9Db250ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBweFZhbHVlID0gMDtcclxuXHJcbiAgICAgICAgaWYgKHZhbHVlVW5pdCA9PT0gVU5JVC5FTSkge1xyXG4gICAgICAgICAgICBweFZhbHVlID0gdmFsdWUgKiBmcm9tQ29udGV4dDtcclxuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVW5pdCA9PT0gVU5JVC5SRU0pIHtcclxuICAgICAgICAgICAgcHhWYWx1ZSA9IHZhbHVlICogdGhpcy5zZXR0aW5ncy5mb250U2l6ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVW5pdCA9PT0gVU5JVC5QRVJDRU5UKSB7XHJcbiAgICAgICAgICAgIHB4VmFsdWUgPSB2YWx1ZSAqIGZyb21Db250ZXh0IC8gMTAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWVVbml0ID09PSBVTklULkVYKSB7XHJcbiAgICAgICAgICAgIHB4VmFsdWUgPSB2YWx1ZSAqIGZyb21Db250ZXh0IC8gMjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBweFZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLnNldHRpbmdzLnVuaXQgPT09IFVOSVQuUFggJiYgdGhpcy5zZXR0aW5ncy5weEZhbGxiYWNrKXtcclxuICAgICAgICAgICAgcHhWYWx1ZSA9IE1hdGgucm91bmQocHhWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcmVzdWx0ID0gcHhWYWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gVU5JVC5FTSkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBweFZhbHVlIC8gdG9Db250ZXh0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZm9ybWF0ID09PSBVTklULlJFTSkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBweFZhbHVlIC8gdGhpcy5zZXR0aW5ncy5mb250U2l6ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PT0gVU5JVC5QRVJDRU5UKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHB4VmFsdWUgKiAxMDAgLyB0b0NvbnRleHQ7XHJcbiAgICAgICAgfSBlbHNlIGlmIChmb3JtYXQgPT09IFVOSVQuRVgpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcHhWYWx1ZSAqIDIgLyB0b0NvbnRleHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIHRoZSBtaW5pbXVtIG11bHRpcGxlIHJoeXRobSB1bml0cyhsaW5lcykgbmVlZGVkIHRvIGNvbnRhaW4gdGhlIGZvbnQtc2l6ZS5cclxuICAgICAqIDEgcmh5dGhtIHVuaXQgPSBiYXNlIGxpbmUgaGVpZ2h0IGluIHBpeGVscy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpWZXJ0aWNhbFJoeXRobVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gZm9udFNpemUgLSBmb250IHNpemUgaW4gcGl4ZWxzLCBlbSwgcmVtIGxpa2UgMS41ZW0uXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB1bml0IC0gaW5wdXQgdmFsdWUgdW5pdC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gbnVtYmVyIG9mIGxpbmVzLlxyXG4gICAgICovXHJcbiAgICBsaW5lcyhmb250U2l6ZSwgdW5pdCA9IHRoaXMuc2V0dGluZ3MudW5pdCkge1xyXG5cclxuICAgICAgICBsZXQgbGluZXMgPSAwO1xyXG5cclxuICAgICAgICBpZiAodW5pdCA9PT0gVU5JVC5QWCkge1xyXG5cclxuICAgICAgICAgICAgbGluZXMgPSAodGhpcy5zZXR0aW5ncy5yb3VuZFRvSGFsZkxpbmUpXHJcbiAgICAgICAgICAgICAgICA/IE1hdGguY2VpbCgyICogZm9udFNpemUgLyB0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRQeCkgLyAyXHJcbiAgICAgICAgICAgICAgICA6IE1hdGguY2VpbChmb250U2l6ZSAvIHRoaXMuc2V0dGluZ3MubGluZUhlaWdodFB4KTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICh1bml0ID09PSBVTklULkVNIHx8IHVuaXQgPT09IFVOSVQuUkVNIHx8IHVuaXQgPT09IFVOSVQuVlcpIHtcclxuXHJcbiAgICAgICAgICAgIGxpbmVzID0gKHRoaXMuc2V0dGluZ3Mucm91bmRUb0hhbGZMaW5lKVxyXG4gICAgICAgICAgICAgICAgPyBNYXRoLmNlaWwoMiAqIGZvbnRTaXplIC8gdGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UmVsKSAvIDJcclxuICAgICAgICAgICAgICAgIDogTWF0aC5jZWlsKGZvbnRTaXplIC8gdGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UmVsKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL0lmIGxpbmVzIGFyZSBjcmFtcGVkIGluY2x1ZGUgc29tZSBleHRyYSBsZWFkLlxyXG4gICAgICAgIGlmICgobGluZXMgKiB0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRQeCAtIGZvbnRTaXplKSA8ICh0aGlzLnNldHRpbmdzLm1pbkxpbmVQYWRkaW5nICogMikpIHtcclxuICAgICAgICAgICAgbGluZXMgPSAodGhpcy5zZXR0aW5ncy5yb3VuZFRvSGFsZkxpbmUpID8gbGluZXMgKyAwLjUgOiBsaW5lcyArIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbGluZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgbGluZSBoZWlnaHQgdmFsdWUgaW4gcmh5dGhtIHVuaXRzIGZvciBmb250IHNpemUuIEdlbmVyYXRlIGxpbmUgaGVpZ2h0IGZyb20gZm9udCBzaXplIG9yIGlucHV0IGxpbmVzLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlZlcnRpY2FsUmh5dGhtXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBmb250U2l6ZSAtIGZvbnQgc2l6ZSBpbiBwaXhlbHMsIGVtLCByZW0gbGlrZSAxLjVlbS5cclxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIGlucHV0IGxpbmVzLCBiZWZvcmUgb3V0cHV0IDEgbGluZSBoZWlnaHQgd2lsbCBiZSBtdWx0aXBseSB3aXRoIHZhbHVlLlxyXG4gICAgICogQHBhcmFtIGJhc2VGb250U2l6ZSAtIGJhc2UgZm9udCBzaXplIGZvciBjYWxjdWxhdGlvbiByZWxhdGl2ZSBzaXplcyBmb3IgcHggb3IgZW0uXHJcbiAgICAgKiBAcGFyYW0gcHhGYWxsYmFjayAtIGJvb2xlYW4gcGl4ZWwgZmFsbGJhY2sgb3B0aW9uLiBJZ25vcmUgc2V0dGluZ3MucHhGYWxsYmFjayBvcHRpb24uXHJcbiAgICAgKiBDb252ZXJ0IHJlbGF0aXZlIHNpemVzIHRvIHBpeGVscy4gSWYgcmh5dGhtIHVuaXQgcmVtIHRoZW4gcmVtIHZhbHVlIGRvdWJsZWQgd2l0aCBwaXhlbHMgdmFsdWVzLlxyXG4gICAgICogSWYgcmh5dGhtIHVuaXQgcHggYW5kIG9wdGlvbiB3aWxsIGJlIHNldCB0aGVuIGluIGxpbmUgaGVpZ2h0IHdpbGwgYmUgcGl4ZWxzIGxpa2UgMjRweCxcclxuICAgICAqIGVsc2UgcmVsYXRpdmUgc2l6ZSBsaWtlIDEuNDUod2l0aG91dCBlbSBvciByZW0pLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gbGluZSBoZWlnaHQgaW4gcmh5dGhtIHVuaXQuXHJcbiAgICAgKi9cclxuICAgIGxpbmVIZWlnaHQoZm9udFNpemUsIHZhbHVlLCBiYXNlRm9udFNpemUsIHB4RmFsbGJhY2sgPSBmYWxzZSkge1xyXG5cclxuICAgICAgICBpZiAoIWZvbnRTaXplKSB7XHJcbiAgICAgICAgICAgIGZvbnRTaXplID0gdGhpcy5zZXR0aW5ncy5mb250U2l6ZSArIFwicHhcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChmb250U2l6ZSAmJiAodGhpcy5zZXR0aW5ncy51bml0ID09PSBVTklULkVNIHx8ICF2YWx1ZSkpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBmb250U2l6ZVVuaXQgPSBnZXRVbml0KGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnVuaXQgIT09IFVOSVQuVlcgJiYgKGZvbnRTaXplVW5pdCAhPT0gdGhpcy5zZXR0aW5ncy51bml0IHx8IGJhc2VGb250U2l6ZSkpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZSA9IGJhc2VGb250U2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgID8gdGhpcy5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIHRoaXMuc2V0dGluZ3MudW5pdCwgYmFzZUZvbnRTaXplKVxyXG4gICAgICAgICAgICAgICAgICAgIDogdGhpcy5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIHRoaXMuc2V0dGluZ3MudW5pdCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9udFNpemUgPSBwYXJzZUZsb2F0KGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgdmFsdWUgPSAodmFsdWUpID8gcGFyc2VGbG9hdCh2YWx1ZSkgOiB0aGlzLmxpbmVzKGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IDA7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnVuaXQgPT09IFVOSVQuUFgpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gKGZvbnRTaXplICYmICF0aGlzLnNldHRpbmdzLnB4RmFsbGJhY2sgJiYgIXB4RmFsbGJhY2spXHJcbiAgICAgICAgICAgICAgICA/IGZvcm1hdFZhbHVlKHRoaXMuc2V0dGluZ3MubGluZUhlaWdodFB4ICogdmFsdWUgLyBmb250U2l6ZSlcclxuICAgICAgICAgICAgICAgIDogZm9ybWF0SW50KHRoaXMuc2V0dGluZ3MubGluZUhlaWdodFB4ICogdmFsdWUpICsgXCJweFwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5FTSkge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gKHRoaXMuc2V0dGluZ3MudXNlR2xvYmFsKVxyXG4gICAgICAgICAgICAgICAgPyBmb3JtYXRWYWx1ZSh2YWx1ZSAqIHRoaXMuc2V0dGluZ3MuZ2xvYmFsUmF0aW8gKiB0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRSZWwgLyBmb250U2l6ZSkgKyBcImVtXCJcclxuICAgICAgICAgICAgICAgIDogZm9ybWF0VmFsdWUodmFsdWUgKiB0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRSZWwgLyBmb250U2l6ZSkgKyBcImVtXCI7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zZXR0aW5ncy51bml0ID09PSBVTklULlJFTSkge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gKHRoaXMuc2V0dGluZ3MudXNlR2xvYmFsKVxyXG4gICAgICAgICAgICAgICAgPyBmb3JtYXRWYWx1ZSh2YWx1ZSAqIHRoaXMuc2V0dGluZ3MuZ2xvYmFsUmF0aW8gKiB0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRSZWwpICsgXCJyZW1cIlxyXG4gICAgICAgICAgICAgICAgOiBmb3JtYXRWYWx1ZSh2YWx1ZSAqIHRoaXMuc2V0dGluZ3MubGluZUhlaWdodFJlbCkgKyBcInJlbVwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYodGhpcy5zZXR0aW5ncy51bml0ID09PSBVTklULlZXKXtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSBsZWFkaW5nIHZhbHVlIGluIHJoeXRobSB1bml0XHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpWZXJ0aWNhbFJoeXRobVxyXG4gICAgICogXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIDEgbGVhZGluZyhpbiBwaXhlbHMpID0gYmFzZSBsaW5lIGhlaWdodChpbiBwaXhlbHMpIC0gYmFzZSBmb250IHNpemUoaW4gcGl4ZWxzKS5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHZhbHVlIC0gaW5wdXQgbGluZXMsIGJlZm9yZSBvdXRwdXQgMSBsaW5lIGhlaWdodCB3aWxsIGJlIG11bHRpcGx5IHdpdGggdmFsdWUuXHJcbiAgICAgKiBAcGFyYW0gZm9udFNpemUgLSBmb250IHNpemUgaW4gcGl4ZWxzLCBlbSwgcmVtIGxpa2UgMS41ZW0uXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gLSBsZWFkaW5nIGluIHJoeXRobSB1bml0LlxyXG4gICAgICovXHJcbiAgICBsZWFkaW5nKHZhbHVlLCBmb250U2l6ZSkge1xyXG5cclxuICAgICAgICBpZiAoIWZvbnRTaXplKSB7XHJcbiAgICAgICAgICAgIGZvbnRTaXplID0gdGhpcy5zZXR0aW5ncy5mb250U2l6ZSArIFwicHhcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBmb250U2l6ZVVuaXQgPSBnZXRVbml0KGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MudW5pdCAhPT0gVU5JVC5WVyAmJiBmb250U2l6ZVVuaXQgIT09IHRoaXMuc2V0dGluZ3MudW5pdCkge1xyXG5cclxuICAgICAgICAgICAgZm9udFNpemUgPSB0aGlzLmNvbnZlcnQoZm9udFNpemUsIGZvbnRTaXplVW5pdCwgdGhpcy5zZXR0aW5ncy51bml0KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb250U2l6ZSA9IHBhcnNlRmxvYXQoZm9udFNpemUpO1xyXG5cclxuICAgICAgICBsZXQgbGluZXMgPSB0aGlzLmxpbmVzKGZvbnRTaXplKSxcclxuICAgICAgICAgICAgcmVzdWx0ID0gMDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5QWCkge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gZm9ybWF0SW50KChsaW5lcyAqIHRoaXMuc2V0dGluZ3MubGluZUhlaWdodFB4IC0gZm9udFNpemUpICogdmFsdWUpICsgXCJweFwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5FTSkge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gKHRoaXMuc2V0dGluZ3MudXNlR2xvYmFsKVxyXG4gICAgICAgICAgICAgICAgPyBmb3JtYXRWYWx1ZShcclxuICAgICAgICAgICAgICAgICAgICAodGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UmVsICogdGhpcy5zZXR0aW5ncy5nbG9iYWxSYXRpbyAqIGxpbmVzIC0gZm9udFNpemUpICogdmFsdWUgLyBmb250U2l6ZVxyXG4gICAgICAgICAgICAgICAgKSArIFwiZW1cIlxyXG4gICAgICAgICAgICAgICAgOiBmb3JtYXRWYWx1ZSgodGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UmVsICogbGluZXMgLSBmb250U2l6ZSkgKiB2YWx1ZSAvIGZvbnRTaXplKSArIFwiZW1cIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNldHRpbmdzLnVuaXQgPT09IFVOSVQuUkVNKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSAodGhpcy5zZXR0aW5ncy51c2VHbG9iYWwpXHJcbiAgICAgICAgICAgICAgICA/IGZvcm1hdFZhbHVlKCh0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRSZWwgKiB0aGlzLnNldHRpbmdzLmdsb2JhbFJhdGlvICogbGluZXMgLSBmb250U2l6ZSkgKiB2YWx1ZSkgKyBcInJlbVwiXHJcbiAgICAgICAgICAgICAgICA6IGZvcm1hdFZhbHVlKCh0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRSZWwgKiBsaW5lcyAtIGZvbnRTaXplKSAqIHZhbHVlKSArIFwicmVtXCI7XHJcblxyXG4gICAgICAgIH0gIGVsc2UgaWYodGhpcy5zZXR0aW5ncy51bml0ID09PSBVTklULlZXKXtcclxuICAgICAgICAgICAgcmVzdWx0ID0gbGluZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSByaHl0aG0gdmFsdWUgaW4gcmh5dGhtIHVuaXQuIEl0IHVzZWQgZm9yIGhlaWdodCB2YWx1ZXMsIGV0Yy4gXHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpWZXJ0aWNhbFJoeXRobVxyXG4gICAgICogXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIFxyXG4gICAgICogSWYgdmFsdWUgNDUwcHgsIGFuZCBiYXNlIGZvbnQgc2l6ZSAxNiwgbGluZS1oZWlnaHQgMS41LCBpbmNyZWFzZSA9IGZhbHNlIHRoZW4gcmV0dXJuIDQzMnB4LlxyXG4gICAgICogSWYgdmFsdWUgNDUwcHgsIGFuZCBiYXNlIGZvbnQgc2l6ZSAxNiwgbGluZS1oZWlnaHQgMS41LCBpbmNyZWFzZSA9IHRydWUgdGhlbiByZXR1cm4gNDU2cHguXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIGlucHV0IHZhbHVlIGxpa2UgNDUwcHg7IDEwZW07IDEwMHJlbTsuXHJcbiAgICAgKiBAcGFyYW0gZm9udFNpemUgLSBmb250IHNpemUgaW4gcGl4ZWxzLCBlbSwgcmVtIGxpa2UgMS41ZW0uXHJcbiAgICAgKiBAcGFyYW0gaW5jcmVhc2UgLSBpbmNyZWFzZSBvciBkZWNyZWFzZSBzaXplLiBEZWZhdWx0IGRlY3JlYXNlLiBpbmNyZWFzZSA9IGZhbHNlLlxyXG4gICAgICogQHBhcmFtIG91dHB1dFVuaXQgLSBvdXRwdXQgdmFsdWUgdW5pdC4gXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gLSByaHl0aG1kIHZhbHVlIHJoeXRobSB1bml0LlxyXG4gICAgICovXHJcblxyXG4gICAgcmh5dGhtKHZhbHVlLCBmb250U2l6ZSwgaW5jcmVhc2UgPSBmYWxzZSwgb3V0cHV0VW5pdCkge1xyXG5cclxuICAgICAgICBpZiAoIWZvbnRTaXplKSB7XHJcbiAgICAgICAgICAgIGZvbnRTaXplID0gdGhpcy5zZXR0aW5ncy5mb250U2l6ZSArIFwicHhcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghb3V0cHV0VW5pdCkge1xyXG4gICAgICAgICAgICBvdXRwdXRVbml0ID0gdGhpcy5zZXR0aW5ncy51bml0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGZvbnRTaXplVW5pdCA9IGdldFVuaXQoZm9udFNpemUpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy51bml0ICE9PSBVTklULlZXICYmIGZvbnRTaXplVW5pdCAhPT0gdGhpcy5zZXR0aW5ncy51bml0KSB7XHJcblxyXG4gICAgICAgICAgICBmb250U2l6ZSA9IHRoaXMuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCB0aGlzLnNldHRpbmdzLnVuaXQpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvbnRTaXplID0gcGFyc2VGbG9hdChmb250U2l6ZSk7XHJcbiAgICAgICAgbGV0IHZhbHVlVW5pdCA9IGdldFVuaXQodmFsdWUpO1xyXG5cclxuICAgICAgICBpZiAodmFsdWVVbml0ICE9PSB0aGlzLnNldHRpbmdzLnVuaXQpIHtcclxuXHJcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5jb252ZXJ0KHZhbHVlLCB2YWx1ZVVuaXQsIHRoaXMuc2V0dGluZ3MudW5pdCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGxpbmVzID0gdGhpcy5saW5lcyh2YWx1ZSksXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IDA7XHJcblxyXG4gICAgICAgIGlmICghaW5jcmVhc2UgJiYgKHZhbHVlIDwgKGxpbmVzICogZm9udFNpemUgKiB0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHRSZWwpKSkge1xyXG4gICAgICAgICAgICBsaW5lcyA9IGxpbmVzIC0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvdXRwdXRVbml0ID09PSBVTklULlBYKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRJbnQobGluZXMgKiB0aGlzLnNldHRpbmdzLmxpbmVIZWlnaHQpICsgXCJweFwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKG91dHB1dFVuaXQgPT09IFVOSVQuRU0pIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9ICh0aGlzLnNldHRpbmdzLnVzZUdsb2JhbClcclxuICAgICAgICAgICAgICAgID8gZm9ybWF0VmFsdWUodGhpcy5zZXR0aW5ncy5saW5lSGVpZ2h0UmVsICogdGhpcy5zZXR0aW5ncy5nbG9iYWxSYXRpbyAqIGxpbmVzIC8gZm9udFNpemUpICsgXCJlbVwiXHJcbiAgICAgICAgICAgICAgICA6IGZvcm1hdFZhbHVlKHRoaXMuc2V0dGluZ3MubGluZUhlaWdodFJlbCAqIGxpbmVzIC8gZm9udFNpemUpICsgXCJlbVwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKG91dHB1dFVuaXQgPT09IFVOSVQuUkVNKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSAodGhpcy5zZXR0aW5ncy51c2VHbG9iYWwpXHJcbiAgICAgICAgICAgICAgICA/IGZvcm1hdFZhbHVlKHRoaXMuc2V0dGluZ3MubGluZUhlaWdodFJlbCAqIHRoaXMuc2V0dGluZ3MuZ2xvYmFsUmF0aW8gKiBsaW5lcykgKyBcInJlbVwiXHJcbiAgICAgICAgICAgICAgICA6IGZvcm1hdFZhbHVlKHRoaXMuc2V0dGluZ3MubGluZUhlaWdodFJlbCAqIGxpbmVzKSArIFwicmVtXCI7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZihvdXRwdXRVbml0ID09PSBVTklULlZXKXtcclxuICAgICAgICAgICAgcmVzdWx0ID0gbGluZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgcmVtIHRvIHBpeGVsIHZhbHVlLlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBpbnB1dCB2YWx1ZSBpbiByZW0uXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gLSBvdXRwdXQgdmFsdWUgaW4gcGl4ZWxzLlxyXG4gICAgICovXHJcbiAgICByZW1GYWxsYmFjayh2YWx1ZSkge1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0ID0gdmFsdWU7XHJcbiAgICAgICAgbGV0IGZvdW5kO1xyXG4gICAgICAgIHdoaWxlICgoZm91bmQgPSByZXN1bHQubWF0Y2gocmVtUmVnZXhwKSkpIHtcclxuICAgICAgICAgICAgbGV0IHB4VmFsdWUgPSB0aGlzLmNvbnZlcnQoZm91bmRbMV0sIFVOSVQuUkVNLCBVTklULlBYKTtcclxuICAgICAgICAgICAgaWYodGhpcy5zZXR0aW5ncy51c2VHbG9iYWwpIHtcclxuICAgICAgICAgICAgICAgIHB4VmFsdWUgPSBweFZhbHVlIC8gdGhpcy5zZXR0aW5ncy5nbG9iYWxSYXRpbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZShmb3VuZFswXSwgZm9ybWF0SW50KHB4VmFsdWUpICsgXCJweFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gZnJhY3Rpb24gb2YgdGhlIGJhc2UgZm9udCBzaXplLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICogQHBhcmFtIGZvbnRTaXplXHJcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBiYXNlKHZhbHVlLCBmb250U2l6ZSl7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG5cclxuICAgICAgICBpZiAoIWZvbnRTaXplKSB7XHJcbiAgICAgICAgICAgIGZvbnRTaXplID0gdGhpcy5zZXR0aW5ncy5mb250U2l6ZSArIFwicHhcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBmb250U2l6ZVVuaXQgPSBnZXRVbml0KGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgaWYgKGZvbnRTaXplVW5pdCAhPT0gdGhpcy5zZXR0aW5ncy51bml0KSB7XHJcblxyXG4gICAgICAgICAgICBmb250U2l6ZSA9IHRoaXMuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCB0aGlzLnNldHRpbmdzLnVuaXQpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvbnRTaXplID0gcGFyc2VGbG9hdChmb250U2l6ZSk7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuc2V0dGluZ3MudW5pdCA9PT0gVU5JVC5QWCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRJbnQoZm9udFNpemUgKiByZXN1bHQpICsgXCJweFwiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuc2V0dGluZ3MudXNlR2xvYmFsICYmIHRoaXMuc2V0dGluZ3MudW5pdCAhPT0gVU5JVC5WVykge1xyXG4gICAgICAgICAgICAgICAgZm9udFNpemUgPSBmb250U2l6ZSAqIHRoaXMuc2V0dGluZ3MuZ2xvYmFsUmF0aW87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0ID0gZm9ybWF0VmFsdWUoZm9udFNpemUgKiByZXN1bHQpICsgdW5pdE5hbWVbdGhpcy5zZXR0aW5ncy51bml0XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEV4cG9ydCBWZXJ0aWNhbCBSaHl0aG0gQ2xhc3MuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBWZXJ0aWNhbFJoeXRobTsiXX0=
