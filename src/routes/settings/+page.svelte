<script lang="ts">
	import Title from "$lib/components/Title.svelte";
  import ChangePassword from "./ChangePassword.svelte";
	import CreateAccount from "./CreateAccount.svelte";
	import Login from "./Login.svelte";
  import Settings from "./Settings.svelte";
	import UrlSettings from "./UrlSettings.svelte";
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="flex justify-center m-4">
	<div class="flex flex-col max-w-4xl w-5/6">
		<Title text="Settings"/>

		<div class="space-y-16">
			<Login />
			<ChangePassword />
			<CreateAccount />
			<UrlSettings />
			<Settings />
		</div>
	</div>
</div>
