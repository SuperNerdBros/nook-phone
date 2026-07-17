<script lang="ts">
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import { fade, fly } from 'svelte/transition';
  import { X, Lock, Cloud, MessageCircle, Star } from '@lucide/svelte';

  const ctx = getPhoneContext();

  const handleClose = () => {
    ctx.showPremiumUpsell = false;
  };

  const handleUnlock = () => {
    // Platform-agnostic / Patreon integration
    window.location.href = '/unlock-pro'; // Replace with actual Patreon/Checkout flow
  };
</script>

{#if ctx.showPremiumUpsell}
  <!-- Overlay -->
  <div 
    class="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    transition:fade={{ duration: 200 }}
  >
    <!-- Modal Container -->
    <div 
      class="bg-[#f9f8f2] w-full max-w-[320px] rounded-[32px] border-[6px] border-[#8bd168] shadow-xl overflow-hidden flex flex-col relative"
      transition:fly={{ y: 50, duration: 300, opacity: 0 }}
    >
      <!-- Close Button -->
      <button 
        onclick={handleClose}
        class="absolute top-3 right-3 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center border-0 cursor-pointer transition z-10 text-[#4c4637]"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Header Graphic -->
      <div class="bg-[#8bd168] p-6 pb-8 text-center relative overflow-hidden flex flex-col items-center justify-center text-white">
        <!-- Wavy decorative pattern -->
        <div class="absolute bottom-0 left-0 right-0 h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAwIDEyMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHBhdGggZD0iTTMyMS4zOSw1Ni40NEMyMjguNzEsODAuMTcsMTQ1LDg3LjY2LDYyLDY2LjQ1QzI1LDE2LDAsMCwwLDBMMTIsMTJoMTE4OFYwQzExODgsMCwxMTYwLDEyLDExNDgsMjRDMTg3LDI4LDk3Myw5Myw4MTIsMTEyQzYxMiwxMjMsNDU4LDc5LDMyMS4zOSw1Ni40NFoiIGZpbGw9IiNmOWY4ZjIiPjwvcGF0aD48L3N2Zz4=')] bg-cover bg-no-repeat rotate-180"></div>
        
        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 shadow-sm border-2 border-white/30 backdrop-blur-md">
          <Lock class="w-8 h-8 text-white drop-shadow-md" />
        </div>
        <h2 class="text-xl font-black m-0 drop-shadow-sm tracking-wide">Nook Inc. PRO</h2>
        <p class="text-xs font-bold opacity-90 mt-1 mb-0">Unlock the full island experience!</p>
      </div>

      <!-- Content -->
      <div class="p-5 flex flex-col gap-4 text-[#4c4637]">
        <p class="text-xs font-bold text-center mb-2 leading-relaxed text-gray-600">
          This app requires a <strong>Nook Inc. PRO</strong> account. Upgrade your residency to access advanced features!
        </p>

        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
              <Cloud class="w-4 h-4" />
            </div>
            <div class="flex-1">
              <span class="block text-xs font-black">Cross-Device Sync</span>
              <span class="block text-[10px] text-gray-500 font-bold leading-tight">Access your passport and apps on any device.</span>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <MessageCircle class="w-4 h-4" />
            </div>
            <div class="flex-1">
              <span class="block text-xs font-black">Resident Messaging</span>
              <span class="block text-[10px] text-gray-500 font-bold leading-tight">Send direct messages and chat with neighbors.</span>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
              <Star class="w-4 h-4" />
            </div>
            <div class="flex-1">
              <span class="block text-xs font-black">Premium Apps</span>
              <span class="block text-[10px] text-gray-500 font-bold leading-tight">Unlock exclusive tools and customizations.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-4 pt-2 pb-5 flex flex-col gap-2">
        <button 
          onclick={handleUnlock}
          class="w-full bg-[#8bd168] hover:bg-[#7bc059] text-white font-black text-xs py-3 rounded-2xl cursor-pointer transition active:scale-95 border-0 shadow-sm flex items-center justify-center gap-2"
        >
          <Lock class="w-4 h-4" />
          Unlock PRO via Patreon
        </button>
        <button 
          onclick={handleClose}
          class="w-full bg-transparent hover:bg-black/5 text-gray-500 font-bold text-xs py-2 rounded-2xl cursor-pointer transition active:scale-95 border-0"
        >
          Maybe Later
        </button>
      </div>
    </div>
  </div>
{/if}
