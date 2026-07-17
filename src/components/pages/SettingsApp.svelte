<script lang="ts">
  import { Settings, Clock, Battery, Accessibility, ChevronLeft, Image as ImageIcon, PaintBucket, Search, Smartphone, Info, LayoutList, ChevronDown , X } from '@lucide/svelte';
  import nookState from "@/lib/nookState.svelte";
  import { ALL_WALLPAPERS } from "@/lib/wallpaperData";
  import { getPhoneContext } from "../organisms/phoneContext.svelte";
  import { resolveAssetUrl } from "@/lib/utils";
  import NookIcon from "../atoms/NookIcon.svelte";
  import NookAppHeader from "../organisms/NookAppHeader.svelte";
  import NookToolbarButton from "../molecules/NookToolbarButton.svelte";

  const ctx = getPhoneContext();
  const phone = getPhoneContext();

  const toggle24Hour = () => nookState.updateSettings({ use24HourTime: !nookState.settings.use24HourTime });
  const toggleBattery = () => nookState.updateSettings({ showBatteryPercentage: !nookState.settings.showBatteryPercentage });
  const toggleMotion = () => nookState.updateSettings({ reduceMotion: !nookState.settings.reduceMotion });

  const setWallpaper = (id: string) => {
    nookState.activeWallpaperId = id;
    nookState.save();
  };

  let selectedCategory = $state('personalization');
  let searchQuery = $state('');

  const categories = [
    { id: 'personalization', name: 'Personalization', icon: ImageIcon },
    { id: 'device', name: 'Device Settings', icon: Smartphone },
    { id: 'apps', name: 'Default Apps', icon: LayoutList },
    { id: 'about', name: 'About NookOS', icon: Info },
  ];

  const INTENT_CATEGORIES = [
    { id: 'miles', name: 'Nook Miles', icon: 'miles', filter: (app: any) => app.id === 'miles' || app.name?.toLowerCase().includes('miles') || app.information?.includes('gameplay') },
    { id: 'critter', name: 'Critterpedia', icon: 'critter', filter: (app: any) => app.id === 'critter' || app.information?.includes('critters') },
    { id: 'shopping', name: 'Nook Shopping', icon: 'shopping', filter: (app: any) => app.id === 'shopping' || app.information?.includes('items') || app.tools?.includes('marketplace') },
    { id: 'diy', name: 'DIY Recipes', icon: 'diy', filter: (app: any) => app.id === 'diy' || app.information?.includes('items') },
    { id: 'map', name: 'Island Map', icon: 'map', filter: (app: any) => app.id === 'map' },
    { id: 'designer', name: 'Island Designer', icon: 'designer', filter: (app: any) => app.id === 'designer' || app.tools?.includes('simulator') },
    { id: 'chat', name: 'Chat Log', icon: 'chat', filter: (app: any) => app.id === 'chat' },
  ];

  const getEligibleApps = (intentId: string) => {
    const category = INTENT_CATEGORIES.find(c => c.id === intentId);
    if (!category) return [];
    return phone.allApps.filter(app => category.filter(app));
  };
</script>

