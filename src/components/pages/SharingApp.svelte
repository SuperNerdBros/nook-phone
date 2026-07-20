<script lang="ts">
  import NookAppTemplate from "@/components/organisms/NookAppTemplate.svelte";
  import NookToolbarButton from "../molecules/NookToolbarButton.svelte";
  import { getPhoneContext } from "@/components/organisms/phoneContext.svelte";
  import { ArrowLeft, Copy, Check } from "@lucide/svelte";
  import nookState from "@/lib/nookState.svelte";
  import sharingIcon from "@/assets/img/NH-Icon-Nook_Phone-Sharing.png";
  import { resolveAssetUrl } from "@/lib/utils";

  const ctx = getPhoneContext();
  let shareStatus = $state("");

  const handleBack = () => {
    nookState.navigate(null);
  };

  const copyToClipboard = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Fallback copy failed", err);
          throw new Error("Copy failed");
        }
        document.body.removeChild(textArea);
      }
      shareStatus = "Link copied!";
    } catch (err) {
      shareStatus = "Failed to copy.";
    }
    setTimeout(() => {
      shareStatus = "";
    }, 3000);
  };

  const shareToPlatform = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Check out my NookPhone!");
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "reddit":
        shareUrl = `https://reddit.com/submit?url=${url}&title=${text}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
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
      <img
        src={resolveAssetUrl(sharingIcon)}
        alt="Sharing"
        class="w-8 h-8 object-contain"
      />
    </div>
  {/snippet}

  {#snippet headerActions()}
    <NookToolbarButton
      onclick={handleBack}
      title="Back Home"
    >
      <ArrowLeft class="w-4 h-4 text-[#5c3a21]" />
    </NookToolbarButton>
  {/snippet}

  <div
    class="flex-1 overflow-y-auto p-4 ac-scrollbar flex flex-col items-center justify-center gap-6 text-center"
  >
    <div
      class="bg-white rounded-3xl p-6 border-4 border-[#edd8aa] shadow-sm flex flex-col items-center gap-4 text-sm leading-relaxed text-[#5c5446] w-full max-w-sm"
    >
      <div
        class="w-24 h-24 bg-[#d97c55] rounded-[2rem] flex items-center justify-center mb-2 shadow-inner border-4 border-white p-3"
      >
        <img
          src={resolveAssetUrl(sharingIcon)}
          alt="Sharing Icon"
          class="w-full h-full object-contain filter drop-shadow-md"
        />
      </div>

      <h3 class="text-xl font-black text-[#5c3a21] m-0">Share the NookPhone</h3>
      <p class="m-0 text-base mb-2">Send our NookPhone to your friends!</p>

      <div class="w-full flex flex-col gap-3">
        <button
          onclick={copyToClipboard}
          class="w-full py-3 px-4 bg-[#7cb988] hover:bg-[#68a474] text-white rounded-2xl font-black text-base transition-all active:scale-95 shadow-sm border-b-4 border-[#568a60] flex items-center gap-3"
        >
          <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Copy class="w-5 h-5" />
          </div>
          <span class="flex-1 text-left">Copy to Clipboard</span>
          {#if shareStatus}
            <Check class="w-5 h-5 animate-bounce" />
          {/if}
        </button>

        <button
          onclick={() => shareToPlatform("twitter")}
          class="w-full py-3 px-4 bg-[#1da1f2] hover:bg-[#1a91da] text-white rounded-2xl font-black text-base transition-all active:scale-95 shadow-sm border-b-4 border-[#167bb8] flex items-center gap-3"
        >
          <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path
                d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"
              ></path></svg
            >
          </div>
          <span class="flex-1 text-left">Share on X / Twitter</span>
        </button>

        <button
          onclick={() => shareToPlatform("facebook")}
          class="w-full py-3 px-4 bg-[#1877f2] hover:bg-[#156cdb] text-white rounded-2xl font-black text-base transition-all active:scale-95 shadow-sm border-b-4 border-[#1056b0] flex items-center gap-3"
        >
          <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
              ></path></svg
            >
          </div>
          <span class="flex-1 text-left">Share on Facebook</span>
        </button>

        <button
          onclick={() => shareToPlatform("reddit")}
          class="w-full py-3 px-4 bg-[#ff4500] hover:bg-[#e03d00] text-white rounded-2xl font-black text-base transition-all active:scale-95 shadow-sm border-b-4 border-[#b83200] flex items-center gap-3"
        >
          <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><circle
                cx="12"
                cy="12"
                r="10"
              ></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line
                x1="9"
                y1="9"
                x2="9.01"
                y2="9"
              ></line><line
                x1="15"
                y1="9"
                x2="15.01"
                y2="9"
              ></line></svg
            >
          </div>
          <span class="flex-1 text-left">Share on Reddit</span>
        </button>
      </div>
    </div>
  </div>
</NookAppTemplate>
