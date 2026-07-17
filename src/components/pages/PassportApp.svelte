<script lang="ts">
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import nookState from '@/lib/nookState.svelte';
  import { Edit2, Save, RefreshCw, Cloud, CloudOff, X as XIcon } from '@lucide/svelte';
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
      await linkPassport(nookState.passport);
      cloudPassports = await fetchPassports();
      syncing = false;
    }

    isEditing = false;
  }

  function handleSelectPassport(e: Event) {
    const selectedId = (e.target as HTMLSelectElement).value;
    
    if (selectedId === 'upgrade') {
      alert("You need a PRO account to create and sync multiple passports across devices!");
      (e.target as HTMLSelectElement).value = ''; // reset selection
      return;
    }
    
    if (selectedId === 'new') {
      // Logic for creating new cloud passport could go here
      return;
    }
    
    if (selectedId === 'local' || selectedId === '') return;

    const selected = cloudPassports.find(p => p.id.toString() === selectedId);
    if (selected && selected.data) {
      nookState.updatePassport({
        name: selected.data.name,
        islandName: selected.data.islandName,
        friendCode: selected.data.friendCode,
        titlePrefix: selected.data.titlePrefix,
        titleSuffix: selected.data.titleSuffix,
        comment: selected.data.comment,
        photoUrl: selected.data.photoUrl || nookState.passport.photoUrl
      });
      // Update local state bound vars
      name = nookState.passport.name;
      islandName = nookState.passport.islandName;
      friendCode = nookState.passport.friendCode;
      titlePrefix = nookState.passport.titlePrefix;
      titleSuffix = nookState.passport.titleSuffix;
      comment = nookState.passport.comment;
    }
  }

  function handleRandomizePhoto() {
    const randomSeed = Math.floor(Math.random() * 1000);
    nookState.updatePassport({
      photoUrl: `https://picsum.photos/seed/${randomSeed}/300/300`
    });
  }
</script>

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
      <button
        onclick={isEditing ? handleSave : () => isEditing = true}
        class="bg-white text-[#1c3d24] px-3 py-1.5 rounded-full text-xs font-bold hover:bg-opacity-90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer mr-1"
      >
        {#if isEditing}
          <Save class="w-3.5 h-3.5" /> Save
        {:else}
          <Edit2 class="w-3.5 h-3.5" /> Edit
        {/if}
      </button>
      <NookToolbarButton onclick={ctx.handleHomeButton} title="Close App">
        <XIcon class="w-3.5 h-3.5 stroke-[3px] text-[#1c3d24]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>

  <div class="flex-1 overflow-y-auto p-4 ac-scrollbar flex flex-col gap-4">
    <div class="bg-white p-3 rounded-2xl shadow-sm border-2 border-[#7cb988] flex flex-col gap-2 text-xs">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-1.5 text-[#1c3d24] font-bold">
          {#if isPro}
            <Cloud class="w-4 h-4 text-[#7cb988]" /> 
          {:else}
            <CloudOff class="w-4 h-4 text-gray-400" />
          {/if}
          {#if syncing}Syncing...{:else}Passports{/if}
        </div>
        <select class="flex-1 bg-[#fbf9f0] border-2 border-[#edd8aa] rounded-xl p-1.5 text-[#5c5446] font-bold outline-none" onchange={handleSelectPassport}>
          <option value="">Switch Passport...</option>
          <option value="local">Current Local Passport</option>
          {#each cloudPassports as cp}
            <option value={cp.id}>{cp.title}</option>
          {/each}
          {#if isPro}
            <option value="new">+ New Cloud Passport</option>
          {:else}
            <option value="upgrade">+ New Passport (PRO)</option>
          {/if}
        </select>
      </div>
      {#if !isPro}
        <p class="text-[9px] text-gray-400 font-bold text-center mt-1">Upgrade to PRO to save and sync multiple passports across devices.</p>
      {/if}
    </div>

    <!-- Physical Passport Card Mockup -->
    <div class="bg-[#fbf9f0] border-4 border-[#edd8aa] rounded-3xl p-4 shadow-sm relative overflow-hidden flex flex-col gap-3">
      <!-- Passport Watermark/Stamp Graphic -->
      <div class="absolute right-4 top-4 text-emerald-100/60 font-bold rotate-12 select-none text-4xl border-4 border-dashed border-emerald-100/50 p-2 rounded-2xl">
        NOOK INC
      </div>

      <div class="flex gap-4">
        <!-- Passport Photo Slot -->
        <div class="flex flex-col items-center gap-2">
          <div class="w-24 h-24 bg-gray-200 border-4 border-[#edd8aa] rounded-2xl overflow-hidden relative group shadow-inner">
            <img
              src={nookState.passport.photoUrl}
              alt="Passport Pic"
              class="w-full h-full object-cover"
            />
          </div>
          <button
            onclick={handleRandomizePhoto}
            class="bg-[#edd8aa]/50 text-[#715c34] hover:bg-[#edd8aa]/70 p-1.5 rounded-full text-[10px] font-bold transition flex items-center gap-1"
            title="Randomize photo"
          >
            <RefreshCw class="w-3 h-3 animate-spin" style="animation-duration: 6s" /> Photo
          </button>
        </div>

        <!-- Passport Details -->
        <div class="flex-1 flex flex-col gap-1.5 text-xs text-[#5c5446]">
          <div>
            <span class="text-[10px] uppercase font-bold tracking-wider text-gray-400">Title</span>
            <p class="font-bold text-[#7cb988] text-sm leading-tight">
              ✨ {nookState.passport.titlePrefix} {nookState.passport.titleSuffix}
            </p>
          </div>

          <div>
            <span class="text-[10px] uppercase font-bold tracking-wider text-gray-400">Name</span>
            <p class="font-bold text-[#6a5e4a] text-sm">{nookState.passport.name}</p>
          </div>

          <div>
            <span class="text-[10px] uppercase font-bold tracking-wider text-gray-400">Island</span>
            <p class="font-bold text-[#6a5e4a] text-sm">🏝️ {nookState.passport.islandName}</p>
          </div>

          <div>
            <span class="text-[10px] uppercase font-bold tracking-wider text-gray-400">Friend Code</span>
            <p class="font-mono text-[#6a5e4a]">{nookState.passport.friendCode}</p>
          </div>
        </div>
      </div>

      <!-- Comment Bubble -->
      <div class="bg-white border-2 border-[#edd8aa]/70 rounded-2xl p-2.5 text-xs text-gray-600 mt-1 shadow-inner relative italic">
        &ldquo;{nookState.passport.comment}&rdquo;
        <span class="absolute right-2 bottom-1.5 text-[9px] text-[#caa253] not-italic font-bold">COMMENT</span>
      </div>
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
</div>
