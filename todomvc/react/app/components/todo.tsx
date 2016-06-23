import * as React from "react";
import * as ReactDom from "react-dom";
import {Todo, TodoViewModel} from "rxui-example-core";
import * as classNames from "classnames";
import {Subscription} from "rxjs/Rx";

export interface TodoProps {
    todo: Todo;
    viewModel: TodoViewModel;
}

export interface TodoState {
    title: string;
    completed: boolean;
}

export class TodoComponent extends React.Component<TodoProps, TodoState> {
    titleInput: HTMLInputElement;
    subscriptions: Subscription[];
    constructor(props?: TodoProps) {
        super(props);
        this.state = this.getTodoState();

    }

    componentDidMount() {
        this.subscriptions = [
            this.props.todo.whenAnyValue(t => t.title, t => t.completed, (title, complete) => ({ title, complete }))
                .combineLatest(this.props.viewModel.whenAnyValue(vm => vm.editedTodo))
                .map(args => this.getTodoState())
                .do(state => {
                    this.setState(state);
                })
                .subscribe()
        ];
    }

    componentWillUnmount() {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

    getTodoState() {
        return {
            title: this.props.todo.title,
            completed: this.props.todo.completed
        };
    }

    handleToggle(change: any) {
        this.props.viewModel.toggleTodo.invoke(this.props.todo).subscribe();
    }

    handleTitleChange(change: any) {
        this.props.todo.title = change.target.value;
    }

    handleKeyUp(e: React.KeyboardEvent) {
        if (e.keyCode === 27) {
            this.props.viewModel.undo.invoke().subscribe();
        } else if (e.keyCode === 13) {
            this.props.viewModel.finishEditing.invoke().subscribe();
        }
    }

    handleBlur(e: React.SyntheticEvent) {
        this.props.viewModel.finishEditing.invoke().subscribe();
    }

    handleDoubleClick(e: React.MouseEvent) {
        this.props.viewModel.editTodo.invoke(this.props.todo).subscribe(() => {
            setTimeout(() => {
                if (this.titleInput !== null) {
                    this.titleInput.focus();
                }
            }, 0);
        });
    }

    handleRemoveTodo(e: React.SyntheticEvent) {
        e.preventDefault();
        this.props.viewModel.deleteTodo.invoke(this.props.todo).subscribe();
    }

    render() {
        return (
            <li className={classNames({ completed: this.state.completed, editing: this.props.todo === this.props.viewModel.editedTodo }) }>
                <div className="view">
                    <input className="toggle" type="checkbox" checked={this.state.completed} onChange={this.handleToggle.bind(this) } />
                    <label onDoubleClick={this.handleDoubleClick.bind(this) }>{this.state.title}</label>
                    <button className="destroy" onClick={this.handleRemoveTodo.bind(this) }></button>
                </div>
                <input
                    className="edit"
                    ref={(ref) => this.titleInput = ref}
                    value={this.state.title}
                    onChange={this.handleTitleChange.bind(this) }
                    onKeyUp={this.handleKeyUp.bind(this) }
                    onBlur={this.handleBlur.bind(this) } />
            </li>
        );
    }
}