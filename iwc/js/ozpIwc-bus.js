/** @namespace */
var ozpIwc=ozpIwc || {};

/**
 * Common classes used between both the Client and the Bus.
 * @module common
 */

/**
 * An Event emmitter/receiver class.
 * @class Event
 * @namespace ozpIwc
 */
ozpIwc.Event=function() {
    /**
     * A key value store of events.
     * @property events
     * @type Object
     * @default {}
     */
	this.events={};
};

/**
 * Registers a handler for the the event.
 *
 * @method on
 * @param {String} event The name of the event to trigger on.
 * @param {Function} callback Function to be invoked.
 * @param {Object} [self] Used as the this pointer when callback is invoked.
 *
 * @returns {Object} A handle that can be used to unregister the callback via
 * {{#crossLink "ozpIwc.Event/off:method"}}{{/crossLink}}
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
 *
 * @method off
 * @param {String} event
 * @param {Function} callback
 */
ozpIwc.Event.prototype.off=function(event,callback) {
	this.events[event]=(this.events[event]||[]).filter( function(h) {
		return h!==callback && h.ozpIwcDelegateFor !== callback;
	});
};

/**
 * Fires an event that will be received by all handlers.
 *
 * @method
 * @param {String} eventName Name of the event.
 * @param {Object} event Event object to pass to the handers.
 *
 * @returns {Object} The event after all handlers have processed it.
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
 * Adds an {{#crossLink "ozpIwc.Event/off:method"}}on(){{/crossLink}} and
 * {{#crossLink "ozpIwc.Event/off:method"}}off(){{/crossLink}} function to the target that delegate to this object.
 *
 * @method mixinOnOff
 * @param {Object} target Target to receive the on/off functions
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
 *
 * @class CancelableEvent
 * @namespace ozpIwc
 * @param {Object} data Data that will be copied into the event
 */
ozpIwc.CancelableEvent=function(data) {
	data = data || {};
	for(var k in data) {
		this[k]=data[k];
	}
	this.canceled=false;
	this.cancelReason=null;
};

/**
 * Marks the event as canceled.
 * @method cancel
 * @param {String} reason A text description of why the event was canceled.
 *
 * @returns {ozpIwc.CancelableEvent} Reference to self
 */
ozpIwc.CancelableEvent.prototype.cancel=function(reason) {
	reason= reason || "Unknown";
	this.canceled=true;
	this.cancelReason=reason;
	return this;
};

/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2014 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

//Add semicolon to prevent IIFE from being passed as argument to concated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {

var call = Function.prototype.call;
var prototypeOfObject = Object.prototype;
var owns = call.bind(prototypeOfObject.hasOwnProperty);

// If JS engine supports accessors creating shortcuts.
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors = owns(prototypeOfObject, "__defineGetter__");
if (supportsAccessors) {
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
}

// ES5 15.2.3.2
// http://es5.github.com/#x15.2.3.2
if (!Object.getPrototypeOf) {
    // https://github.com/es-shims/es5-shim/issues#issue/2
    // http://ejohn.org/blog/objectgetprototypeof/
    // recommended by fschaefer on github
    //
    // sure, and webreflection says ^_^
    // ... this will nerever possibly return null
    // ... Opera Mini breaks here with infinite loops
    Object.getPrototypeOf = function getPrototypeOf(object) {
        var proto = object.__proto__;
        if (proto || proto === null) {
            return proto;
        } else if (object.constructor) {
            return object.constructor.prototype;
        } else {
            return prototypeOfObject;
        }
    };
}

//ES5 15.2.3.3
//http://es5.github.com/#x15.2.3.3

function doesGetOwnPropertyDescriptorWork(object) {
    try {
        object.sentinel = 0;
        return Object.getOwnPropertyDescriptor(
                object,
                "sentinel"
        ).value === 0;
    } catch (exception) {
        // returns falsy
    }
}

//check whether getOwnPropertyDescriptor works if it's given. Otherwise,
//shim partially.
if (Object.defineProperty) {
    var getOwnPropertyDescriptorWorksOnObject = doesGetOwnPropertyDescriptorWork({});
    var getOwnPropertyDescriptorWorksOnDom = typeof document === "undefined" ||
    doesGetOwnPropertyDescriptorWork(document.createElement("div"));
    if (!getOwnPropertyDescriptorWorksOnDom || !getOwnPropertyDescriptorWorksOnObject) {
        var getOwnPropertyDescriptorFallback = Object.getOwnPropertyDescriptor;
    }
}

if (!Object.getOwnPropertyDescriptor || getOwnPropertyDescriptorFallback) {
    var ERR_NON_OBJECT = "Object.getOwnPropertyDescriptor called on a non-object: ";

    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
        if ((typeof object !== "object" && typeof object !== "function") || object === null) {
            throw new TypeError(ERR_NON_OBJECT + object);
        }

        // make a valiant attempt to use the real getOwnPropertyDescriptor
        // for I8's DOM elements.
        if (getOwnPropertyDescriptorFallback) {
            try {
                return getOwnPropertyDescriptorFallback.call(Object, object, property);
            } catch (exception) {
                // try the shim if the real one doesn't work
            }
        }

        // If object does not owns property return undefined immediately.
        if (!owns(object, property)) {
            return;
        }

        // If object has a property then it's for sure both `enumerable` and
        // `configurable`.
        var descriptor =  { enumerable: true, configurable: true };

        // If JS engine supports accessor properties then property may be a
        // getter or setter.
        if (supportsAccessors) {
            // Unfortunately `__lookupGetter__` will return a getter even
            // if object has own non getter property along with a same named
            // inherited getter. To avoid misbehavior we temporary remove
            // `__proto__` so that `__lookupGetter__` will return getter only
            // if it's owned by an object.
            var prototype = object.__proto__;
            var notPrototypeOfObject = object !== prototypeOfObject;
            // avoid recursion problem, breaking in Opera Mini when
            // Object.getOwnPropertyDescriptor(Object.prototype, 'toString')
            // or any other Object.prototype accessor
            if (notPrototypeOfObject) {
                object.__proto__ = prototypeOfObject;
            }

            var getter = lookupGetter(object, property);
            var setter = lookupSetter(object, property);

            if (notPrototypeOfObject) {
                // Once we have getter and setter we can put values back.
                object.__proto__ = prototype;
            }

            if (getter || setter) {
                if (getter) {
                    descriptor.get = getter;
                }
                if (setter) {
                    descriptor.set = setter;
                }
                // If it was accessor property we're done and return here
                // in order to avoid adding `value` to the descriptor.
                return descriptor;
            }
        }

        // If we got this far we know that object has an own property that is
        // not an accessor so we set it as a value and return descriptor.
        descriptor.value = object[property];
        descriptor.writable = true;
        return descriptor;
    };
}

// ES5 15.2.3.4
// http://es5.github.com/#x15.2.3.4
if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
        return Object.keys(object);
    };
}

// ES5 15.2.3.5
// http://es5.github.com/#x15.2.3.5
if (!Object.create) {

    // Contributed by Brandon Benvie, October, 2012
    var createEmpty;
    var supportsProto = !({__proto__:null} instanceof Object);
                        // the following produces false positives
                        // in Opera Mini => not a reliable check
                        // Object.prototype.__proto__ === null
    if (supportsProto || typeof document === 'undefined') {
        createEmpty = function () {
            return { "__proto__": null };
        };
    } else {
        // In old IE __proto__ can't be used to manually set `null`, nor does
        // any other method exist to make an object that inherits from nothing,
        // aside from Object.prototype itself. Instead, create a new global
        // object and *steal* its Object.prototype and strip it bare. This is
        // used as the prototype to create nullary objects.
        createEmpty = function () {
            var iframe = document.createElement('iframe');
            var parent = document.body || document.documentElement;
            iframe.style.display = 'none';
            parent.appendChild(iframe);
            iframe.src = 'javascript:';
            var empty = iframe.contentWindow.Object.prototype;
            parent.removeChild(iframe);
            iframe = null;
            delete empty.constructor;
            delete empty.hasOwnProperty;
            delete empty.propertyIsEnumerable;
            delete empty.isPrototypeOf;
            delete empty.toLocaleString;
            delete empty.toString;
            delete empty.valueOf;
            empty.__proto__ = null;

            function Empty() {}
            Empty.prototype = empty;
            // short-circuit future calls
            createEmpty = function () {
                return new Empty();
            };
            return new Empty();
        };
    }

    Object.create = function create(prototype, properties) {

        var object;
        function Type() {}  // An empty constructor.

        if (prototype === null) {
            object = createEmpty();
        } else {
            if (typeof prototype !== "object" && typeof prototype !== "function") {
                // In the native implementation `parent` can be `null`
                // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
                // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
                // like they are in modern browsers. Using `Object.create` on DOM elements
                // is...err...probably inappropriate, but the native version allows for it.
                throw new TypeError("Object prototype may only be an Object or null"); // same msg as Chrome
            }
            Type.prototype = prototype;
            object = new Type();
            // IE has no built-in implementation of `Object.getPrototypeOf`
            // neither `__proto__`, but this manually setting `__proto__` will
            // guarantee that `Object.getPrototypeOf` will work as expected with
            // objects created using `Object.create`
            object.__proto__ = prototype;
        }

        if (properties !== void 0) {
            Object.defineProperties(object, properties);
        }

        return object;
    };
}

// ES5 15.2.3.6
// http://es5.github.com/#x15.2.3.6

// Patch for WebKit and IE8 standard mode
// Designed by hax <hax.github.com>
// related issue: https://github.com/es-shims/es5-shim/issues#issue/5
// IE8 Reference:
//     http://msdn.microsoft.com/en-us/library/dd282900.aspx
//     http://msdn.microsoft.com/en-us/library/dd229916.aspx
// WebKit Bugs:
//     https://bugs.webkit.org/show_bug.cgi?id=36423

function doesDefinePropertyWork(object) {
    try {
        Object.defineProperty(object, "sentinel", {});
        return "sentinel" in object;
    } catch (exception) {
        // returns falsy
    }
}

// check whether defineProperty works if it's given. Otherwise,
// shim partially.
if (Object.defineProperty) {
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document === "undefined" ||
        doesDefinePropertyWork(document.createElement("div"));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
        var definePropertyFallback = Object.defineProperty,
            definePropertiesFallback = Object.defineProperties;
    }
}

if (!Object.defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = "Property description must be an object: ";
    var ERR_NON_OBJECT_TARGET = "Object.defineProperty called on non-object: "
    var ERR_ACCESSORS_NOT_SUPPORTED = "getters & setters can not be defined " +
                                      "on this javascript engine";

    Object.defineProperty = function defineProperty(object, property, descriptor) {
        if ((typeof object !== "object" && typeof object !== "function") || object === null) {
            throw new TypeError(ERR_NON_OBJECT_TARGET + object);
        }
        if ((typeof descriptor !== "object" && typeof descriptor !== "function") || descriptor === null) {
            throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
        }
        // make a valiant attempt to use the real defineProperty
        // for I8's DOM elements.
        if (definePropertyFallback) {
            try {
                return definePropertyFallback.call(Object, object, property, descriptor);
            } catch (exception) {
                // try the shim if the real one doesn't work
            }
        }

        // If it's a data property.
        if (owns(descriptor, "value")) {
            // fail silently if "writable", "enumerable", or "configurable"
            // are requested but not supported
            /*
            // alternate approach:
            if ( // can't implement these features; allow false but not true
                !(owns(descriptor, "writable") ? descriptor.writable : true) ||
                !(owns(descriptor, "enumerable") ? descriptor.enumerable : true) ||
                !(owns(descriptor, "configurable") ? descriptor.configurable : true)
            )
                throw new RangeError(
                    "This implementation of Object.defineProperty does not " +
                    "support configurable, enumerable, or writable."
                );
            */

            if (supportsAccessors && (lookupGetter(object, property) ||
                                      lookupSetter(object, property)))
            {
                // As accessors are supported only on engines implementing
                // `__proto__` we can safely override `__proto__` while defining
                // a property to make sure that we don't hit an inherited
                // accessor.
                var prototype = object.__proto__;
                object.__proto__ = prototypeOfObject;
                // Deleting a property anyway since getter / setter may be
                // defined on object itself.
                delete object[property];
                object[property] = descriptor.value;
                // Setting original `__proto__` back now.
                object.__proto__ = prototype;
            } else {
                object[property] = descriptor.value;
            }
        } else {
            if (!supportsAccessors) {
                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
            }
            // If we got that far then getters and setters can be defined !!
            if (owns(descriptor, "get")) {
                defineGetter(object, property, descriptor.get);
            }
            if (owns(descriptor, "set")) {
                defineSetter(object, property, descriptor.set);
            }
        }
        return object;
    };
}

// ES5 15.2.3.7
// http://es5.github.com/#x15.2.3.7
if (!Object.defineProperties || definePropertiesFallback) {
    Object.defineProperties = function defineProperties(object, properties) {
        // make a valiant attempt to use the real defineProperties
        if (definePropertiesFallback) {
            try {
                return definePropertiesFallback.call(Object, object, properties);
            } catch (exception) {
                // try the shim if the real one doesn't work
            }
        }

        for (var property in properties) {
            if (owns(properties, property) && property !== "__proto__") {
                Object.defineProperty(object, property, properties[property]);
            }
        }
        return object;
    };
}

// ES5 15.2.3.8
// http://es5.github.com/#x15.2.3.8
if (!Object.seal) {
    Object.seal = function seal(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.9
// http://es5.github.com/#x15.2.3.9
if (!Object.freeze) {
    Object.freeze = function freeze(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// detect a Rhino bug and patch it
try {
    Object.freeze(function () {});
} catch (exception) {
    Object.freeze = (function freeze(freezeObject) {
        return function freeze(object) {
            if (typeof object === "function") {
                return object;
            } else {
                return freezeObject(object);
            }
        };
    })(Object.freeze);
}

// ES5 15.2.3.10
// http://es5.github.com/#x15.2.3.10
if (!Object.preventExtensions) {
    Object.preventExtensions = function preventExtensions(object) {
        // this is misleading and breaks feature-detection, but
        // allows "securable" code to "gracefully" degrade to working
        // but insecure code.
        return object;
    };
}

// ES5 15.2.3.11
// http://es5.github.com/#x15.2.3.11
if (!Object.isSealed) {
    Object.isSealed = function isSealed(object) {
        return false;
    };
}

// ES5 15.2.3.12
// http://es5.github.com/#x15.2.3.12
if (!Object.isFrozen) {
    Object.isFrozen = function isFrozen(object) {
        return false;
    };
}

// ES5 15.2.3.13
// http://es5.github.com/#x15.2.3.13
if (!Object.isExtensible) {
    Object.isExtensible = function isExtensible(object) {
        // 1. If Type(O) is not Object throw a TypeError exception.
        if (Object(object) !== object) {
            throw new TypeError(); // TODO message
        }
        // 2. Return the Boolean value of the [[Extensible]] internal property of O.
        var name = '';
        while (owns(object, name)) {
            name += '?';
        }
        object[name] = true;
        var returnValue = owns(object, name);
        delete object[name];
        return returnValue;
    };
}

}));


/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2014 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

//Add semicolon to prevent IIFE from being passed as argument to concated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * Annotated ES5: http://es5.github.com/ (specific links below)
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
 */

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
var ArrayPrototype = Array.prototype;
var ObjectPrototype = Object.prototype;
var FunctionPrototype = Function.prototype;
var StringPrototype = String.prototype;
var NumberPrototype = Number.prototype;
var array_slice = ArrayPrototype.slice;
var array_splice = ArrayPrototype.splice;
var array_push = ArrayPrototype.push;
var array_unshift = ArrayPrototype.unshift;
var call = FunctionPrototype.call;

// Having a toString local variable name breaks in Opera so use _toString.
var _toString = ObjectPrototype.toString;

var isFunction = function (val) {
    return ObjectPrototype.toString.call(val) === '[object Function]';
};
var isRegex = function (val) {
    return ObjectPrototype.toString.call(val) === '[object RegExp]';
};
var isArray = function isArray(obj) {
    return _toString.call(obj) === "[object Array]";
};
var isString = function isString(obj) {
    return _toString.call(obj) === "[object String]";
};
var isArguments = function isArguments(value) {
    var str = _toString.call(value);
    var isArgs = str === '[object Arguments]';
    if (!isArgs) {
        isArgs = !isArray(value)
            && value !== null
            && typeof value === 'object'
            && typeof value.length === 'number'
            && value.length >= 0
            && isFunction(value.callee);
    }
    return isArgs;
};

var supportsDescriptors = Object.defineProperty && (function () {
    try {
        Object.defineProperty({}, 'x', {});
        return true;
    } catch (e) { /* this is ES3 */
        return false;
    }
}());

// Define configurable, writable and non-enumerable props
// if they don't exist.
var defineProperty;
if (supportsDescriptors) {
    defineProperty = function (object, name, method, forceAssign) {
        if (!forceAssign && (name in object)) { return; }
        Object.defineProperty(object, name, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: method
        });
    };
} else {
    defineProperty = function (object, name, method, forceAssign) {
        if (!forceAssign && (name in object)) { return; }
        object[name] = method;
    };
}
var defineProperties = function (object, map, forceAssign) {
    for (var name in map) {
        if (ObjectPrototype.hasOwnProperty.call(map, name)) {
          defineProperty(object, name, map[name], forceAssign);
        }
    }
};

//
// Util
// ======
//

// ES5 9.4
// http://es5.github.com/#x9.4
// http://jsperf.com/to-integer

function toInteger(n) {
    n = +n;
    if (n !== n) { // isNaN
        n = 0;
    } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
    return n;
}

function isPrimitive(input) {
    var type = typeof input;
    return (
        input === null ||
        type === "undefined" ||
        type === "boolean" ||
        type === "number" ||
        type === "string"
    );
}

function toPrimitive(input) {
    var val, valueOf, toStr;
    if (isPrimitive(input)) {
        return input;
    }
    valueOf = input.valueOf;
    if (isFunction(valueOf)) {
        val = valueOf.call(input);
        if (isPrimitive(val)) {
            return val;
        }
    }
    toStr = input.toString;
    if (isFunction(toStr)) {
        val = toStr.call(input);
        if (isPrimitive(val)) {
            return val;
        }
    }
    throw new TypeError();
}

// ES5 9.9
// http://es5.github.com/#x9.9
var toObject = function (o) {
    if (o == null) { // this matches both null and undefined
        throw new TypeError("can't convert " + o + " to object");
    }
    return Object(o);
};

var ToUint32 = function ToUint32(x) {
    return x >>> 0;
};

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

function Empty() {}

defineProperties(FunctionPrototype, {
    bind: function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (!isFunction(target)) {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = array_slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var binder = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var result = target.apply(
                    this,
                    args.concat(array_slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    args.concat(array_slice.call(arguments))
                );

            }

        };

        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.

        var boundLength = Math.max(0, target.length - args.length);

        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            boundArgs.push("$" + i);
        }

        // XXX Build a dynamic function with desired amount of arguments is the only
        // way to set the length property of a function.
        // In environments where Content Security Policies enabled (Chrome extensions,
        // for ex.) all use of eval or Function costructor throws an exception.
        // However in all of these environments Function.prototype.bind exists
        // and so this code will never be executed.
        var bound = Function("binder", "return function (" + boundArgs.join(",") + "){return binder.apply(this,arguments)}")(binder);

        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            // Clean up dangling references.
            Empty.prototype = null;
        }

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    }
});

// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.
var owns = call.bind(ObjectPrototype.hasOwnProperty);

// If JS engine supports accessors creating shortcuts.
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors;
if ((supportsAccessors = owns(ObjectPrototype, "__defineGetter__"))) {
    defineGetter = call.bind(ObjectPrototype.__defineGetter__);
    defineSetter = call.bind(ObjectPrototype.__defineSetter__);
    lookupGetter = call.bind(ObjectPrototype.__lookupGetter__);
    lookupSetter = call.bind(ObjectPrototype.__lookupSetter__);
}

//
// Array
// =====
//

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.12
var spliceNoopReturnsEmptyArray = (function () {
    var a = [1, 2];
    var result = a.splice();
    return a.length === 2 && isArray(result) && result.length === 0;
}());
defineProperties(ArrayPrototype, {
    // Safari 5.0 bug where .splice() returns undefined
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) {
            return [];
        } else {
            return array_splice.apply(this, arguments);
        }
    }
}, spliceNoopReturnsEmptyArray);

var spliceWorksWithEmptyObject = (function () {
    var obj = {};
    ArrayPrototype.splice.call(obj, 0, 0, 1);
    return obj.length === 1;
}());
defineProperties(ArrayPrototype, {
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) { return []; }
        var args = arguments;
        this.length = Math.max(toInteger(this.length), 0);
        if (arguments.length > 0 && typeof deleteCount !== 'number') {
            args = array_slice.call(arguments);
            if (args.length < 2) {
                args.push(this.length - start);
            } else {
                args[1] = toInteger(deleteCount);
            }
        }
        return array_splice.apply(this, args);
    }
}, !spliceWorksWithEmptyObject);

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.13
// Return len+argCount.
// [bugfix, ielt8]
// IE < 8 bug: [].unshift(0) === undefined but should be "1"
var hasUnshiftReturnValueBug = [].unshift(0) !== 1;
defineProperties(ArrayPrototype, {
    unshift: function () {
        array_unshift.apply(this, arguments);
        return this.length;
    }
}, hasUnshiftReturnValueBug);

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
defineProperties(Array, { isArray: isArray });

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
var boxedString = Object("a");
var splitString = boxedString[0] !== "a" || !(0 in boxedString);

var properlyBoxesContext = function properlyBoxed(method) {
    // Check node 0.6.21 bug where third parameter is not boxed
    var properlyBoxesNonStrict = true;
    var properlyBoxesStrict = true;
    if (method) {
        method.call('foo', function (_, __, context) {
            if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
        });

        method.call([1], function () {
            'use strict';
            properlyBoxesStrict = typeof this === 'string';
        }, 'x');
    }
    return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
};

defineProperties(ArrayPrototype, {
    forEach: function forEach(fun /*, thisp*/) {
        var object = toObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            thisp = arguments[1],
            i = -1,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(); // TODO message
        }

        while (++i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object
                // context
                fun.call(thisp, self[i], i, object);
            }
        }
    }
}, !properlyBoxesContext(ArrayPrototype.forEach));

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
defineProperties(ArrayPrototype, {
    map: function map(fun /*, thisp*/) {
        var object = toObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0,
            result = Array(length),
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                result[i] = fun.call(thisp, self[i], i, object);
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.map));

// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
defineProperties(ArrayPrototype, {
    filter: function filter(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0,
            result = [],
            value,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (fun.call(thisp, value, i, object)) {
                    result.push(value);
                }
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.filter));

// ES5 15.4.4.16
// http://es5.github.com/#x15.4.4.16
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
defineProperties(ArrayPrototype, {
    every: function every(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !fun.call(thisp, self[i], i, object)) {
                return false;
            }
        }
        return true;
    }
}, !properlyBoxesContext(ArrayPrototype.every));

// ES5 15.4.4.17
// http://es5.github.com/#x15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
defineProperties(ArrayPrototype, {
    some: function some(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && fun.call(thisp, self[i], i, object)) {
                return true;
            }
        }
        return false;
    }
}, !properlyBoxesContext(ArrayPrototype.some));

// ES5 15.4.4.21
// http://es5.github.com/#x15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
var reduceCoercesToObject = false;
if (ArrayPrototype.reduce) {
    reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) { return list; }) === 'object';
}
defineProperties(ArrayPrototype, {
    reduce: function reduce(fun /*, initial*/) {
        var object = toObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(fun + " is not a function");
        }

        // no value to return if no initial value and an empty array
        if (!length && arguments.length === 1) {
            throw new TypeError("reduce of empty array with no initial value");
        }

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= length) {
                    throw new TypeError("reduce of empty array with no initial value");
                }
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self) {
                result = fun.call(void 0, result, self[i], i, object);
            }
        }

        return result;
    }
}, !reduceCoercesToObject);

// ES5 15.4.4.22
// http://es5.github.com/#x15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
var reduceRightCoercesToObject = false;
if (ArrayPrototype.reduceRight) {
    reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) { return list; }) === 'object';
}
defineProperties(ArrayPrototype, {
    reduceRight: function reduceRight(fun /*, initial*/) {
        var object = toObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!isFunction(fun)) {
            throw new TypeError(fun + " is not a function");
        }

        // no value to return if no initial value, empty array
        if (!length && arguments.length === 1) {
            throw new TypeError("reduceRight of empty array with no initial value");
        }

        var result, i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0) {
                    throw new TypeError("reduceRight of empty array with no initial value");
                }
            } while (true);
        }

        if (i < 0) {
            return result;
        }

        do {
            if (i in self) {
                result = fun.call(void 0, result, self[i], i, object);
            }
        } while (i--);

        return result;
    }
}, !reduceRightCoercesToObject);

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
defineProperties(ArrayPrototype, {
    indexOf: function indexOf(sought /*, fromIndex */ ) {
        var self = splitString && isString(this) ? this.split('') : toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = toInteger(arguments[1]);
        }

        // handle negative indices
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2IndexOfBug);

// ES5 15.4.4.15
// http://es5.github.com/#x15.4.4.15
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
var hasFirefox2LastIndexOfBug = Array.prototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;
defineProperties(ArrayPrototype, {
    lastIndexOf: function lastIndexOf(sought /*, fromIndex */) {
        var self = splitString && isString(this) ? this.split('') : toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }
        var i = length - 1;
        if (arguments.length > 1) {
            i = Math.min(i, toInteger(arguments[1]));
        }
        // handle negative indices
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && sought === self[i]) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2LastIndexOfBug);

//
// Object
// ======
//

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14

// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
var hasDontEnumBug = !({'toString': null}).propertyIsEnumerable('toString'),
    hasProtoEnumBug = (function () {}).propertyIsEnumerable('prototype'),
    dontEnums = [
        "toString",
        "toLocaleString",
        "valueOf",
        "hasOwnProperty",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "constructor"
    ],
    dontEnumsLength = dontEnums.length;

defineProperties(Object, {
    keys: function keys(object) {
        var isFn = isFunction(object),
            isArgs = isArguments(object),
            isObject = object !== null && typeof object === 'object',
            isStr = isObject && isString(object);

        if (!isObject && !isFn && !isArgs) {
            throw new TypeError("Object.keys called on a non-object");
        }

        var theKeys = [];
        var skipProto = hasProtoEnumBug && isFn;
        if (isStr || isArgs) {
            for (var i = 0; i < object.length; ++i) {
                theKeys.push(String(i));
            }
        } else {
            for (var name in object) {
                if (!(skipProto && name === 'prototype') && owns(object, name)) {
                    theKeys.push(String(name));
                }
            }
        }

        if (hasDontEnumBug) {
            var ctor = object.constructor,
                skipConstructor = ctor && ctor.prototype === object;
            for (var j = 0; j < dontEnumsLength; j++) {
                var dontEnum = dontEnums[j];
                if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
                    theKeys.push(dontEnum);
                }
            }
        }
        return theKeys;
    }
});

var keysWorksWithArguments = Object.keys && (function () {
    // Safari 5.0 bug
    return Object.keys(arguments).length === 2;
}(1, 2));
var originalKeys = Object.keys;
defineProperties(Object, {
    keys: function keys(object) {
        if (isArguments(object)) {
            return originalKeys(ArrayPrototype.slice.call(object));
        } else {
            return originalKeys(object);
        }
    }
}, !keysWorksWithArguments);

//
// Date
// ====
//

// ES5 15.9.5.43
// http://es5.github.com/#x15.9.5.43
// This function returns a String value represent the instance in time
// represented by this Date object. The format of the String is the Date Time
// string format defined in 15.9.1.15. All fields are present in the String.
// The time zone is always UTC, denoted by the suffix Z. If the time value of
// this object is not a finite Number a RangeError exception is thrown.
var negativeDate = -62198755200000;
var negativeYearString = "-000001";
var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1;

defineProperties(Date.prototype, {
    toISOString: function toISOString() {
        var result, length, value, year, month;
        if (!isFinite(this)) {
            throw new RangeError("Date.prototype.toISOString called on non-finite value.");
        }

        year = this.getUTCFullYear();

        month = this.getUTCMonth();
        // see https://github.com/es-shims/es5-shim/issues/111
        year += Math.floor(month / 12);
        month = (month % 12 + 12) % 12;

        // the date time string format is specified in 15.9.1.15.
        result = [month + 1, this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];
        year = (
            (year < 0 ? "-" : (year > 9999 ? "+" : "")) +
            ("00000" + Math.abs(year)).slice(0 <= year && year <= 9999 ? -4 : -6)
        );

        length = result.length;
        while (length--) {
            value = result[length];
            // pad months, days, hours, minutes, and seconds to have two
            // digits.
            if (value < 10) {
                result[length] = "0" + value;
            }
        }
        // pad milliseconds to have three digits.
        return (
            year + "-" + result.slice(0, 2).join("-") +
            "T" + result.slice(2).join(":") + "." +
            ("000" + this.getUTCMilliseconds()).slice(-3) + "Z"
        );
    }
}, hasNegativeDateBug);


