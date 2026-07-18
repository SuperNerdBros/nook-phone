<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicIn } from 'svelte/easing';
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

  function irisOut(node: HTMLElement, { duration = 400 }) {
    const svgUrl = `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50 0 Q 58 15 70 10 Q 70 25 85 30 Q 75 42 90 50 Q 75 58 85 70 Q 70 75 70 90 Q 58 85 50 100 Q 42 85 30 90 Q 30 75 15 70 Q 25 58 10 50 Q 25 42 15 30 Q 30 25 30 10 Q 42 15 50 0 Z'/%3E%3C/svg%3E")`;
    
    // Set up the static properties once
    node.style.webkitMaskImage = `${svgUrl}, linear-gradient(black, black)`;
    node.style.maskImage = `${svgUrl}, linear-gradient(black, black)`;
    
    node.style.webkitMaskPosition = `center, center`;
    node.style.maskPosition = `center, center`;
    
    node.style.webkitMaskRepeat = `no-repeat, no-repeat`;
    node.style.maskRepeat = `no-repeat, no-repeat`;
    
    // Punch out the SVG from the solid background
    node.style.webkitMaskComposite = `destination-out`;
    node.style.maskComposite = `exclude`;

    return {
      duration,
      easing: cubicIn,
      tick: (t: number) => {
        const size = (1 - t) * 2000; // Go up to 2000px to ensure it completely clears the screen
        node.style.webkitMaskSize = `${size}px ${size}px, 100% 100%`;
        node.style.maskSize = `${size}px ${size}px, 100% 100%`;
      }
    };
  }

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
    in:fade={{ duration: 150 }}
    out:irisOut={{ duration: 400 }}
    class="absolute inset-0 bg-[#e0dcc5]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6 overflow-hidden"
  >
    <!-- RIPPLE BACKGROUND -->
    <div 
      class={`absolute z-0 transition-transform duration-[450ms] ease-in-out ${ctx.launchingApp.bg || 'bg-[#f5fbf7]'}`}
      style={`
        width: 250vh; 
        height: 250vh; 
        left: 50%; 
        top: 50%; 
        transform: translate(-50%, -50%) scale(${showRipple ? 1 : 0}) rotate(${showRipple ? '45deg' : '0deg'});
        mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50 0 Q 58 15 70 10 Q 70 25 85 30 Q 75 42 90 50 Q 75 58 85 70 Q 70 75 70 90 Q 58 85 50 100 Q 42 85 30 90 Q 30 75 15 70 Q 25 58 10 50 Q 25 42 15 30 Q 30 25 30 10 Q 42 15 50 0 Z'/%3E%3C/svg%3E");
        mask-size: contain;
        mask-repeat: no-repeat;
        mask-position: center;
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50 0 Q 58 15 70 10 Q 70 25 85 30 Q 75 42 90 50 Q 75 58 85 70 Q 70 75 70 90 Q 58 85 50 100 Q 42 85 30 90 Q 30 75 15 70 Q 25 58 10 50 Q 25 42 15 30 Q 30 25 30 10 Q 42 15 50 0 Z'/%3E%3C/svg%3E");
        -webkit-mask-size: contain;
        -webkit-mask-repeat: no-repeat;
        -webkit-mask-position: center;
      `}
    ></div>

    <div class="launch-icon-container animate-bounce-in relative z-10">
      <div class={`w-[110px] h-[110px] flex items-center justify-center rounded-[28px] overflow-hidden ${ctx.launchingApp.image ? 'bg-transparent' : (ctx.launchingApp.bg || 'bg-[#f5fbf7] border-4 border-white/40 shadow-xl')}`}>
        {#if ctx.launchingApp.image}
          <img src={resolveAssetUrl(ctx.launchingApp.image)} alt={ctx.launchingApp.name} class="w-full h-full object-contain drop-shadow-sm p-4 animate-scale-in" />
        {:else}
          <div class="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none"></div>
          <NookIcon name={ctx.launchingApp.logo || ctx.launchingApp.appIcon || ctx.launchingApp.id || 'directory'} class="w-full h-full object-contain drop-shadow-md p-4 z-10 relative" />
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
