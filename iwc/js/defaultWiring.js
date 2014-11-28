var ozpIwc=ozpIwc || {};

ozpIwc.apiRootUrl = ozpIwc.apiRootUrl || "/api";
ozpIwc.marketplaceUsername= ozpIwc.marketplaceUsername || '';
ozpIwc.marketplacePassword= ozpIwc.marketplacePassword || '';
ozpIwc.linkRelPrefix = ozpIwc.linkRelPrefix || "ozp";
ozpIwc.initEndpoints(ozpIwc.apiRootUrl);

ozpIwc.defaultPeer=new ozpIwc.Peer();
ozpIwc.defaultLocalStorageLink=new ozpIwc.KeyBroadcastLocalStorageLink({
    peer: ozpIwc.defaultPeer
});

ozpIwc.authorization=new ozpIwc.BasicAuthorization();

ozpIwc.heartBeatFrequency= 10000; // 10 seconds
ozpIwc.defaultRouter=new ozpIwc.Router({
    peer:ozpIwc.defaultPeer,
    heartbeatFrequency: ozpIwc.heartBeatFrequency
});


if(typeof ozpIwc.runApis === "undefined" || ozpIwc.runApis) {
    ozpIwc.defaultLeadershipStates = function(){
        return {
            'leader': ['actingLeader'],
            'election': ['leaderSync', 'actingLeader'],
            'queueing': ['leaderSync'],
            'member': []
        };
    };

    ozpIwc.initEndpoints(ozpIwc.apiRootUrl || "api");


    ozpIwc.namesApi=new ozpIwc.NamesApi({
        'participant': new ozpIwc.LeaderGroupParticipant({'name': "names.api", 'states':  ozpIwc.defaultLeadershipStates()}),
        'heartbeatDropCount': 3,
        'heartbeatFrequency': ozpIwc.heartBeatFrequency
    });
    ozpIwc.defaultRouter.registerParticipant(ozpIwc.namesApi.participant);

    ozpIwc.dataApi=new ozpIwc.DataApi({
        'participant': new ozpIwc.LeaderGroupParticipant({'name': "data.api", 'states':  ozpIwc.defaultLeadershipStates()})
    });
    ozpIwc.defaultRouter.registerParticipant(ozpIwc.dataApi.participant);

    ozpIwc.intentsApi=new ozpIwc.IntentsApi({
        'participant': new ozpIwc.LeaderGroupParticipant({'name': "intents.api", 'states':  ozpIwc.defaultLeadershipStates()})
    });
    ozpIwc.defaultRouter.registerParticipant(ozpIwc.intentsApi.participant);

    ozpIwc.systemApi=new ozpIwc.SystemApi({
        'participant': new ozpIwc.LeaderGroupParticipant({'name': "system.api", 'states':  ozpIwc.defaultLeadershipStates()})
    });
    ozpIwc.defaultRouter.registerParticipant(ozpIwc.systemApi.participant);
}
if(typeof ozpIwc.acceptPostMessageParticipants === "undefined" ||
    ozpIwc.acceptPostMessageParticipants
    ) {
    ozpIwc.defaultPostMessageParticipantListener=new ozpIwc.PostMessageParticipantListener({
        router: ozpIwc.defaultRouter
    });
}