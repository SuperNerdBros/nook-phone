<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { Coins, ChevronRight, Sparkles } from '@lucide/svelte';
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import { resolveAssetUrl } from '@/lib/utils';
  import AcnhBubble from '../molecules/AcnhBubble.svelte';
  
  const { appId, appName, onClose } = $props<{ appId: string; appName: string; onClose: () => void; }>();
  const ctx = getPhoneContext();
  
  const GOAL = 98000;
  let currentDonation = $derived(nookState.appDonations[appId] || 0);
  let remaining = $derived(Math.max(0, GOAL - currentDonation));
  let bellsAvailable = $derived(nookState.bells);
  let wasAppPermanent = $state(nookState.isAppPermanent(appId));
  
  type DialogState = 'intro' | 'checking_status' | 'donation_input' | 'donated_success' | 'fully_funded';
  let currentState = $state<DialogState>('intro');
  let donationAmount = $state(0);
  let dialogText = $state('');
  let isLloidDancing = $state(false);
  
  // Set default donation amount to remaining or 1000 if already funded
  $effect(() => {
    if (currentState === 'intro') {
      donationAmount = wasAppPermanent ? Math.min(bellsAvailable, 10000) : Math.min(bellsAvailable, remaining);
    }
  });
  
  // Update Lloid's dialogue based on state
  $effect(() => {
    if (currentState === 'intro') {
      if (wasAppPermanent) {
        dialogText = `Hullo, hullo! The ${appName} app is fully funded, but we're always accepting donations to support the developer!`;
      } else {
        dialogText = `Hullo, hullo! We're raising funds to make the ${appName} app a permanent resident! What do you say?`;
      }
      isLloidDancing = false;
    } else if (currentState === 'checking_status') {
      if (wasAppPermanent) {
        dialogText = `Let's see here... We've gathered an astounding ${currentDonation.toLocaleString()} Bells so far! Your generosity knows no bounds!`;
      } else {
        dialogText = `Let's see here... We've gathered ${currentDonation.toLocaleString()} Bells so far! We still need ${remaining.toLocaleString()} Bells!`;
      }
      isLloidDancing = false;
    } else if (currentState === 'donation_input') {
      if (bellsAvailable <= 0) {
        dialogText = `Oh, dear... It looks like you don't have any Bells on you right now.`;
      } else {
        dialogText = `Splendid! How many Bells would you like to donate today?`;
      }
      isLloidDancing = false;
    } else if (currentState === 'donated_success') {
      dialogText = `Clank-clank! Splendid! We just received your donation of Bells! We'll put them to good use!`;
      isLloidDancing = true;
    } else if (currentState === 'fully_funded') {
      dialogText = `Huzzah! We've reached our funding goal! The ${appName} app is now a permanent fixture on your NookPhone! Thank you!`;
      isLloidDancing = true;
    }
  });

  function handleDonate() {
    if (donationAmount > 0 && donationAmount <= bellsAvailable) {
      const donated = donationAmount;
      nookState.donateToApp(appId, donated);
      
      // Play sound
      import('@/lib/audio').then(m => m.playSound('success'));
      
      currentState = 'donated_success';
    }
  }
  
  function handleGetMoreBells() {
    ctx.showPremiumUpsell = true;
  }
</script>

