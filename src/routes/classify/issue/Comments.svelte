<script lang="ts">
    import BlueButton from "$lib/components/BlueButton.svelte";
    import GreenButton from "$lib/components/GreenButton.svelte";
    import RedButton from "$lib/components/RedButton.svelte";
    import SubTitle from "$lib/components/SubTitle.svelte";
    import TextArea from "$lib/components/TextArea.svelte";
    import { deleteRequest, getCurrentUsername, patchRequest, postRequest } from "$lib/util/util.js";

	export let data;
	let newComment = "";
    let editComment = "";
    let commentSelectedForEdit: Number | null = null;

	const postComment = async () => {
		const body = {body: newComment};
		await postRequest(`/issues/${data.issueData.id}/comments`, body);
		newComment = "";
	}

    const changeCommentSelectedForEdit = (commentId: Number, body: string) => {
        commentSelectedForEdit = commentId;
        editComment = body;
    }

    const saveEditedComment = async () => {
        const body = {body: editComment}
        await patchRequest(`/issues/${data.issueData.id}/comments/${commentSelectedForEdit}`, body);
    }
    const cancelEditedComment = async () => {
        commentSelectedForEdit = null;
        editComment = "";
    }

    const deleteComment = async (commentId: Number) => {
        await deleteRequest(`/issues/${data.issueData.id}/comments/${commentSelectedForEdit}`)
    }
</script>

<div class="space-y-4">
    <SubTitle text="Comments"/>

    <!-- Comments -->
    {#each data.comments as comment}
        <div>
            <p class="bg-gray-700 rounded-t p-2 font-bold">
                {data.users[comment.user_id]} ({comment.timestamp_utc})
            </p>
            {#if comment.id === commentSelectedForEdit}
                <div class="flex">
                    <TextArea bind:value={editComment}/>
                </div>
                <div class="flex justify-between bg-slate-600 p-2">
                    <BlueButton text="Save" on:click={saveEditedComment}/>
                    <GreenButton text="Cancel" on:click={cancelEditedComment}/>
                </div>
            {:else}
                <p class="bg-gray-800 rounded-b p-2">
                    {comment.body}
                </p>
                {#if data.users[comment.user_id] === getCurrentUsername()}
                    <div class="flex justify-between bg-gray-800 p-2">
                        <BlueButton text="Edit" on:click={() => changeCommentSelectedForEdit(comment.id, comment.body)}/>
                        <RedButton text="Delete" on:click={() => deleteComment(comment.id)}/>
                    </div>
                {/if}
            {/if}
        </div>
    {/each}

    <!-- New comment -->
    <div class="bg-gray-800 rounded p-2">
        <TextArea text="New comment" bind:value={newComment}/>
        <div class="flex justify-end mt-2">
            <GreenButton text="+ Add comment" on:click={() => postComment}/>
        </div>
    </div>
</div>
