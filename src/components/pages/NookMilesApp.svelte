<script lang="ts">
  // Old native NookMilesApp retired and replaced with acmiles.com iframe
</script>

<div id="miles-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <div class="bg-[#fcf8e3] text-[#5c5446] p-4 pt-6 ac-wavy-header flex justify-between items-center z-10 shrink-0 border-b border-[#e9dc9d]">
    <div>
      <h1 class="text-xl font-bold flex items-center gap-1.5 text-emerald-700">🎈 Nook Miles+</h1>
      <p class="text-xs opacity-90 text-[#85806b]">Powered by acmiles.com</p>
    </div>
  </div>

  <!-- Outer splits -->
  <div class="flex-1 flex overflow-hidden bg-white">
    <iframe 
      src="https://acmiles.com/" 
      class="w-full h-full border-0"
      title="AC Miles Achievement Tracker"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  </div>
</div>
