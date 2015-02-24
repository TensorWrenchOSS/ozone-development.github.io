/**
 * @submodule metrics.types
 */

/**
 * @class Timer
 * @namespace ozpIwc
 * @extends ozpIwc.metricTypes.BaseMetric
 * @type {Function}
 */
ozpIwc.metricTypes.Timer=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function() {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);
    /**
     * @property meter
     * @type {ozpIwc.metricTypes.Meter}
     */
	this.meter=new ozpIwc.metricTypes.Meter();

    /**
     * @property histogram
     * @type {ozpIwc.metricTypes.Histogram}
     */
	this.histogram=new ozpIwc.metricTypes.Histogram();
});

/**
 * @method mark
 * @param {Number} val
 * @param {Number} timestamp Current time in milliseconds.
 */
ozpIwc.metricTypes.Timer.prototype.mark=function(val,time) {
	this.meter.mark();
	this.histogram.mark(val,time);
};

/**
 * Starts the timer
 *
 * @method start
 * @returns {Function}
 */
ozpIwc.metricTypes.Timer.prototype.start=function() {
	var self=this;
	var startTime=ozpIwc.util.now();
	return function() {
		var endTime=ozpIwc.util.now();
		self.mark(endTime-startTime,endTime);
	};
};

/**
 * Times the length of a function call.
 *
 * @method time
 * @param {Function}callback
 */
ozpIwc.metricTypes.Timer.prototype.time=function(callback) {
	var startTime=ozpIwc.util.now();
	try {
		callback();
	} finally {
		var endTime=ozpIwc.util.now();
		this.mark(endTime-startTime,endTime);
	}
};

/**
 * Returns a histogram of the timer metrics.
 *
 * @method get
 * @returns {Object}
 */
ozpIwc.metricTypes.Timer.prototype.get=function() {
	var val=this.histogram.get();
	var meterMetrics=this.meter.get();
	for(var k in meterMetrics) {
		val[k]=meterMetrics[k];
	}
	return val;
};