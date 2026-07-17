<script lang="ts">
  import { playSound } from '@/lib/audio';
  import nookState from '@/lib/nookState.svelte';

  let {
    onclick,
    href,
    target = '_blank',
    rel = 'noreferrer',
    title,
    class: className = '',
    variant = 'default',
    children,
    ...rest
  } = $props<{
    onclick?: (e: MouseEvent) => void;
    href?: string;
    target?: string;
    rel?: string;
    title?: string;
    class?: string;
    variant?: 'default' | 'ghost' | 'custom';
    children?: import('svelte').Snippet;
    [key: string]: any;
  }>();

  const handleClick = (e: MouseEvent) => {
    playSound('click', !nookState.settings.soundEffects);
    if (onclick) onclick(e);
  };
</script>

{#if href}
  <a
    {href}
    {target}
    {rel}
    {title}
    class="nook-header-btn {variant === 'ghost' ? 'nook-header-btn-ghost' : ''} {className}"
    {...rest}
  >
    {#if children}
      {@render children()}
    {/if}
  </a>
{:else}
  <button
    onclick={handleClick}
    {title}
    class="nook-header-btn {variant === 'ghost' ? 'nook-header-btn-ghost' : ''} {className}"
    {...rest}
  >
    {#if children}
      {@render children()}
    {/if}
  </button>
{/if}
