<script lang="ts">
  import { fade } from 'svelte/transition';
  import nookState from '@/lib/nookState.svelte';
</script>

{#if nookState.installingApp}
  <div
    transition:fade={{ duration: 200 }}
    class="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center"
  >
    <div class="relative flex flex-col items-center mb-8">
      <div class="w-10 h-10 bg-red-500 rounded-full shadow-md animate-balloon-float relative flex items-center justify-center">
        <div class="absolute bottom-[-10px] w-2 h-2 bg-red-600 rotate-45"></div>
        <div class="w-0.5 h-10 bg-gray-300 absolute top-9"></div>
      </div>
      
      <div class="w-14 h-14 bg-amber-50 border-4 border-amber-200 rounded-2xl shadow-lg flex items-center justify-center mt-10 animate-present-wobble relative z-10">
        <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 bg-red-500"></div>
        <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2.5 bg-red-500"></div>
        <div class="text-2xl z-10">🎁</div>
      </div>
      
      <div class="absolute -right-6 top-8 text-xl animate-spin-slow">✨</div>
      <div class="absolute -left-6 top-16 text-lg animate-pulse">🌟</div>
    </div>

    <div class="flex flex-col items-center gap-2 max-w-[220px]">
      <h2 class="text-sm font-black text-[#5d5a4a] uppercase tracking-widest m-0 animate-pulse">
        Installing App
      </h2>
      <p class="text-xs font-bold text-gray-500 m-0">
        Delivering <span class="text-emerald-600 font-extrabold">{nookState.installingApp}</span> to your phone...
      </p>
      
      <div class="w-full bg-gray-100 border border-gray-200 h-3 rounded-full mt-4 overflow-hidden relative shadow-inner">
        <div class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full animate-install-progress flex justify-end items-center pr-1">
          <span class="text-[8px] text-white">🍃</span>
        </div>
      </div>
    </div>
  </div>
{/if}
