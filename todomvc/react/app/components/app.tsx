import * as React from 'react';
import {TodoViewModel, LocalTodoStorage, Todo} from 'rxui-example-core';
import {TodoComponent} from "./todo";
import {Subscription} from "rxjs/Rx";

export interface AppState {
    todos: Todo[];
    newTodo: string;
    allCompleted: boolean;
}

export class AppComponent extends React.Component<{}, AppState> {
    viewModel: TodoViewModel;
    subscriptions: Subscription[];
    constructor() {
        super();
        this.viewModel = new TodoViewModel(new LocalTodoStorage());
        this.subscriptions = [];
        this.state = this.getViewModelState();
    }

    componentDidMount() {
        this.subscriptions = [
            this.viewModel.whenAnyValue(vm => vm.visibleTodos, vm => vm.newTodo.title, (todos, title) => ({ todos, title }))
                .map(todos => this.getViewModelState())
                .do(state => this.setState(state))
                .subscribe(),

            this.viewModel.loadTodos.invoke().subscribe()
        ];
    }

    componentWillUnmount() {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

    getViewModelState() {
        return {
            todos: this.viewModel.visibleTodos,
            newTodo: this.viewModel.newTodo.title,
            allCompleted: this.viewModel.areAllTodosComplete
        }
    }

    handleAddTodo(e: any) {
        e.preventDefault();
        this.viewModel.addTodo.invoke().subscribe();
    }

    handleNewTodoChange(change: any) {
        this.viewModel.newTodo.title = change.target.value;
    }

    handleToggleAll(change: any) {
        this.viewModel.toggleAllComplete.invoke().subscribe();
    }

    render() {
        var todos = this.state.todos.map(t => (<TodoComponent key={t.title} todo={t} viewModel={this.viewModel}/>));

        return (
            <section className="todoapp">
                <header className="header">
                    <h1>todos</h1>
                    <form className="todo-form" onSubmit={this.handleAddTodo.bind(this) }>
                        <input className="new-todo" value={this.state.newTodo} onChange={this.handleNewTodoChange.bind(this) } placeholder="What needs to be done?" autofocus />
                    </form>
                </header>
                <section className="main">
                    <input id="toggle-all" className="toggle-all" checked={this.state.allCompleted} onChange={this.handleToggleAll.bind(this) } type="checkbox"/>
                    <label htmlFor="toggle-all">Mark all as complete</label>
                    <ul className="todo-list">
                        {todos}
                    </ul>
                </section>
                <footer className="footer" >
                    <span className="todo-count">
                        <strong></strong>
                    </span>
                    <ul className="filters">
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
                    <button className="clear-completed">Clear completed</button>
                </footer>
            </section>
        );
    }
}