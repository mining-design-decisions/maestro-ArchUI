<script lang="ts">
	import RedButton from "$lib/components/RedButton.svelte";
	import RedirectButton from "$lib/components/RedirectButton.svelte";
	import Title from "$lib/components/Title.svelte";
	import { deleteRequest } from "$lib/util/util.js";

	export let data;

	const deleteTag = (id: string) => {
		deleteRequest(`/tags/${id}`)
	}
</script>

<div class="container mx-auto w-fit space-y-4">
	<Title text="Tags" />

	<div class="flex justify-center">
		<RedirectButton text="+ Create Tag" url="/tags/create"/>
	</div>

	<div class="rounded overflow-hidden">
		<table class="table-auto text-left text-gray-200 dark:text-gray-100">
		<thead class="uppercase bg-gray-50 dark:bg-gray-700">
		<tr>
			<th class="p-4">Name</th>
			<th class="p-4">Description</th>
			<th class="p-4">Edit</th>
			<th class="p-4">Delete</th>
		</tr>
		</thead>
			<tbody>
				{#each data.tags as tag}
					<tr class="bg-gray-800">
						<td class="p-4 font-bold">{tag.name}</td>
						<td class="p-4">{tag.description}</td>
						<td class="p-4">
							<RedirectButton text="Edit" url={`/tags/edit?id=${tag.id}`}/>
						</td>
						<td class="p-4">
							<RedButton text="Delete" on:click={() => deleteTag(tag.id)}/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