<div class="h-full bg-[#fdfcf9] flex flex-col font-sans ac-bg-dots">
  <!-- Top Bar (Chrome OS style but AC themed) -->
  <NookAppHeader
    title="Settings"
    bgClass="bg-[#f0b157] border-b-4 border-[#d99c45]"
    textClass="text-[#5c3a21]"
  >
    {#snippet iconSnippet()}
      <button onclick={() => nookState.navigate(null)} class="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center border-0 text-[#5c3a21] hover:bg-white/50 cursor-pointer transition-colors shadow-inner mr-1">
        <ChevronLeft class="w-5 h-5 pr-0.5" />
      </button>
    {/snippet}
    
    {#snippet actions()}
      <div class="relative w-40 sm:w-48 hidden sm:block">
        <Search class="w-3.5 h-3.5 absolute left-3 top-2 text-[#5c3a21]/50" />
        <input 
          type="text" 
          bind:value={searchQuery}
          placeholder="Search settings" 
          class="w-full bg-white/40 border-2 border-[#d99c45] rounded-full py-1.5 pl-8 pr-3 text-[11px] font-bold text-[#5c3a21] placeholder:text-[#5c3a21]/50 focus:outline-none focus:bg-white focus:border-[#5c3a21]"
        />
      </div>
      <NookToolbarButton onclick={ctx.handleHomeButton} title="Close App">
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>

  <div class="flex flex-1 overflow-hidden">
    <!-- Sidebar -->
    <div class="w-14 sm:w-48 border-r-4 border-[#e1d9be] bg-[#fdfcf9]/90 flex flex-col p-2 gap-2 overflow-y-auto ac-scrollbar shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
      {#each categories as cat}
        <button 
          onclick={() => selectedCategory = cat.id}
          class={`flex items-center justify-center sm:justify-start gap-3 p-3 rounded-2xl cursor-pointer transition-all font-black text-xs border-b-4 active:translate-y-1 active:border-b-0 ${selectedCategory === cat.id ? 'bg-[#6cd476] text-white border-[#4ca454] shadow-sm' : 'bg-transparent text-[#7c8088] border-transparent hover:bg-white hover:border-[#e1d9be]'}`}
          title={cat.name}
        >
          <cat.icon class="w-5 h-5 shrink-0" />
          <span class="hidden sm:inline drop-shadow-sm">{cat.name}</span>
        </button>
      {/each}
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-y-auto ac-scrollbar p-4 sm:p-6 bg-[#fcfcf9] shadow-inner">
      <div class="max-w-3xl mx-auto flex flex-col gap-6">
        
        {#if selectedCategory === 'personalization'}
          <!-- Personalization -->
          <div class="flex flex-col gap-4 animate-fade-in pb-20">
            <h2 class="text-lg font-black text-[#5c5446] border-b-4 border-[#e1d9be] pb-2 m-0">Wallpaper & Style</h2>
            
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 mt-2">
              {#each ALL_WALLPAPERS as wp}
                <button 
                  onclick={() => setWallpaper(wp.id)}
                  class={`flex flex-col items-center gap-2 bg-transparent border-0 p-0 cursor-pointer group ${nookState.activeWallpaperId === wp.id || (!nookState.activeWallpaperId && wp.id === 'default') ? 'opacity-100 scale-105' : 'opacity-70 hover:opacity-100 hover:scale-105'} transition-all`}
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
                  <span class="text-[9px] sm:text-[10px] font-black text-[#5c5446] text-center leading-tight">{wp.name}</span>
                </button>
              {/each}
              
              <button 
                onclick={() => nookState.navigate('designs')}
                class="flex flex-col items-center gap-2 bg-transparent border-0 p-0 cursor-pointer group opacity-70 hover:opacity-100 hover:scale-105 transition-all"
              >
                <div class="w-full aspect-[9/16] rounded-2xl border-4 border-dashed border-[#e1d9be] shadow-sm flex items-center justify-center bg-[#fdfcf9] text-[#caa253]">
                  <PaintBucket class="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span class="text-[9px] sm:text-[10px] font-black text-[#5c5446] text-center leading-tight">Custom<br/>Design</span>
              </button>
            </div>
          </div>
        {/if}

        {#if selectedCategory === 'device'}
          <!-- Device Settings -->
          <div class="flex flex-col gap-4 animate-fade-in">
            <h2 class="text-lg font-black text-[#5c5446] border-b-4 border-[#e1d9be] pb-2 m-0">Device Preferences</h2>
            
            <div class="bg-white rounded-3xl p-5 border-4 border-[#e1d9be] shadow-[0_4px_0_#dcd3be] flex flex-col gap-2">
              <div class="flex items-center justify-between py-3 border-b-2 border-dashed border-[#f4f2e8]">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-500 shadow-inner">
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
                  <div class="w-10 h-10 rounded-2xl bg-green-50 border-2 border-green-200 flex items-center justify-center text-green-500 shadow-inner">
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

              <div class="flex items-center justify-between py-3">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-purple-500 shadow-inner">
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

              <div class="flex items-center justify-between py-3">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-orange-500 shadow-inner">
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

        {#if selectedCategory === 'apps'}
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

        {#if selectedCategory === 'about'}
          <!-- About Settings -->
          <div class="flex flex-col gap-4 animate-fade-in pb-20">
            <h2 class="text-lg font-black text-[#5c5446] border-b-4 border-[#e1d9be] pb-2 m-0">About NookOS</h2>
            
            <div class="bg-white rounded-3xl p-8 border-4 border-[#e1d9be] shadow-[0_4px_0_#dcd3be] flex flex-col items-center justify-center gap-4 text-center">
              <div class="w-24 h-24 bg-[#f0b157]/20 rounded-[2rem] flex items-center justify-center border-4 border-[#f0b157]/40 shadow-inner relative overflow-hidden rotate-3">
                <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                <img src="/wp-content/plugins/super-nerd-bros-dodo-air/public/img/nook-face.svg" alt="Tom Nook" class="w-16 h-16 drop-shadow-md z-10" />
              </div>
              
              <div>
                <h3 class="text-2xl font-black text-[#5c3a21] m-0">NookPhone<sup>1</sup></h3>
                <p class="text-[10px] font-bold text-[#caa253] m-0 tracking-widest uppercase">Version {(window as any).wpApiSettings?.version || '1.0.0'}</p>
              </div>
              
              <div class="text-xs font-bold text-[#8a816f] max-w-xs mt-2 leading-relaxed">
                NookOS is the premier operating system for island living. Designed by Nook Inc. for a seamless and comfortable getaway package experience.
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
  </div>
</div>
