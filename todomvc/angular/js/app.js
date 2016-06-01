
(function () {
    'use strict';
    
    /**
     * The main TodoMVC app module.
     * 
     * @type {angular.Module}
     */
    angular.module('todomvc', ['todoCtrl', 'todoViewModel'])
        .config(function($routerProvider) {
            var routeConfig = {
                controller: 'TodoCtrl',
                templateUrl: 'todomvc-index.html',
                resolve: {
                    store: function(todoStorage) {
                        return todoStorage.then(function(module) {
                           module.get();
                           return module; 
                        });
                    }
                }
            };
            
            $routerProvider
                .when('/', routeConfig)
                .when('/:status', routeConfig)
                .otherwise({
                    redirectTo: '/'
                });
        });
})();