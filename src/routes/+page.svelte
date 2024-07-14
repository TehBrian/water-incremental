<script lang="ts">
	import { onMount } from 'svelte';

	type Save = {
		hasBoughtBottle: boolean;
		hasFilledBottle: boolean;
		hasSoldBottle: boolean;
		money: number;
		emptyBottles: number;
		filledBottles: number;
		soldBottles: number;
		brandName: string | null;
	};

	function exportSave(): Save {
		return {
			hasBoughtBottle: hasBoughtBottle,
			hasFilledBottle: hasFilledBottle,
			hasSoldBottle: hasSoldBottle,
			money: money,
			emptyBottles: emptyBottles,
			filledBottles: filledBottles,
			soldBottles: soldBottles,
			brandName: brandName
		} satisfies Save;
	}

	function importSave(save: Save) {
		hasFilledBottle = save.hasFilledBottle;
		hasBoughtBottle = save.hasBoughtBottle;
		hasSoldBottle = save.hasSoldBottle;
		money = save.money;
		emptyBottles = save.emptyBottles;
		filledBottles = save.filledBottles;
		soldBottles = save.soldBottles;
		brandName = save.brandName;
	}

	function emptySave() {
		return {
			hasBoughtBottle: false,
			hasFilledBottle: false,
			hasSoldBottle: false,
			money: 5,
			emptyBottles: 0,
			filledBottles: 0,
			soldBottles: 0,
			brandName: null
		} satisfies Save;
	}

	const itemKey = 'water-incremental-save';

	function writeSave(): void {
		localStorage.setItem(itemKey, JSON.stringify(exportSave()));
		console.log('Wrote save to local storage.');
	}

	function readSave(): void {
		const item = localStorage.getItem(itemKey);
		if (item !== null) {
			importSave(JSON.parse(item));
			console.log('Read save from local storage.');
		} else {
			importSave(emptySave());
			console.log('Found no save in local storage.');
		}
	}

	onMount(async () => {
		readSave();
		setInterval(() => writeSave(), 1000);
	});

	let hasBoughtBottle = $state(false);
	let hasFilledBottle = $state(false);
	let hasSoldBottle = $state(false);

	let money = $state(5);
	let emptyBottles = $state(0);
	let filledBottles = $state(0);
	let soldBottles = $state(0);

	let luxuriousBusiness = $derived(soldBottles >= 80);
	let momDividends = $derived(soldBottles >= 150);
	let canLabelBottles = $derived(soldBottles >= 220);
	let wantFriend = $derived(soldBottles >= 300);
	let wantRobot = $derived(soldBottles >= 400);
	let cityUpset = $derived(soldBottles >= 500);
	let canFillBottle = $derived(emptyBottles < 1 || (momDividends && money < 0.1));

	let brandName: string | null = $state(null);
	let brandNameInput: HTMLInputElement | null = $state(null);

	function if1(count: number, singular: string, plural: string) {
		return count == 1 ? singular : plural;
	}

	function sIf1(count: number) {
		return if1(count, '', 's');
	}
</script>

{#if wantFriend}
	<p>All this purchasing, filling, and selling is getting really exhausting.</p>
	<p>You're thinking you can get some friends to help you with your business.</p>
{:else if brandName}
	<p>
		With your new-found brand name of {brandName}, you've been able to successfully mark up your
		bottled tap water from $0.50 to $0.80.
	</p>
{:else if canLabelBottles}
	<p>
		Your water bottles have become so popular amongst the running community that you figure you can
		purchase labeled bottles with your brand.
	</p>
	<p>And, of course, mark up the price thanks to brand recognition.</p>
	<p>What will your brand name be?</p>
	<input bind:this={brandNameInput} />
	<button
		onclick={() => {
			if (brandNameInput) {
				brandName = brandNameInput.value;
			}
		}}>Let's do it.</button
	>
{:else if momDividends}
	<p>
		Your mom is proud to have raised a little entrepreneur, but she's worried that you'll run up the
		water bill.
	</p>
	<p>
		She proposes that you can keep business running if you pay her $0.10 for every bottle you fill.
	</p>
{:else if luxuriousBusiness}
	<p>
		This is turning out to be quite the luxurious business. You're basically rolling in cash, now.
	</p>
{:else}
	<p>Your mom gave you $5 for your birthday.</p>
	<p>
		You figure you can make some quick cash by selling water bottles filled from the tap to thirsty
		passersby on the street.
	</p>
{/if}
<hr />
<p>
	You have ${money.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}.
</p>
<button
	disabled={money < 5}
	onclick={() => {
		money -= 5;
		emptyBottles += 15;
		hasBoughtBottle = true;
	}}
>
	Purchase 15-pack of empty{#if brandName}, {brandName}-branded{/if} bottles.<br />Costs $5.
</button>
{#if hasBoughtBottle}
	<p>You have {emptyBottles} empty bottle{sIf1(emptyBottles)}.</p>
	<button
		disabled={canFillBottle}
		onclick={() => {
			emptyBottles -= 1;
			filledBottles += 1;
			hasFilledBottle = true;
			if (momDividends) {
				money -= 0.1;
			}
		}}
	>
		Fill bottle with tap water.
		{#if momDividends}
			<br />Costs $0.10.
		{/if}
	</button>
{/if}
{#if hasFilledBottle}
	<p>You have {filledBottles} filled bottle{sIf1(filledBottles)}.</p>
	<button
		disabled={filledBottles < 1}
		onclick={() => {
			filledBottles -= 1;
			soldBottles += 1;
			if (brandName) {
				money += 0.8;
			} else {
				money += 0.5;
			}
			hasSoldBottle = true;
		}}
	>
		Sell bottle to thirsty passerby.<br />Earns ${#if brandName}0.80{:else}0.50{/if}.
	</button>
{/if}
{#if hasSoldBottle}
	<p>You've sold {soldBottles} filled bottle{sIf1(soldBottles)}.</p>
{/if}
