<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingScreen from '$lib/LoadingScreen.svelte';
	import Stage1 from '$lib/Stage1.svelte';
	import Header from '$lib/Header.svelte';
	import {
		type Save,
		rectifySave,
		blankSave,
		readSaveFromLocalStorage,
		writeSaveToLocalStorage,
		updateSave
	} from '$lib/game-save';

	let loading = $state(true);
	let stage1: Stage1;

	function load(save: Save): void {
		stage1.importSave(rectifySave(save));
	}

	function save(): Save {
		return updateSave(blankSave(), stage1.exportSave());
	}

	if (import.meta.hot) {
		// reload save from local storage after hot reload in dev.
		import.meta.hot.on('vite:afterUpdate', () => {
			load(readSaveFromLocalStorage());
		});
	}

	onMount(async () => {
		load(readSaveFromLocalStorage());

		setInterval(() => {
			writeSaveToLocalStorage(save());
		}, 1000);

		loading = false;
	});
</script>

{#if loading}
	<LoadingScreen />
{/if}

<Header {load} {save} />

<div>
	<Stage1 bind:this={stage1} />
</div>

<style lang="scss">
	@use '$lib/colors.scss' as *;

	:global(html) {
		background-color: v(12%);
		color: #fff;
	}

	:global(button) {
		padding: 0.3rem;
		margin: 0.2rem;

		touch-action: manipulation;

		border: 0.1rem solid;
		border-radius: 0.2rem;

		background-color: v(20%);
		border-color: v(40%);
		color: v(100%);

		&:hover {
			background-color: v(36%);
			border-color: v(72%);
		}

		&:active {
			background-color: v(42%);
			border-color: v(86%);
		}

		&:disabled {
			background-color: v(16%);
			border-color: v(24%);
			color: sv(5%, 50%);
		}
	}

	:global(input) {
		padding: 0.3rem;
		margin: 0.2rem;

		border: 0.1rem solid;
		border-radius: 0.2rem;

		background-color: v(16%);
		border-color: v(40%);
		color: #fff;

		&:hover {
			border-color: v(52%);
		}

		&:disabled {
			border-color: v(24%);
		}
	}

	:global(hr) {
		border: 0.1rem solid;
		border-radius: 0.2rem;
		border-color: v(36%) v(24%) v(24%);
	}

	div {
		margin: 0 auto;
		max-width: 50rem;
		padding: 0 1rem;
	}
</style>
