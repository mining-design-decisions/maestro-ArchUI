<script lang="ts">
	import GreenButton from "$lib/components/GreenButton.svelte";
	import TextArea from "$lib/components/TextArea.svelte";
	import TextInput from "$lib/components/TextInput.svelte";
	import { putRequest } from "$lib/util/util";

	export let data;

	const editLabel = async () => {
		const body = {
			name: data.label.name,
			description: data.label.description,
			type: "Custom"
		}
		putRequest(`/labels/${data.label.id}`, body, () => alert("Label edited!"))
	}
</script>

<div class="flex justify-center m-4">
	{#if data != null && data.label != null}
		<div class="space-y-2 flex flex-col max-w-4xl w-5/6">
			<TextInput text="Label Name" bind:value={data.label.name}/>
			<TextArea text="Description" bind:value={data.label.description}/>

			<div class="flex justify-end">
				<GreenButton text="Edit Label" on:click={editLabel}/>
			</div>
		</div>
	{/if}
</div>
