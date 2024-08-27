<?php
H::includeFromLib('AppUtilsBase');

class AppUtils extends AppUtilsBase {	
	public static function getListTipoRelazione() {
		return [
			['tipo' => 18, 'label' => 'Oblo'],
			['tipo' => 2, 'label' => 'Accessorio'],
			['tipo' => 19, 'label' => 'Oculari lenti'],
			['tipo' => 4, 'label' => 'Accessorio illuminazione'],
			['tipo' => 11, 'label' => 'Illuminazione'],
			['tipo' => 13, 'label' => 'Kit bracci'],
			['tipo' => 5, 'label' => 'Batterie'],
			['tipo' => 9, 'label' => 'Controllo remoto'],
			['tipo' => 24, 'label' => 'Zaini valigie'],	
			['tipo' => 10, 'label' => 'Ghiere'],
			['tipo' => 23, 'label' => 'Tappi cover'],
			['tipo' => 17, 'label' => 'Monitor'],			
			['tipo' => 3, 'label' => 'Accessorio bracci'],
			['tipo' => 6, 'label' => 'Braccio'],
			['tipo' => 8, 'label' => 'Clip'],
			['tipo' => 14, 'label' => 'Kit staffe'],
			['tipo' => 15, 'label' => 'Lenti filtri'],
			['tipo' => 21, 'label' => 'Sfere terminali'],
			['tipo' => 22, 'label' => 'Staffe'],
			['tipo' => 16, 'label' => 'Merchandising'],
			['tipo' => 7, 'label' => 'Cavalletti'],
			['tipo' => 20, 'label' => 'Ricambi'],
			['tipo' => 12, 'label' => 'Impugnature maniglie'],
			
			['tipo' => 53, 'label' => 'Accessorio (configuratore)'],
			['tipo' => 50, 'label' => 'Luci (configuratore)'],
			['tipo' => 51, 'label' => 'Flash (configuratore)'],
			['tipo' => 52, 'label' => 'Kit bracci da abbinare a luci e flash (configuratore)'],
			['tipo' => 54, 'label' => 'Batterie (configuratore)'],
			['tipo' => 55, 'label' => 'Accessori video (configuratore)'],
			['tipo' => 56, 'label' => 'Pulsantiera illuminata (configuratore)'],
		];
	}

	public static function addDataToTemplateArticoloFromTipo($tipo_entita) {
		if ($tipo_entita == 2) {
			$id = H::input('id', 0);
			
			H::includeFromLib('Utils');
			Utils::items_list_simple(
				'SELECT
					A.*,
					AL.*,
					AR.ORDINE AS ORDINE_RELAZIONE
				FROM	
					ARTICOLO A,
					ARTICOLO_LANG AL,
					(
						SELECT ID_ARTICOLO_1 AS ID, ORDINE FROM ARTICOLO_RELAZIONE WHERE ID_ARTICOLO_2 = :id1 AND TIPO = :tipo1
						UNION
						SELECT ID_ARTICOLO_2 AS ID, ORDINE FROM ARTICOLO_RELAZIONE WHERE ID_ARTICOLO_1 = :id2 AND TIPO = :tipo2
					) AR
				WHERE
					A.ID = AL.ID_ARTICOLO AND 
					AL.LANG = :lang AND
					A.ID = AR.ID AND
					A.TIPO < 2
				ORDER BY AR.ORDINE DESC, AL.NOME ASC',
				[
					':id1' => $id,
					':id2' => $id,
					':tipo1' => 100,
					':tipo2' => 100,
					':lang' => H::config('default_language', 'it')
				],
				'listArticoliKit',
				null,
				null,
				'Articolo');
		}
	}
	
	public static function articoliListOrder() {
		return [
			'field' => 'a.id',
			'type' => 'desc',
		];
	}
	
	public static function getTemplateArticoloFromTipo($tipo) {
		if ($tipo == 2) {
			return '-kit';
		}
		return '';
	}
	
