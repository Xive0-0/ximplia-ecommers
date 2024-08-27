<?php
set_time_limit(0);
H::includeFromLib('PHPExcel/IOFactory.php');
H::includeFromLib('Encoding');
H::includeFromLib('Utils');
H::includeFromLib('AppUtils');

define('_id', 'A');
define('_descrizione_breve', 'J');
define('_descrizione', 'K');
define('_scheda_tecnica', 'L');
define('_testo_indicazioni', 'M');

function update() {
	$path_file = HSystem::path('temp') . '/update_prodotto_it.xlsx';
	$reader = PHPExcel_IOFactory::load($path_file);
	$lines = $reader->getActiveSheet()->toArray(null,true,false,true);

	$lang = 'it';
	for ($l = 1; $l < count($lines); $l++) {
		if (isset($lines[$l])) {
			$id = $lines[$l][_id];

			$ps = H::db()->prepare('SELECT * FROM ARTICOLO_LANG WHERE ID_ARTICOLO = :id AND LANG = :lang');
			$ps->execute([
					':lang' => $lang,
					':id' => $id,
				]);

			if ($row = $ps->fetch()) {
				$dettaglio = (array)json_decode($row['DETTAGLIO_LANG'], true);
				
				$dettaglio['descrizione_breve'] = @$lines[$l][_descrizione_breve];
				$dettaglio['scheda_tecnica'] = @$lines[$l][_scheda_tecnica];
				$dettaglio['descrizione'] = @$lines[$l][_descrizione];
				$dettaglio['testo_indicazioni'] = @$lines[$l][_testo_indicazioni];
				
				$ps = H::db()->prepare('UPDATE ARTICOLO_LANG SET DETTAGLIO_LANG = :dettaglio WHERE ID_ARTICOLO = :id AND LANG = :lang');
				$ps->execute([
					':dettaglio' => json_encode($dettaglio),
					':lang' => $lang,
					':id' => $id,
				]);
				
				echo $id . "\n";
			}
			else {
				echo 'ERRORE articolo non trovato ' . $id . "\n";
			}	
		}
	}	
}

update();
