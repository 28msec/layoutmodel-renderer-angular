'use strict';

angular.module('exampleApp')
  .controller('ExampleCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {	 
	  $scope.mymodel = null;
	  $scope.myheaders = null;
	  $scope.modelurl = $location.search().url;
	  $scope.labelidx = 0;
	  $scope.constraints = true;
	  $scope.checks = true;
	  $scope.truncate = false;
	  
	  $scope.css = "preview-style";
	  $scope.loading = false;
	  		  
	  $scope.fetch = function(url)
	  {		  
		$scope.modelurl = url;
		$location.search('url', url);
		if (url) {
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
		} else {
			$scope.mymodel = $scope.myheaders = null;
			$scope.modelurl = '';
		}
	  };
	  
	  $scope.test = function(data)
	  {
		alert(JSON.stringify(data,null," "));  
	  };
	  
	  $scope.$on("$locationChangeSuccess", function() {
		  var url = $location.search().url;
		  if (url !== $scope.modelurl) $scope.fetch(url);		
	  });
	  
	  if ($scope.modelurl && $scope.modelurl!=='') $scope.fetch($scope.modelurl);
	  	
  }]);