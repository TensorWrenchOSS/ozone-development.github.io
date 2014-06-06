/** @namespace */
var ozpIwc=ozpIwc || {};


/**
 * A deferred action, but not in the sense of the Javascript standard.
 * @class
 */
ozpIwc.AsyncAction=function() {
	this.callbacks={};
};

ozpIwc.AsyncAction.prototype.when=function(state,callback,self) {
	if(self) {
		callback=function() { return callback.apply(self,arguments); };
	}
	
	if(this.resolution === state) {
		callback.apply(this,this.value);
	} else {
		this.callbacks[state]=callback;
	}
	return this;
};


ozpIwc.AsyncAction.prototype.resolve=function(status) {
	if(this.resolution) {
		throw "Cannot resolve an already resolved AsyncAction";
	}
	var callback=this.callbacks[status];
	this.resolution=status;
	this.value=Array.prototype.slice.call(arguments,1);
	
	if(callback) {
		callback.apply(this,this.value);
	}
	return this;
};

ozpIwc.AsyncAction.prototype.success=function(callback,self) {
	return this.when("success",callback,self);
};

ozpIwc.AsyncAction.prototype.failure=function(callback,self) {
	return this.when("failure",callback,self);
};
/** @namespace */
var ozpIwc=ozpIwc || {};

/**
	* @class
	*/
ozpIwc.Event=function() {
	this.events={};
};	

/**
 * Registers a handler for the the event.
 * @param {string} event The name of the event to trigger on
 * @param {function} callback Function to be invoked
 * @param {object} [self] Used as the this pointer when callback is invoked.
 * @returns {object} A handle that can be used to unregister the callback via [off()]{@link ozpIwc.Event#off}
 */
ozpIwc.Event.prototype.on=function(event,callback,self) {
	var wrapped=callback;
	if(self) {
		wrapped=function() { 
			callback.apply(self,arguments);
		};
		wrapped.ozpIwcDelegateFor=callback;
	}
	this.events[event]=this.events[event]||[];
	this.events[event].push(wrapped);
	return wrapped;
};

/**
 * Unregisters an event handler previously registered.
 * @param {type} event
 * @param {type} callback
 */	
ozpIwc.Event.prototype.off=function(event,callback) {
	this.events[event]=(this.events[event]||[]).filter( function(h) {
		return h!==callback && h.ozpIwcDelegateFor !== callback;
	});
};

/**
 * Fires an event that will be received by all handlers.
 * @param {string} eventName  - Name of the event
 * @param {object} event - Event object to pass to the handers.
 * @returns {object} The event after all handlers have processed it
 */
ozpIwc.Event.prototype.trigger=function(eventName,event) {
	event = event || new ozpIwc.CancelableEvent();
	var handlers=this.events[eventName] || [];

	handlers.forEach(function(h) {
		h(event);
	});
	return event;
};


/**
 * Adds an on() and off() function to the target that delegate to this object 
 * @param {object} target Target to receive the on/off functions
 */
ozpIwc.Event.prototype.mixinOnOff=function(target) {
	var self=this;
	target.on=function() { return self.on.apply(self,arguments);};
	target.off=function() { return self.off.apply(self,arguments);};
};

/**
 * Convenient base for events that can be canceled.  Provides and manages
 * the properties canceled and cancelReason, as well as the member function
 * cancel().
 * @class
 * @param {object} data - Data that will be copied into the event
 */
ozpIwc.CancelableEvent=function(data) {
	data = data || {};
	for(k in data) {
		this[k]=data[k];
	}
	this.canceled=false;
	this.cancelReason=null;
};

/**
 * Marks the event as canceled.
 * @param {type} reason - A text description of why the event was canceled.
 * @returns {ozpIwc.CancelableEvent} Reference to self
 */
ozpIwc.CancelableEvent.prototype.cancel=function(reason) {
	reason= reason || "Unknown";
	this.canceled=true;
	this.cancelReason=reason;
	return this;
};

/** @namespace */
var ozpIwc=ozpIwc || {};

/** 
 * @type {object}
 * @property {function} log - Normal log output.
 * @property {function} error - Error output.
 */
ozpIwc.log=ozpIwc.log || {
	log: function() {
		if(window.console && typeof(window.console.log)==="function") {
			window.console.log.apply(window.console,arguments);
		}
	},
	error: function() {
		if(window.console && typeof(window.console.error)==="error") {
			window.console.error.apply(window.console,arguments);
		}
	}
};

/** @namespace */
var ozpIwc=ozpIwc || {};

/** @namespace */
ozpIwc.util=ozpIwc.util || {};

/**
 * Generates a large hexidecimal string to serve as a unique ID.  Not a guid.
 * @returns {String}
 */
ozpIwc.util.generateId=function() {
		return Math.floor(Math.random() * 0xffffffff).toString(16);
};

/**
 * Used to get the current epoch time.  Tests overrides this
 * to allow a fast-forward on time-based actions.
 * @returns {Number}
 */
ozpIwc.util.now=function() {
		return new Date().getTime();
};

