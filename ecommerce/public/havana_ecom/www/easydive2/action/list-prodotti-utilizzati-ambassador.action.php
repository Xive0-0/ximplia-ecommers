<?php
$list = [];
$item = H::view()->get('item');
if ($item) {
	$list_id = $item->get('elenco_prodotti_id');
	if ($list_id) {
		$list_articolo_id = [];
		$list_id = explode(',', $list_id);
		foreach ($list_id as $id) {
			$id = trim($id);
			if ($id != '' && is_numeric($id)) {
				$list_articolo_id[] = $id;
			}
		}
		if (count($list_articolo_id) > 0) {
			$strQry = 'SELECT
							A.*,
							AL.*,
							AZ.NOME AS NOME_AZIENDA,
							AZ.ID AS AZIENDA_ID,
							AZ.CODICE AS AZIENDA_CODICE,
							AZ.NOME AS AZIENDA_NOME,
							AZ.DETTAGLIO AS AZIENDA_DETTAGLIO,
							AZL.DETTAGLIO_LANG AS AZIENDA_DETTAGLIO_LANG
						FROM
							ARTICOLO A,
							ARTICOLO_LANG AL,
							AZIENDA AZ,
							AZIENDA_LANG AZL
						WHERE
							(A.VISIBILITA_LANG = \'-\' OR A.VISIBILITA_LANG LIKE :visibilita) AND
							A.ID IN ([:list_articolo_id]) AND
							A.ID = AL.ID_ARTICOLO AND
							AL.LANG = :lang AND
							A.ABILITATO = 1 AND
							A.ESAURITO = 0 AND
							AZ.ID = AZL.ID_AZIENDA AND
							AZL.LANG = :lang_az AND
							A.ID_AZIENDA = AZ.ID'  . 			
							AppUtils::filtroArticoli() .
						' ORDER BY A.ORDINE DESC, A.DATA_MODIFICA DESC';
						
			$ps = H::db()->prepare($strQry);
			$ps->execute([
				':visibilita' => '%' . H::context()->currentLang() . ',%',
				':lang' => H::context()->currentLang(),
				':lang_az' => H::context()->currentLang(),
				':list_articolo_id' => $list_articolo_id,
			]);

			H::includeFromLib('generic/Articolo');
			while ($row = $ps->fetch()) {
				$list[] = Articolo::newInstance($row);
			}

		}
	}
}
H::view('listProdottiUtilizzati', $list);