/*jslint browser:true*/
/*global angular window cordova StatusBar*/

(function () {
    "use strict";

    var controllers = angular.module("previously_on.controllers", []);

    controllers.controller("WelcomeCtrl", function (UserService, $ionicPopup, $state) {
        this.user = {};
        var self = this;
        this.login = function (user) {
            UserService.login(user, function (response) {
                var credentials = {};
                credentials.id = response.data.user.id;
                credentials.login = response.data.user.login;
                credentials.token = response.data.token;
                credentials.rememberMe = user.rememberMe || false;
                UserService.setCredentials(credentials);
                self.user = {};

                $state.go("welcome", {}, {reload: true});
            }, function (err) {
                $ionicPopup.alert({
                    title: "Uh-oh... something went wrong !",
                    template: err.data.errors[0].text
                }).then(function () {
                    self.user.password = "";
                });
            });
        };
    });
}());