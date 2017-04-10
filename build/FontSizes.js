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
            "xxxl@x2": "5@x2",
            //Double divided sizes
            "tiny@d2": "-2@d2",
            "t@d2": "-2@d2",
            "small@d2": "-1@d2",
            "s@d2": "-1@d2",
            "base@d2": "0@d2",
            "b@d2": "0@d2",
            "medium@d2": "1@d2",
            "m@d2": "1@d2",
            "large@d2": "2@d2",
            "l@d2": "2@d2",
            "xlarge@d2": "3@d2",
            "xl@d2": "3@d2",
            "xxlarge@d2": "4@d2",
            "xxl@d2": "4@d2",
            "xxxlarge@d2": "5@d2",
            "xxxl@d2": "5@d2"
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
                // Make double divided size from -2 to 5
                this.fontSizes[i + "@d2"] = this.genSize(i, 0.5);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZvbnRTaXplcy5lczYiXSwibmFtZXMiOlsiRm9udFNpemVzIiwic2V0dGluZ3MiLCJmb250UmF0aW8iLCJhbGlhc2VzIiwicmF0aW8iLCJ2YWx1ZSIsImRlc2MiLCJwYXJzZUZsb2F0IiwiYmFzZVNpemUiLCJwYXJzZUludCIsImZvbnRTaXplcyIsImkiLCJnZW5TaXplIiwic2l6ZSIsInNjYWxlIiwiYmFzZUZvbnRTaXplIiwicmVsIiwiTWF0aCIsInBvdyIsInB4IiwiYWJzIiwiZ2V0U2l6ZSIsInJlc3VsdCIsIm1hdGNoIiwic2V0U2l6ZSIsImFkZEZvbnRTaXplcyIsInNpemVzIiwicmh5dGhtQ2FsY3VsYXRvciIsImZvbnRTaXplc0luZm8iLCJzcGxpdCIsImxlbmd0aCIsImZvbnRTaXplSW5mbyIsImZvbnRTaXplIiwiY29udmVydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7O0lBV01BLFM7QUFDRjs7Ozs7Ozs7OztBQVVBLHVCQUFZQyxRQUFaLEVBQXNCO0FBQUE7O0FBRWxCLFlBQUlDLFlBQVk7QUFDWixzQkFBVTtBQUNOLHdCQUFRLFNBREY7QUFFTix5QkFBUztBQUZILGFBREU7QUFLWiw2QkFBaUI7QUFDYix3QkFBUSxLQURLO0FBRWIseUJBQVM7QUFGSSxhQUxMO0FBU1osNkJBQWlCO0FBQ2Isd0JBQVEsS0FESztBQUViLHlCQUFTO0FBRkksYUFUTDtBQWFaLDhCQUFrQjtBQUNkLHdCQUFRLEtBRE07QUFFZCx5QkFBUztBQUZLLGFBYk47QUFpQlosMkJBQWU7QUFDWCx3QkFBUSxLQURHO0FBRVgseUJBQVM7QUFGRSxhQWpCSDtBQXFCWixzQkFBVTtBQUNOLHdCQUFRLEtBREY7QUFFTix5QkFBUztBQUZILGFBckJFO0FBeUJaLDZCQUFpQjtBQUNiLHdCQUFRLE1BREs7QUFFYix5QkFBUztBQUZJLGFBekJMO0FBNkJaLDZCQUFpQjtBQUNiLHdCQUFRLE1BREs7QUFFYix5QkFBUztBQUZJLGFBN0JMO0FBaUNaLDJCQUFlO0FB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QixDQUFzQixNQUF0QixDQUFKLEVBQW1DO0FBQy9CUyw2QkFBU2hCLEdBQVQsR0FBZ0JlLGFBQWFELE1BQWIsSUFBdUIsQ0FBeEIsR0FBNkJILGlCQUFpQk0sT0FBakIsQ0FBeUJGLGFBQWEsQ0FBYixDQUF6QixFQUEwQyxJQUExQyxDQUE3QixHQUErRUEsYUFBYSxDQUFiLENBQTlGO0FBQ0FDLDZCQUFTYixFQUFULEdBQWNWLFNBQVNzQixhQUFhLENBQWIsQ0FBVCxDQUFkO0FBQ0gsaUJBSEQsTUFHTztBQUNIQyw2QkFBU2hCLEdBQVQsR0FBZVQsV0FBV3dCLGFBQWEsQ0FBYixDQUFYLENBQWY7QUFDQUMsNkJBQVNiLEVBQVQsR0FBY1EsaUJBQWlCTSxPQUFqQixDQUF5QkYsYUFBYSxDQUFiLENBQXpCLEVBQTBDLElBQTFDLENBQWQ7QUFDSDtBQUNELHFCQUFLUCxPQUFMLENBQWFPLGFBQWEsQ0FBYixDQUFiLEVBQThCQyxRQUE5QjtBQUNIO0FBQ0o7QUFFSixLOzs7O0FBR0w7Ozs7O2tCQUdlaEMsUyIsImZpbGUiOiJGb250U2l6ZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG1vZHVsZSBGb250U2l6ZXNcclxuICogXHJcbiAqIEBkZXNjcmlwdGlvbiBGb250IHNpemUgY29sbGVjdGlvbiBtYW5hZ2VyIGFuZCBnZW5lcmF0b3IgcHJvcG9ydGlvbmFsIGZvbnRzIHNpemVzIHdpdGggYWxpYXNlcy5cclxuICpcclxuICogQHZlcnNpb24gMS4wXHJcbiAqIEBhdXRob3IgR3JpZ29yeSBWYXNpbHlldiA8cG9zdGNzcy5oYW1zdGVyQGdtYWlsLmNvbT4gaHR0cHM6Ly9naXRodWIuY29tL2gwdGMwZDNcclxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTcsIEdyaWdvcnkgVmFzaWx5ZXZcclxuICogQGxpY2Vuc2UgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wLCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAgXHJcbiAqIFxyXG4gKi9cclxuY2xhc3MgRm9udFNpemVzIHtcclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0b3IgZm9yIGZvbnQgc2l6ZSBjb2xsZWN0aW9uIG1hbmFnZXIuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBzZXR0aW5ncyAtIHNldHRpbmdzLlxyXG4gICAgICogXHJcbiAgICAgKiBVc2Ugc2V0dGluZ3NbXCJmb250LXJhdGlvXCJdIC0gZm9udCBzY2FsZSByYXRpbyBhbmQgc2V0dGluZ3NbXCJmb250LXNpemVcIl0gLSBiYXNlIGZvbnQgc2l6ZSh3aWxsIGJlIDAgc2l6ZSkuXHJcbiAgICAgKiBBbGwgc2l6ZXMgd2lsbCBiZSBnZW5lcmF0ZWQgZnJvbSBiYXNlIGZvbnQgc2l6ZSAqIHJhdGlvLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzZXR0aW5ncykge1xyXG5cclxuICAgICAgICBsZXQgZm9udFJhdGlvID0ge1xyXG4gICAgICAgICAgICBcImdvbGRlblwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIxOjEuNjE4XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNjE4XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiZG91YmxlLW9jdGF2ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIxOjRcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogNFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1ham9yLXR3ZWxmdGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMTozXCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDNcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtYWpvci1lbGV2ZW50aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIzOjhcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMi42NjdcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtYWpvci10ZW50aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIyOjVcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMi41XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwib2N0YXZlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjE6MlwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAyXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3Itc2V2ZW50aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCI4OjE1XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuODc1XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWlub3Itc2V2ZW50aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCI5OjE2XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNzc4XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3Itc2l4dGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMzo1XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNjY3XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWlub3Itc2l4dGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiNTo4XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInBlcmZlY3QtZmlmdGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMjozXCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImF1Z21lbnRlZC1mb3VydGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMTriiJoyXCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuNDE0XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwicGVyZmVjdC1mb3VydGhcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiMzo0XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuMzMzXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3ItdGhpcmRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJkZXNjXCI6IFwiNDo1XCIsXHJcbiAgICAgICAgICAgICAgICBcInZhbHVlXCI6IDEuMjVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtaW5vci10aGlyZFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCI1OjZcIixcclxuICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMS4yXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibWFqb3Itc2Vjb25kXCI6IHtcclxuICAgICAgICAgICAgICAgIFwiZGVzY1wiOiBcIjg6OVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjEyNVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm1pbm9yLXNlY29uZFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcImRlc2NcIjogXCIxNToxNlwiLFxyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLjA2N1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hbGlhc2VzID0ge1xyXG4gICAgICAgICAgICBcInRpbnlcIjogXCItMlwiLFxyXG4gICAgICAgICAgICBcInRcIjogXCItMlwiLFxyXG4gICAgICAgICAgICBcInNtYWxsXCI6IFwiLTFcIixcclxuICAgICAgICAgICAgXCJzXCI6IFwiLTFcIixcclxuICAgICAgICAgICAgXCJiYXNlXCI6IFwiMFwiLFxyXG4gICAgICAgICAgICBcImJcIjogXCIwXCIsXHJcbiAgICAgICAgICAgIFwibWVkaXVtXCI6IFwiMVwiLFxyXG4gICAgICAgICAgICBcIm1cIjogXCIxXCIsXHJcbiAgICAgICAgICAgIFwibGFyZ2VcIjogXCIyXCIsXHJcbiAgICAgICAgICAgIFwibFwiOiBcIjJcIixcclxuICAgICAgICAgICAgXCJ4bGFyZ2VcIjogXCIzXCIsXHJcbiAgICAgICAgICAgIFwieGxcIjogXCIzXCIsXHJcbiAgICAgICAgICAgIFwieHhsYXJnZVwiOiBcIjRcIixcclxuICAgICAgICAgICAgXCJ4eGxcIjogXCI0XCIsXHJcbiAgICAgICAgICAgIFwieHh4bGFyZ2VcIjogXCI1XCIsXHJcbiAgICAgICAgICAgIFwieHh4bFwiOiBcIjVcIixcclxuICAgICAgICAgICAgLy9Eb3VibGUgc2NhbGVkIHNpemVzXHJcbiAgICAgICAgICAgIFwidGlueUB4MlwiOiBcIi0yQHgyXCIsXHJcbiAgICAgICAgICAgIFwidEB4MlwiOiBcIi0yQHgyXCIsXHJcbiAgICAgICAgICAgIFwic21hbGxAeDJcIjogXCItMUB4MlwiLFxyXG4gICAgICAgICAgICBcInNAeDJcIjogXCItMUB4MlwiLFxyXG4gICAgICAgICAgICBcImJhc2VAeDJcIjogXCIwQHgyXCIsXHJcbiAgICAgICAgICAgIFwiYkB4MlwiOiBcIjBAeDJcIixcclxuICAgICAgICAgICAgXCJtZWRpdW1AeDJcIjogXCIxQHgyXCIsXHJcbiAgICAgICAgICAgIFwibUB4MlwiOiBcIjFAeDJcIixcclxuICAgICAgICAgICAgXCJsYXJnZUB4MlwiOiBcIjJAeDJcIixcclxuICAgICAgICAgICAgXCJsQHgyXCI6IFwiMkB4MlwiLFxyXG4gICAgICAgICAgICBcInhsYXJnZUB4MlwiOiBcIjNAeDJcIixcclxuICAgICAgICAgICAgXCJ4bEB4MlwiOiBcIjNAeDJcIixcclxuICAgICAgICAgICAgXCJ4eGxhcmdlQHgyXCI6IFwiNEB4MlwiLFxyXG4gICAgICAgICAgICBcInh4bEB4MlwiOiBcIjRAeDJcIixcclxuICAgICAgICAgICAgXCJ4eHhsYXJnZUB4MlwiOiBcIjVAeDJcIixcclxuICAgICAgICAgICAgXCJ4eHhsQHgyXCI6IFwiNUB4MlwiLFxyXG4gICAgICAgICAgICAvL0RvdWJsZSBkaXZpZGVkIHNpemVzXHJcbiAgICAgICAgICAgIFwidGlueUBkMlwiOiBcIi0yQGQyXCIsXHJcbiAgICAgICAgICAgIFwidEBkMlwiOiBcIi0yQGQyXCIsXHJcbiAgICAgICAgICAgIFwic21hbGxAZDJcIjogXCItMUBkMlwiLFxyXG4gICAgICAgICAgICBcInNAZDJcIjogXCItMUBkMlwiLFxyXG4gICAgICAgICAgICBcImJhc2VAZDJcIjogXCIwQGQyXCIsXHJcbiAgICAgICAgICAgIFwiYkBkMlwiOiBcIjBAZDJcIixcclxuICAgICAgICAgICAgXCJtZWRpdW1AZDJcIjogXCIxQGQyXCIsXHJcbiAgICAgICAgICAgIFwibUBkMlwiOiBcIjFAZDJcIixcclxuICAgICAgICAgICAgXCJsYXJnZUBkMlwiOiBcIjJAZDJcIixcclxuICAgICAgICAgICAgXCJsQGQyXCI6IFwiMkBkMlwiLFxyXG4gICAgICAgICAgICBcInhsYXJnZUBkMlwiOiBcIjNAZDJcIixcclxuICAgICAgICAgICAgXCJ4bEBkMlwiOiBcIjNAZDJcIixcclxuICAgICAgICAgICAgXCJ4eGxhcmdlQGQyXCI6IFwiNEBkMlwiLFxyXG4gICAgICAgICAgICBcInh4bEBkMlwiOiBcIjRAZDJcIixcclxuICAgICAgICAgICAgXCJ4eHhsYXJnZUBkMlwiOiBcIjVAZDJcIixcclxuICAgICAgICAgICAgXCJ4eHhsQGQyXCI6IFwiNUBkMlwiXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKHNldHRpbmdzW1wiZm9udC1yYXRpb1wiXSBpbiBmb250UmF0aW8pIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmF0aW8gPSBmb250UmF0aW9bc2V0dGluZ3NbXCJmb250LXJhdGlvXCJdXS52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5kZXNjID0gZm9udFJhdGlvW3NldHRpbmdzW1wiZm9udC1yYXRpb1wiXV0uZGVzYztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmF0aW8gPSBwYXJzZUZsb2F0KHNldHRpbmdzW1wiZm9udC1yYXRpb1wiXSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzYyA9IFwiQ3VzdG9tIGZvbnQgcmF0aW9cIjtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBCYXNlRm9udFNpemVcclxuICAgICAgICB0aGlzLmJhc2VTaXplID0gcGFyc2VJbnQoc2V0dGluZ3NbXCJmb250LXNpemVcIl0pO1xyXG5cclxuICAgICAgICAvLyBtYWtpbmcgZm9udHNpemUgY29sbGVjdGlvblxyXG4gICAgICAgIGlmICh0aGlzLnJhdGlvID4gMCAmJiB0aGlzLmJhc2VTaXplID4gMCkge1xyXG4gICAgICAgICAgICAvLyBmb250IENvbGxlY3Rpb25cclxuICAgICAgICAgICAgdGhpcy5mb250U2l6ZXMgPSB7fTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IC0yOyBpIDw9IDU7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gTWFrZSBzaXplIGZyb20gLTIgdG8gNVxyXG4gICAgICAgICAgICAgICAgdGhpcy5mb250U2l6ZXNbaV0gPSB0aGlzLmdlblNpemUoaSk7XHJcbiAgICAgICAgICAgICAgICAvLyBNYWtlIGRvdWJsZSBzaXplIGZyb20gLTIgdG8gNVxyXG4gICAgICAgICAgICAgICAgdGhpcy5mb250U2l6ZXNbaSArIFwiQHgyXCJdID0gdGhpcy5nZW5TaXplKGksIDIpO1xyXG4gICAgICAgICAgICAgICAgLy8gTWFrZSBkb3VibGUgZGl2aWRlZCBzaXplIGZyb20gLTIgdG8gNVxyXG4gICAgICAgICAgICAgICAgdGhpcy5mb250U2l6ZXNbaSArIFwiQGQyXCJdID0gdGhpcy5nZW5TaXplKGksIDAuNSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh0aGlzLmZvbnRTaXplcywgbnVsbCwgMikpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgZm9udCBzaXplcyBmb3IgcmVsYXRpdmUgcHJvcG9ydGlvbmFsIHNpemUuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplIC0gUHJvcG9ydGlvbmFsIHNpemUgbGlrZSAtMiwgMCwgMSwgMyBldGMuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NhbGUgLSBzY2FsZSBiYXNlIGZvbnQgc2l6ZS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge3t9fSAtIEhhc2hNYXAuIHB4OiB2YWx1ZSBpbiBwaXhlbHMsIHJlbDogcmVsYXRpdmUgdmFsdWVcclxuICAgICAqL1xyXG4gICAgZ2VuU2l6ZShzaXplLCBzY2FsZSA9IDApIHtcclxuXHJcbiAgICAgICAgbGV0IHZhbHVlID0ge307XHJcblxyXG4gICAgICAgIGxldCBiYXNlRm9udFNpemUgPSB0aGlzLmJhc2VTaXplO1xyXG5cclxuICAgICAgICBpZiAoc2NhbGUgPiAwKSB7XHJcbiAgICAgICAgICAgIGJhc2VGb250U2l6ZSA9IGJhc2VGb250U2l6ZSAqIHNjYWxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMucmF0aW8gPT0gMCB8fCBiYXNlRm9udFNpemUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc2l6ZSA+PSAwKSB7XHJcblxyXG4gICAgICAgICAgICB2YWx1ZS5yZWwgPSBNYXRoLnBvdyh0aGlzLnJhdGlvLCBzaXplKTtcclxuICAgICAgICAgICAgdmFsdWUucHggPSBiYXNlRm9udFNpemUgKiB2YWx1ZS5yZWw7XHJcblxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgdmFsdWUucmVsID0gMSAvIE1hdGgucG93KHRoaXMucmF0aW8sIE1hdGguYWJzKHNpemUpKTtcclxuICAgICAgICAgICAgdmFsdWUucHggPSBiYXNlRm9udFNpemUgKiB2YWx1ZS5yZWw7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNjYWxlID4gMCkge1xyXG4gICAgICAgICAgICB2YWx1ZS5yZWwgPSB2YWx1ZS5yZWwgKiBzY2FsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgZm9udCBzaXplIGJ5IG5hbWUuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaXplIC0gZm9udCBzaXplIG5hbWUuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHt7fX0gLSBIYXNoTWFwLiBweDogdmFsdWUgaW4gcGl4ZWxzLCByZWw6IHJlbGF0aXZlIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIGdldFNpemUoc2l6ZSkge1xyXG5cclxuICAgICAgICAvLyBDaGVjayBzaXplIGlzIGFsaWFzP1xyXG4gICAgICAgIGlmIChzaXplIGluIHRoaXMuYWxpYXNlcykge1xyXG4gICAgICAgICAgICBzaXplID0gdGhpcy5hbGlhc2VzW3NpemVdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IDA7XHJcblxyXG4gICAgICAgIGlmIChzaXplIGluIHRoaXMuZm9udFNpemVzKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZm9udFNpemVzW3NpemVdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChzaXplLm1hdGNoKC9eXFwtKlxcZCskLykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZ2VuU2l6ZShzaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHNpemUgKyBcIjogXCIgKyBKU09OLnN0cmluZ2lmeShyZXN1bHQsIG51bGwgLCAyKSArIFwiIFwiICsgKHNpemUgaW4gdGhpcy5mb250U2l6ZXMpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgZm9udCBzaXplIHRvIG5hbWUuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaXplIC0gZm9udCBzaXplIG5hbWUuXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBIYXNoTWFwLiBweDogdmFsdWUgaW4gcGl4ZWxzLCByZWw6IHJlbGF0aXZlIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIHNldFNpemUoc2l6ZSwgdmFsdWUpIHtcclxuICAgICAgICAvLyBDaGVjayBzaXplIGlzIGFsaWFzP1xyXG4gICAgICAgIGlmIChzaXplIGluIHRoaXMuYWxpYXNlcykge1xyXG4gICAgICAgICAgICBzaXplID0gdGhpcy5hbGlhc2VzW3NpemVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmZvbnRTaXplc1tzaXplXSA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIEZvbnQgU2l6ZXMgdG8gRm9udCBTaXplIENvbGxlY3Rpb24uXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6Rm9udFNpemVzXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaXplcyAtIHN0cmluZyBsaWtlIFwibmFtZTEgMjFweCAxLjUsIG5hbWUyIDE4cHgsIG5hbWUzIDEuNVwiLiBmb3JtYXQ6IG5hbWUgcGl4ZWxTaXplIHJlbGF0aXZlU2l6ZS5cclxuICAgICAqIFNlcGFyYXRvciBmb3IgZm9udCBzaXplcyBpcyBcIixcIi5cclxuICAgICAqIElmIHBpeGVsIG9yIHJlbGF0aXZlIHNpemUgaXQncyBwcmVzZW50IHRoZW4gaXQgY2FuIGJlIGdlbmVyYXRlZC5cclxuICAgICAqIEBwYXJhbSByaHl0aG1DYWxjdWxhdG9yIC0gaW5zdGFuY2Ugb2YgVmVydGljYWxSaHl0aG0gQ2xhc3MuXHJcbiAgICAgKi9cclxuICAgIGFkZEZvbnRTaXplcyhzaXplcywgcmh5dGhtQ2FsY3VsYXRvcikge1xyXG5cclxuICAgICAgICBsZXQgZm9udFNpemVzSW5mbyA9IHNpemVzLnNwbGl0KC9cXHMqXFwsXFxzKi8pO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvbnRTaXplc0luZm8ubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBmb250U2l6ZUluZm8gPSBmb250U2l6ZXNJbmZvW2ldLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgICAgIGlmIChmb250U2l6ZUluZm8ubGVuZ3RoID49IDIpIHtcclxuICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGZvbnRTaXplSW5mb1sxXS5tYXRjaCgvcHgkL2kpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemUucmVsID0gKGZvbnRTaXplSW5mby5sZW5ndGggPT0gMikgPyByaHl0aG1DYWxjdWxhdG9yLmNvbnZlcnQoZm9udFNpemVJbmZvWzFdLCBcImVtXCIpIDogZm9udFNpemVJbmZvWzJdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplLnB4ID0gcGFyc2VJbnQoZm9udFNpemVJbmZvWzFdKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemUucmVsID0gcGFyc2VGbG9hdChmb250U2l6ZUluZm9bMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplLnB4ID0gcmh5dGhtQ2FsY3VsYXRvci5jb252ZXJ0KGZvbnRTaXplSW5mb1sxXSwgXCJweFwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U2l6ZShmb250U2l6ZUluZm9bMF0sIGZvbnRTaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59XHJcbi8qKlxyXG4gKiBFeHBvcnQgRm9udFNpemVzIENsYXNzLlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgRm9udFNpemVzOyJdfQ==
