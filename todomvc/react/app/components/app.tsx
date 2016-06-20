import * as React from 'react';
import {TodoViewModel} from 'rxui-example-core';

export class AppComponent extends React.Component<{}, TodoViewModel> {
    render() {
        return (<h1>
            Hello, React!
        </h1>);
    }
}