// ES5 15.9.5.44
// http://es5.github.com/#x15.9.5.44
// This function provides a String representation of a Date object for use by
// JSON.stringify (15.12.3).
var dateToJSONIsSupported = false;
try {
    dateToJSONIsSupported = (
        Date.prototype.toJSON &&
        new Date(NaN).toJSON() === null &&
        new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
        Date.prototype.toJSON.call({ // generic
            toISOString: function () {
                return true;
            }
        })
    );
} catch (e) {
}
if (!dateToJSONIsSupported) {
    Date.prototype.toJSON = function toJSON(key) {
        // When the toJSON method is called with argument key, the following
        // steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be toPrimitive(O, hint Number).
        var o = Object(this),
            tv = toPrimitive(o),
            toISO;
        // 3. If tv is a Number and is not finite, return null.
        if (typeof tv === "number" && !isFinite(tv)) {
            return null;
        }
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        toISO = o.toISOString;
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (typeof toISO !== "function") {
            throw new TypeError("toISOString property is not callable");
        }
        // 6. Return the result of calling the [[Call]] internal method of
        //  toISO with O as the this value and an empty argument list.
        return toISO.call(o);

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// ES5 15.9.4.2
// http://es5.github.com/#x15.9.4.2
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;
var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z'));
var doesNotParseY2KNewYear = isNaN(Date.parse("2000-01-01T00:00:00.000Z"));
if (!Date.parse || doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    Date = (function (NativeDate) {

        // Date.length === 7
        function Date(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            if (this instanceof NativeDate) {
                var date = length === 1 && String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(Date.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
                // Prevent mixups with unfixed Date object
                date.constructor = Date;
                return date;
            }
            return NativeDate.apply(this, arguments);
        }

        // 15.9.1.15 Date Time String Format.
        var isoDateExpression = new RegExp("^" +
            "(\\d{4}|[\+\-]\\d{6})" + // four-digit year capture or sign +
                                      // 6-digit extended year
            "(?:-(\\d{2})" + // optional month capture
            "(?:-(\\d{2})" + // optional day capture
            "(?:" + // capture hours:minutes:seconds.milliseconds
                "T(\\d{2})" + // hours capture
                ":(\\d{2})" + // minutes capture
                "(?:" + // optional :seconds.milliseconds
                    ":(\\d{2})" + // seconds capture
                    "(?:(\\.\\d{1,}))?" + // milliseconds capture
                ")?" +
            "(" + // capture UTC offset component
                "Z|" + // UTC capture
                "(?:" + // offset specifier +/-hours:minutes
                    "([-+])" + // sign capture
                    "(\\d{2})" + // hours offset capture
                    ":(\\d{2})" + // minutes offset capture
                ")" +
            ")?)?)?)?" +
        "$");

        var months = [
            0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365
        ];

        function dayFromMonth(year, month) {
            var t = month > 1 ? 1 : 0;
            return (
                months[month] +
                Math.floor((year - 1969 + t) / 4) -
                Math.floor((year - 1901 + t) / 100) +
                Math.floor((year - 1601 + t) / 400) +
                365 * (year - 1970)
            );
        }

        function toUTC(t) {
            return Number(new NativeDate(1970, 0, 1, 0, 0, 0, t));
        }

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate) {
            Date[key] = NativeDate[key];
        }

        // Copy "native" methods explicitly; they may be non-enumerable
        Date.now = NativeDate.now;
        Date.UTC = NativeDate.UTC;
        Date.prototype = NativeDate.prototype;
        Date.prototype.constructor = Date;

        // Upgrade Date.parse to handle simplified ISO 8601 strings
        Date.parse = function parse(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                // parse months, days, hours, minutes, seconds, and milliseconds
                // provide default values if necessary
                // parse the UTC offset component
                var year = Number(match[1]),
                    month = Number(match[2] || 1) - 1,
                    day = Number(match[3] || 1) - 1,
                    hour = Number(match[4] || 0),
                    minute = Number(match[5] || 0),
                    second = Number(match[6] || 0),
                    millisecond = Math.floor(Number(match[7] || 0) * 1000),
                    // When time zone is missed, local offset should be used
                    // (ES 5.1 bug)
                    // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                    isLocalTime = Boolean(match[4] && !match[8]),
                    signOffset = match[9] === "-" ? 1 : -1,
                    hourOffset = Number(match[10] || 0),
                    minuteOffset = Number(match[11] || 0),
                    result;
                if (
                    hour < (
                        minute > 0 || second > 0 || millisecond > 0 ?
                        24 : 25
                    ) &&
                    minute < 60 && second < 60 && millisecond < 1000 &&
                    month > -1 && month < 12 && hourOffset < 24 &&
                    minuteOffset < 60 && // detect invalid offsets
                    day > -1 &&
                    day < (
                        dayFromMonth(year, month + 1) -
                        dayFromMonth(year, month)
                    )
                ) {
                    result = (
                        (dayFromMonth(year, month) + day) * 24 +
                        hour +
                        hourOffset * signOffset
                    ) * 60;
                    result = (
                        (result + minute + minuteOffset * signOffset) * 60 +
                        second
                    ) * 1000 + millisecond;
                    if (isLocalTime) {
                        result = toUTC(result);
                    }
                    if (-8.64e15 <= result && result <= 8.64e15) {
                        return result;
                    }
                }
                return NaN;
            }
            return NativeDate.parse.apply(this, arguments);
        };

        return Date;
    })(Date);
}

// ES5 15.9.4.4
// http://es5.github.com/#x15.9.4.4
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}


//
// Number
// ======
//

// ES5.1 15.7.4.5
// http://es5.github.com/#x15.7.4.5
var hasToFixedBugs = NumberPrototype.toFixed && (
  (0.00008).toFixed(3) !== '0.000'
  || (0.9).toFixed(0) !== '1'
  || (1.255).toFixed(2) !== '1.25'
  || (1000000000000000128).toFixed(0) !== "1000000000000000128"
);

var toFixedHelpers = {
  base: 1e7,
  size: 6,
  data: [0, 0, 0, 0, 0, 0],
  multiply: function multiply(n, c) {
      var i = -1;
      while (++i < toFixedHelpers.size) {
          c += n * toFixedHelpers.data[i];
          toFixedHelpers.data[i] = c % toFixedHelpers.base;
          c = Math.floor(c / toFixedHelpers.base);
      }
  },
  divide: function divide(n) {
      var i = toFixedHelpers.size, c = 0;
      while (--i >= 0) {
          c += toFixedHelpers.data[i];
          toFixedHelpers.data[i] = Math.floor(c / n);
          c = (c % n) * toFixedHelpers.base;
      }
  },
  numToString: function numToString() {
      var i = toFixedHelpers.size;
      var s = '';
      while (--i >= 0) {
          if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {
              var t = String(toFixedHelpers.data[i]);
              if (s === '') {
                  s = t;
              } else {
                  s += '0000000'.slice(0, 7 - t.length) + t;
              }
          }
      }
      return s;
  },
  pow: function pow(x, n, acc) {
      return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
  },
  log: function log(x) {
      var n = 0;
      while (x >= 4096) {
          n += 12;
          x /= 4096;
      }
      while (x >= 2) {
          n += 1;
          x /= 2;
      }
      return n;
  }
};

defineProperties(NumberPrototype, {
    toFixed: function toFixed(fractionDigits) {
        var f, x, s, m, e, z, j, k;

        // Test for NaN and round fractionDigits down
        f = Number(fractionDigits);
        f = f !== f ? 0 : Math.floor(f);

        if (f < 0 || f > 20) {
            throw new RangeError("Number.toFixed called with invalid number of decimals");
        }

        x = Number(this);

        // Test for NaN
        if (x !== x) {
            return "NaN";
        }

        // If it is too big or small, return the string value of the number
        if (x <= -1e21 || x >= 1e21) {
            return String(x);
        }

        s = "";

        if (x < 0) {
            s = "-";
            x = -x;
        }

        m = "0";

        if (x > 1e-21) {
            // 1e-21 < x < 1e21
            // -70 < log2(x) < 70
            e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;
            z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));
            z *= 0x10000000000000; // Math.pow(2, 52);
            e = 52 - e;

            // -18 < e < 122
            // x = z / 2 ^ e
            if (e > 0) {
                toFixedHelpers.multiply(0, z);
                j = f;

                while (j >= 7) {
                    toFixedHelpers.multiply(1e7, 0);
                    j -= 7;
                }

                toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);
                j = e - 1;

                while (j >= 23) {
                    toFixedHelpers.divide(1 << 23);
                    j -= 23;
                }

                toFixedHelpers.divide(1 << j);
                toFixedHelpers.multiply(1, 1);
                toFixedHelpers.divide(2);
                m = toFixedHelpers.numToString();
            } else {
                toFixedHelpers.multiply(0, z);
                toFixedHelpers.multiply(1 << (-e), 0);
                m = toFixedHelpers.numToString() + '0.00000000000000000000'.slice(2, 2 + f);
            }
        }

        if (f > 0) {
            k = m.length;

            if (k <= f) {
                m = s + '0.0000000000000000000'.slice(0, f - k + 2) + m;
            } else {
                m = s + m.slice(0, k - f) + '.' + m.slice(k - f);
            }
        } else {
            m = s + m;
        }

        return m;
    }
}, hasToFixedBugs);


//
// String
// ======
//

// ES5 15.5.4.14
// http://es5.github.com/#x15.5.4.14

// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
// Many browsers do not split properly with regular expressions or they
// do not perform the split correctly under obscure conditions.
// See http://blog.stevenlevithan.com/archives/cross-browser-split
// I've tested in many browsers and this seems to cover the deviant ones:
//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
//       [undefined, "t", undefined, "e", ...]
//    ''.split(/.?/) should be [], not [""]
//    '.'.split(/()()/) should be ["."], not ["", "", "."]

