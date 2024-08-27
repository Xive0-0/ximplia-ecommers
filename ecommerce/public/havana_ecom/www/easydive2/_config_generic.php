<?php
$_havana = array_merge($_havana, [
	'havana_version' => '3.4.32',
	'server' => 'test',	
	'cookie_policy' => 'gdpr22',
	'git' => true,
	'message_center' => true,
	'gestione_iva_paese_ue' => true,
	'request_check' => true,
	'havana_monitor_execution_time' => 10,
	'havana_monitor_execution_time_query' => 3,
	
	'minimize' => true,
	'minimize_html' => false,
	'gestione_condividi_altri_in_scheda_articolo' => false,
	'carrello_ordinamento_prodotti' => 'articolo_ordine:desc',
	
	'checkout_3_opzione_come_corriere' => true,
	'gestione_parametri_extra_articoli' => true,
	'gestione_parametri_extra_articoli_lang' => true,
	'articolo_gestione_bundle' => true,
	'gestione_agenti_ordine_email' => true,
	'checkout_block_riepilogo_finale' => false,
	'articolo_correlati_senso_unico' => true,
	'articolo_accessori_senso_unico' => true,
	'gestione_file_clienti' => true,
	'template_cache' => false,
	'gestione_agenti_ordine_conferma_dati_cliente' => true,
	'sessionid_input' => true,
	'sessionid_output' => true,
	'add_lang_in_url' => true,
	'url_lang' => true,
	'default_language' => 'it',
	'enabled_languages' => ['it', 'en', 'es', 'fr', 'de'],
	'url_cache_hash' => true,
	'gestione_tag_articoli' => true,
	'redirect_301_old_url' => true,
	'checkout_4_fattura_separato_dati' => false,
	
	'num_list_items' => 50,
	'num_list_items_blog_web' => 20,
	
	'ip_locator_api_key' => 'yYP6Sso1llyGZo0',
	
	'image_dim' => [
		['width' => 50, 'height' => 50],	
		['width' => 100, 'height' => 100],	
		['width' => 300, 'height' => 300],	
		['width' => 600, 'height' => 600],	
		['width' => 1200, 'height' => 600],
		['width' => 1200, 'height' => 1200],
	],
	
	'azienda_image_dim' => [	
		['width' => 300, 'height' => 300],	
		['width' => 600, 'height' => 600],	
	],	
	'banner_image_dim' => [	
		['width' => 2000, 'height' => 175, 'type' => 3],
        ['width' => 550, 'height' => 550, 'type' => 3],
		['width' => 600, 'height' => 800, 'type' => 3],
		['width' => 1100, 'height' => 215, 'type' => 3],
		['width' => 1100, 'height' => 550, 'type' => 3],
		['width' => 2000, 'height' => 715, 'type' => 3],	
		['width' => 1100, 'height' => 1100, 'type' => 3],	
	],
	
	'attributo_image_dim' => [
		['width' => 300, 'height' => 150, 'type' => 3],	
		['width' => 300, 'height' => 300, 'type' => 3],	
		['width' => 600, 'height' => 600, 'type' => 3],	
	],
	
	'pagina_image_dim' => [
		['width' => 100, 'height' => 60, 'type' => 3],
		['width' => 320, 'height' => 240, 'type' => 3],
		['width' => 640, 'height' => 480],
		['width' => 1280, 'height' => 960],
	],	
	'editor_image_dim' => [
		['width' => 640, 'height' => 480],
	],
	'blog_image_dim' => [
		['width' => 430, 'height' => 260, 'type' => 3],
		['width' => 1290, 'height' => 780, 'type' => 3],
	],
	
	'ed_ambassador_image_dim' => [
		['width' => 430, 'height' => 260, 'type' => 3],
		['width' => 1290, 'height' => 780, 'type' => 3],
	],
	'ed_easydivepoint_image_dim' => [
		['width' => 430, 'height' => 260, 'type' => 3],
		['width' => 1290, 'height' => 780, 'type' => 3],
	],
	
	'url_parse_file_class_path' => '/lib/MyActivityFromRequest.class.php',
			
	'encrypt_key' => 'g62jsKm830ajRhx526tskkmEu7t62fr2',
	
	'password_enc' => '23jnasrcSOAP40o349!%ADSFG£&I&$IDFAGas313vabj_as3463hgju690679jnbvxc256736adfkasvan5720946mogigoiqe3239857vxcmnsgjertzxcse572teoihsgfnmkdlfg958728WERgew4234£&7FDG_Sde556',
	
	'mailer_type' => 'dispatcher3',
	'mailer_app' => 'easydive',
	'mailer_api_key' => 'sFD2GZ46hvCt4Y97DiL',
	'mailer_from_name' => 'noreply@easydive.it',
	'mailer_from_email' => 'noreply@easydive.it',
	'mailer_template_path' => '/template_email',

	'gestione_ticket_cliente' => true,
	'gestione_preventivi' => false,
	'gestione_preventivi_semplice' => false,
	'prefisso_codice_ordine' => 'ED',
	'search_multi_parole' => true,
	'search_parole_tutte_presenti' => true,
	'update_url_collezione_articolo_principale' => true,
	'visualizza_tabella_spedizioni' => false,
	//'search_keywords' => true,
	'prezzi_senza_iva' => true,
	'indicizza_categoria_in_articolo' => true,
	'indicizza_categoria_solo_principale_in_articolo' => true,
	'indicizza_azienda_in_articolo' => false,
	'gestione_opzioni_articoli' => true,
	'export_key' => [
		'articolo' => [
			'garanzia' => '',
			'step_acquisto_testo' => '',
			'descrizione_breve' => '',
			'descrizione' => '',
			'scheda_tecnica' => '',
			'testo_indicazioni' => '',
		]
	],
	
	'template' => [
		'manager' => [
			'name' => 'easydive Store',
			'tmpl_build' => 3,
			'item_image_dim' => '50x50',
			'proporzioni_image_articolo' => '1200x1200',
			'item' => [
				'articolo' => [
					'codice' => true,
					'id' => true,
				]
			]
		],
		'web' => [
			'tmpl_build' => 246,
			'copy' => 'easydive Store',
			'logo_name' => 'easydive Store',
			'logo_image' => 'logo-easydive.png',
			'blog_image_dim' => '600x420',
			'item_image_dim' => '300x300',
			'feed_item_image_dim' => '300x300',
		]
	],
	
	'klaviyo_private_key' => 'pk_eeccf8f53f11b1fc25be2d8f4e6048d147',
	'klaviyo_public_key' => 'YsKE97',
	
	'app_domain_name' => 'easydive-app-api.ximplia.it',
	'url_email' => 'https://www.easydive.it',
	
	'tracker_eventi' => true,
	'checkout_paypal_ipn' => true,
	'checkout_cc' => 'nexi',

	'checkout_cc_alias' => 'payment_3503551',
	'checkout_cc_pwd' => 'rOFR38236W46H60KiJL497Hd75y6t832D9HPXHGZ',
	//'checkout_cc_alias' => 'payment_3481740',
	//'checkout_cc_pwd' => '8BXXuw761D9XJG34297R27SyJ1GB30823kE60cMn',
]);