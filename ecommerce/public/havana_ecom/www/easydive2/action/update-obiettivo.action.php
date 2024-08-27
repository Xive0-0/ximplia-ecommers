<?php
set_time_limit(0);
H::includeFromLib('PHPExcel/IOFactory.php');
H::includeFromLib('Utils');

$list_gruppo_fotocamera = [
"Canon FullFrame;",
"28;Canon EOS 5D ",
"33;Canon EOS 5Ds ",
"31;Canon EOS 5D MkII ",
"32;Canon EOS 5D MkIII ",
"30;Canon EOS 5D Mk IV ",
"37;Canon EOS 6D ",
"38;Canon EOS 6D Mk II ",
"Canon APS-C;",
"12;Canon EOS 1000D ",
"13;Canon EOS 100D ",
"9;Canon EOS 10D ",
"14;Canon EOS 1100D ",
"15;Canon EOS 1200D ",
"16;Canon EOS 1300D ",
"8;Canon EOS 200D ",
"10;Canon EOS 20D ",
"20;Canon EOS 30D ",
"21;Canon EOS 350D ",
"22;Canon EOS 400D ",
"23;Canon EOS 40D ",
"24;Canon EOS 450D ",
"25;Canon EOS 500D ",
"26;Canon EOS 50D ",
"27;Canon EOS 550D ",
"34;Canon EOS 600D ",
"35;Canon EOS 60D ",
"36;Canon EOS 650D ",
"39;Canon EOS 700D ",
"40;Canon EOS 70D ",
"41;Canon EOS 750D ",
"42;Canon EOS 760D ",
"43;Canon EOS 77D ",
"11;Canon EOS 7D ",
"44;Canon EOS 7D MkII ",
"46;Canon EOS 800D ",
"47;Canon EOS 80D ",
"Canon FullFrame Pro;",
"29;Canon EOS 5D MKIII + battery pack ",
"17;Canon EOS 1D-C ",
"18;Canon EOS 1D-X ",
"19;Canon EOS 1D-X Mk II ",
"Canon Mirrorless;",
"321;Canon EOS M50",
"322;Canon EOS R",
"Nikon FullFrame;",
"75;Nikon D600 ",
"76;Nikon D610 ",
"77;Nikon D700 ",
"81;Nikon D750 ",
"83;Nikon D800",
"85;Nikon D800E ",
"87;Nikon D810 ",
"89;Nikon D850 ",
"Nikon APS-C;",
"55;Nikon D100 ",
"56;Nikon D200 ",
"58;Nikon D300 ",
"60;Nikon D300s ",
"68;Nikon D500 ",
"49;Nikon D40 ",
"50;Nikon D50 ",
"51;Nikon D60 ",
"52;Nikon D70 ",
"53;Nikon D80 ",
"54;Nikon D90 ",
"59;Nikon D3000 ",
"61;Nikon D3100 ",
"62;Nikon D3200 ",
"63;Nikon D3300 ",
"64;Nikon D3400 ",
"69;Nikon D5000 ",
"70;Nikon D5100 ",
"71;Nikon D5200 ",
"72;Nikon D5300 ",
"73;Nikon D5500 ",
"74;Nikon D5600 ",
"78;Nikon D7000 ",
"79;Nikon D7100 ",
"80;Nikon D7200 ",
"82;Nikon D7500 ",
"Nikon FullFrame Pro;",
"57;Nikon D3 ",
"65;Nikon D3s ",
"66;Nikon D4 ",
"67;Nikon D4s ",
"84;Nikon D800 + battery pack",
"86;Nikon D800e + Battery Pack ",
"88;Nikon D810 + battery pack ",
"Sony FullFrame;",
"106;Sony Alpha 7 ",
"107;Sony Alpha 7 II ",
"108;Sony Alpha 7 II r ",
"109;Sony Alpha 7 II s ",
"110;Sony Alpha 7 III ",
"111;Sony Alpha 7 r ",
"112;Sony Alpha 7 s ",
"113;Sony Alpha 7r III ",
"114;Sony Alpha 9 ",
"Sony APS-C;",
"103;Sony Alpha 6000 ",
"104;Sony Alpha 6300 ",
"105;Sony Alpha 6500 ",
"Panasonic 4/3;",
"102;Panasonic GH5s ",
"98;Panasonic GH5 ",
"96;Panasonic GH4 ",
"97;Panasonic GH4r ",
"Olympus 4/3;",
"90;Olympus E-M1 Mk II ",
"91;Olympus E-M10 Mk II ",
"92;Olympus E-M5 Mk II ",
"Leica;",
"48;Leica SL",
];

