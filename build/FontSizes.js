"use strict";

exports.__esModule = true;

var _Helpers = require("./Helpers");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @module FontSizes
 * 
 * @description Font size collection manager and generator proportional fonts sizes with aliases.
 *
 * @version 1.0
 * @author Grigory Vasilyev <postcss.hamster@gmail.com> https://github.com/h0tc0d3
 * @copyright Copyright (c) 2017, Grigory Vasilyev
 * @license Apache License, Version 2.0, http://www.apache.org/licenses/LICENSE-2.0 
 * 
 */
var FontSizes = function () {
    /**
     * Constructor for font size collection manager.
     * 
     * @memberOf module:FontSizes
     * 
     * @param settings - settings.
     * 
     * Use settings.fontRatio"] - font scale ratio and settings.fontSize - base font size(will be 0 size).
     * All sizes will be generated from base font size * ratio.
     */
    function FontSizes(settings) {
        _classCallCheck(this, FontSizes);

        var fontRatio = {
            "golden": {
                "desc": "1:1.618",
                "value": 1.618
            },
            "doubleOctave": {
                "desc": "1:4",
                "value": 4
            },
            "majorTwelfth": {
                "desc": "1:3",
                "value": 3
            },
            "majorEleventh": {
                "desc": "3:8",
                "value": 2.667
            },
            "majorTenth": {
                "desc": "2:5",
                "value": 2.5
            },
            "octave": {
                "desc": "1:2",
                "value": 2
            },
            "majorSeventh": {
                "desc": "8:15",
                "value": 1.875
            },
            "minorSeventh": {
                "desc": "9:16",
                "value": 1.778
            },
            "majorSixth": {
                "desc": "3:5",
                "value": 1.667
            },
            "minorSixth": {
                "desc": "5:8",
                "value": 1.6
            },
            "perfectFifth": {
                "desc": "2:3",
                "value": 1.5
            },
            "augmentedFourth": {
                "desc": "1:√2",
                "value": 1.414
            },
            "perfectFourth": {
                "desc": "3:4",
                "value": 1.333
            },
            "majorThird": {
                "desc": "4:5",
                "value": 1.25
            },
            "minorThird": {
                "desc": "5:6",
                "value": 1.2
            },
            "majorSecond": {
                "desc": "8:9",
                "value": 1.125
            },
            "minorSecond": {
                "desc": "15:16",
                "value": 1.067
            }
        };

        this.aliases = {
            "tiny": "-2",
            "t": "-2",
            "small": "-1",
            "s": "-1",
            "base": "0",
            "b": "0",
            "medium": "1",
            "m": "1",
            "large": "2",
            "l": "2",
            "xlarge": "3",
            "xl": "3",
            "xxlarge": "4",
            "xxl": "4",
            "xxxlarge": "5",
            "xxxl": "5",
            //Double scaled sizes
            "tiny1": "-21",
            "t1": "-21",
            "small1": "-11",
            "s1": "-11",
            "base1": "01",
            "b1": "01",
            "medium1": "11",
            "m1": "11",
            "large1": "21",
            "l1": "21",
            "xlarge1": "31",
            "xl1": "31",
            "xxlarge1": "41",
            "xxl1": "41",
            "xxxlarge1": "51",
            "xxxl1": "51",
            //Double divided sizes
            "tiny2": "-22",
            "t2": "-22",
            "small2": "-12",
            "s2": "-12",
            "base2": "02",
            "b2": "02",
            "medium2": "12",
            "m2": "12",
            "large2": "22",
            "l2": "22",
            "xlarge2": "32",
            "xl2": "32",
            "xxlarge2": "42",
            "xxl2": "42",
            "xxxlarge2": "52",
            "xxxl2": "52"
        };

        if ((0, _Helpers.hasNumber)(settings.fontRatio)) {
            this.ratio = parseFloat(settings.fontRatio);
            this.desc = "Custom font ratio";
        } else {
            var fr = (0, _Helpers.toCamelCase)(settings.fontRatio);
            this.ratio = fontRatio[fr].value;
            this.desc = fontRatio[fr].desc;
        }

        // BaseFontSize
        this.baseSize = settings.fontSize;

        // making fontsize collection
        if (this.ratio > 0 && this.baseSize > 0) {
            // font Collection
            this.fontSizes = {};
            for (var i = -2; i <= 5; i++) {
                // Make size from -2 to 5
                this.fontSizes[i] = this.genSize(i);
                // Make double size from -2 to 5
                this.fontSizes[i + "1"] = this.genSize(i, 2);
                // Make double divided size from -2 to 5
                this.fontSizes[i + "2"] = this.genSize(i, 0.5);
            }
        }
        //console.log(JSON.stringify(this.fontSizes, null, 2));
    }

    /**
     * Generate font sizes for relative proportional size.
     * 
     * @memberOf module:FontSizes
     * 
     * @param {number} size - Proportional size like -2, 0, 1, 3 etc.
     * @param {number} scale - scale base font size.
     * 
     * @returns {{}} - HashMap. px: value in pixels, rel: relative value
     */


    FontSizes.prototype.genSize = function genSize(size) {
        var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;


        var value = { px: 0, rel: 0 };

        var baseFontSize = this.baseSize;

        if (scale > 0) {
            baseFontSize = baseFontSize * scale;
        }

        if (!this.ratio || !baseFontSize) {
            return value;
        }

        if (size >= 0) {

            value.rel = Math.pow(this.ratio, size);
            value.px = baseFontSize * value.rel;
        } else {

            value.rel = 1 / Math.pow(this.ratio, Math.abs(size));
            value.px = baseFontSize * value.rel;
        }

        if (scale > 0) {
            value.rel = value.rel * scale;
        }

        return value;
    };

    /**
     * Get font size by name.
     * 
     * @memberOf module:FontSizes
     * 
     * @param {string} size - font size name.
     * 
     * @returns {{}} - HashMap. px: value in pixels, rel: relative value
     */


    FontSizes.prototype.getSize = function getSize(size) {

        // Check size is alias?
        size = size.replace("@d2", "2");
        size = size.replace("@x2", "1");

        if (size in this.aliases) {
            size = this.aliases[size];
        }

        var result = 0;

        if (size in this.fontSizes) {
            result = this.fontSizes[size];
        } else {
            if (size.match(/^\-*[0-9]+$/)) {
                result = this.genSize(size);
            }
        }
        //console.log(size + ": " + JSON.stringify(result, null , 2) + " " + (size in this.fontSizes).toString());
        return result;
    };

    /**
     * Set font size to name.
     * 
     * @memberOf module:FontSizes
     * 
     * @param {string} size - font size name.
     * @param value - HashMap. px: value in pixels, rel: relative value
     */


    FontSizes.prototype.setSize = function setSize(size, value) {
        size = size.replace("@d2", "2");
        size = size.replace("@x2", "1");
        // Check size is alias?
        if (size in this.aliases) {
            size = this.aliases[size];
        }
        this.fontSizes[size] = value;
    };

    /**
     * Add Font Sizes to Font Size Collection.
     * 
     * @memberOf module:FontSizes
     * 
     * @param {string} sizes - string like "name1 21px 1.5, name2 18px, name3 1.5". format: name pixelSize relativeSize.
     * Separator for font sizes is ",".
     * If pixel or relative size it's present then it can be generated.
     * @param rhythmCalculator - instance of VerticalRhythm Class.
     */


    FontSizes.prototype.addFontSizes = function addFontSizes(sizes, rhythmCalculator) {

        var fontSizes = sizes.split(/\s*\,\s*/);
        for (var i = 0, len = fontSizes.length; i < len; i++) {
            var fontSizeInfo = fontSizes[i].split(/\s+/);
            if (fontSizeInfo.length >= 2) {
                var fontSize = { px: 0, rel: 0 };
                if ((0, _Helpers.isHas)(fontSizeInfo[1], "px")) {
                    fontSize.rel = fontSizeInfo.length == 2 ? rhythmCalculator.convert(fontSizeInfo[1], _Helpers.UNIT.EM) : fontSizeInfo[2];
                    fontSize.px = parseInt(fontSizeInfo[1]);
                } else {
                    fontSize.rel = parseFloat(fontSizeInfo[1]);
                    fontSize.px = rhythmCalculator.convert(fontSizeInfo[1], _Helpers.UNIT.PX);
                }
                this.setSize(fontSizeInfo[0], fontSize);
            }
        }
    };

    return FontSizes;
}();
/**
 * Export FontSizes Class.
 */


