<?php
function update_data($data) {
	$id = $data['id'];
	if (!is_numeric($id)) {
		return false;
	}
	$parametro_calcolo_spedizione = str_replace(',', '.', $data['peso']);
	if (!is_numeric($parametro_calcolo_spedizione)) {
		return false;
	}	
	$params = [
		'parametro_calcolo_spedizione' => $parametro_calcolo_spedizione,
	];
	H::db2()->updateById('articolo', $params, $id);
	
	return true;
}

$file = H::input('file_data', '');
$path_file = HSystem::path('temp/file', true) . '/' . $file;

$list_data = [];
H::lib('ExcelReader');
$prima = true;
$lines = new ExcelReader($path_file, 0);
foreach ($lines as $row) {
	if ($prima) {
		$prima = false;
	}
	else {
		$list_data[] = [
			'id' => $row->get('A'),
			'peso' => $row->get('D'),
		];
	}
}

if (count($list_data) > 0) {
	$count_modifica = 0;
	foreach ($list_data as $data) {
		if (update_data($data)) {
			$count_modifica++;
		}
	}
				
	H::hson()->success('Dati salvati correttamente, aggiornare la pagina, modificati: ' . $count_modifica . ' articoli');
}
else {
	H::hson()->error('Il file deve contenere almeno 2 righe, la prima è di intestazione');
}