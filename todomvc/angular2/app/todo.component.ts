import {Component, Input, Renderer, ViewChild, ElementRef} from '@angular/core';
import {Todo} from 'rxui-example-core';
import {TodoViewModelService} from './todo-view-model.service';

@Component({
    selector: 'todo-detail',
    templateUrl: 'app/todo.template.html'
})
export class TodoComponent {
    @Input()
    todo: Todo;
    @ViewChild('input') 
    input: ElementRef;

    constructor(public viewModel: TodoViewModelService, private renderer: Renderer) {
        this.viewModel.whenAnyValue(vm => vm.editedTodo)
            .map(todo => todo === this.todo)
            .filter(editing => editing)
            .delay(1)
            .subscribe(editing => {
                // this.input.nativeElement.focus();
                this.renderer.invokeElementMethod(this.input.nativeElement, 'focus', []);
            });
    }

    toggleCompleted() {
        this.viewModel.toggleTodo.invoke(this.todo).subscribe();
    }

    removeTodo() {
        this.viewModel.deleteTodo.invoke(this.todo).subscribe();
    }

    editTodo() {
        this.viewModel.editTodo.invoke(this.todo).subscribe();
    }

    saveEdits() {
        this.viewModel.finishEditing.invoke().subscribe();
    }

    revertEdits() {
        this.viewModel.undo.invoke().subscribe();
    }
}