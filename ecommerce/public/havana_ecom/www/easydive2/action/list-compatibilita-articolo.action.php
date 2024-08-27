<?php
H::includeFromLib('AppUtils');

function load_compatibilita($articolo, $tipo) {
	$ps = H::db()->prepare('SELECT
					A.*,
					AL.NOME
				FROM
					ATTRIBUTO A,
					ATTRIBUTO_LANG AL
				WHERE
					A.ABILITATO = true AND
					A.ID = AL.ID_ATTRIBUTO AND
					AL.LANG = :lang AND
					A.TIPO = :tipo
				ORDER BY A.ORDINE DESC, AL.FIND ASC');
	$ps->execute([
			':lang' => H::context()->currentLang(),
			':tipo' => AppUtils::getIdTipoFromKey($tipo)
		]);

	H::includeFromLib('generic/Item');
	$map = [];
	while ($row = $ps->fetch()) {
		$item = new Item($row);
		$map['_' . $item->id()] = $item;
	}
	
	$list_compatibilita = $articolo->get('id_' . $tipo);
	if ($list_compatibilita) {
		$map_compatibilita = [];
		foreach ($list_compatibilita as $idc) {
			$key = '_' . $idc;
			if (isset($map[$key]) && $map[$key]->get('id_padre') > 0) {
				$key_p = '_' . $map[$key]->get('id_padre');
				if (!isset($map_compatibilita[$key_p])) {
					$map_compatibilita[$key_p] = [
						'base' => $map[$key_p],
						'list' => []
					];
				}
				$map_compatibilita[$key_p]['list'][] = $map[$key]->get('nome');
			}		
		}
		H::view('compatibilita_' . $tipo, $map_compatibilita);
	}
}

$articolo = H::view()->get('item');
if ($articolo) {
	load_compatibilita($articolo, 'cellulare');
	load_compatibilita($articolo, 'fotocamera');
}