<script>
	import { page } from '$app/stores';
  import MenuButton from './MenuButton.svelte';
</script>

<header>
	<nav>
		<ul class="flex justify-center space-x-8 bg-slate-600 rounded-b-lg p-2">
			<MenuButton text="Home" url="/"/>
			<MenuButton text="Embeddings" url="/embeddings"/>
			<MenuButton text="ML Models" url="/models"/>
			<MenuButton text="Classify" url="/classify"/>
			<MenuButton text="Search" url="/search"/>
			<MenuButton text="Statistics" url="/statistics"/>
			<MenuButton text="Tags" url="/tags"/>
			<MenuButton text="Settings" url="/settings"/>
		</ul>
	</nav>
</header>
