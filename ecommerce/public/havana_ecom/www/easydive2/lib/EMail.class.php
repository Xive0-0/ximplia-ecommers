<?php
H::includeFromLib('EMailBase');

class EMail extends EMailBase {	
	public static function parseDestinatario(&$destinatario) {
		if (is_string($destinatario)) {
			if (HString::endsWith($destinatario, '@easydive.it')) {
				$destinatario = 'easydive@ximplia.it';
			}
		}
		elseif (is_array($destinatario)) {
			for ($i = 0, $len = count($destinatario); $i < $len; $i++) {
				if (HString::endsWith($destinatario[$i], '@easydive.it')) {
					$destinatario[$i] = 'easydive@ximplia.it';
				}
			}
		}
	}
}