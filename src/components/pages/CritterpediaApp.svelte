<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { crittersData, type Critter } from "@/lib/nookData";
  import { Search, Info, Check, ToggleLeft, ToggleRight, ArrowUpDown } from "@lucide/svelte";
  
  let searchTerm = $state("");
  let activeTab = $state<"bug" | "fish" | "sea">("bug");
  let selectedCritter = $state<Critter | null>(null);
  let caughtOnly = $state(false);

  let hemisphere = $derived(nookState.critters.filterHemisphere);

  const handleHemisphereToggle = () => {
    nookState.setCritterFilters({
      filterHemisphere: hemisphere === "north" ? "south" : "north"
    });
  };

  const handleToggleCaught = (id: string, e: Event) => {
    e.stopPropagation();
    if (nookState.critters.caught.includes(id)) {
      nookState.setCritterFilters({
        caught: nookState.critters.caught.filter(cId => cId !== id)
      });
    } else {
      nookState.catchCritter(id);
    }
  };

  const handleToggleDonated = (id: string, e: Event) => {
    e.stopPropagation();
    if (nookState.critters.donated.includes(id)) {
      nookState.setCritterFilters({
        donated: nookState.critters.donated.filter(dId => dId !== id)
      });
    } else {
      nookState.donateCritter(id);
    }
  };

  let filteredCritters = $derived(crittersData.filter((c) => {
    if (c.type !== activeTab) return false;
    
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isCaught = nookState.critters.caught.includes(c.id);
    const matchesCaught = !caughtOnly || isCaught;

    return matchesSearch && matchesCaught;
  }));

  const getMonthName = (m: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[m - 1];
  };

  const isAvailableThisMonth = (c: Critter) => {
    const currentMonth = new Date().getMonth() + 1;
    const activeMonths = hemisphere === "north" ? c.activeMonthsNorth : c.activeMonthsSouth;
    return activeMonths.includes(currentMonth);
  };
</script>

