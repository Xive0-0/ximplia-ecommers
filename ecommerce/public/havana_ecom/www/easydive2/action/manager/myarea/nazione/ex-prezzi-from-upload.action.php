<?php
function parseId($id) {
	$id .= '';
	if (HString::startsWith($id, '#')) {
		return substr($id, 1);
	}
	return $id;
}

function parsePrezzo($value) {
	if ($value == null || $value == '') {
		return 0;
	}
	$value = str_replace(',', '.', $value);
	if (!is_numeric($value)) {
		return 0;
	}
	return $value;
}

function update_data($listCostiSpedizione, $data) {
	$id = $data['id'];
	if (!is_numeric($id)) {
		return false;
	}
	$nazione = H::db2()->selectById('nazione', $id)->item();
	if ($nazione) {
		$dettaglio = (array)json_decode(@$nazione['dettaglio'], true);
		if (!$dettaglio) {
			$dettaglio = [];
		}
		
		$i = 0;
		foreach ($listCostiSpedizione as $elem) {
			if (isset($data['list'][$i])) {
				$dettaglio[$elem['id']] = $data['list'][$i];
			}
			$i++;
		}
		
		$params = [
			'dettaglio' => json_encode($dettaglio),
		];
		H::db2()->updateById('nazione', $params, $id);
		
		return true;	
	}
	return false;
}

$file = H::input('file_data', '');
$path_file = HSystem::path('temp/file', true) . '/' . $file;

$corriere = H::input('corriere', '');
H::lib('Spedizione');
$listCostiSpedizione = null;
$listCorriere = Spedizione::listCostiSpedizione();
foreach ($listCorriere as $key => $list) {
	if ($corriere == $key) {
		$listCostiSpedizione = $list;
		break;
	}
}

if ($listCostiSpedizione) {
	$list_ll = ['D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
		'AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL','AM','AN','AO','AP','AQ','AR','AS','AT','AU','AV','AW','AX','AY','AZ',
		'BA','BB','BC','BD','BE','BF','BG','BH','BI','BJ','BK','BL','BM','BN','BO','BP','BQ','BR','BS','BT','BU','BV','BW','BX','BY','BZ',
		'CA','CB','CC','CD','CE','CF','CG','CH','CI','CJ','CK','CL','CM','CN','CO','CP','CQ','CR','CS','CT','CU','CV','CW','CX','CY','CZ',];
		
	$list_data = [];
	H::lib('ExcelReader');
	$prima = true;
	$lines = new ExcelReader($path_file, 0);
	foreach ($lines as $row) {
		if ($prima) {
			$prima = false;
		}
		else {
			$item = [
				'id' => parseId($row->get('A')),
				'iso' => $row->get('B'),
				'list' => [],
			];
			foreach ($list_ll as $ll) {
				$item['list'][] = parsePrezzo($row->get($ll));
			}
			
			$list_data[] = $item;
		}
	}

	if (count($list_data) > 0) {
		$count_modifica = 0;
		foreach ($list_data as $data) {
			if (update_data($listCostiSpedizione, $data)) {
				$count_modifica++;
			}
		}
					
		H::hson()->success('Dati salvati correttamente, aggiornare la pagina, modificati: ' . $count_modifica . ' nazioni');
	}
	else {
		H::hson()->error('Il file deve contenere almeno 2 righe, la prima è di intestazione');
	}
}
else {
	H::hson()->error('Riferimento corriere non valido');
}