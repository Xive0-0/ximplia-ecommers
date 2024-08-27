<?php
H::includeFromLib('generic/Item');

$id = H::input('id', 0);

$ps = H::db()->prepare('SELECT ID_FOTOCAMERA FROM ED_OBIETTIVO_FOTOCAMERA WHERE ID_OBIETTIVO = :id_obiettivo');
$ps->execute([
		':id_obiettivo' => $id,
	]);	
$item = [
	'ID_FOTOCAMERA' => []
];
while ($row = $ps->fetch()) {
	$item['ID_FOTOCAMERA'][] = $row['ID_FOTOCAMERA'];
}
$item = new Item($item);
H::view('item_abbinamento', $item);