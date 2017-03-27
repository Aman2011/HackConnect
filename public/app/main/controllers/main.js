angular.module('app')
    .controller('MainCtrl', function ($scope, $location) {
        $scope.isInbox = function () {
            if($location.path() === "/inbox") {
             return true;
            }

            return false;
        }

    });


