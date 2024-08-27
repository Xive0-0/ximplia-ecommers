<?php
set_time_limit(0);

function updateFotocamera($list) {
	$map_brand = new HHashMap();
	$rs = H::db2()->select('fotocamera_brand');
	while ($row = $rs->fetch()) {
		$map_brand->put($row['codice'], $row['id']);
	}
	foreach ($list as $fotocamera) {
		$brand_codice = HString::normalize($fotocamera['brand']);
		$brand_id = $map_brand->get($brand_codice);
		if ($brand_id) {
			$params = [
				'per_fotocamera' => 1
			];
			H::db2()->updateById('fotocamera_brand', $params, $brand_id);			
		}
		else {
			$params = [
				'nome' => $fotocamera['brand'],
				'codice' => $brand_codice,
				'abilitato' => 1,
				'per_fotocamera' => 1
			];
			$brand_id = H::db2()->insert('fotocamera_brand', $params);
			$map_brand->put($brand_codice, $brand_id);
		}
		
		$params = [
			'brand_id' => $brand_id,
			'mount_lens' => implode(',', $fotocamera['mount_lens']),
			'codice' => $fotocamera['fotocamera_codice'],
			'nome' => $fotocamera['fotocamera_nome'],
			'leo3_wi_dic_mm' => $fotocamera['leo3_wi_dic_mm'],
			'leo3_wi_plus_dic_mm' => $fotocamera['leo3_wi_plus_dic_mm'],
			'leo3_dic_mm' => $fotocamera['leo3_dic_mm'],
			'leo3_plus_dic_mm' => $fotocamera['leo3_plus_dic_mm'],
			'leor_dic_mm' => $fotocamera['leor_dic_mm'],
			'abilitato' => 1
		];
		
		$fotocamera_old = H::db2()->selectById('fotocamera_modello', $fotocamera['fotocamera_codice'], 'codice')->item();
		if ($fotocamera_old) {
			H::db2()->updateById('fotocamera_modello', $params, $fotocamera_old['id']);
		}
		else {
			H::db2()->insert('fotocamera_modello', $params);
		}
	}
}

function updateObiettivo($list) {
	$map_brand = new HHashMap();
	$rs = H::db2()->select('fotocamera_brand');
	while ($row = $rs->fetch()) {
		$map_brand->put($row['codice'], $row['id']);
	}
	foreach ($list as $obiettivo) {
		$brand_codice = HString::normalize($obiettivo['brand']);
		$brand_id = $map_brand->get($brand_codice);
		if ($brand_id) {
			$params = [
				'per_obiettivo' => 1
			];
			H::db2()->updateById('fotocamera_brand', $params, $brand_id);			
		}
		else {
			$params = [
				'nome' => $obiettivo['brand'],
				'codice' => $brand_codice,
				'abilitato' => 1,
				'per_obiettivo' => 1
			];
			$brand_id = H::db2()->insert('fotocamera_brand', $params);
			$map_brand->put($brand_codice, $brand_id);
		}	
		$params = [
			'brand_id' => $brand_id,
			'mount_lens' => $obiettivo['mount_lens'],
			'codice' => $obiettivo['obiettivo_codice'],
			'nome' => $obiettivo['obiettivo_nome'],				
			'angle_max' => $obiettivo['angle_max'],
			'angle_min' => $obiettivo['angle_min'],
			'ring' => $obiettivo['ring'],
			'length_mm' => $obiettivo['length_mm'],
			'diameter_mm' => $obiettivo['diameter_mm'],
			'abilitato' => 1
		];
		
		$obiettivo_old = H::db2()->selectById('fotocamera_obiettivo', $obiettivo['obiettivo_codice'], 'codice')->item();
		if ($obiettivo_old) {
			H::db2()->updateById('fotocamera_obiettivo', $params, $obiettivo_old['id']);
		}
		else {
			H::db2()->insert('fotocamera_obiettivo', $params);
		}
	}
}


H::lib('Encoding');
H::lib('PHPExcel/IOFactory.php');


$file_obiettivo = H::input('file_obiettivo', '');
$file_modello = H::input('file_modello', '');
if ($file_modello == '' && $file_obiettivo == '') {
	H::hson()->error('Inserire almeno uno dei due file');
	H::fire('view');
}

