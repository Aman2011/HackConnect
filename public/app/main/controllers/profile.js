angular.module('app')
    .controller('ProfileCtrl', function ($scope, $location, $http, userService, initialData, dataService, hackathonService) {
        $scope.userData = initialData.userData;
        $scope.similarUsers = initialData.similarUsers;
        $scope.hackathons = [];
        $scope.connections = [];
        $scope.messageUser;
        $scope.skills = [];
        $scope.initSkills = false;
        $scope.initProfessionalDetails = false;

        $scope.getUserHackathons = function () {
            $http.get('/profile/hackathons').then(function (response) {
                $scope.hackathons = response.data;
                angular.forEach($scope.hackathons, function (hackathon) {
                    hackathon.duration = hackathonService.getDateDuration(hackathon.start_date, hackathon.end_date);
                })
                console.log(response.data);
            })
        }

        $scope.getUserConnections = function () {
            $http.get('/profile/connections').then(function (response) {
                console.log(response.data);
                $scope.connections = response.data;
            })
        }

        $scope.goToHackathon = function (id) {
            $location.path('/hackathons/hackathon').search({id: id});
        }

        $scope.openMessageModal = function (selectedUser) {
            $scope.messageUser = selectedUser;
            $('#messageModal').modal();
        }

        $scope.sendMessage = function (content) {
            userService.sendMessage($scope.messageUser._id, content);
            $scope.content = "";
        }

        $scope.edit = function (id) {
            if(id === "#editSkills") {
                if(!$scope.initSkills) {
                    dataService.initTagsTypeahead();
                    $('.tags-input-container .tags-typeahead').on('typeahead:selected', function (obj, selected, name) {
                        if ($scope.skills.indexOf(selected) == -1) {
                            $scope.skills.push(selected);
                            $scope.$apply();
                        }
                        $this.typeahead('val', '');

                    })
                    $scope.initSkills = true;
                }
                $scope.skills = angular.copy($scope.userData.skills);
            }
            if(id === "#editSocialProfiles") {
                $scope.socialProfiles = angular.copy($scope.userData.socialProfiles);
            }
            if(id === "#editProfessionalDetails") {
                if(!$scope.initProfessionalDetails) {
                    dataService.initPrefetchTypeahead();
                    dataService.initSchoolTypeahead();
                    $scope.initProfessionalDetails = true;
                }
                $scope.profile = angular.copy($scope.userData);

            }
            $(id).modal();
        }

        $scope.saveEdit = function (field, id, data) {
            var data = {
                field: "profile."+field,
                data: data
            }
            if(field === "profile") data.field = field;
            console.log(data);
            $http.post('/profile/data/update', data).then(function (response) {
                if(response) {
                    if(field === "profile") $scope.userData = data.data;
                    else $scope.userData[field] = data.data;
                    $(id).modal('hide');
                }
            })
        }

        $scope.removeSkill = function(skill) {
            var index = $scope.skills.indexOf(skill);
            $scope.skills.splice(index, 1);
        }

        $scope.isEmpty = function (value) {
            if(value === "" || value == undefined) {
                return true;
            }
            return false;
        }

        $scope.isEmptyObject = function (obj) {
            var state = true;
            for (var key in obj) {
                if ( !( obj[key] === null || obj[key] === "" ) ) {
                    state = false;
                    break;
                }
            }
            return state;

        }

    })
