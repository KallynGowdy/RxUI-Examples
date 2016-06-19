import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {Subscription} from 'rxjs/Rx';
import {TodoViewModelService} from './todo-view-model.service';
import {TodoStorageService} from './todo-storage.service';
import {TodoComponent} from './todo.component';
import {Todo} from 'rxui-example-core';
import {ReactiveObject} from 'rxui';

@Component({
    selector: 'todo-app',
    templateUrl: 'app/app.template.html',
    providers: [TodoViewModelService, TodoStorageService],
    directives: [TodoComponent]
})
export class AppComponent implements OnDestroy {
    private disposables: Subscription[];
    todos: Todo[];
    allChecked: boolean;
    remainingText: string;

    constructor(public viewModel: TodoViewModelService) {
        this.disposables = [
            ReactiveObject.bindObservable(
                this.viewModel
                    .whenAnyValue(vm => vm.visibleTodos)
                    .map(t => t.toObservable())
                    .switch(),
                this,
                v => v.todos
            ),
            ReactiveObject.bindObservable(
                this.viewModel.areAllTodosComplete,
                this,
                v => v.allChecked
            ),
            ReactiveObject.bindObservable(
                this.viewModel.incompleteTodos.whenAnyValue(incomplete => incomplete.length)
                    .map(l => l === 1 ? 'item left' : 'items left'),
                this,
                v => v.remainingText
            ),
            this.viewModel.loadTodos.invoke().subscribe()
        ];
    }

    addTodo() {
        this.viewModel.addTodo.invoke().subscribe();
    }

    markAll(allChecked: boolean) {
        this.viewModel.toggleAllComplete.invoke().subscribe();
    }

    clearCompletedTodos() {
        this.viewModel.clearComplete.invoke().subscribe();
    }

    ngOnDestroy() {
        this.disposables.forEach(d => {
            d.unsubscribe();
        });
    }
}