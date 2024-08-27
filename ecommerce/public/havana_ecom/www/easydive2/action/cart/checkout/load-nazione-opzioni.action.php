<?php
function loadOpzioniSpedizione($key, &$nazione_opzioni, $peso_totale, $list, $dettaglio, $list_opzione_check_id) {
	$fascia_opzione_presente = false;
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
			if (in_array($fascia, $list_opzione_check_id)) {
				$fascia_opzione_presente = true;
			}
			$tempo_spedizione = @$dettaglio[$key . '_tempo_spedizione'];
			$key = explode('_', $key);
			
			if (!$tempo_spedizione) {
				if ($key[1] == 'standard') {
					$tempo_spedizione = 1;
				}
				else {
					$tempo_spedizione = 2;
				}
			}
			$_lbl = H::labels('checkout', H::context()->currentLang());
			$descrizione = $_lbl['tempi_spedizione'];
			if ($descrizione == '') {
				$descrizione = 'Tempi spedizione: %tempo% giorni';
			}
			$descrizione = str_replace('%tempo%', $tempo_spedizione, $descrizione);
			
			$nome = strtoupper($key[0]) . ' ' . $key[1];
			$row = [
				'id' => $fascia,
				'nome' => $nome,
				'img' => strtolower($key[0]) . '.png',
				'descrizione' => $descrizione,
				'prezzo' => $dettaglio[$fascia],
			];
			$opzione = new OpzioneSpedizione($row, '', false);
			$nazione_opzioni[] = [
				'tipo' => 1,
				'list' => [
					$opzione
				],
			];
		}					
	}
	return $fascia_opzione_presente;
}

H::lib('Cart');
H::lib('Spedizione');
H::lib('generic/OpzioneSpedizione');
$cart = Cart::load();
$id_nazione = $cart['nazione'];

$nazione_opzioni = [];
$nazione = H::db2()->selectById('nazione', $id_nazione)->item();
if ($nazione) {
	$fascia_opzione_presente = false;
	$list_opzione_check_id = [];
	if (isset($cart['spedizione_opzione']) && count($cart['spedizione_opzione']['list']) > 0) {
		$list_opzione_check_id = $cart['spedizione_opzione']['list_id'];
	}
	
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
							$dettaglio[$key . '_tempo_spedizione'] = @$nazione_cap['giorni_spedizione'];
							if (loadOpzioniSpedizione($key, $nazione_opzioni, $peso_totale, $list, $dettaglio, $list_opzione_check_id)) {
								$fascia_opzione_presente = true;
							}								
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
								$dettaglio[$key . '_tempo_spedizione'] = @$nazione_provincia['giorni_spedizione'];
								if (loadOpzioniSpedizione($key, $nazione_opzioni, $peso_totale, $list, $dettaglio, $list_opzione_check_id)) {
									$fascia_opzione_presente = true;
								}
								break;
							}
						}
					}
				}
			}				
		}
	}
	$dettaglio = (array)json_decode(@$nazione['dettaglio'], true);
	if ($dettaglio) {
		if (count($nazione_opzioni) == 0) {
			$listCorriere = Spedizione::listCostiSpedizione();
			foreach ($listCorriere as $key => $list) {
				if (H::settings('*')->get('spedizione_' . $key, '') != '') {
					if (loadOpzioniSpedizione($key, $nazione_opzioni, $peso_totale, $list, $dettaglio, $list_opzione_check_id)) {
						$fascia_opzione_presente = true;
					}
				}
			}
		}
	}
	if (count($nazione_opzioni) > 0) {
		usort($nazione_opzioni, function($a, $b) {
			if ($a['list'][0]->get('prezzo') == $b['list'][0]->get('prezzo')) {
				return 0;
			}
			return $a['list'][0]->get('prezzo') < $b['list'][0]->get('prezzo') ? -1 : 1;
		});
	}
	
	if (!$fascia_opzione_presente || !isset($cart['spedizione_opzione']) || count($cart['spedizione_opzione']['list']) == 0) {
		$list_opzione = [];
		$list_opzione_id = [];
		
		if (count($nazione_opzioni) > 0) {
			$first = $nazione_opzioni[0]['list'][0];
			$list_opzione_id[] = $first->get('id');
			$list_opzione[] = [
				'peso_totale' => $peso_totale,
				'id' => $first->get('id'),
				'nome' => $first->get('nome'),
				'prezzo' => $first->get('prezzo'),
			];
		}

		$cart['spedizione_opzione'] = [
			'list' => $list_opzione,
			'list_id' => $list_opzione_id
		];
		Cart::impostaSpeseSpedizione($cart);
		Cart::store($cart);
	}
}

H::view('nazione_opzioni', $nazione_opzioni);