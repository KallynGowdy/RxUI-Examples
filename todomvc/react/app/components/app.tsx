import * as React from 'react';
import {TodoViewModel, LocalTodoStorage, Todo} from 'rxui-example-core';
import {TodoComponent} from "./todo";
import {Subscription} from "rxjs/Rx";
import {Link} from "react-router";
import * as classNames from "classnames";

export interface AppState {
    todos: Todo[];
    newTodo: string;
    allCompleted: boolean;
    canClearComplete: boolean;
    incompleteCount: number;
    remainingText: string;
}

export interface AppParams {
    params: { status: string };
}

export class AppComponent extends React.Component<AppParams, AppState> {
    viewModel: TodoViewModel;
    subscriptions: Subscription[];
    constructor(params?: AppParams) {
        super(params);
        this.viewModel = new TodoViewModel(new LocalTodoStorage());
        this.subscriptions = [];
        this.state = this.getViewModelState();
    }

    componentDidMount() {
        this.subscriptions = [
            this.viewModel.whenAnyValue(vm => vm.visibleTodos,
                vm => vm.newTodo.title,
                vm => vm.areAllTodosComplete,
                vm => vm.remainingText,
                (todos, title) => ({ todos, title }))
                .combineLatest(this.viewModel.completedTodos.whenAnyValue(v => v.length))
                .combineLatest(this.viewModel.incompleteTodos.whenAnyValue(v => v.length))
                .map(todos => this.getViewModelState())
                .do(state => this.setState(state))
                .subscribe(),
            this.viewModel.loadTodos.invoke().subscribe()
        ];
    }

    componentWillReceiveProps(props: AppParams) {
        if (props.params.status) {
            switch (props.params.status) {
                case "active":
                    this.viewModel.status = "incomplete";
                    break;
                case "completed":
                    this.viewModel.status = "complete";
                    break;
                default:
                    this.viewModel.status = "all";
                    break;
            }
        }
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
            allCompleted: this.viewModel.areAllTodosComplete,
            canClearComplete: this.viewModel.completedTodos.length > 0,
            incompleteCount: this.viewModel.incompleteTodos.length,
            remainingText: this.viewModel.remainingText
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

    handleClearCompleted() {
        this.viewModel.clearComplete.invoke().subscribe();
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
                        <strong>{this.state.incompleteCount}</strong>
                        {" " + this.state.remainingText}
                    </span>
                    <ul className="filters">
                        <li>
                            <Link to={"/all"} className={classNames({selected: this.props.params.status === "all"})}>All</Link>
                        </li>
                        <li>
                            <Link to={"/active"} className={classNames({selected: this.props.params.status === "active"})}>Active</Link>
                        </li>
                        <li>
                            <Link to={"/completed"} className={classNames({selected: this.props.params.status === "completed"})}>Completed</Link>
                        </li>
                    </ul>
                    {(() => this.state.canClearComplete ?
                        <button className="clear-completed" onClick={this.handleClearCompleted.bind(this) }>Clear completed</button>
                        : "")() }
                </footer>
            </section>
        );
    }
}