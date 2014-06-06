/** @namespace */
var ozpIwc=ozpIwc || {};

/** @namespace */
ozpIwc.util=ozpIwc.util || {};

/**
 * Generates a large hexidecimal string to serve as a unique ID.  Not a guid.
 * @returns {String}
 */
ozpIwc.util.generateId=function() {
		return Math.floor(Math.random() * 0xffffffff).toString(16);
};

/**
 * Used to get the current epoch time.  Tests overrides this
 * to allow a fast-forward on time-based actions.
 * @returns {Number}
 */
ozpIwc.util.now=function() {
		return new Date().getTime();
};

/**
 * Create a class with the given parent in it's prototype chain.
 * @param {function} baseClass - the class being derived from
 * @param {function} newConstructor - the new base class
 * @returns {Function} newConstructor with an augmented prototype
 */
ozpIwc.util.extend=function(baseClass,newConstructor) {
	newConstructor.prototype = Object.create(baseClass.prototype); 
	newConstructor.prototype.constructor = newConstructor;
	return newConstructor;
};

/*
 * The MIT License (MIT) Copyright (c) 2012 Mike Ihbe
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * Original code owned by Mike Ihbe.  Modifications licensed under same terms.
 */
var ozpIwc=ozpIwc || {};
ozpIwc.metricsStats=ozpIwc.metricsStats || {};

ozpIwc.metricsStats.DEFAULT_POOL_SIZE=1028;

ozpIwc.metricsStats.Sample = function(){
	this.clear();
};

ozpIwc.metricsStats.Sample.prototype.update = function(val){ 
	this.values.push(val); 
};

ozpIwc.metricsStats.Sample.prototype.clear = function(){ 
	this.values = []; 
	this.count = 0; 
};
ozpIwc.metricsStats.Sample.prototype.size = function(){ 
	return this.values.length;
};

ozpIwc.metricsStats.Sample.prototype.getValues = function(){ 
	return this.values; 
};


/**
 *  Take a uniform sample of size size for all values
 *  @class
 *  @param {Number} [size=ozpIwc.metricsStats.DEFAULT_POOL_SIZE] - The size of the sample pool.
 */
ozpIwc.metricsStats.UniformSample=ozpIwc.util.extend(ozpIwc.metricsStats.Sample,function(size) {
	ozpIwc.metricsStats.Sample.apply(this);
  this.limit = size || ozpIwc.metricsStats.DEFAULT_POOL_SIZE;
});

ozpIwc.metricsStats.UniformSample.prototype.update = function(val) {
  this.count++;
  if (this.size() < this.limit) {
    this.values.push(val);
  } else {
    var rand = parseInt(Math.random() * this.count);
    if (rand < this.limit) {
      this.values[rand] = val;
    }
  }
};

// From http://eloquentjavascript.net/appendix2.html, 
// licensed under CCv3.0: http://creativecommons.org/licenses/by/3.0/

var ozpIwc=ozpIwc || {};
ozpIwc.metricsStats=ozpIwc.metricsStats || {};
/**
 * This acts as a ordered binary heap for any serializeable JS object or collection of such objects 
 * <p>Borrowed from https://github.com/mikejihbe/metrics. Originally from from http://eloquentjavascript.net/appendix2.html
 * <p>Licenced under CCv3.0
 * @class
 * @param {type} scoreFunction
 * @returns {BinaryHeap}
 */
ozpIwc.metricsStats.BinaryHeap = function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
};

ozpIwc.metricsStats.BinaryHeap.prototype = {

  clone: function() {
    var heap = new ozpIwc.metricsStats.BinaryHeap(this.scoreFunction);
    // A little hacky, but effective.
    heap.content = JSON.parse(JSON.stringify(this.content));
    return heap;
  },

  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  },

  peek: function() {
    return this.content[0];
  },

  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.sinkDown(0);
    }
    return result;
  },

  remove: function(node) {
    var len = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (var i = 0; i < len; i++) {
      if (this.content[i] == node) {
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();
        if (i != len - 1) {
          this.content[i] = end;
          if (this.scoreFunction(end) < this.scoreFunction(node))
            this.bubbleUp(i);
          else
            this.sinkDown(i);
        }
        return true;
      }
    }
    throw new Error("Node not found.");
  },

  size: function() {
    return this.content.length;
  },

  bubbleUp: function(n) {
    // Fetch the element that has to be moved.
    var element = this.content[n];
    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
          parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to move it further.
      else {
        break;
      }
    }
  },

  sinkDown: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
        element = this.content[n],
        elemScore = this.scoreFunction(element);

    while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2, child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
            child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore)
          swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
            child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score))
          swap = child2N;
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap != null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      // Otherwise, we are done.
      else {
        break;
      }
    }
  }
};


/*
 * The MIT License (MIT) Copyright (c) 2012 Mike Ihbe
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * Original code owned by Mike Ihbe.  Modifications licensed under same terms.
 */
var ozpIwc=ozpIwc || {};
ozpIwc.metricsStats=ozpIwc.metricsStats || {};

//  Take an exponentially decaying sample of size size of all values
ozpIwc.metricsStats.DEFAULT_RESCALE_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds
ozpIwc.metricsStats.DEFAULT_DECAY_ALPHA=0.015;
/**
 * This acts as a ordered binary heap for any serializeable JS object or collection of such objects 
 * <p>Borrowed from https://github.com/mikejihbe/metrics. 
 * @class 
	*/
ozpIwc.metricsStats.ExponentiallyDecayingSample=ozpIwc.util.extend(ozpIwc.metricsStats.Sample,function(size, alpha) {
	ozpIwc.metricsStats.Sample.apply(this);
  this.limit = size || ozpIwc.metricsStats.DEFAULT_POOL_SIZE;
  this.alpha = alpha || ozpIwc.metricsStats.DEFAULT_DECAY_ALPHA;
	this.rescaleThreshold = ozpIwc.metricsStats.DEFAULT_RESCALE_THRESHOLD;
});

// This is a relatively expensive operation
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.getValues = function() {
  var values = [];
  var heap = this.values.clone();
	var elt;
  while(elt = heap.pop()) {
    values.push(elt.val);
  }
  return values;
};

ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.size = function() {
  return this.values.size();
};

ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.newHeap = function() {
  return new ozpIwc.metricsStats.BinaryHeap(function(obj){return obj.priority;});
};

ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.now = function() {
  return ozpIwc.util.now();
};

ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.tick = function() {
  return this.now() / 1000;
};

ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.clear = function() {
  this.values = this.newHeap();
  this.count = 0;
  this.startTime = this.tick();
  this.nextScaleTime = this.now() + this.rescaleThreshold;
};

/*
* timestamp in milliseconds
*/
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.update = function(val, timestamp) {
  // Convert timestamp to seconds
  if (timestamp == undefined) {
    timestamp = this.tick();
  } else {
    timestamp = timestamp / 1000;
  }
  var priority = this.weight(timestamp - this.startTime) / Math.random()
    , value = {val: val, priority: priority};
  if (this.count < this.limit) {
    this.count += 1;
    this.values.push(value);
  } else {
    var first = this.values.peek();
    if (first.priority < priority) {
      this.values.push(value);
      this.values.pop();
    }
  }

  if (this.now() > this.nextScaleTime) {
    this.rescale();
  }
};

ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.weight = function(time) {
  return Math.exp(this.alpha * time);
};

ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.rescale = function() {
  this.nextScaleTime = this.now() + this.rescaleThreshold;
  var oldContent = this.values.content
    , newContent = []
    , elt
    , oldStartTime = this.startTime;
  this.startTime = this.tick();
  // Downscale every priority by the same factor. Order is unaffected, which is why we're avoiding the cost of popping.
  for(var i = 0; i < oldContent.length; i++) {
    newContent.push({val: oldContent[i].val, priority: oldContent[i].priority * Math.exp(-this.alpha * (this.startTime - oldStartTime))});
  }
  this.values.content = newContent;
};

/*
 * The MIT License (MIT) Copyright (c) 2012 Mike Ihbe
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * Original code owned by Mike Ihbe.  Modifications licensed under same terms.
 */
var ozpIwc=ozpIwc || {};
ozpIwc.metricsStats=ozpIwc.metricsStats || {};

/*
 *  Exponentially weighted moving average.
 *  Args: 
 *  - alpha:
 *  - interval: time in milliseconds
 */

ozpIwc.metricsStats.M1_ALPHA = 1 - Math.exp(-5/60);
ozpIwc.metricsStats.M5_ALPHA = 1 - Math.exp(-5/60/5);
ozpIwc.metricsStats.M15_ALPHA = 1 - Math.exp(-5/60/15);

ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage=function(alpha, interval) {
  this.alpha = alpha;
  this.interval = interval || 5000;
  this.currentRate = null;
  this.uncounted = 0;
	this.lastTick=ozpIwc.util.now();
};

ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage.prototype.update = function(n) {
  this.uncounted += (n || 1);
	this.tick();
};

/*
 * Update our rate measurements every interval
 */
ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage.prototype.tick = function() {
 	var now=ozpIwc.util.now();
	var age=now-this.lastTick;
	if(age > this.interval) {
		this.lastTick=now - (age % this.interval);
		var requiredTicks=Math.floor(age / this.interval);
		for(var i=0; i < requiredTicks; ++i) {
			var instantRate = this.uncounted / this.interval;
			this.uncounted = 0;
			if(this.currentRate!==null) {
				this.currentRate += this.alpha * (instantRate - this.currentRate);
			} else {
				this.currentRate = instantRate;
			}
		}
	}
};

/*
 * Return the rate per second
 */
ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage.prototype.rate = function() {
  return this.currentRate * 1000;
};

var ozpIwc=ozpIwc || {};

var ozpIwc=ozpIwc || {};
ozpIwc.metricTypes=ozpIwc.metricTypes || {};

/**
 * @typedef {object} ozpIwc.MetricType 
 * @property {function} get - returns the current value of the metric
 */

ozpIwc.metricTypes.BaseMetric=function() {
	this.value=0;
};

ozpIwc.metricTypes.BaseMetric.prototype.get=function() { 
	return this.value; 
};

ozpIwc.metricTypes.BaseMetric.prototype.unit=function(val) { 
	if(val) {
		this.unit=val;
		return this;
	}
	return this.unit; 
};


/**
 * @class
 * A repository of metrics
 */
ozpIwc.MetricsRegistry=function() {
	this.metrics={};
};

/**
 * 
 * @private
 * @param {string} name - Name of the metric
 * @param {function} type - The constructor of the requested type for this metric.
 * @returns {MetricType} - Null if the metric already exists of a different type.  Otherwise a reference to the metric.
 */
ozpIwc.MetricsRegistry.prototype.findOrCreateMetric=function(name,type) {
	var m= this.metrics[name] = this.metrics[name] || new type();
	if(m instanceof type){
			return m;
	} else {
			return null;
	}			
};

/**
 * Joins the arguments together into a name.
 * @private
 * @param {string[]} args - Array or the argument-like "arguments" value.
 * @returns {string}
 */
ozpIwc.MetricsRegistry.prototype.makeName=function(args) {
	// slice is necessary because "arguments" isn't a real array, and it's what
	// is usually passed in, here.
	return Array.prototype.slice.call(args).join(".");
};

/**
 * @param {...string} name - components of the name
 * @returns {ozpIwc.metricTypes.Counter}
 */
ozpIwc.MetricsRegistry.prototype.counter=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Counter);
};

/**
 * @param {...string} name - components of the name
 * @returns {ozpIwc.metricTypes.Meter}
 */
ozpIwc.MetricsRegistry.prototype.meter=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Meter);
};

/**
 * @param {...string} name - components of the name
 * @returns {ozpIwc.metricTypes.Gauge}
 */
ozpIwc.MetricsRegistry.prototype.gauge=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Gauge);
};

/**
 * @param {...string} name - components of the name
 * @returns {ozpIwc.metricTypes.Gauge}
 */
ozpIwc.MetricsRegistry.prototype.histogram=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Histogram);
};

/**
 * @param {...string} name - components of the name
 * @returns {ozpIwc.metricTypes.Gauge}
 */
ozpIwc.MetricsRegistry.prototype.timer=function(name) {
	return this.findOrCreateMetric(this.makeName(arguments),ozpIwc.metricTypes.Timer);
};

/**
 * @param {...string} name - components of the name
 * @returns {ozpIwc.metricTypes.Gauge}
 */
ozpIwc.MetricsRegistry.prototype.register=function(name,metric) {
	this.metrics[this.makeName(name)]=metric;
	
	return metric;
};

/**
 * 
 * @returns {unresolved}
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

	
ozpIwc.metrics=new ozpIwc.MetricsRegistry();

/**
 * @class
 * @extends ozpIwc.MetricType
 * A counter running total that can be adjusted up or down.
 * Where a meter is set to a known value at each update, a
 * counter is incremented up or down by a known change.
 */
ozpIwc.metricTypes.Counter=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function() {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);
	this.value=0;
});

/**
 * @param {Number} [delta=1] - Increment by this value
 * @returns {Number} - Value of the counter after increment
 */
ozpIwc.metricTypes.Counter.prototype.inc=function(delta) { 
	return this.value+=(delta?delta:1);
};

/**
 * @param {Number} [delta=1] - Decrement by this value
 * @returns {Number} - Value of the counter after decrement
 */
ozpIwc.metricTypes.Counter.prototype.dec=function(delta) { 
	return this.value-=(delta?delta:1);
};


/**
 * @callback ozpIwc.metricTypes.Gauge~gaugeCallback
 * @returns {ozpIwc.metricTypes.MetricsTree} 
 */

/**
 * @class
 * @extends ozpIwc.MetricType
 * A gauge is an externally defined set of metrics returned by a callback function
 * @param {ozpIwc.metricTypes.Gauge~gaugeCallback} metricsCallback
 */
ozpIwc.metricTypes.Gauge=function(metricsCallback) {
	this.callback=metricsCallback;
};
/**
 * Set the metrics callback for this gauge.
 * @param {ozpIwc.metricTypes.Gauge~gaugeCallback} metricsCallback
 * @returns {ozpIwc.metricTypes.Gauge} this
 */
ozpIwc.metricTypes.Gauge.prototype.set=function(metricsCallback) { 
	callback=metricsCallback; 
	return this;
};
/**
 * Executes the callback and returns a metrics tree.
 * @returns {ozpIwc.metricTypes.MetricsTree}
 */
ozpIwc.metricTypes.Gauge.prototype.get=function() { 
	return callback(); 
};

/**
 * @class
 * @extends ozpIwc.BaseMetric
 */
ozpIwc.metricTypes.Histogram=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function() {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);
	this.sample = new ozpIwc.metricsStats.ExponentiallyDecayingSample();
	this.clear();
});


ozpIwc.metricTypes.Histogram.prototype.clear=function() {
	this.sample.clear();
	this.min=this.max=null;
	this.varianceMean=0;
	this.varianceM2=0;
	this.sum=0;
	this.count=0;	
};

/**
 * @param {Number} [delta=1] - Increment by this value
 * @returns {Number} - Value of the counter after increment
 */
ozpIwc.metricTypes.Histogram.prototype.mark=function(val,timestamp) { 
	timestamp = timestamp || ozpIwc.util.now();
	
	this.sample.update(val,timestamp);
	
	this.max=(this.max===null?val:Math.max(this.max,val));
	this.min=(this.min===null?val:Math.min(this.min,val));
	this.sum+=val;
	this.count++;
	
	var delta=val - this.varianceMean;
	this.varianceMean += delta/this.count;
	this.varianceM2 += delta * (val - this.varianceMean);

	return this.count;
};

ozpIwc.metricTypes.Histogram.prototype.get=function() { 
	var values=this.sample.getValues().map(function(v){
		return parseFloat(v);
	}).sort(function(a,b) { 
		return a-b;
	});
	var percentile=function(p) {
		var pos=p *(values.length);
		if(pos >= values.length) {
			return values[values.length-1];
		}
		pos=Math.max(0,pos);
		pos=Math.min(pos,values.length+1);
		var lower = values[Math.floor(pos)-1];
		var upper = values[Math.floor(pos)];
		return lower+(pos-Math.floor(pos))*(upper-lower);
	};

	return {
		'percentile_10': percentile(0.10),
		'percentile_25': percentile(0.25),				
		'median': percentile(0.50),				
		'percentile_75': percentile(0.75),				
		'percentile_90': percentile(0.90),				
		'percentile_95': percentile(0.95),				
		'percentile_99': percentile(0.99),				
		'percentile_999': percentile(0.999),				
		'variance' : this.count < 1 ? null : this.varianceM2 / (this.count -1),
		'mean' : this.count === 0 ? null : this.varianceMean,
		'stdDev' : this.count < 1 ? null : Math.sqrt(this.varianceM2 / (this.count -1)),
		'count' : this.count,
		'sum' : this.sum,
		'max' : this.max,
		'min' : this.min
	};
};


/**
 * @class
 * @extends ozpIwc.BaseMetric
 */
ozpIwc.metricTypes.Meter=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function() {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);
	this.m1Rate= new ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage(ozpIwc.metricsStats.M1_ALPHA);
	this.m5Rate= new ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage(ozpIwc.metricsStats.M5_ALPHA);
	this.m15Rate= new ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage(ozpIwc.metricsStats.M15_ALPHA);
	this.startTime=ozpIwc.util.now();
	this.value=0;
});

/**
 * @param {Number} [delta=1] - Increment by this value
 * @returns {Number} - Value of the counter after increment
 */
ozpIwc.metricTypes.Meter.prototype.mark=function(delta) { 
	delta=delta || 1;
	this.value+=delta;
	this.m1Rate.update(delta);
	this.m5Rate.update(delta);
	this.m15Rate.update(delta);
	
	return this.value;
};

ozpIwc.metricTypes.Meter.prototype.get=function() { 
	return {
		'rate_1m' : this.m1Rate.rate(),
		'rate_5m' : this.m5Rate.rate(),
		'rate_15m' : this.m15Rate.rate(),
		'rate_mean' : this.value / (ozpIwc.util.now() - this.startTime) * 1000,
		'count' : this.value
	};
};

ozpIwc.metricTypes.Meter.prototype.tick=function() { 
	this.m1Rate.tick();
	this.m5Rate.tick();
	this.m15Rate.tick();
};

ozpIwc.metricTypes.Timer=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function() {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);
	this.meter=new ozpIwc.metricTypes.Meter();
	this.histogram=new ozpIwc.metricTypes.Histogram();
});

ozpIwc.metricTypes.Timer.prototype.mark=function(val,time) {
	this.meter.mark();
	this.histogram.mark(val,time);
};

ozpIwc.metricTypes.Timer.prototype.start=function() {
	var self=this;
	var startTime=ozpIwc.util.now();
	return function() {
		var endTime=ozpIwc.util.now();
		self.mark(endTime-startTime,endTime);
	};
};

ozpIwc.metricTypes.Timer.prototype.time=function(callback) {
	var startTime=ozpIwc.util.now();
	try {
		callback();
	} finally {
		var endTime=ozpIwc.util.now();
		this.mark(endTime-startTime,endTime);
	}
};

