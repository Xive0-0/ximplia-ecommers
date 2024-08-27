<?php
set_time_limit(0);
H::includeFromLib('PHPExcel/IOFactory.php');
H::includeFromLib('Encoding');
H::includeFromLib('Utils');
H::includeFromLib('AppUtils');

function insert_categoria($tipo, $codice, $nome, $id_padre = 0) {
	$ps = H::db()->prepare('SELECT A.* FROM ATTRIBUTO_LANG AL, ATTRIBUTO A WHERE A.ID = AL.ID_ATTRIBUTO AND A.TIPO = 1100 AND UPPER(AL.NOME) = UPPER(:nome) AND AL.LANG = :lang');
	$ps->execute([
			':lang' => 'it',
			':nome' => $nome,
		]);

	if ($row = $ps->fetch()) {
		return -1;
	}
	
	
	$dettaglio = [
		'codice' => $codice,
		'parametri' => '',
	];
	
	$params = [
		':codice_old' => $codice,
		':ordine' => 0,
		':tipo' => $tipo,
		':id_padre' => $id_padre,
		':dettaglio' => json_encode($dettaglio)
	];
		
	$strQry = ' ATTRIBUTO SET 
		CODICE_OLD = :codice_old, 
		ORDINE = :ordine, 
		TIPO = :tipo, 
		ID_PADRE = :id_padre, 
		DETTAGLIO = :dettaglio';
	$strQry = 'INSERT INTO ' . $strQry . ', DATA_INSERIMENTO = now()';
	
	$ps = H::db()->prepare($strQry);
	$ps->execute($params);
	$id = H::db()->lastInsertId();
	
	$dett_lang = [
		'titolo_pagina' => '',
		'descrizione' => ''
	];
	
	$find = HString::normalize($nome);
	Utils::update_dettaglio_lang('attributo', $id, $dett_lang,
		'it',
		[
			'find' => $find,
			'nome' => $nome
		]);
	return $id;
}

$elenco = [
"Accessorio",
"Basetta",
"Aggiornamento",
"Allungabile",
"Batteria",
"Borsa",
"Braccio",
"Canon",
"Casco",
"Cellulare",
"Clamp",
"Costume da Bagno",
"Custodia",
"Diffusore",
"Display",
"Diveshot",
"Filtro",
"Fisheye",
"Flash",
"Gadget",
"Galleggiante",
"Grandangolare",
"Grandangolo",
"Huawei",
"Illuminatore",
"Illuminazione",
"iPhone",
"Lampada",
"Lente",
"Leo3 Smart",
"Leo3 Wi",
"Macro",
"Maglietta",
"Magnificatore",
"Manutenzione",
"Micro USB",
"Nikon",
"Obiettivo",
"Oblò Sferico",
"Olympus",
"Ottica",
"Palo",
"Panasonic",
"Papalina",
"Prolunga",
"Reflex",
"Ricambio",
"Samsung",
"Sony",
"Speleosub",
"Superficie",
"Universale",
"Upgrade",
"USB-C",
"Videocamera",
];

foreach ($elenco as $line) {
	$id = insert_categoria(1100, '', $line, 0);
}

$path_file = HSystem::path('temp') . '/tag.xlsx';
$reader = PHPExcel_IOFactory::load($path_file);
$lines = $reader->getActiveSheet()->toArray(null,true,false,true);

$count = 0;
for ($l = 1; $l < count($lines); $l++) {
	if (isset($lines[$l])) {
		$id = $lines[$l]['A'];
		$list = ['B', 'C', 'D', 'E', 'F', 'G', 'H'];
		$list_tag = [];
		foreach ($list as $c) {
			$tag = trim(@$lines[$l][$c]);
			if ($tag != '') {
				$ps = H::db()->prepare('SELECT A.ID FROM ATTRIBUTO_LANG AL, ATTRIBUTO A WHERE A.ID = AL.ID_ATTRIBUTO AND A.TIPO = 1100 AND UPPER(AL.NOME) = UPPER(:nome) AND AL.LANG = :lang');
				$ps->execute([
						':lang' => 'it',
						':nome' => $tag,
					]);

				if ($row = $ps->fetch()) {
					$list_tag[] = '' . $row['ID'];
				}
				else {
					$count++;
					echo "ERRORE tag non trovato " . $tag . "\n";
				}
			}
		}
		if (count($list_tag) > 0) {
			$params = [
				'id_entita' => $id,
				'tipo' => 'tag',
				'listId_attributo' => $list_tag,
				'list_attributo_valore' => '',
			];

			H::call('manager/myarea/attributo/add', $params);
			
			$ps = H::db()->prepare('SELECT * FROM ARTICOLO WHERE ID = :id');
			$ps->execute([
					':id' => $id,
				]);
			if ($row = $ps->fetch()) {
				$dettaglio = (array)json_decode($row['DETTAGLIO'], true);
				$dettaglio['id_tag'] = $list_tag;
				$ps = H::db()->prepare('UPDATE ARTICOLO SET DETTAGLIO = :dettaglio WHERE ID = :id');
				$ps->execute([
						':dettaglio' => json_encode($dettaglio),
						':id' => $id,
					]);
			}
			else {
				echo "ERRORE articolo non trovato";
			}
		}
	}
}
echo $count;