<?php
function parseId($id) {
	$id .= '';
	if (HString::startsWith($id, '#')) {
		return substr($id, 1);
	}
	return $id;
}

function parseTempo($tempo) {
	return $tempo;
}

function update_data($listCorrieri, $data) {
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

		foreach ($listCorrieri as $key => $label) {
			$dettaglio[$key . '_tempo_spedizione'] = $data[$key];
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
	
$list_data = [];
H::lib('Spedizione');
H::lib('ExcelReader');
$prima = true;
$lines = new ExcelReader($path_file, 0);
foreach ($lines as $row) {
	if ($prima) {
		$prima = false;
	}
	else {
		$list_data[] = [
			'id' => parseId($row->get('A')),
			'iso' => $row->get('B'),
			'dhl_express' => parseTempo($row->get('D')),
			'dhl_standard' => parseTempo($row->get('E')),
			'ups_express' => parseTempo($row->get('F')),
			'ups_standard' => parseTempo($row->get('G')),
			'fedex_express' => parseTempo($row->get('H')),
			'fedex_standard' => parseTempo($row->get('I')),
			'gls_express' => parseTempo($row->get('J')),
			'gls_standard' => parseTempo($row->get('K')),
		];
	}
}

if (count($list_data) > 0) {
	$count_modifica = 0;
	$listCorrieri = Spedizione::listCorrieri();
	foreach ($list_data as $data) {
		if (update_data($listCorrieri, $data)) {
			$count_modifica++;
		}
	}
				
	H::hson()->success('Dati salvati correttamente, aggiornare la pagina, modificati: ' . $count_modifica . ' nazioni');
}
else {
	H::hson()->error('Il file deve contenere almeno 2 righe, la prima è di intestazione');
}