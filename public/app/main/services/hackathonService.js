angular.module('app')
    .factory("hackathonService", function($q, $http, $location){

    return {
        getHackathonData: function(){
            var search = $location.search();
            var deferred = $q.defer();
            $http.get('/api/hackathons/hackathon', {params: search}).then(function(response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        getTeam: function () {
            var search = $location.search();
            var deferred = $q.defer();
            console.log(search);
            $http.get('/hackathon/getTeam/'+search.id).then(function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            })
            return deferred.promise;
        },
        getDateDuration: function (start_date, end_date) {
        var start = new Date(start_date),
            end = new Date(end_date),
            startM = start.getMonthNameShort(),
            startD = start.getDate(),
            startY = start.getFullYear(),
            endM =  end.getMonthNameShort(),
            endD =  end.getDate(),
            endY = end.getFullYear();

        if(startM === endM && startD == endD && startY == endY)
            return startM + " " + startD + ", " + startY;
        if(startM === endM && startY == endY)
            return startM + " " + startD + " - " + endD + ", " + startY;
        if(startY == endY)
            return startM + " " + startD + " - " + endM + " " + endD + ", " + startY;
        else
            return startM + " " + startD + ", " + startY + " - " + endM + " " + endD + ", " + endY;
    }
    }
});
