angular.module('app')
    .factory("hackathonCtrlInitData", function(hackathonService, $q) {
    return function () {
        var hackathonData = hackathonService.getHackathonData();
        var participants = hackathonService.getTeam();
        return $q.all([hackathonData, participants]).then(function (results) {
            return {
                hackathonData: results[0],
                participants: results[1]
            };
        });
    }
})