ozpIwc.metricTypes.Timer.prototype.get=function() {
	var val=this.histogram.get();
	var meterMetrics=this.meter.get();
	for(var k in meterMetrics) {
		val[k]=meterMetrics[k];
	}
	return val;
};
/*! jQuery v2.1.0 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k="".trim,l={},m=a.document,n="2.1.0",o=function(a,b){return new o.fn.init(a,b)},p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};o.fn=o.prototype={jquery:n,constructor:o,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=o.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return o.each(this,a,b)},map:function(a){return this.pushStack(o.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},o.extend=o.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||o.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(o.isPlainObject(d)||(e=o.isArray(d)))?(e?(e=!1,f=c&&o.isArray(c)?c:[]):f=c&&o.isPlainObject(c)?c:{},g[b]=o.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},o.extend({expando:"jQuery"+(n+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===o.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return a-parseFloat(a)>=0},isPlainObject:function(a){if("object"!==o.type(a)||a.nodeType||o.isWindow(a))return!1;try{if(a.constructor&&!j.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(b){return!1}return!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=o.trim(a),a&&(1===a.indexOf("use strict")?(b=m.createElement("script"),b.text=a,m.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":k.call(a)},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?o.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(c=a[b],b=a,a=c),o.isFunction(a)?(e=d.call(arguments,2),f=function(){return a.apply(b||this,e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||o.guid++,f):void 0},now:Date.now,support:l}),o.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=a.length,c=o.type(a);return"function"===c||o.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s="sizzle"+-new Date,t=a.document,u=0,v=0,w=eb(),x=eb(),y=eb(),z=function(a,b){return a===b&&(j=!0),0},A="undefined",B=1<<31,C={}.hasOwnProperty,D=[],E=D.pop,F=D.push,G=D.push,H=D.slice,I=D.indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]===a)return b;return-1},J="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",K="[\\x20\\t\\r\\n\\f]",L="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",M=L.replace("w","w#"),N="\\["+K+"*("+L+")"+K+"*(?:([*^$|!~]?=)"+K+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+M+")|)|)"+K+"*\\]",O=":("+L+")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|"+N.replace(3,8)+")*)|.*)\\)|)",P=new RegExp("^"+K+"+|((?:^|[^\\\\])(?:\\\\.)*)"+K+"+$","g"),Q=new RegExp("^"+K+"*,"+K+"*"),R=new RegExp("^"+K+"*([>+~]|"+K+")"+K+"*"),S=new RegExp("="+K+"*([^\\]'\"]*?)"+K+"*\\]","g"),T=new RegExp(O),U=new RegExp("^"+M+"$"),V={ID:new RegExp("^#("+L+")"),CLASS:new RegExp("^\\.("+L+")"),TAG:new RegExp("^("+L.replace("w","w*")+")"),ATTR:new RegExp("^"+N),PSEUDO:new RegExp("^"+O),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+K+"*(even|odd|(([+-]|)(\\d*)n|)"+K+"*(?:([+-]|)"+K+"*(\\d+)|))"+K+"*\\)|)","i"),bool:new RegExp("^(?:"+J+")$","i"),needsContext:new RegExp("^"+K+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+K+"*((?:-\\d)?\\d*)"+K+"*\\)|)(?=[^-]|$)","i")},W=/^(?:input|select|textarea|button)$/i,X=/^h\d$/i,Y=/^[^{]+\{\s*\[native \w/,Z=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,$=/[+~]/,_=/'|\\/g,ab=new RegExp("\\\\([\\da-f]{1,6}"+K+"?|("+K+")|.)","ig"),bb=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)};try{G.apply(D=H.call(t.childNodes),t.childNodes),D[t.childNodes.length].nodeType}catch(cb){G={apply:D.length?function(a,b){F.apply(a,H.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function db(a,b,d,e){var f,g,h,i,j,m,p,q,u,v;if((b?b.ownerDocument||b:t)!==l&&k(b),b=b||l,d=d||[],!a||"string"!=typeof a)return d;if(1!==(i=b.nodeType)&&9!==i)return[];if(n&&!e){if(f=Z.exec(a))if(h=f[1]){if(9===i){if(g=b.getElementById(h),!g||!g.parentNode)return d;if(g.id===h)return d.push(g),d}else if(b.ownerDocument&&(g=b.ownerDocument.getElementById(h))&&r(b,g)&&g.id===h)return d.push(g),d}else{if(f[2])return G.apply(d,b.getElementsByTagName(a)),d;if((h=f[3])&&c.getElementsByClassName&&b.getElementsByClassName)return G.apply(d,b.getElementsByClassName(h)),d}if(c.qsa&&(!o||!o.test(a))){if(q=p=s,u=b,v=9===i&&a,1===i&&"object"!==b.nodeName.toLowerCase()){m=ob(a),(p=b.getAttribute("id"))?q=p.replace(_,"\\$&"):b.setAttribute("id",q),q="[id='"+q+"'] ",j=m.length;while(j--)m[j]=q+pb(m[j]);u=$.test(a)&&mb(b.parentNode)||b,v=m.join(",")}if(v)try{return G.apply(d,u.querySelectorAll(v)),d}catch(w){}finally{p||b.removeAttribute("id")}}}return xb(a.replace(P,"$1"),b,d,e)}function eb(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function fb(a){return a[s]=!0,a}function gb(a){var b=l.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function hb(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function ib(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||B)-(~a.sourceIndex||B);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function jb(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function kb(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function lb(a){return fb(function(b){return b=+b,fb(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function mb(a){return a&&typeof a.getElementsByTagName!==A&&a}c=db.support={},f=db.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},k=db.setDocument=function(a){var b,e=a?a.ownerDocument||a:t,g=e.defaultView;return e!==l&&9===e.nodeType&&e.documentElement?(l=e,m=e.documentElement,n=!f(e),g&&g!==g.top&&(g.addEventListener?g.addEventListener("unload",function(){k()},!1):g.attachEvent&&g.attachEvent("onunload",function(){k()})),c.attributes=gb(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=gb(function(a){return a.appendChild(e.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Y.test(e.getElementsByClassName)&&gb(function(a){return a.innerHTML="<div class='a'></div><div class='a i'></div>",a.firstChild.className="i",2===a.getElementsByClassName("i").length}),c.getById=gb(function(a){return m.appendChild(a).id=s,!e.getElementsByName||!e.getElementsByName(s).length}),c.getById?(d.find.ID=function(a,b){if(typeof b.getElementById!==A&&n){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ab,bb);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ab,bb);return function(a){var c=typeof a.getAttributeNode!==A&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return typeof b.getElementsByTagName!==A?b.getElementsByTagName(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return typeof b.getElementsByClassName!==A&&n?b.getElementsByClassName(a):void 0},p=[],o=[],(c.qsa=Y.test(e.querySelectorAll))&&(gb(function(a){a.innerHTML="<select t=''><option selected=''></option></select>",a.querySelectorAll("[t^='']").length&&o.push("[*^$]="+K+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||o.push("\\["+K+"*(?:value|"+J+")"),a.querySelectorAll(":checked").length||o.push(":checked")}),gb(function(a){var b=e.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&o.push("name"+K+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||o.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),o.push(",.*:")})),(c.matchesSelector=Y.test(q=m.webkitMatchesSelector||m.mozMatchesSelector||m.oMatchesSelector||m.msMatchesSelector))&&gb(function(a){c.disconnectedMatch=q.call(a,"div"),q.call(a,"[s!='']:x"),p.push("!=",O)}),o=o.length&&new RegExp(o.join("|")),p=p.length&&new RegExp(p.join("|")),b=Y.test(m.compareDocumentPosition),r=b||Y.test(m.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},z=b?function(a,b){if(a===b)return j=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===e||a.ownerDocument===t&&r(t,a)?-1:b===e||b.ownerDocument===t&&r(t,b)?1:i?I.call(i,a)-I.call(i,b):0:4&d?-1:1)}:function(a,b){if(a===b)return j=!0,0;var c,d=0,f=a.parentNode,g=b.parentNode,h=[a],k=[b];if(!f||!g)return a===e?-1:b===e?1:f?-1:g?1:i?I.call(i,a)-I.call(i,b):0;if(f===g)return ib(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)k.unshift(c);while(h[d]===k[d])d++;return d?ib(h[d],k[d]):h[d]===t?-1:k[d]===t?1:0},e):l},db.matches=function(a,b){return db(a,null,null,b)},db.matchesSelector=function(a,b){if((a.ownerDocument||a)!==l&&k(a),b=b.replace(S,"='$1']"),!(!c.matchesSelector||!n||p&&p.test(b)||o&&o.test(b)))try{var d=q.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return db(b,l,null,[a]).length>0},db.contains=function(a,b){return(a.ownerDocument||a)!==l&&k(a),r(a,b)},db.attr=function(a,b){(a.ownerDocument||a)!==l&&k(a);var e=d.attrHandle[b.toLowerCase()],f=e&&C.call(d.attrHandle,b.toLowerCase())?e(a,b,!n):void 0;return void 0!==f?f:c.attributes||!n?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},db.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},db.uniqueSort=function(a){var b,d=[],e=0,f=0;if(j=!c.detectDuplicates,i=!c.sortStable&&a.slice(0),a.sort(z),j){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return i=null,a},e=db.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=db.selectors={cacheLength:50,createPseudo:fb,match:V,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ab,bb),a[3]=(a[4]||a[5]||"").replace(ab,bb),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||db.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&db.error(a[0]),a},PSEUDO:function(a){var b,c=!a[5]&&a[2];return V.CHILD.test(a[0])?null:(a[3]&&void 0!==a[4]?a[2]=a[4]:c&&T.test(c)&&(b=ob(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ab,bb).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=w[a+" "];return b||(b=new RegExp("(^|"+K+")"+a+"("+K+"|$)"))&&w(a,function(a){return b.test("string"==typeof a.className&&a.className||typeof a.getAttribute!==A&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=db.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),t=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&t){k=q[s]||(q[s]={}),j=k[a]||[],n=j[0]===u&&j[1],m=j[0]===u&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[u,n,m];break}}else if(t&&(j=(b[s]||(b[s]={}))[a])&&j[0]===u)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(t&&((l[s]||(l[s]={}))[a]=[u,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||db.error("unsupported pseudo: "+a);return e[s]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?fb(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=I.call(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:fb(function(a){var b=[],c=[],d=g(a.replace(P,"$1"));return d[s]?fb(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:fb(function(a){return function(b){return db(a,b).length>0}}),contains:fb(function(a){return function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:fb(function(a){return U.test(a||"")||db.error("unsupported lang: "+a),a=a.replace(ab,bb).toLowerCase(),function(b){var c;do if(c=n?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===m},focus:function(a){return a===l.activeElement&&(!l.hasFocus||l.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return X.test(a.nodeName)},input:function(a){return W.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:lb(function(){return[0]}),last:lb(function(a,b){return[b-1]}),eq:lb(function(a,b,c){return[0>c?c+b:c]}),even:lb(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:lb(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:lb(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:lb(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=jb(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=kb(b);function nb(){}nb.prototype=d.filters=d.pseudos,d.setFilters=new nb;function ob(a,b){var c,e,f,g,h,i,j,k=x[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=Q.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=R.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(P," ")}),h=h.slice(c.length));for(g in d.filter)!(e=V[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?db.error(a):x(a,i).slice(0)}function pb(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function qb(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=v++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[u,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[s]||(b[s]={}),(h=i[d])&&h[0]===u&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function rb(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function sb(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function tb(a,b,c,d,e,f){return d&&!d[s]&&(d=tb(d)),e&&!e[s]&&(e=tb(e,f)),fb(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||wb(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:sb(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=sb(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?I.call(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=sb(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):G.apply(g,r)})}function ub(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],i=g||d.relative[" "],j=g?1:0,k=qb(function(a){return a===b},i,!0),l=qb(function(a){return I.call(b,a)>-1},i,!0),m=[function(a,c,d){return!g&&(d||c!==h)||((b=c).nodeType?k(a,c,d):l(a,c,d))}];f>j;j++)if(c=d.relative[a[j].type])m=[qb(rb(m),c)];else{if(c=d.filter[a[j].type].apply(null,a[j].matches),c[s]){for(e=++j;f>e;e++)if(d.relative[a[e].type])break;return tb(j>1&&rb(m),j>1&&pb(a.slice(0,j-1).concat({value:" "===a[j-2].type?"*":""})).replace(P,"$1"),c,e>j&&ub(a.slice(j,e)),f>e&&ub(a=a.slice(e)),f>e&&pb(a))}m.push(c)}return rb(m)}function vb(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,i,j,k){var m,n,o,p=0,q="0",r=f&&[],s=[],t=h,v=f||e&&d.find.TAG("*",k),w=u+=null==t?1:Math.random()||.1,x=v.length;for(k&&(h=g!==l&&g);q!==x&&null!=(m=v[q]);q++){if(e&&m){n=0;while(o=a[n++])if(o(m,g,i)){j.push(m);break}k&&(u=w)}c&&((m=!o&&m)&&p--,f&&r.push(m))}if(p+=q,c&&q!==p){n=0;while(o=b[n++])o(r,s,g,i);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=E.call(j));s=sb(s)}G.apply(j,s),k&&!f&&s.length>0&&p+b.length>1&&db.uniqueSort(j)}return k&&(u=w,h=t),r};return c?fb(f):f}g=db.compile=function(a,b){var c,d=[],e=[],f=y[a+" "];if(!f){b||(b=ob(a)),c=b.length;while(c--)f=ub(b[c]),f[s]?d.push(f):e.push(f);f=y(a,vb(e,d))}return f};function wb(a,b,c){for(var d=0,e=b.length;e>d;d++)db(a,b[d],c);return c}function xb(a,b,e,f){var h,i,j,k,l,m=ob(a);if(!f&&1===m.length){if(i=m[0]=m[0].slice(0),i.length>2&&"ID"===(j=i[0]).type&&c.getById&&9===b.nodeType&&n&&d.relative[i[1].type]){if(b=(d.find.ID(j.matches[0].replace(ab,bb),b)||[])[0],!b)return e;a=a.slice(i.shift().value.length)}h=V.needsContext.test(a)?0:i.length;while(h--){if(j=i[h],d.relative[k=j.type])break;if((l=d.find[k])&&(f=l(j.matches[0].replace(ab,bb),$.test(i[0].type)&&mb(b.parentNode)||b))){if(i.splice(h,1),a=f.length&&pb(i),!a)return G.apply(e,f),e;break}}}return g(a,m)(f,b,!n,e,$.test(a)&&mb(b.parentNode)||b),e}return c.sortStable=s.split("").sort(z).join("")===s,c.detectDuplicates=!!j,k(),c.sortDetached=gb(function(a){return 1&a.compareDocumentPosition(l.createElement("div"))}),gb(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||hb("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&gb(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||hb("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),gb(function(a){return null==a.getAttribute("disabled")})||hb(J,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),db}(a);o.find=t,o.expr=t.selectors,o.expr[":"]=o.expr.pseudos,o.unique=t.uniqueSort,o.text=t.getText,o.isXMLDoc=t.isXML,o.contains=t.contains;var u=o.expr.match.needsContext,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^.[^:#\[\.,]*$/;function x(a,b,c){if(o.isFunction(b))return o.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return o.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(w.test(b))return o.filter(b,a,c);b=o.filter(b,a)}return o.grep(a,function(a){return g.call(b,a)>=0!==c})}o.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?o.find.matchesSelector(d,a)?[d]:[]:o.find.matches(a,o.grep(b,function(a){return 1===a.nodeType}))},o.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(o(a).filter(function(){for(b=0;c>b;b++)if(o.contains(e[b],this))return!0}));for(b=0;c>b;b++)o.find(a,e[b],d);return d=this.pushStack(c>1?o.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(x(this,a||[],!1))},not:function(a){return this.pushStack(x(this,a||[],!0))},is:function(a){return!!x(this,"string"==typeof a&&u.test(a)?o(a):a||[],!1).length}});var y,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=o.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||y).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof o?b[0]:b,o.merge(this,o.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:m,!0)),v.test(c[1])&&o.isPlainObject(b))for(c in b)o.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=m.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=m,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):o.isFunction(a)?"undefined"!=typeof y.ready?y.ready(a):a(o):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),o.makeArray(a,this))};A.prototype=o.fn,y=o(m);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};o.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&o(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),o.fn.extend({has:function(a){var b=o(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(o.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=u.test(a)||"string"!=typeof a?o(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&o.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?o.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(o(a),this[0]):g.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(o.unique(o.merge(this.get(),o(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){while((a=a[b])&&1!==a.nodeType);return a}o.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return o.dir(a,"parentNode")},parentsUntil:function(a,b,c){return o.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return o.dir(a,"nextSibling")},prevAll:function(a){return o.dir(a,"previousSibling")},nextUntil:function(a,b,c){return o.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return o.dir(a,"previousSibling",c)},siblings:function(a){return o.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return o.sibling(a.firstChild)},contents:function(a){return a.contentDocument||o.merge([],a.childNodes)}},function(a,b){o.fn[a]=function(c,d){var e=o.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=o.filter(d,e)),this.length>1&&(C[a]||o.unique(e),B.test(a)&&e.reverse()),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return o.each(a.match(E)||[],function(a,c){b[c]=!0}),b}o.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):o.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0;h&&f>g;g++)if(h[g].apply(l[0],l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if(h){var c=h.length;!function g(b){o.each(b,function(b,c){var d=o.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&o.each(arguments,function(a,b){var c;while((c=o.inArray(b,h,c))>-1)h.splice(c,1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?o.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return!i},fireWith:function(a,b){return!h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!c}};return k},o.extend({Deferred:function(a){var b=[["resolve","done",o.Callbacks("once memory"),"resolved"],["reject","fail",o.Callbacks("once memory"),"rejected"],["notify","progress",o.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return o.Deferred(function(c){o.each(b,function(b,f){var g=o.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&o.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?o.extend(a,d):d}},e={};return d.pipe=d.then,o.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&o.isFunction(a.promise)?e:0,g=1===f?a:o.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&o.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;o.fn.ready=function(a){return o.ready.promise().done(a),this},o.extend({isReady:!1,readyWait:1,holdReady:function(a){a?o.readyWait++:o.ready(!0)},ready:function(a){(a===!0?--o.readyWait:o.isReady)||(o.isReady=!0,a!==!0&&--o.readyWait>0||(H.resolveWith(m,[o]),o.fn.trigger&&o(m).trigger("ready").off("ready")))}});function I(){m.removeEventListener("DOMContentLoaded",I,!1),a.removeEventListener("load",I,!1),o.ready()}o.ready.promise=function(b){return H||(H=o.Deferred(),"complete"===m.readyState?setTimeout(o.ready):(m.addEventListener("DOMContentLoaded",I,!1),a.addEventListener("load",I,!1))),H.promise(b)},o.ready.promise();var J=o.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===o.type(c)){e=!0;for(h in c)o.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,o.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(o(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};o.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function K(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=o.expando+Math.random()}K.uid=1,K.accepts=o.acceptData,K.prototype={key:function(a){if(!K.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=K.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,o.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(o.isEmptyObject(f))o.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,o.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{o.isArray(b)?d=b.concat(b.map(o.camelCase)):(e=o.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(E)||[])),c=d.length;while(c--)delete g[d[c]]}},hasData:function(a){return!o.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var L=new K,M=new K,N=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,O=/([A-Z])/g;function P(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(O,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:N.test(c)?o.parseJSON(c):c}catch(e){}M.set(a,b,c)}else c=void 0;return c}o.extend({hasData:function(a){return M.hasData(a)||L.hasData(a)},data:function(a,b,c){return M.access(a,b,c)},removeData:function(a,b){M.remove(a,b)},_data:function(a,b,c){return L.access(a,b,c)},_removeData:function(a,b){L.remove(a,b)}}),o.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=M.get(f),1===f.nodeType&&!L.get(f,"hasDataAttrs"))){c=g.length;
while(c--)d=g[c].name,0===d.indexOf("data-")&&(d=o.camelCase(d.slice(5)),P(f,d,e[d]));L.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){M.set(this,a)}):J(this,function(b){var c,d=o.camelCase(a);if(f&&void 0===b){if(c=M.get(f,a),void 0!==c)return c;if(c=M.get(f,d),void 0!==c)return c;if(c=P(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=M.get(this,d);M.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&M.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){M.remove(this,a)})}}),o.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=L.get(a,b),c&&(!d||o.isArray(c)?d=L.access(a,b,o.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=o.queue(a,b),d=c.length,e=c.shift(),f=o._queueHooks(a,b),g=function(){o.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return L.get(a,c)||L.access(a,c,{empty:o.Callbacks("once memory").add(function(){L.remove(a,[b+"queue",c])})})}}),o.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?o.queue(this[0],a):void 0===b?this:this.each(function(){var c=o.queue(this,a,b);o._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&o.dequeue(this,a)})},dequeue:function(a){return this.each(function(){o.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=o.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=L.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var Q=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,R=["Top","Right","Bottom","Left"],S=function(a,b){return a=b||a,"none"===o.css(a,"display")||!o.contains(a.ownerDocument,a)},T=/^(?:checkbox|radio)$/i;!function(){var a=m.createDocumentFragment(),b=a.appendChild(m.createElement("div"));b.innerHTML="<input type='radio' checked='checked' name='t'/>",l.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",l.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var U="undefined";l.focusinBubbles="onfocusin"in a;var V=/^key/,W=/^(?:mouse|contextmenu)|click/,X=/^(?:focusinfocus|focusoutblur)$/,Y=/^([^.]*)(?:\.(.+)|)$/;function Z(){return!0}function $(){return!1}function _(){try{return m.activeElement}catch(a){}}o.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,p,q,r=L.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=o.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof o!==U&&o.event.triggered!==b.type?o.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(E)||[""],j=b.length;while(j--)h=Y.exec(b[j])||[],n=q=h[1],p=(h[2]||"").split(".").sort(),n&&(l=o.event.special[n]||{},n=(e?l.delegateType:l.bindType)||n,l=o.event.special[n]||{},k=o.extend({type:n,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&o.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[n])||(m=i[n]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(n,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),o.event.global[n]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,p,q,r=L.hasData(a)&&L.get(a);if(r&&(i=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=Y.exec(b[j])||[],n=q=h[1],p=(h[2]||"").split(".").sort(),n){l=o.event.special[n]||{},n=(d?l.delegateType:l.bindType)||n,m=i[n]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||o.removeEvent(a,n,r.handle),delete i[n])}else for(n in i)o.event.remove(a,n+b[j],c,d,!0);o.isEmptyObject(i)&&(delete r.handle,L.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,l,n,p=[d||m],q=j.call(b,"type")?b.type:b,r=j.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||m,3!==d.nodeType&&8!==d.nodeType&&!X.test(q+o.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[o.expando]?b:new o.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:o.makeArray(c,[b]),n=o.event.special[q]||{},e||!n.trigger||n.trigger.apply(d,c)!==!1)){if(!e&&!n.noBubble&&!o.isWindow(d)){for(i=n.delegateType||q,X.test(i+q)||(g=g.parentNode);g;g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||m)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:n.bindType||q,l=(L.get(g,"events")||{})[b.type]&&L.get(g,"handle"),l&&l.apply(g,c),l=k&&g[k],l&&l.apply&&o.acceptData(g)&&(b.result=l.apply(g,c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||n._default&&n._default.apply(p.pop(),c)!==!1||!o.acceptData(d)||k&&o.isFunction(d[q])&&!o.isWindow(d)&&(h=d[k],h&&(d[k]=null),o.event.triggered=q,d[q](),o.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=o.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(L.get(this,"events")||{})[a.type]||[],k=o.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=o.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((o.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?o(e,this).index(i)>=0:o.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||m,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[o.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=W.test(e)?this.mouseHooks:V.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new o.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=m),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==_()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===_()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&o.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return o.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=o.extend(new o.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?o.event.trigger(e,null,b):o.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},o.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},o.Event=function(a,b){return this instanceof o.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.getPreventDefault&&a.getPreventDefault()?Z:$):this.type=a,b&&o.extend(this,b),this.timeStamp=a&&a.timeStamp||o.now(),void(this[o.expando]=!0)):new o.Event(a,b)},o.Event.prototype={isDefaultPrevented:$,isPropagationStopped:$,isImmediatePropagationStopped:$,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=Z,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=Z,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=Z,this.stopPropagation()}},o.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){o.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!o.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),l.focusinBubbles||o.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){o.event.simulate(b,a.target,o.event.fix(a),!0)};o.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=L.access(d,b);e||d.addEventListener(a,c,!0),L.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=L.access(d,b)-1;e?L.access(d,b,e):(d.removeEventListener(a,c,!0),L.remove(d,b))}}}),o.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=$;else if(!d)return this;return 1===e&&(f=d,d=function(a){return o().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=o.guid++)),this.each(function(){o.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,o(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=$),this.each(function(){o.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){o.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?o.event.trigger(a,b,c,!0):void 0}});var ab=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bb=/<([\w:]+)/,cb=/<|&#?\w+;/,db=/<(?:script|style|link)/i,eb=/checked\s*(?:[^=]|=\s*.checked.)/i,fb=/^$|\/(?:java|ecma)script/i,gb=/^true\/(.*)/,hb=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ib={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ib.optgroup=ib.option,ib.tbody=ib.tfoot=ib.colgroup=ib.caption=ib.thead,ib.th=ib.td;function jb(a,b){return o.nodeName(a,"table")&&o.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function kb(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function lb(a){var b=gb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function mb(a,b){for(var c=0,d=a.length;d>c;c++)L.set(a[c],"globalEval",!b||L.get(b[c],"globalEval"))}function nb(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(L.hasData(a)&&(f=L.access(a),g=L.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)o.event.add(b,e,j[e][c])}M.hasData(a)&&(h=M.access(a),i=o.extend({},h),M.set(b,i))}}function ob(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&o.nodeName(a,b)?o.merge([a],c):c}function pb(a,b){var c=b.nodeName.toLowerCase();"input"===c&&T.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}o.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=o.contains(a.ownerDocument,a);if(!(l.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||o.isXMLDoc(a)))for(g=ob(h),f=ob(a),d=0,e=f.length;e>d;d++)pb(f[d],g[d]);if(b)if(c)for(f=f||ob(a),g=g||ob(h),d=0,e=f.length;e>d;d++)nb(f[d],g[d]);else nb(a,h);return g=ob(h,"script"),g.length>0&&mb(g,!i&&ob(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,n=a.length;n>m;m++)if(e=a[m],e||0===e)if("object"===o.type(e))o.merge(l,e.nodeType?[e]:e);else if(cb.test(e)){f=f||k.appendChild(b.createElement("div")),g=(bb.exec(e)||["",""])[1].toLowerCase(),h=ib[g]||ib._default,f.innerHTML=h[1]+e.replace(ab,"<$1></$2>")+h[2],j=h[0];while(j--)f=f.lastChild;o.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while(e=l[m++])if((!d||-1===o.inArray(e,d))&&(i=o.contains(e.ownerDocument,e),f=ob(k.appendChild(e),"script"),i&&mb(f),c)){j=0;while(e=f[j++])fb.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for(var b,c,d,e,f,g,h=o.event.special,i=0;void 0!==(c=a[i]);i++){if(o.acceptData(c)&&(f=c[L.expando],f&&(b=L.cache[f]))){if(d=Object.keys(b.events||{}),d.length)for(g=0;void 0!==(e=d[g]);g++)h[e]?o.event.remove(c,e):o.removeEvent(c,e,b.handle);L.cache[f]&&delete L.cache[f]}delete M.cache[c[M.expando]]}}}),o.fn.extend({text:function(a){return J(this,function(a){return void 0===a?o.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?o.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||o.cleanData(ob(c)),c.parentNode&&(b&&o.contains(c.ownerDocument,c)&&mb(ob(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(o.cleanData(ob(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return o.clone(this,a,b)})},html:function(a){return J(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!db.test(a)&&!ib[(bb.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(ab,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(o.cleanData(ob(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,o.cleanData(ob(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,k=this.length,m=this,n=k-1,p=a[0],q=o.isFunction(p);if(q||k>1&&"string"==typeof p&&!l.checkClone&&eb.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(k&&(c=o.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(f=o.map(ob(c,"script"),kb),g=f.length;k>j;j++)h=c,j!==n&&(h=o.clone(h,!0,!0),g&&o.merge(f,ob(h,"script"))),b.call(this[j],h,j);if(g)for(i=f[f.length-1].ownerDocument,o.map(f,lb),j=0;g>j;j++)h=f[j],fb.test(h.type||"")&&!L.access(h,"globalEval")&&o.contains(i,h)&&(h.src?o._evalUrl&&o._evalUrl(h.src):o.globalEval(h.textContent.replace(hb,"")))}return this}}),o.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){o.fn[a]=function(a){for(var c,d=[],e=o(a),g=e.length-1,h=0;g>=h;h++)c=h===g?this:this.clone(!0),o(e[h])[b](c),f.apply(d,c.get());return this.pushStack(d)}});var qb,rb={};function sb(b,c){var d=o(c.createElement(b)).appendTo(c.body),e=a.getDefaultComputedStyle?a.getDefaultComputedStyle(d[0]).display:o.css(d[0],"display");return d.detach(),e}function tb(a){var b=m,c=rb[a];return c||(c=sb(a,b),"none"!==c&&c||(qb=(qb||o("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=qb[0].contentDocument,b.write(),b.close(),c=sb(a,b),qb.detach()),rb[a]=c),c}var ub=/^margin/,vb=new RegExp("^("+Q+")(?!px)[a-z%]+$","i"),wb=function(a){return a.ownerDocument.defaultView.getComputedStyle(a,null)};function xb(a,b,c){var d,e,f,g,h=a.style;return c=c||wb(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||o.contains(a.ownerDocument,a)||(g=o.style(a,b)),vb.test(g)&&ub.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function yb(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d="padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box",e=m.documentElement,f=m.createElement("div"),g=m.createElement("div");g.style.backgroundClip="content-box",g.cloneNode(!0).style.backgroundClip="",l.clearCloneStyle="content-box"===g.style.backgroundClip,f.style.cssText="border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px",f.appendChild(g);function h(){g.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%",e.appendChild(f);var d=a.getComputedStyle(g,null);b="1%"!==d.top,c="4px"===d.width,e.removeChild(f)}a.getComputedStyle&&o.extend(l,{pixelPosition:function(){return h(),b},boxSizingReliable:function(){return null==c&&h(),c},reliableMarginRight:function(){var b,c=g.appendChild(m.createElement("div"));return c.style.cssText=g.style.cssText=d,c.style.marginRight=c.style.width="0",g.style.width="1px",e.appendChild(f),b=!parseFloat(a.getComputedStyle(c,null).marginRight),e.removeChild(f),g.innerHTML="",b}})}(),o.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var zb=/^(none|table(?!-c[ea]).+)/,Ab=new RegExp("^("+Q+")(.*)$","i"),Bb=new RegExp("^([+-])=("+Q+")","i"),Cb={position:"absolute",visibility:"hidden",display:"block"},Db={letterSpacing:0,fontWeight:400},Eb=["Webkit","O","Moz","ms"];function Fb(a,b){if(b in a)return b;var c=b[0].toUpperCase()+b.slice(1),d=b,e=Eb.length;while(e--)if(b=Eb[e]+c,b in a)return b;return d}function Gb(a,b,c){var d=Ab.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Hb(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=o.css(a,c+R[f],!0,e)),d?("content"===c&&(g-=o.css(a,"padding"+R[f],!0,e)),"margin"!==c&&(g-=o.css(a,"border"+R[f]+"Width",!0,e))):(g+=o.css(a,"padding"+R[f],!0,e),"padding"!==c&&(g+=o.css(a,"border"+R[f]+"Width",!0,e)));return g}function Ib(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=wb(a),g="border-box"===o.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=xb(a,b,f),(0>e||null==e)&&(e=a.style[b]),vb.test(e))return e;d=g&&(l.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Hb(a,b,c||(g?"border":"content"),d,f)+"px"}function Jb(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=L.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&S(d)&&(f[g]=L.access(d,"olddisplay",tb(d.nodeName)))):f[g]||(e=S(d),(c&&"none"!==c||!e)&&L.set(d,"olddisplay",e?c:o.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}o.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=xb(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=o.camelCase(b),i=a.style;return b=o.cssProps[h]||(o.cssProps[h]=Fb(i,h)),g=o.cssHooks[b]||o.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=Bb.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(o.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||o.cssNumber[h]||(c+="px"),l.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]="",i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=o.camelCase(b);return b=o.cssProps[h]||(o.cssProps[h]=Fb(a.style,h)),g=o.cssHooks[b]||o.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=xb(a,b,d)),"normal"===e&&b in Db&&(e=Db[b]),""===c||c?(f=parseFloat(e),c===!0||o.isNumeric(f)?f||0:e):e}}),o.each(["height","width"],function(a,b){o.cssHooks[b]={get:function(a,c,d){return c?0===a.offsetWidth&&zb.test(o.css(a,"display"))?o.swap(a,Cb,function(){return Ib(a,b,d)}):Ib(a,b,d):void 0},set:function(a,c,d){var e=d&&wb(a);return Gb(a,c,d?Hb(a,b,d,"border-box"===o.css(a,"boxSizing",!1,e),e):0)}}}),o.cssHooks.marginRight=yb(l.reliableMarginRight,function(a,b){return b?o.swap(a,{display:"inline-block"},xb,[a,"marginRight"]):void 0}),o.each({margin:"",padding:"",border:"Width"},function(a,b){o.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+R[d]+b]=f[d]||f[d-2]||f[0];return e}},ub.test(a)||(o.cssHooks[a+b].set=Gb)}),o.fn.extend({css:function(a,b){return J(this,function(a,b,c){var d,e,f={},g=0;if(o.isArray(b)){for(d=wb(a),e=b.length;e>g;g++)f[b[g]]=o.css(a,b[g],!1,d);return f}return void 0!==c?o.style(a,b,c):o.css(a,b)},a,b,arguments.length>1)},show:function(){return Jb(this,!0)},hide:function(){return Jb(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){S(this)?o(this).show():o(this).hide()})}});function Kb(a,b,c,d,e){return new Kb.prototype.init(a,b,c,d,e)}o.Tween=Kb,Kb.prototype={constructor:Kb,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(o.cssNumber[c]?"":"px")},cur:function(){var a=Kb.propHooks[this.prop];return a&&a.get?a.get(this):Kb.propHooks._default.get(this)},run:function(a){var b,c=Kb.propHooks[this.prop];return this.pos=b=this.options.duration?o.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Kb.propHooks._default.set(this),this}},Kb.prototype.init.prototype=Kb.prototype,Kb.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=o.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){o.fx.step[a.prop]?o.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[o.cssProps[a.prop]]||o.cssHooks[a.prop])?o.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Kb.propHooks.scrollTop=Kb.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},o.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},o.fx=Kb.prototype.init,o.fx.step={};var Lb,Mb,Nb=/^(?:toggle|show|hide)$/,Ob=new RegExp("^(?:([+-])=|)("+Q+")([a-z%]*)$","i"),Pb=/queueHooks$/,Qb=[Vb],Rb={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=Ob.exec(b),f=e&&e[3]||(o.cssNumber[a]?"":"px"),g=(o.cssNumber[a]||"px"!==f&&+d)&&Ob.exec(o.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,o.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function Sb(){return setTimeout(function(){Lb=void 0}),Lb=o.now()}function Tb(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=R[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ub(a,b,c){for(var d,e=(Rb[b]||[]).concat(Rb["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Vb(a,b,c){var d,e,f,g,h,i,j,k=this,l={},m=a.style,n=a.nodeType&&S(a),p=L.get(a,"fxshow");c.queue||(h=o._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,k.always(function(){k.always(function(){h.unqueued--,o.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[m.overflow,m.overflowX,m.overflowY],j=o.css(a,"display"),"none"===j&&(j=tb(a.nodeName)),"inline"===j&&"none"===o.css(a,"float")&&(m.display="inline-block")),c.overflow&&(m.overflow="hidden",k.always(function(){m.overflow=c.overflow[0],m.overflowX=c.overflow[1],m.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Nb.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(n?"hide":"show")){if("show"!==e||!p||void 0===p[d])continue;n=!0}l[d]=p&&p[d]||o.style(a,d)}if(!o.isEmptyObject(l)){p?"hidden"in p&&(n=p.hidden):p=L.access(a,"fxshow",{}),f&&(p.hidden=!n),n?o(a).show():k.done(function(){o(a).hide()}),k.done(function(){var b;L.remove(a,"fxshow");for(b in l)o.style(a,b,l[b])});for(d in l)g=Ub(n?p[d]:0,d,k),d in p||(p[d]=g.start,n&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function Wb(a,b){var c,d,e,f,g;for(c in a)if(d=o.camelCase(c),e=b[d],f=a[c],o.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=o.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function Xb(a,b,c){var d,e,f=0,g=Qb.length,h=o.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Lb||Sb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:o.extend({},b),opts:o.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:Lb||Sb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=o.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(Wb(k,j.opts.specialEasing);g>f;f++)if(d=Qb[f].call(j,a,k,j.opts))return d;return o.map(k,Ub,j),o.isFunction(j.opts.start)&&j.opts.start.call(a,j),o.fx.timer(o.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}o.Animation=o.extend(Xb,{tweener:function(a,b){o.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],Rb[c]=Rb[c]||[],Rb[c].unshift(b)},prefilter:function(a,b){b?Qb.unshift(a):Qb.push(a)}}),o.speed=function(a,b,c){var d=a&&"object"==typeof a?o.extend({},a):{complete:c||!c&&b||o.isFunction(a)&&a,duration:a,easing:c&&b||b&&!o.isFunction(b)&&b};return d.duration=o.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in o.fx.speeds?o.fx.speeds[d.duration]:o.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){o.isFunction(d.old)&&d.old.call(this),d.queue&&o.dequeue(this,d.queue)},d},o.fn.extend({fadeTo:function(a,b,c,d){return this.filter(S).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=o.isEmptyObject(a),f=o.speed(b,c,d),g=function(){var b=Xb(this,o.extend({},a),f);(e||L.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=o.timers,g=L.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Pb.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&o.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=L.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=o.timers,g=d?d.length:0;for(c.finish=!0,o.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),o.each(["toggle","show","hide"],function(a,b){var c=o.fn[b];o.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Tb(b,!0),a,d,e)}}),o.each({slideDown:Tb("show"),slideUp:Tb("hide"),slideToggle:Tb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){o.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),o.timers=[],o.fx.tick=function(){var a,b=0,c=o.timers;for(Lb=o.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||o.fx.stop(),Lb=void 0},o.fx.timer=function(a){o.timers.push(a),a()?o.fx.start():o.timers.pop()},o.fx.interval=13,o.fx.start=function(){Mb||(Mb=setInterval(o.fx.tick,o.fx.interval))},o.fx.stop=function(){clearInterval(Mb),Mb=null},o.fx.speeds={slow:600,fast:200,_default:400},o.fn.delay=function(a,b){return a=o.fx?o.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=m.createElement("input"),b=m.createElement("select"),c=b.appendChild(m.createElement("option"));a.type="checkbox",l.checkOn=""!==a.value,l.optSelected=c.selected,b.disabled=!0,l.optDisabled=!c.disabled,a=m.createElement("input"),a.value="t",a.type="radio",l.radioValue="t"===a.value}();var Yb,Zb,$b=o.expr.attrHandle;o.fn.extend({attr:function(a,b){return J(this,o.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){o.removeAttr(this,a)})}}),o.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===U?o.prop(a,b,c):(1===f&&o.isXMLDoc(a)||(b=b.toLowerCase(),d=o.attrHooks[b]||(o.expr.match.bool.test(b)?Zb:Yb)),void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=o.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void o.removeAttr(a,b))},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=o.propFix[c]||c,o.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!l.radioValue&&"radio"===b&&o.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),Zb={set:function(a,b,c){return b===!1?o.removeAttr(a,c):a.setAttribute(c,c),c}},o.each(o.expr.match.bool.source.match(/\w+/g),function(a,b){var c=$b[b]||o.find.attr;$b[b]=function(a,b,d){var e,f;
return d||(f=$b[b],$b[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,$b[b]=f),e}});var _b=/^(?:input|select|textarea|button)$/i;o.fn.extend({prop:function(a,b){return J(this,o.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[o.propFix[a]||a]})}}),o.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!o.isXMLDoc(a),f&&(b=o.propFix[b]||b,e=o.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||_b.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),l.optSelected||(o.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),o.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){o.propFix[this.toLowerCase()]=this});var ac=/[\t\r\n\f]/g;o.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(o.isFunction(a))return this.each(function(b){o(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=o.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(o.isFunction(a))return this.each(function(b){o(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?o.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(o.isFunction(a)?function(c){o(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=o(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===U||"boolean"===c)&&(this.className&&L.set(this,"__className__",this.className),this.className=this.className||a===!1?"":L.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ac," ").indexOf(b)>=0)return!0;return!1}});var bc=/\r/g;o.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=o.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,o(this).val()):a,null==e?e="":"number"==typeof e?e+="":o.isArray(e)&&(e=o.map(e,function(a){return null==a?"":a+""})),b=o.valHooks[this.type]||o.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=o.valHooks[e.type]||o.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(bc,""):null==c?"":c)}}}),o.extend({valHooks:{select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(l.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&o.nodeName(c.parentNode,"optgroup"))){if(b=o(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=o.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=o.inArray(o(d).val(),f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),o.each(["radio","checkbox"],function(){o.valHooks[this]={set:function(a,b){return o.isArray(b)?a.checked=o.inArray(o(a).val(),b)>=0:void 0}},l.checkOn||(o.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),o.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){o.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),o.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var cc=o.now(),dc=/\?/;o.parseJSON=function(a){return JSON.parse(a+"")},o.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&o.error("Invalid XML: "+a),b};var ec,fc,gc=/#.*$/,hc=/([?&])_=[^&]*/,ic=/^(.*?):[ \t]*([^\r\n]*)$/gm,jc=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,kc=/^(?:GET|HEAD)$/,lc=/^\/\//,mc=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,nc={},oc={},pc="*/".concat("*");try{fc=location.href}catch(qc){fc=m.createElement("a"),fc.href="",fc=fc.href}ec=mc.exec(fc.toLowerCase())||[];function rc(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(o.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function sc(a,b,c,d){var e={},f=a===oc;function g(h){var i;return e[h]=!0,o.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function tc(a,b){var c,d,e=o.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&o.extend(!0,a,d),a}function uc(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function vc(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}o.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:fc,type:"GET",isLocal:jc.test(ec[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":pc,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":o.parseJSON,"text xml":o.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?tc(tc(a,o.ajaxSettings),b):tc(o.ajaxSettings,a)},ajaxPrefilter:rc(nc),ajaxTransport:rc(oc),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=o.ajaxSetup({},b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?o(l):o.event,n=o.Deferred(),p=o.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!f){f={};while(b=ic.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0,b),this}};if(n.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||fc)+"").replace(gc,"").replace(lc,ec[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=o.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(h=mc.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===ec[1]&&h[2]===ec[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(ec[3]||("http:"===ec[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=o.param(k.data,k.traditional)),sc(nc,k,b,v),2===t)return v;i=k.global,i&&0===o.active++&&o.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!kc.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(dc.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=hc.test(d)?d.replace(hc,"$1_="+cc++):d+(dc.test(d)?"&":"?")+"_="+cc++)),k.ifModified&&(o.lastModified[d]&&v.setRequestHeader("If-Modified-Since",o.lastModified[d]),o.etag[d]&&v.setRequestHeader("If-None-Match",o.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+pc+"; q=0.01":""):k.accepts["*"]);for(j in k.headers)v.setRequestHeader(j,k.headers[j]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(j in{success:1,error:1,complete:1})v[j](k[j]);if(c=sc(oc,k,b,v)){v.readyState=1,i&&m.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,c.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=uc(k,v,f)),u=vc(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(o.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(o.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?n.resolveWith(l,[r,x,v]):n.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),i&&(m.trigger("ajaxComplete",[v,k]),--o.active||o.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return o.get(a,b,c,"json")},getScript:function(a,b){return o.get(a,void 0,b,"script")}}),o.each(["get","post"],function(a,b){o[b]=function(a,c,d,e){return o.isFunction(c)&&(e=e||d,d=c,c=void 0),o.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),o.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){o.fn[b]=function(a){return this.on(b,a)}}),o._evalUrl=function(a){return o.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},o.fn.extend({wrapAll:function(a){var b;return o.isFunction(a)?this.each(function(b){o(this).wrapAll(a.call(this,b))}):(this[0]&&(b=o(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return this.each(o.isFunction(a)?function(b){o(this).wrapInner(a.call(this,b))}:function(){var b=o(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=o.isFunction(a);return this.each(function(c){o(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){o.nodeName(this,"body")||o(this).replaceWith(this.childNodes)}).end()}}),o.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0},o.expr.filters.visible=function(a){return!o.expr.filters.hidden(a)};var wc=/%20/g,xc=/\[\]$/,yc=/\r?\n/g,zc=/^(?:submit|button|image|reset|file)$/i,Ac=/^(?:input|select|textarea|keygen)/i;function Bc(a,b,c,d){var e;if(o.isArray(b))o.each(b,function(b,e){c||xc.test(a)?d(a,e):Bc(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==o.type(b))d(a,b);else for(e in b)Bc(a+"["+e+"]",b[e],c,d)}o.param=function(a,b){var c,d=[],e=function(a,b){b=o.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=o.ajaxSettings&&o.ajaxSettings.traditional),o.isArray(a)||a.jquery&&!o.isPlainObject(a))o.each(a,function(){e(this.name,this.value)});else for(c in a)Bc(c,a[c],b,e);return d.join("&").replace(wc,"+")},o.fn.extend({serialize:function(){return o.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=o.prop(this,"elements");return a?o.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!o(this).is(":disabled")&&Ac.test(this.nodeName)&&!zc.test(a)&&(this.checked||!T.test(a))}).map(function(a,b){var c=o(this).val();return null==c?null:o.isArray(c)?o.map(c,function(a){return{name:b.name,value:a.replace(yc,"\r\n")}}):{name:b.name,value:c.replace(yc,"\r\n")}}).get()}}),o.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Cc=0,Dc={},Ec={0:200,1223:204},Fc=o.ajaxSettings.xhr();a.ActiveXObject&&o(a).on("unload",function(){for(var a in Dc)Dc[a]()}),l.cors=!!Fc&&"withCredentials"in Fc,l.ajax=Fc=!!Fc,o.ajaxTransport(function(a){var b;return l.cors||Fc&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Cc;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Dc[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Ec[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Dc[g]=b("abort"),f.send(a.hasContent&&a.data||null)},abort:function(){b&&b()}}:void 0}),o.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return o.globalEval(a),a}}}),o.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),o.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=o("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),m.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Gc=[],Hc=/(=)\?(?=&|$)|\?\?/;o.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Gc.pop()||o.expando+"_"+cc++;return this[a]=!0,a}}),o.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Hc.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Hc.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=o.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Hc,"$1"+e):b.jsonp!==!1&&(b.url+=(dc.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||o.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Gc.push(e)),g&&o.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),o.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||m;var d=v.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=o.buildFragment([a],b,e),e&&e.length&&o(e).remove(),o.merge([],d.childNodes))};var Ic=o.fn.load;o.fn.load=function(a,b,c){if("string"!=typeof a&&Ic)return Ic.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=a.slice(h),a=a.slice(0,h)),o.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&o.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?o("<div>").append(o.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},o.expr.filters.animated=function(a){return o.grep(o.timers,function(b){return a===b.elem}).length};var Jc=a.document.documentElement;function Kc(a){return o.isWindow(a)?a:9===a.nodeType&&a.defaultView}o.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=o.css(a,"position"),l=o(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=o.css(a,"top"),i=o.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),o.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},o.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){o.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,o.contains(b,d)?(typeof d.getBoundingClientRect!==U&&(e=d.getBoundingClientRect()),c=Kc(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===o.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),o.nodeName(a[0],"html")||(d=a.offset()),d.top+=o.css(a[0],"borderTopWidth",!0),d.left+=o.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-o.css(c,"marginTop",!0),left:b.left-d.left-o.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||Jc;while(a&&!o.nodeName(a,"html")&&"static"===o.css(a,"position"))a=a.offsetParent;return a||Jc})}}),o.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(b,c){var d="pageYOffset"===c;o.fn[b]=function(e){return J(this,function(b,e,f){var g=Kc(b);return void 0===f?g?g[c]:b[e]:void(g?g.scrollTo(d?a.pageXOffset:f,d?f:a.pageYOffset):b[e]=f)},b,e,arguments.length,null)}}),o.each(["top","left"],function(a,b){o.cssHooks[b]=yb(l.pixelPosition,function(a,c){return c?(c=xb(a,b),vb.test(c)?o(a).position()[b]+"px":c):void 0})}),o.each({Height:"height",Width:"width"},function(a,b){o.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){o.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return J(this,function(b,c,d){var e;return o.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?o.css(b,c,g):o.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),o.fn.size=function(){return this.length},o.fn.andSelf=o.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return o});var Lc=a.jQuery,Mc=a.$;return o.noConflict=function(b){return a.$===o&&(a.$=Mc),b&&a.jQuery===o&&(a.jQuery=Lc),o},typeof b===U&&(a.jQuery=a.$=o),o});

