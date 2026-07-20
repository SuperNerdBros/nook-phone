<script lang="ts">
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import nookState from '@/lib/nookState.svelte';
  import { Edit2, Save, RefreshCw, Cloud, CloudOff, X as XIcon, Plus as PlusIcon } from '@lucide/svelte';
  import { fetchPassports, linkPassport, isProUser, deletePassport } from '@/lib/api';
  import { onMount } from 'svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import { TITLE_PART_1 as TITLE_PREFIXES, TITLE_PART_2 as TITLE_SUFFIXES } from '@/lib/passportTitles';

  const ctx = getPhoneContext();

  let isEditing = $state(false);

  // Editable local inputs
  let name = $state(nookState.passport.name);
  let islandName = $state(nookState.passport.islandName);
  let dreamAddress = $state(nookState.passport.dreamAddress);
  let titlePrefix = $state(nookState.passport.titlePrefix);
  let titleSuffix = $state(nookState.passport.titleSuffix);
  let comment = $state(nookState.passport.comment);

  let isPro = $state(false);
  let syncing = $state(false);

  onMount(async () => {
    isPro = isProUser();
    if (isPro) {
      const p = await fetchPassports();
      const parsedPassports = p.map(cp => ({
         id: cp.id,
         name: cp.data.name || '',
         islandName: cp.data.islandName || cp.data.islandname || '',
         dreamAddress: cp.data.dreamAddress || cp.data.dreamaddress || '',
         titlePrefix: cp.data.titlePrefix || cp.data.titleprefix || '',
         titleSuffix: cp.data.titleSuffix || cp.data.titlesuffix || '',
         comment: cp.data.comment || '',
         photoUrl: cp.data.photoUrl || cp.data.photourl || 'https://picsum.photos/300'
      }));
      nookState.loadPassports(parsedPassports);
    }
  });

  async function handleSave() {
    const updated = {
      id: nookState.activePassportId,
      name,
      islandName,
      dreamAddress,
      titlePrefix,
      titleSuffix,
      comment,
      photoUrl: nookState.passport.photoUrl
    };

    if (isPro) {
      syncing = true;
      const res = await linkPassport(updated);
      if (res && res.passport_id) {
         updated.id = res.passport_id;
      }
      syncing = false;
    }
    
    nookState.addOrUpdatePassport(updated);
    nookState.setActivePassport(updated.id);
    isEditing = false;
  }

  function handleCreateNew() {
    if (!isPro) {
      alert("You need a PRO account to create and sync multiple passports across devices!");
      return;
    }
    name = '';
    islandName = '';
    dreamAddress = '';
    titlePrefix = TITLE_PREFIXES[0];
    titleSuffix = TITLE_SUFFIXES[0];
    comment = '';
    const randomSeed = Math.floor(Math.random() * 1000);
    const newId = 'new_' + Date.now();
    const newPassport = { 
      id: newId,
      name, islandName, dreamAddress, titlePrefix, titleSuffix, comment,
      photoUrl: `https://picsum.photos/seed/${randomSeed}/300/300` 
    };
    nookState.addOrUpdatePassport(newPassport);
    nookState.setActivePassport(newId);
    isEditing = true;
  }

  let walletPassports = $derived(nookState.passports.map(p => ({
    id: p.id,
    isActive: p.id === nookState.activePassportId,
    data: p
  })));

  function handleRandomizePhoto() {
    const randomSeed = Math.floor(Math.random() * 1000);
    nookState.addOrUpdatePassport({
       ...nookState.passport,
      photoUrl: `https://picsum.photos/seed/${randomSeed}/300/300`
    });
  }

  function handleSelectPassport(id: string | number) {
    nookState.setActivePassport(id);
    const p = nookState.passport;
    name = p.name;
    islandName = p.islandName;
    dreamAddress = p.dreamAddress;
    titlePrefix = p.titlePrefix;
    titleSuffix = p.titleSuffix;
    comment = p.comment;
  }

  async function handleDelete(id: string | number) {
    if (walletPassports.length <= 1) {
      alert("You must have at least one passport!");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this passport?")) {
      return;
    }

    if (isPro && id !== 'local') {
      syncing = true;
      const success = await deletePassport(id);
      syncing = false;
      if (!success) {
        alert("Failed to delete passport from server.");
        return;
      }
    }

    const deleted = nookState.removePassport(id);
    if (deleted) {
      const p = nookState.passport;
      name = p.name;
      islandName = p.islandName;
      dreamAddress = p.dreamAddress;
      titlePrefix = p.titlePrefix;
      titleSuffix = p.titleSuffix;
      comment = p.comment;
      isEditing = false;
    }
  }
</script>

