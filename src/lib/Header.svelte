<script lang="ts">
	function importSave() {
	}

	function exportSave() {
	}
</script>

<div class="back">
	<div class="container">
		<div class="flex">
			<span>Water Incremental</span>
			<div>
				<button onclick={importSave}>Import Save</button>
				<button onclick={exportSave}>Export Save</button>
			</div>
		</div>
	</div>
</div>

<style>
	.back {
		background-color: #1a1a1f;
		overflow: hidden;
	}

	.container {
		max-width: 50rem;
		margin: 0 auto;
		padding: 0.5rem 1rem;
	}

	.flex {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
