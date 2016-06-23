import * as React from 'react';
import {BaseComponent} from "./base";
import {HeaderComponent} from "./header";
import {TodoViewModel, LocalTodoStorage} from 'rxui-example-core';
import {TodoComponent} from "./todo";
import {TodosListComponent} from "./todos-list";
import {FooterComponent} from "./footer";

export interface AppParams {
    params: { status: string };
}

export class AppComponent extends BaseComponent<AppParams, {}> {
    viewModel: TodoViewModel;

    constructor(params?: AppParams) {
        super(params);
        this.viewModel = new TodoViewModel(new LocalTodoStorage());
    }

    componentDidMount() {
        this.subscriptions.push(
            this.viewModel.loadTodos.invoke().subscribe()
        );
    }

    render() {
        return (
            <section className="todoapp">
                <HeaderComponent viewModel={this.viewModel}/>
                <TodosListComponent viewModel={this.viewModel}/>
                <FooterComponent viewModel={this.viewModel} status={this.props.params.status}/>
            </section>
        );
    }
}