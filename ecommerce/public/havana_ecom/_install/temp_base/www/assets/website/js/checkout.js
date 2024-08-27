var Checkout = null;
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
	
	var C = {
		updateCurrentStep: function(step) {
			_current_step = step;
		},
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
			}
		},
		loadNext: function(data, success, form) {
			Loading.show();
			if (data == null) {
				data = {};
			}
			data._lang = Params.url_lang;
			$.xajax(Params.url_prefix + '/cart/checkout/block/ex-checkout-' + _current_step + '.php', {
				data: data,
				success: function(data) {
					if (data.success) {
						if (data.event) {
							$('body').trigger('checkout-' + data.event, [data, _current_step]);
						}
						else if (data.esenzione) {
							Utility.alert(Label['descr_cambio_nazione']);
							_current_step = 3;
							C.load(_current_step);
						}
						else {
							if (data.ga4 && data.ga4.shipping) {
								gtag('event', 'add_shipping_info', {
										currency: 'EUR',
										ecommerce: {
											shipping_tier: data.ga4.shipping,
											items: data.ga4.items
										}
									});
							}
							if (success == null) {
								if (data.go_to) {
									C.load(data.go_to);
								}
								else {
									C.load(_current_step + 1);
								}
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
						else {
							if (typeof window['grecaptcha'] !== 'undefined') {
								var recaptcha = $('.g-recaptcha');
								if (recaptcha.length > 0) {
									recaptcha.each(function() {
										grecaptcha.reset();
									});
								}
							}
						}
						C.alert.error(data.message);
					}
				},
				error: function() {	
					if (typeof window['grecaptcha'] !== 'undefined') {
						var recaptcha = $('.g-recaptcha');
						if (recaptcha.length > 0) {
							recaptcha.each(function() {
								grecaptcha.reset();
							});
						}
					}

					C.alert.serverError();
				}
			});			
		},
		load: function(page, ga4) {
			if (page == null || page == '') {
				page = _current_step;
			}
			else {
				page = parseInt(page);
			}

			Loading.show();
			$('#checkout').load(Params.url_prefix + '/cart/checkout/block/checkout-' + page + '.php', {page: page, _lang: Params.url_lang},function(data) {
					page = parseInt($('.checkout-main').attr('data-page'));
					$('.checkout-nav a').removeClass('ok').removeClass('current');
					if ($('#checkout').find('.void-cart').length == 0) {
						for (var i = 1; i < page; i++) {
							$('.checkout-nav [data-step=' + i + ']').addClass('ok');
						}
						$('.checkout-nav [data-step=' + page + ']').addClass('current');	
					}
					
					$('body').trigger('checkout-loaded', [page]);
					$('body').trigger('data-loaded', [$('#checkout')]);

					if ($('.checkout-main[data-page="3"]').length <= 0 &&
						$('.checkout-main[data-page="2"]').length <= 0) {
						$('html, body').animate({
								scrollTop: 0
							}, 50);
					}
					_current_step = page;
					var action = $('.action-esegui-pagamento');
					if (action.length == 0) {
						Loading.hide();
						if (ga4) {
							gtag('event', ga4.event, ga4.data);
						}				
					}
					else {
						$('body').trigger('cart-avvia-pagamento', [action.data('pagamento')]);
					}
				});		
		}
	};
	
	Checkout = C;
	
	function setCheckbox(checkbox, url, message, event) {
		if (checkbox.hasClass('checkbox-checked')) {
			checkbox.closest('.ck-checkbox-button').addClass('ck-checkbox-button-selected');
			Loading.show();
			$.xajax(Params.url_prefix + '/cart/checkout/block/' + url, {
				data: {
					tipo: checkbox.attr('data-value'),
					_lang: Params.url_lang
				},
				success: function(data) {
					if (message) {
						$('body').message(message);
					}
					if (event) {
						$('body').trigger(event);
					}
					var ga4 = null;
					if (data.ga4) {
						if (data.ga4.shipping) {
							ga4 = {
								event: 'add_shipping_info',
								data: {
									currency: 'EUR',
									ecommerce: {
										shipping_tier: data.ga4.shipping,
										items: data.ga4.items
									}
								}
							};
						}
						else {
							ga4 = {
								event: 'add_payment_info',
								data: {
									currency: 'EUR',
									ecommerce: {
										payment_type: data.ga4.payment,
										items: data.ga4.items
									}
								}
							};
						}
					}
					C.load(null, ga4);
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
	$('body').on('checkbox-change', '.checkbox-group-ordini-in-corso .checkbox', function(e, checkbox) {
		setCheckbox(checkbox, 'update-ordini-in-corso.php', '', 'checkout-update-ordini-in-corso');
	});
	$('body').on('checkbox-change', '.checkbox-group-pagamento .checkbox', function(e, checkbox) {
		setCheckbox(checkbox, 'update-pagamento.php', Label['tipologia_pagamento_modificata'], 'checkout-update-pagamento');
	});
	$('body').on('checkbox-change', '.checkbox-group-spedizione .checkbox', function(e, checkbox) {
		setCheckbox(checkbox, 'update-spedizione.php', Label['tipologia_spedizione_modificata'], 'checkout-update-spedizione');
	});
	$('body').on('click', '.action-rimuovi-selecione-collegato-ordine', function(e) {
		Loading.show();
		$.xajax(Params.url_prefix + '/cart/checkout/block/update-ordini-in-corso', {
			data: {
				_lang: Params.url_lang
			},
			success: function(data) {
				C.load();
			},
			error: function() {
				C.alert.serverError();
			}
		});	
	});
	$('body').on('click', '.ck-checkbox-button-selected-no-show .checkbox', function(e) {
		var checkbox = $(this).closest('.block-spedizione').find('.checkbox-group-spedizione-opzione .checkbox-checked');
		Loading.show();
		$.xajax(Params.url_prefix + '/cart/checkout/block/update-spedizione-opzione.php', {
			data: {
				id: checkbox.attr('data-value'),
				add: 0,
				_lang: Params.url_lang
			},
			success: function() {
				$('body').message(Label['tipologia_spedizione_modificata']);
				C.load();
			},
			error: function() {
				C.alert.serverError();
			}
		});		
	});
	$('body').on('checkbox-change', '.checkbox-group-spedizione-opzione .checkbox', function(e, checkbox) {
		if (checkbox.hasClass('checkbox-checked')) {
			checkbox.closest('.ck-checkbox-button').addClass('ck-checkbox-button-selected');
			var add = 1;
		}
		else {
			checkbox.closest('.ck-checkbox-button').removeClass('ck-checkbox-button-selected');
			var add = 0;
		}
		Loading.show();
		$.xajax(Params.url_prefix + '/cart/checkout/block/update-spedizione-opzione.php', {
			data: {
				id: checkbox.attr('data-value'),
				add: add,
				_lang: Params.url_lang
			},
			success: function() {
				$('body').message(Label['opzioni_spedizione_modificata']);
				C.load();
			},
			error: function() {
				C.alert.serverError();
			}
		});
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
			if (($('[name="spedizione_nazione_id"]').val() + '') == '108') {
				$('.field-wrapper-pec-sdi').fadeIn();
			} 
			else {
				$('.field-wrapper-pec-sdi').fadeOut();
			}
		}
		else {
			reset();
			$('.checkout-dati-fatturazione-fields .field-uguale').fadeIn();
		}	
	});
	
	$('body').on('checkbox-change', '.checkbox-fatturazione', function(e, checkbox) {
		function reset() {
			$('.checkout-dati-fatturazione-fields input, .checkout-dati-fatturazione-fields select').each(function() {
				if ($(this).attr('type') != 'checkbox') {
					$(this).val('');
				}
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
		
	$('body').on('change', '.action-carica-provincia-cap', function() {
		var cont = $('#content_provincia_cap');
		if (cont.length > 0) {
			var id_nazione =  $('#nazione_field').val();
			if (id_nazione == '') {
				cont.html('');
			}
			else {
				Loading.show();
				cont.load(Params.url_prefix + '/cart/checkout/block/provincia-cap.php', 
						{
							id_nazione: id_nazione,
							_lang: Params.url_lang
						}, 
						function() {
							Loading.hide();
						});	
			}
		}
	});
	
	$('body').on('change', '.action-aggiorna-nazione', function() {
		var cont = $('#content_piva');
		if (cont.length > 0) {
			var id_nazione =  $('#nazione_field').val();
			var cee = $('#nazione_field option:selected').attr('data-cee');
			if (id_nazione == '' || cee == '' || id_nazione == '108') {
				cont.find('select').removeClass('valida-required');
				cont.css({display: 'none'});
			}
			else {
				cont.find('select').addClass('valida-required');
				cont.css({display: 'block'});
			}			
		}
	});
	
	$('body').on('click', '.action-rimuovi-codice', function() {
		if (Utility.confirm('Rimuovere il codice?')) {
			Loading.show();
			$.xajax(Params.url_prefix + '/cart/checkout/block/rem-codice.php', {
				data: {
					_lang: Params.url_lang
				},
				success: function(data) {
					$('body').message(Label['codice_rimosso']);
					C.load();
				},
				error: function() {	
					C.alert.serverError();
				}
			});	
		}	
	});

	$('body').on('checkout-login-complete', function() {
		$('body').removeClass('window-layer-overlay');
		$('.window-layer').remove();
		C.load(3);
	});
	
	$('body').on('click', '.action-login-utilizza-saldo-punti', function() {
		var form = $(this).closest('form');
		if (Validator.checkIsValidForm(form)) {
			form.find('.form-error-message').html('');
			form.removeClass('form-error');
			Loading.show();
			$.xajax(Params.url_prefix + '/cart/checkout/block/login-form.php', {
					dataType: 'html',
					data: {
						_lang: Params.url_lang
					},
					success: function(resp) {
						Loading.hide();
						var height = 450;
						var width = 450;
						if (width > $(window).width()) {
							width = $(window).width() - 20;
						}
						if (height > $(window).height()) {
							height = $(window).height() - 20;
						}

						var close = $('<div class="window-layer-close"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg></div>');
						var popup = $('<div class="window-layer window-layer-base"><div class="window-layer-inner">' + resp + '</div></div>');
						popup.append(close);
						popup.css({width: width + 'px', height: height + 'px', marginLeft: -(width / 2) + 'px', marginTop: -(height / 2) + 'px'});
						$('body').trigger('data-loaded', [popup]);
						$('body').append(popup);
						$('body').addClass('window-layer-overlay');
						popup.fadeIn();
						
						close.on('click', function() {
							popup.fadeOut(function() {
								$('body').removeClass('window-layer-overlay');					
								$(this).remove();
							});
						});	
					}
			});
		}			
	});
	
	$('body').on('click', '.action-rimuovi-utilizzo-saldo-punti', function() {
		var form = $(this).closest('form');
		if (Validator.checkIsValidForm(form)) {
			form.find('.form-error-message').html('');
			form.removeClass('form-error');
			Loading.show();
			$.xajax(Params.url_prefix + '/cart/checkout/block/rimuovi-saldo-punti.php', {
				data: {
					_lang: Params.url_lang
				},
				success: function(data) {
					if (data.success) {
						$('body').message(Label['salto_punti_rimosso']);
						C.load(3);
					}
					else {
						form.addClass('form-error');
						form.find('.form-error-message').html(data.message);
						C.alert.error(data.message);
					}					
				},
				error: function() {
					C.alert.serverError();
				}
			});	
		}
		else {
			C.alert.form(form);		
		}
	});
	
	$('body').on('click', '.action-utilizza-saldo-punti', function() {
		var form = $(this).closest('form');
		if (Validator.checkIsValidForm(form)) {
			form.find('.form-error-message').html('');
			form.removeClass('form-error');
			Loading.show();
			$.xajax(Params.url_prefix + '/cart/checkout/block/utilizza-saldo-punti.php', {
				data: {
					_lang: Params.url_lang
				},
				success: function(data) {
					if (data.success) {
						$('body').message(Label['salto_punti_utilizzato']);
						C.load(3);
					}
					else {
						form.addClass('form-error');
						form.find('.form-error-message').html(data.message);
						C.alert.error(data.message);
					}					
				},
				error: function() {
					C.alert.serverError();
				}
			});	
		}
		else {
			C.alert.form(form);		
		}
	});	
	
	$('body').on('click', '.action-codice-speciale', function() {
		var form = $(this).closest('form');
		if (Validator.checkIsValidForm(form)) {
			var codice = form.find('input').val();
			form.find('.form-error-message').html('');
			form.removeClass('form-error');
			Loading.show();
			$.xajax(Params.url_prefix + '/cart/checkout/block/add-codice-speciale.php', {
				data: {
					codice: codice,
					_lang: Params.url_lang
				},
				success: function(data) {
					if (data.success) {
						$('body').message(Label['valore_applicato']);
						C.load();
					}
					else {
						form.addClass('form-error');
						form.find('.form-error-message').html(data.message);
						C.alert.error(data.message);
					}					
				},
				error: function() {
					C.alert.serverError();
				}
			});	
		}
		else {
			C.alert.form(form);		
		}
	});	
	
	$('body').on('click', '.action-codice', function() {
		var form = $(this).closest('form');
		if (Validator.checkIsValidForm(form)) {
			var codice = form.find('input').val();
			form.find('.form-error-message').html('');
			form.removeClass('form-error');
			Loading.show();
			$.xajax(Params.url_prefix + '/cart/checkout/block/add-codice.php', {
				data: {
					codice: codice,
					_lang: Params.url_lang
				},
				success: function(data) {
					if (data.success) {
						$('body').message(Label['codice_applicato']);
						C.load();
					}
					else {
						form.addClass('form-error');
						form.find('.form-error-message').html(data.message);
						C.alert.error(data.message);
					}					
				},
				error: function() {
					C.alert.serverError();
				}
			});	
		}
		else {
			C.alert.form(form);		
		}
	});
	
	$('body').on('click', '.checkout-nav .ok', function() {
		C.load($(this).attr('data-step'));
	});
	
	$('body').on('click', '.action-vuota-carrello', function() {
		if (Utility.confirm(Label['svuotare_carrello'])) {
			Loading.show();
			$.xajax(Const.resetCartUrl, {
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

	$('body').on('click', '.action-aggiungi-prezzo', function() {
		var item_id = $(this).attr('data-id');
		
		var html = [
			'<div class="window-layer window-layer-base" style="display: none;">',
				'<div class="window-layer-content">',
					'<div class="window-layer-title">',
						Label['title_aggiungi_sottrai_prezzo'],
					'</div>',
					'<div class="field-line-text">',
					Label['descr_aggiungi_sottrai_prezzo'],
					'</div>',
					'<div class="field-line">',
						'<div class="field">',
							'<label>', Label['valore_in_euro'],'</label>',
							'<input type="text" name="valore" class="valida-digiteuro" value="" maxlength="10">',
						'</div>',
					'</div>',
					'<a class="button button-red">', Label['btn_applica'],'</a>',
				'</div>',
				'<div class="window-layer-toolbar">',
					'<a>', Label['btn_chiudi'],'</a>',
				'</div>',
			'</div>'
		];
		var cont = $(html.join(''));
		var btnChiudi = cont.find('.window-layer-toolbar a');
		btnChiudi.on('click', function() {
				$('body').removeClass('window-layer-overlay');
				cont.fadeOut(350, function() {
					cont.remove();
				});
			});
			
		var btnSalva = cont.find('.window-layer-content a');
		btnSalva.on('click', function() {
			var valore = cont.find('input[name="valore"]').val();
			if (valore == '') {
				return;
			}
			$('body').removeClass('window-layer-overlay');
			cont.fadeOut(350, function() {
				cont.remove();
			});
			Loading.show();	
			
			$.xajax(Const.addSubItemPriceUrl, {
				data: {
					id: item_id,
					valore: valore
				},
				success: function(data) {
					if (data.success) {
						$('body').message(Label['dati_aggiornati']);
						C.load();
					}
					else {
						C.alert.error(data.message);
						if (data.force_reload) {
							C.load();
						}
					}
				},
				error: function() {	
					C.alert.serverError();
				}		
			});
		});	
			
		$('body').addClass('window-layer-overlay');
		$('body').append(cont);
		cont.fadeIn(300);
		
		var top = '50%';
		var left = '50%';
		var marginLeft = -150;
		var marginTop = -150;
		var width = 300;
		var height = 300;
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
	});

	$('body').on('click', '.action-elimina', function() {
		if (Utility.confirm(Label['eliminare_articolo'])) {
			Loading.show();	
			var item_id = $(this).attr('data-id');
			var url_load = $(this).attr('data-load-url');
			$.xajax(Const.removeFromCartUrl, {
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
	
	function avvia_pagamento(tipoPagamento) {
		C.loadNext(null, function(data) {
			switch(tipoPagamento) {
			case 'oney':
			case 'bancontact':
				location.href = data.cc_mac;
				break;
			case 'cc':
				var cc_mac = $('#form_pagamento_cc input[data-type=cc_mac]');
				if (cc_mac.hasClass('redirect')) {
					location.href = data.cc_mac;
				} 
				else {
					cc_mac.val(data.cc_mac);
					$('#form_pagamento_cc input[data-type=codice]').val(data.codice);
					$('#form_pagamento_cc input[data-type=codice_transazione]').val(data.codice_transazione);
					$('#form_pagamento_cc input[data-type=cc_len]').val(data.cc_len);
					$('#form_pagamento_cc input[data-type=cc_data]').val(data.cc_data);
					$('#form_pagamento_cc').submit();	
				}
				break;
			case 'paypal':
				var list_campi = [
					'total_ordine',
					'codice',
					'spedizione_nome',
					'spedizione_cognome',
					'spedizione_indirizzo1',
					'spedizione_indirizzo2',
					'spedizione_citta',
					'spedizione_stato',
					'spedizione_stato2',
					'spedizione_cap',
					'spedizione_email',
				];
				for (var i = 0; i < list_campi.length; i++) {
					var field = $('#form_pagamento_paypal input[data-type=' + list_campi[i] + ']');
					if (field) {
						if (data[list_campi[i]]) {
							field.val(data[list_campi[i]]);
						}
					}
				}
				$('#form_pagamento_paypal').submit();
				break;
			case 'scalapay':
				$('#form_pagamento_scalapay').submit();
				break;
			case 'satispay':
				$('#form_pagamento_satispay').submit();
				break;
			case '18app':
				$('#form_pagamento_18app input[data-type=cc_mac]').val(data.cc_mac);
				$('#form_pagamento_18app').submit();
				break;
			case 'punti':
				$('#form_pagamento_punti input[data-type=cc_mac]').val(data.cc_mac);
				$('#form_pagamento_punti').submit();
				break;
			default:
				location.href =  Params.url_prefix + '/cart/thanks.php?_lang=' + Params.url_lang;
				break;
			}
		});
	}
	
	$('body').on('cart-avvia-pagamento', function(e, tipoPagamento) {
		avvia_pagamento(tipoPagamento);
	});
	
	$('body').on('click', '.action-submit-5', function() {
		var tipoPagamento = $(this).attr('data-pagamento');
		avvia_pagamento(tipoPagamento);
	});

	$('body').on('click', '.action-submit-5-email', function() {
		C.loadNext({pagamento_con_email: 1}, function(data) {
			location.href =  Params.url_prefix + '/cart/thanks.php?email=1&_lang=' + Params.url_lang;
		});
	});
	
	$('body').on('click', '.action-submit-4, .action-submit-4-email', function() {
		var formToValidate = ['.checkout-dati-spedizione'];
		if ($('.checkbox-fatturazione').hasClass('checkbox-checked') &&
			!$('.checkbox-spedizione-uguale-fatturazione').hasClass('checkbox-checked')) {
			formToValidate.push('.checkout-dati-fatturazione .field-uguale');
		}
		var error = false;
		if (!$(this).hasClass('action-submit-4-email-no-validazione')) {
			for (var i = 0; i < formToValidate.length; i++) {
				if (!Validator.checkIsValidForm($(formToValidate[i]))) {
					error = true;
				}
			}		
		}
		
		if (error) {
			C.alert.form($('#form-dati'));
			C.alert.error(Label['campi_con_errore']);
		}
		else {
			if (!$(this).hasClass('action-submit-4-email-no-validazione') &&
				!$('.checkbox-termini-condizioni').hasClass('checkbox-checked')) {
				C.alert.error(Label['per_procedere_accettare_termini']);
				return;
			}
			var data = $('#form-dati').serializeObject();
			if ($(this).hasClass('action-submit-4-email')) {
				data.pagamento_con_email = 1;
				var success = function(data) {
					location.href = Params.url_prefix + '/cart/thanks.php?email=1&_lang=' + Params.url_lang;
				};
			}
			else {
				var success = null;
			}
			C.loadNext(data, success, $('#form-dati'));
		}
	});
	
	/*$('body').on('checkout-loaded', function(e, page) {
	});*/
	
	$('body').on('click', '.action-submit-3', function() {
		Loading.show();
		if ($(this).data('force-step') && !isNaN($(this).data('force-step'))) {
			_current_step = parseInt($(this).data('force-step'));
		}
		var error = false;
		var list_item_id = [];
		var list_qta = [];
		$('.action-aggiorna, [data-checkout-aggiorna-id]').each(function() {
			if (error) {
				return;
			}
			if ($(this).hasClass('action-aggiorna')) {
				var item_id = $(this).attr('data-id');
				var qta = $(this).parent().find('input').val();
			}
			else {
				var item_id = $(this).attr('data-checkout-aggiorna-id');
				var qta = $(this).find('input').val();
			}
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
		$.xajax(Const.updateItemFromCartUrl, {
			data: {
				id: list_item_id.join(','),
				qta: list_qta.join(',')
			},
			success: function(data) {
				if (data.success) {
					var data = null;
					var error = false;
					if ($('.form-dati-step').length > 0) {
						$('.form-dati-step').each(function() {
							$(this).find('.form-error-message').html('');
							$(this).removeClass('form-error');

							if (!Validator.checkIsValidForm($(this))) {
								$(this).removeClass('form-loading');
								$(this).find('.form-error-message').html(Label['campi_con_errore']);
								$(this).addClass('form-error');
								error = true;
							}
							if (data) {
								data = $.extend({}, data, $(this).serializeObject());
							}
							else {
								data = $(this).serializeObject();
							}
						});
						
					}
					if (error) {
						if (typeof window['grecaptcha'] !== 'undefined') {
							var recaptcha = $('.g-recaptcha');
							if (recaptcha.length > 0) {
								recaptcha.each(function() {
									grecaptcha.reset();
								});
							}
						}
						Loading.hide();
						$('body').message({message: Label['campi_con_errore'], type: 'error'});
						return;
					}
					C.loadNext(data);
				}
				else {
					if (typeof window['grecaptcha'] !== 'undefined') {
						var recaptcha = $('.g-recaptcha');
						if (recaptcha.length > 0) {
							recaptcha.each(function() {
								grecaptcha.reset();
							});
						}
					}
					C.alert.error(data.message);
				}
			},
			error: function() {
				if (typeof window['grecaptcha'] !== 'undefined') {
					var recaptcha = $('.g-recaptcha');
					if (recaptcha.length > 0) {
						recaptcha.each(function() {
							grecaptcha.reset();
						});
					}
				}
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
				$.xajax(Const.removeFromCartUrl, {
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
			$.xajax(Const.updateItemFromCartUrl, {
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
			'<div class="window-layer  window-layer-base" style="display: none;">',
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
			if (type != 'indirizzo-sede') {
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
			}
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
	
	$('body').on('click', '.action-indirizzi-sede', function() {
		window_seleziona_dati('indirizzo-sede', function(id) {
			$('.item-indirizzo-sede-wrapper .item-indirizzo-sede.selected').removeClass('selected');
			$('.item-indirizzo-sede-wrapper .item-indirizzo-sede[data-id="' + id + '"]').addClass('selected');
			Loading.show();
			$.xajax(Params.url_prefix + '/cart/checkout/block/update-sede-spedizione', {
				data: {
					id_sede: id,
					_lang: Params.url_lang
				},
				success: function() {
					Loading.hide();
				},
				error: function() {
					C.alert.serverError();
				}
			});
		});
	});
	
	$('body').on('click', '.action-fatturazione-predefinita', function() {
		var form = $(this).closest('form');

		function inserisci(id) {
			$('.item-fattura[data-id=' + id + '] span').each(function() {
				var input = form.find('[name=fattura_' + $(this).attr('data-name') + ']');
				if (input.length > 0) {
					var val = $(this).text();
					input.val(val);
					if (val != '') {
						input.closest('.field').addClass('keypress');
						if (input.prop("tagName").toLowerCase() == 'select') {
							input.trigger('change');
						}
					}
				}
			});	
		}
		
		window_seleziona_dati('fattura', inserisci);
	});	
	$('body').on('click', '.action-indirizzi-predefiniti', function() {
		var form = $(this).closest('form');

		function inserisci(id, nazione) {
			if (nazione != form.attr('data-nazione')) {
				if (Utility.confirm(Label['conferma_modifica_nazione'])) {
					$.xajax(Params.url_prefix + '/cart/checkout/block/ex-checkout-2.php', {
						data: {
							aggiorna_spedizione_da_default: id,
							nazione: nazione,
							_lang: Params.url_lang
						},
						success: function(data) {
							if (data.success) {
								C.load(3);
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
				else {
					return;
				}
			}
			$('.item-indirizzo[data-id=' + id + '] span').each(function() {
				var input = form.find('[name=spedizione_' + $(this).attr('data-name') + ']');
				if (input.length > 0) {
					var val = $(this).text();
					input.val(val);
					if (val != '') {
						input.closest('.field').addClass('keypress');
					}
				}
			});
		}
		
		window_seleziona_dati('indirizzo', inserisci);
	});	
	
	$('body').on('checkout-reload-page', function() {
		C.load();
	});
	if ($('#checkout').length > 0) {
		var page = $('#checkout').attr('data-current-block');
		if (page == null || page == '') {
			page = 1;
		}
		C.load(page);
	}

	$('body').on('click', '.tab-title', function() {
		var $this = $(this);
		if ($this.parent().hasClass('tab-selected')) {
			return;
		}
		var selected = $('#checkout').find('.tab-selected');
		selected.removeClass('tab-selected');
		$this.parent().addClass('tab-selected');
	});
	
	$('body').on('change', '.action-change-selezione-nazione-step-2', function() {
		Loading.show();
		var data = $('#form-dati').serializeObject();
		$.xajax('/cart/checkout/block/change-selezione-nazione-step-2', {
			data: data,
			success: function(data) {
				C.load(2);
			},
			error: function() {
				C.alert.serverError();
			}
		});
	});
});