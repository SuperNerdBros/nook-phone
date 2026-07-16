<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
</script>

<div id="designer-app" class="flex flex-col h-full ac-app-screen relative bg-white">
  <!-- Header -->
  <div class="bg-[#cca054] text-[#543b09] p-3 pt-5 ac-wavy-header flex justify-between items-center z-10 shrink-0 shadow-sm">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg shadow-inner">
        🪘
      </div>
      <div>
        <h1 class="text-sm font-bold flex items-center gap-1 m-0 truncate">Island Designer</h1>
        <p class="text-[9px] opacity-90 m-0">Powered by Happy Island Designer</p>
      </div>
    </div>
  </div>

  <div class="flex-1 w-full relative">
    <iframe 
      src="https://eugeneration.github.io/HappyIslandDesigner/" 
      title="Happy Island Designer"
      class="w-full h-full border-0 absolute inset-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  </div>
</div>
