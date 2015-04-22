(function () {

var IP = function (input) {
	if (!(this instanceof IP)) {
		return new IP(input);
	}
	this.value = IP.parse(input);
};

IP.parse = function (input) {
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
			value += IP.parsePart(parts[0]) << (8 * 0);
			break;
		// A.0.0.B
		case 2:
			value += IP.parsePart(parts[0]) << (8 * 3);
			value += IP.parsePart(parts[1]) << (8 * 0);
			break;
		// A.B.0.C
		case 3:
			value += IP.parsePart(parts[0]) << (8 * 3);
			value += IP.parsePart(parts[1]) << (8 * 2);
			value += IP.parsePart(parts[2]) << (8 * 0);
			break;
		// A.B.C.D
		case 4:
			value += IP.parsePart(parts[0]) << (8 * 3);
			value += IP.parsePart(parts[1]) << (8 * 2);
			value += IP.parsePart(parts[2]) << (8 * 1);
			value += IP.parsePart(parts[3]) << (8 * 0);
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

IP.parsePart = function (part) {
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

this.IP = IP;

})();
