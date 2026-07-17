<script lang="ts">
  import { onMount } from 'svelte';
  import nookState from '@/lib/nookState.svelte';
  import { fetchDIYRecipes, fetchDIYMaterials } from '@/lib/api';
  import { 
    Hammer, 
    Grid, 
    Armchair, 
    PaintRoller, 
    Shirt, 
    Star,
    Leaf,
    Loader2,
    Check,
    Tent,
    Grid3x3,
    Package,
    Utensils,
    CakeSlice,
    Coffee,
    Image as ImageIcon
  } from "@lucide/svelte";

  let searchTerm = $state("");
  let activeCategory = $state<string>("All");
  let selectedRecipe = $state<any | null>(null);
  let isCrafting = $state(false);
  let currentView = $state<"grid" | "detail">("grid");
  
  let allRecipes = $state<any[]>([]);
  let materialsDict = $state<Record<string, string>>({});
  let categories = [
    "All", 
    "Tools", 
    "Furniture", 
    "Accessories", 
    "Wall-mounted", 
    "Wallpapers & Rugs", 
    "Clothing",
    "Food",
    "Other"
  ];
  let isLoading = $state(true);

  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "all": return Grid;
      case "tools": return Hammer;
      case "furniture": return Armchair;
      case "accessories": return Coffee;
      case "wall-mounted": return ImageIcon;
      case "wallpapers & rugs": return PaintRoller;
      case "clothing": return Shirt;
      case "food": return Utensils;
      default: return Package;
    }
  };

  const mapApiTypeToCategory = (type: string, name: string) => {
    const t = (type || "").toLowerCase();
    const n = (name || "").toLowerCase();
    
    if (t === "tools") return "Tools";
    if (t === "clothing") return "Clothing";
    if (t === "interior") return "Wallpapers & Rugs";
    if (t === "savory" || t === "sweet") return "Food";
    
    // Nookipedia lumps many things into "Furniture" or "Item"
    // Try to guess from name or default to Furniture/Other
    if (n.includes("wall") || n.includes("garland") || n.includes("wreath")) return "Wall-mounted";
    if (t === "furniture") return "Furniture";
    if (t === "item" || n.includes("bag") || n.includes("ring")) return "Accessories";
    
    return "Other";
  };

  onMount(async () => {
    try {
      const [rawRecipes, rawMaterials] = await Promise.all([
        fetchDIYRecipes(),
        fetchDIYMaterials()
      ]);
      
      materialsDict = rawMaterials || {};
      
      const parsedRecipes = rawRecipes.map((r: any) => {
        let parsedMats = [];
        try {
          const rawMats = JSON.parse(decodeHtml(r.materials || "{}"));
          parsedMats = Object.keys(rawMats).map(k => ({ name: k, qty: rawMats[k] }));
        } catch(e) {}
        
        return {
          id: r.name,
          name: r.name,
          category: mapApiTypeToCategory(r.type, r.name),
          type: r.type,
          image_url: r.image_url,
          materials: parsedMats
        };
      });
      
      allRecipes = parsedRecipes;
      
      // Auto-select first item
      if (parsedRecipes.length > 0) {
        selectedRecipe = parsedRecipes[0];
      }
    } catch (e) {
      console.error("Failed to load recipes", e);
    } finally {
      isLoading = false;
    }
  });

  let filteredRecipes = $derived(allRecipes.filter((r) => {
    const matchesCategory = activeCategory === "All" || r.category === activeCategory;
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }));

  const handleCraft = () => {
    if (!selectedRecipe) return;
    isCrafting = true;

    setTimeout(() => {
      nookState.craftRecipe(selectedRecipe.id);
      if (!nookState.diy.unlockedRecipes.includes(selectedRecipe.id)) {
        nookState.diy.unlockedRecipes.push(selectedRecipe.id);
      }
      isCrafting = false;
    }, 2000);
  };
</script>

