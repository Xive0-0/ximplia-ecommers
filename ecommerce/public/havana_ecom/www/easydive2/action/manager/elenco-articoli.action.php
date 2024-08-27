<?php
H::includeFromLib('AppUtils');

$ps = H::db()->prepare('SELECT
				A.*,
				AL.*,
				AZ.NOME AS NOME_AZIENDA
			FROM
				ARTICOLO A,
				ARTICOLO_LANG AL,
				AZIENDA AZ
			WHERE
				A.ID = AL.ID_ARTICOLO AND
				AL.LANG = :lang AND
				A.ID_AZIENDA = AZ.ID'  . AppUtils::filtroArticoli() . '
			ORDER BY A.ID ASC');
$ps->execute([
	':lang' => H::context()->currentLang(),
]);

$list = [];
H::includeFromLib('generic/Articolo');
while ($row = $ps->fetch()) {
	$list[] = new Articolo($row);
}

H::view('list', $list);