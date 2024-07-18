<script lang="ts">
	function importSave() {
	}

	function exportSave() {
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
		background-color: #1a1a1f;
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
