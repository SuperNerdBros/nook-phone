<script lang="ts">
  import { Bell, Trash2, X, Inbox } from "@lucide/svelte";
  import { fly } from 'svelte/transition';
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';

  const ctx = getPhoneContext();
</script>

{#if ctx.showNotificationCenter}
  <div
    transition:fly={{ y: -500, duration: 300 }}
    class="absolute inset-0 bg-[#f8f5e6]/95 backdrop-blur-md z-45 flex flex-col p-5 pt-16 border-b border-[#d1cbb0]"
  >
    <div class="flex justify-between items-center mb-4 shrink-0">
      <h2 class="text-sm font-black text-[#5d5a4a] flex items-center gap-1.5 m-0 uppercase tracking-wider">
        <Bell class="w-4 h-4 text-orange-500 fill-orange-500/20" /> Notifications
      </h2>
      <div class="flex gap-2">
        {#if nookState.notifications.length > 0}
          <button 
            onclick={() => nookState.clearNotifications()} 
            class="bg-red-500 hover:bg-red-600 text-white border-0 py-1 px-2.5 rounded-full text-[9px] font-black flex items-center gap-1 transition shadow-sm cursor-pointer active:scale-95 uppercase tracking-wider"
          >
            <Trash2 class="w-3 h-3" /> Clear All
          </button>
        {/if}
        <button 
          onclick={() => ctx.showNotificationCenter = false} 
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0 p-1.5 rounded-full flex items-center justify-center transition cursor-pointer active:scale-95"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 ac-scrollbar pb-24">
      {#each nookState.notifications as notif (notif.id)}
        <div 
          class={`bg-white border rounded-2xl p-3 shadow-sm relative flex gap-3 text-left transition ${notif.isRead ? 'border-[#edd8aa] bg-white/70' : 'border-orange-200 bg-orange-50/20 shadow-orange-50/10'}`}
        >
          <div class="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-lg shrink-0 mt-0.5">
            {notif.sender === "Tom Nook" ? "🍃" : notif.sender === "Isabelle" ? "🐶" : notif.sender === "Lottie" ? "🌸" : "🔔"}
          </div>
          <div class="flex-1 flex flex-col gap-0.5 pr-4">
            <span class="text-[8px] font-black text-orange-800/80 tracking-widest uppercase block">
              {notif.sender} • {notif.timestamp}
            </span>
            <span class="font-extrabold text-xs text-[#5c5446]">{notif.title}</span>
            <p class="text-[10px] text-gray-500 mt-1 leading-relaxed m-0">
              {notif.message}
            </p>
          </div>
          <button 
            onclick={() => nookState.dismissNotification(notif.id)}
            class="absolute top-2.5 right-2.5 bg-transparent border-0 p-0 text-gray-400 hover:text-gray-600 transition cursor-pointer"
            title="Dismiss"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      {:else}
        <div class="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
          <Inbox class="w-10 h-10 mb-2 stroke-[1.5px]" />
          <p class="text-xs font-bold">No notifications</p>
        </div>
      {/each}
    </div>
  </div>
{/if}
