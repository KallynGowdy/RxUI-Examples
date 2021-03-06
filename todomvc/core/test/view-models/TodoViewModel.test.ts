import * as Sinon from "sinon";
import {TodoStorage} from "../../src/services/TodoStorage";
import {Todo} from "../../src/models/Todo";
import {TodoViewModel} from "../../src/view-models/TodoViewModel";
import {ReactiveArray} from "rxui";
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

                viewModel.loadTodos.execute().first().subscribe(t => {
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

                viewModel.loadTodos.execute().subscribe(t => {
                    expect(viewModel.todos.getItem(0)).to.equal(todos[0]);
                }, err => done(err), () => done());
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
                viewModel.todos.push(...[]);
                expect(viewModel.todos.length).to.equal(0);
                viewModel.addTodo.invoke().subscribe();
                expect(viewModel.todos.length).to.equal(0);
            });
            it("should add the newTodo if it has a non-empty title", (done) => {
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos.push(...[]);
                viewModel.newTodo.title = "Title";
                expect(viewModel.todos.length).to.equal(0);
                viewModel.addTodo.invoke().first().subscribe(result => {
                    expect(result).to.be.true;
                    expect(viewModel.todos.length).to.equal(1);
                    expect(viewModel.todos.getItem(0).title).to.equal("Title");
                    expect(service.putTodos.callCount).to.equal(1);
                }, err => done(err), () => done());
            });
            it("should trim the whitespace from the title", (done) => {
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos.push(...[]);
                viewModel.newTodo.title = "Title \t\n";
                expect(viewModel.todos.length).to.equal(0);
                viewModel.addTodo.invoke().first().subscribe(result => {
                    expect(result).to.be.true;
                    expect(viewModel.todos.getItem(0).title).to.equal("Title");
                }, err => done(err), () => done());
            })
            it("should add the new todo to the incomplete todos list", (done) => {
                var service = {
                    putTodos: (todos) => Promise.resolve(true)
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.newTodo.title = "Title";

                expect(viewModel.todos.length).to.equal(0);
                viewModel.addTodo.invoke().subscribe(result => {
                    expect(viewModel.incompleteTodos.length).to.equal(1);
                    expect(viewModel.incompleteTodos.getItem(0).title).to.equal("Title");
                    done();
                }, err => done(err));
            });
        });

        describe("#editTodo", () => {
            it("should set editedTodo to the given todo", () => {
                var viewModel = new TodoViewModel(<any>{});
                var t = new Todo();
                viewModel.editTodo.execute(t).subscribe();
                expect(viewModel.editedTodo).to.equal(t);
            });
        });
        describe("#finishEditing", () => {
            it("should clear the editedTodo", () => {
                var viewModel = new TodoViewModel(<any>{
                    putTodos: () => Promise.resolve(true)
                });
                var t = new Todo("Todo");
                viewModel.editTodo.execute(t).subscribe();
                viewModel.finishEditing.execute().subscribe();
                expect(viewModel.editedTodo).to.be.null;
            });
            it("should remove the editedTodo if the text is empty or whitespace", () => {
                var viewModel = new TodoViewModel(<any>{
                    putTodos: () => Promise.resolve(true)
                });
                var t = new Todo("Todo");
                viewModel.todos.push(t);
                viewModel.editTodo.execute(t).subscribe();
                viewModel.editedTodo.title = " \t\n";
                viewModel.finishEditing.execute().subscribe();
                expect(viewModel.todos.length).to.equal(0);
            });
            it("shoud trim whitespace from the todo's title", () => {
                var viewModel = new TodoViewModel(<any>{
                    putTodos: () => Promise.resolve(true)
                });
                var t = new Todo("Todo");
                viewModel.todos.push(t);
                viewModel.editTodo.execute(t).subscribe();
                viewModel.editedTodo.title = "Todo ";
                viewModel.finishEditing.execute().subscribe();
                expect(viewModel.todos.getItem(0).title).to.equal("Todo");
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
                viewModel.todos.push(...todos);

                viewModel.toggleTodo.execute(todos[0]);
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
                viewModel.todos.push(...todos);

                viewModel.toggleTodo.invoke(todos[0]).take(1).subscribe(() => {
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
                viewModel.todos.push(...todos);

                viewModel.toggleTodo.invoke(todos[0]).take(1).subscribe(() => {
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
                viewModel.todos.push(...todos);

                viewModel.toggleTodo.invoke(todos[0]).subscribe(() => {
                    expect(viewModel.completedTodos.length).to.equal(1);
                    expect(viewModel.completedTodos.getItem(0).title).to.equal("Todo");
                    done();
                }, err => done(err));
            });
        });

        describe("#todos.completed", () => {
            it("should detect when a todo is completed and update the incompleteTodos", (done) => {
                done();
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
                viewModel.todos.push(...todos);

                viewModel.deleteTodo.invoke(missingTodo).first().subscribe(deleted => {
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
                viewModel.todos.push(...todos);

                viewModel.deleteTodo.invoke(todos[0]).first().subscribe(deleted => {
                    expect(deleted).to.be.true;
                    expect(viewModel.todos.length).to.equal(1);
                    expect(viewModel.todos.getItem(0).title).to.equal("Other");
                    expect(service.putTodos.called).to.be.true;
                }, err => done(err), () => done());
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
                viewModel.todos.push(...todos);

                viewModel.save.invoke().first().subscribe(saved => {
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

                viewModel.loadTodos.execute().subscribe(todos => {
                    expect(viewModel.completedTodos.length).to.equal(2);
                    expect(viewModel.completedTodos.getItem(0)).to.equal(todos[0]);
                    expect(viewModel.completedTodos.getItem(1)).to.equal(todos[2]);
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

                viewModel.loadTodos.execute().subscribe(todos => {
                    expect(viewModel.incompleteTodos.length).to.equal(2);
                    expect(viewModel.incompleteTodos.getItem(0)).to.equal(todos[1]);
                    expect(viewModel.incompleteTodos.getItem(1)).to.equal(todos[3]);
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
                viewModel.todos.push(...todos);
                viewModel.markAllComplete.execute().subscribe(todos => {
                    expect(viewModel.incompleteTodos.length).to.equal(0);
                    expect(viewModel.completedTodos.length).to.equal(4);
                    expect(viewModel.todos.getItem(0).completed).to.be.true;
                    expect(viewModel.todos.getItem(1).completed).to.be.true;
                    expect(viewModel.todos.getItem(2).completed).to.be.true;
                    expect(viewModel.todos.getItem(3).completed).to.be.true;
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
                viewModel.todos.push(...todos);
                viewModel.markAllComplete.execute().subscribe(todos => {
                    expect(service.putTodos.callCount).to.equal(1);
                    done();
                }, err => done(err));
            });
            it("should not be able to run if there are no incomplete todos", (done) => {
                var todos: Todo[] = [
                    new Todo("Not So", true)
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos.push(...todos);
                viewModel.markAllComplete.canExecuteNow().subscribe(canExecute => {
                    expect(canExecute).to.be.false;
                    done();
                }, err => done(err));
            });
            it("should not be able to run if there are no todos", (done) => {
                var todos: Todo[] = [
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos.push(...todos);
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
                viewModel.todos.push(...todos);
                viewModel.markAllIncomplete.execute().subscribe(todos => {
                    expect(viewModel.incompleteTodos.length).to.equal(4);
                    expect(viewModel.completedTodos.length).to.equal(0);
                    expect(viewModel.todos.getItem(0).completed).to.be.false;
                    expect(viewModel.todos.getItem(1).completed).to.be.false;
                    expect(viewModel.todos.getItem(2).completed).to.be.false;
                    expect(viewModel.todos.getItem(3).completed).to.be.false;
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
                viewModel.todos.push(...todos);
                viewModel.markAllIncomplete.execute().subscribe(todos => {
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
                viewModel.todos.push(...todos);
                viewModel.markAllIncomplete.canExecuteNow().subscribe(canExecute => {
                    expect(canExecute).to.be.false;
                    done();
                }, err => done(err));
            });
            it("should not be able to run if there are no todos", (done) => {
                var todos: Todo[] = [
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos.push(...todos);
                viewModel.markAllIncomplete.canExecuteNow().subscribe(canExecute => {
                    expect(canExecute).to.be.false;
                    done();
                }, err => done(err));
            });
        });
        describe("#areAllTodosComplete", () => {
            it("should be true when all the todos are complete and not empty", () => {
                var todos: Todo[] = [
                    new Todo("Not So", true)
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos.push(...todos);
                expect(viewModel.areAllTodosComplete).to.be.true;
            });
            it("should resolve false when one or more of the todos are incomplete", () => {
                var todos: Todo[] = [
                    new Todo("Not So", false)
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos.push(...todos);
                expect(viewModel.areAllTodosComplete).to.be.false;
            });
        });
        describe("#visibleTodos", () => {
            it("should hold all of the todos when status === 'all'", () => {
                var todos: Todo[] = [
                    new Todo("Stuff", true),
                    new Todo("Others", false)
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos.push(...todos);
                viewModel.status = "all";
                expect(viewModel.visibleTodos[0]).to.equal(todos[0]);
                expect(viewModel.visibleTodos[1]).to.equal(todos[1]);
            });
            it("should hold only incomplete todos when status === 'incomplete'", () => {
                var todos: Todo[] = [
                    new Todo("Stuff", true),
                    new Todo("Others", false)
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos.push(...todos);
                viewModel.status = "incomplete";
                expect(viewModel.visibleTodos.length).to.equal(1);                
                expect(viewModel.visibleTodos[0]).to.equal(todos[1]);
            });
            it("should hold only completed todos when status === 'complete'", () => {
                var todos: Todo[] = [
                    new Todo("Stuff", true),
                    new Todo("Others", false)
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos.push(...todos);
                viewModel.status = "complete";
                expect(viewModel.visibleTodos.length).to.equal(1);
                expect(viewModel.visibleTodos[0]).to.equal(todos[0]);
            });
        });
        describe("#remainingText", () => {
            it("should be singular when #incompleteTodos has 1 item", () => {
                var todos: Todo[] = [
                    new Todo("Stuff", false)
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos.push(...todos);
                expect(viewModel.remainingText).to.equal("item left");
            });
            it("should be plural when #incompleteTodos has more than 1 item", () => {
                var todos: Todo[] = [
                    new Todo("Stuff", false),
                    new Todo("Others", false)
                ];
                var viewModel = new TodoViewModel(null);
                viewModel.todos.push(...todos);
                expect(viewModel.remainingText).to.equal("items left");
            });
            it("should be plural when #incompleteTodos has no items", () => {
                var todos: Todo[] = [];
                var viewModel = new TodoViewModel(null);
                viewModel.todos.push(...todos);
                expect(viewModel.remainingText).to.equal("items left");
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
                viewModel.todos.push(...todos);
                viewModel.toggleAllComplete.execute().subscribe(todos => {
                    expect(viewModel.incompleteTodos.length).to.equal(0);
                    expect(viewModel.completedTodos.length).to.equal(4);
                    expect(viewModel.todos.getItem(0).completed).to.be.true;
                    expect(viewModel.todos.getItem(1).completed).to.be.true;
                    expect(viewModel.todos.getItem(2).completed).to.be.true;
                    expect(viewModel.todos.getItem(3).completed).to.be.true;
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
                viewModel.todos.push(...todos);
                viewModel.toggleAllComplete.execute().subscribe(todos => {
                    expect(viewModel.incompleteTodos.length).to.equal(4);
                    expect(viewModel.completedTodos.length).to.equal(0);
                    expect(viewModel.todos.getItem(0).completed).to.be.false;
                    expect(viewModel.todos.getItem(1).completed).to.be.false;
                    expect(viewModel.todos.getItem(2).completed).to.be.false;
                    expect(viewModel.todos.getItem(3).completed).to.be.false;
                }, err => done(err), () => done());
            });
            it("should call saveTodos() after execution", (done) => {
                var todos: Todo[] = [
                    new Todo("Not So", false)
                ];
                var service = {
                    putTodos: Sinon.stub().returns(Promise.resolve(true))
                };
                var viewModel = new TodoViewModel(<any>service);
                viewModel.todos.push(...todos);
                viewModel.toggleAllComplete.execute().subscribe(todos => {
                    expect(service.putTodos.callCount).to.equal(1);
                }, err => done(err), () => done());
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
                viewModel.todos.push(...todos.slice());
                viewModel.clearComplete.execute().subscribe(cleared => {
                    expect(viewModel.incompleteTodos.length).to.equal(2);
                    expect(viewModel.completedTodos.length).to.equal(0);
                    expect(viewModel.todos.length).to.equal(2);
                    expect(viewModel.todos.getItem(0)).to.equal(todos[1]);
                    expect(viewModel.todos.getItem(1)).to.equal(todos[3]);
                }, err => done(err), () => done());
            });
        });
    });
}
