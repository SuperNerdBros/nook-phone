<script lang="ts">
  import { getPhoneContext } from "../organisms/phoneContext.svelte";
  import { fly } from "svelte/transition";
  import { X, Cloud, Sparkles, ChevronRight, PlusIcon } from "@lucide/svelte";
  import NookIcon from "../atoms/NookIcon.svelte";
  import NookAppIcon from "../atoms/NookAppIcon.svelte";
  import nookIncLogo from "@/assets/img/Nook_Inc.svg";
  import cellularStatusImg from "@/assets/img/cellular_status.png";
  import { resolveAssetUrl } from "@/lib/utils";
  import { fetchPatreonAuthUrl } from "@/lib/api";
  import { onMount } from "svelte";

  const ctx = getPhoneContext();

  let authUrl = $state("");
  let selectedApp = $state<any>(null);

  onMount(async () => {
    authUrl = (await fetchPatreonAuthUrl()) || "";
  });

  const handleClose = () => {
    ctx.showPremiumUpsell = false;
  };

  const handleSubscribe = () => {
    if (authUrl) {
      window.location.href = authUrl;
    } else {
      window.open("https://www.patreon.com/xophz", "_blank");
    }
  };

  const premiumApps = [
    {
      id: "abd",
      logo: "wallet",
      name: "ABD",
      desc: "Automatic Bell Dispenser. 500k bells deposited to your account",
      bg: "bg-[#d9f6af]"
    },
    {
      id: "messages",
      logo: "mail",
      name: "Messages",
      desc: "Direct messaging between residents",
      bg: "bg-[#8b3a3a]"
    },
    {
      id: "bestfriends",
      logo: "best_friend",
      name: "Best Friends",
      desc: "Social hub, multiple passports & friend connections",
      bg: "bg-[#ffd375]"
    },
    {
      id: "bulletin",
      logo: "chat",
      name: "Bulletin Board",
      desc: "Public bulletin boards & island-wide announcements",
      bg: "bg-[#eb6a9d]"
    },
    {
      id: "directory",
      logo: "directory",
      name: "App Directory",
      desc: "Browse & install third-party island apps",
      bg: "bg-[#45a38f]"
    }
  ];
</script>