/** @namespace */
var ozpIwc=ozpIwc || {};

/**
	* @class
	*/
ozpIwc.Event=function() {
	this.events={};
};	

/**
 * Registers a handler for the the event.
 * @param {string} event The name of the event to trigger on
 * @param {function} callback Function to be invoked
 * @param {object} [self] Used as the this pointer when callback is invoked.
 * @returns {object} A handle that can be used to unregister the callback via [off()]{@link ozpIwc.Event#off}
 */
ozpIwc.Event.prototype.on=function(event,callback,self) {
	var wrapped=callback;
	if(self) {
		wrapped=function() { 
			callback.apply(self,arguments);
		};
		wrapped.ozpIwcDelegateFor=callback;
	}
	this.events[event]=this.events[event]||[];
	this.events[event].push(wrapped);
	return wrapped;
};

/**
 * Unregisters an event handler previously registered.
 * @param {type} event
 * @param {type} callback
 */	
ozpIwc.Event.prototype.off=function(event,callback) {
	this.events[event]=(this.events[event]||[]).filter( function(h) {
		return h!==callback && h.ozpIwcDelegateFor !== callback;
	});
};

/**
 * Fires an event that will be received by all handlers.
 * @param {string} eventName  - Name of the event
 * @param {object} event - Event object to pass to the handers.
 * @returns {object} The event after all handlers have processed it
 */
ozpIwc.Event.prototype.trigger=function(eventName,event) {
	event = event || new ozpIwc.CancelableEvent();
	var handlers=this.events[eventName] || [];

	handlers.forEach(function(h) {
		h(event);
	});
	return event;
};


/**
 * Adds an on() and off() function to the target that delegate to this object 
 * @param {object} target Target to receive the on/off functions
 */
ozpIwc.Event.prototype.mixinOnOff=function(target) {
	var self=this;
	target.on=function() { return self.on.apply(self,arguments);};
	target.off=function() { return self.off.apply(self,arguments);};
};

/**
 * Convenient base for events that can be canceled.  Provides and manages
 * the properties canceled and cancelReason, as well as the member function
 * cancel().
 * @class
 * @param {object} data - Data that will be copied into the event
 */
ozpIwc.CancelableEvent=function(data) {
	data = data || {};
	for(k in data) {
		this[k]=data[k];
	}
	this.canceled=false;
	this.cancelReason=null;
};

/**
 * Marks the event as canceled.
 * @param {type} reason - A text description of why the event was canceled.
 * @returns {ozpIwc.CancelableEvent} Reference to self
 */
ozpIwc.CancelableEvent.prototype.cancel=function(reason) {
	reason= reason || "Unknown";
	this.canceled=true;
	this.cancelReason=reason;
	return this;
};

/** @namespace */
var ozpIwc=ozpIwc || {};


/**
 * A deferred action, but not in the sense of the Javascript standard.
 * @class
 */
ozpIwc.AsyncAction=function() {
	this.callbacks={};
};

ozpIwc.AsyncAction.prototype.when=function(state,callback,self) {
	if(self) {
		callback=function() { return callback.apply(self,arguments); };
	}
	
	if(this.resolution === state) {
		callback.apply(this,this.value);
	} else {
		this.callbacks[state]=callback;
	}
	return this;
};


ozpIwc.AsyncAction.prototype.resolve=function(status) {
	if(this.resolution) {
		throw "Cannot resolve an already resolved AsyncAction";
	}
	var callback=this.callbacks[status];
	this.resolution=status;
	this.value=Array.prototype.slice.call(arguments,1);
	
	if(callback) {
		callback.apply(this,this.value);
	}
	return this;
};

ozpIwc.AsyncAction.prototype.success=function(callback,self) {
	return this.when("success",callback,self);
};

ozpIwc.AsyncAction.prototype.failure=function(callback,self) {
	return this.when("failure",callback,self);
};
/** @namespace */
var ozpIwc=ozpIwc || {};

