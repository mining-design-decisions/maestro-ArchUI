<script lang="ts">
  import BlueButton from "$lib/components/BlueButton.svelte";
  import RedButton from "$lib/components/RedButton.svelte";
  import TextInputTable from "$lib/components/TextInputTable.svelte";
import Title from "$lib/components/Title.svelte";
  import { deleteRequest, patchRequest } from "$lib/util/util.js";

	export let data;

	const updateRun = async (run: any) => {
		const body = {description: run.description}
		await patchRequest(`/models/${run.model_id}/test-runs/${run.id}`, body);
	}

	const deleteRun = async (run: any) => {
		await deleteRequest(`/models/${run.model_id}/test-runs/${run.id}`);
	}
</script>

<div class="flex justify-center m-4">
	<div class="flex flex-col max-w-4xl w-5/6 space-y-2">
		<Title text="ML Models"/>

		<div class="rounded overflow-hidden">
			<table class="table-auto text-left text-gray-200 dark:text-gray-100">
			<thead class="uppercase bg-gray-50 dark:bg-gray-700">
			<tr>
				<th class="p-4">ID</th>
				<th class="p-4">Description</th>
				<th class="p-4">Performance Metrics Directory ID</th>
				<th class="p-4">Version Directory ID</th>
				<th class="p-4">Timestamp (UTC)</th>
			</tr>
			</thead>
				<tbody>
					{#each data.runs as run}
						<tr class="bg-gray-800">
							<td class="p-4 font-bold">{run.id}</td>
							<td class="p-4"><TextInputTable bind:value={run.description}/></td>
							<td class="p-4">{run.performance_metrics_directory_id}</td>
							<td class="p-4">{run.version_directory_id}</td>
							<td class="p-4">{run.timestamp_utc}</td>
							<td class="p-4"><BlueButton text="Update" on:click={() => {updateRun(run)}}/></td>
							<td class="p-4"><RedButton text="Delete" on:click={() => {deleteRun(run)}}/></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
