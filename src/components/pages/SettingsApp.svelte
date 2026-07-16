<script lang="ts">
  import { Settings, Clock, Battery, Accessibility, ChevronLeft, Image as ImageIcon, PaintBucket } from "@lucide/svelte";
  import nookState from "@/lib/nookState.svelte";

  const toggle24Hour = () => nookState.updateSettings({ use24HourTime: !nookState.settings.use24HourTime });
  const toggleBattery = () => nookState.updateSettings({ showBatteryPercentage: !nookState.settings.showBatteryPercentage });
  const toggleMotion = () => nookState.updateSettings({ reduceMotion: !nookState.settings.reduceMotion });

  const setWallpaper = (id: string) => {
    nookState.activeWallpaperId = id;
    nookState.save();
  };

  const wallpapers = [
    { id: 'nook-inc', name: 'Nook Inc.', bg: 'bg-[#e0dcc5]', pattern: 'bg-[#5c8e43]' },
    { id: 'nook-dark', name: 'Midnight', bg: 'bg-[#2c2a24]', pattern: 'bg-[#4b7a34]' },
    { id: 'cherry-blossom', name: 'Sakura', bg: 'bg-[#f5d5d8]', pattern: 'bg-[#e28a9b]' },
    { id: 'ocean-wave', name: 'Ocean', bg: 'bg-[#b3d4d6]', pattern: 'bg-[#63a1a6]' },
    { id: 'starry-night', name: 'Starry', bg: 'bg-[#2a3b5c]', pattern: 'bg-[#eccf73]' },
  ];
</script>

