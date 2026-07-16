<script lang="ts">
  import { onMount } from 'svelte'; 
  import nookState from '@/lib/nookState.svelte';
  import { projectsData, islandLifeTips } from '@/lib/nookData';
  import { fly } from 'svelte/transition';
  
  import {
    Signal,
    Wifi,
    Battery,
    MapPin,
    ChevronRight,
    Unlock,
    BookOpen,
    Award
  } from "@lucide/svelte";

  import DirectoryApp from '../pages/DirectoryApp.svelte';
  import PassportApp from '../pages/PassportApp.svelte';
  import CameraApp from '../pages/CameraApp.svelte';
  import NookMilesApp from '../pages/NookMilesApp.svelte';
  import CritterpediaApp from '../pages/CritterpediaApp.svelte';
  import DiyApp from '../pages/DiyApp.svelte';
  import CustomDesignsApp from '../pages/CustomDesignsApp.svelte';
  import MapApp from '../pages/MapApp.svelte';
  import ChatApp from '../pages/ChatApp.svelte';
  import RescueApp from '../pages/RescueApp.svelte';
  import ShoppingApp from '../pages/ShoppingApp.svelte';
  import DesignerApp from '../pages/DesignerApp.svelte';
  import SettingsApp from '../pages/SettingsApp.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';

  let timeStr = $state("12:00 PM");
  let activeTipIdx = $state(0);
  let isSwiping = $state(false);

  let isAppDrawerOpen = $state(false);

  onMount(() => {
    const updateTime = () => {
      const now = new Date();
      timeStr = now.toLocaleTimeString([], { 
        hour: "numeric", 
        minute: "2-digit",
        hour12: !nookState.settings.use24HourTime 
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  });

  const handleNextTip = () => {
    activeTipIdx = (activeTipIdx + 1) % islandLifeTips.length;
  };

  const activeTip = $derived(islandLifeTips[activeTipIdx]);

  const handleAppLaunch = (appId: string) => {
    nookState.navigate(appId);
  };

  const handleHomeButton = () => {
    if (nookState.currentApp) {
      nookState.navigate(null); // Back to Home
      isAppDrawerOpen = false;
    } else {
      isAppDrawerOpen = !isAppDrawerOpen; // Toggle app drawer
    }
  };

  const handlePowerButton = () => {
    nookState.setPhoneLocked(!nookState.isPhoneLocked);
  };

  const handleUnlock = () => {
    nookState.setPhoneLocked(false);
  };

  const customWallpaper = $derived(nookState.customDesigns.find(d => d.id === nookState.activeWallpaperId));

  const CORE_APPS = [
    { id: "passport", name: "Passport", icon: "passport", bg: "bg-[#89b88b]" },
    { id: "camera", name: "Camera", icon: "camera", bg: "bg-[#f0614e]" },
    { id: "miles", name: "Nook Miles", icon: "miles", bg: "bg-[#91bd5e]" },
    { id: "critter", name: "Critterpedia", icon: "critter", bg: "bg-[#497148]" },
    { id: "diy", name: "DIY Recipes", icon: "diy", bg: "bg-[#59c3d4]" },
    { id: "designs", name: "Custom Editor", icon: "designs", bg: "bg-[#e483b3]" },
    { id: "map", name: "Island Map", icon: "map", bg: "bg-[#ebd15b]" },
    { id: "chat", name: "Resident Chat", icon: "chat", bg: "bg-[#6ca5d8]" },
    { id: "rescue", name: "Rescue", icon: "rescue", bg: "bg-[#c74536]" },
    { id: "shopping", name: "Nook Shop", icon: "shopping", bg: "bg-[#5ea8d3]" },
    { id: "designer", name: "Designer", icon: "designer", bg: "bg-[#d79a61]" },
    { id: "settings", name: "Settings", icon: "settings", bg: "bg-[#7c8088]" }
  ];

  const allApps = $derived([...CORE_APPS, ...projectsData]);
  const homeScreenApps = $derived(allApps.filter(a => nookState.isAppPinned(a.id || a.name)));

  const wallpaperStyle = $derived(customWallpaper
    ? `background-image: conic-gradient(from 0deg, ${customWallpaper.grid[0][0]}, ${customWallpaper.grid[4][4]}, ${customWallpaper.grid[8][8]}); background-size: cover;`
    : "");
</script>

<div id="nook-phone-canvas" class="w-full h-full relative z-10">
  
  <!-- Main OS Frame -->
  <div class="w-full h-full relative overflow-hidden flex flex-col bg-[#e0dcc5] select-none">

    <!-- Dynamic Status Bar -->
    <div class="bg-[#e0dcc5]/80 backdrop-blur-md px-6 pt-3 pb-2 flex justify-between items-center text-[11px] text-[#5d5a4a] font-black select-none z-50 shrink-0 border-b border-[#d1cbb0]">
      <div class="flex items-center gap-1">
        <Signal class="w-3.5 h-3.5 text-[#5d5a4a] stroke-[3px]" />
        <span class="font-sans font-bold">NookLink</span>
        <Wifi class="w-3 h-3 text-[#5d5a4a]" />
      </div>
      <div class="font-mono text-xs text-[#5d5a4a] tracking-tight font-black">
        {timeStr}
      </div>
      <div class="flex items-center gap-1.5">
        <MapPin class="w-3.5 h-3.5 text-[#5c8e43]" />
        <span class="text-[10px] font-sans font-bold tracking-wide mr-1">
          {nookState.passport.islandName.replace(" Island", "")}
        </span>
        {#if nookState.settings.showBatteryPercentage}
          <span class="text-[9px] font-mono font-bold text-[#5c8e43]">100%</span>
        {/if}
        <button onclick={handlePowerButton} class="bg-transparent border-0 p-0 cursor-pointer flex items-center hover:opacity-70 transition-opacity" title="Sleep / Lock">
          <Battery class="w-5 h-5 text-[#5d5a4a] stroke-[2px]" />
        </button>
      </div>
    </div>

    <!-- Lock Screen overlay -->
    {#if nookState.isPhoneLocked}
      <div
        transition:fly={{ y: -20, duration: 300 }}
        class="absolute inset-0 bg-[#e0dcc5] flex flex-col justify-between p-6 z-40 overflow-hidden"
      >
        <!-- Wallpaper Pattern -->
        <div 
          class="absolute inset-0 opacity-[0.14] pointer-events-none z-0" 
          style="background-image: url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 5l5 10h10l-8 7 3 10-10-6-10 6 3-10-8-7h10z%22 fill=%22%235c8e43%22 fill-opacity=%220.4%22/%3E%3C/svg%3E'); background-size: 56px 56px;"
        ></div>

        <div class="flex flex-col items-center mt-12 gap-1.5 text-center relative z-10">
          <span class="text-[#5d5a4a] text-xs font-black uppercase tracking-widest block">
            {new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
          </span>
          <h1 class="text-4xl font-mono font-black text-[#5d5a4a] tracking-tight">
            {timeStr}
          </h1>
          <div class="mt-4 bg-white/80 backdrop-blur border border-[#edd8aa] rounded-2xl p-3 max-w-[240px] text-left text-[11px] leading-relaxed text-[#5c5446] shadow-sm flex items-start gap-2">
            <Award class="w-5 h-5 text-yellow-600 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <span class="font-bold block text-emerald-800">Ready to collect:</span>
              Collect Nook Miles rewards by launching your apps!
            </div>
          </div>
        </div>

        <!-- Slider Button -->
        <button
          onclick={handleUnlock}
          class="w-full max-w-sm mx-auto bg-[#5c8e43] text-white border-0 py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#4b7a34] active:scale-95 transition-all mb-8 relative z-10 cursor-pointer"
        >
          <Unlock class="w-4 h-4 animate-bounce" /> Slide / Tap to unlock
        </button>
      </div>
    {/if}

    <!-- Dynamic Display Screens -->
    <div class="flex-1 relative overflow-hidden flex flex-col bg-[#e0dcc5] h-full">
      {#if nookState.currentApp}
        <!-- ACTIVE APPLICATION WINDOW -->
        <div class="flex-1 h-full flex flex-col">
          {#if nookState.currentApp === "directory"} <DirectoryApp /> {/if}
          {#if nookState.currentApp === "passport"} <PassportApp /> {/if}
          {#if nookState.currentApp === "camera"} <CameraApp /> {/if}
          {#if nookState.currentApp === "miles"} <NookMilesApp /> {/if}
          {#if nookState.currentApp === "critter"} <CritterpediaApp /> {/if}
          {#if nookState.currentApp === "diy"} <DiyApp /> {/if}
          {#if nookState.currentApp === "designs"} <CustomDesignsApp /> {/if}
          {#if nookState.currentApp === "map"} <MapApp /> {/if}
          {#if nookState.currentApp === "chat"} <ChatApp /> {/if}
          {#if nookState.currentApp === "rescue"} <RescueApp /> {/if}
          {#if nookState.currentApp === "shopping"} <ShoppingApp /> {/if}
          {#if nookState.currentApp === "designer"} <DesignerApp /> {/if}
          {#if nookState.currentApp === "settings"} <SettingsApp /> {/if}

          <!-- Launching embedded directory pinned frames -->
          {#if !CORE_APPS.some(a => a.id === nookState.currentApp)}
            {@const currentProject = projectsData.find(p => p.name === nookState.currentApp)}
            <div class="flex flex-col h-full ac-app-screen bg-[#faf9f4]">
              <div class="bg-[#8cc3b0] text-[#1a4335] p-3 pt-5 ac-wavy-header flex justify-between items-center z-10 shadow-sm shrink-0">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg shadow-inner">
                    {currentProject?.appIcon || '🌐'}
                  </div>
                  <div>
                    <h1 class="text-sm font-bold flex items-center gap-1 m-0 truncate max-w-[150px]">{nookState.currentApp}</h1>
                    <p class="text-[9px] opacity-90 m-0">Embedded Web App</p>
                  </div>
                </div>
                <button
                  onclick={handleHomeButton}
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
                    <div class="w-16 h-16 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center text-3xl shadow-inner">
                      {currentProject?.appIcon || '📌'}
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
        </div>
      {:else}
        <!-- LAUNCHER HOME SCREEN -->
        <div
          class={`flex-1 flex flex-col justify-between p-4 pb-2 relative h-full overflow-hidden ${!customWallpaper ? 'bg-[#e0dcc5]' : ''}`}
          style={wallpaperStyle}
        >
          <!-- Wallpaper Star/Leaf Pattern Overlay -->
          {#if !customWallpaper}
            <div 
              class="absolute inset-0 opacity-[0.14] pointer-events-none z-0" 
              style="background-image: url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 5l5 10h10l-8 7 3 10-10-6-10 6 3-10-8-7h10z%22 fill=%22%235c8e43%22 fill-opacity=%220.4%22/%3E%3C/svg%3E'); background-size: 56px 56px;"
            ></div>
          {/if}

          <div class="flex flex-col gap-3.5 relative z-10 flex-1">
            
            <!-- Island Life 101 Daily Tip Widget -->
            <div class="bg-white/90 backdrop-blur-sm border border-[#edd8aa] rounded-2xl p-2.5 shadow-sm flex gap-2 items-start text-left relative animate-fade-in shrink-0">
              <div class="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg shrink-0">
                {activeTip.author === "Tom Nook" ? "🍃" : activeTip.author === "Isabelle" ? "🐶" : "🌸"}
              </div>
              
              <div class="flex-1 flex flex-col gap-0.5 pr-4">
                <span class="text-[7.5px] font-black text-emerald-800/80 tracking-widest uppercase block">
                  Island Life 101 • {activeTip.author}
                </span>
                <span class="font-extrabold text-xs text-[#5c5446]">{activeTip.title}</span>
                <p class="text-[9.5px] text-gray-500 mt-0.5 leading-relaxed m-0">
                  {activeTip.content}
                </p>
              </div>

              <button
                onclick={handleNextTip}
                class="absolute right-2 top-2 text-emerald-800 hover:scale-105 active:scale-95 transition bg-transparent border-0 p-0 cursor-pointer"
                title="Next tip"
              >
                <ChevronRight class="w-3.5 h-3.5 stroke-[3px]" />
              </button>
            </div>

            <!-- Wallets widget -->
            <div class="bg-[#fdfcf8]/90 backdrop-blur-sm border border-[#e4dfd0] rounded-xl p-2 px-3 shadow-sm flex justify-between text-[11px] font-extrabold z-10 text-[#5c5446] shrink-0">
              <span class="flex items-center gap-1">💰 {nookState.bells.toLocaleString()} <span class="text-[9px] text-gray-400">Bells</span></span>
              <span class="flex items-center gap-1">🎈 {nookState.miles.toLocaleString()} <span class="text-[9px] text-gray-400">Miles</span></span>
            </div>

            <div class="relative flex-1">
              {#if isAppDrawerOpen}
                <div
                  in:fly={nookState.settings.reduceMotion ? undefined : { y: 100, duration: 300 }}
                  out:fly={nookState.settings.reduceMotion ? undefined : { y: 100, duration: 300 }}
                  class="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col z-40 overflow-hidden border border-white/40"
                >
                  <div class="shrink-0 flex flex-col items-center pt-3 pb-2 border-b border-gray-100 relative">
                    <div class="w-12 h-1.5 bg-gray-300 rounded-full mb-3"></div>
                    <h2 class="text-xs font-black text-gray-500 uppercase tracking-widest m-0">All Apps</h2>
                    <button onclick={() => isAppDrawerOpen = false} class="absolute right-4 top-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center border-0 cursor-pointer">
                      ✕
                    </button>
                  </div>
                  
                  <div class="flex-1 overflow-y-auto ac-scrollbar px-4 pb-24 pt-4">
                    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-4 sm:gap-x-6 md:gap-x-8 justify-items-center">
                      {#each allApps as app (app.id || app.name)}
                        <div class="relative group">
                          <button
                            onclick={() => handleAppLaunch(app.id || app.name)}
                            class="flex flex-col items-center gap-1 bg-transparent border-0 hover:scale-105 transition-all duration-200 cursor-pointer p-0 w-[80px]"
                          >
                            <div class={`w-[60px] h-[60px] flex items-center justify-center rounded-[18px] transition-all relative overflow-hidden ${app.bg || 'bg-[#f5fbf7] border-4 border-white/20 shadow-md text-3xl'}`}>
                              {#if app.id}
                                <NookIcon name={app.id} class="w-full h-full object-contain drop-shadow-sm p-2" />
                              {:else}
                                <div class="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none"></div>
                                {app.appIcon || '🌐'}
                              {/if}
                            </div>
                            <span class="text-[9px] font-black text-[#5d5a4a] tracking-tight text-center truncate w-full px-1">
                              {app.name}
                            </span>
                          </button>
                          <!-- Pin Button -->
                          <button 
                            onclick={(e) => { e.stopPropagation(); nookState.toggleAppPin(app.id || app.name); }}
                            class={`absolute -top-2 -right-2 w-6 h-6 rounded-full border border-white flex items-center justify-center cursor-pointer shadow-sm transition-transform active:scale-90 ${nookState.isAppPinned(app.id || app.name) ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                            title={nookState.isAppPinned(app.id || app.name) ? 'Unpin from Homescreen' : 'Pin to Homescreen'}
                          >
                            📌
                          </button>
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              {/if}

              <!-- Homescreen Desktop -->
              <div class="absolute inset-0 overflow-y-auto ac-scrollbar">
                  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-4 sm:gap-x-6 md:gap-x-8 p-4 justify-items-center content-start pb-24">
                    {#each homeScreenApps as app (app.id || app.name)}
                      <button
                        onclick={() => handleAppLaunch(app.id || app.name)}
                        class="flex flex-col items-center gap-1 bg-transparent border-0 hover:scale-105 transition-all duration-200 group cursor-pointer p-0 w-[80px]"
                      >
                        <div class={`w-[66px] h-[66px] flex items-center justify-center group-hover:scale-105 transition-all relative group-hover:ring-4 group-hover:ring-offset-2 group-hover:ring-[#8cc3b0] rounded-[18px] overflow-hidden ${app.bg || 'bg-[#f5fbf7] border-4 border-white/20 shadow-md text-3xl'}`}>
                          {#if app.id}
                            <NookIcon name={app.id} class="w-full h-full object-contain drop-shadow-sm p-2.5" />
                          {:else}
                            <div class="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none"></div>
                            {app.appIcon || '🌐'}
                          {/if}
                        </div>
                        <span class="text-[10px] font-black text-[#5d5a4a] tracking-tight text-center truncate w-full px-1">
                          {app.name}
                        </span>
                      </button>
                    {/each}

                    {#if homeScreenApps.length === 0}
                      <div class="col-span-full flex flex-col items-center justify-center py-20 text-[#5d5a4a]/50 text-sm font-bold text-center">
                        <div class="text-4xl mb-4 opacity-50">📱</div>
                        Your homescreen is empty.<br/>
                        Tap the Home button below to open the App Drawer and pin some apps!
                      </div>
                    {/if}
                  </div>
              </div>
            </div>
          </div>

        </div>
      {/if}
    </div>

    <!-- Persistent Floating Home Button -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] flex justify-center pointer-events-auto">
      <button 
        onclick={handleHomeButton}
        class="w-[50px] h-[50px] rounded-full bg-[#5c8e43] border-4 border-white/40 flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-95 transition-all cursor-pointer group p-0 m-0" 
        title="Nook Home Menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" class="group-hover:rotate-12 transition-transform">
          <path d="M17,8C15.39,8.15 13.92,8.96 13,10.15C12.08,8.96 10.61,8.15 9,8C6.79,8 5,9.79 5,12C5,14.21 6.79,16 9,16C10.61,15.85 12.08,15.04 13,13.85C13.92,15.04 15.39,15.85 17,16C19.21,16 21,14.21 21,12C21,9.79 19.21,8 17,8Z" />
        </svg>
      </button>
    </div>

  </div>
</div>
