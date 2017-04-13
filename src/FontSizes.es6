import {
    isHas,
    UNIT
} from "./Helpers";

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
class FontSizes {
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
    constructor(settings) {

        let fontRatio = {
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
            for (let i = -2; i <= 5; i++) {
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
    genSize(size, scale = 0) {

        let value = {};

        let baseFontSize = this.baseSize;

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

    }

    /**
     * Get font size by name.
     * 
     * @memberOf module:FontSizes
     * 
     * @param {string} size - font size name.
     * 
     * @returns {{}} - HashMap. px: value in pixels, rel: relative value
     */
    getSize(size) {

        // Check size is alias?
        if (size in this.aliases) {
            size = this.aliases[size];
        }

        let result = 0;

        if (size in this.fontSizes) {
            result = this.fontSizes[size];
        } else {
            if (size.match(/^\-*[0-9]+$/)) {
                result = this.genSize(size);
            }
        }
        //console.log(size + ": " + JSON.stringify(result, null , 2) + " " + (size in this.fontSizes).toString());
        return result;
    }

    /**
     * Set font size to name.
     * 
     * @memberOf module:FontSizes
     * 
     * @param {string} size - font size name.
     * @param value - HashMap. px: value in pixels, rel: relative value
     */
    setSize(size, value) {
        // Check size is alias?
        if (size in this.aliases) {
            size = this.aliases[size];
        }
        this.fontSizes[size] = value;
    }

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
    addFontSizes(sizes, rhythmCalculator) {

        let fontSizesInfo = sizes.split(/\s*\,\s*/);
        let size = fontSizesInfo.length - 1;
        while (size >= 0) {

            let fontSizeInfo = fontSizesInfo[size].split(/\s+/);
            if (fontSizeInfo.length >= 2) {
                let fontSize = {};
                if (isHas(fontSizeInfo[1], "px")) {
                    fontSize.rel = (fontSizeInfo.length == 2) ? rhythmCalculator.convert(fontSizeInfo[1], UNIT.EM) : fontSizeInfo[2];
                    fontSize.px = parseInt(fontSizeInfo[1]);
                } else {
                    fontSize.rel = parseFloat(fontSizeInfo[1]);
                    fontSize.px = rhythmCalculator.convert(fontSizeInfo[1], UNIT.PX);
                }
                this.setSize(fontSizeInfo[0], fontSize);
            }
            size--;
        }

    }

}
/**
 * Export FontSizes Class.
 */
export default FontSizes;