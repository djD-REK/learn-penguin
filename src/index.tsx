import * as React from "react"
import { render } from "react-dom"
import { LearnPenguin } from "./LearnPenguin"

import "./styles.css"
import "./day-night-toggle.scss"

const App = () => <LearnPenguin />

render(<App />, document.getElementById("root"))
