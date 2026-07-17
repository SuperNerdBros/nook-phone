<script lang="ts">
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import { onMount } from 'svelte';
  import nookState from '@/lib/nookState.svelte';
  import { fetchNookipediaVillagers, fetchNookipediaItems } from '@/lib/api';
  import { Search, Star, MessageCircle, Home, Info, ChevronLeft, Phone, Video, Users, Plus, Image as ImageIcon, Camera, Gift, Trash2, Check, UserPlus, Leaf, X as XIcon } from '@lucide/svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import AcnhBubble from '@/components/molecules/AcnhBubble.svelte';
  
  const ctx = getPhoneContext();
  let allVillagers = $state<any[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state("");
  let selectedVillager = $state<any>(null);
  let activeTab = $state<'all' | 'vip' | 'island'>('all');
  let isAddMode = $state(false);

  let isGiftPickerOpen = $state(false);
  let giftSearchQuery = $state("");
  let allGiftItems = $state<any[]>([]);
  let isGiftLoading = $state(false);
  let selectedGift = $state<any | null>(null);
  let giftReaction = $state<{ rating: number; message: string } | null>(null);

  async function openGiftPicker() {
    isGiftPickerOpen = true;
    giftSearchQuery = "";
    selectedGift = null;
    giftReaction = null;
    
    if (allGiftItems.length === 0) {
      isGiftLoading = true;
      try {
        allGiftItems = await fetchNookipediaItems();
      } catch (e) {
        console.error("Failed to load gifts", e);
      } finally {
        isGiftLoading = false;
      }
    }
  }

  const filteredGifts = $derived(
    allGiftItems.filter(item => {
      const q = giftSearchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || 
             (item.category || "").toLowerCase().includes(q);
    })
  );

  function getGiftReaction(villager: any, item: any) {
    const hashVal = (villager.name.charCodeAt(0) + item.name.charCodeAt(0) + (villager.personality || '').charCodeAt(0)) % 100;
    
    let rating = 1;
    let message = "";
    
    const category = item.category || 'Other';
    const personality = villager.personality || 'Normal';
    
    if (personality === 'Jock') {
      if (category === 'Furniture' || category === 'Daily Selection') {
        rating = hashVal % 2 === 0 ? 5 : 4;
      } else if (category === 'Fashion') {
        rating = 2;
      } else {
        rating = 3;
      }
    } else if (personality === 'Snooty') {
      if (item.buy_price > 5000) {
        rating = 5;
      } else if (category === 'Fashion') {
        rating = 4;
      } else if (item.buy_price < 500) {
        rating = 1;
      } else {
        rating = 3;
      }
    } else if (personality === 'Lazy') {
      if (category === 'Other' || category === 'Daily Selection') {
        rating = 5;
      } else if (category === 'Fashion') {
        rating = 2;
      } else {
        rating = 4;
      }
    } else {
      if (hashVal < 20) rating = 1;
      else if (hashVal < 40) rating = 2;
      else if (hashVal < 70) rating = 3;
      else if (hashVal < 90) rating = 4;
      else rating = 5;
    }
    
    switch (rating) {
      case 1:
        if (personality === 'Cranky') message = `Bah! What am I supposed to do with this? Thanks, I guess...`;
        else if (personality === 'Snooty') message = `Oh... a ${item.name}. How... ordinary. Thank you, I suppose.`;
        else if (personality === 'Jock') message = `Uh, thanks, but this doesn't help my gains at all! Still, appreciate the gesture.`;
        else message = `Oh, thank you! It's the thought that counts, right?`;
        break;
      case 2:
        if (personality === 'Cranky') message = `A ${item.name}? Hmm. Not bad, not bad. Thanks, kid.`;
        else if (personality === 'Lazy') message = `Oh, cool! A ${item.name}. I might use this for something later. Thanks!`;
        else message = `Oh, a ${item.name}! Thank you, I will find a good spot for this.`;
        break;
      case 3:
        if (personality === 'Peppy') message = `Oh my gosh, a ${item.name}! That is so cute! Thanks a million!`;
        else if (personality === 'Smug') message = `Ah, a ${item.name}. You have an exquisite eye for design, my friend. Thank you!`;
        else message = `Wow, a ${item.name}! I really like this. Thank you so much!`;
        break;
      case 4:
        if (personality === 'Peppy') message = `Yay! A ${item.name}! This is literally the best gift ever! You're amazing!`;
        else if (personality === 'Sisterly') message = `Hey, you really hit the nail on the head with this ${item.name}! Thanks, you're a true friend.`;
        else message = `Oh, I love it! A ${item.name} is exactly what I wanted. Thank you so much!`;
        break;
      case 5:
        if (personality === 'Lazy') message = `HOORAY! A ${item.name}! This makes me so happy, I think my bugs are celebrating too! Thank you!`;
        else if (personality === 'Smug') message = `Magnifique! A ${item.name}! This is a masterpiece of a gift. I am truly touched by your sophistication!`;
        else if (personality === 'Cranky') message = `No way! A ${item.name}?! I've been looking for one of these for ages! You're alright, kid. Thanks!`;
        else message = `Oh my goodness! A ${item.name}! I absolutely love this so much! You know me so well!`;
        break;
    }
    
    return { rating, message };
  }

  function sendGift(item: any) {
    if (!selectedVillager) return;
    
    giftReaction = getGiftReaction(selectedVillager, item);
    
    // Set daily gifted milestone if not already set
    const milestones = nookState.getMilestones(selectedVillager.id);
    if (!milestones.giftedToday) {
      nookState.toggleMilestone(selectedVillager.id, 'giftedToday');
    }
  }

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
        <div class="h-32 mb-4 relative group flex items-end justify-center">
          {#if selectedVillager.image_url}
            <img src={selectedVillager.image_url} alt={selectedVillager.name} class="h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
          {:else}
            <div class="w-28 h-28 rounded-full border-4 border-white bg-[#e1d9be] flex items-center justify-center text-4xl">🐾</div>
          {/if}
        </div>
        <h1 class="text-3xl font-black text-[#5c3a21] tracking-tight">{selectedVillager.name}</h1>
        <p class="text-[#8a7f66] font-bold mt-1 text-sm">{selectedVillager.personality} {selectedVillager.species}</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4 px-6 mb-8">
        <button onclick={openGiftPicker} class="flex flex-col items-center gap-1 cursor-pointer">
          <div class="w-12 h-12 rounded-full bg-[#ff8a8a] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform hover:bg-[#ff7575]">
            <Gift class="w-6 h-6 fill-current" />
          </div>
          <span class="text-[10px] font-bold text-[#5c3a21]">Gift</span>
        </button>
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
        <button onclick={ctx.handleHomeButton} class="nook-header-btn" title="Close App"><XIcon class="w-3.5 h-3.5 stroke-[3px] text-[#649e8a]" /></button>
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
                  <div class="w-12 h-12 rounded-2xl bg-[#f5f4e8] p-1 flex items-center justify-center flex-shrink-0 relative border-2 border-[#e1d9be]/50 shadow-sm">
                    {#if villager.image_url}
                      <img src={villager.image_url} alt={villager.name} class="w-full h-full object-contain" loading="lazy" />
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

  {#if isGiftPickerOpen}
    <div class="absolute inset-0 z-50 bg-[#fdfcf2] flex flex-col overflow-hidden animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 bg-[#ff8a8a]/10 border-b border-[#ff8a8a]/20 sticky top-0 backdrop-blur-md z-40">
        <button onclick={() => isGiftPickerOpen = false} class="flex items-center text-[#5c3a21] font-bold text-sm bg-white/50 px-3 py-1.5 rounded-full shadow-sm hover:bg-white active:scale-95 transition-all cursor-pointer">
          <ChevronLeft class="w-4 h-4 mr-1" /> Cancel
        </button>
        <span class="font-black text-[#5c3a21] text-lg">Send Gift</span>
        <div class="w-16"></div> <!-- spacer to balance back button -->
      </div>

      <!-- Search Input -->
      <div class="p-4 bg-[#fbf9f0] border-b border-[#e1d9be] shrink-0">
        <div class="relative w-full">
          <Search class="w-4 h-4 text-[#8a7f66]/60 absolute left-3 top-3.5" />
          <input 
            type="text" 
            placeholder="Search items to gift..." 
            bind:value={giftSearchQuery}
            class="w-full bg-white pl-9 pr-4 py-2.5 rounded-xl text-sm font-bold border-2 border-transparent focus:outline-none focus:border-[#ff8a8a] text-[#5c3a21] placeholder:text-[#8a7f66]/60 shadow-inner"
          />
        </div>
      </div>

      <!-- Scrollable list of items -->
      <div class="flex-1 overflow-y-auto p-4 pb-20 ac-scrollbar grid grid-cols-2 gap-3">
        {#if isGiftLoading}
          <div class="col-span-2 flex flex-col items-center justify-center py-20 text-[#8a7f66]">
            <div class="w-8 h-8 border-4 border-[#ff8a8a] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p class="font-bold text-sm">Browsing inventory...</p>
          </div>
        {:else}
          {#each filteredGifts as item}
            <button 
              onclick={() => sendGift(item)}
              class="p-3 bg-white border-2 border-[#e1d9be] hover:border-[#ff8a8a] rounded-2xl flex flex-col items-center justify-between transition-all hover:scale-[1.02] cursor-pointer min-h-[130px] shadow-sm active:scale-98"
            >
              <div class="w-16 h-16 flex items-center justify-center mb-2">
                {#if item.imageUrl}
                  <img src={item.imageUrl} alt={item.name} class="max-w-full max-h-full object-contain drop-shadow-sm" loading="lazy" />
                {:else}
                  <Leaf class="w-10 h-10 text-[#c6b199]" />
                {/if}
              </div>
              <span class="font-extrabold text-[11px] text-[#5c3a21] leading-tight text-center truncate w-full px-1 capitalize">
                {item.name}
              </span>
            </button>
          {:else}
            <div class="col-span-2 text-center py-12 text-gray-400 text-sm">
              No items match your search.
            </div>
          {/each}
        {/if}
      </div>

      <!-- Dialog reaction overlay -->
      {#if giftReaction}
        <div class="absolute inset-0 z-50 bg-[#fdfcf0] flex flex-col justify-end p-5 pb-10 overflow-hidden animate-fade-in">
          <!-- Dots Pattern -->
          <div class="absolute inset-0 ac-bg-dots opacity-40 z-0 pointer-events-none"></div>

          <!-- Full Body Villager Image -->
          <div class="absolute top-16 left-1/2 -translate-x-1/2 z-10 animate-ac-float">
            <div class="h-64 flex items-end justify-center relative">
              {#if selectedVillager.image_url}
                <img src={selectedVillager.image_url} alt={selectedVillager.name} class="h-full object-contain drop-shadow-xl" />
              {:else}
                <div class="text-7xl">🐾</div>
              {/if}
            </div>
          </div>

          <!-- Dialog Bubble Container -->
          <div class="relative z-20 w-full max-w-lg mx-auto flex flex-col gap-6">
            <AcnhBubble
              title={selectedVillager.name}
              dialogText={giftReaction.message}
              isActive={true}
              class="w-full"
            >
              <!-- Rating and Action -->
              <div class="mt-4 border-t border-[#e1d9be]/60 pt-3 flex flex-col items-center gap-3 animate-fade-in" style="animation-delay: 500ms;">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black text-[#8a7f66] uppercase tracking-wider">Love Rating</span>
                  <div class="flex gap-0.5">
                    {#each Array(5) as _, i}
                      <svg 
                        class="w-5 h-5 transition-all {i < giftReaction.rating ? 'text-[#ff6b6b] fill-current animate-bounce-short' : 'text-gray-300'}" 
                        style="animation-delay: {i * 100}ms;"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    {/each}
                  </div>
                </div>

                <button 
                  onclick={() => {
                    isGiftPickerOpen = false;
                    giftReaction = null;
                  }}
                  class="bg-[#f0b157] text-[#5c3a21] font-black py-2.5 px-6 rounded-full border-b-4 border-[#d99c45] hover:bg-[#f2bd70] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md text-sm"
                >
                  You're Welcome!
                </button>
              </div>
            </AcnhBubble>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
