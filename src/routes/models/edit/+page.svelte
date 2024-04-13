<script lang="ts">
	import ConfigForm from "$lib/components/ConfigForm.svelte";
  import GreenButton from "$lib/components/GreenButton.svelte";
  import RedirectButton from "$lib/components/RedirectButton.svelte";
  import TextInput from "$lib/components/TextInput.svelte";
import Title from "$lib/components/Title.svelte";
  import { postRequest } from "$lib/util/util";

	export let data;
	let modelName: string = "";
	let modelDescription: string = "";

	const createModel = () => {
		const body = {
			model_config: data.config,
			model_name: modelName,
			model_description: modelDescription
		}
		postRequest('/models', body, () => alert("Model created!"))
	}
</script>

<div class="flex justify-center m-4">
	<div class="flex flex-col max-w-4xl w-5/6 space-y-2">
		<Title text="ML Models"/>

		<TextInput text="Model name" bind:value={modelName}/>

		<ConfigForm endpoint={data.data} bind:config={data.config}/>

		<GreenButton text="+ Create Model" on:click={createModel}/>

		<div class="space-y-16">
			{JSON.stringify(data.config)}
		</div>
	</div>
</div>
