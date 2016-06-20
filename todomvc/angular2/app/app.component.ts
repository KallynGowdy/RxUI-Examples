import { Component, OnInit, OnDestroy } from '@angular/core';
import {TodoViewModelService} from './todo-view-model.service';
import {TodoStorageService} from './todo-storage.service';
import {TodosComponent} from './todos.component';
import {ROUTER_DIRECTIVES} from '@angular/router';

@Component({
    selector: 'todos-app',
    template: '<router-outlet></router-outlet>',
    providers: [TodoViewModelService, TodoStorageService],
    directives: [TodosComponent, ROUTER_DIRECTIVES]
})
export class AppComponent {
}