var string_split = StringPrototype.split;
if (
    'ab'.split(/(?:ab)*/).length !== 2 ||
    '.'.split(/(.?)(.?)/).length !== 4 ||
    'tesst'.split(/(s)*/)[1] === "t" ||
    'test'.split(/(?:)/, -1).length !== 4 ||
    ''.split(/.?/).length ||
    '.'.split(/()()/).length > 1
) {
    (function () {
        var compliantExecNpcg = /()??/.exec("")[1] === void 0; // NPCG: nonparticipating capturing group

        StringPrototype.split = function (separator, limit) {
            var string = this;
            if (separator === void 0 && limit === 0) {
                return [];
            }

            // If `separator` is not a regex, use native split
            if (_toString.call(separator) !== "[object RegExp]") {
                return string_split.call(this, separator, limit);
            }

            var output = [],
                flags = (separator.ignoreCase ? "i" : "") +
                        (separator.multiline  ? "m" : "") +
                        (separator.extended   ? "x" : "") + // Proposed for ES6
                        (separator.sticky     ? "y" : ""), // Firefox 3+
                lastLastIndex = 0,
                // Make `global` and avoid `lastIndex` issues by working with a copy
                separator2, match, lastIndex, lastLength;
            separator = new RegExp(separator.source, flags + "g");
            string += ""; // Type-convert
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
            }
            /* Values for `limit`, per the spec:
             * If undefined: 4294967295 // Math.pow(2, 32) - 1
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            limit = limit === void 0 ?
                -1 >>> 0 : // Math.pow(2, 32) - 1
                ToUint32(limit);
            while (match = separator.exec(string)) {
                // `separator.lastIndex` is not reliable cross-browser
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    output.push(string.slice(lastLastIndex, match.index));
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
                    // nonparticipating capturing groups
                    if (!compliantExecNpcg && match.length > 1) {
                        match[0].replace(separator2, function () {
                            for (var i = 1; i < arguments.length - 2; i++) {
                                if (arguments[i] === void 0) {
                                    match[i] = void 0;
                                }
                            }
                        });
                    }
                    if (match.length > 1 && match.index < string.length) {
                        ArrayPrototype.push.apply(output, match.slice(1));
                    }
                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;
                    if (output.length >= limit) {
                        break;
                    }
                }
                if (separator.lastIndex === match.index) {
                    separator.lastIndex++; // Avoid an infinite loop
                }
            }
            if (lastLastIndex === string.length) {
                if (lastLength || !separator.test("")) {
                    output.push("");
                }
            } else {
                output.push(string.slice(lastLastIndex));
            }
            return output.length > limit ? output.slice(0, limit) : output;
        };
    }());

// [bugfix, chrome]
// If separator is undefined, then the result array contains just one String,
// which is the this value (converted to a String). If limit is not undefined,
// then the output array is truncated so that it contains no more than limit
// elements.
// "0".split(undefined, 0) -> []
} else if ("0".split(void 0, 0).length) {
    StringPrototype.split = function split(separator, limit) {
        if (separator === void 0 && limit === 0) { return []; }
        return string_split.call(this, separator, limit);
    };
}

var str_replace = StringPrototype.replace;
var replaceReportsGroupsCorrectly = (function () {
    var groups = [];
    'x'.replace(/x(.)?/g, function (match, group) {
        groups.push(group);
    });
    return groups.length === 1 && typeof groups[0] === 'undefined';
}());

if (!replaceReportsGroupsCorrectly) {
    StringPrototype.replace = function replace(searchValue, replaceValue) {
        var isFn = isFunction(replaceValue);
        var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);
        if (!isFn || !hasCapturingGroups) {
            return str_replace.call(this, searchValue, replaceValue);
        } else {
            var wrappedReplaceValue = function (match) {
                var length = arguments.length;
                var originalLastIndex = searchValue.lastIndex;
                searchValue.lastIndex = 0;
                var args = searchValue.exec(match);
                searchValue.lastIndex = originalLastIndex;
                args.push(arguments[length - 2], arguments[length - 1]);
                return replaceValue.apply(this, args);
            };
            return str_replace.call(this, searchValue, wrappedReplaceValue);
        }
    };
}

// ECMA-262, 3rd B.2.3
// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
// non-normative section suggesting uniform semantics and it should be
// normalized across all browsers
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
var string_substr = StringPrototype.substr;
var hasNegativeSubstrBug = "".substr && "0b".substr(-1) !== "b";
defineProperties(StringPrototype, {
    substr: function substr(start, length) {
        return string_substr.call(
            this,
            start < 0 ? ((start = this.length + start) < 0 ? 0 : start) : start,
            length
        );
    }
}, hasNegativeSubstrBug);

// ES5 15.5.4.20
// whitespace from: http://es5.github.io/#x15.5.4.20
var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
    "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
    "\u2029\uFEFF";
var zeroWidth = '\u200b';
var wsRegexChars = "[" + ws + "]";
var trimBeginRegexp = new RegExp("^" + wsRegexChars + wsRegexChars + "*");
var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + "*$");
var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
defineProperties(StringPrototype, {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    trim: function trim() {
        if (this === void 0 || this === null) {
            throw new TypeError("can't convert " + this + " to object");
        }
        return String(this).replace(trimBeginRegexp, "").replace(trimEndRegexp, "");
    }
}, hasTrimWhitespaceBug);

// ES-5 15.1.2.2
if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {
    parseInt = (function (origParseInt) {
        var hexRegex = /^0[xX]/;
        return function parseIntES5(str, radix) {
            str = String(str).trim();
            if (!Number(radix)) {
                radix = hexRegex.test(str) ? 16 : 10;
            }
            return origParseInt(str, radix);
        };
    }(parseInt));
}

}));

!function(){var a,b,c,d;!function(){var e={},f={};a=function(a,b,c){e[a]={deps:b,callback:c}},d=c=b=function(a){function c(b){if("."!==b.charAt(0))return b;for(var c=b.split("/"),d=a.split("/").slice(0,-1),e=0,f=c.length;f>e;e++){var g=c[e];if(".."===g)d.pop();else{if("."===g)continue;d.push(g)}}return d.join("/")}if(d._eak_seen=e,f[a])return f[a];if(f[a]={},!e[a])throw new Error("Could not find module "+a);for(var g,h=e[a],i=h.deps,j=h.callback,k=[],l=0,m=i.length;m>l;l++)"exports"===i[l]?k.push(g={}):k.push(b(c(i[l])));var n=j.apply(this,k);return f[a]=g||n}}(),a("promise/all",["./utils","exports"],function(a,b){"use strict";function c(a){var b=this;if(!d(a))throw new TypeError("You must pass an array to all.");return new b(function(b,c){function d(a){return function(b){f(a,b)}}function f(a,c){h[a]=c,0===--i&&b(h)}var g,h=[],i=a.length;0===i&&b([]);for(var j=0;j<a.length;j++)g=a[j],g&&e(g.then)?g.then(d(j),c):f(j,g)})}var d=a.isArray,e=a.isFunction;b.all=c}),a("promise/asap",["exports"],function(a){"use strict";function b(){return function(){process.nextTick(e)}}function c(){var a=0,b=new i(e),c=document.createTextNode("");return b.observe(c,{characterData:!0}),function(){c.data=a=++a%2}}function d(){return function(){j.setTimeout(e,1)}}function e(){for(var a=0;a<k.length;a++){var b=k[a],c=b[0],d=b[1];c(d)}k=[]}function f(a,b){var c=k.push([a,b]);1===c&&g()}var g,h="undefined"!=typeof window?window:{},i=h.MutationObserver||h.WebKitMutationObserver,j="undefined"!=typeof global?global:void 0===this?window:this,k=[];g="undefined"!=typeof process&&"[object process]"==={}.toString.call(process)?b():i?c():d(),a.asap=f}),a("promise/config",["exports"],function(a){"use strict";function b(a,b){return 2!==arguments.length?c[a]:(c[a]=b,void 0)}var c={instrument:!1};a.config=c,a.configure=b}),a("promise/polyfill",["./promise","./utils","exports"],function(a,b,c){"use strict";function d(){var a;a="undefined"!=typeof global?global:"undefined"!=typeof window&&window.document?window:self;var b="Promise"in a&&"resolve"in a.Promise&&"reject"in a.Promise&&"all"in a.Promise&&"race"in a.Promise&&function(){var b;return new a.Promise(function(a){b=a}),f(b)}();b||(a.Promise=e)}var e=a.Promise,f=b.isFunction;c.polyfill=d}),a("promise/promise",["./config","./utils","./all","./race","./resolve","./reject","./asap","exports"],function(a,b,c,d,e,f,g,h){"use strict";function i(a){if(!v(a))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof i))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this._subscribers=[],j(a,this)}function j(a,b){function c(a){o(b,a)}function d(a){q(b,a)}try{a(c,d)}catch(e){d(e)}}function k(a,b,c,d){var e,f,g,h,i=v(c);if(i)try{e=c(d),g=!0}catch(j){h=!0,f=j}else e=d,g=!0;n(b,e)||(i&&g?o(b,e):h?q(b,f):a===D?o(b,e):a===E&&q(b,e))}function l(a,b,c,d){var e=a._subscribers,f=e.length;e[f]=b,e[f+D]=c,e[f+E]=d}function m(a,b){for(var c,d,e=a._subscribers,f=a._detail,g=0;g<e.length;g+=3)c=e[g],d=e[g+b],k(b,c,d,f);a._subscribers=null}function n(a,b){var c,d=null;try{if(a===b)throw new TypeError("A promises callback cannot return that same promise.");if(u(b)&&(d=b.then,v(d)))return d.call(b,function(d){return c?!0:(c=!0,b!==d?o(a,d):p(a,d),void 0)},function(b){return c?!0:(c=!0,q(a,b),void 0)}),!0}catch(e){return c?!0:(q(a,e),!0)}return!1}function o(a,b){a===b?p(a,b):n(a,b)||p(a,b)}function p(a,b){a._state===B&&(a._state=C,a._detail=b,t.async(r,a))}function q(a,b){a._state===B&&(a._state=C,a._detail=b,t.async(s,a))}function r(a){m(a,a._state=D)}function s(a){m(a,a._state=E)}var t=a.config,u=(a.configure,b.objectOrFunction),v=b.isFunction,w=(b.now,c.all),x=d.race,y=e.resolve,z=f.reject,A=g.asap;t.async=A;var B=void 0,C=0,D=1,E=2;i.prototype={constructor:i,_state:void 0,_detail:void 0,_subscribers:void 0,then:function(a,b){var c=this,d=new this.constructor(function(){});if(this._state){var e=arguments;t.async(function(){k(c._state,d,e[c._state-1],c._detail)})}else l(this,d,a,b);return d},"catch":function(a){return this.then(null,a)}},i.all=w,i.race=x,i.resolve=y,i.reject=z,h.Promise=i}),a("promise/race",["./utils","exports"],function(a,b){"use strict";function c(a){var b=this;if(!d(a))throw new TypeError("You must pass an array to race.");return new b(function(b,c){for(var d,e=0;e<a.length;e++)d=a[e],d&&"function"==typeof d.then?d.then(b,c):b(d)})}var d=a.isArray;b.race=c}),a("promise/reject",["exports"],function(a){"use strict";function b(a){var b=this;return new b(function(b,c){c(a)})}a.reject=b}),a("promise/resolve",["exports"],function(a){"use strict";function b(a){if(a&&"object"==typeof a&&a.constructor===this)return a;var b=this;return new b(function(b){b(a)})}a.resolve=b}),a("promise/utils",["exports"],function(a){"use strict";function b(a){return c(a)||"object"==typeof a&&null!==a}function c(a){return"function"==typeof a}function d(a){return"[object Array]"===Object.prototype.toString.call(a)}var e=Date.now||function(){return(new Date).getTime()};a.objectOrFunction=b,a.isFunction=c,a.isArray=d,a.now=e}),b("promise/polyfill").polyfill()}();
/** @namespace */
var ozpIwc=ozpIwc || {};
/**
 * @submodule common
 */

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util=ozpIwc.util || {};

/**
 * Used to get the current epoch time.  Tests overrides this
 * to allow a fast-forward on time-based actions.
 *
 * @method now
 * @returns {Number}
 */
ozpIwc.util.now=function() {
    return new Date().getTime();
};

/**
 * Create a class with the given parent in it's prototype chain.
 *
 * @method extend
 * @param {Function} baseClass The class being derived from.
 * @param {Function} newConstructor The new base class.
 *
 * @returns {Function} New Constructor with an augmented prototype.
 */
ozpIwc.util.extend=function(baseClass,newConstructor) {
    if(!baseClass || !baseClass.prototype) {
        ozpIwc.log.error("Cannot create a new class for ",newConstructor," due to invalid baseclass:",baseClass);
        throw new Error("Cannot create a new class due to invalid baseClass.  Dependency not loaded first?");
    }
    newConstructor.prototype = Object.create(baseClass.prototype);
    newConstructor.prototype.constructor = newConstructor;
    return newConstructor;
};

/**
 * Detect browser support for structured clones. Returns quickly since it
 * caches the result. However, a bug in FF will cause clone to fail fr file objects
 * (see https://bugzilla.mozilla.org/show_bug.cgi?id=722126). This method will
 * not detect that, since it's designed to determine browser support and cache
 * the result for efficiency. This method should therefore not be called except
 * from a method which subsequently tests the ability to clone a File object. (See
 * ozpIwc.util.getPostMessagePayload()).
 *
 * @private
 *
 * @method structuredCloneSupport
 *
 * @returns {Boolean} True if structured clones are supported, false otherwise.
 */
ozpIwc.util.structuredCloneSupport=function() {
    ozpIwc.util = ozpIwc.util || {};
    if (ozpIwc.util.structuredCloneSupportCache !== undefined) {
        return ozpIwc.util.structuredCloneSupportCache;
    }
    var cloneSupport = 'postMessage' in window;
    //If the browser doesn't support structured clones, it will call toString() on the object passed to postMessage.
    try {
        window.postMessage({
            toString: function () {
                cloneSupport = false;
            }
        }, "*");
    } catch (e) {
        //exception expected: objects with methods can't be cloned
        //e.DATA_CLONE_ERR will exist only for browsers with structured clone support, which can be used as an additional check if needed
    }
    ozpIwc.util.structuredCloneSupportCache=cloneSupport;
    return ozpIwc.util.structuredCloneSupportCache;
};

ozpIwc.util.structuredCloneSupport.cache=undefined;

/**
* Return an object suitable for passing to window.postMessage
* based on whether or not the browser supports structured clones
* and the object to be cloned is supported. Testing for browser support
* is not sufficient because of a bug in Firefox which prevents successful
* cloning of File objects. (see https://bugzilla.mozilla.org/show_bug.cgi?id=722126)
*
* @method getPostMessagePayload
*
* @returns {Object} The object passed in, if it can be cloned; otherwise te object stringified.
*/
ozpIwc.util.getPostMessagePayload=function(msg) {
    if (ozpIwc.util.structuredCloneSupport()) {
        if (!(msg instanceof File)) {
            //if the object is not a File, we can trust the cached indicator of browser support for structured clones
            return msg;
        }
        //otherwise, test whether the object can be cloned
        try {
            window.postMessage(msg, "*");
        } catch (e) {
            msg=JSON.stringify(msg);
        } finally {
            return msg;
        }
    } else {
        return JSON.stringify(msg);
    }

}

/**
 * Does a deep clone of a serializable object.  Note that this will not
 * clone unserializable objects like DOM elements, Date, RegExp, etc.
 *
 * @method clone
 * @param {Array|Object} value The value to be cloned.
 * @returns {Array|Object}  a deep copy of the object
 */
ozpIwc.util.clone=function(value) {
	if(Array.isArray(value) || typeof(value) === 'object') {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (e) {
            ozpIwc.log.log(e);
        }
	} else {
		return value;
	}
};


/**
 * A regex method to parse query parameters.
 *
 * @method parseQueryParams
 * @param {String} query
 *
 */
ozpIwc.util.parseQueryParams=function(query) {
    query = query || window.location.search;
    var params={};
	var regex=/\??([^&=]+)=?([^&]*)/g;
	var match;
	while((match=regex.exec(query)) !== null) {
		params[match[1]]=decodeURIComponent(match[2]);
	}
    return params;
};

/**
 * Determines the origin of a given url
 * @method determineOrigin
 * @param url
 * @returns {String}
 */
ozpIwc.util.determineOrigin=function(url) {
    var a=document.createElement("a");
    a.href = url;
    var origin=a.protocol + "//" + a.hostname;
    if(a.port) {
        origin+= ":" + a.port;
    }
    return origin;
};

/**
 * Escapes regular expression characters in a string.
 * @method escapeRegex
 * @param {String} str
 * @returns {String}
 */
ozpIwc.util.escapeRegex=function(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * 
 * @method parseOzpUrl
 * @param {type} url
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.util.parseOzpUrl=function(url) {
    var m = /^(?:(?:web\+ozp|ozp):\/\/)?([0-9a-zA-Z](?:[-.\w])*)(\/[^?#]*)(\?[^#]*)?(#.*)?$/.exec(decodeURIComponent(url));
    if (m) {
        // an action of "get" is implied
        var packet = {
            'dst': m[1],
            'resource': m[2],
            'action': "get"
        };
        // TODO: parse the query params into fields

        return packet;
    }
    return null;
};

/**
 * Returns true if the specified packet meets the criteria of an IWC Packet.
 * @method isIwcPacket
 * @static
 * @param {ozpIwc.TransportPacket} packet
 * @returns {Boolean}
 */
ozpIwc.util.isIWCPacket=function(packet) {
    if(typeof packet.src !== "string" ||typeof packet.dst !== "string" ||
        typeof packet.ver !== "number" || typeof packet.msgId !== "string") {
        return false;
    } else {
        return true;
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
/**
 * @submodule metrics.statistics
 */

/**
 *
 * @class metricStats
 * @namespace ozpIwc
 */
ozpIwc.metricsStats=ozpIwc.metricsStats || {};

/**
 * @property DEFAULT_POOL_SIZE
 * @type {Number}
 * @default 1028
 */
ozpIwc.metricsStats.DEFAULT_POOL_SIZE=1028;

/**
 * @Class Sample
 * @namespace ozpIwc.metricsStats
 * @constructor
 */
ozpIwc.metricsStats.Sample = function(){
    /**
     * @property values
     * @type Array
     */
	this.clear();
};

/**
 * Appends the value.
 * @method update
 * @param {Number} val
 */
ozpIwc.metricsStats.Sample.prototype.update = function(val){ 
	this.values.push(val); 
};

/**
 * Clears the values.
 * @method clear
 */
ozpIwc.metricsStats.Sample.prototype.clear = function(){ 
	this.values = []; 
	this.count = 0; 
};

/**
 * Returns the number of the values.
 * @method size
 * @returns {Number}
 */
ozpIwc.metricsStats.Sample.prototype.size = function(){ 
	return this.values.length;
};

/**
 * Returns the array of values.
 * @method getValues
 * @returns {Array}
 */
ozpIwc.metricsStats.Sample.prototype.getValues = function(){ 
	return this.values; 
};


/**
 *  Take a uniform sample of size size for all values
 *  @class UniformSample
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

/**
 * Statistics classes for the ozpIwc Metrics
 * @module metrics
 * @submodule metrics.statistics
 */
/**
 * metricStats namespace
 * @class metricStats
 * @namespace ozpIwc
 * @static
 */
ozpIwc.metricsStats=ozpIwc.metricsStats || {};
/**
 * This acts as a ordered binary heap for any serializeable JS object or collection of such objects 
 * <p>Borrowed from https://github.com/mikejihbe/metrics. Originally from from http://eloquentjavascript.net/appendix2.html
 * <p>Licenced under CCv3.0
 *
 * @class BinaryHeap
 * @namespace ozpIwc.metricStats
 * @param {Function} scoreFunction
 * @returns {ozpiwc.metricStats.BinaryHeap}
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
      if (this.content[i] === node) {
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();
        if (i !== len - 1) {
          this.content[i] = end;
          if (this.scoreFunction(end) < this.scoreFunction(node)) {
              this.bubbleUp(i);
          }
          else {
              this.sinkDown(i);
          }
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
      var child1Score = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) {
            swap = child1N;
        }
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
            child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
            swap = child2N;
        }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap !== null) {
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

/**
 * @submodule metrics.statistics
 */

//  Take an exponentially decaying sample of size size of all values
/**
 *
 * @class metricStats
 * @namespace ozpIwc
 */

/**
 * @property DEFAULT_RESCALE_THRESHOLD
 * @type {Number}
 * @default 3600000
 */
ozpIwc.metricsStats.DEFAULT_RESCALE_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * @property DEFAULT_DECAY_ALPHA
 * @type {Number}
 * @default 0.015
 */
ozpIwc.metricsStats.DEFAULT_DECAY_ALPHA=0.015;

/**
 * This acts as a ordered binary heap for any serializeable JS object or collection of such objects 
 * <p>Borrowed from https://github.com/mikejihbe/metrics. 
 * @class ExponentiallyDecayingSample
 * @namespace ozpIwc.metricStats
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample=ozpIwc.util.extend(ozpIwc.metricsStats.Sample,function(size, alpha) {
	ozpIwc.metricsStats.Sample.apply(this);
  this.limit = size || ozpIwc.metricsStats.DEFAULT_POOL_SIZE;
  this.alpha = alpha || ozpIwc.metricsStats.DEFAULT_DECAY_ALPHA;
	this.rescaleThreshold = ozpIwc.metricsStats.DEFAULT_RESCALE_THRESHOLD;
});

// This is a relatively expensive operation
/**
 * @method getValues
 * @returns {Array}
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.getValues = function() {
  var values = [];
  var heap = this.values.clone();
	var elt;
  while((elt = heap.pop()) !== undefined) {
    values.push(elt.val);
  }
  return values;
};

/**
 * @method size
 * @returns {Number}
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.size = function() {
  return this.values.size();
};

/**
 * @method newHeap
 * @returns {ozpIwc.metricsStats.BinaryHeap}
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.newHeap = function() {
  return new ozpIwc.metricsStats.BinaryHeap(function(obj){return obj.priority;});
};

/**
 * @method now
 * @returns {Number}
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.now = function() {
  return ozpIwc.util.now();
};

/**
 * @method tick
 * @returns {Number}
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.tick = function() {
  return this.now() / 1000;
};

/**
 * @method clear
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.clear = function() {
  this.values = this.newHeap();
  this.count = 0;
  this.startTime = this.tick();
  this.nextScaleTime = this.now() + this.rescaleThreshold;
};

/**
 * timestamp in milliseconds
 * @method update
 * @param {Number} val
 * @param {Number} timestamp
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.update = function(val, timestamp) {
  // Convert timestamp to seconds
  if (timestamp === undefined) {
    timestamp = this.tick();
  } else {
    timestamp = timestamp / 1000;
  }
  var priority = this.weight(timestamp - this.startTime) / Math.random();
  var value = {val: val, priority: priority};
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

/**
 * @method weight
 * @param {Number}time
 * @returns {Number}
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.weight = function(time) {
  return Math.exp(this.alpha * time);
};

/**
 * @method rescale
 */
ozpIwc.metricsStats.ExponentiallyDecayingSample.prototype.rescale = function() {
  this.nextScaleTime = this.now() + this.rescaleThreshold;
  var oldContent = this.values.content;
  var newContent = [];
  var oldStartTime = this.startTime;
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
/**
 * @submodule metrics.statistics
 */

/**
 *
 * @class metricStats
 * @namespace ozpIwc
 */

/**
 * @property M1_ALPHA
 * @type {Number}
 * @default 1 - e^(-5/60)
 */
ozpIwc.metricsStats.M1_ALPHA = 1 - Math.exp(-5/60);

/**
 * @property M5_ALPHA
 * @type {Number}
 * @default 1 - e^(-5/60/5)
 */
ozpIwc.metricsStats.M5_ALPHA = 1 - Math.exp(-5/60/5);

/**
 * @property M15_ALPHA
 * @type {Number}
 * @default 1 - e^(-5/60/15)
 */
ozpIwc.metricsStats.M15_ALPHA = 1 - Math.exp(-5/60/15);

/**
 *  Exponentially weighted moving average.
 *  @method ExponentiallyWeightedMovingAverage
 *  @param {Number} alpha
 *  @param {Number} interval Time in milliseconds
 */
ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage=function(alpha, interval) {
  this.alpha = alpha;
  this.interval = interval || 5000;
  this.currentRate = null;
  this.uncounted = 0;
	this.lastTick=ozpIwc.util.now();
};

/**
 * @method update
 * @param n
 */
ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage.prototype.update = function(n) {
  this.uncounted += (n || 1);
	this.tick();
};

/**
 * Update the rate measurements every interval
 *
 * @method tick
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

/**
 * Return the rate per second
 *
 * @returns {Number}
 */
ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage.prototype.rate = function() {
  return this.currentRate * 1000;
};

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

/**
 * @submodule metrics.types
 */

/**
 * @class Histogram
 * @namespace ozpIwc.metricTypes
 * @extends ozpIwc.metricTypes.BaseMetric
 */
ozpIwc.metricTypes.Histogram=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function() {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);

    /**
     * @property sample
     * @type {ozpIwc.metricsStats.ExponentiallyDecayingSample}
     */
	this.sample = new ozpIwc.metricsStats.ExponentiallyDecayingSample();
	this.clear();
});


/**
 * @method clear
 */
ozpIwc.metricTypes.Histogram.prototype.clear=function() {
	this.sample.clear();
	this.min=this.max=null;
	this.varianceMean=0;
	this.varianceM2=0;
	this.sum=0;
	this.count=0;	
};

/**
 * @method mark
 * @param {Number} val
 * @param {Number} timestamp Current time in milliseconds.
 * @returns {Number} Value of the counter after increment
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

/**
 * @method get
 * @returns {{percentile10, percentile25, median, percentile75, percentile90, percentile95, percentile99,
 * percentile999, variance: null, mean: null, stdDev: null, count: *, sum: *, max: *, min: *}}
 */
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
		'percentile10': percentile(0.10),
		'percentile25': percentile(0.25),
		'median': percentile(0.50),				
		'percentile75': percentile(0.75),
		'percentile90': percentile(0.90),
		'percentile95': percentile(0.95),
		'percentile99': percentile(0.99),
		'percentile999': percentile(0.999),
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
 * @submodule metrics.types
 */

/**
 * @class Meter
 * @namespace ozpIwc.metricTypes
 * @extends ozpIwc.metricTypes.BaseMetric
 */
ozpIwc.metricTypes.Meter=ozpIwc.util.extend(ozpIwc.metricTypes.BaseMetric,function() {
	ozpIwc.metricTypes.BaseMetric.apply(this,arguments);
    /**
     * @property m1Rate
     * @type {ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage}
     */
	this.m1Rate= new ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage(ozpIwc.metricsStats.M1_ALPHA);
    /**
     * @property m5Rate
     * @type {ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage}
     */
	this.m5Rate= new ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage(ozpIwc.metricsStats.M5_ALPHA);
    /**
     * @property m15Rate
     * @type {ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage}
     */
	this.m15Rate= new ozpIwc.metricsStats.ExponentiallyWeightedMovingAverage(ozpIwc.metricsStats.M15_ALPHA);
    /**
     * @property startTime
     * @type {Number}
     */
	this.startTime=ozpIwc.util.now();
    /**
     * @property value
     * @type {Number}
     * @default 0
     */
	this.value=0;
});

/**
 * @method mark
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

/**
 * @method get
 * @returns {{rate1m: (Number), rate5m: (Number), rate15m: (Number), rateMean: number, count: (Number)}}
 */
ozpIwc.metricTypes.Meter.prototype.get=function() {
	return {
		'rate1m' : this.m1Rate.rate(),
		'rate5m' : this.m5Rate.rate(),
		'rate15m' : this.m15Rate.rate(),
		'rateMean' : this.value / (ozpIwc.util.now() - this.startTime) * 1000,
		'count' : this.value
	};
};

/**
 * @method tick
 */
ozpIwc.metricTypes.Meter.prototype.tick=function() { 
	this.m1Rate.tick();
	this.m5Rate.tick();
	this.m15Rate.tick();
};

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

/** @namespace */
var ozpIwc=ozpIwc || {};

/**
 * Utility methods used on the IWC bus.
 * @module bus
 * @submodule bus.util
 */

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util=ozpIwc.util || {};

/**
 * Sends an AJAX request. A promise is returned to handle the response.
 *
 * @method ajax
 * @static
 * @param {Object} config
 * @param {String} config.method
 * @param {String} config.href
 * @param [Object] config.headers
 * @param {String} config.headers.name
 * @param {String} config.headers.value
 * @param {boolean} config.withCredentials
 *
 * @returns {Promise}
 */
ozpIwc.util.ajax = function (config) {
    return new Promise(function(resolve,reject) {
        var request = new XMLHttpRequest();
        request.withCredentials = config.withCredentials;
        request.open(config.method, config.href, true, config.user, config.password);
//        request.setRequestHeader("Content-Type", "application/json");
        if (Array.isArray(config.headers)) {
            config.headers.forEach(function(header) {
                request.setRequestHeader(header.name, header.value);
            });
        }
        //Setting username and password as params to open() per the API does not work. setting them
        //explicitly in the Authorization header works (but only for BASIC authentication)
        request.setRequestHeader("Authorization", "Basic " + btoa(config.user + ":" + config.password));

        request.onload = function () {
            try {
                resolve({
                    "response": JSON.parse(this.responseText),
                    "header":  ozpIwc.util.ajaxResponseHeaderToJSON(this.getAllResponseHeaders())
                });
            }
            catch (e) {
                if(this.status === 204 && !this.responseText){
                    resolve({
                        "response": {},
                        "header":  ozpIwc.util.ajaxResponseHeaderToJSON(this.getAllResponseHeaders())
                    });
                } else {
                    reject(this);
                }
            }
        };

        request.onerror = function (e) {
            reject(this);
        };

        if((config.method === "POST") || (config.method === "PUT")) {
            request.send(config.data);
        }
        else {
            request.send();
        }
    });
};


/**
 * Takes the Javascript ajax response header (string) and converts it to JSON
 * @method ajaxResponseHeaderToJSON
 * @param {String} header
 *
 * @returns {Object}
 */
ozpIwc.util.ajaxResponseHeaderToJSON = function(header) {
    var obj = {};
    header.split("\n").forEach(function (property) {
        var kv = property.split(":");
        if (kv.length === 2) {
            obj[kv[0].trim()] = kv[1].trim();
        }
    });

    return obj;
};

/** @namespace */
var ozpIwc=ozpIwc || {};
/**
 * @submodule bus.util
 */

/**
 * A deferred action, but not in the sense of the Javascript standard.
 * @class AsyncAction
 * @constructor
 * @namespace ozpIwc
 */
ozpIwc.AsyncAction=function() {
    /**
     * The result of the logic defered to.
     * @property resolution
     * @type string
     */
    /**
     * Key value store of the callbacks to the deferred action.
     * @property callbacks
     * @type Object
     */
	this.callbacks={};
};

/**
 * Registers the callback to be called when the resolution matches the state. If resolution matches the state before
 * registration, the callback is fired rather than registered.
 *
 * @method when
 * @param state
 * @param callback
 * @param self
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.AsyncAction.prototype.when=function(state,callback,self) {
    self=self || this;
	
	if(this.resolution === state) {
		callback.apply(self,this.value);
	} else {
		this.callbacks[state]=function() { return callback.apply(self,arguments); };
	}
	return this;
};

/**
 * Sets the deferred action's resolution and calls any callbacks associated to that state.
 *
 * @method resolve
 * @param status
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.AsyncAction.prototype.resolve=function(status) {
	if(this.resolution) {
		throw "Cannot resolve an already resolved AsyncAction";
	}
	var callback=this.callbacks[status];
	this.resolution=status;

    /**
     * @property value
     * @type Array
     */
	this.value=Array.prototype.slice.call(arguments,1);
	
	if(callback) {
		callback.apply(this,this.value);
	}
	return this;
};

/**
 * Gives implementation of an AsyncAction a chained success registration.
 * @method success
 * @param callback
 * @param self
 * @example
 * var a = new ozpIwc.AsyncAction().success(function(){...}, this).failure(function(){...}, this);
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.AsyncAction.prototype.success=function(callback,self) {
	return this.when("success",callback,self);
};

/**
 * Gives implementation of an AsyncAction a chained failure registration.
 * @method success
 * @param callback
 * @param self
 * @example
 * var a = new ozpIwc.AsyncAction().success(function(){...}, this).failure(function(){...}, this);
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.AsyncAction.prototype.failure=function(callback,self) {
	return this.when("failure",callback,self);
};
/** @namespace */
var ozpIwc=ozpIwc || {};

/**
 * @submodule bus.util
 */
var getStackTrace = function() {
    var obj = {};
    Error.captureStackTrace(obj, getStackTrace);
    return obj.stack;
};
/**
 * A logging wrapper for the ozpIwc namespace
 * @class log
 * @static
 * @namespace ozpIwc
 */
ozpIwc.log=ozpIwc.log || {
    /**
     * A wrapper for log messages. Forwards to console.log if available.
     * @property log
     * @type Function
     */
	log: function() {
		if(window.console && typeof(window.console.log)==="function") {
			window.console.log.apply(window.console,arguments);
		}
	},
    /**
     * A wrapper for error messages. Forwards to console.error if available.
     * @property error
     * @type Function
     */
	error: function() {
		if(window.console && typeof(window.console.error)==="function") {
			window.console.error.apply(window.console,arguments);
		}
	}
};

(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(new Function("return this")()));

/** @namespace */
var ozpIwc=ozpIwc || {};
/**
* @submodule bus.util
*/

/**
 * @class util
 * @namespace ozpIwc
 * @static
 */
ozpIwc.util=ozpIwc.util || {};

/**
 * Generates a large hexidecimal string to serve as a unique ID.  Not a guid.
 *
 * @method generateId
 * @static
 *
 * @returns {String}
 */
ozpIwc.util.generateId=function() {
    return Math.floor(Math.random() * 0xffffffff).toString(16);
};

/**
 * Invokes the callback handler on another event loop as soon as possible.
 *
 * @method setImmediate
 * @static
*/
ozpIwc.util.setImmediate=function(f) {
//    window.setTimeout(f,0);
    window.setImmediate(f);
};

/**
 * Returns true if every needle is found in the haystack.
 *
 * @method arrayContainsAll
 * @static
 * @param {Array} haystack The array to search.
 * @param {Array} needles All of the values to search.
 * @param {Function} [equal] What constitutes equality.  Defaults to a===b.
 *
 * @returns {Boolean}
 */
ozpIwc.util.arrayContainsAll=function(haystack,needles,equal) {
    equal=equal || function(a,b) { return a===b;};
    return needles.every(function(needle) { 
        return haystack.some(function(hay) { 
            return equal(hay,needle);
        });
    });
};


/**
 * Returns true if the value every attribute in needs is equal to 
 * value of the same attribute in haystack.
 *
 * @method objectContainsAll
 * @static
 * @param {Array} haystack The object that must contain all attributes and values.
 * @param {Array} needles The reference object for the attributes and values.
 * @param {Function} [equal] What constitutes equality.  Defaults to a===b.
 *
 * @returns {Boolean}
 */
ozpIwc.util.objectContainsAll=function(haystack,needles,equal) {
    equal=equal || function(a,b) { return a===b;};
    
    for(var attribute in needles) {
        if(!equal(haystack[attribute],needles[attribute])) {
            return false;
        }
    }
    return true;
};

/**
 * Wraps window.open.  If the bus is running in a worker, then
 * it doesn't have access to the window object and needs help from
 * a participant. 
 * @see window.open documentation for what the parameters actually do
 * 
 * @method openWindow
 * @static
 * @param {String} url The URL to open in a new window
 * @param {String} windowName The window name to open with.
 * @param {String} [features] The window features.
 *
 * @returns {undefined}
 */
ozpIwc.util.openWindow=function(url,windowName,features) {
    if(typeof windowName === "object") {
        var str="";
        for(var k in windowName) {
            str+=k+"="+encodeURIComponent(windowName[k])+"&";
        }
        windowName=str;
    }
    
    window.open(url,windowName,features);
};


(function() {
    ozpIwc.BUS_ROOT=window.location.protocol + "//" +
            window.location.host +
            window.location.pathname.replace(/[^\/]+$/,"");
})();


/**
 * IWC alert handler.
 *
 * @method alert
 * @static
 * @param {String} message The string to display in the popup.
 * @param {Object} errorObject The object related to the alert to give as additional information
 * @todo fill with some form of modal popup regarding the alert.
 * @todo store a list of alerts to not notify if the user selects "don't show me this again" in the data.api
 *
 */
ozpIwc.util.alert = function (message, errorObject) {
    this.alerts = this.alerts || {};
    if(this.alerts[message]){
        this.alerts[message].error = errorObject;
    } else {
        this.alerts[message] = {
            error: errorObject,
            silence: false
        };
    }
    if(!this.alerts[message].silence){
        //TODO : trigger an angular/bootstrap modal alert to notify the user of the error.
        // on return of the alert:
            // set this.alerts[message].silence if the user silenced the alerts

        // Temporary placement: all alerts are silenced after first instance, but since this is not in data.api its on
        // a widget basis.
        this.alerts[message].silence = true;
        ozpIwc.log.log(message,errorObject);
    }
};


/**
 * Classes related to security aspects of the IWC.
 * @module bus
 * @submodule bus.security
 */

/**
 * Attribute Based Access Control policies.
 * @class abacPolicies
 * @static
 */
ozpIwc.abacPolicies={};

/**
 * Returns `permit` when the request's object exists and is empty.
 *
 * @static
 * @method permitWhenObjectHasNoAttributes
 * @param request
 *
 * @returns {String}
 */
ozpIwc.abacPolicies.permitWhenObjectHasNoAttributes=function(request) {
    if(request.object && Object.keys(request.object).length===0) {
        return "permit";
    }
    return "undetermined";
};
/**
 * Returns `permit` when the request's subject contains all of the request's object.
 *
 * @static
 * @method subjectHasAllObjectAttributes
 * @param request
 *
 * @returns {String}
 */
ozpIwc.abacPolicies.subjectHasAllObjectAttributes=function(request) {
    // if no object permissions, then it's trivially true
    if(!request.object) {
        return "permit";
    }
    var subject = request.subject || {};
    if(ozpIwc.util.objectContainsAll(subject,request.object,this.implies)) {
        return "permit";
    }
    return "deny";
};

/**
 * Returns `permit` for any scenario.
 *
 * @static
 * @method permitAll
 * @returns {String}
 */
ozpIwc.abacPolicies.permitAll=function() {
    return "permit";
};


var ozpIwc=ozpIwc || {};
/**
 * @submodule bus.security
 */

/** @typedef {string} ozpIwc.security.Role */

/** @typedef {string} ozpIwc.security.Permission */

/** @typedef { ozpIwc.security.Role[] } ozpIwc.security.Subject */

/** 
 * @typedef {object} ozpIwc.security.Actor 
 * @property {ozpIwc.security.Subject} securityAttributes
 */


/**
 * @TODO (DOC)
 * @class BasicAuthentication
 * @constructor
 * @namespace ozpIwc
 */
ozpIwc.BasicAuthentication=function() {

    /**
     * @property roles
     * @type Object
     * @default {}
     */
	this.roles={};
    var self = this;
    ozpIwc.metrics.gauge('security.authentication.roles').set(function() {
        return self.getRoleCount();
    });
};

/**
 * Returns the number of roles currently defined.
 *
 * @method getRoleCount
 *
 * @returns {number} the number of roles defined
 */
ozpIwc.BasicAuthentication.prototype.getRoleCount=function() {
    if (!this.roles || !Object.keys(this.roles)) {
        return 0;
    }
    return Object.keys(this.roles).length;
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
 * @method login
 * @param {ozpIwc.security.Credentials} credentials
 * @param {ozpIwc.security.Subject} [preAuthenticatedSubject] The pre-authenticated
 *   subject that is presenting these credentials.
 *
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
/**
 * @submodule bus.security
 */

/** @typedef {String} ozpIwc.security.Role */
/** @typedef {String} ozpIwc.security.Permission */
/** @typedef { ozpIwc.security.Role[] } ozpIwc.security.Subject */
/** 
 * @typedef {object} ozpIwc.security.Actor 
 * @property {ozpIwc.security.Subject} securityAttributes
 */


/** 
 * A simple Attribute-Based Access Control implementation
 * @todo Permissions are local to each peer.  Does this need to be synced?
 * 
 * @class BasicAuthorization
 * @constructor
 *
 * @namespace ozpIwc
 */
ozpIwc.BasicAuthorization=function(config) {
    config=config || {};

    /**
     * @property roles
     * @type Object
     */
	this.roles={};

    /**
     * @property policies
     * @type {auth.policies|*|*[]|ozpIwc.BasicAuthorization.policies|BasicAuthorization.policies}
     */
    this.policies= config.policies || [
//        ozpIwc.abacPolicies.permitAll
        ozpIwc.abacPolicies.permitWhenObjectHasNoAttributes,
        ozpIwc.abacPolicies.subjectHasAllObjectAttributes
    ];

    var self = this;
    ozpIwc.metrics.gauge('security.authorization.roles').set(function() {
        return self.getRoleCount();
    });
};
/**
 * Returns the number of roles currently defined.
 *
 * @method getRoleCount
 *
 * @returns {Number} the number of roles defined
 */
ozpIwc.BasicAuthorization.prototype.getRoleCount=function() {
    if (!this.roles || !Object.keys(this.roles)) {
        return 0;
    }
    return Object.keys(this.roles).length;
};

/**
 *
 * @method implies
 * @param {Array} subjectVal
 * @param {Array} objectVal
 *
 * @returns {Boolean}
 */
ozpIwc.BasicAuthorization.prototype.implies=function(subjectVal,objectVal) {
    // no object value is trivially true
    if(objectVal===undefined || objectVal === null) {
        return true;
    }
    // no subject value when there is an object value is trivially false
    if(subjectVal===undefined || subjectVal === null) {
        return false;
    }
    
    // convert both to arrays, if necessary
    subjectVal=Array.isArray(subjectVal)?subjectVal:[subjectVal];
    objectVal=Array.isArray(objectVal)?objectVal:[objectVal];

    // confirm that every element in objectVal is also in subjectVal
    return ozpIwc.util.arrayContainsAll(subjectVal,objectVal);
};


/**
 * Confirms that the subject has all of the permissions requested.
 *
 * @method isPermitted
 * @param {object} request
 *
 * @returns {ozpIwc.AsyncAction}
 */
ozpIwc.BasicAuthorization.prototype.isPermitted=function(request) {
	var action=new ozpIwc.AsyncAction();
	
    var result=this.policies.some(function(policy) {
        return policy.call(this,request)==="permit";
    },this);
    
    
    if(result) {
        return action.resolve("success");
    } else {
		return action.resolve('failure');
    }
};


/**
 * The instantiated authorization object.
 * @type {ozpIwc.BasicAuthorization}
 * @todo Should this be with defaultWiring?
 */
ozpIwc.authorization=new ozpIwc.BasicAuthorization();
/** @namespace **/
var ozpIwc = ozpIwc || {};


/**
 * Classes related to security aspects of the IWC.
 * @module bus
 * @submodule bus.network
 */

/**
 * <p>This link connects peers using the HTML5 localstorage API.  It is a second generation version of
 * the localStorageLink that bypasses most of the garbage collection issues.
 *
 * <p> When a packet is sent, this link turns it to a string, creates a key with that value, and
 * immediately deletes it.  This still sends the storage event containing the packet as the key.
 * This completely eliminates the need to garbage collect the localstorage space, with the associated
 * mutex contention and full-buffer issues.
 *
 * @todo Compress the key
 *
 * @class KeyBroadcastLocalStorageLink
 * @namespace ozpIwc
 * @constructor
 *
 * @param {Object} [config] Configuration for this link
 * @param {ozpIwc.Peer} [config.peer=ozpIwc.defaultPeer] The peer to connect to.
 * @param {String} [config.prefix='ozpIwc'] Namespace for communicating, must be the same for all peers on the same network.
 * @param {String} [config.selfId] Unique name within the peer network.  Defaults to the peer id.
 * @param {Number} [config.maxRetries] Number of times packet transmission will retry if failed. Defaults to 6.
 * @param {Number} [config.queueSize] Number of packets allowed to be queued at one time. Defaults to 1024.
 * @param {Number} [config.fragmentSize] Size in bytes of which any TransportPacket exceeds will be sent in FragmentPackets.
 * @param {Number} [config.fragmentTime] Time in milliseconds after a fragment is received and additional expected
 * fragments are not received that the message is dropped.
 */
ozpIwc.KeyBroadcastLocalStorageLink = function (config) {
    config = config || {};

    /**
     * Namespace for communicating, must be the same for all peers on the same network.
     * @property prefix
     * @type String
     * @default "ozpIwc"
     */
    this.prefix = config.prefix || 'ozpIwc';

    /**
     * The peer this link will connect to.
     * @property peer
     * @type ozpIwc.Peer
     * @default ozpIwc.defaultPeer
     */
    this.peer = config.peer || ozpIwc.defaultPeer;

    /**
     * Unique name within the peer network.  Defaults to the peer id.
     * @property selfId
     * @type String
     * @default ozpIwc.defaultPeer.selfId
     */
    this.selfId = config.selfId || this.peer.selfId;

    /**
     * Milliseconds to wait before deleting this link's keys
     * @todo UNUSUED
     * @property myKeysTimeout
     * @type Number
     * @default 5000
     */
    this.myKeysTimeout = config.myKeysTimeout || 5000; // 5 seconds

    /**
     * Milliseconds to wait before deleting other link's keys
     * @todo UNUSUED
     * @property otherKeysTimeout
     * @type Number
     * @default 120000
     */
    this.otherKeysTimeout = config.otherKeysTimeout || 2 * 60000; // 2 minutes


    /**
     * The maximum number of retries the link will take to send a package. A timeout of
     * max(1, 2^( <retry count> -1) - 1) milliseconds occurs between send attempts.
     * @property maxRetries
     * @type Number
     * @default 6
     */
    this.maxRetries = config.maxRetries || 6;

    /**
     * Maximum number of packets that can be in the send queue at any given time.
     * @property queueSize
     * @type Number
     * @default 1024
     */
    this.queueSize = config.queueSize || 1024;

    /**
     * A queue for outgoing packets. If this queue is full further packets will not be added.
     * @property sendQueue
     * @type Array[]
     * @default []
     */
    this.sendQueue = this.sendQueue || [];

    /**
     * An array of temporarily held received packet fragments indexed by their message key.
     * @type Array[]
     * @default []
     */
    this.fragments = this.fragments || [];

    /**
     * Minimum size in bytes that a packet will broken into fragments.
     * @property fragmentSize
     * @type Number
     * @default 1310720
     */
    this.fragmentSize = config.fragmentSize || (5 * 1024 * 1024) / 2 / 2; //50% of 5mb, divide by 2 for utf-16 characters

    /**
     * The amount of time allotted to the Link to wait between expected fragment packets. If an expected fragment
     * is not received within this timeout the packet is dropped.
     * @property fragmentTimeout
     * @type Number
     * @default 1000
     */
    this.fragmentTimeout = config.fragmentTimeout || 1000; // 1 second

    //Add fragmenting capabilities
    String.prototype.chunk = function (size) {
        var res = [];
        for (var i = 0; i < this.length; i += size) {
            res.push(this.slice(i, i + size));
        }
        return res;
    };

    // Hook into the system
    var self = this;
    var packet;
    var receiveStorageEvent = function (event) {
        try {
            packet = JSON.parse(event.key);
        } catch (e) {
            ozpIwc.log.log("Parse error on " + event.key);
            ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.parseError').inc();
            return;
        }
        if (packet.data.fragment) {
            self.handleFragment(packet);
        } else {
            self.peer.receive(self.linkId, packet);
            ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.received').inc();
        }
    };
    window.addEventListener('storage', receiveStorageEvent, false);

    this.peer.on("send", function (event) {
        self.send(event.packet);
    });

    this.peer.on("beforeShutdown", function () {
        window.removeEventListener('storage', receiveStorageEvent);
    }, this);

};

/**
 * Handles fragmented packets received from the router. When all fragments of a message have been received,
 * the resulting packet will be passed on to the
 * {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/peer:property"}}registered peer{{/crossLink}}.
 *
 * @method handleFragment
 * @param {ozpIwc.NetworkPacket} packet NetworkPacket containing an ozpIwc.FragmentPacket as its data property
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.handleFragment = function (packet) {
    // Check to make sure the packet is a fragment and we haven't seen it
    if (this.peer.haveSeen(packet)) {
        return;
    }

    var key = packet.data.msgId;

    this.storeFragment(packet);

    var defragmentedPacket = this.defragmentPacket(this.fragments[key]);

    if (defragmentedPacket) {

        // clear the fragment timeout
        window.clearTimeout(this.fragments[key].fragmentTimer);

        // Remove the last sequence from the known packets to reuse it for the defragmented packet
        var packetIndex = this.peer.packetsSeen[defragmentedPacket.srcPeer].indexOf(defragmentedPacket.sequence);
        delete this.peer.packetsSeen[defragmentedPacket.srcPeer][packetIndex];

        this.peer.receive(this.linkId, defragmentedPacket);
        ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.received').inc();

        delete this.fragments[key];
    }
};

/**
 *  Stores a received fragment. When the first fragment of a message is received, a timer is set to destroy the storage
 *  of the message fragments should not all messages be received.
 *
 * @method storeFragment
 * @param {ozpIwc.NetworkPacket} packet NetworkPacket containing an {{#crossLink "ozpIwc.FragmentPacket"}}{{/crossLink}} as its data property
 *
 * @returns {Boolean} result true if successful.
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.storeFragment = function (packet) {
    if (!packet.data.fragment) {
        return null;
    }

    // NetworkPacket properties
    var sequence = packet.sequence;
    var srcPeer = packet.srcPeer;
    // FragmentPacket Properties
    var key = packet.data.msgId;
    var id = packet.data.id;
    var chunk = packet.data.chunk;
    var total = packet.data.total;

    if (key === undefined || id === undefined) {
        return null;
    }

    // If this is the first fragment of a message, add the storage object
    if (!this.fragments[key]) {
        this.fragments[key] = {};
        this.fragments[key].chunks = [];

        var self = this;
        self.key = key;
        self.total = total ;

        // Add a timeout to destroy the fragment should the whole message not be received.
        this.fragments[key].timeoutFunc = function () {
            ozpIwc.metrics.counter('network.packets.dropped').inc();
            ozpIwc.metrics.counter('network.fragments.dropped').inc(self.total );
            delete self.fragments[self.key];
        };
    }

    // Restart the fragment drop countdown
    window.clearTimeout(this.fragments[key].fragmentTimer);
    this.fragments[key].fragmentTimer = window.setTimeout(this.fragments[key].timeoutFunc, this.fragmentTimeout);

    // keep a copy of properties needed for defragmenting, the last sequence & srcPeer received will be
    // reused in the defragmented packet
    this.fragments[key].total = total || this.fragments[key].total ;
    this.fragments[key].sequence = (sequence !== undefined) ? sequence : this.fragments[key].sequence;
    this.fragments[key].srcPeer = srcPeer || this.fragments[key].srcPeer;
    this.fragments[key].chunks[id] = chunk;

    // If the necessary properties for defragmenting aren't set the storage fails
    if (this.fragments[key].total === undefined || this.fragments[key].sequence === undefined ||
        this.fragments[key].srcPeer === undefined) {
        return null;
    } else {
        ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.fragments.received').inc();
        return true;
    }
};

/**
 * Rebuilds the original packet sent across the keyBroadcastLocalStorageLink from the fragments it was broken up into.
 *
 * @method defragmentPacket
 * @param {ozpIwc.FragmentStore} fragments the grouping of fragments to reconstruct
 *
 * @returns {ozpIwc.NetworkPacket} result the reconstructed NetworkPacket with TransportPacket as its data property.
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.defragmentPacket = function (fragments) {
    if (fragments.total !== fragments.chunks.length) {
        return null;
    }
    try {
        var result = JSON.parse(fragments.chunks.join(''));
        return {
            defragmented: true,
            sequence: fragments.sequence,
            srcPeer: fragments.srcPeer,
            data: result
        };
    } catch (e) {
        return null;
    }
};

/**
 * Publishes a packet to other peers. If the sendQueue is full the send will not occur. If the TransportPacket is larger
 * than the {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/fragmentSize:property"}}{{/crossLink}}, an
 * {{#crossLink "ozpIwc.FragmentPacket"}}{{/crossLink}} will be sent instead.
 *
 * @method send
 * @param {ozpIwc.NetworkPacket} packet
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.send = function (packet) {
    var str = JSON.stringify(packet.data);

    if (str.length < this.fragmentSize) {
        this.queueSend(packet);
    } else {
        var fragments = str.chunk(this.fragmentSize);

        // Use the original packet as a template, delete the data and
        // generate new packets.
        var self = this;
        self.data= packet.data;
        delete packet.data;

        var fragmentGen = function (chunk, template) {

            template.sequence = self.peer.sequenceCounter++;
            template.data = {
                fragment: true,
                msgId: self.data.msgId,
                id: i,
                total: fragments.length,
                chunk: chunk
            };
            return template;
        };

        // Generate & queue the fragments
        for (var i = 0; i < fragments.length; i++) {
            this.queueSend(fragmentGen(fragments[i], packet));
        }
    }
};

/**
 * Places a packet in the {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/sendQueue:property"}}{{/crossLink}}
 * if it does not already hold {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/queueSize:property"}}{{/crossLink}}
 * amount of packets.
 *
 * @method queueSend
 * @param packet
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.queueSend = function (packet) {
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
 * Recursively tries sending the packet
 * {{#crossLink "ozpIwc.KeyBroadcastLocalStorageLink/maxRetries:property"}}{{/crossLink}} times.
 * The packet is dropped and the send fails after reaching max attempts.
 *
 * @method attemptSend
 * @param {ozpIwc.NetworkPacket} packet
 * @param {Number} [attemptCount] number of times attempted to send packet.
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.attemptSend = function (packet, retryCount) {

    var sendStatus = this.sendImpl(packet);
    if (sendStatus) {
        var self = this;
        retryCount = retryCount || 0;
        var timeOut = Math.max(1, Math.pow(2, (retryCount - 1))) - 1;

        if (retryCount < self.maxRetries) {
            retryCount++;
            // Call again but back off for an exponential amount of time.
            window.setTimeout(function () {
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
 * Implementation of publishing packets to peers through localStorage. If the localStorage is full or a write collision
 * occurs, the send will not occur. Returns status of localStorage write, null if success.
 *
 * @todo move counter.inc() out of the impl and handle in attemptSend?
 * @method sendImpl
 * @param {ozpIwc.NetworkPacket} packet
 */
ozpIwc.KeyBroadcastLocalStorageLink.prototype.sendImpl = function (packet) {
    var sendStatus;
    try {
        var p = JSON.stringify(packet);
        localStorage.setItem(p, "");
        ozpIwc.metrics.counter('links.keyBroadcastLocalStorage.packets.sent').inc();
        localStorage.removeItem(p);
        sendStatus = null;
    }
    catch (e) {
        if(e.message === "localStorage is null"){
            // Firefox about:config dom.storage.enabled = false : no mitigation with current links
            ozpIwc.util.alert("Cannot locate localStorage. Contact your system administrator.", e);
        } else if(e.code === 18){
            // cookies disabled : no mitigation with current links
            ozpIwc.util.alert("Ozone requires your browser to accept cookies. Contact your system administrator.", e);
        } else {
            // If the error can't be mitigated, bubble it up
            sendStatus = e;
        }
    }
    finally {
        return sendStatus;
    }
};

/** @namespace **/
var ozpIwc = ozpIwc || {};
/**
 * @submodule bus.network
 */

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
 * @class LocalStorageLink
 * @namespace ozpIwc
 * @param {Object} [config] - Configuration for this link
 * @param {ozpIwc.Peer} [config.peer=ozpIwc.defaultPeer] - The peer to connect to.
 * @param {Number} [config.myKeysTimeout=5000] - Milliseconds to wait before deleting this link's keys.
 * @param {Number} [config.otherKeysTimeout=120000] - Milliseconds to wait before cleaning up other link's keys
 * @param {String} [config.prefix='ozpIwc'] - Namespace for communicating, must be the same for all peers on the same network.
 * @param {String} [config.selfId] - Unique name within the peer network.  Defaults to the peer id.
 */
ozpIwc.LocalStorageLink = function(config) {
	config=config || {};


    /**
     * Namespace for communicating, must be the same for all peers on the same network.
     * @property prefix
     * @type String
     * @default "ozpIwc"
     */
	this.prefix=config.prefix || 'ozpIwc';

    /**
     * The peer this link will connect to.
     * @property peer
     * @type ozpIwc.Peer
     * @default ozpIwc.defaultPeer
     */
	this.peer=config.peer || ozpIwc.defaultPeer;

    /**
     * Unique name within the peer network.  Defaults to the peer id.
     * @property selfId
     * @type String
     * @default ozpIwc.defaultPeer.selfId
     */
	this.selfId=config.selfId || this.peer.selfId;


    /**
     * Milliseconds to wait before deleting this link's keys
     * @property myKeysTimeout
     * @type Number
     * @default 5000
     */
	this.myKeysTimeout = config.myKeysTimeout || 5000; // 5 seconds

    /**
     * Milliseconds to wait before deleting other link's keys
     * @todo UNUSUED
     * @property otherKeysTimeout
     * @type Number
     * @default 120000
     */
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
		}
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
 *
 * @method makeKey
 *
 * @returns {string} a new key
 */
ozpIwc.LocalStorageLink.prototype.makeKey=function(sequence) { 
	return [this.prefix,this.selfId,ozpIwc.util.now(),sequence].join('|');
};

/**
 * If it's a key for a buffered message, split it into the id of the 
 * link that put it here and the time it was created at.
 *
 * @method splitKey
 * @param {String} k The key to split
 *
 * @returns {Object} The id and createdAt for the key if it's valid, otherwise null.
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
 *
 * @method cleanKeys
 */
ozpIwc.LocalStorageLink.prototype.cleanKeys=function() {
	var now=ozpIwc.util.now();
	var myKeyExpiration = now - this.myKeysTimeout;
	var otherKeyExpiration = now - this.otherKeysTimeout;

	for(var i=0; i < localStorage.length;++i) {
		var keyName=localStorage.key(i);
		var k=this.splitKey(keyName);
		if(k) {
			if((k.id===this.selfId && k.createdAt <= myKeyExpiration) ||
					(k.createdAt <= otherKeyExpiration)) {
				localStorage.removeItem(keyName);
			}				
		}
	}


};
/**
 * Publishes a packet to other peers.
 * @todo Handle local storage being full.
 *
 * @method send
 * @param {ozpIwc.NetworkPacket} packet
 */
ozpIwc.LocalStorageLink.prototype.send=function(packet) { 
	localStorage.setItem(this.makeKey(packet.sequence),JSON.stringify(packet));
	ozpIwc.metrics.counter('links.localStorage.packets.sent').inc();
};



/**
 * The peer handles low-level broadcast communications between multiple browser contexts.
 * Links do the actual work of moving the packet to other browser contexts.  The links
 * call {{#crossLink "ozpIwc.Peer/receive:method"}}{{/crossLink}} when they need to deliver a packet to this peer and
 * hook the {{#crossLink "ozpIwc.Peer/send:method"}}{{/crossLink}} event in order to send packets.
 * @class Peer
 * @namespace ozpIwc
 * @constructor
 * @mixin ozpIwc.Events
 */
ozpIwc.Peer=function() {


    /**
     * A generated random 4 byte id
     * @property selfId
     * @type String
     * @default {{#crossLink "ozpIwc.util/generateId:method"}}{{/crossLink}}
     */
    this.selfId=ozpIwc.util.generateId();

    /**
     * @TODO (DOC)
     * @property sequenceCounter
     * @type Number
     * @default 0
     */
    this.sequenceCounter=0;

    /**
     * A history of packets seen from each peer. Each key is a peer name, each value is an array of the last 50 packet
     * ids seen.
     * @property packetsSeen
     * @type Object
     * @default {}
     */
    this.packetsSeen={};

    /**
     * @property knownPeers
     * @type Object
     * @default {}
     */
    this.knownPeers={};

    /**
     * Eventing module for the Peer.
     * @property events
     * @type ozpIwc.Event
     * @default ozpIwc.Event
     */
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
 * The peer has received a packet from other peers.
 * @event #receive
 *
 * @param {ozpIwc.NetworkPacket} packet
 * @param {String} linkId
 */


/**
 * A cancelable event that allows listeners to override the forwarding of
 * a given packet to other peers.
 * @event #preSend
 * @extends ozpIwc.CancelableEvent
 *
 * @param {ozpIwc.NetworkPacket} packet
 */

/**
 * Notifies that a packet is being sent to other peers.  Links should use this
 * event to forward packets to other peers.
 * @event #send
 *
 * @param {ozpIwc.NetworkPacket} packet
 */

/**
 * Fires when the peer is being explicitly or implicitly shut down.
 * @event #beforeShutdown
 */

/**
 * Number of sequence Id's held in an entry of {{#crossLink "ozpIwc.Peer/packetsSeen:property"}}{{/crossLink}}
 * @property maxSeqIdPerSource
 * @static
 * @type Number
 * @default 500
 */
ozpIwc.Peer.maxSeqIdPerSource=500;

/**
 * Determine if the peer has already seen the packet in question.
 *
 * @method haveSeen
 * @param {ozpIwc.NetworkPacket} packet
 *
 * @returns {Boolean}
 */
ozpIwc.Peer.prototype.haveSeen=function(packet) {
    // don't forward our own packets
    if (packet.srcPeer === this.selfId) {
        ozpIwc.metrics.counter('network.packets.droppedOwnPacket').inc();
        return true;
    }
    var seen = this.packetsSeen[packet.srcPeer];
    if (!seen) {
        seen = this.packetsSeen[packet.srcPeer] = [];
    }

    // abort if we've seen the packet before
    if (seen.indexOf(packet.sequence) >= 0) {
        return true;
    }

    //remove oldest array members when truncate needed
    seen.unshift(packet.sequence);
    if (seen.length >= ozpIwc.Peer.maxSeqIdPerSource) {
        seen.length = ozpIwc.Peer.maxSeqIdPerSource;
    }
    return false;
};

/**
 * Used by routers to broadcast a packet to network.
 *
 * Fires:
 *   - {{#crossLink "ozpIwc.Peer/#preSend:event"}}{{/crossLink}}
 *   - {{#crossLink "ozpIwc.Peer/#send:event"}}{{/crossLink}}
 *
 * @method send
 * @param {ozpIwc.NetworkPacket} packet
 */
ozpIwc.Peer.prototype.send= function(packet) {
    var networkPacket={
        srcPeer: this.selfId,
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
 * Called by the links when a new packet is received.
 *
 * Fires:
 *   - {{#crossLink "ozpIwc.Peer/#receive:event"}}{{/crossLink}}
 *
 * @method receive
 * @param {String} linkId
 * @param {ozpIwc.NetworkPacket} packet
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
 *
 * Fires:
 *   - {{#crossLink "ozpIwc.Peer/#receive:event"}}{{/crossLink}}
 *
 * @method shutdown
 */
ozpIwc.Peer.prototype.shutdown=function() {
    this.events.trigger("beforeShutdown");
    window.removeEventListener('beforeunload',this.unloadListener);
};


/**
 * Various packet definitions for the network aspects of the IWC. These are not instantiable, rather guidelines for
 * conforming to classes that use them.
 * @module bus.network
 * @submodule bus.network.packets
 */

/**
 * Network Packets
 * @class NetworkPacket
 * @namespace ozpIwc
 */

/**
 * The id of the peer who broadcast this packet.
 * @property srcPeer
 * @type String
 */

/**
 * A monotonically increasing, unique identifier for this packet.
 * @property sequence
 * @type String
 */

/**
 * The payload of this packet.
 * @property data
 * @type Object
 */


/**
 * Packet format for the data property of ozpIwc.NetworkPacket when working with fragmented packets.
 * @class FragmentPacket
 * @namespace ozpIwc
 */

/**
 * Flag for knowing this is a fragment packet. Should be true.
 * @property fragment
 * @type boolean
 */

/**
 * The msgId from the TransportPacket broken up into fragments.
 * @property msgId
 * @type Number
 */

/**
 * The position amongst other fragments of the TransportPacket.
 * @property id
 * @type Number
 */

/**
 * Total number of fragments of the TransportPacket expected.
 * @property total
 * @type Number
 */

/**
 * A segment of the TransportPacket in string form.
 * @property chunk
 * @type String
 */

/**
 * Storage for Fragment Packets
 * @class ozpIwc.FragmentStore
 */

/**
 *  The sequence of the latest fragment received.
 * @property sequence
 * @type Number
 */

/**
 * The total number of fragments expected.
 * @property total
 * @type Number
 */

/**
 * The srcPeer of the fragments expected.
 * @property srcPeer
 * @type String
 */

/**
 * String segments of the TransportPacket.
 * @property chunks
 * @type Array[String]
 */

var ozpIwc=ozpIwc || {};

/**
 * @submodule bus.transport
 */

/**
 * @class Participant
 * @namespace ozpIwc
 * @constructor
 * @mixes ozpIwc.security.Actor
 * @property {String} address The assigned address to this address.
 * @property {ozpIwc.security.Subject} securityAttributes The security attributes for this participant.
 */
ozpIwc.Participant=function() {


    /**
     * An events module for the participant.
     * @property events
     * @type Event
     */
    this.events=new ozpIwc.Event();
	this.events.mixinOnOff(this);

    /**
     * A key value store of the security attributes assigned to the participant.
     * @property securityAttributes
     * @type Object
     * @default {}
     */
	this.securityAttributes={};

    /**
     * The message id assigned to the next packet if a packet msgId is not specified.
     * @property msgId
     * @type {Number}
     */
    this.msgId=0;
    var fakeMeter=new ozpIwc.metricTypes.Meter();

    /**
     * A Metrics meter for packets sent from the participant.
     * @property sentPacketsmeter
     * @type ozpIwc.metricTypes.Meter
     */
    this.sentPacketsMeter=fakeMeter;

    /**
     * A Metrics meter for packets received by the participant.
     * @property receivedPacketMeter
     * @type ozpIwc.metricTypes.Meter
     */
    this.receivedPacketsMeter=fakeMeter;

    /**
     * A Metrics meter for packets sent to the participant that did not pass authorization.
     * @property forbiddenPacketMeter
     * @type ozpIwc.metricTypes.Meter
     */
    this.forbiddenPacketsMeter=fakeMeter;

    /**
     * The type of the participant.
     * @property participantType
     * @type String
     */
    this.participantType=this.constructor.name;

    /**
     * Content type for the Participant's heartbeat status packets.
     * @property heartBeatContentType
     * @type String
     * @default "application/vnd.ozp-iwc-address-v1+json"
     */
    this.heartBeatContentType="application/vnd.ozp-iwc-address-v1+json";

    /**
     * The heartbeat status packet of the participant.
     * @property heartBeatStatus
     * @type Object
     */
    this.heartBeatStatus={
        name: this.name,
        type: this.participantType || this.constructor.name
    };


    // Handle leaving Event Channel
    var self=this;
    window.addEventListener("beforeunload",function() {
        // Unload events can't use setTimeout's. Therefore make all sending happen with normal execution
        self.send = function(originalPacket,callback) {
            var packet=this.fixPacket(originalPacket);
            if(callback) {
                this.replyCallbacks[packet.msgId]=callback;
            }
            ozpIwc.Participant.prototype.send.call(this,packet);

            return packet;
        };
        self.leaveEventChannel();
    });
};

/**
 * Processes packets sent from the router to the participant. If a packet does not pass authorization it is marked
 * forbidden.
 *
 * @method receiveFromRouter
 * @param {ozpIwc.PacketContext} packetContext
 * @returns {Boolean} true if this packet could have additional recipients
 */
ozpIwc.Participant.prototype.receiveFromRouter=function(packetContext) {
    var self = this;
    ozpIwc.authorization.isPermitted({
        'subject': this.securityAttributes,
        'object': packetContext.packet.permissions
    })
        .success(function(){
            self.receivedPacketsMeter.mark();

            self.receiveFromRouterImpl(packetContext);
        })
        .failure(function() {
            /** @todo do we send a "denied" message to the destination?  drop?  who knows? */
            self.forbiddenPacketsMeter.mark();
        });
};

/**
 * Overridden by inherited Participants.
 *
 * @override
 * @method receiveFromRouterImple
 * @param packetContext
 * @returns {Boolean}
 */
ozpIwc.Participant.prototype.receiveFromRouterImpl = function (packetContext) {
    // doesn't really do anything other than return a bool and prevent "unused param" warnings
    return !packetContext;
};

/**
 * Connects the participant to a given router.
 *
 * Fires:
 *     - {{#crossLink "ozpIwc.Participant/#connectedToRouter:event"}}{{/crossLink}}
 *
 * @method connectToRouter
 * @param {ozpIwc.Router} router The router to connect to
 * @param {String} address The address to assign to the participant.
 */
ozpIwc.Participant.prototype.connectToRouter=function(router,address) {
    this.address=address;
    this.router=router;
    this.securityAttributes.rawAddress=address;
    this.msgId=0;
    this.metricRoot="participants."+ this.address.split(".").reverse().join(".");
    this.sentPacketsMeter=ozpIwc.metrics.meter(this.metricRoot,"sentPackets").unit("packets");
    this.receivedPacketsMeter=ozpIwc.metrics.meter(this.metricRoot,"receivedPackets").unit("packets");
    this.forbiddenPacketsMeter=ozpIwc.metrics.meter(this.metricRoot,"forbiddenPackets").unit("packets");
    
    this.namesResource="/address/"+this.address;
    this.heartBeatStatus.address=this.address;
    this.heartBeatStatus.name=this.name;
    this.heartBeatStatus.type=this.participantType || this.constructor.name;
    this.joinEventChannel();
    this.events.trigger("connectedToRouter");
};

/**
 * Populates fields relevant to this packet if they aren't already set:
 * src, ver, msgId, and time.
 *
 * @method fixPacket
 * @param {ozpIwc.TransportPacket} packet
 *
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.Participant.prototype.fixPacket=function(packet) {
    // clean up the packet a bit on behalf of the sender
    packet.src=packet.src || this.address;
    packet.ver = packet.ver || 1;

    // if the packet doesn't have a msgId, generate one
    packet.msgId = packet.msgId || this.generateMsgId();

    // might as well be helpful and set the time, too
    packet.time = packet.time || ozpIwc.util.now();
    return packet;
};

/**
 * Sends a packet to this participants router.  Calls fixPacket
 * before doing so.
 *
 * @method send
 * @param {ozpIwc.TransportPacket} packet
 *
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.Participant.prototype.send=function(packet) {
    packet=this.fixPacket(packet);
    this.sentPacketsMeter.mark();
    this.router.send(packet,this);
    return packet;
};

/**
 * Creates a message id for a packet by iterating {{#crossLink "ozpIwc.Participant.msgId"}}{{/crossLink}}
 *
 * @method generateMsgId
 * @returns {string}
 */
ozpIwc.Participant.prototype.generateMsgId=function() {
    return "i:" + this.msgId++;
};

/**
 * Sends a heartbeat packet to Participant's router.
 *
 * @method heartbeat
 */
ozpIwc.Participant.prototype.heartbeat=function() {
    if(this.router) {
        this.send({
            'dst': "names.api",
            'resource': this.namesResource,
            'action' : "set",
            'entity' : this.heartBeatStatus,
            'contentType' : this.heartBeatContentType
        },function() {/* eat the response*/});
    }
};

/**
 * Adds this participant to the $bus.multicast multicast group.
 *
 * @method joinEventChannel
 * @returns {boolean}
 */
ozpIwc.Participant.prototype.joinEventChannel = function() {
    if(this.router) {
        this.router.registerMulticast(this, ["$bus.multicast"]);
        this.send({
            dst: "$bus.multicast",
            action: "connect",
            entity: {
                address: this.address,
                participantType: this.participantType
            }
        });
        return true;
    } else {
        return false;
    }
};

/**
 * Remove this participant from the $bus.multicast multicast group.
 *
 * @method leaveEventChannel
 */
ozpIwc.Participant.prototype.leaveEventChannel = function() {
    if(this.router) {
        this.send({
            dst: "$bus.multicast",
            action: "disconnect",
            entity: {
                address: this.address,
                participantType: this.participantType,
                namesResource: this.namesResource
            }
        });
        //TODO not implemented
//        this.router.unregisterMulticast(this, ["$bus.multicast"]);
        return true;
    } else {
        return false;
    }

};
/**
 * Classes related to transport aspects of the IWC.
 * @module bus
 * @submodule bus.transport
 */

/**
 * @class InternalParticipant
 * @namespace ozpIwc
 * @constructor
 * @extends ozpIwc.Participant
 * @param {Object} config
 * @param {String} config.name The name of the participant.
 */
ozpIwc.InternalParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(config) {
    config=config || {};
	ozpIwc.Participant.apply(this,arguments);
    /**
     * @property replyCallbacks
     * @type {Object}
     */
	this.replyCallbacks={};

    /**
     * The type of the participant.
     * @property participantType
     * @type {String}
     * @default "internal"
     */
	this.participantType="internal";

    /**
     * The name of the participant.
     * @property name
     * @type {String}
     * @default ""
     */
	this.name=config.name;

    var self = this;
    this.on("connectedToRouter",function() {
        ozpIwc.metrics.gauge(self.metricRoot,"registeredCallbacks").set(function() {
            return self.getCallbackCount();
        });
    });
});

/**
 * Gets the count of the registered reply callbacks.
 *
 * @method getCallbackCount
 * @returns {Number} The number of registered callbacks.
 */
ozpIwc.InternalParticipant.prototype.getCallbackCount=function() {
    if (!this.replyCallbacks || !Object.keys(this.replyCallbacks)) {
        return 0;
    }
    return Object.keys(this.replyCallbacks).length;
};

/**
 * Handles packets received from the {{#crossLink "ozpIwc.Router"}}{{/crossLink}} the participant is registered to.
 *
 * Fires:
 *   - {{#crossLink "ozpIwc.Participant/#receive:event"}}{{/crossLink}}
 *
 * @method receiveFromRouterImpl
 * @param {ozpIwc.TransportPacketContext} packetContext
 *
 * @returns {boolean} true if this packet could have additional recipients
 */
ozpIwc.InternalParticipant.prototype.receiveFromRouterImpl=function(packetContext) {
	var packet=packetContext.packet;
	if(packet.replyTo && this.replyCallbacks[packet.replyTo]) {
        var cancel = false;
        function done() {
            cancel = true;
        }
        this.replyCallbacks[packet.replyTo](packet,done);
		if (cancel) {
            this.cancelCallback(packet.replyTo);
        }
	} else if (packet.dst === "$bus.multicast"){
        this.events.trigger("receiveEventChannelPacket",packetContext);
    } else {
		this.events.trigger("receive",packetContext);
	}
};

/**
 * Sends a packet to this participants router. Uses setImmediate to force messages out in queue order.
 *
 * @method send
 * @param originalPacket
 * @param callback
 *
 * @returns {ozpIwc.TransportPacket|*}
 */
ozpIwc.InternalParticipant.prototype.send=function(originalPacket,callback) {
    var packet=this.fixPacket(originalPacket);
	if(callback) {
		this.replyCallbacks[packet.msgId]=callback;
	}
    var self=this;
	ozpIwc.util.setImmediate(function() {
        ozpIwc.Participant.prototype.send.call(self,packet);
    });

	return packet;
};

/**
 * Cancels the callback corresponding to the given msgId.
 *
 * @method cancelCallback
 * @param {Number} msgId
 *
 * @returns {Boolean} returns true if successful.
 */
ozpIwc.InternalParticipant.prototype.cancelCallback=function(msgId) {
    var success=false;
    if (msgId) {
        delete this.replyCallbacks[msgId];
        success=true;
    }
    return success;
};

var ozpIwc=ozpIwc || {};

/**
 * @submodule bus.transport
 */

/**
 * @class ozpIwc.TransportPacket
 */

/**
 * The participant address that sent this packet.
 * @property src
 * @type String
 */

/**
 * The intended recipient of this packet.
 * @property dst
 * @type String
 */

/**
 * Protocol Version.  Should be 1.
 * @property ver
 * @type Number
 */

/**
 * A unique id for this packet.
 * @property msgId
 * @type Number
 */

/**
 * The payload of this packet.
 * @property entity
 * @type Object
 */

/**
 * Permissions required to see the payload of this packet.
 * @property [permissions]
 * @type Object
 */

/**
 * The time in milliseconds since epoch that this packet was created.
 * @property [time]
 * @type Number
 */

/**
 * Reference to the msgId that this is in reply to.
 * @property [replyTo]
 * @type Number
 */

/**
 * Action to be performed.
 * @property [action]
 * @type String
 */

/**
 * Resource to perform the action upon.
 * @property [resource]
 * @type String
 */

/**
 * Marker for test packets.
 * @property [test]
 * @type Boolean
*/

/**
 * @class TransportPacketContext
 * @namespace ozpIwc
 * @param {Object} config
 * @param {ozpIwc.TransportPacket} config.packet
 * @param {ozpIwc.Router} config.router
 * @param {ozpIwc.Participant} [config.srcParticpant]
 * @param {ozpIwc.Participant} [config.dstParticpant]
 */
ozpIwc.TransportPacketContext=function(config) {
    /**
     * @property packet
     * @type ozpIwc.TransportPacket
     */

    /**
     * @property router
     * @type ozpIwc.Router
     */

    /**
     * @property [srcParticipant]
     * @type ozpIwc.Participant
     */

    /**
     * @property [dstParticipant]
     * @type ozpIwc.Participant
     */
    for(var i in config) {
        this[i]=config[i];
    }
};

/**
 * @method replyTo
 * @param {ozpIwc.TransportPacket} response
 *
 * @returns {ozpIwc.TransportPacket} the packet that was sent
 */
ozpIwc.TransportPacketContext.prototype.replyTo=function(response) {
    var now=new Date().getTime();
    response.ver = response.ver || 1;
    response.time = response.time || now;
    response.replyTo=response.replyTo || this.packet.msgId;
    response.src=response.src || this.packet.dst;
    response.dst=response.dst || this.packet.src;
    if(this.dstParticipant) {
        this.dstParticipant.send(response);
    } else{
        response.msgId = response.msgId || now;
        this.router.send(response);
    }
    return response;
};


/**
 * @class Router
 * @namespace ozpIwc
 * @constructor
 * @param {Object} [config]
 * @param {ozpIwc.Peer} [config.peer=ozpIwc.defaultPeer]
 */
/**
 * @event ozpIwc.Router#preRegisterParticipant
 * @mixes ozpIwc.CancelableEvent
 * @param {ozpIwc.TransportPacket} [packet] - The packet to be delivered
 * @param {object} registration - Information provided by the participant about it's registration
 * @param {ozpIwc.Participant} participant - The participant that will receive the packet
 */

/**
 * @event ozpIwc.Router#preSend
 * @mixes ozpIwc.CancelableEvent
 * @param {ozpIwc.TransportPacket} packet - The packet to be sent
 * @param {ozpIwc.Participant} participant - The participant that sent the packet
 */

/**
 * @event ozpIwc.Router#preDeliver
 * @mixes ozpIwc.CancelableEvent
 * @param {ozpIwc.TransportPacket} packet - The packet to be delivered
 * @param {ozpIwc.Participant} participant - The participant that will receive the packet
 */

/**
 * @event ozpIwc.Router#send
 * @param {ozpIwc.TransportPacket} packet - The packet to be delivered
 */

/**
 * @event ozpIwc.Router#prePeerReceive
 * @mixes ozpIwc.CancelableEvent
 * @param {ozpIwc.TransportPacket} packet
 * @param {ozpIwc.NetworkPacket} rawPacket
 */

ozpIwc.Router=function(config) {
    config=config || {};

    /**
     * @property peer
     * @type ozpIwc.Peer
     */
    this.peer=config.peer || ozpIwc.defaultPeer;

//	this.nobodyAddress="$nobody";
//	this.routerControlAddress='$transport';
	var self=this;

    /**
     * @property selfId
     * @type String
     */
	this.selfId=ozpIwc.util.generateId();
	
    /**
     * A key value store of all participants local to the router.
     * @property participants
     * @type Object
     * @default {}
     */
	this.participants={};
	
	ozpIwc.metrics.gauge("transport.participants").set(function() {
		return Object.keys(self.participants).length;
	});


    /**
     * Eventing module for the router.
     * @property events
     * @type ozpIwc.Event
     * @default ozpIwc.Event
     */
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

    /**
     * @property watchdog
     * @type ozpIwc.RouterWatchdog
     */
	this.watchdog=new ozpIwc.RouterWatchdog({
        router: this,
        heartbeatFrequency: config.heartbeatFrequency
    });
	this.registerParticipant(this.watchdog);

    ozpIwc.metrics.gauge('transport.router.participants').set(function() {
        return self.getParticipantCount();
    });
};

/**
 * Gets the count of participants who have registered with the router.
 * @method getParticipantCount
 *
 * @returns {Number} the number of registered participants
 */
ozpIwc.Router.prototype.getParticipantCount=function() {
    if (!this.participants || !Object.keys(this.participants)) {
        return 0;
    }
    return Object.keys(this.participants).length;

};

/**
 * @method shutdown
 */
ozpIwc.Router.prototype.shutdown=function() {
    this.watchdog.shutdown();
};

/**
 * Allows a listener to add a new participant.
 *
 * Fires:
 *     - {{#crossLink "ozpIwc.Router/#registerParticipant:event"}}{{/crossLink}}
 *
 * @method registerParticipant
 * @param {Object} participant the participant object that contains a send() function.
 * @param {Object} packet The handshake requesting registration.
 *
 * @returns {String} returns participant id
 */
ozpIwc.Router.prototype.registerParticipant=function(participant,packet) {
    packet = packet || {};
    var address;
    do {
        address=ozpIwc.util.generateId()+"."+this.selfId;
    } while(this.participants.hasOwnProperty(address));

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

    this.participants[address] = participant;
    participant.connectToRouter(this,address);
    var registeredEvent=new ozpIwc.CancelableEvent({
        'packet': packet,
        'participant': participant
    });
    this.events.trigger("registeredParticipant",registeredEvent);

//	ozpIwc.log.log("registeredParticipant["+participant_id+"] origin:"+participant.origin);
    return address;
};

/**
 * Fires:
 *     - {{#crossLink "ozpIwc.Router/#preDeliver:event"}}{{/crossLink}}
 *
 * @method deliverLocal
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

    ozpIwc.authorization.isPermitted({
        'subject':localParticipant.securityAttributes,
        'object': packet.permissions,
        'action': {'action': 'receive'}
    })
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
 *
 * Fires:
 *     - {{#crossLink "ozpIwc.Router/#registerMulticast:event"}}{{/crossLink}}
 *
 * @method registerMulticast
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
        if (participant.address) {
            var registeredEvent = new ozpIwc.CancelableEvent({
                'entity': {'group': groupName, 'address': participant.address}
            });
            self.events.trigger("registeredMulticast", registeredEvent);
        } else {
            ozpIwc.log.log("no address for " +  participant.participantType + " " + participant.name + "with address " + participant.address + " for group " + groupName);
        }
        //ozpIwc.log.log("registered " + participant.participantType + " " + participant.name + "with address " + participant.address + " for group " + groupName);
    });
    return multicastGroups;
};

/**
 * Used by participant listeners to route a message to other participants.
 *
 * Fires:
 *     -{{#crossLink "ozpIwc.Router/#preSend:event"}}{{/crossLink}}
 *     -{{#crossLink "ozpIwc.Router/#send:event"}}{{/crossLink}}
 *
 * @method send
 * @param {ozpIwc.TransportPacket} packet The packet to route.
 * @param {ozpIwc.Participant} sendingParticipant Information about the participant that is attempting to send
 * the packet.
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
 * Receive a packet from the peer.
 *
 * Fires:
 *     -{{#crossLink "ozpIwc.Router/#prePeerReceive:event"}}{{/crossLink}}
 *
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
 * @submodule bus.transport
 */

/**
 * Baseclass for APIs that need leader election.  Uses the Bully algorithm for leader election.
 *
 * Implementer is responsible for handling two events:
 *    <li> <b>"becameLeaderEvent"</b> - participant has finished its election process and is to become the leader. Handle
 *    any logic necessary above the LeaderGroupParticipant and then trigger the participant's event <b>"becameLeader"</b>
 *    <i>(ex. participant.events.trigger("becameLeader")</i></li>
 *    <li> <b>"newLeaderEvent"</b> - participant has finished its election process and is to become a member. Handle any logic necessary above
 *    the LeaderGroupParticipant then trigger the participant's event <b>"newLeader"</b>
 *    <i>(ex. participant.events.trigger("newLeader")</i></li>
 *
 * @class LeaderGroupParticipant
 * @namespace ozpIwc
 * @extends ozpIwc.InternalParticipant
 * @constructor
 *
 * @param {Object} config
 * @param {String} config.name
 *        The name of this API.
 * @param {String} [config.electionAddress=config.name+".election"]
 *        The multicast channel for running elections.  
 *        The leader will register to receive multicast on this channel.
 * @param {Number} [config.priority=Math.Random]
 *        How strongly this node feels it should be leader.
 * @param {Function} [config.priorityLessThan]
 *        Function that provides a strict total ordering on the priority.  Default is "<".
 * @param {Number} [config.electionTimeout=250]
 *        Number of milliseconds to wait before declaring victory on an election. 
 * @param {number} [config.electionTimeout=250]
 *        Number of milliseconds to wait before declaring victory on an election.
 * @param {Object} config.states  State machine states the participant will register and react to given their assigned category.
 *        Default states listed are always applied and need not be passed in configuration.
 * @param {Object} [config.states.leader=['leader']]
 *        Any state that the participant should deem itself the leader of its group.
 * @param {Object} [config.states.member=['member']]
 *        Any state that the participant should deem itself a member (not leader) of its group.
 * @param {Object} [config.states.election=['election']]
 *        Any state that the participant should deem itself in an election with its group.
 * @param {Object} [config.states.queueing=['connecting','election']]
 *        Any state that the participant should block non-election messages until not in a queueing state
 */
ozpIwc.LeaderGroupParticipant=ozpIwc.util.extend(ozpIwc.InternalParticipant,function(config) {
	ozpIwc.InternalParticipant.apply(this,arguments);
    config.states = config.states || {};


	if(!config.name) {
		throw "Config must contain a name value";
	}


	// Networking info
    /**
     * The name of the participant.
     * @property name
     * @type String
     * @default ""
     */
	this.name=config.name;

    /**
     * The election address for common LeaderGroupParticipant's on the IWC bus.
     * @property electionAddress
     * @type String
     * @default ".election"
     */
	this.electionAddress=config.electionAddress || (this.name + ".election");


	// Election times and how to score them
    /**
     * A numeric value to determine who the leader of the group should be.
     * @property priority
     * @type Number
     * @default {{#crossLink "ozpIwc.util/now:method"}}-ozpIwc.util.now(){{/crossLink}}
     */
	this.priority = config.priority || ozpIwc.defaultLeaderPriority || -ozpIwc.util.now();

    /**
     * Function to determine the lower value amongst two priorities.
     * @property priorityLessThan
     * @type Function
     * @default function( l, r) { return l < r };
     */
	this.priorityLessThan = config.priorityLessThan || function(l,r) { return l < r; };


    /**
     * How long a participant partakes in an election.
     * @property electionTimeout
     * @type Number
     * @default 250
     */
	this.electionTimeout=config.electionTimeout || 250; // quarter second

    /**
     * The current state of the participant.
     *
     * The leaderGroupParticipant has the following states:
     *   - connecting
     *   - queueing
     *   - election
     *   - leader
     *   - member
     *
     * @property leaderState
     * @type String
     * @default "connecting"
     */
	this.leaderState="connecting";

    /**
     * Packets received from the router that are not pertinent to the election. They will be processed post election
     * if this participant becomes the leader.
     * @property electionQueue
     * @type ozpIwc.NetworkPacket[]
     * @default []
     */
	this.electionQueue=[];

    /**
     * A registry of sub-states of the Election State Machine. While leaderGroupParticipant operates on states "leader",
     * "member", "queueing", and "election", it can fire events for those states should a substate change.
     * @property states
     * @type {states|*|Object|{}}
     */
    this.states = config.states;

    /**
     * Leader sub-states of the State Machine.
     * @property states.leader
     * @type {String[]}
     * @default ["leader"]
     */
    this.states.leader = this.states.leader || [];
    this.states.leader = this.states.leader.concat(["leader"]);

    /**
     * Member sub-states of the State Machine.
     * @property states.member
     * @type {String[]}
     * @default ["member"]
     */
    this.states.member = this.states.member || [];
    this.states.member = this.states.member.concat(["member"]);

    /**
     * Election sub-states of the State Machine.
     * @property states.election
     * @type {String[]}
     * @default ["election"]
     */
    this.states.election = this.states.election || [];
    this.states.election = this.states.election.concat(["election"]);

    /**
     * Queueing sub-states of the State Machine.
     * @property states.queueing
     * @type {String[]}
     * @default ["connecting", "election"]
     */
    this.states.queueing = this.states.queueing || [];
    this.states.queueing = this.states.queueing.concat(["connecting", "election"]);

    /**
     * A snapshot of the current active states of the participant.
     * @propery activeStates
     * @type {Object}
     */
    this.activeStates = config.activeStates || {
        'leader': false,
        'member': false,
        'election': false,
        'queueing': true
    };

    this.changeState("connecting");


	// tracking the current leader
    /**
     * The address of the current leader.
     * @property leader
     * @type String
     * @default null
     */
	this.leader=null;

    /**
     * The priority of the current leader.
     * @property leaderPriority
     * @type Number
     * @default null
     */
	this.leaderPriority=null;

    /**
     * The type of the participant.
     * @property participantType
     * @type String
     * @default "leaderGroup"
     */
	this.participantType="leaderGroup";

    /**
     * The name of the participant.
     * @property name
     * @type String
     * @default ""
     */
	this.name=config.name;


    /**
     * An internal flag used to debounce invalid leadership attempts due to high network traffic.
     * @property toggleDrop
     * @type Boolean
     * @default false
     */
    this.toggleDrop = false;

    /**
     * Fires when the participant enters an election.
     * @event #startElection
     */
	this.on("startElection",function() {
        this.toggleDrop = false;
	},this);

    /**
     * Fires when this participant becomes the leader.
     * @event #becameLeader
     *
     */
	this.on("becameLeader",function() {
        this.leader = this.address;
        this.leaderPriority = this.priority;
		this.electionQueue.forEach(function(p) {
			this.forwardToTarget(p);
		},this);
		this.electionQueue=[];
	},this);

    /**
     * Fires when a leader has been assigned and this participant is not it.
     * @event #newLeader
     */
	this.on("newLeader",function() {
		this.electionQueue=[];
	},this);



    // Handle passing of state on unload
    var self=this;
	window.addEventListener("beforeunload",function() {
        //Priority has to be the minimum possible
        self.priority=-Number.MAX_VALUE;

        if(self.activeStates.leader) {
            for (var part in self.router.participants) {
                var participant = self.router.participants[part];

                // Each leaderParticipant should report out what participants are on
                // the router so that higher level elements can clean up soon to be dead references before passing on state.
                if (participant.address) {
                    self.events.trigger("receiveEventChannelPacket", {
                        packet: self.fixPacket({
                            dst: "$bus.multicast",
                            action: "disconnect",
                            entity: {
                                address: participant.address,
                                participantType: participant.participantType,
                                namesResource: participant.namesResource
                            }
                        })
                    });
                }
            }
        }

        self.events.trigger("unloadState");
	});


    // Connect Metrics
    ozpIwc.metrics.gauge('transport.leaderGroup.election').set(function() {
        var queue = self.getElectionQueue();
        return {'queue': queue ? queue.length : 0};
    });

    /**
     * Fires when the participant has connected to its router.
     * @event #connectedToRouter
     */
	this.on("connectedToRouter",function() {
        this.router.registerMulticast(this,[this.electionAddress,this.name]);
        var self = this;
        ozpIwc.util.setImmediate(function(){
            self.startElection();
        });

    },this);

    this.on("receive",this.routePacket,this);
});

/**
 * Retrieve the election queue. Called by closures which need access to the queue as it grows
 *
 * @method getElectionQueue
 *
 * @returns {Array} the election queue
 */
ozpIwc.LeaderGroupParticipant.prototype.getElectionQueue=function() {
    return this.electionQueue;
};


/**
 * Checks to see if the leadership group is in an election
 *
 * @method inElection
 *
 * @returns {Boolean} True if in an election state, otherwise false
 */
ozpIwc.LeaderGroupParticipant.prototype.inElection=function() {
    return !!this.electionTimer || this.activeStates.election;
};


/**
 * Checks to see if this instance is the leader of it's group.
 *
 * @method isLeader
 *
 * @returns {Boolean} True if leader.
 */
ozpIwc.LeaderGroupParticipant.prototype.isLeader=function() {
    return this.leader === this.address;
};


/**
 * Sends an election message to the leadership group.
 *
 * @method sendElectionMessage
 * @private
 * @param {String} type The type of message -- "election" or "victory"
 */
ozpIwc.LeaderGroupParticipant.prototype.sendElectionMessage=function(type, config) {
    config = config || {};
    var state = config.state || {};
    var previousLeader = config.previousLeader || this.leader;

    // TODO: no state should have circular references, this will eventually go away.
    try {
        JSON.stringify(state);
    } catch (ex) {
        ozpIwc.log.error(this.name,this.address,"failed to send state.", ex);
        state = {};
    }

    this.send({
		'src': this.address,
		'dst': this.electionAddress,
		'action': type,
		'entity': {
			'priority': this.priority,
            'state': state,
            'previousLeader': previousLeader
		}
	});
};


/**
 * Sends a message to the leadership group stating victory in the current election. LeaderGroupParticipant.priority
 * included to allow rebuttal. Will only send if participant's current state is in one of the following state categories:
 *      <li>leader</li>
 *      <li>election</li>
 * @returns {ozpIwc.TransportPacket} Packet returned if valid request, else false.
 */
ozpIwc.LeaderGroupParticipant.prototype.sendVictoryMessage = function(){
    if(this.activeStates.leader || this.activeStates.election) {
        return this.send({
            'src': this.address,
            'dst': this.electionAddress,
            'action': 'victory',
            'entity': {
                'priority': this.priority
            }
        });
    } else {
        return false;
    }
};


/**
 * Attempt to start a new election.
 *
 * Fires:
 *     - {{#crossLink "ozpiwc.LeaderGroupParticipant/#startElection:event"}{{/crossLink}}
 *     - {{#crossLink "ozpiwc.LeaderGroupParticipant/#becameLeader:event"}{{/crossLink}}
 *
 * @method startElection
 * @param {Object} config
 * @param {Object} config.state
 * @protected
 *
 */
ozpIwc.LeaderGroupParticipant.prototype.startElection=function(config) {
    config = config || {};
    var state = config.state || {};

	// don't start a new election if we are in one
	if(this.inElection()) {
		return;
	}
    this.events.trigger("startElection");

	var self=this;
	// if no one overrules us, declare victory
	this.electionTimer=window.setTimeout(function() {
		self.cancelElection();
        self.events.trigger("becameLeaderEvent");
	},this.electionTimeout);

	this.sendElectionMessage("election", {state: state, previousLeader: this.leader});
};


/**
 * Cancels participation in an in-progress election.
 *
 * Fires:
 *     - {{#crossLink "ozpiwc.LeaderGroupParticipant/#endElection:event"}{{/crossLink}}
 *
 * @method cancelElection
 *
 * @protected
 */
ozpIwc.LeaderGroupParticipant.prototype.cancelElection=function() {
	if(this.electionTimer) {
        window.clearTimeout(this.electionTimer);
        this.electionTimer=null;
        this.events.trigger("endElection");
	}
};


/**
 * Receives a packet on the election control group or forwards it to the target implementation of this leadership group.
 *
 * @method routePacket
 * @param {ozpIwc.TransportPacket} packetContext
 */
ozpIwc.LeaderGroupParticipant.prototype.routePacket=function(packetContext) {
	var packet=packetContext.packet;
	packetContext.leaderState=this.leaderState;
    if(packet.src === this.address) {
        // drop our own packets that found their way here
        return;
    }
    if(packet.dst === this.electionAddress) {
        if(packet.src === this.address) {
			// even if we see our own messages, we shouldn't act upon them
			return;
		} else if(packet.action === "election") {
			this.handleElectionMessage(packet);
		} else if(packet.action === "victory") {
			this.handleVictoryMessage(packet);
        }
    } else {
        this.forwardToTarget(packetContext);
	}		
};

/**
 * Forwards received packets to the target implementation of the participant. If currently in an election, messages
 * are queued.
 *
 * Fires:
 *     - {{#crossLink "ozpiwc.LeaderGroupParticipant/#receiveApiPacket:event"}{{/crossLink}}
 *
 * @method forwardToTarget
 *
 * @param {ozpIwc.TransportPacket} packetContext
 */
ozpIwc.LeaderGroupParticipant.prototype.forwardToTarget=function(packetContext) {
    if(this.activeStates.queueing) {
		this.electionQueue.push(packetContext);
		return;
	}
	packetContext.leaderState=this.leaderState;
	this.events.trigger("receiveApiPacket",packetContext);
};
	
	
/**
 * Respond to someone else starting an election.
 *
 * @method handleElectionMessage
 *
 * @private
 * @param {ozpIwc.TransportPacket} electionMessage
 */
ozpIwc.LeaderGroupParticipant.prototype.handleElectionMessage=function(electionMessage) {

    //If a state was received, store it case participant becomes the leader
    if(Object.keys(electionMessage.entity.state).length > 0){
        this.stateStore = electionMessage.entity.state;
        this.events.trigger("receivedState");
    }

    // If knowledge of a previousLeader was received, store it case participant becomes the leader and requests state
    // from said participant.
    if(electionMessage.entity.previousLeader){
        if (electionMessage.entity.previousLeader !== this.address) {
            this.previousLeader = electionMessage.entity.previousLeader;
        }
    }


	// is the new election lower priority than us?
	if(this.priorityLessThan(electionMessage.entity.priority,this.priority)) {
        if(electionMessage.entity.priority === -Number.MAX_VALUE){
            this.cancelElection();
            this.activeStates.election = false;
        } else {
            if(!this.inElection()) {
                this.electionQueue = [];
            }
        }
        // Quell the rebellion!
        this.startElection();

    } else if(this.activeStates.leader) {
        // If this participant is currently the leader but will loose the election, it sends out notification that their
        // is currently a leader (for state retrieval purposes)
        this.sendElectionMessage("election", {previousLeader: true});

    } else {

        // Abandon dreams of leadership
        this.cancelElection();

        // If set, after canceling, the participant will force itself to a membership state. Used to debounce invalid
        // leadership attempts due to high network traffic.
        if(this.toggleDrop){
            this.toggleDrop = false;
            this.events.trigger("newLeaderEvent");
        }
	}

};


/**
 * Handle someone else declaring victory.
 *
 * Fires:
 *     - {{#crossLink "ozpiwc.LeaderGroupParticipant/#newLeader:event"}{{/crossLink}}
 *
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
		this.events.trigger("newLeaderEvent");
        this.stateStore = {};
	}
};

/**
 * Returns the status of the participant.
 *
 * @method heartbeatStatus
 * @returns {Object}
 */
ozpIwc.LeaderGroupParticipant.prototype.heartbeatStatus=function() {
	var status= ozpIwc.Participant.prototype.heartbeatStatus.apply(this,arguments);
	status.leaderState=this.leaderState;
	status.leaderPriority=this.priority;
	return status;
};


/**
 * Changes the current state of the participant.
 * @param state {string} The state to change to.
 * @param config {object} properties to change in the participant should the state transition be valid
 * @returns {boolean}
 *      Will return true if a state transition occurred.
 *      Will not change state and return false if:
 *      <li>the new state was the current state</li>
 *      <li>the new state is not a registered state @see ozpIwc.LeaderGroupParticipant</li>
 */
ozpIwc.LeaderGroupParticipant.prototype.changeState=function(state,config) {
    if(state !== this.leaderState){
//        ozpIwc.log.log(this.address, this.leaderState, state);
        if(this._validateState(state)){
            for(var key in config){
                this[key] = config[key];
            }
            return true;
        }
    }
    return false;
};


/**
 *  Validates if the desired state transition is possible.
 *
 * @param state {string} The desired state to transition to.
 * @returns {boolean}
 *      Will return true if a state transition occured. </br>
 *      Will not change state and return false if:
 *      <li>the new state was the current state</li>
 *      <li>the new state is not a registered state</li>
 * @private
 */
ozpIwc.LeaderGroupParticipant.prototype._validateState = function(state){
    var newState = {};
    var validState = false;
    for(var x in this.states) {
        if(ozpIwc.util.arrayContainsAll(this.states[x], [state])){
            newState[x] = true;
            validState = true;
        } else {
            newState[x] = false;
        }
    }
    if(validState){
        this.activeStates = newState;
        this.leaderState = state;
        return true;
    } else {
        ozpIwc.log.error(this.address, this.name, "does not have state:", state);
        return false;
    }
};
var ozpIwc=ozpIwc || {};

/**
 * @submodule bus.transport
 */

/**
 * A participant to handle multicast communication on the IWC.
 *
 * @class MulticastParticipant
 * @namespace ozpIwc
 * @extends ozpIwc.Participant
 * @constructor
 *
 * @param {String} name The name of the participant.
 */
ozpIwc.MulticastParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(name) {

    /**
     * The name of the participant.
     * @property name
     * @type String
     * @default ""
     */
	this.name=name;

    /**
     * The type of the participant
     * @property participantType
     * @type String
     * @default "multicast"
     */
	this.participantType="multicast";

    ozpIwc.Participant.apply(this,arguments);

    /**
     * Array of Participants that are part of the multicast group.
     * @property members
     * @type ozpIwc.Participant[]
     * @default []
     */
	this.members=[];

    /**
     * The participants resource path for the Names API.
     * @property namesResource
     * @type String
     * @default "/multicast/"
     */
    this.namesResource="/multicast/"+this.name;

    /**
     * Content type for the Participant's heartbeat status packets.
     * @property heartBeatContentType
     * @type String
     * @default "application/vnd.ozp-iwc-multicast-address-v1+json"
     */
    this.heartBeatContentType="application/vnd.ozp-iwc-multicast-address-v1+json";

    /**
     *
     * @property heartBeatStatus.members
     * @type Array
     * @default []
     */
    this.heartBeatStatus.members=[];

    /**
     * Fires when the participant has connected to its router.
     * @event #connectedToRouter
     */
    this.on("connectedToRouter",function() {
        this.namesResource="/multicast/" + this.name;
    },this);
});

/**
 * Receives a packet on behalf of the multicast group.
 *
 * @method receiveFromRouterImpl
 *
 * @param {ozpIwc.TransportPacket} packet
 * @returns {Boolean} always false.
 */
ozpIwc.MulticastParticipant.prototype.receiveFromRouterImpl=function(packet) {
	this.members.forEach(function(m) {
        // as we send to each member, update the context to make it believe that it's the only recipient
        packet.dstParticipant=m;
        m.receiveFromRouter(packet);
    });
	return false;
};

/**
 * Adds a member to the multicast group.
 *
 * @method addMember
 *
 * @param {ozpIwc.Participant} participant
 */
ozpIwc.MulticastParticipant.prototype.addMember=function(participant) {
	this.members.push(participant);
    this.heartBeatStatus.members.push(participant.address);
};
/** @namespace */
var ozpIwc=ozpIwc || {};

/**
 * @submodule bus.transport
 */

/**
 * @class PostMessageParticipant
 * @namespace ozpIwc
 * @extends ozpIwc.Participant
 *
 * @param {Object} config
 * @param {String} config.origin
 * @param {Object} config.sourceWindow
 * @param {Object} config.credentials
 */
ozpIwc.PostMessageParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(config) {
	ozpIwc.Participant.apply(this,arguments);

    /**
     * The origin of the Participant.
     * @property origin
     */
    /**
     * The name of the Participant.
     * @property name
     */
	this.origin=this.name=config.origin;

    /**
     * The window of the Participant.
     * @property sourceWindow
     * @type Window
     */
	this.sourceWindow=config.sourceWindow;

    /**
     * @property credentials
     * @type
     */
    this.credentials=config.credentials;

    /**
     * The type of the participant.
     * @property participantType
     * @type  String
     * @default "postMessageProxy"
     */
	this.participantType="postMessageProxy";

    /**
     * @property securityAttributes.origin
     * @type String
     */
    this.securityAttributes.origin=this.origin;


    /**
     * Fires when the participant has connected to its router.
     * @event #connectedToRouter
     */
    this.on("connectedToRouter",function() {
        this.securityAttributes.sendAs=this.address;
        this.securityAttributes.receiveAs=this.address;
    },this);

    /**
     * @property heartBeatStatus.origin
     * @type String
     */
    this.heartBeatStatus.origin=this.origin;
});

/**
 * Receives a packet on behalf of this participant and forwards it via PostMessage.
 *
 * @method receiveFromRouterImpl
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.PostMessageParticipant.prototype.receiveFromRouterImpl=function(packetContext) {
    var self = this;
    return ozpIwc.authorization.isPermitted({
        'subject': this.securityAttributes,
        'object':  {
            receiveAs: packetContext.packet.dst
        }
    })
        .success(function(){
            self.sendToRecipient(packetContext.packet);
        })
        .failure(function(){
            ozpIwc.metrics.counter("transport.packets.forbidden").inc();
        });
};

/**
 * Sends a message to the other end of our connection.  Wraps any string mangling
 * necessary by the postMessage implementation of the browser.
 *
 * @method sendToParticipant
 * @param {ozpIwc.TransportPacket} packet
 * @todo Only IE requires the packet to be stringified before sending, should use feature detection?
 */
ozpIwc.PostMessageParticipant.prototype.sendToRecipient=function(packet) {
    var data=ozpIwc.util.getPostMessagePayload(packet);
	this.sourceWindow.postMessage(data,this.origin);
};

/**
 * The participant hijacks anything addressed to "$transport" and serves it
 * directly.  This isolates basic connection checking from the router, itself.
 *
 * @method handleTransportpacket
 * @param {Object} packet
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
 * Sends a packet received via PostMessage to the Participant's router.
 *
 * @method forwardFromPostMessage
 * @todo track the last used timestamp and make sure we don't send a duplicate messageId
 * @param {ozpIwc.TransportPacket} packet
 * @param {type} event
 */
ozpIwc.PostMessageParticipant.prototype.forwardFromPostMessage=function(packet,event) {
	if(typeof(packet) !== "object") {
		ozpIwc.log.error("Unknown packet received: " + JSON.stringify(packet));
		return;
	}
	if(event.origin !== this.origin) {
		/** @todo participant changing origins should set off more alarms, probably */
		ozpIwc.metrics.counter("transport."+this.address+".invalidSenderOrigin").inc();
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
 * Sends a packet to this participants router.  Calls fixPacket before doing so.
 *
 * @method send
 * @param {ozpIwc.TransportPacket} packet
 * @returns {ozpIwc.TransportPacket}
*/
ozpIwc.PostMessageParticipant.prototype.send=function(packet) {
    packet=this.fixPacket(packet);
    var self = this;
    return ozpIwc.authorization.isPermitted({
        'subject': this.securityAttributes,
        'object': {
            sendAs: packet.src
        }
    })
        .success(function(){
            self.router.send(packet,this);
        })
        .failure(function(){
            ozpIwc.metrics.counter("transport.packets.forbidden").inc();
        });
};


/**
 * @TODO (DOC)
 * Listens for PostMessage messages and forwards them to the respected Participant.
 *
 * @class PostMessageParticipantListener
 * @param {Object} config
 * @param {ozpIwc.Router} config.router
 */
ozpIwc.PostMessageParticipantListener=function(config) {
	config = config || {};

    /**
     * @property Participants
     * @type ozpiwc.PostMessageParticipant[]
     */
	this.participants=[];

    /**
     * @property router
     * @type ozpIwc.Router
     */
	this.router=config.router || ozpIwc.defaultRouter;

	var self=this;

	window.addEventListener("message", function(event) {
		self.receiveFromPostMessage(event);
	}, false);

    ozpIwc.metrics.gauge('transport.postMessageListener.participants').set(function() {
        return self.getParticipantCount();
    });
};

/**
 * Gets the count of known participants
 *
 * @method getParticipantCount
 *
 * @returns {Number} the number of known participants
 */
ozpIwc.PostMessageParticipantListener.prototype.getParticipantCount=function() {
    if (!this.participants) {
        return 0;
    }
    return this.participants.length;
};

/**
 * Finds the participant associated with the given window.  Unfortunately, this is an
 * o(n) algorithm, since there doesn't seem to be any way to hash, order, or any other way to
 * compare windows other than equality.
 *
 * @method findParticipant
 * @param {Object} sourceWindow - the participant window handle from message's event.source
 */
ozpIwc.PostMessageParticipantListener.prototype.findParticipant=function(sourceWindow) {
	for(var i=0; i< this.participants.length; ++i) {
		if(this.participants[i].sourceWindow === sourceWindow) {
			return this.participants[i];
		}
	}
};

/**
 * Process a post message that is received from a peer
 *
 * @method receiveFromPostMessage
 * @param {Object} event - The event received from the "message" event handler
 * @param {String} event.origin
 * @param {Object} event.source
 * @param {ozpIwc.TransportPacket} event.data
 */
ozpIwc.PostMessageParticipantListener.prototype.receiveFromPostMessage=function(event) {
	var participant=this.findParticipant(event.source);
	var packet=event.data;

	if(typeof(event.data)==="string") {
		try {
            packet=JSON.parse(event.data);
        } catch(e) {
            // assume that it's some other library using the bus and let it go
            return;
        }
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

    if (ozpIwc.util.isIWCPacket(packet)) {
        participant.forwardFromPostMessage(packet, event);
    } else {
        ozpIwc.log.log("Packet does not meet IWC Packet criteria, dropping.", packet);
    }

};

/**
 * @submodule bus.transport
 */

/**
 * @class RouterWatchdog
 * @extends ozpIwc.InternalParticipant
 * @namespace ozpIwc
 */
ozpIwc.RouterWatchdog = ozpIwc.util.extend(ozpIwc.InternalParticipant, function(config) {
    ozpIwc.InternalParticipant.apply(this, arguments);

    /**
     * The type of the participant.
     * @property participantType
     * @type String
     */
    this.participantType = "routerWatchdog";

    /**
     * Fired when connected.
     * @event #connected
     */
    this.on("connected", function() {
        this.name = this.router.selfId;
    }, this);

    /**
     * Frequency of heartbeats
     * @property heartbeatFrequency
     * @type Number
     * @defualt 10000
     */
    this.heartbeatFrequency = config.heartbeatFrequency || 10000;

    /**
     * Fired when connected to the router.
     * @event #connectedToRouter
     */
    this.on("connectedToRouter", this.setupWatches, this);


});

/**
 * Removes this participant from the $bus.multicast multicast group.
 *
 * @method leaveEventChannel
 */
ozpIwc.RouterWatchdog.prototype.leaveEventChannel = function() {
    // handle anything before leaving.
    if(this.router) {

        this.send({
            dst: "$bus.multicast",
            action: "disconnect",
            entity: {
                address: this.address,
                participantType: this.participantType,
                namesResource: this.namesResource
            }
        });

        this.send({
            dst: "$bus.multicast",
            action: "disconnect",
            entity: {
                address: this.router.selfId,
                namesResource: "/router/"+this.router.selfId
            }
        });
        //TODO not implemented
//        this.router.unregisterMulticast(this, ["$bus.multicast"]);
        return true;
    } else {
        return false;
    }

};
/**
 * Sets up the watchdog for all participants connected to the router. Reports heartbeats based on
 * {{#crossLink "ozpIwc.RouterWatchdogParticipant/heartbeatFrequency:property"}}{{/crossLink}}
 * @method setupWatches
 */
ozpIwc.RouterWatchdog.prototype.setupWatches = function() {
    this.name = this.router.selfId;
    var self=this;
    var heartbeat=function() {
        self.send({
            dst: "names.api",
            action: "set",
            resource: "/router/" + self.router.selfId,
            contentType: "application/vnd.ozp-iwc-router-v1+json",
            entity: {
                'address': self.router.selfId,
                'participants': self.router.getParticipantCount(),
                'time': ozpIwc.util.now()
            }
        });

        for (var k in self.router.participants) {
            var participant=self.router.participants[k];
            participant.heartBeatStatus.time = ozpIwc.util.now();
            if(participant instanceof ozpIwc.MulticastParticipant) {
                participant.members.forEach(function(member){
                    self.send({
                        'dst': "names.api",
                        'resource': participant.namesResource + "/"+ member.address,
                        'action' : "set",
                        'entity' : member.heartBeatStatus,
                        'contentType' : participant.heartBeatContentType
                    });
                });
            } else {
                participant.heartbeat();
            }            
        }

    };
//    heartbeat();

    /**
     * The timer for the heartBeat
     * @property timer
     * @type window.setInterval
     */
    this.timer = window.setInterval(heartbeat, this.heartbeatFrequency);
};

/**
 * Removes the watchdog.
 * @method shutdown
 */
ozpIwc.RouterWatchdog.prototype.shutdown = function() {
    window.clearInterval(this.timer);
};


/**
 * @submodule bus.api.Value
 */

/**
 * The base class for values in the various APIs.  Designed to be extended with API-specific
 * concerns and validation.
 *
 * @class CommonApiValue
 * @namespace ozpIwc
 * @param {object} config
 * @param {string} config.name the name of this resource
 */
ozpIwc.CommonApiValue = function(config) {
	config = config || {};

    /**
     * @property watchers
     * @type Array[String]
     * @default []
     */
	this.watchers= config.watchers || [];

    /**
     * @property resource
     * @type String
     */
	this.resource=config.resource;

    /**
     * @property allowedContentTypes
     * @type Array
     */
    this.allowedContentTypes=config.allowedContentTypes;

    /**
     * @property entity
     * @type Object
     */
    this.entity=config.entity;

    /**
     * @property contentType
     * @type String
     */
	this.contentType=config.contentType;

    /**
     * @property permissions
     * @type Object
     * @default {}
     */
	this.permissions=config.permissions || {};

    /**
     * @property version
     * @type Number
     * @default 0
     */
	this.version=config.version || 0;

    /**
     * @property persist
     * @type Boolean
     * @default false
     */
    this.persist=false;

    /**
     * @property deleted
     * @type Boolean
     * @default true
     */
    this.deleted=true;
};

/**
 * Sets a data based upon the content of the packet.  Automatically updates the content type,
 * permissions, entity, and updates the version.
 *
 * @method set
 * @param {ozpIwc.TransportPacket} packet
 * @returns {undefined}
 */
ozpIwc.CommonApiValue.prototype.set=function(packet) {
	if(this.isValidContentType(packet.contentType)) {
		this.permissions=packet.permissions || this.permissions;
		this.contentType=packet.contentType;
		this.entity=packet.entity;
		this.version++;
	}
};
/**
 * Adds a new watcher based upon the contents of the packet.
 *
 * @method watch
 * @param {ozpIwc.TransportPacket} packet
 * @returns {undefined}
 */
ozpIwc.CommonApiValue.prototype.watch=function(packet) {
	this.watchers.push({
		src: packet.src,
		msgId: packet.msgId
	});
};

/**
 * Removes a previously registered watcher.  An unwatch on
 * someone who isn't actually watching is not an error-- 
 * the post condition is satisfied.
 *
 * @method unwatch
 * @param {ozpIwc.TransportPacket} packet
 * @returns {undefined}
 */
ozpIwc.CommonApiValue.prototype.unwatch=function(packet) {
	this.watchers=this.watchers.filter(function(w) {
		return packet.replyTo !== w.msgId && packet.src !==w.src;
	});
};

/**
 * Invokes the callback on each watcher.
 *
 * @method eachWatcher
 * @param {function} callback
 * @param {object} [self]  Used as 'this' for the callback.  Defaults to the Value object.
 * @returns {undefined}
 */
ozpIwc.CommonApiValue.prototype.eachWatcher=function(callback,self) {
	self=self || this;
	return this.watchers.map(callback,self);
};

/**
 * Resets the data to an empy state-- undefined entity and contentType, no permissions,
 * and version of 0.  It does NOT remove watchers.  This allows for watches on values
 * that do not exist yet, or will be created in the future.
 *
 * @method deleteData
 * @returns {undefined}
 */
ozpIwc.CommonApiValue.prototype.deleteData=function() {
	this.entity=undefined;
	this.contentType=undefined;
	this.permissions=[];
	this.version=0;
    this.deleted=true;
};

/**
 * Turns this value into a packet.
 *
 * @method toPacket
 * @param {ozpIwc.TransportPacket} base Fields to be merged into the packet.
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.CommonApiValue.prototype.toPacket=function(base) {
	base = base || {};
	base.entity=ozpIwc.util.clone(this.entity);
	base.contentType=this.contentType;
	base.permissions=ozpIwc.util.clone(this.permissions);
	base.eTag=this.version;
	base.resource=this.resource;
	return base;
};

/**
 * Determines if the contentType is acceptable to this value.  Intended to be
 * overriden by subclasses.
 *
 * @method isValidContentType
 * @param {string} contentType
 * @returns {Boolean}
 */
ozpIwc.CommonApiValue.prototype.isValidContentType=function(contentType) {
    if(this.allowedContentTypes && this.allowedContentTypes.indexOf(contentType) < 0) {
        throw new ozpIwc.ApiError("badContent",
                "Bad contentType " + contentType +", expected " + this.allowedContentTypes.join(","));
     } else {
        return true;
    }
};

/**
 * Generates a point-in-time snapshot of this value that can later be sent to
 * {@link ozpIwc.CommonApiValue#changesSince} to determine the changes made to the value.
 * This value should be considered opaque to consumers.
 * 
 * <p> For API subclasses, the default behavior is to simply call toPacket().  Subclasses
 * can override this, but should likely override {@link ozpIwc.CommonApiValue#changesSince}
 * as well.
 *
 * @method snapshot
 * @returns {object}
 */
ozpIwc.CommonApiValue.prototype.snapshot=function() {
	return this.toPacket();
};

/**
 * From a given snapshot, create a change notifications.  This is not a delta, rather it's
 * change structure.
 * <p> API subclasses can override if there are additional change notifications (e.g. children in DataApi).
 *
 * @method changesSince
 * @param {object} snapshot The state of the value at some time in the past.
 * @returns {Object} A record of the current value and the value of the snapshot.
 */
ozpIwc.CommonApiValue.prototype.changesSince=function(snapshot) {
	if(snapshot.eTag === this.version) {
        return null;
    }
	return {
			'newValue': ozpIwc.util.clone(this.entity),
			'oldValue': snapshot.entity
	};
};

/**
 * Returns true if the value of this is impacted by the value of node.
 * For nodes that base their value off of other nodes, override this function.
 *
 * @method isUpdateNeeded
 * @param {type} node 
 * @returns boolean
 */
ozpIwc.CommonApiValue.prototype.isUpdateNeeded=function(node) {
    return false;
};

/**
 * Update this node based upon the changes made to changedNodes.
 *
 * @method updateContent
 * @param {ozpIwc.CommonApiValue[]} changedNodes Array of all nodes for which isUpdatedNeeded returned true.
 * @returns {ozpIwc.CommonApiValue.changes}
 */
ozpIwc.CommonApiValue.prototype.updateContent=function(changedNodes) {
    return null;
};

/**
 * Handles deserializing an {{#crossLink "ozpIwc.TransportPacket"}}{{/crossLink}} and setting this value with
 * the contents.
 *
 * @method deserialize
 * @param {ozpIwc.TransportPacket} serverData
 */
ozpIwc.CommonApiValue.prototype.deserialize=function(serverData) {
    for(var i in serverData.entity){
            this.entity[i] = serverData.entity[i];
    }
    this.contentType=serverData.contentType || this.contentType;
    this.permissions=serverData.permissions || this.permissions;
    this.version=serverData.version || ++this.version;
};

/**
 * @submodule bus.api.Value
 */

/**
 * @class CommonApiCollectionValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 *
 * @type {Function}
 * @param {Object} config
 * @oaram {String} config.pattern
 */
ozpIwc.CommonApiCollectionValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
	ozpIwc.CommonApiValue.apply(this,arguments);

    /**
     * @property persist
     * @type Boolean
     * @default false
     */
    this.persist=false;

    /**
     * @property pattern
     * @type RegExp
     * @default ''
     */
    this.pattern=config.pattern || '';
    this.entity=[];
});

/**
 * Returns if an update is needed.
 *
 * @method isUpdateNeeded
 * @param node
 * @returns {Boolean}
 */
ozpIwc.CommonApiCollectionValue.prototype.isUpdateNeeded=function(node) {
    return node.resource.match(this.pattern);
};

/**
 * Update the content of this value with an array of changed nodes.
 *
 * @method updateContent
 * @param {ozpIwc.commonApiValue[]} changedNodes
 */
ozpIwc.CommonApiCollectionValue.prototype.updateContent=function(changedNodes) {
    this.version++;
    this.entity=changedNodes.map(function(changedNode) { return changedNode.resource; });
};

/**
 * Handles set actions on the value.
 *
 * @method set
 */
ozpIwc.CommonApiCollectionValue.prototype.set=function() {
    throw new ozpIwc.ApiError("noPermission","This resource cannot be modified.");
};

/**
 * Deserializes a Intents Api handler value from a packet and constructs this Intents Api handler value.
 *
 * @method deserialize
 * @param {ozpIwc.TransportPacket} serverData
 */
ozpIwc.CommonApiCollectionValue.prototype.deserialize=function(serverData) {
    this.entity=serverData.entity || this.entity;
    this.contentType=serverData.contentType || this.contentType;
    this.permissions=serverData.permissions || this.permissions;
    this.pattern = new RegExp(serverData.pattern.replace(/^\/|\/$/g, '')) || this.pattern;
    this.persist=serverData.persist || this.persist;
    this.version=serverData.version || this.version;
    this.watchers = serverData.watchers || this.watchers;
};

/**
 * ```
    .---------------------------.
   /,--..---..---..---..---..--. `.
  //___||___||___||___||___||___\_|
  [j__ ######################## [_|
     \============================|
  .==|  |"""||"""||"""||"""| |"""||
 /======"---""---""---""---"=|  =||
 |____    []*  IWC     ____  | ==||
 //  \\        BUS    //  \\ |===||  hjw -(& kjk)
 "\__/"---------------"\__/"-+---+'
 * ```
 * @module bus
 */

/**
 * Classes related to api aspects of the IWC.
 * @module bus
 * @submodule bus.api
 */
/**
 * The API classes that can be used on the IWC bus. All of which subclass {{#crossLink "ozpIwc.CommonApiBase"}}{{/crossLink}}
 * @module bus.api
 * @submodule bus.api.Type
 */
/**
 * The API Value types that can be used in IWC apis. All of which subclass
 * {{#crossLink "CommonApiValue"}}{{/crossLink}}
 * @module bus.api
 * @submodule bus.api.Value
 */

/**
 * @TODO (Describe ApiError)
 *
 * @class ApiError
 * @namespace ozpIwc
 * @constructor
 *
 * @type {Function}
 * @param {String} action The action of the error.
 * @param {String} message The message corresponding to the error.
 */
ozpIwc.ApiError=ozpIwc.util.extend(Error,function(action,message) {
    Error.call(this,message);
    this.name="ApiError";
    this.errorAction=action;
    this.message=message;
});
/**
 * @submodule bus.api.Type
 */

/**
 * The Common API Base implements the API Common Conventions.  It is intended to be subclassed by
 * the specific API implementations.
 * @class CommonApiBase
 * @namespace ozpIwc
 * @constructor
 * @param {Object} config
 * @params {Participant} config.participant  the participant used for the Api communication
 */
ozpIwc.CommonApiBase = function(config) {
    config = config || {};

    /**
     * The participant used for the Api communication on the bus.
     * @property participant
     * @type Participant
     * @default {}
     */
    this.participant=config.participant;
    this.participant.on("unloadState",this.unloadState,this);
    this.participant.on("receiveApiPacket",this.routePacket,this);
    this.participant.on("becameLeaderEvent", this.becameLeader,this);
    this.participant.on("newLeaderEvent", this.newLeader,this);
    this.participant.on("startElection", this.startElection,this);
    this.participant.on("receiveEventChannelPacket",this.routeEventChannel,this);
   /**
    * An events module for the API.
    * @property events
    * @type Event
    */
	this.events = new ozpIwc.Event();
    this.events.mixinOnOff(this);

    /**
     * Api nodes that are updated based on other api nodes. Used for keeping dynamic lists of related resources.
     * @property dynamicNodes
     * @type Array
     * @default []
     */
    this.dynamicNodes=[];

    /**
     * Key value storage for the API. each element of the object is a node of the API.
     * @property data
     * @type Object
     * @default {}
     */
    this.data={};

    /**
     * A count for the recursive gathering of server data. Keeps track of the number of expected branches to traverse
     * through the HAL data. Set to 1 at the start of
     * {{#crossLink "ozpIwc.CommonApiBase/loadFromEndpoint:method"}}{{/crossLink}}
     * @private
     * @type Number
     * @default 1
     */
    this.expectedBranches = 1;

    /**
     * A count for the recursive gathering of server data. Keeps track of the number of branches that have been fully
     * retrieved in the HAL data. Set to 0 at the start of
     * {{#crossLink "ozpIwc.CommonApiBase/loadFromEndpoint:method"}}{{/crossLink}}
     * @private
     * @type Number
     * @default 0
     */
    this.retrievedBranches = 0;
};

/**
 * Finds or creates the corresponding node to store a server loaded resource.
 *
 * @method findNodeForServerResource
 * @param {ozpIwc.TransportPacket} serverObject The object to be stored.
 * @param {String} objectPath The full path resource of the object including it's root path.
 * @param {String} rootPath The root path resource of the object.
 *
 * @returns {ozpIwc.CommonApiValue} The node that is now holding the data provided in the serverObject parameter.
 */
ozpIwc.CommonApiBase.prototype.findNodeForServerResource=function(object,objectPath,endpoint) {
    var resource = '/';
    //Temporarily hard-code prefix. Will derive this from the server response eventually
    switch (endpoint.name) {
        case ozpIwc.linkRelPrefix + ':intent' :
            if (object.type) {
                resource += object.type;
                if (object.action) {
                    resource += '/' + object.action;
                    if (object.handler) {
                        resource += '/' + object.handler;
                    }
                }
            }
            break;
        case ozpIwc.linkRelPrefix + ':application':
            if (object.id) {
                resource += 'application/' + object.id;
            }
            break;
        case ozpIwc.linkRelPrefix + ':system':
            resource += 'system';
            break;
        case ozpIwc.linkRelPrefix + ':user':
            resource += 'user';
            break;
        case ozpIwc.linkRelPrefix + ':user-data':
            if (object.key) {
                resource += object.key;
            }
            break;
        default:
            resource+= 'FIXME_UNKNOWN_ENDPOINT_' + endpoint.name;
    }

    if (resource === '/') {
        return null;
    }

    return this.findOrMakeValue({
        'resource': resource,
        'entity': {},
        'contentType': object.contentType,
        'children': object.children // for data.api only
    });
};

/**
 * Loads api data from the server.  Intended to be overrided by subclasses to load data
 * when this instance becomes a leader without receiving data from the previous leader.
 *
 * @method loadFromServer
 */
ozpIwc.CommonApiBase.prototype.loadFromServer=function() {
    // Do nothing by default, resolve to prevent clashing with overridden promise implementations.
    return new Promise(function(resolve,reject){
        resolve();
    });
};

/**
 * Loads api data from a specific endpoint.
 *
 * @method loadFromEndpoint
 * @param {String} endpointName The name of the endpoint to load from the server.
 * @param [Object] requestHeaders
 * @param {String} requestHeaders.name
 * @param {String} requestHeaders.value
 *
 */
ozpIwc.CommonApiBase.prototype.loadFromEndpoint=function(endpointName, requestHeaders) {
    this.expectedBranches = 1;
    this.retrievedBranches = 0;

    // fetch the base endpoint. it should be a HAL Json object that all of the
    // resources and keys in it
    var endpoint=ozpIwc.endpoint(endpointName);
    var resolveLoad, rejectLoad;

    var p = new Promise(function(resolve,reject){
        resolveLoad = resolve;
        rejectLoad = reject;
    });

    var self=this;
    endpoint.get("/")
        .then(function(data) {
            var payload = data.response;
            var responseHeader = data.header;
            self.loadLinkedObjectsFromServer(endpoint,payload,resolveLoad, requestHeaders,responseHeader);
            self.updateResourceFromServer(payload,payload._links.self.href,endpoint,resolveLoad,responseHeader);
            // update all the collection values
            self.dynamicNodes.forEach(function(resource) {
                self.updateDynamicNode(self.data[resource]);
            });
        }).catch(function(e) {
            ozpIwc.log.error("Could not load from api (" + endpointName + "): " + e.message,e);
            rejectLoad("Could not load from api (" + endpointName + "): " + e.message + e);
        });
    return p;
};

/**
 * Updates an Api node with server loaded HAL data.
 *
 * @method updateResourceFromServer
 * @param {ozpIwc.TransportPacket} object The object retrieved from the server to store.
 * @param {String} path The path of the resource retrieved.
 * @param {ozpIwc.Endpoint} endpoint the endpoint of the HAL data.
 */
ozpIwc.CommonApiBase.prototype.updateResourceFromServer=function(object,path,endpoint,res,header) {
    //TODO where should we get content-type?
    header = header || {};
    object.contentType = object.contentType || header['Content-Type'] || 'application/json';

    var parseEntity;
    if(typeof object.entity === "string"){
        try{
            parseEntity = JSON.parse(object.entity);
            object.entity = parseEntity;
        }catch(e){
            // fail silently for now
        }
    }
    var node = this.findNodeForServerResource(object,path,endpoint);

    if (node) {
        var snapshot = node.snapshot();

        var halLess = ozpIwc.util.clone(object);
        delete halLess._links;
        delete halLess._embedded;
        node.deserialize({
            entity: halLess
        });

        this.notifyWatchers(node, node.changesSince(snapshot));
        this.loadLinkedObjectsFromServer(endpoint, object, res);
    }
};

/**
 * Traverses through HAL data from the server and updates api resources based on the data it finds.
 *
 * @method loadLinkedObjectsFromServer
 * @param {ozpIwc.Endpoint} endpoint the endpoint of the HAL data.
 * @param data the HAL data.
 * @parm [Object] headers
 * @param {String} headers.name
 * @param {String} headers.value
 */
ozpIwc.CommonApiBase.prototype.loadLinkedObjectsFromServer=function(endpoint,data,res, requestHeaders) {
    // fetch the base endpoint. it should be a HAL Json object that all of the 
    // resources and keys in it
    if(!data) {
        return;
    }

    var self=this;
    var noEmbedded = true;
    var noLinks = true;
    var branchesFound = 0;
    var itemLength = 0;

    if(data._embedded && data._embedded.item) {
        data._embedded.item = Array.isArray(data._embedded.item) ? data._embedded.item : [data._embedded.item];
        noEmbedded = false;
        if (Object.prototype.toString.call(data._embedded.item) === '[object Array]' ) {
            itemLength=data._embedded.item.length;
        } else {
            itemLength=1;
        }
        branchesFound+=itemLength;
    }

    if(data._links && data._links.item) {
        data._links.item = Array.isArray(data._links.item) ? data._links.item : [data._links.item];
        noLinks = false;
        if (Object.prototype.toString.call(data._links.item) === '[object Array]' ) {
            itemLength=data._links.item.length;
        } else {
            itemLength=1;
        }
        branchesFound+=itemLength;
    }

    if(noEmbedded && noLinks) {
        this.retrievedBranches++;
        if(this.retrievedBranches >= this.expectedBranches){
            res("RESOLVING");
        }
    } else {

        this.expectedBranches += branchesFound - 1;

        //TODO should we parse objects from _links and _embedded not wrapped in an item object?

        if(data._embedded && data._embedded.item) {
            var object = {};

            if( Object.prototype.toString.call(data._embedded.item) === '[object Array]' ) {
                for (var i in data._embedded.item) {
                    object = data._embedded.item[i];
                    this.updateResourceFromServer(object, object._links.self.href, endpoint, res);
                }
            } else {
                object = data._embedded.item;
                this.updateResourceFromServer(object, object._links.self.href, endpoint, res);
            }
        }

        if(data._links && data._links.item) {

            if( Object.prototype.toString.call(data._links.item) === '[object Array]' ) {
                data._links.item.forEach(function (object) {
                    var href = object.href;
                    endpoint.get(href, requestHeaders).then(function (objectResource) {
                        var payload = objectResource.response;
                        var header = objectResource.header;
                        self.updateResourceFromServer(payload, href, endpoint, res,header);
                    }).catch(function (error) {
                        ozpIwc.log.error("unable to load " + object.href + " because: ", error);
                    });
                });
            } else {
                var href = data._links.item.href;
                endpoint.get(href, requestHeaders).then(function (objectResource) {
                    var payload = objectResource.response;
                    var header = objectResource.header;
                    self.updateResourceFromServer(payload, href, endpoint, res,header);
                }).catch(function (error) {
                    ozpIwc.log.error("unable to load " + object.href + " because: ", error);
                });
            }
        }
    }
};


/**
 * Creates a new value for the given packet's request.  Subclasses must override this
 * function to return the proper value based upon the packet's resource, content type, or
 * other parameters.
 *
 * @method makeValue
 * @abstract
 * @param {ozpIwc.TransportPacket} packet
 *
 * @returns {CommonApiValue} an object implementing the commonApiValue interfaces
 */
ozpIwc.CommonApiBase.prototype.makeValue=function(/*packet*/) {
    throw new Error("Subclasses of CommonApiBase must implement the makeValue(packet) function.");
};

/**
 * Determines whether the action implied by the packet is permitted to occur on
 * node in question.
 *
 * @todo the refactoring of security to allow action-level permissions
 * @todo make the packetContext have the srcSubject inside of it
 *
 * @method isPermitted
 * @param {ozpIwc.CommonApiValue} node The node of the api that permission is being checked against
 * @param {ozpIwc.TransportPacketContext} packetContext The packet of which permission is in question.
 *
 * @returns {ozpIwc.AsyncAction} An asynchronous response, the response will call either success or failure depending on
 * the result of the check.
 *
 * @example
 * ```
 * foo.isPermitted(node,packetContext)
 *      .success(function(){
 *          ...
 *      }).failure(function(){
 *          ...
 *      });
 * ```
 */
ozpIwc.CommonApiBase.prototype.isPermitted=function(node,packetContext) {
    var subject=packetContext.srcSubject || {
        'rawAddress':packetContext.packet.src
    };

    return ozpIwc.authorization.isPermitted({
        'subject': subject,
        'object': node.permissions,
        'action': {'action':packetContext.action}
    });
};


/**
 * Turn an event into a list of change packets to be sent to the watchers.
 *
 * @method notifyWatchers
 * @param {ozpIwc.CommonApiValue} node The node being changed.
 * @param {Object} changes The changes to the node.
 */
ozpIwc.CommonApiBase.prototype.notifyWatchers=function(node,changes) {
    if(!changes) {
        return;
    }
    this.events.trigger("changedNode",node,changes);
    node.eachWatcher(function(watcher) {
        // @TODO check that the recipient has permission to both the new and old values
        var reply={
            'dst'   : watcher.src,
            'src'   : this.participant.name,
            'replyTo' : watcher.msgId,
            'response': 'changed',
            'resource': node.resource,
            'permissions': node.permissions,
            'entity': changes
        };

        this.participant.send(reply);
    },this);
};

/**
 * For a given packet, return the value if it already exists, otherwise create the value
 * using makeValue()
 *
 * @method findOrMakeValue
 * @protected
 * @param {ozpIwc.TransportPacket} packet The data that will be used to either find or create the api node.
 */
ozpIwc.CommonApiBase.prototype.findOrMakeValue=function(packet) {
    if(packet.resource === null || packet.resource === undefined) {
        // return a throw-away value
        return new ozpIwc.CommonApiValue();
    }
    var node=this.data[packet.resource];

    if(!node) {
        node=this.data[packet.resource]=this.makeValue(packet);
    }
    return node;
};

/**
 *
 * Determines if the given resource exists.
 *
 * @method hasKey
 * @param {String} resource The path of the resource in question.
 * @returns {Boolean} Returns true if there is a node with a corresponding resource in the api.
 */
ozpIwc.CommonApiBase.prototype.hasKey=function(resource) {
    return resource in this.data;
};

/**
 * Generates a key name that does not already exist and starts with a given prefix.
 *
 * @method createKey
 * @param {String} prefix The prefix resource string.
 * @returns {String} The prefix resource string with an appended generated Id that is not already in use.
 */
ozpIwc.CommonApiBase.prototype.createKey=function(prefix) {
    prefix=prefix || "";
    var key;
    do {
        key=prefix + ozpIwc.util.generateId();
    } while(this.hasKey(key));
    return key;
};

/**
 * Route a packet to the appropriate handler.  The routing path is based upon
 * the action and whether a resource is defined. If the handler does not exist, it is routed
 * to defaultHandler(node,packetContext)
 *
 * Has Resource: handleAction(node,packetContext)
 *
 * No resource: rootHandleAction(node,packetContext)
 *
 * Where "Action" is replaced with the packet's action, lowercase with first letter capitalized
 * (e.g. "doSomething" invokes "handleDosomething")
 * Note that node will usually be null for the rootHandlerAction calls.
 * <ul>
 * <li> Pre-routing checks	<ul>
 *		<li> Permission check</li>
 *		<li> ACL Checks (todo)</li>
 *		<li> Precondition checks</li>
 * </ul></li>
 * <li> Post-routing actions <ul>
 *		<li> Reply to requester </li>
 *		<li> If node version changed, notify all watchers </li>
 * </ul></li>
 *
 * @method routePacket
 * @param {ozpIwc.TransportPacketContext} packetContext The packet to route.
 *
 */
ozpIwc.CommonApiBase.prototype.routePacket=function(packetContext) {
    var packet=packetContext.packet;
    this.events.trigger("receive",packetContext);
    var self=this;
    var errorWrap=function(f) {
        try {
            f.apply(self);
        } catch(e) {
            if(!e.errorAction) {
                ozpIwc.log.log("Unexpected error:",e);
            }
            packetContext.replyTo({
                'response': e.errorAction || "unknownError",
                'entity': e.message
            });
            return;
        }
    };
    if(packetContext.leaderState !== 'leader' && packetContext.leaderState !== 'actingLeader'  )	{
        // if not leader, just drop it.
        return;
    }

    if(packet.response && !packet.action) {
        ozpIwc.log.log(this.participant.name + " dropping response packet ",packet);
        // if it's a response packet that didn't wire an explicit handler, drop the sucker
        return;
    }
    var node;

    errorWrap(function() {
        var handler=this.findHandler(packetContext);
        this.validateResource(node,packetContext);
        node=this.findOrMakeValue(packetContext.packet);

        this.isPermitted(node,packetContext)
            .success(function() {
                errorWrap(function() {
                    this.validatePreconditions(node,packetContext);
                    var snapshot=node.snapshot();
                    handler.call(this,node,packetContext);
                    this.notifyWatchers(node, node.changesSince(snapshot));

                    // update all the collection values
                    this.dynamicNodes.forEach(function(resource) {
                        this.updateDynamicNode(this.data[resource]);
                    },this);
                });
            },this)
            .failure(function() {
                packetContext.replyTo({'response':'noPerm'});
            });
    });
};

/**
 * Routes event channel messages.
 *
 * @method routeEventChannel
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.routeEventChannel = function(packetContext) {
    if (!this.participant.activeStates.leader) {
        return;
    }
    var packet = packetContext.packet;
    switch (packet.action) {
        case "connect":
            this.handleEventChannelConnect(packetContext);
            break;
        case "disconnect":
            this.handleEventChannelDisconnect(packetContext);
            break;
        default:
            ozpIwc.log.error(this.participant.name, "No handler found for corresponding event channel action: ", packet.action);
            break;
    }
};

/**
 * Handles disconnect messages received over the $bus.multicast group.
 *
 * @method handleEventChannelDisconnect
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleEventChannelDisconnect = function(packetContext) {
    for(var node in this.data){
        for(var j in this.data[node].watchers) {
            if (this.data[node].watchers[j].src === packetContext.packet.entity.address) {
                this.data[node].watchers.splice(j,1);
            }
        }
    }
    this.handleEventChannelDisconnectImpl(packetContext);
};

/**
 * Handles connect messages received over the $bus.multicast group.
 *
 * @method handleEventChannelConnect
* @param {ozpIwc.TransportPacketContext} packetContext
*/
ozpIwc.CommonApiBase.prototype.handleEventChannelConnect = function(packetContext) {
    this.handleEventChannelConnectImpl(packetContext);
};

/**
 * Intended to be overridden by subclass.
 *
 * @abstract
 * @method handleEventChannelDisconnectImpl
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleEventChannelDisconnectImpl = function(packetContext) {
};
/**
 * Intended to be overridden by subclass.
 *
 * @abstract
 * @method handleEventChannelDisconnectImpl
 * @param {ozpIwc.TransportPacketContext} packetContext
 */
ozpIwc.CommonApiBase.prototype.handleEventChannelConnectImpl = function(packetContext) {
};
/**
 * Determines which handler in the api is needed to process the given packet.
 *
 * @method findHandler
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context to find a proper handler for.
 *
 * @returns {Function} The handler for the given packet context.
 */
ozpIwc.CommonApiBase.prototype.findHandler=function(packetContext) {
    var action=packetContext.packet.action;
    var resource=packetContext.packet.resource;

    var handler;

    if(resource===null || resource===undefined) {
        handler="rootHandle";
    } else {
        handler="handle";
    }

    if(action) {
        handler+=action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
    } else {
        handler="defaultHandler";
    }

    if(!handler || typeof(this[handler]) !== 'function') {
        handler="defaultHandler";
    }
    return this[handler];
};


/**
 * Checks that the given packet context's resource meets the requirements of the api. Subclasses should override this
 * method as it performs no check by default.
 *
 * @method validateResource
 * @param {CommonApiValue} node @TODO is a node needed to validate?
 * @param {ozpIwc.TransportPacketContext} packetContext The packetContext with the resource to be validated.
 *
 * @returns {Boolean} always returns true.
 */
ozpIwc.CommonApiBase.prototype.validateResource=function(/* node,packetContext */) {
    return true;
};

/**
 * Checks the given packet context's `ifTag` against the desired api node's `version`. Throws ApiError if ifTag exists
 * and doesn't match.
 *
 * @method validatePreconditions
 * @param node The api node being checked against.
 * @param packetContext The packet context to validate.
 *
 */
ozpIwc.CommonApiBase.prototype.validatePreconditions=function(node,packetContext) {
    if(packetContext.packet.ifTag && packetContext.packet.ifTag!==node.version) {
        throw new ozpIwc.ApiError('noMatch',"Latest version is " + node.version);
    }
};

/**
 * Checks that the given packet context's contextType meets the requirements of the api. Subclasses should override this
 * method as it performs no check by default.
 *
 * @method validateContextType
 * @param {CommonApiValue} node @TODO is a node needed to validate?
 * @param {ozpIwc.TransportPacketContext} packetContext The packetContext with the contextType to be validated.
 *
 * @returns {Boolean} - always returns true.
 */
ozpIwc.CommonApiBase.prototype.validateContentType=function(node,packetContext) {
    return true;
};

/**
 * @TODO (DOC)
 * @method updateDynamicNode
 * @param {ozpIwc.CommonApiValue} node @TODO (DOC)
 */
ozpIwc.CommonApiBase.prototype.updateDynamicNode=function(node) {
    if(!node) {
        return;
    }
    var ofInterest=[];

    for(var k in this.data) {
        if(node.isUpdateNeeded(this.data[k])){
            ofInterest.push(this.data[k]);
        }
    }

    if(ofInterest) {
        var snapshot=node.snapshot();
        node.updateContent(ofInterest);
        this.notifyWatchers(node,node.changesSince(snapshot));
    }
};

/**
 * @TODO (DOC)
 * @method addDynamicNode
 * @param {ozpIwc.CommonApiValue} node @TODO (DOC)
 */
ozpIwc.CommonApiBase.prototype.addDynamicNode=function(node) {
    this.data[node.resource]=node;
    this.dynamicNodes.push(node.resource);
    this.updateDynamicNode(node);
};

/**
 * The default handler for the api when receiving packets. This handler is called when no handler was found for the
 * given packet context's action.
 *
 *
 * @method defaultHandler
 * @param {ozpIwc.CommonApiValue} node @TODO is a node needed? or is this intended for subclass purposes
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context being handled.
 */
ozpIwc.CommonApiBase.prototype.defaultHandler=function(node,packetContext) {
    packetContext.replyTo({
        'response': 'badAction',
        'entity': {
            'action': packetContext.packet.action,
            'originalRequest' : packetContext.packet
        }
    });
};

/**
 * Common handler for packet contexts with `get` actions.
 *
 * @method handleGet
 * @param {ozpIwc.CommonApiValue} node The api node to retrieve.
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context containing the get action.
 */
ozpIwc.CommonApiBase.prototype.handleGet=function(node,packetContext) {
    packetContext.replyTo(node.toPacket({'response': 'ok'}));
};

/**
 * Common handler for packet contexts with `set` actions.
 *
 * @method handleSet
 * @param {ozpIwc.CommonApiValue} node The api node to store the packet contexts' data in.
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context containing the set action.
 */
ozpIwc.CommonApiBase.prototype.handleSet=function(node,packetContext) {
    node.set(packetContext.packet);
    packetContext.replyTo({'response':'ok'});
};

/**
 * Common handler for packet contexts with `delete` actions.
 *
 * @TODO (DOC)
 * @method handleDelete
 * @param {ozpIwc.CommonApiValue} node @TODO (DOC)
 * @param {ozpIwc.TransportPacketContext} packetContext @TODO (DOC)
 */
ozpIwc.CommonApiBase.prototype.handleDelete=function(node,packetContext) {
    node.deleteData();
    packetContext.replyTo({'response':'ok'});
};

/**
 * Common handler for packet contexts with `watch` actions.
 *
 * @method handleWatch
 * @param {ozpIwc.CommonApiValue} node The api node to register a watch on.
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context containing the watch action.
 */
ozpIwc.CommonApiBase.prototype.handleWatch=function(node,packetContext) {
    node.watch(packetContext.packet);

    // @TODO: Reply with the entity? Immediately send a change notice to the new watcher?
    packetContext.replyTo({'response': 'ok'});
};

/**
 * Common handler for packet contexts with `unwatch` actions.
 *
 * @method handleUnwatch
 * @param {ozpIwc.CommonApiValue} node The api node to remove a watch registration from.
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context containing the unwatch action.
 */
ozpIwc.CommonApiBase.prototype.handleUnwatch=function(node,packetContext) {
    node.unwatch(packetContext.packet);

    packetContext.replyTo({'response':'ok'});
};

/**
 * Called when the leader participant fires its beforeUnload state. Releases the Api's data property
 * to be consumed by all, then used by the new leader.
 *
 * @method unloadState
 */
ozpIwc.CommonApiBase.prototype.unloadState = function(){
    if(this.participant.activeStates.leader) {

        // temporarily change the primative to stringify our RegExp
        var tempToJSON = RegExp.prototype.toJSON;
        RegExp.prototype.toJSON = RegExp.prototype.toString;
        this.participant.sendElectionMessage("election",{state: {
            data: this.data,
            dynamicNodes: this.dynamicNodes
        }, previousLeader: this.participant.address});

        RegExp.prototype.toJSON = tempToJSON;
        this.data = {};
    } else {
        this.participant.sendElectionMessage("election");
    }
};


/**
 * Sets the APIs data property. Removes current values, then constructs each API value anew.
 *
 * @method setState
 * @param {Object} state The object containing key value pairs to set as this api's state.
 */
ozpIwc.CommonApiBase.prototype.setState = function(state) {
    this.data = {};
    this.dynamicNodes = state.dynamicNodes;
    for (var key in state.data) {
        var dynIndex = this.dynamicNodes.indexOf(state.data[key].resource);
        var node;
        if(dynIndex > -1){
             node = this.data[state.data[key].resource] = new ozpIwc.CommonApiCollectionValue({
                resource: state.data[key].resource
            });
            node.deserialize(state.data[key]);
            this.updateDynamicNode(node);
        } else {
            node = this.findOrMakeValue(state.data[key]);
            node.deserialize(state.data[key]);
        }
    }
    // update all the collection values
    this.dynamicNodes.forEach(function(resource) {
        this.updateDynamicNode(this.data[resource]);
    },this);
};

/**
 * Common handler for packet contexts with a `list` action but no resource.
 *
 * @method rootHandleList
 * @param {ozpIwc.CommonApiValue}node @TODO is a node needed? or is this intended for subclass purposes
 * @param {ozpIwc.TransportPacketContext} packetContext The packet context of the received request.
 */
ozpIwc.CommonApiBase.prototype.rootHandleList=function(node,packetContext) {
    packetContext.replyTo({
        'response':'ok',
        'entity': Object.keys(this.data)
    });
};

/**
 * Puts the API's participant into it's election state.
 *
 * @method startElection
 */
ozpIwc.CommonApiBase.prototype.startElection = function(){
    if (this.participant.activeStates.leader) {
        this.participant.changeState("actingLeader");
    } else if(this.participant.leaderState === "leaderSync") {
        // do nothing.
    } else {
        this.participant.changeState("election");
    }
};


/**
 *  Handles taking over control of the API's participant group as the leader.
 *      <li>If this API instance's participant was the leader prior to election and won, normal functionality resumes.</li>
 *      <li>If this API instance's participant received state from a leaving leader participant, it will consume said participants state</li>
 *
 * @method becameLeader
 */
ozpIwc.CommonApiBase.prototype.becameLeader= function(){
    this.participant.sendElectionMessage("victory");

    // Was I the leader at the start of the election?
    if (this.participant.leaderState === "actingLeader" || this.participant.leaderState === "leader") {
        // Continue leading
        this.setToLeader();

    } else if (this.participant.leaderState === "election") {
        //If this is the initial state we need to wait till the endpoint data is ready
        this.leaderSync();
    }
};


/**
 * Handles a new leader being assigned to this API's participant group.
 *      <li>@TODO: If this API instance was leader prior to the election, its state will be sent off to the new leader.</li>
 *      <li>If this API instance wasn't the leader prior to the election it will resume normal functionality.</li>
 *
 * Fires:
 *   - {{#crossLink "ozpIwc.leaderGroupParticipant/#newLeader:event"}}{{/crossLink}}
 *
 * @method newLeader
 */
ozpIwc.CommonApiBase.prototype.newLeader = function() {
    // If this API was the leader, send its state to the new leader
    if (this.participant.leaderState === "actingLeader") {
        this.participant.sendElectionMessage("election", {previousLeader: this.participant.address, state: this.data});
    }
    this.participant.changeState("member");
    this.participant.events.trigger("newLeader");
};



/**
 * Handles setting the API's participant to the leader state.
 *
 * Fires:
 *   - {{#crossLink "ozpIwc.leaderGroupParticipant/#becameLeader:event"}}{{/crossLink}}
 *
 * @method setToLeader
 */
ozpIwc.CommonApiBase.prototype.setToLeader = function(){
    var self = this;
    window.setTimeout(function() {
        self.participant.changeState("leader");
        self.participant.events.trigger("becameLeader");
    },0);
};


/**
 * Handles the syncronizing of API data from previous leaders.
 * <li> If this API's participant has a state stored from the election it is set </li>
 * <li> If no state present but expected, a listener is set to retrieve the state if acquired within 250ms </li>
 *
 * @method leaderSync
 */
ozpIwc.CommonApiBase.prototype.leaderSync = function () {
    this.participant.changeState("leaderSync",{toggleDrop: true});

    var self = this;
    window.setTimeout(function() {

        // If the election synchronizing pushed this API out of leadership, don't try to become leader.
        if(self.participant.leaderState !== "leaderSync") {
            return;
        }

        // Previous leader sent out their state, it was stored in the participant
        if (self.participant.stateStore && Object.keys(self.participant.stateStore).length > 0) {
            self.setState(self.participant.stateStore);
            self.participant.stateStore = {};
            self.setToLeader();

        } else if (self.participant.previousLeader) {
            // There was a previous leader but we haven't seen their state. Wait for it.
            self.receiveStateTimer = null;

            var recvFunc = function () {
                self.setState(self.participant.stateStore);
                self.participant.off("receivedState", recvFunc);
                self.setToLeader();
                window.clearInterval(self.receiveStateTimer);
                self.receiveStateTimer = null;
            };

            self.participant.on("receivedState", recvFunc);

            self.receiveStateTimer = window.setTimeout(function () {
                if (self.participant.stateStore && Object.keys(self.participant.stateStore).length > 0) {
                    recvFunc();
                } else {
                    self.loadFromServer();
                    ozpIwc.log.log(self.participant.name, "New leader(",self.participant.address, ") failed to retrieve state from previous leader(", self.participant.previousLeader, "), so is loading data from server.");
                }

                self.participant.off("receivedState", recvFunc);
                self.setToLeader();
            }, 250);

        } else {
            // This is the first of the bus, winner doesn't obtain any previous state
            ozpIwc.log.log(self.participant.name, "New leader(",self.participant.address, ") is loading data from server.");
            self.loadFromServer().then(function (data) {
                self.setToLeader();
            },function(err){
                ozpIwc.log.error(self.participant.name, "New leader(",self.participant.address, ") could not load data from server. Error:", err);
                self.setToLeader();
            }).catch(function(er){
                ozpIwc.log.log(er);
            });
        }
    },0);
};

/**
 * @TODO DOC
 * @method persistNodes
 */
ozpIwc.CommonApiBase.prototype.persistNodes=function() {
	// throw not implemented error
	throw new ozpIwc.ApiError("noImplementation","Base class persistence call not implemented.  Use DataApi to persist nodes.");
};

var ozpIwc=ozpIwc || {};

/**
 * @class Endpoint
 * @namespace ozpIwc
 * @param {ozpIwc.EndpointRegistry} endpointRegistry Endpoint name
 * @constructor
 */
ozpIwc.Endpoint=function(endpointRegistry) {

    /**
     * @property endpointRegistry
     * @type ozpIwc.EndpointRegistry
     */
	this.endpointRegistry=endpointRegistry;
};

/**
 * Performs an AJAX request of GET for specified resource href.
 *
 * @method get
 * @param {String} resource
 * @param [Object] requestHeaders
 * @param {String} requestHeaders.name
 * @param {String} requestHeaders.value
 *
 * @returns {Promise}
 */
ozpIwc.Endpoint.prototype.get=function(resource, requestHeaders) {
    var self=this;

    return this.endpointRegistry.loadPromise.then(function() {
        if (resource === '/') {
            resource = self.baseUrl;
        }
        return ozpIwc.util.ajax({
            href:  resource,
            method: 'GET',
            headers: requestHeaders,
            withCredentials: true,
            user: ozpIwc.marketplaceUsername,
            password: ozpIwc.marketplacePassword
        });
    });
};

/**
 *
 * Performs an AJAX request of PUT for specified resource href.
 *
 * @method put
 * @param {String} resource
 * @param {Object} data\
 * @param [Object] requestHeaders
 * @param {String} requestHeaders.name
 * @param {String} requestHeaders.value
 *
 * @returns {Promise}
 */
ozpIwc.Endpoint.prototype.put=function(resource, data, requestHeaders) {
    var self=this;

    return this.endpointRegistry.loadPromise.then(function() {
        if(resource.indexOf(self.baseUrl)!==0) {
            resource=self.baseUrl + resource;
        }
        return ozpIwc.util.ajax({
            href:  resource,
            method: 'PUT',
			data: data,
            headers: requestHeaders,
            withCredentials: true,
            user: ozpIwc.marketplaceUsername,
            password: ozpIwc.marketplacePassword
        });
    });
};

/**
 *
 * Performs an AJAX request of DELETE for specified resource href.
 *
 * @method put
 * @param {String} resource
 * @param [Object] requestHeaders
 * @param {String} requestHeaders.name
 * @param {String} requestHeaders.value
 *
 * @returns {Promise}
 */
ozpIwc.Endpoint.prototype.delete=function(resource, data, requestHeaders) {
    var self=this;

    return this.endpointRegistry.loadPromise.then(function() {
        if(resource.indexOf(self.baseUrl)!==0) {
            resource=self.baseUrl + resource;
        }
        return ozpIwc.util.ajax({
            href:  resource,
            method: 'DELETE',
            headers: requestHeaders,
            withCredentials: true,
            user: ozpIwc.marketplaceUsername,
            password: ozpIwc.marketplacePassword
        });
    });
};

/**
 * Sends AJAX requests to PUT the specified nodes into the endpoint.
 * @todo PUTs each node individually. Currently sends to a fixed api point switch to using the node.self endpoint and remove fixed resource
 * @method saveNodes
 * @param {ozpIwc.CommonApiValue[]} nodes
 */
ozpIwc.Endpoint.prototype.saveNodes=function(nodes) {
    var resource = "/data";
    for (var node in nodes) {
        var nodejson = JSON.stringify(nodes[node]);
        this.put((nodes[node].self || resource), nodejson);
    }
};

/**
 * @class EndpointRegistry
 * @namespace ozpIwc
 * @constructor
 *
 * @param {Object} config
 * @param {String} config.apiRoot the root of the api path.
 */
ozpIwc.EndpointRegistry=function(config) {
    config=config || {};
    var apiRoot=config.apiRoot || '/api';

    /**
     * The root path of the specified apis
     * @property apiRoot
     * @type String
     * @default '/api'
     */
    this.apiRoot = apiRoot;

    /**
     * The collection of api endpoints
     * @property endPoints
     * @type Object
     * @default {}
     */
    this.endPoints={};

    var self=this;

    /**
     * An AJAX GET request fired at the creation of the Endpoint Registry to gather endpoint data.
     * @property loadPromise
     * @type Promise
     */
    this.loadPromise=ozpIwc.util.ajax({
        href: apiRoot,
        method: 'GET',
        withCredentials: true,
        user: ozpIwc.marketplaceUsername,
        password: ozpIwc.marketplacePassword
    }).then(function(data) {
        var payload = data.response;
        for (var linkEp in payload._links) {
            if (linkEp !== 'self') {
                var link = payload._links[linkEp].href;
                self.endpoint(linkEp).baseUrl = link;
            }
        }
        for (var embEp in payload._embedded) {
            var embLink = payload._embedded[embEp]._links.self.href;
            self.endpoint(embEp).baseUrl = embLink;
        }
    });
};

/**
 * Finds or creates an input with the given name.
 *
 * @method endpoint
 * @param {String} name
 * @returns {ozpIwc.Endpoint}
 */
ozpIwc.EndpointRegistry.prototype.endpoint=function(name) {
    var endpoint=this.endPoints[name];
    if(!endpoint) {
        endpoint=this.endPoints[name]=new ozpIwc.Endpoint(this);
        endpoint.name=name;
    }
    return endpoint;
};

/**
 * Initializes the Endpoint Registry with the api root path.
 *
 * @method initEndpoints
 * @param {String} apiRoot
 */
ozpIwc.initEndpoints=function(apiRoot) {
    var registry=new ozpIwc.EndpointRegistry({'apiRoot':apiRoot});
    ozpIwc.endpoint=function(name) {
        return registry.endpoint(name);
    };
};


/**
 * @submodule bus.api.Type
 */

/**
 * The Data Api. Provides key value storage and app state-sharing through the IWC. Subclasses the
 * {{#crossLink "CommonApiBase"}}{{/crossLink}}. Utilizes the {{#crossLink "DataApiValue"}}{{/crossLink}} which
 * subclasses the {{#crossLink "CommonApiValue"}}{{/crossLink}}.
 *
 * @class DataApi
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiBase
 *
 * @constructor
 * @uses DataApiValue
 * @type {Function}
 * @params {Object} config
 * @params {ozpIwc.Participant} config.participant - the participant used for the Api communication
 */
ozpIwc.DataApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function(config) {
    ozpIwc.CommonApiBase.apply(this,arguments);
    this.endpointUrl=ozpIwc.linkRelPrefix+":user-data";
});

/**
 * Loads data from the server.
 *
 * @method loadFromServer
 */
ozpIwc.DataApi.prototype.loadFromServer=function() {
    return this.loadFromEndpoint(this.endpointUrl);
};

/**
 * Creates a DataApiValue from the given packet.
 *
 * @method makeValue
 * @param {ozpIwc.TransportPacket} packet The packet used to create an api value
 *
 * @returns {ozpIwc.DataApiValue}
 */
ozpIwc.DataApi.prototype.makeValue = function(packet){
    return new ozpIwc.DataApiValue(packet);
};

/**
 * Creates a child node of a given Data Api node. The child's key will be automatically generated based on its
 * parents key.
 *
 * @method createChild
 * @private
 * @param {ozpIwc.DataApiValue} node  The node of the Api to create a child of.
 * @param {ozpIwc.TransportPacketContext} packetContext The TransportPacketContext
 * containing information to build the child node.
 *
 * @returns {ozpIwc.DataApiValue} The childNode created.
 */
ozpIwc.DataApi.prototype.createChild=function(node,packetContext) {
    var key=this.createKey(node.resource+"/");

    // save the new child
    var childNode=this.findOrMakeValue({'resource':key});
    childNode.set(packetContext.packet);
    return childNode;
};

/**
 * Sends a list of children of the specified node to the sender of the packet context.
 *
 * The sender of the packet context will receive a responding message with the following parameters:
 * ```
 * {
 *     response: 'ok',
 *     entity: [ <array of child node resources (String)> ]
 * }
 * ```
 * @method handleList
 * @param {ozpIwc.DataApiValue} node The node containing children to list.
 * @param {ozpIwc.TransportPacketContext} packetContext Packet context of the list request.
 */
ozpIwc.DataApi.prototype.handleList=function(node,packetContext) {
    packetContext.replyTo({
        'response': 'ok',
        'entity': node.listChildren()
    });
};

/**
 * Creates a child node of the given Data Api node. Creates a reference to the child node in the parent node's children
 * property.
 *
 *
 * A responding message is sent back to the sender of the packet context with the following parameters:
 * ```
 * {
 *     response: 'ok',
 *     entity: {
 *        resource: <resource(String) of the new child node>
 *     }
 * }
 * ```
 *
 * @method handleAddchild
 * @param {ozpIwc.DataApiValue} node - The parent node to add a child node to.
 * @param {ozpIwc.TransportPacketContext} packetContext - The packet context of which the child is constructed from.
 */
ozpIwc.DataApi.prototype.handleAddchild=function(node,packetContext) {
    var childNode=this.createChild(node,packetContext);

    node.addChild(childNode.resource);

    if (node && packetContext.packet.entity.persist) {
        this.persistNode(node);
    }

    packetContext.replyTo({
        'response':'ok',
        'entity' : {
            'resource': childNode.resource
        }
    });
};

/**
 * Removes a child node from a given parent node.
 *
 * A responding message is sent back to the sender of the packet context with the following parameters:
 * ```
 * {
 *     response: 'ok'
 * }
 * ```
 * @method handleRemovechild
 * @param {ozpIwc.DataApiValue} node - The parent node of which to remove the child node.
 * @param {ozpIwc.TransportPacketContext} packetContext - The packet context containing the child node's resource in
 * its entity.
 */
ozpIwc.DataApi.prototype.handleRemovechild=function(node,packetContext) {
    node.removeChild(packetContext.packet.entity.resource);
    if (node && packetContext.packet.entity.persist) {
        this.persistNode(node);
    }
    // delegate to the handleGet call
    packetContext.replyTo({
        'response':'ok'
    });
};


/**
 * Overrides the implementation of ozpIwc.CommonApiBase.handleSet
 * to add a node to persistent storage after setting it's value.
 *
 * @method handleSet
 * @param {ozpIwc.DataApiValue} node
 * @param {ozpIwc.PacketContext} packetContext
 */
ozpIwc.DataApi.prototype.handleSet=function(node,packetContext) {
    ozpIwc.CommonApiBase.prototype.handleSet.apply(this,arguments);
    if (node && packetContext.packet.entity.persist) {
        this.persistNode(node);
    }
};

/**
 * Overrides the implementation of ozpIwc.CommonApiBase.handleDelete
 * to delete a node from persistent storage before deleting it's value.
 *
 * @method handleDelete
 * @param {ozpIwc.DataApiValue} node
 */
ozpIwc.DataApi.prototype.handleDelete=function(node) {
    if (node && node.persist) {
        this.deleteNode(node);
    }
    ozpIwc.CommonApiBase.prototype.handleDelete.apply(this,arguments);
};

/**
 * 	Saves an individual node to the persistent data store
 *
 * 	@method persistNode
 * 	@param {ozpIwc.DataApiValue} node
 */
ozpIwc.DataApi.prototype.persistNode=function(node) {
    var endpointref= ozpIwc.endpoint(this.endpointUrl);
    endpointref.put(node.resource, JSON.stringify(node.entity));
};

/**
 * 	Deletes an individual node from the persistent data store
 *
 * 	@method deleteNode
 * 	@param {ozpIwc.DataApiValue} node
 */
ozpIwc.DataApi.prototype.deleteNode=function(node) {
    var endpointref= ozpIwc.endpoint(this.endpointUrl);
    endpointref.delete(node.resource);
};

/**
 * 	Collect list of nodes to persist, send to server, reset persist flag.
 * 	Currently sends every dirty node with a separate ajax call.
 *
 * 	@method persistNodes
 */
ozpIwc.DataApi.prototype.persistNodes=function() {
    // collect list of nodes to persist, send to server, reset persist flag
    var nodes=[];
    for (var node in this.data) {
        if ((this.data[node].dirty === true) &&
            (this.data[node].persist === true)) {
            nodes[nodes.length]=this.data[node].serialize();
            this.data[node].dirty = false;
        }
    }
    // send list of objects to endpoint ajax call
    if (nodes) {
        var endpointref= ozpIwc.EndpointRegistry.endpoint(this.endpointUrl);
        endpointref.saveNodes(nodes);
    }
};

/**
 * @submodule bus.api.Value
 */

/**
 * @class DataApiValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @type {Function}
 */
ozpIwc.DataApiValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
	ozpIwc.CommonApiValue.apply(this,arguments);
    config = config || {};

    /**
     * @property children
     * @type Array[String]
     */
	this.children=config.children || [];

    /**
     * @property persist
     * @type Boolean
     * @default true
     */
	this.persist=config.persist || true;

    /**
     * @property dirty
     * @type Boolean
     * @default true
     */
	this.dirty=config.dirty || true;
});

/**
 * Adds a child resource to the Data Api value.
 *
 * @method addChild
 * @param {String} child name of the child record of this
 */
ozpIwc.DataApiValue.prototype.addChild=function(child) {
    if(this.children.indexOf(child) < 0) {
        this.children.push(child);
    	this.version++;
    }
	this.dirty= true;
};

/**
 *
 * Removes a child resource from the Data Api value.
 *
 * @method removeChild
 * @param {String} child name of the child record of this
 */
ozpIwc.DataApiValue.prototype.removeChild=function(child) {
	this.dirty= true;
	var originalLen=this.children.length;
    this.children=this.children.filter(function(c) {
        return c !== child;
    });
    if(originalLen !== this.children.length) {
     	this.version++;
    }
};

/**
 * Lists all children resources of the Data Api value.
 *
 * @method listChildren
 * @param {string} child name of the child record of this
 * @returns {String[]}
 */
ozpIwc.DataApiValue.prototype.listChildren=function() {
    return ozpIwc.util.clone(this.children);
};

/**
 * Converts the Data Api value to a {{#crossLink "ozpIwc.TransportPacket"}}{{/crossLink}}.
 *
 * @method toPacket
 * @param {String} child name of the child record of this
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.DataApiValue.prototype.toPacket=function() {
	var packet=ozpIwc.CommonApiValue.prototype.toPacket.apply(this,arguments);
	packet.links=packet.links || {};
	packet.links.children=this.listChildren();
	return packet;
};

/**
 * Returns a comparison of the current Data Api value to a previous snapshot.
 *
 * @method changesSince
 * @param {ozpIwc.TransportPacket} snapshot
 * @returns {Object}
 */
ozpIwc.DataApiValue.prototype.changesSince=function(snapshot) {
    var changes=ozpIwc.CommonApiValue.prototype.changesSince.apply(this,arguments);
	if(changes) {
        changes.removedChildren=snapshot.links.children.filter(function(f) {
            return this.indexOf(f) < 0;
        },this.children);
        changes.addedChildren=this.children.filter(function(f) {
            return this.indexOf(f) < 0;
        },snapshot.links.children);
	}
    return changes;
};

/**
 * Deserializes a Data Api value from a packet and constructs this Data Api value.
 *
 * @method deserialize
 * @param {ozpIwc.TransportPacket} serverData
 */
ozpIwc.DataApiValue.prototype.deserialize=function(serverData) {
    var clone = ozpIwc.util.clone(serverData);

    // we need the persistent data to conform with the structure of non persistent data.
    this.entity= (clone.entity && typeof clone.entity.entity !== "undefined") ?  clone.entity.entity : clone.entity || {};
    this.contentType=clone.contentType || this.contentType;
    this.permissions=clone.permissions || this.permissions;
    this.version=clone.version || this.version;

    /**
     * @property _links
     * @type Object
     */
    this._links = (clone.entity && clone.entity._links) ?  clone.entity._links : clone._links || this._links;

    /**
     * @property key
     * @type String
     */
    this.key = (clone.entity && clone.entity.key) ?  clone.entity.key : clone.key || this.key;

    /**
     * @property self
     * @type Object
     */
    this.self= (clone.self) ?  clone.self : this.self;

};

/**
 * Serializes a Data Api value from a  Data Api value to a packet.
 *
 * @method serialize
 * @return {ozpIwc.TransportPacket}
 */
ozpIwc.DataApiValue.prototype.serialize=function() {
	var serverData = {};
	serverData.entity=this.entity;
	serverData.contentType=this.contentType;
	serverData.permissions=this.permissions;
	serverData.version=this.version;
	serverData.self=this.self;
	return serverData;
};


/**
 * @submodule bus.api.Type
 */

/**
 * The Intents Api. Provides Android-like intents through the IWC. Subclasses the
 * {{#crossLink "CommonApiBase"}}{{/crossLink}} Utilizes the following value classes which subclass the
 * {{#crossLink "CommonApiValue"}}{{/crossLink}}:
 *  - {{#crossLink "intentsApiDefinitionValue"}}{{/crossLink}}
 *  - {{#crossLink "intentsApiHandlerValue"}}{{/crossLink}}
 *  - {{#crossLink "intentsApiTypeValue"}}{{/crossLink}}
 *
 * @class IntentsApi
 * @namespace ozpIwc
 * @extends CommonApiBase
 * @constructor
 *
 * @params config {Object}
 * @params config.href {String} URI of the server side Data storage to load the Intents Api with
 * @params config.loadServerData {Boolean} Flag to load server side data.
 * @params config.loadServerDataEmbedded {Boolean} Flag to load embedded version of server side data.
 *                                                  Takes precedence over config.loadServerData
 */
ozpIwc.IntentsApi = ozpIwc.util.extend(ozpIwc.CommonApiBase, function (config) {
    ozpIwc.CommonApiBase.apply(this, arguments);

    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/ozpIntents/invocations",
        pattern: /^\/ozpIntents\/invocations\/.*$/,
        contentType: "application/vnd.ozp-iwc-intent-invocation-list-v1+json"
    }));
});

/**
 * Loads data from the server.
 *
 * @method loadFromServer
 */
ozpIwc.IntentsApi.prototype.loadFromServer=function() {
    return this.loadFromEndpoint(ozpIwc.linkRelPrefix + ":intent");
};
/**
 * Takes the resource of the given packet and creates an empty value in the IntentsApi. Chaining of creation is
 * accounted for (A handler requires a definition, which requires a capability).
 *
 * @param {Object} packet
 *
 * @returns {IntentsApiHandlerValue|IntentsAPiDefinitionValue|IntentsApiCapabilityValue}
 */
ozpIwc.IntentsApi.prototype.makeValue = function (packet) {
    // resource of form /majorType/minorType/action?/handler?
    var path=packet.resource.split(/\//);
    path.shift(); // shift off the empty element before the first slash
    var self=this;
    var createType=function(resource) {
        var node=new ozpIwc.IntentsApiTypeValue({
            resource: resource,
            intentType: path[0] + "/" + path[1]                
        });
        self.addDynamicNode(node);
        return node;
    };
    var createDefinition=function(resource) {
        var type="/" +path[0]+"/" + path[1];
        if(!self.data[type]) {
            self.data[type]=createType(type);
        }
        var node=new ozpIwc.IntentsApiDefinitionValue({
            resource: resource,
            intentType: path[0]+"/" + path[1],
            intentAction: path[2]
        });
        self.addDynamicNode(node);
        return node;
    };
    var createHandler=function(resource) {
        var definition="/" +path[0]+"/" + path[1] + "/" + path[2];
        if(!self.data[definition]) {
            self.data[definition]=createDefinition(definition);
        }
        
        return new ozpIwc.IntentsApiHandlerValue({
            resource: resource,
            intentType: path[0] + "/" + path[1],
            intentAction: path[2]
        });
    };
    
    switch (path.length) {
        case 2:
            return createType(packet.resource);
        case 3:

            return createDefinition(packet.resource);
        case 4:
            return createHandler(packet.resource);
        default:
            throw new ozpIwc.ApiError("badResource","Invalid resource: " + packet.resource);
    }
};

ozpIwc.IntentsApi.prototype.makeIntentInvocation = function (node,packetContext){
    var resource = this.createKey("/ozpIntents/invocations/");

    var inflightPacket = new ozpIwc.IntentsApiInFlightIntent({
        resource: resource,
        invokePacket:packetContext.packet,
        contentType: node.contentType,
        type: node.entity.type,
        action: node.entity.action,
        entity: packetContext.packet.entity,
        handlerChoices: node.getHandlers(packetContext)
    });

    this.data[inflightPacket.resource] = inflightPacket;

    return inflightPacket;
};

/**
 * Creates and registers a handler to the given definition resource path.
 *
 * @method handleRegister
 * @param {Object} node the handler value to register, or the definition value the handler will register to
 * (handler will receive a generated key if definition value is provided).
 * @param {ozpIwc.TransportPacketContext} packetContext the packet received by the router.
 */
ozpIwc.IntentsApi.prototype.handleRegister = function (node, packetContext) {
    var key=this.createKey(node.resource+"/"); //+packetContext.packet.src;

    // save the new child
    var childNode=this.findOrMakeValue({'resource':key});
    var clone = ozpIwc.util.clone(childNode);

    packetContext.packet.entity.invokeIntent = packetContext.packet.entity.invokeIntent || {};
    packetContext.packet.entity.invokeIntent.dst = packetContext.packet.src;
    packetContext.packet.entity.invokeIntent.replyTo = packetContext.packet.msgId;

    for(var i in packetContext.packet.entity){
        clone.entity[i] = packetContext.packet.entity[i];
    }
    childNode.set(clone);

    packetContext.replyTo({
        'response':'ok',
        'entity' : {
            'resource': childNode.resource
        }
    });
};

/**
 * Invokes all handlers for the given intent.
 *
 * @method handleBroadcast
 * @param {Object} node the definition or handler value used to invoke the intent.
 * @param {ozpIwc.TransportPacketContext} packetContext the packet received by the router.
 */
ozpIwc.IntentsApi.prototype.handleBroadcast = function (node, packetContext) {
    if(typeof(node.getHandlers) !== "function") {
        throw new ozpIwc.ApiError("badResource","Resource is not an invokable intent");
    }

    var handlerNodes=node.getHandlers(packetContext);

    var self = this;
    handlerNodes.forEach(function(handler){

        var inflightPacket = self.makeIntentInvocation(node,packetContext);

        var updateInFlightEntity = ozpIwc.util.clone(inflightPacket);
        updateInFlightEntity.entity.handlerChosen = {
            'resource' : handler.resource,
            'reason' : "broadcast"
        };

        updateInFlightEntity.entity.state = "delivering";

        inflightPacket.set(updateInFlightEntity);

        self.invokeIntentHandler(handler,packetContext,inflightPacket);
    });
};

/**
 * Invokes the appropriate handler for the intent from one of the following methods:
 *  <li> user preference specifies which handler to use. </li>
 *  <li> by prompting the user to select which handler to use. </li>
 *  <li> by receiving a handler resource instead of a definition resource </li>
 *  @todo <li> user preference specifies which handler to use. </li>
 *  @todo <li> by prompting the user to select which handler to use. </li>
 *
 * @method handleInvoke
 * @param {Object} node the definition or handler value used to invoke the intent.
 * @param {ozpIwc.TransportPacketContext} packetContext the packet received by the router.
 */
ozpIwc.IntentsApi.prototype.handleInvoke = function (node, packetContext) {
    if(typeof(node.getHandlers) !== "function") {
        throw new ozpIwc.ApiError("badResource","Resource is not an invokable intent");
    }
    
    var handlerNodes=node.getHandlers(packetContext);

    var inflightPacket = this.makeIntentInvocation(node,packetContext);

    if(handlerNodes.length === 1) {
        var updateInFlightEntity = ozpIwc.util.clone(inflightPacket);
        updateInFlightEntity.entity.handlerChosen = {
            'resource' : handlerNodes[0].resource,
            'reason' : "onlyOne"
        };

        updateInFlightEntity.entity.state = "delivering";
        inflightPacket.set(updateInFlightEntity);

        this.invokeIntentHandler(handlerNodes[0],packetContext,inflightPacket);
    } else {
        this.chooseIntentHandler(node,packetContext,inflightPacket);
    }
};

/**
 * Invokes the appropriate handler for set actions. If the action pertains to an In-Flight Intent, the state of the
 * entity is used to determine how the action is handled.
 *
 * @method handleSet
 * @param node
 * @param packetContext
 */
ozpIwc.IntentsApi.prototype.handleSet = function (node, packetContext) {
    if(packetContext.packet.contentType === "application/vnd.ozp-iwc-intent-invocation-v1+json"){

        var badActionResponse = {
            'response': 'badAction',
            'entity': {
                'reason': "cannot drive inFlightIntent state transition",
                'state': node.entity.state,
                'requestedState': packetContext.packet.entity.state
            }
        };

        switch (packetContext.packet.entity.state){
            case "new":
                // shouldn't be set externally
                packetContext.replyTo(badActionResponse);
                break;
            case "choosing":
                this.handleInFlightChoose(node,packetContext);
                break;
            case "delivering":
                // shouldn't be set externally
                packetContext.replyTo({'response':'badAction'});
                break;
            case "running":
                this.handleInFlightRunning(node,packetContext);
                break;
            case "fail":
                this.handleInFlightFail(node,packetContext);
                break;
            case "complete":
                this.handleInFlightComplete(node,packetContext);
                break;
            default:
                if(node.acceptedStates.indexOf(packetContext.packet.entity.state) < 0){
                    packetContext.replyTo(badActionResponse);
                }
        }
    } else {
        ozpIwc.CommonApiBase.prototype.handleSet.apply(this, arguments);
    }
};


/**
 *
 * @TODO (DOC)
 * @method handleDelete
 * @param {ozpIwc.CommonApiValue} node @TODO (DOC)
 * @param {ozpIwc.TransportPacketContext} packetContext @TODO (DOC)
 */
ozpIwc.IntentsApi.prototype.handleDelete=function(node,packetContext) {
    delete this.data[node.resource];
    packetContext.replyTo({'response':'ok'});
};

/**
 * Invokes an Intent Api Intent handler based on the given packetContext.
 *
 * @method invokeIntentHandler
 * @param {ozpIwc.intentsApiHandlerValue} node
 * @param {ozpIwc.TransportPacket} packetContext
 */
ozpIwc.IntentsApi.prototype.invokeIntentHandler = function (handlerNode, packetContext,inFlightIntent) {
    inFlightIntent = inFlightIntent || {};

    var packet = handlerNode.entity.invokeIntent;
    packet.entity = packet.entity || {};
    packet.entity.inFlightIntent = inFlightIntent.resource;

    var self = this;
    this.participant.send(packet,function(response,done) {
        var blacklist=['src','dst','msgId','replyTo'];
        var packet={};
        for(var k in response) {
            if(blacklist.indexOf(k) === -1) {
                packet[k]=response[k];
            }
        }
        self.participant.send({
            replyTo: packet.msgId,
            dst: packet.src,
            response: 'ok',
            entity: packet
        });
        packetContext.replyTo(packet);
        done();
    });
};

/**
 * Produces a modal for the user to select a handler from the given list of intent handlrs.
 * @TODO not implemented.
 *
 * @method chooseIntentHandler
 * @param {ozpIwc.intentsApiHandlerValue[]} nodeList
 * @param {ozpIwc.TransportPacket} packetContext
 */
ozpIwc.IntentsApi.prototype.chooseIntentHandler = function (node, packetContext,inflightPacket) {


    inflightPacket.entity.state = "choosing";
    ozpIwc.util.openWindow("intentsChooser.html",{
       "ozpIwc.peer":ozpIwc.BUS_ROOT,
       "ozpIwc.intentSelection": "intents.api"+inflightPacket.resource
    });
};

/**
 * Handles removing participant registrations from intent handlers when said participant disconnects.
 *
 * @method handleEventChannelDisconnectImpl
 * @param packetContext
 */
ozpIwc.IntentsApi.prototype.handleEventChannelDisconnectImpl = function (packetContext) {
    for(var node in this.data){
        if(this.data[node] instanceof ozpIwc.IntentsApiHandlerValue) {
            if(this.data[node].entity.invokeIntent.dst === packetContext.packet.entity.address) {
                delete this.data[node];
            }
        }
    }

    for(var dynNode in this.dynamicNodes) {
        var resource = this.dynamicNodes[dynNode];
        this.updateDynamicNode(this.data[resource]);
    }
};


/**
 * Handles in flight intent set actions with a state of "choosing"
 * @private
 * @method handleInFlightChoose
 * @param node
 * @param packetContext
 * @returns {null}
 */
ozpIwc.IntentsApi.prototype.handleInFlightChoose = function (node, packetContext) {

    if(node.entity.state !== "choosing"){
        return null;
    }

    var handlerNode = this.data[packetContext.packet.entity.resource];
    if(!handlerNode){
        return null;
    }

    if(node.acceptedReasons.indexOf(packetContext.packet.entity.reason) < 0){
        return null;
    }

    var updateNodeEntity = ozpIwc.util.clone(node);

    updateNodeEntity.entity.handlerChosen = {
        'resource' : packetContext.packet.entity.resource,
        'reason' : packetContext.packet.entity.reason
    };
    updateNodeEntity.entity.state = "delivering";
    node.set(updateNodeEntity);

    this.invokeIntentHandler(handlerNode,packetContext,node);

    packetContext.replyTo({
        'response':'ok'
    });
};

/**
 * Handles in flight intent set actions with a state of "running"
 *
 * @private
 * @method handleInFlightRunning
 * @param node
 * @param packetContext
 */
ozpIwc.IntentsApi.prototype.handleInFlightRunning = function (node, packetContext) {
    var updateNodeEntity = ozpIwc.util.clone(node);
    updateNodeEntity.entity.state = "running";
    updateNodeEntity.entity.handler.address = packetContext.packet.entity.address;
    updateNodeEntity.entity.handler.resource = packetContext.packet.entity.resource;
    node.set(updateNodeEntity);
    packetContext.replyTo({
        'response':'ok'
    });


};

/**
 * Handles in flight intent set actions with a state of "fail"
 *
 * @private
 * @method handleInFlightFail
 * @param node
 * @param packetContext
 */
ozpIwc.IntentsApi.prototype.handleInFlightFail = function (node, packetContext) {
    var invokePacket = node.invokePacket;
    var updateNodeEntity = ozpIwc.util.clone(node);

    updateNodeEntity.entity.state = packetContext.packet.entity.state;
    updateNodeEntity.entity.reply.contentType = packetContext.packet.entity.reply.contentType;
    updateNodeEntity.entity.reply.entity = packetContext.packet.entity.reply.entity;

    node.set(updateNodeEntity);

    var snapshot = node.snapshot();

    this.handleDelete(node,packetContext);

    this.notifyWatchers(node, node.changesSince(snapshot));

    packetContext.replyTo({
        'response':'ok'
    });

    this.participant.send({
        replyTo: invokePacket.msgId,
        dst: invokePacket.src,
        response: 'ok',
        entity: {
            response: node.entity.reply,
            invoked: false
        }
    });
};

/**
 * Handles in flight intent set actions with a state of "complete"
 *
 * @private
 * @method handleInFlightComplete
 * @param node
 * @param packetContext
 */
ozpIwc.IntentsApi.prototype.handleInFlightComplete = function (node, packetContext) {
    var invokePacket = node.invokePacket;
    var updateNodeEntity = ozpIwc.util.clone(node);

    updateNodeEntity.entity.state = packetContext.packet.entity.state;
    updateNodeEntity.entity.reply.contentType = packetContext.packet.entity.reply.contentType;
    updateNodeEntity.entity.reply.entity = packetContext.packet.entity.reply.entity;

    node.set(updateNodeEntity);

    var snapshot = node.snapshot();

    this.handleDelete(node,packetContext);

    this.notifyWatchers(node, node.changesSince(snapshot));

    packetContext.replyTo({
        'response':'ok'
    });

    this.participant.send({
        replyTo: invokePacket.msgId,
        dst: invokePacket.src,
        response: 'ok',
        entity: {
            response: node.entity.reply,
            invoked: true
        }
    });
};
/**
 * @submodule bus.api.Value
 */

/**
 * The capability value for an intent. adheres to the application/vnd.ozp-iwc-intent-definition-v1+json content type.
 * @class IntentsApiDefinitionValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @param {Object} config
 *@param {Object} config.entity
 * @param {String} config.entity.definitions the list of definitions in this intent capability.
 */
ozpIwc.IntentsApiDefinitionValue = ozpIwc.util.extend(ozpIwc.CommonApiValue, function (config) {
    config=config || {};
    config.allowedContentTypes=["application/vnd.ozp-iwc-intent-definition-v1+json"];
    config.contentType="application/vnd.ozp-iwc-intent-definition-v1+json";
    ozpIwc.CommonApiValue.call(this, config);

    /**
     * @property pattern
     * @type RegExp
     */
    this.pattern=new RegExp(ozpIwc.util.escapeRegex(this.resource)+"/[^/]*");
    this.handlers=[];
    this.entity={
        type: config.intentType,
        action: config.intentAction,        
        handlers: []
    };
});

/**
 * Returns true if the definition value contains a reference to the node specified.
 *
 * @method isUpdateNeeded
 * @param {ozpIwc.CommonApiValue} node
 * @returns {Boolean}
 */
ozpIwc.IntentsApiDefinitionValue.prototype.isUpdateNeeded=function(node) {
    return this.pattern.test(node.resource);
};

/**
 * Updates the Intents Api Definition value with a list of changed handlers.
 *
 * @method updateContent
 * @param {String[]} changedNodes
 */
ozpIwc.IntentsApiDefinitionValue.prototype.updateContent=function(changedNodes) {
    this.version++;
    this.handlers=changedNodes;
    this.entity.handlers=changedNodes.map(function(changedNode) { 
        return changedNode.resource; 
    });
};

/**
 * Returns the list of handlers registered to the definition value.
 *
 * @method getHandlers
 * @param packetContext
 * @returns {*[]}
 */
ozpIwc.IntentsApiDefinitionValue.prototype.getHandlers=function(packetContext) {
    return this.handlers;
};
/**
 * @submodule bus.api.Value
 */
/**
 * The capability value for an intent. adheres to the ozpIwc-intents-type-capabilities-v1+json content type.
 * @class IntentsApiHandlerValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @param {Object} config
 *@param {Object} config.entity
 * @param {String} config.entity.definitions the list of definitions in this intent capability.
 */
ozpIwc.IntentsApiHandlerValue = ozpIwc.util.extend(ozpIwc.CommonApiValue, function (config) {
    config=config || {};
    config.allowedContentTypes=["application/vnd.ozp-iwc-intent-handler-v1+json"];
    config.contentType="application/vnd.ozp-iwc-intent-handler-v1+json";
    ozpIwc.CommonApiValue.apply(this, arguments);
    this.entity={
        type: config.intentType,
        action: config.intentAction
    };
});

/**
 * Returns this handler wrapped in an Array.
 *
 * @method getHandlers
 * @param {ozpIwc.TransportPacket} packetContext
 * @todo packetContext not needed, left for signature matching of base class?
 * @returns {ozpIwc.intentsApiHandlerValue[]}
 */
ozpIwc.IntentsApiHandlerValue.prototype.getHandlers=function(packetContext) {
    return [this];
};

/**
 * Sets the entity value of this handler.
 *
 * @method set
 * @param {ozpIwc.TransportPacket} packet
 */
ozpIwc.IntentsApiHandlerValue.prototype.set=function(packet) {
    ozpIwc.CommonApiValue.prototype.set.apply(this,arguments);
    this.entity.invokeIntent = this.entity.invokeIntent  || {};
    this.entity.invokeIntent.dst = this.entity.invokeIntent.dst || packet.src;
    this.entity.invokeIntent.resource = this.entity.invokeIntent.resource || "/intents" + packet.resource;
    this.entity.invokeIntent.action = this.entity.invokeIntent.action || "invoke";
};

/**
 * @submodule bus.api.Value
 */

/**
 * The capability value for an intent. adheres to the ozp-intents-type-capabilities-v1+json content type.
 * @class IntentsApiTypeValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @param {Object} config
 *@param {Object} config.entity
 * @param {String} config.entity.definitions the list of definitions in this intent capability.
 */
ozpIwc.IntentsApiInFlightIntent = ozpIwc.util.extend(ozpIwc.CommonApiValue, function (config) {
    config=config || {};
    config.contentType="application/vnd.ozp-iwc-intent-invocation-v1+json";
    config.allowedContentTypes=[config.contentType];

    ozpIwc.CommonApiValue.apply(this, arguments);
    this.resource = config.resource;
    this.invokePacket=config.invokePacket;
    this.permissions=config.invokePacket.permissions;
    this.entity={
        'intent': {
            'type': config.type,
            'action': config.action,
        },
        'contentType' : config.contentType,
        'entity': config.entity,
        'state' : "new", // new, choosing, running, error, complete
        'status' : "ok", // noHandlerRegistered, noHandlerChosen
        'handlerChoices': config.handlerChoices || [],
        'handlerChosen': {
            'resource' : null, // e.g. "intents.api/text/plain/12345"
            'reason' : null // how the handler was chosen: "user", "pref", "onlyOne"
        },
        'handler': {
            'resource': null, // e.g. "names.api/address/45678"
            'address': null   // e.g. "45678"
        },
        'reply': {
            'contentType': null,
            'entity': null
        }

    };
});

ozpIwc.IntentsApiInFlightIntent.prototype.acceptedReasons = ["user","pref","onlyOne","broadcast"];
ozpIwc.IntentsApiInFlightIntent.prototype.acceptedStates = ["new","choosing","delivering","running","error","complete"];

/**
 * @submodule bus.api.Value
 */

/**
 * The capability value for an intent. adheres to the application/vnd.ozp-iwc-intent-type-v1+json content type.
 * @class IntentsApiTypeValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @param {Object} config
 *@param {Object} config.entity
 * @param {String} config.entity.definitions the list of definitions in this intent capability.
 */
ozpIwc.IntentsApiTypeValue = ozpIwc.util.extend(ozpIwc.CommonApiValue, function (config) {
    config=config || {};
    config.allowedContentTypes=["application/vnd.ozp-iwc-intent-type-v1+json"];
    config.contentType="application/vnd.ozp-iwc-intent-type-v1+json";

    ozpIwc.CommonApiValue.apply(this, arguments);

    /**
     * @property pattern
     * @type RegExp
     */
    this.pattern=new RegExp(ozpIwc.util.escapeRegex(this.resource)+"/[^/]*");
    this.entity={
        'type': config.intentType,
        'actions': []
    };
});

/**
 * Returns true if the type value contains a reference to the node specified
 *
 * @method isUpdateNeeded
 * @param {ozpIwc.CommonApiValue} node
 * @returns {Boolean}
 */
ozpIwc.IntentsApiTypeValue.prototype.isUpdateNeeded=function(node) {
    return this.pattern.test(node.resource);
};

/**
 * Updates the Intents Api Type value with a list of changed definitions.
 *
 * @method updateContent
 * @param {String[]} changedNodes
 */
ozpIwc.IntentsApiTypeValue.prototype.updateContent=function(changedNodes) {
    this.version++;
    this.entity.actions=changedNodes.map(function(changedNode) { 
        return changedNode.resource; 
    });
};
/**
 * @submodule bus.api.Type
 */

/**
 * The Names Api. Collects information about current IWC state, Manages names, aliases, and permissions through the IWC.
 * Subclasses the {{#crossLink "ozpIwc.CommonApiBase"}}{{/crossLink}}. Utilizes the
 * {{#crossLink "ozpIwc.NamesApiValue"}}{{/crossLink}} which subclasses the
 * {{#crossLink "ozpIwc.CommonApiValue"}}{{/crossLink}}.
 *
 * @class NamesApi
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiBase
 * @constructor
 *
 * @type {Function}
 */
ozpIwc.NamesApi = ozpIwc.util.extend(ozpIwc.CommonApiBase, function(config) {
    ozpIwc.CommonApiBase.apply(this, arguments);

    /**
     * How often a heartbeat message should occur.
     * @property heartbeatFrequency
     * @type {Number}
     * @default 10000
     */
    this.heartbeatFrequency = config.heartbeatFrequency || 10000;

    /**
     * The amount of heartbeats to drop an unresponsive participant after
     * @property heartbeatDropCount
     * @type {number|*}
     * @default 3
     */
    this.heartbeatDropCount = config.heartbeatDropCount || 3;
    // map the alias "/me" to "/address/{packet.src}" upon receiving the packet
    this.on("receive", function (packetContext) {
        var packet = packetContext.packet;
        if (packet.resource) {
            packet.resource = packet.resource.replace(/$\/me^/, packetContext.packet.src);
        }
    });

    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/address",
        pattern: /^\/address\/.*$/,
        contentType: "application/vnd.ozp-iwc-address-list-v1+json"
    }));
    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/multicast",
        pattern: /^\/multicast\/[^\/\n]*$/,
        contentType: "application/vnd.ozp-iwc-multicast-list-v1+json"
    }));
    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/router",
        pattern: /^\/router\/.*$/,
        contentType: "application/vnd.ozp-iwc-router-list-v1+json"
    }));
    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/api",
        pattern: /^\/api\/.*$/,
        contentType: "application/vnd.ozp-iwc-api-list-v1+json"
    }));
    //temporary injector code. Remove when api loader is implemented
    var packet = {
        resource: '/api/data.api',
        entity: {'actions': ['get', 'set', 'delete', 'watch', 'unwatch', 'addChild', 'removeChild']},
        contentType: 'application/vnd.ozp-iwc-api-v1+json'
    };
    var node=this.findOrMakeValue(packet);
    node.set(packet);
    packet = {
        resource: '/api/intents.api',
        entity: {'actions': ['get','set','delete','watch','unwatch','register','unregister','invoke']},
        contentType: 'application/vnd.ozp-iwc-api-v1+json'
    };
    node=this.findOrMakeValue(packet);
    node.set(packet);
    packet = {
        resource: '/api/names.api',
        entity: {'actions': ['get','set','delete','watch','unwatch']},
        contentType: 'application/vnd.ozp-iwc-api-v1+json'
    };
    node=this.findOrMakeValue(packet);
    node.set(packet);
    packet = {
        resource: '/api/system.api',
        entity: { 'actions': ['get','set','delete','watch','unwatch']},
        contentType: 'application/vnd.ozp-iwc-api-v1+json'
    };
    node=this.findOrMakeValue(packet);
    node.set(packet);
    var self = this;
    setInterval(function(){
        self.removeDeadNodes();
    },this.heartbeatFrequency);
});

