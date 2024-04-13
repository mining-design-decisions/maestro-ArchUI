<script lang="ts">
	import RedButton from "$lib/components/RedButton.svelte";
	import RedirectButton from "$lib/components/RedirectButton.svelte";
	import Title from "$lib/components/Title.svelte";
	import { deleteRequest } from "$lib/util/util.js";

	export let data;

	const safeDeleteTag = (id: string) => {
		deleteRequest(`/tags/${id}?safe=true`, () => alert("Tag deleted safely!"))
	}
	const unsafeDeleteTag = (id: string) => {
		deleteRequest(`/tags/${id}?safe=false`, () => alert("Tag deleted unsafely!"))
	}
</script>

<div class="container mx-auto w-fit space-y-4">
	<Title text="Classify" />

	<!--  -->

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
			<th class="p-4">Safe Delete</th>
			<th class="p-4">Unsafe Delete</th>
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
							<RedButton text="Safe delete" on:click={() => safeDeleteTag(tag.id)}/>
						</td>
						<td class="p-4">
							<RedButton text="Unsafe delete" on:click={() => unsafeDeleteTag(tag.id)}/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
