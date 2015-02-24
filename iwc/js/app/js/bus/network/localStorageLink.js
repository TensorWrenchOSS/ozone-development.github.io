/**
 * @submodule bus.network
 */

/**
 * <p>This link connects peers using the HTML5 localstorage API.  It handles cleaning up
 * the buffer, depduplication of sends, and other trivia.
 * 
 * <p>Individual local storage operations are atomic, but there are no consistency
 * gaurantees between multiple calls.  This means a read, modify, write operation may
 * create race conditions.  The LocalStorageLink addresses the concurrency problem without
 * locks by only allowing creation, read, and delete operations.
 * 
 * <p>Each packet is written to it's own key/value pair in local storage.  The key is the
 * of the form "${prefix}|${selfId}|${timestamp}".  Each LocalStorageLink owns the lifecycle
 * of packets it creates.
 * 
 * For senders:
 * <ol>
 *   <li> Write a new packet.
 *   <li> Wait config.myKeysTimeout milliseconds.
 *   <li> Delete own packets where the timestamp is expired.
 * </ol>
 * 
 * For receivers:
 * <ol>
 *   <li> Receive a "storage" event containing the new key.
 *   <li> Reads the packets from local storage.
 * </ol>
 * 
 * <p>The potential race condition is if the packet is deleted before the receiver
 * can read it.  In this case, the packet is simply considered lost, but no inconsistent
 * data will be read.
 * 
 * <p>Links are responsible for their own packets, but each will clean up other link's packets
 * on a much larger expiration window (config.otherKeysTimeout).  Race conditions between
 * multiple links interleaving the lockless "list keys" and "delete item" sequence generates
 * a consistent postcondition-- the key will not exist.
 * 
 * @class LocalStorageLink
 * @namespace ozpIwc
 * @param {Object} [config] - Configuration for this link
 * @param {ozpIwc.Peer} [config.peer=ozpIwc.defaultPeer] - The peer to connect to.
 * @param {Number} [config.myKeysTimeout=5000] - Milliseconds to wait before deleting this link's keys.
 * @param {Number} [config.otherKeysTimeout=120000] - Milliseconds to wait before cleaning up other link's keys
 * @param {String} [config.prefix='ozpIwc'] - Namespace for communicating, must be the same for all peers on the same network.
 * @param {String} [config.selfId] - Unique name within the peer network.  Defaults to the peer id.
 */
