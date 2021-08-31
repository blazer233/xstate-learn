## xstate 是一個實作 有限狀態機 並使用 statecharts 將流程狀態視覺化的狀態管理 library.

以 react /redux 來說，一但系統的複雜性越高, 就越難避免將狀態變化跟資料混雜在一起。也較難直接看出每一個 state 變化的相依性及順序。舉例來說，紅綠燈在一個 reducer function 像是如下範例：

```
function light(state = { light: 'red' }, action) {
  switch(action.type) {
    case CHAGE_GREEN:
      return { light: 'green' };
      break;
    case CHAGE_YELLOW:
      return { light: 'yellow' };
      break;
    case CHAGE_RED:
      return { light: 'red' };
      break;
    default:
       return state;
  }
}
```


```
function transition(state, event) {
  switch (state) {
    case 'red':
     switch (event) {
       case 'click':
         return 'yellow';
       default:
         return state;
    }
    case 'yellow':
     switch (event) {
       case 'click':
         return 'green';
       default:
         return state;
    }
    case 'green':
     switch (event) {
       case 'click':
         return 'red';
       default:
         return state;
    }
    default:
      return state;
  }
}

let currentState = 'red';
let send=(event)=>transition(currentState, event);

//执行点击
let result = send('click');
console.log(result);
```

改进


```
const machine = {
  initial: 'red',
  states: {
    'red': {
      on: {
        'click': 'yellow'
      }
    },
    'yellow': {
      on: {
        'click': 'green'
      }
    },
    'green': {
      on: {
        'click': 'red'
      }
    },
  }
}

function transition(event, state = machine.initial) {
  const nextState = machine.states[state].on[event] || state;
  return nextState;
}
let send=(event)=>transition(event);

//执行点击
let result = send('click');
console.log(result);
```

```
import { createMachine, interpret } from 'xstate';

const machine = createMachine({
  initial: 'red',
  states: {
    'red': {
      on: {
        'click': 'yellow'
      }
    },
    'yellow': {
      on: {
        'click': 'green'
      }
    },
    'green': {
      on: {
        'click': 'red'
      }
    },
  }
});

const service = interpret(machine);


service.start(); //进行启动
service.send("click"); // 执行对应的状态操作
console.log(service.state.value); // 打印初始值
```



//https://xstate.js.org/viz/


1. 透過 fsm 的核心設計強迫實作者把各種狀態流程及相關順序完整規劃出來藉以釐清各種狀態，並透過 states & context 達到狀態(state)與資料(context)分離。
2. 透用 stateschart visualizer 產出狀態視覺互動 flow 方便與非程式人員討論。
3. 已規劃好的 state 路徑設計完成後，可透過資料分析對路徑做統計及規劃，找出對使用者更常用更便捷的路徑，提高使用者體驗。
4. 易於跟不同實作的 UI Layer 耦合或遷移，因為狀態跟資料都統一由 xstate fsm 控管，也能讓 UI component 內部大多專注於 UI 自己應有的行為而不需管理過多的 local state.

每個格子是一個狀態（State），我們在裡面都會從第一格開始（Initial State）接著丟沙包就像是個事件（Event），這個事件發生之後，我們要跳到別的格子這是轉換函式（Transition）。


狀態就是 UI 嗎？
在前端框架裡面，透過對 State 的觀察來更新 UI，這讓我們有時候會認為狀態的切換是跟隨著 UI 一起，但狀態其實不一定要跟 UI 綁在一起。舉例來說：一個系統的啟動到進入 Default 狀態中間可能系統有多個狀態的轉變，但 UI 這邊都不一定有變化。
相應的，就算 UI 有變化我們也不一定要將每一個變化都切成一個狀態，舉例來說：我們可以將一整個區塊的所有變動階段當成一個狀態。所謂的 UI 變化，其實是狀態邏輯的副作用，與狀態是分離的

狀態就是數據嗎？
另一點所有會影響到狀態的內容都會被放在 state / store 之中，舉例來說：todo list 的 todo 與 todo list 有沒有登入都會被放在 state 裡面，但其實兩個東西很不一樣。前者是系統用來計算、或陳述的資料，後者是一個驅動 UI 或階段的資料。舉例來說：前者就像是攝氏 28 度、後者可能就是冷或熱，後者被抽象、歸類過，並不是一個絕對且無限多的資料。

const state = {
  data: todo, 
  isComplete: todo.length === 0,
  isOver: todo.filter(item => new Date(item.date) < Date.now())
  …
}

// 多狀態判斷
if (isComplete && isOver && isLogin …. ) { … }
// 狀態下的狀態判斷
if (isComplete) {
  if (isOver) { … }
  if (isLogin) { … }
}