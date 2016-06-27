/*jslint browser:true*/
/*global angular window cordova StatusBar*/

(function () {
    "use strict";

    var services = angular.module("previously_on.services", [
        "angular-md5"
    ]);

    services.service("UserService", function ($http, md5) {
        this.apiKey = "6b01f237a3af";
        this.apiUrl = "https://api.betaseries.com/";
        this.params = {
            params: {
                v: 2.4,
                key: this.apiKey
            }
        };

        this.login = function (user, successCallback, errorCallback) {
            user.password = md5.createHash(user.password || "");

            $http.post(this.apiUrl + "members/auth", user, this.params)
                .then(successCallback, errorCallback);
        };
    });
}());