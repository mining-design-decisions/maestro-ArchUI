<script lang="ts">
  import BlueButton from "$lib/components/BlueButton.svelte";
import RedirectButton from "$lib/components/RedirectButton.svelte";
  import { postRequest } from "$lib/util/util";

    export let issueIds: number[];
    let currentPage = 0;
    let pageSize = 10;
    let currentIssues = {};

    $: {
        if (issueIds)
        getCurrentIssues()
    }

    const getCurrentIssues = async () => {
        let issuePage = issueIds.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
        const body = {
            attributes: ["key"],
            issue_ids: issuePage
        }
        let issueData = (await postRequest(`/issue-data`, JSON.stringify(body))).data;
        let temp = {};
        for (let issueId of issuePage) {
            temp[issueId] = issueData[issueId].key;
        }
        currentIssues = temp;
    }

    const previousPage = async () => {
        if (currentPage > 0) {
            currentPage--;
            await getCurrentIssues();
        }
    }

    const nextPage = async () => {
        if ((currentPage + 1) * pageSize < issueIds.length) {
            currentPage++;
            await getCurrentIssues();
        }
    }
</script>

<div on:load|once={getCurrentIssues()} class="space-y-2 mt-8">
    {#each Object.entries(currentIssues) as [issueId, issueKey], index}
        <RedirectButton text={`${currentPage * pageSize + index + 1}. ${issueKey}`} url={`classify/issue?id=${issueId}`}/>
    {/each}
    <div class="flex items-center justify-center space-x-2">
        <BlueButton text="Back" on:click={previousPage}/>
        <p>{currentPage + 1}</p>
        <BlueButton text="Next" on:click={nextPage}/>
    </div>
</div>
