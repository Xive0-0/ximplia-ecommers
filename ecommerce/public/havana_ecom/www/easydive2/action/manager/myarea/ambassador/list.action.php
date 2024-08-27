<?php
H::includeFromLib('Utils');

$qryParams = [
	':lang' => H::config('default_language', 'it')
];

Utils::items_list(
	'A.*,
	AL.*',
	'	ED_AMBASSADOR A,
		ED_AMBASSADOR_LANG AL
	WHERE
		A.ID = AL.ID_ED_AMBASSADOR AND
		AL.LANG = :lang ',
	'id',
	'desc',
	$qryParams);