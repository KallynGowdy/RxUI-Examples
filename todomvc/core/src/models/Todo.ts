import {ReactiveObject} from "rxui";

/**
 * Defines an interface that represents objects that are TODOs.
 */
export class Todo extends ReactiveObject {
    
    public toJSON(): any {
        return {
            title: this.title,
            completed: this.completed
        };
    }
    
    public static fromJSON(obj: any): Todo {
        if(obj) {
            var todo = new Todo();
            todo.title = obj.title || null;
            todo.completed = obj.completed || null;
            return todo;
        }
        return null;
    }
    
    constructor(title: string = null, completed: boolean = null) {
        super();
        this.title = title;
        this.completed = completed;
    }
    
    /**
     * The title of the TODO.
     */
    public get title(): string {
        return this.get("title") || "";
    }
    
    /**
     * The title of the TODO.
     */
    public set title(title: string) {
        this.set("title", title);
    }
    
    /**
     * Gets whether the TODO has been completed. 
     */
    public get completed(): boolean {
        return this.get("completed") || false;
    }
    
    /**
     * Sets whether this todo has been completed.
     */
    public set completed(completed: boolean) {
        this.set("completed", completed);
    }
    
    /**
     * Clones this TODO and returns the copy.
     */
    public copy(): Todo {
        return new Todo(this.title, this.completed);
    }
}