QUnit.module('IP');

QUnit.test('IP()', function (assert) {
	var a = new IP('127.0.0.1');
	assert.ok(a instanceof IP, 'Can be constructed');
	var b = IP('127.0.0.1');
	assert.ok(b instanceof IP, 'Can be constructed without "new" keyword');
	var c = new IP();
	assert.equal(c.valueOf(), 0, 'Default value is zero');
	var d = new IP('0.0.0.0');
	assert.equal(d.valueOf(), 0, 'Can be initialized with min IP');
	var e = new IP('255.255.255.255');
	assert.equal(e.valueOf(), 0xffffffff, 'Can be initialized with max IP');
	var f = new IP('1.2.3.4.5');
	assert.equal(f.valueOf(), 0, 'Invalid input will have zero value');
});

QUnit.test('IP.parse()', function (assert) {
	var GOOGLE = 1249763844;
	assert.equal(IP.parse('74.125.226.4'), GOOGLE, 'Dotted decimal');
	assert.equal(IP.parse('1249763844'), GOOGLE, 'Flat decimal');
	assert.equal(IP.parse('0112.0175.0342.0004'), GOOGLE, 'Dotted octal');
	assert.equal(IP.parse('011237361004'), GOOGLE, 'Flat octal');
	assert.equal(IP.parse('0x4A.0x7D.0xE2.0x04'), GOOGLE, 'Dotted hexadecimal');
	assert.equal(IP.parse('0x4A7DE204'), GOOGLE, 'Flat hexadecimal');
	assert.equal(IP.parse('74.0175.0xe2.4'), GOOGLE, 'Dotted mixed');
	// from http://superuser.com/q/486788
	assert.equal(IP.parse('192.168.072'), IP.parse('192.168.0.072'), 'Missing part');
	assert.equal(IP.parse('192.168.072'), IP.parse('192.168.0.58'), 'Same value');
	// from http://superuser.com/q/894303
	assert.equal(IP.parse('172.016.021.004'), IP.parse('172.14.17.4'), 'Same value');
});

QUnit.test('IP.parsePart()', function (assert) {
	assert.equal(IP.parsePart(0), 0, 'Parse 0');
	assert.equal(IP.parsePart('0'), '0', 'Parse "0"');
	assert.equal(IP.parsePart('0x0'), '0x0', 'Parse "0x0"');
	assert.equal(IP.parsePart('00'), '00', 'Parse "00"');
	assert.equal(IP.parsePart(255), 255, 'Parse 255');
	assert.equal(IP.parsePart('255'), 255, 'Parse "255"');
	assert.equal(IP.parsePart('0xFF'), 255, 'Parse "0xFF"');
	assert.equal(IP.parsePart('0377'), 255, 'Parse "0377"');
	assert.equal(IP.parsePart('0xffffffff'), 0xffffffff, 'Parse 0xffffffff');
	assert.equal(IP.parsePart('-1'), null, 'Do not parse "-1"');
});

QUnit.test('IP.parseRadix()', function (assert) {
	assert.equal(IP.parseRadix(8), 8, 'Octal from 8');
	assert.equal(IP.parseRadix(10), 10, 'Decimal from 10');
	assert.equal(IP.parseRadix(16), 16, 'Hexadecimal from 16');
	assert.equal(IP.parseRadix('8'), 8, 'Octal from "8"');
	assert.equal(IP.parseRadix('10'), 10, 'Decimal from "10"');
	assert.equal(IP.parseRadix('16'), 16, 'Hexadecimal from "16"');
	assert.equal(IP.parseRadix('oct'), 8, 'Octal from "oct"');
	assert.equal(IP.parseRadix('dec'), 10, 'Decimal from "dec"');
	assert.equal(IP.parseRadix('hex'), 16, 'Hexadecimal from "hex"');
	assert.equal(IP.parseRadix(undefined), null, 'No value from undefined');
	assert.equal(IP.parseRadix(null), null, 'No value from null');
	assert.equal(IP.parseRadix(''), null, 'No value from ""');
	assert.equal(IP.parseRadix(1), null, 'No value from 1');
	assert.equal(IP.parseRadix(2), null, 'No value from 2');
	assert.equal(IP.parseRadix(7), null, 'No value from 7');
	assert.equal(IP.parseRadix(100), null, 'No value from 100');
});

