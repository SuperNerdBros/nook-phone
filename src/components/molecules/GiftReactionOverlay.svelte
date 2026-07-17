<script lang="ts">
  import AcnhBubble from './AcnhBubble.svelte';

  let {
    villager,
    reaction,
    onClose
  }: {
    villager: any;
    reaction: { rating: number; message: string };
    onClose: () => void;
  } = $props();
</script>

<!-- Dialog reaction overlay -->
<div class="absolute inset-0 z-[60] bg-[#fdfcf0] flex flex-col justify-end p-5 pb-10 overflow-hidden animate-fade-in">
  <!-- Dots Pattern -->
  <div class="absolute inset-0 ac-bg-dots opacity-40 z-0 pointer-events-none"></div>

  <!-- Full Body Villager Image -->
  <div class="absolute top-16 left-1/2 -translate-x-1/2 z-10 animate-ac-float">
    <div class="h-64 flex items-end justify-center relative">
      {#if villager?.image_url}
        <img src={villager.image_url} alt={villager.name} class="h-full object-contain drop-shadow-xl" />
      {:else}
        <div class="text-7xl">🐾</div>
      {/if}
    </div>
  </div>

  <!-- Dialog Bubble Container -->
  <div class="relative z-20 w-full max-w-lg mx-auto flex flex-col gap-6">
    <AcnhBubble
      title={villager?.name || "Friend"}
      dialogText={reaction.message}
      isActive={true}
      class="w-full"
    >
      <!-- Rating and Action -->
      <div class="mt-4 border-t border-[#e1d9be]/60 pt-3 flex flex-col items-center gap-3 animate-fade-in" style="animation-delay: 500ms;">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black text-[#8a7f66] uppercase tracking-wider">Love Rating</span>
          <div class="flex gap-0.5">
            {#each Array(5) as _, i}
              <svg 
                class="w-5 h-5 transition-all {i < reaction.rating ? 'text-[#ff6b6b] fill-current animate-bounce-short' : 'text-gray-300'}" 
                style="animation-delay: {i * 100}ms;"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            {/each}
          </div>
        </div>

        <button 
          onclick={onClose}
          class="bg-[#f0b157] text-[#5c3a21] font-black py-2.5 px-6 rounded-full border-b-4 border-[#d99c45] hover:bg-[#f2bd70] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md text-sm"
        >
          You're Welcome!
        </button>
      </div>
    </AcnhBubble>
  </div>
</div>
