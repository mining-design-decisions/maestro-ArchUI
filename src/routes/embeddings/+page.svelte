<script lang="ts">
	import ConfigForm from "$lib/components/ConfigForm.svelte";
import Title from "$lib/components/Title.svelte";

	export let data;
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="flex justify-center m-4">
	<div class="flex flex-col max-w-4xl w-5/6">
		<Title text="Embeddings"/>

		<div class="space-y-16">
			{JSON.stringify(data.config)}
		</div>

		<ConfigForm endpoint={data.data} bind:config={data.config}/>
	</div>
</div>
