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