/** 
 * @type {object}
 * @property {function} log - Normal log output.
 * @property {function} error - Error output.
 */
ozpIwc.log=ozpIwc.log || {
	log: function() {
		if(window.console && typeof(window.console.log)==="function") {
			window.console.log.apply(window.console,arguments);
		}
	},
	error: function() {
		if(window.console && typeof(window.console.error)==="error") {
			window.console.error.apply(window.console,arguments);
		}
	}
};

/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2014 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */
(function(e){if(typeof define==="function"){define(e)}else if(typeof YUI==="function"){YUI.add("es5-sham",e)}else{e()}})(function(){var e=Function.prototype.call;var t=Object.prototype;var r=e.bind(t.hasOwnProperty);var n;var o;var i;var c;var f;if(f=r(t,"__defineGetter__")){n=e.bind(t.__defineGetter__);o=e.bind(t.__defineSetter__);i=e.bind(t.__lookupGetter__);c=e.bind(t.__lookupSetter__)}if(!Object.getPrototypeOf){Object.getPrototypeOf=function g(e){var r=e.__proto__;if(r||r===null){return r}else if(e.constructor){return e.constructor.prototype}else{return t}}}function u(e){try{e.sentinel=0;return Object.getOwnPropertyDescriptor(e,"sentinel").value===0}catch(t){}}if(Object.defineProperty){var p=u({});var a=typeof document==="undefined"||u(document.createElement("div"));if(!a||!p){var l=Object.getOwnPropertyDescriptor}}if(!Object.getOwnPropertyDescriptor||l){var b="Object.getOwnPropertyDescriptor called on a non-object: ";Object.getOwnPropertyDescriptor=function E(e,n){if(typeof e!=="object"&&typeof e!=="function"||e===null){throw new TypeError(b+e)}if(l){try{return l.call(Object,e,n)}catch(o){}}if(!r(e,n)){return}var u={enumerable:true,configurable:true};if(f){var p=e.__proto__;var a=e!==t;if(a){e.__proto__=t}var _=i(e,n);var s=c(e,n);if(a){e.__proto__=p}if(_||s){if(_){u.get=_}if(s){u.set=s}return u}}u.value=e[n];u.writable=true;return u}}if(!Object.getOwnPropertyNames){Object.getOwnPropertyNames=function z(e){return Object.keys(e)}}if(!Object.create){var _;var s=!({__proto__:null}instanceof Object);if(s||typeof document==="undefined"){_=function(){return{__proto__:null}}}else{_=function(){var e=document.createElement("iframe");var t=document.body||document.documentElement;e.style.display="none";t.appendChild(e);e.src="javascript:";var r=e.contentWindow.Object.prototype;t.removeChild(e);e=null;delete r.constructor;delete r.hasOwnProperty;delete r.propertyIsEnumerable;delete r.isPrototypeOf;delete r.toLocaleString;delete r.toString;delete r.valueOf;r.__proto__=null;function n(){}n.prototype=r;_=function(){return new n};return new n}}Object.create=function S(e,t){var r;function n(){}if(e===null){r=_()}else{if(typeof e!=="object"&&typeof e!=="function"){throw new TypeError("Object prototype may only be an Object or null")}n.prototype=e;r=new n;r.__proto__=e}if(t!==void 0){Object.defineProperties(r,t)}return r}}function d(e){try{Object.defineProperty(e,"sentinel",{});return"sentinel"in e}catch(t){}}if(Object.defineProperty){var y=d({});var O=typeof document==="undefined"||d(document.createElement("div"));if(!y||!O){var j=Object.defineProperty,v=Object.defineProperties}}if(!Object.defineProperty||j){var w="Property description must be an object: ";var P="Object.defineProperty called on non-object: ";var m="getters & setters can not be defined "+"on this javascript engine";Object.defineProperty=function T(e,u,p){if(typeof e!=="object"&&typeof e!=="function"||e===null){throw new TypeError(P+e)}if(typeof p!=="object"&&typeof p!=="function"||p===null){throw new TypeError(w+p)}if(j){try{return j.call(Object,e,u,p)}catch(a){}}if(r(p,"value")){if(f&&(i(e,u)||c(e,u))){var l=e.__proto__;e.__proto__=t;delete e[u];e[u]=p.value;e.__proto__=l}else{e[u]=p.value}}else{if(!f){throw new TypeError(m)}if(r(p,"get")){n(e,u,p.get)}if(r(p,"set")){o(e,u,p.set)}}return e}}if(!Object.defineProperties||v){Object.defineProperties=function D(e,t){if(v){try{return v.call(Object,e,t)}catch(n){}}for(var o in t){if(r(t,o)&&o!=="__proto__"){Object.defineProperty(e,o,t[o])}}return e}}if(!Object.seal){Object.seal=function x(e){return e}}if(!Object.freeze){Object.freeze=function k(e){return e}}try{Object.freeze(function(){})}catch(h){Object.freeze=function F(e){return function t(r){if(typeof r==="function"){return r}else{return e(r)}}}(Object.freeze)}if(!Object.preventExtensions){Object.preventExtensions=function G(e){return e}}if(!Object.isSealed){Object.isSealed=function I(e){return false}}if(!Object.isFrozen){Object.isFrozen=function C(e){return false}}if(!Object.isExtensible){Object.isExtensible=function N(e){if(Object(e)!==e){throw new TypeError}var t="";while(r(e,t)){t+="?"}e[t]=true;var n=r(e,t);delete e[t];return n}}});
//# sourceMappingURL=es5-sham.map
var ozpIwc=ozpIwc || {};

/**
 * @class
 * @param {object} [config]
 * @param {function} [config.defaultData] - The default data for a node if accessed.
 * @param {function} [config.copyValue] - How to copy values.  The default is JSON.parse(JSON.stringify(value)).
 */
ozpIwc.KeyValueStore = function(config) {
	config=config || {};
	this.defaultData=config.defaultData || function() { return undefined;};
	this.copyValue=config.copyValue || function(value) { 
		if(typeof(value) === 'array' || typeof(value) === 'object') {
			return JSON.parse(JSON.stringify(value));
		} else {
			return value;
		}
	};
	this.data={};
	this.events=new ozpIwc.Event();
	this.events.mixinOnOff(this);	
};

ozpIwc.KeyValueStore.prototype.set=function(path,newValue) {
	var oldValue=this.data[path];
	var evt=new ozpIwc.CancelableEvent({
			'path': path,
			'newValue': this.copyValue(newValue),
			'oldValue': this.copyValue(oldValue)
	});
	if(!this.events.trigger("preSet",evt).canceled) {
		this.data[path]=evt.newValue;
		this.events.trigger("set",{
			'path': path,
			'newValue': this.copyValue(evt.newValue),
			'oldValue': this.copyValue(oldValue)
		});
	}
};

ozpIwc.KeyValueStore.prototype.hasKey=function(path) {
	return path in this.data;
};

ozpIwc.KeyValueStore.prototype.get=function(path) {
	if(!(path in this.data)) {
		this.data[path]=this.defaultData();
	}
	
	var evt=new ozpIwc.CancelableEvent({
			'path': path,
			'value': this.copyValue(this.data[path])
	});
	
	if(!this.events.trigger("preGet",evt).canceled) {
		return evt.value;
	}
};

ozpIwc.KeyValueStore.prototype.delete=function(path,value) {
	var value=this.data[path];
	var evt=new ozpIwc.CancelableEvent({
			'path': path,
			'value': this.copyValue(value)
	});
	if(!this.events.trigger("preDelete",evt).canceled) {
		var d=this.data;
		delete d[path];
	}
};

ozpIwc.KeyValueStore.prototype.keys=function() {
	return Object.keys(this.data);
};

var ozpIwc=ozpIwc || {};

/** @typedef {string} ozpIwc.security.Role */

/** @typedef {string} ozpIwc.security.Permission */

/** @typedef { ozpIwc.security.Role[] } ozpIwc.security.Subject */

/** 
 * @typedef {object} ozpIwc.security.Actor 
 * @property {ozpIwc.security.Subject} securitySubject
 */


/** 
 * A basic authorization module loosely inspired by Apache Shiro.
 * <ul>
 *   <li> Role - an individual bundle of authority, represesented by a string.
 *   <li> Subject - an array of roles representing the authorities of an actor.
 *   <li> Permission - a string representing the authority to perform one discrete action.
 * </ul>
 * 
 * <p> Roles have permissions.  Subjects have one or more roles.  A check
 * is a subject asking if any of it's roles have a set of permissions. 
 * 
 * <p> The isPermitted() operation simply asks "for all permissions in the list, does the
 * subject have at least one role with that permission". 
 * 
 * <p> All operations are potentially asynchronous, though if the request can
 * be answered immediately, it will be.
 * 
 * <h2>OZP IWC's usage of authorization</h2>
 * 
 * <p> Roles are strings of the form "${domain}:${id}".  The domain
 * identifies the type of role, where the ID indentifies the specific instance.
 * 
 * <p>Supported Roles:
 * <ul>
 *   <li>participant:${address}
 *   <li>origin:${origin}
 * </ul>
 * 
 * <p> OZP IWC uses permissions of the form "${domain}:${action}:${instance}".
 * The domain is the type of the object being acted upon, the action
 * corresponds to the action being taken, and the instance is an optional
 * ID for the specific instance of the domain being acted upon.
 * 
 * @todo Permissions are local to each peer.  Does this need to be synced?
 * 
 * @class
 */
ozpIwc.BasicAuthentication=function() {
	this.roles={};	
};

/**
 * Returns the authenticated subject for the given credentials.
 * 
 * <p>The preAuthenticatedSubject allows an existing subject to augment their
 * roles using credentials.  For example, PostMessageParticipants are
 * assigned a role equal to their origin, since the browser authoritatively
 * determines that.  The security module can then add additional roles based
 * upon configuration.
 * 
 * @param {ozpIwc.security.Credentials} credentials
 * @param {ozpIwc.security.Subject} [preAuthenticatedSubject] - The pre-authenticated
 *   subject that is presenting these credentials.   
 * @returns {ozpIwc.AsyncAction} If the credentials are authenticated, the success handler receives
 *     the subject.
 */
ozpIwc.BasicAuthentication.prototype.login=function(credentials,preAuthenticatedSubject) {
	if(!credentials) {
		throw "Must supply credentials for login";
	}
	var action=new ozpIwc.AsyncAction();
	
	preAuthenticatedSubject=preAuthenticatedSubject || [];
	return action.resolve("success",preAuthenticatedSubject);
};


var ozpIwc=ozpIwc || {};

/** @typedef {string} ozpIwc.security.Role */

/** @typedef {string} ozpIwc.security.Permission */

/** @typedef { ozpIwc.security.Role[] } ozpIwc.security.Subject */

/** 
 * @typedef {object} ozpIwc.security.Actor 
 * @property {ozpIwc.security.Subject} securitySubject
 */


/** 
 * A basic authorization module loosely inspired by Apache Shiro.
 * <ul>
 *   <li> Role - an individual bundle of authority, represesented by a string.
 *   <li> Subject - an array of roles representing the authorities of an actor.
 *   <li> Permission - a string representing the authority to perform one discrete action.
 * </ul>
 * 
 * <p> Roles have permissions.  Subjects have one or more roles.  A check
 * is a subject asking if any of it's roles have a set of permissions. 
 * 
 * <p> The isPermitted() operation simply asks "for all permissions in the list, does the
 * subject have at least one role with that permission". 
 * 
 * <p> All operations are potentially asynchronous, though if the request can
 * be answered immediately, it will be.
 * 
 * <h2>OZP IWC's usage of authorization</h2>
 * 
 * <p> Roles are strings of the form "${domain}:${id}".  The domain
 * identifies the type of role, where the ID indentifies the specific instance.
 * 
 * <p>Supported Roles:
 * <ul>
 *   <li>participant:${address}
 *   <li>origin:${origin}
 * </ul>
 * 
 * <p> OZP IWC uses permissions of the form "${domain}:${action}:${instance}".
 * The domain is the type of the object being acted upon, the action
 * corresponds to the action being taken, and the instance is an optional
 * ID for the specific instance of the domain being acted upon.
 * 
 * @todo Permissions are local to each peer.  Does this need to be synced?
 * 
 * @class
 */
ozpIwc.BasicAuthorization=function() {
	this.roles={};	
};

/**
 * Grants permissions to a role.
 * @param {ozpIwc.security.Role} role
 * @param {ozpIwc.security.Permission[]} permissions
 * @returns {undefined}
 */
ozpIwc.BasicAuthorization.prototype.grant=function(role,permissions) {
	var a=this.roles[role] || [];
	
	this.roles[role]=a.concat(permissions);
	
};
	
/**
 * Confirms that the subject has all of the permissions requested.
 * @param {ozpIwc.security.Subject} subject
 * @param {ozpIwc.security.Permission[]} permissions
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.BasicAuthorization.prototype.isPermitted=function(subject,permissions) {
	var permMap={};
	
	var action=new ozpIwc.AsyncAction();
	if(!permissions) {
		return action.resolve('success');
	}
	if(typeof(permissions) === "string") {
		permMap[permissions]=1;
	} else {
		for(var i=0;i<permissions.length;++i) {
			permMap[permissions[i]]=1;
		}
	}
	
	if(typeof(subject) === "string") {
		subject=[subject];
	}	
	

	for(var i=0;i<subject.length;++i) {
		var perms=this.roles[subject[i]];
		if(!perms) {
			continue;
		}
		for(var k in permMap) {
			if(perms.indexOf(k) !== -1) {
				delete permMap[k];
				if(Object.keys(permMap).length === 0) {
					return action.resolve('success');
				}
			}
		}
	}
	
	return action.resolve('failure');
};

/**
 * Returns a boolean value of having specified role.
 * 
 * @class
 * @param {ozpIwc.security.Role} role
 */
ozpIwc.BasicAuthorization.prototype.hasRole=function(role) {
  var found = false;
  for (var i in this.roles) {
    if (i === role) {
      found = true;
      break;
    }
  }
  return found;
};

ozpIwc.authorization=new ozpIwc.BasicAuthorization();
/** @namespace **/
var ozpIwc = ozpIwc || {};

/**
 * <p>This link connects peers using the HTML5 localstorage API.  It is a second generation version of
 * the localStorageLink that bypasses most of the garbage collection issues.
 * 
 * <p> When a packet is sent, this link turns it to a string, creates a key with that value, and
 * immediately deletes it.  This still sends the storage event containing the packet as the key.
 * This completely eliminates the need to garbage collect the localstorage space, with the associated
 * mutex contention and full-buffer issues.
 * 
 * @todo Fragment the packet if it's more than storage can handle.
 * @todo Compress the key
 * 
 * @class
 * @param {Object} [config] - Configuration for this link
 * @param {ozpIwc.Peer} [config.peer=ozpIwc.defaultPeer] - The peer to connect to.
 * @param {string} [config.prefix='ozpIwc'] - Namespace for communicating, must be the same for all peers on the same network.
 * @param {string} [config.selfId] - Unique name within the peer network.  Defaults to the peer id.
 * @param {Number} [config.maxRetries] - Number of times packet transmission will retry if failed. Defaults to 6.
 * @param {Number} [config.queueSize] - Number of packets allowed to be queued at one time. Defaults to 1024.
 */
ozpIwc.KeyBroadcastLocalStorageLink = function(config) {
	config=config || {};

	this.prefix=config.prefix || 'ozpIwc';
	this.peer=config.peer || ozpIwc.defaultPeer;
	this.selfId=config.selfId || this.peer.selfId;
	this.myKeysTimeout = config.myKeysTimeout || 5000; // 5 seconds
	this.otherKeysTimeout = config.otherKeysTimeout || 2*60000; // 2 minutes
	this.maxRetries = config.maxRetries || 6;
	this.queueSize = config.queueSize || 1024;
	this.sendQueue = this.sendQueue || [];

  // Hook into the system
	var self=this;
	var packet;
	var receiveStorageEvent=function(event) {
		try {
			packet=JSON.parse(event.key);
		} catch(e) {
			console.log("Parse error on " + event.key );
			ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.parseError').inc();
			return;
		}
		self.peer.receive(self.linkId,packet);
		ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.received').inc();

	};
	window.addEventListener('storage',receiveStorageEvent , false); 
	
	this.peer.on("send",function(event) { 
		self.send(event.packet); 
	});
	
	this.peer.on("beforeShutdown",function() {
		window.removeEventListener('storage',receiveStorageEvent);
	},this);

};

/**
 * <p>Publishes a packet to other peers.
 * <p>If the sendQueue is full (KeyBroadcastLocalStorageLink.queueSize) send will not occur.
 * 
 * @class
 * @param {ozpIwc.NetworkPacket} - packet
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.send = function(packet) { 
  if (this.sendQueue.length < this.queueSize) {
    this.sendQueue = this.sendQueue.concat(packet);
    while (this.sendQueue.length > 0) {
      this.attemptSend(this.sendQueue.shift());
    }
  } else {
    ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.failed').inc();
    ozpIwc.log.error("Failed to write packet(len=" + packet.length + "):" + " Send queue full.");
  }
};

/**
 * <p> Recursively tries sending the packet (KeyBroadcastLocalStorageLink.maxRetries) times
 * The packet is dropped and the send fails after reaching max attempts.
 * 
 * @class
 * @param {ozpIwc.NetworkPacket} - packet  
 * @param {Number} [attemptCount] - number of times attempted to send packet.  
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.attemptSend = function(packet, retryCount) {

  var sendStatus = this.sendImpl(packet);  
  if(sendStatus) {
    var self = this;
    retryCount = retryCount || 0;
    var timeOut = Math.max(1, Math.pow(2, (retryCount-1))) - 1;
    
    if (retryCount < self.maxRetries) {
      retryCount++;
      // Call again but back off for an exponential amount of time.
      window.setTimeout(function() {
        self.attemptSend(packet, retryCount);
      }, timeOut);
    } else {
      ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.failed').inc();
      ozpIwc.log.error("Failed to write packet(len=" + packet.length + "):" + sendStatus);
      return sendStatus;
    }       
  }
};

/**
 * <p>Implementation of publishing packets to peers through localStorage.
 * <p>If the localStorage is full or a write collision occurs, the send will not occur.
 * <p>Returns status of localStorage write, null if success.
 * 
 * @todo move counter.inc() out of the impl and handle in attemptSend?
 * 
 * @class
 * @param {ozpIwc.NetworkPacket} - packet  
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.sendImpl = function(packet) {
  var sendStatus;
  try {
		var p=JSON.stringify(packet);
    localStorage.setItem(p,"");
    ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.sent').inc();
    localStorage.removeItem(p);
    sendStatus = null;
  }
  catch (e) {
    sendStatus = e;
  }
  finally {
    return sendStatus;
  }
};

/** @namespace **/
var ozpIwc = ozpIwc || {};

/**
 * <p>This link connects peers using the HTML5 localstorage API.  It handles cleaning up
 * the buffer, depduplication of sends, and other trivia.
 * 
 * <p>Individual local storage operations are atomic, but there are no consistency
 * gaurantees between multiple calls.  This means a read, modify, write operation may
 * create race conditions.  The LocalStorageLink addresses the concurrency problem without
 * locks by only allowing creation, read, and delete operations.
 * 
 * <p>Each packet is written to it's own key/value pair in local storage.  The key is the
 * of the form "${prefix}|${selfId}|${timestamp}".  Each LocalStorageLink owns the lifecycle
 * of packets it creates.
 * 
 * For senders:
 * <ol>
 *   <li> Write a new packet.
 *   <li> Wait config.myKeysTimeout milliseconds.
 *   <li> Delete own packets where the timestamp is expired.
 * </ol>
 * 
 * For receivers:
 * <ol>
 *   <li> Receive a "storage" event containing the new key.
 *   <li> Reads the packets from local storage.
 * </ol>
 * 
 * <p>The potential race condition is if the packet is deleted before the receiver
 * can read it.  In this case, the packet is simply considered lost, but no inconsistent
 * data will be read.
 * 
 * <p>Links are responsible for their own packets, but each will clean up other link's packets
 * on a much larger expiration window (config.otherKeysTimeout).  Race conditions between
 * multiple links interleaving the lockless "list keys" and "delete item" sequence generates
 * a consistent postcondition-- the key will not exist.
 * 
 * @class
 * @param {Object} [config] - Configuration for this link
 * @param {ozpIwc.Peer} [config.peer=ozpIwc.defaultPeer] - The peer to connect to.
 * @param {Number} [config.myKeysTimeout=5000] - Milliseconds to wait before deleting this link's keys.
 * @param {Number} [config.otherKeysTimeout=120000] - Milliseconds to wait before cleaning up other link's keys
 * @param {string} [config.prefix='ozpIwc'] - Namespace for communicating, must be the same for all peers on the same network.
 * @param {string} [config.selfId] - Unique name within the peer network.  Defaults to the peer id.
 */
ozpIwc.LocalStorageLink = function(config) {
	config=config || {};

	this.prefix=config.prefix || 'ozpIwc';
	this.peer=config.peer || ozpIwc.defaultPeer;
	this.selfId=config.selfId || this.peer.selfId;
	this.myKeysTimeout = config.myKeysTimeout || 5000; // 5 seconds
	this.otherKeysTimeout = config.otherKeysTimeout || 2*60000; // 2 minutes

  // Hook into the system
	var self=this;
	
	var receiveStorageEvent=function(event) {
		var key=self.splitKey(event.key);
		if(key) {
			var packet=JSON.parse(localStorage.getItem(event.key));

			if(!packet) {
				ozpIwc.metrics.counter('links.localStorage.packets.vanished').inc();
			} else if(typeof(packet) !== "object") {
				ozpIwc.metrics.counter('links.localStorage.packets.notAnObject').inc();
			} else {
				ozpIwc.metrics.counter('links.localStorage.packets.receive').inc();
				self.peer.receive(self.linkId,packet);
			} 
		};
	};
	window.addEventListener('storage',receiveStorageEvent , false); 
	
	this.peer.on("send",function(event) { 
		self.send(event.packet); 
	});
	
	this.peer.on("beforeShutdown",function() {
		self.cleanKeys();
		window.removeEventListener('storage',receiveStorageEvent);
	},this);
	
	window.setInterval(function() {
		self.cleanKeys();
	},250); 


	// METRICS
	ozpIwc.metrics.gauge('links.localStorage.buffer').set(function() {
		var	stats= {
					used: 0,
					max: 5 *1024 * 1024,
					bufferLen: 0,
					peerUsage: {},
					peerPackets: {}
					
		};
		for(var i=0; i < localStorage.length;++i) {
			var k=localStorage.key(i);
			var v=localStorage.getItem(k);
			
			var size=v.length*2;
			var oldKeyTime = ozpIwc.util.now() - this.myKeysTimeout;

			stats.used+=size;
			
			var key=self.splitKey(k);
			if(key) {
				stats.peerUsage[key.id] = stats.peerUsage[key.id]?(stats.peerUsage[key.id]+size):size;
				stats.peerPackets[key.id] = stats.peerPackets[key.id]?(stats.peerPackets[key.id]+1):1;
				stats.bufferLen++;
				if(key.createdAt < oldKeyTime) {
					stats.oldKeysCount++;
					stats.oldKeysSize+=size;
				}
			}
		}
			
		return stats;
	});
};

/**
 * Creates a key for the message in localStorage
 * @todo Is timestamp granular enough that no two packets can come in at the same time?
 * @returns {string} a new key
 */
ozpIwc.LocalStorageLink.prototype.makeKey=function(sequence) { 
	return [this.prefix,this.selfId,ozpIwc.util.now(),sequence].join('|');
};

/**
 * If it's a key for a buffered message, split it into the id of the 
 * link that put it here and the time it was created at.
 * @param {type} k The key to split
 * @returns {object} The id and createdAt for the key if it's valid, otherwise null.
 */
ozpIwc.LocalStorageLink.prototype.splitKey=function(k) { 
	var parts=k.split("|");
	if(parts.length===4 && parts[0]===this.prefix) {
		return { id: parts[1], createdAt: parseInt(parts[2]) };
	}	
	return null;
};

