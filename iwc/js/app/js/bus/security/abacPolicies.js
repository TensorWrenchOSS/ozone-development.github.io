
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

