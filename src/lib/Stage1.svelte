<script lang="ts">
	import { onMount } from 'svelte';
	import { type Save } from '$lib/game-save';
	import { currency as c, sIf1 } from '$lib/format';
	import Decimal from 'decimal.js';

	export function exportSave(): Partial<Save> {
		return {
			wasBoughtOut,
			money: money.toNumber(),
			hasBoughtBottle,
			emptyBottles,
			hasFilledBottle,
			filledBottles,
			hasSoldBottle,
			soldBottles,
			helpCount,
			brandName,
			hasRobert,
			robertSoldBottles,
			payingRobert,
			hasSpecialist,
			specialistSoldBottles,
			hasFiller,
			fillerFilledBottles
		};
	}

	export function importSave(save: Save) {
		({
			wasBoughtOut,
			hasBoughtBottle,
			emptyBottles,
			hasFilledBottle,
			filledBottles,
			hasSoldBottle,
			soldBottles,
			helpCount,
			brandName,
			hasRobert,
			robertSoldBottles,
			payingRobert,
			hasSpecialist,
			specialistSoldBottles,
			hasFiller,
			fillerFilledBottles
		} = save);

		money = new Decimal(save.money);
        lastAutoSale = null;
        lastFill = null;
	}

	let wasBoughtOut: boolean = $state(false);
	let money: Decimal = $state(new Decimal(5));
	let hasBoughtBottle: boolean = $state(false);
	let emptyBottles: number = $state(0);
	let hasFilledBottle: boolean = $state(false);
	let filledBottles: number = $state(0);
	let hasSoldBottle: boolean = $state(false);
	let soldBottles: number = $state(0);
	let helpCount: number = $state(0);
	let brandName: string | null = $state(null);
	let hasRobert: boolean = $state(false);
	let robertSoldBottles: number = $state(0);
	let payingRobert: boolean = $state(false);
	let hasSpecialist: boolean = $state(false);
	let specialistSoldBottles: number = $state(0);
	let hasFiller: boolean = $state(false);
	let fillerFilledBottles: number = $state(0);

	const luxuriousBusiness: boolean = $derived(soldBottles >= 50);
	const momDividends: boolean = $derived(soldBottles >= 110);
	const canBrand: boolean = $derived(soldBottles >= 170);
	const wantFriend: boolean = $derived(soldBottles >= 245);
	const wantFiller: boolean = $derived(specialistSoldBottles >= 160);
	const bottleSupplierHappy: boolean = $derived(fillerFilledBottles >= 420);

	const emptyBottleCost: number = $derived(brandName ? 6 : 5);
	const largeEmptyBottleCost: number = 30;
	const momDividendsCost: number = 0.1;
	const fillBottleCost: number = $derived(momDividends ? momDividendsCost : 0);
	const soldBottlePrice: number = $derived(brandName ? 0.8 : 0.5);
	const fillerCost: number = 200;
	const minEmptyBottlesForFiller: number = 10;

	const needsHelp: boolean = $derived(
		momDividends && money.lt(fillBottleCost) && filledBottles <= 0
	);
	const canFillBottle: boolean = $derived(emptyBottles > 0 && money.gte(fillBottleCost));
	const canSellBottle: boolean = $derived(filledBottles > 0);

	const robertBetter: boolean = $derived(robertSoldBottles >= 50);
	const robertGreedy: boolean = $derived(robertSoldBottles >= 130);
	const robertBest: boolean = $derived(robertSoldBottles >= 190);
	const robertRetired: boolean = $derived(robertSoldBottles >= 370);
	const robertActive: boolean = $derived(
		hasRobert && (!robertGreedy || payingRobert) && !robertRetired
	);

	const autoSalesPerSecond: number = $derived.by(() => {
		if (hasSpecialist) {
			return 4;
		}
		if (robertBest) {
			return 3;
		}
		if (robertBetter) {
			return 2;
		}
		if (hasRobert) {
			return 1;
		}
		return 0;
	});
	const robertGreedySkim: number = 0.15;
	const specialistSkim: number = 0.2;
	const autoSkim: number = $derived.by(() => {
		if (hasSpecialist) {
			return specialistSkim;
		}
		if (robertGreedy) {
			return robertGreedySkim;
		}
		return 0;
	});
	const autoIncomePerSecond = $derived(autoSalesPerSecond * (soldBottlePrice - autoSkim));

	const fillsPerSecond = 5;

	let brandNameInput: HTMLInputElement | null = $state(null);

	let autoSaleInterval: number = $derived(1000 / autoSalesPerSecond);
	let lastAutoSale: number | null;
	let fillInterval: number = $derived(1000 / fillsPerSecond);
	let lastFill: number | null;
	function tickAutoSale(now: number) {
		if (filledBottles <= 0) return;
		if (!robertActive && !hasSpecialist) return;

		if (!lastAutoSale) {
			lastAutoSale = now;
			return;
		}

		const delta = now - lastAutoSale;
		let elapsed = Math.floor(delta / autoSaleInterval); // intervals elapsed.
		if (!elapsed) return; // nothing to do. everything will be 0.
        let sold = Math.min(elapsed, filledBottles);
        
		filledBottles -= 1 * sold;
		soldBottles += 1 * sold;
		if (hasSpecialist) {
			specialistSoldBottles += 1 * sold;
		} else {
			robertSoldBottles += 1 * sold;
		}
		money = money.plus((soldBottlePrice - autoSkim) * sold);

		lastAutoSale += autoSaleInterval * sold;
	}

	function tickFill(now: number) {
		if (emptyBottles <= 0) return;
		if (money.lt(fillBottleCost)) return;
		if (!hasFiller) return;

		if (!lastFill) {
			lastFill = now;
			return;
		}

		const delta = now - lastFill;
		let elapsed = Math.floor(delta / fillInterval); // intervals elapsed.
		if (!elapsed) return; // nothing to do. everything will be 0.
        let filled = Math.min(elapsed, emptyBottles);

		emptyBottles -= 1 * filled;
		money = money.minus(fillBottleCost * filled);
		filledBottles += 1 * filled;
		fillerFilledBottles += 1 * filled;

		lastFill += fillInterval * filled;
	}

	function tick(now: number) {
		tickAutoSale(now);
		tickFill(now);
		requestAnimationFrame(tick);
	}

	onMount(async () => {
		requestAnimationFrame(tick);
	});

	let newShit: boolean = $state(false);
	let newShitTimeout: number | null = $state(null);

	function moreShit(_node: HTMLButtonElement, options: { delay: number } = { delay: 2 }) {
		newShit = true;
		newShitTimeout = setTimeout(() => {
			newShit = false;
		}, options.delay * 1000);
	}
