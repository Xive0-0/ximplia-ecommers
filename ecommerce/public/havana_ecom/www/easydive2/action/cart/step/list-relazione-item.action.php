<?php
include_once 'utils.php';

H::includeFromLib('generic/Articolo');
$id_articolo = H::input($_('input', 'id_articolo'), 0);

$ps = H::db()->prepare('SELECT
				A.*,
				AL.*,
				AR.ORDINE ORDINE2
			FROM
				ARTICOLO A,
				ARTICOLO_LANG AL,
				ARTICOLO_RELAZIONE AR
			WHERE
				AR.ID_ARTICOLO_2 = A.ID AND
				AR.TIPO IN (' . $_('tipo') . ') AND
				AR.ID_ARTICOLO_1 = :id_articolo AND
				A.ID = AL.ID_ARTICOLO AND
				AL.LANG = :lang
			ORDER BY A.ORDINE DESC, AL.NOME ASC');

$ps->execute([
		':lang' => H::context()->currentLang(),
		':id_articolo' => $id_articolo
	]);	

$list = [];
while ($row = $ps->fetch()) {
	$list[] = new Articolo($row);
}

usort($list, 'ordina');

H::view($_('list', 'list'), $list);