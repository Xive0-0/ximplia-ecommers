<?php
H::includeFromLib('PHPExcel/IOFactory.php');
$file = H::input()->getFile('file');

$count = 0;
$reader = PHPExcel_IOFactory::load($file['tmp_name']);
$lines = $reader->getActiveSheet()->toArray(null,true,false,true);
for ($l = 0; $l <= count($lines); $l++) {
	$idf = @$lines[$l]['A'];
	if ($idf != '') {
		$ido = @$lines[$l]['B'];
		$ps = H::db()->prepare('SELECT * FROM ATTRIBUTO WHERE ID = :id AND TIPO = 4 AND ID_PADRE != 0');
		$ps->execute([
				':id' => $idf,
			]);	
		if ($row = $ps->fetch()) {
			$list_ido = explode(',', $ido);
			foreach ($list_ido as $ido) {
				$ido = trim($ido);
				if ($ido != '') {
					$ps = H::db()->prepare('DELETE FROM ED_OBIETTIVO_FOTOCAMERA WHERE ID_OBIETTIVO = :id_obiettivo AND ID_FOTOCAMERA = :id_fotocamera');
					$ps->execute([
							':id_obiettivo' => $ido,
							':id_fotocamera' => $idf,
						]);	
					$ps = H::db()->prepare('INSERT INTO ED_OBIETTIVO_FOTOCAMERA SET ID_OBIETTIVO = :id_obiettivo, ID_FOTOCAMERA = :id_fotocamera');
					$ps->execute([
							':id_obiettivo' => $ido,
							':id_fotocamera' => $idf,
						]);	
					$count++;
				}	
			}
		}	
	}	
}

H::context()->put('success', 'Dati correttamente, aggiunti ' . $count . ' righe');