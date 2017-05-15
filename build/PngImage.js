"use strict";

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module PngImage
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @description Png Image Class for generation png images.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @version 1.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @author Grigory Vasilyev <postcss.hamster@gmail.com> https://github.com/h0tc0d3
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @copyright Copyright (c) 2017, Grigory Vasilyev
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @license Apache License, Version 2.0, http://www.apache.org/licenses/LICENSE-2.0 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _zlib = require("zlib");

var _zlib2 = _interopRequireDefault(_zlib);

var _Helpers = require("./Helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PngImage = function () {

    /**
     *  Constructor for PngImage Class.
     * 
     * @memberOf module:PngImage
     * 
     * @param {number} depth - color depth.
     * @param {number} colortype - png color type.
     * 
     * @description
     * <pre>
     * Color depths:
     * 
     * PNG image type           Colour type    Allowed bit depths       Interpretation
     * Greyscale                0                1, 2, 4, 8, 16         Each pixel is a greyscale sample
     * Truecolor                2                8, 16                  Each pixel is an R,G,B triple
     * Indexed-color            3                1, 2, 4, 8             Each pixel is a palette index; a PLTE chunk shall appear.
     * Greyscale with alpha     4                8, 16                  Each pixel is a greyscale sample followed by an alpha sample.
     * Truecolor with alpha     6                8, 16                  Each pixel is an R,G,B triple followed by an alpha sample.
     * </pre>
     */
    function PngImage() {
        var depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8;
        var colortype = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6;

        _classCallCheck(this, PngImage);

        this.depth = depth;
        this.colortype = colortype;
        this.transparent = new _Helpers.safeUint8Array([0, 0, 0, 0]); // Transparent color
        this.iend = new _Helpers.safeUint8Array([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]); // IEND CHUNK
        var safeUint32Array = (0, _Helpers.scmpStr)(typeof Uint32Array === "undefined" ? "undefined" : _typeof(Uint32Array), "undefined") ? Array : Uint32Array;
        // this.pako = require("pako");
        //// pre calculated crc table for crc32 method
        this.crcTable = new safeUint32Array([0, 1996959894, -301047508, -1727442502, 124634137, 1886057615, -379345611, -1637575261, 249268274, 2044508324, -522852066, -1747789432, 162941995, 2125561021, -407360249, -1866523247, 498536548, 1789927666, -205950648, -2067906082, 450548861, 1843258603, -187386543, -2083289657, 325883990, 1684777152, -43845254, -1973040660, 335633487, 1661365465, -99664541, -1928851979, 997073096, 1281953886, -715111964, -1570279054, 1006888145, 1258607687, -770865667, -1526024853, 901097722, 1119000684, -608450090, -1396901568, 853044451, 1172266101, -589951537, -1412350631, 651767980, 1373503546, -925412992, -1076862698, 565507253, 1454621731, -809855591, -1195530993, 671266974, 1594198024, -972236366, -1324619484, 795835527, 1483230225, -1050600021, -1234817731, 1994146192, 31158534, -1731059524, -271249366, 1907459465, 112637215, -1614814043, -390540237, 2013776290, 251722036, -1777751922, -519137256, 2137656763, 141376813, -1855689577, -429695999, 1802195444, 476864866, -2056965928, -228458418, 1812370925, 453092731, -2113342271, -183516073, 1706088902, 314042704, -1950435094, -54949764, 1658658271, 366619977, -1932296973, -69972891, 1303535960, 984961486, -1547960204, -725929758, 1256170817, 1037604311, -1529756563, -740887301, 1131014506, 879679996, -1385723834, -631195440, 1141124467, 855842277, -1442165665, -586318647, 1342533948, 654459306, -1106571248, -921952122, 1466479909, 544179635, -1184443383, -832445281, 1591671054, 702138776, -1328506846, -942167884, 1504918807, 783551873, -1212326853, -1061524307, -306674912, -1698712650, 62317068, 1957810842, -355121351, -1647151185, 81470997, 1943803523, -480048366, -1805370492, 225274430, 2053790376, -468791541, -1828061283, 167816743, 2097651377, -267414716, -2029476910, 503444072, 1762050814, -144550051, -2140837941, 426522225, 1852507879, -19653770, -1982649376, 282753626, 1742555852, -105259153, -1900089351, 397917763, 1622183637, -690576408, -1580100738, 953729732, 1340076626, -776247311, -1497606297, 1068828381, 1219638859, -670225446, -1358292148, 906185462, 1090812512, -547295293, -1469587627, 829329135, 1181335161, -882789492, -1134132454, 628085408, 1382605366, -871598187, -1156888829, 570562233, 1426400815, -977650754, -1296233688, 733239954, 1555261956, -1026031705, -1244606671, 752459403, 1541320221, -1687895376, -328994266, 1969922972, 40735498, -1677130071, -351390145, 1913087877, 83908371, -1782625662, -491226604, 2075208622, 213261112, -1831694693, -438977011, 2094854071, 198958881, -2032938284, -237706686, 1759359992, 534414190, -2118248755, -155638181, 1873836001, 414664567, -2012718362, -15766928, 1711684554, 285281116, -1889165569, -127750551, 1634467795, 376229701, -1609899400, -686959890, 1308918612, 956543938, -1486412191, -799009033, 1231636301, 1047427035, -1362007478, -640263460, 1088359270, 936918000, -1447252397, -558129467, 1202900863, 817233897, -1111625188, -893730166, 1404277552, 615818150, -1160759803, -841546093, 1423857449, 601450431, -1285129682, -1000256840, 1567103746, 711928724, -1274298825, -1022587231, 1510334235, 755167117]);
        this.ihdr = null;
        this.idat = null;
        this.matrix = null;
        this.image = null;
        // for (let j = 0; j < 256; j++) {
        // 	let c = j;
        // 	for (let k = 0; k < 8; k++) {
        // 		if (c & 1) {
        // 			c = -306674912 ^ (c >>> 1);
        // 		} else {
        // 			c = c >>> 1;
        // 		}
        // 	}
        // 	this.crcTable[j] = c;
        // }
    }

    /**
     * Set IHDR settings and generate IHDR Chunk for PNG Image.
     * 
     * @memberOf module:PngImage
     * 
     * @param {number} height - image height.
     * @param {number} width - image width.
     * 
     * @description
     * <pre>
     * IHDR Format:
     * Width 4 bytes
     * Height 4 bytes
     * Bit depth 1 byte
     * Colour type 1 byte
     * Compression method 1 byte
     * Filter method 1 byte
     * Interlace method 1 byte
     * </pre>
     */


    PngImage.prototype.setIHDR = function setIHDR() {
        var height = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;


        this.height = height;
        this.width = width;
        // IHDR Chunk
        this.ihdr = new _Helpers.safeUint8Array(25);
        this.ihdr.set(this.byte4(13), 0);
        this.ihdr.set([73, 72, 68, 82], 4);
        this.ihdr.set(this.byte4(this.width), 8);
        this.ihdr.set(this.byte4(this.height), 12);
        this.ihdr.set([this.depth, this.colortype, 0, 0, 0], 16);

        var tmp = new _Helpers.safeUint8Array(17);
        for (var j = 0; j < 17; j++) {
            tmp[j] = this.ihdr[j + 4];
        }
        this.ihdr.set(this.crc32(tmp), 21);
    };

    /**
     * Generate ruler image matrix.
     * 
     * @memberOf module:PngImage
     * 
     * @param {number} height - image height.
     * @param {string} color - ruler line color. Support hex color like #454545, web safe hex like #333,
     * rgb(255, 143, 15) - red,  green, blue, rgba(255, 143, 15, 0.6) - red,  green, blue, alpha(transparency).
     * @param {array} pattern - ruler line pattern array like [1, 0, 0, 0] - value = 1 - write color pixel,
     * values = 0 write transparent pixel.
     * @param {number} thickness - ruler line thickness in pixels.
     * @param {number} scale - image scale ratio.
     * 
     * @description
     * <pre>
     * Filter Types:
     * 0    None        Filt(x) = Orig(x)                                               Recon(x) = Filt(x)
     * 1    Sub         Filt(x) = Orig(x) - Orig(a)                                     Recon(x) = Filt(x) + Recon(a)
     * 2    Up          Filt(x) = Orig(x) - Orig(b)                                     Recon(x) = Filt(x) + Recon(b)
     * 3    Average     Filt(x) = Orig(x) - floor((Orig(a) + Orig(b)) / 2)              Recon(x) = Filt(x) + floor((Recon(a) + Recon(b)) / 2)
     * 4    Paeth       Filt(x) = Orig(x) - PaethPredictor(Orig(a), Orig(b), Orig(c))   Recon(x) = Filt(x) + PaethPredictor(Recon(a), Recon(b), Recon(c)
     * </pre>
     */


    PngImage.prototype.rulerMatrix = function rulerMatrix(height, color, pattern) {
        var thickness = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
        var scale = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;


        var plen = pattern.length;

        this.setIHDR(Math.round(height * scale), Math.round(plen * scale));

        //patern thickness
        thickness = thickness * scale;
        // Scanline filter 0
        var filter = new _Helpers.safeUint8Array([0]);

        this.pixelcolor = this.parseColor(color);
        var patternHeight = Math.floor(thickness / 2);
        var pat = new _Helpers.safeUint8Array(pattern);
        var remainder = thickness % 2;

        var bottom = this.height - patternHeight - remainder;

        //let bottom = this.height - thickness;
        this.matrix = new _Helpers.safeUint8Array(this.height * this.width * 4 + this.height);

        var pline = false;

        // scan lines
        var pos = 0;
        for (var i = 0; i < this.height; i++) {

            // Add 0 filter at new scanline
            this.matrix.set(filter, pos);
            pos++;

            // Current line include ruler pattern ? // top and bottom
            pline = i < patternHeight || i >= bottom;

            // // Current line include ruler pattern ? // bottom
            // if (i >= bottom) {
            //     pline = true;
            // } else {
            //     pline = false;
            // }

            for (var j = 0; j < this.width; j++) {
                if (pline) {
                    var pindex = Math.floor(j / scale) % plen;
                    if (pat[pindex] === 1) {
                        this.matrix.set(this.pixelcolor, pos);
                    } else {
                        this.matrix.set(this.transparent, pos);
                    }
                } else {
                    this.matrix.set(this.transparent, pos);
                }

                pos += 4;
            }
        }
        //console.log(this.matrix.subarray(0, pos).toString());
        this.makeIDAT();
    };

    /**
     * Set image matrix.
     * 
     * @memberOf module:PngImage
     * 
     * @param matrix - bytes.
     * 
     */


    /**
     * Generate IDAT Chunk for image. Deflate image matrix.
     * 
     * @memberOf module:PngImage
     * 
     */
    PngImage.prototype.makeIDAT = function makeIDAT() {
        if (this.matrix) {
            var matrix = _zlib2.default.deflateSync(new Buffer(this.matrix), {
                level: 9
            });
            matrix = new _Helpers.safeUint8Array(matrix.buffer, matrix.byteOffset, matrix.byteLength / _Helpers.safeUint8Array.BYTES_PER_ELEMENT);
            // let matrix = this.pako.deflate(this.matrix);
            var mlen = matrix.length;
            this.idat = new _Helpers.safeUint8Array(mlen + 12);
            this.idat.set(this.byte4(mlen), 0);
            this.idat.set([73, 68, 65, 84], 4);
            this.idat.set(matrix, 8);
            var tsize = mlen + 4;
            var tmp = new _Helpers.safeUint8Array(tsize);
            for (var j = 0; j < tsize; j++) {
                tmp[j] = this.idat[j + 4];
            }
            this.idat.set(this.crc32(tmp), mlen + 8);
        }
    };

    /**
     * Make image before output. Glue all PNG Chunks with PNG Header.
     * 
     * @memberOf module:PngImage
     * 
     */


    PngImage.prototype.makeImage = function makeImage() {
        // Glue chunks with PNG image header
        //Buffer.concat([this.fromHex([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), this.ihdr, this.idat, this.iend])
        var lihdr = this.ihdr.length;
        var lidat = this.idat.length;
        this.image = new _Helpers.safeUint8Array(lihdr + lidat + 20);
        this.image.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
        this.image.set(this.ihdr, 8);
        this.image.set(this.idat, lihdr + 8);
        this.image.set(this.iend, lihdr + lidat + 8);
    };

    /**
     * Parse color from string.
     * 
     * @memberOf module:PngImage
     * 
     * @param {string} color - color as string.
     * Support hex color like #454545, web safe hex like #333, rgb(255, 143, 15) - red,  green, blue,
     * rgba(255, 143, 15, 0.6) - red,  green, blue, alpha(transparency).
     * 
     * @returns  Uint8Array - color for png image encoded as bytes.
     */


    PngImage.prototype.parseColor = function parseColor(color) {

        // transparent color
        var red = 0,
            green = 0,
            blue = 0,
            alpha = 0;

        var found = void 0;
        // Hex color like #454545
        if (found = color.match(/#([0-9a-zA-Z]{3, 6})/)) {
            var flen = found[1].length;
            if (flen === 6) {
                var _ref = [parseInt(found[1].substr(0, 2), 16), parseInt(found[1].substr(2, 2), 16), parseInt(found[1].substr(4, 2), 16)];
                red = _ref[0];
                green = _ref[1];
                blue = _ref[2];


                alpha = 255;
            } else if (flen.length === 3) {
                // Hex colors like #333
                var rc = found[1].substr(0, 1);
                var gc = found[1].substr(1, 1);
                var bc = found[1].substr(2, 1);

                rc = rc + rc;
                gc = gc + gc;
                bc = bc + bc;

                var _ref2 = [parseInt(rc, 16), parseInt(gc, 16), parseInt(bc, 16)];
                red = _ref2[0];
                green = _ref2[1];
                blue = _ref2[2];


                alpha = 255;
            }

            // rgb rgba colors like rgba(255, 255,255, 255)
        } else if (found = color.match(/rgba*\((.*?)\)/)) {
            var _found$1$split = found[1].split(/\s*,\s*/i);

            red = _found$1$split[0];
            green = _found$1$split[1];
            blue = _found$1$split[2];
            alpha = _found$1$split[3];

            alpha = alpha && alpha > 0 ? Math.round(alpha * 255) : 255;
        }

        return this.color(red, green, blue, alpha);
    };

    /**
     * Generate rgba color for PNG Image.
     * 
     * @memberOf module:PngImage
     * 
     * @param {Number} red - red value in rgb palette.
     * @param {Number} green - green value in rgb palette.
     * @param {Number} blue - blue value in rgb palette.
     * @param {Number} alpha - transparency value.
     * 
     * @description All values must be from 0 to 255.
     * 
     * @returns Uint8Array - color encoded as bytes.
     */


    PngImage.prototype.color = function color(red, green, blue, alpha) {
        var ret = new _Helpers.safeUint8Array(4);
        ret[0] = red && red >= 0 && red <= 255 ? red : 255;
        ret[1] = green && green >= 0 && green <= 255 ? green : 255;
        ret[2] = blue && blue >= 0 && blue <= 255 ? blue : 255;
        ret[3] = alpha && alpha >= 0 && alpha <= 255 ? alpha : 255;
        return ret;
    };

    /**
     * Return png image in base64 format.
     * 
     * @memberOf module:PngImage
     * 
     * @returns {Buffer} - base64 string - encoded image.
     */


    PngImage.prototype.getBase64 = function getBase64() {
        this.makeImage();
        return this.base64(this.image);
    };

    /**
     * Write image to file.
     * 
     * @memberOf module:PngImage
     * 
     * @param filename - image file name.
     */


    PngImage.prototype.getFile = function getFile(filename) {
        this.makeImage();
        _fs2.default.writeFile(filename, String.fromCharCode.apply(null, this.image), "binary", function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The " + filename + " was saved!");
        });
    };

    /**
     * Adler 32 algorithm. Calculate hash for bytes.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input bytes.
     * 
     * @returns {number} - adler32 hash.
     */


    PngImage.prototype.adler32 = function adler32(data) {

        var BASE = 65521,
            NMAX = 5552,
            s1 = 1,
            s2 = 0,
            n = NMAX;

        for (var i = 0; i < data.length; i++) {
            s1 += data[i];
            s2 += s1;
            if ((n -= 1) === 0) {
                s1 %= BASE;
                s2 %= BASE;
                n = NMAX;
            }
        }

        s1 %= BASE;
        s2 %= BASE;

        return s2 << 16 | s1;
    };

    /**
     * Calculate crc32(Cyclic redundancy check) checksum for bytes.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input bytes.
     * @param crc - start crc value, default - 1.
     * 
     * @returns byte4 - crc32 checksum.
     */


    PngImage.prototype.crc32 = function crc32(data) {
        var crc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;


        for (var i = 0, len = data.length; i < len; i++) {

            crc = this.crcTable[(crc ^ data[i]) & 0xff] ^ crc >>> 8;
        }

        crc = crc ^ -1;

        return this.byte4(crc);
    };

    /**
     * Generate hex string from bytes.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input bytes.
     * 
     * @returns {Buffer} - hex string.
     */


    PngImage.prototype.hex = function hex(data) {
        return new Buffer(data, "binary").toString("hex");
    };

    /**
     * Generate bytes from hex string.
     * 
     * @memberOf module:PngImage
     * 
     * @param {string} data - input hex string.
     * 
     * @returns {Buffer} - output bytes in Buffer.
     */


    PngImage.prototype.fromHex = function fromHex(data) {
        return new Buffer(data, "hex");
    };

    /**
     * Generate base64 string from bytes.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input bytes.
     * 
     * @returns {Buffer} - base64 string.
     */


    PngImage.prototype.base64 = function base64(data) {
        return new Buffer(data).toString("base64");
    };

    /**
     * Generate bytes from base64 string.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input base64 string.
     * 
     * @returns {Buffer} - output bytes in Buffer.
     */


    PngImage.prototype.fromBase64 = function fromBase64(data) {
        return Buffer.from(data, "base64");
    };

    /**
     * Return 2 bytes value from input.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input value.
     * 
     * @returns Uint8Array - 2 bytes.
     */

    PngImage.prototype.byte2 = function byte2(data) {
        return new _Helpers.safeUint8Array([data >> 8 & 255, data & 255]);
    };
    /**
     * Return 4 bytes value from input.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input value.
     * 
     * @returns Uint8Array - 4 bytes.
     */


    PngImage.prototype.byte4 = function byte4(data) {
        return new _Helpers.safeUint8Array([data >> 24 & 255, data >> 16 & 255, data >> 8 & 255, data & 255]);
    };

    /**
     * Return 2 lsb(least significant bit) bytes value from input.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input value.
     * 
     * @returns Uint8Array - 2 lsb bytes.
     */


    PngImage.prototype.byte2lsb = function byte2lsb(data) {
        return new _Helpers.safeUint8Array([data & 255, data >> 8 & 255]);
    };

    _createClass(PngImage, [{
        key: "setMatrix",
        set: function set(matrix) {
            this.matrix = matrix;
        }
    }]);

    return PngImage;
}();
/**
 * Export PNG Image Class.
 */


