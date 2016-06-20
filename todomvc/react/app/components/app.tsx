import * as React from 'react';
import {TodoViewModel, LocalTodoStorage, Todo} from 'rxui-example-core';
import {TodoComponent} from "./todo";

export interface AppState {
    todos: Todo[]
}

export class AppComponent extends React.Component<{}, AppState> {
    viewModel: TodoViewModel;

    constructor() {
        super();
        this.viewModel = new TodoViewModel(new LocalTodoStorage());
        this.state = this.getViewModelState();
        this.viewModel.whenAnyValue(vm => vm.visibleTodos)
            .map(todos => this.getViewModelState())
            .do(state => this.setState(state))
            .subscribe();

        this.viewModel.loadTodos.invoke().subscribe();
    }

    getViewModelState() {
        return {
            todos: this.viewModel.visibleTodos
        }
    }

    render() {

        var todos = this.state.todos.map(t => (<TodoComponent todo={t} viewModel={this.viewModel}/>));

         return (
        <section id="todoapp">
            <header id="header">
                <h1>todos</h1>
                <form id="todo-form">
                    <input id="new-todo" placeholder="What needs to be done?" autofocus />
                </form>
            </header>
            <section id="main">
                <input id="toggle-all" type="checkbox"/>
                <label for="toggle-all">Mark all as complete</label>
                <ul id="todo-list">
                    {todos}
                </ul>
            </section>
            <footer id="footer" >
                <span id="todo-count">
                    <strong></strong>
                </span>
                <ul id="filters">
                    <li>
                        <a>All</a>
                    </li>
                    <li>
                        <a>Active</a>
                    </li>
                    <li>
                        <a>Completed</a>
                    </li>
                </ul>
                <button id="clear-completed"> Clear completed</button>
            </footer>
            </section>
        );
    }
}