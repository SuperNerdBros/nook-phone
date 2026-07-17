<script lang="ts">
  import { X, Link } from '@lucide/svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import NookIcon from '@/components/atoms/NookIcon.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';

  const ctx = getPhoneContext();
  const appData = ctx.allApps.find(a => a.id === 'miles');
</script>

<div id="miles-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <NookAppHeader 
    title={appData?.name || "Nook Miles"}
    subtitle="Track your Nook Miles achievements and milestones"
    bgClass={appData?.bg || "bg-[#79a9dc]"}
    textClass="text-white"
  >
    {#snippet iconSnippet()}
      <div class="w-12 h-12 mr-1">
        <NookIcon name="miles" class="w-full h-full object-contain drop-shadow-sm p-1 z-10 relative" />
      </div>
    {/snippet}
    {#snippet actions()}
      <NookToolbarButton 
        href="https://acmiles.com/" 
        variant="ghost"
        title="Open Website"
      >
        <Link class="w-3.5 h-3.5 stroke-[2.5px] text-[#2d6f78]" />
      </NookToolbarButton>
      <NookToolbarButton
        onclick={ctx.handleHomeButton}
        title="Close App"
      >
        <X class="w-3.5 h-3.5 stroke-[3px] text-[#2d6f78]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>

  <!-- Outer splits -->
  <div class="flex-1 flex overflow-hidden bg-white">
    <iframe 
      src="https://acmiles.com/" 
      class="w-full h-full border-0"
      title="AC Miles Achievement Tracker"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  </div>
</div>
