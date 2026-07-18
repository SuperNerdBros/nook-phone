<script lang="ts">
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import { onMount } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { ArrowLeft, Send, Search, CheckCheck, MessageSquare, X, Plus, Grid, Mail, Inbox, Mailbox } from '@lucide/svelte';
  import nookState from '@/lib/nookState.svelte';
  import { fetchPrivateLetters, createPrivateLetter, fetchComments, createComment, fetchNookUsers, isProUser } from '@/lib/api';
  import NookAppTemplate from '@/components/organisms/NookAppTemplate.svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import AcnhBubble from '../molecules/AcnhBubble.svelte';
  import mailIcon from '@/assets/img/icons/mail_icon.png';

  interface Letter {
    id: number;
    partner_id: number;
    partner_name: string;
    subject: string;
    content: string;
    date: string;
    unread_count: number;
    stationery_id?: string;
    is_sent_by_me?: boolean;
  }

  interface Message {
    id: number;
    sender_id: number;
    content: string;
    date: string;
    is_read: boolean;
  }

  const STATIONERY_OPTIONS = [
    { id: 'airmail', name: 'Airmail', bgClass: 'bg-[#f4f1e1]', style: 'border: 8px solid transparent; border-image: repeating-linear-gradient(45deg, #d32f2f, #d32f2f 10px, transparent 10px, transparent 20px, #1976d2 20px, #1976d2 30px, transparent 30px, transparent 40px) 8; background-clip: padding-box;' },
    { id: 'lined', name: 'Lined', bgClass: 'bg-[#fffae8]', style: 'background-image: repeating-linear-gradient(transparent, transparent 24px, #a3c4f3 25px); background-size: 100% 25px;' },
    { id: 'parchment', name: 'Parchment', bgClass: 'bg-[#e2d4a6]', style: 'box-shadow: inset 0 0 30px rgba(100,60,20,0.2);' },
    { id: 'cute', name: 'Cute', bgClass: 'bg-[#ffdceb]', style: 'background-image: radial-gradient(#ffb6c1 15%, transparent 16%), radial-gradient(#ffb6c1 15%, transparent 16%); background-size: 20px 20px; background-position: 0 0, 10px 10px;' }
  ];

  const ctx = getPhoneContext();
  let letters = $state<Letter[]>([]);
  let users = $state<any[]>([]);
  let activeLetter = $state<Letter | null>(null);
  let activeChatPartner = $state<any | null>(null);
  let messages = $state<Message[]>([]);
  let newSubject = $state('');
  let newMessage = $state('');
  
  let view = $state<"inbox" | "user-letters" | "chat" | "new-recipient" | "new-stationery" | "new-draft">("inbox");
  
  let loading = $state(true);
  let sending = $state(false);
  let searchQuery = $state('');
  
  let selectedRecipient = $state<any>(null);
  let selectedStationery = $state<any>(STATIONERY_OPTIONS[0]);

  let activeCategory = $state("All");
  const categories = ["All", "Inbox", "Unread", "Outbox"];
  
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "All": return Grid;
      case "Inbox": return Inbox;
      case "Unread": return Mail;
      case "Outbox": return Send;
      default: return Mailbox;
    }
  };
  
  // Mock data for guests
  const MOCK_LETTERS: Letter[] = [
    { id: 101, partner_id: 1, partner_name: "Tom Nook", subject: "Loan Payment", content: "Hello! Have you checked your mail?\nYour loan is due, yes, yes!", date: new Date(Date.now() - 7200000).toISOString(), unread_count: 1, stationery_id: 'airmail', is_sent_by_me: false },
    { id: 102, partner_id: 2, partner_name: "Isabelle", subject: "Announcements", content: "Good morning!\nHere are the morning announcements!", date: new Date(Date.now() - 3600000).toISOString(), unread_count: 0, stationery_id: 'cute', is_sent_by_me: false }
  ];
  const MOCK_COMMENTS: (Message & {thread_id: number})[] = [
    { id: 1, thread_id: 101, sender_id: 0, content: "Yes, I got it!", date: new Date(Date.now() - 3600000).toISOString(), is_read: true },
    { id: 2, thread_id: 101, sender_id: 1, content: "Please pay soon.", date: new Date().toISOString(), is_read: false }
  ];
  const MOCK_USERS = [
    { ID: 1, display_name: "Tom Nook" },
    { ID: 2, display_name: "Isabelle" },
    { ID: 3, display_name: "Timmy" },
    { ID: 4, display_name: "Tommy" }
  ];

  onMount(async () => {
    if (isProUser()) {
      const data = await fetchPrivateLetters();
      // Map WP Post format to Letter format here if needed
      letters = data.map((d: any) => {
        const currentUserId = Number((window as any).wpApiSettings?.userId || 0);
        const authorId = Number(d.author || 0);
        const isSentByMe = authorId === currentUserId;
        
        const partnerId = isSentByMe ? Number(d.recipient_id || 0) : authorId;
        const partnerName = isSentByMe ? d.recipient_name : d.author_name;
        
        return {
          id: d.id,
          partner_id: partnerId || 0,
          partner_name: partnerName || 'Resident',
          subject: d.title?.rendered || 'No Subject',
          content: d.content?.rendered?.replace(/<[^>]+>/g, '') || '',
          date: d.date,
          unread_count: d.unread_count || 0,
          stationery_id: d.stationery_id || 'airmail',
          is_sent_by_me: isSentByMe
        };
      });
    } else {
      letters = MOCK_LETTERS;
    }
    loading = false;
  });

  const inboxUsers = $derived(
    Object.values(
      letters.reduce((acc, letter) => {
        if (!acc[letter.partner_id]) {
          acc[letter.partner_id] = {
            partner_id: letter.partner_id,
            partner_name: letter.partner_name,
            latest_date: letter.date,
            unread_count: 0,
            has_received: false,
            has_sent: false
          };
        }
        acc[letter.partner_id].unread_count += letter.unread_count;
        if (letter.is_sent_by_me) {
          acc[letter.partner_id].has_sent = true;
        } else {
          acc[letter.partner_id].has_received = true;
        }
        if (new Date(letter.date) > new Date(acc[letter.partner_id].latest_date)) {
          acc[letter.partner_id].latest_date = letter.date;
        }
        return acc;
      }, {} as Record<number, any>)
    )
    .filter((u: any) => {
      if (searchQuery && !u.partner_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (activeCategory === "Unread" && u.unread_count === 0) return false;
      if (activeCategory === "Inbox" && !u.has_received) return false;
      if (activeCategory === "Outbox" && !u.has_sent) return false;
      return true;
    })
    .sort((a: any, b: any) => new Date(b.latest_date).getTime() - new Date(a.latest_date).getTime())
  );

  const activeUserLetters = $derived(
    letters.filter(l => l.partner_id === activeChatPartner?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );

  const loadUserLetters = (partnerId: number, partnerName: string) => {
    activeChatPartner = { id: partnerId, name: partnerName };
    view = "user-letters";
  };

  const loadLetter = async (letter: Letter) => {
    activeLetter = letter;
    activeChatPartner = { id: letter.partner_id, name: letter.partner_name };
    view = "chat";
    messages = [];
    
    // The main letter is treated as message 0 conceptually, but let's build the array 
    // so `mainLetter` and `replies` logic still works smoothly
    const mainMsg: Message = {
      id: letter.id,
      sender_id: letter.partner_id, // If I wrote it, it would be 0, but mock logic simplified here
      content: letter.content,
      date: letter.date,
      is_read: true,
    };
    
    let fetchedComments: Message[] = [];
    if (isProUser()) {
      const commentsData = await fetchComments(letter.id);
      fetchedComments = commentsData.map((c: any) => ({
        id: c.id,
        sender_id: c.author,
        content: c.content?.rendered?.replace(/<[^>]+>/g, '') || '',
        date: c.date,
        is_read: true
      }));
    } else {
      fetchedComments = MOCK_COMMENTS.filter(m => m.thread_id === letter.id);
    }
    
    messages = [mainMsg, ...fetchedComments];
    
    // Reset dialogue state
    visibleRepliesCount = 1;
  };

  const loadNewChat = async () => {
    view = "new-recipient";
    selectedRecipient = null;
    if (isProUser()) {
      users = await fetchNookUsers();
    } else {
      users = MOCK_USERS;
    }
  };

  const handleSelectRecipient = (user: any) => {
    selectedRecipient = user;
    view = "new-stationery";
  };

  const handleSelectStationery = (stationery: any) => {
    selectedStationery = stationery;
    newSubject = "";
    newMessage = "";
    view = "new-draft";
  };

  const handleSend = async () => {
    if (!newMessage.trim() || (!activeLetter && !selectedRecipient)) return;
    
    sending = true;
    if (isProUser()) {
      if (view === "new-draft") {
        // Creating a new Post/Letter
        const subject = newSubject.trim() || 'No Subject';
        const result = await createPrivateLetter(selectedRecipient.ID, subject, newMessage, selectedStationery.id);
        
        if (result && result.id) {
          const newLetter = {
            id: result.id,
            partner_id: selectedRecipient.ID,
            partner_name: selectedRecipient.display_name,
            subject: subject,
            content: newMessage,
            date: result.date || new Date().toISOString(),
            unread_count: 0,
            stationery_id: selectedStationery.id,
            is_sent_by_me: true
          };
          letters = [newLetter, ...letters];
          activeChatPartner = { id: selectedRecipient.ID, name: selectedRecipient.display_name };
          view = "user-letters";
        } else {
          // Fallback if API fails but we still want to simulate success for the user temporarily
          const newLetter = {
            id: Date.now(),
            partner_id: selectedRecipient.ID,
            partner_name: selectedRecipient.display_name,
            subject: subject,
            content: newMessage,
            date: new Date().toISOString(),
            unread_count: 0,
            stationery_id: selectedStationery.id,
            is_sent_by_me: true
          };
          letters = [newLetter, ...letters];
          activeChatPartner = { id: selectedRecipient.ID, name: selectedRecipient.display_name };
          view = "user-letters";
        }
      } else if (activeLetter) {
        // Replying (creating a comment)
        const result = await createComment(activeLetter.id, newMessage);
        if (result) {
          messages = [...messages, {
            id: Date.now(), // Optimistic ID
            sender_id: nookState.passport.name ? 0 : 0, 
            content: newMessage,
            date: new Date().toISOString(),
            is_read: false
          }];
          newMessage = "";
        }
      }
    } else {
      // Mock send
      if (view === "new-draft") {
        const subject = newSubject.trim() || 'No Subject';
        const newLetter = {
          id: Date.now(),
          partner_id: selectedRecipient.ID,
          partner_name: selectedRecipient.display_name,
          subject: subject,
          content: newMessage,
          date: new Date().toISOString(),
          unread_count: 0,
          stationery_id: selectedStationery.id,
          is_sent_by_me: true
        };
        letters = [newLetter, ...letters];
        activeChatPartner = { id: selectedRecipient.ID, name: selectedRecipient.display_name };
        view = "user-letters";
      } else if (activeLetter) {
        messages = [...messages, {
          id: Date.now(),
          sender_id: 0, 
          content: newMessage,
          date: new Date().toISOString(),
          is_read: false
        }];
        newMessage = "";
      }
    }
    sending = false;
  };

  const filteredUsers = $derived(users.filter(u => u.display_name.toLowerCase().includes(searchQuery.toLowerCase())));

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  // --- Dialogue / Thread State ---
  let visibleRepliesCount = $state(1);

  function handleBubbleClick(msg: any, index: number) {
    if (index === visibleRepliesCount - 1) {
      if (visibleRepliesCount < replies.length) {
        visibleRepliesCount++;
        if (nookState.settings.soundEffects) {
          import('@/lib/audio').then(({ playSound }) => playSound('dialogue_next'));
        }
      }
    }
  }

  const mainLetterContent = $derived(messages.length > 0 ? messages[0] : null);
  const replies = $derived(messages.length > 1 ? messages.slice(1) : []);
  const visibleReplies = $derived(replies.slice(0, visibleRepliesCount));
  
  const getStationery = (id?: string) => {
    return STATIONERY_OPTIONS.find(s => s.id === id) || STATIONERY_OPTIONS[0];
  }
</script>

<style>
  /* Premium Animated Bubble Background */
  .animated-bg {
    background: linear-gradient(-45deg, #2b1a1a, #5c2a2a, #8b3a3a, #3d1c1c);
    background-size: 400% 400%;
    animation: gradientBG 15s ease infinite;
    position: relative;
    overflow: hidden;
  }
  
  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animated-bg::before, .animated-bg::after {
    content: '';
    position: absolute;
    width: 150vw;
    height: 150vw;
    background: radial-gradient(circle, rgba(139, 58, 58, 0.15) 0%, transparent 60%);
    animation: float 20s infinite linear;
    pointer-events: none;
    z-index: 0;
  }
  .animated-bg::before {
    top: -50%;
    left: -50%;
  }
  .animated-bg::after {
    bottom: -50%;
    right: -50%;
    animation-direction: reverse;
    animation-duration: 25s;
  }

  @keyframes float {
    0% { transform: rotate(0deg) translate(20px) rotate(0deg); }
    100% { transform: rotate(360deg) translate(20px) rotate(-360deg); }
  }

  /* Envelope Item Style */
  .envelope-item {
    background-color: #fcfaf5;
    position: relative;
    border: 2px solid #e1d9be;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(139, 58, 58, 0.1);
    overflow: hidden;
  }
  
  .envelope-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    /* Create an envelope flap crease effect */
    background: 
      linear-gradient(to bottom right, transparent 49.5%, rgba(225, 217, 190, 0.4) 50%, transparent 50.5%) 0 0 / 50% 40px no-repeat,
      linear-gradient(to bottom left, transparent 49.5%, rgba(225, 217, 190, 0.4) 50%, transparent 50.5%) 100% 0 / 50% 40px no-repeat;
    pointer-events: none;
    z-index: 1;
  }
  
  .envelope-item::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: repeating-linear-gradient(
      45deg,
      #8b3a3a,
      #8b3a3a 15px,
      transparent 15px,
      transparent 30px,
      #4a5e78 30px,
      #4a5e78 45px,
      transparent 45px,
      transparent 60px
    );
    opacity: 0.8;
  }
</style>

  <NookAppTemplate 
    title={view === "inbox" ? "Messages" : (view === "chat" || view === "user-letters") ? activeChatPartner?.name : view.startsWith("new") ? "Write a Letter" : ""}
    subtitle={view === "inbox" ? "Direct Messages" : view === "user-letters" ? "All Letters" : view === "new-recipient" ? "Select Recipient" : view === "new-stationery" ? "Pick Stationery" : ""}
    bgClass="bg-[#8b3a3a] animated-bg"
    headerBgClass="bg-[#8b3a3a]"
    headerTextClass="text-white"
    searchThemeColorClass="text-[#8b3a3a]"
    searchFocusBorderClass="focus:border-[#8b3a3a]"
    categoryActiveBgClass="bg-[#8b3a3a]"
    categoryInactiveTextClass="text-[#8b3a3a]/60 hover:text-[#8b3a3a]"
    categoryLabelBgClass="bg-[#8b3a3a]"
    categoriesPosition="top"
    categories={view === "inbox" ? categories : []}
    bind:activeCategory={activeCategory}
    bind:searchTerm={searchQuery}
    showSearch={view === "inbox"}
    getCategoryIcon={getCategoryIcon}
  >
    {#snippet iconSnippet()}
      {#if view !== 'inbox'}
        <NookToolbarButton onclick={() => {
          if (view === 'new-draft') view = 'new-stationery';
          else if (view === 'new-stationery') view = 'new-recipient';
          else if (view === 'new-recipient') view = 'inbox';
          else if (view === 'chat') view = 'user-letters';
          else if (view === 'user-letters') view = 'inbox';
          else view = 'inbox';
        }} title="Back">
          <ArrowLeft class="w-5 h-5 stroke-[2.5px] text-white" />
        </NookToolbarButton>
      {:else}
        <div class="w-12 h-12 mr-1">
          <NookIcon name="mail" class="w-full h-full object-contain drop-shadow-sm" />
        </div>
      {/if}
    {/snippet}
    
    {#snippet headerActions()}
      {#if view === "inbox"}
        <NookToolbarButton 
          variant="ghost"
          onclick={loadNewChat}
        >
          <Plus class="w-4 h-4 text-white" />
        </NookToolbarButton>
      {/if}
      <NookToolbarButton variant="ghost" onclick={ctx.handleHomeButton} title="Close App"><X class="w-3.5 h-3.5 stroke-[3px] text-white" /></NookToolbarButton>
    {/snippet}

  <!-- VIEWS -->
  <div class="flex-1 overflow-hidden relative z-10 bg-transparent">
    {#if view === "inbox"}
      <div in:fade={{duration: 200}} class="h-full overflow-y-auto ac-scrollbar p-3 space-y-2">
        {#if !isProUser()}
          <div class="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-xl text-xs font-bold text-center mb-3">
            Preview Mode: DMs require a Pro (Logged in) account.
          </div>
        {/if}

        {#if loading}
          <div class="text-center text-gray-400 p-10 text-xs font-bold animate-pulse">Loading...</div>
        {:else if inboxUsers.length === 0}
          <div class="text-center text-gray-400 p-10 flex flex-col items-center">
            <MessageSquare class="w-8 h-8 mb-2 opacity-50" />
            <span class="text-xs font-bold">No messages yet.</span>
          </div>
        {:else}
          {#each inboxUsers as user}
            <button
              onclick={() => loadUserLetters(user.partner_id, user.partner_name)}
              class="envelope-item w-full p-4 pt-5 pb-5 flex items-center gap-3 text-left hover:border-[#8b3a3a] hover:shadow-[0_8px_20px_rgba(139,58,58,0.2)] transition-all cursor-pointer active:scale-95 group"
            >
              <!-- Wax Seal Avatar -->
              <div class="w-12 h-12 rounded-full bg-[#8b3a3a] text-[#fcfaf5] border-2 border-[#6a2c2c] shadow-inner flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform relative z-10" style="box-shadow: inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.1);">
                <div class="absolute inset-0 rounded-full border border-white/20"></div>
                👤
              </div>
              <div class="flex-1 min-w-0 relative z-10">
                <div class="flex justify-between items-baseline mb-0.5">
                  <span class="font-extrabold text-[15px] text-[#4c4637] truncate drop-shadow-sm">{user.partner_name}</span>
                  <!-- Stamp for date -->
                  <div class="bg-white/80 px-2 py-0.5 border border-dashed border-[#dcd3be] text-[9px] font-bold text-[#8a7f66] shrink-0 rotate-2">
                    {formatDate(user.latest_date)}
                  </div>
                </div>
              </div>
              {#if user.unread_count > 0}
                <div class="absolute top-2 right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 shadow-md z-10 border-2 border-white">
                  {user.unread_count}
                </div>
              {/if}
            </button>
          {/each}
        {/if}
      </div>
    {/if}

    <!-- USER LETTERS LIST VIEW -->
    {#if view === 'user-letters'}
      <div in:fly={{x: 20, duration: 200}} class="h-full overflow-y-auto p-4 flex flex-col gap-3">
        {#if activeUserLetters.length === 0}
          <div class="text-center text-[#8a7f66] p-10 text-xs font-bold">No letters found.</div>
        {:else}
          <div class="grid grid-cols-2 gap-3">
            {#each activeUserLetters as letter}
              {@const stationery = getStationery(letter.stationery_id)}
              <button
                onclick={() => loadLetter(letter)}
                class={`w-full aspect-[3/4] rounded-lg shadow-sm flex flex-col p-3 text-left relative transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer ${stationery.bgClass}`}
                style={stationery.style}
              >
                <div class="text-[10px] font-bold text-[#4c4637]/60 mb-2 truncate border-b border-[#4c4637]/10 pb-1 flex justify-between">
                  <span>{formatDate(letter.date)}</span>
                  <span class={letter.is_sent_by_me ? 'text-blue-600/70' : 'text-green-700/70'}>{letter.is_sent_by_me ? 'To' : 'From'}</span>
                </div>
                <div class="text-[12px] font-black text-[#4c4637] mb-1 truncate leading-tight">
                  {letter.subject}
                </div>
                <div class="flex-1 overflow-hidden">
                  <p class="text-[11px] font-medium leading-relaxed text-[#4c4637] m-0" style="font-family: 'Comic Sans MS', cursive, sans-serif; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;">
                    {letter.content}
                  </p>
                </div>
                {#if letter.unread_count > 0}
                  <div class="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shadow-md border-2 border-white">
                    {letter.unread_count}
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    
    {:else if view === "new-recipient"}
      <div in:fly={{y: 20, duration: 200}} class="h-full flex flex-col bg-white">
        <div class="p-3 border-b border-gray-100 sticky top-0 bg-white z-10 shrink-0">
          <div class="relative">
            <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              bind:value={searchQuery}
              placeholder="Search Residents..." 
              class="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-9 pr-4 text-xs font-bold text-[#4c4637] focus:outline-none focus:border-[#8b3a3a] focus:bg-white transition"
            />
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-2">
          {#each filteredUsers as user}
            <button
              onclick={() => handleSelectRecipient(user)}
              class="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-xl cursor-pointer text-left border-0 bg-transparent transition active:bg-gray-100"
            >
              <div class="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                {user.display_name.charAt(0).toUpperCase()}
              </div>
              <span class="font-bold text-sm text-[#4c4637]">{user.display_name}</span>
            </button>
          {/each}
        </div>
      </div>

    {:else if view === "new-stationery"}
      <div in:fly={{x: 20, duration: 200}} class="h-full flex flex-col bg-amber-50">
        <div class="p-4 text-center font-bold text-[#8b3a3a] text-sm shrink-0">
          Select Stationery
        </div>
        <div class="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4">
          {#each STATIONERY_OPTIONS as opt}
            <button 
              class={`aspect-[3/4] rounded-lg shadow-sm flex items-center justify-center cursor-pointer transition hover:scale-105 active:scale-95 border-2 ${selectedStationery?.id === opt.id ? 'border-[#8b3a3a] shadow-md' : 'border-transparent'} ${opt.bgClass}`}
              style={opt.style}
              onclick={() => handleSelectStationery(opt)}
            >
              <span class="bg-white/70 px-2 py-1 rounded text-xs font-bold text-[#4c4637] backdrop-blur-sm">{opt.name}</span>
            </button>
          {/each}
        </div>
      </div>

    {:else if view === "new-draft"}
      <div in:fly={{y: 20, duration: 200}} class="h-full flex flex-col items-center justify-center p-6" style="background: rgba(0,0,0,0.4);">
        <div 
          class={`w-full max-w-sm aspect-[3/4] rounded-lg shadow-2xl flex flex-col p-6 ${selectedStationery.bgClass} relative`}
          style={selectedStationery.style}
        >
          <div class="font-bold text-[#4c4637] mb-2 shrink-0 border-b border-[#4c4637]/10 pb-2 flex justify-between items-center">
            <span>To: {selectedRecipient?.display_name}</span>
          </div>
          <input
            type="text"
            bind:value={newSubject}
            placeholder="Subject..."
            class="w-full bg-transparent border-none font-black text-sm text-[#4c4637] placeholder-[#4c4637]/40 focus:outline-none mb-2"
          />
          <textarea
            bind:value={newMessage}
            placeholder="Write your letter here..."
            class="w-full flex-1 bg-transparent border-none resize-none font-medium leading-relaxed text-[#4c4637] placeholder-[#4c4637]/40 focus:outline-none ac-scrollbar"
            style="font-family: 'Comic Sans MS', cursive, sans-serif;"
          ></textarea>
          
          <button 
            onclick={handleSend}
            disabled={!newMessage.trim() || sending}
            class="absolute -bottom-4 right-4 bg-[#8b3a3a] text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-[#6a2c2c] disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
          >
            <Send class="w-4 h-4" /> Send
          </button>
        </div>
      </div>

    {:else if view === "chat"}
      <div in:fly={{x: 20, duration: 200}} class="h-full flex flex-col">
        <!-- Messages Area (Thread) -->
        <div class="flex-1 overflow-y-auto p-4 flex flex-col items-center gap-6 pb-20">
          {#if activeLetter}
            {@const stationery = getStationery(activeLetter.stationery_id)}
            <!-- Main Letter -->
            <div 
              class={`w-full max-w-sm aspect-[3/4] rounded-lg shadow-md flex flex-col p-6 ${stationery.bgClass} relative mt-2`}
              style={stationery.style}
            >
              <div class="font-bold text-[#4c4637] mb-2 shrink-0 border-b border-[#4c4637]/10 pb-2">
                {activeLetter.is_sent_by_me ? 'To:' : 'From:'} {activeLetter.partner_name}
              </div>
              <div class="font-black text-sm text-[#4c4637] mb-2">
                {activeLetter.subject}
              </div>
              <div class="flex-1 font-medium leading-relaxed text-[#4c4637] overflow-y-auto ac-scrollbar whitespace-pre-wrap" style="font-family: 'Comic Sans MS', cursive, sans-serif;">
                {activeLetter.content}
              </div>
              <div class="text-right text-[10px] font-bold text-[#4c4637]/50 mt-4">
                {formatDate(activeLetter.date)}
              </div>
            </div>
          {/if}

          <!-- Replies (Comments) -->
          {#if replies.length > 0}
            <div class="w-full max-w-sm flex flex-col gap-3">
              <div class="text-center w-full my-2">
                <span class="bg-black/10 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">Replies</span>
              </div>
              {#each visibleReplies as msg, index (msg.id)}
                {@const isMe = (!isProUser() && msg.sender_id === 0) || (isProUser() && msg.sender_id !== activeChatPartner?.id)}
                <div class="w-full flex flex-col mb-4" in:fly={{y: 20, duration: 300}}>
                  <button
                    class="w-full text-left bg-transparent border-0 p-0 cursor-pointer focus:outline-none"
                    onclick={() => handleBubbleClick(msg, index)}
                  >
                    <AcnhBubble 
                      title={isMe ? 'Me' : activeChatPartner?.name} 
                      dialogText={msg.content}
                    >
                      {#if index === visibleRepliesCount - 1 && visibleRepliesCount < replies.length}
                        <div class="w-full flex justify-end mt-2 pr-2">
                          <div class="w-3 h-3 rounded-full bg-[#F1AE04] animate-ping opacity-80"></div>
                        </div>
                      {/if}
                    </AcnhBubble>
                  </button>
                  <div class={`text-[9px] font-bold text-[#8a7f66] mt-1 px-4 ${isMe ? 'text-right' : 'text-left'}`}>
                    {formatDate(msg.date)} {isMe ? (msg.is_read ? '· Read' : '· Sent') : ''}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Input Area (Only show if all replies are visible) -->
        {#if visibleRepliesCount > replies.length || replies.length === 0}
          <div in:fly={{y: 20, duration: 300}} class="p-4 bg-white/80 backdrop-blur-md border-t border-white/50 shrink-0 flex gap-3 items-end shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-20 absolute bottom-0 left-0 right-0">
            <textarea
              bind:value={newMessage}
              placeholder="Write a reply..."
              rows="1"
              class="flex-1 bg-white border-2 border-[#e6e2d3] rounded-3xl py-3 px-4 text-[13px] font-bold resize-none focus:outline-none focus:border-[#8b3a3a] focus:ring-4 focus:ring-[#8b3a3a]/20 transition-all ac-scrollbar max-h-24 shadow-inner"
              onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            ></textarea>
            <button 
              onclick={handleSend}
              disabled={!newMessage.trim() || sending}
              class="bg-gradient-to-br from-[#8b3a3a] to-[#6a2c2c] text-white p-3 rounded-full cursor-pointer hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 h-11 w-11 shadow-[0_4px_10px_rgba(139,58,58,0.3)]"
            >
              <Send class="w-5 h-5 -ml-0.5 stroke-[2.5px]" />
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  </NookAppTemplate>
