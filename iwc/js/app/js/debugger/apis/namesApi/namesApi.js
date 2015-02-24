/* global debuggerModule */
debuggerModule.controller("NamesApiCtrl",["$scope","iwcClient",function(scope,client) {

}]);

debuggerModule.directive( "namesapi", function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/namesApi.tpl.html'
    };
});