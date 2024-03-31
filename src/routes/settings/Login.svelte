<script lang="ts">
    import BlueButton from "$lib/components/BlueButton.svelte";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import SubTitle from "$lib/components/SubTitle.svelte";
    import TextInput from "$lib/components/TextInput.svelte";
    import { postRequest, setToken } from "$lib/util/util";

    let username = "";
    let password = "";

    const login = () => {
		let body = {
            username: username,
            password: password
        }
		postRequest("/login", body, (data) => {setToken(data.token); alert("Login successful")});
	};
</script>

<div class="space-y-2">
    <SubTitle text="Login"/>

    <TextInput text="Username" bind:value={username}/>
    <PasswordInput text="Password" bind:value={password}/>

    <div class="flex justify-end">
        <BlueButton text="Login" on:click={login}/>
    </div>
</div>
