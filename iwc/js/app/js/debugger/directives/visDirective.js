/* global debuggerModule */

debuggerModule.directive('timeSeries', function() {
        return {
            restrict : 'E',
//            replace : true,
//            template: "<div></div>",
            scope: {
                metrics: '='
            },
            link: function($scope,element){
                $scope.container = element[0];
                // Create a DataSet with data (enables two way data binding)
                $scope.data = new vis.DataSet({
                    
                });
                $scope.groups = new vis.DataSet();
                // Configuration for the Timeline
                $scope.options = {
                    stack:false,
                    height: "100%",
                    groupOrder: 'content',
                    start: new Date(),
                    end: new Date(Date.now() + 60000),
                    zoomMax: 60000,
                    legend: true
                };

                // Create a Timeline
                $scope.timeline = new vis.Graph2d($scope.container, $scope.data,$scope.groups, $scope.options);
            },
            controller: function($scope){
                $scope.$on("timeSeriesData",function(event,data) {
                    $scope.data.add(data);
                    var now=$scope.timeline.getCurrentTime();
                    var range=$scope.timeline.getWindow();
                    if(now.getTime() > range.end.getTime()) {
                        $scope.timeline.moveTo(now);
                    }
                });
                $scope.$watch('metrics',function(newVal){
//                    $scope.timeline.setGroups(
                    $scope.groups.update(newVal.map(function(m) {
                        return {
                            id: m.name,
                            content: m.name,
                            visible: m.visible
                        };
                    }));
                },true);
            }
        };
    });

