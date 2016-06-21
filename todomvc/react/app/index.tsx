import * as React from "react";
import * as ReactDom from "react-dom";
import {Router, Route, Link, Redirect, browserHistory} from "react-router";
import {AppComponent} from "./components/app";

var RedirectToDefaultValue = React.createClass({
    statics: {
        willTransitionTo(transition, params) {
            transition.redirect("/all");
        },
    },
    render() { return null; }
})

ReactDom.render(
    <Router history={browserHistory}>
        <Route path="/:status" component={AppComponent} />
        <Redirect from="*" to="/all" />
    </Router>,
    document.getElementById("entry")
);