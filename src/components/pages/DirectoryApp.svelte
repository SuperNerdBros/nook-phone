<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { projectsData } from '@/lib/nookData';
  import { Search, Globe, Download, CheckCircle, Store, Smartphone, Code, ArrowLeft } from '@lucide/svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import { fetchApps, installAppTracker, rateApp, isProUser } from '@/lib/api';
  import { onMount } from 'svelte';

  const getBgUrl = (bgName: string): string => {
    let base = "/assets/bgs/";
    if (typeof window !== 'undefined' && window.wpApiSettings?.pluginUrl) {
      const pluginUrl = window.wpApiSettings.pluginUrl;
      base = pluginUrl.endsWith('/') ? pluginUrl + 'public/assets/bgs/' : pluginUrl + '/public/assets/bgs/';
    }
    return `${base}${bgName}`;
  };
  
  let cloudApps: Record<string, any> = $state({});
  let proUser = $state(false);

  onMount(async () => {
    proUser = isProUser();
    const apps = await fetchApps();
    const map: Record<string, any> = {};
    apps.forEach((a: any) => {
      map[a.slug] = a;
    });
    cloudApps = map;
  });

  let searchTerm = $state("");
  let selectedLanguage = $state("all");
  let selectedInfo = $state("all");
  let selectedTool = $state("all");
  let activeCategory = $state<string | null>(null);

  // Collect unique filters
  const allLanguages = Array.from(new Set(projectsData.flatMap(p => p.languages)));
  const allInfoTypes = Array.from(new Set(projectsData.flatMap(p => p.information)));
  const allToolTypes = Array.from(new Set(projectsData.flatMap(p => p.tools)));

  const featuredApp = $derived(projectsData.find(p => p.name === "Dodo Air") || projectsData[0]);
  const isFeaturedInstalled = $derived(nookState.isAppInstalled(featuredApp.name));

  let filteredProjects = $derived(projectsData.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLang = selectedLanguage === "all" || p.languages.includes(selectedLanguage);
    const matchesInfo = selectedInfo === "all" || p.information.includes(selectedInfo);
    const matchesTool = selectedTool === "all" || p.tools.includes(selectedTool);

    return matchesSearch && matchesLang && matchesInfo && matchesTool;
  }));

  const categoryConfig: Record<string, { label: string, icon: string, bg: string, sub: string }> = {
    rescue: { label: "Rescue", icon: "rescue", bg: "bg-smartphone.png", sub: "Rescue services & utilities" },
    music: { label: "Music", icon: "best_friend", bg: "bg-plant.png", sub: "KK Slider & song logs" },
    turnips: { label: "Turnips", icon: "shopping", bg: "bg-money.png", sub: "Price prediction calculators" },
    checklist: { label: "Checklists", icon: "diy", bg: "bg-diy.png", sub: "Progress & completion logs" },
    dreams: { label: "Dreams", icon: "passport", bg: "bg-communication.png", sub: "Dream address sharing" },
    "design sharing": { label: "Pattern Share", icon: "designs", bg: "bg-mydesign.png", sub: "Custom pattern databases" },
    wiki: { label: "Wiki", icon: "files", bg: "bg-landmaking.png", sub: "Companion guide databases" },
    marketplace: { label: "Marketplace", icon: "shopping", bg: "bg-money.png", sub: "Item trading & bazaars" },
    api: { label: "API", icon: "directory", bg: "bg-smartphone.png", sub: "Developer integrations" },
    simulator: { label: "Simulators", icon: "designer", bg: "bg-landmaking.png", sub: "Island & garden planners" },
    "fake art": { label: "Art Guide", icon: "camera_alt", bg: "bg-event.png", sub: "Fake painting detector" },
    weather: { label: "Weather", icon: "weather", bg: "bg-negative.png", sub: "MeteoNook predictions" },
    queueing: { label: "Queueing", icon: "chat", bg: "bg-communication.png", sub: "Island queue tools" },
    "town tunes": { label: "Town Tunes", icon: "best_friend", bg: "bg-plant.png", sub: "Melody makers" },
    "island rating": { label: "Island Rating", icon: "miles", bg: "bg-hha.png", sub: "HHA & rating calculators" }
  };

  function selectCategory(type: 'info' | 'tool' | 'all', value: string, categoryLabel: string) {
    if (type === 'info') {
      selectedInfo = value;
      selectedTool = 'all';
    } else if (type === 'tool') {
      selectedTool = value;
      selectedInfo = 'all';
    } else {
      selectedInfo = 'all';
      selectedTool = 'all';
    }
    activeCategory = categoryLabel;
  }

  function resetCategory() {
    selectedInfo = 'all';
    selectedTool = 'all';
    activeCategory = null;
  }

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

  async function handleRate(projectName: string, rating: number) {
    if (!proUser) return;
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await rateApp(slug, rating);
    // Refresh stats
    const apps = await fetchApps();
    const map: Record<string, any> = {};
    apps.forEach((a: any) => { map[a.slug] = a; });
    cloudApps = map;
  }

  function handleUninstall(projectName: string) {
    nookState.uninstallApp(projectName);
  }
