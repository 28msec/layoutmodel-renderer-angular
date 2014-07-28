'use strict';

angular.module('exampleApp')
  .controller('ExampleCtrl', ['$scope', '$http', function ($scope, $http) {
	  $scope.mymodel = null;
	  $scope.myheaders = null;
	  $scope.modelurl = "";
	  $scope.labelidx = 0;
	  $scope.constraints = true;
	  $scope.checks = true;
	  $scope.truncate = false;
	  
	  $scope.css = "plain-style";
	  $scope.loading = false;
	  		  
	  $scope.fetch = function(url)
	  {
		$scope.modelurl = url;
		$scope.loading = true;
		$http.get(url)
		.success(function (data) { 
			$scope.mymodel = data;
			$scope.myheaders = [ { label : "Report", value : data.TableSetLabels[0] }]
			$scope.loading = false; 
		})
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