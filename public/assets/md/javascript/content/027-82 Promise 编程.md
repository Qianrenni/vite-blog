## 8.2 Promise 编程

### 1. Promise 状态和生命周期

```javascript
// Promise 的三种状态
// 1. pending (待定) - 初始状态
// 2. fulfilled (已成功) - 操作成功完成
// 3. rejected (已失败) - 操作失败

// 创建 Promise
const promise1 = new Promise((resolve, reject) => {
    console.log('Promise 执行器立即执行');
    resolve('成功');
});

const promise2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject(new Error('失败'));
    }, 1000);
});

const promise3 = new Promise((resolve, reject) => {
    // 永远不会改变状态
});

console.log('Promise 创建完成');

// Promise 状态不可逆
const stateDemo = new Promise((resolve, reject) => {
    resolve('第一次调用 resolve');
    reject('第二次调用 reject'); // 无效
    resolve('第三次调用 resolve'); // 无效
});

stateDemo.then(result => {
    console.log('结果:', result); // '第一次调用 resolve'
});

// Promise 状态检查
function checkPromiseState(promise) {
    // 注意：Promise 没有直接的状态检查方法
    // 可以通过 then/catch 来观察状态
    promise.then(
        result => console.log('Promise 成功:', result),
        error => console.log('Promise 失败:', error)
    );
}

// 创建不同状态的 Promise
const resolvedPromise = Promise.resolve('已解决的值');
const rejectedPromise = Promise.reject(new Error('已拒绝的原因'));

checkPromiseState(resolvedPromise); // Promise 成功: 已解决的值
checkPromiseState(rejectedPromise); // Promise 失败: Error: 已拒绝的原因

// Promise 构造函数的实用模式
function createPromiseFromCallback(asyncFunction) {
    return new Promise((resolve, reject) => {
        asyncFunction((error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

// 模拟异步操作
function fakeAsyncOperation(success, delay = 1000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (success) {
                resolve(`操作成功，耗时 ${delay}ms`);
            } else {
                reject(new Error('操作失败'));
            }
        }, delay);
    });
}

// 使用示例
fakeAsyncOperation(true)
    .then(result => console.log(result))
    .catch(error => console.error(error));

// Promise 状态转换的详细示例
class PromiseLifecycle {
    static demonstrate() {
        console.log('=== Promise 生命周期演示 ===');
        
        const promise = new Promise((resolve, reject) => {
            console.log('1. 执行器执行 (pending)');
            
            setTimeout(() => {
                const random = Math.random();
                if (random > 0.5) {
                    console.log('2. 调用 resolve (fulfilled)');
                    resolve('成功结果');
                } else {
                    console.log('2. 调用 reject (rejected)');
                    reject(new Error('失败原因'));
                }
            }, 1000);
        });
        
        console.log('3. Promise 对象已创建');
        
        promise
            .then(result => {
                console.log('4. then 处理器执行:', result);
            })
            .catch(error => {
                console.log('4. catch 处理器执行:', error.message);
            })
            .finally(() => {
                console.log('5. finally 处理器总是执行');
            });
        
        return promise;
    }
}

PromiseLifecycle.demonstrate();
```

### 2. Promise 链式调用

