<script>
	import Header from './Header.svelte';
	import './styles.css';
	import '../app.css'
</script>

<div class="min-h-screen bg-slate-900 text-white pb-4">
	<div>
		<Header />
	</div>

	<main class="mt-4">
		<slot />
	</main>
</div>