<div id="critterpedia-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <div class="bg-[#a8df8e] text-[#1c4c1e] p-4 pt-6 ac-wavy-header flex justify-between items-center z-10">
    <div>
      <h1 class="text-xl font-bold flex items-center gap-1.5">🦟 Critterpedia</h1>
      <p class="text-xs opacity-90">Insect, Fish, and Diving logs</p>
    </div>

    <!-- Hemisphere Selector -->
    <button
      onclick={handleHemisphereToggle}
      class="flex items-center gap-1 bg-white text-xs font-bold text-[#1c4c1e] px-2.5 py-1.5 rounded-full shadow-sm hover:bg-opacity-90 transition-all shrink-0"
    >
      {hemisphere === "north" ? "🌐 North" : "🌐 South"}
    </button>
  </div>

  <!-- Navigation Sub-Tabs -->
  <div class="flex bg-[#fbf9f0] border-b border-[#e4dfd0] text-xs z-10 shrink-0">
    {#each ["bug", "fish", "sea"] as tab}
      <button
        onclick={() => {
          activeTab = tab as any;
          selectedCritter = null;
        }}
        class={`flex-1 py-3 font-extrabold text-center uppercase tracking-wider border-b-4 transition-all ${
          activeTab === tab
            ? "border-[#a8df8e] text-green-700 bg-white"
            : "border-transparent text-gray-400 hover:text-gray-600"
        }`}
      >
        {tab === "bug" ? "🐞 Bugs" : tab === "fish" ? "🐟 Fish" : "🤿 Sea"}
      </button>
    {/each}
  </div>

  <!-- Filters Panel -->
  <div class="p-3 bg-[#f4f1e3] border-b border-[#e1d9be] flex items-center gap-2 shrink-0 text-xs">
    <div class="relative flex-1">
      <Search class="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
      <input
        id="critter-search"
        type="text"
        placeholder={`Search ${activeTab}s...`}
        bind:value={searchTerm}
        class="w-full bg-white pl-8 pr-3 py-1.5 rounded-xl border border-[#dcd3be] focus:outline-none focus:ring-2 focus:ring-[#a8df8e] text-[#4c4637] text-xs"
      />
    </div>

    <!-- Filter Caught -->
    <button
      onclick={() => caughtOnly = !caughtOnly}
      class={`px-2.5 py-1.5 rounded-xl font-bold border transition-all shrink-0 flex items-center gap-1 ${
        caughtOnly
          ? "bg-[#a8df8e] text-green-800 border-green-300"
          : "bg-white text-gray-500 border-[#dcd3be] hover:bg-gray-50"
      }`}
    >
      {caughtOnly ? "✓ Caught" : "All"}
    </button>
  </div>

  <!-- Main Content Area -->
  <div class="flex-1 overflow-hidden flex flex-col md:flex-row relative">
    <!-- Critter Grid -->
    <div class="flex-1 overflow-y-auto p-3 ac-scrollbar grid grid-cols-2 gap-3 self-stretch">
      {#each filteredCritters as c (c.id)}
        {@const caught = nookState.critters.caught.includes(c.id)}
        {@const donated = nookState.critters.donated.includes(c.id)}
        {@const activeNow = isAvailableThisMonth(c)}

        <div
          onclick={() => selectedCritter = c}
          onkeydown={(e) => e.key === 'Enter' && (selectedCritter = c)}
          role="button"
          tabindex="0"
          class={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative hover:scale-[1.02] ${
            selectedCritter?.id === c.id
              ? "bg-[#eaf6e3] border-green-400 ring-2 ring-green-300/30 shadow-md"
              : caught
              ? "bg-white border-[#edd8aa] shadow-sm"
              : "bg-[#faf9f5] border-gray-200 opacity-80"
          }`}
        >
          <!-- Active/Seasonal indicator -->
          {#if activeNow}
            <span class="absolute right-2 top-2 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" title="Active this month"></span>
          {/if}

          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-bold text-gray-400">#{c.id}</span>
            <span class="font-extrabold text-sm text-[#4c4637] leading-tight pr-2">
              {c.name}
            </span>
          </div>

          <!-- Badges for Caught and Donated -->
          <div class="flex gap-1.5 mt-3 pt-2 border-t border-gray-100">
            <button
              onclick={(e) => handleToggleCaught(c.id, e)}
              class={`px-2 py-0.5 rounded-full text-[9px] font-bold transition flex items-center gap-0.5 ${
                caught ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400 hover:bg-amber-50"
              }`}
            >
              🕸️ Caught
            </button>
            <button
              onclick={(e) => handleToggleDonated(c.id, e)}
              class={`px-2 py-0.5 rounded-full text-[9px] font-bold transition flex items-center gap-0.5 ${
                donated ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400 hover:bg-green-50"
              }`}
            >
              🏛️ Donated
            </button>
          </div>
        </div>
      {/each}

      {#if filteredCritters.length === 0}
        <div class="col-span-2 text-center py-16 text-gray-400 text-sm">
          No creatures found matching search.
        </div>
      {/if}
    </div>

    <!-- Floating details pane for selection -->
    {#if selectedCritter}
      <div class="absolute inset-x-0 bottom-0 bg-[#fbf9f0] border-t-4 border-[#a8df8e] p-4 flex flex-col gap-3 rounded-t-3xl shadow-2xl animate-fade-in z-20 max-h-[60%] overflow-y-auto ac-scrollbar">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[10px] font-bold text-[#caa253] tracking-widest uppercase">
              {selectedCritter.type} Detail Log
            </span>
            <h2 class="text-xl font-black text-[#4c4637]">{selectedCritter.name}</h2>
          </div>
          <button
            onclick={() => selectedCritter = null}
            class="text-xs bg-gray-200 text-gray-500 hover:bg-gray-300 px-2.5 py-1 rounded-full font-bold"
          >
            Close
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs text-[#5c5446]">
          <!-- Sell Price -->
          <div class="bg-white p-2 rounded-xl border border-gray-100">
            <span class="text-[9px] text-gray-400 uppercase font-bold block">Sell Value</span>
            <span class="font-extrabold text-amber-600 font-mono text-sm">
              💰 {selectedCritter.price.toLocaleString()} Bells
            </span>
          </div>

          <!-- Location -->
          <div class="bg-white p-2 rounded-xl border border-gray-100">
            <span class="text-[9px] text-gray-400 uppercase font-bold block">Habitat</span>
            <span class="font-extrabold">{selectedCritter.location}</span>
          </div>

          <!-- Active Hours -->
          <div class="bg-white p-2 rounded-xl border border-gray-100">
            <span class="text-[9px] text-gray-400 uppercase font-bold block">Active Hours</span>
            <span class="font-semibold">{selectedCritter.activeHours}</span>
          </div>

          <!-- Shadow size (if applicable) -->
          {#if selectedCritter.shadowSize}
            <div class="bg-white p-2 rounded-xl border border-gray-100">
              <span class="text-[9px] text-gray-400 uppercase font-bold block">Shadow Dimensions</span>
              <span class="font-semibold">{selectedCritter.shadowSize}</span>
            </div>
          {/if}
        </div>

        <!-- Active Seasons Map -->
        <div class="bg-white p-3 rounded-2xl border border-gray-100 flex flex-col gap-1.5">
          <span class="text-[9px] text-gray-400 uppercase font-bold tracking-wider block">
            Active Calendar Months ({hemisphere === "north" ? "North" : "South"})
          </span>
          <div class="grid grid-cols-6 gap-1 text-[10px] text-center font-bold">
            {#each Array.from({ length: 12 }, (_, i) => i + 1) as m}
              {@const activeMonths = hemisphere === "north" ? selectedCritter.activeMonthsNorth : selectedCritter.activeMonthsSouth}
              {@const isActive = activeMonths.includes(m)}
              <div
                class={`p-1 rounded-md border ${
                  isActive
                    ? "bg-green-100 text-green-800 border-green-300 font-extrabold"
                    : "bg-gray-50 text-gray-300 border-gray-100 font-normal"
                }`}
              >
                {getMonthName(m)}
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
