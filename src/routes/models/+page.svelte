<script lang="ts">
  import RedirectButton from "$lib/components/RedirectButton.svelte";
import Title from "$lib/components/Title.svelte";

	export let data;
</script>

<div class="flex justify-center m-4">
	<div class="flex flex-col max-w-4xl w-5/6 space-y-2">
		<Title text="ML Models"/>

		<div>
			<RedirectButton text="+ Create ML Model" url={`/models/create`}/>
		</div>

		{#each data.data as model}
			{model}
		{/each}		
	</div>
</div>
