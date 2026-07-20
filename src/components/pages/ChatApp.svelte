<script lang="ts">
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import nookState from '@/lib/nookState.svelte';
  import { onMount } from 'svelte';
  import { 
    MessageSquare, Send, Trash2, ArrowLeft, Plus, 
    ThumbsUp, Calendar, User, MessageCircle, Hash, Coins
  , X } from '@lucide/svelte';
  import { fetchThreads, createThread, fetchComments, createComment, isProUser, tipThread, getBoardStatus } from '@/lib/api';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NewThreadForm from './NewThreadForm.svelte';
  import CreateBoardForm from './CreateBoardForm.svelte';
  import BoardDonationDialog from '@/components/organisms/BoardDonationDialog.svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import AcnhBubble from '@/components/molecules/AcnhBubble.svelte';

  interface Thread {
    id: number;
    title: string;
    content: string;
    subnook: string;
    author_name: string;
    author_island?: string;
    date: string;
    comment_count: number;
    tips?: number;
    hasLiked?: boolean; // Kept for backwards compatibility but not strictly used for tipping limit
  }

  // Helper to normalize island name for n/ prefix (removes " Island" suffix)
  const ctx = getPhoneContext();
  const getIslandBoard = () => {
    const raw = nookState.passport.islandName || "Nook";
    const clean = raw.replace(/\s*Island\s*$/gi, "");
    return "bb/" + clean.replace(/\s+/g, "");
  };

  let islandBoard = $derived(getIslandBoard());

  let allBoards = $derived(Array.from(new Set([
    "bb/All",
    islandBoard,
    ...nookState.subscribedSublogs
  ])));

  let selectedBoardFilter = $state("bb/All");

  const MOCK_THREADS = (): Thread[] => [
    {
      id: 1,
      title: "Turnips selling for 542 bells! 💸",
      content: "Dodo code is C1TY9. Tips are appreciated! Resident Services is right outside the airport. Please be respectful of my hybrid flowers!",
      subnook: "bb/Isabelle",
      author_name: "Isabelle",
      author_island: "Resident Services",
      date: new Date(Date.now() - 600000).toISOString(),
      comment_count: 2,
      likes: 18,
      hasLiked: false
    },
    {
      id: 2,
      title: "Looking for Ironwood DIY Recipes 🔨",
      content: "Can trade for Gold Nuggets or Nook Miles Tickets! Let me know if your villagers are crafting or if you have spare recipe cards.",
      subnook: "bb/TomNook",
      author_name: "Tom Nook",
      author_island: "Nook Inc.",
      date: new Date(Date.now() - 3600000).toISOString(),
      comment_count: 1,
      likes: 4,
      hasLiked: false
    },
    {
      id: 3,
      title: "Shared a new custom path pattern! 🌸",
      content: "Check my designer code MA-4829-1092-4820. Let me know if you like the brick border textures!",
      subnook: "bb/Lottie",
      author_name: "Lottie",
      author_island: "Archipelago",
      date: new Date(Date.now() - 7200000).toISOString(),
      comment_count: 0,
      likes: 24,
      hasLiked: true
    }
  ];

  let threads = $state<Thread[]>([]);
  let activeThread = $state<Thread | null>(null);
  let threadComments = $state<any[]>([]);
  let view = $state<"list" | "detail" | "new" | "create_board">("list");
  
  let currentDialogueIndex = $state(0);
  let dialogueSequence = $derived.by(() => {
    if (!activeThread) return [];
    const seq = [];
    
    // 1. Replies
    for (const reply of threadComments) {
      let replyText = typeof reply.content === 'object' ? reply.content.rendered : reply.content;
      let cleanText = replyText.replace(/<[^>]*>?/gm, '');
      const repParagraphs = cleanText.split('\n').filter(p => p.trim());
      for (const rp of repParagraphs) {
         seq.push({
           type: 'reply',
           author_name: reply.author_name,
           author_island: reply.author_island || 'Nook',
           text: rp.trim(),
           date: reply.date
         });
      }
    }
    return seq;
  });

  // Form fields
  let newTitle = $state("");
  let newContent = $state("");
  let newSubnook = $state(""); // keep database structure t.subnook
  let newBoardName = $state("");
  let replyText = $state("");
  let loading = $state(false);
  let showReplies = $state(false);
  
  let currentBoardStatus = $state<{ board: string; funded: boolean; raised: number } | null>(null);
  let showBoardDonation = $state(false);

  // Watch for board changes to show Lloid if unfunded
  $effect(() => {
    if (selectedBoardFilter) {
      const coreBoards = ['bb/All', 'bb/Isabelle', 'bb/TomNook', 'bb/Lottie', 'bb/KKSlider', 'bb/Blathers', islandBoard];
      if (coreBoards.includes(selectedBoardFilter)) {
        currentBoardStatus = null;
        showBoardDonation = false;
        return;
      }
      
      getBoardStatus(selectedBoardFilter).then(res => {
        if (res) {
          currentBoardStatus = res;
          if (!res.funded) {
            showBoardDonation = true;
          } else {
            showBoardDonation = false;
          }
        }
      });
    }
  });

  // Filter threads by active board selection
  let filteredThreads = $derived(threads.filter(t => {
    if (selectedBoardFilter === "bb/All") return true;
    return t.subnook.toLowerCase() === selectedBoardFilter.toLowerCase();
  }));

  async function loadThreads() {
    loading = true;
    
    // Subscriptions handled by nookState

    if (isProUser()) {
      const data = await fetchThreads();
      threads = data.map((t: any) => ({
        ...t,
        subnook: t.subnook || islandBoard,
        tips: t.tips || 0,
        hasLiked: false
      }));
    } else {
      const stored = localStorage.getItem("nook_mock_threads");
      if (stored) {
        threads = JSON.parse(stored);
      } else {
        threads = MOCK_THREADS();
        localStorage.setItem("nook_mock_threads", JSON.stringify(threads));
      }
    }
    loading = false;
  }

  async function loadComments(threadId: number) {
    if (isProUser()) {
      threadComments = await fetchComments(threadId);
    } else {
      const stored = localStorage.getItem(`nook_mock_comments_${threadId}`);
      if (stored) {
        threadComments = JSON.parse(stored);
      } else {
        const initialComments = [
          { id: 101, author_name: "Orville", content: { rendered: "Wow, sounds like a great deal! I will fly over shortly." }, date: new Date(Date.now() - 300000).toISOString() },
          { id: 102, author_name: "Wilbur", content: { rendered: "Roger! Roger! On my way." }, date: new Date(Date.now() - 100000).toISOString() }
        ];
        threadComments = initialComments;
        localStorage.setItem(`nook_mock_comments_${threadId}`, JSON.stringify(initialComments));
      }
    }
  }

  async function selectThread(thread: Thread) {
    activeThread = thread;
    await loadComments(thread.id);
    currentDialogueIndex = 0;
    showReplies = false;
    view = "detail";
  }

  async function submitThread() {
    if (!newTitle.trim() || !newContent.trim()) return;
    if (nookState.bells < 200) {
      alert("You need 200 Bells to post a bulletin!");
      return;
    }

    const author = nookState.passport.name || "Resident";
    loading = true;

    nookState.deductBells(200);

    const subnookTarget = newSubnook || islandBoard;

    if (isProUser()) {
      const result = await createThread(newTitle.trim(), newContent.trim(), subnookTarget);
      if (result && result.success) {
        // Save subnook to post meta in real WP environments if available
        newTitle = "";
        newContent = "";
        view = "list";
        await loadThreads();
      }
    } else {
      const newT: Thread = {
        id: Date.now(),
        title: newTitle.trim(),
        content: newContent.trim(),
        subnook: subnookTarget,
        author_name: author,
        author_island: nookState.passport.islandName || "Nook Island",
        date: new Date().toISOString(),
        comment_count: 0,
        tips: 0,
        hasLiked: false
      };
      threads = [newT, ...threads];
      localStorage.setItem("nook_mock_threads", JSON.stringify(threads));
      newTitle = "";
      newContent = "";
      view = "list";
    }
    loading = false;
  }

  async function submitComment() {
    if (!replyText.trim() || !activeThread) return;
    if (nookState.bells < 50) {
      alert("You need 50 Bells to reply!");
      return;
    }
    const author = nookState.passport.name || "Resident";
    nookState.deductBells(50);
    
    if (isProUser()) {
      const success = await createComment(activeThread.id, replyText.trim());
      if (success) {
        replyText = "";
        await loadComments(activeThread.id);
        await loadThreads();
      }
    } else {
      const newComment = {
        id: Date.now(),
        author_name: author,
        content: { rendered: replyText.trim() },
        date: new Date().toISOString()
      };
      threadComments = [...threadComments, newComment];
      localStorage.setItem(`nook_mock_comments_${activeThread.id}`, JSON.stringify(threadComments));
      
      // Update comment count on thread
      threads = threads.map(t => {
        if (t.id === activeThread?.id) {
          return { ...t, comment_count: t.comment_count + 1 };
        }
        return t;
      });
      localStorage.setItem("nook_mock_threads", JSON.stringify(threads));
      
      // Sync activeThread count
      if (activeThread) {
        activeThread.comment_count++;
      }
      replyText = "";
      // Advance dialogue index if they are at the end so they see their new reply
      setTimeout(() => {
        if (currentDialogueIndex < dialogueSequence.length - 1) {
          currentDialogueIndex = dialogueSequence.length - 1;
        }
      }, 50);
    }
  }

  function handleCreateBoard() {
    if (!newBoardName.trim()) return;
    const formatted = "bb/" + newBoardName.trim().replace(/\s+/g, "");
    if (!nookState.isSubscribed(formatted)) {
      nookState.toggleSubscription(formatted);
    }
    selectedBoardFilter = formatted;
    view = "list";
    newBoardName = "";
  }

  async function handleTip(threadId: number, event: Event) {
    event.stopPropagation();
    if (nookState.bells < 25) {
      alert("You need 25 Bells to tip!");
      return;
    }
    nookState.deductBells(25);

    if (isProUser()) {
      const res = await tipThread(threadId, 25);
      if (res && res.success) {
        threads = threads.map(t => t.id === threadId ? { ...t, tips: res.new_tips } : t);
        if (activeThread && activeThread.id === threadId) {
          activeThread = { ...activeThread, tips: res.new_tips };
        }
      }
    } else {
      threads = threads.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            tips: (t.tips || 0) + 25
          };
        }
        return t;
      });
      localStorage.setItem("nook_mock_threads", JSON.stringify(threads));
      
      if (activeThread && activeThread.id === threadId) {
        activeThread = threads.find(t => t.id === threadId) || null;
      }
    }
  }

  function handleClearLog() {
    if (confirm("Clear local chat/thread history?")) {
      localStorage.removeItem("nook_mock_threads");
      loadThreads();
    }
  }

  onMount(() => {
    newSubnook = islandBoard;
    loadThreads();
    
    if (nookState.subRoute) {
      selectedBoardFilter = nookState.subRoute;
      if (!nookState.isSubscribed(nookState.subRoute) && nookState.subRoute !== islandBoard) {
         nookState.toggleSubscription(nookState.subRoute);
      }
      nookState.subRoute = ""; 
    }
  });

  const getBoardColor = (sub: string) => {
    if (sub.startsWith("bb/Isabelle")) return "bg-[#e6f4d2] text-[#4d7319] border-[#c0e096]";
    if (sub.startsWith("bb/TomNook")) return "bg-[#ffecd1] text-[#995c00] border-[#ffd599]";
    if (sub.startsWith("bb/Lottie")) return "bg-[#ffe0f0] text-[#991f66] border-[#ffb3da]";
    if (sub.startsWith("bb/KKSlider")) return "bg-[#e0f0ff] text-[#005299] border-[#b3daff]";
    if (sub.startsWith("bb/Blathers")) return "bg-[#d1f4e0] text-[#197340] border-[#96e0b8]";
    // Custom island / user boards
    return "bg-[#e6e0ff] text-[#401999] border-[#c2b3ff]";
  };

  const getFormatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };
