<template>
  <div class="container text-secondary">
    <div class="chat-scroll">
      <div v-for="(msg, index) in messages" :key="index" class="message-bubble  bg-card">
        <div v-if="msg.role === 'user'" class="user">{{ msg.content }}</div>
        <QMarkdownRender v-else :content="msg.content" class="bot" />
      </div>
    </div>

    <div class="input-box ">
      <textarea
          class="form-control"
          v-model="inputText"
          @keyup.enter="sendMessage"
          placeholder="输入你的问题..."
          maxlength="10000"
      ></textarea>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import {QMarkdownRender} from "qyani-components";

defineOptions({
  name: 'ChatAI',
})
const inputText = ref('');
const messages = ref<Array<{role: string, content: string}>>([]);
const answer_finished = ref(true);

async function sendMessage() {
  if (!answer_finished.value) {
    alert('请等待聊天助手回复完成');
    return;
  }
  if (!inputText.value.trim()) return;

  answer_finished.value = false;
  const userMsg = {
    role: 'user',
    content: inputText.value,
  };

  messages.value.push(userMsg);
  messages.value.push({
    role: 'assistant',
    content: '',
  });

  inputText.value = '';
  const session_id = 'default';

  try {
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_input: userMsg.content,
        session_id,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const assistantIndex = messages.value.length - 1;

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      messages.value[assistantIndex].content += chunk;
    }
  } catch (error) {
    console.log(error);
    alert('聊天助手正在闭关,敬请期待!');
  } finally {
    answer_finished.value = true;
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: var(--content-height-without-header);
}

.chat-scroll {
  flex: 1;
  padding: 20px;
  width: 100%;
  max-height: 75vh;
  overflow-y: auto;
}
.chat-scroll::-webkit-scrollbar {
  display: none;
}

.message-bubble {
  margin-bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.user {
  width: 100%;
  text-align: right;
  border-radius: 20px 8px 20px 20px;
  padding: 5px;
  word-wrap: break-word;
  font-size: 14px;
}

.bot {
  border-radius: 8px 20px 20px 20px;
  width: 100%;
  padding: 5px;
  font-size: 14px;
}

.input-box {
  width: 100%;
  height: 20vh;
  display: flex;
  padding: 10px;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.05);
  z-index: 999;
}

textarea {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  border-radius: 5px;
  min-height: 40px;
  resize: none;
}

</style>