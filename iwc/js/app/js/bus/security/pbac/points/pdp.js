ozpIwc = ozpIwc || {};

ozpIwc.policyAuth = ozpIwc.policyAuth || {};

/**
 * System entity that evaluates applicable policy and renders an authorization decision.
 * @class PDP
 * @namespace ozpIwc.policyAuth
 *
 * @param {Object} config
 * @param {ozpIwc.policyAuth.PRP} config.prp Policy Repository Point for the PDP to gather policies from.
 * @param {ozpIwc.policyAuth.PIP} config.pip Policy Information Point for the PDP to gather attributes from.
 * @constructor
 */
ozpIwc.policyAuth.PDP = function(config){
    config=config || {};

    /**
     * Policy Repository Point
     * @property prp
     * @type {ozpIwc.policyAuth.PRP}
     * @default new ozpIwc.policyAuth.PRP()
     */
    this.prp = config.prp ||  new ozpIwc.policyAuth.PRP();


    /**
     * Policy Information Point
     * @property pip
     * @type {ozpIwc.policyAuth.PIP}
     * @default new ozpIwc.policyAuth.PIP()
     */
    this.pip = config.pip || new ozpIwc.policyAuth.PIP();

    this.policySets = config.policySets ||
    {
        'connectSet': ["/policy/connect"],
        'apiSet': ["/policy/apiNode"],
        'readSet': ["/policy/read"],
        'receiveAsSet': ["/policy/receiveAs"],
        'sendAsSet': ["/policy/sendAs"]
    };
};


/**
 * @method isPermitted(request)
 * @param {Object | String} [request.subject]       The subject attributes or id performing the action.
 * @param {Object | String} [request.resource]      The resource attributes or id that is being acted upon.
 * @param {Object | String} [request.action]        The action attributes.  A string should be interpreted as the
 *                                                  value of the “action-id” attribute.
 * @param {Array<String>} [request.policies]        A list of URIs applicable to this decision.
 * @param {String} [request. combiningAlgorithm]    Only supports “deny-overrides”
 * @param {Object} [contextHolder]                  An object that holds 'securityAttribute' attributes to populate the
 *                                                  PIP cache with for request/policy use.
 * @returns {ozpIwc.AsyncAction} will resolve with 'success' if the policy gives a "Permit".
 *                                    rejects else wise. the async success will receive:
 * ```{
 *      'result': <String>,
 *      'request': <Object> // a copy of the request passed in,
 *      'formattedRequest': <Object> // a copy of the formatted request (for PDP user caching)
 *    }```
 */
ozpIwc.policyAuth.PDP.prototype.isPermitted = function(request){
    var asyncAction = new ozpIwc.AsyncAction();

    var self = this;
    //If there is no request information, its a trivial "Permit"
    if(!request){
        return asyncAction.resolve('success',{
                'result':"Permit"
            });
    }


    var onError = function(response){
        asyncAction.resolve('failure',err);
    };
    //Format the request
    this.formatRequest(request)
        .success(function(formattedRequest){

            // Get the policies from the PRP
            self.prp.getPolicies(formattedRequest.policies)
                .success(function(policies){

                    var result = ozpIwc.policyAuth.PolicyCombining[formattedRequest.combiningAlgorithm](policies,formattedRequest.category);
                    var response = {
                        'result':result,
                        'request': request,
                        'formattedRequest': formattedRequest
                    };
                    if(result === "Permit"){
                       asyncAction.resolve('success',response);
                    } else {
                        onError(response);
                    }
                }).failure(onError);
        }).failure(onError);
    return asyncAction;
};


ozpIwc.policyAuth.PDP.prototype.formatAttributes = function(attributes,pip){
    attributes = Array.isArray(attributes) ? attributes : [attributes];
    var asyncAction = new ozpIwc.AsyncAction();
    pip = pip || this.pip;
    var asyncs = [];
    for(var i in attributes){
        asyncs.push(this.formatAttribute(attributes[i],pip));
    }
    ozpIwc.AsyncAction.all(asyncs).success(function(attrs){
        var retObj = {};
        for(var i in attrs){
            if(Object.keys(attrs[i]).length > 0) {
                for (var j in attrs[i]) {
                    retObj[j] = attrs[i][j];
                }
            }
        }
        asyncAction.resolve("success",retObj);
    });
    return asyncAction;
};




    /**
 * Takes a URN, array of urns, object, array of objects, or array of any combination and fetches/formats to the
 * necessary structure to be used by a request of policy's category object.
 *
 * @method formatAttribute
 * @param {String|Object|Array<String|Object>}attribute The attribute to format
 * @param {ozpIwc.policyAuth.PIP} [pip] Policy information point, uses ozpIwc.authorization.pip by default.
 * @returns {ozpIwc.AsyncAction} returns an async action that will resolve with an object of the formatted attributes.
 *                               each attribute is ID indexed in the object, such that the formatting of id
 *                               `ozp:iwc:node` which has attributes `a` and `b`would resolve as follows:
 *                  ```
 *                  {
 *                      'ozp:iwc:node': {
 *                          'attributeValues': ['a','b']
 *                       }
 *                  }
 *                  ```
 *
 */
