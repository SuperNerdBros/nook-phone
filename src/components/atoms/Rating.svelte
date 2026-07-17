<script lang="ts">
  import { Star } from '@lucide/svelte';

  let { 
    rating = $bindable(0), 
    readonly = false, 
    max = 5,
    size = 20,
    class: className = ""
  } = $props<{ 
    rating?: number; 
    readonly?: boolean; 
    max?: number; 
    size?: number;
    class?: string;
  }>();

  let hoverRating = $state(0);

  function handleMouseOver(index: number) {
    if (!readonly) {
      hoverRating = index;
    }
  }

  function handleMouseLeave() {
    if (!readonly) {
      hoverRating = 0;
    }
  }

  function handleClick(index: number) {
    if (!readonly) {
      rating = index;
    }
  }
</script>

<div 
  class="flex items-center gap-1 {className} {readonly ? '' : 'cursor-pointer'}" 
  onmouseleave={handleMouseLeave}
  role="group"
  aria-label="Rating component"
>
  {#each Array(max) as _, i}
    {@const starValue = i + 1}
    {@const isFilled = (hoverRating || rating) >= starValue}
    <button
      type="button"
      class="p-0 bg-transparent border-none outline-none focus:outline-none transition-transform hover:scale-110 active:scale-95 disabled:hover:scale-100 disabled:opacity-80"
      disabled={readonly}
      onclick={() => handleClick(starValue)}
      onmouseover={() => handleMouseOver(starValue)}
      onfocus={() => handleMouseOver(starValue)}
      aria-label="{starValue} Star"
    >
      <Star 
        {size} 
        strokeWidth={2}
        class="transition-colors duration-200 {isFilled ? 'fill-yellow-400 text-yellow-500' : 'fill-transparent text-gray-400'}"
      />
    </button>
  {/each}
</div>
