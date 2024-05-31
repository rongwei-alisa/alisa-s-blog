---
title: 浅析 JavaScript 中的 Promise
date: 2024-04-03 15:49:12
tags: Promise
---

Promise 是一种强大的异步编程解决方案。它可以让我们更优雅的处理异步操作。

## 什么是 Promise

Promise 是 JavaScript 中用于处理异步操作的对象，它代表了一个异步操作最终完成或失败的结果。Promise 有三种状态：pending、fulfilled、rejected。一旦状态发生变化，就不会再改变。

Promise 相比于传统的回调函数，有以下优点：
- 链式调用，避免了传统回调函数有可能会导致的回调地狱问题

## Promise 的用法

```
const p = new Promise((resolve, reject) => {
    if (success) {
        resolve(value);
    } else {
        reject(reason);
    }
};

p.then(functtion(value) {
    // fulfilled 状态的回调函数
}, function(reason) {
    // rejected 状态的回调函数
}).then(functtion(value) {
    // fulfilled 状态的回调函数
}, function(reason) {
    // rejected 状态的回调函数
});
```

## Promise 的实现要点（Promises/A+规范）

- **三种状态：** pending、fulfilled、rejected
    - pending 状态可以转化为 fulfilled 或者 rejected
    - fulfilled rejected 状态不能转化为其他任何状态
- **构造函数：** Promise 构造函数接受一个函数作为参数，该函数立即执行，两个参数分别是 resolve 和 reject，用于改变 Promise 的状态
    - resolve 函数的作用是把 Promise 状态从 pending 变为 fulfilled，并将异步操作的结果作为参数传递出去
    - reject 函数的作用是把 Promise 状态从 pending 变为 rejected，并将异步操作报出的错误作为参数传递出去
- **then 方法：** Promise 实例的 then 方法用于添加对异步操作成功或失败的处理逻辑。接受两个回调函数作为参数，onFulfilled 和 onRejected，他们都接受 Promise 对象传出的值作为参数，用于处理 Promise 的状态改变。
- **then 方法的返回值：** then 方法的返回值是一个 Promise 对象，因此可以链式调用
- **then 方法中回调函数的返回值**
    - 不返回值或者返回常值：Promise 状态为成功
    - 产生异常或手动 throw 异常：Promise 状态为失败
    - 返回 Promise 对象：Promise 状态由返回的 Promise 对象决定
- then 方法中的代码是同步执行的，但是**它的回调函数是异步执行的**，会放到微任务队列中，等到主线程执行完之后，才会执行
- **catch 方法：** catch 方法的返回值是一个 Promise 对象，因此可以链式调用。用于捕获异步操作中的错误。它等价于调用 then 方法时传入的 onRejected 函数，用于处理 reject 状态的情况，支持链式调用。回调返回值与 then 方法相同
- **finally 方法：** finally 方法的返回值是一个 Promise 对象。在 promise 结束后，无论结果成功还是是阿白，都会执行 finally 方法中的回调函数
- **Promise.resolve：** 
    - 若参数是 Promise 实例，则 Promise.resolve 不做任何修改，原封不动的返回这个实例
    ```
    const p1 = new Promise((resolve, reject) => {
        resolve('success');
    });
    const p2 = Promise.resolve(p1);

    console.log(p1 === p2); // true
    ```
    - 若参数是一个 thenable 对象，则先将这个对象转为 Promise 对象，然后就立即执行 then 方法
    ```
    const thenableObj = {
        then(resolve, reject) {
            resolve('success');
        }
    };
    const p = Promise.resolve(thenableObj).then(value => {
        console.log(value); // success
    });
    ```
- **Promise.race：** 返回一个 Promise，该 Promise 的状态由参数数组中第一个完成的 Promise 决定
- **Promise.any：** 返回一个 Promise，只要有一个 Promise 成功，则返回一个成功状态的 Promise，反之则返回一个失败状态的 Promise
- **Promise.all：** 所有的 Promise 都成功，则返回一个成功状态的 Promise，反之则返回第一个失败状态的 Promise
- **Promise.allSettled：** 返回一个 Promise，该 Promise 的状态由参数数组中每个 Promise 决定，只有当所有 Promise 都成功时，才返回成功状态，否则返回失败状态（与 Promise.all 的区别是，Promise.allSettled 的结果数组中，每个 Promise 对象的返回值都包含其状态和值）


## 需要实现的接口

原型方法：
- Promise.prototype.then
- Promise.prototype.catch
- Promise.prototype.finally



静态方法：
- Promise.resolve
- Promise.reject
- Promise.race
- Promise.any
- Promise.all
- Promise.allSettled


## 代码实现

### class 实现

```
class MyPromise {
}
```
### 函数实现

```
function MyPromise(fn) {
}
```


参考
[使用 Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)
[Promise 对象](https://es6.ruanyifeng.com/#docs/promise#Promise-all)
[Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
[Promises/A+](https://promisesaplus.com/)
[【JavaScript】ES6之Promise用法详解及其应用（超时、控制并发、重复请求问题等）](https://juejin.cn/post/7229626260716273724?searchId=20240403162535511E8FA8DEF81480813C#heading-6)
