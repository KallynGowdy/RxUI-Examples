
(function () {
    'use strict';
    
    /**
     * The main TodoMVC app module.
     * 
     * @type {angular.Module}
     */
    angular.module('todomvc', ['ngRoute', 'ngResource', 'todoCtrl', 'todoViewModel'])
        .config(function($routeProvider) {
            var routeConfig = {
                controller: 'TodoCtrl as ctrl',
                templateUrl: '/todomvc-index.html'
            };
            
            $routeProvider
                .when('/', routeConfig)
                .when('/:status', routeConfig)
                .otherwise({
                    redirectTo: '/'
                });
        });
})();