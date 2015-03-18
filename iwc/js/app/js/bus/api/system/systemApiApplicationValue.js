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