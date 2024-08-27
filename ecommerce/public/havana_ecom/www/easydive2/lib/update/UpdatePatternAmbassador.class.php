<?php
H::includeFromLib('update/UpdatePattern.class.php');

class UpdatePatternAmbassador extends UpdatePattern {
	private $id;
	public function __construct($id = null) {
		parent::__construct('ed_ambassador');
		$this->id = $id;
	}
	
	public function paramsMetainfo($item) {
		
		$categoria_path = $item->sub('categoria')->url();
		if ($categoria_path) {
			if (HString::startsWith($categoria_path, '/')) {
				$categoria_path = substr($categoria_path, 1);
			}
			$categoria_path = array_reverse(explode('/', $categoria_path));
			$categoria_path = implode(' | ', $categoria_path);
			$categoria_path = str_replace('-', ' ', $categoria_path);
		}
		
		return [
			'id' => $item->id(),
			'nome' => $item->get('nome'),
			'categoria_nome' => $item->sub('categoria')->get('nome'),
			'categoria_path' => $categoria_path,
		];		
	}
	
	public function paramsUrl($item, $sep) {
		return [
			'id' => $item->id(),
			'nome' => HString::normalize($item->get('nome'), $sep),
			'categoria_url' => $item->sub('categoria')->url(),
			'categoria_nome' => HString::normalize($item->sub('categoria')->get('nome'), $sep),
		];	
	}
	
	public function parseItem($row) {
		$item = new Item($row);
		$item->setSubItem('categoria', new Item($row, 'categoria'));
		return $item;
	}
	
	public function updateList($lang, $start, $number) {
		$strQry = 'SELECT
					A.*,
					AL.*,
					AT_TL.NOME AS CATEGORIA_NOME,
					AT_T.DETTAGLIO AS CATEGORIA_DETTAGLIO,
					AT_TL.DETTAGLIO_LANG AS CATEGORIA_DETTAGLIO_LANG
				FROM
					ED_AMBASSADOR A,
					ED_AMBASSADOR_LANG AL,
					ARTICOLO_ATTRIBUTO A_AT,
					ATTRIBUTO AT_T,
					ATTRIBUTO_LANG AT_TL
				WHERE
					A.ID = AL.ID_ED_AMBASSADOR AND
					AL.LANG = :lang1 AND
					AT_T.TIPO = :tipo AND
					A_AT.ID_ATTRIBUTO = AT_T.ID AND
					A_AT.ID_ENTITA = A.ID AND
					AT_TL.ID_ATTRIBUTO = AT_T.ID AND
					AT_TL.LANG = :lang2';

		$params = [
			':start' => $start,
			':number' => $number,
			':lang1' => $lang,
			':lang2' => $lang,
			':tipo' => AppUtils::getIdTipoFromKey('categoria_ambassador')
		];		
		if ($this->id != null) {
			$strQry .= ' AND A.ID = :id';
			$params[':id'] = $this->id;
		}
		
		$strQry .= ' LIMIT :start,:number';
		$ps = H::db()->prepare($strQry);
		$ps->execute($params);
		return $ps;
	}
}
