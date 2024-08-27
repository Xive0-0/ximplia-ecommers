<?php
H::lib('Utils');

Utils::update_settings([
	'spedizione_sda_standard',
	'spedizione_gls_standard',
	'spedizione_gls_express',
	'spedizione_dhl_standard',
	'spedizione_dhl_express',
	'spedizione_fedex_standard',
	'spedizione_fedex_express',
	'spedizione_ups_standard',
	'spedizione_ups_express',
]);

H::context()->put('success', 'Dati salvati correttamente');	