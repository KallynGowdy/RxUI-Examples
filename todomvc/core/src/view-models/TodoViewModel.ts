import {ReactiveObject, ReactiveCommand, ReactiveArray} from "rxui";
import {Todo} from "../models/Todo";
import {TodoStorage} from "../services/TodoStorage";
import {Observable} from "rxjs/Rx";

/**
 * Defines a view model that provides functionality for viewing and editing TODOs.
 */
export class TodoViewModel extends ReactiveObject {

    private _store: TodoStorage;
    private _originalTodo: Todo;

    public save: ReactiveCommand<{}, boolean>;
    public loadTodos: ReactiveCommand<{}, Todo[]>;
    public deleteTodo: ReactiveCommand<Todo, boolean>;
    public toggleTodo: ReactiveCommand<Todo, boolean>;
    public addTodo: ReactiveCommand<{}, boolean>;
    public editTodo: ReactiveCommand<Todo, {}>;
    public finishEditing: ReactiveCommand<{}, boolean>;
    public undo: ReactiveCommand<{}, boolean>;
    public markAllComplete: ReactiveCommand<{}, boolean>;
    public markAllIncomplete: ReactiveCommand<{}, boolean>;
    public toggleAllComplete: ReactiveCommand<{}, boolean>;
    public clearComplete: ReactiveCommand<{}, boolean>;
    public areAllTodosComplete: Observable<boolean>;
    public completedTodos: ReactiveArray<Todo>;
    public incompleteTodos: ReactiveArray<Todo>;
    public get todos(): ReactiveArray<Todo> { return this.get("todos"); }
    public set todos(todos: ReactiveArray<Todo>) { this.set("todos", todos); }
    public get editedTodo(): Todo { return this.get("editedTodo"); }
    public set editedTodo(todo: Todo) { this.set("editedTodo", todo); }
    public get newTodo(): Todo { return this.get("newTodo"); }
    public set newTodo(todo: Todo) { this.set("newTodo", todo); }
    public get status(): string { return this.get("status"); }
    public set status(status: string) {
        if (["all", "incomplete", "complete"].indexOf(status) < 0) {
            throw new Error("status must be either 'all', 'incomplete' or 'complete'");
        }
        this.set("status", status);
    }
    public get visibleTodos(): ReactiveArray<Todo> {
        return this.get("visibleTodos");
    }
    public set visibleTodos(value: ReactiveArray<Todo>) {
        this.set("visibleTodos", value);
    }

    /**
     * Determines whether the given title is a valid TODO Title.
     * @param title The title that should be evaluated.
     */
    private isValidTitle(title: string): boolean {
        return title !== null && !!title.trim();
    }

