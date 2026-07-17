<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { Code, X } from '@lucide/svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookAppHeader from '../organisms/NookAppHeader.svelte';

  const ctx = getPhoneContext();

  const siteUrl = '/island-designer/#/';
  const gitUrl = 'https://github.com/eugeneration/HappyIslandDesigner';
  const description = 'Draw terrain and paths, place buildings, and trace your in-game map';
</script>

<div id="designer-app" class="flex flex-col h-full ac-app-screen relative bg-white">
  <NookAppHeader 
    title="Island Designer"
    subtitle="Nook Inc. Construction"
    description={description}
    bgClass="bg-[#cca054]"
    textClass="text-white"
  >
    {#snippet iconSnippet()}
      <NookIcon name="designer" class="w-full h-full object-contain drop-shadow-sm p-1.5 z-10 relative" />
    {/snippet}
    {#snippet actions()}
      {#if gitUrl}
        <a 
          href={gitUrl} 
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
        class="nook-header-btn !bg-[#cca054] !text-[#543b09] !border-2 !border-[#855913] hover:!bg-[#d8ac61]"
        title="Close App"
      >
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </button>
    {/snippet}
  </NookAppHeader>

  <div class="flex-1 w-full relative">
    <iframe 
      src={siteUrl} 
      title="Island Designer"
      class="w-full h-full border-0 absolute inset-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  </div>
</div>
