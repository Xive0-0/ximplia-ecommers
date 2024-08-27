<?php
$id = H::input('id', 0);

$qryList = [
	'DELETE FROM ED_RECENSIONE WHERE ID = :id'
];

H::includeFromLib('Utils');

Utils::delete_item($qryList, $id);

H::context()->put('success', 'Recensione eliminata correttamente');
