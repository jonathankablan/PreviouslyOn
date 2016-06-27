/*jslint browser:true*/
/*global angular window cordova StatusBar*/

(function () {
    "use strict";

    var controllers = angular.module("previously_on.controllers", []);

    controllers.controller("WelcomeCtrl", function () {
    controllers.controller("WelcomeCtrl", function (UserService, $ionicPopup) {
        this.user = {};

        var self = this;
        this.login = function (user) {
            UserService.login(user, function (res) {
                alert(res.data);
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