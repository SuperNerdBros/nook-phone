<script lang="ts">
  import { onMount } from 'svelte'; 
  import nookState from '@/lib/nookState.svelte';
  import { islandLifeTips } from '@/lib/nookData';
  import { setPhoneContext, CORE_APPS } from './phoneContext.svelte';

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
  import BestFriendsApp from '../pages/BestFriendsApp.svelte';
  import RescueApp from '../pages/RescueApp.svelte';
  import ShoppingApp from '../pages/ShoppingApp.svelte';
  import ContactsApp from '../pages/ContactsApp.svelte';
  import DesignerApp from '../pages/DesignerApp.svelte';
  import DodoAirApp from '../pages/DodoAirApp.svelte';
  import SettingsApp from '../pages/SettingsApp.svelte';
  import ChangelogApp from '../pages/ChangelogApp.svelte';
  import PrivacyApp from '../pages/PrivacyApp.svelte';
  import TermsApp from '../pages/TermsApp.svelte';
  import AbdApp from '../pages/AbdApp.svelte';

  import NookBootScreen from '../molecules/NookBootScreen.svelte';
  import NookStatusBar from '../molecules/NookStatusBar.svelte';
  import NookLockScreen from '../molecules/NookLockScreen.svelte';
  import NookHomeScreen from '../molecules/NookHomeScreen.svelte';
  import PremiumUpsellModal from './PremiumUpsellModal.svelte';
  import NookDock from '../molecules/NookDock.svelte';
  import NookNotificationCenter from '../molecules/NookNotificationCenter.svelte';
  import NookNotificationToast from '../molecules/NookNotificationToast.svelte';
  import NookAppLaunchAnim from '../molecules/NookAppLaunchAnim.svelte';
  import NookAppInstallAnim from '../molecules/NookAppInstallAnim.svelte';
  import NookExternalAppScreen from '../molecules/NookExternalAppScreen.svelte';

  const ctx = setPhoneContext();

  onMount(() => {
    setTimeout(() => {
      ctx.isBooting = false;
    }, 2800);

    const updateTime = () => {
      const now = new Date();
      ctx.timeStr = now.toLocaleTimeString([], { 
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
      ctx.activeToast = notif;
      
      setTimeout(() => {
        if (ctx.activeToast && ctx.activeToast.id === notif.id) {
          ctx.activeToast = null;
        }
      }, 4000);
    };

    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/app\/(.+)$/);
      const targetApp = match ? decodeURIComponent(match[1]) : null;
      const currentFullPath = nookState.currentApp ? (nookState.currentApp + (nookState.subRoute ? '/' + nookState.subRoute : '')) : null;
      if (currentFullPath !== targetApp) {
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
</script>

<div id="nook-phone-canvas" class="w-full h-full max-h-full overflow-hidden relative z-10">
  <NookBootScreen />
  <PremiumUpsellModal />
  
  <!-- Main OS Frame -->
  <div class="w-full h-full max-h-full relative overflow-hidden flex flex-col bg-[#fdfcf2] select-none">
    {#if nookState.currentApp === "passport" && !nookState.hasCompletedOnboarding}
      <Onboarding />
    {:else}
      <!-- Dynamic Status Bar -->
      <NookStatusBar />
      
      <!-- Lock Screen overlay -->
      <NookLockScreen />

      <!-- Dynamic Display Screens -->
      <div 
        class={`flex-1 relative overflow-hidden flex flex-col h-full bg-[#fdfcf2] ${(!ctx.customWallpaper && (ctx.currentWallpaper as any)?.isDefault) ? (ctx.currentWallpaper as any).bg : ''}`}
        style={ctx.wallpaperStyle}
      >
        <!-- Wallpaper Star/Leaf Pattern Overlay -->
        {#if !ctx.customWallpaper && (ctx.currentWallpaper as any)?.isDefault}
          <div 
            class="absolute inset-0 opacity-[0.14] pointer-events-none z-0" 
            style={`background-image: url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 5l5 10h10l-8 7 3 10-10-6-10 6 3-10-8-7h10z%22 ${(ctx.currentWallpaper as any).pattern} fill-opacity=%220.4%22/%3E%3C/svg%3E'); background-size: 56px 56px;`}
          ></div>
        {/if}
        {#if nookState.currentApp}
          <!-- ACTIVE APPLICATION WINDOW -->
          <div class="flex-1 min-h-0 flex flex-col z-10 relative">
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
            {#if nookState.currentApp === "best_friends"} <BestFriendsApp /> {/if}
            {#if nookState.currentApp === "rescue"} <RescueApp /> {/if}
            {#if nookState.currentApp === "shopping"} <ShoppingApp /> {/if}
            {#if nookState.currentApp === "contacts"} <ContactsApp /> {/if}
            {#if nookState.currentApp === "designer"} <DesignerApp /> {/if}
            {#if nookState.currentApp === "settings"} <SettingsApp /> {/if}
            {#if nookState.currentApp === "changelog"} <ChangelogApp /> {/if}
            {#if nookState.currentApp === "dodo_air"} <DodoAirApp /> {/if}
            {#if nookState.currentApp === "privacy"} <PrivacyApp /> {/if}
            {#if nookState.currentApp === "terms"} <TermsApp /> {/if}
            {#if nookState.currentApp === "abd"} <AbdApp /> {/if}

            <!-- Launching embedded directory pinned frames -->
            <NookExternalAppScreen />
          </div>
        {:else}
          <!-- LAUNCHER HOME SCREEN -->
          <div class="flex-1 flex flex-col justify-between p-4 pb-2 relative h-full overflow-hidden bg-transparent z-10">
            <div class="flex flex-col gap-3.5 relative z-10 flex-1">
              <div class="relative flex-1">
                <NookHomeScreen />
              </div>
            </div>
          </div>
        {/if}

        <NookNotificationCenter />
        <NookNotificationToast />
        <NookDock />
      </div>
    {/if}

    <NookAppLaunchAnim />
    <NookAppInstallAnim />

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

  :global(.animate-leaf-spin) {
    animation: leaf-spin-anim 2s infinite ease-in-out;
  }
  :global(.animate-balloon-float) {
    animation: balloon-float-anim 2.5s infinite ease-in-out;
  }
  :global(.animate-present-wobble) {
    animation: present-wobble-anim 0.8s infinite ease-in-out;
  }
  :global(.animate-install-progress) {
    animation: install-progress-anim 2.5s forwards linear;
  }
  :global(.animate-bounce-in) {
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

  :global(.animate-boot-bounce) {
    animation: boot-bounce-anim 1.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  :global(.animate-boot-progress) {
    animation: boot-progress-anim 2.8s forwards linear;
  }
  :global(.animate-boot-text) {
    animation: boot-text-anim 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  :global(.animate-drift-leaf-1) {
    animation: drift-leaf-1-anim 3.5s linear infinite;
  }
  :global(.animate-drift-leaf-2) {
    animation: drift-leaf-2-anim 4.2s linear infinite 0.5s;
  }
  :global(.animate-drift-leaf-3) {
    animation: drift-leaf-3-anim 3.8s linear infinite 1.2s;
  }
  :global(.animate-drift-leaf-4) {
    animation: drift-leaf-4-anim 4.5s linear infinite 0.2s;
  }
</style>
