'use strict';
/* global angular */

var controllersModule = require('./_index');
var Leaflet = require('../components/leaflet');
var GeoJSON = require('../components/geojson');
var result;
var marker=[];
/**
 * @ngInject
 */

    controllersModule.controller('MapCtrl', ['$rootScope','$http', '$scope', 'HelloService', function($rootScope,$http, $scope, hello) {

        $scope.toggleDataSource = function(id) {
            console.log("FOOO");
            var indentifier = "#listItem" + id;
            angular.element(indentifier).toggleClass("active-feed");
        }
        
        var followerslayer = new L.LayerGroup();
        var followinglayer = new L.LayerGroup();
        var overlays = {
            "Followers" : followerslayer ,
            "Following" : followinglayer
        };

        
        var grayscale=L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'examples.map-20v6611k'
        });
        var basemapObj = {
            "First Basemap": grayscale

        }
        var map = L.map('map',{layers:[grayscale,followerslayer,followinglayer]}).setView([33.52, 76.34], 2);
        $rootScope.$watch(function() {
            return $rootScope.root.twitterSession;
            }, function(session) {
                if (session) {
                    plotFollowersonMap();
                    plotFollowingOnMap();
                }
            });

         
        
         L.control.layers(basemapObj,overlays).addTo(map);


        function plotFollowersonMap()
        {   
            //defining an object to store followers info
            var followers = {
                "location" : [],
                "name" : [],
                "id_str" : [],
                "propic" : []
            };

            //Marker array
            var followersMarker = {
                "type": "FeatureCollection",
                "features": []
            };
            console.log("twitter is "+$rootScope.root.twitterSession);
            
            //Calling the method to get Twitter followers
            hello('twitter').api('/me/followers', 'GET').then(function(twitterFollowers) {
            $rootScope.$apply(function() 
            {
                twitterFollowers.data.forEach(function(ele){
                    if(ele.location)
                    {
                        followers.location.push(ele.location);
                        followers.name.push(ele.name);
                        followers.id_str.push(ele.id_str);
                        followers.propic.push(ele.profile_image_url_https);
    
                    }
                });
                
                Geocode();
            });
            }, function() {
            console.log("Unable to get your followers");
            });

            //getting the LatLong 
            function Geocode()
            {
                
                var locarray = {
                    "places" : followers.location
                }
                
            $http.jsonp('http://loklak.org/api/geocode.json?callback=JSON_CALLBACK&minified=true', {params : { data : locarray } })
            .success(function(data, status, headers, config) {
                //console.log( followers.propic[i]);
                
                for(var i=0;i<followers.location.length;i++)
                {
                    
                    var locationkey=followers.location[i];
                    if(data.locations[locationkey].mark)
                    {
                    
                    var pointObject = {
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                data.locations[locationkey].mark[0],
                                data.locations[locationkey].mark[1]
                            ]
                        },
                        "type": "Feature",
                        "properties": {
                            "popupContent" : followers.name[i]+" is following you" ,
                            "propic" : followers.propic[i]

                        },
                        "id": followers.id_str[i]

                    };
                    followersMarker.features.push(pointObject);

                    }
                }
                   add_marker(followersMarker , 1);
                    
                
                }).error(function(data, status, headers, config) {
                    
                    console.log("There is error.Loklak Server did not respond with geodata.We will try again.");
                    Geocode();
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
            });
        }
    }  

        function plotFollowingOnMap()
        {
             
            //defining an object to store following info
            var following = {
                "location" : [],
                "name" : [],
                "id_str" : [],
                "propic" : []
            };

            //Marker array
            var followingMarker = {
                "type": "FeatureCollection",
                "features": []
            };
            
            //Calling the method to get Twitter followings
            hello('twitter').api('/me/following', 'GET').then(function(twitterfollowing) {
            $rootScope.$apply(function() 
            {
                twitterfollowing.data.forEach(function(ele){
                    if(ele.location)
                    {
                        following.location.push(ele.location);
                        following.name.push(ele.name);
                        following.id_str.push(ele.id_str);
                        following.propic.push(ele.profile_image_url_https)
                    }
                });
               
                Geocode_Plot();
            });
            }, function() {
            console.log("Unable to get your following");
            });

            //getting the LatLong 
            function Geocode_Plot()
            {
                
                var locarray = {
                    "places" : following.location
                }
                
            $http.jsonp('http://loklak.org/api/geocode.json?callback=JSON_CALLBACK&minified=true', {params : { data : locarray } })
            .success(function(data, status, headers, config) {
                
                for(var i=0;i<following.location.length;i++)
                {   
                    var locationkey=following.location[i];
                    if(data.locations[locationkey].mark)
                    {
                    //var locationkey=following.location[i];
                    
                    var pointObject = {
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                data.locations[locationkey].mark[0],
                                data.locations[locationkey].mark[1]
                            ]
                        },
                        "type": "Feature",
                        "properties": {
                            "popupContent": "You follow " + following.name[i],
                            "propic" : following.propic[i]
                        },
                        "id": following.id_str[i]
                    };
                    followingMarker.features.push(pointObject);
                }

                }
                   add_marker(followingMarker , 0);
                   
                
                }).error(function(data, status, headers, config) {
                    
                    console.log("There is error.Loklak Server did not respond with geodata.We will try again.");
                    Geocode_Plot();
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
            });
        }
        }    

         
        

      function add_marker(result , followerbool) {
                    
                    
                    var i;
                    for (i = 0; i < result.features.length; i++) {
                        //console.log(result.features[i].propic-url);
                        var tweetIcon = L.icon({
                        iconUrl: result.features[i].properties.propic ,
                    });
                        var lat = result.features[i].geometry.coordinates[1];
                        var lng = result.features[i].geometry.coordinates[0];
                        marker[i] = new L.Marker([lat, lng], {
                            id: i,
                            icon: tweetIcon
                        });
                        if(followerbool)
                        {
                          marker[i].addTo(followerslayer);  
                        }
                        else
                        {
                            marker[i].addTo(followinglayer);
                        }
                        
                        var popup = L.popup({
                            autoPan: false
                        }).setContent(result.features[i].properties.popupContent);
                        marker[i].bindPopup(popup);
                    };
                    
                }

}]);

