ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * A security attribute constructor for policyAuth use. Structured to be common to both bus-internal and api needs.
 * @class SecurityAttribute
 * @namespace ozpIwc.policyAuth
 * @param config
 * @constructor
 */
ozpIwc.policyAuth.SecurityAttribute = function(config){
    config = config || {};
    this.attributes =  config.attributes ||  {};
    this.comparator = config.comparator || this.comparator;
};

/**
 * Adds a value to the security attribute if it does not already exist. Constructs the attribute object if it does not
 * exist
 *
 * @method pushIfNotExist
 * @param id
 * @param val
 */
ozpIwc.policyAuth.SecurityAttribute.prototype.pushIfNotExist = function(id, val, comp) {
    comp = comp || this.comparator;
    if(!val){
        return;
    }
    var value = Array.isArray(val) ? val : [val];
    if (!this.attributes[id]) {
        this.attributes[id] = [];
        this.attributes[id] = this.attributes[id].concat(value);
    } else {
        for (var i in this.attributes[id]) {
            for (var j in value) {
                if (!comp(this.attributes[id][i], value[j])) {
                    this.attributes[id].push(val);
                }
            }
        }
    }
};

/**
 * Clears the attributes given to an id.
 * @param id
 */
ozpIwc.policyAuth.SecurityAttribute.prototype.clear = function(id){
    delete this.attributes[id];
};

/**
 * Clears all attributes.
 * @method clear
 */
ozpIwc.policyAuth.SecurityAttribute.prototype.clearAll = function(){
    this.attributes = {};
};

/**
 * Returns an object containing all of the attributes.
 * @returns {Object}
 */
ozpIwc.policyAuth.SecurityAttribute.prototype.getAll = function(){
    return this.attributes;
};

/**
 *
 * Determines the equality of an object against a securityAttribute value.
 * @method comparator
 * @param a
 * @param b
 * @returns {boolean}
 */
ozpIwc.policyAuth.SecurityAttribute.prototype.comparator = function(a, b) {
    return a === b;
};