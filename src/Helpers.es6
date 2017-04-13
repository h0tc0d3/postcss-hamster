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

/**
 * Format Float Values.
 * @param {number} value - input value.
 */

const zeroRegexp = /0+$/g;
const dotAtEndRegexp =/\.$/g;

function formatValue(value) {
    return value.toFixed(4).replace(zeroRegexp, "").replace(dotAtEndRegexp, "");
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
    PERCENT: 4,
    EX: 5
};

/**
 * Regexp for get value unit.
 */

const unitRegexp = /(px|em|rem)$/i;

/**
 * Return value Unit.
 * @param {number} value - input value.
 */

function getUnit(value) {
    let unit = value.match(unitRegexp)[0].toUpperCase();
    let ret = UNIT[unit] ? UNIT[unit] : 0;
    return ret;
}

/**
 * Regexp for rem value.
 */

const remRegexp = /([0-9\.]+)rem/i;

/**
 * Check value is in pixels. Return true or false;
 * @param {number} value - input value.
 */

function isHas(value, string){
    return value.toLowerCase().indexOf(string) > -1;
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
    UNIT
};
