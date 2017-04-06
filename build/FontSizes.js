"use strict";

exports.__esModule = true;

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
     * Use settings["font-ratio"] - font scale ratio and settings["font-size"] - base font size(will be 0 size).
     * All sizes will be generated from base font size * ratio.
     */
    function FontSizes(settings) {
        _classCallCheck(this, FontSizes);

        var fontRatio = {
            "golden": {
                "desc": "1:1.618",
                "value": 1.618
            },
            "double-octave": {
                "desc": "1:4",
                "value": 4
            },
            "major-twelfth": {
                "desc": "1:3",
                "value": 3
            },
            "major-eleventh": {
                "desc": "3:8",
                "value": 2.667
            },
            "major-tenth": {
                "desc": "2:5",
                "value": 2.5
            },
            "octave": {
                "desc": "1:2",
                "value": 2
            },
            "major-seventh": {
                "desc": "8:15",
                "value": 1.875
            },
            "minor-seventh": {
                "desc": "9:16",
                "value": 1.778
            },
            "major-sixth": {
                "desc": "3:5",
                "value": 1.667
            },
            "minor-sixth": {
                "desc": "5:8",
                "value": 1.6
            },
            "perfect-fifth": {
                "desc": "2:3",
                "value": 1.5
            },
            "augmented-fourth": {
                "desc": "1:√2",
                "value": 1.414
            },
            "perfect-fourth": {
                "desc": "3:4",
                "value": 1.333
            },
            "major-third": {
                "desc": "4:5",
                "value": 1.25
            },
            "minor-third": {
                "desc": "5:6",
                "value": 1.2
            },
            "major-second": {
                "desc": "8:9",
                "value": 1.125
            },
            "minor-second": {
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
            "tiny@x2": "-2@x2",
            "t@x2": "-2@x2",
            "small@x2": "-1@x2",
            "s@x2": "-1@x2",
            "base@x2": "0@x2",
            "b@x2": "0@x2",
            "medium@x2": "1@x2",
            "m@x2": "1@x2",
            "large@x2": "2@x2",
            "l@x2": "2@x2",
            "xlarge@x2": "3@x2",
            "xl@x2": "3@x2",
            "xxlarge@x2": "4@x2",
            "xxl@x2": "4@x2",
            "xxxlarge@x2": "5@x2",
            "xxxl@x2": "5@x2"
        };

        if (settings["font-ratio"] in fontRatio) {

            this.ratio = fontRatio[settings["font-ratio"]].value;
            this.desc = fontRatio[settings["font-ratio"]].desc;
        } else {

            this.ratio = parseFloat(settings["font-ratio"]);
            this.desc = "Custom font ratio";
        }

        // BaseFontSize
        this.baseSize = parseInt(settings["font-size"]);

        // making fontsize collection
        if (this.ratio > 0 && this.baseSize > 0) {
            // font Collection
            this.fontSizes = {};
            for (var i = -2; i <= 5; i++) {
                // Make size from -2 to 5
                this.fontSizes[i] = this.genSize(i);
                // Make double size from -2 to 5
                this.fontSizes[i + "@x2"] = this.genSize(i, 2);
            }
        }
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


        var value = {};

        var baseFontSize = this.baseSize;

        if (scale > 0) {
            baseFontSize = baseFontSize * scale;
        }

        if (this.ratio == 0 || baseFontSize == null) {
            return value;
        }

        if (size >= 0) {

            value.rel = Math.pow(this.ratio, size);
            value.px = baseFontSize * value.rel;
        } else {

            value.rel = 1 / Math.pow(this.ratio, Math.abs(size));
            value.px = baseFontSize * value.rel;
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
        if (size in this.aliases) {
            size = this.aliases[size];
        }

        var result = 0;

        if (size in this.fontSizes) {
            result = this.fontSizes[size];
        } else {
            if (size.match(/^\-*\d+$/)) {
                result = this.genSize(size);
            }
        }
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

        var fontSizesInfo = sizes.split(/\s*\,\s*/);

        for (var i = 0; i < fontSizesInfo.length; i++) {

            var fontSizeInfo = fontSizesInfo[i].split(/\s+/);
            if (fontSizeInfo.length >= 2) {
                var fontSize = {};
                if (fontSizeInfo[1].match(/px$/i)) {
                    fontSize.rel = fontSizeInfo.length == 2 ? rhythmCalculator.convert(fontSizeInfo[1], "em") : fontSizeInfo[2];
                    fontSize.px = parseInt(fontSizeInfo[1]);
                } else {
                    fontSize.rel = parseFloat(fontSizeInfo[1]);
                    fontSize.px = rhythmCalculator.convert(fontSizeInfo[1], "px");
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZvbnRTaXplcy5lczYiXSwibmFtZXMiOlsiRm9udFNpemVzIiwic2V0dGluZ3MiLCJmb250UmF0aW8iLCJhbGlhc2VzIiwicmF0aW8iLCJ2YWx1ZSIsImRlc2MiLCJwYXJzZUZsb2F0IiwiYmFzZVNpemUiLCJwYXJzZUludCIsImZvbnRTaXplcyIsImkiLCJnZW5TaXplIiwic2l6ZSIsInNjYWxlIiwiYmFzZUZvbnRTaXplIiwicmVsIiwiTWF0aCIsInBvdyIsInB4IiwiYWJzIiwiZ2V0U2l6ZSIsInJlc3VsdCIsIm1hdGNoIiwic2V0U2l6ZSIsImFkZEZvbnRTaXplcyIsInNpemVzIiwicmh5dGhtQ2FsY3VsYXRvciIsImZvbnRTaXplc0luZm8iLCJzcGxpdCIsImxlbmd0aCIsImZvbnRTaXplSW5mbyIsImZvbnRTaXplIiwiY29udmVydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7O0lBV01BLFM7QUFDRjs7Ozs7Ozs7OztBQVVBLHVCQUFZQyxRQUFaLEVBQXNCO0FBQUE7O0FBRWxCLFlBQUlDLFlBQVk7QUFDWixzQkFBVTtBQUNOLHdCQUFRLFNBREY7QUFFTix5QkFBUztBQUZILGFBREU7QUFLWiw2QkFBaUI7QUFDYix3QkFBUSxLQURLO0FBRWIseUJBQVM7QUFGSSxhQUxMO0FBU1osNkJBQWlCO0FBQ2Isd0JBQVEsS0FESztBQUViLHlCQUFTO0FBRkksYUFUTDtBQWFaLDhCQUFrQjtBQUNkLHdCQUFRLEtBRE07QUFFZCx5QkFBUztBQUZLLGFBYk47QUFpQlosMkJBQWU7QUFDWCx3QkFBUSxLQURHO0FBRVgseUJBQVM7QUFGRSxhQWpCSDtBQXFCWixzQkFBVTtBQUNOLHdCQUFRLEtBREY7QUFFTix5QkFBUztBQUZILGFBckJFO0FBeUJaLDZCQUFpQjtBQUNiLHdCQUFRLE1BREs7QUFFYix5QkFBUztBQUZJLGFBekJMO0FBNkJaLDZCQUFpQjtBQUNiLHdCQUFRLE1BREs7QUFFYix5QkFBUztBQUZJLGFBN0JMO0FBaUNaLDJCQUFlO0FB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emVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBtb2R1bGUgRm9udFNpemVzXHJcbiAqIFxyXG4gKiBAZGVzY3JpcHRpb24gRm9udCBzaXplIGNvbGxlY3Rpb24gbWFuYWdlciBhbmQgZ2VuZXJhdG9yIHByb3BvcnRpb25hbCBmb250cyBzaXplcyB3aXRoIGFsaWFzZXMuXHJcbiAqXHJcbiAqIEB2ZXJzaW9uIDEuMFxyXG4gKiBAYXV0aG9yIEdyaWdvcnkgVmFzaWx5ZXYgPHBvc3Rjc3MuaGFtc3RlckBnbWFpbC5jb20+IGh0dHBzOi8vZ2l0aHViLmNvbS9oMHRjMGQzXHJcbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE3LCBHcmlnb3J5IFZhc2lseWV2XHJcbiAqIEBsaWNlbnNlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCwgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wIFxyXG4gKiBcclxuICovXHJcbmNsYXNzIEZvbnRTaXplcyB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdG9yIGZvciBmb250IHNpemUgY29sbGVjdGlvbiBtYW5hZ2VyLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOkZvbnRTaXplc1xyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gc2V0dGluZ3MgLSBzZXR0aW5ncy5cclxuICAgICAqIFxyXG4gICAgICogVXNlIHNldHRpbmdzW1wiZm9udC1yYXRpb1wiXSAtIGZvbnQgc2NhbGUgcmF0aW8gYW5kIHNldHRpbmdzW1wiZm9udC1zaXplXCJdIC0gYmFzZSBmb250IHNpemUod2lsbCBiZSAwIHNpemUpLlxyXG4gICAgICogQWxsIHNpemVzIHdpbGwgYmUgZ2VuZXJhdGVkIGZyb20gYmFzZSBmb250IHNpemUgKiByYXRpby5cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Ioc2V0dGluZ3MpIHtcclxuXHJcbiAgICAgICAgbGV0IGZvbnRSYXRpbyA9IHtcclxuICAgICAgICAgICAgXCJnb2xkZW5cIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMToxLjYxOFwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjYxOFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImRvdWJsZS1vY3RhdmVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMTo0XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDRcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtYWpvci10d2VsZnRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjE6M1wiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAzXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3ItZWxldmVudGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMzo4XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDIuNjY3XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3ItdGVudGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMjo1XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDIuNVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm9jdGF2ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIxOjJcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1ham9yLXNldmVudGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiODoxNVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjg3NVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1pbm9yLXNldmVudGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiOToxNlwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjc3OFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1ham9yLXNpeHRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjM6NVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjY2N1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1pbm9yLXNpeHRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjU6OFwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjZcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJwZXJmZWN0LWZpZnRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjI6M1wiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJhdWdtZW50ZWQtZm91cnRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjE64oiaMlwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjQxNFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInBlcmZlY3QtZm91cnRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjM6NFwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjMzM1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1ham9yLXRoaXJkXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjQ6NVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjI1XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWlub3ItdGhpcmRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiNTo2XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuMlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1ham9yLXNlY29uZFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCI4OjlcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS4xMjVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtaW5vci1zZWNvbmRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMTU6MTZcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS4wNjdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWxpYXNlcyA9IHtcclxuICAgICAgICAgICAgXCJ0aW55XCI6IFwiLTJcIixcclxuICAgICAgICAgICAgXCJ0XCI6IFwiLTJcIixcclxuICAgICAgICAgICAgXCJzbWFsbFwiOiBcIi0xXCIsXHJcbiAgICAgICAgICAgIFwic1wiOiBcIi0xXCIsXHJcbiAgICAgICAgICAgIFwiYmFzZVwiOiBcIjBcIixcclxuICAgICAgICAgICAgXCJiXCI6IFwiMFwiLFxyXG4gICAgICAgICAgICBcIm1lZGl1bVwiOiBcIjFcIixcclxuICAgICAgICAgICAgXCJtXCI6IFwiMVwiLFxyXG4gICAgICAgICAgICBcImxhcmdlXCI6IFwiMlwiLFxyXG4gICAgICAgICAgICBcImxcIjogXCIyXCIsXHJcbiAgICAgICAgICAgIFwieGxhcmdlXCI6IFwiM1wiLFxyXG4gICAgICAgICAgICBcInhsXCI6IFwiM1wiLFxyXG4gICAgICAgICAgICBcInh4bGFyZ2VcIjogXCI0XCIsXHJcbiAgICAgICAgICAgIFwieHhsXCI6IFwiNFwiLFxyXG4gICAgICAgICAgICBcInh4eGxhcmdlXCI6IFwiNVwiLFxyXG4gICAgICAgICAgICBcInh4eGxcIjogXCI1XCIsXHJcbiAgICAgICAgICAgIC8vRG91YmxlIHNjYWxlZCBzaXplc1xyXG4gICAgICAgICAgICBcInRpbnlAeDJcIjogXCItMkB4MlwiLFxyXG4gICAgICAgICAgICBcInRAeDJcIjogXCItMkB4MlwiLFxyXG4gICAgICAgICAgICBcInNtYWxsQHgyXCI6IFwiLTFAeDJcIixcclxuICAgICAgICAgICAgXCJzQHgyXCI6IFwiLTFAeDJcIixcclxuICAgICAgICAgICAgXCJiYXNlQHgyXCI6IFwiMEB4MlwiLFxyXG4gICAgICAgICAgICBcImJAeDJcIjogXCIwQHgyXCIsXHJcbiAgICAgICAgICAgIFwibWVkaXVtQHgyXCI6IFwiMUB4MlwiLFxyXG4gICAgICAgICAgICBcIm1AeDJcIjogXCIxQHgyXCIsXHJcbiAgICAgICAgICAgIFwibGFyZ2VAeDJcIjogXCIyQHgyXCIsXHJcbiAgICAgICAgICAgIFwibEB4MlwiOiBcIjJAeDJcIixcclxuICAgICAgICAgICAgXCJ4bGFyZ2VAeDJcIjogXCIzQHgyXCIsXHJcbiAgICAgICAgICAgIFwieGxAeDJcIjogXCIzQHgyXCIsXHJcbiAgICAgICAgICAgIFwieHhsYXJnZUB4MlwiOiBcIjRAeDJcIixcclxuICAgICAgICAgICAgXCJ4eGxAeDJcIjogXCI0QHgyXCIsXHJcbiAgICAgICAgICAgIFwieHh4bGFyZ2VAeDJcIjogXCI1QHgyXCIsXHJcbiAgICAgICAgICAgIFwieHh4bEB4MlwiOiBcIjVAeDJcIlxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChzZXR0aW5nc1tcImZvbnQtcmF0aW9cIl0gaW4gZm9udFJhdGlvKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJhdGlvID0gZm9udFJhdGlvW3NldHRpbmdzW1wiZm9udC1yYXRpb1wiXV0udmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzYyA9IGZvbnRSYXRpb1tzZXR0aW5nc1tcImZvbnQtcmF0aW9cIl1dLmRlc2M7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJhdGlvID0gcGFyc2VGbG9hdChzZXR0aW5nc1tcImZvbnQtcmF0aW9cIl0pO1xyXG4gICAgICAgICAgICB0aGlzLmRlc2MgPSBcIkN1c3RvbSBmb250IHJhdGlvXCI7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQmFzZUZvbnRTaXplXHJcbiAgICAgICAgdGhpcy5iYXNlU2l6ZSA9IHBhcnNlSW50KHNldHRpbmdzW1wiZm9udC1zaXplXCJdKTtcclxuXHJcbiAgICAgICAgLy8gbWFraW5nIGZvbnRzaXplIGNvbGxlY3Rpb25cclxuICAgICAgICBpZiAodGhpcy5yYXRpbyA+IDAgJiYgdGhpcy5iYXNlU2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgLy8gZm9udCBDb2xsZWN0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuZm9udFNpemVzID0ge307XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAtMjsgaSA8PSA1OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIC8vIE1ha2Ugc2l6ZSBmcm9tIC0yIHRvIDVcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9udFNpemVzW2ldID0gdGhpcy5nZW5TaXplKGkpO1xyXG4gICAgICAgICAgICAgICAgLy8gTWFrZSBkb3VibGUgc2l6ZSBmcm9tIC0yIHRvIDVcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9udFNpemVzW2kgKyBcIkB4MlwiXSA9IHRoaXMuZ2VuU2l6ZShpLCAyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBmb250IHNpemVzIGZvciByZWxhdGl2ZSBwcm9wb3J0aW9uYWwgc2l6ZS5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpGb250U2l6ZXNcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemUgLSBQcm9wb3J0aW9uYWwgc2l6ZSBsaWtlIC0yLCAwLCAxLCAzIGV0Yy5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY2FsZSAtIHNjYWxlIGJhc2UgZm9udCBzaXplLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7e319IC0gSGFzaE1hcC4gcHg6IHZhbHVlIGluIHBpeGVscywgcmVsOiByZWxhdGl2ZSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBnZW5TaXplKHNpemUsIHNjYWxlID0gMCkge1xyXG5cclxuICAgICAgICBsZXQgdmFsdWUgPSB7fTtcclxuXHJcbiAgICAgICAgbGV0IGJhc2VGb250U2l6ZSA9IHRoaXMuYmFzZVNpemU7XHJcblxyXG4gICAgICAgIGlmIChzY2FsZSA+IDApIHtcclxuICAgICAgICAgICAgYmFzZUZvbnRTaXplID0gYmFzZUZvbnRTaXplICogc2NhbGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5yYXRpbyA9PSAwIHx8IGJhc2VGb250U2l6ZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzaXplID49IDApIHtcclxuXHJcbiAgICAgICAgICAgIHZhbHVlLnJlbCA9IE1hdGgucG93KHRoaXMucmF0aW8sIHNpemUpO1xyXG4gICAgICAgICAgICB2YWx1ZS5weCA9IGJhc2VGb250U2l6ZSAqIHZhbHVlLnJlbDtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIHZhbHVlLnJlbCA9IDEgLyBNYXRoLnBvdyh0aGlzLnJhdGlvLCBNYXRoLmFicyhzaXplKSk7XHJcbiAgICAgICAgICAgIHZhbHVlLnB4ID0gYmFzZUZvbnRTaXplICogdmFsdWUucmVsO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgZm9udCBzaXplIGJ5IG5hbWUuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaXplIC0gZm9udCBzaXplIG5hbWUuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHt7fX0gLSBIYXNoTWFwLiBweDogdmFsdWUgaW4gcGl4ZWxzLCByZWw6IHJlbGF0aXZlIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIGdldFNpemUoc2l6ZSkge1xyXG5cclxuICAgICAgICAvLyBDaGVjayBzaXplIGlzIGFsaWFzP1xyXG4gICAgICAgIGlmIChzaXplIGluIHRoaXMuYWxpYXNlcykge1xyXG4gICAgICAgICAgICBzaXplID0gdGhpcy5hbGlhc2VzW3NpemVdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IDA7XHJcblxyXG4gICAgICAgIGlmIChzaXplIGluIHRoaXMuZm9udFNpemVzKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZm9udFNpemVzW3NpemVdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChzaXplLm1hdGNoKC9eXFwtKlxcZCskLykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZ2VuU2l6ZShzaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGZvbnQgc2l6ZSB0byBuYW1lLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOkZvbnRTaXplc1xyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2l6ZSAtIGZvbnQgc2l6ZSBuYW1lLlxyXG4gICAgICogQHBhcmFtIHZhbHVlIC0gSGFzaE1hcC4gcHg6IHZhbHVlIGluIHBpeGVscywgcmVsOiByZWxhdGl2ZSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBzZXRTaXplKHNpemUsIHZhbHVlKSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgc2l6ZSBpcyBhbGlhcz9cclxuICAgICAgICBpZiAoc2l6ZSBpbiB0aGlzLmFsaWFzZXMpIHtcclxuICAgICAgICAgICAgc2l6ZSA9IHRoaXMuYWxpYXNlc1tzaXplXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5mb250U2l6ZXNbc2l6ZV0gPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBGb250IFNpemVzIHRvIEZvbnQgU2l6ZSBDb2xsZWN0aW9uLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOkZvbnRTaXplc1xyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2l6ZXMgLSBzdHJpbmcgbGlrZSBcIm5hbWUxIDIxcHggMS41LCBuYW1lMiAxOHB4LCBuYW1lMyAxLjVcIi4gZm9ybWF0OiBuYW1lIHBpeGVsU2l6ZSByZWxhdGl2ZVNpemUuXHJcbiAgICAgKiBTZXBhcmF0b3IgZm9yIGZvbnQgc2l6ZXMgaXMgXCIsXCIuXHJcbiAgICAgKiBJZiBwaXhlbCBvciByZWxhdGl2ZSBzaXplIGl0J3MgcHJlc2VudCB0aGVuIGl0IGNhbiBiZSBnZW5lcmF0ZWQuXHJcbiAgICAgKiBAcGFyYW0gcmh5dGhtQ2FsY3VsYXRvciAtIGluc3RhbmNlIG9mIFZlcnRpY2FsUmh5dGhtIENsYXNzLlxyXG4gICAgICovXHJcbiAgICBhZGRGb250U2l6ZXMoc2l6ZXMsIHJoeXRobUNhbGN1bGF0b3IpIHtcclxuXHJcbiAgICAgICAgbGV0IGZvbnRTaXplc0luZm8gPSBzaXplcy5zcGxpdCgvXFxzKlxcLFxccyovKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmb250U2l6ZXNJbmZvLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZm9udFNpemVJbmZvID0gZm9udFNpemVzSW5mb1tpXS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgICAgICBpZiAoZm9udFNpemVJbmZvLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm9udFNpemUgPSB7fTtcclxuICAgICAgICAgICAgICAgIGlmIChmb250U2l6ZUluZm9bMV0ubWF0Y2goL3B4JC9pKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplLnJlbCA9IChmb250U2l6ZUluZm8ubGVuZ3RoID09IDIpID8gcmh5dGhtQ2FsY3VsYXRvci5jb252ZXJ0KGZvbnRTaXplSW5mb1sxXSwgXCJlbVwiKSA6IGZvbnRTaXplSW5mb1syXTtcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZS5weCA9IHBhcnNlSW50KGZvbnRTaXplSW5mb1sxXSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplLnJlbCA9IHBhcnNlRmxvYXQoZm9udFNpemVJbmZvWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZS5weCA9IHJoeXRobUNhbGN1bGF0b3IuY29udmVydChmb250U2l6ZUluZm9bMV0sIFwicHhcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFNpemUoZm9udFNpemVJbmZvWzBdLCBmb250U2l6ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufVxyXG4vKipcclxuICogRXhwb3J0IEZvbnRTaXplcyBDbGFzcy5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IEZvbnRTaXplczsiXX0=
