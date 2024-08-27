<?php
function loadOpzioniSpedizione($id, $key, &$list_opzione, &$list_opzione_id, $peso_totale, $list, $dettaglio) {
	$fascia = null;
	foreach ($list as $opt) {
		if ($opt['da'] <= $peso_totale && $opt['a'] >= $peso_totale) {
			$fascia = $opt['id'];
			if (isset($dettaglio[$fascia]) && $dettaglio[$fascia] > 0) {
				break;
			}
			else {
				$fascia = null;
			}
		}
	}
	if ($fascia) {
		if ($dettaglio[$fascia] > 0) {
			if ($id == $fascia) {
				$key = explode('_', $key);
				$nome = strtoupper($key[0]) . ' ' . $key[1];
				$list_opzione[] = [
					'peso_totale' => $peso_totale,
					'id' => $fascia,
					'nome' => $nome,
					'prezzo' => $dettaglio[$fascia],
				];
				$list_opzione_id[] = $fascia;
			}
		}
	}
	
}

H::lib('Cart');
H::lib('Spedizione');
$cart = Cart::load();
if ($cart['tipo_spedizione'] == 1) {
	$id = H::input('id', '');
	$add = H::input('add', 0);

	$list_opzione = [];
	$list_opzione_id = [];
	
	if ($add == 1) {
		$id_nazione = $cart['nazione'];
		$nazione = H::db2()->selectById('nazione', $id_nazione)->item();
		if ($nazione) {
			$peso_totale = 0;
			foreach ($cart['items'] as $item) {
				$articolo_id = $item['id'];
				$articolo = H::db2()->selectViewById('parametro_calcolo_spedizione', 'articolo', $articolo_id)->item();
				if ($articolo) {
					$peso_totale += $articolo['parametro_calcolo_spedizione'] * $item['qta'];
				}
			}
			
			if ($id_nazione == 108) {
				if (@$cart['cap_da_preselezione'] != '') {
					$params = [
						'cap' => $cart['cap_da_preselezione'],
						'id_nazione' => 108
					];
					$nazione_cap = H::db2()->select('nazione_cap', $params)->item();
					if ($nazione_cap) {
						$dettaglio = (array)json_decode(@$nazione_cap['dettaglio'], true);
						if ($dettaglio) {
							$listCorriere = Spedizione::listCostiSpedizione();
							foreach ($listCorriere as $key => $list) {
								if ($key == 'sda_standard' && H::settings('*')->get('spedizione_' . $key, '') != '') {
									loadOpzioniSpedizione($id, $key, $list_opzione, $list_opzione_id, $peso_totale, $list, $dettaglio);								
									break;
								}
							}
						}
					}
				}
				if (count($nazione_opzioni) == 0) {
					if (@$cart['provincia_da_preselezione'] != '') {
						$params = [
							'sigla' => $cart['provincia_da_preselezione'],
							'id_nazione' => 108
						];
						$nazione_provincia = H::db2()->select('nazione_provincia', $params)->item();
						if ($nazione_provincia) {
							$dettaglio = (array)json_decode(@$nazione_provincia['dettaglio'], true);
							if ($dettaglio) {
								$listCorriere = Spedizione::listCostiSpedizione();
								foreach ($listCorriere as $key => $list) {
									if ($key == 'gls_standard' && H::settings('*')->get('spedizione_' . $key, '') != '') {
										loadOpzioniSpedizione($id, $key, $list_opzione, $list_opzione_id, $peso_totale, $list, $dettaglio);
										break;
									}
								}
							}
						}
					}				
				}
			}
			
			if (count($list_opzione) == 0) {
				$dettaglio = (array)json_decode(@$nazione['dettaglio'], true);
				if ($dettaglio) {
					$listCorriere = Spedizione::listCostiSpedizione();
					foreach ($listCorriere as $key => $list) {
						if (H::settings('*')->get('spedizione_' . $key, '') != '') {
							loadOpzioniSpedizione($id, $key, $list_opzione, $list_opzione_id, $peso_totale, $list, $dettaglio);
						}
					}
				}
			}
		}
	}
	
	$cart['spedizione_opzione'] = [
		'list' => $list_opzione,
		'list_id' => $list_opzione_id
	];
	Cart::impostaSpeseSpedizione($cart);

	Cart::store($cart);
}