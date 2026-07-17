<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import nookIncLogo from '@/assets/img/Nook_Inc.svg';
  import NookAppIcon from '../atoms/NookAppIcon.svelte';

  const ctx = getPhoneContext();
</script>

{#if !nookState.currentApp}
  <div class="shrink-0 bg-white/25 backdrop-blur-md border-4 border-white/35 rounded-[28px] py-2.5 px-4 mx-4 mb-4 flex justify-around items-center gap-1.5 shadow-lg relative z-50">
    <!-- App 1: Passport -->
    {#if ctx.dockApps[0]}
      <NookAppIcon 
        app={ctx.dockApps[0]} 
        size="sm" 
        showText={false}
        onClick={() => ctx.handleAppLaunch(ctx.dockApps[0].id || ctx.dockApps[0].name)}
        onMouseEnter={() => ctx.hoveredAppName = ctx.dockApps[0].name}
        onMouseLeave={() => ctx.hoveredAppName = "NookPhone"}
      />
    {/if}

    <!-- App 2: Resident Chat -->
    {#if ctx.dockApps[1]}
      <NookAppIcon 
        app={ctx.dockApps[1]} 
        size="sm" 
        showText={false}
        onClick={() => ctx.handleAppLaunch(ctx.dockApps[1].id || ctx.dockApps[1].name)}
        onMouseEnter={() => ctx.hoveredAppName = ctx.dockApps[1].name}
        onMouseLeave={() => ctx.hoveredAppName = "NookPhone"}
      />
    {/if}

    <!-- Home Button (Middle) -->
    <button 
      onclick={ctx.handleHomeButton}
      class="flex flex-col items-center justify-center bg-transparent border-0 hover:scale-105 transition-all duration-200 cursor-pointer p-0 w-[64px]"
    >
      <div class="w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center shadow-md border-4 border-white/55 hover:scale-110 active:scale-95 transition-all cursor-pointer p-0 m-0 group">
        <img src={nookIncLogo} alt="Nook Home Menu" class="w-full h-full group-hover:rotate-12 transition-transform" />
      </div>
    </button>

    <!-- App 3: App Store -->
    {#if ctx.dockApps[2]}
      <NookAppIcon 
        app={ctx.dockApps[2]} 
        size="sm" 
        showText={false}
        onClick={() => ctx.handleAppLaunch(ctx.dockApps[2].id || ctx.dockApps[2].name)}
        onMouseEnter={() => ctx.hoveredAppName = ctx.dockApps[2].name}
        onMouseLeave={() => ctx.hoveredAppName = "NookPhone"}
      />
    {/if}

    <!-- App 4: Settings -->
    {#if ctx.dockApps[3]}
      <NookAppIcon 
        app={ctx.dockApps[3]} 
        size="sm" 
        showText={false}
        onClick={() => ctx.handleAppLaunch(ctx.dockApps[3].id || ctx.dockApps[3].name)}
        onMouseEnter={() => ctx.hoveredAppName = ctx.dockApps[3].name}
        onMouseLeave={() => ctx.hoveredAppName = "NookPhone"}
      />
    {/if}
  </div>
{:else}
  <!-- Thin Home Indicator Pill (iPhone style) -->
  <button 
    onclick={ctx.handleHomeButton}
    class="shrink-0 w-28 h-1.5 bg-[#5d5a4a]/25 hover:bg-[#5d5a4a]/45 rounded-full mx-auto mt-1 mb-2.5 transition-colors cursor-pointer border-0 p-0 block relative z-50 active:scale-95 animate-fade-in"
    title="Go Home"
  ></button>
{/if}
