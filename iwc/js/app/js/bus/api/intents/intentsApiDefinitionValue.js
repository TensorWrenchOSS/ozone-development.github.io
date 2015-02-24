/**
 * @submodule bus.api.Value
 */

/**
 * The capability value for an intent. adheres to the application/vnd.ozp-iwc-intent-definition-v1+json content type.
 * @class IntentsApiDefinitionValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @param {Object} config
 *@param {Object} config.entity
 * @param {String} config.entity.definitions the list of definitions in this intent capability.
 */
ozpIwc.IntentsApiDefinitionValue = ozpIwc.util.extend(ozpIwc.CommonApiValue, function (config) {
    config=config || {};
    config.allowedContentTypes=["application/vnd.ozp-iwc-intent-definition-v1+json"];
    config.contentType="application/vnd.ozp-iwc-intent-definition-v1+json";
    ozpIwc.CommonApiValue.call(this, config);

    /**
     * @property pattern
     * @type RegExp
     */
    this.pattern=new RegExp(ozpIwc.util.escapeRegex(this.resource)+"/[^/]*");
    this.pattern.toJSON = RegExp.prototype.toString;
    this.handlers=[];
    this.entity={
        type: config.intentType,
        action: config.intentAction,        
        handlers: []
    };
});

/**
 * Returns true if the definition value contains a reference to the node specified.
 *
 * @method isUpdateNeeded
 * @param {ozpIwc.CommonApiValue} node
 * @returns {Boolean}
 */
ozpIwc.IntentsApiDefinitionValue.prototype.isUpdateNeeded=function(node) {
    return this.pattern.test(node.resource);
};

/**
 * Updates the Intents Api Definition value with a list of changed handlers.
 *
 * @method updateContent
 * @param {String[]} changedNodes
 */
ozpIwc.IntentsApiDefinitionValue.prototype.updateContent=function(changedNodes) {
    this.version++;
    this.handlers=changedNodes;
    this.entity.handlers=changedNodes.map(function(changedNode) { 
        return changedNode.resource; 
    });
};

/**
 * Returns the list of handlers registered to the definition value.
 *
 * @method getHandlers
 * @param packetContext
 * @returns {*[]}
 */
ozpIwc.IntentsApiDefinitionValue.prototype.getHandlers=function(packetContext) {
    return this.handlers;
};

/**
 * Handles deserializing an {{#crossLink "ozpIwc.TransportPacket"}}{{/crossLink}} and setting this value with
 * the contents.
 *
 * @method deserialize
 * @param {ozpIwc.TransportPacket} serverData
 */
ozpIwc.IntentsApiDefinitionValue.prototype.deserialize=function(serverData) {
    var clone = ozpIwc.util.clone(serverData);
// we need the persistent data to conform with the structure of non persistent data.
    this.entity= clone.entity || {};

    this.pattern = (typeof clone.pattern === "string") ? new RegExp(clone.pattern.replace(/^\/|\/$/g, '')) : this.pattern;
    this.pattern.toJSON = RegExp.prototype.toString;

    this.contentType=clone.contentType || this.contentType;
    this.permissions=clone.permissions || this.permissions;
    this.version=clone.version || this.version;
    this.watchers = clone.watchers || this.watchers;
};

/**
 * Serializes a Intent Api Definition value to a packet.
 *
 * @method serialize
 * @return {ozpIwc.TransportPacket}
 */
ozpIwc.IntentsApiDefinitionValue.prototype.serialize=function() {
    var serverData = {};
    serverData.entity=this.entity;
    serverData.pattern=this.pattern;
    serverData.contentType=this.contentType;
    serverData.permissions=this.permissions;
    serverData.version=this.version;
    serverData.watchers=this.watchers;
    return serverData;
};
