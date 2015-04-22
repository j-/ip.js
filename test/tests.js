QUnit.module('main');

QUnit.test('IP.parse', function (assert) {
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