exports.default = FontSizes;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZvbnRTaXplcy5lczYiXSwibmFtZXMiOlsiRm9udFNpemVzIiwic2V0dGluZ3MiLCJmb250UmF0aW8iLCJhbGlhc2VzIiwicmF0aW8iLCJwYXJzZUZsb2F0IiwiZGVzYyIsImZyIiwidmFsdWUiLCJiYXNlU2l6ZSIsImZvbnRTaXplIiwiZm9udFNpemVzIiwiaSIsImdlblNpemUiLCJzaXplIiwic2NhbGUiLCJweCIsInJlbCIsImJhc2VGb250U2l6ZSIsIk1hdGgiLCJwb3ciLCJhYnMiLCJnZXRTaXplIiwicmVwbGFjZSIsInJlc3VsdCIsIm1hdGNoIiwic2V0U2l6ZSIsImFkZEZvbnRTaXplcyIsInNpemVzIiwicmh5dGhtQ2FsY3VsYXRvciIsInNwbGl0IiwibGVuIiwibGVuZ3RoIiwiZm9udFNpemVJbmZvIiwiY29udmVydCIsIkVNIiwicGFyc2VJbnQiLCJQWCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7O0FBT0E7Ozs7Ozs7Ozs7O0lBV01BLFM7QUFDRjs7Ozs7Ozs7OztBQVVBLHVCQUFZQyxRQUFaLEVBQXNCO0FBQUE7O0FBRWxCLFlBQUlDLFlBQVk7QUFDWixzQkFBVTtBQUNOLHdCQUFRLFNBREY7QUFFTix5QkFBUztBQUZILGFBREU7QUFLWiw0QkFBZ0I7QUFDWix3QkFBUSxLQURJO0FBRVoseUJBQVM7QUFGRyxhQUxKO0FBU1osNEJBQWdCO0FBQ1osd0JBQVEsS0FESTtBQUVaLHlCQUFTO0FBRkcsYUFUSjtBQWFaLDZCQUFpQjtBQUNiLHdCQUFRLEtBREs7QUFFYix5QkFBUztBQUZJLGFBYkw7QUFpQlosMEJBQWM7QUFDVix3QkFBUSxLQURFO0FBRVYseUJBQVM7QUFGQyxhQWpCRjtBQXFCWixzQkFBVTtBQUNOLHdCQUFRLEtBREY7QUFFTix5QkFBUztBQUZILGFBckJFO0FBeUJaLDRCQUFnQjtBQUNaLHdCQUFRLE1BREk7QUFFWix5QkFBUztBQUZHLGFBekJKO0FBNkJaLDRCQUFnQjtBQUNaLHdCQUFRLE1BREk7QUFFWix5QkFBUztBQUZH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Q0FBaEI7QUFDQSxhQUFJLElBQUlsQixJQUFJLENBQVIsRUFBV21CLE1BQU1wQixVQUFVcUIsTUFBL0IsRUFBdUNwQixJQUFJbUIsR0FBM0MsRUFBZ0RuQixHQUFoRCxFQUFvRDtBQUNoRCxnQkFBSXFCLGVBQWV0QixVQUFVQyxDQUFWLEVBQWFrQixLQUFiLENBQW1CLEtBQW5CLENBQW5CO0FBQ0EsZ0JBQUlHLGFBQWFELE1BQWIsSUFBdUIsQ0FBM0IsRUFBOEI7QUFDMUIsb0JBQUl0QixXQUFXLEVBQUNNLElBQUksQ0FBTCxFQUFRQyxLQUFLLENBQWIsRUFBZjtBQUNBLG9CQUFJLG9CQUFNZ0IsYUFBYSxDQUFiLENBQU4sRUFBdUIsSUFBdkIsQ0FBSixFQUFrQztBQUM5QnZCLDZCQUFTTyxHQUFULEdBQWdCZ0IsYUFBYUQsTUFBYixJQUF1QixDQUF4QixHQUE2QkgsaUJBQWlCSyxPQUFqQixDQUF5QkQsYUFBYSxDQUFiLENBQXpCLEVBQTBDLGNBQUtFLEVBQS9DLENBQTdCLEdBQWtGRixhQUFhLENBQWIsQ0FBakc7QUFDQXZCLDZCQUFTTSxFQUFULEdBQWNvQixTQUFTSCxhQUFhLENBQWIsQ0FBVCxDQUFkO0FBQ0gsaUJBSEQsTUFHTztBQUNIdkIsNkJBQVNPLEdBQVQsR0FBZVosV0FBVzRCLGFBQWEsQ0FBYixDQUFYLENBQWY7QUFDQXZCLDZCQUFTTSxFQUFULEdBQWNhLGlCQUFpQkssT0FBakIsQ0FBeUJELGFBQWEsQ0FBYixDQUF6QixFQUEwQyxjQUFLSSxFQUEvQyxDQUFkO0FBQ0g7QUFDRCxxQkFBS1gsT0FBTCxDQUFhTyxhQUFhLENBQWIsQ0FBYixFQUE4QnZCLFFBQTlCO0FBQ0g7QUFDSjtBQUNKLEs7Ozs7QUFHTDs7Ozs7a0JBR2VWLFMiLCJmaWxlIjoiRm9udFNpemVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICAgIGlzSGFzLFxyXG4gICAgdG9DYW1lbENhc2UsXHJcbiAgICBoYXNOdW1iZXIsXHJcbiAgICBVTklUXHJcbn0gZnJvbSBcIi4vSGVscGVyc1wiO1xyXG5cclxuLyoqXHJcbiAqIEBtb2R1bGUgRm9udFNpemVzXHJcbiAqIFxyXG4gKiBAZGVzY3JpcHRpb24gRm9udCBzaXplIGNvbGxlY3Rpb24gbWFuYWdlciBhbmQgZ2VuZXJhdG9yIHByb3BvcnRpb25hbCBmb250cyBzaXplcyB3aXRoIGFsaWFzZXMuXHJcbiAqXHJcbiAqIEB2ZXJzaW9uIDEuMFxyXG4gKiBAYXV0aG9yIEdyaWdvcnkgVmFzaWx5ZXYgPHBvc3Rjc3MuaGFtc3RlckBnbWFpbC5jb20+IGh0dHBzOi8vZ2l0aHViLmNvbS9oMHRjMGQzXHJcbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE3LCBHcmlnb3J5IFZhc2lseWV2XHJcbiAqIEBsaWNlbnNlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCwgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wIFxyXG4gKiBcclxuICovXHJcbmNsYXNzIEZvbnRTaXplcyB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yIGZvciBmb250IHNpemUgY29sbGVjdGlvbiBtYW5hZ2VyLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOkZvbnRTaXplc1xyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gc2V0dGluZ3MgLSBzZXR0aW5ncy5cclxuICAgICAqIFxyXG4gICAgICogVXNlIHNldHRpbmdzLmZvbnRSYXRpb1wiXSAtIGZvbnQgc2NhbGUgcmF0aW8gYW5kIHNldHRpbmdzLmZvbnRTaXplIC0gYmFzZSBmb250IHNpemUod2lsbCBiZSAwIHNpemUpLlxyXG4gICAgICogQWxsIHNpemVzIHdpbGwgYmUgZ2VuZXJhdGVkIGZyb20gYmFzZSBmb250IHNpemUgKiByYXRpby5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Ioc2V0dGluZ3MpIHtcclxuXHJcbiAgICAgICAgbGV0IGZvbnRSYXRpbyA9IHtcclxuICAgICAgICAgICAgXCJnb2xkZW5cIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMToxLjYxOFwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjYxOFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImRvdWJsZU9jdGF2ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIxOjRcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogNFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1ham9yVHdlbGZ0aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIxOjNcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogM1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1ham9yRWxldmVudGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMzo4XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDIuNjY3XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3JUZW50aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIyOjVcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMi41XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwib2N0YXZlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjE6MlwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAyXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3JTZXZlbnRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjg6MTVcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS44NzVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtaW5vclNldmVudGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiOToxNlwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjc3OFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1ham9yU2l4dGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMzo1XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNjY3XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWlub3JTaXh0aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCI1OjhcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS42XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwicGVyZmVjdEZpZnRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjI6M1wiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJhdWdtZW50ZWRGb3VydGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMTriiJoyXCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNDE0XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwicGVyZmVjdEZvdXJ0aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIzOjRcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS4zMzNcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtYWpvclRoaXJkXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjQ6NVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjI1XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWlub3JUaGlyZFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCI1OjZcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS4yXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3JTZWNvbmRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiODo5XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuMTI1XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWlub3JTZWNvbmRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMTU6MTZcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS4wNjdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWxpYXNlcyA9IHtcclxuICAgICAgICAgICAgXCJ0aW55XCI6IFwiLTJcIixcclxuICAgICAgICAgICAgXCJ0XCI6IFwiLTJcIixcclxuICAgICAgICAgICAgXCJzbWFsbFwiOiBcIi0xXCIsXHJcbiAgICAgICAgICAgIFwic1wiOiBcIi0xXCIsXHJcbiAgICAgICAgICAgIFwiYmFzZVwiOiBcIjBcIixcclxuICAgICAgICAgICAgXCJiXCI6IFwiMFwiLFxyXG4gICAgICAgICAgICBcIm1lZGl1bVwiOiBcIjFcIixcclxuICAgICAgICAgICAgXCJtXCI6IFwiMVwiLFxyXG4gICAgICAgICAgICBcImxhcmdlXCI6IFwiMlwiLFxyXG4gICAgICAgICAgICBcImxcIjogXCIyXCIsXHJcbiAgICAgICAgICAgIFwieGxhcmdlXCI6IFwiM1wiLFxyXG4gICAgICAgICAgICBcInhsXCI6IFwiM1wiLFxyXG4gICAgICAgICAgICBcInh4bGFyZ2VcIjogXCI0XCIsXHJcbiAgICAgICAgICAgIFwieHhsXCI6IFwiNFwiLFxyXG4gICAgICAgICAgICBcInh4eGxhcmdlXCI6IFwiNVwiLFxyXG4gICAgICAgICAgICBcInh4eGxcIjogXCI1XCIsXHJcbiAgICAgICAgICAgIC8vRG91YmxlIHNjYWxlZCBzaXplc1xyXG4gICAgICAgICAgICBcInRpbnkxXCI6IFwiLTIxXCIsXHJcbiAgICAgICAgICAgIFwidDFcIjogXCItMjFcIixcclxuICAgICAgICAgICAgXCJzbWFsbDFcIjogXCItMTFcIixcclxuICAgICAgICAgICAgXCJzMVwiOiBcIi0xMVwiLFxyXG4gICAgICAgICAgICBcImJhc2UxXCI6IFwiMDFcIixcclxuICAgICAgICAgICAgXCJiMVwiOiBcIjAxXCIsXHJcbiAgICAgICAgICAgIFwibWVkaXVtMVwiOiBcIjExXCIsXHJcbiAgICAgICAgICAgIFwibTFcIjogXCIxMVwiLFxyXG4gICAgICAgICAgICBcImxhcmdlMVwiOiBcIjIxXCIsXHJcbiAgICAgICAgICAgIFwibDFcIjogXCIyMVwiLFxyXG4gICAgICAgICAgICBcInhsYXJnZTFcIjogXCIzMVwiLFxyXG4gICAgICAgICAgICBcInhsMVwiOiBcIjMxXCIsXHJcbiAgICAgICAgICAgIFwieHhsYXJnZTFcIjogXCI0MVwiLFxyXG4gICAgICAgICAgICBcInh4bDFcIjogXCI0MVwiLFxyXG4gICAgICAgICAgICBcInh4eGxhcmdlMVwiOiBcIjUxXCIsXHJcbiAgICAgICAgICAgIFwieHh4bDFcIjogXCI1MVwiLFxyXG4gICAgICAgICAgICAvL0RvdWJsZSBkaXZpZGVkIHNpemVzXHJcbiAgICAgICAgICAgIFwidGlueTJcIjogXCItMjJcIixcclxuICAgICAgICAgICAgXCJ0MlwiOiBcIi0yMlwiLFxyXG4gICAgICAgICAgICBcInNtYWxsMlwiOiBcIi0xMlwiLFxyXG4gICAgICAgICAgICBcInMyXCI6IFwiLTEyXCIsXHJcbiAgICAgICAgICAgIFwiYmFzZTJcIjogXCIwMlwiLFxyXG4gICAgICAgICAgICBcImIyXCI6IFwiMDJcIixcclxuICAgICAgICAgICAgXCJtZWRpdW0yXCI6IFwiMTJcIixcclxuICAgICAgICAgICAgXCJtMlwiOiBcIjEyXCIsXHJcbiAgICAgICAgICAgIFwibGFyZ2UyXCI6IFwiMjJcIixcclxuICAgICAgICAgICAgXCJsMlwiOiBcIjIyXCIsXHJcbiAgICAgICAgICAgIFwieGxhcmdlMlwiOiBcIjMyXCIsXHJcbiAgICAgICAgICAgIFwieGwyXCI6IFwiMzJcIixcclxuICAgICAgICAgICAgXCJ4eGxhcmdlMlwiOiBcIjQyXCIsXHJcbiAgICAgICAgICAgIFwieHhsMlwiOiBcIjQyXCIsXHJcbiAgICAgICAgICAgIFwieHh4bGFyZ2UyXCI6IFwiNTJcIixcclxuICAgICAgICAgICAgXCJ4eHhsMlwiOiBcIjUyXCJcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZihoYXNOdW1iZXIoc2V0dGluZ3MuZm9udFJhdGlvKSl7XHJcbiAgICAgICAgICAgIHRoaXMucmF0aW8gPSBwYXJzZUZsb2F0KHNldHRpbmdzLmZvbnRSYXRpbyk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzYyA9IFwiQ3VzdG9tIGZvbnQgcmF0aW9cIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgZnIgPSB0b0NhbWVsQ2FzZShzZXR0aW5ncy5mb250UmF0aW8pO1xyXG4gICAgICAgICAgICB0aGlzLnJhdGlvID0gZm9udFJhdGlvW2ZyXS52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5kZXNjID0gZm9udFJhdGlvW2ZyXS5kZXNjO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIEJhc2VGb250U2l6ZVxyXG4gICAgICAgIHRoaXMuYmFzZVNpemUgPSBzZXR0aW5ncy5mb250U2l6ZTtcclxuXHJcbiAgICAgICAgLy8gbWFraW5nIGZvbnRzaXplIGNvbGxlY3Rpb25cclxuICAgICAgICBpZiAodGhpcy5yYXRpbyA+IDAgJiYgdGhpcy5iYXNlU2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgLy8gZm9udCBDb2xsZWN0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuZm9udFNpemVzID0ge307XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAtMjsgaSA8PSA1OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIC8vIE1ha2Ugc2l6ZSBmcm9tIC0yIHRvIDVcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9udFNpemVzW2ldID0gdGhpcy5nZW5TaXplKGkpO1xyXG4gICAgICAgICAgICAgICAgLy8gTWFrZSBkb3VibGUgc2l6ZSBmcm9tIC0yIHRvIDVcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9udFNpemVzW2kgKyBcIjFcIl0gPSB0aGlzLmdlblNpemUoaSwgMik7XHJcbiAgICAgICAgICAgICAgICAvLyBNYWtlIGRvdWJsZSBkaXZpZGVkIHNpemUgZnJvbSAtMiB0byA1XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvbnRTaXplc1tpICsgXCIyXCJdID0gdGhpcy5nZW5TaXplKGksIDAuNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh0aGlzLmZvbnRTaXplcywgbnVsbCwgMikpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgZm9udCBzaXplcyBmb3IgcmVsYXRpdmUgcHJvcG9ydGlvbmFsIHNpemUuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIC0gUHJvcG9ydGlvbmFsIHNpemUgbGlrZSAtMiwgMCwgMSwgMyBldGMuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NhbGUgLSBzY2FsZSBiYXNlIGZvbnQgc2l6ZS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge3t9fSAtIEhhc2hNYXAuIHB4OiB2YWx1ZSBpbiBwaXhlbHMsIHJlbDogcmVsYXRpdmUgdmFsdWVcclxuICAgICAqL1xyXG4gICAgZ2VuU2l6ZShzaXplLCBzY2FsZSA9IDApIHtcclxuXHJcbiAgICAgICAgbGV0IHZhbHVlID0gIHtweDogMCwgcmVsOiAwfTtcclxuXHJcbiAgICAgICAgbGV0IGJhc2VGb250U2l6ZSA9IHRoaXMuYmFzZVNpemU7XHJcblxyXG4gICAgICAgIGlmIChzY2FsZSA+IDApIHtcclxuICAgICAgICAgICAgYmFzZUZvbnRTaXplID0gYmFzZUZvbnRTaXplICogc2NhbGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMucmF0aW8gfHwgIWJhc2VGb250U2l6ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc2l6ZSA+PSAwKSB7XHJcblxyXG4gICAgICAgICAgICB2YWx1ZS5yZWwgPSBNYXRoLnBvdyh0aGlzLnJhdGlvLCBzaXplKTtcclxuICAgICAgICAgICAgdmFsdWUucHggPSBiYXNlRm9udFNpemUgKiB2YWx1ZS5yZWw7XHJcblxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgdmFsdWUucmVsID0gMSAvIE1hdGgucG93KHRoaXMucmF0aW8sIE1hdGguYWJzKHNpemUpKTtcclxuICAgICAgICAgICAgdmFsdWUucHggPSBiYXNlRm9udFNpemUgKiB2YWx1ZS5yZWw7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNjYWxlID4gMCkge1xyXG4gICAgICAgICAgICB2YWx1ZS5yZWwgPSB2YWx1ZS5yZWwgKiBzY2FsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgZm9udCBzaXplIGJ5IG5hbWUuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaXplIC0gZm9udCBzaXplIG5hbWUuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHt7fX0gLSBIYXNoTWFwLiBweDogdmFsdWUgaW4gcGl4ZWxzLCByZWw6IHJlbGF0aXZlIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIGdldFNpemUoc2l6ZSkge1xyXG5cclxuICAgICAgICAvLyBDaGVjayBzaXplIGlzIGFsaWFzP1xyXG4gICAgICAgIHNpemUgPSBzaXplLnJlcGxhY2UoXCJAZDJcIiwgXCIyXCIpO1xyXG4gICAgICAgIHNpemUgPSBzaXplLnJlcGxhY2UoXCJAeDJcIiwgXCIxXCIpO1xyXG5cclxuICAgICAgICBpZiAoc2l6ZSBpbiB0aGlzLmFsaWFzZXMpIHtcclxuICAgICAgICAgICAgc2l6ZSA9IHRoaXMuYWxpYXNlc1tzaXplXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCByZXN1bHQgPSAwO1xyXG5cclxuICAgICAgICBpZiAoc2l6ZSBpbiB0aGlzLmZvbnRTaXplcykge1xyXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLmZvbnRTaXplc1tzaXplXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoc2l6ZS5tYXRjaCgvXlxcLSpbMC05XSskLykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZ2VuU2l6ZShzaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHNpemUgKyBcIjogXCIgKyBKU09OLnN0cmluZ2lmeShyZXN1bHQsIG51bGwgLCAyKSArIFwiIFwiICsgKHNpemUgaW4gdGhpcy5mb250U2l6ZXMpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgZm9udCBzaXplIHRvIG5hbWUuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaXplIC0gZm9udCBzaXplIG5hbWUuXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBIYXNoTWFwLiBweDogdmFsdWUgaW4gcGl4ZWxzLCByZWw6IHJlbGF0aXZlIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIHNldFNpemUoc2l6ZSwgdmFsdWUpIHtcclxuICAgICAgICBzaXplID0gc2l6ZS5yZXBsYWNlKFwiQGQyXCIsIFwiMlwiKTtcclxuICAgICAgICBzaXplID0gc2l6ZS5yZXBsYWNlKFwiQHgyXCIsIFwiMVwiKTtcclxuICAgICAgICAvLyBDaGVjayBzaXplIGlzIGFsaWFzP1xyXG4gICAgICAgIGlmIChzaXplIGluIHRoaXMuYWxpYXNlcykge1xyXG4gICAgICAgICAgICBzaXplID0gdGhpcy5hbGlhc2VzW3NpemVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmZvbnRTaXplc1tzaXplXSA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIEZvbnQgU2l6ZXMgdG8gRm9udCBTaXplIENvbGxlY3Rpb24uXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaXplcyAtIHN0cmluZyBsaWtlIFwibmFtZTEgMjFweCAxLjUsIG5hbWUyIDE4cHgsIG5hbWUzIDEuNVwiLiBmb3JtYXQ6IG5hbWUgcGl4ZWxTaXplIHJlbGF0aXZlU2l6ZS5cclxuICAgICAqIFNlcGFyYXRvciBmb3IgZm9udCBzaXplcyBpcyBcIixcIi5cclxuICAgICAqIElmIHBpeGVsIG9yIHJlbGF0aXZlIHNpemUgaXQncyBwcmVzZW50IHRoZW4gaXQgY2FuIGJlIGdlbmVyYXRlZC5cclxuICAgICAqIEBwYXJhbSByaHl0aG1DYWxjdWxhdG9yIC0gaW5zdGFuY2Ugb2YgVmVydGljYWxSaHl0aG0gQ2xhc3MuXHJcbiAgICAgKi9cclxuICAgIGFkZEZvbnRTaXplcyhzaXplcywgcmh5dGhtQ2FsY3VsYXRvcikge1xyXG5cclxuICAgICAgICBsZXQgZm9udFNpemVzID0gc2l6ZXMuc3BsaXQoL1xccypcXCxcXHMqLyk7XHJcbiAgICAgICAgZm9yKGxldCBpID0gMCwgbGVuID0gZm9udFNpemVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcclxuICAgICAgICAgICAgbGV0IGZvbnRTaXplSW5mbyA9IGZvbnRTaXplc1tpXS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICBpZiAoZm9udFNpemVJbmZvLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm9udFNpemUgPSB7cHg6IDAsIHJlbDogMH07XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNIYXMoZm9udFNpemVJbmZvWzFdLCBcInB4XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemUucmVsID0gKGZvbnRTaXplSW5mby5sZW5ndGggPT0gMikgPyByaHl0aG1DYWxjdWxhdG9yLmNvbnZlcnQoZm9udFNpemVJbmZvWzFdLCBVTklULkVNKSA6IGZvbnRTaXplSW5mb1syXTtcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZS5weCA9IHBhcnNlSW50KGZvbnRTaXplSW5mb1sxXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplLnJlbCA9IHBhcnNlRmxvYXQoZm9udFNpemVJbmZvWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZS5weCA9IHJoeXRobUNhbGN1bGF0b3IuY29udmVydChmb250U2l6ZUluZm9bMV0sIFVOSVQuUFgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTaXplKGZvbnRTaXplSW5mb1swXSwgZm9udFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG4vKipcclxuICogRXhwb3J0IEZvbnRTaXplcyBDbGFzcy5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IEZvbnRTaXplczsiXX0=
