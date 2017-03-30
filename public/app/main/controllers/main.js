angular.module('app')
    .controller('MainCtrl', function ($scope, $location, $http, $window) {
        $scope.name = $window.bootstrappedUserObject.name;
        $scope.confirmation = {
            title: "",
            icon: "",
            text: ""
        }

        $scope.isInbox = function () {
            if($location.path().includes("/inbox")) {
             return true;
            }

            return false;
        }

        $scope.changeName = function (name) {
            var data = {
                field: "name",
                data: name
            }
            $http.post('/profile/data/update', data).then(function (response) {
                if(response) {
                    $window.location.reload();
                }
            })
        }

        $scope.changePassword = function (oldPassword, newPassword) {
            var password = {
                "old": oldPassword,
                "new": newPassword
            }
            if(newPassword == $scope.confirmPassword) {
                $http.post('profile/change-password', password).then(function (response) {
                    if(response.data == true){
                        $('#changePasswordModal').modal('hide');
                        $scope.confirmation = {
                            title: "Password Changed",
                            icon: "fa fa-check-circle-o",
                            text: "Your password has successfully been changed"
                        }
                        $('#confirmationModal').modal('show');
                    } else if(response.data == "error"){
                        $scope.errorMessage = "The entered old password is wrong";
                        $scope.oldPassword = "";
                    }
                }, function (error) {
                    console.log(error);
                })
            }
        }


    });


