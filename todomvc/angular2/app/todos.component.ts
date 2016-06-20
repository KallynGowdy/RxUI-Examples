import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {Subscription} from 'rxjs/Rx';
import {TodoViewModelService} from './todo-view-model.service';
import {TodoStorageService} from './todo-storage.service';
import {TodoComponent} from './todo.component';
import {Todo} from 'rxui-example-core';
import {ReactiveObject} from 'rxui';
import {ActivatedRoute, ROUTER_DIRECTIVES} from '@angular/router';

@Component({
    selector: 'todos-list',
    templateUrl: 'app/todos.template.html',
    providers: [TodoViewModelService, TodoStorageService],
    directives: [TodoComponent, ROUTER_DIRECTIVES]
})
export class TodosComponent implements OnInit, OnDestroy {
    private disposables: Subscription[];

    constructor(public viewModel: TodoViewModelService, private route: ActivatedRoute) {
        this.disposables = [
            this.viewModel.loadTodos.invoke().subscribe()
        ];
    }

    addTodo() {
        this.viewModel.addTodo.invoke().subscribe();
    }

    markAll() {
        this.viewModel.toggleAllComplete.invoke().subscribe();
    }

    clearCompletedTodos() {
        this.viewModel.clearComplete.invoke().subscribe();
    }

    ngOnInit() {
        this.disposables.push(this.route.params.subscribe(params => {
            let status = params['status'];
            if (status === 'active') {
                this.viewModel.status = 'incomplete';
            } else if (status === 'completed') {
                this.viewModel.status = 'complete';
            } else {
                this.viewModel.status = status || this.viewModel.status;
            }
        }));
    }

    ngOnDestroy() {
        this.disposables.forEach(d => {
            d.unsubscribe();
        });
    }
}