<div class="h-full bg-[#fcfcf9] flex flex-col font-sans ac-bg-dots">
  <!-- Wavy Header -->
  <div class="bg-[#7c8088] text-white p-4 pt-6 ac-wavy-header flex flex-col gap-2 relative z-10 shadow-sm border-b-4 border-[#656972] shrink-0">
    <div class="flex items-center gap-3">
      <button onclick={() => nookState.navigate(null)} class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border-0 text-white hover:bg-white/30 cursor-pointer transition-colors shadow-inner">
        <ChevronLeft class="w-5 h-5 pr-0.5" />
      </button>
      <h1 class="text-xl font-black m-0 flex items-center gap-2 drop-shadow-sm tracking-tight">
        <Settings class="w-6 h-6" /> Settings
      </h1>
    </div>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto ac-scrollbar p-4 flex flex-col gap-5 pb-24">
    
    <!-- Customization Settings -->
    <div class="bg-white rounded-3xl p-4 border-4 border-[#e1d9be] shadow-[0_4px_0_#dcd3be]">
      <h2 class="text-[11px] font-black text-[#7c8088] uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b-2 border-dashed border-[#e1d9be] pb-2">
        <ImageIcon class="w-4 h-4" /> Phone Customization
      </h2>
      
      <div class="flex flex-col gap-3">
        <span class="text-xs font-bold text-[#5c5446]">Wallpaper</span>
        <div class="grid grid-cols-4 gap-2">
          {#each wallpapers as wp}
            <button 
              onclick={() => setWallpaper(wp.id)}
              class={`flex flex-col items-center gap-1.5 bg-transparent border-0 p-0 cursor-pointer group ${nookState.activeWallpaperId === wp.id || (!nookState.activeWallpaperId && wp.id === 'nook-inc') ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
            >
              <div class={`w-12 h-16 rounded-xl border-4 shadow-sm relative overflow-hidden transition-transform group-hover:scale-105 group-active:scale-95 ${nookState.activeWallpaperId === wp.id || (!nookState.activeWallpaperId && wp.id === 'nook-inc') ? 'border-[#7c8088]' : 'border-[#e1d9be]'}`}>
                <div class={`absolute inset-0 ${wp.bg}`}></div>
                <div class={`absolute inset-0 opacity-40 ${wp.pattern}`} style="mask-image: url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 5l5 10h10l-8 7 3 10-10-6-10 6 3-10-8-7h10z%22/%3E%3C/svg%3E'); -webkit-mask-image: url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 5l5 10h10l-8 7 3 10-10-6-10 6 3-10-8-7h10z%22/%3E%3C/svg%3E'); mask-size: 20px 20px; -webkit-mask-size: 20px 20px;"></div>
                
                {#if nookState.activeWallpaperId === wp.id || (!nookState.activeWallpaperId && wp.id === 'nook-inc')}
                  <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-[#6cd476] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                {/if}
              </div>
              <span class="text-[9px] font-black text-[#5c5446]">{wp.name}</span>
            </button>
          {/each}
          
          <button 
            onclick={() => nookState.navigate('designs')}
            class="flex flex-col items-center gap-1.5 bg-transparent border-0 p-0 cursor-pointer group opacity-60 hover:opacity-100"
          >
            <div class="w-12 h-16 rounded-xl border-4 border-dashed border-[#e1d9be] shadow-sm flex items-center justify-center bg-[#fdfcf9] transition-transform group-hover:scale-105 group-active:scale-95 text-[#e1d9be]">
              <PaintBucket class="w-5 h-5" />
            </div>
            <span class="text-[9px] font-black text-[#5c5446]">Custom</span>
          </button>
        </div>
      </div>
    </div>

    <!-- General Settings -->
    <div class="bg-white rounded-3xl p-4 border-4 border-[#e1d9be] shadow-[0_4px_0_#dcd3be] flex flex-col gap-1">
      <h2 class="text-[11px] font-black text-[#7c8088] uppercase tracking-widest mb-2 flex items-center gap-1.5 border-b-2 border-dashed border-[#e1d9be] pb-2">
        <Settings class="w-4 h-4" /> Device Preferences
      </h2>
      
      <div class="flex items-center justify-between py-2 border-b-2 border-dashed border-[#f4f2e8]">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-500 shadow-inner">
            <Clock class="w-4 h-4" />
          </div>
          <div>
            <div class="font-black text-[#5c5446] text-xs">24-Hour Time</div>
            <div class="text-[9px] font-bold text-[#8a816f]">Military time format</div>
          </div>
        </div>
        <button 
          aria-label="Toggle 24-hour time"
          onclick={toggle24Hour}
          class={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer border-2 shadow-inner flex items-center ${nookState.settings.use24HourTime ? 'bg-[#6cd476] border-[#4ca454]' : 'bg-[#e1d9be] border-[#dcd3be]'}`}
        >
          <div class={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${nookState.settings.use24HourTime ? 'translate-x-4' : 'translate-x-0'}`}></div>
        </button>
      </div>

      <div class="flex items-center justify-between py-2 border-b-2 border-dashed border-[#f4f2e8]">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-green-50 border-2 border-green-200 flex items-center justify-center text-green-500 shadow-inner">
            <Battery class="w-4 h-4" />
          </div>
          <div>
            <div class="font-black text-[#5c5446] text-xs">Battery Status</div>
            <div class="text-[9px] font-bold text-[#8a816f]">Show exact percentage</div>
          </div>
        </div>
        <button 
          aria-label="Toggle battery percentage"
          onclick={toggleBattery}
          class={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer border-2 shadow-inner flex items-center ${nookState.settings.showBatteryPercentage ? 'bg-[#6cd476] border-[#4ca454]' : 'bg-[#e1d9be] border-[#dcd3be]'}`}
        >
          <div class={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${nookState.settings.showBatteryPercentage ? 'translate-x-4' : 'translate-x-0'}`}></div>
        </button>
      </div>

      <div class="flex items-center justify-between py-2">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-purple-500 shadow-inner">
            <Accessibility class="w-4 h-4" />
          </div>
          <div>
            <div class="font-black text-[#5c5446] text-xs">Reduce Motion</div>
            <div class="text-[9px] font-bold text-[#8a816f]">Disable animations</div>
          </div>
        </div>
        <button 
          aria-label="Toggle reduce motion"
          onclick={toggleMotion}
          class={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer border-2 shadow-inner flex items-center ${nookState.settings.reduceMotion ? 'bg-[#6cd476] border-[#4ca454]' : 'bg-[#e1d9be] border-[#dcd3be]'}`}
        >
          <div class={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${nookState.settings.reduceMotion ? 'translate-x-4' : 'translate-x-0'}`}></div>
        </button>
      </div>
    </div>
    
    <div class="text-center mt-2 flex flex-col items-center justify-center gap-1 opacity-60">
      <div class="w-8 h-8 rounded-full bg-[#dcd3be] text-white flex items-center justify-center shadow-inner">
        <Settings class="w-4 h-4" />
      </div>
      <div class="text-[#8a816f] text-[9px] font-black uppercase tracking-widest mt-1">
        NookOS Version 2.1.0
      </div>
      <div class="text-[#8a816f] text-[8px] font-bold">
        © Nook Inc.
      </div>
    </div>
  </div>
</div>
