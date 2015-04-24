QUnit.module('Mask');

var Mask = IP.Mask;

QUnit.test('Mask.parse()', function (assert) {
	assert.equal(Mask.parse(8), 8, 'Can parse number');
	assert.equal(Mask.parse('8'), 8, 'Can parse numeric string');
	assert.equal(Mask.parse('127.0.0.1/8'), 8, 'Can parse "127.0.0.1/8"');
	assert.equal(Mask.parse('255.0.0.0'), 8, 'Can parse "255.0.0.0"');
});
