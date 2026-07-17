<script lang="ts">
  import { fly } from 'svelte/transition';
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import NookAppIcon from '../atoms/NookAppIcon.svelte';

  const ctx = getPhoneContext();
</script>

{#if ctx.isAppDrawerOpen}
  <div
    in:fly={nookState.settings.reduceMotion ? undefined : { y: 100, duration: 300 }}
    out:fly={nookState.settings.reduceMotion ? undefined : { y: 100, duration: 300 }}
    class="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col z-40 overflow-hidden border border-white/40"
  >
    <div class="shrink-0 flex flex-col items-center pt-3 pb-2 border-b border-gray-100 relative">
      <div class="w-12 h-1.5 bg-gray-300 rounded-full mb-3"></div>
      <h2 class="text-xs font-black text-gray-500 uppercase tracking-widest m-0">All Apps</h2>
      <button onclick={() => ctx.isAppDrawerOpen = false} class="absolute right-4 top-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center border-0 cursor-pointer">
        ✕
      </button>
    </div>
    
    <div class="flex-1 overflow-y-auto ac-scrollbar px-4 pb-24 pt-4">
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-4 sm:gap-x-6 md:gap-x-8 justify-items-center">
        {#each ctx.allApps as app (app.id || app.name)}
          <NookAppIcon 
            app={app} 
            size="md" 
            onClick={() => ctx.handleAppLaunch(app.id || app.name)}
          >
            <!-- Pin Button -->
            <button 
              onclick={(e) => { e.stopPropagation(); nookState.toggleAppPin(app.id || app.name); }}
              class={`absolute -top-2 -right-2 w-6 h-6 rounded-full border border-white flex items-center justify-center cursor-pointer shadow-sm transition-transform active:scale-90 ${nookState.isAppPinned(app.id || app.name) ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}
              title={nookState.isAppPinned(app.id || app.name) ? 'Unpin from Homescreen' : 'Pin to Homescreen'}
            >
              📌
            </button>
          </NookAppIcon>
        {/each}
      </div>
    </div>
  </div>
{/if}
