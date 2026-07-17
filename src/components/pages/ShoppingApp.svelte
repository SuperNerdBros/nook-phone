<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchNookipediaItems } from '@/lib/api';
  import NookAppTemplate from '@/components/organisms/NookAppTemplate.svelte';
  import NookIcon from '@/components/atoms/NookIcon.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  const ctx = getPhoneContext();
  import nookState from '@/lib/nookState.svelte';
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
    ChevronLeft
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
    } catch (e) {
      console.error("Failed to load items", e);
    } finally {
      isLoading = false;
    }
  });

  let filteredItems = $derived(allItems.filter((r) => {
    if (activeTab === "storage" && !nookState.isStorageItem(r.name)) return false;
    if (activeTab === "wishlist" && !nookState.isWishlistItem(r.name)) return false;
    if (activeTab === "for-trade" && !nookState.isForTradeItem(r.name)) return false;
    const matchesCategory = activeCategory === "All" || r.category === activeCategory;
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }));

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
    { id: "Furniture", icon: Armchair, label: "Furniture", color: "#f5ecd0" },
    { id: "Fashion", icon: Shirt, label: "Fashion", color: "#f5ecd0" },
    { id: "Wallpapers & Rugs", icon: PaintRoller, label: "Décor", color: "#f5ecd0" },
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
          onclick={() => navigateToCategory(cat.id)}
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
    showSearch={currentView === "browse"}
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
        { id: 'in-stock', label: 'In Stock', icon: Store },
        { id: 'storage', label: 'In Storage', icon: Archive },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'for-trade', label: 'For Trade', icon: ArrowLeftRight }
      ] as tab}
        <button
          onclick={() => activeTab = tab.id as any}
          class={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all border-0 p-0 cursor-pointer bg-transparent ${
            activeTab === tab.id 
              ? 'bg-[#82c56f] text-white shadow-inner scale-105' 
              : 'text-[#caa253] hover:bg-[#eaf6e3]/50'
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
    {:else if currentView === "browse"}
      <!-- Item Grid -->
      <div class="flex-1 overflow-hidden flex flex-col relative h-full">
        <div class="flex-1 overflow-y-auto p-3 pb-24 ac-scrollbar grid grid-cols-2 gap-3 self-stretch">
          {#each filteredItems as item (item.id)}
            <div
              onclick={() => selectItem(item)}
              onkeydown={(e) => e.key === 'Enter' && selectItem(item)}
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
      </div>
    {:else if currentView === "detail" && selectedItem}
      <!-- Full-screen details view -->
      <div class="absolute inset-0 bg-[#fbf9f0] p-4 flex flex-col gap-4 animate-fade-in z-50 overflow-y-auto ac-scrollbar">
        <!-- Header with Back Button -->
        <div class="flex items-center">
          <button
            onclick={() => { selectedItem = null; currentView = "browse"; }}
            class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#4c4637] hover:bg-gray-50 active:scale-95 transition-all shrink-0 border border-[#e1d9be]"
          >
            <ChevronLeft class="w-5 h-5" strokeWidth={3} />
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

        <!-- Actions & Lists Management -->
        <div class="flex flex-col gap-3 mt-auto pt-4 pb-2">
          {#if selectedItem.is_orderable}
            {@const isPurchased = nookState.catalog.purchasedIds.includes(selectedItem.id)}
            <button
              onclick={() => {
                if (isPurchased) return;
                const catalogItem = {
                  id: selectedItem.id,
                  name: selectedItem.name,
                  price: selectedItem.buy_price,
                  currency: "Bells",
                  category: selectedItem.category,
                  image: selectedItem.imageUrl
                };
                const success = nookState.purchaseCatalogItem(catalogItem);
                if (success) {
                  alert(`Ordered ${selectedItem.name}! It has been added to your catalog.`);
                } else {
                  alert(`Not enough Bells to order ${selectedItem.name}!`);
                }
              }}
              disabled={isPurchased}
              class={`w-full py-3.5 rounded-full text-sm font-black shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                isPurchased
                  ? "bg-[#bedad4] text-[#2d5c56] cursor-default opacity-80"
                  : "bg-[#82c56f] text-white hover:bg-[#72b55f]"
              }`}
            >
              <ShoppingBag class="w-4 h-4" strokeWidth={3} />
              {isPurchased ? "Already Ordered (In Catalog)" : `Order Item (${selectedItem.buy_price.toLocaleString()} Bells)`}
            </button>
          {/if}

          <!-- Lists Management -->
          <div class="grid grid-cols-3 gap-2 bg-[#fcfaf4] p-3 rounded-2xl border border-[#e1d9be]">
            <button
              onclick={() => nookState.toggleWishlistItem(selectedItem.name)}
              class={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-black transition-all ${
                nookState.isWishlistItem(selectedItem.name)
                  ? "bg-[#fdafb2] border-[#f09a9d] text-[#8c2a2e]"
                  : "bg-white border-[#e1d9be] text-[#8c8577] hover:bg-gray-50"
              }`}
            >
              <Heart class={`w-4 h-4 mb-1 ${nookState.isWishlistItem(selectedItem.name) ? 'fill-[#8c2a2e]' : ''}`} strokeWidth={3} />
              Wishlist
            </button>

            <button
              onclick={() => nookState.toggleStorageItem(selectedItem.name)}
              class={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-black transition-all ${
                nookState.isStorageItem(selectedItem.name)
                  ? "bg-[#d4e8e6] border-[#bedad4] text-[#2d5c56]"
                  : "bg-white border-[#e1d9be] text-[#8c8577] hover:bg-gray-50"
              }`}
            >
              <Archive class="w-4 h-4 mb-1" strokeWidth={3} />
              Storage
            </button>

            <button
              onclick={() => nookState.toggleForTradeItem(selectedItem.name)}
              class={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-black transition-all ${
                nookState.isForTradeItem(selectedItem.name)
                  ? "bg-[#ffebd1] border-[#f5d0a9] text-[#b36b19]"
                  : "bg-white border-[#e1d9be] text-[#8c8577] hover:bg-gray-50"
              }`}
            >
              <ArrowLeftRight class="w-4 h-4 mb-1" strokeWidth={3} />
              For Trade
            </button>
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
