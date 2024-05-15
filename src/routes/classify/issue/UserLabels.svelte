<script lang="ts">
  import Checkbox from "$lib/components/Checkbox.svelte";
  import SubTitle from "$lib/components/SubTitle.svelte";
  import { getCurrentUsername } from "$lib/util/util";

    export let users;
    export let userLabels: Record<number, {name:string, value:boolean}[]>;
</script>

<div>
    <SubTitle text="User Labels"/>
    {#each Object.entries(userLabels) as [userId, labels]}
      <p class="font-bold">{users[userId]}</p>
      <div class="pl-4">
        {#each labels as label}
          <Checkbox text={label.name} bind:checked={label.value} disabled={users[userId] !== getCurrentUsername()}/>
        {/each}
      </div>
    {/each}
</div>
