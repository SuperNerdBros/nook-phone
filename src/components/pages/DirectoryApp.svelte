<script lang="ts">
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import nookState from '@/lib/nookState.svelte';
  import { projectsData } from '@/lib/nookData';
  import { Search, Download, CheckCircle, Smartphone, Code, Globe, XIcon, Trash2, Play, Users, CloudDownload, Box, Grid3x3, BookOpen, CheckSquare, Palette, Moon, Music, TrendingUp, Image as ImageIcon, Star, Monitor, CloudSun, Store, LifeBuoy, Settings2 } from '@lucide/svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import Rating from '../atoms/Rating.svelte';
  import { fetchApps, installAppTracker, rateApp, isProUser } from '@/lib/api';
  import { onMount } from 'svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';

  const ctx = getPhoneContext();
  
  let cloudApps: Record<string, any> = $state({});
  let proUser = $state(false);

  let searchTerm = $state("");
  let selectedCategory = $state("all");
  let selectedLanguage = $state("en");
  let showFilters = $state(false);
  let selectedApp = $state<any>(null);
  let currentView = $state<"grid" | "detail">("grid");
  let ratingComments = $state<Record<string, string>>({});
  
  const allToolTypes = Array.from(new Set(projectsData.flatMap(p => p.tools)));
  const allLanguages = Array.from(new Set(projectsData.flatMap(p => p.languages || []))).sort();
  const languageNames: Record<string, string> = {
    all: "All Languages", en: "English", es: "Spanish", de: "German", fr: "French",
    it: "Italian", jp: "Japanese", ru: "Russian", zh: "Chinese", ko: "Korean"
  };

  onMount(async () => {
    proUser = isProUser();
    
    // Attempt to match browser locale
    if (typeof navigator !== 'undefined' && navigator.language) {
      const loc = navigator.language.split('-')[0].toLowerCase();
      if (allLanguages.includes(loc)) selectedLanguage = loc;
    }

    const apps = await fetchApps();
    const map: Record<string, any> = {};
    apps.forEach((a: any) => {
      map[a.slug] = a;
    });
    cloudApps = map;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "all": return Grid3x3;
      case "tracking": return CheckSquare;
      case "economy": return TrendingUp;
      case "multiplayer": return Users;
      case "creative": return Palette;
      case "utilities": return Monitor;
      case "reference": return BookOpen;
      default: return Box;
    }
  };

  let filteredProjects = $derived(projectsData.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.tools.includes(selectedCategory);
    const matchesLang = selectedLanguage === "all" || (p.languages && p.languages.includes(selectedLanguage));
    return matchesSearch && matchesCategory && matchesLang;
  }));

  async function handleInstall(projectName: string) {
    nookState.installApp(projectName);
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await installAppTracker(slug);
    // Refresh stats
    const apps = await fetchApps();
    const map: Record<string, any> = {};
    apps.forEach((a: any) => { map[a.slug] = a; });
    cloudApps = map;
  }

  function handleUninstall(projectName: string) {
    nookState.uninstallApp(projectName);
  }

  async function handleRate(projectName: string, rating: number) {
    if (!proUser) return;
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const comment = ratingComments[slug] || '';
    await rateApp(slug, rating, comment);
    // Refresh stats
    const apps = await fetchApps();
    const map: Record<string, any> = {};
    apps.forEach((a: any) => { map[a.slug] = a; });
    cloudApps = map;
  }
</script>

