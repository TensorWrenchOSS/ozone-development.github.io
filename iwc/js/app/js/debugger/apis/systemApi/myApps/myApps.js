/* global debuggerModule */
debuggerModule.controller("MyAppsCtrl",["$scope","iwcClient",function(scope,client) {

  function saveAppData(appResource) {
    return client.api("system.api").get(appResource).then(function(response) {
      if (response.response === "ok") {
          scope.appListings.push(response.entity);
        } else {
          console.log("Not Supported: " + response.response);
        }
    });
  }

    function getApplicationResources() {
      return client.api('system.api').get('/application').then(function (response) {
        if (response.response === "ok") {
          return response.entity;
        } else {
          return console.log("Not Supported: " + response.response);
        }
      });
    }

    function getUserInfo() {
      return client.api('system.api').get('/user').then(function (response) {
        if (response.response === "ok") {
          scope.username = response.entity.username;
          scope.userRole = response.entity.highestRole;
          return response.entity;
        } else {
          return console.log("Not Supported: " + response.response);
        }
      });
    }

    function getApplications() {
      scope.loadingMarketplace = true;
      return getApplicationResources().then(function(apps) {
        console.log('got ' + apps.length + ' apps from MP');
        scope.appListings = [];
        return apps.reduce(function (previous, current) {
          return previous.then(function () {
            var promise = saveAppData(current);
            return promise;
          }).catch(function (error) {
            console.log('should not have happened: ' + error);
          });
        }, Promise.resolve()).then(function () {
          // all application data obtained
          console.log('finished getting app data for ' + scope.appListings.length + ' apps');
          scope.loadingMarketplace = false;
          if(!scope.$$phase) { scope.$apply(); }
        });
      });
    }

  scope.refresh = function() {
        getUserInfo();
        getApplications().then(function () {
          if (!scope.$$phase) {
              scope.$apply();
          }
        });
  };

}]);

debuggerModule.directive( "myApps", [function() {
    return {
      restrict: 'E',
      templateUrl: 'templates/myApps.tpl.html'
    };
}]);