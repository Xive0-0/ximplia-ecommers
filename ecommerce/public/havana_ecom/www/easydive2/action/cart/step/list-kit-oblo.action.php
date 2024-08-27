<?php
$id_obiettivo = H::input('id_obiettivo', 0);
$id_fotocamera = H::input('id_fotocamera', 0);
$fotocamera = H::db2()->selectById('fotocamera_modello', $id_fotocamera)->item();
$fotocamera_obiettivo = H::db2()->selectById('fotocamera_obiettivo', $id_obiettivo)->item();
if ($fotocamera_obiettivo) {
	
	$per_articolo = H::input('per_articolo', '');
	if (is_numeric($per_articolo)) {
		$per_articolo = intVal($per_articolo);
		switch($per_articolo) {
		case 224:
			$codice_articolo = 'HOU/LEO3-WI';
			break;
		case 915:
			$codice_articolo = 'HOU/LEO3-WI-PLUS';
			break;
		case 176:
			$codice_articolo = 'HOU/LEO3/PRO';
			break;
		case 223:
			$codice_articolo = 'HOU/LEO3/PLUS';
			break;
		default:
			$codice_articolo = '';
			break;
		}		
	}
	else {
		$codice_articolo = strtoupper($per_articolo);
	}
	$leo3r = false;
	switch($codice_articolo) {
	case 'HOU/LEO3-WI':
		$key = 'leo3_wi_dic_mm';
		$tipo_custodia = 'leo3wi';
		break;
	case 'HOU/LEO3-WI-PLUS':
		$key = 'leo3_wi_plus_dic_mm';
		$tipo_custodia = 'leo3wi';
		break;
	case 'HOU/LEO3/PRO':
		$key = 'leo3_dic_mm';
		$tipo_custodia = 'leo3';
		break;
	case 'HOU/LEO3/PLUS':
		$key = 'leo3_plus_dic_mm';
		$tipo_custodia = 'leo3';
		break;
	default:
		$tipo_custodia = 'leo3';
		$key = 'leor_dic_mm';
		$leo3r = true;
		break;
	}
	H::view('leo3r', $leo3r);
	
	$dist = $fotocamera_obiettivo['length_mm'] - $fotocamera[$key];
	$list_oblo = [];
	if ($fotocamera_obiettivo['angle_min'] < 30 && $fotocamera_obiettivo['angle_max'] < 30) {
		if ($tipo_custodia == 'leo3') {
			$list_oblo = [
				270,//Microdome PX
				287,//Microdome CR
				187,//Minidome PX
				188,//Minidome CR
				183,//Easydome PX
				184,//Easydome CR
				340,//Zendome CR
				189,//FullFrame Dome Px
				953,//FullFrame Dome CR
			];
		}
		else {
			//Leo3wii
			$list_oblo = [
				271,//Microdome PX
				286,//Microdome CR
				34,//Minidome PX
				35,//Minidome CR
				13,//Easydome PX
				14,//Easydome CR
				957,//Zendome CR
				33,//FullFrame Dome Px
				372,//FullFrame Dome CR
			];
		}
	}
	else if ($fotocamera_obiettivo['angle_min'] < 30 && $fotocamera_obiettivo['angle_max'] >= 30 && $dist <= 10) {
		//Leo3
		if ($tipo_custodia == 'leo3') {
			$list_oblo = [
				270,//Microdome PX
				287,//Microdome CR
				187,//Minidome PX
				188,//Minidome CR
				183,//Easydome PX
				184,//Easydome CR
				340,//Zendome CR
				189,//FullFrame Dome Px
				372,//FullFrame Dome CR
				248,//tappo piano
			];
		}
		else {
			//Leo3wii
			$list_oblo = [
				271,//Microdome PX
				286,//Microdome CR
				34,//Minidome PX
				35,//Minidome CR
				13,//Easydome PX
				14,//Easydome CR
				957,//Zendome CR
				33,//FullFrame Dome Px
				372,//FullFrame Dome CR
				32,//tappo piano
			];	
		}
	}
	else if ($fotocamera_obiettivo['angle_min'] < 30 && $fotocamera_obiettivo['angle_max'] >= 30 && $dist > 10) {
		//Leo3
		if ($tipo_custodia == 'leo3') {
			$list_oblo = [
				270,//Microdome PX
				287,//Microdome CR
				187,//Minidome PX
				188,//Minidome CR
				183,//Easydome PX
				184,//Easydome CR
				340,//Zendome CR
				189,//FullFrame Dome Px
				372,//FullFrame Dome CR
				182,//oblo piano
			];
		}
		else {		
			//Leo3wii
			$list_oblo = [
				271,//Microdome PX
				286,//Microdome CR
				34,//Minidome PX
				35,//Minidome CR
				13,//Easydome PX
				14,//Easydome CR
				957,//Zendome CR
				33,//FullFrame Dome Px
				372,//FullFrame Dome CR
				12,//oblo piano
			];
		}
	}
	else if ($fotocamera_obiettivo['angle_min'] >= 30 && $fotocamera_obiettivo['angle_max'] >= 30 && $dist <= 10) {
		if ($tipo_custodia == 'leo3') {
			$list_oblo = [
				248//Tappo Piano
			];
		}
		else {
			$list_oblo = [
				32//Tappo Piano
			];
		}
	}
	else if ($fotocamera_obiettivo['angle_min'] >= 30 && $fotocamera_obiettivo['angle_max'] >= 30 && $dist > 10) {
		if ($tipo_custodia == 'leo3') {
			$list_oblo = [
				182,//oblo piano
			];		
		}
		else {
			$list_oblo = [
				12,//oblo piano
			];
		}
	}
	if (count($list_oblo) > 0) {
		$list_extension = [];
		if ($dist > 30) {
			if ($dist <= 50) {
				if ($tipo_custodia == 'leo3') {
					$list_extension = [
						190,//extension 15
					];		
				}
				else {
					$list_extension = [
						36,//extension 15
					];
				}				
			}
			elseif ($dist > 50 && $dist <= 70) {
				if ($tipo_custodia == 'leo3') {
					$list_extension = [
						191,//extension 30
					];		
				}
				else {
					$list_extension = [
						37,//extension 30
					];
				}				
			}
			elseif ($dist > 70 && $dist <= 90) {
				if ($tipo_custodia == 'leo3') {
					$list_extension = [
						192,//extension 40
					];		
				}
				else {
					$list_extension = [
						38,//extension 40
					];
				}								
			}
			elseif ($dist > 90 && $dist <= 110) {
				if ($tipo_custodia == 'leo3') {
					$list_extension = [
						190,//extension 15
						192,//extension 40
					];		
				}
				else {
					$list_extension = [
						36,//extension 15
						38,//extension 40
					];
				}								
			}
			elseif ($dist > 110 && $dist <= 130) {
				if ($tipo_custodia == 'leo3') {
					$list_extension = [
						191,//extension 30
						192,//extension 40
					];		
				}
				else {
					$list_extension = [
						37,//extension 30
						38,//extension 40
					];
				}				
			}
		}
		if ($tipo_custodia == 'leo3') {
			$list_tappo = [
				186
			];
		}
		else {
			$list_tappo = [
				53
			];			
		}
		
		$list_cover_all = [40, 72, 83, 84, 249, 250, 949, 950];
		$map_cover = [
			'_270' => 72,//Microdome PX
			'_287' => 72,//Microdome CR
			'_34' => 72,//Minidome PX
			'_35' => 72,//Minidome CR
			'_187' => 72,
			'_188' => 72,
			
			'_183' => 83,//Easydome PX
			
			'_14' => 949,//Easydome CR
			
			//Zendome CR
			
			'_189' => 84,//FullFrame Dome Px
			'_953' => 950,//FullFrame Dome Cr
			
			//tappo piano
			'_248' => 249,
			'_32' => 250,
			
			//oblo piano
			'_182' => 40,
			'_12' => 40,
			
			'_271' => 72,//Microdome PX
			'_286' => 72,//Microdome CR
			'_34' => 72,//Minidome PX
			'_35' => 72,//Minidome CR
			'_13' => 83,//Easydome PX
			
			//Zendome CR
			
			'_33' => 84,//FullFrame Dome Px
			'_372' => 950,//FullFrame Dome Cr
			
			'_184' => 949,//Easydome CR
		];
	
		H::lib('generic/Articolo');
		$map = new HHashMap();
	
		$ghiera_id = 0;
		$list_articolo_id = array_merge($list_oblo,
							$list_extension,
							$list_tappo,
							$list_cover_all);
		if ($fotocamera_obiettivo['ring']) {
			if ($tipo_custodia == 'leo3') {
				$ghiera_id = 194;
			}
			else {
				$ghiera_id = 269;			
			}
			$list_articolo_id[] = $ghiera_id;
		}
			
		$params = [
			'a.id' => $list_articolo_id,
			'a.id:_' => 'al.id_articolo', 
			'al.lang' => H::context()->currentLang()
		];
		$rs = H::db2()->selectView('a.*, al.*', 'articolo a, articolo_lang al', $params);
		while ($row = $rs->fetch()) {
			$item = Articolo::newInstance($row, false);
			$map->put($item->id(), $item);
		}

		$list = [];
		foreach ($list_oblo as $oblo_id) {
			$oblo = $map->get($oblo_id);			
			foreach ($list_tappo as $tappo) {
				$tappo = $map->get($tappo);

				$prezzo = $oblo->prezzo('', false) + 
							$tappo->prezzo('', false);
				
				$sub = [
					$oblo,
				];
				foreach ($list_extension as $extension) {
					$extension = $map->get($extension);
					$prezzo += $extension->prezzo('', false);
					$sub[] = $extension;
				}
				$sub[] = $tappo;
				
				if (isset($map_cover['_' . $oblo_id])) {
					$cover = $map->get($map_cover['_' . $oblo_id]);
					$prezzo += $cover->prezzo('', false);
					$sub[] = $cover;
				}
				
				if ($ghiera_id > 0) {
					$ghiera = $map->get($ghiera_id);
					$prezzo += $ghiera->prezzo('', false);
					$sub[] = $ghiera;
				}
							
				$list[] = [
					'ordine' => $oblo->get('ordine_configuratore'),
					'consigliato' => $oblo->get('consigliato'),
					'nome' => $oblo->get('nome'),
					'step_acquisto_testo' => $oblo->get('step_acquisto_testo'),
					'prezzo' => $prezzo,
					'sub' => $sub
				];
			}
		}
		
		usort($list, function($a, $b) {
			if ($a['ordine'] == $b['ordine']) {
				return 0;
			}
			return $a['ordine'] > $b['ordine'] ? -1 : 1;
		});
		
		H::view('list', $list);
	}
}