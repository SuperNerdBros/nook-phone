<script lang="ts">
  import NookAppTemplate from '@/components/organisms/NookAppTemplate.svelte';
  import NookToolbarButton from '../molecules/NookToolbarButton.svelte';
  import { getPhoneContext } from '@/components/organisms/phoneContext.svelte';
  import { ArrowLeft, Shield } from '@lucide/svelte';
  import nookState from '@/lib/nookState.svelte';

  const ctx = getPhoneContext();

  const handleBack = () => {
    nookState.navigate('settings');
  };
</script>

<NookAppTemplate
  title="Privacy Policy"
  subtitle="NookOS Security"
  bgClass="bg-[#eef8f6]"
  textClass="text-[#1e3d37]"
  headerBgClass="bg-[#5caba0]"
  headerTextClass="text-white"
  showBottomNav={false}
>
  {#snippet iconSnippet()}
    <div class="w-12 h-12 mr-1 flex items-center justify-center bg-white/20 rounded-2xl">
      <Shield class="w-7 h-7 text-white" />
    </div>
  {/snippet}

  {#snippet headerActions()}
    <NookToolbarButton onclick={handleBack} title="Back to Settings">
      <ArrowLeft class="w-4 h-4 text-[#1e3d37]" />
    </NookToolbarButton>
  {/snippet}

  <div class="flex-1 overflow-y-auto p-4 ac-scrollbar flex flex-col gap-4">
    <div class="bg-white rounded-3xl p-6 border-4 border-[#bedad4] shadow-sm flex flex-col gap-4 text-sm leading-relaxed text-[#2d5c56]">
      <h3 class="text-base font-black text-[#1e3d37] border-b-2 border-dashed border-[#bedad4] pb-1 m-0">1. Data We Collect</h3>
      <p class="m-0">
        To provide a seamless getaway package experience, NookOS stores and processes your parameters locally on your browser and securely syncs them with our Resident Services WordPress servers:
      </p>
      <ul class="m-0 pl-5 flex flex-col gap-1 list-disc">
        <li><strong>Resident Passport:</strong> We save your character name, title, island name, hemisphere, friend code, and passport photo.</li>
        <li><strong>Collection Tracking:</strong> We log your unlocked DIY recipes, caught bugs, fish, and sea creatures, and Nook Shopping catalog purchases.</li>
        <li><strong>Item Inventory:</strong> We store your items marked as "In Storage", "Wishlist", or "For Trade" to sync your trade networks.</li>
        <li><strong>Bells & XP Sync:</strong> We track your active Bells balances (GP) and XP progression points which are saved directly onto your YouMeOS player profile.</li>
        <li><strong>Direct Messaging:</strong> DMs sent between Best Friends are securely stored on our servers as private message logs.</li>
      </ul>

      <h3 class="text-base font-black text-[#1e3d37] border-b-2 border-dashed border-[#bedad4] pb-1 m-0">2. Free vs PRO Data Policies</h3>
      <p class="m-0">
        We handle data differently depending on your residency plan:
      </p>
      <ul class="m-0 pl-5 flex flex-col gap-1 list-disc">
        <li><strong>Free Plan:</strong> All gameplay progress (DIYs, Critters, settings) is stored locally in your browser cache. Minimal data is saved on the servers.</li>
        <li><strong>PRO Membership:</strong> Enables full cloud synchronization of your Bells, XP progression levels, chat room sublogs, direct message channels, and app review history.</li>
      </ul>

      <h3 class="text-base font-black text-[#1e3d37] border-b-2 border-dashed border-[#bedad4] pb-1 m-0">3. Data Sharing & Security</h3>
      <p class="m-0">
        We do NOT sell or distribute your island coordinates, inventory lists, or message transcripts to third-party balloon entities. DMs are encrypted in transit and only readable by the sender and receiver.
      </p>

      <h3 class="text-base font-black text-[#1e3d37] border-b-2 border-dashed border-[#bedad4] pb-1 m-0">4. Resident Cookies & Cache</h3>
      <p class="m-0">
        NookOS uses local browser storage cookies to remember your wallpaper preferences, custom pixel designs, ringtone settings, and to keep your phone session unlocked.
      </p>
    </div>
  </div>
</NookAppTemplate>
