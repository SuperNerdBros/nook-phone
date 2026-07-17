<script lang="ts">
  import { Search } from '@lucide/svelte';

  let {
    value = $bindable(""),
    placeholder = "Search...",
    themeColorClass = "text-[#45a38f]",
    focusBorderClass = "focus:border-[#45a38f]",
    borderColorClass = "border-[#bedad4]",
    bgClass = "bg-[#fffdf5]",
    textClass = "text-[#2d5c56]"
  }: {
    value: string;
    placeholder?: string;
    themeColorClass?: string;
    focusBorderClass?: string;
    borderColorClass?: string;
    bgClass?: string;
    textClass?: string;
  } = $props();
</script>

<div class="relative drop-shadow-sm w-full">
  <Search class={`w-5 h-5 absolute left-4 top-3.5 ${themeColorClass}`} />
  <input
    type="text"
    placeholder={placeholder}
    bind:value={value}
    class={`w-full ${bgClass} pl-11 pr-4 py-3 rounded-2xl text-[13px] font-black border-4 ${borderColorClass} focus:outline-none ${focusBorderClass} ${textClass} placeholder:opacity-50 transition-colors shadow-inner`}
  />
</div>
