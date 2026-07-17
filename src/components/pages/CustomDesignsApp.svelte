<script lang="ts">
  import { Globe, Code, ChevronRight, X } from "@lucide/svelte";
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import { projectsData } from '@/lib/nookData';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookAppHeader from '../organisms/NookAppHeader.svelte';

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
    subtitle={currentProject.site ? getHostname(currentProject.site) : ""}
    description={currentProject.description}
    bgClass="bg-[#f08bb2]"
    textClass="text-white"
  >
    {#snippet iconSnippet()}
      <NookIcon name="designs" class="w-full h-full object-contain drop-shadow-sm p-1.5 z-10 relative" />
    {/snippet}
    {#snippet actions()}
      {#if currentProject.git}
        <a 
          href={currentProject.git} 
          target="_blank" 
          rel="noreferrer" 
          class="nook-header-btn nook-header-btn-ghost"
          title="Source Code"
        >
          <Code class="w-3.5 h-3.5 stroke-[2.5px]" />
        </a>
      {/if}
      <button
        onclick={ctx.handleHomeButton}
        class="nook-header-btn !bg-[#f08bb2] !text-[#541330] !border-2 !border-[#b34a71] hover:!bg-[#f7a4c2]"
        title="Close App"
      >
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </button>
    {/snippet}
  </NookAppHeader>

  <!-- Outer splits -->
  <div class="flex-1 flex overflow-hidden bg-white">
    <iframe 
      src="https://acpatterns.com/editor" 
      class="w-full h-full border-0"
      title="Animal Crossing Pattern Tool"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  </div>
</div>