/**
 * Create a class with the given parent in it's prototype chain.
 * @param {function} baseClass - the class being derived from
 * @param {function} newConstructor - the new base class
 * @returns {Function} newConstructor with an augmented prototype
 */
ozpIwc.util.extend=function(baseClass,newConstructor) {
	newConstructor.prototype = Object.create(baseClass.prototype); 
	newConstructor.prototype.constructor = newConstructor;
	return newConstructor;
};

var ozpIwc=ozpIwc || {};

/**
 * @class
 * This class will be heavily modified in the future.
 * 
 * @todo accept a list of peer URLs that are searched in order of preference
 * @param {object} config
 * @param {string} config.peerUrl - Base URL of the peer server
 * @param {boolean} [config.autoPeer=true] - Whether to automatically find and connect to a peer
 */
ozpIwc.Client=function(config) {
	config=config || {};
	this.participantId="$nobody";
	this.replyCallbacks={};
	this.peerUrl=config.peerUrl;
	var a=document.createElement("a");
	a.href = this.peerUrl;
	this.peerOrigin=a.protocol + "//" + a.hostname;
	if(a.port)
		this.peerOrigin+= ":" + a.port;
	
	
	this.autoPeer=("autoPeer" in config) ? config.autoPeer : true;
	this.msgIdSequence=0;
	this.events=new ozpIwc.Event();
	this.events.mixinOnOff(this);
	this.receivedPackets=0;
	this.receivedBytes=0;
	this.sentPackets=0;
	this.sentBytes=0;
	this.startTime=ozpIwc.util.now();
	var self=this;

	if(this.autoPeer) {
		this.findPeer();
	}
	
	// receive postmessage events
	this.messageEventListener=window.addEventListener("message", function(event) {
		if(event.origin !== self.peerOrigin){
			return;
		}
		try {
			self.receive(JSON.parse(event.data));
			self.receivedBytes+=(event.data.length * 2);
			self.receivedPackets++;		
		} catch(e) {
			// ignore!
		}
	}, false);
};

/**
 * Receive a packet from the connected peer.  If the packet is a reply, then
 * the callback for that reply is invoked.  Otherwise, it fires a receive event
 * @fires ozpIwc.Client#receive
 * @protected
 * @param {ozpIwc.TransportPacket} packet
 * @returns {undefined}
 */
ozpIwc.Client.prototype.receive=function(packet) {
	if(packet.replyTo && this.replyCallbacks[packet.replyTo]) {
		this.replyCallbacks[packet.replyTo](packet);
	} else {
		this.events.trigger("receive",packet);
	}	
};
/**
 * Used to send a packet
 * @param {string} dst - where to send the packet
 * @param {object} entity - payload of the packet
 * @param {function} callback - callback for any replies
 */
ozpIwc.Client.prototype.send=function(fields,callback) {
	var now=new Date().getTime();
	var id="p:"+this.msgIdSequence++; // makes the code below read better

	var packet={
		ver: 1,
		src: this.participantId,
		msgId: id,
		time: now
	};

	for(var k in fields) {
		packet[k]=fields[k];
	}

	if(callback) {
		this.replyCallbacks[id]=callback;
	}
	var data=JSON.stringify(packet);
	this.peer.postMessage(data,'*');
	this.sentBytes+=data.length;
	this.sentPackets++;
	return packet;
};

ozpIwc.Client.prototype.on=function(event,callback) {
	if(event==="connected" && this.participantId !=="$nobody") {
		callback(this);
		return;
	}
	return this.events.on.apply(this.events,arguments);
};

ozpIwc.Client.prototype.off=function(event,callback) { 
	return this.events.off.apply(this.events,arguments);
};

ozpIwc.Client.prototype.disconnect=function() {
	window.removeEventListener("message",this.messageEventListener,false);
	if(this.iframe) {
		document.body.removeChild(this.iframe);
	}
};

ozpIwc.Client.prototype.createIframePeer=function(peerUrl) {
	var self=this;
	var createIframeShim=function() {
		self.iframe=document.createElement("iframe");
		self.iframe.src=peerUrl+"/iframe_peer.html";
		self.iframe.height=1;
		self.iframe.width=1;
		self.iframe.style="display:none !important;";
		self.iframe.addEventListener("load",function() { self.requestAddress(); },false);	
		document.body.appendChild(self.iframe);
		self.peer=self.iframe.contentWindow;

	};
	// need at least the body tag to be loaded, so wait until it's loaded
	if(document.readyState === 'complete' ) {
		createIframeShim();
	} else {
		window.addEventListener("load",createIframeShim,false);
}
};

ozpIwc.Client.prototype.findPeer=function() {
	// check if we have a parent, get address there if so
//	if(window.parent!==window) {
//		this.peer=window.parent;
//		this.requestAddress();
//	} else {
		this.createIframePeer(this.peerUrl);
//	}
};

ozpIwc.Client.prototype.requestAddress=function(){
	// send connect to get our address
	var self=this;
	this.send({dst:"$transport"},function(message) {
		self.participantId=message.dst;
		self.events.trigger("connected",self);
	});
};