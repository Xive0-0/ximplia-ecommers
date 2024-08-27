<?php
$list = [
	['key' => '0_25', 'label' => 'fino a 25,00 euro'],
	['key' => '25_50', 'label' => 'da 25,00 a 50,00 euro'],
	['key' => '50_100', 'label' => 'da 50,00 a 100,00 euro'],
	['key' => '100_200', 'label' => 'da 100,00 a 200,00 euro'],
	['key' => '200_', 'label' => 'oltre 200,00 euro'],
];
H::view($_('list', 'list'), $list);
?>