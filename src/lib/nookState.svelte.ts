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
  };
  milesChallenges: MilesChallenge[];
  chatLog: ChatMessage[];
  customDesigns: CustomDesign[];
  activeWallpaperId: string;
  pinnedApps: string[];
  settings: {
    use24HourTime: boolean;
    showBatteryPercentage: boolean;
    reduceMotion: boolean;
  };
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
    friendCode: "SW-3245-8791-0023",
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
  milesChallenges: [...milesData],
  chatLog: [
    { id: "c1", sender: "Tom Nook", content: "Welcome to NookOS, yes, yes! Use your phone to manage your island and check the directories!", timestamp: "10:00 AM", isNpc: true, avatar: "🍃" }
  ],
  customDesigns: [
    { id: "d1", name: "Nook Leaf", grid: DEFAULT_GRID_LEAF, creator: "Timmy" },
    { id: "d2", name: "Island Tee", grid: DEFAULT_GRID_SHIRT, creator: "Tommy" },
    { id: "d3", name: "Custom Tile", grid: Array(16).fill(null).map(() => Array(16).fill("#ffffff")), creator: "Villager" }
  ],
  activeWallpaperId: "default",
  pinnedApps: ["passport", "settings", "chat", "shopping"],
  settings: {
    use24HourTime: false,
    showBatteryPercentage: true,
    reduceMotion: false
  }
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

  get milesChallenges() { return this.state.milesChallenges; }
  set milesChallenges(val) { this.state.milesChallenges = val; }

  get chatLog() { return this.state.chatLog; }
  set chatLog(val) { this.state.chatLog = val; }

  get customDesigns() { return this.state.customDesigns; }
  set customDesigns(val) { this.state.customDesigns = val; }

  get activeWallpaperId() { return this.state.activeWallpaperId; }
  set activeWallpaperId(val) { this.state.activeWallpaperId = val; }

  get pinnedApps() { return this.state.pinnedApps; }
  set pinnedApps(val) { this.state.pinnedApps = val; }

  get settings() { return this.state.settings; }
  set settings(val) { this.state.settings = val; }

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("nook_os_state_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          this.state = { ...this.state, ...parsed };
        }
      } catch (e) {
        console.error("Failed to load state from localStorage:", e);
      }
    }
  }

  save() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("nook_os_state_v1", JSON.stringify(this.state));
      } catch (e) {
        console.error("Failed to save state to localStorage:", e);
      }
    }
  }

  // --- ACTIONS ---
  navigate(appId: string | null) {
    this.state.currentApp = appId;
    this.save();
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

  updateSettings(newSettings: Partial<NookOSState["settings"]>) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.save();
  }

  snapPhoto() {
    this.triggerAchievementProgress("m1", 1);
    this.save();
  }

  triggerRescueReset() {
    if (this.state.miles >= 100) {
      this.state.miles -= 100;
      this.save();
      return true;
    }
    return false;
  }
}

export const nookState = new NookStateManager();
export default nookState;
