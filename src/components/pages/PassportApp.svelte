<script lang="ts">
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import nookState from '@/lib/nookState.svelte';
  import { Edit2, Save, RefreshCw, Cloud, CloudOff, X as XIcon, Plus as PlusIcon } from '@lucide/svelte';
  import { fetchPassports, linkPassport, isProUser } from '@/lib/api';
  import { onMount } from 'svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';

  const ctx = getPhoneContext();
  const TITLE_PREFIXES = ["Horizon", "Wild", "Friendly", "Active", "Casual", "Island", "Cozy", "Legendary", "Sassy", "Happy"];
  const TITLE_SUFFIXES = ["Dweller", "Resident", "Explorer", "Hustler", "Nookling", "Leader", "Fanatic", "Pioneer", "Artist"];

  let isEditing = $state(false);

  // Editable local inputs
  let name = $state(nookState.passport.name);
  let islandName = $state(nookState.passport.islandName);
  let friendCode = $state(nookState.passport.friendCode);
  let titlePrefix = $state(nookState.passport.titlePrefix);
  let titleSuffix = $state(nookState.passport.titleSuffix);
  let comment = $state(nookState.passport.comment);

  let cloudPassports: any[] = $state([]);
  let isPro = $state(false);
  let syncing = $state(false);

  onMount(async () => {
    isPro = isProUser();
    if (isPro) {
      cloudPassports = await fetchPassports();
    }
  });

  async function handleSave() {
    nookState.updatePassport({
      name,
      islandName,
      friendCode,
      titlePrefix,
      titleSuffix,
      comment
    });
    
    if (isPro) {
      syncing = true;
      const res = await linkPassport(nookState.passport);
      if (res && res.passport_id) {
        nookState.updatePassport({ id: res.passport_id });
      }
      cloudPassports = await fetchPassports();
      syncing = false;
    }

    isEditing = false;
  }

  let activePassportId = $state<string | number>('local');

  function handleCreateNew() {
    if (!isPro) {
      alert("You need a PRO account to create and sync multiple passports across devices!");
      return;
    }
    name = '';
    islandName = '';
    friendCode = '';
    titlePrefix = TITLE_PREFIXES[0];
    titleSuffix = TITLE_SUFFIXES[0];
    comment = '';
    const randomSeed = Math.floor(Math.random() * 1000);
    nookState.updatePassport({ 
      id: undefined, 
      photoUrl: `https://picsum.photos/seed/${randomSeed}/300/300` 
    });
    activePassportId = 'new';
    isEditing = true;
  }

  let walletPassports = $derived.by(() => {
    const passports = [];
    const active = nookState.passport;
    passports.push({
      id: active.id || 'local',
      isActive: true,
      data: { ...active }
    });
    
    for (const cp of cloudPassports) {
      if (cp.id !== active.id) {
        passports.push({
          id: cp.id,
          isActive: false,
          data: {
             name: cp.data.name,
             islandName: cp.data.islandName,
             friendCode: cp.data.friendCode,
             titlePrefix: cp.data.titlePrefix,
             titleSuffix: cp.data.titleSuffix,
             comment: cp.data.comment,
             photoUrl: cp.data.photoUrl || 'https://picsum.photos/300'
          }
        });
      }
    }
    return passports;
  });

  function handleRandomizePhoto() {
    const randomSeed = Math.floor(Math.random() * 1000);
    nookState.updatePassport({
      photoUrl: `https://picsum.photos/seed/${randomSeed}/300/300`
    });
  }

  function handleSelectPassport(id: string | number) {
    if (id === 'local') {
      // Reload local maybe? But we already overwrote nookState.passport when we loaded a cloud one.
      // Wait, let's just make the UI switch the active ID and load it.
    }
    
    activePassportId = id;

    if (id !== 'local' && id !== 'new') {
      const selected = cloudPassports.find(p => p.id === id || p.id.toString() === id.toString());
      if (selected && selected.data) {
        nookState.updatePassport({
          id: selected.id,
          name: selected.data.name,
          islandName: selected.data.islandName,
          friendCode: selected.data.friendCode,
          titlePrefix: selected.data.titlePrefix,
          titleSuffix: selected.data.titleSuffix,
          comment: selected.data.comment,
          photoUrl: selected.data.photoUrl || nookState.passport.photoUrl
        });
        name = nookState.passport.name;
        islandName = nookState.passport.islandName;
        friendCode = nookState.passport.friendCode;
        titlePrefix = nookState.passport.titlePrefix;
        titleSuffix = nookState.passport.titleSuffix;
        comment = nookState.passport.comment;
      }
    }
  }

  // ... (skip to HTML)
</script>

