<?php
$id = H::input('id', 0);
$file = H::input()->getFile('file');

H::includeFromLib('Utils');
Utils::set_image_entita($id, $file, 'ED_AMBASSADOR', 6);

H::context()->put('success', 'Immagine caricata correttamente');