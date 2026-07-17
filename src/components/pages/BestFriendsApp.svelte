<script lang="ts">
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { Search, Heart, Wifi, WifiOff, MessageSquare, RefreshCw, Send, Check , X } from '@lucide/svelte';
  import nookState from '@/lib/nookState.svelte';
  import { fetchNookUsers, fetchPassports, isProUser, sendDirectMessage } from '@/lib/api';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';

  interface Friend {
    id: number;
    name: string;
    islandName: string;
    avatar: string;
    isActive: boolean;
    isBestFriend: boolean;
  }

  const ctx = getPhoneContext();
  let friends = $state<Friend[]>([]);
  let loading = $state(true);
  let searchQuery = $state("");
  let activeTab = $state<'all' | 'best'>('best');
  let selectedFriendForMenu = $state<Friend | null>(null);

  // Broadcast modal
  let showBroadcastModal = $state(false);
  let broadcastText = $state("");
  let broadcasting = $state(false);
  let broadcastSuccess = $state(false);

  // Connection status toggle
  let isOnline = $derived(nookState.bestFriendsCommunicationsOn);

  // Load all users and passports
  async function loadFriends() {
    loading = true;
    try {
      const users = await fetchNookUsers();
      const passports = await fetchPassports();

      friends = users.map((u: any) => {
        // Match passport to get islandName and photo
        const passport = passports.find((p: any) => p.userId === u.ID || p.name === u.display_name);
        
        // Deterministic active status based on ID so it stays stable
        const isActive = (u.ID % 2 === 0);

        return {
          id: u.ID,
          name: u.display_name,
          islandName: passport?.islandName || "Nook Island",
          avatar: passport?.photoUrl || `https://picsum.photos/seed/${u.display_name}/100/100`,
          isActive,
          isBestFriend: nookState.isBestFriend(u.ID)
        };
      });

      // Default first user to best friend if list is empty
      if (friends.length > 0 && nookState.bestFriends.length === 0) {
        nookState.toggleBestFriend(friends[0].id);
        friends[0].isBestFriend = true;
      }
    } catch (e) {
      console.error("Failed to load Best Friends data:", e);
    }
    loading = false;
  }

  function sendMessageToFriend(friend: Friend) {
    nookState.activeChatPartner = { id: friend.id, name: friend.name };
    nookState.navigate('messages');
  }

  function toggleBestFriendStatus(friend: Friend) {
    nookState.toggleBestFriend(friend.id);
    friend.isBestFriend = !friend.isBestFriend;
    friends = [...friends];
    selectedFriendForMenu = null;
  }

  function toggleCommunications() {
    nookState.toggleBestFriendsCommunications();
  }

  async function handleSendBroadcast() {
    if (!broadcastText.trim()) return;
    broadcasting = true;

    // Find all online best friends
    const onlineBestFriends = friends.filter(f => f.isBestFriend && f.isActive);

    if (onlineBestFriends.length === 0) {
      alert("No active Best Friends are online to receive this broadcast!");
      broadcasting = false;
      return;
    }

    try {
      for (const friend of onlineBestFriends) {
        if (isProUser()) {
          await sendDirectMessage(friend.id, broadcastText);
        } else {
          nookState.sendChatMessage(friend.name, broadcastText, false);
        }
      }
      broadcastSuccess = true;
      broadcastText = "";
      setTimeout(() => {
        showBroadcastModal = false;
        broadcastSuccess = false;
      }, 1500);
    } catch (e) {
      console.error("Broadcast failed:", e);
    }
    broadcasting = false;
  }

  // Filter friends based on tab and search query
  const filteredFriends = $derived(
    friends.filter(f => {
      if (activeTab === 'best' && !f.isBestFriend) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return f.name.toLowerCase().includes(query) || f.islandName.toLowerCase().includes(query);
      }
      return true;
    }).sort((a, b) => {
      // Sort active friends first, then alphabetically
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return a.name.localeCompare(b.name);
    })
  );

  onMount(() => {
    loadFriends();
  });
</script>

