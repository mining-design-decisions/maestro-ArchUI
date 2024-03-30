<script lang="ts">
    import { page } from "$app/stores";

    export let text: string;
    export let url: string;
</script>

<li
    aria-current={$page.url.pathname === url ? 'page' : undefined}
>
    <a
        href={url}
        class="flex items-center text-white font-bold py-1 px-2 rounded hover:bg-blue-500"
    >
        {text}
    </a>
</li>
