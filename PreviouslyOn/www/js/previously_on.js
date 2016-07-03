/*jslint browser:true*/
/*global angular window cordova StatusBar*/
(function () {
    "use strict";
    var previously_on = angular.module("previously_on", [
        "ionic",
        "previously_on.controllers",
        "previously_on.services",
        "previously_on.filters"
    ]);

    previously_on.run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            navigator.splashscreen.hide();
        });
    });

    previously_on.config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("welcome", {
                cache: false,
                url: "/",
                templateUrl: "partials/welcome.html",
                controller: "WelcomeCtrl",
                controllerAs: "WCtrl"
            })
            .state("home", {
                url: "/home",
                abstract: true,
                cache: false,
                templateUrl: "partials/home.html",
                controller: "HomeCtrl",
                controllerAs: "HCtrl"
            })
            .state("home.options", {
                cache: false,
                url: "/options",
                views: {
                    "home-options": {
                        templateUrl: "partials/options.html",
                        controller: "OptionsCtrl",
                        controllerAs: "OCtrl"
                    }
                }
            })
            .state("home.shows", {
                cache: false,
                url: "/shows",
                views: {
                    "home-shows": {
                        templateUrl: "partials/shows.html",
                        controller: "ShowsCtrl",
                        controllerAs: "SCtrl"
                    }
                }
            })
            .state("home.friends", {
                cache: false,
                url: "/friends",
                views: {
                    "home-friends": {
                        templateUrl: "partials/friends.html",
                        controller: "FriendsCtrl",
                        controllerAs: "FCtrl"
                    }
                }
            });
        $urlRouterProvider.otherwise("/");
    });
}());