<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { fly, fade } from 'svelte/transition';
  import { User, MapPin, Globe } from '@lucide/svelte';

  let step = $state(0);
  let name = $state("");
  let islandName = $state("");
  let hemisphere = $state<"north" | "south">("north");

  const steps = [
    { text: "Ah, hello! Yes, yes! Welcome to your brand new NookPhone!" },
    { text: "Before you can start using all the wonderful apps we've prepared, I just need a teensy bit of information for our Nook Inc. registry." },
    { text: "First things first, what should we call you, hm?", input: 'name' },
    { text: "Splendid! And what is the name of your beautiful island?", input: 'island' },
    { text: "Excellent, excellent. Finally, which hemisphere is your island located in? This helps us calibrate the weather and critter apps!", input: 'hemisphere' },
    { text: "All set! Your NookPhone is now fully registered. I hope you enjoy your island life, yes, yes!" }
  ];

  function nextStep() {
    if (step < steps.length - 1) {
      if (steps[step].input === 'name' && !name.trim()) return;
      if (steps[step].input === 'island' && !islandName.trim()) return;
      step++;
    } else {
      nookState.completeOnboarding(name, islandName + " Island", hemisphere);
    }
  }
</script>

<div class="absolute inset-0 bg-[#fdfcf0] z-[100] flex flex-col justify-end p-5 pb-10 overflow-hidden">
  
  <!-- Nook Inc Logo / Background Pattern -->
  <div class="absolute inset-0 ac-bg-dots opacity-40 z-0 pointer-events-none"></div>
  
  <!-- Tom Nook Avatar -->
  <div class="absolute top-16 left-1/2 -translate-x-1/2 z-10 animate-ac-float">
    <div class="w-32 h-32 bg-[#e0dcc5] rounded-[2.5rem] border-4 border-[#dcd3be] shadow-xl flex items-center justify-center text-[4rem] relative rotate-3">
      🦝
      <!-- Decorative Leaf -->
      <div class="absolute -top-4 -right-2 text-3xl rotate-12 drop-shadow-md">🍃</div>
    </div>
  </div>

  <div class="relative z-20 flex flex-col gap-6">
    <!-- Active Input UI -->
    <div class="min-h-[100px] flex flex-col justify-end">
      {#if steps[step].input === 'name'}
        <div transition:fly={{ y: 20, duration: 400 }} class="flex flex-col gap-2 mx-auto w-full max-w-[240px]">
          <label for="nameInput" class="text-[#5c5446] font-black text-xs flex items-center justify-center gap-1.5 uppercase tracking-widest"><User class="w-3.5 h-3.5" /> Your Name</label>
          <input id="nameInput" type="text" bind:value={name} class="bg-white border-4 border-[#dcd3be] rounded-2xl px-4 py-3.5 font-black text-[#5c5446] focus:outline-none focus:border-[#22c55e] text-lg text-center shadow-sm" placeholder="Name..." />
        </div>
      {/if}

      {#if steps[step].input === 'island'}
        <div transition:fly={{ y: 20, duration: 400 }} class="flex flex-col gap-2 mx-auto w-full max-w-[260px]">
          <label for="islandInput" class="text-[#5c5446] font-black text-xs flex items-center justify-center gap-1.5 uppercase tracking-widest"><MapPin class="w-3.5 h-3.5" /> Island Name</label>
          <div class="flex items-center gap-2">
            <input id="islandInput" type="text" bind:value={islandName} class="flex-1 w-full bg-white border-4 border-[#dcd3be] rounded-2xl px-4 py-3.5 font-black text-[#5c5446] focus:outline-none focus:border-[#22c55e] text-lg text-center shadow-sm" placeholder="Island..." />
            <span class="font-black text-[#5c5446] text-lg">Island</span>
          </div>
        </div>
      {/if}

      {#if steps[step].input === 'hemisphere'}
        <div transition:fly={{ y: 20, duration: 400 }} class="flex flex-col gap-3 mx-auto w-full max-w-[280px]">
          <label class="text-[#5c5446] font-black text-xs flex items-center gap-1.5 justify-center uppercase tracking-widest"><Globe class="w-3.5 h-3.5" /> Hemisphere</label>
          <div class="grid grid-cols-2 gap-3">
            <button onclick={() => hemisphere = 'north'} class={`px-4 py-4 rounded-2xl font-black text-sm border-b-4 transition-all cursor-pointer shadow-sm ${hemisphere === 'north' ? 'bg-[#22c55e] text-white border-[#16a34a] -translate-y-1' : 'bg-white text-[#5c5446] border-[#dcd3be] hover:bg-gray-50'}`}>
              Northern
            </button>
            <button onclick={() => hemisphere = 'south'} class={`px-4 py-4 rounded-2xl font-black text-sm border-b-4 transition-all cursor-pointer shadow-sm ${hemisphere === 'south' ? 'bg-[#22c55e] text-white border-[#16a34a] -translate-y-1' : 'bg-white text-[#5c5446] border-[#dcd3be] hover:bg-gray-50'}`}>
              Southern
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Dialog Bubble -->
    <div class="relative min-h-[140px]">
      {#key step}
        <div in:fly={{ y: 10, duration: 300, delay: 100 }} out:fade={{ duration: 100 }} class="ac-bubble p-5 px-6 shadow-[0_8px_20px_rgba(0,0,0,0.06)] mb-2 absolute inset-0 flex flex-col justify-center">
          <div class="font-black text-[#22c55e] text-[11px] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
            Tom Nook
          </div>
          <p class="font-bold text-[#5c5446] text-[15px] leading-relaxed m-0">
            {steps[step].text}
          </p>
        </div>
      {/key}
    </div>

    <button 
      onclick={nextStep}
      disabled={(steps[step].input === 'name' && !name.trim()) || (steps[step].input === 'island' && !islandName.trim())}
      class="bg-[#f0b157] disabled:bg-gray-300 disabled:border-gray-400 disabled:text-gray-500 text-[#5c3a21] font-black py-4 px-6 rounded-full w-full max-w-[220px] mx-auto border-b-4 border-[#d99c45] hover:bg-[#f2bd70] active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-md text-lg flex items-center justify-center gap-2"
    >
      {step === steps.length - 1 ? 'Start Life!' : 'Next'}
    </button>
  </div>
</div>
