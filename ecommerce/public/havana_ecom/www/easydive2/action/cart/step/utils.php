<?php
function ordina($a, $b) {
	$ordine_a = $a->get('ordine2', 0);
	if ($ordine_a == 0) {
		$ordine_a = $a->get('ordine', 0);
	}
	$ordine_b = $b->get('ordine2', 0);
	if ($ordine_b == 0) {
		$ordine_b = $b->get('ordine', 0);
	}
    if ($a->get('consigliato', '') == '') {
		if ($b->get('consigliato', '') == '') {
			return $ordine_a > $ordine_b ? -1 : 0;
		}
		return 1;
	}
	else {
		if ($b->get('consigliato', '') == '') {
			return -1;
		}
		return $ordine_a > $ordine_b ? -1 : 1;
	}
}