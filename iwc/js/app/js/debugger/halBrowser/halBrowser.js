/* global debuggerModule */
 debuggerModule.controller('HalBrowserCtrl',['$scope', '$state', 'iwcClient',function(scope, state, client){
 scope.$on('$stateChangeSuccess',
      function(event, toState, toParams) {
        if (toState.name.indexOf('hal-browser') > -1) {
          scope.iframeSrc = 'hal-browser/browser.html#' + toParams.url;
        }
      });
}]);