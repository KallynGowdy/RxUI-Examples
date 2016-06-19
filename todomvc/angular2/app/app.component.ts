import { Component, Inject } from '@angular/core';
import { TodoViewModel } from 'rxui-example-core';

@Component({
    selector: 'todo-app',
    templateUrl: 'app/app.template.html',
    providers: [TodoViewModel]
})
export class AppComponent {
    constructor(public viewModel: TodoViewModel) {

    }
}