<?php
H::includeFromLib('AppUtils');
AppUtils::sorgente_traking_ordini();

$id = H::input('id', 0);

$strQry = 'SELECT
				A.*,
				AL.*
			FROM
				ED_AMBASSADOR A,
				ED_AMBASSADOR_LANG AL
			WHERE
				A.ID = AL.ID_ED_AMBASSADOR AND
				AL.LANG = :lang AND
				A.ABILITATO = 1 AND
				A.ID = :id';

$ps = H::db()->prepare($strQry);
$ps->execute([
	':lang' => H::context()->currentLang(),
	':id' => $id
]);

if ($row = $ps->fetch()) {
	H::includeFromLib('generic/Item');
	$item = new Item($row);
	
	H::includeFromLib('Utils');
	Utils::add_merge_params($item);
	Utils::add_relazione_dettaglio_item($item);
		
	H::view($_('item', 'item'), $item);
	H::view('item_type_blog', true);
	H::view('metafacebook', true);
	
	H::includeFromLib('Utils');
	Utils::id_not_in($item->id());
}
else {
	H::forward('data-not-found');
}