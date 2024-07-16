<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingScreen from '$lib/LoadingScreen.svelte';
    import Stage1 from '$lib/Stage1.svelte';

	onMount(async () => {
		loading = false;
	});

	let loading = $state(true);
</script>

{#if loading}
	<LoadingScreen />
{/if}

<Stage1 />
