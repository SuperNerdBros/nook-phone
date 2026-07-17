<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { ArrowLeft, Send, Search, CheckCheck, MessageSquare } from '@lucide/svelte';
  import nookState from '@/lib/nookState.svelte';
  import { fetchConversations, fetchDirectMessages, sendDirectMessage, fetchNookUsers, isProUser } from '@/lib/api';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';

  interface Conversation {
    partner_id: number;
    partner_name: string;
    last_message: string;
    date: string;
    unread_count: number;
  }

  interface Message {
    id: number;
    sender_id: number;
    content: string;
    date: string;
    is_read: boolean;
  }

  let conversations = $state<Conversation[]>([]);
  let users = $state<any[]>([]);
  let activeChatPartner = $state<any | null>(null);
  let messages = $state<Message[]>([]);
  let newMessage = $state('');
  let view = $state<"inbox" | "chat" | "new">("inbox");
  let loading = $state(true);
  let sending = $state(false);
  let searchQuery = $state('');
  
  // Mock data for guests
  const MOCK_CONVERSATIONS: Conversation[] = [
    { partner_id: 1, partner_name: "Tom Nook", last_message: "Your loan is due, yes, yes!", date: new Date().toISOString(), unread_count: 1 },
    { partner_id: 2, partner_name: "Isabelle", last_message: "Here are the morning announcements!", date: new Date(Date.now() - 3600000).toISOString(), unread_count: 0 }
  ];
  const MOCK_MESSAGES: Message[] = [
    { id: 1, sender_id: 1, content: "Hello! Have you checked your mail?", date: new Date(Date.now() - 7200000).toISOString(), is_read: true },
    { id: 2, sender_id: 0, content: "Yes, I got it!", date: new Date(Date.now() - 3600000).toISOString(), is_read: true },
    { id: 3, sender_id: 1, content: "Your loan is due, yes, yes!", date: new Date().toISOString(), is_read: false }
  ];
  const MOCK_USERS = [
    { ID: 1, display_name: "Tom Nook" },
    { ID: 2, display_name: "Isabelle" },
    { ID: 3, display_name: "Timmy" },
    { ID: 4, display_name: "Tommy" }
  ];

  onMount(async () => {
    if (isProUser()) {
      conversations = await fetchConversations();
    } else {
      conversations = MOCK_CONVERSATIONS;
    }
    if (nookState.activeChatPartner) {
      loadChat(nookState.activeChatPartner.id, nookState.activeChatPartner.name);
      nookState.activeChatPartner = null;
    }
    loading = false;
  });

  const loadChat = async (partnerId: number, partnerName: string) => {
    activeChatPartner = { id: partnerId, name: partnerName };
    view = "chat";
    messages = [];
    
    if (isProUser()) {
      messages = await fetchDirectMessages(partnerId);
    } else {
      messages = MOCK_MESSAGES.map(m => m.sender_id === partnerId || m.sender_id === 0 ? m : null).filter(Boolean) as Message[];
    }
  };

  const loadNewChat = async () => {
    view = "new";
    if (isProUser()) {
      users = await fetchNookUsers();
    } else {
      users = MOCK_USERS;
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChatPartner) return;
    
    sending = true;
    if (isProUser()) {
      const result = await sendDirectMessage(activeChatPartner.id, newMessage);
      if (result && result.success) {
        messages = [...messages, {
          id: result.dm_id,
          sender_id: nookState.passport.name ? 0 : 0, // Current user id conceptually (is_read doesn't matter for sent)
          content: newMessage,
          date: result.date,
          is_read: false
        }];
        newMessage = "";
      }
    } else {
      // Mock send
      messages = [...messages, {
        id: Date.now(),
        sender_id: 0, // 0 is mock current user
        content: newMessage,
        date: new Date().toISOString(),
        is_read: false
      }];
      newMessage = "";
    }
    sending = false;
  };

  const filteredUsers = $derived(users.filter(u => u.display_name.toLowerCase().includes(searchQuery.toLowerCase())));

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
</script>

