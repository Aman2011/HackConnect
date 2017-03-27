angular.module('app')
    .controller('LoginCtrl', function ($scope, $http) {
        $scope.emailSent = false;

        $scope.signIn = function(email, password){
            var url = '/login';
            var user = {email: email, password: password};
            $http.post(url, user)
                .success(function (res) {
                    console.log(res);
                    if(res.data.success) {
                        console.log('logged in!');
                    } else {
                        console.log('failed to log in!');
                    }
                })
                .error(function (err) {

                });
        }
        
        $scope.sendEmail = function (email) {
            $http.post('/forgot-password', {email: email}).then(function (response) {
                $scope.emailSent = true;
            }, function (err) {
                console.log(err);
            })
        }
    })
