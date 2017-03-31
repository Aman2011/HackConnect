angular.module('app')
    .controller('HackathonCtrl', function ($scope, $location, $http, $window, initialData, userService, hackathonService) {
        var search = $location.search();
        $scope.hackathonData = initialData.hackathonData;
        console.log($scope.hackathonData);
        $scope.team = initialData.participants.team;
        $scope.potentialTeammates = initialData.participants.all;
        console.log($scope.potentialTeammates);
        $scope.participants = [];
        $scope.searchText = "";
        $scope.orderType = "name";
        $scope.dateDuration = hackathonService.getDateDuration($scope.hackathonData.start_date, $scope.hackathonData.end_date);

        $scope.getParticipants = function () {
            $http.get('/hackathon/participants', {params: search}).then(function(response) {
                $scope.participants = response.data;
                console.log($scope.participants);
            }, function (error) {
                console.log(error);
            });
        }

        $scope.attend = function () {
            $http.post('/hackathon/attend/'+search.id).then(function (response) {
                if(response.data) {
                    if($scope.hackathonData.participants == undefined) {
                        $scope.hackathonData.participants = [];
                    }
                    $scope.hackathonData.participants.push($window.bootstrappedUserObject._id);
                }
            }, function (error) {
                console.log(error);
            })
        }

        $scope.isAttending = function () {
            var userId = $window.bootstrappedUserObject._id;
            var participants = $scope.hackathonData.participants;
            if(participants != null && participants.indexOf(userId) !== -1) {
                return true;
            }
            return false;
        }


        $scope.getDateTime = function (date) {
            var dateObj = new Date(date),
                month = dateObj.getMonthNameShort(),
                date = dateObj.getDate(),
                year = dateObj.getFullYear(),
                day = dateObj.getDayNameShort(),
                hour = dateObj.getHours(),
                ampm = hour >= 12 ? 'PM':'AM',
                hour = hour%12,
                hour = hour ? hour : 12,
                min = dateObj.getMinutes();

            return day + ', ' + month + ' ' + date + ', ' + year + ' ' + hour + ':' + min + ' ' + ampm;
        }
        $scope.startDateTime = $scope.getDateTime($scope.hackathonData.start_date);
        $scope.endDateTime = $scope.getDateTime($scope.hackathonData.end_date);

        $scope.openMessageModal = function (selectedUser) {
            $scope.messageUser = selectedUser;
            $('#messageModal').modal();
        }

        $scope.sendMessage = function (content) {
            userService.sendMessage($scope.messageUser._id, content);
            $scope.content = "";
        }

    });

Date.prototype.getMonthName = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].month_names[this.getMonth()];
};

Date.prototype.getMonthNameShort = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].month_names_short[this.getMonth()];
};

Date.prototype.getDayName = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].day_names[this.getDay()];
};

Date.prototype.getDayNameShort = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].day_names_short[this.getDay()];
};

Date.locale = {
    en: {
        month_names: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        month_names_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        day_names: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        day_names_short: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
    }
};