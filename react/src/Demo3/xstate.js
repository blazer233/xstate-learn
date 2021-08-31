import React from "react";
import { from } from "rxjs";
import { createMachine, assign, interpret } from "xstate";
import { useMachine } from "@xstate/react";
import { fetchRandomDog } from "./fetch";

const dogFetcherMachine = createMachine({
  id: "dog fetcher",
  initial: "idle",
  context: {
    dog: null,
    error: null
  },
  states: {
    idle: {
      on: { FETCH: "loading" }
    },
    loading: {
      invoke: {
        src: () => fetchRandomDog(),
        onDone: {
          target: "success",
          actions: assign({ dog: (_, event) => event.data.message })
        },
        onError: {
          target: "failure",
          actions: assign({ error: (_, event) => event.data })
        }
      },
      on: { CANCEL: "idle" }
    },
    success: {
      on: { FETCH: "loading" }
    },
    failure: {
      on: { FETCH: "loading" }
    }
  }
});

function DogFetcher() {
  const [current, send] = useMachine(dogFetcherMachine);
  const { error, dog } = current.context;

  const service = interpret(dogFetcherMachine).start();
  console.log("server", service);
  console.log("dog", dog);

  const state$ = from(service);

  console.log("state$ ###", state$);

  state$.subscribe(state => {
    // ...
    console.log("state ###", state);
  });

  return (
    <div>
      {error && <span style={{ color: "red" }}>{error}</span>}
      <figure className="dog" onDoubleClick={() => send("FETCH")}>
        {dog && <img src={dog} alt="doggo" />}
      </figure>

      <button onClick={() => send("FETCH")}>
        {current.matches("loading") && "Fetching..."}
        {current.matches("success") && "Fetch another dog!"}
        {current.matches("idle") && "Fetch dog"}
        {current.matches("failure") && "Try again"}
      </button>
      <button onClick={() => send("CANCEL")}>Cancel</button>
    </div>
  );
}

export default DogFetcher;
