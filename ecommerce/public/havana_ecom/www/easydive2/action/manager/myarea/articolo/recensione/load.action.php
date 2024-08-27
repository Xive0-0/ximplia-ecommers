<?php
H::includeFromLib('Utils');

Utils::item($_, '
	SELECT 
		*
	FROM 
		ED_RECENSIONE 
	WHERE 
		ID = :id', 
	'articolo/recensione');
