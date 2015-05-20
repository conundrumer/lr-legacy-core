/*
* float.js
* fromHex: takes a 64-bit number encoded as a hex string (eg 34F5CA0157FF00FF)
*   and returns a float whose binary representation is this number
* toHex: takes a number and returns the binary encoding as a hex string
*/

/*eslint-env node */
'use strict';

// Convert a JavaScript number to IEEE-754 Double Precision
// value represented as an array of 8 bytes (octets)
//
// http://cautionsingularityahead.blogspot.com/2010/04/javascript-and-ieee754-redux.html

function toIEEE754(v, ebits, fbits) {

    var bias = (1 << (ebits - 1)) - 1;

    // Compute sign, exponent, fraction
    var s, e, f;
    if (isNaN(v)) {
        e = (1 << bias) - 1; f = 1; s = 0;
    }
    else if (v === Infinity || v === -Infinity) {
        e = (1 << bias) - 1; f = 0; s = (v < 0) ? 1 : 0;
    }
    else if (v === 0) {
        e = 0; f = 0; s = (1 / v === -Infinity) ? 1 : 0;
    }
    else {
        s = v < 0;
        v = Math.abs(v);

        if (v >= Math.pow(2, 1 - bias)) {
            var ln = Math.min(Math.floor(Math.log(v) / Math.LN2), bias);
            e = ln + bias;
            f = v * Math.pow(2, fbits - ln) - Math.pow(2, fbits);
        }
        else {
            e = 0;
            f = v / Math.pow(2, 1 - bias - fbits);
        }
    }

    // Pack sign, exponent, fraction
    var i, bits = [];
    for (i = fbits; i; i -= 1) { bits.push(f % 2 ? 1 : 0); f = Math.floor(f / 2); }
    for (i = ebits; i; i -= 1) { bits.push(e % 2 ? 1 : 0); e = Math.floor(e / 2); }
    bits.push(s ? 1 : 0);
    bits.reverse();
    var str = bits.join('');

    // Bits to bytes
    var bytes = [];
    while (str.length) {
        bytes.push(parseInt(str.substring(0, 8), 2));
        str = str.substring(8);
    }
    return bytes;
}

function fromIEEE754(bytes, ebits, fbits) {

    // Bytes to bits
    var bits = [];
    for (var i = bytes.length; i; i -= 1) {
        var byte = bytes[i - 1];
        for (var j = 8; j; j -= 1) {
            bits.push(byte % 2 ? 1 : 0); byte = byte >> 1;
        }
    }
    bits.reverse();
    var str = bits.join('');

    // Unpack sign, exponent, fraction
    var bias = (1 << (ebits - 1)) - 1;
    var s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
    var e = parseInt(str.substring(1, 1 + ebits), 2);
    var f = parseInt(str.substring(1 + ebits), 2);

    // Produce number
    if (e === (1 << ebits) - 1) {
        return f !== 0 ? NaN : s * Infinity;
    }
    else if (e > 0) {
        return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
    }
    else if (f !== 0) {
        return s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits));
    }
    else {
        return s * 0;
    }
}

function fromIEEE754Double(b) { return fromIEEE754(b, 11, 52); }
function toIEEE754Double(v) { return toIEEE754(v, 11, 52); }
//function fromIEEE754Single(b) { return fromIEEE754(b,  8, 23); }
//function   toIEEE754Single(v) { return   toIEEE754(v,  8, 23); }

// as2 compatible
/*
function fromHex(s) {
    var b = Array.prototype.map.call(s, function(c, i) {return c + s[i+1]; })
        .filter(function(c, i) {return (i % 2) === 0; })
        .map(function(c) {return parseInt(c, 16); });
    while (b.length < 8) {
        b.unshift(0);
    }
    return fromIEEE754Double(b);
}

function toHex(v) {
    return toIEEE754Double(v)
        .map(function(b) {return b.toString(16); })
        .map(function(s) {return s.length < 2 ? '0' + s : s; })
        .join('');
}
*/

function fromHex(s) {
    let map = Array.prototype.map;
    let b = map.call(s, (c, i) => c + s[i+1])
        .filter((c, i) => (i % 2) === 0)
        .map(c => parseInt(c, 16));
    while (b.length < 8) {
        b.unshift(0);
    }
    return fromIEEE754Double(b);
}

function toHex(v) {
    return toIEEE754Double(v)
        .map(b => b.toString(16))
        .map(s => s.length < 2 ? '0' + s : s)
        .join('');
}

// tests
var ZERO_HEX = '0000000000000000';
var ONE_HEX = '3ff0000000000000';
var INF_HEX = '7ff0000000000000';
var assert = require('assert');
assert(toHex(0) === ZERO_HEX);
assert(fromHex(ZERO_HEX) === 0);
assert(toHex(1) === ONE_HEX);
assert(fromHex(ONE_HEX) === 1);
assert(toHex(Infinity) === INF_HEX);
assert(fromHex(INF_HEX) === Infinity);
assert(fromHex('0') === 0);

module.exports = {
    fromHex: fromHex,
    toHex: toHex,
    ZERO_HEX: ZERO_HEX,
    ONE_HEX: ONE_HEX,
    INF_HEX: INF_HEX
};
