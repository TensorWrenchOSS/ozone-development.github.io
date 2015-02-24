/* global debuggerModule */
debuggerModule.controller("SystemApiCtrl",["$scope","iwcClient",function(scope,client) {

}]);

debuggerModule.directive( "sysapi", function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/systemApi.tpl.html'
    };
});