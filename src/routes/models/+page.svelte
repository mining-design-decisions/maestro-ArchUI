<script lang="ts">
  import RedButton from "$lib/components/RedButton.svelte";
  import RedirectButton from "$lib/components/RedirectButton.svelte";
import Title from "$lib/components/Title.svelte";
  import { deleteRequest } from "$lib/util/util";

	export let data;

	const deleteModel = async (id: number) => {
		await deleteRequest(`/models/${id}`);
	}
</script>

<div class="flex justify-center m-4">
	<div class="flex flex-col max-w-4xl w-5/6 space-y-2">
		<Title text="ML Models"/>

		<div>
			<RedirectButton text="+ Create Input Embedding" url={`/models/create?type=InputEmbedding`}/>
			<RedirectButton text="+ Create Classifier" url={`/models/create?type=Classifier`}/>
		</div>

		<div class="rounded overflow-hidden">
			<table class="table-auto text-left text-gray-200 dark:text-gray-100">
			<thead class="uppercase bg-gray-50 dark:bg-gray-700">
			<tr>
				<th class="p-4">ID</th>
				<th class="p-4">Name</th>
				<th class="p-4">Type</th>
				<th class="p-4">Description</th>
				<th class="p-4"></th>
				<th class="p-4"></th>
				<th class="p-4"></th>
			</tr>
			</thead>
				<tbody>
					{#each data.models as model}
						<tr class="bg-gray-800">
							<td class="p-4 font-bold">{model.id}</td>
							<td class="p-4">{model.name}</td>
							<td class="p-4">{model.type}</td>
							<td class="p-4">{model.description}</td>
							<td class="p-4">
								<RedirectButton text="Test Runs" url={`/models/test-runs?id=${model.id}`}/>
							</td>
							<td class="p-4">
								<RedirectButton text="Edit" url={`/models/edit?id=${model.id}&type=${model.type}`}/>
							</td>
							<td class="p-4">
								<RedButton text="Delete" on:click={() => deleteModel(model.id)}/>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
