"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
                this.rhythmUnit = settings["unit"];
                this.pxFallback = settings["px-fallback"];
                this.minLinePadding = parseInt(settings["min-line-padding"]);
                this.roundToHalfLine = settings["round-to-half-line"];

                // Base Line Height in Pixels
                this.baseLineHeight = settings["line-height"].match(/px$/i) ? parseFloat(settings["line-height"]) : parseFloat(settings["line-height"]) * this.baseFontSize;
                this.baseLineHeightRatio = settings["line-height"].match(/px$/i) ? parseFloat(settings["line-height"]) / parseInt(this.baseFontSize) : parseFloat(settings["line-height"]);
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


        VerticalRhythm.prototype.convert = function convert(value, valueUnit) {
                var format = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
                var fromContext = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
                var toContext = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;


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

                var pxValue = 0;

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

                var result = pxValue;

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

                if (this.rhythmUnit == "px") {

                        lines = this.roundToHalfLine == "true" ? Math.ceil(2 * fontSize / this.baseLineHeight) / 2 : Math.ceil(fontSize / this.baseLineHeight);
                } else if (this.rhythmUnit == "em" || this.rhythmUnit == "rem") {

                        lines = this.roundToHalfLine == "true" ? Math.ceil(2 * fontSize / this.baseLineHeightRatio) / 2 : Math.ceil(fontSize / this.baseLineHeightRatio);
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


        VerticalRhythm.prototype.lineHeight = function lineHeight(fontSize, value) {
                var baseFontSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
                var pxFallback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;


                if (fontSize != null && (this.rhythmUnit == "em" || value == null)) {

                        var fontSizeUnit = fontSize.match(/(px|em|rem)$/i)[0].toLowerCase();

                        if (fontSizeUnit != this.rhythmUnit || baseFontSize != null) {

                                fontSize = baseFontSize != null ? this.convert(fontSize, fontSizeUnit, this.rhythmUnit, baseFontSize) : this.convert(fontSize, fontSizeUnit, this.rhythmUnit);
                        } else {

                                fontSize = parseFloat(fontSize);
                        }
                }

                value = value != null ? parseFloat(value) : this.lines(fontSize);

                var result = 0;

                if (this.rhythmUnit == "px") {

                        result = fontSize != null && this.pxFallback != "true" && !pxFallback ? formatValue(this.baseLineHeight / fontSize) : formatInt(this.baseLineHeight * value) + "px";
                } else if (this.rhythmUnit == "em") {

                        result = formatValue(value * this.baseLineHeightRatio / fontSize) + "em";
                } else if (this.rhythmUnit == "rem") {

                        result = formatValue(value * this.baseLineHeightRatio) + "rem";
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


        VerticalRhythm.prototype.leading = function leading(value) {
                var fontSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;


                var fontSizeUnit = fontSize.match(/(px|em|rem)$/i)[0].toLowerCase();

                if (fontSizeUnit != this.rhythmUnit) {

                        fontSize = this.convert(fontSize, fontSizeUnit, this.rhythmUnit);
                } else {

                        fontSize = parseFloat(fontSize);
                }

                var lines = this.lines(fontSize),
                    result = 0;

                if (this.rhythmUnit == "px") {

                        result = formatInt((lines * this.baseLineHeight - fontSize) * value) + "px";
                } else if (this.rhythmUnit == "em") {

                        result = formatValue((this.baseLineHeightRatio * lines - fontSize) * value / fontSize) + "em";
                } else if (this.rhythmUnit == "rem") {

                        result = formatValue((lines * this.baseLineHeightRatio - fontSize) * value) + "rem";
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

                while (found = result.match(/([0-9\.]+)rem/i)) {
                        result = result.replace(found[0], formatInt(this.convert(found[1], "rem", "px")) + "px");
                }

                return result;
        };

        return VerticalRhythm;
}();

/**
 * Export Vertical Rhythm Class.
 * Export formatValue and formatInt functions.
 */


exports.formatInt = formatInt;
exports.formatValue = formatValue;
exports.VerticalRhythm = VerticalRhythm;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlZlcnRpY2FsUmh5dGhtLmVzNiJdLCJuYW1lcyI6WyJmb3JtYXRWYWx1ZSIsInZhbHVlIiwidG9GaXhlZCIsInJlcGxhY2UiLCJmb3JtYXRJbnQiLCJWZXJ0aWNhbFJoeXRobSIsInNldHRpbmdzIiwiYmFzZUZvbnRTaXplIiwicGFyc2VJbnQiLCJyaHl0aG1Vbml0IiwicHhGYWxsYmFjayIsIm1pbkxpbmVQYWRkaW5nIiwicm91bmRUb0hhbGZMaW5lIiwiYmFzZUxpbmVIZWlnaHQiLCJtYXRjaCIsInBhcnNlRmxvYXQiLCJiYXNlTGluZUhlaWdodFJhdGlvIiwiYmFzZUxlYWRpbmciLCJjb252ZXJ0IiwidmFsdWVVbml0IiwiZm9ybWF0IiwiZnJvbUNvbnRleHQiLCJ0b0NvbnRleHQiLCJweFZhbHVlIiwicmVzdWx0IiwibGluZXMiLCJmb250U2l6ZSIsIk1hdGgiLCJjZWlsIiwibGluZUhlaWdodCIsImZvbnRTaXplVW5pdCIsInRvTG93ZXJDYXNlIiwibGVhZGluZyIsInJlbUZhbGxiYWNrIiwiZm91bmQiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7Ozs7O0FBT0E7Ozs7QUFJQSxTQUFTQSxXQUFULENBQXFCQyxLQUFyQixFQUE0QjtBQUN4QixlQUFPQSxNQUFNQyxPQUFOLENBQWMsQ0FBZCxFQUFpQkMsT0FBakIsQ0FBeUIsTUFBekIsRUFBaUMsRUFBakMsRUFBcUNBLE9BQXJDLENBQTZDLE1BQTdDLEVBQXFELEVBQXJELENBQVA7QUFDSDs7QUFFRDs7Ozs7QUFLQSxTQUFTQyxTQUFULENBQW1CSCxLQUFuQixFQUEwQjtBQUN0QixlQUFPQSxNQUFNQyxPQUFOLENBQWMsQ0FBZCxDQUFQO0FBQ0g7O0FBRUQ7Ozs7OztJQU1NRyxjOztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7QUFlQSxnQ0FBWUMsUUFBWixFQUFzQjtBQUFBOztBQUNsQixxQkFBS0MsWUFBTCxHQUFvQkMsU0FBU0YsU0FBUyxXQUFULENBQVQsQ0FBcEI7QUFDQSxxQkFBS0csVUFBTCxHQUFr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QUFhLGdCQUFiLENBQWhCLEVBQWlEO0FBQzdDVSxpQ0FBU0EsT0FBT3JCLE9BQVAsQ0FBZStCLE1BQU0sQ0FBTixDQUFmLEVBQXlCOUIsVUFBVSxLQUFLYyxPQUFMLENBQWFnQixNQUFNLENBQU4sQ0FBYixFQUF1QixLQUF2QixFQUE4QixJQUE5QixDQUFWLElBQWlELElBQTFFLENBQVQ7QUFDSDs7QUFFRCx1QkFBT1YsTUFBUDtBQUNILFM7Ozs7O0FBR0w7Ozs7OztRQUtJcEIsUyxHQUFBQSxTO1FBQ0FKLFcsR0FBQUEsVztRQUNBSyxjLEdBQUFBLGMiLCJmaWxlIjoiVmVydGljYWxSaHl0aG0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQHZlcnNpb24gMS4wXHJcbiAqIEBhdXRob3IgR3JpZ29yeSBWYXNpbHlldiA8cG9zdGNzcy5oYW1zdGVyQGdtYWlsLmNvbT4gaHR0cHM6Ly9naXRodWIuY29tL2gwdGMwZDNcclxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTcsIEdyaWdvcnkgVmFzaWx5ZXZcclxuICogQGxpY2Vuc2UgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wLCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAgXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEZvcm1hdCBGbG9hdCBWYWx1ZXMuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIGlucHV0IHZhbHVlLlxyXG4gKi9cclxuZnVuY3Rpb24gZm9ybWF0VmFsdWUodmFsdWUpIHtcclxuICAgIHJldHVybiB2YWx1ZS50b0ZpeGVkKDQpLnJlcGxhY2UoLzArJC9nLCBcIlwiKS5yZXBsYWNlKC9cXC4kL2csIFwiXCIpO1xyXG59XHJcblxyXG4vKipcclxuICogRm9ybWF0IE51bWJlciB0byBJbnQuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIGlucHV0IHZhbHVlLlxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIGZvcm1hdEludCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHZhbHVlLnRvRml4ZWQoMCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAbW9kdWxlIFZlcnRpY2FsUmh5dGhtXHJcbiAqIFxyXG4gKiBAZGVzY3JpcHRpb24gVmVydGljYWxSaHl0aG0gQ2xhc3MgZm9yIGNhbGN1bGF0ZSByaHl0aG0gc2l6ZXMgYW5zIGNvbnZlcnQgdW5pdHMuXHJcbiAqL1xyXG5cclxuY2xhc3MgVmVydGljYWxSaHl0aG0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgZm9yIGNsYXNzIFZlcnRpY2FsUmh5dGhtLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlZlcnRpY2FsUmh5dGhtXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBzZXR0aW5ncyAtIHNldHRpbmdzIGhhc2guXHJcbiAgICAgKiBcclxuICAgICAqIDxwPlxyXG4gICAgICogVXNlOlxyXG4gICAgICogc2V0dGluZ3NbXCJmb250LXNpemVcIl0gLSBiYXNlIGZvbnQgc2l6ZSBpbiBwaXhlbHMuXHJcbiAgICAgKiBzZXR0aW5nc1tcInB4LWZhbGxiYWNrXCJdIC0gYm9vbGVhbiBwaXhlbCBmYWxsYmFjay4gQ29udmVydCByZWxhdGl2ZSBzaXplcyB0byBwaXhlbHMuIElmIHJoeXRobSB1bml0IHJlbSB0aGVuIHJlbSB2YWx1ZSBkb3VibGVkIHdpdGggcGl4ZWxzIHZhbHVlcy5cclxuICAgICAqIElmIHJoeXRobSB1bml0IHB4IGFuZCBvcHRpb24gd2lsbCBiZSBzZXQgdGhlbiBpbiBsaW5lIGhlaWdodCB3aWxsIGJlIHBpeGVscyBsaWtlIDI0cHgsIGVsc2UgcmVsYXRpdmUgc2l6ZSBsaWtlIDEuNDUod2l0aG91dCBlbSBvciByZW0pXHJcbiAgICAgKiBzZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdIC0gYmFzZSBsaW5lIGhlaWdodCBpbiBwaXhlbHMgb3IgcmVsYXRpdmUgdmFsdWUod2l0aG91dCBlbSBvciByZW0pLlxyXG4gICAgICogPC9wPlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzZXR0aW5ncykge1xyXG4gICAgICAgIHRoaXMuYmFzZUZvbnRTaXplID0gcGFyc2VJbnQoc2V0dGluZ3NbXCJmb250LXNpemVcIl0pO1xyXG4gICAgICAgIHRoaXMucmh5dGhtVW5pdCA9IHNldHRpbmdzW1widW5pdFwiXTtcclxuICAgICAgICB0aGlzLnB4RmFsbGJhY2sgPSBzZXR0aW5nc1tcInB4LWZhbGxiYWNrXCJdO1xyXG4gICAgICAgIHRoaXMubWluTGluZVBhZGRpbmcgPSBwYXJzZUludChzZXR0aW5nc1tcIm1pbi1saW5lLXBhZGRpbmdcIl0pO1xyXG4gICAgICAgIHRoaXMucm91bmRUb0hhbGZMaW5lID0gc2V0dGluZ3NbXCJyb3VuZC10by1oYWxmLWxpbmVcIl07XHJcblxyXG4gICAgICAgIC8vIEJhc2UgTGluZSBIZWlnaHQgaW4gUGl4ZWxzXHJcbiAgICAgICAgdGhpcy5iYXNlTGluZUhlaWdodCA9IChzZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdLm1hdGNoKC9weCQvaSkpID8gcGFyc2VGbG9hdChzZXR0aW5nc1tcImxpbmUtaGVpZ2h0XCJdKSA6IHBhcnNlRmxvYXQoc2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSkgKiB0aGlzLmJhc2VGb250U2l6ZTtcclxuICAgICAgICB0aGlzLmJhc2VMaW5lSGVpZ2h0UmF0aW8gPSAoc2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXS5tYXRjaCgvcHgkL2kpKSA/IHBhcnNlRmxvYXQoc2V0dGluZ3NbXCJsaW5lLWhlaWdodFwiXSkgLyBwYXJzZUludCh0aGlzLmJhc2VGb250U2l6ZSkgOiBwYXJzZUZsb2F0KHNldHRpbmdzW1wibGluZS1oZWlnaHRcIl0pO1xyXG4gICAgICAgIHRoaXMuYmFzZUxlYWRpbmcgPSB0aGlzLmNvbnZlcnQodGhpcy5iYXNlTGluZUhlaWdodCAtIHRoaXMuYmFzZUZvbnRTaXplLCBcInB4XCIsIHRoaXMucmh5dGhtVW5pdCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb252ZXJ0IHZhbHVlcyBmcm9tIHVuaXQgdG8gdW5pdC5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpWZXJ0aWNhbFJoeXRobVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBpbnB1dCB2YWx1ZVxyXG4gICAgICogQHBhcmFtIHZhbHVlVW5pdCAtIGlucHV0IHZhbHVlIHVuaXRcclxuICAgICAqIEBwYXJhbSBmb3JtYXQgLSBvdXRwdXQgdmFsdWUgdW5pdFxyXG4gICAgICogQHBhcmFtIGZyb21Db250ZXh0IC0gZnJvbSBiYXNlIGZvbnQgc2l6ZVxyXG4gICAgICogQHBhcmFtIHRvQ29udGV4dCAtIHRvIG5ldyBiYXNlIGZvbnQgc2l6ZVxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IC0gb3V0cHV0IHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBjb252ZXJ0KHZhbHVlLCB2YWx1ZVVuaXQsIGZvcm1hdCA9IG51bGwsIGZyb21Db250ZXh0ID0gbnVsbCwgdG9Db250ZXh0ID0gbnVsbCkge1xyXG5cclxuICAgICAgICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG5cclxuICAgICAgICBpZiAoZm9ybWF0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgZm9ybWF0ID0gdGhpcy5yaHl0aG1Vbml0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHZhbHVlVW5pdCA9PSBmb3JtYXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZyb21Db250ZXh0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgZnJvbUNvbnRleHQgPSB0aGlzLmJhc2VGb250U2l6ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmcm9tQ29udGV4dCA9IHBhcnNlRmxvYXQoZnJvbUNvbnRleHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRvQ29udGV4dCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRvQ29udGV4dCA9IGZyb21Db250ZXh0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRvQ29udGV4dCA9IHBhcnNlRmxvYXQodG9Db250ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBweFZhbHVlID0gMDtcclxuXHJcbiAgICAgICAgaWYgKHZhbHVlVW5pdCA9PSBcImVtXCIpIHtcclxuICAgICAgICAgICAgcHhWYWx1ZSA9IHZhbHVlICogZnJvbUNvbnRleHQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVVuaXQgPT0gXCJyZW1cIikge1xyXG4gICAgICAgICAgICBweFZhbHVlID0gdmFsdWUgKiB0aGlzLmJhc2VGb250U2l6ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVW5pdCA9PSBcIiVcIikge1xyXG4gICAgICAgICAgICBweFZhbHVlID0gdmFsdWUgKiBmcm9tQ29udGV4dCAvIDEwMDtcclxuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlVW5pdCA9PSBcImV4XCIpIHtcclxuICAgICAgICAgICAgcHhWYWx1ZSA9IHZhbHVlICogZnJvbUNvbnRleHQgLyAyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHB4VmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQgPSBweFZhbHVlO1xyXG5cclxuICAgICAgICBpZiAoZm9ybWF0ID09IFwiZW1cIikge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBweFZhbHVlIC8gdG9Db250ZXh0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZm9ybWF0ID09IFwicmVtXCIpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcHhWYWx1ZSAvIHRoaXMuYmFzZUZvbnRTaXplO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZm9ybWF0ID09IFwiJVwiKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHB4VmFsdWUgKiAxMDAgLyB0b0NvbnRleHQ7XHJcbiAgICAgICAgfSBlbHNlIGlmIChmb3JtYXQgPT0gXCJleFwiKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHB4VmFsdWUgKiAyIC8gdG9Db250ZXh0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSB0aGUgbWluaW11bSBtdWx0aXBsZSByaHl0aG0gdW5pdHMobGluZXMpIG5lZWRlZCB0byBjb250YWluIHRoZSBmb250LXNpemUuIDEgcmh5dGhtIHVuaXQgPSBiYXNlIGxpbmUgaGVpZ2h0IGluIHBpeGVscy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpWZXJ0aWNhbFJoeXRobVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gZm9udFNpemUgLSBmb250IHNpemUgaW4gcGl4ZWxzLCBlbSwgcmVtIGxpa2UgMS41ZW0uXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gLSBudW1iZXIgb2YgbGluZXMuXHJcbiAgICAgKi9cclxuICAgIGxpbmVzKGZvbnRTaXplKSB7XHJcblxyXG4gICAgICAgIGZvbnRTaXplID0gcGFyc2VGbG9hdChmb250U2l6ZSk7XHJcblxyXG4gICAgICAgIGxldCBsaW5lcyA9IDA7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJoeXRobVVuaXQgPT0gXCJweFwiKSB7XHJcblxyXG4gICAgICAgICAgICBsaW5lcyA9ICh0aGlzLnJvdW5kVG9IYWxmTGluZSA9PSBcInRydWVcIikgPyBNYXRoLmNlaWwoMiAqIGZvbnRTaXplIC8gdGhpcy5iYXNlTGluZUhlaWdodCkgLyAyIDogTWF0aC5jZWlsKGZvbnRTaXplIC8gdGhpcy5iYXNlTGluZUhlaWdodCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5yaHl0aG1Vbml0ID09IFwiZW1cIiB8fCB0aGlzLnJoeXRobVVuaXQgPT0gXCJyZW1cIikge1xyXG5cclxuICAgICAgICAgICAgbGluZXMgPSAodGhpcy5yb3VuZFRvSGFsZkxpbmUgPT0gXCJ0cnVlXCIpID8gTWF0aC5jZWlsKDIgKiBmb250U2l6ZSAvIHRoaXMuYmFzZUxpbmVIZWlnaHRSYXRpbykgLyAyIDogTWF0aC5jZWlsKGZvbnRTaXplIC8gdGhpcy5iYXNlTGluZUhlaWdodFJhdGlvKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vSWYgbGluZXMgYXJlIGNyYW1wZWQgaW5jbHVkZSBzb21lIGV4dHJhIGxlYWQuXHJcbiAgICAgICAgaWYgKChsaW5lcyAqIHRoaXMuYmFzZUxpbmVIZWlnaHQgLSBmb250U2l6ZSkgPCAodGhpcy5taW5MaW5lUGFkZGluZyAqIDIpKXtcclxuICAgICAgICAgICAgbGluZXMgPSAodGhpcy5yb3VuZFRvSGFsZkxpbmUpID8gbGluZXMgKyAwLjUgOiBsaW5lcyArIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbGluZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgbGluZSBoZWlnaHQgdmFsdWUgaW4gcmh5dGhtIHVuaXRzIGZvciBmb250IHNpemUuIEdlbmVyYXRlIGxpbmUgaGVpZ2h0IGZyb20gZm9udCBzaXplIG9yIGlucHV0IGxpbmVzLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlZlcnRpY2FsUmh5dGhtXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBmb250U2l6ZSAtIGZvbnQgc2l6ZSBpbiBwaXhlbHMsIGVtLCByZW0gbGlrZSAxLjVlbS5cclxuICAgICAqIEBwYXJhbSB2YWx1ZSAtIGlucHV0IGxpbmVzLCBiZWZvcmUgb3V0cHV0IDEgbGluZSBoZWlnaHQgd2lsbCBiZSBtdWx0aXBseSB3aXRoIHZhbHVlLlxyXG4gICAgICogQHBhcmFtIGJhc2VGb250U2l6ZSAtIGJhc2UgZm9udCBzaXplIGZvciBjYWxjdWxhdGlvbiByZWxhdGl2ZSBzaXplcyBmb3IgcHggb3IgZW0uXHJcbiAgICAgKiBAcGFyYW0gcHhGYWxsYmFjayAtIGJvb2xlYW4gcGl4ZWwgZmFsbGJhY2sgb3B0aW9uLiBJZ25vcmUgc2V0dGluZ3NbXCJweC1mYWxsYmFja1wiXSBvcHRpb24uIENvbnZlcnQgcmVsYXRpdmUgc2l6ZXMgdG8gcGl4ZWxzLiBJZiByaHl0aG0gdW5pdCByZW0gdGhlbiByZW0gdmFsdWUgZG91YmxlZCB3aXRoIHBpeGVscyB2YWx1ZXMuXHJcbiAgICAgKiBJZiByaHl0aG0gdW5pdCBweCBhbmQgb3B0aW9uIHdpbGwgYmUgc2V0IHRoZW4gaW4gbGluZSBoZWlnaHQgd2lsbCBiZSBwaXhlbHMgbGlrZSAyNHB4LCBlbHNlIHJlbGF0aXZlIHNpemUgbGlrZSAxLjQ1KHdpdGhvdXQgZW0gb3IgcmVtKS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfSAtIGxpbmUgaGVpZ2h0IGluIHJoeXRobSB1bml0LlxyXG4gICAgICovXHJcbiAgICBsaW5lSGVpZ2h0KGZvbnRTaXplLCB2YWx1ZSwgYmFzZUZvbnRTaXplID0gbnVsbCwgcHhGYWxsYmFjayA9IGZhbHNlKSB7XHJcblxyXG4gICAgICAgIGlmIChmb250U2l6ZSAhPSBudWxsICYmICh0aGlzLnJoeXRobVVuaXQgPT0gXCJlbVwiIHx8IHZhbHVlID09IG51bGwpKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZm9udFNpemVVbml0ID0gZm9udFNpemUubWF0Y2goLyhweHxlbXxyZW0pJC9pKVswXS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZvbnRTaXplVW5pdCAhPSB0aGlzLnJoeXRobVVuaXQgfHwgYmFzZUZvbnRTaXplICE9IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZSA9IChiYXNlRm9udFNpemUgIT0gbnVsbCkgPyB0aGlzLmNvbnZlcnQoZm9udFNpemUsIGZvbnRTaXplVW5pdCwgdGhpcy5yaHl0aG1Vbml0LCBiYXNlRm9udFNpemUpIDogdGhpcy5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIHRoaXMucmh5dGhtVW5pdCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvbnRTaXplID0gcGFyc2VGbG9hdChmb250U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YWx1ZSA9ICh2YWx1ZSAhPSBudWxsKSA/IHBhcnNlRmxvYXQodmFsdWUpIDogdGhpcy5saW5lcyhmb250U2l6ZSk7XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQgPSAwO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yaHl0aG1Vbml0ID09IFwicHhcIikge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gKGZvbnRTaXplICE9IG51bGwgJiYgdGhpcy5weEZhbGxiYWNrICE9IFwidHJ1ZVwiICYmICFweEZhbGxiYWNrKSA/IGZvcm1hdFZhbHVlKHRoaXMuYmFzZUxpbmVIZWlnaHQgLyBmb250U2l6ZSkgOiBmb3JtYXRJbnQodGhpcy5iYXNlTGluZUhlaWdodCAqIHZhbHVlKSArIFwicHhcIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJoeXRobVVuaXQgPT0gXCJlbVwiKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRWYWx1ZSh2YWx1ZSAqIHRoaXMuYmFzZUxpbmVIZWlnaHRSYXRpbyAvIGZvbnRTaXplKSArIFwiZW1cIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJoeXRobVVuaXQgPT0gXCJyZW1cIikge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gZm9ybWF0VmFsdWUodmFsdWUgKiB0aGlzLmJhc2VMaW5lSGVpZ2h0UmF0aW8pICsgXCJyZW1cIjtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSBsZWFkaW5nIHZhbHVlIGluIHJoeXRobSB1bml0XHJcbiAgICAgKlxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpWZXJ0aWNhbFJoeXRobVxyXG4gICAgICogXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIDEgbGVhZGluZyhpbiBwaXhlbHMpID0gYmFzZSBsaW5lIGhlaWdodChpbiBwaXhlbHMpIC0gYmFzZSBmb250IHNpemUoaW4gcGl4ZWxzKS5cclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHZhbHVlIC0gaW5wdXQgbGluZXMsIGJlZm9yZSBvdXRwdXQgMSBsaW5lIGhlaWdodCB3aWxsIGJlIG11bHRpcGx5IHdpdGggdmFsdWUuXHJcbiAgICAgKiBAcGFyYW0gZm9udFNpemUgLSBmb250IHNpemUgaW4gcGl4ZWxzLCBlbSwgcmVtIGxpa2UgMS41ZW0uXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gLSBsZWFkaW5nIGluIHJoeXRobSB1bml0LlxyXG4gICAgICovXHJcbiAgICBsZWFkaW5nKHZhbHVlLCBmb250U2l6ZSA9IG51bGwpIHtcclxuXHJcbiAgICAgICAgbGV0IGZvbnRTaXplVW5pdCA9IGZvbnRTaXplLm1hdGNoKC8ocHh8ZW18cmVtKSQvaSlbMF0udG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgaWYgKGZvbnRTaXplVW5pdCAhPSB0aGlzLnJoeXRobVVuaXQpIHtcclxuXHJcbiAgICAgICAgICAgIGZvbnRTaXplID0gdGhpcy5jb252ZXJ0KGZvbnRTaXplLCBmb250U2l6ZVVuaXQsIHRoaXMucmh5dGhtVW5pdCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBmb250U2l6ZSA9IHBhcnNlRmxvYXQoZm9udFNpemUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGxpbmVzID0gdGhpcy5saW5lcyhmb250U2l6ZSksXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IDA7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJoeXRobVVuaXQgPT0gXCJweFwiKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRJbnQoKGxpbmVzICogdGhpcy5iYXNlTGluZUhlaWdodCAtIGZvbnRTaXplKSAqIHZhbHVlKSArIFwicHhcIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJoeXRobVVuaXQgPT0gXCJlbVwiKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmb3JtYXRWYWx1ZSgodGhpcy5iYXNlTGluZUhlaWdodFJhdGlvICogbGluZXMgLSBmb250U2l6ZSkgKiB2YWx1ZSAvIGZvbnRTaXplKSArIFwiZW1cIjtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJoeXRobVVuaXQgPT0gXCJyZW1cIikge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gZm9ybWF0VmFsdWUoKGxpbmVzICogdGhpcy5iYXNlTGluZUhlaWdodFJhdGlvIC0gZm9udFNpemUpICogdmFsdWUpICsgXCJyZW1cIjtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgcmVtIHRvIHBpeGVsIHZhbHVlLlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBpbnB1dCB2YWx1ZSBpbiByZW0uXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm4ge251bWJlcn0gLSBvdXRwdXQgdmFsdWUgaW4gcGl4ZWxzLlxyXG4gICAgICovXHJcbiAgICByZW1GYWxsYmFjayh2YWx1ZSkge1xyXG5cclxuICAgICAgICBsZXQgcmVzdWx0ID0gdmFsdWU7XHJcbiAgICAgICAgbGV0IGZvdW5kID0gbnVsbDtcclxuXHJcbiAgICAgICAgd2hpbGUgKChmb3VuZCA9IHJlc3VsdC5tYXRjaCgvKFswLTlcXC5dKylyZW0vaSkpKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKGZvdW5kWzBdLCBmb3JtYXRJbnQodGhpcy5jb252ZXJ0KGZvdW5kWzFdLCBcInJlbVwiLCBcInB4XCIpKSArIFwicHhcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogRXhwb3J0IFZlcnRpY2FsIFJoeXRobSBDbGFzcy5cclxuICogRXhwb3J0IGZvcm1hdFZhbHVlIGFuZCBmb3JtYXRJbnQgZnVuY3Rpb25zLlxyXG4gKi9cclxuZXhwb3J0IHtcclxuICAgIGZvcm1hdEludCxcclxuICAgIGZvcm1hdFZhbHVlLFxyXG4gICAgVmVydGljYWxSaHl0aG1cclxufTsiXX0=
