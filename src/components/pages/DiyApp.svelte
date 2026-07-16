<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { diyData, type DIYRecipe } from "@/lib/nookData";
  import { Hammer, Search, ChefHat, Check, Award, Flame } from "@lucide/svelte";

  let searchTerm = $state("");
  let activeCategory = $state<"all" | "tools" | "furniture" | "cooking">("all");
  let selectedRecipe = $state<DIYRecipe | null>(null);
  let isCrafting = $state(false);
  let craftedItemName = $state<string | null>(null);

  let filteredRecipes = $derived(diyData.filter((r) => {
    const isUnlocked = nookState.diy.unlockedRecipes.includes(r.id);
    if (!isUnlocked) return false;

    const matchesCategory = activeCategory === "all" || r.category === activeCategory;
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  }));

  const handleCraft = (recipe: DIYRecipe) => {
    isCrafting = true;
    craftedItemName = recipe.name;

    setTimeout(() => {
      nookState.craftRecipe(recipe.id);
      isCrafting = false;
    }, 2000);
  };
</script>

<div id="diy-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <div class="bg-[#e49b6b] text-[#542100] p-4 pt-6 ac-wavy-header flex justify-between items-center z-10">
    <div>
      <h1 class="text-xl font-bold flex items-center gap-1.5">🔨 DIY Recipes+</h1>
      <p class="text-xs opacity-90">Craft tools, furniture, and cook meals</p>
    </div>

    <div class="bg-[#fef9f0] px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-800 shadow-sm shrink-0">
      Crafted: {nookState.diy.craftedCount} times
    </div>
  </div>

  <!-- Categories -->
  <div class="flex bg-[#fbf9f0] border-b border-[#e4dfd0] text-xs shrink-0 z-10">
    {#each ["all", "tools", "furniture", "cooking"] as cat}
      <button
        onclick={() => {
          activeCategory = cat as any;
          selectedRecipe = null;
        }}
        class={`flex-1 py-3 font-extrabold text-center uppercase tracking-wider border-b-4 transition-all ${
          activeCategory === cat
            ? "border-[#e49b6b] text-[#542100] bg-white"
            : "border-transparent text-gray-400 hover:text-gray-600"
        }`}
      >
        {cat === "all" ? "📂 All" : cat === "tools" ? "🔧 Tools" : cat === "furniture" ? "🪑 Furn" : "🍳 Cook"}
      </button>
    {/each}
  </div>

  <!-- Search Bar -->
  <div class="p-3 bg-[#f4f1e3] border-b border-[#e1d9be] shrink-0 text-xs">
    <div class="relative">
      <Search class="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
      <input
        id="diy-search"
        type="text"
        placeholder="Search collected recipes..."
        bind:value={searchTerm}
        class="w-full bg-white pl-8 pr-3 py-1.5 rounded-xl border border-[#dcd3be] focus:outline-none focus:ring-2 focus:ring-[#e49b6b] text-[#4c4637] text-xs"
      />
    </div>
  </div>

  <!-- Main split display -->
  <div class="flex-1 overflow-hidden flex flex-col md:flex-row relative">
    <!-- Recipe Grid -->
    <div class="flex-1 overflow-y-auto p-3 ac-scrollbar grid grid-cols-2 gap-3 self-stretch">
      {#each filteredRecipes as r (r.id)}
        {@const isCooking = r.category === "cooking"}
        {@const selected = selectedRecipe?.id === r.id}

        <div
          onclick={() => selectedRecipe = r}
          onkeydown={(e) => e.key === 'Enter' && (selectedRecipe = r)}
          role="button"
          tabindex="0"
          class={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between items-start gap-1 relative hover:scale-[1.02] ${
            selected
              ? "bg-[#faf0e6] border-[#e49b6b] ring-2 ring-[#e49b6b]/30 shadow-md"
              : "bg-white border-gray-100 shadow-sm"
          }`}
        >
          <div class="flex items-center gap-1">
            {#if isCooking}
              <ChefHat class="w-3.5 h-3.5 text-red-400 shrink-0" />
            {:else}
              <Hammer class="w-3.5 h-3.5 text-amber-500 shrink-0" />
            {/if}
            <span class="text-[9px] uppercase font-bold text-gray-400">{r.category}</span>
          </div>

          <h3 class="font-extrabold text-xs text-[#4c4637] leading-tight pt-1">
            {r.name}
          </h3>

          <span class="text-[9px] text-gray-400 mt-2">Source: {r.source}</span>
        </div>
      {/each}

      {#if filteredRecipes.length === 0}
        <div class="col-span-2 text-center py-16 text-gray-400 text-sm">
          No recipes collected. Unlock some at Nook Shopping!
        </div>
      {/if}
    </div>

    <!-- Selected Recipe Details Overlay -->
    {#if selectedRecipe}
      <div class="absolute inset-x-0 bottom-0 bg-[#fbf9f0] border-t-4 border-[#e49b6b] p-4 flex flex-col gap-3 rounded-t-3xl shadow-2xl animate-fade-in z-20 max-h-[70%] overflow-y-auto ac-scrollbar">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[10px] font-bold text-[#e49b6b] tracking-wider uppercase">
              Recipe Card - {selectedRecipe.category}
            </span>
            <h2 class="text-lg font-black text-[#4c4637]">{selectedRecipe.name}</h2>
          </div>
          <button
            onclick={() => selectedRecipe = null}
            class="text-xs bg-gray-200 text-gray-500 hover:bg-gray-300 px-2.5 py-1 rounded-full font-bold"
          >
            Close
          </button>
        </div>

        <!-- Materials List -->
        <div class="bg-white p-3 rounded-2xl border border-gray-100 flex flex-col gap-2">
          <span class="text-[9px] text-gray-400 uppercase font-bold">Materials Checklist</span>
          <div class="flex flex-col gap-1.5 text-xs">
            {#each selectedRecipe.materials as mat, i}
              <div class="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                <span class="font-bold text-gray-600">🍂 {mat.name}</span>
                <span class="font-mono text-gray-500 bg-white px-2 py-0.5 rounded-md border text-[10px]">
                  Required: {mat.qty}
                </span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Action Craft Button -->
        <button
          onclick={() => handleCraft(selectedRecipe!)}
          class="w-full bg-[#e49b6b] text-white py-2.5 rounded-2xl text-xs font-black shadow-md hover:bg-opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Hammer class="w-4 h-4" /> Craft/Cook item
        </button>
      </div>
    {/if}
  </div>

  <!-- Hammer Crafting Animation Overlay -->
  {#if isCrafting}
    <div class="absolute inset-0 bg-[#4c4637]/80 flex flex-col items-center justify-center gap-4 z-50 text-white animate-fade-in">
      <div class="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border-4 border-dashed border-white animate-spin">
        <Hammer class="w-10 h-10 text-amber-300 animate-bounce" />
      </div>
      <div class="text-center">
        <h2 class="text-lg font-black tracking-wide">Crafting...</h2>
        <p class="text-xs opacity-75">🍂 Sourcing and assembling materials 🔨</p>
      </div>
    </div>
  {/if}

  <!-- Crafted Success Announcement -->
  {#if craftedItemName && !isCrafting}
    <div class="absolute inset-0 bg-[#e49b6b]/95 flex flex-col items-center justify-center gap-4 z-40 text-white animate-flash p-4">
      <div class="bg-white p-6 rounded-3xl text-center text-[#4c4637] flex flex-col items-center gap-3 max-w-xs shadow-2xl">
        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 animate-bounce">
          <Award class="w-10 h-10" />
        </div>
        <div>
          <h2 class="text-xs uppercase tracking-widest text-[#caa253] font-bold">Successfully Created</h2>
          <p class="text-lg font-black mt-0.5">{craftedItemName}</p>
        </div>
        <p class="text-xs text-gray-500 leading-relaxed">
          Wonderful! You created the item using your workbench recipes. Your accomplishments have been added to your passport!
        </p>
        <button
          onclick={() => craftedItemName = null}
          class="mt-2 w-full bg-[#e49b6b] text-white py-2 rounded-xl text-xs font-bold hover:bg-opacity-90"
        >
          Yahoo! Close
        </button>
      </div>
    </div>
  {/if}
</div>
