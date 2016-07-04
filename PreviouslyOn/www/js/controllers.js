/*jslint browser:true*/
/*global angular window cordova StatusBar*/

(function () {
    "use strict";

    var controllers = angular.module("previously_on.controllers", []);

    controllers.controller("WelcomeCtrl", function (UserService, $ionicPopup, $state) {
        this.user = {};
        var self = this;

        UserService.getCredentials();
        if (UserService.credentials) {
            $state.go("home.shows", {}, {reload: true});
            return true;
        }

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

    controllers.controller("HomeCtrl", function ($state, $ionicHistory, UserService, ShowService) {
        UserService.getCredentials();
        if (!UserService.credentials) {
            $state.go("welcome", {}, {reload: true});
            return false;
        }
        if (!UserService.credentials.rememberMe) {
            UserService.clearCredentials();
        }
        UserService.setToken(UserService.credentials.token);
        ShowService.setToken(UserService.credentials.token);

        this.logout = function () {
            UserService.clearCredentials();
            $state.go("welcome", {}, {reload: true});
            return true;
        };
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });
    });

    controllers.controller("OptionsCtrl", function () {

    });

    controllers.controller("ShowsCtrl", function (ShowService, $ionicModal, $scope, $ionicPopup, $q) {
        this.myShows = null;
        this.showToDetail = null;
        this.episodeToDetail = null;
        this.searchString = "";
        this.searchResults = null;
        this.isShowingUnseenEpisodes = true;
        this.isShowingSeenEpisodes = false;
        this.unseenEpisodes = [];
        this.seenEpisodes = [];
        this.commentString = "";
        var self = this;

        // Chargement des modales
        $ionicModal.fromTemplateUrl('partials/show-details-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.showDetailsModal = modal;
        });

        $ionicModal.fromTemplateUrl('partials/search-show-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.searchShowModal = modal;
        });

        $ionicModal.fromTemplateUrl('partials/episodes-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.episodesModal = modal;
        });

        $ionicModal.fromTemplateUrl('partials/episode-details-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.episodeDetailsModal = modal;
        });

        $ionicModal.fromTemplateUrl('partials/comment-episode-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.commentEpisodeModal = modal;
        });

        this.getMyCurrentShows = function () {
            ShowService.myShows("current", function (shows) {
                $scope.$broadcast('scroll.refreshComplete');
                self.myShows = shows;
            }, function (err) {
                $ionicPopup.alert({
                    title: "Uh-oh... something went wrong !",
                    template: err.data.errors[0].text
                });
            });
        };

        this.getShowDetails = function (show) {
            self.showToDetail = show;
            $scope.showDetailsModal.show();
        };

        this.hideDetails = function () {
            self.showToDetail = null;
            $scope.showDetailsModal.hide();
            self.getMyCurrentShows();
        };

        this.archiveShow = function (id) {
            ShowService.archiveShow(id, function () {
                $ionicPopup.alert({
                    title: "Well done :)",
                    template: "The show '" + self.showToDetail.title + "' is now archived !"
                }).then(function () {
                    self.hideDetails();
                });
            }, function (err) {
                $ionicPopup.alert({
                    title: "Uh-oh... something went wrong !",
                    template: err.data.errors[0].text
                }).then(function () {
                    self.hideDetails();
                });
            });
        };

        this.searchShow = function () {
            $scope.searchShowModal.show();
        };

        this.hideSearch = function () {
            self.searchString = "";
            self.searchResults = null;
            $scope.searchShowModal.hide();
        };

        this.searchFromInput = function (string) {
            if (string.length > 0) {
                ShowService.searchShow(string, function (resp) {
                    self.searchResults = resp.data.shows;
                }, function (err) {
                    $ionicPopup.alert({
                        title: "Uh-oh... something went wrong !",
                        template: err.data.errors[0].text
                    }).then(function () {
                        self.hideDetails();
                    });
                });
            } else {
                self.searchResults = null;
            }
        };

        this.addShow = function (id) {
            ShowService.addShow(id, function (resp) {
                $ionicPopup.alert({
                    title: "Well done :)",
                    template: "You're now watching the show '" + resp.data.show.title + "' !"
                }).then(function () {
                    self.hideSearch();
                    self.hideDetails();
                });
            }, function (err) {
                $ionicPopup.alert({
                    title: "Uh-oh... something went wrong !",
                    template: err.data.errors[0].text
                }).then(function () {
                    self.hideDetails();
                });
            });
        };

        this.showEpisodes = function (id) {
            var promises = [];
            promises[0] = $q(function (resolve, reject) {
                ShowService.getEpisodes("unseen", id, function (episodes) {
                    self.unseenEpisodes = episodes;
                    resolve();
                }, function (err) {
                    reject(err);
                });
            });
            promises[1] = $q(function (resolve, reject) {
                ShowService.getEpisodes("seen", id, function (episodes) {
                    self.seenEpisodes = episodes;
                    resolve();
                }, function (err) {
                    reject(err);
                });
            });

            $q.all(promises).then(function () {
                $scope.episodesModal.show();
            }, function (err) {
                $ionicPopup.alert({
                    title: "Uh-oh... something went wrong !",
                    template: err.data.errors[0].text
                }).then(function () {
                    self.hideDetails();
                });
            });

        };
        this.hideEpisodes = function () {
            $scope.episodesModal.hide();
            self.showUnseenEpisodes();
            self.getMyCurrentShows();
        };

        this.showUnseenEpisodes = function () {
            self.isShowingSeenEpisodes = false;
            self.isShowingUnseenEpisodes = true;
        };

        this.showSeenEpisodes = function () {
            self.isShowingSeenEpisodes = true;
            self.isShowingUnseenEpisodes = false;
        };

        this.getEpisodeDetails = function (episode) {
            self.episodeToDetail = episode;
            self.episodeToDetail.img = ShowService.getEpisodePicture(episode.id);
            $scope.episodeDetailsModal.show();
        };
        this.hideEpisodeDetails = function () {
            this.episodeToDetail = null;
            $scope.episodeDetailsModal.hide();
        };

        this.markEpisodeAsSeen = function (id, bulk) {
            ShowService.markEpisodeAsSeen(id, bulk, function (resp) {
                $ionicPopup.alert({
                    title: "Well done !",
                    template: "You just mark this episode as seen."
                }).then(function () {
                    self.showEpisodes(resp.data.episode.show.id);
                });
            }, function (err) {
                $ionicPopup.alert({
                    title: "Uh-oh... something went wrong !",
                    template: err.data.errors[0].text
                }).then(function () {
                    self.hideEpisodes();
                });
            });
        };

        this.showPopupEpisode = function (id) {
            $scope.data = {};
            var myPopup;
            self.episodeToComment = id;

            myPopup = $ionicPopup.show({
                template: 'What do you want to do ?',
                title: 'Manage an episode',
                scope: $scope,
                cssClass: "popup-vertical-buttons",
                buttons: [
                    {text: 'Cancel'},
                    {
                        text: '<b>Mark as Seen</b>',
                        type: 'button-positive',
                        onTap: function () {
                            ShowService.markEpisodeAsSeen(id, false, function (resp) {
                                $ionicPopup.alert({
                                    title: "Well done !",
                                    template: "You just mark this episode as seen."
                                }).then(function () {
                                    self.showEpisodes(resp.data.episode.show.id);
                                    myPopup.close();
                                });
                            }, function (err) {
                                $ionicPopup.alert({
                                    title: "Uh-oh... something went wrong !",
                                    template: err.data.errors[0].text
                                }).then(function () {
                                    self.hideEpisodes();
                                    myPopup.close();
                                });
                            });
                        }
                    },
                    {
                        text: '<b>Mark as Seen + Previous</b>',
                        type: 'button-positive',
                        onTap: function () {
                            ShowService.markEpisodeAsSeen(id, true, function (resp) {
                                $ionicPopup.alert({
                                    title: "Well done !",
                                    template: "You just mark this episode as seen and all the previouses."
                                }).then(function () {
                                    self.showEpisodes(resp.data.episode.show.id);
                                    myPopup.close();
                                });
                            }, function (err) {
                                $ionicPopup.alert({
                                    title: "Uh-oh... something went wrong !",
                                    template: err.data.errors[0].text
                                }).then(function () {
                                    myPopup.close();
                                    self.hideEpisodes();
                                });
                            });
                        }
                    },
                    {
                        text: '<b>Comment</b>',
                        type: 'button-positive',
                        onTap: function () {
                            self.showCommentEpisode();
                            myPopup.close();
                        }
                    }
                ]
            });

        };

        this.showCommentEpisode = function () {
            $scope.commentEpisodeModal.show();

        };
        this.hideCommentEpisode = function () {
            this.commentString = "";
            $scope.commentEpisodeModal.hide();
        };

        this.postCommentEpisode = function (message) {
            ShowService.postCommentOnEpisode(self.episodeToComment, message, function () {
                $ionicPopup.alert({
                    title: "Well done !",
                    template: "You just comment this episode."
                }).then(function () {
                    self.hideCommentEpisode();
                });
            }, function (err) {
                $ionicPopup.alert({
                    title: "Uh-oh... something went wrong !",
                    template: err.data.errors[0].text
                }).then(function () {
                    self.hideCommentEpisode();
                });
            });
        };

        this.markEpisodeAsUnseen = function (id) {
            ShowService.unmarkEpisodeAsSeen(id, function (resp) {
                $ionicPopup.alert({
                    title: "Well done !",
                    template: "You just mark this episode as unseen."
                }).then(function () {
                    self.showEpisodes(resp.data.episode.show.id);
                });
            }, function (err) {
                $ionicPopup.alert({
                    title: "Uh-oh... something went wrong !",
                    template: err.data.errors[0].text
                }).then(function () {
                    self.hideEpisodes();
                });
            });
        };

        this.getMyCurrentShows();
    });

    controllers.controller("FriendsCtrl", function () {

    });
}());