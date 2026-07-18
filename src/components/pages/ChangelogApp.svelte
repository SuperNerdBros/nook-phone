<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import { X, Wrench, Sparkles, Bug } from '@lucide/svelte';
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
        const headerText = trimmed.replace('## ', '').replace('[', '').replace(']', '').trim();
        const dateParts = headerText.split(' - ');
        const dateVal = dateParts[dateParts.length - 1];
        const versionVal = dateParts.length > 1 ? dateParts[0] : `v${dateVal.replace(/-/g, '.')}`;
        
        currentEntry = {
          version: versionVal,
          date: formatDate(dateVal),
          title: "System Update",
          changes: []
        };
        entries.push(currentEntry);
        continue;
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
      default: return Sparkles;
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

</script>

<div id="changelog-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <NookAppHeader 
    title="Changelog"
    subtitle="Update History"
    bgClass="bg-[#79a9dc]"
    textClass="text-white"
  >
    {#snippet iconSnippet()}
      <div class="w-12 h-12 mr-1">
        <img src={changelogIcon} alt="Changelog Icon" class="w-full h-full object-contain drop-shadow-sm" />
      </div>
    {/snippet}
    {#snippet actions()}
      <NookToolbarButton
        onclick={ctx.handleHomeButton}
        title="Close App"
      >
        <X class="w-3.5 h-3.5 stroke-[3px] text-red-500" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>

  <div class="flex-1 overflow-y-auto p-4 ac-scrollbar flex flex-col bg-[#ddeef9] gap-4">
    <div class="flex flex-col gap-2 mb-2">
      <div class="bg-white p-3 rounded-2xl shadow-sm border border-[#e3f0fa] flex gap-3 items-center">
        <div class="w-12 h-12 bg-[#79a9dc]/20 rounded-full flex items-center justify-center shrink-0">
          <img src={changelogIcon} class="w-8 h-8" alt="Log" />
        </div>
        <div>
          <h2 class="text-sm font-extrabold text-[#1a5b82]">NookOS Updates</h2>
          <p class="text-[10px] font-semibold text-gray-600 leading-tight">Stay up to date with the latest features, fixes, and improvements from Nook Inc.!</p>
        </div>
      </div>
    </div>

    {#each logs as log}
      <div class="flex flex-col relative pl-6 pb-2">
        <!-- Timeline Line -->
        <div class="absolute left-2.5 top-2 bottom-0 w-[3px] bg-[#79a9dc]/30 rounded-full"></div>
        
        <!-- Timeline Dot -->
        <div class="absolute left-1 top-1 w-[15px] h-[15px] bg-[#79a9dc] border-[3px] border-[#ddeef9] rounded-full z-10"></div>

        <div class="bg-white p-3 rounded-2xl shadow-sm border border-[#e3f0fa]">
          <div class="flex justify-between items-end border-b-2 border-dashed border-gray-100 pb-2 mb-2">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-gray-400">{log.date}</span>
              <h3 class="text-sm font-extrabold text-gray-800 tracking-tight">{log.title}</h3>
            </div>
            <span class="bg-[#79a9dc] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">{log.version}</span>
          </div>

          <div class="flex flex-col gap-2">
            {#each log.changes as change}
              {@const Icon = getIconForType(change.type)}
              <div class="flex gap-2 items-start">
                <div class="mt-0.5 p-1 rounded-full shrink-0 {getColorForType(change.type)}">
                  <Icon class="w-3 h-3 stroke-[2.5px]" />
                </div>
                <p class="text-xs font-semibold text-gray-600 leading-snug">
                  {change.text}
                </p>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
    
    <div class="flex justify-center py-4">
      <div class="w-2 h-2 rounded-full bg-gray-300 mx-1"></div>
      <div class="w-2 h-2 rounded-full bg-gray-300 mx-1"></div>
      <div class="w-2 h-2 rounded-full bg-gray-300 mx-1"></div>
    </div>
  </div>
</div>