</script>

<div id="chat-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <NookAppHeader 
    title={view === 'detail' && activeThread ? activeThread.title : "Bulletin Board"}
    subtitle={view === 'detail' && activeThread ? activeThread.subnook : "Bulleted boards & local logs"}
    bgClass="bg-[#eb6a9d]"
    textClass="text-white"
  >
    {#snippet iconSnippet()}
      {#if view !== "list"}
        <button 
          onclick={() => view = "list"}
          class="text-white p-1 rounded-full hover:bg-black/5 cursor-pointer flex items-center justify-center mr-1"
        >
          <ArrowLeft class="w-5 h-5 stroke-[2.5px]" />
        </button>
      {:else}
        <div class="w-12 h-12 mr-1">
          <NookIcon name="chat" class="w-full h-full object-contain drop-shadow-sm" />
        </div>
      {/if}
    {/snippet}
    
    {#snippet actions()}
      {#if view === "list"}
        <div class="flex items-center gap-1">
          <NookToolbarButton
            onclick={() => view = "create_board"}
            class="!w-auto !px-2 text-[9px] font-black uppercase tracking-wider text-[#eb6a9d]"
            title="Create Board"
          >
            <Plus class="w-3.5 h-3.5 stroke-[2.5px] mr-0.5" /> Board
          </NookToolbarButton>
          <NookToolbarButton
            onclick={() => { view = "new"; newSubnook = selectedBoardFilter; }}
            class="text-[#eb6a9d]"
            title="New thread"
          >
            <Plus class="w-3.5 h-3.5 stroke-[2.5px]" />
          </NookToolbarButton>
        </div>
      {/if}
      {#if view === "detail" && activeThread}
        <NookToolbarButton 
          class="text-[#eb6a9d] !px-2 hover:bg-[#eb6a9d] hover:text-white"
          onclick={(e) => handleTip(activeThread!.id, e)} 
          title="Tip 25 Bells"
        >
          <Coins class="w-3.5 h-3.5 stroke-[2.5px] mr-1" />
          <span class="text-[10px] font-black">{activeThread.tips || 0}</span>
        </NookToolbarButton>
      {/if}
      <NookToolbarButton class="text-[#eb6a9d]" onclick={ctx.handleHomeButton} title="Close App">
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>
 
  <!-- Boards Horizontal Selector Bar -->
  {#if view === "list"}
    <div class="bg-[#f4f1e3] border-b-2 border-[#e1d9be] py-2.5 px-3 flex gap-2.5 overflow-x-auto shrink-0 ac-scrollbar shadow-inner">
      {#each allBoards as sub}
        <button
          onclick={() => selectedBoardFilter = sub}
          class={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider transition-all border shrink-0 cursor-pointer ${selectedBoardFilter === sub ? 'bg-[#eb6a9d] border-[#c94d7d] text-white shadow-sm scale-105' : 'bg-white hover:bg-gray-50 border-[#dcd3be] text-gray-700 active:scale-95'}`}
        >
          {sub}
        </button>
      {/each}
    </div>
  {/if}
 
  <!-- Main View Router -->
  <div class="flex-1 overflow-y-auto p-4 ac-scrollbar bg-[#fdfdfc]/80 flex flex-col gap-3.5">
    {#if loading}
      <div class="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
        <span class="text-3xl animate-spin">🍃</span>
        <span class="text-xs font-bold">Loading bulletin...</span>
      </div>
    {:else if view === "list"}
      <!-- THREAD LIST -->
      {#if filteredThreads.length === 0}
        <div class="text-center py-20 text-gray-400 text-sm">
          <MessageSquare class="w-12 h-12 mx-auto opacity-25 mb-2" />
          No discussions found in {selectedBoardFilter}. Tap the + icon above to write a post!
        </div>
      {:else}
        {#each filteredThreads as thread (thread.id)}
          <div
            role="button"
            tabindex="0"
            onclick={() => selectThread(thread)}
            onkeydown={(e) => e.key === 'Enter' && selectThread(thread)}
            class="w-full bg-white rounded-[24px] p-4 border-4 border-[#e1d9be] shadow-[0_6px_0_#dcd3be] hover:-translate-y-1 hover:shadow-[0_8px_0_#dcd3be] active:translate-y-1 active:shadow-[0_2px_0_#dcd3be] transition-all text-left flex flex-col gap-3 cursor-pointer relative group overflow-hidden shrink-0 min-h-[130px]"
          >
            <!-- Decorative bubbly corner -->
            <div class="absolute -top-4 -right-4 w-12 h-12 bg-[#f4f1e3] rounded-full opacity-50 group-hover:scale-125 transition-transform duration-300"></div>

            <!-- Top bar -->
            <div class="flex justify-between items-start w-full z-10">
              <div class="flex flex-col text-left leading-tight">
                <span class="text-[10px] font-black uppercase tracking-wider" style="color: var(--theme-color, #eb6a9d)">{thread.subnook}</span>
                <span class="text-[11px] font-black text-[#5c3a21] mt-0.5">{thread.author_name}@{thread.author_island || 'Nook'}</span>
              </div>
              <span class="text-[10px] text-[#9b8d71] font-bold opacity-80">{getFormatDate(thread.date)}</span>
            </div>

            <!-- Content -->
            <div class="flex flex-col gap-1 z-10 text-center pt-1 pb-4 px-1">
              <h3 class="text-sm font-black text-[#5c3a21] leading-snug line-clamp-1">
                {typeof thread.title === 'object' ? thread.title.rendered : thread.title}
              </h3>
              <p class="text-[12px] text-[#786b51] line-clamp-2 leading-relaxed font-medium">
                {@html typeof thread.content === 'object' ? thread.content.rendered : thread.content}
              </p>
            </div>

            <!-- Bottom Controls -->
            <div class="flex justify-between items-center w-full pt-2 mt-1 border-t-2 border-dashed border-[#e8dfc7] text-[11px] font-bold text-[#8a7f66] z-10">
              <button
                onclick={(e) => handleTip(thread.id, e)}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-b-2 transition-all cursor-pointer bg-[#f4f1e3] border-[#e1d9be] hover:bg-[#ebdca6] text-[#7a6f58] active:translate-y-0.5 active:border-b-0"
              >
                <Coins class="w-3.5 h-3.5 stroke-[2.5px]" />
                <span class="font-black">Tip 25 Bells</span>
              </button>
              <span class="font-black text-[#5c3a21] bg-[#e1d9be]/50 px-2 py-1 rounded-lg">Raised: {thread.tips || 0}</span>
            </div>
          </div>
        {/each}
      {/if}
      
    {:else if view === "detail" && activeThread}
      <div class="relative z-20 w-full px-2 pb-[72px] flex flex-col gap-6 pt-4 min-h-full">
         <!-- Static Main Post (Bulletin form) -->
         <div class="w-full bg-white rounded-[24px] p-4 border-4 border-[#e1d9be] shadow-[0_6px_0_#dcd3be] text-left flex flex-col gap-3 relative overflow-hidden">
            <!-- Decorative bubbly corner -->
            <div class="absolute -top-4 -right-4 w-12 h-12 bg-[#f4f1e3] rounded-full opacity-50"></div>
            
            <!-- Top bar -->
            <div class="flex justify-between items-start w-full z-10">
              <div class="flex flex-col text-left leading-tight">
                <span class="text-[10px] font-black uppercase tracking-wider" style="color: var(--theme-color, #eb6a9d)">{activeThread.subnook}</span>
                <span class="text-[11px] font-black text-[#5c3a21] mt-0.5">{activeThread.author_name}@{activeThread.author_island || 'Nook'}</span>
              </div>
              <span class="text-[10px] text-[#9b8d71] font-bold opacity-80">{getFormatDate(activeThread.date)}</span>
            </div>
            
            <!-- Content -->
            <div class="flex flex-col gap-3 z-10 text-center pt-2 pb-2 px-1">
              <h3 class="text-[15px] font-black text-[#5c3a21] leading-snug">
                {typeof activeThread.title === 'object' ? activeThread.title.rendered : activeThread.title}
              </h3>
              <p class="text-[13px] text-[#786b51] leading-relaxed font-medium whitespace-pre-wrap">
                {@html typeof activeThread.content === 'object' ? activeThread.content.rendered : activeThread.content}
              </p>
            </div>

            <!-- Bottom Controls -->
            <div class="flex items-center justify-between pt-3 mt-1 border-t-2 border-dashed border-[#e8dfc7]">
              <button
                onclick={(e) => handleTip(activeThread!.id, e)}
                class="flex items-center gap-1.5 px-4 py-2 rounded-xl border-b-[3px] text-[12px] font-black transition-all cursor-pointer bg-[#f4f1e3] border-[#e1d9be] hover:bg-[#ebdca6] text-[#7a6f58] active:translate-y-[2px] active:border-b-[1px]"
              >
                <Coins class="w-4 h-4 stroke-[2.5px]" />
                <span>Tip 25 Bells</span>
              </button>
              <span class="text-[13px] font-black text-[#5c3a21] bg-[#e1d9be]/50 px-3 py-1.5 rounded-xl">Raised: {activeThread.tips || 0}</span>
            </div>
         </div>

         <!-- Replies Wall of bubbles -->
         {#if dialogueSequence.length > 0}
           {#if !showReplies}
             <div class="flex justify-center mt-2">
               <button 
                 onclick={() => showReplies = true}
                 class="bg-[#eb6a9d] text-white px-5 py-2 rounded-full font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition"
               >
                 Read Replies ({dialogueSequence.length})
               </button>
             </div>
           {:else}
             <div class="flex flex-col gap-4 mt-2 relative">
               <!-- Dialogue Progress Indicator (just for replies now) -->
               <div class="sticky top-2 mx-auto flex gap-1 z-10 bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm w-fit mb-2">
                 {#each dialogueSequence as _, i}
                   <div class={`w-1.5 h-1.5 rounded-full transition-all ${i === currentDialogueIndex ? 'bg-[#eb6a9d] scale-125' : i < currentDialogueIndex ? 'bg-[#c94d7d] opacity-60' : 'bg-[#e1d9be]'}`}></div>
                 {/each}
               </div>

               {#each dialogueSequence as seq, i}
                 {#if i <= currentDialogueIndex}
                   <AcnhBubble
                     title={seq.author_name}
                     dialogText={seq.text}
                     isActive={true}
                     class="w-full !min-h-[80px] reply-bubble transition-all animate-fade-in"
                     onDismiss={i === currentDialogueIndex && i < dialogueSequence.length - 1 ? () => {
                       currentDialogueIndex++;
                       setTimeout(() => {
                         const scrollEl = document.querySelector('#chat-app .overflow-y-auto');
                         if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
                       }, 50);
                     } : undefined}
                   >
                     <div class="absolute -top-3 right-4 bg-[#e8dfc7] text-[#8a7f66] px-3 py-0.5 rounded-full text-[9px] font-black tracking-wider border-2 border-white shadow-sm z-10">
                        {getFormatDate(seq.date)}
                     </div>
                   </AcnhBubble>
                 {/if}
               {/each}
             </div>
           {/if}
         {/if}
      </div>

    {:else if view === "new"}
      <NewThreadForm
        allBoards={allBoards}
        defaultBoard={selectedBoardFilter === "bb/All" ? islandBoard : selectedBoardFilter}
        onCancel={() => view = "list"}
        onSubmit={(title, content, board) => {
          newTitle = title;
          newContent = content;
          newSubnook = board;
          submitThread();
        }}
      />

    {:else if view === "create_board"}
      <CreateBoardForm
        onCancel={() => view = "list"}
        onCreate={(name) => {
          newBoardName = name;
          handleCreateBoard();
        }}
      />
    {/if}
  </div>

  <!-- Bottom Interactive Reply Input (only on detail view) -->
  {#if view === "detail" && activeThread}
    <div class="absolute bottom-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-md border-t-2 border-[#e1d9be] flex gap-2 items-center shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-20">
      <input
        id="reply-message-input"
        type="text"
        placeholder={nookState.bells >= 50 ? "Type a reply... (Costs 50 Bells)" : "Need 50 Bells to reply!"}
        bind:value={replyText}
        disabled={nookState.bells < 50}
        onkeydown={(e) => e.key === "Enter" && submitComment()}
        class="flex-1 bg-[#fbf9f0] border border-[#dcd3be] p-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#eb6a9d] text-[#4c4637] disabled:opacity-50"
      />
      <button
        onclick={submitComment}
        disabled={!replyText.trim() || nookState.bells < 50}
        class="bg-[#eb6a9d] text-white p-2 rounded-xl hover:bg-opacity-95 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Send class="w-5 h-5 stroke-[2.5px]" />
      </button>
    </div>
  {/if}

  {#if showBoardDonation && currentBoardStatus}
    <BoardDonationDialog
      board={currentBoardStatus.board}
      initialRaised={currentBoardStatus.raised}
      isFunded={currentBoardStatus.funded}
      onClose={() => showBoardDonation = false}
      onFunded={() => { currentBoardStatus!.funded = true; showBoardDonation = false; }}
    />
  {/if}
</div>
