<h1><i class="fa fa-twitter-square"></i> Weibo Social Authentication</h1>
<hr />

<form>
	<div class="alert alert-warning">
		<p>
			Create a <strong>Weibo Application</strong> via the
			<a href="https://dev.weibo.com/">Weibo Developers Page</a> and then
			paste your application details here.
		</p>
		<br />
		<input type="text" data-field="social:weibo:key" title="API Key" class="form-control input-lg" placeholder="API Key"><br />
		<input type="text" data-field="social:weibo:secret" title="API Secret" class="form-control input-md" placeholder="API Secret">
	</div>
</form>

<button class="btn btn-lg btn-primary" id="save">Save</button>

<script>
	require(['forum/admin/settings'], function(Settings) {
		Settings.prepare();
	});
</script>
