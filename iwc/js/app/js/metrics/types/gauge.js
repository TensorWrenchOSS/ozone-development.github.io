ozpIwc.metricTypes=ozpIwc.metricTypes || {};
/**
 * @submodule metrics.types
 */

/**
 * @callback ozpIwc.metricTypes.Gauge~gaugeCallback
 * @returns {ozpIwc.metricTypes.MetricsTree} 
 */

/**
 * A gauge is an externally defined set of metrics returned by a callback function
 *
 * @class Gauge
 * @namespace ozpIwc.metricTypes
 * @extends ozpIwc.metricTypes.BaseMetric
 * @param {ozpIwc.metricTypes.Gauge~gaugeCallback} metricsCallback
 */
ozpIwc.metricTypes.Gauge=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function(metricsCallback) {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);
	this.callback=metricsCallback;
});
/**
 * Set the metrics callback for this gauge.
 *
 * @method set
 * @param {ozpIwc.metricTypes.Gauge~gaugeCallback} metricsCallback
 *
 * @returns {ozpIwc.metricTypes.Gauge} this
 */
ozpIwc.metricTypes.Gauge.prototype.set=function(metricsCallback) { 
	this.callback=metricsCallback;
	return this;
};
/**
 * Executes the callback and returns a metrics tree.
 *
 * @method get
 *
 * @returns {ozpIwc.metricTypes.MetricsTree}
 */
ozpIwc.metricTypes.Gauge.prototype.get=function() {
    if (this.callback) {
        return this.callback();
    }
    return undefined;
};