ozpIwc.NamesApi.prototype.removeDeadNodes = function(){
    for(var key in this.data){
        var node = this.data[key];
        if(this.dynamicNodes.indexOf(key) < 0 && node.entity && node.entity.time) {
            if ((ozpIwc.util.now() - node.entity.time) > this.heartbeatFrequency * this.heartbeatDropCount) {
                var snapshot = node.snapshot();
                node.deleteData;
                this.notifyWatchers(node, node.changesSince(snapshot));
                delete this.data[key];
                // update all the collection values
                this.dynamicNodes.forEach(function(resource) {
                    this.updateDynamicNode(this.data[resource]);
                },this);
            }
        }
    }
};
/**
 * Checks that the given packet context's resource meets the requirements of the api. Throws exception if fails
 * validation
 *
 * @method validateResource
 * @param {CommonApiValue} node @TODO is a node needed to validate?
 * @param {ozpIwc.TransportPacketContext} packetContext The packetContext with the resource to be validated.
 */
ozpIwc.NamesApi.prototype.validateResource=function(node,packetContext) {
    if(packetContext.packet.resource && !packetContext.packet.resource.match(/^\/(api|address|multicast|router|me)/)){
        throw new ozpIwc.ApiError('badResource',"Invalide resource for name.api: " + packetContext.packet.resource);
    }
};

