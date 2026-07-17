<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { Code, X } from '@lucide/svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';

  const ctx = getPhoneContext();
  let isCollapsed = $state(false);

  const siteUrl = '/island-designer/#/';
  const gitUrl = 'https://github.com/eugeneration/HappyIslandDesigner';
  const description = 'Draw terrain and paths, place buildings, and trace your in-game map';
</script>

<div id="designer-app" class="flex flex-col h-full ac-app-screen relative bg-white">
  {#if isCollapsed}
    <!-- Collapsed: Thin pull-tab handle -->
    <button
      onclick={() => isCollapsed = false}
      class="designer-header-handle"
    >
      <div class="designer-header-handle-pill"></div>
      <span class="designer-header-handle-label">Island Designer</span>
      <div class="designer-header-handle-pill"></div>
    </button>
  {:else}
    <!-- Expanded: Full rich header -->
    <div class="designer-header">
      <!-- Leaf pattern overlay -->
      <div class="designer-header-pattern"></div>

      <!-- Top Row -->
      <div class="designer-header-top">
        <div class="designer-header-identity">
          <div class="designer-header-icon-wrap">
            <NookIcon name="designer" class="w-full h-full object-contain drop-shadow-sm p-1.5 z-10 relative" />
          </div>
          <div class="designer-header-title-group">
            <h1 class="designer-header-title">Island Designer</h1>
            <p class="text-[9px] font-bold text-white/70 m-0 uppercase tracking-wider">Nook Inc. Construction</p>
          </div>
        </div>

        <div class="designer-header-actions">
          {#if gitUrl}
            <a 
              href={gitUrl} 
              target="_blank" 
              rel="noreferrer" 
              class="designer-header-btn designer-header-btn-ghost"
              title="Source Code"
            >
              <Code class="w-3.5 h-3.5 stroke-[2.5px]" />
            </a>
          {/if}
          <button
            onclick={ctx.handleHomeButton}
            class="designer-header-btn designer-header-btn-close"
            title="Close App"
          >
            <X class="w-3.5 h-3.5 stroke-[3px]" />
          </button>
        </div>
      </div>

      <!-- Description -->
      <p class="designer-header-desc">{description}</p>

      <!-- Collapse handle -->
      <button
        onclick={() => isCollapsed = true}
        class="designer-header-collapse-trigger"
      >
        <div class="designer-header-collapse-pill"></div>
      </button>
    </div>
  {/if}

  <div class="flex-1 w-full relative">
    <iframe 
      src={siteUrl} 
      title="Island Designer"
      class="w-full h-full border-0 absolute inset-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  </div>
</div>

<style>
  /* ── Collapsed Handle ─────────────────────────────── */
  .designer-header-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 22px;
    background: linear-gradient(180deg, #cca054 0%, #b28438 100%);
    border: 0;
    border-bottom: 2px solid #855913;
    cursor: pointer;
    padding: 0;
    transition: background 0.15s;
    z-index: 10;
    position: relative;
    flex-shrink: 0;
  }
  .designer-header-handle:hover {
    background: linear-gradient(180deg, #d8ac61 0%, #cca054 100%);
  }
  .designer-header-handle:active {
    transform: scaleY(0.95);
  }
  .designer-header-handle-pill {
    width: 16px;
    height: 3px;
    background: rgba(255, 255, 255, 0.35);
    border-radius: 2px;
  }
  .designer-header-handle-label {
    font-size: 9px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.75);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    line-height: 1;
  }

  /* ── Expanded Header ──────────────────────────────── */
  .designer-header {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    padding: 14px 14px 0 14px;
    background: linear-gradient(135deg, #cca054 0%, #b28438 50%, #996c21 100%);
    border-bottom: 3px solid #855913;
    overflow: hidden;
    flex-shrink: 0;
  }
  .designer-header-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.06;
    pointer-events: none;
    background-image: url('data:image/svg+xml,%3Csvg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M14 4c2 3 6 5 6 10s-4 7-6 10c-2-3-6-5-6-10s4-7 6-10z" fill="white" fill-opacity="0.5"/%3E%3C/svg%3E');
    background-size: 22px 22px;
  }

  /* Top row */
  .designer-header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  .designer-header-identity {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .designer-header-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.18);
    border: 2px solid rgba(255, 255, 255, 0.15);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
  }
  .designer-header-title-group {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 3px;
  }
  .designer-header-title {
    font-size: 14px;
    font-weight: 900;
    color: #fff;
    margin: 0;
    line-height: 1.1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Header actions */
  .designer-header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .designer-header-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 0;
    cursor: pointer;
    transition: all 0.2s;
  }
  .designer-header-btn-close {
    background: #cca054;
    border: 2px solid #855913;
    color: #543b09;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
  }
  .designer-header-btn-close:hover {
    background: #d8ac61;
    transform: scale(1.08);
  }
  .designer-header-btn-close:active {
    transform: scale(0.95);
  }
  .designer-header-btn-ghost {
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.85);
  }
  .designer-header-btn-ghost:hover {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
    transform: scale(1.08);
  }
  .designer-header-btn-ghost:active {
    transform: scale(0.95);
  }

  /* Description */
  .designer-header-desc {
    font-size: 9px;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.85);
    margin: 8px 0 0 0;
    line-height: 1.35;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Collapse trigger */
  .designer-header-collapse-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 14px;
    background: transparent;
    border: 0;
    cursor: pointer;
    margin-top: 1px;
    position: relative;
    z-index: 2;
  }
  .designer-header-collapse-pill {
    width: 28px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    transition: background 0.2s;
  }
  .designer-header-collapse-trigger:hover .designer-header-collapse-pill {
    background: rgba(255, 255, 255, 0.5);
  }
</style>
