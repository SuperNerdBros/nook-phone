<script lang="ts">
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import nookState from '@/lib/nookState.svelte';
  import { onMount } from 'svelte';
  import { 
    MessageSquare, Send, Trash2, ArrowLeft, Plus, 
    ThumbsUp, Calendar, User, MessageCircle, Hash 
  , X } from '@lucide/svelte';
  import { fetchThreads, createThread, fetchComments, createComment, isProUser } from '@/lib/api';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NewThreadForm from './NewThreadForm.svelte';
  import CreateSublogForm from './CreateSublogForm.svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';

  interface Thread {
    id: number;
    title: string;
    content: string;
    subnook: string;
    author_name: string;
    date: string;
    comment_count: number;
    likes?: number;
    hasLiked?: boolean;
  }

  // Helper to normalize island name for n/ prefix (removes " Island" suffix)
  const ctx = getPhoneContext();
  const getIslandSublog = () => {
    const raw = nookState.passport.islandName || "Nook";
    const clean = raw.replace(/\s*Island\s*$/gi, "");
    return "bb/" + clean.replace(/\s+/g, "");
  };

  let islandSublog = $derived(getIslandSublog());

  // Default villager sublogs
  const DEFAULT_SUBLOGS = [
    "bb/Isabelle",
    "bb/TomNook",
    "bb/Blathers",
    "bb/Lottie",
    "bb/KKSlider"
  ];

  let customSublogs = $state<string[]>([]);
  let allSublogs = $derived([
    "bb/All",
    islandSublog,
    ...DEFAULT_SUBLOGS,
    ...customSublogs
  ]);

  let selectedSublogFilter = $state("bb/All");

  const MOCK_THREADS = (): Thread[] => [
    {
      id: 1,
      title: "Turnips selling for 542 bells! 💸",
      content: "Dodo code is C1TY9. Tips are appreciated! Resident Services is right outside the airport. Please be respectful of my hybrid flowers!",
      subnook: "bb/Isabelle",
      author_name: "Isabelle",
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
      date: new Date(Date.now() - 7200000).toISOString(),
      comment_count: 0,
      likes: 24,
      hasLiked: true
    }
  ];

  let threads = $state<Thread[]>([]);
  let activeThread = $state<Thread | null>(null);
  let threadComments = $state<any[]>([]);
  let view = $state<"list" | "detail" | "new" | "create_sublog">("list");
  
  // Form fields
  let newTitle = $state("");
  let newContent = $state("");
  let newSubnook = $state(""); // keep database structure t.subnook
  let newSublogName = $state("");
  let replyText = $state("");
  let loading = $state(false);

  // Filter threads by active sublog selection
  let filteredThreads = $derived(threads.filter(t => {
    if (selectedSublogFilter === "bb/All") return true;
    return t.subnook.toLowerCase() === selectedSublogFilter.toLowerCase();
  }));

  async function loadThreads() {
    loading = true;
    
    // Load custom sublogs
    const storedSubs = localStorage.getItem("nook_custom_sublogs");
    if (storedSubs) {
      customSublogs = JSON.parse(storedSubs);
    }

    if (isProUser()) {
      const data = await fetchThreads();
      threads = data.map((t: any) => ({
        ...t,
        subnook: t.subnook || islandSublog,
        likes: t.likes || Math.floor(Math.random() * 12),
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
    view = "detail";
  }

  async function submitThread() {
    if (!newTitle.trim() || !newContent.trim()) return;
    const author = nookState.passport.name || "Resident";
    loading = true;

    const subnookTarget = newSubnook || islandSublog;

    if (isProUser()) {
      const result = await createThread(newTitle.trim(), newContent.trim());
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
        date: new Date().toISOString(),
        comment_count: 0,
        likes: 0,
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
    const author = nookState.passport.name || "Resident";
    
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
    }
  }

  function handleCreateSublog() {
    if (!newSublogName.trim()) return;
    const formatted = "bb/" + newSublogName.trim().replace(/\s+/g, "");
    if (!customSublogs.includes(formatted)) {
      customSublogs = [...customSublogs, formatted];
      localStorage.setItem("nook_custom_sublogs", JSON.stringify(customSublogs));
    }
    newSublogName = "";
    view = "list";
  }

  function handleLike(threadId: number, event: Event) {
    event.stopPropagation();
    threads = threads.map(t => {
      if (t.id === threadId) {
        const liked = !t.hasLiked;
        return {
          ...t,
          hasLiked: liked,
          likes: (t.likes || 0) + (liked ? 1 : -1)
        };
      }
      return t;
    });
    localStorage.setItem("nook_mock_threads", JSON.stringify(threads));
    
    if (activeThread && activeThread.id === threadId) {
      activeThread = threads.find(t => t.id === threadId) || null;
    }
  }

  function handleClearLog() {
    if (confirm("Clear local chat/thread history?")) {
      localStorage.removeItem("nook_mock_threads");
      localStorage.removeItem("nook_custom_sublogs");
      customSublogs = [];
      loadThreads();
    }
  }

  onMount(() => {
    newSubnook = islandSublog;
    loadThreads();
  });

  const getSublogColor = (sub: string) => {
    if (sub.startsWith("bb/Isabelle")) return "bg-[#e6f4d2] text-[#4d7319] border-[#c0e096]";
    if (sub.startsWith("bb/TomNook")) return "bg-[#ffecd1] text-[#995c00] border-[#ffd599]";
    if (sub.startsWith("bb/Lottie")) return "bg-[#ffe0f0] text-[#991f66] border-[#ffb3da]";
    if (sub.startsWith("bb/KKSlider")) return "bg-[#e0f0ff] text-[#005299] border-[#b3daff]";
    if (sub.startsWith("bb/Blathers")) return "bg-[#d1f4e0] text-[#197340] border-[#96e0b8]";
    // Custom island / user sublogs
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
    title="Bulletin Board"
    subtitle="Bulleted Sublog boards & local logs"
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
            onclick={() => view = "create_sublog"}
            class="!w-auto !px-2 text-[9px] font-black uppercase tracking-wider text-[#eb6a9d]"
            title="Create Sublog"
          >
            <Plus class="w-3.5 h-3.5 stroke-[2.5px] mr-0.5" /> Sublog
          </NookToolbarButton>
          <NookToolbarButton
            onclick={() => { view = "new"; newSubnook = selectedSublogFilter === "bb/All" ? islandSublog : selectedSublogFilter; }}
            class="text-[#eb6a9d]"
            title="New thread"
          >
            <Plus class="w-3.5 h-3.5 stroke-[2.5px]" />
          </NookToolbarButton>
          <NookToolbarButton
            onclick={handleClearLog}
            class="text-[#eb6a9d]"
            title="Reset mockup logs"
          >
            <Trash2 class="w-3.5 h-3.5 stroke-[2.5px]" />
          </NookToolbarButton>
        </div>
      {/if}
      <NookToolbarButton class="text-[#eb6a9d]" onclick={ctx.handleHomeButton} title="Close App">
        <X class="w-3.5 h-3.5 stroke-[3px]" />
      </NookToolbarButton>
    {/snippet}
  </NookAppHeader>
 
  <!-- Sublogs Horizontal Selector Bar -->
  {#if view === "list"}
    <div class="bg-[#f4f1e3] border-b-2 border-[#e1d9be] py-2.5 px-3 flex gap-2.5 overflow-x-auto shrink-0 ac-scrollbar shadow-inner">
      {#each allSublogs as sub}
        <button
          onclick={() => selectedSublogFilter = sub}
          class={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider transition-all border shrink-0 cursor-pointer ${selectedSublogFilter === sub ? 'bg-[#eb6a9d] border-[#c94d7d] text-white shadow-sm scale-105' : 'bg-white hover:bg-gray-50 border-[#dcd3be] text-gray-700 active:scale-95'}`}
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
          No discussions found in {selectedSublogFilter}. Tap the + icon above to write a post!
        </div>
      {:else}
        {#each filteredThreads as thread (thread.id)}
          <div
            role="button"
            tabindex="0"
            onclick={() => selectThread(thread)}
            onkeydown={(e) => e.key === 'Enter' && selectThread(thread)}
            class="w-full bg-white rounded-[24px] p-4 border-4 border-[#e1d9be] shadow-[0_6px_0_#dcd3be] hover:-translate-y-1 hover:shadow-[0_8px_0_#dcd3be] active:translate-y-1 active:shadow-[0_2px_0_#dcd3be] transition-all text-left flex flex-col gap-3 cursor-pointer relative group overflow-hidden"
          >
            <!-- Decorative bubbly corner -->
            <div class="absolute -top-4 -right-4 w-12 h-12 bg-[#f4f1e3] rounded-full opacity-50 group-hover:scale-125 transition-transform duration-300"></div>

            <!-- Top bar -->
            <div class="flex justify-between items-center w-full text-[11px] text-[#9b8d71] font-bold z-10">
              <div class="flex items-center gap-1.5 bg-[#fcfaf5] py-1 px-2.5 rounded-xl border-2 border-[#e8dfc7]">
                <div class="w-5 h-5 rounded-full bg-[#f4ebd0] border-2 border-white flex items-center justify-center text-[10px] shrink-0 shadow-sm">
                  🐾
                </div>
                <span>{thread.author_name}</span>
              </div>
              <span class="opacity-80">{getFormatDate(thread.date)}</span>
            </div>

            <!-- Content -->
            <div class="flex flex-col gap-1.5 z-10">
              <div class="flex items-center gap-2">
                <span class={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border-2 ${getSublogColor(thread.subnook)}`}>
                  {thread.subnook}
                </span>
                <h3 class="text-sm font-black text-[#5c3a21] line-clamp-1">{thread.title}</h3>
              </div>
              <p class="text-[12px] text-[#786b51] line-clamp-2 leading-relaxed mt-1 font-medium">{thread.content}</p>
            </div>

            <!-- Bottom Controls -->
            <div class="flex justify-between items-center w-full pt-2 mt-1 border-t-2 border-dashed border-[#e8dfc7] text-[11px] font-bold text-[#8a7f66] z-10">
              <button 
                onclick={(e) => handleLike(thread.id, e)}
                class={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-b-2 transition-all cursor-pointer ${thread.hasLiked ? 'bg-[#eb6a9d] border-[#c94d7d] text-white active:translate-y-0.5 active:border-b-0' : 'bg-[#f4f1e3] border-[#e1d9be] hover:bg-[#ebdca6] text-[#7a6f58] active:translate-y-0.5 active:border-b-0'}`}
              >
                <ThumbsUp class="w-3.5 h-3.5 stroke-[2.5px]" />
                <span class="font-black">{thread.likes || 0}</span>
              </button>

              <div class="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#fcfaf5] border-2 border-[#e8dfc7]">
                <MessageCircle class="w-3.5 h-3.5 stroke-[2.5px] text-[#a09477]" />
                <span>{thread.comment_count} replies</span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
      
    {:else if view === "detail" && activeThread}
      <!-- THREAD DETAIL VIEW -->
      <div class="flex flex-col gap-4 pb-16">
        <!-- Post Header Card -->
        <div class="bg-white rounded-[24px] p-5 border-4 border-[#e1d9be] shadow-[0_4px_0_#dcd3be] text-left flex flex-col gap-4 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2 bg-[#eb6a9d] opacity-80"></div>
          
          <div class="flex justify-between items-center w-full text-[11px] text-[#9b8d71] font-bold pb-3 border-b-2 border-dashed border-[#e8dfc7] pt-2">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-[#f4ebd0] border-2 border-white shadow-sm flex items-center justify-center text-sm">
                🐾
              </div>
              <span class="text-[13px] text-[#5c3a21]">{activeThread.author_name}</span>
            </div>
            <span>{getFormatDate(activeThread.date)}</span>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 mb-1">
              <span class={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border-2 ${getSublogColor(activeThread.subnook)}`}>
                {activeThread.subnook}
              </span>
            </div>
            <h2 class="text-base font-black text-[#5c3a21] leading-tight">{activeThread.title}</h2>
            <p class="text-[13px] text-[#786b51] leading-relaxed mt-2 font-medium bg-[#fcfaf5] p-3 rounded-xl border border-[#e8dfc7]">{activeThread.content}</p>
          </div>

          <div class="flex items-center justify-between pt-3 mt-1 border-t-2 border-dashed border-[#e8dfc7]">
            <button 
              onclick={(e) => handleLike(activeThread!.id, e)}
              class={`flex items-center gap-1.5 px-4 py-2 rounded-xl border-b-[3px] text-[12px] font-black transition-all cursor-pointer ${activeThread.hasLiked ? 'bg-[#eb6a9d] border-[#c94d7d] text-white active:translate-y-[2px] active:border-b-[1px]' : 'bg-[#f4f1e3] border-[#e1d9be] hover:bg-[#ebdca6] text-[#7a6f58] active:translate-y-[2px] active:border-b-[1px]'}`}
            >
              <ThumbsUp class="w-4 h-4 stroke-[2.5px]" />
              <span>{activeThread.likes || 0} Upvotes</span>
            </button>
          </div>
        </div>

        <!-- Replies Section Title -->
        <div class="px-2 text-[11px] font-black text-[#8a7f66] uppercase tracking-widest flex items-center gap-2 mt-2 bg-[#e8dfc7] py-1.5 w-max rounded-xl">
          <MessageCircle class="w-4 h-4 stroke-[2.5px]" />
          <span>Replies ({threadComments.length})</span>
        </div>

        <!-- Comments List -->
        <div class="flex flex-col gap-3">
          {#each threadComments as comment (comment.id)}
            <div class="bg-white/95 border-2 border-[#e1d9be] rounded-[20px] p-3.5 flex flex-col gap-2 text-left shadow-sm hover:border-[#d0c6a8] transition-colors">
              <div class="flex justify-between items-center text-[10px] font-bold text-[#9b8d71] mb-1">
                <div class="flex items-center gap-1.5">
                  <div class="w-4 h-4 rounded-full bg-[#f4ebd0] flex items-center justify-center text-[8px]">🐾</div>
                  <span class="text-[#5c3a21] font-black text-[11px]">{comment.author_name}</span>
                </div>
                <span>{getFormatDate(comment.date)}</span>
              </div>
              <div class="text-[12px] text-[#786b51] leading-relaxed font-medium pl-5.5">
                {#if typeof comment.content === 'object'}
                  {@html comment.content.rendered}
                {:else}
                  {comment.content}
                {/if}
              </div>
            </div>
          {:else}
            <div class="text-center py-10 text-[#a09477] text-xs font-bold bg-[#fcfaf5] rounded-[24px] border-2 border-dashed border-[#e8dfc7] shadow-inner">
              <span class="text-3xl block mb-2 opacity-50">🍃</span>
              No replies yet. Be the first to chime in!
            </div>
          {/each}
        </div>
      </div>

    {:else if view === "new"}
      <NewThreadForm
        allSublogs={allSublogs}
        defaultSublog={islandSublog}
        onCancel={() => view = "list"}
        onSubmit={(title, content, sublog) => {
          newTitle = title;
          newContent = content;
          newSubnook = sublog;
          submitThread();
        }}
      />

    {:else if view === "create_sublog"}
      <CreateSublogForm
        onCancel={() => view = "list"}
        onCreate={(name) => {
          newSublogName = name;
          handleCreateSublog();
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
        placeholder="Type a reply to this bulletin..."
        bind:value={replyText}
        onkeydown={(e) => e.key === "Enter" && submitComment()}
        class="flex-1 bg-[#fbf9f0] border border-[#dcd3be] p-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#eb6a9d] text-[#4c4637]"
      />
      <button
        onclick={submitComment}
        disabled={!replyText.trim()}
        class="bg-[#eb6a9d] text-white p-2 rounded-xl hover:bg-opacity-95 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Send class="w-5 h-5 stroke-[2.5px]" />
      </button>
    </div>
  {/if}
</div>
