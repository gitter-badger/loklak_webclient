'use strict';
/* global angular, $ */
/* jshint unused:false */

var controllersModule = require('./_index');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('../components/photoswipe-ui-default');
var moment = require('moment');
/**
 * @ngInject
 */
function WallCtrl($scope, $rootScope, $window, AccountsService, HelloService) {

    var vm = this;
    var term = '';
    var isEditing = -1;

    var initWallOptions = function() {
        $scope.newWallOptions = {};
        $scope.newWallOptions.headerColour = '#3c8dbc';
        $scope.newWallOptions.headerPosition = 'Top';
        $scope.newWallOptions.layoutStyle = 1;
    };

    initWallOptions();

    function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
        //Selects foreground colour as black or white based on background
    function colourCalculator(rgb) {
        var o = Math.round(((parseInt(rgb.r) * 299) + (parseInt(rgb.g) * 587) + (parseInt(rgb.b) * 114)) / 1000);
        if (o > 125) {
            return '#000000';
        } else {
            return '#FFFFFF';
        }
    }

    $scope.$watch('newWallOptions.headerColour', function() {
        if ($scope.newWallOptions.headerColour) {
            $scope.newWallOptions.headerForeColour = colourCalculator(hexToRgb($scope.newWallOptions.headerColour));
        }
    });

    $scope.$watch('newWallOptions.mainHashtagText', function() {
        if ($scope.newWallOptions.mainHashtagText) {
            if ($scope.newWallOptions.mainHashtagText.length !== 0) {
                if ($scope.newWallOptions.mainHashtagText[0] !== '#') {
                    $scope.newWallOptions.mainHashtag = '#' + $scope.newWallOptions.mainHashtagText;
                } else {
                    $scope.newWallOptions.mainHashtag = $scope.newWallOptions.mainHashtagText;
                }
            }
        }
    });

    $scope.lostMainhashtagFocus = function(){
        //check if mainHashtag already in allHashtags
        // var inHashtags = false;
        // for (var i = 0; i < $scope.newWallOptions.allHashtags.length; i++) {
        //     //console.log($scope.newWallOptions.allHashtags[i]);
        //     if($scope.newWallOptions.allHashtags[i].text == $scope.newWallOptions.mainHashtagText){
        //         inHashtags = true;
        //         break;
        //     }
        // }
        // if(inHashtags==false){
        //     $scope.newWallOptions.allHashtags.unshift({text:$scope.newWallOptions.mainHashtagText});
        // }

    };

    // $scope.onTagRemoving = function(tag){
    //     if($scope.newWallOptions.allHashtags.length==1)
    //         return false;
    //     else
    //         return true;
    // }

    $scope.proceed = function() {
        $('.nav-tabs > .active').next('li').find('a').trigger('click');
    };

    $scope.start = function() {
        //construct term
        delete $scope.newWallOptions.link;
        var dataParams = encodeURIComponent(angular.toJson($scope.newWallOptions));
        $('#wall-modal').modal('toggle');
        //console.log($rootScope.root.twitterSession);
        if ($rootScope.root.twitterSession) {
            //save wall
            //console.log("Saving wall");
            var saveData = {};
            saveData.screen_name = $scope.screen_name;
            $scope.newWallOptions.link = '/wall/display?data=' + dataParams;
            if (isEditing !== -1) {
                $scope.userData.wall.walls[isEditing] = $scope.newWallOptions;
                isEditing = -1;
            } else {
                $scope.userData.wall.walls.push($scope.newWallOptions);
            }

            saveData.apps = $scope.userData;
            AccountsService.updateData(saveData);
        }
        initWallOptions();
        $window.open('/wall/display?data=' + dataParams, '_blank');
    };

    $scope.resetDate = function() {
        $scope.newWallOptions.sinceDate = null;
        $scope.newWallOptions.untilDate = null;
    };

    $scope.deleteWall = function(index) {
        //console.log(index);
        $scope.userData.wall.walls.splice(index, 1);
        var saveData = {};
        saveData.screen_name = $scope.screen_name;
        saveData.apps = $scope.userData;
        AccountsService.updateData(saveData);
    };

    $scope.editWall = function(index) {
        //console.log(index);
        $scope.newWallOptions = $scope.userData.wall.walls[index];
        isEditing = index;
        $('#wall-modal').modal('toggle');
    };

    var init = function() {

        if ($rootScope.root.twitterSession) {
            AccountsService.getData($rootScope.root.twitterSession.screen_name).then(function(result) {
                    console.log(result);
                    ////console.log(result.accounts[0].apps.wall.walls);
                    $scope.screen_name = result.accounts[0].screen_name;
                    if (!result.accounts[0].apps) {
                        result.accounts[0].apps = {
                            wall: {
                                walls: []
                            }
                        };
                    }
                    if (!result.accounts[0].apps.wall) {
                        result.accounts[0].apps.wall = {
                            walls: []
                        };
                    }
                    if (!result.accounts[0].apps.wall.walls) {
                        result.accounts[0].apps.wall.walls = [];
                    }
                    $scope.userData = result.accounts[0].apps;
                    //$scope.userWalls = result.accounts[0].apps.wall.walls;
                },
                function(error) {

                });
        }
    };

    HelloService.on('auth.login', function(auth) {
        //console.log("here");
        //console.log(auth.authResponse.screen_name);
        AccountsService.getData(auth.authResponse.screen_name).then(function(result) {
                //console.log(result);
                ////console.log(result.accounts[0].apps.wall.walls);
                $scope.screen_name = result.accounts[0].screen_name;
                if (!result.accounts[0].apps) {
                    result.accounts[0].apps = {
                        wall: {
                            walls: []
                        }
                    };
                }
                if (!result.accounts[0].apps.wall) {
                    result.accounts[0].apps.wall = {
                        walls: []
                    };
                }
                if (!result.accounts[0].apps.wall.walls) {
                    result.accounts[0].apps.wall.walls = [];
                }
                $scope.userData = result.accounts[0].apps;
                //$scope.userWalls = result.accounts[0].apps.wall.walls;
            },
            function(error) {

            });
    });

    HelloService.on('auth.logout', function(){
        //clear wall list
        $scope.userData = {};
    });



    init();

}

controllersModule.controller('WallCtrl', ['$scope', '$rootScope', '$window', 'AccountsService', 'HelloService', WallCtrl]);
