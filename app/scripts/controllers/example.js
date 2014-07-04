'use strict';

angular.module('exampleApp')
  .controller('ExampleCtrl', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
	  $scope.mymodel = null;
	  $scope.modelurl = $routeParams.url;
	  $scope.labelidx = 0;
	  $scope.constraints = true;
	  $scope.checks = true;
	  
	  $scope.css = "plain-style";
	  $scope.loading = false;
	  		  
	  $scope.fetch = function(url)
	  {
		$scope.modelurl = url;
		$scope.loading = true;
		$http.get(url)
		.success(function (data) { $scope.mymodel = data; $scope.loading = false; })
		.error(function(data,status) { 
			$scope.mymodel = null; 
			$scope.loading = false;
			alert("Error loading document! Status code:"+status); 
		});
	  };
	  
	  $scope.test = function(data)
	  {
		alert(JSON.stringify(data,null," "));  
	  };
	  	
  }]);