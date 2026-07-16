<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { catalogData, type CatalogItem } from '@/lib/nookData';
  import { ShoppingBag, Search, CheckCircle } from '@lucide/svelte';

  let searchTerm = $state("");
  let activeCategory = $state<"all" | "Furniture" | "Fashion" | "Wallpaper" | "Tools">("all");
  let boughtItem = $state<CatalogItem | null>(null);

  let filteredCatalog = $derived(catalogData.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }));

  const handleBuy = (item: CatalogItem) => {
    const success = nookState.purchaseCatalogItem(item);
    if (success) {
      boughtItem = item;
    } else {
      alert(`Insufficient funds! You need ${item.price} ${item.currency} to buy this item.`);
    }
  };

  const categories = ["all", "Furniture", "Fashion", "Wallpaper", "Tools"] as const;
</script>

<div id="shopping-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <div class="bg-[#afd4db] text-[#1e4854] p-4 pt-6 ac-wavy-header flex justify-between items-center z-10 shrink-0">
    <div>
      <h1 class="text-xl font-bold flex items-center gap-1.5">🍃 Nook Shopping</h1>
      <p class="text-xs opacity-90">Order items & redeem Nook Miles</p>
    </div>
  </div>

  <!-- Wallets panel -->
  <div class="bg-[#f0f6f7] p-2 px-3 border-b border-[#c8dfe2] flex justify-between text-[11px] shrink-0 z-10 font-bold">
    <span class="text-amber-700">💰 {nookState.bells.toLocaleString()} Bells</span>
    <span class="text-emerald-700">🎈 {nookState.miles.toLocaleString()} Miles</span>
  </div>

  <!-- Category filters -->
  <div class="flex bg-[#fbf9f0] border-b border-[#e4dfd0] text-xs shrink-0 z-10">
    {#each categories as cat}
      <button
        onclick={() => {
          activeCategory = cat;
          boughtItem = null;
        }}
        class="flex-1 py-3 font-extrabold text-center uppercase tracking-wider border-b-2 transition-all {
          activeCategory === cat
            ? 'border-[#afd4db] text-teal-800 bg-white font-black'
            : 'border-transparent text-gray-400 hover:text-gray-600'
        }"
      >
        {cat === "all" ? "📂 All" : cat === "Furniture" ? "🪑 Furn" : cat === "Fashion" ? "👕 Clothes" : cat === "Wallpaper" ? "🖼️ Wall" : "🔧 Tools"}
      </button>
    {/each}
  </div>

  <!-- Search and results -->
  <div class="p-3 bg-[#f4f1e3] border-b border-[#e1d9be] shrink-0 text-xs">
    <div class="relative">
      <Search class="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
      <input
        id="shopping-search"
        type="text"
        placeholder="Search catalog items..."
        bind:value={searchTerm}
        class="w-full bg-white pl-8 pr-3 py-1.5 rounded-xl border border-[#dcd3be] focus:outline-none focus:ring-2 focus:ring-[#afd4db] text-[#4c4637] text-xs"
      />
    </div>
  </div>

  <!-- Catalog items list -->
  <div class="flex-1 overflow-y-auto p-3 ac-scrollbar grid grid-cols-2 gap-3 self-stretch bg-[#fcfbf9]/50">
    {#each filteredCatalog as item (item.id)}
      {@const isPurchased = nookState.catalog.purchasedIds.includes(item.id)}
      <div
        class="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between items-start gap-1 group relative hover:scale-[1.01] transition-all"
      >
        <!-- Thumbnail image -->
        <div class="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden relative shadow-inner mb-1 border border-gray-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            class="w-full h-full object-cover group-hover:scale-105 transition"
          />
        </div>

        <span class="text-[9px] uppercase font-bold text-gray-400">{item.category}</span>
        <h3 class="font-extrabold text-xs text-[#4c4637] leading-tight min-h-[32px] line-clamp-2">
          {item.name}
        </h3>

        <!-- Price Tag & Buy -->
        <div class="w-full flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-gray-100">
          <span class="font-mono font-extrabold text-xs text-[#4c4637]">
            {item.currency === "Bells" ? "💰" : "🎈"} {item.price.toLocaleString()}
          </span>
          
          <button
            onclick={() => handleBuy(item)}
            class="bg-[#afd4db] hover:bg-[#8ebac2] text-white p-1 rounded-lg transition active:scale-90 shadow-inner"
            title="Purchase Item"
          >
            <ShoppingBag class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    {/each}
  </div>

  <!-- Success checkout invoice modal -->
  {#if boughtItem}
    <div class="absolute inset-0 bg-[#4c4637]/75 flex flex-col items-center justify-center gap-4 z-50 text-white animate-fade-in p-4">
      <div class="bg-white p-5 rounded-3xl text-center text-[#4c4637] flex flex-col items-center gap-3 max-w-xs shadow-2xl">
        <div class="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
          <CheckCircle class="w-8 h-8" />
        </div>
        
        <div>
          <h2 class="text-xs uppercase tracking-widest text-[#caa253] font-bold">Order Received!</h2>
          <p class="text-lg font-black mt-0.5">{boughtItem.name}</p>
        </div>

        <p class="text-xs text-gray-500 leading-relaxed">
          Yahoo! Your purchase of **{boughtItem.name}** was processed. Nook Delivery will dispatch this package straight to your mailbox in a jiffy!
        </p>

        <button
          onclick={() => boughtItem = null}
          class="mt-2 w-full bg-[#afd4db] text-[#1e4854] py-2 rounded-xl text-xs font-black hover:bg-opacity-90"
        >
          Yahoo! Close
        </button>
      </div>
    </div>
  {/if}
</div>
