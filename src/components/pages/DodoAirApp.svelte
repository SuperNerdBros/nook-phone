<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { Code, Link, X } from '@lucide/svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookAppHeader from '../organisms/NookAppHeader.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';

  const ctx = getPhoneContext();

  const siteUrl = '/dodo-air/';
  const description = 'Dodo Airlines Flight Hub. Schedule, track, and manage flights for your island! Dodo Air is always ready for take-off!';
</script>

<div id="dodo-air-app" class="flex flex-col h-full ac-app-screen relative bg-white">
  <NookAppHeader 
    title="Dodo Air"
    subtitle={description}
    bgClass="bg-[#1b9be0]"
    textClass="text-white"
  >
    {#snippet iconSnippet()}
      <div class="w-12 h-12 mr-1">
        <NookIcon name="dodo_air" class="w-full h-full object-contain drop-shadow-sm p-1 z-10 relative" />
      </div>
    {/snippet}
    {#snippet actions()}
      {#if siteUrl}
        <NookToolbarButton 
          href={siteUrl} 
          variant="ghost"
          title="Open Website"
        >
          <Link class="w-3.5 h-3.5 stroke-[2.5px]" />
        </NookToolbarButton>
      {/if}
      <NookToolbarButton
        onclick={ctx.handleHomeButton}
        class="!bg-[#1b9be0] !text-white !border-2 !border-[#0d6b9e] hover:!bg-[#2ca6e9]"
        title="Close App"
      >
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>

  <div class="flex-1 w-full relative">
    <iframe 
      src={siteUrl} 
      title="Dodo Air"
      class="w-full h-full border-0 absolute inset-0 bg-white"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  </div>
</div>
