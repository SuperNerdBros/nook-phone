<script lang="ts">
  import { fly } from 'svelte/transition';
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import { playSound } from '@/lib/audio';

  const ctx = getPhoneContext();
</script>

{#if ctx.activeToast}
  <button
    onclick={() => {
      playSound('click', !nookState.settings.soundEffects);
      ctx.showNotificationCenter = true;
      if (nookState.markAllNotificationsAsRead) {
        nookState.markAllNotificationsAsRead();
      }
      ctx.activeToast = null;
    }}
    transition:fly={{ y: -100, duration: 300 }}
    class="absolute top-16 left-4 right-4 bg-white/95 backdrop-blur-md border-l-4 border-orange-400 border-y border-r border-[#edd8aa] rounded-2xl p-3 shadow-lg flex gap-3 items-center text-left z-50 cursor-pointer hover:bg-orange-50/10 transition"
  >
    <div class="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-lg shrink-0">
      {ctx.activeToast.sender === "Tom Nook" ? "🍃" : ctx.activeToast.sender === "Isabelle" ? "🐶" : ctx.activeToast.sender === "Lottie" ? "🌸" : "🔔"}
    </div>
    <div class="flex-1 min-w-0">
      <span class="text-[7px] font-black text-orange-800/80 tracking-widest uppercase block">
        New Notification • {ctx.activeToast.sender}
      </span>
      <span class="font-extrabold text-xs text-[#5c5446] block truncate">{ctx.activeToast.title}</span>
      <span class="text-[9.5px] text-gray-500 truncate block">{ctx.activeToast.message}</span>
    </div>
  </button>
{/if}
