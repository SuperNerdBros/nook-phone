<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import NookAppIcon from '../atoms/NookAppIcon.svelte';
  import { playSound } from '@/lib/audio';
  import { scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  const ctx = getPhoneContext();

  let cols = 3;
  let rows = $derived(nookState.settings.gridSize || 3);
  let appsPerPage = $derived(cols * rows);

  let pages = $derived.by(() => {
    const apps = ctx.desktopApps;
    const result = [];
    for (let i = 0; i < apps.length; i += appsPerPage) {
      result.push(apps.slice(i, i + appsPerPage));
    }
    return result.length > 0 ? result : [[]];
  });
  
  let currentPage = $state(0);
  let sliderRef: HTMLDivElement;

  let isDragging = $state(false);
  let startX = 0;
  let scrollLeft = 0;

  const handlePointerDown = (e: PointerEvent) => {
    isDragging = true;
    startX = e.pageX - sliderRef.offsetLeft;
    scrollLeft = sliderRef.scrollLeft;
    // Don't prevent default here to allow clicking buttons, but we'll prevent default on move if it's a drag
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // Stop text selection/other drag behavior
    const x = e.pageX - sliderRef.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    sliderRef.scrollLeft = scrollLeft - walk;
  };

  const handlePointerUp = () => {
    isDragging = false;
    // Snap to nearest page is handled automatically by CSS scroll-snap!
  };

  const handleHomeDrop = (e: DragEvent) => {
    e.preventDefault();
    const appId = e.dataTransfer?.getData('appId');
    if (appId) {
      // If dropped anywhere on the homescreen that isn't the dock, remove it from the dock!
      const newDock = [...nookState.dockApps];
      const index = newDock.indexOf(appId);
      if (index !== -1) {
        newDock.splice(index, 1);
        nookState.dockApps = newDock;
      }
    }
  };

  
  const handleDragOverApp = (e: DragEvent, targetId: string) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDropOnApp = (e: DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer?.getData('appId');
    if (!sourceId || sourceId === targetId) return;

    // We only allow reordering additional apps (installedApps) for now.
    const installed = nookState.installedApps || [];
    
    // Check if both source and target are additional apps
    const sourceIdx = installed.indexOf(sourceId);
    const targetIdx = installed.indexOf(targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      // Reorder
      const newArr = [...installed];
      const [removed] = newArr.splice(sourceIdx, 1);
      
      // If we are dropping it after the target, we should maybe insert it after?
      // For simplicity, just insert at targetIdx
      newArr.splice(targetIdx, 0, removed);
      
      nookState.installedApps = newArr;
      nookState.save();
    }
  };


  let dragScrollTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleHomeDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!sliderRef) return;
    
    const threshold = 60; // px from edge
    const rect = sliderRef.getBoundingClientRect();
    
    const isNearLeft = e.clientX < rect.left + threshold;
    const isNearRight = e.clientX > rect.right - threshold;

    if ((isNearLeft || isNearRight) && !dragScrollTimeout) {
      dragScrollTimeout = setTimeout(() => {
        if (isNearLeft && currentPage > 0) {
          playSound('woosh', !nookState.settings.soundEffects);
          sliderRef.scrollTo({ left: (currentPage - 1) * sliderRef.clientWidth, behavior: 'smooth' });
        } else if (isNearRight && currentPage < pages.length - 1) {
          playSound('woosh', !nookState.settings.soundEffects);
          sliderRef.scrollTo({ left: (currentPage + 1) * sliderRef.clientWidth, behavior: 'smooth' });
        }
        dragScrollTimeout = null;
      }, 500); // 500ms hover delay before flipping page
    } else if (!isNearLeft && !isNearRight && dragScrollTimeout) {
      clearTimeout(dragScrollTimeout);
      dragScrollTimeout = null;
    }
  };

  const handleScroll = () => {
    if (!sliderRef) return;
    const scrollX = sliderRef.scrollLeft;
    const width = sliderRef.clientWidth;
    // adding width/2 to scrollX to round to the nearest page
    if (width > 0) {
      const newPage = Math.floor((scrollX + width / 2) / width);
      if (newPage !== currentPage) {
        playSound('woosh', !nookState.settings.soundEffects);
        currentPage = newPage;
      }
    }
  };

  let draggedId = $state<string | null>(null);
  let dragStart = { x: 0, y: 0 };
  let draggedEl: HTMLElement | null = null;
  let hoveredId = $state<string | null>(null);

  const handleAppPointerDown = (e: PointerEvent, appId: string) => {
    if (!ctx.isEditMode) return;
    draggedId = appId;
    hoveredId = appId;
    dragStart = { x: e.clientX, y: e.clientY };
    draggedEl = e.currentTarget as HTMLElement;
    draggedEl.setPointerCapture(e.pointerId);
  };

  const handleAppPointerMove = (e: PointerEvent, appId: string) => {
    if (draggedId !== appId || !draggedEl) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    draggedEl.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
    draggedEl.style.zIndex = '100';
    draggedEl.style.pointerEvents = 'none';
    draggedEl.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';

    // Find element under pointer
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const targetIcon = el?.closest('[data-app-id]') as HTMLElement;
    if (targetIcon) {
      const targetId = targetIcon.getAttribute('data-app-id');
      if (targetId && targetId !== draggedId) {
        hoveredId = targetId;
      }
    } else {
      hoveredId = draggedId;
    }
  };

  const handleAppPointerUp = (e: PointerEvent, appId: string) => {
    if (draggedId === appId && draggedEl) {
      draggedEl.releasePointerCapture(e.pointerId);
      draggedEl.style.transform = '';
      draggedEl.style.zIndex = '';
      draggedEl.style.pointerEvents = '';
      draggedEl.style.boxShadow = '';

      if (hoveredId && hoveredId !== appId) {
        // Swap them in nookState.pinnedApps!
        const pinned = [...nookState.pinnedApps];
        const idx1 = pinned.indexOf(appId);
        const idx2 = pinned.indexOf(hoveredId);
        if (idx1 !== -1 && idx2 !== -1) {
          pinned[idx1] = hoveredId;
          pinned[idx2] = appId;
          nookState.pinnedApps = pinned;
          nookState.save();
          if (nookState.settings.soundEffects) {
            import('@/lib/audio').then(({ playSound }) => playSound('stamp'));
          }
        }
      }
      draggedId = null;
      hoveredId = null;
      draggedEl = null;
    }
  };
