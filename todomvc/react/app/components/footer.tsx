import * as React from "react";
import {BaseComponent} from "./base";
import {TodoViewModel} from "rxui-example-core";
import {Link} from "react-router";
import * as classNames from "classnames";

export interface FooterParams {
    viewModel: TodoViewModel;
    status: string;
}

export interface FooterState {
    incompleteCount: number;
    remainingText: string;
    canClearComplete: boolean;
}

export class FooterComponent extends BaseComponent<FooterParams, FooterState> {

    constructor(params: FooterParams) {
        super(params);
        this.state = this.getViewModelState();
    }

    componentDidMount() {
        this.subscriptions.push(
            this.props.viewModel.whenAnyValue(vm => vm.visibleTodos,
                vm => vm.remainingText,
                () => ({}))
                .combineLatest(this.props.viewModel.incompleteTodos.whenAnyValue(a => a.length))
                .combineLatest(this.props.viewModel.completedTodos.whenAnyValue(a => a.length))
                .map(todos => this.getViewModelState())
                .do(state => this.setState(state))
                .subscribe()
        );
    }

    componentWillReceiveProps(props: FooterParams) {
        if (props.status) {
            switch (props.status) {
                case "active":
                    this.props.viewModel.status = "incomplete";
                    break;
                case "completed":
                    this.props.viewModel.status = "complete";
                    break;
                default:
                    this.props.viewModel.status = "all";
                    break;
            }
        }
    }

    getViewModelState() {
        return {
            incompleteCount: this.props.viewModel.incompleteTodos.length,
            canClearComplete: this.props.viewModel.completedTodos.length > 0,
            remainingText: this.props.viewModel.remainingText
        };
    }

    handleClearCompleted() {
        this.props.viewModel.clearComplete.invoke().subscribe();
    }

    render() {
        return (
            <footer className="footer" >
                <span className="todo-count">
                    <strong>{this.state.incompleteCount}</strong>
                    {" " + this.state.remainingText}
                </span>
                <ul className="filters">
                    <li>
                        <Link to={"/all"} className={classNames({ selected: this.props.status === "all" }) }>All</Link>
                    </li>
                    <li>
                        <Link to={"/active"} className={classNames({ selected: this.props.status === "active" }) }>Active</Link>
                    </li>
                    <li>
                        <Link to={"/completed"} className={classNames({ selected: this.props.status === "completed" }) }>Completed</Link>
                    </li>
                </ul>
                {(() => this.state.canClearComplete ?
                    <button className="clear-completed" onClick={this.handleClearCompleted.bind(this) }>Clear completed</button>
                    : "")() }
            </footer>
        );
    }
}