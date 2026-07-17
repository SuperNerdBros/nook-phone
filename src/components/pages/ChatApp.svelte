<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { onMount } from 'svelte';
  import { 
    MessageSquare, Send, Trash2, ArrowLeft, Plus, 
    ThumbsUp, Calendar, User, MessageCircle, Hash 
  } from '@lucide/svelte';
  import { fetchThreads, createThread, fetchComments, createComment, isProUser } from '@/lib/api';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NewThreadForm from './NewThreadForm.svelte';
  import CreateSublogForm from './CreateSublogForm.svelte';

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
  const getIslandSublog = () => {
    const raw = nookState.passport.islandName || "Nook";
    const clean = raw.replace(/\s*Island\s*$/gi, "");
    return "n/" + clean.replace(/\s+/g, "");
  };

  let islandSublog = $derived(getIslandSublog());

  // Default villager sublogs
  const DEFAULT_SUBLOGS = [
    "n/Isabelle",
    "n/TomNook",
    "n/Blathers",
    "n/Lottie",
    "n/KKSlider"
  ];

  let customSublogs = $state<string[]>([]);
  let allSublogs = $derived([
    "n/All",
    islandSublog,
    ...DEFAULT_SUBLOGS,
    ...customSublogs
  ]);

  let selectedSublogFilter = $state("n/All");

  const MOCK_THREADS = (): Thread[] => [
    {
      id: 1,
      title: "Turnips selling for 542 bells! 💸",
      content: "Dodo code is C1TY9. Tips are appreciated! Resident Services is right outside the airport. Please be respectful of my hybrid flowers!",
      subnook: "n/Isabelle",
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
      subnook: "n/TomNook",
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
      subnook: "n/Lottie",
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
    if (selectedSublogFilter === "n/All") return true;
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
    const formatted = "n/" + newSublogName.trim().replace(/\s+/g, "");
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
    if (sub.startsWith("n/Isabelle")) return "bg-green-100 text-green-800 border-green-200";
    if (sub.startsWith("n/TomNook")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (sub.startsWith("n/Lottie")) return "bg-pink-100 text-pink-800 border-pink-200";
    if (sub.startsWith("n/KKSlider")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (sub.startsWith("n/Blathers")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    // Custom island / user sublogs
    return "bg-indigo-100 text-indigo-800 border-indigo-200";
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
  <div class="bg-[#afd485] text-[#344d18] p-4 pt-6 ac-wavy-header flex justify-between items-center z-10 shrink-0">
    <div class="flex items-center gap-2">
      {#if view !== "list"}
        <button 
          onclick={() => view = "list"}
          class="text-[#344d18] p-1 rounded-full hover:bg-black/5 cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft class="w-5 h-5 stroke-[2.5px]" />
        </button>
      {/if}
      <div>
        <h1 class="text-xl font-bold flex items-center gap-1.5 leading-none">💬 Resident Log</h1>
        <p class="text-[10px] opacity-90 mt-0.5">Bulleted Sublog boards & local logs</p>
      </div>
    </div>
    
    {#if view === "list"}
      <div class="flex items-center gap-1">
        <button
          onclick={() => view = "create_sublog"}
          class="text-[#344d18] bg-white/40 px-2 py-1 rounded-full hover:bg-white/60 transition cursor-pointer flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider"
          title="Create Sublog"
        >
          <Plus class="w-3.5 h-3.5 stroke-[2.5px]" /> Sublog
        </button>
        <button
          onclick={() => { view = "new"; newSubnook = islandSublog; }}
          class="text-[#344d18] bg-white/40 p-2 rounded-full hover:bg-white/60 transition cursor-pointer flex items-center justify-center"
          title="New thread"
        >
          <Plus class="w-4 h-4 stroke-[2.5px]" />
        </button>
        <button
          onclick={handleClearLog}
          class="text-[#344d18] p-2 rounded-full hover:bg-black/5 cursor-pointer flex items-center justify-center"
          title="Reset mockup logs"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    {/if}
  </div>
 
  <!-- Sublogs Horizontal Selector Bar -->
  {#if view === "list"}
    <div class="bg-[#f4f1e3] border-b border-[#e1d9be] py-2 px-3 flex gap-2 overflow-x-auto shrink-0 ac-scrollbar">
      {#each allSublogs as sub}
        <button
          onclick={() => selectedSublogFilter = sub}
          class={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider transition-all border shrink-0 cursor-pointer ${selectedSublogFilter === sub ? 'bg-[#afd485] border-[#8aab5d] text-white shadow-sm scale-105' : 'bg-white hover:bg-gray-50 border-[#dcd3be] text-gray-700 active:scale-95'}`}
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
            class="w-full bg-white rounded-3xl p-4 border-4 border-[#e1d9be] shadow-[0_4px_0_#dcd3be] hover:-translate-y-0.5 transition-all text-left flex flex-col gap-2.5 cursor-pointer relative group"
          >
            <!-- Top bar -->
            <div class="flex justify-between items-center w-full text-[10px] text-gray-400 font-bold">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-xs shrink-0">
                  🐾
                </div>
                <span>{thread.author_name}</span>
              </div>
              <span>{getFormatDate(thread.date)}</span>
            </div>

            <!-- Content -->
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-1.5">
                <span class={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${getSublogColor(thread.subnook)}`}>
                  {thread.subnook}
                </span>
                <h3 class="text-xs font-black text-[#5c3a21] line-clamp-1">{thread.title}</h3>
              </div>
              <p class="text-[10.5px] text-[#8a7f66] line-clamp-2 leading-relaxed mt-0.5">{thread.content}</p>
            </div>

            <!-- Bottom Controls -->
            <div class="flex justify-between items-center w-full pt-1.5 border-t border-dashed border-[#e1d9be] text-[10.5px] font-bold text-gray-500">
              <button 
                onclick={(e) => handleLike(thread.id, e)}
                class={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${thread.hasLiked ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-500'}`}
              >
                <ThumbsUp class="w-3 h-3 stroke-[2.5px]" />
                <span>{thread.likes || 0}</span>
              </button>

              <div class="flex items-center gap-1 px-1">
                <MessageCircle class="w-3.5 h-3.5" />
                <span>{thread.comment_count} replies</span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
      
    {:else if view === "detail" && activeThread}
      <!-- THREAD DETAIL VIEW -->
      <div class="flex flex-col gap-4">
        <!-- Post Header Card -->
        <div class="bg-white rounded-3xl p-4 border-4 border-[#e1d9be] shadow-sm text-left flex flex-col gap-3">
          <div class="flex justify-between items-center w-full text-[10px] text-gray-400 font-bold pb-2 border-b border-dashed border-gray-100">
            <div class="flex items-center gap-1.5">
              <div class="w-6 h-6 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-xs">
                🐾
              </div>
              <span>{activeThread.author_name}</span>
            </div>
            <span>{getFormatDate(activeThread.date)}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-1.5">
              <span class={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${getSublogColor(activeThread.subnook)}`}>
                {activeThread.subnook}
              </span>
              <h2 class="text-sm font-black text-[#5c3a21]">{activeThread.title}</h2>
            </div>
            <p class="text-xs text-[#8a7f66] leading-relaxed mt-1 font-medium">{activeThread.content}</p>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-dashed border-gray-100">
            <button 
              onclick={(e) => handleLike(activeThread!.id, e)}
              class={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${activeThread.hasLiked ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
            >
              <ThumbsUp class="w-3.5 h-3.5 stroke-[2.5px]" />
              <span>{activeThread.likes || 0} Upvotes</span>
            </button>
          </div>
        </div>

        <!-- Replies Section Title -->
        <div class="px-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 mt-1">
          <MessageCircle class="w-3.5 h-3.5" />
          <span>Replies ({threadComments.length})</span>
        </div>

        <!-- Comments List -->
        <div class="flex flex-col gap-2.5">
          {#each threadComments as comment (comment.id)}
            <div class="bg-white/90 border-2 border-[#e1d9be] rounded-3xl p-3 flex flex-col gap-1.5 text-left shadow-sm">
              <div class="flex justify-between items-center text-[9px] font-bold text-gray-400">
                <span class="text-[#5c3a21] font-black">{comment.author_name}</span>
                <span>{getFormatDate(comment.date)}</span>
              </div>
              <div class="text-xs text-[#8a7f66] leading-relaxed font-medium">
                {#if typeof comment.content === 'object'}
                  {@html comment.content.rendered}
                {:else}
                  {comment.content}
                {/if}
              </div>
            </div>
          {:else}
            <div class="text-center py-8 text-gray-400 text-xs italic bg-white/40 rounded-3xl border border-dashed border-gray-200">
              No replies yet. Be the first to leave a comment!
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
    <div class="p-3 bg-white border-t border-[#e1d9be] flex gap-2 shrink-0 items-center">
      <input
        id="reply-message-input"
        type="text"
        placeholder="Type a reply to this bulletin..."
        bind:value={replyText}
        onkeydown={(e) => e.key === "Enter" && submitComment()}
        class="flex-1 bg-[#fbf9f0] border border-[#dcd3be] p-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#afd485] text-[#4c4637]"
      />
      <button
        onclick={submitComment}
        disabled={!replyText.trim()}
        class="bg-[#afd485] text-white p-2 rounded-xl hover:bg-opacity-95 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Send class="w-4 h-4" />
      </button>
    </div>
  {/if}
</div>
