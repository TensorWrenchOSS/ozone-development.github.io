ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.defaultPolicies = {};

/**
 * Allows origins to connect that are included in the hard coded whitelist.
 * @method '/policy/connect'
 * @param request
 * @returns {string}
 */
ozpIwc.policyAuth.defaultPolicies['policy://ozpIwc/connect'] = function(request){
    var policyActions = ['connect'];

    if(!ozpIwc.util.arrayContainsAll(policyActions,request.action['ozp:iwc:action'])){
        return "NotApplicable";
    } else {
        return "Permit";
    }
};

/**
 * Applies the sendAs policy requirements to a default policy. The given request must have an action of 'sendAs'.
 * @method '/policy/sendAs'
 * @param request
 * @param {Object} request.subject
 * @param {Object} request.resource
 * @returns {string}
 */
ozpIwc.policyAuth.defaultPolicies['/policy/sendAs'] = function(request){
    return ozpIwc.ozpIwcPolicies.defaultPolicy(request,'sendAs');
};

/**
 * Applies the receiveAs policy requirements to a default policy. The given request must have an action of 'receiveAs'.
 * @method '/policy/sendAs'
 * @param request
 * @param {Object} request.subject
 * @param {Object} request.resource
 * @returns {string}
 */
ozpIwc.policyAuth.defaultPolicies['/policy/receiveAs'] = function(request){
    return ozpIwc.ozpIwcPolicies.defaultPolicy(request,'receiveAs');
};

/**
 * Applies the read policy requirements to a default policy. The given request must have an action of 'read'.
 * @method '/policy/sendAs'
 * @param request
 * @param {Object} request.subject
 * @param {Object} request.resource
 * @returns {string}
 */
ozpIwc.policyAuth.defaultPolicies['/policy/read'] = function(request){
    return ozpIwc.ozpIwcPolicies.defaultPolicy(request,'read');
};

/**
 * Applies the api access policy requirements to a default policy. The given request must have an action of 'access'.
 * @method '/policy/sendAs'
 * @param request
 * @param {Object} request.subject
 * @param {Object} request.resource
 * @returns {string}
 */
ozpIwc.policyAuth.defaultPolicies['/policy/apiNode'] = function(request){
    return ozpIwc.ozpIwcPolicies.defaultPolicy(request,'access');
};
