<?php
$id = H::input('id', 0);

$qryList = [
	'DELETE FROM ED_AMBASSADOR_LANG WHERE ID_ED_AMBASSADOR = :id',
	'DELETE FROM ED_AMBASSADOR WHERE ID = :id'
];
	
H::includeFromLib('Utils');

H::db()->beginTransaction();

Utils::delete_item($qryList, $id);
	
H::db()->commit();
	
H::context()->put('success', 'Ambassador eliminato correttamente');
