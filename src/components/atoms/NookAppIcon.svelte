<script lang="ts">
  import NookIcon from './NookIcon.svelte';
  import { Lock, X } from '@lucide/svelte';
  import { isProUser } from '@/lib/api';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import nookState from '@/lib/nookState.svelte';
  
  const ctx = getPhoneContext();

  let { 
    app, 
    onClick,
    onMouseEnter,
    onMouseLeave,
    size = 'md',
    showText = true,
    class: className = '',
    children
  } = $props<{
    app: any;
    onClick: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
  }>();

  const sizeClasses = {
    sm: { button: 'w-[64px]', icon: 'w-[46px] h-[46px] rounded-full', p: 'p-1.5', text: 'text-[8.5px]' },
    md: { button: 'w-[80px]', icon: 'w-[60px] h-[60px] rounded-full', p: 'p-2', text: 'text-[9px]' },
    lg: { button: 'w-[98px]', icon: 'w-[98px] h-[98px] rounded-full', p: 'p-3.5', text: 'text-[12px]' },
    xl: { button: 'w-full', icon: 'w-[110px] h-[110px] rounded-full', p: 'p-4', text: 'text-xs' }
  };

  const s = sizeClasses[size];

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

  // Long press detection
  let pressTimer: any = null;
  let isLongPress = false;

  function handlePointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    isLongPress = false;
    pressTimer = setTimeout(() => {
      isLongPress = true;
      ctx.isEditMode = true;
      playSound('switch');
    }, 700);
  }

  function handlePointerUp(e: PointerEvent) {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }

  function handlePointerLeave() {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }

  function handleLaunch(e: Event) {
    if (ctx.isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  }

  function handleUninstall(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Uninstall ${app.name}?`)) {
      nookState.uninstallApp(app.name);
      playSound('thwip');
    }
  }

  async function playSound(type: any) {
    if (nookState.settings.soundEffects) {
      const { playSound: soundPlay } = await import('@/lib/audio');
      soundPlay(type);
    }
  }

  // Alternating wiggle delay based on ID/Name
  const isAltWiggle = $derived((app?.id || app?.name || '').charCodeAt(0) % 2 === 0);
  const isRemovable = $derived(app && !app.id && nookState.isAppInstalled(app.name));
</script>

<div 
  class={`relative group ${size === 'lg' ? 'w-[98px]' : ''} ${ctx.isEditMode ? (isAltWiggle ? 'animate-wiggle' : 'animate-wiggle-alt') : ''}`}
  draggable={!ctx.isEditMode}
  ondragstart={(e) => {
    e.dataTransfer?.setData('appId', app?.id || app?.name);
    e.dataTransfer?.setData('source', 'icon');
  }}
  onpointerdown={handlePointerDown}
  onpointerup={handlePointerUp}
  onpointerleave={handlePointerLeave}
  onpointercancel={handlePointerLeave}
  oncontextmenu={(e) => e.preventDefault()}
  data-app-id={app?.id || app?.name}
>
  <button
    onclick={handleLaunch}
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    class={`flex flex-col items-center gap-1 bg-transparent border-0 ${size === 'lg' ? 'hover:scale-[1.15]' : 'hover:scale-105'} transition-all duration-200 cursor-pointer p-0 ${s.button} ${className}`}
  >
    <div class={`${s.icon} flex items-center justify-center transition-all relative overflow-hidden ${app?.image && !app?.imageNeedsBg ? 'bg-transparent' : (app?.bg || 'bg-[#f5fbf7] border-4 border-white/20 shadow-md group-hover:ring-4 group-hover:ring-offset-2 group-hover:ring-[#8cc3b0] group-hover:scale-105')}`}>
      {#if app?.image}
        <img src={resolveAssetUrl(app.image)} alt={app.name} class="w-full h-full object-contain drop-shadow-sm pointer-events-none" />
      {:else}
        <div class="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none"></div>
        <NookIcon name={app?.appIcon || app?.id || 'directory'} class={`w-full h-full object-contain drop-shadow-sm ${s.p} z-10 relative pointer-events-none`} />
      {/if}
      
      {#if app?.proOnly && !isProUser()}
        <div class="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] z-20">
          <Lock class="w-1/2 h-1/2 text-white drop-shadow-md" />
        </div>
      {/if}
    </div>
    {#if showText}
      <span class={`${s.text} font-black ${ctx?.isDarkTheme ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)]' : 'text-[#5d5a4a] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'} tracking-tight text-center truncate w-full px-1 transition-colors`}>
        {app?.name}
      </span>
    {/if}
  </button>
  
  {#if ctx.isEditMode && isRemovable}
    <button
      onclick={handleUninstall}
      class="absolute -top-1.5 -left-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md z-30 cursor-pointer"
      title="Uninstall App"
    >
      <X class="w-3.5 h-3.5 stroke-[3px]" />
    </button>
  {/if}

  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  @keyframes wiggle-keyframe {
    0% { transform: rotate(-1.5deg); }
    50% { transform: rotate(1.5deg); }
    100% { transform: rotate(-1.5deg); }
  }
  :global(.animate-wiggle) {
    animation: wiggle-keyframe 0.22s ease-in-out infinite;
  }
  :global(.animate-wiggle-alt) {
    animation: wiggle-keyframe 0.22s ease-in-out infinite;
    animation-delay: 0.11s;
  }
</style>
