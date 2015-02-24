/* global debuggerModule */
debuggerModule.controller("DataApiCtrl",["$scope","iwcClient",function(scope,client) {

}]);

debuggerModule.directive( "datApi", function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/dataApi.tpl.html'
    };
});