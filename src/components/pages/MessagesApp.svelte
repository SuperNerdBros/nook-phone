<script lang="ts">
  import { onMount } from 'svelte';
  import nookState from '@/lib/nookState.svelte';
  import { fetchConversations, fetchDirectMessages, sendDirectMessage, fetchNookUsers } from '@/lib/api';

  let conversations = $state<any[]>([]);
  let users = $state<any[]>([]);
  let activeChat = $state<number | null>(null);
  let messages = $state<any[]>([]);
  let newMessage = $state('');

  onMount(async () => {
    conversations = await fetchConversations();
    users = await fetchNookUsers();
  });
</script>

<div class="flex flex-col h-full bg-[#f9f8f2] ac-app-screen">
  <div class="bg-[#8bd168] text-white p-3 pt-5 ac-wavy-header shadow-sm shrink-0 flex justify-between items-center z-10">
    <div class="flex items-center gap-2">
      <h1 class="text-lg font-black m-0 drop-shadow-sm uppercase tracking-wider">Messages</h1>
    </div>
  </div>

  <div class="flex-1 p-4 flex flex-col justify-center items-center text-center">
    <h2 class="font-extrabold text-[#4c4637]">Coming Soon</h2>
    <p class="text-xs text-gray-500 mt-2">The UI for Direct Messages will be built here.</p>
  </div>
</div>
