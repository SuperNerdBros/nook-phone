<script lang="ts">
  import { Globe, Code, ChevronRight, X, GripHorizontal } from "@lucide/svelte";
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext, CORE_APPS } from '../organisms/phoneContext.svelte';
  import { projectsData } from '@/lib/nookData';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookAppHeader from '../organisms/NookAppHeader.svelte';
  import NookToolbarButton from './NookToolbarButton.svelte';
  import greenWavesBg from '@/assets/wallpapers/Green Waves 3 Dark.png?url';
  import { resolveAssetUrl } from '@/lib/wallpaperData';

  const ctx = getPhoneContext();

  function getHostname(urlStr: string) {
    try {
      return new URL(urlStr).hostname;
    } catch {
      return urlStr;
    }
  }
</script>

{#if nookState.currentApp && !CORE_APPS.some(a => a.id === nookState.currentApp)}
  {@const currentProject = projectsData.find(p => p.name === nookState.currentApp)}
  <div class="flex flex-col h-full ac-app-screen bg-[#faf9f4]">
    <NookAppHeader 
      title={nookState.currentApp}
      subtitle={currentProject?.site ? getHostname(currentProject.site) : ""}
      description={currentProject?.description}
      bgClass="bg-transparent"
      bgStyle={`background-image: linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%), url('${resolveAssetUrl(greenWavesBg)}'); background-size: cover; background-position: bottom left;`}
      textClass="text-white"
    >
      {#snippet iconSnippet()}
        <NookIcon name={currentProject?.appIcon || 'directory'} class="w-full h-full object-contain drop-shadow-sm p-1.5 z-10 relative" />
      {/snippet}
      {#snippet actions()}
        {#if currentProject?.git}
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
          class="!bg-[#5c8e43] !text-[#ffffff] !border-2 !border-[#2f5525] hover:!bg-[#6a9e50]"
          title="Close App"
        >
          <X class="w-3.5 h-3.5 stroke-[3px]" />
        </NookToolbarButton>
      {/snippet}
    </NookAppHeader>
    
    <div class="flex-1 w-full relative bg-white">
      {#if currentProject?.site}
        <iframe 
          src={currentProject.site} 
          title={currentProject.name}
          class="w-full h-full border-0 absolute inset-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        ></iframe>
      {:else}
        <div class="flex-1 p-4 flex flex-col justify-center items-center text-center gap-3 h-full">
          <div class="w-16 h-16 bg-[#e8f5e9] border-2 border-[#a5d6a7] rounded-full flex items-center justify-center shadow-inner overflow-hidden relative">
            <NookIcon name={currentProject?.appIcon || 'directory'} class="w-full h-full object-contain drop-shadow-sm p-2 z-10 relative" />
          </div>
          <div>
            <h2 class="font-extrabold text-sm text-[#4c4637]">{nookState.currentApp}</h2>
            <p class="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
              This app doesn't have a web version. It's likely a mobile-only app or discord server.
            </p>
          </div>
          {#if currentProject?.ios}
            <a href={currentProject.ios} target="_blank" rel="noreferrer" class="bg-[#5c8e43] hover:bg-[#4a7536] text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md mt-2 flex items-center gap-1.5 no-underline transition">
              App Store <ChevronRight class="w-4 h-4" />
            </a>
          {/if}
          {#if currentProject?.android}
            <a href={currentProject.android} target="_blank" rel="noreferrer" class="bg-[#5c8e43] hover:bg-[#4a7536] text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md mt-1 flex items-center gap-1.5 no-underline transition">
              Google Play <ChevronRight class="w-4 h-4" />
            </a>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
