ozpIwc = ozpIwc || {};
ozpIwc.policyAuth = ozpIwc.policyAuth || {};
ozpIwc.policyAuth.PolicyCombining = ozpIwc.policyAuth.PolicyCombining || {};


/**
 *
 *
 * @method urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides
 */
ozpIwc.policyAuth.PolicyCombining['deny-overrides'] =
        function(policies,request){
    var atLeastOneErrorD,
        atLeastOneErrorP,
        atLeastOneErrorDP,
        atLeastOnePermit = false;

    for(var i in policies){
        var decision = policies[i](request);
        switch(decision){
            case "Deny":
                return "Deny";
            case "Permit":
                atLeastOnePermit = true;
                break;
            case "NotApplicable":
                continue;
            case "Indeterminate{D}":
                atLeastOneErrorD = true;
                break;
            case "Indeterminate{P}":
                atLeastOneErrorP = true;
                break;
            case "Indeterminate{DP}":
                atLeastOneErrorDP = true;
                break;
            default:
                continue;
        }
    }

    if(atLeastOneErrorDP){
        return "Indeterminate{DP}";
    } else if(atLeastOneErrorD && (atLeastOneErrorP || atLeastOnePermit)){
        return "Indeterminate{DP}";
    } else if(atLeastOneErrorD){
        return "Indeterminate{D}";
    } else if(atLeastOnePermit) {
        return "Permit";
    } else if(atLeastOneErrorP){
        return "Indeterminate{P}";
    }

    return "NotApplicable";

};


/**
 * @method urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:permit-overrides
 */
ozpIwc.policyAuth.PolicyCombining['permit-overrides'] =
        function(){

};

/**
 * @method urn:oasis:names:tc:xacml:1.0:policy-combining-algorithm:first-applicable
 */
ozpIwc.policyAuth.PolicyCombining['first-applicable'] =
        function(){

};

/**
 * @method urn:oasis:names:tc:xacml:1.0:policy-combining-algorithm:only-one-applicable
 */
ozpIwc.policyAuth.PolicyCombining['only-one-applicable'] =
        function(){

};

/**
 * @method urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:ordered-deny-overrides
 */
ozpIwc.policyAuth.PolicyCombining['ordered-deny-overrides'] =
        function(){

};

/**
 * @method urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:ordered-permit-overrides
 */
ozpIwc.policyAuth.PolicyCombining['ordered-permit-overrides'] =
        function(){

};

/**
 * @method urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-unless-permit
 */
ozpIwc.policyAuth.PolicyCombining['deny-unless-permit'] =
        function(){

};

/**
 * @method urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:permit-unless-deny
 */
ozpIwc.policyAuth.PolicyCombining['permit-unless-deny'] =
        function(){

};