<div class="flex flex-col h-full bg-[#f9f8f2] ac-app-screen relative">
  <!-- HEADER -->
  <NookAppHeader 
    title={view === "inbox" ? "Messages" : view === "chat" ? activeChatPartner?.name : "New Message"}
    subtitle={view === "inbox" ? "Direct Messages" : ""}
    bgClass="bg-[#8bd168]"
    textClass="text-white"
  >
    {#snippet iconSnippet()}
      {#if view !== "inbox"}
        <button 
          onclick={() => view = "inbox"}
          class="bg-white/30 hover:bg-white/50 text-white border-0 p-1.5 rounded-full cursor-pointer transition active:scale-95 mr-2"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
      {/if}
    {/snippet}
    {#snippet actions()}
      {#if view === "inbox"}
        <button 
          onclick={loadNewChat}
          class="bg-white/30 hover:bg-white/50 text-white border-0 p-1.5 rounded-full cursor-pointer transition active:scale-95"
        >
          <MessageSquare class="w-4 h-4" />
        </button>
      {/if}
    {/snippet}
  </NookAppHeader>

  <!-- VIEWS -->
  <div class="flex-1 overflow-hidden relative">
    {#if view === "inbox"}
      <div in:fade={{duration: 200}} class="h-full overflow-y-auto ac-scrollbar p-3 space-y-2">
        {#if !isProUser()}
          <div class="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-xl text-xs font-bold text-center mb-3">
            Preview Mode: DMs require a Pro (Logged in) account.
          </div>
        {/if}

        {#if loading}
          <div class="text-center text-gray-400 p-10 text-xs font-bold animate-pulse">Loading...</div>
        {:else if conversations.length === 0}
          <div class="text-center text-gray-400 p-10 flex flex-col items-center">
            <MessageSquare class="w-8 h-8 mb-2 opacity-50" />
            <span class="text-xs font-bold">No messages yet.</span>
          </div>
        {:else}
          {#each conversations as conv}
            <button
              onclick={() => loadChat(conv.partner_id, conv.partner_name)}
              class="w-full bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3 text-left hover:border-[#8bd168] hover:shadow-sm transition cursor-pointer active:scale-95"
            >
              <div class="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-xl shrink-0">
                👤
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-baseline mb-0.5">
                  <span class="font-extrabold text-sm text-[#4c4637] truncate">{conv.partner_name}</span>
                  <span class="text-[9px] font-bold text-gray-400 shrink-0">{formatDate(conv.date)}</span>
                </div>
                <p class="text-xs text-gray-500 m-0 truncate leading-snug">{conv.last_message}</p>
              </div>
              {#if conv.unread_count > 0}
                <div class="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">
                  {conv.unread_count}
                </div>
              {/if}
            </button>
          {/each}
        {/if}
      </div>
    
    {:else if view === "new"}
      <div in:fly={{y: 20, duration: 200}} class="h-full flex flex-col bg-white">
        <div class="p-3 border-b border-gray-100 sticky top-0 bg-white z-10 shrink-0">
          <div class="relative">
            <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              bind:value={searchQuery}
              placeholder="Search Residents..." 
              class="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-9 pr-4 text-xs font-bold text-[#4c4637] focus:outline-none focus:border-[#8bd168] focus:bg-white transition"
            />
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-2">
          {#each filteredUsers as user}
            <button
              onclick={() => loadChat(user.ID, user.display_name)}
              class="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-xl cursor-pointer text-left border-0 bg-transparent transition active:bg-gray-100"
            >
              <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                {user.display_name.charAt(0).toUpperCase()}
              </div>
              <span class="font-bold text-sm text-[#4c4637]">{user.display_name}</span>
            </button>
          {/each}
        </div>
      </div>

    {:else if view === "chat"}
      <div in:fly={{x: 20, duration: 200}} class="h-full flex flex-col">
        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
          {#each messages as msg}
            {@const isMe = (!isProUser() && msg.sender_id === 0) || (isProUser() && msg.sender_id !== activeChatPartner?.id)}
            <div class={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
              <div class={`px-3 py-2 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${isMe ? 'bg-[#8bd168] text-white rounded-br-sm' : 'bg-white border border-gray-100 text-[#4c4637] rounded-bl-sm'}`}>
                {msg.content}
              </div>
              <div class="flex items-center gap-1 mt-0.5 px-1">
                <span class="text-[8px] font-bold text-gray-400">{formatDate(msg.date)}</span>
                {#if isMe}
                  <CheckCheck class={`w-3 h-3 ${msg.is_read ? 'text-[#8bd168]' : 'text-gray-300'}`} />
                {/if}
              </div>
            </div>
          {/each}
        </div>

        <!-- Input Area -->
        <div class="p-3 bg-white border-t border-gray-100 shrink-0 flex gap-2 items-end">
          <textarea
            bind:value={newMessage}
            placeholder="NookMessage..."
            rows="1"
            class="flex-1 bg-gray-50 border border-gray-200 rounded-2xl py-2 px-3 text-xs font-bold resize-none focus:outline-none focus:border-[#8bd168] focus:bg-white transition ac-scrollbar max-h-24"
            onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          ></textarea>
          <button 
            onclick={handleSend}
            disabled={!newMessage.trim() || sending}
            class="bg-[#8bd168] text-white p-2 rounded-full cursor-pointer hover:bg-[#7bc059] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 h-9 w-9"
          >
            <Send class="w-4 h-4 -ml-0.5" />
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
