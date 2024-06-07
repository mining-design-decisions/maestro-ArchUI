<script lang="ts">
    import BlueButton from "$lib/components/BlueButton.svelte";
    import NumberInput from "$lib/components/NumberInput.svelte";
    import SubTitle from "$lib/components/SubTitle.svelte";
    import { postRequest } from "$lib/util/util";

    let maxIdListLength = "0";

    const save = async () => {
		const body = {
            max_id_list_length: maxIdListLength,
        }
		await postRequest("/settings", body);
	};
</script>

<div class="space-y-2">
    <SubTitle text="Additional Settings"/>

    <NumberInput text="Max ID list length" bind:value={maxIdListLength}/>

    <div class="flex justify-end">
        <BlueButton text="Save" on:click={save}/>
    </div>
</div>
