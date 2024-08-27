<?php
set_time_limit(0);
H::includeFromLib('PHPExcel/IOFactory.php');
H::includeFromLib('Encoding');
H::includeFromLib('Utils');
H::includeFromLib('AppUtils');

define('_peso', 'A');
define('_id', 'B');
define('_nome1', 'C');
define('_nome2', 'D');
define('_nome3', 'E');

function update_categoria($lang) {
	$path_file = HSystem::path('temp') . '/categorie_' . $lang . '.xls';
	$reader = PHPExcel_IOFactory::load($path_file);
	$lines = $reader->getActiveSheet()->toArray(null,true,false,true);

	for ($l = 2; $l < count($lines); $l++) {
		if (isset($lines[$l])) {
			$id = $lines[$l][_id];
			$id = substr($id, 1);
			
			$ps = H::db()->prepare('SELECT * FROM ATTRIBUTO_LANG WHERE ID_ATTRIBUTO = :id AND LANG = :lang');
			$ps->execute([
					':lang' => $lang,
					':id' => $id,
				]);

			if ($row = $ps->fetch()) {
				$nome = @$lines[$l][_nome1];
				if ($nome == '') {
					$nome = @$lines[$l][_nome2];
				}
				if ($nome == '') {
					$nome = @$lines[$l][_nome3];
				}
				if ($nome == '') {
					echo 'ERRORE nome non trovato ' . $id . "\n";
				}
				else {
					$ps = H::db()->prepare('UPDATE ATTRIBUTO_LANG SET NOME = :nome WHERE ID_ATTRIBUTO = :id AND LANG = :lang');
					$ps->execute([
						':nome' => $nome,
						':lang' => $lang,
						':id' => $id,
					]);
					
					if ($lang == 'it') {
						$ps = H::db()->prepare('UPDATE ATTRIBUTO SET ORDINE = :ordine WHERE ID = :id');
						$ps->execute([
							':ordine' => $lines[$l][_peso],
							':id' => $id,
						]);						
					}
					
					echo $lang . ' ' . $id . "\n";
				}
			}
			else {
				echo 'ERRORE categoria non trovato ' . $id . "\n";
			}	
		}
	}	
}

update_categoria('fr');
//update_categoria('es');
