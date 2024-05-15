<script lang="ts">
	import BlueButton from "$lib/components/BlueButton.svelte";
	import GreenButton from "$lib/components/GreenButton.svelte";
	import RedButton from "$lib/components/RedButton.svelte";
	import SubTitle from "$lib/components/SubTitle.svelte";
	import { deleteRequest, downloadFileLink, patchRequest, postRequest, putRequest } from "$lib/util/util";
	import FileInput from "$lib/components/FileInput.svelte";
	import { invalidateAll } from "$app/navigation";
  import RedirectButton from "$lib/components/RedirectButton.svelte";

	export let data;
	let newFile: File;

	const uploadFile = async () => {
        const body = new FormData();
        body.append("file", newFile);
        postRequest(`/directories/${data.id}/files`, body, () => alert("File uploaded!"))
		invalidateAll();
    }

	const updateFile = async (id: number, name: string, description: string) => {
		const body = {
			name: name,
			description: description
		};
		patchRequest(`/directories/${data.id}/files/${id}`, body, () => alert("File updated!"));
	}

	const replaceFile = async (id: number) => {
		const body = new FormData();
        body.append("file", newFile);
        putRequest(`/directories/${data.id}/files/${id}/content`, body, () => alert("File replaced!"))
	}

	const deleteFile = async (id: string) => {
		await deleteRequest(`/directories/${data.id}/files/${id}`);
		invalidateAll();
	}
</script>


<div class="container mx-auto w-fit space-y-4">
	<SubTitle text="New File" />
	<FileInput text="New file" bind:value={newFile}/>
	<GreenButton text="Upload" on:click={uploadFile} />
	
	<div class="flex justify-center m-4">

		<table class="table-auto text-left text-gray-200 dark:text-gray-100">
			<thead class="uppercase bg-gray-50 dark:bg-gray-700">
				<tr>
					<th class="p-4">Name</th>
					<th class="p-4">Description</th>
					<th class="p-4">Type</th>
					<th class="p-4">Update</th>
					<th class="p-4">Replace</th>
					<th class="p-4">Download</th>
					<th class="p-4">Delete</th>
				</tr>
			</thead>
			<tbody>
				{#each data.files as file}
					<tr class="bg-gray-800">
						<td class="p-4 font-bold">{file.name}</td>
						<td class="p-4 font-bold">{file.description}</td>
						<td class="p-4 font-bold">{file.type}</td>
						<td class="p-4">
							<BlueButton text="Update" on:click={() => {updateFile(file.id, file.name, file.description)}}/>
						</td>
						<td class="p-4">
							<BlueButton text="Replace" on:click={() => {replaceFile(file.id)}}/>
						</td>
						<td class="p-4">
							<a href={downloadFileLink(`/directories/${data.id}/files/${file.id}/content?check_directory_existence=false`)} target="_blank">
								Download
							</a>
						</td>
						<td class="p-4">
							<RedButton text="Delete" on:click={() => {deleteFile(file.id)}}/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