</script>

<div id="directory-app" class="flex flex-col h-full ac-app-screen ac-bg-dots">
  <!-- Wavy Header -->
  <div class="bg-[#f0b157] text-[#5c3a21] p-5 pt-7 ac-wavy-header flex flex-col gap-3 relative z-10 shadow-sm border-b-4 border-[#d99c45]">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-black flex items-center gap-2 tracking-tight">
        <Store class="w-7 h-7 text-white drop-shadow-sm" /> Nook Play
      </h1>
      <div class="bg-[#5c3a21] text-[#f0b157] px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-1.5 shadow-inner">
        <Smartphone class="w-3.5 h-3.5" />
        {filteredProjects.length} Apps
      </div>
    </div>
    <p class="text-[11px] font-bold opacity-90 leading-tight">
      Welcome to Nook Play! Discover community creations for your NookPhone! Yes, yes!
    </p>
  </div>

  <!-- Search and Filters -->
  <div class="px-4 py-4 flex flex-col gap-3 relative z-0">
    <div class="relative drop-shadow-sm">
      <Search class="w-5 h-5 text-[#caa253] absolute left-3 top-3.5" />
      <input
        id="directory-search"
        type="text"
        placeholder="Search for apps..."
        bind:value={searchTerm}
        class="w-full bg-[#fcfcf9] pl-10 pr-4 py-3 rounded-2xl text-[13px] font-bold border-4 border-[#e1d9be] focus:outline-none focus:border-[#f0b157] text-[#5c3a21] placeholder:text-[#caa253]/60 transition-colors"
      />
    </div>

    <div class="grid grid-cols-3 gap-2 text-xs font-bold">
      <select bind:value={selectedLanguage} class="bg-[#fcfcf9] px-2 py-2 rounded-xl border-2 border-[#e1d9be] text-[#5c3a21] focus:outline-none focus:border-[#f0b157] shadow-sm appearance-none cursor-pointer">
        <option value="all">🌐 Langs</option>
        {#each allLanguages as l}<option value={l}>{l.toUpperCase()}</option>{/each}
      </select>
      <select bind:value={selectedInfo} class="bg-[#fcfcf9] px-2 py-2 rounded-xl border-2 border-[#e1d9be] text-[#5c3a21] focus:outline-none focus:border-[#f0b157] shadow-sm appearance-none cursor-pointer text-center">
        <option value="all">📖 DB</option>
        {#each allInfoTypes as i}<option value={i}>{i}</option>{/each}
      </select>
      <select bind:value={selectedTool} class="bg-[#fcfcf9] px-2 py-2 rounded-xl border-2 border-[#e1d9be] text-[#5c3a21] focus:outline-none focus:border-[#f0b157] shadow-sm appearance-none cursor-pointer text-right">
        <option value="all">🛠️ Tools</option>
        {#each allToolTypes as t}<option value={t}>{t}</option>{/each}
      </select>
    </div>
  </div>

  <!-- Main Content Area -->
  <div class="flex-1 overflow-y-auto pb-32 ac-scrollbar">
    {#if activeCategory === null && searchTerm === "" && selectedLanguage === "all" && selectedInfo === "all" && selectedTool === "all"}
      <!-- Category Splash Screen Dashboard -->
      <div class="px-4 flex flex-col gap-5 animate-fade-in text-left">
        <!-- Featured App Card -->
        <div>
          <h3 class="text-xs font-black text-[#8a7f66] uppercase tracking-wider mb-2">Featured App</h3>
          <div class="bg-gradient-to-br from-[#fffdf5] to-[#fff6df] rounded-3xl p-5 border-4 border-[#edd8aa] shadow-md relative overflow-hidden flex gap-4 items-center">
            <div class="w-16 h-16 shrink-0 bg-white rounded-2xl shadow border-2 border-orange-200 flex items-center justify-center relative overflow-hidden">
              <NookIcon name={featuredApp.appIcon || 'directory'} class="w-full h-full object-contain p-2 z-10" />
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-[8px] font-black text-[#d99c45] bg-[#f0b157]/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Editor's Choice</span>
              <h4 class="font-black text-sm text-[#5c3a21] mt-1.5 mb-0.5 leading-none">{featuredApp.name}</h4>
              <p class="text-[10px] text-gray-500 font-bold m-0 line-clamp-2 leading-tight mt-1">{featuredApp.description}</p>
            </div>
            <button 
              onclick={() => {
                if (isFeaturedInstalled) {
                  nookState.navigate(featuredApp.id || featuredApp.name);
                } else {
                  handleInstall(featuredApp.name);
                }
              }}
              class={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-b-4 cursor-pointer active:border-b-0 active:translate-y-0.5 ${isFeaturedInstalled ? 'bg-[#8cc3b0] border-[#649e8a] text-white' : 'bg-[#6cd476] border-[#4ca454] text-white'}`}
            >
              {isFeaturedInstalled ? 'Open' : 'Get'}
            </button>
          </div>
        </div>

        <!-- Browse Categories Section -->
        <div>
          <h3 class="text-xs font-black text-[#8a7f66] uppercase tracking-wider mb-2">Browse Categories</h3>
          <div class="grid grid-cols-2 gap-3.5 pb-8">
            {#each allToolTypes as tool}
              {@const cfg = categoryConfig[tool] || { label: tool, icon: "directory", bg: "bg-smartphone.png", sub: "Community utilities" }}
              <button 
                onclick={() => selectCategory('tool', tool, cfg.label)}
                class="relative border-4 border-[#edd8aa] hover:border-[#f0b157] rounded-3xl p-3 flex gap-3 items-center transition text-left cursor-pointer active:scale-95 shadow-sm overflow-hidden h-[85px] w-full group"
              >
                <img src={getBgUrl(cfg.bg)} alt={cfg.label} class="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-85 group-hover:scale-105 transition-transform" />
                <div class="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-transparent z-10 pointer-events-none"></div>
                <!-- Left Column: Icon -->
                <div class="w-12 h-12 rounded-2xl bg-white/35 border-2 border-white/30 p-1 flex items-center justify-center shrink-0 shadow-md overflow-hidden z-20">
                  <NookIcon name={cfg.icon} class="w-full h-full object-contain" />
                </div>
                <!-- Right Column: Text Info -->
                <div class="relative z-20 flex flex-col min-w-0 justify-center">
                  <span class="font-black text-xs text-[#5c3a21] leading-tight uppercase tracking-wider truncate">{cfg.label}</span>
                  <span class="text-[9px] font-black text-[#8a7f66] leading-tight mt-0.5 line-clamp-2">{cfg.sub}</span>
                </div>
              </button>
            {/each}

            <!-- All Utilities -->
            <button 
              onclick={() => selectCategory('all', 'all', 'All Apps')}
              class="relative border-4 border-[#bde1f4] hover:border-[#5ea8d3] rounded-3xl p-3 flex gap-3 items-center transition text-left cursor-pointer active:scale-95 shadow-sm overflow-hidden h-[85px] w-full group"
            >
              <img src={getBgUrl('bg-smartphone.png')} alt="All Apps" class="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-85 group-hover:scale-105 transition-transform" />
              <div class="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent z-10 pointer-events-none"></div>
              <!-- Left Column: Icon -->
              <div class="w-12 h-12 rounded-2xl bg-white/35 border-2 border-white/30 p-1 flex items-center justify-center shrink-0 shadow-md overflow-hidden z-20">
                <NookIcon name="directory" class="w-full h-full object-contain" />
              </div>
              <!-- Right Column: Text Info -->
              <div class="relative z-20 flex flex-col min-w-0 justify-center">
                <span class="font-black text-xs text-[#5c3a21] leading-tight uppercase tracking-wider truncate">All Apps</span>
                <span class="text-[9px] font-black text-[#8a7f66] leading-tight mt-0.5 line-clamp-2">Complete Utilities Catalog</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    {:else}
      <!-- Drilled List View -->
      <div class="px-4 flex flex-col gap-4">
        {#if activeCategory !== null}
          <div class="flex justify-between items-center text-xs font-bold text-[#8a7f66] bg-[#fcfcf9]/70 backdrop-blur border border-[#e1d9be] rounded-2xl p-2 px-3.5 shadow-inner">
            <button 
              onclick={resetCategory}
              class="flex items-center gap-1 bg-transparent border-0 p-0 text-[#caa253] hover:text-[#5c3a21] font-black cursor-pointer"
            >
              <ArrowLeft class="w-4 h-4 stroke-[3px]" /> Back
            </button>
            <span class="capitalize font-black text-[#5c3a21] bg-[#f0b157]/20 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
              {activeCategory === "all" ? "All Apps" : activeCategory}
            </span>
          </div>
        {/if}

        <div class="flex flex-col gap-4">
          {#each filteredProjects as p (p.name)}
            {@const isInstalled = nookState.isAppInstalled(p.name)}
            {@const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
            <div class="relative group">
              <!-- Main Card -->
              <div class="bg-white rounded-3xl p-4 border-4 border-[#e1d9be] shadow-[0_4px_0_#dcd3be] transition-transform group-hover:-translate-y-1 h-full z-10 relative">
                <div class="flex items-start gap-3.5 text-left">
                  <!-- Left Col: App Icon -->
                  <div class="w-16 h-16 shrink-0 bg-[#f0b157]/10 rounded-2xl border-2 border-[#f0b157]/30 flex items-center justify-center shadow-inner overflow-hidden relative">
                    <NookIcon name={p.appIcon || 'directory'} class="w-full h-full object-contain drop-shadow-sm p-2 z-10 relative" />
                  </div>
                  
                  <!-- Right Col: Content -->
                  <div class="flex-1 min-w-0 pt-0.5">
                    <!-- Float Right Button -->
                    <div class="float-right ml-3 mb-1">
                      {#if isInstalled}
                        <button
                          onclick={() => handleUninstall(p.name)}
                          class="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all bg-[#e1d9be] text-[#8a7f66] border-b-4 border-[#dcd3be] active:border-b-0 active:translate-y-1 cursor-pointer"
                        >
                          <CheckCircle class="w-4 h-4" /> Inst
                        </button>
                      {:else}
                        <button
                          onclick={() => handleInstall(p.name)}
                          class="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all bg-[#6cd476] text-white border-b-4 border-[#4ca454] hover:bg-[#5bc265] active:border-b-0 active:translate-y-1 cursor-pointer shadow-sm"
                        >
                          <Download class="w-4 h-4" /> Get
                        </button>
                      {/if}
                    </div>

                    <h2 class="font-black text-[13px] text-[#5c3a21] leading-tight mb-1">{p.name}</h2>
                    <p class="text-[10px] font-bold text-[#8a7f66] leading-snug line-clamp-2">
                      {p.description}
                    </p>
                    
                    {#if cloudApps[slug]}
                      <div class="mt-2 text-[10px] font-bold text-[#5c3a21] flex items-center gap-2">
                        <span class="bg-[#f0b157]/20 px-1.5 py-0.5 rounded text-[#d99c45]">⬇ {cloudApps[slug].installs}</span>
                        <span class="bg-[#f0b157]/20 px-1.5 py-0.5 rounded text-[#d99c45]">★ {cloudApps[slug].average_rating} ({cloudApps[slug].rating_count})</span>
                      </div>
                      {#if isInstalled && proUser}
                        <div class="mt-1 flex gap-1">
                          {#each [1, 2, 3, 4, 5] as star}
                            <button onclick={() => handleRate(p.name, star)} class="text-xs hover:scale-125 transition-transform" class:text-[#f0b157]={star <= cloudApps[slug].average_rating} class:text-[#e1d9be]={star > cloudApps[slug].average_rating}>★</button>
                          {/each}
                        </div>
                      {/if}
                    {:else}
                      <div class="mt-2 text-[10px] font-bold text-[#8a7f66] italic">No cloud stats yet</div>
                    {/if}
                  </div>
                </div>
              </div>

              <!-- Hover Tooltip (for tags and links) -->
              <div class="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[260px] bg-[#fdfcf0] border-4 border-[#dcd3be] rounded-2xl p-3 shadow-xl z-40 text-left opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 flex flex-col gap-2">
                <div class="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#fdfcf0] border-t-4 border-l-4 border-[#dcd3be] rotate-45"></div>
                
                <div class="flex flex-wrap gap-1.5">
                  {#each p.languages as l}
                    <span class="text-[9px] font-black bg-[#f0b157] text-[#5c3a21] px-2 py-0.5 rounded-md border-b-2 border-[#d99c45] uppercase">{l}</span>
                  {/each}
                  {#each p.information as info}
                    <span class="text-[9px] font-black bg-[#8cc3b0] text-[#1a4335] px-2 py-0.5 rounded-md border-b-2 border-[#649e8a]">{info}</span>
                  {/each}
                  {#each p.tools as tool}
                    <span class="text-[9px] font-black bg-[#e483b3] text-[#5e2b43] px-2 py-0.5 rounded-md border-b-2 border-[#c55d91]">{tool}</span>
                  {/each}
                </div>

                <div class="flex items-center gap-2 pt-1.5 mt-1 border-t-2 border-dashed border-[#e1d9be]">
                  {#if p.site}
                    <a href={p.site} target="_blank" rel="noreferrer" class="w-8 h-8 bg-[#fdf5e2] text-[#8a7f66] rounded-full flex items-center justify-center border-2 border-[#e1d9be] hover:bg-[#f0b157] hover:text-white hover:border-[#d99c45] transition-colors"><Globe class="w-4 h-4" /></a>
                  {/if}
                  {#if p.ios || p.android}
                    <div class="w-8 h-8 bg-[#fdf5e2] text-[#8a7f66] rounded-full flex items-center justify-center border-2 border-[#e1d9be] hover:bg-[#8cc3b0] hover:text-white hover:border-[#649e8a] transition-colors cursor-help"><Smartphone class="w-4 h-4" /></div>
                  {/if}
                  {#if p.git}
                    <a href={p.git} target="_blank" rel="noreferrer" class="w-8 h-8 bg-[#fdf5e2] text-[#8a7f66] rounded-full flex items-center justify-center border-2 border-[#e1d9be] hover:bg-slate-700 hover:text-white hover:border-slate-800 transition-colors"><Code class="w-4 h-4" /></a>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>

        {#if filteredProjects.length === 0}
          <div class="text-center py-16 text-[#caa253] flex flex-col items-center">
            <div class="w-16 h-16 bg-[#f0b157]/20 rounded-full flex items-center justify-center mb-3">
              <Store class="w-8 h-8 text-[#f0b157]" />
            </div>
            <span class="font-black text-sm">No apps found...</span>
            <span class="text-xs font-bold mt-1 opacity-80">Try different search terms!</span>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
