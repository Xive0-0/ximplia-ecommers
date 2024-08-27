<?php
H::includeFromLib('Utils');

Utils::update_settings([
	'script_banner_issu',
],
null,
function($key) {
	return H::input()->getOriginal($key, '');
});

H::context()->put('success', 'Dati salvati correttamente');
