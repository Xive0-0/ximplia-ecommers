$(function(){
	var list_items = [];
	var data = [];
	
	function reload() {
		var loading = $('.h-layout-content-etichetta').loading();
		var listId = [];
		for (var i = 0; i < list_items.length; i++) {
			listId.push(list_items[i].id);
		}
		$('.h-layout-content-etichetta').load($('.h-layout-content-etichetta').attr('data-url'), {id: listId.join(',')}, function() {
			loading.loading(false);
			ricalcola();
		});
	}
	
	function ricalcola() {
		data = [];
		for (var i = 0; i < list_items.length; i++) {
			var cont = $('.h-layout-content-etichetta tr[data-id=' + list_items[i].id + ']');
			cont.find('.numero').html(list_items[i].numero);
			cont.find('.quantita').html(list_items[i].qta);
			cont.find('.fornitore').html(list_items[i].fornitore);
			data.push(list_items[i].id + '#_v_#' + list_items[i].numero + '#_v_#' + list_items[i].qta + '#_v_#' + list_items[i].fornitore);
		}
	}
	
	function azzera() {
		var cont = $('.etichetta-find-articolo');
		cont.find('input').val('');
		cont.find('input[name=numero]').val('1');
		cont.find('input[name=quantita]').val('1');
		cont.find('input[name=nome]').focus();
		cont.find('.autocomplete-content-value').html('');	
	}
	
	$('body').on('click', '.stampa-etichette', function () {
		var url = $(this).attr('data-url');
		if (list_items.length == 0) {
			$('body').message({message: 'inserire almeno un prodotto', type: 'error'});
			return;
		}
		H.alert({
			message: 'Procedere con la generazione delle etichette?',
			closeBtn: 'Annulla',
			buttons: [
				{
					text: 'Procedi', 
					close: true, 
					color: 'blu', 
					action: function(box) {
						ricalcola();
						var form = $('<form style="display: none;" action="' + url + '" method="post" target="_blank"/>');
						var input = $('<input name="data" type="text"/>');
						input.val(data.join(','));
						form.append(input);
						$('body').append(form);
						form.submit();
					}
				}
			]
		});	
	});
	
	$('body').on('click', '.elimina-articolo-etichetta', function() {
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
								$this.closest('tr').remove();
							}
						}
					]
				});
				return;
			}
		}
	});
	
	function aggiungiArticoloQuantita(id, numero, quantita, fornitore) {
		numero = parseInt(numero);
		quantita = parseInt(quantita);
		$('body').message({message: 'articolo aggiunto'});
		
		var trovato = false;
		for (var i = 0; i < list_items.length && !trovato; i++) {
			if (list_items[i].id == id) {
				trovato = true;
				list_items[i].numero += numero;
			}
		}
		if (!trovato) {
			list_items.push({
				id: id,
				numero: numero,
				qta: quantita,
				fornitore: fornitore
			});
		}
		
		reload();
		azzera();	
	}
	
	$('body').on('click', '.aggiungi-articolo-etichetta', function() {
		var closest = $(this).closest('.etichetta-find-articolo');
		var numero = closest.find('input[name=numero]').val();
		var id = closest.find('input[name=id]').val();
		if (id == '') {
			$('body').message({message: 'selezionare un articolo', type: 'error'});
			return;
		}
		if (numero <= 0) {
			$('body').message({message: 'il numero di etichette deve essere almeno 1', type: 'error'});
			return;
		}
		var quantita = closest.find('input[name=quantita]').val();
		if (quantita == null || quantita == '') {
			quantita = 1;
		}
		aggiungiArticoloQuantita(id, numero, quantita, closest.find('input[name=fornitore]').val());
	});
	
	$('body').on('click', '.azzera-filtro-etichetta', function() {
		list_items = [];
		data = [];
		azzera();
		reload();
	});	
});