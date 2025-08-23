<script lang="ts">
	import { onMount } from 'svelte';

	// Svelte 5 runes for reactive state management
	let count = $state(0);
	let doubled = $derived(count * 2);
	let message = $state('Hello World from SvelteKit!');
	let mounted = $state(false);

	// Effect rune to run side effects
	$effect(() => {
		console.log(`Count changed to: ${count}`);
	});

	onMount(() => {
		mounted = true;
	});

	function increment() {
		count += 1;
	}

	function decrement() {
		count -= 1;
	}

	function reset() {
		count = 0;
	}
</script>

<svelte:head>
	<title>Null Horizon - Client</title>
	<meta name="description" content="Null Horizon SvelteKit Application" />
</svelte:head>

<main>
	<div class="container">
		<h1>{message}</h1>

		<div class="welcome-section">
			<p>Welcome to your new SvelteKit app with Svelte 5 runes!</p>
			{#if mounted}
				<p class="mounted">✅ App successfully mounted</p>
			{/if}
		</div>

		<div class="counter-section">
			<h2>Counter Example with Runes</h2>
			<div class="counter-display">
				<p>Count: <span class="count">{count}</span></p>
				<p>Doubled: <span class="derived">{doubled}</span></p>
			</div>

			<div class="button-group">
				<button onclick={decrement} disabled={count <= 0}>-</button>
				<button onclick={reset}>Reset</button>
				<button onclick={increment}>+</button>
			</div>
		</div>

		<div class="info-section">
			<h3>Features Demonstrated:</h3>
			<ul>
				<li><code>$state()</code> - Reactive state management</li>
				<li><code>$derived()</code> - Computed values</li>
				<li><code>$effect()</code> - Side effects (check console)</li>
				<li>TypeScript integration</li>
				<li>SvelteKit routing</li>
			</ul>
		</div>
	</div>
</main>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family: system-ui, -apple-system, sans-serif;
	}

	h1 {
		color: #333;
		text-align: center;
		margin-bottom: 2rem;
		font-size: 2.5rem;
	}

	.welcome-section {
		text-align: center;
		margin-bottom: 3rem;
	}

	.mounted {
		color: #22c55e;
		font-weight: 600;
		margin-top: 1rem;
	}

	.counter-section {
		background: #f8fafc;
		border-radius: 8px;
		padding: 2rem;
		margin-bottom: 2rem;
		text-align: center;
	}

	.counter-display {
		margin: 1.5rem 0;
	}

	.count {
		font-size: 2rem;
		font-weight: bold;
		color: #3b82f6;
	}

	.derived {
		font-size: 1.5rem;
		font-weight: bold;
		color: #8b5cf6;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 1.5rem;
	}

	button {
		padding: 0.5rem 1.5rem;
		border: none;
		border-radius: 6px;
		background: #3b82f6;
		color: white;
		cursor: pointer;
		font-size: 1.1rem;
		transition: all 0.2s;
	}

	button:hover:not(:disabled) {
		background: #2563eb;
		transform: translateY(-1px);
	}

	button:disabled {
		background: #94a3b8;
		cursor: not-allowed;
		transform: none;
	}

	.info-section {
		background: #fefce8;
		border-left: 4px solid #eab308;
		padding: 1.5rem;
		border-radius: 0 8px 8px 0;
	}

	.info-section h3 {
		margin-top: 0;
		color: #92400e;
	}

	.info-section ul {
		margin: 1rem 0;
	}

	.info-section li {
		margin: 0.5rem 0;
	}

	code {
		background: #e2e8f0;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: 'Courier New', monospace;
		color: #1e293b;
	}

	@media (max-width: 640px) {
		.container {
			padding: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.button-group {
			flex-direction: column;
			align-items: center;
		}

		button {
			width: 120px;
		}
	}
</style>
