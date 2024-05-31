// 1.Promise是一个对象或函数
// 2.Promise有三个状态，pending（等待态,既不成功，也不失败）, fulfilled（成功态）, rejected（失败态）
// 3.成功失败由用户决定，以及成功失败的原因也是用户决定
// 4.Promise的默认执行器executor立即执行
// 5.Promise的实例都有一个then方法，then方法的一个参数是成功的回掉，一个参数是失败的回调
// 6.如果执行函数时发生了异常也会执行失败逻辑
// 7.如果Promise一旦成功就不能失败，一旦失败也不能再成功
// 8.Promise成功和失败的回调的返回值，可以传递到外层的下一个then方法中。（返回值可能存在这几种情况，普通值的情况（传递到下一层then的成功回调中）、出错的情况（一定会传递到下一层then的失败回调中）、Promise的情况（会根据Promise的状态，决定走下一次的成功还是失败））
// 9.错误处理，如果离自己最近的then没有错误处理会向下找
// 10.每次执行完Promise.then方法后返回的都是一个“新的Promise”的。

const PENDING = 'PENDING';  // 等待态
const FULFILLED = 'FULFILLED'; // 成功态
const REJECTED = 'REJECTED'; // 失败态

const resolvePromise = (promise2, x, resolve, reject) => {
    if (promise2 === x) { // 如果循环引用自己，用一个类型错误，结束调Promise
        return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
    }
    // 这里要严格判断，保证代码和别的库能一起使用
    let called; // 防止别的库里成功和失败都走
    if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
        // 现在x有可能是一个Promise，但还要继续判断
        try {
            const then = x.then; // 这里取值时，有可能在别的库里的then里抛出异常，所以需要在这里捕获异常
            if (typeof then === 'function') { // 这里满足条件，只能认为是一个Promise 
                then.call(x, y => { // 根据Promise的状态决定成功还是失败
                    if (called) return;
                    called = true;
                    resolvePromise(promise2, y, resolve, reject); // y可能是Promise，递归解析y的值，直到返回普通值
                }, e => {
                    if (called) return;
                    called = true;
                    reject(e);
                }); // 不要用x.then，使用then.call，因为x.then会再次取值，可能会再次出现异常
            } else {
                resolve(x);
            }
        } catch (e) {
            if (called) return;  // 防止失败了再次进入成功
            called = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}

class Promise {
    constructor(executor) {
        this.status = PENDING; // 刚进入时状态是PENDING，只有状态是PENDING时才可以改变状态
        this.value = undefined; // 成功的值
        this.reason = undefined; // 失败的原因
        this.fulfilledCalbacks = [];
        this.rejectCalbacks = [];

        // 成功
        const resolve = (value) => {
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;
                this.fulfilledCalbacks.forEach(fn => fn());
            }
        }

        // 失败
        const reject = (err) => {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = err;
                this.rejectCalbacks.forEach(fn => fn());
            }
        }
        try {
            executor(resolve, reject); // executor会被立即执行
        } catch (e) {
            reject(e);
        }
    }

    then = (onFulfilled, onRejected) => {
        // 不传值给默认值
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };

        const promise2 = new Promise((resolve, reject) => {
            if (this.status === FULFILLED) {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value); // onFulfilled的返回值，作为promise2的resolve的参数传递
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            }

            if (this.status === REJECTED) {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason); // onFulfilled的返回值，作为promise2的resolve的参数传递
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            }

            // 1. 当Promise执行then方法时，Promise的状态还处于PENDING状态
            // 2. 发布订阅模式，我们将成功的回调和失败的回调存放起来，稍后执行resolve和reject时重新执行
            if (this.status === PENDING) {
                this.fulfilledCalbacks.push(() => { // 这里用切片，可以拓展函数
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.value);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    }, 0);
                });
                this.rejectCalbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    }, 0);
                })
            }
        });
        return promise2; // 10.每次执行完Promise.then方法后返回的都是一个“新的Promise”的。实现链式调用
    }
}

Promise.deferred = function () {
    let dfd = {};
    dfd.promise = new Promise((resolve, reject) => {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd
}

Promise.resolve = function(valuse) {
    return new Promise((resolve, reject) => {
        resolve(valuse);
    });
}

Promise.reject = function(reason) {
    return new Promise((resolve, reject) => {
        reject(reason);
    });
}

// 全局安装promises-aplus-tests测试，npm install promises-aplus-tests -g
// 运行promises-aplus-tests Promise.js

module.exports = Promise;