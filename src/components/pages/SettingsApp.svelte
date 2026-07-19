<script lang="ts">
  import { Settings, Clock, Battery, Accessibility, Volume2, ChevronLeft, Image as ImageIcon, PaintBucket, Search, Smartphone, Info, LayoutList, ChevronDown , X } from '@lucide/svelte';
  import { fly } from 'svelte/transition';
  import nookState from "@/lib/nookState.svelte";
  import { ALL_WALLPAPERS } from "@/lib/wallpaperData";
  import { getPhoneContext } from "../organisms/phoneContext.svelte";
  import { resolveAssetUrl } from "@/lib/utils";
  import NookIcon from "../atoms/NookIcon.svelte";
  import NookAppHeader from "../organisms/NookAppHeader.svelte";
  import NookToolbarButton from "../molecules/NookToolbarButton.svelte";
  import settingsIcon from "@/assets/img/icons/settings_icon.png";

  const ctx = getPhoneContext();
  const phone = getPhoneContext();

  const toggle24Hour = () => nookState.updateSettings({ use24HourTime: !nookState.settings.use24HourTime });
  const toggleBattery = () => nookState.updateSettings({ showBatteryPercentage: !nookState.settings.showBatteryPercentage });
  const toggleMotion = () => nookState.updateSettings({ reduceMotion: !nookState.settings.reduceMotion });
  const toggleSound = () => nookState.updateSettings({ soundEffects: !nookState.settings.soundEffects });

  const setWallpaper = (id: string) => {
    nookState.activeWallpaperId = id;
    nookState.save();
  };

  let currentView = $derived(nookState.subRoute || 'main');
  let searchQuery = $state('');
  let activeWallpaperTab = $state('official');

  const officialWallpaperIds = new Set([
    'classic',
    'default',
    'green-waves',
    'green-waves-2',
    'green-waves-3',
    'green-waves-3-dark',
    'seashells',
    'fossils',
    'fossils-dark',
    'doodles-1',
    'balloons',
    'balloons-dark',
    'fruits',
    'fruits-subtle',
    'fruits-dark',

  ]);

  const fakeArtWallpaperIds = new Set([
    'cozy-campsite',
    'celeste-starry-sky',
    'museum-exhibits',
    'villagers-gathering',
    'island-map-blueprint',
    'island-sunset',
    'autumn-leaves',
    'cherry-blossom',
    'winter-snowflake',
    'brewster-cafe',
    'kk-slider-records',
  ]);

  const officialWallpapers = Array.from(officialWallpaperIds)
    .map(id => ALL_WALLPAPERS.find(wp => wp.id === id))
    .filter((wp): wp is any => wp !== undefined);

  const fakeArtWallpapers = Array.from(fakeArtWallpaperIds)
    .map(id => ALL_WALLPAPERS.find(wp => wp.id === id))
    .filter((wp): wp is any => wp !== undefined);

  const patternWallpapers = ALL_WALLPAPERS.filter(wp => !officialWallpaperIds.has(wp.id) && !fakeArtWallpaperIds.has(wp.id));

  const categories = [
    { id: 'personalization', name: 'Wallpaper & Style', description: 'Wallpapers, custom designs', icon: ImageIcon, color: 'bg-[#fdafb2]' },
    { id: 'device', name: 'Device Preferences', description: 'Time format, battery, sounds, motion, grid size', icon: Smartphone, color: 'bg-[#7cb988]' },
    { id: 'apps', name: 'Default Apps', description: 'Choose default apps for actions', icon: LayoutList, color: 'bg-[#ebd478]' },
    { id: 'about', name: 'About NookOS', description: 'Version info, legal, privacy', icon: Info, color: 'bg-[#75cfbe]' },
  ];

  const INTENT_CATEGORIES = [
    { id: 'miles', name: 'Nook Miles', icon: 'miles', filter: (app: any) => app.id === 'miles' || app.name?.toLowerCase().includes('miles') || app.information?.includes('gameplay') },
    { id: 'critter', name: 'Critterpedia', icon: 'critter', filter: (app: any) => app.id === 'critter' || app.information?.includes('critters') },
    { id: 'shopping', name: 'Nook Shopping', icon: 'shopping', filter: (app: any) => app.id === 'shopping' || app.information?.includes('items') || app.tools?.includes('marketplace') },
    { id: 'diy', name: 'DIY Recipes', icon: 'diy', filter: (app: any) => app.id === 'diy' || app.information?.includes('items') },
    { id: 'map', name: 'Island Map', icon: 'map', filter: (app: any) => app.id === 'map' },
    { id: 'designer', name: 'Island Designer', icon: 'designer', filter: (app: any) => app.id === 'designer' || app.tools?.includes('simulator') },
    { id: 'chat', name: 'Bulletin Board', icon: 'chat', filter: (app: any) => app.id === 'chat' },
  ];

  const getEligibleApps = (intentId: string) => {
    const category = INTENT_CATEGORIES.find(c => c.id === intentId);
    if (!category) return [];
    return phone.allApps.filter(app => category.filter(app));
  };