</script>

{#if needsHelp}
	<p>Your mom notices that you've run out of cash.</p>

	{#if helpCount >= 7}
		<p>She blankly stares for a moment. She hands you another dollar while not saying a thing.</p>
		<button
			use:moreShit
			disabled={newShit}
			onclick={() => {
				money = money.plus(1);
				helpCount += 1;
			}}
		>
			Take the dollar.
		</button>
	{:else if helpCount == 6}
		<p>
			She sighs and says, "Here. Look at this infographic." She places a freshly-printed paper onto
			your water-bottle-selling stand's counter.
		</p>
		<img src="cash.png" alt="infographic titled 'cash explained for kids'" />
		<p>
			She notes that you should especially focus on the section about liquidity planning and cash
			flow.
		</p>
		<p>If you do, she'll give you a whole $15 this time.</p>
		<button
			use:moreShit
			disabled={newShit}
			onclick={() => {
				money = money.plus(15);
				helpCount += 1;
			}}
		>
			Tell her that you've read the infographic and that you're ready to take on the world.
		</button>
	{:else}
		<p>
			She benevolently offers you one whole dollar, no strings attached, to help you get back on
			your feet{#if helpCount == 1}, again{:else if helpCount > 1}, <b><em>again</em></b>{/if}.
		</p>

		{#if helpCount == 5}
			<p>
				She <em>knows</em> you're smart—she's always said so, and she <em>knows</em> you're capable of
				doing great things, which is why she's having such a hard time believing that you keep on overbuying
				empty bottles if not on purpose.
			</p>
		{:else if helpCount == 4}
			<p>
				She thinks she ought to sign you up for business classes at the local community college.
			</p>
		{:else if helpCount == 3}
			<p>Despite her unwavering love for you, she's beginning to doubt your entrepreneurship.</p>
		{/if}

		<button
			use:moreShit
			disabled={newShit}
			onclick={() => {
				money = money.plus(1);
				helpCount += 1;
			}}
		>
			Accept help.
		</button>
	{/if}
{:else if bottleSupplierHappy}
	<p>
		Your empty bottle supplier informed you that it has been very pleased with your recent influx in
		demand.
	</p>
	<p>As thanks, it's now offering a bulk pack of empty bottles at a discounted rate.</p>
{:else if hasFiller}
	<p>
		The Auto-Filler 2000 Ultra whirrs, crackles, and pops for a moment. You wonder whether it'll
		work.
	</p>
	<p>
		Surely enough, though, it starts blasting mega-loads of water into empty bottles, capping them,
		and spitting them out the other end. It's quite the sight to behold.
	</p>
{:else if wantFiller}
	<p>
		The sales side of this operation is going quite well; however, you're still having to manually
		fill each bottle.
	</p>
	<p>
		You figure it would be a wise investment to purchase the Auto-Filler 2000 Ultra, capable of
		filling {fillsPerSecond} bottles per second.
	</p>
	<button
		use:moreShit
		disabled={newShit || money.lt(fillerCost) || emptyBottles < minEmptyBottlesForFiller}
		onclick={() => {
			money = money.minus(fillerCost);
			hasFiller = true;
		}}
	>
		Purchase the Auto-Filler 2000 Ultra.
		<br />
		Costs ${c(fillerCost)}.
	</button>
	{#if emptyBottles < minEmptyBottlesForFiller}
		<p>
			You should also have a few empty bottles on hand, around {minEmptyBottlesForFiller} or so, before
			purchasing the filler.
		</p>
	{/if}
{:else if hasSpecialist}
	<p>This sales specialist seems quite the professional, and they've gotten straight to work.</p>
{:else if robertRetired}
	<p>
		Robert thanks you for the money he's made so far, but he admits that the filled-bottle-selling
		business is no longer for him.
	</p>
	<p>
		He'd, truthfully, rather be playing video games. Something about a princess and slaying her. You
		two amicably part ways, and that's that.
	</p>
	<p>The only issue is that you still need sales to be made.</p>
	<p>
		You think you should look outside of friends. You think to hire a proper sales specialist. It'd
		be more costly, costing you ${c(specialistSkim)} per sale, up from Robert's ${c(
			robertGreedySkim
		)}; however, on the bright side, they'd be able to sell 4 bottles per second.
	</p>
	<button
		use:moreShit
		disabled={newShit}
		onclick={() => {
			hasSpecialist = true;
		}}
	>
		Hire sales specialist.
	</button>
{:else if robertBest}
	<p>
		Robert has progressed even further in his ability to sell filled bottles, and he's now averaging
		3 per second.
	</p>
{:else if payingRobert}
	<p>Robert is happy to be paid, and he's back to work.</p>
	<p>
		His mom is impressed that he stood up for himself, and your mom is impressed that you're
		delegating so well.
	</p>
	<p>Best of all, cash is flowing in; business is booming. Overall, everyone is happy.</p>
{:else if robertGreedy}
	<p>
		Robert feels that he has poured his heart into the business but isn't being fairly compensated.
	</p>
	<p>
		He says he'll continue working, but for a price: ${c(robertGreedySkim)} for every bottle he sells.
	</p>
	<button
		use:moreShit
		disabled={newShit}
		onclick={() => {
			payingRobert = true;
		}}
	>
		Pay Robert.
	</button>
{:else if robertBetter}
	<p>Robert is improving in his salesmanship, so he's now able to sell 2 bottles per second.</p>
{:else if hasRobert}
	<p>Your friend, Robert, has agreed to help you sell bottles.</p>
	<p>
		Better yet, he'll do it for free! He sure is a real one. What a benevolent young man. (His mom
		told him he has to because she thinks he has too few friends.)
	</p>
	<p>He'll sell about 1 bottle per second.</p>
{:else if wantFriend && brandName}
	<p>All this purchasing, filling, and selling is growing exhausting.</p>
	<p>You think you should ask a friend to help with your business.</p>
	<button
		use:moreShit
		disabled={newShit}
		onclick={() => {
			hasRobert = true;
		}}
	>
		Phone a friend.
	</button>
{:else if brandName}
	<p>
		With your new-found brand name of {brandName}, you've marked up your bottled tap water from ${c(
			0.5
		)} to ${c(0.8)}.
	</p>
{:else if canBrand}
	<p>
		Your water bottles have become so popular amongst the running community that you figure you can
		purchase (slightly more expensive) labeled bottles with your brand on them.
	</p>
	<p>And, of course, mark up the price thanks to brand recognition.</p>
	<p>What will your brand name be?</p>
	<input bind:this={brandNameInput} />
	<button
		use:moreShit
		disabled={newShit}
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
		She proposes that you can keep business running if you pay her ${c(momDividendsCost)} for every bottle
		you fill.
	</p>
{:else if luxuriousBusiness}
	<p>
		This is turning out to be quite the luxurious business. You're basically rolling in cash, now.
	</p>
{:else if wasBoughtOut}
	<p>Good news! Your previous water bottle company was purchased by Nestlé.</p>
	<p>
		Although you are young and naive, they definitely, totally did not take advantage of you
		financially!
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
	disabled={money.lt(emptyBottleCost)}
	onclick={() => {
		money = money.minus(emptyBottleCost);
		emptyBottles += 15;
		hasBoughtBottle = true;
	}}
