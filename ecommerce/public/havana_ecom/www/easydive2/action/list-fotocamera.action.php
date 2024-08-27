<?php
H::includeFromLib('AppUtils');
H::includeFromLib('Cache');

$tipo = AppUtils::getIdTipoFromKey('fotocamera');

$file_cache = 'tree_tipo_fotocamera';
$cache = Cache::load($file_cache);
if ($cache == '') {
	$ps = H::db()->prepare('SELECT
					A.*,
					AL.NOME,
					AL.DETTAGLIO_LANG
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
			':tipo' => $tipo
		]);

	H::includeFromLib('generic/Item');
	$map = [];
	while ($row = $ps->fetch()) {
		$item = new Item($row);
		$key = '_' . $item->get('id_padre');
		if (!isset($map[$key])) {
			$map[$key] = [];
		}
		$map[$key][] = $item;
	}
	if (!function_exists('genera_fotocamera')) {
		function genera_fotocamera($map, $parentId, &$html, $level) {
			$key = '_' . $parentId;
			if (isset($map[$key])) {
				$listSub = $map[$key];
				foreach($listSub as $item) {
					if ($level == 1) {
						$html[] = ' <optgroup label="' . $item->get('nome') . '">';
					}
					else {
						$html[] = '<option value="' .  $item->id() . '">';
						$html[] = $item->get('nome');
						$html[] = '</option>';
					}
					
					genera_fotocamera($map, $item->id(), $html, $level + 1);
					if ($level == 1) {
						$html[] = '</optgroup>';
					}
				}
			}
		}
	}
	$html = [];
	genera_fotocamera($map, 0, $html, 1);
	$cache = implode('', $html);
	Cache::store($file_cache, $cache);
}

H::view('treeOptionFotocamera', $cache);
