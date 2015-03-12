YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ozpIwc.ApiError",
        "ozpIwc.AsyncAction",
        "ozpIwc.CancelableEvent",
        "ozpIwc.Client",
        "ozpIwc.CommonApiBase",
        "ozpIwc.CommonApiCollectionValue",
        "ozpIwc.CommonApiValue",
        "ozpIwc.DataApi",
        "ozpIwc.DataApiValue",
        "ozpIwc.Endpoint",
        "ozpIwc.EndpointRegistry",
        "ozpIwc.Event",
        "ozpIwc.FragmentPacket",
        "ozpIwc.FragmentStore",
        "ozpIwc.IntentsApi",
        "ozpIwc.IntentsApiDefinitionValue",
        "ozpIwc.IntentsApiHandlerValue",
        "ozpIwc.IntentsApiTypeValue",
        "ozpIwc.InternalParticipant",
        "ozpIwc.KeyBroadcastLocalStorageLink",
        "ozpIwc.LeaderGroupParticipant",
        "ozpIwc.LocalStorageLink",
        "ozpIwc.MetricsRegistry",
        "ozpIwc.MulticastParticipant",
        "ozpIwc.NamesApi",
        "ozpIwc.NamesApiValue",
        "ozpIwc.NetworkPacket",
        "ozpIwc.Participant",
        "ozpIwc.Peer",
        "ozpIwc.PostMessageParticipant",
        "ozpIwc.PostMessageParticipantListener",
        "ozpIwc.Router",
        "ozpIwc.RouterWatchdog",
        "ozpIwc.SystemApi",
        "ozpIwc.SystemApiApplicationValue",
        "ozpIwc.Timer",
        "ozpIwc.TransportPacket",
        "ozpIwc.TransportPacketContext",
        "ozpIwc.log",
        "ozpIwc.metricStats",
        "ozpIwc.metricStats.BinaryHeap",
        "ozpIwc.metricStats.ExponentiallyDecayingSample",
        "ozpIwc.metricTypes.BaseMetric",
        "ozpIwc.metricTypes.Counter",
        "ozpIwc.metricTypes.Gauge",
        "ozpIwc.metricTypes.Histogram",
        "ozpIwc.metricTypes.Meter",
        "ozpIwc.metricsStats.Sample",
        "ozpIwc.metricsStats.UniformSample",
        "ozpIwc.policyAuth.PDP",
        "ozpIwc.policyAuth.SecurityAttribute",
        "ozpIwc.util",
        "ozpIwcPolicies"
    ],
    "modules": [
        "bus",
        "bus.api",
        "bus.network",
        "bus.security",
        "bus.transport",
        "bus.util",
        "client",
        "common",
        "metrics",
        "metrics.statistics",
        "metrics.types"
    ],
    "allModules": [
        {
            "displayName": "bus",
            "name": "bus",
            "description": "```\n   .---------------------------.\n  /,--..---..---..---..---..--. `.\n //___||___||___||___||___||___\\_|\n [j__ ######################## [_|\n    \\============================|\n .==|  |\"\"\"||\"\"\"||\"\"\"||\"\"\"| |\"\"\"||\n/======\"---\"\"---\"\"---\"\"---\"=|  =||\n|____    []*  IWC     ____  | ==||\n//  \\\\        BUS    //  \\\\ |===||  hjw -(& kjk)\n\"\\__/\"---------------\"\\__/\"-+---+'\n```"
        },
        {
            "displayName": "bus.api",
            "name": "bus.api",
            "description": "Classes related to api aspects of the IWC."
        },
        {
            "displayName": "bus.api.Type",
            "name": "bus.api.Type",
            "description": "The API classes that can be used on the IWC bus. All of which subclass {{#crossLink \"ozpIwc.CommonApiBase\"}}{{/crossLink}}"
        },
        {
            "displayName": "bus.api.Value",
            "name": "bus.api.Value",
            "description": "The API Value types that can be used in IWC apis. All of which subclass\n{{#crossLink \"CommonApiValue\"}}{{/crossLink}}"
        },
        {
            "displayName": "bus.network",
            "name": "bus.network",
            "description": "Classes related to security aspects of the IWC."
        },
        {
            "displayName": "bus.network.packets",
            "name": "bus.network.packets",
            "description": "Various packet definitions for the network aspects of the IWC. These are not instantiable, rather guidelines for\nconforming to classes that use them."
        },
        {
            "displayName": "bus.security",
            "name": "bus.security",
            "description": "Classes related to security aspects of the IWC."
        },
        {
            "displayName": "bus.transport",
            "name": "bus.transport",
            "description": "Classes related to transport aspects of the IWC."
        },
        {
            "displayName": "bus.util",
            "name": "bus.util",
            "description": "Utility methods used on the IWC bus."
        },
        {
            "displayName": "client",
            "name": "client",
            "description": "Client-side functionality of the IWC. This is the API for widget use."
        },
        {
            "displayName": "common",
            "name": "common",
            "description": "Common classes used between both the Client and the Bus."
        },
        {
            "displayName": "metrics",
            "name": "metrics",
            "description": "Metrics capabilities for the IWC."
        },
        {
            "displayName": "metrics.statistics",
            "name": "metrics.statistics",
            "description": "Statistics classes for the ozpIwc Metrics"
        },
        {
            "displayName": "metrics.types",
            "name": "metrics.types",
            "description": "Types of metrics available."
        }
    ]
} };
});