ozpIwc.policyAuth.PDP.prototype.formatAttribute = function(attribute,pip){
    var asyncAction = new ozpIwc.AsyncAction();
    pip = pip || this.pip;
    var asyncs = [];
    if(!attribute){
        return asyncAction.resolve('success');
    }


    if(!attribute){
        //do nothing and return an empty object.
        asyncAction.resolve('success', {});

    }else if(typeof attribute === "string") {
        // If its a string, use it as a key and fetch its attrs from PIP
        pip.getAttributes(attribute)
            .success(function(attr){
                //TODO check if is an array or string (APPLY RECURSION!)
                asyncAction.resolve("success",attr);
            })

    } else if(Array.isArray(attribute)){
        // If its an array, its multiple actions. Wrap as needed
        return this.formatAttributes(attribute,pip);

    } else if(typeof attribute === "object"){
        // If its an object, make sure each key's value is an array.
        var keys = Object.keys(attribute);
        for (var i in keys) {
            var tmp = attribute[keys[i]];
            if (['string', 'number', 'boolean'].indexOf(typeof attribute[keys[i]]) >= 0) {
                attribute[keys[i]] =  [tmp];
            }
            attribute[keys[i]] = attribute[keys[i]] || [];
        }
        asyncAction.resolve("success",attribute);
    }
    return asyncAction;
};



/**
 * Formats an action to be used by a request or policy. Actions are not gathered from the Policy Information Point.
 * Rather they are string values explaining the operation to be permitted. To comply with XACML, these strings are
 * wrapped in objects for easier comparison
 *
 * @method formatAction
 * @param {String|Object|Array<String|Object>} action
 * @returns {Object} An object of formatted actions indexed by the ozp action id `ozp:action:id`.
 *                   An example output for actions ['read','write'] is as follows:
 *      ```
 *      {
 *          'ozp:iwc:action': {
 *              'attributeValue': ['read', 'write']
 *          }
 *      }
 *      ```
 *
 */
ozpIwc.policyAuth.PDP.prototype.formatAction = function(action){

    var formatted =  [];

    var objectHandler = function(object,formatted){
        var values;
        // We only care about attributeValues
        if(object['ozp:iwc:action']){
            values = object['ozp:iwc:action'];
        }
        if(Array.isArray(values)) {
                return arrayHandler(values,formatted);
        } else if(['string', 'number', 'boolean'].indexOf(typeof values) >= 0){
            if(formatted.indexOf(values) < 0){
                formatted.push(values);
            }
        }
    };
    var arrayHandler = function(array,formatted){
        for(var i in array){
            if(typeof array[i] === 'string') {
                if (formatted.indexOf(array[i]) < 0) {
                    formatted.push(array[i]);
                }
            } else if(Array.isArray(array[i])){
                arrayHandler(array[i],formatted);
            } else if(typeof array[i] === 'object') {
                objectHandler(array[i],formatted);
            }
        }
    };

    if(!action){
        //do nothing and return an empty array
    }else if(typeof action === "string"){
        // If its a string, its a single action.
        formatted.push(action);
    } else if(Array.isArray(action)){
        arrayHandler(action,formatted);
    } else if(typeof action === 'object'){
        objectHandler(action,formatted);
    }

    return {'ozp:iwc:action': formatted};
};

/**
 * Takes a request object and applies any context needed from the PIP.
 *
 * @method formatRequest
 * @param {Object}          request
 * @param {String|Array<String>|Object}    request.subject URN(s) of attribute to gather, or formatted subject object
 * @param {String|Array<String>Object}     request.resource URN(s) of attribute to gather, or formatted resource object
 * @param {String|Array<String>Object}     request.action URN(s) of attribute to gather, or formatted action object
 * @param {String}                         request.combiningAlgorithm URN of combining algorithm
 * @param {Array<String|ozpIwc.policyAuth.Policy>}   request.policies either a URN or a formatted policy
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
 * @returns {ozpIwc.AsyncAction}  will resolve when all attribute formatting completes.
 *                    The resolution will pass a formatted
 *                      structured as so:
 *                    ```{
 *                      'category':{
 *                          "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject": {
 *                              <AttributeId>: {
 *                                  "attributeValues": Array<Primitive>
 *                              }
 *                          },
 *                          "urn:oasis:names:tc:xacml:3.0:attribute-category:resource": {
 *                              <AttributeId>: {
 *                                  "attributeValues": Array<Primitive>
 *                              }
 *                          },
 *                          "urn:oasis:names:tc:xacml:3.0:attribute-category:action": {
 *                              "ozp:iwc:action": {
 *                                  "attributeValues": Array<String>
 *                              }
 *                          }
 *                       },
 *                      'combiningAlgorithm': request.combiningAlgorithm,
 *                      'policies': request.policies
 *                     }```
 */
