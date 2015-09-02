var farmhash = require('farmhash');

var georand = function georand(w) {
	var i = Math.random();
	var hasher = farmhash.hash64(new Buffer(i));
	var val = farmhash.hash64(new Buffer(hasher)); // FIXME: test further!
	// Calculate the position of the leftmost 1-bit.
	var r = 0;
	for (; r < w - 1; r++) {
		if (val & 0x8000000000000000 != 0) {
			return r;
		}
		val <<= 1;
	}
	return w - 1;
};

var rand = function rand(m) {
	return Math.random() % m;
};

/*
* @param: s *Sketch
* @param: flow []byte
*/
var printVirtualMatrix = function printVirtualMatrix(s, flow) {
	for (var i = 0.0; i < s.m; i++) {
		for (var j = 0.0; j < s.w; j++) {
			var pos = s.getPos("pmc", i, j); // FIXME: use Buffer()
			if (s.bitmap[pos] == false) {
				console.log(0);
			} else {
				console.log(1);
			}
		}
		console.log("");
	}
}

module.exports.georand = georand;
module.exports.rand = rand;
module.exports.printVirtualMatrix = printVirtualMatrix;
