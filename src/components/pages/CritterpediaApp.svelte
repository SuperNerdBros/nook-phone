<script lang="ts">
  import { X, Link } from '@lucide/svelte';
  import NookAppHeader from "../organisms/NookAppHeader.svelte";
  import NookIcon from "../atoms/NookIcon.svelte";
  import NookToolbarButton from "../molecules/NookToolbarButton.svelte";
  import { getPhoneContext } from "../organisms/phoneContext.svelte";

  const ctx = getPhoneContext();
  const phone = getPhoneContext();
  const appData = phone.allApps.find((a: any) => a.id === 'critter') || { name: 'Critterpedia', bg: 'bg-[#fed151]', id: 'critter' };
</script>

<div id="critterpedia-app" class="flex flex-col h-full ac-app-screen relative bg-[#f4f1e3]">
  <NookAppHeader 
    title={appData.name}
    subtitle="Keep track of all bugs, fish, and sea creatures!"
    bgClass={appData.bg + " border-b-4 border-black/10"}
    textClass="text-[#715c34]"
  >
    {#snippet iconSnippet()}
      <div class="w-12 h-12 mr-1">
        <NookIcon name={appData.id || "critter"} class="w-full h-full drop-shadow-sm text-[#715c34]" />
      </div>
    {/snippet}
  
    {#snippet actions()}
      <NookToolbarButton 
        href="https://acnhcritterpedia.com/" 
        variant="ghost"
        class="mr-1"
        title="Open Website"
      >
        <Link class="w-3.5 h-3.5 stroke-[2.5px] text-[#715c34]" />
      </NookToolbarButton>
      <NookToolbarButton
        onclick={ctx.handleHomeButton}
        title="Close App"
      >
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>
  
  <div class="flex-1 overflow-hidden relative">
    <iframe 
      src="https://acnhcritterpedia.com/" 
      title="ACNH Critterpedia" 
      class="w-full h-full border-none"
      sandbox="allow-scripts allow-same-origin allow-popups"
    ></iframe>
  </div>
</div>
