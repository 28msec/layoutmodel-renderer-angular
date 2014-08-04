'use strict';

/* global accounting : false */

angular.module('layoutmodel', [])  
  .directive('layoutmodel', [ 'LayoutModelTpl' , function(LayoutModelTpl) {
    return {
      restrict: 'E',
      template: LayoutModelTpl,
      scope: {
         layoutModel: '=model',
         headers: '=headers',
         'class' : '@',
         tableSet: '=table',
         dataTemplateUrl: '=data',
         headerTemplateUrl: '=header',
         titleTemplateUrl: '=title',
         constraints: '=',
         checks: '=',
         labelidx: '=',
         dataclick: '&',
         headerclick: '&' 
      },    
      controller: function ($scope, $element, $sce) {    	  
    	  var check = $sce.trustAsHtml('<i class="fa fa-check boolean-true"></i>');
    	  var cross = $sce.trustAsHtml('<i class="fa fa-times boolean-false"></i>');
    	  
    	  var scope = $scope;
    	  scope.$scope = $scope.$parent;
    	  scope.lw = 0;
    	  
    	  // Helper function to format content
    	  scope.showValue = function(fact) {
    		    /*jshint eqnull:true */
    			 if (!fact || fact.Value == null) { return ''; }
    			 if (fact.Value === true) { return check; }
    			 if (fact.Value === false) { return cross; }
        		 if (fact.Type !== 'NumericValue') { return $sce.trustAsHtml(''+fact.Value); }
        		 if (fact.Type === 'NumericValue' && fact.Decimals > 0) { return $sce.trustAsHtml(''+accounting.formatNumber(fact.Value, fact.Decimals)); }
        		 return $sce.trustAsHtml(''+accounting.formatNumber(fact.Value));        	     
    	  };
    	  
    	  scope.classes = function(data, header) {
    		 /*jshint eqnull:true */
    		 return ((data && data.Value != null) ? data.Type : 'null') + ( (header.IsRollUp) ? ' yrollupdata' : '');    		 
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
          for (hd in scope.table.TableHeaders.y) {
        	  for (grp in scope.table.TableHeaders.y[hd].GroupCells) {        		        		 
        		  idx = 0;
        		  for (var cell in scope.table.TableHeaders.y[hd].GroupCells[grp])
        		  {
        			 var c = scope.table.TableHeaders.y[hd].GroupCells[grp][cell];
        			 
        			  if (scope.innerTitle === null && cell===0 && hd===0 && grp===0 && scope.table.TableHeaders.y.length===1 && scope.table.TableHeaders.y[hd].GroupCells.length===1) {        				 
        				  var empty = true;
        				  for (var d in scope.data[0]) 
        				  {
        				     if (scope.data[0][d] !== null) { empty = false; }
        				  }
        				  if (empty) {
            			    scope.innerTitle = c;
            			    scope.data.shift();
            			    continue;
        				  }
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
  }]);

