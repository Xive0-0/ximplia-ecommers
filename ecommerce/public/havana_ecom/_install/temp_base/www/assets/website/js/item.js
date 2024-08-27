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
	function set_image_thumbs(cont) {
		cont = cont == null ? $('body') : cont;
		var list = cont.find('.item-thumbs .img');
		if (list.length <= 1 && !cont.find('.item-thumbs').hasClass('show')) {
			cont.find('.item-thumbs').css({display: 'none'});
		}
		else {
			cont.find('.item-thumbs .img:first-child').addClass('current');
			list.click(function() {
				if (!$(this).hasClass('current')) {
					cont.find('.item-thumbs .current').removeClass('current');
					$(this).addClass('current');
					var img = $(this).closest('.item-img-coll').find('.item-img img');
					img.attr('src', '/images/' + img.attr('data-dimension') + '/' + $(this).attr('data-src'));
				}
			});
		}
	}
	set_image_thumbs();
		
	$('body').on('click', '.cambia-variante', function() {
		Item.menu_list($(this), function(id) {
			Loading.show();
			$('#content_variante_articolo').load('/item-articolo-variante.php', 
				{
					id: id,
					_lang: Params.url_lang
				},
				function(data) {
					$(this).find('.tab-wrapper').tab();
					set_image_thumbs($(this));
					Loading.hide();
					$(document).scrollTop(0);
				});
		});
	});
	
	$('body').on('click', '.cambia-dynamic-type, .cambia-attributo', function() {
		Item.menu_list($(this));
	});
});