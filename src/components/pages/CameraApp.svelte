<script lang="ts">
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import { onMount, onDestroy } from 'svelte';
  import nookState from '@/lib/nookState.svelte';
  import { Camera, Image as ImageIcon , X } from '@lucide/svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';

  const ctx = getPhoneContext();
  const FILTERS = [
    { id: "normal", name: "Normal", class: "" },
    { id: "monochrome", name: "Monochrome", class: "filter-monochrome" },
    { id: "sepia", name: "Sepia", class: "filter-sepia" },
    { id: "warm", name: "Warm", class: "filter-warm" },
    { id: "cool", name: "Cool", class: "filter-cool" },
    { id: "dramatic", name: "Dramatic", class: "filter-dramatic" }
  ];

  const BORDERS = [
    { id: "none", name: "None", style: "" },
    { id: "polaroid", name: "Polaroid", style: "border-bottom-width: 24px; border-top-width: 8px; border-left-width: 8px; border-right-width: 8px; border-color: #ffffff; border-radius: 4px;" },
    { id: "wood", name: "Wood Frame", style: "border: 12px solid #a16207; border-radius: 12px;" },
    { id: "film", name: "Film Strip", style: "border-top: 16px dashed #1e293b; border-bottom: 16px dashed #1e293b; border-left: 4px solid #1e293b; border-right: 4px solid #1e293b;" }
  ];

  let activeFilter = $state(FILTERS[0]);
  let activeBorder = $state(BORDERS[0]);
  let cameraStream: MediaStream | null = $state(null);
  let permissionError = $state(false);
  let flash = $state(false);
  let photos: string[] = $state([]);
  let activeView: "camera" | "roll" = $state("camera");

  let videoElement: HTMLVideoElement | undefined = $state();

  let activeStream: MediaStream | null = null;

  function stopCamera() {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      activeStream = null;
    }
  }

  $effect(() => {
    if (activeView === "camera") {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
          .then((stream) => {
            cameraStream = stream;
            activeStream = stream;
            if (videoElement) {
              videoElement.srcObject = stream;
            }
          })
          .catch((err) => {
            console.warn("Camera permissions denied or not supported:", err);
            permissionError = true;
          });
      } else {
        console.warn("navigator.mediaDevices or getUserMedia is not supported in this environment");
        permissionError = true;
      }
    } else {
      stopCamera();
    }
  });

  onDestroy(() => {
    stopCamera();
  });

  function triggerBeep() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Ignored if browser blocking
    }
  }

  function takeSnapshot() {
    flash = true;
    triggerBeep();
    setTimeout(() => flash = false, 200);

    // Save mock image / capture canvas frame
    let imgData = "https://picsum.photos/seed/" + Math.floor(Math.random() * 500) + "/400/300";

    if (cameraStream && videoElement) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Draw video image
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          imgData = canvas.toDataURL("image/jpeg");
        }
      } catch (e) {
        console.error("Canvas draw error", e);
      }
    }

    photos = [imgData, ...photos];
    nookState.snapPhoto(); // Triggers Nook Miles achievement
  }
</script>

