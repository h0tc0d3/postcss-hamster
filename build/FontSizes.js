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

        var result = null;

        if (size in this.fontSizes) {
            result = this.fontSizes[size];
        } else if (size.match(/^[-0-9]+$/)) {
            result = this.genSize(parseInt(size));
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZvbnRTaXplcy5lczYiXSwibmFtZXMiOlsiRm9udFNpemVzIiwic2V0dGluZ3MiLCJmb250UmF0aW8iLCJhbGlhc2VzIiwicmF0aW8iLCJwYXJzZUZsb2F0IiwiZGVzYyIsImZyIiwidmFsdWUiLCJiYXNlU2l6ZSIsImZvbnRTaXplIiwiZm9udFNpemVzIiwiaSIsImdlblNpemUiLCJzaXplIiwic2NhbGUiLCJweCIsInJlbCIsImJhc2VGb250U2l6ZSIsIk1hdGgiLCJwb3ciLCJhYnMiLCJnZXRTaXplIiwicmVwbGFjZSIsInJlc3VsdCIsIm1hdGNoIiwicGFyc2VJbnQiLCJzZXRTaXplIiwiYWRkRm9udFNpemVzIiwic2l6ZXMiLCJyaHl0aG1DYWxjdWxhdG9yIiwic3BsaXQiLCJsZW4iLCJsZW5ndGgiLCJmb250U2l6ZUluZm8iLCJjb252ZXJ0IiwiRU0iLCJQWCJdLCJtYXBwaW5ncyI6Ijs7OztBQVlBOzswSkFaQTs7Ozs7Ozs7Ozs7O0lBbUJNQSxTO0FBQ0Y7Ozs7Ozs7Ozs7QUFVQSx1QkFBWUMsUUFBWixFQUFzQjtBQUFBOztBQUVsQixZQUFJQyxZQUFZO0FBQ1osc0JBQVU7QUFDTix3QkFBUSxTQURGO0FBRU4seUJBQVM7QUFGSCxhQURFO0FBS1osNEJBQWdCO0FBQ1osd0JBQVEsS0FESTtBQUVaLHlCQUFTO0FBRkcsYUFMSjtBQVNaLDRCQUFnQjtBQUNaLHdCQUFRLEtBREk7QUFFWix5QkFBUztBQUZHLGFBVEo7QUFhWiw2QkFBaUI7QUFDYix3QkFBUSxLQURLO0FBRWIseUJBQVM7QUFGSSxhQWJMO0FBaUJaLDBCQUFjO0FBQ1Ysd0JBQVEsS0FERTtBQUVWLHlCQUFTO0FBRkMsYUFqQkY7QUFxQlosc0JBQVU7QUFDTix3QkFBUSxLQURGO0FBRU4seUJBQVM7QUFGSCxhQXJCRTtBQXlCWiw0QkFBZ0I7QUFDWix3QkFBUSxNQURJO0FBRVoseUJBQVM7QUFGRyxhQXpCSjtBQTZCWiw0QkFBZ0I7QUFDWix3QkFBUSxNQURJO0FBRVoseUJBQVM7QUFG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QUVsQyxZQUFJbkIsWUFBWWtCLE1BQU1FLEtBQU4sQ0FBWSxTQUFaLENBQWhCO0FBQ0EsYUFBSSxJQUFJbkIsSUFBSSxDQUFSLEVBQVdvQixNQUFNckIsVUFBVXNCLE1BQS9CLEVBQXVDckIsSUFBSW9CLEdBQTNDLEVBQWdEcEIsR0FBaEQsRUFBb0Q7QUFDaEQsZ0JBQUlzQixlQUFldkIsVUFBVUMsQ0FBVixFQUFhbUIsS0FBYixDQUFtQixLQUFuQixDQUFuQjtBQUNBLGdCQUFJRyxhQUFhRCxNQUFiLElBQXVCLENBQTNCLEVBQThCO0FBQzFCLG9CQUFJdkIsV0FBVyxFQUFDTSxJQUFJLENBQUwsRUFBUUMsS0FBSyxDQUFiLEVBQWY7QUFDQSxvQkFBSSxvQkFBTWlCLGFBQWEsQ0FBYixDQUFOLEVBQXVCLElBQXZCLENBQUosRUFBa0M7QUFDOUJ4Qiw2QkFBU08sR0FBVCxHQUFnQmlCLGFBQWFELE1BQWIsS0FBd0IsQ0FBekIsR0FDVEgsaUJBQWlCSyxPQUFqQixDQUF5QkQsYUFBYSxDQUFiLENBQXpCLEVBQTBDLGNBQUtFLEVBQS9DLENBRFMsR0FFVEYsYUFBYSxDQUFiLENBRk47QUFHQXhCLDZCQUFTTSxFQUFULEdBQWNVLFNBQVNRLGFBQWEsQ0FBYixDQUFULENBQWQ7QUFDSCxpQkFMRCxNQUtPO0FBQ0h4Qiw2QkFBU08sR0FBVCxHQUFlWixXQUFXNkIsYUFBYSxDQUFiLENBQVgsQ0FBZjtBQUNBeEIsNkJBQVNNLEVBQVQsR0FBY2MsaUJBQWlCSyxPQUFqQixDQUF5QkQsYUFBYSxDQUFiLENBQXpCLEVBQTBDLGNBQUtHLEVBQS9DLENBQWQ7QUFDSDtBQUNELHFCQUFLVixPQUFMLENBQWFPLGFBQWEsQ0FBYixDQUFiLEVBQThCeEIsUUFBOUI7QUFDSDtBQUNKO0FBQ0osSzs7OztBQUdMOzs7OztrQkFHZVYsUyIsImZpbGUiOiJGb250U2l6ZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG1vZHVsZSBGb250U2l6ZXNcclxuICpcclxuICogQGRlc2NyaXB0aW9uIEZvbnQgc2l6ZSBjb2xsZWN0aW9uIG1hbmFnZXIgYW5kIGdlbmVyYXRvciBwcm9wb3J0aW9uYWwgZm9udHMgc2l6ZXMgd2l0aCBhbGlhc2VzLlxyXG4gKlxyXG4gKiBAdmVyc2lvbiAxLjBcclxuICogQGF1dGhvciBHcmlnb3J5IFZhc2lseWV2IDxwb3N0Y3NzLmhhbXN0ZXJAZ21haWwuY29tPiBodHRwczovL2dpdGh1Yi5jb20vaDB0YzBkM1xyXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNywgR3JpZ29yeSBWYXNpbHlldlxyXG4gKiBAbGljZW5zZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAsIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKi9cclxuXHJcbmltcG9ydCB7XHJcbiAgICBpc0hhcyxcclxuICAgIHRvQ2FtZWxDYXNlLFxyXG4gICAgaGFzTnVtYmVyLFxyXG4gICAgVU5JVFxyXG59IGZyb20gXCIuL0hlbHBlcnNcIjtcclxuXHJcbmNsYXNzIEZvbnRTaXplcyB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yIGZvciBmb250IHNpemUgY29sbGVjdGlvbiBtYW5hZ2VyLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOkZvbnRTaXplc1xyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gc2V0dGluZ3MgLSBzZXR0aW5ncy5cclxuICAgICAqIFxyXG4gICAgICogVXNlIHNldHRpbmdzLmZvbnRSYXRpb1wiXSAtIGZvbnQgc2NhbGUgcmF0aW8gYW5kIHNldHRpbmdzLmZvbnRTaXplIC0gYmFzZSBmb250IHNpemUod2lsbCBiZSAwIHNpemUpLlxyXG4gICAgICogQWxsIHNpemVzIHdpbGwgYmUgZ2VuZXJhdGVkIGZyb20gYmFzZSBmb250IHNpemUgKiByYXRpby5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Ioc2V0dGluZ3MpIHtcclxuXHJcbiAgICAgICAgbGV0IGZvbnRSYXRpbyA9IHtcclxuICAgICAgICAgICAgXCJnb2xkZW5cIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMToxLjYxOFwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjYxOFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImRvdWJsZU9jdGF2ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIxOjRcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogNFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1ham9yVHdlbGZ0aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIxOjNcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogM1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1ham9yRWxldmVudGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMzo4XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDIuNjY3XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3JUZW50aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIyOjVcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMi41XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwib2N0YXZlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjE6MlwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAyXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3JTZXZlbnRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjg6MTVcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS44NzVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtaW5vclNldmVudGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiOToxNlwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjc3OFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1ham9yU2l4dGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMzo1XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNjY3XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWlub3JTaXh0aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCI1OjhcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS42XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwicGVyZmVjdEZpZnRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjI6M1wiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJhdWdtZW50ZWRGb3VydGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMTriiJoyXCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNDE0XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwicGVyZmVjdEZvdXJ0aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIzOjRcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS4zMzNcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtYWpvclRoaXJkXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjQ6NVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjI1XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWlub3JUaGlyZFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCI1OjZcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS4yXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3JTZWNvbmRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiODo5XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuMTI1XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWlub3JTZWNvbmRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMTU6MTZcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS4wNjdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWxpYXNlcyA9IHtcclxuICAgICAgICAgICAgXCJ0aW55XCI6IFwiLTJcIixcclxuICAgICAgICAgICAgXCJ0XCI6IFwiLTJcIixcclxuICAgICAgICAgICAgXCJzbWFsbFwiOiBcIi0xXCIsXHJcbiAgICAgICAgICAgIFwic1wiOiBcIi0xXCIsXHJcbiAgICAgICAgICAgIFwiYmFzZVwiOiBcIjBcIixcclxuICAgICAgICAgICAgXCJiXCI6IFwiMFwiLFxyXG4gICAgICAgICAgICBcIm1lZGl1bVwiOiBcIjFcIixcclxuICAgICAgICAgICAgXCJtXCI6IFwiMVwiLFxyXG4gICAgICAgICAgICBcImxhcmdlXCI6IFwiMlwiLFxyXG4gICAgICAgICAgICBcImxcIjogXCIyXCIsXHJcbiAgICAgICAgICAgIFwieGxhcmdlXCI6IFwiM1wiLFxyXG4gICAgICAgICAgICBcInhsXCI6IFwiM1wiLFxyXG4gICAgICAgICAgICBcInh4bGFyZ2VcIjogXCI0XCIsXHJcbiAgICAgICAgICAgIFwieHhsXCI6IFwiNFwiLFxyXG4gICAgICAgICAgICBcInh4eGxhcmdlXCI6IFwiNVwiLFxyXG4gICAgICAgICAgICBcInh4eGxcIjogXCI1XCIsXHJcbiAgICAgICAgICAgIC8vRG91YmxlIHNjYWxlZCBzaXplc1xyXG4gICAgICAgICAgICBcInRpbnkxXCI6IFwiLTIxXCIsXHJcbiAgICAgICAgICAgIFwidDFcIjogXCItMjFcIixcclxuICAgICAgICAgICAgXCJzbWFsbDFcIjogXCItMTFcIixcclxuICAgICAgICAgICAgXCJzMVwiOiBcIi0xMVwiLFxyXG4gICAgICAgICAgICBcImJhc2UxXCI6IFwiMDFcIixcclxuICAgICAgICAgICAgXCJiMVwiOiBcIjAxXCIsXHJcbiAgICAgICAgICAgIFwibWVkaXVtMVwiOiBcIjExXCIsXHJcbiAgICAgICAgICAgIFwibTFcIjogXCIxMVwiLFxyXG4gICAgICAgICAgICBcImxhcmdlMVwiOiBcIjIxXCIsXHJcbiAgICAgICAgICAgIFwibDFcIjogXCIyMVwiLFxyXG4gICAgICAgICAgICBcInhsYXJnZTFcIjogXCIzMVwiLFxyXG4gICAgICAgICAgICBcInhsMVwiOiBcIjMxXCIsXHJcbiAgICAgICAgICAgIFwieHhsYXJnZTFcIjogXCI0MVwiLFxyXG4gICAgICAgICAgICBcInh4bDFcIjogXCI0MVwiLFxyXG4gICAgICAgICAgICBcInh4eGxhcmdlMVwiOiBcIjUxXCIsXHJcbiAgICAgICAgICAgIFwieHh4bDFcIjogXCI1MVwiLFxyXG4gICAgICAgICAgICAvL0RvdWJsZSBkaXZpZGVkIHNpemVzXHJcbiAgICAgICAgICAgIFwidGlueTJcIjogXCItMjJcIixcclxuICAgICAgICAgICAgXCJ0MlwiOiBcIi0yMlwiLFxyXG4gICAgICAgICAgICBcInNtYWxsMlwiOiBcIi0xMlwiLFxyXG4gICAgICAgICAgICBcInMyXCI6IFwiLTEyXCIsXHJcbiAgICAgICAgICAgIFwiYmFzZTJcIjogXCIwMlwiLFxyXG4gICAgICAgICAgICBcImIyXCI6IFwiMDJcIixcclxuICAgICAgICAgICAgXCJtZWRpdW0yXCI6IFwiMTJcIixcclxuICAgICAgICAgICAgXCJtMlwiOiBcIjEyXCIsXHJcbiAgICAgICAgICAgIFwibGFyZ2UyXCI6IFwiMjJcIixcclxuICAgICAgICAgICAgXCJsMlwiOiBcIjIyXCIsXHJcbiAgICAgICAgICAgIFwieGxhcmdlMlwiOiBcIjMyXCIsXHJcbiAgICAgICAgICAgIFwieGwyXCI6IFwiMzJcIixcclxuICAgICAgICAgICAgXCJ4eGxhcmdlMlwiOiBcIjQyXCIsXHJcbiAgICAgICAgICAgIFwieHhsMlwiOiBcIjQyXCIsXHJcbiAgICAgICAgICAgIFwieHh4bGFyZ2UyXCI6IFwiNTJcIixcclxuICAgICAgICAgICAgXCJ4eHhsMlwiOiBcIjUyXCJcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAoc2V0dGluZ3MuZm9udFJhdGlvKSB7XHJcbiAgICAgICAgICAgIGlmIChoYXNOdW1iZXIoc2V0dGluZ3MuZm9udFJhdGlvKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yYXRpbyA9IHBhcnNlRmxvYXQoc2V0dGluZ3MuZm9udFJhdGlvKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzYyA9IFwiQ3VzdG9tIGZvbnQgcmF0aW9cIjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBmciA9IHRvQ2FtZWxDYXNlKHNldHRpbmdzLmZvbnRSYXRpbyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhdGlvID0gZm9udFJhdGlvW2ZyXS52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzYyA9IGZvbnRSYXRpb1tmcl0uZGVzYztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQmFzZUZvbnRTaXplXHJcbiAgICAgICAgdGhpcy5iYXNlU2l6ZSA9IHNldHRpbmdzLmZvbnRTaXplO1xyXG4gICAgICAgIC8vIG1ha2luZyBmb250c2l6ZSBjb2xsZWN0aW9uXHJcbiAgICAgICAgaWYgKHRoaXMucmF0aW8gPiAwICYmIHRoaXMuYmFzZVNpemUgPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIGZvbnQgQ29sbGVjdGlvblxyXG4gICAgICAgICAgICB0aGlzLmZvbnRTaXplcyA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gLTI7IGkgPD0gNTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBNYWtlIHNpemUgZnJvbSAtMiB0byA1XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvbnRTaXplc1tpXSA9IHRoaXMuZ2VuU2l6ZShpKTtcclxuICAgICAgICAgICAgICAgIC8vIE1ha2UgZG91YmxlIHNpemUgZnJvbSAtMiB0byA1XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvbnRTaXplc1tpICsgXCIxXCJdID0gdGhpcy5nZW5TaXplKGksIDIpO1xyXG4gICAgICAgICAgICAgICAgLy8gTWFrZSBkb3VibGUgZGl2aWRlZCBzaXplIGZyb20gLTIgdG8gNVxyXG4gICAgICAgICAgICAgICAgdGhpcy5mb250U2l6ZXNbaSArIFwiMlwiXSA9IHRoaXMuZ2VuU2l6ZShpLCAwLjUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuYmFzZVNpemUgKyBcIiBcIiArIHRoaXMucmF0aW8pO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHRoaXMuZm9udFNpemVzLCBudWxsLCAyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBmb250IHNpemVzIGZvciByZWxhdGl2ZSBwcm9wb3J0aW9uYWwgc2l6ZS5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpGb250U2l6ZXNcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgLSBQcm9wb3J0aW9uYWwgc2l6ZSBsaWtlIC0yLCAwLCAxLCAzIGV0Yy5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY2FsZSAtIHNjYWxlIGJhc2UgZm9udCBzaXplLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7e319IC0gSGFzaE1hcC4gcHg6IHZhbHVlIGluIHBpeGVscywgcmVsOiByZWxhdGl2ZSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBnZW5TaXplKHNpemUsIHNjYWxlID0gMCkge1xyXG5cclxuICAgICAgICBsZXQgdmFsdWUgPSAge3B4OiAwLCByZWw6IDB9O1xyXG5cclxuICAgICAgICBsZXQgYmFzZUZvbnRTaXplID0gdGhpcy5iYXNlU2l6ZTtcclxuXHJcbiAgICAgICAgaWYgKHNjYWxlID4gMCkge1xyXG4gICAgICAgICAgICBiYXNlRm9udFNpemUgPSBiYXNlRm9udFNpemUgKiBzY2FsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5yYXRpbyB8fCAhYmFzZUZvbnRTaXplKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzaXplID49IDApIHtcclxuXHJcbiAgICAgICAgICAgIHZhbHVlLnJlbCA9IE1hdGgucG93KHRoaXMucmF0aW8sIHNpemUpO1xyXG4gICAgICAgICAgICB2YWx1ZS5weCA9IGJhc2VGb250U2l6ZSAqIHZhbHVlLnJlbDtcclxuXHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICB2YWx1ZS5yZWwgPSAxIC8gTWF0aC5wb3codGhpcy5yYXRpbywgTWF0aC5hYnMoc2l6ZSkpO1xyXG4gICAgICAgICAgICB2YWx1ZS5weCA9IGJhc2VGb250U2l6ZSAqIHZhbHVlLnJlbDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc2NhbGUgPiAwKSB7XHJcbiAgICAgICAgICAgIHZhbHVlLnJlbCA9IHZhbHVlLnJlbCAqIHNjYWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldCBmb250IHNpemUgYnkgbmFtZS5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpGb250U2l6ZXNcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNpemUgLSBmb250IHNpemUgbmFtZS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge3t9fSAtIEhhc2hNYXAuIHB4OiB2YWx1ZSBpbiBwaXhlbHMsIHJlbDogcmVsYXRpdmUgdmFsdWVcclxuICAgICAqL1xyXG4gICAgZ2V0U2l6ZShzaXplKSB7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIHNpemUgaXMgYWxpYXM/XHJcbiAgICAgICAgc2l6ZSA9IHNpemUucmVwbGFjZShcIkBkMlwiLCBcIjJcIik7XHJcbiAgICAgICAgc2l6ZSA9IHNpemUucmVwbGFjZShcIkB4MlwiLCBcIjFcIik7XHJcblxyXG4gICAgICAgIGlmIChzaXplIGluIHRoaXMuYWxpYXNlcykge1xyXG4gICAgICAgICAgICBzaXplID0gdGhpcy5hbGlhc2VzW3NpemVdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IG51bGw7XHJcblxyXG4gICAgICAgIGlmIChzaXplIGluIHRoaXMuZm9udFNpemVzKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZm9udFNpemVzW3NpemVdO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2l6ZS5tYXRjaCgvXlstMC05XSskLykpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5nZW5TaXplKHBhcnNlSW50KHNpemUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzaXplICsgXCI6IFwiICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0LCBudWxsICwgMikgKyBcIiBcIiArIChzaXplIGluIHRoaXMuZm9udFNpemVzKS50b1N0cmluZygpKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGZvbnQgc2l6ZSB0byBuYW1lLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOkZvbnRTaXplc1xyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2l6ZSAtIGZvbnQgc2l6ZSBuYW1lLlxyXG4gICAgICogQHBhcmFtIHZhbHVlIC0gSGFzaE1hcC4gcHg6IHZhbHVlIGluIHBpeGVscywgcmVsOiByZWxhdGl2ZSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBzZXRTaXplKHNpemUsIHZhbHVlKSB7XHJcbiAgICAgICAgc2l6ZSA9IHNpemUucmVwbGFjZShcIkBkMlwiLCBcIjJcIik7XHJcbiAgICAgICAgc2l6ZSA9IHNpemUucmVwbGFjZShcIkB4MlwiLCBcIjFcIik7XHJcbiAgICAgICAgLy8gQ2hlY2sgc2l6ZSBpcyBhbGlhcz9cclxuICAgICAgICBpZiAoc2l6ZSBpbiB0aGlzLmFsaWFzZXMpIHtcclxuICAgICAgICAgICAgc2l6ZSA9IHRoaXMuYWxpYXNlc1tzaXplXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5mb250U2l6ZXNbc2l6ZV0gPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBGb250IFNpemVzIHRvIEZvbnQgU2l6ZSBDb2xsZWN0aW9uLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOkZvbnRTaXplc1xyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2l6ZXMgLSBzdHJpbmcgbGlrZSBcIm5hbWUxIDIxcHggMS41LCBuYW1lMiAxOHB4LCBuYW1lMyAxLjVcIi4gZm9ybWF0OiBuYW1lIHBpeGVsU2l6ZSByZWxhdGl2ZVNpemUuXHJcbiAgICAgKiBTZXBhcmF0b3IgZm9yIGZvbnQgc2l6ZXMgaXMgXCIsXCIuXHJcbiAgICAgKiBJZiBwaXhlbCBvciByZWxhdGl2ZSBzaXplIGl0J3MgcHJlc2VudCB0aGVuIGl0IGNhbiBiZSBnZW5lcmF0ZWQuXHJcbiAgICAgKiBAcGFyYW0gcmh5dGhtQ2FsY3VsYXRvciAtIGluc3RhbmNlIG9mIFZlcnRpY2FsUmh5dGhtIENsYXNzLlxyXG4gICAgICovXHJcbiAgICBhZGRGb250U2l6ZXMoc2l6ZXMsIHJoeXRobUNhbGN1bGF0b3IpIHtcclxuXHJcbiAgICAgICAgbGV0IGZvbnRTaXplcyA9IHNpemVzLnNwbGl0KC9cXHMqLFxccyovKTtcclxuICAgICAgICBmb3IobGV0IGkgPSAwLCBsZW4gPSBmb250U2l6ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xyXG4gICAgICAgICAgICBsZXQgZm9udFNpemVJbmZvID0gZm9udFNpemVzW2ldLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgICAgIGlmIChmb250U2l6ZUluZm8ubGVuZ3RoID49IDIpIHtcclxuICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZSA9IHtweDogMCwgcmVsOiAwfTtcclxuICAgICAgICAgICAgICAgIGlmIChpc0hhcyhmb250U2l6ZUluZm9bMV0sIFwicHhcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZS5yZWwgPSAoZm9udFNpemVJbmZvLmxlbmd0aCA9PT0gMilcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyByaHl0aG1DYWxjdWxhdG9yLmNvbnZlcnQoZm9udFNpemVJbmZvWzFdLCBVTklULkVNKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGZvbnRTaXplSW5mb1syXTtcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZS5weCA9IHBhcnNlSW50KGZvbnRTaXplSW5mb1sxXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplLnJlbCA9IHBhcnNlRmxvYXQoZm9udFNpemVJbmZvWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZS5weCA9IHJoeXRobUNhbGN1bGF0b3IuY29udmVydChmb250U2l6ZUluZm9bMV0sIFVOSVQuUFgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTaXplKGZvbnRTaXplSW5mb1swXSwgZm9udFNpemUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG4vKipcclxuICogRXhwb3J0IEZvbnRTaXplcyBDbGFzcy5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IEZvbnRTaXplczsiXX0=
