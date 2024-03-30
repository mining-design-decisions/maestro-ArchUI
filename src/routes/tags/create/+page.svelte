<script>
	import GreenButton from "$lib/components/GreenButton.svelte";
	import TextArea from "$lib/components/TextArea.svelte";
	import TextInput from "$lib/components/TextInput.svelte";
	import { postRequest } from "$lib/util/util";

	let label = "";
	let description = "";

	const insertTag = async () => {
		const body = {
			name: label,
			description: description,
			type: "custom"
		}
		postRequest('/tags', body)
	}
</script>

<div class="flex justify-center m-4">
	<div class="space-y-2 flex flex-col max-w-4xl w-5/6">
		<TextInput text="Label Name" bind:value={label}/>
		<TextArea text="Description" bind:value={description}/>

		<div class="flex justify-end">
			<GreenButton text="+ Create Tag" on:click={insertTag}/>
		</div>
	</div>
</div>
