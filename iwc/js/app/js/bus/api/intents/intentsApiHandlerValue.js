/**
 * @submodule bus.api.Value
 */
/**
 * The capability value for an intent. adheres to the ozpIwc-intents-type-capabilities-v1+json content type.
 * @class IntentsApiHandlerValue
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiValue
 * @constructor
 *
 * @param {Object} config
 *@param {Object} config.entity
 * @param {String} config.entity.definitions the list of definitions in this intent capability.
 */
ozpIwc.IntentsApiHandlerValue = ozpIwc.util.extend(ozpIwc.CommonApiValue, function (config) {
    config=config || {};
    config.allowedContentTypes=["application/vnd.ozp-iwc-intent-handler-v1+json"];
    config.contentType="application/vnd.ozp-iwc-intent-handler-v1+json";
    ozpIwc.CommonApiValue.apply(this, arguments);
    this.entity={
        type: config.intentType,
        action: config.intentAction
    };
});

/**
 * Returns this handler wrapped in an Array.
 *
 * @method getHandlers
 * @param {ozpIwc.TransportPacket} packetContext
 * @todo packetContext not needed, left for signature matching of base class?
 * @returns {ozpIwc.intentsApiHandlerValue[]}
 */
ozpIwc.IntentsApiHandlerValue.prototype.getHandlers=function(packetContext) {
    return [this];
};

/**
 * Sets the entity value of this handler.
 *
 * @method set
 * @param {ozpIwc.TransportPacket} packet
 */
ozpIwc.IntentsApiHandlerValue.prototype.set=function(packet) {
    ozpIwc.CommonApiValue.prototype.set.apply(this,arguments);
    this.entity.invokeIntent = packet.entity.invokeIntent  || {};
    this.entity.invokeIntent.dst = this.entity.invokeIntent.dst || packet.src;
    // allow null or empty strings for a resource 
    if(typeof(this.entity.invokeIntent.resource) === "undefined") {
        this.entity.invokeIntent.resource = "/intents" + packet.resource;
    }
    this.entity.invokeIntent.action = this.entity.invokeIntent.action || "invoke";
};
