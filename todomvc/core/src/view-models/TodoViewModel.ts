import {ReactiveObject, ReactiveCommand} from "rxui";
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

    public get completedTodos(): Todo[] {
        return this.get("completedTodos");
    }
    public get incompleteTodos(): Todo[] {
        return this.get("incompleteTodos");
    }
    public get visibleTodos(): Todo[] {
        return this.get("visibleTodos");
    }

    /**
     * Gets the array of TODOs that are being presented by this view model.
     */
    public get todos(): Todo[] {
        return this.get("todos");
    }

    /**
     * Sets the array of TODOs that are being presented by this view model.
     */
    public set todos(todos: Todo[]) {
        this.set("todos", todos);
    }

    /**
     * Gets the TODO that is currently being edited.
     */
    public get editedTodo(): Todo {
        return this.get("editedTodo");
    }

    /**
     * Sets the TODO that is currently being edited.
     */
    public set editedTodo(todo: Todo) {
        this.set("editedTodo", todo);
    }

    /**
     * Gets the TODO that is being created.
     */
    public get newTodo(): Todo {
        return this.get("newTodo");
    }

    /**
     * Sets the TODO that is being created.
     */
    public set newTodo(todo: Todo) {
        this.set("newTodo", todo);
    }

    public get status(): string {
        return this.get("status");
    }
    public set status(status: string) {
        // if (["all", "incomplete", "complete"].indexOf(status) < 0) {
        //     throw new Error("status must be either 'all', 'incomplete' or 'complete'");
        // }
        this.set("status", status);
    }

    /**
     * Gets an observable that resolves with whenever a TODO is being edited.
     */
    public isEditingAsync(): Observable<boolean> {
        return this.whenAnyValue(vm => vm.editedTodo).map(todo => todo != null);
    }

    /**
     * Determines whether the given title is a valid TODO Title.
     * @param title The title that should be evaluated.
     */
    private isValidTitle(title: string): boolean {
        var valid = !!title.trim();
        return valid;
    }

    constructor(todoStore: TodoStorage) {
        super();
        this._store = todoStore;
        this.editedTodo = null;
        this.newTodo = new Todo();
        this.set("completedTodos", []);
        this.set("incompleteTodos", []);
        this.todos = [];

        this.save = ReactiveCommand.createFromTask((a) => {
            return this._store.putTodos(this.todos);
        });

        var isNotSaving = this.save.isExecuting.map(executing => !executing);

        this.loadTodos = ReactiveCommand.createFromTask((a) => {
            return this._store.getTodos();
        });
        this.loadTodos.results.subscribe(todos => {
            this.todos = todos;
        });
        this.whenAnyValue(vm => vm.todos)
            .map(todos => todos.filter(t => t.completed))
            .subscribe(completed => this.set("completedTodos", completed));
        this.whenAnyValue(vm => vm.todos)
            .map(todos => todos.filter(t => !t.completed))
            .subscribe(incomplete => this.set("incompleteTodos", incomplete));

        this.deleteTodo = ReactiveCommand.createFromObservable((a: Todo) => {
            var todoIndex = this.todos.indexOf(a);
            if (todoIndex >= 0) {
                // TODO: Improve to notify via an observable array
                this.todos.splice(todoIndex, 1);
                this.todos = this.todos.slice();

                return this.save.executeAsync();
            }
            return Observable.of(false);
        });

        this.toggleTodo = ReactiveCommand.createFromObservable((todo: Todo) => {
            todo.completed = !todo.completed;
            this.todos = this.todos.slice();
            return this.save.executeAsync();
        }, isNotSaving);

        var hasValidNewTodo = this.whenAnyValue(vm => {
            return vm.newTodo.title;
        }).map(title => {
            return this.isValidTitle(title)
        });

        var canAddTodo = Observable.combineLatest(
            hasValidNewTodo,
            isNotSaving,
            (validTodo, isNotSaving) => validTodo && isNotSaving);

        this.addTodo = ReactiveCommand.createFromObservable((a) => {
            this.todos.unshift(this.newTodo.copy());
            this.resetNewTodo();
            this.todos = this.todos.slice();
            return this.save.executeAsync();
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
            return this.save.executeAsync().do(saved => {
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

        var areAllComplete = this.whenAnyValue(vm => vm.todos)
            .map(todos => todos.every(t => t.completed));
        var hasTodos = this.whenAnyValue(vm => vm.todos)
            .map(todos => todos.length > 0);
        var canMarkAllComplete = Observable.combineLatest(hasTodos, areAllComplete, isNotSaving, (hasTodos, complete, notSaving) => hasTodos && !complete && notSaving);
        var canMarkAllIncomplete = Observable.combineLatest(hasTodos, areAllComplete, isNotSaving, (hasTodos, complete, notSaving) => hasTodos && complete && notSaving);

        this.markAllComplete = ReactiveCommand.createFromObservable(a => {
            var completedTodos = this.todos;
            completedTodos.forEach(t => {
                t.completed = true;
            });
            this.todos = completedTodos.slice();
            return this.save.executeAsync();
        }, canMarkAllComplete);

        this.markAllIncomplete = ReactiveCommand.createFromObservable(a => {
            var incompleteTodos = this.todos;
            incompleteTodos.forEach(t => {
                t.completed = false;
            });
            this.todos = incompleteTodos.slice();
            return this.save.executeAsync();
        }, canMarkAllIncomplete);

        this.toggleAllComplete = ReactiveCommand.createFromObservable(a => {
            var allComplete = this.todos.every(t => t.completed);
            if (allComplete) {
                return this.markAllIncomplete.executeAsync();
            } else {
                return this.markAllComplete.executeAsync();
            }
        }, isNotSaving);

        this.areAllTodosComplete = Observable.combineLatest(hasTodos, areAllComplete, (hasTodos, complete) => hasTodos && complete);
        this.clearComplete = ReactiveCommand.createFromObservable(a => {
            var todos = this.todos;
            for (var i = todos.length - 1; i >= 0; i--) {
                var t = todos[i];
                if (t.completed) {
                    todos.splice(i, 1);
                }
            }
            this.todos = todos.slice();
            return this.save.executeAsync();
        }, isNotSaving);

        this.whenAnyValue(vm => vm.todos, vm => vm.status, (todos, status) => ({ todos, status }))
            .map(args => {
                if (args.status === "all") {
                    return args.todos;
                } else if (args.status === "complete") {
                    return args.todos.filter(t => t.completed);
                } else {
                    return args.todos.filter(t => !t.completed);
                }
            }).subscribe(todos => {
                this.set("visibleTodos", todos);
            });
        this.status = "all";
    }

    public resetNewTodo(): void {
        this.newTodo.title = "";
        this.newTodo.completed = false;
    }
}