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

/**
 * Returns an async action that resolves when all async Actions are resolved with their resolved values (if applies).
 * @method all
 * @param asyncActions
 */
ozpIwc.AsyncAction.all = function(asyncActions) {
    var returnAction = new ozpIwc.AsyncAction();
    var count = asyncActions.length;
    var self = this;
    var results = [];


    //Register a callback for each action's "success"
    asyncActions.forEach(function(action,index){
        // If its not an asyncAction, pass it through as a result.
        if(!self.isAnAction(action)){
            results[index] = action;
            if(--count === 0) {
                returnAction.resolve('success',results);
            }
        }else {
            action
                .success(function (result) {
                    results[index] = result;
                    //once all actions resolved, intermediateAction resolve
                    if (--count === 0) {
                        returnAction.resolve('success', results);
                    }
                }, self)
                .failure(function (err) {
                    //fail the returnAction if any fail.
                    returnAction.resolve('failure', err);
                }, self);
        }
    });

    return returnAction;
};

/**
 * Returns true if the object is an AsyncAction, otherwise false.
 * @method isAnAction
 * @param {*} action
 * @returns {Boolean}
 */
ozpIwc.AsyncAction.isAnAction = function(action){
    return ozpIwc.AsyncAction.prototype.isPrototypeOf(action);
};