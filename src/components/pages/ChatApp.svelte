<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { MessageSquare, Send, Trash2 } from '@lucide/svelte';

  const QUICK_MESSAGES = [
    "Hello! Is anyone awake? 🌸",
    "I caught a rare Great White Shark! 🦈",
    "Hey Tom Nook, when is the next island upgrade? 🍃",
    "Blathers, I found a fossil! 🦉"
  ];

  let inputText = $state("");
  let isTyping = $state(false);
  let typingNpc = $state("");
  let chatEndRef: HTMLDivElement;
  let delayTimer: ReturnType<typeof setTimeout>;
  let timer: ReturnType<typeof setTimeout>;

  // Auto scroll
  $effect(() => {
    // depend on chatLog length
    const _len = nookState.chatLog.length;
    // depend on isTyping
    const _typing = isTyping;
    if (chatEndRef) {
      chatEndRef.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Simulator
  $effect(() => {
    if (nookState.chatLog.length === 0) return;
    const lastMsg = nookState.chatLog[nookState.chatLog.length - 1];

    if (!lastMsg.isNpc) {
      if (delayTimer) clearTimeout(delayTimer);
      if (timer) clearTimeout(timer);

      delayTimer = setTimeout(() => {
        isTyping = true;
        let npcName = "Someone";
        const lower = lastMsg.content.toLowerCase();
        if (lower.includes("hello") || lower.includes("hi") || lower.includes("awake")) {
          npcName = "Isabelle";
        } else if (lower.includes("shark") || lower.includes("fish") || lower.includes("fossil") || lower.includes("museum")) {
          npcName = "Blathers";
        } else if (lower.includes("nook") || lower.includes("upgrade") || lower.includes("loan") || lower.includes("tip")) {
          npcName = "Tom Nook";
        } else {
          npcName = "Resident";
        }
        typingNpc = npcName;
      }, 50);

      timer = setTimeout(() => {
        isTyping = false;
      }, 1200);
    }
    
    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (timer) clearTimeout(timer);
    };
  });

  const handleSend = () => {
    if (inputText.trim()) {
      nookState.sendChatMessage(nookState.passport.name, inputText.trim(), false);
      inputText = "";
    }
  };

  const handleQuickSend = (msg: string) => {
    nookState.sendChatMessage(nookState.passport.name, msg, false);
  };

  const handleClearLog = () => {
    if (confirm("Clear chat log history?")) {
      nookState.clearChatLog();
    }
  };
</script>

<div id="chat-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <div class="bg-[#afd485] text-[#344d18] p-4 pt-6 ac-wavy-header flex justify-between items-center z-10 shrink-0">
    <div>
      <h1 class="text-xl font-bold flex items-center gap-1.5">💬 Resident Chat</h1>
      <p class="text-xs opacity-90">Local co-op and resident log messages</p>
    </div>
    <button
      onclick={handleClearLog}
      class="text-[#344d18] p-2 rounded-full hover:bg-black/5"
      title="Clear logs"
    >
      <Trash2 class="w-4 h-4" />
    </button>
  </div>

  <!-- Main chat window -->
  <div class="flex-1 overflow-y-auto p-4 ac-scrollbar flex flex-col gap-3 bg-[#fdfdfc]/80">
    {#each nookState.chatLog as chat (chat.id)}
      {@const isPlayer = !chat.isNpc}
      <div
        class="flex items-start gap-2.5 max-w-[85%] {isPlayer ? 'self-end flex-row-reverse' : 'self-start'}"
      >
        <!-- NPC or Player Avatar icon -->
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm border {isPlayer ? 'bg-amber-100 border-[#edd8aa]' : 'bg-green-100 border-[#c5e69e]'}"
        >
          {chat.avatar || "🐾"}
        </div>

        <!-- Message Bubble Container -->
        <div class="flex flex-col gap-0.5">
          <span class="text-[9px] font-bold text-gray-400 {isPlayer ? 'text-right' : 'text-left'}">
            {chat.sender} • {chat.timestamp}
          </span>

          <div
            class="px-3 py-2 text-xs leading-relaxed shadow-sm {isPlayer
              ? 'bg-[#eaf3e2] text-green-900 rounded-2xl rounded-tr-none border border-green-200'
              : 'bg-[#fcfbf7] text-[#4c4637] rounded-2xl rounded-tl-none border border-gray-100'}"
          >
            {chat.content}
          </div>
        </div>
      </div>
    {/each}

    <!-- Typing simulator indicator bubble -->
    {#if isTyping}
      <div class="flex items-start gap-2.5 max-w-[80%] self-start animate-pulse">
        <div class="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-sm">
          💬
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-[9px] text-gray-400 font-bold">{typingNpc} is typing...</span>
          <div class="bg-[#fcfbf7] border border-gray-100 px-3 py-2 rounded-2xl rounded-tl-none text-xs flex gap-1 items-center">
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </div>
        </div>
      </div>
    {/if}

    {#if nookState.chatLog.length === 0}
      <div class="text-center py-20 text-gray-400 text-sm">
        <MessageSquare class="w-12 h-12 mx-auto opacity-25 mb-2" />
        No chat history found. Tap quick messages below to start talking!
      </div>
    {/if}

    <div bind:this={chatEndRef}></div>
  </div>

  <!-- Quick message templates drawer -->
  <div class="px-3 py-2 bg-[#f4f1e3] border-t border-[#e1d9be] flex flex-col gap-1 shrink-0">
    <span class="text-[9px] font-bold text-gray-500 uppercase tracking-wider px-1">Quick Messages</span>
    <div class="flex gap-1.5 overflow-x-auto pb-1 ac-scrollbar">
      {#each QUICK_MESSAGES as msg}
        <button
          onclick={() => handleQuickSend(msg)}
          class="bg-white hover:bg-gray-50 text-[11px] text-gray-700 px-2.5 py-1.5 rounded-xl shrink-0 font-semibold border border-[#dcd3be] shadow-sm active:scale-95 transition-all"
        >
          {msg}
        </button>
      {/each}
    </div>
  </div>

  <!-- Input keyboard bar -->
  <div class="p-3 bg-white border-t border-[#e1d9be] flex gap-2 shrink-0 items-center">
    <input
      id="chat-message-input"
      type="text"
      placeholder="Send a message to Resident Services..."
      bind:value={inputText}
      onkeydown={(e) => e.key === "Enter" && handleSend()}
      class="flex-1 bg-[#fbf9f0] border border-[#dcd3be] p-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#afd485] text-[#4c4637]"
    />
    <button
      onclick={handleSend}
      class="bg-[#afd485] text-white p-2 rounded-xl hover:bg-opacity-95 transition shadow-sm"
    >
      <Send class="w-4 h-4" />
    </button>
  </div>
</div>
