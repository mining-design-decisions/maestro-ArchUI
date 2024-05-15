<script lang="ts">
  import BlueButton from "$lib/components/BlueButton.svelte";
  import Checkbox from "$lib/components/Checkbox.svelte";
  import SubTitle from "$lib/components/SubTitle.svelte";
  import { patchRequest } from "$lib/util/util";

    export let labels: Record<string, boolean>;
    export let issueId;

    const setLabel = async () => {
      let body = {labels: labels};
      await patchRequest(`/issues/${issueId}/labels`, body);
    }
  </script>

<div>
    <SubTitle text="Labels"/>
    <div class="pl-4">
      {#each Object.keys(labels) as labelName}
        <Checkbox text={labelName} bind:checked={labels[labelName]} />
      {/each}
      <div class="flex justify-center">
          <BlueButton text="Set label" on:click={setLabel}/>
      </div>
    </div>
</div>