ozpIwc.LocalStorageLink = function(config) {
	config=config || {};


    /**
     * Namespace for communicating, must be the same for all peers on the same network.
     * @property prefix
     * @type String
     * @default "ozpIwc"
     */
	this.prefix=config.prefix || 'ozpIwc';

    /**
     * The peer this link will connect to.
     * @property peer
     * @type ozpIwc.Peer
     * @default ozpIwc.defaultPeer
     */
	this.peer=config.peer || ozpIwc.defaultPeer;

    /**
     * Unique name within the peer network.  Defaults to the peer id.
     * @property selfId
     * @type String
     * @default ozpIwc.defaultPeer.selfId
     */
	this.selfId=config.selfId || this.peer.selfId;


    /**
     * Milliseconds to wait before deleting this link's keys
     * @property myKeysTimeout
     * @type Number
     * @default 5000
     */
	this.myKeysTimeout = config.myKeysTimeout || 5000; // 5 seconds

    /**
     * Milliseconds to wait before deleting other link's keys
     * @todo UNUSUED
     * @property otherKeysTimeout
     * @type Number
     * @default 120000
     */
	this.otherKeysTimeout = config.otherKeysTimeout || 2*60000; // 2 minutes

  // Hook into the system
	var self=this;
	
	var receiveStorageEvent=function(event) {
		var key=self.splitKey(event.key);
		if(key) {
			var packet=JSON.parse(localStorage.getItem(event.key));

			if(!packet) {
				ozpIwc.metrics.counter('links.localStorage.packets.vanished').inc();
			} else if(typeof(packet) !== "object") {
				ozpIwc.metrics.counter('links.localStorage.packets.notAnObject').inc();
			} else {
				ozpIwc.metrics.counter('links.localStorage.packets.receive').inc();
				self.peer.receive(self.linkId,packet);
			} 
		}
	};
	window.addEventListener('storage',receiveStorageEvent , false); 
	
	this.peer.on("send",function(event) { 
		self.send(event.packet); 
	});
	
	this.peer.on("beforeShutdown",function() {
		self.cleanKeys();
		window.removeEventListener('storage',receiveStorageEvent);
	},this);
	
	window.setInterval(function() {
		self.cleanKeys();
	},250); 


	// METRICS
	ozpIwc.metrics.gauge('links.localStorage.buffer').set(function() {
		var	stats= {
					used: 0,
					max: 5 *1024 * 1024,
					bufferLen: 0,
					peerUsage: {},
					peerPackets: {}
					
		};
		for(var i=0; i < localStorage.length;++i) {
			var k=localStorage.key(i);
			var v=localStorage.getItem(k);
			
			var size=v.length*2;
			var oldKeyTime = ozpIwc.util.now() - this.myKeysTimeout;

			stats.used+=size;
			
			var key=self.splitKey(k);
			if(key) {
				stats.peerUsage[key.id] = stats.peerUsage[key.id]?(stats.peerUsage[key.id]+size):size;
				stats.peerPackets[key.id] = stats.peerPackets[key.id]?(stats.peerPackets[key.id]+1):1;
				stats.bufferLen++;
				if(key.createdAt < oldKeyTime) {
					stats.oldKeysCount++;
					stats.oldKeysSize+=size;
				}
			}
		}
			
		return stats;
	});
};

/**
 * Creates a key for the message in localStorage
 * @todo Is timestamp granular enough that no two packets can come in at the same time?
 *
 * @method makeKey
 *
 * @returns {string} a new key
 */
ozpIwc.LocalStorageLink.prototype.makeKey=function(sequence) { 
	return [this.prefix,this.selfId,ozpIwc.util.now(),sequence].join('|');
};

/**
 * If it's a key for a buffered message, split it into the id of the 
 * link that put it here and the time it was created at.
 *
 * @method splitKey
 * @param {String} k The key to split
 *
 * @returns {Object} The id and createdAt for the key if it's valid, otherwise null.
 */
ozpIwc.LocalStorageLink.prototype.splitKey=function(k) { 
	var parts=k.split("|");
	if(parts.length===4 && parts[0]===this.prefix) {
		return { id: parts[1], createdAt: parseInt(parts[2]) };
	}	
	return null;
};

/**
 * Goes through localStorage and looks for expired packets.  Packets owned
 * by this link are removed if they are older than myKeysTimeout.  Other
 * keys are cleaned if they are older than otherKeysTimeout.
 * @todo Coordinate expiration windows.
 *
 * @method cleanKeys
 */
ozpIwc.LocalStorageLink.prototype.cleanKeys=function() {
	var now=ozpIwc.util.now();
	var myKeyExpiration = now - this.myKeysTimeout;
	var otherKeyExpiration = now - this.otherKeysTimeout;

	for(var i=0; i < localStorage.length;++i) {
		var keyName=localStorage.key(i);
		var k=this.splitKey(keyName);
		if(k) {
			if((k.id===this.selfId && k.createdAt <= myKeyExpiration) ||
					(k.createdAt <= otherKeyExpiration)) {
				localStorage.removeItem(keyName);
			}				
		}
	}


};
/**
 * Publishes a packet to other peers.
 * @todo Handle local storage being full.
 *
 * @method send
 * @param {ozpIwc.NetworkPacket} packet
 */
ozpIwc.LocalStorageLink.prototype.send=function(packet) { 
	localStorage.setItem(this.makeKey(packet.sequence),JSON.stringify(packet));
	ozpIwc.metrics.counter('links.localStorage.packets.sent').inc();
};

