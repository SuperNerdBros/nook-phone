<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import nookIncLogo from '@/assets/img/Nook_Inc.svg';
  import NookAppIcon from '../atoms/NookAppIcon.svelte';

  const ctx = getPhoneContext();
  const handleDockDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const appId = e.dataTransfer?.getData('appId');
    if (appId && nookState.dockApps.length < 4 && !nookState.dockApps.includes(appId)) {
      nookState.dockApps = [...nookState.dockApps, appId];
    }
  };

  const handleIconDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const appId = e.dataTransfer?.getData('appId');
    if (appId) {
      let newDock = [...nookState.dockApps];
      const oldIndex = newDock.indexOf(appId);
      if (oldIndex !== -1) {
        newDock.splice(oldIndex, 1);
      }
      newDock.splice(dropIndex, 0, appId);
      if (newDock.length > 4) newDock = newDock.slice(0, 4);
      nookState.dockApps = newDock;
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };
</script>

{#if !nookState.currentApp}
  <div 
    class="shrink-0 bg-white/25 backdrop-blur-md border-4 border-white/35 rounded-[28px] py-2 px-2 mx-4 mb-4 flex justify-evenly items-center gap-1 shadow-lg relative z-50 min-h-[110px]"
    ondrop={handleDockDrop}
    ondragover={handleDragOver}
  >
    {#each ctx.dockApps as app, i}
      <div 
        class="transition-all rounded-2xl border-2 border-transparent hover:border-white/20 flex-shrink-0"
        ondrop={(e) => handleIconDrop(e, i)}
        ondragover={handleDragOver}
      >
        <NookAppIcon 
          app={app} 
          size="lg" 
          showText={false}
          onClick={() => { if (app) ctx.handleAppLaunch(app.id || app.name) }}
          onMouseEnter={() => { if (app) ctx.hoveredAppName = app.name || "" }}
          onMouseLeave={() => ctx.hoveredAppName = "NookPhone"}
        />
      </div>
    {/each}
  </div>
{:else}
  <!-- Thin Home Indicator Pill (iPhone style) -->
  <button 
    onclick={ctx.handleHomeButton}
    class="shrink-0 w-28 h-1.5 bg-[#5d5a4a]/25 hover:bg-[#5d5a4a]/45 rounded-full mx-auto mt-1 mb-2.5 transition-colors cursor-pointer border-0 p-0 block relative z-50 active:scale-95 animate-fade-in"
    title="Go Home"
  ></button>
{/if}
