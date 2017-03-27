angular.module('app')
    .controller('HackathonsCtrl', function ($scope, $location, $http, hackathonService) {
        $scope.hackathons = [];
        $scope.newLength = 0;
        $scope.id = undefined;
        $scope.searchId = undefined;
        $scope.searchText = "";

        $scope.getHackathons = function() {
            var data = {
                last: $scope.id
            };
            $http.get('/api/hackathons', {params: data}).then(function(response) {
                if(response.data) {
                    $scope.newLength = response.data.length;
                    angular.forEach(response.data, function (hackathon, key) {
                        $scope.hackathons.push(hackathon);
                        if (key == response.data.length - 1) {
                            $scope.id = hackathon._id;
                        }
                    })
                }
            }, function (err) {
                console.log(err);
            })
        };
        $scope.openHackathon = function(id) {
            $location.path('/hackathons/hackathon').search({id: id});
        }
        $scope.search = function () {
            if($scope.searchText === "") {
                $scope.id = undefined;
                $scope.getHackathons();
            }else {
                var data = {
                    "text": $scope.searchText,
                    "id": $scope.searchId
                }
                $http.get('/api/hackathons/search',{params: data}).then(function (response) {
                    $scope.hackathons = response.data;
                }, function (err) {
                    console.log(err);
                });
            }

        }

        $scope.getDateDuration = function (start_date, end_date) {
           return hackathonService.getDateDuration(start_date, end_date);
        }

        $scope.getHackathons();
    });
