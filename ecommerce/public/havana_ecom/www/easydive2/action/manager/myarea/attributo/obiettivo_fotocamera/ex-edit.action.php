<?php
$id = H::input('id', 0);

H::db()->beginTransaction();

$ps = H::db()->prepare('DELETE FROM ED_OBIETTIVO_FOTOCAMERA WHERE ID_OBIETTIVO = :id_obiettivo');
$ps->execute([
		':id_obiettivo' => $id,
	]);	
$id_fotocamera = H::input()->getArrayClean('id_fotocamera');
if ($id_fotocamera) {
	foreach ($id_fotocamera as $idf) {
		$ps = H::db()->prepare('SELECT * FROM ATTRIBUTO WHERE ID = :id AND TIPO = 4 AND ID_PADRE != 0');
		$ps->execute([
				':id' => $idf,
			]);	
		if ($row = $ps->fetch()) {
			$ps = H::db()->prepare('INSERT INTO ED_OBIETTIVO_FOTOCAMERA SET ID_OBIETTIVO = :id_obiettivo, ID_FOTOCAMERA = :id_fotocamera');
			$ps->execute([
					':id_obiettivo' => $id,
					':id_fotocamera' => $idf,
				]);	
		}
	}
}

H::db()->commit();

H::context()->put('success', 'Dati salvati correttamente');
