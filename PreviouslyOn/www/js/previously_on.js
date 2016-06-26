/*jslint browser:true*/
/*global angular window cordova StatusBar*/
(function () {
    "use strict";
    var previously_on = angular.module("previously_on", [
        "ionic"
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
}());