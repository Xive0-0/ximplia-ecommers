<?php
H::includeFromLib('ArticoloSettingsBase');
class ArticoloSettings extends ArticoloSettingsBase {
	public static function &elenco_attributo_scheda($tipo) {
		if ($tipo == 'kit') {
			$list = [];			
		}
		else {
			$list = [
				['list' => 'listCategoria', 'type' => 'categoria', 'all' => false],
				['list' => 'listSelezione', 'type' => 'selezione', 'all' => false]
			];			
		}

		switch($tipo) {
		case 'kit':
			$list[] = ["type" => "obiettivo", "list" => "listObiettivo"];
			$list[] = ["type" => "kit", "list" => "listKit"];
			break;
		case 'articolo':
			$list[] = ["type" => "fotocamera", "list" => "listFotocamera"];
			$list[] = ["type" => "cellulare", "list" => "listCellulare"];
			break;
		}
		return $list;
	}
}
