/*jslint browser:true*/
/*global angular window cordova StatusBar*/

(function () {
    "use strict";

    var services = angular.module("previously_on.services", [
        "angular-md5"
    ]);

    services.service("UserService", function ($http, md5) {
        this.credentials = {};
        this.apiKey = "6b01f237a3af";
        this.apiUrl = "https://api.betaseries.com/";
        this.params = {
            params: {
                v: 2.4,
                key: this.apiKey
            }
        };
        var self = this;

        this.login = function (user, successCallback, errorCallback) {
            user.password = md5.createHash(user.password || "");

            $http.post(this.apiUrl + "members/auth", user, this.params)
                .then(successCallback, errorCallback);
        };

        this.setCredentials = function (credentials) {
            localStorage.setItem('Previously_On_Credentials', JSON.stringify(credentials));
        };

        this.getCredentials = function () {
            this.credentials = JSON.parse(localStorage.getItem('Previously_On_Credentials')) || false;
        };

        this.clearCredentials = function () {
            localStorage.removeItem('Previously_On_Credentials');
        };

        this.setToken = function (token) {
            this.params.params.token = token;
        };

        this.unsetToken = function () {
            delete this.params.params.token;
        };

        this.getFriends = function (blocked, successCallback, errorCallback) {
            var url = blocked === true
                ? this.apiUrl + "friends/list?blocked=true"
                : this.apiUrl + "friends/list";
            $http.get(url, this.params)
                .then(function (resp) {
                    successCallback(self.getUserPicture(resp.data.users));
                }, errorCallback);
        };


        this.getUserPicture = function (users) {
            users.forEach(function (user) {
                user.picture = "https://api.betaseries.com/pictures/members?id=" + user.id + "&key=" + self.params.params.key + "&token=" + self.params.params.token + "&v=" + self.params.params.v;
            });
            return users;
        };

        this.blockFriend = function (id, successCallback, errorCallback) {
            $http.post(this.apiUrl + "friends/block", {id: id}, this.params)
                .then(successCallback, errorCallback);
        };

        this.unblockFriend = function (id, successCallback, errorCallback) {
            $http({
                method: "DELETE",
                url: this.apiUrl + "friends/block",
                params: {
                    v: 2.4,
                    key: this.apiKey,
                    token: this.params.params.token,
                    id: id
                }
            })
                .then(successCallback, errorCallback);
        };

        this.addFriend = function (id, successCallback, errorCallback) {
            $http.post(this.apiUrl + "friends/friend", {id: id}, this.params)
                .then(successCallback, errorCallback);
        };

        this.deleteFriend = function (id, successCallback, errorCallback) {
            $http({
                method: "DELETE",
                url: this.apiUrl + "friends/friend",
                params: {
                    v: 2.4,
                    key: this.apiKey,
                    token: this.params.params.token,
                    id: id
                }
            })
                .then(successCallback, errorCallback);
        };

        this.searchUser = function (string, successCallback, errorCallback) {
            $http.get(this.apiUrl + "members/search?limit=25&login=" + string + "%", this.params)
                .then(function (resp) {
                    successCallback(self.getUserPicture(resp.data.users));
                }, errorCallback);
        };
    });

    services.service("ShowService", function ($http) {
        this.apiKey = "6b01f237a3af";
        this.apiUrl = "https://api.betaseries.com/";
        this.params = {
            params: {
                v: 2.4,
                key: this.apiKey
            }
        };
        var self = this;

        this.setToken = function (token) {
            this.params.params.token = token;
        };

        this.myShows = function (whichOnes, successCallback, errorCallback) {
            $http.get(this.apiUrl + "members/infos?only=shows", this.params)
                .then(function (resp) {
                    successCallback(self.filterShows(whichOnes, resp.data.member.shows));
                }, errorCallback);
        };

        this.filterShows = function (whichOnes, shows) {
            var filteredShows = [];

            switch (whichOnes) {
            case "current":
                filteredShows = shows.filter(function (show) {
                    return show.user.archived === false;
                });
                break;
            case "archived":
                filteredShows = shows.filter(function (show) {
                    return show.user.archived === true;
                });
                break;
            case "favorited":
                filteredShows = shows.filter(function (show) {
                    return show.user.favorited === true;
                });
                break;
            default:
                filteredShows = shows;
                break;
            }
            return filteredShows;
        };
        this.filterEpisodes = function (whichOnes, episodes) {
            var filteredEpisodes = [];

            switch (whichOnes) {
            case "seen":
                filteredEpisodes = episodes.filter(function (episode) {
                    return episode.user.seen === true;
                });
                break;
            case "unseen":
                filteredEpisodes = episodes.filter(function (episode) {
                    return episode.user.seen === false;
                });
                break;
            default:
                filteredEpisodes = episodes;
                break;
            }
            return filteredEpisodes;
        };

        this.archiveShow = function (id, successCallback, errorCallback) {
            $http.post(this.apiUrl + "shows/archive", {id: id}, this.params)
                .then(successCallback, errorCallback);
        };

        this.unarchiveShow = function (id, successCallback, errorCallback) {
            $http({
                method: "DELETE",
                url: this.apiUrl + "shows/archive",
                params: {
                    v: 2.4,
                    key: this.apiKey,
                    token: this.params.params.token,
                    id: id
                }
            })
                .then(successCallback, errorCallback);
        };

        this.searchShow = function (string, successCallback, errorCallback) {
            $http.get(this.apiUrl + "shows/search?title=" + string, this.params)
                .then(successCallback, errorCallback);
        };

        this.addShow = function (id, successCallback, errorCallback) {
            $http.post(this.apiUrl + "shows/show", {id: id}, this.params)
                .then(successCallback, errorCallback);
        };

        this.getEpisodes = function (whichOnes, id, successCallback, errorCallback) {
            $http.get(this.apiUrl + "shows/episodes?id=" + id, this.params)
                .then(function (resp) {
                    successCallback(self.filterEpisodes(whichOnes, resp.data.episodes));
                }, errorCallback);
        };

        this.getEpisodePicture = function (id) {
            return "https://api.betaseries.com/pictures/episodes?id=" + id + "&key=" + this.params.params.key + "&token=" + this.params.params.token + "&v=" + this.params.params.v;
        };

        this.markEpisodeAsSeen = function (id, bulk, successCallback, errorCallback) {
            this.params.params.bulk = bulk;
            $http.post(this.apiUrl + "episodes/watched", {
                id: id
            }, this.params)
                .then(successCallback, errorCallback);
        };

        this.unmarkEpisodeAsSeen = function (id, successCallback, errorCallback) {
            $http({
                method: "DELETE",
                url: this.apiUrl + "episodes/watched",
                params: {
                    v: 2.4,
                    key: this.apiKey,
                    token: this.params.params.token,
                    id: id
                }
            })
                .then(successCallback, errorCallback);
        };

        this.postCommentOnEpisode = function (id, message, successCallback, errorCallback) {
            $http.post(this.apiUrl + "comments/comment", {type: 'episode', id: id, text: message}, this.params)
                .then(successCallback, errorCallback);
        };

    });
}());