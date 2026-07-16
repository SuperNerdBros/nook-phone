<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { projectsData } from '@/lib/nookData';
  import { Search, Pin, PinOff, ExternalLink, Globe } from '@lucide/svelte';

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

  function handleTogglePin(projectName: string) {
    nookState.toggleProjectPin(projectName);
  }
</script>

<div id="directory-app" class="flex flex-col h-full ac-app-screen">
  <!-- Header -->
  <div class="bg-[#b3e0a6] text-[#2c4c1e] p-4 pt-6 ac-wavy-header flex flex-col gap-2">
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-bold flex items-center gap-2">
        <Globe class="w-5 h-5 animate-pulse" /> NookLink Portal
      </h1>
      <span class="text-xs bg-[#e4f5df] px-2 py-1 rounded-full font-semibold">
        {filteredProjects.length} Online Tools
      </span>
    </div>
    <p class="text-xs opacity-90">
      Search and pin community creations as standalone apps on your NookOS Home!
    </p>
  </div>

  <!-- Search and Filters -->
  <div class="p-3 flex flex-col gap-2 bg-[#f4f1e3] border-b border-[#e1d9be]">
    <div class="relative">
      <Search class="w-4 h-4 text-gray-400 absolute left-3 top-3" />
      <input
        id="directory-search"
        type="text"
        placeholder="Search communities..."
        bind:value={searchTerm}
        class="w-full bg-white pl-9 pr-4 py-2 rounded-xl text-sm border border-[#dcd3be] focus:outline-none focus:ring-2 focus:ring-[#8bc34a] text-[#4c4637]"
      />
    </div>

    <div class="grid grid-cols-3 gap-1 text-xs">
      <!-- Lang Filter -->
      <select
        id="filter-lang"
        bind:value={selectedLanguage}
        class="bg-white p-1.5 rounded-lg border border-[#dcd3be] text-[#4c4637] focus:outline-none"
      >
        <option value="all">🌐 Languages</option>
        {#each allLanguages as l}
          <option value={l}>{l.toUpperCase()}</option>
        {/each}
      </select>

      <!-- Info Filter -->
      <select
        id="filter-info"
        bind:value={selectedInfo}
        class="bg-white p-1.5 rounded-lg border border-[#dcd3be] text-[#4c4637] focus:outline-none"
      >
        <option value="all">📖 Database</option>
        {#each allInfoTypes as i}
          <option value={i}>{i}</option>
        {/each}
      </select>

      <!-- Tools Filter -->
      <select
        id="filter-tools"
        bind:value={selectedTool}
        class="bg-white p-1.5 rounded-lg border border-[#dcd3be] text-[#4c4637] focus:outline-none"
      >
        <option value="all">🛠️ Utilities</option>
        {#each allToolTypes as t}
          <option value={t}>{t}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Main List -->
  <div class="flex-1 overflow-y-auto p-3 ac-scrollbar flex flex-col gap-3">
    {#each filteredProjects as p (p.name)}
      {@const isPinned = nookState.pinnedProjects.includes(p.name)}
      <div
        class="bg-white rounded-2xl p-3 border border-[#e8e4cf] shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 relative"
      >
        <div class="flex justify-between items-start gap-2">
          <div>
            <h2 class="font-bold text-sm text-[#4c4637] flex items-center gap-1.5">
              {p.name}
              {#each p.languages as l}
                <span class="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">
                  {l.toUpperCase()}
                </span>
              {/each}
            </h2>
            <p class="text-xs text-gray-500 mt-1 leading-relaxed">
              {p.description}
            </p>
          </div>

          <!-- Pin Button -->
          <button
            onclick={() => handleTogglePin(p.name)}
            class="p-2 rounded-full transition-colors {isPinned
              ? 'bg-[#e2f3dd] text-[#22c55e] hover:bg-red-50 hover:text-red-500'
              : 'bg-[#f4f1e3] text-gray-400 hover:bg-[#e2f3dd] hover:text-[#22c55e]'}"
            title={isPinned ? "Unpin app from Home" : "Pin app to Home"}
          >
            {#if isPinned}
              <PinOff class="w-4 h-4" />
            {:else}
              <Pin class="w-4 h-4" />
            {/if}
          </button>
        </div>

        <!-- Badges -->
        <div class="flex flex-wrap gap-1 mt-1">
          {#each p.information as info}
            <span class="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium">
              📖 {info}
            </span>
          {/each}
          {#each p.tools as tool}
            <span class="text-[10px] bg-[#fdf5e2] text-amber-700 px-2 py-0.5 rounded-md font-medium">
              🛠️ {tool}
            </span>
          {/each}
        </div>

        <!-- Action Buttons / Links -->
        <div class="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-[#f4f1e3] text-xs">
          {#if p.site}
            <a
              href={p.site}
              target="_blank"
              rel="noreferrer"
              class="flex items-center gap-1 text-[#8bc34a] font-semibold hover:underline bg-[#f7faf5] px-2.5 py-1 rounded-full"
            >
              <Globe class="w-3.5 h-3.5" /> Site <ExternalLink class="w-2.5 h-2.5" />
            </a>
          {/if}
          {#if p.ios}
            <a
              href={p.ios}
              target="_blank"
              rel="noreferrer"
              class="flex items-center gap-1 text-gray-600 font-semibold hover:underline bg-gray-50 px-2.5 py-1 rounded-full"
            >
              🍎 iOS <ExternalLink class="w-2.5 h-2.5" />
            </a>
          {/if}
          {#if p.android}
            <a
              href={p.android}
              target="_blank"
              rel="noreferrer"
              class="flex items-center gap-1 text-green-600 font-semibold hover:underline bg-green-50 px-2.5 py-1 rounded-full"
            >
              🤖 Android <ExternalLink class="w-2.5 h-2.5" />
            </a>
          {/if}
          {#if p.git}
            <a
              href={p.git}
              target="_blank"
              rel="noreferrer"
              class="flex items-center gap-1 text-slate-700 hover:underline"
            >
              <Globe class="w-3.5 h-3.5" /> GitHub
            </a>
          {/if}
          {#if p.discord}
            <span class="text-gray-400 text-[10px] ml-auto">
              💬 Discord ID: <code class="bg-gray-100 px-1 rounded">{p.discord}</code>
            </span>
          {/if}
        </div>
      </div>
    {/each}

    {#if filteredProjects.length === 0}
      <div class="text-center py-12 text-gray-400 text-sm">
        <Globe class="w-12 h-12 mx-auto opacity-30 mb-2" />
        No community tools found matching these filters.
      </div>
    {/if}
  </div>
</div>
