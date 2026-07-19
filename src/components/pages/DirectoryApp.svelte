<script lang="ts">
  import { getPhoneContext, CORE_APPS } from "@/components/organisms/phoneContext.svelte";
  import nookState from "@/lib/nookState.svelte";
  import { projectsData } from "@/lib/nookData";
  import {
    Search,
    Download,
    CheckCircle,
    Smartphone,
    Code,
    Globe,
    XIcon,
    Trash2,
    Play,
    Users,
    CloudDownload,
    Box,
    Grid3x3,
    BookOpen,
    CheckSquare,
    Palette,
    Moon,
    Music,
    TrendingUp,
    Image as ImageIcon,
    Star,
    Monitor,
    CloudSun,
    Store,
    LifeBuoy,
    Settings2,
    ListChecks,
    Coins,
    Sparkles,
    Wrench,
    Library,
    ChevronLeft
  } from "@lucide/svelte";
  import Leaf from "@lucide/svelte/icons/leaf";
  import NookIcon from "../atoms/NookIcon.svelte";
  import Rating from "../atoms/Rating.svelte";
  import { fetchApps, installAppTracker, rateApp, isProUser } from "@/lib/api";
  import { onMount } from "svelte";
  import NookAppTemplate from "@/components/organisms/NookAppTemplate.svelte";
  import NookToolbarButton from "../molecules/NookToolbarButton.svelte";

  const ctx = getPhoneContext();

  let cloudApps: Record<string, any> = $state({});
  let proUser = $state(false);

  let searchTerm = $state("");
  let selectedCategory = $state("featured");
  let selectedLanguage = $state("en");
  let selectedPlatform = $state("installable");
  let showFilters = $state(false);
  let selectedApp = $state<any>(null);
  let currentView = $state<"grid" | "detail">("grid");
  let ratingComments = $state<Record<string, string>>({});
  let dailyAppOrder = $state<string[]>([]);
  let featuredAppIndex = $state(0);

  let featuredApps = $derived.by(() => {
    if (dailyAppOrder.length === 0) return [];

    return projectsData
      .filter((app) => {
        const isCoreApp = checkIsCoreApp(app.name);
        if (isCoreApp || nookState.isAppInstalled(app.name)) return false;

        let matchesPlatform = true;
        if (selectedPlatform === "installable") matchesPlatform = !!app.site;
        else if (selectedPlatform === "ios") matchesPlatform = !!app.ios;
        else if (selectedPlatform === "android") matchesPlatform = !!app.android;

        return matchesPlatform;
      })
      .sort((a, b) => {
        const indexA = dailyAppOrder.indexOf(a.name);
        const indexB = dailyAppOrder.indexOf(b.name);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      })
      .slice(0, 4);
  });

  $effect(() => {
    if (featuredAppIndex >= featuredApps.length) {
      featuredAppIndex = 0;
    }
  });

  const allToolTypes = Array.from(new Set(projectsData.flatMap((p) => p.tools)));
  const allLanguages = Array.from(new Set(projectsData.flatMap((p) => p.languages || []))).sort();
  const languageNames: Record<string, string> = {
    all: "All Languages",
    en: "English",
    es: "Spanish",
    de: "German",
    fr: "French",
    it: "Italian",
    jp: "Japanese",
    ru: "Russian",
    zh: "Chinese",
    ko: "Korean"
  };

  onMount(async () => {
    proUser = isProUser();

    if (projectsData && projectsData.length > 0) {
      const dateKey = new Date().toISOString().split("T")[0];
      const cached = localStorage.getItem("nookphone_featured_apps");
      let cachedData = null;
      try {
        if (cached) cachedData = JSON.parse(cached);
      } catch (e) {}

      let pool = [];
      if (cachedData && cachedData.date === dateKey) {
        pool = cachedData.apps;
      } else {
        const shuffled = [...projectsData].sort(() => 0.5 - Math.random());
        pool = shuffled.map((a) => a.name);
        localStorage.setItem(
          "nookphone_featured_apps",
          JSON.stringify({
            date: dateKey,
            apps: pool
          })
        );
      }

      dailyAppOrder = pool;
    }

    // Attempt to match browser locale
    if (typeof navigator !== "undefined" && navigator.language) {
      const loc = navigator.language.split("-")[0].toLowerCase();
      if (allLanguages.includes(loc)) selectedLanguage = loc;
    }

    const apps = await fetchApps();
    const map: Record<string, any> = {};
    apps.forEach((a: any) => {
      map[a.slug] = a;
      if (a.user_comment) {
        ratingComments[a.slug] = a.user_comment;
      }
    });
    cloudApps = map;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "featured":
        return Star;
      case "all":
        return Grid3x3;
      case "pre-installed":
        return CheckCircle;
      case "tracking":
        return ListChecks;
      case "economy":
        return Coins;
      case "multiplayer":
        return Users;
      case "creative":
        return Sparkles;
      case "utilities":
        return Wrench;
      case "reference":
        return Library;
      default:
        return Box;
    }
  };

  const checkIsCoreApp = (name: string) => {
    const lowerName = name.toLowerCase();
    return (
      CORE_APPS.some((a) => a.name.toLowerCase() === lowerName) ||
      lowerName === "miles" ||
      lowerName === "happy island designer" ||
      lowerName === "pattern tool"
    );
  };

  let filteredProjects = $derived(
    projectsData
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" ||
          (selectedCategory === "featured"
            ? featuredApps.some((f) => f.name === p.name)
            : selectedCategory === "pre-installed"
              ? checkIsCoreApp(p.name)
              : p.tools.includes(selectedCategory));
        const matchesLang =
          selectedLanguage === "all" || (p.languages && p.languages.includes(selectedLanguage));

        let matchesPlatform = true;
        if (selectedPlatform === "installable") matchesPlatform = !!p.site;
        else if (selectedPlatform === "ios") matchesPlatform = !!p.ios;
        else if (selectedPlatform === "android") matchesPlatform = !!p.android;

        return matchesSearch && matchesCategory && matchesLang && matchesPlatform;
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  async function handleInstall(projectName: string) {
    const success = nookState.installApp(projectName);
    if (!success) return;
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await installAppTracker(slug);
    // Refresh stats
    const apps = await fetchApps();
    const map: Record<string, any> = {};
    apps.forEach((a: any) => {
      map[a.slug] = a;
    });
    cloudApps = map;
  }

  async function handleExternalLink(url: string, projectName: string) {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await installAppTracker(slug);
    window.open(url, "_blank");
    // Refresh stats
    const apps = await fetchApps();
    const map: Record<string, any> = {};
    apps.forEach((a: any) => {
      map[a.slug] = a;
    });
    cloudApps = map;
  }

  async function handleMarkInstalled(projectName: string) {
    nookState.installApp(projectName);
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await installAppTracker(slug);
    // Refresh stats
    const apps = await fetchApps();
    const map: Record<string, any> = {};
    apps.forEach((a: any) => {
      map[a.slug] = a;
    });
    cloudApps = map;
  }

  function handleUninstall(projectName: string) {
    nookState.uninstallApp(projectName);
  }

  async function handleRate(projectName: string, rating: number) {
    if (!proUser) return;
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const comment = ratingComments[slug] || "";
    await rateApp(slug, rating, comment);
    // Refresh stats
    const apps = await fetchApps();
    const map: Record<string, any> = {};
    apps.forEach((a: any) => {
      map[a.slug] = a;
      if (a.user_comment) {
        ratingComments[a.slug] = a.user_comment;
      }
    });
    cloudApps = map;
  }
</script>

<NookAppTemplate
  title="App Directory"
  subtitle="Browse and install community-made apps."
  headerBgClass="bg-[#45a38f]"
  headerTextClass="text-[#fffdf5]"
  bgClass="bg-[#e5f1f0]"
  textClass="text-[#2d5c56]"
  showSearch={currentView === "grid"}
  bind:searchTerm
  searchPlaceholder="Search tools..."
  searchThemeColorClass="text-[#45a38f]"
  searchFocusBorderClass="focus:border-[#45a38f]"
  searchBorderColorClass="border-[#bedad4]"
  searchBgClass="bg-[#fffdf5]"
  searchTextColorClass="text-[#2d5c56]"
  categories={currentView === "grid" ? ["featured", "all", "pre-installed", ...allToolTypes] : []}
  bind:activeCategory={selectedCategory}
  categoryLayoutStyle="wrap"
  {getCategoryIcon}
  getCategoryLabel={(cat) =>
    cat === "featured"
      ? "Featured"
      : cat === "all"
        ? "All Tools"
        : cat === "pre-installed"
          ? "Pre-Installed"
          : cat.toUpperCase()}
  categoryActiveBgClass="bg-[#2d5c56]"
  categoryInactiveTextClass="text-[#45a38f]/60 hover:text-[#45a38f]"
  categoryBgClass="bg-[#fffdf5]"
  categoryBorderClass="border-2 border-[#bedad4]"
  categoryLabelBgClass="bg-[#45a38f]"
  categoryLabelTextClass="text-[#fffdf5]"
>
  {#snippet iconSnippet()}
    <div class="w-12 h-12 mr-1">
      <NookIcon
        name="directory"
        class="w-full h-full drop-shadow-sm text-[#fffdf5]"
      />
    </div>
  {/snippet}

  {#snippet headerActions()}
    {#if currentView === "detail"}
      <NookToolbarButton
        onclick={() => (currentView = "grid")}
        class="mr-1"
        title="Back"
      >
        <ChevronLeft class="w-3.5 h-3.5 stroke-[3px] text-[#2d5c56]" />
      </NookToolbarButton>
    {:else}
      <NookToolbarButton
        onclick={() => (showFilters = !showFilters)}
        class="mr-1"
        title="Filters"
      >
        <Settings2 class="w-3.5 h-3.5 stroke-[3px] text-[#2d5c56]" />
      </NookToolbarButton>
    {/if}
    <NookToolbarButton
      onclick={ctx.handleHomeButton}
      title="Close App"
    >
      <XIcon class="w-3.5 h-3.5 stroke-[3px] text-[#2d5c56]" />
    </NookToolbarButton>
  {/snippet}

  {#snippet filterPanel()}
    {#if showFilters}
      <div
        class="bg-[#fffdf5] rounded-2xl border-4 border-[#bedad4] p-3 shadow-inner flex flex-col gap-2 transition-all animate-fade-in-down origin-top"
      >
        <h3 class="text-[11px] font-black uppercase text-[#45a38f]">Filter by Language</h3>
        <div class="flex flex-wrap gap-2">
          {#each ["all", ...allLanguages] as lang}
            <button
              onclick={() => (selectedLanguage = lang)}
              class={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${selectedLanguage === lang ? "bg-[#2d5c56] text-[#fffdf5]" : "bg-[#e5f1f0] text-[#2d5c56] hover:bg-[#bedad4]"}`}
            >
              {languageNames[lang] || lang.toUpperCase()}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  {/snippet}

  {#snippet bottomNav()}
    {#each [{ id: "installable", label: "Nook OS", icon: Leaf }, { id: "ios", label: "iOS", icon: Smartphone }, { id: "android", label: "Android", icon: Smartphone }] as plat}
      <button
        onclick={() => (selectedPlatform = plat.id)}
        class={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all ${
          selectedPlatform === plat.id
            ? "bg-[#45a38f] text-[#fffdf5] shadow-inner scale-105"
            : "text-[#45a38f] hover:bg-[#e5f1f0]"
        }`}
      >
        <plat.icon
          class="w-5 h-5 mb-1"
          strokeWidth={selectedPlatform === plat.id ? 3 : 2}
        />
        <span class="text-[9px] font-black uppercase tracking-wider">{plat.label}</span>
      </button>
    {/each}
  {/snippet}

  <!-- Main Views -->
  <div
    class={`absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ${currentView === "grid" ? "translate-x-0" : "-translate-x-full"}`}
  >
    <div class="flex-1 overflow-y-auto ac-scrollbar px-4 pb-4">
      {#if featuredApps.length > 0 && searchTerm === "" && (selectedCategory === "all" || selectedCategory === "featured")}
        {@const safeIndex = Math.min(featuredAppIndex, featuredApps.length - 1)}
        {@const app = featuredApps[safeIndex]}
        {@const isCoreApp = checkIsCoreApp(app.name)}
        {@const isInstalled = isCoreApp || nookState.isAppInstalled(app.name)}
        {@const slug = app.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
        {@const stats = cloudApps[slug] || { user_rating: 0, average_rating: "0.0", reviews: 0 }}

        <div class="mb-4">
          <div class="flex justify-between items-end mb-2 px-1">
            <h2 class="text-[13px] font-black text-[#2d5c56] uppercase tracking-wider">
              Featured {#if selectedPlatform === "ios"}iOS{:else if selectedPlatform === "android"}Android{:else}Nook
                OS{/if} Apps
            </h2>
            <div class="text-[10px] font-bold text-[#45a38f]">
              {featuredAppIndex + 1} / {featuredApps.length}
            </div>
          </div>

          <div class="relative flex items-center justify-center">
            {#if featuredApps.length > 1 && featuredAppIndex > 0}
              <button
                onclick={() => (featuredAppIndex = featuredAppIndex - 1)}
                class="absolute -left-3 top-1/2 -translate-y-1/2 z-20 bg-transparent border-0 outline-none cursor-pointer p-0 active:scale-90 transition-transform duration-100 scale-[0.8]"
                aria-label="Previous Featured App"
                style="filter: drop-shadow(0 3px 4px rgba(0,0,0,0.25));"
              >
                <svg
                  width="28"
                  height="46"
                  viewBox="0 0 28 46"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M26 4 C26 4, 26 1, 23 1 C21 1, 20 2.5, 20 2.5 L3 20 C0.5 22, 0.5 24, 3 26 L20 43.5 C20 43.5, 21 45, 23 45 C26 45, 26 42, 26 42 Z"
                    fill="#f0a41a"
                  />
                  <path
                    d="M25 4 C25 4, 25 2.5, 23 2.5 C21.5 2.5, 20.5 3.5, 20.5 3.5 L3.5 21 C1.5 22.5, 1.5 23.5, 3.5 25 L20.5 42.5 C20.5 42.5, 21.5 43.5, 23 43.5 C25 43.5, 25 42, 25 42 Z"
                    fill="#ffd04a"
                    opacity="0.5"
                  />
                </svg>
              </button>
            {/if}

            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="flex gap-4 items-center bg-white/60 p-4 rounded-3xl border-2 border-white/40 shadow-sm relative overflow-hidden shrink-0 cursor-pointer hover:scale-[1.02] transition-transform w-full mx-1"
              onclick={() => {
                selectedApp = app;
                currentView = "detail";
              }}
            >
              <!-- Subtle background pattern -->
              <div
                class="absolute inset-0 opacity-[0.03] pointer-events-none"
                style="background-image: radial-gradient(#2d5c56 1px, transparent 1px); background-size: 8px 8px;"
              ></div>

              <!-- App Icon -->
              <div
                class="w-[50%] aspect-square flex items-center justify-center shrink-0 z-10 bg-white/50 rounded-2xl p-2 border border-white/60 shadow-inner"
              >
                <NookIcon
                  name={app.logo || app.appIcon || "directory"}
                  class="w-full h-full object-contain drop-shadow-sm"
                />
              </div>

              <!-- App Titles & Basic Ratings -->
              <div class="flex flex-col min-w-0 flex-1 justify-center z-10">
                <h3 class="text-[15px] font-black text-[#2d5c56] leading-tight truncate">
                  {app.name}
                </h3>

                <!-- Description -->
                <p class="text-[11px] font-bold text-[#4c4637]/90 leading-snug mt-1 line-clamp-2">
                  {app.description}
                </p>

                <!-- Platform / Action Tags -->
                <div class="flex flex-wrap gap-1 mt-1.5">
                  {#each app.tools.slice(0, 2) as tool}
                    <span
                      class="text-[8px] font-black bg-[#45a38f] text-[#fffdf5] px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                    >
                      {tool}
                    </span>
                  {/each}
                </div>

                <!-- Inline Installs and Review Stars -->
                <div class="flex items-center gap-3 text-[11px] font-black text-[#2d5c56]/80 mt-2">
                  <div class="flex items-center gap-0.5">
                    <span class="text-[#f59e33] text-sm leading-none -mt-0.5">★</span>
                    <span>{stats?.average_rating || "0.0"}</span>
                  </div>
                  <div class="w-1 h-1 bg-[#2d5c56]/30 rounded-full"></div>
                  <div class="flex items-center gap-0.5">
                    <Download class="w-3 h-3 text-[#45a38f] stroke-[2.5px]" />
                    <span>{stats?.installs || "0"}</span>
                  </div>
                </div>
              </div>
            </div>

            {#if featuredApps.length > 1 && featuredAppIndex < featuredApps.length - 1}
              <button
                onclick={() => (featuredAppIndex = featuredAppIndex + 1)}
                class="absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-transparent border-0 outline-none cursor-pointer p-0 active:scale-90 transition-transform duration-100 scale-[0.8]"
                aria-label="Next Featured App"
                style="filter: drop-shadow(0 3px 4px rgba(0,0,0,0.25));"
              >
                <svg
                  width="28"
                  height="46"
                  viewBox="0 0 28 46"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 4 C2 4, 2 1, 5 1 C7 1, 8 2.5, 8 2.5 L25 20 C27.5 22, 27.5 24, 25 26 L8 43.5 C8 43.5, 7 45, 5 45 C2 45, 2 42, 2 42 Z"
                    fill="#f0a41a"
                  />
                  <path
                    d="M3 4 C3 4, 3 2.5, 5 2.5 C6.5 2.5, 7.5 3.5, 7.5 3.5 L24.5 21 C26.5 22.5, 26.5 23.5, 24.5 25 L7.5 42.5 C7.5 42.5, 6.5 43.5, 5 43.5 C3 43.5, 3 42, 3 42 Z"
                    fill="#ffd04a"
                    opacity="0.5"
                  />
                </svg>
              </button>
            {/if}
          </div>
        </div>
      {/if}

      <div class="grid grid-cols-2 gap-3 content-start">
        {#each filteredProjects as p (p.name)}
          {@const isInstalled = checkIsCoreApp(p.name) || nookState.isAppInstalled(p.name)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            onclick={() => {
              selectedApp = p;
              currentView = "detail";
            }}
            class="min-h-[11rem] h-full rounded-xl flex flex-col items-center p-3 pb-10 transition-all relative overflow-hidden group bg-[#d4e8e6] border-2 border-[#bedad4] shadow-sm hover:scale-105 cursor-pointer"
          >
            <!-- Faux Pattern Background -->
            <div
              class="absolute inset-0 opacity-[0.05] pointer-events-none"
              style="background-image: radial-gradient(#2d5c56 1px, transparent 1px); background-size: 10px 10px;"
            ></div>

            <!-- Checkmark if installed -->
            {#if isInstalled}
              <div class="absolute top-2 right-2 opacity-70 z-10">
                <CheckCircle
                  class="w-4 h-4 text-[#2a8b75]"
                  strokeWidth={4}
                />
              </div>
            {/if}

            <!-- Item Icon -->
            <div
              class="w-12 h-12 shrink-0 bg-white/50 rounded-2xl border-2 border-white/60 flex items-center justify-center shadow-inner overflow-hidden z-10 mb-2"
            >
              <NookIcon
                name={p.logo || p.appIcon || "directory"}
                class="w-8 h-8 object-contain drop-shadow-sm group-hover:scale-110 transition-transform"
              />
            </div>

            <!-- Item Name -->
            <h3
              class="text-[#2d5c56] text-[12px] font-black leading-tight truncate w-full text-center z-10"
            >
              {p.name}
            </h3>

            <!-- Item Description -->
            <p
              class="text-[#45a38f] text-[10px] font-bold leading-tight text-center mt-1 z-10 w-full px-1"
            >
              {p.description}
            </p>

            <!-- Craftable Banner -->
            <div
              class="absolute bottom-0 left-0 w-full bg-[#45a38f] text-[#fffdf5] text-[10px] font-black shadow-inner z-10 border-t-2 border-[#368875]"
            >
              {#if selectedPlatform === "installable"}
                {#if isInstalled}
                  <div class="py-1.5 flex items-center justify-center gap-1">Installed</div>
                {:else}
                  <button
                    onclick={(e) => {
                      e.stopPropagation();
                      handleInstall(p.name);
                    }}
                    class="w-full py-1.5 flex items-center justify-center gap-1 hover:bg-[#368875] transition-colors"
                  >
                    <CloudDownload
                      class="w-3.5 h-3.5"
                      strokeWidth={3}
                    /> Install
                  </button>
                {/if}
              {:else if selectedPlatform === "ios"}
                <button
                  onclick={(e) => {
                    e.stopPropagation();
                    handleExternalLink(p.ios, p.name);
                  }}
                  class="w-full py-1.5 flex items-center justify-center gap-1 hover:bg-[#368875] transition-colors"
                >
                  <Smartphone
                    class="w-3.5 h-3.5"
                    strokeWidth={3}
                  /> Get on iOS
                </button>
              {:else if selectedPlatform === "android"}
                <button
                  onclick={(e) => {
                    e.stopPropagation();
                    handleExternalLink(p.android, p.name);
                  }}
                  class="w-full py-1.5 flex items-center justify-center gap-1 hover:bg-[#368875] transition-colors"
                >
                  <Smartphone
                    class="w-3.5 h-3.5"
                    strokeWidth={3}
                  /> Get on Android
                </button>
              {/if}
            </div>
          </div>
        {/each}

        {#if filteredProjects.length === 0}
          <div class="col-span-full text-center py-10 opacity-50 font-bold">No tools found.</div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Detail View -->
  <div
    class={`absolute inset-0 w-full h-full flex flex-col bg-[#e5f1f0] transition-transform duration-300 z-20 ${currentView === "detail" ? "translate-x-0" : "translate-x-full"}`}
  >
    {#if selectedApp}
      {@const isCoreApp = checkIsCoreApp(selectedApp.name)}
      {@const isInstalled = isCoreApp || nookState.isAppInstalled(selectedApp.name)}
      {@const slug = selectedApp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
      {@const stats = cloudApps[slug] || {
        user_rating: 0,
        average_rating: "0.0",
        reviews: 0,
        installs: 0,
        rating_count: 0
      }}

      <div class="flex flex-col h-full overflow-hidden p-4">
        <div class="flex-1 overflow-y-auto ac-scrollbar flex flex-col gap-4 pb-6">
          <!-- Compact Hero Card -->
          <div
            class="flex gap-4 items-center bg-white/40 p-4 rounded-3xl border border-white/20 shadow-sm relative overflow-hidden shrink-0"
          >
            <!-- Subtle background pattern -->
            <div
              class="absolute inset-0 opacity-[0.03] pointer-events-none"
              style="background-image: radial-gradient(#2d5c56 1px, transparent 1px); background-size: 8px 8px;"
            ></div>

            <!-- App Icon -->
            <div class="w-[42%] aspect-square flex items-center justify-center shrink-0 z-10">
              <NookIcon
                name={selectedApp.logo || selectedApp.appIcon || "directory"}
                class="w-full h-full object-contain drop-shadow-sm animate-fade-in"
              />
            </div>

            <!-- App Titles & Basic Ratings -->
            <div class="flex flex-col min-w-0 flex-1 justify-center z-10">
              <h3 class="text-[15px] font-black text-[#2d5c56] leading-tight truncate">
                {selectedApp.name}
              </h3>

              <!-- Description -->
              <p class="text-[11px] font-bold text-[#4c4637]/90 leading-snug mt-1">
                {selectedApp.description}
              </p>

              <!-- Platform / Action Tags -->
              <div class="flex flex-wrap gap-1 mt-1.5">
                {#each selectedApp.tools as tool}
                  <span
                    class="text-[8px] font-black bg-[#45a38f] text-[#fffdf5] px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                  >
                    {tool}
                  </span>
                {/each}
                {#if selectedApp.site}
                  <span
                    class="text-[8px] font-black bg-[#bedad4] text-[#2d5c56] px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                  >
                    Nook OS
                  </span>
                {/if}
                {#if selectedApp.ios}
                  <span
                    class="text-[8px] font-black bg-[#bedad4] text-[#2d5c56] px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                  >
                    iOS
                  </span>
                {/if}
                {#if selectedApp.android}
                  <span
                    class="text-[8px] font-black bg-[#bedad4] text-[#2d5c56] px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                  >
                    Android
                  </span>
                {/if}
              </div>

              <!-- Inline Installs and Review Stars -->
              <div class="flex items-center gap-3.5 text-[12px] font-black text-[#2d5c56]/80 mt-2">
                <div class="flex items-center gap-0.5">
                  <span class="text-[#f59e33] text-base leading-none -mt-0.5">★</span>
                  <span>{stats?.average_rating || "0.0"}</span>
                  <span class="text-[#2d5c56]/40">({stats?.rating_count || "0"})</span>
                </div>
                <div class="w-1 h-1 bg-[#2d5c56]/30 rounded-full"></div>
                <div class="flex items-center gap-0.5">
                  <Download class="w-3.5 h-3.5 text-[#45a38f] stroke-[2.5px]" />
                  <span>{stats?.installs || "0"}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="w-full mt-2.5">
                {#if isCoreApp}
                  <div
                    class="w-full flex items-center justify-center gap-1.5 bg-[#1bc6b6]/20 text-[#15a497] py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-[#1bc6b6]/30"
                  >
                    <CheckCircle class="w-3.5 h-3.5" /> Installed
                  </div>
                {:else if isInstalled}
                  <div class="flex gap-2 w-full flex-col">
                    {#if selectedPlatform === "ios" && selectedApp.ios}
                      <button
                        onclick={() => handleExternalLink(selectedApp.ios, selectedApp.name)}
                        class="w-full flex items-center justify-center gap-1.5 bg-[#1bc6b6] text-white py-2 rounded-xl text-[10px] font-black hover:bg-[#15a497] active:scale-95 transition-all shadow-sm mb-1"
                      >
                        <Smartphone class="w-3.5 h-3.5" /> Get on iOS
                      </button>
                    {:else if selectedPlatform === "android" && selectedApp.android}
                      <button
                        onclick={() => handleExternalLink(selectedApp.android, selectedApp.name)}
                        class="w-full flex items-center justify-center gap-1.5 bg-[#f59e33] text-white py-2 rounded-xl text-[10px] font-black hover:bg-[#e08922] active:scale-95 transition-all shadow-sm mb-1"
                      >
                        <Smartphone class="w-3.5 h-3.5" /> Get on Android
                      </button>
                    {/if}
                    <div class="flex gap-2 w-full">
                      <div
                        class="flex-1 flex items-center justify-center gap-1.5 bg-[#1bc6b6]/20 text-[#15a497] py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-[#1bc6b6]/30"
                      >
                        <CheckCircle class="w-3.5 h-3.5" /> Installed
                      </div>
                      <button
                        onclick={() => {
                          handleUninstall(selectedApp.name);
                          currentView = "grid";
                        }}
                        class="flex-1 flex items-center justify-center gap-1.5 bg-[#fdafb2] text-[#8c2a2e] py-2 rounded-xl text-[10px] font-black hover:bg-[#f09a9d] active:scale-95 transition-all shadow-sm"
                      >
                        <Trash2 class="w-3.5 h-3.5" /> Uninstall
                      </button>
                    </div>
                  </div>
                {:else if selectedPlatform === "installable" && selectedApp.site}
                  <button
                    onclick={() => {
                      handleInstall(selectedApp.name);
                    }}
                    class="w-full flex items-center justify-center gap-1.5 bg-[#45a38f] text-[#fffdf5] py-2 rounded-xl text-[10px] font-black hover:bg-[#368875] transition-all active:scale-95 shadow-sm"
                  >
                    <Leaf class="w-3.5 h-3.5" /> Install to NookPhone
                  </button>
                {:else if selectedPlatform === "ios" && selectedApp.ios}
                  <div class="flex gap-2 w-full">
                    <button
                      onclick={() => {
                        handleExternalLink(selectedApp.ios, selectedApp.name);
                      }}
                      class="flex-1 flex items-center justify-center gap-1.5 bg-[#1bc6b6] text-white py-2 rounded-xl text-[10px] font-black hover:bg-[#15a497] active:scale-95 transition-all shadow-sm"
                    >
                      <Smartphone class="w-3.5 h-3.5" /> Get on iOS
                    </button>
                    <button
                      onclick={() => handleMarkInstalled(selectedApp.name)}
                      class="flex-[0.5] flex items-center justify-center gap-1 bg-[#45a38f] text-[#fffdf5] py-2 rounded-xl text-[10px] font-black hover:bg-[#368875] transition-all active:scale-95 shadow-sm"
                    >
                      <CheckCircle class="w-3.5 h-3.5" /> Mark
                    </button>
                  </div>
                {:else if selectedPlatform === "android" && selectedApp.android}
                  <div class="flex gap-2 w-full">
                    <button
                      onclick={() => {
                        handleExternalLink(selectedApp.android, selectedApp.name);
                      }}
                      class="flex-1 flex items-center justify-center gap-1.5 bg-[#f59e33] text-white py-2 rounded-xl text-[10px] font-black hover:bg-[#e08922] active:scale-95 transition-all shadow-sm"
                    >
                      <Smartphone class="w-3.5 h-3.5" /> Get on Android
                    </button>
                    <button
                      onclick={() => handleMarkInstalled(selectedApp.name)}
                      class="flex-[0.5] flex items-center justify-center gap-1 bg-[#45a38f] text-[#fffdf5] py-2 rounded-xl text-[10px] font-black hover:bg-[#368875] transition-all active:scale-95 shadow-sm"
                    >
                      <CheckCircle class="w-3.5 h-3.5" /> Mark
                    </button>
                  </div>
                {/if}
              </div>

              <!-- Developer Resources -->
              {#if selectedApp.site || selectedApp.git}
                <div class="flex gap-2 mt-2">
                  {#if selectedApp.site}
                    <a
                      href={selectedApp.site}
                      target="_blank"
                      rel="noreferrer"
                      class="flex-1 flex items-center justify-center gap-1.5 bg-[#45a38f] text-[#fffdf5] py-2 rounded-xl text-[10px] font-black no-underline hover:bg-[#368875] transition-all active:scale-95 shadow-sm"
                    >
                      <Globe class="w-3.5 h-3.5" /> Open Website
                    </a>
                  {/if}
                  {#if selectedApp.git}
                    <a
                      href={selectedApp.git}
                      target="_blank"
                      rel="noreferrer"
                      class="flex-1 flex items-center justify-center gap-1.5 bg-[#2d5c56] text-[#fffdf5] py-2 rounded-xl text-[10px] font-black no-underline hover:bg-[#1e3e3a] transition-all active:scale-95 shadow-sm"
                    >
                      <Code class="w-3.5 h-3.5" /> View Source
                    </a>
                  {/if}
                </div>
              {/if}
            </div>
          </div>

          <!-- Information Grid -->
          <div
            class="bg-white/40 p-4 rounded-3xl border border-white/20 shadow-sm flex flex-col gap-3"
          >
            <span class="text-[9px] font-black text-[#2d5c56]/50 uppercase tracking-wider"
              >Specifications</span
            >

            <div class="grid grid-cols-2 gap-3 text-[11px] font-bold text-[#2d5c56]">
              <!-- Languages -->
              <div class="flex flex-col bg-white/30 p-2.5 rounded-2xl border border-white/10">
                <span class="text-[9px] text-[#45a38f] font-black uppercase tracking-wide mb-1"
                  >Languages</span
                >
                <div class="flex flex-wrap gap-1">
                  {#each selectedApp.languages as l}
                    <span
                      class="bg-[#bedad4] text-[#2d5c56] text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase"
                    >
                      {l}
                    </span>
                  {/each}
                </div>
              </div>

              <!-- Scope -->
              <div class="flex flex-col bg-white/30 p-2.5 rounded-2xl border border-white/10">
                <span class="text-[9px] text-[#45a38f] font-black uppercase tracking-wide mb-1"
                  >Scope</span
                >
                <div class="flex flex-wrap gap-1">
                  {#each selectedApp.information as info}
                    <span
                      class="bg-[#bedad4] text-[#2d5c56] text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase"
                    >
                      {info}
                    </span>
                  {/each}
                </div>
              </div>
            </div>
          </div>

          <!-- Review Input Section -->
          {#if isInstalled && proUser}
            <div
              class="bg-white/40 p-4 rounded-3xl border border-white/20 shadow-sm flex flex-col gap-2"
            >
              <span class="text-[9px] font-black text-[#2d5c56]/50 uppercase tracking-wider block"
                >Your Review</span
              >
              <div
                class="flex justify-between items-center bg-white/30 p-2 rounded-2xl border border-white/10"
              >
                <Rating
                  bind:rating={stats.user_rating}
                  size={18}
                  max={5}
                />
                <button
                  onclick={() => handleRate(selectedApp.name, stats.user_rating)}
                  class="bg-[#45a38f] text-[#fffdf5] text-[10px] font-black px-3.5 py-1.5 rounded-xl active:scale-95 hover:bg-[#368875] transition-all"
                >
                  {stats.user_rating ? "Update" : "Submit"}
                </button>
              </div>
              <textarea
                bind:value={ratingComments[slug]}
                placeholder="Write your review here (optional)..."
                class="w-full text-xs font-semibold p-3 bg-[#fffdf5] border border-[#bedad4] focus:border-[#45a38f] rounded-2xl outline-none resize-none shadow-inner"
                rows="2"
              ></textarea>
            </div>
          {/if}

          <!-- Community Reviews List -->
          {#if stats?.reviews && stats.reviews.length > 0}
            <div
              class="bg-white/40 p-4 rounded-3xl border border-white/20 shadow-sm flex flex-col gap-3"
            >
              <span class="text-[9px] font-black text-[#2d5c56]/50 uppercase tracking-wider"
                >Community Reviews ({stats.reviews.length})</span
              >
              <div class="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1 ac-scrollbar">
                {#each stats.reviews as rev}
                  <div
                    class="bg-white/80 p-3 rounded-2xl border border-[#bedad4]/30 flex flex-col gap-1.5 shadow-sm"
                  >
                    <div class="flex justify-between items-center">
                      <span class="text-[11px] font-black text-[#2d5c56]">{rev.author}</span>
                      <span class="text-[10px] text-[#45a38f] font-black">★ {rev.rating}</span>
                    </div>
                    <p class="text-[10px] font-semibold text-[#4c4637] leading-relaxed">
                      {rev.content}
                    </p>
                    <span class="text-[8px] font-bold text-gray-400 text-right">{rev.date}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</NookAppTemplate>
