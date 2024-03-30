<script lang="ts">
    import BlueButton from "$lib/components/BlueButton.svelte";
    import SubTitle from "$lib/components/SubTitle.svelte";
    import TextInput from "$lib/components/TextInput.svelte";
    import { getDatabaseUrl, getDlManagerUrl, getSearchEngineUrl, setDatabaseUrl, setDlManagerUrl, setSearchEngineUrl } from "$lib/util/util";

    let databaseUrl = getDatabaseUrl();
    let dlManagerUrl = getDlManagerUrl();
    let searchEngineUrl = getSearchEngineUrl();

    const saveUrls = () => {
        setDatabaseUrl(databaseUrl);
        setDlManagerUrl(dlManagerUrl);
        setSearchEngineUrl(searchEngineUrl);
        alert("URLs saved");
    }
</script>

<div class="space-y-2">
    <SubTitle text="Save URLs"/>

    <TextInput text="Database URL" bind:value={databaseUrl}/>
    <TextInput text="DL manager URL" bind:value={dlManagerUrl}/>
    <TextInput text="Search engine URL" bind:value={searchEngineUrl}/>
    
    <div class="flex justify-end">
        <BlueButton text="Save URLs" on:click={saveUrls}/>
    </div>
</div>
