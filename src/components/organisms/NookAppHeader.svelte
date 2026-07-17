<script lang="ts">
  import type { Snippet } from 'svelte';
  import { playSound } from '@/lib/audio';
  import nookState from '@/lib/nookState.svelte';
  
  let { 
    title, 
    icon = '', 
    iconSnippet,
    subtitle = '', 
    description = '',
    bgClass = 'bg-[#8cc3b0]',
    bgStyle = '',
    textClass = 'text-white', 
    actions,
    leftActions,
    children
  }: { 
    title: string;
    icon?: string;
    iconSnippet?: Snippet;
    subtitle?: string;
    description?: string;
    bgClass?: string;
    bgStyle?: string;
    textClass?: string;
    actions?: Snippet;
    leftActions?: Snippet;
    children?: Snippet;
  } = $props();

  let isCollapsed = $state(false);
</script>

{#if isCollapsed}
  <!-- Collapsed: Thin pull-tab handle -->
  <button
    onclick={() => { playSound('pop', !nookState.settings.soundEffects); isCollapsed = false; }}
    class="ext-header-handle {bgClass}"
    style={bgStyle}
  >
    <div class="ext-header-handle-pill"></div>
    <span class="ext-header-handle-label">{title}</span>
    <div class="ext-header-handle-pill"></div>
  </button>
{:else}
  <!-- Expanded: Full rich header -->
  <div class="ext-header {bgClass} {textClass}" style={bgStyle}>
    <!-- Rich Gradient Overlay -->
    <div class="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/20 via-transparent to-black/20 mix-blend-overlay"></div>

    <!-- Leaf pattern overlay -->
    {#if !bgStyle}
      <div class="ext-header-pattern"></div>
    {/if}

    <!-- Top Row -->
    <div class="ext-header-top">
      <div class="flex items-center gap-2">
        {#if leftActions}
          {@render leftActions()}
        {/if}
        <div class="ext-header-identity">
          <div class="ext-header-icon-wrap">
            {#if iconSnippet}
              {@render iconSnippet()}
            {:else if icon}
              <span class="text-xl leading-none z-10 relative drop-shadow-sm">{icon}</span>
            {/if}
          </div>
          <div class="ext-header-title-group">
            <h1 class="ext-header-title">{title}</h1>
          {#if subtitle}
            <p class="text-[9px] font-bold text-white/70 m-0 uppercase tracking-wider">{subtitle}</p>
          {/if}
        </div>
      </div>
      </div>

      <div class="ext-header-actions">
        {#if actions}
          {@render actions()}
        {/if}
      </div>
    </div>

    <!-- Description -->
    {#if description}
      <p class="ext-header-desc">{description}</p>
    {/if}

    {#if children}
      <div class="relative z-10 w-full mt-3">
        {@render children()}
      </div>
    {/if}

    <!-- Collapse handle -->
    <button
      onclick={() => { playSound('pop', !nookState.settings.soundEffects); isCollapsed = true; }}
      class="ext-header-collapse-trigger"
    >
      <div class="ext-header-collapse-pill"></div>
    </button>
  </div>
{/if}

<style>
  /* ── Collapsed Handle ─────────────────────────────── */
  .ext-header-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 22px;
    border: 0;
    border-bottom: 2px solid rgba(0, 0, 0, 0.2);
    cursor: pointer;
    padding: 0;
    transition: filter 0.15s;
    z-index: 10;
    position: relative;
    flex-shrink: 0;
    width: 100%;
  }
  .ext-header-handle:hover {
    filter: brightness(1.1);
  }
  .ext-header-handle:active {
    transform: scaleY(0.95);
  }
  .ext-header-handle-pill {
    width: 16px;
    height: 3px;
    background: rgba(255,255,255,0.35);
    border-radius: 2px;
  }
  .ext-header-handle-label {
    font-size: 9px;
    font-weight: 900;
    color: rgba(255,255,255,0.75);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    line-height: 1;
  }

  /* ── Expanded Header ──────────────────────────────── */
  .ext-header {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    padding: 14px 14px 0 14px;
    border-bottom: 3px solid rgba(0, 0, 0, 0.2);
    overflow: hidden;
    flex-shrink: 0;
  }
  .ext-header-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.06;
    pointer-events: none;
    background-image: url('data:image/svg+xml,%3Csvg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M14 4c2 3 6 5 6 10s-4 7-6 10c-2-3-6-5-6-10s4-7 6-10z" fill="white" fill-opacity="0.5"/%3E%3C/svg%3E');
    background-size: 22px 22px;
  }

  /* Top row */
  .ext-header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .ext-header-identity {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .ext-header-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    max-width: 60px;
    max-height: 60px;
  }
  .ext-header-icon-wrap > :global(*) {
    max-width: 100%;
    max-height: 100%;
  }
  .ext-header-title-group {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 3px;
  }
  .ext-header-title {
    font-size: 14px;
    font-weight: 900;
    color: #fff;
    margin: 0;
    line-height: 1.1;
    text-shadow: 0 1px 2px rgba(0,0,0,0.15);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Action buttons container */
  .ext-header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  /* Description */
  .ext-header-desc {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255,255,255,0.7);
    margin: 8px 0 0 0;
    line-height: 1.4;
    position: relative;
    z-index: 1;
    padding-left: 48px; /* align with title text */
  }

  /* Collapse trigger at bottom */
  .ext-header-collapse-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 6px 0 5px 0;
    margin-top: 6px;
    background: transparent;
    border: 0;
    cursor: pointer;
    position: relative;
    z-index: 1;
  }
  .ext-header-collapse-trigger:hover .ext-header-collapse-pill {
    background: rgba(255,255,255,0.5);
    width: 48px;
  }
  .ext-header-collapse-pill {
    width: 36px;
    height: 3px;
    background: rgba(255,255,255,0.25);
    border-radius: 2px;
    transition: all 0.2s;
  }

  /* Global utility class for buttons passed via snippet */
  :global(.nook-header-btn) {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    background: rgba(255,255,255,0.92);
    color: inherit;
    box-shadow: 0 2px 4px rgba(0,0,0,0.12);
  }
  :global(.nook-header-btn:hover) {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  }
  :global(.nook-header-btn:active) {
    transform: scale(0.9);
  }
  
  :global(.nook-header-btn-ghost) {
    background: rgba(255,255,255,0.15) !important;
    color: rgba(255,255,255,0.85) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    box-shadow: none !important;
  }
  :global(.nook-header-btn-ghost:hover) {
    background: rgba(255,255,255,0.28) !important;
    color: #fff !important;
  }
</style>
