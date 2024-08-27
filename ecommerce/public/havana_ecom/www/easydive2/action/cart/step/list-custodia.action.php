<?php
$list = [];

H::lib('generic/Articolo');
$params = [
	'a.id' => [
		840,
		176,
		223,
		224,
		915,
	],
	'a.id:_' => 'al.id_articolo', 
	'al.lang' => H::context()->currentLang()
];
$rs = H::db2()->selectView('a.*, al.*', 'articolo a, articolo_lang al', $params);
while ($row = $rs->fetch()) {
	$list[] = Articolo::newInstance($row, false);
}

H::view('list', $list);