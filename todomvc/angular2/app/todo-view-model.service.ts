import { Injectable, Inject } from '@angular/core';
import { TodoViewModel } from 'rxui-example-core';
import { TodoStorageService } from './todo-storage.service';

@Injectable()
export class TodoViewModelService extends TodoViewModel {
    constructor(public storageService: TodoStorageService) {
        super(storageService);
    }
}