{#if ctx.showPremiumUpsell}
  <div
    class="absolute inset-0 z-[100] bg-[#faf8f0] flex flex-col overflow-hidden"
    transition:fly={{ y: 40, duration: 280, opacity: 0 }}
  >
    <!-- Close -->
    <button
      onclick={handleClose}
      class="absolute top-3 right-3 w-9 h-9 bg-black/8 hover:bg-black/15 rounded-full flex items-center justify-center border-0 cursor-pointer transition z-20 text-[#5c5446]"
    >
      <X class="w-5 h-5" />
    </button>

    <!-- Scrollable Content -->
    <div
      class="flex-1 overflow-y-auto overscroll-contain"
      style="scrollbar-width: none;"
    >
      <!-- Hero Banner -->
      <div
        class="bg-gradient-to-br from-[#61b948] via-[#6ec94e] to-[#4a9e35] px-6 pt-10 pb-12 text-center relative overflow-hidden"
      >
        <!-- Leaf pattern overlay -->
        <div
          class="absolute inset-0 opacity-[0.08] pointer-events-none"
          style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M30 8c12 0 18 10 18 22s-18 22-18 22S12 42 12 30 18 8 30 8z%22 fill=%22white%22 fill-opacity=%220.5%22/%3E%3C/svg%3E'); background-size: 48px 48px;"
        ></div>

        <!-- Wavy bottom edge - Layer 1 (Background) -->
        <div class="w-full absolute -bottom-[1px] left-0 h-11 overflow-hidden opacity-40">
          <div class="w-full h-full bob-animation">
            <div class="w-[200%] h-full flex wave-animation-slow">
              <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                class="w-1/2 h-full block"
              >
                <path
                  d="M0,60 Q75,120 150,60 T300,60 T450,60 T600,60 T750,60 T900,60 T1050,60 T1200,60 L1200,120 L0,120 Z"
                  fill="#faf8f0"
                ></path>
              </svg>
              <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                class="w-1/2 h-full block"
              >
                <path
                  d="M0,60 Q75,120 150,60 T300,60 T450,60 T600,60 T750,60 T900,60 T1050,60 T1200,60 L1200,120 L0,120 Z"
                  fill="#faf8f0"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Wavy bottom edge - Layer 2 (Foreground) -->
        <div class="w-full absolute -bottom-[1px] left-0 h-9 overflow-hidden">
          <div class="w-[200%] h-full flex wave-animation-fast">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              class="w-1/2 h-full block"
            >
              <path
                d="M0,60 Q75,120 150,60 T300,60 T450,60 T600,60 T750,60 T900,60 T1050,60 T1200,60 L1200,120 L0,120 Z"
                fill="#faf8f0"
              ></path>
            </svg>
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              class="w-1/2 h-full block"
            >
              <path
                d="M0,60 Q75,120 150,60 T300,60 T450,60 T600,60 T750,60 T900,60 T1050,60 T1200,60 L1200,120 L0,120 Z"
                fill="#faf8f0"
              ></path>
            </svg>
          </div>
        </div>

        <div class="relative z-10 flex flex-col items-center">
          <!-- Logo badge -->
          <div
            class="w-[72px] h-[72px] bg-white/25 rounded-[22px] flex items-center justify-center mb-3 shadow-lg border-2 border-white/30 backdrop-blur-sm"
            style="box-shadow: 0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3);"
          >
            <img
              src={resolveAssetUrl(nookIncLogo)}
              alt="Nook Inc."
              class="w-11 h-11 brightness-0 invert drop-shadow-md"
            />
          </div>

          <h1
            class="text-[26px] font-black m-0 text-white drop-shadow-sm tracking-wide leading-none flex items-center justify-center gap-1.5"
          >
            <img
              src={resolveAssetUrl(cellularStatusImg)}
              alt="Signal"
              class="h-5 object-contain"
              style="filter: invert(72%) sepia(80%) saturate(450%) hue-rotate(65deg) brightness(1.2) contrast(1);"
            />
            NookPhone<span class="text-yellow-200">+</span>
          </h1>
          <p class="text-[11px] font-bold text-white/80 mt-1.5 mb-0 tracking-wider uppercase">
            Cell Service Upgrade Plan
          </p>
        </div>
      </div>

      <!-- Tom Nook Pitch -->
      <div class="px-2 -mt-6 relative z-10">
        <div
          class="rounded-3xl px-3 flex flex-col items-center gap-2 text-center overflow-hidden relative"
        >
          <div class="flex flex-row justify-center items-center gap-2">
            <img
              src={resolveAssetUrl(cellularStatusImg)}
              alt=""
              class="w-40 h-40 object-contain shrink-0 drop-shadow-md relative z-10"
              style="filter: invert(58%) sepia(61%) saturate(547%) hue-rotate(67deg) brightness(94%) contrast(92%);"
            />
            <PlusIcon class="text-green" />
            <div class="flex-1 min-w-0 mt-2 relative z-10">
              <span class="block text-[18px] font-black text-[#1b5e20] leading-none mb-1.5">
                Starting @ $5
              </span>
              <span class="block text-[12px] text-[#388e3c] font-semibold leading-relaxed"
                >Full connectivity. Communicate with residents worldwide. + 500,000 Bells.</span
              >
            </div>
          </div>
          <!-- <div class="absolute inset-0 opacity-[0.05]" style="background-image: radial-gradient(#1b5e20 2px, transparent 2px); background-size: 16px 16px;"></div> -->
        </div>
        <div class="bg-white border border-[#e8e4d8] rounded-2xl p-4 shadow-sm relative transition-all duration-300">
          <!-- Speech tail -->
          <div
            class="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-[#e8e4d8] rotate-45"
          ></div>
          {#if selectedApp}
            <p class="text-[12.5px] text-[#5c5446] leading-relaxed m-0 relative z-10 animate-fade-in">
              <strong class="text-[14px] text-[#3a7a25] block mb-1">{selectedApp.name}</strong>
              {selectedApp.desc}
            </p>
          {:else}
            <p class="text-[12.5px] text-[#5c5446] leading-relaxed m-0 relative z-10 animate-fade-in">
              <strong class="text-[#3a7a25]">Ah yes, yes!</strong> Thank you for your interest in the
              <strong>NookPhone+ service plan</strong>, yes yes! For a small monthly fee, we'll
              activate your cell service and unlock the full NookPhone experience. Plus, you'll be
              <strong>supporting the developer</strong> who keeps the servers running!
            </p>
          {/if}
        </div>
      </div>

      <!-- Cloud Sync Feature -->
      <div class="px-5 mt-4">
        <span
          class="text-[10px] font-black uppercase tracking-widest text-[#9a9585] block mb-2.5 px-1"
        >
          Plus Exclusive Features
        </span>

        <div
          class="bg-gradient-to-br from-[#e8f4fd] to-[#dbeafe] border border-[#b3d4f0] rounded-xl p-3.5 flex items-center gap-3 shadow-sm mt-2"
        >
          <div
            class="w-9 h-9 rounded-xl bg-[#3b82f6] text-white flex items-center justify-center shrink-0 shadow-sm"
          >
            <Cloud class="w-[18px] h-[18px]" />
          </div>
          <div class="flex-1 min-w-0">
            <span class="block text-[13px] font-black text-[#1e40af] leading-none"
              >Cloud Save Sync</span
            >
            <span class="block text-[10.5px] text-[#4b7ab5] font-semibold mt-0.5 leading-snug"
              >Your layout, settings & wallpaper sync across all devices</span
            >
          </div>
        </div>
      </div>

      <!-- Unlocked Apps -->
      <div class="px-5 mt-4">
        <span
          class="text-[10px] font-black uppercase tracking-widest text-[#9a9585] block mb-2.5 px-1"
        >
          Apps Included With Your Plan
        </span>
        <div class="w-full max-w-full grid gap-y-[24px] gap-x-[10px] px-2 pt-2 justify-items-center content-start grid-cols-3">
          {#each premiumApps as app}
            <div class={`transition-all duration-200 ${selectedApp?.id === app.id ? 'scale-110' : 'hover:scale-105'}`}>
              <NookAppIcon 
                app={app} 
                size="lg" 
                showText={false}
                forceUnlock={true}
                onClick={() => selectedApp = app}
              />
            </div>
          {/each}
        </div>
      </div>

      <!-- Welcome Bonus & Fees -->
      <div class="px-5 mt-4">
        <div
          class="bg-gradient-to-br from-[#fff8e1] to-[#fff3cd] border-2 border-[#f0d060] rounded-2xl p-4 relative overflow-hidden"
        >
          <div class="absolute top-2 right-2 opacity-20">
            <Sparkles class="w-12 h-12 text-[#d4a017]" />
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-[#b8860b] block mb-2">
            ★ Account Perks & Fees ★
          </span>
          <div class="flex items-baseline gap-2 mb-1.5">
            <span class="text-[22px] font-black text-[#8B6914] leading-none">+500,000</span>
            <span class="text-[13px] font-black text-[#a07d1c]">Bells / Month Reward</span>
          </div>
          <div class="flex items-baseline gap-2 border-t border-[#f0d060]/50 pt-2">
            <span class="text-[22px] font-black text-[#c0392b] leading-none">-50,000</span>
            <span class="text-[13px] font-black text-[#b03a2e]">Bells / Month Cell Service</span>
          </div>
          <p class="text-[10px] text-[#8B6914]/70 font-bold mt-2.5 mb-0">
            Monthly allowance deposited automatically. Cell service fee deducted monthly.
          </p>
        </div>
      </div>

      <!-- Spacer for sticky footer -->
      <div class="h-52"></div>
    </div>

    <!-- Sticky Footer CTA -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#faf8f0] via-[#faf8f0] to-transparent pt-8 pb-6 px-5 z-10"
    >
      <!-- Price -->
      <div class="text-center mb-3">
        <div class="flex items-baseline justify-center gap-1.5">
          <span class="text-[28px] font-black text-[#3d3a32] leading-none">$5</span>
          <span class="text-[13px] font-bold text-[#8a8577]">/ month</span>
        </div>
        <p class="text-[10px] text-[#8a8577] font-semibold mt-1 mb-0">
          via Patreon • Cancel anytime
        </p>
      </div>

      <button
        onclick={handleSubscribe}
        class="w-full bg-gradient-to-r from-[#61b948] to-[#4a9e35] hover:from-[#52a13b] hover:to-[#3f8c2d] text-white font-black text-[15px] py-4 rounded-2xl cursor-pointer transition-all active:scale-[0.97] border-0 shadow-lg flex items-center justify-center gap-2"
        style="box-shadow: 0 4px 14px rgba(97, 185, 72, 0.4);"
      >
        <img
          src={resolveAssetUrl(nookIncLogo)}
          alt=""
          class="w-5 h-5 brightness-0 invert"
        />
        Activate NookPhone+
        <ChevronRight class="w-4 h-4 opacity-70" />
      </button>

      <button
        onclick={handleClose}
        class="w-full bg-transparent hover:bg-black/5 text-[#9a9585] font-bold text-[12px] py-2.5 rounded-xl cursor-pointer transition border-0 mt-1.5"
      >
        Maybe Later
      </button>
    </div>
  </div>
{/if}

<style>
  .wave-animation-fast {
    animation: wave 16s linear infinite;
  }
  .wave-animation-slow {
    animation: wave 28s linear infinite;
  }
  .bob-animation {
    animation: bob 6s ease-in-out infinite;
  }
  @keyframes wave {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  @keyframes bob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(10px);
    }
  }
</style>
