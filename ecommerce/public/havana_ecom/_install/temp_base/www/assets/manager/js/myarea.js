$(function(){
	H.callback['check_stato_ordine'] = function(form) {
		var val = '';
		form.find('input[name="stato"]').each(function() {
			if (val == '') {
				val = $(this).val();
			}
		});
		if (val == 101) {
			var id = form.find('input[name="id"]').val();
			var cont = form.closest('.h-popup-content');
			cont.animate({width: 700, height: 500, marginTop: -250, marginLeft: -350});
			cont.loadWindow({
				url: '/manager/myarea/ordini/articoli-non-disponibili',
				params: {
					id: id
				}	
			});			
		}
		else {
			form.trigger('do-submit');
		}
	};
	
	H.callback['seleziona_tutto_da_elenco'] = function(elem) {
		var seleziona = elem.hasClass('h-checkbox-checked');
		
		elem.closest('.select-content-wrapper').find('.select-content .h-checkbox').each(function() {
			if (seleziona) {
				if (!$(this).hasClass('h-checkbox-checked')) {
					$(this).trigger('click');
				}
			}
			else {
				if ($(this).hasClass('h-checkbox-checked')) {
					$(this).trigger('click');
				}				
			}
		});
	};
	
	H.callback['gestione_disponibilita_tutti_articoli'] = function(elem) {
		var value = elem.attr('data-value');
		
		H.ajax('/manager/myarea/ordini/update-disponibilita-tutti-articoli', {
			data: {
				id: value,
				disponibile: (elem.hasClass('h-checkbox-checked') ? 1 : 0)
			},
			success: function(data) {
				if (data && data.data && 
					data.data.session_fault == 'session_fault') {
					return;
				}
				var list = elem.closest('table').find('.row-articolo-ordine');;
				if (elem.hasClass('h-checkbox-checked')) {
					list.addClass('h-list-row-selected');
					list.each(function() {
						$(this).find('.articolo-ordine-disponibile').addClass('h-checkbox-checked');
						$(this).find('input').val('1');
					});
				}
				else {
					list.removeClass('h-list-row-selected');
					list.each(function() {
						$(this).find('.articolo-ordine-disponibile').removeClass('h-checkbox-checked');
						$(this).find('input').val('');
					});
				}
				var cell = $('#h-layout-center-content tr[data-id="' + value + '"] .disponibilita-ordine');
				var num = parseInt(cell.attr('data-numero-articoli'));
				if (data.disponibili < num) {
					cell.addClass('cell-alert');
				}
				else {
					cell.removeClass('cell-alert');
				}
				$('#h-layout-center-content tr[data-id="' + value + '"] .disponibilita-ordine span').html(data.disponibili);
			},
			failure: function() {
				$('body').message({message: 'Errore in fase di comunicazione con il server', type: 'error'});
			}
		});
	};
	
	H.callback['gestione_disponibilita_articolo'] = function(elem) {
		var value = elem.attr('data-value');
		H.ajax('/manager/myarea/ordini/update-disponibilita-articolo', {
			data: {
				id: value,
				disponibile: (elem.hasClass('h-checkbox-checked') ? 1 : 0)
			},
			success: function(data) {
				if (data && data.data && 
					data.data.session_fault == 'session_fault') {
					return;
				}
				value = value.split('#');
				var cell = $('#h-layout-center-content tr[data-id="' + value[0] + '"] .disponibilita-ordine');
				var num = parseInt(cell.attr('data-numero-articoli'));
				if (data.disponibili < num) {
					cell.addClass('cell-alert');
				}
				else {
					cell.removeClass('cell-alert');
				}
				$('#h-layout-center-content tr[data-id="' + value[0] + '"] .disponibilita-ordine span').html(data.disponibili);
			},
			failure: function() {
				$('body').message({message: 'Errore in fase di comunicazione con il server', type: 'error'});
			}
		});
	};
	
	$('body').layout($('#h-layout-center').actionParams());
	$('#h-layout-body').css({display: 'block'});

	$('body').on('click', '.action-visualizza-codici-iva', function() {
		$(this).closest('.field-wrapper-iva-content').find('.field-wrapper-iva, .action-nascondi-codici-iva').css({display: 'block'});
		$(this).css({display: 'none'});
	});
	$('body').on('click', '.action-nascondi-codici-iva', function() {
		$(this).closest('.field-wrapper-iva-content').find('.field-wrapper-iva').css({display: 'none'});
		$(this).closest('.field-wrapper-iva-content').find('.action-visualizza-codici-iva').css({display: 'block'});
		$(this).css({display: 'none'});		
	});
	
	$('body').on('click', '.action-filtra-coll-id', function() {
		var opt = $(this).actionParams();
		var oldParams = $(opt.load).attr('data-load-params');
		if (oldParams == null || oldParams == '') {
			oldParams = {};
		}
		var loadParams = $.extend(oldParams, opt.params);
		$(opt.load).attr('data-load-params', JSON.stringify(loadParams));
		$(opt.load).loadWindow();
		$(opt.reset).find('.h-nav-button-wrapper').css({display: 'block'});		
	});
	
	$('body').on('click', '.action-find-in-list', function() {
		var opt = $(this).actionParams();
		var params = opt.params == null ? {} : opt.params;
		
		var cont = $(opt.content);
		cont.loading();
		
		$(this).closest('.action-find-form').find('input,select,textarea').each(function() {
			params[$(this).attr('name')] = $(this).val();
		});

		cont.load(cont.attr('data-url'), params, function() {
			cont.loading(false);
		});
	});
	
	$('body').on('click', '.action-import-data', function() {
		var opt = $(this).actionParams();
		var cont = $(this).closest('[data-tab]');
		var report = cont.find('.report');
		var loadingWin = $('body').loading();
		report.html('');
		report.load(opt.url, function() {
			loadingWin.loading(false);
		});
	});
	$('body').on('click', '.field-line-file .field-anteprima[data-download]', function() {
		var url = $(this).data('download');
		var cont = $(this).closest('.field-line-file');
		var input = cont.find('.field-file');
		if (input.length > 0) {
			var documento_id = input.val();
			if (documento_id) {
				window.open('/manager/myarea/' + url + '?id=' + documento_id);
			}
		}
	});
	
	$('body').on('click', '.expand-header', function() {
		var parent = $(this).parent();
		$(this).next().toggle(400, function() {
			if (parent.hasClass('expand')) {
				parent.removeClass('expand');
			}
			else {
				parent.addClass('expand');
			}
		});
	})
	
	$('.aggiorna-statistiche-personalizzate').on('click', function() {
		var form = $(this).closest('form');
		if (H.Validator.checkIsValidForm(form)) {
			var sp = $(this).closest('.block-tab-body').find('.statistiche-personalizzate');
			var opt = sp.actionParams();
			opt.params.dal = form.find('[name="data_dal"]').val();
			opt.params.al = form.find('[name="data_al"]').val();
			sp.actionParams('data-action', opt);
			sp.hload(true);
		}
		else {
			$('body').message({message: 'Intervallo date non valido', type: 'error'});
		}
	});
	
	$('.aggiorna-statistiche-confronta').on('click', function() {
		var form = $(this).closest('form');
		if (H.Validator.checkIsValidForm(form)) {
			var sp = $(this).closest('.block-tab-body').find('.statistiche-personalizzate');
			var opt = sp.actionParams();
			opt.params.dal_1 = form.find('[name="data_dal_1"]').val();
			opt.params.al_1 = form.find('[name="data_al_1"]').val();
			opt.params.dal_2 = form.find('[name="data_dal_2"]').val();
			opt.params.al_2 = form.find('[name="data_al_2"]').val();
			opt.params.tipo = form.find('[name="tipo"]').val();
			sp.actionParams('data-action', opt);
			sp.hload(true);
		}
		else {
			$('body').message({message: 'Intervallo date non valido', type: 'error'});
		}
	});
	
	$('.azzera-filtro-cerca').on('click', function() {
		$('#cerca_fields input').val('');
		$('#cerca_fields input[name=nome]').focus();
	});
	
	$('body').on('dettaglio-articolo-aggiungi-ordine', function(e, obj, id) {
		var loadingWin = $('body').loading();
		var content = obj.closest('form').find('.dettaglio-articolo');
		content.html('');
		var opt = content.actionParams();
		content.loadWindow({
			url: opt.url,
			params: {
				id: id
			},
			onComplete: function() {
				loadingWin.loading(false);
			}	
		});
	});
	
	$('body').on('click', '.h-action-seleziona-risorsa-banner-autocomplete', function() {
		var item = $(this).closest('form').find('.autocomplete-content-value-block');
		if (item.length == 0) {
			$('body').message({message: 'Selezionare una voce', type: 'error'});
		}
		else {
			var val = item.find('input').val();
			var nome = '#' + val + ' - ' + item.find('span').text();
			
			$('#banner_edit .h-action-seleziona-risorsa-dettaglio').html(nome);
			$('#banner_edit input[name="id_entita"]').val(val);
			$(this).closest('.h-box-wrapper').box('close');
		}
	});
	
	$('body').on('click', '.h-action-seleziona-risorsa-banner-collezione', function() {
		var check = $(this).closest('form').find('.h-checkbox-checked');
		if (check.length == 0) {
			$('body').message({message: 'Selezionare una voce dall\'elenco', type: 'error'});
		}
		else {
			var tr = check.closest('tr');
			var val = tr.attr('data-id');
			var nome = '#' + val + ' - ' + tr.find('td .h-list-cell-auto').text();
			
			$('#banner_edit .h-action-seleziona-risorsa-dettaglio').html(nome);
			$('#banner_edit input[name="id_entita"]').val(val);
			$(this).closest('.h-box-wrapper').box('close');
		}
	});
	
	$('body').on('click', '.h-action-seleziona-risorsa-banner-select', function() {
		var input = $(this).closest('form').find('select[name="id_item"]');
		var val = input.val();
		if (val == '') {
			$('body').message({message: 'Selezionare una voce dall\'elenco', type: 'error'});
		}
		else {
			var nome = input.find('option:selected').text();
			$('#banner_edit .h-action-seleziona-risorsa-dettaglio').html(nome);
			$('#banner_edit input[name="id_entita"]').val(val);
			$(this).closest('.h-box-wrapper').box('close');
		}
	});
	
	$('body').on('change', '.h-action-seleziona-risorsa-elenco', function() {
		var cont = $(this).closest('[data-tipo-risorsa-selected]');
		
		cont.find('.h-action-seleziona-risorsa-dettaglio').html('');
		cont.attr('data-tipo-risorsa-selected', $(this).val());
		if ($(this).val() == 1000) {
			cont.find('input').val('/');
		}
		else {
			cont.find('input').val('');
		}
	});
	
	$('body').on('click', '.h-miniwin-close', function() {
		$(this).closest('.h-miniwin').fadeOut(function() {
			$(this).remove();
		});
	});
	
	$('body').on('click', '.h-action-seleziona-risorsa', function() {
		var tipo = parseInt($(this).attr('data-tipo-risorsa'));
		var height = 250;
		switch(tipo) {
		case 1:
			height = 300;
			var url = 'articolo';
			break;
		case 2:
			var url = 'azienda';
			break;
		case 3:
			height = 550;
			var url = 'collezione';
			break;
		case 4:
			var url = 'pagina';
			break;
		case 6:
			height = 300;
			var url = 'blog';
			break;
		case 8:
			height = 300;
			var url = 'evento-news';
			break;
		case 7:
			var url = 'file';
			break;
		}
		
		$.fn.window({
			type: 'layer',
			url: '/manager/myarea/banner/seleziona-' + url,
			overlay: true,
			height: height,
			width: 500
		});
	});
	
	$('body').on('click', '.action-accedi-come-account', function() {
		$('body').loading();
		var opt = $(this).actionParams();
		location.href = opt.url + '?id=' + opt.id;
	});
	
	$('body').on('click', '.h-action-cookie-item-delete', function() {
		var cont = $(this).closest('.list-cookie-item');
		var layer = $(this).closest('.h-layout-content');
		var prefix = cont.find('[name="_cookie"]').val();
		layer.find('.list-descrizione-cookie [data-cookie="' + prefix + '"]').remove();
		cont.remove();
	});

	function add_cookie_item(prefix, win) {
		var cont = win.find('.list-cookie');
		var cookie = $([
				'<div class="list-cookie-item">',
					'<input type="hidden" name="_cookie" class="cookie-prefix" value="', prefix, '">',
					'<div class="list-cookie-item-fields">',
						'<input type="text" class="cookie-campo-chiave valida-required" name="', prefix, '_chiave" value="" placeholder="Nome/chiave">',
						'<select class="cookie-campo-tipo valida-required" name="', prefix, '_tipo" placeholder="Tipo">',
							'<option value="">- Tipo -</option>',
							'<option value="http">HTTP</option>',
							'<option value="html">HTML</option>',
							'<option value="pixel">Pixel</option>',
						'</select>',
						'<input class="cookie-campo-scadenza" class="valida-required" type="text" name="', prefix, '_scadenza" value="" placeholder="Scadenza">',
						'<img class="h-action-cookie-item-delete list-cookie-item-delete" src="/assets/manager/havana-js/img/icon/ico-close.svg">',
					'</div>',
					'<div class="list-cookie-item-fields-descrizione"><label>Descrizione</label><textarea name="', prefix, '_descrizione_it" class="cookie-campo-descrizione"></textarea></div>',
				'</div>'
			].join(''));
		cont.prepend(cookie);
		
		cookie.find('.cookie-campo-chiave').on('keyup', function() {
			var val = $(this).val();
			win.find('.list-descrizione-cookie [data-cookie="' + prefix + '"] strong').html(val);
		});

		win.find('.list-descrizione-cookie').each(function() {
			var lang = $(this).closest('[data-tab]').data('tab');
			$(this).prepend([
				'<div class="list-cookie-item-descrizione" data-cookie="', prefix,'">',
					'<div class="field-line field-line-textarea field-400">',
						'<label>Descrizione cookie <strong>[chiave non definita]</strong>:</label>',
						'<textarea name="', prefix, '_descrizione_', lang, '" class="field"></textarea>',
					'</div>',	
				'</div>'
			].join(''));
		});
		
		return cookie;
	}
	
	$('body').on('click', '.h-action-add-cookie', function() {
		add_cookie_item(H.id(), $(this).closest('.h-layout-content'));
	});
	
	$('body').on('cookie_policy:load', function(e, win) {
		var list = win.find('.list-cookie');
		var data = list.html();
		list.html('');
		if (data) {
			var obj = $.parseJSON(data);
			if (obj) {
				$.each(obj.list, function(i, item) {
					var cookie = add_cookie_item(item.id, win);
					cookie.find('.cookie-campo-chiave').val(item.chiave);
					cookie.find('.cookie-campo-tipo').val(item.tipo);
					cookie.find('.cookie-campo-scadenza').val(item.scadenza);
					cookie.find('.cookie-campo-descrizione').val(item.descrizione['it']);
					
					win.find('.list-descrizione-cookie [data-cookie="' + item.id + '"]').each(function() {
						var lang = $(this).closest('[data-tab]').data('tab');
						$(this).find('strong').html(item.chiave);
						var descrizione = item.descrizione[lang] ? item.descrizione[lang] : '';
						$(this).find('textarea').html(descrizione);
					});
				});	
			}
		}
	});
	
	$('body').on('click', '.elimina-scatta-foto', function() {
		var form = $(this).closest('.elabora-foto-wrapper');
		form.find('.field-file').val('');
		form.find('.field-file-name').val('');
		form.find('.anteprima-scatta-foto img').attr('src', '/assets/void_image.jpg');
	});
	$('body').on('change', '.h-action-aggiorna-on-change', function() {
		var form = $(this).closest('form');
		form.find('[name="' + $(this).data('field-on-change') + '"]').val($(this).find('option:selected').attr('data-valore'));
	});
	
	$('body').on('click', '.ruota-scatta-foto', function() {
		var form = $(this).closest('.elabora-foto-wrapper');

		var img = form.find('.field-file').val();
		if (img == '') {
			img = form.find('.field-file-name').val();
		}
		if (img) {
			if (img.indexOf('void_image') >= 0) {
				return;
			}
			img = img.split('.');
			if (img.length < 2) {
				return;
			}
			img = img[img.length - 2] + '.' + img[img.length - 1];
			H.ajax('/manager/myarea/rotate-image', {
				data: {
					file: img
				},
				success: function (data) {
					if (data && data.data) {
						form.find('.anteprima-scatta-foto img').attr('src' , '/temp/160x120/' + data.data.file_temp);
						form.find('.field-file').val(data.data.file_temp);
						form.find('.field-file-name').val(data.data.file_name);
					}
				}
			});
		}
	});
	
	$('body').on('click', '.action-ordina-articolo-a-fornitore', function() {
		var params = $(this).actionParams();
		var cont = $(this).closest('tr');
		if (cont.hasClass('row-articolo-ordine')) {
			params.ordine_id = cont.attr('data-ordine-id');
			params.articolo_id = cont.attr('data-articolo-id');
			params.articolo_tmp_id = cont.attr('data-articolo-tmp-id');
		}
		else {
			params.articolo_id = cont.attr('data-id');
		}
		
		$.fn.window({
			type: 'layer',
			overlay: true,
			width: 500,
			height: 400,
			url: '/manager/myarea/fornitore/edit-articolo-fornitore',
			params: params
		});
	});
	
	$('body').on('checkbox-checked', '.wrapper-seleziona-tutto-template .h-checkbox[data-type-check-all]', function() {
		var is_checked = !$(this).hasClass('h-checkbox-checked');
		$('.seleziona-tutto-template-list [data-type-check="' + $(this).data('type-check-all') + '"]').each(function() {
			if (is_checked) {
				$(this).find('.h-checkbox').removeClass('h-checkbox-checked');
				$(this).find('input').val('');
			}
			else {
				$(this).find('.h-checkbox').addClass('h-checkbox-checked');
				$(this).find('input').val('1');
			}
		});
	});
	
	function check_session() {
		H.ajax('/manager/check-session', {
			success: function(data) {
				if (data && data.data && 
					data.data.session_fault == 'session_fault') {
					location.href = '/manager/index';
					return;
				}
				setTimeout(check_session, 60*1000);
			},
			failure: function() {
				setTimeout(check_session, 10*1000);
			}
		});
	}
	setTimeout(check_session, 60*1000);
});