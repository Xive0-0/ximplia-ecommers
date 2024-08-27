(function( $ ){
	$.fn.manualScrollItems = function() {
		$(this).each(function() {
			var $this = $(this);
			var width = 0;
			var widthItem = 0;
			$this.find('.item').each(function() {
				if (widthItem == 0) {
					widthItem = $(this).outerWidth(true);
				}
				width += widthItem;
			});
			var wrapper = $this.outerWidth(true);
			if (wrapper < width) {
				$this.find('.manualscroll-list').css({width: (width + 60) + 'px'});
				var btnLeft = $('<div class="manualscroll-arrow-left"></div>');
				var btnRight = $('<div class="manualscroll-arrow-right"></div>');
				$this.parent().append(btnLeft);
				$this.parent().append(btnRight);
				var animationActive = false;
				btnRight.on('click', function() {
					if (animationActive) {
						return;
					}
					animationActive = true;
					var scrollLeft = $this.scrollLeft() + widthItem;				
					$this.animate({scrollLeft: scrollLeft + 'px'}, 500, function() {
						if ($this.scrollLeft() > 0) {
							btnLeft.css({display: 'block'});
						}
						if ((width - wrapper) <= $this.scrollLeft()) {
							btnRight.css({display: 'none'});
						}
						animationActive = false;
					});
				});
				btnLeft.on('click', function() {
					if (animationActive) {
						return;
					}
					animationActive = true;
					var scrollLeft = $this.scrollLeft() - widthItem;		
					$this.animate({scrollLeft: scrollLeft + 'px'}, 500, function() {
						if ($this.scrollLeft() <= 0) {
							btnLeft.css({display: 'none'});
						}
						btnRight.css({display: 'block'});
						animationActive = false;
					});
				});
			}
		});
		return $(this);			
	};
})( jQuery );

