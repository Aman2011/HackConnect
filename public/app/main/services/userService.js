angular.module('app')
    .factory("userService", function($q, $http, socket, $location){

        return {
            sendMessage: function(id, content){
                $http.post('/messages/send/'+id, {composedMessage: content}).then(function(response) {
                    response.data.recipient = id;
                    socket.emit("send-message", response.data)
                    $('#messageModal').modal('hide');
                }, function (error) {
                    console.log(error);
                });
            },
            getProfileData: function(){
                var deferred = $q.defer();
                $http.get('/profile/data').then(function(response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            openUserProfile: function (id) {
                $location.path('/people/user').search({id: id});
            },
            getSimilarUsers: function () {
                var deferred = $q.defer();
                $http.get('/profile/similar').then(function(response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            }
        }
    });
