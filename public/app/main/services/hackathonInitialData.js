angular.module('app')
    .factory("hackathonCtrlInitData", function(hackathonService, $q) {
    return function () {
        var hackathonData = hackathonService.getHackathonData();
        var team = hackathonService.getTeam();
        return $q.all([hackathonData, team]).then(function (results) {
            return {
                hackathonData: results[0],
                team: results[1]
            };
        });
    }
})