/**
 * Goes through localStorage and looks for expired packets.  Packets owned
 * by this link are removed if they are older than myKeysTimeout.  Other
 * keys are cleaned if they are older than otherKeysTimeout.
 * @todo Coordinate expiration windows.
 * @returns {undefined}
 */
ozpIwc.LocalStorageLink.prototype.cleanKeys=function() {
	var now=ozpIwc.util.now();
	var myKeyExpiration = now - this.myKeysTimeout;
	var otherKeyExpiration = now - this.otherKeysTimeout;

	for(var i=0; i < localStorage.length;++i) {
		var keyName=localStorage.key(i);
		var k=this.splitKey(keyName);
		if(k) {
			if((k.id===this.selfId && k.createdAt <= myKeyExpiration) 
					|| (k.createdAt <= otherKeyExpiration)) {
				localStorage.removeItem(keyName);
			}				
		}
	};


};
/**
 * Publishes a packet to other peers.
 * @todo Handle local storage being full.
 * @param {ozpIwc.NetworkPacket} packet
 */
ozpIwc.LocalStorageLink.prototype.send=function(packet) { 
	localStorage.setItem(this.makeKey(packet.sequence),JSON.stringify(packet));
	ozpIwc.metrics.counter('links.localStorage.packets.sent').inc();
	var self=this;

};


var ozpIwc=ozpIwc || {};

/**
* @typedef ozpIwc.NetworkPacket
* @property {string} src_peer - The id of the peer who broadcast this packet.
* @property {string} sequence - A monotonically increasing, unique identifier for this packet.
* @property {object} data - The payload of this packet.
*/

/**
 * @event ozpIwc.Peer#receive
 * The peer has received a packet from other peers.
 * @property {ozpIwc.NetworkPacket} packet
 * @property {string} linkId
 */


/**
 * @event ozpIwc.Peer#preSend
 * A cancelable event that allows listeners to override the forwarding of 
 * a given packet to other peers.
 * @extends ozpIwc.CancelableEvent
 * @property {ozpIwc.NetworkPacket} packet
*/

/**
 * @event ozpIwc.Peer#send
 * Notifies that a packet is being sent to other peers.  Links should use this
 * event to forward packets to other peers. 
 * @property {ozpIwc.NetworkPacket} packet
 */

/**
 * @event ozpIwc.Peer#beforeShutdown
 * Fires when the peer is being explicitly or implicitly shut down.
 */

/**
 * The peer handles low-level broadcast communications between multiple browser contexts.
 * Links do the actual work of moving the packet to other browser contexts.  The links
 * call @{link ozpIwc.Peer#receive} when they need to deliver a packet to this peer and hook
 * the @{link event:ozpIwc.Peer#send} event in order to send packets.
 * @class
 */
ozpIwc.Peer=function() {
	
	// generate a random 4 byte id
	this.selfId=ozpIwc.util.generateId();
	
	// unique ids for all packets sent by this peer
	this.sequenceCounter=0;

	// track which packets are seen from each peer
	// key is the name of the peer
	// value is an array that contains the last 50 ids seen
	this.packetsSeen={};
	
	this.knownPeers={};
	
	this.events=new ozpIwc.Event();
	this.events.mixinOnOff(this);
		
	var self=this;
	
	// Shutdown handling
	this.unloadListener=function() {
		self.shutdown();
	};
	window.addEventListener('beforeunload',this.unloadListener);

};

/**
 * Helper to determine if we've seen this packet before
 * @param {ozpIwc.NetworkPacket} packet
 * @returns {boolean}
 */
ozpIwc.Peer.prototype.haveSeen=function(packet) {
	// don't forward our own packets
	if(packet.src_peer===this.selfId) {
		ozpIwc.metrics.counter('network.packets.droppedOwnPacket').inc();
		return true;
	}
	var seen=this.packetsSeen[packet.src_peer];
	if(!seen) {
		seen=this.packetsSeen[packet.src_peer]={};
	}

	// abort if we've seen the packet before
	if(packet.sequence in seen) {
		return true;
	}

	seen[packet.sequence]=true;
	return false;
};

/**
 * Used by routers to broadcast a packet to network
 * @fires ozpIwc.Peer#preSend
 * @fires ozpIwc.Peer#send
 * @param {ozpIwc.NetworkPacket} packet
 */
ozpIwc.Peer.prototype.send= function(packet) {
	var networkPacket={
			src_peer: this.selfId,
			sequence: this.sequenceCounter++,
			data: packet
	};
	
	var preSendEvent=new ozpIwc.CancelableEvent({'packet': networkPacket});

	this.events.trigger("preSend",preSendEvent);
	if(!preSendEvent.canceled) {
		ozpIwc.metrics.counter('network.packets.sent').inc();
		this.events.trigger("send",{'packet':networkPacket});
	} else {
		ozpIwc.metrics.counter('network.packets.sendRejected').inc();
	}
};

/**
 * Called by the links when a new packet is recieved.
 * @fires ozpIwc.Peer#receive
 * @param {string} linkId
 * @param {ozpIwc.NetworkPacket} packet
 * @returns {unresolved}
 */
ozpIwc.Peer.prototype.receive=function(linkId,packet) {
	// drop it if we've seen it before
	if(this.haveSeen(packet)) {
		ozpIwc.metrics.counter('network.packets.dropped').inc();
		return;
	}
	ozpIwc.metrics.counter('network.packets.received').inc();
	this.events.trigger("receive",{'packet':packet,'linkId': linkId});
};

 /**
	* Explicitly shuts down the peer.
	* @fires ozpIwc.Peer#send
	*/
ozpIwc.Peer.prototype.shutdown=function() {
	this.events.trigger("beforeShutdown");
	window.removeEventListener('beforeunload',this.unloadListener);
};

			
var ozpIwc=ozpIwc || {};

/**
 * @class
 * @mixes ozpIwc.security.Actor
 * @property {string} address - The assigned address to this address.
 * @property {ozpIwc.security.Subject} securitySubject - The subject for this role.
 */
ozpIwc.Participant=function() {
	this.securitySubject=[];
};

/**
 * @param {ozpIwc.PacketContext} packetContext
 * @returns {boolean} true if this packet could have additional recipients
 */
ozpIwc.Participant.prototype.receiveFromRouter=function(packetContext) { 
	// doesn't really do anything other than return a bool and prevent "unused param" warnings
	return !packetContext;
};

/**
 * @param {ozpIwc.Router} router
 * @param {string} address
 * @returns {boolean} true if this packet could have additional recipients
 */
ozpIwc.Participant.prototype.connectToRouter=function(router,address) {
	this.address=address;
	this.router=router;
	this.securitySubject=this.securitySubject || [];
	this.securitySubject.push("participant:"+address);
	this.msgId=0;
};

/**
 * Populates fields relevant to this packet if they aren't already set:
 * src, ver, msgId, and time.
 * @param {ozpIwc.TransportPacket} packet
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.Participant.prototype.fixPacket=function(packet) {
	// clean up the packet a bit on behalf of the sender
	packet.src=packet.src || this.address;
	packet.ver = packet.ver || 1;

	// if the packet doesn't have a msgId, use a timestamp
	if(!packet.msgId) {
		var now=ozpIwc.util.now();
		packet.msgId = packet.msgId || this.generateMsgId();

		// might as well be helpful and set the time, too
		packet.time = packet.time || now;
	}
	return packet;
};

/**
 * Sends a packet to this participants router.  Calls fixPacket
 * before doing so.
 * @param {ozpIwc.TransportPacket} packet
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.Participant.prototype.send=function(packet) {
	packet=this.fixPacket(packet);
	var self=this;
//	window.setTimeout(function(){
		self.router.send(packet,self);
//	},0);
	return packet;
};


ozpIwc.Participant.prototype.generateMsgId=function() {
	return "i:" + this.msgId++;
};

ozpIwc.Participant.prototype.heartbeatStatus=function() {
	return {
		address: this.address,
		subjects: this.securitySubject,
		type: this.participantType || this.constructor.name,
		name: this.name
	};
};

ozpIwc.InternalParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(config) {
	ozpIwc.Participant.apply(this,arguments);
	this.replyCallbacks={};
	this.participantType="internal";
	this.name=config.name;
	this.events=new ozpIwc.Event();
	this.events.mixinOnOff(this);
});

/**
 * @param {ozpIwc.PacketContext} packetContext
 * @returns {boolean} true if this packet could have additional recipients
 */
ozpIwc.InternalParticipant.prototype.receiveFromRouter=function(packetContext) { 
	var packet=packetContext.packet;
	if(packet.replyTo && this.replyCallbacks[packet.replyTo]) {
		this.replyCallbacks[packet.replyTo](packet);
	} else {
		this.events.trigger("receive",packet);
	}	
};


ozpIwc.InternalParticipant.prototype.send=function(packet,callback) {
	var packet=this.fixPacket(packet);
	if(callback) {
		this.replyCallbacks[packet.msgId]=callback;
	}
	ozpIwc.Participant.prototype.send.apply(this,arguments);
	
	return packet;
};
var ozpIwc=ozpIwc || {};

/**
 * @typedef ozpIwc.TransportPacket
 * @property {string} src - The participant address that sent this packet
 * @property {string} dst - The intended recipient of this packet
 * @property {Number} ver - Protocol Version.  Should be 1
 * @property {Number} msgId - A unique id for this packet.
 * @property {object} entity - The payload of this packet.
 * @property {object} [permissions] - Permissions required to see the payload of this packet.
 * @property {Number} [time] - The time in milliseconds since epoch that this packet was created.
 * @property {Number} [replyTo] - Reference to the msgId that this is in reply to.
 * @property {string} [action] - Action to be performed.
 * @property {string} [resource] - Resource to perform the action upon.
 */

/**
 * @class 
 * @param {object} config
 * @param {ozpIwc.TransportPacket} config.packet
 * @param {ozpIwc.Router} config.router
 * @param {ozpIwc.Participant} [config.srcParticpant]
 * @param {ozpIwc.Participant} [config.dstParticpant]
 * @property {ozpIwc.TransportPacket} packet
 * @property {ozpIwc.Router} router
 * @property {ozpIwc.Participant} [srcParticpant]
 * @property {ozpIwc.Participant} [dstParticpant]
 */
ozpIwc.TransportPacketContext=function(config) {
	for(var i in config) {
		this[i]=config[i];
	}
};

/**
 * 
 * @param {ozpIwc.TransportPacket} response
 * @returns {ozpIwc.TransportPacket} the packet that was sent
 */
ozpIwc.TransportPacketContext.prototype.replyTo=function(response) {
	var now=new Date().getTime();
	response.ver = response.ver || 1;
	response.time = response.time || now;
	// TODO: track the last used timestamp and make sure we don't send a duplicate messageId
	// default the msgId to the current timestamp
	response.msgId = response.msgId || now;
	response.replyTo=response.replyTo || this.packet.msgId;
	response.src=response.src || this.packet.dst;
	response.dst=response.dst || this.packet.src;
	this.router.send(response);
	return response;
};

/**
 * @event ozpIwc.Router#preRegisterParticipant
 * @mixes ozpIwc.CancelableEvent
 * @property {ozpIwc.TransportPacket} [packet] - The packet to be delivered
 * @property {object} registration - Information provided by the participant about it's registration
 * @property {ozpIwc.Participant} participant - The participant that will receive the packet
 */

/**
 * @event ozpIwc.Router#preSend
 * @mixes ozpIwc.CancelableEvent
 * @property {ozpIwc.TransportPacket} packet - The packet to be sent
 * @property {ozpIwc.Participant} participant - The participant that sent the packet
 */

/**
 * @event ozpIwc.Router#preDeliver
 * @mixes ozpIwc.CancelableEvent
 * @property {ozpIwc.TransportPacket} packet - The packet to be delivered
 * @property {ozpIwc.Participant} participant - The participant that will receive the packet
 */

/**
 * @event ozpIwc.Router#send
 * @property {ozpIwc.TransportPacket} packet - The packet to be delivered
 */

/**
 * @event ozpIwc.Router#prePeerReceive
 * @mixes ozpIwc.CancelableEvent
 * @property {ozpIwc.TransportPacket} packet
 * @property {ozpIwc.NetworkPacket} rawPacket
 */
/**
 * @class
 */
ozpIwc.RouterWatchdog=ozpIwc.util.extend(ozpIwc.InternalParticipant,function(config) {
	ozpIwc.InternalParticipant.apply(this,arguments);
	
	this.participantType="routerWatchdog";
	this.on("connected",function() {
		this.name=this.router.self_id;
	},this);
	
	this.heartbeatFrequency=config.heartbeatFrequency || 10000;
	var self=this;
	
	this.timer=window.setInterval(function() {
		var heartbeat={
			dst: "names.api",
			action: "set",
			resource: "/router/" + self.router.self_id,
			entity: { participants: {} }
		};
		for(var k in self.router.participants) {
			heartbeat.entity.participants[k]=self.router.participants[k].heartbeatStatus();
		}
		self.send(heartbeat);
	},this.heartbeatFrequency);
});

ozpIwc.RouterWatchdog.prototype.connectToRouter=function(router,address) {
	ozpIwc.Participant.prototype.connectToRouter.apply(this,arguments);
	this.name=router.self_id;
};

ozpIwc.RouterWatchdog.prototype.shutdown=function() {
	window.clearInterval(this.timer);
};

/**
 * @class
 * @param {object} [config]
 * @param {ozpIwc.Peer} [config.peer=ozpIwc.defaultPeer]
 */
ozpIwc.Router=function(config) {
	config=config || {};
	this.peer=config.peer || ozpIwc.defaultPeer;

//	this.nobodyAddress="$nobody";
//	this.routerControlAddress='$transport';
	var self=this;	

	this.self_id=ozpIwc.util.generateId();
	
	// Stores all local addresses
	this.participants={};
	
	ozpIwc.metrics.gauge("transport.participants").set(function() {
		return Object.keys(self.participants).length;
	});

	this.events=new ozpIwc.Event();
	this.events.mixinOnOff(this);
	
	// Wire up to the peer
	this.peer.on("receive",function(event) {
		self.receiveFromPeer(event.packet);
	});
	
	var checkFormat=function(event) {
		var message=event.packet;
		if(message.ver !== 1) {
			event.cancel("badVersion");
		}
		if(!message.src) {
			event.cancel("nullSource");
		}
		if(!message.dst) {
			event.cancel("nullDestination");
		}
		if(event.canceled) {
			ozpIwc.metrics.counter("transport.packets.invalidFormat").inc();
		}
	};
	this.events.on("preSend",checkFormat);
	this.watchdog=new ozpIwc.RouterWatchdog({router: this});
	this.registerParticipant(this.watchdog);
};

/**
 * Allows a listener to add a new participant.  
 * @fires ozpIwc.Router#registerParticipant
 * @param {object} participant the participant object that contains a send() function.
 * @param {object} packet The handshake requesting registration.
 * @returns {string} returns participant id
 */
ozpIwc.Router.prototype.registerParticipant=function(participant,packet) {
	packet = packet || {};
	var participant_id;
	do {
			participant_id=ozpIwc.util.generateId() + "." + this.self_id;
	} while(this.participants.hasOwnProperty(participant_id));

	var registerEvent=new ozpIwc.CancelableEvent({
		'packet': packet,
		'registration': packet.entity,
		'participant': participant
	});
	this.events.trigger("preRegisterParticipant",registerEvent);

	if(registerEvent.canceled){
		// someone vetoed this participant
		ozpIwc.log.log("registeredParticipant[DENIED] origin:"+participant.origin+ 
						" because " + registerEvent.cancelReason);
		return null;
	}
	this.participants[participant_id]=participant;
	participant.connectToRouter(this,participant_id);
	
//	ozpIwc.log.log("registeredParticipant["+participant_id+"] origin:"+participant.origin);
	return participant_id;
};

/**
 * @fires ozpIwc.Router#preSend
 * @param {ozpIwc.TransportPacket} packet
 * @param {ozpIwc.Participant} sendingParticipant
 */
ozpIwc.Router.prototype.deliverLocal=function(packet,sendingParticipant) {
	if(!packet) {
		throw "Cannot deliver a null packet!";
	}
	var localParticipant=this.participants[packet.dst];
	if(!localParticipant) {
		return;
	}
	var packetContext=new ozpIwc.TransportPacketContext({
		'packet':packet,
		'router': this,
		'srcParticipant': sendingParticipant,
		'dstParticipant': localParticipant
	});

	var preDeliverEvent=new ozpIwc.CancelableEvent({
		'packet': packet,
		'dstParticipant': localParticipant,
		'srcParticipant': sendingParticipant			
	});

	if(this.events.trigger("preDeliver",preDeliverEvent).canceled) {
		ozpIwc.metrics.counter("transport.packets.rejected").inc();
		return;
	}

	ozpIwc.authorization.isPermitted(localParticipant.securitySubject,packet.permissions)
		.success(function() {
			ozpIwc.metrics.counter("transport.packets.delivered").inc();
			localParticipant.receiveFromRouter(packetContext);
		})
		.failure(function() {
			/** @todo do we send a "denied" message to the destination?  drop?  who knows? */
			ozpIwc.metrics.counter("transport.packets.forbidden").inc();
		});
	
};


/**
 * Registers a participant for a multicast group
 * @param {ozpIwc.Participant} participant
 * @param {String[]} multicastGroups
 */
ozpIwc.Router.prototype.registerMulticast=function(participant,multicastGroups) {
	var self=this;
	multicastGroups.forEach(function(groupName) {
		var g=self.participants[groupName];
		if(!g) {
			g=self.participants[groupName]=new ozpIwc.MulticastParticipant(groupName);
		}
		g.addMember(participant);
	});
	return multicastGroups;
};

/**
 * Used by participant listeners to route a message to other participants.
 * @fires ozpIwc.Router#preSend
 * @fires ozpIwc.Router#send
 * @param {ozpIwc.TransportPacket} packet The packet to route.
 * @param {ozpIwc.Participant} sendingParticipant Information about the participant that is attempting to send
 *   the packet.
 * @returns {undefined}
 */
ozpIwc.Router.prototype.send=function(packet,sendingParticipant) {

	var preSendEvent=new ozpIwc.CancelableEvent({
		'packet': packet,
		'participant': sendingParticipant
	});
	this.events.trigger("preSend",preSendEvent);

	if(preSendEvent.canceled) {
		ozpIwc.metrics.counter("transport.packets.sendCanceled");
		return;
	} 
	ozpIwc.metrics.counter("transport.packets.sent").inc();
	this.deliverLocal(packet,sendingParticipant);
	this.events.trigger("send",{'packet': packet});
	this.peer.send(packet);
};

/**
 * Recieve a packet from the peer
 * @fires ozpIwc.Router#peerReceive
 * @param packet {ozpIwc.TransportPacket} the packet to receive
 */
ozpIwc.Router.prototype.receiveFromPeer=function(packet) {
	ozpIwc.metrics.counter("transport.packets.receivedFromPeer").inc();
	var peerReceiveEvent=new ozpIwc.CancelableEvent({
		'packet' : packet.data,
		'rawPacket' : packet
	});
	this.events.trigger("prePeerReceive",peerReceiveEvent);

	if(!peerReceiveEvent.canceled){
		this.deliverLocal(packet.data);
	}
};


var ozpIwc=ozpIwc || {};

/**
 * Baseclass for APIs that need leader election.  Uses the Bully algorithm for leader election.
 * @class
 * @param {object} config
 * @param {String} config.name 
 *        The name of this API.
 * @param {Object} config.target
 *				The packet receiver that gets non-election messages.
 * @param {string} [config.electionAddress=config.name+".election"] 
 *        The multicast channel for running elections.  
 *        The leader will register to receive multicast on this channel.
 * @param {number} [config.priority=Math.Random] 
 *        How strongly this node feels it should be leader.
 * @param {function} [config.priorityLessThan] 
 *        Function that provides a strict total ordering on the priority.  Default is "<".
 * @param {number} [config.electionTimeout=250] 
 *        Number of milliseconds to wait before declaring victory on an election. 
 
 */
ozpIwc.LeaderGroupParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(config) {
	ozpIwc.Participant.apply(this,arguments);

	if(!config.name) {
		throw "Config must contain a name value";
	}
	
	// Networking info
	this.name=config.name;
	this.target=config.target || { receive: function() {}};
	
	this.electionAddress=config.electionAddress || (this.name + ".election");

	// Election times and how to score them
	this.priority = config.priority || ozpIwc.defaultLeaderPriority || Math.random();
	this.priorityLessThan = config.priorityLessThan || function(l,r) { return l < r; };
	this.electionTimeout=config.electionTimeout || 250; // quarter second
	this.leaderState="connecting";
	this.electionQueue=[];
	
	// tracking the current leader
	this.leader=null;
	this.leaderPriority=null;
	this.events=new ozpIwc.Event();
	this.events.mixinOnOff(this);

	this.participantType="leaderGroupMember";
	this.name=config.name;
	
	this.on("startElection",function() {
			this.electionQueue=[];
	},this);
	
	this.on("becameLeader",function() {
		this.electionQueue.forEach(function(p) {
			this.forwardToTarget(p);
		},this);
		this.electionQueue=[];
	},this);

	this.on("newLeader",function() {
		this.electionQueue=[];
	},this);
	var self=this;
	
	// handoff when we shut down
	window.addEventListener("beforeunload",function() {
		self.leaderPriority=0;
		self.sendSync();
		self.startElection();
		
	});
	
});

ozpIwc.LeaderGroupParticipant.prototype.connectToRouter=function(router,address) {
	ozpIwc.Participant.prototype.connectToRouter.apply(this,arguments);
	this.router.registerMulticast(this,[this.electionAddress,this.name]);
	this.startElection();
};

/**
 * Checks to see if the leadership group is in an election
 * @returns {Boolean} True if in an election state, otherwise false
 */
ozpIwc.LeaderGroupParticipant.prototype.inElection=function() {
	return !!this.electionTimer;
};

/**
 * Checks to see if this instance is the leader of it's group.
 * @returns {Boolean}
 */
ozpIwc.LeaderGroupParticipant.prototype.isLeader=function() {
	return this.leader === this.address;
};

/**
 * Sends a message to the leadership group.
 * @private
 * @param {string} type - the type of message-- "election" or "victory"
 */
ozpIwc.LeaderGroupParticipant.prototype.sendElectionMessage=function(type) {
	this.send({
			dst: this.electionAddress,
			action: type,
			entity: {
				'priority': this.priority
			}
	});
};

/**
 * Attempt to start a new election.
 * @protected
 * @returns {undefined}
 * @fire ozpIwc.LeaderGroupParticipant#startElection
 * @fire ozpIwc.LeaderGroupParticipant#becameLeader
 */
ozpIwc.LeaderGroupParticipant.prototype.startElection=function() {
	// don't start a new election if we are in one
	if(this.inElection()) {
		return;
	}
	this.leaderState="election";
	this.events.trigger("startElection");
	
	var self=this;
	// if no one overrules us, declare victory
	this.electionTimer=window.setTimeout(function() {
		self.cancelElection();
		self.leader=self.address;
		self.leaderPriority=self.priority;
		self.leaderState="leader";
		self.sendElectionMessage("victory");	
		self.events.trigger("becameLeader");
	},this.electionTimeout);

	this.sendElectionMessage("election");
};

/**
 * Cancels an in-progress election that we started.
 * @protected
 * @fire ozpIwc.LeaderGroupParticipant#endElection
 */
ozpIwc.LeaderGroupParticipant.prototype.cancelElection=function() {
	if(this.electionTimer) {	
		window.clearTimeout(this.electionTimer);
		this.electionTimer=null;
		this.events.trigger("endElection");
	}
};

/**
 * Receives a packet on the election control group or forwards it to the target implementation
 * that of this leadership group.
 * @param {ozpIwc.TransportPacket} packet
 * @returns {boolean}
 */
