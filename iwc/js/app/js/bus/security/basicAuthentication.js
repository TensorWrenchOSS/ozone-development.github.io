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

