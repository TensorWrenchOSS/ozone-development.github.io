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
    // syslog levels
    ERROR: { logLevel: true, severity: 3, name: "ERROR"},
    INFO: { logLevel: true, severity: 6, name: "INFO"},
    DEBUG: { logLevel: true, severity: 7, name: "DEBUG"},
    DEFAULT: { logLevel: true, severity: 0, name: "DEFAULT"},
    
    threshold: 3,
    
    /**
     * A wrapper for log messages. Forwards to console.log if available.
     * @property log
     * @type Function
     */
	log: function(level) {
        if(level.logLevel === true && typeof(level.severity) === "number") {
            ozpIwc.log.logMsg(level,Array.prototype.slice.call(arguments, 1));
        } else {
            ozpIwc.log.logMsg(ozpIwc.log.DEFAULT,Array.prototype.slice.call(arguments, 0));
        }
	},

    logMsg: function(level,args) {
        if(level.severity > ozpIwc.log.threshold) {
            return;
        }
        var log = Function.prototype.bind.call(window.console.log, window.console);
        log.apply(window.console,["["+level.name+"] "].concat(args));
    },
    
    /**
     * A wrapper for error messages. Forwards to console.error if available.
     * @property error
     * @type Function
     */
	error: function() {
        ozpIwc.log.logMsg(ozpIwc.log.ERROR,Array.prototype.slice.call(arguments, 0));
	},

    /**
     * A wrapper for debug messages. Forwards to console.error if available.
     * @property error
     * @type Function
     */
    debug: function() {
        ozpIwc.log.logMsg(ozpIwc.log.DEBUG,Array.prototype.slice.call(arguments, 0));
//        window.console.log.apply(window.console,arguments);
    },
    /**
     * A wrapper for debug messages. Forwards to console.error if available.
     * @property error
     * @type Function
     */
    info: function() {
        ozpIwc.log.logMsg(ozpIwc.log.INFO,Array.prototype.slice.call(arguments, 0));
//        window.console.log.apply(window.console,arguments);
    }
};
