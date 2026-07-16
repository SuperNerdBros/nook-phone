<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import type { MapBuilding } from "@/lib/nookData";
  import { Navigation, MapPin, Layers, Info, Check } from "@lucide/svelte";

  let selectedBuilding = $state<MapBuilding | null>(null);
  let draggedBuildingId = $state<string | null>(null);

  const handleGridClick = (e: MouseEvent) => {
    if (draggedBuildingId) {
      const target = e.currentTarget as HTMLDivElement;
      const rect = target.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      nookState.moveBuilding(draggedBuildingId, x, y);
      draggedBuildingId = null;
    }
  };

  const handleBuildingSelect = (b: MapBuilding, e: Event) => {
    e.stopPropagation();
    selectedBuilding = b;
  };
</script>

<div id="map-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <div class="bg-[#8ec3b0] text-[#1b4332] p-4 pt-6 ac-wavy-header flex justify-between items-center z-10 shrink-0">
    <div>
      <h1 class="text-xl font-bold flex items-center gap-1.5">🗺️ Island Map Pro</h1>
      <p class="text-xs opacity-90">View coordinates & manage island layout</p>
    </div>
  </div>

  <!-- Main split display -->
  <div class="flex-1 overflow-hidden flex flex-col relative bg-[#f1fcf5]">
    <!-- Instructions -->
    <div class="p-3 bg-[#e2f3e8] border-b border-[#c8e3d3] text-[11px] text-[#2d5a27] leading-relaxed flex flex-col gap-1">
      <p class="font-semibold flex items-center gap-1">
        <Info class="w-3.5 h-3.5" /> Construction Permit Active:
      </p>
      <p>
        {#if draggedBuildingId}
          📌 Tap anywhere on the island map below to relocate the building!
        {:else}
          🗺️ Select any landmark or click 'Relocate' to move Resident Services, houses, and shops!
        {/if}
      </p>
    </div>

    <!-- Map Stage Canvas -->
    <div class="flex-1 p-4 relative flex items-center justify-center">
      <div
        onclick={handleGridClick}
        onkeydown={(e) => e.key === 'Enter' && handleGridClick(e as any)}
        role="button"
        tabindex="0"
        class="w-full aspect-[4/3] bg-[#87c38f]/30 border-4 border-[#b2dbb2] rounded-3xl relative overflow-hidden shadow-inner max-w-[320px]"
        style="background-image: radial-gradient(#b2dbb2 15%, transparent 15%); background-size: 20px 20px"
      >
        <!-- Draw Simulated Coastline Rivers -->
        <div class="absolute inset-x-0 bottom-0 h-4 bg-blue-300/60"></div> <!-- South Coast -->
        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-24 bg-blue-300/40 rounded-r-3xl"></div> <!-- Estuary -->

        <!-- Building pins -->
        {#each nookState.map.buildings as b (b.id)}
          {@const selected = selectedBuilding?.id === b.id}
          {@const isMoving = b.id === draggedBuildingId}

          <button
            onclick={(e) => handleBuildingSelect(b, e)}
            style={`left: ${b.x}%; top: ${b.y}%`}
            class={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all flex flex-col items-center gap-1 group z-10 ${
              isMoving
                ? "animate-bounce ring-4 ring-orange-500 bg-orange-100 z-30"
                : selected
                ? "ring-4 ring-[#8ec3b0] bg-white scale-110 z-20 shadow-md"
                : "bg-[#fbf9f0] border border-gray-200 hover:scale-105 shadow-sm"
            }`}
            title={b.name}
          >
            <span class="text-sm leading-none">{b.icon}</span>
            <span class="absolute bottom-full bg-slate-800/90 text-white text-[8px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
              {b.name}
            </span>
          </button>
        {/each}

        <!-- Grid Coordinates markings -->
        <div class="absolute left-1.5 bottom-1.5 text-[8px] text-gray-400 font-bold font-mono">
          [LAT: {selectedBuilding ? Math.round(selectedBuilding.y) : "00"}, LON: {selectedBuilding ? Math.round(selectedBuilding.x) : "00"}]
        </div>
      </div>
    </div>

    <!-- Selected Landmark Detail Card -->
    {#if selectedBuilding}
      <div class="bg-white border-t-2 border-[#8ec3b0] p-3.5 flex flex-col gap-2 shadow-2xl animate-fade-in shrink-0 z-20 rounded-t-3xl">
        <div class="flex justify-between items-center">
          <div>
            <span class="text-[10px] text-[#2d5a27] font-bold uppercase tracking-wider block">Building Landmark</span>
            <h3 class="font-black text-sm text-[#4c4637] flex items-center gap-1">
              📍 {selectedBuilding.name}
            </h3>
          </div>
          <button
            onclick={() => selectedBuilding = null}
            class="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold"
          >
            Close
          </button>
        </div>

        <p class="text-xs text-gray-500 leading-relaxed">
          This structure is located at coordinate column **{Math.round(selectedBuilding.x)}** and row **{Math.round(selectedBuilding.y)}**.
        </p>

        <!-- Actions for building -->
        <div class="flex gap-2 mt-1">
          <button
            onclick={() => {
              draggedBuildingId = selectedBuilding!.id;
              selectedBuilding = null;
            }}
            class="flex-1 bg-[#8ec3b0] text-white py-2 rounded-xl text-xs font-bold hover:bg-opacity-90 transition active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
          >
            <Layers class="w-3.5 h-3.5" /> Relocate Building
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
