<script lang="ts">
  import nookState from '@/lib/nookState.svelte';

  const LANDSCAPES = [
    { id: "grass", name: "Grass", color: "#86efac", icon: "🌱" },
    { id: "brick", name: "Brick Path", color: "#fca5a5", icon: "🧱" },
    { id: "stone", name: "Stone Path", color: "#cbd5e1", icon: "🪨" },
    { id: "sand", name: "Sand Path", color: "#fef08a", icon: "🏖️" },
    { id: "water", name: "Canal Water", color: "#93c5fd", icon: "💧" },
    { id: "cliff", name: "Clifftop Cliff", color: "#d97706", icon: "🪵" }
  ];

  let activeLandscape = $state(LANDSCAPES[1]);
  let grid = $state<string[][]>(Array(10).fill(null).map(() => Array(10).fill("#86efac")));

  const handleCellClick = (r: number, c: number) => {
    grid[r][c] = activeLandscape.color;
    grid = [...grid];
    nookState.triggerAchievementProgress("m5", 1);
  };

  const handleClear = () => {
    if (confirm("Reset island sandbox to green grass?")) {
      grid = Array(10).fill(null).map(() => Array(10).fill("#86efac"));
    }
  };
</script>

<div id="designer-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <div class="bg-[#cca054] text-[#543b09] p-4 pt-6 ac-wavy-header flex justify-between items-center z-10 shrink-0">
    <div>
      <h1 class="text-xl font-bold flex items-center gap-1.5">🪘 Island Designer</h1>
      <p class="text-xs opacity-90">Permit active: Edit terrain & paths</p>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-4 ac-scrollbar flex flex-col justify-between items-center text-center gap-4 relative bg-[#f7f5eb]">
    
    <!-- Instructions -->
    <div class="bg-[#f0e8cf] text-[#543b09] rounded-2xl p-3 border border-[#cca054]/40 text-xs text-left w-full leading-relaxed flex flex-col gap-1">
      <span class="font-extrabold flex items-center gap-1">👷 Landscaping Sandbox Mode</span>
      <p>
        Choose a construction permit below and tap cell segments to build custom clifftops, water canals, sand, stone, or brick paths!
      </p>
    </div>

    <!-- Sandbox Canvas Grid -->
    <div class="border-4 border-[#cca054]/50 rounded-3xl overflow-hidden shadow-inner bg-white max-w-[260px] aspect-square w-full">
      <div class="grid grid-cols-10 grid-rows-10 w-full h-full gap-[1px] bg-[#eedcaf]/20">
        {#each grid as row, r}
          {#each row as color, c}
            {@const landmark = LANDSCAPES.find(l => l.color === color) || LANDSCAPES[0]}
            <button
              onclick={() => handleCellClick(r, c)}
              style="background-color: {color}"
              class="aspect-square flex items-center justify-center text-[10px] hover:scale-105 active:scale-90 transition border border-black/5"
              title="{landmark.name} segment"
            >
              {#if landmark.icon !== "🌱"}
                {landmark.icon}
              {/if}
            </button>
          {/each}
        {/each}
      </div>
    </div>

    <!-- Tool Selector List -->
    <div class="flex flex-col gap-1.5 w-full bg-white p-3 rounded-2xl border border-gray-100 mt-2 shrink-0 z-10">
      <span class="text-[10px] font-bold text-gray-500 uppercase text-left block">Active Construction Permits</span>
      
      <div class="grid grid-cols-3 gap-2">
        {#each LANDSCAPES as l}
          {@const selected = activeLandscape.id === l.id}
          <button
            onclick={() => activeLandscape = l}
            class="p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 justify-center {
              selected
                ? 'bg-[#cca054] text-white border-[#cca054] shadow-sm scale-105'
                : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
            }"
          >
            <span class="text-sm shrink-0">{l.icon}</span>
            <span class="truncate">{l.name.replace(" Path", "").replace(" Cliff", "").replace(" Water", "")}</span>
          </button>
        {/each}
      </div>

      <button
        onclick={handleClear}
        class="w-full bg-gray-100 text-gray-500 py-1.5 rounded-xl text-[10px] font-bold mt-1.5 hover:bg-gray-200"
      >
        Reset Island Map to Grass 🌱
      </button>
    </div>
  </div>
</div>
