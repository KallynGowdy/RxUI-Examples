(function() {
    'use strict';
    
    angular.module('todoViewModel', [])
    
    /**
     * Defines a factory that creates new TodoViewModels.
     * The factory creates new view models in an angular inspecific way so as to encourage code to
     * be put in the core library. As such, this factory does not have any dependencies.
     */
    .factory('todoViewModel', function TodoViewModel() {
        var storage = new RxUIExampleCore.LocalTodoStorage();
        return new RxUIExampleCore.TodoViewModel(storage);
    });
})();