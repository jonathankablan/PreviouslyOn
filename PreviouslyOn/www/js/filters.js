/*jslint browser:true*/
/*global angular window cordova StatusBar*/

(function () {
    "use strict";

    var filters = angular.module("previously_on.filters", []);

    filters.filter("leftpad", function () {
        return function (number, length) {
            if (!number) {
                return number;
            }

            number = "" + number;
            while (number.length < length) {
                number = "0" + number;
            }
            return number;
        };
    });

    filters.filter("capitalize", function () {
        return function (input) {
            if (!input) {
                return false;
            }

            return input.charAt(0).toUpperCase() + input.substr(1);
        };
    });
}());