/**
 * Makes a {{#crossLink "ozpIwc.NamesApiValue"}}{{/crossLink}} from the given packet.
 *
 * @method makeValue
 * @param {ozpIwc.TransportPacket} packet
 * @returns {ozpIwc.NamesApiValue}
 */
ozpIwc.NamesApi.prototype.makeValue = function(packet) {
    var path=packet.resource.split("/");
    var config={
        resource: packet.resource,
        contentType: packet.contentType
    };
    switch (packet.contentType) {
        case "application/vnd.ozp-iwc-api-v1+json":
            config.allowedContentTypes=["application/vnd.ozp-iwc-api-v1+json"];
            break;
        case "application/vnd.ozp-iwc-multicast-address-v1+json":
            config.allowedContentTypes=["application/vnd.ozp-iwc-multicast-address-v1+json"];
            if(path.length >= 3){
                var resource = '/' + path[1] + '/' + path[2];
                if(this.dynamicNodes.indexOf(resource) < 0){
                    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
                        resource: resource,
                        pattern: new RegExp("^\/" + path[1].replace("$","\\$").replace(".","\\.") + "\/" +
                            path[2].replace("$","\\$").replace(".","\\.") + "\/.*$"),
                        contentType: "application/vnd.ozp-iwc-address-list-v1+json"
                    }));
                }
            }
            break;
        case "application/vnd.ozp-iwc-address-v1+json":
            config.allowedContentTypes=["application/vnd.ozp-iwc-address-v1+json"];
            break;
        case "application/vnd.ozp-iwc-router-v1+json":
            config.allowedContentTypes=["application/vnd.ozp-iwc-router-v1+json"];
            break;

        default:
            throw new ozpIwc.ApiError("badContent","Not a valid contentType of names.api: " + path[1] + " in " + packet.resource);
    }
    return new ozpIwc.NamesApiValue(config);
};

