/**
 * @submodule bus.transport
 */

/**
 * @class RouterWatchdog
 * @extends ozpIwc.InternalParticipant
 * @namespace ozpIwc
 */
ozpIwc.RouterWatchdog = ozpIwc.util.extend(ozpIwc.InternalParticipant, function(config) {
    ozpIwc.InternalParticipant.apply(this, arguments);

    /**
     * The type of the participant.
     * @property participantType
     * @type String
     */
    this.participantType = "routerWatchdog";

    /**
     * Fired when connected.
     * @event #connected
     */
    this.on("connected", function() {
        this.name = this.router.selfId;
    }, this);

    /**
     * Frequency of heartbeats
     * @property heartbeatFrequency
     * @type Number
     * @defualt 10000
     */
    this.heartbeatFrequency = config.heartbeatFrequency || 10000;

    /**
     * Fired when connected to the router.
     * @event #connectedToRouter
     */
    this.on("connectedToRouter", this.setupWatches, this);


});

/**
 * Removes this participant from the $bus.multicast multicast group.
 *
 * @method leaveEventChannel
 */
ozpIwc.RouterWatchdog.prototype.leaveEventChannel = function() {
    // handle anything before leaving.
    if(this.router) {

        this.send({
            dst: "$bus.multicast",
            action: "disconnect",
            entity: {
                address: this.address,
                participantType: this.participantType,
                namesResource: this.namesResource
            }
        });

        this.send({
            dst: "$bus.multicast",
            action: "disconnect",
            entity: {
                address: this.router.selfId,
                namesResource: "/router/"+this.router.selfId
            }
        });
        //TODO not implemented
//        this.router.unregisterMulticast(this, ["$bus.multicast"]);
        return true;
    } else {
        return false;
    }

};
/**
 * Sets up the watchdog for all participants connected to the router. Reports heartbeats based on
 * {{#crossLink "ozpIwc.RouterWatchdogParticipant/heartbeatFrequency:property"}}{{/crossLink}}
 * @method setupWatches
 */
ozpIwc.RouterWatchdog.prototype.setupWatches = function() {
    this.name = this.router.selfId;
    var self=this;
    var heartbeat=function() {
        self.send({
            dst: "names.api",
            action: "set",
            resource: "/router/" + self.router.selfId,
            contentType: "application/vnd.ozp-iwc-router-v1+json",
            entity: {
                'address': self.router.selfId,
                'participants': self.router.getParticipantCount(),
                'time': ozpIwc.util.now()
            }
        });

        for (var k in self.router.participants) {
            var participant=self.router.participants[k];
            participant.heartBeatStatus.time = ozpIwc.util.now();
            if(participant instanceof ozpIwc.MulticastParticipant) {
                /*jshint loopfunc:true*/
                participant.members.forEach(function(member){
                    self.send({
                        'dst': "names.api",
                        'resource': participant.namesResource + "/"+ member.address,
                        'action' : "set",
                        'entity' : member.heartBeatStatus,
                        'contentType' : participant.heartBeatContentType
                    });
                });
            } else {
                participant.heartbeat();
            }            
        }

    };
//    heartbeat();

    /**
     * The timer for the heartBeat
     * @property timer
     * @type window.setInterval
     */
    this.timer = window.setInterval(heartbeat, this.heartbeatFrequency);
};

/**
 * Removes the watchdog.
 * @method shutdown
 */
ozpIwc.RouterWatchdog.prototype.shutdown = function() {
    window.clearInterval(this.timer);
};