```javascript
// Promise 链式调用基础
function step1() {
    console.log('执行步骤1');
    return Promise.resolve('步骤1完成');
}

function step2(data) {
    console.log('执行步骤2，接收到:', data);
    return Promise.resolve(`${data} -> 步骤2完成`);
}

function step3(data) {
    console.log('执行步骤3，接收到:', data);
    return Promise.resolve(`${data} -> 步骤3完成`);
}

// 链式调用
step1()
    .then(step2)
    .then(step3)
    .then(result => {
        console.log('最终结果:', result);
    })
    .catch(error => {
        console.error('错误处理:', error);
    });

// 链式调用中的值传递
Promise.resolve(1)
    .then(value => {
        console.log('第一个 then:', value); // 1
        return value + 1;
    })
    .then(value => {
        console.log('第二个 then:', value); // 2
        return value * 2;
    })
    .then(value => {
        console.log('第三个 then:', value); // 4
        // 不返回值，相当于返回 undefined
    })
    .then(value => {
        console.log('第四个 then:', value); // undefined
        return Promise.resolve('Promise 值');
    })
    .then(value => {
        console.log('第五个 then:', value); // 'Promise 值'
    });

// 链式调用中的错误处理
Promise.resolve('开始')
    .then(value => {
        console.log(value);
        throw new Error('中间步骤出错');
    })
    .then(value => {
        console.log('这不会执行');
        return '正常流程';
    })
    .catch(error => {
        console.log('捕获错误:', error.message);
        return '错误恢复后的值';
    })
    .then(value => {
        console.log('恢复后继续执行:', value);
        return '最终结果';
    })
    .then(value => {
        console.log('最后结果:', value);
    });

// 链式调用中的异步操作
function fetchUserData(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId > 0) {
                resolve({ id: userId, name: `User${userId}` });
            } else {
                reject(new Error('无效用户ID'));
            }
        }, 100);
    });
}

function fetchUserPosts(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([`Post1 by User${userId}`, `Post2 by User${userId}`]);
        }, 200);
    });
}

function fetchPostComments(post) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([`Comment1 on ${post}`, `Comment2 on ${post}`]);
        }, 150);
    });
}

// 链式调用解决回调地狱
fetchUserData(1)
    .then(user => {
        console.log('获取用户:', user);
        return fetchUserPosts(user.id);
    })
    .then(posts => {
        console.log('获取帖子:', posts);
        return fetchPostComments(posts[0]);
    })
    .then(comments => {
        console.log('获取评论:', comments);
    })
    .catch(error => {
        console.error('处理过程中出错:', error.message);
    });

// 链式调用中的返回值处理
Promise.resolve('初始值')
    .then(value => {
        // 返回普通值
        return value + ' -> 处理1';
    })
    .then(value => {
        // 返回 Promise
        return Promise.resolve(value + ' -> 处理2');
    })
    .then(value => {
        // 返回新的 Promise
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(value + ' -> 处理3');
            }, 100);
        });
    })
    .then(value => {
        // 抛出错误
        if (value.includes('处理3')) {
            throw new Error('模拟错误');
        }
        return value;
    })
    .then(value => {
        console.log('这不会执行');
    })
    .catch(error => {
        console.log('捕获错误:', error.message);
        // 返回值继续链式调用
        return '错误处理完成';
    })
    .then(value => {
        console.log('最终结果:', value);
    });

// 高级链式调用示例
class DataProcessor {
    static process(data) {
        return Promise.resolve(data)
            .then(this.validate)
            .then(this.transform)
            .then(this.enrich)
            .catch(this.handleError);
    }
    
    static validate(data) {
        console.log('验证数据:', data);
        if (!data || typeof data !== 'object') {
            throw new Error('数据格式无效');
        }
        return data;
    }
    
    static transform(data) {
        console.log('转换数据:', data);
        return {
            ...data,
            processed: true,
            timestamp: new Date().toISOString()
        };
    }
    
    static enrich(data) {
        console.log('丰富数据:', data);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    ...data,
                    enriched: true,
                    version: '1.0'
                });
            }, 100);
        });
    }
    
    static handleError(error) {
        console.error('处理错误:', error.message);
        return {
            error: error.message,
            fallback: true
        };
    }
}

// 使用示例
DataProcessor.process({ id: 1, name: 'Test' })
    .then(result => {
        console.log('处理结果:', result);
    });

DataProcessor.process(null)
    .then(result => {
        console.log('错误处理结果:', result);
    });
```

### 3. Promise 组合方法

