var farmhash = require('farmhash'),
	acquire = require('acquire'),
	utils = acquire('utils');

/*
Sketch is a Probabilistic Multiplicity Counting Sketch, a novel data structure
that is capable of accounting traffic per flow probabilistically, that can be
used as an alternative to Count-min sketch.
*/
var Sketch = module.exports = function (l, m, w, bitmap) {
	this.l = l;      // float64
	this.m = m;      // float64
	this.w = w;      // float64
	this.bitmap = bitmap; // bitmaps.Bitmap // FIXME: Get Rid of bitmap and use uint32 array
};

/*
* New returns a PMC Sketch with the properties:
* l = total number of bits for sketch
* m = total number of rows for each flow
* w = total number of columns for each flow
*/
function newSketch(l, m, w) {
	if (l == 0) {
		throw new Error("Expected l > 0, got 0");
	}
	if (m == 0) {
		throw new Error("Expected m > 0, got 0");
	}
	if (w == 0) {
		throw new Error("Expected w > 0, got 0");
	}
	return new Sketch(l, m, w, new Array(Math.floor(l)));
}

/**
* NewForMaxFlows returns a PMC Sketch adapted to the size of the max number of
* flows expected.
* @param: maxFlows uint
*/
function newForMaxFlows(maxFlows) {
	var l = maxFlows * 32;
	return newSketch(l, 256, 32);
}

/**
* It is straightforward to use any uniformly distributed hash functiontion with
* sufficiently random output in the role of H: the input parameters can
* simply be concatenated to a single bit string.
* @param: f []byte
* @param: i float64
* @param: j float64
*/
Sketch.prototype.getPos = function (f, i, j) {
  var self = this;
	var s = "" + i + f + j;
	var hash = farmhash.hash64(new Buffer(s)); // farmhash returns a string
	return parseInt(hash) % self.l;
};

/**
* Increment the count of the flow by 1
* @param: flow []byte
*/
Sketch.prototype.increment = function (flow) {
  var self = this;
	var i = utils.rand(self.m);
	var j = utils.georand(self.w);
	var pos = self.getPos(flow, i, j);
	self.bitmap.push(pos);
};

/*
* @param: flow []byte
*/
Sketch.prototype.getZSum = function (flow) {
	var self = this;
  var z = 0.0;
	for (var i = 0.0; i < self.m; i++) {
		var j = 0.0;
		for (; j < self.w;) {
			var pos = self.getPos(flow, i, j);
			if (self.bitmap[pos] == false) {
				break;
			}
			j++;
		}
		z += j;
	}
	return z;
};

/*
* @param: flow []byte
*/
Sketch.prototype.getEmptyRows = function (flow) {
	var self = this;
  var k = 0.0;
	for (var i = 0.0; i < self.m; i++) {
		var pos = self.getPos(flow, i, 0);
		if (self.bitmap[pos] == false) {
			k++;
		}
	}
	return k;
};

Sketch.prototype.getP = function () {
	var self = this;
  var ones = 0;
	for (var i = 0; i < self.bitmap.length; i++) {
		if (self.bitmap[i]) {
			ones++;
		}
	}
	return ones / self.l;
};

function qk(k, n, p) {
	var result = 1.0;
	for (var i = 1.0; i <= k; i++) {
		result *= (1.0 - Math.pow(1.0 - Math.pow(2, -i), n) * (1.0 - p));
	}
	return result;
}

Sketch.prototype.getE = function (n, p) {
  var self = this;
	var result = 0.0;
	for (var k = 1.0; k <= self.w; k++) {
		result += (k * (qk(k, n, p) - qk(k + 1, n, p)));
	}
	return result;
};

Sketch.prototype.rho = function (n, p) {
  var self = this;
	return Math.pow(2, self.getE(n, p)) / n;
};

/**
* GetEstimate returns the estimated count of a given flow
* @param: flow []byte
*/
Sketch.prototype.getEstimate = function (flow) {
	var self = this;
	if (self.p == 0) {
		self.p = self.getP();
	}
	var k = self.getEmptyRows(flow);
	// Use const due to quick conversion against 0.78 (n = 1000000.0)
	// n := -2 * m * math.Log((k)/(m*(1-p)))
	var e = 0.0;
	var n = 100000.0;

	// Dealing with small multiplicities
	if (k / (1 - self.p) > 0.3 * self.m) {
		e = -2 * self.m * Math.log(k / (self.m * (1 - self.p)));
	} else {
		var z = self.getZSum(flow);
		e = self.m * Math.pow(2, z / self.m) / self.rho(n, self.p);
	}
	return e;
};

function main() {
  var sketch = newForMaxFlows(1000000);
	// increment a flow 'flow1' 1000000 times
	for (var i = 0; i < 1000000; i++) {
     sketch.increment("flow1");
	}
	var count = sketch.getEstimate('flow1');
	console.log(count);
}
main();
