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
$list_id = H::db2()->selectView('distinct brand_id', 'fotocamera_modello', $params)->listItemsByKey('brand_id');

$params = [
	'abilitato' => 1,
	'per_fotocamera' => 1,
	'id' => $list_id
];
$order_by = 'nome asc';
$list = [];
$rs = H::db2()->selectView('id, nome, codice', 'fotocamera_brand', $params, $order_by);
while ($row = $rs->fetch()) {
	$row['img'] = HString::normalize($row['codice'], '_') . '.png';
	$list[] = $row;
}
H::view('list', $list);
