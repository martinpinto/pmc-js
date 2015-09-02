# Probabilistic Multiplicity Counting Sketch (PMC)

PMC to Count-Min is as HyperLogLog to Bloomfilter

This is the first implementation ever of the Probabilistic Multiplicity Counting Sketch in node.js.

Package pmc provides a Probabilistic Multiplicity Counting Sketch, a novel data structure that is capable of accounting traffic per flow probabilistically, that can be used as an alternative to Count-min sketch.
The stream processing algorithm — Probabilistic Multiplicity Counting (PMC) — uses probabilistic counting techniques to determine the approximate multiplicity of each element in large streams. It is particularly well suited for traffic measurements on high-speed communication links and likewise applicable for many other purposes.

Count-Min Sketches hold counters in a matrix-like organization. A big caveat for both Spectral Bloom Filters and Count-Min Sketches is that the maximum multiplicity has to be known a priori quite accurately, to provide large enough counters without wasting too much memory. PMC does not need to know the maximum frequency beforehand, and its counting operation is much simpler.

For details about the algorithm and citations please use this article:

["High-Speed Per-Flow Traffic Measurement with Probabilistic Multiplicity Counting" by Peter Lieven & Björn Scheuermann]
(https://wwwcn.cs.uni-duesseldorf.de/publications/publications/library/Lieven2010a.pdf)

## Example Usage
```javascript
  var sketch = newForMaxFlows(1000000);
	// increment a flow 'flow1' 1000000 times
	for (var i = 0; i < 1000000; i++) {
     sketch.increment("flow1");
	}
	var count = sketch.getEstimate('flow1');
```
