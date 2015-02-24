/* global debuggerModule */
debuggerModule.controller("packetLogController",["$scope",function(scope) {
    scope.logging=false;
    scope.viewFilter="";
    scope.packets=[];
    scope.maxShown=50;

    var logPacket=function(msg) {        
        if(!scope.logging) {
            return;
        }

        var packet=msg.packet;
        scope.$apply(function() {
           scope.packets.push(packet);
        });
    };

    ozpIwc.defaultPeer.on("receive",logPacket);
    ozpIwc.defaultPeer.on("send",logPacket);

}]);

debuggerModule.directive( "trafficSnooper", [function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/trafficSnooper.tpl.html'
    };
}]);
