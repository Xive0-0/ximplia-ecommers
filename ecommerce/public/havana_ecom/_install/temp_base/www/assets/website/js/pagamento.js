$(function() {
	$('body').on('click', '.action-step-salva-dati', function() {
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
		
		var form = $('form[data-step-pagamento="2"]');
		if (error) {
			form.removeClass('form-loading');
			form.find('.form-error-message').html(Label['campi_con_errore']);
			form.addClass('form-error');
			
			Loading.hide();
			$('body').message({message: Label['campi_con_errore'], type: 'error'});
		}
		else {
			if (!$(this).hasClass('action-submit-4-email-no-validazione') &&
				!$('.checkbox-termini-condizioni').hasClass('checkbox-checked')) {
				$('body').message({message: Label['per_procedere_accettare_termini'], type: 'error'});
				return;
			}
			var data = form.serializeObject();

			Loading.show();
			data._lang = Params.url_lang;
			$.xajax('/cart/checkout/ex-update-dati', {
				data: data,
				success: function(data) {
					if (data.success) {
						var type = $('.checkbox-group-pagamento-email .checkbox-checked').attr('data-value');
						if (type == 1) {
							$('.pagamento-carta-credito .action-ripeti-pagamento').trigger('click');
						}
						else {
							$('.pagamento-paypal .action-ripeti-pagamento').trigger('click');
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
						Loading.hide();
						$('body').message({message: data.message, type: 'error'});
					}
				},
				error: function() {	
					Loading.hide();
					$('body').message({message: Label['errore_interno'], type: 'error'});
				}
			});	
		}		
	});
	
	$('body').on('click', '.action-step-pagamento-1', function() {
		$('[data-step-pagamento="2"]').css({display: 'none'});
		$('[data-step-pagamento="1"]').fadeIn();
		$('html, body').animate({scrollTop:0}, 200);
	});
	$('body').on('click', '.action-step-pagamento-2', function() {
		$('[data-step-pagamento="1"]').css({display: 'none'});
		$('[data-step-pagamento="2"]').fadeIn();
		$('html, body').animate({scrollTop:0}, 200);
	});	
	$('body').on('checkbox-change', '.checkbox-group-pagamento-email .checkbox', function(e, checkbox) {
		if (checkbox.hasClass('checkbox-checked')) {
			checkbox.closest('.ck-checkbox-button').addClass('ck-checkbox-button-selected');
			Loading.show();
			var type = checkbox.attr('data-value');
			var form = $('[data-step-pagamento="1"]');
			form.find('.checkout-riepilogo-ordine').load(
				'/cart/checkout/pagamento-aggiorna-metodo',
				{
					token: form.find('input[name="token"]').val(),
					id_ordine: form.find('input[name="id_ordine"]').val(),
					type: type,
					_lang: Params.url_lang
				}, 
				function() {
					Loading.hide();
					$('#importo-da-pagare').html($('#totale-ordine').html());
				});
		}
		else {
			checkbox.closest('.ck-checkbox-button').removeClass('ck-checkbox-button-selected');
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
});