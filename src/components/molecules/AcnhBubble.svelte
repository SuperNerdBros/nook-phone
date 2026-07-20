<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, onDestroy } from 'svelte';

	let {
		title = 'Tom Nook',
		children,
		onDismiss,
		dialogText = '',
		isActive = true,
		class: className = 'mx-auto w-full max-w-none',
		textDone = $bindable(false),
		playSound,
		compact = false,
		badgeBg = '',
		badgeColor = '',
		linkText = '',
		postLinkText = '',
		onLinkClick
	}: {
		title?: string;
		children?: Snippet;
		onDismiss?: () => void;
		dialogText?: string;
		isActive?: boolean;
		class?: string;
		textDone?: boolean;
		playSound?: () => void;
		compact?: boolean;
		badgeBg?: string;
		badgeColor?: string;
		linkText?: string;
		postLinkText?: string;
		onLinkClick?: () => void;
	} = $props();

	let fullText = $derived(dialogText + (linkText || '') + (postLinkText || ''));

	const CHARACTER_COLORS: Record<string, { bg: string; text: string }> = {
		'Tom Nook': { bg: '#22c55e', text: '#ffffff' },
		'Timmy': { bg: '#16a34a', text: '#ffffff' },
		'Tommy': { bg: '#16a34a', text: '#ffffff' }
	};

	let characterKey = $derived(title.split(/[\s\[]/)[0]?.trim() === 'Tom' ? 'Tom Nook' : title);
	let colors = $derived(CHARACTER_COLORS[characterKey] || { bg: '#dd8530', text: '#482016' });

	let typedText = $state('');
	let textTimer: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		if (fullText && isActive) {
			startTypewriter(fullText);
		} else if (!isActive) {
			if (textTimer) clearInterval(textTimer);
			typedText = '';
			textDone = false;
		}
	});

	onMount(() => {
		if (!dialogText && playSound) {
			playSound();
		}
	});

	onDestroy(() => {
		if (textTimer) clearInterval(textTimer);
	});

	function startTypewriter(fullText: string) {
		if (textTimer) clearInterval(textTimer);
		typedText = '';
		textDone = false;
		let idx = 0;

		textTimer = setInterval(() => {
			if (idx < fullText.length) {
				typedText += fullText[idx];
				idx++;
				if (playSound && fullText[idx - 1] !== ' ' && idx % 2 === 0) {
					playSound();
				}
			} else {
				if (textTimer) clearInterval(textTimer);
				textDone = true;
			}
		}, 22);
	}
</script>

{#if isActive}
	<div class="pointer-events-auto dialogue {compact ? 'dialogue-compact' : ''} {className}">
		<div class="dialogue-blobs drop-shadow-lg relative">
			<div class="dialogue-blob-top"></div>
			<div class="dialogue-blob-bottom"></div>

			<div class="dialogue-text">
				{#if dialogText}
					<div class="flex gap-4 items-start relative z-10">
						<!-- Animated / Typed Dialogue Text -->
						<div class="flex-1 py-1">
							<p class={compact ? "text-base sm:text-lg text-[#807256] leading-snug font-bold italic" : "text-xl sm:text-2xl text-[#807256] leading-snug font-medium min-h-[3.6rem]"}>
								{#if linkText}
									<span>{typedText.substring(0, dialogText.length)}{#if typedText.length > dialogText.length}<a href="javascript:void(0)" onclick={onLinkClick} class="text-[#eb6a9d] hover:text-[#c94d7d] underline cursor-pointer transition-colors inline decoration-[1.5px]">{typedText.substring(dialogText.length, dialogText.length + linkText.length)}</a>{/if}{#if typedText.length > dialogText.length + linkText.length}{typedText.substring(dialogText.length + linkText.length)}{/if}</span>
								{:else}
									{typedText}
								{/if}
								{#if !textDone}
									<span class="inline-block w-1.5 h-5 bg-[#807256] animate-pulse ml-0.5 align-middle"></span>
								{/if}
							</p>
							{@render children?.()}
						</div>
					</div>
				{:else}
					{@render children?.()}
				{/if}
			</div>
		</div>

		{#if title}
			<div class="dialogue-character-wrap">
				<div class="dialogue-character" style="background-color: {badgeBg || colors.bg}; color: {badgeColor || colors.text};">
					{title}
				</div>
			</div>
		{/if}

		{#if onDismiss}
			<button class="dialogue-arrow group" aria-label="Dismiss Dialog" onclick={onDismiss}>
				<svg width="45" height="25" viewBox="0 0 45 25" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-transform group-active:scale-95">
					<path d="M22.5 25C18.0184 25 7.59473 12.6404 1.55317 4.96431C-0.122281 2.83559 1.72264 -0.179893 4.39835 0.243337C10.2831 1.17415 18.2164 2.28736 22.5 2.28736C26.7836 2.28736 34.7169 1.17415 40.6017 0.243339C43.2774 -0.17989 45.1223 2.83559 43.4468 4.96431C37.4053 12.6404 26.9816 25 22.5 25Z" fill="#F1AE04" />
				</svg>
			</button>
		{/if}
	</div>
{/if}

<style>
	.dialogue-compact {
		min-height: 80px !important;
	}
	.dialogue-compact :global(.dialogue-text) {
		padding: 1.25rem 1.5rem 1.25rem 2rem !important;
	}
</style>
