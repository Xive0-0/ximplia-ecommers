var Website = {
	max_size_categoria: 800,
	checkout_scroll_top: 150
};

(function( $ ){
	$.fn.dynamicImage = function() {
		var width = $(window).width();
		$(this).each(function() {
			var $this = $(this);
			$this.find('img[data-dynamic-image]').each(function() {
				var params = $(this).actionParams('data-dynamic-image');
				var src = $(this).attr('data-src');
				if (src == null || src == '') {
					src = $(this).attr('src');
				}
				if (params.check >= width) {
					var src_new = params.mobile;
				}
				else {
					var src_new = params.desktop;
				}
				if (src_new != $(this).attr('src')) {
					$(this).attr('src', src_new);
					$(this).attr('data-src', '');
					var wrap = $(this).closest('.data-dynamic-image');
					if (wrap.length > 0) {
						wrap.css({backgroundImage: 'url(\'' + src_new + '\')'});
					}
				}
			});
		});
		$('body').trigger('update-dynamic-image');
	};
	
	$.fn.tab = function() {
		$(this).each(function() {
			var $this = $(this);
			var open = $this.attr('data-default-open');
			$this.find('[data-tab-rif]').click(function() {
				if (open < 0 && $(this).hasClass('open')) {
					$this.find('[data-tab-rif].open').removeClass('open');
					$this.find('[data-tab]').css({display: 'none'});
				}
				else {
					if (!$(this).hasClass('open')) {
						$this.find('[data-tab-rif].open').removeClass('open');
						$(this).addClass('open');
						$this.find('[data-tab]').css({display: 'none'});
						$this.find('[data-tab=' + $(this).attr('data-tab-rif') + ']').css({display: 'block'});
					}
				}
			});
			if (open == null ||
				open == '') {
				open = 0;
			}
			else {
				open = open === 'no' ? -1 : open
			}
			if (open >= 0) {
				$this.find('[data-tab-rif]').eq(open).click();
			}
		});
		return $(this);
	};
	
	$.fn.autoupdate = function(param, url) {
		if (param != null) {
			switch(param) {
			case 'reset':
				$(this).trigger('autoupdate-reset');
				break;				
			case 'reload':
				$(this).trigger('autoupdate-reload', [url]);
				break;
			}
			return;
		}
		var opt = $(this).actionParams();
		var loading = $('<div class="autoupdate-loading"><img src="/assets/website/img/loading.gif" alt="loading"><span>' + Label['caricamento_in_corso'] + '</span></div>');
		loading.css({display: 'none'});
		if ($(this).find('.autoupdate-loading-wrapper').length) {
			$(this).find('.autoupdate-loading-wrapper').append(loading);
		}
		else {
			$(this).append(loading);
		}
		$this = $(this);
		
		function updateElementsHeight() {
			opt.elementsHeight = $this.outerHeight();
		}

		var inLoading = false;
		function loadOtherElements(force, url) {
			force = force == null ? false : force;
			if (!force && (inLoading || opt.totalElems == 0 || opt.numElems >= opt.totalElems)) {
				return;
			}
			inLoading = true;
			if (!$this.closest('.list-wrapper').hasClass('loading')) {
				loading.css({display: 'block'});
			}
			
			var params = {
				start: opt.numElems,
				autoload: true
			};
			var addParams = $this.attr('data-load-params');
			if (addParams != null && addParams != '') {
				var obj = $.parseJSON(addParams);
				params = $.extend(obj, params);
			}
			addParams = $this.attr('data-load-order');
			if (addParams != null && addParams != '') {
				var obj = $.parseJSON(addParams);
				params = $.extend(obj, params);
			}
			opt.url = url == null ? opt.url : url;
			$this.actionParams('data-action', {url: url}, true);
			
			var qry = [];
			if (params) {
				$.each(params, function(k, v) {
					if (k != 'autoload' && v) {
						qry.push(k + '=' + v);
					}
				});	
			}
			qry = qry.join('&');
			if (qry.length > 0) {
				qry = '?' + qry;
			}
			var url = opt.url + qry;
			$.xajax(opt.url, {
				data: params,
				dataType: 'html',
				success: function(data) {
					if ($this.closest('.list-wrapper').hasClass('loading')) {
						$this.find('.item-autoload').remove();
					}
					data = $('<div/>').append(data);
					$this.append(data.find('.item-autoload'));
					opt.totalElems = parseInt(data.find('#list-total-elements').html());
					$('#total-items').html(data.find('#list-num-details').html());
					updateNumElems();
					updateHeightWrapper();
					updateElementsHeight();
					inLoading = false;
					loading.css({display: 'none'});
					$this.closest('.list-wrapper').removeClass('loading');
					$this.find('.item-list-void').remove();
					if (opt.totalElems == 0) {
						$this.append('<div class="item-list-void">' + Label['non_ci_sono_prodotti_con_ricerca'] + '</div>');
					}
					$this.trigger('autoupdate-complete');
					history.replaceState(null, null, url);
				},
				failure: function() {
					loading.css({display: 'none'});
					inLoading = false;
				}
			});	
		}
		
		function updateHeightWrapper() {
			opt.height = $(window).height();
		}
		function updateNumElems() {
			opt.numElems = $this.find('.item-autoload').length;
		}
		
		function fillSpace() {
			if (opt.numElems < opt.totalElems && opt.height > opt.elementsHeight) {
				var elemHeight = opt.elementsHeight / opt.numElems;
				var num = Math.round(((opt.height - opt.elementsHeight) / elemHeight) * 1.5) + 1;
				inLoading = false;
				loadOtherElements(num);
			}
		}
		
		function reset() {
			inLoading = false;
			updateNumElems();		
			updateHeightWrapper();
			updateElementsHeight();
			fillSpace();
		}
		reset();
		$(document).scrollTop(0);

		$(document).on('scroll',function() {
			if (opt.numElems >= opt.totalElems) {
				return;
			}
			if (inLoading) {
				return;
			}
			var sth = 1.5 * ($(this).scrollTop() + opt.height);
			if (sth > opt.elementsHeight) {
				loadOtherElements();
			}
		});
		
		$(window).resize(function() {
			updateHeightWrapper();
			fillSpace();
		});
		$this.on('autoupdate-reset', function() {
			reset();
		});
		$this.on('autoupdate-reload', function(e, url) {
			$this.closest('.list-wrapper').addClass('loading');
			opt.numElems = 0;
			loadOtherElements(true, url);
		});
	};
})( jQuery );

