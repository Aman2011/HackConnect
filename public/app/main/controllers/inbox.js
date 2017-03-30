angular.module('app')
    .controller('InboxCtrl', function ($scope, $location, $http, $window, localStorageService, $timeout) {
        $scope.conversations = [];
        $scope.selectedConversation;
        $scope.messages = [];
        $scope.currentUser = $window.bootstrappedUserObject;

        $scope.getSelectedConversation = function () {
            var id = localStorageService.get("selectedConversation");
            $scope.selectedConversation = $scope.conversations[0];
            if(id != undefined) {
                angular.forEach($scope.conversations, function (conversation) {
                    if(conversation._id === id) {
                        $scope.selectedConversation =  conversation;
                    }
                })
            }
        }

        $scope.getAllConversations = function () {
            $http.get('/messages').then(function (response) {
                console.log(response.data);
                if(response.data.conversations.length > 0) {
                    $scope.conversations = response.data.conversations;
                    $scope.getSelectedConversation();
                    $scope.getConversation($scope.selectedConversation);
                }
            }, function (err) {
                console.log(err);
            })
        }

        $scope.getConversation = function (conversation) {
            $('.inbox-thread-messages').invisible();
            $scope.selectedConversation = conversation;
            localStorageService.set("selectedConversation", conversation._id);
            $http.get("/messages/"+conversation._id).then(function (response) {
                $scope.selectedConversation.message.read = true;
                $scope.messages = response.data.conversation.reverse();
                $timeout(function () {
                    $scope.scrollToBottom();
                }, 0.001);
                $http.post("/messages/"+conversation._id+"/read").then(function (response) {
                    if(response.data) {
                        console.log("All messages read");
                    }
                })
            }, function (err) {
                console.log(err);
            })
        }

        $scope.scrollToBottom = function () {
            var $element = $('.inbox-thread-messages');
            var diff = $element[0].scrollHeight - $element.height();
            $element.scrollTop(diff);
            $element.visible();

        }

        $scope.alignText = function (authorId) {
            if($window.bootstrappedUserObject._id === authorId) {
                return "text-right";
            }
            return "text-left";
        }

        $scope.sendMessage = function () {
            var recipientId = $scope.selectedConversation.participant._id;
            $http.post('/messages/send/'+recipientId, {composedMessage: $scope.newMessage}).then(function (response) {
                $scope.messages.push(response.data);
                $scope.selectedConversation.message = response.data;
                $scope.newMessage = "";
                console.log(response.data);
                $timeout(function () {
                    $scope.scrollToBottom();
                }, 0.001);
                response.data.participants = [recipientId];
                socket.emit("send-chat-message", response.data);
            }, function (err) {
                console.log(err);
            })
        }

        socket.on('message-received', function (data) {
            console.log(data);
            $scope.$apply(function () {
                if(data.conversationId == $scope.selectedConversation._id) {
                    $http.post("/messages/"+data.conversationId+"/read").then(function (response) {
                        if(response.data) {
                            console.log("All messages read");
                        }
                    })
                    data.read = true;
                    $scope.messages.push(data);
                    $scope.selectedConversation.message = angular.copy(data);
                    $scope.selectedConversation.message.author = $scope.selectedConversation.participant._id;
                    $timeout(function () {
                        $scope.scrollToBottom();
                    }, 0.002);
                }
                else {
                    var newConversation = true;
                    angular.forEach($scope.conversations, function (conversation) {
                        if(conversation._id == data.conversationId) {
                            conversation.message = data;
                            conversation.message.author = conversation.participant._id;
                            console.log(conversation);
                            newConversation = false;
                        }
                    })

                    if(newConversation) {
                        var conversation = {
                            _id: data.conversationId,
                            message: data,
                            count: 1
                        }
                        $scope.conversations.push(conversation);
                    }
                }
            })
        })

        $scope.getAllConversations();
    });

jQuery.fn.visible = function() {
    return this.css('visibility', 'visible');
};

jQuery.fn.invisible = function() {
    return this.css('visibility', 'hidden');
};