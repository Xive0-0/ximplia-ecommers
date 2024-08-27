<?php
$key = '';
$id_articolo = intVal(H::input('id_articolo', 0));
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
$params = [
	'abilitato' => 1,
	$key . ':>' => 0
];

$listBrandId = [];
$id_brand_fotocamera = H::input('id_brand_fotocamera', 0);
if ($id_brand_fotocamera > 0) {
	$params['brand_id'] = $id_brand_fotocamera;
}

$order_by = 'nome asc';
$list = [];
$rs = H::db2()->selectView('id, nome, brand_id', 'fotocamera_modello', $params, $order_by);
while ($row = $rs->fetch()) {
	if (!in_array($row['brand_id'], $listBrandId)) {
		$listBrandId[] = $row['brand_id'];
	}
	$list[] = $row;
}
H::view('list', $list);

if ($id_brand_fotocamera <= 0 && count($listBrandId) > 0) {
	$params = [
		'id' => $listBrandId
	];
	$listBrand = H::db2()->selectView('id, nome', 'fotocamera_brand', $params, $order_by)->listItems();
	H::view('listBrand', $listBrand);
}