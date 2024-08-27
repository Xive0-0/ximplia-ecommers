<?php
H::includeFromLib('Utils');

$qryParams = [
	':lang' => H::config('default_language', 'it')
];

Utils::items_list(
	'A.*,
	AL.*',
	'	ED_EASYDIVEPOINT A,
		ED_EASYDIVEPOINT_LANG AL
	WHERE
		A.ID = AL.ID_ED_EASYDIVEPOINT AND
		AL.LANG = :lang ',
	'id',
	'desc',
	$qryParams);