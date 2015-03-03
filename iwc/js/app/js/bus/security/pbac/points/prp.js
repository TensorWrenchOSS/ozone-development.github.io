ozpIwc = ozpIwc || {};


ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * Policy Repository Point
 *
 * @param config
 * @param {Object} config.policyCache
 * @constructor
 */
ozpIwc.policyAuth.PRP = function(config){
    config = config || {};

    this.persistentPolicies = config.persistentPolicies || [];
    this.policyCache = config.policyCache || ozpIwc.policyAuth.defaultPolicies;


};


/**
 * Gathers policies by their URN. These policies may need formatting by the formatPolicies function to gather any
 * attribute data needed for the policy evaluation.
 * If a policy cannot be found, it is labeled as a "denyAll" policy and placed in the cache. Thus, making any permission
 * check using said policy always deny.
 *
 * @method getPolicy(policyURIs)
 * @param {String | Array<String> } [policyURIs] The subject attributes or id performing the action.
 * @param {String} [combiningAlgorithm] Defaults to “deny-overrides”.
 * @return {ozpIwc.AsyncAction} will resolve with an array of policy data.
 */
ozpIwc.policyAuth.PRP.prototype.getPolicies = function(policyURIs){
    var asyncAction = new ozpIwc.AsyncAction();
    policyURIs = policyURIs || [];
    policyURIs = Array.isArray(policyURIs)? policyURIs : [policyURIs];
    var policies = [];

    var policiesToGather = this.persistentPolicies.concat(policyURIs);
    for(var i in policiesToGather){
        if(this.policyCache[policiesToGather[i]]){
            policies.push(ozpIwc.util.clone(this.policyCache[policiesToGather[i]]));
        } else {
            var async = this.fetchPolicy(policiesToGather[i]);

            //Push the policy fetch to the array, when it resolves its value (policy) will be part of the array
            policies.push(async);
        }
    }

    // If there are no policies to check against, assume trivial and permit
    if(policies.length === 0){
        return asyncAction.resolve('success',[ozpIwc.ozpIwcPolicies.permitAll]);
    }

    return ozpIwc.AsyncAction.all(policies);
};



/**
 * The URN of the default combining algorithm to use when basing a decision on multiple rules in a policy.
 * @TODO not used.
 * @property defaultCombiningAlgorithm
 * @type {String}
 * @default 'urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides'
 */
ozpIwc.policyAuth.PRP.prototype.defaultCombiningAlgorithm =
    'urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides';

/**
 * Fetches the requested policy and stores a copy of it in the cache. Returns a denyAll if policy is unobtainable.
 * @method fetchPolicy
 * @param {String} policyURI the uri to gather the policy from
 * @returns {AsyncAction} will resolve with the gathered policy constructed as an ozpIwc.policyAuth.Policy.
 */
ozpIwc.policyAuth.PRP.prototype.fetchPolicy = function(policyURI){
    var asyncAction = new ozpIwc.AsyncAction();
    var self = this;
    ozpIwc.util.ajax({
        'method': "GET",
        'href': policyURI
    }).then(function(data){
        self.policyCache[policyURI] = self.formatPolicy(data.response);
        asyncAction.resolve('success',ozpIwc.util.clone(self.policyCache[policyURI]));
    })['catch'](function(e){
        //Note: failure resolves success because we force a denyAll policy.
        asyncAction.resolve('success',self.getDenyall(policyURI));
    });
    return asyncAction;
};

/**
 * Turns JSON data in to ozpIwc.policyAuth.Policy
 * @method formatPolicy
 * @param data
 * @returns {ozpIwc.policyAuth.Policy}
 */
ozpIwc.policyAuth.PRP.prototype.formatPolicy = function(data){
    return new ozpIwc.policyAuth.Policy(data);
};

/**
 * Returns a policy that will always deny any request. Said policy is stored in the cache under the given URN
 * @param urn
 * @returns {ozpIwc.policyAuth.Policy} a denyAll policy
 */
ozpIwc.policyAuth.PRP.prototype.getDenyall = function(urn){
    if(this.policyCache[urn]){
        return this.policyCache[urn];
    } else {
        this.policyCache[urn] = ozpIwc.ozpIwcPolicies.denyAll;
        return this.policyCache[urn];
    }
};
