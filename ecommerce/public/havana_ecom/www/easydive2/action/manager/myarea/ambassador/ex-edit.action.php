<?php
$id_categoria = H::input()->getArrayClean('id_categoria', []);
if ($id_categoria == null || count($id_categoria) == 0) {
	H::context()->put('error', 'Selezionare almeno una categoria');
	H::fire('view');
}
H::includeFromLib('Utils');
$lang = H::input('lang', H::config('default_language', 'it'));
$id = H::input('id', 0);
$ordine = H::input('ordine', 0);

$dettaglio = [
	'id_categoria' => $id_categoria,
	'e_mail' => H::input('e_mail', ''),
	'url_sito_web' => H::input('url_sito_web', ''),
	'url_facebook' => H::input('url_facebook', ''),
	'url_instagram' => H::input('url_instagram', ''),
	'url_twitter' => H::input('url_twitter', ''),
	'url_vimeo' => H::input('url_vimeo', ''),
	'url_youtube' => H::input('url_youtube', ''),
	'url_video' => H::input('url_video', ''),
	'url_video_2' => H::input('url_video_2', ''),
	'url_video_3' => H::input('url_video_3', ''),
	'nazione' => H::input('nazione', ''),
	'elenco_prodotti_id' => H::input('elenco_prodotti_id', ''),
];
$dettaglio = Utils::update_dettaglio('ed_ambassador', $id, $dettaglio);

$params = [
	':abilitato' => H::input('abilitato', 0),
	':ordine' => $ordine,
	':dettaglio' => json_encode($dettaglio),
];
$nuovo = $id <= 0;

H::db()->beginTransaction();
$strQry = ' ED_AMBASSADOR SET
	ABILITATO = :abilitato,
	DETTAGLIO = :dettaglio,
	ORDINE = :ordine';
if ($nuovo) {
	$strQry = 'INSERT INTO ' . $strQry;
}
else {
	$strQry = 'UPDATE' . $strQry . ' WHERE ID = :id';
	$params[':id'] = $id;
}

$ps = H::db()->prepare($strQry);
$ps->execute($params);

if ($nuovo) {
	$id = H::db()->lastInsertId();
}

Utils::add_image_entita($id, 'ed_ambassador', 6, '', 1);
Utils::add_image_entita($id, 'ed_ambassador', 6, 'gallery1', 5);
Utils::add_image_entita($id, 'ed_ambassador', 6, 'gallery2', 6);
Utils::add_image_entita($id, 'ed_ambassador', 6, 'gallery3', 7);

$nome = H::input('nome', '');

$find = [
	$nome,
];	
$find = Utils::find_string($find);

Utils::update_dettaglio_lang('ed_ambassador', $id, [
		'perche_scelto_easydive' => H::input()->getOriginal('perche_scelto_easydive', ''),
		'biografia' => H::input()->getOriginal('biografia', ''),
	],
	$lang,
	[
		'nome' => $nome,
		'find' => $find,
	]);
	
H::call('manager/myarea/attributo/add', [
	'id_entita' => $id,
	'tipo' => 'categoria_ambassador',
	'listId_attributo' => $id_categoria,
]);

H::db()->commit();

H::includeFromLib('UpdateData');
UpdateData::need_update_meta();
UpdateData::need_update_url();
UpdateData::update_url_ambassador(null, $id);
UpdateData::update_metainfo_ambassador(null, $id);

H::context()->put('success', 'Dati salvati correttamente');