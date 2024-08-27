<?php
H::includeFromLib('Utils');

Utils::items_list_simple(
	'SELECT 
		*
	FROM
		ED_RECENSIONE
	WHERE
		ID_ARTICOLO = :id',
	[
		':id' => H::input('id', 0)
	]);