```javascript
// Promise 组合方法

// Promise.all() - 所有 Promise 都成功才成功
const promises = [
    Promise.resolve('结果1'),
    Promise.resolve('结果2'),
    Promise.resolve('结果3')
];

Promise.all(promises)
    .then(results => {
        console.log('所有结果:', results); // ['结果1', '结果2', '结果3']
    })
    .catch(error => {
        console.error('其中一个失败:', error);
    });

// Promise.all() 失败示例
const mixedPromises = [
    Promise.resolve('成功1'),
    Promise.reject(new Error('失败')),
    Promise.resolve('成功2')
];

Promise.all(mixedPromises)
    .then(results => {
        console.log('这不会执行');
    })
    .catch(error => {
        console.log('捕获到错误:', error.message); // '失败'
    });

// Promise.allSettled() - 等待所有 Promise 完成（无论成功或失败）
const mixedPromises2 = [
    Promise.resolve('成功1'),
    Promise.reject(new Error('失败1')),
    Promise.resolve('成功2'),
    Promise.reject(new Error('失败2'))
];

Promise.allSettled(mixedPromises2)
    .then(results => {
        console.log('所有 Promise 状态:');
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`Promise ${index}: 成功 - ${result.value}`);
            } else {
                console.log(`Promise ${index}: 失败 - ${result.reason.message}`);
            }
        });
    });

// Promise.race() - 返回第一个完成的 Promise
const fastPromise = new Promise(resolve => {
    setTimeout(() => resolve('快速完成'), 100);
});

const slowPromise = new Promise(resolve => {
    setTimeout(() => resolve('慢速完成'), 1000);
});

Promise.race([fastPromise, slowPromise])
    .then(result => {
        console.log('最先完成:', result); // '快速完成'
    });

// Promise.race() 超时控制
function withTimeout(promise, timeout) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('操作超时')), timeout);
    });
    
    return Promise.race([promise, timeoutPromise]);
}

// 使用示例
const slowOperation = new Promise(resolve => {
    setTimeout(() => resolve('慢操作完成'), 2000);
});

withTimeout(slowOperation, 1000)
    .then(result => {
        console.log('操作完成:', result);
    })
    .catch(error => {
        console.log('操作失败:', error.message); // '操作超时'
    });

// Promise.any() - 返回第一个成功的 Promise (ES2021)
const promisesWithErrors = [
    Promise.reject(new Error('错误1')),
    Promise.reject(new Error('错误2')),
    Promise.resolve('第一个成功'),
    Promise.resolve('第二个成功')
];

Promise.any(promisesWithErrors)
    .then(result => {
        console.log('第一个成功的结果:', result); // '第一个成功'
    })
    .catch(error => {
        console.log('所有都失败:', error.errors);
    });

// Promise.any() 全部失败示例
const allFailures = [
    Promise.reject(new Error('错误1')),
    Promise.reject(new Error('错误2'))
];

Promise.any(allFailures)
    .then(result => {
        console.log('这不会执行');
    })
    .catch(error => {
        console.log('所有都失败:', error.errors); // [Error: 错误1, Error: 错误2]
    });

// 实际应用：并发请求处理
class ConcurrentRequestHandler {
    static async fetchMultipleUrls(urls) {
        const fetchPromises = urls.map(url => 
            fetch(url).catch(error => ({ error, url }))
        );
        
        const results = await Promise.allSettled(fetchPromises);
        
        return results.map((result, index) => ({
            url: urls[index],
            status: result.status,
            ...(result.status === 'fulfilled' 
                ? { data: result.value } 
                : { error: result.reason })
        }));
    }
    
    static async fetchWithTimeout(urls, timeout = 5000) {
        const fetchPromises = urls.map(url => 
            Promise.race([
                fetch(url),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`请求超时: ${url}`)), timeout)
                )
            ]).catch(error => ({ error, url }))
        );
        
        return Promise.all(fetchPromises);
    }
    
    static async fetchFastest(urls) {
        const fetchPromises = urls.map(url => fetch(url));
        return Promise.race(fetchPromises);
    }
}

// 使用示例
const urls = [
    'https://api.github.com/users/octocat',
    'https://api.github.com/users/torvalds',
    'https://api.github.com/users/gvanrossum'
];

// ConcurrentRequestHandler.fetchMultipleUrls(urls)
//     .then(results => {
//         results.forEach(result => {
//             console.log(`${result.url}: ${result.status}`);
//         });
//     });

// 实用的 Promise 组合工具
class PromiseCombinators {
    // 限制并发数量的 Promise.all
    static async allLimit(promises, limit) {
        const results = [];
        const executing = [];
        
        for (const [index, promise] of promises.entries()) {
            const p = Promise.resolve(promise).then(result => {
                results[index] = result;
            });
            
            executing.push(p);
            
            if (executing.length >= limit) {
                await Promise.race(executing);
                executing.splice(executing.findIndex(p => p === Promise.race(executing)), 1);
            }
        }
        
        await Promise.all(executing);
        return results;
    }
    
    // 重试机制
    static retry(promiseFunction, retries = 3) {
        return new Promise((resolve, reject) => {
            const attempt = (n) => {
                promiseFunction()
                    .then(resolve)
                    .catch(error => {
                        if (n === 1) {
                            reject(error);
                        } else {
                            console.log(`重试 ${retries - n + 1}/${retries}`);
                            setTimeout(() => attempt(n - 1), 1000);
                        }
                    });
            };
            
            attempt(retries);
        });
    }
    
    // 超时控制
    static timeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('操作超时')), ms)
            )
        ]);
    }
    
    // 批量处理
    static batch(processFunction, items, batchSize = 10) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        
        return batches.reduce(async (chain, batch) => {
            const results = await chain;
            const batchResults = await Promise.all(
                batch.map(item => processFunction(item))
            );
            return [...results, ...batchResults];
        }, Promise.resolve([]));
    }
}

// 使用示例
const flakyOperation = () => {
    return new Promise((resolve, reject) => {
        if (Math.random() > 0.7) {
            resolve('成功');
        } else {
            reject(new Error('随机失败'));
        }
    });
};

PromiseCombinators.retry(flakyOperation, 3)
    .then(result => console.log('重试成功:', result))
    .catch(error => console.log('重试失败:', error.message));

const slowOperation = new Promise(resolve => {
    setTimeout(() => resolve('慢操作'), 2000);
});

PromiseCombinators.timeout(slowOperation, 1000)
    .then(result => console.log('操作完成:', result))
    .catch(error => console.log('操作超时:', error.message));
```