function insert_categoria($nome) {
	$ps = H::db()->prepare('SELECT A.ID FROM ATTRIBUTO A, ATTRIBUTO_LANG AL WHERE A.ID = AL.ID_ATTRIBUTO AND AL.NOME = :nome AND AL.LANG = :lang');
	$ps->execute([
			':lang' => 'it',
			':nome' => $nome,
		]);

	if ($row = $ps->fetch()) {
		return $row['ID'];
	}
	
	$tipo = 6;
	$id_padre = 0;
	$dettaglio = [
		'codice' => '',
		'parametri' => '',
	];
	
	$params = [
		':codice_old' => '',
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
	$list_lang = ['it', 'en', 'es', 'fr', 'de'];
	foreach ($list_lang as $lang) {
		Utils::update_dettaglio_lang('attributo', $id, $dett_lang,
			$lang,
			[
				'find' => $find,
				'nome' => $nome
			]);	
	}
	return $id;
}

$map = [];
$gruppo = '';
foreach ($list_gruppo_fotocamera as $elem) {
	$elem = explode(';', $elem);
	if (count($elem) == 2) {
		if ($elem[0] != '' && $elem[1] == '') {
			$gruppo = strtolower($elem[0]);
		}
		else {
			if (!isset($map[$gruppo])) {
				$map[$gruppo] = [];
			}
			$map[$gruppo][] = $elem[0];
		}
	}
}

$path_file = HSystem::path('temp') . '/mof.xls';
$reader = PHPExcel_IOFactory::load($path_file);
$lines = $reader->getActiveSheet()->toArray(null,true,false,true);
$lettere = ['B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T',];
/*foreach ($lettere as $let) {
	if (@$lines[1][$let] != '') {
		$gruppo = strtolower($lines[1][$let]);
		if (!isset($map[$gruppo])) {
			echo 'non trovato: ' . $gruppo . "\n";
		}
	}
}*/

$list_obiettivo = [];
for ($l = 2; $l <= count($lines); $l++) {
	if (isset($lines[$l])) {
		foreach ($lettere as $let) {
			if (@$lines[$l][$let] != '') {
				$list_obiettivo[strtolower($lines[$l][$let])] = $lines[$l][$let];
			}
		}
	}
}

foreach ($list_obiettivo as $k => $nome) {
	$list_obiettivo[$k] = insert_categoria($nome);
}

$map_gruppo_obiettivo = [];
foreach ($lettere as $let) {
	if (@$lines[1][$let] != '') {
		$key = strtolower($lines[1][$let]);
		$map_gruppo_obiettivo[$key] = [];
		for ($l = 2; $l <= count($lines); $l++) {
			if (@$lines[$l][$let] != '') {
				$map_gruppo_obiettivo[$key][] = $list_obiettivo[strtolower($lines[$l][$let])];
			}
		}
	}
}

foreach ($map as $gruppo => $list_fotocamera) {
	$list_obiettivo = $map_gruppo_obiettivo[$gruppo];
	foreach ($list_obiettivo as $id_obiettivo) {
		foreach ($list_fotocamera as $id_fotocamera) {
			echo $id_obiettivo . ' ' . $id_fotocamera . "\n";
			$ps = H::db()->prepare('SELECT * FROM ED_OBIETTIVO_FOTOCAMERA WHERE ID_OBIETTIVO = :id_obiettivo AND ID_FOTOCAMERA = :id_fotocamera');
			$ps->execute([
					':id_obiettivo' => $id_obiettivo,
					':id_fotocamera' => $id_fotocamera,
				]);	
			if ($row = $ps->fetch()) {
				
			}
			else {
				$ps = H::db()->prepare('INSERT INTO ED_OBIETTIVO_FOTOCAMERA SET ID_OBIETTIVO = :id_obiettivo, ID_FOTOCAMERA = :id_fotocamera');
				$ps->execute([
						':id_obiettivo' => $id_obiettivo,
						':id_fotocamera' => $id_fotocamera,
					]);
			}
		}
	}
}