<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import NookAppIcon from '../atoms/NookAppIcon.svelte';

  const ctx = getPhoneContext();

  let cols = $derived(nookState.settings.gridSize || 3);
  let rows = 3;
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

  const handleHomeDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleScroll = () => {
    if (!sliderRef) return;
    const scrollX = sliderRef.scrollLeft;
    const width = sliderRef.clientWidth;
    // adding width/2 to scrollX to round to the nearest page
    if (width > 0) {
      currentPage = Math.floor((scrollX + width / 2) / width);
    }
  };
</script>

<div 
  class="absolute inset-0 flex flex-col pb-2"
  ondrop={handleHomeDrop}
  ondragover={handleHomeDragOver}
>
  <div class="text-center text-[#807256] font-['Varela_Round',sans-serif] text-[35px] font-bold mt-[30px] mb-[15px] min-h-[42px] drop-shadow-sm flex items-center justify-center shrink-0">
    {ctx.hoveredAppName}
  </div>
  
  <div 
    bind:this={sliderRef}
    onscroll={handleScroll}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointerleave={handlePointerUp}
    class={`flex-1 flex overflow-x-auto hide-scrollbar relative z-10 w-full ${isDragging ? '' : 'snap-x snap-mandatory'}`}
    style="touch-action: pan-y;"
  >
    {#each pages as page, i}
      <div class="w-full h-full shrink-0 snap-center flex flex-col items-center">
        <div class={`w-full max-w-full grid gap-y-[24px] gap-x-[10px] px-[30px] pt-[10px] justify-items-center content-start ${cols === 4 ? 'grid-cols-4 gap-x-2' : cols === 5 ? 'grid-cols-5 gap-x-1' : 'grid-cols-3'}`}>
          {#each page as app (app.id || app.name)}
            <NookAppIcon 
              app={app} 
              size="lg" 
              showText={false}
              onClick={() => ctx.handleAppLaunch(app.id || app.name)}
              onMouseEnter={() => ctx.hoveredAppName = app.name}
              onMouseLeave={() => ctx.hoveredAppName = "NookPhone"}
            />
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Pagination Dots -->
  <div class="flex justify-center items-center gap-2 mt-1 h-[14px] shrink-0">
    {#each pages as _, i}
      <button 
        onclick={() => sliderRef?.scrollTo({ left: i * sliderRef.clientWidth, behavior: 'smooth' })}
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
