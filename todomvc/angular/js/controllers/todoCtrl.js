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
                todoViewModel.addTodo.invoke().subscribe();
            };

            this.editTodo = function (todo) {
                todoViewModel.editTodo.invoke(todo).subscribe();
            };

            this.saveEdits = function (todo, index) {
                todoViewModel.finishEditing.invoke().subscribe();
            };

            this.revertEdits = function (todo, event) {
                todoViewModel.undo.invoke().subscribe();
            };

            this.removeTodo = function (todo) {
                todoViewModel.deleteTodo.invoke(todo).subscribe();
            };

            this.toggleCompleted = function (todo) {
                todoViewModel.toggleTodo.invoke(todo).subscribe();
            };

            this.clearCompletedTodos = function () {
                todoViewModel.clearComplete.invoke().subscribe();
            };

            this.markAll = function () {
                todoViewModel.toggleAllComplete.invoke().subscribe();
            };

            var d = [
                todoViewModel.bind(this, "newTodo.title", "newTodo"),
                todoViewModel.bind(this, "status", "status"),
                RxUI.ReactiveObject.bindObservable(
                    todoViewModel.incompleteTodos.toObservable(),
                    this,
                    "remaining"
                ),
                RxUI.ReactiveObject.bindObservable(
                    todoViewModel.whenAnyValue("visibleTodos").map(t => t.toObservable()).switch(),
                    this,
                    "todos"
                ),
                RxUI.ReactiveObject.bindObservable(
                    todoViewModel.todos.toObservable(),
                    this,
                    "totalTodos"
                ),
                todoViewModel.oneWayBind(this, "editedTodo", "editedTodo"),
                RxUI.ReactiveObject.bindObservable(
                    todoViewModel.areAllTodosComplete,
                    this,
                    "allChecked"),
                todoViewModel.loadTodos.invoke().subscribe()
            ];

            $scope.$on("$destroy", function () {
                d.forEach(function (sub) {
                    sub.unsubscribe();
                });
            });
        });
})();