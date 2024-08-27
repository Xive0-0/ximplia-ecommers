<?php
$id_fotocamera = H::input('id_fotocamera', 0);
$fotocamera = H::db2()->selectById('fotocamera_modello', $id_fotocamera)->item();
if ($fotocamera) {
	$params = [
		'abilitato' => 1,
		'mount_lens' => explode(',', $fotocamera['mount_lens']),
	];
	$id_articolo = 0;
	$per_articolo = H::input('per_articolo', '');
	if (is_numeric($per_articolo)) {
		$per_articolo = intVal($per_articolo);
		$id_articolo = $per_articolo;
		switch($per_articolo) {
		case 224:
			$codice_articolo = 'HOU/LEO3-WI';
			break;
		case 915:
			$codice_articolo = 'HOU/LEO3-WI-PLUS';
			break;
		default:
			$codice_articolo = '';
		}
	}
	else {
		$codice_articolo = strtoupper($per_articolo);
	}
	switch($codice_articolo) {
	case 'HOU/LEO3-WI':
	case 'HOU/LEO3-WI-PLUS':
		$params['diameter_mm:<'] = 90;
		break;
	default:
		$params['diameter_mm:<'] = 100;
		break;
	}
	
	if ($id_articolo <= 0) {
		$id_articolo = intVal(H::input('id_articolo', 0));
	}
	switch ($id_articolo) {
	case 224:
		$key = 'leo3_wi_dic_mm';
		break;
	case 915:
		$key = 'leo3_wi_plus_dic_mm';
		break;
	case 176:
		$key = 'leo3_dic_mm';
		break;
	case 223:
		$key = 'leo3_plus_dic_mm';
		break;
	case 840:
		$key = 'leor_dic_mm';
		break;
	}
	
	$listBrandId = [];
	$order_by = 'nome asc';
	$rs = H::db2()->selectView('id, nome, length_mm, brand_id', 'fotocamera_obiettivo', $params, $order_by);
	$list = [];
	while ($row = $rs->fetch()) {
		$dist = $row['length_mm'] - $fotocamera[$key];
		if ($dist >= 0 && $dist <= 130) {
			if (!in_array($row['brand_id'], $listBrandId)) {
				$listBrandId[] = $row['brand_id'];
			}
			$list[] = $row;
		}
	}
	
	H::view('list', $list);
	
	if (count($listBrandId) > 0) {
		$params = [
			'id' => $listBrandId
		];
		$listBrand = H::db2()->selectView('id, nome', 'fotocamera_brand', $params, $order_by)->listItems();
		H::view('listBrand', $listBrand);
	}
}
