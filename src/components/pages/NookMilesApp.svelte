<script lang="ts">
  import { X } from '@lucide/svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import NookIcon from '@/components/atoms/NookIcon.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';

  const ctx = getPhoneContext();
  const appData = ctx.allApps.find(a => a.id === 'miles');
</script>

<div id="miles-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <NookAppHeader 
    title={appData?.name || "Nook Miles"}
    subtitle="Powered by acmiles.com"
    bgClass={appData?.bg || "bg-[#79a9dc]"}
    textClass="text-white"
  >
    {#snippet iconSnippet()}
      <NookIcon name="miles" class="w-full h-full object-contain drop-shadow-sm p-1.5 z-10 relative" />
    {/snippet}
    {#snippet actions()}
      <button
        onclick={ctx.handleHomeButton}
        class="nook-header-btn"
        title="Close App"
      >
        <X class="w-3.5 h-3.5 stroke-[3px] text-[#2d6f78]" />
      </button>
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
