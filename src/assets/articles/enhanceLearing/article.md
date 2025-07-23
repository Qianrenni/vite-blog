# 目录

- [一,全局环境参数定义](#一全局环境参数定义)
- [二,工具函数和奖励函数定义](#二工具函数和奖励函数定义)
- [三,迭代方法](#三迭代方法)
  - [1.蒙特卡洛方法](#1蒙特卡洛方法)
    - [1.1 策略生成](#11-策略生成)
    - [1.2 On-policy 方法](#12-on-policy-方法)
    - [1.3 Off-policy 方法](#13-off-policy-方法)
  - [2.动态规划方法](#2动态规划方法)
    - [2.1  策略评估](#21--策略评估)
    - [2.2 价值迭代](#22-价值迭代)
  - [3.时分序列方法](#3时分序列方法)
    - [3.1 Q-learning](#31-q-learning)
    - [3.2 SARSA](#32-sarsa)
    - [3.3 N-Sarsa](#33-n-sarsa)
- [四,输出策略和价值](#四输出策略和价值)
- [五,调试](#五调试)
- [六,网络模型](#六网络模型)

# 一,全局环境参数定义


```python
import random

import numpy as np
from collections import defaultdict

# 参数设置（复用之前的定义）
SIZE = 9
ACTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]
ACTIONS_NAMES = ['↑', '↓', '←', '→']
DOUBLE_ACTIONS={frozenset('↑↓'):'↕',frozenset('↑←'):'↑←',frozenset('↑→'):'↑→',
                frozenset('←→'):'↔',frozenset('←↓'):'←↓',frozenset('↓→'):'↓→'}
NUM_ACTIONS = len(ACTIONS)
GOAL_STATE= {80,10,50}
DANGER_STATES = {5,25,45,75}  # 危险区域
CHEST_STATES = {15:1,35:2,55:4}  # 键为状态编号，值为对应的二进制位
FULL_CHEST_MASK = sum(CHEST_STATES.values())
GAMMA = 0.9
NUM_EPISODES = 5000  # 训练轮数
EPSILON = 0.1  # 探索率
EPSILON_START = 1.0
EPSILON_END = 0.01
EPSILON_DECAY = 0.995  # 每一轮乘这个因子
THRESHOLD=1e-4
```

# 二,工具函数和奖励函数定义


```python

def to_state(row, col):
    return row * SIZE + col

def from_state(s):
    return np.divmod(s, SIZE)
def is_terminal(s, mask):
    return s in GOAL_STATE and mask == FULL_CHEST_MASK

def step(s, mask, a):
    # 与前面一致：返回 next_s, next_mask, reward, done
    row, col = divmod(s, SIZE)
    dr, dc = ACTIONS[a]
    new_row = max(0, min(SIZE - 1, row + dr))
    new_col = max(0, min(SIZE - 1, col + dc))
    # if new_row==row and new_col==col:
    #     return s, mask, -100, False
    next_s = to_state(new_row, new_col)

    next_mask = mask
    reward =-1
    done = False

    if next_s in GOAL_STATE:
        done = True
        if mask == FULL_CHEST_MASK:
            reward = 1000
        else:
            reward = -100
            return s, mask, reward, done  # 回原地

    elif next_s in DANGER_STATES:
        reward = -100

    elif next_s in CHEST_STATES:
        bit = CHEST_STATES[next_s]
        if not (next_mask & bit):
            next_mask = mask | bit
            reward = 50
        else:
            reward = -1

    return next_s, next_mask, reward, done

```

# 三,迭代方法

## 1.蒙特卡洛方法

### 1.1 策略生成


```python

def generate_episode(policy, epsilon=EPSILON):
    # 生成一个 episode
    episode = []
    s = np.random.randint(SIZE * SIZE)
    mask = 0
    for _ in range(100):  # 最大长度限制
        if is_terminal(s, mask):
            break
        # ε-greedy 策略选择动作
        if np.random.rand() < epsilon:
            a = np.random.choice(NUM_ACTIONS)
        else:
            a = policy[s, mask]
        next_s, next_mask, r, done = step(s, mask, a)
        episode.append((s, mask, a, r))
        s, mask = next_s, next_mask
    return episode

# 动态 ε-greedy 策略生成 episode
# ========================
def generate_episode_with_dynamic_epsilon(Q, epsilon):
    episode = []
    s = np.random.randint(SIZE * SIZE)
    mask = 0
    for _ in range(100):  # 防止死循环
        if is_terminal(s, mask):
            break
        # ε-greedy 策略选择动作
        if np.random.rand() < epsilon:
            a = np.random.choice(NUM_ACTIONS)
        else:
            values = [Q.get((s, mask, ac), 0) for ac in range(NUM_ACTIONS)]
            a = np.argmax(values) if max(values)!=0 else np.random.choice(NUM_ACTIONS)
        next_s, next_mask, r, done = step(s, mask, a)
        episode.append((s, mask, a, r))
        s, mask = next_s, next_mask
    return episode
```

### 1.2 On-policy 方法


```python

def on_policy_monte_carlo_control():
    num_states = SIZE * SIZE
    num_masks = FULL_CHEST_MASK + 1

    # 初始化 Q 表和策略
    Q = defaultdict(float)
    C = defaultdict(float)
    policy = np.zeros(shape=(num_states, num_masks), dtype=int)
    episode_returns = []
    for ep in range(NUM_EPISODES):
        episode = generate_episode(policy,max(EPSILON_END, EPSILON_START * (EPSILON_DECAY ** ep)))

        G = 0
        visited_sa = set()

        # 从后往前计算 G
        for t in reversed(range(len(episode))):
            s, mask, a, r = episode[t]
            G = GAMMA * G + r
            sa = (s, mask, a)

            if sa not in visited_sa:
                visited_sa.add(sa)
                C[sa] += 1
                Q[sa] += (G - Q[sa]) / C[sa]  # 增量平均更新
        episode_returns.append(G)
        # 策略改进（greedy）
        for s in range(num_states):
            for mask in range(num_masks):
                if is_terminal(s, mask):
                    continue
                values = [Q.get((s, mask, a), 0) for a in range(NUM_ACTIONS)]
                best_a = np.argmax(values)
                policy[s, mask] = best_a

        if ep % 1000 == 0:
            print(f"Episode {ep} completed")

    return policy, Q , episode_returns
```

### 1.3 Off-policy 方法


```python

# ========================
# Off-policy First-Visit MC Control
# ========================
def off_policy_monte_carlo():
    num_states = SIZE * SIZE
    num_masks = FULL_CHEST_MASK + 1

    # 初始化
    Q = defaultdict(float)
    C = defaultdict(float)
    target_policy = np.random.choice(NUM_ACTIONS, size=(num_states, num_masks))
    episode_returns = []
    for ep in range(NUM_EPISODES):
        # 动态调整 epsilon
        epsilon = max(EPSILON_END, EPSILON_START * (EPSILON_DECAY ** ep))
        # 使用固定策略 π_b（behavior policy）收集数据
        episode = generate_episode_with_dynamic_epsilon(Q, epsilon)
        G = 0.0
        W = 1.0  # 重要性采样比率
        visited_sa = set()

        # 从后往前处理每个时间步
        for t in reversed(range(len(episode))):
            s, mask, a, r = episode[t]
            G = GAMMA * G + r
            sa = (s, mask, a)

            if sa not in visited_sa:
                visited_sa.add(sa)

                # 更新重要性采样统计量
                C[sa] += W

                # 增量平均更新 Q 值
                Q[sa] += (W / C[sa]) * (G - Q[sa])

                # 更新目标策略为 greedy
                values = [Q.get((s, mask, ac), 0) for ac in range(NUM_ACTIONS)]
                best_a = np.argmax(values)
                target_policy[s, mask] = best_a

                # 如果当前动作不是目标策略选的动作，则终止更新路径
                if a != target_policy[s, mask]:
                    W = 1e-8  # 权重归零，不再更新前面的状态
                    break
            else:
                continue
        episode_returns.append(G)
        if ep % 500 == 0:
            print(f"Episode {ep} completed")

    return target_policy, Q,  episode_returns
```

## 2.动态规划方法

### 2.1  策略评估


```python

def policy_evaluation(policy,V,env_step=step):
    value_deltas = []
    while True:
        delta = 0
        V_new=np.zeros_like(V)
        for s in range(SIZE*SIZE):
            for mask in range(FULL_CHEST_MASK + 1):
                if is_terminal(s, mask):  # 如果是终点且宝箱集齐
                    continue
                v = V[s, mask]
                a = policy[s, mask]

                # 环境转移函数应改为接受 (s, mask, a) 返回 (ns, nmask, r, done)
                ns, nmask, r, done = env_step(s, mask, a)
                V_new[s,mask]=r + GAMMA * V[ns, nmask]
                delta = max(delta, abs(v - V_new[s, mask]))
        value_deltas.append(delta)
        V = V_new
        if delta < THRESHOLD:
            break

    return V, value_deltas
def policy_improvement(policy,V,env_step=step):
    stable = True
    for s in range(SIZE*SIZE):
        for mask in range(FULL_CHEST_MASK+1):
            if is_terminal(s, mask):
                continue
            old_action = policy[s, mask]
            values = []
            for a in range(NUM_ACTIONS):
                ns, nmask, r, done = env_step(s, mask, a)
                values.append(r + GAMMA * V[ns, nmask])
            best_a = np.argmax(values)
            # 关键点 两个值相差不大会影响 策略评估,从而导致震荡
            if best_a != old_action and values[best_a] - values[old_action] >0.2:
                policy[s, mask] = best_a
                stable = False
    return policy, stable
def policy_iteration():
    # 初始化策略和价值函数（现在是二维）
    # 扩展状态总数 = 原始状态数 × 宝箱掩码数量
    num_states = SIZE * SIZE
    num_masks = FULL_CHEST_MASK + 1  # 从 0 到 FULL_CHEST_MASK
    policy = np.zeros(shape=(num_states, num_masks), dtype=int)
    V = np.zeros(shape=(num_states, num_masks))
    deltas_history = []
    for i in range(100):
        V,deltas=policy_evaluation(policy,V)
        deltas_history.extend(deltas)
        policy,stable=policy_improvement(policy,V)
        if stable:
            print(f'Policy iteration converged at iteration {i}')
            break
    return policy,V,deltas_history
```

### 2.2 价值迭代


```python

def value_iteration():
    num_state=SIZE*SIZE
    V=np.zeros(shape=(num_state,FULL_CHEST_MASK+1))
    policy=np.zeros(shape=(num_state,FULL_CHEST_MASK+1),dtype=int)
    deltas_history=[]
    while True:
        delta=0
        V_new=np.zeros_like(V)
        for s in range(num_state):
            for mask  in range(FULL_CHEST_MASK+1):
                if is_terminal(s,mask):
                    continue
                values=[]
                for a in range(NUM_ACTIONS):
                    next_state,next_mask,reward,done=step(s,mask,a)
                    if not done:
                        values.append(reward+GAMMA*V[next_state,next_mask])
                    else:
                        values.append(reward)
                new_value=max(values)
                delta=max(delta,abs(new_value-V[s,mask]))
                V_new[s,mask]=new_value
        deltas_history.append(delta)
        V=V_new
        if delta<THRESHOLD:
            print(f'Value iteration converged at iteration {len(deltas_history)}')
            break

    for s in range(num_state):
        for mask in range(FULL_CHEST_MASK+1):
            if is_terminal(s,mask):
                policy[s,mask]=-1
                continue
            values=[]
            for a in range(NUM_ACTIONS):
                next_state,next_mask,reward,done=step(s,mask,a)
                values.append(reward+GAMMA*V[next_state,next_mask])
            policy[s,mask]=np.argmax(values)
    return policy,V,deltas_history
```

## 3.时分序列方法

###  3.1 Q-learning


```python
def q_learing():
    import numpy as np
    # 假设你有 SIZE*SIZE 个状态，FULL_CHEST_MASK+1 种 mask，NUM_ACTIONS 个动作
    Q = np.zeros(shape=(SIZE*SIZE, FULL_CHEST_MASK+1, NUM_ACTIONS))
    GAMMA = 0.95     # 折扣因子
    ALPHA = 0.1      # 学习率
    EPSILON_START = 0.9
    EPSILON_END = 0.1
    EPSILON_DECAY = 0.995
    EPISODES = 5000 # 总共训练多少 episode
    MAX_STEPS = 100  # 每个 episode 最大步数
    def choose_action(state, mask, Q, epsilon):
        if np.random.rand() < epsilon:
            return np.random.randint(NUM_ACTIONS)
        else:
            return np.argmax(Q[state, mask])
    def enviroment_reset():
        return np.random.randint(SIZE*SIZE)
    def initial_mask(initial_state):
        return 0 if initial_state not in CHEST_STATES else CHEST_STATES[initial_state]
    gradient_history = []
    for episode in range(EPISODES):
        state = enviroment_reset()
        mask = initial_mask(state)
        delta=0
        for _ in range(MAX_STEPS):
            if state in GOAL_STATE:
                break
            epsilon = max(EPSILON_END, EPSILON_START * (EPSILON_DECAY ** episode))
            action = choose_action(state, mask, Q, epsilon)

            # 与环境交互得到下一个状态等信息
            next_state, next_mask, reward, done = step(state,mask,action)

            # Q-learning 更新公式
            td_target = (reward + GAMMA * np.max(Q[next_state, next_mask]) )if not done else reward
            td_error = td_target - Q[state, mask, action]
            Q[state, mask, action] += ALPHA * td_error
            delta=max(delta,abs(td_error))
            state = next_state
            mask = next_mask
            if done:
                break
        gradient_history.append(delta)
    return np.argmax(Q,  axis=2),  Q, gradient_history
```

### 3.2 SARSA


```python

def sarsa():
    import numpy as np
    from collections import defaultdict

    # 超参数
    NUM_EPISODES = 5000
    GAMMA = 0.99
    ALPHA = 0.1      # 学习率
    EPSILON_START = 0.5
    EPSILON_END = 0.01
    EPSILON_DECAY = 0.995
    num_states = SIZE * SIZE
    num_masks = FULL_CHEST_MASK + 1
    def enviroment_reset():
        state=np.random.randint(SIZE*SIZE)
        return state,0 if state not in CHEST_STATES else CHEST_STATES[state]
    # 初始化 Q 表格
    Q = np.zeros(shape=(num_states, num_masks, NUM_ACTIONS))
    episode_returns = []

    for ep in range(NUM_EPISODES):
        epsilon = max(EPSILON_END, EPSILON_START * (EPSILON_DECAY ** ep))

        # 重置环境（你需要自己实现 reset 函数）
        state, mask = enviroment_reset()  # 返回初始 state 和 mask

        # ε-greedy 选择第一个动作
        if np.random.rand() < epsilon:
            action = np.random.choice(NUM_ACTIONS)
        else:
            action = np.argmax(Q[(state, mask)])

        done = state in GOAL_STATE
        total_return = 0

        while not done:
            # 执行当前动作，得到下一个状态、奖励等
            next_state, next_mask, reward, done = step(state, mask, action)

            # ε-greedy 选择下一个动作
            if np.random.rand() < epsilon:
                next_action = np.random.choice(NUM_ACTIONS)
            else:
                next_action = np.argmax(Q[(next_state, next_mask)])

            # SARSA 更新公式
            td_target = reward + GAMMA * Q[(next_state, next_mask)][next_action]
            td_error = td_target - Q[(state, mask)][action]
            Q[(state, mask)][action] += ALPHA * td_error

            # 累计回报
            total_return += td_error

            # 更新状态和动作
            state, mask = next_state, next_mask
            action = next_action

        episode_returns.append(total_return)

        if ep % 500 == 0:
            print(f"Episode {ep} completed")

    return np.argmax(Q,  axis=2),Q, episode_returns
```

### 3.3 N-Sarsa


```python
def n_step_sarsa(n=3, NUM_EPISODES=5000):
    import numpy as np
    from collections import defaultdict

    # 超参数
    GAMMA = 0.99
    ALPHA = 0.1      # 学习率
    EPSILON_START = 0.5
    EPSILON_END = 0.01
    EPSILON_DECAY = 0.995
    num_states = SIZE * SIZE
    num_masks = FULL_CHEST_MASK + 1
    MAX_EPISODE_LENGTH = num_states+1  # 设置最大步数
    def enviroment_reset():
        state=np.random.randint(SIZE*SIZE)
        return state,0 if state not in CHEST_STATES else CHEST_STATES[state]
    # 初始化 Q 表格：Q[state][mask][action]
    Q = np.zeros(shape=(num_states, num_masks, NUM_ACTIONS))

    episode_returns = []

    for ep in range(NUM_EPISODES):
        epsilon = max(EPSILON_END, EPSILON_START * (EPSILON_DECAY ** ep))

        # 初始化环境
        state, mask = enviroment_reset()  # 返回初始 state 和 mask
        done = state in GOAL_STATE

        # ε-greedy 选择第一个动作
        if np.random.rand() < epsilon:
            action = np.random.choice(NUM_ACTIONS)
        else:
            action = np.argmax(Q[state, mask])

        # 存储轨迹信息
        states = [state]
        masks = [mask]
        actions = [action]
        rewards = []

        T = float('inf')  # episode 的总步数（还未知）
        t = 0  # 当前时间步
        # 累计本 episode 的回报
        total_return = 0
        while True:
            if t < T:
                # 执行动作，得到下一个状态、奖励等
                next_state, next_mask, reward, done = step(state, mask, action)
                next_action=None
                # 存储奖励
                rewards.append(reward)

                # 如果未结束，继续选动作
                if not done or t < MAX_EPISODE_LENGTH:
                    if np.random.rand() < epsilon:
                        next_action = np.random.choice(NUM_ACTIONS)
                    else:
                        next_action = np.argmax(Q[next_state, next_mask])
                    # 存储下一个状态和动作
                    states.append(next_state)
                    masks.append(next_mask)
                    actions.append(next_action)
                else:
                    T = t + 1  # 设置 episode 结束时间

                # 更新状态和动作
                state, mask, action = next_state, next_mask, next_action

            # 更新目标时间点 τ
            tau = t - n + 1
            if tau >= 0:
                # 计算 G_t^(n)：n-step return
                end = min(tau + n, T)
                G = sum([GAMMA ** (k - tau) * rewards[k] for k in range(tau, end)])

                if end < T:
                    G += GAMMA ** n * Q[states[end], masks[end]][actions[end]]
                delta=ALPHA * (
                    G - Q[states[tau], masks[tau], actions[tau]]
                )
                # 更新 Q 值
                Q[states[tau], masks[tau], actions[tau]] += delta
                total_return += delta/len(states)

            if tau == T - 1:
                break

            t += 1

        episode_returns.append(total_return)

        if ep % 500 == 0:
            print(f"Episode {ep} completed")

    # 返回最优策略（取 argmax）和 Q 表
    return np.argmax(Q, axis=2), Q, episode_returns
```

# 四,输出策略和价值


```python

def print_policy(policy,mask=0):
    for i in range(SIZE):
        row = ""
        for j in range(SIZE):
            s = to_state(i, j)
            if s in GOAL_STATE:
                cell = "G"
            elif s in DANGER_STATES:
                cell = "X"
            elif s in CHEST_STATES:
                cell = CHEST_STATES[s]
            else:
                cell = ACTIONS_NAMES[policy[s, mask]]
            row += f"{cell:^5}"
        print(row)
def print_values(V,mask=0):
    for i in range(SIZE):
        row = ""
        for j in range(SIZE):
            s = to_state(i, j)
            # if s in GOAL_STATE:
            #     cell = 'G'
            # elif s in DANGER_STATES:
            #     cell = 'X'
            # elif s in CHEST_STATES:
            #     cell = f"$"
            # else:
            cell = f"{V[s,mask]:.2f}"
            row += f"{cell:^7}"  # 居中对齐，每个数字占7个字符宽度
        print(row)
def print_environment():
    for i in range(SIZE):
        row = ""
        for j in range(SIZE):
            s = to_state(i, j)
            cell = "0"
            if s in GOAL_STATE:
                cell = 'G'
            elif s in DANGER_STATES:
                cell = 'X'
            elif s in CHEST_STATES:
                cell = f"$"
            else:
                pass
            row += f"{cell:^7}"  # 居中对齐，每个数字占7个字符宽度
        print(row)
def print_path(x,y,policy):
    path=[ ["0"  for _ in range(SIZE)] for _  in range(SIZE)]
    state=to_state(x,y)
    mask=0
    if state in CHEST_STATES:
        mask=CHEST_STATES[state]
    times=0
    while state not in GOAL_STATE:
        times+=1
        action=policy[state,mask]
        next_state,mask,_,_=step(state,mask,action)
        i,j=from_state(state)
        actions=frozenset(ACTIONS_NAMES[action]+path[i][j])
        path[i][j]=DOUBLE_ACTIONS.get(actions,ACTIONS_NAMES[action])
        if state>=SIZE*SIZE or state<0 or state==next_state or times>SIZE*SIZE:
            break
        state=next_state
    i,j=from_state(state)
    path[i][j]="🏁"
    path[x][y]="🏁"
    for i in range(SIZE):
        for j in range(SIZE):
            path[i][j]=path[i][j].center(7)
    print(f"\n Start from {x,y} to Goal")
    for row in path:
        print("".join(row))
def moving_average(a, window_size=50):
    return np.convolve(a, np.ones(window_size)/window_size, mode='valid')
def show_gradient_history(gradient_history):
    import matplotlib.pyplot as plt
    plt.figure(figsize=(12,8))
    plt.plot(moving_average(gradient_history))
    plt.xlabel('Episode')
    plt.ylabel('TD Error')
    plt.title('TD Error History')
    plt.show()

```

# 五,调试


```python
print("Environment:")
print_environment()

on_policy,on_Q,on_episode_returns=on_policy_monte_carlo_control()
print("\n On Policy:")
print_policy(on_policy)

off_policy, off_Q,off_episode_returns = off_policy_monte_carlo()
print("\n Off Policy:")
print_policy(off_policy)

policy,V,deltas_history=policy_iteration()
print("\n Policy Iteration:")
print_policy(policy)

value_policy,value_V,value_deltas_history=value_iteration()
print("\n Value Iteration:")
print_policy(value_policy)
q_policy,Q,gradient_history=q_learing()
print("\n Q-Learning:")
print_policy(q_policy)
print("\n SARSA")
sarsa_policy,sarsa_Q,sarsa_gradient_history=sarsa()
print_policy(sarsa_policy)
print("\n N-Step SARSA")
n_sarsa_policy,n_sarsa_Q,n_sarsa_gradient_history=n_step_sarsa()
print_policy(n_sarsa_policy)
```

    Environment:
       0      0      0      0      0      X      0      0      0   
       0      G      0      0      0      0      $      0      0   
       0      0      0      0      0      0      0      X      0   
       0      0      0      0      0      0      0      0      $   
       0      0      0      0      0      0      0      0      0   
       X      0      0      0      0      G      0      0      0   
       0      $      0      0      0      0      0      0      0   
       0      0      0      0      0      0      0      0      0   
       0      0      0      X      0      0      0      0      G   
    Episode 0 completed
    Episode 1000 completed
    Episode 2000 completed
    Episode 3000 completed
    Episode 4000 completed
    
     On Policy:
      →    →    →    ↓    ←    X    →    →    ↓  
      ↑    G    ↓    →    →    →    1    →    ↓  
      →    ↓    ↓    ↓    ↑    ↑    ↑    X    ↓  
      →    →    →    →    ↑    ↑    →    →    2  
      ↑    →    →    ↓    ←    ↑    ↑    ←    ↑  
      X    →    ↓    ←    ←    G    →    ↑    ←  
      →    4    ←    →    ←    ←    →    ↑    ↑  
      →    ↑    ←    ←    ←    ←    ↑    ↑    ↑  
      ↑    →    ↑    X    ↑    ↓    ↑    ←    G  
    Episode 0 completed
    Episode 500 completed
    Episode 1000 completed
    Episode 1500 completed
    Episode 2000 completed
    Episode 2500 completed
    Episode 3000 completed
    Episode 3500 completed
    Episode 4000 completed
    Episode 4500 completed
    
     Off Policy:
      →    →    →    →    →    X    ↓    ←    ←  
      ↑    G    ↓    ←    →    →    1    ↑    ↓  
      ↑    →    ↓    ↓    ↑    ←    ↑    X    ↓  
      ↓    ↓    ←    →    ↑    →    ↓    →    2  
      →    →    →    ↑    ↑    →    →    →    ↑  
      X    ↑    ↑    ↑    ←    G    ↑    ↑    ↑  
      →    4    →    ↓    →    →    ↑    →    ↑  
      →    →    →    →    →    ↑    ↑    →    ↑  
      →    ↑    ↑    X    →    ↑    ←    ↑    G  
    Policy iteration converged at iteration 13
    
     Policy Iteration:
      →    →    →    →    ↓    X    ↓    ↓    ←  
      ↓    G    →    →    →    →    1    ←    ←  
      ↓    ↓    ↑    ↑    ↑    ↑    ↑    X    ↓  
      ↓    ↓    ←    ↑    ↑    ↑    ↑    →    2  
      →    ↓    ↓    ↓    ↑    ↑    ↑    →    ↑  
      X    ↓    ↓    ↓    ↓    G    ↑    ↑    ↑  
      →    4    ←    ←    ←    ←    ↑    ↑    ↑  
      ↑    ↑    ↑    ←    ←    ←    ↑    ↑    ↑  
      →    ↑    ↑    X    ↑    ↑    →    ↑    G  
    Value iteration converged at iteration 27
    
     Value Iteration:
      →    →    ↓    ↓    ↓    X    ↓    ↓    ↓  
      ↓    G    →    →    →    →    1    ←    ↓  
      ↓    ↓    ↑    ↑    ↑    ↑    ↑    X    ↓  
      ↓    ↓    ↓    ↑    ↑    ↑    ↑    →    2  
      →    ↓    ↓    ↓    ↑    ↑    ↑    ↑    ↑  
      X    ↓    ↓    ↓    ↓    G    ↑    ↑    ↑  
      →    4    ←    ←    ←    ←    ↑    ↑    ↑  
      ↑    ↑    ↑    ↑    ↑    ↑    ↑    ↑    ↑  
      ↑    ↑    ↑    X    ↑    ↑    ↑    ↑    G  
    
     Q-Learning:
      →    →    ↓    →    ↓    X    ↓    ↓    ←  
      ↑    G    →    →    →    →    1    ←    ←  
      ↓    ↓    ↑    →    ↑    ↑    ↑    X    ↓  
      ↓    →    ↓    ←    ↑    ↑    ↑    →    2  
      →    ↓    ↓    ↓    ←    ↑    →    →    ↑  
      X    ↓    ↓    ←    ←    G    ↑    ↑    ↑  
      →    4    ←    ←    ←    ←    ←    ↑    ↑  
      ↑    ↑    ↑    ←    ↑    ←    ←    ↑    ↑  
      →    ↑    ↑    X    ↑    ↑    ←    ↑    G  
    
     SARSA
    Episode 0 completed
    Episode 500 completed
    Episode 1000 completed
    Episode 1500 completed
    Episode 2000 completed
    Episode 2500 completed
    Episode 3000 completed
    Episode 3500 completed
    Episode 4000 completed
    Episode 4500 completed
      ↓    →    ↓    →    ↓    X    ↓    ↓    ←  
      ↓    G    →    →    →    →    1    ←    ←  
      ↓    ↓    ↑    ↑    ↑    →    ↑    X    ↓  
      →    ↓    ←    ←    →    →    ↑    →    2  
      →    ↓    ↓    ↓    ←    ↑    ↑    →    ↑  
      X    ↓    ←    ↓    ←    G    →    →    ↑  
      →    4    ←    ←    ←    ←    →    →    ↑  
      →    ↑    ↑    ←    ↑    ←    ←    →    ↑  
      →    ↑    ↑    X    ↑    ←    ↑    ↑    G  
    
     N-Step SARSA
    Episode 0 completed
    Episode 500 completed
    Episode 1000 completed
    Episode 1500 completed
    Episode 2000 completed
    Episode 2500 completed
    Episode 3000 completed
    Episode 3500 completed
    Episode 4000 completed
    Episode 4500 completed
      ↓    ←    ←    ←    ↓    X    ↓    ←    ←  
      ↓    G    ↓    ↓    →    ↓    1    ↑    ←  
      ↓    →    →    ↓    ↓    ↓    ↑    X    ↓  
      →    →    ↓    →    →    ↓    ←    →    2  
      ↑    ←    ↓    ↓    →    →    ↓    →    ↑  
      X    ↓    ←    ←    ←    G    →    →    ↑  
      →    4    ↑    ←    ←    ←    →    →    ↑  
      ↑    ↑    ←    →    ↑    ←    ↑    →    ↑  
      →    ↑    ←    X    ↑    →    ↑    ←    G  
    


```python
import matplotlib.pyplot as plt

plt.figure(figsize=(12,8))
plt.plot(moving_average(on_episode_returns), label='On-policy')
plt.plot(moving_average(off_episode_returns), label='Off-policy')
plt.xlabel('Episode')
plt.ylabel('Average Return')
plt.legend()

plt.show()
```


    
![png](output_28_0.png)
    



```python
plt.figure(figsize=(12,8))
plt.plot(value_deltas_history, label='value-policy')
plt.plot(deltas_history, label='policy')
plt.xlabel('Episode')
plt.ylabel('Delta Decay')
plt.legend()
plt.show()
```


    
![png](output_29_0.png)
    



```python
plt.figure(figsize=(12,8))
plt.plot(moving_average(gradient_history), label='Q-Learning')
plt.plot(moving_average(sarsa_gradient_history), label='SARSA')
plt.plot(moving_average(n_sarsa_gradient_history), label='N-Step SARSA')
plt.xlabel('Episode')
plt.ylabel('TD Error')
plt.legend()
plt.show()
```


    
![png](output_30_0.png)
    



```python
start_pos=(0,0)
print("\n On Policy")
print_path(*start_pos,on_policy)
print("\n Off Policy")
print_path(*start_pos,off_policy)
print("\n Policy Iteration")
print_path(*start_pos,policy)
print("\n Value Iteration")
print_path(*start_pos,value_policy)
print("\n Q-Learning")
print_path(*start_pos,q_policy)
print("\n SARSA")
print_path(*start_pos,sarsa_policy)
print("\n N-Step SARSA")
print_path(*start_pos,n_sarsa_policy)
```

    
     On Policy
    
     Start from (0, 0) to Goal
       🏁      →      →      ↓      0      0      0      0      0   
       0      0      0      →      →      →      →      →      ↓   
       0      0      0      0      0      0      0      0      ↓   
       0      0      0      0      0      0      0      0      ↓   
       0      0      0      0      0      0      0      ↓      ←   
       0      0      0      0      0      🏁      0      ↓      0   
       0      →      →      →      →      ↑      ↓      ←      0   
       0      ↑      ←      ←      ←      ←      ←      0      0   
       0      0      0      0      0      0      0      0      0   
    
     Off Policy
    
     Start from (0, 0) to Goal
       🏁      →      →      →      →      →      ↓      0      0   
       0      0      0      0      0      0      →      →      ↓   
       0      0      0      0      0      0      0      0      ↓   
       0      0      0      0      0      0      0      0      ↓   
       0      0      0      0      0      0      0      0      ↓   
       0      0      →      →      →      🏁      0      ↓      ←   
       0      →      ↑←     ←      ←      ←      ←      ←      0   
       0      0      0      0      0      0      0      0      0   
       0      0      0      0      0      0      0      0      0   
    
     Policy Iteration
    
     Start from (0, 0) to Goal
       🏁      →      →      →      ↓      0      0      0      0   
       0      🏁      0      0      →      →      ↓      0      0   
       0      ↑      0      0      0      0      ↓      0      0   
       0      ↑      0      0      0      0      →      →      ↓   
       0      ↑      0      0      0      0      0      0      ↓   
       0      ↑      0      0      0      0      0      0      ↓   
       0      ↑      ←      ←      ←      ←      ←      ←      ←   
       0      0      0      0      0      0      0      0      0   
       0      0      0      0      0      0      0      0      0   
    
     Value Iteration
    
     Start from (0, 0) to Goal
       🏁      →      ↓      0      0      0      0      0      0   
       0      🏁      →      →      →      →      ↓      0      0   
       0      ↑      0      0      0      0      ↓      0      0   
       0      ↑      0      0      0      0      →      →      ↓   
       0      ↑      0      0      0      0      0      0      ↓   
       0      ↑      0      0      0      0      0      0      ↓   
       0      ↑      ←      ←      ←      ←      ←      ←      ←   
       0      0      0      0      0      0      0      0      0   
       0      0      0      0      0      0      0      0      0   
    
     Q-Learning
    
     Start from (0, 0) to Goal
       🏁      →      ↓      0      0      0      0      0      0   
       0      0      →      →      →      →      →      →      ↓   
       0      0      0      0      0      0      0      0      ↓   
       0      0      0      ↓      ←      ←      ←      ←      ←   
       0      0      ↓      ←      0      0      0      0      0   
       0      ↓→     ↔      →      →      🏁      0      0      0   
       0      ↑      0      0      0      0      0      0      0   
       0      0      0      0      0      0      0      0      0   
       0      0      0      0      0      0      0      0      0   
    
     SARSA
    
     Start from (0, 0) to Goal
       🏁      0      0      0      0      0      0      0      0   
       ↓      0      0      0      0      0      →      →      ↓   
       ↓      0      0      0      0      0      ↑      0      ↓   
       →      ↓      0      0      →      →      ↑      0      ↓   
       0      ↓      0      →      ↑      ↓      ←      ←      ←   
       0      ↓      →      ↑      0      🏁      0      0      0   
       0      →      ↑      0      0      0      0      0      0   
       0      0      0      0      0      0      0      0      0   
       0      0      0      0      0      0      0      0      0   
    
     N-Step SARSA
    
     Start from (0, 0) to Goal
       🏁      0      0      0      0      0      0      0      0   
       ↓      0      0      0      0      0      ↓      ←      ←   
       ↓      0      0      0      0      0      ↓      0      ↑   
       →      →      ↓      0      →      →      ↓→     →      ↑   
       0      0      ↓      →      ↑      0      ↓      0      0   
       0      ↓      ↔      ↑      0      🏁      ←      0      0   
       0      →      ↑      0      0      0      0      0      0   
       0      0      0      0      0      0      0      0      0   
       0      0      0      0      0      0      0      0      0   
    

# 六,网络模型


```python
import  torch
import  torch.nn as nn
import  torch.optim as optim
```


```python
a=torch.randint(0,10,(10,),dtype=torch.float32)
net=torch.nn.Linear(10,5)
b=net(torch.tensor([1]*10,dtype=torch.float32))
print(b)
```

    tensor([ 0.5811, -0.2161,  0.4089,  0.6695, -0.6427], grad_fn=<ViewBackward0>)
    


```python
class DQN(nn.Module):
    def __init__(self, input_dim, num_actions):
        super(DQN, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Linear(64, num_actions)
        )

    def forward(self, x):
        return self.net(x)
```


```python
import random
from collections import  deque
class DQNAgent:
    def __init__(self, input_dim, num_actions):
        self.num_actions = num_actions
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self.policy_net = DQN(input_dim, num_actions).to(self.device)
        self.target_net = DQN(input_dim, num_actions).to(self.device)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.target_net.eval()

        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=1e-3,  weight_decay=1e-5)
        # self.scheduler=  optim.lr_scheduler.ReduceLROnPlateau(
        #                     optimizer=self.optimizer,
        #                     mode='min',        # 监控的指标是 loss，越小越好
        #                     factor=0.5,        # 学习率乘以 0.5
        #                     patience=10,       # 等待 10 个 episode loss 没有下降才触发衰减
        #                     min_lr=1e-5        # 最小学率限制
        #                 )
        self.memory = deque(maxlen=10000)
        self.batch_size = 64
        self.gamma = 0.99
        self.epsilon = 1.0
        self.epsilon_min = 0.1
        self.epsilon_decay = 0.995

    def select_action(self, state):

        if np.random.rand() < self.epsilon:
            return np.random.randint(self.num_actions)
        else:
            with torch.no_grad():
                state = torch.FloatTensor(state).to(self.device)
                q_values = self.policy_net(state)
                return q_values.argmax().item()

    def store_transition(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def update(self):
        if len(self.memory) < self.batch_size:
            return

        batch = random.sample(self.memory, self.batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)

        states = torch.FloatTensor(np.array(states)).to(self.device)
        actions = torch.LongTensor(actions).unsqueeze(1).to(self.device)
        rewards = torch.FloatTensor(rewards).to(self.device)
        next_states = torch.FloatTensor(np.array(next_states)).to(self.device)
        dones = torch.FloatTensor(dones).to(self.device)
        current_q = self.policy_net(states).gather(1, actions).squeeze()
        next_q = self.target_net(next_states).max(1)[0]
        expected_q = rewards + (1 - dones) * self.gamma * next_q

        loss = nn.MSELoss()(current_q, expected_q.detach())
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        # 👇 将 loss 传给 scheduler
        # self.scheduler.step(loss.item())

        # # Epsilon decay
        # self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

        # 更新目标网络
        self.soft_update_target()
        return loss

    def soft_update_target(self, tau=0.01):
        for target_param, policy_param in zip(self.target_net.parameters(), self.policy_net.parameters()):
            target_param.data.copy_(tau * policy_param.data + (1 - tau) * target_param.data)
```


```python

def enviroment_reset():
    state=np.random.randint(SIZE*SIZE)
    mask=0 if state not in CHEST_STATES  else CHEST_STATES[state]
    return state,mask
def toTensor(state,mask):
    state_onehot = np.zeros(SIZE * SIZE)
    state_onehot[state] = 1
    bin_mask=list(map(int,bin(mask)[2:].zfill(len(CHEST_STATES))))
    mask_onehot = np.array(bin_mask)
    return torch.tensor(np.concatenate([state_onehot, mask_onehot]), dtype=torch.float32)
def train_dqn(episodes=1000, input_dim=84, num_actions=4):
    agent = DQNAgent(input_dim, num_actions)
    rewards_history = []

    for ep in range(episodes):
        state,mask=enviroment_reset()
        total_reward = 0
        total_loss=0
        tensor=toTensor(state,mask)
        done = state in GOAL_STATE
        if done:
            continue
        path_length=0
        while not done and path_length<81:
            path_length+=1
            action = agent.select_action(tensor)
            next_state,next_mask, reward, done= step(state,mask,action)
            next_tensor=toTensor(next_state,next_mask)
            agent.store_transition(tensor, action, reward, next_tensor, done)
            loss=agent.update()
            total_loss+=loss.item()  if loss is not None else 0
            total_reward += reward
            state = next_state
            mask=next_mask
            tensor=next_tensor
        avg_loss=total_loss/path_length
        rewards_history.append(avg_loss)
        agent.epsilon=max(agent.epsilon*agent.epsilon_decay,agent.epsilon_min)
        print(f"\rEpisode {ep+1}, Total Reward: {total_reward/path_length:.2f} Total Loss: {avg_loss:.2f}, Epsilon: {agent.epsilon:.2f}", end="")
        if 0<avg_loss<=0.01:
            break
    return agent, rewards_history
```


```python
agent,  rewards_history = train_dqn()
```

    Episode 1000, Total Reward: 37.47 Total Loss: 7.97, Epsilon: 0.100118


```python
import matplotlib.pyplot as plt
plt.plot(moving_average(rewards_history))
plt.xlabel("Episode")
plt.ylabel("Total Loss")
plt.title("Training Progress")
plt.show()
```


    
![png](output_39_0.png)
    



```python
policy=np.zeros(shape=(SIZE*SIZE,FULL_CHEST_MASK+1))
agent.target_net.eval()
for i in range(SIZE*SIZE):
    for j in range(FULL_CHEST_MASK+1):
        policy[i][j]=np.argmax(agent.target_net(toTensor(i,j).to('cuda')).cpu().detach().numpy())
```


```python
print_path(0,0,np.array(policy,dtype=int))
```

    
     Start from (0, 0) to Goal
       🏁      →      ↓      0      0      0      0      0      0   
       0      0      →      →      →      →      ↓      0      0   
       0      0      0      0      0      0      ↓      0      0   
       0      0      0      0      0      0      →      →      ↓   
       0      0      0      0      0      0      0      0      ↓   
       0      0      0      0      0      🏁      ↓      ←      ←   
       0      →      ↔      ↔      ↔      ↑←     ←      0      0   
       0      0      0      0      0      0      0      0      0   
       0      0      0      0      0      0      0      0      0   
    


```python
print_policy(np.array(policy,dtype=int))
```

      →    →    ↓    →    ↓    X    ↓    ←    ←  
      ↓    G    →    →    →    →    1    ←    ←  
      →    ↓    ↑    →    →    →    ↑    X    ↓  
      ↓    ↓    ↓    →    ↑    ↑    ↑    →    2  
      →    ↓    ←    ↓    ↑    →    →    →    ↑  
      X    ↓    ←    ←    ↓    G    →    →    ↑  
      →    4    ←    ←    ←    ←    →    →    ↑  
      →    ↑    ↑    ←    ←    ←    ↑    ↑    ↑  
      ↑    ↑    ←    X    ↑    ←    →    ↑    G  
    


```python
# torch.save(agent.target_net.state_dict(), "model.pt")
```


```python

```
