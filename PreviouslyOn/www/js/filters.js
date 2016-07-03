/*jslint browser:true*/
/*global angular window cordova StatusBar*/

(function () {
    "use strict";

    var filters = angular.module("previously_on.filters", []);

    filters.filter('leftpad', function () {
        return function (number, length) {
            if (!number) {
                return number;
            }

            number = '' + number;
            while (number.length < length) {
                number = '0' + number;
            }
            return number;
        };
    });
}());