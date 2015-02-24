/**
 * @submodule bus.transport
 */

/**
 * A participant to handle multicast communication on the IWC.
 *
 * @class MulticastParticipant
 * @namespace ozpIwc
 * @extends ozpIwc.Participant
 * @constructor
 *
 * @param {String} name The name of the participant.
 */
ozpIwc.MulticastParticipant=ozpIwc.util.extend(ozpIwc.Participant,function(name) {

    /**
     * The name of the participant.
     * @property name
     * @type String
     * @default ""
     */
	this.name=name;

    /**
     * The type of the participant
     * @property participantType
     * @type String
     * @default "multicast"
     */
	this.participantType="multicast";

    ozpIwc.Participant.apply(this,arguments);

    /**
     * Array of Participants that are part of the multicast group.
     * @property members
     * @type ozpIwc.Participant[]
     * @default []
     */
	this.members=[];

    /**
     * The participants resource path for the Names API.
     * @property namesResource
     * @type String
     * @default "/multicast/"
     */
    this.namesResource="/multicast/"+this.name;

    /**
     * Content type for the Participant's heartbeat status packets.
     * @property heartBeatContentType
     * @type String
     * @default "application/vnd.ozp-iwc-multicast-address-v1+json"
     */
    this.heartBeatContentType="application/vnd.ozp-iwc-multicast-address-v1+json";

    /**
     *
     * @property heartBeatStatus.members
     * @type Array
     * @default []
     */
    this.heartBeatStatus.members=[];

    /**
     * Fires when the participant has connected to its router.
     * @event #connectedToRouter
     */
    this.on("connectedToRouter",function() {
        this.namesResource="/multicast/" + this.name;
    },this);
});

/**
 * Receives a packet on behalf of the multicast group.
 *
 * @method receiveFromRouterImpl
 *
 * @param {ozpIwc.TransportPacket} packet
 * @returns {Boolean} always false.
 */
ozpIwc.MulticastParticipant.prototype.receiveFromRouterImpl=function(packet) {
	this.members.forEach(function(m) {
        // as we send to each member, update the context to make it believe that it's the only recipient
        packet.dstParticipant=m;
        m.receiveFromRouter(packet);
    });
	return false;
};

/**
 * Adds a member to the multicast group.
 *
 * @method addMember
 *
 * @param {ozpIwc.Participant} participant
 */
ozpIwc.MulticastParticipant.prototype.addMember=function(participant) {
	this.members.push(participant);
    this.heartBeatStatus.members.push(participant.address);
};