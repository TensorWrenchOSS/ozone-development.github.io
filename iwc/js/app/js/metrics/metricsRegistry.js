var ozpIwc=ozpIwc || {};
/**
 * Metrics capabilities for the IWC.
 * @module metrics
 */

/**
 * A repository of metrics
 * @class MetricsRegistry
 * @namespace ozpIwc
 */
ozpIwc.MetricsRegistry=function() {
    /**
     * Key value store of metrics
     * @property metrics
     * @type Object
     */
	this.metrics={};
    var self=this;
    this.gauge('registry.metrics.types').set(function() {
        return Object.keys(self.metrics).length;
    });

};

/**
 * Finds or creates the metric in the registry.
 * @method findOrCreateMetric
 * @private
 * @param {String} name Name of the metric.
 * @param {Function} type The constructor of the requested type for this metric.
 * @returns {ozpIwc.MetricType} Null if the metric already exists of a different type. Otherwise a reference to
 * the metric.
 */
ozpIwc.MetricsRegistry.prototype.findOrCreateMetric=function(name,Type) {
	var m= this.metrics[name];
    if(!m) {
        m = this.metrics[name] = new Type();
        m.name=name;
        return m;
    }
	if(m instanceof Type){
			return m;
	} else {
			return null;
	}			
};

/**
 * Joins the arguments together into a name.
 * @method makeName
 * @private
 * @param {String[]} args Array or the argument-like "arguments" value.
 * @returns {String} the name.
 */
ozpIwc.MetricsRegistry.prototype.makeName=function(args) {
	// slice is necessary because "arguments" isn't a real array, and it's what
	// is usually passed in, here.
	return Array.prototype.slice.call(args).join(".");
};

/**
 * Returns the counter instance(s) for the given name(s). If it does not exist it will be created.
 *
 * @method counter
 * @param {String} name Components of the name.
 *
 * @returns {ozpIwc.metricTypes.Counter}
 */
ozpIwc.MetricsRegistry.prototype.counter=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Counter);
};

/**
 * Returns the meter instance(s) for the given name(s). If it does not exist it will be created.
 *
 * @method meter
 * @param {String} name Components of the name.
 *
 * @returns {ozpIwc.metricTypes.Meter}
 */
ozpIwc.MetricsRegistry.prototype.meter=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Meter);
};

/**
 * Returns the gauge instance(s) for the given name(s). If it does not exist it will be created.
 *
 * @method gauge
 * @param {String} name Components of the name.
 * @returns {ozpIwc.metricTypes.Gauge}
 */
ozpIwc.MetricsRegistry.prototype.gauge=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Gauge);
};

/**
 * Returns the histogram instance(s) for the given name(s). If it does not exist it will be created.
 *
 * @method histogram
 * @param {String} name Components of the name.
 *
 * @returns {ozpIwc.metricTypes.Histogram}
 */
ozpIwc.MetricsRegistry.prototype.histogram=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Histogram);
};

/**
 * Returns the timer instance(s) for the given name(s). If it does not exist it will be created.
 *
 * @method timer
 * @param {String} name Components of the name.
 *
 * @returns {ozpIwc.metricTypes.Timer}
 */
ozpIwc.MetricsRegistry.prototype.timer=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Timer);
};

/**
 * Registers a metric to the metric registry
 *
 * @method register
 * @param {String} name Components of the name.
 * @param {ozpIwc.MetricType} metric
 *
 * @returns {ozpIwc.MetricType} The metric passed in.
 */
ozpIwc.MetricsRegistry.prototype.register=function(name,metric) {
	this.metrics[this.makeName(name)]=metric;
	
	return metric;
};

/**
 * Converts the metric registry to JSON.
 *
 * @method toJson
 * @returns {Object} JSON converted registry.
 */
ozpIwc.MetricsRegistry.prototype.toJson=function() {
	var rv={};
	for(var k in this.metrics) {
		var path=k.split(".");
		var pos=rv;
		while(path.length > 1) {
			var current=path.shift();
			pos = pos[current]=pos[current] || {};
		}
		pos[path[0]]=this.metrics[k].get();
	}
	return rv;
};

/**
 * Returns an array of all metrics in the registry
 * @method allMetrics
 * @returns {ozpIwc.MetricType[]}
 */
ozpIwc.MetricsRegistry.prototype.allMetrics=function() {
    var rv=[];
    for(var k in this.metrics) {
        rv.push(this.metrics[k]);
    }
    return rv;
};

ozpIwc.metrics=new ozpIwc.MetricsRegistry();