<div id="camera-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <NookAppHeader 
    title="Nook Camera Pro"
    subtitle="First-person viewpoints, filters, and borders"
    bgClass="bg-[#bda1d4]"
    textClass="text-[#3e1b54]"
  >
    {#snippet iconSnippet()}
      <div class="w-12 h-12 mr-1">
        <NookIcon name="camera" class="w-full h-full drop-shadow-sm" />
      </div>
    {/snippet}
    {#snippet actions()}
      <NookToolbarButton
        onclick={() => activeView = activeView === "camera" ? "roll" : "camera"}
        title={activeView === "camera" ? "View Camera Roll" : "Back to Camera"}
        class="mr-1"
      >
        <ImageIcon class="w-3.5 h-3.5 stroke-[2.5px]" />
      </NookToolbarButton>
      <NookToolbarButton onclick={ctx.handleHomeButton} title="Close App">
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>

  {#if activeView === "camera"}
    <div class="flex-1 flex flex-col justify-between p-4 relative">
      <!-- Viewfinder Frame -->
      <div class="relative flex-1 bg-black rounded-3xl overflow-hidden flex items-center justify-center border-4 border-[#e9e3cf] shadow-inner">
        <!-- Real Video or Placeholder -->
        {#if !permissionError}
          <video
            bind:this={videoElement}
            autoplay
            playsinline
            class="w-full h-full object-cover transition-all {activeFilter.class}"
            style={activeBorder.style}
          ></video>
        {:else}
          <div
            class="w-full h-full bg-[#3e1b54]/40 flex flex-col items-center justify-center relative transition-all {activeFilter.class}"
            style="background-image: url('https://picsum.photos/seed/islandscene/640/480'); background-size: cover; background-position: center; {activeBorder.style}"
          >
            <!-- Simulated visual grid -->
            <div class="absolute inset-0 bg-black/10 flex flex-col justify-between p-3 pointer-events-none text-white text-[10px] font-mono">
              <div class="flex justify-between">
                <span>🔴 REC</span>
                <span>ISO 200</span>
              </div>
              <div class="flex justify-between">
                <span>F3.5</span>
                <span>NookOS Pro 2.0</span>
              </div>
            </div>
          </div>
        {/if}

        <!-- Flash Effect overlay -->
        {#if flash}
          <div class="absolute inset-0 bg-white z-50 animate-flash"></div>
        {/if}

        <!-- Grid display Overlay -->
        <div class="absolute inset-0 border border-white/20 grid grid-cols-3 grid-rows-3 pointer-events-none">
          <div class="border-r border-b border-white/10"></div>
          <div class="border-r border-b border-white/10"></div>
          <div class="border-b border-white/10"></div>
          <div class="border-r border-b border-white/10"></div>
          <div class="border-r border-b border-white/10"></div>
          <div class="border-b border-white/10"></div>
        </div>
      </div>

      <!-- Controls Panel -->
      <div class="flex flex-col gap-3 mt-3 bg-[#f0ece0] rounded-2xl p-3 border border-[#e4dfd0]">
        <!-- Border Selector -->
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-gray-500 uppercase">Frame Styles</span>
          <div class="flex gap-1 overflow-x-auto pb-1 ac-scrollbar">
            {#each BORDERS as b}
              <button
                onclick={() => activeBorder = b}
                class="px-3 py-1 text-xs font-semibold rounded-full shrink-0 transition-all {
                  activeBorder.id === b.id
                    ? 'bg-[#bda1d4] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }"
              >
                {b.name}
              </button>
            {/each}
          </div>
        </div>

        <!-- Filter Selector -->
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-gray-500 uppercase">Camera Filters</span>
          <div class="flex gap-1 overflow-x-auto pb-1 ac-scrollbar">
            {#each FILTERS as f}
              <button
                onclick={() => activeFilter = f}
                class="px-3 py-1 text-xs font-semibold rounded-full shrink-0 transition-all {
                  activeFilter.id === f.id
                    ? 'bg-[#bda1d4] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }"
              >
                {f.name}
              </button>
            {/each}
          </div>
        </div>

        <!-- Capture Button -->
        <div class="flex justify-center items-center py-1 mt-1">
          <button
            onclick={takeSnapshot}
            class="w-16 h-16 rounded-full bg-white border-8 border-[#bda1d4] active:scale-95 transition-all shadow-md flex items-center justify-center text-[#3e1b54]"
            title="Shutter Button"
          >
            <Camera class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  {:else}
    <!-- Camera Roll Roll -->
    <div class="flex-1 overflow-y-auto p-4 ac-scrollbar flex flex-col gap-3">
      <div class="flex justify-between items-center border-b border-[#e4dfd0] pb-2">
        <h2 class="font-bold text-[#3e1b54] text-sm">Saved Snapshots ({photos.length})</h2>
        <button
          onclick={() => activeView = "camera"}
          class="text-xs bg-[#bda1d4]/20 text-[#3e1b54] px-3 py-1 rounded-full font-bold"
        >
          Take More Photos
        </button>
      </div>

      {#if photos.length > 0}
        <div class="grid grid-cols-2 gap-3">
          {#each photos as p, idx}
            <div
              class="bg-white p-2 rounded-2xl border border-[#e4dfd0] shadow-sm flex flex-col gap-1 group relative overflow-hidden"
            >
              <div class="aspect-video bg-gray-100 rounded-xl overflow-hidden relative">
                <img src={p} alt="Captured" class="w-full h-full object-cover" />
              </div>
              <span class="text-[9px] text-gray-400 font-mono mt-1 text-center">
                Snapshot_{photos.length - idx}.jpg
              </span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-16 text-gray-400 text-sm">
          <Camera class="w-12 h-12 mx-auto opacity-30 mb-2" />
          Your camera roll is currently empty. Start snapping photos to fill it up!
        </div>
      {/if}
    </div>
  {/if}
</div>
