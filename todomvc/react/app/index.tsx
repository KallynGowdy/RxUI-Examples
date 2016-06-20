import * as React from "react";
import * as ReactDom from "react-dom";
import {AppComponent} from "./components/app";

ReactDom.render(
    <AppComponent/>,
    document.getElementById("entry")
);