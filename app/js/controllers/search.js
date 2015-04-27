'use strict';

var controllersModule = require('./_index');

/**
 * @ngInject
 */
function SearchCtrl($http) {
  var vm = this;

  vm.update = function(term) {
  	$http.jsonp('http://localhost:9100/api/search.json?callback=JSON_CALLBACK', {
      params: {q: term}
    }).success(function(data) {
 			vm.statuses = data.statuses;
  	}).error(function(data) {
    	console.log(data);
  	});
  };
}

controllersModule.controller('SearchCtrl', SearchCtrl);