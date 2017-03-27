angular.module('app')
    .controller('UsersCtrl', function ($scope, $location, $http, userService) {
        $scope.users = [];
        $scope.newLength = 0;
        $scope.id = undefined;
        $scope.searchId = undefined;
        $scope.searchText = "";
        $scope.getUsers = function() {
            var data = {
                test: $scope.id
            };
            $http.get('/api/users', {params: data}).then(function(response) {
                if(response.data) {
                    $scope.newLength = response.data.length;
                    angular.forEach(response.data, function (user, key) {
                    $scope.users.push(user);
                    if(key == response.data.length - 1){
                        $scope.id = user._id;
                    }
                })
                }
            }, function (err) {
                console.log(err);
            })
        };

        $scope.search = function () {
            if($scope.searchText == "") {
                $scope.id = undefined;
                $scope.getUsers();
            } else {
                var data = {
                    "text": $scope.searchText,
                    "id": $scope.searchId
                }
                $http.get('/api/users/search',{params: data}).then(function (response) {
                    $scope.users = response.data;
                }, function (err) {
                    console.log(err);
                });
            }
        }

        $scope.openUserProfile = function(id) {
            userService.openUserProfile(id);
        }

        $scope.getUsers();
    });

