<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import GreenButton from "$lib/components/GreenButton.svelte";
  import RedButton from "$lib/components/RedButton.svelte";
	import RedirectButton from "$lib/components/RedirectButton.svelte";
  import SubTitle from "$lib/components/SubTitle.svelte";
  import TextInput from "$lib/components/TextInput.svelte";
	import Title from "$lib/components/Title.svelte";
  import { deleteRequest, postRequest } from "$lib/util/util";

	export let data;
	let newDirectoryName = "";

	const deleteDirectory = async (id: number) => {
		await deleteRequest(`directories/${id}`);
		invalidateAll();
	}

	const createDirectory = async () => {
		await postRequest(`/directories`, {name: newDirectoryName});
		invalidateAll();
	}
</script>

<div class="container mx-auto w-fit space-y-4">
	<Title text="Files & Directories" />

	<SubTitle text="New Directory" />
	<TextInput text="New directory name" bind:value={newDirectoryName}/>
	<GreenButton text="Create" on:click={createDirectory} />

	<SubTitle text="Directories" />
	<div class="rounded overflow-hidden">
		<table class="table-auto text-left text-gray-200 dark:text-gray-100">
		<thead class="uppercase bg-gray-50 dark:bg-gray-700">
		<tr>
			<th class="p-4">Name</th>
			<th class="p-4">Files</th>
			<th class="p-4">Delete</th>
		</tr>
		</thead>
			<tbody>
				{#each data.directories as directory}
					<tr class="bg-gray-800">
						<td class="p-4 font-bold">{directory.name}</td>
						<td class="p-4">
							<RedirectButton text="Files" url={`/files/directories?id=${directory.id}`}/>
						</td>
						<td class="p-4">
							<RedButton text="Delete" on:click={() => deleteDirectory(directory.id)} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
