/*! ip.js - Jamie Hoeks */
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
	if (typeof input === 'number') {
		// pass through
		return Math.floor(input);
	}
	if (input instanceof IP) {
		return Number(input);
	}
	if (input === null) {
		return null;
	}
	input = String(input);
	var parts = IP.splitParts(input);
	var count = parts.length;
	var value = 0;
	switch (count) {
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
	if (value > IP.MAX_VALUE || value < IP.MIN_VALUE) {
		return null;
	}
	return value;
};

/**
 * Split an input string into its parts. Parts are delimited by a period.
 * @memberOf IP
 * @static
 * @param {String} input String to split
 * @return {String[]} The input string split into parts
 */
IP.splitParts = function (input) {
	input = String(input);
	var parts = input.split('.');
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
 * @param {Number|String} part Part to parse
 * @return {Number} The raw value of the given part
 */
IP.parsePart = function (part) {
	var result;
	if (typeof part === 'number') {
		// pass through
		return part;
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

return IP;

}));