$(function(){
	$('body').on('click', '.action-ripeti-pagamento', function() {
		Loading.show();
		var id = $(this).attr('data-id');
		var type = $(this).attr('data-type');
		$.xajax('/cart/checkout/ripeti-pagamento', {
				data: {
					id: id,
					_lang: Params.url_lang,
					tipo_pagamento: type
				},
				success: function(data) {
					if (type == 'ritiro_sede') {
						location.href = Const.cartThanks;
					}
					else if (type == 'scalapay') {
						$('#form_pagamento_scalapay').submit();
					}
					else if (type == 'satispay') {
						$('#form_pagamento_satispay').submit();
					}
					else if (type == '18app') {
						$('#form_pagamento_18app input[data-type=cc_mac]').val(data.cc_mac);
						$('#form_pagamento_18app').submit();
					}
					else if (type == 'punti') {
						$('#form_pagamento_punti input[data-type=cc_mac]').val(data.cc_mac);
						$('#form_pagamento_punti').submit();
					}
					else if (data.success && data.codice != null && data.codice != '') {
						switch(type) {
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
						default:
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
						}
					}
					else {
						Loading.hide();
						$('body').message({message: Label['server_non_risponde'], type: 'error'});
					}
				},
				failure: function() {
					Loading.hide();
					$('body').message({message: Label['server_non_risponde'], type: 'error'});
				}
			});	
	});
	
	$('body').on('click', '.action-close-item-form', function() {
		$('.item-form-layer, .item-form-layer-overlay').fadeOut(300, function() {
			$('body').removeClass('item-form-show');
			$(this).remove();
		});		
	});
	
	$('body').on('click', '.action-close-list-items-to-add', function() {
		$('.list-items-to-add-wrapper, .list-items-to-add-overlay').fadeOut(300, function() {
			$('body').removeClass('list-items-to-add-show');
			$(this).remove();
		});
	});
	
	$('body').on('add-item-to-cart', function(e, isLayerToAdd, item_id, qta, name, img, price, attributi, vaiDirettoCassa, no_layer, da_categoria) {
		addItemToCart(isLayerToAdd, item_id, qta, name, img, price, attributi, vaiDirettoCassa, no_layer, da_categoria);
	});
	
	function addItemToCart(isLayerToAdd, item_id, qta, name, img, price, attributi, vaiDirettoCassa, no_layer, da_categoria) {
		vaiDirettoCassa = vaiDirettoCassa == null ? false : vaiDirettoCassa;
		no_layer = no_layer == null ? false : no_layer;
		
		attributi = attributi == null ? [] : attributi;
		var html = [
			'<div class="item-to-add-cart">',
				'<div class="item-to-add-cart-image"><img src="', img, '"></div>',
				'<h1>', name, '</h1>',
				'<div class="price"><strong>', price, '</strong></div>',
				'<div class="qta"><em>', Label['quantita'],':</em> <strong>', qta, '</strong></div>'
		];
		var listAttributo = [];
		for (var i = 0; i < attributi.length; i++) {
			html.push('<div class="attributo"><em>' + attributi[i].label + ':</em> <strong>' + attributi[i].description + '</strong></div>');
			var attr_pers = '';
			if (attributi[i].pers != null && attributi[i].pers != '') {
				attr_pers = '#' + attributi[i].pers;
			}
			if (attributi[i].pers_label != null && attributi[i].pers_label != '') {
				attr_pers += '#' + attributi[i].pers_label;
			}
			listAttributo.push(attributi[i].type + '#' + attributi[i].id + attr_pers);
		}


		if (vaiDirettoCassa) {
			$('#cart').addClass('loading');
			$.xajax(Const.addToCartUrl, {
					data: {
						to_add: (isLayerToAdd ? 1 : ''),
						id: item_id,
						qta: qta,
						attr: listAttributo.join(','),
						checkout: $('#checkout').length > 0 ? 'si' : '',
						da_categoria: ($('body[data-activity="search"]').length > 0 || da_categoria) ? 'si' :''
					},
					success: function(data) {
						if (data.ga4) {
							gtag('event', 'add_to_cart', {
								ecommerce: {
									items: data.ga4
								}
							});
						}
						if (typeof fbq === 'function') {
							fbq('track', 'AddToCart', {
								content_ids: [item_id],
								content_type: 'product'
							});
						}
						if (typeof pintrk === 'function') {
							pintrk('track', 'AddToCart', {
								product_id: [item_id],
								order_quantity: qta,
								currency: 'EUR'
							});
						}
						location.href = Const.cartIndex;
					}
				});
			return;
		}
		
		function add_to_cart() {
			$('#cart').addClass('loading');
			$.xajax(Const.addToCartUrl, {
					data: {
						to_add: (no_layer ? '' : (isLayerToAdd ? 1 : '')),
						id: item_id,
						qta: qta,
						attr: listAttributo.join(','),
						checkout: $('#checkout').length > 0 ? 'si' : '',
						da_categoria: $('body[data-activity="search"]').length > 0 ? 'si' : ''
					},
					success: function(data) {
						if (data.form) {
							var html = [
								'<div class="item-form-layer" data-item-id="', item_id,'" data-item-qta="', qta,'">',
									data.form,
								'</div>'
							];
							var overlay = $('<div class="item-form-layer-overlay"></div>')
							$('body').append(overlay);
							var elem = $(html.join(''));
							$('body').addClass('item-form-show');
							$('body').append(elem);
							overlay.fadeIn(200);
							elem.css({display: 'block'});
							$('body').trigger('cart-item-form', [elem]);
							$(document).scrollTop(0);	

							return;
						}
						
						if (typeof fbq === 'function') {
							fbq('track', 'AddToCart', {
								content_ids: [item_id],
								content_type: 'product'
							});
						}

						if (typeof pintrk === 'function') {
							pintrk('track', 'AddToCart', {
								product_id: [item_id],
								order_quantity: qta,
								currency: 'EUR'
							});
						}
						
						$('#cart').removeClass('loading');
						if (data.success) {
							if (data.ga4) {
								gtag('event', 'add_to_cart', {
									ecommerce: {
										items: data.ga4
									}
								});
							}
							
							if (isLayerToAdd && Params.layer_add_to_cart_fisso == '') {
								$('.list-items-to-add-wrapper, .list-items-to-add-overlay').fadeOut(300, function() {
									$('body').removeClass('list-items-to-add-show');
									$(this).remove();
								});
							}
							
							var timeout = Params.timeout_add_to_cart_message;
							if (timeout > 0) {
								$('body').message('"' + name + '" ' + Label['aggiunto_carrello'], timeout, true);
							}
							$('body').trigger('update-info-cart', [data.cart]);
							if ($('#cart').length > 0 && $('#cart-details').length > 0) {
								$('#cart').attr('data-number', data.cart.number_qta);
								$('#cart .cart-button .item-number').html(data.cart.number_qta);
								$('#cart .cart-button .item-number-items').html(data.cart.number);
								$('#cart-details .item-number').html(data.cart.number_qta);
								$('#cart-details .item-number-items').html(data.cart.number);
								$('#cart-details').attr('data-number', data.cart.number_qta);
								$('#cart-details').attr('data-number-items', data.cart.number);
								$('#cart-details .cart-total-price').html(data.cart.total + ' ' + Params.currentValuta);
								$('#cart-details .cart-total-price-imponibile').html(data.cart.total_imponibile + ' ' + Params.currentValuta);
								$('#cart-details .cart-items-list').html(data.cart.details);
								if (data.cart.number_qta > 0) {
									$('#cart-link-cassa').addClass('show');
								}
								else {
									$('#cart-link-cassa').removeClass('show');
								}
							}
							
							if (!no_layer) {
								if (!isLayerToAdd && data.to_add && data.to_add.details && data.to_add.details != '') {	
									var html = [
										'<div class="list-items-to-add-wrapper list-items-to-add">',
											'<div class="list-items-to-add-toolbar">',
												'<a class="action-close-list-items-to-add list-items-to-add-close" title="', Label["chiudi"], '" href="javascript:void(0)"></a>',
												'<div class="list-items-to-add-text">', Label["to_add_articolo_aggiunto"], '<br><strong>', Label["to_add_potrebbero_interessarti"], '</strong></div>',
												'<div class="list-items-to-add-item-added-cart clear">', (data.to_add.item_added ? data.to_add.item_added : ''), '</div>',
												'<div class="list-items-to-add-button-bar">',
													'<a class="button-red button" title="', Label["to_add_vai_alla_cassa"], '" href="', Const.cartIndex,'">', Label["to_add_vai_alla_cassa"], '</a>',
													'<a class="button-red button action-close-list-items-to-add action-continua-acquisti-items-to-add" title="', Label["to_add_continua_acquisti"], '" href="javascript:void(0)">', Label["to_add_continua_acquisti"], '</a>',
												'</div>',
											'</div>',
											'<div class="list-items-to-add-body list-items-to-add-body-web manualscroll-wrapper">',
												'<div class="manualscroll-list">',
													data.to_add.details,
												'</div>',
											'</div>',
											'<div class="list-items-to-add-body list-items-to-add-body-mobile">',
												data.to_add.details,
											'</div>',
											'<div class="list-items-to-add-bottombar">',
												'<div class="list-items-to-add-text">', Label["to_add_articolo_aggiunto"], '<br><strong>', Label["to_add_potrebbero_interessarti"], '</strong></div>',
												'<div class="list-items-to-add-item-added-cart clear">', (data.to_add.item_added ? data.to_add.item_added : ''), '</div>',
												'<div class="list-items-to-add-button-bar">',
													'<a class="button-red button" title="', Label["to_add_vai_alla_cassa"], '" href="', Const.cartIndex,'">', Label["to_add_vai_alla_cassa"], '</a>',
													'<a class="button-red button action-close-list-items-to-add action-continua-acquisti-items-to-add" title="', Label["to_add_continua_acquisti"], '" href="javascript:void(0)">', Label["to_add_continua_acquisti"], '</a>',
												'</div>',
											'</div>',
										'</div>'
									];
									var overlay = $('<div class="list-items-to-add-overlay list-items-to-add-overlay-list"></div>')
									$('body').append(overlay);
									var elem = $(html.join(''));
									$('body').addClass('list-items-to-add-show');
									$('body').append(elem);
									overlay.fadeIn(200);										
									elem.fadeIn(300, function() {
										$('.list-items-to-add-wrapper .manualscroll-wrapper').manualScrollItems();
									});	
									$('body').trigger('cart-item-add-layer', [elem]);
									$(document).scrollTop(0);
								}
								else {
									if (isLayerToAdd || data.to_add_message != null) {
										var html = [
											'<div class="list-items-to-add-wrapper list-items-to-add-message">',
												'<div class="list-items-to-add-toolbar">',
													'<a class="action-close-list-items-to-add list-items-to-add-close" title="', Label["chiudi"], '" href="javascript:void(0)"></a>',
													'<div class="list-items-to-add-text">', Label["to_add_articolo_aggiunto"], '</div>',
													'<div class="list-items-to-add-item-added-cart clear">', data.to_add.item_added, '</div>',
													'<div class="list-items-to-add-button-bar">',
														'<a class="button-red button" title="', Label["to_add_vai_alla_cassa"], '" href="', Const.cartIndex,'">', Label["to_add_vai_alla_cassa"], '</a>',
														'<a class="button-red button action-close-list-items-to-add action-continua-acquisti-items-to-add" title="', Label["to_add_continua_acquisti"], '" href="javascript:void(0)">', Label["to_add_continua_acquisti"], '</a>',
													'</div>',
												'</div>',
											'</div>'
										];
										var overlay = $('<div class="list-items-to-add-overlay list-items-to-add-overlay-message"></div>')
										$('body').append(overlay);
										var elem = $(html.join(''));
										$('body').append(elem);
										overlay.fadeIn(200);										
										elem.fadeIn(300);	
										$('body').trigger('cart-item-add-layer', [elem]);
									}
								}
							}
							$('body').trigger('cart-update');
							$('body').trigger('checkout-reload-page');
						}
						else {
							data.message = data.message == null ? Label['non_possibile_aggiungere_carrello'] : data.message;
							$('body').message({message: data.message, type: 'error'});
						}
					},
					failure: function() {
						$('#cart').removeClass('loading');
						$('body').message({message: Label['server_non_risponde_aggiungi_carrello'], type: 'error'});
					}
				});	
			if (animBox) {
				animBox.fadeOut(300, function() {
					animBox.remove();
				});
			}
		}
		
		if (Params.no_animazione_add_to_cart || $('#cart').length == 0) {
			add_to_cart();
		}
		else {
			html.push('</div>');
			var animBox = $(html.join(''));
			$('body').append(animBox);
			animBox.center($('.item-buy[data-id=' + item_id + ']'), {x: 'center', y: 'center'});
			var toOffset = $('#cart').offset();
			var toTop = toOffset.top + $('#cart').outerHeight()/2 - animBox.outerHeight()/2;
			var toLeft = toOffset.left + $('#cart').outerWidth()/2 - animBox.outerWidth()/2;
			
			setTimeout(function() {
				animBox.animate({
					top: toTop + 'px',
					left: toLeft + 'px',
					opacity: .25
				}, 500, add_to_cart);
			}, 500);	
		}
	}
	
	$('body').on('click', '.btn-delete-cart-item', function() {
		var item_id = $(this).attr('data-id');
		$('#cart').addClass('loading');
		$.xajax(Const.removeFromCartUrl, {
				data: {
					id: item_id
				},
				success: function(data) {
					$('#cart').removeClass('loading');
					if (data.success) {
						if (data.ga4) {
							gtag('event', 'remove_from_cart', {
								ecommerce: {
									items: data.ga4
								}
							});
						}

						$('body').message(Label['conferma_eliminato_articolo_carrello']);
						$('body').trigger('update-info-cart', [data.cart]);
						$('#cart').attr('data-number', data.cart.number_qta);
						$('#cart .cart-button .item-number').html(data.cart.number_qta);
						$('#cart .cart-button .item-number-items').html(data.cart.number);
						$('#cart-details .item-number').html(data.cart.number_qta);
						$('#cart-details .item-number-items').html(data.cart.number);
						$('#cart-details').attr('data-number', data.cart.number_qta);
						$('#cart-details').attr('data-number-items', data.cart.number);
						$('#cart-details .cart-total-price').html(data.cart.total + ' ' + Params.currentValuta);
						$('#cart-details .cart-total-price-imponibile').html(data.cart.total_imponibile + ' ' + Params.currentValuta);
						$('#cart-details .cart-items-list').html(data.cart.details);
						if (data.cart.number_qta > 0) {
							$('#cart-link-cassa').addClass('show');
						}
						else {
							$('#cart-link-cassa').removeClass('show');
						}
						$('body').trigger('cart-update');
					}
					else {
						data.message = data.message == null ? Label['non_possibile_rimuovere_carrello'] : data.message;
						$('body').message({message: data.message, type: 'error'});
					}
				},
				failure: function() {
					$('#cart').removeClass('loading');
					$('body').message({message: Label['server_non_risponde_rimuovi_carrello'], type: 'error'});
				}
			});
	});
	
	$('body').on('click', '.btn-vuota-carrello', function() {
		if (Utility.confirm(Label['svuotare_carrello'])) {
			$('#cart').addClass('loading');
			$.xajax(Const.resetCartUrl, {
					success: function(data) {
						$('body').trigger('update-info-cart', [data.cart]);
						$('#cart').attr('data-number', data.cart.number_qta);
						$('#cart .cart-button .item-number').html(data.cart.number_qta);
						$('#cart .cart-button .item-number-items').html(data.cart.number);
						$('#cart-details .item-number').html(data.cart.number_qta);
						$('#cart-details .item-number-items').html(data.cart.number);
						$('#cart-details').attr('data-number', data.cart.number_qta);
						$('#cart-details').attr('data-number-items', data.cart.number);
						$('#cart-details .cart-total-price').html(data.cart.total + ' ' + Params.currentValuta);
						$('#cart-details .cart-total-price-imponibile').html(data.cart.total_imponibile + ' ' + Params.currentValuta);
						$('#cart-details .cart-items-list').html(data.cart.details);
						if (data.cart.number_qta > 0) {
							$('#cart-link-cassa').addClass('show');
						}
						else {
							$('#cart-link-cassa').removeClass('show');
						}
						$('#cart').removeClass('loading');
						$('body').message(Label['carrello_svuotato']);
						$('body').trigger('cart-update');
						$('body').trigger('cart-void');
						
						if ($('#cart-details').hasClass('show')) {
							$(document).off(Params.hide_riepilogo_carrello_on);	
							$('#cart').removeClass('show-details');
							$('#cart-details').removeClass('show');
							$('#cart-details').fadeOut(200);
						}
					},
					failure: function() {
						$('#cart').removeClass('loading');
						$('body').message({message: Label['server_non_risponde_vuota_carrello'], type: 'error'});
					}
				});	
		}
	});

	$('body').on('hide-cart', function() {
		$(document).off(Params.hide_riepilogo_carrello_on);	
		$('#cart').removeClass('show-details');
		$('#cart-details').removeClass('show');
		$('#cart-details').fadeOut(200);
		
		$('#cart-preventivo').removeClass('show-details');
		$('#cart-preventivo-details').removeClass('show');
		$('#cart-preventivo-details').fadeOut(200);
	});

	if (Params.show_riepilogo_carrello_on != 'none') {
		if (Utility.isMobile()) {
			Params.show_riepilogo_carrello_on = 'click';
			Params.hide_riepilogo_carrello_on = 'mousedown';
		}
		if (Params.hide_riepilogo_carrello_on == null) {
			Params.hide_riepilogo_carrello_on = 'mousedown';
		}

		if (Params.show_riepilogo_carrello_on == 'click') {
			$('.cart-button').on('click', function() {
				$(document).off(Params.hide_riepilogo_carrello_on);	
				if ($('#cart-details').hasClass('show')) {
					$('#cart').removeClass('show-details');
					$('body').removeClass('show-cart-details');
					$('#cart-details').removeClass('show');
					$('#cart-details').fadeOut(200);
				}
				else {
					$('body').addClass('show-cart-details');
					$('#cart-preventivo').removeClass('show-details');
					$('#cart-preventivo-details').removeClass('show');
					$('#cart-preventivo-details').fadeOut(200);
					
					$('#cart').addClass('show-details');
					$('#cart-details').addClass('show');
					$('#cart-details .cart-items-list').scrollTop(0);
					$('#cart-details').fadeIn();
					$(document).on(Params.hide_riepilogo_carrello_on, function(ev){
						if ($(ev.target).closest('#cart').length == 0 &&
							$(ev.target).closest('#cart-details').length == 0) {
							$('#cart').removeClass('show-details');
							$('body').removeClass('show-cart-details');
							$('#cart-details').removeClass('show');
							$('#cart-details').fadeOut(200);
							$(document).off(Params.hide_riepilogo_carrello_on);						
						}
					});
				}
			});
		}
		else {
			$('.cart-button').on('mouseover', function() {
				if (!$('#cart-details').hasClass('show')) {
					$(document).off(Params.hide_riepilogo_carrello_on);	
					
					$('#cart-preventivo').removeClass('show-details');
					$('#cart-preventivo-details').removeClass('show');
					$('#cart-preventivo-details').fadeOut(200);
					
					$('body').addClass('show-cart-details');
					$('#cart').addClass('show-details');
					$('#cart-details').addClass('show');
					$('#cart-details .cart-items-list').scrollTop(0);
					$('#cart-details').fadeIn();
					$(document).on(Params.hide_riepilogo_carrello_on, function(ev){
						if ($(ev.target).closest('#cart').length == 0 &&
							$(ev.target).closest('#cart-details').length == 0) {
							$('#cart').removeClass('show-details');
							$('body').removeClass('show-cart-details');
							$('#cart-details').removeClass('show');
							$('#cart-details').fadeOut(200);
							$(document).off(Params.hide_riepilogo_carrello_on);						
						}
					});
				}
			});		
		}		
	}

	$('body').on('click', '.action-item-buy-form', function() {	
		var list = [];
		var list_attr = [];
		$(this).closest('form').find('input,select,textarea').each(function(){ 
			var val = Utility.trim($(this).val());
			var label = $(this).attr('name');
			var c = $(this).closest('.field-content');
			if (c.find('label').length > 0) {
				label = c.find('label').text();
			}
			else if (c.find('.checkbox-label').length > 0) {
				label = c.find('.checkbox-label').text();
			}
			if (label) {
				label = Utility.trim(label.replace(/\*/gi, ''));
				label = label.replace(/\,/gi, '*');
			}
			if($(this).hasClass('valida-required')) {
				if(val == '') {
					list.push('"'+label+'"');
				}
			}
			list_attr.push('_extra_' + $(this).attr('name') + '##' + val + '#' + label);
		});
		if (list.length > 0) { 
			Utility.alert(Label.compilare_campi_articolo+' '+list.join(', '));
			return;
		}
		
		Loading.show();
		var cont = $(this).closest('.item-form-layer');
		var qta = cont.data('item-qta');
		var item_id = cont.data('item-id');
		$.xajax(Const.addToCartUrl, {
			data: {
				to_add: '',
				form: 'si',
				id: item_id,
				qta: qta,
				attr: list_attr.join(','),
				checkout: $('#checkout').length > 0 ? 'si' : ''
			},
			success: function(data) {
				if (typeof fbq === 'function') {
					fbq('track', 'AddToCart', {
						content_ids: [item_id],
						content_type: 'product'
					});
				}

				if (typeof pintrk === 'function') {
					pintrk('track', 'AddToCart', {
						product_id: [item_id],
						order_quantity: qta,
						currency: 'EUR'
					});
				}
				
				$('#cart').removeClass('loading');
				if (data.success) {
					if (data.ga4) {
						gtag('event', 'add_to_cart', {
							ecommerce: {
								items: data.ga4
							}
						});
					}
					
					$('body').trigger('update-info-cart', [data.cart]);
					if ($('#cart').length > 0 && $('#cart-details').length > 0) {
						$('#cart').attr('data-number', data.cart.number_qta);
						$('#cart .cart-button .item-number').html(data.cart.number_qta);
						$('#cart .cart-button .item-number-items').html(data.cart.number);
						$('#cart-details .item-number').html(data.cart.number_qta);
						$('#cart-details .item-number-items').html(data.cart.number);
						$('#cart-details').attr('data-number', data.cart.number_qta);
						$('#cart-details').attr('data-number-items', data.cart.number);
						$('#cart-details .cart-total-price').html(data.cart.total + ' ' + Params.currentValuta);
						$('#cart-details .cart-total-price-imponibile').html(data.cart.total_imponibile + ' ' + Params.currentValuta);
						$('#cart-details .cart-items-list').html(data.cart.details);
						if (data.cart.number_qta > 0) {
							$('#cart-link-cassa').addClass('show');
						}
						else {
							$('#cart-link-cassa').removeClass('show');
						}
					}
					
					$('.item-form-layer,.item-form-layer-overlay').remove();
					$('body').removeClass('item-form-show');	
					
					$('body').trigger('cart-update');
					$('body').trigger('checkout-reload-page');
					Loading.hide();
				}
				else {
					Loading.hide();
					data.message = data.message == null ? Label['non_possibile_aggiungere_carrello'] : data.message;
					$('body').message({message: data.message, type: 'error'});
				}
			},
			failure: function() {
				Loading.hide();
				$('#cart').removeClass('loading');
				$('body').message({message: Label['server_non_risponde_aggiungi_carrello'], type: 'error'});
			}
		});	
	});
	
	$('body').on('click', '.item-buy', function() {	
		var $this = $(this);
		var check = $this.closest('.item-buy-attribute-check');
		if (check.length > 0) {
			if (check.find('.item-buy-attribute').length != check.find('.item-buy-attribute-selected').length) {
				var list = [];
				check.find('.item-buy-attribute').each(function() {
					if ($(this).find('.item-buy-attribute-selected').length == 0) {
						list.push($(this).attr('data-attribute-label'));
					}
				});
				Utility.alert(Label['selezionare_personalizzazione_articolo'] + ' ' + list.join(', '));
				return;
			}
			
			var list = [];
			check.find('[data-field-buy]').each(function() {
				if ($(this).attr('data-field-buy-required') == 'true') {
					if (Utility.trim($(this).val()) == '') {
						list.push('"' + $(this).attr('data-field-buy') + '"');
					}
				}
			});
			if (list.length > 0) {
				Utility.alert(Label['compilare_campi_articolo'] + ' ' + list.join(', '));
				return;
			}
		}
		
		var isLayerToAdd = $this.closest('.list-items-to-add').length > 0;
		var item_id = $this.attr('data-id');
		var quantita = $this.closest('.item-buy-acquisto').find('.item-input-quantita');
		if ($this.closest('.block-articolo-speciale').length > 0 && quantita.length <= 0) {
			quantita = $('<input value="1">');
		}
		var wrapper = $this.closest('.item-buy-wrapper');
		if (wrapper.find('.item-img-buy').length) {
			var img = wrapper.find('.item-img-buy').attr('src');
		}
		else if (wrapper.find('.item-img-cart-layer').length) {
			var img = wrapper.find('.item-img-cart-layer').attr('src');
		}
		else {
			var img = wrapper.find('.item-img img').attr('src');
		}
		var title = wrapper.find('.item-buy-name').text();
		var price = wrapper.find('.item-buy-price').text();
		if (quantita.length > 0) {
			quantita = parseInt(quantita.val());
			if (quantita > 0) {
				var attributi = [];
				$this.closest('.item-buy-acquisto').find('[data-field-buy]').each(function() {
					var elem = $(this);
					var pers = elem.val();
					if (pers != null && pers != '') {
						pers = pers.replace(/#/gi, '');
						pers = pers.replace(/,/gi, '');
					}
					var id = elem.attr('name');
					var label = elem.attr('data-field-buy');
					if ($(this).prop('tagName').toLowerCase() == 'select') {
						if ($(this).find('option:selected').attr('data-field-buy-label')) {
							label = $(this).find('option:selected').attr('data-field-buy-label');
							id = elem.val();
						}
					}
					
					attributi.push({
						id: id,
						type: elem.attr('name'),
						description: '',
						label: label,
						pers: pers
					});
				});
				$this.closest('.item-buy-acquisto').find('.item-buy-attribute-selected').each(function() {
					var elem = $(this);
					var pers = elem.attr('data-attribute-pers');
					if (pers != null && pers != '') {
						pers = pers.replace(/#/gi, '');
						pers = pers.replace(/,/gi, '');
					}
					var pers_label = elem.attr('data-attribute-pers-label');
					if (pers_label != null && pers_label != '') {
						pers_label = pers_label.replace(/#/gi, '');
						pers_label = pers_label.replace(/\*/gi, '');
						pers_label = pers_label.replace(/\,/gi, '*');
					}
					attributi.push({
						id: elem.attr('data-id'),
						type: elem.attr('data-attribute-type'),
						description: elem.attr('data-attribute-description'),
						label: elem.attr('data-attribute-label'),
						pers_label: pers_label,
						pers: pers
					});
				});
				$this.closest('.item-buy-acquisto').find('input.attribute-type-by-value').each(function() {
					var elem = $(this);
					if (elem.val()) {
						var pers = elem.attr('data-attribute-pers');
						if (pers != null && pers != '') {
							pers = pers.replace(/#/gi, '');
							pers = pers.replace(/,/gi, '');
						}
						var pers_label = elem.attr('data-attribute-pers-label');
						if (pers_label != null && pers_label != '') {
							pers_label = pers_label.replace(/#/gi, '');
							pers_label = pers_label.replace(/\*/gi, '');
							pers_label = pers_label.replace(/\,/gi, '*');
						}
						attributi.push({
							id: elem.attr('data-id'),
							type: elem.attr('data-attribute-type'),
							description: elem.attr('data-attribute-description'),
							label: elem.attr('data-attribute-label'),
							pers_label: pers_label,
							pers: pers
						});
					}
				});
			
				addItemToCart(isLayerToAdd, item_id, quantita, title, img, price, attributi, $this.hasClass('item-buy-direct'), $this.hasClass('item-buy-no-layer'));
			}
			else {
				Utility.alert(Label['quantita_maggiore_zero']);
			}
		}
		else {
			var titlePart = title.toLowerCase().split('');
			var nomeProdottoGa = [];
			var check = 'qwertyuiopasdfghjklzxcvbnm1234567890';
			for (var i = 0; i < titlePart.length; i++) {
				if (check.indexOf(titlePart[i]) >= 0) {
					var c = titlePart[i];
				}
				else {
					var c = '_';
				}
				nomeProdottoGa.push(c);
			}
			nomeProdottoGa = nomeProdottoGa.join('');
			var html = [
				'<div class="item-quantita-to-add">',
					'<div class="text">', Label['indica_quantita_acquisto'],'</div>',
					'<div class="data">',
						'<input class="item-input-quantita valida-digitnumber" name="quantita" type="text" value="1">',
						'<a href="javascript:void(0)" onclick="_ga(\'send\', \'event\', \'carrello\', \'acquisto\', \'carrello_aggiunto_', nomeProdottoGa, '\')" class="add">', Label['btn_acquista'],'</a>',
					'</div>',
					'<div class="toolbar"><a href="javascript:void(0)">', Label['btn_annulla'],'</a></div>',
				'</div>'
			];

			var detailBox = $(html.join(''));
			$('body').append(detailBox);
			detailBox.center(wrapper.find('.button-buy'), {x: 'right', y: 'bottom'});
			detailBox.find('.toolbar a').click(function() {
				detailBox.fadeOut(200, function() {
					detailBox.remove();
				});
			});
			detailBox.find('.add').click(function() {
				quantita = detailBox.find('input');
				quantita = parseInt(quantita.val());
				if (quantita > 0) {
					detailBox.remove();
					addItemToCart(isLayerToAdd, item_id, quantita, title, img, price, null, $this.hasClass('item-buy-direct'), $this.hasClass('item-buy-no-layer'));
				}
				else {
					Utility.alert(Label['quantita_maggiore_zero']);
				}
			});
			detailBox.fadeIn();
		}
	});
	
	function add_rem_qta_item($this, qta) {
		var cont = $this.closest('.cart-item');
		var item_id = cont.attr('data-id');
		$('#cart').addClass('loading');
		$.xajax(Const.addRemQtaCartUrl, {
				data: {
					id: item_id,
					qta: qta
				},
				success: function(data) {
					$('#cart').removeClass('loading');
					if (data.success) {
						$('body').message(Label['conferma_quantita_modificata']);
						$('body').trigger('update-info-cart', [data.cart]);
						$('#cart').attr('data-number', data.cart.number_qta);
						$('#cart .cart-button .item-number').html(data.cart.number_qta);
						$('#cart .cart-button .item-number-items').html(data.cart.number);
						$('#cart-details .item-number').html(data.cart.number_qta);
						$('#cart-details .item-number-items').html(data.cart.number);
						$('#cart-details .cart-total-price').html(data.cart.total + ' ' + Params.currentValuta);
						$('#cart-details .cart-total-price-imponibile').html(data.cart.total_imponibile + ' ' + Params.currentValuta);
						$('#cart-details .cart-items-list').html(data.cart.details);
						if (data.cart.number_qta > 0) {
							$('#cart-link-cassa').addClass('show');
						}
						else {
							$('#cart-link-cassa').removeClass('show');
						}
						$('body').trigger('cart-update');
					}
					else {
						data.message = data.message == null ? Label['non_possibile_modificare_quantita_nel_carrello'] : data.message;
						$('body').message({message: data.message, type: 'error'});
					}
				},
				failure: function() {
					$('#cart').removeClass('loading');
					$('body').message({message: Label['server_non_risponde_rimuovi_carrello'], type: 'error'});
				}
			});
	}
	
	
	$('body').on('click', '.action-rem-preferiti', function() {
		Loading.show();
		var $this = $(this);
		var id = $this.attr('data-id');
		$.xajax('/cart/rem-preferiti.php', {
				data: {
					id: id,
					_lang: Params.url_lang
				},
				success: function(data) {
					Loading.hide();
					if (data.success) {
						$this.parent().removeClass('item-is-preferito');
						$('body').message({message: Label['articolo_rimosso_preferiti']});
					}
					else {
						$('body').message({message: Label['server_non_risponde'], type: 'error'});
					}
				},
				failure: function() {
					Loading.hide();
					$('body').message({message: Label['server_non_risponde'], type: 'error'});
				}
			});			
	});
	
	$('body').on('click', '.action-add-preferiti', function() {
		Loading.show();
		var $this = $(this);
		var id = $this.attr('data-id');
		$.xajax('/cart/add-preferiti.php', {
				data: {
					id: id,
					_lang: Params.url_lang
				},
				success: function(data) {
					Loading.hide();
					if (data.success) {
						if (data.ga4) {
							gtag('event', 'add_to_wishlist', {
								ecommerce: {
									items: data.ga4
								}
							});
						}
						$this.parent().addClass('item-is-preferito');
						$('body').message({message: Label['articolo_aggiunto_preferiti']});
					}
					else {
						$('body').message({message: Label['server_non_risponde'], type: 'error'});
					}
				},
				failure: function() {
					Loading.hide();
					$('body').message({message: Label['server_non_risponde'], type: 'error'});
				}
			});			
	});
	
	$('body').on('click', '.cart-item-add-qta', function() {
		add_rem_qta_item($(this), 1);
	});
	$('body').on('click', '.cart-item-rem-qta', function() {	
		add_rem_qta_item($(this), -1);
	});
	
	if (Params.timeout_carrello) {
		$('body').on('cart-update', function() {
			$.xajax('/cart/timeout-carrello', {
					dataType: 'html',
					data: {
						_lang: Params.url_lang
					},
					success: function(data) {
						if (data) {
							$('.timeout-carrello').remove();
							$('body').append(data);
						}
					}
				});			
		});
		$('body').on('timeout-carrello-event', function(e, countdown) {
			if (countdown <= 1) {
				if ($('.timeout-carrello').hasClass('timeout-carrello-end')) {
					return;
				}
				$('.timeout-carrello').addClass('timeout-carrello-end');
				$('.timeout-carrello').remove();
				Utility.alert(Label.tempo_gestione_carrello_esaurito, 
						function() {
							Loading.show();
							location.reload();
						});
			}			
		});
	}
});