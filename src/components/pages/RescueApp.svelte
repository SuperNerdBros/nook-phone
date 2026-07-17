<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  import { ShieldAlert, Send, LifeBuoy, X } from '@lucide/svelte';
  import NookIcon from '../atoms/NookIcon.svelte';
  import NookAppHeader from '@/components/organisms/NookAppHeader.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';

  const ctx = getPhoneContext();
  let stage = $state<"form" | "sending" | "success">("form");
  
  let issueType = $state("Need Help");
  let message = $state("");
  let email = $state("");

  const submitSupportTicket = () => {
    if (!message.trim()) {
      nookState.addNotification("Rescue Service", "You gotta tell us what's wrong before we can send the chopper!", "Mr. Resetti");
      return;
    }
    stage = "sending";
    
    // Simulate sending an email/ticket
    setTimeout(() => {
      stage = "success";
    }, 2000);
  };
</script>

<div id="rescue-app" class="flex flex-col h-full ac-app-screen relative">
  <!-- Header -->
  <NookAppHeader 
    title="Rescue Service"
    subtitle="Support & Feedback"
    bgClass="bg-[#ec6241]"
    textClass="text-white"
  >
    {#snippet iconSnippet()}
      <div class="w-12 h-12 mr-1">
        <NookIcon name="rescue" class="w-full h-full object-contain drop-shadow-sm" />
      </div>
    {/snippet}
    {#snippet actions()}
      <button
        onclick={ctx.handleHomeButton}
        class="nook-header-btn"
        title="Close App"
      >
        <X class="w-3.5 h-3.5 stroke-[3px] text-red-500" />
      </button>
    {/snippet}
  </NookAppHeader>

  <div class="flex-1 overflow-y-auto p-4 ac-scrollbar flex flex-col bg-[#fffaf0]">
    {#if stage === "form"}
      <div class="flex flex-col gap-4 animate-fade-in pb-8">
        
        <!-- Operator Intro -->
        <div class="flex gap-3 bg-white p-3 rounded-2xl shadow-sm border border-[#f0e6d2]">
          <div class="w-10 h-10 shrink-0 bg-[#ca8a04]/20 border border-yellow-600 rounded-full flex items-center justify-center text-xl">
            ⛏️
          </div>
          <div class="flex flex-col justify-center">
            <span class="text-[9px] font-bold text-amber-700">SUPPORT OPERATOR:</span>
            <p class="text-[11px] font-semibold text-gray-700 leading-tight mt-0.5">
              Stuck? Found a bug? Need a feature? Fill out the form and I'll send a rescue chopper to help!
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-extrabold text-[#ca8a04] uppercase tracking-wider ml-1">Type of Rescue</label>
          <select 
            bind:value={issueType}
            class="bg-white border-2 border-[#f0e6d2] rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#ec6241] cursor-pointer"
          >
            <option>Need Help</option>
            <option>Bug Report</option>
            <option>Feature Request</option>
            <option>Feedback</option>
            <option>Other</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-extrabold text-[#ca8a04] uppercase tracking-wider ml-1">Email (Optional)</label>
          <input 
            type="email"
            bind:value={email}
            placeholder="For us to reply back"
            class="bg-white border-2 border-[#f0e6d2] rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#ec6241]"
          />
        </div>

        <div class="flex flex-col gap-1.5 flex-1">
          <label class="text-[10px] font-extrabold text-[#ca8a04] uppercase tracking-wider ml-1">Describe the Issue</label>
          <textarea 
            bind:value={message}
            placeholder="I was trying to..."
            rows="5"
            class="bg-white border-2 border-[#f0e6d2] rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#ec6241] resize-none"
          ></textarea>
        </div>

        <button
          onclick={submitSupportTicket}
          class="mt-2 bg-[#ec6241] hover:bg-[#d65233] active:scale-95 text-white font-extrabold px-6 py-3.5 rounded-2xl text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
        >
          <LifeBuoy class="w-4 h-4" /> Send SOS Signal
        </button>
      </div>
    {/if}

    {#if stage === "sending"}
      <div class="flex-1 flex flex-col items-center justify-center gap-4 text-center animate-fade-in min-h-[300px]">
        <div class="w-16 h-16 border-4 border-[#f0e6d2] border-t-[#ec6241] rounded-full animate-spin"></div>
        <p class="text-xs font-extrabold text-gray-500 animate-pulse">Dispatching Rescue Chopper...</p>
      </div>
    {/if}

    {#if stage === "success"}
      <div class="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in px-4 text-center min-h-[300px]">
        <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-emerald-200">
          🚁
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="font-extrabold text-[#1c4c1e] text-xl">SOS Received!</h2>
          <p class="text-xs text-gray-600 leading-relaxed font-semibold">
            Mr. Resetti has successfully received your message! If you provided an email, our support team will reach out to you shortly.
          </p>
        </div>

        <button
          onclick={() => { stage = "form"; message = ""; email = ""; }}
          class="mt-4 bg-[#8ec3b0] hover:bg-[#7ab19e] active:scale-95 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-sm transition-all cursor-pointer border-0"
        >
          Done
        </button>
      </div>
    {/if}
  </div>
</div>
