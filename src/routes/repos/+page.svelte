<script lang="ts">
	import BlueButton from "$lib/components/BlueButton.svelte";
	import CheckBoxTable from "$lib/components/CheckBoxTable.svelte";
  import GreenButton from "$lib/components/GreenButton.svelte";
	import NumberInputTable from "$lib/components/NumberInputTable.svelte";
	import RedirectButton from "$lib/components/RedirectButton.svelte";
	import TextInputTable from "$lib/components/TextInputTable.svelte";
	import Title from "$lib/components/Title.svelte";
	import { postRequest, putRequest } from "$lib/util/util.js";

	export let data;

	let newRepo = {
		name: "",
		query_wait_time_in_minutes: "0",
		requires_authentication: false,
		type: "Jira",
		url: ""
	}

	const createRepo = async () => {
		await postRequest("/repos", newRepo, () => alert("Repo created!"));
	}

	const updateRepo = async (repo: any) => {
		const body = {
			name: repo.name,
			query_wait_time_in_minutes: repo.query_wait_time_minutes,
			requires_authentication: repo.requires_authentication,
			type: repo.type,
			url: repo.url
		}
		putRequest(`/repos/${repo.id}`, body, () => alert("Repo updated!"))
	}
</script>

<div class="container mx-auto w-fit space-y-4">
	<Title text="Repos" />

	<div class="rounded overflow-auto">
		<table class="table-auto text-left text-gray-200 dark:text-gray-100">
		<thead class="uppercase bg-gray-50 dark:bg-gray-700">
		<tr>
			<th class="p-4">Name</th>
			<th class="p-4">Type</th>
			<th class="p-4">URL</th>
			<th class="p-4">Last downloaded</th>
			<th class="p-4">Query wait time in minutes</th>
			<th class="p-4">Requires authentication</th>
			<th class="p-4"></th>
			<th class="p-4"></th>
		</tr>
		</thead>
			<tbody>
				{#each data.repos as repo}
					<tr class="bg-gray-800">
						<td class="p-4 font-bold"><TextInputTable bind:value={repo.name}/></td>
						<td class="p-4"><TextInputTable bind:value={repo.type}/></td>
						<td class="p-4"><TextInputTable bind:value={repo.url}/></td>
						<td class="p-4">{repo.last_downloaded_utc}</td>
						<td class="p-4"><NumberInputTable bind:value={repo.query_wait_time_minutes}/></td>
						<td class="p-4"><CheckBoxTable bind:checked={repo.requires_authentication}/></td>
						<td class="p-4"><BlueButton text="Update" on:click={() => {updateRepo(repo)}}/></td>
						<td class="p-4">
							<RedirectButton text="Properties" url={`/repos/properties?id=${repo.id}`}/>
						</td>
					</tr>
				{/each}
				<tr class="bg-gray-800">
					<td class="p-4 font-bold"><TextInputTable bind:value={newRepo.name}/></td>
					<td class="p-4"><TextInputTable bind:value={newRepo.type}/></td>
					<td class="p-4"><TextInputTable bind:value={newRepo.url}/></td>
					<td class="p-4"></td>
					<td class="p-4"><NumberInputTable bind:value={newRepo.query_wait_time_in_minutes}/></td>
					<td class="p-4"><CheckBoxTable bind:checked={newRepo.requires_authentication}/></td>
					<td class="p-4"><GreenButton text="Create" on:click={createRepo}/></td>
					<td class="p-4"></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
