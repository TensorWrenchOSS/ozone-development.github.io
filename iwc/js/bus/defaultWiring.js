var ozpIwc=ozpIwc || {};

if(ozpIwc.Peer) {
	ozpIwc.defaultPeer=new ozpIwc.Peer();
}

if(ozpIwc.Router) {
	ozpIwc.defaultRouter=new ozpIwc.Router({
			peer:ozpIwc.defaultPeer
		});
}

if(ozpIwc.LocalStorageLink) {
	ozpIwc.defaultLocalStorageLink=new ozpIwc.KeyBroadcastLocalStorageLink({
		peer: ozpIwc.defaultPeer
	});
//	ozpIwc.defaultLocalStorageLink=new ozpIwc.LocalStorageLink({
//		peer: ozpIwc.defaultPeer
//	});	
}

if(ozpIwc.PostMessageParticipantListener) {
	ozpIwc.defaultPostMessageParticipantListener=new ozpIwc.PostMessageParticipantListener({
		router: ozpIwc.defaultRouter
	});
}

if(ozpIwc.BasicAuthorization) {
	ozpIwc.authorization=new ozpIwc.BasicAuthorization();
}

if(ozpIwc.KeyValueApi) {
	ozpIwc.keyValueApi=new ozpIwc.LeaderGroupParticipant({
		name: "keyValue.api",
		target: new ozpIwc.KeyValueApi()		
	});

	ozpIwc.defaultRouter.registerParticipant(ozpIwc.keyValueApi);
}
//
//if(ozpIwc.NamesApi) {
//	ozpIwc.namesApi=new ozpIwc.LeaderGroupParticipant({
//		name: "names.api",
//		target: new ozpIwc.NamesApi()
//	});
//	ozpIwc.defaultRouter.registerParticipant(ozpIwc.namesApi);
//}
//
//if(ozpIwc.IntentsApi) {
//	ozpIwc.intentsApi=new ozpIwc.LeaderGroupParticipant({
//		name: "intents.api",
//		target: new ozpIwc.IntentsApi()
//	});
//	ozpIwc.defaultRouter.registerParticipant(ozpIwc.intentsApi);
//}