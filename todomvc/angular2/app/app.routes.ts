import {provideRouter, RouterConfig} from '@angular/router';
import {TodosComponent} from './todos.component';

export const routes: RouterConfig = [
    { 
        path: ':status',
        component: TodosComponent
    },
    <any>{
        path: '',
        component: TodosComponent,
        index: true
    }
];

export const APP_ROUTER_PROVIDERS = [
    provideRouter(routes)
];