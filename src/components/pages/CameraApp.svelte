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
    { id: "normal", name: "Normal", class: "", canvasFilter: "none" },
    { id: "monochrome", name: "Monochrome", class: "filter-monochrome", canvasFilter: "grayscale(100%) contrast(1.2)" },
    { id: "sepia", name: "Sepia", class: "filter-sepia", canvasFilter: "sepia(100%) hue-rotate(-15deg) contrast(0.95)" },
    { id: "warm", name: "Warm", class: "filter-warm", canvasFilter: "sepia(20%) saturate(140%) hue-rotate(-10deg)" },
    { id: "cool", name: "Cool", class: "filter-cool", canvasFilter: "saturate(110%) hue-rotate(15deg) brightness(1.05)" },
    { id: "dramatic", name: "Dramatic", class: "filter-dramatic", canvasFilter: "contrast(1.6) brightness(0.9) saturate(1.2)" }
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

  function drawMockScene(ctx2d: CanvasRenderingContext2D, width: number, height: number) {
    // 1. Sky Gradient
    const skyGrad = ctx2d.createLinearGradient(0, 0, 0, height * 0.7);
    skyGrad.addColorStop(0, "#1e1b4b");
    skyGrad.addColorStop(0.5, "#4c1d95");
    skyGrad.addColorStop(1, "#db2777");
    ctx2d.fillStyle = skyGrad;
    ctx2d.fillRect(0, 0, width, height);

    // 2. Glowing Sun
    ctx2d.beginPath();
    ctx2d.arc(width * 0.5, height * 0.5, 60, 0, Math.PI * 2);
    const sunGrad = ctx2d.createRadialGradient(width * 0.5, height * 0.5, 10, width * 0.5, height * 0.5, 60);
    sunGrad.addColorStop(0, "#fef08a");
    sunGrad.addColorStop(1, "#f97316");
    ctx2d.fillStyle = sunGrad;
    ctx2d.fill();

    // 3. Mountains (Back layer)
    ctx2d.fillStyle = "rgba(76, 29, 149, 0.5)";
    ctx2d.beginPath();
    ctx2d.moveTo(0, height * 0.8);
    ctx2d.lineTo(width * 0.3, height * 0.45);
    ctx2d.lineTo(width * 0.6, height * 0.8);
    ctx2d.fill();

    ctx2d.fillStyle = "rgba(109, 40, 217, 0.6)";
    ctx2d.beginPath();
    ctx2d.moveTo(width * 0.4, height * 0.8);
    ctx2d.lineTo(width * 0.75, height * 0.4);
    ctx2d.lineTo(width, height * 0.8);
    ctx2d.fill();

    // 4. Mountains (Front layer)
    ctx2d.fillStyle = "#1e293b";
    ctx2d.beginPath();
    ctx2d.moveTo(0, height * 0.8);
    ctx2d.lineTo(width * 0.15, height * 0.55);
    ctx2d.lineTo(width * 0.45, height * 0.8);
    ctx2d.moveTo(width * 0.35, height * 0.8);
    ctx2d.lineTo(width * 0.65, height * 0.5);
    ctx2d.lineTo(width * 0.95, height * 0.8);
    ctx2d.fill();

    // 5. Water / Sea
    const waterGrad = ctx2d.createLinearGradient(0, height * 0.8, 0, height);
    waterGrad.addColorStop(0, "#0e7490");
    waterGrad.addColorStop(1, "#1e1b4b");
    ctx2d.fillStyle = waterGrad;
    ctx2d.fillRect(0, height * 0.8, width, height * 0.2);

    // 6. Draw label
    ctx2d.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx2d.font = "bold 14px monospace";
    ctx2d.textAlign = "right";
    ctx2d.fillText("COMPASS OS", width - 20, height - 20);
  }

  function takeSnapshot() {
    flash = true;
    triggerBeep();
    setTimeout(() => flash = false, 200);

    let imgData = "";

    try {
      const canvas = document.createElement("canvas");
      const canvasWidth = videoElement?.videoWidth || 640;
      const canvasHeight = videoElement?.videoHeight || 480;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx2d = canvas.getContext("2d");
      
      if (ctx2d) {
        if (activeFilter.canvasFilter && activeFilter.canvasFilter !== "none") {
          ctx2d.filter = activeFilter.canvasFilter;
        }

        if (cameraStream && videoElement) {
          ctx2d.drawImage(videoElement, 0, 0, canvasWidth, canvasHeight);
        } else {
          drawMockScene(ctx2d, canvasWidth, canvasHeight);
        }

        imgData = canvas.toDataURL("image/jpeg");
      }
    } catch (e) {
      console.error("Canvas draw error", e);
      imgData = "https://picsum.photos/seed/" + Math.floor(Math.random() * 500) + "/400/300";
    }

    if (!imgData) {
      imgData = "https://picsum.photos/seed/" + Math.floor(Math.random() * 500) + "/400/300";
    }

    nookState.saveSnapshot(imgData);
    nookState.snapPhoto(); // Triggers Nook Miles achievement
  }

  function setAsPassportPhoto(photoUrl: string) {
    nookState.updatePassport({ photoUrl });
    ctx.navigate('passport');
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
        <h2 class="font-bold text-[#3e1b54] text-sm">Saved Snapshots ({nookState.cameraRoll.length})</h2>
        <button
          onclick={() => activeView = "camera"}
          class="text-xs bg-[#bda1d4]/20 text-[#3e1b54] px-3 py-1 rounded-full font-bold"
        >
          Take More Photos
        </button>
      </div>

      {#if nookState.cameraRoll.length > 0}
        <div class="grid grid-cols-2 gap-3">
          {#each nookState.cameraRoll as p, idx}
            <div
              class="bg-white p-2 rounded-2xl border border-[#e4dfd0] shadow-sm flex flex-col gap-1 group relative overflow-hidden"
            >
              <div class="aspect-video bg-gray-100 rounded-xl overflow-hidden relative">
                <img src={p} alt="Captured" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onclick={() => setAsPassportPhoto(p)}
                    class="bg-white text-[#3e1b54] text-[10px] font-bold px-2 py-1 rounded-full shadow-md hover:scale-105 transition-transform"
                  >
                    Set Passport
                  </button>
                </div>
              </div>
              <span class="text-[9px] text-gray-400 font-mono mt-1 text-center">
                Snapshot_{nookState.cameraRoll.length - idx}.jpg
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
