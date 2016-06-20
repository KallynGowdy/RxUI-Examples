import { Injectable } from '@angular/core';
import { LocalTodoStorage } from 'rxui-example-core';

@Injectable()
export class TodoStorageService extends LocalTodoStorage { }