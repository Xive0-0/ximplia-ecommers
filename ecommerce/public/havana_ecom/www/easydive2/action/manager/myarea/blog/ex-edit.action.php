<?php
$id_categoria = H::input()->getArrayClean('id_categoria', []);
if ($id_categoria == null || count($id_categoria) == 0) {
	H::context()->put('error', 'Selezionare almeno una categoria');
	H::fire('view');
}

H::includeFromLib('Utils');
$url_video = Utils::toYoutubeEmbedVideoUrl(H::input('url_video', ''));
if ($url_video == '' && H::input('url_video', '') != '') {
	H::context()->put('error', 'Formato url video youtube non valido');
	H::fire('view');	
}

$lang = H::input('lang', H::config('default_language', 'it'));
$id_redattore = H::input()->getArrayClean('id_redattore', []);
$id = H::input('id', 0);
$ordine = H::input('ordine', 0);

$userId = H::session('user')['id'];

$dettaglio = [
	'data_evento_dal' => H::input('data_evento_dal', ''),
	'data_evento_al' => H::input('data_evento_al', ''),
	'url_video_generico_1' => H::input('url_video_generico_1', ''),
	'url_video_generico_2' => H::input('url_video_generico_2', ''),
	'url_video_generico_3' => H::input('url_video_generico_3', ''),
	'id_redattore' => $id_redattore,
	'id_categoria' => $id_categoria,
	'url_sito_ufficiale' => H::input('url_sito_ufficiale', ''),
	'url_pagina_facebook' => H::input('url_pagina_facebook', ''),
	'indirizzo' => H::input('indirizzo', ''),
	'url_google_maps' => H::input('url_google_maps', ''),
];

for ($i = 1; $i <= 3; $i++) {
	$url_video = Utils::toYoutubeEmbedVideoUrl(H::input('url_video_' . $i, ''));
	if ($url_video == '' && H::input('url_video_' . $i, '') != '') {
		H::context()->put('error', 'Formato url video ' . $i . ' youtube non valido');
		H::fire('view');	
	}
	$dettaglio['url_video_' . $i] = $url_video;
}
$dettaglio = Utils::update_dettaglio('blog', $id, $dettaglio);

$dettaglio_item = [
	'id_articolo' => H::input()->getArrayClean('$id_articolo', []),
	'id_azienda' => H::input()->getArrayClean('$id_azienda', []),
	'id_categoria' => H::input()->getArrayClean('$id_categoria', []),
];

$visibilita_lang = '-';
$enabled_languages = H::config('enabled_languages', null);
if ($enabled_languages != null && count($enabled_languages) > 1) {
	$visibilita_lang = H::input()->getArrayClean('visibilita_lang');
	if ($visibilita_lang == null || 
		count($visibilita_lang) == 0 || 
		count($visibilita_lang) == count($enabled_languages)) {
		$visibilita_lang = '-';
	}
	else {
		$visibilita_lang = implode(',', $visibilita_lang);
		if ($visibilita_lang != '') {
			$visibilita_lang .= ',';
		}	
	}
}

$params = [
	':visibilita_lang' => $visibilita_lang,
	':codice_load' => H::input('codice_load', ''),
	':abilitato' => H::input('abilitato', 0),
	':show_home' => H::input('show_home', 0),
	':in_evidenza' => H::input('in_evidenza', 0),
	':id_utente_modifica' => $userId,
	':ordine' => $ordine,
	':dettaglio' => json_encode($dettaglio),
	':dettaglio_item' => HUtil::_serialize($dettaglio_item),
];
$nuovo = $id <= 0;

H::db()->beginTransaction();
$strQry = ' BLOG SET
	VISIBILITA_LANG = :visibilita_lang,
	IN_EVIDENZA = :in_evidenza,
	SHOW_HOME = :show_home,
	CODICE_LOAD = :codice_load,
	ABILITATO = :abilitato,
	DETTAGLIO = :dettaglio,
	DETTAGLIO_ITEM = :dettaglio_item, 
	DATA_MODIFICA = now(),
	ID_UTENTE_MODIFICA = :id_utente_modifica,
	ORDINE = :ordine';
