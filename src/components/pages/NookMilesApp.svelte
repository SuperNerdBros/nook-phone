<script lang="ts">
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  // Old native NookMilesApp retired and replaced with acmiles.com iframe
</script>

<div id="miles-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <NookAppHeader 
    title="Nook Miles+"
    subtitle="Powered by acmiles.com"
    bgClass="bg-[#fcf8e3]"
    textClass="text-emerald-700"
  >
    {#snippet iconSnippet()}
      <span class="mr-1 flex items-center justify-center w-6 h-6 text-2xl leading-none">🎈</span>
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
