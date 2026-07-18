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
  grid: string[][]; // 16x16 grid of color hex codes
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
  currentApp: string | null; // null means Home Screen
  isPhoneLocked: boolean;
  activeTab: number; // For multi-page home screen (0 or 1)
  bells: number;
  miles: number;
  passport: PassportInfo;
  critters: {
    caught: string[]; // List of critter IDs
    donated: string[]; // List of critter IDs
    filterType: "all" | "bug" | "fish" | "sea";
    filterHemisphere: "north" | "south";
  };
  diy: {
    unlockedRecipes: string[]; // List of recipe IDs
    craftedCount: number;
    filterCategory: "all" | "tools" | "furniture" | "cooking";
  };
  catalog: {
    purchasedIds: string[]; // History of purchases
  };
  map: {
    buildings: MapBuilding[];
  };
  milesChallenges: MilesChallenge[];
  chatLog: ChatMessage[];
  customDesigns: CustomDesign[];
  activeWallpaperId: string; // "default" or design ID
  pinnedProjects: string[]; // Names of pinned community projects
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
  pinnedProjects: ["ACNH.Guide", "Nookazon", "Nooknet"] // Default pinned favorites
};

type StateSubscriber = (state: NookOSState) => void;

class NookStateManager {
  private state: NookOSState = { ...INITIAL_STATE };
  private subscribers: Set<StateSubscriber> = new Set();

