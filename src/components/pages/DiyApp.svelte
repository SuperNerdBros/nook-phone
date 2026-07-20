<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { playSound } from '@/lib/audio';
  import nookState from '@/lib/nookState.svelte';
  import { fetchDIYRecipes, fetchDIYMaterials } from '@/lib/api';
  import NookAppTemplate from '@/components/organisms/NookAppTemplate.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  const ctx = getPhoneContext();
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
    Image as ImageIcon,
    X as XIcon,
    ChevronLeft
  } from "@lucide/svelte";

  let searchTerm = $state("");
  let activeCategory = $state<string>("All");
  let selectedRecipe = $state<any | null>(null);
  let craftingState = $state<'idle' | 'crafting' | 'success'>('idle');
  let materialParticles = $state<{ id: number; img: string; startX: number; startY: number; delay: number }[]>([]);
  let dustPuffs = $state<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);
  let successStars = $state<{ id: number; color: string; tx: number; ty: number; delay: number; size: number }[]>([]);
  let activeInterval: any = null;
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
        let parsedMats: any[] = [];
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
    startCraftingAnimation();
  };

  const startCraftingAnimation = () => {
    if (!selectedRecipe) return;
    
    craftingState = 'crafting';
    materialParticles = [];
    dustPuffs = [];
    
    // Generate particles for materials
    let idCounter = 0;
    selectedRecipe.materials.forEach((mat: any) => {
      const img = materialsDict[mat.name.toLowerCase()] || "";
      const count = Math.min(mat.qty, 5); 
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 120 + Math.random() * 60; // Spawn offset
        materialParticles.push({
          id: idCounter++,
          img,
          startX: Math.cos(angle) * radius,
          startY: Math.sin(angle) * radius,
          delay: Math.random() * 0.8
        });
      }
    });

    // Run the hammer thumping loop
    let hits = 0;
    activeInterval = setInterval(() => {
      if (hits >= 4) {
        clearInterval(activeInterval);
        activeInterval = null;
        return;
      }
      setTimeout(() => {
        playSound('stamp', !nookState.settings.soundEffects);
        spawnDustPuff();
      }, 180);
      hits++;
    }, 600);

    // Complete crafting after 2.4s
    setTimeout(() => {
      nookState.craftRecipe(selectedRecipe.id);
      if (!nookState.diy.unlockedRecipes.includes(selectedRecipe.id)) {
        nookState.diy.unlockedRecipes.push(selectedRecipe.id);
      }
      
      // Stage 2: Success Reveal Screen
      playSound('success', !nookState.settings.soundEffects);
      craftingState = 'success';
      spawnSuccessStars();
    }, 2450);
  };

  const spawnDustPuff = () => {
    const baseId = Date.now();
    let newPuffs: typeof dustPuffs = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const distance = 20 + Math.random() * 30;
      newPuffs.push({
        id: baseId + i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 30 + Math.random() * 20,
        delay: Math.random() * 0.1
      });
    }
    dustPuffs = [...dustPuffs, ...newPuffs];
    
    // Cleanup old puffs
    setTimeout(() => {
      dustPuffs = dustPuffs.filter(p => !newPuffs.some(np => np.id === p.id));
    }, 1000);
  };

  const spawnSuccessStars = () => {
    const colors = ['#fbc820', '#ff6b6b', '#4dadf7', '#51cf66', '#f06595', '#cc5de8'];
    let starCounter = 0;
    let newStars: typeof successStars = [];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 120;
      newStars.push({
        id: starCounter++,
        color: colors[Math.floor(Math.random() * colors.length)],
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        size: 10 + Math.random() * 15,
        delay: Math.random() * 0.4
      });
    }
    successStars = newStars;
  };

  const dismissSuccess = () => {
    craftingState = 'idle';
  };

  onDestroy(() => {
    if (activeInterval) {
      clearInterval(activeInterval);
    }
  });

  const capitalizeFirst = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
