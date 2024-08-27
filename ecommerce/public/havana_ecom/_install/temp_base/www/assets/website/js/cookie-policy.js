$(function(){
	if ($('body').data('cookie-policy') == 'gdpr22') {
		function action_cookie(action) {
			$.xajax('/ex-cookie-policy', 
				{
					data: {
						action: action,
						_lang: Params.url_lang
					},
					success: function() {
						location.href = '' + location.href;
					}
				});
		}
		
		function open_cookie_layer() {
			var cont_layer = $('<div class="cookie-policy-layer"><div class="cookie-policy-layer-inner"><img src="/assets/website/img/loading.gif" class="cookie-policy-layer-loading"></div></div>');
			$('body').append(cont_layer);
			
			var expand_height = $(window).height() > 500 ? 500 : $(window).height();
			if ($(window).width() <= 400) {
				var height = 350;
			}
			else if ($(window).width() <= 800) {
				var height = 250;
			}
			else {
				var height = 220;
			}
			
			cont_layer.css({height: height, bottom: -height}).animate({bottom: 0}, 350);
			cont_layer.find('.cookie-policy-layer-inner').load('/load-cookie-policy-layer', {_lang: Params.url_lang},
				function() {
					cont_layer.find('.cookie-policy-checkbox.denied').on('click', function() {
						alert($(this).find('.cookie-policy-checkbox-alert').text());
					});
					cont_layer.find('.cookie-policy-block-expand').on('click', function() {
						var cont = $(this).closest('.cookie-policy-block-list');
						if (cont.hasClass('expand')) {
							cont.find('.data-expand').removeClass('data-expand');
							cont.removeClass('expand');
						}
						else {
							cont.addClass('expand');
						}
					});
					cont_layer.find('.cookie-policy-block-list-ul-fornitore-expand').on('click', function() {
						var cont = $(this).closest('.cookie-policy-block-list-ul-fornitore');
						if (cont.hasClass('data-expand')) {
							cont.removeClass('data-expand');
						}
						else {
							cont.addClass('data-expand');
						}
					});

					function action_cookie_layer(action) {
						action_cookie(action);
						cont_layer.animate({width: 0, height: 0}, 300, function() {
							$('.cookie-policy-need-update').removeClass('cookie-policy-need-update');
							cont_layer.remove();
						});
					}
					
					function action_allow_selection() {
						if (cont_layer.hasClass('cookie-details-selected')) {
							return;
						}
						cont_layer.addClass('cookie-details-selected');
						cont_layer.find('[data-tab-type].selected').removeClass('selected');
						cont_layer.find('[data-tab-type="details"]').addClass('selected');
					}
					
					cont_layer.find('.cookie-policy-layer-tab-header [data-tab-type]').on('click', function() {
						if ($(this).hasClass('selected')) {
							return;
						}
						if ($(this).data('tab-type') == 'details') {
							cont_layer.animate({height: expand_height}, 250);
						}
						else {
							cont_layer.animate({height: height}, 250);
						}
						cont_layer.find('.cookie-policy-layer-tab-header .selected, .cookie-policy-layer-tab-body [data-tab-type].selected').removeClass('selected');
						$(this).addClass('selected');
						cont_layer.find('.cookie-policy-layer-tab-body [data-tab-type="' + $(this).data('tab-type') + '"]').addClass('selected');
						
						switch($(this).data('tab-type')) {
						case 'details':
							action_allow_selection();
							break;
						default:
							cont_layer.removeClass('cookie-details-selected');
							break;
						}
					});
					cont_layer.find('.cookie-policy-layer-footer [data-action]').on('click', function() {
						switch($(this).data('action')) {
						case 'deny':
							action_cookie_layer('deny');
							break;			
						case 'btn_allow_only_selected':
							var list = [];
							$('.cookie-policy-checkbox:not(.denied) input:checked').each(function() {
								list.push($(this).attr('name'));
							});
							action_cookie_layer(list.join(','));
							break;	
						case 'allow_all':
							action_cookie_layer('allow_all');
							break;
						case 'allow_selection':
							cont_layer.animate({height: expand_height}, 250);
							action_allow_selection();
							break;
						}
					});
					cont_layer.find('.cookie-policy-layer-close').on('click', function() {
						action_cookie_layer('deny');
					});
				}
			);
		}
		
		function open_cookie_layer_status() {
			var cont_status = $('<div class="cookie-policy-status-layer"><img src="/assets/website/img/loading.gif" class="cookie-policy-layer-loading"></div>');
			$('body').append(cont_status);		

			cont_status.load('/load-cookie-policy-status-layer', {_lang: Params.url_lang},
				function() {
					function action_to_icon() {
						cont_status.animate({width: 30, height: 30}, 200, function() {
							cont_status.removeClass('show-status');
						});
					}
					cont_status.find('.cookie-policy-status-layer-icon').on('click', function() {
						cont_status.addClass('show-status');
						cont_status.animate({width: 300, height: 400}, 200);
					});		
					cont_status.find('.cookie-policy-layer-close').on('click', function() {	
						action_to_icon();
					});	

					cont_status.find('.cookie-policy-layer-footer [data-action]').on('click', function() {
						cont_status.remove();
						switch($(this).data('action')) {
						case 'revoke':
							action_cookie('deny');
							break;			
						case 'update':
							$('body').addClass('cookie-policy-need-update');
							open_cookie_layer();
							break;
						}
					});						
				}
			);
		}
					
		if ($('body').hasClass('cookie-policy-need-update')) {
			open_cookie_layer();
		}	
		else {
			open_cookie_layer_status();
		}	
	}
});