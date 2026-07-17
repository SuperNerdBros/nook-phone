<script lang="ts">
  import { fade } from 'svelte/transition';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';

  const ctx = getPhoneContext();
</script>

{#if ctx.launchingApp}
  <div
    transition:fade={{ duration: 150 }}
    class="absolute inset-0 bg-[#e0dcc5]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6"
  >
    <div class="launch-icon-container animate-bounce-in relative">
      <div class={`w-[110px] h-[110px] flex items-center justify-center rounded-[28px] overflow-hidden ${ctx.launchingApp.bg || 'bg-[#f5fbf7] border-4 border-white/40 shadow-xl'}`}>
        {#if ctx.launchingApp.id}
          <NookIcon name={ctx.launchingApp.id} class="w-full h-full object-contain drop-shadow-md p-4" />
        {:else}
          <div class="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none"></div>
          <NookIcon name={ctx.launchingApp.appIcon || 'directory'} class="w-full h-full object-contain drop-shadow-md p-4 z-10 relative" />
        {/if}
      </div>
      
      <div class="absolute -top-3 -right-3 text-2xl animate-spin-slow">⭐</div>
      <div class="absolute -bottom-2 -left-2 text-xl animate-bounce-slow">✨</div>
      <div class="absolute -bottom-4 right-6 text-sm animate-pulse">🌸</div>
    </div>
    
    <div class="flex flex-col items-center gap-1">
      <span class="text-xs font-black text-[#5d5a4a] uppercase tracking-widest animate-pulse">
        Starting {ctx.launchingApp.name}...
      </span>
      <div class="text-3xl animate-leaf-spin mt-1">🍃</div>
    </div>
  </div>
{/if}
