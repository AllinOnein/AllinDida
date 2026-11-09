<script lang="ts">
	import { t } from "@/i18n";

	export let error: string = "";

</script>

<div class="break-words number">
	<h1 class="">{t('query.errorTitle')}</h1>
	<p>{error}</p>
</div>

<style>
	.number {
		color: red;
	}
</style>
