$(function(){
	var _current_step = 1;
	
	function floatValue(val) {
		if (val == null || val == '') {
			return '';
		}
		var check = '1234567890';
		var part = ('' + val).split('');
		val = '';
		for (var i = 0; i < part.length; i++) {
			if (check.indexOf(part[i]) >= 0) {
				val += part[i];
			}
			else {
				if (part[i] == ',') {
					val += '.';
				}
			}
		}
		return val;
	}
	
	function loadFloatValue(selector) {
		var val = $(selector).text();
		if (val == null) {
			return '';
		}
		
		return floatValue(val);
	}
	function googleAnalyticsTrack(codice) {
		if (ga) {
			ga('ecommerce:addTransaction', {
				'id': codice,
				'revenue': loadFloatValue('.riepilogo-dati-carrello .label-total')
			});
			$('.riepilogo-item-carrello .item-carrello').each(function() {
				var name = $(this).find('.item-buy-title').text();
				var qta = $(this).find('.item-buy-qta').text();
				var price = $(this).find('.item-buy-price').text();
				var sku = $(this).attr('data-id');
				ga('ecommerce:addItem', {
					'id': codice,
					'name': name,
					'sku': '' + sku,
					'price': '' + floatValue(price),
					'quantity': '' + qta
				});
			});
			ga('ecommerce:send');
		}
	}
	
	var C = {
		alert: {
			form: function(form) {
				form.removeClass('form-loading');
				form.find('.form-error-message').html(Label['campi_con_errore']);
				form.addClass('form-error');
				C.alert.error(Label['campi_con_errore']);
			},
			error: function(message) {
				message = message == null ? Label['errore_interno'] : message;
				Loading.hide();
				$('body').message({message: message, type: 'error'});
			},
			serverError: function() {
				C.alert.error(Label['errore_interno']);			
			},
		},
		loadNext: function(data, success, form) {
			Loading.show();
			if (data == null) {
				data = {};
			}
			data._lang = Params.url_lang;
			$.xajax('/cartprev/checkout/block/ex-checkout-' + _current_step + '.php', {
				data: data,
				success: function(data) {
					if (data.success) {
						if (data.esenzione) {
							Utility.alert(Label['descr_cambio_nazione']);
							_current_step = 3;
							C.load(_current_step);
						}
						else {
							if (success == null) {
								C.load(_current_step + 1);
							}
							else {
								success(data);
							}
						}
					}
					else {
						if (data.fields_errors && form) {
							form.addClass('form-error');
							var fields = data.fields_errors;
							for (var key in fields) {
								if (fields.hasOwnProperty(key)) {
									var field = form.find('input[name=' + key + ']');
									var wrapper = field.closest('.field-line');
									var text = wrapper.find('.error-text');
									if (text) {
										text.remove();
									}
									wrapper.addClass('field-error');
									wrapper.append('<span class="error-text">' + fields[key] + '</span>');
								}
							}
						}
						if (data.go_to != null) {
							C.load(data.go_to);
						}
						C.alert.error(data.message);
					}
				},
				error: function() {	
					C.alert.serverError();
				}
			});			
		},
		load: function(page) {
			if (page == null || page == '') {
				page = _current_step;
			}
			else {
				page = parseInt(page);
			}

			Loading.show();
			$('#checkout_preventivo').load('/cartprev/checkout/block/checkout-' + page + '.php', {page: page, _lang: Params.url_lang},function(data) {
					page = parseInt($('.checkout-main').attr('data-page'));
					$('.checkout-nav a').removeClass('ok').removeClass('current');
					if ($('#checkout_preventivo').find('.void-cart').length == 0) {
						for (var i = 1; i < page; i++) {
							$('.checkout-nav [data-step=' + i + ']').addClass('ok');
						}
						$('.checkout-nav [data-step=' + page + ']').addClass('current');	
					}					
					$('body').trigger('checkout-loaded', [page]);
					$('body').trigger('data-loaded', [$('#checkout_preventivo')]);
					$('html, body').animate({scrollTop:Website.checkout_scroll_top}, 200);
					Loading.hide();
					_current_step = page;
				});		
		}
	};
	
	function setCheckbox(checkbox, url, message) {
		if (checkbox.hasClass('checkbox-checked')) {
			checkbox.closest('.ck-checkbox-button').addClass('ck-checkbox-button-selected');
			Loading.show();
			$.xajax('/cartprev/checkout/block/' + url, {
				data: {
					tipo: checkbox.attr('data-value'),
					_lang: Params.url_lang
				},
				success: function() {
					$('body').message(message);
					C.load();
				},
				error: function() {
					C.alert.serverError();
				}
			});
		}
		else {
			checkbox.closest('.ck-checkbox-button').removeClass('ck-checkbox-button-selected');
		}	
	}
	
	$('body').on('click', '.btn-add-temp-image-to-item', function() {
		var item_id = $(this).closest('.ck-line-articolo').attr('data-id-virtuale');
		var anteprima_img = $(this).find('img');
		var id = 'upload_' + id + '_' + (new Date().getTime());
		var html = [
			'<form id="',id ,'" enctype="multipart/form-data" style="display: none;">',
			'<input name="file" type="file" />',
			'<input name="_lang" type="text" value="', Params.url_lang,'" />',
			'<input name="id" type="text" value="', item_id,'" />',
			'</form>'
		];	
		
		$('body').append(html.join(''));	
		var form = $('#' + id);
		var inputField = form.find('input[name=file]');

		Loading.show();
		inputField.fileupload({
			url: '/cartprev/checkout/block/upload-image',
			dataType: 'json',
			add: function (e, data) {
				var valido = true;
				var fileName = inputField.val();
				var fileType = ['jpg', 'jpeg', 'png', 'gif'];
				var i = fileName.lastIndexOf('.');
				if (i > 0) {
					var estensione = fileName.substr(i+1).toLowerCase();
					var trovato = false;
					for (var i = 0; i < fileType.length && !trovato; i++) {
						if (fileType[i] == estensione) {
							trovato = true;
						}
					}
					if (!trovato) {
						C.alert.error('Inserire un formato valido: ' + fileType.join(', '));
					}
				}
				else {
					valido = false;
				}

				if (valido) {						
					data.submit();
				}
				else {
					data.abort();
				}
			},      
			start: function (e) {
			}, 			
			fail: function (e) {
				Loading.hide();
				form.remove();
				
				C.alert.error('ERRORE: errore nel caricamento del file, impossibile procedere');
			}, 
			done: function (e, data) {
				Loading.hide();
				data = data.result;	
				
				form.remove();				
				if (data.success) {
					anteprima_img.attr('src', data.image);
				}
				else {
					if (data.message == null) {
						C.alert.error('ERRORE: File troppo grande, massimo consentito 100MB');
					}
					else {
						C.alert.error('ERRORE: ' + data.message);
					}
				}

			},
			progressall: function (e, data) {

			}
		});
		
		inputField.click();	
	});
	
	$('body').on('checkbox-change', '.checkbox-spedizione-uguale-fatturazione', function(e, checkbox) {
		function reset() {
			$('.checkout-dati-fatturazione-fields .field-uguale input, .checkout-dati-fatturazione-fields .field-uguale select').each(function() {
				$(this).val('');
				$(this).removeClass('sel');
				$(this).closest('.keypress').removeClass('keypress');
			});		
		}
		if (checkbox.hasClass('checkbox-checked')) {
			$('.checkout-dati-fatturazione-fields .field-uguale').fadeOut(function() {
				reset();
			});
		}
		else {
			reset();
			$('.checkout-dati-fatturazione-fields .field-uguale').fadeIn();
		}	
	});
	
	$('body').on('checkbox-change', '.checkbox-fatturazione', function(e, checkbox) {
		function reset() {
			$('.checkout-dati-fatturazione-fields input, .checkout-dati-fatturazione-fields select').each(function() {
				$(this).val('');
				$(this).removeClass('sel');
				$(this).closest('.keypress').removeClass('keypress');
			});
			if ($('.checkbox-spedizione-uguale-fatturazione').hasClass('checkbox-checked')) {
				$('.checkbox-spedizione-uguale-fatturazione').click();
			}
		}
		if (checkbox.hasClass('checkbox-checked')) {
			reset();
			$('.checkout-dati-fatturazione-fields').fadeIn();
			$('.field-hide-if-fattura').fadeOut();
		}
		else {
			$('.field-hide-if-fattura').fadeIn();
			$('.checkout-dati-fatturazione-fields').fadeOut(function() {
				reset();
			});
		}
	});
	
	$('body').on('click', '.checkout-nav .ok', function() {
		C.load($(this).attr('data-step'));
	});
	
	$('body').on('click', '.action-add-articolo-virtuale', function() {
		Loading.show();
		$.xajax(Const.addArticoloVirtualePreventivoUrl, {
			success: function(data) {
				if (data.success) {
					$('body').message(Label['to_add_articolo_aggiunto']);
					C.load();				
				}
				else {
					C.alert.error(data.message);
				}
			},
			error: function() {	
				C.alert.serverError();
			}
		});
	});	
	
	$('body').on('click', '.action-vuota-carrello', function() {
		if (Utility.confirm(Label['svuotare_preventivo'])) {
			Loading.show();
			$.xajax(Const.resetCartPreventivoUrl, {
				success: function(data) {
					if (data.success) {
						location.href = '/';
					}
					else {
						C.alert.error(data.message);
					}
				},
				error: function() {	
					C.alert.serverError();
				}
			});
		}
	});
	
	$('body').on('click', '.action-elimina', function() {
		if (Utility.confirm(Label['eliminare_articolo'])) {
			Loading.show();	
			var item_id = $(this).attr('data-id');
			var url_load = $(this).attr('data-load-url');
			$.xajax(Const.removeFromCartPreventivoUrl, {
				data: {
					id: item_id
				},
				success: function(data) {
					if (data.success) {
						$('body').message(Label['articolo_eliminato']);
						if (url_load) {
							location.href = url_load;
						}
						else {
							C.load();
						}
					}
					else {
						C.alert.error(data.message);
						if (data.force_reload) {
							if (url_load) {
								location.href = url_load;
							}
							else {
								C.load();
							}
						}
					}
				},
				error: function() {	
					C.alert.serverError();
				}		
			});	
		}
	});	
	
	$('body').on('click', '.action-submit-3', function() {
		var formToValidate = ['.checkout-dati-spedizione'];
		if ($('.checkbox-fatturazione').hasClass('checkbox-checked') &&
			!$('.checkbox-spedizione-uguale-fatturazione').hasClass('checkbox-checked')) {
			formToValidate.push('.checkout-dati-fatturazione .field-uguale');
		}
		var error = false;
		for (var i = 0; i < formToValidate.length; i++) {
			if (!Validator.checkIsValidForm($(formToValidate[i]))) {
				error = true;
			}
		}
		if (error) {
			C.alert.form($('#form-dati'));
			C.alert.error(Label['campi_con_errore']);
		}
		else {
			if (!$('.checkbox-termini-condizioni').hasClass('checkbox-checked')) {
				C.alert.error(Label['per_procedere_accettare_termini']);
				return;
			}

			C.loadNext($('#form-dati').serializeObject(), function(data) {
				if (data.success) {
					try {
						googleAnalyticsTrack(data.codice);
					}
					catch(e){}

					location.href =  '/cartprev/thanks?_lang=' + Params.url_lang + '&id=' + data.id;					
				}
				else {
					C.alert.error(data.message);
				}

			});
		}
	});
	
	$('body').on('click', '.action-submit-2-thanks', function() {
		_current_step = 3;
		C.loadNext({}, function(data) {
			if (data.success) {
				try {
					googleAnalyticsTrack(data.codice);
				}
				catch(e){}

				location.href =  '/cartprev/thanks?_lang=' + Params.url_lang + '&id=' + data.id;					
			}
			else {
				C.alert.error(data.message);
			}

		});
	});
	
	$('body').on('click', '.action-submit-2, .action-aggiorna-virtuale', function() {
		Loading.show();
		var error_msg = null;
		var list_item_id = [];
		var list_qta = [];
		var list_virtuale = {};
		$('[data-id-virtuale]').each(function() {
			if (error_msg != null) {
				return;
			}
			var elem = {
				nome: $(this).find('[name="nome"]').val(),
				note: $(this).find('[name="note"]').val(),
				prezzo: $(this).find('[name="prezzo"]').val(),
				iva: $(this).find('[name="iva"]').val(),
				qta: $(this).find('[name="quantita"]').val()
			};
			if (elem.qta == '' || parseInt(elem.qta) <= 0) {
				error_msg = Label['articolo_virtuale_quantita_vuoto'];
				return;
			}
			if (elem.prezzo == '') {
				error_msg = Label['articolo_virtuale_prezzo_vuoto'];
				return;
			}
			if (elem.nome == '') {
				error_msg = Label['articolo_virtuale_nome_vuoto'];
				return;
			}
			if (elem.iva == '') {
				error_msg = Label['articolo_virtuale_iva_vuoto'];
				return;
			}
			
			list_virtuale[$(this).attr('data-id-virtuale')] = elem;
		});
		if (error_msg) {
			Loading.hide();
			$('body').message({message: error_msg, type: 'error'});
			return;
		}
		
		var error = false;
		$('.action-aggiorna').each(function() {
			if (error) {
				return;
			}
			var item_id = $(this).attr('data-id');
			var qta = $(this).parent().find('input').val();
			if (qta == '' || parseInt(qta) <= 0) {
				error = true;
			}
			list_item_id.push(item_id);
			list_qta.push(qta);
		});
		if (error) {
			Loading.hide();
			$('body').message({message: Label['quantita_maggiore_zero'], type: 'error'});
			return;
		}
		var aggiorna_virtuale = $(this).hasClass('action-aggiorna-virtuale');
		$.xajax(Const.updateItemFromCartPreventivoUrl, {
			data: {
				list_virtuale: JSON.stringify(list_virtuale),
				id: list_item_id.join(','),
				qta: list_qta.join(',')
			},
			success: function(data) {
				if (data.success) {
					if (aggiorna_virtuale) {
						C.load();
					}
					else {
						C.loadNext();
					}
				}
				else {
					C.alert.error(data.message);
				}
			},
			error: function() {
				C.alert.serverError();
			}
		});
	});
	
	function add_rem_qta_1_item($this, to_add, url_load) {
		Loading.show();	
		var item_id = $this.attr('data-id');
		var qta = $this.parent().find('input').val();
		qta = parseInt(qta);
		if (isNaN(qta)) {
			qta = 1;
		}
		qta += to_add;
		
		update_qta_item(item_id, qta, url_load);
	}
	
	function update_qta_item(item_id, qta, url_load) {
		if (qta == 0) {
			if (Utility.confirm(Label['eliminare_articolo'])) {
				Loading.show();	
				$.xajax(Const.removeFromCartPreventivoUrl, {
					data: {
						id: item_id
					},
					success: function(data) {
						if (data.success) {
							$('body').message(Label['articolo_eliminato']);
							if (url_load) {
								location.href = url_load;
							}
							else {
								C.load();
							}
						}
						else {
							C.alert.error(data.message);
							if (data.force_reload) {
								if (url_load) {
									location.href = url_load;
								}
								else {
									C.load();
								}
							}
						}
					},
					error: function() {	
						C.alert.serverError();
					}		
				});	
			}
			else {
				Loading.hide();	
			}
		}
		else {
			$.xajax(Const.updateItemFromCartPreventivoUrl, {
				data: {
					id: item_id,
					qta: qta
				},
				success: function(data) {
					if (data.success) {
						$('body').message(Label['quantita_aggiornata']);
						if (url_load) {
							location.href = url_load;
						}
						else {
							C.load();
						}
					}
					else {
						C.alert.error(data.message);
						if (data.force_reload) {
							if (url_load) {
								location.href = url_load;
							}
							else {
								C.load();
							}
						}
					}
				},
				error: function() {
					C.alert.serverError();
				}
			});		
		}
	}
	
	$('body').on('click', '.action-add-qta-1', function() {
		add_rem_qta_1_item($(this), 1, $(this).attr('data-load-url'));
	});
	$('body').on('click', '.action-rem-qta-1', function() {
		add_rem_qta_1_item($(this), -1, $(this).attr('data-load-url'));
	});
	
	$('body').on('click', '.action-aggiorna', function() {
		var item_id = $(this).attr('data-id');
		var qta = $(this).parent().find('input').val();
		qta = parseInt(qta);
		if (isNaN(qta)) {
			qta = 1;
		}
		update_qta_item(item_id, qta, $(this).attr('data-load-url'));
	});
	
	$('body').on('click', '.riepilogo-cart .header', function() {
		var $this = $(this);
		$this.next().animate({
			height: 'toggle'
		}, function() {
			if ($this.hasClass('show')) {
				$this.removeClass('show');			
			}
			else {
				$this.addClass('show');
			}		
		});
	});
	$('body').on('click', '.action-page', function() {
		C.load($(this).attr('data-page'));
	});
	$('body').on('click', '.action-prev-page', function() {
		C.load(_current_step - 1);
	});
	$('body').on('click', '.action-next-page', function() {
		var opt = $(this).actionParams();
		var form = $(this).closest('form');
		
		if (Validator.checkIsValidForm(form)) {
			if (opt != null && opt.params) {
				for (var i = 0; i < opt.params.length; i++) {
					form.append('<input type="hidden" name="' + opt.params[i].key + '" value="' + opt.params[i].value + '">');
				}
			}
			C.loadNext(form.serializeObject());
		}
		else {
			C.alert.form(form);
		}
	});
	
	function window_seleziona_dati(type, inserisci) {
		var html = [
			'<div class="window-layer window-layer-base" style="display: none;">',
				'<div class="window-layer-content">',
					'<div class="window-layer-title">',
						Label['seleziona_' + type],
					'</div>',
				'</div>',
				'<div class="window-layer-toolbar">',
					'<a>', Label['btn_chiudi'],'</a>',
				'</div>',
			'</div>'
		];
		var cont = $(html.join(''));
		$('.item-' + type).each(function() {
			var elem = $(this).clone();
			elem.find('span').each(function() {
				if ($(this).html() == '') {
					$(this).remove();
				}
			});
			elem.find('div').each(function() {
				if ($(this).find('span').length == 0) {
					$(this).remove();
				}
			});
			cont.find('.window-layer-content').append(elem);
		});
		var btnChiudi = cont.find('.window-layer-toolbar a');
		cont.find('.window-layer-content [data-id]').on('click', function() {
			inserisci($(this).attr('data-id'), $(this).attr('data-id-nazione'));
			btnChiudi.trigger('click');			
		});
		btnChiudi.on('click', function() {
				$('body').removeClass('window-layer-overlay');
				cont.fadeOut(350, function() {
					cont.remove();
				});
			});
		$('body').addClass('window-layer-overlay');
		$('body').append(cont);
		cont.fadeIn(300);
		
		var top = '50%';
		var left = '50%';
		var marginLeft = -200;
		var marginTop = -250;
		var width = 400;
		var height = 500;
		if ($(window).width() <= width) {
			marginLeft = 0;
			left = 0;
			width = $(window).width();
		}
		if ($(window).height() <= height) {
			top = 0;
			marginTop = 0;
			height = $(window).height();
		}
		
		cont.css({width: width + 'px', height: height + 'px', top: top, left: left, marginLeft: marginLeft + 'px', marginTop: marginTop + 'px'});
	}
	
	$('body').on('click', '.action-fatturazione-predefinita', function() {
		var form = $(this).closest('form');

		function inserisci(id) {
			$('.item-fattura[data-id=' + id + '] span').each(function() {
				var input = form.find('[name=' + $(this).attr('data-name') + ']');
				if (input.length > 0) {
					var val = $(this).text();
					input.val(val);
					if (val != '') {
						input.closest('.field').addClass('keypress');
					}
				}
			});	
		}
		
		window_seleziona_dati('fattura', inserisci);
	});	
	
	$('body').on('checkout-reload-page', function() {
		C.load();
	});
	var page = $('#checkout_preventivo').attr('data-current-block');
	if (page == null || page == '') {
		page = 1;
	}
	C.load(page);

	$('body').on('click', '.tab-title', function() {
		var $this = $(this);
		if ($this.parent().hasClass('tab-selected')) {
			return;
		}
		var selected = $('#checkout_preventivo').find('.tab-selected');
		selected.removeClass('tab-selected');
		$this.parent().addClass('tab-selected');
	});
});