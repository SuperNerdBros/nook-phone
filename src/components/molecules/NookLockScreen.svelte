<script lang="ts">
  import { Unlock, LogIn, Delete } from "@lucide/svelte";
  import { fly, fade } from 'svelte/transition';
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import { isProUser, fetchPatreonAuthUrl } from '@/lib/api';
  import { onMount } from 'svelte';
  import { playSound } from '@/lib/audio';

  const ctx = getPhoneContext();
  let isPro = $state(false);
  let authUrl = $state('');

  let showPinPad = $state(false);
  let enteredPin = $state('');
  let pinError = $state(false);

  onMount(async () => {
    isPro = isProUser();
    authUrl = await fetchPatreonAuthUrl(window.location.href) || '';
  });

  function handlePatreonLogin() {
    playSound('click', !nookState.settings.soundEffects);
    if (authUrl) {
      window.location.href = authUrl;
    } else {
      alert("Patreon authentication is currently unavailable. Please contact the administrator.");
    }
  }

  function handleUnlockClick() {
    if (nookState.settings.requirePasscode && nookState.settings.passcode) {
      showPinPad = true;
      enteredPin = '';
      pinError = false;
      playSound('woosh', !nookState.settings.soundEffects);
    } else {
      ctx.handleUnlock();
    }
  }

  function handlePinInput(num: number) {
    if (enteredPin.length < 4) {
      enteredPin += num;
      playSound('beep', !nookState.settings.soundEffects);
      if (enteredPin.length === 4) {
        if (enteredPin === nookState.settings.passcode) {
          setTimeout(() => {
            showPinPad = false;
            ctx.handleUnlock();
          }, 300);
        } else {
          playSound('error', !nookState.settings.soundEffects);
          pinError = true;
          setTimeout(() => {
            enteredPin = '';
            pinError = false;
          }, 500);
        }
      }
    }
  }

  function handlePinDelete() {
    if (enteredPin.length > 0) {
      enteredPin = enteredPin.slice(0, -1);
      playSound('beep', !nookState.settings.soundEffects);
    }
  }
</script>

