<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { ShieldAlert } from '@lucide/svelte';

  let stage = $state<"start" | "rant" | "countdown" | "success">("start");
  let countdown = $state(3);
  let interval: ReturnType<typeof setInterval>;

  const triggerRescue = () => {
    if (nookState.miles < 100) {
      alert("You need at least 100 Nook Miles to call the rescue service!");
      return;
    }
    stage = "rant";
  };

  const startResetFlow = () => {
    stage = "countdown";
    countdown = 3;

    interval = setInterval(() => {
      if (countdown <= 1) {
        clearInterval(interval);
        nookState.triggerRescueReset();
        stage = "success";
        countdown = 0;
      } else {
        countdown--;
      }
    }, 1000);
  };
</script>

<div id="rescue-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <div class="bg-[#ef4444] text-white p-4 pt-6 ac-wavy-header flex justify-between items-center z-10 shrink-0">
    <div>
      <h1 class="text-xl font-bold flex items-center gap-1.5">🚨 Rescue Service</h1>
      <p class="text-xs opacity-90">Instant island transport utilities</p>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto p-4 ac-scrollbar flex flex-col justify-center items-center text-center gap-4 relative">
    {#if stage === "start"}
      <div class="flex flex-col items-center gap-4 animate-fade-in">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center border-4 border-dashed border-red-500 text-red-500 animate-pulse">
          <ShieldAlert class="w-10 h-10" />
        </div>

        <div class="max-w-xs flex flex-col gap-1">
          <h2 class="font-extrabold text-lg text-gray-800">Stuck somewhere?</h2>
          <p class="text-xs text-gray-500 leading-relaxed">
            Call our automated chopper operator! We will immediately transport you back to Resident Services for a flat fee of **100 Nook Miles**.
          </p>
        </div>

        <button
          onclick={triggerRescue}
          class="bg-[#ef4444] hover:bg-red-600 active:scale-95 text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          ☎️ Call Emergency Helicopter
        </button>
      </div>
    {/if}

    {#if stage === "rant"}
      <div class="flex flex-col items-center gap-4 animate-fade-in max-w-xs">
        <!-- Mr Resetti avatar emoji -->
        <div class="w-16 h-16 bg-[#ca8a04]/20 border-2 border-yellow-600 rounded-full flex items-center justify-center text-3xl animate-bounce">
          ⛏️
        </div>

        <!-- Speech Bubble -->
        <div class="ac-bubble p-3 text-left shadow-md">
          <span class="text-[9px] font-bold text-amber-700 block">RESCUE OPERATOR RESETTI:</span>
          <p class="text-xs font-semibold text-gray-700 mt-1 leading-relaxed">
            HEY! WHAT DID YOU DO? STUCK IN A HOLE? CLIFFTOP LOCKED? SLACKING OFF AGAIN? FINE! I'LL BRING THE CHOPPER! BUT THAT'S 100 MILES OUT OF YOUR ACCOUNT, YES! NO REFUNDS! READY FOR LIFT OFF?!
          </p>
        </div>

        <div class="flex gap-2 w-full mt-2">
          <button
            onclick={() => stage = "start"}
            class="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-300"
          >
            No, cancel
          </button>
          <button
            onclick={startResetFlow}
            class="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-xs font-black hover:bg-red-600 shadow-sm"
          >
            HELI-LIFT ME! 🚁
          </button>
        </div>
      </div>
    {/if}

    {#if stage === "countdown"}
      <div class="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4 text-white z-50">
        <span class="text-red-500 text-[10px] tracking-widest font-extrabold uppercase">Rappelling...</span>
        <div class="text-6xl font-black animate-ping text-yellow-400">
          {countdown}
        </div>
        <p class="text-xs text-gray-400 font-bold max-w-[180px]">
          Engaging rotors. Flying you back safely...
        </p>
      </div>
    {/if}

    {#if stage === "success"}
      <div class="flex flex-col items-center gap-4 animate-fade-in">
        <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-2xl text-emerald-600">
          🚁
        </div>

        <div class="max-w-xs flex flex-col gap-1">
          <h2 class="font-extrabold text-[#1c4c1e] text-lg">Safe Landing!</h2>
          <p class="text-xs text-gray-500 leading-relaxed">
            Mr. Resetti deposited you right in front of Resident Services! 100 Nook Miles have been deducted from your phone wallet.
          </p>
        </div>

        <button
          onclick={() => stage = "start"}
          class="bg-[#8ec3b0] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-95"
        >
          Yahoo! Thanks Resetti
        </button>
      </div>
    {/if}
  </div>
</div>
