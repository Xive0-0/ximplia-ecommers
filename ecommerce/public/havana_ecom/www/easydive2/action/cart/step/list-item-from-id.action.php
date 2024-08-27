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
				A.ID IN ([:list_id])');
$ps->execute([
		':lang' => H::context()->currentLang(),
		':list_id' => $_('list_id')
	]);

$list = [];
while ($row = $ps->fetch()) {
	$list[] = new Articolo($row);
}
H::view($_('list', 'list'), $list);