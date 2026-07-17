<script lang="ts">
  import { Globe, Code, ChevronRight, X } from "@lucide/svelte";
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import { projectsData } from '@/lib/nookData';
  import NookIcon from '../atoms/NookIcon.svelte';

  const ctx = getPhoneContext();
  let isCollapsed = $state(false);

  const currentProject = projectsData.find(p => p.name === 'Animal Crossing Pattern Tool') || {
    name: 'Animal Crossing Pattern Tool',
    appIcon: 'designs',
    site: 'https://acpatterns.com/',
    description: 'Pattern designer compatible with NL, HHD, and NH'
  };

  function getHostname(urlStr: string) {
    try {
      return new URL(urlStr).hostname;
    } catch {
      return urlStr;
    }
  }
</script>

<div id="designs-app" class="flex flex-col h-full ac-app-screen relative">
  {#if isCollapsed}
    <!-- Collapsed: Thin pull-tab handle -->
    <button
      onclick={() => isCollapsed = false}
      class="ext-header-handle"
    >
      <div class="ext-header-handle-pill"></div>
      <span class="ext-header-handle-label">{currentProject.name}</span>
      <div class="ext-header-handle-pill"></div>
    </button>
  {:else}
    <!-- Expanded: Full rich header -->
    <div class="ext-header">
      <!-- Leaf pattern overlay -->
      <div class="ext-header-pattern"></div>

      <!-- Top Row -->
      <div class="ext-header-top">
        <div class="ext-header-identity">
          <div class="ext-header-icon-wrap">
            <NookIcon name="designs" class="w-full h-full object-contain drop-shadow-sm p-1.5 z-10 relative" />
          </div>
          <div class="ext-header-title-group">
            <h1 class="ext-header-title">{currentProject.name}</h1>
            {#if currentProject.site}
              <a 
                href={currentProject.site} 
                target="_blank" 
                rel="noreferrer" 
                class="ext-header-powered-badge"
              >
                <Globe class="w-2.5 h-2.5 shrink-0" />
                <span>{getHostname(currentProject.site)}</span>
              </a>
            {/if}
          </div>
        </div>

        <div class="ext-header-actions">
          {#if currentProject.git}
            <a 
              href={currentProject.git} 
              target="_blank" 
              rel="noreferrer" 
              class="ext-header-btn ext-header-btn-ghost"
              title="Source Code"
            >
              <Code class="w-3.5 h-3.5 stroke-[2.5px]" />
            </a>
          {/if}
          <button
            onclick={ctx.handleHomeButton}
            class="ext-header-btn ext-header-btn-close"
            title="Close App"
          >
            <X class="w-3.5 h-3.5 stroke-[3px]" />
          </button>
        </div>
      </div>

      <!-- Description -->
      {#if currentProject.description}
        <p class="ext-header-desc">{currentProject.description}</p>
      {/if}

      <!-- Collapse handle -->
      <button
        onclick={() => isCollapsed = true}
        class="ext-header-collapse-trigger"
      >
        <div class="ext-header-collapse-pill"></div>
      </button>
    </div>
  {/if}

  <!-- Outer splits -->
  <div class="flex-1 flex overflow-hidden bg-white">
    <iframe 
      src="https://acpatterns.com/editor" 
      class="w-full h-full border-0"
      title="Animal Crossing Pattern Tool"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  </div>
</div>

<style>
  /* ── Collapsed Handle ─────────────────────────────── */
  .ext-header-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 22px;
    background: linear-gradient(180deg, #f08bb2 0%, #d56e94 100%);
    border: 0;
    border-bottom: 2px solid #b34a71;
    cursor: pointer;
    padding: 0;
    transition: background 0.15s;
    z-index: 10;
    position: relative;
    shrink: 0;
  }
  .ext-header-handle:hover {
    background: linear-gradient(180deg, #f7a4c2 0%, #f08bb2 100%);
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
    background: linear-gradient(135deg, #fdafb2 0%, #f08bb2 50%, #d56e94 100%);
    border-bottom: 3px solid #b34a71;
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
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: rgba(255,255,255,0.18);
    border: 2px solid rgba(255,255,255,0.15);
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
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

  /* Powered By badge */
  .ext-header-powered-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.9);
    font-size: 9px;
    font-weight: 800;
    padding: 2px 8px 2px 5px;
    border-radius: 20px;
    text-decoration: none;
    transition: all 0.15s;
    width: fit-content;
    backdrop-filter: blur(4px);
  }
  .ext-header-powered-badge:hover {
    background: rgba(255,255,255,0.3);
    color: #fff;
  }

  /* Action buttons */
  .ext-header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .ext-header-btn {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
  }
  .ext-header-btn:active {
    transform: scale(0.9);
  }
  .ext-header-btn-ghost {
    background: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.85);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .ext-header-btn-ghost:hover {
    background: rgba(255,255,255,0.28);
    color: #fff;
  }
  .ext-header-btn-close {
    background: rgba(255,255,255,0.92);
    color: #541330;
    box-shadow: 0 2px 4px rgba(0,0,0,0.12);
  }
  .ext-header-btn-close:hover {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  }

  /* Description */
  .ext-header-desc {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255,255,255,0.85);
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
</style>