</script>

<div class="h-full flex flex-col font-['Varela_Round',sans-serif] nook-settings-bg">
  <!-- Top Bar (Chrome OS style but AC themed) -->
  <NookAppHeader
    title="Settings"
    subtitle="Customize your NookPhone experience"
    bgClass="bg-[#5c4a3d] border-b-4 border-[#4a3b31]"
    textClass="text-white"
  >
    {#snippet iconSnippet()}
      <img src={resolveAssetUrl(settingsIcon)} alt="Settings" class="w-16 h-16 object-contain drop-shadow-md rounded-[1.2rem]" />
    {/snippet}
    
    {#snippet actions()}
      {#if currentView !== 'main'}
        <NookToolbarButton onclick={async () => {
          if (nookState.settings.soundEffects) {
            const { playSound } = await import('@/lib/audio');
            playSound('thwip');
          }
          nookState.navigate('settings');
        }} title="Back">
          <ChevronLeft class="w-4 h-4 stroke-[3px] text-[#5c3a21]" />
        </NookToolbarButton>
      {/if}
      <div class="relative w-40 sm:w-48 hidden sm:block mx-1">
        <Search class="w-3.5 h-3.5 absolute left-3 top-2 text-[#5c3a21]/50" />
        <input 
          type="text" 
          bind:value={searchQuery}
          placeholder="Search settings" 
          class="w-full bg-white/40 border-2 border-[#d99c45] rounded-full py-1.5 pl-8 pr-3 text-[11px] font-bold text-[#5c3a21] placeholder:text-[#5c3a21]/50 focus:outline-none focus:bg-white focus:border-[#5c3a21]"
        />
      </div>
      <NookToolbarButton onclick={ctx.handleHomeButton} title="Close App">
        <X class="w-3.5 h-3.5 stroke-[3px] text-[#5c3a21]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>

  <div class="flex flex-1 overflow-hidden relative bg-transparent">
    <!-- Main Settings List -->
    {#if currentView === 'main'}
      <div class="flex-1 overflow-y-auto ac-scrollbar flex flex-col pt-4 pb-12 px-4 gap-3 w-full h-full absolute inset-0" in:fly={{ x: -20, duration: 250 }} out:fly={{ x: -20, duration: 250 }}>
        {#each categories as cat}
          <button 
            onclick={() => nookState.navigate('settings/' + cat.id)}
            class="flex items-center gap-4 px-4 py-4 bg-white rounded-[1.5rem] border-b-4 border-[#e1d9be] cursor-pointer hover:bg-[#faf9f5] active:translate-y-1 active:border-b-0 transition-all w-full text-left shadow-[0_4px_10px_rgba(0,0,0,0.02)]"
          >
            <div class={`w-10 h-10 rounded-full ${cat.color} flex items-center justify-center text-[#5c3a21] shrink-0 shadow-sm`}>
              <cat.icon class="w-5 h-5" />
            </div>
            <div class="flex flex-col">
              <span class="text-sm text-gray-800 font-medium">{cat.name}</span>
              <span class="text-[11px] text-gray-500">{cat.description}</span>
            </div>
          </button>
        {/each}
      </div>
    {:else}
      <!-- Subpages Area -->
      <div class="flex-1 overflow-y-auto ac-scrollbar p-4 sm:p-6 bg-transparent shadow-inner w-full h-full absolute inset-0" in:fly={{ x: 20, duration: 250 }} out:fly={{ x: 20, duration: 250 }}>
        <div class="max-w-3xl mx-auto flex flex-col gap-6">
        
        {#if currentView === 'personalization'}
          <!-- Personalization -->
          <div class="flex flex-col gap-4 animate-fade-in pb-20">
            <h2 class="text-lg font-black text-[#5c5446] border-b-4 border-[#e1d9be] pb-2 m-0">Wallpaper & Style</h2>
            
            <!-- Category Tabs -->
            <div class="flex gap-2 p-1 bg-[#4a2e19]/10 rounded-full border-2 border-[#e1d9be]/30 self-center my-2 shrink-0">
              <button 
                onclick={() => activeWallpaperTab = 'official'}
                class={`px-4 py-1.5 rounded-full text-xs font-black transition-all border cursor-pointer ${activeWallpaperTab === 'official' ? 'bg-[#ebd478] text-[#5c3a21] border-[#cfb85c] shadow-sm' : 'bg-transparent text-[#5c5446] border-transparent hover:bg-white/30'}`}
              >
                Official
              </button>
              <button 
                onclick={() => activeWallpaperTab = 'fake_art'}
                class={`px-4 py-1.5 rounded-full text-xs font-black transition-all border cursor-pointer ${activeWallpaperTab === 'fake_art' ? 'bg-[#ebd478] text-[#5c3a21] border-[#cfb85c] shadow-sm' : 'bg-transparent text-[#5c5446] border-transparent hover:bg-white/30'}`}
              >
                Fake Art
              </button>
              <button 
                onclick={() => activeWallpaperTab = 'patterns'}
                class={`px-4 py-1.5 rounded-full text-xs font-black transition-all border cursor-pointer ${activeWallpaperTab === 'patterns' ? 'bg-[#ebd478] text-[#5c3a21] border-[#cfb85c] shadow-sm' : 'bg-transparent text-[#5c5446] border-transparent hover:bg-white/30'}`}
              >
                Patterns
              </button>
            </div>

            <div class="flex flex-wrap justify-center gap-4 pb-6 px-1">
              {#each (activeWallpaperTab === 'official' ? officialWallpapers : activeWallpaperTab === 'patterns' ? patternWallpapers : fakeArtWallpapers) as wp}
                <button 
                  onclick={() => setWallpaper(wp.id)}
                  class={`flex flex-col items-center gap-2 bg-transparent border-0 p-0 cursor-pointer group w-[30%] sm:w-32 ${nookState.activeWallpaperId === wp.id || (!nookState.activeWallpaperId && wp.id === 'default') ? 'opacity-100 scale-105' : 'opacity-70 hover:opacity-100 hover:scale-105'} transition-all`}
                >
                  <div class={`w-full aspect-[9/16] rounded-2xl border-4 shadow-sm relative overflow-hidden transition-all ${nookState.activeWallpaperId === wp.id || (!nookState.activeWallpaperId && wp.id === 'default') ? 'border-[#6cd476] ring-4 ring-[#6cd476]/30' : 'border-[#e1d9be]'}`}>
                    {#if wp.isDefault}
                      <div class={`absolute inset-0 ${wp.bg}`}></div>
                      <div class={`absolute inset-0 opacity-40 ${wp.patternClass}`} style={`mask-image: url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 5l5 10h10l-8 7 3 10-10-6-10 6 3-10-8-7h10z%22/%3E%3C/svg%3E'); -webkit-mask-image: url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 5l5 10h10l-8 7 3 10-10-6-10 6 3-10-8-7h10z%22/%3E%3C/svg%3E'); mask-size: 20px 20px; -webkit-mask-size: 20px 20px;`}></div>
                    {:else}
                      <img src={wp.url} alt={wp.name} class="absolute inset-0 w-full h-full object-cover" />
                    {/if}
                    
                    {#if nookState.activeWallpaperId === wp.id || (!nookState.activeWallpaperId && wp.id === 'default')}
                      <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-[#6cd476] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                        <div class="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    {/if}
                  </div>
                  <span class="text-[10px] sm:text-[11px] font-black text-[#5c5446] text-center leading-tight">{wp.name}</span>
                </button>
              {/each}
              
              {#if activeWallpaperTab === 'patterns'}
                <button 
                  onclick={async () => {
                    if (nookState.settings.soundEffects) {
                      const { playSound } = await import('@/lib/audio');
                      playSound('success');
                    }
                    nookState.navigate('designs');
                  }}
                  class="flex flex-col items-center gap-2 bg-transparent border-0 p-0 cursor-pointer group w-[30%] sm:w-32 opacity-70 hover:opacity-100 hover:scale-105 transition-all"
                >
                  <div class="w-full aspect-[9/16] rounded-2xl border-4 border-dashed border-[#e1d9be] shadow-sm flex items-center justify-center bg-[#fdfcf9] text-[#caa253]">
                    <PaintBucket class="w-6 h-6" />
                  </div>
                  <span class="text-[10px] sm:text-[11px] font-black text-[#5c5446] text-center leading-tight">Custom<br/>Design</span>
                </button>
              {/if}
            </div>
          </div>
        {/if}

        {#if currentView === 'device'}
          <!-- Device Settings -->
          <div class="flex flex-col gap-4 animate-fade-in">
            <h2 class="text-lg font-black text-[#5c5446] border-b-4 border-[#e1d9be] pb-2 m-0">Device Preferences</h2>
            
            <div class="bg-white rounded-3xl p-5 border-4 border-[#e1d9be] shadow-[0_4px_0_#dcd3be] flex flex-col gap-2">
              <div class="flex items-center justify-between py-3 border-b-2 border-dashed border-[#f4f2e8]">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-2xl bg-[#77a1e6] border-2 border-[#5b85ca] flex items-center justify-center text-[#5c3a21] shadow-inner">
                    <Clock class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="font-black text-[#5c5446] text-sm">24-Hour Time</div>
                    <div class="text-[10px] font-bold text-[#8a816f]">Use military time format</div>
                  </div>
                </div>
                <button 
                  aria-label="Toggle 24-hour time"
                  onclick={toggle24Hour}
                  class={`w-14 h-8 rounded-full p-1.5 transition-colors cursor-pointer border-2 shadow-inner flex items-center ${nookState.settings.use24HourTime ? 'bg-[#6cd476] border-[#4ca454]' : 'bg-[#e1d9be] border-[#dcd3be]'}`}
                >
                  <div class={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${nookState.settings.use24HourTime ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div class="flex items-center justify-between py-3 border-b-2 border-dashed border-[#f4f2e8]">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-2xl bg-[#7cb988] border-2 border-[#609d6c] flex items-center justify-center text-[#5c3a21] shadow-inner">
                    <Battery class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="font-black text-[#5c5446] text-sm">Battery Percentage</div>
                    <div class="text-[10px] font-bold text-[#8a816f]">Show exact battery level</div>
                  </div>
                </div>
                <button 
                  aria-label="Toggle battery percentage"
                  onclick={toggleBattery}
                  class={`w-14 h-8 rounded-full p-1.5 transition-colors cursor-pointer border-2 shadow-inner flex items-center ${nookState.settings.showBatteryPercentage ? 'bg-[#6cd476] border-[#4ca454]' : 'bg-[#e1d9be] border-[#dcd3be]'}`}
                >
                  <div class={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${nookState.settings.showBatteryPercentage ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div class="flex items-center justify-between py-3 border-b-2 border-dashed border-[#f4f2e8]">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-2xl bg-[#fdafb2] border-2 border-[#e19396] flex items-center justify-center text-[#5c3a21] shadow-inner">
                    <Accessibility class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="font-black text-[#5c5446] text-sm">Reduce Motion</div>
                    <div class="text-[10px] font-bold text-[#8a816f]">Minimize OS animations</div>
                  </div>
                </div>
                <button 
                  aria-label="Toggle reduce motion"
                  onclick={toggleMotion}
                  class={`w-14 h-8 rounded-full p-1.5 transition-colors cursor-pointer border-2 shadow-inner flex items-center ${nookState.settings.reduceMotion ? 'bg-[#6cd476] border-[#4ca454]' : 'bg-[#e1d9be] border-[#dcd3be]'}`}
                >
                  <div class={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${nookState.settings.reduceMotion ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div class="flex items-center justify-between py-3 border-b-2 border-dashed border-[#f4f2e8]">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-2xl bg-[#e89a78] border-2 border-[#cc7d5c] flex items-center justify-center text-[#5c3a21] shadow-inner">
                    <Volume2 class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="font-black text-[#5c5446] text-sm">Sound Effects</div>
                    <div class="text-[10px] font-bold text-[#8a816f]">Play sounds for interactions</div>
                  </div>
                </div>
                <button 
                  aria-label="Toggle sound effects"
                  onclick={toggleSound}
                  class={`w-14 h-8 rounded-full p-1.5 transition-colors cursor-pointer border-2 shadow-inner flex items-center ${nookState.settings.soundEffects ? 'bg-[#6cd476] border-[#4ca454]' : 'bg-[#e1d9be] border-[#dcd3be]'}`}
                >
                  <div class={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${nookState.settings.soundEffects ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div class="flex items-center justify-between py-3">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-2xl bg-[#ebd478] border-2 border-[#cfb85c] flex items-center justify-center text-[#5c3a21] shadow-inner">
                    <Smartphone class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="font-black text-[#5c5446] text-sm">App Grid Size</div>
                    <div class="text-[10px] font-bold text-[#8a816f]">Columns on homescreen ({nookState.settings.gridSize || 3})</div>
                  </div>
                </div>
                <div class="flex items-center gap-2 bg-[#f4f2e8] p-1 rounded-full border-2 border-[#e1d9be]">
                  {#each [3, 4, 5] as size}
                    <button
                      onclick={() => nookState.updateSettings({ gridSize: size })}
                      class={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors cursor-pointer border-0 shadow-sm ${nookState.settings.gridSize === size ? 'bg-[#6cd476] text-white' : 'bg-transparent text-[#8a816f] hover:bg-white'}`}
                    >
                      {size}
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        {/if}

        {#if currentView === 'apps'}
          <!-- Default Apps -->
          <div class="flex flex-col gap-4 animate-fade-in pb-20">
            <h2 class="text-lg font-black text-[#5c5446] border-b-4 border-[#e1d9be] pb-2 m-0">Default Apps</h2>
            <div class="text-[11px] font-bold text-[#8a816f] mb-2 leading-relaxed">
              Choose which apps to launch when you click on core icons or links. Built-in apps and installed community apps will appear here if they support the feature.
            </div>
            
            <div class="bg-white rounded-3xl p-5 border-4 border-[#e1d9be] shadow-[0_4px_0_#dcd3be] flex flex-col gap-0 divide-y-2 divide-dashed divide-[#f4f2e8]">
              {#each INTENT_CATEGORIES as intent}
                {@const eligibleApps = getEligibleApps(intent.id)}
                {@const currentAppId = (nookState.settings.defaultApps && nookState.settings.defaultApps[intent.id]) || intent.id}
                {@const currentApp = phone.allApps.find((a: any) => (a.id || a.name) === currentAppId) || phone.allApps.find((a: any) => a.id === intent.id)}
                
                <div class="py-4 first:pt-1 last:pb-1 flex flex-col gap-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-2xl bg-[#fdfcf9] border-2 border-[#e1d9be] flex items-center justify-center shadow-inner overflow-hidden relative">
                        {#if currentApp?.image}
                          <img src={resolveAssetUrl(currentApp.image)} alt={intent.name} class="w-7 h-7 object-contain drop-shadow-sm" />
                        {:else if currentApp?.id}
                          <NookIcon name={currentApp.id} class="w-7 h-7 object-contain drop-shadow-sm p-1" />
                        {:else if currentApp?.appIcon}
                          <NookIcon name={currentApp.appIcon} class="w-7 h-7 object-contain drop-shadow-sm p-1" />
                        {:else}
                          <div class="font-black text-[#5c5446] text-[10px]">{currentApp?.name?.charAt(0) || intent.name.charAt(0)}</div>
                        {/if}
                      </div>
                      <div>
                        <div class="font-black text-[#5c5446] text-sm">{intent.name}</div>
                        <div class="text-[10px] font-bold text-[#8a816f]">Default: {currentApp?.name || 'System Default'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {#if eligibleApps.length > 1}
                    <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {#each eligibleApps as app}
                        <button
                          onclick={() => nookState.setDefaultApp(intent.id, app.id || app.name)}
                          class={`flex items-center gap-3 p-2 rounded-xl border-2 text-left cursor-pointer transition-colors ${currentAppId === (app.id || app.name) ? 'bg-[#6cd476]/10 border-[#6cd476] shadow-sm' : 'bg-transparent border-[#f4f2e8] hover:border-[#dcd3be]'}`}
                        >
                          <div class={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${app.bg || 'bg-[#fdfcf9]'} overflow-hidden relative shadow-inner border-2 border-[#e1d9be]`}>
                            {#if app.image}
                              <img src={resolveAssetUrl(app.image)} alt={app.name} class="w-4 h-4 object-contain drop-shadow-sm" />
                            {:else if app.id}
                              <NookIcon name={app.id} class="w-4 h-4 object-contain drop-shadow-sm p-0.5" />
                            {:else if app.appIcon}
                              <NookIcon name={app.appIcon} class="w-4 h-4 object-contain drop-shadow-sm p-0.5" />
                            {/if}
                          </div>
                          <span class={`text-[10px] font-black truncate flex-1 ${(currentAppId === (app.id || app.name)) ? 'text-[#4ca454]' : 'text-[#8a816f]'}`}>{app.name}</span>
                          {#if currentAppId === (app.id || app.name)}
                            <div class="w-4 h-4 rounded-full bg-[#6cd476] text-white flex items-center justify-center shadow-sm">
                              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                          {/if}
                        </button>
                      {/each}
                    </div>
                  {:else}
                    <div class="mt-1 text-[10px] font-bold text-[#caa253]/80 italic">No alternative apps installed for this category.</div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if currentView === 'about'}
          <!-- About Settings -->
          <div class="flex flex-col gap-4 animate-fade-in pb-20">
            <h2 class="text-lg font-black text-[#5c5446] border-b-4 border-[#e1d9be] pb-2 m-0">About NookOS</h2>
            
            <div class="bg-white rounded-3xl p-8 border-4 border-[#e1d9be] shadow-[0_4px_0_#dcd3be] flex flex-col items-center justify-center gap-4 text-center">
              <div class="w-24 h-24 bg-[#f0b157]/20 rounded-[2rem] flex items-center justify-center border-4 border-[#f0b157]/40 shadow-inner relative overflow-hidden rotate-3">
                <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                <img src="/wp-content/plugins/xophz-nook-phone/public/dist/nook-face.svg" alt="Tom Nook" class="w-16 h-16 drop-shadow-md z-10" />
              </div>
              
              <div>
                <h3 class="text-2xl font-black text-[#5c3a21] m-0">NookPhone<sup>1</sup></h3>
                <p class="text-[10px] font-bold text-[#caa253] m-0 tracking-widest uppercase">Version {(window as any).wpApiSettings?.version || '1.0.0'}</p>
              </div>
              
              <div class="text-xs font-bold text-[#8a816f] max-w-xs mt-2 leading-relaxed">
                NookOS is the premier operating system for island living. Designed by Nook Inc. for a seamless and comfortable getaway package experience.
              </div>

              <div class="flex gap-4 mt-2">
                <button
                  onclick={() => nookState.navigate('privacy')}
                  class="text-xs font-black text-[#45a38f] hover:text-[#368875] underline cursor-pointer bg-transparent border-0 outline-none p-0"
                >
                  Privacy Policy
                </button>
                <span class="text-[#e1d9be] font-bold">|</span>
                <button
                  onclick={() => nookState.navigate('terms')}
                  class="text-xs font-black text-[#d2b373] hover:text-[#bca167] underline cursor-pointer bg-transparent border-0 outline-none p-0"
                >
                  Terms of Service
                </button>
              </div>
              
              <div class="mt-4 pt-4 border-t-2 border-dashed border-[#e1d9be] w-full text-[9px] font-bold text-[#8a816f] leading-relaxed">
                Animal Crossing™: New Horizons, Dodo Code™, and Dodo Airlines are trademarks of Nintendo Co., Ltd.<br/><br/>
                Other trademarks are the property of their respective owners.<br/><br/>
                Nookphone.app is a fan-built website and is not affiliated with Nintendo.
              </div>
            </div>
          </div>
        {/if}

      </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .nook-settings-bg {
    background-color: #dfd0c4;
    position: relative;
    overflow: hidden;
  }
  .nook-settings-bg::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0.06;
    pointer-events: none;
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none" stroke="%235c4a3d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cg transform="translate(20, 20) scale(1.4) rotate(15)"%3E%3Cpath d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/%3E%3C/g%3E%3Cg transform="translate(110, 30) scale(1.4) rotate(-35)"%3E%3Cpath d="m15 5 4 4M21.5 12 12 21.5M14 10l-1.5-1.5M3 21h3l10-10-3-3L3 18v3zm5.5-6.5-1-1"/%3E%3C/g%3E%3Cg transform="translate(65, 100) scale(1.4) rotate(45)"%3E%3Cpath d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/%3E%3Ccircle cx="12" cy="12" r="3"/%3E%3C/g%3E%3C/svg%3E');
    background-size: 190px 190px;
    animation: movePatternSettings 55s linear infinite;
    z-index: 0;
  }
  @keyframes movePatternSettings {
    from { background-position: 0 0; }
    to { background-position: -190px -190px; }
  }
</style>
