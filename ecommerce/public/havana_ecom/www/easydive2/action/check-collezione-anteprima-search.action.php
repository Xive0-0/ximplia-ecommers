<?php
H::includeFromLib('AppUtils');
H::includeFromLib('generic/Item');

$id_attributo_list = H::input()->getArrayClean('coll_id', []);

if ($id_attributo_list != null && 
	is_array($id_attributo_list) &&
	count($id_attributo_list) == 1) {
			
	$strQry = 'SELECT
			A.ID
		FROM
			ATTRIBUTO A
		WHERE
			A.ABILITATO = true AND
			A.ID = :id AND
			A.ID_PADRE = 0';

	$ps = H::db()->prepare($strQry);
	$ps->execute([
		':id' => $id_attributo_list[0],
	]);
	if ($row = $ps->fetch()) {
		$list = [];
		$strQry = 'SELECT
				A.*,
				AL.*
			FROM
				ATTRIBUTO A,
				ATTRIBUTO_LANG AL
			WHERE
				A.ABILITATO = true AND
				A.ID = AL.ID_ATTRIBUTO AND
				AL.LANG = :lang AND
				A.ID_PADRE = :id
			ORDER BY A.ORDINE DESC, AL.NOME ASC';

		$ps = H::db()->prepare($strQry);
		$ps->execute([
			':lang' => H::context()->currentLang(),
			':id' => $id_attributo_list[0],
		]);
		$list = [];
		while ($row = $ps->fetch()) {
			$list[] = new Item($row);
		}
		if (count($list) > 0) {
			$ps = H::db()->prepare('
				SELECT
					A.*,
					AL.*
				FROM
					ATTRIBUTO A,
					ATTRIBUTO_LANG AL
				WHERE
					A.ID = AL.ID_ATTRIBUTO AND
					AL.LANG = :lang AND
					ID = :id
				ORDER BY A.ORDINE DESC, AL.NOME ASC');
			$ps->execute([
				':id' => $id_attributo_list[0],
				':lang' => H::context()->currentLang(),
			]);
			$list_id_in_collezione = [$id_attributo_list[0]];
			if ($row = $ps->fetch()) {
				$collezione = new Item($row);
			
				$strQry = 'SELECT
						A.*,
						AL.*
					FROM
						ATTRIBUTO A,
						ATTRIBUTO_LANG AL
					WHERE
						A.ABILITATO = true AND
						A.ID = AL.ID_ATTRIBUTO AND
						AL.LANG = :lang AND
						A.TIPO = :tipo';

				$ps = H::db()->prepare($strQry);
				$ps->execute([
					':lang' => H::context()->currentLang(),
					':tipo' => $collezione->get('tipo'),
				]);
				$map = [];
				while ($row = $ps->fetch()) {
					$map['_' . $row['ID']] = $row;
				}
				
				$id_padre = $map['_' . $collezione->id()]['ID_PADRE'];
				$listCollezioneTree = [
					$collezione
				];
				while ($id_padre != 0 && isset($map['_' . $id_padre])) {
					$listCollezioneTree[] = new Item($map['_' . $id_padre]);
					$id_padre = $map['_' . $id_padre]['ID_PADRE'];
				}
				$listCollezioneTree = array_reverse($listCollezioneTree);		
					
				$result = [
					'collezione' => $collezione,
					'listCollezioneTree' => $listCollezioneTree,
					'title' => $collezione->get('nome'),
				];

				H::view($_('result', 'result'), $result);

				AppUtils::sorgente_traking_ordini();
				H::view('list_categoriaAnteprima', $list);
			}
		}	
	}
	else {
		$id_padre_per_lista = $id_attributo_list[0];
		$strQry = 'SELECT
				AC.*
			FROM
				ATTRIBUTO AC,
				ATTRIBUTO AP
			WHERE
				AP.ID_PADRE = 0 AND
				AC.ID = :id AND
				AC.ID_PADRE = AP.ID
			LIMIT 0,1';

		$ps = H::db()->prepare($strQry);
		$ps->execute([
			':id' => $id_attributo_list[0],
		]);
		if ($row = $ps->fetch()) {
			
		}
		else {
			$strQry = 'SELECT
					A.ID_PADRE
				FROM
					ATTRIBUTO A
				WHERE
					A.ID = :id';

			$ps = H::db()->prepare($strQry);
			$ps->execute([
				':id' => $id_attributo_list[0],
			]);
			if ($row = $ps->fetch()) {
				$id_padre_per_lista = $row['ID_PADRE'];
			}
		}
		
		$list = [];
		$strQry = 'SELECT
				A.*,
				AL.*
			FROM
				ATTRIBUTO A,
				ATTRIBUTO_LANG AL
			WHERE
				A.ABILITATO = true AND
				A.ID = AL.ID_ATTRIBUTO AND
				AL.LANG = :lang AND
				A.ID_PADRE = :id
			ORDER BY A.ORDINE DESC, AL.NOME ASC';

		$ps = H::db()->prepare($strQry);
		$ps->execute([
			':lang' => H::context()->currentLang(),
			':id' => $id_padre_per_lista,
		]);
		$list = [];
		while ($row = $ps->fetch()) {
			$list[] = new Item($row);
		}
		H::view('list_categoria', $list);
	}
}