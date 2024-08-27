<?php
H::lib('Utils');

Utils::items_list(
	'fm.*, b.nome brand_nome',
	'fotocamera_modello fm,
	fotocamera_brand b
	where 
		fm.brand_id = b.id',
	'b.nome',
	'asc');