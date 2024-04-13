<script lang="ts">
	import BlueButton from "$lib/components/BlueButton.svelte";
	import GreenButton from "$lib/components/GreenButton.svelte";
	import RedButton from "$lib/components/RedButton.svelte";
	import TextInputTable from "$lib/components/TextInputTable.svelte";
	import { deleteRequest, postRequest, putRequest } from "$lib/util/util";

	export let data;
	let newName = "";
	let newValue = "";

	const addProperty = async () => {
		const body = {
			name: newName,
			value: newValue
		};
		postRequest(`/repos/${data.id}/properties`, body, () => alert("Property added!"))
	}

	const updateProperty = async (id: string, name: string, value: string) => {
		const body = {
			name: name,
			value: value,
		};
		putRequest(`/repos/${data.id}/properties/${id}`, body, () => alert("Property updated!"))
	}

	const deleteProperty = async (id: string) => {
		deleteRequest(`/repos/${data.id}/properties/${id}`, () => alert("Property deleted!"))
	}
</script>

<div class="flex justify-center m-4">
	
	<table class="table-auto text-left text-gray-200 dark:text-gray-100">
		<thead class="uppercase bg-gray-50 dark:bg-gray-700">
			<tr>
				<th class="p-4">Name</th>
				<th class="p-4">Value</th>
				<th class="p-4"></th>
				<th class="p-4"></th>
			</tr>
		</thead>
		<tbody>
			{#each data.properties as property}
				<tr class="bg-gray-800">
					<td class="p-4 font-bold">{property.name}</td>
					<td class="p-4 font-bold">
						<TextInputTable bind:value={property.value}/>
					</td>
					<td class="p-4">
						<BlueButton text="Update" on:click={() => {updateProperty(property.id, property.name, property.value)}}/>
					</td>
					<td class="p-4">
						<RedButton text="Delete" on:click={() => {deleteProperty(property.id)}}/>
					</td>
				</tr>
			{/each}
			<tr class="bg-gray-800">
				<td class="p-4 font-bold">
					<TextInputTable bind:value={newName}/>
				</td>
				<td class="p-4 font-bold">
					<TextInputTable bind:value={newValue}/>
				</td>
				<td class="p-4">
					<GreenButton text="+ Add property" on:click={addProperty}/>
				</td>
				<td class="p-4"></td>
			</tr>
		</tbody>
	</table>
</div>
