import React, { useState } from "react";
import DogFetcher from "./normal";
import DogFetcher1 from "./reducer";
import DogFetcher2 from "./xstate";
import "./style.css";

const dogFetchers = [
  { component: DogFetcher, title: "Dog fetcher with normal" },
  { component: DogFetcher1, title: "Dog fetcher with reducer" },
  { component: DogFetcher2, title: "Dog fetcher with statechart" }
];

function App() {
  const [version, setVersion] = useState(0);
  const DogFetcherX = dogFetchers[version].component;

  return (
    <div className="App">
      <select onChange={e => setVersion(e.target.value)}>
        {dogFetchers.map((fetcher, i) => {
          return <option value={i}>{fetcher.title}</option>;
        })}
      </select>
      <DogFetcherX />
    </div>
  );
}

export default App;