### 4. 错误处理机制

```javascript
// Promise 错误处理机制

// 基本错误处理
Promise.reject(new Error('测试错误'))
    .then(result => {
        console.log('这不会执行');
    })
    .catch(error => {
        console.log('捕获错误:', error.message); // '测试错误'
    })
    .finally(() => {
        console.log('清理工作');
    });

// 链式调用中的错误处理
Promise.resolve('开始')
    .then(value => {
        console.log(value);
        throw new Error('中间错误');
    })
    .then(value => {
        console.log('这不会执行');
    })
    .catch(error => {
        console.log('捕获错误:', error.message);
        // 可以返回值继续链式调用
        return '错误恢复';
    })
    .then(value => {
        console.log('恢复后继续:', value); // '错误恢复'
    });

// 多层错误处理
Promise.resolve('开始')
    .then(value => {
        console.log(value);
        throw new Error('第一层错误');
    })
    .catch(error => {
        console.log('第一层捕获:', error.message);
        // 可以重新抛出错误
        throw new Error('第二层错误');
    })
    .catch(error => {
        console.log('第二层捕获:', error.message);
        // 返回正常值
        return '恢复正常';
    })
    .then(value => {
        console.log('最终结果:', value);
    });

// Promise.all 中的错误处理
const promises = [
    Promise.resolve('成功1'),
    Promise.reject(new Error('失败1')),
    Promise.resolve('成功2'),
    Promise.reject(new Error('失败2'))
];

Promise.all(promises)
    .then(results => {
        console.log('这不会执行');
    })
    .catch(error => {
        console.log('Promise.all 错误:', error.message); // '失败1' (第一个错误)
    });

// Promise.allSettled 的错误处理
Promise.allSettled(promises)
    .then(results => {
        const errors = results
            .filter(result => result.status === 'rejected')
            .map(result => result.reason.message);
        
        if (errors.length > 0) {
            console.log('部分操作失败:', errors);
        }
        
        const successes = results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);
        
        console.log('成功的结果:', successes);
    });

// 异步函数中的错误处理
async function asyncWithErrorHandling() {
    try {
        const result = await Promise.reject(new Error('异步错误'));
        console.log('这不会执行');
    } catch (error) {
        console.log('异步捕获错误:', error.message);
        return '错误处理完成';
    }
}

asyncWithErrorHandling().then(result => {
    console.log('异步函数结果:', result);
});

// 未处理的 Promise 错误
// Node.js 会发出警告
Promise.reject(new Error('未处理的错误'));
// (node:1234) UnhandledPromiseRejectionWarning: Error: 未处理的错误

// 正确处理未处理的错误
process.on('unhandledRejection', (reason, promise) => {
    console.log('未处理的 Promise 拒绝:', reason);
    // 可以在这里进行错误记录或清理工作
});

// 实际应用：API 错误处理
class APIError extends Error {
    constructor(message, status, url) {
        super(message);
        this.status = status;
        this.url = url;
        this.name = 'APIError';
    }
}

class APIClient {
    static async fetchWithErrorHandling(url) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new APIError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    url
                );
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            if (error instanceof APIError) {
                throw error; // 重新抛出 API 错误
            } else {
                // 网络错误或其他错误
                throw new APIError(
                    `网络错误: ${error.message}`,
                    0,
                    url
                );
            }
        }
    }
    
    static async fetchWithRetry(url, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                return await this.fetchWithErrorHandling(url);
            } catch (error) {
                console.log(`请求失败 (${i + 1}/${retries}):`, error.message);
                
                if (i === retries - 1) {
                    throw error; // 最后一次重试仍然失败
                }
                
                // 等待后重试
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
}

// 错误处理最佳实践
class ErrorHandler {
    // 统一错误处理
    static async handleAsync(asyncFunction, fallbackValue = null) {
        try {
            return await asyncFunction();
        } catch (error) {
            console.error('操作失败:', error);
            
            // 记录错误日志
            this.logError(error);
            
            // 返回默认值而不是抛出错误
            return fallbackValue;
        }
    }
    
    // 错误日志记录
    static logError(error) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            type: error.constructor.name
        };
        
        // 在实际应用中，这里可以发送到错误监控服务
        console.error('错误日志:', JSON.stringify(errorInfo, null, 2));
    }
    
    // 优雅降级
    static async withFallback(primaryFunction, fallbackFunction) {
        try {
            return await primaryFunction();
        } catch (error) {
            console.warn('主操作失败，使用备用方案:', error.message);
            return await fallbackFunction();
        }
    }
    
    // 错误分类处理
    static categorizeAndHandle(error) {
        if (error instanceof TypeError) {
            console.error('类型错误:', error.message);
        } else if (error instanceof ReferenceError) {
            console.error('引用错误:', error.message);
        } else if (error.message.includes('timeout')) {
            console.error('超时错误:', error.message);
        } else {
            console.error('未知错误:', error.message);
        }
    }
}

// 使用示例
ErrorHandler.handleAsync(
    () => Promise.reject(new Error('测试错误')),
    '默认值'
).then(result => {
    console.log('处理结果:', result); // '默认值'
});

// 错误边界模式（模拟）
class ErrorBoundary {
    constructor() {
        this.errors = [];
    }
    
    async executeWithErrorBoundary(asyncFunction) {
        try {
            return await asyncFunction();
        } catch (error) {
            this.errors.push(error);
            
            // 根据错误类型决定是否继续执行
            if (this.isRecoverable(error)) {
                console.log('可恢复错误，继续执行');
                return null;
            } else {
                console.log('不可恢复错误，停止执行');
                throw error;
            }
        }
    }
    
    isRecoverable(error) {
        // 简单的错误分类逻辑
        const recoverableErrors = ['timeout', 'network', 'temporary'];
        return recoverableErrors.some(keyword => 
            error.message.toLowerCase().includes(keyword)
        );
    }
    
    getErrorCount() {
        return this.errors.length;
    }
    
    clearErrors() {
        this.errors = [];
    }
}

const errorBoundary = new ErrorBoundary();

// 测试可恢复错误
errorBoundary.executeWithErrorBoundary(() => 
    Promise.reject(new Error('temporary network error'))
).then(result => {
    console.log('可恢复操作结果:', result);
});

// 测试不可恢复错误
errorBoundary.executeWithErrorBoundary(() => 
    Promise.reject(new Error('critical database error'))
).catch(error => {
    console.log('不可恢复错误:', error.message);
});
```