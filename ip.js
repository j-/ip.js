/*! ip.js - Jamie Hoeks */
/* global define, module, exports */
;(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define('ip', [], factory);
	}
	else if (typeof exports === 'object') {
		module.exports = factory();
	}
	else {
		root.IP = factory();
	}
}(this, function () {

'use strict';

/**
 * IP address constructor. Can be given a number, another IP object, or a dotted
 *   or flat string in octal, decimal or hexadecimal formats.
 * @module IP
 * @constructor
 * @param {Number|String|IP} [input=0] Value of this IP
 * @example
 *
 * var localhost = IP('127.0.0.1');     // 'new' not required
 * var dns = new IP('010.010.010.010'); // input can be in base 8, 10 or 16
 * var mask = new IP(0xffffff00);       // input can also be a number
 */
var IP = function IP (input) {
	if (!(this instanceof IP)) {
		return new IP(input);
	}
	this.value = IP.parse(input || 0);
};

/**
 * The minimum value an IP can have. Represents 0.0.0.0.
 * @memberOf IP
 * @static
 * @type {Number}
 */
IP.MIN_VALUE = 0;

/**
 * The maximum value an IP can have. Represents 255.255.255.255.
 * @memberOf IP
 * @static
 * @type {Number}
 */
IP.MAX_VALUE = 0xffffffff;

/**
 * Parse an IP and get its raw value. Input can be another IP object, a number,
 *   or a string of one or more IP parts in decimal, hexadecimal or octal base.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} input IP to parse
 * @return {?Number} Raw value
 */
IP.parse = function (input) {
	var value, parts, invalid;
	if (typeof input === 'number') {
		value = input;
	}
	else if (input instanceof IP) {
		value = input.value;
	}
	else {
		input = String(input);
		parts = IP.splitParts(input);
		value = IP.addParts(parts);
	}
	invalid = (
		value === null ||
		isNaN(value) ||
		value > IP.MAX_VALUE ||
		value < IP.MIN_VALUE
	);
	return invalid ? null : Math.floor(value);
};

/**
 * Add the parts of an IP address. Each part is weighted depending on how many
 *   parts there are in total.
 * @memberOf IP
 * @static
 * @param {Number[]|String[]} parts IP parts to sum
 * @return {?Number} Total value. Null if any part is invalid or if there are
 *   more than 4 parts given.
 */
IP.addParts = function (parts) {
	var value = 0;
	switch (parts && parts.length) {
		// 0.0.0.0
		case 0:
			break;
		// 0.0.0.A
		case 1:
			value += IP.parsePart(parts[0]);
			break;
		// A.0.0.B
		case 2:
			value += IP.parsePart(parts[0]) * 0x01000000;
			value += IP.parsePart(parts[1]);
			break;
		// A.B.0.C
		case 3:
			value += IP.parsePart(parts[0]) * 0x01000000;
			value += IP.parsePart(parts[1]) * 0x00010000;
			value += IP.parsePart(parts[2]);
			break;
		// A.B.C.D
		case 4:
			value += IP.parsePart(parts[0]) * 0x01000000;
			value += IP.parsePart(parts[1]) * 0x00010000;
			value += IP.parsePart(parts[2]) * 0x00000100;
			value += IP.parsePart(parts[3]);
			break;
		default:
			return null;
	}
	return value;
};

/**
 * Determine if an IP part is valid. A valid part is a numeric value greater
 *   than 0.
 * @memberOf IP
 * @static
 * @param {String} part Part to test
 * @return {Boolean} The part is valid
 */
IP.partIsValid = function (part) {
	var valid = !(part === null || isNaN(part) || part < 0);
	return valid;
};

/**
 * Split an input string into its parts. Parts are delimited by a period.
 * @memberOf IP
 * @static
 * @param {String} input String to split
 * @return {?String[]} The input string split into parts. Null if any part is
 *   invalid.
 */
IP.splitParts = function (input) {
	input = String(input);
	var parts = input.split('.');
	for (var i = 0, l = parts.length; i < l; i++) {
		if (!IP.partIsValid(parts[i])) {
			return null;
		}
	}
	return parts;
};

/**
 * Get the four parts of an input IP.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} input IP to process
 * @return {?Number[]} The IP value divided into four parts
 */
IP.getParts = function (input) {
	input = IP.parse(input);
	if (input === null) {
		return null;
	}
	return [
		Math.floor(input / 0x01000000) % 0x100,
		Math.floor(input / 0x00010000) % 0x100,
		Math.floor(input / 0x00000100) % 0x100,
		Math.floor(input             ) % 0x100
	];
};

/**
 * Parse the value of a single part of an IP address.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} part Part to parse
 * @return {Number} The raw value of the given part
 */
IP.parsePart = function (part) {
	var result;
	if (typeof part === 'number' || part instanceof IP) {
		// pass through
		return Number(part);
	}
	part = String(part);
	if (part.charAt(0) === '0') {
		var ch = part.charAt(1);
		if (ch === 'x' || ch === 'X') {
			// hex
			result = parseInt(part, 16);
		}
		else {
			// oct
			result = parseInt(part, 8);
		}
	}
	else {
		// dec
		result = parseInt(part, 10);
	}
	if (result < 0) {
		return null;
	}
	return result;
};

/**
 * Parse a given radix. Can be a numeric value or a string representing one of a
 *   octal, decimal or hexadecimal radix.
 * @memberOf IP
 * @static
 * @param {Number|String} rad Radix
 * @return {?Number} The numeric representation of the given radix
 */
IP.parseRadix = function (rad) {
	var numRad = Number(rad);
	if (!isNaN(numRad)) {
		if (numRad == 8 || numRad === 10 || numRad === 16) {
			return numRad;
		}
		return null;
	}
	rad = String(rad).toLowerCase();
	var first = rad.charAt(0);
	switch (first) {
		case 'o': return 8;
		case 'd': return 10;
		case 'h': return 16;
	}
	return null;
};

/**
 * Takes an input value and an optional radix. Returns the dotted form of that
 *   IP.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} input IP to format
 * @param {Number|String} [rad=10] Radix to use
 * @return {?String} Formatted IP address
 */
IP.format = function (input, rad) {
	input = IP.parse(input);
	if (isNaN(input) || input === null) {
		return null;
	}
	rad = IP.parseRadix(rad) || 10;
	var parts = IP.getParts(input).map(function (part) {
		return IP.formatPart(part, rad);
	});
	var result = parts.join('.');
	return result;
};

/**
 * Format only a part of an IP.
 * @memberOf IP
 * @static
 * @param {Number|String} part Part to format
 * @param {Number|String} [rad=10] Radix to use
 * @return {?String} Formatted IP part
 */
IP.formatPart = function (part, rad) {
	part = IP.parsePart(part);
	if (part === null) {
		return null;
	}
	rad = IP.parseRadix(rad) || 10;
	switch (rad) {
		case 8: return '0' + part.toString(8);
		case 10: return part.toString();
		case 16: return '0x' + part.toString(16);
	}
	return null;
};

/**
 * Get an IP object representing the next address after the given IP.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} ip Address to operate on
 * @return {?IP} Next IP address or null if given IP is max value
 */
IP.next = function (ip) {
	var value = IP.parse(ip);
	if (value >= IP.MAX_VALUE) {
		return null;
	}
	var next = new IP(value + 1);
	return next;
};

/**
 * Get an IP object representing the previous address before the given IP.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} ip Address to operate on
 * @return {?IP} Previous IP address or null if given IP is min value
 */
IP.prev = function (ip) {
	var value = IP.parse(ip);
	if (value <= IP.MIN_VALUE) {
		return null;
	}
	var prev = new IP(value - 1);
	return prev;
};

/**
 * Determine if two IPs have the same value.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} left First IP to compare
 * @param {Number|String|IP} right Second IP to compare
 * @return {Boolean} The IP addresses are equal
 */
IP.equal = function (left, right) {
	left = IP.parse(left);
	right = IP.parse(right);
	return left === right;
};

/**
 * Compare the raw values of two IPs.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} left First IP to compare
 * @param {Number|String|IP} right Second IP to compare
 * @return {Number} -1 if 'left' is less than 'right', 1 if greater, 0 otherwise
 */
IP.compare = function (left, right) {
	left = IP.parse(left);
	right = IP.parse(right);
	if (left < right) {
		return -1;
	}
	if (left > right) {
		return 1;
	}
	return 0;
};

/**
 * Determine if left IP's value is less than right's.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} left First IP to compare
 * @param {Number|String|IP} right Second IP to compare
 * @return {Boolean} True if left IP's value is less than right's
 */
IP.lt = function (left, right) {
	left = IP.parse(left);
	right = IP.parse(right);
	return left < right;
};

/**
 * Determine if left IP's value is less than or equal to right's.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} left First IP to compare
 * @param {Number|String|IP} right Second IP to compare
 * @return {Boolean} True if left IP's value is less than or equal to right's
 */
IP.lte = function (left, right) {
	left = IP.parse(left);
	right = IP.parse(right);
	return left <= right;
};

/**
 * Determine if left IP's value is greater than right's.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} left First IP to compare
 * @param {Number|String|IP} right Second IP to compare
 * @return {Boolean} True if left IP's value is greater than right's
 */
IP.gt = function (left, right) {
	left = IP.parse(left);
	right = IP.parse(right);
	return left > right;
};

/**
 * Determine if left IP's value is greater than or equal to right's.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} left First IP to compare
 * @param {Number|String|IP} right Second IP to compare
 * @return {Boolean} True if left IP's value is greater than or equal to right's
 */
IP.gte = function (left, right) {
	left = IP.parse(left);
	right = IP.parse(right);
	return left >= right;
};

/**
 * Get the inverse IP of a given IP. All 1 bits are switched off and vice-versa.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} ip Address to invert
 * @return {?IP} Inverse IP
 */
IP.not = function (ip) {
	// jshint bitwise:false
	ip = IP.parse(ip);
	var parts = IP.getParts(ip);
	var result = parts.reduce(function (total, part) {
		total *= 0x100;
		total += ~part & 0xff;
		return total;
	}, 0);
	var inverse = new IP(result);
	return inverse;
};

/**
 * Generate a random dotted decimal IP address.
 * @memberOf IP
 * @static
 * @return {String} A randomly generated IP
 */
IP.random = function () {
	return IP.format(IP.MAX_VALUE * Math.random());
};

/**
 * Get the address class of an IP.
 * @memberOf IP
 * @static
 * @param {Number|String|IP} ip IP address
 * @return {String} The address class
 */
IP.getClass = function (ip) {
	// jshint bitwise:false
	ip = IP.parse(ip);
	if ((ip & 0x80000000) === 0) {
		return 'A';
	}
	if ((ip & 0x40000000) === 0) {
		return 'B';
	}
	if ((ip & 0x20000000) === 0) {
		return 'C';
	}
	if ((ip & 0x10000000) === 0) {
		return 'D';
	}
	return 'E';
};

/**
 * Determine if an input is a valid IP address
 * @memberOf IP
 * @static
 * @param {Number|String|IP} input IP address
 * @return {String} True if input is a valid IP address
 */
IP.isValid = function (input) {
	var value = IP.parse(input);
	var valid = !(value === null || isNaN(value));
	return valid;
};

/**
 * Get the raw value of this IP address.
 * @memberOf IP
 * @return {Number} Raw value
 * @example
 *
 * var localhost = new IP('127.0.0.1');
 * localhost.valueOf(); // 2130706433
 * Number(localhost);   // 2130706433
 */
IP.prototype.valueOf = function () {
	return Number(this.value);
};

/**
 * Get the string representation of this IP.
 * @memberOf IP
 * @param {Number|String} [rad=10] Radix
 * @return {String} String representation
 * @example
 *
 * var localhost = new IP(0x7f000001);
 * localhost.toString(); // "127.0.0.1"
 * String(localhost);    // "127.0.0.1"
 */
IP.prototype.toString = function (rad) {
	return this.format(rad);
};

/**
 * Format this IP address.
 * @memberOf IP
 * @param {Number|String} [rad=10] Optional radix
 * @return {String} Dotted string
 */
IP.prototype.format = function (rad) {
	return IP.format(this, rad);
};

/**
 * Get an IP object representing the next address after this IP.
 * @memberOf IP
 * @return {?IP} Next IP address or null if given IP is max value
 */
IP.prototype.next = function () {
	return IP.next(this);
};

/**
 * Get an IP object representing the previous address before this IP.
 * @memberOf IP
 * @return {?IP} Previous IP address or null if given IP is min value
 */
IP.prototype.prev = function () {
	return IP.prev(this);
};

/**
 * Determine if this IP address has the same value as another.
 * @memberOf IP
 * @param {Number|String|IP} other IP to compare
 * @return {Boolean} IPs are equal
 */
IP.prototype.equals = function (other) {
	return IP.equal(this, other);
};

/**
 * Compare the raw value of this IP against another.
 * @memberOf IP
 * @param {Number|String|IP} other IP to compare
 * @return {Number} -1 if this is less than 'other', 1 if greater, 0 otherwise
 */
IP.prototype.compare = function (other) {
	return IP.compare(this, other);
};

/**
 * Determine if this IP's value is less than another.
 * @memberOf IP
 * @param {Number|String|IP} other IP to compare
 * @return {Boolean} True if this IP's value is less than the other
 */
IP.prototype.lt = function (other) {
	return IP.lt(this, other);
};

/**
 * Determine if this IP's value is less than or equal to another.
 * @memberOf IP
 * @param {Number|String|IP} other IP to compare
 * @return {Boolean} True if this IP's value is less than or equal to the other
 */
IP.prototype.lte = function (other) {
	return IP.lte(this, other);
};

/**
 * Determine if this IP's value is greater than another.
 * @memberOf IP
 * @param {Number|String|IP} other IP to compare
 * @return {Boolean} True if this IP's value is greater than the other
 */
IP.prototype.gt = function (other) {
	return IP.gt(this, other);
};

/**
 * Determine if this IP's value is greater than or equal to another.
 * @memberOf IP
 * @param {Number|String|IP} other IP to compare
 * @return {Boolean} True if this IP's value is greater than or equal to the
 *   other
 */
IP.prototype.gte = function (other) {
	return IP.gte(this, other);
};

/**
 * Get the inverse IP of this IP. All 1 bits are switched off and vice-versa.
 * @memberOf IP
 * @return {?IP} Inverse IP
 */
IP.prototype.not = function () {
	return IP.not(this);
};

/**
 * Determine if the value of this IP address is valid.
 * @memberOf IP
 * @return {Boolean} True if valid
 */
IP.prototype.isValid = function () {
	return IP.isValid(this);
};

/**
 * IP address mask constructor. Can be given a number, an IP object, another
 *   Mask object, an IP-like string or a numeric string. Will default to no
 *   value (i.e. mask zero bits).
 * @module Mask
 * @constructor
 * @param {Number|String|IP|Mask} [input=0] Mask value
 * @example
 *
 * var subnet = Mask('255.255.255.0');     // 'new' not required
 * var loopback = new Mask('127.0.0.0/8'); // input can be an IP/mask pair
 * var first24 = new Mask(24);             // input can be a number
 */
var Mask = IP.Mask = function Mask (input) {
	if (!(this instanceof Mask)) {
		return new Mask(input);
	}
	this.value = Mask.parse(input || 0);
};

/**
 * The minimum value a mask can have. Represents no bits masked.
 * @memberOf Mask
 * @static
 * @type {Number}
 */
Mask.MIN_VALUE = 0;

/**
 * The maximum value a mask can have. Represents all bits masked.
 * @memberOf Mask
 * @static
 * @type {Number}
 */
Mask.MAX_VALUE = 0x20;

/**
 * Parse a mask and get its raw value. Input can be a Mask object, a number,
 *   or an IP-like value.
 * @memberOf Mask
 * @static
 * @param {Number|String|IP|Mask} input Mask to parse
 * @return {?Number} Raw value
 */
Mask.parse = function (input) {
	if (input === null) {
		return null;
	}
	if (!isNaN(input) && input <= Mask.MAX_VALUE) {
		return Number(input);
	}
	input = String(input);
	var slashIndex = input.indexOf('/');
	if (slashIndex > -1) {
		input = input.substring(slashIndex + 1);
		return Mask.parse(input);
	}
	var inverse = IP.not(input);
	var bits = Math.ceil(Math.log(inverse + 1) / Math.LN2);
	var value = Mask.MAX_VALUE - bits;
	return value;
};

/**
 * Get the formatted string for a given mask in dotted decimal form.
 * @memberOf Mask
 * @param {Number|String|IP|Mask} input Mask to parse
 * @return {?Number} Formatted mask
 */
Mask.format = function (input) {
	input = Mask.parse(input);
	if (isNaN(input) || input === null) {
		return null;
	}
	var bits = Mask.MAX_VALUE - input;
	var value = Math.pow(2, bits) - 1;
	var inverse = IP.not(value);
	var formatted = IP.format(inverse);
	return formatted;
};

/**
 * Determine if two masks have the same value.
 * @memberOf Mask
 * @static
 * @param {Number|String|IP|Mask} left First mask to compare
 * @param {Number|String|IP|Mask} right Second mask to compare
 * @return {Boolean} The masks are equal
 */
Mask.equal = function (left, right) {
	left = Mask.parse(left);
	right = Mask.parse(right);
	return left === right;
};

/**
 * Get the raw value of this mask.
 * @memberOf Mask
 * @return {Number} Raw value
 */
Mask.prototype.valueOf = function () {
	return Number(this.value);
};

/**
 * Get the string representation of this mask.
 * @memberOf Mask
 * @return {?String} String representation
 */
Mask.prototype.toString = function () {
	return this.format();
};

/**
 * Format this IP mask.
 * @memberOf Mask
 * @return {?String} Dotted decimal
 */
Mask.prototype.format = function () {
	return Mask.format(this);
};

/**
 * Determine if this mask has the same value as another.
 * @memberOf Mask
 * @param {Number|String|IP|Mask} other Mask to compare
 * @return {Boolean} Masks are equal
 */
Mask.prototype.equals = function (other) {
	return Mask.equal(this, other);
};

return IP;

}));
