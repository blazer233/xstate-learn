import React, { useReducer, useEffect } from "react";
import { fetchRandomDog } from "./fetch";

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

function DogFetcher() {
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
export default DogFetcher;
