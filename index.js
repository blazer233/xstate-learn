import { createMachine, interpret, assign } from "xstate";
//xstate 是一個實作 有限狀態機 並使用 statecharts 將流程狀態視覺化的狀態管理 library.
const lightMachine = createMachine(
  {
    //初始状态通过 initial 表达
    initial: "red",
    //保存可变数据(data)
    context: {
      // 資料 (data) 存在 context 裡，key 可以自己訂
      count: 0,
      user: null
    },
    //lightMachine 拥有的状态通过states表示
    //添加on 属性, on 的 key 代表事件名称，value 代表触发之后的下一个状态
    states: {
      red: {
        entry: ["entryRed", "temp"],
        // exit actions
        exit: ["exitRed", "temp"],
        on: {
          CLICK: "green"
        }
      },
      green: {
        on: {
          CLICK: "yellow"
        }
      },
      yellow: {
        on: {
          CLICK: "red"
        }
      }
    }
  },
  {
    actions: assign({
      // 透過外部傳進來的 event 來改變 count
      count: (context, event) => context.count + event.value,
      message: "value 也可以直接是 static value"
    })
  }
);
/**
 * value 可以拿到当前的状态
 * matches 可以用來判断现在是何种状态
 * nextEvents 可以拿到当前 state 有哪些 events 可以使用
 *
 * 初始值的状态通过 initialState 获取，加工过的值通过 value 获取
 * https://xstate.js.org/viz/
 */
const state0 = lightMachine.initialState;
console.log(state0.value);
const state1 = lightMachine.transition(state0, "CLICK");
console.log(state1.value);

console.log(state0.matches("red")); // true
console.log(state0.matches("green")); // false
console.log(state1.matches("green")); // true
console.log(state1.nextEvents); // true

/* 更改成rxjs有状态的车间 可以控制启动和停止 */
/**
 * service start 后，变成是一个 exjs中的 subscribable，
 * 可以搭配 Observable 相关的 library 互相操作，
 * 比如可以透过 rxjs 的 from 把 service start 后的 service 转换为 rxjs 的 observable！
 */

const service = interpret(lightMachine);
service.start(); //进行启动
console.log(service.state.value); // 打印初始值
service.send("CLICK"); // 执行对应的状态操作
console.log(service.state.value); // 打印操作之后的值
service.stop(); //停止

/**xstate 与 react 结合
 * https://codesandbox.io/s/react-xstate-example-1-ipsft?from-embed=&file=/src/index.js:310-322
 */

/* 保存可变数据(data)
   withContext() 給定初始資料
*/
// console.log(lightMachine.initialState.context);
// const serviceContext = interpret(
//   lightMachine.withContext({
//     count: 10,
//     user: {
//       name: "Jquery"
//     }
//   })
// );
// serviceContext.start();
// console.log(serviceContext.state.context);
// console.log(serviceContext.initialState.value);
