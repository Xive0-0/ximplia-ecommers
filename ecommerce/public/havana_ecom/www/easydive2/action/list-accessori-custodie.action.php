<?php
H::includeFromLib('AppUtils');
H::includeFromLib('generic/Articolo');

$id = H::input('id', 0);

$strQry = 'SELECT
		A.*,
		AL.*,
		AR.TIPO AS TIPO_RELAZIONE
	FROM	
		ARTICOLO A,
		ARTICOLO_LANG AL,
		(
			SELECT ID_ARTICOLO_2 AS ID, ORDINE, TIPO FROM ARTICOLO_RELAZIONE WHERE ID_ARTICOLO_1 = :id1
		) AR
	WHERE
		A.ID = AL.ID_ARTICOLO AND 
		AL.LANG = :lang AND
		A.ID = AR.ID AND
		A.TIPO < 2
	ORDER BY A.ORDINE DESC, AL.NOME ASC';
$ps = H::db()->prepare($strQry);
$ps->execute([
	':id1' => $id,
	':lang' => H::context()->currentLang()
]);
$map = [];
while ($row = $ps->fetch()) {
	$item = new Articolo($row);
	if (!isset($map['_' . $row['TIPO_RELAZIONE']])) {
		$map['_' . $row['TIPO_RELAZIONE']] = [];
	}
	$map['_' . $row['TIPO_RELAZIONE']][] = $item;
}

$listTipoRelazione = AppUtils::getListTipoRelazione();

$list = [];
foreach ($listTipoRelazione as $elem) {
	if ($elem['tipo'] > 1 && $elem['tipo'] < 50) {
		$tipo = $elem['tipo'];
		if (isset($map['_' . $tipo]) && count($map['_' . $tipo]) > 0) {
			$list[] = [
				'id' => $elem['tipo'],
				'nome' => 'accessorio_' . HString::normalize($elem['label'], '_'),
				'list' => $map['_' . $tipo],
			];
		}	
	}
}
H::view('listAccessori', $list);
