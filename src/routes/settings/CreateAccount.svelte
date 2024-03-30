<script lang="ts">
    import Checkbox from "$lib/components/Checkbox.svelte";
    import GreenButton from "$lib/components/GreenButton.svelte";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import SubTitle from "$lib/components/SubTitle.svelte";
    import TextInput from "$lib/components/TextInput.svelte";
    import { postRequest } from "$lib/util/util";

    let username = "";
    let password = "";
    let may_annotate = false;
    let may_assign_tags = false;
    let may_compute_predictions = false;
    let may_edit_label_categories = false;
    let may_edit_models = false;
    let may_edit_tags = false;
    let may_edit_users = false;
    let may_import_issues = false;

    const createAccount = () => {
        let body = {
            username: username,
            password: password,
            permissions: {
                may_annotate: may_annotate,
                may_assign_tags: may_assign_tags,
                may_compute_predictions: may_compute_predictions,
                may_edit_label_categories: may_edit_label_categories,
                may_edit_models: may_edit_models,
                may_edit_tags: may_edit_tags,
                may_edit_users: may_edit_users,
                may_import_issues: may_import_issues
            }
        }
        postRequest("/create-account", body, () => alert("Account created"), false);
    };
</script>

<div class="space-y-2">
    <SubTitle text="Create Account"/>

    <TextInput text="Username" bind:value={username}/>
    <PasswordInput text="Password" bind:value={password}/>
    <Checkbox text="May annotate" bind:checked={may_annotate}/>
    <Checkbox text="May assign tags" bind:checked={may_assign_tags}/>
    <Checkbox text="May compute predictions" bind:checked={may_compute_predictions}/>
    <Checkbox text="May edit label categories" bind:checked={may_edit_label_categories}/>
    <Checkbox text="May edit models" bind:checked={may_edit_models}/>
    <Checkbox text="May edit tags" bind:checked={may_edit_tags}/>
    <Checkbox text="May edit users" bind:checked={may_edit_users}/>
    <Checkbox text="ay import issues" bind:checked={may_import_issues}/>

    <div class="flex justify-end">
        <GreenButton text="+ Create Account" on:click={createAccount}/>
    </div>
</div>
