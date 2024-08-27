<?php
set_time_limit(0);
H::includeFromLib('PHPExcel/IOFactory.php');
H::includeFromLib('AppUtils');

$path_file = HSystem::path('temp') . '/accessori_categorie_it.xls';
$reader = PHPExcel_IOFactory::load($path_file);
$lines = $reader->getActiveSheet()->toArray(null,true,false,true);

$map_rel = [];
$listRelazione = AppUtils::getListTipoRelazione();
foreach ($listRelazione as $elem) {
	if ($elem['tipo'] < 50) {
		$map_rel[HString::normalize($elem['label'], '_')] = $elem['tipo'];
	}
}

$map_tag = [];
$map_id_tag = [];
for ($l = 2; $l < count($lines); $l++) {
	if (isset($lines[$l])) {
		if (@$lines[$l]['F'] != '') {
			$tag = $lines[$l]['F'];
			$map_tag[$lines[$l]['B']] = $lines[$l]['F'];
			if (!isset($map_rel[$tag])) {
				echo $tag . " non presente\n";
			}
			else {
				$map_id_tag[$lines[$l]['B']] = $map_rel[$tag];
			}
		}
	}
}

$ps = H::db()->prepare('SELECT
				AA.*
			FROM
				ATTRIBUTO A,
				ARTICOLO_ATTRIBUTO AA
			WHERE
				A.TIPO = 2 AND
				A.ID = AA.ID_ATTRIBUTO');
$ps->execute();
$map_categoria = [];
while ($row = $ps->fetch()) {
	if (!isset($map_categoria['#' . $row['ID_ATTRIBUTO']])) {
		$map_categoria['#' . $row['ID_ATTRIBUTO']] = [];
	}
	$map_categoria['#' . $row['ID_ATTRIBUTO']][] = $row['ID_ENTITA'];
}

$path_file = HSystem::path('temp') . '/accessori.xlsx';
$reader = PHPExcel_IOFactory::load($path_file);
$lines = $reader->getActiveSheet()->toArray(null,true,false,true);

$id_prodotto = null;
$map_prod = [];
for ($l = 2; $l < count($lines); $l++) {
	if (isset($lines[$l])) {
		if (@$lines[$l]['A'] == '') {
			
		}
		else {
			$id_prodotto = @$lines[$l]['A'];
		}
		if (!isset($map_prod[$id_prodotto])) {
			$map_prod[$id_prodotto] = [];
		}
		if (@$lines[$l]['A'] == '') {
			$list = $lines[$l]['D'] . '_';
			if (strtolower($lines[$l]['F']) == 'tutti') {
				$list .= 'tutti';
			}
			else {
				$list .= ',' . $lines[$l]['F'];
				if (@$lines[$l]['G'] != '') {
					$list .= ',' . $lines[$l]['G'];
				}
				if (@$lines[$l]['H'] != '') {
					$list .= ',' . $lines[$l]['H'];
				}
				if (@$lines[$l]['I'] != '') {
					$list .= ',' . $lines[$l]['I'];
				}
				if (@$lines[$l]['J'] != '') {
					$list .= ',' . $lines[$l]['J'];
				}
				if (@$lines[$l]['K'] != '') {
					$list .= ',' . $lines[$l]['K'];
				}
				if (@$lines[$l]['L'] != '') {
					$list .= ',' . $lines[$l]['L'];
				}
				if (@$lines[$l]['M'] != '') {
					$list .= ',' . $lines[$l]['M'];
				}
				if (@$lines[$l]['N'] != '') {
					$list .= ',' . $lines[$l]['N'];
				}
			}
			$map_prod[$id_prodotto][] = $list;
		}
	}
}

foreach ($map_prod as $idp => $list) {
	$idp = substr($idp, 1);
	foreach ($list as $attr) {
		$attr = explode('_', $attr);
		$idc = $attr[0];
		$tipo = 0;
		if (!isset($map_id_tag[$idc])) {
			echo "$idc tipo non presente\n";
		}
		else {
			$tipo = $map_id_tag[$idc];
		}
		if ($tipo > 0) {
			if ($attr[1] == 'tutti') {
				if (!isset($map_categoria[$idc])) {
					$list_id = [];
					echo "$idc non presente\n";
				}
				else {
					$list_id = $map_categoria[$idc];
				}
			}
			else {
				$list_id = [];
				$par = explode(',', $attr[1]);
				foreach ($par as $p) {
					if ($p != '') {
						$p = substr($p, 1);
						if (is_numeric($p)) {
							$list_id[] = $p;
						}
					}
				}
			}
			foreach ($list_id as $id2) {
				$ps = H::db()->prepare('DELETE FROM ARTICOLO_RELAZIONE WHERE ID_ARTICOLO_1 = :id1 AND ID_ARTICOLO_2 = :id2 AND TIPO = :tipo');
				$ps->execute([
					':id1' => $idp,
					':id2' => $id2,
					':tipo' => $tipo,
				]);			
				$ps = H::db()->prepare('INSERT INTO ARTICOLO_RELAZIONE SET ID_ARTICOLO_1 = :id1, ID_ARTICOLO_2 = :id2, TIPO = :tipo');
				$ps->execute([
					':id1' => $idp,
					':id2' => $id2,
					':tipo' => $tipo,
				]);	
			}
		}
	}
	echo $idp . "\n";
}