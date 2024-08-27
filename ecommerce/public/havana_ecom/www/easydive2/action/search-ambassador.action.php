<?php
H::includeFromLib('generic/Item');

$ps = H::db()->prepare('SELECT
				A.*,
				AL.*,
				AAL.ID_ATTRIBUTO AS CATEGORIA_ID,
				AAL.NOME AS CATEGORIA_NOME
			FROM
				ED_AMBASSADOR A,
				ED_AMBASSADOR_LANG AL,
				ARTICOLO_ATTRIBUTO AA,
				ATTRIBUTO_LANG AAL
			WHERE
				A.ABILITATO = true AND
				A.ID = AL.ID_ED_AMBASSADOR AND
				AL.LANG = :lang AND
				A.ABILITATO = 1 AND
				AA.ID_ENTITA = A.ID AND
				AA.TIPO = 8 AND
				AA.ID_ATTRIBUTO = AAL.ID_ATTRIBUTO AND
				AAL.LANG = :lang1
			ORDER BY A.ORDINE DESC, AL.NOME ASC');			
$ps->execute([
	':lang' => H::context()->currentLang(),
	':lang1' => H::context()->currentLang(),
]);
$list = [];
while ($row = $ps->fetch()) {
	$item = new Item($row);
	$key = '_' . $item->get('categoria_id');
	if (!isset($list[$key])) {
		$list[$key] = [
			'id' => $item->get('categoria_id'),
			'nome' => $item->get('categoria_nome'),
			'list' => [],
		];
	}
	$list[$key]['list'][] = $item;
}

H::view('list', $list);
