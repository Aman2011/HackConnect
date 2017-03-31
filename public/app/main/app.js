angular.module('app', ['ngResource','ngRoute', 'ngFileUpload', 'ngImgCrop', 'ngSanitize', 'ui.bootstrap', 'LocalStorageModule', 'angular-loading-bar']);

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
})
    .run(function ($rootScope, $timeout, cfpLoadingBar) {
        var diff,
            timeoutPromise;

        // Subscribe to broadcast of $stateChangeStart state event via AngularUI Router
        $rootScope.$on('$routeChangeStart', function (event, toState, toParams, fromState, fromParams, error) {

            // If app is not already loading (since we started the loading bar in the config with the isAppLoading)
            if (!$rootScope.isAppLoading) {

                // $timeout returns a deferred promise to execute by the defined time of 400ms
                // set isAppRouting true and start loading bar
                // if route success or error takes 400ms or greater, timeout will execute
                timeoutPromise = $timeout(function () {
                    $rootScope.isAppRouting = true;
                    cfpLoadingBar.start();
                }, 400);

            }

        });

        $rootScope.$on('$routeChangeSuccess', function (event, toState, toParams, fromState, fromParams, error) {

            // Cancel timeout promise (if it exists) from executing, if route success occurs before the 400ms elapses
            if (timeoutPromise) {
                $timeout.cancel(timeoutPromise);
            }

            // Logic to handle elapsed time of app loading phase else handle app routing
            if ($rootScope.isAppLoading) {
                // Find the elapsed difference between the present time and the startTime set in our config
                diff = new Date() - $rootScope.startTime;

                // If 800ms has elapsed, isAppLoading is set to false
                // else create a timeout to set isAppLoading to false after 800ms has elapsed since the startTime was set
                if (diff > 800) {
                    $rootScope.isAppLoading = false;
                    cfpLoadingBar.complete();
                } else {
                    $timeout(function () {
                        $rootScope.isAppLoading = false;
                        cfpLoadingBar.complete();
                    }, 800 - diff);
                }

            } else if ($rootScope.isAppRouting) {
                // App finished routing, complete loading bar
                $rootScope.isAppRouting = false;
                cfpLoadingBar.complete();
            }

        });

    });

angular.module('app')
// Require cfpLoadingBarProvider for configuration
    .config(function (cfpLoadingBarProvider) {

        // Remove loading bar spinner
        cfpLoadingBarProvider.includeSpinner = false;

        // Require cfpLoadingBar
    }).run(function ($rootScope, cfpLoadingBar) {

    // App is loading so auto-set isAppLoading and start a timer
    $rootScope.isAppLoading = true;
    $rootScope.startTime = new Date();

    // Start loading bar for app loading
    cfpLoadingBar.start();

});

angular.module('app').config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setStorageType('sessionStorage');
});

angular.module('app')
    .filter('trustUrl', function ($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    });


