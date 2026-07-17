import { getContext, setContext } from 'svelte';
import nookState from '@/lib/nookState.svelte';
import { projectsData } from '@/lib/nookData';
import { ALL_WALLPAPERS } from '@/lib/wallpaperData';
import { isProUser } from '@/lib/api';

export interface CoreApp {
  id: string;
  name: string;
  icon: string;
  bg: string;
  proOnly?: boolean;
}

export const CORE_APPS: CoreApp[] = [
  { id: "directory", name: "Call Islander", icon: "directory", bg: "bg-[#f3cd4a]" },
  { id: "passport", name: "Passport", icon: "passport", bg: "bg-[#7cb988]", proOnly: true },
  { id: "camera", name: "Camera", icon: "camera", bg: "bg-[#9663d6]" },
  { id: "miles", name: "Nook Miles", icon: "miles", bg: "bg-[#79a9dc]" },
  { id: "critter", name: "Critterpedia", icon: "critter", bg: "bg-[#fed151]" },
  { id: "diy", name: "DIY Recipes", icon: "diy", bg: "bg-[#f39566]" },
  { id: "designs", name: "Custom Designs", icon: "designs", bg: "bg-[#fdafb2]" },
  { id: "map", name: "Map", icon: "map", bg: "bg-[#75cfbe]" },
  { id: "chat", name: "Chat Log", icon: "chat", bg: "bg-[#d3e551]", proOnly: true },
  { id: "messages", name: "Best Friends List", icon: "best_friend", bg: "bg-[#f18e5b]", proOnly: true },
  { id: "rescue", name: "Rescue Service", icon: "rescue", bg: "bg-[#ec6241]" },
  { id: "shopping", name: "Nook Shopping", icon: "shopping", bg: "bg-[#ebce3f]" },
  { id: "designer", name: "Island Designer", icon: "designer", bg: "bg-[#9f854b]" },
  { id: "settings", name: "Settings", icon: "settings", bg: "bg-[#8ba6a4]" }
];

const DOCK_APP_IDS = ["passport", "chat", "directory", "settings"];

export class PhoneContext {
  isBooting = $state(true);
  timeStr = $state("12:00 PM");
  isAppDrawerOpen = $state(false);
  activeToast = $state<any>(null);
  showNotificationCenter = $state(false);
  launchingApp = $state<any>(null);

  allApps = $derived([
    ...CORE_APPS,
    ...projectsData.filter(p => nookState.isAppInstalled(p.name))
  ]);
  
  homeScreenApps = $derived(this.allApps.filter(a => nookState.isAppPinned(a.id || a.name)));
  dockApps = $derived(this.allApps.filter(a => a.id && DOCK_APP_IDS.includes(a.id)));
  desktopApps = $derived(this.homeScreenApps.filter(a => !DOCK_APP_IDS.includes(a.id || a.name)));

  customWallpaper = $derived(nookState.customDesigns.find(d => d.id === nookState.activeWallpaperId));
  currentWallpaper = $derived(this.customWallpaper 
    ? null 
    : (ALL_WALLPAPERS.find(w => w.id === nookState.activeWallpaperId) || ALL_WALLPAPERS[0]));

  wallpaperStyle = $derived(this.customWallpaper
    ? `background-image: conic-gradient(from 0deg, ${this.customWallpaper.grid[0][0]}, ${this.customWallpaper.grid[4][4]}, ${this.customWallpaper.grid[8][8]}); background-size: cover;`
    : (this.currentWallpaper?.url ? `background-image: url('${this.currentWallpaper.url}'); background-size: cover; background-position: center;` : ""));
    
  isDarkTheme = $derived(this.customWallpaper ? false : !!this.currentWallpaper?.isDark);

  showPremiumUpsell = $state(false);

  handleAppLaunch(appId: string) {
    const app = this.allApps.find(a => (a.id || a.name) === appId);
    
    if (app && app.proOnly && !isProUser()) {
      this.showPremiumUpsell = true;
      return;
    }
    
    this.launchingApp = app || { name: appId, id: appId };
    
    setTimeout(() => {
      nookState.navigate(appId);
      this.launchingApp = null;
    }, 850);
  }

  handleHomeButton = () => {
    if (nookState.currentApp) {
      nookState.navigate(null);
      this.isAppDrawerOpen = false;
    } else {
      this.isAppDrawerOpen = !this.isAppDrawerOpen;
    }
  }

  handlePowerButton = () => {
    nookState.setPhoneLocked(!nookState.isPhoneLocked);
  }

  handleUnlock = () => {
    nookState.setPhoneLocked(false);
  }
}

const PHONE_CTX_KEY = Symbol('PHONE_CTX');

export function setPhoneContext() {
  const ctx = new PhoneContext();
  setContext(PHONE_CTX_KEY, ctx);
  return ctx;
}

export function getPhoneContext() {
  return getContext<PhoneContext>(PHONE_CTX_KEY);
}
