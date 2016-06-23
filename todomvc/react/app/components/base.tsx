import * as React from 'react';
import {Subscription} from "rxjs/Rx";

export class BaseComponent<TParams, TState> extends React.Component<TParams, TState> {
    subscriptions: Subscription[];
    constructor(params: TParams) {
        super(params);
        this.subscriptions = [];
    }

    componentWillUnmount() {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

}