<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getPhoneContext } from './phoneContext.svelte';
  import NookAppHeader from './NookAppHeader.svelte';
  import NookSearchBar from '../molecules/NookSearchBar.svelte';
  import NookCategoryBar from '../molecules/NookCategoryBar.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import { X as XIcon } from '@lucide/svelte';

  const ctx = getPhoneContext();

  let {
    // Layout classes
    bgClass = "bg-[#e5f1f0]",
    textClass = "text-[#2d5c56]",

    // Header props
    title,
    subtitle = "",
    headerBgClass = "bg-[#45a38f]",
    headerTextClass = "text-[#fffdf5]",
    iconSnippet,
    headerActions,

    // Search Bar props
    showSearch = false,
    searchTerm = $bindable(""),
    searchPlaceholder = "Search...",
    searchThemeColorClass = "text-[#45a38f]",
    searchFocusBorderClass = "focus:border-[#45a38f]",
    searchBorderColorClass = "border-[#bedad4]",
    searchBgClass = "bg-[#fffdf5]",
    searchTextColorClass = "text-[#2d5c56]",

    // Filter Panel (optional)
    filterPanel,

    // Category Bar props
    categories = [],
    activeCategory = $bindable(""),
    categoryLayoutStyle = "scroll",
    getCategoryIcon,
    getCategoryLabel,
    categoryActiveBgClass = "bg-[#45a38f]",
    categoryInactiveTextClass = "text-[#45a38f]/60 hover:text-[#45a38f]",
    categoryBgClass = "bg-[#fffdf5]",
    categoryBorderClass = "border-2 border-[#bedad4]",
    categoryLabelBgClass = "bg-[#45a38f]",
    categoryLabelTextClass = "text-[#fffdf5]",

    // Bottom Navigation Bar snippet
    bottomNav,
    showBottomNav = true,
    bottomNavBgClass = "bg-[#fffdf5]",
    bottomNavBorderClass = "border-t-4 border-[#bedad4]",

    // Default Content slot
    children
  }: {
    bgClass?: string;
    textClass?: string;
    title: string;
    subtitle?: string;
    headerBgClass?: string;
    headerTextClass?: string;
    iconSnippet?: Snippet;
    headerActions?: Snippet;
    showSearch?: boolean;
    searchTerm?: string;
    searchPlaceholder?: string;
    searchThemeColorClass?: string;
    searchFocusBorderClass?: string;
    searchBorderColorClass?: string;
    searchBgClass?: string;
    searchTextColorClass?: string;
    filterPanel?: Snippet;
    categories?: any[];
    activeCategory?: any;
    categoryLayoutStyle?: "scroll" | "wrap";
    getCategoryIcon?: (cat: any) => any;
    getCategoryLabel?: (cat: any) => string;
    categoryActiveBgClass?: string;
    categoryInactiveTextClass?: string;
    categoryBgClass?: string;
    categoryBorderClass?: string;
    categoryLabelBgClass?: string;
    categoryLabelTextClass?: string;
    bottomNav?: Snippet;
    showBottomNav?: boolean;
    bottomNavBgClass?: string;
    bottomNavBorderClass?: string;
    children?: Snippet;
  } = $props();
</script>

<div class={`flex flex-col h-full max-h-full ${bgClass} ${textClass} font-['Varela_Round',sans-serif] relative overflow-hidden select-none`}>
  <!-- Header -->
  <NookAppHeader 
    title={title} 
    subtitle={subtitle} 
    bgClass={headerBgClass} 
    textClass={headerTextClass}
  >
    {#snippet iconSnippet()}
      {#if iconSnippet}
        {@render iconSnippet()}
      {/if}
    {/snippet}
    {#snippet actions()}
      {#if headerActions}
        {@render headerActions()}
      {:else}
        <NookToolbarButton onclick={ctx.handleHomeButton} title="Close App">
          <XIcon class="w-3.5 h-3.5 stroke-[3px] text-[#2d5c56]" />
        </NookToolbarButton>
      {/if}
    {/snippet}
  </NookAppHeader>

  <!-- Top Bar: Categories & Search Wrapper -->
  {#if showSearch || categories.length > 0}
    <div class="pt-4 pb-2 px-4 relative flex flex-col shrink-0 z-10 gap-3">
      <!-- Search Bar -->
      {#if showSearch}
        <NookSearchBar 
          bind:value={searchTerm}
          placeholder={searchPlaceholder}
          themeColorClass={searchThemeColorClass}
          focusBorderClass={searchFocusBorderClass}
          borderColorClass={searchBorderColorClass}
          bgClass={searchBgClass}
          textClass={searchTextColorClass}
        />
      {/if}

      <!-- Filter Panel snippet -->
      {#if filterPanel}
        {@render filterPanel()}
      {/if}

      <!-- Category Bar -->
      {#if categories.length > 0}
        <NookCategoryBar 
          categories={categories}
          bind:activeCategory={activeCategory}
          layoutStyle={categoryLayoutStyle}
          getCategoryIcon={getCategoryIcon}
          getCategoryLabel={getCategoryLabel}
          activeBgClass={categoryActiveBgClass}
          inactiveTextClass={categoryInactiveTextClass}
          bgClass={categoryBgClass}
          borderClass={categoryBorderClass}
          labelBgClass={categoryLabelBgClass}
          labelTextClass={categoryLabelTextClass}
        />
      {/if}
    </div>
  {/if}

  <!-- Main Content List / Views -->
  <div class="flex-1 flex flex-col relative overflow-hidden w-full h-full">
    {#if children}
      {@render children()}
    {/if}
  </div>

  <!-- Bottom App Bar / Navigation -->
  {#if bottomNav && showBottomNav}
    <div class={`shrink-0 ${bottomNavBgClass} ${bottomNavBorderClass} px-4 pt-3 pb-6 flex items-center justify-around z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] rounded-t-3xl mt-[-10px] relative`}>
      {@render bottomNav()}
    </div>
  {/if}
</div>
