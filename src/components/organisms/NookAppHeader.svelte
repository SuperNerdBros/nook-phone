<script lang="ts">
  import type { Snippet } from 'svelte';
  
  let { 
    title, 
    icon = '', 
    iconSnippet,
    subtitle = '', 
    bgClass = 'bg-[#8cc3b0]', 
    textClass = 'text-white', 
    children,
    actions
  }: { 
    title: string;
    icon?: string;
    iconSnippet?: Snippet;
    subtitle?: string;
    bgClass?: string;
    textClass?: string;
    children?: Snippet;
    actions?: Snippet;
  } = $props();
</script>

<div class="{bgClass} {textClass} p-4 pt-6 ac-wavy-header flex flex-col gap-2 relative z-10 shadow-sm shrink-0">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-bold flex items-center gap-1.5 drop-shadow-sm">
        {#if iconSnippet}
          {@render iconSnippet()}
        {:else if icon}
          <span>{icon}</span>
        {/if}
        {title}
      </h1>
      {#if subtitle}
        <p class="text-xs font-bold opacity-90 mt-1">{subtitle}</p>
      {/if}
    </div>
    {#if actions}
      <div class="flex items-center">
        {@render actions()}
      </div>
    {/if}
  </div>
  
  {#if children}
    <div class="mt-2 w-full">
      {@render children()}
    </div>
  {/if}
</div>
