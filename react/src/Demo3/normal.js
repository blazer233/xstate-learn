import React, { useState } from "react";
import { fetchRandomDog } from "./fetch";

function DogFetcher() {
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
export default DogFetcher;
