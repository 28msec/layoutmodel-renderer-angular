'use strict';

angular.module('lodash', [])
    .factory('_', function() {
      return window._;
    });
