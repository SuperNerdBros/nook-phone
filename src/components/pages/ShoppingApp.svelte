<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchNookipediaItems } from '@/lib/api';
  import { 
    Grid, 
    Armchair, 
    Shirt, 
    PaintRoller, 
    Hammer,
    Star,
    Leaf,
    Loader2,
    Search,
    ShoppingBag,
    Send,
    Gift,
    Calendar,
    Sparkles,
    Package
  } from "@lucide/svelte";

  let searchTerm = $state("");
  let activeCategory = $state<string>("All");
  let selectedItem = $state<any | null>(null);
  
  let allItems = $state<any[]>([]);
  let categories = [
    "All", 
    "Daily Selection", 
    "Promotion", 
    "Seasonal", 
    "Furniture", 
    "Fashion", 
    "Wallpapers & Rugs",
    "Other"
  ];
  let isLoading = $state(true);

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "all": return Grid;
      case "daily selection": return Sparkles;
      case "promotion": return Gift;
      case "seasonal": return Calendar;
      case "furniture": return Armchair;
      case "fashion": return Shirt;
      case "wallpapers & rugs": return PaintRoller;
      case "other": return Package;
      default: return Star;
    }
  };

  onMount(async () => {
    try {
      const items = await fetchNookipediaItems();
      allItems = items || [];
      
      if (allItems.length > 0) {
        selectedItem = allItems[0];
      }
    } catch (e) {
      console.error("Failed to load items", e);
    } finally {
      isLoading = false;
    }
  });

  let filteredItems = $derived(allItems.filter((r) => {
    const matchesCategory = activeCategory === "All" || r.category === activeCategory;
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }));

  const handleAction = (type: 'lf' | 'ft') => {
    alert("Dodo Air Trade Manifest coming soon!");
  };
</script>

