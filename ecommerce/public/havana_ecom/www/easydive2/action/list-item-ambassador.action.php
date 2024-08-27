<?php
$start = $_('start', 0);
$number = $_('number', 0);

$strQry = 'SELECT
				A.*,
				AL.*
			FROM
				ED_AMBASSADOR A,
				ED_AMBASSADOR_LANG AL';

$params = [
	':lang' => H::context()->currentLang(),
	':start' => $start,
	':number' => $number,
];

switch($_('order_type', 'desc')) {
case 'asc':
	$orderType = 'ASC ';
	break;
default:
	$orderType = 'DESC ';
	break;
}

switch($_('order', '')) {
case 'data_inserimento':
	$orderBy = ' A.DATA_INSERIMENTO ' . $orderType;
	break;
case 'data_modifica':
	$orderBy = ' A.DATA_MODIFICA ' . $orderType;
	break;
case 'titolo':
	$orderBy = ' AL.TITOLO ' . $orderType;
	break;
default:
	$orderBy = 'A.ORDINE ' . $orderType . ', A.ID ' . $orderType;
}

if ($_('categoria_by_id', false)) {
	$id = H::input('id', 0);
	$ps = H::db()->prepare('SELECT AAI.ID_ATTRIBUTO FROM ATTRIBUTO AI, ARTICOLO_ATTRIBUTO AAI WHERE AI.ABILITATO = true AND AI.ID = AAI.ID_ATTRIBUTO AND AAI.TIPO = 1000 AND AAI.ID_ENTITA = :id');
	$ps->execute([
		':id' => $id
	]);
	if ($row = $ps->fetch()) {
		$strQry .= ', ARTICOLO_ATTRIBUTO AA
					WHERE 
						AA.ID_ENTITA = A.ID AND
						AA.TIPO = 1000 AND
						AA.ID_ATTRIBUTO = :id_categoria AND ';
		$params[':id_categoria'] = $row['ID_ATTRIBUTO'];
		$orderBy = 'RAND()';
	}
}
else {
	$strQry .= ' WHERE ';
}			
$strQry .= 'A.ID = AL.ID_ED_AMBASSADOR AND
			AL.LANG = :lang AND
			A.ABILITATO = 1';
if ($_('show_home', false)) {
	$strQry .= ' AND A.SHOW_HOME = 1 ';
}
			
H::includeFromLib('Utils');
$not_in = Utils::id_not_in();
if ($not_in != null) {
	$params[':not_in'] = $not_in;
	$strQry .= ' AND A.ID NOT IN ([:not_in])';
}
$strQry .= ' ORDER BY ' . $orderBy . ' LIMIT :start,:number';
$ps = H::db()->prepare($strQry);

$ps->execute($params);

$list = [];
H::includeFromLib('generic/Item');
while ($row = $ps->fetch()) {
	$list[] = new Item($row);
}

H::view($_('list', 'list'), $list);