	public static function &bannerTypeList() {
		$list =  [
			[
				'id' => 1,
				'text' => 'Home testata (2000x715)'
			],			
			[
				'id' => 3,
				'text' => 'Home piede (1100x550)'
			],			
			[
				'id' => 4,
				'text' => 'Home foto destra (1100x1100)'
			],
			[
				'id' => 5,
				'text' => 'Home foto sinistra (1100x1100)'
			],
			[
				'id' => 8,
				'text' => 'Login (2000x175)'
			],	
			[
				'id' => 7,
				'text' => 'Blog (2000x175)'
			],	
			[
				'id' => 6,
				'text' => 'Contatti (2000x175)'
			],	
			[
				'id' => 9,
				'text' => 'Servizio clienti (2000x175)'
			],	
			[
				'id' => 10,
				'text' => 'Ambassador (2000x175)'
			],	
			[
				'id' => 11,
				'text' => 'Easydive Point (2000x175)'
			],
			[
				'id' => 20,
				'text' => 'Puzzle banner grande (1100x1100)'
			],
			[
				'id' => 21,
				'text' => 'Puzzle banner medio (1100x550)'
			],
			[
				'id' => 22,
				'text' => 'Puzzle banner piccolo (550x550)'
			],
            [
                'id' => 23,
                'text' => 'Puzzle dna grande (1100x1100)'
            ],
            [
                'id' => 24,
                'text' => 'Puzzle dna medio (1100x550)'
            ],
			[
				'id' => 25,
				'text' => 'Puzzle dna numeri (550x550)'
			],
		];
		
		return $list;
	}
	
	public static function formatTextAutocomplete($item) {
		$codice_fornitore = $item->get('codice', '');
		if ($codice_fornitore != '') {
			$codice_fornitore = ' [' . $codice_fornitore . ']';
		}
		
		return '#' . $item->codice() . 
			$codice_fornitore . ' ' . 
			$item->get('nome');
	}
	
	public static function listImpostazioniAttributi() {
		return [
			['key' => 'categoria', 'label' => 'Categoria'],
			['key' => 'sotto_categoria', 'label' => 'Sotto categorie'],
			['key' => 'selezione', 'label' => 'Selezione'],
			['key' => 'ed_ambassador', 'label' => 'Ambassador'],
			['key' => 'categoria_ambassador', 'label' => 'Categoria ambassador'],
			['key' => 'ed_easydivepoint', 'label' => 'Easydive Point'],
			['key' => 'categoria_easydivepoint', 'label' => 'Categoria Easydive Point'],
		];
	}	
	public static function filtroArticoli($edit = false) {
		return ' AND A.ID = A.ID_VARIANTE ';
	}
	
	public static function parseItemForFind(&$find, $item) {
		
	}
	
	public static function _isTipoTree($tipo) {
		return in_array($tipo, [4, 5]);
	}
	
	public static function &_listTipo($lang = null) {
		$list = [
			[
				'id' => AppUtils::getIdTipoFromKey('categoria'),
				'nome' => 'Categoria',
			],
			[
				'id' => AppUtils::getIdTipoFromKey('selezione'),
				'nome' => 'Selezione',
			],			
			[
				'id' => AppUtils::getIdTipoFromKey('fotocamera'),
				'nome' => 'Fotocamera',
			],			
			[
				'id' => AppUtils::getIdTipoFromKey('cellulare'),
				'nome' => 'Cellulare',
			],			
			[
				'id' => AppUtils::getIdTipoFromKey('obiettivo'),
				'nome' => 'Obiettivo',
			],	
			[
				'id' => AppUtils::getIdTipoFromKey('kit'),
				'nome' => 'Kit per articolo',
			],
		];
		return $list;
	}
	
	public static function &editMapTipo() {
		$list = [];
		return $list;
	}
	public static function _getIdTipoFromKey($tipo) {
		switch($tipo) {
		case 'categoria':
			return 2;
		case 'selezione':
			return 3;
		case 'fotocamera':
			return 4;
		case 'cellulare':
			return 5;
		case 'obiettivo':
			return 6;
		case 'kit':
			return 7;
		case 'categoria_ambassador':
			return 8;
		case 'categoria_easydivepoint':
			return 9;
		}	
		return 0;
	}
}
?>