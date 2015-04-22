(function () {

var IP = function (input) {
	if (!(this instanceof IP)) {
		return new IP(input);
	}
	this.value = IP.parse(input);
};

IP.parse = function (input) {
	if (typeof input === 'number') {
		// pass through
		return input;
	}
	if (input instanceof IP) {
		return IP.value;
	}
	if (input === null) {
		return null;
	}
	input = String(input);
	var parts = IP.splitParts(input);
	var count = parts.length;
	var value = 0;
	var A = parts[0], B = parts[1], C = parts[2], D = parts[3];
	switch (count) {
		// 0.0.0.0
		case 0:
			break;
		// 0.0.0.A
		case 1:
			value += IP.parsePart(A) << (8 * 0);
			break;
		// A.0.0.B
		case 2:
			value += IP.parsePart(A) << (8 * 3);
			value += IP.parsePart(B) << (8 * 0);
			break;
		// A.B.0.C
		case 3:
			value += IP.parsePart(A) << (8 * 3);
			value += IP.parsePart(B) << (8 * 2);
			value += IP.parsePart(C) << (8 * 0);
			break;
		// A.B.C.D
		case 4:
			value += IP.parsePart(A) << (8 * 3);
			value += IP.parsePart(B) << (8 * 2);
			value += IP.parsePart(C) << (8 * 1);
			value += IP.parsePart(D) << (8 * 0);
			break;
		default:
			value = null;
	}
	return value;
};

IP.splitParts = function (input) {
	input = String(input);
	var parts = input.split(/\./g);
	return parts;
};

IP.getParts = function (input) {
	input = IP.parse(input);
	return [
		(input >> 8 * 3) % 0x100,
		(input >> 8 * 2) % 0x100,
		(input >> 8 * 1) % 0x100,
		(input >> 8 * 0) % 0x100
	];
};

IP.parsePart = function (part) {
	if (typeof part === 'number') {
		// pass through
		return part;
	}
	part = String(part).toLowerCase();
	if (part.charAt(0) === '0') {
		if (part.charAt(1) === 'x') {
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
	return result;
};

IP.parseRadix = function (rad) {
	if (typeof rad === 'number') {
		return rad;
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

IP.equal = function (left, right) {
	left = IP.parse(left);
	right = IP.parse(right);
	return left === right;
};

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

this.IP = IP;

})();
