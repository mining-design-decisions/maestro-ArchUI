<script lang="ts">
    import BlueButton from "$lib/components/BlueButton.svelte";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import SubTitle from "$lib/components/SubTitle.svelte";
    import TextInput from "$lib/components/TextInput.svelte";
    import { postRequest, setToken } from "$lib/util/util";

    let password = "";
    let passwordCheck = "";

    const changePassword = async () => {
        if (password !== passwordCheck) {
            alert("Passwords not the same");
            return;
        }
		let body = {
            password: password
        }
		await postRequest("/change-password", body);
	};
</script>

<div class="space-y-2">
    <SubTitle text="Change password"/>

    <PasswordInput text="Password" bind:value={password}/>
    <PasswordInput text="Re-type password" bind:value={passwordCheck}/>

    <div class="flex justify-end">
        <BlueButton text="Change password" on:click={changePassword}/>
    </div>
</div>
