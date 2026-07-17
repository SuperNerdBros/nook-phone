import { getContext, setContext } from 'svelte';
import nookState from '@/lib/nookState.svelte';
import { projectsData } from '@/lib/nookData';
import { ALL_WALLPAPERS } from '@/lib/wallpaperData';
import { isProUser } from '@/lib/api';

import passportIcon from '@/assets/img/icons/passport_icon.png';
import cameraIcon from '@/assets/img/icons/camera_icon.png';
import milesIcon from '@/assets/img/icons/nook_miles_icon.png';
import critterIcon from '@/assets/img/icons/critterpedia_icon.png';
import diyIcon from '@/assets/img/icons/diy_icon.png';
import designsIcon from '@/assets/img/icons/design_icon.png';
import mapIcon from '@/assets/img/icons/map_icon.png';
import chatIcon from '@/assets/img/icons/chat_icon.png';
import messagesIcon from '@/assets/img/icons/best_friends_icon.png';
import rescueIcon from '@/assets/img/icons/help_icon.png';
import shoppingIcon from '@/assets/img/icons/shopping_icon.png';
import designerIcon from '@/assets/img/icons/terraform_icon.png';
import settingsIcon from '@/assets/img/icons/settings_icon.png';
import contactsIcon from '@/assets/img/icons/contacts_icon.png';

export interface CoreApp {
  id: string;
  name: string;
  icon: string;
  bg: string;
  image?: string;
  proOnly?: boolean;
}

export const CORE_APPS: CoreApp[] = [
  { id: "directory", name: "Call Islander", icon: "directory", bg: "bg-[#f3cd4a]" },
  { id: "passport", name: "Passport", icon: "passport", bg: "bg-[#7cb988]", image: passportIcon },
  { id: "camera", name: "Camera", icon: "camera", bg: "bg-[#9663d6]", image: cameraIcon },
  { id: "miles", name: "Nook Miles", icon: "miles", bg: "bg-[#79a9dc]", image: milesIcon },
  { id: "critter", name: "Critterpedia", icon: "critter", bg: "bg-[#fed151]", image: critterIcon },
  { id: "diy", name: "DIY Recipes", icon: "diy", bg: "bg-[#f39566]", image: diyIcon },
  { id: "designs", name: "Custom Designs", icon: "designs", bg: "bg-[#fdafb2]", image: designsIcon },
  { id: "map", name: "Map", icon: "map", bg: "bg-[#75cfbe]", image: mapIcon },
  { id: "chat", name: "Chat Log", icon: "chat", bg: "bg-[#d3e551]", image: chatIcon, proOnly: true },
  { id: "messages", name: "Best Friends List", icon: "best_friend", bg: "bg-[#f18e5b]", image: messagesIcon, proOnly: true },
  { id: "rescue", name: "Rescue Service", icon: "rescue", bg: "bg-[#ec6241]", image: rescueIcon },
  { id: "shopping", name: "Nook Shopping", icon: "shopping", bg: "bg-[#ebce3f]", image: shoppingIcon },
  { id: "contacts", name: "Contacts", icon: "best_friend", bg: "bg-[#8cc3b0]", image: contactsIcon },
  { id: "designer", name: "Island Designer", icon: "designer", bg: "bg-[#9f854b]", image: designerIcon },
  { id: "settings", name: "Settings", icon: "settings", bg: "bg-[#8ba6a4]", image: settingsIcon }
];

const DOCK_APP_IDS = ["passport", "contacts", "chat", "directory", "settings"];

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
  hoveredAppName = $state("NookPhone");

  handleAppLaunch(appId: string) {
    // Intercept with default app if set
    if (nookState.settings?.defaultApps && nookState.settings.defaultApps[appId]) {
      appId = nookState.settings.defaultApps[appId];
    }

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