ozpIwc.LeaderGroupParticipant.prototype.receiveFromRouter=function(packetContext) {
	var packet=packetContext.packet;
	packetContext.leaderState=this.leaderState;
	// forward non-election packets to the current state
	if(packet.dst !== this.electionAddress) {
		this.forwardToTarget(packetContext);
	} else {
		if(packet.src === this.address) {
			// even if we see our own messages, we shouldn't act upon them
			return;
		}else if(packet.action === "election") {
			this.handleElectionMessage(packet);
		} else if(packet.action === "victory") {
			this.handleVictoryMessage(packet);
		} else if(packet.action === "sync") {
			this.handleSyncMessage(packet);
		}
	}
};
/**
 * Convention based routing.  Routes to a functions in order of
 * <ol>
 *   <li>handle${action}As${leaderState}</li>
 *   <li>handle${action}</li>
 *   <li>defaultHandlerAs${leaderState}</li>
 *   <li>defaultHandler</li>
 * </ol>
 * The variable action is the packet's action and leaderstate is the current leadership state.
 * If there's no packet action, then the handle* functions will not be invoked.
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.LeaderGroupParticipant.prototype.forwardToTarget=function(packetContext) {
	if(this.leaderState === "election" || this.leaderState === "connecting") {
		this.electionQueue.push(packetContext);
		return;
	}
	var packet=packetContext.packet;
	var handler="handle";
	var stateSuffix="As" + this.leaderState.charAt(0).toUpperCase() + this.leaderState.slice(1).toLowerCase();
	var checkdown=[];
	
	if(packet.action) {
		var handler="handle" + packet.action.charAt(0).toUpperCase() + packet.action.slice(1).toLowerCase();
		checkdown.push(handler+stateSuffix);
		checkdown.push(handler);
	}
	checkdown.push("defaultHandler" + stateSuffix);
	checkdown.push("defaultHandler");
	
	for(var i=0; i< checkdown.length; ++i) {
		handler=this.target[checkdown[i]];
		if(typeof(handler) === 'function') {
			var replies=handler.call(this.target,packetContext);
			for(var j=0;j<replies.length;++j) {
				var reply=this.fixPacket(replies[j]);
				reply.src = this.name;
				reply.dst = reply.dst || packet.src;
				reply.replyTo = reply.replyTo || packet.msgId;
				reply.resource = reply.resource || packet.resource;
				this.send(reply);
			}
		}
	}
};
	
	
/**
 * Respond to someone else starting an election.
 * @private
 * @param {ozpIwc.TransportPacket} electionMessage
 * @returns {undefined}
 */
ozpIwc.LeaderGroupParticipant.prototype.handleElectionMessage=function(electionMessage) {

	// is the new election lower priority than us?
	if(this.priorityLessThan(electionMessage.entity.priority,this.priority)) {
		// Quell the rebellion!
		this.startElection();
	} else {
		if(this.isLeader()) {
			this.sendSync();
		}
		// Abandon dreams of leadership
		this.cancelElection();
	}
};

/**
 * Handle someone else declaring victory.
 * @fire ozpIwc.LeaderGroupParticipant#newLeader
 * @param {ozpIwc.TransportPacket} victoryMessage
 */
ozpIwc.LeaderGroupParticipant.prototype.handleVictoryMessage=function(victoryMessage) {
	if(this.priorityLessThan(victoryMessage.entity.priority,this.priority)) {
		// someone usurped our leadership! start an election!
		this.startElection();
	} else {
		// submit to the bully
		this.leader=victoryMessage.src;
		this.leaderPriority=victoryMessage.entity.priority;
		this.cancelElection();
		this.leaderState="member";
		this.events.trigger("newLeader");
	}
};

ozpIwc.LeaderGroupParticipant.prototype.handleSyncMessage=function(packet) {
	if(typeof(this.target.receiveSync)==="function" && !this.isLeader()) {
		ozpIwc.log.log("LeaderParticipant["+this.name+"::"+this.address+"] received sync " + JSON.stringify(packet.entity,null,2));
		this.target.receiveSync(packet.entity);
	}
};

ozpIwc.LeaderGroupParticipant.prototype.sendSync=function() {
	if('generateSync' in this.target) {
		var syncData=this.target.generateSync();
		ozpIwc.log.log("LeaderParticipant["+this.name+"::"+this.address+"] generated sync" + JSON.stringify(syncData,null,2));
		this.send({
			dst: this.electionAddress,
			action: 'sync',
			entity: syncData
		});
	}
};

ozpIwc.LeaderGroupParticipant.prototype.heartbeatStatus=function() {
	var status= ozpIwc.Participant.prototype.heartbeatStatus.apply(this,arguments);
	status.leaderState=this.leaderState;
	status.leaderPriority=this.priority;
	return status;
};
var ozpIwc=ozpIwc || {};

/**
 * @class
 * @extends ozpIwc.Participant
 * @param {string} name
 */
ozpIwc.MulticastParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(name) {
	ozpIwc.Participant.apply(this,arguments);
	this.name=name;
	this.participantType="multicast";
	this.members=[];
});

/**
 * Receives a packet on behalf of the multicast group.
 * @param {ozpIwc.TransportPacket} packet
 * @returns {Boolean}
 */
ozpIwc.MulticastParticipant.prototype.receiveFromRouter=function(packet) {
	this.members.forEach(function(m) { m.receiveFromRouter(packet);});
	return false;
};

/**
 * 
 * @param {ozpIwc.Participant} participant
 */
ozpIwc.MulticastParticipant.prototype.addMember=function(participant) {
	this.members.push(participant);
};

ozpIwc.MulticastParticipant.prototype.heartbeatStatus=function() {
	var status= ozpIwc.Participant.prototype.heartbeatStatus.apply(this,arguments);
	status.members=this.members.map(function(m) { return m.address;});
	return status;
};
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview
 * The global object gadgets.json contains two methods.
 *
 * gadgets.json.stringify(value) takes a JavaScript value and produces a JSON
 * text. The value must not be cyclical.
 *
 * gadgets.json.parse(text) takes a JSON text and produces a JavaScript value.
 * It will return false if there is an error.
*/

var gadgets = gadgets || {};

/**
 * @static
 * @class Provides operations for translating objects to and from JSON.
 * @name gadgets.json
 */

/**
 * Port of the public domain JSON library by Douglas Crockford.
 * See: http://www.json.org/json2.js
 */
gadgets.json = function () {

  /**
   * Formats integers to 2 digits.
   * @param {Number} n
   */
  function f(n) {
    return n < 10 ? '0' + n : n;
  }

  Date.prototype.toJSON = function () {
    return [this.getUTCFullYear(), '-',
           f(this.getUTCMonth() + 1), '-',
           f(this.getUTCDate()), 'T',
           f(this.getUTCHours()), ':',
           f(this.getUTCMinutes()), ':',
           f(this.getUTCSeconds()), 'Z'].join("");
  };

  // table of character substitutions
  var m = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
  };

  /**
   * Converts a json object into a string.
   */
  function stringify(value) {
    var a,          // The array holding the partial texts.
        i,          // The loop counter.
        k,          // The member key.
        l,          // Length.
        r = /["\\\x00-\x1f\x7f-\x9f]/g,
        v;          // The member value.

    switch (typeof value) {
    case 'string':
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe ones.
      return r.test(value) ?
          '"' + value.replace(r, function (a) {
            var c = m[a];
            if (c) {
              return c;
            }
            c = a.charCodeAt();
            return '\\u00' + Math.floor(c / 16).toString(16) +
                (c % 16).toString(16);
            }) + '"'
          : '"' + value + '"';
    case 'number':
    // JSON numbers must be finite. Encode non-finite numbers as null.
      return isFinite(value) ? String(value) : 'null';
    case 'boolean':
    case 'null':
      return String(value);
    case 'object':
    // Due to a specification blunder in ECMAScript,
    // typeof null is 'object', so watch out for that case.
      if (!value) {
        return 'null';
      }
      // toJSON check removed; re-implement when it doesn't break other libs.
      a = [];
      if (typeof value.length === 'number' &&
          !(value.propertyIsEnumerable('length'))) {
        // The object is an array. Stringify every element. Use null as a
        // placeholder for non-JSON values.
        l = value.length;
        for (i = 0; i < l; i += 1) {
          a.push(stringify(value[i]) || 'null');
        }
        // Join all of the elements together and wrap them in brackets.
        return '[' + a.join(',') + ']';
      }
      // Otherwise, iterate through all of the keys in the object.
      for (k in value) if (value.hasOwnProperty(k)) {
        if (typeof k === 'string') {
          v = stringify(value[k]);
          if (v) {
            a.push(stringify(k) + ':' + v);
          }
        }
      }
      // Join all of the member texts together and wrap them in braces.
      return '{' + a.join(',') + '}';
    }
  }

  return {
    stringify: stringify,
    parse: function (text) {
// Parsing happens in three stages. In the first stage, we run the text against
// regular expressions that look for non-JSON patterns. We are especially
// concerned with '()' and 'new' because they can cause invocation, and '='
// because it can cause mutation. But just to be safe, we want to reject all
// unexpected forms.

// We split the first stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace all backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/b-u]/g, '@').
          replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
          replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return eval('(' + text + ')');
      }
      // If the text is not JSON parseable, then return false.

      return false;
    }
  };
}();



ozpIwc.Owf7ParticipantListener=function(config) {
	config = config || {};
	
//	var widgetUrl="https://localhost:15005/";
	this.widgetQuery="?lang=en_US&owf=true&themeName=a_default&themeContrast=standard&themeFontSize=12";
	
//	var instanceId="666f46bf-d8da-27c4-b907-f4a3a9e58c75";
//	var widgetGuid="eb5435cf-4021-4f2a-ba69-dde451d12551";
	
	this.rpcRelay=config.rpcRelay || $('<a href="rpc_relay.uncompressed.html"></a>')[0].href;
	this.prefsUrl=config.prefsUrl || $('<a href="owf7prefs.html"></a>')[0].href + "#";

	// these get turned into the iframes name attribute
	// Refer to js/eventing/container.js:272
	this.baseWidgetParams={
		"id": instanceId,
		"webContextPath":"/owf",
		"preferenceLocation": this.prefsUrl,
		"relayUrl":  this.rpcRelay, 
		"url": widgetUrl,
		"guid": widgetGuid,
		// fixed values
		"layout":"desktop",
		"containerVersion":"7.0.1-GA",
		"owf":true,
		"lang":"en_US",
		"currentTheme":{
			"themeName":"a_default",
			"themeContrast":"standard",
			"themeFontSize":12
		},		
		"version":1,
		"locked":false
	};
};

ozpIwc.Owf7ParticipantListener.prototype.widgetParams=function(config) {
	var params={};
	for(var k in this.baseWidgetParams) {
		params[k]=baseWidgetParams[k];
	}
	for(var k in config) {
		params[k]=config[k];
	}
	return params;
};

ozpIwc.Owf7ParticipantListener.prototype.initializeIframe=function(config) {
	var instanceIdString=config.id || ozpIwc.util.generateId();
	var widgetParams=JSON.stringify(this.widgetParams({
		id: instanceIdString,
		guid: config.widgetGuid,
		url: config.widgetUrl
	}));
	
	config.widgetIframe.attr("name",JSON.stringify(widgetParams))
					.attr("src",config.widgetUrl+this.widgetQuery)
					.attr("id",instanceIdString);
};

ozpIwc.Owf7ParticipantListener.prototype.hook=function() {
	var rpcString=function(rpc) {
		return "[service:" + rpc.s + ",from:" + rpc.f + "]:" + JSON.stringify(rpc.a);
	};
	
	gadgets.rpc.registerDefault(function() {
		console.log("Unknown rpc " + rpcString(this));
	});
	
	/**
	 * Called by the widget to connect to the container
	 * @see js/eventing/Container.js:26 for the containerInit function that much of this is copied from
	 * @see js/eventing/Container.js:104 for the actual rpc.register
	 */
	gadgets.rpc.register('container_init',function(sender,message) {
		// The container sends params, but the widget JS ignors them
		var initMessage = gadgets.json.parse(message);
		var useMultiPartMessagesForIFPC = initMessage.useMultiPartMessagesForIFPC;
		var idString = null;
		if (initMessage.id.charAt(0) !== '{') {
				idString = initMessage.id;
		}
		else {
				var obj = gadgets.json.parse(initMessage.id);
				var id = obj.id;
				idString = gadgets.json.stringify({id:obj.id});
		}

		gadgets.rpc.setRelayUrl(idString, initMessage.relayUrl, false, useMultiPartMessagesForIFPC);
		gadgets.rpc.setAuthToken(idString, 0);
		gadgets.rpc.call(idString, 'after_container_init', null);
	});
	
	gadgets.rpc.register('_widget_iframe_ready',function() {
		// @see js/components/keys/KeyEventing.js
	});
	
	/**
	 * @see js\state\WidgetStateContainer.js:35
	 */
	gadgets.rpc.register('_WIDGET_STATE_CHANNEL_'+instanceId,function() {
		
	});

	var specialPubsubChannelDefault={
			publish: function(message, dest, rpc) { 
				console.log("Unimplemented specialchannel publish " + rpcString(rpc));
			},
			subscribe: function(message, dest,rpc) { 
				console.log("Unimplemented specialchannel subscribe " +  rpcString(rpc));
			},
			unsubscribe: function(message, dest,rpc) { 
				console.log("Unimplemented specialchannel unsubscribe " + rpcString(rpc));
			}
		};
	var specialPubsubChannels={
		'_dragStart': specialPubsubChannelDefault,
	  '_dragOutName': specialPubsubChannelDefault,
    '_dragStopInContainer':specialPubsubChannelDefault,
		'_dropReceiveData':specialPubsubChannelDefault
	};

	/**
	 * @param {string} command - publish | subscribe | unsubscribe
	 * @param {string} channel - the OWF7 channel
	 * @param {string} message - the message being published
	 * @param {string} dest - the ID of the recipient if this is point-to-point
	 * @see js/eventing/Container.js:376
	 * @see js-lib/shindig/pubsub.js
	 * @see js-lib/shindig/pubsub_router.js
	 */
	gadgets.rpc.register('pubsub',function(command, channel, message, dest) {
		if(specialPubsubChannels[channel]) {
			specialPubsubChannels[channel][command].call(specialPubsubChannels[channel], message, dest,this);
		} else {
			switch (command) {
				case 'publish': 
					console.log("eventing.publish not implemented [channel:" + channel + ", message:" + message);
					break;
				case 'subscribe': break;
					console.log("eventing.subscribe not implemented [channel:" + channel + ", message:" + message);
					break;
				case 'unsubscribe': break;
					console.log("eventing.unsubscribe not implemented [channel:" + channel + ", message:" + message);
					break;
			}
		}
	});
//
//	// Intents API
//	
//	// used for both handling and invoking intents
//	// @see js/intents/WidgetIntentsContainer.js:32 for reference
//	gadgets.rpc.register('_intents',function(senderId, intent, data, destIds) {
//	});
//	
//	// used by widgets to register an intent
//	// @see js/intents/WidgetIntentsContainer.js:85 for reference
//	gadgets.rpc.register('_intents_receive',function(intent, destWidgetId) {
//	});
//
//	// Launcher API
//	// @see js/launcher/WidgetLauncherContainer.js:22, 36
//	gadgets.rpc.register('_WIDGET_LAUNCHER_CHANNEL',function(sender, msg) {
//	});
//
//	// WidgetProxy readiness
//	// @see js/kernel/kernel-rpc-base.js:130
//	gadgets.rpc.register('_widgetReady',function(widgetId) {
//	});
//	// @see js/kernel/kernel-rpc-base.js:147
//	gadgets.rpc.register('_getWidgetReady',function(widgetId, srcWidgetId) {
//	});
//
//	// OWF.log
//	gadgets.rpc.register('Ozone.log',function() {
//	});
//
//	// Widget State functions

//	gadgets.rpc.register('after_container_init',function() {
//	});
//
//	gadgets.rpc.register('_WIDGET_STATE_CHANNEL_' + instanceId,function() {
//	});

	
	
};
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview Remote procedure call library for gadget-to-container,
 * container-to-gadget, and gadget-to-gadget (thru container) communication.
 */

var gadgets = gadgets || {};

/**
 * @static
 * @class Provides operations for making rpc calls.
 * @name gadgets.rpc
 */