</script>

<NookAppTemplate
  title={currentView === 'detail' && selectedRecipe ? capitalizeFirst(selectedRecipe.name) : "DIY Recipes"}
  subtitle={currentView === 'detail' ? "" : "Workshop"}
  headerBgClass="bg-[#f39566]"
  headerTextClass="text-white"
  bgClass="bg-[#f3ebd9]"
  textClass="text-[#7a5927]"
  showSearch={currentView === 'grid'}
  bind:searchTerm={searchTerm}
  searchPlaceholder="Search recipes..."
  searchThemeColorClass="text-[#f08535]"
  searchFocusBorderClass="focus:border-[#f08535]"
  searchBorderColorClass="border-[#e9dec7]"
  searchBgClass="bg-[#fcfaf4]"
  searchTextColorClass="text-[#7a5927]"
  categories={currentView === 'grid' ? categories : []}
  bind:activeCategory={activeCategory}
  categoryLayoutStyle="scroll"
  getCategoryIcon={getCategoryIcon}
  getCategoryLabel={(cat) => cat}
  categoryActiveBgClass="bg-[#f59e33]"
  categoryInactiveTextClass="text-[#c2bcab] hover:text-[#a09a8a]"
  categoryBgClass="bg-[#fcfaf4]"
  categoryBorderClass="border-0 shadow-sm"
  categoryLabelBgClass="bg-[#f08535]"
  categoryLabelTextClass="text-white"
