<script lang="ts">
  import { Wifi, Battery, MapPin, Bell } from "@lucide/svelte";
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import cellularStatusImg from '@/assets/img/cellular_status.png';

  const ctx = getPhoneContext();

  function resolveAssetUrl(assetPath: string) {
    if (!assetPath) return assetPath;
    if (assetPath.startsWith('http')) return assetPath;
    if (import.meta.env.DEV) {
      return `${window.location.protocol}//${window.location.hostname}:5175${assetPath}`;
    }
    if (assetPath.startsWith('/assets/')) {
      return (window as any).wpApiSettings?.pluginUrl + 'public/dist' + assetPath;
    }
    return assetPath;
  }
</script>

<div class="bg-transparent px-8 pr-4 pt-3 pb-2 flex justify-between items-center text-[18px] font-['Varela_Round',sans-serif] text-[#d0cbb5] font-bold select-none z-[70] shrink-0">
  <!-- Left side (Signal / Notifications) -->
  <div class="w-[55px] flex items-center justify-center gap-1.5">
    <img src={resolveAssetUrl(cellularStatusImg)} alt="Signal" class="h-[18px] object-contain opacity-70" />
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
      <Bell class="w-4 h-4 text-[#d0cbb5] stroke-[2.5px]" />
      {#if nookState.notifications.some(n => !n.isRead)}
        <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
      {/if}
    </button>
  </div>
  
  <!-- Middle (Time) -->
  <div class="flex-1 text-center font-['Varela_Round',sans-serif] text-[22px] text-[#d0cbb5] font-bold">
    {ctx.timeStr}
  </div>

  <!-- Right side (Location / Power) -->
  <div class="w-[55px] flex items-center justify-center gap-1.5">
    <MapPin class="w-[22px] h-[22px] text-[#d0cbb5] stroke-[2.5px]" />
    <button onclick={ctx.handlePowerButton} class="bg-transparent border-0 p-0 cursor-pointer flex items-center hover:opacity-70 transition-opacity" title="Sleep / Lock">
      <Battery class="w-5 h-5 text-[#d0cbb5] stroke-[2px]" />
    </button>
  </div>
</div>
