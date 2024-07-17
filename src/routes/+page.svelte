<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingScreen from '$lib/LoadingScreen.svelte';
	import Stage1 from '$lib/Stage1.svelte';
	import Header from '$lib/Header.svelte';
	import { activeSave, updateActiveSave, readActiveSave, writeActiveSave } from '$lib/game-save';

	let loading = $state(true);
	let stage1: Stage1;

	onMount(async () => {
		readActiveSave();
		stage1.importSave(activeSave);

		setInterval(() => {
			updateActiveSave(stage1.exportSave());
			writeActiveSave();
		}, 1000);

		loading = false;
	});
</script>

{#if loading}
	<LoadingScreen />
{/if}

<Header />

<div class="stage1">
	<Stage1 bind:this={stage1} />
</div>

<svelte:head>
	<style>
		html {
			color-scheme: dark;
			background-color: #1c1b21;
		}

		button {
			touch-action: manipulation;
			padding: 0.3rem;
			margin: 0.2rem;
		}

		input {
			padding: 0.3rem;
		}
	</style>
</svelte:head>

<style>
	div {
		margin: 0 auto;
		max-width: 50rem;
		padding: 0 1rem;
	}
</style>