gadgets.rpc = function() {
  //alert("Initing gadgets.rpc");
  // General constants.
  var CALLBACK_NAME = '__cb';
  var DEFAULT_NAME = '';

  // Consts for FrameElement.
  var FE_G2C_CHANNEL = '__g2c_rpc';
  var FE_C2G_CHANNEL = '__c2g_rpc';

  // Consts for NIX. VBScript doesn't
  // allow items to start with _ for some reason,
  // so we need to make these names quite unique, as
  // they will go into the global namespace.
  var NIX_WRAPPER = 'GRPC____NIXVBS_wrapper';
  var NIX_GET_WRAPPER = 'GRPC____NIXVBS_get_wrapper';
  var NIX_HANDLE_MESSAGE = 'GRPC____NIXVBS_handle_message';
  var NIX_CREATE_CHANNEL = 'GRPC____NIXVBS_create_channel';

  // JavaScript reference to the NIX VBScript wrappers.
  // Gadgets will have but a single channel under
  // nix_channels['..'] while containers will have a channel
  // per gadget stored under the gadget's ID.
  var nix_channels = {};

  var services = {};
  var iframePool = [];
  var relayUrl = {};
  var useLegacyProtocol = {};
  var authToken = {};
  var callId = 0;
  var callbacks = {};
  var setup = {};
  var sameDomain = {};
  var params = {};

  // Load the authentication token for speaking to the container
  // from the gadget's parameters, or default to '0' if not found.
  if (gadgets.util) {
    params = gadgets.util.getUrlParameters();
	//alert("gadget params: " + params);
  }

  authToken['..'] = params.rpctoken || params.ifpctok || 0;

  //ifpc mods
  var URL_LIMIT = 2000;
  var messagesIn = {};
  var useMultiPartMessages = {};
  //ifpc mods


  /*
   * Return a short code representing the best available cross-domain
   * message transport available to the browser.
   *
   * + For those browsers that support native messaging (various implementations
   *   of the HTML5 postMessage method), use that. Officially defined at
   *   http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html.
   *
   *   postMessage is a native implementation of XDC. A page registers that
   *   it would like to receive messages by listening the the "message" event
   *   on the window (document in DPM) object. In turn, another page can
   *   raise that event by calling window.postMessage (document.postMessage
   *   in DPM) with a string representing the message and a string
   *   indicating on which domain the receiving page must be to receive
   *   the message. The target page will then have its "message" event raised
   *   if the domain matches and can, in turn, check the origin of the message
   *   and process the data contained within.
   *
   *     wpm: postMessage on the window object.
   *        - Internet Explorer 8+
   *        - Safari (latest nightlies as of 26/6/2008)
   *        - Firefox 3+
   *        - Opera 9+
   *
   *     dpm: postMessage on the document object.
   *        - Opera 8+
   *
   * + For Internet Explorer before version 8, the security model allows anyone
   *   parent to set the value of the "opener" property on another window,
   *   with only the receiving window able to read it.
   *   This method is dubbed "Native IE XDC" (NIX).
   *
   *   This method works by placing a handler object in the "opener" property
   *   of a gadget when the container sets up the authentication information
   *   for that gadget (by calling setAuthToken(...)). At that point, a NIX
   *   wrapper is created and placed into the gadget by calling
   *   theframe.contentWindow.opener = wrapper. Note that as a result, NIX can
   *   only be used by a container to call a particular gadget *after* that
   *   gadget has called the container at least once via NIX.
   *
   *   The NIX wrappers in this RPC implementation are instances of a VBScript
   *   class that is created when this implementation loads. The reason for
   *   using a VBScript class stems from the fact that any object can be passed
   *   into the opener property.
   *   While this is a good thing, as it lets us pass functions and setup a true
   *   bidirectional channel via callbacks, it opens a potential security hole
   *   by which the other page can get ahold of the "window" or "document"
   *   objects in the parent page and in turn wreak havok. This is due to the
   *   fact that any JS object useful for establishing such a bidirectional
   *   channel (such as a function) can be used to access a function
   *   (eg. obj.toString, or a function itself) created in a specific context,
   *   in particular the global context of the sender. Suppose container
   *   domain C passes object obj to gadget on domain G. Then the gadget can
   *   access C's global context using:
   *   var parentWindow = (new obj.toString.constructor("return window;"))();
   *   Nulling out all of obj's properties doesn't fix this, since IE helpfully
   *   restores them to their original values if you do something like:
   *   delete obj.toString; delete obj.toString;
   *   Thus, we wrap the necessary functions and information inside a VBScript
   *   object. VBScript objects in IE, like DOM objects, are in fact COM
   *   wrappers when used in JavaScript, so we can safely pass them around
   *   without worrying about a breach of context while at the same time
   *   allowing them to act as a pass-through mechanism for information
   *   and function calls. The implementation details of this VBScript wrapper
   *   can be found in the setupChannel() method below.
   *
   *     nix: Internet Explorer-specific window.opener trick.
   *       - Internet Explorer 6
   *       - Internet Explorer 7
   *
   * + For Gecko-based browsers, the security model allows a child to call a
   *   function on the frameElement of the iframe, even if the child is in
   *   a different domain. This method is dubbed "frameElement" (fe).
   *
   *   The ability to add and call such functions on the frameElement allows
   *   a bidirectional channel to be setup via the adding of simple function
   *   references on the frameElement object itself. In this implementation,
   *   when the container sets up the authentication information for that gadget
   *   (by calling setAuth(...)) it as well adds a special function on the
   *   gadget's iframe. This function can then be used by the gadget to send
   *   messages to the container. In turn, when the gadget tries to send a
   *   message, it checks to see if this function has its own function stored
   *   that can be used by the container to call the gadget. If not, the
   *   function is created and subsequently used by the container.
   *   Note that as a result, FE can only be used by a container to call a
   *   particular gadget *after* that gadget has called the container at
   *   least once via FE.
   *
   *     fe: Gecko-specific frameElement trick.
   *        - Firefox 1+
   *
   * + For all others, we have a fallback mechanism known as "ifpc". IFPC
   *   exploits the fact that while same-origin policy prohibits a frame from
   *   accessing members on a window not in the same domain, that frame can,
   *   however, navigate the window heirarchy (via parent). This is exploited by
   *   having a page on domain A that wants to talk to domain B create an iframe
   *   on domain B pointing to a special relay file and with a message encoded
   *   after the hash (#). This relay, in turn, finds the page on domain B, and
   *   can call a receipt function with the message given to it. The relay URL
   *   used by each caller is set via the gadgets.rpc.setRelayUrl(..) and
   *   *must* be called before the call method is used.
   *
   *     ifpc: Iframe-based method, utilizing a relay page, to send a message.
   */
  function getRelayChannel() {
//    return 'ifpc';
    return typeof window.postMessage === 'function' ? 'wpm' :
           typeof window.postMessage === 'object' ? 'wpm':
           typeof document.postMessage === 'function' ? 'dpm' :
           window.ActiveXObject ? 'nix' :
           navigator.product === 'Gecko' ? 'fe' :
           'ifpc';
  }

  /**
   * Conducts any initial global work necessary to setup the
   * channel type chosen.
   */
  function setupChannel() {
    // If the channel type is one of the native
    // postMessage based ones, setup the handler to receive
    // messages.
    if (relayChannel === 'dpm' || relayChannel === 'wpm') {
      var onmessage = function (packet) {
        // TODO validate packet.domain for security reasons
        process(gadgets.json.parse(packet.data));
      }

      if (typeof window.addEventListener != 'undefined') {
        window.addEventListener('message', onmessage, false);
      } else if (typeof window.attachEvent != 'undefined') {
        window.attachEvent('onmessage', onmessage);
      }

    }

    // If the channel type is NIX, we need to ensure the
    // VBScript wrapper code is in the page and that the
    // global Javascript handlers have been set.
    if (relayChannel === 'nix') {

       //alert('nix setup!');

      // VBScript methods return a type of 'unknown' when
      // checked via the typeof operator in IE. Fortunately
      // for us, this only applies to COM objects, so we
      // won't see this for a real Javascript object.
      if (typeof window[NIX_GET_WRAPPER] !== 'unknown') {
        window[NIX_HANDLE_MESSAGE] = function(data) {
          process(gadgets.json.parse(data));
        };

        window[NIX_CREATE_CHANNEL] = function(name, channel, token) {
          // Verify the authentication token of the gadget trying
          // to create a channel for us.
          if (authToken[name] == token) {
            nix_channels[name] = channel;
          }
        };

        // Inject the VBScript code needed.
        var vbscript =
          // We create a class to act as a wrapper for
          // a Javascript call, to prevent a break in of
          // the context.
          'Class ' + NIX_WRAPPER + '\n '

          // An internal member for keeping track of the
          // name of the document (container or gadget)
          // for which this wrapper is intended. For
          // those wrappers created by gadgets, this is not
          // used (although it is set to "..")
          + 'Private m_Intended\n'

          // Stores the auth token used to communicate with
          // the gadget. The GetChannelCreator method returns
          // an object that returns this auth token. Upon matching
          // that with its own, the gadget uses the object
          // to actually establish the communication channel.
          + 'Private m_Auth\n'

          // Method for internally setting the value
          // of the m_Intended property.
          + 'Public Sub SetIntendedName(name)\n '
          + 'If isEmpty(m_Intended) Then\n'
          + 'm_Intended = name\n'
          + 'End If\n'
          + 'End Sub\n'

          // Method for internally setting the value of the m_Auth property.
          + 'Public Sub SetAuth(auth)\n '
          + 'If isEmpty(m_Auth) Then\n'
          + 'm_Auth = auth\n'
          + 'End If\n'
          + 'End Sub\n'

          // A wrapper method which actually causes a
          // message to be sent to the other context.
          + 'Public Sub SendMessage(data)\n '
          + NIX_HANDLE_MESSAGE + '(data)\n'
          + 'End Sub\n'

          // Returns the auth token to the gadget, so it can
          // confirm a match before initiating the connection
          + 'Public Function GetAuthToken()\n '
          + 'GetAuthToken = m_Auth\n'
          + 'End Function\n'

          // Method for setting up the container->gadget
          // channel. Not strictly needed in the gadget's
          // wrapper, but no reason to get rid of it. Note here
          // that we pass the intended name to the NIX_CREATE_CHANNEL
          // method so that it can save the channel in the proper place
          // *and* verify the channel via the authentication token passed
          // here.
          + 'Public Sub CreateChannel(channel, auth)\n '
          + 'Call ' + NIX_CREATE_CHANNEL + '(m_Intended, channel, auth)\n'
          + 'End Sub\n'
          + 'End Class\n'

          // Function to get a reference to the wrapper.
          + 'Function ' + NIX_GET_WRAPPER + '(name, auth)\n'
          + 'Dim wrap\n'
          + 'Set wrap = New ' + NIX_WRAPPER + '\n'
          + 'wrap.SetIntendedName name\n'
          + 'wrap.SetAuth auth\n'
          + 'Set ' + NIX_GET_WRAPPER + ' = wrap\n'
          + 'End Function';

        try {
          //alert('execScript! '+vbscript);
          window.execScript(vbscript, 'vbscript');
        } catch (e) {

          //alert('exception! back to ifpc');
          // Fall through to IFPC.
          relayChannel = 'ifpc';
        }
      }
    }
  }

  //Store the parsed window.name configuration, if necessary
  var config = null;

  //Parse the window.name configuration and cache it.  Handle the case
  //where containers use a JSON string in the window name and a plain string,
//  function getConfig() {
//    if (config == null) {
//        config = {};
//        if (window.name.charAt(0) != '{') {
//            config.rpcId = window.name;
//            config.kernel = true;
//        } else {
//            config = gadgets.json.parse(window.name);
//            config.rpcId = config.id;
//            return config;
//        }
//    } else {
//        return config;
//    }
//  }

  //Get the IFrame ID from the window.name property.  Handle three cases
  //1. OWF Webtop, which assumes IFrame IDs are identical to window names
  //2. OWF Kernel, which assumes that IFrame IDs are contianed in the window name as JSON as the id field
  //3. Others, which use a plain string in the window name and assume the IFrame id is also this plain string
//  function getId(windowName) {
//    var conf = getConfig();
//    if (conf.kernel)
//        return conf.rpcId;
//    else
//        return windowName;
//  }

  function getId(windowName) {
    if (windowName.charAt(0) != '{') {
      return windowName
    }
    else {
      var obj = gadgets.json.parse(windowName);
      var id = obj.id;
      return gadgets.json.stringify({id:obj.id});
    }
  }

  // Pick the most efficient RPC relay mechanism
  var relayChannel = getRelayChannel();
  //alert('relaychannel is '+relayChannel);

  // Conduct any setup necessary for the chosen channel.
  setupChannel();

  // Create the Default RPC handler.
  services[DEFAULT_NAME] = function() {
    //suppress this error - no one should ever try to use a service that wasn't registered using our api
    //throw new Error('Unknown RPC service: ' + this.s);
  };

  // Create a Special RPC handler for callbacks.
  services[CALLBACK_NAME] = function(callbackId, result) {
    var callback = callbacks[callbackId];
    if (callback) {
      delete callbacks[callbackId];
      callback(result);
    }
  };

  /**
   * Conducts any frame-specific work necessary to setup
   * the channel type chosen. This method is called when
   * the container page first registers the gadget in the
   * RPC mechanism. Gadgets, in turn, will complete the setup
   * of the channel once they send their first messages.
   */
  function setupFrame(frameId, token) {
    if (setup[frameId]) {
      return;
    }

    if (relayChannel === 'fe') {
      try {
        var frame = document.getElementById(frameId);
        frame[FE_G2C_CHANNEL] = function(args) {
          process(gadgets.json.parse(args));
        };
      } catch (e) {
        // Something went wrong. System will fallback to
        // IFPC.
      }
    }

    if (relayChannel === 'nix') {
      try {
        var frame = document.getElementById(frameId);
        var wrapper = window[NIX_GET_WRAPPER](frameId, token);
        frame.contentWindow.opener = wrapper;
      } catch (e) {
        // Something went wrong. System will fallback to
        // IFPC.
        //alert('setupFrame Error!:'+e.message);

      }
    }

    setup[frameId] = true;
  }

  /**
   * Encodes arguments for the legacy IFPC wire format.
   *
   * @param {Object} args
   * @return {String} the encoded args
   */
  function encodeLegacyData(args) {
    var stringify = gadgets.json.stringify;
    var argsEscaped = [];
    for(var i = 0, j = args.length; i < j; ++i) {
      argsEscaped.push(encodeURIComponent(stringify(args[i])));
    }
    return argsEscaped.join('&');
  }

  /**
   * Helper function to process an RPC request
   * @param {Object} rpc RPC request object
   * @private
   */
    function process(rpc) {
    //
    // RPC object contents:
    //   s: Service Name
    //   f: From
    //   c: The callback ID or 0 if none.
    //   a: The arguments for this RPC call.
    //   t: The authentication token.
    //
    if (rpc && typeof rpc.s === 'string' && typeof rpc.f === 'string' &&
        rpc.a instanceof Array) {

      //ensure id is compatible
      rpc.f = getId(rpc.f);

      // Validate auth token.
      if (authToken[rpc.f]) {
        // We allow type coercion here because all the url params are strings.
        if (authToken[rpc.f] != rpc.t) {
          throw new Error("Invalid auth token.");
        }
      }

      // If there is a callback for this service, attach a callback function
      // to the rpc context object for asynchronous rpc services.
      //
      // Synchronous rpc request handlers should simply ignore it and return a
      // value as usual.
      // Asynchronous rpc request handlers, on the other hand, should pass its
      // result to this callback function and not return a value on exit.
      //
      // For example, the following rpc handler passes the first parameter back
      // to its rpc client with a one-second delay.
      //
      // function asyncRpcHandler(param) {
      //   var me = this;
      //   setTimeout(function() {
      //     me.callback(param);
      //   }, 1000);
      // }
      if (rpc.c) {
        rpc.callback = function(result) {
          gadgets.rpc.call(rpc.f, CALLBACK_NAME, null, rpc.c, result);
        };
      }

      // Call the requested RPC service.
      var result = (services[rpc.s] ||
                    services[DEFAULT_NAME]).apply(rpc, rpc.a);

      // If the rpc request handler returns a value, immediately pass it back
      // to the callback. Otherwise, do nothing, assuming that the rpc handler
      // will make an asynchronous call later.
      if (rpc.c && typeof result != 'undefined') {
        gadgets.rpc.call(rpc.f, CALLBACK_NAME, null, rpc.c, result);
      }
    }
  }

  /**
   * Attempts to conduct an RPC call to the specified
   * target with the specified data via the NIX
   * method. If this method fails, the system attempts again
   * using the known default of IFPC.
   *
   * @param {String} targetId Module Id of the RPC service provider.
   * @param {String} serviceName Name of the service to call.
   * @param {String} from Module Id of the calling provider.
   * @param {Object} rpcData The RPC data for this call.
   */
  function callNix(targetId, serviceName, from, rpcData) {
    try {
//       alert('try nix targetId='+targetId);
//       alert('try nix from='+from);
      if (from != '..') {
//        alert('try nix1');
        // Call from gadget to the container.
        var handler = nix_channels['..'];

//        alert('Nix handler='+handler);
        //alert('GetAuthToken'+("GetAuthToken" in window.opener));
//        alert('window.opener='+window.opener);

        // If the gadget has yet to retrieve a reference to
        // the NIX handler, try to do so now. We don't do a
        // typeof(window.opener.GetAuthToken) check here
        // because it means accessing that field on the COM object, which,
        // being an internal function reference, is not allowed.
        // "in" works because it merely checks for the prescence of
        // the key, rather than actually accessing the object's property.
        // This is just a sanity check, not a validity check.
        if (!handler && window.opener && "GetAuthToken" in window.opener) {
//          alert('try nix - handler');
          handler = window.opener;

          // Create the channel to the parent/container.
          // First verify that it knows our auth token to ensure it's not
          // an impostor.
          if (handler.GetAuthToken() == authToken['..']) {
            // Auth match - pass it back along with our wrapper to finish.
            // own wrapper and our authentication token for co-verification.
            var token = authToken['..'];
            handler.CreateChannel(window[NIX_GET_WRAPPER]('..', token),
                                  token);
            // Set channel handler
            nix_channels['..'] = handler;
            window.opener = null;
          }
        }

        // If we have a handler, call it.
        if (handler) {
          //alert('sent nix');
          handler.SendMessage(rpcData);
          return;
        }

//        alert('Nix did not send3');
      } else {
        // Call from container to a gadget[targetId].
//        alert('try nix2 - nix_channels[targetId]='+nix_channels[targetId]);

        // If we have a handler, call it.
        if (nix_channels[targetId]) {
//          alert('sent nix');
          nix_channels[targetId].SendMessage(rpcData);
          return;
        }

//        alert('Nix did not send1');
      }

//      alert('Nix did not send2');

    } catch (e) {
//      alert('Nix Failed!:'+e);
    }

//    alert('fallback ifpc');

    // If we have reached this point, something has failed
    // with the NIX method, so we default to using
    // IFPC for this call.
    callIfpc(targetId, serviceName, from, rpcData);
  }

  /**
   * Attempts to conduct an RPC call to the specified
   * target with the specified data via the FrameElement
   * method. If this method fails, the system attempts again
   * using the known default of IFPC.
   *
   * @param {String} targetId Module Id of the RPC service provider.
   * @param {String} serviceName Service name to call.
   * @param {String} from Module Id of the calling provider.
   * @param {Object} rpcData The RPC data for this call.
   * @param {Array.<Object>} callArgs Original arguments to call()
   */
  function callFrameElement(targetId, serviceName, from, rpcData, callArgs) {
    //alert('callFrameElement!');
    try {
      if (from != '..') {
        // Call from gadget to the container.
        var fe = window.frameElement;

        if (typeof fe[FE_G2C_CHANNEL] === 'function') {
          // Complete the setup of the FE channel if need be.
          if (typeof fe[FE_G2C_CHANNEL][FE_C2G_CHANNEL] !== 'function') {
            fe[FE_G2C_CHANNEL][FE_C2G_CHANNEL] = function(args) {
              process(gadgets.json.parse(args));
            };
          }

          // Conduct the RPC call.
          fe[FE_G2C_CHANNEL](rpcData);
          return;
        }
      } else {
        // Call from container to gadget[targetId].
        var frame = document.getElementById(targetId);

        if (typeof frame[FE_G2C_CHANNEL] === 'function' &&
            typeof frame[FE_G2C_CHANNEL][FE_C2G_CHANNEL] === 'function') {

          // Conduct the RPC call.
          frame[FE_G2C_CHANNEL][FE_C2G_CHANNEL](rpcData);
          return;
        }
      }
    } catch (e) {
    }

    // If we have reached this point, something has failed
    // with the FrameElement method, so we default to using
    // IFPC for this call.
    callIfpc(targetId, serviceName, from, rpcData, callArgs);
  }

  /**
   * Conducts an RPC call to the specified
   * target with the specified data via the IFPC
   * method.
   *
   * @param {String} targetId Module Id of the RPC service provider.
   * @param {String} serviceName Service name to call.
   * @param {String} from Module Id of the calling provider.
   * @param {Object} rpcData The RPC data for this call.
   * @param {Array.<Object>} callArgs Original arguments to call()
   */
  function callIfpc(targetId, serviceName, from, rpcData, callArgs) {
    //alert("CONTAINER IFPC params: " + targetId + " " + serviceName + " " + from + " " + rpcData + " " + callArgs);
    // Retrieve the relay file used by IFPC. Note that
    // this must be set before the call, and so we conduct
    // an extra check to ensure it is not blank.
    var relay = gadgets.rpc.getRelayUrl(targetId);

    if (!relay) {
      throw new Error('No relay file assigned for IFPC');
    }

    // The RPC mechanism supports two formats for IFPC (legacy and current).
    var src = null,
        queueOut = [];
    if (useLegacyProtocol[targetId]) {
      // Format: #iframe_id&callId&num_packets&packet_num&block_of_data
      src = [relay, '#', encodeLegacyData([from, callId, 1, 0,
             encodeLegacyData([from, serviceName, '', '', from].concat(
               callArgs))])].join('');
      queueOut.push(src);
    } else {

      // Format: #targetId & sourceId@callId & packetNum & packetId & packetData
      src = [relay, '#', encodeURIComponent(targetId), '&', from, '@', callId, '&'].join('');
      if (!useMultiPartMessages[targetId]) {
        // Format: #targetId & sourceId@callId & packetNum & packetId & packetData
        queueOut.push([src, 1, '&', 0, '&', , encodeURIComponent(rpcData)].join(''));

      }
      else {
        var message = encodeURIComponent(rpcData),
            payloadLength = URL_LIMIT - src.length,
            numPackets = Math.ceil(message.length / payloadLength),
            packetIdx = 0,
            part;
        while (message.length > 0) {
          part = message.substring(0, payloadLength);
          message = message.substring(payloadLength);
          queueOut.push([src, numPackets, '&', packetIdx, '&', part].join(''));
          packetIdx += 1;
        }

      }

    }

    // Conduct the IFPC call by creating the Iframe with
    // the relay URL and appended message.
    do {
      emitInvisibleIframe(queueOut.shift(),targetId);
    } while (queueOut.length > 0);
    return true;


  }

  //IE only: return true if a target iframe id is in a child popup window
  function isInPopup(targetId) {
    if (!targetId) {
      return false;
    }
    if (targetId == "..") {
      return false;
    }
    var frame = document.getElementById(targetId);
    if (frame) {
      return false;
    }
    if (typeof _childWindows === 'undefined') {
      return false;
    }
    return true;
  }

  //IE only: Queue of messages for child windows
  window._childWindowMessageQueue = [];
  //IE only: Unique increasing ID for all messages put on the child window queue
  window._childWindowMessageId = 0;
  //IE only: Allow a child window to retrieve a message from the queue
  window._getChildWindowMessage = function(msgId) {
    var q = _childWindowMessageQueue;
    for(var ii=0; ii < q.length; ii++) {
      var m = q[ii];
      if (m.id == msgId) {
        return m;
      }
    }
  }

  function isMessageComplete(arr, total) {
    for (var i = total - 1; i >= 0; --i) {
      if (typeof arr[i] === 'undefined') {
        return false;
      }
    }
    return true;
  }

  /**
   * Helper function to emit an invisible IFrame.
   * @param {String} src SRC attribute of the IFrame to emit.
   * @private
   */
  function emitInvisibleIframe(src, targetId) {
    if (isInPopup(targetId)) {
        //IE only:
        //Queue the message for our child iframes, which will poll for them.
        //We do this because in IE a parent window does not have access to the
        //document of child popup windows, and hence cannot emit an iframe
        //within them
        var id = window._childWindowMessageId;
        id++;
        window._childWindowMessageQueue.push({id:id, target:targetId, src:src});
        window._childWindowMessageId++;
        if(window._childWindowMessageQueue.length > 20) {
          window._childWindowMessageQueue.shift();
        }
        return;
    }
    var iframe;
    // Recycle IFrames
    for (var i = iframePool.length - 1; i >=0; --i) {
      var ifr = iframePool[i];
      try {
        if (ifr && (ifr.recyclable || ifr.readyState === 'complete')) {
          ifr.parentNode.removeChild(ifr);
          if (window.ActiveXObject) {
            // For MSIE, delete any iframes that are no longer being used. MSIE
            // cannot reuse the IFRAME because a navigational click sound will
            // be triggered when we set the SRC attribute.
            // Other browsers scan the pool for a free iframe to reuse.
            iframePool[i] = ifr = null;
            iframePool.splice(i, 1);
          } else {
            ifr.recyclable = false;
            iframe = ifr;
            break;
          }
        }
      } catch (e) {
        // Ignore; IE7 throws an exception when trying to read readyState and
        // readyState isn't set.
      }
    }
    // Create IFrame if necessary
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.style.border = iframe.style.width = iframe.style.height = '0px';
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.onload = function() { this.recyclable = true; };
      iframePool.push(iframe);
    }
    iframe.src = src;
    setTimeout(function() { document.body.appendChild(iframe); }, 0);
  }

    //Find a target IFrame or window based off an RPC ID, allowing for
    //the fact that child popup windows with IFrames might exist.
    function getTargetWin(id) {
      if (typeof id === "undefined" || id === "..") {
          // Chrome 30 throws SecurityError when accessing opener property on window.parent
          try {
            //Check to see if we are an iframe in a child window, and if so use the opener
            if(sameDomain[id] !== false && window.parent.opener) {
                return window.parent.opener.parent;
            }
          }
          catch(e) {}
          //Normal case, we are an IFrame in a page
          return window.parent;
      }

      //At this point we are a container looking for a child iframe

      // Cast to a String to avoid an index lookup.
      id = String(id);

      var target = null;

      // Try window.frames first
      //apparently in FF using window.frames will return a bogus window object if the
      //iframe was removed and re-added to the document so it's always better to just do
      //a dom lookup
//      target = window.frames[id];
//      if (target) {
//          return target;
//      }

      // Fall back to getElementById()
      target = document.getElementById(id);
      if (target && target.contentWindow) {
        return target.contentWindow;
      }

      // At this point we have missed on searching for child iframes
      // in the main browser window, so search popup windows
      // This assumes the container is keeping a list of child
      // windows in the global _childWindows array
      if (typeof _childWindows !== 'undefined') {
          for(var ii=0; ii<_childWindows.length;ii++) {
              var childWindow = _childWindows[ii];
              try {
                  //In IE 8, this will throw an exception.
                  if (childWindow.document) {
                      target = childWindow.document.getElementById(id);
                  }
              } catch(e) {
                  //BUG. Don't know how to support
                  //direct WMP calls from parent to child popups
                  //in IE 8.
              }
              if (target && target.contentWindow) {
                return target.contentWindow;
              }
          }
      }
      return null;
    }


  /**
   * Attempts to make an rpc by calling the target's receive method directly.
   * This works when gadgets are rendered on the same domain as their container,
   * a potentially useful optimization for trusted content which keeps
   * RPC behind a consistent interface.
   * @param {String} target Module id of the rpc service provider
   * @param {String} from Module id of the caller (this)
   * @param {String} callbackId Id of the call
   * @param {String} rpcData JSON-encoded RPC payload
   * @return
   */
  function callSameDomain(target, rpc) {
    var fn;

    if (sameDomain[target] !== false) {
      // Seed with a negative, typed value to avoid
      // hitting this code path repeatedly
      var targetEl = getTargetWin(target);

      try {
        // If this succeeds, then same-domain policy applied
//        sameDomain[target] = targetEl.gadgets.rpc.receiveSameDomain;
        fn = targetEl.gadgets.rpc.receiveSameDomain;
      } catch (e) {
        // Usual case: different domains
      }
    }

    if (typeof fn === 'function') {
      // Call target's receive method
      fn(rpc);
      sameDomain[target] = true;
      return true;
    }
    else
        sameDomain[target] = false;

    return false;
  }

  // gadgets.config might not be available, such as when serving container js.
  if (gadgets.config) {
    /**
     * Initializes RPC from the provided configuration.
     */
    function init(config) {
	  //alert("CONTAINER Config: " + config);
      // Allow for wild card parent relay files as long as it's from a
      // white listed domain. This is enforced by the rendering servlet.
      if (config.rpc.parentRelayUrl.substring(0, 7) === 'http://') {
        relayUrl['..'] = config.rpc.parentRelayUrl;
      } else {
        // It's a relative path, and we must append to the parent.
        // We're relying on the server validating the parent parameter in this
        // case. Because of this, parent may only be passed in the query, not
        // the fragment.
        var params = document.location.search.substring(0).split("&");
		//alert("Init Config method - Setting Params: " + params);
        var parentParam = "";
        for (var i = 0, param; param = params[i]; ++i) {
          // Only the first parent can be validated.
          if (param.indexOf("parent=") === 0) {
            parentParam = decodeURIComponent(param.substring(7));
            break;
          }
        }
        relayUrl['..'] = parentParam + config.rpc.parentRelayUrl;
      }
      useLegacyProtocol['..'] = !!config.rpc.useLegacyProtocol;
    }

    var requiredConfig = {
      parentRelayUrl : gadgets.config.NonEmptyStringValidator
    };
    gadgets.config.register("rpc", requiredConfig, init);
  }

  return /** @scope gadgets.rpc */ {
    /**
     * Registers an RPC service.
     * @param {String} serviceName Service name to register.
     * @param {Function} handler Service handler.
     *
     * @member gadgets.rpc
     */
    register: function(serviceName, handler) {
	//alert("CONTAINER REGISTER VARIABLES: " + serviceName + " -|- " + handler);
      if (serviceName == CALLBACK_NAME) {
        throw new Error("Cannot overwrite callback service");
      }

      if (serviceName == DEFAULT_NAME) {
        throw new Error("Cannot overwrite default service:"
                        + " use registerDefault");
      }
	  services[serviceName] = handler;
    },

    /**
     * Unregisters an RPC service.
     * @param {String} serviceName Service name to unregister.
     *
     * @member gadgets.rpc
     */
    unregister: function(serviceName) {
      if (serviceName == CALLBACK_NAME) {
        throw new Error("Cannot delete callback service");
      }

      if (serviceName == DEFAULT_NAME) {
        throw new Error("Cannot delete default service:"
                        + " use unregisterDefault");
      }

      delete services[serviceName];
    },

    /**
     * Registers a default service handler to processes all unknown
     * RPC calls which raise an exception by default.
     * @param {Function} handler Service handler.
     *
     * @member gadgets.rpc
     */
    registerDefault: function(handler) {
      services[''] = handler;
    },

    /**
     * Unregisters the default service handler. Future unknown RPC
     * calls will fail silently.
     *
     * @member gadgets.rpc
     */
    unregisterDefault: function() {
      delete services[''];
    },

    /**
     * Calls an RPC service.
     * @param {String} targetId Module Id of the RPC service provider.
     *                          Empty if calling the parent container.
     * @param {String} serviceName Service name to call.
     * @param {Function|null} callback Callback function (if any) to process
     *                                 the return value of the RPC request.
     * @param {*} var_args Parameters for the RPC request.
     *
     * @member gadgets.rpc
     */
    call: function(targetId, serviceName, callback, var_args) {
      ++callId;
	  targetId = getId(targetId) || '..';
      if (callback) {
        callbacks[callId] = callback;
      }

      // Default to the container calling.
      var from = '..';

      if (targetId === '..') {
//        from = window.name;
        from = getId(window.name);
      }

      // Not used by legacy, create it anyway...
      var rpc = {
        s: serviceName,
        f: from,
        c: callback ? callId : 0,
        a: Array.prototype.slice.call(arguments, 3),
        t: authToken[targetId]
      };

      // If target is on the same domain, call method directly
      if (callSameDomain(targetId, rpc)) {
        return;
      }

      var rpcData = gadgets.json.stringify(rpc);

      var channelType = relayChannel;

      // If we are told to use the legacy format, then we must
      // default to IFPC.
      if (useLegacyProtocol[targetId]) {
        channelType = 'ifpc';
      }

      //alert('channelType:'+channelType);
      switch (channelType) {
        case 'dpm': // use document.postMessage.
          // Get the window from the document. Fixes a bug with postMessage
          // calls on a target that had been removed then appended to the document object
            var targetWin = getTargetWin(targetId);
            var targetDoc = targetWin.document;

          if (targetDoc != null)
            try {
              targetDoc.postMessage(rpcData);
            } catch (e) {
              callIfpc(targetId, serviceName, from, rpcData, rpc.a);
            }
          break;

        case 'wpm': // use window.postMessage.
          // Get the window from the document. Fixes a bug with postMessage
          // calls on a target that had been removed then appended to the document object
            var targetWin = getTargetWin(targetId);

          if (targetWin != null) {
            try {
              targetWin.postMessage(rpcData, relayUrl[targetId]);
            } catch (e) {
              callIfpc(targetId, serviceName, from, rpcData, rpc.a);
            }
          }
          break;

        case 'nix': // use NIX.
          //alert('callNix!');
          callNix(targetId, serviceName, from, rpcData);
          break;

        case 'fe': // use FrameElement.
          callFrameElement(targetId, serviceName, from, rpcData, rpc.a);
          break;

        default: // use 'ifpc' as a fallback mechanism.
          callIfpc(targetId, serviceName, from, rpcData, rpc.a);
          break;
      }
    },

    /**
     * Gets the relay URL of a target frame.
     * @param {String} targetId Name of the target frame.
     * @return {String|undefined} Relay URL of the target frame.
     *
     * @member gadgets.rpc
     */
    getRelayUrl: function(targetId) {
      return relayUrl[targetId];
    },

    /**
     * Sets the relay URL of a target frame.
     * @param {String} targetId Name of the target frame.
     * @param {String} url Full relay URL of the target frame.
     * @param {Boolean} opt_useLegacy True if this relay needs the legacy IFPC
     *     wire format.
     *
     * @member gadgets.rpc
     */
    setRelayUrl: function(targetId, url, opt_useLegacy, useMultiPartMessagesForIFPC) {
      relayUrl[targetId] = url;
      useLegacyProtocol[targetId] = !!opt_useLegacy;
      useMultiPartMessages[targetId] = !!useMultiPartMessagesForIFPC;
    },

    /**
     * Sets the auth token of a target frame.
     * @param {String} targetId Name of the target frame.
     * @param {String} token The authentication token to use for all
     *     calls to or from this target id.
     *
     * @member gadgets.rpc
     */
    setAuthToken: function(targetId, token) {
      authToken[targetId] = token;
      setupFrame(targetId, token);
    },

    /**
     * Gets the RPC relay mechanism.
     * @return {String} RPC relay mechanism. See above for
     *   a list of supported types.
     *
     * @member gadgets.rpc
     */
    getRelayChannel: function() {
      return relayChannel;
    },

    /**
     * Receives and processes an RPC request. (Not to be used directly.)
     * @param {Array.<String>} fragment An RPC request fragment encoded as
     *        an array. The first 4 elements are target id, source id & call id,
     *        total packet number, packet id. The last element stores the actual
     *        JSON-encoded and URI escaped packet data.
     *
     * @member gadgets.rpc
     */
    receive: function(fragment) {
      if (fragment.length > 4) {
//        // TODO parse fragment[1..3] to merge multi-fragment messages
//        process(gadgets.json.parse(
//            decodeURIComponent(fragment[fragment.length - 1])));

        var from = fragment[1],   // in the form of "<from>@<callid>"
            numPackets = parseInt(fragment[2], 10),
            packetIdx = parseInt(fragment[3], 10),
            payload = fragment[fragment.length - 1],
            completed = numPackets === 1;

        // if message is multi-part, store parts in the proper order
        if (numPackets > 1) {
          if (!messagesIn[from]) {
            messagesIn[from] = [];
          }
          messagesIn[from][packetIdx] = payload;
          // check if all parts have been sent
          if (isMessageComplete(messagesIn[from], numPackets)) {
            payload = messagesIn[from].join('');
            delete messagesIn[from];
            completed = true;
          }
        }

        // complete message sent
        if (completed) {
          process(gadgets.json.parse(decodeURIComponent(payload)));
        }
      }
    },

    /**
     * Receives and processes an RPC request sent via the same domain.
     * (Not to be used directly). Converts the inbound rpc object's
     * Array into a local Array to pass the process() Array test.
     * @param {Object} rpc RPC object containing all request params
     */
    receiveSameDomain: function(rpc) {
      // Pass through to local process method but converting to a local Array
      rpc.a = Array.prototype.slice.call(rpc.a);
	  window.setTimeout(function() { process(rpc) }, 0);
    }
  };
}();

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var gadgets = gadgets || {};

