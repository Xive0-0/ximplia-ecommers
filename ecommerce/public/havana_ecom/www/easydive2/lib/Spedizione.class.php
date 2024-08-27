<?php
H::includeFromLib('SpedizioneBase');

class Spedizione extends SpedizioneBase {
	public static function listCorrieri() {
		return [
			'sda_standard' => 'SDA standard',
			'gls_standard' => 'GLS standard',
			'gls_express' => 'GLS express',
			'fedex_standard' => 'Fedex standard',
			'fedex_express' => 'Fedex express',
			'ups_standard' => 'UPS standard',
			'ups_express' => 'UPS express',
			'dhl_standard' => 'DHL standard',
			'dhl_express' => 'DHL express',
		];
	}
	
	private static function generaLista($key, $add, $add10 = -1, $add20 = -1, $add30 = -1) {
		if ($add10 < 0) {
			$add10 = $add;
		}
		if ($add20 < 0) {
			$add20 = $add10;
		}
		if ($add30 < 0) {
			$add30 = $add20;
		}
		$list = [];
		for ($i = 0; $i < 50;) {
			$da = $i;
			if ($i == 10) {
				$add = $add10;
			}
			elseif ($i == 20) {
				$add = $add20;
			}
			elseif ($i == 30) {
				$add = $add30;
			}
			$a = $i + $add;
			$list[] = ['id' => $key . '_' . HString::normalize($da . ' ' . $a, '_'), 'label' => $da . '-' . $a . ' Kg', 'label_small' => $da . '-' . $a . ' Kg', 'da' => $da, 'a' => $a];
			$i += $add;
		}
		return $list;
	}
	private static function generaListaDaValori($key, $values) {
		$list = [];
		for ($i = 0, $len = count($values) - 1; $i < $len; $i++) {
			$da = $values[$i];
			$a = $values[$i + 1];
			$list[] = ['id' => $key . '_' . HString::normalize($da . ' ' . $a, '_'), 'label' => $da . '-' . $a . ' Kg', 'label_small' => $da . '-' . $a . ' Kg', 'da' => $da, 'a' => $a];
		}
		return $list;
	}
	
	public static function listCostiSpedizione() {
		return [
			'default' => [],
			'sda_standard' => self::generaListaDaValori('sda_standard', [0, 3, 5, 10, 20, 30, 50]),
			'gls_standard' => self::generaListaDaValori('gls_standard', [0, 3, 5, 10, 20, 30, 50]),
			'gls_express' => self::generaListaDaValori('gls_express', [0, 3, 5, 10, 20, 30, 50]),
			'fedex_standard' => self::generaLista('fedex_standard', 0.5),
			'fedex_express' => self::generaLista('fedex_express', 0.5),
			'ups_standard' => self::generaLista('ups_standard', 1, 2),
			'ups_express' => self::generaLista('ups_express', 0.5, 1, 2, 5),
			'dhl_standard' => self::generaLista('dhl_standard', 1),
			'dhl_express' => self::generaLista('dhl_express', 0.5),
		];
	}
}