<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchNookipediaItems, searchNookipediaItems } from '@/lib/api';
  import NookAppTemplate from '@/components/organisms/NookAppTemplate.svelte';
  import NookIcon from '@/components/atoms/NookIcon.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  const ctx = getPhoneContext();
  import nookState from '@/lib/nookState.svelte';
  import AcnhBubble from '@/components/molecules/AcnhBubble.svelte';
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
    Package,
    X,
    Heart,
    Archive,
    ArrowLeftRight,
    Store,
    ChevronLeft,
    Disc,
    Image,
    Wrench,
    Palette
  } from "@lucide/svelte";

  type AppView = "home" | "browse" | "detail";
  let currentView = $state<AppView>("home");

  let activeTab = $state<"in-stock" | "storage" | "wishlist" | "for-trade">("in-stock");
  let searchTerm = $state("");
  let activeCategory = $state<string>("All");
  let selectedItem = $state<any | null>(null);
  
  let allItems = $state<any[]>([]);
  let categories = [
    "All", 
    "Housewares", 
    "Miscellaneous", 
    "Wall-mounted", 
    "Wallpaper", 
    "Flooring", 
    "Rugs",
    "Fashion",
    "Photos",
    "Music",
    "Tools",
    "Other"
  ];
  let isLoading = $state(true);

  // Tom Nook Dialog states
  let isNookDialogActive = $state(false);
  let nookDialogText = $state("Hello, yes, yes! Welcome to the search service. What item are you looking for?");
  let nookSearchInput = $state("");
  let isSearchingNook = $state(false);
  let hasSearched = $state(false);

  // Autocomplete states
  let dialogSuggestions = $state<any[]>([]);
  let isFetchingSuggestions = $state(false);
  let suggestionTimeout: ReturnType<typeof setTimeout> | null = null;

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "all": return Grid;
      case "housewares": return Armchair;
      case "miscellaneous": return ShoppingBag;
      case "wall-mounted": return Star;
      case "wallpaper": return PaintRoller;
      case "flooring": return Hammer;
      case "rugs": return Palette;
      case "fashion": return Shirt;
      case "photos": return Image;
      case "music": return Disc;
      case "tools": return Wrench;
      default: return Package;
    }
  };

  onMount(async () => {
    try {
      const items = await fetchNookipediaItems();
      allItems = items || [];
    } catch (e) {
      console.error("Failed to load items", e);
    } finally {
      isLoading = false;
    }
  });

  // Autocomplete suggestions fetching effect
  $effect(() => {
    if (!isNookDialogActive) {
      dialogSuggestions = [];
      return;
    }
    if (suggestionTimeout) clearTimeout(suggestionTimeout);
    
    if (nookSearchInput.trim().length === 0) {
      dialogSuggestions = [];
      nookDialogText = "Hello, yes, yes! Welcome to the search service. What item are you looking for?";
      return;
    }

    if (nookSearchInput.trim().length < 2) {
      dialogSuggestions = [];
      return;
    }

    suggestionTimeout = setTimeout(async () => {
      isFetchingSuggestions = true;
      try {
        const results = await searchNookipediaItems(nookSearchInput);
        dialogSuggestions = results ? results.slice(0, 8) : [];
        if (results && results.length > 0) {
          nookDialogText = `I found ${results.length} items, yes, yes! Is this what you're looking for?`;
        } else {
          nookDialogText = `Oh, my... I couldn't find any items matching '${nookSearchInput}', yes. Try another name!`;
        }
      } catch (e) {
        console.error("Failed to fetch suggestions", e);
      } finally {
        isFetchingSuggestions = false;
      }
    }, 250);
  });

  // Debounced search query fetching for main template
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    if (!hasSearched) return;

    // Track reactively
    const query = searchTerm;
    const cat = activeCategory;

    if (searchTimeout) clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      isLoading = true;
      try {
        if (query.trim() === "") {
          const items = await fetchNookipediaItems();
          allItems = items || [];
        } else {
          const results = await searchNookipediaItems(query, cat);
          allItems = results || [];
        }
      } catch (e) {
        console.error("Failed to query search results", e);
      } finally {
        isLoading = false;
      }
    }, 400);
  });

  async function handleNookSearch() {
    if (!nookSearchInput.trim()) return;
    isSearchingNook = true;
    try {
      const results = await searchNookipediaItems(nookSearchInput);
      allItems = results || [];
      searchTerm = nookSearchInput;
      activeCategory = "All";
      hasSearched = true;
      isNookDialogActive = false;
      selectedItem = null;
      currentView = "browse";
    } catch (e) {
      console.error("Nook search query failed", e);
      nookDialogText = "Oh, my... it seems we couldn't connect to the server, yes? Let's try again!";
    } finally {
      isSearchingNook = false;
    }
  }

  let filteredItems = $derived(allItems.filter((r) => {
    if (activeTab === "storage" && !nookState.isStorageItem(r.name)) return false;
    if (activeTab === "wishlist" && !nookState.isWishlistItem(r.name)) return false;
    if (activeTab === "for-trade" && !nookState.isForTradeItem(r.name)) return false;
    const matchesCategory = activeCategory === "All" || r.category === activeCategory;
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }));

  let selectedListIndex = $state(0);
  let activeItem = $derived(filteredItems[selectedListIndex] || null);

  const navigateToCategory = (cat: string) => {
    activeCategory = cat;
    selectedItem = null;
    currentView = "browse";
  };

  const navigateHome = () => {
    selectedItem = null;
    currentView = "home";
  };

  const selectItem = (item: any) => {
    selectedItem = item;
    currentView = "detail";
  };

  /** Home page category circles matching the in-game layout */
  const homeCategories = [
    { id: "Housewares", icon: Armchair, label: "Housewares", color: "#f5ecd0" },
    { id: "Fashion", icon: Shirt, label: "Fashion", color: "#f5ecd0" },
    { id: "Tools", icon: Wrench, label: "Tools", color: "#f5ecd0" },
    { id: "All", icon: Search, label: "Search All", color: "#b8dff7" },
  ];
