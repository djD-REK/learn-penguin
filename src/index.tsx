import * as React from "react";
import { render } from "react-dom";
import { Example } from "./Example";

import "./styles.css";
import "./day-night-toggle.scss";

const App = () => <Example />;

render(<App />, document.getElementById("root"));
