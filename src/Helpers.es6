/**
 * @module Helper
 * 
 * @description Constants and Help functions.
 * 
 * @version 1.0
 * @author Grigory Vasilyev <postcss.hamster@gmail.com> https://github.com/h0tc0d3
 * @copyright Copyright (c) 2017, Grigory Vasilyev
 * @license Apache License, Version 2.0, http://www.apache.org/licenses/LICENSE-2.0 
 */

function dotPos(value) {
    let len = value.length;
    do {
        len--;
        if (value.charCodeAt(len) === 46) {
            return len;
        }
    } while (len >= 0);
    return -1;
}


/**
 * Fast Format Float Values.
 * @param {number} value - input value.
 */
function formatValue(value) {
    // . - 46 0 - 48
    value = value.toFixed(4);
    let pos = dotPos(value);
    if (pos > -1) {
        let len = value.length;
        let code = 0;
        do {
            len--;
            code = value.charCodeAt(len);
        } while ((code === 48 && pos < len) || (code === 46 && pos === len));

        if ((len + 1) === value.length) {
            return value;
        }

        let ret = new safeUint8Array(len + 1);
        for (let j = 0; j <= len; j++) {
            ret[j] = value.charCodeAt(j);
        }
        return String.fromCharCode.apply(null, ret);
    }
    return value;
}


/**
 * Format Number to Int.
 * @param {number} value - input value.
 */
function formatInt(value) {
    return value.toFixed(0);
}

/**
 * Unit List
 */
const UNIT = {
    PX: 1,
    EM: 2,
    REM: 3,
    VW: 4,
    VH: 5,
    PERCENT: 6,
    EX: 7,
    PT: 8,
    IN: 9
};

const unitName = ["", "px", "em", "rem", "vw", "vh", "%", "ex", "pt", "in"];


/**
 * Return Unit to value.
 * @param {string} value - input value.
 */
function getUnit(value) {
    let len = value.length;
    let code1 = value.charCodeAt(len - 1);
    let code2 = value.charCodeAt(len - 2);
    // p 80 112
    // x 88 120
    // t 84 116
    // e 69 101
    // m 77 109
    // r 82 114
    // v 86 118
    // w 87 119
    // h 72 104
    // i 73 105
    // n 78 110
    // % 37
    if (code1 === 37) {
        return UNIT.PERCENT;
    } else if (code2 === 80 || code2 === 112) {
        if (code1 === 88 || code1 === 120) {
            return UNIT.PX;
        } else if (code1 === 84 || code1 === 116) {
            return UNIT.PT;
        }
    } else if (code2 === 86 || code2 === 118) {
        if (code1 === 87 || code1 === 119) {
            return UNIT.VW;
        } else if (code1 === 72 || code1 === 104) {
            return UNIT.VH;
        }
    } else if ((code1 === 77 || code1 === 109) && (code2 === 69 || code2 === 101)) {
        let code3 = value.charCodeAt(len - 3);
        if ((code3 === 82 || code3 === 114)) {
            return UNIT.REM;
        }
        return UNIT.EM;
    } else if ((code1 === 78 || code1 === 110) && (code2 === 73 || code2 === 105)) {
        return UNIT.IN;
    }

    return 0;
}


/**
 * Regexp for rem value.
 */
const remRegexp = /([0-9.]+)rem/i;

/**
 * Check value contains string;
 * @param {string} value - input value.
 * @param string
 */

function isHas(value, string) {
    return value.toLowerCase().indexOf(string) > -1;
}


/**
 * Copy Values from object 2 to object 1.
 * @param object1 
 * @param object2
 * @param ret - return object1 true or false
 * @return object1
 */
function extend(object1, object2, ret = true) {

    for (let key in object2) {
        if(object2.hasOwnProperty(key)){
            object1[key] = object2[key];
        }
    }
    if(ret) {
        return object1;
    }
}

const safeUint8Array = scmpStr(typeof Uint8Array, "undefined") ? Array : Uint8Array;


