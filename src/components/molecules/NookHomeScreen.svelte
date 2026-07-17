<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import NookAppIcon from '../atoms/NookAppIcon.svelte';

  const ctx = getPhoneContext();
</script>

<div class="absolute inset-0 flex flex-col">
  <div class="text-center text-[#807256] font-['Varela_Round',sans-serif] text-[35px] font-bold mt-[30px] mb-[15px] min-h-[42px] drop-shadow-sm flex items-center justify-center">
    {ctx.hoveredAppName}
  </div>
  
  <div class="flex-1 overflow-y-auto ac-scrollbar relative">
    <div class={`grid gap-y-[24px] gap-x-[10px] px-[30px] pt-[10px] justify-items-center content-start pb-10 ${nookState.settings.gridSize === 4 ? 'grid-cols-4 gap-x-2' : nookState.settings.gridSize === 5 ? 'grid-cols-5 gap-x-1' : 'grid-cols-3'}`}>
      {#each ctx.desktopApps as app (app.id || app.name)}
        <NookAppIcon 
          app={app} 
          size="lg" 
          showText={false}
          onClick={() => ctx.handleAppLaunch(app.id || app.name)}
          onMouseEnter={() => ctx.hoveredAppName = app.name}
          onMouseLeave={() => ctx.hoveredAppName = "NookPhone"}
        >
          <!-- Remove button -->
          <button 
            onclick={(e) => { e.stopPropagation(); nookState.toggleAppPin(app.id || app.name); }}
            class="absolute -top-1 right-0.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full border border-white flex items-center justify-center cursor-pointer shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 active:scale-95 text-[9px] font-black z-30"
            title="Remove from Homescreen"
          >
            ✕
          </button>
        </NookAppIcon>
      {/each}

      {#if ctx.desktopApps.length === 0}
        <div class="col-span-full flex flex-col items-center justify-center py-20 text-[#5d5a4a]/50 text-sm font-bold text-center">
          <div class="text-4xl mb-4 opacity-50">📱</div>
          Your desktop is empty.<br/>
          Use the App Store to install apps or change pinning in Settings!
        </div>
      {/if}
    </div>
  </div>
</div>
