import React from "react";
import ReactDOM from "react-dom";
import { createMachine } from "xstate";
import { useMachine } from "@xstate/react";
import "./style.css";

const RedLight = () => <span className="light red" />;
const GreenLight = () => <span className="light green" />;
const YellowLight = () => <span className="light yellow" />;

const LIGHT_STATES = {
  RED: "RED",
  GREEN: "GREEN",
  YELLOW: "YELLOW"
};

const LIGHT_EVENTS = {
  CLICK: "CLICK"
};

const lightMachine = createMachine({
  initial: LIGHT_STATES.RED,
  states: {
    [LIGHT_STATES.RED]: {
      on: {
        [LIGHT_EVENTS.CLICK]: LIGHT_STATES.GREEN
      }
    },
    [LIGHT_STATES.GREEN]: {
      on: {
        [LIGHT_EVENTS.CLICK]: LIGHT_STATES.YELLOW
      }
    },
    [LIGHT_STATES.YELLOW]: {
      on: {
        [LIGHT_EVENTS.CLICK]: LIGHT_STATES.RED
      }
    }
  }
});

function App() {
  const [state, send] = useMachine(lightMachine);
  return (
    <div className="app">
      {state.matches(LIGHT_STATES.RED) && <RedLight />}
      {state.matches(LIGHT_STATES.GREEN) && <GreenLight />}
      {state.matches(LIGHT_STATES.YELLOW) && <YellowLight />}
      <button
        onClick={() => {
          send(LIGHT_EVENTS.CLICK);
        }}
      >
        click me
      </button>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);