exports.default = PngImage;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBuZ0ltYWdlLmVzNiJdLCJuYW1lcyI6WyJQbmdJbWFnZSIsImRlcHRoIiwiY29sb3J0eXBlIiwidHJhbnNwYXJlbnQiLCJpZW5kIiwic2FmZVVpbnQzMkFycmF5IiwiVWludDMyQXJyYXkiLCJBcnJheSIsImNyY1RhYmxlIiwiaWhkciIsImlkYXQiLCJtYXRyaXgiLCJpbWFnZSIsInNldElIRFIiLCJoZWlnaHQiLCJ3aWR0aCIsInNldCIsImJ5dGU0IiwidG1wIiwiaiIsImNyYzMyIiwicnVsZXJNYXRyaXgiLCJjb2xvciIsInBhdHRlcm4iLCJ0aGlja25lc3MiLCJzY2FsZSIsInBsZW4iLCJsZW5ndGgiLCJNYXRoIiwicm91bmQiLCJmaWx0ZXIiLCJwaXhlbGNvbG9yIiwicGFyc2VDb2xvciIsInBhdHRlcm5IZWlnaHQiLCJmbG9vciIsInBhdCIsInJlbWFpbmRlciIsImJvdHRvbSIsInBsaW5lIiwicG9zIiwiaSIsInBpbmRleCIsIm1ha2VJREFUIiwiZGVmbGF0ZVN5bmMiLCJCdWZmZXIiLCJsZXZlbCIsImJ1ZmZlciIsImJ5dGVPZmZzZXQiLCJieXRlTGVuZ3RoIiwiQllURVNfUEVSX0VMRU1FTlQiLCJtbGVuIiwidHNpemUiLCJtYWtlSW1hZ2UiLCJsaWhkciIsImxpZGF0IiwicmVkIiwiZ3JlZW4iLCJibHVlIiwiYWxwaGEiLCJmb3VuZCIsIm1hdGNoIiwiZmxlbiIsInBhcnNlSW50Iiwic3Vic3RyIiwicmMiLCJnYyIsImJjIiwic3BsaXQiLCJyZXQiLCJnZXRCYXNlNjQiLCJiYXNlNjQiLCJnZXRGaWxlIiwiZmlsZW5hbWUiLCJ3cml0ZUZpbGUiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJhcHBseSIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJhZGxlcjMyIiwiZGF0YSIsIkJBU0UiLCJOTUFYIiwiczEiLCJzMiIsIm4iLCJjcmMiLCJsZW4iLCJoZXgiLCJ0b1N0cmluZyIsImZyb21IZXgiLCJmcm9tQmFzZTY0IiwiZnJvbSIsImJ5dGUyIiwi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RUFBaUIsS0FBakIsQ0FBUDtBQUNILEs7O0FBRUQ7Ozs7Ozs7Ozs7O3VCQVNBWCxNLG1CQUFPVyxJLEVBQU07QUFDVCxlQUFPLElBQUlyQyxNQUFKLENBQVdxQyxJQUFYLEVBQWlCUyxRQUFqQixDQUEwQixRQUExQixDQUFQO0FBQ0gsSzs7QUFFRDs7Ozs7Ozs7Ozs7dUJBU0FFLFUsdUJBQVdYLEksRUFBTTtBQUNiLGVBQU9yQyxPQUFPaUQsSUFBUCxDQUFZWixJQUFaLEVBQWtCLFFBQWxCLENBQVA7QUFDSCxLOztBQUVEOzs7Ozs7Ozs7O3VCQVVBYSxLLGtCQUFNYixJLEVBQU07QUFDUixlQUFPLDRCQUFtQixDQUFFQSxRQUFRLENBQVQsR0FBYyxHQUFmLEVBQW9CQSxPQUFPLEdBQTNCLENBQW5CLENBQVA7QUFDSCxLO0FBQ0Q7Ozs7Ozs7Ozs7O3VCQVNBaEUsSyxrQkFBTWdFLEksRUFBTTtBQUNSLGVBQU8sNEJBQW1CLENBQUVBLFFBQVEsRUFBVCxHQUFlLEdBQWhCLEVBQXNCQSxRQUFRLEVBQVQsR0FBZSxHQUFwQyxFQUEwQ0EsUUFBUSxDQUFULEdBQWMsR0FBdkQsRUFBNERBLE9BQU8sR0FBbkUsQ0FBbkIsQ0FBUDtBQUNILEs7O0FBRUQ7Ozs7Ozs7Ozs7O3VCQVNBYyxRLHFCQUFTZCxJLEVBQU07QUFDWCxlQUFPLDRCQUFtQixDQUFDQSxPQUFPLEdBQVIsRUFBY0EsUUFBUSxDQUFULEdBQWMsR0FBM0IsQ0FBbkIsQ0FBUDtBQUNILEs7Ozs7MEJBalRhdEUsTSxFQUFRO0FBQ2xCLGlCQUFLQSxNQUFMLEdBQWNBLE1BQWQ7QUFDSDs7Ozs7QUFpVEw7Ozs7O2tCQUdlWCxRIiwiZmlsZSI6IlBuZ0ltYWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBtb2R1bGUgUG5nSW1hZ2VcclxuICogXHJcbiAqIEBkZXNjcmlwdGlvbiBQbmcgSW1hZ2UgQ2xhc3MgZm9yIGdlbmVyYXRpb24gcG5nIGltYWdlcy5cclxuICpcclxuICogQHZlcnNpb24gMS4wXHJcbiAqIEBhdXRob3IgR3JpZ29yeSBWYXNpbHlldiA8cG9zdGNzcy5oYW1zdGVyQGdtYWlsLmNvbT4gaHR0cHM6Ly9naXRodWIuY29tL2gwdGMwZDNcclxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTcsIEdyaWdvcnkgVmFzaWx5ZXZcclxuICogQGxpY2Vuc2UgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wLCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjAgXHJcbiAqIFxyXG4gKi9cclxuXHJcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHpsaWIgZnJvbSBcInpsaWJcIjtcclxuaW1wb3J0IHtzYWZlVWludDhBcnJheSwgc2NtcFN0cn0gZnJvbSBcIi4vSGVscGVyc1wiO1xyXG5cclxuY2xhc3MgUG5nSW1hZ2Uge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogIENvbnN0cnVjdG9yIGZvciBQbmdJbWFnZSBDbGFzcy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGVwdGggLSBjb2xvciBkZXB0aC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb2xvcnR5cGUgLSBwbmcgY29sb3IgdHlwZS5cclxuICAgICAqIFxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiA8cHJlPlxyXG4gICAgICogQ29sb3IgZGVwdGhzOlxyXG4gICAgICogXHJcbiAgICAgKiBQTkcgaW1hZ2UgdHlwZSAgICAgICAgICAgQ29sb3VyIHR5cGUgICAgQWxsb3dlZCBiaXQgZGVwdGhzICAgICAgIEludGVycHJldGF0aW9uXHJcbiAgICAgKiBHcmV5c2NhbGUgICAgICAgICAgICAgICAgMCAgICAgICAgICAgICAgICAxLCAyLCA0LCA4LCAxNiAgICAgICAgIEVhY2ggcGl4ZWwgaXMgYSBncmV5c2NhbGUgc2FtcGxlXHJcbiAgICAgKiBUcnVlY29sb3IgICAgICAgICAgICAgICAgMiAgICAgICAgICAgICAgICA4LCAxNiAgICAgICAgICAgICAgICAgIEVhY2ggcGl4ZWwgaXMgYW4gUixHLEIgdHJpcGxlXHJcbiAgICAgKiBJbmRleGVkLWNvbG9yICAgICAgICAgICAgMyAgICAgICAgICAgICAgICAxLCAyLCA0LCA4ICAgICAgICAgICAgIEVhY2ggcGl4ZWwgaXMgYSBwYWxldHRlIGluZGV4OyBhIFBMVEUgY2h1bmsgc2hhbGwgYXBwZWFyLlxyXG4gICAgICogR3JleXNjYWxlIHdpdGggYWxwaGEgICAgIDQgICAgICAgICAgICAgICAgOCwgMTYgICAgICAgICAgICAgICAgICBFYWNoIHBpeGVsIGlzIGEgZ3JleXNjYWxlIHNhbXBsZSBmb2xsb3dlZCBieSBhbiBhbHBoYSBzYW1wbGUuXHJcbiAgICAgKiBUcnVlY29sb3Igd2l0aCBhbHBoYSAgICAgNiAgICAgICAgICAgICAgICA4LCAxNiAgICAgICAgICAgICAgICAgIEVhY2ggcGl4ZWwgaXMgYW4gUixHLEIgdHJpcGxlIGZvbGxvd2VkIGJ5IGFuIGFscGhhIHNhbXBsZS5cclxuICAgICAqIDwvcHJlPlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihkZXB0aCA9IDgsIGNvbG9ydHlwZSA9IDYpIHtcclxuICAgICAgICB0aGlzLmRlcHRoID0gZGVwdGg7XHJcbiAgICAgICAgdGhpcy5jb2xvcnR5cGUgPSBjb2xvcnR5cGU7XHJcbiAgICAgICAgdGhpcy50cmFuc3BhcmVudCA9IG5ldyBzYWZlVWludDhBcnJheShbMCwgMCwgMCwgMF0pOyAvLyBUcmFuc3BhcmVudCBjb2xvclxyXG4gICAgICAgIHRoaXMuaWVuZCA9IG5ldyBzYWZlVWludDhBcnJheShbMCwgMCwgMCwgMCwgNzMsIDY5LCA3OCwgNjgsIDE3NCwgNjYsIDk2LCAxMzBdKTsgLy8gSUVORCBDSFVOS1xyXG4gICAgICAgIGxldCBzYWZlVWludDMyQXJyYXkgPSBzY21wU3RyKHR5cGVvZiBVaW50MzJBcnJheSwgXCJ1bmRlZmluZWRcIikgPyBBcnJheSA6IFVpbnQzMkFycmF5O1xyXG4gICAgICAgIC8vIHRoaXMucGFrbyA9IHJlcXVpcmUoXCJwYWtvXCIpO1xyXG4gICAgICAgIC8vLy8gcHJlIGNhbGN1bGF0ZWQgY3JjIHRhYmxlIGZvciBjcmMzMiBtZXRob2RcclxuICAgICAgICB0aGlzLmNyY1RhYmxlID0gbmV3IHNhZmVVaW50MzJBcnJheShbXHJcbiAgICAgICAgICAgIDAsIDE5OTY5NTk4OTQsIC0zMDEwNDc1MDgsIC0xNzI3NDQyNTAyLCAxMjQ2MzQxMzcsXHJcbiAgICAgICAgICAgIDE4ODYwNTc2MTUsIC0zNzkzNDU2MTEsIC0xNjM3NTc1MjYxLCAyNDkyNjgyNzQsIDIwNDQ1MDgzMjQsXHJcbiAgICAgICAgICAgIC01MjI4NTIwNjYsIC0xNzQ3Nzg5NDMyLCAxNjI5NDE5OTUsIDIxMjU1NjEwMjEsIC00MDczNjAyNDksXHJcbiAgICAgICAgICAgIC0xODY2NTIzMjQ3LCA0OTg1MzY1NDgsIDE3ODk5Mjc2NjYsIC0yMDU5NTA2NDgsIC0yMDY3OTA2MDgyLFxyXG4gICAgICAgICAgICA0NTA1NDg4NjEsIDE4NDMyNTg2MDMsIC0xODczODY1NDMsIC0yMDgzMjg5NjU3LCAzMjU4ODM5OTAsXHJcbiAgICAgICAgICAgIDE2ODQ3NzcxNTIsIC00Mzg0NTI1NCwgLTE5NzMwNDA2NjAsIDMzNTYzMzQ4NywgMTY2MTM2NTQ2NSxcclxuICAgICAgICAgICAgLTk5NjY0NTQxLCAtMTkyODg1MTk3OSwgOTk3MDczMDk2LCAxMjgxOTUzODg2LCAtNzE1MTExOTY0LFxyXG4gICAgICAgICAgICAtMTU3MDI3OTA1NCwgMTAwNjg4ODE0NSwgMTI1ODYwNzY4NywgLTc3MDg2NTY2NywgLTE1MjYwMjQ4NTMsXHJcbiAgICAgICAgICAgIDkwMTA5NzcyMiwgMTExOTAwMDY4NCwgLTYwODQ1MDA5MCwgLTEzOTY5MDE1NjgsIDg1MzA0NDQ1MSxcclxuICAgICAgICAgICAgMTE3MjI2NjEwMSwgLTU4OTk1MTUzNywgLTE0MTIzNTA2MzEsIDY1MTc2Nzk4MCwgMTM3MzUwMzU0NixcclxuICAgICAgICAgICAgLTkyNTQxMjk5MiwgLTEwNzY4NjI2OTgsIDU2NTUwNzI1MywgMTQ1NDYyMTczMSwgLTgwOTg1NTU5MSxcclxuICAgICAgICAgICAgLTExOTU1MzA5OTMsIDY3MTI2Njk3NCwgMTU5NDE5ODAyNCwgLTk3MjIzNjM2NiwgLTEzMjQ2MTk0ODQsXHJcbiAgICAgICAgICAgIDc5NTgzNTUyNywgMTQ4MzIzMDIyNSwgLTEwNTA2MDAwMjEsIC0xMjM0ODE3NzMxLCAxOTk0MTQ2MTkyLFxyXG4gICAgICAgICAgICAzMTE1ODUzNCwgLTE3MzEwNTk1MjQsIC0yNzEyNDkzNjYsIDE5MDc0NTk0NjUsIDExMjYzNzIxNSxcclxuICAgICAgICAgICAgLTE2MTQ4MTQwNDMsIC0zOTA1NDAyMzcsIDIwMTM3NzYyOTAsIDI1MTcyMjAzNiwgLTE3Nzc3NTE5MjIsXHJcbiAgICAgICAgICAgIC01MTkxMzcyNTYsIDIxMzc2NTY3NjMsIDE0MTM3NjgxMywgLTE4NTU2ODk1NzcsIC00Mjk2OTU5OTksXHJcbiAgICAgICAgICAgIDE4MDIxOTU0NDQsIDQ3Njg2NDg2NiwgLTIwNTY5NjU5MjgsIC0yMjg0NTg0MTgsIDE4MTIzNzA5MjUsXHJcbiAgICAgICAgICAgIDQ1MzA5MjczMSwgLTIxMTMzNDIyNzEsIC0xODM1MTYwNzMsIDE3MDYwODg5MDIsIDMxNDA0MjcwNCxcclxuICAgICAgICAgICAgLTE5NTA0MzUwOTQsIC01NDk0OTc2NCwgMTY1ODY1ODI3MSwgMzY2NjE5OTc3LCAtMTkzMjI5Njk3MyxcclxuICAgICAgICAgICAgLTY5OTcyODkxLCAxMzAzNTM1OTYwLCA5ODQ5NjE0ODYsIC0xNTQ3OTYwMjA0LCAtNzI1OTI5NzU4LFxyXG4gICAgICAgICAgICAxMjU2MTcwODE3LCAxMDM3NjA0MzExLCAtMTUyOTc1NjU2MywgLTc0MDg4NzMwMSwgMTEzMTAxNDUwNixcclxuICAgICAgICAgICAgODc5Njc5OTk2LCAtMTM4NTcyMzgzNCwgLTYzMTE5NTQ0MCwgMTE0MTEyNDQ2NywgODU1ODQyMjc3LFxyXG4gICAgICAgICAgICAtMTQ0MjE2NTY2NSwgLTU4NjMxODY0NywgMTM0MjUzMzk0OCwgNjU0NDU5MzA2LCAtMTEwNjU3MTI0OCxcclxuICAgICAgICAgICAgLTkyMTk1MjEyMiwgMTQ2NjQ3OTkwOSwgNTQ0MTc5NjM1LCAtMTE4NDQ0MzM4MywgLTgzMjQ0NTI4MSxcclxuICAgICAgICAgICAgMTU5MTY3MTA1NCwgNzAyMTM4Nzc2LCAtMTMyODUwNjg0NiwgLTk0MjE2Nzg4NCwgMTUwNDkxODgwNyxcclxuICAgICAgICAgICAgNzgzNTUxODczLCAtMTIxMjMyNjg1MywgLTEwNjE1MjQzMDcsIC0zMDY2NzQ5MTIsIC0xNjk4NzEyNjUwLFxyXG4gICAgICAgICAgICA2MjMxNzA2OCwgMTk1NzgxMDg0MiwgLTM1NTEyMTM1MSwgLTE2NDcxNTExODUsIDgxNDcwOTk3LFxyXG4gICAgICAgICAgICAxOTQzODAzNTIzLCAtNDgwMDQ4MzY2LCAtMTgwNTM3MDQ5MiwgMjI1Mjc0NDMwLCAyMDUzNzkwMzc2LFxyXG4gICAgICAgICAgICAtNDY4NzkxNTQxLCAtMTgyODA2MTI4MywgMTY3ODE2NzQzLCAyMDk3NjUxMzc3LCAtMjY3NDE0NzE2LFxyXG4gICAgICAgICAgICAtMjAyOTQ3NjkxMCwgNTAzNDQ0MDcyLCAxNzYyMDUwODE0LCAtMTQ0NTUwMDUxLCAtMjE0MDgzNzk0MSxcclxuICAgICAgICAgICAgNDI2NTIyMjI1LCAxODUyNTA3ODc5LCAtMTk2NTM3NzAsIC0xOTgyNjQ5Mzc2LCAyODI3NTM2MjYsXHJcbiAgICAgICAgICAgIDE3NDI1NTU4NTIsIC0xMDUyNTkxNTMsIC0xOTAwMDg5MzUxLCAzOTc5MTc3NjMsIDE2MjIxODM2MzcsXHJcbiAgICAgICAgICAgIC02OTA1NzY0MDgsIC0xNTgwMTAwNzM4LCA5NTM3Mjk3MzIsIDEzNDAwNzY2MjYsIC03NzYyNDczMTEsXHJcbiAgICAgICAgICAgIC0xNDk3NjA2Mjk3LCAxMDY4ODI4MzgxLCAxMjE5NjM4ODU5LCAtNjcwMjI1NDQ2LCAtMTM1ODI5MjE0OCxcclxuICAgICAgICAgICAgOTA2MTg1NDYyLCAxMDkwODEyNTEyLCAtNTQ3Mjk1MjkzLCAtMTQ2OTU4NzYyNywgODI5MzI5MTM1LFxyXG4gICAgICAgICAgICAxMTgxMzM1MTYxLCAtODgyNzg5NDkyLCAtMTEzNDEzMjQ1NCwgNjI4MDg1NDA4LCAxMzgyNjA1MzY2LFxyXG4gICAgICAgICAgICAtODcxNTk4MTg3LCAtMTE1Njg4ODgyOSwgNTcwNTYyMjMzLCAxNDI2NDAwODE1LCAtOTc3NjUwNzU0LFxyXG4gICAgICAgICAgICAtMTI5NjIzMzY4OCwgNzMzMjM5OTU0LCAxNTU1MjYxOTU2LCAtMTAyNjAzMTcwNSwgLTEyNDQ2MDY2NzEsXHJcbiAgICAgICAgICAgIDc1MjQ1OTQwMywgMTU0MTMyMDIyMSwgLTE2ODc4OTUzNzYsIC0zMjg5OTQyNjYsIDE5Njk5MjI5NzIsXHJcbiAgICAgICAgICAgIDQwNzM1NDk4LCAtMTY3NzEzMDA3MSwgLTM1MTM5MDE0NSwgMTkxMzA4Nzg3NywgODM5MDgzNzEsXHJcbiAgICAgICAgICAgIC0xNzgyNjI1NjYyLCAtNDkxMjI2NjA0LCAyMDc1MjA4NjIyLCAyMTMyNjExMTIsIC0xODMxNjk0NjkzLFxyXG4gICAgICAgICAgICAtNDM4OTc3MDExLCAyMDk0ODU0MDcxLCAxOTg5NTg4ODEsIC0yMDMyOTM4Mjg0LCAtMjM3NzA2Njg2LFxyXG4gICAgICAgICAgICAxNzU5MzU5OTkyLCA1MzQ0MTQxOTAsIC0yMTE4MjQ4NzU1LCAtMTU1NjM4MTgxLCAxODczODM2MDAxLFxyXG4gICAgICAgICAgICA0MTQ2NjQ1NjcsIC0yMDEyNzE4MzYyLCAtMTU3NjY5MjgsIDE3MTE2ODQ1NTQsIDI4NTI4MTExNixcclxuICAgICAgICAgICAgLTE4ODkxNjU1NjksIC0xMjc3NTA1NTEsIDE2MzQ0Njc3OTUsIDM3NjIyOTcwMSwgLTE2MDk4OTk0MDAsXHJcbiAgICAgICAgICAgIC02ODY5NTk4OTAsIDEzMDg5MTg2MTIsIDk1NjU0MzkzOCwgLTE0ODY0MTIxOTEsIC03OTkwMDkwMzMsXHJcbiAgICAgICAgICAgIDEyMzE2MzYzMDEsIDEwNDc0MjcwMzUsIC0xMzYyMDA3NDc4LCAtNjQwMjYzNDYwLCAxMDg4MzU5MjcwLFxyXG4gICAgICAgICAgICA5MzY5MTgwMDAsIC0xNDQ3MjUyMzk3LCAtNTU4MTI5NDY3LCAxMjAyOTAwODYzLCA4MTcyMzM4OTcsXHJcbiAgICAgICAgICAgIC0xMTExNjI1MTg4LCAtODkzNzMwMTY2LCAxNDA0Mjc3NTUyLCA2MTU4MTgxNTAsIC0xMTYwNzU5ODAzLFxyXG4gICAgICAgICAgICAtODQxNTQ2MDkzLCAxNDIzODU3NDQ5LCA2MDE0NTA0MzEsIC0xMjg1MTI5NjgyLCAtMTAwMDI1Njg0MCxcclxuICAgICAgICAgICAgMTU2NzEwMzc0NiwgNzExOTI4NzI0LCAtMTI3NDI5ODgyNSwgLTEwMjI1ODcyMzEsIDE1MTAzMzQyMzUsIDc1NTE2NzExN10pO1xyXG4gICAgICAgIHRoaXMuaWhkciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5pZGF0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1hdHJpeCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5pbWFnZSA9IG51bGw7XHJcbiAgICAgICAgICAgIC8vIGZvciAobGV0IGogPSAwOyBqIDwgMjU2OyBqKyspIHtcclxuICAgICAgICAgICAgLy8gXHRsZXQgYyA9IGo7XHJcbiAgICAgICAgICAgIC8vIFx0Zm9yIChsZXQgayA9IDA7IGsgPCA4OyBrKyspIHtcclxuICAgICAgICAgICAgLy8gXHRcdGlmIChjICYgMSkge1xyXG4gICAgICAgICAgICAvLyBcdFx0XHRjID0gLTMwNjY3NDkxMiBeIChjID4+PiAxKTtcclxuICAgICAgICAgICAgLy8gXHRcdH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIFx0XHRcdGMgPSBjID4+PiAxO1xyXG4gICAgICAgICAgICAvLyBcdFx0fVxyXG4gICAgICAgICAgICAvLyBcdH1cclxuICAgICAgICAgICAgLy8gXHR0aGlzLmNyY1RhYmxlW2pdID0gYztcclxuICAgICAgICAgICAgLy8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IElIRFIgc2V0dGluZ3MgYW5kIGdlbmVyYXRlIElIRFIgQ2h1bmsgZm9yIFBORyBJbWFnZS5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gaW1hZ2UgaGVpZ2h0LlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gaW1hZ2Ugd2lkdGguXHJcbiAgICAgKiBcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogPHByZT5cclxuICAgICAqIElIRFIgRm9ybWF0OlxyXG4gICAgICogV2lkdGggNCBieXRlc1xyXG4gICAgICogSGVpZ2h0IDQgYnl0ZXNcclxuICAgICAqIEJpdCBkZXB0aCAxIGJ5dGVcclxuICAgICAqIENvbG91ciB0eXBlIDEgYnl0ZVxyXG4gICAgICogQ29tcHJlc3Npb24gbWV0aG9kIDEgYnl0ZVxyXG4gICAgICogRmlsdGVyIG1ldGhvZCAxIGJ5dGVcclxuICAgICAqIEludGVybGFjZSBtZXRob2QgMSBieXRlXHJcbiAgICAgKiA8L3ByZT5cclxuICAgICAqL1xyXG4gICAgc2V0SUhEUihoZWlnaHQgPSAxLCB3aWR0aCA9IDEpIHtcclxuXHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIC8vIElIRFIgQ2h1bmtcclxuICAgICAgICB0aGlzLmloZHIgPSBuZXcgc2FmZVVpbnQ4QXJyYXkoMjUpO1xyXG4gICAgICAgIHRoaXMuaWhkci5zZXQodGhpcy5ieXRlNCgxMyksIDApO1xyXG4gICAgICAgIHRoaXMuaWhkci5zZXQoWzczLCA3MiwgNjgsIDgyXSwgNCk7XHJcbiAgICAgICAgdGhpcy5paGRyLnNldCh0aGlzLmJ5dGU0KHRoaXMud2lkdGgpLCA4KTtcclxuICAgICAgICB0aGlzLmloZHIuc2V0KHRoaXMuYnl0ZTQodGhpcy5oZWlnaHQpLCAxMik7XHJcbiAgICAgICAgdGhpcy5paGRyLnNldChbdGhpcy5kZXB0aCwgdGhpcy5jb2xvcnR5cGUsIDAsIDAsIDBdLCAxNik7XHJcblxyXG4gICAgICAgIGxldCB0bXAgPSBuZXcgc2FmZVVpbnQ4QXJyYXkoMTcpO1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgMTc7IGorKykge1xyXG4gICAgICAgICAgICB0bXBbal0gPSB0aGlzLmloZHJbaiArIDRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmloZHIuc2V0KHRoaXMuY3JjMzIodG1wKSwgMjEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgcnVsZXIgaW1hZ2UgbWF0cml4LlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBpbWFnZSBoZWlnaHQuXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgLSBydWxlciBsaW5lIGNvbG9yLiBTdXBwb3J0IGhleCBjb2xvciBsaWtlICM0NTQ1NDUsIHdlYiBzYWZlIGhleCBsaWtlICMzMzMsXHJcbiAgICAgKiByZ2IoMjU1LCAxNDMsIDE1KSAtIHJlZCwgIGdyZWVuLCBibHVlLCByZ2JhKDI1NSwgMTQzLCAxNSwgMC42KSAtIHJlZCwgIGdyZWVuLCBibHVlLCBhbHBoYSh0cmFuc3BhcmVuY3kpLlxyXG4gICAgICogQHBhcmFtIHthcnJheX0gcGF0dGVybiAtIHJ1bGVyIGxpbmUgcGF0dGVybiBhcnJheSBsaWtlIFsxLCAwLCAwLCAwXSAtIHZhbHVlID0gMSAtIHdyaXRlIGNvbG9yIHBpeGVsLFxyXG4gICAgICogdmFsdWVzID0gMCB3cml0ZSB0cmFuc3BhcmVudCBwaXhlbC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aGlja25lc3MgLSBydWxlciBsaW5lIHRoaWNrbmVzcyBpbiBwaXhlbHMuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NhbGUgLSBpbWFnZSBzY2FsZSByYXRpby5cclxuICAgICAqIFxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiA8cHJlPlxyXG4gICAgICogRmlsdGVyIFR5cGVzOlxyXG4gICAgICogMCAgICBOb25lICAgICAgICBGaWx0KHgpID0gT3JpZyh4KSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVjb24oeCkgPSBGaWx0KHgpXHJcbiAgICAgKiAxICAgIFN1YiAgICAgICAgIEZpbHQoeCkgPSBPcmlnKHgpIC0gT3JpZyhhKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWNvbih4KSA9IEZpbHQoeCkgKyBSZWNvbihhKVxyXG4gICAgICogMiAgICBVcCAgICAgICAgICBGaWx0KHgpID0gT3JpZyh4KSAtIE9yaWcoYikgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVjb24oeCkgPSBGaWx0KHgpICsgUmVjb24oYilcclxuICAgICAqIDMgICAgQXZlcmFnZSAgICAgRmlsdCh4KSA9IE9yaWcoeCkgLSBmbG9vcigoT3JpZyhhKSArIE9yaWcoYikpIC8gMikgICAgICAgICAgICAgIFJlY29uKHgpID0gRmlsdCh4KSArIGZsb29yKChSZWNvbihhKSArIFJlY29uKGIpKSAvIDIpXHJcbiAgICAgKiA0ICAgIFBhZXRoICAgICAgIEZpbHQoeCkgPSBPcmlnKHgpIC0gUGFldGhQcmVkaWN0b3IoT3JpZyhhKSwgT3JpZyhiKSwgT3JpZyhjKSkgICBSZWNvbih4KSA9IEZpbHQoeCkgKyBQYWV0aFByZWRpY3RvcihSZWNvbihhKSwgUmVjb24oYiksIFJlY29uKGMpXHJcbiAgICAgKiA8L3ByZT5cclxuICAgICAqL1xyXG4gICAgcnVsZXJNYXRyaXgoaGVpZ2h0LCBjb2xvciwgcGF0dGVybiwgdGhpY2tuZXNzID0gMSwgc2NhbGUgPSAxKSB7XHJcblxyXG4gICAgICAgIGxldCBwbGVuID0gcGF0dGVybi5sZW5ndGg7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0SUhEUihNYXRoLnJvdW5kKGhlaWdodCAqIHNjYWxlKSwgTWF0aC5yb3VuZChwbGVuICogc2NhbGUpKTtcclxuXHJcbiAgICAgICAgLy9wYXRlcm4gdGhpY2tuZXNzXHJcbiAgICAgICAgdGhpY2tuZXNzID0gdGhpY2tuZXNzICogc2NhbGU7XHJcbiAgICAgICAgLy8gU2NhbmxpbmUgZmlsdGVyIDBcclxuICAgICAgICBsZXQgZmlsdGVyID0gbmV3IHNhZmVVaW50OEFycmF5KFswXSk7XHJcblxyXG4gICAgICAgIHRoaXMucGl4ZWxjb2xvciA9IHRoaXMucGFyc2VDb2xvcihjb2xvcik7XHJcbiAgICAgICAgbGV0IHBhdHRlcm5IZWlnaHQgPSBNYXRoLmZsb29yKHRoaWNrbmVzcyAvIDIpO1xyXG4gICAgICAgIGxldCBwYXQgPSBuZXcgc2FmZVVpbnQ4QXJyYXkocGF0dGVybik7XHJcbiAgICAgICAgbGV0IHJlbWFpbmRlciA9IHRoaWNrbmVzcyAlIDI7XHJcblxyXG4gICAgICAgIGxldCBib3R0b20gPSB0aGlzLmhlaWdodCAtIHBhdHRlcm5IZWlnaHQgLSByZW1haW5kZXI7XHJcblxyXG4gICAgICAgIC8vbGV0IGJvdHRvbSA9IHRoaXMuaGVpZ2h0IC0gdGhpY2tuZXNzO1xyXG4gICAgICAgIHRoaXMubWF0cml4ID0gbmV3IHNhZmVVaW50OEFycmF5KHRoaXMuaGVpZ2h0ICogdGhpcy53aWR0aCAqIDQgKyB0aGlzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIGxldCBwbGluZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBzY2FuIGxpbmVzXHJcbiAgICAgICAgbGV0IHBvcyA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmhlaWdodDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgMCBmaWx0ZXIgYXQgbmV3IHNjYW5saW5lXHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4LnNldChmaWx0ZXIsIHBvcyk7XHJcbiAgICAgICAgICAgIHBvcysrO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3VycmVudCBsaW5lIGluY2x1ZGUgcnVsZXIgcGF0dGVybiA/IC8vIHRvcCBhbmQgYm90dG9tXHJcbiAgICAgICAgICAgIHBsaW5lID0gaSA8IHBhdHRlcm5IZWlnaHQgfHwgaSA+PSBib3R0b207XHJcblxyXG4gICAgICAgICAgICAvLyAvLyBDdXJyZW50IGxpbmUgaW5jbHVkZSBydWxlciBwYXR0ZXJuID8gLy8gYm90dG9tXHJcbiAgICAgICAgICAgIC8vIGlmIChpID49IGJvdHRvbSkge1xyXG4gICAgICAgICAgICAvLyAgICAgcGxpbmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyAgICAgcGxpbmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLndpZHRoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChwbGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwaW5kZXggPSBNYXRoLmZsb29yKGogLyBzY2FsZSkgJSBwbGVuO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXRbcGluZGV4XSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeC5zZXQodGhpcy5waXhlbGNvbG9yLCBwb3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWF0cml4LnNldCh0aGlzLnRyYW5zcGFyZW50LCBwb3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXRyaXguc2V0KHRoaXMudHJhbnNwYXJlbnQsIHBvcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgXHJcbiAgICAgICAgICAgICAgICBwb3MgKz0gNDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMubWF0cml4LnN1YmFycmF5KDAsIHBvcykudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgdGhpcy5tYWtlSURBVCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGltYWdlIG1hdHJpeC5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gbWF0cml4IC0gYnl0ZXMuXHJcbiAgICAgKiBcclxuICAgICAqL1xyXG4gICAgc2V0IHNldE1hdHJpeChtYXRyaXgpIHtcclxuICAgICAgICB0aGlzLm1hdHJpeCA9IG1hdHJpeDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlIElEQVQgQ2h1bmsgZm9yIGltYWdlLiBEZWZsYXRlIGltYWdlIG1hdHJpeC5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKi9cclxuICAgIG1ha2VJREFUKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm1hdHJpeCkge1xyXG4gICAgICAgICAgICBsZXQgbWF0cml4ID0gemxpYi5kZWZsYXRlU3luYyhuZXcgQnVmZmVyKHRoaXMubWF0cml4KSwge1xyXG4gICAgICAgICAgICAgICAgbGV2ZWw6IDlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIG1hdHJpeCA9IG5ldyBzYWZlVWludDhBcnJheShtYXRyaXguYnVmZmVyLCBtYXRyaXguYnl0ZU9mZnNldCwgbWF0cml4LmJ5dGVMZW5ndGggLyBzYWZlVWludDhBcnJheS5CWVRFU19QRVJfRUxFTUVOVCk7XHJcbiAgICAgICAgICAgIC8vIGxldCBtYXRyaXggPSB0aGlzLnBha28uZGVmbGF0ZSh0aGlzLm1hdHJpeCk7XHJcbiAgICAgICAgICAgIGxldCBtbGVuID0gbWF0cml4Lmxlbmd0aDtcclxuICAgICAgICAgICAgdGhpcy5pZGF0ID0gbmV3IHNhZmVVaW50OEFycmF5KG1sZW4gKyAxMik7XHJcbiAgICAgICAgICAgIHRoaXMuaWRhdC5zZXQodGhpcy5ieXRlNChtbGVuKSwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuaWRhdC5zZXQoWzczLCA2OCwgNjUsIDg0XSwgNCk7XHJcbiAgICAgICAgICAgIHRoaXMuaWRhdC5zZXQobWF0cml4LCA4KTtcclxuICAgICAgICAgICAgbGV0IHRzaXplID0gbWxlbiArIDQ7XHJcbiAgICAgICAgICAgIGxldCB0bXAgPSBuZXcgc2FmZVVpbnQ4QXJyYXkodHNpemUpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRzaXplOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHRtcFtqXSA9IHRoaXMuaWRhdFtqICsgNF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5pZGF0LnNldCh0aGlzLmNyYzMyKHRtcCksIG1sZW4gKyA4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFrZSBpbWFnZSBiZWZvcmUgb3V0cHV0LiBHbHVlIGFsbCBQTkcgQ2h1bmtzIHdpdGggUE5HIEhlYWRlci5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKi9cclxuICAgIG1ha2VJbWFnZSgpIHtcclxuICAgICAgICAvLyBHbHVlIGNodW5rcyB3aXRoIFBORyBpbWFnZSBoZWFkZXJcclxuICAgICAgICAvL0J1ZmZlci5jb25jYXQoW3RoaXMuZnJvbUhleChbMHg4OSwgMHg1MCwgMHg0RSwgMHg0NywgMHgwRCwgMHgwQSwgMHgxQSwgMHgwQV0pLCB0aGlzLmloZHIsIHRoaXMuaWRhdCwgdGhpcy5pZW5kXSlcclxuICAgICAgICBsZXQgbGloZHIgPSB0aGlzLmloZHIubGVuZ3RoO1xyXG4gICAgICAgIGxldCBsaWRhdCA9IHRoaXMuaWRhdC5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy5pbWFnZSA9IG5ldyBzYWZlVWludDhBcnJheShsaWhkciArIGxpZGF0ICsgMjApO1xyXG4gICAgICAgIHRoaXMuaW1hZ2Uuc2V0KFsxMzcsIDgwLCA3OCwgNzEsIDEzLCAxMCwgMjYsIDEwXSwgMCk7XHJcbiAgICAgICAgdGhpcy5pbWFnZS5zZXQodGhpcy5paGRyLCA4KTtcclxuICAgICAgICB0aGlzLmltYWdlLnNldCh0aGlzLmlkYXQsIGxpaGRyICsgOCk7XHJcbiAgICAgICAgdGhpcy5pbWFnZS5zZXQodGhpcy5pZW5kLCBsaWhkciArIGxpZGF0ICsgOCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSBjb2xvciBmcm9tIHN0cmluZy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgLSBjb2xvciBhcyBzdHJpbmcuXHJcbiAgICAgKiBTdXBwb3J0IGhleCBjb2xvciBsaWtlICM0NTQ1NDUsIHdlYiBzYWZlIGhleCBsaWtlICMzMzMsIHJnYigyNTUsIDE0MywgMTUpIC0gcmVkLCAgZ3JlZW4sIGJsdWUsXHJcbiAgICAgKiByZ2JhKDI1NSwgMTQzLCAxNSwgMC42KSAtIHJlZCwgIGdyZWVuLCBibHVlLCBhbHBoYSh0cmFuc3BhcmVuY3kpLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyAgVWludDhBcnJheSAtIGNvbG9yIGZvciBwbmcgaW1hZ2UgZW5jb2RlZCBhcyBieXRlcy5cclxuICAgICAqL1xyXG4gICAgcGFyc2VDb2xvcihjb2xvcikge1xyXG5cclxuICAgICAgICAvLyB0cmFuc3BhcmVudCBjb2xvclxyXG4gICAgICAgIGxldCBbcmVkLCBncmVlbiwgYmx1ZSwgYWxwaGFdID0gWzAsIDAsIDAsIDBdO1xyXG4gICAgICAgIGxldCBmb3VuZDtcclxuICAgICAgICAvLyBIZXggY29sb3IgbGlrZSAjNDU0NTQ1XHJcbiAgICAgICAgaWYgKChmb3VuZCA9IGNvbG9yLm1hdGNoKC8jKFswLTlhLXpBLVpdezMsIDZ9KS8pKSkge1xyXG4gICAgICAgICAgICBsZXQgZmxlbiA9IGZvdW5kWzFdLmxlbmd0aDtcclxuICAgICAgICAgICAgaWYgKGZsZW4gPT09IDYpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBbcmVkLCBncmVlbiwgYmx1ZV0gPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoZm91bmRbMV0uc3Vic3RyKDAsIDIpLCAxNiksXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoZm91bmRbMV0uc3Vic3RyKDIsIDIpLCAxNiksXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoZm91bmRbMV0uc3Vic3RyKDQsIDIpLCAxNilcclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgYWxwaGEgPSAyNTU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmxlbi5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgICAgIC8vIEhleCBjb2xvcnMgbGlrZSAjMzMzXHJcbiAgICAgICAgICAgICAgICBsZXQgcmMgPSBmb3VuZFsxXS5zdWJzdHIoMCwgMSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ2MgPSBmb3VuZFsxXS5zdWJzdHIoMSwgMSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmMgPSBmb3VuZFsxXS5zdWJzdHIoMiwgMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmMgPSByYyArIHJjO1xyXG4gICAgICAgICAgICAgICAgZ2MgPSBnYyArIGdjO1xyXG4gICAgICAgICAgICAgICAgYmMgPSBiYyArIGJjO1xyXG5cclxuICAgICAgICAgICAgICAgIFtyZWQsIGdyZWVuLCBibHVlXSA9IFtcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChyYywgMTYpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGdjLCAxNiksXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYmMsIDE2KVxyXG4gICAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgICAgICBhbHBoYSA9IDI1NTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gcmdiIHJnYmEgY29sb3JzIGxpa2UgcmdiYSgyNTUsIDI1NSwyNTUsIDI1NSlcclxuICAgICAgICB9IGVsc2UgaWYgKChmb3VuZCA9IGNvbG9yLm1hdGNoKC9yZ2JhKlxcKCguKj8pXFwpLykpKSB7XHJcblxyXG4gICAgICAgICAgICBbcmVkLCBncmVlbiwgYmx1ZSwgYWxwaGFdID0gZm91bmRbMV0uc3BsaXQoL1xccyosXFxzKi9pKTtcclxuICAgICAgICAgICAgYWxwaGEgPSAoYWxwaGEgJiYgYWxwaGEgPiAwKSA/IE1hdGgucm91bmQoYWxwaGEgKiAyNTUpIDogMjU1O1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yKHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlIHJnYmEgY29sb3IgZm9yIFBORyBJbWFnZS5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcmVkIC0gcmVkIHZhbHVlIGluIHJnYiBwYWxldHRlLlxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGdyZWVuIC0gZ3JlZW4gdmFsdWUgaW4gcmdiIHBhbGV0dGUuXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gYmx1ZSAtIGJsdWUgdmFsdWUgaW4gcmdiIHBhbGV0dGUuXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gYWxwaGEgLSB0cmFuc3BhcmVuY3kgdmFsdWUuXHJcbiAgICAgKiBcclxuICAgICAqIEBkZXNjcmlwdGlvbiBBbGwgdmFsdWVzIG11c3QgYmUgZnJvbSAwIHRvIDI1NS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMgVWludDhBcnJheSAtIGNvbG9yIGVuY29kZWQgYXMgYnl0ZXMuXHJcbiAgICAgKi9cclxuICAgIGNvbG9yKHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhKSB7XHJcbiAgICAgICAgbGV0IHJldCA9IG5ldyBzYWZlVWludDhBcnJheSg0KTtcclxuICAgICAgICByZXRbMF0gPSAocmVkICYmIHJlZCA+PSAwICYmIHJlZCA8PSAyNTUpID8gcmVkIDogMjU1O1xyXG4gICAgICAgIHJldFsxXSA9IChncmVlbiAmJiBncmVlbiA+PSAwICYmIGdyZWVuIDw9IDI1NSkgPyBncmVlbiA6IDI1NTtcclxuICAgICAgICByZXRbMl0gPSAoYmx1ZSAmJiBibHVlID49IDAgJiYgYmx1ZSA8PSAyNTUpID8gYmx1ZSA6IDI1NTtcclxuICAgICAgICByZXRbM10gPSAoYWxwaGEgJiYgYWxwaGEgPj0gMCAmJiBhbHBoYSA8PSAyNTUpID8gYWxwaGEgOiAyNTU7XHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiBwbmcgaW1hZ2UgaW4gYmFzZTY0IGZvcm1hdC5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7QnVmZmVyfSAtIGJhc2U2NCBzdHJpbmcgLSBlbmNvZGVkIGltYWdlLlxyXG4gICAgICovXHJcbiAgICBnZXRCYXNlNjQoKSB7XHJcbiAgICAgICAgdGhpcy5tYWtlSW1hZ2UoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5iYXNlNjQodGhpcy5pbWFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXcml0ZSBpbWFnZSB0byBmaWxlLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBmaWxlbmFtZSAtIGltYWdlIGZpbGUgbmFtZS5cclxuICAgICAqL1xyXG4gICAgZ2V0RmlsZShmaWxlbmFtZSkge1xyXG4gICAgICAgIHRoaXMubWFrZUltYWdlKCk7XHJcbiAgICAgICAgZnMud3JpdGVGaWxlKGZpbGVuYW1lLCBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIHRoaXMuaW1hZ2UpLCBcImJpbmFyeVwiLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlIFwiICsgZmlsZW5hbWUgKyBcIiB3YXMgc2F2ZWQhXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRsZXIgMzIgYWxnb3JpdGhtLiBDYWxjdWxhdGUgaGFzaCBmb3IgYnl0ZXMuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGRhdGEgLSBpbnB1dCBieXRlcy5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gLSBhZGxlcjMyIGhhc2guXHJcbiAgICAgKi9cclxuICAgIGFkbGVyMzIoZGF0YSkge1xyXG5cclxuICAgICAgICBsZXQgQkFTRSA9IDY1NTIxLFxyXG4gICAgICAgICAgICBOTUFYID0gNTU1MixcclxuICAgICAgICAgICAgczEgPSAxLFxyXG4gICAgICAgICAgICBzMiA9IDAsXHJcbiAgICAgICAgICAgIG4gPSBOTUFYO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgczEgKz0gZGF0YVtpXTtcclxuICAgICAgICAgICAgczIgKz0gczE7XHJcbiAgICAgICAgICAgIGlmICgobiAtPSAxKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgczEgJT0gQkFTRTtcclxuICAgICAgICAgICAgICAgIHMyICU9IEJBU0U7XHJcbiAgICAgICAgICAgICAgICBuID0gTk1BWDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgczEgJT0gQkFTRTtcclxuICAgICAgICBzMiAlPSBCQVNFO1xyXG5cclxuICAgICAgICByZXR1cm4gKHMyIDw8IDE2KSB8IHMxO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIGNyYzMyKEN5Y2xpYyByZWR1bmRhbmN5IGNoZWNrKSBjaGVja3N1bSBmb3IgYnl0ZXMuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGRhdGEgLSBpbnB1dCBieXRlcy5cclxuICAgICAqIEBwYXJhbSBjcmMgLSBzdGFydCBjcmMgdmFsdWUsIGRlZmF1bHQgLSAxLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyBieXRlNCAtIGNyYzMyIGNoZWNrc3VtLlxyXG4gICAgICovXHJcbiAgICBjcmMzMihkYXRhLCBjcmMgPSAtMSkge1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cclxuICAgICAgICAgICAgY3JjID0gdGhpcy5jcmNUYWJsZVsoY3JjIF4gZGF0YVtpXSkgJiAweGZmXSBeIChjcmMgPj4+IDgpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNyYyA9IGNyYyBeIC0xO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5ieXRlNChjcmMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgaGV4IHN0cmluZyBmcm9tIGJ5dGVzLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBkYXRhIC0gaW5wdXQgYnl0ZXMuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHtCdWZmZXJ9IC0gaGV4IHN0cmluZy5cclxuICAgICAqL1xyXG4gICAgaGV4KGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEJ1ZmZlcihkYXRhLCBcImJpbmFyeVwiKS50b1N0cmluZyhcImhleFwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlIGJ5dGVzIGZyb20gaGV4IHN0cmluZy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIGlucHV0IGhleCBzdHJpbmcuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHtCdWZmZXJ9IC0gb3V0cHV0IGJ5dGVzIGluIEJ1ZmZlci5cclxuICAgICAqL1xyXG4gICAgZnJvbUhleChkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCdWZmZXIoZGF0YSwgXCJoZXhcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBiYXNlNjQgc3RyaW5nIGZyb20gYnl0ZXMuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGRhdGEgLSBpbnB1dCBieXRlcy5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge0J1ZmZlcn0gLSBiYXNlNjQgc3RyaW5nLlxyXG4gICAgICovXHJcbiAgICBiYXNlNjQoZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgQnVmZmVyKGRhdGEpLnRvU3RyaW5nKFwiYmFzZTY0XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgYnl0ZXMgZnJvbSBiYXNlNjQgc3RyaW5nLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBkYXRhIC0gaW5wdXQgYmFzZTY0IHN0cmluZy5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge0J1ZmZlcn0gLSBvdXRwdXQgYnl0ZXMgaW4gQnVmZmVyLlxyXG4gICAgICovXHJcbiAgICBmcm9tQmFzZTY0KGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20oZGF0YSwgXCJiYXNlNjRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gMiBieXRlcyB2YWx1ZSBmcm9tIGlucHV0LlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBkYXRhIC0gaW5wdXQgdmFsdWUuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIFVpbnQ4QXJyYXkgLSAyIGJ5dGVzLlxyXG4gICAgICovXHJcblxyXG4gICAgYnl0ZTIoZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgc2FmZVVpbnQ4QXJyYXkoWyhkYXRhID4+IDgpICYgMjU1LCBkYXRhICYgMjU1XSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiA0IGJ5dGVzIHZhbHVlIGZyb20gaW5wdXQuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGRhdGEgLSBpbnB1dCB2YWx1ZS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMgVWludDhBcnJheSAtIDQgYnl0ZXMuXHJcbiAgICAgKi9cclxuICAgIGJ5dGU0KGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gbmV3IHNhZmVVaW50OEFycmF5KFsoZGF0YSA+PiAyNCkgJiAyNTUsIChkYXRhID4+IDE2KSAmIDI1NSwgKGRhdGEgPj4gOCkgJiAyNTUsIGRhdGEgJiAyNTVdKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gMiBsc2IobGVhc3Qgc2lnbmlmaWNhbnQgYml0KSBieXRlcyB2YWx1ZSBmcm9tIGlucHV0LlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBkYXRhIC0gaW5wdXQgdmFsdWUuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIFVpbnQ4QXJyYXkgLSAyIGxzYiBieXRlcy5cclxuICAgICAqL1xyXG4gICAgYnl0ZTJsc2IoZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgc2FmZVVpbnQ4QXJyYXkoW2RhdGEgJiAyNTUsIChkYXRhID4+IDgpICYgMjU1XSk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEV4cG9ydCBQTkcgSW1hZ2UgQ2xhc3MuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBQbmdJbWFnZTsiXX0=
