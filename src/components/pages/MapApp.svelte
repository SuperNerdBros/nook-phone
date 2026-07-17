<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { fetchNookipediaVillagers } from '@/lib/api';
  import { Upload, X, Settings } from "@lucide/svelte";
  import { onMount } from 'svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  const ctx = getPhoneContext();

  let fileInput: HTMLInputElement;
  let villagers = $state<any[]>([]);
  let isLoading = $state(true);

  onMount(async () => {
    villagers = await fetchNookipediaVillagers();
    isLoading = false;
  });

  // Map resident IDs to full villager objects
  const activeResidents = $derived(
    nookState.residents
      .map(id => villagers.find(v => v.id === id))
      .filter(Boolean)
  );

  const handleFileUpload = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        nookState.setMapImage(dataUrl);
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  const removeMapImage = () => {
    nookState.setMapImage(undefined);
  };

  const openFilePicker = () => {
    fileInput.click();
  };
</script>

<div id="map-app" class="flex flex-col h-full ac-app-screen relative bg-[#7ed3c4] overflow-hidden">
  <NookAppHeader 
    title="Map"
    subtitle={nookState.passport.islandName}
    bgClass="bg-[#75cfbe]"
  >
    {#snippet iconSnippet()}
      <div class="w-12 h-12 mr-1">
        <NookIcon name="map" class="w-full h-full object-contain drop-shadow-sm" />
      </div>
    {/snippet}
    {#snippet actions()}
      <NookToolbarButton onclick={ctx.handleHomeButton} title="Close App">
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>

  <!-- Wavy overlay pattern -->
  <div class="absolute inset-0 opacity-10 pointer-events-none mt-[60px]"
    style="background-image: url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 10c4 5 12 8 12 15s-8 12-12 15c-4-3-12-6-12-15s8-10 12-15z%22 fill=%22white%22 fill-opacity=%221%22/%3E%3C/svg%3E'); background-size: 40px 40px;">
  </div>

  <div class="flex-1 flex flex-row items-stretch relative z-10 pt-2 pb-4 px-2 gap-2 overflow-hidden">
    
    <!-- Left Sidebar: Residents -->
    <div class="w-[72px] shrink-0 flex flex-col items-center">
      <button 
        onclick={() => nookState.navigate('contacts')}
        class="bg-[#5fbba9] hover:bg-[#4ea896] text-white text-[10px] font-bold px-2 py-1 rounded-full mb-2 shadow-sm whitespace-nowrap flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
        title="Manage Residents in Contacts"
      >
        Residents <Settings class="w-3 h-3" />
      </button>
      <div class="flex-1 w-full overflow-y-auto ac-scrollbar pr-1 flex flex-col gap-2 items-center pb-8">
        <!-- Player -->
        <div class="w-12 h-12 bg-orange-400 rounded-full p-1 border-2 border-white shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
          <img src={nookState.passport.photoUrl} alt="Player" class="w-full h-full object-cover rounded-full" />
        </div>
        <!-- Real Villagers -->
        {#if isLoading}
          <div class="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin my-4"></div>
        {:else}
          {#each activeResidents as resident}
            <div class="w-12 h-12 bg-white rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 flex items-center justify-center group relative cursor-help">
              <img src={resident.image_url} alt={resident.name} class="w-full h-full object-cover scale-110" />
              <!-- Tooltip -->
              <div class="absolute left-[110%] bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {resident.name}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Center: Map Area -->
    <div class="flex-1 relative flex items-center justify-center bg-transparent shrink-0 min-w-0">
      {#if nookState.map.imageUrl}
        <div class="relative w-full h-full max-h-full flex items-center justify-center p-2 group">
          <img 
            src={nookState.map.imageUrl} 
            alt="Island Map" 
            class="max-w-full max-h-full object-contain rounded-2xl shadow-xl border-4 border-white/20"
          />
          <button 
            onclick={removeMapImage}
            class="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove Map"
          >
            <X class="w-4 h-4 stroke-[3px]" />
          </button>
        </div>
      {:else}
        <!-- Fallback generic grid (matching original MapApp) -->
        <div class="relative w-full h-full max-w-[320px] aspect-[4/3] bg-[#87c38f]/30 border-4 border-white/40 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center group"
          style="background-image: radial-gradient(rgba(255,255,255,0.4) 15%, transparent 15%); background-size: 20px 20px">
          
          <div class="absolute inset-x-0 bottom-0 h-4 bg-blue-300/60"></div>
          
          <button 
            onclick={openFilePicker}
            class="relative z-20 flex flex-col items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-white hover:scale-105 transition-transform text-[#2d5a27] font-bold text-xs"
          >
            <Upload class="w-6 h-6 text-[#2d5a27]" />
            Upload Map Image
          </button>
          
          <input 
            type="file" 
            accept="image/*" 
            bind:this={fileInput}
            onchange={handleFileUpload}
            class="hidden"
          />
        </div>
      {/if}
    </div>

    <!-- Right Sidebar: Facilities -->
    <div class="w-[64px] shrink-0 overflow-y-auto ac-scrollbar flex flex-col gap-3 items-center pt-8 pb-8 pr-1">
      {#each nookState.map.buildings as facility}
        <div class="w-12 h-12 bg-white/80 rounded-xl shadow-sm border border-white/50 flex flex-col items-center justify-center shrink-0 group relative cursor-help">
          <span class="text-xl">{facility.icon}</span>
          <!-- Tooltip -->
          <div class="absolute right-[110%] bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {facility.name}
          </div>
        </div>
      {/each}
    </div>

  </div>
</div>

<style>
  .ac-ribbon {
    background: #facc15;
    color: #854d0e;
    padding: 6px 36px;
    position: relative;
    display: inline-block;
    font-weight: 900;
    font-family: 'Varela Round', sans-serif;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .ac-ribbon::before, .ac-ribbon::after {
    content: "";
    position: absolute;
    bottom: -6px;
    border: 14px solid #eab308;
    z-index: -1;
  }
  .ac-ribbon::before {
    left: -14px;
    border-right-color: transparent;
    border-bottom-color: transparent;
  }
  .ac-ribbon::after {
    right: -14px;
    border-left-color: transparent;
    border-bottom-color: transparent;
  }
  
  .ac-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .ac-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .ac-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 10px;
  }
</style>
