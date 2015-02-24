/**
 * @submodule bus.api.Value
 */

/**
 * The capability value for an intent. adheres to the application/vnd.ozp-iwc-intent-type-v1+json content type.
 * @class IntentsApiTypeValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @param {Object} config
 *@param {Object} config.entity
 * @param {String} config.entity.definitions the list of definitions in this intent capability.
 */
ozpIwc.IntentsApiTypeValue = ozpIwc.util.extend(ozpIwc.CommonApiValue, function (config) {
    config=config || {};
    config.allowedContentTypes=["application/vnd.ozp-iwc-intent-type-v1+json"];
    config.contentType="application/vnd.ozp-iwc-intent-type-v1+json";

    ozpIwc.CommonApiValue.apply(this, arguments);

    /**
     * @property pattern
     * @type RegExp
     */
    this.pattern=new RegExp(this.resource.replace("$","\\$").replace(".","\\.")+"\/[^/]*$");
    this.pattern.toJSON = RegExp.prototype.toString;
    this.entity={
        'type': config.intentType,
        'actions': []
    };
});

/**
 * Returns true if the type value contains a reference to the node specified
 *
 * @method isUpdateNeeded
 * @param {ozpIwc.CommonApiValue} node
 * @returns {Boolean}
 */
ozpIwc.IntentsApiTypeValue.prototype.isUpdateNeeded=function(node) {
    return this.pattern.test(node.resource);
};

/**
 * Updates the Intents Api Type value with a list of changed definitions.
 *
 * @method updateContent
 * @param {String[]} changedNodes
 */
ozpIwc.IntentsApiTypeValue.prototype.updateContent=function(changedNodes) {
    this.version++;
    this.entity.actions=changedNodes.map(function(changedNode) { 
        return changedNode.resource; 
    });
};

/**
 * Handles deserializing an {{#crossLink "ozpIwc.TransportPacket"}}{{/crossLink}} and setting this value with
 * the contents.
 *
 * @method deserialize
 * @param {ozpIwc.TransportPacket} serverData
 */
ozpIwc.IntentsApiTypeValue.prototype.deserialize=function(serverData) {
    ozpIwc.IntentsApiDefinitionValue.prototype.deserialize.apply(this, arguments);
};

/**
 * Serializes a Intents Api Type value to a packet.
 *
 * @method serialize
 * @return {ozpIwc.TransportPacket}
 */
ozpIwc.IntentsApiTypeValue.prototype.serialize=function() {
    return  ozpIwc.IntentsApiDefinitionValue.prototype.serialize.apply(this,arguments);
};
