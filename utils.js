/*
import (
	"fmt"
	"hash/fnv"
	"math/rand"
	"strconv"
)
*/
function georand(w) {
	var hasher = fnv.New64a();
	var i = Math.random();
	hasher.Write([]byte(strconv.Itoa(i)));
	var val = hasher.Sum64();
	// Calculate the position of the leftmost 1-bit.
	var r = 0;
	for (; val & 0x8000000000000000 == 0 && r < w - 1; r++) {
		val <<= 1;
	}
	return r;
}

function rand(m) {
	return Math.random() % m;
}

/*
* @param: s *Sketch
* @param: flow []byte
*/
function printVirtualMatrix(s, flow) {
	for (var i = 0.0; i < s.m; i++) {
		for (var j = 0.0; j < s.w; j++) {
			var pos = s.getPos([]byte("pmc"), i, j);
			if (s.bitmap.get(pos) == false) {
				console.log(0);
			} else {
				console.log(1);
			}
		}
		console.log("");
	}
}
