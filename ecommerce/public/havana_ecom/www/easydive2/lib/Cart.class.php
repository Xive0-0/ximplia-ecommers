<?php
H::lib('CartBase');

class Cart extends CartBase {
	public static function get_codice_ordine($id) {
		return strtoupper(H::settings('*')->get('prefisso_codice_ordine', '')) . $id;
	}	
	
	public static function speseSpedizioneBase($ordine, &$list_items, $id_nazione, $item_nazione, $default, $id_utente, $provincia = null, $cap = null) {
		return 0;
	}
}