'use strict';

angular.module('exampleApp', [ 
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'layoutmodel'
])
  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        templateUrl: '/views/example.html',
        controller: 'ExampleCtrl'
      })      
      .otherwise({
        redirectTo: '/'
      });
  }]);
