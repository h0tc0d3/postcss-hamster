import {
    isHas,
    toCamelCase,
    hasNumber,
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
     * Use settings.fontRatio"] - font scale ratio and settings.fontSize - base font size(will be 0 size).
     * All sizes will be generated from base font size * ratio.
     */
    constructor(settings) {

        let fontRatio = {
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

        if(hasNumber(settings.fontRatio)){
            this.ratio = parseFloat(settings.fontRatio);
            this.desc = "Custom font ratio";
        } else {
            let fr = toCamelCase(settings.fontRatio);
            this.ratio = fontRatio[fr].value;
            this.desc = fontRatio[fr].desc;
        }


        // BaseFontSize
        this.baseSize = settings.fontSize;

        // making fontsize collection
        if (this.ratio > 0 && this.baseSize > 0) {
            // font Collection
            this.fontSizes = {};
            for (let i = -2; i <= 5; i++) {
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
    genSize(size, scale = 0) {

        let value =  {px: 0, rel: 0};

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
        size = size.replace("@d2", "2");
        size = size.replace("@x2", "1");

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
        size = size.replace("@d2", "2");
        size = size.replace("@x2", "1");
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

        let fontSizes = sizes.split(/\s*\,\s*/);
        for(let i = 0, len = fontSizes.length; i < len; i++){
            let fontSizeInfo = fontSizes[i].split(/\s+/);
            if (fontSizeInfo.length >= 2) {
                let fontSize = {px: 0, rel: 0};
                if (isHas(fontSizeInfo[1], "px")) {
                    fontSize.rel = (fontSizeInfo.length == 2) ? rhythmCalculator.convert(fontSizeInfo[1], UNIT.EM) : fontSizeInfo[2];
                    fontSize.px = parseInt(fontSizeInfo[1]);
                } else {
                    fontSize.rel = parseFloat(fontSizeInfo[1]);
                    fontSize.px = rhythmCalculator.convert(fontSizeInfo[1], UNIT.PX);
                }
                this.setSize(fontSizeInfo[0], fontSize);
            }
        }
    }

}
/**
 * Export FontSizes Class.
 */
export default FontSizes;