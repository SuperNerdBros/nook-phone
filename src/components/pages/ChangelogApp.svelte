<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookAppTemplate from '@/components/organisms/NookAppTemplate.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import { X, Wrench, Sparkles, Bug, Calendar, ChevronLeft } from '@lucide/svelte';
  import changelogIcon from '@/assets/img/changelog_icon.svg';

  import changelogMd from '../../../docs/CHANGELOG.md?raw';

  const ctx = getPhoneContext();

  interface Change {
    type: 'feature' | 'fix' | 'improvement';
    text: string;
  }

  interface LogEntry {
    version: string;
    date: string;
    title: string;
    changes: Change[];
  }

  const parseChangelog = (md: string): LogEntry[] => {
    const entries: LogEntry[] = [];
    const lines = md.split('\n');
    let currentEntry: LogEntry | null = null;
    let currentType: 'feature' | 'fix' | 'improvement' = 'feature';

    const formatDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr + 'T00:00:00');
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    };

    for (let line of lines) {
      line = line.trimEnd();
      const trimmed = line.trim();

      if (trimmed.startsWith('## ')) {
        const match = trimmed.match(/^##\s+\[(.*?)\]\s*(.*)$/);
        if (match) {
          const dateParts = match[1].split(' - ');
          const dateVal = dateParts[dateParts.length - 1];
          const versionVal = dateParts.length > 1 ? dateParts[0] : `v${dateVal.replace(/-/g, '.')}`;
          const title = match[2].trim() || "System Update";
          
          currentEntry = {
            version: versionVal,
            date: formatDate(dateVal),
            title: title,
            changes: []
          };
          entries.push(currentEntry);
          continue;
        }
      }

      if (!currentEntry) continue;

      if (trimmed.startsWith('### ')) {
        const typeText = trimmed.replace('### ', '').toLowerCase();
        if (typeText.includes('added')) {
          currentType = 'feature';
        } else if (typeText.includes('fixed')) {
          currentType = 'fix';
        } else if (typeText.includes('changed')) {
          currentType = 'improvement';
        }
        continue;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        let text = trimmed.replace(/^[-*]\s+/, '');
        text = text.replace(/\*\*([^*]+)\*\*:/g, '$1:');
        text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
        text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

        currentEntry.changes.push({
          type: currentType,
          text: text
        });
      } else if (line.startsWith('  ') && (trimmed.startsWith('- ') || trimmed.startsWith('* '))) {
        let text = trimmed.replace(/^[-*]\s+/, '');
        text = text.replace(/\*\*([^*]+)\*\*:/g, '$1:');
        text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
        text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        
        currentEntry.changes.push({
          type: currentType,
          text: `  • ${text}`
        });
      }
    }

    return entries;
  };

  const logs = parseChangelog(changelogMd);

  const getIconForType = (type: string) => {
    switch (type) {
      case "feature": return Sparkles;
      case "fix": return Bug;
      case "improvement": return Wrench;
      case "features": return Sparkles;
      case "fixes": return Bug;
      case "improvements": return Wrench;
      default: return Calendar;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case "feature": return "text-amber-500 bg-amber-100";
      case "fix": return "text-red-500 bg-red-100";
      case "improvement": return "text-emerald-600 bg-emerald-100";
      default: return "text-gray-500 bg-gray-100";
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "features": return "New Features";
      case "improvements": return "Improvements";
      case "fixes": return "Bug Fixes";
      default: return "All Updates";
    }
  };

  let currentView: "list" | "detail" = $state("list");
  let selectedLog: LogEntry | null = $state(null);
  let searchTerm = $state("");
  let selectedCategory = $state("all");

  let filteredLogs = $derived(logs.map(log => {
    const categoryMap: Record<string, string> = {
      'feature': 'features',
      'improvement': 'improvements',
      'fix': 'fixes'
    };
    
    const filteredChanges = log.changes.filter(change => {
      const matchesSearch = change.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || categoryMap[change.type] === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    
    const titleMatches = log.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.version.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (titleMatches && selectedCategory === "all") {
      return log; // return full log if search matches title and no category filter
    }

    return { ...log, changes: filteredChanges };
  }).filter(log => log.changes.length > 0)); // Only show versions that have changes after filtering

</script>

<NookAppTemplate
  title="Changelog"
  subtitle="Update History"
  headerBgClass="bg-[#79a9dc]"
  headerTextClass="text-white"
  bgClass="bg-[#ddeef9]"
  textClass="text-[#1a5b82]"
  showSearch={currentView === "list"}
  bind:searchTerm
  searchPlaceholder="Search updates..."
  searchThemeColorClass="text-[#79a9dc]"
  searchFocusBorderClass="focus:border-[#79a9dc]"
  searchBorderColorClass="border-[#b4d6f0]"
  searchBgClass="bg-white"
  searchTextColorClass="text-[#1a5b82]"
  categories={currentView === "list" ? ["all", "features", "improvements", "fixes"] : []}
  bind:activeCategory={selectedCategory}
  categoryLayoutStyle="wrap"
  getCategoryIcon={getIconForType}
  {getCategoryLabel}
  categoryActiveBgClass="bg-[#79a9dc]"
  categoryInactiveTextClass="text-[#79a9dc]/60 hover:text-[#79a9dc]"
  categoryBgClass="bg-white"
  categoryBorderClass="border-2 border-[#b4d6f0]"
  categoryLabelBgClass="bg-[#79a9dc]"
  categoryLabelTextClass="text-white"
  showBottomNav={false}
>
  {#snippet iconSnippet()}
    <div class="w-12 h-12 mr-1">
      <img src={changelogIcon} alt="Changelog Icon" class="w-full h-full object-contain drop-shadow-sm" />
    </div>
  {/snippet}

  {#snippet headerActions()}
    {#if currentView === "detail"}
      <NookToolbarButton
        onclick={() => (currentView = "list")}
        class="mr-1"
        title="Back"
      >
        <ChevronLeft class="w-3.5 h-3.5 stroke-[3px] text-[#79a9dc]" />
      </NookToolbarButton>
    {/if}
    <NookToolbarButton
      onclick={ctx.handleHomeButton}
      title="Close App"
    >
      <X class="w-3.5 h-3.5 stroke-[3px] text-[#79a9dc]" />
    </NookToolbarButton>
  {/snippet}

  <!-- Master / List View -->
  <div class={`absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ${currentView === "list" ? "translate-x-0" : "-translate-x-full"}`}>
    <div class="flex-1 overflow-y-auto px-4 pb-4 ac-scrollbar">
      
      {#if searchTerm === "" && selectedCategory === "all"}
      <div class="flex flex-col gap-2 mb-4 mt-2">
        <div class="bg-white/80 p-3 rounded-2xl shadow-sm border border-[#e3f0fa] flex gap-3 items-center">
          <div class="w-12 h-12 bg-[#79a9dc]/20 rounded-full flex items-center justify-center shrink-0">
            <img src={changelogIcon} class="w-8 h-8" alt="Log" />
          </div>
          <div>
            <h2 class="text-sm font-extrabold text-[#1a5b82]">NookOS Updates</h2>
            <p class="text-[10px] font-semibold text-gray-600 leading-tight">Stay up to date with the latest features, fixes, and improvements from Nook Inc.!</p>
          </div>
        </div>
      </div>
      {/if}

      <div class="flex flex-col gap-3">
        {#each filteredLogs as log, index}
          {@const featureCount = log.changes.filter(c => c.type === 'feature').length}
          {@const improvementCount = log.changes.filter(c => c.type === 'improvement').length}
          {@const fixCount = log.changes.filter(c => c.type === 'fix').length}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div onclick={() => { selectedLog = log; currentView = "detail"; }}
               class="bg-white p-4 rounded-2xl shadow-sm border border-[#e3f0fa] group cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
             <!-- Log header info -->
             <div class="flex justify-between items-center mb-2">
               <div class="flex flex-col">
                 <span class="text-[10px] font-bold text-gray-400">{log.date}</span>
                 <div class="flex gap-2 items-center">
                   <h3 class="text-[13px] font-extrabold text-[#1a5b82] tracking-tight">{log.title}</h3>
                   {#if index === 0 && selectedCategory === "all" && searchTerm === ""}
                      <span class="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-extrabold rounded-full uppercase tracking-wider animate-pulse">New!</span>
                   {/if}
                 </div>
               </div>
               <span class="bg-[#79a9dc]/10 text-[#79a9dc] border border-[#79a9dc]/20 text-[9px] font-bold px-2 py-0.5 rounded-full">{log.version}</span>
             </div>
             
             <!-- Quick stats for this log -->
             <div class="flex gap-3 mt-3 pt-3 border-t border-dashed border-gray-100">
               {#if featureCount > 0}
                 <div class="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg"><Sparkles class="w-3 h-3" /> {featureCount} Features</div>
               {/if}
               {#if improvementCount > 0}
                 <div class="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"><Wrench class="w-3 h-3" /> {improvementCount} Tweaks</div>
               {/if}
               {#if fixCount > 0}
                 <div class="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg"><Bug class="w-3 h-3" /> {fixCount} Fixes</div>
               {/if}
             </div>
          </div>
        {/each}
        
        {#if filteredLogs.length === 0}
          <div class="text-center py-10 opacity-60 font-bold text-sm">No updates match your search.</div>
        {/if}
      </div>
      
      <div class="flex justify-center py-6 pb-12">
        <div class="w-2 h-2 rounded-full bg-[#79a9dc]/30 mx-1"></div>
        <div class="w-2 h-2 rounded-full bg-[#79a9dc]/30 mx-1"></div>
        <div class="w-2 h-2 rounded-full bg-[#79a9dc]/30 mx-1"></div>
      </div>
    </div>
  </div>

  <!-- Detail View -->
  <div class={`absolute inset-0 w-full h-full flex flex-col bg-[#ddeef9] transition-transform duration-300 z-20 ${currentView === "detail" ? "translate-x-0" : "translate-x-full"}`}>
    {#if selectedLog}
      <div class="flex-1 overflow-y-auto px-4 pb-12 pt-4 ac-scrollbar">
        <!-- Hero Card -->
        <div class="bg-white p-5 rounded-3xl shadow-sm border border-[#e3f0fa] mb-6 relative overflow-hidden">
          <div class="absolute -right-6 -top-6 opacity-10">
            <img src={changelogIcon} class="w-32 h-32" alt="Background Log" />
          </div>
          
          <div class="relative z-10">
            <div class="inline-block bg-[#79a9dc] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm mb-2">{selectedLog.version}</div>
            <h2 class="text-lg font-extrabold text-[#1a5b82] leading-tight mb-1">{selectedLog.title}</h2>
            <div class="flex items-center text-[11px] font-bold text-gray-500">
              <Calendar class="w-3 h-3 mr-1" /> {selectedLog.date}
            </div>
          </div>
        </div>

        <!-- Changes List -->
        <div class="flex flex-col gap-4">
          {#each selectedLog.changes as change}
            {@const Icon = getIconForType(change.type)}
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-[#e3f0fa] flex gap-3 items-start animate-fade-in-up">
              <div class={`p-1.5 rounded-full shrink-0 ${getColorForType(change.type)}`}>
                <Icon class="w-4 h-4 stroke-[2.5px]" />
              </div>
              <div class="flex flex-col pt-0.5">
                <span class="text-[9px] font-black uppercase tracking-wider mb-1" class:text-amber-500={change.type==='feature'} class:text-emerald-600={change.type==='improvement'} class:text-red-500={change.type==='fix'}>
                  {change.type === 'feature' ? 'New Feature' : change.type === 'improvement' ? 'Improvement' : 'Bug Fix'}
                </span>
                <p class="text-xs font-bold text-gray-700 leading-relaxed">
                  {change.text}
                </p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</NookAppTemplate>