<div class="absolute inset-0 z-[100] bg-black/20 backdrop-blur-sm flex flex-col overflow-hidden animate-fade-in" in:fade={{duration: 250}} out:fade={{duration: 200}}>

  <!-- Character (Centered) -->
  <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none pb-32">
    <div class="h-64 flex flex-col items-center justify-center relative animate-ac-float">
      {#if currentState === 'fully_funded'}
        <div class="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
          <div class="animate-ping absolute w-48 h-48 bg-yellow-300/30 rounded-full"></div>
          <Sparkles class="w-24 h-24 text-yellow-400 animate-spin" />
        </div>
      {/if}
      <img 
        src="https://dodo.ac/np/images/a/a6/Lloid_NH.png" 
        alt="Lloid" 
        class="h-full object-contain drop-shadow-2xl transition-transform duration-300"
        class:animate-bounce={isLloidDancing}
      />
    </div>
  </div>

  <!-- Bubble (Bottom Half) -->
  <div class="relative z-20 w-full px-4 pb-8 shrink-0 mt-auto">
    <AcnhBubble
      title="Lloid"
      badgeBg="#d98947"
      badgeColor="#ffffff"
      dialogText={dialogText}
      isActive={true}
      class="w-full max-w-lg mx-auto"
    >
      <div class="mt-4 border-t border-[#e1d9be]/60 pt-4 flex flex-col gap-3 animate-fade-in" style="animation-delay: 500ms;">
        {#if currentState === 'intro'}
          <button onclick={() => currentState = 'donation_input'} class="bg-[#1ca349] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#188a3e] active:scale-95 transition-transform w-full text-center cursor-pointer">
            I want to donate!
          </button>
          <div class="flex gap-2">
            <button onclick={() => currentState = 'checking_status'} class="flex-1 bg-[#ffdf28]/20 text-[#c2a613] border-2 border-[#ffdf28]/40 px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-[#ffdf28]/30 active:scale-95 transition-transform text-center cursor-pointer">
              How much is left?
            </button>
            <button onclick={onClose} class="flex-1 bg-white border-2 border-[#e1d9be] text-[#8a7f66] px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 active:scale-95 transition-transform text-center cursor-pointer">
              Not right now
            </button>
          </div>
        {:else if currentState === 'checking_status'}
          <button onclick={() => currentState = 'donation_input'} class="bg-[#1ca349] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#188a3e] active:scale-95 transition-transform w-full text-center cursor-pointer">
            Let's donate!
          </button>
          <button onclick={() => currentState = 'intro'} class="w-full text-center font-bold text-sm text-[#8a7f66] hover:underline cursor-pointer">
            Go back
          </button>
        {:else if currentState === 'donation_input'}
          {#if bellsAvailable <= 0}
            <button onclick={handleGetMoreBells} class="bg-[#1ca349] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#188a3e] active:scale-95 transition-transform w-full flex items-center justify-center gap-1 cursor-pointer">
              Get NookPhone+ <ChevronRight class="w-4 h-4" />
            </button>
            <button onclick={() => currentState = 'intro'} class="w-full text-center font-bold text-sm text-[#8a7f66] hover:underline cursor-pointer">
              Never mind
            </button>
          {:else}
            <div class="flex gap-2">
              <div class="flex-1 relative flex items-center">
                <Coins class="w-4 h-4 absolute left-3 text-[#d4a017]" />
                <input 
                  type="number" 
                  bind:value={donationAmount}
                  min="0"
                  max={wasAppPermanent ? bellsAvailable : Math.min(bellsAvailable, remaining)}
                  class="w-full bg-white pl-9 pr-16 py-2.5 rounded-xl text-lg font-black border-2 border-[#e1d9be] focus:outline-none focus:border-[#1ca349] text-[#5c3a21] placeholder:text-[#8a7f66]/60"
                />
                <button 
                  onclick={() => donationAmount = wasAppPermanent ? bellsAvailable : Math.min(bellsAvailable, remaining)}
                  class="absolute right-2 top-1/2 -translate-y-1/2 bg-[#ffdf28]/20 text-[#c2a613] border-2 border-[#ffdf28]/40 px-2 py-0.5 rounded-lg font-bold text-[10px] hover:bg-[#ffdf28]/30 active:scale-95 transition-transform cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button onclick={handleDonate} disabled={donationAmount <= 0} class="flex-[2] bg-[#1ca349] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#188a3e] active:scale-95 transition-transform text-center cursor-pointer">
                Donate
              </button>
              <button onclick={() => currentState = 'intro'} class="flex-1 bg-white border-2 border-[#e1d9be] text-[#8a7f66] px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-transform text-center cursor-pointer">
                Cancel
              </button>
            </div>
          {/if}
        {:else if currentState === 'donated_success'}
          <div class="flex gap-2">
            {#if nookState.isAppPermanent(appId)}
              <button onclick={() => currentState = 'fully_funded'} class="bg-[#1ca349] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#188a3e] active:scale-95 transition-transform w-full flex items-center justify-center gap-1 cursor-pointer">
                Next <ChevronRight class="w-4 h-4" />
              </button>
            {:else}
              <button onclick={() => currentState = 'donation_input'} class="flex-[2] bg-[#1ca349] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#188a3e] active:scale-95 transition-transform text-center cursor-pointer">
                Donate again
              </button>
              <button onclick={onClose} class="flex-1 bg-white border-2 border-[#e1d9be] text-[#8a7f66] px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-transform text-center cursor-pointer">
                Close
              </button>
            {/if}
          </div>
        {:else if currentState === 'fully_funded'}
          <button onclick={onClose} class="bg-[#1ca349] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#188a3e] active:scale-95 transition-transform w-full text-center cursor-pointer">
            Let's play!
          </button>
        {/if}
      </div>
    </AcnhBubble>
  </div>
</div>
