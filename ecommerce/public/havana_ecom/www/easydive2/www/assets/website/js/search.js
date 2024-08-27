$(function(){
	$('.search-menu .inner-tree .tree-icon-plus').each(function() {
		if ($(this).closest('li').find('ul').length == 0) {
			$(this).remove();
		}
	});
	
	$('.search-menu .inner-tree .tree-icon-plus').on('click', function() {
		var li = $(this).closest('li');
		var ul_tree = $(this).parent().next('.ul-tree');
		if (li.hasClass('show-submenu')) {
			$(this).removeClass('show');
			li.removeClass('show-submenu');
			ul_tree.removeClass('open');
		}
		else {
			$(this).addClass('show');
			li.addClass('show-submenu');
			ul_tree.addClass('open');
		}
	});
	var coll_id = $('.search-menu').attr('data-collezione-id');
	if (coll_id != null && coll_id != '') {
		var coll = $('.search-menu li[data-id="' + coll_id + '"]');
		coll.find('> .inner-tree').addClass('selected');
		coll.find('> .inner-tree a').addClass('selected');
		if (coll.attr('data-level') != '1') {
			var li = coll.parents('li');
			li.find('> .inner-tree .tree-icon-plus').addClass('show');
			li.addClass('show-submenu');
		}
		else {
			coll.find('> .inner-tree .tree-icon-plus').addClass('show');
			coll.addClass('show-submenu');			
		}
	}
	
	$('body').on('change', '.action-step-show-button-on-change', function() {
		if ($(this).val() == '') {
			$(this).closest('.step').addClass('hide-button');
		}
		else {
			$(this).closest('.step').removeClass('hide-button');
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
	
	var _listAllFotocameraOption = null;
	$('body').on('click', '.action-step-filtro-fotocamera', function() {
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
		
		if (_listAllFotocameraOption == null) {
			_listAllFotocameraOption = cont.find('[name="id_fotocamera"] option').clone();
		}
		
		cont.find('[name="id_fotocamera"] option').remove();
		cont.find('[name="id_fotocamera"]').append('<option value=""></option>');
		if (listBrandId.length > 0) {
			_listAllFotocameraOption.each(function() {
				var brandId = $(this).data('brand-id');
				if (brandId) {
					var $this = $(this);
					listBrandId.forEach((val) => {
						if ((val + '') == (brandId + '')) {
							cont.find('[name="id_fotocamera"]').append($this.clone());
						}
					});
				}
			});
		}
		else {
			_listAllFotocameraOption.each(function() {
				cont.find('[name="id_fotocamera"]').append($(this).clone());
			});
		}
		cont.find('[name="id_fotocamera"]').val('');
	});
	
	$('body').on('click', '.item-acquista-step .step .next', function() {		
		var step = $(this).closest('.step');

		var data = {};
		var list_callback = $(this).attr('data-callback');
		if (list_callback) {
			list_callback = list_callback.split(',');
			for (var i = 0; i < list_callback.length; i++) {
				var item = null;
				switch (list_callback[i]) {
				case 'param_articolo':
					data.id_articolo = $(this).attr('value');
					$('.layer-menu-wrapper .item-acquista-step').attr('data-codice', $(this).attr('value'));
					break;
				case 'param_fotocamera':
					data.per_articolo = $('.layer-menu-wrapper .item-acquista-step').attr('data-codice');
					data.id_fotocamera = step.find('select').val();
					break;
				case 'combo_value':
					var value = step.find('select').val();
					var opt = step.find('select option[value=' + value + ']');
					item = {
						nome: opt.text(),
						type: step.find('select').attr('data-type')
					};
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
				}	
			}
		}

		var url = $(this).attr('data-url');
		if (url == 'seleziona-predisposizione-bracci-fotocamera' || 
			url == 'seleziona-logo') {
			url = 'co-riepilogo-acquista';
		}
		if (url == '_acquista_') {		
			var attr = [];
			var cont = $('.layer-menu-wrapper .step-header-accessorio-item[data-step=0]');
			attr.push(cont.attr('data-type') + '#interno#' +  cont.find('.step-header-nome strong').text());			
			attr.push('obiettivo#interno#' + $('.layer-menu-wrapper .action-step-seleziona-obiettivo option:selected').text());

			var list_data = [];  
			$('.layer-menu-wrapper .step-header-accessorio-item').each(function() {
				var id = $(this).attr('data-id');
				if (id != null && id != '' && id != 'undefined' && $(this).attr('data-type') != 'select_obiettivo') {
					list_data.push({
							id: id,
							qta: 1,
							attr: attr.join(',')
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
				if (url == 'seleziona-predisposizione-bracci-fotocamera' || 
					url == 'seleziona-logo') {
					url = 'co-riepilogo-acquista';
				}
				var next = function() {
					$('.layer-menu-wrapper .item-acquista-step').loadNextStepAcquista(url);
				};
			}
			else {
				var next = function() {};
			}

			next();
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
	
	if ($('.configura-oblo-auto-click').length > 0) {
		$('.configura-oblo-auto-click a').trigger('click');
	}

	$('.btn-filtri').on('click', function () {
		$('body').addClass('overflow-filter');
		var container_filtri = $(this).parent().parent().siblings('.filtri-container');
		container_filtri.toggleClass('open');
		container_filtri.addClass('transizione');

	});

	$('.close-filter').on('click',function (){
		$('body').removeClass('overflow-filter');
		$(this).parent().parent().removeClass('open');
	});


	$('.btn-reset').on('click', function () {
		let url = "" + location.href;
		url = url.split('?')[0];
		location.href = url;
	});

	var container_filtri = $('.filtri-container');
	$(window).resize(function(){
		var window_w = $(window).width();
		if(window_w > 991){
			console.log(window_w);
			if(container_filtri.hasClass('transizione')){
				container_filtri.removeClass('transizione');
			}
			if(container_filtri.hasClass('open')){
				container_filtri.removeClass('open');
				$('body').removeClass('overflow-filter');
			}
		}
	});

	let search_filter_active = $('#search-filter-active ul');
	function countFilters() {
		var count = search_filter_active.find("li:visible").length;
		let count_string = "("+ count +")";
		$('.btn-filtri span').text(count_string);
	}
	countFilters();

	$('.btn-show').on('click', function () {
		countFilters();
		container_filtri.removeClass('open');
		$('body').removeClass('overflow-filter');
	});

	$(document).mouseup(function(e){
		var container = $(".filtri-container.open");
		if(!container.is(e.target) && container.has(e.target).length === 0){
			container.removeClass('open');
			$('body').removeClass('overflow-filter');
		}
	});

});


(function( $ ){	
	$.fn.loadNextStepAcquista = function (url, data) {
		url = (url == null || url == '') ? $(this).attr('data-url') : url;
		if (url == 'seleziona-luci-flash') {
			url = 'co-riepilogo-acquista'
		}
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