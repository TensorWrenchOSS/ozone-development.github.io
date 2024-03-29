
/**
 * Classes related to security aspects of the IWC.
 * @module bus
 * @submodule bus.security
 */

/**
 * Attribute Based Access Control policies.
 * @class ozpIwcPolicies
 * @static
 */
ozpIwc.ozpIwcPolicies={};

/**
 * Returns `permit` when the request's object exists and is empty.
 *
 * @static
 * @method permitWhenObjectHasNoAttributes
 * @param request
 *
 * @returns {String}
 */
ozpIwc.ozpIwcPolicies.permitWhenObjectHasNoAttributes=function(request) {
    if(request.object && Object.keys(request.object).length===0) {
        return "Permit";
    }
    return "Undetermined";
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
ozpIwc.ozpIwcPolicies.subjectHasAllObjectAttributes=function(request) {
    // if no object permissions, then it's trivially true
    if(!request.object) {
        return "Permit";
    }
    var subject = request.subject || {};
    if(ozpIwc.util.objectContainsAll(subject,request.object,this.implies)) {
        return "Permit";
    }
    return "Deny";
};

/**
 * Returns `permit` for any scenario.
 *
 * @static
 * @method permitAll
 * @returns {String}
 */
ozpIwc.ozpIwcPolicies.permitAll=function() {
    return "Permit";
};


/**
 * Returns `Deny` for any scenario.
 *
 * @static
 * @method denyAll
 * @returns {String}
 */
ozpIwc.ozpIwcPolicies.denyAll=function() {
    return "Deny";
};



/**
 * Applies trivial logic to determing a subject's containing of object values
 * @static
 * @method implies
 * @param {Array} subjectVal
 * @param {Array} objectVal
 *
 * @returns {Boolean}
 */
ozpIwc.ozpIwcPolicies.implies=function(subjectVal,objectVal) {
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
 * Determines if a request should be permitted by comparing its action to the requested policies action. Then testing
 * if the request subject passes all of the request resources.
 * @method defaultPolicy
 * @param request
 * @param action
 * @returns {string} NotApplicable, Deny, or Permit
 */
ozpIwc.ozpIwcPolicies.defaultPolicy = function(request,action){
    action = Array.isArray(action) ? action : [action];
    if(!ozpIwc.util.arrayContainsAll(action,request.action['ozp:iwc:action'])) {
        return "NotApplicable";
    } else if(!ozpIwc.util.objectContainsAll(request.subject,request.resource,ozpIwc.ozpIwcPolicies.implies)) {
        return "Deny";
    } else {
        return "Permit";
    }
};

ozpIwc.ozpIwcPolicies.defaultPolicies = {};

/**
 * Allows origins to connect that are included in the hard coded whitelist.
 * @method '/policy/connect'
 * @param request
 * @returns {string}
 */
ozpIwc.ozpIwcPolicies.defaultPolicies['policy://ozpIwc/connect'] = function(request){
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
ozpIwc.ozpIwcPolicies.defaultPolicies['policy://policy/sendAs'] = function(request){
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
ozpIwc.ozpIwcPolicies.defaultPolicies['policy://policy/receiveAs'] = function(request){
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
ozpIwc.ozpIwcPolicies.defaultPolicies['policy://policy/read'] = function(request){
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
ozpIwc.ozpIwcPolicies.defaultPolicies['policy://policy/apiNode'] = function(request){
    return ozpIwc.ozpIwcPolicies.defaultPolicy(request,'access');
};
