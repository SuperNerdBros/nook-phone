<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { Code, Link, X } from '@lucide/svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookAppHeader from '../organisms/NookAppHeader.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';

  const ctx = getPhoneContext();

  const siteUrl = '/island-designer/#/';
  const gitUrl = 'https://github.com/eugeneration/HappyIslandDesigner';
  const description = 'Draw terrain and paths, place buildings, and trace your in-game map';
</script>

<div id="designer-app" class="flex flex-col h-full ac-app-screen relative bg-white">
  <NookAppHeader 
    title="Island Designer"
    subtitle={description}
    bgClass="bg-[#70ab96]"
  >
    {#snippet iconSnippet()}
      <div class="w-12 h-12 mr-1">
        <NookIcon name="designer" class="w-full h-full object-contain drop-shadow-sm p-1 z-10 relative" />
      </div>
    {/snippet}
    {#snippet actions()}
      {#if siteUrl}
        <NookToolbarButton 
          href={siteUrl} 
          variant="ghost"
          title="Open Website"
        >
          <Link class="w-3.5 h-3.5 stroke-[2.5px] text-white" />
        </NookToolbarButton>
      {/if}
      {#if gitUrl}
        <NookToolbarButton 
          href={gitUrl} 
          variant="ghost"
          title="Source Code"
        >
          <Code class="w-3.5 h-3.5 stroke-[2.5px] text-white" />
        </NookToolbarButton>
      {/if}
      <NookToolbarButton
        onclick={ctx.handleHomeButton}
        title="Close App"
      >
        <X class="w-3.5 h-3.5 stroke-[3px] text-[#2d5c56]" />
      </NookToolbarButton>
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
