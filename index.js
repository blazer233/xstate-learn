import xstate from "xstate";
import rxjs from "rxjs";
import operators from "rxjs/operators";
const { from } = rxjs;
const { map, take } = operators;
const { createMachine, interpret, assign } = xstate;
const increment = context => context.count + 1;
const decrement = context => context.count - 1;

const counterMachine = createMachine({
  initial: "active",
  context: {
    count: 0
  },
  states: {
    active: {
      on: {
        INC: { actions: assign({ count: increment }) },
        DEC: { actions: assign({ count: decrement }) }
      }
    }
  }
});

const counterService = interpret(counterMachine)
  .onTransition(state => console.log(state.context.count))
  .start();

// from(counterService)
//   .pipe(
//     map(({ value, context }) => ({ value, context })),
//     take(2)
//   )
//   .subscribe(console.log);

// => 0
counterService.send("INC");
// => 1

counterService.send("INC");
// => 2

counterService.send("INC");
// => 3

counterService.send("DEC");
// => 2
