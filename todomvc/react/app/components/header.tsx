import * as React from "react";
import {BaseComponent} from "./base";
import {TodoViewModel} from "rxui-example-core";

export interface HeaderParams {
    viewModel: TodoViewModel;
}

export interface HeaderState {
    newTodo: string;
}

export class HeaderComponent extends BaseComponent<HeaderParams, HeaderState> {

    constructor(params: HeaderParams) {
        super(params);
        this.state = this.getViewModelState();
    }

    componentDidMount() {
        this.subscriptions.push(
            this.props.viewModel.whenAnyValue(vm => vm.visibleTodos,
                vm => vm.newTodo.title,
                () => ({}))
                .map(todos => this.getViewModelState())
                .do(state => this.setState(state))
                .subscribe()
        );
    }

    getViewModelState() {
        return {
            newTodo: this.props.viewModel.newTodo.title
        };
    }

    handleAddTodo(e: any) {
        e.preventDefault();
        this.props.viewModel.addTodo.invoke().subscribe();
    }

    handleNewTodoChange(change: any) {
        this.props.viewModel.newTodo.title = change.target.value;
    }

    render() {
        return (
            <header className="header">
                <h1>todos</h1>
                <form className="todo-form" onSubmit={this.handleAddTodo.bind(this) }>
                    <input className="new-todo" value={this.state.newTodo} onChange={this.handleNewTodoChange.bind(this) } placeholder="What needs to be done?" autofocus />
                </form>
            </header>
        );
    }
}