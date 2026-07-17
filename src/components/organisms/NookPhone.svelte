<script lang="ts">
  import { onMount } from 'svelte'; 
  import nookState from '@/lib/nookState.svelte';
  import { projectsData, islandLifeTips } from '@/lib/nookData';
  import { ALL_WALLPAPERS } from '@/lib/wallpaperData';
  import { fly, fade } from 'svelte/transition';
  
  import {
    Signal,
    Wifi,
    Battery,
    MapPin,
    ChevronRight,
    Unlock,
    BookOpen,
    Award,
    Bell,
    Trash2,
    Inbox,
    X,
    Globe,
    Code
  } from "@lucide/svelte";

  import Onboarding from './Onboarding.svelte';
  import DirectoryApp from '../pages/DirectoryApp.svelte';
  import PassportApp from '../pages/PassportApp.svelte';
  import CameraApp from '../pages/CameraApp.svelte';
  import NookMilesApp from '../pages/NookMilesApp.svelte';
  import CritterpediaApp from '../pages/CritterpediaApp.svelte';
  import DiyApp from '../pages/DiyApp.svelte';
  import CustomDesignsApp from '../pages/CustomDesignsApp.svelte';
  import MapApp from '../pages/MapApp.svelte';
  import ChatApp from '../pages/ChatApp.svelte';
  import MessagesApp from '../pages/MessagesApp.svelte';
  import RescueApp from '../pages/RescueApp.svelte';
  import ShoppingApp from '../pages/ShoppingApp.svelte';
  import DesignerApp from '../pages/DesignerApp.svelte';
  import SettingsApp from '../pages/SettingsApp.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import nookIncLogo from '../../../assets/img/Nook_Inc.svg';

  let timeStr = $state("12:00 PM");
  let isSwiping = $state(false);
  let isAppDrawerOpen = $state(false);
  let activeToast = $state<any>(null);
  let showNotificationCenter = $state(false);
  let launchingApp = $state<any>(null);

  let isBooting = $state(true);

  onMount(() => {
    setTimeout(() => {
      isBooting = false;
    }, 2800);

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

    const deliverRandomTip = () => {
      const existingNotifTitles = nookState.notifications.map(n => n.title);
      const availableTips = islandLifeTips.filter(t => !existingNotifTitles.includes(t.title));
      
      if (availableTips.length > 0) {
        const tip = availableTips[Math.floor(Math.random() * availableTips.length)];
        nookState.addNotification(tip.title, tip.content, tip.author);
      } else {
        const tip = islandLifeTips[Math.floor(Math.random() * islandLifeTips.length)];
        nookState.addNotification(tip.title, tip.content, tip.author);
      }
    };

    // Send a new tip notification after 10 seconds of app loading, and then every 75 seconds
    const initialTipTimeout = setTimeout(deliverRandomTip, 10000);
    const tipInterval = setInterval(deliverRandomTip, 75000);

    const handleNotificationReceived = (e: Event) => {
      const notif = (e as CustomEvent).detail;
      activeToast = notif;
      
      setTimeout(() => {
        if (activeToast && activeToast.id === notif.id) {
          activeToast = null;
        }
      }, 4000);
    };

    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/app\/(.+)$/);
      const targetApp = match ? decodeURIComponent(match[1]) : null;
      if (nookState.currentApp !== targetApp) {
        nookState.navigate(targetApp);
      }
    };

    window.addEventListener("nook-notification", handleNotificationReceived);
    window.addEventListener("hashchange", handleHashChange);

    // Sync initial route from hash if present
    const hash = window.location.hash;
    const match = hash.match(/^#\/app\/(.+)$/);
    const initialApp = match ? decodeURIComponent(match[1]) : null;
    if (initialApp) {
      nookState.navigate(initialApp);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(initialTipTimeout);
      clearInterval(tipInterval);
      window.removeEventListener("nook-notification", handleNotificationReceived);
      window.removeEventListener("hashchange", handleHashChange);
    };
  });

  const handleAppLaunch = (appId: string) => {
    const app = allApps.find(a => (a.id || a.name) === appId);
    launchingApp = app || { name: appId, id: appId };
    
    setTimeout(() => {
      nookState.navigate(appId);
      launchingApp = null;
    }, 850);
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

  const CORE_APPS: Array<{id: string, name: string, icon: string, bg: string, appIcon?: string}> = [
    { id: "directory", name: "Nook Play", icon: "directory", bg: "bg-[#e5a044]" },
    { id: "passport", name: "Passport", icon: "passport", bg: "bg-[#89b88b]" },
    { id: "camera", name: "Camera", icon: "camera", bg: "bg-[#f0614e]" },
    { id: "miles", name: "Nook Miles", icon: "miles", bg: "bg-[#91bd5e]" },
    { id: "critter", name: "Critterpedia", icon: "critter", bg: "bg-[#497148]" },
    { id: "diy", name: "DIY Recipes", icon: "diy", bg: "bg-[#59c3d4]" },
    { id: "designs", name: "Custom Editor", icon: "designs", bg: "bg-[#e483b3]" },
    { id: "map", name: "Island Map", icon: "map", bg: "bg-[#ebd15b]" },
    { id: "chat", name: "Resident Chat", icon: "chat", bg: "bg-[#6ca5d8]" },
    { id: "messages", name: "Messages", icon: "messages", bg: "bg-[#8bd168]" },
    { id: "rescue", name: "Rescue", icon: "rescue", bg: "bg-[#c74536]" },
    { id: "shopping", name: "Nook Shop", icon: "shopping", bg: "bg-[#5ea8d3]" },
    { id: "designer", name: "Designer", icon: "designer", bg: "bg-[#d79a61]" },
    { id: "settings", name: "Settings", icon: "settings", bg: "bg-[#7c8088]" }
  ];

  const allApps = $derived([
    ...CORE_APPS, 
    ...projectsData.filter(p => nookState.isAppInstalled(p.name))
  ]);
  const homeScreenApps = $derived(allApps.filter(a => nookState.isAppPinned(a.id || a.name)));

  const DOCK_APP_IDS = ["passport", "chat", "directory", "settings"];
  const dockApps = $derived(allApps.filter(a => a.id && DOCK_APP_IDS.includes(a.id)));
  const desktopApps = $derived(homeScreenApps.filter(a => !DOCK_APP_IDS.includes(a.id || a.name)));

  const currentWallpaper = $derived(customWallpaper 
    ? null 
    : (ALL_WALLPAPERS.find(w => w.id === nookState.activeWallpaperId) || ALL_WALLPAPERS[0]));

  const wallpaperStyle = $derived(customWallpaper
    ? `background-image: conic-gradient(from 0deg, ${customWallpaper.grid[0][0]}, ${customWallpaper.grid[4][4]}, ${customWallpaper.grid[8][8]}); background-size: cover;`
    : (currentWallpaper?.url ? `background-image: url('${currentWallpaper.url}'); background-size: cover; background-position: center;` : ""));
</script>

<div id="nook-phone-canvas" class="w-full h-full relative z-10">
  
  {#if isBooting}
    <div 
      transition:fade={{ duration: 400 }}
      class="absolute inset-0 bg-[#3b592d] z-[200] flex flex-col justify-between p-8 text-white select-none"
    >
      <!-- Floating Background Leaves -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.15]">
        <span class="absolute text-2xl animate-drift-leaf-1" style="left: 10%; top: -10%;">🍃</span>
        <span class="absolute text-3xl animate-drift-leaf-2" style="left: 65%; top: -10%;">🍃</span>
        <span class="absolute text-xl animate-drift-leaf-3" style="left: 35%; top: -10%;">🍃</span>
        <span class="absolute text-2xl animate-drift-leaf-4" style="left: 80%; top: -10%;">🍃</span>
      </div>

      <!-- Top Spacer -->
      <div class="z-10"></div>

      <!-- Center Content: Logo & Glow -->
      <div class="flex flex-col items-center gap-6 z-10">
        <div class="relative flex items-center justify-center">
          <!-- Glow Effect behind leaf -->
          <div class="absolute w-24 h-24 bg-[#afd485]/40 rounded-full blur-2xl animate-pulse"></div>
          
          <!-- Nook Inc Logo -->
          <img 
            src={nookIncLogo} 
            alt="Nook Inc Logo" 
            class="w-20 h-20 drop-shadow-[0_4px_12px_rgba(175,212,133,0.4)] animate-boot-bounce" 
          />
        </div>
        
        <div class="flex flex-col items-center gap-2">
          <h1 class="text-xl font-bold tracking-widest text-[#fdfcf0] m-0 font-sans uppercase animate-boot-text">
            NookPhone.app
          </h1>
          <p class="text-[9px] text-[#afd485] font-black tracking-widest uppercase m-0 opacity-80 animate-pulse">
            Powered by YouMeOS
          </p>
        </div>
      </div>

      <!-- Bottom Loading Status & Bar -->
      <div class="flex flex-col items-center gap-4 w-full max-w-[200px] mx-auto mb-10 z-10">
        <div class="w-full bg-[#273a1e] h-1.5 rounded-full overflow-hidden relative shadow-inner">
          <div class="bg-gradient-to-r from-[#afd485] to-[#8cc3b0] h-full rounded-full animate-boot-progress relative">
            <span class="absolute -right-2 -top-1 text-[10px] animate-spin-slow">🍃</span>
          </div>
        </div>
        <span class="text-[8px] font-black uppercase tracking-widest text-[#afd485] animate-pulse">
          System Initialization...
        </span>
      </div>
    </div>
  {/if}
  
  <!-- Main OS Frame -->
  <div class="w-full h-full relative overflow-hidden flex flex-col bg-[#e0dcc5] select-none">
    {#if !nookState.hasCompletedOnboarding}
      <Onboarding />
    {:else}
      <!-- Dynamic Status Bar -->
    <div class="bg-[#e0dcc5]/80 backdrop-blur-md px-6 pt-3 pb-2 flex justify-between items-center text-[11px] text-[#5d5a4a] font-black select-none z-[70] shrink-0 border-b border-[#d1cbb0]">
      <div class="flex items-center gap-2">
        <button 
          onclick={() => {
            showNotificationCenter = !showNotificationCenter;
            if (showNotificationCenter) {
              nookState.markAllNotificationsAsRead();
            }
          }} 
          class="relative flex items-center bg-transparent border-0 p-0 cursor-pointer hover:scale-105 active:scale-95 transition"
          title="Notifications"
        >
          <Bell class="w-3.5 h-3.5 text-[#5d5a4a] stroke-[2.5px]" />
          {#if nookState.notifications.some(n => !n.isRead)}
            <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
          {/if}
        </button>
      </div>
      
      <div class="flex items-center gap-1.5 text-xs text-[#5d5a4a] tracking-tight font-black font-sans">
        <MapPin class="w-3.5 h-3.5 text-[#5c8e43] shrink-0" />
        <span class="font-bold mr-1 truncate max-w-[80px]">
          {nookState.passport.islandName.replace(" Island", "")}
        </span>
        <span class="opacity-40">•</span>
        <span class="font-mono">{timeStr}</span>
      </div>

      <div class="flex items-center gap-1.5">
        <Signal class="w-3.5 h-3.5 text-[#5d5a4a] stroke-[3px]" />
        <Wifi class="w-3 h-3 text-[#5d5a4a]" />
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
        class={`absolute inset-0 flex flex-col justify-between p-6 z-[60] overflow-hidden ${(!customWallpaper && currentWallpaper?.isDefault) ? currentWallpaper.bg : ''}`}
        style={wallpaperStyle}
      >
        <!-- Wallpaper Pattern -->
        {#if !customWallpaper && currentWallpaper?.isDefault}
          <div 
            class="absolute inset-0 opacity-[0.14] pointer-events-none z-0" 
            style={`background-image: url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 5l5 10h10l-8 7 3 10-10-6-10 6 3-10-8-7h10z%22 ${currentWallpaper.pattern} fill-opacity=%220.4%22/%3E%3C/svg%3E'); background-size: 56px 56px;`}
          ></div>
        {/if}

        <div class="flex flex-col items-center mt-12 gap-1.5 text-center relative z-10 flex-1 min-h-0">
          <span class="text-white/90 text-xs font-black uppercase tracking-widest block drop-shadow-md shrink-0">
            {new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
          </span>
          <h1 class="text-5xl font-mono font-black text-white tracking-tight drop-shadow-lg m-0 mt-1 shrink-0">
            {timeStr}
          </h1>
          <!-- Lock Screen Notifications -->
          <div class="mt-4 w-full max-w-[280px] flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1 pb-4 w-full" style="scrollbar-width: none;">
            {#each nookState.notifications.slice(0, 10) as notif (notif.id)}
              <div class="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl p-2.5 shadow-sm flex gap-2 items-start text-left relative animate-fade-in">
                <div class="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-lg shrink-0 mt-0.5">
                  {notif.sender === "Tom Nook" ? "🍃" : notif.sender === "Isabelle" ? "🐶" : notif.sender === "Lottie" ? "🌸" : "🔔"}
                </div>
                <div class="flex-1 flex flex-col gap-0.5 pr-2">
                  <span class="text-[7.5px] font-black text-orange-800/80 tracking-widest uppercase block">
                    {notif.sender} • {notif.timestamp}
                  </span>
                  <span class="font-extrabold text-[12px] text-[#5c5446] leading-tight block">{notif.title}</span>
                  <p class="text-[9.5px] text-gray-500 mt-0.5 leading-relaxed m-0">
                    {notif.message}
                  </p>
                </div>
              </div>
            {:else}
              <div class="bg-white/40 backdrop-blur-sm border border-dashed border-white/40 rounded-2xl p-4 text-center text-[#5d5a4a]/75 text-[11px] font-bold">
                No recent notifications
              </div>
            {/each}
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
    <div 
      class={`flex-1 relative overflow-hidden flex flex-col h-full bg-[#e0dcc5] ${(!customWallpaper && currentWallpaper?.isDefault) ? currentWallpaper.bg : ''}`}
      style={wallpaperStyle}
    >
      <!-- Wallpaper Star/Leaf Pattern Overlay -->
      {#if !customWallpaper && currentWallpaper?.isDefault}
        <div 
          class="absolute inset-0 opacity-[0.14] pointer-events-none z-0" 
          style={`background-image: url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 5l5 10h10l-8 7 3 10-10-6-10 6 3-10-8-7h10z%22 ${currentWallpaper.pattern} fill-opacity=%220.4%22/%3E%3C/svg%3E'); background-size: 56px 56px;`}
        ></div>
      {/if}
      {#if nookState.currentApp}
        <!-- ACTIVE APPLICATION WINDOW -->
        <div class="flex-1 min-h-0 flex flex-col">
          {#if nookState.currentApp === "directory"} <DirectoryApp /> {/if}
          {#if nookState.currentApp === "passport"} <PassportApp /> {/if}
          {#if nookState.currentApp === "camera"} <CameraApp /> {/if}
          {#if nookState.currentApp === "miles"} <NookMilesApp /> {/if}
          {#if nookState.currentApp === "critter"} <CritterpediaApp /> {/if}
          {#if nookState.currentApp === "diy"} <DiyApp /> {/if}
          {#if nookState.currentApp === "designs"} <CustomDesignsApp /> {/if}
          {#if nookState.currentApp === "map"} <MapApp /> {/if}
          {#if nookState.currentApp === "chat"} <ChatApp /> {/if}
          {#if nookState.currentApp === "messages"} <MessagesApp /> {/if}
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
                  <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg shadow-inner overflow-hidden relative">
                    <NookIcon name={currentProject?.appIcon || 'directory'} class="w-full h-full object-contain drop-shadow-sm p-1 z-10 relative" />
                  </div>
                  <div class="flex flex-col min-w-0 justify-center">
                    <h1 class="text-sm font-bold m-0 shrink-0 leading-tight">{nookState.currentApp}</h1>
                    {#if currentProject?.site || currentProject?.git}
                      <div class="flex items-center gap-1.5 mt-1 select-none">
                        {#if currentProject.site}
                          <a 
                            href={currentProject.site} 
                            target="_blank" 
                            rel="noreferrer" 
                            class="text-[8px] bg-white/35 text-[#1a4335] hover:bg-white/60 px-2 py-0.5 rounded-full font-black transition flex items-center gap-0.5 no-underline shadow-sm active:scale-95"
                          >
                            <Globe class="w-2.5 h-2.5" /> Live
                          </a>
                        {/if}
                        {#if currentProject.git}
                          <a 
                            href={currentProject.git} 
                            target="_blank" 
                            rel="noreferrer" 
                            class="text-[8px] bg-white/35 text-[#1a4335] hover:bg-white/60 px-2 py-0.5 rounded-full font-black transition flex items-center gap-0.5 no-underline shadow-sm active:scale-95"
                          >
                            <Code class="w-2.5 h-2.5" /> Code
                          </a>
                        {/if}
                      </div>
                    {:else}
                      <p class="text-[9px] opacity-85 m-0 font-bold leading-none mt-0.5">{currentProject?.description || ''}</p>
                    {/if}
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
                    <div class="w-16 h-16 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center text-3xl shadow-inner overflow-hidden relative">
                      <NookIcon name={currentProject?.appIcon || 'directory'} class="w-full h-full object-contain drop-shadow-sm p-2 z-10 relative" />
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
        <div class="flex-1 flex flex-col justify-between p-4 pb-2 relative h-full overflow-hidden bg-transparent z-10">

          <div class="flex flex-col gap-3.5 relative z-10 flex-1">
            



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
                            <div class={`w-[60px] h-[60px] flex items-center justify-center rounded-[18px] transition-all relative overflow-hidden ${app.bg || 'bg-[#f5fbf7] border-4 border-white/20 shadow-md'}`}>
                              {#if app.id}
                                <NookIcon name={app.id} class="w-full h-full object-contain drop-shadow-sm p-2" />
                              {:else}
                                <div class="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none"></div>
                                <NookIcon name={app.appIcon || 'directory'} class="w-full h-full object-contain drop-shadow-sm p-2 z-10 relative" />
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
                <div class={`grid gap-y-6 gap-x-4 p-4 justify-items-center content-start pb-6 ${nookState.settings.gridSize === 4 ? 'grid-cols-4' : nookState.settings.gridSize === 5 ? 'grid-cols-5' : 'grid-cols-3'}`}>
                  {#each desktopApps as app (app.id || app.name)}
                    <div class="relative group w-[80px]">
                      <button
                        onclick={() => handleAppLaunch(app.id || app.name)}
                        class="flex flex-col items-center gap-1 bg-transparent border-0 hover:scale-105 transition-all duration-200 cursor-pointer p-0 w-full"
                      >
                        <div class={`w-[66px] h-[66px] flex items-center justify-center transition-all relative rounded-[18px] overflow-hidden ${app.bg || 'bg-[#f5fbf7] border-4 border-white/20 shadow-md group-hover:ring-4 group-hover:ring-offset-2 group-hover:ring-[#8cc3b0] group-hover:scale-105'}`}>
                          {#if app.id}
                            <NookIcon name={app.id} class="w-full h-full object-contain drop-shadow-sm p-2.5" />
                          {:else}
                            <div class="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none"></div>
                            <NookIcon name={app.appIcon || 'directory'} class="w-full h-full object-contain drop-shadow-sm p-2.5 z-10 relative" />
                          {/if}
                        </div>
                        <span class="text-[10px] font-black text-[#5d5a4a] tracking-tight text-center truncate w-full px-1">
                          {app.name}
                        </span>
                      </button>
                      
                      <!-- Remove button -->
                      <button 
                        onclick={(e) => { e.stopPropagation(); nookState.toggleAppPin(app.id || app.name); }}
                        class="absolute -top-1 right-0.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full border border-white flex items-center justify-center cursor-pointer shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 active:scale-95 text-[9px] font-black z-30"
                        title="Remove from Homescreen"
                      >
                        ✕
                      </button>
                    </div>
                  {/each}

                  {#if desktopApps.length === 0}
                    <div class="col-span-full flex flex-col items-center justify-center py-20 text-[#5d5a4a]/50 text-sm font-bold text-center">
                      <div class="text-4xl mb-4 opacity-50">📱</div>
                      Your desktop is empty.<br/>
                      Use the App Store to install apps or change pinning in Settings!
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>

        </div>
      {/if}

      <!-- Notification Center Overlay -->
      {#if showNotificationCenter}
        <div
          transition:fly={{ y: -500, duration: 300 }}
          class="absolute inset-0 bg-[#f8f5e6]/95 backdrop-blur-md z-45 flex flex-col p-5 pt-16 border-b border-[#d1cbb0]"
        >
          <div class="flex justify-between items-center mb-4 shrink-0">
            <h2 class="text-sm font-black text-[#5d5a4a] flex items-center gap-1.5 m-0 uppercase tracking-wider">
              <Bell class="w-4 h-4 text-orange-500 fill-orange-500/20" /> Notifications
            </h2>
            <div class="flex gap-2">
              {#if nookState.notifications.length > 0}
                <button 
                  onclick={() => nookState.clearNotifications()} 
                  class="bg-red-500 hover:bg-red-600 text-white border-0 py-1 px-2.5 rounded-full text-[9px] font-black flex items-center gap-1 transition shadow-sm cursor-pointer active:scale-95 uppercase tracking-wider"
                >
                  <Trash2 class="w-3 h-3" /> Clear All
                </button>
              {/if}
              <button 
                onclick={() => showNotificationCenter = false} 
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 border-0 p-1.5 rounded-full flex items-center justify-center transition cursor-pointer active:scale-95"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 ac-scrollbar pb-24">
            {#each nookState.notifications as notif (notif.id)}
              <div 
                class={`bg-white border rounded-2xl p-3 shadow-sm relative flex gap-3 text-left transition ${notif.isRead ? 'border-[#edd8aa] bg-white/70' : 'border-orange-200 bg-orange-50/20 shadow-orange-50/10'}`}
              >
                <div class="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-lg shrink-0 mt-0.5">
                  {notif.sender === "Tom Nook" ? "🍃" : notif.sender === "Isabelle" ? "🐶" : notif.sender === "Lottie" ? "🌸" : "🔔"}
                </div>
                <div class="flex-1 flex flex-col gap-0.5 pr-4">
                  <span class="text-[8px] font-black text-orange-800/80 tracking-widest uppercase block">
                    {notif.sender} • {notif.timestamp}
                  </span>
                  <span class="font-extrabold text-xs text-[#5c5446]">{notif.title}</span>
                  <p class="text-[10px] text-gray-500 mt-1 leading-relaxed m-0">
                    {notif.message}
                  </p>
                </div>
                <button 
                  onclick={() => nookState.dismissNotification(notif.id)}
                  class="absolute top-2.5 right-2.5 bg-transparent border-0 p-0 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  title="Dismiss"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            {:else}
              <div class="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
                <Inbox class="w-10 h-10 mb-2 stroke-[1.5px]" />
                <p class="text-xs font-bold">No notifications</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Notification Banner (Toast) -->
      {#if activeToast}
        <button
          onclick={() => {
            showNotificationCenter = true;
            nookState.markAllNotificationsAsRead();
            activeToast = null;
          }}
          transition:fly={{ y: -100, duration: 300 }}
          class="absolute top-16 left-4 right-4 bg-white/95 backdrop-blur-md border-l-4 border-orange-400 border-y border-r border-[#edd8aa] rounded-2xl p-3 shadow-lg flex gap-3 items-center text-left z-50 cursor-pointer hover:bg-orange-50/10 transition"
        >
          <div class="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-lg shrink-0">
            {activeToast.sender === "Tom Nook" ? "🍃" : activeToast.sender === "Isabelle" ? "🐶" : activeToast.sender === "Lottie" ? "🌸" : "🔔"}
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-[7px] font-black text-orange-800/80 tracking-widest uppercase block">
              New Notification • {activeToast.sender}
            </span>
            <span class="font-extrabold text-xs text-[#5c5446] block truncate">{activeToast.title}</span>
            <span class="text-[9.5px] text-gray-500 truncate block">{activeToast.message}</span>
          </div>
        </button>
      {/if}
 
    <!-- Sticky Bottom Dock (5 Icons) -->
    {#if !nookState.currentApp}
      <div class="shrink-0 bg-white/25 backdrop-blur-md border-4 border-white/35 rounded-[28px] py-2.5 px-4 mx-4 mb-4 flex justify-around items-center gap-1.5 shadow-lg relative z-50">
        <!-- App 1: Passport -->
        {#if dockApps[0]}
          <button
            onclick={() => handleAppLaunch(dockApps[0].id || dockApps[0].name)}
            class="flex flex-col items-center gap-1 bg-transparent border-0 hover:scale-105 transition-all duration-200 cursor-pointer p-0 w-[64px]"
          >
            <div class={`w-[46px] h-[46px] flex items-center justify-center transition-all relative rounded-[14px] overflow-hidden ${dockApps[0].bg || 'bg-[#f5fbf7] border-4 border-white/20 shadow-sm'}`}>
              <NookIcon name={dockApps[0].id || 'passport'} class="w-full h-full object-contain drop-shadow-sm p-1.5" />
            </div>
            <span class="text-[8.5px] font-black text-[#5d5a4a] tracking-tight text-center truncate w-full px-0.5">
              {dockApps[0].name}
            </span>
          </button>
        {/if}

        <!-- App 2: Resident Chat -->
        {#if dockApps[1]}
          <button
            onclick={() => handleAppLaunch(dockApps[1].id || dockApps[1].name)}
            class="flex flex-col items-center gap-1 bg-transparent border-0 hover:scale-105 transition-all duration-200 cursor-pointer p-0 w-[64px]"
          >
            <div class={`w-[46px] h-[46px] flex items-center justify-center transition-all relative rounded-[14px] overflow-hidden ${dockApps[1].bg || 'bg-[#f5fbf7] border-4 border-white/20 shadow-sm'}`}>
              <NookIcon name={dockApps[1].id || 'chat'} class="w-full h-full object-contain drop-shadow-sm p-1.5" />
            </div>
            <span class="text-[8.5px] font-black text-[#5d5a4a] tracking-tight text-center truncate w-full px-0.5">
              {dockApps[1].name}
            </span>
          </button>
        {/if}

        <!-- Home Button (Middle) -->
        <button 
          onclick={handleHomeButton}
          class="flex flex-col items-center justify-center bg-transparent border-0 hover:scale-105 transition-all duration-200 cursor-pointer p-0 w-[64px]"
        >
          <div class="w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center shadow-md border-4 border-white/55 hover:scale-110 active:scale-95 transition-all cursor-pointer p-0 m-0 group">
            <img src={nookIncLogo} alt="Nook Home Menu" class="w-full h-full group-hover:rotate-12 transition-transform" />
          </div>
        </button>

        <!-- App 3: App Store -->
        {#if dockApps[2]}
          <button
            onclick={() => handleAppLaunch(dockApps[2].id || dockApps[2].name)}
            class="flex flex-col items-center gap-1 bg-transparent border-0 hover:scale-105 transition-all duration-200 cursor-pointer p-0 w-[64px]"
          >
            <div class={`w-[46px] h-[46px] flex items-center justify-center transition-all relative rounded-[14px] overflow-hidden ${dockApps[2].bg || 'bg-[#f5fbf7] border-4 border-white/20 shadow-sm'}`}>
              <NookIcon name={dockApps[2].id || 'directory'} class="w-full h-full object-contain drop-shadow-sm p-1.5" />
            </div>
            <span class="text-[8.5px] font-black text-[#5d5a4a] tracking-tight text-center truncate w-full px-0.5">
              {dockApps[2].name}
            </span>
          </button>
        {/if}

        <!-- App 4: Settings -->
        {#if dockApps[3]}
          <button
            onclick={() => handleAppLaunch(dockApps[3].id || dockApps[3].name)}
            class="flex flex-col items-center gap-1 bg-transparent border-0 hover:scale-105 transition-all duration-200 cursor-pointer p-0 w-[64px]"
          >
            <div class={`w-[46px] h-[46px] flex items-center justify-center transition-all relative rounded-[14px] overflow-hidden ${dockApps[3].bg || 'bg-[#f5fbf7] border-4 border-white/20 shadow-sm'}`}>
              <NookIcon name={dockApps[3].id || 'settings'} class="w-full h-full object-contain drop-shadow-sm p-1.5" />
            </div>
            <span class="text-[8.5px] font-black text-[#5d5a4a] tracking-tight text-center truncate w-full px-0.5">
              {dockApps[3].name}
            </span>
          </button>
        {/if}
      </div>
    {:else}
      <!-- Thin Home Indicator Pill (iPhone style) -->
      <button 
        onclick={handleHomeButton}
        class="shrink-0 w-28 h-1.5 bg-[#5d5a4a]/25 hover:bg-[#5d5a4a]/45 rounded-full mx-auto mt-1 mb-2.5 transition-colors cursor-pointer border-0 p-0 block relative z-50 active:scale-95 animate-fade-in"
        title="Go Home"
      ></button>
    {/if}
    </div>
    {/if}

    <!-- App Opening Animation Overlay -->
    {#if launchingApp}
      <div
        transition:fade={{ duration: 150 }}
        class="absolute inset-0 bg-[#e0dcc5]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6"
      >
        <div class="launch-icon-container animate-bounce-in relative">
          <div class={`w-[110px] h-[110px] flex items-center justify-center rounded-[28px] overflow-hidden ${launchingApp.bg || 'bg-[#f5fbf7] border-4 border-white/40 shadow-xl'}`}>
            {#if launchingApp.id}
              <NookIcon name={launchingApp.id} class="w-full h-full object-contain drop-shadow-md p-4" />
            {:else}
              <div class="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none"></div>
              <NookIcon name={launchingApp.appIcon || 'directory'} class="w-full h-full object-contain drop-shadow-md p-4 z-10 relative" />
            {/if}
          </div>
          
          <div class="absolute -top-3 -right-3 text-2xl animate-spin-slow">⭐</div>
          <div class="absolute -bottom-2 -left-2 text-xl animate-bounce-slow">✨</div>
          <div class="absolute -bottom-4 right-6 text-sm animate-pulse">🌸</div>
        </div>
        
        <div class="flex flex-col items-center gap-1">
          <span class="text-xs font-black text-[#5d5a4a] uppercase tracking-widest animate-pulse">
            Starting {launchingApp.name}...
          </span>
          <div class="text-3xl animate-leaf-spin mt-1">🍃</div>
        </div>
      </div>
    {/if}

    <!-- App Installation Animation Overlay -->
    {#if nookState.installingApp}
      <div
        transition:fade={{ duration: 200 }}
        class="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center"
      >
        <div class="relative flex flex-col items-center mb-8">
          <div class="w-10 h-10 bg-red-500 rounded-full shadow-md animate-balloon-float relative flex items-center justify-center">
            <div class="absolute bottom-[-10px] w-2 h-2 bg-red-600 rotate-45"></div>
            <div class="w-0.5 h-10 bg-gray-300 absolute top-9"></div>
          </div>
          
          <div class="w-14 h-14 bg-amber-50 border-4 border-amber-200 rounded-2xl shadow-lg flex items-center justify-center mt-10 animate-present-wobble relative z-10">
            <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 bg-red-500"></div>
            <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2.5 bg-red-500"></div>
            <div class="text-2xl z-10">🎁</div>
          </div>
          
          <div class="absolute -right-6 top-8 text-xl animate-spin-slow">✨</div>
          <div class="absolute -left-6 top-16 text-lg animate-pulse">🌟</div>
        </div>

        <div class="flex flex-col items-center gap-2 max-w-[220px]">
          <h2 class="text-sm font-black text-[#5d5a4a] uppercase tracking-widest m-0 animate-pulse">
            Installing App
          </h2>
          <p class="text-xs font-bold text-gray-500 m-0">
            Delivering <span class="text-emerald-600 font-extrabold">{nookState.installingApp}</span> to your phone...
            </p>
            
            <div class="w-full bg-gray-100 border border-gray-200 h-3 rounded-full mt-4 overflow-hidden relative shadow-inner">
              <div class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full animate-install-progress flex justify-end items-center pr-1">
                <span class="text-[8px] text-white">🍃</span>
              </div>
            </div>
          </div>
        </div>
      {/if}

  </div>
</div>

<style>
  @keyframes leaf-spin-anim {
    0% { transform: rotate(0deg) translateY(0); }
    50% { transform: rotate(180deg) translateY(-6px); }
    100% { transform: rotate(360deg) translateY(0); }
  }
  @keyframes balloon-float-anim {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes present-wobble-anim {
    0%, 100% { transform: rotate(0) scale(1); }
    25% { transform: rotate(-5deg) scale(1.05); }
    75% { transform: rotate(5deg) scale(1.05); }
  }
  @keyframes install-progress-anim {
    0% { width: 0%; }
    100% { width: 100%; }
  }
  @keyframes bounce-in-anim {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.1); opacity: 0.9; }
    70% { transform: scale(0.9); opacity: 1; }
    100% { transform: scale(1); }
  }

  .animate-leaf-spin {
    animation: leaf-spin-anim 2s infinite ease-in-out;
  }
  .animate-balloon-float {
    animation: balloon-float-anim 2.5s infinite ease-in-out;
  }
  .animate-present-wobble {
    animation: present-wobble-anim 0.8s infinite ease-in-out;
  }
  .animate-install-progress {
    animation: install-progress-anim 2.5s forwards linear;
  }
  .animate-bounce-in {
    animation: bounce-in-anim 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  
  :global(.animate-spin-slow) {
    animation: spin 8s linear infinite;
  }
  :global(.animate-bounce-slow) {
    animation: bounce 3s infinite;
  }

  @keyframes boot-bounce-anim {
    0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
    50% { transform: scale(1.1) rotate(10deg); opacity: 1; }
    70% { transform: scale(0.92) rotate(-5deg); }
    85% { transform: scale(1.03) rotate(2deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
  @keyframes boot-progress-anim {
    0% { width: 0%; }
    100% { width: 100%; }
  }
  @keyframes boot-text-anim {
    0% { opacity: 0; transform: translateY(10px) scale(0.9); }
    50% { opacity: 0; }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes drift-leaf-1-anim {
    0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(600px) rotate(360deg) translateX(40px); opacity: 0; }
  }
  @keyframes drift-leaf-2-anim {
    0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
    15% { opacity: 0.8; }
    85% { opacity: 0.8; }
    100% { transform: translateY(600px) rotate(-450deg) translateX(-60px); opacity: 0; }
  }
  @keyframes drift-leaf-3-anim {
    0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
    20% { opacity: 0.9; }
    80% { opacity: 0.9; }
    100% { transform: translateY(600px) rotate(270deg) translateX(25px); opacity: 0; }
  }
  @keyframes drift-leaf-4-anim {
    0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(600px) rotate(-360deg) translateX(-45px); opacity: 0; }
  }

  .animate-boot-bounce {
    animation: boot-bounce-anim 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  .animate-boot-progress {
    animation: boot-progress-anim 2.8s forwards linear;
  }
  .animate-boot-text {
    animation: boot-text-anim 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .animate-drift-leaf-1 {
    animation: drift-leaf-1-anim 3.5s linear infinite;
  }
  .animate-drift-leaf-2 {
    animation: drift-leaf-2-anim 4.2s linear infinite 0.5s;
  }
  .animate-drift-leaf-3 {
    animation: drift-leaf-3-anim 3.8s linear infinite 1.2s;
  }
  .animate-drift-leaf-4 {
    animation: drift-leaf-4-anim 4.5s linear infinite 0.2s;
  }
</style>
