<?php
H::includeFromLib('generic/ArticoloBase');

class Articolo extends ArticoloBase {
	private $list_sub = null;
	
	public function subArticoli() {
		return $this->list_sub;
	}
	
	public function addSubArticolo($articolo) {
		if ($this->list_sub == null) {
			$this->list_sub = [];
		}
		if (!is_array($articolo)) {
			$articolo = [$articolo];
		}
		foreach ($articolo as $a) {
			$this->list_sub[] = $a;
		}
	}
	
	public function codice() {
		return $this->get('codice');
	}
	
	public function prezzo($format = '', $iva = true) {
		$prezzo = parent::prezzo($format, $iva);
		if ($this->tipo() == 2) {
			$prezzo = parent::prezzo('', $iva);
			if ($prezzo <= 0) {
				if ($this->list_sub == null) {
					$this->list_sub = [];
					$ps = H::db()->prepare('SELECT
									A.*,
									AL.NOME
								FROM
									ARTICOLO A,
									ARTICOLO_LANG AL,
									ARTICOLO_RELAZIONE AR
								WHERE
									AR.ID_ARTICOLO_2 = A.ID AND
									AR.TIPO = 100 AND
									AR.ID_ARTICOLO_1 = :id_articolo AND
									A.ID = AL.ID_ARTICOLO AND
									AL.LANG = :lang
								ORDER BY A.ORDINE DESC, AL.NOME ASC');
					$ps->execute([
							':lang' => H::context()->currentLang(),
							':id_articolo' => $this->id()
						]);
					while ($row = $ps->fetch()) {
						$this->list_sub[] = new Articolo($row);
					}
				}
				foreach ($this->list_sub as $sub) {
					$prezzo += $sub->prezzo('', $iva);
				}
				if ($format != '') {
					if ($iva) {
						$prezzo = $this->formatPrezzoConIva($prezzo, $format);
					}
					else {
						$prezzo = $this->formatPrezzo($prezzo, $format);
					}
				}
			}
		}

		return $prezzo;
	}
	
	public function formatPrezzoConIva($prezzo, $format = 'euro') {
		$prezzo = number_format($prezzo, 2, '.', '');

		$part = explode('.', $prezzo);
		switch($part[1]) {
		case '01':
		case '02':
			$part[1] = '00';
			break;
		case '98':
		case '99':
			$part[0] = $part[0] + 1;
			$part[1] = '00';
			break;
		}
		$prezzo = $part[0] . '.' . $part[1];
		$prezzo = number_format($prezzo, 2, ',', '.');

		return $prezzo . ($format == 'simple' ? '' : ' &euro;');
	}
}