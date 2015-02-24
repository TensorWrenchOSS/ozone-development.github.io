/**
 * @submodule bus.api.Type
 */

/**
 * The System Api. Provides reference data of registered applications, versions, and information about the current user
 * through the IWC. Subclasses the {{#crossLink "ozpIwc.CommonApiBase"}}{{/crossLink}}. Utilizes the following value
 * classes which subclass the {{#crossLink "ozpIwc.CommonApiValue"}}{{/crossLink}}:
 *  - {{#crossLink "ozpIwc.SystemApiApplicationValue"}}{{/crossLink}}
 *  - {{#crossLink "ozpIwc.SystemApiMailboxValue"}}{{/crossLink}}
 *
 * @class SystemApi
 * @namespace ozpIwc
 * @extends ozpIwc.CommonApiBase
 * @constructor
 *
 * @type {Function}
 * @param {Object} config
 */
ozpIwc.SystemApi = ozpIwc.util.extend(ozpIwc.CommonApiBase,function(config) {
    ozpIwc.CommonApiBase.apply(this,arguments);
    this.endpointUrls.push(
        ozpIwc.linkRelPrefix+":application",
        ozpIwc.linkRelPrefix+":user",
        ozpIwc.linkRelPrefix+":system");


    this.addDynamicNode(new ozpIwc.CommonApiCollectionValue({
        resource: "/application",
        pattern: /^\/application\/.*$/,
        contentType: "application/vnd.ozp-iwc-application-list-v1+json"
    }));
    this.on("changedNode",this.updateIntents,this);

});

/**
 * Loads data from the server.
 *
 * @method loadFromServer
 */
ozpIwc.SystemApi.prototype.loadFromServer=function() {

    var self=this;
    var headers = [
        {name: "Accept", value: "application/vnd.ozp-application-v1+json"}
    ];
    return new Promise(function(resolve, reject) {
        self.loadFromEndpoint(ozpIwc.linkRelPrefix + ":application", headers)
            .then(function() {
                self.loadFromEndpoint(ozpIwc.linkRelPrefix + ":user")
                    .then(function() {
                        self.loadFromEndpoint(ozpIwc.linkRelPrefix + ":system")
                            .then(function() {
                                resolve("system.api load complete");
                            });
                    });
            })
            ['catch'](function(error) {
                reject(error);
            });
    });
};

/**
 * Update all intents registered to the given System Api node.
 *
 * @method updateIntents
 * @param {ozpIwc.SystemApiApplicationValue} node
 * @param {?} changes @TODO unused.
 */
ozpIwc.SystemApi.prototype.updateIntents=function(node,changes) {
    if(!node.getIntentsRegistrations) {
        return;
    }
    var intents=node.getIntentsRegistrations();
    if(!intents) {
        return;
    }
    intents.forEach(function(i) {
        var icon = i.icon || (node.entity && node.entity.icons && node.entity.icons.small) ? node.entity.icons.small : '';
        var label = i.label || node.entity.name;
        this.participant.send({
            'dst' : "intents.api",
            'src' : "system.api",
            'action': "set",
            'resource': "/"+i.type+"/"+i.action+"/system.api"+node.resource.replace(/\//g,'.'),
            'contentType': "application/vnd.ozp-iwc-intent-handler-v1+json",
            'entity': {
                'type': i.type,
                'action': i.action,
                'icon': icon,
                'label': label,
                '_links': node.entity._links,
                'invokeIntent': {
                    'action' : 'invoke',
                    'resource' : node.resource
                }
            }
        });
    },this);

};

/**
 * Creates a System Api Application or Mailbox value from the given packet.
 *
 * @method makeValue
 * @param {ozpIwc.TransportPacket} packet
 * @returns {ozpIwc.SystemApiMailboxValue|ozpIwc.SystemApiApplicationValue}
 */
ozpIwc.SystemApi.prototype.makeValue = function(packet){
        switch (packet.contentType) {
            case "application/vnd.ozp-application-v1+json":
                var launchDefinition = "/system" + packet.resource;
                packet.entity = packet.entity || {};
                packet.entity.launchDefinition = packet.entity.launchDefinition || launchDefinition;

                var app = new ozpIwc.SystemApiApplicationValue({
                    resource: packet.resource,
                    entity: packet.entity,
                    contentType: packet.contentType,
                    systemApi: this
                });
                return app;
            default:
                return new ozpIwc.CommonApiValue(packet);
        }
};

/**
 * Handles System api requests with an action of "set"
 * @method handleSet
 */
ozpIwc.SystemApi.prototype.handleSet = function(node,packetContext) {
    packetContext.replyTo({
        'response': 'badAction',
        'entity': {
            'action': packetContext.packet.action,
            'originalRequest' : packetContext.packet
        }
    });
};

/**
 * Handles System api requests with an action of "delete"
 *
 * @method handleDelete
 */
ozpIwc.SystemApi.prototype.handleDelete = function(node,packetContext) {
    packetContext.replyTo({
        'response': 'badAction',
        'entity': {
            'action': packetContext.packet.action,
            'originalRequest' : packetContext.packet
        }
    });
};

/**
 * Handles System api requests with an action of "launch"
 *
 * @method handleLaunch
 */
ozpIwc.SystemApi.prototype.handleLaunch = function(node,packetContext) {

    this.participant.send({
        dst: "intents.api",
        contentType: "application/vnd.ozp-iwc-intent-handler-v1+json",
        action: "invoke",
        resource: "/application/vnd.ozp-iwc-launch-data-v1+json/run",
        entity: {
            "url": node.entity.launchUrls.default,
            "applicationId": node.resource,
            "launchData": packetContext.packet.entity
        }
    });
    packetContext.replyTo({'response': "ok"});
};

/**
 * Handles System api requests with an action of "invoke"
 *
 * @method handleInvoke
 */
ozpIwc.SystemApi.prototype.rootHandleInvoke = function(node,packetContext) {
    if(packetContext.packet.entity && packetContext.packet.entity.inFlightIntent){
        var launchParams=[
            "ozpIwc.peer="+encodeURIComponent(ozpIwc.BUS_ROOT),
            "ozpIwc.inFlightIntent="+encodeURIComponent(packetContext.packet.entity.inFlightIntent)
        ];

        ozpIwc.util.openWindow(packetContext.packet.entity.inFlightIntentEntity.entity.url,launchParams.join("&"));
        this.launchApplication(node,packetContext.packet.entity.inFlightIntent);
        packetContext.replyTo({'response': "ok"});
    } else{
        packetContext.replyTo({'response': "badResource"});
    }

};

///**
// * Launches the specified node's application.
// *
// * @method launchApplication
// * @param {ozpIwc.SystemApiApplicationValue} node
// * @param {ozpIwc.SystemApiMailboxValue} mailboxNode
// */
//ozpIwc.SystemApi.prototype.launchApplication=function(node,intentResource) {
//
//};

