<script lang="ts">
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import { onMount } from 'svelte';
  import nookState from '@/lib/nookState.svelte';
  import { fetchNookipediaVillagers, searchNookipediaItems } from '@/lib/api';
  import { Search, Star, MessageCircle, MessageSquare, Bookmark, Home, Info, ChevronLeft, Phone, Video, Users, Plus, Image as ImageIcon, Camera, Gift, Trash2, Check, UserPlus, Leaf, X as XIcon } from '@lucide/svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import AcnhBubble from '@/components/molecules/AcnhBubble.svelte';
  
  const ctx = getPhoneContext();
  let allVillagers = $state<any[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state("");
  let selectedVillager = $state<any>(null);
  let activeTab = $state<'all' | 'island' | 'bestFriend'>('all');
  let isAddMode = $state(false);
  let selectedSpecies = $state("");
  let viewAll = $state(false);

  let isGiftPickerOpen = $state(false);
  let giftSearchQuery = $state("");
  let giftSearchResults = $state<any[]>([]);
  let isGiftLoading = $state(false);
  let selectedGift = $state<any | null>(null);
  let giftReaction = $state<{ rating: number; message: string } | null>(null);

  // Drag and Drop state for Island Residents
  let draggedIndex = $state<number | null>(null);
  let dragOverIndex = $state<number | null>(null);

  function handleDragStart(e: DragEvent, index: number) {
    draggedIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
    }
  }

  function handleDragEnter(e: DragEvent, index: number) {
    if (draggedIndex !== null && draggedIndex !== index) {
      dragOverIndex = index;
    }
  }

  function handleDrop(e: DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      nookState.reorderResidents(draggedIndex, index);
    }
    draggedIndex = null;
    dragOverIndex = null;
  }
  
  function handleDragEnd() {
    draggedIndex = null;
    dragOverIndex = null;
  }

  const SPECIES_EMOJIS: Record<string, string> = {
    "Alligator": "🐊", "Anteater": "🐜", "Bear": "🐻", "Bear cub": "🧸", "Bear Cub": "🧸", "Bird": "🐦",
    "Bull": "🐂", "Cat": "🐱", "Chicken": "🐔", "Cow": "🐄",
    "Cub": "🧸", "Deer": "🦌", "Dog": "🐶", "Duck": "🦆",
    "Eagle": "🦅", "Elephant": "🐘", "Frog": "🐸", "Goat": "🐐",
    "Gorilla": "🦍", "Hamster": "🐹", "Hippo": "🦛", "Horse": "🐴",
    "Kangaroo": "🦘", "Koala": "🐨", "Lion": "🦁", "Monkey": "🐒",
    "Mouse": "🐭", "Octopus": "🐙", "Ostrich": "🦩", "Penguin": "🐧",
    "Pig": "🐷", "Rabbit": "🐰", "Rhino": "🦏", "Rhinoceros": "🦏", "Sheep": "🐑",
    "Squirrel": "🐿️", "Tiger": "🐯", "Wolf": "🐺"
  };

  async function openGiftPicker() {
    isGiftPickerOpen = true;
    giftSearchQuery = "";
    selectedGift = null;
    giftReaction = null;
    giftSearchResults = [];
  }

  async function handleGiftSearch() {
    if (!giftSearchQuery.trim()) return;
    isGiftLoading = true;
    giftSearchResults = [];
    try {
      const res = await searchNookipediaItems(giftSearchQuery);
      if (res.length === 0) {
         giftReaction = { rating: 0, message: "Hmm... I don't think I've ever heard of that item." };
      } else {
         giftSearchResults = res.slice(0, 10);
         giftReaction = { rating: 0, message: `Oh! You found ${res.length} things! Which one?` };
      }
    } catch (e) {
      console.error(e);
    } finally {
      isGiftLoading = false;
    }
  }

  async function askWhatTheyWant() {
    const favCat = getFavoriteCategory(selectedVillager?.personality);
    isGiftLoading = true;
    giftSearchResults = [];
    giftReaction = { rating: 0, message: `I've really been hoping for some ${favCat} lately! Anything like that?` };
    try {
      const res = await searchNookipediaItems('', favCat);
      giftSearchResults = res.slice(0, 10);
    } catch (e) {
      console.error(e);
    } finally {
      isGiftLoading = false;
    }
  }

  function getFavoriteCategory(personality: string) {
    if (personality === 'Jock') return 'Housewares';
    if (personality === 'Snooty') return 'Tops';
    if (personality === 'Lazy') return 'Fish';
    if (personality === 'Cranky') return 'Music';
    if (personality === 'Peppy') return 'Dresses';
    if (personality === 'Smug') return 'Miscellaneous';
    return 'Housewares';
  }

  function getGiftReaction(villager: any, item: any) {
    let basePoints = 1; // Default +1 point (2 stars)
    
    const cat = item.category || 'Other';
    const name = (item.name || '').toLowerCase();
    
    // Check for garbage
    if (name === 'empty can' || name === 'boot' || name === 'old tire' || name === 'spoiled turnips' || name === 'used fountain firework') {
      basePoints = -2; // Garbage
    } 
    // Check for Furniture
    else if (cat === 'Housewares' || cat === 'Miscellaneous' || cat === 'Wall-mounted' || cat === 'Ceiling Decor') {
      basePoints = 3;
    }
    // Check for +2 categories
    else if (cat === 'Bugs' || cat === 'Fish' || cat === 'Sea Creatures' || cat === 'Tools' || cat === 'Music' || cat === 'Flowers' || 
             ['Tops', 'Bottoms', 'Dresses', 'Headwear', 'Accessories', 'Socks', 'Shoes', 'Bags', 'Umbrellas'].includes(cat)) {
      basePoints = 2;
    }

    // Convert points to stars
    let stars = 0;
    if (basePoints === -2) stars = 1;
    else if (basePoints === 1) stars = 2;
    else if (basePoints === 2) stars = 3;
    else if (basePoints === 3) stars = 4;

    // Apply value bonus
    // 750 sell price (or 3000 buy price) triggers a return gift in ACNH
    if ((item.sell_price && item.sell_price >= 750) || (item.buy_price && item.buy_price >= 3000)) {
      stars += 1;
    }

    // Cap at 5, min 1
    stars = Math.max(1, Math.min(5, stars));

    // Generate accurate message based on stars
    let message = "";
    const personality = villager.personality || 'Normal';
    
    switch (stars) {
      case 1:
        if (personality === 'Cranky') message = `Bah! A ${item.name}? What am I supposed to do with this garbage?!`;
        else if (personality === 'Snooty') message = `Oh... a ${item.name}. Are you giving me your trash? How... delightful.`;
        else if (personality === 'Jock') message = `Uh, thanks, but this ${item.name} is totally useless for my gains...`;
        else message = `Oh. A ${item.name}. Um... I guess I'll take it. Thank you?`;
        break;
      case 2:
        if (personality === 'Cranky') message = `A ${item.name}? Well, it ain't much, but thanks anyway.`;
        else if (personality === 'Peppy') message = `Oh! A ${item.name}! That's so random, but thanks bestie!`;
        else if (personality === 'Lazy') message = `A ${item.name}? Wow, I didn't have to do anything to get this. Thanks!`;
        else message = `Oh, a ${item.name}. Thank you for the thought!`;
        break;
      case 3:
        if (personality === 'Peppy') message = `Oh my gosh, a ${item.name}! That is so cute! Thanks a million!`;
        else if (personality === 'Smug') message = `Ah, a ${item.name}. You have an exquisite eye for gifts, my friend.`;
        else message = `Wow, a ${item.name}! I really like this. Thank you so much!`;
        break;
      case 4:
        if (personality === 'Jock') message = `Woah, a ${item.name}! This is awesome! Thanks for supporting my training!`;
        else if (personality === 'Sisterly') message = `Hey, you really hit the nail on the head with this ${item.name}! Thanks!`;
        else message = `Oh, I love it! A ${item.name} is exactly what I wanted. Thank you!`;
        break;
      case 5:
        if (personality === 'Lazy') message = `HOORAY! A ${item.name}! This is so amazing! Here, you should have something in return!`;
        else if (personality === 'Snooty') message = `Oh my! A ${item.name}! This is incredibly luxurious. I simply must give you something back!`;
        else message = `Oh my goodness! A ${item.name}! I absolutely love this so much! Wait right here, I have a gift for you too!`;
        break;
    }
    
    return { rating: stars, message };
  }

  function sendGift(item: any) {
    if (!selectedVillager) return;
    
    giftSearchResults = [];
    giftSearchQuery = "";
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

  const allSpecies = $derived(
    [...new Set(allVillagers.map(v => v.species))].sort()
  );

  const islandResidentsList = $derived(
    nookState.residents.map(id => allVillagers.find(v => v.id === id)).filter(Boolean)
  );

  const filteredVillagers = $derived(
    (isAddMode ? allVillagers : myContactsList).filter(v => {
      if (!isAddMode) {
        if (activeTab === 'bestFriend' && !nookState.isBestFriend(v.id)) return false;
        if (activeTab === 'island' && !nookState.isResident(v.id)) return false;
      } else {
        if (!searchQuery && !selectedSpecies && !viewAll) return false;
        if (selectedSpecies && v.species !== selectedSpecies) return false;
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

      const bestFriends = filteredVillagers.filter(v => nookState.isBestFriend(v.id));
      if (bestFriends.length > 0) {
        groups['⭐ Best Friends'] = bestFriends;
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
    nookState.toggleBestFriend(villagerId);
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

  async function messageContact(villager: any) {
    if (nookState.settings.soundEffects) {
      const { playSound } = await import('@/lib/audio');
      playSound('success');
    }
    nookState.activeChatPartner = { id: villager.id, name: villager.name };
    nookState.navigate('messages');
  }

  function toggleSubscription(villager: any) {
    const sublog = `bb/${villager.name.replace(/\s+/g, '')}`;
    nookState.toggleSubscription(sublog);
  }
</script>

<div class="flex flex-col h-full bg-[#fdfcf2] relative">
  {#if selectedVillager}
    {@const ms = nookState.getMilestones(selectedVillager.id)}
    <!-- Detail View -->
    <div class="absolute inset-0 z-30 bg-[#fdfcf2] flex flex-col overflow-y-auto ac-scrollbar animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 bg-[#9cc677] border-b border-black/10 sticky top-0 backdrop-blur-md z-40">
        <button onclick={closeContact} class="flex items-center text-[#5c3a21] font-bold text-sm bg-white/50 px-3 py-1.5 rounded-full shadow-sm hover:bg-white active:scale-95 transition-all cursor-pointer z-10">
          <ChevronLeft class="w-4 h-4 mr-1" /> Back
        </button>
        <span class="absolute left-1/2 -translate-x-1/2 font-black text-lg text-[#5c3a21] tracking-tight pointer-events-none">{selectedVillager.personality} {selectedVillager.species}</span>
        <button onclick={() => toggleVip(selectedVillager.id)} class="text-[#f0b157] bg-white/50 p-2 rounded-full shadow-sm hover:bg-white active:scale-95 transition-all cursor-pointer z-10">
          <Star class="w-5 h-5 {nookState.isBestFriend(selectedVillager.id) ? 'fill-current' : ''}" />
        </button>
      </div>

      <!-- Avatar -->
      <div class="flex flex-col items-center pt-8 pb-4 px-6 bg-gradient-to-b from-[#9cc677]/10 to-transparent">
        <div class="h-32 mb-2 relative group flex items-end justify-center">
          {#if selectedVillager.image_url}
            <img src={selectedVillager.image_url} alt={selectedVillager.name} class="h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
          {:else}
            <div class="w-28 h-28 rounded-full border-4 border-white bg-[#e1d9be] flex items-center justify-center text-4xl">🐾</div>
          {/if}
        </div>
      </div>

      <!-- Dialogue Bubble for Character Type & Sayings -->
      <div class="px-5 mb-6">
        <AcnhBubble
          title={selectedVillager.name}
          dialogText="{selectedVillager.quote ? selectedVillager.quote.replace(/^["'“”]|["'“”]$/g, '').trim() : ''} {selectedVillager.phrase ? selectedVillager.phrase.replace(/^["'“”]|["'“”]$/g, '').trim() : ''}"
          compact={true}
          badgeBg="#9cc677"
          badgeColor="#ffffff"
          class="w-full"
        />
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
          <div class="w-12 h-12 rounded-full bg-[#8b3a3a] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform hover:bg-[#6a2c2c]">
            <MessageSquare class="w-6 h-6 fill-current" />
          </div>
          <span class="text-[10px] font-bold text-[#5c3a21]">Message</span>
        </button>
        <button onclick={() => toggleSubscription(selectedVillager)} class="flex flex-col items-center gap-1 cursor-pointer">
          <div class={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-md active:scale-95 transition-transform ${nookState.isSubscribed('bb/'+selectedVillager.name.replace(/\s+/g, '')) ? 'bg-[#eb6a9d]' : 'bg-[#e1d9be] hover:bg-[#d4ccb1]'}`}>
            <Bookmark class="w-6 h-6 fill-current" />
          </div>
          <span class="text-[10px] font-bold text-[#5c3a21]">{nookState.isSubscribed('bb/'+selectedVillager.name.replace(/\s+/g, '')) ? 'Subscribed' : 'Subscribe'}</span>
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
            <div class="w-10 h-10 rounded-xl bg-[#9cc677]/20 text-[#4a752c] flex items-center justify-center">
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
            <div>
              <p class="text-[10px] font-bold text-[#8a7f66] uppercase">Gender</p>
              <p class="text-sm font-bold text-[#5c3a21]">{selectedVillager.gender || 'Unknown'}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#8a7f66] uppercase">Preferred Outfit</p>
              <p class="text-sm font-bold text-[#5c3a21] capitalize">{selectedVillager.clothing || 'Unknown'}</p>
            </div>
            {#if selectedVillager.url}
              <div class="col-span-2 flex justify-end mt-2">
                <button 
                  onclick={() => nookState.navigate('Nookipedia/' + selectedVillager.url)}
                  class="text-xs font-black text-[#4a752c] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                >
                  View on Nookipedia ↗
                </button>
              </div>
            {/if}
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
              <button onclick={() => toggleMilestone('giftedToday')} class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer {ms.giftedToday ? 'bg-[#6db3e6]/10 border-[#6db3e6] text-[#4a90e2]' : 'bg-gray-50 border-gray-100 text-[#8a7f66]'}">
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
      title={isAddMode ? 'Add Contacts' : activeTab === 'bestFriend' ? 'Best Friend Contacts' : activeTab === 'island' ? 'Island Residents' : 'Contacts'}
      bgClass="bg-[#9cc677]"
      textClass="text-white"
    >
      {#snippet iconSnippet()}
        <div class="w-12 h-12 mr-1">
          <NookIcon name="contacts" class="w-full h-full object-contain drop-shadow-sm" />
        </div>
      {/snippet}
      {#snippet actions()}
        {#if isAddMode}
          <button onclick={() => { isAddMode = false; searchQuery = ''; selectedSpecies = ''; viewAll = false; }} class="text-white font-bold text-sm bg-black/10 px-3 py-1.5 rounded-full hover:bg-black/20 transition-colors cursor-pointer mr-1">
            Done
          </button>
        {:else}
          <NookToolbarButton onclick={() => { isAddMode = true; searchQuery = ''; selectedSpecies = ''; viewAll = false; }} class="mr-1" title="Add Contact">
            <Plus class="w-3.5 h-3.5 stroke-[3px] text-[#4a752c]" />
          </NookToolbarButton>
        {/if}
        <NookToolbarButton onclick={ctx.handleHomeButton} title="Close App">
          <XIcon class="w-3.5 h-3.5 stroke-[3px] text-[#4a752c]" />
        </NookToolbarButton>
      {/snippet}
      
      <div class="relative w-full">
        <Search class="w-4 h-4 text-[#4a752c] absolute left-3 top-3" />
        <input 
          type="text" 
          placeholder="Search villagers..." 
          bind:value={searchQuery}
          class="w-full bg-white/95 pl-9 pr-4 py-2.5 rounded-xl text-sm font-bold border-2 border-transparent focus:outline-none focus:border-white text-[#5c3a21] placeholder:text-[#8a7f66]/60 shadow-inner transition-all"
        />
      </div>
    </NookAppHeader>

    <div class="flex-1 overflow-y-auto ac-scrollbar bg-[#fdfcf2] relative pb-28">
      {#if isLoading}
        <div class="flex flex-col items-center justify-center h-48 text-[#8a7f66]">
          <div class="w-8 h-8 border-4 border-[#9cc677] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="font-bold text-sm">Syncing Contacts...</p>
        </div>
      {:else}
        {#if isAddMode && !searchQuery && !selectedSpecies && !viewAll}
          <div class="p-4 flex flex-col gap-5">
             <button onclick={() => viewAll = true} class="bg-[#9cc677] text-white py-3 px-6 rounded-2xl font-black shadow-sm hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer w-full text-center">
               View All Villagers
             </button>
             
             <div>
               <h3 class="text-[#8a7f66] font-black text-xs uppercase mb-3 tracking-widest text-center">
                 Filter by Species
               </h3>
               <div class="grid grid-cols-5 gap-2">
                 {#each allSpecies as species}
                   <button 
                     onclick={() => selectedSpecies = species}
                     class="species-tile"
                   >
                     <span class="text-3xl leading-none">{SPECIES_EMOJIS[species] || '🐾'}</span>
                     <span class="text-[10px] font-black text-[#8a7f66] leading-tight truncate w-full text-center mt-1">{species}</span>
                   </button>
                 {/each}
               </div>
             </div>
          </div>
        {:else}
          {#if isAddMode && (selectedSpecies || viewAll)}
            <div class="px-4 py-3 bg-[#fdfcf2] flex items-center justify-between border-b border-[#e1d9be]">
              <span class="text-sm font-black text-[#8a7f66] uppercase tracking-wider">
                {viewAll ? 'All Villagers' : selectedSpecies + ' Villagers'}
              </span>
              <button onclick={() => { selectedSpecies = ''; viewAll = false; }} class="text-xs font-bold text-[#ff8a8a] hover:underline cursor-pointer bg-white px-3 py-1 rounded-full border border-[#ff8a8a]/30 shadow-sm">
                Clear Filter
              </button>
            </div>
          {/if}
          {#if !isAddMode && activeTab === 'island'}
            <div class="px-2 sm:px-6 py-6 sm:py-8 h-full flex flex-col items-center justify-center min-h-[450px]">
              <div class="grid grid-cols-3 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-10 w-full max-w-[340px]">
                {#each Array(10) as _, index}
                  {@const villager = islandResidentsList[index]}
                  {#if villager}
                    {@const ms = nookState.getMilestones(villager.id)}
                    <div 
                      draggable="true"
                      ondragstart={(e) => handleDragStart(e, index)}
                      ondragenter={(e) => handleDragEnter(e, index)}
                      ondragover={(e) => e.preventDefault()}
                      ondragleave={() => dragOverIndex === index ? (dragOverIndex = null) : null}
                      ondrop={(e) => handleDrop(e, index)}
                      ondragend={handleDragEnd}
                      class="flex flex-col items-center gap-2 sm:gap-3 relative transition-all duration-200 {index === 9 ? 'col-start-2' : ''} {draggedIndex === index ? 'opacity-30 scale-95' : ''} {dragOverIndex === index ? 'scale-110' : ''}"
                    >
                      <button onclick={() => openContact(villager)} class="flex flex-col items-center w-full transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                        <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-md border-[3px] {dragOverIndex === index ? 'border-[#6cd476] ring-4 ring-[#6cd476]/30' : 'border-[#e1d9be]'} flex items-center justify-center relative p-1.5 transition-all">
                          {#if villager.image_url}
                            <img src={villager.image_url} alt={villager.name} class="w-full h-full object-contain pointer-events-none" loading="lazy" />
                          {:else}
                            <div class="text-3xl sm:text-4xl pointer-events-none">🐾</div>
                          {/if}
                          <div class="absolute -bottom-2 inset-x-0 flex justify-center gap-0.5 sm:gap-1 pointer-events-none">
                            {#if ms.talkedToday}
                              <div class="bg-[#6cd476] w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 sm:border-[3px] border-white flex items-center justify-center text-white shadow-sm" title="Talked Today">
                                <MessageCircle class="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                              </div>
                            {/if}
                            {#if ms.giftedToday}
                              <div class="bg-[#6db3e6] w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 sm:border-[3px] border-white flex items-center justify-center text-white shadow-sm" title="Gifted Today">
                                <Gift class="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                              </div>
                            {/if}
                          </div>
                        </div>
                        <span class="text-xs sm:text-sm font-black text-[#5c3a21] leading-tight text-center w-full truncate px-1 mt-2 sm:mt-3">{villager.name}</span>
                      </button>
                    </div>
                  {:else}
                    <div 
                      ondragenter={(e) => handleDragEnter(e, index)}
                      ondragover={(e) => e.preventDefault()}
                      ondragleave={() => dragOverIndex === index ? (dragOverIndex = null) : null}
                      ondrop={(e) => handleDrop(e, index)}
                      class="flex flex-col items-center gap-2 sm:gap-3 opacity-40 {index === 9 ? 'col-start-2' : ''} transition-all duration-200 {dragOverIndex === index ? 'scale-110 opacity-100' : ''}"
                    >
                      <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-dashed {dragOverIndex === index ? 'border-[#6cd476] bg-[#6cd476]/10 ring-4 ring-[#6cd476]/30' : 'border-[#e1d9be] bg-black/5'} flex items-center justify-center transition-all">
                        <Home class="w-8 h-8 sm:w-10 sm:h-10 {dragOverIndex === index ? 'text-[#6cd476]' : 'text-[#8a7f66]'}" />
                      </div>
                      <span class="text-xs sm:text-sm font-bold {dragOverIndex === index ? 'text-[#6cd476]' : 'text-[#8a7f66]'}">Empty</span>
                    </div>
                  {/if}
                {/each}
              </div>
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
                    <div class="flex flex-col pr-2">
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
                      <div class="flex items-center gap-1 shrink-0">
                        <button
                          onclick={(e) => { e.stopPropagation(); toggleResident(villager.id); }}
                          class="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 cursor-pointer border-0 bg-transparent p-0"
                          title={nookState.isResident(villager.id) ? "Evict Resident" : "Move Resident In"}
                        >
                          <Home class={`w-4 h-4 transition-colors ${nookState.isResident(villager.id) ? 'text-[#6cd476] fill-current' : 'text-[#e1d9be] hover:text-[#6cd476]'}`} />
                        </button>
                        <button
                          onclick={(e) => { e.stopPropagation(); toggleVip(villager.id); }}
                          class="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-90 cursor-pointer border-0 bg-transparent p-0"
                          title={nookState.isBestFriend(villager.id) ? "Remove Best Friend" : "Add Best Friend"}
                        >
                          <Star class={`w-4 h-4 transition-colors ${nookState.isBestFriend(villager.id) ? 'text-[#f0b157] fill-current' : 'text-[#e1d9be] hover:text-[#f0b157]'}`} />
                        </button>
                      </div>
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
              <button onclick={() => { isAddMode = true; searchQuery = ''; selectedSpecies = ''; viewAll = false; }} class="bg-[#9cc677] text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:bg-[#8bb268] transition-colors cursor-pointer active:scale-95">
                Add New Contact
              </button>
            {/if}
          </div>
        {/if}
        {/if}
        {/if}
      {/if}
    </div>

    <!-- Bottom App Navigation -->
    {#if !isAddMode}
      <div class="absolute bottom-6 inset-x-4 bg-white/95 backdrop-blur-md border-2 border-[#e1d9be] rounded-3xl p-1.5 flex justify-between z-20 shadow-lg">
        <button 
          onclick={() => activeTab = 'all'}
          class="flex-1 flex flex-col items-center py-2 rounded-2xl transition-colors cursor-pointer {activeTab === 'all' ? 'bg-[#9cc677]/20 text-[#4a752c]' : 'text-[#8a7f66] hover:bg-gray-50 hover:text-[#5c3a21]'}"
        >
          <Users class="w-5 h-5 mb-0.5 {activeTab === 'all' ? 'fill-current' : ''}" />
          <span class="text-[10px] font-black uppercase tracking-wider">All</span>
        </button>
        <button 
          onclick={() => activeTab = 'island'}
          class="flex-1 flex flex-col items-center py-2 rounded-2xl transition-colors cursor-pointer {activeTab === 'island' ? 'bg-[#6cd476]/20 text-[#4ca454]' : 'text-[#8a7f66] hover:bg-gray-50 hover:text-[#4ca454]'}"
        >
          <Home class="w-5 h-5 mb-0.5 {activeTab === 'island' ? 'fill-current' : ''}" />
          <span class="text-[10px] font-black uppercase tracking-wider">Neighbors ({nookState.residents.length}/10)</span>
        </button>
        <button 
          onclick={() => activeTab = 'bestFriend'}
          class="flex-1 flex flex-col items-center py-2 rounded-2xl transition-colors cursor-pointer {activeTab === 'bestFriend' ? 'bg-[#f0b157]/20 text-[#d99c45]' : 'text-[#8a7f66] hover:bg-gray-50 hover:text-[#d99c45]'}"
        >
          <Star class="w-5 h-5 mb-0.5 {activeTab === 'bestFriend' ? 'fill-current' : ''}" />
          <span class="text-[10px] font-black uppercase tracking-wider">Best Friends</span>
        </button>
      </div>
    {/if}
  {/if}

  {#if isGiftPickerOpen}
    <div class="absolute inset-0 z-50 bg-[#fdfcf2] flex flex-col overflow-hidden animate-fade-in">
      <div class="absolute inset-0 ac-bg-dots opacity-40 z-0 pointer-events-none"></div>

      <!-- Header -->
      <div class="flex items-center justify-between p-4 relative z-40 shrink-0">
        <button onclick={() => isGiftPickerOpen = false} class="flex items-center text-[#5c3a21] font-bold text-sm bg-white/50 px-3 py-1.5 rounded-full shadow-sm hover:bg-white active:scale-95 transition-all cursor-pointer">
          <ChevronLeft class="w-4 h-4 mr-1" /> Cancel
        </button>
        <div class="w-16"></div> <!-- spacer -->
      </div>

      <!-- Character (Centered) -->
      <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none pb-32">
        <div class="h-64 flex items-center justify-center relative animate-ac-float">
          {#if selectedVillager?.image_url}
            <img src={selectedVillager.image_url} alt={selectedVillager.name} class="h-full object-contain drop-shadow-2xl" />
          {:else}
            <div class="text-8xl">🐾</div>
          {/if}
        </div>
      </div>

      <!-- Bubble (Bottom Half) -->
      <div class="relative z-20 w-full px-4 pb-8 shrink-0 mt-auto">
         <AcnhBubble
           title={selectedVillager?.name || "Friend"}
           dialogText={giftReaction ? giftReaction.message : "Oh! Do you have a present for me? What is it, what is it?!"}
           isActive={true}
           class="w-full max-w-lg mx-auto"
         >
           <!-- Only show search/results if we don't have a FINAL rating reaction yet -->
           {#if !giftReaction || giftReaction.rating === 0}
             
             {#if isGiftLoading}
                <div class="mt-4 flex justify-center py-2">
                  <div class="w-6 h-6 border-4 border-[#9cc677] border-t-transparent rounded-full animate-spin"></div>
                </div>
             {:else if giftSearchResults.length > 0}
                <div class="mt-4 border-t border-[#e1d9be]/60 pt-4 animate-fade-in">
                  <div class="flex flex-wrap justify-center gap-2 pb-2">
                    {#each giftSearchResults as item}
                      <button 
                        onclick={() => sendGift(item)}
                        class="w-16 h-16 shrink-0 bg-white border-2 border-[#e1d9be] hover:border-[#9cc677] rounded-xl flex items-center justify-center transition-all hover:scale-105 shadow-sm active:scale-95 p-1 flex-col"
                        title={item.name}
                      >
                        {#if item.imageUrl || item.image_url}
                          <img src={item.imageUrl || item.image_url} alt={item.name} class="max-w-full max-h-full object-contain drop-shadow-sm p-1" loading="lazy" />
                        {:else}
                          <Leaf class="w-6 h-6 text-[#9cc677] mb-1" />
                          <span class="text-[8px] font-bold text-[#8a7f66] leading-tight truncate w-full px-1">{item.name}</span>
                        {/if}
                      </button>
                    {/each}
                  </div>
                  <button onclick={() => giftSearchResults = []} class="mt-2 text-xs font-bold text-[#ff8a8a] hover:underline w-full text-center">
                    Try searching something else
                  </button>
                </div>
             {:else}
               <div class="mt-4 border-t border-[#e1d9be]/60 pt-4 flex flex-col gap-3 animate-fade-in">
                 <div class="flex gap-2">
                   <input 
                     type="text" 
                     placeholder="Search for an item..." 
                     bind:value={giftSearchQuery}
                     onkeydown={(e) => e.key === 'Enter' && handleGiftSearch()}
                     class="flex-1 bg-white px-3 py-2 rounded-xl text-sm font-bold border-2 border-[#e1d9be] focus:outline-none focus:border-[#9cc677] text-[#5c3a21] placeholder:text-[#8a7f66]/60"
                   />
                   <button onclick={handleGiftSearch} class="bg-[#9cc677] text-white px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-[#8bb268] active:scale-95 transition-transform">
                     Search
                   </button>
                 </div>
                 <button onclick={askWhatTheyWant} class="bg-[#f0b157]/20 text-[#d99c45] border-2 border-[#f0b157]/40 px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-[#f0b157]/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
                   <Gift class="w-4 h-4" /> What would you like?
                 </button>
               </div>
             {/if}
             
           {:else}
              <!-- Final Rating -->
              <div class="mt-4 border-t border-[#e1d9be]/60 pt-4 flex flex-col items-center gap-3 animate-fade-in" style="animation-delay: 500ms;">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-[10px] font-black text-[#8a7f66] uppercase tracking-wider">Love Rating</span>
                  <div class="flex gap-0.5">
                    {#each Array(5) as _, i}
                      <svg class="w-5 h-5 transition-all {i < giftReaction.rating ? 'text-[#ff6b6b] fill-current animate-bounce-short' : 'text-gray-300'}" style="animation-delay: {i * 100}ms;" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    {/each}
                  </div>
                </div>
                <button onclick={() => isGiftPickerOpen = false} class="bg-[#9cc677] text-white px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#8bb268] active:scale-95 transition-transform w-full text-center cursor-pointer">
                  You're welcome!
                </button>
              </div>
           {/if}
         </AcnhBubble>
      </div>
    </div>
  {/if}
</div>

<style>
  .species-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 6px 2px;
    background: transparent;
    border: none;
    box-shadow: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .species-tile:hover {
    transform: translateY(-3px) scale(1.12);
  }

  .species-tile:active {
    transform: scale(0.92);
  }
</style>