    constructor(todoStore: TodoStorage) {
        super();
        this._store = todoStore;
        this.editedTodo = null;
        this.newTodo = new Todo();
        this.todos = new ReactiveArray<Todo>();
        this.completedTodos = this.todos.derived.whenAnyItemProperty().filter(t => t.completed).build();
        this.incompleteTodos = this.todos.derived.whenAnyItemProperty().filter(t => !t.completed).build();
        this.save = ReactiveCommand.createFromTask((a) => {
            return this._store.putTodos(this.todos.toArray());
        });

        var isNotSaving = this.save.isExecuting.map(executing => !executing);

        this.loadTodos = ReactiveCommand.createFromTask((a) => {
            return this._store.getTodos();
        });
        this.loadTodos.results.subscribe(todos => {
            this.todos.splice(0, this.todos.length, ...todos);
        });

        this.deleteTodo = ReactiveCommand.createFromObservable((a: Todo) => {
            var todoIndex = this.todos.indexOf(a);
            if (todoIndex >= 0) {
                this.todos.splice(todoIndex, 1);
                return this.save.execute();
            }
            return Observable.of(false);
        });

        this.toggleTodo = ReactiveCommand.createFromObservable((todo: Todo) => {
            todo.completed = !todo.completed;
            return this.save.execute();
        }, isNotSaving);

        var hasValidNewTodo = this.whenAnyValue(vm => vm.newTodo.title)
            .map(title => this.isValidTitle(title));

        var canAddTodo = Observable.combineLatest(
            hasValidNewTodo,
            isNotSaving,
            (validTodo, isNotSaving) => validTodo && isNotSaving);

        this.addTodo = ReactiveCommand.createFromObservable((a) => {
            this.todos.unshift(this.newTodo.copy());
            this.resetNewTodo();
            return this.save.execute();
        }, canAddTodo);

        this.editTodo = ReactiveCommand.create((todo: Todo) => {
            this._originalTodo = todo.copy();
            this.editedTodo = todo;
            return {};
        });

        this.finishEditing = ReactiveCommand.createFromObservable(a => {
            if (this.editedTodo) {
                this.editedTodo = null;
            }
            return this.save.execute().do(saved => {
                if (saved) {
                    this._originalTodo = null;
                    this.editedTodo = null;
                }
            });
        }, isNotSaving);

        var canUndo = this.whenAnyValue(vm => vm.editedTodo, vm => vm.todos, (e, todos) => e !== null && todos !== null);

        this.undo = ReactiveCommand.create(a => {
            if (this.editedTodo && this._originalTodo) {
                this.editedTodo.title = this._originalTodo.title;
                this.editedTodo.completed = this._originalTodo.completed;
            }
            this.editedTodo = null;
            this._originalTodo = null;
            return true;
        }, canUndo);

        var areAllComplete = this.todos.computed.every(t => t.completed);
        var hasTodos = this.todos.whenAnyValue(t => t.length).map(length => length > 0);
        var canMarkAllComplete = Observable.combineLatest(hasTodos, areAllComplete, isNotSaving, (hasTodos, complete, notSaving) => hasTodos && !complete && notSaving);
        var canMarkAllIncomplete = Observable.combineLatest(hasTodos, areAllComplete, isNotSaving, (hasTodos, complete, notSaving) => hasTodos && complete && notSaving);
        this.areAllTodosComplete = Observable.zip(hasTodos, areAllComplete, (hasTodos, complete) => hasTodos && complete);

        this.markAllComplete = ReactiveCommand.createFromObservable(a => {
            var completedTodos = this.todos;
            completedTodos.forEach(t => {
                t.completed = true;
            });
            return this.save.execute();
        }, canMarkAllComplete);

        this.markAllIncomplete = ReactiveCommand.createFromObservable(a => {
            var incompleteTodos = this.todos;
            incompleteTodos.forEach(t => {
                t.completed = false;
            });
            return this.save.execute();
        }, canMarkAllIncomplete);

        this.toggleAllComplete = ReactiveCommand.createFromObservable(a => {
            var allComplete = this.todos.every(t => t.completed);
            if (allComplete) {
                return this.markAllIncomplete.execute();
            } else {
                return this.markAllComplete.execute();
            }
        }, isNotSaving);

        this.clearComplete = ReactiveCommand.createFromObservable(a => {
            var todos = this.todos;
            for (var i = todos.length - 1; i >= 0; i--) {
                var t = todos.getItem(i);
                if (t.completed) {
                    todos.splice(i, 1);
                }
            }
            return this.save.execute();
        }, isNotSaving);

        this.whenAnyValue(vm => vm.todos, vm => vm.status, (todos, status) => ({ todos, status }))
            .filter(args => args.todos !== null)
            .map(args => {
                if (args.status === "all") {
                    return args.todos;
                } else if (args.status === "complete") {
                    return args.todos.derived.whenAnyItemProperty().filter(t => t.completed).build();
                } else {
                    return args.todos.derived.whenAnyItemProperty().filter(t => !t.completed).build();
                }
            }).subscribe(todos => {
                this.visibleTodos = todos;
            });
        this.status = "all";
    }

    public resetNewTodo(): void {
        this.newTodo.title = "";
        this.newTodo.completed = false;
    }
}