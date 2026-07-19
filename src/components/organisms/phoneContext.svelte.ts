import { getContext, setContext } from "svelte";
import nookState from "@/lib/nookState.svelte";
import { projectsData } from "@/lib/nookData";
import { ALL_WALLPAPERS } from "@/lib/wallpaperData";
import { isProUser } from "@/lib/api";
import { playSound } from "@/lib/audio";

import passportIcon from "@/assets/img/icons/passport_icon.png";
import cameraIcon from "@/assets/img/icons/camera_icon.png";
import milesIcon from "@/assets/img/icons/nook_miles_icon.png";
import critterIcon from "@/assets/img/icons/critterpedia_icon.png";
import diyIcon from "@/assets/img/icons/diy_icon.png";
import designsIcon from "@/assets/img/icons/design_icon.png";
import mapIcon from "@/assets/img/icons/map_icon.png";
import chatIcon from "@/assets/img/icons/chat_icon.png";
import messagesIcon from "@/assets/img/icons/best_friends_icon.png";
import mailIcon from "@/assets/img/icons/mail_icon.png";
import rescueIcon from "@/assets/img/icons/help_icon.png";
import shoppingIcon from "@/assets/img/icons/shopping_icon.png";
import designerIcon from "@/assets/img/icons/terraform_icon.png";
import settingsIcon from "@/assets/img/icons/settings_icon.png";
import contactsIcon from "@/assets/img/icons/contacts_icon.png";
import changelogIcon from "@/assets/img/changelog_icon.svg";
import walletIcon from "@/assets/img/Wallet.png";

export interface CoreApp {
  id: string;
  name: string;
  icon: string;
  bg: string;
  image?: string;
  proOnly?: boolean;
  imageNeedsBg?: boolean;
}

export const CORE_APPS: CoreApp[] = [
  { id: "camera", name: "Camera", icon: "camera", bg: "bg-[#9663d6]", image: cameraIcon },
  { id: "miles", name: "Nook Miles", icon: "miles", bg: "bg-[#79a9dc]", image: milesIcon },
  { id: "critter", name: "Critterpedia", icon: "critter", bg: "bg-[#fed151]", image: critterIcon },
  { id: "diy", name: "DIY Recipes", icon: "diy", bg: "bg-[#f39566]", image: diyIcon },
  {
    id: "shopping",
    name: "Nook Shopping",
    icon: "shopping",
    bg: "bg-[#ebce3f]",
    image: shoppingIcon
  },
  {
    id: "designer",
    name: "Island Designer",
    icon: "designer",
    bg: "bg-[#9f854b]",
    image: designerIcon
  },
  {
    id: "designs",
    name: "Custom Designs",
    icon: "designs",
    bg: "bg-[#fdafb2]",
    image: designsIcon
  },
  { id: "map", name: "Map", icon: "map", bg: "bg-[#75cfbe]", image: mapIcon },
  { id: "passport", name: "Passport", icon: "passport", bg: "bg-[#7cb988]", image: passportIcon },
  { id: "settings", name: "Settings", icon: "settings", bg: "bg-[#5c4a3d]", image: settingsIcon },
  { id: "directory", name: "Residential Recycle Box", icon: "directory", bg: "bg-[#45a38f]" },
  {
    id: "contacts",
    name: "Contacts",
    icon: "contacts",
    bg: "bg-[#9cc677]",
    image: contactsIcon
  },
  {
    id: "dodo_air",
    name: "Dodo Air",
    icon: "dodo_air",
    bg: "bg-[#1b9be0]"
  },
  { id: "rescue", name: "Rescue Service", icon: "rescue", bg: "bg-[#ec6241]" },
  {
    id: "changelog",
    name: "Changelog",
    icon: "changelog",
    bg: "bg-[#79a9dc]",
    image: changelogIcon,
    imageNeedsBg: true
  },
  {
    id: "chat",
    name: "Bulletin Board",
    icon: "chat",
    bg: "bg-[#eb6a9d]",
    image: chatIcon,
    proOnly: true
  },
  {
    id: "messages",
    name: "Messages",
    icon: "mail",
    bg: "bg-[#8b3a3a]",
    image: mailIcon,
    proOnly: true
  },
  {
    id: "best_friends",
    name: "Best Friends",
    icon: "best_friend",
    bg: "bg-[#ffd375]",
    image: messagesIcon,
    proOnly: true
  },
  {
    id: "abd",
    name: "ABD",
    icon: "wallet",
    bg: "bg-[#d9f6af]",
    image: walletIcon,
    proOnly: true
  }
];