<div class="flex flex-col h-full bg-[#e5f1f0] text-[#2d5c56] font-['Varela_Round',sans-serif] relative overflow-hidden select-none">
  
  <!-- Header -->
  <NookAppHeader 
    title="Community Toolchest" 
    subtitle="Master Tools" 
    bgClass="bg-[#45a38f]" 
    textClass="text-[#fffdf5]"
  >
    {#snippet iconSnippet()}
      <Box class="w-5 h-5 drop-shadow-sm mr-1 text-[#fffdf5]" strokeWidth={3} />
    {/snippet}
    {#snippet leftActions()}
      <button onclick={() => showFilters = !showFilters} class="nook-header-btn mr-1" title="Filters">
        <Settings2 class="w-3.5 h-3.5 stroke-[3px] text-[#2d5c56]" />
      </button>
    {/snippet}
    {#snippet actions()}
      <button onclick={ctx.handleHomeButton} class="nook-header-btn" title="Close App">
        <XIcon class="w-3.5 h-3.5 stroke-[3px] text-[#2d5c56]" />
      </button>
    {/snippet}
  </NookAppHeader>

  <!-- Main Content Area -->
  <div class="flex-1 relative overflow-hidden w-full h-full">
    
    <!-- Grid View -->
    <div class={`absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ${currentView === 'grid' ? 'translate-x-0' : '-translate-x-full'}`}>
      
      <!-- Top Bar: Categories & Search -->
      <div class="pt-4 pb-2 px-4 relative flex flex-col shrink-0 z-10 gap-3">
        <!-- Search Bar -->
        <div class="relative drop-shadow-sm">
          <Search class="w-5 h-5 text-[#45a38f] absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search tools..."
            bind:value={searchTerm}
            class="w-full bg-[#fffdf5] pl-11 pr-4 py-3 rounded-2xl text-[13px] font-black border-4 border-[#bedad4] focus:outline-none focus:border-[#45a38f] text-[#2d5c56] placeholder:text-[#45a38f]/60 transition-colors shadow-inner"
          />
        </div>

        <!-- Filter Panel -->
        {#if showFilters}
          <div class="bg-[#fffdf5] rounded-2xl border-4 border-[#bedad4] p-3 shadow-inner flex flex-col gap-2 transition-all animate-fade-in-down origin-top">
            <h3 class="text-[11px] font-black uppercase text-[#45a38f]">Filter by Language</h3>
            <div class="flex flex-wrap gap-2">
              {#each ['all', ...allLanguages] as lang}
                <button
                  onclick={() => selectedLanguage = lang}
                  class={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${selectedLanguage === lang ? 'bg-[#2d5c56] text-[#fffdf5]' : 'bg-[#e5f1f0] text-[#2d5c56] hover:bg-[#bedad4]'}`}
                >
                  {languageNames[lang] || lang.toUpperCase()}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Categories Pill -->
        <div class="relative flex flex-col items-center mt-3 mb-1 w-full">
          <!-- Active Category Label Pill -->
          <div class="absolute top-0 bg-[#45a38f] text-[#fffdf5] px-4 py-0.5 rounded-full text-[13px] font-black tracking-wide shadow-sm z-20 whitespace-nowrap"
               style="transform: translateY(-50%);">
            {selectedCategory === 'all' ? 'All Tools' : selectedCategory.toUpperCase()}
          </div>

          <!-- Cloud-like white background for icons -->
          <div class="bg-[#fffdf5] rounded-3xl w-full max-w-lg shadow-sm flex relative border-2 border-[#bedad4] py-3 px-2">
            <div class="flex-1 flex flex-wrap justify-center gap-3 items-center">
              {#each ['all', ...allToolTypes] as category}
                {@const Icon = getCategoryIcon(category)}
                <button 
                  onclick={() => {
                    selectedCategory = category;
                  }}
                  class={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all ${
                    selectedCategory === category 
                      ? "bg-[#2d5c56] text-[#fffdf5] shadow-md scale-110" 
                      : "text-[#45a38f]/60 hover:text-[#45a38f]"
                  }`}
                  title={category}
                >
                  <Icon class="w-5 h-5" strokeWidth={selectedCategory === category ? 3 : 2} />
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto ac-scrollbar px-4 pb-10">
        <div class="grid grid-cols-2 gap-3 content-start">
          {#each filteredProjects as p (p.name)}
            {@const isInstalled = nookState.isAppInstalled(p.name)}
            <button
              onclick={() => {
                selectedApp = p;
                currentView = "detail";
              }}
              class="h-44 rounded-xl flex flex-col items-center p-3 pb-8 transition-all relative overflow-hidden group bg-[#d4e8e6] border-2 border-[#bedad4] shadow-sm hover:scale-105"
            >
              <!-- Faux Pattern Background -->
              <div class="absolute inset-0 opacity-[0.05] pointer-events-none" style="background-image: radial-gradient(#2d5c56 1px, transparent 1px); background-size: 10px 10px;"></div>
              
              <!-- Checkmark if installed -->
              {#if isInstalled}
                <div class="absolute top-2 right-2 opacity-70 z-10">
                  <CheckCircle class="w-4 h-4 text-[#2a8b75]" strokeWidth={4} />
                </div>
              {/if}

              <!-- Item Icon -->
              <div class="w-12 h-12 shrink-0 bg-white/50 rounded-2xl border-2 border-white/60 flex items-center justify-center shadow-inner overflow-hidden z-10 mb-2">
                <NookIcon name={p.appIcon || 'directory'} class="w-8 h-8 object-contain drop-shadow-sm group-hover:scale-110 transition-transform" />
              </div>

              <!-- Item Name -->
              <h3 class="text-[#2d5c56] text-[12px] font-black leading-tight truncate w-full text-center z-10">
                {p.name}
              </h3>

              <!-- Item Description -->
              <p class="text-[#45a38f] text-[10px] font-bold leading-tight text-center line-clamp-2 mt-1 z-10 w-full px-1">
                {p.description}
              </p>

              <!-- Craftable Banner -->
              <div class="absolute bottom-0 left-0 w-full bg-[#45a38f] text-[#fffdf5] text-[10px] font-black py-1.5 flex items-center justify-center gap-1 shadow-inner z-10 border-t-2 border-[#368875]">
                {#if isInstalled}
                  Installed
                {:else}
                  <CloudDownload class="w-3.5 h-3.5" strokeWidth={3} /> Cloud
                {/if}
              </div>
            </button>
          {/each}

          {#if filteredProjects.length === 0}
            <div class="col-span-full text-center py-10 opacity-50 font-bold">
              No tools found.
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Detail View -->
    <div class={`absolute inset-0 w-full h-full flex flex-col bg-[#e5f1f0] transition-transform duration-300 z-20 ${currentView === 'detail' ? 'translate-x-0' : 'translate-x-full'}`}>
      {#if selectedApp}
        {@const isInstalled = nookState.isAppInstalled(selectedApp.name)}
        {@const slug = selectedApp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
        {@const stats = cloudApps[slug]}

        <div class="flex flex-col h-full overflow-hidden p-4">
          
          <!-- Header (Back & Title) -->
          <div class="flex items-center gap-2 mb-4 shrink-0">
            <button 
              onclick={() => currentView = "grid"} 
              class="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center shadow-sm text-[#2d5c56] hover:bg-white active:scale-95 transition-all"
            >
              <div class="font-black text-xl leading-none -mt-1 -ml-1">‹</div>
            </button>
            <div class="flex items-center gap-2">
              <Users class="w-5 h-5 text-[#45a38f]" strokeWidth={3} />
              <h2 class="text-[18px] font-bold text-[#2d5c56] capitalize leading-tight tracking-wide truncate">
                {selectedApp.name}
              </h2>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto ac-scrollbar flex flex-col gap-5 pb-28">
            <!-- Preview Square -->
            <div class="w-full aspect-square bg-[#bedad4] rounded-3xl p-6 shadow-inner relative flex flex-col items-center justify-center">
              <div class="w-24 h-24 bg-white/70 rounded-3xl border-4 border-white flex items-center justify-center shadow-md overflow-hidden mb-4">
                <NookIcon name={selectedApp.appIcon || 'directory'} class="w-16 h-16 object-contain drop-shadow-md animate-fade-in" />
              </div>
              <p class="text-[12px] font-bold text-[#2d5c56] leading-snug text-center px-2">
                {selectedApp.description}
              </p>
            </div>

            <!-- Stats & Info -->
            <div class="flex flex-col px-2 gap-3">
              <div class="flex flex-wrap gap-1.5">
                {#each selectedApp.languages as l}
                  <span class="text-[9px] font-black bg-[#45a38f] text-[#fffdf5] px-2 py-0.5 rounded-md uppercase shadow-sm">{l}</span>
                {/each}
                {#each selectedApp.information as info}
                  <span class="text-[9px] font-black bg-[#bedad4] text-[#2d5c56] px-2 py-0.5 rounded-md uppercase border border-[#45a38f]/30">{info}</span>
                {/each}
              </div>

              {#if stats}
                <div class="flex items-center gap-4 text-[11px] font-black text-[#2d5c56]/80 mt-2">
                  <div class="flex items-center gap-1">
                    <Download class="w-3.5 h-3.5 text-[#45a38f]" /> {stats.installs} Installs
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[#f59e33] text-lg leading-none">★</span> {stats.average_rating} ({stats.rating_count})
                  </div>
                </div>
              {:else}
                <div class="text-[10px] font-bold text-[#45a38f] italic">No cloud stats available yet.</div>
              {/if}

              <!-- Rating Section -->
              {#if isInstalled && proUser && stats}
                <div class="mt-2 bg-[#d4e8e6] p-3 rounded-2xl border-2 border-[#bedad4]">
                  <span class="text-[10px] font-black text-[#2d5c56] uppercase tracking-wider block mb-2">Your Review</span>
                  <div class="flex justify-between items-center">
                    <Rating bind:rating={stats.user_rating} size={20} max={5} />
                    <button 
                      onclick={() => handleRate(selectedApp.name, stats.user_rating)}
                      class="bg-[#45a38f] text-[#fffdf5] text-[10px] font-black px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
                    >
                      {stats.user_rating ? 'Update' : 'Submit'}
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="absolute bottom-6 left-6 right-6 flex flex-col gap-2 z-30">
            {#if isInstalled}
              <button
                onclick={() => { currentView = 'grid'; nookState.navigate(selectedApp.id || selectedApp.name); }}
                class="w-full bg-[#1bc6b6] text-white py-3.5 rounded-full text-[15px] font-black shadow-lg hover:bg-[#15a497] active:scale-95 transition-all flex items-center justify-center border-4 border-white/20 uppercase tracking-wider"
              >
                <Play class="w-4 h-4 mr-1.5 fill-current" /> Open Tool
              </button>
              <button
                onclick={() => { handleUninstall(selectedApp.name); currentView = "grid"; }}
                class="w-full bg-[#fdafb2] text-[#8c2a2e] py-3.5 rounded-full text-[15px] font-black shadow-lg hover:bg-[#f09a9d] active:scale-95 transition-all flex items-center justify-center border-4 border-white/20 uppercase tracking-wider"
              >
                <Trash2 class="w-4 h-4 mr-1.5" /> Uninstall
              </button>
            {:else}
              <button
                onclick={() => { handleInstall(selectedApp.name); }}
                class="w-full bg-[#45a38f] text-white py-3.5 rounded-full text-[15px] font-black shadow-lg hover:bg-[#368875] active:scale-95 transition-all flex items-center justify-center border-4 border-white/20 uppercase tracking-wider"
              >
                <CloudDownload class="w-5 h-5 mr-1.5" /> Download
              </button>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
