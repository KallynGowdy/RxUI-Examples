import * as Sinon from "sinon";
import {TodoStorage} from "../../src/services/TodoStorage";
import {Todo} from "../../src/models/Todo";
import {TodoViewModel} from "../../src/view-models/TodoViewModel";
import {expect} from "chai";

export function register() {
    describe("TodoViewModel", () => {
        describe("#loadTodos()", () => {
            it("should load TODOs from the given TodoService", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", false)
                ];
                var store: TodoStorage = {
                    getTodos: Sinon.stub().returns(Promise.resolve(todos)),
                    putTodos: null
                };

                var viewModel = new TodoViewModel(store);

                viewModel.loadTodos.executeAsync().first().subscribe(t => {
                    expect(t).to.equal(todos);
                    done();
                }, err => done(err));
            });
            it("should put the loaded todos into the todos property", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", false)
                ];
                var store: TodoStorage = {
                    getTodos: Sinon.stub().returns(Promise.resolve(todos)),
                    putTodos: null
                };

                var viewModel = new TodoViewModel(store);

                viewModel.loadTodos.executeAsync().subscribe(t => {
                    expect(viewModel.todos).to.equal(todos);
                    done();
                }, err => done(err));
            });
        });

        describe("#newTodo", () => {
            it("should not be null", () => {
                var viewModel = new TodoViewModel(<any>{});
                expect(viewModel.newTodo).not.to.be.null;
            });
        });

        describe("#addTodo()", () => {
            it("should not do anything if newTodo does not have a title", () => {
                var viewModel = new TodoViewModel(<any>{});
                viewModel.todos = [];
                expect(viewModel.todos.length).to.equal(0);
                viewModel.addTodo.invokeAsync().subscribe();
                expect(viewModel.todos.length).to.equal(0);
            });
            it("should add the newTodo if it has a non-empty title", (done) => {
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = [];
                viewModel.newTodo.title = "Title";
                expect(viewModel.todos.length).to.equal(0);
                viewModel.addTodo.invokeAsync().subscribe(result => {
                    expect(result).to.be.true;
                    expect(viewModel.todos.length).to.equal(1);
                    expect(viewModel.todos[0].title).to.equal("Title");
                    expect(service.putTodos.callCount).to.equal(1);
                    done();
                }, err => done(err));
            });
            it("should add the new todo to the incomplete todos list", (done) => {
                var service = {
                    putTodos: (todos) => Promise.resolve(true)
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = [];
                viewModel.newTodo.title = "Title";
                
                expect(viewModel.todos.length).to.equal(0);
                viewModel.addTodo.invokeAsync().subscribe(result => {
                    expect(viewModel.incompleteTodos.length).to.equal(1);
                    expect(viewModel.incompleteTodos[0].title).to.equal("Title");
                    done();
                }, err => done(err));
            });
        });
        
        describe("#editTodo", () => {
           it("should set editedTodo to the given todo", () => {
               var viewModel = new TodoViewModel(<any>{});
               var t = new Todo();
               viewModel.editTodo.executeAsync(t).subscribe();
               expect(viewModel.editedTodo).to.equal(t);
           });
        });

        describe("#toggleTodo()", () => {
            it("should call putTodos() on the TodoStorage service after call", () => {
                var todos: Todo[] = [
                    new Todo("Todo", false)
                ];
                var service = {
                    putTodos: Sinon.spy()
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;

                viewModel.toggleTodo.executeAsync(todos[0]);
                expect(service.putTodos.callCount).to.equal(1);
                expect(service.putTodos.firstCall.calledWith(todos)).to.be.true;
            });

            it("should switch completed to true from false for the given TODO", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", false)
                ];
                var viewModel = new TodoViewModel(<any>{
                    putTodos: () => Promise.resolve(true)
                });
                viewModel.todos = todos;

                viewModel.toggleTodo.invokeAsync(todos[0]).take(1).subscribe(() => {
                    expect(todos[0].completed).to.be.true;
                    done();
                }, err => done(err));
            });
            it("should switch completed to false from true for the given TODO", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", true)
                ];
                var viewModel = new TodoViewModel(<any>{
                    putTodos: () => Promise.resolve(true)
                });
                viewModel.todos = todos;

                viewModel.toggleTodo.invokeAsync(todos[0]).take(1).subscribe(() => {
                    expect(todos[0].completed).to.be.false;
                    done();
                }, err => done(err));
            });
            it("should move the incomplete todo from #incompleteTodos to #completedTodos", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", false)
                ];
                var viewModel = new TodoViewModel(<any>{
                    putTodos: () => Promise.resolve(true)
                });
                viewModel.todos = todos;
                
                viewModel.toggleTodo.invokeAsync(todos[0]).subscribe(() => {
                    expect(viewModel.completedTodos.length).to.equal(1);
                    expect(viewModel.completedTodos[0].title).to.equal("Todo");
                    done();
                }, err => done(err));
            });
        });
        
        describe("#todos.completed", () => {
           it("should detect when a todo is completed and update the incompleteTodos", (done) => {
               
           });
        });

        describe("#deleteTodo", () => {
            it("should do nothing if the given TODO does not exist in the view model", (done) => {
                var missingTodo = new Todo("Missing", true);
                var todos: Todo[] = [
                    new Todo("Todo", true),
                    new Todo("Other", true)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(false))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;

                viewModel.deleteTodo.invokeAsync(missingTodo).first().subscribe(deleted => {
                    expect(deleted).to.be.false;
                    expect(service.putTodos.called).to.be.false;
                    done();
                });
            });

            it("should remove the given TODO from the array of TODOS", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", true),
                    new Todo("Other", true)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;

                viewModel.deleteTodo.invokeAsync(todos[0]).first().subscribe(deleted => {
                    expect(deleted).to.be.true;
                    expect(todos.length).to.equal(1);
                    expect(todos[0].title).to.equal("Other");
                    expect(service.putTodos.called).to.be.true;
                    done();
                });
            });
        });

        describe("#save()", () => {
            it("should call putTodos() on the service with the current array of TODOs", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", true)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;

                viewModel.save.invokeAsync().first().subscribe(saved => {
                    expect(saved).to.equal(true);
                    expect(service.putTodos.called).to.be.true;
                    expect(service.putTodos.firstCall.calledWithExactly(todos)).to.be.true;
                    done();
                }, err => done(err));
            });
        });

        describe("#completedTodos", () => {
            it("should be empty if the todos have not been loaded", () => {
                var viewModel = new TodoViewModel(null);
                expect(viewModel.completedTodos.length).to.equal(0);
            });
            it("should contain only completed todos after loading", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", true),
                    new Todo("Other", false),
                    new Todo("Great", true),
                    new Todo("Not So", false)
                ];
                var service = {
                    getTodos: Sinon.stub().returns(Promise.resolve(todos))
                };
                var viewModel = new TodoViewModel(<any>service);

                viewModel.loadTodos.executeAsync().subscribe(todos => {
                    expect(viewModel.completedTodos.length).to.equal(2);
                    expect(viewModel.completedTodos[0]).to.equal(todos[0]);
                    expect(viewModel.completedTodos[1]).to.equal(todos[2]);
                    done();
                }, err => done(err));
            });
        });

        describe("#incompleteTodos", () => {
            it("should be empty if the todos have not been loaded", () => {
                var viewModel = new TodoViewModel(null);
                expect(viewModel.incompleteTodos.length).to.equal(0);
            });
            it("should contain only incomplete todos after loading", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", true),
                    new Todo("Other", false),
                    new Todo("Great", true),
                    new Todo("Not So", false)
                ];
                var service = {
                    getTodos: Sinon.stub().returns(Promise.resolve(todos))
                };
                var viewModel = new TodoViewModel(<any>service);

                viewModel.loadTodos.executeAsync().subscribe(todos => {
                    expect(viewModel.incompleteTodos.length).to.equal(2);
                    expect(viewModel.incompleteTodos[0]).to.equal(todos[1]);
                    expect(viewModel.incompleteTodos[1]).to.equal(todos[3]);
                    done();
                }, err => done(err));
            });
        });

        describe("#markAllComplete()", () => {
            it("should set all of the remaining todos to complete", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", true),
                    new Todo("Other", false),
                    new Todo("Great", true),
                    new Todo("Not So", false)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;
                viewModel.markAllComplete.executeAsync().subscribe(todos => {
                    expect(viewModel.incompleteTodos.length).to.equal(0);
                    expect(viewModel.completedTodos.length).to.equal(4);
                    expect(viewModel.todos[0].completed).to.be.true;
                    expect(viewModel.todos[1].completed).to.be.true;
                    expect(viewModel.todos[2].completed).to.be.true;
                    expect(viewModel.todos[3].completed).to.be.true;
                    done();
                }, err => done(err));
            });
            it("should call saveTodos() after execution", (done) => {
                var todos: Todo[] = [
                    new Todo("Not So", false)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;
                viewModel.markAllComplete.executeAsync().subscribe(todos => {
                    expect(service.putTodos.callCount).to.equal(1);
                    done();
                }, err => done(err));
            });
            it("should not be able to run if there are no incomplete todos", (done) => {
                var todos: Todo[] = [
                    new Todo("Not So", true)
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos = todos;
                viewModel.markAllComplete.canExecuteNow().subscribe(canExecute => {
                    expect(canExecute).to.be.false;
                    done();
                }, err => done(err));
            });
            it("should not be able to run if there are no todos", (done) => {
                var todos: Todo[] = [
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos = todos;
                viewModel.markAllComplete.canExecuteNow().subscribe(canExecute => {
                    expect(canExecute).to.be.false;
                    done();
                }, err => done(err));
            });
        });
        describe("#markAllIncomplete()", () => {
            it("should set all of the remaining todos to incomplete", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", true),
                    new Todo("Other", false),
                    new Todo("Great", true),
                    new Todo("Not So", false)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;
                viewModel.markAllIncomplete.executeAsync().subscribe(todos => {
                    expect(viewModel.incompleteTodos.length).to.equal(4);
                    expect(viewModel.completedTodos.length).to.equal(0);
                    expect(viewModel.todos[0].completed).to.be.false;
                    expect(viewModel.todos[1].completed).to.be.false;
                    expect(viewModel.todos[2].completed).to.be.false;
                    expect(viewModel.todos[3].completed).to.be.false;
                    done();
                }, err => done(err));
            });
            it("should call saveTodos() after execution", (done) => {
                var todos: Todo[] = [
                    new Todo("Not So", false)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;
                viewModel.markAllIncomplete.executeAsync().subscribe(todos => {
                    expect(service.putTodos.callCount).to.equal(1);
                    done();
                }, err => done(err));
            });
            it("should not be able to run if there are incomplete todos", (done) => {
                var todos: Todo[] = [
                    new Todo("Not So", true),
                    new Todo("Incomplete", false)
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos = todos;
                viewModel.markAllIncomplete.canExecuteNow().subscribe(canExecute => {
                    expect(canExecute).to.be.false;
                    done();
                }, err => done(err));
            });
            it("should not be able to run if there are no todos", (done) => {
                var todos: Todo[] = [
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos = todos;
                viewModel.markAllIncomplete.canExecuteNow().subscribe(canExecute => {
                    expect(canExecute).to.be.false;
                    done();
                }, err => done(err));
            });
        });
        describe("#areAllTodosComplete", () => {
            it("should resolve true when all the todos are complete and not empty", (done) => {
                var todos: Todo[] = [
                    new Todo("Not So", true)
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.areAllTodosComplete.subscribe(complete => {
                    expect(complete).to.be.true;
                    done();
                });
                viewModel.todos = todos;
            });
            it("should resolve false when one or more of the todos are incomplete", (done) => {
                var todos: Todo[] = [
                    new Todo("Not So", false)
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.areAllTodosComplete.subscribe(complete => {
                    expect(complete).to.be.false;
                    done();
                });
                viewModel.todos = todos;
            });
        });
        describe("#toggleAllComplete()", () => {
            it("should mark all complete if at least one is incomplete", (done) => {
                var todos: Todo[] = [
                    new Todo("Todo", true),
                    new Todo("Other", false),
                    new Todo("Great", true),
                    new Todo("Not So", false)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;
                viewModel.toggleAllComplete.executeAsync().subscribe(todos => {
                    expect(viewModel.incompleteTodos.length).to.equal(0);
                    expect(viewModel.completedTodos.length).to.equal(4);
                    expect(viewModel.todos[0].completed).to.be.true;
                    expect(viewModel.todos[1].completed).to.be.true;
                    expect(viewModel.todos[2].completed).to.be.true;
                    expect(viewModel.todos[3].completed).to.be.true;
                    done();
                }, err => done(err));
            });
            it("should mark all incomplete if all are complete", (done) => {
               var todos: Todo[] = [
                    new Todo("Todo", true),
                    new Todo("Other", true),
                    new Todo("Great", true),
                    new Todo("Not So", true)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;
                viewModel.toggleAllComplete.executeAsync().subscribe(todos => {
                    expect(viewModel.incompleteTodos.length).to.equal(4);
                    expect(viewModel.completedTodos.length).to.equal(0);
                    expect(viewModel.todos[0].completed).to.be.false;
                    expect(viewModel.todos[1].completed).to.be.false;
                    expect(viewModel.todos[2].completed).to.be.false;
                    expect(viewModel.todos[3].completed).to.be.false;
                    done();
                }, err => done(err)); 
            });
            it("should call saveTodos() after execution", (done) => {
                var todos: Todo[] = [
                    new Todo("Not So", false)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos;
                viewModel.toggleAllComplete.executeAsync().subscribe(todos => {
                    expect(service.putTodos.callCount).to.equal(1);
                    done();
                }, err => done(err));
            });
        });
        describe("#clearComplete()", () => {
           it("should remove all of the complete todos from the list", (done) => {
               var todos: Todo[] = [
                    new Todo("Todo", true),
                    new Todo("Other", false),
                    new Todo("Great", true),
                    new Todo("Not So", false)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos = todos.slice();
                viewModel.clearComplete.executeAsync().subscribe(cleared => {
                   expect(viewModel.incompleteTodos.length).to.equal(2); 
                   expect(viewModel.completedTodos.length).to.equal(0);
                   expect(viewModel.todos.length).to.equal(2);
                   expect(viewModel.todos[0]).to.equal(todos[1]);
                   expect(viewModel.todos[1]).to.equal(todos[3]);
                   done();
                }, err => done(err));
           });
        });
    });
}
