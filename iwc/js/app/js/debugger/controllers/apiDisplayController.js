/* global debuggerModule */
debuggerModule.controller("apiDisplayController",["$scope","iwcClient",function(scope,client) {
    scope.keys=[];
    scope.query = function() {
				scope.refresh();
    };
    scope.loadKey = function (key) {
            client.send({
                    'dst': scope.api.address,
                    'action': "get",
                    'resource': key.resource
            }, function (response, done) {
                    for (var i in response) {
                            key[i] = response[i];
                    }
                    key.isLoaded = true;
                    done();
            });
            client.send({
                    'dst': scope.api.address,
                    'action': "list",
                    'resource': key.resource
            }, function (response, done) {
                    if (response.response === "ok") {
                            key.children = response.entity;
                    } else {
                            key.children = "Not Supported: " + response.response;
                    }
                    done();
            });
    };
    scope.performAction = function(action,key) {
        client.send({
            'dst': scope.api.address,
            'action': action,
            'resource': key.resource
        });
    };

    scope.refresh=function() {
        client.send({
            'dst': scope.api.address,
            'action': "list"
        },function(response,done) {
            scope.keys=response.entity.map(function(k) {
                var key={
                    'resource': k,
                    'isLoaded':false,
                    'isWatched':false
                };
                scope.loadKey(key);
                return key;
            });
            done();
        });
    };
    

    
    scope.watchKey=function(key) {
        if(key.isWatched) {
            client.send({
                'dst': scope.api.address,
                'action': "watch",
                'resource': key.resource
            },function(response) {
                if(response.response === 'changed') {
                    scope.$evalAsync(function() {
                        key.entity=response.entity.newValue;
                        key.permissions=response.permissions;
                        key.contentType=response.contentType;
                    });
                }
                return key.isWatched;
            });
        }
    };
    scope.refresh();
}]);
