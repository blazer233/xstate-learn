export function fetchRandomDog() {
  return new Promise((res, rej) => {
    setTimeout(() => {
      if (Math.random() < 0.1) {
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
