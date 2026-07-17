<script lang="ts">
  import { Signal, Wifi, Battery, MapPin, Bell } from "@lucide/svelte";
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';

  const ctx = getPhoneContext();
</script>

<div class="bg-[#e0dcc5]/80 backdrop-blur-md px-6 pt-3 pb-2 flex justify-between items-center text-[11px] text-[#5d5a4a] font-black select-none z-[70] shrink-0 border-b border-[#d1cbb0]">
  <div class="flex items-center gap-2">
    <button 
      onclick={() => {
        ctx.showNotificationCenter = !ctx.showNotificationCenter;
        if (ctx.showNotificationCenter) {
          nookState.markAllNotificationsAsRead();
        }
      }} 
      class="relative flex items-center bg-transparent border-0 p-0 cursor-pointer hover:scale-105 active:scale-95 transition"
      title="Notifications"
    >
      <Bell class="w-3.5 h-3.5 text-[#5d5a4a] stroke-[2.5px]" />
      {#if nookState.notifications.some(n => !n.isRead)}
        <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
      {/if}
    </button>
  </div>
  
  <div class="flex items-center gap-1.5 text-xs text-[#5d5a4a] tracking-tight font-black font-sans">
    <MapPin class="w-3.5 h-3.5 text-[#5c8e43] shrink-0" />
    <span class="font-bold mr-1 truncate max-w-[80px]">
      {nookState.passport.islandName.replace(" Island", "")}
    </span>
    <span class="opacity-40">•</span>
    <span class="font-mono">{ctx.timeStr}</span>
  </div>

  <div class="flex items-center gap-1.5">
    <Signal class="w-3.5 h-3.5 text-[#5d5a4a] stroke-[3px]" />
    <Wifi class="w-3 h-3 text-[#5d5a4a]" />
    {#if nookState.settings.showBatteryPercentage}
      <span class="text-[9px] font-mono font-bold text-[#5c8e43]">100%</span>
    {/if}
    <button onclick={ctx.handlePowerButton} class="bg-transparent border-0 p-0 cursor-pointer flex items-center hover:opacity-70 transition-opacity" title="Sleep / Lock">
      <Battery class="w-5 h-5 text-[#5d5a4a] stroke-[2px]" />
    </button>
  </div>
</div>
