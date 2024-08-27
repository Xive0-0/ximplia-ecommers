<?php
H::includeFromLib('AppUtils');

$tipo = AppUtils::getIdTipoFromKey($_('tipo'));

$ps = H::db()->prepare('SELECT
				A.*,
				AL.NOME,
				AL.DETTAGLIO_LANG
			FROM
				ATTRIBUTO A,
				ATTRIBUTO_LANG AL,
				ARTICOLO_ATTRIBUTO AA
			WHERE
				AA.ID_ATTRIBUTO = A.ID AND
				AA.ID_ENTITA = :id_articolo AND
				AA.TIPO = :tipo1 AND
				A.ABILITATO = true AND
				A.ID = AL.ID_ATTRIBUTO AND
				AL.LANG = :lang AND
				A.TIPO = :tipo
			ORDER BY A.ORDINE DESC, AL.FIND ASC');
$ps->execute([
		':lang' => H::context()->currentLang(),
		':id_articolo' => H::input('id_articolo', 0),
		':tipo' => $tipo,
		':tipo1' => $tipo
	]);

H::includeFromLib('generic/Item');
$map = [];
while ($row = $ps->fetch()) {
	$item = new Item($row);
	$key = '_' . $item->get('id_padre');
	if (!isset($map[$key])) {
		$map[$key] = [];
	}
	$map[$key][] = $item;
}
if (!function_exists('genera')) {
	function genera($map, $parentId, &$html, $level) {
		$key = '_' . $parentId;
		if (isset($map[$key])) {
			$listSub = $map[$key];
			foreach($listSub as $item) {
				if ($level == 1) {
					$html[] = ' <optgroup label="' . $item->get('nome') . '">';
				}
				else {
					$html[] = '<option value="' .  $item->id() . '"' . (H::input('id_attributo', 0) == $item->id() ? ' selected="true"' : '') . '>';
					$html[] = $item->get('nome');
					$html[] = '</option>';
				}
				
				genera($map, $item->id(), $html, $level + 1);
				if ($level == 1) {
					$html[] = '</optgroup>';
				}
			}
		}
	}
}
$html = [];
genera($map, 0, $html, 1);
$html = implode('', $html);

H::view('treeOption', $html);
