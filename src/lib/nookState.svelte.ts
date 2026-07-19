import {
  projectsData,
  crittersData,
  diyData,
  catalogData,
  mapData,
  milesData,
  type ProjectItem,
  type Critter,
  type DIYRecipe,
  type CatalogItem,
  type MapBuilding,
  type MilesChallenge
} from "./nookData";
import { fetchRemoteState, saveRemoteState, isProUser } from "./api";
import { playSound } from "./audio";

export interface PassportInfo {
  name: string;
  islandName: string;
  friendCode: string;
  photoUrl: string;
  titlePrefix: string;
  titleSuffix: string;
  comment: string;
}

export interface CustomDesign {
  id: string;
  name: string;
  grid: string[][];
  creator: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isNpc: boolean;
  avatar?: string;
}

export interface NookNotification {
  id: string;
  title: string;
  message: string;
  sender: string;
  timestamp: string;
  isRead: boolean;
}

export interface NookOSState {
  currentApp: string | null;
  isPhoneLocked: boolean;
  activeTab: number;
  bells: number;
  miles: number;
  passport: PassportInfo;
  critters: {
    caught: string[];
    donated: string[];
    filterType: "all" | "bug" | "fish" | "sea";
    filterHemisphere: "north" | "south";
  };
  diy: {
    unlockedRecipes: string[];
    craftedCount: number;
    filterCategory: "all" | "tools" | "furniture" | "cooking";
  };
  catalog: {
    purchasedIds: string[];
    wishlistIds: string[];
    storageIds: string[];
    forTradeIds: string[];
    itemQuantities: Record<string, number>;
  };
  map: {
    buildings: MapBuilding[];
    imageUrl?: string;
  };
  residents: string[];
  milesChallenges: MilesChallenge[];
  chatLog: ChatMessage[];
  notifications: NookNotification[];
  installingApp: string | null;
  customDesigns: CustomDesign[];
  activeWallpaperId: string;
  pinnedApps: string[];
  installedApps: string[];
  hasCompletedOnboarding: boolean;
  settings: {
    use24HourTime: boolean;
    showBatteryPercentage: boolean;
    reduceMotion: boolean;
    soundEffects: boolean;
    gridSize: number;
    defaultApps: Record<string, string>;
  };
  unreadDMs: number;
  bestFriends: string[];
  myContacts: string[];
  villagerMilestones: Record<string, {
    hasPoster: boolean;
    hasPhoto: boolean;
    talkedToday: boolean;
    giftedToday: boolean;
  }>;
  bestFriends: (string | number)[];
  bestFriendsCommunicationsOn: boolean;
  subRoute?: string;
  dockApps: string[];
  subscribedSublogs: string[];
  appDonations: Record<string, number>;
  patreonTierCents?: number;
  loanBalance?: number;
  hasReceivedAllowance?: boolean;
  maxAppSlots?: number;
}

