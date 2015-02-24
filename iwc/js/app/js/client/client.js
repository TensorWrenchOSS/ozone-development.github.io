var ozpIwc=ozpIwc || {};

/**
 * Client-side functionality of the IWC. This is the API for widget use.
 * @module client
 */

/**
 * This class will be heavily modified in the future.
 * @class Client
 * @namespace ozpIwc
 *
 * @todo accept a list of peer URLs that are searched in order of preference
 * @param {Object} config
 * @param {String} config.peerUrl - Base URL of the peer server
 * @param {Boolean} [config.autoConnect=true] - Whether to automatically find and connect to a peer
 */
ozpIwc.Client=function(config) {
    config=config || {};

    /**
     * The address assigned to this client.
     * @property address
     * @type String
     */
    this.address="$nobody";

    /**
     * Key value store of callback functions for the client to act upon when receiving a reply via the IWC.
     * @property replyCallbacks
     * @type Object
     */
    this.replyCallbacks={};
    // coerce config.peerUrl to a function
    
    var configUrl=config.peerUrl;
    if(typeof(configUrl) === "string") {
        this.peerUrlCheck=function(url,resolve) {
            if(typeof url !== 'undefined'){
                resolve(url);
            } else {
                resolve(configUrl);
            }

        };
    } else if(Array.isArray(configUrl)) {
        this.peerUrlCheck=function(url,resolve) {
            if(configUrl.indexOf(url) >= 0) {
                resolve(url);
            }
            resolve(configUrl[0]);
        };
    } else if(typeof(configUrl) === "function") {
        /**
         * @property peerUrlCheck
         * @type String
         */
        this.peerUrlCheck=configUrl;
    } else {
        throw new Error("PeerUrl must be a string, array of strings, or function");
    }

    /**
     * @property autoConnect
     * @type {Boolean}
     * @default true
     */
    this.autoConnect=("autoConnect" in config) ? config.autoConnect : true;

    /**
     * @property msgIdSequence
     * @type Number
     * @default 0
     */
    this.msgIdSequence=0;

    /**
     * An events module for the Client
     * @property events
     * @type ozpIwc.Event
     */
    this.events=new ozpIwc.Event();
    this.events.mixinOnOff(this);

    /**
     * @property receivedPackets
     * @type Number
     * @default 0
     */
    this.receivedPackets=0;

    /**
     * @property receivedBytes
     * @type Number
     * @default 0
     */
    this.receivedBytes=0;

    /**
     * @property sentPackets
     * @type Number
     * @default 0
     */
    this.sentPackets=0;

    /**
     * @property sentBytes
     * @type Number
     * @default 0
     */
    this.sentBytes=0;

    /**
     * The epoch time the Client was instantiated.
     * @property startTime
     * @type Number
     */
    this.startTime=ozpIwc.util.now();

    /**
     * @property launchParams
     * @type Object
     * @default {}
     */
    this.launchParams={};
    
    this.readLaunchParams(window.name);
    this.readLaunchParams(window.location.search);
    this.readLaunchParams(window.location.hash);
    
    /**
     * A map of available apis and their actions.
     * @property apiMap
     * @type Object
     */
    this.apiMap={};

    /**
     * @property wrapperMap
     * @type Object
     * @default {}
     */
    this.wrapperMap={};


    /**
     * @property preconnectionQueue
     * @type Array
     * @default []
     */
    this.preconnectionQueue=[];

    /**
     * @property watchMsgMap
     * @type Object
     * @defualt {}
     */
    this.watchMsgMap = {};


    /**
     * @property launchedIntents
     * @type Array
     * @defualt []
     */
    this.launchedIntents = [];

    if(this.autoConnect) {
        this.connect();
    }


};

/**
 * Parses launch parameters based on the raw string input it receives.
 * @property readLaunchParams
 * @param {String} rawString
 */