if ($file_modello != '') {
	$path_file_modello = HSystem::path('temp/file', true) . '/' . $file_modello;

	$reader = PHPExcel_IOFactory::load($path_file_modello);
	$lines = $reader->getActiveSheet()->toArray(null,true,true,true);
	if (count($lines) > 1) {
		$map_colonna_porting = [
			'brand' => 'brand',
			'fotocamera' => 'fotocamera_nome',
			'mount lens' => 'mount_lens',
			'leo3 wi dic (mm)' => 'leo3_wi_dic_mm',
			'leo3 wi plus dic (mm)' => 'leo3_wi_plus_dic_mm',
			'leo3 dic (mm)' => 'leo3_dic_mm',
			'leo3 plus dic (mm)' => 'leo3_plus_dic_mm',
			'leor dic (mm)' => 'leor_dic_mm',
		];
		
		$list_colonne = [];
		$column_k = [];
		$header = $lines[1];
		foreach ($header as $k => $c) {
			$valore = strtolower($c);
			if ($valore != '') {
				if (isset($map_colonna_porting[$valore])) {
					$column_k[$map_colonna_porting[$valore]] = $k;
				}
			}
		}

		$map = new HHashMap();
		$tot = count($lines) + 1;
		H::track('report_fotocamere_obiettivi')->write('numero righe fotocamere: ' . $tot);
		for ($l = 2; $l < $tot; $l++) {
			$item = [
				'brand' => '',
				'fotocamera_nome' => '',
				'mount_lens' => [],
				'leo3_wi_dic_mm' => 0,
				'leo3_wi_plus_dic_mm' => 0,
				'leo3_dic_mm' => 0,
				'leo3_plus_dic_mm' => 0,
				'leor_dic_mm' => 0,
			];
			foreach ($column_k as $col_name => $key) {
				$val = trim(@$lines[$l][$key]);
				$val_ok = false;
				switch($col_name) {
				case 'brand':
				case 'fotocamera_nome':
					$val_ok = true;
					break;
				case 'mount_lens':
					$val = str_replace(' - ', ',', $val);
					$part = explode(',', $val);
					$val = [];
					foreach ($part as $p) {
						$p = HString::normalize($p);
						if ($p) {
							$val[] = $p;
						}
					}
					$val_ok = true;
					break;
				case 'leo3_wi_dic_mm':
				case 'leo3_wi_plus_dic_mm':
				case 'leo3_dic_mm':
				case 'leo3_plus_dic_mm':
				case 'leor_dic_mm':
					if ($val && is_numeric($val)) {
						
					}
					else {
						$val = 0;
					}
					$val_ok = true;
					break;
				}			
				if ($val_ok) {
					$item[$col_name] = $val;
				}
			}
			if (@$item['brand'] && @$item['fotocamera_nome']) {
				$key = implode('|', [
					HString::normalize($item['brand']),
					HString::normalize($item['fotocamera_nome'])
				]);
				$item['fotocamera_codice'] = $key;
				
				if ($map->get($key)) {
					H::track('report_fotocamere_obiettivi')->write('fotocamera presente: ' . $key . ', riga: ' . $l);
				}
				$map->put($key, $item);
			}
			else {
				H::track('report_fotocamere_obiettivi')->write('riga vuota: ' . $l . "\n" . 
					print_r($lines[$l], true) . "\n",				
					print_r($item, true));				
			}
		}
		H::track('report_fotocamere_obiettivi')->write('fotocamere trovate: ' . $map->size());
		updateFotocamera($map->values());
	}
	else {
		H::hson()->error('Il file con le fotocamere deve contenere almeno 2 righe, la prima è di intestazione');
		H::fire('view');
	}
}

if ($file_obiettivo != '') {
	$path_file_obiettivo = HSystem::path('temp/file', true) . '/' . $file_obiettivo;

	$reader = PHPExcel_IOFactory::load($path_file_obiettivo);
	$lines = $reader->getActiveSheet()->toArray(null,true,true,true);
	if (count($lines) > 1) {
		$map_colonna_porting = [
			'brand' => 'brand',
			'mount lens' => 'mount_lens',
			'lens model' => 'obiettivo_nome',
			'angle min' => 'angle_min',
			'angle max' => 'angle_max',
			'ring' => 'ring',
			'length (mm)' => 'length_mm',
			'diameter (mm)' => 'diameter_mm',
		];
		
		$list_colonne = [];
		$column_k = [];
		$header = $lines[1];
		foreach ($header as $k => $c) {
			$valore = strtolower($c);
			if ($valore != '') {
				if (isset($map_colonna_porting[$valore])) {
					$column_k[$map_colonna_porting[$valore]] = $k;
				}
			}
		}

		$map = new HHashMap();
		$tot = count($lines) + 1;
		H::track('report_fotocamere_obiettivi')->write('numero righe obiettivi: ' . $tot);
		for ($l = 2; $l < $tot; $l++) {
			$item = [
				'brand' => '',
				'mount_lens' => '',
				'obiettivo_nome' => '',
				'angle_min' => 0,
				'angle_max' => 0,
				'ring' => 0,
				'length_mm' => 0,
				'diameter_mm' => 0,		
			];
			foreach ($column_k as $col_name => $key) {
				$val = trim(@$lines[$l][$key]);
				$val_ok = false;
				switch($col_name) {
				case 'brand':
				case 'obiettivo_nome':
					$val_ok = true;
					break;
				case 'mount_lens':
					$val = HString::normalize($val);
					$val_ok = true;
					break;
				case 'ring':
					if (HString::normalize($val) == 'si') {
						$val = 1;
					}
					else {
						$val = 0;
					}
					$val_ok = true;
					break;
				case 'angle_max':
				case 'angle_min':
				case 'length_mm':
				case 'diameter_mm':
					if ($val && is_numeric($val)) {
					}
					else {
						$val = 0;
					}
					$val_ok = true;
					break;
				}			
				if ($val_ok) {
					$item[$col_name] = $val;
				}
			}
			if (@$item['brand'] && @$item['mount_lens'] && @$item['obiettivo_nome']) {
				$key = implode('|', [
					HString::normalize($item['brand']),
					HString::normalize($item['mount_lens']),
					HString::normalize($item['obiettivo_nome'])
				]);
				$item['obiettivo_codice'] = $key;
				if ($map->get($key)) {
					H::track('report_fotocamere_obiettivi')->write('obiettivo presente: ' . $key . ', riga: ' . $l);
				}
				$map->put($key, $item);
			}
			else {
				H::track('report_fotocamere_obiettivi')->write('riga vuota: ' . $l . "\n" . 
					print_r($lines[$l], true) . "\n",				
					print_r($item, true));				
			}
		}
		H::track('report_fotocamere_obiettivi')->write('obiettivi trovati: ' . $map->size());
		updateObiettivo($map->values());
	}
	else {
		H::hson()->error('Il file con le fotocamere deve contenere almeno 2 righe, la prima è di intestazione');
		H::fire('view');
	}
}

H::hson()->success('Dati salvati correttamente');