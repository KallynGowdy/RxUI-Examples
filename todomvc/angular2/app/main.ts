import {bootstrap} from '@angular/platform-browser-dynamic';
import { AppComponent } from './app.component';
import { TodoViewModel, LocalTodoStorage } from 'rxui-example-core';
import { TodoViewModelService } from './todo-view-model.service';
import { TodoStorageService } from './todo-storage.service';
bootstrap(AppComponent, [{
    provide: TodoViewModel,
    useClass: TodoViewModelService
}, TodoStorageService]);