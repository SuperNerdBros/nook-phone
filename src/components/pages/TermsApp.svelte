<script lang="ts">
  import NookAppTemplate from '@/components/organisms/NookAppTemplate.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import { ArrowLeft, FileText } from '@lucide/svelte';
  import nookState from '@/lib/nookState.svelte';

  const ctx = getPhoneContext();

  const handleBack = () => {
    nookState.navigate('settings');
  };
</script>

<NookAppTemplate
  title="Terms of Service"
  subtitle="NookOS Guidelines"
  bgClass="bg-[#fdfcf5]"
  textClass="text-[#4c4637]"
  headerBgClass="bg-[#d2b373]"
  headerTextClass="text-white"
  showBottomNav={false}
>
  {#snippet iconSnippet()}
    <div class="w-12 h-12 mr-1 flex items-center justify-center bg-white/20 rounded-2xl">
      <FileText class="w-7 h-7 text-white" />
    </div>
  {/snippet}

  {#snippet headerActions()}
    <NookToolbarButton onclick={handleBack} title="Back to Settings">
      <ArrowLeft class="w-4 h-4 text-[#4c4637]" />
    </NookToolbarButton>
  {/snippet}

  <div class="flex-1 overflow-y-auto p-4 ac-scrollbar flex flex-col gap-4">
    <div class="bg-white rounded-3xl p-6 border-4 border-[#edd8aa] shadow-sm flex flex-col gap-4 text-sm leading-relaxed text-[#5c5446]">
      <h3 class="text-base font-black text-[#5c3a21] border-b-2 border-dashed border-[#edd8aa] pb-1 m-0">1. Free vs PRO Accounts</h3>
      <p class="m-0">
        NookOS provides two tiers of service for our getaways:
      </p>
      <ul class="m-0 pl-5 flex flex-col gap-1 list-disc">
        <li><strong>Free Plan:</strong> Includes local use of core applications (Camera, Map, Passport, Critterpedia, DIY Recipes, Settings, Dodo Air, Rescue Service).</li>
        <li><strong>PRO Membership:</strong> Unlocks advanced multiplayer applications (Direct Messaging/DMs, Resident Bulletin Board, Best Friends networks), XP progression leveling, and active Bells (GP) syncing.</li>
      </ul>

      <h3 class="text-base font-black text-[#5c3a21] border-b-2 border-dashed border-[#edd8aa] pb-1 m-0">2. Terms of Use</h3>
      <p class="m-0">
        All residents are expected to maintain good neighborly conduct. Prohibited behaviors include:
      </p>
      <ul class="m-0 pl-5 flex flex-col gap-1 list-disc">
        <li>Tampering with Dodo Airlines flight schedules or spoofing Dodo Codes.</li>
        <li>Uploading offensive content or copyright-infringing custom design pixel grids.</li>
        <li>Attempting to bypass PRO restrictions or modify gold coin (Bells) count via illegal exploits.</li>
      </ul>

      <h3 class="text-base font-black text-[#5c3a21] border-b-2 border-dashed border-[#edd8aa] pb-1 m-0">3. Service Plan Payments</h3>
      <p class="m-0">
        House expansions, infrastructure upgrades, and bridges are subject to standard service plan payments. While the service plan has 0% interest, we reserve the right to prompt you via the Resident Services kiosk until paid in full.
      </p>

      <h3 class="text-base font-black text-[#5c3a21] border-b-2 border-dashed border-[#edd8aa] pb-1 m-0">4. Service Changes</h3>
      <p class="m-0">
        Nook Inc. reserves the right to modify NookOS applications, add new Nook Miles goals, or adjust the shop catalog prices at Nook's Cranny at any time.
      </p>
    </div>
  </div>
</NookAppTemplate>
