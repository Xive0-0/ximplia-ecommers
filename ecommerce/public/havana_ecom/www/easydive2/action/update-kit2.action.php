<?php
set_time_limit(0);

$ps = H::db()->prepare('select * from articolo where ordine >= 1000 and tipo = 2');
$ps->execute();
$map_obiettivo = [];
while ($row = $ps->fetch()) {
	$dettaglio = (array)json_decode($row['DETTAGLIO'], true);
	$dettaglio['consigliato'] = '1';
	$psu = H::db()->prepare('update articolo set dettaglio = :dettaglio, ordine = 0 where id = :id');
	$psu->execute([
		':dettaglio' => json_encode($dettaglio),
		':id' => $row['ID'],
	]);
}