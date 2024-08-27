<?php
$id = H::input('id', 0);

$qryList = [
	'DELETE FROM ED_EASYDIVEPOINT_LANG WHERE ID_ED_EASYDIVEPOINT = :id',
	'DELETE FROM ED_EASYDIVEPOINT WHERE ID = :id'
];
	
H::includeFromLib('Utils');

H::db()->beginTransaction();

Utils::delete_item($qryList, $id);
	
H::db()->commit();
	
H::context()->put('success', 'Easydive point eliminato correttamente');
