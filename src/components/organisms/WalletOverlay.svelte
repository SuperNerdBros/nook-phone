<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { Tween } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import nookState from '@/lib/nookState.svelte';
  import walletIcon from '@/assets/img/Wallet.png';
  import { resolveAssetUrl } from '@/lib/utils';
  
  let currentBells = $state(nookState.bells);
  let showOverlay = $state(false);
  let hideTimeout: ReturnType<typeof setTimeout>;
  let deduction = $state(0);
  
  let animatedBells = new Tween(nookState.bells, { duration: 1500, easing: cubicOut });
  
  $effect(() => {
    const actualBells = nookState.bells;
    if (actualBells < currentBells) {
      // Bells were deducted
      deduction = currentBells - actualBells;
      currentBells = actualBells;
      
      triggerOverlay();
    } else if (actualBells > currentBells) {
      // Bells added, sync silently without overlay since requirement is just for deduction
      currentBells = actualBells;
      animatedBells.target = actualBells;
    }
  });
  
  function triggerOverlay() {
    showOverlay = true;
    
    // Play sound
    import('@/lib/audio').then(m => m.playSound('tally'));
    
    // Animate to new balance
    animatedBells.target = currentBells;
    
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      showOverlay = false;
    }, 3500);
  }
  
  function handleClick() {
    showOverlay = false;
    nookState.navigate('abd');
  }
</script>

{#if showOverlay}
  <button 
    onclick={handleClick}
    in:fly={{y: -20, duration: 300}} 
    out:fade={{duration: 300}}
    class="absolute top-12 left-1/2 -translate-x-1/2 z-[999] bg-[#fbf9f0] border-[3px] border-[#dcd3be] rounded-3xl shadow-xl p-3 pr-5 flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
  >
    <div class="w-10 h-10 relative shrink-0">
      <img src={resolveAssetUrl(walletIcon)} alt="Wallet" class="w-full h-full object-contain drop-shadow-md" />
    </div>
    <div class="flex flex-col items-end leading-none">
      <span class="text-[18px] font-black text-[#5c3a21] tabular-nums tracking-tight">
        {Math.floor(animatedBells.current).toLocaleString()}
      </span>
      <span class="text-[12px] font-bold text-[#b54b4b] uppercase tracking-wider mt-0.5">
        -{deduction.toLocaleString()} Bells
      </span>
    </div>
  </button>
{/if}