$(function(){
	function isTouchDevice() {
		var el = document.createElement('div');
		el.setAttribute('ongesturestart', 'return;');
		if (typeof el.ongesturestart === "function") {
			return true;
		}
		el.setAttribute('ontouchstart', 'return;');
		return typeof el.ontouchstart === "function";
	}
	
	if (isTouchDevice()) {
		$('body').addClass('touch');
	}
	
	if ($('img[data-dynamic-image]').length > 0) {
		$('body').dynamicImage();
		$(window).resize(function() {
			$('body').dynamicImage();
		});			
	}
	
	if ($('[data-countdown]').length > 0) {
		var giorno = 24 * 60 * 60;
		var ore = 60 * 60;
		function aggiorna_countdown() {
			$('[data-countdown]').each(function() {
				if ($(this).attr('data-countdown') != null && $(this).attr('data-countdown') != '') {
					var contdown = parseInt($(this).attr('data-countdown'));
					contdown -= 1;
					var val = contdown;
					
					switch($(this).attr('data-format')) {
					case 'blocco':
						var format = function(gg, hh, mm, ss) {
							if (hh < 10) {
								hh = '0' + hh;
							}	
							if (mm < 10) {
								mm = '0' + mm;
							}	
							if (ss < 10) {
								ss = '0' + ss;
							}
							return [
								'<span data-type="gg">', gg,'</span>',
								'<span data-type="hh">', hh,'</span>',
								'<span data-type="mm">', mm,'</span>',
								'<span data-type="ss">', ss,'</span>',
							].join('');							
						}
						break;
					default:
						var format = function(gg, hh, mm, ss) {
							var res = '';
							if (gg > 0) {
								res = gg + 'g ';
							}
							res += hh + ':';
							if (mm < 10) {
								mm = '0' + mm;
							}
							res += mm + ':';	
							if (ss < 10) {
								ss = '0' + ss;
							}				
							res += ss;
							return res;
						}
						break;
					}
					
					var gg = 0;
					var hh = 0;
					var mm = 0;
					var ss = 0;
					if (val > giorno) {
						gg = Math.floor(val / giorno);
						val %= giorno;
					}
					hh = Math.floor(val / ore);
					val %= ore;
					mm = Math.floor(val / 60);
					val %= 60;					
					ss = val;
					
					$(this).html(format(gg, hh, mm, ss));
					$(this).attr('data-countdown', contdown);
					if ($(this).data('event')) {
						$('body').trigger($(this).data('event'), [contdown]);	
					}
				}
			});
			setTimeout(aggiorna_countdown, 1000);
		}
		setTimeout(aggiorna_countdown, 1000);
	}
	
	if ($('#search-list').length > 0) {
		$('#search-list').autoupdate();
		$('#search-paginazione').remove();

		var reload_first = false;
		var listId = Utility.location.getHash();
		if (listId != null && listId != '') {
			listId = listId.split(',');
			
			var list_az_id = [];
			var list_coll_id = [];
			for (var i = 0; i < listId.length; i++) {
				if (listId[i].length > 1) {
					var type = listId[i].substr(0, 1);
					var val = listId[i].substr(1);
					switch(type) {
					case 'a':
						type = 'az_id';
						list_az_id.push(val);
						break;
					default:
						type = 'coll_id';
						list_coll_id.push(val);
					}
					var obj = $('#search-filter .checkbox[data-value=' + val + '] input[name=' + type + ']');
					if (obj.length > 0) {
						obj.closest('.checkbox').addClass('checkbox-checked');
						obj.val(val);
						reload_first = true;
					}
				}
			}
			$('#search-filter input.search-fix-params-hash[name="coll_id"]').val(list_coll_id.join(','));
			$('#search-filter input.search-fix-params-hash[name="az_id"]').val(list_az_id.join(','));
			if ($('#search-filter input.search-fix-params-hash').length > 0 &&
				(list_coll_id.length > 0 || list_az_id.length > 0)) {
				var list = [];
				$('#search-list .item').remove();
				$('#search-list').attr('data-load-params', JSON.stringify({
						az_id: list_az_id.join(','),
						coll_id: list_coll_id.join(',')
					}));
				$('#search-list').trigger('update-filter', [list]);
				$('#search-list').autoupdate('reload');
			}
		}
		
		$('#search-list').on('update-filter', function(e, add, onComplete) {
			var params = {};
			var check_params = {};
			var filter = [];
			var listId = [];
			$('#search-filter input').each(function() {
				if ($(this).val() != '' &&
					check_params[$(this).attr('name') + '#' + $(this).val()] == null) {
					check_params[$(this).attr('name') + '#' + $(this).val()] = '#';
					if (params[$(this).attr('name')] == null) {
						params[$(this).attr('name')] = '';
					}
					else {
						params[$(this).attr('name')] += ',';
					}
					params[$(this).attr('name')] += $(this).val();
					if ($(this).attr('name') != 'query') {
						if ($(this).parent().hasClass('checkbox') || $(this).hasClass('search-fix-params')) {
							if ($(this).parent().hasClass('checkbox-checked') || $(this).hasClass('search-fix-params')) {
								switch($(this).attr('name')) {
								case 'az_id':
									var type = 'a';
									break;
								default:
									var type = 'c';
								}
								listId.push(type + $(this).val());
							}
							else {
								$(this).val('');
								return;
							}
							if ($(this).val() != '') {
								if ($('#search-filter-active li.simple[data-id="' + $(this).val() + '"][data-key="' + $(this).attr('name') + '"]').length > 0) {
									return;
								}	
							}
						}
						if ($(this).closest('li').length) {
							filter.push($(this).closest('li').clone());
						}
					}
				}
			});
			
			if (listId.length == 0) {
				Utility.location.resetHash();
			}
			else {
				Utility.location.setHash(listId.join(','));
			}
			if (add) {
				$('#search-filter-active li.simple').remove();
			}
			else {
				add = [];
				$('#search-filter-active li.simple').each(function() {
					var $this = $(this);
					add.push({
						id: $this.attr('data-id'),
						key: $this.attr('data-key')
					});
				});
			}
			for (var i = 0; i < add.length; i++) {
				if (add[i].id != null && add[i].id != '' && check_params[add[i].key + '#' + add[i].id] == null) {
					check_params[add[i].key + '#' + add[i].id] = '#';
					if (params[add[i].key] == null) {
						params[add[i].key] = '';
					}
					else {
						params[add[i].key] += ',';
					}
					params[add[i].key] += add[i].id;
					if ($('#search-filter-active li.simple[data-id=' + add[i].id + ']').length == 0) {
						filter.push('<li class="simple" data-id="' + add[i].id + '" data-key="' + add[i].key + '">' + add[i].label + '</li>');
					}
				}
			}

			if (filter.length > 0) {
				$('#search-filter-active li').not('.simple').remove();
				for (var i = 0; i < filter.length; i++) {
					$('#search-filter-active ul').append(filter[i]);
				}
				$('#search-filter-active').addClass('show');
			}
			else {
				$('#search-filter-active li').not('.simple').remove();
				if ($('#search-filter-active li').length == 0) {
					$('#search-filter-active').removeClass('show');
				}
			}
			$('#search-list').attr('data-load-params', JSON.stringify(params));	
			if (onComplete) {
				onComplete();
			}
		});
		
		$('.order-by .order').click(function() {
			if ($(this).hasClass('order-selected')) {
				return;
			}
			$('.order-by .order-selected').removeClass('order-selected');
			$(this).addClass('order-selected')
			var orderBy = $(this).attr('data-order-by');
			var orderType = $(this).attr('data-order-type');
			if (orderType == null || orderType == '') {
				orderType = 'asc';
			}
			else {
				orderType = orderType == 'asc' ? 'desc' : 'asc';
			}
			if (!$(this).hasClass('order-single')) {
				$('.order-by .order').attr('data-order-type', '');
				$(this).attr('data-order-type', orderType);	
			}
			var params = {
				'order': orderBy,
				'order_type': orderType
			};
			$('#search-list').attr('data-load-order', JSON.stringify(params));		
			$('#search-list').autoupdate('reload');
		});
		
		$('body').on('checkbox-change', '.panel-wrapper .checkbox:not(.simple-checkbox)', function() {
			$('#search-list').trigger('update-filter');
			$('#search-list').autoupdate('reload');			
		});
		
		$('body').on('click', '#search-filter-active li', function() {
			if ($(this).find('input').length > 0) {
				var name = $(this).find('input').attr('name');
				var value = $(this).find('.checkbox').attr('data-value');
				$(this).remove();
				$('#search-filter input[name=' + name + ']').each(function() {
					if ($(this).val() == value) {
						$(this).closest('li').find('.checkbox').click();
					}
				});
			}
			else {
				$(this).remove();
				$('#search-list').trigger('update-filter');
				$('#search-list').autoupdate('reload');
				$('#search-filter-active').trigger('remove-filter');
			}
			return false;
		});
		
		$('#search-list').trigger('update-filter', [null, function() {
				if (reload_first) {
					$('#search-list').autoupdate('reload');
				}				
			}]);
	}

	$('a.search-for').click(function(e) {
		e.stopPropagation();
		$(document).off('click');
		$cont = $($(this).attr('data-list'));
		if ($cont.hasClass('show')) {
			$cont.removeClass('show');
		}
		else {
			$('.search-for-list').removeClass('show');
			$cont.addClass('show');
			$cont.scrollTop(0);
			$(document).on('click', function() {
				$cont.removeClass('show');
			});
		}
		return false;
	});
	
	$('body').on('click', '.btn-submit', function() {
		$(this).closest('form').submit();
	});	
	$('body').on('click', '.faq-list a', function() {
		$this = $(this);
		var cont = $(this).parent().find('div');
		if ($(this).hasClass('show')) {
			cont.fadeOut(150, function() {
				$(this).parent().find('a').removeClass('show');
			});			
		}
		else {
			$(this).closest('.faq-list').find('.show').click();
			cont.fadeIn(300, function() {
				$(this).parent().find('a').addClass('show');
			});			
		}
	});
	$('.sublist-arrow-live').not('.start-show').each(function() {
		$(this).next().css({display: 'none'});
	});
	$('body').on('click', '.sublist-arrow-live', function() {
		if ($(this).closest('.sublist-box').length > 0) {
			$(this).closest('.sublist-box')
				.find('.sublist-arrow')
				.not($(this))
				.each(function() {
					if ($(this).next().css('display') != 'none') {
						$(this).next().toggle();
					}
				});
		}
		var $this = $(this);
		$(this).next().animate({
			height: 'toggle'
		}, function() {
			if ($(this).css('display') == 'none') {
				$this.removeClass('is-sublist-show');
			}
			else {
				$this.addClass('is-sublist-show');
			}
		});
	});
	
	function impostaClickSublistBox(cont, limit, suffix) {
		var selector = '.sublist-arrow' + (suffix == null ? '' : '-' + suffix);
		if ($(document).width() <= limit) {
			cont.find(selector).next().css({display: 'none'});
			cont.find(selector).off('click');
			cont.find(selector).on('click', function() {
				if ($(this).closest('.sublist-box').length > 0) {
					$(this).closest('.sublist-box')
						.find('.sublist-arrow')
						.not($(this))
						.each(function() {
							if ($(this).next().css('display') != 'none') {
								$(this).next().toggle();
							}
						});
				}
				var $this = $(this);
				$(this).next().animate({
					height: 'toggle'
				}, function() {
					if ($(this).css('display') == 'none') {
						$this.removeClass('is-sublist-show');
					}
					else {
						$this.addClass('is-sublist-show');
					}
				});
			});
		}
		else {
			cont.find(selector).off('click');
			cont.find(selector).next().css({display: 'block'});
		}
	}
	
	function impostaAllClickSublistBox(cont) {
		cont = cont == null ? $('body') : cont;
		impostaClickSublistBox(cont, 600);
		impostaClickSublistBox(cont, Website.max_size_categoria, 'categoria');	
	}
	
	$('body').on('data-loaded', function(e, cont) {
		impostaAllClickSublistBox(cont);
		
		if (typeof window['grecaptcha'] !== 'undefined') {
			var recaptcha = cont.find('.g-recaptcha:not(.g-recaptcha-added)');
			if (recaptcha.length > 0) {
				recaptcha.each(function() {
					var elem = $(this);
					elem.addClass('g-recaptcha-added');
					if (grecaptcha.render) {
						grecaptcha.render(elem.get(0), {
							'sitekey' : elem.data('sitekey'),
						});
					}
				});
			}
		}
	});
	
	impostaAllClickSublistBox();
	$(window).resize(function() {
		impostaAllClickSublistBox();
	});
	
	$('body').on('focus', '.item-input-quantita', function() {
		$(this).select();
	});
	
	$('body').on('click', '#scroll-top', function() {
		$('html, body').animate({scrollTop:0}, 500, 'swing');
	});
	
	var inScroll = false;
	function posizioneScrollTopBtn() {
		if ($(document).scrollTop() > 0) {
			inScroll = true;
			if ($('#scroll-top').length == 0) {
				$('body').append('<a id="scroll-top" title="' + Label['vai_inizio_pagina'] + '"></a>');
			}
		}
		else {
			if (inScroll) {
				inScroll = false;
				$('#scroll-top').remove();
			}
		}
	}
	$(document).on('scroll', posizioneScrollTopBtn);
	posizioneScrollTopBtn();
	
	$('.tab-wrapper').tab();
	
	$('.newsletter-layer .chiudi').on('click', function() {
		$('.newsletter-layer').remove();
	});

	if ($('body').data('cookie-policy') != 'gdpr22') {
		if ($('header').length > 0) {
			var informativa_cookie = Utility.getCookie('informativa_cookie');
			if ((informativa_cookie == null || informativa_cookie == '') && $('.iubenda').length == 0) {
				var html = [
					'<div class="informativa-cookie">',
					Label['descr_utilizzo_cookie'],
					'<a href="/cookie-policy" title="', Label['ulteriori_informazioni'], '" class="informativa-cookie-link">', Label['ulteriori_informazioni'], '</a>',
					'<a href="javascript:void(0)" class="informativa-cookie-ok">', Label['btn_ok'], '</a>',
					'</div>'
				];
				$('body').append(html.join(''));
				$('.informativa-cookie-ok').click(function() {
					$(this).closest('.informativa-cookie').fadeOut(200, function() {
						$(this).remove();
						Utility.setCookie('informativa_cookie', 'ok', 365);
					});
				});
			}		
		}
	}

	if (Params.search_keywords && 
		$('#search form').length &&
		($('#search form').attr('action').indexOf('blog') < 0 ||
		$('#search form').attr('action').indexOf('evento-news') < 0 ||
		$('#search form').attr('action').indexOf('find-all') >= 0)) {
		$('body').on('click', '.search-key-item', function() {
			location.href = $(this).attr('data-url');
		});
		
		var _search_loading = false;
		
		function search_keywords($this) {
			var closest = $this.closest('#search');
			var cont = closest.find('.search-key-item-list-wrapper');
			if (cont.length == 0) {
				closest.append('<div class="search-key-item-list-wrapper"/>');
				$(document).on('mousedown', function(ev){
					if ($(ev.target).closest('.search-key-item-list-wrapper').length == 0) {
						$(document).off('mousedown');						
						$('.search-key-item-list-wrapper').remove();
						_search_loading = false;
						closest.removeClass('loading');
					}
				});
			}
			if (!_search_loading) {
				_search_loading = true;
				
				function start_search() {
					var text = $this.val();
					if (text == '') {
						_search_loading = false;
						$(document).off('mousedown');						
						$('.search-key-item-list-wrapper').remove();
						closest.removeClass('loading');
						return;
					}
					closest.addClass('loading');
					$.xajax('/search-keywords.php', {
						data: {
							text: text,
							_lang: Params.url_lang,
							all: ($('#search form').attr('action').indexOf('find-all') >= 0 ? 1 : 0)
						},
						dataType: 'html',
						success: function(data) {
							$('.search-key-item-list-wrapper').html(data);
							if (text != $this.val()) {
								if (_search_loading) {
									start_search();
								}
							}
							else {
								closest.removeClass('loading');
								_search_loading = false;
							}
						},
						error: function() {
							setTimeout(start_search, 5000);
						}
					});
				}
				
				start_search();
			}
		}
		
		$('body').on('click', '#search input[name=query]', function() {
			if ($(this).val() != '') {
				search_keywords($(this));
			}
		});
		$('body').on('keyup', '#search input[name=query]', function(e) {
			e.preventDefault();
			if (e.which == 13) {
				$(this).closest('form').submit();
			}
			else {
				search_keywords($(this));
			}
		});
	}
	$('body').on('click', 'header #search .btn-search-top', function() {
		var s = $('header #search');
		if (s.hasClass('show')) {
			s.removeClass('show');
			s.find('form').fadeOut(150);
		}
		else {
			s.find('input').val('');
			s.addClass('show');
			s.find('form').fadeIn(300);
		}
	});
	$('body').on('click', '.action-open-url', function() {
		location.href = $(this).data('url');
	});
	
	$('body').on('click', '.oney-popup', function() {
		$('body').removeClass('oney-popup-overlay');
		$('.oney-popup').remove();
	});
	$('body').on('click', '.oney-plugin-info-icon', function() {
		$('body').addClass('oney-popup-overlay');
		$('body').append([
			'<div class="oney-popup">',
				'<img src="/assets/website/img/oney-popup.png">',
				'<div class="oney-popup-close">&#10006;</div>',
			'</div>'
		].join(''))
	});
});