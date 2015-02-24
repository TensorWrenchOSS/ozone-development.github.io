/**
 * @submodule bus.api.Value
 */

/**
 * @class CommonApiCollectionValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 *
 * @type {Function}
 * @param {Object} config
 * @oaram {String} config.pattern
 */
ozpIwc.CommonApiCollectionValue = ozpIwc.util.extend(ozpIwc.CommonApiValue,function(config) {
	ozpIwc.CommonApiValue.apply(this,arguments);

    /**
     * @property persist
     * @type Boolean
     * @default false
     */
    this.persist=false;

    /**
     * @property pattern
     * @type RegExp
     * @default ''
     */
    this.pattern=config.pattern || '';
    this.pattern.toJSON = RegExp.prototype.toString;
    this.entity=[];
});

/**
 * Returns if an update is needed.
 *
 * @method isUpdateNeeded
 * @param node
 * @returns {Boolean}
 */
ozpIwc.CommonApiCollectionValue.prototype.isUpdateNeeded=function(node) {
    return node.resource.match(this.pattern);
};

/**
 * Update the content of this value with an array of changed nodes.
 *
 * @method updateContent
 * @param {ozpIwc.commonApiValue[]} changedNodes
 */
ozpIwc.CommonApiCollectionValue.prototype.updateContent=function(changedNodes) {
    this.version++;
    this.entity=changedNodes.map(function(changedNode) { return changedNode.resource; });
};

/**
 * Handles set actions on the value.
 *
 * @method set
 */
ozpIwc.CommonApiCollectionValue.prototype.set=function() {
    throw new ozpIwc.ApiError("noPermission","This resource cannot be modified.");
};

/**
 * Deserializes a Common Api Collection value from a packet.
 *
 * @method deserialize
 * @param {ozpIwc.TransportPacket} serverData
 */
ozpIwc.CommonApiCollectionValue.prototype.deserialize=function(serverData) {
    ozpIwc.CommonApiValue.prototype.deserialize.apply(this,arguments);
    var clone = ozpIwc.util.clone(serverData);

    this.pattern = (typeof clone.pattern === "string") ? new RegExp(clone.pattern.replace(/^\/|\/$/g, '')) : this.pattern;
    this.pattern.toJSON = RegExp.prototype.toString;
};

/**
 * Serializes a Common Api Collection value to a packet.
 *
 * @method serialize
 * @return {ozpIwc.TransportPacket}
*/
ozpIwc.CommonApiCollectionValue.prototype.serialize=function() {
    var serverData = {};
    serverData.entity=this.entity;
    serverData.pattern=this.pattern;
    serverData.contentType=this.contentType;
    serverData.permissions=this.permissions;
    serverData.version=this.version;
    serverData.watchers=this.watchers;
    return serverData;
};
