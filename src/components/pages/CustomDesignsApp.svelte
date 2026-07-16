<script lang="ts">
  // Custom Editor replaced with an iframe to ACPatterns as requested.
</script>

<div id="designs-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <div class="bg-[#f08bb2] text-[#541330] p-4 pt-6 ac-wavy-header flex justify-between items-center z-10 shrink-0">
    <div>
      <h1 class="text-xl font-bold flex items-center gap-1.5">🎨 Custom Editor Pro</h1>
      <p class="text-xs opacity-90">Powered by acpatterns.com</p>
    </div>
  </div>

  <!-- Outer splits -->
  <div class="flex-1 flex overflow-hidden bg-white">
    <iframe 
      src="https://acpatterns.com/editor" 
      class="w-full h-full border-0"
      title="Animal Crossing Pattern Tool"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    ></iframe>
  </div>
</div>
