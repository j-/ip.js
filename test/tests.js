QUnit.module('IP');

QUnit.test('IP.parse()', function (assert) {
	var GOOGLE = 1249763844;
	assert.equal(GOOGLE, IP.parse('74.125.226.4'), 'Dotted decimal');
	assert.equal(GOOGLE, IP.parse('1249763844'), 'Flat decimal');
	assert.equal(GOOGLE, IP.parse('0112.0175.0342.0004'), 'Dotted octal');
	assert.equal(GOOGLE, IP.parse('011237361004'), 'Flat octal');
	assert.equal(GOOGLE, IP.parse('0x4A.0x7D.0xE2.0x04'), 'Dotted hexadecimal');
	assert.equal(GOOGLE, IP.parse('0x4A7DE204'), 'Flat hexadecimal');
	assert.equal(GOOGLE, IP.parse('74.0175.0xe2.4'), 'Dotted mixed');
	// from http://superuser.com/q/486788
	assert.equal(IP.parse('192.168.072'), IP.parse('192.168.0.072'), 'Missing part');
	assert.equal(IP.parse('192.168.072'), IP.parse('192.168.0.58'), 'Same value');
	// from http://superuser.com/q/894303
	assert.equal(IP.parse('172.016.021.004'), IP.parse('172.14.17.4'), 'Same value');
});

QUnit.test('IP.format()', function (assert) {
	var GOOGLE = '74.125.226.4';
	assert.equal(GOOGLE, IP.format('74.125.226.4'), 'Dotted decimal');
	assert.equal(GOOGLE, IP.format('1249763844'), 'Flat decimal');
	assert.equal(GOOGLE, IP.format('0112.0175.0342.0004'), 'Dotted octal');
	assert.equal(GOOGLE, IP.format('011237361004'), 'Flat octal');
	assert.equal(GOOGLE, IP.format('0x4A.0x7D.0xE2.0x04'), 'Dotted hexadecimal');
	assert.equal(GOOGLE, IP.format('0x4A7DE204'), 'Flat hexadecimal');
	assert.equal(GOOGLE, IP.format('74.0175.0xe2.4'), 'Dotted mixed');
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
