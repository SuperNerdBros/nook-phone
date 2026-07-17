<script lang="ts">
  import { onMount } from 'svelte';
  import nookState from '@/lib/nookState.svelte';
  import { fetchNookipediaVillagers } from '@/lib/api';
  import { Search, Star, MessageCircle, Home, Info, ChevronLeft, Phone, Video, Users, Plus, Image as ImageIcon, Camera, Gift, Trash2, Check, UserPlus } from '@lucide/svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  
  let allVillagers = $state<any[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state("");
  let selectedVillager = $state<any>(null);
  let activeTab = $state<'all' | 'vip' | 'island'>('all');
  let isAddMode = $state(false);

  onMount(async () => {
    allVillagers = await fetchNookipediaVillagers();
    isLoading = false;
  });

  const myContactsList = $derived(allVillagers.filter(v => nookState.isContact(v.id)));

  const filteredVillagers = $derived(
    (isAddMode ? allVillagers : myContactsList).filter(v => {
      if (!isAddMode) {
        if (activeTab === 'vip' && !nookState.isVipContact(v.id)) return false;
        if (activeTab === 'island' && !nookState.isResident(v.id)) return false;
      }
      
      const searchLower = searchQuery.toLowerCase();
      return v.name.toLowerCase().includes(searchLower) || 
             v.species.toLowerCase().includes(searchLower);
    }).sort((a, b) => a.name.localeCompare(b.name))
  );

  const groupedVillagers = $derived.by(() => {
    const groups: Record<string, any[]> = {};
    
    // Only show special groups if NOT in add mode, in "all" tab, and no search query
    if (!isAddMode && activeTab === 'all' && !searchQuery) {
      const residents = filteredVillagers.filter(v => nookState.isResident(v.id));
      if (residents.length > 0) {
        groups['🏝️ Island Residents'] = residents;
      }

      const vips = filteredVillagers.filter(v => nookState.isVipContact(v.id));
      if (vips.length > 0) {
        groups['⭐ VIPs'] = vips;
      }
    }
    
    filteredVillagers.forEach(v => {
      const firstLetter = v.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(v);
    });
    return groups;
  });

  function openContact(villager: any) {
    if (isAddMode) {
      if (nookState.isContact(villager.id)) {
        nookState.removeContact(villager.id);
      } else {
        nookState.addContact(villager.id);
      }
    } else {
      selectedVillager = villager;
    }
  }

  function closeContact() {
    selectedVillager = null;
  }

  function toggleVip(villagerId: string) {
    nookState.toggleVipContact(villagerId);
  }

  function toggleResident(villagerId: string) {
    nookState.toggleResident(villagerId);
  }

  function toggleMilestone(milestone: 'hasPoster' | 'hasPhoto' | 'talkedToday' | 'giftedToday') {
    if (selectedVillager) {
      nookState.toggleMilestone(selectedVillager.id, milestone);
    }
  }

  function removeContact() {
    if (selectedVillager) {
      nookState.removeContact(selectedVillager.id);
      closeContact();
    }
  }

  function messageContact(villager: any) {
    const isResident = nookState.isResident(villager.id);
    if (isResident || nookState.isVipContact(villager.id)) {
        nookState.sendChatMessage(villager.name, `Hey ${villager.name}!`, false);
    }
    nookState.navigate('chat');
  }
</script>

<div class="flex flex-col h-full bg-[#fdfcf2] relative">
  {#if selectedVillager}
    {@const ms = nookState.getMilestones(selectedVillager.id)}
    <!-- Detail View -->
    <div class="absolute inset-0 z-30 bg-[#fdfcf2] flex flex-col overflow-y-auto animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 bg-[#8cc3b0]/10 border-b border-[#8cc3b0]/20 sticky top-0 backdrop-blur-md z-40">
        <button onclick={closeContact} class="flex items-center text-[#5c3a21] font-bold text-sm bg-white/50 px-3 py-1.5 rounded-full shadow-sm hover:bg-white active:scale-95 transition-all cursor-pointer">
          <ChevronLeft class="w-4 h-4 mr-1" /> Back
        </button>
        <button onclick={() => toggleVip(selectedVillager.id)} class="text-[#f0b157] bg-white/50 p-2 rounded-full shadow-sm hover:bg-white active:scale-95 transition-all cursor-pointer">
          <Star class="w-5 h-5 {nookState.isVipContact(selectedVillager.id) ? 'fill-current' : ''}" />
        </button>
      </div>

      <!-- Avatar & Name -->
      <div class="flex flex-col items-center pt-8 pb-6 px-6 bg-gradient-to-b from-[#8cc3b0]/10 to-transparent">
        <div class="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden mb-4 relative group">
          {#if selectedVillager.image_url}
            <img src={selectedVillager.image_url} alt={selectedVillager.name} class="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500" />
          {:else}
            <div class="w-full h-full bg-[#e1d9be] flex items-center justify-center text-4xl">🐾</div>
          {/if}
        </div>
        <h1 class="text-3xl font-black text-[#5c3a21] tracking-tight">{selectedVillager.name}</h1>
        <p class="text-[#8a7f66] font-bold mt-1 text-sm">{selectedVillager.personality} {selectedVillager.species}</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4 px-6 mb-8">
        <button onclick={() => messageContact(selectedVillager)} class="flex flex-col items-center gap-1 cursor-pointer">
          <div class="w-12 h-12 rounded-full bg-[#6cd476] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform hover:bg-[#5bc265]">
            <MessageCircle class="w-6 h-6 fill-current" />
          </div>
          <span class="text-[10px] font-bold text-[#5c3a21]">Message</span>
        </button>
        <button class="flex flex-col items-center gap-1 opacity-50 cursor-not-allowed">
          <div class="w-12 h-12 rounded-full bg-[#f0b157] text-white flex items-center justify-center shadow-md">
            <Phone class="w-6 h-6 fill-current" />
          </div>
          <span class="text-[10px] font-bold text-[#5c3a21]">Call</span>
        </button>
        <button class="flex flex-col items-center gap-1 opacity-50 cursor-not-allowed">
          <div class="w-12 h-12 rounded-full bg-[#6db3e6] text-white flex items-center justify-center shadow-md">
            <Video class="w-6 h-6 fill-current" />
          </div>
          <span class="text-[10px] font-bold text-[#5c3a21]">Video</span>
        </button>
      </div>

      <!-- Info Cards -->
      <div class="px-5 flex flex-col gap-3 pb-8">
        <!-- Island Status -->
        <div class="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#e1d9be] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#8cc3b0]/20 text-[#649e8a] flex items-center justify-center">
              <Home class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs font-black text-[#8a7f66] uppercase tracking-wider">Island Status</p>
              <p class="text-sm font-bold text-[#5c3a21]">{nookState.isResident(selectedVillager.id) ? 'Current Resident' : 'Non-Resident'}</p>
            </div>
          </div>
          <button 
            onclick={() => toggleResident(selectedVillager.id)}
            class="px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer {nookState.isResident(selectedVillager.id) ? 'bg-[#ff8a8a] text-white shadow-[0_3px_0_#d96666] active:shadow-none active:translate-y-[3px] hover:bg-[#ff7575]' : 'bg-[#6cd476] text-white shadow-[0_3px_0_#4ca454] active:shadow-none active:translate-y-[3px] hover:bg-[#5bc265]'}"
          >
            {nookState.isResident(selectedVillager.id) ? 'Evict' : 'Move In'}
          </button>
        </div>

        <!-- Details -->
        <div class="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#e1d9be]">
          <div class="flex items-center gap-2 mb-3 text-[#8a7f66]">
            <Info class="w-4 h-4" />
            <span class="text-xs font-black uppercase tracking-wider">Information</span>
          </div>
          
          <div class="grid grid-cols-2 gap-y-4 gap-x-2">
            <div>
              <p class="text-[10px] font-bold text-[#8a7f66] uppercase">Birthday</p>
              <p class="text-sm font-bold text-[#5c3a21]">{selectedVillager.birthday || 'Unknown'}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#8a7f66] uppercase">Star Sign</p>
              <p class="text-sm font-bold text-[#5c3a21]">{selectedVillager.sign || 'Unknown'}</p>
            </div>
          </div>
        </div>

        <!-- Milestones & Tracking -->
        <div class="flex flex-col gap-3">
          <!-- Daily Interactions -->
          <div class="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#e1d9be]">
            <div class="flex items-center gap-2 mb-4 text-[#8a7f66]">
              <MessageCircle class="w-4 h-4" />
              <span class="text-xs font-black uppercase tracking-wider">Daily Interactions</span>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <button onclick={() => toggleMilestone('talkedToday')} class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer {ms.talkedToday ? 'bg-[#6cd476]/10 border-[#6cd476] text-[#4ca454]' : 'bg-gray-50 border-gray-100 text-[#8a7f66]'}">
                <MessageCircle class="w-6 h-6 mb-1 {ms.talkedToday ? 'fill-current' : ''}" />
                <span class="text-[10px] font-bold uppercase">Talked Today</span>
              </button>
              <button onclick={() => toggleMilestone('giftedToday')} class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer {ms.giftedToday ? 'bg-[#f0b157]/10 border-[#f0b157] text-[#d99c45]' : 'bg-gray-50 border-gray-100 text-[#8a7f66]'}">
                <Gift class="w-6 h-6 mb-1 {ms.giftedToday ? 'fill-current' : ''}" />
                <span class="text-[10px] font-bold uppercase">Gifted Today</span>
              </button>
            </div>
          </div>

          <!-- Collection -->
          <div class="bg-white rounded-2xl p-4 shadow-sm border-2 border-[#e1d9be]">
            <div class="flex items-center gap-2 mb-4 text-[#8a7f66]">
              <Star class="w-4 h-4" />
              <span class="text-xs font-black uppercase tracking-wider">Collection</span>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <button onclick={() => toggleMilestone('hasPoster')} class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer {ms.hasPoster ? 'bg-[#6db3e6]/10 border-[#6db3e6] text-[#4a90e2]' : 'bg-gray-50 border-gray-100 text-[#8a7f66]'}">
                <ImageIcon class="w-6 h-6 mb-1 {ms.hasPoster ? 'fill-current' : ''}" />
                <span class="text-[10px] font-bold uppercase">Got Poster</span>
              </button>
              <button onclick={() => toggleMilestone('hasPhoto')} class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer {ms.hasPhoto ? 'bg-[#ff8a8a]/10 border-[#ff8a8a] text-[#d96666]' : 'bg-gray-50 border-gray-100 text-[#8a7f66]'}">
                <Camera class="w-6 h-6 mb-1 {ms.hasPhoto ? 'fill-current' : ''}" />
                <span class="text-[10px] font-bold uppercase">Got Photo</span>
              </button>
            </div>
          </div>
        </div>

        <button onclick={removeContact} class="mt-4 py-3 rounded-2xl border-2 border-[#ff8a8a] text-[#d96666] font-bold flex items-center justify-center gap-2 hover:bg-[#ff8a8a]/10 transition-colors cursor-pointer active:scale-95">
          <Trash2 class="w-4 h-4" />
          Remove Contact
        </button>
      </div>
    </div>
  {:else}
    <!-- List View -->
    <NookAppHeader
      title={isAddMode ? 'Add Contacts' : activeTab === 'vip' ? 'VIP Contacts' : activeTab === 'island' ? 'Island Residents' : 'Contacts'}
      bgClass="bg-[#8cc3b0]"
      textClass="text-white"
    >
      {#snippet actions()}
        {#if isAddMode}
          <button onclick={() => { isAddMode = false; searchQuery = ''; }} class="text-white font-bold text-sm bg-black/10 px-3 py-1.5 rounded-full hover:bg-black/20 transition-colors cursor-pointer">
            Done
          </button>
        {:else}
          <button onclick={() => { isAddMode = true; searchQuery = ''; }} class="w-8 h-8 rounded-full bg-white text-[#8cc3b0] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <Plus class="w-5 h-5" />
          </button>
        {/if}
      {/snippet}
      
      <div class="relative w-full">
        <Search class="w-4 h-4 text-[#649e8a] absolute left-3 top-3" />
        <input 
          type="text" 
          placeholder="Search villagers..." 
          bind:value={searchQuery}
          class="w-full bg-white/95 pl-9 pr-4 py-2.5 rounded-xl text-sm font-bold border-2 border-transparent focus:outline-none focus:border-white text-[#5c3a21] placeholder:text-[#8a7f66]/60 shadow-inner transition-all"
        />
      </div>
    </NookAppHeader>

    <div class="flex-1 overflow-y-auto bg-[#fdfcf2] relative pb-28">
      {#if isLoading}
        <div class="flex flex-col items-center justify-center h-48 text-[#8a7f66]">
          <div class="w-8 h-8 border-4 border-[#8cc3b0] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="font-bold text-sm">Syncing Contacts...</p>
        </div>
      {:else}
        {#each Object.entries(groupedVillagers) as [group, vList]}
          <div class="mb-1">
            <div class="bg-[#f0ece1] px-4 py-1.5 sticky top-0 z-10 border-y border-[#e1d9be]">
              <span class="text-xs font-black text-[#8a7f66]">{group}</span>
            </div>
            <div class="flex flex-col">
              {#each vList as villager}
                <button 
                  onclick={() => openContact(villager)}
                  class="flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#fcfbf7] border-b border-[#f0ece1] transition-colors text-left active:bg-[#f0ece1] cursor-pointer"
                >
                  <div class="w-12 h-12 rounded-full bg-[#f0ece1] overflow-hidden flex-shrink-0 border-2 border-white shadow-sm relative">
                    {#if villager.image_url}
                      <img src={villager.image_url} alt={villager.name} class="w-full h-full object-cover scale-110" loading="lazy" />
                    {:else}
                      <div class="w-full h-full flex items-center justify-center text-lg">🐾</div>
                    {/if}
                    {#if !isAddMode && nookState.isResident(villager.id)}
                      <div class="absolute -bottom-1 -right-1 bg-[#6cd476] w-4 h-4 rounded-full border-2 border-white"></div>
                    {/if}
                  </div>
                  <div class="flex-1 min-w-0 flex justify-between items-center">
                    <div class="flex flex-col">
                      <span class="font-black text-[#5c3a21] text-[15px] leading-tight truncate">{villager.name}</span>
                      <span class="text-[11px] font-bold text-[#8a7f66] truncate">{villager.species}</span>
                    </div>
                    {#if isAddMode}
                      {#if nookState.isContact(villager.id)}
                        <div class="w-6 h-6 rounded-full bg-[#6cd476] text-white flex items-center justify-center shrink-0">
                          <Check class="w-4 h-4" />
                        </div>
                      {:else}
                        <div class="w-6 h-6 rounded-full border-2 border-[#e1d9be] text-[#e1d9be] flex items-center justify-center shrink-0">
                          <Plus class="w-4 h-4" />
                        </div>
                      {/if}
                    {:else}
                      {#if nookState.isVipContact(villager.id)}
                        <Star class="w-4 h-4 text-[#f0b157] fill-current shrink-0" />
                      {/if}
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {/each}
        
        {#if filteredVillagers.length === 0}
          <div class="flex flex-col items-center justify-center h-48 text-[#8a7f66] px-8 text-center">
            {#if isAddMode}
              <p class="font-bold text-sm">No villagers found matching that search.</p>
            {:else}
              <UserPlus class="w-12 h-12 mb-3 text-[#e1d9be]" />
              <p class="font-bold text-sm text-[#8a7f66] mb-4">No contacts yet!</p>
              <button onclick={() => { isAddMode = true; searchQuery = ''; }} class="bg-[#8cc3b0] text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-[#7ab19f] transition-colors cursor-pointer active:scale-95">
                Add New Contact
              </button>
            {/if}
          </div>
        {/if}
      {/if}
    </div>

    <!-- Bottom App Navigation -->
    {#if !isAddMode}
      <div class="absolute bottom-6 inset-x-4 bg-white/95 backdrop-blur-md border-2 border-[#e1d9be] rounded-3xl p-1.5 flex justify-between z-20 shadow-lg">
        <button 
          onclick={() => activeTab = 'all'}
          class="flex-1 flex flex-col items-center py-2 rounded-2xl transition-colors cursor-pointer {activeTab === 'all' ? 'bg-[#8cc3b0]/20 text-[#649e8a]' : 'text-[#8a7f66] hover:bg-gray-50 hover:text-[#5c3a21]'}"
        >
          <Users class="w-5 h-5 mb-0.5 {activeTab === 'all' ? 'fill-current' : ''}" />
          <span class="text-[10px] font-black uppercase tracking-wider">All</span>
        </button>
        <button 
          onclick={() => activeTab = 'vip'}
          class="flex-1 flex flex-col items-center py-2 rounded-2xl transition-colors cursor-pointer {activeTab === 'vip' ? 'bg-[#f0b157]/20 text-[#d99c45]' : 'text-[#8a7f66] hover:bg-gray-50 hover:text-[#d99c45]'}"
        >
          <Star class="w-5 h-5 mb-0.5 {activeTab === 'vip' ? 'fill-current' : ''}" />
          <span class="text-[10px] font-black uppercase tracking-wider">VIPs</span>
        </button>
        <button 
          onclick={() => activeTab = 'island'}
          class="flex-1 flex flex-col items-center py-2 rounded-2xl transition-colors cursor-pointer {activeTab === 'island' ? 'bg-[#6cd476]/20 text-[#4ca454]' : 'text-[#8a7f66] hover:bg-gray-50 hover:text-[#4ca454]'}"
        >
          <Home class="w-5 h-5 mb-0.5 {activeTab === 'island' ? 'fill-current' : ''}" />
          <span class="text-[10px] font-black uppercase tracking-wider">Island</span>
        </button>
      </div>
    {/if}
  {/if}
</div>
