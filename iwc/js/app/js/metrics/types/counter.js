/**
 * Types of metrics available.
 * @module metrics
 * @submodule metrics.types
 */


/**
 * A counter running total that can be adjusted up or down.
 * Where a meter is set to a known value at each update, a
 * counter is incremented up or down by a known change.
 *
 * @class Counter
 * @namespace ozpIwc.metricTypes
 * @extends ozpIwc.metricTypes.BaseMetric
 */
ozpIwc.metricTypes.Counter=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function() {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);
	this.value=0;
});

/**
 * @method inc
 * @param {Number} [delta=1]  Increment by this value
 * @returns {Number} Value of the counter after increment
 */
ozpIwc.metricTypes.Counter.prototype.inc=function(delta) { 
	return this.value+=(delta?delta:1);
};

/**
 * @method dec
 * @param {Number} [delta=1]  Decrement by this value
 * @returns {Number} Value of the counter after decrement
 */
ozpIwc.metricTypes.Counter.prototype.dec=function(delta) { 
	return this.value-=(delta?delta:1);
};
