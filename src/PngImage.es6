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

class PngImage {

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
    constructor(depth = 8, colortype = 6) {

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
    setIHDR(height = 1, width = 1) {

        this.height = parseInt(height);
        this.width = parseInt(width);
        // IHDR Chunk
        this.ihdr = Buffer.concat([new Buffer("IHDR", "binary"), this.byte4(this.width), this.byte4(this.height)]);
        this.ihdr = Buffer.concat([this.ihdr, this.byte(this.depth), this.byte(this.colortype), this.fromHex([0x00, 0x00, 0x00])]);
        this.ihdr = Buffer.concat([this.byte4(13), this.ihdr, this.byte4(this.crc32(this.ihdr))]);

    }

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
    rulerMatrix(height, color, pattern, thickness = 1, scale = 1) {

        scale = parseInt(scale);

        this.setIHDR(Math.round(height * scale), Math.round(pattern.length * scale));

        //patern thickness
        thickness = parseInt(thickness);

        thickness = thickness * scale;
        // Scanline filter 0

        let filter = this.byte(0);

        this.pixelcolor = this.parseColor(color);

        let patternHeight = Math.floor(thickness / 2);

        let remainder = thickness % 2;

        let bottom = this.height - patternHeight - remainder;

        //let bottom = this.height - thickness;
        this.matrix = null;

        let pline = false;

        // scan lines
        for (let i = 0; i < this.height; i++) {

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

            for (let j = 0; j < this.width; j++) {

                if (pline) {

                    let pindex = Math.floor(j / scale) % pattern.length;
                    this.matrix = (pline && pattern[pindex] != 0) ? Buffer.concat([this.matrix, this.pixelcolor]) : Buffer.concat([this.matrix, this.transparent]);

                } else {

                    this.matrix = Buffer.concat([this.matrix, this.transparent]);

                }
            }
        }

        this.makeIDAT();
    }

    /**
     * Set image matrix.
     * 
     * @memberOf module:PngImage
     * 
     * @param matrix - bytes.
     * 
     */
    set setMatrix(matrix) {
        this.matrix = matrix;
    }

    /**
     * Generate IDAT Chunk for image. Deflate image matrix.
     * 
     * @memberOf module:PngImage
     * 
     */
    makeIDAT() {
        if (this.matrix != null) {
            this.matrix = this.zlib.deflateSync(this.matrix, {
                level: 9
            });
            // IDAT Chunk
            this.idat = Buffer.concat([new Buffer("IDAT", "binary"), new Buffer(this.matrix)]);

            this.idat = Buffer.concat([this.byte4(this.idat.length - 4), this.idat, this.byte4(this.crc32(this.idat))]);
        }

    }

    /**
     * Make image before output. Glue all PNG Chunks with PNG Header.
     * 
     * @memberOf module:PngImage
     * 
     */
    makeImage() {
        // Glue chunks with PNG image header
        this.image = Buffer.concat([this.fromHex([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), this.ihdr, this.idat, this.iend]);

    }

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
    parseColor(color) {

        // transparent color
        let [red, green, blue, alpha] = [0, 0, 0, 0];
        let found;
        // Hex color like #454545
        if ((found = color.match(/\#(\w{6}|\w{3})/))) {

            if (found[1].length == 6) {

                [red, green, blue] = [
                    parseInt(found[1].substr(0, 2), 16),
                    parseInt(found[1].substr(2, 2), 16),
                    parseInt(found[1].substr(4, 2), 16)
                ];

                alpha = 255;
            } else if (found[1].length == 3) {
                // Hex colors like #333
                let rc = found[1].substr(0, 1);
                let gc = found[1].substr(1, 1);
                let bc = found[1].substr(2, 1);

                rc = rc + rc;
                gc = gc + gc;
                bc = bc + bc;

                [red, green, blue] = [
                    parseInt(rc, 16),
                    parseInt(gc, 16),
                    parseInt(bc, 16)
                ];

                alpha = 255;
            }

            // rgb rgba colors like rgba(255, 255,255, 255)
        } else if ((found = color.match(/rgba*\((.*?)\)/))) {

            [red, green, blue, alpha] = found[1].split(/\s*\,\s*/i);
            alpha = (alpha != null && alpha > 0) ? Math.round(alpha * 255) : 255;

        }

        return this.color(red, green, blue, alpha);
    }

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
    color(red, green, blue, alpha) {

        red = (red != null && red >= 0 && red <= 255) ? red : 255;
        green = (green != null && green >= 0 && green <= 255) ? green : 255;
        blue = (blue != null && blue >= 0 && blue <= 255) ? blue : 255;
        alpha = (alpha != null && alpha >= 0 && alpha <= 255) ? alpha : 255;

        return Buffer.concat([this.byte(red), this.byte(green), this.byte(blue), this.byte(alpha)]);
    }

    /**
     * Return png image in base64 format.
     * 
     * @memberOf module:PngImage
     * 
     * @returns {Buffer} - base64 string - encoded image.
     */
    getBase64() {
        this.makeImage();
        return this.base64(this.image);
    }

    /**
     * Write image to file.
     * 
     * @memberOf module:PngImage
     * 
     * @param filename - image file name.
     */
    getFile(filename) {
        this.makeImage();
        this.fs.writeFile(filename, this.image, (err) => {
            if (err) {
                return console.log(err);
            }
            console.log("The " + filename + " was saved!");
        });
    }

    /**
     * Adler 32 algorithm. Calculate hash for bytes.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input bytes.
     * 
     * @returns {number} - adler32 hash.
     */
    adler32(data) {

        let BASE = 65521,
            NMAX = 5552,
            s1 = 1,
            s2 = 0,
            n = NMAX;

        for (let i = 0; i < data.length; i++) {
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

        return (s2 << 16) | s1;
    }

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
    crc32(data, crc = -1) {

        // pre generated crc table.
        let crcTable = [0, 1996959894, -301047508, -1727442502, 124634137, 1886057615, -379345611, -1637575261, 249268274, 2044508324, -522852066, -1747789432, 162941995, 2125561021, -407360249, -1866523247, 498536548, 1789927666, -205950648, -2067906082, 450548861, 1843258603, -187386543, -2083289657, 325883990, 1684777152, -43845254, -1973040660, 335633487, 1661365465, -99664541, -1928851979, 997073096, 1281953886, -715111964, -1570279054, 1006888145, 1258607687, -770865667, -1526024853, 901097722, 1119000684, -608450090, -1396901568, 853044451, 1172266101, -589951537, -1412350631, 651767980, 1373503546, -925412992, -1076862698, 565507253, 1454621731, -809855591, -1195530993, 671266974, 1594198024, -972236366, -1324619484, 795835527, 1483230225, -1050600021, -1234817731, 1994146192, 31158534, -1731059524, -271249366, 1907459465, 112637215, -1614814043, -390540237, 2013776290, 251722036, -1777751922, -519137256, 2137656763, 141376813, -1855689577, -429695999, 1802195444, 476864866, -2056965928, -228458418, 1812370925, 453092731, -2113342271, -183516073, 1706088902, 314042704, -1950435094, -54949764, 1658658271, 366619977, -1932296973, -69972891, 1303535960, 984961486, -1547960204, -725929758, 1256170817, 1037604311, -1529756563, -740887301, 1131014506, 879679996, -1385723834, -631195440, 1141124467, 855842277, -1442165665, -586318647, 1342533948, 654459306, -1106571248, -921952122, 1466479909, 544179635, -1184443383, -832445281, 1591671054, 702138776, -1328506846, -942167884, 1504918807, 783551873, -1212326853, -1061524307, -306674912, -1698712650, 62317068, 1957810842, -355121351, -1647151185, 81470997, 1943803523, -480048366, -1805370492, 225274430, 2053790376, -468791541, -1828061283, 167816743, 2097651377, -267414716, -2029476910, 503444072, 1762050814, -144550051, -2140837941, 426522225, 1852507879, -19653770, -1982649376, 282753626, 1742555852, -105259153, -1900089351, 397917763, 1622183637, -690576408, -1580100738, 953729732, 1340076626, -776247311, -1497606297, 1068828381, 1219638859, -670225446, -1358292148, 906185462, 1090812512, -547295293, -1469587627, 829329135, 1181335161, -882789492, -1134132454, 628085408, 1382605366, -871598187, -1156888829, 570562233, 1426400815, -977650754, -1296233688, 733239954, 1555261956, -1026031705, -1244606671, 752459403, 1541320221, -1687895376, -328994266, 1969922972, 40735498, -1677130071, -351390145, 1913087877, 83908371, -1782625662, -491226604, 2075208622, 213261112, -1831694693, -438977011, 2094854071, 198958881, -2032938284, -237706686, 1759359992, 534414190, -2118248755, -155638181, 1873836001, 414664567, -2012718362, -15766928, 1711684554, 285281116, -1889165569, -127750551, 1634467795, 376229701, -1609899400, -686959890, 1308918612, 956543938, -1486412191, -799009033, 1231636301, 1047427035, -1362007478, -640263460, 1088359270, 936918000, -1447252397, -558129467, 1202900863, 817233897, -1111625188, -893730166, 1404277552, 615818150, -1160759803, -841546093, 1423857449, 601450431, -1285129682, -1000256840, 1567103746, 711928724, -1274298825, -1022587231, 1510334235, 755167117];

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


        for (let i = 0; i < data.length; i++) {

            crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);

        }

        crc = crc ^ -1;

        return crc;
    }

    /**
     * Generate hex string from bytes.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input bytes.
     * 
     * @returns {Buffer} - hex string.
     */
    hex(data) {
        return new Buffer(data, "binary").toString("hex");
    }

    /**
     * Generate bytes from hex string.
     * 
     * @memberOf module:PngImage
     * 
     * @param {string} data - input hex string.
     * 
     * @returns {Buffer} - output bytes in Buffer.
     */
    fromHex(data) {
        return new Buffer(data, "hex");
    }

    /**
     * Generate base64 string from bytes.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input bytes.
     * 
     * @returns {Buffer} - base64 string.
     */
    base64(data) {
        return new Buffer(data).toString("base64");
    }

    /**
     * Generate bytes from base64 string.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input base64 string.
     * 
     * @returns {Buffer} - output bytes in Buffer.
     */
    fromBase64(data) {
        return Buffer.from(data, "base64");
    }

    /**
     * Return bytes from input.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input value.
     * 
     * @returns {Buffer} - bytes.
     */
    byte(data) {
        return new Buffer(String.fromCharCode(data), "binary");
    }

    /**
     * Return 2 bytes value from input.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input value.
     * 
     * @returns {Buffer} - 2 bytes.
     */

    byte2(data) {
        return new Buffer(String.fromCharCode((data >> 8) & 255, data & 255), "binary");
    }
    /**
     * Return 4 bytes value from input.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input value.
     * 
     * @returns {Buffer} - 4 bytes.
     */
    byte4(data) {
        return new Buffer(String.fromCharCode((data >> 24) & 255, (data >> 16) & 255, (data >> 8) & 255, data & 255), "binary");
    }
    
    /**
     * Return 2 lsb(least significant bit) bytes value from input.
     * 
     * @memberOf module:PngImage
     * 
     * @param data - input value.
     * 
     * @returns {Buffer} - 2 lsb bytes.
     */
    byte2lsb(data) {
        return new Buffer(String.fromCharCode(data & 255, (data >> 8) & 255), "binary");
    }
}
/**
 * Export PNG Image Class.
 */
export default PngImage;