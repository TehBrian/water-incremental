<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingScreen from '$lib/LoadingScreen.svelte';
	import Stage1 from '$lib/Stage1.svelte';
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

<Stage1 bind:this={stage1} />
