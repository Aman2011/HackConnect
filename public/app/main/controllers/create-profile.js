angular.module('app')
    .controller('CreateProfileCtrl',["$scope", "Upload", "$timeout", "$http", "$q", "$window", function ($scope, Upload, $timeout, $http, $q, $window) {
        $scope.projectTypes = [];
        $scope.selectedTypes = [];
        $scope.skills = [];
        $scope.roles = [];
        $scope.degree = [];
        $scope.selectedRole = "";
        $scope.profile = $window.bootstrappedUserObject.profile;


        $scope.getData = function (filename) {
            $http.get('/data/'+ filename + ".json").then(function (response) {
                $scope[filename] = response.data;
            }, function (error) {

            })
        }
        
        $scope.onSelect = function ($item, $model, $label) {
            $scope.profile.education.school = $item.name;
            $scope.profile.education.country = $item.country;
        }

        $scope.initTagsTypeAhead = function() {
            $('.tags-input-container .tags-typeahead').each(function () {
                $this = $(this);
                var filename = $this.data("file-name");
                var data = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.whitespace,
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    prefetch: '/data/'+ filename + ".json"
                });

                $this.typeahead(null, {
                    name: filename,
                    source: data
                }).on('typeahead:selected', function(obj, selected, name) {
                    if($scope.skills.indexOf(selected) == -1) {
                        $scope.skills.push(selected);
                        $scope.$apply();
                    }
                    $this.typeahead('val', '');

                });
            })
        }

        $scope.removeSkill = function(skill) {
            var index = $scope.skills.indexOf(skill);
            $scope.skills.splice(index, 1);
        }

        $scope.toggleProjectType = function(projectType, event) {
            if($scope.selectedTypes.indexOf(projectType) == -1) {
                $scope.selectedTypes.push(projectType);
            } else {
                var index = $scope.selectedTypes.indexOf(projectType);
                $scope.selectedTypes.splice(index, 1);
            }
            $(event.target).toggleClass('active');
        }

        $scope.selectRole = function(role) {
            $scope.selectedRole = role;
        }

        $scope.saveImage = function () {
            $('.profile-pic').attr("src", $scope.croppedDataUrl);
        }

        $scope.sendImage = function () {
            var deferred = $q.defer();
            var dataUrl = $scope.croppedDataUrl;
            var file = $scope.picFile;
            if( file != undefined) {
                Upload.upload({
                    url: 'create_profile/upload',
                    data: {
                        file: Upload.dataUrltoBlob(dataUrl, file.name)
                    },
                }).then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    deferred.reject(error)
                });
                return deferred.promise
            }
            return deferred.reject("no file to upload");
        }

        $scope.submitForm = function () {
            if($scope.picFile != undefined) {
                $scope.sendImage().then(function (success) {
                    if(success) {
                        $scope.sendFormData();
                    }
                }, function (err) {
                    console.log(err);
                })
            } else {
                $scope.sendFormData();
            }

        }

        $scope.sendFormData = function () {
            var formData = JSON.stringify($('form').serializeObject());
            $http.post("create_profile", formData).then(function (success) {
                $window.location.href = "/home";
            }, function (error) {
                console.log(error);
            })
        }

        $scope.isEmpty = function (value) {
            if(value === "" || value == undefined) {
                return true;
            }
            return false;
        }

        $scope.initTagsTypeAhead();
        $scope.getData("countries");
        $scope.getData("schools");
        $scope.getData("companies");
        $scope.getData("roles");
        $scope.getData("degree");
        $scope.getData("projectTypes");
    }])


$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