export class PhoneContext {
  isBooting = $state(true);
  timeStr = $state("12:00 PM");
  activeToast = $state<any>(null);
  showNotificationCenter = $state(false);
  launchingApp = $state<any>(null);
  isEditMode = $state(false);

  allApps = $derived([
    ...CORE_APPS,
    ...((nookState.installedApps || [])
      .map((name) => projectsData.find((p) => p.name === name))
      .filter(Boolean) as any[])
  ]);

  homeScreenApps = $derived(this.allApps.filter((a) => nookState.isAppPinned(a.id || a.name)));
  dockApps = $derived(
    nookState.dockApps
      .map((id) => this.allApps.find((a) => (a.id || a.name) === id))
      .filter(Boolean) as CoreApp[]
  );
  desktopApps = $derived(this.allApps.filter((a) => !nookState.dockApps.includes(a.id || a.name)));

  customWallpaper = $derived(
    nookState.customDesigns.find((d) => d.id === nookState.activeWallpaperId)
  );
  currentWallpaper = $derived(
    this.customWallpaper
      ? null
      : ALL_WALLPAPERS.find((w) => w.id === nookState.activeWallpaperId) || ALL_WALLPAPERS[0]
  );

  wallpaperStyle = $derived(
    this.customWallpaper
      ? `background-image: conic-gradient(from 0deg, ${this.customWallpaper.grid[0][0]}, ${this.customWallpaper.grid[4][4]}, ${this.customWallpaper.grid[8][8]}); background-size: cover;`
      : this.currentWallpaper?.url
        ? `background-image: url('${this.currentWallpaper.url}'); background-size: cover; background-position: center;`
        : ""
  );

  isDarkTheme = $derived(this.customWallpaper ? false : !!this.currentWallpaper?.isDark);

  showPremiumUpsell = $state(false);
  hoveredAppName = $state("NookPhone");

  handleAppLaunch(appId: string) {
    // Intercept with default app if set
    if (nookState.settings?.defaultApps && nookState.settings.defaultApps[appId]) {
      appId = nookState.settings.defaultApps[appId];
    }

    const app = this.allApps.find((a) => (a.id || a.name) === appId);
    const isCore = CORE_APPS.some((c) => c.id === appId);
    const isThirdParty = !isCore;

    if (app && (app.proOnly || isThirdParty) && !isProUser()) {
      playSound('error', !nookState.settings.soundEffects);
      this.showPremiumUpsell = true;
      return;
    }

    playSound('success', !nookState.settings.soundEffects);
    this.launchingApp = app || { name: appId, id: appId };
    
    // Analytics: Track App Open
    import("@/lib/analytics").then(({ analytics }) => {
      analytics.trackAppOpen(app ? app.name : appId);
    });

    setTimeout(() => {
      nookState.navigate(appId);
      this.launchingApp = null;
    }, 850);
  }

  handleHomeButton = () => {
    if (nookState.currentApp) {
      playSound('thwip', !nookState.settings.soundEffects);
      import("@/lib/analytics").then(({ analytics }) => {
        analytics.trackInteraction('home_button_press', 'navigation');
      });
      nookState.navigate(null);
    }
  };

  handlePowerButton = () => {
    const locking = !nookState.isPhoneLocked;
    playSound(locking ? 'close' : 'open', !nookState.settings.soundEffects);
    import("@/lib/analytics").then(({ analytics }) => {
      analytics.trackInteraction(locking ? 'phone_locked' : 'phone_unlocked', 'engagement');
    });
    nookState.setPhoneLocked(locking);
  };

  handleUnlock = () => {
    playSound('open', !nookState.settings.soundEffects);
    import("@/lib/analytics").then(({ analytics }) => {
      analytics.trackInteraction('phone_unlocked', 'engagement');
    });
    nookState.setPhoneLocked(false);
  };
}

const PHONE_CTX_KEY = Symbol("PHONE_CTX");

export function setPhoneContext() {
  const ctx = new PhoneContext();
  setContext(PHONE_CTX_KEY, ctx);
  return ctx;
}

export function getPhoneContext() {
  return getContext<PhoneContext>(PHONE_CTX_KEY);
}
