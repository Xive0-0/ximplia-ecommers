<?php
H::includeFromLib('AppUtils');

$start = H::input('start', 0);
$number = 20;
$find = $_('find', false);
$id_attributo_list = H::input()->getArrayClean($_('id_collezione', 'coll_id'), []);
$query = H::input('query', '');

$queryParams = [
	':lang' => H::context()->currentLang(),
];
H::includeFromLib('generic/Item');

$table = '';
$where = '';
$title = '';
$urlAddParams = [];
if ($id_attributo_list != null && count($id_attributo_list) > 0) {
	$table .= ', (';
	if ($_('attributo_all', false)) {
		$table .= 'SELECT AAI.ID_ENTITA
		FROM 
			ATTRIBUTO AI,
			ARTICOLO_ATTRIBUTO AAI
		WHERE
			AI.ABILITATO = true AND
			AI.ID = AAI.ID_ATTRIBUTO AND
			AAI.ID_ATTRIBUTO IN ([:id_attributo])
		GROUP BY AAI.ID_ENTITA
		HAVING COUNT(AAI.ID_ENTITA) = :count_id_attributo';
		$queryParams[':count_id_attributo'] = count($id_attributo_list);
	}
	else {
		$table .= 'SELECT DISTINCT AAI.ID_ENTITA 
			FROM 
				ATTRIBUTO AI,
				ARTICOLO_ATTRIBUTO AAI
			WHERE
				AI.ABILITATO = true AND
				AI.ID = AAI.ID_ATTRIBUTO AND
				AAI.ID_ATTRIBUTO IN ([:id_attributo])';
	}
	$table .= ') AA';
	$where .= ' AND A.ID = AA.ID_ENTITA ';
	$title = 'risultato ricerca';
	$queryParams[':id_attributo'] = $id_attributo_list;
	$urlAddParams[] = 'coll_id=' . implode(',', $id_attributo_list);
}
$_lbl = H::labels('global');
if ($query != '' || $find) {
	$find = true;
	$norm_query = HString::normalize($query);
	$where .= ' AND AL.FIND LIKE :query ';
	$queryParams[':query'] = '%' . $norm_query . '%';
	$title = @$_lbl['risultato_ricerca'];
	$urlAddParams[] = 'query=' . urlencode($query);
}

$title = trim($title);
$total = 0;
$list = [];

$baseQry = 'FROM
				ED_EASYDIVEPOINT A,
				ED_EASYDIVEPOINT_LANG AL' . $table . '
			WHERE
				A.ABILITATO = true AND
				A.ID = AL.ID_ED_EASYDIVEPOINT AND
				AL.LANG = :lang AND
				A.ABILITATO = 1' . $where;

$ps = H::db()->prepare('
			SELECT
				COUNT(A.ID) AS NUM
			' . $baseQry);
			
$ps->execute($queryParams);
if ($row = $ps->fetch()) {
	$total = $row['NUM'];
}

$queryParams[':start'] = $start;
$queryParams[':number'] = $number;
				
$ps = H::db()->prepare('
			SELECT
				A.*,
				AL.*
			' . $baseQry . '
			ORDER BY A.ORDINE DESC, AL.NOME ASC
			LIMIT :start,:number');
$ps->execute($queryParams);
while ($row = $ps->fetch()) {
	$list[] = new Item($row);
}

$title_coll = '';
$collezione = null;
if (H::input('coll_title', false) ||
	($id_attributo_list != null && 
	is_array($id_attributo_list) &&
	count($id_attributo_list) == 1)) {
	$ps = H::db()->prepare('
		SELECT
			A.*,
			AL.*
		FROM
			ATTRIBUTO A,
			ATTRIBUTO_LANG AL
		WHERE
			A.ID = AL.ID_ATTRIBUTO AND
			AL.LANG = :lang AND
			ID = :id');
	$ps->execute([
		':id' => $id_attributo_list[0],
		':lang' => H::context()->currentLang(),
	]);
	H::context()->put('coll_id', $id_attributo_list[0]);
	if ($row = $ps->fetch()) {
		$collezione = new Item($row);
		$title_coll = $collezione->get('titolo_pagina', $collezione->get('nome'));
	}
}
if ($title_coll != '') {
	$title = $title_coll;
}

if ($total % $number == 0) {
	$lastStart = $total - $number;
}
else {
	$lastStart = $total - ($total % $number);
}

$result = [
	'collezione' => $collezione,
	'coll_id' => $id_attributo_list,
	'query' => $query,
	'title' => $title,
	'total' => $total,
	'list' => $list,
	'find' => $find,
	'numberNext' => $number,
	'prevStart' => $start - $number,
	'nextStart' => $start + $number,
	'lastStart' => $lastStart,
	'urlAddParams' => implode('&', $urlAddParams),
];
H::view($_('result', 'result'), $result);
