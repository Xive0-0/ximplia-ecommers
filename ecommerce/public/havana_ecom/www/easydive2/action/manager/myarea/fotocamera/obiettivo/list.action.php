<?php
H::lib('Utils');

Utils::items_list(
	'fo.*, b.nome brand_nome',
	'fotocamera_obiettivo fo,
	fotocamera_brand b
	where 
		fo.brand_id = b.id',
	'b.nome',
	'asc');