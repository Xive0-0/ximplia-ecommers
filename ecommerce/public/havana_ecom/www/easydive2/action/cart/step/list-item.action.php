<?php
include_once 'utils.php';

H::includeFromLib('generic/Articolo');

$strQry = 'SELECT
				A.*,
				AL.*,
				AR.ORDINE ORDINE2
			FROM
				ARTICOLO A,
				ARTICOLO_LANG AL,
				ARTICOLO_ATTRIBUTO AA,
				ATTRIBUTO AT, 
				ARTICOLO_RELAZIONE AR
			WHERE
				AR.ID_ARTICOLO_2 = A.ID AND
				AR.TIPO = 53 AND
				AR.ID_ARTICOLO_1 = :id_articolo AND
				AT.CODICE_LOAD = :codice_load AND
				AA.ID_ATTRIBUTO = AT.ID AND
				AA.TIPO = 2 AND
				AA.ID_ENTITA = A.ID AND
				A.ID = AL.ID_ARTICOLO AND
				AL.LANG = :lang
			ORDER BY A.ORDINE DESC, AL.NOME ASC';	
			
$ps = H::db()->prepare($strQry);
$ps->execute([
		':lang' => H::context()->currentLang(),
		':codice_load' => $_('codice'),
		':id_articolo' => H::input('id_articolo', 0)
	]);

$list = [];
while ($row = $ps->fetch()) {
	$list[] = new Articolo($row);
}

usort($list, 'ordina');

H::view($_('list', 'list'), $list);