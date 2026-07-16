<script lang="ts">
  import { Settings, Clock, Battery, Accessibility, ChevronLeft } from "@lucide/svelte";
  import nookState from "@/lib/nookState.svelte";

  const toggle24Hour = () => nookState.updateSettings({ use24HourTime: !nookState.settings.use24HourTime });
  const toggleBattery = () => nookState.updateSettings({ showBatteryPercentage: !nookState.settings.showBatteryPercentage });
  const toggleMotion = () => nookState.updateSettings({ reduceMotion: !nookState.settings.reduceMotion });
</script>

<div class="h-full bg-[#f4f2e8] flex flex-col font-sans">
  <!-- Header -->
  <div class="bg-[#d5d0be] px-4 pt-8 pb-4 flex items-center justify-between shadow-sm z-10 shrink-0">
    <div class="flex items-center gap-2 text-[#5c5446]">
      <button onclick={() => nookState.navigate(null)} class="bg-transparent border-0 p-0 text-[#5c5446] hover:opacity-70 cursor-pointer">
        <ChevronLeft class="w-6 h-6" />
      </button>
      <h1 class="text-xl font-black m-0 flex items-center gap-2">
        <Settings class="w-5 h-5" /> Settings
      </h1>
    </div>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto ac-scrollbar p-4 flex flex-col gap-4 pb-20">
    <!-- General Settings -->
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#e4e0d1]">
      <h2 class="text-sm font-black text-[#8a816f] uppercase tracking-wider mb-4 border-b border-[#f0f0f0] pb-2">Device Preferences</h2>
      
      <div class="flex items-center justify-between py-3 border-b border-[#f0f0f0]">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Clock class="w-4 h-4" />
          </div>
          <div>
            <div class="font-bold text-[#5c5446] text-sm">24-Hour Time</div>
            <div class="text-[10px] text-gray-400">Use military time format</div>
          </div>
        </div>
        <button 
          onclick={toggle24Hour}
          class={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer border-0 ${nookState.settings.use24HourTime ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
          <div class={`w-4 h-4 rounded-full bg-white transition-transform ${nookState.settings.use24HourTime ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
      </div>

      <div class="flex items-center justify-between py-3 border-b border-[#f0f0f0]">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <Battery class="w-4 h-4" />
          </div>
          <div>
            <div class="font-bold text-[#5c5446] text-sm">Battery Percentage</div>
            <div class="text-[10px] text-gray-400">Show exact battery level</div>
          </div>
        </div>
        <button 
          onclick={toggleBattery}
          class={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer border-0 ${nookState.settings.showBatteryPercentage ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
          <div class={`w-4 h-4 rounded-full bg-white transition-transform ${nookState.settings.showBatteryPercentage ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
      </div>

      <div class="flex items-center justify-between py-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <Accessibility class="w-4 h-4" />
          </div>
          <div>
            <div class="font-bold text-[#5c5446] text-sm">Reduce Motion</div>
            <div class="text-[10px] text-gray-400">Disable heavy animations</div>
          </div>
        </div>
        <button 
          onclick={toggleMotion}
          class={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer border-0 ${nookState.settings.reduceMotion ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
          <div class={`w-4 h-4 rounded-full bg-white transition-transform ${nookState.settings.reduceMotion ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
      </div>
    </div>
    
    <div class="text-center mt-4 text-[#8a816f]/60 text-[10px] font-mono select-none">
      NookOS Version 2.0.1<br/>
      Developed by Nook Inc.
    </div>
  </div>
</div>
