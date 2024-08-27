<?php
$listId = H::input('id', '');
if ($listId != '') {
	$spese_spedizione = H::input('spese_spedizione', 'a');

	$ps = H::db()->prepare('UPDATE ARTICOLO SET SPESE_SPEDIZIONE = :spese_spedizione WHERE ID_VARIANTE IN ([:id])');
	$ps->bindValue(':spese_spedizione', $spese_spedizione);
	$ps->bindValue(':id', explode(',', $listId));
	$ps->execute();
	
	H::context()->put('success', 'Dati salvati correttamente');
}
else {
	H::context()->put('error', 'Nessuna voce selezionata');
}
?>