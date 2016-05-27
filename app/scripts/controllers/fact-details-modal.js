'use strict';

angular
    .module('exampleApp')
    .controller('FactDetailsCtrl', function(_, $scope, $templateCache, $compile, $uibModalInstance, fact){
        if(_.isArray(fact)) {
            fact = fact[0];
        }
        $scope.fact = angular.copy(fact); // make a copy to be able to cancel
        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.updateCallback = function(){
            $uibModalInstance.close('update');
        };

    })
    .directive('factDetails', function(_){
        return {
            restrict: 'E',
            scope: {
                'fact': '='
            },
            templateUrl: '/views/fact-details.html',
            link: function ($scope) {

                if(_.isObject($scope.fact)) {
                    $scope.isValidation = $scope.fact['xbrl28:Type'] === 'xbrl28:validation';
                    $scope.auditTrails = $scope.fact.AuditTrails;

                    $scope.keyAspects = [];
                    $scope.nonKeyAspects = [];
                    var keyAspects = angular.copy($scope.fact.KeyAspects);

                    //    keyAspects.push('dei:LegalEntityAxis');

                    _.each($scope.fact.Aspects, function (value, aspect) {
                        var aspectObject = {
                            name: aspect,
                            value: $scope.fact.Aspects[aspect]
                        };
                        if (_.contains(keyAspects, aspect)) {
                            $scope.keyAspects.push(aspectObject);
                        } else {
                            $scope.nonKeyAspects.push(aspectObject);
                        }
                    });

                    $scope.computationAuditTrails = [];
                    $scope.validationAuditTrails = [];
                    var excludes = [
                        'xbrl28:provenance'
                    ];
                    var auditTrails = _.filter($scope.fact.AuditTrails,
                        function(auditTrail){
                            return !_.contains(excludes,auditTrail.Type);
                        });
                    _.each(auditTrails, function(trail){
                        if(trail.Type === 'xbrl28:validation-stamp'){
                            $scope.validationAuditTrails.push(trail);
                        } else {
                            $scope.computationAuditTrails.push(trail);
                        }
                    });
                    $scope.isStampedFact = $scope.validationAuditTrails.length > 0;
                    $scope.isValidationFact = $scope.fact['xbrl28:Type'] === 'xbrl28:validation';
                }
            }
        };
    })
;
