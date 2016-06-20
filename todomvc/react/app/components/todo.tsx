import * as React from "react";
import {Todo, TodoViewModel} from "rxui-example-core";

export interface TodoProps {
    todo: Todo;
    viewModel: TodoViewModel;
}

export interface TodoState {
    title: string;
    completed: boolean;
}

export class TodoComponent extends React.Component<TodoProps, TodoState> {

    constructor() {
        super();
    }

    getTodoState() {
        return {
            title: this.props.todo.title,
            completed: this.props.todo.completed
        };
    }

    getInitialState() {
        return this.getTodoState();
    }

    handleToggle(change: any) {
        this.props.todo.completed = change.target.value;
        this.setState(this.getTodoState());
    }

    handleTitleChange(change: any) {
        this.props.todo.title = change.target.value;
        this.setState(this.getTodoState());
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.viewModel.finishEditing.invoke().subscribe(() => {
            this.setState(this.getTodoState());
        });
    }

    render() {
        return (
            <li>
                <div className="view">
                    <input className="toggle" type="checkbox" checked={this.state.completed} onChange={this.handleToggle} />
                    <label dblclick="editTodo()">{this.state.title}</label>
                    <button className="destroy" click="removeTodo()"></button>
                </div>
                <form onSubmit={this.handleSubmit}>
                    <input className="edit" value={this.state.title} onChange={this.handleTitleChange} keyup="revertEdits()" blur="saveEdits()" />
                </form>
            </li>
        );
    }
}