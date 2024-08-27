var Item = {
	menu_list: function ($this, onSelect) {
		$(document).off('click');
		if ($this.hasClass('current')) {
			var select = $this.closest('.item-select-list-dynamic').find('.select-list');
			if (select.length > 0) {
				select.animate({
					height: 'toggle'
				}, function() {
					$this.removeClass('selected');
					$(this).remove();
				});				
			}
			else {
				var wrap = $this.closest('.item-select-list-wrapper-unselect');
				if (wrap.length) {
					wrap.find('.item-select-list-dynamic .selected').removeClass('selected');
					wrap.find('.item-select-list-dynamic .select-list').remove();
				}
				$this.addClass('selected');
				select = $this.closest('ul').clone();
				select.find('.current').removeClass('current').removeClass('item-buy-attribute-selected').addClass('selected');
				select.removeClass('select-list-base').addClass('select-list').css({display: 'none'});
				$this.closest('.item-select-list-dynamic').append(select);
				select.animate({
					height: 'toggle'
				}, function() {
					setTimeout(function() {
						$(document).on('click', function() {
							$this.click();
						});
					}, 100);
				});
			}
		}
		else {
			if (onSelect) {
				onSelect($this.attr('data-id'));
			}
			var closest = $this.closest('.item-select-list-dynamic');
			closest.find('.current').removeClass('current').removeClass('item-buy-attribute-selected').removeClass('selected');
			closest.find('.select-list-base li[data-id=' + $this.attr('data-id') + ']').addClass('current').addClass('item-buy-attribute-selected');
			closest.find('.select-list').fadeOut(200, function() {
				$(this).remove();
			});
		}
	}
};
$(function(){
	$('body').on('click', '.action-3d', function() {
		var win = $([
			'<div class="item-3d">',
				'<iframe src="/assets/website/3d/', $(this).data('codice'), '.html" style="border:0px #ffffff none;" scrolling="no" frameborder="0" marginheight="0px" marginwidth="0px" height="426px" width="100%" allowfullscreen></iframe>',
				'<div class="item-3d-close"></div>',
			'</div>'
		].join(''));
		var width = 640;
		if (width > $(window).width()) {
			width = $(window).width();
		}
		win.css({width: width, height: 426});
		win.find('.item-3d-close').on('click', function() {
			$('body').removeClass('item-3d-overlay');
			win.remove();
		});
		$('body').addClass('item-3d-overlay');
		$('body').append(win);
	});
	
	$('body').on('click', '.accessori-custodia ul .menu-link', function() {
		if ($(window).width() <= 630) {
			if ($(this).hasClass('selected-mobile')) {
				$(this).removeClass('selected-mobile');
				$(this).next('.accessori-custodia-list').remove();
			}
			else {
				$(this).addClass('selected-mobile');
				var list = $(this).closest('.accessori-custodia').find('.accessori-custodia-list[data-id="' + $(this).attr('data-id') + '"]').clone();
				$(this).parent().append(list);
				list.toggle();
			}
		}
		else {
			if ($(this).hasClass('selected')) {
				return;
			}
			var cont = $(this).closest('.accessori-custodia');
			cont.find('.show').removeClass('show').css({display: 'none'});
			cont.find('.accessori-custodia-list[data-id="' + $(this).attr('data-id') + '"]').addClass('show').fadeIn();
			$('.accessori-custodia ul a.selected').removeClass('selected');
			$(this).addClass('selected');	
		}
	});
	$('body').on('click', '.cambia-dynamic-type, .cambia-attributo', function() {
		Item.menu_list($(this));
	});
	$('body').on('click', '.cambia-variante', function() {
		var id = $(this).attr('data-id');
		Item.menu_list($(this), function() {
			Loading.show();
			location.href = '/' + Params.url_lang + '/item-articolo?id=' + id;
		});
	});

	$('.item-img-zoom').zoom();

	$('.item-thumb').on('click', function() {
		if ($(this).hasClass('selected')) {
			return;
		}
		$('.item-thumb.selected').removeClass('selected');
		$('.item-img-wrapper').css({display: 'none'});
		$($(this).attr('data-ref')).css({display: 'block'});
		$(this).addClass('selected');
	});

	function checkSliderImage() {
		let img_slider = $('.item-img-slider');
		let img_col_inner = $('.item-page .item-img-coll-inner');
		let img_list_slider = $('.item-page .item-img-coll-inner .card, .item-img-slider .card');

		if ($(window).width() <= 630) {
			if ($('#slider-item-page').length) {
				return;
			}
			img_slider.append(img_list_slider);
		} else {
			if ($('.item-page .item-img-coll-inner .card').length) {
				return;
			}
			img_col_inner.prepend(img_list_slider);
		}
	}

	if ($('body').hasClass('touch')) {
		function initMySwipe() {
			document.addEventListener('touchstart', handleTouchStart, false);        
			document.addEventListener('touchmove', handleTouchMove, false);

			var xDown = null;                                                        
			var yDown = null;                                                        

			function handleTouchStart(evt) {                                         
				xDown = evt.touches[0].clientX;                                      
				yDown = evt.touches[0].clientY;                                      
			};                                                

			function handleTouchMove(evt) {	
				if (evt.touches.length > 1) {
					xDown = null;
					yDown = null;
					return;
				}
				
				if ( ! xDown || ! yDown ) {
					return;
				}

				var xUp = evt.touches[0].clientX;                                    
				var yUp = evt.touches[0].clientY;

				var xDiff = xDown - xUp;
				var yDiff = yDown - yUp;
				
				if ( Math.abs( xDiff ) > (Math.abs( yDiff )*1.1) ) {
					if ( xDiff > 0 ) {
						$('body').trigger('swipeleft');
					} 
					else {
						$('body').trigger('swiperight');
					}                       
				}
				xDown = null;
				yDown = null;                                             
			};	
		}
		
		initMySwipe();
	
		function swipeImage(dir) {
			var wrap = $('#slider-item-page');
			if (wrap.length == 0 || wrap.find('.item-img-wrapper').length <= 1) {
				return;
			}
			var num = wrap.find('.item-img-wrapper').length;
			var curr = wrap.attr('data-current');
			if (curr == null || curr == '') {
				curr = 0;
			}
			else {
				curr = parseInt(curr);
			}
			var next = curr + dir;
			if (next < 0 || next >= num) {
				return;
			}
			var left = $(window).width() * dir * -1;
			wrap.find('span.selected').removeClass('selected');
			wrap.find('.item-img-wrapper:eq(' + curr + ')').animate({
				left: left
			});
			left = $(window).width() * dir;
			wrap.find('.item-img-wrapper:eq(' + next + ')').css({left: left, display: 'block'}).animate({
				left: 0
			}, function() {
				wrap.find('span:eq(' + next + ')').addClass('selected');
			});
			wrap.attr('data-current', next);
		}

		$('body').on('swipeleft', function() {
			swipeImage(1);
		});
		$('body').on('swiperight', function() {
			swipeImage(-1);
		});
	}
		
	var rtime;
	var timeout = false;
	var delta = 200;
	$(window).resize(function() {
		rtime = new Date();
		if (timeout === false) {
			timeout = true;
			setTimeout(resizeend, delta);
		}
	});

	function resizeend() {
		if (new Date() - rtime < delta) {
			setTimeout(resizeend, delta);
		} else {
			timeout = false;
			checkSliderImage();
		}               
	}

	setTimeout(function() {
		checkSliderImage();
	}, 500);

	let slider_thumbs = $('.item-thumbs');
	slider_thumbs.slick({
		dots: false,
		infinite: true,
		speed: 300,
		slidesToShow: 4,
		slidesToScroll: 1,
		centerMode: false,
		variableWidth: true
	});

	// Rimuovi l'attributo aria-hidden dopo l'inizializzazione di Slick
	slider_thumbs.on('init', function(event, slick){
		$('.item-thumbs [aria-hidden="true"]').removeAttr('aria-hidden');
	});
	
	$('.commenti-facebook').slick({
		dots: false,
		infinite: true,
		initialSlide: 0,
		speed: 300,
		slidesToShow: 1,
		adaptiveHeight: true,
		autoplay: false,
		responsive: [
			{
				breakpoint: 480,
				settings: {
					arrows: false,
					dots: true
				}
			}
		]
	});
	
	$('body').on('change', '.action-step-show-button-on-change', function() {
		if ($(this).val() == '') {
			$(this).closest('.step').addClass('hide-button');
		}
		else {
			$(this).closest('.step').removeClass('hide-button');
		}
	});
	$('body').on('click', '.action-details-kit', function() {
		var cont = $(this).closest('.action-details-wrapper');
		if (cont.hasClass('expand')) {
			cont.find('.action-details').css({display: 'none'});
			cont.removeClass('expand');
		}
		else {
			cont.find('.action-details').fadeIn();
			cont.addClass('expand');
		}
	});
	
	var _listAllObiettivoOption = null;
	$('body').on('click', '.action-step-filtro-obiettivo', function() {
		if ($(this).hasClass('selected')) {
			$(this).removeClass('selected');
		}
		else {
			$(this).addClass('selected');
		}
		var cont = $(this).closest('.step');
		var listBrandId = [];
		cont.find('.field-line-filtro-brand-list-item.selected').each(function() {
			listBrandId.push($(this).data('id'));
		});
		
		if (_listAllObiettivoOption == null) {
			_listAllObiettivoOption = cont.find('[name="id_obiettivo"] option').clone();
		}
		
		cont.find('[name="id_obiettivo"] option').remove();
		cont.find('[name="id_obiettivo"]').append('<option value=""></option>');
		if (listBrandId.length > 0) {
			_listAllObiettivoOption.each(function() {
				var brandId = $(this).data('brand-id');
				if (brandId) {
					var $this = $(this);
					listBrandId.forEach((val) => {
						if ((val + '') == (brandId + '')) {
							cont.find('[name="id_obiettivo"]').append($this.clone());
						}
					});
				}
			});
		}
		else {
			_listAllObiettivoOption.each(function() {
				cont.find('[name="id_obiettivo"]').append($(this).clone());
			});
		}
		cont.find('[name="id_obiettivo"]').val('');
		cont.find('[name="id_obiettivo"]').trigger('change');
	});
	
	$('body').on('change', '.action-step-seleziona-obiettivo', function() {
		$('.step-elenco-kit-oblo').html('');
		if ($(this).val() == '') {
			$(this).closest('.step').addClass('hide-button');
		}
		else {
			$(this).closest('.step').removeClass('hide-button');
			Loading.show();
			var id_obiettivo = $(this).val();
			var id_fotocamera = $('.layer-menu-wrapper .item-acquista-step [data-step=1] select').val();
			var per_articolo = $('.layer-menu-wrapper .item-acquista-step').attr('data-codice');
			$('.step-elenco-kit-oblo').load('/cart/step/list-kit-oblo', 
				{
					_lang: Params.url_lang,
					id_fotocamera: id_fotocamera,
					id_obiettivo: id_obiettivo,
					per_articolo: per_articolo
				}, 
				function() {
					Loading.hide();
				});
		}
	});
	
	function add_item(item, step, check_exists) {
		check_exists = check_exists == null ? false : check_exists;
		if (check_exists) {
			$('.layer-menu-wrapper .step-header-accessori .step-header-accessorio-item[data-id=' + item.id + '][data-type=' + item.type + ']').remove();
		}
		var elem = $('<div class="step-header-accessorio-item" data-type="' + (item.type ? item.type : '') + '" data-id="' + item.id + '" data-step="' + step + '"/>');
		elem.append('<div class="step-header-img">' + (item.img ? '<img src="' + item.img + '">' : '') + '</div>');
		elem.append('<div class="step-header-nome"><strong>' + item.nome + '</strong></div>');
		elem.append('<div class="step-header-prezzo" data-prezzo="' + (item.prezzo ? item.prezzo : '') + '"><span>' + (item.prezzo_euro ? item.prezzo_euro : '') + '</span></div>');
		if (item.prezzo) {
			elem.append('<div class="step-header-delete"><img src="/assets/website/img/ico-close.png"></div>');
		}
		$('.layer-menu-wrapper .step-header-accessori').append(elem);
		elem.fadeIn();
	}
	
	function ricalcola_prezzo() {
		var prezzo = 0;
		$('.layer-menu-wrapper .step-header-calcolo-prezzo .step-header-prezzo[data-prezzo]').each(function() {
			var p = $(this).attr('data-prezzo');
			if (p && !isNaN(p)) {
				prezzo += parseFloat($(this).attr('data-prezzo'));
			}	
		});
		$('.layer-menu-wrapper .item-acquista-step .step-header .step-header-prezzo .prezzo').html(prezzo.toLocaleString('it-IT', {style: 'currency', currency: 'EUR'}));
		$('.layer-menu-wrapper .step-header-calcolo-prezzo').attr('data-count', $('.layer-menu-wrapper .step-header-accessorio-item').length);
	}
	
	function step_confirm(text, action_yes, action_no) {
		$('.step-dialog-elem').remove();
		var html = [
			'<div class="step-dialog step-dialog-elem">',
				'<div class="step-dialog-inner">',
					'<div class="step-dialog-text">',
						text,
					'</div>',					
					'<div class="step-dialog-button-bar">',
						'<button class="step-dialog-button step-dialog-button-no">', Label['no'],'</button>',
						'<button class="step-dialog-button step-dialog-button-yes">', Label['si'],'</button>',
					'</div>',
				'</div>',
			'</div>'
		];
		var box = $(html.join(''));
		var overlay = $('<div class="step-dialog-overlay step-dialog-elem"/>');

		$('body').append(overlay);
		$('body').append(box);
		box.find('.step-dialog-button-no').on('click', function() {
			$('.step-dialog-elem').fadeOut(function() {
				$(this).remove();
			});
			action_no();
		});
		box.find('.step-dialog-button-yes').on('click', function() {
			$('.step-dialog-elem').fadeOut(function() {
				$(this).remove();
			});
			action_yes();
		});
		box.fadeIn();
	}
	
	$('body').on('click', '.item-acquista-step .step-header-delete', function() {
		$(this).closest('.step-header-accessorio-item').fadeOut(function() {
			$(this).remove();
			ricalcola_prezzo();
		});
	});
	$('body').on('click', '.item-acquista-step .item-kit .item-kit-sub-checkbox', function() {
		if ($(this).hasClass('checked')) {
			$(this).removeClass('checked');
		}
		else {
			$(this).addClass('checked');
		}
		var cont = $(this).closest('.item-kit');
		if (cont.find('.item-kit-sub-checkbox').length == cont.find('.item-kit-sub-checkbox.checked').length) {
			cont.removeClass('item-kit-add-from-checkbox');
		}
		else {
			cont.addClass('item-kit-add-from-checkbox');
		}
	});
	
	$('body').on('click', '.item-acquista-step .step .add-item', function() {
		var $this = $(this);
		var step = $(this).closest('.step');
		
		function aggiungi(elems) {
			for (var i = 0; i < elems.length; i++) {
				var item = {
					id: elems[i].attr('data-id'),
					type: elems[i].attr('data-type'),
					img: elems[i].attr('data-img'),
					prezzo: elems[i].attr('data-prezzo'),
					prezzo_euro: elems[i].attr('data-prezzo-euro'),
					nome: elems[i].attr('data-nome')
				};			
				add_item(item, step.attr('data-step'));
			}
			ricalcola_prezzo();
			$('body').message({message: Label['to_add_articolo_aggiunto']});
			var url = $this.attr('data-url');
			if (url != null && url != '') {
				var next = function(data) {
					$('.layer-menu-wrapper .item-acquista-step').loadNextStepAcquista(url, data);
				};
			}
			else {
				var next = function() {};
			}
			
			switch ($this.attr('data-callback')) {
			case 'param_selezione_obiettivo':
				var data = {
					id_fotocamera: step.closest('.item-acquista-step').find('[data-step=1] select').val(),
					per_articolo: $('.layer-menu-wrapper .item-acquista-step').attr('data-codice')
				};
				next(data);
				break;	
			case 'accessorio_video':
				step_confirm(Label['richiesta_aggiunta_altro_video'], 
					function() {},
					next);
				break;
			case 'accessorio_batteria':
				step_confirm(Label['richiesta_aggiunta_altro_batteria'], 
					function() {},
					next);
				break;
			case 'accessorio_trigger':
				step_confirm(Label['richiesta_aggiunta_altro_trigger'], 
					function() {},
					next);
				break;
			case 'accessorio':
				$this.closest('.step-item-accessorio').fadeOut();
				break;
			case 'luci':
				if ($('.step-header-accessori .step-header-accessorio-item[data-type=luci]').length == 1) {
					step_confirm(Label['richiesta_aggiunta_seconda_luce'], 
						function() {

						},
						next);					
				}
				else {
					next();
				}
				break;
			case 'bracci':
				if ($('.layer-menu-wrapper .step-header-accessori .step-header-accessorio-item[data-type=kit_bracci]').length == 1) {
					var txt = $('.layer-menu-wrapper .step-header-accessori .step-header-accessorio-item[data-type=luci]').length <= 1 ? 'richiesta_aggiunta_secondo_braccio' : 'richiesta_aggiunta_secondo_braccio_2_luci';
					step_confirm(Label[txt], 
						function() {

						},
						next);
				}
				else {
					next();
				}
				break;
			case 'oblo':
				function reset_oblo() {
					step.find('.action-step-seleziona-obiettivo').val('');
					step.find('.keypress').removeClass('keypress');
					step.find('.step-elenco-kit-oblo').html('');
				}
				
				var value = step.find('select').val();
				var opt = step.find('select option[value=' + value + ']');
				item = {
					id: value,
					nome: opt.text(),
					type: 'select_obiettivo'
				};
				add_item(item, step.attr('data-step'), true);
				
				step_confirm(Label['richiesta_aggiunta_altro_kit'], 
					reset_oblo,
					function() {
						reset_oblo();
						next();
					});
				break;
			default:
				next();
			}
		}
				
		if ($this.hasClass('item-kit-add-checkbox')) {
			var elems = [];
			var check_elems = [];
			var kit = $this.closest('.item-kit');
			kit.find('.item-kit-sub-checkbox.checked').each(function() {
				elems.push($(this));
				var id = $(this).attr('data-id');
				if ($('.step-header-accessori .step-header-accessorio-item[data-id="' + id + '"]:not([data-type="select_obiettivo"])').length > 0) {
					check_elems.push($(this).attr('data-nome'));
				}
			});
			kit.removeClass('item-kit-add-from-checkbox').removeClass('expand');
			
			if (check_elems.length == 0) {
				aggiungi(elems);
			}
			else {
				step_confirm(Label['articoli_gia_presenti'].replace('%articoli%', check_elems.join('<br>')), 
					function() {
						aggiungi(elems);
					},
					function() {});	
			}
		}
		else {
			aggiungi([$this]);
		}

	});	

	$('body').on('click', '.item-acquista-step .step .next', function() {		
		var step = $(this).closest('.step');
		var item_id = $('.layer-menu-wrapper .item-acquista-step').attr('data-id');
		
		var data = {};
		var list_callback = $(this).attr('data-callback');
		if (list_callback) {
			list_callback = list_callback.split(',');
			for (var i = 0; i < list_callback.length; i++) {
				var item = null;
				switch (list_callback[i]) {
				case 'param_fotocamera':
					data.id_fotocamera = step.closest('.item-acquista-step').find('[data-step=1] select').val();
					break;				
				case 'param_brand_fotocamera':
					data.id_brand_fotocamera = $(this).attr('value');
					break;				
				case 'param_cellulare':
					data.id_cellulare = step.closest('.item-acquista-step').find('[data-step=0] select').val();
					break;				
				case 'accessorio_trigger':
				case 'param_articolo_luce':
					var list_id = [];
					$('.layer-menu-wrapper .step-header-accessori [data-type="luci"]').each(function() {
						list_id.push($(this).attr('data-id'));
					});
					data.id_luce = list_id.join(',');
					break;
				case 'param_articolo':
					data.id_articolo = item_id;
					break;
				case 'combo_value':
					var value = step.find('select').val();
					if (value) {
						var opt = step.find('select option[value="' + value + '"]');
						item = {
							nome: opt.text(),
							type: step.find('select').attr('data-type')
						};
					}
					break;
				case 'add-item':
					var elem = step.find('.item-data');
					item = {
						id: elem.attr('data-id'),
						type: elem.attr('data-type'),
						img: elem.attr('data-img'),
						prezzo: elem.attr('data-prezzo'),
						prezzo_euro: elem.attr('data-prezzo-euro'),
						nome: elem.text()
					};
					break;
				}
				if (item) {
					add_item(item, step.attr('data-step'));
					ricalcola_prezzo();
					$('body').message({message: Label['to_add_articolo_aggiunto']});
				}	
			}
		}

		data.per_articolo = $('.layer-menu-wrapper .item-acquista-step').attr('data-codice');
		
		var url = $(this).attr('data-url');
		if (url == '_acquista_') {		
			var attr = [];
			var cont = $('.layer-menu-wrapper .step-header-accessorio-item[data-step=1]');
			attr.push(cont.attr('data-type') + '#interno#' +  cont.find('.step-header-nome strong').text());
			
			var text = [];
			$('.layer-menu-wrapper .step-header-accessorio-item[data-type="select_obiettivo"] .step-header-nome strong').each(function() {
				text.push($(this).text());
			});
			if (text.length > 0) {
				attr.push('obiettivo#interno#' + text.join(' - '));
			}

			$('.layer-menu-wrapper .step-header-accessorio-item[data-type="cellulare"] .step-header-nome strong').each(function() {
				attr.push('cellulare#interno#' + $(this).text());
			});
					
			var list_data = [
				{
					to_add: '',
					id: item_id,
					qta: 1,
					attr: attr.join(',')
				}
			];  
			$('.layer-menu-wrapper .step-header-accessorio-item').each(function() {
				var id = $(this).attr('data-id');
				if (id != null && id != '' && id != 'undefined' && $(this).attr('data-type') != 'select_obiettivo') {
					list_data.push({
							id: id,
							qta: 1,
							attr: ''
						});
				}
			});
			
			Loading.show();			
			$.xajax(Const.addToCartUrl, {
					data: {
						to_add: '',
						data: JSON.stringify(list_data)
					},
					success: function(data) {
						if (data.success) {
							location.href = Const.cartIndex;
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
		}
		else {
			$('.layer-menu-wrapper .item-acquista-step').loadNextStepAcquista(url, data);
		}
	});
	
	$('body').on('click', '.item-acquista-step .step .prev', function() {
		var curr = $(this).closest('.step');
		var prev = curr.prev();
		curr.remove();
		if (!prev.hasClass('step-no-clear')) {
			$('.layer-menu-wrapper .step-header-accessorio-item[data-step=' + prev.attr('data-step') + ']').remove();
		}
		$('.layer-menu-wrapper .item-acquista-step').attr('data-current-step', prev.attr('data-step'));
		ricalcola_prezzo();
		setTimeout(function() {
			prev.fadeIn();
		}, 250);	
	});
	
	$('.tab-mobile [data-tab-rif]').on('click', function() {
		var rif = $(this).attr('data-tab-rif');
		var cont = $(this).closest('.tab-mobile');
		var tab = cont.find('[data-tab="' + rif + '"]');
		if ($(this).hasClass('show')) {
			tab.fadeOut();
			$(this).removeClass('show');
		}
		else {
			tab.fadeIn();
			$(this).addClass('show');
		}
	});
	
	var i = 0;
	$('.tab-open-first > [data-tab-rif]').each(function() {
		if (i < 2) {
			$(this).trigger('click');
		}
		i++;
	});

	const carosello = $('.list-video');
	function numberSlidesToShow() {
		const windowWidth = window.innerWidth;
		if (windowWidth >= 1440) return 5;
		if (windowWidth >= 992) return 4;
		if (windowWidth >= 768) return 3;
		if (windowWidth >= 480) return 2;
		return 1;
	}
	if (!$(carosello).hasClass('slick-initialized')) {
		$(carosello).slick({
			slidesToShow: numberSlidesToShow(),
			arrows: true,
			dots: true,
			infinite: true,
			centerMode: false,
		});
	} else {
		$(carosello).slick('setPosition');
	}
	
	if ($('.item-gallery .item-img').length > 0) {
		$('.item-gallery').slick({
			dots: true,
			infinite: true,
			slidesToShow: 4,
			slidesToScroll: 1,
			autoplay: false,
			variableWidth: true,
			autoplaySpeed: 3000,
			arrows: false
		});
	}
	else {
		$('.item-gallery').remove();
	}
	
	$('body').on('click', '.zoom-image-action', function(e) {
		$('.zoom-wrapper').remove();
		var list_image = [];
		var current_image = 0;
		var current_src = $(this).find('.zoom-image').attr('src');
		$(this).closest('.zoom-image-list').find('img.zoom-image').each(function() {
			var src = $(this).attr('src');
			if (src == current_src) {
				current_image = list_image.length;
			}
			list_image.push(src);
		});
		
		var width = $(window).width();
		var height = $(window).height();
		if (width > 1200) {
			width = 1200;
		}
		if (height > 1200) {
			height = 1200;
		}
		width -= 20;
		height -= 40;
		var html = [
			'<div class="zoom-wrapper">',
			'<div class="zoom-close"></div>',
			'<div class="zoom-arrow zoom-arrow-left"></div>',
			'<img src="', current_src,'" style="max-height: 0px; max-width: 0px">',
			'<div class="zoom-arrow zoom-arrow-right"></div>',
			'</div>'
		];
		
		var wrapper = $(html.join(''));
		wrapper.css({top: e.pageY - $(document).scrollTop(), left: e.pageX});
		$('body').append(wrapper);
		var img = wrapper.find('img');
		img.animate({
			maxWidth: width,
			maxHeight: height
		});
		wrapper.animate({
			bottom: 0,
			top: 0,
			left: 0,
			right: 0
		}, function() {
			$('body').addClass('zoom-image-show');
		});
		
		wrapper.find('.zoom-close').on('click', function(e) {
			$('body').removeClass('zoom-image-show');
			$('.zoom-wrapper').fadeOut(function() {
				$(this).remove();
			});
		});
		wrapper.find('.zoom-arrow-left').on('click', function(e) {
			if (current_image > 0) {
				current_image--;
			}
			else {
				current_image = list_image.length - 1;
			}
			img.attr('src', list_image[current_image]);
		});
		wrapper.find('.zoom-arrow-right').on('click', function(e) {
			if (current_image < list_image.length - 1) {
				current_image++;
			}
			else {
				current_image = 0;
			}
			img.attr('src', list_image[current_image]);
		});
	});

});



(function( $ ){	
	$.fn.loadNextStepAcquista = function (url, data) {
		url = (url == null || url == '') ? $(this).attr('data-url') : url;
		
		var $this = $(this);		
		var curr_num = $this.attr('data-current-step');
		if (curr_num == null || curr_num == '') {
			curr_num = 0;
		}
		else {
			curr_num = parseInt(curr_num) + 1;
		}
		if (curr_num > 0) {
			$this.closest('.item-acquista-step').find('.step[data-step=' + (curr_num - 1) + ']').css({display: 'none'});
		}

		data = data == null ? {} : data;
		data.id_articolo = $this.attr('data-id');
		data.id_attributo = $this.attr('data-attributo');
		data._lang = Params.url_lang;
		
		$this.attr('data-current-step', curr_num);
		var cont = $('<div/>');
		Loading.show();
		cont.load('/cart/step/' + url, 
			data, 
			function() {
				Loading.hide();
				var step = $(this).find('.step');
				step.attr('data-step', curr_num);	
				$this.find('[data-step="' + curr_num + '"]').remove();
				$this.append(step);
				step.find('.tab-wrapper').tab();
				step.fadeIn(300);
				if (step.find('h3').length > 0) {
					$('.layer-menu-wrapper .layer-menu-body').animate({
							scrollTop: step.find('h3').offset().top - 50
						}, 1000);
				}
				$(this).remove();
			});
	};
})( jQuery );
