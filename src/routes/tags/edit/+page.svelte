<script lang="ts">
	import GreenButton from "$lib/components/GreenButton.svelte";
	import TextArea from "$lib/components/TextArea.svelte";
	import TextInput from "$lib/components/TextInput.svelte";
	import { putRequest } from "$lib/util/util";

	export let data;

	const editTag = async () => {
		const body = {
			name: data.tag.name,
			description: data.tag.description,
			type: "custom"
		}
		putRequest(`/tags/${data.tag.id}`, body)
	}
</script>

<div class="flex justify-center m-4">
	{#if data != null && data.tag != null}
		<div class="space-y-2 flex flex-col max-w-4xl w-5/6">
			<TextInput text="Label Name" bind:value={data.tag.name}/>
			<TextArea text="Description" bind:value={data.tag.description}/>

			<div class="flex justify-end">
				<GreenButton text="Edit Tag" on:click={editTag}/>
			</div>
		</div>
	{/if}
</div>
