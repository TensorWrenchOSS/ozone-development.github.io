var ozpIwc=ozpIwc || {};
/**
 * Metrics capabilities for the IWC.
 * @module metrics
 */
ozpIwc.metricTypes=ozpIwc.metricTypes || {};

/**
 * @Class BaseMetric
 * @namespace ozpIwc.metricTypes
 */
ozpIwc.metricTypes.BaseMetric=function() {
    /**
     * The value of the metric
     * @property value
     * @type Number
     * @default 0
     */
	this.value=0;

    /**
     * The name of the metric
     * @property name
     * @type String
     * @default ""
     */
    this.name="";

    /**
     * The unit name of the metric
     * @property unitName
     * @type String
     * @default ""
     */
    this.unitName="";
};

/**
 * Returns the metric value
 * @method get
 * @returns {Number}
 */
ozpIwc.metricTypes.BaseMetric.prototype.get=function() { 
	return this.value; 
};

/**
 * Sets the unit name if parameter provided. Returns the unit name if no parameter provided.
 * @method unit
 * @param {String} val
 * @returns {ozpIwc.metricTypes.BaseMetric|String}
 */
ozpIwc.metricTypes.BaseMetric.prototype.unit=function(val) { 
	if(val) {
		this.unitName=val;
		return this;
	}
	return this.unitName; 
};