<div class="flex flex-col h-full bg-[#fbf9f0] text-[#4c4637] font-['Varela_Round',sans-serif] relative overflow-hidden select-none">
  
  {#if isLoading}
    <div class="flex-1 flex flex-col items-center justify-center">
      <Loader2 class="w-10 h-10 animate-spin opacity-50 mb-4 text-[#82c56f]" />
      <p class="text-sm font-bold opacity-70">Loading catalog...</p>
    </div>
  {:else}
    <!-- Top Bar: Categories -->
    <div class="pt-10 pb-4 px-6 relative flex flex-col items-center shrink-0 z-10">
      
      <!-- Active Category Label Pill -->
      <div class="absolute top-2 bg-[#82c56f] text-white px-4 py-0.5 rounded-full text-[13px] font-black tracking-wide shadow-sm z-20"
           style="transform: translateY(-50%);">
        {activeCategory}
      </div>

      <!-- Cloud-like white background for icons -->
      <div class="bg-[#fcfaf4] rounded-full h-14 w-full max-w-lg shadow-sm flex items-center relative overflow-hidden">
        <div class="flex-1 flex justify-start gap-4 overflow-x-auto ac-scrollbar px-6 items-center h-full">
          {#each categories as cat}
            {@const Icon = getCategoryIcon(cat)}
            <button 
              onclick={() => {
                activeCategory = cat;
                selectedItem = null;
              }}
              class={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${
                activeCategory === cat 
                  ? "bg-[#82c56f] text-white shadow-md scale-110" 
                  : "text-[#c2bcab] hover:text-[#a09a8a]"
              }`}
            >
              <Icon class="w-5 h-5" strokeWidth={activeCategory === cat ? 3 : 2} />
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Filters Panel -->
    <div class="p-3 bg-[#f4f1e3] border-b border-[#e1d9be] flex items-center gap-2 shrink-0 text-xs">
      <div class="relative flex-1">
        <Search class="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        <input
          id="item-search"
          type="text"
          placeholder={`Search catalog...`}
          bind:value={searchTerm}
          class="w-full bg-white pl-8 pr-3 py-1.5 rounded-xl border border-[#dcd3be] focus:outline-none focus:ring-2 focus:ring-[#a8df8e] text-[#4c4637] text-xs"
        />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-hidden flex flex-col relative">
      <!-- Item Grid -->
      <div class="flex-1 overflow-y-auto p-3 pb-24 ac-scrollbar grid grid-cols-2 gap-3 self-stretch">
        {#each filteredItems as item (item.id)}
          <div
            onclick={() => selectedItem = item}
            onkeydown={(e) => e.key === 'Enter' && (selectedItem = item)}
            role="button"
            tabindex="0"
            class={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative hover:scale-[1.02] min-h-[140px] ${
              selectedItem?.id === item.id
                ? "bg-[#eaf6e3] border-green-400 ring-2 ring-green-300/30 shadow-md"
                : "bg-white border-[#edd8aa] shadow-sm hover:border-[#a8df8e]"
            }`}
          >
            <div class="flex-1 flex items-center justify-center mb-2">
              {#if item.imageUrl}
                <img src={item.imageUrl} alt={item.name} class="max-w-full max-h-[64px] object-contain drop-shadow-sm" loading="lazy" />
              {:else}
                <Leaf class="w-10 h-10 text-[#c6b199]" />
              {/if}
            </div>

            <div class="flex flex-col gap-1 text-center">
              <span class="font-extrabold text-xs text-[#4c4637] leading-tight truncate px-1">
                {item.name}
              </span>
              <div class="flex items-center justify-center gap-1 bg-[#f2ebd4] mx-auto px-2 py-0.5 rounded-full mt-1">
                {#if item.is_orderable}
                  <span class="font-black text-[#5a4f3b] text-[10px] tracking-tighter">
                    {item.buy_price.toLocaleString()}
                  </span>
                  <svg class="w-3 h-3 text-[#cfb036]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C10.5 2 9.5 3 9.5 4C9.5 4.5 10 5 10 5H14C14 5 14.5 4.5 14.5 4C14.5 3 13.5 2 12 2Z" fill="#ffb75e"/>
                    <path d="M6.5 7C6.5 7 4.5 13 4.5 17C4.5 21 7.5 23 12 23C16.5 23 19.5 21 19.5 17C19.5 13 17.5 7 17.5 7H6.5Z" fill="#ffd470"/>
                    <path d="M10 13L12 16L14 13" stroke="#d99c45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                {:else}
                  <span class="font-black text-[#8c8577] text-[9px] tracking-tighter">Not for sale</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}

        {#if filteredItems.length === 0}
          <div class="col-span-2 text-center py-16 text-gray-400 text-sm">
            No items found matching search.
          </div>
        {/if}
      </div>

      <!-- Full-screen details view for selection -->
      {#if selectedItem}
        <div class="absolute inset-0 bg-[#fbf9f0] p-4 flex flex-col gap-4 animate-fade-in z-50 overflow-y-auto ac-scrollbar">
          
          <!-- Header with Back Button -->
          <div class="flex items-center">
            <button
              onclick={() => selectedItem = null}
              class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#4c4637] hover:bg-gray-50 active:scale-95 transition-all shrink-0 border border-[#e1d9be]"
            >
              <div class="font-black text-xl leading-none -mt-1 -ml-1">‹</div>
            </button>
            <div class="flex-1 ml-3 flex items-center gap-2">
              <ShoppingBag class="w-5 h-5 text-[#82c56f]" strokeWidth={3} />
              <div class="flex flex-col">
                <span class="text-[9px] font-bold text-[#caa253] tracking-widest uppercase leading-none">
                  {selectedItem.category}
                </span>
                <h2 class="text-xl font-black text-[#4c4637] capitalize leading-none mt-1">{selectedItem.name}</h2>
              </div>
            </div>
          </div>

          <!-- Preview Box -->
          <div class="w-full aspect-square bg-[#7db66a] rounded-3xl p-8 shadow-inner relative flex items-center justify-center border-4 border-[#6ea45c]">
            <!-- Subtle pattern -->
            <div class="absolute inset-0 opacity-[0.05]" style="background-image: radial-gradient(white 2px, transparent 2px); background-size: 16px 16px;"></div>
            
            {#if selectedItem.imageUrl}
              <img src={selectedItem.imageUrl} alt={selectedItem.name} class="w-full h-full object-contain drop-shadow-2xl relative z-10 animate-fade-in" />
            {:else}
              <Leaf class="w-24 h-24 text-[#5c8a4c] relative z-10" />
            {/if}
          </div>

          <!-- Item Details -->
          <div class="flex flex-col px-2 bg-white p-4 rounded-2xl shadow-sm border border-[#e1d9be]">
            <div class="flex justify-between items-center border-b-[2px] border-dotted border-[#e1d9be] pb-3 mb-3">
              <span class="text-[#a09a8a] font-bold text-sm uppercase">Order Price</span>
              <div class="flex items-center gap-2">
                {#if selectedItem.is_orderable}
                  <span class="text-[#1c4c1e] font-black text-lg">{selectedItem.buy_price.toLocaleString()}</span>
                  <svg class="w-4 h-4 text-[#cfb036]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C10.5 2 9.5 3 9.5 4C9.5 4.5 10 5 10 5H14C14 5 14.5 4.5 14.5 4C14.5 3 13.5 2 12 2Z" fill="#ffb75e"/>
                    <path d="M6.5 7C6.5 7 4.5 13 4.5 17C4.5 21 7.5 23 12 23C16.5 23 19.5 21 19.5 17C19.5 13 17.5 7 17.5 7H6.5Z" fill="#ffd470"/>
                    <path d="M10 13L12 16L14 13" stroke="#d99c45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                {:else}
                  <span class="text-[#8c8577] font-black text-sm">Not for sale</span>
                {/if}
              </div>
            </div>
            <div class="flex justify-between items-center border-b-[2px] border-dotted border-[#e1d9be] pb-3 mb-3">
              <span class="text-[#a09a8a] font-bold text-sm uppercase">Sell Price</span>
              <div class="flex items-center gap-2">
                <span class="text-[#7a5927] font-black text-lg">{selectedItem.sell_price.toLocaleString()}</span>
                <svg class="w-4 h-4 text-[#cfb036]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C10.5 2 9.5 3 9.5 4C9.5 4.5 10 5 10 5H14C14 5 14.5 4.5 14.5 4C14.5 3 13.5 2 12 2Z" fill="#ffb75e"/>
                  <path d="M6.5 7C6.5 7 4.5 13 4.5 17C4.5 21 7.5 23 12 23C16.5 23 19.5 21 19.5 17C19.5 13 17.5 7 17.5 7H6.5Z" fill="#ffd470"/>
                  <path d="M10 13L12 16L14 13" stroke="#d99c45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div class="flex justify-between items-center border-b-[2px] border-dotted border-[#e1d9be] pb-3 mb-3">
              <span class="text-[#a09a8a] font-bold text-sm uppercase">Category</span>
              <span class="text-[#4c4637] font-bold capitalize">{selectedItem.category}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[#a09a8a] font-bold text-sm uppercase">Availability</span>
              <span class="text-[#caa253] font-bold capitalize">In Stock</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2 mt-auto pt-4 pb-2">
            <button
              onclick={() => handleAction('lf')}
              class="w-full bg-[#ffb75e] text-white py-3.5 rounded-full text-sm font-black shadow-md hover:bg-[#e6a555] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Search class="w-4 h-4" strokeWidth={3} />
              Looking For
            </button>
            
            <button
              onclick={() => handleAction('ft')}
              class="w-full bg-[#1bc6b6] text-white py-3.5 rounded-full text-sm font-black shadow-md hover:bg-[#15a497] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Send class="w-4 h-4" strokeWidth={3} />
              For Trade
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
