<script lang="ts">
  let {
    categories = [],
    activeCategory = $bindable(""),
    layoutStyle = "scroll",
    getCategoryIcon,
    getCategoryLabel,
    activeBgClass = "bg-[#45a38f]",
    inactiveTextClass = "text-[#45a38f]/60 hover:text-[#45a38f]",
    bgClass = "bg-[#fffdf5]",
    borderClass = "border-2 border-[#bedad4]",
    labelBgClass = "bg-[#45a38f]",
    labelTextClass = "text-[#fffdf5]"
  }: {
    categories: any[];
    activeCategory: any;
    layoutStyle?: "scroll" | "wrap";
    getCategoryIcon?: (cat: any) => any;
    getCategoryLabel?: (cat: any) => string;
    activeBgClass?: string;
    inactiveTextClass?: string;
    bgClass?: string;
    borderClass?: string;
    labelBgClass?: string;
    labelTextClass?: string;
  } = $props();

  const label = $derived(getCategoryLabel ? getCategoryLabel(activeCategory) : String(activeCategory));
</script>

<div class="relative flex flex-col items-center mt-3 mb-1 w-full shrink-0">
  <!-- Active Category Label Pill -->
  {#if activeCategory}
    <div class={`absolute top-0 ${labelBgClass} ${labelTextClass} px-4 py-0.5 rounded-full text-[13px] font-black tracking-wide shadow-sm z-20 whitespace-nowrap`}
         style="transform: translateY(-50%);">
      {label}
    </div>
  {/if}

  <!-- Cloud-like background for icons -->
  {#if layoutStyle === 'wrap'}
    <div class={`${bgClass} rounded-3xl w-fit max-w-full shadow-sm flex relative ${borderClass} py-3 px-2 mx-auto`}>
      <div class="flex-1 flex flex-wrap justify-center gap-3 items-center">
        {#each categories as cat}
          {@const Icon = getCategoryIcon ? getCategoryIcon(cat) : null}
          <button 
            onclick={() => activeCategory = cat}
            class={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${
              activeCategory === cat 
                ? `${activeBgClass} text-white shadow-md scale-110` 
                : inactiveTextClass
            }`}
            title={getCategoryLabel ? getCategoryLabel(cat) : String(cat)}
          >
            {#if Icon}
              <Icon class="w-5 h-5" strokeWidth={activeCategory === cat ? 3 : 2} />
            {:else}
              <span class="text-sm font-bold">{getCategoryLabel ? getCategoryLabel(cat).substring(0, 1) : String(cat).substring(0, 1)}</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {:else}
    <div class={`${bgClass} rounded-full h-14 w-fit max-w-full mx-auto shadow-sm flex items-center relative overflow-hidden ${borderClass}`}>
      <div class="flex flex-nowrap justify-start gap-4 overflow-x-auto ac-scrollbar px-6 items-center h-full">
        {#each categories as cat}
          {@const Icon = getCategoryIcon ? getCategoryIcon(cat) : null}
          <button 
            onclick={() => activeCategory = cat}
            class={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${
              activeCategory === cat 
                ? `${activeBgClass} text-white shadow-md scale-110` 
                : inactiveTextClass
            }`}
            title={getCategoryLabel ? getCategoryLabel(cat) : String(cat)}
          >
            {#if Icon}
              <Icon class="w-5 h-5" strokeWidth={activeCategory === cat ? 3 : 2} />
            {:else}
              <span class="text-sm font-bold">{getCategoryLabel ? getCategoryLabel(cat).substring(0, 1) : String(cat).substring(0, 1)}</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
