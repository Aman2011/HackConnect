angular.module('app')
    .controller('NavbarCtrl', function ($scope, $location, $http, socket, notifier, $window, userService, localStorageService) {
        $scope.conversations = [];
        $scope.conversationsCounter = 0;
        $scope.requests = [];
        $scope.requestsCounter = $scope.requests.length;
        $scope.notifications = [];
        $scope.notificationsCounter = $scope.notifications.length;
        $scope.userService = userService;
        $scope.userName = window.bootstrappedUserObject.name;
        $scope.isInbox = $scope.$parent.isInbox;

        socket.on('message-received', function (data) {
            if(!$scope.isInbox()) {
                console.log(data);
                var newConversation = true;
                angular.forEach($scope.conversations, function (conversation) {
                    if (data.conversationId == conversation._id) {
                        conversation.message = data;
                        conversation.count += 1;

                        newConversation = false;
                    }
                })
                if (newConversation) {
                    var conversation = {
                        _id: data.conversationId,
                        message: data,
                        count: 1
                    }
                    $scope.conversations.push(conversation);
                }
                $scope.conversationsCounter += 1;
                notifier.notify("You have received a new message");
            }
        })


        $scope.checkRoute = function (route) {
            var location = $location.absUrl().toString();
            var route = route.split(',');
            for(var i = 0; i < route.length; i++) {
                if(location.includes(route[i])) {
                    return "active";
                }
            }
            return "";
        }

        $scope.checkCreateProfile = function () {
            if($location.absUrl().includes('/create_profile')) {
                return false;
            }
            return true;
        }

        $scope.acceptRequest = function (request) {
            $http.post('/connections/accept/'+request.sender._id).then(function (response) {
                if(response.data) {
                    notifier.notify("You are now connected to " + request.sender.name);
                    $scope.removeRequest(request);
                    $scope.sendNotification(request);
                }
            }, function (error) {
                console.log(error)
            })
        }

        $scope.rejectRequest = function (request) {
            $http.post('/connections/reject/'+request._id).then(function (response) {
                if(response.data) {
                    $scope.removeRequest(request);
                }
            }, function (error) {
                console.log(error)
            })
        }

        $scope.removeRequest = function(request) {
            var index = $scope.requests.indexOf(request);
            $scope.requests.splice(index, 1);
        }

        $scope.sendNotification = function (request) {
            $http.post('/connections/notify/' + request.sender._id).then(function(response){
                var data = {
                    id: request.sender._id,
                    name: $window.bootstrappedUserObject.name
                }
                socket.emit("request-accepted", data)
            }, function (error) {
                console.log(error);
            })

        }

        $scope.logout = function () {
            $http.post('/logout').then(function(response) {
                if(response) {
                    $window.location.reload();
                }
            });
        }

        $scope.getAllNotifications = function () {
            $http.get('profile/notifications').then(function (response) {
                console.log(response);
                $scope.conversations = response.data.conversations;
                $scope.conversationsCounter = response.data.newMessageCounter;
                $scope.requests = response.data.requests;
                $scope.requestsCounter = response.data.unreadRequestsCounter;
                $scope.notifications = response.data.notifications;
                $scope.notificationsCounter = $scope.notifications.length;
            })
        }

        $scope.markAsRead = function (value) {
            if($scope[value+'Counter'] > 0) {
                var url = "profile/" + value + "/read";
                $http.post(url).then(function (response) {
                    $scope[value + 'Counter'] = 0;
                })
            }
        }

        $scope.markAsOld = function (value) {
            if($scope[value+'Counter'] > 0) {
                var url = "profile/" + value + "/old";
                $http.post(url).then(function (response) {
                    $scope[value + 'Counter'] = 0;
                })
            }
        }
        
        $scope.selectConversation = function (conversation) {
            localStorageService.set("selectedConversation", conversation._id);
            conversation.message.read = true;
            $location.path('/inbox');
        }
        
        socket.on('connected', function (data) {
            console.log(data);
            $scope.notifications.unshift(data + " has accepted your request");
            $scope.notificationsCounter = $scope.notifications.length;
            notifier.notify(data + " has accepted your request");
        })

        socket.on('request-received', function (data) {
            console.log(data);
            $scope.requests.unshift(data);
            $scope.requestsCounter = $scope.requests.length;
            notifier.notify("You have received a request from " + data.sender.name);

        })

        $scope.getAllNotifications();
    });

