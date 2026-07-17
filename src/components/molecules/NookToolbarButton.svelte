<script lang="ts">
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
    {onclick}
    {title}
    class="nook-header-btn {variant === 'ghost' ? 'nook-header-btn-ghost' : ''} {className}"
    {...rest}
  >
    {#if children}
      {@render children()}
    {/if}
  </button>
{/if}
