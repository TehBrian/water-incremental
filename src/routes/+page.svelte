<script lang="ts">
	import { onMount } from 'svelte';
	import lz from 'lz-string';

	const version = 2;

	type Save = {
		version: number;
		hasBoughtBottle: boolean;
		hasFilledBottle: boolean;
		wasBoughtOut: boolean;
		hasSoldBottle: boolean;
		hasAskedFriend: boolean;
		money: number;
		emptyBottles: number;
		filledBottles: number;
		soldBottles: number;
		brandName: string | null;
	};

	function exportSave(): Save {
		return {
			version: version,
			hasBoughtBottle,
			hasFilledBottle,
			wasBoughtOut,
			hasSoldBottle,
			hasAskedFriend,
			money,
			emptyBottles,
			filledBottles,
			soldBottles,
			brandName
		} satisfies Save;
	}

	function importSave(save: Save) {
		({
			hasFilledBottle,
			hasBoughtBottle,
			hasSoldBottle,
			wasBoughtOut,
			hasAskedFriend,
			money,
			emptyBottles,
			filledBottles,
			soldBottles,
			brandName
		} = save);
	}

	function emptySave() {
		return {
			version: version,
			hasBoughtBottle: false,
			hasFilledBottle: false,
			wasBoughtOut: false,
			hasSoldBottle: false,
			hasAskedFriend: false,
			money: 5,
			emptyBottles: 0,
			filledBottles: 0,
			soldBottles: 0,
			brandName: null
		} satisfies Save;
	}

	const itemKey = 'water-incremental-save';

	function writeSave(): void {
		localStorage.setItem(itemKey, lz.compressToBase64(JSON.stringify(exportSave())));
		console.log('Wrote save to local storage.');
	}

	function isJson(str: string) {
		try {
			return JSON.parse(str) && !!str;
		} catch (e) {
			return false;
		}
	}

	function readSave(): void {
		const item = localStorage.getItem(itemKey);
		if (item !== null) {
			if (isJson(item)) {
				// old save format! kill 'em.
				console.log('Found old save in local storage.');
				let save: Save = emptySave();
				importSave(save);
				wasBoughtOut = true;
				money = 25;
			} else {
				console.log('Read save from local storage.');
				let save: Save = JSON.parse(lz.decompressFromBase64(item));
				importSave(save);
			}
		} else {
			console.log('Found no save in local storage.');
			let save: Save = emptySave();
			importSave(save);
		}
	}

	let lastSale: number | null;
	function tick(now: number) {
		if (hasAskedFriend && filledBottles > 0) {
			if (!lastSale) lastSale = now;
			const delta = now - lastSale;
			if (delta >= 1000) {
				soldBottles += 1;
				filledBottles -= 1;
				money += soldBottlePrice;
				lastSale = now;
			}
		}

		requestAnimationFrame(tick);
	}

	onMount(async () => {
		readSave();
		setInterval(() => writeSave(), 1000);
		requestAnimationFrame(tick);
		loading = false;
	});

	let loading = $state(true);

	let hasBoughtBottle = $state(false);
	let hasFilledBottle = $state(false);
	let hasSoldBottle = $state(false);
	let hasAskedFriend = $state(false);
	let wasBoughtOut = $state(false);

	let money = $state(5);
	let emptyBottles = $state(0);
	let filledBottles = $state(0);
	let soldBottles = $state(0);

	let luxuriousBusiness = $derived(soldBottles >= 50);
	let momDividends = $derived(soldBottles >= 110);
	let canLabelBottles = $derived(soldBottles >= 170);
	let wantFriend = $derived(soldBottles >= 210);
	let canFillBottle = $derived(emptyBottles < 1 || (momDividends && money < 0.1));

	let brandName: string | null = $state(null);
	let brandNameInput: HTMLInputElement | null = $state(null);

	let emptyBottleCost = $derived(brandName ? 7 : 5);
	let soldBottlePrice = $derived(brandName ? 0.8 : 0.5);

	function if1(count: number, singular: string, plural: string) {
		return count == 1 ? singular : plural;
	}

	function sIf1(count: number) {
		return if1(count, '', 's');
	}

	function currency(value: number) {
		if (value % 1 === 0) {
			// whole number.
			return value.toLocaleString('en-US', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
		}
		return value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
	}
	let c = currency;
</script>

{#if loading}
	<div id="loading-screen">
		<p id="loading-text">Loading! &lt;3</p>
	</div>
{/if}

{#if hasAskedFriend}
	<p>Your friend, Robert, has agreed to help you sell bottles.</p>
	<p>
		Better yet, he'll do it for free! He sure is a real one. What a benevolent young man. (His mom
		told him he has to because she thinks he has too few friends.)
	</p>
	<p>He'll sell about 1 bottle per second.</p>
{:else if wantFriend}
	<p>All this purchasing, filling, and selling is growing exhausting.</p>
	<p>You feel that you can get some friends to help you with your business.</p>
	<button
		onclick={() => {
			hasAskedFriend = true;
		}}
	>
		Ask a friend.
	</button>
{:else if brandName}
	<p>
		With your new-found brand name of {brandName}, you've marked up your bottled tap water from
		$0.50 to $0.80.
	</p>
{:else if canLabelBottles}
	<p>
		Your water bottles have become so popular amongst the running community that you figure you can
		purchase (slightly more expensive) labeled bottles with your brand on them.
	</p>
	<p>And, of course, mark up the price thanks to brand recognition.</p>
	<p>What will your brand name be?</p>
	<input bind:this={brandNameInput} />
	<button
		onclick={() => {
			if (brandNameInput) {
				brandName = brandNameInput.value;
			}
		}}
	>
		Let's do it.
	</button>
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
{:else if wasBoughtOut}
	<p>Good news! Your previous water bottle company was purchased by Nestlé.</p>
	<p>
		Although you are young and naive, they definitely, totally did not financially take advantage of
		you!
	</p>
	<p>They generously gave you a whole <em>✨ ~ $25 ~ ✨</em>!</p>
	<p>Still, the possibility of making even more quick cash appeals to you.</p>
{:else}
	<p>Your mom gave you $5 for your birthday.</p>
	<p>
		You figure you can make some quick cash by selling water bottles filled from the tap to thirsty
		passersby on the street.
	</p>
{/if}

<hr />

<p>You have ${c(money)}.</p>
<button
	disabled={money < emptyBottleCost}
	onclick={() => {
		money -= emptyBottleCost;
		emptyBottles += 15;
		hasBoughtBottle = true;
	}}
>
	Purchase 15-pack of empty{#if brandName}, {brandName}-branded{/if} bottles.
	<br />
	Costs ${c(emptyBottleCost)}.
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
			<br />
			Costs $0.10.
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
			money += soldBottlePrice;
			hasSoldBottle = true;
		}}
	>
		Sell bottle to thirsty passerby.
		<br />
		Earns ${c(soldBottlePrice)}.
	</button>
{/if}

{#if hasSoldBottle}
	<p>
		{#if hasAskedFriend}You (and your friends) have{:else}You've{/if} sold {soldBottles}
		filled bottle{sIf1(soldBottles)}.
	</p>
{/if}

<style>
	#loading-screen {
		background-color: #1c1b21;

		width: 100%;
		height: 100%;

		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}

	#loading-text {
		text-align: center;
		font-size: 8rem;
	}
</style>