</script>

{#if currentView === "home"}
  <!-- ══════════════════════════════════════════════════ -->
  <!-- NOOK SHOPPING HOME — Game-Accurate Landing Page   -->
  <!-- ══════════════════════════════════════════════════ -->
  <div class="nook-shop-home">
    <!-- Leaf watermark pattern background -->
    <div class="nook-shop-home__pattern"></div>

    <!-- Top bar: title + bells counter -->
    <div class="nook-shop-home__topbar">
      <button onclick={ctx.handleHomeButton} class="nook-shop-home__close" title="Close App">
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </button>
    </div>

    <!-- Welcome title -->
    <h1 class="nook-shop-home__welcome">Welcome to Nook Shopping!</h1>

    <!-- Featured "Special Goods" Banner -->
    <button
      class="nook-shop-home__featured"
      onclick={() => navigateToCategory("Daily Selection")}
    >
      <div class="nook-shop-home__featured-stripes"></div>
      <div class="nook-shop-home__featured-content">
        <div class="w-16 h-16 flex items-center justify-center">
          <NookIcon name="shopping" class="nook-shop-home__featured-icon" />
        </div>
        <span class="nook-shop-home__featured-label">Special Goods</span>
      </div>
    </button>

    <!-- Category Circles -->
    <div class="nook-shop-home__categories">
      {#each homeCategories as cat}
        <button
          class="nook-shop-home__cat-btn"
          style="--cat-bg: {cat.color}"
          onclick={() => {
            if (cat.id === "All") {
              isNookDialogActive = true;
              nookSearchInput = "";
              nookDialogText = "Hello, yes, yes! Welcome to the search service. What item are you looking for?";
            } else {
              navigateToCategory(cat.id);
            }
          }}
        >
          <div class="nook-shop-home__cat-circle">
            <cat.icon class="w-6 h-6" strokeWidth={2} />
          </div>
          <span class="nook-shop-home__cat-label">{cat.label}</span>
        </button>
      {/each}
    </div>

    <!-- Helper text -->
    <p class="nook-shop-home__help">
      Order special goods or goods from the daily selection here.
    </p>
  </div>

  <!-- Tom Nook Search Dialogue Overlay -->
  {#if isNookDialogActive}
    <div class="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4 pb-20">
      <div class="w-full max-w-md animate-fade-in-up">
        <AcnhBubble
          title="Tom Nook"
          dialogText={nookDialogText}
          isActive={true}
          onDismiss={() => { isNookDialogActive = false; }}
          class="w-full"
        >
          <div class="mt-4 flex flex-col gap-3 relative">
            <input
              type="text"
              placeholder="Item name (e.g. table, chair)..."
              bind:value={nookSearchInput}
              onkeydown={(e) => { if (e.key === 'Enter') handleNookSearch(); }}
              class="w-full bg-[#fffdf5] pl-4 pr-4 py-3 rounded-2xl text-[13px] font-black border-4 border-[#bedad4] focus:outline-none focus:border-[#45a38f] text-[#2d5c56] placeholder:opacity-50 transition-colors shadow-inner"
            />
            
            {#if isFetchingSuggestions}
              <div class="absolute right-4 top-3.5 flex items-center">
                <Loader2 class="w-4 h-4 animate-spin text-[#45a38f]" />
              </div>
            {/if}

            {#if dialogSuggestions.length > 0}
              <div class="bg-[#fffdf5] border-4 border-[#bedad4] rounded-2xl mt-1 shadow-md z-50 flex flex-col gap-0.5 max-h-[350px] overflow-y-auto ac-scrollbar w-full">
                {#each dialogSuggestions as item}
                  <button
                    onclick={() => {
                      nookSearchInput = item.name;
                      handleNookSearch();
                    }}
                    class="w-full text-left px-4 py-2 text-[12px] font-black text-[#2d5c56] hover:bg-[#e5f1f0] transition-colors border-b border-[#bedad4]/30 last:border-b-0 flex items-center gap-2"
                  >
                    {#if item.imageUrl}
                      <img src={item.imageUrl} alt="" class="w-6 h-6 object-contain" />
                    {:else}
                      <span class="text-xs">🍃</span>
                    {/if}
                    <span>{item.name}</span>
                  </button>
                {/each}
              </div>
            {/if}

            <div class="flex justify-between gap-4 mt-2">
              <button 
                onclick={() => { isNookDialogActive = false; }}
                class="bg-[#fdafb2] text-[#8c2a2e] font-black py-2 px-6 rounded-full border-b-4 border-[#e09a9d] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md text-xs uppercase"
              >
                Cancel
              </button>
              <button 
                onclick={handleNookSearch}
                class="bg-[#f0b157] text-[#5c3a21] font-black py-2 px-6 rounded-full border-b-4 border-[#d99c45] hover:bg-[#f2bd70] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md text-xs uppercase flex items-center gap-1.5"
              >
                {#if isSearchingNook}
                  <Loader2 class="w-3 h-3 animate-spin" />
                {/if}
                Search
              </button>
            </div>
          </div>
        </AcnhBubble>
      </div>
    </div>
  {/if}

{:else}
  <!-- ══════════════════════════════════════════════════ -->
  <!-- BROWSE / DETAIL — Standard NookAppTemplate View   -->
  <!-- ══════════════════════════════════════════════════ -->
  <NookAppTemplate
    title="Nook Shopping"
    subtitle="Catalog"
    headerBgClass="bg-[#ebce3f]"
    bgClass="bg-[#fbf9f0]"
    textClass="text-[#4c4637]"
    showSearch={hasSearched}
    bind:searchTerm={searchTerm}
    searchPlaceholder="Search catalog..."
    searchThemeColorClass="text-[#caa253]"
    searchFocusBorderClass="focus:border-[#82c56f]"
    searchBorderColorClass="border-[#dcd3be]"
    searchBgClass="bg-white"
    searchTextColorClass="text-[#4c4637]"
    categories={currentView === "browse" ? categories : []}
    bind:activeCategory={activeCategory}
    categoryLayoutStyle="scroll"
    getCategoryIcon={getCategoryIcon}
    getCategoryLabel={(cat) => cat}
    categoryActiveBgClass="bg-[#82c56f]"
    categoryInactiveTextClass="text-[#c2bcab] hover:text-[#a09a8a]"
    categoryBgClass="bg-[#fcfaf4]"
    categoryBorderClass="border-0 shadow-sm"
    categoryLabelBgClass="bg-[#82c56f]"
    categoryLabelTextClass="text-white"
    bottomNavBgClass="bg-[#fcfaf4]"
    bottomNavBorderClass="border-t-4 border-[#edd8aa]"
  >
    {#snippet iconSnippet()}
      <ShoppingBag class="w-5 h-5 drop-shadow-sm mr-1" />
    {/snippet}

    {#snippet headerActions()}
      <button onclick={navigateHome} class="nook-header-btn" title="Home">
        <Store class="w-3.5 h-3.5 stroke-[3px] text-[#4c4637]" />
      </button>
      <button onclick={ctx.handleHomeButton} class="nook-header-btn" title="Close App">
        <X class="w-3.5 h-3.5 stroke-[3px] text-[#4c4637]" />
      </button>
    {/snippet}

    {#snippet bottomNav()}
      {#each [
        { id: 'in-stock', label: 'Shop', icon: Store },
        { id: 'storage', label: 'Storage', icon: Archive },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'for-trade', label: 'For Trade', icon: ArrowLeftRight }
      ] as tab}
        <button
          onclick={() => activeTab = tab.id as any}
          class={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all border-0 p-0 cursor-pointer ${
            activeTab === tab.id 
              ? 'bg-[#82c56f] text-white shadow-inner scale-105' 
              : 'bg-transparent text-[#caa253] hover:bg-[#eaf6e3]/50'
          }`}
        >
          <tab.icon class="w-5 h-5 mb-1" strokeWidth={activeTab === tab.id ? 3 : 2} />
          <span class="text-[9px] font-black uppercase tracking-wider">{tab.label}</span>
        </button>
      {/each}
    {/snippet}

    {#if isLoading}
      <div class="flex-1 flex flex-col items-center justify-center h-full">
        <Loader2 class="w-10 h-10 animate-spin opacity-50 mb-4 text-[#82c56f]" />
        <p class="text-sm font-bold opacity-70">Loading catalog...</p>
      </div>
    {:else}
      <!-- Main Content (Hero + List layout) -->
      <div class="flex-1 flex flex-col min-h-0 relative overflow-hidden nook-catalog-main bg-[#fbf5cd] nook-shop-home__pattern-container">
        <div class="nook-shop-home__pattern"></div>
        
        <!-- Hero Section -->
        <div class="nook-catalog-hero border-b-2 border-[#e1d9be] bg-[#fdfbed]/80 backdrop-blur-sm shadow-sm z-10 p-2 flex flex-col h-[280px]">
          {#if activeItem}
            <div class="w-full flex justify-between items-start px-2 mt-1">
              <div class="nook-catalog-price-tag bg-[#82c56f] px-3 py-1 rounded-full text-white font-black flex items-center gap-1.5 shadow-sm text-sm border-2 border-white">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C10.5 2 9.5 3 9.5 4C9.5 4.5 10 5 10 5H14C14 5 14.5 4.5 14.5 4C14.5 3 13.5 2 12 2Z" fill="#ffb75e"/>
                  <path d="M6.5 7C6.5 7 4.5 13 4.5 17C4.5 21 7.5 23 12 23C16.5 23 19.5 21 19.5 17C19.5 13 17.5 7 17.5 7H6.5Z" fill="#ffd470"/>
                  <path d="M10 13L12 16L14 13" stroke="#d99c45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {activeItem.is_orderable ? activeItem.buy_price.toLocaleString() : 'N/A'}
              </div>
              
              {#if activeItem.is_orderable}
                <button 
                  onclick={() => {
                    const catalogItem = {
                      id: activeItem.id,
                      name: activeItem.name,
                      price: activeItem.buy_price,
                      currency: "Bells",
                      category: activeItem.category,
                      image: activeItem.imageUrl
                    };
                    const success = nookState.purchaseCatalogItem(catalogItem);
                    if (success) {
                      alert(`Ordered ${activeItem.name}!`);
                    } else {
                      alert(`Not enough Bells!`);
                    }
                  }}
                  class="bg-[#bedad4] text-[#2d5c56] px-3 py-1 rounded-full font-black flex items-center gap-1 shadow-sm text-sm hover:bg-[#a8cdc5] transition-colors border-2 border-white cursor-pointer"
                >
                  <ShoppingBag class="w-3.5 h-3.5" strokeWidth={3} />
                  Order
                </button>
              {/if}
            </div>
            
            <div class="flex-1 flex justify-center items-center pb-2">
              {#if activeItem.imageUrl}
                <img src={activeItem.imageUrl} alt={activeItem.name} class="w-[110px] h-[110px] object-contain drop-shadow-lg" />
              {:else}
                <Leaf class="w-16 h-16 text-[#c6b199]" />
              {/if}
            </div>

            <!-- List Management Actions (Increment / Decrement) -->
            <div class="grid grid-cols-3 gap-2 w-full mt-auto px-1">
              <!-- Wishlist -->
              <div class="flex flex-col items-center justify-between p-1 rounded-xl border border-[#e1d9be] bg-[#fcfaf4]">
                <span class="text-[9px] font-black uppercase text-[#8c8577]">Wishlist</span>
                <div class="flex items-center gap-2 mt-1">
                  <button onclick={() => {
                    const idx = nookState.catalog.wishlistIds.lastIndexOf(activeItem.name);
                    if (idx > -1) { nookState.catalog.wishlistIds.splice(idx, 1); nookState.save(); }
                  }} class="w-5 h-5 rounded-full bg-white border border-[#e1d9be] text-[#8c8577] flex items-center justify-center font-bold pb-0.5 hover:bg-red-50">-</button>
                  <span class="text-xs font-bold text-[#8c2a2e] w-3 text-center">{nookState.catalog.wishlistIds.filter(x => x === activeItem.name).length}</span>
                  <button onclick={() => {
                    nookState.catalog.wishlistIds.push(activeItem.name); nookState.save();
                  }} class="w-5 h-5 rounded-full bg-[#fdafb2] text-white flex items-center justify-center font-bold pb-0.5 hover:bg-[#f29a9d]">+</button>
                </div>
              </div>

              <!-- Storage -->
              <div class="flex flex-col items-center justify-between p-1 rounded-xl border border-[#e1d9be] bg-[#fcfaf4]">
                <span class="text-[9px] font-black uppercase text-[#8c8577]">Storage</span>
                <div class="flex items-center gap-2 mt-1">
                  <button onclick={() => {
                    const idx = nookState.catalog.storageIds.lastIndexOf(activeItem.name);
                    if (idx > -1) { nookState.catalog.storageIds.splice(idx, 1); nookState.save(); }
                  }} class="w-5 h-5 rounded-full bg-white border border-[#e1d9be] text-[#8c8577] flex items-center justify-center font-bold pb-0.5 hover:bg-teal-50">-</button>
                  <span class="text-xs font-bold text-[#2d5c56] w-3 text-center">{nookState.catalog.storageIds.filter(x => x === activeItem.name).length}</span>
                  <button onclick={() => {
                    nookState.catalog.storageIds.push(activeItem.name); nookState.save();
                  }} class="w-5 h-5 rounded-full bg-[#bedad4] text-white flex items-center justify-center font-bold pb-0.5 hover:bg-[#a8cdc5]">+</button>
                </div>
              </div>

              <!-- For Trade -->
              <div class="flex flex-col items-center justify-between p-1 rounded-xl border border-[#e1d9be] bg-[#fcfaf4]">
                <span class="text-[9px] font-black uppercase text-[#8c8577]">For Trade</span>
                <div class="flex items-center gap-2 mt-1">
                  <button onclick={() => {
                    const idx = nookState.catalog.forTradeIds.lastIndexOf(activeItem.name);
                    if (idx > -1) { nookState.catalog.forTradeIds.splice(idx, 1); nookState.save(); }
                  }} class="w-5 h-5 rounded-full bg-white border border-[#e1d9be] text-[#8c8577] flex items-center justify-center font-bold pb-0.5 hover:bg-orange-50">-</button>
                  <span class="text-xs font-bold text-[#b36b19] w-3 text-center">{nookState.catalog.forTradeIds.filter(x => x === activeItem.name).length}</span>
                  <button onclick={() => {
                    nookState.catalog.forTradeIds.push(activeItem.name); nookState.save();
                  }} class="w-5 h-5 rounded-full bg-[#ffebd1] text-white flex items-center justify-center font-bold pb-0.5 hover:bg-[#f5d0a9]">+</button>
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- List Section -->
        <div class="flex-1 min-h-0 overflow-hidden relative z-10">
          <div class="h-full overflow-y-auto px-3 ac-scrollbar pt-2 pb-6 flex flex-col gap-1">
            {#each filteredItems as item, i}
              <button 
                class={`flex items-center p-2 rounded-xl border-2 transition-all cursor-pointer text-left w-full capitalize
                  ${selectedListIndex === i 
                    ? 'bg-[#ebce3f] border-[#d1b52e] shadow-md -mx-1 px-3 py-2.5 z-10 scale-[1.01]' 
                    : 'bg-[#fcfaf4] border-[#e1d9be] hover:bg-white border-dashed'
                  }
                `}
                onclick={() => selectedListIndex = i}
              >
                <!-- Cursor (Hand pointer) -->
                <div class="w-8 flex justify-center flex-shrink-0">
                  {#if selectedListIndex === i}
                    <span class="text-xl -ml-2 drop-shadow-sm">👉</span>
                  {/if}
                </div>
                
                <!-- Category Icon -->
                <div class="w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0 bg-white/50 rounded-full p-1">
                   {#if item.imageUrl}
                     <img src={item.imageUrl} alt={item.name} class="w-full h-full object-contain drop-shadow-sm" />
                   {:else}
                     <Leaf class="w-5 h-5 text-[#c6b199]" />
                   {/if}
                </div>
                
                <!-- Name -->
                <div class="flex-1 font-bold text-[#5a4a18] text-sm leading-tight pr-2">
                  {item.name}
                </div>
                
                <!-- Price -->
                <div class="flex items-center gap-1 font-black text-[#5a4a18] text-sm whitespace-nowrap bg-white/50 px-2 py-0.5 rounded-full border border-black/5 shadow-sm">
                  <svg class="w-3 h-3 text-[#cfb036]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C10.5 2 9.5 3 9.5 4C9.5 4.5 10 5 10 5H14C14 5 14.5 4.5 14.5 4C14.5 3 13.5 2 12 2Z" fill="#ffb75e"/>
                    <path d="M6.5 7C6.5 7 4.5 13 4.5 17C4.5 21 7.5 23 12 23C16.5 23 19.5 21 19.5 17C19.5 13 17.5 7 17.5 7H6.5Z" fill="#ffd470"/>
                  </svg>
                  <span>{item.is_orderable ? item.buy_price.toLocaleString() : 'N/A'}</span>
                </div>
              </button>
            {/each}
            
            {#if filteredItems.length === 0}
              <div class="text-center py-8 text-[#8c8577] text-sm font-bold bg-white/40 rounded-xl border-2 border-dashed border-[#e1d9be] mt-2">
                No items found.
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </NookAppTemplate>
{/if}

<style>
  /* ══════════════════════════════════════════════════════ */
  /* NOOK SHOPPING HOME — Game-Accurate Styles             */
  /* ══════════════════════════════════════════════════════ */

  .nook-shop-home {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    background: #ebce3f;
    position: relative;
    overflow: hidden;
    font-family: 'Varela Round', sans-serif;
    padding: 20px 24px;
    gap: 16px;
    user-select: none;
  }

  /* Nook leaf watermark pattern (like the game background) */
  .nook-shop-home__pattern {
    position: absolute;
    inset: 0;
    opacity: 0.08;
    pointer-events: none;
    background-image: url('data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M20 6c3 4.5 9 7.5 9 15s-6 10.5-9 15c-3-4.5-9-7.5-9-15s6-10.5 9-15z" fill="%23987a2e" fill-opacity="0.6"/%3E%3C/svg%3E');
    background-size: 36px 36px;
  }

  /* ── Top Bar ─────────────────────────────────────────── */
  .nook-shop-home__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    position: relative;
    z-index: 2;
  }

  .nook-shop-home__close {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: rgba(255,255,255,0.25);
    color: #6b5a1f;
    transition: all 0.15s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .nook-shop-home__close:hover {
    background: rgba(255,255,255,0.4);
  }
  .nook-shop-home__close:active {
    transform: scale(0.9);
  }

  .nook-shop-home__bells {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #c4a237;
    border-radius: 20px;
    padding: 5px 12px 5px 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    border: 2px solid #b0912f;
  }

  .nook-shop-home__bell-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .nook-shop-home__bells-count {
    font-size: 13px;
    font-weight: 900;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    letter-spacing: -0.02em;
  }

  /* ── Welcome Title ────────────────────────────────────── */
  .nook-shop-home__welcome {
    font-size: 17px;
    font-weight: 900;
    color: #5a4a18;
    margin: 0;
    text-align: center;
    position: relative;
    z-index: 2;
    text-shadow: 0 1px 0 rgba(255,255,255,0.3);
  }

  /* ── Featured Banner (Special Goods) ──────────────────── */
  .nook-shop-home__featured {
    position: relative;
    width: 100%;
    max-width: 280px;
    border-radius: 9999px;
    padding: 16px 28px;
    cursor: pointer;
    border: 5px solid #ffffff;
    background: #edd52b;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 10px rgba(0,0,0,0.12);
    z-index: 2;
  }
  .nook-shop-home__featured:hover {
    transform: scale(1.03);
    box-shadow: 0 6px 15px rgba(0,0,0,0.18);
  }
  .nook-shop-home__featured:active {
    transform: scale(0.98);
  }

  /* Yellow-on-yellow diagonal stripe pattern inside the featured banner */
  .nook-shop-home__featured-stripes {
    position: absolute;
    inset: -50%;
    width: 200%;
    height: 200%;
    pointer-events: none;
    background: repeating-linear-gradient(
      -45deg,
      #ebd42a,
      #ebd42a 12px,
      #f5e347 12px,
      #f5e347 24px
    );
  }
  .nook-shop-home__featured:hover .nook-shop-home__featured-stripes {
    animation: stripe-slide 1.2s linear infinite;
  }

  @keyframes stripe-slide {
    0% { transform: translate(0, 0); }
    100% { transform: translate(34px, 0); }
  }

  .nook-shop-home__featured-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    position: relative;
    z-index: 1;
  }

  .nook-shop-home__featured-icon {
    object-fit: contain;
    filter: drop-shadow(0 2px 3px rgba(0,0,0,0.12));
  }

  .nook-shop-home__featured-label {
    font-size: 16px;
    font-weight: 900;
    color: #4d4013;
    text-shadow: 0 1px 0 rgba(255,255,255,0.3);
  }


  /* ── Category Circles ────────────────────────────────── */
  .nook-shop-home__categories {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    position: relative;
    z-index: 2;
  }

  .nook-shop-home__cat-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: 0;
    cursor: pointer;
    padding: 0;
    transition: transform 0.15s;
  }
  .nook-shop-home__cat-btn:hover {
    transform: scale(1.1);
  }
  .nook-shop-home__cat-btn:active {
    transform: scale(0.95);
  }

  .nook-shop-home__cat-circle {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--cat-bg, #f5ecd0);
    border: 3px solid rgba(255,255,255,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b5a1f;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
    transition: box-shadow 0.15s;
  }
  .nook-shop-home__cat-btn:hover .nook-shop-home__cat-circle {
    box-shadow: 0 4px 14px rgba(0,0,0,0.18);
  }

  .nook-shop-home__cat-label {
    font-size: 10px;
    font-weight: 800;
    color: #5a4a18;
    text-shadow: 0 1px 0 rgba(255,255,255,0.2);
  }

  /* ── Helper Text ─────────────────────────────────────── */
  .nook-shop-home__help {
    font-size: 12px;
    font-weight: 700;
    color: #6b5a1f;
    text-align: center;
    margin: 0;
    position: relative;
    z-index: 2;
    opacity: 0.8;
  }
</style>