  constructor() {
    // Load from localStorage if client-side
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

  public getState(): NookOSState {
    return this.state;
  }

  public subscribe(subscriber: StateSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.state); // Initial call
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify() {
    this.subscribers.forEach((sub) => sub(this.state));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("nook_os_state_v1", JSON.stringify(this.state));
      } catch (e) {
        console.error("Failed to save state to localStorage:", e);
      }
    }
  }

  // --- ACTIONS ---

  public navigate(appId: string | null) {
    this.state.currentApp = appId;
    this.notify();
  }

  public setPhoneLocked(locked: boolean) {
    this.state.isPhoneLocked = locked;
    this.notify();
  }

  public setHomeTab(tab: number) {
    this.state.activeTab = tab;
    this.notify();
  }

  // --- PASSPORT ACTIONS ---
  public updatePassport(info: Partial<PassportInfo>) {
    this.state.passport = { ...this.state.passport, ...info };
    this.notify();
  }

  // --- CRITTERPEDIA ACTIONS ---
  public catchCritter(critterId: string) {
    if (!this.state.critters.caught.includes(critterId)) {
      this.state.critters.caught.push(critterId);
      this.addBells(100); // Small reward
      this.triggerAchievementProgress("m2", 1);
      this.triggerAchievementProgress("mp1", 1); // Miles+ task
      this.notify();
    }
  }

  public donateCritter(critterId: string) {
    if (!this.state.critters.donated.includes(critterId)) {
      if (!this.state.critters.caught.includes(critterId)) {
        this.state.critters.caught.push(critterId);
      }
      this.state.critters.donated.push(critterId);
      this.notify();
    }
  }

  public setCritterFilters(filters: Partial<NookOSState["critters"]>) {
    this.state.critters = { ...this.state.critters, ...filters };
    this.notify();
  }

  // --- DIY ACTIONS ---
  public learnRecipe(recipeId: string) {
    if (!this.state.diy.unlockedRecipes.includes(recipeId)) {
      this.state.diy.unlockedRecipes.push(recipeId);
      this.notify();
    }
  }

  public craftRecipe(recipeId: string) {
    this.state.diy.craftedCount += 1;
    this.triggerAchievementProgress("m3", 1);
    this.notify();
  }

  public setDiyCategory(category: NookOSState["diy"]["filterCategory"]) {
    this.state.diy.filterCategory = category;
    this.notify();
  }

  // --- SHOPPING ACTIONS ---
  public purchaseCatalogItem(item: CatalogItem) {
    if (item.currency === "Bells") {
      if (this.state.bells >= item.price) {
        this.state.bells -= item.price;
        this.state.catalog.purchasedIds.push(item.id);
        this.triggerAchievementProgress("m4", 1);
        this.notify();
        return true;
      }
    } else {
      if (this.state.miles >= item.price) {
        this.state.miles -= item.price;
        this.state.catalog.purchasedIds.push(item.id);
        this.triggerAchievementProgress("m4", 1);
        this.notify();
        return true;
      }
    }
    return false;
  }

  public addBells(amount: number) {
    this.state.bells += amount;
    this.notify();
  }

  public addMiles(amount: number) {
    this.state.miles += amount;
    this.notify();
  }

  // --- MILES & ACHIEVEMENTS ---
  public triggerAchievementProgress(challengeId: string, amount: number) {
    const challenge = this.state.milesChallenges.find((c) => c.id === challengeId);
    if (challenge && !challenge.isClaimed) {
      challenge.progress = Math.min(challenge.target, challenge.progress + amount);
      this.notify();
    }
  }

  public claimMilesReward(challengeId: string) {
    const challenge = this.state.milesChallenges.find((c) => c.id === challengeId);
    if (challenge && challenge.progress >= challenge.target && !challenge.isClaimed) {
      challenge.isClaimed = true;
      this.state.miles += challenge.reward;
      this.notify();
      return true;
    }
    return false;
  }

  // --- CUSTOM DESIGNS ---
  public updateDesignPixel(designId: string, r: number, c: number, color: string) {
    const design = this.state.customDesigns.find((d) => d.id === designId);
    if (design) {
      design.grid[r][c] = color;
      this.triggerAchievementProgress("mp3", 1);
      this.notify();
    }
  }

  public createCustomDesign(name: string): string {
    const newId = `design_${Date.now()}`;
    const newDesign: CustomDesign = {
      id: newId,
      name: name,
      grid: Array(16).fill(null).map(() => Array(16).fill("#ffffff")),
      creator: this.state.passport.name
    };
    this.state.customDesigns.push(newDesign);
    this.notify();
    return newId;
  }

  public deleteCustomDesign(id: string) {
    // Keep at least 1 design
    if (this.state.customDesigns.length > 1) {
      this.state.customDesigns = this.state.customDesigns.filter((d) => d.id !== id);
      if (this.state.activeWallpaperId === id) {
        this.state.activeWallpaperId = "default";
      }
      this.notify();
    }
  }

  public setWallpaper(id: string) {
    this.state.activeWallpaperId = id;
    this.notify();
  }

  // --- NOOKIT SIMULATION ---
  public sendChatMessage(sender: string, content: string, isNpc: boolean = false) {
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
    this.notify();

    // Trigger funny automated response if sent by player
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

    // Schedule replies
    setTimeout(() => {
      this.sendChatMessage(replySender, replyContent, true);
    }, 1500);
  }

  public clearChatLog() {
    this.state.chatLog = [];
    this.notify();
  }

  // --- MAP BUILDING ACTIONS ---
  public moveBuilding(id: string, x: number, y: number) {
    const b = this.state.map.buildings.find((item) => item.id === id);
    if (b) {
      b.x = Math.max(5, Math.min(95, x));
      b.y = Math.max(5, Math.min(95, y));
      this.triggerAchievementProgress("m5", 1);
      this.notify();
    }
  }

  // --- PIN / UNPIN PROJECTS (APPS DIRECTORY) ---
  public toggleProjectPin(projectName: string) {
    if (this.state.pinnedProjects.includes(projectName)) {
      this.state.pinnedProjects = this.state.pinnedProjects.filter((name) => name !== projectName);
    } else {
      this.state.pinnedProjects.push(projectName);
    }
    this.notify();
  }

  public isProjectPinned(projectName: string): boolean {
    return this.state.pinnedProjects.includes(projectName);
  }

  // --- CAMERA ACTION (Miles) ---
  public snapPhoto() {
    this.triggerAchievementProgress("m1", 1);
    this.notify();
  }

  // --- RESET SERVICE ---
}

// Singleton state manager instance
export const nookState = new NookStateManager();
export default nookState;