/**
 * Handles removing participant addresses from the names api.
 *
 * @method handleEventChannelDisconnectImpl
 * @param packetContext
 */
ozpIwc.NamesApi.prototype.handleEventChannelDisconnectImpl = function (packetContext) {

    delete this.data[packetContext.packet.entity.namesResource];

    for(var node in this.dynamicNodes) {
        var resource = this.dynamicNodes[node];
        this.updateDynamicNode(this.data[resource]);
    }
};

/**
 * @submodule bus.api.Value
 */

/**
 * @class NamesApiValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @type {Function}
 * @param {Object} config
 * @param {String[]} config.allowedContentTypes a list of content types this Names Api value will accept.
 */
ozpIwc.NamesApiValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
    if(!config || !config.allowedContentTypes) {
        throw new Error("NamesAPIValue must be configured with allowedContentTypes.");
    }
	ozpIwc.CommonApiValue.apply(this,arguments);
});

var ozpIwc=ozpIwc || {};

/**
 * @submodule bus.api.Type
 */

/**
 * The System Api. Provides reference data of registered applications, versions, and information about the current user
 * through the IWC. Subclasses the {{#crossLink "ozpIwc.CommonApiBase"}}{{/crossLink}}. Utilizes the following value
 * classes which subclass the {{#crossLink "ozpIwc.CommonApiValue"}}{{/crossLink}}:
 *  - {{#crossLink "ozpIwc.SystemApiApplicationValue"}}{{/crossLink}}
 *  - {{#crossLink "ozpIwc.SystemApiMailboxValue"}}{{/crossLink}}
 *
 * @class SystemApi
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiBase
 * @constructor
 *
 * @type {Function}
 * @param {Object} config
 */
