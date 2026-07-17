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
    gridSize: number;
    defaultApps: Record<string, string>;
  };
  unreadDMs: number;
  vipContacts: string[];
  myContacts: string[];
  villagerMilestones: Record<string, {
    hasPoster: boolean;
    hasPhoto: boolean;
    talkedToday: boolean;
    giftedToday: boolean;
  }>;
  bestFriends: (string | number)[];
  bestFriendsCommunicationsOn: boolean;
  dockApps: string[];
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
    purchasedIds: []
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
  pinnedApps: ["camera", "miles", "critter", "diy", "designs", "designer", "map", "chat", "passport", "messages", "shopping", "best_friends"],
  installedApps: [],
  hasCompletedOnboarding: false,
  settings: {
    use24HourTime: false,
    showBatteryPercentage: true,
    reduceMotion: false,
    gridSize: 3,
    defaultApps: {}
  },
  unreadDMs: 0,
  vipContacts: [],
  myContacts: [],
  villagerMilestones: {},
  bestFriends: [],
  bestFriendsCommunicationsOn: true,
  dockApps: ["directory", "messages", "contacts"]
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

  get vipContacts() { return this.state.vipContacts || []; }
  set vipContacts(val) { this.state.vipContacts = val; }

  get myContacts() { return this.state.myContacts || []; }
  set myContacts(val) { this.state.myContacts = val; }

  get villagerMilestones() { return this.state.villagerMilestones || {}; }
  set villagerMilestones(val) { this.state.villagerMilestones = val; }

  get bestFriends() { return this.state.bestFriends || []; }
  set bestFriends(val) { this.state.bestFriends = val; }

  get bestFriendsCommunicationsOn() { return this.state.bestFriendsCommunicationsOn !== false; }
  set bestFriendsCommunicationsOn(val) { this.state.bestFriendsCommunicationsOn = val; }

  get dockApps() { return this.state.dockApps || ["directory", "messages", "contacts"]; }
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

  async initializeAsync() {
    if (isProUser()) {
      const remoteState = await fetchRemoteState();
      if (remoteState) {
        // Cloud Overwrites Local (if cloud exists)
        this.state = { ...this.state, ...remoteState };
        this.saveLocal();
      } else {
        // Seamless Merge: Cloud is empty, push local state up
        this.syncToCloud(true);
      }
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
    this.state.currentApp = appId;
    this.save();

    // Sync browser hash for navigation history tracking
    if (typeof window !== 'undefined') {
      const targetHash = appId ? `#/app/${encodeURIComponent(appId)}` : '#/';
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
      this.state.installingApp = appName;
      
      setTimeout(() => {
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
    }
  }

  uninstallApp(appName: string) {
    if (!this.state.installedApps) this.state.installedApps = [];
    this.state.installedApps = this.state.installedApps.filter(name => name !== appName);
    this.state.pinnedApps = this.state.pinnedApps.filter(id => id !== appName);
    this.save();
  }

  isAppInstalled(appName: string): boolean {
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
  toggleVipContact(contactId: string) {
    if (!this.state.vipContacts) this.state.vipContacts = [];
    if (this.state.vipContacts.includes(contactId)) {
      this.state.vipContacts = this.state.vipContacts.filter(id => id !== contactId);
    } else {
      this.state.vipContacts.push(contactId);
    }
    this.save();
  }

  isVipContact(contactId: string): boolean {
    if (!this.state.vipContacts) return false;
    return this.state.vipContacts.includes(contactId);
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
    if (this.state.vipContacts) {
      this.state.vipContacts = this.state.vipContacts.filter(id => id !== contactId);
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
    this.save();
  }
}

export const nookState = new NookStateManager();
export default nookState;