{#if nookState.isPhoneLocked}
  <div
    transition:fly={{ y: -20, duration: 300 }}
    class={`absolute inset-0 flex flex-col justify-between p-6 z-[60] overflow-hidden ${(!ctx.customWallpaper && ctx.currentWallpaper?.isDefault) ? ctx.currentWallpaper.bg : ''}`}
    style={ctx.wallpaperStyle}
  >
    <!-- Wallpaper Pattern -->
    {#if !ctx.customWallpaper && ctx.currentWallpaper?.isDefault}
      <div 
        class="absolute inset-0 opacity-[0.14] pointer-events-none z-0" 
        style={`background-image: url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 5l5 10h10l-8 7 3 10-10-6-10 6 3-10-8-7h10z%22 ${ctx.currentWallpaper.pattern} fill-opacity=%220.4%22/%3E%3C/svg%3E'); background-size: 56px 56px;`}
      ></div>
    {/if}

    {#if showPinPad}
      <div class="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
        <h2 class="text-white font-['Varela_Round',sans-serif] font-bold text-xl mb-6 mt-12">Enter Passcode</h2>
        
        <!-- PIN Dots -->
        <div class={`flex gap-4 mb-12 ${pinError ? 'animate-[bounce_0.3s_infinite]' : ''}`}>
          {#each [1, 2, 3, 4] as i}
            <div class={`w-4 h-4 rounded-full border-2 border-white transition-colors duration-200 ${enteredPin.length >= i ? 'bg-white' : 'bg-transparent'}`}></div>
          {/each}
        </div>

        <!-- PIN Pad -->
        <div class="grid grid-cols-3 gap-6 font-['Varela_Round',sans-serif]">
          {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as num}
            <button 
              onclick={() => handlePinInput(num)}
              class="w-16 h-16 rounded-full bg-white/20 text-white font-bold text-2xl flex items-center justify-center hover:bg-white/30 active:bg-white/40 active:scale-95 transition-all border-0 cursor-pointer"
            >
              {num}
            </button>
          {/each}
          <div class="w-16 h-16"></div> <!-- Empty space -->
          <button 
            onclick={() => handlePinInput(0)}
            class="w-16 h-16 rounded-full bg-white/20 text-white font-bold text-2xl flex items-center justify-center hover:bg-white/30 active:bg-white/40 active:scale-95 transition-all border-0 cursor-pointer"
          >
            0
          </button>
          <button 
            onclick={handlePinDelete}
            class="w-16 h-16 rounded-full bg-transparent text-white/80 font-bold text-2xl flex items-center justify-center hover:text-white active:scale-95 transition-all border-0 cursor-pointer"
          >
            <Delete class="w-8 h-8" />
          </button>
        </div>

        <button 
          onclick={() => showPinPad = false}
          class="mt-12 text-white/70 font-bold bg-transparent border-0 underline cursor-pointer hover:text-white"
        >
          Cancel
        </button>
      </div>
    {/if}

    <div class="flex flex-col items-center mt-12 gap-1.5 text-center relative z-10 flex-1 min-h-0">
      <span class="text-white/90 text-xs font-black uppercase tracking-widest block drop-shadow-md shrink-0">
        {new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
      </span>
      <h1 class="text-5xl font-mono font-black text-white tracking-tight drop-shadow-lg m-0 mt-1 shrink-0">
        {ctx.timeStr}
      </h1>
      <!-- Lock Screen Notifications or Paywall -->
      {#if isPro}
        <div class="mt-4 w-full max-w-[280px] flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1 pb-4" style="scrollbar-width: none;">
          {#each nookState.notifications.slice(0, 10) as notif (notif.id)}
            <div class="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl p-2.5 shadow-sm flex gap-2 items-start text-left relative animate-fade-in">
              <div class="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-lg shrink-0 mt-0.5">
                {notif.sender === "Tom Nook" ? "🍃" : notif.sender === "Isabelle" ? "🐶" : notif.sender === "Lottie" ? "🌸" : "🔔"}
              </div>
              <div class="flex-1 flex flex-col gap-0.5 pr-2">
                <span class="text-[7.5px] font-black text-orange-800/80 tracking-widest uppercase block">
                  {notif.sender} • {notif.timestamp}
                </span>
                <span class="font-extrabold text-[12px] text-[#5c5446] leading-tight block">{notif.title}</span>
                <p class="text-[9.5px] text-gray-500 mt-0.5 leading-relaxed m-0">
                  {notif.message}
                </p>
              </div>
            </div>
          {:else}
            <div class="bg-white/40 backdrop-blur-sm border border-dashed border-white/40 rounded-2xl p-4 text-center text-[#5d5a4a]/75 text-[11px] font-bold">
              No recent notifications
            </div>
          {/each}
        </div>
      {:else}
        <div class="mt-8 w-full max-w-[280px] flex flex-col items-center gap-3 relative animate-fade-in">
          <div class="bg-[#f0b157]/90 backdrop-blur-md border-4 border-[#d99c45] rounded-3xl p-5 shadow-lg text-center flex flex-col items-center">
            <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-inner">
              <span class="text-3xl drop-shadow-sm">🔒</span>
            </div>
            <h2 class="text-[#5c3a21] font-black text-lg m-0 leading-tight">NookPhone+</h2>
            <p class="text-[11px] text-[#5c3a21]/80 font-bold mt-1 mb-4 leading-snug">
              Unlock the full potential of your NookPhone with a Pro account!
            </p>
            <button
              onclick={handlePatreonLogin}
              class="w-full bg-[#FF424D] text-white border-0 py-2.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#e63c45] active:scale-95 transition-all cursor-pointer"
            >
              <LogIn class="w-3.5 h-3.5" /> Connect with Patreon
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Slider/Unlock Button -->
    <button
      onclick={handleUnlockClick}
      class="w-full max-w-sm mx-auto bg-[#5c8e43] text-white border-0 py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#4b7a34] active:scale-95 transition-all mb-8 relative z-10 cursor-pointer"
    >
      <Unlock class="w-4 h-4 animate-bounce" /> Slide / Tap to unlock
    </button>
  </div>
{/if}