/**
 * To Camel Case string.
 * @param {string} value  - input string.
 */
function toCamelCase(value) {

    let len = value.length;
    let buffer = new safeUint8Array(len);

    // Code: 48-57 Chars: 0-9
    // Code: 65-90 Chars: A-Z 
    // Code: 97-122 Chars: a-z

    let prev = value.charCodeAt(0); // previous char
    let firstWas = false; //is first letter was
    let count = 0;
    for (let i = 0; i < len; i++) {

        let code = value.charCodeAt(i);

        // It's Number
        if(code > 47 && code < 58) {
            // Add Number
            buffer[count] = code;
            count++;

        } else if (code > 96 && code < 123) { // It's lower case letter

            //If previous char is't letter or number,
            if (firstWas && !((prev > 47 && prev < 58) || (prev > 96 && prev < 123) || (prev > 64 && prev < 91))) {
                code = code & (1 + 2 + 4 + 8 + 16 + 64 + 128); // toUpperCase
            }

            buffer[count] = code;
            count++;

            if (!firstWas) {
                firstWas = true;
            }

        } else if (code > 64 && code < 91) { // It's upper case letter

            // If previous char is letter or number,
            if ((prev > 47 && prev < 58) || (prev > 96 && prev < 123) || (prev > 64 && prev < 91)){
                code = code | 32; // toLowerCase
            }

            buffer[count] = code;
            count++;

            if (!firstWas) {
                firstWas = true;
            }

        }

        prev = code;
    }
    let ret = new safeUint8Array(count);
    for (let j = 0; j < count; j++) {
        ret[j] = buffer[j];
    }
    return String.fromCharCode.apply(null, ret);
}


/**
 * To Kebab Case string.
 * @param {string} value  - input string.
 */
function toKebabCase(value) {
    let len = value.length;
    let count = 0;
    for (let i = 0; i < len; i++) {
        let code = value.charCodeAt(i);
        if (code >= 65 && code <= 90) {
            count++;
        }
    }
    let buffer = new safeUint8Array(len + count);
    let pos = 0;
    for (let i = 0; i < len; i++) {
        let code = value.charCodeAt(i);
        if (code >= 65 && code <= 90) {
            buffer[pos] = 45;
            buffer[pos + 1] = code | 32;
            pos += 2;
        } else {
            buffer[pos] = code;
            pos++;
        }
    }
    return String.fromCharCode.apply(null, buffer);
}


/**
 * Check string contains number.
 * @param value - input string.
 */
function hasNumber(value) {
    let len = value.length;
    for (let i = 0; i < len; i++) {
        let code = value.charCodeAt(i);
        if (code >= 48 && code <= 57) {
            return true;
        }
    }
    return false;
}


/**
 * Compare input string with reference string.
 * @param str - input string
 * @param refStr - reference string
 */
function cmpStr(str, refStr) {

    //return str == refStr;
    let len = refStr.length;

    if (len !== str.length) {
        return false;
    }

    for (let i = 0; i < len; i++) {
        let code = str.charCodeAt(i);
        let refCode = refStr.charCodeAt(i);

        if (code >= 65 && code <= 90) {
            code = code | 32;
        }

        if (code !== refCode) {
            return false;
        }
    }

    return true;
}


/**
 * Case sensitive compare strings
 * @param str - input string
 * @param refStr - reference string
 */
function scmpStr(str, refStr) {
    //return str === refStr;
    let len = refStr.length;

    if (len !== str.length) {
        return false;
    }

    for (let i = 0; i < len; i++) {

        if (str.charCodeAt(i) !== refStr.charCodeAt(i)) {
            return false;
        }
    }

    return true;
}


/**
 * Export helpers
 */
export {
    formatInt,
    formatValue,
    remRegexp,
    getUnit,
    isHas,
    extend,
    toCamelCase,
    toKebabCase,
    hasNumber,
    safeUint8Array,
    cmpStr,
    scmpStr,
    UNIT,
    unitName
};