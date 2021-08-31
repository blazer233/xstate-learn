import React, { useState, useReducer, useEffect } from "react";
import { from } from "rxjs";
import { Machine, assign, interpret } from "xstate";
import { useMachine } from "@xstate/react";
import "./style.css";

function fetchRandomDog() {
  return new Promise((res, rej) => {
    setTimeout(() => {
      const fail = Math.random() < 0.1;
      if (fail) {
        rej("Failed");
      } else {
        fetch(`https://dog.ceo/api/breeds/image/random`)
          .then(data => data.json())
          .then(data => {
            console.log(data);
            res(data);
          });
      }
    }, 1000);
  });
}

function DogFetcher() {
  const [isLoading, setIsLoading] = useState(false);
  const [dog, setDog] = useState(null);

  return (
    <div>
      <figure className="dog">{dog && <img src={dog} alt="doggo" />}</figure>

      <button
        onClick={() => {
          setIsLoading(true);
          fetchRandomDog().then(response => {
            setDog(response.message);
            setIsLoading(false);
          });
        }}
      >
        {isLoading ? "Fetching..." : "Fetch dog!"}
      </button>
    </div>
  );
}

function DogFetcher2() {
  const [isLoading, setIsLoading] = useState(false);
  const [dog, setDog] = useState(null);

  function fetchDog() {
    setIsLoading(true);
    fetchRandomDog().then(response => {
      setDog(response.message);
      setIsLoading(false);
    });
  }

  return (
    <div>
      <figure className="dog" onDoubleClick={fetchDog}>
        {dog && <img src={dog} alt="doggo" />}
      </figure>

      <button onClick={fetchDog}>
        {isLoading ? "Fetching..." : "Fetch dog!"}
      </button>
    </div>
  );
}

function DogFetcher3() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canceled, setCanceled] = useState(false);
  const [dog, setDog] = useState(null);

  function fetchDog() {
    setCanceled(false);
    setError(null);
    setIsLoading(true);
    fetchRandomDog()
      .then(response => {
        if (canceled) return;

        setIsLoading(false);
        setDog(response.message);
      })
      .catch(error => {
        setIsLoading(false);
        setCanceled(false);
        setError(error);
      });
  }

  function cancel() {
    setIsLoading(false);
    setCanceled(true);
  }

  return (
    <div>
      {error && <span style={{ color: "red" }}>{error}</span>}
      <figure className="dog" onDoubleClick={fetchDog}>
        {dog && <img src={dog} alt="doggo" />}
      </figure>

      <button onClick={fetchDog}>
        {isLoading ? "Fetching..." : "Fetch dog!"}
      </button>
      <button onClick={cancel}>Cancel</button>
    </div>
  );
}

function dogReducer(state, event) {
  switch (event.type) {
    case "FETCH":
      return {
        ...state,
        status: "loading"
      };
    case "RESOLVE":
      return {
        ...state,
        status: "success",
        dog: event.data.message
      };
    case "REJECT":
      return {
        ...state,
        status: "failure",
        error: event.error
      };
    case "CANCEL":
      return {
        ...state,
        status: "idle"
      };
    default:
      return state;
  }
}

const initialState = {
  status: "idle",
  dog: null,
  error: null
};

function DogFetcher4() {
  const [state, dispatch] = useReducer(dogReducer, initialState);
  const { error, dog, status } = state;

  useEffect(() => {
    if (state.status === "loading") {
      let canceled = false;

      fetchRandomDog()
        .then(data => {
          if (canceled) return;
          dispatch({ type: "RESOLVE", data });
        })
        .catch(error => {
          if (canceled) return;
          dispatch({ type: "REJECT", error });
        });

      return () => {
        canceled = true;
      };
    }
  }, [state.status]);

  return (
    <div>
      {error && <span style={{ color: "red" }}>{error}</span>}
      <figure className="dog" onDoubleClick={() => dispatch({ type: "FETCH" })}>
        {dog && <img src={dog} alt="doggo" />}
      </figure>

      <button onClick={() => dispatch({ type: "FETCH" })}>
        {status === "loading" ? "Fetching..." : "Fetch dog!"}
      </button>
      <button onClick={() => dispatch({ type: "CANCEL" })}>Cancel</button>
    </div>
  );
}

const dogFetcherMachine = Machine({
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

function DogFetcher5() {
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

const dogFetchers = [
  { component: DogFetcher, title: "Basic dog fetcher" },
  { component: DogFetcher2, title: "Dog fetcher with double click" },
  { component: DogFetcher3, title: "Dog fetcher with buggy cancellation" },
  { component: DogFetcher4, title: "Dog fetcher with reducer" },
  { component: DogFetcher5, title: "Dog fetcher with statechart" }
];

function App() {
  const [version, setVersion] = useState(0);

  const DogFetcherX = dogFetchers[version].component;

  return (
    <div className="App">
      <select
        onChange={e => {
          setVersion(e.target.value);
        }}
      >
        {dogFetchers.map((fetcher, i) => {
          return <option value={i}>{fetcher.title}</option>;
        })}
      </select>
      <DogFetcherX />
    </div>
  );
}

export default App;
