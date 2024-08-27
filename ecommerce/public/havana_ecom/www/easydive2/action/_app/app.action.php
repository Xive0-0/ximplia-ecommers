<?php
H::includeFromLib('generic/Item');

$categorie = [];
$lang = H::context()->currentLang();
$ps = H::db()->prepare('SELECT
				A.*,
				AL.NOME,
				AL.DETTAGLIO_LANG
			FROM
				ATTRIBUTO A,
				ATTRIBUTO_LANG AL
			WHERE
				(A.VISIBILITA_LANG = \'-\' OR A.VISIBILITA_LANG LIKE :visibilita) AND
				A.ID_PADRE = 0 AND
				A.ABILITATO = true AND
				A.ID = AL.ID_ATTRIBUTO AND
				AL.LANG = :lang AND
				A.TIPO = :tipo
			ORDER BY A.ORDINE DESC, AL.FIND ASC');
$ps->execute([
		':visibilita' => '%' . $lang . ',%',
		':lang' => $lang,
		':tipo' => 2
	]);
while ($row = $ps->fetch()) {
	$item = new Item($row);
	$categorie[] = [
		'nome' => $item->get('nome'),
		'url' => $item->url(),
		'img' => H::config('url') . $item->imageUrl('650x320'),
	];
}

if (H::session()->isAuth()) {
	$cliente = H::session('user');
}
else {
	$cliente = null;
}
if ($cliente) {
	$my_area = [
		[
			'nome' => 'I miei ordini',
			'url' => HUtil::xurl('/account/my/ordini/index'),
			'img' => H::config('url') . '/assets/website/img/app/carrello.png',
		],
		[
			'nome' => 'Preferiti',
			'url' => HUtil::xurl('/account/my/preferiti/index'),
			'img' => H::config('url') . '/assets/website/img/app/cuore.png',
		],
		[
			'nome' => 'Indirizzi di spedizione',
			'url' => HUtil::xurl('/account/my/indirizzi/index'),
			'img' => H::config('url') . '/assets/website/img/app/spedizione.png',
		],
		[
			'nome' => 'Dati di fatturazione',
			'url' => HUtil::xurl('/account/my/fatturazione/index'),
			'img' => H::config('url') . '/assets/website/img/app/euro.png',
		],
		[
			'nome' => 'Modifica password',
			'url' => HUtil::xurl('/account/my/modifica-password'),
			'img' => H::config('url') . '/assets/website/img/app/password.png',
		]
	];
}
else {
	$my_area = [
		[
			'nome' => 'Accedi all\'area riservata',
			'url' => (H::context()->isWebApp() ? '/_app/account/login' : 'login'),
			'img' => H::config('url') . '/assets/website/img/app/login.png',
		],
		[
			'nome' => 'Registrati',
			'url' => (H::context()->isWebApp() ? '/_app/account/registrati' : 'registrati'),
			'img' => H::config('url') . '/assets/website/img/app/registrati.png',
		],
		[
			'nome' => 'Recupero password',
			'url' => (H::context()->isWebApp() ? '/_app/account/password' : 'password'),
			'img' => H::config('url') . '/assets/website/img/app/password.png',
		],
	];
}

$my_area = array_merge($my_area, [
	[
		'nome' => 'Chi siamo',
		'url' => HUtil::xurl('/chi-siamo'),
		'img' => H::config('url') . '/assets/website/img/app/logo.png',
	],
	[
		'nome' => 'FAQ',
		'url' => HUtil::xurl('/info/faq'),
		'img' => H::config('url') . '/assets/website/img/app/faq.png',
	],
	[
		'nome' => 'Servizio clienti',
		'url' => HUtil::xurl('/scrivi-servizio-clienti'),
		'img' => H::config('url') . '/assets/website/img/app/support.png',
	],
	[
		'nome' => 'Spedizioni',
		'url' => HUtil::xurl('/info/termini-e-condizioni'),
		'img' => H::config('url') . '/assets/website/img/app/support.png',
	],
	[
		'nome' => 'Termini e condizioni',
		'url' => HUtil::xurl('/info/termini-e-condizioni'),
		'img' => H::config('url') . '/assets/website/img/app/support.png',
	],
	[
		'nome' => 'Diritto di recesso',
		'url' => HUtil::xurl('/info/diritto-recesso'),
		'img' => H::config('url') . '/assets/website/img/app/support.png',
	],
	[
		'nome' => 'Privacy Policy',
		'url' => HUtil::xurl('/info/privacy-policy'),
		'img' => H::config('url') . '/assets/website/img/app/support.png',
	]
]);	
if ($cliente) {
	$my_area = array_merge($my_area, [
		[
			'nome' => 'Esci',
			'url' => (H::context()->isWebApp() ? '/_app/account/logout' : 'logout'),
			'img' => H::config('url') . '/assets/website/img/app/logout.png',
		],
	]);
}	

H::view('categorie', $categorie);
H::view('my_area', $my_area);