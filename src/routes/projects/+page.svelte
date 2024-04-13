<script lang="ts">
	import RedirectButton from "$lib/components/RedirectButton.svelte";
	import Title from "$lib/components/Title.svelte";

	export let data;
</script>

<div class="container mx-auto w-fit space-y-4">
	<Title text="Projects" />

	<div class="rounded overflow-hidden">
		<table class="table-auto text-left text-gray-200 dark:text-gray-100">
		<thead class="uppercase bg-gray-50 dark:bg-gray-700">
		<tr>
			<th class="p-4">Repo</th>
			<th class="p-4">Name</th>
			<th class="p-4">Key</th>
			<th class="p-4">Properties</th>
		</tr>
		</thead>
			<tbody>
				{#each data.projects as project}
					<tr class="bg-gray-800">
						<td class="p-4 font-bold">{data.repos[project.repo_id]}</td>
						<td class="p-4 font-bold">{project.name}</td>
						<td class="p-4">{project.key}</td>
						<td class="p-4">
							<RedirectButton text="Properties" url={`/projects/properties?id=${project.id}`}/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
