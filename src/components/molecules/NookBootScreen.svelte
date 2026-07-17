<script lang="ts">
  import { getPhoneContext } from '../organisms/phoneContext.svelte';
  import nookIncLogo from '../../../assets/img/Nook_Inc.svg';
  import { fade } from 'svelte/transition';

  const ctx = getPhoneContext();
</script>

{#if ctx.isBooting}
  <div 
    transition:fade={{ duration: 400 }}
    class="absolute inset-0 bg-[#3b592d] z-[200] flex flex-col justify-between p-8 text-white select-none"
  >
    <!-- Floating Background Leaves -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.15]">
      <span class="absolute text-2xl animate-drift-leaf-1" style="left: 10%; top: -10%;">🍃</span>
      <span class="absolute text-3xl animate-drift-leaf-2" style="left: 65%; top: -10%;">🍃</span>
      <span class="absolute text-xl animate-drift-leaf-3" style="left: 35%; top: -10%;">🍃</span>
      <span class="absolute text-2xl animate-drift-leaf-4" style="left: 80%; top: -10%;">🍃</span>
    </div>

    <!-- Top Spacer -->
    <div class="z-10"></div>

    <!-- Center Content: Logo & Glow -->
    <div class="flex flex-col items-center gap-6 z-10">
      <div class="relative flex items-center justify-center">
        <!-- Glow Effect behind leaf -->
        <div class="absolute w-24 h-24 bg-[#afd485]/40 rounded-full blur-2xl animate-pulse"></div>
        
        <!-- Nook Inc Logo -->
        <img 
          src={nookIncLogo} 
          alt="Nook Inc Logo" 
          class="w-20 h-20 drop-shadow-[0_4px_12px_rgba(175,212,133,0.4)] animate-boot-bounce" 
        />
      </div>
      
      <div class="flex flex-col items-center gap-2">
        <h1 class="text-xl font-bold tracking-widest text-[#fdfcf0] m-0 font-sans uppercase animate-boot-text">
          NookPhone.app
        </h1>
        <p class="text-[9px] text-[#afd485] font-black tracking-widest uppercase m-0 opacity-80 animate-pulse">
          Powered by YouMeOS
        </p>
      </div>
    </div>

    <!-- Bottom Loading Status & Bar -->
    <div class="flex flex-col items-center gap-4 w-full max-w-[200px] mx-auto mb-10 z-10">
      <div class="w-full bg-[#273a1e] h-1.5 rounded-full overflow-hidden relative shadow-inner">
        <div class="bg-gradient-to-r from-[#afd485] to-[#8cc3b0] h-full rounded-full animate-boot-progress relative">
          <span class="absolute -right-2 -top-1 text-[10px] animate-spin-slow">🍃</span>
        </div>
      </div>
      <span class="text-[8px] font-black uppercase tracking-widest text-[#afd485] animate-pulse">
        System Initialization...
      </span>
    </div>
  </div>
{/if}