ozpIwc.SystemApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function(config) {
    ozpIwc.CommonApiBase.apply(this,arguments);

    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/application",
        pattern: /^\/application\/.*$/,
        contentType: "application/vnd.ozp-iwc-application-list-v1+json"
    }));

    this.on("changedNode",this.updateIntents,this);
});

/**
 * Loads data from the server.
 *
 * @method loadFromServer
 */
ozpIwc.SystemApi.prototype.loadFromServer=function() {

    var self=this;
    var headers = [
        {name: "Accept", value: "application/vnd.ozp-application-v1+json"}
    ];
    return new Promise(function(resolve, reject) {
        self.loadFromEndpoint(ozpIwc.linkRelPrefix + ":application", headers)
            .then(function() {
                self.loadFromEndpoint(ozpIwc.linkRelPrefix + ":user")
                    .then(function() {
                        self.loadFromEndpoint(ozpIwc.linkRelPrefix + ":system")
                            .then(function() {
                                resolve("system.api load complete");
                            });
                    });
            })
            .catch(function(error) {
                reject(error);
            });
    });
};

/**
 * Update all intents registered to the given System Api node.
 *
 * @method updateIntents
 * @param {ozpIwc.SystemApiApplicationValue} node
 * @param {?} changes @TODO unused.
 */
