"use strict";

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
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

        this.zlib = require("zlib");
        this.fs = require("fs");

        this.depth = parseInt(depth);
        this.colortype = parseInt(colortype);
        this.transparent = this.color(0, 0, 0, 0); // Transparent color
        //IEND Chunk
        this.iend = Buffer.concat([this.byte4(0), new Buffer("IEND", "binary"), this.fromHex([0xAE, 0x42, 0x60, 0x82])]);
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


        this.height = parseInt(height);
        this.width = parseInt(width);
        // IHDR Chunk
        this.ihdr = Buffer.concat([new Buffer("IHDR", "binary"), this.byte4(this.width), this.byte4(this.height)]);
        this.ihdr = Buffer.concat([this.ihdr, this.byte(this.depth), this.byte(this.colortype), this.fromHex([0x00, 0x00, 0x00])]);
        this.ihdr = Buffer.concat([this.byte4(13), this.ihdr, this.byte4(this.crc32(this.ihdr))]);
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


        scale = parseInt(scale);

        this.setIHDR(Math.round(height * scale), Math.round(pattern.length * scale));

        //patern thickness
        thickness = parseInt(thickness);

        thickness = thickness * scale;
        // Scanline filter 0

        var filter = this.byte(0);

        this.pixelcolor = this.parseColor(color);

        var patternHeight = Math.floor(thickness / 2);

        var remainder = thickness % 2;

        var bottom = this.height - patternHeight - remainder;

        //let bottom = this.height - thickness;
        this.matrix = null;

        var pline = false;

        // scan lines
        for (var i = 0; i < this.height; i++) {

            // Add 0 filter at new scanline
            this.matrix = this.matrix != null ? Buffer.concat([this.matrix, filter]) : filter;

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

                    var pindex = Math.floor(j / scale) % pattern.length;
                    this.matrix = pline && pattern[pindex] != 0 ? Buffer.concat([this.matrix, this.pixelcolor]) : Buffer.concat([this.matrix, this.transparent]);
                } else {

                    this.matrix = Buffer.concat([this.matrix, this.transparent]);
                }
            }
        }

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
        if (this.matrix != null) {
            this.matrix = this.zlib.deflateSync(this.matrix, {
                level: 9
            });
            // IDAT Chunk
            this.idat = Buffer.concat([new Buffer("IDAT", "binary"), new Buffer(this.matrix)]);

            this.idat = Buffer.concat([this.byte4(this.idat.length - 4), this.idat, this.byte4(this.crc32(this.idat))]);
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
        this.image = Buffer.concat([this.fromHex([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), this.ihdr, this.idat, this.iend]);
    };

    /**
     * Parse color from string.
     * 
     * @memberOf module:PngImage
     * 
     * @param {string} color - color as string.
     * Support hex color like #454545, web safe hex like #333, rgb(255, 143, 15) - red,  green, blue, rgba(255, 143, 15, 0.6) - red,  green, blue, alpha(transparency).
     * 
     * @returns {Buffer} - color for png image encoded as bytes.
     */


    PngImage.prototype.parseColor = function parseColor(color) {

        // transparent color
        var red = 0,
            green = 0,
            blue = 0,
            alpha = 0;

        var found = void 0;
        // Hex color like #454545
        if (found = color.match(/\#(\w{6}|\w{3})/)) {

            if (found[1].length == 6) {
                var _ref = [parseInt(found[1].substr(0, 2), 16), parseInt(found[1].substr(2, 2), 16), parseInt(found[1].substr(4, 2), 16)];
                red = _ref[0];
                green = _ref[1];
                blue = _ref[2];


                alpha = 255;
            } else if (found[1].length == 3) {
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
     * @returns {Buffer} - color encoded as bytes.
     */


    PngImage.prototype.color = function color(red, green, blue, alpha) {

        red = red != null && red >= 0 && red <= 255 ? red : 255;
        green = green != null && green >= 0 && green <= 255 ? green : 255;
        blue = blue != null && blue >= 0 && blue <= 255 ? blue : 255;
        alpha = alpha != null && alpha >= 0 && alpha <= 255 ? alpha : 255;

        return Buffer.concat([this.byte(red), this.byte(green), this.byte(blue), this.byte(alpha)]);
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
        this.fs.writeFile(filename, this.image, function (err) {
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


        // pre generated crc table.
        var crcTable = [0, 1996959894, -301047508, -1727442502, 124634137, 1886057615, -379345611, -1637575261, 249268274, 2044508324, -522852066, -1747789432, 162941995, 2125561021, -407360249, -1866523247, 498536548, 1789927666, -205950648, -2067906082, 450548861, 1843258603, -187386543, -2083289657, 325883990, 1684777152, -43845254, -1973040660, 335633487, 1661365465, -99664541, -1928851979, 997073096, 1281953886, -715111964, -1570279054, 1006888145, 1258607687, -770865667, -1526024853, 901097722, 1119000684, -608450090, -1396901568, 853044451, 1172266101, -589951537, -1412350631, 651767980, 1373503546, -925412992, -1076862698, 565507253, 1454621731, -809855591, -1195530993, 671266974, 1594198024, -972236366, -1324619484, 795835527, 1483230225, -1050600021, -1234817731, 1994146192, 31158534, -1731059524, -271249366, 1907459465, 112637215, -1614814043, -390540237, 2013776290, 251722036, -1777751922, -519137256, 2137656763, 141376813, -1855689577, -429695999, 1802195444, 476864866, -2056965928, -228458418, 1812370925, 453092731, -2113342271, -183516073, 1706088902, 314042704, -1950435094, -54949764, 1658658271, 366619977, -1932296973, -69972891, 1303535960, 984961486, -1547960204, -725929758, 1256170817, 1037604311, -1529756563, -740887301, 1131014506, 879679996, -1385723834, -631195440, 1141124467, 855842277, -1442165665, -586318647, 1342533948, 654459306, -1106571248, -921952122, 1466479909, 544179635, -1184443383, -832445281, 1591671054, 702138776, -1328506846, -942167884, 1504918807, 783551873, -1212326853, -1061524307, -306674912, -1698712650, 62317068, 1957810842, -355121351, -1647151185, 81470997, 1943803523, -480048366, -1805370492, 225274430, 2053790376, -468791541, -1828061283, 167816743, 2097651377, -267414716, -2029476910, 503444072, 1762050814, -144550051, -2140837941, 426522225, 1852507879, -19653770, -1982649376, 282753626, 1742555852, -105259153, -1900089351, 397917763, 1622183637, -690576408, -1580100738, 953729732, 1340076626, -776247311, -1497606297, 1068828381, 1219638859, -670225446, -1358292148, 906185462, 1090812512, -547295293, -1469587627, 829329135, 1181335161, -882789492, -1134132454, 628085408, 1382605366, -871598187, -1156888829, 570562233, 1426400815, -977650754, -1296233688, 733239954, 1555261956, -1026031705, -1244606671, 752459403, 1541320221, -1687895376, -328994266, 1969922972, 40735498, -1677130071, -351390145, 1913087877, 83908371, -1782625662, -491226604, 2075208622, 213261112, -1831694693, -438977011, 2094854071, 198958881, -2032938284, -237706686, 1759359992, 534414190, -2118248755, -155638181, 1873836001, 414664567, -2012718362, -15766928, 1711684554, 285281116, -1889165569, -127750551, 1634467795, 376229701, -1609899400, -686959890, 1308918612, 956543938, -1486412191, -799009033, 1231636301, 1047427035, -1362007478, -640263460, 1088359270, 936918000, -1447252397, -558129467, 1202900863, 817233897, -1111625188, -893730166, 1404277552, 615818150, -1160759803, -841546093, 1423857449, 601450431, -1285129682, -1000256840, 1567103746, 711928724, -1274298825, -1022587231, 1510334235, 755167117];

        // for (let j = 0; j < 256; j++) {
        // 	let c = j;
        // 	for (let k = 0; k < 8; k++) {
        // 		if (c & 1) {
        // 			c = -306674912 ^ (c >>> 1);
        // 		} else {
        // 			c = c >>> 1;
        // 		}
        // 	}
        // 	crcTable[j] = c;
        // }


        for (var i = 0; i < data.length; i++) {

            crc = crcTable[(crc ^ data[i]) & 0xff] ^ crc >>> 8;
        }

        crc = crc ^ -1;

        return crc;
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
     * Return bytes from input.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input value.
     * 
     * @returns {Buffer} - bytes.
     */


    PngImage.prototype.byte = function byte(data) {
        return new Buffer(String.fromCharCode(data), "binary");
    };

    /**
     * Return 2 bytes value from input.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input value.
     * 
     * @returns {Buffer} - 2 bytes.
     */

    PngImage.prototype.byte2 = function byte2(data) {
        return new Buffer(String.fromCharCode(data >> 8 & 255, data & 255), "binary");
    };
    /**
     * Return 4 bytes value from input.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input value.
     * 
     * @returns {Buffer} - 4 bytes.
     */


    PngImage.prototype.byte4 = function byte4(data) {
        return new Buffer(String.fromCharCode(data >> 24 & 255, data >> 16 & 255, data >> 8 & 255, data & 255), "binary");
    };

    /**
     * Return 2 lsb(least significant bit) bytes value from input.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input value.
     * 
     * @returns {Buffer} - 2 lsb bytes.
     */


    PngImage.prototype.byte2lsb = function byte2lsb(data) {
        return new Buffer(String.fromCharCode(data & 255, data >> 8 & 255), "binary");
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBuZ0ltYWdlLmVzNiJdLCJuYW1lcyI6WyJQbmdJbWFnZSIsImRlcHRoIiwiY29sb3J0eXBlIiwiemxpYiIsInJlcXVpcmUiLCJmcyIsInBhcnNlSW50IiwidHJhbnNwYXJlbnQiLCJjb2xvciIsImllbmQiLCJCdWZmZXIiLCJjb25jYXQiLCJieXRlNCIsImZyb21IZXgiLCJzZXRJSERSIiwiaGVpZ2h0Iiwid2lkdGgiLCJpaGRyIiwiYnl0ZSIsImNyYzMyIiwicnVsZXJNYXRyaXgiLCJwYXR0ZXJuIiwidGhpY2tuZXNzIiwic2NhbGUiLCJNYXRoIiwicm91bmQiLCJsZW5ndGgiLCJmaWx0ZXIiLCJwaXhlbGNvbG9yIiwicGFyc2VDb2xvciIsInBhdHRlcm5IZWlnaHQiLCJmbG9vciIsInJlbWFpbmRlciIsImJvdHRvbSIsIm1hdHJpeCIsInBsaW5lIiwiaSIsImoiLCJwaW5kZXgiLCJtYWtlSURBVCIsImRlZmxhdGVTeW5jIiwibGV2ZWwiLCJpZGF0IiwibWFrZUltYWdlIiwiaW1hZ2UiLCJyZWQiLCJncmVlbiIsImJsdWUiLCJhbHBoYSIsImZvdW5kIiwibWF0Y2giLCJzdWJzdHIiLCJyYyIsImdjIiwiYmMiLCJzcGxpdCIsImdldEJhc2U2NCIsImJhc2U2NCIsImdldEZpbGUiLCJmaWxlbmFtZSIsIndyaXRlRmlsZSIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJhZGxlcjMyIiwiZGF0YSIsIkJBU0UiLCJOTUFYIiwiczEiLCJzMiIsIm4iLCJjcmMiLCJjcmNUYWJsZSIsImhleCIsInRvU3RyaW5nIiwiZnJvbUJhc2U2NCIsImZyb20iLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJieXRlMiIsImJ5dGUybHNiIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7Ozs7Ozs7Ozs7SUFZTUEsUTs7QUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkEsd0JBQXNDO0FBQUEsWUFBMUJDLEtBQTBCLHVFQUFsQixDQUFrQjtBQUFBLFlBQWZDLFNBQWUsdUVBQUgsQ0FBRzs7QUFBQTs7QUFFbEMsYUFBS0MsSUFBTCxHQUFZQyxRQUFRLE1BQVIsQ0FBWjtBQUNBLGFBQUtDLEVBQUwsR0FBVUQsUUFBUSxJQUFSLENBQVY7O0FBRUEsYUFBS0gsS0FBTCxHQUFhSyxTQUFTTCxLQUFULENBQWI7QUFDQSxhQUFLQyxTQUFMLEdBQWlCSSxTQUFTSixTQUFULENBQWpCO0FBQ0EsYUFBS0ssV0FBTCxHQUFtQixLQUFLQyxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQWQsRUFBaUIsQ0FBakIsRUFBb0IsQ0FBcEIsQ0FBbkIsQ0FQa0MsQ0FPUztBQUMzQztBQUNBLGFBQUtDLElBQUwsR0FBWUMsT0FBT0MsTUFBUCxDQUFjLENBQUMsS0FBS0MsS0FBTCxDQUFXLENBQVgsQ0FBRCxFQUFnQixJQUFJRixNQUFKLENBQVcsTUFBWCxFQUFtQixRQUFuQixDQUFoQixFQUE4QyxLQUFLRyxPQUFMLENBQWEsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLElBQWIsRUFBbUIsSUFBbkIsQ0FBYixDQUE5QyxDQUFkLENBQVo7QUFFSDs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1QkFvQkFDLE8sc0JBQStCO0FBQUEsWUFBdkJDLE1BQXVCLHVFQUFkLENBQWM7QUFBQSxZQUFYQyxLQUFXLHVFQUFILENBQUc7OztBQUUzQixhQUFLRCxNQUFMLEdBQWNULFNBQVNTLE1BQVQsQ0FBZDtBQUNBLGFBQUtDLEtBQUwsR0FBYVYsU0FBU1UsS0FBVCxDQUFiO0FBQ0E7QUFDQSxhQUFLQyxJQUFMLEdBQVlQLE9BQU9DLE1BQVAsQ0FBYyxDQUFDLElBQUlELE1BQUosQ0FBVyxNQUFYLEVBQW1CLFFBQW5CLENBQUQsRUFBK0IsS0FBS0UsS0FBTCxDQUFXLEtBQUtJLEtBQWhCLENBQS9CLEVBQXVELEtBQUtKLEtBQUwsQ0FBVyxLQUFLRyxNQUFoQixDQUF2RCxDQUFkLENBQVo7QUFDQSxhQUFLRSxJQUFMLEdBQVlQLE9BQU9DLE1BQVAsQ0FBYyxDQUFDLEtBQUtNLElBQU4sRUFBWSxLQUFLQyxJQUFMLENBQVUsS0FBS2pCLEtBQWYsQ0FBWixFQUFtQyxLQUFLaUIsSUFBTCxDQUFVLEtBQUtoQixTQUFmLENBQW5DLEVBQThELEtBQUtXLE9BQUwsQ0FBYSxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsSUFBYixDQUFiLENBQTlELENBQWQsQ0FBWjtBQUNBLGFBQUtJLElBQUwsR0FBWVAsT0FBT0MsTUFBUCxDQUFjLENBQUMsS0FBS0MsS0FBTCxDQUFXLEVBQVgsQ0FBRCxFQUFpQixLQUFLSyxJQUF0QixFQUE0QixLQUFLTCxLQUFMLENBQVcsS0FBS08sS0FBTCxDQUFXLEtBQUtGLElBQWhCLENBQVgsQ0FBNUIsQ0FBZCxDQUFaO0FBRUgsSzs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBcUJBRyxXLHdCQUFZTCxNLEVBQVFQLEssRUFBT2EsTyxFQUFtQztBQUFBLFlBQTFCQyxTQUEwQix1RUFBZCxDQUFjO0FBQUEsWUFBWEMsS0FBVyx1RUFBSCxDQUFHOzs7QUFFMURBLGdCQUFRakIsU0FBU2lCLEtBQVQsQ0FBUjs7QUFFQSxhQUFLVCxPQUFMLENBQWFVLEtBQUtDLEtBQUwsQ0FBV1YsU0FBU1EsS0FBcEIsQ0FBYixFQUF5Q0MsS0FBS0MsS0FBTCxDQUFXSixRQUFRSyxNQUFSLEdBQWlCSCxLQUE1QixDQUF6Qzs7QUFFQTtBQUNBRCxvQkFBWWhCLFNBQVNnQixTQUFULENBQVo7O0FBRUFBLG9CQUFZQSxZQUFZQyxLQUF4QjtBQUNBOztBQUVBLFlBQUlJLFNBQVMsS0FBS1QsSUFBTCxDQUFVLENBQVYsQ0FBYjs7QUFFQSxhQUFLVSxVQUFMLEdBQWtCLEtBQUtDLFVBQUwsQ0FBZ0JyQixLQUFoQixDQUFsQjs7QUFFQSxZQUFJc0IsZ0JBQWdCTixLQUFLTyxLQUFMLENBQVdULFlBQVksQ0FBdkIsQ0FBcEI7O0FBRUEsWUFBSVUsWUFBWVYsWUFBWSxDQUE1Qjs7QUFFQSxZQUFJVyxTQUFTLEtBQUtsQixNQUFMLEdBQWNlLGFBQWQsR0FBOEJFLFNBQTNDOztBQUVBO0FBQ0EsYUFBS0UsTUFBTCxHQUFjLElBQWQ7O0FBRUEsWUFBSUMsUUFBUSxLQUFaOztBQUVBO0FBQ0EsYUFBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUksS0FBS3JCLE1BQXpCLEVBQWlDcUIsR0FBakMsRUFBc0M7O0FBRWxDO0FBQ0EsaUJBQUtGLE1BQUwsR0FBYyxLQUFLQSxNQUFMLElBQWUsSUFBZixHQUFzQnhCLE9BQU9DLE1BQVAsQ0FBYyxDQUFDLEtBQUt1QixNQUFOLEVBQWNQLE1BQWQsQ0FBZCxDQUF0QixHQUE2REEsTUFBM0U7O0FBRUE7QUFDQSxnQkFBSVMsSUFBSU4sYUFBSixJQUFxQk0sS0FBS0gsTUFBOUIsRUFBc0M7QUFDbENFLHdCQUFRLElBQVI7QUFDSCxhQUZELE1BRU87QUFDSEEsd0JBQVEsS0FBUjtBQUNIOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpQkFBSyxJQUFJRSxJQUFJLENBQWIsRUFBZ0JBLElBQUksS0FBS3JCLEtBQXpCLEVBQWdDcUIsR0FBaEMsRUFBcUM7O0FBRWpDLG9CQUFJRixLQUFKLEVBQVc7O0FBRVAsd0JBQUlHLFNBQVNkLEtBQUtPLEtBQUwsQ0FBV00sSUFBSWQsS0FBZixJQUF3QkYsUUFBUUssTUFBN0M7QUFDQSx5QkFBS1EsTUFBTCxHQUFlQyxTQUFTZCxRQUFRaUIsTUFBUixLQUFtQixDQUE3QixHQUFrQzVCLE9BQU9DLE1BQVAsQ0FBYyxDQUFDLEtBQUt1QixNQUFOLEVBQWMsS0FBS04sVUFBbkIsQ0FBZCxDQUFsQyxHQUFrRmxCLE9BQU9DLE1BQVAsQ0FBYyxDQUFDLEtBQUt1QixNQUFOLEVBQWMsS0FBSzNCLFdBQW5CLENBQWQsQ0FBaEc7QUFFSCxpQkFMRCxNQUtPOztBQUVILHlCQUFLMkIsTUFBTCxHQUFjeEIsT0FBT0MsTUFBUCxDQUFjLENBQUMsS0FBS3VCLE1BQU4sRUFBYyxLQUFLM0IsV0FBbkIsQ0FBZCxDQUFkO0FBRUg7QUFDSjtBQUNKOztBQUVELGFBQUtnQyxRQUFMO0FBQ0gsSzs7QUFFRDs7Ozs7Ozs7OztBQVlBOzs7Ozs7dUJBTUFBLFEsdUJBQVc7QUFDUCxZQUFJLEtBQUtMLE1BQUwsSUFBZSxJQUFuQixFQUF5QjtBQUNyQixpQkFBS0EsTUFBTCxHQUFjLEtBQUsvQixJQUFMLENBQVVxQyxXQUFWLENBQXNCLEtBQUtOLE1BQTNCLEVBQW1DO0FBQzdDTyx1QkFBTztBQURzQyxhQUFuQyxDQUFkO0FBR0E7QUFDQSxpQkFBS0MsSUFBTCxHQUFZaEMsT0FBT0MsTUFBUCxDQUFjLENBQUMsSUFBSUQsTUFBSixDQUFXLE1BQVgsRUFBbUIsUUFBbkIsQ0FBRCxFQUErQixJQUFJQSxNQUFKLENBQVcsS0FBS3dCLE1BQWhCLENBQS9CLENBQWQsQ0FBWjs7QUFFQSxpQkFBS1EsSUFBTCxHQUFZaEMsT0FBT0MsTUFBUCxDQUFjLENBQUMsS0FBS0MsS0FBTCxDQUFXLEtBQUs4QixJQUFMLENBQVVoQixNQUFWLEdBQW1CLENBQTlCLENBQUQsRUFBbUMsS0FBS2dCLElBQXhDLEVBQThDLEtBQUs5QixLQUFMLENBQVcsS0FBS08sS0FBTCxDQUFXLEtBQUt1QixJQUFoQixDQUFYLENBQTlDLENBQWQsQ0FBWjtBQUNIO0FBRUosSzs7QUFFRDs7Ozs7Ozs7dUJBTUFDLFMsd0JBQVk7QUFDUjtBQUNBLGFBQUtDLEtBQUwsR0FBYWxDLE9BQU9DLE1BQVAsQ0FBYyxDQUFDLEtBQUtFLE9BQUwsQ0FBYSxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsSUFBYixFQUFtQixJQUFuQixFQUF5QixJQUF6QixFQUErQixJQUEvQixFQUFxQyxJQUFyQyxFQUEyQyxJQUEzQyxDQUFiLENBQUQsRUFBaUUsS0FBS0ksSUFBdEUsRUFBNEUsS0FBS3lCLElBQWpGLEVBQXVGLEtBQUtqQyxJQUE1RixDQUFkLENBQWI7QUFFSCxLOztBQUVEOzs7Ozs7Ozs7Ozs7dUJBVUFvQixVLHVCQUFXckIsSyxFQUFPOztBQUVkO0FBRmMsWUFHVHFDLEdBSFMsR0FHbUIsQ0FIbkI7QUFBQSxZQUdKQyxLQUhJLEdBR3NCLENBSHRCO0FBQUEsWUFHR0MsSUFISCxHQUd5QixDQUh6QjtBQUFBLFlBR1NDLEtBSFQsR0FHNEIsQ0FINUI7O0FBSWQsWUFBSUMsY0FBSjtBQUNBO0FBQ0EsWUFBS0EsUUFBUXpDLE1BQU0wQyxLQUFOLENBQVksaUJBQVosQ0FBYixFQUE4Qzs7QUFFMUMsZ0JBQUlELE1BQU0sQ0FBTixFQUFTdkIsTUFBVCxJQUFtQixDQUF2QixFQUEwQjtBQUFBLDJCQUVELENBQ2pCcEIsU0FBUzJDLE1BQU0sQ0FBTixFQUFTRSxNQUFULENBQWdCLENBQWhCLEVBQW1CLENBQW5CLENBQVQsRUFBZ0MsRUFBaEMsQ0FEaUIsRUFFakI3QyxTQUFTMkMsTUFBTSxDQUFOLEVBQVNFLE1BQVQsQ0FBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkIsQ0FBVCxFQUFnQyxFQUFoQyxDQUZpQixFQUdqQjdDLFNBQVMyQyxNQUFNLENBQU4sRUFBU0UsTUFBVCxDQUFnQixDQUFoQixFQUFtQixDQUFuQixDQUFULEVBQWdDLEVBQWhDLENBSGlCLENBRkM7QUFFckJOLG1CQUZxQjtBQUVoQkMscUJBRmdCO0FBRVRDLG9CQUZTOzs7QUFRdEJDLHdCQUFRLEdBQVI7QUFDSCxhQVRELE1BU08sSUFBSUMsTUFBTSxDQUFOLEVBQVN2QixNQUFULElBQW1CLENBQXZCLEVBQTBCO0FBQzdCO0FBQ0Esb0JBQUkwQixLQUFLSCxNQUFNLENBQU4sRUFBU0UsTUFBVCxDQUFnQixDQUFoQixFQUFtQixDQUFuQixDQUFUO0FBQ0Esb0JBQUlFLEtBQUtKLE1BQU0sQ0FBTixFQUFTRSxNQUFULENBQWdCLENBQWhCLEVBQW1CLENBQW5CLENBQVQ7QUFDQSxvQkFBSUcsS0FBS0wsTUFBTSxDQUFOLEVBQVNFLE1BQVQsQ0FBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkIsQ0FBVDs7QUFFQUMscUJBQUtBLEtBQUtBLEVBQVY7QUFDQUMscUJBQUtBLEtBQUtBLEVBQVY7QUFDQUMscUJBQUtBLEtBQUtBLEVBQVY7O0FBUjZCLDRCQVVSLENBQ2pCaEQsU0FBUzhDLEVBQVQsRUFBYSxFQUFiLENBRGlCLEVBRWpCOUMsU0FBUytDLEVBQVQsRUFBYSxFQUFiLENBRmlCLEVBR2pCL0MsU0FBU2dELEVBQVQsRUFBYSxFQUFiLENBSGlCLENBVlE7QUFVNUJULG1CQVY0QjtBQVV2QkMscUJBVnVCO0FBVWhCQyxvQkFWZ0I7OztBQWdCN0JDLHdCQUFRLEdBQVI7QUFDSDs7QUFFRDtBQUNILFNBL0JELE1BK0JPLElBQUtDLFFBQVF6QyxNQUFNMEMsS0FBTixDQUFZLGdCQUFaLENBQWIsRUFBNkM7QUFBQSxpQ0FFcEJELE1BQU0sQ0FBTixFQUFTTSxLQUFULENBQWUsV0FBZixDQUZvQjs7QUFFL0NWLGVBRitDO0FBRTFDQyxpQkFGMEM7QUFFbkNDLGdCQUZtQztBQUU3QkMsaUJBRjZCOztBQUdoREEsb0JBQVNBLFNBQVMsSUFBVCxJQUFpQkEsUUFBUSxDQUExQixHQUErQnhCLEtBQUtDLEtBQUwsQ0FBV3VCLFFBQVEsR0FBbkIsQ0FBL0IsR0FBeUQsR0FBakU7QUFFSDs7QUFFRCxlQUFPLEtBQUt4QyxLQUFMLENBQVdxQyxHQUFYLEVBQWdCQyxLQUFoQixFQUF1QkMsSUFBdkIsRUFBNkJDLEtBQTdCLENBQVA7QUFDSCxLOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7O3VCQWNBeEMsSyxrQkFBTXFDLEcsRUFBS0MsSyxFQUFPQyxJLEVBQU1DLEssRUFBTzs7QUFFM0JILGNBQU9BLE9BQU8sSUFBUCxJQUFlQSxPQUFPLENBQXRCLElBQTJCQSxPQUFPLEdBQW5DLEdBQTBDQSxHQUExQyxHQUFnRCxHQUF0RDtBQUNBQyxnQkFBU0EsU0FBUyxJQUFULElBQWlCQSxTQUFTLENBQTFCLElBQStCQSxTQUFTLEdBQXpDLEdBQWdEQSxLQUFoRCxHQUF3RCxHQUFoRTtBQUNBQyxlQUFRQSxRQUFRLElBQVIsSUFBZ0JBLFFBQVEsQ0FBeEIsSUFBNkJBLFFBQVEsR0FBdEMsR0FBNkNBLElBQTdDLEdBQW9ELEdBQTNEO0FBQ0FDLGdCQUFTQSxTQUFTLElBQVQsSUFBaUJBLFNBQVMsQ0FBMUIsSUFBK0JBLFNBQVMsR0FBekMsR0FBZ0RBLEtBQWhELEdBQXdELEdBQWhFOztBQUVBLGVBQU90QyxPQUFPQyxNQUFQLENBQWMsQ0FBQyxLQUFLTyxJQUFMLENBQVUyQixHQUFWLENBQUQsRUFBaUIsS0FBSzNCLElBQUwsQ0FBVTRCLEtBQVYsQ0FBakIsRUFBbUMsS0FBSzVCLElBQUwsQ0FBVTZCLElBQVYsQ0FBbkMsRUFBb0QsS0FBSzdCLElBQUwsQ0FBVThCLEtBQVYsQ0FBcEQsQ0FBZCxDQUFQO0FBQ0gsSzs7QUFFRDs7Ozs7Ozs7O3VCQU9BUSxTLHdCQUFZO0FBQ1IsYUFBS2IsU0FBTDtBQUNBLGVBQU8sS0FBS2MsTUFBTCxDQUFZLEtBQUtiLEtBQWpCLENBQVA7QUFDSCxLOztBQUVEOzs7Ozs7Ozs7dUJBT0FjLE8sb0JBQVFDLFEsRUFBVTtBQUNkLGFBQUtoQixTQUFMO0FBQ0EsYUFBS3RDLEVBQUwsQ0FBUXVELFNBQVIsQ0FBa0JELFFBQWxCLEVBQTRCLEtBQUtmLEtBQWpDLEVBQXdDLFVBQUNpQixHQUFELEVBQVM7QUFDN0MsZ0JBQUlBLEdBQUosRUFBUztBQUNMLHVCQUFPQyxRQUFRQyxHQUFSLENBQVlGLEdBQVosQ0FBUDtBQUNIO0FBQ0RDLG9CQUFRQyxHQUFSLENBQVksU0FBU0osUUFBVCxHQUFvQixhQUFoQztBQUNILFNBTEQ7QUFNSCxLOztBQUVEOzs7Ozs7Ozs7Ozt1QkFTQUssTyxvQkFBUUMsSSxFQUFNOztBQUVWLFlBQUlDLE9BQU8sS0FBWDtBQUFBLFlBQ0lDLE9BQU8sSUFEWDtBQUFBLFlBRUlDLEtBQUssQ0FGVDtBQUFBLFlBR0lDLEtBQUssQ0FIVDtBQUFBLFlBSUlDLElBQUlILElBSlI7O0FBTUEsYUFBSyxJQUFJL0IsSUFBSSxDQUFiLEVBQWdCQSxJQUFJNkIsS0FBS3ZDLE1BQXpCLEVBQWlDVSxHQUFqQyxFQUFzQztBQUNsQ2dDLGtCQUFNSCxLQUFLN0IsQ0FBTCxDQUFOO0FBQ0FpQyxrQkFBTUQsRUFBTjtBQUNBLGdCQUFJLENBQUNFLEtBQUssQ0FBTixLQUFZLENBQWhCLEVBQW1CO0FBQ2ZGLHNCQUFNRixJQUFOO0FBQ0FHLHNCQUFNSCxJQUFOO0FBQ0FJLG9CQUFJSCxJQUFKO0FBQ0g7QUFDSjs7QUFFREMsY0FBTUYsSUFBTjtBQUNBRyxjQUFNSCxJQUFOOztBQUVBLGVBQVFHLE1BQU0sRUFBUCxHQUFhRCxFQUFwQjtBQUNILEs7O0FBRUQ7Ozs7Ozs7Ozs7Ozt1QkFVQWpELEssa0JBQU04QyxJLEVBQWdCO0FBQUEsWUFBVk0sR0FBVSx1RUFBSixDQUFDLENBQUc7OztBQUVsQjtBQUNBLFlBQUlDLFdBQVcsQ0FBQyxDQUFELEVBQUksVUFBSixFQUFnQixDQUFDLFNBQWpCLEVBQTRCLENBQUMsVUFBN0IsRUFBeUMsU0FBekMsRUFBb0QsVUFBcEQsRUFBZ0UsQ0FBQyxTQUFqRSxFQUE0RSxDQUFDLFVBQTdFLEVBQXlGLFNBQXpGLEVBQW9HLFVBQXBHLEVBQWdILENBQUMsU0FBakgsRUFBNEgsQ0FBQyxVQUE3SCxFQUF5SSxTQUF6SSxFQUFvSixVQUFwSixFQUFnSyxDQUFDLFNBQWpLLEVBQTRLLENBQUMsVUFBN0ssRUFBeUwsU0FBekwsRUFBb00sVUFBcE0sRUFBZ04sQ0FBQyxTQUFqTixFQUE0TixDQUFDLFVBQTdOLEVBQXlPLFNBQXpPLEVBQW9QLFVBQXBQLEVBQWdRLENBQUMsU0FBalEsRUFBNFEsQ0FBQyxVQUE3USxFQUF5UixTQUF6UixFQUFvUyxVQUFwUyxFQUFnVCxDQUFDLFFBQWpULEVBQTJULENBQUMsVUFBNVQsRUFBd1UsU0FBeFUsRUFBbVYsVUFBblYsRUFBK1YsQ0FBQyxRQUFoVyxFQUEwVyxDQUFDLFVBQTNXLEVBQXVYLFNBQXZYLEVBQWtZLFVBQWxZLEVBQThZLENBQUMsU0FBL1ksRUFBMFosQ0FBQyxVQUEzWixFQUF1YSxVQUF2YSxFQUFtYixVQUFuYixFQUErYixDQUFDLFNBQWhjLEVBQTJjLENBQUMsVUFBNWMsRUFBd2QsU0FBeGQsRUFBbWUsVUFBbmUsRUFBK2UsQ0FBQyxTQUFoZixFQUEyZixDQUFDLFVBQTVmLEVBQXdnQixTQUF4Z0IsRUFBbWhCLFVBQW5oQixFQUEraEIsQ0FBQyxTQUFoaUIsRUFBMmlCLENBQUMsVUFBNWlCLEVBQXdqQixTQUF4akIsRUFBbWtCLFVBQW5rQixFQUEra0IsQ0FBQyxTQUFobEIsRUFBMmxCLENBQUMsVUFBNWxCLEVBQXdtQixTQUF4bUIsRUFBbW5CLFVBQW5uQixFQUErbkIsQ0FBQyxTQUFob0IsRUFBMm9CLENBQUMsVUFBNW9CLEVBQXdwQixTQUF4cEIsRUFBbXFCLFVBQW5xQixFQUErcUIsQ0FBQyxTQUFockIsRUFBMnJCLENBQUMsVUFBNXJCLEVBQXdzQixTQUF4c0IsRUFBbXRCLFVBQW50QixFQUErdEIsQ0FBQyxVQUFodUIsRUFBNHVCLENBQUMsVUFBN3VCLEVBQXl2QixVQUF6dkIsRUFBcXdCLFFBQXJ3QixFQUErd0IsQ0FBQyxVQUFoeEIsRUFBNHhCLENBQUMsU0FBN3hCLEVBQXd5QixVQUF4eUIsRUFBb3pCLFNBQXB6QixFQUErekIsQ0FBQyxVQUFoMEIsRUFBNDBCLENBQUMsU0FBNzBCLEVBQXcxQixVQUF4MUIsRUFBbzJCLFNBQXAyQixFQUErMkIsQ0FBQyxVQUFoM0IsRUFBNDNCLENBQUMsU0FBNzNCLEVBQXc0QixVQUF4NEIsRUFBbzVCLFNBQXA1QixFQUErNUIsQ0FBQyxVQUFoNkIsRUFBNDZCLENBQUMsU0FBNzZCLEVBQXc3QixVQUF4N0IsRUFBbzhCLFNBQXA4QixFQUErOEIsQ0FBQyxVQUFoOUIsRUFBNDlCLENBQUMsU0FBNzlCLEVBQXcrQixVQUF4K0IsRUFBby9CLFNBQXAvQixFQUErL0IsQ0FBQyxVQUFoZ0MsRUFBNGdDLENBQUMsU0FBN2dDLEVBQXdoQyxVQUF4aEMsRUFBb2lDLFNBQXBpQyxFQUEraUMsQ0FBQyxVQUFoakMsRUFBNGpDLENBQUMsUUFBN2pDLEVBQXVrQyxVQUF2a0MsRUFBbWxDLFNBQW5sQyxFQUE4bEMsQ0FBQyxVQUEvbEMsRUFBMm1DLENBQUMsUUFBNW1DLEVBQXNuQyxVQUF0bkMsRUFBa29DLFNBQWxvQyxFQUE2b0MsQ0FBQyxVQUE5b0MsRUFBMHBDLENBQUMsU0FBM3BDLEVBQXNxQyxVQUF0cUMsRUFBa3JDLFVBQWxyQyxFQUE4ckMsQ0FBQyxVQUEvckMsRUFBMnNDLENBQUMsU0FBNXNDLEVBQXV0QyxVQUF2dEMsRUFBbXVDLFNBQW51QyxFQUE4dUMsQ0FBQyxVQUEvdUMsRUFBMnZDLENBQUMsU0FBNXZDLEVBQXV3QyxVQUF2d0MsRUFBbXhDLFNBQW54QyxFQUE4eEMsQ0FBQyxVQUEveEMsRUFBMnlDLENBQUMsU0FBNXlDLEVBQXV6QyxVQUF2ekMsRUFBbTBDLFNBQW4wQyxFQUE4MEMsQ0FBQyxVQUEvMEMsRUFBMjFDLENBQUMsU0FBNTFDLEVBQXUyQyxVQUF2MkMsRUFBbTNDLFNBQW4zQyxFQUE4M0MsQ0FBQyxVQUEvM0MsRUFBMjRDLENBQUMsU0FBNTRDLEVBQXU1QyxVQUF2NUMsRUFBbTZDLFNBQW42QyxFQUE4NkMsQ0FBQyxVQUEvNkMsRUFBMjdDLENBQUMsU0FBNTdDLEVBQXU4QyxVQUF2OEMsRUFBbTlDLFNBQW45QyxFQUE4OUMsQ0FBQyxVQUEvOUMsRUFBMitDLENBQUMsVUFBNStDLEVBQXcvQyxDQUFDLFNBQXovQyxFQUFvZ0QsQ0FBQyxVQUFyZ0QsRUFBaWhELFFBQWpoRCxFQUEyaEQsVUFBM2hELEVBQXVpRCxDQUFDLFNBQXhpRCxFQUFtakQsQ0FBQyxVQUFwakQsRUFBZ2tELFFBQWhrRCxFQUEwa0QsVUFBMWtELEVBQXNsRCxDQUFDLFNBQXZsRCxFQUFrbUQsQ0FBQyxVQUFubUQsRUFBK21ELFNBQS9tRCxFQUEwbkQsVUFBMW5ELEVBQXNvRCxDQUFDLFNBQXZvRCxFQUFrcEQsQ0FBQyxVQUFucEQsRUFBK3BELFNBQS9wRCxFQUEwcUQsVUFBMXFELEVBQXNyRCxDQUFDLFNBQXZyRCxFQUFrc0QsQ0FBQyxVQUFuc0QsRUFBK3NELFNBQS9zRCxFQUEwdEQsVUFBMXRELEVBQXN1RCxDQUFDLFNBQXZ1RCxFQUFrdkQsQ0FBQyxVQUFudkQsRUFBK3ZELFNBQS92RCxFQUEwd0QsVUFBMXdELEVBQXN4RCxDQUFDLFFBQXZ4RCxFQUFpeUQsQ0FBQyxVQUFseUQsRUFBOHlELFNBQTl5RCxFQUF5ekQsVUFBenpELEVBQXEwRCxDQUFDLFNBQXQwRCxFQUFpMUQsQ0FBQyxVQUFsMUQsRUFBODFELFNBQTkxRCxFQUF5MkQsVUFBejJELEVBQXEzRCxDQUFDLFNBQXQzRCxFQUFpNEQsQ0FBQyxVQUFsNEQsRUFBODRELFNBQTk0RCxFQUF5NUQsVUFBejVELEVBQXE2RCxDQUFDLFNBQXQ2RCxFQUFpN0QsQ0FBQyxVQUFsN0QsRUFBODdELFVBQTk3RCxFQUEwOEQsVUFBMThELEVBQXM5RCxDQUFDLFNBQXY5RCxFQUFrK0QsQ0FBQyxVQUFuK0QsRUFBKytELFNBQS8rRCxFQUEwL0QsVUFBMS9ELEVBQXNnRSxDQUFDLFNBQXZnRSxFQUFraEUsQ0FBQyxVQUFuaEUsRUFBK2hFLFNBQS9oRSxFQUEwaUUsVUFBMWlFLEVBQXNqRSxDQUFDLFNBQXZqRSxFQUFra0UsQ0FBQyxVQUFua0UsRUFBK2tFLFNBQS9rRSxFQUEwbEUsVUFBMWxFLEVBQXNtRSxDQUFDLFNBQXZtRSxFQUFrbkUsQ0FBQyxVQUFubkUsRUFBK25FLFNBQS9uRSxFQUEwb0UsVUFBMW9FLEVBQXNwRSxDQUFDLFNBQXZwRSxFQUFrcUUsQ0FBQyxVQUFucUUsRUFBK3FFLFNBQS9xRSxFQUEwckUsVUFBMXJFLEVBQXNzRSxDQUFDLFVBQXZzRSxFQUFtdEUsQ0FBQyxVQUFwdEUsRUFBZ3VFLFNBQWh1RSxFQUEydUUsVUFBM3VFLEVBQXV2RSxDQUFDLFVBQXh2RSxFQUFvd0UsQ0FBQyxTQUFyd0UsRUFBZ3hFLFVBQWh4RSxFQUE0eEUsUUFBNXhFLEVBQXN5RSxDQUFDLFVBQXZ5RSxFQUFtekUsQ0FBQyxTQUFwekUsRUFBK3pFLFVBQS96RSxFQUEyMEUsUUFBMzBFLEVBQXExRSxDQUFDLFVBQXQxRSxFQUFrMkUsQ0FBQyxTQUFuMkUsRUFBODJFLFVBQTkyRSxFQUEwM0UsU0FBMTNFLEVBQXE0RSxDQUFDLFVBQXQ0RSxFQUFrNUUsQ0FBQyxTQUFuNUUsRUFBODVFLFVBQTk1RSxFQUEwNkUsU0FBMTZFLEVBQXE3RSxDQUFDLFVBQXQ3RSxFQUFrOEUsQ0FBQyxTQUFuOEUsRUFBODhFLFVBQTk4RSxFQUEwOUUsU0FBMTlFLEVBQXErRSxDQUFDLFVBQXQrRSxFQUFrL0UsQ0FBQyxTQUFuL0UsRUFBOC9FLFVBQTkvRSxFQUEwZ0YsU0FBMWdGLEVBQXFoRixDQUFDLFVBQXRoRixFQUFraUYsQ0FBQyxRQUFuaUYsRUFBNmlGLFVBQTdpRixFQUF5akYsU0FBempGLEVBQW9rRixDQUFDLFVBQXJrRixFQUFpbEYsQ0FBQyxTQUFsbEYsRUFBNmxGLFVBQTdsRixFQUF5bUYsU0FBem1GLEVBQW9uRixDQUFDLFVBQXJuRixFQUFpb0YsQ0FBQyxTQUFsb0YsRUFBNm9GLFVBQTdvRixFQUF5cEYsU0FBenBGLEVBQW9xRixDQUFDLFVBQXJxRixFQUFpckYsQ0FBQyxTQUFsckYsRUFBNnJGLFVBQTdyRixFQUF5c0YsVUFBenNGLEVBQXF0RixDQUFDLFVBQXR0RixFQUFrdUYsQ0FBQyxTQUFudUYsRUFBOHVGLFVBQTl1RixFQUEwdkYsU0FBMXZGLEVBQXF3RixDQUFDLFVBQXR3RixFQUFreEYsQ0FBQyxTQUFueEYsRUFBOHhGLFVBQTl4RixFQUEweUYsU0FBMXlGLEVBQXF6RixDQUFDLFVBQXR6RixFQUFrMEYsQ0FBQyxTQUFuMEYsRUFBODBGLFVBQTkwRixFQUEwMUYsU0FBMTFGLEVBQXEyRixDQUFDLFVBQXQyRixFQUFrM0YsQ0FBQyxTQUFuM0YsRUFBODNGLFVBQTkzRixFQUEwNEYsU0FBMTRGLEVBQXE1RixDQUFDLFVBQXQ1RixFQUFrNkYsQ0FBQyxVQUFuNkYsRUFBKzZGLFVBQS82RixFQUEyN0YsU0FBMzdGLEVBQXM4RixDQUFDLFVBQXY4RixFQUFtOUYsQ0FBQyxVQUFwOUYsRUFBZytGLFVBQWgrRixFQUE0K0YsU0FBNStGLENBQWY7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0EsYUFBSyxJQUFJcEMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJNkIsS0FBS3ZDLE1BQXpCLEVBQWlDVSxHQUFqQyxFQUFzQzs7QUFFbENtQyxrQkFBTUMsU0FBUyxDQUFDRCxNQUFNTixLQUFLN0IsQ0FBTCxDQUFQLElBQWtCLElBQTNCLElBQW9DbUMsUUFBUSxDQUFsRDtBQUVIOztBQUVEQSxjQUFNQSxNQUFNLENBQUMsQ0FBYjs7QUFFQSxlQUFPQSxHQUFQO0FBQ0gsSzs7QUFFRDs7Ozs7Ozs7Ozs7dUJBU0FFLEcsZ0JBQUlSLEksRUFBTTtBQUNOLGVBQU8sSUFBSXZELE1BQUosQ0FBV3VELElBQVgsRUFBaUIsUUFBakIsRUFBMkJTLFFBQTNCLENBQW9DLEtBQXBDLENBQVA7QUFDSCxLOztBQUVEOzs7Ozs7Ozs7Ozt1QkFTQTdELE8sb0JBQVFvRCxJLEVBQU07QUFDVixlQUFPLElBQUl2RCxNQUFKLENBQVd1RCxJQUFYLEVBQWlCLEtBQWpCLENBQVA7QUFDSCxLOztBQUVEOzs7Ozs7Ozs7Ozt1QkFTQVIsTSxtQkFBT1EsSSxFQUFNO0FBQ1QsZUFBTyxJQUFJdkQsTUFBSixDQUFXdUQsSUFBWCxFQUFpQlMsUUFBakIsQ0FBMEIsUUFBMUIsQ0FBUDtBQUNILEs7O0FBRUQ7Ozs7Ozs7Ozs7O3VCQVNBQyxVLHVCQUFXVixJLEVBQU07QUFDYixlQUFPdkQsT0FBT2tFLElBQVAsQ0FBWVgsSUFBWixFQUFrQixRQUFsQixDQUFQO0FBQ0gsSzs7QUFFRDs7Ozs7Ozs7Ozs7dUJBU0EvQyxJLGlCQUFLK0MsSSxFQUFNO0FBQ1AsZUFBTyxJQUFJdkQsTUFBSixDQUFXbUUsT0FBT0MsWUFBUCxDQUFvQmIsSUFBcEIsQ0FBWCxFQUFzQyxRQUF0QyxDQUFQO0FBQ0gsSzs7QUFFRDs7Ozs7Ozs7Ozt1QkFVQWMsSyxrQkFBTWQsSSxFQUFNO0FBQ1IsZUFBTyxJQUFJdkQsTUFBSixDQUFXbUUsT0FBT0MsWUFBUCxDQUFxQmIsUUFBUSxDQUFULEdBQWMsR0FBbEMsRUFBdUNBLE9BQU8sR0FBOUMsQ0FBWCxFQUErRCxRQUEvRCxDQUFQO0FBQ0gsSztBQUNEOzs7Ozs7Ozs7Ozt1QkFTQXJELEssa0JBQU1xRCxJLEVBQU07QUFDUixlQUFPLElBQUl2RCxNQUFKLENBQVdtRSxPQUFPQyxZQUFQLENBQXFCYixRQUFRLEVBQVQsR0FBZSxHQUFuQyxFQUF5Q0EsUUFBUSxFQUFULEdBQWUsR0FBdkQsRUFBNkRBLFFBQVEsQ0FBVCxHQUFjLEdBQTFFLEVBQStFQSxPQUFPLEdBQXRGLENBQVgsRUFBdUcsUUFBdkcsQ0FBUDtBQUNILEs7O0FBRUQ7Ozs7Ozs7Ozs7O3VCQVNBZSxRLHFCQUFTZixJLEVBQU07QUFDWCxlQUFPLElBQUl2RCxNQUFKLENBQVdtRSxPQUFPQyxZQUFQLENBQW9CYixPQUFPLEdBQTNCLEVBQWlDQSxRQUFRLENBQVQsR0FBYyxHQUE5QyxDQUFYLEVBQStELFFBQS9ELENBQVA7QUFDSCxLOzs7OzBCQS9UYS9CLE0sRUFBUTtBQUNsQixpQkFBS0EsTUFBTCxHQUFjQSxNQUFkO0FBQ0g7Ozs7O0FBK1RMOzs7OztrQkFHZWxDLFEiLCJmaWxlIjoiUG5nSW1hZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG1vZHVsZSBQbmdJbWFnZVxyXG4gKiBcclxuICogQGRlc2NyaXB0aW9uIFBuZyBJbWFnZSBDbGFzcyBmb3IgZ2VuZXJhdGlvbiBwbmcgaW1hZ2VzLlxyXG4gKlxyXG4gKiBAdmVyc2lvbiAxLjBcclxuICogQGF1dGhvciBHcmlnb3J5IFZhc2lseWV2IDxwb3N0Y3NzLmhhbXN0ZXJAZ21haWwuY29tPiBodHRwczovL2dpdGh1Yi5jb20vaDB0YzBkM1xyXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNywgR3JpZ29yeSBWYXNpbHlldlxyXG4gKiBAbGljZW5zZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAsIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMCBcclxuICogXHJcbiAqL1xyXG5cclxuY2xhc3MgUG5nSW1hZ2Uge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogIENvbnN0cnVjdG9yIGZvciBQbmdJbWFnZSBDbGFzcy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGVwdGggLSBjb2xvciBkZXB0aC5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb2xvcnR5cGUgLSBwbmcgY29sb3IgdHlwZS5cclxuICAgICAqIFxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiA8cHJlPlxyXG4gICAgICogQ29sb3IgZGVwdGhzOlxyXG4gICAgICogXHJcbiAgICAgKiBQTkcgaW1hZ2UgdHlwZSAgICAgICAgICAgQ29sb3VyIHR5cGUgICAgQWxsb3dlZCBiaXQgZGVwdGhzICAgICAgIEludGVycHJldGF0aW9uXHJcbiAgICAgKiBHcmV5c2NhbGUgICAgICAgICAgICAgICAgMCAgICAgICAgICAgICAgICAxLCAyLCA0LCA4LCAxNiAgICAgICAgIEVhY2ggcGl4ZWwgaXMgYSBncmV5c2NhbGUgc2FtcGxlXHJcbiAgICAgKiBUcnVlY29sb3IgICAgICAgICAgICAgICAgMiAgICAgICAgICAgICAgICA4LCAxNiAgICAgICAgICAgICAgICAgIEVhY2ggcGl4ZWwgaXMgYW4gUixHLEIgdHJpcGxlXHJcbiAgICAgKiBJbmRleGVkLWNvbG9yICAgICAgICAgICAgMyAgICAgICAgICAgICAgICAxLCAyLCA0LCA4ICAgICAgICAgICAgIEVhY2ggcGl4ZWwgaXMgYSBwYWxldHRlIGluZGV4OyBhIFBMVEUgY2h1bmsgc2hhbGwgYXBwZWFyLlxyXG4gICAgICogR3JleXNjYWxlIHdpdGggYWxwaGEgICAgIDQgICAgICAgICAgICAgICAgOCwgMTYgICAgICAgICAgICAgICAgICBFYWNoIHBpeGVsIGlzIGEgZ3JleXNjYWxlIHNhbXBsZSBmb2xsb3dlZCBieSBhbiBhbHBoYSBzYW1wbGUuXHJcbiAgICAgKiBUcnVlY29sb3Igd2l0aCBhbHBoYSAgICAgNiAgICAgICAgICAgICAgICA4LCAxNiAgICAgICAgICAgICAgICAgIEVhY2ggcGl4ZWwgaXMgYW4gUixHLEIgdHJpcGxlIGZvbGxvd2VkIGJ5IGFuIGFscGhhIHNhbXBsZS5cclxuICAgICAqIDwvcHJlPlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihkZXB0aCA9IDgsIGNvbG9ydHlwZSA9IDYpIHtcclxuXHJcbiAgICAgICAgdGhpcy56bGliID0gcmVxdWlyZShcInpsaWJcIik7XHJcbiAgICAgICAgdGhpcy5mcyA9IHJlcXVpcmUoXCJmc1wiKTtcclxuXHJcbiAgICAgICAgdGhpcy5kZXB0aCA9IHBhcnNlSW50KGRlcHRoKTtcclxuICAgICAgICB0aGlzLmNvbG9ydHlwZSA9IHBhcnNlSW50KGNvbG9ydHlwZSk7XHJcbiAgICAgICAgdGhpcy50cmFuc3BhcmVudCA9IHRoaXMuY29sb3IoMCwgMCwgMCwgMCk7IC8vIFRyYW5zcGFyZW50IGNvbG9yXHJcbiAgICAgICAgLy9JRU5EIENodW5rXHJcbiAgICAgICAgdGhpcy5pZW5kID0gQnVmZmVyLmNvbmNhdChbdGhpcy5ieXRlNCgwKSwgbmV3IEJ1ZmZlcihcIklFTkRcIiwgXCJiaW5hcnlcIiksIHRoaXMuZnJvbUhleChbMHhBRSwgMHg0MiwgMHg2MCwgMHg4Ml0pXSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IElIRFIgc2V0dGluZ3MgYW5kIGdlbmVyYXRlIElIRFIgQ2h1bmsgZm9yIFBORyBJbWFnZS5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gaW1hZ2UgaGVpZ2h0LlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIC0gaW1hZ2Ugd2lkdGguXHJcbiAgICAgKiBcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogPHByZT5cclxuICAgICAqIElIRFIgRm9ybWF0OlxyXG4gICAgICogV2lkdGggNCBieXRlc1xyXG4gICAgICogSGVpZ2h0IDQgYnl0ZXNcclxuICAgICAqIEJpdCBkZXB0aCAxIGJ5dGVcclxuICAgICAqIENvbG91ciB0eXBlIDEgYnl0ZVxyXG4gICAgICogQ29tcHJlc3Npb24gbWV0aG9kIDEgYnl0ZVxyXG4gICAgICogRmlsdGVyIG1ldGhvZCAxIGJ5dGVcclxuICAgICAqIEludGVybGFjZSBtZXRob2QgMSBieXRlXHJcbiAgICAgKiA8L3ByZT5cclxuICAgICAqL1xyXG4gICAgc2V0SUhEUihoZWlnaHQgPSAxLCB3aWR0aCA9IDEpIHtcclxuXHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBwYXJzZUludChoZWlnaHQpO1xyXG4gICAgICAgIHRoaXMud2lkdGggPSBwYXJzZUludCh3aWR0aCk7XHJcbiAgICAgICAgLy8gSUhEUiBDaHVua1xyXG4gICAgICAgIHRoaXMuaWhkciA9IEJ1ZmZlci5jb25jYXQoW25ldyBCdWZmZXIoXCJJSERSXCIsIFwiYmluYXJ5XCIpLCB0aGlzLmJ5dGU0KHRoaXMud2lkdGgpLCB0aGlzLmJ5dGU0KHRoaXMuaGVpZ2h0KV0pO1xyXG4gICAgICAgIHRoaXMuaWhkciA9IEJ1ZmZlci5jb25jYXQoW3RoaXMuaWhkciwgdGhpcy5ieXRlKHRoaXMuZGVwdGgpLCB0aGlzLmJ5dGUodGhpcy5jb2xvcnR5cGUpLCB0aGlzLmZyb21IZXgoWzB4MDAsIDB4MDAsIDB4MDBdKV0pO1xyXG4gICAgICAgIHRoaXMuaWhkciA9IEJ1ZmZlci5jb25jYXQoW3RoaXMuYnl0ZTQoMTMpLCB0aGlzLmloZHIsIHRoaXMuYnl0ZTQodGhpcy5jcmMzMih0aGlzLmloZHIpKV0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlIHJ1bGVyIGltYWdlIG1hdHJpeC5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IC0gaW1hZ2UgaGVpZ2h0LlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbG9yIC0gcnVsZXIgbGluZSBjb2xvci4gU3VwcG9ydCBoZXggY29sb3IgbGlrZSAjNDU0NTQ1LCB3ZWIgc2FmZSBoZXggbGlrZSAjMzMzLCByZ2IoMjU1LCAxNDMsIDE1KSAtIHJlZCwgIGdyZWVuLCBibHVlLCByZ2JhKDI1NSwgMTQzLCAxNSwgMC42KSAtIHJlZCwgIGdyZWVuLCBibHVlLCBhbHBoYSh0cmFuc3BhcmVuY3kpLlxyXG4gICAgICogQHBhcmFtIHthcnJheX0gcGF0dGVybiAtIHJ1bGVyIGxpbmUgcGF0dGVybiBhcnJheSBsaWtlIFsxLCAwLCAwLCAwXSAtIHZhbHVlID0gMSAtIHdyaXRlIGNvbG9yIHBpeGVsLCB2YWx1ZXMgPSAwIHdyaXRlIHRyYW5zcGFyZW50IHBpeGVsLlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHRoaWNrbmVzcyAtIHJ1bGVyIGxpbmUgdGhpY2tuZXNzIGluIHBpeGVscy5cclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY2FsZSAtIGltYWdlIHNjYWxlIHJhdGlvLlxyXG4gICAgICogXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIDxwcmU+XHJcbiAgICAgKiBGaWx0ZXIgVHlwZXM6XHJcbiAgICAgKiAwICAgIE5vbmUgICAgICAgIEZpbHQoeCkgPSBPcmlnKHgpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWNvbih4KSA9IEZpbHQoeClcclxuICAgICAqIDEgICAgU3ViICAgICAgICAgRmlsdCh4KSA9IE9yaWcoeCkgLSBPcmlnKGEpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlY29uKHgpID0gRmlsdCh4KSArIFJlY29uKGEpXHJcbiAgICAgKiAyICAgIFVwICAgICAgICAgIEZpbHQoeCkgPSBPcmlnKHgpIC0gT3JpZyhiKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWNvbih4KSA9IEZpbHQoeCkgKyBSZWNvbihiKVxyXG4gICAgICogMyAgICBBdmVyYWdlICAgICBGaWx0KHgpID0gT3JpZyh4KSAtIGZsb29yKChPcmlnKGEpICsgT3JpZyhiKSkgLyAyKSAgICAgICAgICAgICAgUmVjb24oeCkgPSBGaWx0KHgpICsgZmxvb3IoKFJlY29uKGEpICsgUmVjb24oYikpIC8gMilcclxuICAgICAqIDQgICAgUGFldGggICAgICAgRmlsdCh4KSA9IE9yaWcoeCkgLSBQYWV0aFByZWRpY3RvcihPcmlnKGEpLCBPcmlnKGIpLCBPcmlnKGMpKSAgIFJlY29uKHgpID0gRmlsdCh4KSArIFBhZXRoUHJlZGljdG9yKFJlY29uKGEpLCBSZWNvbihiKSwgUmVjb24oYylcclxuICAgICAqIDwvcHJlPlxyXG4gICAgICovXHJcbiAgICBydWxlck1hdHJpeChoZWlnaHQsIGNvbG9yLCBwYXR0ZXJuLCB0aGlja25lc3MgPSAxLCBzY2FsZSA9IDEpIHtcclxuXHJcbiAgICAgICAgc2NhbGUgPSBwYXJzZUludChzY2FsZSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0SUhEUihNYXRoLnJvdW5kKGhlaWdodCAqIHNjYWxlKSwgTWF0aC5yb3VuZChwYXR0ZXJuLmxlbmd0aCAqIHNjYWxlKSk7XHJcblxyXG4gICAgICAgIC8vcGF0ZXJuIHRoaWNrbmVzc1xyXG4gICAgICAgIHRoaWNrbmVzcyA9IHBhcnNlSW50KHRoaWNrbmVzcyk7XHJcblxyXG4gICAgICAgIHRoaWNrbmVzcyA9IHRoaWNrbmVzcyAqIHNjYWxlO1xyXG4gICAgICAgIC8vIFNjYW5saW5lIGZpbHRlciAwXHJcblxyXG4gICAgICAgIGxldCBmaWx0ZXIgPSB0aGlzLmJ5dGUoMCk7XHJcblxyXG4gICAgICAgIHRoaXMucGl4ZWxjb2xvciA9IHRoaXMucGFyc2VDb2xvcihjb2xvcik7XHJcblxyXG4gICAgICAgIGxldCBwYXR0ZXJuSGVpZ2h0ID0gTWF0aC5mbG9vcih0aGlja25lc3MgLyAyKTtcclxuXHJcbiAgICAgICAgbGV0IHJlbWFpbmRlciA9IHRoaWNrbmVzcyAlIDI7XHJcblxyXG4gICAgICAgIGxldCBib3R0b20gPSB0aGlzLmhlaWdodCAtIHBhdHRlcm5IZWlnaHQgLSByZW1haW5kZXI7XHJcblxyXG4gICAgICAgIC8vbGV0IGJvdHRvbSA9IHRoaXMuaGVpZ2h0IC0gdGhpY2tuZXNzO1xyXG4gICAgICAgIHRoaXMubWF0cml4ID0gbnVsbDtcclxuXHJcbiAgICAgICAgbGV0IHBsaW5lID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIHNjYW4gbGluZXNcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaGVpZ2h0OyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCAwIGZpbHRlciBhdCBuZXcgc2NhbmxpbmVcclxuICAgICAgICAgICAgdGhpcy5tYXRyaXggPSB0aGlzLm1hdHJpeCAhPSBudWxsID8gQnVmZmVyLmNvbmNhdChbdGhpcy5tYXRyaXgsIGZpbHRlcl0pIDogZmlsdGVyO1xyXG5cclxuICAgICAgICAgICAgLy8gQ3VycmVudCBsaW5lIGluY2x1ZGUgcnVsZXIgcGF0dGVybiA/IC8vIHRvcCBhbmQgYm90dG9tXHJcbiAgICAgICAgICAgIGlmIChpIDwgcGF0dGVybkhlaWdodCB8fCBpID49IGJvdHRvbSkge1xyXG4gICAgICAgICAgICAgICAgcGxpbmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxpbmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gLy8gQ3VycmVudCBsaW5lIGluY2x1ZGUgcnVsZXIgcGF0dGVybiA/IC8vIGJvdHRvbVxyXG4gICAgICAgICAgICAvLyBpZiAoaSA+PSBib3R0b20pIHtcclxuICAgICAgICAgICAgLy8gICAgIHBsaW5lID0gdHJ1ZTtcclxuICAgICAgICAgICAgLy8gfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gICAgIHBsaW5lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy53aWR0aDsgaisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBsaW5lKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwaW5kZXggPSBNYXRoLmZsb29yKGogLyBzY2FsZSkgJSBwYXR0ZXJuLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeCA9IChwbGluZSAmJiBwYXR0ZXJuW3BpbmRleF0gIT0gMCkgPyBCdWZmZXIuY29uY2F0KFt0aGlzLm1hdHJpeCwgdGhpcy5waXhlbGNvbG9yXSkgOiBCdWZmZXIuY29uY2F0KFt0aGlzLm1hdHJpeCwgdGhpcy50cmFuc3BhcmVudF0pO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWF0cml4ID0gQnVmZmVyLmNvbmNhdChbdGhpcy5tYXRyaXgsIHRoaXMudHJhbnNwYXJlbnRdKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWFrZUlEQVQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBpbWFnZSBtYXRyaXguXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIG1hdHJpeCAtIGJ5dGVzLlxyXG4gICAgICogXHJcbiAgICAgKi9cclxuICAgIHNldCBzZXRNYXRyaXgobWF0cml4KSB7XHJcbiAgICAgICAgdGhpcy5tYXRyaXggPSBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBJREFUIENodW5rIGZvciBpbWFnZS4gRGVmbGF0ZSBpbWFnZSBtYXRyaXguXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICovXHJcbiAgICBtYWtlSURBVCgpIHtcclxuICAgICAgICBpZiAodGhpcy5tYXRyaXggIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLm1hdHJpeCA9IHRoaXMuemxpYi5kZWZsYXRlU3luYyh0aGlzLm1hdHJpeCwge1xyXG4gICAgICAgICAgICAgICAgbGV2ZWw6IDlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIElEQVQgQ2h1bmtcclxuICAgICAgICAgICAgdGhpcy5pZGF0ID0gQnVmZmVyLmNvbmNhdChbbmV3IEJ1ZmZlcihcIklEQVRcIiwgXCJiaW5hcnlcIiksIG5ldyBCdWZmZXIodGhpcy5tYXRyaXgpXSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlkYXQgPSBCdWZmZXIuY29uY2F0KFt0aGlzLmJ5dGU0KHRoaXMuaWRhdC5sZW5ndGggLSA0KSwgdGhpcy5pZGF0LCB0aGlzLmJ5dGU0KHRoaXMuY3JjMzIodGhpcy5pZGF0KSldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFrZSBpbWFnZSBiZWZvcmUgb3V0cHV0LiBHbHVlIGFsbCBQTkcgQ2h1bmtzIHdpdGggUE5HIEhlYWRlci5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKi9cclxuICAgIG1ha2VJbWFnZSgpIHtcclxuICAgICAgICAvLyBHbHVlIGNodW5rcyB3aXRoIFBORyBpbWFnZSBoZWFkZXJcclxuICAgICAgICB0aGlzLmltYWdlID0gQnVmZmVyLmNvbmNhdChbdGhpcy5mcm9tSGV4KFsweDg5LCAweDUwLCAweDRFLCAweDQ3LCAweDBELCAweDBBLCAweDFBLCAweDBBXSksIHRoaXMuaWhkciwgdGhpcy5pZGF0LCB0aGlzLmllbmRdKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXJzZSBjb2xvciBmcm9tIHN0cmluZy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29sb3IgLSBjb2xvciBhcyBzdHJpbmcuXHJcbiAgICAgKiBTdXBwb3J0IGhleCBjb2xvciBsaWtlICM0NTQ1NDUsIHdlYiBzYWZlIGhleCBsaWtlICMzMzMsIHJnYigyNTUsIDE0MywgMTUpIC0gcmVkLCAgZ3JlZW4sIGJsdWUsIHJnYmEoMjU1LCAxNDMsIDE1LCAwLjYpIC0gcmVkLCAgZ3JlZW4sIGJsdWUsIGFscGhhKHRyYW5zcGFyZW5jeSkuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHtCdWZmZXJ9IC0gY29sb3IgZm9yIHBuZyBpbWFnZSBlbmNvZGVkIGFzIGJ5dGVzLlxyXG4gICAgICovXHJcbiAgICBwYXJzZUNvbG9yKGNvbG9yKSB7XHJcblxyXG4gICAgICAgIC8vIHRyYW5zcGFyZW50IGNvbG9yXHJcbiAgICAgICAgbGV0IFtyZWQsIGdyZWVuLCBibHVlLCBhbHBoYV0gPSBbMCwgMCwgMCwgMF07XHJcbiAgICAgICAgbGV0IGZvdW5kO1xyXG4gICAgICAgIC8vIEhleCBjb2xvciBsaWtlICM0NTQ1NDVcclxuICAgICAgICBpZiAoKGZvdW5kID0gY29sb3IubWF0Y2goL1xcIyhcXHd7Nn18XFx3ezN9KS8pKSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGZvdW5kWzFdLmxlbmd0aCA9PSA2KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgW3JlZCwgZ3JlZW4sIGJsdWVdID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGZvdW5kWzFdLnN1YnN0cigwLCAyKSwgMTYpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGZvdW5kWzFdLnN1YnN0cigyLCAyKSwgMTYpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGZvdW5kWzFdLnN1YnN0cig0LCAyKSwgMTYpXHJcbiAgICAgICAgICAgICAgICBdO1xyXG5cclxuICAgICAgICAgICAgICAgIGFscGhhID0gMjU1O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZvdW5kWzFdLmxlbmd0aCA9PSAzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBIZXggY29sb3JzIGxpa2UgIzMzM1xyXG4gICAgICAgICAgICAgICAgbGV0IHJjID0gZm91bmRbMV0uc3Vic3RyKDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGdjID0gZm91bmRbMV0uc3Vic3RyKDEsIDEpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJjID0gZm91bmRbMV0uc3Vic3RyKDIsIDEpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJjID0gcmMgKyByYztcclxuICAgICAgICAgICAgICAgIGdjID0gZ2MgKyBnYztcclxuICAgICAgICAgICAgICAgIGJjID0gYmMgKyBiYztcclxuXHJcbiAgICAgICAgICAgICAgICBbcmVkLCBncmVlbiwgYmx1ZV0gPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQocmMsIDE2KSxcclxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChnYywgMTYpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGJjLCAxNilcclxuICAgICAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICAgICAgYWxwaGEgPSAyNTU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHJnYiByZ2JhIGNvbG9ycyBsaWtlIHJnYmEoMjU1LCAyNTUsMjU1LCAyNTUpXHJcbiAgICAgICAgfSBlbHNlIGlmICgoZm91bmQgPSBjb2xvci5tYXRjaCgvcmdiYSpcXCgoLio/KVxcKS8pKSkge1xyXG5cclxuICAgICAgICAgICAgW3JlZCwgZ3JlZW4sIGJsdWUsIGFscGhhXSA9IGZvdW5kWzFdLnNwbGl0KC9cXHMqXFwsXFxzKi9pKTtcclxuICAgICAgICAgICAgYWxwaGEgPSAoYWxwaGEgIT0gbnVsbCAmJiBhbHBoYSA+IDApID8gTWF0aC5yb3VuZChhbHBoYSAqIDI1NSkgOiAyNTU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3IocmVkLCBncmVlbiwgYmx1ZSwgYWxwaGEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgcmdiYSBjb2xvciBmb3IgUE5HIEltYWdlLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByZWQgLSByZWQgdmFsdWUgaW4gcmdiIHBhbGV0dGUuXHJcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZ3JlZW4gLSBncmVlbiB2YWx1ZSBpbiByZ2IgcGFsZXR0ZS5cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBibHVlIC0gYmx1ZSB2YWx1ZSBpbiByZ2IgcGFsZXR0ZS5cclxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBhbHBoYSAtIHRyYW5zcGFyZW5jeSB2YWx1ZS5cclxuICAgICAqIFxyXG4gICAgICogQGRlc2NyaXB0aW9uIEFsbCB2YWx1ZXMgbXVzdCBiZSBmcm9tIDAgdG8gMjU1LlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7QnVmZmVyfSAtIGNvbG9yIGVuY29kZWQgYXMgYnl0ZXMuXHJcbiAgICAgKi9cclxuICAgIGNvbG9yKHJlZCwgZ3JlZW4sIGJsdWUsIGFscGhhKSB7XHJcblxyXG4gICAgICAgIHJlZCA9IChyZWQgIT0gbnVsbCAmJiByZWQgPj0gMCAmJiByZWQgPD0gMjU1KSA/IHJlZCA6IDI1NTtcclxuICAgICAgICBncmVlbiA9IChncmVlbiAhPSBudWxsICYmIGdyZWVuID49IDAgJiYgZ3JlZW4gPD0gMjU1KSA/IGdyZWVuIDogMjU1O1xyXG4gICAgICAgIGJsdWUgPSAoYmx1ZSAhPSBudWxsICYmIGJsdWUgPj0gMCAmJiBibHVlIDw9IDI1NSkgPyBibHVlIDogMjU1O1xyXG4gICAgICAgIGFscGhhID0gKGFscGhhICE9IG51bGwgJiYgYWxwaGEgPj0gMCAmJiBhbHBoYSA8PSAyNTUpID8gYWxwaGEgOiAyNTU7XHJcblxyXG4gICAgICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFt0aGlzLmJ5dGUocmVkKSwgdGhpcy5ieXRlKGdyZWVuKSwgdGhpcy5ieXRlKGJsdWUpLCB0aGlzLmJ5dGUoYWxwaGEpXSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gcG5nIGltYWdlIGluIGJhc2U2NCBmb3JtYXQuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge0J1ZmZlcn0gLSBiYXNlNjQgc3RyaW5nIC0gZW5jb2RlZCBpbWFnZS5cclxuICAgICAqL1xyXG4gICAgZ2V0QmFzZTY0KCkge1xyXG4gICAgICAgIHRoaXMubWFrZUltYWdlKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYmFzZTY0KHRoaXMuaW1hZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogV3JpdGUgaW1hZ2UgdG8gZmlsZS5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gZmlsZW5hbWUgLSBpbWFnZSBmaWxlIG5hbWUuXHJcbiAgICAgKi9cclxuICAgIGdldEZpbGUoZmlsZW5hbWUpIHtcclxuICAgICAgICB0aGlzLm1ha2VJbWFnZSgpO1xyXG4gICAgICAgIHRoaXMuZnMud3JpdGVGaWxlKGZpbGVuYW1lLCB0aGlzLmltYWdlLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlIFwiICsgZmlsZW5hbWUgKyBcIiB3YXMgc2F2ZWQhXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRsZXIgMzIgYWxnb3JpdGhtLiBDYWxjdWxhdGUgaGFzaCBmb3IgYnl0ZXMuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGRhdGEgLSBpbnB1dCBieXRlcy5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gLSBhZGxlcjMyIGhhc2guXHJcbiAgICAgKi9cclxuICAgIGFkbGVyMzIoZGF0YSkge1xyXG5cclxuICAgICAgICBsZXQgQkFTRSA9IDY1NTIxLFxyXG4gICAgICAgICAgICBOTUFYID0gNTU1MixcclxuICAgICAgICAgICAgczEgPSAxLFxyXG4gICAgICAgICAgICBzMiA9IDAsXHJcbiAgICAgICAgICAgIG4gPSBOTUFYO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgczEgKz0gZGF0YVtpXTtcclxuICAgICAgICAgICAgczIgKz0gczE7XHJcbiAgICAgICAgICAgIGlmICgobiAtPSAxKSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBzMSAlPSBCQVNFO1xyXG4gICAgICAgICAgICAgICAgczIgJT0gQkFTRTtcclxuICAgICAgICAgICAgICAgIG4gPSBOTUFYO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzMSAlPSBCQVNFO1xyXG4gICAgICAgIHMyICU9IEJBU0U7XHJcblxyXG4gICAgICAgIHJldHVybiAoczIgPDwgMTYpIHwgczE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgY3JjMzIoQ3ljbGljIHJlZHVuZGFuY3kgY2hlY2spIGNoZWNrc3VtIGZvciBieXRlcy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gZGF0YSAtIGlucHV0IGJ5dGVzLlxyXG4gICAgICogQHBhcmFtIGNyYyAtIHN0YXJ0IGNyYyB2YWx1ZSwgZGVmYXVsdCAtIDEuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gY3JjMzIgY2hlY2tzdW0uXHJcbiAgICAgKi9cclxuICAgIGNyYzMyKGRhdGEsIGNyYyA9IC0xKSB7XHJcblxyXG4gICAgICAgIC8vIHByZSBnZW5lcmF0ZWQgY3JjIHRhYmxlLlxyXG4gICAgICAgIGxldCBjcmNUYWJsZSA9IFswLCAxOTk2OTU5ODk0LCAtMzAxMDQ3NTA4LCAtMTcyNzQ0MjUwMiwgMTI0NjM0MTM3LCAxODg2MDU3NjE1LCAtMzc5MzQ1NjExLCAtMTYzNzU3NTI2MSwgMjQ5MjY4Mjc0LCAyMDQ0NTA4MzI0LCAtNTIyODUyMDY2LCAtMTc0Nzc4OTQzMiwgMTYyOTQxOTk1LCAyMTI1NTYxMDIxLCAtNDA3MzYwMjQ5LCAtMTg2NjUyMzI0NywgNDk4NTM2NTQ4LCAxNzg5OTI3NjY2LCAtMjA1OTUwNjQ4LCAtMjA2NzkwNjA4MiwgNDUwNTQ4ODYxLCAxODQzMjU4NjAzLCAtMTg3Mzg2NTQzLCAtMjA4MzI4OTY1NywgMzI1ODgzOTkwLCAxNjg0Nzc3MTUyLCAtNDM4NDUyNTQsIC0xOTczMDQwNjYwLCAzMzU2MzM0ODcsIDE2NjEzNjU0NjUsIC05OTY2NDU0MSwgLTE5Mjg4NTE5NzksIDk5NzA3MzA5NiwgMTI4MTk1Mzg4NiwgLTcxNTExMTk2NCwgLTE1NzAyNzkwNTQsIDEwMDY4ODgxNDUsIDEyNTg2MDc2ODcsIC03NzA4NjU2NjcsIC0xNTI2MDI0ODUzLCA5MDEwOTc3MjIsIDExMTkwMDA2ODQsIC02MDg0NTAwOTAsIC0xMzk2OTAxNTY4LCA4NTMwNDQ0NTEsIDExNzIyNjYxMDEsIC01ODk5NTE1MzcsIC0xNDEyMzUwNjMxLCA2NTE3Njc5ODAsIDEzNzM1MDM1NDYsIC05MjU0MTI5OTIsIC0xMDc2ODYyNjk4LCA1NjU1MDcyNTMsIDE0NTQ2MjE3MzEsIC04MDk4NTU1OTEsIC0xMTk1NTMwOTkzLCA2NzEyNjY5NzQsIDE1OTQxOTgwMjQsIC05NzIyMzYzNjYsIC0xMzI0NjE5NDg0LCA3OTU4MzU1MjcsIDE0ODMyMzAyMjUsIC0xMDUwNjAwMDIxLCAtMTIzNDgxNzczMSwgMTk5NDE0NjE5MiwgMzExNTg1MzQsIC0xNzMxMDU5NTI0LCAtMjcxMjQ5MzY2LCAxOTA3NDU5NDY1LCAxMTI2MzcyMTUsIC0xNjE0ODE0MDQzLCAtMzkwNTQwMjM3LCAyMDEzNzc2MjkwLCAyNTE3MjIwMzYsIC0xNzc3NzUxOTIyLCAtNTE5MTM3MjU2LCAyMTM3NjU2NzYzLCAxNDEzNzY4MTMsIC0xODU1Njg5NTc3LCAtNDI5Njk1OTk5LCAxODAyMTk1NDQ0LCA0NzY4NjQ4NjYsIC0yMDU2OTY1OTI4LCAtMjI4NDU4NDE4LCAxODEyMzcwOTI1LCA0NTMwOTI3MzEsIC0yMTEzMzQyMjcxLCAtMTgzNTE2MDczLCAxNzA2MDg4OTAyLCAzMTQwNDI3MDQsIC0xOTUwNDM1MDk0LCAtNTQ5NDk3NjQsIDE2NTg2NTgyNzEsIDM2NjYxOTk3NywgLTE5MzIyOTY5NzMsIC02OTk3Mjg5MSwgMTMwMzUzNTk2MCwgOTg0OTYxNDg2LCAtMTU0Nzk2MDIwNCwgLTcyNTkyOTc1OCwgMTI1NjE3MDgxNywgMTAzNzYwNDMxMSwgLTE1Mjk3NTY1NjMsIC03NDA4ODczMDEsIDExMzEwMTQ1MDYsIDg3OTY3OTk5NiwgLTEzODU3MjM4MzQsIC02MzExOTU0NDAsIDExNDExMjQ0NjcsIDg1NTg0MjI3NywgLTE0NDIxNjU2NjUsIC01ODYzMTg2NDcsIDEzNDI1MzM5NDgsIDY1NDQ1OTMwNiwgLTExMDY1NzEyNDgsIC05MjE5NTIxMjIsIDE0NjY0Nzk5MDksIDU0NDE3OTYzNSwgLTExODQ0NDMzODMsIC04MzI0NDUyODEsIDE1OTE2NzEwNTQsIDcwMjEzODc3NiwgLTEzMjg1MDY4NDYsIC05NDIxNjc4ODQsIDE1MDQ5MTg4MDcsIDc4MzU1MTg3MywgLTEyMTIzMjY4NTMsIC0xMDYxNTI0MzA3LCAtMzA2Njc0OTEyLCAtMTY5ODcxMjY1MCwgNjIzMTcwNjgsIDE5NTc4MTA4NDIsIC0zNTUxMjEzNTEsIC0xNjQ3MTUxMTg1LCA4MTQ3MDk5NywgMTk0MzgwMzUyMywgLTQ4MDA0ODM2NiwgLTE4MDUzNzA0OTIsIDIyNTI3NDQzMCwgMjA1Mzc5MDM3NiwgLTQ2ODc5MTU0MSwgLTE4MjgwNjEyODMsIDE2NzgxNjc0MywgMjA5NzY1MTM3NywgLTI2NzQxNDcxNiwgLTIwMjk0NzY5MTAsIDUwMzQ0NDA3MiwgMTc2MjA1MDgxNCwgLTE0NDU1MDA1MSwgLTIxNDA4Mzc5NDEsIDQyNjUyMjIyNSwgMTg1MjUwNzg3OSwgLTE5NjUzNzcwLCAtMTk4MjY0OTM3NiwgMjgyNzUzNjI2LCAxNzQyNTU1ODUyLCAtMTA1MjU5MTUzLCAtMTkwMDA4OTM1MSwgMzk3OTE3NzYzLCAxNjIyMTgzNjM3LCAtNjkwNTc2NDA4LCAtMTU4MDEwMDczOCwgOTUzNzI5NzMyLCAxMzQwMDc2NjI2LCAtNzc2MjQ3MzExLCAtMTQ5NzYwNjI5NywgMTA2ODgyODM4MSwgMTIxOTYzODg1OSwgLTY3MDIyNTQ0NiwgLTEzNTgyOTIxNDgsIDkwNjE4NTQ2MiwgMTA5MDgxMjUxMiwgLTU0NzI5NTI5MywgLTE0Njk1ODc2MjcsIDgyOTMyOTEzNSwgMTE4MTMzNTE2MSwgLTg4Mjc4OTQ5MiwgLTExMzQxMzI0NTQsIDYyODA4NTQwOCwgMTM4MjYwNTM2NiwgLTg3MTU5ODE4NywgLTExNTY4ODg4MjksIDU3MDU2MjIzMywgMTQyNjQwMDgxNSwgLTk3NzY1MDc1NCwgLTEyOTYyMzM2ODgsIDczMzIzOTk1NCwgMTU1NTI2MTk1NiwgLTEwMjYwMzE3MDUsIC0xMjQ0NjA2NjcxLCA3NTI0NTk0MDMsIDE1NDEzMjAyMjEsIC0xNjg3ODk1Mzc2LCAtMzI4OTk0MjY2LCAxOTY5OTIyOTcyLCA0MDczNTQ5OCwgLTE2NzcxMzAwNzEsIC0zNTEzOTAxNDUsIDE5MTMwODc4NzcsIDgzOTA4MzcxLCAtMTc4MjYyNTY2MiwgLTQ5MTIyNjYwNCwgMjA3NTIwODYyMiwgMjEzMjYxMTEyLCAtMTgzMTY5NDY5MywgLTQzODk3NzAxMSwgMjA5NDg1NDA3MSwgMTk4OTU4ODgxLCAtMjAzMjkzODI4NCwgLTIzNzcwNjY4NiwgMTc1OTM1OTk5MiwgNTM0NDE0MTkwLCAtMjExODI0ODc1NSwgLTE1NTYzODE4MSwgMTg3MzgzNjAwMSwgNDE0NjY0NTY3LCAtMjAxMjcxODM2MiwgLTE1NzY2OTI4LCAxNzExNjg0NTU0LCAyODUyODExMTYsIC0xODg5MTY1NTY5LCAtMTI3NzUwNTUxLCAxNjM0NDY3Nzk1LCAzNzYyMjk3MDEsIC0xNjA5ODk5NDAwLCAtNjg2OTU5ODkwLCAxMzA4OTE4NjEyLCA5NTY1NDM5MzgsIC0xNDg2NDEyMTkxLCAtNzk5MDA5MDMzLCAxMjMxNjM2MzAxLCAxMDQ3NDI3MDM1LCAtMTM2MjAwNzQ3OCwgLTY0MDI2MzQ2MCwgMTA4ODM1OTI3MCwgOTM2OTE4MDAwLCAtMTQ0NzI1MjM5NywgLTU1ODEyOTQ2NywgMTIwMjkwMDg2MywgODE3MjMzODk3LCAtMTExMTYyNTE4OCwgLTg5MzczMDE2NiwgMTQwNDI3NzU1MiwgNjE1ODE4MTUwLCAtMTE2MDc1OTgwMywgLTg0MTU0NjA5MywgMTQyMzg1NzQ0OSwgNjAxNDUwNDMxLCAtMTI4NTEyOTY4MiwgLTEwMDAyNTY4NDAsIDE1NjcxMDM3NDYsIDcxMTkyODcyNCwgLTEyNzQyOTg4MjUsIC0xMDIyNTg3MjMxLCAxNTEwMzM0MjM1LCA3NTUxNjcxMTddO1xyXG5cclxuICAgICAgICAvLyBmb3IgKGxldCBqID0gMDsgaiA8IDI1NjsgaisrKSB7XHJcbiAgICAgICAgLy8gXHRsZXQgYyA9IGo7XHJcbiAgICAgICAgLy8gXHRmb3IgKGxldCBrID0gMDsgayA8IDg7IGsrKykge1xyXG4gICAgICAgIC8vIFx0XHRpZiAoYyAmIDEpIHtcclxuICAgICAgICAvLyBcdFx0XHRjID0gLTMwNjY3NDkxMiBeIChjID4+PiAxKTtcclxuICAgICAgICAvLyBcdFx0fSBlbHNlIHtcclxuICAgICAgICAvLyBcdFx0XHRjID0gYyA+Pj4gMTtcclxuICAgICAgICAvLyBcdFx0fVxyXG4gICAgICAgIC8vIFx0fVxyXG4gICAgICAgIC8vIFx0Y3JjVGFibGVbal0gPSBjO1xyXG4gICAgICAgIC8vIH1cclxuXHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgY3JjID0gY3JjVGFibGVbKGNyYyBeIGRhdGFbaV0pICYgMHhmZl0gXiAoY3JjID4+PiA4KTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjcmMgPSBjcmMgXiAtMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNyYztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlIGhleCBzdHJpbmcgZnJvbSBieXRlcy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gZGF0YSAtIGlucHV0IGJ5dGVzLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7QnVmZmVyfSAtIGhleCBzdHJpbmcuXHJcbiAgICAgKi9cclxuICAgIGhleChkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCdWZmZXIoZGF0YSwgXCJiaW5hcnlcIikudG9TdHJpbmcoXCJoZXhcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBieXRlcyBmcm9tIGhleCBzdHJpbmcuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgLSBpbnB1dCBoZXggc3RyaW5nLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7QnVmZmVyfSAtIG91dHB1dCBieXRlcyBpbiBCdWZmZXIuXHJcbiAgICAgKi9cclxuICAgIGZyb21IZXgoZGF0YSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgQnVmZmVyKGRhdGEsIFwiaGV4XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgYmFzZTY0IHN0cmluZyBmcm9tIGJ5dGVzLlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBkYXRhIC0gaW5wdXQgYnl0ZXMuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHtCdWZmZXJ9IC0gYmFzZTY0IHN0cmluZy5cclxuICAgICAqL1xyXG4gICAgYmFzZTY0KGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEJ1ZmZlcihkYXRhKS50b1N0cmluZyhcImJhc2U2NFwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlIGJ5dGVzIGZyb20gYmFzZTY0IHN0cmluZy5cclxuICAgICAqIFxyXG4gICAgICogQG1lbWJlck9mIG1vZHVsZTpQbmdJbWFnZVxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0gZGF0YSAtIGlucHV0IGJhc2U2NCBzdHJpbmcuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHtCdWZmZXJ9IC0gb3V0cHV0IGJ5dGVzIGluIEJ1ZmZlci5cclxuICAgICAqL1xyXG4gICAgZnJvbUJhc2U2NChkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKGRhdGEsIFwiYmFzZTY0XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIGJ5dGVzIGZyb20gaW5wdXQuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGRhdGEgLSBpbnB1dCB2YWx1ZS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge0J1ZmZlcn0gLSBieXRlcy5cclxuICAgICAqL1xyXG4gICAgYnl0ZShkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCdWZmZXIoU3RyaW5nLmZyb21DaGFyQ29kZShkYXRhKSwgXCJiaW5hcnlcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gMiBieXRlcyB2YWx1ZSBmcm9tIGlucHV0LlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBkYXRhIC0gaW5wdXQgdmFsdWUuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHtCdWZmZXJ9IC0gMiBieXRlcy5cclxuICAgICAqL1xyXG5cclxuICAgIGJ5dGUyKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEJ1ZmZlcihTdHJpbmcuZnJvbUNoYXJDb2RlKChkYXRhID4+IDgpICYgMjU1LCBkYXRhICYgMjU1KSwgXCJiaW5hcnlcIik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiA0IGJ5dGVzIHZhbHVlIGZyb20gaW5wdXQuXHJcbiAgICAgKiBcclxuICAgICAqIEBtZW1iZXJPZiBtb2R1bGU6UG5nSW1hZ2VcclxuICAgICAqIFxyXG4gICAgICogQHBhcmFtIGRhdGEgLSBpbnB1dCB2YWx1ZS5cclxuICAgICAqIFxyXG4gICAgICogQHJldHVybnMge0J1ZmZlcn0gLSA0IGJ5dGVzLlxyXG4gICAgICovXHJcbiAgICBieXRlNChkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCdWZmZXIoU3RyaW5nLmZyb21DaGFyQ29kZSgoZGF0YSA+PiAyNCkgJiAyNTUsIChkYXRhID4+IDE2KSAmIDI1NSwgKGRhdGEgPj4gOCkgJiAyNTUsIGRhdGEgJiAyNTUpLCBcImJpbmFyeVwiKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gMiBsc2IobGVhc3Qgc2lnbmlmaWNhbnQgYml0KSBieXRlcyB2YWx1ZSBmcm9tIGlucHV0LlxyXG4gICAgICogXHJcbiAgICAgKiBAbWVtYmVyT2YgbW9kdWxlOlBuZ0ltYWdlXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSBkYXRhIC0gaW5wdXQgdmFsdWUuXHJcbiAgICAgKiBcclxuICAgICAqIEByZXR1cm5zIHtCdWZmZXJ9IC0gMiBsc2IgYnl0ZXMuXHJcbiAgICAgKi9cclxuICAgIGJ5dGUybHNiKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEJ1ZmZlcihTdHJpbmcuZnJvbUNoYXJDb2RlKGRhdGEgJiAyNTUsIChkYXRhID4+IDgpICYgMjU1KSwgXCJiaW5hcnlcIik7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEV4cG9ydCBQTkcgSW1hZ2UgQ2xhc3MuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBQbmdJbWFnZTsiXX0=
