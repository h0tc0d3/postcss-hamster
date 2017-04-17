"use strict";

exports.__esModule = true;

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
        var safeUint32Array = typeof Uint32Array !== "undefined" ? Uint32Array : Array;
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
     * @param {string} color - ruler line color. Support hex color like #454545, web safe hex like #333, rgb(255, 143, 15) - red,  green, blue, rgba(255, 143, 15, 0.6) - red,  green, blue, alpha(transparency).
     * @param {array} pattern - ruler line pattern array like [1, 0, 0, 0] - value = 1 - write color pixel, values = 0 write transparent pixel.
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
            if (i < patternHeight || i >= bottom) {
                pline = true;
            } else {
                pline = false;
            }

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
     * Support hex color like #454545, web safe hex like #333, rgb(255, 143, 15) - red,  green, blue, rgba(255, 143, 15, 0.6) - red,  green, blue, alpha(transparency).
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
        if (found = color.match(/\#([0-9a-zA-Z]{3, 6})/)) {
            var flen = found[1].length;
            if (flen == 6) {
                var _ref = [parseInt(found[1].substr(0, 2), 16), parseInt(found[1].substr(2, 2), 16), parseInt(found[1].substr(4, 2), 16)];
                red = _ref[0];
                green = _ref[1];
                blue = _ref[2];


                alpha = 255;
            } else if (flen.length == 3) {
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
            var _found$1$split = found[1].split(/\s*\,\s*/i);

            red = _found$1$split[0];
            green = _found$1$split[1];
            blue = _found$1$split[2];
            alpha = _found$1$split[3];

            alpha = alpha != null && alpha > 0 ? Math.round(alpha * 255) : 255;
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
            if ((n -= 1) == 0) {
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
     * @returns {number} - crc32 checksum.
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBuZ0ltYWdlLmVzNiJdLCJuYW1lcyI6WyJQbmdJbWFnZSIsImRlcHRoIiwiY29sb3J0eXBlIiwidHJhbnNwYXJlbnQiLCJpZW5kIiwic2FmZVVpbnQzMkFycmF5IiwiVWludDMyQXJyYXkiLCJBcnJheSIsImNyY1RhYmxlIiwiaWhkciIsImlkYXQiLCJtYXRyaXgiLCJpbWFnZSIsInNldElIRFIiLCJoZWlnaHQiLCJ3aWR0aCIsInNldCIsImJ5dGU0IiwidG1wIiwiaiIsImNyYzMyIiwicnVsZXJNYXRyaXgiLCJjb2xvciIsInBhdHRlcm4iLCJ0aGlja25lc3MiLCJzY2FsZSIsInBsZW4iLCJsZW5ndGgiLCJNYXRoIiwicm91bmQiLCJmaWx0ZXIiLCJwaXhlbGNvbG9yIiwicGFyc2VDb2xvciIsInBhdHRlcm5IZWlnaHQiLCJmbG9vciIsInBhdCIsInJlbWFpbmRlciIsImJvdHRvbSIsInBsaW5lIiwicG9zIiwiaSIsInBpbmRleCIsIm1ha2VJREFUIiwiZGVmbGF0ZVN5bmMiLCJCdWZmZXIiLCJsZXZlbCIsImJ1ZmZlciIsImJ5dGVPZmZzZXQiLCJieXRlTGVuZ3RoIiwiQllURVNfUEVSX0VMRU1FTlQiLCJtbGVuIiwidHNpemUiLCJtYWtlSW1hZ2UiLCJsaWhkciIsImxpZGF0IiwicmVkIiwiZ3JlZW4iLCJibHVlIiwiYWxwaGEiLCJmb3VuZCIsIm1hdGNoIiwiZmxlbiIsInBhcnNlSW50Iiwic3Vic3RyIiwicmMiLCJnYyIsImJjIiwic3BsaXQiLCJyZXQiLCJnZXRCYXNlNjQiLCJiYXNlNjQiLCJnZXRGaWxlIiwiZmlsZW5hbWUiLCJ3cml0ZUZpbGUiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJhcHBseSIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJhZGxlcjMyIiwiZGF0YSIsIkJBU0UiLCJOTUFYIiwiczEiLCJzMiIsIm4iLCJjcmMiLCJsZW4iLCJoZXgiLCJ0b1N0cmluZyIsImZyb21IZXgiLCJmcm9tQmFzZTY0IiwiZnJvbSIsImJ5dGUyIiwiYnl0ZTJsc2IiXSwibWFwcGluZ3MiOiI7Ozs7cWpCQUFBOzs7Ozs7Ozs7Ozs7QUFZQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztJQUVNQSxROztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQSx3QkFBc0M7QUFBQSxZQUExQkMsS0FBMEIsdUVBQWxCLENBQWtCO0FBQUEsWUFBZkMsU0FBZSx1RUFBSCxDQUFHOztBQUFBOztBQUNsQyxhQUFLRCxLQUFMLEdBQWFBLEtBQWI7QUFDQSxhQUFLQyxTQUFMLEdBQWlCQSxTQUFqQjtBQUNBLGFBQUtDLFdBQUwsR0FBbUIsNEJBQW1CLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQUFuQixDQUFuQixDQUhrQyxDQUdtQjtBQUNyRCxhQUFLQyxJQUFMLEdBQVksNEJBQW1CLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLEVBQWIsRUFBaUIsRUFBakIsRUFBcUIsRUFBckIsRUFBeUIsRUFBekIsRUFBNkIsR0FBN0IsRUFBa0MsRUFBbEMsRUFBc0MsRUFBdEMsRUFBMEMsR0FBMUMsQ0FBbkIsQ0FBWixDQUprQyxDQUk4QztBQUNoRixZQUFJQyxrQkFBa0IsT0FBT0MsV0FBUCxLQUF1QixXQUF2QixHQUFxQ0EsV0FBckMsR0FBbURDLEtBQXpFO0FBQ0E7QUFDQTtBQUNBLGFBQUtDLFFBQUwsR0FBZ0IsSUFBSUgsZUFBSixDQUFvQixDQUNoQyxDQURnQyxFQUM3QixVQUQ2QixFQUNqQixDQUFDLFNBRGdCLEVBQ0wsQ0FBQyxVQURJLEVBQ1EsU0FEUixFQUVoQyxVQUZnQyxFQUVwQixDQUFDLFNBRm1CLEVBRVIsQ0FBQyxVQUZPLEVBRUssU0FGTCxFQUVnQixVQUZoQixFQUdoQyxDQUFDLFNBSCtCLEVBR3BCLENBQUMsVUFIbUIsRUFHUCxTQUhPLEVBR0ksVUFISixFQUdnQixDQUFDLFNBSGpCLEVBSWhDLENBQUMsVUFKK0IsRUFJbkIsU0FKbUIsRUFJUixVQUpRLEVBSUksQ0FBQyxTQUpMLEVBSWdCLENBQUMsVUFKakIsRUFLaEMsU0FMZ0MsRUFLckIsVUFMcUIsRUFLVCxDQUFDLFNBTFEsRUFLRyxDQUFDLFVBTEosRUFLZ0IsU0FMaEIsRUFNaEMsVUFOZ0MsRUFNcEIsQ0FBQyxRQU5tQixFQU1ULENBQUMsVUFOUSxFQU1JLFNBTkosRUFNZSxVQU5mLEVBT2hDLENBQUMsUUFQK0IsRUFPckIsQ0FBQyxVQVBvQixFQU9SLFNBUFEsRUFPRyxVQVBILEVBT2UsQ0FBQyxTQVBoQixFQVFoQyxDQUFDLFVBUitCLEVBUW5CLFVBUm1CLEVBUVAsVUFSTyxFQVFLLENBQUMsU0FSTixFQVFpQixDQUFDLFVBUmxCLEVBU2hDLFNBVGdDLEVBU3JCLFVBVHFCLEVBU1QsQ0FBQyxTQVRRLEVBU0csQ0FBQyxVQVRKLEVBU2dCLFNBVGhCLEVBVWhDLFVBVmdDLEVBVXBCLENBQUMsU0FWbUIsRUFVUixDQUFDLFVBVk8sRUFVSyxTQVZMLEVBVWdCLFVBVmhCLEVBV2hDLENBQUMsU0FYK0IsRUFXcEIsQ0FBQyxVQVhtQixFQVdQLFNBWE8sRUFXSSxVQVhKLEVBV2dCLENBQUMsU0FYakIsRUFZaEMsQ0FBQyxVQVorQixFQVluQixTQVptQixFQVlSLFVBWlEsRUFZSSxDQUFDLFNBWkwsRUFZZ0IsQ0FBQyxVQVpqQixFQWFoQyxTQWJnQyxFQWFyQixVQWJxQixFQWFULENBQUMsVUFiUSxFQWFJLENBQUMsVUFiTCxFQWFpQixVQWJqQixFQWNoQyxRQWRnQyxFQWN0QixDQUFDLFVBZHFCLEVBY1QsQ0FBQyxTQWRRLEVBY0csVUFkSCxFQWNlLFNBZGYsRUFlaEMsQ0FBQyxVQWYrQixFQWVuQixDQUFDLFNBZmtCLEVBZVAsVUFmTyxFQWVLLFNBZkwsRUFlZ0IsQ0FBQyxVQWZqQixFQWdCaEMsQ0FBQyxTQWhCK0IsRUFnQnBCLFVBaEJvQixFQWdCUixTQWhCUSxFQWdCRyxDQUFDLFVBaEJKLEVBZ0JnQixDQUFDLFNBaEJqQixFQWlCaEMsVUFqQmdDLEVBaUJwQixTQWpCb0IsRUFpQlQsQ0FBQyxVQWpCUSxFQWlCSSxDQUFDLFNBakJMLEVBaUJnQixVQWpCaEIsRUFrQmhDLFNBbEJnQyxFQWtCckIsQ0FBQyxVQWxCb0IsRUFrQlIsQ0FBQyxTQWxCTyxFQWtCSSxVQWxCSixFQWtCZ0IsU0FsQmhCLEVBbUJoQyxDQUFDLFVBbkIrQixFQW1CbkIsQ0FBQyxRQW5Ca0IsRUFtQlIsVUFuQlEsRUFtQkksU0FuQkosRUFtQmUsQ0FBQyxVQW5CaEIsRUFvQmhDLENBQUMsUUFwQitCLEVBb0JyQixVQXBCcUIsRUFvQlQsU0FwQlMsRUFvQkUsQ0FBQyxVQXBCSCxFQW9CZSxDQUFDLFNBcEJoQixFQXFCaEMsVUFyQmdDLEVBcUJwQixVQXJCb0IsRUFxQlIsQ0FBQyxVQXJCTyxFQXFCSyxDQUFDLFNBckJOLEVBcUJpQixVQXJCakIsRUFzQmhDLFNBdEJnQyxFQXNCckIsQ0FBQyxVQXRCb0IsRUFzQlIsQ0FBQyxTQXRCTyxFQXNCSSxVQXRCSixFQXNCZ0IsU0F0QmhCLEVBdUJoQyxDQUFDLFVBdkIrQixFQXVCbkIsQ0FBQyxTQXZCa0IsRUF1QlAsVUF2Qk8sRUF1QkssU0F2QkwsRUF1QmdCLENBQUMsVUF2QmpCLEVBd0JoQyxDQUFDLFNBeEIrQixFQXdCcEIsVUF4Qm9CLEVBd0JSLFNBeEJRLEVBd0JHLENBQUMsVUF4QkosRUF3QmdCLENBQUMsU0F4QmpCLEVBeUJoQyxVQXpCZ0MsRUF5QnBCLFNBekJvQixFQXlCVCxDQUFDLFVBekJRLEVBeUJJLENBQUMsU0F6QkwsRUF5QmdCLFVBekJoQixFQTBCaEMsU0ExQmdDLEVBMEJyQixDQUFDLFVBMUJvQixFQTBCUixDQUFDLFVBMUJPLEVBMEJLLENBQUMsU0ExQk4sRUEwQmlCLENBQUMsVUExQmxCLEVBMkJoQyxRQTNCZ0MsRUEyQnRCLFVBM0JzQixFQTJCVixDQUFDLFNBM0JTLEVBMkJFLENBQUMsVUEzQkgsRUEyQmUsUUEzQmYsRUE0QmhDLFVBNUJnQyxFQTRCcEIsQ0FBQyxTQTVCbUIsRUE0QlIsQ0FBQyxVQTVCTyxFQTRCSyxTQTVCTCxFQTRCZ0IsVUE1QmhCLEVBNkJoQyxDQUFDLFNBN0IrQixFQTZCcEIsQ0FBQyxVQTdCbUIsRUE2QlAsU0E3Qk8sRUE2QkksVUE3QkosRUE2QmdCLENBQUMsU0E3QmpCLEVBOEJoQyxDQUFDLFVBOUIrQixFQThCbkIsU0E5Qm1CLEVBOEJSLFVBOUJRLEVBOEJJLENBQUMsU0E5QkwsRUE4QmdCLENBQUMsVUE5QmpCLEVBK0JoQyxTQS9CZ0MsRUErQnJCLFVBL0JxQixFQStCVCxDQUFDLFFBL0JRLEVBK0JFLENBQUMsVUEvQkgsRUErQmUsU0EvQmYsRUFnQ2hDLFVBaENnQyxFQWdDcEIsQ0FBQyxTQWhDbUIsRUFnQ1IsQ0FBQyxVQWhDTyxFQWdDSyxTQWhDTCxFQWdDZ0IsVUFoQ2hCLEVBaUNoQyxDQUFDLFNBakMrQixFQWlDcEIsQ0FBQyxVQWpDbUIsRUFpQ1AsU0FqQ08sRUFpQ0ksVUFqQ0osRUFpQ2dCLENBQUMsU0FqQ2pCLEVBa0NoQyxDQUFDLFVBbEMrQixFQWtDbkIsVUFsQ21CLEVBa0NQLFVBbENPLEVBa0NLLENBQUMsU0FsQ04sRUFrQ2lCLENBQUMsVUFsQ2xCLEVBbUNoQyxTQW5DZ0MsRUFtQ3JCLFVBbkNxQixFQW1DVCxDQUFDLFNBbkNRLEVBbUNHLENBQUMsVUFuQ0osRUFtQ2dCLFNBbkNoQixFQW9DaEMsVUFwQ2dDLEVBb0NwQixDQUFDLFNBcENtQixFQW9DUixDQUFDLFVBcENPLEVBb0NLLFNBcENMLEVBb0NnQixVQXBDaEIsRUFxQ2hDLENBQUMsU0FyQytCLEVBcUNwQixDQUFDLFVBckNtQixFQXFDUCxTQXJDTyxFQXFDSSxVQXJDSixFQXFDZ0IsQ0FBQyxTQXJDakIsRUFzQ2hDLENBQUMsVUF0QytCLEVBc0NuQixTQXRDbUIsRUFzQ1IsVUF0Q1EsRUFzQ0ksQ0FBQyxVQXRDTCxFQXNDaUIsQ0FBQyxVQXRDbEIsRUF1Q2hDLFNBdkNnQyxFQXVDckIsVUF2Q3FCLEVBdUNULENBQUMsVUF2Q1EsRUF1Q0ksQ0FBQyxTQXZDTCxFQXVDZ0IsVUF2Q2hCLEVBd0NoQyxRQXhDZ0MsRUF3Q3RCLENBQUMsVUF4Q3FCLEVBd0NULENBQUMsU0F4Q1EsRUF3Q0csVUF4Q0gsRUF3Q2UsUUF4Q2YsRUF5Q2hDLENBQUMsVUF6QytCLEVBeUNuQixDQUFDLFNBekNrQixFQXlDUCxVQXpDTyxFQXlDSyxTQXpDTCxFQXlDZ0IsQ0FBQyxVQXpDakIsRUEwQ2hDLENBQUMsU0ExQytCLEVBMENwQixVQTFDb0IsRUEwQ1IsU0ExQ1EsRUEwQ0csQ0FBQyxVQTFDSixFQTBDZ0IsQ0FBQyxTQTFDakIsRUEyQ2hDLFVBM0NnQyxFQTJDcEIsU0EzQ29CLEVBMkNULENBQUMsVUEzQ1EsRUEyQ0ksQ0FBQyxTQTNDTCxFQTJDZ0IsVUEzQ2hCLEVBNENoQyxTQTVDZ0MsRUE0Q3JCLENBQUMsVUE1Q29CLEVBNENSLENBQUMsUUE1Q08sRUE0Q0csVUE1Q0gsRUE0Q2UsU0E1Q2YsRUE2Q2hDLENBQUMsVUE3QytCLEVBNkNuQixDQUFDLFNBN0NrQixFQTZDUCxVQTdDTyxFQTZDSyxTQTdDTCxFQTZDZ0IsQ0FBQyxVQTdDakIsRUE4Q2hDLENBQUMsU0E5QytCLEVBOENwQixVQTlDb0IsRUE4Q1IsU0E5Q1EsRUE4Q0csQ0FBQyxVQTlDSixFQThDZ0IsQ0FBQyxTQTlDakIsRUErQ2hDLFVBL0NnQyxFQStDcEIsVUEvQ29CLEVBK0NSLENBQUMsVUEvQ08sRUErQ0ssQ0FBQyxTQS9DTixFQStDaUIsVUEvQ2pCLEVBZ0RoQyxTQWhEZ0MsRUFnRHJCLENBQUMsVUFoRG9CLEVBZ0RSLENBQUMsU0FoRE8sRUFnREksVUFoREosRUFnRGdCLFNBaERoQixFQWlEaEMsQ0FBQyxVQWpEK0IsRUFpRG5CLENBQUMsU0FqRGtCLEVBaURQLFVBakRPLEVBaURLLFNBakRMLEVBaURnQixDQUFDLFVBakRqQixFQWtEaEMsQ0FBQyxTQWxEK0IsRUFrRHBCLFVBbERvQixFQWtEUixTQWxEUSxFQWtERyxDQUFDLFVBbERKLEVBa0RnQixDQUFDLFVBbERqQixFQW1EaEMsVUFuRGdDLEVBbURwQixTQW5Eb0IsRUFtRFQsQ0FBQyxVQW5EUSxFQW1ESSxDQUFDLFVBbkRMLEVBbURpQixVQW5EakIsRUFtRDZCLFNBbkQ3QixDQUFwQixDQUFoQjtBQW9EQSxhQUFLSSxJQUFMLEdBQVksSUFBWjtBQUNBLGFBQUtDLElBQUwsR0FBWSxJQUFaO0FBQ0EsYUFBS0MsTUFBTCxHQUFjLElBQWQ7QUFDQSxhQUFLQyxLQUFMLEdBQWEsSUFBYjtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDUDs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1QkFvQkFDLE8sc0JBQStCO0FBQUEsWUFBdkJDLE1BQXVCLHVFQUFkLENBQWM7QUFBQSxZQUFYQyxLQUFXLHVFQUFILENBQUc7OztBQUUzQixhQUFLRCxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxhQUFLQyxLQUFMLEdBQWFBLEtBQWI7QUFDQTtBQUNBLGFBQUtOLElBQUwsR0FBWSw0QkFBbUIsRUFBbkIsQ0FBWjtBQUNBLGFBQUtBLElBQUwsQ0FBVU8sR0FBVixDQUFjLEtBQUtDLEtBQUwsQ0FBVyxFQUFYLENBQWQsRUFBOEIsQ0FBOUI7QUFDQSxhQUFLUixJQUFMLENBQVVPLEdBQVYsQ0FBYyxDQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLEVBQWIsQ0FBZCxFQUFnQyxDQUFoQztBQUNBLGFBQUtQLElBQUwsQ0FBVU8sR0FBVixDQUFjLEtBQUtDLEtBQUwsQ0FBVyxLQUFLRixLQUFoQixDQUFkLEVBQXNDLENBQXRDO0FBQ0EsYUFBS04sSUFBTCxDQUFVTyxHQUFWLENBQWMsS0FBS0MsS0FBTCxDQUFXLEtBQUtILE1BQWhCLENBQWQsRUFBdUMsRUFBdkM7QUFDQSxhQUFLTCxJQUFMLENBQVVPLEdBQVYsQ0FBYyxDQUFDLEtBQUtmLEtBQU4sRUFBYSxLQUFLQyxTQUFsQixFQUE2QixDQUE3QixFQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxDQUFkLEVBQXFELEVBQXJEOztBQUVBLFlBQUlnQixNQUFNLDRCQUFtQixFQUFuQixDQUFWO0FBQ0EsYUFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUksRUFBcEIsRUFBd0JBLEdBQXhCLEVBQTZCO0FBQ3pCRCxnQkFBSUMsQ0FBSixJQUFTLEtBQUtWLElBQUwsQ0FBVVUsSUFBSSxDQUFkLENBQVQ7QUFDSDtBQUNELGFBQUtWLElBQUwsQ0FBVU8sR0FBVixDQUFjLEtBQUtJLEtBQUwsQ0FBV0YsR0FBWCxDQUFkLEVBQStCLEVBQS9CO0FBQ0gsSzs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBcUJBRyxXLHdCQUFZUCxNLEVBQVFRLEssRUFBT0MsTyxFQUFtQztBQUFBLFlBQTFCQyxTQUEwQix1RUFBZCxDQUFjO0FBQUEsWUFBWEMsS0FBVyx1RUFBSCxDQUFHOzs7QUFFMUQsWUFBSUMsT0FBT0gsUUFBUUksTUFBbkI7O0FBRUEsYUFBS2QsT0FBTCxDQUFhZSxLQUFLQyxLQUFMLENBQVdmLFNBQVNXLEtBQXBCLENBQWIsRUFBeUNHLEtBQUtDLEtBQUwsQ0FBV0gsT0FBT0QsS0FBbEIsQ0FBekM7O0FBRUE7QUFDQUQsb0JBQVlBLFlBQVlDLEtBQXhCO0FBQ0E7QUFDQSxZQUFJSyxTQUFTLDRCQUFtQixDQUFDLENBQUQsQ0FBbkIsQ0FBYjs7QUFFQSxhQUFLQyxVQUFMLEdBQWtCLEtBQUtDLFVBQUwsQ0FBZ0JWLEtBQWhCLENBQWxCO0FBQ0EsWUFBSVcsZ0JBQWdCTCxLQUFLTSxLQUFMLENBQVdWLFlBQVksQ0FBdkIsQ0FBcEI7QUFDQSxZQUFJVyxNQUFNLDRCQUFtQlosT0FBbkIsQ0FBVjtBQUNBLFlBQUlhLFlBQVlaLFlBQVksQ0FBNUI7O0FBRUEsWUFBSWEsU0FBUyxLQUFLdkIsTUFBTCxHQUFjbUIsYUFBZCxHQUE4QkcsU0FBM0M7O0FBRUE7QUFDQSxhQUFLekIsTUFBTCxHQUFjLDRCQUFtQixLQUFLRyxNQUFMLEdBQWMsS0FBS0MsS0FBbkIsR0FBMkIsQ0FBM0IsR0FBK0IsS0FBS0QsTUFBdkQsQ0FBZDs7QUFFQSxZQUFJd0IsUUFBUSxLQUFaOztBQUVBO0FBQ0EsWUFBSUMsTUFBTSxDQUFWO0FBQ0EsYUFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUksS0FBSzFCLE1BQXpCLEVBQWlDMEIsR0FBakMsRUFBc0M7O0FBRWxDO0FBQ0EsaUJBQUs3QixNQUFMLENBQVlLLEdBQVosQ0FBZ0JjLE1BQWhCLEVBQXdCUyxHQUF4QjtBQUNBQTs7QUFFQTtBQUNBLGdCQUFJQyxJQUFJUCxhQUFKLElBQXFCTyxLQUFLSCxNQUE5QixFQUFzQztBQUNsQ0Msd0JBQVEsSUFBUjtBQUNILGFBRkQsTUFFTztBQUNIQSx3QkFBUSxLQUFSO0FBQ0g7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGlCQUFLLElBQUluQixJQUFJLENBQWIsRUFBZ0JBLElBQUksS0FBS0osS0FBekIsRUFBZ0NJLEdBQWhDLEVBQXFDO0FBQ2pDLG9CQUFJbUIsS0FBSixFQUFXO0FBQ1Asd0JBQUlHLFNBQVNiLEtBQUtNLEtBQUwsQ0FBV2YsSUFBSU0sS0FBZixJQUF3QkMsSUFBckM7QUFDQSx3QkFBSVMsSUFBSU0sTUFBSixNQUFnQixDQUFwQixFQUF1QjtBQUNuQiw2QkFBSzlCLE1BQUwsQ0FBWUssR0FBWixDQUFnQixLQUFLZSxVQUFyQixFQUFpQ1EsR0FBakM7QUFDSCxxQkFGRCxNQUVPO0FBQ0gsNkJBQUs1QixNQUFMLENBQVlLLEdBQVosQ0FBZ0IsS0FBS2IsV0FBckIsRUFBa0NvQyxHQUFsQztBQUNIO0FBQ0osaUJBUEQsTUFPTztBQUNILHlCQUFLNUIsTUFBTCxDQUFZSyxHQUFaLENBQWdCLEtBQUtiLFdBQXJCLEVBQWtDb0MsR0FBbEM7QUFDSDs7QUFFREEsdUJBQU8sQ0FBUDtBQUNIO0FBQ0o7QUFDRDtBQUNBLGFBQUtHLFFBQUw7QUFDSCxLOztBQUVEOzs7Ozs7Ozs7O0FBWUE7Ozs7Ozt1QkFNQUEsUSx1QkFBVztBQUNQLFlBQUksS0FBSy9CLE1BQVQsRUFBaUI7QUFDYixnQkFBSUEsU0FBUyxlQUFLZ0MsV0FBTCxDQUFpQixJQUFJQyxNQUFKLENBQVcsS0FBS2pDLE1BQWhCLENBQWpCLEVBQTBDO0FBQ25Ea0MsdUJBQU87QUFENEMsYUFBMUMsQ0FBYjtBQUdBbEMscUJBQVMsNEJBQW1CQSxPQUFPbUMsTUFBMUIsRUFBa0NuQyxPQUFPb0MsVUFBekMsRUFBcURwQyxPQUFPcUMsVUFBUCxHQUFvQix3QkFBZUMsaUJBQXhGLENBQVQ7QUFDQTtBQUNBLGdCQUFJQyxPQUFPdkMsT0FBT2dCLE1BQWxCO0FBQ0EsaUJBQUtqQixJQUFMLEdBQVksNEJBQW1Cd0MsT0FBTyxFQUExQixDQUFaO0FBQ0EsaUJBQUt4QyxJQUFMLENBQVVNLEdBQVYsQ0FBYyxLQUFLQyxLQUFMLENBQVdpQyxJQUFYLENBQWQsRUFBZ0MsQ0FBaEM7QUFDQSxpQkFBS3hDLElBQUwsQ0FBVU0sR0FBVixDQUFjLENBQUMsRUFBRCxFQUFLLEVBQUwsRUFBUyxFQUFULEVBQWEsRUFBYixDQUFkLEVBQWdDLENBQWhDO0FBQ0EsaUJBQUtOLElBQUwsQ0FBVU0sR0FBVixDQUFjTCxNQUFkLEVBQXNCLENBQXRCO0FBQ0EsZ0JBQUl3QyxRQUFRRCxPQUFPLENBQW5CO0FBQ0EsZ0JBQUloQyxNQUFNLDRCQUFtQmlDLEtBQW5CLENBQVY7QUFDQSxpQkFBSyxJQUFJaEMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJZ0MsS0FBcEIsRUFBMkJoQyxHQUEzQixFQUFnQztBQUM1QkQsb0JBQUlDLENBQUosSUFBUyxLQUFLVCxJQUFMLENBQVVTLElBQUksQ0FBZCxDQUFUO0FBQ0g7QUFDRCxpQkFBS1QsSUFBTCxDQUFVTSxHQUFWLENBQWMsS0FBS0ksS0FBTCxDQUFXRixHQUFYLENBQWQsRUFBK0JnQyxPQUFPLENBQXRDO0FBQ0g7QUFFSixLOztBQUVEOzs7Ozs7Ozt1QkFNQUUsUyx3QkFBWTtBQUNSO0FBQ0E7QUFDQSxZQUFJQyxRQUFRLEtBQUs1QyxJQUFMLENBQVVrQixNQUF0QjtBQUNBLFlBQUkyQixRQUFRLEtBQUs1QyxJQUFMLENBQVVpQixNQUF0QjtBQUNBLGFBQUtmLEtBQUwsR0FBYSw0QkFBbUJ5QyxRQUFRQyxLQUFSLEdBQWdCLEVBQW5DLENBQWI7QUFDQSxhQUFLMUMsS0FBTCxDQUFXSSxHQUFYLENBQWUsQ0FBQyxHQUFELEVBQU0sRUFBTixFQUFVLEVBQVYsRUFBYyxFQUFkLEVBQWtCLEVBQWxCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCLEVBQTlCLENBQWYsRUFBa0QsQ0FBbEQ7QUFDQSxhQUFLSixLQUFMLENBQVdJLEdBQVgsQ0FBZSxLQUFLUCxJQUFwQixFQUEwQixDQUExQjtBQUNBLGFBQUtHLEtBQUwsQ0FBV0ksR0FBWCxDQUFlLEtBQUtOLElBQXBCLEVBQTBCMkMsUUFBUSxDQUFsQztBQUNBLGFBQUt6QyxLQUFMLENBQVdJLEdBQVgsQ0FBZSxLQUFLWixJQUFwQixFQUEwQmlELFFBQVFDLEtBQVIsR0FBZ0IsQ0FBMUM7QUFDSCxLOztBQUVEOzs7Ozs7Ozs7Ozs7dUJBVUF0QixVLHVCQUFXVixLLEVBQU87O0FBRWQ7QUFGYyxZQUdUaUMsR0FIUyxHQUdtQixDQUhuQjtBQUFBLFlBR0pDLEtBSEksR0FHc0IsQ0FIdEI7QUFBQSxZQUdHQyxJQUhILEdBR3lCLENBSHpCO0FBQUEsWUFHU0MsS0FIVCxHQUc0QixDQUg1Qjs7QUFJZCxZQUFJQyxjQUFKO0FBQ0E7QUFDQSxZQUFLQSxRQUFRckMsTUFBTXNDLEtBQU4sQ0FBWSx1QkFBWixDQUFiLEVBQW9EO0FBQ2hELGdCQUFJQyxPQUFPRixNQUFNLENBQU4sRUFBU2hDLE1BQXBCO0FBQ0EsZ0JBQUlrQyxRQUFRLENBQVosRUFBZTtBQUFBLDJCQUVVLENBQ2pCQyxTQUFTSCxNQUFNLENBQU4sRUFBU0ksTUFBVCxDQUFnQixDQUFoQixFQUFtQixDQUFuQixDQUFULEVBQWdDLEVBQWhDLENBRGlCLEVBRWpCRCxTQUFTSCxNQUFNLENBQU4sRUFBU0ksTUFBVCxDQUFnQixDQUFoQixFQUFtQixDQUFuQixDQUFULEVBQWdDLEVBQWhDLENBRmlCLEVBR2pCRCxTQUFTSCxNQUFNLENBQU4sRUFBU0ksTUFBVCxDQUFnQixDQUFoQixFQUFtQixDQUFuQixDQUFULEVBQWdDLEVBQWhDLENBSGlCLENBRlY7QUFFVlIsbUJBRlU7QUFFTEMscUJBRks7QUFFRUMsb0JBRkY7OztBQVFYQyx3QkFBUSxHQUFSO0FBQ0gsYUFURCxNQVNPLElBQUlHLEtBQUtsQyxNQUFMLElBQWUsQ0FBbkIsRUFBc0I7QUFDekI7QUFDQSxvQkFBSXFDLEtBQUtMLE1BQU0sQ0FBTixFQUFTSSxNQUFULENBQWdCLENBQWhCLEVBQW1CLENBQW5CLENBQVQ7QUFDQSxvQkFBSUUsS0FBS04sTUFBTSxDQUFOLEVBQVNJLE1BQVQsQ0FBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkIsQ0FBVDtBQUNBLG9CQUFJRyxLQUFLUCxNQUFNLENBQU4sRUFBU0ksTUFBVCxDQUFnQixDQUFoQixFQUFtQixDQUFuQixDQUFUOztBQUVBQyxxQkFBS0EsS0FBS0EsRUFBVjtBQUNBQyxxQkFBS0EsS0FBS0EsRUFBVjtBQUNBQyxxQkFBS0EsS0FBS0EsRUFBVjs7QUFSeUIsNEJBVUosQ0FDakJKLFNBQVNFLEVBQVQsRUFBYSxFQUFiLENBRGlCLEVBRWpCRixTQUFTRyxFQUFULEVBQWEsRUFBYixDQUZpQixFQUdqQkgsU0FBU0ksRUFBVCxFQUFhLEVBQWIsQ0FIaUIsQ0FWSTtBQVV4QlgsbUJBVndCO0FBVW5CQyxxQkFWbUI7QUFVWkMsb0JBVlk7OztBQWdCekJDLHdCQUFRLEdBQVI7QUFDSDs7QUFFRDtBQUNILFNBL0JELE1BK0JPLElBQUtDLFFBQVFyQyxNQUFNc0MsS0FBTixDQUFZLGdCQUFaLENBQWIsRUFBNkM7QUFBQSxpQ0FFcEJELE1BQU0sQ0FBTixFQUFTUSxLQUFULENBQWUsV0FBZixDQUZvQjs7QUFFL0NaLGVBRitDO0FBRTFDQyxpQkFGMEM7QUFFbkNDLGdCQUZtQztBQUU3QkMsaUJBRjZCOztBQUdoREEsb0JBQVNBLFNBQVMsSUFBVCxJQUFpQkEsUUFBUSxDQUExQixHQUErQjlCLEtBQUtDLEtBQUwsQ0FBVzZCLFFBQVEsR0FBbkIsQ0FBL0IsR0FBeUQsR0FBakU7QUFFSDs7QUFFRCxlQUFPLEtBQUtwQyxLQUFMLENBQVdpQyxHQUFYLEVBQWdCQyxLQUFoQixFQUF1QkMsSUFBdkIsRUFBNkJDLEtBQTdCLENBQVA7QUFDSCxLOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7O3VCQWNBcEMsSyxrQkFBTWlDLEcsRUFBS0MsSyxFQUFPQyxJLEVBQU1DLEssRUFBTztBQUMzQixZQUFJVSxNQUFNLDRCQUFtQixDQUFuQixDQUFWO0FBQ0FBLFlBQUksQ0FBSixJQUFVYixPQUFPQSxPQUFPLENBQWQsSUFBbUJBLE9BQU8sR0FBM0IsR0FBa0NBLEdBQWxDLEdBQXdDLEdBQWpEO0FBQ0FhLFlBQUksQ0FBSixJQUFVWixTQUFTQSxTQUFTLENBQWxCLElBQXVCQSxTQUFTLEdBQWpDLEdBQXdDQSxLQUF4QyxHQUFnRCxHQUF6RDtBQUNBWSxZQUFJLENBQUosSUFBVVgsUUFBUUEsUUFBUSxDQUFoQixJQUFxQkEsUUFBUSxHQUE5QixHQUFxQ0EsSUFBckMsR0FBNEMsR0FBckQ7QUFDQVcsWUFBSSxDQUFKLElBQVVWLFNBQVNBLFNBQVMsQ0FBbEIsSUFBdUJBLFNBQVMsR0FBakMsR0FBd0NBLEtBQXhDLEdBQWdELEdBQXpEO0FBQ0EsZUFBT1UsR0FBUDtBQUNILEs7O0FBRUQ7Ozs7Ozs7Ozt1QkFPQUMsUyx3QkFBWTtBQUNSLGFBQUtqQixTQUFMO0FBQ0EsZUFBTyxLQUFLa0IsTUFBTCxDQUFZLEtBQUsxRCxLQUFqQixDQUFQO0FBQ0gsSzs7QUFFRDs7Ozs7Ozs7O3VCQU9BMkQsTyxvQkFBUUMsUSxFQUFVO0FBQ2QsYUFBS3BCLFNBQUw7QUFDQSxxQkFBR3FCLFNBQUgsQ0FBYUQsUUFBYixFQUF1QkUsT0FBT0MsWUFBUCxDQUFvQkMsS0FBcEIsQ0FBMEIsSUFBMUIsRUFBZ0MsS0FBS2hFLEtBQXJDLENBQXZCLEVBQW9FLFFBQXBFLEVBQThFLFVBQUNpRSxHQUFELEVBQVM7QUFDbkYsZ0JBQUlBLEdBQUosRUFBUztBQUNMLHVCQUFPQyxRQUFRQyxHQUFSLENBQVlGLEdBQVosQ0FBUDtBQUNIO0FBQ0RDLG9CQUFRQyxHQUFSLENBQVksU0FBU1AsUUFBVCxHQUFvQixhQUFoQztBQUNILFNBTEQ7QUFNSCxLOztBQUVEOzs7Ozs7Ozs7Ozt1QkFTQVEsTyxvQkFBUUMsSSxFQUFNOztBQUVWLFlBQUlDLE9BQU8sS0FBWDtBQUFBLFlBQ0lDLE9BQU8sSUFEWDtBQUFBLFlBRUlDLEtBQUssQ0FGVDtBQUFBLFlBR0lDLEtBQUssQ0FIVDtBQUFBLFlBSUlDLElBQUlILElBSlI7O0FBTUEsYUFBSyxJQUFJM0MsSUFBSSxDQUFiLEVBQWdCQSxJQUFJeUMsS0FBS3RELE1BQXpCLEVBQWlDYSxHQUFqQyxFQUFzQztBQUNsQzRDLGtCQUFNSCxLQUFLekMsQ0FBTCxDQUFOO0FBQ0E2QyxrQkFBTUQsRUFBTjtBQUNBLGdCQUFJLENBQUNFLEtBQUssQ0FBTixLQUFZLENBQWhCLEVBQW1CO0FBQ2ZGLHNCQUFNRixJQUFOO0FBQ0FHLHNCQUFNSCxJQUFOO0FBQ0FJLG9CQUFJSCxJQUFKO0FBQ0g7QUFDSjs7QUFFREMsY0FBTUYsSUFBTjtBQUNBRyxjQUFNSCxJQUFOOztBQUVBLGVBQVFHLE1BQU0sRUFBUCxHQUFhRCxFQUFwQjtBQUNILEs7O0FBRUQ7Ozs7Ozs7Ozs7Ozt1QkFVQWhFLEssa0JBQU02RCxJLEVBQWdCO0FBQUEsWUFBVk0sR0FBVSx1RUFBSixDQUFDLENBQUc7OztBQUVsQixhQUFLLElBQUkvQyxJQUFJLENBQVIsRUFBV2dELE1BQU1QLEtBQUt0RCxNQUEzQixFQUFtQ2EsSUFBSWdELEdBQXZDLEVBQTRDaEQsR0FBNUMsRUFBaUQ7O0FBRTdDK0Msa0JBQU0sS0FBSy9FLFFBQUwsQ0FBYyxDQUFDK0UsTUFBTU4sS0FBS3pDLENBQUwsQ0FBUCxJQUFrQixJQUFoQyxJQUF5QytDLFFBQVEsQ0FBdkQ7QUFFSDs7QUFFREEsY0FBTUEsTUFBTSxDQUFDLENBQWI7O0FBRUEsZUFBTyxLQUFLdEUsS0FBTCxDQUFXc0UsR0FBWCxDQUFQO0FBQ0gsSzs7QUFFRDs7Ozs7Ozs7Ozs7dUJBU0FFLEcsZ0JBQUlSLEksRUFBTTtBQUNOLGVBQU8sSUFBSXJDLE1BQUosQ0FBV3FDLElBQVgsRUFBaUIsUUFBakIsRUFBMkJTLFFBQTNCLENBQW9DLEtBQXBDLENBQVA7QUFDSCxLOztBQUVEOzs7Ozs7Ozs7Ozt1QkFTQUMsTyxvQkFBUVYsSSxFQUFNO0FBQ1YsZUFBTyxJQUFJckMsTUFBSixDQUFXcUMsSUFBWCxFQUFpQixLQUFqQixDQUFQO0FBQ0gsSzs7QUFFRDs7Ozs7Ozs7Ozs7dUJBU0FYLE0sbUJBQU9XLEksRUFBTTtBQUNULGVBQU8sSUFBSXJDLE1BQUosQ0FBV3FDLElBQVgsRUFBaUJTLFFBQWpCLENBQTBCLFFBQTFCLENBQVA7QUFDSCxLOztBQUVEOzs7Ozs7Ozs7Ozt1QkFTQUUsVSx1QkFBV1gsSSxFQUFNO0FBQ2IsZUFBT3JDLE9BQU9pRCxJQUFQLENBQVlaLElBQVosRUFBa0IsUUFBbEIsQ0FBUDtBQUNILEs7O0FBRUQ7Ozs7Ozs7Ozs7dUJBVUFhLEssa0JBQU1iLEksRUFBTTtBQUNSLGVBQU8sNEJBQW1CLENBQUVBLFFBQVEsQ0FBVCxHQUFjLEdBQWYsRUFBb0JBLE9BQU8sR0FBM0IsQ0FBbkIsQ0FBUDtBQUNILEs7QUFDRDs7Ozs7Ozs7Ozs7dUJBU0FoRSxLLGtCQUFNZ0UsSSxFQUFNO0FBQ1IsZUFBTyw0QkFBbUIsQ0FBRUEsUUFBUSxFQUFULEdBQWUsR0FBaEIsRUFBc0JBLFFBQVEsRUFBVCxHQUFlLEdBQXBDLEVBQTBDQSxRQUFRLENBQVQsR0FBYyxHQUF2RCxFQUE0REEsT0FBTyxHQUFuRSxDQUFuQixDQUFQO0FBQ0gsSzs7QUFFRDs7Ozs7Ozs7Ozs7dUJBU0FjLFEscUJBQVNkLEksRUFBTTtBQUNYLGVBQU8sNEJBQW1CLENBQUNBLE9BQU8sR0FBUixFQUFjQSxRQUFRLENBQVQsR0FBYyxHQUEzQixDQUFuQixDQUFQO0FBQ0gsSzs7OzswQkFoVGF0RSxNLEVBQVE7QUFDbEIsaUJBQUtBLE1BQUwsR0FBY0EsTUFBZDtBQUNIOzs7OztBQWdUTDs7Ozs7a0JBR2VYLFEiLCJmaWxlIjoiUG5nSW1hZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG1vZHVsZSBQbmdJbWFnZVxyXG4gKiBcclxuICogQGRlc2NyaXB0aW9uIFBuZyBJbWFnZSBDbGFzcyBmb3IgZ2VuZXJhdGlvbiBwbmcgaW1hZ2VzLlxyXG4gKlxyXG4gKiBAdmVyc2lvbiAxLjBcclxuICogQGF1dGhvciBHcmlnb3J5IFZhc2lseWV2IDxwb3N0Y3NzLmhhbXN0ZXJAZ21haWwuY29tPiBodHRwczovL2dpdGh1Yi5jb20vaDB0YzBkM1xyXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNywgR3JpZ29yeSBWYXNpbHlldlxyXG4gKiBAbGljZW5zZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAsIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMCBcclxuICogXHJcbiAqL1xyXG5cclxuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xyXG5pbXBvcnQgemxpYiBmcm9tIFwiemxpYlwiO1xyXG5pbXBvcnQge3NhZmVVaW50OEFycmF5fSBmcm9tIFwiLi9IZWxwZXJzXCI7XHJcblxyXG5jbGFzcyBQbmdJbWFnZSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAgQ29uc3RydWN0b3IgZm9yIFBuZ0ltYWdlIENsYXNzLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkZXB0aCAtIGNvbG9yIGRlcHRoLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvbG9ydHlwZSAtIHBuZyBjb2xvciB0eXBlLlxyXG4gICAgICogXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIDxwcmU+XHJcbiAgICAgKiBDb2xvciBkZXB0aHM6XHJcbiAgICAgKiBcclxuICAgICAqIFBORyBpbWFnZSB0eXBlICAgICAgICAgICBDb2xvdXIgdHlwZSAgICBBbGxvd2VkIGJpdCBkZXB0aHMgICAgICAgSW50ZXJwcmV0YXRpb25cclxuICAgICAqIEdyZXlzY2FsZSAgICAgICAgICAgICAgICAwICAgICAgICAgICAgICAgIDEsIDIsIDQsIDgsIDE2ICAgICAgICAgRWFjaCBwaXhlbCBpcyBhIGdyZXlzY2FsZSBzYW1wbGVcclxuICAgICAqIFRydWVjb2xvciAgICAgICAgICAgICAgICAyICAgICAgICAgICAgICAgIDgsIDE2ICAgICAgICAgICAgICAgICAgRWFjaCBwaXhlbCBpcyBhbiBSLEcsQiB0cmlwbGVcclxuICAgICAqIEluZGV4ZWQtY29sb3IgICAgICAgICAgICAzICAgICAgICAgICAgICAgIDEsIDIsIDQsIDggICAgICAgICAgICAgRWFjaCBwaXhlbCBpcyBhIHBhbGV0dGUgaW5kZXg7IGEgUExURSBjaHVuayBzaGFsbCBhcHBlYXIuXHJcbiAgICAgKiBHcmV5c2NhbGUgd2l0aCBhbHBoYSAgICAgNCAgICAgICAgICAgICAgICA4LCAxNiAgICAgICAgICAgICAgICAgIEVhY2ggcGl4ZWwgaXMgYSBncmV5c2NhbGUgc2FtcGxlIGZvbGxvd2VkIGJ5IGFuIGFscGhhIHNhbXBsZS5cclxuICAgICAqIFRydWVjb2xvciB3aXRoIGFscGhhICAgICA2ICAgICAgICAgICAgICAgIDgsIDE2ICAgICAgICAgICAgICAgICAgRWFjaCBwaXhlbCBpcyBhbiBSLEcsQiB0cmlwbGUgZm9sbG93ZWQgYnkgYW4gYWxwaGEgc2FtcGxlLlxyXG4gICAgICogPC9wcmU+XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGRlcHRoID0gOCwgY29sb3J0eXBlID0gNikge1xyXG4gICAgICAgIHRoaXMuZGVwdGggPSBkZXB0aDtcclxuICAgICAgICB0aGlzLmNvbG9ydHlwZSA9IGNvbG9ydHlwZTtcclxuICAgICAgICB0aGlzLnRyYW5zcGFyZW50ID0gbmV3IHNhZmVVaW50OEFycmF5KFswLCAwLCAwLCAwXSk7IC8vIFRyYW5zcGFyZW50IGNvbG9yXHJcbiAgICAgICAgdGhpcy5pZW5kID0gbmV3IHNhZmVVaW50OEFycmF5KFswLCAwLCAwLCAwLCA3MywgNjksIDc4LCA2OCwgMTc0LCA2NiwgOTYsIDEzMF0pOyAvLyBJRU5EIENIVU5LXHJcbiAgICAgICAgdmFyIHNhZmVVaW50MzJBcnJheSA9IHR5cGVvZiBVaW50MzJBcnJheSAhPT0gXCJ1bmRlZmluZWRcIiA/IFVpbnQzMkFycmF5IDogQXJyYXk7XHJcbiAgICAgICAgLy8gdGhpcy5wYWtvID0gcmVxdWlyZShcInBha29cIik7XHJcbiAgICAgICAgLy8vLyBwcmUgY2FsY3VsYXRlZCBjcmMgdGFibGUgZm9yIGNyYzMyIG1ldGhvZFxyXG4gICAgICAgIHRoaXMuY3JjVGFibGUgPSBuZXcgc2FmZVVpbnQzMkFycmF5KFtcclxuICAgICAgICAgICAgMCwgMTk5Njk1OTg5NCwgLTMwMTA0NzUwOCwgLTE3Mjc0NDI1MDIsIDEyNDYzNDEzNyxcclxuICAgICAgICAgICAgMTg4NjA1NzYxNSwgLTM3OTM0NTYxMSwgLTE2Mzc1NzUyNjEsIDI0OTI2ODI3NCwgMjA0NDUwODMyNCxcclxuICAgICAgICAgICAgLTUyMjg1MjA2NiwgLTE3NDc3ODk0MzIsIDE2Mjk0MTk5NSwgMjEyNTU2MTAyMSwgLTQwNzM2MDI0OSxcclxuICAgICAgICAgICAgLTE4NjY1MjMyNDcsIDQ5ODUzNjU0OCwgMTc4OTkyNzY2NiwgLTIwNTk1MDY0OCwgLTIwNjc5MDYwODIsXHJcbiAgICAgICAgICAgIDQ1MDU0ODg2MSwgMTg0MzI1ODYwMywgLTE4NzM4NjU0MywgLTIwODMyODk2NTcsIDMyNTg4Mzk5MCxcclxuICAgICAgICAgICAgMTY4NDc3NzE1MiwgLTQzODQ1MjU0LCAtMTk3MzA0MDY2MCwgMzM1NjMzNDg3LCAxNjYxMzY1NDY1LFxyXG4gICAgICAgICAgICAtOTk2NjQ1NDEsIC0xOTI4ODUxOTc5LCA5OTcwNzMwOTYsIDEyODE5NTM4ODYsIC03MTUxMTE5NjQsXHJcbiAgICAgICAgICAgIC0xNTcwMjc5MDU0LCAxMDA2ODg4MTQ1LCAxMjU4NjA3Njg3LCAtNzcwODY1NjY3LCAtMTUyNjAyNDg1MyxcclxuICAgICAgICAgICAgOTAxMDk3NzIyLCAxMTE5MDAwNjg0LCAtNjA4NDUwMDkwLCAtMTM5NjkwMTU2OCwgODUzMDQ0NDUxLFxyXG4gICAgICAgICAgICAxMTcyMjY2MTAxLCAtNTg5OTUxNTM3LCAtMTQxMjM1MDYzMSwgNjUxNzY3OTgwLCAxMzczNTAzNTQ2LFxyXG4gICAgICAgICAgICAtOTI1NDEyOTkyLCAtMTA3Njg2MjY5OCwgNTY1NTA3MjUzLCAxNDU0NjIxNzMxLCAtODA5ODU1NTkxLFxyXG4gICAgICAgICAgICAtMTE5NTUzMDk5MywgNjcxMjY2OTc0LCAxNTk0MTk4MDI0LCAtOTcyMjM2MzY2LCAtMTMyNDYxOTQ4NCxcclxuICAgICAgICAgICAgNzk1ODM1NTI3LCAxNDgzMjMwMjI1LCAtMTA1MDYwMDAyMSwgLTEyMzQ4MTc3MzEsIDE5OTQxNDYxOTIsXHJcbiAgICAgICAgICAgIDMxMTU4NTM0LCAtMTczMTA1OTUyNCwgLTI3MTI0OTM2NiwgMTkwNzQ1OTQ2NSwgMTEyNjM3MjE1LFxyXG4gICAgICAgICAgICAtMTYxNDgxNDA0MywgLTM5MDU0MDIzNywgMjAxMzc3NjI5MCwgMjUxNzIyMDM2LCAtMTc3Nzc1MTkyMixcclxuICAgICAgICAgICAgLTUxOTEzNzI1NiwgMjEzNzY1Njc2MywgMTQxMzc2ODEzLCAtMTg1NTY4OTU3NywgLTQyOTY5NTk5OSxcclxuICAgICAgICAgICAgMTgwMjE5NTQ0NCwgNDc2ODY0ODY2LCAtMjA1Njk2NTkyOCwgLTIyODQ1ODQxOCwgMTgxMjM3MDkyNSxcclxuICAgICAgICAgICAgNDUzMDkyNzMxLCAtMjExMzM0MjI3MSwgLTE4MzUxNjA3MywgMTcwNjA4ODkwMiwgMzE0MDQyNzA0LFxyXG4gICAgICAgICAgICAtMTk1MDQzNTA5NCwgLTU0OTQ5NzY0LCAxNjU4NjU4MjcxLCAzNjY2MTk5NzcsIC0xOTMyMjk2OTczLFxyXG4gICAgICAgICAgICAtNjk5NzI4OTEsIDEzMDM1MzU5NjAsIDk4NDk2MTQ4NiwgLTE1NDc5NjAyMDQsIC03MjU5Mjk3NTgsXHJcbiAgICAgICAgICAgIDEyNTYxNzA4MTcsIDEwMzc2MDQzMTEsIC0xNTI5NzU2NTYzLCAtNzQwODg3MzAxLCAxMTMxMDE0NTA2LFxyXG4gICAgICAgICAgICA4Nzk2Nzk5OTYsIC0xMzg1NzIzODM0LCAtNjMxMTk1NDQwLCAxMTQxMTI0NDY3LCA4NTU4NDIyNzcsXHJcbiAgICAgICAgICAgIC0xNDQyMTY1NjY1LCAtNTg2MzE4NjQ3LCAxMzQyNTMzOTQ4LCA2NTQ0NTkzMDYsIC0xMTA2NTcxMjQ4LFxyXG4gICAgICAgICAgICAtOTIxOTUyMTIyLCAxNDY2NDc5OTA5LCA1NDQxNzk2MzUsIC0xMTg0NDQzMzgzLCAtODMyNDQ1MjgxLFxyXG4gICAgICAgICAgICAxNTkxNjcxMDU0LCA3MDIxMzg3NzYsIC0xMzI4NTA2ODQ2LCAtOTQyMTY3ODg0LCAxNTA0OTE4ODA3LFxyXG4gICAgICAgICAgICA3ODM1NTE4NzMsIC0xMjEyMzI2ODUzLCAtMTA2MTUyNDMwNywgLTMwNjY3NDkxMiwgLTE2OTg3MTI2NTAsXHJcbiAgICAgICAgICAgIDYyMzE3MDY4LCAxOTU3ODEwODQyLCAtMzU1MTIxMzUxLCAtMTY0NzE1MTE4NSwgODE0NzA5OTcsXHJcbiAgICAgICAgICAgIDE5NDM4MDM1MjMsIC00ODAwNDgzNjYsIC0xODA1MzcwNDkyLCAyMjUyNzQ0MzAsIDIwNTM3OTAzNzYsXHJcbiAgICAgICAgICAgIC00Njg3OTE1NDEsIC0xODI4MDYxMjgzLCAxNjc4MTY3NDMsIDIwOTc2NTEzNzcsIC0yNjc0MTQ3MTYsXHJcbiAgICAgICAgICAgIC0yMDI5NDc2OTEwLCA1MDM0NDQwNzIsIDE3NjIwNTA4MTQsIC0xNDQ1NTAwNTEsIC0yMTQwODM3OTQxLFxyXG4gICAgICAgICAgICA0MjY1MjIyMjUsIDE4NTI1MDc4NzksIC0xOTY1Mzc3MCwgLTE5ODI2NDkzNzYsIDI4Mjc1MzYyNixcclxuICAgICAgICAgICAgMTc0MjU1NTg1MiwgLTEwNTI1OTE1MywgLTE5MDAwODkzNTEsIDM5NzkxNzc2MywgMTYyMjE4MzYzNyxcclxuICAgICAgICAgICAgLTY5MDU3NjQwOCwgLTE1ODAxMDA3MzgsIDk1MzcyOTczMiwgMTM0MDA3NjYyNiwgLTc3NjI0NzMxMSxcclxuICAgICAgICAgICAgLTE0OTc2MDYyOTcsIDEwNjg4MjgzODEsIDEyMTk2Mzg4NTksIC02NzAyMjU0NDYsIC0xMzU4MjkyMTQ4LFxyXG4gICAgICAgICAgICA5MDYxODU0NjIsIDEwOTA4MTI1MTIsIC01NDcyOTUyOTMsIC0xNDY5NTg3NjI3LCA4MjkzMjkxMzUsXHJcbiAgICAgICAgICAgIDExODEzMzUxNjEsIC04ODI3ODk0OTIsIC0xMTM0MTMyNDU0LCA2MjgwODU0MDgsIDEzODI2MDUzNjYsXHJcbiAgICAgICAgICAgIC04NzE1OTgxODcsIC0xMTU2ODg4ODI5LCA1NzA1NjIyMzMsIDE0MjY0MDA4MTUsIC05Nzc2NTA3NTQsXHJcbiAgICAgICAgICAgIC0xMjk2MjMzNjg4LCA3MzMyMzk5NTQsIDE1NTUyNjE5NTYsIC0xMDI2MDMxNzA1LCAtMTI0NDYwNjY3MSxcclxuICAgICAgICAgICAgNzUyNDU5NDAzLCAxNTQxMzIwMjIxLCAtMTY4Nzg5NTM3NiwgLTMyODk5NDI2NiwgMTk2OTkyMjk3MixcclxuICAgICAgICAgICAgNDA3MzU0OTgsIC0xNjc3MTMwMDcxLCAtMzUxMzkwMTQ1LCAxOTEzMDg3ODc3LCA4MzkwODM3MSxcclxuICAgICAgICAgICAgLTE3ODI2MjU2NjIsIC00OTEyMjY2MDQsIDIwNzUyMDg2MjIsIDIxMzI2MTExMiwgLTE4MzE2OTQ2OTMsXHJcbiAgICAgICAgICAgIC00Mzg5NzcwMTEsIDIwOTQ4NTQwNzEsIDE5ODk1ODg4MSwgLTIwMzI5MzgyODQsIC0yMzc3MDY2ODYsXHJcbiAgICAgICAgICAgIDE3NTkzNTk5OTIsIDUzNDQxNDE5MCwgLTIxMTgyNDg3NTUsIC0xNTU2MzgxODEsIDE4NzM4MzYwMDEsXHJcbiAgICAgICAgICAgIDQxNDY2NDU2NywgLTIwMTI3MTgzNjIsIC0xNTc2NjkyOCwgMTcxMTY4NDU1NCwgMjg1MjgxMTE2LFxyXG4gICAgICAgICAgICAtMTg4OTE2NTU2OSwgLTEyNzc1MDU1MSwgMTYzNDQ2Nzc5NSwgMzc2MjI5NzAxLCAtMTYwOTg5OTQwMCxcclxuICAgICAgICAgICAgLTY4Njk1OTg5MCwgMTMwODkxODYxMiwgOTU2NTQzOTM4LCAtMTQ4NjQxMjE5MSwgLTc5OTAwOTAzMyxcclxuICAgICAgICAgICAgMTIzMTYzNjMwMSwgMTA0NzQyNzAzNSwgLTEzNjIwMDc0NzgsIC02NDAyNjM0NjAsIDEwODgzNTkyNzAsXHJcbiAgICAgICAgICAgIDkzNjkxODAwMCwgLTE0NDcyNTIzOTcsIC01NTgxMjk0NjcsIDEyMDI5MDA4NjMsIDgxNzIzMzg5NyxcclxuICAgICAgICAgICAgLTExMTE2MjUxODgsIC04OTM3MzAxNjYsIDE0MDQyNzc1NTIsIDYxNTgxODE1MCwgLTExNjA3NTk4MDMsXHJcbiAgICAgICAgICAgIC04NDE1NDYwOTMsIDE0MjM4NTc0NDksIDYwMTQ1MDQzMSwgLTEyODUxMjk2ODIsIC0xMDAwMjU2ODQwLFxyXG4gICAgICAgICAgICAxNTY3MTAzNzQ2LCA3MTE5Mjg3MjQsIC0xMjc0Mjk4ODI1LCAtMTAyMjU4NzIzMSwgMTUxMDMzNDIzNSwgNzU1MTY3MTE3XSk7XHJcbiAgICAgICAgdGhpcy5paGRyID0gbnVsbDtcclxuICAgICAgICB0aGlzLmlkYXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubWF0cml4ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmltYWdlID0gbnVsbDtcclxuICAgICAgICAgICAgLy8gZm9yIChsZXQgaiA9IDA7IGogPCAyNTY7IGorKykge1xyXG4gICAgICAgICAgICAvLyBcdGxldCBjID0gajtcclxuICAgICAgICAgICAgLy8gXHRmb3IgKGxldCBrID0gMDsgayA8IDg7IGsrKykge1xyXG4gICAgICAgICAgICAvLyBcdFx0aWYgKGMgJiAxKSB7XHJcbiAgICAgICAgICAgIC8vIFx0XHRcdGMgPSAtMzA2Njc0OTEyIF4gKGMgPj4+IDEpO1xyXG4gICAgICAgICAgICAvLyBcdFx0fSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gXHRcdFx0YyA9IGMgPj4+IDE7XHJcbiAgICAgICAgICAgIC8vIFx0XHR9XHJcbiAgICAgICAgICAgIC8vIFx0fVxyXG4gICAgICAgICAgICAvLyBcdHRoaXMuY3JjVGFibGVbal0gPSBjO1xyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgSUhEUiBzZXR0aW5ncyBhbmQgZ2VuZXJhdGUgSUhEUiBDaHVuayBmb3IgUE5HIEltYWdlLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgLSBpbWFnZSBoZWlnaHQuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSBpbWFnZSB3aWR0aC5cclxuICAgICAqIFxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiA8cHJlPlxyXG4gICAgICogSUhEUiBGb3JtYXQ6XHJcbiAgICAgKiBXaWR0aCA0IGJ5dGVzXHJcbiAgICAgKiBIZWlnaHQgNCBieXRlc1xyXG4gICAgICogQml0IGRlcHRoIDEgYnl0ZVxyXG4gICAgICogQ29sb3VyIHR5cGUgMSBieXRlXHJcbiAgICAgKiBDb21wcmVzc2lvbiBtZXRob2QgMSBieXRlXHJcbiAgICAgKiBGaWx0ZXIgbWV0aG9kIDEgYnl0ZVxyXG4gICAgICogSW50ZXJsYWNlIG1ldGhvZCAxIGJ5dGVcclxuICAgICAqIDwvcHJlPlxyXG4gICAgICovXHJcbiAgICBzZXRJSERSKGhlaWdodCA9IDEsIHdpZHRoID0gMSkge1xyXG5cclxuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgLy8gSUhEUiBDaHVua1xyXG4gICAgICAgIHRoaXMuaWhkciA9IG5ldyBzYWZlVWludDhBcnJheSgyNSk7XHJcbiAgICAgICAgdGhpcy5paGRyLnNldCh0aGlzLmJ5dGU0KDEzKSwgMCk7XHJcbiAgICAgICAgdGhpcy5paGRyLnNldChbNzMsIDcyLCA2OCwgODJdLCA0KTtcclxuICAgICAgICB0aGlzLmloZHIuc2V0KHRoaXMuYnl0ZTQodGhpcy53aWR0aCksIDgpO1xyXG4gICAgICAgIHRoaXMuaWhkci5zZXQodGhpcy5ieXRlNCh0aGlzLmhlaWdodCksIDEyKTtcclxuICAgICAgICB0aGlzLmloZHIuc2V0KFt0aGlzLmRlcHRoLCB0aGlzLmNvbG9ydHlwZSwgMCwgMCwgMF0sIDE2KTtcclxuXHJcbiAgICAgICAgbGV0IHRtcCA9IG5ldyBzYWZlVWludDhBcnJheSgxNyk7XHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxNzsgaisrKSB7XHJcbiAgICAgICAgICAgIHRtcFtqXSA9IHRoaXMuaWhkcltqICsgNF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaWhkci5zZXQodGhpcy5jcmMzMih0bXApLCAyMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBydWxlciBpbWFnZSBtYXRyaXguXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIGltYWdlIGhlaWdodC5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciAtIHJ1bGVyIGxpbmUgY29sb3IuIFN1cHBvcnQgaGV4IGNvbG9yIGxpa2UgIzQ1NDU0NSwgd2ViIHNhZmUgaGV4IGxpa2UgIzMzMywgcmdiKDI1NSwgMTQzLCAxNSkgLSByZWQsICBncmVlbiwgYmx1ZSwgcmdiYSgyNTUsIDE0MywgMTUsIDAuNikgLSByZWQsICBncmVlbiwgYmx1ZSwgYWxwaGEodHJhbnNwYXJlbmN5KS5cclxuICAgICAqIEBwYXJhbSB7YXJyYXl9IHBhdHRlcm4gLSBydWxlciBsaW5lIHBhdHRlcm4gYXJyYXkgbGlrZSBbMSwgMCwgMCwgMF0gLSB2YWx1ZSA9IDEgLSB3cml0ZSBjb2xvciBwaXhlbCwgdmFsdWVzID0gMCB3cml0ZSB0cmFuc3BhcmVudCBwaXhlbC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aGlja25lc3MgLSBydWxlciBsaW5lIHRoaWNrbmVzcyBpbiBwaXhlbHMuXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc2NhbGUgLSBpbWFnZSBzY2FsZSByYXRpby5cclxuICAgICAqIFxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiA8cHJlPlxyXG4gICAgICogRmlsdGVyIFR5cGVzOlxyXG4gICAgICogMCAgICBOb25lICAgICAgICBGaWx0KHgpID0gT3JpZyh4KSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVjb24oeCkgPSBGaWx0KHgpXHJcbiAgICAgKiAxICAgIFN1YiAgICAgICAgIEZpbHQoeCkgPSBPcmlnKHgpIC0gT3JpZyhhKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWNvbih4KSA9IEZpbHQoeCkgKyBSZWNvbihhKVxyXG4gICAgICogMiAgICBVcCAgICAgICAgICBGaWx0KHgpID0gT3JpZyh4KSAtIE9yaWcoYikgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVjb24oeCkgPSBGaWx0KHgpICsgUmVjb24oYilcclxuICAgICAqIDMgICAgQXZlcmFnZSAgICAgRmlsdCh4KSA9IE9yaWcoeCkgLSBmbG9vcigoT3JpZyhhKSArIE9yaWcoYikpIC8gMikgICAgICAgICAgICAgIFJlY29uKHgpID0gRmlsdCh4KSArIGZsb29yKChSZWNvbihhKSArIFJlY29uKGIpKSAvIDIpXHJcbiAgICAgKiA0ICAgIFBhZXRoICAgICAgIEZpbHQoeCkgPSBPcmlnKHgpIC0gUGFldGhQcmVkaWN0b3IoT3JpZyhhKSwgT3JpZyhiKSwgT3JpZyhjKSkgICBSZWNvbih4KSA9IEZpbHQoeCkgKyBQYWV0aFByZWRpY3RvcihSZWNvbihhKSwgUmVjb24oYiksIFJlY29uKGMpXHJcbiAgICAgKiA8L3ByZT5cclxuICAgICAqL1xyXG4gICAgcnVsZXJNYXRyaXgoaGVpZ2h0LCBjb2xvciwgcGF0dGVybiwgdGhpY2tuZXNzID0gMSwgc2NhbGUgPSAxKSB7XHJcblxyXG4gICAgICAgIGxldCBwbGVuID0gcGF0dGVybi5sZW5ndGg7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0SUhEUihNYXRoLnJvdW5kKGhlaWdodCAqIHNjYWxlKSwgTWF0aC5yb3VuZChwbGVuICogc2NhbGUpKTtcclxuXHJcbiAgICAgICAgLy9wYXRlcm4gdGhpY2tuZXNzXHJcbiAgICAgICAgdGhpY2tuZXNzID0gdGhpY2tuZXNzICogc2NhbGU7XHJcbiAgICAgICAgLy8gU2NhbmxpbmUgZmlsdGVyIDBcclxuICAgICAgICBsZXQgZmlsdGVyID0gbmV3IHNhZmVVaW50OEFycmF5KFswXSk7XHJcblxyXG4gICAgICAgIHRoaXMucGl4ZWxjb2xvciA9IHRoaXMucGFyc2VDb2xvcihjb2xvcik7XHJcbiAgICAgICAgbGV0IHBhdHRlcm5IZWlnaHQgPSBNYXRoLmZsb29yKHRoaWNrbmVzcyAvIDIpO1xyXG4gICAgICAgIGxldCBwYXQgPSBuZXcgc2FmZVVpbnQ4QXJyYXkocGF0dGVybik7XHJcbiAgICAgICAgbGV0IHJlbWFpbmRlciA9IHRoaWNrbmVzcyAlIDI7XHJcblxyXG4gICAgICAgIGxldCBib3R0b20gPSB0aGlzLmhlaWdodCAtIHBhdHRlcm5IZWlnaHQgLSByZW1haW5kZXI7XHJcblxyXG4gICAgICAgIC8vbGV0IGJvdHRvbSA9IHRoaXMuaGVpZ2h0IC0gdGhpY2tuZXNzO1xyXG4gICAgICAgIHRoaXMubWF0cml4ID0gbmV3IHNhZmVVaW50OEFycmF5KHRoaXMuaGVpZ2h0ICogdGhpcy53aWR0aCAqIDQgKyB0aGlzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIGxldCBwbGluZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBzY2FuIGxpbmVzXHJcbiAgICAgICAgbGV0IHBvcyA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmhlaWdodDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgMCBmaWx0ZXIgYXQgbmV3IHNjYW5saW5lXHJcbiAgICAgICAgICAgIHRoaXMubWF0cml4LnNldChmaWx0ZXIsIHBvcyk7XHJcbiAgICAgICAgICAgIHBvcysrO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3VycmVudCBsaW5lIGluY2x1ZGUgcnVsZXIgcGF0dGVybiA/IC8vIHRvcCBhbmQgYm90dG9tXHJcbiAgICAgICAgICAgIGlmIChpIDwgcGF0dGVybkhlaWdodCB8fCBpID49IGJvdHRvbSkge1xyXG4gICAgICAgICAgICAgICAgcGxpbmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxpbmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gLy8gQ3VycmVudCBsaW5lIGluY2x1ZGUgcnVsZXIgcGF0dGVybiA/IC8vIGJvdHRvbVxyXG4gICAgICAgICAgICAvLyBpZiAoaSA+PSBib3R0b20pIHtcclxuICAgICAgICAgICAgLy8gICAgIHBsaW5lID0gdHJ1ZTtcclxuICAgICAgICAgICAgLy8gfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gICAgIHBsaW5lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy53aWR0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxpbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGluZGV4ID0gTWF0aC5mbG9vcihqIC8gc2NhbGUpICUgcGxlbjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGF0W3BpbmRleF0gPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXRyaXguc2V0KHRoaXMucGl4ZWxjb2xvciwgcG9zKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeC5zZXQodGhpcy50cmFuc3BhcmVudCwgcG9zKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWF0cml4LnNldCh0aGlzLnRyYW5zcGFyZW50LCBwb3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gIFxyXG4gICAgICAgICAgICAgICAgcG9zICs9IDQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLm1hdHJpeC5zdWJhcnJheSgwLCBwb3MpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIHRoaXMubWFrZUlEQVQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBpbWFnZSBtYXRyaXguXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIG1hdHJpeCAtIGJ5dGVzLlxyXG4gICAgICogXHJcbiAgICAgKi9cclxuICAgIHNldCBzZXRNYXRyaXgobWF0cml4KSB7XHJcbiAgICAgICAgdGhpcy5tYXRyaXggPSBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBJREFUIENodW5rIGZvciBpbWFnZS4gRGVmbGF0ZSBpbWFnZSBtYXRyaXguXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICovXHJcbiAgICBtYWtlSURBVCgpIHtcclxuICAgICAgICBpZiAodGhpcy5tYXRyaXgpIHtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeCA9IHpsaWIuZGVmbGF0ZVN5bmMobmV3IEJ1ZmZlcih0aGlzLm1hdHJpeCksIHtcclxuICAgICAgICAgICAgICAgIGxldmVsOiA5XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBtYXRyaXggPSBuZXcgc2FmZVVpbnQ4QXJyYXkobWF0cml4LmJ1ZmZlciwgbWF0cml4LmJ5dGVPZmZzZXQsIG1hdHJpeC5ieXRlTGVuZ3RoIC8gc2FmZVVpbnQ4QXJyYXkuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgICAgICAgICAvLyBsZXQgbWF0cml4ID0gdGhpcy5wYWtvLmRlZmxhdGUodGhpcy5tYXRyaXgpO1xyXG4gICAgICAgICAgICBsZXQgbWxlbiA9IG1hdHJpeC5sZW5ndGg7XHJcbiAgICAgICAgICAgIHRoaXMuaWRhdCA9IG5ldyBzYWZlVWludDhBcnJheShtbGVuICsgMTIpO1xyXG4gICAgICAgICAgICB0aGlzLmlkYXQuc2V0KHRoaXMuYnl0ZTQobWxlbiksIDApO1xyXG4gICAgICAgICAgICB0aGlzLmlkYXQuc2V0KFs3MywgNjgsIDY1LCA4NF0sIDQpO1xyXG4gICAgICAgICAgICB0aGlzLmlkYXQuc2V0KG1hdHJpeCwgOCk7XHJcbiAgICAgICAgICAgIGxldCB0c2l6ZSA9IG1sZW4gKyA0O1xyXG4gICAgICAgICAgICBsZXQgdG1wID0gbmV3IHNhZmVVaW50OEFycmF5KHRzaXplKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0c2l6ZTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICB0bXBbal0gPSB0aGlzLmlkYXRbaiArIDRdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuaWRhdC5zZXQodGhpcy5jcmMzMih0bXApLCBtbGVuICsgOCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1ha2UgaW1hZ2UgYmVmb3JlIG91dHB1dC4gR2x1ZSBhbGwgUE5HIENodW5rcyB3aXRoIFBORyBIZWFkZXIuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICovXHJcbiAgICBtYWtlSW1hZ2UoKSB7XHJcbiAgICAgICAgLy8gR2x1ZSBjaHVua3Mgd2l0aCBQTkcgaW1hZ2UgaGVhZGVyXHJcbiAgICAgICAgLy9CdWZmZXIuY29uY2F0KFt0aGlzLmZyb21IZXgoWzB4ODksIDB4NTAsIDB4NEUsIDB4NDcsIDB4MEQsIDB4MEEsIDB4MUEsIDB4MEFdKSwgdGhpcy5paGRyLCB0aGlzLmlkYXQsIHRoaXMuaWVuZF0pXHJcbiAgICAgICAgbGV0IGxpaGRyID0gdGhpcy5paGRyLmxlbmd0aDtcclxuICAgICAgICBsZXQgbGlkYXQgPSB0aGlzLmlkYXQubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBuZXcgc2FmZVVpbnQ4QXJyYXkobGloZHIgKyBsaWRhdCArIDIwKTtcclxuICAgICAgICB0aGlzLmltYWdlLnNldChbMTM3LCA4MCwgNzgsIDcxLCAxMywgMTAsIDI2LCAxMF0sIDApO1xyXG4gICAgICAgIHRoaXMuaW1hZ2Uuc2V0KHRoaXMuaWhkciwgOCk7XHJcbiAgICAgICAgdGhpcy5pbWFnZS5zZXQodGhpcy5pZGF0LCBsaWhkciArIDgpO1xyXG4gICAgICAgIHRoaXMuaW1hZ2Uuc2V0KHRoaXMuaWVuZCwgbGloZHIgKyBsaWRhdCArIDgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGFyc2UgY29sb3IgZnJvbSBzdHJpbmcuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIC0gY29sb3IgYXMgc3RyaW5nLlxyXG4gICAgICogU3VwcG9ydCBoZXggY29sb3IgbGlrZSAjNDU0NTQ1LCB3ZWIgc2FmZSBoZXggbGlrZSAjMzMzLCByZ2IoMjU1LCAxNDMsIDE1KSAtIHJlZCwgIGdyZWVuLCBibHVlLCByZ2JhKDI1NSwgMTQzLCAxNSwgMC42KSAtIHJlZCwgIGdyZWVuLCBibHVlLCBhbHBoYSh0cmFuc3BhcmVuY3kpLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyAgVWludDhBcnJheSAtIGNvbG9yIGZvciBwbmcgaW1hZ2UgZW5jb2RlZCBhcyBieXRlcy5cclxuICAgICAqL1xyXG4gICAgcGFyc2VDb2xvcihjb2xvcikge1xyXG5cclxuICAgICAgICAvLyB0cmFuc3BhcmVudCBjb2xvclxyXG4gICAgICAgIGxldCBbcmVkLCBncmVlbiwgYmx1ZSwgYWxwaGFdID0gWzAsIDAsIDAsIDBdO1xyXG4gICAgICAgIGxldCBmb3VuZDtcclxuICAgICAgICAvLyBIZXggY29sb3IgbGlrZSAjNDU0NTQ1XHJcbiAgICAgICAgaWYgKChmb3VuZCA9IGNvbG9yLm1hdGNoKC9cXCMoWzAtOWEtekEtWl17MywgNn0pLykpKSB7XHJcbiAgICAgICAgICAgIGxldCBmbGVuID0gZm91bmRbMV0ubGVuZ3RoO1xyXG4gICAgICAgICAgICBpZiAoZmxlbiA9PSA2KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgW3JlZCwgZ3JlZW4sIGJsdWVdID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGZvdW5kWzFdLnN1YnN0cigwLCAyKSwgMTYpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGZvdW5kWzFdLnN1YnN0cigyLCAyKSwgMTYpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGZvdW5kWzFdLnN1YnN0cig0LCAyKSwgMTYpXHJcbiAgICAgICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgICAgIGFscGhhID0gMjU1O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZsZW4ubGVuZ3RoID09IDMpIHtcclxuICAgICAgICAgICAgICAgIC8vIEhleCBjb2xvcnMgbGlrZSAjMzMzXHJcbiAgICAgICAgICAgICAgICBsZXQgcmMgPSBmb3VuZFsxXS5zdWJzdHIoMCwgMSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ2MgPSBmb3VuZFsxXS5zdWJzdHIoMSwgMSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmMgPSBmb3VuZFsxXS5zdWJzdHIoMiwgMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmMgPSByYyArIHJjO1xyXG4gICAgICAgICAgICAgICAgZ2MgPSBnYyArIGdjO1xyXG4gICAgICAgICAgICAgICAgYmMgPSBiYyArIGJjO1xyXG5cclxuICAgICAgICAgICAgICAgIFtyZWQsIGdyZWVuLCBibHVlXSA9IFtcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChyYywgMTYpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGdjLCAxNiksXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYmMsIDE2KVxyXG4gICAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgICAgICBhbHBoYSA9IDI1NTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gcmdiIHJnYmEgY29sb3JzIGxpa2UgcmdiYSgyNTUsIDI1NSwyNTUsIDI1NSlcclxuICAgICAgICB9IGVsc2UgaWYgKChmb3VuZCA9IGNvbG9yLm1hdGNoKC9yZ2JhKlxcKCguKj8pXFwpLykpKSB7XHJcblxyXG4gICAgICAgICAgICBbcmVkLCBncmVlbiwgYmx1ZSwgYWxwaGFdID0gZm91bmRbMV0uc3BsaXQoL1xccypcXCxcXHMqL2kpO1xyXG4gICAgICAgICAgICBhbHBoYSA9IChhbHBoYSAhPSBudWxsICYmIGFscGhhID4gMCkgPyBNYXRoLnJvdW5kKGFscGhhICogMjU1KSA6IDI1NTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5jb2xvcihyZWQsIGdyZWVuLCBibHVlLCBhbHBoYSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSByZ2JhIGNvbG9yIGZvciBQTkcgSW1hZ2UuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJlZCAtIHJlZCB2YWx1ZSBpbiByZ2IgcGFsZXR0ZS5cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBncmVlbiAtIGdyZWVuIHZhbHVlIGluIHJnYiBwYWxldHRlLlxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGJsdWUgLSBibHVlIHZhbHVlIGluIHJnYiBwYWxldHRlLlxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGFscGhhIC0gdHJhbnNwYXJlbmN5IHZhbHVlLlxyXG4gICAgICogXHJcbiAgICAgKiBAZGVzY3JpcHRpb24gQWxsIHZhbHVlcyBtdXN0IGJlIGZyb20gMCB0byAyNTUuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIFVpbnQ4QXJyYXkgLSBjb2xvciBlbmNvZGVkIGFzIGJ5dGVzLlxyXG4gICAgICovXHJcbiAgICBjb2xvcihyZWQsIGdyZWVuLCBibHVlLCBhbHBoYSkge1xyXG4gICAgICAgIGxldCByZXQgPSBuZXcgc2FmZVVpbnQ4QXJyYXkoNCk7XHJcbiAgICAgICAgcmV0WzBdID0gKHJlZCAmJiByZWQgPj0gMCAmJiByZWQgPD0gMjU1KSA/IHJlZCA6IDI1NTtcclxuICAgICAgICByZXRbMV0gPSAoZ3JlZW4gJiYgZ3JlZW4gPj0gMCAmJiBncmVlbiA8PSAyNTUpID8gZ3JlZW4gOiAyNTU7XHJcbiAgICAgICAgcmV0WzJdID0gKGJsdWUgJiYgYmx1ZSA+PSAwICYmIGJsdWUgPD0gMjU1KSA/IGJsdWUgOiAyNTU7XHJcbiAgICAgICAgcmV0WzNdID0gKGFscGhhICYmIGFscGhhID49IDAgJiYgYWxwaGEgPD0gMjU1KSA/IGFscGhhIDogMjU1O1xyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gcG5nIGltYWdlIGluIGJhc2U2NCBmb3JtYXQuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge0J1ZmZlcn0gLSBiYXNlNjQgc3RyaW5nIC0gZW5jb2RlZCBpbWFnZS5cclxuICAgICAqL1xyXG4gICAgZ2V0QmFzZTY0KCkge1xyXG4gICAgICAgIHRoaXMubWFrZUltYWdlKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzZTY0KHRoaXMuaW1hZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV3JpdGUgaW1hZ2UgdG8gZmlsZS5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgLSBpbWFnZSBmaWxlIG5hbWUuXHJcbiAgICAgKi9cclxuICAgIGdldEZpbGUoZmlsZW5hbWUpIHtcclxuICAgICAgICB0aGlzLm1ha2VJbWFnZSgpO1xyXG4gICAgICAgIGZzLndyaXRlRmlsZShmaWxlbmFtZSwgU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCB0aGlzLmltYWdlKSwgXCJiaW5hcnlcIiwgKGVycikgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZSBcIiArIGZpbGVuYW1lICsgXCIgd2FzIHNhdmVkIVwiKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkbGVyIDMyIGFsZ29yaXRobS4gQ2FsY3VsYXRlIGhhc2ggZm9yIGJ5dGVzLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBkYXRhIC0gaW5wdXQgYnl0ZXMuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gYWRsZXIzMiBoYXNoLlxyXG4gICAgICovXHJcbiAgICBhZGxlcjMyKGRhdGEpIHtcclxuXHJcbiAgICAgICAgbGV0IEJBU0UgPSA2NTUyMSxcclxuICAgICAgICAgICAgTk1BWCA9IDU1NTIsXHJcbiAgICAgICAgICAgIHMxID0gMSxcclxuICAgICAgICAgICAgczIgPSAwLFxyXG4gICAgICAgICAgICBuID0gTk1BWDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMxICs9IGRhdGFbaV07XHJcbiAgICAgICAgICAgIHMyICs9IHMxO1xyXG4gICAgICAgICAgICBpZiAoKG4gLT0gMSkgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgczEgJT0gQkFTRTtcclxuICAgICAgICAgICAgICAgIHMyICU9IEJBU0U7XHJcbiAgICAgICAgICAgICAgICBuID0gTk1BWDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgczEgJT0gQkFTRTtcclxuICAgICAgICBzMiAlPSBCQVNFO1xyXG5cclxuICAgICAgICByZXR1cm4gKHMyIDw8IDE2KSB8IHMxO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIGNyYzMyKEN5Y2xpYyByZWR1bmRhbmN5IGNoZWNrKSBjaGVja3N1bSBmb3IgYnl0ZXMuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGRhdGEgLSBpbnB1dCBieXRlcy5cclxuICAgICAqIEBwYXJhbSBjcmMgLSBzdGFydCBjcmMgdmFsdWUsIGRlZmF1bHQgLSAxLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIGNyYzMyIGNoZWNrc3VtLlxyXG4gICAgICovXHJcbiAgICBjcmMzMihkYXRhLCBjcmMgPSAtMSkge1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG5cclxuICAgICAgICAgICAgY3JjID0gdGhpcy5jcmNUYWJsZVsoY3JjIF4gZGF0YVtpXSkgJiAweGZmXSBeIChjcmMgPj4+IDgpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNyYyA9IGNyYyBeIC0xO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5ieXRlNChjcmMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgaGV4IHN0cmluZyBmcm9tIGJ5dGVzLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBkYXRhIC0gaW5wdXQgYnl0ZXMuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHtCdWZmZXJ9IC0gaGV4IHN0cmluZy5cclxuICAgICAqL1xyXG4gICAgaGV4KGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEJ1ZmZlcihkYXRhLCBcImJpbmFyeVwiKS50b1N0cmluZyhcImhleFwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlIGJ5dGVzIGZyb20gaGV4IHN0cmluZy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIGlucHV0IGhleCBzdHJpbmcuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHtCdWZmZXJ9IC0gb3V0cHV0IGJ5dGVzIGluIEJ1ZmZlci5cclxuICAgICAqL1xyXG4gICAgZnJvbUhleChkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCdWZmZXIoZGF0YSwgXCJoZXhcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBiYXNlNjQgc3RyaW5nIGZyb20gYnl0ZXMuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGRhdGEgLSBpbnB1dCBieXRlcy5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge0J1ZmZlcn0gLSBiYXNlNjQgc3RyaW5nLlxyXG4gICAgICovXHJcbiAgICBiYXNlNjQoZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgQnVmZmVyKGRhdGEpLnRvU3RyaW5nKFwiYmFzZTY0XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgYnl0ZXMgZnJvbSBiYXNlNjQgc3RyaW5nLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBkYXRhIC0gaW5wdXQgYmFzZTY0IHN0cmluZy5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge0J1ZmZlcn0gLSBvdXRwdXQgYnl0ZXMgaW4gQnVmZmVyLlxyXG4gICAgICovXHJcbiAgICBmcm9tQmFzZTY0KGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20oZGF0YSwgXCJiYXNlNjRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gMiBieXRlcyB2YWx1ZSBmcm9tIGlucHV0LlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBkYXRhIC0gaW5wdXQgdmFsdWUuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIFVpbnQ4QXJyYXkgLSAyIGJ5dGVzLlxyXG4gICAgICovXHJcblxyXG4gICAgYnl0ZTIoZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgc2FmZVVpbnQ4QXJyYXkoWyhkYXRhID4+IDgpICYgMjU1LCBkYXRhICYgMjU1XSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiA0IGJ5dGVzIHZhbHVlIGZyb20gaW5wdXQuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGRhdGEgLSBpbnB1dCB2YWx1ZS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMgVWludDhBcnJheSAtIDQgYnl0ZXMuXHJcbiAgICAgKi9cclxuICAgIGJ5dGU0KGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gbmV3IHNhZmVVaW50OEFycmF5KFsoZGF0YSA+PiAyNCkgJiAyNTUsIChkYXRhID4+IDE2KSAmIDI1NSwgKGRhdGEgPj4gOCkgJiAyNTUsIGRhdGEgJiAyNTVdKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gMiBsc2IobGVhc3Qgc2lnbmlmaWNhbnQgYml0KSBieXRlcyB2YWx1ZSBmcm9tIGlucHV0LlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBkYXRhIC0gaW5wdXQgdmFsdWUuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIFVpbnQ4QXJyYXkgLSAyIGxzYiBieXRlcy5cclxuICAgICAqL1xyXG4gICAgYnl0ZTJsc2IoZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgc2FmZVVpbnQ4QXJyYXkoW2RhdGEgJiAyNTUsIChkYXRhID4+IDgpICYgMjU1XSk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEV4cG9ydCBQTkcgSW1hZ2UgQ2xhc3MuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBQbmdJbWFnZTsiXX0=
