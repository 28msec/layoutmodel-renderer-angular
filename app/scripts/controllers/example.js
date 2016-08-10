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

	  $scope.headerclick = function(data) {
	  	if(!data.rowspan && data.colspan) {
	  		var index = 0;
	  		for(var i = 0; i < data.index; i++) {
				index += data.headerGroup[i].CellSpan;
			}
	  		data.rows.forEach(function(row) {
				for(var i = 0; i < data.colspan; i++) {
					var cell = row[index + i];
					if(!cell.properties) {
						cell.properties = { selected: true };
					} else {
						cell.properties.selected = !cell.properties.selected;
					}
				}
			});
		} else if (data.rowspan) {
			for(var i = 0; i < data.rowspan; i++) {
				data.rows[data.parentIndex + i].forEach(function(cell){
					if(!cell.properties) {
						cell.properties = { selected: true };
					} else {
						cell.properties.selected = !cell.properties.selected;
					}
				});
			}
		} else {
			data.rows.forEach(function(row){
				row.forEach(function(cell){
					if(!cell.properties) {
						cell.properties = { selected: true };
					} else {
						cell.properties.selected = !cell.properties.selected;
					}
				});
			});
		}
	  };
	  
	  $scope.test = function(cell)
	  {
	  	if(!cell.properties) {
		  cell.properties = { selected: true };
	  	} else {
		  cell.properties.selected = !cell.properties.selected;
	  	}
		console.log(JSON.stringify(cell, null, ''));
	  };
	  
	  $scope.$on("$locationChangeSuccess", function() {
		  var url = $location.search().url;
		  if (url !== $scope.modelurl) $scope.fetch(url);		
	  });
	  
	  if ($scope.modelurl && $scope.modelurl!=='') $scope.fetch($scope.modelurl);
	  	
  }]);