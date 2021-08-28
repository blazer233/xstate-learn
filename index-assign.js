import { createMachine, interpret, assign } from "xstate";

const counterMachine = createMachine(
  {
    id: "counter",
    initial: "ENABLED",
    context: {
      count: 0
    },
    states: {
      ENABLED: {
        on: {
          INC: {
            actions: ["increment"]
          },
          DYNAMIC_INC: {
            actions: ["dynamic_increment"]
          },
          RESET: {
            actions: ["reset"]
          },
          DISABLE: "DISABLED"
        }
      },
      DISABLED: {
        on: {
          ENABLE: "ENABLED"
        }
      }
    }
  },
  {
    actions: {
      increment: assign({
        count: context => context.count + 1
      }),
      dynamic_increment: assign({
        count: (context, event) => context.count + (event.value || 0)
      }),
      reset: assign({
        count: 0
      })
    }
  }
);

console.log('初始状态:',counterMachine.initialState.value,counterMachine.initialState.context,);

const stateAssign1 = counterMachine.transition(counterMachine.initialState, "DISABLE");
console.log('调用DISABLE之后状态:',stateAssign1.value,stateAssign1.context,);

const stateAssign2 = counterMachine.transition(stateAssign1,"ENABLE");
console.log('调用ENABLE之后状态:',stateAssign2.value,stateAssign2.context,);

const stateAssign3 = counterMachine.transition(stateAssign2,"INC");
console.log('调用INC之后状态:',stateAssign3.value,stateAssign3.context,);

const stateAssign4 = counterMachine.transition(stateAssign3,"INC");
console.log('再次调用INC之后状态:',stateAssign4.value,stateAssign4.context,);

const stateAssign5 = counterMachine.transition(stateAssign4,"DYNAMIC_INC");
console.log('调用DYNAMIC_INC之后状态:',stateAssign5.value,stateAssign5.context,);
