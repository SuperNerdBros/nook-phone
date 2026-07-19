<script lang="ts">
  const { allBoards, defaultBoard, onCancel, onSubmit } = $props<{
    allBoards: string[];
    defaultBoard: string;
    onCancel: () => void;
    onSubmit: (title: string, content: string, board: string) => void;
  }>();

  let newTitle = $state("");
  let newContent = $state("");
  let newBoard = $state(defaultBoard);
</script>

<div class="bg-white rounded-3xl p-4 border-4 border-[#e1d9be] shadow-sm text-left flex flex-col gap-4">
  <h2 class="text-sm font-black text-[#5c3a21] border-b-2 border-dashed border-[#e1d9be] pb-2 uppercase tracking-wide">
    New Bulletin Post
  </h2>

  <!-- Title -->
  <div class="flex flex-col gap-1">
    <label for="new-thread-title" class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bulletin Title</label>
    <input
      id="new-thread-title"
      type="text"
      placeholder="e.g. Turnips buying for 450 bells!"
      bind:value={newTitle}
      class="bg-[#fbf9f0] border-2 border-[#dcd3be] p-2.5 rounded-2xl text-xs focus:outline-none focus:border-[#afd485] text-[#4c4637] font-semibold"
    />
  </div>

  <!-- Board Selection -->
  <div class="flex flex-col gap-1">
    <label for="new-thread-board" class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Post to Board</label>
    <select
      id="new-thread-board"
      bind:value={newBoard}
      class="bg-[#fbf9f0] border-2 border-[#dcd3be] p-2.5 rounded-2xl text-xs focus:outline-none focus:border-[#afd485] text-[#4c4637] font-semibold cursor-pointer appearance-none"
    >
      {#each allBoards.filter(s => s !== "bb/All") as board}
        <option value={board}>{board}</option>
      {/each}
    </select>
  </div>

  <!-- Content -->
  <div class="flex flex-col gap-1">
    <label for="new-thread-content" class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message Description</label>
    <textarea
      id="new-thread-content"
      rows="5"
      placeholder="Write your logs, trading details or Dodo Code here..."
      bind:value={newContent}
      class="bg-[#fbf9f0] border-2 border-[#dcd3be] p-2.5 rounded-2xl text-xs focus:outline-none focus:border-[#afd485] text-[#4c4637] font-medium resize-none"
    ></textarea>
  </div>

  <!-- Buttons -->
  <div class="flex justify-between items-center gap-3 mt-2">
    <button
      onclick={onCancel}
      class="px-4 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
    >
      Cancel
    </button>
    <button
      onclick={() => onSubmit(newTitle, newContent, newBoard)}
      disabled={!newTitle.trim() || !newContent.trim()}
      class="px-6 py-2 bg-[#afd485] hover:bg-opacity-95 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Post Bulletin
    </button>
  </div>
</div>
