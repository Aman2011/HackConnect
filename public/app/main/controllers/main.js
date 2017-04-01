angular.module('app')
    .controller('MainCtrl', function ($scope, $location, $http, $window) {
        $scope.user = $window.bootstrappedUserObject;
        $scope.roles = [];
        $scope.projectTypes = [];
        $scope.name = $scope.user ? $scope.user.name : '';
        $scope.preferences = {
            role: $scope.user.profile.role,
            projectTypes: angular.copy($scope.user.profile.projectTypes)
        }
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

        $scope.getData = function (filename) {
            $http.get('/data/'+ filename + ".json").then(function (response) {
                $scope[filename] = response.data;
            }, function (error) {

            })
        }

        $scope.isSelected = function (projectType) {
            if($scope.preferences.projectTypes.indexOf(projectType) != -1) return true;
            return false;
        }

        $scope.toggleProjectType = function(projectType) {
            if($scope.preferences.projectTypes.indexOf(projectType) == -1) {
                $scope.preferences.projectTypes.push(projectType);
            } else {
                var index = $scope.preferences.projectTypes.indexOf(projectType);
                $scope.preferences.projectTypes.splice(index, 1);
            }
        }

        $scope.selectRole = function(role) {
            $scope.preferences.role = role;
        }

        $scope.updatePreferences = function (preferences) {
            $http.post('/profile/preferences/update', preferences).then(function (response) {
                if(response.data) {
                    $window.location.reload();
                }
            })
        }

        $('#preferencesModal').on('hidden.bs.modal', function () {
            $scope.$apply(function () {
                $scope.preferences = {
                    role: $scope.user.profile.role,
                    projectTypes: angular.copy($scope.user.profile.projectTypes)
                }
            })
        })

        $scope.getData("roles");
        $scope.getData("projectTypes");

    });


