<script lang="ts">
	import type {Query} from "@/query/query";
	import type {QueryWarning} from "@/query/parser";
	import type {TickTickService} from "@/services";
	import store from "@/store";
	import { t } from "@/i18n";

	export let query: Query;
	export let warnings: QueryWarning[];

	let service: TickTickService;
	store.service.subscribe((s) => (service = s));

	let tasksPromise = getTasks(query);
	async function getTasks(query: Query) {
		return service.getTasks(query.filter)
	}
</script>

<div class="break-words">
	<h1 class="">{t('query.tasks')}</h1>
	<p>
		{#await tasksPromise}
			{t('query.loading')}
		{:then tasks}
			{#each tasks as task}
				{task.title}<br/>
			{/each}
		{:catch someError}
			{t('query.systemError', { message: someError.message })}
		{/await}
	</p>
	{#if warnings.length > 0}
		<div class="warning">
			<h2>{t('query.warnings')}</h2>
			{#each warnings as warning}
				<p>{warning}</p>
			{/each}
		</div>
	{/if}
</div>