>
	Purchase 15-pack of empty{#if brandName}, {brandName}-branded{/if} bottles.
	<br />
	Costs ${c(emptyBottleCost)}.
</button>
{#if bottleSupplierHappy}
	<button
		style="filter: hue-rotate(140deg);"
		disabled={money.lt(largeEmptyBottleCost)}
		onclick={() => {
			money = money.minus(largeEmptyBottleCost);
			emptyBottles += 100;
		}}
	>
		Purchase 100-pack of empty{#if brandName}, {brandName}-branded{/if} bottles.
		<br />
		Costs ${c(largeEmptyBottleCost)}.
	</button>
{/if}

{#if hasBoughtBottle}
	<p>You have {emptyBottles} empty bottle{sIf1(emptyBottles)}.</p>
	<button
		disabled={!canFillBottle}
		onclick={() => {
			emptyBottles -= 1;
			filledBottles += 1;
			hasFilledBottle = true;
			money = money.minus(fillBottleCost);
		}}
	>
		Fill bottle with tap water.
		{#if fillBottleCost}
			<br />
			Costs ${c(fillBottleCost)}.
		{/if}
	</button>
{/if}

{#if hasFiller}
	<p>
		The Auto-Filler 2000 Ultra is filling {fillsPerSecond} empty bottle{sIf1(fillsPerSecond)} per second.
		It has filled {fillerFilledBottles} so far.
	</p>
{/if}

{#if hasFilledBottle}
	<p>You have {filledBottles} filled bottle{sIf1(filledBottles)}.</p>
	<button
		disabled={!canSellBottle}
		onclick={() => {
			filledBottles -= 1;
			soldBottles += 1;
			money = money.minus(soldBottlePrice);
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
		{#if hasSpecialist}You (and your business partners) have{:else if hasRobert}You (and your
			friend, Robert) have{:else}You've{/if} sold {soldBottles}
		filled bottle{sIf1(soldBottles)}.
	</p>
{/if}

{#if robertActive}
	<p>
		Robert is selling {autoSalesPerSecond} filled bottle{sIf1(autoSalesPerSecond)} per second,
		{#if autoSkim}and he's taking ${c(autoSkim)} for every bottle sold,{/if}
		netting you ${c(autoIncomePerSecond)} per second. He has sold {robertSoldBottles} so far.
	</p>
{/if}

{#if hasSpecialist}
	<p>
		The sales specialist is selling {autoSalesPerSecond} filled bottle{sIf1(autoSalesPerSecond)} per
		second, and they're taking ${c(autoSkim)} for every bottle sold, netting you ${c(
			autoIncomePerSecond
		)} per second. They have sold {specialistSoldBottles} so far.
	</p>
{/if}

<style>
	img {
		max-width: 100%;
		margin: 0 auto;
	}
</style>
