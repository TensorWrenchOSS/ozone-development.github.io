/* global debuggerModule */
debuggerModule.controller("IntentsApiCtrl",["$scope","iwcClient",function(scope,client) {

}]);

debuggerModule.directive( "intentsapi", function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/intentsApi.tpl.html'
    };
});