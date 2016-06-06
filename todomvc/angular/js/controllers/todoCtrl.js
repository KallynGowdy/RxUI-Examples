(function () {
    'use strict';

    angular.module('todoCtrl', ['todoViewModel'])

        /**
         * The main controller for the app. 
         * In a traditional MVVM senario, this corresponds to the code-behind our view. 
         * As such, the entire purpose for this controller is to handle UI events and pipe them to the view model.  
         */
        .controller('TodoCtrl', function TodoCtrl($scope, $routeParams, todoViewModel) {
            var _this = this;
            this.__viewBindingHelper = {
                observeProp: function (obj, property, emitCurrentVal, callback) {
                    if (emitCurrentVal) {
                        callback(new RxUI.PropertyChangedEventArgs(obj, obj[property], newValue));
                    }
                    return $scope.$watch(function () {
                        return obj[property];
                    }, function (newValue, oldValue) {
                        callback(new RxUI.PropertyChangedEventArgs(obj, property, newValue));
                    });
                }
            };

            $scope.$on('$routeChangeSuccess', function () {
                if ($routeParams.status === 'completed')
                    _this.status = 'complete';
                else if ($routeParams.status === 'active')
                    _this.status = 'incomplete';
                else {
                    _this.status = 'all';
                }
            });

            this.addTodo = function () {
                todoViewModel.addTodo.invokeAsync().subscribe();
            };

            this.editTodo = function (todo) {
                todoViewModel.editTodo.invokeAsync(todo).subscribe();
            };

            this.saveEdits = function (todo, index) {
                todoViewModel.finishEditing.invokeAsync().subscribe();
            };

            this.revertEdits = function (todo, event) {
                todoViewModel.undo.invokeAsync().subscribe();
            };

            this.removeTodo = function (todo) {
                todoViewModel.deleteTodo.invokeAsync(todo).subscribe();
            };

            this.toggleCompleted = function (todo) {
                todoViewModel.toggleTodo.invokeAsync(todo).subscribe();
            };

            this.clearCompletedTodos = function () {
                todoViewModel.clearComplete.invokeAsync().subscribe();
            };

            this.markAll = function () {
                todoViewModel.toggleAllComplete.invokeAsync().subscribe();
            };

            var d = [
                todoViewModel.bind(this, "newTodo.title", "newTodo"),
                todoViewModel.bind(this, "status", "status"),
                todoViewModel.oneWayBind(this, "incompleteTodos", "remaining"),
                todoViewModel.oneWayBind(this, "editedTodo", "editedTodo"),
                todoViewModel.oneWayBind(this, "visibleTodos", "todos"),
                todoViewModel.oneWayBind(this, "todos", "totalTodos"),
                RxUI.ReactiveObject.bindObservable(
                    todoViewModel.areAllTodosComplete,
                    this,
                    "allChecked"),
                todoViewModel.loadTodos.invokeAsync().subscribe()
            ];
            
            $scope.$on("$destroy", function() {
               d.forEach(function(sub) {
                   sub.unsubscribe();
               });
            });
        });
})();