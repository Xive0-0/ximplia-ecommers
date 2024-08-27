$(function(){
	var list_items = [];
	var data = {};
	
	function format_float(prezzo){
		prezzo = prezzo.replace(/\./gi, '');
		return parseFloat(prezzo.replace(/,/gi, '.'));
	}
	
	function format_euro(n){
		var d = ',';
		var t = '.';
		var c = 2; 
		var d = d == undefined ? "." : d, 
		t = t == undefined ? "," : t, 
		s = n < 0 ? "-" : "", 
		i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
		j = (j = i.length) > 3 ? j % 3 : 0;
		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	}
	
	function ricalcola() {
		var totale_ordine = 0;
		data = {
			items: [],
			intestazione: ''
		};
		for (var i = 0; i < list_items.length; i++) {
			var cont = $('.h-layout-content-cassa tr[data-id=' + list_items[i].id + ']');
			var sconto = cont.find('.sconto-originale').html();
			if (sconto == null || sconto == '') {
				sconto = 0;
			}
			if (list_items[i].sconto >= 0) {
				sconto = list_items[i].sconto;
			}
			sconto = parseInt(sconto);

			var prezzo = cont.find('.prezzo');
			if (prezzo.prop('tagName').toLowerCase() == 'input') {
				prezzo = prezzo.val();
			}
			else {
				prezzo = prezzo.html();
			}
			var nome = cont.find('.nome');
			if (nome.prop('tagName').toLowerCase() == 'input') {
				nome = nome.val();
			}
			else {
				nome = nome.html();
			}
			prezzo = format_float(prezzo);
			var prezzo_originale = format_euro(prezzo);
			var totale = prezzo * list_items[i].qta;
			totale = totale - totale * (sconto / 100);
			totale_ordine += totale;
			prezzo = format_euro(prezzo - prezzo * (sconto / 100));
			totale = format_euro(totale);
			data.items.push({
				id: list_items[i].id,
				codice: H.Utility.trim(cont.find('.codice').html()),
				nome: H.Utility.trim(nome),
				prezzo_originale: prezzo_originale,
				prezzo: prezzo,
				sconto: sconto,
				qta: list_items[i].qta,
				totale: totale
			});
			
			cont.find('.sconto-originale').html(sconto);
			cont.find('.prezzo-unitario').html(prezzo);
			cont.find('.sconto').val(sconto);
			cont.find('.quantita').val(list_items[i].qta);
			
			cont.find('.totale').html(totale);
		}
		var sconto = $('.cassa .totale-sconto').val();
		if (sconto == null || sconto == '') {
			sconto = 0;
		}
		sconto = parseInt(sconto);
		totale_ordine_finale = format_euro(totale_ordine - totale_ordine * (sconto / 100));
		totale_ordine = format_euro(totale_ordine);
		data.intestazione = $('.cassa .line-intestazione-riepilogo input').val();
		data.sconto = sconto;
		data.totale_ordine = totale_ordine;
		data.totale_ordine_finale = totale_ordine_finale;
		$('.cassa .totale-sconto').html(sconto);
		$('.cassa .totale-ordine').html(totale_ordine);
		$('.cassa .totale-ordine-finale').html(totale_ordine_finale);
	}
	function aggiorna_sconto(id, sconto) {
		for (var i = 0; i < list_items.length; i++) {
			if (list_items[i].id == id) {
				list_items[i].sconto = sconto;
				return;
			}
		}
	}
	function aggiorna_quantita(id, qta) {
		for (var i = 0; i < list_items.length; i++) {
			if (list_items[i].id == id) {
				list_items[i].qta = qta;
				return;
			}
		}
	}
	$('body').on('click', '.stampa-cassa', function () {
		var url = $(this).attr('data-url');
		if (list_items.length == 0) {
			$('body').message({message: 'selezionare almeno un prodotto', type: 'error'});
			return;
		}
		H.alert({
			message: 'Stampare il documento di riepilogo?',
			closeBtn: 'Annulla',
			buttons: [
				{
					text: 'Procedi', 
					close: true, 
					color: 'blu', 
					action: function(box) {
						ricalcola();
						data = JSON.stringify(data);
						var form = $('<form style="display: none;" action="' + url + '" method="post" target="_blank"/>');
						var input = $('<input name="data" type="text"/>');
						input.val(data);
						form.append(input);
						$('body').append(form);
						form.submit();
						
						list_items = [];
						aggiornaCacheArticoli();
						azzera();
						reload();
					}
				}
			]
		});	
	});
	
	$('body').on('click', '.cancella-cassa', function () {
		H.alert({
			message: 'Resettare tutta la cassa?',
			closeBtn: 'Annulla',
			buttons: [
				{
					text: 'Procedi', 
					close: true, 
					color: 'blu', 
					action: function(box) {
						$('body').message({message: 'dati resettati'});
						list_items = [];
						aggiornaCacheArticoli();
						azzera();
						reload();
					}
				}
			]
		});
	});
	$('body').on('click', '.ricalcola-cassa', function () {
		$('body').message({message: 'dati aggiornati'});
		ricalcola();
	});	
	$('body').on('click', '.cassa input', function () {
	   $(this).select();
	});
	$('body').on('blur', '.cassa .totale-sconto', function() {
		ricalcola();
	});
	$('body').on('blur', '.cassa input.prezzo', function() {
		ricalcola();
	});
	$('body').on('blur', '.h-layout-content-cassa input.quantita', function() {
		aggiorna_quantita($(this).closest('tr').attr('data-id'), $(this).val());
		aggiornaCacheArticoli();
		ricalcola();
	});
	$('body').on('blur', '.h-layout-content-cassa input.sconto', function() {
		var sconto = $(this).val();
		if (sconto == null || sconto == '') {
			sconto = 0;
		}
		aggiorna_sconto($(this).closest('tr').attr('data-id'), sconto);
		aggiornaCacheArticoli();
		ricalcola();
	});	
	
	function articolo_virtuale(item) {
		var html = [
				'<tr data-id="', item.id, '">',
				'	<td><img src="/assets/manager/havana-js/img/icon/ico-delete.svg" class="elimina-articolo-cassa" style="cursor: pointer;"></td>',
				'	<td class="codice"></td>',
				'	<td><img class="image image-articolo" src="/assets/void_image.png"></td>',
				'	<td>',
				'		<input type="text" value="', item.nome,'" maxlength="100" class="nome" style="width: 380px;">',				
				'	</td>',
				'	<td style="text-align: right; padding-right: 20px;">',
				'		<input type="text" class="valida-digiteuro prezzo" value="', format_euro(item.prezzo),'" maxlength="10" style="width: 80px;">',
				'	</td>',
				'	<td style="text-align: right; padding-right: 20px;">',
				'		<input type="text" class="valida-digitnumber sconto" value="', item.sconto,'" maxlength="2"> %',
				'	</td>',
				'	<td style="text-align: right; padding-right: 20px;"><input type="text" class="valida-digitnumber quantita" maxlength="3"></td>',
				'	<td style="text-align: right; padding-right: 20px; font-weight: bold;"><span class="valore totale">0,00</span> €</td>',
				'</tr>'		
			];
		html = html.join('');
		$('.h-layout-content-cassa table tbody').append(html);
	}
	
	function reload() {
		$('.h-layout-content-cassa').loading();
		var listId = [];
		var listVirtuale = [];
		for (var i = 0; i < list_items.length; i++) {
			if ((list_items[i].id + '').indexOf('temp_') < 0) {
				listId.push(list_items[i].id);
			}
			else {
				listVirtuale.push(list_items[i]);
			}
		}
		$('.h-layout-content-cassa').load($('.h-layout-content-cassa').attr('data-url'), {id: listId.join(',')}, function() {
			$('.h-layout-content-cassa').loading(false);
			for (var i = 0; i < listVirtuale.length; i++) {
				articolo_virtuale(listVirtuale[i]);
			}
			ricalcola();
		});
	}
	
	function azzera() {
		var cont = $('.cassa-find-articolo');
		cont.find('input').val('');
		cont.find('input[name=quantita]').val('1');
		cont.find('input[name=nome]').focus();
		cont.find('.autocomplete-content-value').html('');	
	}
	
	$('body').on('click', '.elimina-articolo-cassa', function() {
		var id = $(this).closest('tr').attr('data-id');
		var $this = $(this);
		for (var i = 0; i < list_items.length; i++) {
			if (list_items[i].id == id) {
				H.alert({
					message: 'Eliminare l\'articolo selezionato?',
					closeBtn: 'Annulla',
					buttons: [
						{
							text: 'Procedi', 
							close: true, 
							color: 'blu', 
							action: function(box) {
								list_items.splice(i, 1);
								$('body').message({message: 'articolo eliminato'});
								ricalcola();
								$this.closest('tr').remove();
								aggiornaCacheArticoli();
							}
						}
					]
				});
				return;
			}
		}
	});
	
	function aggiungiArticoloQuantita(id, quantita, nome) {
		quantita = parseInt(quantita);
		$('body').message({message: 'articolo aggiunto'});
		
		var trovato = false;
		for (var i = 0; i < list_items.length && !trovato; i++) {
			if (list_items[i].id == id) {
				trovato = true;
				list_items[i].qta += quantita;
			}
		}
		if (!trovato) {
			list_items.push({
				id: id,
				qta: quantita,
				sconto: -1,
				totale: -1,
				nome: (nome == null ? '' : nome),
				prezzo: 0
			});
		}
				
		aggiornaCacheArticoli();
		reload();
		azzera();	
	}
	
	$('body').on('cassa:load', function() {
		var tmp = H.cookie.get('_cassa');
		tmp = tmp.split(',');
		for (var i = 0; i < tmp.length; i++) {
			var elem = tmp[i].split('|');
			if (elem.length == 5 && elem[0]) {
				list_items.push({
					id: elem[0],
					qta: parseInt(elem[1]),
					sconto: elem[2],
					totale: -1,
					nome: elem[4],
					prezzo: parseFloat(elem[3])
				});			
			}
		}
		
		aggiornaCacheArticoli();
		reload();
		azzera();
	});
	
	function aggiornaCacheArticoli() {
		var tmp = [];
		for (var i = 0; i < list_items.length; i++) {
			tmp.push([
				list_items[i].id,
				list_items[i].qta,
				list_items[i].sconto,
				list_items[i].prezzo,
				list_items[i].nome,
			].join('|'));
		}
		tmp = tmp.join(',');
		H.cookie.set('_cassa', tmp);		
	}
	
	var _count_articolo_virtuale = 0;
	$('body').on('click', '.aggiungi-articolo-virtuale-cassa', function() {
		var id = 'temp_' + _count_articolo_virtuale;
		_count_articolo_virtuale++;
		aggiungiArticoloQuantita(id, 1, 'nuovo articolo');
	});

	$('body').on('click', '.ordina-fornitore-cassa', function() {
		var closest = $(this).closest('.cassa-find-articolo');
		var quantita = closest.find('input[name=quantita]').val();
		var id = closest.find('input[name=id]').val();
		if (id == '') {
			$('body').message({message: 'selezionare un articolo', type: 'error'});
			return;
		}

		$.fn.window({
			type: 'layer',
			overlay: true,
			width: 500,
			height: 400,
			url: '/manager/myarea/fornitore/edit-articolo-fornitore',
			params: {
				articolo_id: id
			}
		});
	});
	
	$('body').on('click', '.aggiungi-articolo-cassa', function() {
		var closest = $(this).closest('.cassa-find-articolo');
		var quantita = closest.find('input[name=quantita]').val();
		var id = closest.find('input[name=id]').val();
		if (id == '') {
			$('body').message({message: 'selezionare un articolo', type: 'error'});
			return;
		}
		if (quantita <= 0) {
			$('body').message({message: 'la quantità deve essere almeno 1', type: 'error'});
			return;
		}
		aggiungiArticoloQuantita(id, quantita);
	});
	
	$('body').on('click', '.azzera-filtro-cassa', function() {
		azzera();
	});	
	
	var _prima = true;
	$('body').on('keyup', '.aggiungi-articolo-cassa-codice', function() {
		if (_prima) {
			var opt = $(this).actionParams();
			_prima = false;
			$this = $(this);
			setTimeout(function() {
				_prima = true;
				var codice = $this.val();
				var loadingWin = $('body').loading();
				H.ajax(opt.url, {
					data: {
						codice: codice
					},
					success: function(data) {
						$this.val('');
						loadingWin.loading(false);
						if (data.success && data.id != null && data.id != '') {
							aggiungiArticoloQuantita(data.id, 1);
						}
						else {
							$('#cerca_autocomplete_fields').val(codice);
							$('#cerca_autocomplete_fields').keyup();
							$('body').message({message: 'Articolo non trovato', type: 'error'});
						}
					},
					failure: function() {
						loadingWin.loading(false);
						$('body').message({message: 'Errore caricamento dati', type: 'error'});
					}
				});
			}, 500);
		}
	});
});