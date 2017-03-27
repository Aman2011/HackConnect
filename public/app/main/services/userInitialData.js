angular.module('app')
    .factory("userCtrlInitData", function(userService, $q) {
        return function () {
            var userData = userService.getProfileData();
            var similarUsers = userService.getSimilarUsers();
            return $q.all([userData, similarUsers]).then(function (results) {
                return {
                    userData: results[0],
                    similarUsers: results[1]
                };
            });
        }
    })

