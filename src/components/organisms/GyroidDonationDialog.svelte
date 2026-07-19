<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { Coins, X, ChevronRight, HandCoins } from '@lucide/svelte';
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import gyroidImg from '@/assets/img/GyroidWiki.png';
  import { resolveAssetUrl } from '@/lib/utils';
  
  const { appId, appName, onClose } = $props<{ appId: string; appName: string; onClose: () => void; }>();
  const ctx = getPhoneContext();
  
  const GOAL = 280000;
  let currentDonation = $derived(nookState.appDonations[appId] || 0);
  let remaining = $derived(Math.max(0, GOAL - currentDonation));
  let bellsAvailable = $derived(nookState.bells);
  
  let donationAmount = $state(0);
  
  // Set default to whatever they can afford up to the remaining amount
  $effect(() => {
    donationAmount = Math.min(bellsAvailable, remaining);
  });
  
  function handleDonate() {
    if (donationAmount > 0 && donationAmount <= bellsAvailable && donationAmount <= remaining) {
      nookState.donateToApp(appId, donationAmount);
      // Play sound
      import('@/lib/audio').then(m => m.playSound('success'));
      
      if (nookState.isAppPermanent(appId)) {
        onClose();
      } else {
        // Update input field for next possible donation
        donationAmount = Math.min(nookState.bells, Math.max(0, GOAL - nookState.appDonations[appId]));
      }
    }
  }
  
  function handleGetMoreBells() {
    ctx.showPremiumUpsell = true;
  }
</script>

<div class="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" in:fade={{duration: 200}} out:fade={{duration: 200}}>
  <div class="bg-[#f0e8d1] border-4 border-[#c7b79a] w-full max-w-sm rounded-[2rem] shadow-2xl flex flex-col overflow-hidden" in:fly={{y: 20, duration: 300}}>
    <div class="bg-[#7db46c] text-[#fffdf5] py-3 px-4 flex justify-between items-center relative overflow-hidden shadow-inner">
      <div class="absolute inset-0 opacity-[0.1]" style="background-image: radial-gradient(#ffffff 2px, transparent 2px); background-size: 16px 16px;"></div>
      <h3 class="font-black text-[15px] relative z-10 flex items-center gap-2">
        <HandCoins class="w-5 h-5" /> 
        Project Funding
      </h3>
      <button onclick={onClose} class="w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center relative z-10 transition">
        <X class="w-4 h-4" />
      </button>
    </div>
    
    <div class="p-5 flex flex-col items-center gap-4">
      <!-- Gyroid & Speech Bubble -->
      <div class="flex gap-3 w-full">
        <img src={resolveAssetUrl(gyroidImg)} alt="Lloid" class="w-16 h-16 object-contain drop-shadow-md animate-bounce" style="animation-duration: 2s;" />
        <div class="flex-1 bg-white border-2 border-[#e0d6c0] rounded-2xl rounded-tl-none p-3 relative shadow-sm">
          <div class="absolute -left-[9px] top-0 w-4 h-4 bg-white border-l-2 border-t-2 border-[#e0d6c0] transform -skew-x-[30deg]"></div>
          <p class="text-[12px] font-bold text-[#5c5446] leading-snug m-0 relative z-10">
            Hullo! We're collecting donations to make <strong class="text-[#7db46c]">{appName}</strong> a permanent fixture on your NookPhone!
          </p>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="w-full bg-white border-2 border-[#e0d6c0] rounded-2xl p-3 shadow-inner mt-2">
        <div class="flex justify-between items-end mb-2">
          <span class="text-[10px] font-black uppercase text-[#a0947a]">Funding Goal</span>
          <span class="text-[14px] font-black text-[#5c5446]">{currentDonation.toLocaleString()} / {GOAL.toLocaleString()} <span class="text-[10px] text-[#a0947a]">Bells</span></span>
        </div>
        <div class="w-full h-4 bg-[#e0d6c0] rounded-full overflow-hidden shadow-inner">
          <div class="h-full bg-gradient-to-r from-[#ffd375] to-[#f59e33] transition-all duration-500 ease-out relative" style={`width: ${Math.min(100, (currentDonation / GOAL) * 100)}%`}>
            <div class="absolute inset-0 bg-white/20" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px);"></div>
          </div>
        </div>
        <div class="text-right text-[10px] font-bold text-[#a0947a] mt-1">
          {remaining.toLocaleString()} more needed!
        </div>
      </div>
      
      <!-- Donation Controls -->
      <div class="w-full mt-1">
        <div class="flex justify-between items-center mb-1 px-1">
          <span class="text-[11px] font-bold text-[#8c826b]">Your Bells:</span>
          <span class="text-[13px] font-black text-[#d4a017] flex items-center gap-1"><Coins class="w-3.5 h-3.5" /> {bellsAvailable.toLocaleString()}</span>
        </div>
        
        <div class="flex gap-2 mb-3">
          <input 
            type="number" 
            bind:value={donationAmount}
            min="0"
            max={Math.min(bellsAvailable, remaining)}
            class="flex-1 bg-white border-2 border-[#d4c3a3] rounded-xl px-3 py-2 text-center font-black text-[#5c5446] focus:border-[#7db46c] focus:outline-none"
          />
          <button 
            onclick={() => donationAmount = Math.min(bellsAvailable, remaining)}
            class="bg-[#d4c3a3] text-[#5c5446] px-3 py-2 rounded-xl font-bold text-[11px] hover:bg-[#c7b79a] active:scale-95 transition"
          >
            Max
          </button>
        </div>
        
        {#if bellsAvailable === 0 && remaining > 0}
          <div class="bg-[#ffd375]/30 border border-[#f59e33] rounded-xl p-2.5 mb-3 text-center">
            <p class="text-[11px] font-bold text-[#9a7520] m-0 mb-2">You're out of Bells!</p>
            <button 
              onclick={handleGetMoreBells}
              class="w-full bg-gradient-to-r from-[#61b948] to-[#4a9e35] text-white py-2 rounded-lg font-black text-[12px] shadow-sm hover:opacity-90 transition active:scale-95 flex items-center justify-center gap-1"
            >
              Get NookPhone+ <ChevronRight class="w-3 h-3" />
            </button>
          </div>
        {:else}
          <button 
            onclick={handleDonate}
            disabled={donationAmount <= 0}
            class="w-full bg-[#7db46c] hover:bg-[#689859] disabled:bg-[#a0947a] disabled:opacity-50 text-white font-black text-[16px] py-3.5 rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Coins class="w-5 h-5" /> Donate Bells
          </button>
        {/if}
        
        <button 
          onclick={onClose}
          class="w-full mt-2 py-2 text-[12px] font-bold text-[#8c826b] hover:text-[#5c5446] transition"
        >
          Not right now
        </button>
      </div>
    </div>
  </div>
</div>
