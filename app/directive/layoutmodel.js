'use strict';

/* global accounting : false */

angular.module('layoutmodel', [ 'lodash', 'ui.bootstrap' ])
    .filter('displaySuperColumnHeader', function() { // register new filter
        return function(input, index) { // filter arguments
            return index === 0 ? input : undefined;
        };
    })
    .directive('layoutmodel', function(LayoutModelTpl, FactDetailTpl) {
        return {
            restrict: 'E',
            template: LayoutModelTpl,
            scope: {
                layoutModel: '=model',
                dataTemplateUrl: '=data',
                headerTemplateUrl: '=header',
                checks: '=',
                labelidx: '=',
                dataclick: '&',
                headerclick: '&'
            },
            controller: function ($scope, $element, $uibModal, $sce) {
                var check = $sce.trustAsHtml('<i class="fa fa-check boolean-true"></i>');
                var cross = $sce.trustAsHtml('<i class="fa fa-times boolean-false"></i>');

                var scope = $scope;
                scope.$scope = $scope.$parent;
                scope.lw = 0;

                // Helper function to format content
                scope.showValue = function(fact) {
                    /*jshint eqnull:true */
                    if (!fact) { return ''; }
                    if (fact.length) { return scope.showValue(fact[0]); }
                    if (fact.Value == null) { return ''; }
                    if (fact.Value === true) { return check; }
                    if (fact.Value === false) { return cross; }
                    if (fact.Type !== 'NumericValue') { return $sce.trustAsHtml(''+fact.Value); }
                    var decimals = fact.Decimals > 0 ? fact.Decimals : 0;
                    if(fact.Metadata && fact.Metadata[fact.Aspects["xbrl:Concept"]].DataType === "num:percentItemType") {
                        return $sce.trustAsHtml(accounting.formatNumber(fact.Value, 2, ",") + "%");
                    }
                    return $sce.trustAsHtml(accounting.formatNumber(fact.Value, decimals, ","));
                };


                /* CSS Class definitions */
                scope.colHeaderClasses = function(header) {
                    var classes = _.keys(header.CellConstraints).length?'lightBlueBold':'darkBlueBold';
                    classes += header.RollUp ? ' xrollup' : '';
                    return classes;
                };

                // if row headers span more than 1 col
                scope.rowColHeaderClasses = function(header) {
                    if(header) {
                        return (header.RollUp ? 'yrollup' : '') +
                            (header.IsAbstract ? ' abstract' : '') +
                            (header.Depth ? ' depth' + header.Depth : '') +
                            (header.IsRollUp ? ' isrollup' : '');
                    } else {
                        return '';
                    }
                };

                scope.headerColSpan = function(headerGroup, pos) {
                    var i = 1; // start with the next header
                    var allFollowingColumnsRollUp = true;
                    while(pos+i<headerGroup.length && allFollowingColumnsRollUp){
                        var header = headerGroup[pos+i];
                        if(!header || header.RollUp !== true){
                            allFollowingColumnsRollUp = false;
                        } else {
                            i++;
                        }
                    }
                    return i;
                };

                scope.classes = function(data) {
                    /*jshint eqnull:true */
                    // var add = header.IsRollUp ? ' yrollupdata' : '';
                    // add += (header.Depth >= 3 && header.IsRollUp) ? ' subyrollupdata' : '';
                    var add = '';
                    if (_.isObject(data)) {
                        if (data.length > 0) {
                            return data[0].Type + add+ ' multiplefacts';
                        }
                        if (data.Value != null) {
                            return data.Type + add;
                        }
                        if(_.isObject(data.properties)) {
                            add += Object.keys(data.properties).filter(function(property){ return data.properties[property] === true; }).join(' ');
                        }
                    } else {
                        add += ' null';
                    }
                    return add;
                };
                /* End of CSS class definitions */

                scope.hasConstraints = function() {
                    return scope.layoutModel && scope.layoutModel.GlobalConstraintLabels && Object.keys(scope.layoutModel.GlobalConstraintLabels).length > 0;
                };

                scope.showMoreLink = function(fact) {
                    return fact && (fact.length || (fact.Value && fact.Value.indexOf && fact.Value.indexOf('<') >= 0));
                };

                scope.showDetails = function($event, fact) {
                    $event.stopPropagation();
                    $uibModal.open({
                        template : FactDetailTpl,
                        controller : 'FactDetailCtrl',
                        scope : $scope,
                        resolve : { fact : function () { return fact; } }
                    });
                    return false;
                };

                scope.dataTemplate = scope.dataTemplateUrl || 'defaultData.html';
                scope.headerTemplate = scope.headerTemplateUrl || 'defaultHeader.html';

                scope.getConstraintLabel = function(pair,index) {
                    var value = _.toPairs(pair)[0][index];
                    var label = _.get(scope.constraintLabels,value,value);
                    return _.isArray(label) ? label.join(', '): label;
                };
                scope.superHeader = function() {
                    try {
                        return scope.yHeaders[0][0].CellLabels[0];
                    } catch(e) {
                        return '';
                    }
                };
                scope.bodyHeaders = function(facts, factsIdx) {
                    return  _(scope.yHeaders)
                        .filter(function(d,ii) { return ii>0; })
                        .map(function(groupCells) {
                            return _.filter(groupCells, function(cell, groupCellIndex) {
                                var sum = _(groupCells)
                                    .filter(function(c,ii) { return ii<groupCellIndex; } )
                                    .map(function(c) { return c.CellSpan || 1; })
                                    .sum();
                                return (factsIdx===0 && sum===0) || (factsIdx>0 && factsIdx===sum);
                            });
                        })
                        .flatten()
                        .value();
                };


                scope.$watch(function() { return scope.layoutModel; }, function() {
                    // Data not yet available?
                    if (!scope.layoutModel) {
                        scope.data = [];
                        return;
                    }

                    // Check if this component may be used to render the table
                    if (scope.layoutModel.ModelKind !== 'LayoutModel' || !scope.layoutModel.TableSet) { throw new Error('layoutmodel: "model" parameter does not contain a layout model!'); }
                    if (scope.layoutModel.TableSet.length <= 0) { throw new Error('layoutmodel: No table at index 0 in TableSet'); }

                    scope.header = scope.layoutModel.ComponentAndHypercubeInformation;
                    scope.constraints = scope.layoutModel.GlobalConstraints;
                    scope.constraintLabels = scope.layoutModel.GlobalConstraintLabels;

                    scope.table = scope.layoutModel.TableSet[0];
                    scope.data = scope.table.TableCells.Facts;
                    scope.xHeaders = _(scope.table.TableHeaders.x)
                        .map(function(x) { return x.GroupCells; })
                        .flatten()
                        .value();

                    scope.yHeaders = _(scope.table.TableHeaders.y)
                        .map(function(x) { return x.GroupCells; })
                        .flatten()
                        .value();
                    scope.headerColspan = (scope.yHeaders.length-1) || 1;
                    scope.dataColspan = scope.table.TableCells.Facts.length > 0 ? scope.table.TableCells.Facts[0].length : 0;

                    if (!scope.table.TableCells || !scope.table.TableCells.Facts) { throw new Error('layoutmodel: model does not contain facts.'); }
                    if (scope.table.TableHeaders.z) { console.error('layoutmodel: Z-Axis not supported.'); }
                    var ao = scope.table.TableCells.AxisOrder;
                    if (!ao || ao.length!==2 || ao[0] !== 'y' || ao[1] !== 'x') { throw new Error('layoutmodel: table cells must be in y, x axis order.'); }
                });

            }
        };
    })
    .controller('FactDetailCtrl', function($scope, $uibModalInstance, fact) {
        $scope.facts = fact.length ? fact : [ fact ];
        $scope.ok = function() {
            $uibModalInstance.close();
        };
    });