/**
 * @fileoverview General purpose utilities that gadgets can use.
 */

/**
 * @static
 * @class Provides general-purpose utility functions.
 * @name gadgets.util
 */

gadgets.util = function() {
  /**
   * Parses URL parameters into an object.
   * @return {Array.&lt;String&gt;} The parameters
   */
  function parseUrlParams() {
    // Get settings from url, 'hash' takes precedence over 'search' component
    // don't use document.location.hash due to browser differences.
    var query;
    var l = document.location.href;
    var queryIdx = l.indexOf("?");
    var hashIdx = l.indexOf("#");
    if (hashIdx === -1) {
      query = l.substr(queryIdx + 1);
    } else {
      // essentially replaces "#" with "&"
      query = [l.substr(queryIdx + 1, hashIdx - queryIdx - 1), "&",
               l.substr(hashIdx + 1)].join("");
    }
    return query.split("&");
  }

  var parameters = null;
  var features = {};
  var onLoadHandlers = [];

  // Maps code points to the value to replace them with.
  // If the value is "false", the character is removed entirely, otherwise
  // it will be replaced with an html entity.
  var escapeCodePoints = {
   // nul; most browsers truncate because they use c strings under the covers.
   0 : false,
   // new line
   10 : true,
   // carriage return
   13 : true,
   // double quote
   34 : true,
   // single quote
   39 : true,
   // less than
   60 : true,
   // greater than
   62 : true,
   // Backslash
   92 : true,
   // line separator
   8232 : true,
   // paragraph separator
   8233 : true
  };

  /**
   * Regular expression callback that returns strings from unicode code points.
   *
   * @param {Array} match Ignored
   * @param {String} value The codepoint value to convert
   * @return {String} The character corresponding to value.
   */
  function unescapeEntity(match, value) {
    return String.fromCharCode(value);
  }

  /**
   * Initializes feature parameters.
   */
  function init(config) {
    features = config["core.util"] || {};
  }
  if (gadgets.config) {
    gadgets.config.register("core.util", null, init);
  }

  return /** @scope gadgets.util */ {

    /**
     * Gets the URL parameters.
     *
     * @return {Object} Parameters passed into the query string
     * @member gadgets.util
     * @private Implementation detail.
     */
    getUrlParameters : function () {
      if (parameters !== null) {
        return parameters;
      }
      parameters = {};
      var pairs = parseUrlParams();
      var unesc = window.decodeURIComponent ? decodeURIComponent : unescape;
      for (var i = 0, j = pairs.length; i < j; ++i) {
        var pos = pairs[i].indexOf('=');
        if (pos === -1) {
          continue;
        }
        var argName = pairs[i].substring(0, pos);
        var value = pairs[i].substring(pos + 1);
        // difference to IG_Prefs, is that args doesn't replace spaces in
        // argname. Unclear on if it should do:
        // argname = argname.replace(/\+/g, " ");
        value = value.replace(/\+/g, " ");
        parameters[argName] = unesc(value);
      }
      return parameters;
    },

    /**
     * Creates a closure that is suitable for passing as a callback.
     * Any number of arguments
     * may be passed to the callback;
     * they will be received in the order they are passed in.
     *
     * @param {Object} scope The execution scope; may be null if there is no
     *     need to associate a specific instance of an object with this
     *     callback
     * @param {Function} callback The callback to invoke when this is run;
     *     any arguments passed in will be passed after your initial arguments
     * @param {Object} var_args Initial arguments to be passed to the callback
     *
     * @member gadgets.util
     * @private Implementation detail.
     */
    makeClosure : function (scope, callback, var_args) {
      // arguments isn't a real array, so we copy it into one.
      var baseArgs = [];
      for (var i = 2, j = arguments.length; i < j; ++i) {
       baseArgs.push(arguments[i]);
      }
      return function() {
        // append new arguments.
        var tmpArgs = baseArgs.slice();
        for (var i = 0, j = arguments.length; i < j; ++i) {
          tmpArgs.push(arguments[i]);
        }
        return callback.apply(scope, tmpArgs);
      };
    },

    /**
     * Utility function for generating an "enum" from an array.
     *
     * @param {Array.<String>} values The values to generate.
     * @return {Map&lt;String,String&gt;} An object with member fields to handle
     *   the enum.
     *
     * @private Implementation detail.
     */
    makeEnum : function (values) {
      var obj = {};
      for (var i = 0, v; v = values[i]; ++i) {
        obj[v] = v;
      }
      return obj;
    },

    /**
     * Gets the feature parameters.
     *
     * @param {String} feature The feature to get parameters for
     * @return {Object} The parameters for the given feature, or null
     *
     * @member gadgets.util
     */
    getFeatureParameters : function (feature) {
      return typeof features[feature] === "undefined"
          ? null : features[feature];
    },

    /**
     * Returns whether the current feature is supported.
     *
     * @param {String} feature The feature to test for
     * @return {Boolean} True if the feature is supported
     *
     * @member gadgets.util
     */
    hasFeature : function (feature) {
      return typeof features[feature] !== "undefined";
    },

    /**
     * Registers an onload handler.
     * @param {Function} callback The handler to run
     *
     * @member gadgets.util
     */
    registerOnLoadHandler : function (callback) {
      onLoadHandlers.push(callback);
    },

    /**
     * Runs all functions registered via registerOnLoadHandler.
     * @private Only to be used by the container, not gadgets.
     */
    runOnLoadHandlers : function () {
      for (var i = 0, j = onLoadHandlers.length; i < j; ++i) {
        onLoadHandlers[i]();
      }
    },

    /**
     * Escapes the input using html entities to make it safer.
     *
     * If the input is a string, uses gadgets.util.escapeString.
     * If it is an array, calls escape on each of the array elements
     * if it is an object, will only escape all the mapped keys and values if
     * the opt_escapeObjects flag is set. This operation involves creating an
     * entirely new object so only set the flag when the input is a simple
     * string to string map.
     * Otherwise, does not attempt to modify the input.
     *
     * @param {Object} input The object to escape
     * @param {Boolean} opt_escapeObjects Whether to escape objects.
     * @return {Object} The escaped object
     * @private Only to be used by the container, not gadgets.
     */
    escape : function(input, opt_escapeObjects) {
      if (!input) {
        return input;
      } else if (typeof input === "string") {
        return gadgets.util.escapeString(input);
      } else if (typeof input === "array") {
        for (var i = 0, j = input.length; i < j; ++i) {
          input[i] = gadgets.util.escape(input[i]);
        }
      } else if (typeof input === "object" && opt_escapeObjects) {
        var newObject = {};
        for (var field in input) if (input.hasOwnProperty(field)) {
          newObject[gadgets.util.escapeString(field)]
              = gadgets.util.escape(input[field], true);
        }
        return newObject;
      }
      return input;
    },

    /**
     * Escapes the input using html entities to make it safer.
     *
     * Currently not in the spec -- future proposals may change
     * how this is handled.
     *
     * TODO: Parsing the string would probably be more accurate and faster than
     * a bunch of regular expressions.
     *
     * @param {String} str The string to escape
     * @return {String} The escaped string
     */
    escapeString : function(str) {
      var out = [], ch, shouldEscape;
      for (var i = 0, j = str.length; i < j; ++i) {
        ch = str.charCodeAt(i);
        shouldEscape = escapeCodePoints[ch];
        if (shouldEscape === true) {
          out.push("&#", ch, ";");
        } else if (shouldEscape !== false) {
          // undefined or null are OK.
          out.push(str.charAt(i));
        }
      }
      return out.join("");
    },

    /**
     * Reverses escapeString
     *
     * @param {String} str The string to unescape.
     */
    unescapeString : function(str) {
      return str.replace(/&#([0-9]+);/g, unescapeEntity);
    }
  };
}();
// Initialize url parameters so that hash data is pulled in before it can be
// altered by a click.
gadgets.util.getUrlParameters();


/** @namespace */
var ozpIwc=ozpIwc || {};

/**
 * @class ozpIwc.PostMessageParticipant
 * @extends ozpIwc.Participant
 * @param {object} config
 * @param {string} config.origin
 * @param {object} config.sourceWindow
 * @param {object} config.credentials
 */
ozpIwc.PostMessageParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(config) {
	ozpIwc.Participant.apply(this,arguments);
	this.origin=this.name=config.origin;
	this.sourceWindow=config.sourceWindow;
	this.credentials=config.credentials;
	this.participantType="postMessageProxy";
	this.securitySubject.push("origin:"+this.origin);
});

/**
 * Receives a packet on behalf of this participant and forwards it via PostMessage.
 * @param {ozpIwc.TransportPacketContext} packetContext 
 */
ozpIwc.PostMessageParticipant.prototype.receiveFromRouter=function(packetContext) {
	this.sendToRecipient(packetContext.packet);
	return true;
};

/**
 * Sends a message to the other end of our connection.  Wraps any string mangling
 * necessary by the postMessage implementation of the browser.
 * @param {ozpIwc.TransportPacket} packet
 * @todo Only IE requires the packet to be stringified before sending, should use feature detection?
 * @returns {undefined}
 */
ozpIwc.PostMessageParticipant.prototype.sendToRecipient=function(packet) {
	this.sourceWindow.postMessage(JSON.stringify(packet),this.origin);
};

/**
 * The participant hijacks anything addressed to "$transport" and serves it
 * directly.  This isolates basic connection checking from the router, itself.
 * @param {object} packet
 * @returns {undefined}
 */
ozpIwc.PostMessageParticipant.prototype.handleTransportPacket=function(packet) {
	var reply={
		'ver': 1,
		'dst': this.address,
		'src': '$transport',
		'replyTo': packet.msgId,
		'msgId': this.generateMsgId(),
		'entity': {
			"address": this.address
		}
	};
	this.sendToRecipient(reply);
};


/**
 * 
 * @todo track the last used timestamp and make sure we don't send a duplicate messageId
 * @param {ozpIwc.TransportPacket} packet
 * @param {type} event
 * @returns {undefined}
 */
ozpIwc.PostMessageParticipant.prototype.forwardFromPostMessage=function(packet,event) {
	if(typeof(packet) !== "object") {
		ozpIwc.log.error("Unknown packet received: " + JSON.stringify(packet));
		return;
	}
	if(event.origin !== this.origin) {
		/** @todo participant changing origins should set off more alarms, probably */
		ozpIwc.metrics.counter("transport."+participant.address+".invalidSenderOrigin").inc();
		return;
	}
	
	packet=this.fixPacket(packet);
	
	// if it's addressed to $transport, hijack it
	if(packet.dst === "$transport") {
		this.handleTransportPacket(packet);
	} else {
		this.router.send(packet,this);
	}
};


/**
 * @class
 * @param {object} config
 * @param {ozpIwc.Router} config.router
 */
ozpIwc.PostMessageParticipantListener=function(config) {
	config = config || {};
	this.participants=[];
	this.router=config.router || ozpIwc.defaultRouter;
	
	var self=this;
	
	window.addEventListener("message", function(event) {
		self.receiveFromPostMessage(event);
	}, false);	
};

/**
 * Finds the participant associated with the given window.  Unfortunately, this is an
 * o(n) algorithm, since there doesn't seem to be any way to hash, order, or any other way to
 * compare windows other than equality.
 * @param {object} sourceWindow - the participant window handle from message's event.source 
 */
ozpIwc.PostMessageParticipantListener.prototype.findParticipant=function(sourceWindow) {
	for(var i=0; i< this.participants.length; ++i) {
		if(this.participants[i].sourceWindow === sourceWindow) {
			return this.participants[i];
		}
	};
};

/**
 * Process a post message that is received from a peer
 * @param {object} event - The event received from the "message" event handler
 * @param {string} event.origin
 * @param {object} event.source
 * @param {ozpIwc.TransportPacket} event.data
 */
ozpIwc.PostMessageParticipantListener.prototype.receiveFromPostMessage=function(event) {
	var participant=this.findParticipant(event.source);
	var packet=event.data;

	if(typeof(event.data)==="string") {
		packet=JSON.parse(event.data);
	}
	
	// if this is a window who hasn't talked to us before, sign them up
	if(!participant) {
		participant=new ozpIwc.PostMessageParticipant({
			'origin': event.origin,
			'sourceWindow': event.source,
			'credentials': packet.entity
		});
		this.router.registerParticipant(participant,packet);
		this.participants.push(participant);
	}
	
	participant.forwardFromPostMessage(packet,event);
};


var ozpIwc=ozpIwc || {};


/**
 * @typedef {object} ozpIwc.KeyValuePair
 * @property {object} data
 * @property {string} contentType
 * @property {object} permissions
 * @property {object} watchers
 */

/**
 * @class
 */
ozpIwc.KeyValueApiBase = function(config) {
	config = config || {};
	this.storage=config.storage || {
		load: function() { },
		save: function() { }		
	};
	this.kvStore=new ozpIwc.KeyValueStore({
		defaultData: function() { 
			return { 
				data: undefined,
				contentType:"application/json",
				permissions:[],
				watchers:[],
				children: [],
				version: 1
			};
		}
	});
	this.storage.load(this.kvStore);
};

/** 
 * Turn an event into a list of change packets to be sent to the watchers.
 * @todo if we implement multi-dst packets, only return the one. 
 * @param {object} evt
 * @param {string} evt.path - The path of the changed node.
 * @param {ozpIwc.KeyValuePair} evt.node - The node being changed.
 * @param {object} evt.oldData - Value of the node prior to being changed.
 * @param {object} evt.newData - Current value of the node.
	}
 */
ozpIwc.KeyValueApiBase.prototype.triggerChange=function(evt) {
	return evt.node.watchers.map(function(watcher) {
		var reply={
			'dst'   : watcher.src,
		  'replyTo' : watcher.msgId,
			'action': 'changed',
			'resource': evt.path,
			'entity': {	}
		};
		if(evt.newData || evt.oldData) {
			reply.entity.newValue=evt.newData;
			reply.entity.oldValue=evt.oldData;
		}
		if(evt.addChild) {
			reply.entity.addChild=evt.addChild;
		}
		if(evt.removeChild) {
			reply.entity.removeChild=evt.removeChild;
		}
		return reply;
	});
};


/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApiBase.prototype.handleGetAsLeader=function(packetContext) {
	return [{
		'action': 'success',
		'entity': this.kvStore.get(packetContext.packet.resource).data
	}];
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApiBase.prototype.handleSetAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	var oldData=node.data;
	node.data=packet.entity;
	this.kvStore.set(packet.resource,node);
	
	var responses=this.triggerChange({
		'path':packet.resource,
		'node': node,
		'oldData' : oldData,
		'newData' : node.data
	});
	
	responses.unshift({'action': 'success'});
	return responses;
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApiBase.prototype.handleDeleteAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	this.kvStore.delete(packet.resource);
	
	var responses=this.triggerChange({
		'path': packet.resource,
		'node': node,
		'oldData' : node.data,
		'newData' : undefined
	});
	
	responses.unshift({'action': 'success'});
	
	return responses;
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApiBase.prototype.handleWatchAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	
	node.watchers.push({
		src: packet.src,
		msgId: packet.msgId
	});
		
	this.kvStore.set(packet.resource,node);
	return [{
		'action': 'success',
		'entity': {}
	}];
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApiBase.prototype.handleUnwatchAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	node.watchers=node.watchers.filter(function(w) {
		return packet.replyTo !== w.msgId && packet.src !==w.src;
	});
	
	this.kvStore.set(packet.resource,node);
	
	return [{
		'action': 'success',
		'entity': {}
	}];
};

ozpIwc.KeyValueApiBase.prototype.handleListAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	if(packet.resource) {
		var node=this.kvStore.get(packet.resource);
		return [{'action': 'success','entity': node.children}];
	} else {
		return [{'action': 'success','entity': this.kvStore.keys()}];
	}
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApiBase.prototype.handlePushAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);

	var key;
	do {
		key=packet.resource +"/"+ ozpIwc.util.generateId();
	} while(this.kvStore.hasKey(key));

	// save the new child
	var childNode=this.kvStore.get(key);
	childNode.data=packet.entity;
	this.kvStore.set(key,childNode);
	
	// save a copy of the old data
	node.children.push(key);
	this.kvStore.set(packet.resource,node);	
	
	var responses=this.triggerChange({
		'path': packet.resource,
		'node': node,
		'addChild' : key
	});
	responses.unshift({'action': 'success','entity': {'resource':key}});
	return responses;
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApiBase.prototype.handleUnshiftAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);

	var key;
	do {
		key=packet.resource +"/"+ ozpIwc.util.generateId();
	} while(this.kvStore.hasKey(key));

	// save the new child
	var childNode=this.kvStore.get(key);
	childNode.data=packet.entity;
	this.kvStore.set(key,childNode);
	
	// save a copy of the old data
	node.children.unshift(key);
	this.kvStore.set(packet.resource,node);	
	
	var responses=this.triggerChange({
		'path': packet.resource,
		'node': node,
		'addChild' : key
	});
	responses.unshift({'action': 'success','entity': {'resource':key}});
	return responses;
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApiBase.prototype.handlePopAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	
	if(!node.children.length) {
		return [{action:'noChild'}];
	}
	var key=node.children.pop();
	
	this.kvStore.set(packet.resource,node);
	// save the new child
	var childNode=this.kvStore.get(key);
	
	var responses=this.triggerChange({
		'path': packet.resource,
		'node': node,
		'removeChild' : key
	});
	responses.unshift({action: 'success',entity: childNode.data});
	return responses;
};

/**
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.KeyValueApiBase.prototype.handleShiftAsLeader=function(packetContext) {
	var packet=packetContext.packet;
	var node=this.kvStore.get(packet.resource);
	
	if(!node.children.length) {
		return [{action:'noChild'}];
	}
	var key=node.children.shift();
	
	this.kvStore.set(packet.resource,node);
	// save the new child
	var childNode=this.kvStore.get(key);
	var responses=this.triggerChange({
		'path': packet.resource,
		'node': node,
		'removeChild' : key
	});
	responses.unshift({action: 'success',entity: childNode.data});
	return responses;
};


var ozpIwc=ozpIwc || {};

ozpIwc.IntentsApi = ozpIwc.util.extend(ozpIwc.KeyValueApiBase,function() {
	ozpIwc.KeyValueApiBase.apply(this,arguments);
});

var ozpIwc=ozpIwc || {};

ozpIwc.KeyValueApi = ozpIwc.util.extend(ozpIwc.KeyValueApiBase,function() {
	ozpIwc.KeyValueApiBase.apply(this,arguments);
});

var ozpIwc=ozpIwc || {};

ozpIwc.NamesApi = ozpIwc.util.extend(ozpIwc.KeyValueApiBase,function() {
	ozpIwc.KeyValueApiBase.apply(this,arguments);
});
