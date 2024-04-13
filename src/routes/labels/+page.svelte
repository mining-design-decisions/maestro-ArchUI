<script lang="ts">
	import RedButton from "$lib/components/RedButton.svelte";
	import RedirectButton from "$lib/components/RedirectButton.svelte";
	import Title from "$lib/components/Title.svelte";
	import { deleteRequest } from "$lib/util/util.js";

	export let data;

	const safeDeleteLabel = (id: string) => {
		deleteRequest(`/labels/${id}?safe=true`, () => alert("Label deleted safely!"))
	}
	const unsafeDeleteLabel = (id: string) => {
		deleteRequest(`/labels/${id}?safe=false`, () => alert("Label deleted unsafely!"))
	}
</script>

<div class="container mx-auto w-fit space-y-4">
	<Title text="Labels" />

	<div class="flex justify-center">
		<RedirectButton text="+ Create Label" url="/labels/create"/>
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
				{#each data.labels as label}
					<tr class="bg-gray-800">
						<td class="p-4 font-bold">{label.name}</td>
						<td class="p-4">{label.description}</td>
						<td class="p-4">
							<RedirectButton text="Edit" url={`/labels/edit?id=${label.id}`}/>
						</td>
						<td class="p-4">
							<RedButton text="Safe delete" on:click={() => safeDeleteLabel(label.id)}/>
						</td>
						<td class="p-4">
							<RedButton text="Unsafe delete" on:click={() => unsafeDeleteLabel(label.id)}/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
