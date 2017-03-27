
angular.module('app')
    .controller('RegisterCtrl', function ($scope, $http) {
        $scope.submit = function(){
            var url = "/signup";
            var user = {
                name: $scope.name,
                email: $scope.email,
                password: $scope.password
            };
            $http.post(url, user)
                .success(function (res) {
                    console.log("success")
                })
                .error(function (err) {
                    
                });
        }
    })
