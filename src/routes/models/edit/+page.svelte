<script lang="ts">
	import ConfigForm from "$lib/components/ConfigForm.svelte";
  import GreenButton from "$lib/components/GreenButton.svelte";
  import TextInput from "$lib/components/TextInput.svelte";
import Title from "$lib/components/Title.svelte";
  import { putRequest } from "$lib/util/util";

	export let data;
	let modelName: string = "";
	let modelDescription: string = "";

	const saveModel = () => {
		const body = {
			config: data.config,
			name: modelName,
			description: modelDescription
		}
		putRequest('/models', body, () => alert("Model updated!"))
	}
</script>

<div class="flex justify-center m-4">
	<div class="flex flex-col max-w-4xl w-5/6 space-y-2">
		<Title text="ML Models"/>

		<TextInput text="Model name" bind:value={modelName}/>

		<ConfigForm endpoint={data.data} bind:config={data.config}/>

		<GreenButton text="Save Model" on:click={saveModel}/>
	</div>
</div>
