<script lang="ts">
  import GreenButton from "$lib/components/GreenButton.svelte";
import RedButton from "$lib/components/RedButton.svelte";
  import Select from "$lib/components/Select.svelte";
  import SubTitle from "$lib/components/SubTitle.svelte";
  import { deleteRequest, postRequest } from "$lib/util/util";

    export let tags;
    export let allTags;
    export let issueId;

    let newTag = "";
    
    const getOptions = () => {
        let options = [];
        let unavailableOptions = new Set();
        for (let tag of tags) {
            unavailableOptions.add(tag.id);
        }
        for (let tag of allTags) {
            if (!unavailableOptions.has(tag.id)) {
                options.push(`${tag.id}: ${tag.name}`)
            }
        }
        return options;
    }

    const deleteTag = async (tagId: Number) => {
        await deleteRequest(`issues/${issueId}/tags/${tagId}`)
    }

    const assignTag = async () => {
        if (newTag !== "") {
            const body = {tag_id: Number(newTag.split(":")[0])}
            await postRequest(`/issues/${issueId}/tags`, body);
            newTag = "";
        }
    }
</script>

<div class="space-y-2">
    <SubTitle text="Tags"/>
    {#each tags as tag}
        <div class="flex space-x-2 items-center">
            <RedButton text="Delete" on:click={() => deleteTag(tag.id)}/>
            <p>{tag.name}</p>
        </div>
    {/each}

    <Select text="New tag" bind:value={newTag} options={getOptions()}/>
    <div class="flex justify-end">
        <GreenButton text="Assign tag" on:click={assignTag}/>
    </div>
</div>