{#snippet passportCard(passport, isActive)}
  <div 
    class="relative w-[95vw] max-w-[95vw] mx-auto shrink-0 snap-center rounded-[2rem] overflow-hidden transition-all duration-300 {isActive ? 'scale-100 shadow-xl' : 'scale-95 opacity-70 hover:opacity-100 cursor-pointer shadow-md'}"
    style="background-color: #eee9dd;"
    onclick={() => !isActive && handleSelectPassport(passport.id)}
  >
    <!-- Outer padding and "PASSPORT" header -->
    <div class="px-5 py-4 flex flex-col h-full relative">
      
      <!-- Top header line -->
      <div class="flex items-center justify-center gap-3 mb-3 text-[#9b968a] font-bold text-[10px] tracking-widest uppercase">
        <div class="h-[1px] w-12 bg-[#9b968a]/50"></div>
        PASSPORT
        <div class="h-[1px] w-12 bg-[#9b968a]/50"></div>
      </div>

      <!-- Inner patterned background -->
      <div class="bg-[#dfdbde] rounded-3xl p-4 flex-1 flex gap-4 relative overflow-hidden shadow-inner border border-white/40">
        <!-- Optional pattern overlay (can be added via CSS if needed, using radial gradients or repeating SVGs) -->
        <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: radial-gradient(circle at 10px 10px, #fff 2px, transparent 0); background-size: 20px 20px;"></div>
        
        <!-- Left Column: Photo & Badge -->
        <div class="flex flex-col items-center relative z-10 w-28 shrink-0">
          <div class="w-24 h-24 rounded-3xl bg-[#fdfaf2] p-1.5 shadow-sm relative overflow-visible">
            <div class="w-full h-full rounded-2xl overflow-hidden relative">
              <img src={passport.data.photoUrl} alt="Passport Pic" class="w-full h-full object-cover" />
            </div>
            
            <!-- Resident Rep Badge -->
            <div class="absolute -bottom-3 -left-3 -right-3 bg-[#fdfaf2] border-[3px] border-[#8a7258] rounded-lg py-1 px-2 text-[#5a4838] text-[9px] font-bold shadow-md flex items-center justify-center gap-1 -rotate-2">
              <div class="w-3 h-3 bg-[#8a7258] text-[#fdfaf2] rounded-sm flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L2 22h20L12 2z"/></svg>
              </div>
              Resident Rep.
            </div>

            {#if isActive && isPro}
              <Cloud class="w-5 h-5 absolute top-1 right-1 text-white bg-[#7cb988] rounded-full p-0.5 shadow-sm border border-white" />
            {/if}
          </div>

          {#if isActive}
            <button onclick={handleRandomizePhoto} class="mt-6 bg-[#8a7258]/10 hover:bg-[#8a7258]/20 text-[#8a7258] p-1.5 rounded-full text-[9px] font-bold transition flex items-center gap-1" title="Randomize photo">
              <RefreshCw class="w-2.5 h-2.5 animate-spin" style="animation-duration: 6s" /> Update Photo
            </button>
          {/if}
        </div>

        <!-- Right Column: Details -->
        <div class="flex flex-col flex-1 relative z-10 mt-1 gap-2.5">
          
          <!-- Comment Bubble -->
          <div class="relative bg-[#fffce0] text-[#5c5643] text-xs font-medium px-3 py-1.5 rounded-2xl shadow-sm self-start inline-block max-w-full">
             {passport.data.comment || '...'}
             <div class="absolute w-3 h-3 bg-[#fffce0] -left-1 top-2.5 rotate-45 transform origin-center shadow-sm -z-10"></div>
             <div class="absolute w-3 h-3 bg-[#fffce0] -left-1 top-2.5 rotate-45 transform origin-center z-10"></div>
          </div>

          <!-- Island & Fruit / Dream Address -->
          <div class="flex items-center gap-2 text-[11px] font-bold text-[#353026] mt-1">
            <span class="flex items-center gap-1"><span class="text-green-600 text-[10px]">🏝️</span> {passport.data.islandName}</span>
          </div>

          <!-- Title -->
          <div class="text-[11px] font-medium text-[#464032]">
            {passport.data.titlePrefix} {passport.data.titleSuffix}
          </div>

          <!-- Name -->
          <div class="text-xl font-black text-[#45311f] leading-none tracking-tight">
            {passport.data.name}
          </div>

          <!-- Dream Address -->
          <div class="flex items-center gap-1.5 text-[10px] font-medium text-[#7a7469] mt-auto">
            <span class="bg-[#b3a8d1] text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold shadow-sm">DA</span>
            {passport.data.dreamAddress || 'DA-XXXX-XXXX-XXXX'}
          </div>

        </div>

        <!-- Watermark / Stamp -->
        <div class="absolute right-[-20px] bottom-[-10px] opacity-20 pointer-events-none scale-150 transform">
           <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="flex justify-between items-center mt-3 px-1 text-[9px] font-bold text-[#a6a093]">
        <div>Reg. NookPhone App</div>
        <div class="tracking-[2px] opacity-70">
          &lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
        </div>
      </div>

      {#if isActive}
        <div class="absolute bottom-2 right-4 flex items-center gap-4 z-20">
          <!-- Edit/Save Button (A Prompt) -->
          <button 
            onclick={(e) => { e.stopPropagation(); isEditing ? handleSave() : isEditing = true; }}
            class="flex items-center gap-1.5 text-[11px] font-black text-[#8a7258] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span class="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-[#8a7258] text-[#fdfaf2] text-[10px] font-extrabold leading-none">A</span>
            <span>{isEditing ? 'Save' : 'Edit'}</span>
          </button>
          
          <!-- Delete Button (Y Prompt) -->
          {#if walletPassports.length > 1}
            <button 
              onclick={(e) => { e.stopPropagation(); handleDelete(passport.id); }}
              class="flex items-center gap-1.5 text-[11px] font-black text-[#ab3b3b] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span class="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-[#ab3b3b] text-white text-[10px] font-extrabold leading-none">Y</span>
              <span>Delete</span>
            </button>
          {/if}
        </div>
      {/if}

    </div>
  </div>
{/snippet}

<div id="passport-app" class="flex flex-col h-full ac-app-screen">
  <NookAppHeader 
    title="Island Passport" 
    subtitle="View and update your residency profile" 
    bgClass="bg-[#7cb988]" 
    textClass="text-[#1c3d24]"
  >
    {#snippet iconSnippet()}
      <div class="w-12 h-12 mr-1">
        <NookIcon name="passport" class="w-full h-full object-contain drop-shadow-sm" />
      </div>
    {/snippet}
    {#snippet actions()}
      {#if isPro}
        <NookToolbarButton onclick={handleCreateNew} title="New Passport">
          <PlusIcon class="w-3.5 h-3.5 stroke-[3px] text-[#1c3d24]" />
        </NookToolbarButton>
      {/if}
      <NookToolbarButton onclick={ctx.handleHomeButton} title="Close App">
        <XIcon class="w-3.5 h-3.5 stroke-[3px] text-[#1c3d24]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>

    <!-- Passport Wallet List -->
    <div class="flex flex-col gap-6 pb-8 pt-4 w-full items-center overflow-y-auto h-full ac-scrollbar">
      {#each walletPassports as wp}
        {@render passportCard(wp, wp.isActive)}
      {/each}
    </div>

    <!-- Edit Form -->
    {#if isEditing}
      <div class="bg-[#f0ece0] rounded-2xl p-4 border border-[#e4dfd0] flex flex-col gap-3 animate-fade-in">
        <h2 class="font-bold text-xs text-gray-500 uppercase tracking-wider mb-1">Update Passport Details</h2>

        <!-- Name -->
        <div class="flex flex-col gap-1">
          <label for="passport-name-input" class="text-xs font-semibold text-gray-600">Resident Name</label>
          <input
            id="passport-name-input"
            type="text"
            bind:value={name}
            class="bg-white p-2 text-sm rounded-xl border border-[#dcd3be] text-[#4c4637] focus:outline-none"
          />
        </div>

        <!-- Island Name -->
        <div class="flex flex-col gap-1">
          <label for="passport-island-input" class="text-xs font-semibold text-gray-600">Island Name</label>
          <input
            id="passport-island-input"
            type="text"
            bind:value={islandName}
            class="bg-white p-2 text-sm rounded-xl border border-[#dcd3be] text-[#4c4637] focus:outline-none"
          />
        </div>

        <!-- Dream Address -->
        <div class="flex flex-col gap-1">
          <label for="passport-fc-input" class="text-xs font-semibold text-gray-600">Dream Address</label>
          <input
            id="passport-fc-input"
            type="text"
            bind:value={dreamAddress}
            class="bg-white p-2 text-sm font-mono rounded-xl border border-[#dcd3be] text-[#4c4637] focus:outline-none"
          />
        </div>

        <!-- Title Selector -->
        <div class="flex flex-col gap-1">
          <label for="passport-title-prefix-select" class="text-xs font-semibold text-gray-600">Passport Title</label>
          <div class="grid grid-cols-2 gap-2">
            <select
              id="passport-title-prefix-select"
              bind:value={titlePrefix}
              class="bg-white p-2 text-sm rounded-xl border border-[#dcd3be] text-[#4c4637]"
            >
              {#each TITLE_PREFIXES as p}
                <option value={p}>{p}</option>
              {/each}
            </select>
            <select
              id="passport-title-suffix-select"
              bind:value={titleSuffix}
              class="bg-white p-2 text-sm rounded-xl border border-[#dcd3be] text-[#4c4637]"
            >
              {#each TITLE_SUFFIXES as s}
                <option value={s}>{s}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Passport Comment -->
        <div class="flex flex-col gap-1">
          <label for="passport-comment-input" class="text-xs font-semibold text-gray-600">Passport Comment</label>
          <textarea
            id="passport-comment-input"
            bind:value={comment}
            rows={2}
            maxlength={80}
            class="bg-white p-2 text-sm rounded-xl border border-[#dcd3be] text-[#4c4637] focus:outline-none resize-none"
          ></textarea>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-2 justify-end mt-2">
          <button
            onclick={() => isEditing = false}
            class="px-4 py-2 bg-gray-300 text-gray-700 font-bold rounded-xl text-xs hover:bg-opacity-90"
          >
            Cancel
          </button>
          <button
            onclick={handleSave}
            class="px-4 py-2 bg-[#7cb988] text-white font-bold rounded-xl text-xs hover:bg-opacity-90"
          >
            Save Details
          </button>
        </div>
      </div>
    {/if}
  </div>
