<script lang="ts">
  import { fade } from 'svelte/transition';
  import nookState from '@/lib/nookState.svelte';
  import AcnhBubble from '../molecules/AcnhBubble.svelte';
  import { resolveAssetUrl } from '@/lib/utils';

  let dialogStep = $state(0);
  let showDialog = $state(false);

  export const triggerRewardFlow = () => {
    showDialog = true;
    dialogStep = 0;
  };

  const nextStep = () => {
    if (dialogStep === 0) {
      dialogStep = 1;
    } else if (dialogStep === 1) {
      // Finish flow
      showDialog = false;
      nookState.depositAllowance();
      nookState.navigate('abd');
    }
  };
</script>

{#if showDialog}
  <div class="absolute inset-0 z-[100] bg-black/25 backdrop-blur-sm flex flex-col overflow-hidden animate-fade-in" in:fade={{duration: 250}} out:fade={{duration: 200}}>
    <!-- Character (Centered) -->
    <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none pb-32">
      <div class="h-64 flex flex-col items-center justify-center relative animate-ac-float">
        <img 
          src={resolveAssetUrl('/nook-face.svg')} 
          alt="Tom Nook" 
          class="h-[80%] object-contain drop-shadow-2xl transition-transform duration-300"
        />
      </div>
    </div>

    <!-- Bubble (Bottom Half) -->
    <div class="relative z-20 w-full px-4 pb-8 shrink-0 mt-auto cursor-pointer" onclick={nextStep} onkeydown={(e) => e.key === 'Enter' && nextStep()} tabindex="0" role="button">
      <AcnhBubble
        title="Tom Nook"
        badgeBg="#22c55e"
        badgeColor="#ffffff"
        dialogText={dialogStep === 0 ? "Ah, yes, yes! You've linked your Patreon! I've deposited your monthly 500,000 Bells allowance into your ABD account." : "I've also applied your cellular service fee of 50,000 Bells. Enjoy your new NookPhone, and let me know if you need anything!"}
        isActive={true}
        class="w-full max-w-lg mx-auto"
      >
        <div class="mt-4 border-t border-[#e1d9be]/60 pt-2 flex flex-col gap-3 animate-fade-in" style="animation-delay: 300ms;">
          <div class="text-right text-[#cdae68] text-2xl animate-bounce leading-none">▼</div>
        </div>
      </AcnhBubble>
    </div>
  </div>
{/if}
