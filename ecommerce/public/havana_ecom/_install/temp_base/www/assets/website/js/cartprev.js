$(function(){	
	function addItemToCartPreventivo(item_id, qta, name, img, price, attributi, vaiDirettoCassa) {
		vaiDirettoCassa = vaiDirettoCassa == null ? false : vaiDirettoCassa;
		
		attributi = attributi == null ? [] : attributi;
		var html = [
			'<div class="item-to-add-cart">',
				'<img src="', img, '">',
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
			listAttributo.push(attributi[i].type + '#' + attributi[i].id + attr_pers);
		}
		
		if (vaiDirettoCassa) {
			$('#cart-preventivo').addClass('loading');
			$.xajax(Const.addToCartPreventivoUrl, {
					data: {
						id: item_id,
						qta: qta,
						attr: listAttributo.join(',')
					},
					success: function(data) {
						location.href = Const.cartPreventivoIndex;
					}
				});
			return;
		}
		
		html.push('</div>');
		var animBox = $(html.join(''));
		$('body').append(animBox);
		animBox.center($('.item-buy-preventivo[data-id=' + item_id + ']'), {x: 'center', y: 'center'});
		var toOffset = $('#cart-preventivo').offset();
		var toTop = toOffset.top + $('#cart-preventivo').outerHeight()/2 - animBox.outerHeight()/2;
		var toLeft = toOffset.left + $('#cart-preventivo').outerWidth()/2 - animBox.outerWidth()/2;
		setTimeout(function() {
			animBox.animate({
				top: toTop + 'px',
				left: toLeft + 'px',
				opacity: .25
			}, 800, function() {
				$('#cart-preventivo').addClass('loading');
				$.xajax(Const.addToCartPreventivoUrl, {
						data: {
							id: item_id,
							qta: qta,
							attr: listAttributo.join(',')
						},
						success: function(data) {
							$('#cart-preventivo').removeClass('loading');
							if (data.success) {
								var timeout = Params.timeout_add_to_cart_message;
								if (timeout > 0) {
									$('body').message('"' + name + '" ' + Label['aggiunto_preventivo'], timeout, true);
								}
								if ($('#cart-preventivo').length > 0 && $('#cart-preventivo-details').length > 0) {
									$('#cart-preventivo .cart-preventivo-button .item-number').html(data.cart_prev.number_qta);
									$('#cart-preventivo-details .item-number').html(data.cart_prev.number_qta);
									$('#cart-preventivo-details .cart-total-price').html(data.cart_prev.total);
									$('#cart-preventivo-details .cart-total-price-imponibile').html(data.cart_prev.total_imponibile);
									$('#cart-preventivo-details .cart-items-list').html(data.cart_prev.details);
								}
								
								$('body').trigger('cart-preventivo-update');
								$('body').trigger('checkout-preventivo-reload-page');
							}
							else {
								data.message = data.message == null ? Label['non_possibile_aggiungere_preventivo'] : data.message;
								$('body').message({message: data.message, type: 'error'});
							}
						},
						failure: function() {
							$('#cart-preventivo').removeClass('loading');
							$('body').message({message: Label['server_non_risponde_aggiungi_carrello'], type: 'error'});
						}
					});			
				animBox.fadeOut(300, function() {
					animBox.remove();
				});
			});
		}, 500);
	}
	
	$('body').on('click', '.btn-delete-cart-preventivo-item', function() {
		var item_id = $(this).attr('data-id');
		$('#cart-preventivo').addClass('loading');
		$.xajax(Const.removeFromCartPreventivoUrl, {
				data: {
					id: item_id
				},
				success: function(data) {
					$('#cart-preventivo').removeClass('loading');
					if (data.success) {
						$('body').message(Label['conferma_eliminato_articolo_preventivo']);
						$('#cart-preventivo .cart-preventivo-button .item-number').html(data.cart_prev.number_qta);
						$('#cart-preventivo-details .item-number').html(data.cart_prev.number_qta);
						$('#cart-preventivo-details .cart-total-price').html(data.cart_prev.total);
						$('#cart-preventivo-details .cart-total-price-imponibile').html(data.cart_prev.total_imponibile);
						$('#cart-preventivo-details .cart-items-list').html(data.cart_prev.details);
						$('body').trigger('cart-preventivo-update');
					}
					else {
						data.message = data.message == null ? Label['non_possibile_rimuovere_preventivo'] : data.message;
						$('body').message({message: data.message, type: 'error'});
					}
				},
				failure: function() {
					$('#cart-preventivo').removeClass('loading');
					$('body').message({message: Label['server_non_risponde_rimuovi_carrello'], type: 'error'});
				}
			});
	});
	
	$('body').on('click', '.btn-vuota-carrello-preventivo', function() {
		if (Utility.confirm(Label['svuotare_preventivo'])) {
			$('#cart-preventivo').addClass('loading');
			
			$.xajax(Const.resetCartPreventivoUrl, {
					success: function(data) {
						$('#cart-preventivo .cart-preventivo-button .item-number').html(data.cart_prev.number_qta);
						$('#cart-preventivo-details .item-number').html(data.cart_prev.number_qta);
						$('#cart-preventivo-details .cart-total-price').html(data.cart_prev.total);
						$('#cart-preventivo-details .cart-total-price-imponibile').html(data.cart_prev.total_imponibile);
						$('#cart-preventivo-details .cart-items-list').html(data.cart_prev.details);
						$('#cart-preventivo').removeClass('loading');
						$('body').message(Label['preventivo_svuotato']);
						$('body').trigger('cart-preventivo-update');
						$('body').trigger('cart-preventivo-void');
						
						if ($('#cart-preventivo-details').hasClass('show')) {
							$(document).off(Params.hide_riepilogo_carrello_on);	
							$('#cart-preventivo').removeClass('show-details');
							$('#cart-preventivo-details').removeClass('show');
							$('#cart-preventivo-details').fadeOut(200);
						}
					},
					failure: function() {
						$('#cart-preventivo').removeClass('loading');
						$('body').message({message: Label['server_non_risponde_vuota_carrello'], type: 'error'});
					}
				});	
		}
	});
	if (Utility.isMobile() || true) {
		Params.show_riepilogo_carrello_on = 'click';
		Params.hide_riepilogo_carrello_on = 'mousedown';
	}
	if (Params.hide_riepilogo_carrello_on == null) {
		Params.hide_riepilogo_carrello_on = 'mousedown';
	}
	if (Params.show_riepilogo_carrello_on == 'click') {
		$('.cart-preventivo-button').on('click', function() {
			if ($('#cart-preventivo-details').hasClass('show')) {
				$(document).off(Params.hide_riepilogo_carrello_on);	
				$('#cart-preventivo').removeClass('show-details');
				$('#cart-preventivo-details').removeClass('show');
				$('#cart-preventivo-details').fadeOut(200);
			}
			else {
				$(document).off(Params.hide_riepilogo_carrello_on);	
				
				$('#cart').removeClass('show-details');
				$('#cart-details').removeClass('show');
				$('#cart-details').fadeOut(200);
				
				$('#cart-preventivo').addClass('show-details');
				$('#cart-preventivo-details').addClass('show');
				$('#cart-preventivo-details .cart-items-list').scrollTop(0);
				$('#cart-preventivo-details').fadeIn();
				$(document).on(Params.hide_riepilogo_carrello_on, function(ev){
					if ($(ev.target).closest('#cart-preventivo').length == 0) {
						$('#cart-preventivo').removeClass('show-details');
						$('#cart-preventivo-details').removeClass('show');
						$('#cart-preventivo-details').fadeOut(200);
						$(document).off(Params.hide_riepilogo_carrello_on);						
					}
				});
			}
		});
	}
	else {
		$('.cart-preventivo-button').on('mouseover', function() {
			if (!$('#cart-preventivo-details').hasClass('show')) {
				$(document).off(Params.hide_riepilogo_carrello_on);	
				
				$('#cart').removeClass('show-details');
				$('#cart-details').removeClass('show');
				$('#cart-details').fadeOut(200);
				
				$('#cart-preventivo').addClass('show-details');
				$('#cart-preventivo-details').addClass('show');
				$('#cart-preventivo-details .cart-items-list').scrollTop(0);
				$('#cart-preventivo-details').fadeIn();
				$(document).on(Params.hide_riepilogo_carrello_on, function(ev){
					if ($(ev.target).closest('#cart-preventivo').length == 0) {
						$('#cart-preventivo').removeClass('show-details');
						$('#cart-preventivo-details').removeClass('show');
						$('#cart-preventivo-details').fadeOut(200);
						$(document).off(Params.hide_riepilogo_carrello_on);						
					}
				});
			}
		});		
	}
	
	$('body').on('click', '.item-buy-preventivo', function() {	
		var $this = $(this);
		
		var item_id = $this.attr('data-id');
		var quantita = $this.closest('.item-buy-acquisto').find('.item-input-quantita');
		var wrapper = $this.closest('.item-buy-wrapper');
		var img = wrapper.find('.item-img img').attr('src');
		var title = wrapper.find('.item-buy-name').text();
		var price = wrapper.find('.item-buy-price').text();
		if (quantita.length > 0) {
			quantita = parseInt(quantita.val());
			if (quantita > 0) {
				var attributi = [];
				$this.closest('.item-buy-acquisto').find('.item-buy-attribute-selected').each(function() {
					var elem = $(this);
					var pers = elem.attr('data-attribute-pers');
					if (pers != null && pers != '') {
						pers = pers.replace(/#/gi, '');
						pers = pers.replace(/,/gi, '');
					}
					attributi.push({
						id: elem.attr('data-id'),
						type: elem.attr('data-attribute-type'),
						description: elem.attr('data-attribute-description'),
						label: elem.attr('data-attribute-label'),
						pers: pers
					})
				});
			
				addItemToCartPreventivo(item_id, quantita, title, img, price, attributi, $this.hasClass('item-buy-direct'));
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
						'<a href="javascript:void(0)" onclick="ga(\'send\', \'event\', \'carrello\', \'acquisto\', \'carrello_aggiunto_', nomeProdottoGa, '\')" class="add">', Label['btn_aggiungi_preventivo'],'</a>',
					'</div>',
					'<div class="toolbar"><a href="javascript:void(0)">', Label['btn_annulla'],'</a></div>',
				'</div>'
			];

			var detailBox = $(html.join(''));
			$('body').append(detailBox);
			detailBox.center(wrapper.find('.button-buy-preventivo'), {x: 'right', y: 'bottom'});
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
					addItemToCartPreventivo(item_id, quantita, title, img, price);
				}
				else {
					Utility.alert(Label['quantita_maggiore_zero']);
				}
			});
			detailBox.fadeIn();
		}
	});
	
	function add_rem_qta_item_preventivo($this, qta) {
		var cont = $this.closest('.cart-item');
		var item_id = cont.attr('data-id');
		$('#cart-preventivo').addClass('loading');
		$.xajax(Const.addRemQtaCartPreventivoUrl, {
				data: {
					id: item_id,
					qta: qta
				},
				success: function(data) {
					$('#cart-preventivo').removeClass('loading');
					if (data.success) {
						$('body').message(Label['conferma_quantita_modificata']);
						$('#cart-preventivo .cart-preventivo-button .item-number').html(data.cart_prev.number_qta);
						$('#cart-preventivo-details .item-number').html(data.cart_prev.number_qta);
						$('#cart-preventivo-details .cart-total-price').html(data.cart_prev.total);
						$('#cart-preventivo-details .cart-total-price-imponibile').html(data.cart_prev.total_imponibile);
						$('#cart-preventivo-details .cart-items-list').html(data.cart_prev.details);
						$('body').trigger('cart-preventivo-update');
					}
					else {
						data.message = data.message == null ? Label['non_possibile_modificare_quantita_nel_carrello'] : data.message;
						$('body').message({message: data.message, type: 'error'});
					}
				},
				failure: function() {
					$('#cart-preventivo').removeClass('loading');
					$('body').message({message: Label['server_non_risponde_rimuovi_carrello'], type: 'error'});
				}
			});
	}
	
	$('body').on('click', '.cart-preventivo-item-add-qta', function() {
		add_rem_qta_item_preventivo($(this), 1);
	});
	$('body').on('click', '.cart-preventivo-item-rem-qta', function() {	
		add_rem_qta_item_preventivo($(this), -1);
	});
});