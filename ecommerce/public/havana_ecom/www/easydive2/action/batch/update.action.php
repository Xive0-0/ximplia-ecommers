<?php
set_time_limit(0);

function clona_categoria($attributo, $id_new_padre) {
	$id_old = $attributo['id'];
	unset($attributo['id']);
	$attributo['id_padre'] = $id_new_padre;
	$id_new = H::db2()->insert('attributo', $attributo);
	
	$params = [
		'id_attributo' => $id_old
	];
	$list_attributo_lang = H::db2()->select('attributo_lang', $params)->listItems();
	foreach ($list_attributo_lang as $attributo_lang) {
		$attributo_lang['id_attributo'] = $id_new;
		H::db2()->insert('attributo_lang', $attributo_lang);
	}
	
	return $id_new;
}

function clona_ramo($id_old, $id_new_padre) {
	$params = [
		'id_padre' => $id_old
	];
	$list_attributo = H::db2()->select('attributo', $params)->listItems();
	foreach ($list_attributo as $attributo) {
		echo 'clona ' . $attributo['id'] . "\n";
		$id_new = clona_categoria($attributo, $id_new_padre);
		clona_ramo($attributo['id'], $id_new);
	}
}

clona_ramo(126, 1256);