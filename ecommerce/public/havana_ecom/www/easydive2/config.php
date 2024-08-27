<?php
$_havana = [
	'database_host' => 'db',
	'database_username' => 'root',
	'database_password' => 'password',
	'database_name' => 'easydive1',
	
	'local' => true,
	'fb_appId' => '',
	'fb_secret' => '',
	
	'rewrite_engine' => [],
	'gestione_preventivi_semplice' => true,
	'gestione_preventivi_autonoma_utente' => true,
	'gestione_preventivi_campi_liberi' => false,
	'gestione_agenti' => true,
	'mailer_email_test' => 'mirko.ravaioli@ximplia.it',
	'batch_url' => 'http://www.easydive2.it.local',
	
	'html_to_pdf' => [
		'path' => 'c:/wkhtmltopdf/bin/wkhtmltopdf.exe',
	],
	'html_to_pdf_path' => 'c:/wkhtmltopdf/bin/wkhtmltopdf.exe',
];
include_once '_config_generic.php';
?>