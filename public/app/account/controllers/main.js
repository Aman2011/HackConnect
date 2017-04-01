angular.module('app')
    .controller('MainCtrl', function ($scope, $http) {
        $scope.resendLink = function () {
            $http.get('/resendVerificationLink').then(function (response) {
                console.log(response);
            })
        }
    })


