<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fetchAcnhItems, fetchAcnhVillagers } from '@/lib/api';
  import NookAppTemplate from '@/components/organisms/NookAppTemplate.svelte';
  import NookIcon from '@/components/atoms/NookIcon.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  const ctx = getPhoneContext();
  import nookState from '@/lib/nookState.svelte';
  import AcnhBubble from '@/components/molecules/AcnhBubble.svelte';
  import GiftReactionOverlay from '@/components/molecules/GiftReactionOverlay.svelte';
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
    Handshake,
    Store,
    ChevronLeft,
    Disc,
    Image,
    Wrench,
    Palette,
    Bug,
    Fish,
    Bone,
    Brush,
    Shell
    } from "@lucide/svelte";
  import shoppingIcon from '@/assets/img/icons/shopping_icon.png';

  type AppView = "home" | "browse" | "detail";
  let currentView = $state<AppView>("home");

  let activeTab = $state<"in-stock" | "storage" | "wishlist" | "for-trade">("in-stock");
  let searchTerm = $state("");
  let activeCategory = $state<string>("All");
  let selectedItem = $state<any | null>(null);
  
  let allItems = $state<any[]>([]);
  let allVillagers = $state<any[]>([]);
  let isFriendPickerOpen = $state(false);
  let selectedGiftItem = $state<any | null>(null);
  let selectedGiftFriend = $state<any | null>(null);
  let giftReaction = $state<{ rating: number; message: string } | null>(null);

  $effect(() => {
    fetchAcnhVillagers().then(v => {
      allVillagers = v || [];
    });
  });

  let bestFriendsList = $derived(allVillagers.filter(v => nookState.isBestFriend(v.id)));

  function getGiftReaction(villager: any, item: any) {
    const hashVal = (villager.name.charCodeAt(0) + item.name.charCodeAt(0) + (villager.personality || '').charCodeAt(0)) % 100;
    let rating = 1; let message = "";
    const category = item.category || 'Other';
    const personality = villager.personality || 'Normal';
    if (personality === 'Jock') {
      if (category === 'Furniture' || category === 'Daily Selection') rating = hashVal % 2 === 0 ? 5 : 4;
      else if (category === 'Fashion') rating = 2;
      else rating = 3;
    } else if (personality === 'Snooty') {
      if (item.buy_price > 5000) rating = 5;
      else if (category === 'Fashion') rating = 4;
      else if (item.buy_price < 500) rating = 1;
      else rating = 3;
    } else if (personality === 'Lazy') {
      if (category === 'Other' || category === 'Daily Selection') rating = 5;
      else if (category === 'Fashion') rating = 2;
      else rating = 4;
    } else {
      if (hashVal < 20) rating = 1;
      else if (hashVal < 40) rating = 2;
      else if (hashVal < 70) rating = 3;
      else if (hashVal < 90) rating = 4;
      else rating = 5;
    }

    switch (rating) {
      case 1: message = personality === 'Cranky' ? "Bah! What am I supposed to do with this? Thanks, I guess..." : "Oh, thank you! It's the thought that counts, right?"; break;
      case 2: message = personality === 'Lazy' ? `Oh, cool! A ${item.name}. I might use this for something later. Thanks!` : `Oh, a ${item.name}! Thank you.`; break;
      case 3: message = personality === 'Peppy' ? `Oh my gosh, a ${item.name}! That is so cute! Thanks a million!` : `Wow, a ${item.name}! I really like this.`; break;
      case 4: message = personality === 'Sisterly' ? `Hey, you really hit the nail on the head with this ${item.name}! Thanks.` : `Oh, I love it! A ${item.name} is exactly what I wanted.`; break;
      case 5: message = personality === 'Smug' ? `Magnifique! A ${item.name}! This is a masterpiece of a gift.` : `Oh my goodness! A ${item.name}! I absolutely love this so much!`; break;
    }
    return { rating, message };
  }

  let categories = [
    "All", 
    "Daily Selection",
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
    "Bugs",
    "Fish",
    "Sea Creatures",
    "Fossils",
    "Art",
    "Other"
  ];
  let isLoading = $state(true);

  // Timmy & Tommy Dialog states
  let isNookDialogActive = $state(false);
  let nookDialogText = $state("Welcome! ...Welcome! What item are you looking for?");
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
      case "daily selection": return Sparkles;
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
      case "bugs": return Bug;
      case "fish": return Fish;
      case "sea creatures": return Shell;
      case "fossils": return Bone;
      case "art": return Brush;
      default: return Package;
    }
  };

  onMount(async () => {
    try {
      const items = await fetchAcnhItems();
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
      nookDialogText = "Welcome! ...Welcome! What item are you looking for?";
      return;
    }

    if (nookSearchInput.trim().length < 2) {
      dialogSuggestions = [];
      return;
    }

    suggestionTimeout = setTimeout(() => {
      isFetchingSuggestions = true;
      try {
        const queryLower = nookSearchInput.toLowerCase();
        const results = allItems.filter(item => item.name.toLowerCase().includes(queryLower));
        dialogSuggestions = results ? results.slice(0, 8) : [];
        if (results && results.length > 0) {
          nookDialogText = `We found ${results.length} items! ...items! Is this what you're looking for?`;
        } else {
          nookDialogText = `Oh no! We couldn't find any items matching '${nookSearchInput}'. ...matching! Try another name!`;
        }
      } catch (e) {
        console.error("Failed to filter suggestions locally", e);
      } finally {
        isFetchingSuggestions = false;
      }
    }, 250);
  });



  async function sendGift(friend: any, item: any) {
    if (nookState.settings.soundEffects) {
      const audio = new Audio('/audio/ACNH_Buy_Item.wav');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
    
    import("@/lib/analytics").then(({ analytics }) => {
      analytics.trackInteraction('send_gift', 'shopping', item.name);
    });

    const success = nookState.purchaseCatalogItem({
      id: item.id, name: item.name, price: item.buy_price, currency: "Bells", category: item.category, image: item.imageUrl
    });
    if (success) {
      selectedGiftFriend = friend;
      giftReaction = getGiftReaction(friend, item);
      selectedGiftItem = null; // Wait for reaction
    } else {
      alert("Not enough Bells!");
    }
  }

  async function handleNookSearch() {
    if (!nookSearchInput.trim()) return;
    isSearchingNook = true;
    
    import("@/lib/analytics").then(({ analytics }) => {
      analytics.trackInteraction('search_catalog', 'shopping', nookSearchInput);
    });

    // Use local filtering instead of fetching from API
    searchTerm = nookSearchInput;
    activeCategory = "All";
    hasSearched = true;
    isNookDialogActive = false;
    selectedItem = null;
    currentView = "browse";
    isSearchingNook = false;
  }

  let matchingSearchItems = $derived(allItems.filter((r) => {
    if (activeTab === "storage" && !nookState.isStorageItem(r.id)) return false;
    if (activeTab === "wishlist" && !nookState.isWishlistItem(r.id)) return false;
    if (activeTab === "for-trade" && !nookState.isForTradeItem(r.id)) return false;
    return r.name.toLowerCase().includes(searchTerm.toLowerCase());
  }));

  let availableCategories = $derived.by(() => {
    if (!hasSearched && searchTerm === "" && activeTab === "all") return categories;
    const cats = new Set(matchingSearchItems.map(r => r.category));
    return categories.filter(c => c === "All" || cats.has(c));
  });

  let filteredItems = $derived(matchingSearchItems.filter((r, i) => {
    let matchesCategory = activeCategory === "All" || r.category === activeCategory;
    if (activeCategory === "Daily Selection") {
      matchesCategory = r.is_orderable && (i % 7 === 0);
    }
    return matchesCategory;
  }).slice(0, activeCategory === "Daily Selection" ? 8 : undefined));

  let selectedListIndex = $state(0);
  let activeItem = $derived(filteredItems[selectedListIndex] || null);

  const navigateToCategory = (cat: string) => {
    activeCategory = cat;
    selectedListIndex = 0;
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

  let counterInterval: ReturnType<typeof setInterval> | null = null;
  let counterDelayTimeout: ReturnType<typeof setTimeout> | null = null;

  function startCounterChange(itemId: string, type: 'storage' | 'wishlist' | 'trade', direction: 1 | -1) {
    const change = (amount: number) => {
      const current = nookState.getItemQuantity(itemId, type);
      nookState.setItemQuantity(itemId, Math.max(0, current + amount), type);
    };

    change(direction);

    counterDelayTimeout = setTimeout(() => {
      counterInterval = setInterval(() => {
        change(direction * 10);
      }, 150);
    }, 500);
  }

  function stopCounterChange() {
    if (counterDelayTimeout) {
      clearTimeout(counterDelayTimeout);
      counterDelayTimeout = null;
    }
    if (counterInterval) {
      clearInterval(counterInterval);
      counterInterval = null;
    }
  }

  onDestroy(() => {
    stopCounterChange();
  });
</script>

<NookAppTemplate
  title="Nook Shopping"
  subtitle="Catalog"
  headerBgClass="bg-[#ebce3f]"
  bgClass="nook-shop-bg"
  textClass="text-[#4c4637]"
  showSearch={currentView !== "home"}
  bind:searchTerm={searchTerm}
  searchPlaceholder="Search catalog..."
  searchThemeColorClass="text-[#caa253]"
  searchFocusBorderClass="focus:border-[#82c56f]"
  searchBorderColorClass="border-[#dcd3be]"
  searchBgClass="bg-white"
  searchTextColorClass="text-[#4c4637]"
  categories={currentView === "browse" ? availableCategories : []}
  bind:activeCategory={activeCategory}
  categoryLayoutStyle="wrap"
  getCategoryIcon={getCategoryIcon}
  getCategoryLabel={(cat) => cat}
  categoryActiveBgClass="bg-[#daa520]"
  categoryInactiveTextClass="text-[#daa520]/60 hover:text-[#daa520]"
  categoryBgClass="bg-transparent"
  categoryBorderClass="border-0 shadow-none"
  categoryLabelBgClass="bg-[#daa520]"
  categoryLabelTextClass="text-white"
  showBottomNav={currentView !== "home"}
  bottomNavBgClass="bg-[#fcfaf4]"
  bottomNavBorderClass="border-t-4 border-[#edd8aa]"
>
  {#snippet iconSnippet()}
    <div class="w-12 h-12 mr-1">
      <NookIcon name="shopping" class="w-full h-full object-contain drop-shadow-sm" />
    </div>
  {/snippet}

  {#snippet headerActions()}
    <NookToolbarButton onclick={navigateHome} class="mr-1" title="Home">
      <Store class="w-3.5 h-3.5 stroke-[3px] text-[#4c4637]" />
    </NookToolbarButton>
    <NookToolbarButton onclick={ctx.handleHomeButton} title="Close App">
      <X class="w-3.5 h-3.5 stroke-[3px] text-[#4c4637]" />
    </NookToolbarButton>
  {/snippet}

  {#snippet bottomNav()}
    {#each [
      { id: 'in-stock', label: 'Shop', icon: Store },
      { id: 'storage', label: 'Storage', icon: Archive },
      { id: 'wishlist', label: 'Wishlist', icon: Heart },
      { id: 'for-trade', label: 'For Trade', icon: Handshake }
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

{#if currentView === "home"}
  <!-- ══════════════════════════════════════════════════ -->
  <!-- NOOK SHOPPING HOME — Game-Accurate Landing Page   -->
  <!-- ══════════════════════════════════════════════════ -->
  <div class="nook-shop-home">

    <!-- Top bar: title + bells counter -->
    <!-- <div class="nook-shop-home__topbar">
      <button onclick={ctx.handleHomeButton} class="nook-shop-home__close" title="Close App">
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </button>
    </div> -->

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
              nookDialogText = "Welcome! ...Welcome! What item are you looking for?";
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
          title="Timmy & Tommy"
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

{:else if isLoading}
      <div class="flex-1 flex flex-col items-center justify-center h-full">
        <Loader2 class="w-10 h-10 animate-spin opacity-50 mb-4 text-[#82c56f]" />
        <p class="text-sm font-bold opacity-70">Loading catalog...</p>
      </div>
    {:else}
      <!-- Main Content (Hero + List layout) -->
      <div class="flex-1 flex flex-col min-h-0 relative overflow-hidden nook-catalog-main bg-transparent">
        
                <!-- Hero Section -->
        <div class="nook-catalog-hero z-10 flex flex-col relative min-h-[220px]">
          {#if activeItem}
            <!-- Top Ribbons -->
            <div class="absolute top-4 left-0 w-full flex justify-between items-start pointer-events-none z-20 px-0">
              <!-- Price/Gift Ribbon (Left) -->
              <div class="flex flex-col gap-1.5 items-start pointer-events-auto">
                <!-- Buy Price -->
                <div class="bg-[#ac9774]/90 backdrop-blur-md pl-2 pr-4 py-1 rounded-r-full shadow-sm flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-white opacity-90 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C10.5 2 9.5 3 9.5 4C9.5 4.5 10 5 10 5H14C14 5 14.5 4.5 14.5 4C14.5 3 13.5 2 12 2Z" fill="#ffffff"/>
                    <path d="M6.5 7C6.5 7 4.5 13 4.5 17C4.5 21 7.5 23 12 23C16.5 23 19.5 21 19.5 17C19.5 13 17.5 7 17.5 7H6.5Z" fill="#ffffff"/>
                  </svg>
                  <span class="text-[12px] font-bold text-white whitespace-nowrap">
                    Buy: {activeItem.is_orderable ? Number(activeItem.buy_price).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <!-- Sell Price -->
                <div class="bg-[#ac9774]/90 backdrop-blur-md pl-2 pr-4 py-1 rounded-r-full shadow-sm flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-white opacity-90 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C10.5 2 9.5 3 9.5 4C9.5 4.5 10 5 10 5H14C14 5 14.5 4.5 14.5 4C14.5 3 13.5 2 12 2Z" fill="#ffffff"/>
                    <path d="M6.5 7C6.5 7 4.5 13 4.5 17C4.5 21 7.5 23 12 23C16.5 23 19.5 21 19.5 17C19.5 13 17.5 7 17.5 7H6.5Z" fill="#ffffff"/>
                  </svg>
                  <span class="text-[12px] font-bold text-white whitespace-nowrap">
                    Sell: {activeItem.sell_price ? Number(activeItem.sell_price).toLocaleString() : 'N/A'}
                  </span>
                </div>
                {#if activeItem.is_orderable}
                  <button 
                    onclick={() => { selectedGiftItem = activeItem; isFriendPickerOpen = true; }}
                    class="bg-[#8c2a2e] text-white py-1.5 px-3 ml-2 rounded-full font-black flex items-center justify-center gap-1.5 shadow-sm text-[10px] hover:bg-[#a5373c] transition-colors border-2 border-[#fdf6a8] cursor-pointer"
                  >
                    <ShoppingBag class="w-3 h-3 flex-shrink-0" strokeWidth={3} />
                    Gift
                  </button>
                {/if}
              </div>

              <!-- Right Side Badges (Counters) -->
              <div class="flex flex-col gap-2 items-end pointer-events-auto mt-2">

                <!-- Storage Badge -->
                <div class="bg-[#fcfaf4]/90 backdrop-blur-md pl-4 pr-3 py-1.5 rounded-l-full shadow-sm flex items-center gap-3 border-y-2 border-l-2 border-[#e1d9be]">
                  <button 
                    class="text-[#8c8577] hover:text-[#82c56f] active:scale-95 transition-transform font-black text-xl w-7 h-7 flex items-center justify-center pb-0.5 cursor-pointer select-none" 
                    onpointerdown={(e) => { if (e.button === 0) startCounterChange(activeItem.id, 'storage', -1); }}
                    onpointerup={stopCounterChange}
                    onpointerleave={stopCounterChange}
                    onpointercancel={stopCounterChange}
                    oncontextmenu={(e) => e.preventDefault()}
                  >-</button>
                  <button onclick={() => { nookState.toggleStorageItem(activeItem.id); }} class="flex items-center gap-2">
                    <Archive class="w-5 h-5 {nookState.isStorageItem(activeItem.id) ? 'fill-[#bedad4] text-[#2d5c56]' : 'text-[#8c8577] hover:text-[#82c56f]'}" strokeWidth={nookState.isStorageItem(activeItem.id) ? 3 : 2} />
                    <span class="text-[14px] font-black w-4 text-center {nookState.isStorageItem(activeItem.id) ? 'text-[#2d5c56]' : 'text-[#a89f91]'}">
                      {nookState.getItemQuantity(activeItem.id, 'storage')}
                    </span>
                  </button>
                  <button 
                    class="text-[#8c8577] hover:text-[#82c56f] active:scale-95 transition-transform font-black text-xl w-7 h-7 flex items-center justify-center pb-0.5 cursor-pointer select-none" 
                    onpointerdown={(e) => { if (e.button === 0) startCounterChange(activeItem.id, 'storage', 1); }}
                    onpointerup={stopCounterChange}
                    onpointerleave={stopCounterChange}
                    onpointercancel={stopCounterChange}
                    oncontextmenu={(e) => e.preventDefault()}
                  >+</button>
                </div>
                
                <!-- Wishlist Badge -->
                <div class="bg-[#fcfaf4]/90 backdrop-blur-md pl-4 pr-3 py-1.5 rounded-l-full shadow-sm flex items-center gap-3 border-y-2 border-l-2 border-[#e1d9be]">
                  <button 
                    class="text-[#8c8577] hover:text-[#82c56f] active:scale-95 transition-transform font-black text-xl w-7 h-7 flex items-center justify-center pb-0.5 cursor-pointer select-none" 
                    onpointerdown={(e) => { if (e.button === 0) startCounterChange(activeItem.id, 'wishlist', -1); }}
                    onpointerup={stopCounterChange}
                    onpointerleave={stopCounterChange}
                    onpointercancel={stopCounterChange}
                    oncontextmenu={(e) => e.preventDefault()}
                  >-</button>
                  <button onclick={() => { nookState.toggleWishlistItem(activeItem.id); }} class="flex items-center gap-2">
                    <Heart class="w-5 h-5 {nookState.isWishlistItem(activeItem.id) ? 'fill-[#fdafb2] text-[#8c2a2e]' : 'text-[#8c8577] hover:text-[#82c56f]'}" />
                    <span class="text-[14px] font-black w-4 text-center {nookState.isWishlistItem(activeItem.id) ? 'text-[#8c2a2e]' : 'text-[#a89f91]'}">
                      {nookState.getItemQuantity(activeItem.id, 'wishlist')}
                    </span>
                  </button>
                  <button 
                    class="text-[#8c8577] hover:text-[#82c56f] active:scale-95 transition-transform font-black text-xl w-7 h-7 flex items-center justify-center pb-0.5 cursor-pointer select-none" 
                    onpointerdown={(e) => { if (e.button === 0) startCounterChange(activeItem.id, 'wishlist', 1); }}
                    onpointerup={stopCounterChange}
                    onpointerleave={stopCounterChange}
                    onpointercancel={stopCounterChange}
                    oncontextmenu={(e) => e.preventDefault()}
                  >+</button>
                </div>

                <!-- Trade Badge -->
                <div class="bg-[#fcfaf4]/90 backdrop-blur-md pl-4 pr-3 py-1.5 rounded-l-full shadow-sm flex items-center gap-3 border-y-2 border-l-2 border-[#e1d9be]">
                  <button 
                    class="text-[#8c8577] hover:text-[#82c56f] active:scale-95 transition-transform font-black text-xl w-7 h-7 flex items-center justify-center pb-0.5 cursor-pointer select-none" 
                    onpointerdown={(e) => { if (e.button === 0) startCounterChange(activeItem.id, 'trade', -1); }}
                    onpointerup={stopCounterChange}
                    onpointerleave={stopCounterChange}
                    onpointercancel={stopCounterChange}
                    oncontextmenu={(e) => e.preventDefault()}
                  >-</button>
                  <button onclick={() => { nookState.toggleForTradeItem(activeItem.id); }} class="flex items-center gap-2">
                    <Handshake class="w-5 h-5 {nookState.isForTradeItem(activeItem.id) ? 'text-[#b36b19]' : 'text-[#8c8577] hover:text-[#82c56f]'}" strokeWidth={nookState.isForTradeItem(activeItem.id) ? 3 : 2} />
                    <span class="text-[14px] font-black w-4 text-center {nookState.isForTradeItem(activeItem.id) ? 'text-[#b36b19]' : 'text-[#a89f91]'}">
                      {nookState.getItemQuantity(activeItem.id, 'trade')}
                    </span>
                  </button>
                  <button 
                    class="text-[#8c8577] hover:text-[#82c56f] active:scale-95 transition-transform font-black text-xl w-7 h-7 flex items-center justify-center pb-0.5 cursor-pointer select-none" 
                    onpointerdown={(e) => { if (e.button === 0) startCounterChange(activeItem.id, 'trade', 1); }}
                    onpointerup={stopCounterChange}
                    onpointerleave={stopCounterChange}
                    onpointercancel={stopCounterChange}
                    oncontextmenu={(e) => e.preventDefault()}
                  >+</button>
                </div>

              </div>
            </div>

            <!-- Hero Image Full Width -->
            <div class="flex-1 w-full h-[180px] flex justify-center items-center py-4 relative z-10 pt-16 pb-4">
              {#if activeItem.imageUrl}
                <img src={activeItem.imageUrl} alt={activeItem.name} class="w-full h-full max-h-[140px] object-contain drop-shadow-xl hover:scale-110 transition-transform duration-300" />
              {:else}
                <Leaf class="w-24 h-24 text-[#c6b199]" />
              {/if}
            </div>
          {:else}
            <div class="flex-1 flex flex-col items-center justify-center text-[#8c8577] opacity-50 w-full">
              <Leaf class="w-12 h-12 mb-2" />
              <p class="font-bold text-sm">No item selected</p>
            </div>
          {/if}
        </div>

        <!-- List Section -->
        <div class="flex-1 min-h-0 overflow-hidden relative z-10">
          <div class="h-full overflow-y-auto px-3 ac-scrollbar pt-2 pb-6 flex flex-col gap-1">
            {#each filteredItems as item, i}
              <button 
                class={`flex items-center px-2 py-1.5 transition-all cursor-pointer text-left w-full relative
                  ${selectedListIndex === i 
                    ? 'nook-shop-item--active z-10 shadow-sm rounded-md' 
                    : 'bg-transparent border-t-2 border-dashed border-[#cbbd9b] hover:bg-white/20'
                  }
                `}
                style={i === 0 && selectedListIndex !== 0 ? 'border-top: none;' : ''}
                onclick={() => selectedListIndex = i}
              >
                <!-- Cursor/Spacing -->
                <div class="w-6 flex-shrink-0 flex items-center justify-center relative">
                  {#if selectedListIndex === i}
                    <span class="text-xl leading-none drop-shadow-md absolute -left-1">👉🏻</span>
                  {/if}
                </div>
                
                <!-- Category Icon -->
                <div class="w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0">
                   {#if item.imageUrl}
                     <img src={item.imageUrl} alt={item.name} class="w-full h-full object-contain drop-shadow-sm scale-110" />
                   {:else}
                     <Leaf class="w-6 h-6 text-[#7a9d59] drop-shadow-sm" />
                   {/if}
                </div>
                
                <!-- Name -->
                <div class="flex-1 font-bold text-[#5a4a18] text-[15px] leading-tight pr-2 drop-shadow-sm">
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </div>
                
                <!-- Price -->
                <div class="flex items-center gap-1.5 font-bold text-[#5a4a18] text-[15px] whitespace-nowrap drop-shadow-sm">
                  <svg class="w-4 h-4 text-[#cfb036]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C10.5 2 9.5 3 9.5 4C9.5 4.5 10 5 10 5H14C14 5 14.5 4.5 14.5 4C14.5 3 13.5 2 12 2Z" fill="#ffb75e"/>
                    <path d="M6.5 7C6.5 7 4.5 13 4.5 17C4.5 21 7.5 23 12 23C16.5 23 19.5 21 19.5 17C19.5 13 17.5 7 17.5 7H6.5Z" fill="#ffd470"/>
                  </svg>
                  <span>{item.is_orderable ? Number(item.buy_price).toLocaleString() : 'N/A'}</span>
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
  
{#if isFriendPickerOpen}
  <div class="absolute inset-0 z-50 bg-[#fdfcf0]/90 backdrop-blur-md flex flex-col p-4 animate-fade-in">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-black text-[#5a4a18]">Send to Best Friend</h2>
      <button onclick={() => isFriendPickerOpen = false} class="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-[#5a4a18]">
        <X class="w-5 h-5" strokeWidth={3} />
      </button>
    </div>
    
    <div class="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-2">
      {#each bestFriendsList as friend}
        <button 
          onclick={() => sendGift(friend, selectedGiftItem)}
          class="flex items-center gap-3 p-3 bg-white rounded-2xl border-2 border-[#e1d9be] shadow-sm active:scale-95 transition-transform"
        >
          <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-[#f0b157] bg-[#fcfaf4] flex-shrink-0">
            <img src={friend.image_url} alt={friend.name} class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 text-left">
            <h3 class="font-bold text-[#5a4a18]">{friend.name}</h3>
            <p class="text-[10px] uppercase font-black text-[#8c8577]">{friend.personality}</p>
          </div>
          <div class="w-8 h-8 bg-[#bedad4] text-[#2d5c56] rounded-full flex items-center justify-center">
            <Send class="w-4 h-4 ml-0.5" strokeWidth={3} />
          </div>
        </button>
      {/each}
      
      {#if bestFriendsList.length === 0}
        <div class="text-center py-10 opacity-60">
          <Heart class="w-10 h-10 mx-auto mb-2 text-[#8c8577]" />
          <p class="font-bold text-sm text-[#8c8577]">No best friends yet!</p>
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if giftReaction}
  <GiftReactionOverlay 
    villager={selectedGiftFriend}
    reaction={giftReaction}
    onClose={() => {
      isFriendPickerOpen = false;
      giftReaction = null;
      selectedGiftFriend = null;
    }}
  />
{/if}

  </NookAppTemplate>

<style>
  /* ══════════════════════════════════════════════════════ */
  /* NOOK SHOPPING GLOBAL BACKGROUND                       */
  /* ══════════════════════════════════════════════════════ */
  :global(.nook-shop-bg) {
    background-color: #fdf6a8 !important;
  }
  :global(.nook-shop-bg)::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0.4;
    pointer-events: none;
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23dfac2d" fill-opacity="0.3" stroke="%23dfac2d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.4"%3E%3Cpath d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-13.4 3.2"%3E%3C/path%3E%3Cpath d="M14 11.5a3 3 0 0 0-3-3H7.5"%3E%3C/path%3E%3C/svg%3E');
    background-size: 50px 50px;
    animation: movePatternGlobal 15s linear infinite;
    z-index: 0;
  }
  @keyframes -global-movePatternGlobal {
    from { background-position: 0 0; }
    to { background-position: -50px -50px; }
  }

  .nook-shop-item--active {
    background-image: linear-gradient(
      -45deg,
      #f8e34b 25%,
      #e8d13b 25%,
      #e8d13b 50%,
      #f8e34b 50%,
      #f8e34b 75%,
      #e8d13b 75%,
      #e8d13b 100%
    );
    background-size: 34px 34px;
    animation: moveActiveStripes 1s linear infinite;
  }

  @keyframes moveActiveStripes {
    0% { background-position: 0 0; }
    100% { background-position: 34px 0; }
  }

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
    background: transparent;
    position: relative;
    overflow: hidden;
    font-family: 'Varela Round', sans-serif;
    padding: 20px 24px;
    gap: 16px;
    user-select: none;
  }

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
