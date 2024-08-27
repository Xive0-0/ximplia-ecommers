<?php
set_time_limit(0);
ini_set('memory_limit', '512M');

H::lib('AppUtils');
H::lib('generic/Articolo');

function formatValue($value) {
	$value = str_replace(['"', ';'], ['', ' '], $value);
	return $value;
}

$lang = H::input('lang', H::config('default_language', 'it'));

$file_name = 'export_pesi_spedizione_' . date('YmdHi') . '.csv';
$file_path = HSystem::path('temp/export', true) . '/' . $file_name;	
$handler = fopen($file_path, 'w');

$data = [
	'HID',
	'CODICE',
	'NOME',
	'PESO',
];
$data = implode(';', $data) . "\n";
$data = iconv(mb_detect_encoding($data), 'Windows-1252//TRANSLIT', $data );
fwrite($handler, $data);

$number = 2500;
$params = [
	':lang' => $lang,
	':number' => $number
];

$map = new HHashMap();
$map_labels = new HHashMap();
$list_all_keys = [];
$start = 0;
$continua = true;
while ($continua) {
	$params['start'] = $start;
	$ps = H::db()->prepare('SELECT
					A.ID,
					A.CODICE,
					A.PARAMETRO_CALCOLO_SPEDIZIONE,
					AL.NOME
				FROM
					ARTICOLO A,
					ARTICOLO_LANG AL
				WHERE
					A.ID = AL.ID_ARTICOLO AND
					AL.LANG = :lang
				ORDER BY A.ID ASC
				LIMIT :start,:number');
	$ps->execute($params);
	
	$count = 0;
	while ($row = $ps->fetch()) {
		$data = [
			$row['ID'],
			$row['CODICE'],
			$row['NOME'],
			HFormatter::euro($row['PARAMETRO_CALCOLO_SPEDIZIONE']),
		];		

		$data = implode(';', $data) . "\n";
		$data = iconv(mb_detect_encoding($data), 'Windows-1252//TRANSLIT', $data );
		fwrite($handler, $data);
		$count++;
	}
	
	if ($count > 0) {		
		$start += $number;
	}
	else {
		$continua = false;
	}
}

fclose($handler);

H::view('download_file_name', $file_name);
H::view('download_file_path', $file_path);