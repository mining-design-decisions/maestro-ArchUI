<script lang="ts">
  import BlueButton from "$lib/components/BlueButton.svelte";
	import GreenButton from "$lib/components/GreenButton.svelte";
	import RedButton from "$lib/components/RedButton.svelte";
	import Select from "$lib/components/Select.svelte";
  import SubTitle from "$lib/components/SubTitle.svelte";
	import TextInput from "$lib/components/TextInput.svelte";
	import Title from "$lib/components/Title.svelte";
	import { postRequest } from "$lib/util/util";
  import IssuePages from "./IssuePages.svelte";

	// export let data;
	let selectedQueryName: string = "";
	let queryName: string = "";
	let query = {
		filter: "",
		sort: null,
		sort_ascending: false,
		models: [],
		page: 1,
		limit: 10,
	};
	let issueIds: number[] = [1, 2, 3, 4, 5];

	let versions: any = {};
	let selectedModel = "";
	let selectedVersion = "";

	const getQueriesNames = (): string[] => {
		let queries: string | null = localStorage.getItem("queries");
		if (queries === null) {
			return [];
		}
		let parsedQueries = JSON.parse(queries);
		return Object.keys(parsedQueries);
	}

	const loadSelectedQuery = () => {
		let queries: string | null = localStorage.getItem("queries");
		if (queries === null) {
			return;
		}
		let parsedQueries = JSON.parse(queries);
		query = parsedQueries[selectedQueryName];
		queryName = selectedQueryName;
	}

	function saveQuery() {
		let queries: string | null = localStorage.getItem("queries");
		let parsedQueries: any = queries === null ? {} : JSON.parse(queries);
		parsedQueries[queryName] = query;
		localStorage.setItem("queries", JSON.stringify(parsedQueries));
		queryNames = getQueriesNames();
	}

	function deleteQuery() {
		let queries: string | null = localStorage.getItem("queries");
		if (queries === null) {
			return;
		}
		let parsedQueries: any = JSON.parse(queries);
		delete parsedQueries[selectedQueryName];
		localStorage.setItem("queries", JSON.stringify(parsedQueries));
		queryNames = getQueriesNames();
	}

	const fetchData = async () => {
		const body = query.filter;
		issueIds = (await postRequest("/issue-ids", body)).issue_ids;
		issueIds.sort();
	}

	const getModels = () => {
		return ["test"];
	}

	const getVersions = () => {
		return ["test"];
	}

	let queryNames = getQueriesNames();
</script>

<div class="flex justify-center m-4">
	<div class="flex flex-col max-w-4xl w-5/6 space-y-4">
		<Title text="Classify" />

		<div class="space-y-2">
			<SubTitle text="Saved queries"/>
			<Select text="Select saved query" options={queryNames} bind:value={selectedQueryName}/>
			{#if queryNames.includes(selectedQueryName)}
				<div class="flex justify-end space-x-2">
					<RedButton text="Delete" on:click={deleteQuery}/>
					<BlueButton text="Load" on:click={loadSelectedQuery}/>
				</div>
			{/if}
		</div>

		<div class="space-y-2">
			<SubTitle text="Current query"/>
			<TextInput text="Query name" bind:value={queryName}/>
			<TextInput text="filter" bind:value={query.filter}/>

			<div class="rounded bg-gray-800 p-2 space-y-2">
				<Select text="Model" options={getModels()} bind:value={selectedModel}/>
				<Select text="Version" options={getVersions()} bind:value={selectedVersion}/>
				<div class="flex justify-end">
					<GreenButton text="+ Add model-version" on:click={() => {versions[selectedVersion] = selectedVersion}}/>
				</div>
				{#each Object.entries(versions) as [versionId, version]}
					<RedButton text={`Remove model: ${version}`} on:click={() => {delete versions[versionId]; versions=versions;}}/>
				{/each}
			</div>			

			<GreenButton text="+ Save query" on:click={saveQuery}/>
		</div>
		
		<div class="flex justify-center">
			<BlueButton text="Search" on:click={() => {fetchData()}}/>
		</div>
		
		<IssuePages bind:issueIds={issueIds}/>
		<!-- Get issue data + predictions for current page -->
	</div>
</div>
