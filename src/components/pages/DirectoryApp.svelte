<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { projectsData } from '@/lib/nookData';
  import { Search, Globe, Download, CheckCircle, Store, Smartphone, Code } from '@lucide/svelte';
  import NookIcon from '../atoms/NookIcon.svelte';

  let searchTerm = $state("");
  let selectedLanguage = $state("all");
  let selectedInfo = $state("all");
  let selectedTool = $state("all");

  // Collect unique filters
  const allLanguages = Array.from(new Set(projectsData.flatMap(p => p.languages)));
  const allInfoTypes = Array.from(new Set(projectsData.flatMap(p => p.information)));
  const allToolTypes = Array.from(new Set(projectsData.flatMap(p => p.tools)));

  let filteredProjects = $derived(projectsData.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLang = selectedLanguage === "all" || p.languages.includes(selectedLanguage);
    const matchesInfo = selectedInfo === "all" || p.information.includes(selectedInfo);
    const matchesTool = selectedTool === "all" || p.tools.includes(selectedTool);

    return matchesSearch && matchesLang && matchesInfo && matchesTool;
  }));

  function handleInstall(projectName: string) {
    nookState.installApp(projectName);
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
        <Store class="w-7 h-7 text-white drop-shadow-sm" /> App Store
      </h1>
      <div class="bg-[#5c3a21] text-[#f0b157] px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-1.5 shadow-inner">
        <Smartphone class="w-3.5 h-3.5" />
        {filteredProjects.length} Apps
      </div>
    </div>
    <p class="text-[11px] font-bold opacity-90 leading-tight">
      Welcome to the Nook App Store! Discover community creations for your NookPhone! Yes, yes!
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

  <!-- Main List -->
  <div class="flex-1 overflow-y-auto px-4 pb-32 ac-scrollbar">
    <div class="flex flex-col gap-4">
      {#each filteredProjects as p (p.name)}
        {@const isInstalled = nookState.isAppInstalled(p.name)}
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
              </div>
            </div>
          </div>

          <!-- Hover Tooltip (for tags and links) -->
          <div class="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[260px] bg-[#fdfcf0] border-4 border-[#dcd3be] rounded-2xl p-3 shadow-xl z-50 text-left opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 flex flex-col gap-2">
            <!-- Bubble arrow -->
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
</div>
