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
         * settings["font-size"] - base font size in pixels.
         * settings["px-fallback"] - boolean pixel fallback. Convert relative sizes to pixels. If rhythm unit rem then rem value doubled with pixels values.
         * If rhythm unit px and option will be set then in line height will be pixels like 24px, else relative size like 1.45(without em or rem)
         * settings["line-height"] - base line height in pixels or relative value(without em or rem).
         * </p>
         */
        function VerticalRhythm(settings) {
                _classCallCheck(this, VerticalRhythm);

                this.baseFontSize = parseInt(settings["font-size"]);
                this.rhythmUnit = (0, _Helpers.getUnit)(settings["unit"]);
                this.pxFallback = settings["px-fallback"] === "true" ? 1 : 0;
                this.minLinePadding = parseInt(settings["min-line-padding"]);
                this.roundToHalfLine = settings["round-to-half-line"] === "true" ? 1 : 0;

                // Base Line Height in Pixels
                this.baseLineHeight = (0, _Helpers.isHas)(settings["line-height"], "px") ? parseFloat(settings["line-height"]) : parseFloat(settings["line-height"]) * this.baseFontSize;
                this.baseLineHeightRatio = (0, _Helpers.isHas)(settings["line-height"], "px") ? parseFloat(settings["line-height"]) / parseInt(this.baseFontSize) : parseFloat(settings["line-height"]);
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

                fontSize = parseFloat(fontSize);

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
         * @param pxFallback - boolean pixel fallback option. Ignore settings["px-fallback"] option. Convert relative sizes to pixels. If rhythm unit rem then rem value doubled with pixels values.
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

                        result = fontSize && !this.pxFallback && !pxFallback ? (0, _Helpers.formatValue)(this.baseLineHeight / fontSize) : (0, _Helpers.formatInt)(this.baseLineHeight * value) + "px";
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlZlcnRpY2FsUmh5dGhtLmVzNiJdLCJuYW1lcyI6WyJWZXJ0aWNhbFJoeXRobSIsInNldHRpbmdzIiwiYmFzZUZvbnRTaXplIiwicGFyc2VJbnQiLCJyaHl0aG1Vbml0IiwicHhGYWxsYmFjayIsIm1pbkxpbmVQYWRkaW5nIiwicm91bmRUb0hhbGZMaW5lIiwiYmFzZUxpbmVIZWlnaHQiLCJwYXJzZUZsb2F0IiwiYmFzZUxpbmVIZWlnaHRSYXRpbyIsImJhc2VMZWFkaW5nIiwiY29udmVydCIsIlBYIiwidmFsdWUiLCJ2YWx1ZVVuaXQiLCJmb3JtYXQiLCJmcm9tQ29udGV4dCIsInRvQ29udGV4dCIsInB4VmFsdWUiLCJFTSIsIlJFTSIsIlBFUkNFTlQiLCJFWCIsInJlc3VsdCIsImxpbmVzIiwiZm9udFNpemUiLCJNYXRoIiwiY2VpbCIsImxpbmVIZWlnaHQiLCJmb250U2l6ZVVuaXQiLCJsZWFkaW5nIiwicmh5dGhtIiwiaW5jcmVhc2UiLCJvdXRwdXRVbml0IiwicmVtRmFsbGJhY2siLCJmb3VuZCIsIm1hdGNoIiwicmVwbGFjZSJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7O0FBU0E7Ozs7Ozs7Ozs7O0lBV01BLGM7O0FBRUY7Ozs7Ozs7Ozs7Ozs7OztBQWVBLGdDQUFZQyxRQUFaLEVBQXNCO0FBQUE7O0FBQ2xCLHFCQUFLQyxZQUFMLEdBQW9CQyxTQUFTRixTQUFTLFdBQVQsQ0FBVCxDQUFwQjtBQUNBLHFCQUFLRyxVQUFMLEdBQWtCLHNCQUFRSCxTQUFTLE1BQVQsQ0FBUixDQUFsQjtBQUNBLHFCQUFLSSxVQUFMLEdBQW1CSixTQUFTLGFBQVQsTUFBNEIsTUFBN0IsR0FBdUMsQ0FBdkMsR0FBMkMsQ0FBN0Q7QUFDQSxxQkFBS0ssY0FBTCxHQUFzQkgsU0FBU0YsU0FBUyxrQkFBVCxDQUFULENBQXRCO0FBQ0EscUJBQUtNLGVBQUwsR0FBd0JOLFNBQVMsb0JBQVQsTUFBbUMsTUFBcEMsR0FBOEMsQ0FBOUMsR0FBa0QsQ0FBekU7O0FBRUE7QUFDQSxx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dUJBQU9ELE1BQVA7QUFFSCxTOztBQUVEOzs7Ozs7Ozs7aUNBT0FXLFcsd0JBQVlyQixLLEVBQU87O0FBRWYsb0JBQUlVLFNBQVNWLEtBQWI7QUFDQSxvQkFBSXNCLFFBQVEsSUFBWjtBQUNBLHVCQUFRQSxRQUFRWixPQUFPYSxLQUFQLG9CQUFoQixFQUEwQztBQUN0Qyw0QkFBSWxCLFVBQVUsS0FBS1AsT0FBTCxDQUFhd0IsTUFBTSxDQUFOLENBQWIsRUFBdUIsY0FBS2YsR0FBNUIsRUFBaUMsY0FBS1IsRUFBdEMsQ0FBZDtBQUNBVyxpQ0FBU0EsT0FBT2MsT0FBUCxDQUFlRixNQUFNLENBQU4sQ0FBZixFQUF5Qix3QkFBVWpCLE9BQVYsSUFBcUIsSUFBOUMsQ0FBVDtBQUNIOztBQUVELHVCQUFPSyxNQUFQO0FBQ0gsUzs7Ozs7QUFHTDs7Ozs7a0JBR2V4QixjIiwiZmlsZSI6IlZlcnRpY2FsUmh5dGhtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICAgIGZvcm1hdEludCxcclxuICAgIGZvcm1hdFZhbHVlLFxyXG4gICAgcmVtUmVnZXhwLFxyXG4gICAgZ2V0VW5pdCxcclxuICAgIGlzSGFzLFxyXG4gICAgVU5JVFxyXG59IGZyb20gXCIuL0hlbHBlcnNcIjtcclxuXHJcbi8qKlxyXG4gKiBAbW9kdWxlIFZlcnRpY2FsUmh5dGhtXHJcbiAqIFxyXG4gKiBAZGVzY3JpcHRpb24gVmVydGljYWxSaHl0aG0gQ2xhc3MgZm9yIGNhbGN1bGF0ZSByaHl0aG0gc2l6ZXMgYW5zIGNvbnZlcnQgdW5pdHMuXHJcbiAqIFxyXG4gKiBAdmVyc2lvbiAxLjBcclxuICogQGF1dGhvciBHcmlnb3J5IFZhc2lseWV2IDxwb3N0Y3NzLmhhbXN0ZXJAZ21haWwuY29tPiBodHRwczovL2dpdGh1Yi5jb20vaDB0YzBkM1xyXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNywgR3JpZ29yeSBWYXNpbHlldlxyXG4gKiBAbGljZW5zZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAsIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMCBcclxuICovXHJcblxyXG5jbGFzcyBWZXJ0aWNhbFJoeXRobSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgY2xhc3MgVmVydGljYWxSaHl0aG0uXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6VmVydGljYWxSaHl0aG1cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHNldHRpbmdzIC0gc2V0dGluZ3MgaGFzaC5cclxuICAgICAqIFxyXG4gICAgICogPHA+XHJcbiAgICAgKiBVc2U6XHJcbiAgICAgKiBzZXR0aW5nc1tcImZvbnQtc2l6ZVwiXSAtIGJhc2UgZm9udCBzaXplIGluIHBpeGVscy5cclxuICAgICAqIHNldHRpbmdzW1wicHgtZmFsbGJhY2tcIl0gLSBib29sZWFuIHBpeGVsIGZhbGxiYWNrLiBDb252ZXJ0IHJlbGF0aXZlIHNpemVzIHRvIHBpeGVscy4gSWYgcmh5dGhtIHVuaXQgcmVtIHRoZW4gcmVtIHZhbHVlIGRvdWJsZWQgd2l0aCBwaXhlbHMgdmFsdWVzLlxyXG4gICAgICogSWYgcmh5dGhtIHVuaXQgcHggYW5kIG9wdGlvbiB3aWxsIGJlIHNldCB0aGVuIGluIGxpbmUgaGVpZ2h0IHdpbGwgYmUgcGl4ZWxzIGxpa2UgMjRweCwgZWxzZSByZWxhdGl2ZSBzaXplIGxpa2UgMS40NSh3aXRob3V0IGVtIG9yIHJlbSlcclxuICAgICAqIHNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0gLSBiYXNlIGxpbmUgaGVpZ2h0IGluIHBpeGVscyBvciByZWxhdGl2ZSB2YWx1ZSh3aXRob3V0IGVtIG9yIHJlbSkuXHJcbiAgICAgKiA8L3A+XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHNldHRpbmdzKSB7XHJcbiAgICAgICAgdGhpcy5iYXNlRm9udFNpemUgPSBwYXJzZUludChzZXR0aW5nc1tcImZvbnQtc2l6ZVwiXSk7XHJcbiAgICAgICAgdGhpcy5yaHl0aG1Vbml0ID0gZ2V0VW5pdChzZXR0aW5nc1tcInVuaXRcIl0pO1xyXG4gICAgICAgIHRoaXMucHhGYWxsYmFjayA9IChzZXR0aW5nc1tcInB4LWZhbGxiYWNrXCJdID09PSBcInRydWVcIikgPyAxIDogMDtcclxuICAgICAgICB0aGlzLm1pbkxpbmVQYWRkaW5nID0gcGFyc2VJbnQoc2V0dGluZ3NbXCJtaW4tbGluZS1wYWRkaW5nXCJdKTtcclxuICAgICAgICB0aGlzLnJvdW5kVG9IYWxmTGluZSA9IChzZXR0aW5nc1tcInJvdW5kLXRvLWhhbGYtbGluZVwiXSA9PT0gXCJ0cnVlXCIpID8gMSA6IDA7XHJcblxyXG4gICAgICAgIC8vIEJhc2UgTGluZSBIZWlnaHQgaW4gUGl4ZWxzXHJcbiAgICAgICAgdGhpcy5iYXNlTGluZUhlaWdodCA9IGlzSGFzKHNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0sIFwicHhcIikgPyBwYXJzZUZsb2F0KHNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0pIDogcGFyc2VGbG9hdChzZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdKSAqIHRoaXMuYmFzZUZvbnRTaXplO1xyXG4gICAgICAgIHRoaXMuYmFzZUxpbmVIZWlnaHRSYXRpbyA9IGlzSGFzKHNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0sIFwicHhcIikgPyBwYXJzZUZsb2F0KHNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0pIC8gcGFyc2VJbnQodGhpcy5iYXNlRm9udFNpemUpIDogcGFyc2VGbG9hdChzZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdKTtcclxuICAgICAgICB0aGlzLmJhc2VMZWFkaW5nID0gdGhpcy5jb252ZXJ0KHRoaXMuYmFzZUxpbmVIZWlnaHQgLSB0aGlzLmJhc2VGb250U2l6ZSwgVU5JVC5QWCwgdGhpcy5yaHl0aG1Vbml0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgdmFsdWVzIGZyb20gdW5pdCB0byB1bml0LlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlZlcnRpY2FsUmh5dGhtXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIGlucHV0IHZhbHVlXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVVbml0IC0gaW5wdXQgdmFsdWUgdW5pdFxyXG4gICAgICogQHBhcmFtIGZvcm1hdCAtIG91dHB1dCB2YWx1ZSB1bml0XHJcbiAgICAgKiBAcGFyYW0gZnJvbUNvbnRleHQgLSBmcm9tIGJhc2UgZm9udCBzaXplXHJcbiAgICAgKiBAcGFyYW0gdG9Db250ZXh0IC0gdG8gbmV3IGJhc2UgZm9udCBzaXplXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gLSBvdXRwdXQgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIGNvbnZlcnQodmFsdWUsIHZhbHVlVW5pdCwgZm9ybWF0ID0gbnVsbCwgZnJvbUNvbnRleHQgPSBudWxsLCB0b0NvbnRleHQgPSBudWxsKSB7XHJcblxyXG4gICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcblxyXG4gICAgICAgIGlmIChmb3JtYXQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgZm9ybWF0ID0gdGhpcy5yaHl0aG1Vbml0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHZhbHVlVW5pdCA9PT0gZm9ybWF0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChmcm9tQ29udGV4dCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBmcm9tQ29udGV4dCA9IHRoaXMuYmFzZUZvbnRTaXplO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZyb21Db250ZXh0ID0gcGFyc2VGbG9hdChmcm9tQ29udGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodG9Db250ZXh0ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRvQ29udGV4dCA9IGZyb21Db250ZXh0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRvQ29udGV4dCA9IHBhcnNlRmxvYXQodG9Db250ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBweFZhbHVlID0gMDtcclxuXHJcbiAgICAgICAgaWYgKHZhbHVlVW5pdCA9PT0gVU5JVC5FTSkge1xyXG4gICAgICAgICAgICBweFZhbHVlID0gdmFsdWUgKiBmcm9tQ29udGV4dDtcclxuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVW5pdCA9PT0gVU5JVC5SRU0pIHtcclxuICAgICAgICAgICAgcHhWYWx1ZSA9IHZhbHVlICogdGhpcy5iYXNlRm9udFNpemU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVVuaXQgPT09IFVOSVQuUEVSQ0VOVCkge1xyXG4gICAgICAgICAgICBweFZhbHVlID0gdmFsdWUgKiBmcm9tQ29udGV4dCAvIDEwMDtcclxuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVW5pdCA9PT0gVU5JVC5FWCkge1xyXG4gICAgICAgICAgICBweFZhbHVlID0gdmFsdWUgKiBmcm9tQ29udGV4dCAvIDI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcHhWYWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IHB4VmFsdWU7XHJcblxyXG4gICAgICAgIGlmIChmb3JtYXQgPT09IFVOSVQuRU0pIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcHhWYWx1ZSAvIHRvQ29udGV4dDtcclxuICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PT0gVU5JVC5SRU0pIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcHhWYWx1ZSAvIHRoaXMuYmFzZUZvbnRTaXplO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZm9ybWF0ID09PSBVTklULlBFUkNFTlQpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcHhWYWx1ZSAqIDEwMCAvIHRvQ29udGV4dDtcclxuICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdCA9PT0gVU5JVC5FWCkge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBweFZhbHVlICogMiAvIHRvQ29udGV4dDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgdGhlIG1pbmltdW0gbXVsdGlwbGUgcmh5dGhtIHVuaXRzKGxpbmVzKSBuZWVkZWQgdG8gY29udGFpbiB0aGUgZm9udC1zaXplLiAxIHJoeXRobSB1bml0ID0gYmFzZSBsaW5lIGhlaWdodCBpbiBwaXhlbHMuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6VmVydGljYWxSaHl0aG1cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGZvbnRTaXplIC0gZm9udCBzaXplIGluIHBpeGVscywgZW0sIHJlbSBsaWtlIDEuNWVtLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gbnVtYmVyIG9mIGxpbmVzLlxyXG4gICAgICovXHJcbiAgICBsaW5lcyhmb250U2l6ZSkge1xyXG5cclxuICAgICAgICBmb250U2l6ZSA9IHBhcnNlRmxvYXQoZm9udFNpemUpO1xyXG5cclxuICAgICAgICBsZXQgbGluZXMgPSAwO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yaHl0aG1Vbml0ID09PSBVTklULlBYKSB7XHJcblxyXG4gICAgICAgICAgICBsaW5lcyA9ICh0aGlzLnJvdW5kVG9IYWxmTGluZSkgPyBNYXRoLmNlaWwoMiAqIGZvbnRTaXplIC8gdGhpcy5iYXNlTGluZUhlaWdodCkgLyAyIDogTWF0aC5jZWlsKGZvbnRTaXplIC8gdGhpcy5iYXNlTGluZUhlaWdodCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5yaHl0aG1Vbml0ID09PSBVTklULkVNIHx8IHRoaXMucmh5dGhtVW5pdCA9PT0gVU5JVC5SRU0pIHtcclxuXHJcbiAgICAgICAgICAgIGxpbmVzID0gKHRoaXMucm91bmRUb0hhbGZMaW5lKSA/IE1hdGguY2VpbCgyICogZm9udFNpemUgLyB0aGlzLmJhc2VMaW5lSGVpZ2h0UmF0aW8pIC8gMiA6IE1hdGguY2VpbChmb250U2l6ZSAvIHRoaXMuYmFzZUxpbmVIZWlnaHRSYXRpbyk7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICAvL0lmIGxpbmVzIGFyZSBjcmFtcGVkIGluY2x1ZGUgc29tZSBleHRyYSBsZWFkLlxyXG4gICAgICAgIGlmICgobGluZXMgKiB0aGlzLmJhc2VMaW5lSGVpZ2h0IC0gZm9udFNpemUpIDwgKHRoaXMubWluTGluZVBhZGRpbmcgKiAyKSl7XHJcbiAgICAgICAgICAgIGxpbmVzID0gKHRoaXMucm91bmRUb0hhbGZMaW5lKSA/IGxpbmVzICsgMC41IDogbGluZXMgKyAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGxpbmVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIGxpbmUgaGVpZ2h0IHZhbHVlIGluIHJoeXRobSB1bml0cyBmb3IgZm9udCBzaXplLiBHZW5lcmF0ZSBsaW5lIGhlaWdodCBmcm9tIGZvbnQgc2l6ZSBvciBpbnB1dCBsaW5lcy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpWZXJ0aWNhbFJoeXRobVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gZm9udFNpemUgLSBmb250IHNpemUgaW4gcGl4ZWxzLCBlbSwgcmVtIGxpa2UgMS41ZW0uXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBpbnB1dCBsaW5lcywgYmVmb3JlIG91dHB1dCAxIGxpbmUgaGVpZ2h0IHdpbGwgYmUgbXVsdGlwbHkgd2l0aCB2YWx1ZS5cclxuICAgICAqIEBwYXJhbSBiYXNlRm9udFNpemUgLSBiYXNlIGZvbnQgc2l6ZSBmb3IgY2FsY3VsYXRpb24gcmVsYXRpdmUgc2l6ZXMgZm9yIHB4IG9yIGVtLlxyXG4gICAgICogQHBhcmFtIHB4RmFsbGJhY2sgLSBib29sZWFuIHBpeGVsIGZhbGxiYWNrIG9wdGlvbi4gSWdub3JlIHNldHRpbmdzW1wicHgtZmFsbGJhY2tcIl0gb3B0aW9uLiBDb252ZXJ0IHJlbGF0aXZlIHNpemVzIHRvIHBpeGVscy4gSWYgcmh5dGhtIHVuaXQgcmVtIHRoZW4gcmVtIHZhbHVlIGRvdWJsZWQgd2l0aCBwaXhlbHMgdmFsdWVzLlxyXG4gICAgICogSWYgcmh5dGhtIHVuaXQgcHggYW5kIG9wdGlvbiB3aWxsIGJlIHNldCB0aGVuIGluIGxpbmUgaGVpZ2h0IHdpbGwgYmUgcGl4ZWxzIGxpa2UgMjRweCwgZWxzZSByZWxhdGl2ZSBzaXplIGxpa2UgMS40NSh3aXRob3V0IGVtIG9yIHJlbSkuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gLSBsaW5lIGhlaWdodCBpbiByaHl0aG0gdW5pdC5cclxuICAgICAqL1xyXG4gICAgbGluZUhlaWdodChmb250U2l6ZSwgdmFsdWUsIGJhc2VGb250U2l6ZSwgcHhGYWxsYmFjayA9IGZhbHNlKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIWZvbnRTaXplKXtcclxuICAgICAgICAgICAgZm9udFNpemUgPSB0aGlzLmJhc2VGb250U2l6ZSArIFwicHhcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChmb250U2l6ZSAmJiAodGhpcy5yaHl0aG1Vbml0ID09PSBVTklULkVNIHx8ICF2YWx1ZSkpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBmb250U2l6ZVVuaXQgPSBnZXRVbml0KGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmb250U2l6ZVVuaXQgIT0gdGhpcy5yaHl0aG1Vbml0IHx8IGJhc2VGb250U2l6ZSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZSA9IChiYXNlRm9udFNpemUpID8gdGhpcy5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIHRoaXMucmh5dGhtVW5pdCwgYmFzZUZvbnRTaXplKSA6IHRoaXMuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCB0aGlzLnJoeXRobVVuaXQpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHBhcnNlRmxvYXQoZm9udFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFsdWUgPSAodmFsdWUpID8gcGFyc2VGbG9hdCh2YWx1ZSkgOiB0aGlzLmxpbmVzKGZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IDA7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJoeXRobVVuaXQgPT09IFVOSVQuUFgpIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IChmb250U2l6ZSAmJiAhdGhpcy5weEZhbGxiYWNrICYmICFweEZhbGxiYWNrKSA/IGZvcm1hdFZhbHVlKHRoaXMuYmFzZUxpbmVIZWlnaHQgLyBmb250U2l6ZSkgOiBmb3JtYXRJbnQodGhpcy5iYXNlTGluZUhlaWdodCAqIHZhbHVlKSArIFwicHhcIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJoeXRobVVuaXQgPT09IFVOSVQuRU0pIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdFZhbHVlKHZhbHVlICogdGhpcy5iYXNlTGluZUhlaWdodFJhdGlvIC8gZm9udFNpemUpICsgXCJlbVwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmh5dGhtVW5pdCA9PT0gVU5JVC5SRU0pIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdFZhbHVlKHZhbHVlICogdGhpcy5iYXNlTGluZUhlaWdodFJhdGlvKSArIFwicmVtXCI7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgbGVhZGluZyB2YWx1ZSBpbiByaHl0aG0gdW5pdFxyXG4gICAgICpcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6VmVydGljYWxSaHl0aG1cclxuICAgICAqIFxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiAxIGxlYWRpbmcoaW4gcGl4ZWxzKSA9IGJhc2UgbGluZSBoZWlnaHQoaW4gcGl4ZWxzKSAtIGJhc2UgZm9udCBzaXplKGluIHBpeGVscykuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIGlucHV0IGxpbmVzLCBiZWZvcmUgb3V0cHV0IDEgbGluZSBoZWlnaHQgd2lsbCBiZSBtdWx0aXBseSB3aXRoIHZhbHVlLlxyXG4gICAgICogQHBhcmFtIGZvbnRTaXplIC0gZm9udCBzaXplIGluIHBpeGVscywgZW0sIHJlbSBsaWtlIDEuNWVtLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gbGVhZGluZyBpbiByaHl0aG0gdW5pdC5cclxuICAgICAqL1xyXG4gICAgbGVhZGluZyh2YWx1ZSwgZm9udFNpemUpIHtcclxuICAgICAgICBcclxuICAgICAgICBpZighZm9udFNpemUpe1xyXG4gICAgICAgICAgICBmb250U2l6ZSA9IHRoaXMuYmFzZUZvbnRTaXplICsgXCJweFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgZm9udFNpemVVbml0ID0gZ2V0VW5pdChmb250U2l6ZSk7XHJcblxyXG4gICAgICAgIGlmIChmb250U2l6ZVVuaXQgIT0gdGhpcy5yaHl0aG1Vbml0KSB7XHJcblxyXG4gICAgICAgICAgICBmb250U2l6ZSA9IHRoaXMuY29udmVydChmb250U2l6ZSwgZm9udFNpemVVbml0LCB0aGlzLnJoeXRobVVuaXQpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgZm9udFNpemUgPSBwYXJzZUZsb2F0KGZvbnRTaXplKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBsaW5lcyA9IHRoaXMubGluZXMoZm9udFNpemUpLFxyXG4gICAgICAgICAgICByZXN1bHQgPSAwO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yaHl0aG1Vbml0ID09PSBVTklULlBYKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRJbnQoKGxpbmVzICogdGhpcy5iYXNlTGluZUhlaWdodCAtIGZvbnRTaXplKSAqIHZhbHVlKSArIFwicHhcIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJoeXRobVVuaXQgPT09IFVOSVQuRU0pIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdFZhbHVlKCh0aGlzLmJhc2VMaW5lSGVpZ2h0UmF0aW8gKiBsaW5lcyAtIGZvbnRTaXplKSAqIHZhbHVlIC8gZm9udFNpemUpICsgXCJlbVwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucmh5dGhtVW5pdCA9PT0gVU5JVC5SRU0pIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdFZhbHVlKChsaW5lcyAqIHRoaXMuYmFzZUxpbmVIZWlnaHRSYXRpbyAtIGZvbnRTaXplKSAqIHZhbHVlKSArIFwicmVtXCI7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIHJoeXRobSB2YWx1ZSBpbiByaHl0aG0gdW5pdC4gSXQgdXNlZCBmb3IgaGVpZ2h0IHZhbHVlcywgZXRjLiBcclxuICAgICAqXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlZlcnRpY2FsUmh5dGhtXHJcbiAgICAgKiBcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogXHJcbiAgICAgKiBJZiB2YWx1ZSA0NTBweCwgYW5kIGJhc2UgZm9udCBzaXplIDE2LCBsaW5lLWhlaWdodCAxLjUsIGluY3JlYXNlID0gZmFsc2UgdGhlbiByZXR1cm4gNDMycHguXHJcbiAgICAgKiBJZiB2YWx1ZSA0NTBweCwgYW5kIGJhc2UgZm9udCBzaXplIDE2LCBsaW5lLWhlaWdodCAxLjUsIGluY3JlYXNlID0gdHJ1ZSB0aGVuIHJldHVybiA0NTZweC5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHZhbHVlIC0gaW5wdXQgdmFsdWUgbGlrZSA0NTBweDsgMTBlbTsgMTAwcmVtOy5cclxuICAgICAqIEBwYXJhbSBmb250U2l6ZSAtIGZvbnQgc2l6ZSBpbiBwaXhlbHMsIGVtLCByZW0gbGlrZSAxLjVlbS5cclxuICAgICAqIEBwYXJhbSBpbmNyZWFzZSAtIGluY3JlYXNlIG9yIGRlY3JlYXNlIHNpemUuIERlZmF1bHQgZGVjcmVhc2UuIGluY3JlYXNlID0gZmFsc2UuXHJcbiAgICAgKiBAcGFyYW0gb3V0cHV0VW5pdCAtIG91dHB1dCB2YWx1ZSB1bml0LiBcclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAtIHJoeXRobWQgdmFsdWUgcmh5dGhtIHVuaXQuXHJcbiAgICAgKi9cclxuXHJcbiAgICByaHl0aG0odmFsdWUsIGZvbnRTaXplLCBpbmNyZWFzZSA9IGZhbHNlLCBvdXRwdXRVbml0KSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoZm9udFNpemUgPT0gbnVsbCl7XHJcbiAgICAgICAgICAgIGZvbnRTaXplID0gdGhpcy5iYXNlRm9udFNpemUgKyBcInB4XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihvdXRwdXRVbml0ID09IG51bGwpe1xyXG4gICAgICAgICAgICBvdXRwdXRVbml0ID0gdGhpcy5yaHl0aG1Vbml0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGZvbnRTaXplVW5pdCA9IGdldFVuaXQoZm9udFNpemUpO1xyXG5cclxuICAgICAgICBpZiAoZm9udFNpemVVbml0ICE9IHRoaXMucmh5dGhtVW5pdCkge1xyXG5cclxuICAgICAgICAgICAgZm9udFNpemUgPSB0aGlzLmNvbnZlcnQoZm9udFNpemUsIGZvbnRTaXplVW5pdCwgdGhpcy5yaHl0aG1Vbml0KTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGZvbnRTaXplID0gcGFyc2VGbG9hdChmb250U2l6ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdmFsdWVVbml0ID0gZ2V0VW5pdCh2YWx1ZSk7XHJcblxyXG4gICAgICAgIGlmICh2YWx1ZVVuaXQgIT0gdGhpcy5yaHl0aG1Vbml0KSB7XHJcblxyXG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMuY29udmVydCh2YWx1ZSwgdmFsdWVVbml0LCB0aGlzLnJoeXRobVVuaXQpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBsaW5lcyA9IHRoaXMubGluZXModmFsdWUpLFxyXG4gICAgICAgICAgICByZXN1bHQgPSAwO1xyXG4gICAgXHJcbiAgICAgICAgaWYgKCFpbmNyZWFzZSAmJiAodmFsdWUgPCAobGluZXMgKiBmb250U2l6ZSAqIHRoaXMuYmFzZUxpbmVIZWlnaHRSYXRpbykpKSB7XHJcbiAgICAgICAgICAgIGxpbmVzID0gbGluZXMgLSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG91dHB1dFVuaXQgPT09IFVOSVQuUFgpIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdEludChsaW5lcyAqIHRoaXMuYmFzZUxpbmVIZWlnaHQpICsgXCJweFwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKG91dHB1dFVuaXQgPT09IFVOSVQuRU0pIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZvcm1hdFZhbHVlKHRoaXMuYmFzZUxpbmVIZWlnaHRSYXRpbyAqIGxpbmVzIC8gZm9udFNpemUpICsgXCJlbVwiO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKG91dHB1dFVuaXQgPT09IFVOSVQuUkVNKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRWYWx1ZSh0aGlzLmJhc2VMaW5lSGVpZ2h0UmF0aW8gKiBsaW5lcykgKyBcInJlbVwiO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCByZW0gdG8gcGl4ZWwgdmFsdWUuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIGlucHV0IHZhbHVlIGluIHJlbS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAtIG91dHB1dCB2YWx1ZSBpbiBwaXhlbHMuXHJcbiAgICAgKi9cclxuICAgIHJlbUZhbGxiYWNrKHZhbHVlKSB7XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQgPSB2YWx1ZTtcclxuICAgICAgICBsZXQgZm91bmQgPSBudWxsO1xyXG4gICAgICAgIHdoaWxlICgoZm91bmQgPSByZXN1bHQubWF0Y2gocmVtUmVnZXhwKSkpIHtcclxuICAgICAgICAgICAgbGV0IHB4VmFsdWUgPSB0aGlzLmNvbnZlcnQoZm91bmRbMV0sIFVOSVQuUkVNLCBVTklULlBYKTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoZm91bmRbMF0sIGZvcm1hdEludChweFZhbHVlKSArIFwicHhcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogRXhwb3J0IFZlcnRpY2FsIFJoeXRobSBDbGFzcy5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IFZlcnRpY2FsUmh5dGhtOyJdfQ==
