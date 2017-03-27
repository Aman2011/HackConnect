angular.module('app', ['ngResource','ngRoute', 'ngFileUpload', 'ngImgCrop', 'ngSanitize', 'ui.bootstrap', 'LocalStorageModule']);

angular.module('app').config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/profile', {
            templateUrl: 'partials/main/partials/my-profile',
            controller: 'ProfileCtrl',
            resolve: {
                initialData: function (userCtrlInitData) {
                    return userCtrlInitData();
                }
            }
        })
        .when('/people', {templateUrl: 'partials/main/partials/users', controller: 'UsersCtrl'})
        .when('/hackathons', {templateUrl: 'partials/main/partials/hackathons', controller: 'HackathonsCtrl'})
        .when('/hackathons/hackathon', {
            templateUrl: 'partials/main/partials/hackathon',
            controller:'HackathonCtrl',
            resolve: {
                initialData: function (hackathonCtrlInitData) {
                    return hackathonCtrlInitData();
                }
            }
        })
        .when('/inbox', {templateUrl: 'partials/main/partials/inbox', controller: 'InboxCtrl'})
        .when('/people/user', {templateUrl: 'partials/main/partials/user', controller: 'UserCtrl'})
        .when('/login', {templateUrl: '/login'})
        .otherwise({
            templateUrl: 'partials/main/partials/my-profile',
            controller: 'ProfileCtrl',
            resolve: {
                initialData: function (userCtrlInitData) {
                    return userCtrlInitData();
                }
            }
        })
});

angular.module('app').config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setStorageType('sessionStorage');
});


