<script lang="ts">
  import { fade } from 'svelte/transition';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';

  const ctx = getPhoneContext();
  let showRipple = $state(false);

  $effect(() => {
    if (ctx.launchingApp) {
      showRipple = false;
      const t = setTimeout(() => {
        showRipple = true;
      }, 400); // Wait for the initial bounce before rippling
      return () => clearTimeout(t);
    } else {
      showRipple = false;
    }
  });

  function resolveAssetUrl(assetPath: string) {
    if (!assetPath) return assetPath;
    if (assetPath.startsWith('http') || assetPath.startsWith('data:')) return assetPath;
    if (import.meta.env.DEV) {
      return `${window.location.protocol}//${window.location.hostname}:5175${assetPath}`;
    }
    if (assetPath.startsWith('/assets/')) {
      return (window as any).wpApiSettings?.pluginUrl + 'public/dist' + assetPath;
    }
    return assetPath;
  }
</script>

{#if ctx.launchingApp}
  <div
    transition:fade={{ duration: 150 }}
    class="absolute inset-0 bg-[#e0dcc5]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6 overflow-hidden"
  >
    <!-- RIPPLE BACKGROUND -->
    <div 
      class={`absolute z-0 rounded-full transition-transform duration-[450ms] ease-in-out ${ctx.launchingApp.bg || 'bg-[#f5fbf7]'}`}
      style={`
        width: 150vh; 
        height: 150vh; 
        left: 50%; 
        top: 50%; 
        transform: translate(-50%, -50%) scale(${showRipple ? 1 : 0});
      `}
    ></div>

    <div class="launch-icon-container animate-bounce-in relative z-10">
      <div class={`w-[110px] h-[110px] flex items-center justify-center rounded-[28px] overflow-hidden ${ctx.launchingApp.image ? 'bg-transparent' : (ctx.launchingApp.bg || 'bg-[#f5fbf7] border-4 border-white/40 shadow-xl')}`}>
        {#if ctx.launchingApp.image}
          <img src={resolveAssetUrl(ctx.launchingApp.image)} alt={ctx.launchingApp.name} class="w-full h-full object-contain drop-shadow-sm p-4 animate-scale-in" />
        {:else if ctx.launchingApp.id}
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
    
    <div class="flex flex-col items-center gap-1 relative z-10">
      <span class={`text-xs font-black uppercase tracking-widest animate-pulse transition-colors duration-[400ms] ${showRipple ? 'text-white' : 'text-[#5d5a4a]'}`}>
        Starting {ctx.launchingApp.name}...
      </span>
      <div class="text-3xl animate-leaf-spin mt-1">🍃</div>
    </div>
  </div>
{/if}
