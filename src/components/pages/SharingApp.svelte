<script lang="ts">
  import NookAppTemplate from '@/components/organisms/NookAppTemplate.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import { Share, ArrowLeft, Link as LinkIcon, Check } from '@lucide/svelte';
  import nookState from '@/lib/nookState.svelte';

  const ctx = getPhoneContext();
  let shareStatus = $state('');

  const handleBack = () => {
    nookState.navigate('home');
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My NookPhone',
          text: 'Check out my NookPhone!',
          url: window.location.href,
        });
        shareStatus = 'Shared successfully!';
      } else {
        await navigator.clipboard.writeText(window.location.href);
        shareStatus = 'Link copied to clipboard!';
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Only show error if it wasn't just the user cancelling
      if ((err as Error).name !== 'AbortError') {
        shareStatus = 'Failed to share.';
      }
    }
    setTimeout(() => { shareStatus = ''; }, 3000);
  };
</script>

<NookAppTemplate
  title="Sharing"
  subtitle="Connect & Share"
  bgClass="bg-[#fdfcf5]"
  textClass="text-[#5c3a21]"
  headerBgClass="bg-[#d97c55]"
  headerTextClass="text-white"
  showBottomNav={false}
>
  {#snippet iconSnippet()}
    <div class="w-12 h-12 mr-1 flex items-center justify-center bg-white/20 rounded-2xl">
      <Share class="w-7 h-7 text-white" />
    </div>
  {/snippet}

  {#snippet headerActions()}
    <NookToolbarButton onclick={handleBack} title="Back Home">
      <ArrowLeft class="w-4 h-4 text-[#5c3a21]" />
    </NookToolbarButton>
  {/snippet}

  <div class="flex-1 overflow-y-auto p-4 ac-scrollbar flex flex-col items-center justify-center gap-6 text-center">
    
    <div class="bg-white rounded-3xl p-6 border-4 border-[#edd8aa] shadow-sm flex flex-col items-center gap-4 text-sm leading-relaxed text-[#5c5446] w-full max-w-sm">
      <div class="w-24 h-24 bg-[#d97c55] rounded-[2rem] flex items-center justify-center mb-2 shadow-inner border-4 border-white">
        <Share class="w-12 h-12 text-white" />
      </div>
      
      <h3 class="text-xl font-black text-[#5c3a21] m-0">Share Your Phone</h3>
      <p class="m-0 text-base">
        Send a link to your NookPhone to your friends so they can see your apps and island details!
      </p>

      <button 
        onclick={handleShare}
        class="mt-4 w-full py-4 px-6 bg-[#d97c55] hover:bg-[#c26d4a] text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-sm border-b-4 border-[#9c5132] flex items-center justify-center gap-2"
      >
        <LinkIcon class="w-5 h-5" />
        Share Link
      </button>

      {#if shareStatus}
        <div class="mt-2 text-[#7cb988] font-bold flex items-center gap-1 justify-center animate-bounce">
          <Check class="w-4 h-4" /> {shareStatus}
        </div>
      {/if}
    </div>
    
  </div>
</NookAppTemplate>