{#snippet passportCard(passport, isActive)}
  <div class="bg-[#fbf9f0] border-4 {isActive ? 'border-[#7cb988] shadow-lg scale-100' : 'border-[#edd8aa] shadow-sm scale-95 opacity-80 hover:opacity-100 cursor-pointer'} rounded-3xl p-4 relative overflow-hidden flex flex-col gap-3 transition-all duration-300 w-full max-w-[320px] mx-auto shrink-0 snap-center" onclick={() => !isActive && handleSelectPassport(passport.id)}>
    
    {#if !isActive}
      <div class="absolute inset-0 bg-white/20 z-10 flex items-center justify-center backdrop-blur-[1px] opacity-0 hover:opacity-100 transition-opacity">
        <span class="bg-[#7cb988] text-white font-bold px-4 py-2 rounded-full text-xs shadow-md">Select Passport</span>
      </div>
    {/if}

    <!-- Passport Watermark/Stamp Graphic -->
    <div class="absolute right-4 top-4 text-emerald-100/60 font-bold rotate-12 select-none text-4xl border-4 border-dashed border-emerald-100/50 p-2 rounded-2xl pointer-events-none">
      NOOK INC
    </div>

    <div class="flex gap-4 relative z-0">
      <!-- Passport Photo Slot -->
      <div class="flex flex-col items-center gap-2">
        <div class="w-24 h-24 bg-gray-200 border-4 {isActive ? 'border-[#7cb988]' : 'border-[#edd8aa]'} rounded-2xl overflow-hidden relative group shadow-inner">
          <img
            src={passport.data.photoUrl}
            alt="Passport Pic"
            class="w-full h-full object-cover"
          />
          {#if isActive && isPro}
            <Cloud class="w-5 h-5 absolute bottom-1 right-1 text-[#7cb988] bg-white rounded-full p-0.5 shadow-sm" />
          {/if}
        </div>
        {#if isActive}
          <button
            onclick={handleRandomizePhoto}
            class="bg-[#edd8aa]/50 text-[#715c34] hover:bg-[#edd8aa]/70 p-1.5 rounded-full text-[10px] font-bold transition flex items-center gap-1"
            title="Randomize photo"
          >
            <RefreshCw class="w-3 h-3 animate-spin" style="animation-duration: 6s" /> Photo
          </button>
        {/if}
      </div>

      <!-- Passport Details -->
      <div class="flex-1 flex flex-col gap-1.5 text-xs text-[#5c5446]">
        <div>
          <span class="text-[10px] uppercase font-bold tracking-wider text-gray-400">Title</span>
          <p class="font-bold text-[#7cb988] text-sm leading-tight">
            ✨ {passport.data.titlePrefix} {passport.data.titleSuffix}
          </p>
        </div>

        <div>
          <span class="text-[10px] uppercase font-bold tracking-wider text-gray-400">Name</span>
          <p class="font-bold text-[#6a5e4a] text-sm">{passport.data.name}</p>
        </div>

        <div>
          <span class="text-[10px] uppercase font-bold tracking-wider text-gray-400">Island</span>
          <p class="font-bold text-[#6a5e4a] text-sm">🏝️ {passport.data.islandName}</p>
        </div>

        <div>
          <span class="text-[10px] uppercase font-bold tracking-wider text-gray-400">Friend Code</span>
          <p class="font-mono text-[#6a5e4a]">{passport.data.friendCode}</p>
        </div>
      </div>
    </div>

    <!-- Comment Bubble -->
    <div class="bg-white border-2 {isActive ? 'border-[#7cb988]/40' : 'border-[#edd8aa]/70'} rounded-2xl p-2.5 text-xs text-gray-600 mt-1 shadow-inner relative italic z-0">
      &ldquo;{passport.data.comment}&rdquo;
      <span class="absolute right-2 bottom-1.5 text-[9px] text-[#caa253] not-italic font-bold">COMMENT</span>
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
      <NookToolbarButton 
        onclick={isEditing ? handleSave : () => isEditing = true}
        title={isEditing ? "Save" : "Edit"}
      >
        {#if isEditing}
          <Save class="w-3.5 h-3.5 stroke-[3px] text-[#1c3d24]" />
        {:else}
          <Edit2 class="w-3.5 h-3.5 stroke-[3px] text-[#1c3d24]" />
        {/if}
      </NookToolbarButton>
      <NookToolbarButton onclick={ctx.handleHomeButton} title="Close App">
        <XIcon class="w-3.5 h-3.5 stroke-[3px] text-[#1c3d24]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>

    <!-- Passport Wallet Carousel -->
    <div class="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 pt-2 -mx-4 px-4 ac-scrollbar items-center">
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

        <!-- Friend Code -->
        <div class="flex flex-col gap-1">
          <label for="passport-fc-input" class="text-xs font-semibold text-gray-600">Friend Code</label>
          <input
            id="passport-fc-input"
            type="text"
            bind:value={friendCode}
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
