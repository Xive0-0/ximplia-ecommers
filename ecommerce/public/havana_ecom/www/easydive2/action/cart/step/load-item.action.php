<?php
H::includeFromLib('generic/Articolo');

$ps = H::db()->prepare('SELECT
				A.*,
				AL.*
			FROM
				ARTICOLO A,
				ARTICOLO_LANG AL
			WHERE
				A.ID = AL.ID_ARTICOLO AND
				AL.LANG = :lang AND
				A.CODICE = :codice');
$ps->execute([
		':lang' => H::context()->currentLang(),
		':codice' => $_('codice')
	]);

if ($row = $ps->fetch()) {
	$item = new Articolo($row);
	H::view($_('item', 'item'), $item);
}