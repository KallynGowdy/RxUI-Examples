import * as React from "react";
import {BaseComponent} from "./base";
import {TodoViewModel, Todo} from "rxui-example-core";
import {TodoComponent} from "./todo";

export interface TodosListParams {
    viewModel: TodoViewModel;
}

export interface TodosListState {
    todos: Todo[];
    allCompleted: boolean;
}

export class TodosListComponent extends BaseComponent<TodosListParams, TodosListState> {

    constructor(params: TodosListParams) {
        super(params);
        this.state = this.getViewModelState();
    }

    componentDidMount() {
        this.subscriptions.push(
            this.props.viewModel.whenAnyValue(
                vm => vm.visibleTodos,
                vm => vm.areAllTodosComplete,
                () => ({}))
                .map(todos => this.getViewModelState())
                .do(state => this.setState(state))
                .subscribe()
        );
    }

    getViewModelState() {
        return {
            todos: this.props.viewModel.visibleTodos,
            allCompleted: this.props.viewModel.areAllTodosComplete
        };
    }

    handleToggleAll(change: any) {
        this.props.viewModel.toggleAllComplete.invoke().subscribe();
    }

    render() {
        var todos = this.state.todos.map(t => (<TodoComponent key={t.title} todo={t} viewModel={this.props.viewModel}/>));
        return (
            <section className="main">
                <input id="toggle-all" className="toggle-all" checked={this.state.allCompleted} onChange={this.handleToggleAll.bind(this) } type="checkbox"/>
                <label htmlFor="toggle-all">Mark all as complete</label>
                <ul className="todo-list">
                    {todos}
                </ul>
            </section>
        );
    }
}