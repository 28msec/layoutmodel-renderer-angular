'use strict';

/* global accounting : false */

angular.module('layoutmodel', [ 'ui.bootstrap' ])  
  .directive('layoutmodel', [ 'LayoutModelTpl', 'FactDetailTpl' , function(LayoutModelTpl, FactDetailTpl) {
    return {
      restrict: 'E',
      template: LayoutModelTpl,
      scope: {
         layoutModel: '=model',         
         tableSet: '=table',
         dataTemplateUrl: '=data',
         headerTemplateUrl: '=header',
         titleTemplateUrl: '=title',
         constraints: '=',
         truncate: '=',
         checks: '=',
         labelidx: '=',
         dataclick: '&',
         headerclick: '&' 
      },    
      controller: function ($scope, $element, $modal, $sce) {    	  
    	  var check = $sce.trustAsHtml('<i class="fa fa-check boolean-true"></i>');
    	  var cross = $sce.trustAsHtml('<i class="fa fa-times boolean-false"></i>');
    	  
    	  var scope = $scope;
    	  scope.$scope = $scope.$parent;
    	  scope.lw = 0;
    	  
    	  // Helper function to format content
    	  scope.showValue = function(fact, alwaysfull) {
    		    /*jshint eqnull:true */    		     
    			 if (!fact) { return ''; }
    			 if (fact.length) { return scope.showValue(fact[0]); }
    			 if (fact.Value == null) { return ''; }
    			 if (fact.Value === true) { return check; }
    			 if (fact.Value === false) { return cross; }
    			 if (scope.truncate && !alwaysfull && fact.Value && fact.Value.indexOf && fact.Value.indexOf('<') >= 0) {
        			 return $sce.trustAsHtml('<span class="ellipsis">'+fact.Value.replace(/<(?:.|\n)*?>/gm, '')+'</span>');    			      			 
        		  }
        		 if (fact.Type !== 'NumericValue') { return $sce.trustAsHtml(''+fact.Value); }
        		 var decimals = fact.Decimals > 0 ? fact.Decimals : 0;
        		 return $sce.trustAsHtml(accounting.formatNumber(fact.Value, decimals));
    	  };
    	      	      	  
    	  scope.classes = function(data, header) {
    		 /*jshint eqnull:true */
    		 var add = header.IsRollUp ? ' yrollupdata' : '';
    		 if (data) {
    			if (data.length > 0) { 
    				return data[0].Type + add+ ' multiplefacts'; 
    			}
    			if (data.Value != null) { 
    				return data.Type + add; 
    			}    			
    		 }
    		 return 'null '+add;    		     		
    	  };   
    	  
    	  scope.headerclasses = function(header, first) {
    		 return (header.RollUp ? 'yrollup' : '') +
    		        (header.IsAbstract ? ' abstract' : '') +
    		        (header.Depth ? ' depth' + header.Depth : '') +
    		        (header.IsRollUp ? ' isrollup' : '') +
    		        (first ? ' first-row-header-row' : '');
    		       
    	  };
    	      	 
     	  scope.hasConstraints = function() {
     		 return scope.layoutModel && scope.layoutModel.GlobalConstraintLabels && Object.keys(scope.layoutModel.GlobalConstraintLabels).length > 0;  
     	  };
     	  
     	  scope.showMoreLink = function(fact) {
     		return fact && (fact.length || (scope.truncate && fact.Value && fact.Value.indexOf && fact.Value.indexOf('<') >= 0)); 
     	  };
     	  
     	  scope.showDetails = function($event, fact) {
     		 $event.stopPropagation();
     		 $modal.open({
          		template : FactDetailTpl,
          		controller : 'FactDetailCtrl',
          		scope : $scope,
          		resolve : { fact : function () { return fact; } }
           	 });
     		 return false;
     	  };  
     	  
     	  scope.tableClass = function() {
     		  return scope.truncate ? 'truncate' : '';
     	  };
     	  
     	  scope.getConstraintValue = function(constraint) {
     		  var result;
     		  angular.forEach(constraint, function(value,key) {
     			 if (key !== '$$hashKey' && constraint.hasOwnProperty(key)) {     			
     			    var label = scope.layoutModel.GlobalConstraintLabels[value];
     	     		result = label ? label : value;
     			 }
     		  });     		
     		  return result;     		
     	  };
     	  
     	  scope.getConstraintLabel = function(constraint) {
     		 var result;
     		 angular.forEach(constraint, function(value,key) {
     		    if (key !== '$$hashKey' && constraint.hasOwnProperty(key)) {
     			   var label = scope.layoutModel.GlobalConstraintLabels[key];
     	     	   result = label ? label : key;
     			}
     		 });     		
     		 return result;
     	  };
     	      	       	     	       	     	       	    	      	      	    
    	  scope.dataTemplate = scope.dataTemplateUrl || 'defaultData.html';
    	  scope.headerTemplate = scope.headerTemplateUrl || 'defaultHeader.html';
    	  scope.titleTemplate = scope.titleTemplateUrl || 'defaultTitle.html';    	  
    	      	  
    	  var tableIndex = scope.tableSet || 0;
    	  
    	  scope.$watch(function() { return scope.layoutModel; }, function() {
    	      	  
    	  // Data not yet available?
    	  if (!scope.layoutModel) {
    		  scope.table = [];
    		  scope.yHeaderGroups = [];
              scope.xHeaderGroups = [];
              scope.data = [];
              return;
    	  }
    	      	  
    	  
    	// Check if this component may be used to render the table    	      	     	  
    	  if (scope.layoutModel.ModelKind !== 'LayoutModel' || !scope.layoutModel.TableSet) { throw new Error('layoutmodel: "model" parameter does not contain a layout model!'); }
    	      	  
    	  if (scope.layoutModel.TableSet.length <= tableIndex) { throw new Error('layoutmodel: No table '+tableIndex+' in TableSet'); }
          scope.table = scope.layoutModel.TableSet[tableIndex];
          if (!scope.table.TableCells || !scope.table.TableCells.Facts) { throw new Error('layoutmodel: model does not contain facts.'); }                    
          if (scope.table.TableHeaders.z) { throw new Error('layoutmodel: Z-Axis not supported.'); }
          
          var ao = scope.table.TableCells.AxisOrder;
          if (!ao || ao.length!==2 || ao[0] !== 'y' || ao[1] !== 'x') { throw new Error('layoutmodel: table cells must be in y, x axis order.'); }
          
          scope.yHeaderGroups = [];
          scope.xHeaderGroups = [];
          scope.data = scope.table.TableCells.Facts;          
          scope.innerTitle = null;

          var hd, grp;
          // Build header rows and columns in required order
          for (hd in scope.table.TableHeaders.x) {
        	  for (grp in scope.table.TableHeaders.x[hd].GroupCells) {
        		  scope.xHeaderGroups.push(scope.table.TableHeaders.x[hd].GroupCells[grp]);
        	  }
          }
          
          var idx = 0;
          var title = true;
          for (hd in scope.table.TableHeaders.y) {
        	  for (grp in scope.table.TableHeaders.y[hd].GroupCells) {        		        		 
        		  idx = 0;
        		  for (var cell in scope.table.TableHeaders.y[hd].GroupCells[grp])
        		  {
        			 var c = scope.table.TableHeaders.y[hd].GroupCells[grp][cell];
        			 
        			 if (title) {
        				  title = false;
        			      scope.innerTitle = c;	 
        			      continue;
        			 } 	         			 
	        		
        			 while (scope.yHeaderGroups.length <= idx) { scope.yHeaderGroups.push([]); }
	        		 scope.yHeaderGroups[idx].push(c);
	        		 idx += (c.CellSpan || 1);
        			 
        		  }
        		  
        	  }
          }
                    
	     });
        		            
      }
    };
  }])
  .controller('FactDetailCtrl', [ '$scope', '$modalInstance', 'fact' , function($scope, $modalInstance, fact) {
	  $scope.facts = fact.length ? fact : [ fact ];	  
	  $scope.ok = function() { 
		  $modalInstance.close(); 
	  };	  
  }])
  ;

