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
];
$dettaglio = Utils::update_dettaglio('ed_easydivepoint', $id, $dettaglio);

$params = [
	':abilitato' => H::input('abilitato', 0),
	':ordine' => $ordine,
	':dettaglio' => json_encode($dettaglio),
];
$nuovo = $id <= 0;

H::db()->beginTransaction();
$strQry = ' ED_EASYDIVEPOINT SET
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

Utils::add_image_entita($id, 'ed_easydivepoint', 6);

$nome = H::input('nome', '');

$find = [
	$titolo,
];	
$find = Utils::find_string($find);

Utils::update_dettaglio_lang('ed_easydivepoint', $id, [
		'descrizione_breve' => $descrizione_breve,
		'testo' => H::input()->getOriginal('testo', ''),
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