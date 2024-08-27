$(function(){
	var device = $('body').hasClass('touch') ? 2 : 1;
	
	$.xajax('/popup', {
		dataType: 'html',
		data: {
			activity: $('body').attr('data-activity'),
			codice: $('body').attr('data-popup'),
			device: device,
			_lang: Params.url_lang
		},
		success: function(resp) {
			resp = Utility.trim(resp);
			if (resp && resp.substr(0, 1) != '{') {
				var cont = $('<div style="display: none;"/>');
				$('body').append(cont);
				cont.append(resp);
				cont = cont.find('.popup');
				var height = parseInt(cont.attr('data-altezza'));
				var width = parseInt(cont.attr('data-larghezza'));
				if (height > $(window).height() + 30) {
					height = $(window).height() - 30;
				}		
				height += 30;
				if (width > $(window).width()) {
					width = $(window).width();
				}
				var close = $('<div class="popup-close"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg></div>');
				var popup = $('<div class="popup-wrapper"></div>');
				popup.append(close);
				popup.append(cont.find('.popup-html'));
				popup.css({display: 'none', width: width + 'px', height: height + 'px', marginLeft: -(width / 2) + 'px', marginTop: -(height / 2) + 'px'});
				$('body').append(popup);
				$('body').addClass('window-layer-overlay');
				popup.fadeIn();
				$('body').trigger('popup-loaded');
				$('body').trigger('popup-show');
				
				close.on('click', function() {
					popup.fadeOut(function() {
						$('body').removeClass('window-layer-overlay');
						$('body').trigger('popup-close');						
						$(this).remove();
					});
				});
			}
		},
		error: function() {
		}
	});
});