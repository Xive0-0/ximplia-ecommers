<?php
$tipo = H::input('tipo', 0);
$id_categoria_principale = 0;
$params_extra = null;
if ($tipo < 2) {
	$id_categoria = H::input()->getArrayClean('id_categoria', []);
	$id_categoria_principale = H::input()->getArrayClean('tree_principale_id_categoria', []);

	if ($id_categoria == null || count($id_categoria) == 0) {
		H::context()->put('error', 'Selezionare almeno una categoria');
		H::fire('view');
	}
	if ($id_categoria_principale == null || count($id_categoria_principale) == 0) {
		H::context()->put('error', 'Bisogna impostare una categoria come principale');
		H::fire('view');	
	}
	$id_categoria_principale = $id_categoria_principale[0];
	if (!in_array($id_categoria_principale, $id_categoria)) {
		H::context()->put('error', 'La categoria principale deve essere una di quelle associate');
		H::fire('view');		
	}
	
	$id_selezione = H::input()->getArrayClean('id_selezione', []);
	$id_fotocamera = H::input()->getArrayClean('id_fotocamera', []);
	$id_cellulare = H::input()->getArrayClean('id_cellulare', []);
	$dettaglio = [
		'id_categoria_principale' => $id_categoria_principale,
		'id_categoria' => $id_categoria,
		'id_selezione' => $id_selezione,
		'id_fotocamera' => $id_fotocamera,
		'id_cellulare' => $id_cellulare,
		'codice_3d_img' => H::input('codice_3d_img', ''),
		'tipo_custodia' => H::input('tipo_custodia', ''),
		'patent' => H::input('patent', ''),
		'lifetime' => H::input('lifetime', ''),
		'universal_housing' => H::input('universal_housing', ''),
		'waterproof' => H::input('waterproof', ''),
		'consigliato' => H::input('consigliato', ''),
		'plastic_free' => H::input('plastic_free', ''),
		'prodotto_brevettato' => H::input('prodotto_brevettato', ''),
	];

	$dettaglio_lang = [
		'descrizione' => H::input()->getOriginal('descrizione', ''),
		'descrizione_breve' => H::input()->getOriginal('descrizione_breve', ''),
		'scheda_tecnica' => H::input()->getOriginal('scheda_tecnica', ''),
		'testo_indicazioni' => H::input()->getOriginal('testo_indicazioni', ''),
		'garanzia' => H::input('garanzia', ''),
		'step_acquisto_testo' => H::input('step_acquisto_testo', ''),
	];
	$list_tipo = [
			['tipo' => 'categoria', 'id' => $id_categoria],
			['tipo' => 'selezione', 'id' => $id_selezione],
			['tipo' => 'fotocamera', 'id' => $id_fotocamera],
			['tipo' => 'cellulare', 'id' => $id_cellulare],
		];
		
	$params_extra = [
		'parametro_calcolo_spedizione' => H::input()->getFloatEuro('parametro_calcolo_spedizione', 0),
		'ordine_configuratore' => H::input('ordine_configuratore', 0),
		'obiettivo_angolo_minimo' => H::input('obiettivo_angolo_minimo', 0),
		'obiettivo_angolo_massimo' => H::input('obiettivo_angolo_massimo', 0),
		'extension_lunghezza_dal' => H::input('extension_lunghezza_dal', 0),
		'extension_lunghezza_al' => H::input('extension_lunghezza_al', 0),
	];
}
else {
	$params_extra = [
		'codice_abbinamento_fotocamera' => H::input('codice_abbinamento_fotocamera', '')
	];
	$id_kit = H::input()->getArrayClean('id_kit', []);
	$id_obiettivo = H::input()->getArrayClean('id_obiettivo', []);
	$dettaglio = [
		'id_obiettivo' => $id_obiettivo,
		'id_kit' => $id_kit,
		'consigliato' => H::input('consigliato', ''),
	];

	$dettaglio_lang = [
		'step_acquisto_testo' => H::input('step_acquisto_testo', ''),
	];
	$list_tipo = [
			['tipo' => 'obiettivo', 'id' => $id_obiettivo],
			['tipo' => 'kit', 'id' => $id_kit],
		];	
}

H::includeFromLib('AppUtils');
$id = AppUtils::save_item($dettaglio,
	$dettaglio_lang,
	$list_tipo,
	true,
	$id_categoria_principale, 
	$params_extra);
	
if ($tipo == 2) {
	AppUtils::set_item_relazione($id, 'id_articolo_kit', 100);
}
H::context()->put('success', 'Dati salvati correttamente');