ozpIwc.SystemApi.prototype.updateIntents=function(node,changes) {
    if(!node.getIntentsRegistrations) {
        return;
    }
    var intents=node.getIntentsRegistrations();
    if(!intents) {
        return;
    }
    intents.forEach(function(i) {
        var icon = i.icon || (node.entity && node.entity.icons && node.entity.icons.small) ? node.entity.icons.small : '';
        var label = i.label || node.entity.name;
        this.participant.send({
            'dst' : "intents.api",
            'src' : "system.api",
            'action': "set",
            'resource': "/"+i.type+"/"+i.action+"/system.api"+node.resource.replace(/\//g,'.'),
            'contentType': "application/vnd.ozp-iwc-intent-handler-v1+json",
            'entity': {
                'type': i.type,
                'action': i.action,
                'icon': icon,
                'label': label,
                '_links': node.entity._links,
                'invokeIntent': {
                    'action' : 'invoke',
                    'resource' : node.resource
                }
            }
        });
    },this);

};

/**
 * Creates a System Api Application or Mailbox value from the given packet.
 *
 * @method makeValue
 * @param {ozpIwc.TransportPacket} packet
 * @returns {ozpIwc.SystemApiMailboxValue|ozpIwc.SystemApiApplicationValue}
 */
ozpIwc.SystemApi.prototype.makeValue = function(packet){
        switch (packet.contentType) {
            case "application/vnd.ozp-application-v1+json":
                var launchDefinition = "/system" + packet.resource;
                packet.entity.launchDefinition = packet.entity.launchDefinition || launchDefinition;

                var app = new ozpIwc.SystemApiApplicationValue({
                    resource: packet.resource,
                    entity: packet.entity,
                    contentType: packet.contentType,
                    systemApi: this
                });

                this.participant.send({
                    dst: "intents.api",
                    action: "register",
                    contentType: "application/vnd.ozp-iwc-intent-handler-v1+json",
                    resource: launchDefinition,
                    entity: {
                        icon: (packet.entity.icons && packet.entity.icons.small) ? packet.entity.icons.small : "",
                        label: packet.entity.name || "",
                        contentType: "application/json",
                        invokeIntent: {
                            dst: "system.api",
                            action: "invoke",
                            resource: packet.resource
                        }
                    }
                }, function (response, done) {
                    app.entity.launchResource = response.entity.resource;
                    done();
                });

                return app;
            default:
                return new ozpIwc.CommonApiValue(packet);
        }
};

/**
 * Handles System api requests with an action of "set"
 * @method handleSet
 */
ozpIwc.SystemApi.prototype.handleSet = function() {
    throw new ozpIwc.ApiError("badAction", "Cannot modify the system API");
};

/**
 * Handles System api requests with an action of "delete"
 *
 * @method handleDelete
 */
ozpIwc.SystemApi.prototype.handleDelete = function() {
    throw new ozpIwc.ApiError("badAction", "Cannot modify the system API");
};

/**
 * Handles System api requests with an action of "launch"
 *
 * @method handleLaunch
 */
ozpIwc.SystemApi.prototype.handleLaunch = function(node,packetContext) {

    this.participant.send({
        dst: "intents.api",
        contentType: "application/vnd.ozp-iwc-intent-handler-v1+json",
        action: "invoke",
        resource: node.entity.launchResource,
        entity: packetContext.packet.entity
    });
    packetContext.replyTo({'action': "ok"});
};

/**
 * Handles System api requests with an action of "invoke"
 *
 * @method handleInvoke
 */
ozpIwc.SystemApi.prototype.handleInvoke = function(node,packetContext) {
    if(packetContext.packet.entity && packetContext.packet.entity.inFlightIntent){
        this.launchApplication(node,packetContext.packet.entity.inFlightIntent);
        packetContext.replyTo({'action': "ok"});
    } else{
        packetContext.replyTo({'action': "badResource"});
    }

};

/**
 * Launches the specified node's application.
 *
 * @method launchApplication
 * @param {ozpIwc.SystemApiApplicationValue} node
 * @param {ozpIwc.SystemApiMailboxValue} mailboxNode
 */
ozpIwc.SystemApi.prototype.launchApplication=function(node,intentResource) {
    var launchParams=[
            "ozpIwc.peer="+encodeURIComponent(ozpIwc.BUS_ROOT),
            "ozpIwc.inFlightIntent="+encodeURIComponent(intentResource)
    ];

    ozpIwc.util.openWindow(node.entity._links.describes.href,launchParams.join("&"));
};


/**
 * @submodule bus.api.Value
 */

/**
 * @class SystemApiApplicationValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @type {Function}
 * @param {Object} config
 */
ozpIwc.SystemApiApplicationValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
    ozpIwc.CommonApiValue.apply(this,arguments);

    /**
     * A reference to the instantiated system Api
     * @property systemApi
     * @type {ozpIwc.SystemApi}
     */
    this.systemApi=config.systemApi;
});

/**
 * Returns the intents registered to this value.
 *
 * @method getIntentsRegistrations
 * @returns {ozpIwc.IntentsApiHandlerValue[]}
 */
ozpIwc.SystemApiApplicationValue.prototype.getIntentsRegistrations=function() {
    return this.entity.intents;
};
//# sourceMappingURL=ozpIwc-bus.js.map