const DEFAULT_GRID_LEAF = [
  ["#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#4ade80", "#4ade80", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#4ade80", "#22c55e", "#22c55e", "#4ade80", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#fdfcf0", "#4ade80", "#22c55e", "#16a34a", "#16a34a", "#22c55e", "#4ade80", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#15803d", "#16a34a", "#22c55e", "#4ade80", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#15803d", "#15803d", "#15803d", "#16a34a", "#22c55e", "#4ade80", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#ca8a04", "#ca8a04", "#15803d", "#15803d", "#16a34a", "#22c55e", "#4ade80", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#ca8a04", "#ca8a04", "#15803d", "#16a34a", "#22c55e", "#4ade80", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#fdfcf0", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#ca8a04", "#15803d", "#16a34a", "#22c55e", "#4ade80", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#16a34a", "#22c55e", "#4ade80", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#4ade80", "#22c55e", "#16a34a", "#22c55e", "#4ade80", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#4ade80", "#22c55e", "#4ade80", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#4ade80", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"],
  ["#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0", "#fdfcf0"]
];

const DEFAULT_GRID_SHIRT = Array(16).fill(null).map((_, r) => 
  Array(16).fill(null).map((_, c) => 
    (r + c) % 4 === 0 ? "#ef4444" : (r % 2 === 0 ? "#f97316" : "#facc15")
  )
);

const INITIAL_STATE: NookOSState = {
  currentApp: null,
  isPhoneLocked: false,
  activeTab: 0,
  bells: 25000,
  miles: 1500,
  maxAppSlots: 18,
  passport: {
    name: "Villager",
    islandName: "Nook Island",
    friendCode: "",
    photoUrl: "https://picsum.photos/seed/animalcrossing/300/300",
    titlePrefix: "Horizon",
    titleSuffix: "Dweller",
    comment: "Living my best life in paradise! 🏝️"
  },
  critters: {
    caught: [],
    donated: [],
    filterType: "all",
    filterHemisphere: "north"
  },
  diy: {
    unlockedRecipes: ["diy1", "diy2", "diy4", "diy5"],
    craftedCount: 0,
    filterCategory: "all"
  },
  catalog: {
    purchasedIds: [],
    wishlistIds: [],
    storageIds: [],
    forTradeIds: [],
    itemQuantities: {}
  },
  map: {
    buildings: [...mapData]
  },
  residents: [],
  milesChallenges: [...milesData],
  chatLog: [
    { id: "c1", sender: "Tom Nook", content: "Welcome to NookOS, yes, yes! Use your phone to manage your island and check the directories!", timestamp: "10:00 AM", isNpc: true, avatar: "🍃" }
  ],
  notifications: [],
  installingApp: null,
  customDesigns: [
    { id: "d1", name: "Nook Leaf", grid: DEFAULT_GRID_LEAF, creator: "Timmy" },
    { id: "d2", name: "Island Tee", grid: DEFAULT_GRID_SHIRT, creator: "Tommy" },
    { id: "d3", name: "Custom Tile", grid: Array(16).fill(null).map(() => Array(16).fill("#ffffff")), creator: "Villager" }
  ],
  activeWallpaperId: "default",
  pinnedApps: ["camera", "miles", "critter", "diy", "designs", "designer", "map", "chat", "passport", "messages", "shopping", "best_friends", "tune_maker", "abd"],
  installedApps: ["tune_maker"],
  hasCompletedOnboarding: false,
  settings: {
    use24HourTime: false,
    showBatteryPercentage: true,
    reduceMotion: false,
    soundEffects: true,
    gridSize: 3,
    defaultApps: {}
  },
  unreadDMs: 0,
  bestFriends: [],
  myContacts: [],
  villagerMilestones: {},
  bestFriends: [],
  bestFriendsCommunicationsOn: true,
  subRoute: "",
  dockApps: ["directory", "contacts", "settings"],
  subscribedSublogs: ["bb/Isabelle", "bb/TomNook"],
  appDonations: {},
  loanBalance: 0,
  hasReceivedAllowance: false
};

class NookStateManager {
  state = $state<NookOSState>({ ...INITIAL_STATE });

  get currentApp() { return this.state.currentApp; }
  set currentApp(val) { this.state.currentApp = val; }

  get isPhoneLocked() { return this.state.isPhoneLocked; }
  set isPhoneLocked(val) { this.state.isPhoneLocked = val; }

  get activeTab() { return this.state.activeTab; }
  set activeTab(val) { this.state.activeTab = val; }

  get bells() { return this.state.bells; }
  set bells(val) { this.state.bells = val; }

  get miles() { return this.state.miles; }
  set miles(val) { this.state.miles = val; }

  get passport() { return this.state.passport; }
  set passport(val) { this.state.passport = val; }

  get subscribedSublogs() { return this.state.subscribedSublogs; }
  set subscribedSublogs(val) { this.state.subscribedSublogs = val; }

  isSubscribed(sublog: string) { return this.state.subscribedSublogs.includes(sublog); }
  toggleSubscription(sublog: string) {
    if (this.isSubscribed(sublog)) {
      this.state.subscribedSublogs = this.state.subscribedSublogs.filter(s => s !== sublog);
    } else {
      this.state.subscribedSublogs = [...this.state.subscribedSublogs, sublog];
    }
    this.save();
  }

  get critters() { return this.state.critters; }
  set critters(val) { this.state.critters = val; }

  get diy() { return this.state.diy; }
  set diy(val) { this.state.diy = val; }

  get catalog() { return this.state.catalog; }
  set catalog(val) { this.state.catalog = val; }

  get map() { return this.state.map; }
  set map(val) { this.state.map = val; }

  get residents() { return this.state.residents || []; }

  get milesChallenges() { return this.state.milesChallenges; }
  set milesChallenges(val) { this.state.milesChallenges = val; }

  get chatLog() { return this.state.chatLog; }
  set chatLog(val) { this.state.chatLog = val; }

  get customDesigns() { return this.state.customDesigns; }
  set customDesigns(val) { this.state.customDesigns = val; }

  get notifications() { return this.state.notifications || []; }
  set notifications(val) { this.state.notifications = val; }

  get installingApp() { return this.state.installingApp; }
  set installingApp(val) { this.state.installingApp = val; }

  get activeWallpaperId() { return this.state.activeWallpaperId; }
  set activeWallpaperId(val) { this.state.activeWallpaperId = val; }

  get pinnedApps() { return this.state.pinnedApps; }
  set pinnedApps(val) { this.state.pinnedApps = val; }

  get installedApps() { return this.state.installedApps || []; }
  set installedApps(val) { this.state.installedApps = val; }

  get hasCompletedOnboarding() { return this.state.hasCompletedOnboarding || false; }
  set hasCompletedOnboarding(val) { this.state.hasCompletedOnboarding = val; }

  get settings() { return this.state.settings; }
  set settings(val) { this.state.settings = val; }

  get unreadDMs() { return this.state.unreadDMs || 0; }
  set unreadDMs(val) { this.state.unreadDMs = val; }

  get subRoute() { return this.state.subRoute || ''; }
  set subRoute(val) { this.state.subRoute = val; }

  get bestFriends() { return this.state.bestFriends || []; }
  set bestFriends(val) { this.state.bestFriends = val; }

  get myContacts() { return this.state.myContacts || []; }
  set myContacts(val) { this.state.myContacts = val; }

  get villagerMilestones() { return this.state.villagerMilestones || {}; }
  set villagerMilestones(val) { this.state.villagerMilestones = val; }

  get appDonations() { return this.state.appDonations || {}; }
  set appDonations(val) { this.state.appDonations = val; }

  get patreonTierCents() { return this.state.patreonTierCents || 0; }
  set patreonTierCents(val) { this.state.patreonTierCents = val; }

  get loanBalance() { return this.state.loanBalance || 0; }
  set loanBalance(val) { this.state.loanBalance = val; this.save(); }

  get hasReceivedAllowance() { return this.state.hasReceivedAllowance || false; }
  set hasReceivedAllowance(val) { this.state.hasReceivedAllowance = val; this.save(); }

  get maxAppSlots() { return this.state.maxAppSlots || 18; }
  set maxAppSlots(val) { this.state.maxAppSlots = val; this.save(); }

  payLoan(amount: number): boolean {
    const currentLoan = this.state.loanBalance || 0;
    if (this.state.bells < amount) return false;
    const toPay = Math.min(amount, currentLoan);
    if (toPay <= 0) return false;
    this.state.bells -= toPay;
    this.state.loanBalance = currentLoan - toPay;
    this.save();
    return true;
  }

  isAppPermanent(appId: string): boolean {
    if (!this.state.appDonations) return false;
    return (this.state.appDonations[appId] || 0) >= 98000;
  }

  donateToApp(appId: string, amount: number): boolean {
    if (this.state.bells < amount) return false;
    
    if (!this.state.appDonations) this.state.appDonations = {};
    const current = this.state.appDonations[appId] || 0;
    
    this.state.bells -= amount;
    this.state.appDonations[appId] = current + amount;
    this.save();
    return true;
  }


  get bestFriendsCommunicationsOn() { return this.state.bestFriendsCommunicationsOn !== false; }
  set bestFriendsCommunicationsOn(val) { this.state.bestFriendsCommunicationsOn = val; }

  get dockApps() { return this.state.dockApps || ["directory", "contacts", "settings"]; }
  set dockApps(val) { this.state.dockApps = val; }

  activeChatPartner = $state<{ id: number; name: string } | null>(null);

  toggleBestFriend(friendId: string | number) {
    if (!this.state.bestFriends) this.state.bestFriends = [];
    if (this.state.bestFriends.includes(friendId as any)) {
      this.state.bestFriends = this.state.bestFriends.filter(id => id !== friendId);
    } else {
      this.state.bestFriends.push(friendId as any);
    }
    this.save();
  }

  isBestFriend(friendId: string | number): boolean {
    if (!this.state.bestFriends) return false;
    return this.state.bestFriends.includes(friendId as any);
  }

  toggleBestFriendsCommunications() {
    this.state.bestFriendsCommunicationsOn = !this.bestFriendsCommunicationsOn;
    this.save();
  }

  private syncTimeout: any = null;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const userId = window.wpApiSettings?.userId || 0;
        const storageKey = `nook_os_state_v1_user_${userId}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.dockApps && parsed.dockApps.length === 3 && parsed.dockApps[0] === "directory" && parsed.dockApps[1] === "messages" && parsed.dockApps[2] === "contacts") {
            parsed.dockApps = ["directory", "contacts", "settings"];
          }
          if (parsed.catalog) {
            if (!parsed.catalog.wishlistIds) parsed.catalog.wishlistIds = [];
            if (!parsed.catalog.storageIds) parsed.catalog.storageIds = [];
            if (!parsed.catalog.forTradeIds) parsed.catalog.forTradeIds = [];
            if (!parsed.catalog.itemQuantities) parsed.catalog.itemQuantities = {};
          }
          if (parsed.settings) {
            parsed.settings = { ...this.state.settings, ...parsed.settings };
            if (parsed.settings.soundEffects === undefined) parsed.settings.soundEffects = true;
          }
          this.state = { ...this.state, ...parsed };
        }
      } catch (e) {
        console.error("Failed to load state from localStorage:", e);
      }
    }
    
    // Ensure notifications is initialized
    if (!this.state.notifications) {
      this.state.notifications = [];
    }
    
    // Seed initial notification if empty
    if (this.state.notifications.length === 0) {
      this.state.notifications = [
        {
          id: "n_welcome",
          title: "Welcome to Island Life!",
          message: "Make sure to shake trees with a net in hand to catch any pesky wasps!",
          sender: "Tom Nook",
          timestamp: "10:00 AM",
          isRead: false
        }
      ];
    }

    if (typeof window !== "undefined") {
      this.initializeAsync();
    }
  }
  showRewardFlow = $state(false);

  get hasPendingAllowance() {
    return this.state.patreonTierCents && this.state.patreonTierCents > 0 && !this.state.hasReceivedAllowance;
  }

  depositAllowance() {
    this.state.bells += 500000;
    this.state.loanBalance = 50000;
    this.state.hasReceivedAllowance = true;
    this.save();
  }

  async initializeAsync() {
    if (isProUser()) {
      const remoteState = await fetchRemoteState();
      if (remoteState) {
        // Cloud Overwrites Local (if cloud exists)
        if (remoteState.settings) {
          remoteState.settings = { ...this.state.settings, ...remoteState.settings };
          if (remoteState.settings.soundEffects === undefined) remoteState.settings.soundEffects = true;
        }
        this.state = { ...this.state, ...remoteState };
        this.saveLocal();
      } else {
        // Seamless Merge: Cloud is empty, push local state up
        this.syncToCloud(true);
      }
    }
    
    // Check if they linked Patreon and need their 500k allowance deposited
    if (this.hasPendingAllowance) {
      this.showRewardFlow = true;
    }
  }

  saveLocal() {
    if (typeof window !== "undefined") {
      try {
        const userId = window.wpApiSettings?.userId || 0;
        const storageKey = `nook_os_state_v1_user_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(this.state));
      } catch (e) {
        console.error("Failed to save state to localStorage:", e);
      }
    }
  }

  syncToCloud(immediate = false) {
    if (!isProUser()) return;
    if (this.syncTimeout) clearTimeout(this.syncTimeout);
    
    if (immediate) {
      saveRemoteState(this.state);
    } else {
      this.syncTimeout = setTimeout(() => {
        saveRemoteState(this.state);
      }, 2000);
    }
  }

  save() {
    this.saveLocal();
    this.syncToCloud();
  }

  // --- ACTIONS ---
  navigate(appId: string | null) {
    let subRoute = '';
    if (appId && appId.includes('/')) {
      const parts = appId.split('/');
      appId = parts[0];
      subRoute = parts.slice(1).join('/');
    }

    this.state.currentApp = appId;
    this.state.subRoute = subRoute;
    this.save();

    // Sync browser hash for navigation history tracking
    if (typeof window !== 'undefined') {
      const targetHash = appId ? `#/app/${encodeURIComponent(appId)}${subRoute ? '/' + encodeURIComponent(subRoute) : ''}` : '#/';
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }
  }

  setPhoneLocked(locked: boolean) {
    this.state.isPhoneLocked = locked;
    this.save();
  }

  setHomeTab(tab: number) {
    this.state.activeTab = tab;
    this.save();
  }

  updatePassport(info: Partial<PassportInfo>) {
    this.state.passport = { ...this.state.passport, ...info };
    this.save();
  }

  catchCritter(critterId: string) {
    if (!this.state.critters.caught.includes(critterId)) {
      playSound('success', !this.state.settings.soundEffects);
      this.state.critters.caught.push(critterId);
      this.addBells(100);
      this.triggerAchievementProgress("m2", 1);
      this.triggerAchievementProgress("mp1", 1);
      this.save();
    }
  }

  donateCritter(critterId: string) {
    if (!this.state.critters.donated.includes(critterId)) {
      if (!this.state.critters.caught.includes(critterId)) {
        this.state.critters.caught.push(critterId);
      }
      this.state.critters.donated.push(critterId);
      this.save();
    }
  }

  setCritterFilters(filters: Partial<NookOSState["critters"]>) {
    this.state.critters = { ...this.state.critters, ...filters };
    this.save();
  }

  learnRecipe(recipeId: string) {
    if (!this.state.diy.unlockedRecipes.includes(recipeId)) {
      this.state.diy.unlockedRecipes.push(recipeId);
      this.save();
    }
  }

  craftRecipe(recipeId: string) {
    this.state.diy.craftedCount += 1;
    this.triggerAchievementProgress("m3", 1);
    this.save();
  }

  setDiyCategory(category: NookOSState["diy"]["filterCategory"]) {
    this.state.diy.filterCategory = category;
    this.save();
  }

  purchaseCatalogItem(item: CatalogItem) {
    if (item.currency === "Bells") {
      if (this.state.bells >= item.price) {
        this.state.bells -= item.price;
        this.state.catalog.purchasedIds.push(item.id);
        this.triggerAchievementProgress("m4", 1);
        this.save();
        return true;
      }
    } else {
      if (this.state.miles >= item.price) {
        this.state.miles -= item.price;
        this.state.catalog.purchasedIds.push(item.id);
        this.triggerAchievementProgress("m4", 1);
        this.save();
        return true;
      }
    }
    return false;
  }

  toggleWishlistItem(itemId: string) {
    if (!this.state.catalog.wishlistIds) this.state.catalog.wishlistIds = [];
    if (this.state.catalog.wishlistIds.includes(itemId)) {
      this.state.catalog.wishlistIds = this.state.catalog.wishlistIds.filter(id => id !== itemId);
      this.setItemQuantity(itemId, 0, 'wishlist');
    } else {
      this.state.catalog.wishlistIds.push(itemId);
      if (this.getItemQuantity(itemId, 'wishlist') === 0) {
        this.setItemQuantity(itemId, 1, 'wishlist');
      }
    }
    this.save();
  }

  
  getItemQuantity(itemId: string, type?: 'wishlist' | 'storage' | 'trade'): number {
    if (!this.state.catalog.itemQuantities) return 0;
    const key = type ? `${itemId}_${type}` : itemId;
    return this.state.catalog.itemQuantities[key] !== undefined ? this.state.catalog.itemQuantities[key] : 0;
  }

  setItemQuantity(itemId: string, quantity: number, type?: 'wishlist' | 'storage' | 'trade') {
    if (!this.state.catalog.itemQuantities) this.state.catalog.itemQuantities = {};
    const key = type ? `${itemId}_${type}` : itemId;
    const finalQty = Math.max(0, quantity);
    this.state.catalog.itemQuantities[key] = finalQty;

    if (type === 'wishlist') {
      if (!this.state.catalog.wishlistIds) this.state.catalog.wishlistIds = [];
      const hasItem = this.state.catalog.wishlistIds.includes(itemId);
      if (finalQty >= 1 && !hasItem) {
        this.state.catalog.wishlistIds.push(itemId);
      } else if (finalQty === 0 && hasItem) {
        this.state.catalog.wishlistIds = this.state.catalog.wishlistIds.filter(id => id !== itemId);
      }
    } else if (type === 'storage') {
      if (!this.state.catalog.storageIds) this.state.catalog.storageIds = [];
      const hasItem = this.state.catalog.storageIds.includes(itemId);
      if (finalQty >= 1 && !hasItem) {
        this.state.catalog.storageIds.push(itemId);
      } else if (finalQty === 0 && hasItem) {
        this.state.catalog.storageIds = this.state.catalog.storageIds.filter(id => id !== itemId);
      }
    } else if (type === 'trade') {
      if (!this.state.catalog.forTradeIds) this.state.catalog.forTradeIds = [];
      const hasItem = this.state.catalog.forTradeIds.includes(itemId);
      if (finalQty >= 1 && !hasItem) {
        this.state.catalog.forTradeIds.push(itemId);
      } else if (finalQty === 0 && hasItem) {
        this.state.catalog.forTradeIds = this.state.catalog.forTradeIds.filter(id => id !== itemId);
      }
    }

    this.save();
  }

  isWishlistItem(itemId: string): boolean {
    if (!this.state.catalog.wishlistIds) return false;
    return this.state.catalog.wishlistIds.includes(itemId);
  }

  toggleStorageItem(itemId: string) {
    if (!this.state.catalog.storageIds) this.state.catalog.storageIds = [];
    if (this.state.catalog.storageIds.includes(itemId)) {
      this.state.catalog.storageIds = this.state.catalog.storageIds.filter(id => id !== itemId);
      this.setItemQuantity(itemId, 0, 'storage');
    } else {
      this.state.catalog.storageIds.push(itemId);
      if (this.getItemQuantity(itemId, 'storage') === 0) {
        this.setItemQuantity(itemId, 1, 'storage');
      }
    }
    this.save();
  }

  isStorageItem(itemId: string): boolean {
    if (!this.state.catalog.storageIds) return false;
    return this.state.catalog.storageIds.includes(itemId);
  }

  toggleForTradeItem(itemId: string) {
    if (!this.state.catalog.forTradeIds) this.state.catalog.forTradeIds = [];
    if (this.state.catalog.forTradeIds.includes(itemId)) {
      this.state.catalog.forTradeIds = this.state.catalog.forTradeIds.filter(id => id !== itemId);
      this.setItemQuantity(itemId, 0, 'trade');
    } else {
      this.state.catalog.forTradeIds.push(itemId);
      if (this.getItemQuantity(itemId, 'trade') === 0) {
        this.setItemQuantity(itemId, 1, 'trade');
      }
    }
    this.save();
  }

  isForTradeItem(itemId: string): boolean {
    if (!this.state.catalog.forTradeIds) return false;
    return this.state.catalog.forTradeIds.includes(itemId);
  }

  addBells(amount: number) {
    this.state.bells += amount;
    this.save();
  }

  addMiles(amount: number) {
    this.state.miles += amount;
    this.save();
  }

  setMapImage(url: string | undefined) {
    this.state.map.imageUrl = url;
    this.save();
  }

  triggerAchievementProgress(challengeId: string, amount: number) {
    const challenge = this.state.milesChallenges.find((c) => c.id === challengeId);
    if (challenge && !challenge.isClaimed) {
      challenge.progress = Math.min(challenge.target, challenge.progress + amount);
      this.save();
    }
  }

  claimMilesReward(challengeId: string) {
    const challenge = this.state.milesChallenges.find((c) => c.id === challengeId);
    if (challenge && challenge.progress >= challenge.target && !challenge.isClaimed) {
      challenge.isClaimed = true;
      this.state.miles += challenge.reward;
      this.save();
      return true;
    }
    return false;
  }

  updateDesignPixel(designId: string, r: number, c: number, color: string) {
    const design = this.state.customDesigns.find((d) => d.id === designId);
    if (design) {
      design.grid[r][c] = color;
      this.triggerAchievementProgress("mp3", 1);
      this.save();
    }
  }

  createCustomDesign(name: string): string {
    const newId = `design_${Date.now()}`;
    const newDesign: CustomDesign = {
      id: newId,
      name: name,
      grid: Array(16).fill(null).map(() => Array(16).fill("#ffffff")),
      creator: this.state.passport.name
    };
    this.state.customDesigns.push(newDesign);
    this.save();
    return newId;
  }

  deleteCustomDesign(id: string) {
    if (this.state.customDesigns.length > 1) {
      this.state.customDesigns = this.state.customDesigns.filter((d) => d.id !== id);
      if (this.state.activeWallpaperId === id) {
        this.state.activeWallpaperId = "default";
      }
      this.save();
    }
  }

  setWallpaper(id: string) {
    this.state.activeWallpaperId = id;
    this.save();
  }

  sendChatMessage(sender: string, content: string, isNpc: boolean = false) {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMessage: ChatMessage = {
      id: `chat_${Date.now()}`,
      sender,
      content,
      timestamp,
      isNpc,
      avatar: isNpc ? this.getNpcAvatar(sender) : "🧑‍🌾"
    };

    this.state.chatLog.push(newMessage);
    this.save();

    if (!isNpc) {
      this.simulateNpcReply(content);
    }
  }

  private getNpcAvatar(name: string): string {
    switch (name) {
      case "Tom Nook": return "🍃";
      case "Isabelle": return "🐶";
      case "Blathers": return "🦉";
      case "Timmy": return "🦝";
      case "Tommy": return "🦝";
      case "Mr. Resetti": return "⛏️";
      default: return "🐾";
    }
  }

  private simulateNpcReply(playerMessage: string) {
    const lower = playerMessage.toLowerCase();
    let replySender = "Tom Nook";
    let replyContent = "Yes, yes! Quite interesting. Don't forget your island fees are due!";

    if (lower.includes("hello") || lower.includes("hi")) {
      replySender = "Isabelle";
      replyContent = "Hello! I hope you are having an absolutely wonderful day on our lovely island! 🌸";
    } else if (lower.includes("fish") || lower.includes("bug") || lower.includes("museum")) {
      replySender = "Blathers";
      replyContent = "Hoo! A specimen you say? Fascinating! Pray, bring it to the museum so I might regale you with historical details!";
    } else if (lower.includes("price") || lower.includes("turnip") || lower.includes("bell")) {
      replySender = "Timmy";
      replyContent = "We are currently buying turnips, yes! ...turnips!";
    } else if (lower.includes("stuck") || lower.includes("rescue") || lower.includes("help")) {
      replySender = "Mr. Resetti";
      replyContent = "HEY! If you're stuck, just open the Rescue Service app! It's what it's there for! No slacking!";
    } else if (lower.includes("diy") || lower.includes("craft")) {
      replySender = "Tom Nook";
      replyContent = "Crafting is the key to island development! Keep collecting those recipes!";
    }

    setTimeout(() => {
      this.sendChatMessage(replySender, replyContent, true);
    }, 1500);
  }

  clearChatLog() {
    this.state.chatLog = [];
    this.save();
  }

  moveBuilding(id: string, x: number, y: number) {
    const b = this.state.map.buildings.find((item) => item.id === id);
    if (b) {
      b.x = Math.max(5, Math.min(95, x));
      b.y = Math.max(5, Math.min(95, y));
      this.triggerAchievementProgress("m5", 1);
      this.save();
    }
  }

  toggleAppPin(appIdOrName: string) {
    if (this.state.pinnedApps.includes(appIdOrName)) {
      this.state.pinnedApps = this.state.pinnedApps.filter((id) => id !== appIdOrName);
    } else {
      this.state.pinnedApps.push(appIdOrName);
    }
    this.save();
  }

  isAppPinned(appIdOrName: string): boolean {
    return this.state.pinnedApps.includes(appIdOrName);
  }

  installApp(appName: string) {
    if (!this.state.installedApps) this.state.installedApps = [];
    if (!this.state.installedApps.includes(appName)) {
      // Calculate current desktop apps (Core apps: 19)
      const currentDesktopApps = 19 - this.state.dockApps.length + this.state.installedApps.length;
      if (currentDesktopApps >= (this.state.maxAppSlots || 18)) {
        playSound('error', !this.state.settings.soundEffects);
        this.addNotification(
          "Storage Full!", 
          "You don't have enough App Space to install this app. Please upgrade your storage in Settings!", 
          "Nook Inc."
        );
        return false;
      }

      playSound('beep', !this.state.settings.soundEffects);
      this.state.installingApp = appName;
      
      setTimeout(() => {
        playSound('success', !this.state.settings.soundEffects);
        if (!this.state.installedApps) this.state.installedApps = [];
        this.state.installedApps.push(appName);
        if (!this.state.pinnedApps.includes(appName)) {
          this.state.pinnedApps.push(appName);
        }
        this.state.installingApp = null;
        this.save();
        
        this.addNotification(
          "New App Installed!", 
          `Yes, yes! ${appName} has been successfully downloaded and placed on your homescreen!`, 
          "Tom Nook"
        );
      }, 2500);
      return true;
    }
    return false;
  }

  uninstallApp(appName: string) {
    if (!this.state.installedApps) this.state.installedApps = [];
    this.state.installedApps = this.state.installedApps.filter(name => name !== appName);
    this.state.pinnedApps = this.state.pinnedApps.filter(id => id !== appName);
    this.save();
  }

  isAppInstalled(appName: string): boolean {
    const systemAppNames = new Set([
      "camera", "miles", "critter", "diy", "designs", "designer", "map", "passport",
      "chat", "settings", "directory", "messages", "contacts", "dodo_air", "best_friends",
      "rescue", "changelog", "ac miles", "acnh critterpedia", "diy recipes", "nook shopping",
      "happy island designer", "animal crossing pattern tool", "bulletin board", "settings",
      "residential recycle box", "messages", "contacts", "best friends", "rescue service"
    ]);
    if (systemAppNames.has(appName.toLowerCase())) return true;
    if (!this.state.installedApps) return false;
    return this.state.installedApps.includes(appName);
  }

  updateSettings(newSettings: Partial<NookOSState["settings"]>) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.save();
  }

  setDefaultApp(intent: string, appIdOrName: string) {
    if (!this.state.settings.defaultApps) {
      this.state.settings.defaultApps = {};
    }
    this.state.settings.defaultApps[intent] = appIdOrName;
    this.save();
  }

  snapPhoto() {
    this.triggerAchievementProgress("m1", 1);
    this.save();
  }

  completeOnboarding(name: string, islandName: string, hemisphere: "north" | "south", friendCode: string) {
    this.state.passport.name = name;
    this.state.passport.islandName = islandName;
    this.state.passport.friendCode = friendCode;
    this.state.critters.filterHemisphere = hemisphere;
    this.state.hasCompletedOnboarding = true;
    this.save();
  }


  addNotification(title: string, message: string, sender: string) {
    if (!this.state.notifications) {
      this.state.notifications = [];
    }

    const isDuplicate = this.state.notifications.some(
      n => n.title === title && n.message === message && n.sender === sender
    );
    if (isDuplicate) return;

    const newNotif: NookNotification = {
      id: "n_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      title,
      message,
      sender,
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      isRead: false
    };
    this.state.notifications.unshift(newNotif);
    this.save();
    
    if (typeof window !== "undefined") {
      playSound('bell', !this.state.settings.soundEffects);
      window.dispatchEvent(new CustomEvent("nook-notification", { detail: newNotif }));
    }
  }

  markAllNotificationsAsRead() {
    if (this.state.notifications) {
      this.state.notifications.forEach(n => {
        n.isRead = true;
      });
      this.save();
    }
  }

  clearNotifications() {
    this.state.notifications = [];
    this.save();
  }

  dismissNotification(id: string) {
    if (this.state.notifications) {
      this.state.notifications = this.state.notifications.filter(n => n.id !== id);
      this.save();
    }
  }

  reorderResidents(oldIndex: number, newIndex: number) {
    if (!this.state.residents) return;
    const residents = [...this.state.residents];
    const [movedItem] = residents.splice(oldIndex, 1);
    residents.splice(newIndex, 0, movedItem);
    this.state.residents = residents;
    this.save();
  }

  toggleResident(contactId: string) {
    if (!this.state.residents) this.state.residents = [];
    if (this.state.residents.includes(contactId)) {
      this.state.residents = this.state.residents.filter(id => id !== contactId);
    } else {
      if (this.state.residents.length < 10) {
        this.state.residents.push(contactId);
      } else {
        this.addNotification("Island Full!", "You can only have up to 10 residents on your island.", "Tom Nook");
        return;
      }
    }
    this.save();
  }

  isResident(contactId: string): boolean {
    if (!this.state.residents) return false;
    return this.state.residents.includes(contactId);
  }

  addContact(contactId: string) {
    if (!this.state.myContacts) this.state.myContacts = [];
    if (!this.state.myContacts.includes(contactId)) {
      this.state.myContacts.push(contactId);
      this.save();
    }
  }

  removeContact(contactId: string) {
    if (!this.state.myContacts) return;
    this.state.myContacts = this.state.myContacts.filter(id => id !== contactId);
    
    // Also remove from VIPs and residents to keep state clean
    if (this.state.bestFriends) {
      this.state.bestFriends = this.state.bestFriends.filter(id => id !== contactId);
    }
    if (this.state.residents) {
      this.state.residents = this.state.residents.filter(id => id !== contactId);
    }
    this.save();
  }

  isContact(contactId: string): boolean {
    if (!this.state.myContacts) return false;
    return this.state.myContacts.includes(contactId);
  }

  getMilestones(contactId: string) {
    const defaultMilestones = {
      hasPoster: false,
      hasPhoto: false,
      talkedToday: false,
      giftedToday: false
    };

    if (!this.state.villagerMilestones) return defaultMilestones;
    if (!this.state.villagerMilestones[contactId]) return defaultMilestones;
    
    return this.state.villagerMilestones[contactId];
  }

  toggleMilestone(contactId: string, milestone: 'hasPoster' | 'hasPhoto' | 'talkedToday' | 'giftedToday') {
    if (!this.state.villagerMilestones) this.state.villagerMilestones = {};
    if (!this.state.villagerMilestones[contactId]) {
      this.state.villagerMilestones[contactId] = {
        hasPoster: false,
        hasPhoto: false,
        talkedToday: false,
        giftedToday: false
      };
    }
    
    this.state.villagerMilestones[contactId][milestone] = !this.state.villagerMilestones[contactId][milestone];
    
    // If a user gifts a villager, it implies they talked to them.
    if (milestone === 'giftedToday' && this.state.villagerMilestones[contactId].giftedToday) {
      this.state.villagerMilestones[contactId].talkedToday = true;
    }
    
    this.save();
  }
}

export const nookState = new NookStateManager();
export default nookState;