QUnit.test('IP.format()', function (assert) {
	var GOOGLE = '74.125.226.4';
	assert.equal(IP.format('74.125.226.4'), GOOGLE, 'Dotted decimal');
	assert.equal(IP.format('1249763844'), GOOGLE, 'Flat decimal');
	assert.equal(IP.format('0112.0175.0342.0004'), GOOGLE, 'Dotted octal');
	assert.equal(IP.format('011237361004'), GOOGLE, 'Flat octal');
	assert.equal(IP.format('0x4A.0x7D.0xE2.0x04'), GOOGLE, 'Dotted hexadecimal');
	assert.equal(IP.format('0x4A7DE204'), GOOGLE, 'Flat hexadecimal');
	assert.equal(IP.format('74.0175.0xe2.4'), GOOGLE, 'Dotted mixed');
	assert.equal(IP.format(GOOGLE, 16).toLowerCase(), '0x4a.0x7d.0xe2.0x4', 'Can format hexadecimal');
	assert.equal(IP.format(GOOGLE, 8), '0112.0175.0342.04', 'Can format octal');
});

QUnit.test('IP.equal()', function (assert) {
	var GOOGLE = '74.125.226.4';
	assert.ok(IP.equal(GOOGLE, '74.125.226.4'), 'Dotted decimal');
	assert.ok(IP.equal(GOOGLE, '1249763844'), 'Flat decimal');
	assert.ok(IP.equal(GOOGLE, '0112.0175.0342.0004'), 'Dotted octal');
	assert.ok(IP.equal(GOOGLE, '011237361004'), 'Flat octal');
	assert.ok(IP.equal(GOOGLE, '0x4A.0x7D.0xE2.0x04'), 'Dotted hexadecimal');
	assert.ok(IP.equal(GOOGLE, '0x4A7DE204'), 'Flat hexadecimal');
	assert.ok(IP.equal(GOOGLE, '74.0175.0xe2.4'), 'Dotted mixed');
	// from http://superuser.com/q/486788
	assert.ok(IP.equal('192.168.072', '192.168.0.072'), 'Missing part');
	assert.ok(IP.equal('192.168.072', '192.168.0.58'), 'Same value');
	// from http://superuser.com/q/894303
	assert.ok(IP.equal('172.016.021.004', '172.14.17.4'), 'Same value');
});

QUnit.test('IP.random()', function (assert) {
	var rand;
	for (var i = 0; i < 10; i++) {
		rand = IP.random();
		assert.equal(typeof rand, 'string', 'Result must be string');
		assert.notEqual(IP.parse(rand), null, 'Result must be valid');
	}
});

QUnit.test('IP.next()', function (assert) {
	assert.ok(IP.next(0) instanceof IP, 'Returns IP instance');
	assert.equal(IP.next(0).valueOf(), 1, 'Increments the IP value');
	assert.ok(IP.equal(IP.next('192.168.0.255'), '192.168.1.0'), 'Rollover IP value');
	assert.notEqual(IP.parse(IP.next(IP.MAX_VALUE)), IP.MAX_VALUE + 1, 'Does not go beyond max value');
});

QUnit.test('IP.prev()', function (assert) {
	assert.ok(IP.prev(1) instanceof IP, 'Returns IP instance');
	assert.equal(IP.prev(1).valueOf(), 0, 'Decrement the IP value');
	assert.ok(IP.equal(IP.prev('192.168.1.0'), '192.168.0.255'), 'Rollback IP value');
	assert.notEqual(IP.parse(IP.prev(IP.MIN_VALUE)), IP.MIN_VALUE - 1, 'Does not go below min value');
});
