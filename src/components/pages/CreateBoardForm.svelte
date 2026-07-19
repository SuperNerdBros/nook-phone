<script lang="ts">
  const { onCancel, onCreate } = $props<{
    onCancel: () => void;
    onCreate: (name: string) => void;
  }>();

  let newBoardName = $state("");
</script>

<div class="bg-white rounded-3xl p-4 border-4 border-[#e1d9be] shadow-sm text-left flex flex-col gap-4">
  <h2 class="text-sm font-black text-[#5c3a21] border-b-2 border-dashed border-[#e1d9be] pb-2 uppercase tracking-wide">
    Create Custom Board
  </h2>

  <div class="flex flex-col gap-1">
    <label for="new-subnook-name" class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Board Name</label>
    <div class="flex gap-2 items-center">
      <span class="text-sm font-black text-[#8a7f66]">bb/</span>
      <input
        id="new-subnook-name"
        type="text"
        placeholder="e.g. TurnipFarmers"
        bind:value={newBoardName}
        class="flex-1 bg-[#fbf9f0] border-2 border-[#dcd3be] p-2.5 rounded-2xl text-xs focus:outline-none focus:border-[#afd485] text-[#4c4637] font-semibold"
      />
    </div>
    <p class="text-[9px] text-gray-400 font-bold mt-1">Spaces will be stripped automatically to form a cute board tag.</p>
  </div>

  <div class="flex justify-between items-center gap-3 mt-2">
    <button
      onclick={onCancel}
      class="px-4 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
    >
      Cancel
    </button>
    <button
      onclick={() => onCreate(newBoardName)}
      disabled={!newBoardName.trim()}
      class="px-6 py-2 bg-[#afd485] hover:bg-opacity-95 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Create
    </button>
  </div>
</div>