</script>

<div 
  class="absolute inset-0 flex flex-col pb-2"
  ondrop={handleHomeDrop}
  ondragover={handleHomeDragOver}
  onclick={(e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-app-id]') && !target.closest('button')) {
      if (ctx.isEditMode) {
        ctx.isEditMode = false;
        if (nookState.settings.soundEffects) {
          import('@/lib/audio').then(({ playSound }) => playSound('switch'));
        }
      }
    }
  }}
>
  <div class="text-center text-[#807256] font-['Varela_Round',sans-serif] text-[35px] font-bold mt-[30px] mb-[15px] min-h-[42px] drop-shadow-sm flex items-center justify-center shrink-0 select-none">
    {ctx.hoveredAppName}
  </div>
  
  <div 
    bind:this={sliderRef}
    onscroll={handleScroll}
    onpointerdown={(e) => { if (!ctx.isEditMode) handlePointerDown(e); }}
    onpointermove={(e) => { if (!ctx.isEditMode) handlePointerMove(e); }}
    onpointerup={(e) => { if (!ctx.isEditMode) handlePointerUp(); }}
    onpointerleave={(e) => { if (!ctx.isEditMode) handlePointerUp(); }}
    class={`flex-1 flex hide-scrollbar relative z-10 w-full ${isDragging ? '' : 'snap-x snap-mandatory'} ${ctx.isEditMode ? 'overflow-visible' : 'overflow-x-auto'}`}
    style="touch-action: pan-y;"
  >
    {#each pages as page, i}
      <div class={`w-full h-full shrink-0 snap-center flex flex-col items-center ${ctx.isEditMode ? 'overflow-visible' : ''}`}>
        <div class={`w-full max-w-full grid gap-y-[24px] gap-x-[10px] px-[30px] pt-[10px] justify-items-center content-start grid-cols-3 ${ctx.isEditMode ? 'overflow-visible' : ''}`}>
          {#if !ctx.isBooting && !nookState.isPhoneLocked}
            {#each page as app, index (app.id || app.name)}
              <div 
                in:scale={{ duration: 400, delay: index * 40, start: 0.5, easing: backOut }}
                class={`transition-all duration-200 ${hoveredId === (app.id || app.name) && draggedId !== (app.id || app.name) ? 'ring-4 ring-dashed ring-[#8cc3b0] scale-95 rounded-3xl' : ''}`}
                ondragover={(e) => handleDragOverApp(e, app.id || app.name)}
                ondrop={(e) => handleDropOnApp(e, app.id || app.name)}
                onpointerdown={(e) => handleAppPointerDown(e, app.id || app.name)}
                onpointermove={(e) => handleAppPointerMove(e, app.id || app.name)}
                onpointerup={(e) => handleAppPointerUp(e, app.id || app.name)}
              >
                <NookAppIcon 
                  app={app} 
                  size="lg" 
                  showText={false}
                  onClick={() => ctx.handleAppLaunch(app.id || app.name)}
                  onMouseEnter={() => ctx.hoveredAppName = app.name}
                  onMouseLeave={() => ctx.hoveredAppName = "NookPhone"}
                />
              </div>
            {/each}
          {/if}
        </div>
      </div>
    {/each}
  </div>
  {#if pages.length > 1}
    {#if currentPage > 0}
      <button 
        onclick={() => { playSound('woosh', !nookState.settings.soundEffects); sliderRef?.scrollTo({ left: (currentPage - 1) * sliderRef.clientWidth, behavior: 'smooth' }); }}
        class="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-transparent border-0 outline-none cursor-pointer p-0 active:scale-95 transition-transform duration-100"
        aria-label="Previous Page"
        style="filter: drop-shadow(0 3px 4px rgba(0,0,0,0.25));"
      >
        <svg width="28" height="46" viewBox="0 0 28 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Rounded triangle badge pointing left -->
          <path d="M26 4 C26 4, 26 1, 23 1 C21 1, 20 2.5, 20 2.5 L3 20 C0.5 22, 0.5 24, 3 26 L20 43.5 C20 43.5, 21 45, 23 45 C26 45, 26 42, 26 42 Z" fill="#f0a41a"/>
          <path d="M25 4 C25 4, 25 2.5, 23 2.5 C21.5 2.5, 20.5 3.5, 20.5 3.5 L3.5 21 C1.5 22.5, 1.5 23.5, 3.5 25 L20.5 42.5 C20.5 42.5, 21.5 43.5, 23 43.5 C25 43.5, 25 42, 25 42 Z" fill="#ffd04a" opacity="0.5"/>
        </svg>
      </button>
    {/if}
    {#if currentPage < pages.length - 1}
      <button 
        onclick={() => { playSound('woosh', !nookState.settings.soundEffects); sliderRef?.scrollTo({ left: (currentPage + 1) * sliderRef.clientWidth, behavior: 'smooth' }); }}
        class="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-transparent border-0 outline-none cursor-pointer p-0 active:scale-95 transition-transform duration-100"
        aria-label="Next Page"
        style="filter: drop-shadow(0 3px 4px rgba(0,0,0,0.25));"
      >
        <svg width="28" height="46" viewBox="0 0 28 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Rounded triangle badge pointing right -->
          <path d="M2 4 C2 4, 2 1, 5 1 C7 1, 8 2.5, 8 2.5 L25 20 C27.5 22, 27.5 24, 25 26 L8 43.5 C8 43.5, 7 45, 5 45 C2 45, 2 42, 2 42 Z" fill="#f0a41a"/>
          <path d="M3 4 C3 4, 3 2.5, 5 2.5 C6.5 2.5, 7.5 3.5, 7.5 3.5 L24.5 21 C26.5 22.5, 26.5 23.5, 24.5 25 L7.5 42.5 C7.5 42.5, 6.5 43.5, 5 43.5 C3 43.5, 3 42, 3 42 Z" fill="#ffd04a" opacity="0.5"/>
        </svg>
      </button>
    {/if}
  {/if}

  <!-- Pagination Dots -->
  <div class="flex justify-center items-center gap-2 mt-1 h-[14px] shrink-0">
    {#each pages as _, i}
      <button 
        onclick={() => { if (i !== currentPage) playSound('woosh', !nookState.settings.soundEffects); sliderRef?.scrollTo({ left: i * sliderRef.clientWidth, behavior: 'smooth' }); }}
        class={`h-2 rounded-full transition-all duration-300 border-0 p-0 cursor-pointer ${i === currentPage ? 'bg-[#5fbba9] w-4' : 'bg-[#e0d6b8] w-2 hover:bg-[#c2b694]'}`}
        aria-label={`Go to page ${i + 1}`}
      ></button>
    {/each}
  </div>
</div>

<style>
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>