ozpIwc.Client.prototype.readLaunchParams=function(rawString) {
    // of the form ozpIwc.VARIABLE=VALUE, where:
    //   VARIABLE is alphanumeric + "_"
    //   VALUE does not contain & or #
    var re=/ozpIwc.(\w+)=([^&#]+)/g;
    var m;
    while((m=re.exec(rawString)) !== null) {
        var params = decodeURIComponent(m[2]);
        try{
            params = JSON.parse(params);
        } catch(e){
            // ignore the errors and just pass through the string
        }
        this.launchParams[m[1]]=params;
    }
};
/**
 * Receive a packet from the connected peer.  If the packet is a reply, then
 * the callback for that reply is invoked.  Otherwise, it fires a receive event
 *
 * Fires:
 *     - {{#crossLink "ozpIwc.Client/receive:event}}{{/crossLink}}
 *
 * @method receive
 * @protected
 * @param {ozpIwc.TransportPacket} packet
 */
ozpIwc.Client.prototype.receive=function(packet) {

    if(packet.replyTo && this.replyCallbacks[packet.replyTo]) {
        var cancel = false;
        var done=function() {
            cancel = true;
        };
        this.replyCallbacks[packet.replyTo](packet,done);
        if (cancel) {
            this.cancelCallback(packet.replyTo);

            if(this.watchMsgMap[packet.replyTo].action === "watch") {
                this.api(this.watchMsgMap[packet.replyTo].dst).unwatch(this.watchMsgMap[packet.replyTo].resource);
                delete this.watchMsgMap[packet.replyTo];
            }
        }
    } else {
        /**
         * Fired when the client receives a packet.
         * @event #receive
         */
        this.events.trigger("receive",packet);
    }
};
/**
 * Sends a packet through the IWC.
 *
 * @method send
 * @param {String} dst Where to send the packet.
 * @param {Object} entity  The payload of the packet.
 * @param {Function} callback The Callback for any replies. The callback will be persisted if it returns a truth-like
 * value, canceled if it returns a false-like value.
 */
ozpIwc.Client.prototype.send=function(fields,callback,preexistingPromise) {
    var promise= preexistingPromise; // || new Promise();
    if(!(this.isConnected() || fields.dst==="$transport")) {
        // when send is switched to promises, create the promise first and return it here, as well
        this.preconnectionQueue.push({
            'fields': fields,
            'callback': callback,
            'promise': promise
        });
        return promise;
    }
    var now=new Date().getTime();
    var id="p:"+this.msgIdSequence++; // makes the code below read better
    var packet={
        ver: 1,
        src: this.address,
        msgId: id,
        time: now
    };

    for(var k in fields) {
        packet[k]=fields[k];
    }

    if(callback) {
        this.replyCallbacks[id]=callback;
    }
    ozpIwc.util.safePostMessage(this.peer,packet,'*');
    this.sentBytes+=packet.length;
    this.sentPackets++;

    if(packet.action === "watch") {
        this.watchMsgMap[id] = packet;
    }
    return packet;
};

/**
 * Returns whether or not the Client is connected to the IWC bus.
 * @method isConnected
 * @returns {Boolean}
 */
ozpIwc.Client.prototype.isConnected=function(){
    return this.address !== "$nobody";
};

/**
 * Cancel a callback registration.
 * @method cancelCallback
 * @param (String} msgId The packet replyTo ID for which the callback was registered.
 *
 * @return {Boolean} True if the cancel was successful, otherwise false.
 */
ozpIwc.Client.prototype.cancelCallback=function(msgId) {
    var success=false;
    if (msgId) {
        delete this.replyCallbacks[msgId];
        success=true;
    }
    return success;
};

/**
 * Registers callbacks
 * @method on
 * @param {String} event The event to call the callback on.
 * @param {Function} callback The function to be called.
 *
 */
ozpIwc.Client.prototype.on=function(event,callback) {
    if(event==="connected" && this.isConnected()) {
        callback(this);
        return;
    }
    return this.events.on.apply(this.events,arguments);
};

/**
 * De-registers callbacks
 * @method off
 * @param {String} event The event to call the callback on.
 * @param {Function} callback The function to be called.
 *
 */
ozpIwc.Client.prototype.off=function(event,callback) {
    return this.events.off.apply(this.events,arguments);
};

/**
 * Disconnects the client from the IWC bus.
 * @method disconnect
 */
ozpIwc.Client.prototype.disconnect=function() {
    this.replyCallbacks={};
    window.removeEventListener("message",this.postMessageHandler,false);
    if(this.iframe) {
        this.iframe.src = "about:blank";
        var self = this;
        window.setTimeout(function(){
            document.body.removeChild(self.iframe);
            self.iframe = null;
        },0);
    }
};


/**
 * Connects the client from the IWC bus.
 * Fires:
 *     - {{#crossLink "ozpIwc.Client/#connected"}}{{/crossLink}}
 *
 * @method connect
 */
ozpIwc.Client.prototype.connect=function() {
    if(!this.connectPromise) {
        var self=this;

        /**
         * Promise to chain off of for client connection asynchronous actions.
         * @property connectPromise
         * @type Promise
         */
        this.connectPromise=new Promise(function(resolve) {
            self.peerUrlCheck(self.launchParams.peer,resolve);
        }).then(function(url) {
            // now that we know the url to connect to, find a peer element
            // currently, this is only via creating an iframe.
            self.peerUrl=url;
            self.peerOrigin=ozpIwc.util.determineOrigin(url);
            return self.createIframePeer();
        }).then(function() {
            // start listening to the bus and ask for an address
            this.postMessageHandler = function(event) {
                if(event.origin !== self.peerOrigin){
                    return;
                }
                try {
                    var message=event.data;
                    if (typeof(message) === 'string') {
                        message=JSON.parse(event.data);
                    }
                    self.receive(message);
                    self.receivedBytes+=(event.data.length * 2);
                    self.receivedPackets++;
                } catch(e) {
                    // ignore!
                }
            };
            // receive postmessage events
            window.addEventListener("message", this.postMessageHandler, false);
            return new Promise(function(resolve,reject) {
                self.send({dst:"$transport"},function(message,done) {
                    self.address=message.dst;

                    /**
                     * Fired when the client receives its address.
                     * @event #gotAddress
                     */
                    self.events.trigger("gotAddress",self);
                    resolve(self.address);
                    done();
                });
            });
        }).then(function(){
                // gather api information
                return new Promise(function(resolve,reject) {

                    self.send({
                        dst: "names.api",
                        action: "get",
                        resource: "/api"
                    },function(reply){
                        if(reply.response === 'ok'){
                           resolve(reply.entity);
                        } else{
                            reject(reply.response);
                        }
                    });

                });
        }).then(function(apis) {
                var promiseArray = [];
                apis.forEach(function (api) {
                    promiseArray.push(new Promise(function (resolve, reject) {
                        self.send({
                            dst: "names.api",
                            action: "get",
                            resource: api
                        }, function (res) {
                            if (res.response === 'ok') {
                                var name = api.replace('/api/', '');
                                self.apiMap[name] = {
                                    'address': name,
                                    'actions': res.entity.actions
                                };

                                resolve();
                            } else {
                                reject(res.response);
                            }
                        });
                    }));
                });
                return Promise.all(promiseArray);
        }).then(function(){
                for(var api in self.apiMap){
                    var apiObj = self.apiMap[api];
                    var apiFuncName = apiObj.address.replace('.api','');

                    //prevent overriding client constructed fields
                    if(!self.hasOwnProperty(apiFuncName)){
                        // wrap this in a function to break the closure
                        // on apiObj.address that would otherwise register
                        // everything for the last api in the list
                        /*jshint loopfunc:true*/
                        (function(addr){
                            self[apiFuncName] = function(){
                                return self.api(addr);
                            };
                            self.apiMap[addr] = self.apiMap[addr] || {};
                            self.apiMap[addr].functionName = apiFuncName;
                        })(apiObj.address);
                    }
                }
        }).then(function() {
                // dump any queued sends, trigger that we are fully connected
                self.preconnectionQueue.forEach(function (p) {
                    self.send(p.fields, p.callback, p.promise);
                });
                self.preconnectionQueue = null;

                if (!self.launchParams.inFlightIntent) {
                    return;
                }

                // fetch the inFlightIntent
                var packet = {
                    dst: "intents.api",
                    resource: self.launchParams.inFlightIntent,
                    action: "get"
                };
                return new Promise(function (resolve, reject) {
                    self.send(packet, function (response, done) {
                        self.launchedIntents.push(response);
                        if (response.response === 'ok') {
                            for (var k in response.entity) {
                                self.launchParams[k] = response.entity[k];
                            }
                        }
                        resolve();
                        done();
                    });
                });
            }).then(function() {
                /**
                 * Fired when the client is connected to the IWC bus.
                 * @event #connected
                 */
                self.events.trigger("connected");
            })['catch'](function(error) {
                ozpIwc.log.log("Failed to connect to bus ",error);
            });
    }
    return this.connectPromise; 
};

/**
 * Creates an invisible iFrame Peer for IWC bus communication.
 * @method createIframePeer
 */
ozpIwc.Client.prototype.createIframePeer=function() {
    var self=this;
    return new Promise(function(resolve,reject) {
        var createIframeShim=function() {
            self.iframe=document.createElement("iframe");
            self.iframe.addEventListener("load",function() {
                resolve();
            });
            self.iframe.src=self.peerUrl+"/iframe_peer.html";
            self.iframe.height=1;
            self.iframe.width=1;
            self.iframe.setAttribute("area-hidden",true);
            self.iframe.setAttribute("hidden",true);
            self.iframe.style.setProperty ("display", "none", "important");
            document.body.appendChild(self.iframe);
            self.peer=self.iframe.contentWindow;
            

        };
        // need at least the body tag to be loaded, so wait until it's loaded
        if(document.readyState === 'complete' ) {
            createIframeShim();
        } else {
            window.addEventListener("load",createIframeShim,false);
        }
    });
};

(function() {
    ozpIwc.Client.prototype.api=function(apiName) {
        var wrapper=this.wrapperMap[apiName];
        if (!wrapper) {
            if(this.apiMap.hasOwnProperty(apiName)) {
                var api = this.apiMap[apiName];
                wrapper = {};
                for (var i = 0; i < api.actions.length; ++i) {
                    var action = api.actions[i];
                    wrapper[action] = augment(api.address, action, this);
                }

                this.wrapperMap[apiName] = wrapper;
            }
        }
        wrapper.apiName=apiName;
        return wrapper;
    };

    var intentInvocationHandling = function(client,resource,intentResource,callback) {
        return new Promise(function(resolve,reject) {
            client.send({
                dst: "intents.api",
                action: "get",
                resource: intentResource
            }, function (response, done) {
                response.entity.handler = {
                    address: client.address,
                    resource: resource
                };
                response.entity.state = "running";


                client.send({
                    dst: "intents.api",
                    contentType: response.contentType,
                    action: "set",
                    resource: intentResource,
                    entity: response.entity
                }, function (reply, done) {
                    //Now run the intent
                    response.entity.reply.entity = callback(response.entity) || {};
                    // then respond to the inflight resource
                    response.entity.state = "complete";
                    response.entity.reply.contentType = response.entity.intent.type;
                    client.send({
                        dst: "intents.api",
                        contentType: response.contentType,
                        action: "set",
                        resource: intentResource,
                        entity: response.entity
                    });
                    done();
                    resolve(response);
                });
                done();
            });
        });
    };

    var augment = function (dst,action,client) {
        return function (resource, fragment, otherCallback) {
            // If a fragment isn't supplied argument #2 should be a callback (if supplied)
            if(typeof fragment === "function"){
                otherCallback = fragment;
                fragment = {};
            }
            return new Promise(function (resolve, reject) {
                var packet = {
                    'dst': dst,
                    'action': action,
                    'resource': resource,
                    'entity': {}
                };
                for (var k in fragment) {
                    packet[k] = fragment[k];
                }
                var packetResponse = false;
                var callbackResponse = !!!otherCallback;
                client.send(packet, function (reply,done) {

                    function initialDone() {
                        if(callbackResponse){
                            done();
                        } else {
                            packetResponse = true;
                        }
                    }

                    function callbackDone() {
                        if(packetResponse){
                            done();
                        } else {
                            callbackResponse = true;
                        }
                    }
                    if (reply.response === 'ok') {
                        resolve(reply);
                        initialDone();
                    } else if (/(bad|no).*/.test(reply.response)) {
                        reject(reply);
                        initialDone();
                    }
                    else if (otherCallback) {
                        if(reply.entity && reply.entity.inFlightIntent) {
                            intentInvocationHandling(client,resource,reply.entity.inFlightIntent,otherCallback,callbackDone);
                        } else {
                            otherCallback(reply, callbackDone);
                        }
                    }
                });
                if(dst === "intents.api" && action === "register"){
                    for(var i in client.launchedIntents){
                        var loadedResource = '/' + client.launchedIntents[i].entity.intent.type + '/' + client.launchedIntents[i].entity.intent.action;
                        if(resource === loadedResource){
                            intentInvocationHandling(client,resource,client.launchedIntents[i].resource,otherCallback);
                            delete client.launchedIntents[i];
                        }
                    }
                }
            });
        };
    };
})();