<script lang="ts">
  import { Globe, Code, ChevronRight } from "@lucide/svelte";
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext, CORE_APPS } from '../organisms/phoneContext.svelte';
  import { projectsData } from '@/lib/nookData';
  import NookIcon from '../atoms/NookIcon.svelte';

  const ctx = getPhoneContext();
</script>

{#if nookState.currentApp && !CORE_APPS.some(a => a.id === nookState.currentApp)}
  {@const currentProject = projectsData.find(p => p.name === nookState.currentApp)}
  <div class="flex flex-col h-full ac-app-screen bg-[#faf9f4]">
    <div class="bg-[#8cc3b0] text-[#1a4335] p-3 pt-5 ac-wavy-header flex justify-between items-center z-10 shadow-sm shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg shadow-inner overflow-hidden relative">
          <NookIcon name={currentProject?.appIcon || 'directory'} class="w-full h-full object-contain drop-shadow-sm p-1 z-10 relative" />
        </div>
        <div class="flex flex-col min-w-0 justify-center">
          <h1 class="text-sm font-bold m-0 shrink-0 leading-tight">{nookState.currentApp}</h1>
          {#if currentProject?.site || currentProject?.git}
            <div class="flex items-center gap-1.5 mt-1 select-none">
              {#if currentProject.site}
                <a 
                  href={currentProject.site} 
                  target="_blank" 
                  rel="noreferrer" 
                  class="text-[8px] bg-white/35 text-[#1a4335] hover:bg-white/60 px-2 py-0.5 rounded-full font-black transition flex items-center gap-0.5 no-underline shadow-sm active:scale-95"
                >
                  <Globe class="w-2.5 h-2.5" /> Live
                </a>
              {/if}
              {#if currentProject.git}
                <a 
                  href={currentProject.git} 
                  target="_blank" 
                  rel="noreferrer" 
                  class="text-[8px] bg-white/35 text-[#1a4335] hover:bg-white/60 px-2 py-0.5 rounded-full font-black transition flex items-center gap-0.5 no-underline shadow-sm active:scale-95"
                >
                  <Code class="w-2.5 h-2.5" /> Code
                </a>
              {/if}
            </div>
          {:else}
            <p class="text-[9px] opacity-85 m-0 font-bold leading-none mt-0.5">{currentProject?.description || ''}</p>
          {/if}
        </div>
      </div>
      <button
        onclick={ctx.handleHomeButton}
        class="text-[10px] bg-white text-[#1a4335] border-0 px-2.5 py-1.5 rounded-full font-black hover:bg-opacity-90 cursor-pointer flex items-center gap-1 uppercase tracking-wider"
      >
        Close
      </button>
    </div>
    
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
          <div class="w-16 h-16 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center text-3xl shadow-inner overflow-hidden relative">
            <NookIcon name={currentProject?.appIcon || 'directory'} class="w-full h-full object-contain drop-shadow-sm p-2 z-10 relative" />
          </div>
          <div>
            <h2 class="font-extrabold text-sm text-[#4c4637]">{nookState.currentApp}</h2>
            <p class="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
              This app doesn't have a web version. It's likely a mobile-only app or discord server.
            </p>
          </div>
          {#if currentProject?.ios}
            <a href={currentProject.ios} target="_blank" rel="noreferrer" class="bg-[#8ec3b0] hover:bg-opacity-90 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md mt-2 flex items-center gap-1.5 no-underline">
              App Store <ChevronRight class="w-4 h-4" />
            </a>
          {/if}
          {#if currentProject?.android}
            <a href={currentProject.android} target="_blank" rel="noreferrer" class="bg-[#8ec3b0] hover:bg-opacity-90 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md mt-1 flex items-center gap-1.5 no-underline">
              Google Play <ChevronRight class="w-4 h-4" />
            </a>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
