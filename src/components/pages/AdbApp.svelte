<script lang="ts">
  import nookState from '@/lib/nookState.svelte';
  
  // Format numbers with commas
  const formatBells = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleDepositClick = () => {
    nookState.addNotification(
      "Patreon Link", 
      "The Patreon tier linking system ($5, $10, $100) is currently under construction. Stay tuned!", 
      "Tom Nook"
    );
  };

  const handleWithdrawalClick = () => {
    nookState.addNotification(
      "Withdrawal Error", 
      "Withdrawals are currently disabled. You owe me too many Bells to be taking them out, yes, yes!", 
      "Tom Nook"
    );
  };
</script>

<div class="w-full h-full relative overflow-hidden bg-[#d9f6af] flex flex-col items-center select-none font-['Varela_Round']">
  
  <!-- Background Waves (Top and Bottom) -->
  <div class="absolute inset-0 z-0 pointer-events-none flex flex-col justify-between opacity-60">
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" class="w-full h-[15%] text-[#ecfcce] fill-current">
      <path d="M0,0 L100,0 L100,10 Q50,20 0,10 Z" />
    </svg>
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" class="w-full h-[15%] text-[#ecfcce] fill-current rotate-180">
      <path d="M0,0 L100,0 L100,10 Q50,20 0,10 Z" />
    </svg>
  </div>
  
  <!-- Subtle Coin Pattern Overlay -->
  <div class="absolute inset-0 z-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle, #000 2px, transparent 2.5px); background-size: 30px 30px;"></div>

  <!-- Header Section -->
  <div class="w-full z-10 flex flex-col items-center pt-12 relative px-4">
    <p class="text-[#499a22] text-sm text-center font-bold px-4 max-w-[280px] leading-tight mb-4">
      Please make a selection from the menu below.
    </p>
    
    <!-- Floating Pocket Balance -->
    <div class="absolute top-4 right-4 bg-[#c8985c] rounded-full border-4 border-white px-3 py-1 flex items-center shadow-sm">
      <img 
        src="https://acnhapi.com/v1/icons/items/bell_bag" 
        alt="Bells" 
        class="w-5 h-5 mr-1 drop-shadow-md" 
        onerror={(e) => { (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.4 7.8 8.2 8.3 8.9C6.3 10.5 5 13 5 16C5 19.9 8.1 23 12 23C15.9 23 19 19.9 19 16C19 13 17.7 10.5 15.7 8.9C16.2 8.2 16.5 7.4 16.5 6.5C16.5 4 14.5 2 12 2Z"/></svg>' }}
      >
      <span class="text-white font-bold text-lg leading-none mt-0.5">{formatBells(nookState.bells)}</span>
    </div>
  </div>

  <!-- Center Card: Balances -->
  <div class="w-[90%] bg-white rounded-[40px] px-6 py-6 mt-4 shadow-sm z-10 border border-[#e2e2e2]">
    
    <!-- Loan Balance -->
    <div class="flex justify-between items-end border-b-2 border-[#e6f9cd] pb-2 mb-3">
      <span class="text-[#c1c1c1] font-bold text-[15px]">Loan Balance</span>
      <div class="flex items-end">
        <span class="text-[#c1c1c1] font-bold text-2xl leading-none">0</span>
        <span class="text-[#c1c1c1] font-bold text-xs ml-1 mb-[2px]">Bells</span>
      </div>
    </div>
    
    <!-- Savings Balance -->
    <div class="flex justify-between items-end pt-1">
      <span class="text-[#499a22] font-bold text-[15px]">Savings Balance</span>
      <div class="flex items-end">
        <span class="text-[#499a22] font-bold text-2xl leading-none">{formatBells(nookState.bells)}</span>
        <span class="text-[#499a22] font-bold text-xs ml-1 mb-[2px]">Bells</span>
      </div>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex flex-col gap-4 mt-12 w-[75%] z-10">
    <!-- Deposit Button -->
    <button 
      class="group relative w-full h-[52px] rounded-full overflow-hidden shadow-sm transition-transform active:scale-95"
      onclick={handleDepositClick}
      aria-label="Deposit"
    >
      <div class="absolute inset-0 bg-[#83d325]" style="background-image: repeating-linear-gradient(-45deg, transparent, transparent 15px, rgba(0,0,0,0.06) 15px, rgba(0,0,0,0.06) 30px);"></div>
      <!-- Inner dark green border effect -->
      <div class="absolute inset-0 rounded-full border-[3px] border-[#72bc20] opacity-50 m-[2px] pointer-events-none"></div>
      
      <div class="relative h-full flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25510e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-80"><path d="M12 2v14M8 12l4 4 4-4M3 20h18"/></svg>
        <span class="text-[#25510e] font-extrabold text-[17px] tracking-wide mt-0.5">Deposit</span>
      </div>

      <!-- Pointing Hand Hover Effect -->
      <div class="absolute left-[-15px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-200 pointer-events-none">
        <span class="text-3xl drop-shadow-md">👉</span>
      </div>
    </button>

    <!-- Withdrawal Button -->
    <button 
      class="w-full h-[52px] rounded-full overflow-hidden shadow-sm transition-transform active:scale-95 relative"
      onclick={handleWithdrawalClick}
      aria-label="Withdrawal"
    >
      <div class="absolute inset-0 bg-[#83d325]" style="background-image: repeating-linear-gradient(-45deg, transparent, transparent 15px, rgba(0,0,0,0.06) 15px, rgba(0,0,0,0.06) 30px);"></div>
      <div class="absolute inset-0 rounded-full border-[3px] border-[#72bc20] opacity-50 m-[2px] pointer-events-none"></div>
      
      <div class="relative h-full flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25510e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-80"><path d="M12 22V8M8 12l4-4 4 4M3 4h18"/></svg>
        <span class="text-[#25510e] font-extrabold text-[17px] tracking-wide mt-0.5">Withdrawal</span>
      </div>
    </button>
  </div>

  <!-- Bottom Hint text -->
  <div class="absolute bottom-6 right-6 flex gap-4 text-[#8a987e] font-bold text-sm z-10">
    <div class="flex items-center gap-1 opacity-80"><span class="bg-[#8a987e] text-[#d9f6af] rounded-full w-5 h-5 flex items-center justify-center text-xs pb-0.5">B</span> Sign Off</div>
    <div class="flex items-center gap-1 opacity-80"><span class="bg-[#8a987e] text-[#d9f6af] rounded-full w-5 h-5 flex items-center justify-center text-xs pb-0.5">A</span> Select</div>
  </div>

</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');
</style>
