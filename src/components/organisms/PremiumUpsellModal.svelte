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
        <!-- Cell status pattern overlay -->
        <div
          class="absolute inset-0 opacity-[0.06] pointer-events-none"
          style="background-image: url({resolveAssetUrl(
            cellularStatusImg
          )}); background-size: 32px 32px; background-repeat: repeat; filter: brightness(0) invert(1);"
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
          <!-- Logo badge (No Box) -->
          <img
            src={resolveAssetUrl(cellularStatusImg)}
            alt="Signal"
            class="h-16 object-contain mb-3 drop-shadow-md"
            style="filter: invert(72%) sepia(80%) saturate(450%) hue-rotate(65deg) brightness(1.2) contrast(1);"
          />

          <h1
            class="text-[26px] font-black m-0 text-white drop-shadow-sm tracking-wide leading-none flex items-center justify-center gap-1.5"
          >
            NookPhone<span class="text-yellow-200">+</span>
          </h1>
          <p class="text-[11px] font-bold text-white/80 mt-1.5 mb-0 tracking-wider uppercase">
            Cell Service Upgrade Plan
          </p>
        </div>
      </div>

      <!-- Tom Nook Pitch -->
      <div class="px-2 -mt-2 relative z-10">
        <div
          class="bg-white border border-[#e8e4d8] rounded-2xl p-4 shadow-sm relative transition-all duration-300"
        >
          <!-- Speech tail -->
          <div
            class="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-[#e8e4d8] rotate-45"
          ></div>
          <p class="text-[12.5px] text-[#5c5446] leading-relaxed m-0 relative z-10 animate-fade-in">
            <strong class="text-[#3a7a25]">Ah yes, yes!</strong> Thank you for your interest in the
            <strong>NookPhone+ service plan</strong>, yes yes! For a small monthly fee, we'll
            activate your cell service and unlock the full NookPhone+ experience. Plus, you'll be
            <strong>supporting the developer</strong> who keeps the servers running!
          </p>
        </div>
      </div>

      <!-- Plus Exclusive Features -->
      <div class="px-5 mt-4">
        <div class="rounded-3xl px-3 text-center overflow-hidden relative mb-4">
          <span class="block text-[18px] font-black text-[#1b5e20] leading-none mb-2">
            NookPhone+ Upgraded Plan
          </span>
          <span class="block text-[12px] text-[#388e3c] font-semibold leading-relaxed"
            >Enjoy seamless connectivity, cloud save backups, and exclusive member bonuses.</span
          >
        </div>

        <span
          class="text-[10px] font-black uppercase tracking-widest text-[#9a9585] block mb-2.5 px-1"
        >
          Plus Exclusive Features
        </span>
        <div class="bg-white border border-[#e8e4d8] rounded-2xl p-4 shadow-sm">
          <ul class="m-0 pl-1 space-y-3 text-[13px] text-[#5c5446] list-none">
            <li class="flex gap-2.5 items-start">
              <span class="text-[#61b948] mt-0.5 text-lg leading-none shrink-0">•</span>
              <div>
                <strong class="text-[#3a7a25] block text-[13.5px]">Premium Apps Unlocked</strong>
                ABD, Messages, Best Friends, Bulletin Board, and App Directory
              </div>
            </li>
            <li class="flex gap-2.5 items-start">
              <span class="text-[#61b948] mt-0.5 text-lg leading-none shrink-0">•</span>
              <div>
                <strong class="text-[#3a7a25] block text-[13.5px]">Cloud Save & Sync</strong>
                Keep your settings, custom layouts, and wallpapers synced across all of your devices
                automatically
              </div>
            </li>
            <li class="flex gap-2.5 items-start">
              <span class="text-[#61b948] mt-0.5 text-lg leading-none shrink-0">•</span>
              <div>
                <strong class="text-[#3a7a25] block text-[13.5px]">Safe & Verified Community</strong
                >
                Limits DMs, friend connections, and public bulletins to verified accounts to keep interactions
                safe and spam-free
              </div>
            </li>
            <li class="flex gap-2.5 items-start">
              <span class="text-[#61b948] mt-0.5 text-lg leading-none shrink-0">•</span>
              <div>
                <strong class="text-[#3a7a25] block text-[13.5px]"
                  >500k Monthly Bell Allowance</strong
                >
                Receive +500,000 Bells deposited directly to your ABD monthly (minus the 50,000 Bell
                cell fee. yes, yes.)
              </div>
            </li>
          </ul>
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