<div class="flex flex-col h-full bg-[#f3ebd9] text-[#7a5927] font-['Varela_Round',sans-serif] relative overflow-hidden select-none">
  
  {#if isLoading}
    <div class="flex-1 flex flex-col items-center justify-center">
      <Loader2 class="w-10 h-10 animate-spin opacity-50 mb-4" />
      <p class="text-sm font-bold opacity-70">Loading recipes...</p>
    </div>
  {:else}
    <!-- Top Bar: Categories -->
    <div class="pt-10 pb-4 px-6 relative flex flex-col items-center shrink-0 z-10 transition-transform duration-300 ${currentView === 'detail' ? '-translate-y-full opacity-0 absolute' : 'translate-y-0 opacity-100'}">
      
      <!-- Active Category Label Pill -->
      <div class="absolute top-2 bg-[#f08535] text-white px-4 py-0.5 rounded-full text-[13px] font-black tracking-wide shadow-sm z-20"
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
              }}
              class={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${
                activeCategory === cat 
                  ? "bg-[#f59e33] text-white shadow-md scale-110" 
                  : "text-[#c2bcab] hover:text-[#a09a8a]"
              }`}
            >
              <Icon class="w-5 h-5" strokeWidth={activeCategory === cat ? 3 : 2} />
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 relative overflow-hidden w-full h-full">
      
      <!-- Grid View -->
      <div class={`absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ${currentView === 'grid' ? 'translate-x-0' : '-translate-x-full'}`}>
        <div class="flex-1 overflow-y-auto ac-scrollbar px-4 pb-10">
          <div class="grid grid-cols-3 gap-3 content-start">
            {#each filteredRecipes as r (r.id)}
              <button
                onclick={() => {
                  selectedRecipe = r;
                  currentView = "detail";
                }}
                class="aspect-[2/3] rounded-xl flex flex-col items-center justify-between p-2 pb-6 transition-all relative overflow-hidden group bg-[#f5f1e1] shadow-sm hover:scale-105"
              >
                <!-- Faux Leaf Pattern Background -->
                <div class="absolute inset-0 opacity-[0.04] pointer-events-none" style="background-image: radial-gradient(#7a5927 1px, transparent 1px); background-size: 10px 10px;"></div>
                
                <!-- Checkmark if crafted -->
                {#if nookState.diy.unlockedRecipes.includes(r.id)}
                  <div class="absolute top-1 right-1 opacity-40 z-10">
                    <Check class="w-4 h-4 text-[#7a5927]" strokeWidth={4} />
                  </div>
                {/if}

                <!-- Item Icon -->
                <div class="flex-1 w-full flex items-center justify-center z-10 px-2 py-2">
                  {#if r.image_url}
                    <img src={r.image_url} alt={r.name} class="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                  {:else}
                    <Leaf class="w-12 h-12 text-[#c6b199]" />
                  {/if}
                </div>

                <!-- Craftable Banner -->
                <div class="absolute bottom-0 left-0 w-full bg-[#fbc820] text-[#52462e] text-[9px] font-black py-1 flex items-center justify-center gap-1 shadow-inner z-10 border-t-2 border-[#e6b110]">
                  <Hammer class="w-3 h-3" strokeWidth={3} /> Craftable
                </div>
              </button>
            {/each}

            {#if filteredRecipes.length === 0}
              <div class="col-span-full text-center py-10 opacity-50 font-bold">
                No recipes found.
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Detail View -->
      <div class={`absolute inset-0 w-full h-full flex flex-col bg-[#f3ebd9] transition-transform duration-300 z-20 ${currentView === 'detail' ? 'translate-x-0' : 'translate-x-full'}`}>
        {#if selectedRecipe}
          <div class="flex flex-col h-full overflow-hidden p-4">
            
            <!-- Header (Back & Title) -->
            <div class="flex items-center gap-2 mb-4 shrink-0">
              <button 
                onclick={() => currentView = "grid"} 
                class="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center shadow-sm text-[#7a5927] hover:bg-white active:scale-95 transition-all"
              >
                <div class="font-black text-xl leading-none -mt-1 -ml-1">‹</div>
              </button>
              <div class="flex items-center gap-2">
                <Hammer class="w-5 h-5 text-[#8c7b64]" strokeWidth={3} />
                <h2 class="text-[20px] font-bold text-[#7a5927] capitalize leading-none tracking-wide">
                  {selectedRecipe.name}
                </h2>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto ac-scrollbar flex flex-col gap-6 pb-24">
              <!-- Preview Square -->
              <div class="w-full aspect-square bg-[#2f2b23] rounded-3xl p-6 shadow-inner relative flex items-center justify-center">
                {#if selectedRecipe.image_url}
                  <img src={selectedRecipe.image_url} alt={selectedRecipe.name} class="w-full h-full object-contain drop-shadow-2xl animate-fade-in" />
                {:else}
                  <Leaf class="w-20 h-20 text-[#4c473c]" />
                {/if}
              </div>

              <!-- Materials List -->
              <div class="flex flex-col px-2">
                <div class="flex items-center gap-2 text-[#7a5927] font-black text-sm mb-3">
                  <div class="w-2 h-2 rounded-full bg-[#7a5927]"></div>
                  Materials Needed
                </div>

                <div class="flex flex-col gap-4">
                  {#each selectedRecipe.materials as mat}
                    <div class="flex items-center gap-2">
                      <div class="w-9 h-9 shrink-0 flex items-center justify-center drop-shadow-sm">
                        {#if materialsDict[mat.name.toLowerCase()]}
                          <img src={materialsDict[mat.name.toLowerCase()]} alt={mat.name} class="w-full h-full object-contain" />
                        {:else}
                          <Leaf class="w-7 h-7 text-[#8cc63f] fill-current" />
                        {/if}
                      </div>
                      
                      <span class="text-[14px] font-bold text-[#7a5927] capitalize whitespace-nowrap">
                        {mat.name}
                      </span>
                      
                      <div class="flex-1 border-b-[2px] border-dotted border-[#c8b9a1] mx-1 mt-3"></div>
                      
                      <div class="bg-[#e8deb1] text-[#7a5927] px-2.5 py-0.5 rounded shadow-sm text-[13px] font-black shrink-0">
                        x{mat.qty}
                      </div>
                    </div>
                  {/each}

                  {#if selectedRecipe.materials.length === 0}
                    <div class="text-center py-4 text-[#a09480] text-sm italic font-bold">
                      No materials required.
                    </div>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Craft Button -->
            <div class="absolute bottom-6 left-6 right-6">
              <button
                onclick={handleCraft}
                class="w-full bg-[#1bc6b6] text-white py-4 rounded-full text-lg font-black shadow-lg hover:bg-[#15a497] active:scale-95 transition-all flex items-center justify-center border-4 border-white/20"
              >
                Craft it!
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Crafting Animation -->
  {#if isCrafting}
    <div class="absolute inset-0 bg-[#f3ebd9]/90 flex flex-col items-center justify-center gap-4 z-50 animate-fade-in">
      <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
        <Hammer class="w-12 h-12 text-[#f59e33]" />
      </div>
      <h2 class="text-2xl font-black text-[#7a5927] tracking-wide">Crafting...</h2>
    </div>
  {/if}
</div>
