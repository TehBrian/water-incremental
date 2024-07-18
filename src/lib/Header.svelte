<script lang="ts">
	let { load, save }: { load: (save: Save) => void; save: () => Save } = $props();

	import { type Save, encodeSave, decodeSave } from '$lib/game-save';

	function importSave() {
		let input = prompt('Input your save.');

		if (input === null) {
			// user canceled.
			return;
		}

		if (input === '') {
			alert('No save inputted.');
			return;
		}

		try {
			let save: Save = decodeSave(input);
			console.log('Read save from input.');
			load(save);
		} catch (e) {
			console.error('Failed to read save from input.', e);
			console.log('Assuming misformatted save.');
			alert('Failed to read save from input.');
		}
	}

	function exportSave() {
		navigator.clipboard
			.writeText(encodeSave(save()))
			.then(() => {
				alert('Exported current save to your clipboard.');
			})
			.catch(() => {
				alert('Failed to export save to your clipboard.');
			});
	}
</script>

<div class="back">
	<div class="container">
		<div class="flex">
			<div class="flex">
				<img src="drop.svg" alt="Water Incremental" />
				<span>Water Incremental</span>
			</div>
			<div class="flex">
				<button onclick={importSave}>Import Save</button>
				<button onclick={exportSave}>Export Save</button>
			</div>
		</div>
	</div>
</div>

<style>
	img {
		margin-bottom: 0.4rem;
		margin-right: 0.7rem;
		width: auto;
		height: 60%;
	}

	.back {
		background-color: hsl(250, 10%, 16%);
		overflow: hidden;
	}

	.container {
		margin: 0 auto;
		padding: 0.5rem 1rem;
		max-width: 50rem;
		height: 3rem;
	}

	.flex {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
