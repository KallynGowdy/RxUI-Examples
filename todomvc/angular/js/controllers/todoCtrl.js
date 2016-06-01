(function() {
    'use strict';

    angular.module('todoCtrl', ['todoViewModel'])

        /**
         * The main controller for the app. 
         * In a traditional MVVM senario, this corresponds to the code-behind our view. 
         * As such, the entire purpose for this controller is to handle UI events and pipe them to the view model.  
         */
        .controller('TodoCtrl', function TodoCtrl($scope, todoViewModel) {
            todoViewModel.loadTodos();

            todoViewModel.whenAnyValue("todos")
                .subscribe(todos => $scope.todos = todos);

            $scope.addTodo = function() {
                todoViewModel.addTodo.invokeAsync().subscribe();
            };
            
            $scope.editTodo = function(todo) {
                todoViewModel.editTodo.invokeAsync(todo).subscribe();
            };
            
            $scope.doneEditing = function(todo, index) {
                todoViewModel.finishEditing.invokeAsync().subscribe();
            };
            
            $scope.revertEdits = function(todo, event) {
                todoViewModel.undo.invokeAsync().subscribe();
            };
            
            $scope.removeTodo = function(todo) {
                todoViewModel.deleteTodo.invokeAsync(todo).subscribe();
            };
            
            $scope.toggleCompleted = function(todo) {
                todoViewModel.toggleTodo.invokeAsync(todo).subscribe();
            };
            
            $scope.clearCompletedTodos = function() {
                todoViewModel.clearComplete.invokeAsync().subscribe();
            };
            
            $scope.markAll = function() {
                todoViewModel.toggleAllComplete.invokeAsync().subscribe();
            };
            
            RxUI.ReactiveObject.bindObservable(todoViewModel.areAllCompleted, $scope, "allTodosComplete");
        });
});