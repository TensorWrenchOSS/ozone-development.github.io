/**
 * @submodule bus.api.Value
 */

/**
 * The base class for values in the various APIs.  Designed to be extended with API-specific
 * concerns and validation.
 *
 * @class CommonApiValue
 * @namespace ozpIwc
 * @param {object} config
 * @param {string} config.name the name of this resource
 */
ozpIwc.CommonApiValue = function(config) {
	config = config || {};

    /**
     * @property watchers
     * @type Array[String]
     * @default []
     */
	this.watchers= config.watchers || [];

    /**
     * @property resource
     * @type String
     */
	this.resource=config.resource;

    /**
     * @property allowedContentTypes
     * @type Array
     */
    this.allowedContentTypes=config.allowedContentTypes;

    /**
     * @property entity
     * @type Object
     */
    this.entity=config.entity;

    /**
     * @property contentType
     * @type String
     */
	this.contentType=config.contentType;

    /**
     * @property permissions
     * @type Object
     * @default {}
     */
	this.permissions=config.permissions || {};

    /**
     * @property version
     * @type Number
     * @default 0
     */
	this.version=config.version || 0;

    /**
     * @property persist
     * @type Boolean
     * @default false
     */
    this.persist=false;

    /**
     * @property deleted
     * @type Boolean
     * @default true
     */
    this.deleted=true;
};

/**
 * Sets a data based upon the content of the packet.  Automatically updates the content type,
 * permissions, entity, and updates the version.
 *
 * @method set
 * @param {ozpIwc.TransportPacket} packet
 * @returns {undefined}
 */
ozpIwc.CommonApiValue.prototype.set=function(packet) {
	if(this.isValidContentType(packet.contentType)) {
		this.permissions=packet.permissions || this.permissions;
		this.contentType=packet.contentType;
		this.entity=packet.entity;
		this.version++;
	}
};
/**
 * Adds a new watcher based upon the contents of the packet.
 *
 * @method watch
 * @param {ozpIwc.TransportPacket} packet
 * @returns {undefined}
 */
ozpIwc.CommonApiValue.prototype.watch=function(packet) {
	this.watchers.push({
		src: packet.src,
		msgId: packet.msgId
	});
};

/**
 * Removes a previously registered watcher.  An unwatch on
 * someone who isn't actually watching is not an error-- 
 * the post condition is satisfied.
 *
 * @method unwatch
 * @param {ozpIwc.TransportPacket} packet
 * @returns {undefined}
 */
ozpIwc.CommonApiValue.prototype.unwatch=function(packet) {
	this.watchers=this.watchers.filter(function(w) {
		return packet.replyTo !== w.msgId && packet.src !==w.src;
	});
};

/**
 * Invokes the callback on each watcher.
 *
 * @method eachWatcher
 * @param {function} callback
 * @param {object} [self]  Used as 'this' for the callback.  Defaults to the Value object.
 * @returns {undefined}
 */
ozpIwc.CommonApiValue.prototype.eachWatcher=function(callback,self) {
	self=self || this;
	return this.watchers.map(callback,self);
};

/**
 * Resets the data to an empy state-- undefined entity and contentType, no permissions,
 * and version of 0.  It does NOT remove watchers.  This allows for watches on values
 * that do not exist yet, or will be created in the future.
 *
 * @method deleteData
 * @returns {undefined}
 */
ozpIwc.CommonApiValue.prototype.deleteData=function() {
	this.entity=undefined;
	this.contentType=undefined;
	this.permissions=[];
	this.version=0;
    this.deleted=true;
};

/**
 * Turns this value into a packet.
 *
 * @method toPacket
 * @param {ozpIwc.TransportPacket} base Fields to be merged into the packet.
 * @returns {ozpIwc.TransportPacket}
 */
ozpIwc.CommonApiValue.prototype.toPacket=function(base) {
	base = base || {};
	base.entity=ozpIwc.util.clone(this.entity);
	base.contentType=this.contentType;
	base.permissions=ozpIwc.util.clone(this.permissions);
	base.eTag=this.version;
	base.resource=this.resource;
	return base;
};

/**
 * Determines if the contentType is acceptable to this value.  Intended to be
 * overriden by subclasses.
 *
 * @method isValidContentType
 * @param {string} contentType
 * @returns {Boolean}
 */
ozpIwc.CommonApiValue.prototype.isValidContentType=function(contentType) {
    if(this.allowedContentTypes && this.allowedContentTypes.indexOf(contentType) < 0) {
        throw new ozpIwc.ApiError("badContent",
                "Bad contentType " + contentType +", expected " + this.allowedContentTypes.join(","));
     } else {
        return true;
    }
};

/**
 * Generates a point-in-time snapshot of this value that can later be sent to
 * {@link ozpIwc.CommonApiValue#changesSince} to determine the changes made to the value.
 * This value should be considered opaque to consumers.
 * 
 * <p> For API subclasses, the default behavior is to simply call toPacket().  Subclasses
 * can override this, but should likely override {@link ozpIwc.CommonApiValue#changesSince}
 * as well.
 *
 * @method snapshot
 * @returns {object}
 */
ozpIwc.CommonApiValue.prototype.snapshot=function() {
	return this.toPacket();
};

/**
 * From a given snapshot, create a change notifications.  This is not a delta, rather it's
 * change structure.
 * <p> API subclasses can override if there are additional change notifications (e.g. children in DataApi).
 *
 * @method changesSince
 * @param {object} snapshot The state of the value at some time in the past.
 * @returns {Object} A record of the current value and the value of the snapshot.
 */
ozpIwc.CommonApiValue.prototype.changesSince=function(snapshot) {
	if(snapshot.eTag === this.version) {
        return null;
    }
	return {
			'newValue': ozpIwc.util.clone(this.entity),
			'oldValue': snapshot.entity
	};
};

/**
 * Returns true if the value of this is impacted by the value of node.
 * For nodes that base their value off of other nodes, override this function.
 *
 * @method isUpdateNeeded
 * @param {type} node 
 * @returns boolean
 */
ozpIwc.CommonApiValue.prototype.isUpdateNeeded=function(node) {
    return false;
};

/**
 * Update this node based upon the changes made to changedNodes.
 *
 * @method updateContent
 * @param {ozpIwc.CommonApiValue[]} changedNodes Array of all nodes for which isUpdatedNeeded returned true.
 * @returns {ozpIwc.CommonApiValue.changes}
 */
ozpIwc.CommonApiValue.prototype.updateContent=function(changedNodes) {
    return null;
};

/**
 * Handles deserializing an {{#crossLink "ozpIwc.TransportPacket"}}{{/crossLink}} and setting this value with
 * the contents.
 *
 * @method deserialize
 * @param {ozpIwc.TransportPacket} serverData
 */
ozpIwc.CommonApiValue.prototype.deserialize=function(serverData) {
    var clone = ozpIwc.util.clone(serverData);
// we need the persistent data to conform with the structure of non persistent data.
    this.entity= clone.entity || {};
    this.contentType=clone.contentType || this.contentType;
    this.permissions=clone.permissions || this.permissions;
    this.version=clone.version || this.version;
    this.watchers = serverData.watchers || this.watchers;
};

/**
 * Serializes a Common Api value to a packet.
 *
 * @method serialize
 * @return {ozpIwc.TransportPacket}
 */
ozpIwc.CommonApiValue.prototype.serialize=function() {
    var serverData = {};
    serverData.entity=this.entity;
    serverData.contentType=this.contentType;
    serverData.permissions=this.permissions;
    serverData.version=this.version;
    serverData.watchers=this.watchers;
    return serverData;
};
