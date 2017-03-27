angular.module('app')
    .controller('UserCtrl', function ($scope, $location, $http, $window, socket, notifier, userService) {
        var search = $location.search();
        $scope.userData = {};
        $scope.connectionStatus;
        $scope.hackathons = [];
        $scope.connections = [];
        $scope.similarUsers = [];
        $scope.messageUser;

        $scope.setConnectionStatus = function () {
            $http.get('/user/connection-status/'+search.id).then(function (response) {
                console.log(response);
                $scope.connectionStatus = response.data;
            })
        }

        $scope.getProfileData = function () {
            $http.get('/api/users/user', {params: search}).then(function(response) {
                $scope.userData = response.data;
            }, function (error) {
                console.log(error);
            });
        }

        $scope.getUserHackathons = function () {
            $http.get('/user/hackathons/'+$scope.userData._id).then(function (response) {
                $scope.hackathons = response.data;
                console.log(response.data);
            })
        }

        $scope.getUserConnections = function () {
            $http.get('/user/connections/'+$scope.userData._id).then(function (response) {
                console.log(response.data);
                $scope.connections = response.data;
            })
        }

        $scope.getSimilarUsers = function () {
            $http.get('/user/similar/'+search.id).then(function (response) {
                console.log(response.data);
                $scope.similarUsers = response.data;
            })
        }


        $scope.goToHackathon = function (id) {
            $location.path('/hackathons/hackathon').search({id: id});
        }

        $scope.openMessageModal = function (selectedUser) {
            $scope.messageUser = selectedUser;
            $('#messageModal').modal();
        }

        $scope.sendMessage2 = function (content) {
            userService.sendMessage($scope.messageUser._id, content);
            $scope.content = "";
        }

        $scope.sendConnectionRequest = function () {
            $http.post('/connections/send/'+search.id).then(function (response) {
                if(response.data.error) {
                    console.log(response.data.error);
                    notifier.error(response.data.error);
                } else {
                    socket.emit('send-request', response.data);
                    console.log(response.data);
                    notifier.success("Your connection request is sent")
                    $scope.connectionStatus = "requested";
                }
            }, function (err) {
                console.log(err);
            })
        }

        $scope.sendMessage = function (content) {
            $http.post('/messages/send/'+search.id, {composedMessage: content}).then(function (response) {
                console.log(response.data);
                response.data.recipient = search.id;
                socket.emit("send-message", response.data)
                $('#messageModal').modal('hide');
            }, function (err) {
                console.log(err);
            })

        }

        $scope.isEmpty = function (value) {
            if(value === "" || value == undefined) {
                return true;
            }
            return false;
        }

        $scope.isEmptyObject = function (obj) {
            var state = true;
            for (var key in obj) {
                if ( !( obj[key] === null || obj[key] === "" ) ) {
                    state = false;
                    break;
                }
            }
            return state;

        }

        $scope.getProfileData();
        $scope.setConnectionStatus();
        $scope.getSimilarUsers();
    });

