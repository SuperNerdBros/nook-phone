<script lang="ts">
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { ArrowLeft, Send, Search, CheckCheck, MessageSquare , X } from '@lucide/svelte';
  import nookState from '@/lib/nookState.svelte';
  import { fetchConversations, fetchDirectMessages, sendDirectMessage, fetchNookUsers, isProUser } from '@/lib/api';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';

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

  const ctx = getPhoneContext();
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

<style>
  /* Premium Animated Bubble Background */
  .animated-bg {
    background: linear-gradient(-45deg, #2b1a1a, #5c2a2a, #8b3a3a, #3d1c1c);
    background-size: 400% 400%;
    animation: gradientBG 15s ease infinite;
    position: relative;
    overflow: hidden;
  }
  
  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animated-bg::before, .animated-bg::after {
    content: '';
    position: absolute;
    width: 150vw;
    height: 150vw;
    background: radial-gradient(circle, rgba(139, 58, 58, 0.15) 0%, transparent 60%);
    animation: float 20s infinite linear;
    pointer-events: none;
    z-index: 0;
  }
  .animated-bg::before {
    top: -50%;
    left: -50%;
  }
  .animated-bg::after {
    bottom: -50%;
    right: -50%;
    animation-direction: reverse;
    animation-duration: 25s;
  }

  @keyframes float {
    0% { transform: rotate(0deg) translate(20px) rotate(0deg); }
    100% { transform: rotate(360deg) translate(20px) rotate(-360deg); }
  }

  /* Envelope Item Style */
  .envelope-item {
    background-color: #fcfaf5;
    position: relative;
    border: 2px solid #e1d9be;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(139, 58, 58, 0.1);
    overflow: hidden;
  }
  
  .envelope-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    /* Create an envelope flap crease effect */
    background: 
      linear-gradient(to bottom right, transparent 49.5%, rgba(225, 217, 190, 0.4) 50%, transparent 50.5%) 0 0 / 50% 40px no-repeat,
      linear-gradient(to bottom left, transparent 49.5%, rgba(225, 217, 190, 0.4) 50%, transparent 50.5%) 100% 0 / 50% 40px no-repeat;
    pointer-events: none;
    z-index: 1;
  }
  
  .envelope-item::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: repeating-linear-gradient(
      45deg,
      #8b3a3a,
      #8b3a3a 15px,
      transparent 15px,
      transparent 30px,
      #4a5e78 30px,
      #4a5e78 45px,
      transparent 45px,
      transparent 60px
    );
    opacity: 0.8;
  }
</style>

<div class="flex flex-col h-full ac-app-screen relative animated-bg">
  <!-- HEADER -->
  <NookAppHeader 
    title={view === "inbox" ? "Messages" : view === "chat" ? activeChatPartner?.name : "New Message"}
    subtitle={view === "inbox" ? "Direct Messages" : ""}
    bgClass="bg-[#8b3a3a]"
    textClass="text-white"
  >
    {#snippet iconSnippet()}
      {#if view !== "inbox"}
        <NookToolbarButton 
          variant="ghost"
          onclick={() => view = "inbox"}
          class="mr-2"
        >
          <ArrowLeft class="w-4 h-4" />
        </NookToolbarButton>
      {:else}
        <div class="w-12 h-12 mr-1">
          <NookIcon name="mail" class="w-full h-full object-contain drop-shadow-sm" />
        </div>
      {/if}
    {/snippet}
    {#snippet actions()}
      {#if view === "inbox"}
        <NookToolbarButton 
          variant="ghost"
          onclick={loadNewChat}
        >
          <MessageSquare class="w-4 h-4" />
        </NookToolbarButton>
      {/if}
      <NookToolbarButton variant="ghost" onclick={ctx.handleHomeButton} title="Close App"><X class="w-3.5 h-3.5 stroke-[3px]" /></NookToolbarButton>
    {/snippet}
  </NookAppHeader>

  <!-- VIEWS -->
  <div class="flex-1 overflow-hidden relative z-10">
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
              class="envelope-item w-full p-4 pt-5 pb-5 flex items-center gap-3 text-left hover:border-[#8b3a3a] hover:shadow-[0_8px_20px_rgba(139,58,58,0.2)] transition-all cursor-pointer active:scale-95 group"
            >
              <!-- Wax Seal Avatar -->
              <div class="w-12 h-12 rounded-full bg-[#8b3a3a] text-[#fcfaf5] border-2 border-[#6a2c2c] shadow-inner flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform relative z-10" style="box-shadow: inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.1);">
                <div class="absolute inset-0 rounded-full border border-white/20"></div>
                👤
              </div>
              <div class="flex-1 min-w-0 relative z-10">
                <div class="flex justify-between items-baseline mb-0.5">
                  <span class="font-extrabold text-[15px] text-[#4c4637] truncate drop-shadow-sm">{conv.partner_name}</span>
                  <!-- Stamp for date -->
                  <div class="bg-white/80 px-2 py-0.5 border border-dashed border-[#dcd3be] text-[9px] font-bold text-[#8a7f66] shrink-0 rotate-2">
                    {formatDate(conv.date)}
                  </div>
                </div>
                <p class="text-[12px] text-[#8a7f66] m-0 truncate leading-snug font-medium italic">"{conv.last_message}"</p>
              </div>
              {#if conv.unread_count > 0}
                <div class="absolute top-2 right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 shadow-md z-10 border-2 border-white">
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
              class="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-9 pr-4 text-xs font-bold text-[#4c4637] focus:outline-none focus:border-[#8b3a3a] focus:bg-white transition"
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
              <div class={`px-3 py-2 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${isMe ? 'bg-[#8b3a3a] text-white rounded-br-sm' : 'bg-white border border-gray-100 text-[#4c4637] rounded-bl-sm'}`}>
                {msg.content}
              </div>
              <div class="flex items-center gap-1 mt-0.5 px-1">
                <span class="text-[8px] font-bold text-white/60">{formatDate(msg.date)}</span>
                {#if isMe}
                  <CheckCheck class={`w-3 h-3 ${msg.is_read ? 'text-[#8b3a3a]' : 'text-white/40'}`} />
                {/if}
              </div>
            </div>
          {/each}
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white/80 backdrop-blur-md border-t border-white/50 shrink-0 flex gap-3 items-end shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-20">
          <textarea
            bind:value={newMessage}
            placeholder="Type a message..."
            rows="1"
            class="flex-1 bg-white border-2 border-[#e6e2d3] rounded-3xl py-3 px-4 text-[13px] font-bold resize-none focus:outline-none focus:border-[#8b3a3a] focus:ring-4 focus:ring-[#8b3a3a]/20 transition-all ac-scrollbar max-h-24 shadow-inner"
            onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          ></textarea>
          <button 
            onclick={handleSend}
            disabled={!newMessage.trim() || sending}
            class="bg-gradient-to-br from-[#8b3a3a] to-[#6a2c2c] text-white p-3 rounded-full cursor-pointer hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 h-11 w-11 shadow-[0_4px_10px_rgba(139,58,58,0.3)]"
          >
            <Send class="w-5 h-5 -ml-0.5 stroke-[2.5px]" />
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