>
  {#snippet iconSnippet()}
    <div class="w-12 h-12 mr-1">
      <NookIcon name="diy" class="w-full h-full object-contain drop-shadow-sm" />
    </div>
  {/snippet}

  {#snippet headerActions()}
    {#if currentView === 'detail'}
      <NookToolbarButton onclick={() => currentView = "grid"} title="Back" class="mr-1">
        <ChevronLeft class="w-3.5 h-3.5 stroke-[3px] text-[#7a5927]" />
      </NookToolbarButton>
    {/if}
    <NookToolbarButton onclick={ctx.handleHomeButton} title="Close App">
      <XIcon class="w-3.5 h-3.5 stroke-[3px] text-[#7a5927]" />
    </NookToolbarButton>
  {/snippet}

  <!-- Main Views -->
  {#if isLoading}
    <div class="flex-1 flex flex-col items-center justify-center h-full">
      <Loader2 class="w-10 h-10 animate-spin opacity-50 mb-4 text-[#f59e33]" />
      <p class="text-sm font-bold opacity-70">Loading recipes...</p>
    </div>
  {:else}
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
        <div class="flex flex-col h-full overflow-hidden p-4 font-['Varela_Round',sans-serif]">
          
          <div class="flex-1 overflow-y-auto ac-scrollbar flex flex-col gap-6 pb-24">
            <!-- Preview Square -->
            <div class="w-full aspect-square rounded-3xl p-6 shadow-inner relative flex items-center justify-center">
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
  {/if}

  <!-- High-Fidelity Crafting Overlay -->
  {#if craftingState === 'crafting'}
    <div class="absolute inset-0 bg-[#f3ebd9]/95 flex flex-col items-center justify-center overflow-hidden z-50 animate-fade-in font-['Varela_Round',sans-serif]">
      <!-- Center Animation Workbench Area -->
      <div class="relative w-72 h-72 flex items-center justify-center">
        <!-- Volumetric Dust Cloud Base -->
        <div class="absolute w-36 h-36 bg-white/40 blur-[8px] rounded-full animate-pulse"></div>
        <div class="absolute w-28 h-28 bg-white/50 blur-[4px] rounded-full animate-spin" style="animation-duration: 4s;"></div>
        <div class="absolute w-20 h-20 bg-white/60 rounded-full animate-spin" style="animation-duration: 2s; animation-direction: reverse;"></div>

        <!-- Material Particles flying into center (parabolic jump & spin) -->
        {#each materialParticles as p (p.id)}
          <div 
            class="absolute animate-fly-in-x pointer-events-none"
            style="--start-x: {p.startX}px; animation-delay: {p.delay}s;"
          >
            <div 
              class="w-14 h-14 animate-fly-in-y flex items-center justify-center"
              style="--start-y: {p.startY}px; animation-delay: {p.delay}s;"
            >
              {#if p.img}
                <img src={p.img} alt="material" class="w-full h-full object-contain drop-shadow-md animate-fly-in-rot" style="animation-delay: {p.delay}s;" />
              {:else}
                <Leaf class="w-10 h-10 text-[#8cc63f] animate-fly-in-rot" style="animation-delay: {p.delay}s;" />
              {/if}
            </div>
          </div>
        {/each}

        <!-- Impact Dust Puffs -->
        {#each dustPuffs as puff (puff.id)}
          <div 
            class="absolute rounded-full bg-white/70 shadow-sm animate-puff pointer-events-none"
            style="--tx: {puff.x}px; --ty: {puff.y}px; width: {puff.size}px; height: {puff.size}px; animation-delay: {puff.delay}s;"
          ></div>
        {/each}

        <!-- Hammer hit animation -->
        <div class="absolute pointer-events-none animate-hammer" style="transform-origin: 20% 80%;">
          <Hammer class="w-16 h-16 text-[#f59e33] drop-shadow-md" strokeWidth={2.5} />
        </div>
      </div>
      <h2 class="text-2xl font-black text-[#7a5927] tracking-wide mt-4">Crafting...</h2>
    </div>
  {/if}

  <!-- Success Reveal Overlay -->
  {#if craftingState === 'success' && selectedRecipe}
    <div class="absolute inset-0 bg-[#f3ebd9] z-50 flex flex-col items-center justify-between p-6 overflow-hidden animate-fade-in font-['Varela_Round',sans-serif]">
      <!-- Background Rotating Sunshine rays -->
      <div 
        class="absolute w-[200%] aspect-square opacity-[0.12] animate-spin-slow pointer-events-none"
        style="background: conic-gradient(from 0deg, transparent 0deg, transparent 15deg, #7a5927 15deg, #7a5927 30deg, transparent 30deg, transparent 45deg, #7a5927 45deg, #7a5927 60deg, transparent 60deg, transparent 75deg, #7a5927 75deg, #7a5927 90deg, transparent 90deg, transparent 105deg, #7a5927 105deg, #7a5927 120deg, transparent 120deg, transparent 135deg, #7a5927 135deg, #7a5927 150deg, transparent 150deg, transparent 165deg, #7a5927 165deg, #7a5927 180deg, transparent 180deg, transparent 195deg, #7a5927 195deg, #7a5927 210deg, transparent 210deg, transparent 225deg, #7a5927 225deg, #7a5927 240deg, transparent 240deg, transparent 255deg, #7a5927 255deg, #7a5927 270deg, transparent 270deg, transparent 285deg, #7a5927 285deg, #7a5927 300deg, transparent 300deg, transparent 315deg, #7a5927 315deg, #7a5927 330deg, transparent 330deg, transparent 345deg, #7a5927 345deg, #7a5927 360deg);"
      ></div>

      <!-- Success particles -->
      <div class="absolute w-full h-full pointer-events-none flex items-center justify-center">
        {#each successStars as star (star.id)}
          <svg 
            class="absolute animate-success-star pointer-events-none"
            style="--tx: {star.tx}px; --ty: {star.ty}px; width: {star.size}px; height: {star.size}px; fill: {star.color}; animation-delay: {star.delay}s;"
            viewBox="0 0 24 24"
          >
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z" />
          </svg>
        {/each}
      </div>

      <!-- Top Text -->
      <div class="mt-16 text-center z-10 flex flex-col items-center gap-1">
        <span class="text-xs font-black text-[#a0937a] uppercase tracking-widest bg-[#e8e0cc] px-3 py-1 rounded-full shadow-inner border border-[#d6ccb5]">
          Success!
        </span>
      </div>

      <!-- Main Item showcase -->
      <div class="relative w-64 h-64 flex items-center justify-center z-10 animate-item-pop">
        {#if selectedRecipe.image_url}
          <img src={selectedRecipe.image_url} alt={selectedRecipe.name} class="w-full h-full object-contain drop-shadow-2xl" />
        {:else}
          <Leaf class="w-32 h-32 text-[#8cc63f]" />
        {/if}
      </div>

      <!-- Item Info details -->
      <div class="text-center z-10 w-full px-4 flex flex-col items-center">
        <span class="text-xs font-black text-[#a29272] uppercase tracking-wide">You crafted:</span>
        <h1 class="text-2xl font-black text-[#7a5927] capitalize text-center mt-1 drop-shadow-sm leading-tight">
          {capitalizeFirst(selectedRecipe.name)}
        </h1>
      </div>

      <!-- Actions -->
      <div class="w-full max-w-[200px] z-10">
        <button
          onclick={dismissSuccess}
          class="w-full bg-[#1bc6b6] text-white py-3.5 rounded-full text-base font-black shadow-lg hover:bg-[#15a497] active:scale-95 transition-all flex items-center justify-center border-4 border-white/20 mb-6"
        >
          Put Away
        </button>
      </div>
    </div>
  {/if}
</NookAppTemplate>

<style>
  @keyframes hammer-swing {
    0% { transform: translate(25px, -25px) rotate(35deg); }
    30% { transform: translate(0, 0) rotate(-15deg); }
    45% { transform: translate(0, 0) rotate(-15deg); }
    100% { transform: translate(25px, -25px) rotate(35deg); }
  }
  .animate-hammer {
    animation: hammer-swing 0.6s infinite ease-in-out;
  }

  @keyframes puff {
    0% {
      transform: translate(0, 0) scale(0.2);
      opacity: 0.9;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      transform: translate(var(--tx), var(--ty)) scale(1.5);
      opacity: 0;
    }
  }
  .animate-puff {
    animation: puff 0.6s forwards cubic-bezier(0.1, 0.8, 0.3, 1);
  }

  @keyframes fly-in-x {
    0% {
      transform: translateX(var(--start-x));
    }
    100% {
      transform: translateX(0);
    }
  }

  @keyframes fly-in-y {
    0% {
      transform: translateY(var(--start-y)) scale(1);
      animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* easeOutQuad */
    }
    45% {
      transform: translateY(calc(var(--start-y) - 100px)) scale(1.6); /* Jump apex and get bigger */
      animation-timing-function: cubic-bezier(0.55, 0.085, 0.68, 0.53); /* easeInQuad */
    }
    85% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateY(0) scale(0);
      opacity: 0;
    }
  }

  @keyframes fly-in-rot {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(720deg);
    }
  }

  .animate-fly-in-x {
    animation: fly-in-x 1.2s forwards linear;
  }
  .animate-fly-in-y {
    animation: fly-in-y 1.2s forwards;
  }
  .animate-fly-in-rot {
    animation: fly-in-rot 1.2s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  @keyframes success-star {
    0% {
      transform: translate(0, 0) scale(0) rotate(0deg);
      opacity: 1;
    }
    70% {
      opacity: 1;
    }
    100% {
      transform: translate(var(--tx), var(--ty)) scale(1) rotate(360deg);
      opacity: 0;
    }
  }
  .animate-success-star {
    animation: success-star 1.2s forwards cubic-bezier(0.15, 0.85, 0.35, 1);
  }

  @keyframes spin-slow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 15s linear infinite;
  }

  @keyframes item-pop {
    0% { transform: scale(0) rotate(-15deg); }
    70% { transform: scale(1.15) rotate(5deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
  .animate-item-pop {
    animation: item-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
</style>
