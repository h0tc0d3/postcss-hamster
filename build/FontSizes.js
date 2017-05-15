"use strict";

exports.__esModule = true;

var _Helpers = require("./Helpers");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
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

        if (settings.fontRatio) {
            if ((0, _Helpers.hasNumber)(settings.fontRatio)) {
                this.ratio = parseFloat(settings.fontRatio);
                this.desc = "Custom font ratio";
            } else {
                var fr = (0, _Helpers.toCamelCase)(settings.fontRatio);
                this.ratio = fontRatio[fr].value;
                this.desc = fontRatio[fr].desc;
            }
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
        // console.log(this.baseSize + " " + this.ratio);
        // console.log(JSON.stringify(this.fontSizes, null, 2));
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

        var result = void 0;

        if (size in this.fontSizes) {
            result = this.fontSizes[size];
        } else {
            if (size.match(/^[-0-9]+$/)) {
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

        var fontSizes = sizes.split(/\s*,\s*/);
        for (var i = 0, len = fontSizes.length; i < len; i++) {
            var fontSizeInfo = fontSizes[i].split(/\s+/);
            if (fontSizeInfo.length >= 2) {
                var fontSize = { px: 0, rel: 0 };
                if ((0, _Helpers.isHas)(fontSizeInfo[1], "px")) {
                    fontSize.rel = fontSizeInfo.length === 2 ? rhythmCalculator.convert(fontSizeInfo[1], _Helpers.UNIT.EM) : fontSizeInfo[2];
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZvbnRTaXplcy5lczYiXSwibmFtZXMiOlsiRm9udFNpemVzIiwic2V0dGluZ3MiLCJmb250UmF0aW8iLCJhbGlhc2VzIiwicmF0aW8iLCJwYXJzZUZsb2F0IiwiZGVzYyIsImZyIiwidmFsdWUiLCJiYXNlU2l6ZSIsImZvbnRTaXplIiwiZm9udFNpemVzIiwiaSIsImdlblNpemUiLCJzaXplIiwic2NhbGUiLCJweCIsInJlbCIsImJhc2VGb250U2l6ZSIsIk1hdGgiLCJwb3ciLCJhYnMiLCJnZXRTaXplIiwicmVwbGFjZSIsInJlc3VsdCIsIm1hdGNoIiwic2V0U2l6ZSIsImFkZEZvbnRTaXplcyIsInNpemVzIiwicmh5dGhtQ2FsY3VsYXRvciIsInNwbGl0IiwibGVuIiwibGVuZ3RoIiwiZm9udFNpemVJbmZvIiwiY29udmVydCIsIkVNIiwicGFyc2VJbnQiLCJQWCJdLCJtYXBwaW5ncyI6Ijs7OztBQVlBOzswSkFaQTs7Ozs7Ozs7Ozs7O0lBbUJNQSxTO0FBQ0Y7Ozs7Ozs7Ozs7QUFVQSx1QkFBWUMsUUFBWixFQUFzQjtBQUFBOztBQUVsQixZQUFJQyxZQUFZO0FBQ1osc0JBQVU7QUFDTix3QkFBUSxTQURGO0FBRU4seUJBQVM7QUFGSCxhQURFO0FBS1osNEJBQWdCO0FBQ1osd0JBQVEsS0FESTtBQUVaLHlCQUFTO0FBRkcsYUFMSjtBQVNaLDRCQUFnQjtBQUNaLHdCQUFRLEtBREk7QUFFWix5QkFBUztBQUZHLGFBVEo7QUFhWiw2QkFBaUI7QUFDYix3QkFBUSxLQURLO0FBRWIseUJBQVM7QUFGSSxhQWJMO0FBaUJaLDBCQUFjO0FBQ1Ysd0JBQVEsS0FERTtBQUVWLHlCQUFTO0FBRkMsYUFqQkY7QUFxQlosc0JBQVU7QUFDTix3QkFBUSxLQURGO0FBRU4seUJBQVM7QUFGSCxhQXJCRTtBQXlCWiw0QkFBZ0I7QUFDWix3QkFBUSxNQURJO0FBRVoseUJBQVM7QUFGRyxhQXpCSjtBQTZCWiw0QkFBZ0I7QUFDWix3QkFBUSxNQURJO0FBRVoseUJBQVM7QUFG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WUFBSWxCLFlBQVlpQixNQUFNRSxLQUFOLENBQVksU0FBWixDQUFoQjtBQUNBLGFBQUksSUFBSWxCLElBQUksQ0FBUixFQUFXbUIsTUFBTXBCLFVBQVVxQixNQUEvQixFQUF1Q3BCLElBQUltQixHQUEzQyxFQUFnRG5CLEdBQWhELEVBQW9EO0FBQ2hELGdCQUFJcUIsZUFBZXRCLFVBQVVDLENBQVYsRUFBYWtCLEtBQWIsQ0FBbUIsS0FBbkIsQ0FBbkI7QUFDQSxnQkFBSUcsYUFBYUQsTUFBYixJQUF1QixDQUEzQixFQUE4QjtBQUMxQixvQkFBSXRCLFdBQVcsRUFBQ00sSUFBSSxDQUFMLEVBQVFDLEtBQUssQ0FBYixFQUFmO0FBQ0Esb0JBQUksb0JBQU1nQixhQUFhLENBQWIsQ0FBTixFQUF1QixJQUF2QixDQUFKLEVBQWtDO0FBQzlCdkIsNkJBQVNPLEdBQVQsR0FBZ0JnQixhQUFhRCxNQUFiLEtBQXdCLENBQXpCLEdBQ1RILGlCQUFpQkssT0FBakIsQ0FBeUJELGFBQWEsQ0FBYixDQUF6QixFQUEwQyxjQUFLRSxFQUEvQyxDQURTLEdBRVRGLGFBQWEsQ0FBYixDQUZOO0FBR0F2Qiw2QkFBU00sRUFBVCxHQUFjb0IsU0FBU0gsYUFBYSxDQUFiLENBQVQsQ0FBZDtBQUNILGlCQUxELE1BS087QUFDSHZCLDZCQUFTTyxHQUFULEdBQWVaLFdBQVc0QixhQUFhLENBQWIsQ0FBWCxDQUFmO0FBQ0F2Qiw2QkFBU00sRUFBVCxHQUFjYSxpQkFBaUJLLE9BQWpCLENBQXlCRCxhQUFhLENBQWIsQ0FBekIsRUFBMEMsY0FBS0ksRUFBL0MsQ0FBZDtBQUNIO0FBQ0QscUJBQUtYLE9BQUwsQ0FBYU8sYUFBYSxDQUFiLENBQWIsRUFBOEJ2QixRQUE5QjtBQUNIO0FBQ0o7QUFDSixLOzs7O0FBR0w7Ozs7O2tCQUdlVixTIiwiZmlsZSI6IkZvbnRTaXplcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbW9kdWxlIEZvbnRTaXplc1xyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb24gRm9udCBzaXplIGNvbGxlY3Rpb24gbWFuYWdlciBhbmQgZ2VuZXJhdG9yIHByb3BvcnRpb25hbCBmb250cyBzaXplcyB3aXRoIGFsaWFzZXMuXHJcbiAqXHJcbiAqIEB2ZXJzaW9uIDEuMFxyXG4gKiBAYXV0aG9yIEdyaWdvcnkgVmFzaWx5ZXYgPHBvc3Rjc3MuaGFtc3RlckBnbWFpbC5jb20+IGh0dHBzOi8vZ2l0aHViLmNvbS9oMHRjMGQzXHJcbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE3LCBHcmlnb3J5IFZhc2lseWV2XHJcbiAqIEBsaWNlbnNlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCwgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtcclxuICAgIGlzSGFzLFxyXG4gICAgdG9DYW1lbENhc2UsXHJcbiAgICBoYXNOdW1iZXIsXHJcbiAgICBVTklUXHJcbn0gZnJvbSBcIi4vSGVscGVyc1wiO1xyXG5cclxuY2xhc3MgRm9udFNpemVzIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgZm9yIGZvbnQgc2l6ZSBjb2xsZWN0aW9uIG1hbmFnZXIuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBzZXR0aW5ncyAtIHNldHRpbmdzLlxyXG4gICAgICogXHJcbiAgICAgKiBVc2Ugc2V0dGluZ3MuZm9udFJhdGlvXCJdIC0gZm9udCBzY2FsZSByYXRpbyBhbmQgc2V0dGluZ3MuZm9udFNpemUgLSBiYXNlIGZvbnQgc2l6ZSh3aWxsIGJlIDAgc2l6ZSkuXHJcbiAgICAgKiBBbGwgc2l6ZXMgd2lsbCBiZSBnZW5lcmF0ZWQgZnJvbSBiYXNlIGZvbnQgc2l6ZSAqIHJhdGlvLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzZXR0aW5ncykge1xyXG5cclxuICAgICAgICBsZXQgZm9udFJhdGlvID0ge1xyXG4gICAgICAgICAgICBcImdvbGRlblwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIxOjEuNjE4XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNjE4XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiZG91YmxlT2N0YXZlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjE6NFwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiA0XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3JUd2VsZnRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjE6M1wiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAzXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3JFbGV2ZW50aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIzOjhcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMi42NjdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtYWpvclRlbnRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjI6NVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAyLjVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJvY3RhdmVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMToyXCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtYWpvclNldmVudGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiODoxNVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjg3NVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1pbm9yU2V2ZW50aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCI5OjE2XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNzc4XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3JTaXh0aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIzOjVcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS42NjdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtaW5vclNpeHRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjU6OFwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjZcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJwZXJmZWN0RmlmdGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMjozXCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImF1Z21lbnRlZEZvdXJ0aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIxOuKImjJcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS40MTRcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJwZXJmZWN0Rm91cnRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjM6NFwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjMzM1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1ham9yVGhpcmRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiNDo1XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuMjVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtaW5vclRoaXJkXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjU6NlwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtYWpvclNlY29uZFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCI4OjlcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS4xMjVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtaW5vclNlY29uZFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIxNToxNlwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjA2N1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hbGlhc2VzID0ge1xyXG4gICAgICAgICAgICBcInRpbnlcIjogXCItMlwiLFxyXG4gICAgICAgICAgICBcInRcIjogXCItMlwiLFxyXG4gICAgICAgICAgICBcInNtYWxsXCI6IFwiLTFcIixcclxuICAgICAgICAgICAgXCJzXCI6IFwiLTFcIixcclxuICAgICAgICAgICAgXCJiYXNlXCI6IFwiMFwiLFxyXG4gICAgICAgICAgICBcImJcIjogXCIwXCIsXHJcbiAgICAgICAgICAgIFwibWVkaXVtXCI6IFwiMVwiLFxyXG4gICAgICAgICAgICBcIm1cIjogXCIxXCIsXHJcbiAgICAgICAgICAgIFwibGFyZ2VcIjogXCIyXCIsXHJcbiAgICAgICAgICAgIFwibFwiOiBcIjJcIixcclxuICAgICAgICAgICAgXCJ4bGFyZ2VcIjogXCIzXCIsXHJcbiAgICAgICAgICAgIFwieGxcIjogXCIzXCIsXHJcbiAgICAgICAgICAgIFwieHhsYXJnZVwiOiBcIjRcIixcclxuICAgICAgICAgICAgXCJ4eGxcIjogXCI0XCIsXHJcbiAgICAgICAgICAgIFwieHh4bGFyZ2VcIjogXCI1XCIsXHJcbiAgICAgICAgICAgIFwieHh4bFwiOiBcIjVcIixcclxuICAgICAgICAgICAgLy9Eb3VibGUgc2NhbGVkIHNpemVzXHJcbiAgICAgICAgICAgIFwidGlueTFcIjogXCItMjFcIixcclxuICAgICAgICAgICAgXCJ0MVwiOiBcIi0yMVwiLFxyXG4gICAgICAgICAgICBcInNtYWxsMVwiOiBcIi0xMVwiLFxyXG4gICAgICAgICAgICBcInMxXCI6IFwiLTExXCIsXHJcbiAgICAgICAgICAgIFwiYmFzZTFcIjogXCIwMVwiLFxyXG4gICAgICAgICAgICBcImIxXCI6IFwiMDFcIixcclxuICAgICAgICAgICAgXCJtZWRpdW0xXCI6IFwiMTFcIixcclxuICAgICAgICAgICAgXCJtMVwiOiBcIjExXCIsXHJcbiAgICAgICAgICAgIFwibGFyZ2UxXCI6IFwiMjFcIixcclxuICAgICAgICAgICAgXCJsMVwiOiBcIjIxXCIsXHJcbiAgICAgICAgICAgIFwieGxhcmdlMVwiOiBcIjMxXCIsXHJcbiAgICAgICAgICAgIFwieGwxXCI6IFwiMzFcIixcclxuICAgICAgICAgICAgXCJ4eGxhcmdlMVwiOiBcIjQxXCIsXHJcbiAgICAgICAgICAgIFwieHhsMVwiOiBcIjQxXCIsXHJcbiAgICAgICAgICAgIFwieHh4bGFyZ2UxXCI6IFwiNTFcIixcclxuICAgICAgICAgICAgXCJ4eHhsMVwiOiBcIjUxXCIsXHJcbiAgICAgICAgICAgIC8vRG91YmxlIGRpdmlkZWQgc2l6ZXNcclxuICAgICAgICAgICAgXCJ0aW55MlwiOiBcIi0yMlwiLFxyXG4gICAgICAgICAgICBcInQyXCI6IFwiLTIyXCIsXHJcbiAgICAgICAgICAgIFwic21hbGwyXCI6IFwiLTEyXCIsXHJcbiAgICAgICAgICAgIFwiczJcIjogXCItMTJcIixcclxuICAgICAgICAgICAgXCJiYXNlMlwiOiBcIjAyXCIsXHJcbiAgICAgICAgICAgIFwiYjJcIjogXCIwMlwiLFxyXG4gICAgICAgICAgICBcIm1lZGl1bTJcIjogXCIxMlwiLFxyXG4gICAgICAgICAgICBcIm0yXCI6IFwiMTJcIixcclxuICAgICAgICAgICAgXCJsYXJnZTJcIjogXCIyMlwiLFxyXG4gICAgICAgICAgICBcImwyXCI6IFwiMjJcIixcclxuICAgICAgICAgICAgXCJ4bGFyZ2UyXCI6IFwiMzJcIixcclxuICAgICAgICAgICAgXCJ4bDJcIjogXCIzMlwiLFxyXG4gICAgICAgICAgICBcInh4bGFyZ2UyXCI6IFwiNDJcIixcclxuICAgICAgICAgICAgXCJ4eGwyXCI6IFwiNDJcIixcclxuICAgICAgICAgICAgXCJ4eHhsYXJnZTJcIjogXCI1MlwiLFxyXG4gICAgICAgICAgICBcInh4eGwyXCI6IFwiNTJcIlxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChzZXR0aW5ncy5mb250UmF0aW8pIHtcclxuICAgICAgICAgICAgaWYgKGhhc051bWJlcihzZXR0aW5ncy5mb250UmF0aW8pKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhdGlvID0gcGFyc2VGbG9hdChzZXR0aW5ncy5mb250UmF0aW8pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNjID0gXCJDdXN0b20gZm9udCByYXRpb1wiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZyID0gdG9DYW1lbENhc2Uoc2V0dGluZ3MuZm9udFJhdGlvKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmF0aW8gPSBmb250UmF0aW9bZnJdLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNjID0gZm9udFJhdGlvW2ZyXS5kZXNjO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBCYXNlRm9udFNpemVcclxuICAgICAgICB0aGlzLmJhc2VTaXplID0gc2V0dGluZ3MuZm9udFNpemU7XHJcbiAgICAgICAgLy8gbWFraW5nIGZvbnRzaXplIGNvbGxlY3Rpb25cclxuICAgICAgICBpZiAodGhpcy5yYXRpbyA+IDAgJiYgdGhpcy5iYXNlU2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgLy8gZm9udCBDb2xsZWN0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuZm9udFNpemVzID0ge307XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAtMjsgaSA8PSA1OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIC8vIE1ha2Ugc2l6ZSBmcm9tIC0yIHRvIDVcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9udFNpemVzW2ldID0gdGhpcy5nZW5TaXplKGkpO1xyXG4gICAgICAgICAgICAgICAgLy8gTWFrZSBkb3VibGUgc2l6ZSBmcm9tIC0yIHRvIDVcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9udFNpemVzW2kgKyBcIjFcIl0gPSB0aGlzLmdlblNpemUoaSwgMik7XHJcbiAgICAgICAgICAgICAgICAvLyBNYWtlIGRvdWJsZSBkaXZpZGVkIHNpemUgZnJvbSAtMiB0byA1XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvbnRTaXplc1tpICsgXCIyXCJdID0gdGhpcy5nZW5TaXplKGksIDAuNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5iYXNlU2l6ZSArIFwiIFwiICsgdGhpcy5yYXRpbyk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkodGhpcy5mb250U2l6ZXMsIG51bGwsIDIpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlIGZvbnQgc2l6ZXMgZm9yIHJlbGF0aXZlIHByb3BvcnRpb25hbCBzaXplLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOkZvbnRTaXplc1xyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2l6ZSAtIFByb3BvcnRpb25hbCBzaXplIGxpa2UgLTIsIDAsIDEsIDMgZXRjLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNjYWxlIC0gc2NhbGUgYmFzZSBmb250IHNpemUuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHt7fX0gLSBIYXNoTWFwLiBweDogdmFsdWUgaW4gcGl4ZWxzLCByZWw6IHJlbGF0aXZlIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIGdlblNpemUoc2l6ZSwgc2NhbGUgPSAwKSB7XHJcblxyXG4gICAgICAgIGxldCB2YWx1ZSA9ICB7cHg6IDAsIHJlbDogMH07XHJcblxyXG4gICAgICAgIGxldCBiYXNlRm9udFNpemUgPSB0aGlzLmJhc2VTaXplO1xyXG5cclxuICAgICAgICBpZiAoc2NhbGUgPiAwKSB7XHJcbiAgICAgICAgICAgIGJhc2VGb250U2l6ZSA9IGJhc2VGb250U2l6ZSAqIHNjYWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLnJhdGlvIHx8ICFiYXNlRm9udFNpemUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNpemUgPj0gMCkge1xyXG5cclxuICAgICAgICAgICAgdmFsdWUucmVsID0gTWF0aC5wb3codGhpcy5yYXRpbywgc2l6ZSk7XHJcbiAgICAgICAgICAgIHZhbHVlLnB4ID0gYmFzZUZvbnRTaXplICogdmFsdWUucmVsO1xyXG5cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIHZhbHVlLnJlbCA9IDEgLyBNYXRoLnBvdyh0aGlzLnJhdGlvLCBNYXRoLmFicyhzaXplKSk7XHJcbiAgICAgICAgICAgIHZhbHVlLnB4ID0gYmFzZUZvbnRTaXplICogdmFsdWUucmVsO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzY2FsZSA+IDApIHtcclxuICAgICAgICAgICAgdmFsdWUucmVsID0gdmFsdWUucmVsICogc2NhbGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IGZvbnQgc2l6ZSBieSBuYW1lLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOkZvbnRTaXplc1xyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2l6ZSAtIGZvbnQgc2l6ZSBuYW1lLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7e319IC0gSGFzaE1hcC4gcHg6IHZhbHVlIGluIHBpeGVscywgcmVsOiByZWxhdGl2ZSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBnZXRTaXplKHNpemUpIHtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgc2l6ZSBpcyBhbGlhcz9cclxuICAgICAgICBzaXplID0gc2l6ZS5yZXBsYWNlKFwiQGQyXCIsIFwiMlwiKTtcclxuICAgICAgICBzaXplID0gc2l6ZS5yZXBsYWNlKFwiQHgyXCIsIFwiMVwiKTtcclxuXHJcbiAgICAgICAgaWYgKHNpemUgaW4gdGhpcy5hbGlhc2VzKSB7XHJcbiAgICAgICAgICAgIHNpemUgPSB0aGlzLmFsaWFzZXNbc2l6ZV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcmVzdWx0O1xyXG5cclxuICAgICAgICBpZiAoc2l6ZSBpbiB0aGlzLmZvbnRTaXplcykge1xyXG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLmZvbnRTaXplc1tzaXplXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoc2l6ZS5tYXRjaCgvXlstMC05XSskLykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZ2VuU2l6ZShzaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHNpemUgKyBcIjogXCIgKyBKU09OLnN0cmluZ2lmeShyZXN1bHQsIG51bGwgLCAyKSArIFwiIFwiICsgKHNpemUgaW4gdGhpcy5mb250U2l6ZXMpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgZm9udCBzaXplIHRvIG5hbWUuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaXplIC0gZm9udCBzaXplIG5hbWUuXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBIYXNoTWFwLiBweDogdmFsdWUgaW4gcGl4ZWxzLCByZWw6IHJlbGF0aXZlIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIHNldFNpemUoc2l6ZSwgdmFsdWUpIHtcclxuICAgICAgICBzaXplID0gc2l6ZS5yZXBsYWNlKFwiQGQyXCIsIFwiMlwiKTtcclxuICAgICAgICBzaXplID0gc2l6ZS5yZXBsYWNlKFwiQHgyXCIsIFwiMVwiKTtcclxuICAgICAgICAvLyBDaGVjayBzaXplIGlzIGFsaWFzP1xyXG4gICAgICAgIGlmIChzaXplIGluIHRoaXMuYWxpYXNlcykge1xyXG4gICAgICAgICAgICBzaXplID0gdGhpcy5hbGlhc2VzW3NpemVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmZvbnRTaXplc1tzaXplXSA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIEZvbnQgU2l6ZXMgdG8gRm9udCBTaXplIENvbGxlY3Rpb24uXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaXplcyAtIHN0cmluZyBsaWtlIFwibmFtZTEgMjFweCAxLjUsIG5hbWUyIDE4cHgsIG5hbWUzIDEuNVwiLiBmb3JtYXQ6IG5hbWUgcGl4ZWxTaXplIHJlbGF0aXZlU2l6ZS5cclxuICAgICAqIFNlcGFyYXRvciBmb3IgZm9udCBzaXplcyBpcyBcIixcIi5cclxuICAgICAqIElmIHBpeGVsIG9yIHJlbGF0aXZlIHNpemUgaXQncyBwcmVzZW50IHRoZW4gaXQgY2FuIGJlIGdlbmVyYXRlZC5cclxuICAgICAqIEBwYXJhbSByaHl0aG1DYWxjdWxhdG9yIC0gaW5zdGFuY2Ugb2YgVmVydGljYWxSaHl0aG0gQ2xhc3MuXHJcbiAgICAgKi9cclxuICAgIGFkZEZvbnRTaXplcyhzaXplcywgcmh5dGhtQ2FsY3VsYXRvcikge1xyXG5cclxuICAgICAgICBsZXQgZm9udFNpemVzID0gc2l6ZXMuc3BsaXQoL1xccyosXFxzKi8pO1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDAsIGxlbiA9IGZvbnRTaXplcy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XHJcbiAgICAgICAgICAgIGxldCBmb250U2l6ZUluZm8gPSBmb250U2l6ZXNbaV0uc3BsaXQoL1xccysvKTtcclxuICAgICAgICAgICAgaWYgKGZvbnRTaXplSW5mby5sZW5ndGggPj0gMikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplID0ge3B4OiAwLCByZWw6IDB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzSGFzKGZvbnRTaXplSW5mb1sxXSwgXCJweFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplLnJlbCA9IChmb250U2l6ZUluZm8ubGVuZ3RoID09PSAyKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHJoeXRobUNhbGN1bGF0b3IuY29udmVydChmb250U2l6ZUluZm9bMV0sIFVOSVQuRU0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogZm9udFNpemVJbmZvWzJdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplLnB4ID0gcGFyc2VJbnQoZm9udFNpemVJbmZvWzFdKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemUucmVsID0gcGFyc2VGbG9hdChmb250U2l6ZUluZm9bMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplLnB4ID0gcmh5dGhtQ2FsY3VsYXRvci5jb252ZXJ0KGZvbnRTaXplSW5mb1sxXSwgVU5JVC5QWCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFNpemUoZm9udFNpemVJbmZvWzBdLCBmb250U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcbi8qKlxyXG4gKiBFeHBvcnQgRm9udFNpemVzIENsYXNzLlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgRm9udFNpemVzOyJdfQ==