<div class="flex flex-col h-full bg-[#fdfcf2] relative ac-app-screen select-none">
  <!-- HEADER -->
  <NookAppHeader 
    title="💛 Best Friends" 
    subtitle="Friend list and Broadcast"
    bgClass="bg-[#ffb380]"
    textClass="text-white"
  >
    {#snippet actions()}
      <button 
        onclick={loadFriends}
        class="bg-white/30 hover:bg-white/50 text-white border-0 p-1.5 rounded-full cursor-pointer transition active:scale-95 flex items-center justify-center"
      >
        <RefreshCw class="w-4 h-4" />
      </button>
      <button onclick={ctx.handleHomeButton} class="nook-header-btn" title="Close App"><X class="w-3.5 h-3.5 stroke-[3px]" /></button>
    {/snippet}
  </NookAppHeader>

  <!-- SEARCH & TABS -->
  <div class="p-3 bg-[#fbf9ed] border-b border-[#efecd3] flex flex-col gap-2 shrink-0">
    <!-- Search Bar -->
    <div class="relative">
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder="Search friends or islands..."
        class="w-full bg-[#f4f2de] border border-[#d6cfa8] rounded-full py-1.5 pl-4 pr-10 text-xs font-black text-[#5c3a21] placeholder-[#b8b08e] focus:outline-none focus:border-[#ffb380] focus:bg-white transition"
      />
      <div class="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8b08e] text-xs">🔍</div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button 
        onclick={() => activeTab = 'best'}
        class={`flex-1 py-1.5 px-3 rounded-full text-xs font-black text-center cursor-pointer transition-all border ${activeTab === 'best' ? 'bg-[#ffb380] text-white border-[#f19b60] shadow-sm' : 'bg-[#f4f2de] text-[#8a7f66] border-[#d6cfa8] hover:bg-white'}`}
      >
        💛 Best Friends
      </button>
      <button 
        onclick={() => activeTab = 'all'}
        class={`flex-1 py-1.5 px-3 rounded-full text-xs font-black text-center cursor-pointer transition-all border ${activeTab === 'all' ? 'bg-[#ffb380] text-white border-[#f19b60] shadow-sm' : 'bg-[#f4f2de] text-[#8a7f66] border-[#d6cfa8] hover:bg-white'}`}
      >
        👥 All Friends
      </button>
    </div>
  </div>

  <!-- FRIENDS LIST -->
  <div class="flex-1 overflow-y-auto ac-scrollbar p-3 space-y-2.5">
    {#if !isProUser()}
      <div class="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-2xl text-xs font-bold text-center">
        Preview Mode: Friends list uses local sandbox accounts.
      </div>
    {/if}

    {#if loading}
      <div class="text-center text-[#8a7f66] font-black text-xs py-10 animate-pulse">Loading friends list...</div>
    {:else if filteredFriends.length === 0}
      <div class="text-center text-[#b8b08e] py-12 flex flex-col items-center">
        <span class="text-3xl mb-2">🏝️</span>
        <span class="text-xs font-black">No friends found.</span>
      </div>
    {:else}
      {#each filteredFriends as friend (friend.id)}
        <button
          onclick={() => selectedFriendForMenu = friend}
          class="w-full bg-[#fdfcf5] border-2 border-[#ebdcb5] hover:border-[#ffb380] rounded-2xl p-3 flex items-center gap-3 text-left transition-all active:scale-[0.98] shadow-sm hover:shadow"
        >
          <!-- Avatar + Heart Overlay -->
          <div class="relative shrink-0">
            <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-[#e2dcb6]">
              <img src={friend.avatar} alt={friend.name} class="w-full h-full object-cover scale-110" />
            </div>
            {#if friend.isBestFriend}
              <div class="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-0.5 border border-white shadow-sm">
                <Heart class="w-3.5 h-3.5 fill-current text-yellow-600" />
              </div>
            {/if}
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="font-black text-sm text-[#5c3a21] truncate">{friend.name}</span>
            </div>
            <div class="flex items-center gap-1 text-[10px] font-black text-[#8a7f66] truncate">
              <span>🌴 {friend.islandName}</span>
            </div>
          </div>

          <!-- Status Indicator -->
          <div class="shrink-0 flex items-center">
            {#if isOnline && friend.isActive}
              <div class="bg-[#5cc56c] text-white px-2.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 shadow-sm">
                <Wifi class="w-3 h-3" /> Active
              </div>
            {:else}
              <div class="bg-gray-300 text-gray-500 px-2.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1">
                <WifiOff class="w-3 h-3" /> Offline
              </div>
            {/if}
          </div>
        </button>
      {/each}
    {/if}
  </div>

  <!-- BOTTOM BAR / DOCK -->
  <div class="p-3 bg-[#fbf9ed] border-t border-[#efecd3] flex items-center justify-between shrink-0">
    <!-- Communications Status -->
    <button 
      onclick={toggleCommunications}
      class="flex items-center gap-2 px-3 py-2 rounded-full shadow-sm border border-[#ebdcb5] transition cursor-pointer active:scale-95"
      class:bg-[#5cc56c]={isOnline}
      class:text-white={isOnline}
      class:border-[#4ab059]={isOnline}
      class:bg-gray-100={!isOnline}
      class:text-gray-500={!isOnline}
    >
      <Wifi class="w-4 h-4" />
      <span class="text-xs font-black">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
    </button>

    <!-- Broadcast Button -->
    <button 
      onclick={() => showBroadcastModal = true}
      disabled={!isOnline || friends.filter(f => f.isBestFriend && f.isActive).length === 0}
      class="bg-[#ffb380] hover:bg-[#ef9e68] disabled:bg-gray-200 disabled:text-gray-400 disabled:border-transparent text-white border border-[#f19b60] py-2 px-4 rounded-full font-black text-xs cursor-pointer active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
    >
      📢 Send to all.
    </button>
  </div>

  <!-- SPEECH BUBBLE SUBMENU / TOOLTIP POPUP -->
  {#if selectedFriendForMenu}
    <!-- Backdrop to close -->
    <button 
      onclick={() => selectedFriendForMenu = null}
      class="absolute inset-0 bg-black/15 z-30 w-full h-full border-0 bg-transparent text-left p-0 cursor-default"
      aria-label="Dismiss menu"
    ></button>

    <div class="absolute inset-x-6 bottom-20 z-40 bg-[#fffbe5] border-4 border-[#e9dbb5] rounded-3xl p-5 shadow-2xl animate-fade-in">
      <h3 class="text-[#5c3a21] font-black text-center mb-4 text-sm flex items-center justify-center gap-1">
        <span>💛</span> {selectedFriendForMenu.name} ({selectedFriendForMenu.islandName})
      </h3>
      <div class="flex flex-col gap-2">
        <button 
          onclick={() => sendMessageToFriend(selectedFriendForMenu!)}
          class="w-full bg-[#f8f5dd] hover:bg-[#ebd281] border-2 border-[#d6c79f] text-[#5c3a21] py-3.5 px-4 rounded-2xl font-black text-sm text-center cursor-pointer active:scale-[0.98] transition-all"
        >
          Send Message
        </button>
        <button 
          onclick={() => toggleBestFriendStatus(selectedFriendForMenu!)}
          class="w-full bg-[#f8f5dd] hover:bg-[#ebd281] border-2 border-[#d6c79f] text-[#5c3a21] py-3.5 px-4 rounded-2xl font-black text-sm text-center cursor-pointer active:scale-[0.98] transition-all"
        >
          {selectedFriendForMenu.isBestFriend ? 'Quit Being Best Friends' : 'Make Best Friend'}
        </button>
        <button 
          onclick={() => selectedFriendForMenu = null}
          class="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-500 py-2.5 px-4 rounded-2xl font-black text-xs text-center cursor-pointer active:scale-[0.98] transition-all mt-1"
        >
          Cancel
        </button>
      </div>
    </div>
  {/if}

  <!-- BROADCAST MODAL -->
  {#if showBroadcastModal}
    <div class="absolute inset-0 bg-black/35 z-50 flex items-center justify-center p-6" transition:fade={{duration: 150}}>
      <div class="bg-[#fffbe5] border-4 border-[#e9dbb5] rounded-3xl p-5 w-full shadow-2xl animate-scale-up">
        <h3 class="text-[#5c3a21] font-black text-center mb-1 text-base">📢 Broadcast Message</h3>
        <p class="text-[10px] text-[#8a7f66] font-bold text-center mb-4">This will send a message to all active, online Best Friends.</p>

        {#if broadcastSuccess}
          <div class="flex flex-col items-center justify-center py-6 text-[#5cc56c] font-black text-sm animate-bounce">
            <Check class="w-8 h-8 mb-1" /> Broadcast sent successfully!
          </div>
        {:else}
          <textarea 
            bind:value={broadcastText}
            placeholder="Type your announcement..."
            rows="3"
            class="w-full bg-[#f4f2de] border-2 border-[#ebdcb5] rounded-2xl p-3 text-xs font-black text-[#5c3a21] placeholder-[#b8b08e] focus:outline-none focus:bg-white focus:border-[#ffb380] transition resize-none ac-scrollbar mb-4"
          ></textarea>

          <div class="flex gap-3.5 justify-between">
            <button 
              onclick={() => showBroadcastModal = false}
              class="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-500 py-2.5 rounded-2xl font-black text-xs text-center cursor-pointer active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button 
              onclick={handleSendBroadcast}
              disabled={!broadcastText.trim() || broadcasting}
              class="flex-1 bg-[#ffb380] hover:bg-[#ef9e68] disabled:bg-gray-300 disabled:text-gray-400 border-2 border-[#f19b60] text-white py-2.5 rounded-2xl font-black text-xs text-center cursor-pointer active:scale-95 transition-all"
            >
              {broadcasting ? 'Sending...' : 'Broadcast'}
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .animate-fade-in {
    animation: fadeIn 0.15s ease-out forwards;
  }
  .animate-scale-up {
    animation: scaleUp 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleUp {
    from { transform: scale(0.9) translateY(10px); opacity: 0; }
    to { transform: scale(1) translateY(0); opacity: 1; }
  }
</style>
