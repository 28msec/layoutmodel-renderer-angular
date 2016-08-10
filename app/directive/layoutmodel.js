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
                tableSet: '=table',
                dataTemplateUrl: '=data',
                headerTemplateUrl: '=header',
                constraints: '=',
                truncate: '=',
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
                    add += (header.Depth >= 3 && header.IsRollUp) ? ' subyrollupdata' : '';
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

                var isDomainHeader = function(header) {
                    var labelMatches = _.filter(header.CellLabels, function(label){
                        return _.isString(label) && label.indexOf('Domain') > -1;
                    });
                    var constraintMatches = _.filter(_.values(header.CellConstraints), function(constraints){
                        return _.filter(_.values(constraints), function(constraintVal){
                            return _.isString(constraintVal) && constraintVal.indexOf('Domain') > -1;
                        }).length > 0;
                    });
                    return labelMatches.length > 0 || constraintMatches.length > 0 ||
                        (header.CellLabels.length === 0 && header.RollUp === true);
                };

                scope.colHeaderClasses = function(header) {
                    var constraints = _.isObject(header.CellConstraints) ? _.keys(header.CellConstraints) : [];
                    var isNotEmpty = scope.isVisible(header);
                    var classes = header.RollUp ? 'xrollup' : '';
                    if(isDomainHeader(header)){
                        classes += ' domain-header';
                    } else if (constraints.length > 0 || !isNotEmpty){
                        classes += ' member-header';
                    } else {
                        classes += ' dimension-header';
                    }
                    return classes;
                };

                scope.rowHeaderClasses = function(header, first) {
                    return (first ? ' first-row-header-row' : '');
                };

                // if row headers span more than 1 col
                scope.rowColHeaderClasses = function(header, first) {
                    return (header.RollUp ? 'yrollup' : '') +
                        (header.IsAbstract ? ' abstract' : '') +
                        (header.Depth ? ' depth' + header.Depth : '') +
                        (header.IsRollUp ? ' isrollup' : '') +
                        (first ? ' first-row-header-col' : '');

                };

                scope.headerColSpan = function(headerGroup, pos) {
                    var i = 1; // start with the next header
                    var allFollowingColumnsRollUp = true;
                    while(pos+i<headerGroup.length && allFollowingColumnsRollUp){
                        var header = headerGroup[pos+i];
                        if(header.RollUp !== true){
                            allFollowingColumnsRollUp = false;
                        } else {
                            i++;
                        }
                    }
                    return i;
                };

                scope.isVisible = function(header) {
                    return !_.isUndefined(header.CellLabels) && header.CellLabels.length > 0;
                };

                scope.hasConstraints = function() {
                    return scope.layoutModel && scope.layoutModel.GlobalConstraintLabels && Object.keys(scope.layoutModel.GlobalConstraintLabels).length > 0;
                };

                scope.showMoreLink = function(fact) {
                    return fact && (fact.length || (scope.truncate && fact.Value && fact.Value.indexOf && fact.Value.indexOf('<') >= 0));
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
                    if(_.isArray(result)) {
                        return result.join(', ');
                    } else {
                        return result;
                    }
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
                    if (scope.table.TableHeaders.z) { console.error('layoutmodel: Z-Axis not supported.'); }

                    var ao = scope.table.TableCells.AxisOrder;
                    if (!ao || ao.length!==2 || ao[0] !== 'y' || ao[1] !== 'x') { throw new Error('layoutmodel: table cells must be in y, x axis order.'); }

                    scope.yHeaderGroups = [];
                    scope.ySuperHeaders = []; // y super headers will be put in the top left corner
                    scope.xHeaderGroups = [];
                    scope.data = scope.table.TableCells.Facts;

                    var rows = 0;

                    // count the max rows
                    _.each(scope.table.TableHeaders.y, function(y){
                        _.each(y.GroupCells, function(groupCells){
                            // calculate total rows for all row header column
                            var span = _.reduce(groupCells, function(total, cell){
                                return total + (cell.CellSpan || 1);
                            }, 0);
                            if(span > rows){
                                rows = span;
                            }
                        });
                    });

                    // Build columns in required order
                    _.each(scope.table.TableHeaders.x, function(x){
                        _.each(x.GroupCells, function(grp){
                            scope.xHeaderGroups.push(grp);
                        });
                    });

                    // build rows in required order
                    var allHeaderGroupCells = [];
                    _.each(scope.table.TableHeaders.y, function(y) {
                        _.each(y.GroupCells, function(grp) {
                            allHeaderGroupCells.push(grp);
                        });
                    });

                    // a supergroup is a group of columns under a superheader
                    // a superheader spans all rows and can therefore be moved
                    // in the top left corner
                    var groupIdx = 0;
                    var superGroups = _.groupBy(allHeaderGroupCells, function(grp){
                        if(grp[0].CellSpan === rows){
                            grp[0].IsSuperHeader = true;
                            groupIdx++;
                        }
                        return groupIdx;
                    });

                    // if all headers are supergroups, nothing is displayed
                    // for this reason we need to do this fix:
                    superGroups = _.values(superGroups);
                    if(superGroups.length === allHeaderGroupCells.length){
                        superGroups = [ _.flatten(superGroups) ];
                    }
                    
                    _.each(superGroups, function(superColumns){
                        _.each(superColumns, function(col, i){
                            var rowIdx = 0;
                            _.each(col, function(cell, j){

                                // if the first cell in the first col of a
                                // superColumns group is a superheader we move
                                // it up in the super header top left corner
                                if(i === 0 && j === 0 && cell.IsSuperHeader === true){
                                    scope.ySuperHeaders.push({
                                        Label: cell.CellLabels[0],
                                        ColSpan: superColumns.length -1
                                    });
                                } else {

                                    // if the first cell in the first col of a
                                    // superColumns group is not a superheader
                                    // then we need to add a placeholder
                                    if(i === 0 && j === 0 && cell.IsSuperHeader !== true){
                                        scope.ySuperHeaders.push({
                                            Label: '',
                                            ColSpan: superColumns.length -1
                                        });
                                    }

                                    // add row
                                    if(scope.yHeaderGroups.length <= rowIdx)
                                    {
                                        scope.yHeaderGroups.push([]);
                                    }
                                    
                                    if(_.isEmpty(cell.CellLabels)) {
                                        cell.CellLabels.push('');
                                        cell.RollUp = false;
                                    }
                                    
                                    scope.yHeaderGroups[rowIdx].push(cell);
                                    rowIdx += (cell.CellSpan || 1);
                                    // fill up with empty rows cols if cellspan > 1
                                    while (scope.yHeaderGroups.length < rowIdx)
                                    {
                                        scope.yHeaderGroups.push([{ CellLabels: [] }]);
                                    }
                                }
                            });
                        });
                    });
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
