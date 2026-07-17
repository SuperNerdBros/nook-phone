<script lang="ts">
  import NookIcon from './NookIcon.svelte';
  import { Lock } from '@lucide/svelte';
  import { isProUser } from '@/lib/api';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  
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
</script>

<div class={`relative group ${size === 'lg' ? 'w-[98px]' : ''}`}>
  <button
    onclick={onClick}
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    class={`flex flex-col items-center gap-1 bg-transparent border-0 ${size === 'lg' ? 'hover:scale-[1.15]' : 'hover:scale-105'} transition-all duration-200 cursor-pointer p-0 ${s.button} ${className}`}
  >
    <div class={`${s.icon} flex items-center justify-center transition-all relative overflow-hidden ${app.image ? 'bg-transparent' : (app.bg || 'bg-[#f5fbf7] border-4 border-white/20 shadow-md group-hover:ring-4 group-hover:ring-offset-2 group-hover:ring-[#8cc3b0] group-hover:scale-105')}`}>
      {#if app.image}
        <img src={resolveAssetUrl(app.image)} alt={app.name} class="w-full h-full object-contain drop-shadow-sm" />
      {:else if app.id}
        <NookIcon name={app.id} class={`w-full h-full object-contain drop-shadow-sm ${s.p}`} />
      {:else}
        <div class="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none"></div>
        <NookIcon name={app.appIcon || 'directory'} class={`w-full h-full object-contain drop-shadow-sm ${s.p} z-10 relative`} />
      {/if}
      
      {#if app.proOnly && !isProUser()}
        <div class="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] z-20">
          <Lock class="w-1/2 h-1/2 text-white drop-shadow-md" />
        </div>
      {/if}
    </div>
    {#if showText}
      <span class={`${s.text} font-black ${ctx?.isDarkTheme ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)]' : 'text-[#5d5a4a] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'} tracking-tight text-center truncate w-full px-1 transition-colors`}>
        {app.name}
      </span>
    {/if}
  </button>
  
  {#if children}
    {@render children()}
  {/if}
</div>
