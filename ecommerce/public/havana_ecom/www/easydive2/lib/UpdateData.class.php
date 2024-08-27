<?php
H::includeFromLib('AppUtils');
H::includeFromLib('UpdateDataBase');
H::includeFromLib('update/UpdatePatternAmbassador');
H::includeFromLib('update/UpdatePatternEasydivepoint');

class UpdateData extends UpdateDataBase {
	public static function exe_update_url($twig = null) {
		UpdateData::update_url_categoria($twig);
		UpdateData::update_url_sotto_categoria($twig);
		UpdateData::update_url_categoria_ambassador($twig);
		UpdateData::update_url_categoria_easydivepoint($twig);
		UpdateData::update_url_ambassador($twig);
		UpdateData::update_url_easydivepoint($twig);
		parent::exe_update_url($twig);
	}	
	public static function exe_update_metainfo($twig = null) {
		UpdateData::update_metainfo_categoria($twig);
		UpdateData::update_metainfo_categoria_ambassador($twig);
		UpdateData::update_metainfo_categoria_easydivepoint($twig);
		UpdateData::update_metainfo_ambassador($twig);
		UpdateData::update_metainfo_easydivepoint($twig);
		parent::exe_update_metainfo($twig);
	}
	
	public static function update_url_attributo_tipo($tipo) {
		UpdateDataBase::update_url_attributo_tipo($tipo);
		switch ($tipo) {
		case 8:
			UpdateData::update_url_categoria_ambassador();		
			break;
		case 9:
			UpdateData::update_url_categoria_easydivepoint();		
			break;
		}
	}
	
	public static function update_url_ambassador($twig = null, $id = null) {
		self::update_url(new UpdatePatternAmbassador($id), 
			'item-ambassador', 'ed_ambassador', $twig);
	}
	public static function update_metainfo_ambassador($twig = null, $id = null) {
		self::update_metainfo(new UpdatePatternAmbassador($id), 'ed_ambassador', $twig);
	}
	public static function update_url_easydivepoint($twig = null, $id = null) {
		self::update_url(new UpdatePatternEasydivepoint($id), 
			'item-easydivepoint', 'ed_easydivepoint', $twig);
	}
	public static function update_metainfo_easydivepoint($twig = null, $id = null) {
		self::update_metainfo(new UpdatePatternEasydivepoint($id), 'ed_easydivepoint', $twig);
	}
	
	public static function create_cache_tipo_obiettivo_fotocamera($lang, $id_per_articolo) {
		$file_cache = 'tree_tipo_obiettivo_fotocamera_' . $id_per_articolo;
		$tipo = AppUtils::getIdTipoFromKey('obiettivo');
		$ps = H::db()->prepare('SELECT
						A.ID,
						AL.NOME,
						EOF.ID_FOTOCAMERA
					FROM
						ATTRIBUTO A,
						ATTRIBUTO_LANG AL,
						ED_OBIETTIVO_FOTOCAMERA EOF,
						PER_ARTICOLO_' . $id_per_articolo . ' KT
					WHERE
						A.ID = KT.ID_ATTRIBUTO AND
						EOF.ID_OBIETTIVO = A.ID AND
						A.ABILITATO = true AND
						A.ID = AL.ID_ATTRIBUTO AND
						AL.LANG = :lang AND
						A.TIPO = :tipo
					ORDER BY A.ORDINE DESC, AL.FIND ASC');
		$ps->execute([
				':lang' => $lang,
				':tipo' => $tipo,
			]);

		
		$map = [];
		while ($row = $ps->fetch()) {
			if (!isset($map['_' . $row['ID_FOTOCAMERA']])) {
				$map['_' . $row['ID_FOTOCAMERA']] = [];
			}
			$map['_' . $row['ID_FOTOCAMERA']][] = [
				'id' => $row['ID'],
				'nome' => $row['NOME'],
			];
		}
		
		$cache = HUtil::_serialize($map);
		Cache::store($file_cache, $cache, $lang);	
		return $map;
	}
	
	public static function reset_cache_tipo_obiettivo_fotocamera() {
		$list_lang = H::config('enabled_languages', []);
		foreach ($list_lang as $lang) {
			foreach ([586, 587] as $id_per_articolo) {
				Cache::remove('tree_tipo_obiettivo_fotocamera_' . $id_per_articolo, $lang);
				self::create_cache_tipo_obiettivo_fotocamera($lang, $id_per_articolo);
			}
		}
	}
	
	public static function clear_cache($l) {
		parent::clear_cache($l);
		Cache::remove('tree_tipo_categoria', $l);
		Cache::remove('tree_tipo_fotocamera', $l);
		Cache::remove('tree_tipo_obiettivo_fotocamera_586', $l);
		Cache::remove('tree_tipo_obiettivo_fotocamera_587', $l);
	}
	
	public static function update_metainfo_categoria($twig = null) {
		self::update_metainfo(new UpdatePatternAttributo('categoria', true), 'categoria', $twig);
	}
	public static function update_metainfo_selezione($twig = null) {
		self::update_metainfo(new UpdatePatternAttributo('selezione'), 'selezione', $twig);
	}	

	public static function update_url_sotto_categoria($twig = null) {
		self::update_url_attributo_tree('categoria', 'sotto_categoria', $twig, 'search',
			function($item) {
				return [
					'coll_title' => true,
					'coll_id' => $item->id()
				];
			});
	}
	
	public static function update_url_categoria($twig = null) {
		self::update_url_attributo('categoria', $twig, 'search',
			function($item) {
				return [
					'coll_title' => true,
					'coll_id' => $item->id()
				];
			},
			true);
	}
	
	public static function update_url_selezione($twig = null) {
		self::update_url_attributo('selezione', $twig, 'search',
			function($item) {
				return [
					'coll_title' => true,
					'coll_id' => $item->id()
				];
			});
	}
	
	public static function update_url_categoria_ambassador($twig = null) {
		self::update_url_attributo('categoria_ambassador', $twig, 'ambassador',
			function($item) {
				return [
					'coll_title' => true,
					'coll_id' => $item->id()
				];
			},
			true);
	}
	public static function update_url_categoria_easydivepoint($twig = null) {
		self::update_url_attributo('categoria_easydivepoint', $twig, 'easydive-point',
			function($item) {
				return [
					'coll_title' => true,
					'coll_id' => $item->id()
				];
			},
			true);
	}

	public static function update_metainfo_categoria_ambassador($twig = null) {
		self::update_metainfo(new UpdatePatternAttributo('categoria_ambassador', true), 'categoria_ambassador', $twig);
	}
	public static function update_metainfo_categoria_easydivepoint($twig = null) {
		self::update_metainfo(new UpdatePatternAttributo('categoria_easydivepoint', true), 'categoria_easydivepoint', $twig);
	}
}
?>