<?php
H::lib('AppUtils');
H::lib('Cache');

$tipo = AppUtils::getIdTipoFromKey($_('type'));

$file_cache = 'tree_tipo_' . $_('type');
if ($_('cache_abilitata', true)) {
	$cache = Cache::load($file_cache);
}
else {
	$cache = '';
}
if ($cache == '') {
	$parent_from_root = false;
	$parent_id = $_('parent_id', null);
	if (is_null($parent_id)) {
		$id_attributo_list = H::input()->getArrayClean('coll_id', []);
		if (count($id_attributo_list) == 1) {
			$parent_id = $id_attributo_list[0];
			if (is_numeric($parent_id) && $parent_id > 0) {
				$parent_from_root = $_('parent_from_root', true);
			}
		}
		else {
			$parent_id = 0;
		}
	}
	
	$ps = H::db()->prepare('SELECT
					A.*,
					AL.NOME,
					AL.DETTAGLIO_LANG
				FROM
					ATTRIBUTO A,
					ATTRIBUTO_LANG AL
				WHERE
					(A.VISIBILITA_LANG = \'-\' OR A.VISIBILITA_LANG LIKE :visibilita) AND
					A.ABILITATO = true AND
					A.ID = AL.ID_ATTRIBUTO AND
					AL.LANG = :lang AND
					A.TIPO = :tipo
				ORDER BY A.ORDINE DESC, AL.FIND ASC');
	$ps->execute([
			':visibilita' => '%' . AppUtils::visibilitaLang() . ',%',
			':lang' => H::context()->currentLang(),
			':tipo' => $tipo
		]);

	H::lib('generic/Item');
	$map = [];
	$map_pf = new HHashMap();
	
	while ($row = $ps->fetch()) {
		$item = new Item($row);
		$key = '_' . $item->get('id_padre');
		if (!isset($map[$key])) {
			$map[$key] = [];
		}
		$map[$key][] = $item;
		if ($parent_from_root) {
			$map_pf->put($item->id(), $item->get('id_padre'));
		}
	}
	if ($parent_from_root) {
		$padre = $parent_id;
		while ($padre) {
			$parent_id = $padre;
			$padre = $map_pf->get($padre);
		}
	}
	
	$add_parent_in_sublist = $_('add_parent_in_sublist', false);
	$add_icon_plus = $_('add_icon_plus', false);
	if (!function_exists('genera')) {
		function genera($map, $parentId, &$html, $level, &$current, $add_parent_in_sublist, $add_icon_plus, $wrap_sub, $icona) {
			$key = '_' . $parentId;
			if (isset($map[$key])) {
				$listSub = $map[$key];
				if ($level > 1) {
					if ($wrap_sub) {
						$html[] = '<div class="tree-sub" data-level="' . $level . '">';
					}
					$html[] = '<div class="ul-tree" data-level="' . $level . '"><ul>';
				}
				if ($add_parent_in_sublist && $current != null && count($listSub) > 0) {
					$html[] = '<li class="tree" data-numero-item="' . $current->get('numero_item', 0) . '" data-id="' . $current->id() . '" data-codice="' . $current->get('codice', '') . '" data-level="' . $level . '">';
					if ($add_icon_plus) {
						$html[] = '<span class="tree-icon-plus"></span>';
					}
					$html[] = '<a href="' . $current->url() . '" class="level' . $level . '" title="' . $current->get('nome') . '" data-titolo-pagina="' . $current->get('titolo_pagina', $current->get('nome')) . '" data-id="' . $current->id() . '" data-codice="' . $current->get('codice', '') . '">';
					if ($icona != '' &&
						$current->isImage()) {
						$html[] = '<img src="' . $current->imageUrl($icona) . '">';
					}
					$html[] = AppUtils::getNameParentTreeAttributo($current);
					$html[] = '<span class="tree-items-number">(' . $current->get('numero_item', 0) . ')</span>';
					$html[] = '</a></li>';		
				}
				foreach($listSub as $item) {
					$html[] = '<li class="tree" data-numero-item="' . $item->get('numero_item', 0) . '" data-id="' . $item->id() . '" data-codice="' . $item->get('codice', '') . '" data-level="' . $level . '">';
					if ($add_icon_plus) {
						$html[] = '<div class="inner-tree"><span class="tree-icon-plus"></span>';
					}
					$html[] = '<a href="' . $item->url() . '" class="level' . $level . '" title="' . $item->get('nome') . '" data-titolo-pagina="' . $item->get('titolo_pagina', $item->get('nome')) . '" data-id="' . $item->id() . '" data-codice="' . $item->get('codice', '') . '">';
					if ($icona != '' &&
						$item->isImage()) {
						$html[] = '<img src="' . $item->imageUrl($icona) . '">';
					}
					$html[] = $item->get('nome');
					$html[] = '<span class="tree-items-number">(' . $item->get('numero_item', 0) . ')</span>';
					$html[] = '</a>';
                    if ($add_icon_plus) {
                        $html[] = '</div>';
                    }
					genera($map, $item->id(), $html, $level + 1, $item, $add_parent_in_sublist, $add_icon_plus, $wrap_sub, $icona);
                    $html[] = '</li>';
				}
				if ($level > 1) {
					$html[] = '</ul></div>';
					if ($wrap_sub) {
						$html[] = '</div>';
					}
				}
			}
		}
	}
	$html = [];
	$current = null;
	genera($map, $parent_id, $html, 1, $current, $add_parent_in_sublist, $add_icon_plus, $_('wrap_sub'), $_('icona', ''));
	$cache = implode('', $html);
	if ($_('cache_abilitata', true)) {
		Cache::store($file_cache, $cache);
	}
}

H::view($_('tree', 'tree'), $cache);
