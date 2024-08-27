<?php
set_time_limit(0);

$ps = H::db()->prepare('SELECT * FROM ARTICOLO_LANG');
$ps->execute();

while ($row = $ps->fetch()) {
	$lang = $row['LANG'];
	$id = $row['ID_ARTICOLO'];
	$dettaglio = (array)json_decode($row['DETTAGLIO_LANG'], true);
	
	unset($dettaglio['patent']);
	unset($dettaglio['lifetime']);
	unset($dettaglio['universal_housing']);
	unset($dettaglio['waterproof']);
	
	$psu = H::db()->prepare('UPDATE ARTICOLO_LANG SET DETTAGLIO_LANG = :dettaglio WHERE ID_ARTICOLO = :id AND LANG = :lang');
	$psu->execute([
		':dettaglio' => json_encode($dettaglio),
		':lang' => $lang,
		':id' => $id,
	]);
	
	echo $lang . ' ' . $id . "\n";
}