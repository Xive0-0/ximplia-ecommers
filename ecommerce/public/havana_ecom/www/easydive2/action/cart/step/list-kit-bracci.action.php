<?php
include_once 'utils.php';

H::includeFromLib('generic/Articolo');
$id_luce = H::input('id_luce', '');

$params = [
		':lang' => H::context()->currentLang(),
		':tipo' => $_('tipo', 50)
	];
$qryAdd = '';
if ($id_luce != '') {
	$qryAdd = ' ARR.ID_ARTICOLO_1 IN ([:id_articolo]) AND ';
	$params[':id_articolo'] = explode(',', $id_luce);
}	

$ps = H::db()->prepare('SELECT
				A.*,
				AL.*
			FROM
				ARTICOLO A,
				ARTICOLO_LANG AL,
				(SELECT DISTINCT 
					ARR.ID_ARTICOLO_2 ID_ARTICOLO 
				FROM 
					ARTICOLO_RELAZIONE ARB,
					ARTICOLO_RELAZIONE ARR
				WHERE 
					ARB.ID_ARTICOLO_2 = ARR.ID_ARTICOLO_1 AND ' . $qryAdd .
					' ARR.TIPO = 52 AND
					ARB.TIPO = :tipo) AR
			WHERE
				AR.ID_ARTICOLO = A.ID AND
				A.ID = AL.ID_ARTICOLO AND
				AL.LANG = :lang
			ORDER BY A.ORDINE DESC, AL.NOME ASC');
$ps->execute($params);
	
$list = [];
while ($row = $ps->fetch()) {
	$list[] = new Articolo($row);
}

usort($list, 'ordina');

H::view($_('list', 'list'), $list);