<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { Coins, Sparkles } from '@lucide/svelte';
  import nookState from '@/lib/nookState.svelte';
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import AcnhBubble from '../molecules/AcnhBubble.svelte';
  import { resolveAssetUrl } from '@/lib/utils';
  
  const { onClose } = $props<{ onClose: () => void; }>();
  const ctx = getPhoneContext();
  
  let bellsAvailable = $derived(nookState.bells);
  let servicePlanRemaining = $derived(nookState.servicePlanBalance);
  
  type DialogState = 'intro' | 'payment_input' | 'payment_success';
  let currentState = $state<DialogState>('intro');
  let paymentAmount = $state(0);
  let dialogText = $state('');
  let isNookDancing = $state(false);
  
  // Set default payment amount to max possible (all of the loan, or all pocket bells)
  $effect(() => {
    paymentAmount = Math.min(bellsAvailable, servicePlanRemaining);
  });
  
  // Update Tom Nook's dialogue based on state
  $effect(() => {
    if (currentState === 'intro') {
      if (servicePlanRemaining <= 0) {
        dialogText = "Yes, yes! You don't have any outstanding Service Plan balance on your account right now. Keep up the good work!";
      } else {
        dialogText = `Ah, yes, yes! Your outstanding NookPhone+ Service Plan balance is currently ${servicePlanRemaining.toLocaleString()} Bells. Would you like to make a payment today?`;
      }
      isNookDancing = false;
    } else if (currentState === 'payment_input') {
      if (bellsAvailable <= 0) {
        dialogText = "Oh, dear... It looks like you don't have any Bells in your account to make a payment right now.";
      } else {
        dialogText = `Excellent! Your savings balance has ${bellsAvailable.toLocaleString()} Bells available. How much would you like to pay towards your Service Plan?`;
      }
      isNookDancing = false;
    } else if (currentState === 'payment_success') {
      if (servicePlanRemaining <= 0) {
        dialogText = "Huzzah! You have paid off your Service Plan in full, yes, yes! Thank you for being such a responsible customer!";
      } else {
        dialogText = `Splendid! Thank you for your payment. Your new remaining Service Plan balance is ${servicePlanRemaining.toLocaleString()} Bells, yes, yes!`;
      }
      isNookDancing = true;
    }
  });

  function handlePay() {
    if (paymentAmount > 0 && paymentAmount <= bellsAvailable) {
      nookState.payServicePlan(paymentAmount);
      
      // Play sound
      import('@/lib/audio').then(m => m.playSound('success'));
      currentState = 'payment_success';
    }
  }
</script>

<div class="absolute inset-0 z-[100] bg-black/25 backdrop-blur-sm flex flex-col overflow-hidden animate-fade-in" in:fade={{duration: 250}} out:fade={{duration: 200}}>

  <!-- Character (Centered) -->
  <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none pb-32">
    <div class="h-64 flex flex-col items-center justify-center relative animate-ac-float">
      {#if currentState === 'payment_success' && servicePlanRemaining <= 0}
        <div class="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
          <div class="animate-ping absolute w-48 h-48 bg-yellow-300/30 rounded-full"></div>
          <Sparkles class="w-24 h-24 text-yellow-400 animate-spin" />
        </div>
      {/if}
      <img 
        src={resolveAssetUrl('/nook-face.svg')} 
        alt="Tom Nook" 
        class="h-full object-contain drop-shadow-2xl transition-transform duration-300"
        class:animate-bounce={isNookDancing}
      />
    </div>
  </div>

  <!-- Bubble (Bottom Half) -->
  <div class="relative z-20 w-full px-4 pb-8 shrink-0 mt-auto">
    <AcnhBubble
      title="Tom Nook"
      badgeBg="#4a3b32"
      badgeColor="#ffffff"
      dialogText={dialogText}
      isActive={true}
      class="w-full max-w-lg mx-auto"
    >
      <div class="mt-4 border-t border-[#e1d9be]/60 pt-4 flex flex-col gap-3 animate-fade-in" style="animation-delay: 300ms;">
        {#if currentState === 'intro'}
          {#if servicePlanRemaining > 0}
            <button onclick={() => currentState = 'payment_input'} class="bg-[#1ca349] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#188a3e] active:scale-95 transition-transform w-full text-center cursor-pointer">
              I want to pay!
            </button>
            <button onclick={onClose} class="w-full bg-white border-2 border-[#e1d9be] text-[#8a7f66] px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-transform text-center cursor-pointer">
              Not right now, thanks
            </button>
          {:else}
            <button onclick={onClose} class="bg-[#1ca349] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#188a3e] active:scale-95 transition-transform w-full text-center cursor-pointer">
              Close
            </button>
          {/if}
        {:else if currentState === 'payment_input'}
          {#if bellsAvailable <= 0}
            <button onclick={onClose} class="bg-[#1ca349] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#188a3e] active:scale-95 transition-transform w-full text-center cursor-pointer">
              Close
            </button>
          {:else}
            <div class="flex gap-2">
              <div class="flex-1 relative flex items-center">
                <Coins class="w-4 h-4 absolute left-3 text-[#d4a017]" />
                <input 
                  type="number" 
                  bind:value={paymentAmount}
                  min="1"
                  max={Math.min(bellsAvailable, servicePlanRemaining)}
                  class="w-full bg-white pl-9 pr-16 py-2.5 rounded-xl text-lg font-black border-2 border-[#e1d9be] focus:outline-none focus:border-[#1ca349] text-[#5c3a21] placeholder:text-[#8a7f66]/60"
                />
                <button 
                  onclick={() => paymentAmount = Math.min(bellsAvailable, servicePlanRemaining)}
                  class="absolute right-2 top-1/2 -translate-y-1/2 bg-[#ffdf28]/20 text-[#c2a613] border-2 border-[#ffdf28]/40 px-2 py-0.5 rounded-lg font-bold text-[10px] hover:bg-[#ffdf28]/30 active:scale-95 transition-transform cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button onclick={handlePay} disabled={paymentAmount <= 0} class="flex-[2] bg-[#1ca349] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#188a3e] active:scale-95 transition-transform text-center cursor-pointer">
                Confirm Payment
              </button>
              <button onclick={() => currentState = 'intro'} class="flex-1 bg-white border-2 border-[#e1d9be] text-[#8a7f66] px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-transform text-center cursor-pointer">
                Cancel
              </button>
            </div>
          {/if}
        {:else if currentState === 'payment_success'}
          <button onclick={onClose} class="bg-[#1ca349] text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-[#188a3e] active:scale-95 transition-transform w-full text-center cursor-pointer">
            Sign Off
          </button>
        {/if}
      </div>
    </AcnhBubble>
  </div>
</div>