if ($nuovo) {
	$strQry = 'INSERT INTO ' . $strQry . ', ID_UTENTE_INSERIMENTO = :id_utente_inserimento, DATA_INSERIMENTO = now()';
	$params[':id_utente_inserimento'] = $userId;
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

$file = H::input('file_data', '');
$file_name = H::input('file_data_name', '');
$allegato_id = 0;
$allegato_nome = '';

if ($file_name == '' && !$nuovo) {
	if ($file != '') {
		$ps = H::db()->prepare('SELECT * FROM BLOG_LANG WHERE ID_BLOG = :id AND LANG = :lang');
		$ps->bindValue(':id', $id);
		$ps->bindValue(':lang', $lang);
		$ps->execute();
		if ($row = $ps->fetch()) {
			$allegato_id = $row['ALLEGATO_ID'];
			$allegato_nome = $row['ALLEGATO_NOME'];
		}
	}
}
elseif ($file_name != '') {
	$path_info = pathinfo($file_name);
	$estensione = strtolower($path_info['extension']);
	
	$ps = H::db()->prepare('INSERT INTO FILE_BLOG SET 
		DATA_INSERIMENTO = now(),
		NOME = :nome,
		ESTENSIONE = :estensione,
		ID_BLOG = :id_blog');
	$ps->execute([
		':estensione' => $estensione,
		':nome' => $file_name,
		':id_blog' => $id,
	]);
	$allegato_id = H::db()->lastInsertId();
	$new_file = HSystem::path('files/blog', true) . '/' . $allegato_id;
	$path_file = HSystem::path('temp/file', true) . '/' . $file;
	@copy($path_file, $new_file);
	
	$allegato_nome = $file_name;
}

Utils::add_image_entita($id, 'blog', 6, '', 1);
Utils::add_image_entita($id, 'blog', 6, 'banner', 3);
Utils::add_image_entita($id, 'blog', 6, 'poster', 4);
Utils::add_image_entita($id, 'blog', 6, 'gallery1', 5);
Utils::add_image_entita($id, 'blog', 6, 'gallery2', 6);
Utils::add_image_entita($id, 'blog', 6, 'gallery3', 7);

$titolo = H::input('titolo', '');
$tags = H::input('tags', '');
$sottotitolo = H::input('sottotitolo', '');
$descrizione_breve = H::input('descrizione_breve', '');

$lettera = HString::normalize($titolo);
if (strlen($lettera) > 0) {
	$lettera = $lettera{0};
}
else {
	$lettera = '-';
}


$find = [
	$titolo,
	$tags,
	$sottotitolo,
	$descrizione_breve,
];

$ps = H::db()->prepare('SELECT
				AL.NOME
			FROM
				ATTRIBUTO_LANG AL,
				ARTICOLO_ATTRIBUTO AA
			WHERE
				AA.TIPO = 1000 AND
				AL.LANG = :lang AND
				AA.ID_ATTRIBUTO = AL.ID_ATTRIBUTO AND
				AA.ID_ENTITA = :id');
$ps->execute([
		':lang' => $lang,
		':id' => $id
	]);
while ($row = $ps->fetch()) {
	$find[] = $row['NOME'];
}
			
$find = Utils::find_string($find);

Utils::update_dettaglio_lang('blog', $id, [
		'url_video' => $url_video,
		'bottone_testo' => H::input('bottone_testo', ''),
		'bottone_url' => H::input('bottone_url', ''),
		'sottotitolo' => $sottotitolo,
		'descrizione_breve' => $descrizione_breve,
		'tags' => $tags,
		'testo' => H::input()->getOriginal('testo', ''),
	],
	$lang,
	[
		'titolo' => $titolo,
		'lettera' => $lettera,
		'find' => $find,
		'allegato_id' => $allegato_id,				
		'allegato_nome' => $allegato_nome,	
	]);
	
H::call('manager/myarea/attributo/add', [
	'id_entita' => $id,
	'tipo' => 'categoria_blog',
	'listId_attributo' => $id_categoria,
]);
H::call('manager/myarea/attributo/add', [
	'id_entita' => $id,
	'tipo' => 'redattore_blog',
	'listId_attributo' => $id_redattore,
]);
H::db()->commit();

H::includeFromLib('UpdateData');
UpdateData::need_update_meta();
UpdateData::need_update_url();
UpdateData::update_url_blog(null, $id);
UpdateData::update_metainfo_blog(null, $id);
UpdateData::need_indicizza_blog(true);
UpdateData::clear_all_cache(true);

H::context()->put('success', 'Dati salvati correttamente');