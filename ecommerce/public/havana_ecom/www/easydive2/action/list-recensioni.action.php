<?php
H::includeFromLib('AppUtils');

$articolo = H::view()->get('item');
if ($articolo) {
	$ps = H::db()->prepare('SELECT
					*
				FROM
					ED_RECENSIONE
				WHERE
					LANG = :lang AND
					ID_ARTICOLO = :id_articolo');
	$ps->execute([
			':lang' => H::context()->currentLang(),
			':id_articolo' => $articolo->id()
		]);
}
else {
	$ps = H::db()->prepare('SELECT
					*
				FROM
					ED_RECENSIONE
				WHERE
					LANG = :lang
				ORDER BY RAND()');
	$ps->execute([
			':lang' => H::context()->currentLang(),
		]);	
}
H::includeFromLib('generic/Item');
$list = [];
while ($row = $ps->fetch()) {
	$list[] = new Item($row);
}

H::view('listRecensioni', $list);