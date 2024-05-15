<script lang="ts">
  import Comments from './Comments.svelte';
  import Labels from './Labels.svelte';
  import Tags from './Tags.svelte';
  import UserLabels from './UserLabels.svelte';

	export let data;
</script>

<div class="flex justify-center m-4">
	<div class="flex flex-col max-w-4xl w-5/6 space-y-4">
		<p class="text-4xl font-bold">
			Classify Issue:
			<a
				href={data.issueData.issue_link}
				target="_blank"
				class="text-blue-500 underline hover:no-underline"
			>
				{data.issueData.key}
			</a>{" "}
			({data.issueData.id})
		</p>

		<div>
			<p class="text-2xl font-bold">Summary</p>
			<p class="text-base">{data.issueData.summary}</p>
		</div>

		<div>
			<p class="text-2xl font-bold mt-4">Description</p>
			<p class="max-h-96 overflow-auto">{data.issueData.description}</p>
		</div>

		<!-- Manual label stuff -->
		<UserLabels users={data.users} userLabels={data.userLabels}/>

		<Labels labels={data.labels} issueId={data.issueData.id}/>

		<!-- Comments -->
		<Comments bind:data={data}/>

		<!-- Tags -->
		<Tags tags={data.tags} allTags={data.allTags} issueId={data.issueData.id}/>
	</div>
</div>
