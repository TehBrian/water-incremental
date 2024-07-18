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
			background-color: hsl(250, 10%, 12%);
			color: #fff;
		}

		button {
			padding: 0.3rem;
			margin: 0.2rem;

			touch-action: manipulation;

			border-radius: 0.2rem;
			border: 0.1rem solid;

			background-color: hsl(250, 10%, 20%);
			border-color: hsl(250, 10%, 40%);
			color: #fff;

			&:hover {
				background-color: hsl(250, 10%, 36%);
				border-color: hsl(250, 10%, 72%);
			}

			&:active {
				background-color: hsl(250, 10%, 42%);
				border-color: hsl(250, 10%, 86%);
			}

			&:disabled {
				background-color: hsl(250, 10%, 16%);
				border-color: hsl(250, 10%, 24%);
			}
		}

		input {
			padding: 0.3rem;
			margin: 0.2rem;

			border-radius: 0.2rem;
			border: 0.1rem solid;

			background-color: hsl(250, 10%, 16%);
			border-color: hsl(250, 10%, 40%);
			color: #fff;

			&:hover {
				border-color: hsl(250, 10%, 52%);
			}

			&:disabled {
				border-color: hsl(250, 10%, 24%);
			}
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
