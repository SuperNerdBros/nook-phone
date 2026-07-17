<script lang="ts">
  import { Link, Code, ChevronRight, X } from "@lucide/svelte";
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import { projectsData } from '@/lib/nookData';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookAppHeader from '../organisms/NookAppHeader.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';

  const ctx = getPhoneContext();

  const currentProject = projectsData.find(p => p.name === 'Animal Crossing Pattern Tool') || {
    name: 'Animal Crossing Pattern Tool',
    appIcon: 'designs',
    site: 'https://acpatterns.com/',
    description: 'Pattern designer compatible with NL, HHD, and NH'
  };

  function getHostname(urlStr: string) {
    try {
      return new URL(urlStr).hostname;
    } catch {
      return urlStr;
    }
  }
</script>

<div id="designs-app" class="flex flex-col h-full ac-app-screen relative">
  <NookAppHeader 
    title={currentProject.name}
    subtitle={currentProject.description}
    bgClass="bg-[#f08bb2]"
    textClass="text-white"
  >
    {#snippet iconSnippet()}
      <div class="w-12 h-12 mr-1">
        <NookIcon name="designs" class="w-full h-full object-contain drop-shadow-sm p-1.5 z-10 relative" />
      </div>
    {/snippet}
    {#snippet actions()}
      {#if currentProject.site}
        <NookToolbarButton 
          href={currentProject.site} 
          variant="ghost"
          title="Open Website"
        >
          <Link class="w-3.5 h-3.5 stroke-[2.5px]" />
        </NookToolbarButton>
      {/if}
      {#if currentProject.git}
        <NookToolbarButton 
          href={currentProject.git} 
          variant="ghost"
          title="Source Code"
        >
          <Code class="w-3.5 h-3.5 stroke-[2.5px]" />
        </NookToolbarButton>
      {/if}
      <NookToolbarButton
        onclick={ctx.handleHomeButton}
        class="!bg-[#f08bb2] !text-[#541330] !border-2 !border-[#b34a71] hover:!bg-[#f7a4c2]"
        title="Close App"
      >
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>

  <!-- Outer splits -->
  <div class="flex-1 flex overflow-hidden bg-white">
    <iframe 
      src="https://acpatterns.com" 
      class="w-full h-full border-0"
      title="Animal Crossing Pattern Tool"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  </div>
</div>
