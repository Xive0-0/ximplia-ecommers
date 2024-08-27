<?php
$id = H::input('id', 0);

$params = [
	':nome' => H::input('nome', ''),
	':voto' => H::input('voto', ''),
	':url_immagine' => H::input('url_immagine', ''),
	':url' => H::input('url', ''),
	':data' => H::input('data', ''),
	':testo' => H::input('testo', ''),
	':lang' => H::input('lang', '')
];
$strQry = ' ED_RECENSIONE SET 
	URL = :url, 
	URL_IMMAGINE = :url_immagine, 
	VOTO = :voto, 
	DATA = :data, 
	TESTO = :testo, 
	LANG = :lang, 
	NOME = :nome';
if ($id <= 0) {
	$strQry = 'INSERT INTO ' . $strQry . ',
		ID_ARTICOLO = :id_articolo';
	$params[':id_articolo'] = H::input('id_articolo', 0);
}
else {
	$strQry = 'UPDATE' . $strQry . ' WHERE ID = :id';
	$params[':id'] = $id;
}

$ps = H::db()->prepare($strQry);
$ps->execute($params);

if ($id <= 0) {
	$id = H::db()->lastInsertId();
}

H::context()->put('success', 'Dati salvati correttamente');