ozpIwc.policyAuth.PDP.prototype.formatRequest = function(request,pip){
    var asyncAction = new ozpIwc.AsyncAction();
    pip = pip || this.pip;
    request = request || {};
    request.subject = request.subject || {};
    request.resource = request.resource || {};
    request.action = request.action || {};
    request.combiningAlgorithm = request.combiningAlgorithm || this.defaultCombiningAlgorithm;
    var asyncs = [];

    var subjectAsync = this.formatAttribute(request.subject,pip);
    var resourceAsync = this.formatAttribute(request.resource,pip);
    var actions = this.formatAction(request.action);

    asyncs.push(subjectAsync,resourceAsync,actions);

    ozpIwc.AsyncAction.all(asyncs)
        .success(function(gatheredAttributes){
            var sub = gatheredAttributes[0];
            var res = gatheredAttributes[1];
            var act = gatheredAttributes[2];
            asyncAction.resolve('success',{
                'category':{
                    "subject": sub,
                    "resource": res,
                    "action": act
                },
                'combiningAlgorithm': request.combiningAlgorithm,
                'policies': request.policies
            });
        }).failure(function(err){
            asyncAction.resolve('failure',err);
        });
    return asyncAction;
};

/**
 * The URN of the default combining algorithm to use when basing a decision on multiple policies.
 * @property defaultCombiningAlgorithm
 * @type {String}
 * @default "urn:oasis:names:tc:xacml:3.0:policy-combining-algorithm:deny-overrides"
 */
ozpIwc.policyAuth.PDP.prototype.defaultCombiningAlgorithm = "deny-overrides";

/**
 * Formats a category object. If needed the attribute data is gathered from the PIP.
 *
 * @method formatCategory
 * @param {String|Array<String>|Object} category the category (subject,resource,action) to format
 * @param {String} categoryId the category name used to map to its corresponding attributeId (see PDP.mappedID)
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
 * @returns {ozpIwc.AsyncAction}  will resolve with a category object formatted as so:
 *      ```
 *      {
 *          <AttributeId>: {
 *              'attributeValue': {Array<Primative>}
 *          }
 *      }
 *      ```
 *
 */
ozpIwc.policyAuth.PDP.prototype.formatCategory = function(category,pip){
    var asyncAction = new ozpIwc.AsyncAction();
    if(!category){
        return asyncAction.resolve('success');
    }

    pip = pip || this.pip;

    this.formatAttribute(category,pip)
        .success(function(attributes){
            for(var i in attributes['ozp:iwc:permissions']){
                attributes[i] = attributes['ozp:iwc:permissions'][i];
            }
            delete attributes['ozp:iwc:permissions'];
            asyncAction.resolve('success',attributes);
        }).failure(function(err){
            asyncAction.resolve('failure',err);
        });
    return asyncAction;
};

/**
 *
 * Category context handling for policy objects.
 * Takes object key-indexed categories for a policy
 * and returns an object key-indexed listing of formatted. Each category is keyed by its XACML URN. currently only
 * subject,resource, and action categories are supported.
 *
 * @method formatCategories
 * @param {Object} categoryObj An object of categories to format.
 * @param {Object|String|Array<String|Object>}[categoryObj[<categoryId>]] A category to format
 * @param {ozpIwc.policyAuth.PIP} [pip] custom policy information point for attribute gathering.
 * @returns {ozpIwc.AsyncAction} will resolve an object of categories be structured as so:
 * ```
 * {
 *   '<categoryId>' : {
 *      <AttributeId>:{
 *          'attributeValue' : Array<Primitive>
 *      },
 *      <AttributeId>:{
 *          'attributeValue' : Array<Primitive>
 *      }
 *   },
 *   '<categoryId>': {...},
 *   ...
 * }
 * ```
 */
ozpIwc.policyAuth.PDP.prototype.formatCategories = function(categoryObj,pip){
    var asyncAction = new ozpIwc.AsyncAction();
    pip = pip || this.pip;
    var categoryAsyncs = [];
    var categoryIndexing = {};
    for(var i in categoryObj){
        categoryAsyncs.push(this.formatCategory(categoryObj[i],pip));
        categoryIndexing[i] = categoryAsyncs.length - 1;
    }
    ozpIwc.AsyncAction.all(categoryAsyncs)
        .success(function(categories){
            var map = {};
            var keys = Object.keys(categoryIndexing);
            for(var i in keys){
                map[keys[i]] = categories[categoryIndexing[keys[i]]] || {};
            }
            asyncAction.resolve('success',map);
        }).failure(function(err){
            asyncAction.resolve('failure',err);
        });
    return asyncAction;
};
